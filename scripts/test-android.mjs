import {execFileSync} from 'node:child_process';
import {writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),adb=join(root,'.tooling','android-sdk','platform-tools','adb'),serial='emulator-5554';
const run=args=>execFileSync(adb,['-s',serial,...args],{encoding:'utf8',timeout:180000});
if(process.argv.includes('--diagnose')){
 const log=run(['logcat','-d','-v','brief','-t','350']);await writeFile(join(root,'publication','evidence','android-logcat.txt'),log);
 console.log(log.split('\n').filter(line=>/FATAL|Exception|chromium|Kynburst|Instrumentation|bulusko|WebView/.test(line)).slice(-35).join('\n'));
 const activity=run(['shell','dumpsys','activity','activities']);console.log(activity.split('\n').filter(line=>/ResumedActivity|mResumed|bulusko|Instrumentation/.test(line)).slice(-16).join('\n'));
 await writeFile(join(root,'publication','evidence','android-last-screen.png'),execFileSync(adb,['-s',serial,'exec-out','screencap','-p'],{timeout:20000,maxBuffer:16*1024*1024}));process.exit(0);
}
if(run(['shell','getprop','ro.kernel.qemu']).trim()!=='1')throw Error('This test is restricted to the created emulator.');
if(run(['emu','avd','name']).split('\n')[0].trim()!=='Kynburst-QA-36')throw Error('This test requires the owned Kynburst-QA-36 emulator.');
if(run(['shell','getprop','sys.boot_completed']).trim()!=='1')throw Error('Emulator has not completed booting.');
run(['shell','wm','size','1080x2400']);run(['shell','wm','density','420']);
console.log(run(['install','-r','--no-incremental',join(root,'android','app','build','outputs','apk','debug','app-debug.apk')]).trim());
console.log(run(['install','-r','--no-incremental',join(root,'android','app','build','outputs','apk','androidTest','debug','app-debug-androidTest.apk')]).trim());
// Isolated emulator + .debug package only: discard synthetic records from prior test attempts.
console.log(run(['shell','pm','clear','com.mertbekisoglu.bulusko.debug']).trim());
let output;try{output=run(['shell','am','instrument','-w','-r','com.mertbekisoglu.bulusko.debug.test/com.mertbekisoglu.bulusko.SmokeInstrumentation']);}catch(error){await writeFile(join(root,'publication','evidence','android-smoke.txt'),String(error.stdout??'')+'\n'+error.message);throw error;}
await mkdir(join(root,'publication','evidence'),{recursive:true});await writeFile(join(root,'publication','evidence','android-smoke.txt'),output);
console.log(output);
if(!output.includes('KYNBURST_SMOKE_PASS'))throw Error('Android smoke test failed; see publication/evidence/android-smoke.txt');
for(const name of ['android-home-tr.png','android-modes-tr.png','android-powers-tr.png','android-gameplay-tr.png','android-relax-tr.png','android-time-rush-en.png','android-time-critical-en.png','android-time-ended-en.png'])console.log(run(['pull','/sdcard/Android/data/com.mertbekisoglu.bulusko.debug/files/smoke/'+name,join(root,'publication','store','assets',name)]).trim());

console.log(run(['pull','/sdcard/Android/data/com.mertbekisoglu.bulusko.debug/files/smoke/android-layout-fit.json',join(root,'publication','evidence','android-layout-fit.json')]).trim());

console.log(run(['pull','/sdcard/Android/data/com.mertbekisoglu.bulusko.debug/files/smoke/android-audio-recovery.json',join(root,'publication','evidence','android-audio-recovery.json')]).trim());
