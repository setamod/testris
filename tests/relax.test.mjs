import test from 'node:test';
import assert from 'node:assert/strict';
import {TideGame,TUTORIAL_FROM,TUTORIAL_TO,TIDE_SIZE,legalSwaps,tideGroups} from '../dist/arcade-engine.mjs';
import {runPressure,reminderPower} from '../dist/run-ui.mjs';
import {recordKey} from '../dist/arcade.mjs';

test('Relax never advances pressure, rises or times out even after two idle hours',()=>{
 const g=new TideGame({mode:'relax',seed:42});g.start();const board=[...g.board];
 for(let i=0;i<120;i++)g.tick(60000);
 assert.equal(g.status,'playing');assert.deepEqual(g.board,board);assert.equal(g.rows,0);assert.equal(g.riseProgress,0);assert.equal(g.level,1);assert.equal(g.familyCount,4);assert.equal(g.remaining,null);assert.equal(g.timed,false);assert.equal(g.renewing,true);assert.equal(g.raise(true),false);assert.equal(g.musicPace,0);
 assert.equal(runPressure(g).timeRisk,'none');assert.equal(runPressure(g).overflowRisk,'none');g.powers.nova=1;assert.equal(reminderPower(g,0,0),null);
 assert.notEqual(recordKey('relax'),recordKey('survival'));
});
test('Relax refills after valid moves and powers without introducing a forced hurry',()=>{
 const g=new TideGame({mode:'relax',seed:42});g.start();assert.ok(g.swap(TUTORIAL_FROM,TUTORIAL_TO));g.tick(3000);
 for(let move=0;move<50;move++){
  assert.equal(g.status,'playing');assert.equal(g.busy,false);assert.equal(g.board.filter(x=>x!==null).length,48);assert.equal(tideGroups(g.board).length,0);
  const pair=legalSwaps(g.board)[0];assert.ok(pair);assert.ok(g.swap(pair.from,pair.to));g.tick(3000);
  assert.equal(g.feverLeft,0);assert.equal(g.energy,0);assert.ok(g.bestCombo<=1);
 }
 g.powers.nova=2;assert.ok(g.usePower('nova'));assert.equal(g.powers.nova,1);assert.equal(g.board.filter(x=>x!==null).length,0);g.tick(3000);assert.equal(g.board.length,TIDE_SIZE);assert.equal(g.board.filter(x=>x!==null).length,48);assert.ok(legalSwaps(g.board).length);
 g.pause();const before=[g.elapsed,g.score,...g.board];g.tick(10000);assert.deepEqual([g.elapsed,g.score,...g.board],before);g.resume();assert.equal(g.status,'playing');
});
