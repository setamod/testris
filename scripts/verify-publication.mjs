import {readFile,writeFile,readdir,stat} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {PRIVACY_COPY} from '../dist/privacy.mjs';
import {LEGAL_NOTICES} from '../dist/legal.mjs';
import {VOICE_CLIPS} from '../dist/voice-bank.mjs';
import {CHEER_PHRASES} from '../dist/cheers.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),pub=join(root,'publication');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex'),checks=[];
function check(value,name){if(!value)throw Error('Publication check failed: '+name);checks.push(name);}
const config=JSON.parse(await readFile(join(pub,'release-config.json'),'utf8'));
check(config.contact.publicUseConfirmed,'owner confirmed public contact');
check(config.businessModel==='paid_upfront_no_ads_no_iap','approved paid-upfront model');
check(config.publicPrivacyUrl?.startsWith('https://')&&config.publicSupportUrl?.startsWith('https://'),'public HTTPS policy/support URLs');
for(const [lang,copy]of Object.entries(PRIVACY_COPY)){
 const metadata=JSON.parse(await readFile(join(pub,'store',lang+'.json'),'utf8'));
 check(metadata.name.length<=30&&metadata.subtitle.length<=30&&metadata.shortDescription.length<=80&&metadata.description.length<=4000&&metadata.keywords.length<=100,'metadata bounds / '+lang);
 check(metadata.privacyUrl===new URL('privacy/'+lang+'.html',new URL('.',config.publicPrivacyUrl)).href&&metadata.supportUrl===new URL('support/'+lang+'.html',new URL('.',config.publicSupportUrl)).href,'localized live URLs in metadata / '+lang);
 for(const kind of ['privacy','support']){
  const path=join(pub,'site','dist',kind,lang+'.html'),html=await readFile(path,'utf8');
  check(html.includes('lang="'+lang+'"')&&!html.includes('PREVIEW —'),'confirmed localized '+kind+' / '+lang);
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   const link=match[1];if(/^(https?:|mailto:|data:|#)/.test(link))continue;
   check((await stat(resolve(dirname(path),link))).isFile(),'local Site link / '+lang+' / '+link);
  }
 }
}
const voiceProvenance=JSON.parse(await readFile(join(root,'vendor/ANNOUNCER-ASSETS.json'),'utf8'));
const normalizePhrase=text=>text.toLowerCase().replace(/[^a-z0-9]/g,'');
for(const clip of voiceProvenance.clips){
 const shipped=VOICE_CLIPS[clip.kind],evidence=voiceProvenance.intelligibility_check.results.find(item=>item.kind===clip.kind);
 check(clip.phrase===CHEER_PHRASES[clip.kind]&&shipped.sha256===clip.sha256&&sha(Buffer.from(shipped.data,'base64'))===clip.sha256,'verified fixed speech asset / '+clip.kind);
 check(evidence.sha256===clip.sha256&&normalizePhrase(evidence.transcript)===normalizePhrase(clip.phrase),'unprompted speech words match / '+clip.kind);
}
const version=JSON.parse(await readFile(join(root,'package.json'),'utf8')).version;
const archive=join(pub,'artifacts',`Popzuno-${version}-unsigned.xcarchive`,'Products','Applications','Bulusko.app');
for(const notice of LEGAL_NOTICES){
 const source=await readFile(join(root,'vendor',notice.file));check(notice.text===source.toString('utf8'),'current legal snapshot / '+notice.file);
 for(const folder of [join(root,'ios','Bulusko','Resources','Legal'),join(root,'android','app','src','main','assets','legal'),join(archive,'Legal')])check(sha(await readFile(join(folder,notice.file)))===sha(source),'bundled notice / '+folder.split(root)[1]+'/'+notice.file);
}
const iosHTML=await readFile(join(root,'ios','Bulusko','Resources','Game','index.html'));
check(sha(await readFile(join(archive,'Game','index.html')))===sha(iosHTML),'iOS archive matches current packaged game');
const androidHTML=(await readFile(join(root,'android','app','src','main','assets','game','index.html'))).toString('utf8');
check(androidHTML.includes('KynburstNative')&&androidHTML.includes('href="./index.html"'),'Android bridge and allowed local navigation');
check(!/<script[^>]+\bsrc=|<link[^>]+stylesheet|@import/.test(androidHTML),'native game contains no external runtime loader');
const aab=await readFile(join(root,'android','app','build','outputs','bundle','release','app-release.aab'));
const aabContents=JSON.parse(await readFile(join(pub,'evidence','android-package-contents.json'),'utf8'));
check(aabContents.aab_sha256===sha(aab),'AAB inspection belongs to current artifact');
check(aabContents.game_matches_current_source&&aabContents.game_sha256===sha(Buffer.from(androidHTML)),'actual AAB game matches current source');
check(aabContents.legal_files_match.length===LEGAL_NOTICES.length&&!aabContents.signed&&!aabContents.native_libraries.length,'actual AAB notices, unsigned state and no native SDK libraries');
const manifest=await readFile(join(pub,'evidence','android-release-manifest.xml'),'utf8');
check(manifest.includes('android:targetSdkVersion="36"')&&manifest.includes('android:minSdkVersion="26"'),'actual AAB target/min API levels');
check(manifest.includes('android:allowBackup="false"')&&!manifest.includes('android:debuggable="true"'),'actual AAB backup/debug flags');
const permissions=[...manifest.matchAll(/<uses-permission[^>]*android:name="([^"]+)"/g)].map(match=>match[1]);
check(permissions.length===1&&permissions[0]==='android.permission.VIBRATE','actual AAB has only VIBRATE permission');
const bundleConfig=JSON.parse(await readFile(join(pub,'evidence','android-bundle-config.json'),'utf8'));
check(bundleConfig.optimizations.splitsConfig.splitDimension.some(item=>item.value==='LANGUAGE'&&item.negate),'actual AAB keeps all languages offline');
check((await readFile(join(pub,'evidence','android-smoke.txt'),'utf8')).includes('KYNBURST_SMOKE_PASS'),'native Android smoke run passed');
const assets={
 'app-store-icon-1024.png':[1024,1024], 'google-play-icon-512.png':[512,512],
 'google-feature-1024x500.png':[1024,500], 'ios-ready-tr.png':[1320,2868],
 'android-gameplay-tr.png':[1080,null], 'android-time-rush-en.png':[1080,null],
 'android-time-critical-en.png':[1080,null], 'android-time-ended-en.png':[1080,null]
};
const assetEvidence=[];
for(const [name,[width,height]]of Object.entries(assets)){
 const bytes=await readFile(join(pub,'store','assets',name));
 const actualHeight=bytes.readUInt32BE(20);
 check(bytes.subarray(1,4).toString('ascii')==='PNG'&&bytes.readUInt32BE(16)===width&&(height?actualHeight===height:[1920,2400].includes(actualHeight)),'real PNG format/dimensions / '+name);
 if(name.includes('icon')||name.includes('feature'))check(bytes[25]===2,'opaque RGB store graphic / '+name);
 assetEvidence.push({file:name,width,height:actualHeight,bytes:bytes.length,sha256:sha(bytes)});
}
await writeFile(join(pub,'store','ASSETS.json'),JSON.stringify({assets:assetEvidence,screenshots:'actual simulator/emulator captures with default illustrated characters; no personal photos',feature:'Popzuno generated emblem and native typography; source scripts/prepare-brand.swift',iosScreenshotLocale:'tr'},null,2)+'\n');
await writeFile(join(pub,'PACKAGE-CHECKS.json'),JSON.stringify({status:'passed',checks:checks.length,details:checks,storeSubmissionReady:false,reason:'Owner enrollment/signing, legal review, commercial choices and required test tracks remain.'},null,2)+'\n');
console.log(JSON.stringify({checksPassed:checks.length,assets:assetEvidence.length,storeSubmissionReady:false}));
