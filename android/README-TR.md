# Android — Popzuno 0.10 gelir sistemi test dalı

Java/WebView; min API 26, target/compile API 36, JDK 17. İnternet yalnızca isteğe bağlı native reklam/mağaza
SDK'ları için eklenir. Oyun WebView'inin dış bağlantı ve `connect-src 'none'` kısıtları korunur.
AD_ID, AdServices, konum, kamera, mikrofon, geniş galeri ve rehber izinleri yoktur; fotoğraflar sistem seçicisiyle alınır.
SDK'ların normal ağ/oynatma izinleri paket incelemesinde kaydedilir. Yedekleme kapalıdır.

`npm run prepare:android`, ardından SDK/JDK hazırken `npm run build:android -- assembleDebug assembleAndroidTest lintRelease bundleRelease`.
Debug yalnızca Google rewarded test reklamını kullanır; Premium gerçek Play ürünü oluşturulmadan satışa açılmaz.
Fiziksel cihaz/mağaza sürümü `com.mertbekisoglu.bulusko`, emülatör testi `.debug` ekli pakettir.
`npm run test:android` yalnızca oluşturulan test emülatöründe sentetik fotoğraflarla çalışır.

Gerekli hesap/ürün ve lisans test adımları: [OWNER-STEPS-TR.md](../publication/monetization/OWNER-STEPS-TR.md).
İmzalı üretim AAB'si için `storeBundle` hem kullanıcıya ait ayrı upload anahtarını hem gelir sistemi kapılarını doğrular.
Google Play kayıt ücreti/mağaza hesabı bu görevde başlatılmaz. Güncel sonuç: [STATUS.json](../publication/monetization/STATUS.json).
