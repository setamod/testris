import {readFile,writeFile,mkdir,copyFile,stat} from 'node:fs/promises';
import {constants} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
import {LEGAL_FILES} from './generate-legal.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=resolve(root,'..','releases','Popzuno-Prototip');
await mkdir(join(out,'Lisanslar'),{recursive:true});
const names=['locales','arcade-copy','arcade-engine','home-mode','run-ui','board','arcade','storage','i18n','privacy','legal','impact','cheers','voice-bank','sound','avatars','face','app'];
const brandMark='data:image/png;base64,'+(await readFile(join(root,'dist','assets','popzuno-mark.png'))).toString('base64');
const modules=[];
for(const name of names){
 let code=(await readFile(join(root,'dist',name+'.mjs'),'utf8')).replaceAll('./assets/popzuno-mark.png',brandMark);
 const exported=[...code.matchAll(/^export\s+(?:const|class|function)\s+(\w+)/gm)].map(match=>match[1]);
 code=code.replace(/^import\s+\{([^}]+)\}\s+from\s+['"]\.\/([^'"]+)\.mjs['"];?\s*$/gm,(_,symbols,dependency)=>`const {${symbols}}=__load(${JSON.stringify(dependency)});`).replace(/^export\s+/gm,'');
 if(/^\s*(import|export)\s/m.test(code))throw Error('Unbundled declaration in '+name);
 modules.push(`${JSON.stringify(name)}:function(__load){\n${code}\nreturn {${exported.join(',')}};\n}`);
}
const script=`(()=>{\n'use strict';\nconst __modules={${modules.join(',\n')}};\nconst __cache={};function __load(name){return __cache[name]??=(__modules[name](__load));}\n__load('app');\n})();`;
new vm.Script(script);
let css=(await readFile(join(root,'dist','style.css'),'utf8'))+'\n'+(await readFile(join(root,'dist','arcade-refresh.css'),'utf8'));
for(const font of ['chakra-petch-600.ttf','ibm-plex-mono-400.ttf']){const data=(await readFile(join(root,'vendor',font))).toString('base64');css=css.replace(`url('./assets/${font}')`,`url(data:font/ttf;base64,${data})`);}
const icon=(await readFile(join(root,'dist','icon.svg'))).toString('base64');
let html=await readFile(join(root,'dist','index.html'),'utf8');
html=html.replaceAll('./assets/popzuno-mark.png',brandMark).replace('<link rel="stylesheet" href="./arcade-refresh.css">','');
html=html.replace('<link rel="stylesheet" href="./style.css">',`<style>${css}</style>`).replace('href="./icon.svg"',`href="data:image/svg+xml;base64,${icon}"`).replace('href="./index.html"','href="./OYNA.html"').replace('<script type="module" src="./app.mjs"></script>',()=>`<script>${script.replace(/<\/script/gi,'<\\/script')}</script>`);
if(/<script[^>]+src=|<link[^>]+stylesheet|type="module"|@import/.test(html))throw Error('External runtime dependency left in the portable package.');
await writeFile(join(out,'OYNA.html'),html);
for(const name of LEGAL_FILES)await copyFile(join(root,'vendor',name),join(out,'Lisanslar',name));
await copyFile(join(root,'README.md'),join(out,'BENI-OKU.md'));
const archive=resolve(root,'..','releases','Popzuno-Prototip.zip');
execFileSync('/usr/bin/python3',['-c',`import pathlib,sys,zipfile
p=pathlib.Path(sys.argv[1])
with zipfile.ZipFile(sys.argv[2],'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for f in sorted(p.rglob('*')):
  if f.is_file(): z.write(f,f.relative_to(p.parent))`,out,archive]);
console.log(JSON.stringify({html:join(out,'OYNA.html'),archive,bytes:(await stat(archive)).size}));
// Keep existing file:// bookmarks on the same storage origin after the rename.
const legacy=resolve(root,'..','releases','Bulusko-Prototip'),legacyZip=resolve(root,'..','releases','Bulusko-Prototip.zip');
try{
 await stat(join(legacy,'OYNA.html'));
 const history=join(root,'backups');await mkdir(history,{recursive:true});
 try{await copyFile(legacyZip,join(history,'Bulusko-Prototip-0.3.zip'),constants.COPYFILE_EXCL);}catch(error){if(!['EEXIST','ENOENT'].includes(error.code))throw error;}
 await copyFile(join(out,'OYNA.html'),join(legacy,'OYNA.html'));await copyFile(join(out,'BENI-OKU.md'),join(legacy,'BENI-OKU.md'));await copyFile(archive,legacyZip);
}catch(error){if(error.code!=='ENOENT')throw error;}

const prior=resolve(root,'..','releases','Kynburst-Prototip');
try{await stat(join(prior,'OYNA.html'));await copyFile(join(out,'OYNA.html'),join(prior,'OYNA.html'));await copyFile(join(out,'BENI-OKU.md'),join(prior,'BENI-OKU.md'));await copyFile(archive,resolve(root,'..','releases','Kynburst-Prototip.zip'));}catch(error){if(error.code!=='ENOENT')throw error;}
