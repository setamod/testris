import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const product=resolve(root,'ios/build/Build/Products/Debug-iphonesimulator/BLOK.app');
if(!existsSync(product))throw Error('Önce iOS simülatörü için derleme yapın.');
const sim=(...args)=>execFileSync('/usr/bin/xcrun',['simctl',...args],{encoding:'utf8'}).trim();
const runtimes=JSON.parse(sim('list','-j','runtimes')).runtimes.filter(r=>r.isAvailable&&r.identifier.includes('.iOS-'));
runtimes.sort((a,b)=>b.version.localeCompare(a.version,undefined,{numeric:true}));
const runtime=runtimes[0];if(!runtime)throw Error('iOS simülatör bileşeni henüz kurulmamış.');
const devices=JSON.parse(sim('list','-j','devices','available')).devices[runtime.identifier]??[];
let device=devices.find(d=>d.name==='Familytris QA');
if(!device){
 const types=JSON.parse(sim('list','-j','devicetypes')).devicetypes.filter(t=>t.productFamily==='iPhone');
 const type=types.find(t=>t.name==='iPhone 17')??types.filter(t=>!t.name.includes('Max')&&!t.name.includes('Plus')).at(-1);
 if(!type)throw Error('Bir iPhone simülatör modeli bulunamadı.');
 const udid=sim('create','Familytris QA',type.identifier,runtime.identifier);
 device={udid,name:'Familytris QA',state:'Shutdown'};
}
if(device.state!=='Booted')sim('boot',device.udid);
console.log('iPhone simülatörü hazırlanıyor: '+runtime.name);
sim('bootstatus',device.udid,'-b');
if(process.argv.includes('--sample-photo')){
 const sample='/private/tmp/familytris-face-test.jpg';
 if(!existsSync(sample))throw Error('Test fotoğrafı bulunamadı.');
 sim('addmedia',device.udid,sample);
}
try{sim('terminate',device.udid,'com.mertbekisoglu.blok');}catch{}
sim('install',device.udid,product);
sim('launch',device.udid,'com.mertbekisoglu.blok');
console.log(JSON.stringify({device:device.name,ios:runtime.version,app:'Familytris',launch:'passed'}));
