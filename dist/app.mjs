import {Game,SHAPES,COLORS} from './engine.mjs';

const $=id=>document.getElementById(id);
const canvas=$('board'),ctx=canvas.getContext('2d');
const overlay=$('game-overlay'),dialog=$('help-dialog');
const names={I:'I',O:'kare',T:'T',S:'S',Z:'Z',J:'J',L:'L'};
const safeRead=(key,fallback)=>{try{return localStorage.getItem(key)??fallback;}catch{return fallback;}};
const safeWrite=(key,value)=>{try{localStorage.setItem(key,String(value));}catch{}};
let best=Math.max(0,Number(safeRead('blok-best','0'))||0),previousBest=best;
let soundEnabled=safeRead('blok-sound','false')==='true',audioContext;
let lastFrame=0,toastTimer,wasPlayingBeforeHelp=false,flash=0,flashRows=[],particles=[],dropTrails=[],sessionGeneration=0;
const heldKeys=new Map(),uiCache={};
function tone(frequency=440,duration=.06,type='sine',volume=.025){if(!soundEnabled)return;try{audioContext??=new(window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,audioContext.currentTime);gain.gain.setValueAtTime(volume,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+duration);}catch{}}
function toast(message){$('board-toast').textContent=message;$('board-toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('board-toast').classList.remove('show'),1100);}
function onEvent(event){
 if(event.type==='move')tone(170,.025,'sine',.008);
 if(event.type==='rotate')tone(330,.045,'sine',.015);
 if(event.type==='hold')tone(420,.06,'sine',.02);
 if(event.type==='drop'){$('board-frame').classList.remove('bump');void $('board-frame').offsetWidth;$('board-frame').classList.add('bump');tone(100,.09,'triangle',.04);if(!matchMedia('(prefers-reduced-motion: reduce)').matches){const p=game.active;for(let x=0;x<p.matrix.length;x++){const y=p.matrix.findIndex(row=>row[x]);if(y>=0)dropTrails.push({x:(p.x+x)*30,y:Math.max(0,(p.y+y)*30-150),end:(p.y+y+1)*30,life:210,color:COLORS[p.type]});}}}
 if(event.type==='lock')tone(140,.055,'triangle',.02);
 if(event.type==='clear'){
  flash=220;flashRows=event.rows;
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)for(const row of event.rows)for(let i=0;i<20;i++)particles.push({x:Math.random()*300,y:row*30+15,vx:(Math.random()-.5)*100,vy:-30-Math.random()*90,life:600+Math.random()*300,color:Object.values(COLORS)[Math.floor(Math.random()*7)]});
  toast(event.count===4?`DÖRT DÖRTLÜK! +${event.points}`:`${event.count} SATIR · +${event.points}`);
  [440,554,660,880].slice(0,event.count).forEach((f,i)=>setTimeout(()=>tone(f,.15,'triangle',.04),i*65));
  if(event.levelUp){const generation=sessionGeneration,level=game.level;setTimeout(()=>{if(generation===sessionGeneration)toast(`SEVİYE ${level} ↑`);},1300);}
 }
 if(event.type==='over'){heldKeys.clear();tone(130,.4,'triangle',.04);updateOverlay();}
 if(event.type==='start'){tone(523,.1,'triangle',.03);setTimeout(()=>tone(784,.14,'triangle',.03),100);}
}
const game=new Game({onEvent});

function roundedRect(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
function block(c,x,y,size,color,ghost=false){
 c.save();
 if(ghost){c.fillStyle=color+'0b';c.strokeStyle=color;c.globalAlpha*=.5;c.lineWidth=.9;roundedRect(c,x+2,y+2,size-4,size-4,1);c.fill();c.stroke();c.fillStyle=color;c.fillRect(x+size/2-2,y+size/2-.5,4,1);c.restore();return;}
 const gradient=c.createLinearGradient(x,y,x+size,y+size);gradient.addColorStop(0,color+'70');gradient.addColorStop(.4,color+'28');gradient.addColorStop(1,color+'42');
 c.fillStyle='#080f1d';roundedRect(c,x+1.5,y+1.5,size-3,size-3,1.5);c.fill();c.fillStyle=gradient;c.fill();
 c.strokeStyle=color;c.lineWidth=1.15;c.shadowColor=color;c.shadowBlur=7;c.stroke();c.shadowBlur=0;
 c.strokeStyle=color+'45';c.lineWidth=.6;roundedRect(c,x+4.5,y+4.5,size-9,size-9,.5);c.stroke();
 c.fillStyle='#eaffffb0';c.fillRect(x+4,y+3,size-8,1);c.fillStyle=color;c.fillRect(x+size-7,y+size-6,3,1.5);
 c.restore();
}
function drawPiece(c,piece,y=piece.y,ghost=false){piece.matrix.forEach((row,py)=>row.forEach((v,px)=>{if(v&&py+y>=0)block(c,(piece.x+px)*30,(y+py)*30,30,COLORS[piece.type],ghost);}));}
const demoRows=[
 [null,null,null,null,null,null,null,null,null,'I'],
 ['T',null,null,null,null,null,null,null,null,'I'],
 ['T','T',null,null,null,null,'O','O',null,'I'],
 ['T','S','S',null,'J',null,'O','O',null,'I'],
 ['L','L','S','S','J','J','J',null,'Z','Z'],
 ['L','L','I','I','I','I','S','S',null,'Z']
];
function render(dt){
 ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,300,600);ctx.fillStyle='#070d18';ctx.fillRect(0,0,300,600);
 const ambient=ctx.createRadialGradient(150,250,0,150,250,360);ambient.addColorStop(0,'#09304430');ambient.addColorStop(1,'#070d1800');ctx.fillStyle=ambient;ctx.fillRect(0,0,300,600);
 ctx.strokeStyle='#1a7a9227';ctx.lineWidth=.6;ctx.beginPath();for(let x=0;x<=300;x+=30){ctx.moveTo(x,0);ctx.lineTo(x,600);}for(let y=0;y<=600;y+=30){ctx.moveTo(0,y);ctx.lineTo(300,y);}ctx.stroke();
 ctx.fillStyle='#47859b30';for(let x=30;x<300;x+=60)for(let y=30;y<600;y+=60)ctx.fillRect(x-1,y-1,2,2);
 dropTrails=dropTrails.filter(trail=>trail.life>0);for(const trail of dropTrails){trail.life-=dt;ctx.globalAlpha=Math.max(0,trail.life/210)*.35;const gradient=ctx.createLinearGradient(0,trail.y,0,trail.end);gradient.addColorStop(0,trail.color+'00');gradient.addColorStop(1,trail.color);ctx.fillStyle=gradient;ctx.fillRect(trail.x+2,trail.y,26,trail.end-trail.y);}ctx.globalAlpha=1;
 if(game.status==='ready'){demoRows.forEach((row,y)=>row.forEach((type,x)=>{if(type)block(ctx,x*30,(y+14)*30,30,COLORS[type]);}));}
 else{game.board.forEach((row,y)=>row.forEach((type,x)=>{if(type)block(ctx,x*30,y*30,30,COLORS[type]);}));if(game.active&&game.status!=='over'){drawPiece(ctx,game.active,game.ghostY(),true);drawPiece(ctx,game.active);}}
 if(flash>0){ctx.fillStyle=`rgba(5,238,245,${flash/440})`;flashRows.forEach(row=>ctx.fillRect(0,row*30,300,30));flash-=dt;}
 particles=particles.filter(p=>p.life>0);for(const p of particles){p.life-=dt;p.x+=p.vx*dt/1000;p.y+=p.vy*dt/1000;p.vy+=160*dt/1000;ctx.globalAlpha=Math.max(0,Math.min(1,p.life/400));ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=8;ctx.fillRect(p.x,p.y,3,3);}ctx.shadowBlur=0;ctx.globalAlpha=1;
}
function preview(id,type,dim=false){const element=$(id),c=element.getContext('2d');c.clearRect(0,0,element.width,element.height);if(!type)return;const matrix=SHAPES[type];const cells=[];matrix.forEach((r,y)=>r.forEach((v,x)=>{if(v)cells.push([x,y]);}));const minX=Math.min(...cells.map(p=>p[0])),maxX=Math.max(...cells.map(p=>p[0])),minY=Math.min(...cells.map(p=>p[1])),maxY=Math.max(...cells.map(p=>p[1]));const size=27,offsetX=(element.width-(maxX-minX+1)*size)/2,offsetY=(element.height-(maxY-minY+1)*size)/2;c.globalAlpha=dim?.35:1;cells.forEach(([x,y])=>block(c,offsetX+(x-minX)*size,offsetY+(y-minY)*size,size,COLORS[type]));c.globalAlpha=1;}
function text(id,value){if(uiCache[id]!==value){$(id).textContent=value;uiCache[id]=value;}}
function updateUI(){
 if(game.score>best){best=game.score;safeWrite('blok-best',best);}
 text('score',String(game.score).padStart(6,'0'));text('best-score',best.toLocaleString('tr-TR'));text('level',String(game.level).padStart(2,'0'));text('lines',String(game.lines).padStart(2,'0'));
 const progress=game.lines%10;text('level-progress-label',`${progress} / 10`);$('progress-fill').style.width=`${progress*10}%`;
 const sec=Math.floor(game.elapsed/1000);text('session-time',`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`);
 const previewKey=`${game.held}:${game.canHold}:${game.next.slice(0,3).join('')}`;
 if(uiCache.preview!==previewKey){uiCache.preview=previewKey;preview('hold-canvas',game.held,!game.canHold);$('hold-empty').hidden=!!game.held;$('hold-canvas').setAttribute('aria-label',`Saklanan parça: ${game.held?names[game.held]:'boş'}`);game.next.slice(0,3).forEach((type,i)=>{preview(`next-${i}`,type);$(`next-${i}`).setAttribute('aria-label',`Sıradaki ${i+1}. parça: ${names[type]}`);});}
}
function updateOverlay(){
 const status=game.status;overlay.hidden=status==='playing';$('pause-button').disabled=status==='ready'||status==='over';$('pause-button').setAttribute('aria-label',status==='paused'?'Oyuna devam et':'Oyunu duraklat');$('pause-button').title=status==='paused'?'Devam et (P)':'Duraklat (P)';$('pause-button').querySelector('use').setAttribute('href',status==='paused'?'#i-play':'#i-pause');
 $('status-dot').className=`status-dot ${status}`;text('game-status',({ready:'OYUNA HAZIR',playing:'OYUN DEVAM EDİYOR',paused:'KÜÇÜK BİR MOLA',over:'OYUN BİTTİ'})[status]);
 if(status==='paused'){text('overlay-eyebrow','SİNYAL BEKLENİYOR // DURAKLATILDI');text('overlay-title','Kısa devre.');$('overlay-description').innerHTML='Şehir bekliyor. Bloklar da.<br>Hazır olduğunda yeniden bağlan.';text('start-label','Devam et');$('start-hint').innerHTML='ya da <kbd>P</kbd> tuşuna bas';}
 else if(status==='over'){text('overlay-eyebrow',game.score>previousBest?'YENİ REKOR // SİSTEM AŞILDI':'BAĞLANTI SONLANDI // TEKRAR DENE');text('overlay-title','Bir tur daha?');$('overlay-description').innerHTML=`<strong class="final-score">${game.score.toLocaleString('tr-TR')}</strong><br>${game.lines} satır · ${game.level}. seviye`;text('start-label','Yeniden oyna');$('start-hint').innerHTML='ya da <kbd>ENTER</kbd> tuşuna bas';}
}
function start(){heldKeys.clear();particles=[];dropTrails=[];flash=0;sessionGeneration++;clearTimeout(toastTimer);previousBest=best;$('board-toast').classList.remove('show');game.start();$('start-button').blur();updateOverlay();updateUI();}
function pauseToggle(){heldKeys.clear();if(game.status==='playing')game.pause();else if(game.status==='paused')game.resume();updateOverlay();}
function action(name){if(game.status!=='playing')return;({left:()=>game.move(-1),right:()=>game.move(1),rotate:()=>game.rotate(),reverse:()=>game.rotate(-1),down:()=>game.down(true),drop:()=>game.hardDrop(),hold:()=>game.hold()})[name]?.();updateUI();}
$('start-button').addEventListener('click',()=>{if(game.status==='paused')pauseToggle();else start();});
$('restart-button').addEventListener('click',start);
$('pause-button').addEventListener('click',pauseToggle);
function updateSound(){$('sound-button').setAttribute('aria-pressed',String(soundEnabled));$('sound-button').querySelector('use').setAttribute('href',soundEnabled?'#i-sound':'#i-muted');$('sound-button').querySelector('span').textContent=soundEnabled?'Ses açık':'Ses kapalı';}
$('sound-button').addEventListener('click',()=>{soundEnabled=!soundEnabled;safeWrite('blok-sound',soundEnabled);updateSound();tone(523,.1);});updateSound();
$('help-button').addEventListener('click',()=>{wasPlayingBeforeHelp=game.status==='playing';if(wasPlayingBeforeHelp){game.pause();heldKeys.clear();updateOverlay();}dialog.showModal();});
$('close-help').addEventListener('click',()=>dialog.close());$('got-it').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>{if(wasPlayingBeforeHelp){game.resume();updateOverlay();}wasPlayingBeforeHelp=false;});
const keyActions={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'rotate',ArrowDown:'down',' ':'drop',c:'hold',C:'hold',x:'rotate',X:'rotate',z:'reverse',Z:'reverse'};
document.addEventListener('keydown',e=>{
 if(dialog.open||e.ctrlKey||e.metaKey||e.altKey)return;
 if((e.key==='Enter'||(e.key===' '&&game.status!=='playing'))&&e.target.closest('button,a'))return;
 if(['p','P','Escape'].includes(e.key)){e.preventDefault();if(!e.repeat)pauseToggle();return;}
 if(e.key==='Enter'&&(game.status==='ready'||game.status==='over')){e.preventDefault();if(!e.repeat)start();return;}
 const name=keyActions[e.key];if(!name)return;e.preventDefault();if(e.repeat)return;
 if(game.status!=='playing')return;action(name);if(['left','right','down'].includes(name))heldKeys.set(e.code,{action:name,clock:0,delay:name==='down'?45:150});
});
document.addEventListener('keyup',e=>heldKeys.delete(e.code));
for(const button of document.querySelectorAll('[data-action]')){
 button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);const name=button.dataset.action;action(name);if(['left','right','down'].includes(name))heldKeys.set(`touch-${e.pointerId}`,{action:name,clock:0,delay:name==='down'?45:150});});
 const release=e=>heldKeys.delete(`touch-${e.pointerId}`);button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);button.addEventListener('contextmenu',e=>e.preventDefault());
 // Keyboard and assistive-technology activation also works on touch controls.
 button.addEventListener('click',e=>{if(e.detail===0)action(button.dataset.action);});
}
function autoPause(){heldKeys.clear();if(game.pause())updateOverlay();}
window.addEventListener('blur',autoPause);document.addEventListener('visibilitychange',()=>{if(document.hidden)autoPause();});
function frame(timestamp){const dt=lastFrame?Math.min(100,timestamp-lastFrame):0;lastFrame=timestamp;
 if(game.status==='playing'){for(const key of heldKeys.values()){key.clock+=dt;while(key.clock>=key.delay){key.clock-=key.delay;key.delay=key.action==='down'?40:55;action(key.action);if(game.status!=='playing')break;}}game.tick(dt);updateUI();}
 render(dt);requestAnimationFrame(frame);
}
updateUI();updateOverlay();requestAnimationFrame(frame);
