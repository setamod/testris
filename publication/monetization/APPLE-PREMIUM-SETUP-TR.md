# Apple Premium ürün taslağı — 2 Kasım 2026

App Store Connect'te gerçek ürün kaydı oluşturuldu. Bu işlem ürünün onaylandığı, satın alınabildiği
veya gerçek mağaza testlerinin geçtiği anlamına gelmez. Uygulamanın satış kapısı kapalıdır.

| Alan | Doğrulanan durum |
|---|---|
| Uygulama / bundle | Popzuno / `com.mertbekisoglu.bulusko` |
| Ürün kimliği | `com.mertbekisoglu.bulusko.premium` |
| Apple ürün kaydı | `6829742617` |
| Tür / referans | Non-Consumable / Popzuno Premium Cosmetics |
| Durum | Prepare for Submission; incelemeye gönderilmedi |
| Temel fiyat | ABD, 2,99 USD; kaydedilen Current Price tablosundan doğrulandı |
| Diğer fiyatlar | Apple'ın temel fiyata karşılık gelen bölgesel fiyat çizelgesi kaydedildi; satış ülkeleri seçilmedi |
| Yerelleştirme | İngilizce, Türkçe, İtalyanca, İspanyolca, Almanca, Rusça kaydedildi |
| İnceleme notları | Kozmetik kapsamı, ücretsiz özellikler, restore ve henüz gönderilmemiş yeni build açıkça anlatıldı |
| Availability | Henüz ayarlanmadı |
| Family Sharing | Açılmadı |
| İnceleme ekran görüntüsü | Henüz yüklenmedi; yeni build'in gerçek satın alma ekranı gerekir |

Yeniden aynı ürünü oluşturma. [Mevcut ürün kaydı](https://appstoreconnect.apple.com/apps/6828850537/distribution/iaps/6829742617)
ve Git'teki [altı dilde kısa ürün metni](PREMIUM-STORE-COPY.json) kullanılmalıdır.
Ürün metni hiçbir kurtarma, puan, süre veya güç avantajı vaat etmez; paket abonelik değildir.

## Hesap sahibine bırakılan somut adımlar

1. Hesap sahibi güncellenen Developer License Agreement ve Legal Entity adres doğrulamasını
   tamamladığını bildirdi. Yenilenen Apple ekranında önceki iki uyarı kalktı; Free Apps Agreement Active.
   Özel adres bilgileri kayda alınmadı ve agent tarafından değiştirilmedi.
2. Hesap sahibi Paid Apps Agreement'ı kabul etti. Business ekranında sözleşme artık
   **Pending User Info** durumunda; Active değildir. Kabul uyarısı yerine banka/vergi eksikleri gösteriliyor.
3. **Add New Bank Account** ve **U.S. Tax Questionnaire** ayrı sekmelerde açıldı. Banka ülkesi
   veya vergi mukimliği yanıtı agent tarafından seçilmedi. Hesap sahibi kendi banka kayıtları ve gerçek
   vergi durumuyla formları doldurup son kontrol/gönderimi kendisi tamamlamalıdır.
   Banka kaydı ve vergi formu gönderilmiş veya onaylanmış sayılmaz.
4. AB dağıtımı istenirse DSA trader beyanı ayrıca doğru hukuki duruma göre tamamlanmalıdır.
   Trader/non-trader seçimi yapılmadı.

Adres, banka, vergi veya kimlik bilgileri bu belgeye ya da Git'e alınmadı. Ürün oluşturma/fiyat
kaydı yeni ödeme veya üyelik yenilemesi başlatmadı. Google Play kayıt ücreti ertelenmiş durumdadır.

## Teknik doğrulama için kalanlar

- Gerçek App Store sandbox hesabı ve mağaza ürünüyle satın alma, iptal, pending, tekrar açılış,
  geri yükleme ve iade testleri. Yerel StoreKitTest kataloğundaki sekiz test bunların yerine geçmez.
- Yeni build'den inceleme ekran görüntüsü ve ilk IAP'nin yeni uygulama sürümüyle gönderilmesi.
  Eski yüklenmiş build'ler bu dalın satın alma ekranını içermez.
- Son fiyat/ülke, gizlilik ve hedef kitle beyanları ile gerçek cihaz kontrolleri.
- Son yayın onayı. Availability, Add for Review ve canlı satın alma yapılandırması açılmadı.

Bu konsol/metin güncellemesi native kodu veya ikilileri değiştirmedi; yeniden derleme yapılmadı.
Telefondaki ve orijinal `popzuno` dalındaki çalışan sürüm korunur.

Resmî kaynaklar: [ürün oluşturma](https://developer.apple.com/help/app-store-connect/manage-in-app-purchases/create-consumable-or-non-consumable-in-app-purchases),
[fiyat çizelgesi](https://developer.apple.com/help/app-store-connect/manage-in-app-purchases/set-a-price-for-an-in-app-purchase/),
[ürün alanları ve inceleme görseli](https://developer.apple.com/help/app-store-connect/reference/in-app-purchases-and-subscriptions/in-app-purchase-information),
[banka bilgileri](https://developer.apple.com/help/app-store-connect/manage-banking-information/enter-banking-information/),
[vergi bilgileri](https://developer.apple.com/help/app-store-connect/manage-tax-information/provide-tax-information/).
