package com.mertbekisoglu.bulusko;

import android.app.Activity;
import android.app.Instrumentation;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.os.Handler;
import android.os.Looper;
import android.view.PixelCopy;
import android.view.MotionEvent;
import android.view.ViewGroup;
import android.webkit.WebView;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.File;
import java.io.FileOutputStream;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

/** Self-contained smoke test. Deliberately refuses release apps and physical devices. */
public final class SmokeInstrumentation extends Instrumentation {
    private Activity activity;
    private WebView web;
    private final StringBuilder passed = new StringBuilder();
    @Override public void onCreate(Bundle arguments) { super.onCreate(arguments); start(); }
    @Override public void onStart() {
        Bundle result = new Bundle();
        try {
            check(getTargetContext().getPackageName().endsWith(".debug"),"debug-only guard");
            check(Build.HARDWARE.equals("ranchu") || Build.HARDWARE.equals("goldfish") || Build.MODEL.toLowerCase(java.util.Locale.ROOT).contains("sdk"),"emulator-only guard");
            getUiAutomation(); // Connect before gameplay so first capture cannot change window focus.
            ActivityMonitor monitor=addMonitor(MainActivity.class.getName(),null,false);
            getTargetContext().startActivity(new Intent(Intent.ACTION_MAIN).setClassName(getTargetContext().getPackageName(),MainActivity.class.getName()).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            activity=monitor.waitForActivityWithTimeout(15000);removeMonitor(monitor);check(activity!=null,"activity resumed");
            runOnMainSync(()->web=(WebView)((ViewGroup)((ViewGroup)activity.findViewById(android.R.id.content)).getChildAt(0)).getChildAt(0));
            await("document.querySelectorAll('#tide-grid button').length===88","offline game boot / 88 cells");
            check(js("document.title==='Popzuno' && document.querySelector('.home-wordmark').textContent==='Popzuno'").equals("true"),"Popzuno title and home wordmark");
            await("Array.from(document.querySelectorAll('.brand-mark,.home-brand-mark')).length===2 && Array.from(document.querySelectorAll('.brand-mark,.home-brand-mark')).every(i=>i.complete && i.naturalWidth===256)","both Popzuno logos load fully offline");
            check(js("document.querySelector('[data-tide-mode]').dataset.tideMode==='ascend' && document.querySelector('[data-tide-mode=ascend]').getAttribute('aria-pressed')==='true'").equals("true"),"Ascend is the first and default mode");
            check(js("typeof window.KynburstNative.postMessage==='function'").equals("true"),"native bridge");
            check(js("document.querySelector('#cheer-volume').value==='40' && document.querySelector('#cheers-toggle').checked && document.querySelectorAll('.audio-previews button').length===3").equals("true"),"celebration controls and previews");
            instrumentAudio();
            check(js("!document.querySelector('#home-landing').hidden && document.querySelector('#home-picker').hidden && document.querySelectorAll('[data-tide-mode]').length===5 && !document.querySelector('[data-tide-mode=blitz]') && !document.querySelector('.home-power-showcase')").equals("true"),"clean landing opens first; five modes and no power showcase");
            capture("android-home-tr.png");
            tap("#home-play");await("!document.querySelector('#home-picker').hidden && document.querySelector('#home-landing').hidden","Play opens mode selection rather than starting a run");
            check(js("!document.querySelector('#home-pressure') && !document.querySelector('.home-detail dt') && document.querySelector('#home-mode-copy').textContent.length<100").equals("true"),"only a short selected-mode description");
            capture("android-modes-tr.png");tap("#home-back");await("!document.querySelector('#home-landing').hidden","mode back returns to landing");
            tap("[data-home-action=help]");await("document.querySelector('#help-dialog').open && !document.querySelector('#help-basics').hidden","How to play opens controls");
            check(js("document.querySelectorAll('#help-basics .help-steps li').length===3").equals("true"),"three concise control steps");
            tap("[data-help-topic=powers]");check(js("!document.querySelector('#help-powers').hidden && document.querySelectorAll('#help-patterns .power-guide-icon').length===5").equals("true"),"five real power icons next to their descriptions");capture("android-powers-tr.png");
            js("document.querySelector('[data-help-topic=modes]').click();true");check(js("document.querySelectorAll('#help-modes .mode-entry').length===5 && !document.querySelector('#help-modes').innerText.includes('Blitz 60')").equals("true"),"help lists the current five modes");
            js("document.querySelector('[data-close=help-dialog]').click();document.querySelector('[data-home-action=settings]').click();true");
            check(js("!document.querySelector('#settings-content').hidden && document.querySelector('#settings-content').contains(document.querySelector('#privacy-open')) && document.querySelector('#support-email').getAttribute('href').startsWith('mailto:mertbek@gmail.com')").equals("true"),"settings owns privacy/licenses and support contact");
            for(String lang:new String[]{"tr","en","it","es","de","ru"}){
                js("if(document.querySelector('#tide-home').hidden)document.querySelector('#tide-menu').click();(()=>{const e=document.querySelector('#language');e.value='"+lang+"';e.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('#privacy-open').click();return true;})()");
                await("document.querySelector('#privacy-dialog').open && document.querySelectorAll('#privacy-content h3').length===6 && document.querySelectorAll('#license-content details').length===6","policy and licenses / "+lang);
                check(getTargetContext().getSharedPreferences("kynburst",0).getString("language","").equals(lang),"native language preference / "+lang);
                js("document.querySelector('#privacy-done').click();document.querySelector('[data-home-action=settings]').click();true");
            }
            js("(()=>{const e=document.querySelector('#language');e.value='tr';e.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('[data-close=help-dialog]').click();return true;})()");
            tap("[data-home-action=family]");await("document.querySelector('#family-dialog').open","people card opens photo studio");
            js("(()=>{const n=document.querySelector('#person-name');n.value='Popzuno QA';n.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('[data-close=family-dialog]').click();return true;})()");
            tap("#home-play");tap("#home-start");await("document.querySelector('#tide-arena').classList.contains('is-playing')","mode start launches Ascend by touch");
            check(js("getComputedStyle(document.querySelector('#tide-next')).display==='none' && getComputedStyle(document.querySelector('#tide-stack')).transform==='none' && !document.querySelector('#tide-row-queue').hidden").equals("true"),"rising board has whole rows and a separate countdown");
            js("document.querySelector('#tide-fever-info').click();true");await("document.querySelector('#help-dialog').open && document.querySelector('#overdrive-guide').open && document.querySelector('#overdrive-guide').innerText.includes('30') && document.querySelector('#overdrive-guide').innerText.includes('6')","Overdrive opens its concise explanation");
            js("document.querySelector('[data-close=help-dialog]').click();true");
            check(js("(()=>{const c=[...document.querySelectorAll('[data-tide-cell]')];for(let i=0;i<c.length-1;i++){if(i%8===7)continue;const a=c[i],b=c[i+1];if(a.classList.contains('tide-tile')&&b.classList.contains('tide-tile')&&a.querySelector('span').textContent===b.querySelector('span').textContent){a.click();b.click();return true;}}return false;})()").equals("true"),"invalid move creates a real notification");
            await("document.querySelector('#tide-notice').classList.contains('show')","notification visible");
            check(js("(()=>{const a=document.querySelector('#tide-arena'),s=document.querySelector('#tide-status-bar');return s.getBoundingClientRect().bottom<=a.getBoundingClientRect().top+1&&['tide-notice','tide-danger','tide-cheer','tide-float'].every(id=>!a.contains(document.getElementById(id)));})()").equals("true"),"all live messages stay outside playable cells");capture("android-gameplay-tr.png");
            tap("#tide-pause");await("document.querySelector('#tide-start').textContent==='Devam et'","pause overlay");tap("#tide-menu");await("!document.querySelector('#home-landing').hidden","menu always returns to the landing");
            js("localStorage.setItem('bulusko-v1:best-shapes1-ascend','60000');document.querySelector('#home-play').click();window.dispatchEvent(new Event('kynburst:back'));true");
            check(js("!document.querySelector('#home-landing').hidden && document.querySelector('#home-challenge').textContent.includes('Ascend') && document.querySelector('#home-challenge').textContent.replace(/[^0-9]/g,'')==='60000'").equals("true"),"native back leaves mode picker; challenge uses a real saved score");
            tap("#home-play");tap("#home-start");await("document.querySelector('#tide-arena').classList.contains('is-playing')","same mode resumes the paused run");
            js("document.querySelector('#tide-menu').click();document.querySelector('#home-play').click();document.querySelector('[data-tide-mode=relax]').click();true");tap("#home-start");
            await("document.querySelector('#tide-root').dataset.mode==='relax' && document.querySelector('#tide-arena').classList.contains('is-playing')","Relax starts");
            check(js("document.querySelector('#tide-clock').textContent==='∞' && document.querySelector('#tide-row-queue').hidden && getComputedStyle(document.querySelector('.tide-fever-row')).display==='none'").equals("true"),"Relax keeps pressure-free HUD");capture("android-relax-before-tr.png");tap("#tide-grid button:nth-child(75)");tap("#tide-grid button:nth-child(83)");
            await("Number(document.querySelector('#tide-score').textContent.replace(/[^0-9]/g,''))>0 && document.querySelectorAll('#tide-grid .tide-tile').length===48 && !document.querySelector('#tide-arena').classList.contains('is-resolving')","Relax match refills the board");capture("android-relax-tr.png");
            js("document.querySelector('#tide-menu').click();document.querySelector('[data-home-action=settings]').click();(()=>{const e=document.querySelector('#cheers-toggle');e.checked=false;e.dispatchEvent(new Event('change',{bubbles:true}));const v=document.querySelector('#cheer-volume');v.value='25';v.dispatchEvent(new Event('input',{bubbles:true}));v.dispatchEvent(new Event('change',{bubbles:true}));return true;})()");
            js("window.__qaReloadPending=true;location.reload();true");await("!window.__qaReloadPending && document.querySelectorAll('#tide-grid button').length===88","offline reload");instrumentAudio();
            check(js("!document.querySelector('#home-landing').hidden && document.querySelector('#cheers-toggle').checked===false && document.querySelector('#cheer-volume').value==='25'").equals("true"),"reload keeps preferences and always opens the clean landing");
            fitLayouts();
            js("document.querySelector('[data-home-action=family]').click();true");check(js("document.querySelector('#person-name').value==='Popzuno QA'").equals("true"),"name survives reload");js("document.querySelector('[data-close=family-dialog]').click();document.querySelector('#home-play').click();document.querySelector('[data-tide-mode=timeRush]').click();true");capture("android-time-rush-en.png");tap("#home-start");
            await("document.querySelector('#tide-arena').classList.contains('is-playing')","Time Rush touch start");check(js("getComputedStyle(document.querySelector('.tide-ceiling')).display==='none' && getComputedStyle(document.querySelector('#tide-tempo')).display==='none'").equals("true"),"clock has no false overflow ceiling");
            awaitLong("document.querySelector('.tide-cabinet').dataset.timeRisk==='critical'","Time Rush final seconds are urgent",45000);capture("android-time-critical-en.png");await("!document.querySelector('#tide-end-reason').hidden && document.querySelector('#tide-clock').textContent==='0:00'","timed ending explains zero clock");
            for(String lang:new String[]{"tr","en","it","es","de","ru"}){
                js("(()=>{const e=document.querySelector('#language');e.value='"+lang+"';e.dispatchEvent(new Event('change',{bubbles:true}));return true;})()");
                check(js("(()=>{const o=document.querySelector('#tide-overlay'),r=o.getBoundingClientRect();return o.getAttribute('aria-modal')==='true'&&document.querySelector('.app-shell').hasAttribute('inert')&&r.top>=0&&r.bottom<=innerHeight+1&&o.scrollHeight<=o.clientHeight+1;})()").equals("true"),"result fits / "+lang);
            }
            js("(()=>{const e=document.querySelector('#language');e.value='en';e.dispatchEvent(new Event('change',{bubbles:true}));return true;})()");capture("android-time-ended-en.png");tap("#tide-start");await("document.querySelector('#tide-arena').classList.contains('is-playing')","restart");
            js("window.__beforeAudioCount=window.__qaAudioContexts.length;window.__beforeAudio=window.__qaAudioContexts.at(-1);true");
            runOnMainSync(()->activity.moveTaskToBack(true));SystemClock.sleep(700);
            getTargetContext().startActivity(new Intent(Intent.ACTION_MAIN).setClassName(getTargetContext().getPackageName(),MainActivity.class.getName()).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_REORDER_TO_FRONT));
            await("document.querySelector('#tide-start').textContent==='Keep going'","real native background pauses the game");tap("#tide-start");
            awaitLong("window.__qaAudioContexts.length>window.__beforeAudioCount && window.__qaAudioContexts.at(-1).state==='running'","foreground resume creates a running audio graph",8000);
            js("window.__recoveredTime=window.__qaAudioContexts.at(-1).currentTime;true");SystemClock.sleep(400);
            check(js("window.__qaAudioContexts.at(-1).currentTime>window.__recoveredTime && window.__beforeAudio.state==='closed'").equals("true"),"recovered audio clock advances and old context is closed");
            File folder=new File(getTargetContext().getExternalFilesDir(null),"smoke");folder.mkdirs();
            try(FileOutputStream out=new FileOutputStream(new File(folder,"android-audio-recovery.json"))){out.write(js("({contextsCreated:window.__qaAudioContexts.length,previousState:window.__beforeAudio.state,currentState:window.__qaAudioContexts.at(-1).state,currentTime:window.__qaAudioContexts.at(-1).currentTime,recovered:true})").getBytes(java.nio.charset.StandardCharsets.UTF_8));}
            js("document.querySelector('#tide-menu').click();document.querySelector('[data-home-action=settings]').click();document.querySelector('#privacy-open').click();document.querySelector('#reset-open').click();document.querySelector('#reset-cancel').click();true");
            check(js("JSON.parse(localStorage.getItem('bulusko-v1:people'))[0].name==='Popzuno QA'").equals("true"),"cancel preserves photos/names");js("document.querySelector('#reset-open').click();document.querySelector('#reset-confirm').click();true");
            await("document.querySelectorAll('#tide-grid button').length===88 && localStorage.getItem('bulusko-v1:people')===null && localStorage.getItem('bulusko-v1:settings')===null","native full reset");check(getTargetContext().getSharedPreferences("kynburst",0).getAll().isEmpty(),"native preferences erased");
            result.putString("stream","KYNBURST_SMOKE_PASS\n"+passed);
            result.putBoolean("success",true);finish(Activity.RESULT_OK,result);
        } catch (Throwable error) {
            result.putString("stream","KYNBURST_SMOKE_FAIL\n"+passed+"\n"+error);result.putBoolean("success",false);finish(Activity.RESULT_CANCELED,result);
        }
    }
    private void instrumentAudio() throws Exception {
        js("(()=>{window.__qaAudioContexts=[];const Original=window.AudioContext||window.webkitAudioContext;window.AudioContext=class extends Original{constructor(...args){super(...args);window.__qaAudioContexts.push(this);}};return true;})()");
    }
    private void fitLayouts() throws Exception {
        int originalWidth=web.getLayoutParams().width,originalHeight=web.getLayoutParams().height;
        float density=getTargetContext().getResources().getDisplayMetrics().density;
        JSONArray cases=new JSONArray();
        for(int[] size:new int[][]{{319,584},{360,640},{390,780}}){
            runOnMainSync(()->{android.view.ViewGroup.LayoutParams p=web.getLayoutParams();p.width=Math.round(size[0]*density)+web.getPaddingLeft()+web.getPaddingRight();p.height=Math.round(size[1]*density)+web.getPaddingTop()+web.getPaddingBottom();web.setLayoutParams(p);});
            await("Math.abs(innerWidth-"+size[0]+")<2 && Math.abs(innerHeight-"+size[1]+")<2","native WebView resized / "+size[0]+"x"+size[1]);
            for(String lang:new String[]{"tr","en","it","es","de","ru"}){
                js("if(document.querySelector('#tide-home').hidden)document.querySelector('#tide-menu').click();(()=>{const e=document.querySelector('#language');e.value='"+lang+"';e.dispatchEvent(new Event('change',{bubbles:true}));return true;})()");
                check(js("(()=>{const ids=['#home-play','.home-people','[data-home-action=settings]','[data-home-action=help]'];return ids.every(s=>{const r=document.querySelector(s).getBoundingClientRect();return r.width>=44&&r.height>=44&&r.top>=-1&&r.bottom<=innerHeight+1;})&&document.documentElement.scrollHeight<=innerHeight+1;})()").equals("true"),"clean landing fits / "+size[0]+"x"+size[1]+" / "+lang);
                for(String mode:new String[]{"ascend","survival","timeRush","daily","relax"}){
                    js("if(document.querySelector('#tide-home').hidden)document.querySelector('#tide-menu').click();if(document.querySelector('#home-picker').hidden)document.querySelector('#home-play').click();document.querySelector('[data-tide-mode="+mode+"]').click();document.querySelector('#home-start').click();true");
                    JSONObject actual=new JSONObject(js(FIT_PROBE));actual.put("language",lang);actual.put("mode",mode);cases.put(actual);
                    check(actual.getBoolean("ok"),"board/HUD/powers fit without scroll / "+size[0]+"x"+size[1]+" / "+lang+" / "+mode+(actual.getBoolean("ok")?"":" : "+actual));
                }
            }
        }
        runOnMainSync(()->{android.view.ViewGroup.LayoutParams p=web.getLayoutParams();p.width=originalWidth;p.height=originalHeight;web.setLayoutParams(p);});
        js("if(document.querySelector('#tide-home').hidden)document.querySelector('#tide-menu').click();(()=>{const e=document.querySelector('#language');e.value='en';e.dispatchEvent(new Event('change',{bubbles:true}));return true;})()");
        File folder=new File(getTargetContext().getExternalFilesDir(null),"smoke");folder.mkdirs();
        try(FileOutputStream out=new FileOutputStream(new File(folder,"android-layout-fit.json"))){out.write(cases.toString(2).getBytes(java.nio.charset.StandardCharsets.UTF_8));}
    }
    private static final String FIT_PROBE = "(()=>{const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};const selectors=['.tide-status-bar','.tide-run-nav','#tide-score','#tide-clock','#tide-pause','#tide-arena','.tide-bottom',...['bomb','rocket','shuffle','cross','nova'].map(x=>'[data-power='+x+']')];const boxes=Object.fromEntries(selectors.map(s=>[s,box(s)]));const visible=Object.values(boxes).every(r=>r.width>0&&r.height>0&&r.x>=-1&&r.y>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1);const a=box('#tide-arena'),slot=box('.tide-board-slot');const buttons=[...document.querySelectorAll('.tide-powertray>button')];const targets=buttons.every(b=>b.getBoundingClientRect().width>=43.5&&b.getBoundingClientRect().height>=44);const maximum=Math.min(slot.width,slot.height*8/11);const messageLaneClear=box('.tide-status-bar').bottom<=a.y+1;const fonts={scoreLabel:parseFloat(getComputedStyle(document.querySelector('.tide-hud span')).fontSize),drive:parseFloat(getComputedStyle(document.querySelector('#tide-fever-label')).fontSize),power:parseFloat(getComputedStyle(buttons[0].querySelector('span')).fontSize),powerIcon:parseFloat(getComputedStyle(buttons[0].querySelector('svg')).width)};const readable=fonts.scoreLabel>=13&&fonts.drive>=12&&fonts.power>=14&&fonts.powerIcon>=25;return {fonts,messageLaneClear,ok:messageLaneClear&&readable&&visible&&targets&&Math.abs(a.width-maximum)<2&&Math.abs(a.width/a.height-8/11)<.01&&document.documentElement.scrollHeight<=innerHeight+1&&document.documentElement.scrollWidth<=innerWidth+1&&getComputedStyle(document.querySelector('.topbar')).display==='none',viewport:[innerWidth,innerHeight],scroll:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],board:a,slot,boxes};})()";
    private void check(boolean condition,String label) throws Exception { if(!condition)throw new Exception(label);passed.append("PASS ").append(label).append('\n');Bundle progress=new Bundle();progress.putString("stream","PASS "+label+"\n");sendStatus(0,progress); }
    private String js(String code) throws Exception {
        CountDownLatch latch=new CountDownLatch(1);AtomicReference<String> result=new AtomicReference<>();
        runOnMainSync(()->web.evaluateJavascript(code,value->{result.set(value);latch.countDown();}));
        if(!latch.await(10,TimeUnit.SECONDS))throw new Exception("JS timeout: "+code);
        return result.get();
    }
    private void await(String expression,String label) throws Exception { awaitLong(expression,label,15000); }
    private void awaitLong(String expression,String label,long timeout) throws Exception {
        long end=SystemClock.uptimeMillis()+timeout;
        while(SystemClock.uptimeMillis()<end){if("true".equals(js(expression))){check(true,label);return;}SystemClock.sleep(100);}
        throw new Exception("Timed out: "+label+"; title="+js("document.title"));
    }
    private void tap(String selector) throws Exception {
        JSONArray point=new JSONArray(js("(()=>{const r=document.querySelector('"+selector+"').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2,innerWidth];})()"));
        int[] position=new int[2];runOnMainSync(()->web.getLocationOnScreen(position));
        float scale=(float)(web.getWidth()-web.getPaddingLeft()-web.getPaddingRight())/(float)point.getDouble(2);
        float x=position[0]+web.getPaddingLeft()+(float)point.getDouble(0)*scale,y=position[1]+web.getPaddingTop()+(float)point.getDouble(1)*scale;
        long now=SystemClock.uptimeMillis();sendPointerSync(MotionEvent.obtain(now,now,MotionEvent.ACTION_DOWN,x,y,0));sendPointerSync(MotionEvent.obtain(now,now+45,MotionEvent.ACTION_UP,x,y,0));SystemClock.sleep(120);
    }
    private void capture(String name) throws Exception {
        SystemClock.sleep(700); // Allow the WebView compositor to present the already-verified DOM state.
        AtomicReference<Bitmap> image=new AtomicReference<>();CountDownLatch copied=new CountDownLatch(1);java.util.concurrent.atomic.AtomicInteger status=new java.util.concurrent.atomic.AtomicInteger(-1);
        runOnMainSync(()->{Bitmap bitmap=Bitmap.createBitmap(activity.getWindow().getDecorView().getWidth(),activity.getWindow().getDecorView().getHeight(),Bitmap.Config.ARGB_8888);image.set(bitmap);PixelCopy.request(activity.getWindow(),bitmap,value->{status.set(value);copied.countDown();},new Handler(Looper.getMainLooper()));});
        if(!copied.await(10,TimeUnit.SECONDS)||status.get()!=PixelCopy.SUCCESS)throw new Exception("Window capture failed: "+status.get());
        Bitmap bitmap=image.get();
        File folder=new File(getTargetContext().getExternalFilesDir(null),"smoke");folder.mkdirs();
        try(FileOutputStream out=new FileOutputStream(new File(folder,name))){bitmap.compress(Bitmap.CompressFormat.PNG,100,out);}bitmap.recycle();
    }
}
