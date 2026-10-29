import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {VOICE_CLIPS} from '../dist/voice-bank.mjs';
import {CHEER_PHRASES} from '../dist/cheers.mjs';
test('all seven fixed calls ship as small lossless clips with verified hashes, duration and non-clipping speech',()=>{
 assert.deepEqual(Object.keys(VOICE_CLIPS).sort(),Object.keys(CHEER_PHRASES).sort());let total=0;
 for(const [kind,clip] of Object.entries(VOICE_CLIPS)){
  const bytes=Buffer.from(clip.data,'base64');assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WAVE');assert.equal(bytes.readUInt32LE(24),24000);assert.equal(bytes.readUInt16LE(22),1);assert.equal(bytes.readUInt16LE(34),16);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),clip.sha256);assert.equal(bytes.length,clip.bytes);const samples=bytes.readUInt32LE(40)/2;assert.ok(Math.abs(samples/24000-clip.duration)<1e-6,kind);
  let peak=0,squared=0;for(let i=44;i<bytes.length;i+=2){const value=bytes.readInt16LE(i)/32768;peak=Math.max(peak,Math.abs(value));squared+=value*value;}assert.ok(peak<.9&&peak>.1,kind);assert.ok(Math.sqrt(squared/samples)>.025,kind);assert.ok(clip.duration>.2&&clip.duration<3.5);total+=bytes.length;
 }assert.ok(total<800000);
});
