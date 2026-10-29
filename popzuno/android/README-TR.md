# Popzuno Android

Yerel HTML oyunu, Android WebView kabuğu, yerel sesler ve titreşim. Üretim paket kimliği `com.mertbekisoglu.bulusko`; debug sürüm `.debug` son ekiyle ayrı kurulur. Android 8+; hedef API 36. Oyunda INTERNET, geniş fotoğraf/galeri, kamera, mikrofon, reklam kimliği veya takip izni yoktur. Sistem belge/fotoğraf seçicisi yalnızca kullanıcının seçtiği görseli açar. Bulut ve cihaz aktarımı yedekleri kapalıdır.

## Derleme

1. JDK 17, Gradle 9.1.0 ve lisansları kabul edilmiş Android SDK (platform 36, build-tools 36.0.0) gerekir. Bunlar oyunun içine paketlenmez.
2. Proje kökünde `npm run prepare:android`.
3. Proje kökünde `npm run build:android` veya Android klasöründe `./gradlew assembleDebug lintRelease bundleRelease`. SDK/JDK konumları normal ortam değişkenleri veya yok sayılan `local.properties` ile verilir; yardımcı script mevcut izole `.tooling/` kurulumunu da bulur.
4. APK: `app/build/outputs/apk/debug/app-debug.apk`. Anahtarsız Release AAB: `app/build/outputs/bundle/release/app-release.aab`. **Anahtarsız AAB yüklenebilir mağaza sürümü değildir.**

## Üretim imzası

Upload key geliştiricinin kontrolünde oluşturulmalı ve güvenli bir yerde yedeklenmelidir. Sertifika/parola sohbete, Git'e veya web sitesine eklenmez. `keystore.properties` ve `.jks` dosyaları Git tarafından yok sayılır. Yerel dosya biçimi:

```
storeFile=/absolute/private/path/upload-key.jks
storePassword=OWNER_ENTERED_PASSWORD
keyAlias=kynburst-upload
keyPassword=OWNER_ENTERED_PASSWORD
```

Bu bir şablondur; bu değerler parola olarak kullanılmaz. İmzalı gönderim için `gradle storeBundle`; imza bilgisi yoksa görev açık hatayla durur. Debug imzası üretimde kullanılmaz. Play App Signing kaydı ve upload sertifikası Play hesabı açıldıktan sonra geliştiriciyle tamamlanır.

## Test

Gerçek Android cihazda veya emulator üzerinde dokunma/kaydırma, fotoğraf seçme/iptal, çevrimdışı yeniden açma, altı dil, müzik odağı, arka plana geçiş, her bonusun titreşimi ve tüm verileri silme denenmelidir. APK derlenmiş olması cihaz testinin tamamlandığı anlamına gelmez. Son durum `../publication/VALIDATION.json` içinde tutulur.

`npm run test:android` yalnızca bu çalışma için oluşturulan `emulator-5554` ve `.debug` uygulamasında sentetik kayıtları sıfırlayıp yerel testleri çalıştırır. Gerçek cihazda veya mağaza paketinde çalıştırmayı reddeder. Fotoğraf sağlayıcıları, gerçek titreşim/ses hissi ve uzun oturum performansı ayrıca gerçek cihaz test planındadır.
