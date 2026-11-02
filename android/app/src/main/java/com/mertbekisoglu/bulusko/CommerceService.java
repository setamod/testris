package com.mertbekisoglu.bulusko;
import android.app.Activity;
import android.content.SharedPreferences;
import android.os.SystemClock;
import com.google.android.ump.*;
import com.google.android.gms.ads.*;
import com.google.android.gms.ads.rewarded.*;
import org.json.*;
import java.util.*;
import java.util.function.Consumer;

final class CommerceService {
    private String age="unknown"; private final SharedPreferences preferences;
    private final Activity activity; private final Consumer<JSONObject> emit; private final CommerceLedger ledger; private final PremiumBilling premium; private final ConsentInformation consent;
    private int adGeneration=0; private boolean optedIn=false;
    private RewardedAd ad; private long loadedAt; private boolean busy=false,initialized=false,loading=false,earned=false,alive=true; private String activeID,activeRun;
    CommerceService(Activity activity,Consumer<JSONObject> emit){this.activity=activity;this.emit=emit;
        SharedPreferences prefs=activity.getSharedPreferences("popzuno-commerce",Activity.MODE_PRIVATE);preferences=prefs;age=prefs.getString("audience","unknown");
        CommerceLedger.State state=new CommerceLedger.State(SystemClock.elapsedRealtime()/1000d,new ArrayList<>(),new ArrayList<>(),new ArrayList<>());
        try{JSONObject o=new JSONObject(prefs.getString("quota","{}"));state.last=o.optDouble("last",state.last);JSONArray ages=o.optJSONArray("ages"),runs=o.optJSONArray("runs"),ids=o.optJSONArray("receipts");if(ages!=null)for(int i=0;i<ages.length();i++)state.ages.add(Math.max(0,ages.getDouble(i)));if(runs!=null)for(int i=0;i<runs.length();i++)state.runs.add(runs.getString(i));if(ids!=null)for(int i=0;i<ids.length();i++)state.receipts.add(ids.getString(i));}catch(Exception ignored){}
        ledger=new CommerceLedger(state,()->SystemClock.elapsedRealtime()/1000d,s->{try{return prefs.edit().putString("quota",new JSONObject().put("last",s.last).put("ages",new JSONArray(s.ages)).put("runs",new JSONArray(s.runs)).put("receipts",new JSONArray(s.receipts)).toString()).commit();}catch(Exception e){return false;}});
        consent=UserMessagingPlatform.getConsentInformation(activity);premium=new PremiumBilling(activity,prefs,this::state);
    }
    private void ui(Runnable r){activity.runOnUiThread(()->{if(alive)r.run();});}
    void state(){if(!alive||premium==null)return;if(SystemClock.elapsedRealtime()-loadedAt>3500000)ad=null;
        try{emit.accept(new JSONObject().put("kind","state").put("supported",true).put("age",age).put("ready",age.equals("adult")&&ad!=null&&!busy).put("remaining",ledger.remaining()).put("premium",premium.entitled()).put("canPurchase",premium.available()&&age.equals("adult")).put("price",premium.price()).put("privacyRequired",consent.getPrivacyOptionsRequirementStatus()==ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED));}catch(Exception ignored){}
    }
    private void result(String id,String code){try{emit.accept(new JSONObject().put("kind","result").put("id",id).put("code",code));}catch(Exception ignored){}}
    void handle(JSONObject m){String op=m.optString("op"),id=m.optString("id");if(op.equals("status")){state();premium.refreshProducts();return;}if(!id.matches("[a-zA-Z0-9-]{1,96}"))return;if(busy){result(id,"unavailable");return;}
        switch(op){
        case "audience":
            String band=m.optString("age");if(!Arrays.asList("unknown","child","teen","adult").contains(band)){result(id,"error");break;}
            adGeneration++;ad=null;age=band;preferences.edit().putString("audience",band).apply();result(id,"closed");state();break;
        case "prepare":prepare(id);break;
        case "privacy":adGeneration++;ad=null;busy=true;UserMessagingPlatform.showPrivacyOptionsForm(activity,error->{busy=false;result(id,error==null?"closed":"error");state();});break;
        case "show":show(id,m.optString("run"),m.optString("placement"));break;
        case "buy":if(!age.equals("adult")){result(id,"unavailable");break;}busy=true;premium.buy(code->{busy=false;result(id,code);state();});break;
        case "restore":busy=true;premium.restore(code->{busy=false;result(id,code);state();});break;
        default:result(id,"error");
        }
    }
    private void prepare(String id){
        if(!age.equals("adult")||(!BuildConfig.DEBUG&&!BuildConfig.LIVE_ADS_ENABLED)){result(id,"unavailable");return;}adGeneration++;ad=null;busy=true;optedIn=true;
        ConsentRequestParameters params=new ConsentRequestParameters.Builder().setTagForUnderAgeOfConsent(false).build();
        try { consent.requestConsentInfoUpdate(activity,params,()->ui(()->{
            if(!activity.hasWindowFocus()){unavailable(id);return;}
            try { UserMessagingPlatform.loadAndShowConsentFormIfRequired(activity,error->ui(()->{
                if(error!=null||!consent.canRequestAds()){unavailable(id);return;}
                if(initialized){load(id);return;}initialize(id);
            })); } catch(RuntimeException error){unavailable(id);}
        }),error->ui(()->unavailable(id))); } catch(RuntimeException error){unavailable(id);}
    }
    private void unavailable(String id){ad=null;busy=false;result(id,"unavailable");state();}
    private void initialize(String id){
        try {
            MobileAds.setRequestConfiguration(new RequestConfiguration.Builder().setAgeRestrictedTreatment(AgeRestrictedTreatment.UNSPECIFIED).setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_G).setPublisherPrivacyPersonalizationState(RequestConfiguration.PublisherPrivacyPersonalizationState.DISABLED).build());
            MobileAds.disableMediationAdapterInitialization(activity);
            new Thread(()->{
                try { MobileAds.initialize(activity,status->ui(()->{
                    try { MobileAds.putPublisherFirstPartyIdEnabled(false);initialized=true;load(id); }
                    catch(RuntimeException error){unavailable(id);}
                })); } catch(RuntimeException error){ui(()->unavailable(id));}
            }).start();
        } catch(RuntimeException error){unavailable(id);}
    }
    private void load(String requestID){final int generation=adGeneration;if(loading){busy=false;result(requestID,"unavailable");return;}loading=true;
        try { RewardedAd.load(activity,BuildConfig.REWARDED_ID,new AdRequest.Builder().build(),new RewardedAdLoadCallback(){
            @Override public void onAdLoaded(RewardedAd next){ui(()->{loading=false;if(generation!=adGeneration||!age.equals("adult")||!consent.canRequestAds()){if(!requestID.isEmpty()){busy=false;result(requestID,"unavailable");}state();return;}ad=next;loadedAt=SystemClock.elapsedRealtime();if(!requestID.isEmpty()){busy=false;result(requestID,"closed");}state();});}
            @Override public void onAdFailedToLoad(LoadAdError error){ui(()->{loading=false;ad=null;if(!requestID.isEmpty()){busy=false;result(requestID,"unavailable");}state();});}
        }); } catch(RuntimeException error){loading=false;ad=null;if(!requestID.isEmpty())unavailable(requestID);else state();}
    }
    private void show(String id,String run,String placement){
        if(!age.equals("adult")||ad==null||SystemClock.elapsedRealtime()-loadedAt>3500000||ledger.remaining()<1||!run.matches("[a-zA-Z0-9-]{1,96}")||!Arrays.asList("rows","time","stage").contains(placement)||!activity.hasWindowFocus()){result(id,"unavailable");return;}
        RewardedAd current=ad;ad=null;activeID=id;activeRun=run;earned=false;busy=true;state();
        current.setFullScreenContentCallback(new FullScreenContentCallback(){
            @Override public void onAdDismissedFullScreenContent(){ui(()->complete(false));}
            @Override public void onAdFailedToShowFullScreenContent(AdError error){ui(()->complete(true));}
        });
        try { current.show(activity,reward->ui(()->{if(id.equals(activeID))earned=true;})); } catch(RuntimeException error){complete(true);}
    }
    private void complete(boolean failed){if(activeID==null)return;String id=activeID;activeID=null;boolean grant=!failed&&earned&&ledger.consume(activeRun,id);earned=false;busy=false;result(id,grant?"earned":failed?"error":"closed");state();if(optedIn&&age.equals("adult")&&consent.canRequestAds()&&ledger.remaining()>0)load("");}
    void foreground(){premium.foreground();state();}
    void close(){alive=false;ad=null;premium.close();}
}
