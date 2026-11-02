import {readFile,writeFile,mkdir,copyFile,stat} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
import {LEGAL_FILES} from './generate-legal.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
execFileSync(process.execPath,[join(root,'scripts','check-monetization-release.mjs')],{stdio:'pipe'});
const ios=join(root,'ios'),app=join(ios,'Bulusko'),project=join(ios,'Bulusko.xcodeproj'),gameFolder=join(app,'Resources','Game');
const packageInfo=JSON.parse(await readFile(join(root,'package.json'),'utf8'));
let commerce=JSON.parse(await readFile(join(root,'config','monetization.json'),'utf8'));try{commerce={...commerce,...JSON.parse(await readFile(join(root,'monetization.local.json'),'utf8'))};}catch{}
const releaseInfo=JSON.parse(await readFile(join(root,'publication','release-config.json'),'utf8'));
await mkdir(gameFolder,{recursive:true});
execFileSync(process.execPath,[join(root,'scripts','package.mjs')],{stdio:'pipe'});
let html=await readFile(join(root,'releases','Popzuno-Prototip','OYNA.html'),'utf8');
const before='width=device-width, initial-scale=1, viewport-fit=cover';
if(!html.includes(before))throw Error('Viewport integration changed.');
html=html.replace(before,'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover').replace('href="./OYNA.html"','href="./index.html"');
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
await writeFile(join(gameFolder,'index.html'),html);
await mkdir(join(app,'Resources','Legal'),{recursive:true});
for(const name of LEGAL_FILES)await copyFile(join(root,'vendor',name),join(app,'Resources','Legal',name));
// Native SDKs are pinned; the standalone web game retains no runtime network dependency.
await writeFile(join(app,'CommerceConfig.swift'),`import Foundation
enum CommerceConfig {
 static let productID = ${JSON.stringify(commerce.productId)}
 static let storeEnabled = ${commerce.storeProductsEnabled===true}
 #if DEBUG
 static let adsEnabled = true
 static let rewardedID = "ca-app-pub-3940256099942544/1712485313"
 #else
 static let adsEnabled = ${commerce.liveAdsEnabled===true&&commerce.audienceApproved===true&&commerce.privacyDeclarationsApproved===true}
 static let rewardedID = ${JSON.stringify(commerce.liveAdsEnabled===true?commerce.iosRewardedAdUnitId:'')}
 #endif
}
`);
//
// Native SDKs resolve through the exact SPM versions below; web assets remain self-contained.
const id=name=>createHash('sha256').update('bulusko-ios:'+name).digest('hex').slice(0,24).toUpperCase();
const objects={};
const add=(name,value)=>(objects[id(name)]=value,id(name));
const refs={};
const permissionCopy={
 tr:['Popzuno karakteri için isteğe bağlı fotoğraf çek. Fotoğraf cihazında işlenir.','Yalnızca seçtiğin fotoğraf karakteri kişiselleştirmek için cihazında işlenir.'],
 en:['Take an optional photo for your Popzuno character. Processing stays on your device.','Only the photo you select is processed on your device to personalize your character.'],
 it:['Scatta una foto facoltativa per il personaggio Popzuno. L’elaborazione avviene sul dispositivo.','Solo la foto scelta viene elaborata sul dispositivo per personalizzare il personaggio.'],
 es:['Haz una foto opcional para tu personaje Popzuno. Se procesa en tu dispositivo.','Solo la foto elegida se procesa en tu dispositivo para personalizar el personaje.'],
 de:['Nimm optional ein Foto für deine Popzuno-Figur auf. Die Verarbeitung bleibt auf dem Gerät.','Nur das ausgewählte Foto wird auf dem Gerät zur Anpassung deiner Figur verarbeitet.'],
 ru:['Сделай необязательное фото для персонажа Popzuno. Обработка выполняется на устройстве.','Только выбранное фото обрабатывается на устройстве для настройки персонажа.']
};
for(const [lang,[camera,photo]]of Object.entries(permissionCopy)){
 await mkdir(join(app,lang+'.lproj'),{recursive:true});
 await writeFile(join(app,lang+'.lproj','InfoPlist.strings'),`"CFBundleDisplayName" = "Popzuno";\n"NSCameraUsageDescription" = ${JSON.stringify(camera)};\n"NSPhotoLibraryUsageDescription" = ${JSON.stringify(photo)};\n`);
 refs['lang-'+lang]=add('ref-lang-'+lang,{isa:'PBXFileReference',lastKnownFileType:'folder',path:lang+'.lproj',sourceTree:'<group>'});
}
for(const [name,path,type] of [
 ['app','BuluskoApp.swift','sourcecode.swift'],['web','GameWebView.swift','sourcecode.swift'],['audio','Haptics.swift','sourcecode.swift'],['announcer','ArcadeAnnouncer.swift','sourcecode.swift'],['profile','NativeStore.swift','sourcecode.swift'],['photo','PhotoAlignment.swift','sourcecode.swift'],...['CommerceConfig','CommerceLedger','CommerceService','PremiumStore'].map(n=>[n,n+'.swift','sourcecode.swift']),
 ['info','Info.plist','text.plist.xml'],['privacy','PrivacyInfo.xcprivacy','text.xml'],
 ['assets','Assets.xcassets','folder.assetcatalog'],['game','Resources/Game','folder'],['legal','Resources/Legal','folder']
])refs[name]=add(`ref-${name}`,{isa:'PBXFileReference',lastKnownFileType:type,path,sourceTree:'<group>'});
const product=add('product',{isa:'PBXFileReference',explicitFileType:'wrapper.application',includeInIndex:0,path:'Bulusko.app',sourceTree:'BUILT_PRODUCTS_DIR'});
for(const name of ['app','web','audio','announcer','profile','photo','CommerceConfig','CommerceLedger','CommerceService','PremiumStore','privacy','assets','game','legal',...Object.keys(permissionCopy).map(lang=>'lang-'+lang)])add(`build-${name}`,{isa:'PBXBuildFile',fileRef:refs[name]});
add('main-group',{isa:'PBXGroup',children:[id('app-group'),id('products-group')],sourceTree:'<group>'});
add('app-group',{isa:'PBXGroup',path:'Bulusko',children:Object.values(refs),sourceTree:'<group>'});
add('products-group',{isa:'PBXGroup',name:'Products',children:[product],sourceTree:'<group>'});
add('sources',{isa:'PBXSourcesBuildPhase',buildActionMask:2147483647,files:['app','web','audio','announcer','profile','photo','CommerceConfig','CommerceLedger','CommerceService','PremiumStore'].map(n=>id(`build-${n}`)),runOnlyForDeploymentPostprocessing:0});
add('resources',{isa:'PBXResourcesBuildPhase',buildActionMask:2147483647,files:['privacy','assets','game','legal',...Object.keys(permissionCopy).map(lang=>'lang-'+lang)].map(n=>id(`build-${n}`)),runOnlyForDeploymentPostprocessing:0});
add('frameworks',{isa:'PBXFrameworksBuildPhase',buildActionMask:2147483647,files:[],runOnlyForDeploymentPostprocessing:0});
const packageRefs=[],productRefs=[];
for(const [name,url,version]of [['GoogleMobileAds','https://github.com/googleads/swift-package-manager-google-mobile-ads.git','13.11.0'],['GoogleUserMessagingPlatform','https://github.com/googleads/swift-package-manager-google-user-messaging-platform.git','3.1.0']]){
 const ref=add('package-'+name,{isa:'XCRemoteSwiftPackageReference',repositoryURL:url,requirement:{kind:'exactVersion',version}});packageRefs.push(ref);
 const product=add('package-product-'+name,{isa:'XCSwiftPackageProductDependency',package:ref,productName:name});productRefs.push(product);
 const build=add('package-build-'+name,{isa:'PBXBuildFile',productRef:product});objects[id('frameworks')].files.push(build);
}
const commonProject={CLANG_ENABLE_MODULES:'YES',CLANG_ENABLE_OBJC_ARC:'YES',IPHONEOS_DEPLOYMENT_TARGET:'16.0',SDKROOT:'iphoneos',SWIFT_VERSION:'5.0'};
const commonTarget={ASSETCATALOG_COMPILER_APPICON_NAME:'AppIcon',CODE_SIGN_STYLE:'Automatic',CURRENT_PROJECT_VERSION:'9',DEVELOPMENT_TEAM:'S78QDU24NX',ENABLE_PREVIEWS:'YES',GENERATE_INFOPLIST_FILE:'NO',INFOPLIST_FILE:'Bulusko/Info.plist',OTHER_LDFLAGS:['$(inherited)','-ObjC'],LD_RUNPATH_SEARCH_PATHS:['$(inherited)','@executable_path/Frameworks'],MARKETING_VERSION:'0.9.0',PRODUCT_BUNDLE_IDENTIFIER:'com.mertbekisoglu.bulusko',PRODUCT_NAME:'$(TARGET_NAME)',SUPPORTED_PLATFORMS:'iphoneos iphonesimulator',SUPPORTS_MACCATALYST:'NO',SUPPORTS_MAC_DESIGNED_FOR_IPHONE_IPAD:'NO',SWIFT_EMIT_LOC_STRINGS:'YES',TARGETED_DEVICE_FAMILY:'1'};
// Keep the identity and signing choices made in Xcode when refreshing the game.
let previousProject;
try{previousProject=JSON.parse(execFileSync('/usr/bin/plutil',['-convert','json','-o','-',join(project,'project.pbxproj')],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));}catch{}
commonTarget.MARKETING_VERSION=packageInfo.version;commonTarget.CURRENT_PROJECT_VERSION=String(releaseInfo.build);
const retainedIdentityKeys=['DEVELOPMENT_TEAM','PRODUCT_BUNDLE_IDENTIFIER','CODE_SIGN_IDENTITY'];
for(const kind of ['project','target']){
 for(const mode of ['Debug','Release']){
  const settings={...(kind==='project'?commonProject:commonTarget)};
  if(kind==='target'){settings.POPZUNO_ADMOB_APP_ID=mode==='Debug'?'ca-app-pub-3940256099942544~1458002511':commerce.iosAdMobAppId||'ca-app-pub-0000000000000000~0000000000';const previous=previousProject?.objects?.[id(`target-${mode}`)]?.buildSettings??{};for(const key of retainedIdentityKeys)if(typeof previous[key]==='string')settings[key]=previous[key];}
  if(kind==='project')Object.assign(settings,mode==='Debug'?{DEBUG_INFORMATION_FORMAT:'dwarf',ENABLE_TESTABILITY:'YES',GCC_PREPROCESSOR_DEFINITIONS:['DEBUG=1','$(inherited)'],ONLY_ACTIVE_ARCH:'YES',SWIFT_ACTIVE_COMPILATION_CONDITIONS:'DEBUG',SWIFT_OPTIMIZATION_LEVEL:'-Onone'}:{DEBUG_INFORMATION_FORMAT:'dwarf-with-dsym',SWIFT_COMPILATION_MODE:'wholemodule',SWIFT_OPTIMIZATION_LEVEL:'-O',VALIDATE_PRODUCT:'YES'});
  add(`${kind}-${mode}`,{isa:'XCBuildConfiguration',buildSettings:settings,name:mode});
 }
 add(`${kind}-configs`,{isa:'XCConfigurationList',buildConfigurations:[id(`${kind}-Debug`),id(`${kind}-Release`)],defaultConfigurationIsVisible:0,defaultConfigurationName:'Release'});
}
add('target',{isa:'PBXNativeTarget',buildConfigurationList:id('target-configs'),buildPhases:[id('sources'),id('frameworks'),id('resources')],buildRules:[],dependencies:[],packageProductDependencies:productRefs,name:'Bulusko',productName:'Bulusko',productReference:product,productType:'com.apple.product-type.application'});
add('project',{isa:'PBXProject',attributes:{BuildIndependentTargetsInParallel:'YES',LastSwiftUpdateCheck:'2600',LastUpgradeCheck:'2600',TargetAttributes:{[id('target')]:{CreatedOnToolsVersion:'26.0',ProvisioningStyle:'Automatic'}}},buildConfigurationList:id('project-configs'),compatibilityVersion:'Xcode 14.0',developmentRegion:'tr',hasScannedForEncodings:0,knownRegions:['tr','en','it','es','de','ru','Base'],mainGroup:id('main-group'),productRefGroup:id('products-group'),projectDirPath:'',projectRoot:'',packageReferences:packageRefs,targets:[id('target')]});
// Hosted native StoreKit tests use a bundled local catalog and never charge an account.
const testSource=add('test-source',{isa:'PBXFileReference',lastKnownFileType:'sourcecode.swift',path:'PremiumStoreTests.swift',sourceTree:'<group>'});
const testCatalog=add('test-catalog',{isa:'PBXFileReference',lastKnownFileType:'text.json',path:'PopzunoPremium.storekit',sourceTree:'<group>'});
const testProduct=add('test-product',{isa:'PBXFileReference',explicitFileType:'wrapper.cfbundle',path:'CommerceTests.xctest',sourceTree:'BUILT_PRODUCTS_DIR'});
add('test-group',{isa:'PBXGroup',path:'../tests',children:[testSource,testCatalog],sourceTree:'<group>'});objects[id('main-group')].children.push(id('test-group'));objects[id('products-group')].children.push(testProduct);
const testBuild=add('test-source-build',{isa:'PBXBuildFile',fileRef:testSource}),catalogBuild=add('test-catalog-build',{isa:'PBXBuildFile',fileRef:testCatalog});
add('test-sources',{isa:'PBXSourcesBuildPhase',buildActionMask:2147483647,files:[testBuild],runOnlyForDeploymentPostprocessing:0});
add('test-resources',{isa:'PBXResourcesBuildPhase',buildActionMask:2147483647,files:[catalogBuild],runOnlyForDeploymentPostprocessing:0});
add('test-frameworks',{isa:'PBXFrameworksBuildPhase',buildActionMask:2147483647,files:[],runOnlyForDeploymentPostprocessing:0});
add('test-dependency',{isa:'PBXTargetDependency',target:id('target')});
for(const mode of ['Debug','Release'])add('test-'+mode,{isa:'XCBuildConfiguration',name:mode,buildSettings:{PRODUCT_NAME:'CommerceTests',PRODUCT_BUNDLE_IDENTIFIER:'com.mertbekisoglu.bulusko.commerce-tests',SWIFT_VERSION:'5.0',GENERATE_INFOPLIST_FILE:'YES',IPHONEOS_DEPLOYMENT_TARGET:'17.0',SDKROOT:'iphoneos',TARGETED_DEVICE_FAMILY:'1',TEST_HOST:'$(BUILT_PRODUCTS_DIR)/Bulusko.app/Bulusko',BUNDLE_LOADER:'$(TEST_HOST)',ENABLE_TESTING_SEARCH_PATHS:'YES',FRAMEWORK_SEARCH_PATHS:['$(inherited)','$(PLATFORM_DIR)/Developer/Library/Frameworks','$(SDKROOT)/Developer/Library/Frameworks']}});
add('test-configs',{isa:'XCConfigurationList',buildConfigurations:[id('test-Debug'),id('test-Release')],defaultConfigurationIsVisible:0,defaultConfigurationName:'Release'});
add('test-target',{isa:'PBXNativeTarget',buildConfigurationList:id('test-configs'),buildPhases:[id('test-sources'),id('test-frameworks'),id('test-resources')],buildRules:[],dependencies:[id('test-dependency')],name:'CommerceTests',productName:'CommerceTests',productReference:testProduct,productType:'com.apple.product-type.bundle.unit-test'});
objects[id('project')].targets.push(id('test-target'));
function serialize(value,depth=0){const pad='\t'.repeat(depth),next='\t'.repeat(depth+1);if(Array.isArray(value))return `(\n${value.map(v=>next+serialize(v,depth+1)+',').join('\n')}\n${pad})`;if(value&&typeof value==='object')return `{\n${Object.entries(value).map(([k,v])=>next+JSON.stringify(k)+' = '+serialize(v,depth+1)+';').join('\n')}\n${pad}}`;return typeof value==='number'?String(value):JSON.stringify(value);}
await mkdir(join(project,'xcshareddata','xcschemes'),{recursive:true});
await mkdir(join(project,'project.xcworkspace'),{recursive:true});
await writeFile(join(project,'project.pbxproj'),'// !$*UTF8*$!\n'+serialize({archiveVersion:1,classes:{},objectVersion:56,objects,rootObject:id('project')})+'\n');
await writeFile(join(project,'project.xcworkspace','contents.xcworkspacedata'),'<?xml version="1.0" encoding="UTF-8"?><Workspace version="1.0"><FileRef location="self:"></FileRef></Workspace>\n');
const buildable=`<BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${id('target')}" BuildableName="Bulusko.app" BlueprintName="Bulusko" ReferencedContainer="container:Bulusko.xcodeproj"/>`;
await writeFile(join(project,'xcshareddata','xcschemes','Bulusko.xcscheme'),`<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="2600" version="1.3">
<BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES"><BuildActionEntries><BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES">${buildable}</BuildActionEntry></BuildActionEntries></BuildAction>
<TestAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv="YES"><Testables><TestableReference skipped="NO"><BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${id('test-target')}" BuildableName="CommerceTests.xctest" BlueprintName="CommerceTests" ReferencedContainer="container:Bulusko.xcodeproj"/></TestableReference></Testables></TestAction>
<LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" debugServiceExtension="internal" allowLocationSimulation="YES"><BuildableProductRunnable runnableDebuggingMode="0">${buildable}</BuildableProductRunnable></LaunchAction>
<ProfileAction buildConfiguration="Release" shouldUseLaunchSchemeArgsEnv="YES" savedToolIdentifier="" useCustomWorkingDirectory="NO" debugDocumentVersioning="YES"><BuildableProductRunnable runnableDebuggingMode="0">${buildable}</BuildableProductRunnable></ProfileAction>
<AnalyzeAction buildConfiguration="Debug"/><ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES"/>
</Scheme>`);
const assets=join(app,'Assets.xcassets');
await mkdir(join(assets,'LaunchBackground.colorset'),{recursive:true});
await writeFile(join(assets,'Contents.json'),JSON.stringify({info:{author:'xcode',version:1}},null,2));
await writeFile(join(assets,'LaunchBackground.colorset','Contents.json'),JSON.stringify({colors:[{idiom:'universal',color:{'color-space':'srgb',components:{red:'0.063',green:'0.071',blue:'0.114',alpha:'1.000'}}}],info:{author:'xcode',version:1}},null,2));
console.log(JSON.stringify({project,game:join(gameFolder,'index.html'),game_bytes:(await stat(join(gameFolder,'index.html'))).size,bundle_id:commonTarget.PRODUCT_BUNDLE_IDENTIFIER}));
