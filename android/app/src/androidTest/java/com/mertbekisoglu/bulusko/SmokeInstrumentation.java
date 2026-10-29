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
            check(js("document.querySelector('#cheer-volume').value==='40' && document.querySelector('#cheers-toggle').checked && document.querySelectorAll('.audio-previews button').length===2").equals("true"),"celebration controls and previews");
            tap("#home-play");
            await("document.querySelector('#tide-arena').classList.contains('is-playing')","touch starts run");
            capture("android-gameplay-tr.png");
            check(js("document.querySelector('#tide-arena').classList.contains('is-playing')").equals("true"),"capture preserves gameplay");
            tap("#tide-pause");
            await("document.querySelector('#tide-start').textContent==='Devam et'","pause overlay");
            tap("#tide-menu");
            await("!document.querySelector('#tide-home').hidden && document.querySelector('#home-play').textContent==='Devam et'","main menu preserves paused run");
            tap("#home-play");
            await("document.querySelector('#tide-home').hidden && document.querySelector('#tide-arena').classList.contains('is-playing')","main menu continue resumes same run");
            tap("#tide-pause");
            js("document.querySelector('#help-open').click();true");
            for (String lang : new String[]{"tr","en","it","es","de","ru"}) {
                js("(()=>{const e=document.querySelector('#language');e.value='"+lang+"';e.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('#privacy-open').click();return true;})()");
                await("document.querySelector('#privacy-dialog').open && document.querySelectorAll('#privacy-content h3').length===6 && document.querySelectorAll('#license-content details').length===6","policy and licenses / "+lang);
                check(getTargetContext().getSharedPreferences("kynburst",0).getString("language","").equals(lang),"native language preference / "+lang);
                js("document.querySelector('#privacy-done').click();document.querySelector('#help-open').click();true");
            }
            js("(()=>{const e=document.querySelector('#language');e.value='en';e.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('[data-close=help-dialog]').click();document.querySelector('#family-open').click();const n=document.querySelector('#person-name');n.value='Kynburst QA';n.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('[data-close=family-dialog]').click();return true;})()");
            js("(()=>{const e=document.querySelector('#cheers-toggle');e.checked=false;e.dispatchEvent(new Event('change',{bubbles:true}));const v=document.querySelector('#cheer-volume');v.value='25';v.dispatchEvent(new Event('input',{bubbles:true}));v.dispatchEvent(new Event('change',{bubbles:true}));return true;})()");
            js("location.reload();true");
            await("document.querySelectorAll('#tide-grid button').length===88","offline reload");
            check(js("document.querySelector('#cheers-toggle').checked===false && document.querySelector('#cheer-volume').value==='25'").equals("true"),"celebration voice preference survives reload");
            fitLayouts();
            js("document.querySelector('#family-open').click();true");
            check(js("document.querySelector('#person-name').value==='Kynburst QA'").equals("true"),"name survives reload");
            js("document.querySelector('[data-close=family-dialog]').click();document.querySelector('[data-tide-mode=timeRush]').click();true");
            capture("android-time-rush-en.png");
            tap("#home-play");
            await("document.querySelector('#tide-arena').classList.contains('is-playing')","Time Rush touch start");
            check(js("getComputedStyle(document.querySelector('.tide-ceiling')).display==='none' && getComputedStyle(document.querySelector('#tide-tempo')).display==='none'").equals("true"),"timed modes show clock without a false overflow ceiling or extra tempo number");
            awaitLong("document.querySelector('.tide-cabinet').dataset.timeRisk==='critical'","Time Rush final seconds are visible and urgent",45000);
            capture("android-time-critical-en.png");
            await("!document.querySelector('#tide-end-reason').hidden && document.querySelector('#tide-clock').textContent==='0:00'","timed ending explains cause with zero clock");
            for (String resultLang : new String[]{"tr","en","it","es","de","ru"}) {
                js("(()=>{const e=document.querySelector('#language');e.value='"+resultLang+"';e.dispatchEvent(new Event('change',{bubbles:true}));return true;})()");
                check(js("(()=>{const o=document.querySelector('#tide-overlay'),r=o.getBoundingClientRect();return o.getAttribute('aria-modal')==='true' && document.querySelector('.app-shell').hasAttribute('inert') && r.top>=0 && r.bottom<=innerHeight+1 && o.scrollHeight<=o.clientHeight+1;})()").equals("true"),"full-screen result fits and isolates background / "+resultLang);
            }
            js("(()=>{const e=document.querySelector('#language');e.value='en';e.dispatchEvent(new Event('change',{bubbles:true}));return true;})()");
            capture("android-time-ended-en.png");
            tap("#tide-start");
            await("document.querySelector('#tide-arena').classList.contains('is-playing')","restart after timed ending");
            runOnMainSync(()->activity.moveTaskToBack(true));SystemClock.sleep(300);
            getTargetContext().startActivity(new Intent(Intent.ACTION_MAIN).setClassName(getTargetContext().getPackageName(),MainActivity.class.getName()).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_REORDER_TO_FRONT));
            await("document.querySelector('#tide-start').textContent==='Keep going'","background pauses game");
            js("document.querySelector('#help-open').click();document.querySelector('#privacy-open').click();document.querySelector('#reset-open').click();document.querySelector('#reset-cancel').click();true");
            check(js("JSON.parse(localStorage.getItem('bulusko-v1:people'))[0].name==='Kynburst QA'").equals("true"),"cancel retains local data");
            js("document.querySelector('#reset-open').click();document.querySelector('#reset-confirm').click();true");
            await("document.querySelectorAll('#tide-grid button').length===88 && localStorage.getItem('bulusko-v1:people')===null && localStorage.getItem('bulusko-v1:settings')===null","native full reset and reload");
            check(getTargetContext().getSharedPreferences("kynburst",0).getAll().isEmpty(),"native preferences also erased");
            js("document.querySelector('#family-open').click();true");
            check(js("document.querySelector('#person-name').value===''").equals("true"),"reset removes character name");
            js("document.querySelector('[data-close=family-dialog]').click();true");
            result.putString("stream","KYNBURST_SMOKE_PASS\n"+passed);
            result.putBoolean("success",true);finish(Activity.RESULT_OK,result);
        } catch (Throwable error) {
            result.putString("stream","KYNBURST_SMOKE_FAIL\n"+passed+"\n"+error);result.putBoolean("success",false);finish(Activity.RESULT_CANCELED,result);
        }
    }
    private void fitLayouts() throws Exception {
        int originalWidth=web.getLayoutParams().width,originalHeight=web.getLayoutParams().height;
        float density=getTargetContext().getResources().getDisplayMetrics().density;
        JSONArray cases=new JSONArray();
        for(int[] size:new int[][]{{319,584},{360,640},{390,780}}){
            runOnMainSync(()->{android.view.ViewGroup.LayoutParams p=web.getLayoutParams();p.width=Math.round(size[0]*density)+web.getPaddingLeft()+web.getPaddingRight();p.height=Math.round(size[1]*density)+web.getPaddingTop()+web.getPaddingBottom();web.setLayoutParams(p);});
            await("Math.abs(innerWidth-"+size[0]+")<2 && Math.abs(innerHeight-"+size[1]+")<2","native WebView resized / "+size[0]+"x"+size[1]);
            for(String lang:new String[]{"tr","en","it","es","de","ru"}){
                js("(()=>{const e=document.querySelector('#language');e.value='"+lang+"';e.dispatchEvent(new Event('change',{bubbles:true}));return true;})()");
                for(String mode:new String[]{"ascend","survival","blitz","timeRush","daily"}){
                    js("if(document.querySelector('#tide-home').hidden)document.querySelector('#tide-menu').click();document.querySelector('[data-tide-mode="+mode+"]').click();document.querySelector('#home-play').click();true");
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
    private static final String FIT_PROBE = "(()=>{const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};const selectors=['.tide-run-nav','#tide-score','#tide-clock','#tide-pause','#tide-arena','.tide-bottom',...['bomb','rocket','shuffle','cross','nova'].map(x=>'[data-power='+x+']')];const boxes=Object.fromEntries(selectors.map(s=>[s,box(s)]));const visible=Object.values(boxes).every(r=>r.width>0&&r.height>0&&r.x>=-1&&r.y>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1);const a=box('#tide-arena'),slot=box('.tide-board-slot');const buttons=[...document.querySelectorAll('.tide-powertray>button')];const targets=buttons.every(b=>b.getBoundingClientRect().width>=43.5&&b.getBoundingClientRect().height>=44);const maximum=Math.min(slot.width,slot.height*8/11);return {ok:visible&&targets&&Math.abs(a.width-maximum)<2&&Math.abs(a.width/a.height-8/11)<.01&&document.documentElement.scrollHeight<=innerHeight+1&&document.documentElement.scrollWidth<=innerWidth+1&&getComputedStyle(document.querySelector('.topbar')).display==='none',viewport:[innerWidth,innerHeight],scroll:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],board:a,slot,boxes};})()";
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
