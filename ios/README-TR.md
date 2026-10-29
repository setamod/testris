# Popzuno 0.9 — Time Rush, Shuffle ve Nova birikimi

İmzalı **0.9.0 (9)** sürümü 27 Ekim 2026’da iPhone Air’e güncelleme olarak yüklendi ve açıldı. Uygulama kimliği `com.mertbekisoglu.bulusko`, dahili `Bulusko` projesi, fotoğraflar, dil tercihleri ve mevcut rekorlar korunur.

## Nova ve Shuffle

Nova artık her modda bir tur içinde 99 adede kadar birikir. Her kullanım yalnızca bir adet harcar. Ascend etapları arasında stok korunur. Bomb/Rocket/Cross/Shuffle ikişer adettir.

Yatay dörtlü Rocket, dikey dörtlü Shuffle verir. Diğer desenler aynı: 2×2 Bomb, L/T Cross, düz beşli ve üstü Nova. Tek hamlede en güçlü ödül verilir: Nova > Cross > Rocket > Shuffle > Bomb. Shuffle doğrudan çalışır; dolu konumları ve her yüzün sayısını korur. 32 denemeyle sınırlı üretim, kendiliğinden eşleşme yapmayan ve geçerli hamle içeren farklı bir düzen bulur. Bulamazsa stok harcanmaz. Puan/süre kazandırmaz. Satır ve dolum RNG’si etkilenmez. 88 kalıcı hücre yeniden kurulmaz; hareket 280 ms sürer.

## Time Rush

- 30 saniye ve bir Shuffle ile başlar. Satır yükselmez; Blitz gibi dolum vardır.
- Üçlü +2 sn, daha büyük eşleşmeler daha fazla (en çok +7 sn) verir. Düşüş zincirleri yarım süre; tek hamlenin toplam kredisi en çok +8 sn.
- Rezerv en çok 60 sn. Bonuslarla patlatma ve Shuffle süre vermez.
- Her 30 aktif saniyede tüketim +0,1× artar; en çok 1,8×. Her 60 saniyede yeni yüz eklenir; en çok 7 yüz.
- Saat sıfıra inerse tur biter; bekleyen bir patlama sonradan diriltemez. Mola/arka plan saati ve animasyonları dondurur.
- Ayrı rekor: `best-shapes1-timeRush`. Altı dilde arayüz ve yardım güncellendi. Klavye: 1 Bomb, 2 Rocket, 3 Cross, 4 Nova, 5 Shuffle.

## Doğrulama

46 JavaScript testi ve Foundation Swift kayıt testleri geçti. Nova’nın beş modda birikimi, tek kullanım, 100 karıştırmada yüz/hücre sayılarının korunması, başarısız karıştırmada stok, zaman ödülleri, kademeli tüketim, saniye sınırları, kare sürelerinden bağımsızlık ve sıfırda bitiş doğrulandı.

Tarayıcıda Time Rush’ta gerçek dokunuşla Shuffle kullanıldı: önce/sonra 48 yüz ve aynı dağılım korundu. Sonraki 2×2 eşleşme +160 puan ve +3 sn verdi, sayaç 0:32 oldu. Rush/Time Rush/Ascend 319×584, 390×844, 1280×720’de taşmadan açıldı; en dar bonus düğmesi 44 pikselin üstünde kaldı. Almanca ve Rusça Time Rush düzenleri küçük/masaüstü ekranda doğrulandı; hata günlüğü boştu. Nova birikimi motor testleriyle doğrulandı. Gerçek kişisel fotoğraflar okunmadı.

`node scripts/prepare-ios.mjs` gömülü oyunu ve mevcut projeyi yeniler. `Bulusko` şemasıyla kendi Team’in kullanılarak derlenir. İmzalı arm64 cihaz derlemesi başarılı; simülatör bu tur yeniden derlenmedi. Raporlar: `BUILD_STATUS.json`, `../VALIDATION.json`, önceki sürüm `BUILD_STATUS-0.8.json`.

Yedekler `../backups/Popzuno-0.8-before-time-shuffle.zip` ve `../backups/Popzuno-Prototip-0.8.zip`. Melodi korundu; sadece Shuffle ses efekti eklendi. Orijinal Familytris’in 71 dosyası değişmedi. App Store gönderimi yapılmadı. Gerçek telefondaki denge ve akıcılık hissi oyuncu denemesine açıktır.
