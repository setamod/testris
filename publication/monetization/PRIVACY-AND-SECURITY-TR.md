# Gizlilik, güvenlik ve yayın sınırları

Resmî kaynaklar 2 Kasım 2026 tarihinde kontrol edildi. Bu belge teknik hazırlıktır; hukuki onay değildir.

- [Google Play Families](https://support.google.com/googleplay/android-developer/answer/9893335): karma kitlede nötr yaş ekranı gerekir.
- [Families SDK listesi](https://support.google.com/googleplay/android-developer/answer/12955712): Android için listelenmiş `play-services-ads` hattı seçildi; 25.5.0 tam sürümünün yayın günündeki sertifikasyonunu SDK Index'te tekrar doğrula.
- [AdMob Android veri beyanı](https://developers.google.com/admob/android/privacy/play-data-disclosure), [iOS veri beyanı](https://developers.google.com/admob/ios/privacy/data-disclosure): IP/yaklaşık konum, cihaz/uygulama, teşhis/performans ve reklam etkileşimleri değerlendirilmelidir. SDK toplamasını uygulamanın kendi veri toplamamasıyla karıştırma.
- [Apple App Privacy](https://developer.apple.com/app-store/app-privacy-details/), [ATT/izleme](https://developer.apple.com/app-store/user-privacy-and-data-use/): bu kod IDFA veya ATT izni istemez; Android reklam kimliği/AdServices izinleri kaldırılır. Kişiselleştirme kapalı, çocuk/genç/belirsiz yaşta reklam yasağı ve G içerik filtresi uygulanır. Bu durum SDK verilerinin mağazaya beyanını ortadan kaldırmaz.
- [Apple çocuk deneyimleri](https://developer.apple.com/kids/): Kids kategorisine otomatik uygunluk iddiası yoktur. Harici destek bağlantıları/ebeveyn kapısı ve kategori seçimi ayrıca incelenmelidir. Çocuk/genç/belirsiz yaşlarda yeni ticari işlem veya reklam başlatılmaz; temel oyun açıktır.
- [StoreKit hakları](https://developer.apple.com/documentation/storekit/transaction/currententitlements): yalnızca doğrulanmış, iptal edilmemiş haklar. `Transaction.updates` izlenir; `AppStore.sync` kullanıcı isteğiyle çalışır.
- [Play Billing entegrasyonu](https://developer.android.com/google/play/billing/integrate) ve [güvenlik](https://developer.android.com/google/play/billing/security): PURCHASED + gerçek ürün/paket + RSA imzası gerekir; pending açılmaz. Acknowledge başarılı olmadan yeni hak saklanmaz. Aynı token için acknowledgement birleştirilir. Başarılı boş sorgu iadeyi/erişim kaybını uygular; ağ hatası doğrulanmış mevcut hakkı silmez.

## Fotoğraflar

Commerce bridge yalnızca işlem türü, rastgele istek/oyun kimliği, kaba yaş grubu ve kurtarma türünü taşır.
Fotoğraf, isim, yüz ölçümü, pano veya oyun tahtası reklam/satın alma isteğine eklenmez.
Oyun WebView'inin `connect-src 'none'` kuralı ve dış gezinti engeli korunur. SDK kendi native ekranını kullanır.
Fotoğraf seçicisi ve varsayılan çizimler ücretsizdir. Mediation veya Firebase eklenmez.

## Günlük sınır ve sunucu sınırı

Native monoton saate göre kayan 24 saatte 3, aynı run kimliğinde 1 başarılı kurtarma. Telefon saatinin ileri/geri
alınması veya saat dilimi değişmesi hak açmaz. Yeniden başlatma/kapalı geçen süre beklemeyi uzatabilir.
iOS kota Keychain'de cihazla sınırlı, Android özel tercihlerde ve yedekleme kapalı tutulur.
Oyun verilerini silme kotayı veya mağaza haklarını sıfırlamaz. Yeniden kurulum/root/jailbreak/çoklu cihaz ve
aynı insanın farklı kurulumları için kesin güvenlik sağlanmaz. "Oyuncu başına kesin günlük sınır" için hesap/sunucu gerekir.

## Ödül ve skor bütünlüğü

Yalnızca Google'ın reward callback'i ve başarılı tam ekran kapanışı ödüle dönüşür; callback sırası resmî Google
reklamları içindir, mediation açılmadı. Erken kapatma, yükleme/sunum hatası, tekrar callback ve eski istek kimliği ödül vermez.
Native kota ödül bildirilmeden önce kalıcı yazılır. Uygulamanın ad sırasında zorla öldürülmesi devam eden oyunu
kaybettirebilir: mevcut oyunda tam oturum/disk geri yükleme yoktur. Bu durumda bir kota tüketilmiş olabilir;
aynı ödül ikinci kez verilmez. Normal arka plana geçişte oyun saati/tahta bellekte durur.
Kurtarılmış skorlar/etap rekorları normal kayda yazılmaz, paylaşımda etiketlenir. Daily/Blitz/Relax kurtarma alamaz.

## İade ve güçlü doğrulama

StoreKit OS imza doğrulaması ve Play yerel RSA kontrolü uygulanır. Play token doğrulama/RTDN ve App Store
Server Notifications olmadan iadelerin çevrimdışıyken anlık bilinmesi veya root'lu cihazda kesin hak güvenliği iddia edilmez.
Bu küçük kozmetik pakette çevrimdışı doğrulanmış hak korunur; yeniden bağlantıda mağaza sorgusu yapılır.

İleride sunucu kullanılırsa: Google rewarded SSV ECDSA imzası, timestamp, benzersiz transaction ID ve sunucu nonce'u
kontrol edilmeli; atomik günlük/oyun kotası sunucuda tutulmalıdır. Satın alma token/JWS'leri mağaza sunucu API'leriyle
doğrulanmalı, iade bildirimleri işlenmelidir. Gizli anahtarlar uygulamada tutulmaz. Bu görevde sunucu/ücretli hizmet kurulmadı.

Yalnızca doğrulama ekranında yetişkin yaş aralığı seçen oturum reklam hazırlayabildiğinden gerçek uygulama reklam istekleri yetişkin rıza akışı (UMP under-age=false, SDK age-treatment=unspecified) kullanır. Kişiselleştirme kapalıdır. Çocuk etiketi yetişkin kullanıcıya yanlış biçimde uygulanmaz; çocuk/genç/belirsiz yaşta reklam SDK başlangıcı ve istekleri yapılmaz. Nötr yaş sorusu büyük yaş seçmenin avantajlarını öne çıkarmaz.

Reklam ve satın alma native pencereleri açıkken JS istemci duvar saati zaman aşımı uygulamaz; uzun bir arka plan/telefon görüşmesi, aynı oturumda sonra gelen doğrulanmış ödülü düşürmez. Ağ hazırlığı hataları SDK callback'leriyle ve hazırlık zaman aşımıyla sonuçlanır.
