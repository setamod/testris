export const TIDE_COLS=8;
export const TIDE_ROWS=11;
export const TIDE_SIZE=TIDE_COLS*TIDE_ROWS;
export const CHAIN_MS=3200;
export const FEVER_MS=6000;
export const FEVER_COST=30;
export const NOVA_HOLD_MS=850;
export const DAILY_MS=90000;
export const BLITZ_MS=60000;
export const DEFAULT_GAME_MODE='ascend';
export const GAME_MODES=['ascend','survival','blitz','timeRush','daily','relax'];
export const STAGE_BREAK_MS=3600;
export const STAGE_COUNTDOWN_MS=2400;
export const TIME_START_MS=30000;
export const TIME_CAP_MS=60000;
export const TIME_MOVE_CAP_MS=8000;
export const TUTORIAL_TO=TIDE_SIZE-TIDE_COLS+2;
export const TUTORIAL_FROM=TUTORIAL_TO-TIDE_COLS;
export const REFILL_MS=320;
export const REFILL_STAGGER_MS=12;
export const REFILL_PHASE_MS=REFILL_MS+(TIDE_COLS-1)*REFILL_STAGGER_MS;
export const POWER_CAPS={bomb:2,rocket:2,cross:2,nova:99,shuffle:2};

export function dailyKey(date=new Date()){return date.toISOString().slice(0,10);}
export function dailySeed(day){let value=2166136261;for(const char of 'kynburst-shapes1:'+day){value^=char.charCodeAt(0);value=Math.imul(value,16777619);}return value>>>0;}
export function tideNeighbors(index){
 if(!Number.isInteger(index)||index<0||index>=TIDE_SIZE)return [];
 const col=index%TIDE_COLS,row=Math.floor(index/TIDE_COLS);
 return [col>0?index-1:-1,col<TIDE_COLS-1?index+1:-1,row>0?index-TIDE_COLS:-1,row<TIDE_ROWS-1?index+TIDE_COLS:-1].filter(i=>i>=0);
}
export function swipeTarget(index,dx,dy,threshold=14){
 if(!Number.isFinite(dx)||!Number.isFinite(dy)||Math.max(Math.abs(dx),Math.abs(dy))<threshold)return null;
 const next=index+(Math.abs(dx)>=Math.abs(dy)?(dx<0?-1:1):(dy<0?-TIDE_COLS:TIDE_COLS));
 return tideNeighbors(index).includes(next)?next:null;
}
export function tideGroups(board){
 const runs=[];
 for(let row=0;row<TIDE_ROWS;row++)for(let col=0;col<TIDE_COLS;){
  const first=row*TIDE_COLS+col,value=board[first];let end=col+1;
  while(end<TIDE_COLS&&value!==null&&board[row*TIDE_COLS+end]===value)end++;
  if(Number.isInteger(value)&&value>=0&&end-col>=3)runs.push(Array.from({length:end-col},(_,i)=>first+i));col=end;
 }
 for(let col=0;col<TIDE_COLS;col++)for(let row=0;row<TIDE_ROWS;){
  const first=row*TIDE_COLS+col,value=board[first];let end=row+1;
  while(end<TIDE_ROWS&&value!==null&&board[end*TIDE_COLS+col]===value)end++;
  if(Number.isInteger(value)&&value>=0&&end-row>=3)runs.push(Array.from({length:end-row},(_,i)=>first+i*TIDE_COLS));row=end;
 }
 // A square is a complete match, even without a three-in-a-row.
 for(let row=0;row<TIDE_ROWS-1;row++)for(let col=0;col<TIDE_COLS-1;col++){
  const at=row*TIDE_COLS+col,value=board[at],square=[at,at+1,at+TIDE_COLS,at+TIDE_COLS+1];
  if(Number.isInteger(value)&&value>=0&&square.every(index=>board[index]===value))runs.push(square);
 }
 const groups=[];
 for(const run of runs){let merged=new Set(run);for(let i=groups.length-1;i>=0;i--)if(groups[i].some(at=>merged.has(at))){for(const at of groups[i])merged.add(at);groups.splice(i,1);}groups.push([...merged]);}
 return groups;
}
export function tideGravity(board){
 const output=Array(TIDE_SIZE).fill(null),moves=[];
 for(let col=0;col<TIDE_COLS;col++){
  let to=(TIDE_ROWS-1)*TIDE_COLS+col;
  for(let row=TIDE_ROWS-1;row>=0;row--){const from=row*TIDE_COLS+col;if(board[from]===null)continue;output[to]=board[from];if(to!==from)moves.push({from,to});to-=TIDE_COLS;}
 }
 return {board:output,moves};
}
// Candidate generation and rejected swaps only need to inspect the changed cell.
export function matchesAt(board,index){
 const value=board[index];if(!Number.isInteger(value)||value<0)return false;
 const row=Math.floor(index/TIDE_COLS),col=index%TIDE_COLS;
 let horizontal=1,vertical=1;
 for(let c=col-1;c>=0&&board[row*TIDE_COLS+c]===value;c--)horizontal++;
 for(let c=col+1;c<TIDE_COLS&&board[row*TIDE_COLS+c]===value;c++)horizontal++;
 for(let r=row-1;r>=0&&board[r*TIDE_COLS+col]===value;r--)vertical++;
 for(let r=row+1;r<TIDE_ROWS&&board[r*TIDE_COLS+col]===value;r++)vertical++;
 if(horizontal>=3||vertical>=3)return true;
 for(const r of [row-1,row])for(const c of [col-1,col])if(r>=0&&c>=0&&r<TIDE_ROWS-1&&c<TIDE_COLS-1){const at=r*TIDE_COLS+c;if(board[at]===value&&board[at+1]===value&&board[at+TIDE_COLS]===value&&board[at+TIDE_COLS+1]===value)return true;}
 return false;
}
export function swapMatches(board,from,to){
 if(!tideNeighbors(from).includes(to)||!Number.isInteger(board[from])||board[from]===board[to])return [];
 const trial=[...board];[trial[from],trial[to]]=[trial[to],trial[from]];
 if(!matchesAt(trial,from)&&!matchesAt(trial,to))return [];
 return tideGroups(trial).filter(group=>group.includes(from)||group.includes(to));
}
export function legalSwaps(board){
 const found=[],seen=new Set();
 for(let from=0;from<TIDE_SIZE;from++)if(board[from]!==null)for(const to of tideNeighbors(from)){
  const key=[from,to].sort((a,b)=>a-b).join(':');if(seen.has(key))continue;seen.add(key);
  const groups=swapMatches(board,from,to);if(groups.length)found.push({from,to,size:Math.max(...groups.map(g=>g.length)),power:strongestBonus(groups),groups});
 }
 return found.sort((a,b)=>powerRank(b.power)-powerRank(a.power)||b.size-a.size||a.from-b.from||a.to-b.to);
}
function powerRank(power){return [null,'bomb','shuffle','rocket','cross','nova'].indexOf(power);}
export function bonusForGroup(group){
 const cells=new Set(group),horizontal=[],vertical=[];
 for(const at of cells){
  const col=at%TIDE_COLS,row=Math.floor(at/TIDE_COLS);
  if(col===0||!cells.has(at-1)){const run=[];for(let c=col;c<TIDE_COLS&&cells.has(row*TIDE_COLS+c);c++)run.push(row*TIDE_COLS+c);if(run.length>=3)horizontal.push(run);}
  if(row===0||!cells.has(at-TIDE_COLS)){const run=[];for(let r=row;r<TIDE_ROWS&&cells.has(r*TIDE_COLS+col);r++)run.push(r*TIDE_COLS+col);if(run.length>=3)vertical.push(run);}
 }
 const longest=Math.max(0,...horizontal.concat(vertical).map(run=>run.length));
 if(longest>=5)return 'nova';
 if(horizontal.some(h=>vertical.some(v=>v.some(at=>h.includes(at)))))return 'cross';
 if(horizontal.some(run=>run.length>=4))return 'rocket';
 if(vertical.some(run=>run.length>=4))return 'shuffle';
 if([...cells].some(at=>at%TIDE_COLS<TIDE_COLS-1&&Math.floor(at/TIDE_COLS)<TIDE_ROWS-1&&[at+1,at+TIDE_COLS,at+TIDE_COLS+1].every(next=>cells.has(next))))return 'bomb';
 return null;
}
export function strongestBonus(groups){return groups.map(bonusForGroup).sort((a,b)=>powerRank(b)-powerRank(a))[0]??null;}
export function powerCells(board,power,index){
 if(!Object.hasOwn(POWER_CAPS,power))return [];
 if(power==='shuffle')return [];
 if(power==='nova')return board.flatMap((value,at)=>value===null?[]:[at]);
 if(!Number.isInteger(index)||index<0||index>=TIDE_SIZE||board[index]===null)return [];
 const row=Math.floor(index/TIDE_COLS),col=index%TIDE_COLS;
 return board.flatMap((value,at)=>{
  const r=Math.floor(at/TIDE_COLS),c=at%TIDE_COLS;
  return value!==null&&(power==='bomb'?Math.abs(r-row)<=1&&Math.abs(c-col)<=1:power==='rocket'?r===row:r===row||c===col)?[at]:[];
 });
}
function randomStep(value){let x=value||0x9e3779b9;x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;}
export function timeReward(count,stage=1){return Math.min(7000,Math.max(0,count-1)*1000)*(stage>1?.5:1);}
// Constrained, bounded reshuffle: preserve every occupied slot and face count.
export function shuffleBoard(board,random=Math.random){
 const slots=[],counts=new Map();board.forEach((value,at)=>{if(value!==null){slots.push(at);counts.set(value,(counts.get(value)||0)+1);}});
 if(slots.length<3)return null;
 for(let attempt=0;attempt<32;attempt++){
  const trial=Array(TIDE_SIZE).fill(null),left=new Map(counts);let failed=false;
  for(const at of slots){
   const choices=[];let weight=0;
   for(const [value,count]of left)if(count>0){trial[at]=value;if(!matchesAt(trial,at)){choices.push([value,count]);weight+=count;}trial[at]=null;}
   if(!choices.length){failed=true;break;}
   let pick=random()*weight,chosen=choices[choices.length-1][0];for(const [value,count]of choices){pick-=count;if(pick<0){chosen=value;break;}}
   trial[at]=chosen;left.set(chosen,left.get(chosen)-1);
  }
  if(failed||trial.every((value,at)=>value===board[at])||!legalSwaps(trial).length)continue;
  const sources=new Map();for(const at of slots){const value=board[at];if(!sources.has(value))sources.set(value,[]);sources.get(value).push(at);}
  const moves=slots.map(to=>({from:sources.get(trial[to]).shift(),to}));return {board:trial,moves};
 }
 return null;
}

export class TideGame{
 constructor({seed=Date.now(),mode='survival',day=dailyKey(),onEvent=()=>{}}={}){this.onEvent=onEvent;this.revision=0;this.reset({seed,mode,day});}
 random(){this.rowRng=randomStep(this.rowRng);return this.rowRng/4294967296;}
 reset({seed=this.seed,mode=this.mode,day=this.day}={}){
  this.mode=GAME_MODES.includes(mode)?mode:'survival';this.day=day;this.seed=this.mode==='daily'?dailySeed(day):(Number(seed)>>>0)||0x9e3779b9;this.rowRng=this.seed;this.refillRng=this.seed^0x7f4a7c15;this.shuffleRng=this.seed^0x125f3a19;
  this.status='ready';this.reason=null;this.endDetails=null;this.elapsed=0;this.score=0;this.cleared=0;this.pops=0;this.swaps=0;this.rows=0;this.combo=0;this.bestCombo=0;this.chainLeft=0;this.feverLeft=0;this.energy=0;this.riseProgress=0;this.phase=null;this.powers={bomb:0,rocket:0,cross:0,nova:0,shuffle:this.mode==='timeRush'?1:0};this.timeLeft=TIME_START_MS;this.timeCredit=0;this.timeEarned=0;this.revision++;
  this.wave=1;this.waveStart=0;this.makeOpening();this.nextRow=this.makeRow();
 }
 get familyCount(){return this.mode==='ascend'?Math.min(7,4+Math.floor((this.wave-1)/3)):this.mode==='timeRush'?Math.min(7,4+Math.floor(this.elapsed/60000)):4;}
 get waveTarget(){return Math.min(120,24+(this.wave-1)*8);}
 get waveProgress(){return this.cleared-this.waveStart;}
 makeOpening(){
  this.board=Array(TIDE_SIZE).fill(null);
  // A visible near-match teaches one downward swap, without a free opening pop.
  for(const [at,value]of [[TUTORIAL_TO-2,0],[TUTORIAL_TO-1,0],[TUTORIAL_TO,1],[TUTORIAL_FROM,0]])this.board[at]=value;
  for(let at=TIDE_SIZE-6*TIDE_COLS;at<TIDE_SIZE;at++)if(this.board[at]===null){
   const choices=Array.from({length:this.familyCount},(_,i)=>i).filter(value=>{this.board[at]=value;const allowed=!matchesAt(this.board,at);this.board[at]=null;return allowed;});
   this.board[at]=choices[Math.floor(this.random()*choices.length)]??(at+Math.floor(at/TIDE_COLS))%this.familyCount;
  }
 }
 makeRow(){const row=[];for(let col=0;col<TIDE_COLS;col++){const choices=Array.from({length:this.familyCount},(_,i)=>i).filter(value=>col<2||row[col-1]!==value||row[col-2]!==value);row.push(choices[Math.floor(this.random()*choices.length)]);}return row;}
 get busy(){return this.phase!==null;}
 get levelPeriod(){return this.mode==='timeRush'?30000:25000;}
 get level(){return this.mode==='relax'?1:this.mode==='ascend'?this.wave:1+Math.floor(this.elapsed/this.levelPeriod);}
 get interval(){return Math.max(1350,8500-(this.level-1)*600);}
 get renewing(){return this.mode==='blitz'||this.mode==='timeRush'||this.mode==='relax';}
 get timeRate(){return 1+Math.min(.8,Math.floor(this.elapsed/30000)*.1);}
 get timed(){return this.mode==='daily'||this.mode==='blitz'||this.mode==='timeRush';}
 get duration(){return this.mode==='blitz'?BLITZ_MS:DAILY_MS;}
 get remaining(){return this.mode==='timeRush'?Math.max(0,this.timeLeft):this.timed?Math.max(0,this.duration-this.elapsed):null;}
 get height(){const at=this.board.findIndex(value=>value!==null);return at<0?0:TIDE_ROWS-Math.floor(at/TIDE_COLS);}
 get danger(){return this.height>=TIDE_ROWS-2;}
 get intensity(){if(this.mode==='relax')return .08;return Math.min(1,Math.max(.12,(this.level-1)*.1,this.mode==='blitz'?.35+this.elapsed/BLITZ_MS*.65:0,this.mode!=='blitz'&&this.danger?.95:this.height/TIDE_ROWS*.7,this.combo*.14,this.feverLeft>0?1:0,this.timed&&this.remaining<=15000?1:0));}
 get musicBasePace(){if(this.mode==='relax')return 0;return this.mode==='timeRush'?Math.min(.5,(this.timeRate-1)*.625):this.mode==='blitz'?Math.min(1,this.elapsed/BLITZ_MS):Math.min(1,Math.max(0,(8500-this.interval)/(8500-1350)));}
 get musicPace(){
  if(this.mode==='relax')return 0;
  if(this.phase?.kind==='wave')return this.phase.previousPace;
  const base=this.musicBasePace,clock=this.mode==='timeRush'?Math.max(0,1-this.remaining/TIME_START_MS):this.mode==='daily'?Math.max(0,1-this.remaining/20000):0;
  const stack=this.renewing?0:Math.max(0,Math.min(1,(this.height-6)/5));
  return Math.min(1,Math.max(this.phase?.kind==='power'?.85:0,base+(1-base)*Math.max(clock,stack)*.88));
 }
 get stageCountdown(){return this.phase?.kind!=='wave'?null:this.phase.left>STAGE_COUNTDOWN_MS?0:Math.ceil(this.phase.left/(STAGE_COUNTDOWN_MS/3));}
 hint(){return legalSwaps(this.board)[0]??null;}
 start(options){this.reset(options);this.status='playing';this.onEvent({type:'start'});}
 pause(){if(this.status!=='playing')return false;this.status='paused';return true;}
 resume(){if(this.status!=='paused')return false;this.status='playing';return true;}
 finish(reason,details={}){if(this.status!=='playing')return;if(reason==='time'&&this.timed){if(this.mode==='timeRush')this.timeLeft=0;else this.elapsed=Math.max(this.elapsed,this.duration);}this.status='over';this.reason=reason;this.endDetails=details;this.onEvent({type:'over',reason,details,score:this.score});}
 swap(from,to,revision=this.revision){
  if(this.status!=='playing'||this.busy||revision!==this.revision)return false;
  const groups=swapMatches(this.board,from,to);
  if(!groups.length){this.phase={kind:'reject',left:130};this.onEvent({type:'reject',from,to});return false;}
  [this.board[from],this.board[to]]=[this.board[to],this.board[from]];this.revision++;this.swaps++;
  this.timeCredit=0;
  this.combo=this.mode==='relax'?1:this.chainLeft>0?Math.min(5,this.combo+1):1;this.chainLeft=this.mode==='relax'?0:CHAIN_MS;this.bestCombo=Math.max(this.bestCombo,this.combo);
  this.phase={kind:'swap',left:145,groups,source:'player',stage:1,multiplier:this.combo};this.onEvent({type:'swap',from,to});return true;
 }
 clearMatches(groups,context){
  const cells=[...new Set(groups.flat())],family=this.board[cells[0]],inFever=this.feverLeft>0;
  const points=groups.reduce((sum,group)=>sum+group.length*group.length*10,0)*context.multiplier*context.stage*(inFever?2:1);
  const reward=context.source==='player'&&context.stage===1?strongestBonus(groups):null;
  let granted=false;if(reward&&this.powers[reward]<POWER_CAPS[reward]){this.powers[reward]++;granted=true;}
  const timeAdded=this.mode==='timeRush'&&context.source==='player'?Math.max(0,Math.min(timeReward(cells.length,context.stage),TIME_MOVE_CAP_MS-this.timeCredit,TIME_CAP_MS-this.timeLeft)):0;
  this.timeLeft+=timeAdded;this.timeCredit+=timeAdded;this.timeEarned+=timeAdded;
  for(const at of cells)this.board[at]=null;this.revision++;this.score=Math.min(9e12,this.score+points);this.cleared+=cells.length;this.pops++;
  let feverStarted=false;if(!inFever&&this.mode!=='relax'){this.energy+=cells.length;if(this.energy>=FEVER_COST){this.energy=0;this.feverLeft=FEVER_MS;feverStarted=true;}}
  this.phase={...context,kind:'fall',left:context.stage>=4?95:context.stage>=2?120:150};
   this.onEvent({type:'clear',cells,family,pattern:reward,source:context.source,count:Math.min(4,Math.ceil(cells.length/3)),points,combo:context.multiplier,stage:context.stage,fever:inFever,timeAdded});
  if(reward)this.onEvent({type:'bonus',power:reward,granted,count:this.powers[reward],cells});
  if(feverStarted)this.onEvent({type:'fever'});
 }
 advancePhase(){
  const phase=this.phase;if(!phase)return;
  if(phase.kind==='swap'){this.clearMatches(phase.groups,phase);return;}
  if(phase.kind==='fall'||phase.kind==='power'){
   const gravity=tideGravity(this.board);this.board=gravity.board;this.revision++;this.phase={...phase,kind:'settle',left:phase.stage>=4?110:phase.stage>=2?130:175};this.onEvent({type:'fall',moves:gravity.moves});return;
  }
  if(phase.kind==='settle'){
   const groups=tideGroups(this.board);if(groups.length){this.clearMatches(groups,{...phase,stage:phase.stage+1});return;}
  }
  this.phase=null;
  if(this.mode==='ascend'&&this.waveProgress>=this.waveTarget){this.nextWave();return;}
  if(this.renewing&&phase.kind!=='refill'&&this.refillBlitz())return;
  this.onEvent({type:'settled'});
 }
 refillBlitz(){
  let moves=[];let changed=false,regenerated=false;
  for(let at=TIDE_SIZE-6*TIDE_COLS;at<TIDE_SIZE;at++)if(this.board[at]===null){
   const choices=Array.from({length:this.familyCount},(_,i)=>i).filter(value=>{this.board[at]=value;const valid=!matchesAt(this.board,at);this.board[at]=null;return valid;});
   if(!choices.length){this.makeOpening();changed=true;regenerated=true;break;}
   this.refillRng=randomStep(this.refillRng);this.board[at]=choices[Math.floor(this.refillRng/4294967296*choices.length)];
   moves.push({from:at-6*TIDE_COLS,to:at});changed=true;
  }
  if(!changed)return false;
  if(!legalSwaps(this.board).length){this.makeOpening();regenerated=true;}
  if(regenerated)moves=this.board.flatMap((value,to)=>value===null?[]:[{to}]);
  // New blocks start stacked above the ceiling, in the same column and order.
  const columns=Array.from({length:TIDE_COLS},()=>[]);for(const move of moves)columns[move.to%TIDE_COLS].push(move);
  for(let col=0;col<TIDE_COLS;col++)columns[col].forEach((move,index)=>{move.from=(index-columns[col].length)*TIDE_COLS+col;});
  this.revision++;this.phase={kind:'refill',left:REFILL_PHASE_MS};this.onEvent({type:'refill',moves,regenerated,duration:REFILL_MS,stagger:REFILL_STAGGER_MS});return true;
 }
 nextWave(){
  const previousWave=this.wave,previousPace=this.musicPace,previousInterval=this.interval,previousFamilyCount=this.familyCount;
  this.wave=Math.min(9999,this.wave+1);this.waveStart=this.cleared;this.combo=0;this.chainLeft=0;this.riseProgress=0;
  const reward=this.wave%5===0?'nova':this.wave%3===0?'cross':this.wave%2===0?'bomb':'rocket',granted=this.powers[reward]<POWER_CAPS[reward];this.powers[reward]=Math.min(POWER_CAPS[reward],this.powers[reward]+1);
  this.makeOpening();this.nextRow=this.makeRow();this.revision++;
  this.phase={kind:'wave',left:STAGE_BREAK_MS,previousWave,previousPace,previousInterval,previousFamilyCount,wave:this.wave,power:reward,granted,target:this.waveTarget,nextPace:this.musicPace};
  this.onEvent({type:'wave',...this.phase});
 }
 usePower(power,index){
  if(this.status!=='playing'||this.busy||!Object.hasOwn(POWER_CAPS,power)||!(this.powers[power]>0))return false;
  if(power==='shuffle'){
   const result=shuffleBoard(this.board,()=>{this.shuffleRng=randomStep(this.shuffleRng);return this.shuffleRng/4294967296;});
   if(!result){this.onEvent({type:'shuffle-failed'});return false;}
   this.board=result.board;this.powers.shuffle--;this.revision++;this.phase={kind:'shuffle',left:280,source:'shuffle',stage:0,multiplier:1};this.onEvent({type:'shuffle',moves:result.moves,duration:280});return true;
  }
  const cells=powerCells(this.board,power,index);
  if(!cells.length)return false;
  this.powers[power]--;for(const at of cells)this.board[at]=null;this.revision++;
  const points=cells.length*20;this.score=Math.min(9e12,this.score+points);this.cleared+=cells.length;
  this.phase={kind:power==='nova'?'power':'fall',left:power==='nova'?NOVA_HOLD_MS:power==='cross'?230:160,source:'power',stage:0,multiplier:1};
  this.onEvent({type:'power',power,index,cells,points,count:power==='nova'?4:power==='cross'?3:power==='rocket'?2:1});return true;
 }
 raise(manual=false){
  if(this.status!=='playing'||this.busy||this.renewing)return false;
  if(this.board.slice(0,TIDE_COLS).some(value=>value!==null)){this.finish('overflow',{source:manual?'manual':'automatic',cells:this.board.slice(0,TIDE_COLS).flatMap((value,index)=>value===null?[]:[index])});return false;}
  this.board=[...this.board.slice(TIDE_COLS),...this.nextRow];this.nextRow=this.makeRow();this.rows++;this.revision++;
  if(manual){this.riseProgress=0;this.score=Math.min(9e12,this.score+25);}
  const groups=tideGroups(this.board);if(groups.length)this.phase={kind:'swap',left:120,groups,source:'row',stage:1,multiplier:1};
  this.onEvent({type:'rise',manual,points:manual?25:0});return true;
 }
 tick(milliseconds){
  if(this.status!=='playing'||!Number.isFinite(milliseconds)||milliseconds<=0)return;
  let left=Math.min(milliseconds,3600000);
  while(left>.00001&&this.status==='playing'){
   // Nova's short warp is a reward, not a penalty on the game clock.
   if(this.phase?.kind==='power'){
    const step=Math.min(left,this.phase.left);this.phase.left-=step;left-=step;
    if(this.phase.left<=.000001)this.advancePhase();
    continue;
   }
   // Stage intermissions consume real frame time without consuming play time,
   // Overdrive, chain time or rising progress. Pausing also preserves the countdown.
   if(this.phase?.kind==='wave'){
    const step=Math.min(left,this.phase.left);this.phase.left-=step;left-=step;
    if(this.phase.left<=.000001){this.phase=null;this.onEvent({type:'wave-ready',wave:this.wave});}
    continue;
   }
   const fever=this.feverLeft>0,busy=this.busy,interval=this.interval;
   const rowIn=fever||busy||this.renewing?Infinity:Math.max(.00001,(1-this.riseProgress)*interval);
   const levelIn=this.levelPeriod-this.elapsed%this.levelPeriod;
   const timeRate=this.mode==='timeRush'?this.timeRate:1,timeIn=this.timed?this.remaining/timeRate:Infinity;
   const step=Math.min(left,rowIn,levelIn,this.phase?.left??Infinity,fever?this.feverLeft:Infinity,timeIn);
   if(step<=0){if(this.phase&&this.phase.left<=.000001){this.advancePhase();continue;}this.finish('time');break;}
   this.elapsed+=step;left-=step;
   if(this.mode==='timeRush')this.timeLeft=Math.max(0,this.timeLeft-step*timeRate);
   if(!busy){this.chainLeft=Math.max(0,this.chainLeft-step);if(!this.chainLeft)this.combo=0;}
   if(fever)this.feverLeft=Math.max(0,this.feverLeft-step);else if(!busy&&!this.renewing)this.riseProgress+=step/interval;
   if(this.phase)this.phase.left=Math.max(0,this.phase.left-step);
   if(this.timed&&this.remaining<.00001){this.finish('time');break;}
   if(this.phase&&this.phase.left<=.000001)this.advancePhase();
   if(!this.busy&&this.riseProgress>=1-.00000001){this.riseProgress=Math.max(0,this.riseProgress-1);this.raise();}
  }
 }
}
