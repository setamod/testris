import {readFile,writeFile,mkdir,copyFile,stat} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const ios=join(root,'ios');
const app=join(ios,'Blok');
const project=join(ios,'BLOK.xcodeproj');
const gameFolder=join(app,'Resources','Game');
await mkdir(gameFolder,{recursive:true});
// Reuse the tested, fully offline game instead of relying on a hosted URL.
execFileSync(process.execPath,[join(root,'scripts','package-portable.mjs')],{stdio:'pipe'});
let html=await readFile(join(root,'..','releases','Familytris-Mac','OYNA.html'),'utf8');
function replaceRequired(before,after){if(!html.includes(before))throw Error(`iOS game integration is out of date: ${before.slice(0,55)}`);html=html.replace(before,after);}
replaceRequired('class="brand" href="./OYNA.html"','class="brand" href="./index.html"');
replaceRequired("const safeRead=(key,fallback)=>{try{return localStorage.getItem(key)??fallback;}catch{return fallback;}};",`const safeRead=(key,fallback)=>{try{const native=globalThis.__BLOK_NATIVE_STORAGE__;return native&&Object.prototype.hasOwnProperty.call(native,key)?native[key]:localStorage.getItem(key)??fallback;}catch{return fallback;}};`);
replaceRequired("const safeWrite=(key,value)=>{try{localStorage.setItem(key,String(value));}catch{}};",`const safeWrite=(key,value)=>{const text=String(value);if(globalThis.__BLOK_NATIVE_STORAGE__){globalThis.__BLOK_NATIVE_STORAGE__[key]=text;globalThis.webkit?.messageHandlers?.blok?.postMessage({type:'preference',key,value:text});}try{localStorage.setItem(key,text);}catch{}};`);
replaceRequired('function onEvent(event){',`function onEvent(event){
 if(['rotate','hold','drop','clear','over','start'].includes(event.type))globalThis.webkit?.messageHandlers?.blok?.postMessage({type:'feedback',event:event.type,count:event.count??0,levelUp:!!event.levelUp});`);
replaceRequired("preview('hold-canvas',game.held,!game.canHold);",`preview('hold-canvas',game.held,!game.canHold);preview('native-held',game.held,!game.canHold);$('native-held').setAttribute('aria-label',game.held?'Saklanan parça: '+names[game.held]:'Saklanan parça: boş');$('native-held-empty').hidden=!!game.held;`);
replaceRequired('<div class="tip-card">',`<div class="native-hold-card"><span class="section-label">CEPTEKİ PARÇA</span><canvas id="native-held" width="176" height="88" aria-label="Saklanan parça: boş"></canvas><span id="native-held-empty">C ile sakla</span></div><div class="tip-card">`);
replaceRequired('<button class="primary-button" id="got-it">',`<button id="native-settings" class="native-settings-button">Uygulama ayarları ve gizlilik</button><button class="primary-button" id="got-it">`);
const bridge=`
$('native-settings').addEventListener('click',()=>{wasPlayingBeforeHelp=false;dialog.close();autoPause();globalThis.webkit?.messageHandlers?.blok?.postMessage({type:'settings'});});
const nativeState=()=>globalThis.webkit?.messageHandlers?.blok?.postMessage({type:'state',playing:game.status==='playing'});
new MutationObserver(nativeState).observe($('game-status'),{childList:true,characterData:true,subtree:true});
nativeState();
`;
replaceRequired('\n})();\n</script>','\n'+bridge+'\n})();\n</script>');
const mobileStyles=await readFile(join(ios,'mobile.css'),'utf8');
replaceRequired('</head>',`<style>${mobileStyles}</style></head>`);
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
if(html.includes('type="module"')||/@import\s/.test(html))throw Error('iOS resources are not self-contained.');
await writeFile(join(gameFolder,'index.html'),html);
await mkdir(join(app,'Resources','Legal'),{recursive:true});
for(const name of ['chakrapetch-OFL.txt','ibmplexmono-OFL.txt'])await copyFile(join(root,'vendor','fonts',name),join(app,'Resources','Legal',name));
await copyFile(join(root,'vendor','pico-MIT.txt'),join(app,'Resources','Legal','pico-MIT.txt'));

// A dependency-free Xcode project; no npm, CocoaPods or SPM download is needed.
const id=name=>createHash('sha256').update('blok-ios:'+name).digest('hex').slice(0,24).toUpperCase();
const objects={};
const add=(name,value)=>(objects[id(name)]=value,id(name));
const refs={};
for(const [name,path,type] of [
 ['app','BlokApp.swift','sourcecode.swift'],['web','GameWebView.swift','sourcecode.swift'],
 ['info','Info.plist','text.plist.xml'],['privacy','PrivacyInfo.xcprivacy','text.xml'],
 ['assets','Assets.xcassets','folder.assetcatalog'],['game','Resources/Game','folder'],['legal','Resources/Legal','folder']
])refs[name]=add(`ref-${name}`,{isa:'PBXFileReference',lastKnownFileType:type,path,sourceTree:'<group>'});
const product=add('product',{isa:'PBXFileReference',explicitFileType:'wrapper.application',includeInIndex:0,path:'BLOK.app',sourceTree:'BUILT_PRODUCTS_DIR'});
for(const name of ['app','web','privacy','assets','game','legal'])add(`build-${name}`,{isa:'PBXBuildFile',fileRef:refs[name]});
add('main-group',{isa:'PBXGroup',children:[id('app-group'),id('products-group')],sourceTree:'<group>'});
add('app-group',{isa:'PBXGroup',path:'Blok',children:Object.values(refs),sourceTree:'<group>'});
add('products-group',{isa:'PBXGroup',name:'Products',children:[product],sourceTree:'<group>'});
add('sources',{isa:'PBXSourcesBuildPhase',buildActionMask:2147483647,files:['app','web'].map(n=>id(`build-${n}`)),runOnlyForDeploymentPostprocessing:0});
add('resources',{isa:'PBXResourcesBuildPhase',buildActionMask:2147483647,files:['privacy','assets','game','legal'].map(n=>id(`build-${n}`)),runOnlyForDeploymentPostprocessing:0});
add('frameworks',{isa:'PBXFrameworksBuildPhase',buildActionMask:2147483647,files:[],runOnlyForDeploymentPostprocessing:0});
const commonProject={CLANG_ENABLE_MODULES:'YES',CLANG_ENABLE_OBJC_ARC:'YES',IPHONEOS_DEPLOYMENT_TARGET:'16.0',SDKROOT:'iphoneos',SWIFT_VERSION:'5.0'};
const commonTarget={ASSETCATALOG_COMPILER_APPICON_NAME:'AppIcon',CODE_SIGN_STYLE:'Automatic',CURRENT_PROJECT_VERSION:'1',DEVELOPMENT_TEAM:'',ENABLE_PREVIEWS:'YES',GENERATE_INFOPLIST_FILE:'NO',INFOPLIST_FILE:'Blok/Info.plist',LD_RUNPATH_SEARCH_PATHS:['$(inherited)','@executable_path/Frameworks'],MARKETING_VERSION:'1.0.0',PRODUCT_BUNDLE_IDENTIFIER:'com.mertbekisoglu.blok',PRODUCT_NAME:'$(TARGET_NAME)',SUPPORTED_PLATFORMS:'iphoneos iphonesimulator',SUPPORTS_MACCATALYST:'NO',SUPPORTS_MAC_DESIGNED_FOR_IPHONE_IPAD:'NO',SWIFT_EMIT_LOC_STRINGS:'YES',TARGETED_DEVICE_FAMILY:'1'};
// Keep the identity and signing choices made in Xcode when refreshing the game.
let previousProject;
try{previousProject=JSON.parse(execFileSync('/usr/bin/plutil',['-convert','json','-o','-',join(project,'project.pbxproj')],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));}catch{}
const retainedIdentityKeys=['DEVELOPMENT_TEAM','PRODUCT_BUNDLE_IDENTIFIER','MARKETING_VERSION','CURRENT_PROJECT_VERSION','CODE_SIGN_IDENTITY'];
for(const kind of ['project','target']){
 for(const mode of ['Debug','Release']){
  const settings={...(kind==='project'?commonProject:commonTarget)};
  if(kind==='target'){const previous=previousProject?.objects?.[id(`target-${mode}`)]?.buildSettings??{};for(const key of retainedIdentityKeys)if(typeof previous[key]==='string')settings[key]=previous[key];}
  if(kind==='project')Object.assign(settings,mode==='Debug'?{DEBUG_INFORMATION_FORMAT:'dwarf',ENABLE_TESTABILITY:'YES',GCC_PREPROCESSOR_DEFINITIONS:['DEBUG=1','$(inherited)'],ONLY_ACTIVE_ARCH:'YES',SWIFT_ACTIVE_COMPILATION_CONDITIONS:'DEBUG',SWIFT_OPTIMIZATION_LEVEL:'-Onone'}:{DEBUG_INFORMATION_FORMAT:'dwarf-with-dsym',SWIFT_COMPILATION_MODE:'wholemodule',SWIFT_OPTIMIZATION_LEVEL:'-O',VALIDATE_PRODUCT:'YES'});
  add(`${kind}-${mode}`,{isa:'XCBuildConfiguration',buildSettings:settings,name:mode});
 }
 add(`${kind}-configs`,{isa:'XCConfigurationList',buildConfigurations:[id(`${kind}-Debug`),id(`${kind}-Release`)],defaultConfigurationIsVisible:0,defaultConfigurationName:'Release'});
}
add('target',{isa:'PBXNativeTarget',buildConfigurationList:id('target-configs'),buildPhases:[id('sources'),id('frameworks'),id('resources')],buildRules:[],dependencies:[],name:'BLOK',productName:'BLOK',productReference:product,productType:'com.apple.product-type.application'});
add('project',{isa:'PBXProject',attributes:{BuildIndependentTargetsInParallel:'YES',LastSwiftUpdateCheck:'2600',LastUpgradeCheck:'2600',TargetAttributes:{[id('target')]:{CreatedOnToolsVersion:'26.0',ProvisioningStyle:'Automatic'}}},buildConfigurationList:id('project-configs'),compatibilityVersion:'Xcode 14.0',developmentRegion:'tr',hasScannedForEncodings:0,knownRegions:['tr','en','Base'],mainGroup:id('main-group'),productRefGroup:id('products-group'),projectDirPath:'',projectRoot:'',targets:[id('target')]});
function serialize(value,depth=0){const pad='\t'.repeat(depth),next='\t'.repeat(depth+1);if(Array.isArray(value))return `(\n${value.map(v=>next+serialize(v,depth+1)+',').join('\n')}\n${pad})`;if(value&&typeof value==='object')return `{\n${Object.entries(value).map(([k,v])=>next+JSON.stringify(k)+' = '+serialize(v,depth+1)+';').join('\n')}\n${pad}}`;return typeof value==='number'?String(value):JSON.stringify(value);}
await mkdir(join(project,'xcshareddata','xcschemes'),{recursive:true});
await mkdir(join(project,'project.xcworkspace'),{recursive:true});
await writeFile(join(project,'project.pbxproj'),'// !$*UTF8*$!\n'+serialize({archiveVersion:1,classes:{},objectVersion:56,objects,rootObject:id('project')})+'\n');
await writeFile(join(project,'project.xcworkspace','contents.xcworkspacedata'),'<?xml version="1.0" encoding="UTF-8"?><Workspace version="1.0"><FileRef location="self:"></FileRef></Workspace>\n');
const buildable=`<BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${id('target')}" BuildableName="BLOK.app" BlueprintName="BLOK" ReferencedContainer="container:BLOK.xcodeproj"/>`;
await writeFile(join(project,'xcshareddata','xcschemes','BLOK.xcscheme'),`<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="2600" version="1.3">
<BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES"><BuildActionEntries><BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES">${buildable}</BuildActionEntry></BuildActionEntries></BuildAction>
<TestAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv="YES"><Testables/></TestAction>
<LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" debugServiceExtension="internal" allowLocationSimulation="YES"><BuildableProductRunnable runnableDebuggingMode="0">${buildable}</BuildableProductRunnable></LaunchAction>
<ProfileAction buildConfiguration="Release" shouldUseLaunchSchemeArgsEnv="YES" savedToolIdentifier="" useCustomWorkingDirectory="NO" debugDocumentVersioning="YES"><BuildableProductRunnable runnableDebuggingMode="0">${buildable}</BuildableProductRunnable></ProfileAction>
<AnalyzeAction buildConfiguration="Debug"/><ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES"/>
</Scheme>`);
const assets=join(app,'Assets.xcassets');
await mkdir(join(assets,'LaunchBackground.colorset'),{recursive:true});
await writeFile(join(assets,'Contents.json'),JSON.stringify({info:{author:'xcode',version:1}},null,2));
await writeFile(join(assets,'LaunchBackground.colorset','Contents.json'),JSON.stringify({colors:[{idiom:'universal',color:{'color-space':'srgb',components:{red:'0.031',green:'0.043',blue:'0.078',alpha:'1.000'}}}],info:{author:'xcode',version:1}},null,2));
console.log(JSON.stringify({project,game:join(gameFolder,'index.html'),game_bytes:(await stat(join(gameFolder,'index.html'))).size,bundle_id:commonTarget.PRODUCT_BUNDLE_IDENTIFIER}));
