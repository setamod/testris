// Stable cells keep decoded portraits and touch targets alive across game phases.
export function createBoardRenderer({grid,next,columns,rows,colors,reducedMotion=false}){
 const cells=[],preview=[],animations=new Map();
 const makeImage=()=>{const img=document.createElement('img');img.alt='';img.draggable=false;img.decoding='async';return img;};
 const fragment=document.createDocumentFragment();
 for(let index=0;index<columns*rows;index++){
  const button=document.createElement('button'),img=makeImage(),badge=document.createElement('span'),arrow=document.createElement('em');
  button.type='button';button.tabIndex=-1;button.dataset.tideCell=index;button.className='tide-empty tide-target-cell';img.hidden=true;badge.hidden=true;arrow.hidden=true;arrow.className='swipe-arrow';
  button.append(img,badge,arrow);fragment.append(button);cells.push({button,img,badge,arrow,family:undefined,src:null,label:null,hintTo:null});
 }
 grid.replaceChildren(fragment);
 for(let col=0;col<columns;col++){const span=document.createElement('span'),img=makeImage();span.append(img);next.append(span);preview.push({span,img,family:undefined,src:null});}
 function setImage(cell,src){if(cell.src!==src){cell.img.src=src;cell.src=src;}}
 function render({board,nextRow,portraits,hint=null,disabled=false,label,moves:motion=[],duration=145,stagger=0,paused=false}){
  const moves=new Map(motion.map(move=>[move.to,move.from]));
  for(let index=0;index<cells.length;index++){
   const cell=cells[index],family=board[index],occupied=family!==null,source=hint?.from===index,target=hint?.to===index;
   const changed=cell.family!==family;
   if(changed){
    cell.button.classList.toggle('tide-tile',occupied);cell.button.classList.toggle('tide-empty',!occupied);cell.button.classList.toggle('tide-target-cell',!occupied);
    cell.img.hidden=!occupied;cell.badge.hidden=!occupied;
    if(occupied){cell.button.style.setProperty('--face',colors[family]);cell.badge.textContent=family+1;}
    cell.family=family;
   }
   if(occupied)setImage(cell,portraits[family]);
   cell.button.classList.remove('rejected');cell.button.classList.toggle('swipe-source',source);cell.button.classList.toggle('swipe-target',target);cell.arrow.hidden=!source;
   if(source){const delta=hint.to-hint.from;cell.arrow.textContent=delta===1?'→':delta===-1?'←':delta===columns?'↓':'↑';}
   const hintTo=source?String(hint.to):null;
   if(cell.hintTo!==hintTo){if(hintTo!==null)cell.button.dataset.swipeTo=hintTo;else delete cell.button.dataset.swipeTo;cell.hintTo=hintTo;}
   if(cell.button.disabled!==disabled)cell.button.disabled=disabled;
   const text=label(family,index,source?hint:null);if(text!==cell.label){cell.button.setAttribute('aria-label',text);cell.label=text;}
   if(changed||!occupied||moves.has(index)){animations.get(index)?.cancel();animations.delete(index);}
   if(occupied&&moves.has(index)&&!reducedMotion&&cell.button.animate){
    const from=moves.get(index),x=((from%columns+columns)%columns-index%columns)*100,y=(Math.floor(from/columns)-Math.floor(index/columns))*100;
    if(x||y){const animation=cell.button.animate([{transform:`translate(${x}%,${y}%)`},{transform:'translate(0,0)'}],{duration,delay:index%columns*stagger,fill:'backwards',easing:'cubic-bezier(.22,.68,.3,1)'});animations.set(index,animation);animation.onfinish=()=>{if(animations.get(index)===animation)animations.delete(index);};}
   }
  }
  for(const animation of animations.values()){if(paused)animation.pause?.();else if(animation.playState==='paused')animation.play?.();}
  for(let col=0;col<preview.length;col++){const cell=preview[col],family=nextRow[col];if(cell.family!==family){cell.span.style.setProperty('--face',colors[family]);cell.family=family;}setImage(cell,portraits[family]);}
 }
 function mark({selected=null,neighbours=[],targets=[]}){const near=new Set(neighbours),area=new Set(targets);for(let index=0;index<cells.length;index++){const node=cells[index].button;node.classList.toggle('is-selected',selected===index);node.classList.toggle('move-target',near.has(index));node.classList.toggle('power-target',area.has(index));}}
 function cancelMotion(){for(const animation of animations.values())animation.cancel();animations.clear();}
 return {render,mark,cancelMotion};
}
