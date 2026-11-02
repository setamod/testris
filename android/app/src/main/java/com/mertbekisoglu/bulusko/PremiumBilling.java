package com.mertbekisoglu.bulusko;
import android.app.Activity;
import android.content.SharedPreferences;
import android.util.Base64;
import com.android.billingclient.api.*;
import java.security.*;
import java.security.spec.X509EncodedKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.function.Consumer;

final class PremiumBilling implements PurchasesUpdatedListener {
    private final Activity activity; private final SharedPreferences prefs; private final Runnable changed;
    private final BillingClient client; private ProductDetails product; private ProductDetails.OneTimePurchaseOfferDetails offer;
    private final Map<String,List<Consumer<String>>> processing=new HashMap<>(); private boolean connecting=false;
    private Consumer<String> transaction; private boolean entitled=false;
    PremiumBilling(Activity activity,SharedPreferences prefs,Runnable changed){
        this.activity=activity;this.prefs=prefs;this.changed=changed;
        String data=prefs.getString("purchase.data",""),signature=prefs.getString("purchase.signature","");
        if(!data.isEmpty())try{Purchase p=new Purchase(data,signature);entitled=valid(p);}catch(Exception ignored){}
        client=BillingClient.newBuilder(activity).setListener(this).enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build()).enableAutoServiceReconnection().build();
        if(BuildConfig.STORE_ENABLED)connect();
    }
    static boolean verify(String data,String signature,String key){try{PublicKey k=KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(Base64.decode(key,Base64.DEFAULT)));Signature s=Signature.getInstance("SHA1withRSA");s.initVerify(k);s.update(data.getBytes(StandardCharsets.UTF_8));return s.verify(Base64.decode(signature,Base64.DEFAULT));}catch(Exception e){return false;}}
    private boolean valid(Purchase p){return p.getPurchaseState()==Purchase.PurchaseState.PURCHASED&&p.getProducts().contains(BuildConfig.PREMIUM_PRODUCT)&&activity.getPackageName().equals(p.getPackageName())&&verify(p.getOriginalJson(),p.getSignature(),BuildConfig.BILLING_PUBLIC_KEY);}
    boolean entitled(){return entitled;}
    boolean available(){return BuildConfig.STORE_ENABLED&&client.isReady()&&product!=null&&offer!=null&&!BuildConfig.BILLING_PUBLIC_KEY.isEmpty();}
    String price(){return offer==null?"":offer.getFormattedPrice();}
    private void ui(Runnable work){activity.runOnUiThread(work);}
    private void connect(){if(connecting)return;connecting=true;client.startConnection(new BillingClientStateListener(){public void onBillingServiceDisconnected(){connecting=false;ui(()->{product=null;offer=null;changed.run();});}public void onBillingSetupFinished(BillingResult r){connecting=false;if(r.getResponseCode()!=BillingClient.BillingResponseCode.OK)return;
        refreshProducts();query(null);
    }});}
    void refreshProducts(){
        if(!BuildConfig.STORE_ENABLED||!client.isReady())return;
        product=null;offer=null;changed.run();
        client.queryProductDetailsAsync(QueryProductDetailsParams.newBuilder().setProductList(Collections.singletonList(QueryProductDetailsParams.Product.newBuilder().setProductId(BuildConfig.PREMIUM_PRODUCT).setProductType(BillingClient.ProductType.INAPP).build())).build(),(result,details)->ui(()->{
            if(result.getResponseCode()==BillingClient.BillingResponseCode.OK)for(ProductDetails p:details.getProductDetailsList())if(p.getProductId().equals(BuildConfig.PREMIUM_PRODUCT)&&p.getOneTimePurchaseOfferDetailsList()!=null)for(ProductDetails.OneTimePurchaseOfferDetails o:p.getOneTimePurchaseOfferDetailsList())if(o.getRentalDetails()==null&&o.getPreorderDetails()==null){product=p;offer=o;break;}
            changed.run();
        }));    }
    void foreground(){if(BuildConfig.STORE_ENABLED){if(client.isReady()){refreshProducts();query(null);}else connect();}}
    void buy(Consumer<String> completion){if(!available()||transaction!=null){completion.accept("unavailable");return;}transaction=completion;
        BillingResult result=client.launchBillingFlow(activity,BillingFlowParams.newBuilder().setProductDetailsParamsList(Collections.singletonList(BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(product).setOfferToken(offer.getOfferToken()).build())).build());
        if(result.getResponseCode()!=BillingClient.BillingResponseCode.OK)finish("error");
    }
    void restore(Consumer<String> completion){if(!BuildConfig.STORE_ENABLED||!client.isReady()){completion.accept("unavailable");return;}query(completion);}
    private void query(Consumer<String> completion){client.queryPurchasesAsync(QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(),(result,purchases)->ui(()->{
        if(result.getResponseCode()!=BillingClient.BillingResponseCode.OK){if(completion!=null)completion.accept("error");return;}
        Purchase found=null;for(Purchase p:purchases)if(p.getProducts().contains(BuildConfig.PREMIUM_PRODUCT)){found=p;break;}
        if(found==null){entitled=false;prefs.edit().remove("purchase.data").remove("purchase.signature").apply();changed.run();if(completion!=null)completion.accept("unavailable");return;}
        process(found,code->{if(completion!=null)completion.accept(code.equals("purchased")?"restored":code);else if(transaction!=null&&(code.equals("purchased")||code.equals("pending")))finish(code);});
    }));}
    private void process(Purchase p,Consumer<String> completion){
        if(p.getPurchaseState()==Purchase.PurchaseState.PENDING){completion.accept("pending");return;}
        if(!valid(p)){completion.accept("error");return;}
        String token=p.getPurchaseToken();
        if(processing.containsKey(token)){processing.get(token).add(completion);return;}
        processing.put(token,new ArrayList<>(Collections.singletonList(completion)));
        Consumer<String> finishAll=code->{List<Consumer<String>> callbacks=processing.remove(token);if(callbacks!=null)for(Consumer<String> c:callbacks)c.accept(code);};
        Runnable grant=()->{if(!prefs.edit().putString("purchase.data",p.getOriginalJson()).putString("purchase.signature",p.getSignature()).commit()){finishAll.accept("error");return;}entitled=true;changed.run();finishAll.accept("purchased");};
        if(p.isAcknowledged()){grant.run();return;}
        client.acknowledgePurchase(AcknowledgePurchaseParams.newBuilder().setPurchaseToken(p.getPurchaseToken()).build(),r->ui(()->{if(r.getResponseCode()==BillingClient.BillingResponseCode.OK)grant.run();else finishAll.accept("pending");}));
    }
    @Override public void onPurchasesUpdated(BillingResult result,List<Purchase> purchases){ui(()->{
        if(result.getResponseCode()==BillingClient.BillingResponseCode.USER_CANCELED){finish("cancelled");return;}
        if(result.getResponseCode()==BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED){query(this::finish);return;}
        if(result.getResponseCode()!=BillingClient.BillingResponseCode.OK||purchases==null){finish("error");return;}
        for(Purchase p:purchases)if(p.getProducts().contains(BuildConfig.PREMIUM_PRODUCT)){process(p,this::finish);return;}
        finish("error");
    });}
    private void finish(String code){Consumer<String> c=transaction;transaction=null;if(c!=null)c.accept(code);}
    void close(){client.endConnection();transaction=null;}
}
