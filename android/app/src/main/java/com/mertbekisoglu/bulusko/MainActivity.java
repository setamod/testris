package com.mertbekisoglu.bulusko;

import android.app.Activity;
import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.WindowManager;
import android.view.View;
import android.widget.FrameLayout;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebStorage;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import org.json.JSONObject;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;
import java.util.Arrays;

/** Offline shell. No INTERNET, gallery, camera, microphone or advertising-ID permissions. */
public final class MainActivity extends Activity {
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    private static final String GAME_URL = ORIGIN + "/game/index.html";
    private static final int PICK_PHOTO = 24;
    private WebView web;
    private SharedPreferences preferences;
    private ValueCallback<Uri[]> photoCallback;
    private AudioManager audio;
    private AudioFocusRequest audioFocus;
    private Vibrator vibrator;
    private long lastHaptic = 0;
    private ArcadeAnnouncer announcer;
    private boolean resetting = false;

    // Only signed, bundled code is served; no network permission, frames or navigation to third-party pages.
    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        preferences = getSharedPreferences("kynburst", MODE_PRIVATE);
        announcer = new ArcadeAnnouncer(this);
        audio = (AudioManager)getSystemService(AUDIO_SERVICE);
        audioFocus = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
            .setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_GAME).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build())
            .setOnAudioFocusChangeListener(change -> { if (change < 0) runOnUiThread(this::pauseGame); }).build();
        vibrator = Build.VERSION.SDK_INT >= 31 ? ((VibratorManager)getSystemService(VIBRATOR_MANAGER_SERVICE)).getDefaultVibrator() : (Vibrator)getSystemService(VIBRATOR_SERVICE);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        web = new WebView(this);
        FrameLayout container = new FrameLayout(this);
        container.setBackgroundColor(Color.rgb(16,18,29));
        container.addView(web,new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT,FrameLayout.LayoutParams.MATCH_PARENT));
        if (Build.VERSION.SDK_INT >= 30) getWindow().setDecorFitsSystemWindows(false);
        else getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        web.setBackgroundColor(Color.rgb(16,18,29));
        web.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
        // Android 15+ edge-to-edge: keep the board, picker and powers clear of system bars/keyboard.
        container.setOnApplyWindowInsetsListener((view,insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(android.view.WindowInsets.Type.systemBars() | android.view.WindowInsets.Type.displayCutout() | android.view.WindowInsets.Type.ime());
                view.setPadding(bars.left,bars.top,bars.right,bars.bottom);
            } else view.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());
            return insets;
        });
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true); // Only system-selected content URIs for the file chooser.
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setTextZoom(100);
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
        web.addJavascriptInterface(new NativeBridge(), "KynburstNative");
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return !GAME_URL.equals(request.getUrl().toString()); }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (!GAME_URL.equals(request.getUrl().toString())) return blocked();
                try {
                    WebResourceResponse response = new WebResourceResponse("text/html", "UTF-8", getAssets().open("game/index.html"));
                    Map<String,String> headers = new HashMap<>(); headers.put("Cache-Control","no-store"); headers.put("Content-Security-Policy","default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src blob: data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"); response.setResponseHeaders(headers);
                    return response;
                } catch (IOException error) { return blocked(); }
            }
            @Override public void onPageFinished(WebView view, String url) { resetting = false; }
            @Override public boolean onRenderProcessGone(WebView view, android.webkit.RenderProcessGoneDetail detail) {
                pauseGame();
                view.destroy();
                recreate();
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onPermissionRequest(PermissionRequest request) { request.deny(); }
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (photoCallback != null) photoCallback.onReceiveValue(null);
                photoCallback = callback;
                Intent pick = new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("image/*");
                try { startActivityForResult(pick, PICK_PHOTO); }
                catch (ActivityNotFoundException error) { photoCallback.onReceiveValue(null); photoCallback = null; }
                return true;
            }
        });
        if (Build.VERSION.SDK_INT >= 33) getOnBackInvokedDispatcher().registerOnBackInvokedCallback(android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        setContentView(container);
        container.requestApplyInsets();
        web.loadUrl(GAME_URL);
    }

    private static WebResourceResponse blocked() {
        return new WebResourceResponse("text/plain", "UTF-8", 403, "Blocked", Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
    }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request,result,data);
        if (request == PICK_PHOTO && photoCallback != null) {
            Uri uri = result == RESULT_OK && data != null ? data.getData() : null;
            if (uri != null && !"content".equals(uri.getScheme())) uri = null;
            photoCallback.onReceiveValue(uri == null ? null : new Uri[]{uri});
            photoCallback = null;
        }
    }

    private void pauseGame() {
        if (announcer != null) announcer.stop();
        if (web != null) web.evaluateJavascript("window.dispatchEvent(new Event('blur'));",null);
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (vibrator != null) vibrator.cancel();
        if (audio != null) audio.abandonAudioFocusRequest(audioFocus);
    }
    @Override protected void onPause() { pauseGame(); if (web != null) web.onPause(); super.onPause(); }
    @Override protected void onResume() { super.onResume(); if (web != null) { web.onResume(); web.evaluateJavascript("window.dispatchEvent(new Event('kynburst:foreground'));",null); } }
    @Override protected void onDestroy() {
        if (photoCallback != null) { photoCallback.onReceiveValue(null); photoCallback = null; }
        pauseGame(); if (web != null) { web.removeJavascriptInterface("KynburstNative"); web.destroy(); web = null; }
        if (announcer != null) announcer.close();
        super.onDestroy();
    }
    private void handleBack() { if (web != null) { web.evaluateJavascript("window.dispatchEvent(new Event('kynburst:back'));",null); } }
    // Used on API 26–32 only. API 33+ uses the registered predictive-back callback above.
    @SuppressLint("GestureBackNavigation")
    @Override public void onBackPressed() { handleBack(); }

    // app/build.gradle disables language splits; BundleConfig.pb was verified with bundletool.
    @SuppressLint("AppBundleLocaleChanges")
    private android.content.Context localizedContext() {
        Configuration configuration = new Configuration(getResources().getConfiguration());
        configuration.setLocale(Locale.forLanguageTag(preferences.getString("language", "tr")));
        return createConfigurationContext(configuration);
    }
    private void showSettings() {
        pauseGame(); android.content.Context context = localizedContext();
        new AlertDialog.Builder(this).setTitle(context.getString(R.string.settings))
            .setMultiChoiceItems(new String[]{context.getString(R.string.haptics)},new boolean[]{preferences.getBoolean("haptics",true)},(dialog,which,checked)->{ preferences.edit().putBoolean("haptics",checked).apply(); if (checked) haptic("clear",4); })
            .setNeutralButton(context.getString(R.string.privacy),(dialog,which)->web.evaluateJavascript("window.dispatchEvent(new Event('kynburst:privacy'));",null))
            .setPositiveButton(context.getString(R.string.done),null).show();
    }
    private void haptic(String event,int count) {
        if (!preferences.getBoolean("haptics",true) || vibrator == null || !vibrator.hasVibrator() || !hasWindowFocus()) return;
        long now = android.os.SystemClock.uptimeMillis(); if (now-lastHaptic < 65) return; lastHaptic = now;
        int strength = Math.max(1,Math.min(4,(count+2)/3));
        if (event.equals("rotate")) vibrator.vibrate(VibrationEffect.createOneShot(12,45));
        else if (event.equals("clear") || event.equals("pulse")) vibrator.vibrate(VibrationEffect.createWaveform(new long[]{0,24+strength*12,30,16+strength*8},new int[]{0,70+strength*40,0,45+strength*30},-1));
        else if (event.equals("over")) vibrator.vibrate(VibrationEffect.createOneShot(80,150));
    }
    private final class NativeBridge {
        @JavascriptInterface public void postMessage(String raw) {
            if (raw == null || raw.length() > 1_300_000) return;
            try {
                JSONObject message = new JSONObject(raw);
                runOnUiThread(()->{
                    if (web == null || !GAME_URL.equals(web.getUrl()) || resetting) return;
                    switch (message.optString("type")) {
                        case "state":
                            if (message.optBoolean("playing") && hasWindowFocus()) { getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON); audio.requestAudioFocus(audioFocus); }
                            else { getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON); audio.abandonAudioFocusRequest(audioFocus); }
                            break;
                        case "prepareCheers": if (hasWindowFocus()) announcer.prepare(); break;
                        case "cheer": if (hasWindowFocus() && !((android.view.accessibility.AccessibilityManager)getSystemService(ACCESSIBILITY_SERVICE)).isTouchExplorationEnabled()) announcer.play(message.optString("kind"),(float)message.optDouble("volume",0)); break;
                        case "stopCheer": announcer.stop(); break;
                        case "feedback": haptic(message.optString("event"),message.optInt("count",1)); break;
                        case "settings": showSettings(); break;
                        case "preference":
                            if (message.optString("key").equals("bulusko-v1:settings")) {
                                try { String language = new JSONObject(message.optString("value")).optString("language"); if (Arrays.asList("tr","en","it","es","de","ru").contains(language)) preferences.edit().putString("language",language).apply(); } catch (Exception ignored) {}
                            }
                            break;
                        case "reset":
                            resetting = true; pauseGame(); preferences.edit().clear().apply();
                            WebStorage.getInstance().deleteAllData(); web.clearCache(true); web.clearFormData(); web.loadUrl(GAME_URL); break;
                        case "share":
                            String text = message.optString("text"); if (text.length() <= 1200) {
                                Intent share = new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT,text);
                                try { startActivity(Intent.createChooser(share,"Popzuno")); } catch (ActivityNotFoundException ignored) {}
                            }
                            break;
                        case "exit": finish(); break;
                        case "support":
                            try { startActivity(new Intent(Intent.ACTION_SENDTO,Uri.parse("mailto:mertbek@gmail.com?subject=Popzuno"))); } catch (ActivityNotFoundException ignored) {}
                            break;
                        default: break;
                    }
                });
            } catch (Exception ignored) { /* Untrusted malformed bridge messages are ignored. */ }
        }
    }
}
