package com.mertbekisoglu.bulusko;
import android.app.*;
import android.os.SystemClock;
import android.view.KeyEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import com.google.android.gms.ads.*;
import com.google.android.gms.ads.rewarded.*;
import org.json.JSONObject;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

/** Test-source only. Uses Google's dedicated test unit; never packaged with the game. */
final class AdMobSDKProbe {
    private static boolean clickClose(AccessibilityNodeInfo node,int depth){
        if(depth>25)return false;
        String label=String.valueOf(node.getContentDescription())+" "+String.valueOf(node.getText());label=label.toLowerCase(java.util.Locale.ROOT);
        if(node.isVisibleToUser()&&(label.contains("close ad")||label.contains("close button")||label.trim().equals("null close")||label.contains("kapat"))){
            if(node.performAction(AccessibilityNodeInfo.ACTION_CLICK))return true;
            AccessibilityNodeInfo parent=node.getParent();if(parent!=null&&parent.isClickable())return parent.performAction(AccessibilityNodeInfo.ACTION_CLICK);
        }
        for(int i=0;i<node.getChildCount();i++){AccessibilityNodeInfo child=node.getChild(i);if(child!=null&&clickClose(child,depth+1))return true;}
        return false;
    }
    static JSONObject run(Instrumentation runner,Activity activity) throws Exception {
        JSONObject report=new JSONObject().put("provider","Google dedicated rewarded TEST ad").put("testOnly",true).put("personalPhotosUsed",false);
        AtomicBoolean loaded=new AtomicBoolean(),earned=new AtomicBoolean(),dismissed=new AtomicBoolean();AtomicInteger error=new AtomicInteger(-1);
        CountDownLatch init=new CountDownLatch(1),load=new CountDownLatch(1),close=new CountDownLatch(1);AtomicReference<RewardedAd> ad=new AtomicReference<>();
        runner.runOnMainSync(()->{MobileAds.setRequestConfiguration(new RequestConfiguration.Builder().setTagForUnderAgeOfConsent(RequestConfiguration.TAG_FOR_UNDER_AGE_OF_CONSENT_TRUE).setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_G).setPublisherPrivacyPersonalizationState(RequestConfiguration.PublisherPrivacyPersonalizationState.DISABLED).build());MobileAds.disableMediationAdapterInitialization(activity);});
        new Thread(()->MobileAds.initialize(activity,s->init.countDown())).start();
        if(!init.await(45,TimeUnit.SECONDS))return report.put("loaded",false).put("status","initialization_timeout");
        runner.runOnMainSync(()->{MobileAds.putPublisherFirstPartyIdEnabled(false);RewardedAd.load(activity,"ca-app-pub-3940256099942544/5224354917",new AdRequest.Builder().build(),new RewardedAdLoadCallback(){
            @Override public void onAdLoaded(RewardedAd value){ad.set(value);loaded.set(true);load.countDown();}
            @Override public void onAdFailedToLoad(LoadAdError e){error.set(e.getCode());load.countDown();}
        });});
        if(!load.await(60,TimeUnit.SECONDS)||!loaded.get())return report.put("loaded",false).put("errorCode",error.get()).put("status","network_or_test_inventory_unavailable");
        runner.runOnMainSync(()->{RewardedAd current=ad.get();current.setFullScreenContentCallback(new FullScreenContentCallback(){@Override public void onAdDismissedFullScreenContent(){dismissed.set(true);close.countDown();}@Override public void onAdFailedToShowFullScreenContent(AdError e){error.set(e.getCode());close.countDown();}});current.show(activity,reward->earned.set(true));});
        long deadline=SystemClock.elapsedRealtime()+70000;
        while(!dismissed.get()&&SystemClock.elapsedRealtime()<deadline){
            if(earned.get()){
                AccessibilityNodeInfo root=runner.getUiAutomation().getRootInActiveWindow();
                if(root!=null)clickClose(root,0);
            }
            close.await(500,TimeUnit.MILLISECONDS);
        }
        return report.put("loaded",loaded.get()).put("earned",earned.get()).put("dismissed",dismissed.get()).put("errorCode",error.get()).put("status",earned.get()&&dismissed.get()?"real_test_sdk_reward_and_dismissal_verified":"loaded_but_reward_completion_not_verified");
    }
}
