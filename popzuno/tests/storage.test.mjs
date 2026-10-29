import test from 'node:test';
import assert from 'node:assert/strict';
import {readFlow,writeFlow,clearFlow,FLOW_PREFIX,normalizePeople} from '../dist/storage.mjs';
import {FLOW_MESSAGES,flowTranslate} from '../dist/i18n.mjs';

test('family photo/name/crop inputs remain bounded after removing the workshop',()=>{
 const people=normalizePeople([{name:'<script>\u0000',photo:'https://example.com/private.jpg',zoom:99}]);assert.equal(people.length,7);assert.equal(people[0].photo,null);assert.equal(people[0].zoom,3);assert.ok(!people[0].name.includes('\u0000'));
});
test('shell translations cover the same fields in both languages and describe all four modes',()=>{
 assert.deepEqual(Object.keys(FLOW_MESSAGES.tr).sort(),Object.keys(FLOW_MESSAGES.en).sort());for(const language of ['tr','en']){for(const key of Object.keys(FLOW_MESSAGES.tr))assert.notEqual(flowTranslate(language,key),key);assert.ok(flowTranslate(language,'helpThree').includes('Blitz 60'));assert.ok(flowTranslate(language,'helpThree').includes('Ascend'));}
});

test('native preferences work when WebKit localStorage is unavailable',()=>{
 const oldStorage=globalThis.localStorage,oldNative=globalThis.__BULUSKO_STORAGE__,oldWebkit=globalThis.webkit;
 const messages=[];globalThis.localStorage={getItem(){throw Error('unavailable');},setItem(){throw Error('unavailable');}};
 globalThis.__BULUSKO_STORAGE__={[FLOW_PREFIX+'stage']:'3'};
 globalThis.webkit={messageHandlers:{bulusko:{postMessage:message=>messages.push(message)}}};
 try{assert.equal(readFlow('stage',1),3);assert.equal(writeFlow('stage',4),true);assert.equal(readFlow('stage',1),4);assert.deepEqual(messages,[{type:'preference',key:FLOW_PREFIX+'stage',value:'4'}]);assert.equal(readFlow('missing','fallback'),'fallback');}
 finally{globalThis.localStorage=oldStorage;globalThis.__BULUSKO_STORAGE__=oldNative;globalThis.webkit=oldWebkit;}
});
test('the renamed browser game retains prototype saves while leaving Familytris keys alone',()=>{
 const oldStorage=globalThis.localStorage,oldNative=globalThis.__BULUSKO_STORAGE__,oldWebkit=globalThis.webkit;
 const values=new Map([['aile-akisi-v1:stage','2'],['familytris-family','private-original-data']]);globalThis.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};delete globalThis.__BULUSKO_STORAGE__;delete globalThis.webkit;
 try{assert.equal(readFlow('stage',1),2);writeFlow('stage',3);assert.equal(readFlow('stage',1),3);assert.equal(values.get('aile-akisi-v1:stage'),'2');assert.equal(values.get('familytris-family'),'private-original-data');}
 finally{globalThis.localStorage=oldStorage;globalThis.__BULUSKO_STORAGE__=oldNative;globalThis.webkit=oldWebkit;}
});

test('privacy reset removes current and legacy saves without touching other games',()=>{
 const saved=[globalThis.localStorage,globalThis.webkit,globalThis.__BULUSKO_STORAGE__];
 const values=new Map([['bulusko-v1:people','private'],['bulusko-v1:best-shapes1-timeRush','99'],['aile-akisi-v1:people','legacy-private'],['familytris-family','keep'],['unrelated','keep']]);
 globalThis.localStorage={get length(){return values.size;},key:i=>[...values.keys()][i],removeItem:key=>values.delete(key),getItem:key=>values.get(key)??null};delete globalThis.webkit;globalThis.__BULUSKO_STORAGE__={'bulusko-v1:people':'private'};
 try{assert.deepEqual(clearFlow(),{ok:true,managedByNative:false});assert.deepEqual([...values.keys()],['familytris-family','unrelated']);assert.deepEqual(globalThis.__BULUSKO_STORAGE__,{});assert.equal(readFlow('people',null),null);}
 finally{[globalThis.localStorage,globalThis.webkit,globalThis.__BULUSKO_STORAGE__]=saved;}
});
test('native reset still works with unavailable browser storage; failed reset is reported',()=>{
 const saved=[globalThis.localStorage,globalThis.webkit];globalThis.localStorage={get length(){throw Error('blocked');}};const messages=[];
 globalThis.webkit={messageHandlers:{bulusko:{postMessage:value=>messages.push(value)}}};
 try{assert.deepEqual(clearFlow(),{ok:true,managedByNative:true});assert.deepEqual(messages,[{type:'reset'}]);delete globalThis.webkit;assert.deepEqual(clearFlow(),{ok:false,managedByNative:false});}
 finally{[globalThis.localStorage,globalThis.webkit]=saved;}
});
