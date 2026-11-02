// The bridge accepts no photos, names or board data. Native code owns ads, quota and entitlements.
export const PREMIUM_PRODUCT='com.mertbekisoglu.bulusko.premium';
export function rescueKind(game){if(game.status!=='over'||game.rescueUsed)return null;return game.mode==='timeRush'&&game.reason==='time'?'time':game.reason==='overflow'&&game.mode==='survival'?'rows':game.reason==='overflow'&&game.mode==='ascend'?'stage':null;}
export function createCommerce({target=globalThis,send,timeoutMs=300000,onChange=()=>{}}={}){
 let state={age:'unknown',supported:false,ready:false,remaining:0,premium:false,canPurchase:false,price:'',privacyRequired:false},pending=null,serial=0;
 const notify=()=>onChange({...state,busy:!!pending});
 const finish=(result)=>{const p=pending;if(!p||result.id!==p.id)return;pending=null;clearTimeout(p.timer);notify();p.resolve(result);};
 const receive=event=>{const d=event.detail;if(!d||typeof d!=='object')return;if(d.kind==='state'){
  state={age:['child','teen','adult'].includes(d.age)?d.age:'unknown',supported:d.supported===true,ready:d.ready===true,remaining:Math.max(0,Math.min(3,Math.floor(Number(d.remaining)||0))),premium:d.premium===true,canPurchase:d.canPurchase===true,price:typeof d.price==='string'?d.price.slice(0,60):'',privacyRequired:d.privacyRequired===true};notify();
 }else if(d.kind==='result'&&['earned','closed','unavailable','error','purchased','restored','cancelled','pending','limited'].includes(d.code))finish(d);};
 target.addEventListener?.('popzuno:commerce',receive);
 function post(payload){try{if(send)return send(payload)!==false;const handler=globalThis.webkit?.messageHandlers?.bulusko;if(!handler?.postMessage)return false;handler.postMessage({type:'commerce',...payload});return true;}catch{return false;}}
 function request(op,extra={}){
  if(pending)return Promise.resolve({code:'unavailable'});
  if(!['audience','prepare','show','buy','restore','privacy'].includes(op))return Promise.resolve({code:'error'});
  if(op==='show'&&(!state.ready||state.remaining<1||!['rows','time','stage'].includes(extra.placement)))return Promise.resolve({code:'unavailable'});
  return new Promise(resolve=>{const id='c-'+(globalThis.crypto?.randomUUID?.()??(Date.now().toString(36)+'-'+(++serial)+'-'+Math.random().toString(36).slice(2,10)));pending={id,resolve,timer:op==='show'||op==='buy'?null:setTimeout(()=>finish({id,code:'error'}),timeoutMs)};notify();if(!post({op,id,run:typeof extra.run==='string'?extra.run.slice(0,96):'',placement:extra.placement??'',age:['child','teen','adult'].includes(extra.age)?extra.age:'unknown'}))finish({id,code:'unavailable'});});
 }
 return {get state(){return {...state,busy:!!pending};},request,refresh(){post({op:'status'});},destroy(){if(pending)finish({id:pending.id,code:'error'});target.removeEventListener?.('popzuno:commerce',receive);}};
}
