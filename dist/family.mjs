import {createCharacterRenderer} from './characters.mjs';
export const FAMILY_STORAGE_KEY='familytris-family';
export const FAMILY_TYPES=['L','T','Z','I','O','S','J'];
export function normalizeFamily(raw){
 if(typeof raw!=='string'||raw.length>1_000_000)return null;
 try{const value=JSON.parse(raw);if(value.version!==1||!Array.isArray(value.people)||value.people.length>7)return null;
 const people=value.people.map(p=>{if(typeof p.photo!=='string'||p.photo.length>120_000||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(p.photo))throw Error();return {name:String(p.name??'').replace(/[\u0000-\u001f]/g,'').slice(0,24),photo:p.photo};});
 const order=Array.isArray(value.order)&&value.order.length===7&&value.order.every(n=>Number.isInteger(n)&&n>=0&&n<people.length)?value.order:FAMILY_TYPES.map((_,i)=>people.length?i%people.length:0);
 return {version:1,enabled:value.enabled!==false,people,order};}catch{return null;}
}
export function shuffledAssignments(count,random=Math.random){const order=Array.from({length:7},(_,i)=>i%Math.max(1,count));for(let i=order.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}return order;}
export function createFamilyStudio({read,write,pause,onChange}){
 const renderer=createCharacterRenderer(),get=id=>document.getElementById(id),dialog=get('family-dialog');
 let family={version:1,enabled:true,people:[],order:FAMILY_TYPES.map(()=>0)},images=[],revision=0,busy=false;
 function announce(message){get('family-status').textContent=message;}
 function changed(persist=true){revision++;onChange?.();if(persist){try{write(FAMILY_STORAGE_KEY,JSON.stringify(family));}catch{announce('Değişiklikler bu cihazda kaydedilemedi.');}}}
 function applyImages(){renderer.clear();FAMILY_TYPES.forEach((type,i)=>renderer.setPortrait(type,images[family.order[i]]??null));}
 function drawStudio(){
  get('family-enabled').checked=family.enabled;
  const list=get('family-people');list.replaceChildren();
  family.people.forEach((person,index)=>{
   const row=document.createElement('div');row.className='family-person';
   const photo=document.createElement('img');photo.src=person.photo;photo.alt='';photo.width=44;photo.height=44;
   const input=document.createElement('input');input.type='text';input.maxLength=24;input.value=person.name;input.setAttribute('aria-label',(index+1)+'. kişinin adı');input.addEventListener('change',()=>{person.name=input.value.trim().slice(0,24);changed();drawStudio();});
   const remove=document.createElement('button');remove.type='button';remove.className='family-remove';remove.textContent='Sil';remove.setAttribute('aria-label',(person.name||'Kişi')+' fotoğrafını sil');remove.addEventListener('click',()=>{family.people.splice(index,1);images.splice(index,1);family.order=FAMILY_TYPES.map((_,i)=>family.people.length?i%family.people.length:0);applyImages();changed();drawStudio();announce('Fotoğraf cihazdaki aile kaydından silindi.');});
   row.append(photo,input,remove);list.append(row);
  });
  get('family-empty').hidden=family.people.length>0;get('family-files').disabled=busy||family.people.length>=7;get('family-shuffle').disabled=busy||family.people.length<2;
  FAMILY_TYPES.forEach((type,i)=>{
   const canvas=get('family-preview-'+type),c=canvas.getContext('2d'),asset=renderer.texture(type);c.clearRect(0,0,canvas.width,canvas.height);const scale=Math.min(canvas.width/asset.width,canvas.height/asset.height);c.drawImage(asset,(canvas.width-asset.width*scale)/2,(canvas.height-asset.height*scale)/2,asset.width*scale,asset.height*scale);
   get('family-name-'+type).textContent=family.people[family.order[i]]?.name||'Çizgi karakter';
  });
 }
 get('family-button').addEventListener('click',()=>{pause();drawStudio();dialog.showModal();});
 get('close-family').addEventListener('click',()=>dialog.close());get('family-done').addEventListener('click',()=>dialog.close());
 get('family-enabled').addEventListener('change',e=>{family.enabled=e.target.checked;changed();});
 get('family-shuffle').addEventListener('click',()=>{family.order=shuffledAssignments(family.people.length);applyImages();changed();drawStudio();announce('Yüzler şekillere yeniden dağıtıldı.');});
 get('family-files').addEventListener('change',async e=>{
  if(busy)return;const files=Array.from(e.target.files??[]).slice(0,7-family.people.length);if(!files.length)return;busy=true;drawStudio();let added=0,lastError='';
  try{for(const [i,file]of files.entries()){
   announce('Yüz bulunuyor… '+(i+1)+' / '+files.length);
   try{const photo=await renderer.prepare(file),image=await renderer.decode(photo);family.people.push({name:'Kişi '+(family.people.length+1),photo});images.push(image);added++;}catch(error){lastError=error.message;}
  }
  if(added){family.order=FAMILY_TYPES.map((_,i)=>i%family.people.length);applyImages();changed();}
  announce(lastError?((added?added+' fotoğraf eklendi. ':'')+lastError):'Fotoğraflar hazır. Yalnızca bu cihazda saklanır.');
  }finally{busy=false;e.target.value='';drawStudio();}
 });
 const ready=(async()=>{const restored=normalizeFamily(read(FAMILY_STORAGE_KEY,''));if(restored){try{const decoded=await Promise.all(restored.people.map(p=>renderer.decode(p.photo)));family=restored;images=decoded;applyImages();changed(false);}catch{announce('Kayıtlı fotoğraflar açılamadı. Yeniden fotoğraf seçebilirsin.');}}})();
 return {renderer,ready,get enabled(){return family.enabled;},get revision(){return revision;},get isOpen(){return dialog.open;}};
}
