import test from 'node:test';
import assert from 'node:assert/strict';
import {LANGUAGES,normalizeLanguage} from '../dist/locales.mjs';
import {FLOW_MESSAGES,flowTranslate} from '../dist/i18n.mjs';
import {ARCADE_MESSAGES} from '../dist/arcade-copy.mjs';
import {tideTranslate,powerGuideHTML} from '../dist/arcade.mjs';
const slots=text=>[...text.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
test('six complete catalogs retain the same interpolation fields and localized power guides',()=>{
 assert.deepEqual(Object.keys(LANGUAGES),['tr','en','it','es','de','ru']);
 for(const language of Object.keys(LANGUAGES)){
  assert.equal(normalizeLanguage(language),language);new Intl.NumberFormat(LANGUAGES[language].locale).format(1234567);
  for(const catalog of [FLOW_MESSAGES,ARCADE_MESSAGES]){
   assert.deepEqual(Object.keys(catalog[language]).sort(),Object.keys(catalog.en).sort());
   for(const [key,value]of Object.entries(catalog.en)){assert.ok(catalog[language][key].trim().length>0);assert.deepEqual(slots(catalog[language][key]),slots(value),language+':'+key);}
  }
  assert.ok(!flowTranslate(language,'helpThree').includes('Blitz 60'));assert.ok(flowTranslate(language,'helpThree').includes('Relax'));assert.ok(flowTranslate(language,'helpThree').includes('Ascend'));
  assert.ok(!tideTranslate(language,'cell',{name:'Ada',row:11,col:8}).includes('{'));assert.equal((powerGuideHTML(language).match(/<article\b/g)||[]).length,5);
 }
 assert.equal(normalizeLanguage('invalid'),'tr');assert.equal(normalizeLanguage(null),'tr');
});
