import test from 'node:test';
import assert from 'node:assert/strict';
import {TideGame,GAME_MODES,STAGE_BREAK_MS,STAGE_COUNTDOWN_MS,TIDE_SIZE,TUTORIAL_FROM,TUTORIAL_TO} from '../dist/arcade-engine.mjs';
import {openingMode,HOME_REVISION} from '../dist/home-mode.mjs';
import {flowTempo} from '../dist/sound.mjs';

test('Ascend opens first on fresh and legacy installs without mutating stored preferences',()=>{
 assert.equal(GAME_MODES[0],'ascend');
 for(const settings of [null,{}, {mode:'survival'}, {mode:'timeRush',volume:.3,language:'de'}]){
  const before=JSON.stringify(settings);assert.equal(openingMode(settings),'ascend');assert.equal(JSON.stringify(settings),before);
 }
 for(const mode of GAME_MODES)assert.equal(openingMode({mode,homeRevision:HOME_REVISION}),mode);
 assert.equal(openingMode({mode:'invalid',homeRevision:HOME_REVISION}),'ascend');
});

function transition(seed=7){
 const events=[],game=new TideGame({mode:'ascend',seed,onEvent:event=>events.push(event)});game.start();
 game.board.fill(null);game.board[TUTORIAL_TO-2]=0;game.board[TUTORIAL_TO-1]=0;game.board[TUTORIAL_TO]=1;game.board[TUTORIAL_FROM]=0;
 game.cleared=game.waveTarget-3;assert.ok(game.swap(TUTORIAL_FROM,TUTORIAL_TO));
 // Stop at the exact entry to the intermission, regardless of cascade length.
 for(let i=0;i<100&&game.phase?.kind!=='wave';i++)game.tick(game.phase.left);
 assert.equal(game.phase.kind,'wave');return {game,events};
}

test('winning a stage gives one gift and freezes play, pressure, Overdrive and input for the entire intermission',()=>{
 const {game,events}=transition();assert.equal(game.wave,2);assert.equal(game.powers.bomb,1);assert.equal(game.phase.left,STAGE_BREAK_MS);
 game.feverLeft=4100;const before=JSON.stringify([game.board,game.elapsed,game.feverLeft,game.riseProgress,game.score,game.powers]);
 assert.equal(game.swap(TUTORIAL_FROM,TUTORIAL_TO),false);assert.equal(game.usePower('bomb',TIDE_SIZE-1),false);assert.equal(game.raise(true),false);
 game.tick(STAGE_BREAK_MS-1);assert.equal(JSON.stringify([game.board,game.elapsed,game.feverLeft,game.riseProgress,game.score,game.powers]),before);assert.equal(game.stageCountdown,1);
 game.tick(1);assert.equal(game.busy,false);assert.equal(game.stageCountdown,null);assert.equal(events.filter(e=>e.type==='wave').length,1);assert.equal(events.filter(e=>e.type==='wave-ready').length,1);
 game.tick(200);assert.equal(game.feverLeft,3900);assert.equal(game.powers.bomb,1);
});

test('the celebration and 3–2–1 countdown follow game time and survive pause/resume',()=>{
 const {game}=transition();const step=STAGE_COUNTDOWN_MS/3;assert.equal(game.stageCountdown,0);
 game.tick(STAGE_BREAK_MS-STAGE_COUNTDOWN_MS);assert.equal(game.stageCountdown,3);
 game.tick(step);assert.equal(game.stageCountdown,2);game.pause();const snapshot=JSON.stringify([game.phase,game.elapsed,game.board]);
 game.tick(60000);assert.equal(JSON.stringify([game.phase,game.elapsed,game.board]),snapshot);game.resume();
 game.tick(step);assert.equal(game.stageCountdown,1);game.tick(step);assert.equal(game.busy,false);
});

test('a stage previews its faster music and rising but switches actual tempo on the ready cue',()=>{
 const {game,events}=transition();const phase=game.phase,event=events.find(e=>e.type==='wave');
 assert.ok(game.interval<phase.previousInterval);assert.ok(phase.nextPace>phase.previousPace);assert.equal(game.musicPace,phase.previousPace);assert.equal(flowTempo(phase.nextPace),flowTempo(event.nextPace));
 game.tick(STAGE_BREAK_MS);assert.equal(game.musicPace,phase.nextPace);assert.ok(flowTempo(game.musicPace)>118);
 const tempos=[],intervals=[];for(let wave=1;wave<=13;wave++){game.wave=wave;tempos.push(flowTempo(game.musicPace));intervals.push(game.interval);}
 assert.ok(tempos.every((tempo,i)=>i===0||tempo>tempos[i-1]));assert.ok(intervals.every((interval,i)=>i===0||interval<intervals[i-1]));
});

test('a long frame crossing stage-ready matches small frames and does not spend the intermission as play time',()=>{
 const {game:a}=transition(11),{game:b}=transition(11),elapsed=a.elapsed;
 a.tick(STAGE_BREAK_MS+750);for(let left=STAGE_BREAK_MS+750;left>0;left-=Math.min(25,left))b.tick(Math.min(25,left));
 assert.equal(a.elapsed,elapsed+750);assert.equal(a.elapsed,b.elapsed);assert.ok(Math.abs(a.riseProgress-b.riseProgress)<1e-12);assert.deepEqual(a.board,b.board);
});
