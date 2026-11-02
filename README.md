# Popzuno — rewarded / Premium geliştirme dalı

0.10.0 (27), `codex/popzuno-rewarded-premium`. Güvenli taban: `popzuno` dalındaki
0.9.17 (26), `b21be94`. Bu bağımsız çalışma klasörü orijinal kaynakları ve telefondaki uygulamayı değiştirmez.

Oyun ücretsiz indirme modeliyle hazırlanır. Beş mod, standart fotoğraf kişiselleştirmesi ve güçlendirmeler ücretsizdir.
Reklamlar zorunlu değildir; yalnızca yetişkin yaş aralığında isteğe bağlı ödüllü reklamlar vardır.
Premium tek seferlik kozmetik pakettir; fiyat hedefi 2,99 USD, gerçek fiyat mağazadan okunur.
Abonelik, ücretli skor/süre avantajı, Premium kurtarma veya online hesap eklenmez.

- Rush: bir kez üç alt satırı temizleme, puan/bonus üretmeden devam.
- Time Rush: bir kez oyun sayacına 15 saniye; mevcut zaman tüketim oranı korunur.
- Ascend: bir kez aynı etabın başlangıcına dönme; başarısız denemenin puan/bonusları geri alınır.
- Daily 90, eski Blitz 60 ve Relax kurtarma almaz. Kurtarılan skorlar normal rekorlara yazılmaz.
- Yerel monoton saate göre kayan 24 saatte üç kurtarma. Kesin kişi/çoklu cihaz güvenliği için sunucu gerekir.
- Çocuk/genç/belirsiz yaşta reklam ve yeni satın alma başlatılmaz. Tam doğum tarihi toplanmaz.

[Uygulama planı](publication/monetization/PLAN-TR.md), [hesap sahibinin adımları](publication/monetization/OWNER-STEPS-TR.md),
[gizlilik/güvenlik sınırları](publication/monetization/PRIVACY-AND-SECURITY-TR.md),
[doğrulama durumu](publication/monetization/STATUS.json) ve [son rapor](publication/monetization/REPORT-TR.md).
Önceki sürüm notları [CHANGELOG.md](CHANGELOG.md) içindedir. Mevcut yasal/marka incelemesi sonuçlandırılmış sayılmaz.

## Teknoloji ve çalıştırma

Oyun: bağımlılıksız JavaScript/Web Audio/Canvas, 8×11 alan. iOS: SwiftUI/WKWebView, StoreKit 2,
Google Mobile Ads 13.11.0 ve UMP 3.1.0 (SPM). Android: Java/WebView, Google Mobile Ads 25.5.0,
UMP 4.0.0, Play Billing 9.1.0 (Gradle). Fotoğraflar cihazda işlenir; commerce bridge fotoğraf taşımaz.

Node.js ile `npm test`, `npm run package`, `npm run prepare:ios`, `npm run prepare:android`.
Taşınabilir dosya bu dalın kendi `releases/Popzuno-Prototip/OYNA.html` yolundadır.
Web sürümü mağaza işlemi/reklam taklidi yapmaz; temel oyun oynanabilir kalır.
Android için SDK 36/JDK 17; iOS için Xcode ve paket çözümleme erişimi gerekir.
Yerel `.tooling` SDK önbelleği ve `monetization.local.json` Git'e girmez.

## Testler ve canlı kapısı

`node --test tests/*.test.mjs` motor, bridge ve kozmetik kurallarını sınar.
`npm run build:android -- assembleDebug assembleAndroidTest lintRelease bundleRelease` native kodu derler.
`npm run test:android` yalnızca `Kynburst-QA-36` emülatörü ve `.debug` paketinde çalışır, sentetik veriler kullanır.
Ek Google test reklamı probu aynı test APK'sında `-e sdkProbe true` parametresiyle çalıştırılabilir; sonuç gerçek
reklam ağı bağlantısının durumunu bildirir, deterministik callback testleriyle karıştırılmaz.

Xcode `Bulusko` şemasındaki `CommerceTests`, yerel `.storekit` kataloğuyla StoreKit API'lerini çalıştırır.
Bu katalog, XCTest kaynakları ve AdMob probu uygulamanın Release paketinde bulunmaz. Gerçek para harcanmaz.
Apple sandbox ve Play lisans testleri ayrıca tamamlanmalıdır.

`node scripts/check-monetization-release.mjs` güvenli geliştirme yapılandırmasını doğrular.
`--publication` hesap/ürün/beyan kapıları eksikken başarısız olur. Android `storeBundle` aynı kapıları ve
ayrı imzalama anahtarını ister. Varsayılan Release reklam/satış kapalıdır; Debug yalnızca Google test kimliklerini kullanır.
Hiçbir canlı mağaza gönderimi, ek ödeme veya sözleşme kabulü bu dalın testleriyle otomatik yapılmaz.

## Geri dönüş

Bu dalın değişiklikleri commit edildikten sonra `git switch popzuno` ile tabana dönülebilir.
`popzuno` dalına merge/push yapılmaz. Yeni uygulama fiziksel telefona kurulmadıkça mevcut kurulum aynen devam eder.
