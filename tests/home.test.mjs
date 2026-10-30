import test from 'node:test';
import assert from 'node:assert/strict';
import {MENU_MODES,menuMode,openingMode,HOME_REVISION,homeRecord} from '../dist/home-mode.mjs';
import {recordKey,modeGuideHTML,powerGuideHTML} from '../dist/arcade.mjs';

test('the five-choice menu redirects retired Blitz without touching its saved score or preferences',()=>{
 const settings={mode:'blitz',homeRevision:HOME_REVISION,volume:.2,language:'ru'},before=JSON.stringify(settings),store={'best-shapes1-blitz':12345};
 assert.equal(MENU_MODES.length,5);assert.ok(!MENU_MODES.includes('blitz'));assert.equal(openingMode(settings),'daily');assert.equal(menuMode('relax'),'relax');assert.equal(JSON.stringify(settings),before);assert.equal(store[recordKey('blitz')],12345);
});
test('home challenges use real competitive records and ignore expired daily or malformed scores',()=>{
 const values={'best-shapes1-ascend':1234,'best-shapes1-survival':800,'best-shapes1-timeRush':NaN,'best-shapes1-relax':999999,'shapes1-daily':{day:'2026-10-30',score:60000}},read=(key,fallback)=>values[key]??fallback;
 assert.deepEqual(homeRecord(read,'2026-10-31'),{mode:'ascend',score:1234});values['shapes1-daily'].day='2026-10-31';assert.deepEqual(homeRecord(read,'2026-10-31'),{mode:'daily',score:60000});assert.equal(homeRecord((key,fallback)=>fallback,'2026-10-31'),null);
});
test('localized help pairs all five real power icons with patterns and concise mode rules',()=>{
 for(const l of ['tr','en','it','es','de','ru']){
  const powers=powerGuideHTML(l),modes=modeGuideHTML(l);assert.equal((powers.match(/class="power-guide-icon"/g)||[]).length,5);assert.equal((modes.match(/class="mode-entry"/g)||[]).length,5);assert.ok(!modes.includes('Blitz 60'));assert.ok(!modes.includes('modeShort'));
 }
});
