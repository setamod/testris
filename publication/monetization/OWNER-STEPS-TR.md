# Hesap sahibinin tamamlayacağı adımlar

Bu dalda uygulama indirmesi ücretsiz, beş mod ve fotoğraflar ücretsiz, Premium tek seferlik kozmetiktir.
Hedef ABD fiyatı 2,99 USD'dir. Satıştaki yerel tutarı mağaza belirler; uygulama yalnızca mağaza fiyatını gösterir.
Karma kitle çocukları içerir. Çocuk/genç/belirsiz yaşlarda reklam veya yeni satın alma başlatılmaz.

## 1. AdMob hesabı ve dört kimlik

Neden: Google'ın test reklamları gerçek gelir sağlamaz; kendi uygulama ve reklam birimleri gerekir.
[AdMob](https://admob.google.com/home/) → giriş/hesap oluşturma. Koşulları ve kimlik/ödeme bilgilerini
hesap sahibi inceler ve kendisi tamamlar. Bu çalışma sırasında hesabın açılmadı, sözleşme kabul edilmedi.

Apps / Uygulamalar → Add app / Uygulama ekle → iOS. Mağazada listelenmemişse buna uygun seçeneği kullan.
Adı Popzuno; gerçek iOS bundle kimliği `com.mertbekisoglu.bulusko`.
Ad units / Reklam birimleri → Add → **Rewarded / Ödüllü**. Banner/interstitial/app-open oluşturma.
Aynı adımları Android için yap. Gerekli dört değer:

- iOS AdMob App ID (`~` içerir), iOS rewarded ad unit ID (`/` içerir).
- Android AdMob App ID (`~` içerir), Android rewarded ad unit ID (`/` içerir).

Privacy & messaging / Gizlilik ve mesajlar → uygulamalar için gerekli bölgesel mesajları oluştur,
yayımla ve uygulamadaki UMP akışını gerçek cihazda dene. Yayımlanacak yaş kitlesi ve mağaza kurallarıyla
uyumunu incele. `app-ads.txt`, uygulama hazırlık incelemesi ve mağaza bağlantılarını AdMob yönlendirmesine göre tamamla.
Ad kimlikleri parola değildir; şifre/kart/gizli anahtarlarını sohbete yazma.

## 2. Apple Premium ürünü

[App Store Connect](https://appstoreconnect.apple.com/) → Apps → Popzuno → Monetization → In-App Purchases → +.
Tür: **Non-Consumable**. Ürün: `com.mertbekisoglu.bulusko.premium`. Referans adı: Premium Cosmetics.
Açıklamada çerçeve/efekt/animasyon/bonus sesi paketini açıkça belirt. Ek kurtarma veya oyun avantajı vaat etme.
ABD temel fiyatını 2,99 USD olarak seç; yerel fiyat ve vergileri kontrol et. İstenen ürün inceleme ekranını ekle.
Business / Agreements, Tax and Banking kısmında ücretli içerik için gerekli sözleşme/vergi/banka işlemlerini
hesap sahibi tamamlar. Apple üyeliğine yeniden ödeme yapılmadı.
Sandbox test hesabını oluştur; geliştirici imzalı cihazda satın al, iptal et, geri yükle, tekrar aç ve iadeyi dene.
Yerel StoreKitTest başarıları App Store sandbox/gerçek ürün onayı yerine geçmez.

## 3. Google Play ürünü ve lisans testleri

[Play Console](https://play.google.com/console/) hesabın henüz tamamlanmadı; ücret ödenmeden burada ilerlenemeyebilir.
Bu görev ek ücret yetkisi vermediği için kayıt/ödeme yapılmadı.
Hesap hazır olduğunda uygulama → Monetize with Play → Products → One-time products.
Aynı ürün kimliğiyle **satın alma** seçeneği oluştur; kiralama/abonelik/tüketilebilir ürün oluşturma.
ABD fiyat hedefi 2,99 USD; bölgesel fiyatları kontrol et.
Monetization setup / Licensing alanındaki **açık RSA lisans anahtarını** yerel yapılandırmaya ekle.
Özel imza anahtarını, hizmet hesabı anahtarını veya ödeme bilgilerini paylaşma.
İmzalı release paketini internal test track'e yüklemek ve lisans test kullanıcılarını seçmek ayrı adımdır.
Gerçek Play satın alma testleri `.debug` APK ile yapılamaz: mağazadaki gerçek paket ve test hesabı gerekir.

## 4. Yerel yapılandırma ve açılış kapıları

Git'in dışında tutulan `monetization.local.json` dosyasında `config/monetization.json` alanlarını geçersiz kıl.
Ad kimlikleri ve ürün kimlikleri gizli erişim anahtarı değildir; yine de bu dal varsayılan olarak canlı kimlik içermez.
`liveAdsEnabled` ve `storeProductsEnabled` yalnızca hesaplar/ürünler hazırken açılır.
`audienceApproved` ve `privacyDeclarationsApproved`, hedef kitle ve beyanlar gerçekten incelenince açılır.
`npm run prepare:ios` / `npm run prepare:android` ardından yeniden derleme gerekir.
Release doğrulaması test reklam kimliklerini reddeder. `storeBundle`, imzalama ve gelir sistemi kapılarını zorunlu tutar.

## 5. Yayımdan önce

- App Privacy ve Data Safety formlarını SDK veri davranışlarıyla güncelle; "veri toplanmaz" işaretleme.
- Google Play hedef kitle/Families ve Apple yaş/Kids kategorisi kararlarını gerçek içeriğe göre tamamla.
- Bu dalın gizlilik/destek sayfaları yerel taslaktır. Canlı destek sitesini ayrı onayla güncelle.
- Çocuklara reklam veya satın alma açmak istenirse mevcut yetişkin sınırını kaldırmadan önce
  ebeveyn kapıları, yaş onayı, reklam sürümü sertifikasyonu ve hukuki inceleme tamamlanmalıdır.
- ATT isteyen izleme bu dalda eklenmedi. Yapılandırma/mediation değişirse değerlendirmeyi yeniden yap.
- Gerçek iPhone/Android cihazında reklam erken kapatma, ağ kesilmesi, çağrı/arka plan ve ses dönüşünü dene.
- Premium'un beş modu, standart fotoğrafları veya normal güçleri kilitlemediğini ve kurtarma vermediğini doğrula.

Hiçbir mağaza gönderimi, gerçek ödeme, canlı reklam isteği veya yeni hukuki kabul bu görevde otomatik yapılmaz.
