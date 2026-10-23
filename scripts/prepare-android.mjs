import {copyFile,mkdir,readFile,stat,writeFile} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const android=join(root,'android','app','src','main','assets');
const game=join(android,'game');
await mkdir(game,{recursive:true});

// Keep the Android client fully offline, just like the iOS and portable builds.
execFileSync(process.execPath,[join(root,'scripts','package-portable.mjs')],{stdio:'pipe'});
let html=await readFile(join(root,'..','releases','Familytris-Mac','OYNA.html'),'utf8');
function replaceRequired(before,after){
 if(!html.includes(before))throw Error(`Android game integration is out of date: ${before.slice(0,55)}`);
 html=html.replace(before,after);
}
replaceRequired('class="brand" href="./OYNA.html"','class="brand" href="./index.html"');
replaceRequired(
 "const safeRead=(key,fallback)=>{try{return localStorage.getItem(key)??fallback;}catch{return fallback;}};",
 "const safeRead=(key,fallback)=>{try{const value=globalThis.BLOK?.getPreference?.(key);return typeof value==='string'?value:localStorage.getItem(key)??fallback;}catch{return fallback;}};"
);
replaceRequired(
 "const safeWrite=(key,value)=>{try{localStorage.setItem(key,String(value));}catch{}};",
 "const safeWrite=(key,value)=>{const text=String(value);globalThis.BLOK?.savePreference?.(key,text);try{localStorage.setItem(key,text);}catch{}};"
);
replaceRequired(
 "const family=createFamilyStudio({read:safeRead,write:(key,value)=>{let stored=false;try{localStorage.setItem(key,value);stored=true;}catch{}const native=globalThis.webkit?.messageHandlers?.blok;if(native){native.postMessage({type:'preference',key,value});if(globalThis.__BLOK_NATIVE_STORAGE__)globalThis.__BLOK_NATIVE_STORAGE__[key]=value;stored=true;}if(!stored)throw Error('Kayıt kullanılamıyor');},pause:()=>{autoPause();wasPlayingBeforeHelp=false;},onChange:()=>{uiCache.preview=null;}});",
 "const family=createFamilyStudio({read:safeRead,write:safeWrite,pause:()=>{autoPause();wasPlayingBeforeHelp=false;},onChange:()=>{uiCache.preview=null;}});"
);
replaceRequired('function onEvent(event){',"function onEvent(event){\n if(['rotate','hold','drop','clear','over','start'].includes(event.type))globalThis.BLOK?.feedback?.(event.type,event.count??0,!!event.levelUp);");
replaceRequired(
 '<button class="primary-button" id="got-it">',
 '<button id="native-settings" class="native-settings-button">Uygulama ayarları ve gizlilik</button><button class="primary-button" id="got-it">'
);
const bridge=`
$('native-settings').addEventListener('click',()=>{wasPlayingBeforeHelp=false;dialog.close();autoPause();globalThis.BLOK?.showSettings?.();});
const nativeState=()=>globalThis.BLOK?.setPlaying?.(game.status==='playing');
new MutationObserver(nativeState).observe($('game-status'),{childList:true,characterData:true,subtree:true});
nativeState();
`;
replaceRequired('\n})();\n</script>','\n'+bridge+'\n})();\n</script>');
const mobileStyles=await readFile(join(root,'android','mobile.css'),'utf8');
replaceRequired('</head>',`<style>${mobileStyles}</style></head>`);
if(html.includes('type="module"')||/@import\s/.test(html)||/(?:src|href)=["']https?:/i.test(html))throw Error('Android resources are not self-contained.');
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
await writeFile(join(game,'index.html'),html);

const legal=join(android,'legal');
await mkdir(legal,{recursive:true});
for(const name of ['chakrapetch-OFL.txt','ibmplexmono-OFL.txt'])await copyFile(join(root,'vendor','fonts',name),join(legal,name));
await copyFile(join(root,'vendor','pico-MIT.txt'),join(legal,'pico-MIT.txt'));
console.log(JSON.stringify({game:join(game,'index.html'),game_bytes:(await stat(join(game,'index.html')).size)}));
