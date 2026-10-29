import {createImpactBank} from './impact.mjs';
import {CheerVoice,CHEER_PRIORITY} from './cheers.mjs';
import {VOICE_CLIPS} from './voice-bank.mjs';
export const REWARD_SOUNDS={
 bomb:{pitches:[79,91,86],type:'square',gap:.065,duration:.16},
 rocket:{pitches:[69,76,81,88],type:'sawtooth',gap:.045,duration:.16},
 shuffle:{pitches:[83,76,86,79,91],type:'triangle',gap:.055,duration:.15},
 cross:{pitches:[74,81,86,93],type:'square',gap:.07,duration:.20},
 nova:{pitches:[74,78,81,86,93,98],type:'sine',gap:.06,duration:.33}
};
// Circuit Bloom: a newly programmed melody and accompaniment for this prototype.
// No traditional Tetris theme, commercial recording, sample pack or remote service.
const FLOW_HOOK=[
 [[74,3],[78,1],[81,2],[76,2],[83,4],[81,2],[78,2]],
 [[79,2],[78,2],[74,4],[69,3],[73,1],[76,4]],
 [[78,4],[81,2],[85,2],[83,3],[81,1],[78,4]],
 [[76,3],[73,1],[71,2],[74,2],[69,4],[0,4]],
 [[86,2],[85,2],[81,3],[78,1],[83,4],[81,4]],
 [[79,3],[83,1],[86,2],[83,2],[81,4],[78,4]],
 [[76,2],[78,2],[81,2],[78,2],[74,4],[73,2],[71,2]],
 [[73,3],[76,1],[79,2],[76,2],[74,6],[0,2]]
];
export const FLOW_MELODY=FLOW_HOOK;
export function flowTempo(intensity){return 118+60*Math.max(0,Math.min(1,Number.isFinite(intensity)?intensity:0));}
const frequency=pitch=>440*2**((pitch-69)/12);
export class FlowAudio{
 constructor({enabled=true,music=true,cheers=true,volume=.5,musicVolume=.3,cheerVolume=.4,announcer=new CheerVoice()}={}){this.enabled=enabled;this.music=music;this.cheers=cheers;this.announcer=announcer;this.volume=volume;this.musicVolume=musicVolume;this.cheerVolume=Number.isFinite(cheerVolume)?Math.max(0,Math.min(1,cheerVolume)):.4;this.context=null;this.playing=false;this.voices=new Set();this.step=0;this.clock=null;this.intensity=.12;this.target=.12;this.tempoPace=0;this.impacts=null;this.voiceClips=null;this.clipLoad=null;this.clipsFailed=false;this.pendingCheer=null;this.cheerRequest=0;this.spokenVoice=null;this.spokenPriority=0;}
 unlock(){
  if(!this.enabled||!this.volume)return false;
  try{if(!this.context){
   const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context)return false;this.context=new Context();const c=this.context;
   this.master=c.createGain();this.master.gain.value=this.volume;this.master.connect(c.destination);
   for(const name of ['musicBus','fxBus','voiceBus']){const input=c.createGain(),limiter=c.createDynamicsCompressor();limiter.threshold.value=-13;limiter.knee.value=15;limiter.ratio.value=5;limiter.attack.value=.004;limiter.release.value=.12;input.connect(limiter);limiter.connect(this.master);this[name]=input;}
   this.musicBus.gain.value=this.musicVolume;this.voiceBus.gain.value=this.cheerVolume;
   this.noiseBuffer=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const data=this.noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  }if(!this.impacts)this.impacts=createImpactBank(this.context);if(this.context.state==='suspended')this.context.resume().catch(()=>{});return true;}catch{return false;}
 }
 voice({pitch=69,hz,duration=.15,gain=.1,time,type='triangle',noise=false,cutoff=3500,to,pan=0,music=false,attack=.006,buffer=null,priority=0,speech=false}){
  const c=this.context;if(!c)return;
  const own=[...this.voices].filter(v=>v.music===music&&v.speech===speech);if(own.length>=(speech?1:32)){const victim=own.reduce((a,b)=>b.priority<a.priority?b:a);if(victim.priority>priority)return;try{victim.source.stop();}catch{}victim.clean();}
  const source=buffer||noise?c.createBufferSource():c.createOscillator(),filter=c.createBiquadFilter(),envelope=c.createGain(),stereo=c.createStereoPanner();
  const t=time??c.currentTime+.005;
  if(buffer||noise)source.buffer=buffer||this.noiseBuffer;else{source.type=type;source.frequency.setValueAtTime(hz??frequency(pitch),t);if(to)source.frequency.exponentialRampToValueAtTime(to,t+duration);}
  filter.type=noise?'highpass':'lowpass';filter.frequency.value=cutoff;stereo.pan.value=pan;
  envelope.gain.setValueAtTime(.0001,t);envelope.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+Math.min(attack,duration*.2));if(speech)envelope.gain.setValueAtTime(gain,t+Math.max(.01,duration-.025));envelope.gain.exponentialRampToValueAtTime(.0001,t+duration);
  source.connect(filter);filter.connect(envelope);envelope.connect(stereo);stereo.connect(speech?this.voiceBus:music?this.musicBus:this.fxBus);
  const voice={source,music,priority,speech,clean:()=>{for(const node of [source,filter,envelope,stereo])node.disconnect();this.voices.delete(voice);if(this.spokenVoice===voice)this.spokenVoice=null;}};source.onended=voice.clean;this.voices.add(voice);source.start(t);source.stop(t+duration+.02);return voice;
 }
 effect(kind,strength=1){
  if(!this.unlock())return;const t=this.context.currentTime+.008;
  if(kind==='stage'){
   for(const [i,pitch]of [62,69,74,78,81,86].entries())this.voice({pitch,time:t+i*.085,duration:i===5?.65:.32,gain:.065,type:'triangle',pan:i%2?.3:-.3});
   this.voice({hz:125,to:48,time:t,duration:.42,gain:.12,type:'sine'});this.voice({noise:true,time:t+.3,duration:.35,gain:.025,cutoff:4200});return;
  }
  if(kind==='time-count'){this.voice({pitch:strength<=2?88:81,time:t,duration:.075,gain:.045,type:'sine',priority:1});return;}
  if(kind==='stage-count'){const count=Math.max(1,Math.min(3,strength));this.voice({pitch:80+(3-count)*2,time:t,duration:.09,gain:.055,type:'sine'});return;}
  if(kind==='stage-ready'){
   for(const [i,pitch]of [74,81,86].entries())this.voice({pitch,time:t+i*.035,duration:.25,gain:.065,type:'triangle'});
   this.voice({hz:150,to:45,time:t,duration:.19,gain:.13,type:'sine'});return;
  }
  if(kind.startsWith('earn-')){
   const reward=REWARD_SOUNDS[kind.slice(5)];if(!reward)return;
   reward.pitches.forEach((pitch,i)=>{
    this.voice({pitch,time:t+.09+i*reward.gap,duration:reward.duration,gain:.075,type:reward.type,cutoff:4800,priority:2,pan:i%2?.28:-.28});
    if(i===reward.pitches.length-1)this.voice({pitch:pitch+12,time:t+.09+i*reward.gap,duration:.26,gain:.025,type:'sine',priority:2});
   });return;
  }
  if(kind==='danger'){this.voice({pitch:74,time:t,duration:.14,gain:.055,type:'triangle',priority:1});this.voice({pitch:69,time:t+.18,duration:.2,gain:.05,type:'triangle',priority:1});return;}
  if(kind==='cheer'){this.voice({hz:360,to:1050,time:t,duration:.16,gain:.055,type:'triangle',priority:2});return;}
  if(Object.hasOwn(this.impacts,kind)){
   const buffer=this.impacts[kind];this.voice({buffer,time:t,duration:buffer.duration,gain:.78,cutoff:14500,attack:.001});return;
  }
  if(kind==='shuffle'){for(const [i,pitch]of [69,76,73,81].entries())this.voice({pitch,time:t+i*.045,duration:.14,gain:.065,type:'triangle',pan:i%2?.4:-.4});return;}
  if(kind==='speed'){for(const [i,pitch]of [74,81,86].entries())this.voice({pitch,time:t+i*.06,duration:.16,gain:.065,type:'triangle'});return;}
  if(kind==='rotate'||kind==='select'){this.voice({pitch:kind==='select'?78:83,duration:.075,gain:.07});return;}
  if(kind==='place'){this.voice({hz:220,to:80,duration:.13,gain:.15});this.voice({noise:true,duration:.04,gain:.045,cutoff:2200});return;}
  if(kind==='clear'||kind==='pulse'){
   const n=Math.max(1,Math.min(4,strength));this.voice({hz:190+n*25,to:30,duration:.42+n*.08,gain:.3,type:'sine'});
   this.voice({noise:true,duration:.1+n*.035,gain:.15,cutoff:900});
   for(const [i,pitch]of [74,78,81,86].slice(0,n+1).entries())this.voice({pitch,time:t+.08+i*.06,duration:.3,gain:.1,pan:i%2?.3:-.3});
   return;
  }
  const pitches=kind==='win'?[74,78,81,86]:kind==='over'?[74,71,69,62]:[74,81,86];
  pitches.forEach((pitch,i)=>this.voice({pitch,time:t+i*.09,duration:.25,gain:.1}));
 }
 prepareCheerClips(){
  if(this.voiceClips||this.clipLoad||this.clipsFailed)return this.clipLoad;
  const c=this.context;if(!c?.decodeAudioData){this.clipsFailed=true;return null;}
  this.clipLoad=Promise.all(Object.entries(VOICE_CLIPS).map(async([kind,clip])=>{
   const bytes=Uint8Array.from(atob(clip.data),ch=>ch.charCodeAt(0));return [kind,await c.decodeAudioData(bytes.buffer)];
  })).then(entries=>{this.voiceClips=new Map(entries);const request=this.pendingCheer;this.pendingCheer=null;if(request&&request.id===this.cheerRequest&&Date.now()<request.until&&this.enabled&&this.cheers&&this.volume&&this.cheerVolume)this.playCheerClip(request.kind);}).catch(()=>{this.clipsFailed=true;const request=this.pendingCheer;this.pendingCheer=null;if(request&&request.id===this.cheerRequest&&this.enabled&&this.cheers&&this.volume&&this.cheerVolume)this.announcer.play(request.kind,this.volume*this.cheerVolume);});return this.clipLoad;
 }
 playCheerClip(kind){
  const buffer=this.voiceClips?.get(kind);if(!buffer)return false;const priority=CHEER_PRIORITY[kind];
  if(this.spokenVoice&&(priority<=this.spokenPriority||kind!=='nova'))return false;
  if(this.spokenVoice){try{this.spokenVoice.source.stop();}catch{}this.spokenVoice.clean();}
  this.spokenPriority=priority;this.spokenVoice=this.voice({buffer,speech:true,time:this.context.currentTime+.12,duration:buffer.duration,gain:.95,cutoff:12000,attack:.008,priority});return Boolean(this.spokenVoice);
 }
 stopCheer(){this.cheerRequest++;this.pendingCheer=null;this.announcer.stop();if(this.spokenVoice){try{this.spokenVoice.source.stop();}catch{}this.spokenVoice.clean();}}
 cheer(kind){
  if(!Object.hasOwn(CHEER_PRIORITY,kind)||!this.enabled||!this.cheers||!this.volume||!this.cheerVolume)return false;
  if(!this.unlock())return this.announcer.play(kind,this.volume*this.cheerVolume);
  if(this.voiceClips)return this.playCheerClip(kind);
  if(this.pendingCheer&&CHEER_PRIORITY[this.pendingCheer.kind]>CHEER_PRIORITY[kind])return false;
  if(this.clipsFailed||!this.context.decodeAudioData)return this.announcer.play(kind,this.volume*this.cheerVolume);
  this.pendingCheer={kind,id:++this.cheerRequest,until:Date.now()+3500};this.prepareCheerClips();return true;
 }
 previewCheer(kind){this.stopCheer();return this.cheer(kind);}
 warmCheers(){if(this.enabled&&this.cheers&&this.volume&&this.cheerVolume&&this.unlock())this.prepareCheerClips();}
 setCheerVolume(value){this.cheerVolume=Number.isFinite(value)?Math.max(0,Math.min(1,value)):.4;if(this.voiceBus)this.voiceBus.gain.setTargetAtTime(this.cheerVolume,this.context.currentTime,.03);if(!this.cheerVolume)this.stopCheer();}
 setCheers(value){this.cheers=Boolean(value);if(!value)this.stopCheer();else if(this.playing)this.warmCheers();}
 setPlaying(value){this.playing=value;if(!value)this.stop();else{this.clock=null;this.warmCheers();}}
 setEnabled(value){this.enabled=value;if(!value)this.stop();else if(this.playing)this.clock=null;}
 setMusic(value){this.music=value;for(const voice of [...this.voices])if(voice.music){try{voice.source.stop();}catch{}voice.clean();}this.clock=null;}
 setVolume(value){this.volume=Math.max(0,Math.min(1,value));this.stopCheer();if(this.master)this.master.gain.setTargetAtTime(this.volume,this.context.currentTime,.03);if(!this.volume)this.stop();}
 stop(){this.stopCheer();for(const voice of [...this.voices]){try{voice.source.stop();}catch{}voice.clean();}this.clock=null;}
 update(intensity,elapsedMs=1000/60,pace=intensity){
  this.target=Math.max(0,Math.min(1,Number.isFinite(intensity)?intensity:0));
  const elapsed=Number.isFinite(elapsedMs)?Math.max(0,Math.min(250,elapsedMs)):0;
  this.intensity+=(this.target-this.intensity)*(1-Math.exp(-elapsed/700));
  const tempoTarget=Math.max(0,Math.min(1,Number.isFinite(pace)?pace:0));this.tempoPace+=(tempoTarget-this.tempoPace)*(1-Math.exp(-elapsed/350));
  if(!this.playing||!this.enabled||!this.music||!this.volume||!this.unlock())return;
  const c=this.context,now=c.currentTime,bpm=flowTempo(this.tempoPace),quarter=60/bpm,unit=quarter/4;
  if(this.clock===null||this.clock<now-.3){this.clock=now+.025;if(this.step>512)this.step%=512;}
  let scheduled=0;
  while(this.clock<now+.18&&scheduled++<8){
   const step=this.step%512,bar=Math.floor(step/16),beat=step%16,root=[50,47,55,52][bar%4],peak=this.tempoPace>.6||this.intensity>.65,time=this.clock;
   const play=options=>this.voice({...options,time,music:true});
   if(beat%4===0)play({hz:145,to:42,duration:.18,gain:.15,type:'sine'});
   if(beat===4||beat===12){play({noise:true,duration:.11,gain:.055,cutoff:1200});play({hz:165,to:100,duration:.08,gain:.045});}
   if(beat%2===0||peak)play({noise:true,duration:beat%4===2?.065:.023,gain:beat%2===0?.017:.008,cutoff:6800,pan:beat%4===0?-.2:.2});
   if(beat%2===0)play({pitch:root-12+(beat===14?7:0),duration:quarter*.38,gain:.08,type:'sawtooth',cutoff:800+this.intensity*900});
   if(beat===0)for(const [interval,pan]of [[0,-.45],[7,0],[14,.45]])play({pitch:root+interval,duration:quarter*3.8,gain:.018,type:'sawtooth',cutoff:1300+this.intensity*1200,attack:.05,pan});
   let cursor=0;for(const [pitch,length]of FLOW_HOOK[bar%8]){if(cursor===beat&&pitch){play({pitch:pitch+(bar>=24?12:0),duration:unit*length*.82,gain:.07,type:'square',cutoff:2700+this.intensity*1100,pan:-.15});if(peak)this.voice({pitch,time:time+quarter*.75,duration:unit*length*.5,gain:.017,type:'triangle',music:true,pan:.4});}cursor+=length;}
   if(peak&&beat%4===2)play({pitch:root+12+[0,7,14,7][Math.floor(beat/4)],duration:unit*.7,gain:.035,pan:.3});
   this.clock+=unit;this.step++;
  }
 }
}
