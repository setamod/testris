import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import vm from 'node:vm';

const root=new URL('..',import.meta.url);
const html=readFileSync(new URL('../android/app/src/main/assets/game/index.html',import.meta.url),'utf8');
const source=readFileSync(new URL('../android/app/src/main/java/com/mertbekisoglu/familytris/MainActivity.kt',import.meta.url),'utf8');
const manifest=readFileSync(new URL('../android/app/src/main/AndroidManifest.xml',import.meta.url),'utf8');

test('Android game is a self-contained classic script with no remote dependencies',()=>{
 const code=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 assert.ok(code);
 assert.doesNotThrow(()=>new vm.Script(code));
 assert.ok(!/type="module"|@import\s|(?:src|href)=["']https?:/i.test(html));
 assert.ok(html.includes('globalThis.BLOK?.getPreference?.(key)'));
 assert.ok(html.includes('globalThis.BLOK?.savePreference?.(key,text)'));
 assert.ok(html.includes('globalThis.BLOK?.showSettings?.()'));
});

test('Android host locks the WebView to local assets and validates bridge writes',()=>{
 assert.ok(source.includes('blockNetworkLoads = true'));
 assert.ok(source.includes('allowUniversalAccessFromFileURLs = false'));
 assert.ok(source.includes('shouldOverrideUrlLoading'));
 assert.ok(source.includes('isValidFamily(value)'));
 assert.ok(source.includes('value.toByteArray().size > 1_000_000'));
 assert.ok(manifest.includes('android:screenOrientation="portrait"'));
 assert.ok(statSync(new URL('../android/app/src/main/assets/legal/pico-MIT.txt',import.meta.url)).size > 0);
});
