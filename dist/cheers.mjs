// Fixed calls, tied to the actual match/power. No random phrase selection.
export const CHEER_PHRASES={four:'Nice move!',five:'Awesome!',cross:'Excellent!',combo3:'Triple combo!',combo4:'Monster combo!',nova:'Oh yeah!',novaReady:'Nova ready!'};
export const CHEER_PRIORITY={four:10,five:30,cross:35,combo3:50,combo4:60,nova:100,novaReady:70};
export function celebrationCue(event){
 if(event.type==='bonus'||event.type==='wave')return event.power==='nova'&&event.granted?{kind:'novaReady',priority:70}:null;
 if(event.type==='power')return event.power==='nova'?{kind:'nova',priority:100,immediate:true}:null;
 if(event.type!=='clear'||event.source==='row'||event.source==='power')return null;
 const depth=Math.max(event.stage||1,event.combo||1);
 if(depth>=4)return {kind:'combo4',priority:60,comboLevel:4};
 if(depth>=3)return {kind:'combo3',priority:50,comboLevel:3};
 // Secondary/double matches are effects only, even if several triples fall together.
 if((event.stage||1)>1)return null;
 const size=event.cells?.length??0;if(size<4)return null;
 const kind=event.pattern==='nova'?'five':event.pattern==='cross'?'cross':size===4?'four':null;
 return kind?{kind,priority:CHEER_PRIORITY[kind]}:null;
}
export class CelebrationDirector{
 constructor({clock=()=>performance.now()}={}){this.clock=clock;this.pending=null;this.lastAt=-Infinity;this.lastKind=null;this.lastPriority=0;this.lastCombo=0;this.chainSpoken=0;}
 offer(event){
  if(event.type==='clear'&&(event.stage||1)===1&&event.source!=='row'&&event.source!=='power'){
   const combo=event.combo||1;if(combo<=1||combo<this.lastCombo)this.chainSpoken=0;this.lastCombo=combo;
  }
  const now=this.clock();if(this.pending&&now>this.pending.until)this.pending=null;
  const cue=celebrationCue(event);if(!cue||cue.comboLevel&&cue.comboLevel<=this.chainSpoken)return null;
  if(cue.kind==='nova'&&this.lastKind==='nova'&&now-this.lastAt<1100)return null;
  cue.until=now+(cue.kind==='four'?1800:cue.priority>=50?4000:3200);
  if(!this.pending||cue.priority>=this.pending.priority)this.pending=cue;return cue;
 }
 clear(){this.pending=null;}
 reset(){this.clear();this.lastAt=-Infinity;this.lastKind=null;this.lastPriority=0;this.lastCombo=0;this.chainSpoken=0;}
 peek(){
  const cue=this.pending;if(!cue)return null;const now=this.clock(),gap=now-this.lastAt;
  if(now>cue.until){this.pending=null;return null;}
  if(cue.kind==='nova'){if(this.lastKind==='nova'&&gap<1100)return null;}
  else if(cue.kind==='novaReady'){if(gap<1100)return null;}
  else{const interval=cue.kind==='four'?4000:cue.priority>=50?1900:2600,escalating=cue.priority>this.lastPriority&&gap>=900;if(gap<interval&&!escalating)return null;}
  return cue;
 }
 commit(cue){if(!cue)return;if(this.pending===cue)this.pending=null;this.lastAt=this.clock();this.lastKind=cue.kind;this.lastPriority=cue.priority;if(cue.comboLevel)this.chainSpoken=Math.max(this.chainSpoken,cue.comboLevel);}
 take(){const cue=this.peek();if(cue)this.commit(cue);return cue;}
}
export class CheerVoice{
 constructor({sendNative=message=>{const bridge=globalThis.webkit?.messageHandlers?.bulusko;if(!bridge)return false;bridge.postMessage(message);return true;},speech=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance}={}){this.sendNative=sendNative;this.speech=speech;this.Utterance=Utterance;this.activePriority=0;}
 prepare(){try{this.sendNative({type:'prepareCheers'});}catch{}}
 play(kind,volume=.5){
  if(!Object.hasOwn(CHEER_PHRASES,kind)||!Number.isFinite(volume)||volume<=0)return false;
  try{
   if(this.sendNative({type:'cheer',kind,volume:Math.min(1,volume)}))return true;
   if(!this.speech||!this.Utterance)return false;
   const novelty=/fred|trinoids|zarvox|bells|bad news|good news|bubbles|whisper|boing|robot/i;
   const voices=this.speech.getVoices().filter(v=>v.localService&&/^en[-_]US$/i.test(v.lang)&&!novelty.test(v.name||''));
   const voice=voices.find(v=>/aaron|evan|alex/i.test(v.name))??voices[0];if(!voice)return false;
   if(this.speech.speaking&&this.activePriority>CHEER_PRIORITY[kind])return false;
   this.activePriority=CHEER_PRIORITY[kind];this.speech.cancel();const phrase=new this.Utterance(CHEER_PHRASES[kind]);phrase.voice=voice;phrase.lang=voice.lang;phrase.rate=1.04;phrase.pitch=1;phrase.volume=Math.min(1,volume)*.9;this.speech.speak(phrase);return true;
  }catch{return false;}
 }
 stop(){try{if(!this.sendNative({type:'stopCheer'}))this.speech?.cancel();}catch{}}
}
