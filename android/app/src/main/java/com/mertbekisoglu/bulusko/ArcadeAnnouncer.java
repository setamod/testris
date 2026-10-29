package com.mertbekisoglu.bulusko;

import android.content.Context;
import android.media.AudioAttributes;
import android.os.Bundle;
import android.os.SystemClock;
import android.speech.tts.TextToSpeech;
import android.speech.tts.Voice;
import java.util.Map;

/** Uses an installed offline voice only. No downloads, arbitrary text or speech queue. */
final class ArcadeAnnouncer {
    private static final Map<String,String> PHRASES = new java.util.HashMap<>();
    static { PHRASES.put("four","Nice move!"); PHRASES.put("five","Awesome!"); PHRASES.put("cross","Excellent!"); PHRASES.put("combo3","Triple combo!"); PHRASES.put("combo4","Monster combo!"); PHRASES.put("nova","Oh yeah!"); PHRASES.put("novaReady","Nova ready!"); }
    private final Context context;
    private TextToSpeech speech;
    private boolean ready = false;
    private boolean closed = false;
    private int activePriority = 0;
    private int priority(String kind) { return kind.equals("nova") ? 100 : kind.equals("novaReady") ? 70 : kind.equals("combo4") ? 60 : kind.equals("combo3") ? 50 : kind.equals("cross") ? 35 : kind.equals("five") ? 30 : 10; }
    ArcadeAnnouncer(Context context) { this.context = context; }
    void prepare() {
        if (speech != null || closed) return;
        speech = new TextToSpeech(context,status -> {
            if (closed || speech == null || status != TextToSpeech.SUCCESS) return;
            try {
                if (speech.getVoices() == null) return;
                Voice choice = speech.getVoices().stream().filter(v -> !v.isNetworkConnectionRequired() && v.getLocale().getLanguage().equals("en") && (v.getFeatures() == null || !v.getFeatures().contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED))).sorted((a,b) -> Integer.compare(b.getQuality(),a.getQuality())).findFirst().orElse(null);
                if (choice == null || speech.setVoice(choice) != TextToSpeech.SUCCESS) return;
                speech.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_GAME).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
                speech.setPitch(1f); speech.setSpeechRate(1.04f); ready = true;
            } catch (RuntimeException ignored) { ready = false; }
        });
    }
    void play(String kind,float volume) {
        prepare();
        if (!ready || !PHRASES.containsKey(kind) || !Float.isFinite(volume) || volume <= 0) return;
        if (speech.isSpeaking() && activePriority > priority(kind)) return;
        activePriority = priority(kind);
        Bundle params = new Bundle(); params.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME,Math.min(1,volume)*.9f);
        speech.speak(PHRASES.get(kind),TextToSpeech.QUEUE_FLUSH,params,"kynburst-"+kind);
    }
    void stop() { if (speech != null) speech.stop(); }
    void close() { closed = true; ready = false; if (speech != null) { speech.stop(); speech.shutdown(); speech = null; } }
}
