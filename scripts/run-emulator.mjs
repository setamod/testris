import {spawn} from 'node:child_process';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),base=join(root,'.tooling');
const env={...process.env,ANDROID_HOME:join(base,'android-sdk'),ANDROID_SDK_ROOT:join(base,'android-sdk'),ANDROID_USER_HOME:join(base,'android-home'),ANDROID_AVD_HOME:join(base,'android-home','avd')};
const child=spawn(join(base,'android-sdk','emulator','emulator'),['-avd','Kynburst-QA-36','-no-window','-no-audio','-no-boot-anim','-no-snapshot','-gpu','host','-feature','-Vulkan'],{env,stdio:'inherit'});
process.on('SIGINT',()=>child.kill('SIGTERM'));process.on('SIGTERM',()=>child.kill('SIGTERM'));
child.on('error',error=>{console.error(error.message);process.exitCode=1;});child.on('exit',code=>{process.exitCode=code??1;});
