import test from 'node:test';
import assert from 'node:assert/strict';
import {FlowAudio,flowTempo,REWARD_SOUNDS} from '../dist/sound.mjs';

function harness(){
 const sources=[];
 const parameter=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(value){this.lastTarget=value;}});
 const node=()=>({connections:[],connect(target){this.connections.push(target);},disconnect(){this.disconnected=true;}});
 const source=()=>{const s={...node(),frequency:parameter(),start(time){this.startTime=time;},stop(time){this.stopTime=time;}};sources.push(s);return s;};
 const context={sampleRate:12000,createBuffer:(count,length,rate)=>{const channels=Array.from({length:count},()=>new Float32Array(length));return {duration:length/rate,getChannelData:i=>channels[i]};},currentTime:0,state:'running',destination:{},createGain:()=>({...node(),gain:parameter()}),createDynamicsCompressor:()=>({...node(),threshold:parameter(),knee:parameter(),ratio:parameter(),attack:parameter(),release:parameter()}),createStereoPanner:()=>({...node(),pan:parameter()}),createBiquadFilter:()=>({...node(),frequency:parameter()}),createBufferSource:source,createOscillator:source};
 const audio=new FlowAudio();audio.context=context;audio.musicBus={gain:parameter()};audio.fxBus={gain:parameter()};audio.voiceBus={gain:parameter()};audio.musicBus.gain.value=.3;audio.voiceBus.gain.value=.4;audio.master={gain:parameter()};audio.noiseBuffer={};return {audio,context,sources};
}
test('effect bursts never evict music or change its sequencer position',()=>{
 const {audio}=harness();audio.setPlaying(true);audio.update(.5);const music=[...audio.voices].filter(v=>v.music),step=audio.step,clock=audio.clock;assert.ok(music.length);
 for(let i=0;i<70;i++)audio.effect('clear',4);
 assert.ok(music.every(v=>audio.voices.has(v)&&!v.source.disconnected));assert.equal([...audio.voices].filter(v=>!v.music).length,32);assert.equal(audio.step,step);assert.equal(audio.clock,clock);
});
test('new reward, Bomb, Rocket, Cross, Nova and stage sounds keep the music pool intact',()=>{
 const {audio}=harness();audio.setPlaying(true);audio.update(.7);const music=[...audio.voices].filter(v=>v.music),step=audio.step;
 for(let i=0;i<12;i++)for(const kind of ['earn-bomb','earn-rocket','earn-cross','earn-nova','bomb','rocket','cross','nova','shuffle','stage','stage-count','stage-ready'])audio.effect(kind);
 assert.ok(music.every(v=>audio.voices.has(v)&&!v.source.disconnected));assert.ok([...audio.voices].filter(v=>!v.music).length<=32);assert.equal(audio.step,step);
});
test('music disable keeps effects alive; pause and global mute stop both pools',()=>{
 const {audio,context}=harness();audio.setPlaying(true);audio.update(.4);audio.effect('place');const effects=[...audio.voices].filter(v=>!v.music);audio.setMusic(false);assert.deepEqual([...audio.voices],effects);audio.setMusic(true);audio.update(.4);context.currentTime+=.2;audio.update(.4);assert.ok([...audio.voices].some(v=>v.music));audio.setPlaying(false);assert.equal(audio.voices.size,0);audio.setPlaying(true);audio.update(.4);audio.setEnabled(false);assert.equal(audio.voices.size,0);const step=audio.step;audio.update(1);assert.equal(audio.step,step);
});
test('two minutes of music and impacts stay bounded and large time gaps cannot schedule a backlog',()=>{
 const {audio,context}=harness();audio.setPlaying(true);
 for(let frame=0;frame<7200;frame++){
  context.currentTime=frame/60;for(const voice of [...audio.voices])if(voice.source.stopTime<=context.currentTime)voice.source.onended();audio.update(frame/7200);if(frame%30===0)audio.effect('clear',frame%4+1);
  assert.ok([...audio.voices].filter(v=>v.music).length<=32);assert.ok([...audio.voices].filter(v=>!v.music).length<=32);
 }
 audio.stop();context.currentTime+=100;audio.update(1);assert.ok(audio.voices.size<=32);assert.ok([...audio.voices].every(v=>v.source.startTime>=context.currentTime));
});
test('tempo grows from 118 to 178 BPM and smoothing is independent of display refresh rate',()=>{
 assert.equal(flowTempo(0),118);assert.equal(flowTempo(1),178);assert.equal(flowTempo(NaN),118);assert.equal(flowTempo(99),178);
 const sixty=harness().audio,oneTwenty=harness().audio;sixty.enabled=false;oneTwenty.enabled=false;
 for(let i=0;i<120;i++)sixty.update(1,1000/60);
 for(let i=0;i<240;i++)oneTwenty.update(1,1000/120);
 assert.ok(Math.abs(sixty.intensity-oneTwenty.intensity)<1e-10);assert.ok(sixty.intensity>.9&&sixty.intensity<1);
});

test('tempo follows explicit game pace while pressure only changes the arrangement',()=>{
 const {audio}=harness();audio.enabled=false;
 for(let i=0;i<120;i++)audio.update(1,1000/60,0);
 assert.equal(flowTempo(audio.tempoPace),118);assert.ok(audio.intensity>.9);
 for(let i=0;i<360;i++)audio.update(.1,1000/60,1);
 assert.ok(flowTempo(audio.tempoPace)>177);assert.ok(audio.intensity<.2);
});

test('all five earned powers have distinct short signatures protected from blast bursts',()=>{
 assert.deepEqual(Object.keys(REWARD_SOUNDS).sort(),['bomb','cross','nova','rocket','shuffle']);
 assert.equal(new Set(Object.values(REWARD_SOUNDS).map(s=>JSON.stringify(s))).size,5);
 for(const sound of Object.values(REWARD_SOUNDS))assert.ok((sound.pitches.length-1)*sound.gap+sound.duration<.8);
 const {audio}=harness();audio.effect('earn-nova');const reward=[...audio.voices];assert.ok(reward.length>=6);
 for(let i=0;i<70;i++)audio.effect('clear',4);
 assert.ok(reward.every(v=>audio.voices.has(v)&&!v.source.disconnected));assert.ok(audio.voices.size<=32);
});
test('voice toggle, master mute, volume change and pause stop speech without stopping music for a cheer',()=>{
 const {audio}=harness();const calls=[];audio.announcer={prepare:()=>calls.push('prepare'),play:(kind,volume)=>{calls.push([kind,volume]);return true;},stop:()=>calls.push('stop')};
 audio.setPlaying(true);audio.update(.5);const music=[...audio.voices].filter(v=>v.music),step=audio.step;
 assert.equal(audio.cheer('five'),true);assert.ok(music.every(v=>audio.voices.has(v)));assert.equal(audio.step,step);
 audio.setCheers(false);assert.equal(audio.cheer('four'),false);audio.setCheers(true);audio.setVolume(0);assert.equal(audio.cheer('four'),false);
 audio.setVolume(.5);audio.setEnabled(false);assert.equal(audio.cheer('four'),false);audio.setEnabled(true);audio.setPlaying(false);assert.equal(calls.at(-1),'stop');
});

test('Nova always takes the separate speech lane and music/blast bursts cannot evict it',()=>{
 const {audio}=harness();audio.voiceClips=new Map(['four','five','nova'].map(k=>[k,{duration:1}]));audio.setPlaying(true);audio.update(.5);const music=[...audio.voices].filter(v=>v.music);
 assert.equal(audio.cheer('four'),true);const first=audio.spokenVoice;assert.equal(audio.cheer('nova'),true);const nova=audio.spokenVoice;assert.notEqual(nova,first);assert.ok(!audio.voices.has(first));assert.equal(audio.cheer('four'),false);
 for(let i=0;i<80;i++)audio.effect('clear',4);assert.ok(audio.voices.has(nova));assert.ok(music.every(v=>audio.voices.has(v)));assert.equal([...audio.voices].filter(v=>v.speech).length,1);
 assert.equal(audio.previewCheer('four'),true);assert.notEqual(audio.spokenVoice,nova);audio.setCheers(false);assert.ok(!audio.voices.has(nova));assert.ok(music.every(v=>audio.voices.has(v)));
});
test('a clip decode completing after pause cannot play a stale cheer',async()=>{
 const {audio,context}=harness(),decoding=[];context.decodeAudioData=()=>new Promise(resolve=>decoding.push(resolve));audio.setPlaying(true);audio.cheer('nova');assert.equal(decoding.length,7);audio.setPlaying(false);
 for(const resolve of decoding)resolve({duration:1});await audio.clipLoad;assert.equal(audio.voiceClips.size,7);assert.equal(audio.spokenVoice,null);assert.equal(audio.voices.size,0);
 assert.equal(audio.cheer('nova'),true);audio.setVolume(.2);assert.equal(audio.spokenVoice,null);
});

test('announcer defaults lower in its own bus and its volume control never ducks music or effects',()=>{
 const {audio}=harness();assert.equal(audio.cheerVolume,.4);audio.voiceClips=new Map([['nova',{duration:1}]]);audio.setPlaying(true);audio.update(.5);audio.cheer('nova');const music=[...audio.voices].filter(v=>v.music);audio.effect('bomb');const impact=[...audio.voices].find(v=>!v.music&&!v.speech);
 audio.setCheerVolume(.2);assert.equal(audio.voiceBus.gain.lastTarget,.2);assert.equal(audio.musicBus.gain.lastTarget,undefined);assert.equal(audio.fxBus.gain.lastTarget,undefined);assert.ok(music.every(v=>audio.voices.has(v)));
 audio.setCheerVolume(0);assert.equal(audio.spokenVoice,null);assert.ok(audio.voices.has(impact));assert.ok(music.every(v=>audio.voices.has(v)));assert.equal(audio.cheer('nova'),false);
});

test('Relax scopes calm music/effects and suppresses gameplay speech without changing saved preferences',()=>{
 const {audio}=harness();audio.voiceClips=new Map([['nova',{duration:1}]]);audio.setPlaying(true);audio.update(.9);const old=[...audio.voices];
 audio.setMode('relax');assert.ok(old.every(v=>!audio.voices.has(v)));assert.equal(audio.musicBus.gain.lastTarget,.24);assert.equal(audio.fxBus.gain.lastTarget,.65);
 assert.equal(audio.cheer('nova'),false);assert.equal(audio.previewCheer('nova'),true);audio.stopCheer();
 const voices=[];const original=audio.voice.bind(audio);audio.voice=options=>{voices.push(options);return original(options);};audio.effect('nova');assert.ok(voices.length);assert.ok(voices.every(v=>!v.buffer&&!v.noise&&v.type==='sine'&&v.gain<=.055));
 audio.update(1);assert.ok([...audio.voices].some(v=>v.music));assert.ok(voices.filter(v=>v.music).every(v=>!v.noise&&['sine','triangle'].includes(v.type)));
 assert.equal(audio.musicVolume,.3);assert.equal(audio.cheerVolume,.4);assert.equal(audio.cheers,true);assert.equal(audio.enabled,true);
 audio.setMode('ascend');assert.equal(audio.musicBus.gain.lastTarget,.3);assert.equal(audio.fxBus.gain.lastTarget,1);assert.equal(audio.cheer('nova'),true);audio.stopCheer();voices.length=0;audio.effect('bomb');assert.ok(voices.some(v=>v.buffer));
});
test('Relax scheduler remains bounded over a long session and does not accumulate a background backlog',()=>{
 const {audio,context}=harness();audio.setMode('relax');audio.setPlaying(true);
 for(let frame=0;frame<7200;frame++){
  context.currentTime=frame/60;for(const v of [...audio.voices])if(v.source.stopTime<=context.currentTime)v.source.onended();audio.update(1);
  if(frame%30===0)audio.effect('clear',4);assert.ok([...audio.voices].filter(v=>v.music).length<=18);assert.ok(audio.voices.size<=32);
 }
 audio.stop();context.currentTime+=100;audio.update(1);assert.ok([...audio.voices].every(v=>v.source.startTime>=context.currentTime));
});

test('interrupted and closed graphs recover on resume while keeping sound preferences and decoded clips',()=>{
 const saved=globalThis.AudioContext;
 try{
  for(const state of ['interrupted','closed']){
   const {audio,context}=harness();audio.voiceClips=new Map([['nova',{duration:1}]]);audio.setPlaying(true);audio.update(.5);const clips=audio.voiceClips,impacts=audio.impacts,old=[...audio.voices];let closed=0,created=0;
   context.state=state;context.close=()=>{closed++;return Promise.resolve();};globalThis.AudioContext=function(){created++;return harness().context;};
   audio.setPlaying(false);audio.interrupt();audio.foreground();assert.equal(created,0);assert.equal(audio.voices.size,0);audio.setPlaying(true);audio.update(.5);
   assert.notEqual(audio.context,context);assert.equal(closed,1);assert.equal(created,1);assert.ok(old.every(v=>!audio.voices.has(v)));assert.equal(audio.voiceClips,clips);assert.equal(audio.impacts,impacts);assert.equal(audio.volume,.5);assert.equal(audio.musicVolume,.3);assert.equal(audio.cheerVolume,.4);assert.equal(audio.cheer('nova'),true);assert.ok([...audio.voices].some(v=>v.music));
   for(let i=0;i<20;i++){audio.foreground();audio.update(.5);}assert.equal(created,1);audio.stop();
  }
 }finally{globalThis.AudioContext=saved;}
});
test('a running but frozen graph is replaced after backgrounding, including quiet Relax, while mute stays muted',()=>{
 const saved=globalThis.AudioContext;try{
  const {audio,context}=harness();audio.setMode('relax');audio.setPlaying(true);audio.update(.1);let created=0;globalThis.AudioContext=function(){created++;return harness().context;};context.close=()=>Promise.resolve();
  audio.setPlaying(false);audio.interrupt();audio.setEnabled(false);audio.foreground();assert.equal(audio.unlock(),false);assert.equal(created,0);assert.equal(audio.music,true);assert.equal(audio.mode,'relax');
  audio.setEnabled(true);audio.setPlaying(true);audio.update(.1);assert.equal(created,1);assert.equal(audio.mode,'relax');assert.equal(audio.musicBus.gain.value,.24);assert.equal(audio.fxBus.gain.value,.65);assert.equal(audio.cheers,true);assert.equal(audio.cheer('nova'),false);assert.ok([...audio.voices].some(v=>v.music));
 }finally{globalThis.AudioContext=saved;}
});
test('old-context decode failures cannot poison the recovered voice cache or replay an interrupted announcement',async()=>{
 const saved=globalThis.AudioContext;try{
  const {audio,context}=harness();let rejectOld;context.decodeAudioData=()=>new Promise((resolve,reject)=>{rejectOld=reject;});context.close=()=>Promise.resolve();audio.cheer('nova');const oldLoad=audio.clipLoad;
  globalThis.AudioContext=function(){const c=harness().context;c.decodeAudioData=async()=>({duration:1});return c;};audio.interrupt();audio.setPlaying(true);const newLoad=audio.clipLoad;assert.notEqual(newLoad,oldLoad);rejectOld(Error('interrupted decode'));await oldLoad;await newLoad;assert.equal(audio.clipsFailed,false);assert.equal(audio.voiceClips.size,7);assert.equal(audio.spokenVoice,null);assert.equal(audio.cheer('four'),true);
 }finally{globalThis.AudioContext=saved;}
});
