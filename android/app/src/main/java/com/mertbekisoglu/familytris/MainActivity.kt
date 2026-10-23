package com.mertbekisoglu.familytris

import android.annotation.SuppressLint
import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.os.SystemClock
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import org.json.JSONObject
import java.io.ByteArrayInputStream

class MainActivity : Activity() {
    private lateinit var webView: WebView
    private lateinit var preferences: SharedPreferences
    private var fileChooser: ValueCallback<Array<Uri>>? = null
    private var isPlaying = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        preferences = getSharedPreferences("blok", MODE_PRIVATE)
        webView = createWebView()
        setContentView(webView)
        webView.loadUrl(GAME_URL)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun createWebView() = WebView(this).apply {
        setBackgroundColor(Color.rgb(8, 11, 20))
        settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowContentAccess = false
            allowFileAccess = true
            allowFileAccessFromFileURLs = false
            allowUniversalAccessFromFileURLs = false
            blockNetworkLoads = true
            mediaPlaybackRequiresUserGesture = true
            cacheMode = WebSettings.LOAD_DEFAULT
        }
        addJavascriptInterface(GameBridge(), "BLOK")
        webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean = true

            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
                return if (request.url.toString() == GAME_URL || request.url.scheme == "data") null
                else WebResourceResponse("text/plain", "UTF-8", ByteArrayInputStream(ByteArray(0)))
            }
        }
        webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                view: WebView,
                callback: ValueCallback<Array<Uri>>,
                params: WebChromeClient.FileChooserParams
            ): Boolean {
                fileChooser?.onReceiveValue(null)
                fileChooser = callback
                return try {
                    startActivityForResult(params.createIntent(), PHOTO_PICKER_REQUEST)
                    true
                } catch (_: Exception) {
                    fileChooser = null
                    false
                }
            }
        }
    }

    override fun onPause() {
        pauseGame()
        super.onPause()
    }

    override fun onDestroy() {
        fileChooser?.onReceiveValue(null)
        webView.removeJavascriptInterface("BLOK")
        webView.destroy()
        super.onDestroy()
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != PHOTO_PICKER_REQUEST) return
        val callback = fileChooser ?: return
        fileChooser = null
        val files = if (resultCode == RESULT_OK) {
            data?.clipData?.let { clip -> Array(clip.itemCount) { clip.getItemAt(it).uri } }
                ?: data?.data?.let { arrayOf(it) }
        } else null
        callback.onReceiveValue(files)
    }

    private fun pauseGame() {
        if (!::webView.isInitialized) return
        isPlaying = false
        webView.evaluateJavascript("window.dispatchEvent(new Event('blur'));", null)
    }

    private fun showSettings() {
        pauseGame()
        val haptics = preferences.getBoolean(HAPTICS_KEY, true)
        AlertDialog.Builder(this)
            .setTitle("Uygulama ayarları")
            .setMultiChoiceItems(arrayOf("Dokunsal geri bildirim"), booleanArrayOf(haptics)) { _, _, checked ->
                preferences.edit().putBoolean(HAPTICS_KEY, checked).apply()
            }
            .setMessage("Familytris fotoğraflarını, rekorunu ve tercihlerini yalnızca bu cihazda saklar. Hesap, reklam, analiz ve internet bağlantısı gerekmez.")
            .setNeutralButton("Lisanslar") { _, _ -> showLicenses() }
            .setPositiveButton("Bitti", null)
            .show()
    }

    private fun showLicenses() {
        val text = listOf("chakrapetch-OFL.txt", "ibmplexmono-OFL.txt", "pico-MIT.txt").joinToString("\n\n") { name ->
            "$name\n\n${assets.open("legal/$name").bufferedReader().use { it.readText() }}"
        }
        AlertDialog.Builder(this)
            .setTitle("Lisanslar")
            .setMessage(text)
            .setPositiveButton("Bitti", null)
            .show()
    }

    private fun feedback(event: String, count: Int, levelUp: Boolean) {
        if (!preferences.getBoolean(HAPTICS_KEY, true) || !isPlaying) return
        val now = SystemClock.elapsedRealtime()
        if (now - lastFeedback < 55 && event !in setOf("clear", "over")) return
        lastFeedback = now
        val duration = when {
            event == "clear" && (count == 4 || levelUp) -> 55L
            event == "over" -> 45L
            event == "drop" -> 25L
            else -> 15L
        }
        (getSystemService(VIBRATOR_SERVICE) as Vibrator).vibrate(
            VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE)
        )
    }

    private inner class GameBridge {
        @JavascriptInterface
        fun getPreference(key: String): String? = if (key in PREFERENCE_KEYS) preferences.getString(key, null) else null

        @JavascriptInterface
        fun savePreference(key: String, value: String) {
            if (!isValidPreference(key, value)) return
            preferences.edit().apply {
                if (key == "blok-best") {
                    val old = preferences.getString(key, "0")?.toLongOrNull() ?: 0
                    putString(key, maxOf(old, value.toLong()).toString())
                } else putString(key, value)
            }.apply()
        }

        @JavascriptInterface
        fun feedback(event: String, count: Int, levelUp: Boolean) =
            runOnUiThread { this@MainActivity.feedback(event, count, levelUp) }

        @JavascriptInterface
        fun setPlaying(playing: Boolean) = runOnUiThread { isPlaying = playing }

        @JavascriptInterface
        fun showSettings() = runOnUiThread { this@MainActivity.showSettings() }
    }

    private fun isValidPreference(key: String, value: String): Boolean = when (key) {
        "blok-best" -> value.toLongOrNull()?.let { it in 0..MAX_SCORE } == true
        "blok-volume" -> value.toIntOrNull()?.let { it in 0..100 } == true
        "blok-sound" -> value == "true" || value == "false"
        "familytris-family" -> isValidFamily(value)
        else -> false
    }

    private fun isValidFamily(value: String): Boolean = try {
        if (value.toByteArray().size > 1_000_000) false else JSONObject(value).let { family ->
            val people = family.optJSONArray("people") ?: return@let false
            val order = family.optJSONArray("order") ?: return@let false
            family.optInt("version", -1) == 1 && people.length() <= 7 && order.length() == 7 &&
                (0 until people.length()).all { index ->
                    val person = people.optJSONObject(index) ?: return@all false
                    val name = person.opt("name") as? String ?: return@all false
                    val photo = person.opt("photo") as? String ?: return@all false
                    name.length <= 24 && photo.length <= 120_000 && photo.startsWith("data:image/jpeg;base64,")
                } &&
                (0 until order.length()).all { index -> order.optInt(index, -1) in 0 until maxOf(1, people.length()) }
        }
    } catch (_: Exception) {
        false
    }

    companion object {
        private const val GAME_URL = "file:///android_asset/game/index.html"
        private const val PHOTO_PICKER_REQUEST = 100
        private const val HAPTICS_KEY = "blok.haptics"
        private const val MAX_SCORE = 9_000_000_000_000L
        private val PREFERENCE_KEYS = setOf("blok-best", "blok-volume", "blok-sound", "familytris-family")
        private var lastFeedback = 0L
    }
}
