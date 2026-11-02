# Popzuno 0.10.0 (27) — gelir sistemi teslim raporu

2 Kasım 2026. Çalışma dalı: `codex/popzuno-rewarded-premium`.
Güvenli taban: `popzuno` / `b21be94` / 0.9.17 (26).

Kod ve yerel doğrulamalar hazırlanmıştır. **Gerçek reklam geliri veya mağaza satışı henüz açık değildir.**
AdMob hesabı açıldı; iOS/Android kayıtları ve birer Rewarded birimi oluşturuldu. Ödeme profili tamamlandı ve Google hesap doğrulaması sürüyor. Avrupa/ABD rıza taslakları kaydedildi; yayın ve gerçek cihaz doğrulaması bekliyor. Apple Premium non-consumable ürün taslağı, ABD 2,99 USD fiyatı ve altı dilde açıklamaları kaydedildi; satış ülkeleri seçilmedi, incelemeye gönderilmedi. Play ürünü henüz oluşturulmadı. Gerçek mağaza, rıza ve cihaz testleri
tamamlanmadan bu sürüm canlıya hazır sayılmaz. Ayrıntılı aşama durumu [STATUS.json](STATUS.json) içindedir.

## Tamamlanan geliştirmeler

- Ücretsiz indirme modeli; beş mod, fotoğraflar ve mevcut güçler ücretsiz kalır. Abonelik, banner,
  geçiş reklamı, ilk açılış reklamı veya zorunlu reklam eklenmedi.
- Rush: normal taşma kaybında alt üç satırı puan/bonus üretmeden kaldırma. Time Rush: biten oyun
  sayacına 15 saniye ekleme; ilerleyen zaman tüketim oranı korunur, her seviyede 15 duvar saati saniyesi
  vaat edilmez. Ascend: başarısız olunan etabın gerçek başlangıcına dönme; o denemenin puan/bonusları
  geri alınır, bedava etap açılmaz. Oyuncu açıkça Devam et'e dokunur.
- Daily 90, eski Blitz 60 ve Relax kurtarma alamaz. Kurtarılmış oyun normal rekorlara ve etap
  rekoruna yazılmaz; paylaşımda kurtarmalı olarak etiketlenir. Kurtarmadan önce gerçekten elde edilmiş
  eski rekor silinmez.
- Sadece hazır reklam ve kullanılabilir kota varsa oyun sonunda teklif. Erken kapanış/yükleme/sunum
  hatası ödül vermez; SDK earned callback'i ve başarılı kapanış gerekir. İstek ve oyun kimliği
  eşleştirilir. Tekrarlanan callback/receipt aynı ödülü ikinci kez veremez.
- Tek oyunda bir, cihazdaki kayan 24 saatte üç başarılı kurtarma. Telefonun tarih/saatini değiştirmek
  hak açmaz; native monoton sayaç kullanılır. Kota oyun verilerini sil düğmesinden ayrı tutulur.
- Tek seferlik non-consumable Premium: Prizma/Krom blok çerçeveleri, Aurora efektleri, Yörünge bonus
  animasyonu, Kristal bonus sesi. Hız, eşleşme, skor, hitbox, güç miktarı veya kurtarma avantajı sağlamaz.
  Tercihler saklanır; hak kalkınca klasik stil uygulanır. Mevcut ücretsiz stiller korunur.
- ABD fiyat hedefi 2,99 USD; satın alma düğmesi yalnızca mağazanın döndürdüğü gerçek yerel fiyatla
  açılır. Gerçek ürün yokken “Henüz satışa açılmadı” görünür.
- StoreKit 2: verified/currentEntitlements/Transaction.updates, restore ve revocation.
  Play Billing: PURCHASED + ürün/paket + RSA imzası, acknowledge, token eşzamanlama,
  yeniden açılış/bağlantı sorgusu ve başarılı boş sorguda hakkı kaldırma. Pending/cancel/error yeni hak açmaz.
- Türkçe, İngilizce, İtalyanca, İspanyolca, Almanca ve Rusça metinler. Küçük ekran kurtarma kartında
  gereksiz tekrarlar azaltıldı. Kozmetik animasyonlar reduced-motion tercihini gözetir.
- Çocuklar dahil karma kitle için nötr kaba yaş seçimi. Tam doğum tarihi alınmaz. Çocuk, genç ve
  belirsiz yaşlarda reklam veya yeni satın alma başlatılmaz. Ücretsiz oyun ve mevcut doğrulanmış
  kozmetik haklar korunur. Bu tedbir mağaza Kids/Families veya hukuki uygunluk onayı değildir.
- Fotoğraf, aile adı ve tahta reklam/satın alma bridge'ine gönderilmez. Android AD_ID ve AdServices
  kimlik/attribution/topic izinleri kaldırıldı; ATT/IDFA izni eklenmedi. Yetişkin reklamları
  kişiselleştirme kapalı ve G içerik filtresiyle hazırlanır. SDK veri beyanı yine gereklidir.

## Önemli dosyalar

| Alan | Dosyalar |
|---|---|
| Ortak protokol ve arayüz | `dist/commerce.mjs`, `commerce-ui.mjs`, `commerce-copy.mjs` |
| Gerçek kurtarma ve rekor | `dist/arcade-engine.mjs`, `dist/arcade.mjs` |
| Kozmetik stil/ses | `dist/arcade-refresh.css`, `dist/sound.mjs` |
| iOS | `ios/Bulusko/CommerceService.swift`, `CommerceLedger.swift`, `PremiumStore.swift`, `GameWebView.swift` |
| Android | `android/app/src/main/java/com/mertbekisoglu/bulusko/{CommerceService,CommerceLedger,PremiumBilling,MainActivity}.java` |
| Güvenli yapılandırma | `config/monetization.json`, `scripts/check-monetization-release.mjs`, native prepare/build dosyaları |
| Doğrulama | `tests/commerce.test.mjs`, iki native ledger testi, `tests/PremiumStoreTests.swift`, Android instrumentation |
| Gerçek paket denetimi | `scripts/inspect-native-artifacts.py`, `scripts/verify-publication.mjs` |
| Gizlilik ve mağaza taslakları | `dist/privacy.mjs`, `publication/legal/PRIVACY-*.md`, `publication/store/` |
| Gerçek Apple ürün kaydı | `publication/monetization/APPLE-PREMIUM-SETUP-TR.md`, `PREMIUM-STORE-COPY.json` |

SDK'lar resmî kaynaklardan sabit sürümlerle çözülür: iOS Google Mobile Ads 13.11.0 / UMP 3.1.0;
Android Google Mobile Ads 25.5.0 / UMP 4.0.0 / Play Billing 9.1.0. Android'de Families listesi
nedeniyle desteklenen `play-services-ads` hattı seçildi. Yayın gününde tam sürüm uygunluğu yeniden kontrol edilmelidir.

## Testler ve gerçek kapsam

| Kontrol | Sonuç / sınır |
|---|---|
| Başlangıç | 98 JS, 187 Android kontrolü ve iki platform derlemeleri geçti |
| Son JavaScript | 110 geçti, 0 hata; motor kurtarmaları, puan bütünlüğü, zaman/phase, protokol, tekrar/erken kapanma/hata, uzun arka plan, hak durumları, altı dil |
| Son Android native | İnternet kapalıyken 206 geçti; mevcut oyun/fotoğraf/audio testleri, native ödül finalizasyonu, kota, RSA ve kozmetik hak arayüzü |
| Yerleşim | Android native içinde 90 oyun +18 ana menü durumu; altı dilde kurtarma kartları |
| Native kota | Java ve Swift: bir oyun, üç/24 saat, receipt tekrarı, yeniden açılış, saat bağımsızlığı, reboot ve yazma hatası testleri geçti |
| Swift depolama | Eski kayıtlar, Relax ve yeni kozmetik alanlarının doğrulanması geçti |
| Android gerçek reklam SDK | Google'ın özel TEST reklamı yüklendi, earned ve dismissal callback'leri geldi; ödül sonrası X kapatması gözetimli yapıldı. İnternetsiz yükleme hatasında çökme/ödül yok |
| iOS yerel StoreKit | 8 native test geçti, 0 hata; gerçek StoreKit 2 yerel katalog satın alma/yeniden açılış/restore/iade, pending, imza/ağ/iptal koruması ve gerçek Google SDK başlangıcı; gerçek mağaza satışı değildir |
| Android derleme | Debug APK, test APK, imzasız Release AAB ve lint başarılı; 0 lint hatası, 3 uyarı |
| iOS derleme | Debug test hedefi ve son kaynaklardan imzasız Release archive başarılı; dağıtım imzası/yükleme yok |
| Gerçek paket karşılaştırması | 236 kontrol geçti; gömülü HTML/lisanslar, target36/min26, izinler, imzasızlık, altı offline dil, test katalog/sınıflarının ana pakete girmemesi |
| Yayın kapısı | Güvenli varsayılan yapılandırma geçti; `--publication` eksik hesap/ürün/beyanları beklendiği gibi reddeder |

Reklamın oyun akışına uygulanması deterministik native/JS/UI testleriyle; gerçek Google ağı callback'leri
ayrı test probuyla doğrulandı. İkisini, gerçek yayıncı hesabında uçtan uca UMP + oyun kurtarması testi
tamamlandı şeklinde yorumlama. Gerçek video sırasında erken kapatma, bağlantı kopması, telefon görüşmesi,
arka plan, ses dönüşü ve fiziksel cihaz performansı ayrıca denenmelidir. FPS ölçümü yapılmadı.

Android RSA testleri sentetik imzalı fixture kullanır; Play mağazasının gerçek satın alma/acknowledgement
akışı henüz çalıştırılmadı. iOS yerel katalog satın alma testleri de App Store sandbox ürünü yerine geçmez.
iOS 27.0 test daemon'u enjekte edilen userCancelled hatasını ASD 907/genel hata döndürebilir.
Bu durumda hak açılmaması ve belgeli cancellation hata sınıflandırması ayrı sınanır; gerçek iptal ekranı
testi yapılmış sayılmaz. İlk başarısız test girişimi yerel kayıtta saklanır.

Ham test kayıtları `publication/monetization/evidence/` ve `publication/evidence/` altında yerelde tutulur;
xcresult ve derlenmiş ikililer Git'e girmez. Paylaşılabilir sonuç özeti STATUS.json/VALIDATION.json'dadır.
Paket hashleri `ARTIFACTS.json` içindedir. Android lint uyarıları: araç sürümü, eski SDK koşulu,
monochrome launcher katmanı; gelir sistemi hatası olarak gizlenmedi.

## Açık sınırlar ve yapılmamış işler

1. **Kota cihaz başınadır.** Sunucu/hesap olmadan aynı insanı çoklu cihazda sınırlayamaz.
   Android yeniden kurulum/root veya uygulama verisini sistemden silme korumayı aşabilir.
   Reboot/kapalı geçen süre beklemeyi uzatabilir. iOS kota cihazla sınırlı Keychain'dedir.
2. Backend, Google SSV, Play Developer API/RTDN veya App Store Server Notifications kurulmadı.
   İadeler çevrimdışıyken anlık bilinmez; sonraki başarılı mağaza sorgusunda uygulanır.
   Aynı mağaza hesabında geri yükleme vardır; mağazalar arası satın alma taşınmaz.
3. Reklam sırasında normal arka plana geçişte oyun durur. İşlemi zorla öldürmek aktif oyunu
   kaybettirebilir; kota yazılmışsa hak tüketilmiş olabilir. Mevcut oyun tam disk oturum kurtarmasına sahip değildir.
4. AdMob hesabı ve iki platformun üretim kimlikleri hazır; kimlikler yalnızca yerel yapılandırmada tutuluyor. Ödeme profili tamamlandı ve hesap incelemesi sürüyor; uygulama incelemesi için mağaza bağlantıları bekleniyor. Avrupa ve ABD mesajları yalnızca Draft durumunda; yayımlanmadı veya cihazda doğrulanmadı. Apple'ın gerçek ürün taslağı ve fiyatı kaydedildi; iki ABD vergi formu Active. Banka ve Paid Apps Agreement Processing; etkinleşme, DSA beyanı, inceleme görseli ve gerçek sandbox testleri bekliyor. Play ürünü/fiyatı ve gerçek satın alma
   testleri yok. Çocuk/yaş beyanları, App Privacy/Data Safety ve hukuki/marka incelemesi sonuçlandırılmadı.
5. Yeni politika/destek metinleri yerel taslaktır; canlı site hâlâ önceki sürüm açıklamasını içerebilir.
   Bu SDK'lı aday yayımlanmadan önce gerçek sayfalar ve konsol beyanları birlikte güncellenmelidir.
6. Bu sürüm telefona kurulmadı, TestFlight/Play'e gönderilmedi, canlı site yayımlanmadı.
   Ödeme yapılmadı veya ücretli hizmet başlatılmadı. AdMob hesap açılışındaki sözleşmeyi
   hesap sahibi Google ekranında kendisi kabul etti; agent sözleşme kabul etmedi.

## Sonraki hesap sahibi adımları

[OWNER-STEPS-TR.md](OWNER-STEPS-TR.md) resmî sayfaları, menüleri ve gerekçeleri içerir:

1. AdMob hesabı, iki platformun uygulaması ve birer Rewarded birimi oluşturuldu. Ödeme profili tamamlandı; Google hesap doğrulaması sürüyor. Mağaza bağlantıları ve uygulama incelemesi,
   [rıza taslaklarının son kontrolü](CONSENT-DRAFTS-TR.md), canlı gizlilik sayfası güncellemesi ve gerçek cihaz testleri gerekir.
2. Apple non-consumable Premium ürün taslağı, ABD temel fiyatı 2,99 USD ve altı dil oluşturuldu.
   Developer License Agreement ve Legal Entity önceki uyarıları kalktı. Paid Apps Agreement hesap sahibi
   tarafından kabul edildi; Processing durumunda. Banka kaydı owner tarafından eklendi ve
   Processing görüldü; banka ve sözleşmenin etkinleşmesi bekliyor. İki ABD vergi formu da hesap
   sahibi tarafından gönderildi ve her ikisinin Active olduğu doğrulandı. Yeni vergi formu gönderimi gerekmez.
   [Apple kayıt ayrıntıları](APPLE-PREMIUM-SETUP-TR.md). Gerçek cihazda sandbox satın alma/iptal/restore/iade dene.
3. Google Play kaydı ödemesi daha önce ertelendi. Ayrı onay gelmeden ödeme yapılmaz. Hazır olunca
   aynı ürün, açık lisans doğrulama anahtarı ve internal/license test kullanıcılarıyla test yapılır.
4. Karma kitle/Kids/Families, gizlilik beyanları ve gerçek cihaz testleri tamamlanınca yerel yapılandırma
   kapıları açılır. Üretim kimlikleri/test kimliği ayrımı yeniden denetlenir. Son yayın için ayrıca onay gerekir.

Orijinal `aile-akisi`, `popzuno` dalı ve telefondaki çalışan sürüm korunur. Fotoğraf işleme,
portre çizimi, mevcut depolama anahtarları ve anons klipleri taban sürümle birebir aynı tutuldu.
App Store Connect girişi yenilendi. Hesap sahibi güncellenen geliştirici sözleşmesini ve yasal adres
doğrulamasını tamamladı; önceki uyarıların kalktığı doğrulandı. Paid Apps Agreement da kabul edildi;
Processing durumunda. Banka kaydı Processing; ilk vergi formu ve W-8BEN Active olarak doğrulandı.
W-8BEN'in kimlik alanlarını hesap sahibi doldurdu, Part II taslağı verdiği bilgilere göre hazırlandı.
Onay kutularını ve son gönderimi hesap sahibi tamamladı. Kimlik/banka numaraları veya doğum tarihi
belgelere/Git'e alınmadı. Active, form kaydının durumudur; vergi sınıflandırmasının hukuki onayı değildir.
Bu turda yalnızca konsol/metin kayıtları değişti; native kod veya ikililer yeniden derlenmedi.

Geri dönmek için orijinal çalışma klasörü kullanılabilir veya temiz checkout'ta `git switch popzuno` yapılabilir;
bu yeni daldaki değişiklikleri silmek gerekmez.
