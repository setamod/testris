import {LANGUAGES,normalizeLanguage} from './locales.mjs';
import {readFlow,writeFlow,clearFlow,normalizePeople} from './storage.mjs';
import {privacyCopy,SUPPORT_EMAIL} from './privacy.mjs';
import {LEGAL_NOTICES} from './legal.mjs';
import {flowTranslate} from './i18n.mjs';
import {FlowAudio} from './sound.mjs';
import {CHEER_PHRASES} from './cheers.mjs';
import {createFaceProcessor} from './face.mjs';
import {createAvatars,DEFAULT_NAMES,FAMILY_COLORS} from './avatars.mjs';
import {HOME_REVISION,openingMode} from './home-mode.mjs';
import {createTide} from './arcade.mjs';
const el=id=>document.getElementById(id);
const raw=readFlow('settings',{}),settings=raw&&typeof raw==='object'?raw:{};
let language=normalizeLanguage(settings.language),tide=null,lastTime=0,editingPerson=0,photoBusy=false,photoJob=0,noticeTimer=0,resetting=false;
const initialMode=openingMode(settings);
const t=(key,values)=>flowTranslate(language,key,values);
const people=normalizePeople(readFlow('people',[])),avatars=createAvatars(FAMILY_COLORS),faces=createFaceProcessor();
const audio=new FlowAudio({enabled:settings.sound!==false,music:settings.music!==false,cheers:settings.cheers!==false,cheerVolume:settings.cheerVolume,volume:Number.isFinite(settings.volume)?Math.max(0,Math.min(1,settings.volume)):.5});
const escapeText=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const personName=index=>people[index]?.name||(DEFAULT_NAMES[language]??DEFAULT_NAMES.en)[index],avatar=index=>avatars.portrait(index,people[index]);
function notify(message){el('app-notice').textContent=message;el('app-notice').classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el('app-notice').classList.remove('show'),2200);}
function persistSettings(){if(resetting)return;if(!writeFlow('settings',{language,mode:tide?.mode??initialMode,homeRevision:HOME_REVISION,sound:audio.enabled,music:audio.music,cheers:audio.cheers,cheerVolume:audio.cheerVolume,volume:audio.volume}))notify(t('saveError'));}
function pauseGame(){lastTime=0;tide?.pause();}
function resumeGame(){lastTime=0;tide?.resume();}
function openDialog(id){const dialog=el(id);dialog.dataset.resume=tide?.status==='playing'?'yes':'no';pauseGame();dialog.showModal();}
function closeDialog(id,resume=true){if(!resume)el(id).dataset.resume='no';el(id).close();}
for(const button of document.querySelectorAll('[data-close]'))button.addEventListener('click',()=>closeDialog(button.dataset.close));
for(const id of ['help-dialog','family-dialog'])el(id).addEventListener('close',()=>{if(id==='family-dialog'&&photoBusy){photoJob++;faces.cancel();photoBusy=false;}if(el(id).dataset.resume==='yes'&&!document.hidden)resumeGame();el(id).dataset.resume='no';});
function setHelpPanel(panel){const settings=panel==='settings';el('help-dialog').dataset.panel=settings?'settings':'help';el('help-content').hidden=settings;el('settings-content').hidden=!settings;el('help-panel-title').textContent=t(settings?'settingsTab':'helpTitle');for(const button of document.querySelectorAll('[data-help-panel]'))button.setAttribute('aria-pressed',String(button.dataset.helpPanel===(settings?'settings':'help')));}
function showHelp(panel='help'){setHelpPanel(panel);openDialog('help-dialog');audio.warmCheers();}
for(const button of document.querySelectorAll('[data-help-panel]'))button.addEventListener('click',()=>setHelpPanel(button.dataset.helpPanel));
el('help-open').addEventListener('click',()=>showHelp('help'));
function renderPrivacy(){
 const copy=privacyCopy(language);
 for(const [id,key]of [['privacy-open','title'],['privacy-title','policy'],['credits-title','credits'],['reset-open','reset'],['reset-title','reset'],['reset-copy','confirm'],['reset-confirm','erase'],['reset-cancel','cancel'],['privacy-done','close']])el(id).textContent=copy[key];
 el('privacy-content').replaceChildren();
 for(const [title,text]of copy.sections){const heading=document.createElement('h3'),paragraph=document.createElement('p');heading.textContent=title;paragraph.textContent=text;el('privacy-content').append(heading,paragraph);}
 const contact=document.createElement('a');contact.href='mailto:'+SUPPORT_EMAIL;contact.textContent=copy.support+' · '+SUPPORT_EMAIL;contact.addEventListener('click',event=>{const native=globalThis.webkit?.messageHandlers?.bulusko;if(native){event.preventDefault();native.postMessage({type:'support'});}});el('privacy-content').append(contact);
 el('license-content').replaceChildren();for(const item of LEGAL_NOTICES){const details=document.createElement('details'),summary=document.createElement('summary'),pre=document.createElement('pre');summary.textContent=item.file;pre.textContent=item.text;details.append(summary,pre);el('license-content').append(details);}
}
function openPrivacy(){for(const id of ['help-dialog','family-dialog'])if(el(id).open)closeDialog(id,false);if(!el('privacy-dialog').open)openDialog('privacy-dialog');}
el('privacy-open').addEventListener('click',openPrivacy);
window.addEventListener('kynburst:privacy',openPrivacy);
window.addEventListener('kynburst:back',()=>{const dialog=[...document.querySelectorAll('dialog[open]')].at(-1);if(dialog)dialog.close();else if(tide&&!tide.isHome)tide.openHome();else globalThis.webkit?.messageHandlers?.bulusko?.postMessage({type:'exit'});});
el('reset-open').addEventListener('click',()=>{el('reset-error').textContent='';el('reset-confirm').disabled=false;openDialog('reset-dialog');});
el('reset-confirm').addEventListener('click',()=>{pauseGame();audio.stop();photoJob++;faces.cancel();resetting=true;el('reset-confirm').disabled=true;const result=clearFlow();if(result.ok){if(!result.managedByNative)location.reload();}else{resetting=false;el('reset-error').textContent=privacyCopy(language).error;el('reset-confirm').disabled=false;}});
if(globalThis.webkit?.messageHandlers?.bulusko)el('native-settings').hidden=false;
el('native-settings').addEventListener('click',()=>{closeDialog('help-dialog',false);pauseGame();globalThis.webkit?.messageHandlers?.bulusko?.postMessage({type:'settings'});});
function renderPeople(){
 el('family-tabs').innerHTML=people.map((person,i)=>`<button class="family-tab" data-person="${i}" aria-label="${escapeText(personName(i))}" aria-pressed="${editingPerson===i}" ${photoBusy?'disabled':''}><img src="${avatar(i)}" alt=""></button>`).join('');
 for(const button of el('family-tabs').children)button.addEventListener('click',()=>{editingPerson=Number(button.dataset.person);el('photo-status').textContent='';renderPeople();});
 const p=people[editingPerson];el('person-preview').src=avatar(editingPerson);el('person-preview').alt=personName(editingPerson);el('person-name').value=p.name;el('person-name').placeholder=(DEFAULT_NAMES[language]??DEFAULT_NAMES.en)[editingPerson];el('person-name').disabled=photoBusy;el('person-photo').disabled=photoBusy;el('person-delete').disabled=!p.photo||photoBusy;
 el('crop-zoom').value=p.zoom;el('crop-x').value=p.x;el('crop-y').value=p.y;for(const id of ['crop-zoom','crop-x','crop-y'])el(id).disabled=!p.photo||photoBusy;
}
function refreshPortraits(){tide?.refresh();}
function savePeople(){if(resetting)return;if(!writeFlow('people',people))el('photo-status').textContent=t('saveError');}
el('family-open').addEventListener('click',()=>{renderPeople();openDialog('family-dialog');});
el('person-name').addEventListener('change',event=>{people[editingPerson].name=event.target.value.trim().slice(0,24);savePeople();renderPeople();tide?.refresh();});
for(const [id,field]of [['crop-zoom','zoom'],['crop-x','x'],['crop-y','y']]){
 el(id).addEventListener('input',event=>{people[editingPerson][field]=Number(event.target.value);el('person-preview').src=avatar(editingPerson);});
 el(id).addEventListener('change',()=>{savePeople();renderPeople();refreshPortraits();});
}
el('person-photo').addEventListener('change',async event=>{
 const file=event.target.files?.[0];if(!file||photoBusy)return;const person=editingPerson,job=++photoJob;photoBusy=true;el('photo-status').textContent=t('processing');renderPeople();
 try{const result=await faces.prepare(file);if(job!==photoJob)return;people[person]={...people[person],photo:result.data,zoom:1,x:.5,y:.5};await avatars.load(people);el('photo-status').textContent=t(result.detected?'photoReady':'photoFallback');savePeople();refreshPortraits();}
 catch(error){if(job===photoJob)el('photo-status').textContent=t(error.message==='size'?'photoSize':'photoError');}
 finally{if(job===photoJob)photoBusy=false;event.target.value='';renderPeople();}
});
el('person-delete').addEventListener('click',async()=>{people[editingPerson].photo=null;people[editingPerson].zoom=1;avatars.clear();await avatars.load(people);savePeople();renderPeople();refreshPortraits();el('photo-status').textContent=t('deleted');});
function updateAudio(){el('sound-toggle').setAttribute('aria-pressed',String(audio.enabled));el('sound-toggle').setAttribute('aria-label',t('sound'));el('sound-toggle').querySelector('use').setAttribute('href',audio.enabled?'#icon-sound':'#icon-mute');el('audio-toggle').checked=audio.enabled;el('music-toggle').checked=audio.music;el('cheers-toggle').checked=audio.cheers;el('cheer-volume').value=Math.round(audio.cheerVolume*100);el('volume').value=Math.round(audio.volume*100);}
el('sound-toggle').addEventListener('click',()=>{audio.setEnabled(!audio.enabled);if(audio.enabled){audio.unlock();audio.effect('select');}persistSettings();updateAudio();});
el('cheer-volume').addEventListener('input',event=>audio.setCheerVolume(Number(event.target.value)/100));el('cheer-volume').addEventListener('change',persistSettings);
el('cheers-toggle').addEventListener('change',event=>{audio.setCheers(event.target.checked);persistSettings();});
let rewardPreview=0;el('reward-preview').addEventListener('click',()=>{const power=['bomb','rocket','shuffle','cross','nova'][rewardPreview++%5];audio.effect('earn-'+power);notify(power.toUpperCase()+' +1');});
let cheerPreview=0;el('cheer-preview').addEventListener('click',()=>{const kind=['four','five','cross','combo3','combo4','nova','novaReady'][cheerPreview++%7];const played=audio.previewCheer(kind);notify(played?CHEER_PHRASES[kind]:t('previewNeedsSound'));});
el('audio-toggle').addEventListener('change',event=>{audio.setEnabled(event.target.checked);if(audio.enabled)audio.warmCheers();persistSettings();updateAudio();});
el('music-toggle').addEventListener('change',event=>{audio.setMusic(event.target.checked);persistSettings();});
el('volume').addEventListener('input',event=>audio.setVolume(Number(event.target.value)/100));el('volume').addEventListener('change',persistSettings);
el('language').innerHTML=Object.entries(LANGUAGES).map(([key,value])=>`<option value="${key}">${value.name}</option>`).join('');
function applyLanguage(){document.documentElement.lang=language;document.querySelector('.top-actions').setAttribute('aria-label',t('menu'));document.title='Popzuno';for(const element of document.querySelectorAll('[data-text]'))element.textContent=t(element.dataset.text);el('language').value=language;el('help-open').setAttribute('aria-label',t('help'));el('family-open').setAttribute('aria-label',t('family'));el('person-name').setAttribute('aria-label',t('photoName'));for(const button of document.querySelectorAll('[data-close]'))button.setAttribute('aria-label',t('close'));updateAudio();setHelpPanel(el('help-dialog').dataset.panel||'help');refreshPortraits();if(el('family-dialog').open)renderPeople();}
el('language').addEventListener('change',event=>{language=normalizeLanguage(event.target.value);persistSettings();applyLanguage();renderPrivacy();});
function background(){lastTime=0;if(photoBusy){photoJob++;faces.cancel();photoBusy=false;}pauseGame();audio.stop();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)background();});window.addEventListener('blur',background);
function frame(time){const dt=lastTime?Math.max(0,Math.min(250,time-lastTime)):0;lastTime=time;tide?.frame(dt);requestAnimationFrame(frame);}
tide=createTide({root:el('tide-root'),audio,avatar,personName,colors:FAMILY_COLORS,getLanguage:()=>language,read:readFlow,write:writeFlow,initialMode,onModeChange:persistSettings,onMenuAction:action=>action==='family'?el('family-open').click():showHelp(action==='settings'?'settings':'help')});
tide.setActive(true);applyLanguage();renderPrivacy();avatars.load(people).then(refreshPortraits);requestAnimationFrame(frame);

document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();tide.openHome();});
