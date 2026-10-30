import test from 'node:test';
import assert from 'node:assert/strict';
import {CelebrationDirector,CheerVoice,celebrationCue} from '../dist/cheers.mjs';
import {TideGame,TIDE_SIZE} from '../dist/arcade-engine.mjs';
import {endingKeys,tideTranslate} from '../dist/arcade.mjs';

test('plain triples and doubles are effects-only; direct fours/fives and larger combos have fixed calls',()=>{
 const clear=(pattern,size,stage=1,combo=1)=>({type:'clear',source:'player',pattern,cells:Array.from({length:size},(_,i)=>i),stage,combo});
 const table=[[clear(null,3),null],[clear(null,3,2),null],[clear(null,3,1,2),null],[clear('bomb',4),'four'],[clear('rocket',4),'four'],[clear('shuffle',4),'four'],[clear('nova',5),'five'],[clear('cross',5),'cross'],[clear(null,3,3),'combo3'],[clear(null,3,4),'combo4']];
 for(let repeat=0;repeat<4;repeat++)for(const [event,kind]of table)assert.equal(celebrationCue(event)?.kind??null,kind);
 for(const power of ['bomb','rocket','cross','shuffle'])assert.equal(celebrationCue({type:'power',power}),null);
 assert.equal(celebrationCue({...clear(null,3,3),source:'row'}),null);assert.equal(celebrationCue({type:'power',power:'nova'}).kind,'nova');
});
test('calls leave breathing room; a higher combo can escalate after a gap and Nova bypasses ordinary cooldown',()=>{
 let now=0;const d=new CelebrationDirector({clock:()=>now});const four={type:'clear',source:'player',stage:1,combo:1,cells:[0,1,2,3]};
 d.offer(four);assert.equal(d.take().kind,'four');now=2000;d.offer(four);assert.equal(d.take(),null);
 now=2600;d.offer({...four,cells:[0,1,2],combo:3});assert.equal(d.take().kind,'combo3');
 now=2700;d.offer({type:'power',power:'nova'});assert.equal(d.take().kind,'nova');now=2800;d.offer({type:'power',power:'nova'});assert.equal(d.take(),null);
 now=6500;d.offer(four);assert.equal(d.take(),null);now=6800;assert.equal(d.take().kind,'four');
});
test('a sustained chain announces each combo tier once instead of repeating at every match',()=>{
 let now=0;const d=new CelebrationDirector({clock:()=>now});const move=combo=>({type:'clear',source:'player',stage:1,combo,cells:[0,1,2]});
 d.offer(move(1));assert.equal(d.take(),null);d.offer(move(3));assert.equal(d.take().kind,'combo3');now=5000;d.offer(move(3));assert.equal(d.take(),null);
 d.offer(move(4));assert.equal(d.take().kind,'combo4');now=12000;d.offer(move(5));assert.equal(d.take(),null);
 d.offer(move(1));d.offer(move(3));assert.equal(d.take().kind,'combo3');
});
test('Nova acquisition is spoken only when actually granted; it replaces the five-match call and respects spacing',()=>{
 let now=0;const d=new CelebrationDirector({clock:()=>now});
 assert.equal(celebrationCue({type:'bonus',power:'nova',granted:false}),null);
 assert.equal(celebrationCue({type:'bonus',power:'bomb',granted:true}),null);
 assert.equal(celebrationCue({type:'wave',power:'nova',granted:true}).kind,'novaReady');
 d.offer({type:'clear',source:'player',pattern:'nova',cells:[0,1,2,3,4],stage:1,combo:1});
 d.offer({type:'bonus',power:'nova',granted:true});assert.equal(d.take().kind,'novaReady');
 now=1000;d.offer({type:'bonus',power:'nova',granted:true});assert.equal(d.take(),null);
 d.offer({type:'power',power:'nova'});assert.equal(d.take().kind,'nova');
 now=2900;d.offer({type:'bonus',power:'nova',granted:true});assert.equal(d.take().kind,'novaReady');
});
test('offline natural browser voices preempt lower calls, but a four cannot cut off Nova',()=>{
 const spoken=[];const speech={speaking:false,getVoices:()=>[{name:'Network',lang:'en-US',localService:false}],speak:x=>spoken.push(x),cancel:()=>{speech.speaking=false;}};
 const voice=new CheerVoice({sendNative:()=>false,speech,Utterance:class{constructor(text){this.text=text;}}});
 assert.equal(voice.play('four'),false);assert.equal(voice.play('private text'),false);
 speech.getVoices=()=>[{name:'Fred',lang:'en-US',localService:true}];assert.equal(voice.play('four'),false);
 speech.getVoices=()=>[{name:'Aaron',lang:'en-US',localService:true}];assert.equal(voice.play('four'),true);assert.equal(spoken.at(-1).text,'Nice move!');
 speech.speaking=true;assert.equal(voice.play('nova'),true);assert.equal(spoken.at(-1).text,'Oh yeah!');speech.speaking=true;assert.equal(voice.play('four'),false);
});
test('native cheer bridge sends fixed keys only and mute/pause cancel speech',()=>{
 const messages=[];const voice=new CheerVoice({sendNative:message=>{messages.push(message);return true;}});voice.prepare();assert.equal(voice.play('four',0),false);assert.equal(voice.play('four',NaN),false);assert.equal(voice.play('nova',9),true);voice.stop();assert.deepEqual(messages,[{type:'prepareCheers'},{type:'cheer',kind:'nova',volume:1},{type:'stopCheer'}]);
});
test('Ascend loses to an incoming row rather than a hidden time limit, with exact cause and cells',()=>{
 const events=[];const game=new TideGame({mode:'ascend',onEvent:e=>events.push(e)});game.start({mode:'ascend'});
 for(let i=0;i<180;i++){game.board=Array(TIDE_SIZE).fill(null);game.tick(1000);}assert.equal(game.status,'playing');assert.equal(game.timed,false);
 game.board=Array(TIDE_SIZE).fill(null);game.board[3]=0;game.riseProgress=0;game.tick(100);assert.equal(game.status,'playing');
 game.riseProgress=.999;game.tick(20);assert.equal(game.status,'over');assert.equal(game.reason,'overflow');assert.deepEqual(game.endDetails,{source:'automatic',cells:[3]});
 assert.deepEqual(events.at(-1).details,game.endDetails);assert.equal(endingKeys(game).copy,'overflowAuto');assert.equal(endingKeys(game).hint,'ascendNoTime');
});
test('manual-row overflow and clock expiration produce different visible explanations',()=>{
 const game=new TideGame({mode:'ascend'});game.start({mode:'ascend'});game.board=Array(TIDE_SIZE).fill(null);game.board[0]=2;const before=[...game.board];
 game.raise(true);assert.equal(endingKeys(game).copy,'overflowManual');assert.deepEqual(game.board,before);
 game.start({mode:'timeRush'});game.timeLeft=1;game.tick(1);assert.equal(game.reason,'time');assert.equal(endingKeys(game).copy,'clockDrained');assert.equal(game.endDetails.source,undefined);
 for(const lang of ['tr','en','it','es','de','ru'])for(const key of Object.values(endingKeys(game)))assert.notEqual(tideTranslate(lang,key),key);
});
