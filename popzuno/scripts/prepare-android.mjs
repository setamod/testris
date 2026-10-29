import {readFile,writeFile,mkdir,copyFile,unlink} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {LEGAL_FILES} from './generate-legal.mjs';
import {PRIVACY_COPY} from '../dist/privacy.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),main=join(root,'android','app','src','main');
execFileSync(process.execPath,[join(root,'scripts','package.mjs')],{stdio:'pipe'});
let html=await readFile(join(root,'..','releases','Popzuno-Prototip','OYNA.html'),'utf8');
html=html.replace('width=device-width, initial-scale=1, viewport-fit=cover','width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
html=html.replace('href="./OYNA.html"','href="./index.html"');
const bridge=`<script>
window.webkit={messageHandlers:{bulusko:{postMessage:function(value){window.KynburstNative.postMessage(JSON.stringify(value));}}}};
if(!navigator.share)Object.defineProperty(navigator,'share',{value:async function(value){window.KynburstNative.postMessage(JSON.stringify({type:'share',text:String(value.text||'')}));}});
</script>`;
html=html.replace('<head>','<head>'+bridge);
await mkdir(join(main,'assets','game'),{recursive:true});await writeFile(join(main,'assets','game','index.html'),html);
await mkdir(join(main,'assets','legal'),{recursive:true});for(const name of LEGAL_FILES)await copyFile(join(root,'vendor',name),join(main,'assets','legal',name));
const native={tr:['Popzuno ayarları','Titreşim','Bitti'],en:['Popzuno settings','Haptics','Done'],it:['Impostazioni Popzuno','Vibrazioni','Fatto'],es:['Ajustes de Popzuno','Vibración','Listo'],de:['Popzuno-Einstellungen','Vibration','Fertig'],ru:['Настройки Popzuno','Вибрация','Готово']};
const escape=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll("'","\\'");
for(const [lang,[settings,haptics,done]]of Object.entries(native)){
 const folder=join(main,'res',lang==='en'?'values':'values-'+lang);await mkdir(folder,{recursive:true});
 await writeFile(join(folder,'strings.xml'),'<resources>\n'+Object.entries({app_name:'Popzuno',settings,haptics,done,privacy:PRIVACY_COPY[lang].policy}).map(([key,value])=>`<string name="${key}">${escape(value)}</string>`).join('\n')+'\n</resources>\n');
}
// Approved Popzuno artwork; adaptive masks retain the complete central emblem.
await mkdir(join(main,'res','mipmap-anydpi-v26'),{recursive:true});await mkdir(join(main,'res','mipmap-anydpi-v33'),{recursive:true});await mkdir(join(main,'res','drawable'),{recursive:true});
await writeFile(join(main,'res','drawable','launcher_foreground.xml'),'<inset xmlns:android="http://schemas.android.com/apk/res/android" android:inset="18dp"><bitmap android:src="@drawable/popzuno_icon" android:gravity="fill" android:filter="true"/></inset>');
await writeFile(join(main,'res','drawable','launcher_monochrome.xml'),'<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108"><group android:scaleX="0.72" android:scaleY="0.72" android:translateX="15.12" android:translateY="15.12"><path android:pathData="M19,17h24q8,0 8,8v12h-11q-12,0 -12,12v3h-9q-8,0 -8,-8v-19q0,-8 8,-8M77,28h11q9,0 9,9v22q0,9 -9,9h-7v-18q0,-11 -10,-13v-1q0,-8 6,-8M41,43h26q10,0 10,10v29q0,10 -10,10h-26q-10,0 -10,-10v-29q0,-10 10,-10M78,9l3,8 9,3 -9,3 -3,8 -3,-8 -9,-3 9,-3Z" android:fillColor="#ffffff"/><path android:pathData="M43,63h3M62,63h3M44,73q10,13 20,0" android:strokeColor="#00000000" android:strokeWidth="0" android:fillColor="#00000000"/></group></vector>');
await writeFile(join(main,'res','mipmap-anydpi-v26','ic_launcher.xml'),'<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/launcher_background"/><foreground android:drawable="@drawable/launcher_foreground"/></adaptive-icon>');
await writeFile(join(main,'res','mipmap-anydpi-v33','ic_launcher.xml'),'<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/launcher_background"/><foreground android:drawable="@drawable/launcher_foreground"/><monochrome android:drawable="@drawable/launcher_monochrome"/></adaptive-icon>');
await writeFile(join(main,'res','values','colors.xml'),'<resources><color name="launcher_background">#151226</color></resources>');
for(const density of ['mdpi','hdpi','xhdpi','xxhdpi','xxxhdpi'])for(const file of ['ic_launcher.png','ic_launcher_art.png'])await unlink(join(main,'res','mipmap-'+density,file)).catch(error=>{if(error.code!=='ENOENT')throw error;});
await unlink(join(main,'res','mipmap-anydpi','ic_launcher.xml')).catch(error=>{if(error.code!=='ENOENT')throw error;});
console.log(JSON.stringify({platform:'android',targetSdk:36,minSdk:26,assets:'offline',internetPermission:false,photoAccess:'system_picker',backup:false,game:join(main,'assets','game','index.html')}));
