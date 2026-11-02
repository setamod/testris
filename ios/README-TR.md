# iOS — Popzuno 0.10 gelir sistemi test dalı

`npm run prepare:ios` yerel oyunu ve pinlenmiş Google Mobile Ads 13.11.0/UMP 3.1.0 SPM bağımlılıklarını hazırlar. Xcode’da `Bulusko` şeması, iPhone hedefi. Kimlik `com.mertbekisoglu.bulusko` olarak korunur. Varsayılan Release reklam ve satış kapalıdır. Debug yalnızca Google rewarded test kimliğini kullanır.

`CommerceTests` test hedefi yerel StoreKitTest kataloğuyla doğrulanmış satın alma, yeniden hak okuma/geri yükleme, iade, pending, iptal, ağ/imza hatası ve kapalı mağaza senaryolarını test eder. Reklam SDK başlangıcı gerçek native çağrılarla test edilir. Gerçek para harcanmaz. Bu testler App Store sandbox/gerçek ürün onayı değildir.

Sonuç: [STATUS.json](../publication/monetization/STATUS.json). Hesap adımları: [OWNER-STEPS-TR.md](../publication/monetization/OWNER-STEPS-TR.md). Bu dal fiziksel iPhone’a kurulmadı; mevcut 0.9.17 korunur.
