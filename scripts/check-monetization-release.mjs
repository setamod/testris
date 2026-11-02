import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);let config=JSON.parse(await readFile(new URL('config/monetization.json',root)));
try{config={...config,...JSON.parse(await readFile(new URL('monetization.local.json',root)))};}catch{}
const issues=[];
if(config.productId!=='com.mertbekisoglu.bulusko.premium')issues.push('Premium product ID must match both store products.');
if(config.targetPriceUSD!=='2.99')issues.push('Changing the owner-approved target price needs a separate product decision.');
if(config.liveAdsEnabled)for(const field of ['iosAdMobAppId','androidAdMobAppId','iosRewardedAdUnitId','androidRewardedAdUnitId']){
 const pattern=field.includes('AppId')?/^ca-app-pub-\d{16}~\d{10}$/:/^ca-app-pub-\d{16}\/\d{10}$/;
 if(!pattern.test(config[field]??'')||/3940256099942544|0000000000000000/.test(config[field]))issues.push(field+': real production ID required.');
}
if(process.argv.includes('--publication')){
 for(const field of ['audienceApproved','privacyDeclarationsApproved','storeProductsEnabled'])if(config[field]!==true)issues.push(field+': owner/store action pending.');
 if(!config.androidBillingPublicKey)issues.push('Verified Play public licensing key is missing.');
}
if(issues.length){console.error(issues.join('\n'));process.exitCode=1;}else console.log('MONETIZATION_CONFIG_PASS'+(process.argv.includes('--publication')?' publication configuration only; account and device checks remain':' live features stay gated until owner setup'));
