# Değişiklik notları

## 0.10.0 (27) — 2 Kasım 2026 — deneysel gelir sistemi dalı

- Ücretsiz beş mod, fotoğraflar ve standart güçlendirmeler korundu.
- Rush/Time Rush/Ascend için isteğe bağlı, tek kullanımlık kurtarma eklendi; kurtarılan skorlar normal rekorlara dahil edilmez.
- Native monoton saat ile cihaz başına kayan 24 saatte üç kurtarma; tekrar ödül ve oyun verisi sıfırlama koruması.
- Google rewarded SDK ve UMP; ilk açılışta reklam yok, hazır olmayan reklam teklifi yok, reklam/satın alma başarısızsa temel oyun açık.
- Çocuklar dahil karma kitle için nötr yaş aralığı; çocuk/genç/belirsiz yaşta yeni ticari işlem/reklam kapalı, kişiselleştirme ve reklam kimliği erişimi kapalı.
- StoreKit 2 ve Play Billing 9.1.0; tek seferlik kozmetik Premium, doğrulama, geri yükleme ve iade/hak yenilemesi. Mağaza ürünleri oluşturulmadan satış açılmaz.
- Altı dilde ayarlar, Premium ve kurtarma metinleri; küçük ekran sonuç kartı düzeni.
- Yerel StoreKitTest kataloğu ve native/JS testleri; SDK test kaynakları Release paketine girmez.
- Güncel durum ve açık mağaza/hesap kapıları: publication/monetization/STATUS.json. Orijinal popzuno dalına merge yapılmadı.

## 0.9.17 (26) — 31 Ekim 2026

- Klasik karakter görünümü korunarak fotoğraflı yüz alanı genişletildi. Yatay genişlik ilk görünüme göre %13, 0.9.16 sürümüne göre yaklaşık %6 arttı.
- iPhone’da, tek ve net bir yüz algılandığında göz hizasına göre en fazla 8° otomatik açı düzeltmesi eklendi. Belirsiz ölçümlerde fotoğrafın açısı korunur.
- Sevdiklerim ekranına ±12° elle yüz açısı ayarı eklendi. iOS’ta “Otomatik hizala”, Android ve tarayıcıda “Açıyı sıfırla” kullanılabilir.
- Açı tercihi saklanır; fotoğrafın aslı ve önceki yakınlaştırma/kadraj ayarları korunur. Portreler önbellekte tutulur; hizalama oyun döngüsünde çalışmaz.
- Yeni kontrollerin metinleri desteklenen altı dile eklendi.

Doğrulama: 98 JavaScript testi, 187 Android kontrolü, 90 oyun ve 18 ana menü yerleşimi, 231 paket kontrolü geçti. Native Vision düzeltmesinin yönü macOS üzerinde bilinen ±8° eğimli, kamu malı test fotoğrafıyla doğrulandı. Test fotoğrafları uygulama paketlerinde bulunmaz. iOS Debug/Release ve Android paketleri derlendi; 0.9.17 (26) iPhone’a kuruldu.
