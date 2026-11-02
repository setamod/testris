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

1. [Apple Developer Account](https://developer.apple.com/account) güncellenen Apple Developer Program
   License Agreement için kabul istiyor. Sözleşme inceleme ekranı açıldı; agent kabul etmedi.
2. App Store Connect → Business, Paid Apps Agreement öncesinde Legal Entity güncellemesi istiyor.
   Edit Legal Entity formu açıldı, alanlar değiştirilmedi. Hesap sahibi yasal adresini doğrulamalı ve
   boş State or Province alanını gerçek bilgisiyle doldurup kendisi kaydetmelidir.
3. Sonrasında görünen gerçek Paid Apps Agreement, vergi ve banka adımları hesap sahibi tarafından
   incelenip tamamlanmalıdır. Bu aşamada Paid Apps Agreement etkin değildi; kabul edilmiş sayılmaz.
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
[ürün alanları ve inceleme görseli](https://developer.apple.com/help/app-store-connect/reference/in-app-purchases-and-subscriptions/in-app-purchase-information).
