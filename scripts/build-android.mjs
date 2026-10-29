import {existsSync} from 'node:fs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),tools=join(root,'.tooling');
const env={...process.env};
if(!env.JAVA_HOME){const {readdir}=await import('node:fs/promises');const folders=await readdir(join(tools,'jdk'));env.JAVA_HOME=join(tools,'jdk',folders.find(name=>name.startsWith('jdk-')),'Contents','Home');}
env.ANDROID_HOME??=join(tools,'android-sdk');env.ANDROID_SDK_ROOT??=env.ANDROID_HOME;
env.ANDROID_USER_HOME??=join(tools,'android-home');env.GRADLE_USER_HOME??=join(tools,'gradle-home');
const wrapper=join(root,'android','gradlew'),gradle=existsSync(wrapper)?wrapper:join(tools,'gradle-9.1.0','bin','gradle');
const tasks=process.argv.slice(2);if(!tasks.length)tasks.push('assembleDebug','lintRelease','bundleRelease');
const child=spawn(gradle,['--no-daemon','--console=plain',...tasks],{cwd:join(root,'android'),env,stdio:'inherit'});
child.on('error',error=>{console.error(error.message);process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code??1;});
