# Değişiklik notları

## 0.9.17 (26) — 31 Ekim 2026

- Klasik karakter görünümü korunarak fotoğraflı yüz alanı genişletildi. Yatay genişlik ilk görünüme göre %13, 0.9.16 sürümüne göre yaklaşık %6 arttı.
- iPhone’da, tek ve net bir yüz algılandığında göz hizasına göre en fazla 8° otomatik açı düzeltmesi eklendi. Belirsiz ölçümlerde fotoğrafın açısı korunur.
- Sevdiklerim ekranına ±12° elle yüz açısı ayarı eklendi. iOS’ta “Otomatik hizala”, Android ve tarayıcıda “Açıyı sıfırla” kullanılabilir.
- Açı tercihi saklanır; fotoğrafın aslı ve önceki yakınlaştırma/kadraj ayarları korunur. Portreler önbellekte tutulur; hizalama oyun döngüsünde çalışmaz.
- Yeni kontrollerin metinleri desteklenen altı dile eklendi.

Doğrulama: 98 JavaScript testi, 187 Android kontrolü, 90 oyun ve 18 ana menü yerleşimi, 231 paket kontrolü geçti. Native Vision düzeltmesinin yönü macOS üzerinde bilinen ±8° eğimli, kamu malı test fotoğrafıyla doğrulandı. Test fotoğrafları uygulama paketlerinde bulunmaz. iOS Debug/Release ve Android paketleri derlendi; 0.9.17 (26) iPhone’a kuruldu.
