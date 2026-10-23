import {cp,mkdir,readFile,stat,writeFile} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const metadata=JSON.parse(await readFile(join(root,'android','play-store','metadata.tr.json'),'utf8'));
for(const [key,limit] of Object.entries({title:30,short_description:80,full_description:4000})){
 if([...metadata[key]].length>limit)throw Error(`Google Play ${key} exceeds ${limit} characters.`);
}
execFileSync(process.execPath,[join(root,'scripts','prepare-android.mjs')],{stdio:'inherit'});
const folder=resolve(root,'..','releases','Familytris-Android-Projesi');
const archive=folder+'.zip';
await mkdir(folder,{recursive:true});
await cp(join(root,'android'),folder,{recursive:true,filter:source=>!['.gradle','build','.idea'].includes(source.split('/').at(-1))});
execFileSync(process.env.PYTHON||'/usr/bin/python3',['-c',`import pathlib,sys,zipfile
folder=pathlib.Path(sys.argv[1])
with zipfile.ZipFile(sys.argv[2],'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
    for path in sorted(folder.rglob('*')):
        if path.is_file() and path.name!='.DS_Store': archive.write(path,path.relative_to(folder.parent))
`,folder,archive]);
console.log(JSON.stringify({folder,archive,bytes:(await stat(archive)).size}));
