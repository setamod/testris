// Embed only verified, fixed speech outputs. Generation stays outside the app.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {CHEER_PHRASES} from '../dist/cheers.mjs';
const root=resolve(import.meta.dirname,'..'),report=JSON.parse(await readFile(resolve(root,'vendor/ANNOUNCER-ASSETS.json'),'utf8'));
const normalize=text=>text.toLowerCase().replace(/[^a-z0-9]/g,''),bank={};
for(const clip of report.clips){
 if(clip.phrase!==CHEER_PHRASES[clip.kind])throw Error('Phrase mismatch: '+clip.kind);
 const bytes=await readFile(resolve(root,'.tooling/expressive-output',clip.file)),hash=createHash('sha256').update(bytes).digest('hex');
 if(hash!==clip.sha256||bytes.length!==clip.bytes)throw Error('Asset mismatch: '+clip.kind);
 const checked=report.intelligibility_check?.results.find(item=>item.kind===clip.kind&&item.sha256===hash);
 if(!checked||normalize(checked.transcript)!==normalize(clip.phrase))throw Error('Missing matching speech check: '+clip.kind);
 if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.readUInt32LE(24)!==24000||Math.abs(bytes.readUInt32LE(40)/48000-clip.duration)>1e-6)throw Error('Invalid speech WAV: '+clip.kind);
 bank[clip.kind]={duration:clip.duration,bytes:bytes.length,sha256:hash,data:bytes.toString('base64')};
}
if(Object.keys(bank).length!==Object.keys(CHEER_PHRASES).length)throw Error('Incomplete fixed-call bank');
await writeFile(resolve(root,'dist/voice-bank.mjs'),'// Seven fixed synthetic outputs. Chatterbox (MIT), synthetic-only Kokoro reference (Apache-2.0). Default PerTh watermark retained. See vendor/ANNOUNCER-ASSETS.json. No model ships.\nexport const VOICE_CLIPS='+JSON.stringify(bank)+';\n');
console.log(JSON.stringify({clips:Object.keys(bank).length,bytes:report.clips.reduce((total,clip)=>total+clip.bytes,0),speechChecks:'all fixed phrases matched; owner listening remains final tone review'}));
