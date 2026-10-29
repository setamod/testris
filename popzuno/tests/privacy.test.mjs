import test from 'node:test';
import assert from 'node:assert/strict';
import {PRIVACY_COPY,POLICY_DATE,SUPPORT_EMAIL} from '../dist/privacy.mjs';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
test('six privacy catalogs include full sections and deletion confirmation rather than missing-key fallbacks',()=>{
 const keys=Object.keys(PRIVACY_COPY.en).sort();assert.match(POLICY_DATE,/^\d{4}-\d{2}-\d{2}$/);
 for(const [language,copy]of Object.entries(PRIVACY_COPY)){assert.deepEqual(Object.keys(copy).sort(),keys,language);assert.equal(copy.sections.length,6);assert.ok(copy.confirm.length>90,language);assert.ok(copy.sections[0][1].includes(SUPPORT_EMAIL));for(const [heading,text]of copy.sections){assert.ok(heading.length>3);assert.ok(text.length>100);}}
});
test('bundled facefinder exactly matches the recorded MIT-distributed upstream model',async()=>{
 const code=await readFile(new URL('../dist/face.mjs',import.meta.url),'utf8'),data=code.match(/[A-Za-z0-9+/=]{100000,}/)[0];
 const bytes=Buffer.from(data,'base64');assert.equal(bytes.length,239632);assert.equal(createHash('sha256').update(bytes).digest('hex'),'d8014993e7298c7b1865d1f8b855d6dbf4ec5c808bf879e2091ab6837abf90cd');
 const inventory=JSON.parse(await readFile(new URL('../vendor/ASSET-INVENTORY.json',import.meta.url),'utf8'));const model=inventory.components.find(item=>item.component==='embedded facefinder model');assert.equal(model.license,'MIT');assert.equal(model.source_revision,'7d550c78b2c31a4e1dfc5bcdfe9da013297b5cc8');
});
