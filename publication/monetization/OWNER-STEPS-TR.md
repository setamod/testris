# Hesap sahibinin tamamlayacağı adımlar

Bu dalda uygulama indirmesi ücretsiz, beş mod ve fotoğraflar ücretsiz, Premium tek seferlik kozmetiktir.
Hedef ABD fiyatı 2,99 USD'dir. Satıştaki yerel tutarı mağaza belirler; uygulama yalnızca mağaza fiyatını gösterir.
Karma kitle çocukları içerir. Çocuk/genç/belirsiz yaşlarda reklam veya yeni satın alma başlatılmaz.

## 1. AdMob hesabı ve dört kimlik

Neden: Google'ın test reklamları gerçek gelir sağlamaz; kendi uygulama ve reklam birimleri gerekir.
Dört üretim kimliği Git dışında `monetization.local.json` dosyasına kaydedildi; canlı reklamlar kapalıdır.
[AdMob](https://admob.google.com/home/) → giriş/hesap oluşturma. Koşulları ve kimlik/ödeme bilgilerini
hesap sahibi inceler ve kendisi tamamlar. Hesap açılışı artık tamamlandı; sözleşme kabulünü hesap sahibi Google ekranında kendisi yaptı.
iOS ve Android için Popzuno kayıtları ve birer Rewarded birimi oluşturuldu. Aşağıdaki oluşturma
adımlarını yeniden uygulama; ödeme profili de tamamlandı ve hesap incelemesi sürüyor. Avrupa ve ABD mesajları yalnızca taslaktır;
yayınlanmadan önce CONSENT-DRAFTS-TR.md içindeki engeller giderilmelidir.

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

[App Store Connect](https://appstoreconnect.apple.com/) → Apps → Popzuno → Monetization → In-App Purchases.
**Ürünü yeniden oluşturma:** `com.mertbekisoglu.bulusko.premium` / Non-Consumable / Popzuno Premium Cosmetics
kaydı oluşturuldu. ABD temel fiyatı 2,99 USD, altı dilde kısa açıklamalar ve inceleme notları kaydedildi.
Durum Prepare for Submission; Availability seçilmedi, incelemeye gönderilmedi. Ayrıntılar
[Apple kurulum kaydında](APPLE-PREMIUM-SETUP-TR.md).

Hesap sahibi güncellenen Developer License Agreement ve Legal Entity adres doğrulamasını tamamladı;
önceki uyarılar kalktı ve Free Apps Agreement Active görünüyor. Paid Apps Agreement'ı da hesap sahibi
kabul etti; sözleşmenin güncel durumu **Processing**, henüz Active değil.
Business → Bank Accounts altında owner'ın eklediği bir kayıt **Processing** olarak doğrulandı;
aynı hesabı tekrar ekleme. Banka onayı henüz tamamlanmadı. Banka bilgileri ve son onaylar owner tarafından
girildi; agent bunları belgelere almadı.
Tax Forms altında **U.S. Certificate of Foreign Status of Beneficial Owner** owner tarafından gönderildi
ve **Active** görüldü. **U.S. Form W-8BEN** de hesap sahibi tarafından gönderildi ve **Active** doğrulandı.
Bu iki form yeniden doldurulmayacak. Apple, banka değişikliklerinin 24 saat içinde yansıyacağını
belirtiyor; banka ve Paid Apps Agreement'ın etkinleşmesi henüz bekleniyor.
W-8BEN'in kimlik alanlarını hesap sahibi girdi; Part II taslağı verdiği bilgilere göre hazırlandı.
Kişisel beyan kutularını, imzalama onayını ve son Submit işlemini hesap sahibi tamamladı.
Kimlik numarası, doğum tarihi veya banka numaraları belgelere/Git'e alınmadı. Active durumu,
gelir sınıflandırmasının hukuki onayı veya gerçek kesinti testi değildir.
Apple üyeliğine yeniden ödeme yapılmadı.
Yeni build'in satın alma ekranından istenen ürün inceleme görseli hazırlanmalı; satış ülkeleri ve yerel
fiyatlar son onayda kontrol edilmelidir. Eski yüklenmiş build'ler bu satın alma ekranını içermez.
Sandbox test hesabını oluştur; geliştirici imzalı cihazda satın al, iptal et, geri yükle, tekrar aç ve iadeyi dene.
Yerel StoreKitTest başarıları App Store sandbox/gerçek ürün onayı yerine geçmez.

## 3. Google Play ürünü ve lisans testleri

[Play Console](https://play.google.com/console/) hesabın henüz tamamlanmadı; ücret ödenmeden burada ilerlenemeyebilir.
Bu görev ek ücret yetkisi vermediği için Google Play kayıt ödemesi yapılmadı.
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

Hiçbir mağaza gönderimi, gerçek ödeme veya canlı reklam isteği yapılmadı. AdMob sözleşmesini hesap sahibi kendisi kabul etti; yeni sözleşmeler otomatik kabul edilmez.
