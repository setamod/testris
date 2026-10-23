import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const url=new URL('../ios/Blok/Resources/Game/index.html',import.meta.url);
const html=readFileSync(url,'utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function boot(extraPreferences={}){
 const gradient={addColorStop(){}};
 const drawing=new Proxy({createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(object,key)=>key in object?object[key]:()=>{}});
 const element=(id='')=>{
  const el={id,hidden:false,style:{},attrs:{},listeners:{},value:'55',width:176,height:88,observers:[],classList:{add(){},remove(){}},setAttribute(name,value){this.attrs[name]=value;},addEventListener(type,handler){this.listeners[type]=handler;},querySelector(selector){this.children??={};return this.children[selector]??=element();},replaceChildren(){this.nodes=[];},append(...nodes){this.nodes??=[];this.nodes.push(...nodes);},getContext(){return drawing;},blur(){},matches(){return false;},showModal(){this.open=true;},close(){this.open=false;this.listeners.close?.();}};
  let content='';Object.defineProperty(el,'textContent',{get:()=>content,set:value=>{content=value;el.observers.forEach(fn=>fn());}});return el;
 };
 const elements=new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],element(m[1])]));
 const events={},messages=[];let frame;
 const document={getElementById:id=>elements.get(id)??null,createElement:()=>element(),querySelectorAll:()=>[],addEventListener:(event,handler)=>events[event]=handler};
 const preferences={'blok-best':'2703','blok-sound':'false','blok-volume':'35',...extraPreferences};
 const context={document,window:{addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},__BLOK_NATIVE_STORAGE__:preferences,webkit:{messageHandlers:{blok:{postMessage:message=>messages.push(message)}}},requestAnimationFrame:callback=>frame=callback,matchMedia:()=>({matches:true}),setTimeout:()=>1,clearTimeout(){},MutationObserver:class{constructor(callback){this.callback=callback;}observe(element){element.observers.push(this.callback);}},console};
 vm.runInNewContext(code,context,{timeout:1000});
 const press=key=>events.keydown({key,code:key,target:{closest:()=>null,matches:()=>false},preventDefault(){}});
 return {elements,messages,preferences,press,draw:()=>frame(100)};
}
test('iOS game is a self-contained classic script with embedded fonts',()=>{assert.doesNotThrow(()=>new vm.Script(code));assert.ok(!/@import\s|type="module"|<script[^>]+src=/.test(html));assert.ok(!/^\s*(?:import|export)\s/m.test(code));assert.equal((html.match(/data:font\/ttf;base64,/g)??[]).length,4);assert.ok(html.includes('href="./index.html"'));});
test('native startup restores the iPhone score and sound preferences',()=>{const h=boot();assert.equal(h.elements.get('best-score').textContent,'2.703');assert.equal(h.elements.get('sound-volume').value,'35');assert.equal(h.elements.get('sound-button').attrs['aria-pressed'],'false');h.draw();});
test('playing and pausing notify the iPhone host without background auto-resume',()=>{const h=boot();h.elements.get('start-button').listeners.click();assert.ok(h.messages.some(m=>m.type==='state'&&m.playing===true));h.press(' ');assert.ok(Number(h.elements.get('score').textContent)>0);assert.ok(h.messages.some(m=>m.type==='feedback'&&m.event==='drop'));h.press('p');assert.equal(h.messages.filter(m=>m.type==='state').at(-1).playing,false);assert.equal(h.elements.get('game-overlay').hidden,false);});
test('the held piece is visible in the iPhone sidebar',()=>{const h=boot();h.elements.get('start-button').listeners.click();h.press('c');assert.equal(h.elements.get('native-held-empty').hidden,true);assert.ok(h.elements.get('native-held').attrs['aria-label'].startsWith('Saklanan parça: '));assert.ok(h.messages.some(m=>m.type==='feedback'&&m.event==='hold'));});
test('changing volume persists through the native preference bridge',()=>{const h=boot();const slider=h.elements.get('sound-volume');slider.value='64';slider.listeners.input({target:slider});assert.ok(h.messages.some(m=>m.type==='preference'&&m.key==='blok-volume'&&m.value==='64'));assert.equal(h.preferences['blok-volume'],'64');});
test('opening native settings pauses the game and requests the native sheet',()=>{const h=boot();h.elements.get('start-button').listeners.click();h.elements.get('native-settings').listeners.click();assert.equal(h.elements.get('game-status').textContent,'KÜÇÜK BİR MOLA');assert.equal(h.messages.filter(m=>m.type==='state').at(-1).playing,false);assert.ok(h.messages.some(m=>m.type==='settings'));});
test('the family editor pauses play and saves its setting through the iPhone bridge',()=>{const h=boot();h.elements.get('start-button').listeners.click();h.elements.get('family-button').listeners.click();assert.equal(h.elements.get('family-dialog').open,true);assert.equal(h.elements.get('game-status').textContent,'KÜÇÜK BİR MOLA');h.elements.get('family-enabled').listeners.change({target:{checked:false}});const message=h.messages.find(m=>m.type==='preference'&&m.key==='familytris-family');assert.ok(message);assert.equal(JSON.parse(message.value).enabled,false);assert.equal(h.preferences['familytris-family'],message.value);});
test('the iPhone family setting is restored from native storage on launch',async()=>{const stored=JSON.stringify({version:1,enabled:false,people:[],order:[0,0,0,0,0,0,0]});const h=boot({'familytris-family':stored});await new Promise(resolve=>setImmediate(resolve));h.elements.get('family-button').listeners.click();assert.equal(h.elements.get('family-enabled').checked,false);});
