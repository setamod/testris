import test from 'node:test';
import assert from 'node:assert/strict';
import {createPhotoAligner,safePhotoAngle} from '../dist/alignment.mjs';
import {normalizePeople} from '../dist/storage.mjs';
const photo='data:image/jpeg;base64,YQ==';
const valid={faces:1,confidence:.95,eyeDistance:.22,angle:4};
function reply(target,detail){const event=new Event('popzuno:photo-alignment');event.detail=detail;target.dispatchEvent(event);}
test('reliable eye-line correction has a deadzone and stays within eight degrees',()=>{assert.equal(safePhotoAngle(valid),4);assert.equal(safePhotoAngle({...valid,angle:12}),8);assert.equal(safePhotoAngle({...valid,angle:-12}),-8);assert.equal(safePhotoAngle({...valid,angle:1}),0);});
test('ambiguous, distant, extreme and malformed eye lines retain their original angle',()=>{for(const bad of [null,{}, {...valid,faces:2},{...valid,confidence:.69},{...valid,confidence:NaN},{...valid,angle:Infinity},{...valid,angle:15},{...valid,eyeDistance:.1},{...valid,eyeDistance:.8}])assert.equal(safePhotoAngle(bad),0);});
test('native replies are matched to the exact outstanding request',async()=>{const target=new EventTarget(),sent=[],a=createPhotoAligner({target,send:m=>sent.push(m)});const one=a.request(photo),two=a.request(photo);reply(target,{...valid,id:'unknown'});reply(target,{...valid,angle:-6,id:sent[1].id});reply(target,{...valid,id:sent[0].id});assert.deepEqual(await Promise.all([one,two]),[4,-6]);a.destroy();});
test('invalid photos never cross the native bridge',async()=>{let sent=0;const a=createPhotoAligner({send:()=>{sent++;}});for(const bad of ['https://example.org/face.jpg','data:image/png;base64,YQ==',photo+'!','x'.repeat(160001),null])assert.equal(await a.request(bad),0);assert.equal(sent,0);a.destroy();});
test('unavailable, failing and timed-out native services return an unchanged angle',async()=>{for(const send of [()=>false,()=>{throw Error('unavailable');},()=>true]){const a=createPhotoAligner({send,timeoutMs:10});assert.equal(await a.request(photo),0);a.destroy();}});
test('synchronous native replies are supported',async()=>{const target=new EventTarget(),a=createPhotoAligner({target,send:m=>reply(target,{...valid,id:m.id})});assert.equal(await a.request(photo),4);a.destroy();});
test('reset cancels pending requests and late replies cannot restore old alignment',async()=>{const target=new EventTarget(),sent=[],a=createPhotoAligner({target,send:m=>sent.push(m)}),request=a.request(photo);a.clear();reply(target,{...valid,id:sent[0].id});assert.equal(await request,0);a.destroy();});
test('existing photos keep their source and crop; manual angle overrides are bounded',()=>{const original={photo,zoom:1.6,x:.4,y:.7};assert.deepEqual(normalizePeople([original])[0],{name:'',...original,rotation:null});for(const [input,expected]of [[8,8],[99,12],[-99,-12],[NaN,null]])assert.equal(normalizePeople([{...original,rotation:input}])[0].rotation,expected);});
