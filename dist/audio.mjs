const note=(frequency,duration=.1,gain=.14,delay=0,type='triangle',to=frequency)=>({frequency,to,duration,gain,delay,type});
const noise=(duration,gain,delay=0,cutoff=1600)=>({type:'noise',duration,gain,delay,cutoff});

// Short synth gestures share a restrained master bus; no downloads are needed.
export function effectPattern(name,{count=1,delay=0}={}){
 let notes=[];
 switch(name){
  case 'move': notes=[note(260,.035,.065,0,'square',170)];break;
  case 'softDrop': notes=[note(190,.035,.065,0,'triangle',120)];break;
  case 'rotate': notes=[note(440,.065,.13,0,'square',880),note(1320,.04,.055,.025,'sine')];break;
  case 'hold': notes=[note(660,.09,.15,0,'triangle',330),note(990,.075,.11,.07,'sine')];break;
  case 'drop': notes=[note(150,.18,.36,0,'sine',42),note(80,.10,.07,0,'sawtooth',38),noise(.09,.18)];break;
  case 'lock': notes=[note(115,.065,.17,0,'triangle',65),noise(.028,.055,0,2400)];break;
  case 'clear': {
   const lines=Math.max(1,Math.min(4,Math.floor(Number(count)||1)));
   const frequencies=[523.25,659.25,783.99,1046.5,1318.51,1567.98];
   notes=frequencies.slice(0,lines+2).map((f,i)=>note(f,.14,.14,i*.055,i%2?'sine':'triangle'));
   if(lines===4)notes.push(...[1046.5,1318.51,1567.98].map(f=>note(f,.32,.09,.3,'sine')));
   break;
  }
  case 'level': notes=[659.25,783.99,987.77,1318.51].map((f,i)=>note(f,.17,.15,i*.09,'triangle'));notes.push(note(1975.53,.28,.08,.36,'sine'));break;
  case 'start': notes=[261.63,392,523.25,783.99].map((f,i)=>note(f,.13,.14,i*.075,'triangle'));break;
  case 'pause': notes=[note(523.25,.1,.12),note(392,.13,.1,.07)];break;
  case 'resume': notes=[note(392,.1,.12),note(523.25,.13,.1,.07)];break;
  case 'over': notes=[392,329.63,261.63,130.81].map((f,i)=>note(f,.23,.15,i*.13,'triangle',f*.93));notes.push(noise(.2,.045,.4,850));break;
  case 'confirm': notes=[note(659.25,.075,.12),note(987.77,.12,.1,.065)];break;
 }
 const offset=Number.isFinite(delay)?Math.max(0,Math.min(2,delay)):0;
 return notes.map(n=>({...n,delay:n.delay+offset}));
}

export class NeonAudio{
 constructor({enabled=true,volume=.55,contextFactory=()=>new(globalThis.AudioContext||globalThis.webkitAudioContext)(),onUnavailable=()=>{}}={}){
  this.enabled=enabled;this.volume=.55;this.setVolume(volume);this.contextFactory=contextFactory;this.onUnavailable=onUnavailable;this.available=true;this.context=null;this.voices=new Set();this.lastPlayed=new Map();
 }
 unlock(){
  if(!this.enabled||!this.available)return false;
  try{
   if(!this.context){
    const c=this.context=this.contextFactory();
    this.master=c.createGain();this.master.gain.value=this.volume*.55;
    const compressor=c.createDynamicsCompressor();compressor.threshold.value=-15;compressor.knee.value=18;compressor.ratio.value=8;compressor.attack.value=.003;compressor.release.value=.12;
    this.master.connect(compressor);compressor.connect(c.destination);
    this.noiseBuffer=c.createBuffer(1,Math.ceil(c.sampleRate*.5),c.sampleRate);
    const data=this.noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
   }
   if(this.context.state==='suspended')this.context.resume().catch(()=>{});
   return true;
  }catch{this.available=false;this.onUnavailable();return false;}
 }
 setVolume(value){this.volume=Math.max(0,Math.min(1,Number.isFinite(value)?value:.55));if(this.master){const now=this.context.currentTime;this.master.gain.cancelScheduledValues(now);this.master.gain.setTargetAtTime(this.enabled?this.volume*.55:0,now,.015);}}
 setEnabled(value){this.enabled=Boolean(value);if(!this.enabled)this.stopAll();if(this.master)this.setVolume(this.volume);}
 release(voice){if(!this.voices.delete(voice))return;voice.source.disconnect();voice.gain.disconnect();voice.filter?.disconnect();}
 stopVoice(voice){const now=this.context.currentTime;try{voice.gain.gain.cancelScheduledValues(now);voice.gain.gain.setValueAtTime(.0001,now);voice.source.stop(now+.01);}catch{}this.release(voice);}
 stopAll(){if(this.context)for(const voice of [...this.voices])this.stopVoice(voice);this.lastPlayed.clear();}
 play(name,options={}){
  if(!this.enabled||this.volume===0||!this.unlock())return false;
  const c=this.context,now=c.currentTime;
  const cooldown=({move:.045,softDrop:.065})[name]??0;
  if(cooldown&&now-(this.lastPlayed.get(name)??-Infinity)<cooldown)return false;
  if(name==='lock'&&now-(this.lastPlayed.get('drop')??-Infinity)<.11)return false;
  const pattern=effectPattern(name,options);if(!pattern.length)return false;
  this.lastPlayed.set(name,now);
  for(const n of pattern){
   while(this.voices.size>=28)this.stopVoice(this.voices.values().next().value);
   const start=now+.008+n.delay,end=start+n.duration,gain=c.createGain();
   gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(n.gain,start+.004);gain.gain.exponentialRampToValueAtTime(.0001,end);
   let source,filter;
   if(n.type==='noise'){source=c.createBufferSource();source.buffer=this.noiseBuffer;filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=n.cutoff;source.connect(filter);filter.connect(gain);}
   else{source=c.createOscillator();source.type=n.type;source.frequency.setValueAtTime(n.frequency,start);source.frequency.exponentialRampToValueAtTime(n.to,end);source.connect(gain);}
   gain.connect(this.master);const voice={source,gain,filter};this.voices.add(voice);source.onended=()=>this.release(voice);source.start(start);source.stop(end+.012);
  }
  return true;
 }
}
