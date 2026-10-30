import {TideGame,TIDE_COLS,TIDE_ROWS,TIDE_SIZE,TIME_CAP_MS,CHAIN_MS,FEVER_MS,FEVER_COST,POWER_CAPS,GAME_MODES,DEFAULT_GAME_MODE,STAGE_BREAK_MS,TUTORIAL_FROM,dailyKey,tideNeighbors,swipeTarget,powerCells} from './arcade-engine.mjs';
import {createBoardRenderer} from './board.mjs';
import {ARCADE_MESSAGES} from './arcade-copy.mjs';
import {LANGUAGES,normalizeLanguage} from './locales.mjs';
import {flowTempo} from './sound.mjs';
import {CelebrationDirector,CHEER_PHRASES} from './cheers.mjs';
import {MODE_RULES,runPressure,reminderPower} from './run-ui.mjs';
import {MENU_MODES,menuMode,homeRecord} from './home-mode.mjs';

const COPY=ARCADE_MESSAGES;

export function endingKeys(game){return game.reason==='overflow'?{title:'overLimit',copy:game.endDetails?.source==='manual'?'overflowManual':'overflowAuto',reason:'whyOverflow',hint:game.mode==='ascend'?'ascendNoTime':'overflowTip'}:{title:game.mode==='timeRush'?'timeRushOver':game.mode==='blitz'?'complete60':'complete90',copy:game.mode==='timeRush'?'clockDrained':'timedCompleteCopy',reason:'whyTime',hint:game.mode==='daily'?'dailyRestart':'normalRestart'};}

export function recordKey(mode){return mode==='daily'?'shapes1-daily':'best-shapes1-'+(GAME_MODES.includes(mode)?mode:'survival');}

export function tideTranslate(language,key,values={}){let text=(COPY[language]||COPY.tr)[key]??COPY.tr[key]??key;for(const [name,value]of Object.entries(values))text=text.replaceAll('{'+name+'}',String(value));return text;}
const ICONS={shuffle:'<path d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 3-2 4-4m4-4c1-2 2-4 4-4h3m-4-4 4 4-4 4"/>',bomb:'<circle cx="11" cy="14" r="7"/><path d="m15 8 2-3 3 1m-1-4 1 1m-6 3 3 2"/>',cross:'<path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z"/>',rocket:'<path d="M3 9h12V5l7 7-7 7v-4H3m4-10h4M3 19h8"/>',nova:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>'};

const PATTERNS={shuffle:{key:'verticalFourPattern',badge:'4 ↓',cells:[[1,0],[1,1],[1,2],[1,3]]},bomb:{key:'squarePattern',badge:'2×2',cells:[[0,0],[1,0],[0,1],[1,1]]},rocket:{key:'fourPattern',badge:'4 →',cells:[[0,1],[1,1],[2,1],[3,1]]},cross:{key:'crossPattern',badge:'L/T',cells:[[0,0],[0,1],[0,2],[1,2],[2,2]]},nova:{key:'fivePattern',badge:'5 —',cells:[[0,1],[1,1],[2,1],[3,1],[4,1]]}};
function patternGlyph(power){return `<svg class="match-shape" viewBox="${power==='shuffle'?'0 0 30 40':'0 0 50 30'}" aria-hidden="true">${PATTERNS[power].cells.map(([x,y])=>`<rect x="${x*10+1}" y="${y*10+1}" width="8" height="8" rx="2"/>`).join('')}</svg>`;}
const MODE_ICONS={ascend:'<path d="M3 20h6v-6h6V8h6M16 3h5v5"/>',survival:'<path d="M3 20h18M3 14h5m3 0h10M3 8h18m-9-5v7m-3-3 3 3 3-3"/>',timeRush:'<circle cx="11" cy="13" r="8"/><path d="M8 2h6m-3 7v4l3 2m5-12v6m-3-3h6"/>',daily:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 2v6m10-6v6M3 10h18m-9 3 1.4 2.6 3 .5-2.2 2.1.5 2.8-2.7-1.4-2.7 1.4.5-2.8-2.2-2.1 3-.5z"/>',relax:'<path d="M20 3C8 2 3 6 4 13c1 7 9 8 13 2 2-3 3-7 3-12ZM3 22 16 8"/>'};
export function powerGuideHTML(language){return Object.keys(POWER_CAPS).map(power=>`<article class="power-entry" data-reward="${power}"><svg class="power-guide-icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[power]}</svg><div><strong>${tideTranslate(language,power)}</strong><small>${tideTranslate(language,PATTERNS[power].key)}</small><p>${tideTranslate(language,power+'Help')}</p></div></article>`).join('');}
export function modeGuideHTML(language){return MENU_MODES.map(mode=>`<article class="mode-entry"><svg viewBox="0 0 24 24" aria-hidden="true">${MODE_ICONS[mode]}</svg><div><strong>${tideTranslate(language,mode)}</strong><p>${tideTranslate(language,'modeShort'+mode)}</p></div></article>`).join('');}

export function createTide({root,audio,avatar,personName,colors,getLanguage,read,write,initialMode=DEFAULT_GAME_MODE,onModeChange,onPlaying,onMenuAction}){
 const nodes=new Map(),$=id=>{if(!nodes.has(id))nodes.set(id,root.querySelector('#'+id));return nodes.get(id);},t=(key,values)=>tideTranslate(getLanguage(),key,values),escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const formatters=Object.fromEntries(Object.entries(LANGUAGES).map(([key,value])=>[key,new Intl.NumberFormat(value.locale)])),number=value=>formatters[normalizeLanguage(getLanguage())].format(Math.floor(value));
 const clock=value=>{const seconds=Math.ceil(Math.max(0,value)/1000);return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');};
 const safeScore=value=>Number.isFinite(value)?Math.min(9e12,Math.max(0,Math.floor(value))):0;
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches,celebrations=new CelebrationDirector();
 let lastNoticeText='',lastNoticeAt=-Infinity,cheerTickAt=0,cheerTimer=0,homeOpen=true,homeView='landing',previewMode=menuMode(initialMode),lastTimeSecond=null,lastReminder=0,reminderTimer=0;
 let active=false,selectedMode=menuMode(initialMode),game,aim=TUTORIAL_FROM,selected=null,powerMode=null,gesture=null,toastTimer=0,lastLevel=1,lastDanger=false,lastTarget=1000,newRecord=false,currentHint=null,idleHint=false,lastAction=0,runBest=0,bestCelebrated=false,floatTimer=0,hudAt=-Infinity,portraits=[],storedBest=0,storedStage=1,stageView=null,stageLanguage=null,lastStageCount=null;
 root.innerHTML=`<section class="tide-home" id="tide-home" aria-labelledby="home-heading">
  <div class="home-landing" id="home-landing">
   <header class="home-hero"><img class="home-brand-mark" src="./assets/popzuno-mark.png" width="160" height="160" alt=""><h1 class="home-wordmark" id="home-heading">Pop<span>zuno</span></h1><p data-tide="homeSub"></p></header>
   <div class="home-primary"><button type="button" class="primary-button" id="home-play"><svg aria-hidden="true"><use href="#icon-play"/></svg><span data-tide="homePlay"></span></button><p id="home-challenge"></p></div>
   <button type="button" class="home-people" data-home-action="family"><span class="home-people-faces" aria-hidden="true">${[0,1,2].map(i=>`<img data-home-portrait="${i}" src="${avatar(i)}" alt="">`).join('')}</span><span><b data-tide="homeFamily"></b><small data-tide="homePeopleNote"></small></span><span aria-hidden="true">›</span></button>
   <nav class="home-tools">${['settings','help'].map(type=>`<button type="button" data-home-action="${type}" data-tide="${type==='settings'?'homeSettings':'homeHelp'}"></button>`).join('')}</nav>
  </div>
  <section class="home-picker" id="home-picker" aria-labelledby="home-picker-title" hidden>
   <header class="home-picker-head"><button type="button" id="home-back" class="icon-button"><span aria-hidden="true">←</span><span class="sr-only" data-tide="homeMenu"></span></button><h2 id="home-picker-title" data-tide="chooseMode"></h2></header>
   <div class="home-modes" role="group" aria-labelledby="home-picker-title">${MENU_MODES.map(mode=>`<button type="button" data-tide-mode="${mode}" aria-pressed="${mode===previewMode}"><svg viewBox="0 0 24 24" aria-hidden="true">${MODE_ICONS[mode]}</svg><span data-tide="${mode}"></span><b class="mode-selected-mark" aria-hidden="true">✓</b></button>`).join('')}</div>
   <section class="home-detail" aria-live="polite"><h3 id="home-mode-title" class="sr-only"></h3><p id="home-mode-copy"></p></section>
   <button type="button" class="primary-button" id="home-start"></button>
  </section>
 </section><div class="tide-layout" id="tide-game" hidden>
  <aside class="tide-story"><span class="eyebrow" data-tide="label"></span><h1 data-tide="title"></h1><p data-tide="intro"></p><div class="tide-story-portraits"></div><ol><li data-tide="step1"></li><li data-tide="step2"></li><li data-tide="step3"></li></ol><small data-tide="tutorial"></small></aside>
  <section class="tide-cabinet" aria-label="Popzuno">
   <div class="tide-run-nav"><button type="button" id="tide-menu" data-tide="menuShort"></button><span id="tide-run-mode"></span><div class="tide-row-queue" id="tide-row-queue"><span id="tide-row-label"></span><div><i id="tide-row-fill"></i></div></div></div>
   <div class="tide-hud"><div class="tide-score-stat"><span data-tide="score"></span><strong id="tide-score">0</strong><div class="tide-float" id="tide-float" aria-hidden="true"></div></div><div class="tide-small-stat"><span id="tide-best-label"></span><b id="tide-best">0</b></div><div class="tide-small-stat tide-clock-stat"><span id="tide-clock-label"></span><b id="tide-clock" role="timer" aria-live="off">01</b><small id="tide-tempo"></small><div class="time-meter" aria-hidden="true"><i id="tide-time-fill"></i></div></div><button id="tide-pause" class="icon-button" disabled><svg><use href="#icon-pause"/></svg></button></div>
   <div class="tide-fever-row"><button type="button" id="tide-fever-info"><span id="tide-fever-label"></span><b aria-hidden="true">?</b></button><div><i id="tide-fever-fill"></i></div><b id="tide-combo">×1</b></div>
   <div class="tide-stage-row" id="tide-stage-row" hidden><span id="tide-stage-title"></span><div><i id="tide-stage-fill"></i></div><strong id="tide-stage-progress"></strong></div>
   <div class="tide-status-bar" id="tide-status-bar"><span id="tide-danger" role="status" aria-live="polite"></span><div class="tide-notice" id="tide-notice" role="status" aria-live="polite"></div><div class="tide-cheer" id="tide-cheer" aria-hidden="true"></div></div>
   <div class="tide-board-slot"><div class="tide-arena" id="tide-arena"><div class="tide-danger-zone" aria-hidden="true"></div><div class="tide-aim-aura" aria-hidden="true"></div><div class="tide-ceiling"><b class="tide-limit-label" data-tide="topLimit"></b></div><div class="tide-stack" id="tide-stack"><div class="tide-grid" id="tide-grid" role="group" tabindex="0"></div><div class="tide-next" id="tide-next" aria-hidden="true"></div></div><div class="tide-effects" id="tide-effects" aria-hidden="true"></div><div class="tide-chain-clock"><i id="tide-chain-fill"></i></div>
    <div class="tide-overlay" id="tide-overlay"><div class="tide-demo swipe-demo" id="tide-demo" aria-hidden="true"></div><span class="eyebrow" id="tide-overlay-tag"></span><span class="end-emblem" id="tide-end-emblem" hidden aria-hidden="true"></span><h2 id="tide-overlay-title"></h2><p id="tide-overlay-copy"></p><div id="tide-end-reason" class="tide-end-reason" hidden></div><small id="tide-loss-rule" class="tide-loss-rule" hidden></small><div id="tide-reward-legend" class="tide-reward-legend"></div><strong id="tide-result" hidden></strong><div id="tide-result-details" class="tide-result-details" hidden></div><button class="primary-button" id="tide-start"></button><div class="tide-result-actions"><button class="secondary-button" id="tide-result-menu" data-tide="homeMenu" hidden></button><button class="secondary-button" id="tide-share" hidden></button></div><small id="tide-overlay-foot"></small></div>
    <div class="tide-wave-banner" id="tide-wave-banner" hidden role="group" aria-labelledby="tide-stage-heading">
     <p class="stage-complete"><span aria-hidden="true">✓</span><b id="tide-stage-complete"></b></p>
     <span class="stage-next-label" data-tide="nextStage"></span><h2 id="tide-stage-heading"></h2>
     <div class="stage-stats"><div><small data-tide="stageGoal"></small><strong id="tide-stage-goal"></strong></div><div><small data-tide="stageTempo"></small><strong id="tide-stage-bpm"></strong></div></div>
     <p class="stage-pressure" id="tide-stage-pressure"></p><div class="stage-gift"><svg id="tide-stage-gift-icon" viewBox="0 0 24 24" aria-hidden="true"></svg><span id="tide-stage-gift"></span></div>
     <div class="stage-count"><span id="tide-stage-starting"></span><b id="tide-stage-count" aria-hidden="true"></b></div><div class="stage-break-track" aria-hidden="true"><i id="tide-stage-timer"></i></div>
    </div><div class="sr-only" id="tide-stage-announcement" role="status" aria-live="polite"></div>
   </div></div>
   <div class="tide-bottom"><div class="tide-powertray">${Object.keys(POWER_CAPS).map((power,i)=>`<button data-power="${power}" aria-pressed="false"><svg viewBox="0 0 24 24">${ICONS[power]}</svg><b id="power-${power}">0</b><span>${t(power)}<small>${PATTERNS[power].badge}</small></span></button>`).join('')}</div><button id="tide-raise"><svg><use href="#icon-arrow"/></svg><span data-tide="raise"></span><b data-tide="bonus"></b></button></div>
   <p class="tide-rule" id="tide-rule"></p><span class="tide-date" id="tide-date"></span>
  </section>
  <aside class="tide-rival"><span class="eyebrow" data-tide="target"></span><strong id="tide-target">1.000</strong><p data-tide="rival"></p><div class="tide-target-track"><i id="tide-target-fill"></i></div><div class="tide-power-guide">${Object.keys(POWER_CAPS).map((power,i)=>`<div>${patternGlyph(power)}<svg viewBox="0 0 24 24">${ICONS[power]}</svg><p data-tide="${power}Help"></p></div>`).join('')}</div><small data-tide="local"></small></aside>
 </div><dialog class="panel-dialog tide-share-dialog" id="tide-share-dialog"><h2 data-tide="shareTitle"></h2><p data-tide="shareFallback"></p><textarea id="tide-share-text" readonly></textarea><button id="tide-share-close" class="primary-button" data-tide="close"></button></dialog>`;
 const resultLayer=document.createElement('div');resultLayer.className='tide-result-layer';resultLayer.hidden=true;document.body.append(resultLayer);const shell=document.querySelector('.app-shell');
 function syncResultLayer(){const show=active&&game?.status==='over'&&!homeOpen,overlay=$('tide-overlay'),host=show?resultLayer:$('tide-arena');if(overlay.parentElement!==host)host.append(overlay);resultLayer.hidden=!show;if(shell)shell.toggleAttribute('inert',show);overlay.setAttribute('role',show?'dialog':'group');overlay.setAttribute('aria-labelledby','tide-overlay-title');if(show)overlay.setAttribute('aria-modal','true');else overlay.removeAttribute('aria-modal');}
 const native=(type,extra={})=>globalThis.webkit?.messageHandlers?.bulusko?.postMessage({type,...extra});
 function dailyRecord(){const value=read(recordKey('daily'),{});return value&&value.day===game.day?safeScore(value.score):0;}
 function loadRecords(){storedBest=selectedMode==='daily'?dailyRecord():safeScore(read(recordKey(selectedMode),0));storedStage=Math.max(1,Math.min(9999,Math.floor(Number(read('shapes1-top-stage',1))||1)));}
 function best(){return storedBest;}
 function topStage(){return storedStage;}
 function saveRecord(){
  if(game.score>best()){
   const old=selectedMode==='daily'?read(recordKey('daily'),{}):null;
   if(selectedMode!=='daily'||!old?.day||old.day<=game.day){const saved=write(recordKey(selectedMode),selectedMode==='daily'?{day:game.day,score:game.score}:game.score);if(!saved)toast(t('saveError'));else storedBest=game.score;}
  }
  if(selectedMode==='ascend'&&game.wave>topStage()&&write('shapes1-top-stage',game.wave))storedStage=game.wave;
 }
 function signalPlaying(){onPlaying?.(!homeOpen&&game.status==='playing');native('state',{playing:active&&!homeOpen&&game.status==='playing'});}
 function toast(message,force=false){const now=performance.now();if(!force&&message===lastNoticeText&&now-lastNoticeAt<4000)return;lastNoticeText=message;lastNoticeAt=now;$('tide-notice').textContent=message;$('tide-notice').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('tide-notice').classList.remove('show'),1700);}
 function replay(node,frames,duration){if(reducedMotion||!node.animate)return;for(const animation of node.getAnimations())animation.cancel();node.animate(frames,{duration,easing:'ease-out'});}
 function floatScore(text){$('tide-float').textContent=text;$('tide-float').classList.remove('show');$('tide-float').classList.add('show');replay($('tide-float'),[{opacity:0},{opacity:1,offset:.2},{opacity:1,offset:.7},{opacity:0}],700);clearTimeout(floatTimer);floatTimer=setTimeout(()=>$('tide-float').classList.remove('show'),800);}
 function celebrate(cue=celebrations.peek()){if(selectedMode==='relax'){celebrations.clear();return;}if(!cue||game.status!=='playing')return;const voiced=audio.cheer(cue.kind);if(!voiced&&audio.enabled&&audio.cheers&&audio.volume&&audio.cheerVolume)return;celebrations.commit(cue);const node=$('tide-cheer');node.textContent=CHEER_PHRASES[cue.kind].toUpperCase();node.dataset.tier=cue.priority>=80?4:cue.priority>=40?3:2;node.classList.add('show');replay(node,[{opacity:0},{opacity:1,offset:.2},{opacity:1,offset:.75},{opacity:0}],1000);clearTimeout(cheerTimer);cheerTimer=setTimeout(()=>node.classList.remove('show'),1100);}
 function resetCelebration(clearPending=true){clearTimeout(reminderTimer);for(const button of root.querySelectorAll('.bonus-remind'))button.classList.remove('bonus-remind');if(clearPending)celebrations.clear();clearTimeout(cheerTimer);$('tide-cheer').classList.remove('show');}
 function onEvent(event){
  if(event.type==='start'){audio.effect('start');native('feedback',{event:'start',count:1});return;}
  if(event.type==='swap'){selected=null;gesture=null;idleHint=false;lastAction=game.elapsed;audio.effect('rotate');native('feedback',{event:'rotate',count:1});renderBoard([{from:event.to,to:event.from},{from:event.from,to:event.to}]);return;}
  if(event.type==='reject'){selected=null;gesture=null;audio.effect('select');renderBoard();for(const index of [event.from,event.to])root.querySelector(`[data-tide-cell="${index}"]`)?.classList.add('rejected');toast(t('miss'));return;}
  if(event.type==='clear'){
   celebrations.offer(event);
   audio.effect('clear',event.count);native('feedback',{event:'clear',count:selectedMode==='relax'?1:event.count});if(!globalThis.webkit&&navigator.vibrate)navigator.vibrate(selectedMode==='relax'?12:12+event.count*15);
   renderBoard();popEffects(event);floatScore((event.stage>1?'↯'+event.stage+'  ':event.combo>1?'×'+event.combo+'  ':'')+'+'+number(event.points)+(event.timeAdded?' · '+t('timeGain',{seconds:formatters[normalizeLanguage(getLanguage())].format(event.timeAdded/1000)}):''));return;
  }
  if(event.type==='bonus'){toast(t(event.granted?'earned':'full',{power:t(event.power)}));if(event.granted){celebrations.offer(event);audio.effect('earn-'+event.power);rewardEffect(event.power,event.cells);}updateHUD();return;}
  if(event.type==='fever'){audio.effect('pulse',2);native('feedback',{event:'pulse',count:2});toast(t('feverActive'));return;}
  if(event.type==='power'){
   celebrations.offer(event);celebrate();
   powerMode=null;selected=null;gesture=null;idleHint=false;lastAction=game.elapsed;audio.effect(event.power);native('feedback',{event:'pulse',count:selectedMode==='relax'?1:event.count});renderBoard();powerEffect(event);toast(t('powerUsed',{power:t(event.power),points:number(event.points)}));return;
  }
  if(event.type==='shuffle-failed'){toast(t('shuffleFailed'));return;}
  if(event.type==='shuffle'){
   powerMode=null;selected=null;gesture=null;idleHint=false;lastAction=game.elapsed;audio.effect('shuffle');native('feedback',{event:'rotate',count:1});renderBoard(event.moves,event);if(!reducedMotion)addEffect('shuffle-orbit','',`<svg viewBox="0 0 24 24">${ICONS.shuffle}</svg>`,650);toast(t('shuffleUsed'));return;
  }
  if(event.type==='fall'){renderBoard(event.moves);return;}
  if(event.type==='refill'){celebrate();renderBoard(event.moves,event);if(event.regenerated)toast(t('newBoard'));return;}
  if(event.type==='wave'){
   celebrate();resetCelebration(false);
   selected=null;gesture=null;powerMode=null;idleHint=false;lastAction=game.elapsed;lastLevel=game.wave;clearTimeout(toastTimer);$('tide-notice').classList.remove('show');saveRecord();audio.effect('stage');native('feedback',{event:'pulse',count:2});renderBoard();
   $('tide-stage-announcement').textContent=t('stageComplete',{stage:event.previousWave})+'. '+t('stageUp',{stage:event.wave})+'. '+t('stageTarget',{count:event.target});if(event.granted){celebrations.offer(event);celebrate();audio.effect('earn-'+event.power);rewardEffect(event.power,[]);}return;
  }
  if(event.type==='wave-ready'){lastAction=game.elapsed;audio.effect('stage-ready');native('feedback',{event:'start',count:1});renderBoard();$('tide-stage-announcement').textContent=t('stageStarted',{stage:event.wave});return;}
  if(event.type==='settled'){renderBoard();celebrate();return;}
  if(event.type==='rise'){selected=null;gesture=null;powerMode=null;if(event.manual)audio.effect('place');renderBoard();if(!reducedMotion)addEffect('row-arrival','', '',360);return;}
  if(event.type==='over'){
   resetCelebration();
   newRecord=game.score>runBest;saveRecord();
   gesture=null;selected=null;powerMode=null;audio.setPlaying(false);audio.effect(event.reason==='time'?'win':'over');native('feedback',{event:'over',reason:event.reason==='time'?'complete':'overflow',count:1});renderBoard();renderOverlay();$('tide-stage-announcement').textContent=t(endingKeys(game).reason)+'. '+t(endingKeys(game).copy);signalPlaying();$('tide-start').focus({preventScroll:true});
  }
 }
 game=new TideGame({onEvent,mode:selectedMode});loadRecords();
 const boardView=createBoardRenderer({grid:$('tide-grid'),next:$('tide-next'),columns:TIDE_COLS,rows:TIDE_ROWS,colors,reducedMotion});
 root.style.setProperty('--grid-cols',TIDE_COLS);root.style.setProperty('--grid-rows',TIDE_ROWS);root.style.setProperty('--grid-ratio',TIDE_COLS/TIDE_ROWS);
 function renderBoard(moves=[],motion={}){
  currentHint=(game.swaps===0||idleHint)&&!game.busy?game.hint():null;
  boardView.render({board:game.board,nextRow:game.nextRow,portraits,hint:currentHint,disabled:game.status!=='playing'||game.busy,moves,duration:motion.duration,stagger:motion.stagger,paused:game.status==='paused',label(family,index,hint){
   const direction=hint?(hint.to-hint.from===1?'right':hint.to-hint.from===-1?'left':hint.to-hint.from===TIDE_COLS?'down':'up'):null;
   return t(family===null?'empty':'cell',{name:family===null?'':personName(family),row:Math.floor(index/TIDE_COLS)+1,col:index%TIDE_COLS+1})+(hint?', '+t('hint',{direction:t(direction)}):'');
  }});
  $('tide-grid').setAttribute('aria-label',t('rule'));for(const node of root.querySelectorAll('[data-tide-cell]'))node.classList.toggle('overflow-cell',game.reason==='overflow'&&Boolean(game.endDetails?.cells?.includes(Number(node.dataset.tideCell))));markTargets();updateHUD();
 }
 function markTargets(hover=null){$('tide-arena').dataset.aim=powerMode||'';boardView.mark({selected,neighbours:selected===null?[]:tideNeighbors(selected),targets:powerMode?powerCells(game.board,powerMode,hover??selected):[]});$('tide-arena').classList.toggle('targeting-power',powerMode!==null);}
 function popEffects(event){
  if(reducedMotion)return;const layer=$('tide-effects');for(const index of event.cells.slice(0,12)){const piece=document.createElement('i');piece.className='tide-burst';piece.style.cssText=`left:${(index%TIDE_COLS+.5)/TIDE_COLS*100}%;top:${(Math.floor(index/TIDE_COLS)+.5)/TIDE_ROWS*100}%;--face:${colors[event.family]};--twist:${index%2?35:-35}deg`;layer.append(piece);setTimeout(()=>piece.remove(),650);}

 }
 function addEffect(className,css='',html='',life=850,parent=$('tide-effects')){
  const effect=document.createElement('i');effect.className=className;effect.style.cssText=css;effect.setAttribute('aria-hidden','true');effect.innerHTML=html;parent.append(effect);setTimeout(()=>effect.remove(),life);return effect;
 }
 function rewardEffect(power,cells=[]){
  const button=root.querySelector(`[data-power="${power}"]`);button.classList.remove('just-earned');button.classList.add('just-earned');replay(button,[{transform:'scale(1)'},{transform:'scale(1.12)',offset:.3},{transform:'scale(1)'}],650);setTimeout(()=>button.classList.remove('just-earned'),750);
  if(reducedMotion)return;
  const arena=$('tide-arena').getBoundingClientRect(),target=button.getBoundingClientRect(),point=cells.length?{x:cells.reduce((sum,i)=>sum+i%TIDE_COLS+.5,0)/cells.length/TIDE_COLS,y:cells.reduce((sum,i)=>sum+Math.floor(i/TIDE_COLS)+.5,0)/cells.length/TIDE_ROWS}:{x:.5,y:.5};
  const x=arena.left+arena.width*point.x,y=arena.top+arena.height*point.y;
  addEffect('tide-reward-flight',`left:${x}px;top:${y}px;--flight-x:${target.left+target.width/2-x}px;--flight-y:${target.top+target.height/2-y}px`,`<svg viewBox="0 0 24 24">${ICONS[power]}</svg>`,800,root);
 }
 function powerEffect(event){
  const point=event.index??event.cells[0],x=(point%TIDE_COLS+.5)/TIDE_COLS*100,y=(Math.floor(point/TIDE_COLS)+.5)/TIDE_ROWS*100;
  if(selectedMode==='relax'){addEffect('relax-ripple',`left:${x}%;top:${y}%`, '',700);return;}
  if(reducedMotion){addEffect('power-soft-flash','', '',300);return;}
  if(event.power==='bomb'){
   addEffect('power-blast-core',`left:${x}%;top:${y}%`);addEffect('bomb-shock',`left:${x}%;top:${y}%`);addEffect('bomb-shock',`left:${x}%;top:${y}%;animation-delay:.08s`);
   for(let i=0;i<10;i++){const angle=i/10*Math.PI*2;addEffect('power-shard',`left:${x}%;top:${y}%;--spark-x:${Math.cos(angle)*70}px;--spark-y:${Math.sin(angle)*70}px;--spark-color:#ffc77c`);}
  }else if(event.power==='cross'){
   addEffect('cross-laser laser-horizontal',`top:${y}%;--origin:${x}%`, '',900);addEffect('cross-laser laser-vertical',`left:${x}%;--origin:${y}%`, '',900);addEffect('laser-impact',`left:${x}%;top:${y}%`, '',800);addEffect('bomb-shock cross-shock',`left:${x}%;top:${y}%`, '',850);
  }else if(event.power==='rocket'){
   addEffect('rocket-beam',`top:${y}%`);addEffect('rocket-flight',`top:${y}%;--rocket-distance:${$('tide-arena').getBoundingClientRect().width+80}px`,`<svg viewBox="0 0 24 24">${ICONS.rocket}</svg>`);
   for(let i=0;i<TIDE_COLS;i++)addEffect('rocket-flare',`left:${(i+.5)/TIDE_COLS*100}%;top:${y}%;animation-delay:${i*.025}s`);
  }else{
   addEffect('nova-warp-well','', '',1500);for(let i=0;i<3;i++)addEffect('nova-warp-ring',`--warp-delay:${i*.13}s`, '',1500);
   for(let i=0;i<12;i++)addEffect('nova-streak',`--angle:${i*30}deg;--warp-delay:${i%3*.05}s;--streak-color:${colors[i%colors.length]}`, '',1450);
  }
 }
 function setText(id,value){const node=$(id);if(node.textContent!==String(value))node.textContent=value;}
 function renderStageBreak(){
  const phase=game.phase,visible=phase?.kind==='wave'&&game.status==='playing',banner=$('tide-wave-banner');banner.hidden=!visible;banner.classList.toggle('show',visible);$('tide-arena').classList.toggle('stage-break-active',visible);
  if(phase?.kind!=='wave'){stageView=null;stageLanguage=null;lastStageCount=null;return;}if(!visible)return;
  if(stageView!==phase||stageLanguage!==getLanguage()){
   stageView=phase;stageLanguage=getLanguage();setText('tide-stage-complete',t('stageComplete',{stage:phase.previousWave}));setText('tide-stage-heading',t('stageUp',{stage:phase.wave}));setText('tide-stage-goal',number(phase.target));setText('tide-stage-bpm',Math.round(flowTempo(phase.nextPace))+' BPM');
   const percent=Math.round((phase.previousInterval/game.interval-1)*100);setText('tide-stage-pressure',game.familyCount>phase.previousFamilyCount?t('stageMoreFaces',{count:game.familyCount}):percent>0?t('stageFaster',{percent}):t('stageMastery'));
   $('tide-stage-gift-icon').innerHTML=ICONS[phase.power];setText('tide-stage-gift',t(phase.granted?'gift':'full',{power:t(phase.power)}));
  }
  const count=game.stageCountdown;if(count!==lastStageCount){if(count>0){audio.effect('stage-count',count);native('feedback',{event:'rotate',count:1});}lastStageCount=count;}
  setText('tide-stage-count',count||'✓');setText('tide-stage-starting',t(count?'stageStarting':'stageCelebrate'));$('tide-stage-timer').style.transform=`scaleX(${1-phase.left/STAGE_BREAK_MS})`;
 }
 function paintMotion(){
  renderStageBreak();
  $('tide-row-fill').style.transform=`scaleX(${game.riseProgress})`;
  $('tide-fever-fill').style.transform=`scaleX(${game.feverLeft>0?game.feverLeft/FEVER_MS:game.energy/FEVER_COST})`;
  $('tide-chain-fill').style.transform=`scaleX(${game.chainLeft/CHAIN_MS})`;
 }
 function updateHUD(){
  hudAt=game.elapsed;paintMotion();
  if(root.dataset.mode!==selectedMode)root.dataset.mode=selectedMode;setText('tide-score',number(game.score));setText('tide-best',number(Math.max(best(),game.score)));setText('tide-best-label',t(selectedMode==='daily'?'today':'best'));setText('tide-clock-label',t(game.timed?'time':selectedMode==='ascend'?'stage':'level'));setText('tide-clock',selectedMode==='relax'?'∞':game.timed?clock(game.remaining):String(game.level).padStart(2,'0'));
  const pressure=runPressure(game),cabinet=root.querySelector('.tide-cabinet');cabinet.classList.toggle('is-timed',game.timed);cabinet.dataset.timeRisk=pressure.timeRisk;cabinet.dataset.overflowRisk=pressure.overflowRisk;
  $('tide-time-fill').style.transform=`scaleX(${pressure.timeFraction})`;setText('tide-clock-label',t(selectedMode==='relax'?'relax':pressure.timeRisk==='critical'?'timeUrgent':game.timed?'time':selectedMode==='ascend'?'stage':'level'));
  if(!homeOpen&&game.status==='playing'&&pressure.seconds!==lastTimeSecond){if(pressure.seconds>0&&pressure.seconds<=5)audio.effect('time-count',pressure.seconds);lastTimeSecond=pressure.seconds;}
  const ready=reminderPower(game,lastAction,lastReminder);if(!homeOpen&&ready){lastReminder=game.elapsed;const button=root.querySelector(`[data-power="${ready}"]`);button.classList.add('bonus-remind');clearTimeout(reminderTimer);reminderTimer=setTimeout(()=>button.classList.remove('bonus-remind'),2500);}
  const timeMode=selectedMode==='timeRush';$('tide-stage-row').hidden=selectedMode!=='ascend'&&!timeMode;setText('tide-stage-title',timeMode?t('timeBank'):t('stageTarget',{count:game.waveTarget}));setText('tide-stage-progress',timeMode?t('timeDrain',{rate:formatters[normalizeLanguage(getLanguage())].format(game.timeRate)}):Math.min(game.waveProgress,game.waveTarget)+'/'+game.waveTarget);$('tide-stage-fill').style.width=Math.min(100,timeMode?game.remaining/TIME_CAP_MS*100:game.waveProgress/game.waveTarget*100)+'%';root.querySelector('.tide-cabinet')?.classList.toggle('clock-critical',timeMode&&game.remaining<=8000&&game.status==='playing');
  setText('tide-fever-label',game.feverLeft>0?t('driveActiveShort',{seconds:Math.ceil(game.feverLeft/1000)}):t('fever')+' '+game.energy+'/'+FEVER_COST);$('tide-fever-info').title=t('driveHelp');$('tide-fever-info').setAttribute('aria-label',t('driveTitle')+'. '+t('driveHelp'));$('tide-row-queue').hidden=game.renewing;setText('tide-row-label',t(game.feverLeft>0?'rowHeld':'rowIn',{seconds:pressure.nextRowSeconds}));$('tide-row-queue').setAttribute('aria-label',t('rowGuide'));setText('tide-combo','×'+Math.max(1,game.combo));
  $('tide-arena').classList.toggle('in-fever',game.feverLeft>0);$('tide-arena').classList.toggle('in-danger',game.danger&&game.status==='playing');$('tide-arena').classList.toggle('is-playing',game.status==='playing');$('tide-arena').classList.toggle('is-resolving',game.busy);
  const risk=game.danger&&!game.renewing&&game.status==='playing'&&game.phase?.kind!=='wave';
  setText('tide-danger',risk?(pressure.overflowRisk==='critical'&&game.feverLeft<=0&&!game.busy?t('criticalLimit',{seconds:pressure.nextRowSeconds}):t('nearLimit')): '');$('tide-arena').classList.toggle('overflow-ended',game.status==='over'&&game.reason==='overflow');$('tide-pause').disabled=!['playing','paused'].includes(game.status);$('tide-pause').setAttribute('aria-label',t(game.status==='paused'?'resume':'pause'));$('tide-pause').querySelector('use').setAttribute('href',game.status==='paused'?'#icon-play':'#icon-pause');$('tide-raise').hidden=game.renewing;$('tide-raise').disabled=game.status!=='playing'||game.busy;$('tide-raise').title=t('raiseHint');
  for(const power of Object.keys(POWER_CAPS)){const button=root.querySelector(`[data-power="${power}"]`);setText('power-'+power,game.powers[power]);button.disabled=game.status!=='playing'||game.busy||game.powers[power]===0||(['nova','shuffle'].includes(power)&&game.height===0);button.setAttribute('aria-pressed',String(powerMode===power));button.setAttribute('aria-label',t(power)+', '+game.powers[power]+'/'+POWER_CAPS[power]+'. '+t(power+'Help'));button.title=t(power+'Help');button.classList.toggle('is-charged',game.powers[power]>0);if(!game.powers[power])button.classList.remove('bonus-remind');}
  setText('tide-rule',powerMode?t(powerMode+'Aim'):game.swaps===0&&game.status==='playing'?t('first'):t('rule'));
  const base=Math.max(1000,best()),milestones=[1000,2500,5000,10000,25000,50000,100000,250000,500000,1000000],target=milestones.find(n=>n>Math.max(game.score,base-1))??Math.ceil((Math.max(game.score,base)+1)/1000000)*1000000;setText('tide-target',number(target));$('tide-target-fill').style.width=Math.min(100,game.score/target*100)+'%';
  if(selectedMode!=='ascend'&&active&&game.status==='playing'&&game.score>=lastTarget&&lastTarget>0){toast(t('goalDone'));lastTarget=target;}
  if(active&&game.status==='playing'&&runBest>0&&game.score>runBest&&!bestCelebrated){bestCelebrated=true;toast(t('record'));audio.effect('win');}
  setText('tide-tempo',selectedMode==='relax'?'':Math.round(flowTempo(game.musicPace))+' BPM');setText('tide-date',selectedMode==='daily'?game.day+' · UTC · Shapes 1':selectedMode==='ascend'?t('bestStage')+' '+topStage():'');if(game.level>lastLevel&&game.status==='playing'){lastLevel=game.level;if(selectedMode!=='ascend'){audio.effect('speed');toast(t('level')+' '+String(game.level).padStart(2,'0')+' · '+Math.round(flowTempo(game.musicPace))+' BPM');}}if(game.danger&&!lastDanger&&game.status==='playing'&&!game.renewing){audio.effect('danger');native('feedback',{event:'place',count:1});$('tide-stage-announcement').textContent=t('dangerHeld');}lastDanger=game.danger;
 }
 function renderOverlay(){
  const over=game.status==='over',paused=game.status==='paused';syncResultLayer();$('tide-overlay').dataset.ending=String(over);$('tide-overlay').hidden=game.status==='playing';if(game.status==='playing')return;
  const modeKey=selectedMode==='survival'?'survival':selectedMode,titleKey=selectedMode==='relax'?'relaxTitle':selectedMode==='daily'?'dailyTitle':selectedMode==='blitz'?'blitzTitle':selectedMode==='timeRush'?'timeRushTitle':selectedMode==='ascend'?'ascendTitle':'readyTitle',copyKey=selectedMode==='relax'?'relaxCopy':selectedMode==='daily'?'dailyCopy':selectedMode==='blitz'?'blitzCopy':selectedMode==='timeRush'?'timeRushCopy':selectedMode==='ascend'?'ascendCopy':'readyCopy';
  const ending=endingKeys(game);$('tide-overlay').dataset.reason=game.reason||'';$('tide-overlay').dataset.endKind=game.reason==='time'&&selectedMode!=='timeRush'?'complete':'loss';$('tide-end-emblem').hidden=!over;setText('tide-end-emblem',game.reason==='overflow'?'↑':selectedMode==='timeRush'?'⌛':'✓');$('tide-result-menu').hidden=!over;setText('tide-result-menu',t('homeMenu'));$('tide-end-reason').hidden=!over;$('tide-end-reason').textContent=over?t(ending.reason):'';$('tide-loss-rule').hidden=over||paused||selectedMode!=='ascend';$('tide-loss-rule').textContent=t('risingRule');
  $('tide-overlay-tag').textContent=paused?'POPZUNO':over?(newRecord?t('record'):t('finish')):selectedMode===DEFAULT_GAME_MODE?t('mainMode')+' · '+t(modeKey):t(modeKey);$('tide-overlay-title').textContent=paused?t('paused'):over?t(ending.title):t(titleKey);$('tide-overlay-copy').textContent=paused?t('pausedCopy'):over?t(ending.copy):t(copyKey);
  $('tide-start').textContent=t(paused?'resume':over?'again':'start');$('tide-share').hidden=!over;$('tide-share').textContent=t('share');$('tide-result').hidden=!over;$('tide-result').textContent=number(game.score);$('tide-result-details').hidden=!over;$('tide-result-details').innerHTML=`<span>${t('cleared')}<b>${game.cleared}</b></span><span>${t('maxChain')}<b>×${game.bestCombo}</b></span><span>${t(selectedMode==='ascend'?'stageReached':'duration')}<b>${selectedMode==='ascend'?game.wave:clock(game.elapsed)}</b></span>`;
  $('tide-demo').hidden=over||paused||selectedMode==='timeRush';$('tide-demo').innerHTML=[0,0,1,0].map((family,i)=>`<span class="demo-tile-${i}" style="--face:${colors[family]}"><img src="${avatar(family)}" alt=""></span>`).join('')+'<i>↓</i>';
  $('tide-reward-legend').hidden=over||paused;$('tide-reward-legend').innerHTML=Object.keys(POWER_CAPS).map((power,i)=>`<span data-reward="${power}">${patternGlyph(power)}${t(power)}</span>`).join('');$('tide-overlay-foot').textContent=paused?t('keys'):over?t(ending.hint):t(selectedMode==='relax'?'relaxFoot':selectedMode==='daily'?'dailyFoot':selectedMode==='blitz'?'blitzFoot':selectedMode==='timeRush'?'timeRushFoot':selectedMode==='ascend'?'ascendFoot':over?'normalRestart':'tutorial');
 }
 function clearInput(){gesture=null;selected=null;powerMode=null;markTargets();}
 function start(){lastNoticeText='';lastNoticeAt=-Infinity;celebrations.reset();lastTimeSecond=null;lastReminder=0;resetCelebration();boardView.cancelMotion();clearInput();lastLevel=1;lastDanger=false;newRecord=false;bestCelebrated=false;idleHint=false;lastAction=0;clearTimeout(toastTimer);clearTimeout(floatTimer);$('tide-wave-banner').classList.remove('show');$('tide-float').classList.remove('show');$('tide-notice').classList.remove('show');$('tide-effects').replaceChildren();root.querySelectorAll('.tide-reward-flight').forEach(node=>node.remove());audio.stop();audio.setMode(selectedMode);game.start({mode:selectedMode,day:dailyKey(),seed:Date.now()});loadRecords();runBest=best();lastTarget=Math.max(1000,runBest);audio.setPlaying(true);renderBoard();renderOverlay();signalPlaying();}
 function pause(){resetCelebration();clearInput();if(game.pause()){saveRecord();audio.setPlaying(false);renderBoard();renderOverlay();signalPlaying();return true;}return false;}
 function resume(){if(homeOpen)return false;if(game.resume()){audio.setPlaying(true);renderBoard();renderOverlay();signalPlaying();return true;}return false;}
 function refresh(){portraits=Array.from({length:7},(_,i)=>avatar(i));const guide=document.getElementById('help-patterns');if(guide)guide.innerHTML=powerGuideHTML(getLanguage());const modes=document.getElementById('help-modes');if(modes)modes.innerHTML=modeGuideHTML(getLanguage());for(const node of root.querySelectorAll('[data-tide]'))node.textContent=t(node.dataset.tide);for(const button of root.querySelectorAll('[data-tide-mode]')){button.setAttribute('aria-pressed',String(button.dataset.tideMode===previewMode));if(button.dataset.tideMode===DEFAULT_GAME_MODE)button.setAttribute('aria-label',t('ascend')+' · '+t('mainMode'));}root.querySelector('.tide-story-portraits').innerHTML=[0,1,2,3].map(family=>`<img src="${avatar(family)}" alt="">`).join('');renderBoard();renderOverlay();renderHome();for(const img of root.querySelectorAll('[data-home-portrait]')){const src=avatar(Number(img.dataset.homePortrait));if(img.getAttribute('src')!==src)img.src=src;}}
 function renderHome(){
  syncResultLayer();$('tide-home').hidden=!homeOpen;$('tide-game').hidden=homeOpen;$('home-landing').hidden=homeView!=='landing';$('home-picker').hidden=homeView!=='modes';root.dataset.homeView=homeView;root.classList.toggle('showing-home',homeOpen);if(shell){shell.classList.toggle('run-open',!homeOpen);shell.classList.toggle('home-open',homeOpen);}document.body.classList.toggle('playing-screen',!homeOpen);
  setText('home-mode-title',t(previewMode));setText('home-mode-copy',t('modeShort'+previewMode));
  setText('home-start',t(game.status==='paused'&&previewMode===selectedMode?'homeContinue':game.status==='paused'?'homeNew':'start'));
  const record=homeRecord(read,dailyKey());setText('home-challenge',record?t('homeRecordChallenge',{mode:t(record.mode),score:number(record.score)}):t('homeFirstChallenge'));
  for(const button of root.querySelectorAll('[data-tide-mode]'))button.setAttribute('aria-pressed',String(button.dataset.tideMode===previewMode));
  $('home-back').setAttribute('aria-label',t('homeMenu'));setText('tide-run-mode',t(selectedMode));
 }
 function showPicker(){homeView='modes';renderHome();root.querySelector(`[data-tide-mode="${previewMode}"]`)?.focus({preventScroll:true});}
 function showLanding(){homeView='landing';renderHome();$('home-play').focus({preventScroll:true});}
 function openHome(){pause();homeOpen=true;homeView='landing';previewMode=selectedMode;renderHome();signalPlaying();$('home-play').focus({preventScroll:true});}
 function playHome(){
  const continuing=game.status==='paused'&&previewMode===selectedMode;selectedMode=previewMode;homeOpen=false;renderHome();onModeChange?.();
  window.scrollTo(0,0);if(continuing)resume();else start();
 }
 function selectMode(mode){if(!MENU_MODES.includes(mode))return;previewMode=mode;renderHome();onModeChange?.();}
 function choosePower(power){if(game.status!=='playing'||game.busy||!game.powers[power])return;selected=null;gesture=null;if(power==='nova'||power==='shuffle'){powerMode=null;markTargets();game.usePower(power);updateHUD();return;}powerMode=powerMode===power?null:power;markTargets();updateHUD();if(powerMode){audio.effect('arm-'+power);toast(t(power+'Aim'),true);}}
 function tapCell(index){
  if(game.status!=='playing'||game.busy)return;aim=index;
  if(powerMode){if(game.usePower(powerMode,index))powerMode=null;return;}
  if(selected!==null&&selected!==index&&tideNeighbors(selected).includes(index)){const from=selected;selected=null;game.swap(from,index);return;}
  selected=selected===index||game.board[index]===null?null:index;markTargets();updateHUD();
 }
 $('tide-fever-info').addEventListener('click',()=>onMenuAction?.('overdrive'));$('home-play').addEventListener('click',showPicker);$('home-start').addEventListener('click',playHome);$('home-back').addEventListener('click',showLanding);$('tide-menu').addEventListener('click',openHome);$('tide-result-menu').addEventListener('click',openHome);for(const button of root.querySelectorAll('[data-home-action]'))button.addEventListener('click',()=>onMenuAction?.(button.dataset.homeAction));
 $('tide-start').addEventListener('click',()=>game.status==='paused'?resume():start());$('tide-pause').addEventListener('click',()=>game.status==='playing'?pause():resume());$('tide-raise').addEventListener('click',()=>{clearInput();game.raise(true);});for(const button of root.querySelectorAll('[data-power]'))button.addEventListener('click',()=>choosePower(button.dataset.power));for(const button of root.querySelectorAll('[data-tide-mode]'))button.addEventListener('click',()=>selectMode(button.dataset.tideMode));
 const grid=$('tide-grid');
 grid.addEventListener('pointerdown',event=>{if(event.button!==0||game.status!=='playing'||game.busy)return;const node=event.target.closest('[data-tide-cell]');if(!node)return;event.preventDefault();grid.setPointerCapture(event.pointerId);gesture={pointer:event.pointerId,from:Number(node.dataset.tideCell),x:event.clientX,y:event.clientY,revision:game.revision,moved:false};if(powerMode)markTargets(gesture.from);});
 grid.addEventListener('pointermove',event=>{
  if(!gesture||gesture.pointer!==event.pointerId){if(event.pointerType==='mouse'&&powerMode){const node=event.target.closest('[data-tide-cell]');markTargets(node?Number(node.dataset.tideCell):null);}return;}
  const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;if(Math.max(Math.abs(dx),Math.abs(dy))<14)return;gesture.moved=true;
  if(powerMode||game.board[gesture.from]===null)return;const target=swipeTarget(gesture.from,dx,dy);if(target===null)return;const press=gesture;gesture=null;selected=null;game.swap(press.from,target,press.revision);
 });
 grid.addEventListener('pointerup',event=>{const press=gesture;gesture=null;if(!press||press.pointer!==event.pointerId||press.moved||press.revision!==game.revision)return;tapCell(press.from);});
 grid.addEventListener('pointercancel',()=>{gesture=null;});grid.addEventListener('lostpointercapture',()=>{gesture=null;});grid.addEventListener('click',event=>{if(event.detail!==0)return;const node=event.target.closest('[data-tide-cell]');if(node)tapCell(Number(node.dataset.tideCell));});grid.addEventListener('pointerleave',()=>{if(powerMode)markTargets();});
 root.addEventListener('contextmenu',event=>{if(event.target.closest('.tide-arena'))event.preventDefault();});root.addEventListener('dblclick',event=>{if(!event.target.closest('textarea,input'))event.preventDefault();});
 document.addEventListener('keydown',event=>{
  if(active&&homeOpen&&homeView==='modes'&&event.key==='Escape'){event.preventDefault();showLanding();return;}if(!active||homeOpen||event.ctrlKey||event.metaKey||event.altKey||event.target.matches('input,select,textarea')||document.querySelector('dialog[open]'))return;
  if(event.key.toLowerCase()==='p'||event.key==='Escape'){event.preventDefault();game.status==='playing'?pause():resume();return;}if(game.status!=='playing'||game.busy)return;
  if(['1','2','3','4','5'].includes(event.key)){event.preventDefault();choosePower({1:'bomb',2:'rocket',3:'cross',4:'nova',5:'shuffle'}[event.key]);return;}
  if(event.key.startsWith('Arrow')){event.preventDefault();const delta={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]}[event.key];if(!delta)return;const target=swipeTarget(aim,...delta);if(target===null)return;if(event.shiftKey)game.swap(aim,target);else{aim=target;selected=aim;markTargets();grid.focus({preventScroll:true});}return;}
  if(event.key==='Enter'&&!event.target.closest('button')){event.preventDefault();tapCell(aim);}if(event.key===' '&&!event.target.closest('button,a')){event.preventDefault();clearInput();game.raise(true);}
 });
 $('tide-share').addEventListener('click',async()=>{const title='Popzuno · '+t(selectedMode==='survival'?'survival':selectedMode),text=title+'\n'+t('shareIntro',{score:number(game.score)})+'\n'+t(selectedMode==='daily'?'shareDaily':selectedMode==='blitz'?'shareBlitz':selectedMode==='timeRush'?'shareTimeRush':selectedMode==='ascend'?'shareAscend':'shareSurvival',{day:game.day,combo:game.bestCombo,stage:game.wave,seconds:Math.floor(game.elapsed/1000)});try{if(navigator.share){await navigator.share({title,text});return;}if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);toast(t('copied'));return;}}catch(error){if(error.name==='AbortError')return;}root.querySelector('#tide-share-dialog h2').textContent=title;$('tide-share-text').value=text;$('tide-share-dialog').showModal();$('tide-share-text').select();});$('tide-share-close').addEventListener('click',()=>$('tide-share-dialog').close());
 refresh();return {get status(){return game.status;},get mode(){return homeOpen?previewMode:selectedMode;},pause,resume,refresh,openHome,back(){if(homeOpen&&homeView==='modes'){showLanding();return true;}if(!homeOpen){openHome();return true;}return false;},get isHome(){return homeOpen;},setActive(value){active=value;if(!value)pause();root.hidden=!value;syncResultLayer();signalPlaying();},frame(dt){if(!active||homeOpen||game.status!=='playing')return;game.tick(dt);if(!game.busy&&!gesture&&selected===null&&!powerMode&&!idleHint&&game.elapsed-lastAction>=6500){idleHint=true;renderBoard();}paintMotion();if(game.elapsed-hudAt>=100)updateHUD();const voiceNow=performance.now();if(voiceNow-cheerTickAt>=100&&(!game.busy||game.phase?.kind==='wave')){cheerTickAt=voiceNow;celebrate();}audio.update(game.phase?.kind==='wave'?.16:game.intensity,dt,game.musicPace);}};
}
