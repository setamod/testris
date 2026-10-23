import {readFile,writeFile,mkdir,copyFile,stat} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const releaseRoot=resolve(root,'..','releases');
const folder=join(releaseRoot,'Familytris-Mac');
const archive=join(releaseRoot,'Familytris-Mac.zip');
const dist=join(root,'dist');
await mkdir(folder,{recursive:true});

const engine=await readFile(join(dist,'engine.mjs'),'utf8');
const audio=await readFile(join(dist,'audio.mjs'),'utf8');
const characters=await readFile(join(dist,'characters.mjs'),'utf8');
const familySource=await readFile(join(dist,'family.mjs'),'utf8');
const app=await readFile(join(dist,'app.mjs'),'utf8');
const scripts=[engine,audio,characters,familySource,app].map(source=>source
 .replace(/^import\s+[^\n]+;\s*$/gm,'')
 .replace(/^export\s+(?=(?:const|class|function)\b)/gm,''));
const script='"use strict";\n(()=>{\n'+scripts.join('\n\n')+'\n})();';
if(/^\s*(?:import|export)\s/m.test(script))throw Error('Portable output still contains module declarations.');

let styles='';
for(const name of ['style.css','cyberpunk.css','family.css']){
 styles+=(await readFile(join(dist,name),'utf8')).replace(/@import\s+url\([^)]*\)\s*;\s*/g,'')+'\n';
}
const fontFaces=[];
for(const [file,family,weight] of [
 ['chakra-petch-600.ttf','Chakra Petch','600'],
 ['ibm-plex-mono-400.ttf','IBM Plex Mono','400'],
 ['ibm-plex-mono-500.ttf','IBM Plex Mono','500'],
 ['ibm-plex-mono-600.ttf','IBM Plex Mono','600']
]){
 const data=(await readFile(join(root,'vendor','fonts',file))).toString('base64');
 fontFaces.push(`@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/ttf;base64,${data}) format('truetype')}`);
}
styles=fontFaces.join('\n')+'\n'+styles+"\n:root{--body:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif}\n";
const icon=(await readFile(join(dist,'favicon.svg'))).toString('base64');
let html=await readFile(join(dist,'index.html'),'utf8');
html=html
 .replace(/\s*<link rel="stylesheet"[^>]*>/g,'')
 .replace(/<link rel="icon"[^>]*>/,`<link rel="icon" href="data:image/svg+xml;base64,${icon}" type="image/svg+xml">`)
 .replace('</head>',`<style>\n${styles}\n</style>\n</head>`)
 .replace('class="brand" href="./"','class="brand" href="./OYNA.html"')
 .replace(/<script type="module" src="\.\/app\.mjs"><\/script>/,`<script>\n${script.replace(/<\/script/gi,'<\\/script')}\n</script>`);
if(html.includes('type="module"')||/@import\b/.test(html)||/https?:\/\//.test(styles))throw Error('Portable output contains an external dependency.');
await writeFile(join(folder,'OYNA.html'),html);
await writeFile(join(folder,'BLOK Aç.command'),'#!/bin/zsh\nset -eu\npackage_dir=${0:A:h}\nexec /usr/bin/open "$package_dir/OYNA.html"\n',{mode:0o755});
await writeFile(join(folder,'BENİ OKU.txt'),`FAMILYTRIS // NEON ARCADE — MAC

BAŞLATMA
OYNA.html dosyasına çift tıkla. Oyun varsayılan tarayıcında açılır.
İstersen “BLOK Aç.command” başlatıcısını da kullanabilirsin.
Kurulum, terminal komutu, Node, Python veya internet gerekmez.

KONTROLLER
← / → : Hareket     ↑ / X : Döndür     Z : Ters döndür
↓ : Hızlandır      Space : Anında bırak
C : Parçayı sakla   P / Esc : Duraklat / devam et

AİLEM
Üstteki Ailem düğmesinden en fazla 7 yüz fotoğrafı ekleyebilirsin.
Yüz otomatik bulunur ve hazır çizgi gövdelere yerleştirilir.
Fotoğraflar internete gönderilmez; cihazdaki tarayıcı kaydında saklanır.
Kişilerin yanındaki Sil düğmesi fotoğrafı aile kaydından kaldırır.
Fotoğraf eklemeden hazır karakterlerle de oynayabilirsin.

SES
Sesler “Oyuna başla”ya bastıktan sonra çalışır.
Üstteki hoparlör düğmesi sesi açar/kapatır.
Sayfanın altından ses düzeyini ayarlayabilir veya “Sesi dene”ye basabilirsin.

REKOR
Tarayıcı izin verirse rekor ve ses tercihi bu bilgisayarda saklanır.
Bu kopyanın rekoru çevrimiçi oyundaki rekordan ayrı olabilir.

TAŞIMA
Klasörü dilediğin yere taşıyabilirsin. OYNA.html tek başına da çalışır.
Geliştirme projesi ve Git geçmişi bu dağıtım paketine dahil değildir.
Yazı tipi lisansları “Lisanslar” klasöründedir.
Yüz bulma kodu ve modeli pico / pico.js (MIT) kullanır; lisansı aynı klasördedir.
`);
const licenses=join(folder,'Lisanslar');
await mkdir(licenses,{recursive:true});
for(const name of ['chakrapetch-OFL.txt','ibmplexmono-OFL.txt'])await copyFile(join(root,'vendor','fonts',name),join(licenses,name));
await copyFile(join(root,'vendor','pico-MIT.txt'),join(licenses,'pico-MIT.txt'));

// Python is used only by this packaging script; it is never needed to play.
const zipProgram=`import pathlib,sys,zipfile
folder=pathlib.Path(sys.argv[1])
archive=pathlib.Path(sys.argv[2])
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in sorted(folder.rglob('*')):
        if p.is_file():
            z.write(p,p.relative_to(folder.parent))
`;
execFileSync(process.env.PYTHON||'/usr/bin/python3',['-c',zipProgram,folder,archive]);
const htmlSize=(await stat(join(folder,'OYNA.html'))).size;
const zipSize=(await stat(archive)).size;
console.log(JSON.stringify({folder,html:join(folder,'OYNA.html'),archive,html_bytes:htmlSize,zip_bytes:zipSize}));
