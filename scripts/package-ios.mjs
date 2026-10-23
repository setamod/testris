import {execFileSync} from 'node:child_process';
import {cp,mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve,dirname,join,basename} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const metadata=JSON.parse(await readFile(join(root,'ios/AppStore/metadata.tr.json'),'utf8'));
for(const [key,limit] of Object.entries({name:30,subtitle:30,keywords:100,promotional_text:170})){
    if([...metadata[key]].length>limit)throw Error(`App Store ${key} exceeds ${limit} characters.`);
}
execFileSync(process.execPath,[join(root,'scripts','prepare-ios.mjs')],{stdio:'inherit'});
execFileSync('/usr/bin/plutil',['-lint',join(root,'ios/BLOK.xcodeproj/project.pbxproj'),join(root,'ios/Blok/Info.plist'),join(root,'ios/Blok/PrivacyInfo.xcprivacy')],{stdio:'inherit'});
execFileSync('/usr/bin/swiftc',['-frontend','-parse',join(root,'ios/Blok/BlokApp.swift'),join(root,'ios/Blok/GameWebView.swift')],{stdio:'inherit'});
execFileSync(process.execPath,['--test',join(root,'tests/engine.test.mjs'),join(root,'tests/audio.test.mjs'),join(root,'tests/family.test.mjs'),join(root,'tests/ios-package.test.mjs')],{stdio:'inherit'});
let xcodeAvailable=false;
try{execFileSync('/usr/bin/xcrun',['--find','xcodebuild'],{stdio:'pipe'});xcodeAvailable=true;}catch{}
const status={swift_syntax:'passed',project_plists:'passed',javascript_tests:39,xcode_available:xcodeAvailable,ios_build:'not_run',physical_device_test:'not_run',signing_team_configured:false,app_store_submission:'not_performed'};
await writeFile(join(root,'ios/BUILD_STATUS.json'),JSON.stringify(status,null,2)+'\n');
const folder=resolve(root,'..','releases','Familytris-iOS-Projesi');
const archive=folder+'.zip';
await mkdir(folder,{recursive:true});
await cp(join(root,'ios'),folder,{recursive:true,filter:source=>!['build','build-device','DerivedData','xcuserdata'].includes(basename(source))});
execFileSync(process.env.PYTHON||'/usr/bin/python3',['-c',`import pathlib,sys,zipfile
folder=pathlib.Path(sys.argv[1])
with zipfile.ZipFile(sys.argv[2],'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
    for p in sorted(folder.rglob('*')):
        if p.is_file() and p.name!='.DS_Store': archive.write(p,p.relative_to(folder.parent))
`,folder,archive]);
console.log(JSON.stringify({folder,archive,project:join(folder,'BLOK.xcodeproj'),xcode_available:xcodeAvailable,ios_build_performed:false}));
