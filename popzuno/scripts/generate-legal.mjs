import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
export const LEGAL_FILES=['chakrapetch-OFL.txt','ibmplexmono-OFL.txt','pico-MIT.txt','music-NOTICE.txt','SOURCES.md','ASSET-INVENTORY.json'];
const notices=await Promise.all(LEGAL_FILES.map(async file=>({file,text:await readFile(new URL('vendor/'+file,root),'utf8')})));
await writeFile(new URL('dist/legal.mjs',root),'// Generated from vendor notices. Do not edit this snapshot.\nexport const LEGAL_NOTICES='+JSON.stringify(notices,null,2)+';\n');
