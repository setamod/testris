export const FLOW_PREFIX='bulusko-v1:';
export function clearFlow(){
 let cleared=false,managedByNative=false;
 try{const keys=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith(FLOW_PREFIX)||key?.startsWith('aile-akisi-v1:'))keys.push(key);}for(const key of keys)localStorage.removeItem(key);cleared=true;}catch{}
 const native=globalThis.webkit?.messageHandlers?.bulusko;
 if(native){try{native.postMessage({type:'reset'});cleared=true;managedByNative=true;}catch{}}
 if(cleared&&globalThis.__BULUSKO_STORAGE__)globalThis.__BULUSKO_STORAGE__={};
 return {ok:cleared,managedByNative};
}
export function readFlow(key,fallback=null){try{const fullKey=FLOW_PREFIX+key,native=globalThis.__BULUSKO_STORAGE__;const raw=native&&Object.hasOwn(native,fullKey)?native[fullKey]:localStorage.getItem(fullKey)??localStorage.getItem('aile-akisi-v1:'+key);return raw==null?fallback:JSON.parse(raw);}catch{return fallback;}}
export function writeFlow(key,value){const fullKey=FLOW_PREFIX+key,serialized=JSON.stringify(value);let saved=false;try{localStorage.setItem(fullKey,serialized);saved=true;}catch{}const handler=globalThis.webkit?.messageHandlers?.bulusko;if(handler){try{handler.postMessage({type:'preference',key:fullKey,value:serialized});if(globalThis.__BULUSKO_STORAGE__)globalThis.__BULUSKO_STORAGE__[fullKey]=serialized;saved=true;}catch{}}return saved;}
export function normalizeProgress(raw){const data=raw&&typeof raw==='object'?raw:{};return Array.from({length:12},(_,i)=>{const n=data.results?.[i];return {stars:Math.max(0,Math.min(3,Math.floor(Number(n?.stars)||0))),score:Math.max(0,Math.min(9e12,Number(n?.score)||0))};});}
export function unlockedStage(results){let i=0;while(i<11&&results[i]?.stars>0)i++;return i+1;}
export function normalizePeople(raw){return Array.from({length:7},(_,i)=>{const p=Array.isArray(raw)?raw[i]:null;return {name:typeof p?.name==='string'?p.name.replace(/[\u0000-\u001f]/g,'').slice(0,24):'',photo:typeof p?.photo==='string'&&p.photo.length<=160000&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(p.photo)?p.photo:null,zoom:Math.max(1,Math.min(3,Number(p?.zoom)||1)),x:Math.max(0,Math.min(1,Number.isFinite(p?.x)?p.x:.5)),y:Math.max(0,Math.min(1,Number.isFinite(p?.y)?p.y:.5))};});}
