import test from 'node:test';
import assert from 'node:assert/strict';
import {TideGame,NOVA_HOLD_MS,TIDE_COLS,TIME_START_MS} from '../dist/arcade-engine.mjs';
import {CelebrationDirector} from '../dist/cheers.mjs';
import {ARCADE_MESSAGES} from '../dist/arcade-copy.mjs';
import {FLOW_MESSAGES} from '../dist/i18n.mjs';

test('a busy speech lane does not burn a major call or its cooldown; a stronger cue replaces the single pending cue',()=>{
 let now=0;const d=new CelebrationDirector({clock:()=>now});
 d.offer({type:'clear',source:'player',pattern:'bomb',cells:[0,1,2,3],stage:1,combo:1});
 const four=d.peek();assert.equal(four.kind,'four');assert.equal(d.lastAt,-Infinity);
 // A rejected playback leaves this same cue available for retry.
 assert.equal(d.peek(),four);d.commit(four);assert.equal(d.pending,null);
 now=200;d.offer({type:'clear',source:'player',pattern:'nova',cells:[0,1,2,3,4],stage:1,combo:1});assert.equal(d.peek(),null);
 now=500;d.offer({type:'clear',source:'player',cells:[0,1,2],stage:4,combo:1});assert.equal(d.pending.kind,'combo4');
 now=1000;const monster=d.peek();assert.equal(monster.kind,'combo4');assert.equal(d.lastKind,'four');
 d.commit(monster);assert.equal(d.lastKind,'combo4');assert.equal(d.pending,null);d.reset();d.offer({type:'bonus',power:'nova',granted:true});assert.equal(d.take().kind,'novaReady');
});

test('unplayed calls expire, pause clears them, and ordinary triples remain silent',()=>{
 let now=0;const d=new CelebrationDirector({clock:()=>now});
 d.offer({type:'bonus',power:'nova',granted:true});now=4100;assert.equal(d.peek(),null);
 d.offer({type:'power',power:'nova'});assert.ok(d.peek());d.clear();assert.equal(d.peek(),null);
 for(let combo=1;combo<=2;combo++){d.offer({type:'clear',source:'player',cells:[0,1,2],stage:1,combo});assert.equal(d.peek(),null);}
});

test('an incoming row arrives whole at its deadline; the board remains stable before that',()=>{
 const g=new TideGame({mode:'ascend',seed:124});g.start();const opening=[...g.board],incoming=[...g.nextRow];
 g.tick(g.interval-1);assert.deepEqual(g.board,opening);assert.equal(g.rows,0);assert.ok(g.riseProgress>.99);
 g.tick(1);assert.equal(g.rows,1);assert.deepEqual(g.board,[...opening.slice(TIDE_COLS),...incoming]);assert.ok(g.riseProgress<.001);
});

test('Nova warp freezes gameplay time and input, preserves pause, and resumes the timed rule afterward',()=>{
 for(const mode of ['timeRush','blitz','daily']){
  const g=new TideGame({mode,seed:32});g.start();g.powers.nova=1;g.feverLeft=2000;g.chainLeft=1500;
  if(mode==='timeRush')g.timeLeft=1;else g.elapsed=g.duration-1;
  assert.ok(g.usePower('nova'));const state=[g.elapsed,g.remaining,g.feverLeft,g.chainLeft,g.riseProgress];
  g.tick(NOVA_HOLD_MS/2);assert.deepEqual([g.elapsed,g.remaining,g.feverLeft,g.chainLeft,g.riseProgress],state);assert.equal(g.status,'playing');
  assert.equal(g.swap(80,81),false);g.pause();const left=g.phase.left;g.tick(2000);assert.equal(g.phase.left,left);g.resume();
  g.tick(NOVA_HOLD_MS/2);assert.equal(g.phase.kind,'settle');assert.equal(g.remaining,1);g.tick(1);assert.equal(g.status,'over');assert.equal(g.reason,'time');
 }
});

test('recovering time or clearing a dangerous stack reduces tempo while later stages retain a higher floor',()=>{
 const clock=new TideGame({mode:'timeRush'});clock.start();clock.timeLeft=2000;const urgent=clock.musicPace;clock.timeLeft=TIME_START_MS;assert.ok(clock.musicPace<urgent-.7);
 const stages=new TideGame({mode:'ascend'});stages.start();stages.wave=5;const base=stages.musicBasePace;stages.board[0]=0;assert.ok(stages.musicPace>base+.4);stages.board.fill(null);assert.equal(stages.musicPace,base);
 stages.wave=6;assert.ok(stages.musicPace>base);
});

test('all languages explain automatic Overdrive, its duration and whole-row arrivals',()=>{
 for(const lang of ['tr','en','it','es','de','ru']){
  for(const key of ['driveTitle','driveHelp','rowGuide'])assert.ok(FLOW_MESSAGES[lang][key]?.length>10);
  for(const key of ['driveActiveShort','rowIn','rowHeld','menuShort'])assert.ok(ARCADE_MESSAGES[lang][key]);
  assert.match(FLOW_MESSAGES[lang].driveHelp,/30/);assert.match(FLOW_MESSAGES[lang].driveHelp,/6/);
 }
});
