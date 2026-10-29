import test from 'node:test';
import assert from 'node:assert/strict';
import {TideGame,TIDE_SIZE} from '../dist/arcade-engine.mjs';
import {MODE_RULES,runPressure,reminderPower} from '../dist/run-ui.mjs';
import {tideTranslate,endingKeys} from '../dist/arcade.mjs';
test('every mode explains its goal, pressure and ending in all six languages',()=>{
 for(const mode of Object.keys(MODE_RULES))for(const lang of ['tr','en','it','es','de','ru'])for(const key of Object.values(MODE_RULES[mode]))assert.notEqual(tideTranslate(lang,key),key);
 const g=new TideGame();for(const [mode,title]of [['blitz','complete60'],['daily','complete90'],['timeRush','timeRushOver']]){g.start({mode});g.finish('time');assert.equal(endingKeys(g).title,title);}
});
test('all timed modes become amber then urgent; pause and an earned time recovery end the pulse',()=>{
 const g=new TideGame();for(const mode of ['blitz','daily','timeRush']){g.start({mode});if(mode==='timeRush')g.timeLeft=14000;else g.elapsed=g.duration-14000;assert.equal(runPressure(g).timeRisk,'warning');if(mode==='timeRush')g.timeLeft=4000;else g.elapsed=g.duration-4000;assert.equal(runPressure(g).seconds,4);assert.equal(runPressure(g).timeRisk,'critical');g.pause();assert.equal(runPressure(g).timeRisk,'none');g.resume();if(mode==='timeRush'){g.timeLeft=20000;assert.equal(runPressure(g).timeRisk,'normal');}}
});
test('overflow warning follows actual top occupancy; renewing modes never show an overflow warning',()=>{
 const g=new TideGame();g.start({mode:'ascend'});g.board=Array(TIDE_SIZE).fill(null);g.board[16]=0;assert.equal(runPressure(g).overflowRisk,'warning');g.board[0]=0;assert.equal(runPressure(g).overflowRisk,'critical');g.feverLeft=5000;assert.equal(runPressure(g).overflowRisk,'critical');g.pause();assert.equal(runPressure(g).overflowRisk,'none');g.start({mode:'blitz'});g.board[0]=0;assert.equal(runPressure(g).overflowRisk,'none');
});
test('bonus reminder is bounded by inactivity, an eight-second gap and usable inventory',()=>{
 const g=new TideGame();g.start({mode:'ascend'});g.elapsed=9000;g.powers.nova=1;assert.equal(reminderPower(g,0,0),'nova');assert.equal(reminderPower(g,7000,0),null);assert.equal(reminderPower(g,0,8000),null);g.pause();assert.equal(reminderPower(g,0,0),null);g.resume();g.board=Array(TIDE_SIZE).fill(null);assert.equal(reminderPower(g,0,0),null);
});

test('timed endings snap sub-microsecond remainder to zero rather than showing a final second',()=>{
 const g=new TideGame();for(const mode of ['blitz','daily','timeRush']){g.start({mode});if(mode==='timeRush')g.timeLeft=.000001;else g.elapsed=g.duration-.000001;g.tick(.1);assert.equal(g.status,'over');assert.equal(g.remaining,0);assert.equal(runPressure(g).seconds,0);}
});
