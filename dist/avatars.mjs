export const FAMILY_COLORS=['#ff637c','#a488ff','#35d7b3','#ffd346','#4dafff','#ff83da','#a7e543'];
export const DEFAULT_NAMES={tr:['Ada','Arda','Deniz','Lale','Bora','Eda','Can'],en:['Ada','Arda','Deniz','Lale','Bora','Eda','Can']};
export function createAvatars(colors){
 const images=new Map(),cache=new Map();
 function decode(data){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=data;});}
 function oval(ctx,x,y,rx,ry,color){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
 function portrait(index,person={}){
  const previous=cache.get(index);if(previous&&previous.photo===person.photo&&previous.zoom===person.zoom&&previous.x===person.x&&previous.y===person.y)return previous.url;
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const c=canvas.getContext('2d'),color=colors[index];
  c.translate(128,128);c.scale(128,128);
  const bg=c.createRadialGradient(-.25,-.45,0,0,0,1.4);bg.addColorStop(0,color+'80');bg.addColorStop(1,'#171a2b');c.fillStyle=bg;c.fillRect(-1,-1,2,2);
  let skin=['#dca77e','#d6a88f','#a77554','#f0c4a4','#b98967','#e5b19e','#c48e6d'][index];
  const img=images.get(person.photo);
  if(img){const sample=document.createElement('canvas');sample.width=1;sample.height=1;const sc=sample.getContext('2d',{willReadFrequently:true});sc.drawImage(img,92,138,6,6,0,0,1,1);const p=sc.getImageData(0,0,1,1).data;skin=`rgb(${p[0]},${p[1]},${p[2]})`;}
  // Tailored jacket, lapels, seams and neck share one illustrated silhouette.
  const coat=c.createLinearGradient(-.7,.2,.7,1);coat.addColorStop(0,color);coat.addColorStop(1,'#26324c');c.beginPath();c.moveTo(-.18,.18);c.bezierCurveTo(-.82,.2,-.9,.65,-.96,1.2);c.lineTo(.96,1.2);c.bezierCurveTo(.9,.65,.82,.2,.18,.18);c.closePath();c.fillStyle=coat;c.fill();
  c.fillStyle='#20283d';c.beginPath();c.moveTo(-.26,.22);c.lineTo(0,.68);c.lineTo(.26,.22);c.fill();c.fillStyle=skin;c.fillRect(-.16,.1,.32,.35);
  c.strokeStyle='#ecf3ff45';c.lineWidth=.025;for(const side of [-1,1]){c.beginPath();c.moveTo(side*.4,.4);c.lineTo(side*.53,.92);c.stroke();c.fillStyle='#111d3340';c.fillRect(side<0?-.6:.32,.64,.28,.13);}
  c.strokeStyle='#e8f2ff70';c.beginPath();c.moveTo(0,.6);c.lineTo(0,1);c.stroke();c.fillStyle=color;c.fillRect(.42,.52,.15,.04);
  oval(c,-.43,-.25,.11,.18,skin);oval(c,.43,-.25,.11,.18,skin);
  c.save();c.beginPath();c.moveTo(0,-.93);c.bezierCurveTo(.65,-.94,.61,-.23,.38,.12);c.quadraticCurveTo(0,.46,-.38,.12);c.bezierCurveTo(-.61,-.23,-.65,-.94,0,-.93);c.closePath();c.clip();c.fillStyle=skin;c.fillRect(-.6,-1,1.2,1.5);
  if(img){const zoom=person.zoom||1,size=256/zoom,sx=(256-size)*(person.x??.5),sy=(256-size)*(person.y??.5);c.drawImage(img,sx,sy,size,size,-.57,-.98,1.14,1.42);const blend=c.createLinearGradient(0,.04,0,.4);blend.addColorStop(0,'#00000000');blend.addColorStop(1,skin);c.fillStyle=blend;c.fillRect(-.6,.04,1.2,.4);}else{
   oval(c,-.22,-.19,.1,.065,'#fff4e4');oval(c,.22,-.19,.1,.065,'#fff4e4');for(const x of [-.22,.22]){oval(c,x,-.18,.042,.055,'#283044');oval(c,x+.015,-.2,.015,.018,'white');}
   c.strokeStyle='#55413c';c.lineWidth=.035;for(const x of [-.22,.22]){c.beginPath();c.moveTo(x-.095,-.34);c.quadraticCurveTo(x,-.39,x+.09,-.34);c.stroke();}
   c.strokeStyle='#975e55';c.lineWidth=.025;c.beginPath();c.moveTo(-.15,.08);c.quadraticCurveTo(0,.2,.16,.07);c.stroke();c.strokeStyle='#a47561';c.beginPath();c.moveTo(0,-.18);c.lineTo(-.04,-.01);c.lineTo(.04,0);c.stroke();
  }c.restore();
  if(!img){c.fillStyle=['#473144','#302f3e','#342b28','#593a35','#253143','#4d3242','#37313b'][index];c.beginPath();c.moveTo(-.5,-.22);c.bezierCurveTo(-.75,-1.15,.35,-1.25,.51,-.7);c.quadraticCurveTo(.62,-.4,.47,-.14);c.lineTo(.34,-.56);c.quadraticCurveTo(-.1,-.39,-.28,-.67);c.closePath();c.fill();c.strokeStyle='#ffffff24';c.lineWidth=.035;c.beginPath();c.moveTo(-.25,-.83);c.quadraticCurveTo(.1,-1,.31,-.75);c.stroke();}
  c.fillStyle='#10182755';c.beginPath();c.moveTo(-.2,.28);c.lineTo(-.35,.38);c.lineTo(-.1,.66);c.lineTo(0,.49);c.closePath();c.fill();c.beginPath();c.moveTo(.2,.28);c.lineTo(.35,.38);c.lineTo(.1,.66);c.lineTo(0,.49);c.closePath();c.fill();
  const result=canvas.toDataURL('image/png');cache.set(index,{photo:person.photo,zoom:person.zoom,x:person.x,y:person.y,url:result});return result;
 }
 return {portrait,async load(people){const current=new Set(people.map(p=>p.photo));for(const photo of images.keys())if(!current.has(photo))images.delete(photo);await Promise.all(people.map(async p=>{if(p.photo&&!images.has(p.photo)){try{images.set(p.photo,await decode(p.photo));}catch{p.photo=null;}}}));cache.clear();},clear(){images.clear();cache.clear();}};
}
