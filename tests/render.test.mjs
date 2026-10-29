import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoardRenderer} from '../dist/board.mjs';
import {impactSamples} from '../dist/impact.mjs';

test('board keeps the same 88 touch targets and decoded images through swaps, clears and refills',()=>{
 const previous=globalThis.document;let created=0,sourceWrites=0;
 class Element{
  constructor(){created++;this.children=[];this.dataset={};this.attrs={};this.tokens=new Set();this.disabled=false;this.classList={toggle:(key,on)=>on?this.tokens.add(key):this.tokens.delete(key),remove:key=>this.tokens.delete(key)};this.style={setProperty(){}};}
  set src(value){sourceWrites++;this.url=value;}get src(){return this.url;}
  append(...items){this.children.push(...items);}replaceChildren(...items){this.children=items[0]?.fragment?items[0].children:items;}
  setAttribute(key,value){this.attrs[key]=value;}animate(){return {cancel(){}};}
 }
 globalThis.document={createElement:()=>new Element(),createDocumentFragment:()=>Object.assign(new Element(),{fragment:true})};
 try{
  const grid=new Element(),next=new Element(),view=createBoardRenderer({grid,next,columns:8,rows:11,colors:['red','blue','green','gold']}),board=Array.from({length:88},(_,i)=>i<40?null:i%4),portraits=['a','b','c','d'],nextRow=[0,1,2,3,0,1,2,3],label=(family,i)=>family+':'+i;
  view.render({board,nextRow,portraits,label});const identities=[...grid.children],initial=created,writes=sourceWrites;
  for(let i=0;i<100;i++)view.render({board,nextRow,portraits,label});assert.equal(created,initial);assert.equal(sourceWrites,writes);
  const changed=[...board];[changed[80],changed[81]]=[changed[81],changed[80]];
  view.render({board:changed,nextRow,portraits,label,moves:[{from:80,to:81},{from:81,to:80}]});assert.equal(sourceWrites,writes+2);
  changed[81]=null;view.render({board:changed,nextRow,portraits,label,disabled:true});assert.equal(grid.children[81].children[0].hidden,true);assert.ok(grid.children.every(n=>n.disabled));
  view.render({board,nextRow,portraits,label});assert.deepEqual(grid.children,identities);assert.equal(created,initial);assert.equal(grid.children[81].children[0].hidden,false);
 }finally{globalThis.document=previous;}
});
test('procedural impacts have stereo detail, bounded peaks and a decaying tail without external media',()=>{
 for(const kind of ['bomb','rocket','cross','nova']){
  const {channels,duration}=impactSamples(kind,12000);assert.equal(channels.length,2);assert.ok(duration>.8&&duration<=1.5);assert.notDeepEqual(channels[0],channels[1]);
  for(const channel of channels){let peak=0;for(const sample of channel){assert.ok(Number.isFinite(sample));peak=Math.max(peak,Math.abs(sample));}assert.ok(peak>.1&&peak<=.861);const energy=(a,b)=>channel.slice(Math.floor(a*channel.length),Math.floor(b*channel.length)).reduce((sum,v)=>sum+v*v,0)/((b-a)*channel.length);assert.ok(energy(.1,.4)>energy(.8,1));}
 }
});

test('refill animation uses staggered, hidden start positions and survives pause or label refresh',()=>{
 const before=globalThis.document,animations=[];
 class Node{
  constructor(){this.children=[];this.dataset={};this.disabled=false;this.classList={toggle(){},remove(){}};this.style={setProperty(){}};}
  append(...items){this.children.push(...items);}replaceChildren(...items){this.children=items[0].children;}setAttribute(){}
  animate(frames,options){const animation={frames,options,playState:'running',cancelled:false,cancel(){this.cancelled=true;},pause(){this.playState='paused';},play(){this.playState='running';}};animations.push(animation);return animation;}
 }
 globalThis.document={createElement:()=>new Node(),createDocumentFragment:()=>new Node()};
 try{
  const view=createBoardRenderer({grid:new Node(),next:new Node(),columns:8,rows:11,colors:['red']}),board=Array(88).fill(null),nextRow=Array(8).fill(0),portraits=['photo'],label=()=>'';
  board[83]=0;view.render({board,nextRow,portraits,label,moves:[{from:-5,to:83}],duration:320,stagger:12});
  assert.equal(animations.length,1);const animation=animations[0];assert.equal(animation.options.duration,320);assert.equal(animation.options.delay,36);assert.equal(animation.options.fill,'backwards');assert.match(animation.frames[0].transform,/-/);
  view.render({board,nextRow,portraits,label,paused:true});assert.equal(animation.playState,'paused');assert.equal(animation.cancelled,false);
  view.render({board,nextRow,portraits,label});assert.equal(animation.playState,'running');assert.equal(animations.length,1);view.cancelMotion();assert.equal(animation.cancelled,true);
 }finally{globalThis.document=before;}
});
