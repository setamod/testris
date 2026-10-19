import test from 'node:test';
import assert from 'node:assert/strict';
import {NeonAudio,effectPattern} from '../dist/audio.mjs';

function audioHarness(options={}){
 const sources=[];
 const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(value){this.value=value;},cancelScheduledValues(){}});
 const node=()=>({connect(){},disconnect(){this.disconnected=true;}});
 const source=()=>{const n={...node(),frequency:param(),start(time){this.startTime=time;},stop(time){this.stopTime=time;}};sources.push(n);return n;};
 const context={currentTime:0,sampleRate:8000,state:'suspended',destination:{},resume(){this.state='running';return Promise.resolve();},createGain(){return {...node(),gain:param()};},createDynamicsCompressor(){return {...node(),threshold:param(),knee:param(),ratio:param(),attack:param(),release:param()};},createBuffer(channels,length){return {getChannelData:()=>new Float32Array(length)};},createBufferSource:source,createOscillator:source,createBiquadFilter(){return {...node(),frequency:param()};}};
 let creations=0;
 const audio=new NeonAudio({...options,contextFactory:()=>{creations++;return context;}});
 return {audio,context,sources,creations:()=>creations};
}
test('audio is initialized only after an interaction needs sound',()=>{const h=audioHarness();assert.equal(h.creations(),0);assert.equal(h.audio.play('start'),true);assert.equal(h.creations(),1);assert.equal(h.context.state,'running');h.audio.play('rotate');assert.equal(h.creations(),1);});
test('muting immediately cancels all scheduled notes, including a future level jingle',()=>{const {audio,context,sources}=audioHarness();audio.play('level',{delay:.55});assert.ok(sources.every(s=>s.startTime>.5));audio.setEnabled(false);assert.equal(audio.voices.size,0);assert.ok(sources.every(s=>s.stopTime<=context.currentTime+.011&&s.disconnected));const count=sources.length;assert.equal(audio.play('drop'),false);assert.equal(sources.length,count);});
test('muting before the first interaction does not initialize an audio context',()=>{const h=audioHarness({enabled:false});assert.equal(h.audio.play('start'),false);assert.equal(h.creations(),0);});
test('volume zero is silent and volume values stay within a valid range',()=>{const h=audioHarness({volume:0});assert.equal(h.audio.play('start'),false);assert.equal(h.creations(),0);h.audio.setVolume(5);assert.equal(h.audio.volume,1);h.audio.setVolume(-2);assert.equal(h.audio.volume,0);h.audio.setVolume(NaN);assert.equal(h.audio.volume,.55);});
test('rapid movement is rate limited without blocking other effects',()=>{const {audio,context}=audioHarness();assert.equal(audio.play('move'),true);assert.equal(audio.play('move'),false);assert.equal(audio.play('rotate'),true);context.currentTime=.05;assert.equal(audio.play('move'),true);});
test('hard drop does not double up with a simultaneous locking impact',()=>{const {audio,context}=audioHarness();audio.play('drop');assert.equal(audio.play('lock'),false);context.currentTime=.12;assert.equal(audio.play('lock'),true);});
test('bursts of effects keep at most 28 live voices and disconnect evicted sources',()=>{const {audio,sources}=audioHarness();for(let i=0;i<30;i++)audio.play('clear',{count:4});assert.equal(audio.voices.size,28);assert.ok(sources.slice(0,-28).every(s=>s.disconnected));audio.stopAll();assert.equal(audio.voices.size,0);});
test('ended notes release their graph nodes',()=>{const {audio,sources}=audioHarness();audio.play('rotate');for(const s of sources)s.onended();assert.equal(audio.voices.size,0);assert.ok(sources.every(s=>s.disconnected));});
test('missing audio support disables sound without crashing the game',()=>{let unavailable=0;const audio=new NeonAudio({contextFactory:()=>{throw Error('unsupported');},onUnavailable:()=>unavailable++});assert.equal(audio.play('start'),false);assert.equal(audio.available,false);assert.equal(unavailable,1);assert.equal(audio.play('drop'),false);assert.equal(unavailable,1);});
test('all effects have finite, positive envelopes and a four-line clear has a richer finish',()=>{for(const name of ['move','softDrop','rotate','hold','drop','lock','clear','level','start','pause','resume','over','confirm']){const pattern=effectPattern(name);assert.ok(pattern.length);for(const n of pattern){assert.ok(n.duration>.004&&n.duration<1);assert.ok(n.gain>0&&n.gain<1);assert.ok(Number.isFinite(n.delay)&&n.delay>=0);if(n.type!=='noise')assert.ok(Number.isFinite(n.frequency)&&n.frequency>0&&Number.isFinite(n.to)&&n.to>0);}}assert.ok(effectPattern('clear',{count:4}).length>effectPattern('clear',{count:1}).length);});
