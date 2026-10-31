// Image alignment is local to the native app; no photos leave the device.
export function safePhotoAngle(result){
 if(!result||result.faces!==1||!Number.isFinite(result.confidence)||result.confidence<.7||!Number.isFinite(result.eyeDistance)||result.eyeDistance<.15||result.eyeDistance>.65||!Number.isFinite(result.angle)||Math.abs(result.angle)>14)return 0;
 if(Math.abs(result.angle)<1.5)return 0;
 return Math.round(Math.max(-8,Math.min(8,result.angle))*10)/10;
}
export function createPhotoAligner({target=globalThis,send,timeoutMs=1800}={}){
 const pending=new Map(),prefix='photo-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);let serial=0;
 const finish=(id,angle)=>{const item=pending.get(id);if(!item)return;clearTimeout(item.timer);pending.delete(id);item.resolve(angle);};
 const listener=event=>{const result=event.detail;if(result&&typeof result.id==='string'&&pending.has(result.id))finish(result.id,safePhotoAngle(result));};
 target.addEventListener?.('popzuno:photo-alignment',listener);
 function request(photo){
  const post=send??(value=>{const handler=globalThis.webkit?.messageHandlers?.bulusko;if(!globalThis.__POPZUNO_PHOTO_ALIGNMENT__||!handler?.postMessage)return false;handler.postMessage(value);return true;});
  if(typeof photo!=='string'||photo.length>160000||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(photo))return Promise.resolve(0);
  return new Promise(resolve=>{const id=prefix+'-'+(++serial),timer=setTimeout(()=>finish(id,0),timeoutMs);pending.set(id,{resolve,timer});try{if(post({type:'photoAlign',id,photo})===false)finish(id,0);}catch{finish(id,0);}});
 }
 function clear(){for(const id of [...pending.keys()])finish(id,0);}
 return {supported:!!globalThis.__POPZUNO_PHOTO_ALIGNMENT__,request,clear,destroy(){clear();target.removeEventListener?.('popzuno:photo-alignment',listener);}};
}
