import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {TideGame,TIDE_COLS as C,TIDE_ROWS as R,TIDE_SIZE as N,CHAIN_MS,FEVER_MS,DAILY_MS,BLITZ_MS,GAME_MODES,TUTORIAL_FROM,TUTORIAL_TO,dailyKey,dailySeed,tideNeighbors,swipeTarget,tideGroups,tideGravity,swapMatches,legalSwaps,bonusForGroup,strongestBonus,powerCells,matchesAt,POWER_CAPS,shuffleBoard,timeReward,TIME_START_MS,TIME_CAP_MS} from '../dist/arcade-engine.mjs';
import {tideTranslate,recordKey} from '../dist/arcade.mjs';
const empty=()=>Array(N).fill(null),base=N-C;
function fixture(game,shape){
 game.board=empty();
 if(shape==='square'){const at=6*C+3;for(const i of [at-C-1,at-C,at-1,at+1])game.board[i]=0;game.board[at]=1;return [at+1,at];}
 if(shape==='cross'){const at=6*C+3;for(const i of [at-2,at-1,at+C,at+2*C,at-C])game.board[i]=0;game.board[at]=1;return [at-C,at];}
 for(let col=0;col<shape;col++)game.board[base+col]=0;game.board[TUTORIAL_TO]=1;game.board[TUTORIAL_FROM]=0;return [TUTORIAL_FROM,TUTORIAL_TO];
}
function complete(game,ms=1800){game.tick(ms);if(game.phase?.kind==='wave')game.tick(game.phase.left);assert.equal(game.busy,false);}

test('88 cells detect lines, 2×2 squares and intersecting triples, with no edge wrapping',()=>{
 assert.equal(C,8);assert.equal(R,11);assert.equal(N,88);const board=empty();for(const at of [C-1,C,2*C])board[at]=0;assert.equal(tideGroups(board).length,0);
 board.fill(null);const center=4*C+2;for(const at of [center-1,center,center+1,center-C,center+C])board[at]=0;assert.equal(tideGroups(board)[0].length,5);assert.deepEqual(tideNeighbors(C-1),[C-2,2*C-1]);
});
test('four-way swipes take one neighbour, reject jitter, and never wrap at the new edges',()=>{
 const at=4*C+2;assert.equal(swipeTarget(at,20,2),at+1);assert.equal(swipeTarget(at,-20,2),at-1);assert.equal(swipeTarget(at,1,20),at+C);assert.equal(swipeTarget(at,0,-50),at-C);
 for(const [from,dx,dy]of [[C-1,200,0],[C,-200,0],[0,0,-50],[N-1,0,50],[at,5,4],[at,NaN,0]])assert.equal(swipeTarget(from,dx,dy),null);
});
test('gravity preserves column order and face counts on 8 × 11',()=>{
 const board=empty();board[0]=2;board[3*C]=0;board[4*C+1]=3;board[base+1]=1;const result=tideGravity(board);assert.equal(result.board[base-C],2);assert.equal(result.board[base],0);assert.equal(result.board[base+1-C],3);assert.equal(result.board[base+1],1);assert.equal(result.board.filter(v=>v!==null).length,4);
});
test('500 varied openings have 48 faces, no free match, and a legal tutorial with nonmutating hints',()=>{
 for(let seed=1;seed<=500;seed++){const game=new TideGame({seed});assert.equal(game.height,6);assert.equal(game.board.filter(v=>v!==null).length,48);assert.equal(tideGroups(game.board).length,0);assert.ok(swapMatches(game.board,TUTORIAL_FROM,TUTORIAL_TO).length);const before=JSON.stringify([game.board,game.rowRng,game.nextRow]);assert.ok(game.hint());assert.equal(JSON.stringify([game.board,game.rowRng,game.nextRow]),before);}
});
test('nonmatches revert and an old gesture cannot swap after a row shift',()=>{
 const game=new TideGame({seed:12});game.start();const before=[...game.board];assert.equal(game.swap(0,1),false);assert.deepEqual(game.board,before);assert.equal(game.score,0);game.tick(130);assert.equal(game.busy,false);
 const revision=game.revision;game.raise(true);complete(game);const now=[...game.board];assert.equal(game.swap(TUTORIAL_FROM,TUTORIAL_TO,revision),false);assert.deepEqual(game.board,now);
});
test('single legal swaps earn square Bomb, line-4 Rocket, L Cross and line-5 Nova, never from a pre-existing match',()=>{
 for(const [shape,power,size]of [[3,null,3],['square','bomb',4],[4,'rocket',4],['cross','cross',5],[5,'nova',5]]){
  const game=new TideGame({seed:2});game.start();const [from,to]=fixture(game,shape);
  assert.equal(tideGroups(game.board).length,0);assert.equal(game.swap(from,to),true);assert.equal(game.swap(from,to),false);game.tick(145);
  assert.equal(game.score,size*size*10);assert.equal(Object.values(game.powers).reduce((a,b)=>a+b,0),power?1:0);if(power)assert.equal(game.powers[power],1);complete(game);
 }
 const game=new TideGame({seed:2});game.start();for(let i=0;i<4;i++){const [a,b]=fixture(game,'square');game.swap(a,b);complete(game);}assert.equal(game.powers.bomb,2);
});
test('shape recognition is rotation invariant and never promotes a big square or separate triples to Nova',()=>{
 const origin=4*C+3,rotate=([x,y],turn)=>turn===0?[x,y]:turn===1?[-y,x]:turn===2?[-x,-y]:[y,-x];
 for(const [pattern,power]of [[[[0,0],[1,0],[0,1],[1,1]],'bomb'],[[[-1,0],[0,0],[1,0],[2,0]],'rocket'],[[[0,0],[1,0],[2,0],[0,1],[0,2]],'cross'],[[[-1,0],[0,0],[1,0],[0,1],[0,2]],'cross'],[[[-2,0],[-1,0],[0,0],[1,0],[2,0]],'nova']])for(let turn=0;turn<4;turn++){
  const board=empty(),cells=pattern.map(point=>{const [x,y]=rotate(point,turn);return origin+y*C+x;});for(const at of cells)board[at]=0;
  assert.equal(tideGroups(board).length,1);assert.equal(bonusForGroup(tideGroups(board)[0]),power==='rocket'&&turn%2===1?'shuffle':power);
 }
 const block=[origin,origin+1,origin+C,origin+C+1,origin+2*C,origin+2*C+1];assert.equal(bonusForGroup(block),'bomb');
 assert.equal(strongestBonus([[base,base+1,base+2],[0,C,2*C]]),null);
 assert.equal(strongestBonus([[base,base+1,base+2,base+3],[0,C,2*C,3*C,4*C]]),'nova');
});
test('L and T rewards can be completed in one swap in every orientation before any three auto-clears',()=>{
 const origin=5*C+3,rotate=([x,y],turn)=>turn===0?[x,y]:turn===1?[-y,x]:turn===2?[-x,-y]:[y,-x];
 for(const pattern of [[[-2,0],[-1,0],[0,0],[0,1],[0,2]],[[-1,0],[0,0],[1,0],[0,1],[0,2]]])for(let turn=0;turn<4;turn++){
  const game=new TideGame({seed:2});game.start();game.board=empty();const at=([x,y])=>{const [a,b]=rotate([x,y],turn);return origin+b*C+a;};
  for(const point of pattern)game.board[at(point)]=0;game.board[origin]=1;const source=at([0,-1]);game.board[source]=0;
  assert.equal(tideGroups(game.board).length,0);assert.ok(game.swap(source,origin));game.tick(145);assert.equal(game.powers.cross,1);assert.equal(game.powers.nova,0);
 }
});
test('separate triples in one swap do not masquerade as one Nova pattern',()=>{
 const game=new TideGame({seed:2});game.start();fixture(game,3);game.board[TUTORIAL_FROM-C]=1;game.board[TUTORIAL_FROM-2*C]=1;game.swap(TUTORIAL_FROM,TUTORIAL_TO);game.tick(145);assert.equal(game.cleared,6);assert.deepEqual(game.powers,{bomb:0,rocket:0,cross:0,nova:0,shuffle:0});
});
test('gravity cascades score without creating more power rewards',()=>{
 const events=[],game=new TideGame({seed:3,onEvent:e=>events.push(e)});game.start();fixture(game,3);game.board[TUTORIAL_TO]=2;for(let col=0;col<4;col++)game.board[4*C+col]=2;game.swap(TUTORIAL_FROM,TUTORIAL_TO);complete(game,3000);assert.ok(events.some(e=>e.type==='clear'&&e.stage>1&&e.cells.length>=4));assert.deepEqual(game.powers,{bomb:0,rocket:0,cross:0,nova:0,shuffle:0});
});
test('targeted powers preview exactly the cells removed, clip corners and never double-spend',()=>{
 for(const [power,index,count]of [['bomb',0,4],['bomb',5*C+3,9],['rocket',5*C+3,C],['cross',5*C+3,C+R-1],['nova',undefined,N]]){
  const events=[],game=new TideGame({seed:9,onEvent:e=>events.push(e)});game.start();game.powers[power]=1;game.board=Array.from({length:N},(_,i)=>(i+Math.floor(i/C))%4);
  const preview=powerCells(game.board,power,index);assert.equal(preview.length,count);assert.equal(game.usePower(power,index),true);assert.deepEqual(events.find(e=>e.type==='power').cells,preview);assert.equal(game.usePower(power,index),false);assert.equal(game.board.filter(v=>v===null).length,count);assert.equal(game.powers[power],0);
 }
 const game=new TideGame({seed:9});game.start();game.powers.bomb=1;assert.equal(game.usePower('bomb',0),false);assert.equal(game.usePower('bogus',base),false);assert.equal(game.powers.bomb,1);
 assert.deepEqual(powerCells(game.board,'cross',-1),[]);assert.deepEqual(powerCells(game.board,'bomb',N),[]);
});
test('Blitz refills to 48 stable faces, always offers a move, and never rises',()=>{
 const game=new TideGame({seed:8,mode:'blitz'});game.start();const [a,b]=fixture(game,4);game.swap(a,b);complete(game);assert.equal(game.board.filter(v=>v!==null).length,48);assert.equal(tideGroups(game.board).length,0);assert.ok(legalSwaps(game.board).length);assert.equal(game.raise(true),false);assert.equal(game.rows,0);game.tick(30000);assert.equal(game.riseProgress,0);assert.equal(game.status,'playing');
 game.powers.nova=1;game.usePower('nova');complete(game);assert.equal(game.board.filter(v=>v!==null).length,48);assert.equal(game.powers.nova,0);assert.equal(tideGroups(game.board).length,0);
});
test('Blitz ends at exactly 60 active seconds; Daily still ends at 90',()=>{
 for(const [mode,duration]of [['blitz',BLITZ_MS],['daily',DAILY_MS]]){const game=new TideGame({mode});game.start();game.feverLeft=duration+1;game.tick(duration/2);game.pause();game.tick(50000);assert.equal(game.remaining,duration/2);game.resume();game.tick(duration/2);assert.equal(game.reason,'time');assert.equal(game.elapsed,duration);}
});
test('Ascend clears its target, resets the field, gifts a bounded power and increases difficulty',()=>{
 const events=[],game=new TideGame({mode:'ascend',seed:19,onEvent:e=>events.push(e)});game.start();const firstTarget=game.waveTarget;game.cleared=firstTarget-3;const [a,b]=fixture(game,3);game.swap(a,b);complete(game);assert.equal(game.wave,2);assert.equal(game.waveProgress,0);assert.ok(game.waveTarget>firstTarget);assert.equal(game.powers.bomb,1);assert.equal(game.height,6);assert.equal(tideGroups(game.board).length,0);assert.ok(events.some(e=>e.type==='wave'&&e.wave===2));
 game.wave=4;game.cleared=game.waveStart+game.waveTarget-3;const pair=fixture(game,3);game.swap(...pair);complete(game);assert.equal(game.wave,5);assert.equal(game.powers.nova,1);assert.equal(game.familyCount,5);game.wave=10;assert.equal(game.familyCount,7);
});
test('pause freezes a pending swap, stage celebration and timed-mode clock without spending powers',()=>{
 for(const mode of ['daily','blitz','ascend']){const game=new TideGame({mode});game.start();const [a,b]=fixture(game,4);game.swap(a,b);game.tick(80);game.powers.nova=1;game.pause();const before=JSON.stringify([game.board,game.elapsed,game.phase,game.powers]);game.tick(50000);assert.equal(game.usePower('nova'),false);assert.equal(game.raise(true),false);assert.equal(game.swap(a,b),false);assert.equal(JSON.stringify([game.board,game.elapsed,game.phase,game.powers]),before);game.resume();complete(game);assert.equal(game.powers.rocket,1);}
});
test('chains preserve their window during animations and Overdrive freezes rising without wiping faces',()=>{
 const game=new TideGame({seed:2});game.start();for(let n=1;n<=6;n++){const [a,b]=fixture(game,3);game.swap(a,b);game.tick(470);assert.equal(game.combo,Math.min(n,5));game.tick(200);}game.tick(CHAIN_MS);assert.equal(game.combo,0);
 const [a,b]=fixture(game,3);game.energy=27;game.board[N-1]=3;game.swap(a,b);game.tick(145);assert.equal(game.feverLeft,FEVER_MS);assert.equal(game.board[N-1],3);const rise=game.riseProgress;game.tick(1500);assert.equal(game.riseProgress,rise);
});
test('incoming row matches never mint powers and overflow never awards risk points',()=>{
 const game=new TideGame({seed:1});game.start();game.board=empty();game.nextRow=Array.from({length:C},(_,i)=>i<4?0:i%4);game.raise();complete(game);assert.deepEqual(game.powers,{bomb:0,rocket:0,cross:0,nova:0,shuffle:0});game.board=Array(N).fill(0);const before=game.score;assert.equal(game.raise(true),false);assert.equal(game.reason,'overflow');assert.equal(game.score,before);
});
test('the new daily puzzle is deterministic and row streams stay independent from decisions',()=>{
 const day=dailyKey(new Date('2026-10-26T23:59:59Z'));assert.notEqual(dailySeed(day),dailySeed('2026-10-27'));const a=new TideGame({mode:'daily',day,seed:3}),b=new TideGame({mode:'daily',day,seed:900});a.start();b.start();assert.deepEqual(a.board,b.board);const hint=a.hint();a.swap(hint.from,hint.to);complete(a);for(let n=0;n<10;n++){a.board=empty();b.board=empty();assert.deepEqual(a.nextRow,b.nextRow);a.raise(true);b.raise(true);complete(a);complete(b);}
 assert.equal(new Set(GAME_MODES.map(recordKey)).size,6);assert.notEqual(recordKey('daily'),'swipe-daily');
});
test('frame splitting and fractional level/Overdrive boundaries never create a false timeout',()=>{
 const a=new TideGame({seed:81}),b=new TideGame({seed:81});a.start();b.start();a.tick(25000);for(let n=0;n<250;n++)b.tick(100);assert.deepEqual(a.board,b.board);assert.equal(a.score,b.score);assert.ok(Math.abs(a.riseProgress-b.riseProgress)<1e-8);const game=new TideGame({seed:4});game.start();game.elapsed=25000-.0000001;game.tick(2);assert.equal(game.status,'playing');game.feverLeft=.0000001;game.tick(2);assert.equal(game.status,'playing');assert.equal(game.feverLeft,0);
});
test('seeded play in all five modes keeps scores, colors, dimensions and inventories bounded',()=>{
 for(const mode of GAME_MODES)for(let seed=1;seed<=12;seed++){const game=new TideGame({mode,seed});game.start();for(let move=0;move<55&&game.status==='playing';move++){const choices=legalSwaps(game.board),hint=choices[(seed+move)%Math.max(1,choices.length)];if(hint)game.swap(hint.from,hint.to);else if(game.powers.nova)game.usePower('nova');else game.raise(true);game.tick(1500);assert.equal(game.board.length,N);assert.ok(game.board.every(v=>v===null||Number.isInteger(v)&&v>=0&&v<game.familyCount));assert.ok(Number.isFinite(game.score));assert.ok(game.powers.bomb<=2&&game.powers.rocket<=2&&game.powers.cross<=2&&game.powers.nova<=99&&game.powers.shuffle<=2);if(!game.busy&&game.status==='playing')assert.equal(tideGroups(game.board).length,0);}}
});
test('all mode, goal and power text is translated and the honeycomb UI is absent',async()=>{
 for(const language of ['tr','en'])for(const key of ['rule','readyCopy','dailyCopy','blitz','blitzTitle','blitzCopy','ascend','ascendTitle','ascendCopy','stageTarget','gift','blitzOver','bombHelp','rocketHelp','crossHelp','novaHelp','squarePattern','fourPattern','crossPattern','fivePattern']){const value=tideTranslate(language,key,{count:24,power:'Bomb'});assert.notEqual(value,key);assert.ok(!value.includes('{'));}
 const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8'),app=await readFile(new URL('../dist/app.mjs',import.meta.url),'utf8'),pack=await readFile(new URL('../scripts/package.mjs',import.meta.url),'utf8');assert.ok(!html.includes('workshop-layout')&&!html.includes('id="garden"'));assert.ok(!app.includes('FlowGame'));assert.ok(!pack.includes("['engine',"));
});

test('local match detection equals full-board groups including edges, squares and pre-existing matches',()=>{
 let seed=19283;const next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
 for(let n=0;n<500;n++){
  const board=Array.from({length:N},()=>next()%6<2?null:next()%4),all=new Set(tideGroups(board).flat());
  for(let at=0;at<N;at++)assert.equal(matchesAt(board,at),all.has(at));
 }
});
test('music keeps a stage floor, surges near overflow and relaxes after clearing',()=>{
 const game=new TideGame({seed:1});game.start();assert.equal(game.musicPace,0);game.combo=5;assert.equal(game.musicPace,0);
 let previous=0;for(let level=2;level<=15;level++){game.elapsed=(level-1)*25000;assert.ok(game.musicBasePace>=previous);assert.ok(Math.abs(game.musicBasePace-Math.min(1,(8500-game.interval)/7150))<1e-9);previous=game.musicBasePace;}
 game.elapsed=25000;const base=game.musicPace;game.board=Array(N).fill(0);assert.ok(game.musicPace>base+.5);game.board.fill(null);assert.equal(game.musicPace,base);
 const blitz=new TideGame({mode:'blitz'});blitz.elapsed=30000;assert.equal(blitz.musicPace,.5);
 const ascend=new TideGame({mode:'ascend'});ascend.wave=6;assert.equal(ascend.musicPace,(8500-ascend.interval)/7150);
 const time=new TideGame({mode:'timeRush'});time.start();const calm=time.musicPace;time.timeLeft=3000;const urgent=time.musicPace;assert.ok(urgent>calm+.7);time.timeLeft=20000;assert.ok(time.musicPace<urgent-.4);time.timeLeft=60000;assert.equal(time.musicPace,calm);

});

test('Blitz refills start above the ceiling with a full animation window that pauses exactly',()=>{
 const events=[],game=new TideGame({mode:'blitz',seed:15,onEvent:e=>events.push(e)});game.start();game.powers.nova=1;assert.ok(game.usePower('nova'));game.tick(1025);
 assert.equal(game.phase.kind,'refill');const refill=events.find(e=>e.type==='refill');assert.equal(refill.moves.length,48);
 for(const move of refill.moves){assert.ok(move.from<0);assert.equal((move.from%C+C)%C,move.to%C);}
 const window=refill.duration+(C-1)*refill.stagger;assert.equal(game.phase.left,window);assert.ok(window>=320&&window<=450);
 game.tick(window-1);assert.equal(game.phase.kind,'refill');assert.equal(game.phase.left,1);game.pause();const elapsed=game.elapsed;game.tick(1000);assert.equal(game.phase.left,1);assert.equal(game.elapsed,elapsed);game.resume();game.tick(1);assert.equal(game.busy,false);assert.equal(game.board.filter(v=>v!==null).length,48);
});

test('Novas stack past one in every mode and consume exactly one per activation',()=>{
 for(const mode of GAME_MODES){const game=new TideGame({mode,seed:41});game.start();for(let n=0;n<3;n++){const pair=fixture(game,5);assert.ok(game.swap(...pair));complete(game,2500);}assert.equal(game.powers.nova,3,mode);game.makeOpening();assert.ok(game.usePower('nova'));assert.equal(game.powers.nova,2);assert.equal(game.usePower('nova'),false);complete(game,2500);assert.equal(game.powers.nova,2);}
 const game=new TideGame({seed:1});game.start();game.powers.nova=99;const pair=fixture(game,5);game.swap(...pair);game.tick(145);assert.equal(game.powers.nova,99);
});
test('a single vertical-four swap earns Shuffle while a horizontal four still earns Rocket',()=>{
 const game=new TideGame({seed:1});game.start();game.board=empty();const target=5*C+3;for(const at of [target-C,target,target+C,target+2*C,target-1])game.board[at]=0;game.board[target]=1;assert.equal(tideGroups(game.board).length,0);assert.ok(game.swap(target-1,target));game.tick(145);assert.equal(game.powers.shuffle,1);assert.equal(game.powers.rocket,0);
});
test('100 reshuffles preserve occupied slots and every face, open a move, award nothing and isolate row RNG',()=>{
 const counts=board=>Array.from({length:7},(_,value)=>board.filter(v=>v===value).length);
 for(let seed=1;seed<=100;seed++){
  const game=new TideGame({seed});game.start();game.powers.shuffle=1;const before=[...game.board],rng=game.rowRng,row=[...game.nextRow],refill=game.refillRng;assert.ok(game.usePower('shuffle'));
  assert.notDeepEqual(game.board,before);assert.deepEqual(counts(game.board),counts(before));assert.deepEqual(game.board.map(v=>v===null),before.map(v=>v===null));assert.equal(tideGroups(game.board).length,0);assert.ok(legalSwaps(game.board).length);assert.equal(game.score,0);assert.equal(game.cleared,0);assert.equal(game.powers.shuffle,0);assert.equal(game.usePower('shuffle'),false);assert.equal(game.rowRng,rng);assert.equal(game.refillRng,refill);assert.deepEqual(game.nextRow,row);game.tick(280);assert.equal(game.busy,false);
 }
});
test('an impossible shuffle retains its power and board, and cannot act while paused',()=>{
 const game=new TideGame({seed:4});game.start();game.board=empty();game.board[N-1]=0;game.powers.shuffle=1;const before=[...game.board];assert.equal(game.usePower('shuffle'),false);assert.equal(game.powers.shuffle,1);assert.deepEqual(game.board,before);assert.deepEqual(powerCells(game.board,'shuffle'),[]);game.makeOpening();game.pause();assert.equal(game.usePower('shuffle'),false);assert.equal(game.powers.shuffle,1);
});
test('Time Rush drains continuously and a triple earns two seconds; powers cannot farm time',()=>{
 const events=[],game=new TideGame({mode:'timeRush',seed:7,onEvent:e=>events.push(e)});game.start();assert.equal(game.remaining,30000);assert.equal(game.powers.shuffle,1);assert.equal(game.raise(true),false);game.tick(1000);assert.equal(game.remaining,29000);const pair=fixture(game,3);game.swap(...pair);game.tick(145);assert.equal(game.remaining,30855);assert.equal(game.timeEarned,2000);assert.equal(events.find(e=>e.type==='clear').timeAdded,2000);
 for(const power of Object.keys(POWER_CAPS)){const run=new TideGame({mode:'timeRush',seed:9});run.start();run.timeLeft=8000;run.powers[power]=1;assert.ok(run.usePower(power,N-1),power);run.tick(2500);assert.equal(run.timeEarned,0,power);assert.ok(run.remaining<8000,power);}
});
test('bigger Time Rush matches earn more, cascades earn half and reserves/move credits are capped',()=>{
 assert.deepEqual([3,4,5,6,8].map(n=>timeReward(n)),[2000,3000,4000,5000,7000]);assert.equal(timeReward(4,2),1500);
 const game=new TideGame({mode:'timeRush'});game.start();game.timeLeft=50000;game.board=empty();const line=Array.from({length:8},(_,i)=>base+i);for(const at of line)game.board[at]=0;game.clearMatches([line],{source:'player',stage:1,multiplier:1});assert.equal(game.remaining,57000);for(const at of line.slice(0,4))game.board[at]=0;game.clearMatches([line.slice(0,4)],{source:'player',stage:2,multiplier:1});assert.equal(game.timeCredit,8000);assert.equal(game.remaining,58000);
 const capped=new TideGame({mode:'timeRush'});capped.start();capped.timeLeft=59600;const pair=fixture(capped,3);capped.swap(...pair);capped.tick(145);assert.equal(capped.remaining,60000);assert.equal(capped.timeEarned,545);
});
test('Time Rush pauses phase and clock, accelerates drain at exact boundaries and ends at zero',()=>{
 const game=new TideGame({mode:'timeRush',seed:11});game.start();game.timeLeft=60000;game.tick(30000);assert.equal(game.remaining,30000);assert.equal(game.timeRate,1.1);game.tick(1000);assert.ok(Math.abs(game.remaining-28900)<1e-8);game.pause();const before=JSON.stringify([game.elapsed,game.remaining,game.phase]);game.tick(40000);assert.equal(JSON.stringify([game.elapsed,game.remaining,game.phase]),before);game.resume();game.tick(40000);assert.equal(game.status,'over');assert.equal(game.reason,'time');assert.equal(game.remaining,0);assert.equal(game.rows,0);
 const plain=new TideGame({mode:'timeRush'});plain.start();plain.tick(30000);assert.equal(plain.status,'over');assert.equal(plain.elapsed,30000);
 const scaling=new TideGame({mode:'timeRush'});scaling.start();scaling.elapsed=60000;assert.equal(scaling.familyCount,5);assert.equal(scaling.timeRate,1.2);assert.ok(scaling.musicPace>=0);scaling.elapsed=180000;assert.equal(scaling.familyCount,7);
});

test('Time Rush is frame-split independent and a pending clear cannot resurrect an expired clock',()=>{
 const a=new TideGame({mode:'timeRush',seed:22}),b=new TideGame({mode:'timeRush',seed:22});a.start();b.start();a.timeLeft=60000;b.timeLeft=60000;a.tick(32000);for(let n=0;n<320;n++)b.tick(100);assert.ok(Math.abs(a.remaining-b.remaining)<1e-7);assert.equal(a.elapsed,b.elapsed);assert.deepEqual(a.board,b.board);
 const late=new TideGame({mode:'timeRush'});late.start();late.timeLeft=100;const pair=fixture(late,3);late.swap(...pair);late.tick(100);assert.equal(late.status,'over');assert.equal(late.remaining,0);assert.equal(late.timeEarned,0);assert.equal(late.score,0);late.tick(1000);assert.equal(late.timeEarned,0);
});
