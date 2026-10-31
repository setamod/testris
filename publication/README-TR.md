# Popzuno 0.9.17 (26) — Yüz alanı ve hizalama

Klasik görünüm korunur. Fotoğraflı yüz alanı önceki sürümden yaklaşık %6 daha geniştir (temel görünüme göre %13). iPhone’da yüzün göz hizası cihaz içinde ölçülür; güvenilir tek yüz bulunduğunda en çok 8 derece düzeltme uygulanır. Belirsiz ölçümde açı aynı kalır. Sevdiklerim ekranında elle ±12 derece ayar vardır. iOS’ta Otomatik hizala, Android/tarayıcıda Açıyı sıfırla kullanılabilir. Fotoğrafın aslı ve önceki kadraj bilgileri değişmez.

98 JavaScript testi, 187 Android kontrolü, 90 oyun ve 18 ana menü yerleşimi, 231 paket kontrolü geçti. Native Vision’ın yönü yalnızca kamu malı NASA test fotoğrafı ile macOS üzerinde doğrulandı; test fotoğrafları uygulama paketlerine girmez. Yeni sürüm iPhone’a kuruldu; telefon kilitli olduğu için açılışı kullanıcı yapmalı. GitHub/TestFlight gönderimi yapılmadı. Aşağıdaki sürüm notları tarihseldir.

---

# Popzuno 0.9.16 (25) — Eski stilde hafif yüz genişlemesi

Klasik görünüm korunur. Yalnızca fotoğraf kullanılan kafa ve yüz alanı yatayda %7 genişletildi; yüksekliği, renkli gövde, çerçeve, palet ve varsayılan çizim yüzleri aynı. Mevcut fotoğraf kadrajı yeni alana oturur; asıl fotoğraf ve zoom/konum alanları değişmez. Otomatik döndürme eklenmedi. İşlem portre oluşturulurken bir kez yapılıp önbellekte tutulur.

90 JavaScript testi, 184 Android kontrolü, 90 oyun yerleşimi, 18 ana menü yerleşimi ve 231 paket kontrolü geçti. Yeni yüz kenarında fotoğrafın doğal rengi, aşağıda aynı renkli gövde ve kaynak fotoğrafın korunması piksel testinde doğrulandı. 0.9.16 iPhone’a yüklenip açıldı. GitHub veya TestFlight’a gönderilmedi. Alttaki notlar tarihseldir.

---

# Popzuno 0.9.15 (24) — Eski karakterli görünüme dönüş

Kullanıcının tercihiyle 0.9.13 ve 0.9.14 fotoğraf denemeleri geri alındı. 0.9.12’nin karakter gövdesi, yüz yerleşimi, çerçeveleri, renkli alt bandı, menü önizlemeleri ve kontrolleri geri geldi. 11 çalışma dosyası yedekle birebir aynı; avatars.mjs içindeki tek fark fotoğrafı çizerken yüksek kaliteli yeniden örnekleme. Fotoğraflar, kadraj alanları ve rekorlar değiştirilmedi.

90 JavaScript testi, 183 Android kontrolü, 90 oyun yerleşimi, 18 ana menü yerleşimi ve 231 paket kontrolü geçti. Fotoğrafın doğal renklerle eski kafa alanında kaldığı ve renkli gövdenin göründüğü piksel testinde doğrulandı. 0.9.15 iPhone'a yüklenip açıldı. Yeni sürüm GitHub/TestFlight'a gönderilmedi. Aşağıdaki notlar tarihseldir; 0.9.13 ve 0.9.14 görünüm denemeleri artık kullanılmıyor.

---

# Popzuno 0.9.14 (23) — Yüz odağı ve renk geçişli çerçeve

Mevcut yüz kadrajı otomatik yakınlaştırılır; yaklaşık %14,5 hafif yatay genişletmeyle kareye oturur. Asıl fotoğraf ve kadraj alanları değiştirilmez. Dış çerçeve 5 px (küçük telefonlarda 4 px), iç kenar aile renginin açık tonuna yumuşakça karışır. Yüzün merkezi doğal renkli kalır. Geçiş portre oluşturulurken bir kez hazırlanıp önbellekte tutulur.

92 JavaScript testi, 184 Android kontrolü, 90 oyun yerleşimi, 18 ana menü yerleşimi ve 231 paket kontrolü geçti. Piksel testinde farklı arka planların kenarda aynı aile tonuna yaklaştığı ve merkez renklerinin korunduğu doğrulandı. 0.9.14 iPhone'a yüklenip açıldı. Yeni sürüm GitHub'a veya TestFlight'a gönderilmedi; son dış beta bilgisi TESTFLIGHT-STATUS.json içindedir. Aşağıdaki sürüm notları tarihseldir.

---

# Popzuno 0.9.13 (22) — Kare portreler

Fotoğraf blok içinde kare alanı doğal renkleriyle doldurur. Renkli çerçeve 4 px, küçük telefonlarda 3,5 px; köşe numarası korunur. Alt şerit boşluğu kaldırıldı; fotoğraf önizlemesi de kare ve aile renginde çerçeveli. Mevcut fotoğraf verileri ve zoom/kadraj ayarları değişmez. Oyun döngüsüne görüntü işleme eklenmedi.

90 JavaScript testi, 183 Android kontrolü, 90 oyun yerleşimi ve 18 ana menü yerleşimi geçti. Gerçek fotoğraf ekleme akışı sentetik görselle denendi; kare köşelerdeki renkler piksel olarak doğrulandı, zoomun kaynak fotoğrafı değiştirmediği kontrol edildi. 231 paket kontrolü geçti. iPhone’a 0.9.13 yerinde yüklenip açıldı; görsel kullanıcı değerlendirmesi bekleniyor. Yeni sürüm TestFlight’a yüklenmedi; son gönderilen yapı 0.9.12 (21), ayrıntılar TESTFLIGHT-STATUS.json içinde. Alttaki sürüm notları tarihseldir.

---

# Popzuno — Güncel beta: 0.9.12 (21)

Ana menü sadeleştirildi: Oyna → beş moddan birini seç → başla. Sevdiklerim kartı yerel fotoğraf stüdyosunu açar. Kontrol, Bonuslar ve Modlar açıklamaları Nasıl oynanır altında; gizlilik/lisanslar ve destek Ayarlar altında. Blitz 60 seçimden kaldırıldı, eski kayıtları korunuyor. Rekor notu cihazdaki gerçek kaydı kullanır; online sıralama yok.

Arka plan/arama kesintisinde oyun duraklar; geri dönüp Devam et'e dokununca WebAudio bağlantısı ve iOS ses oturumu yeniden kurulur. Ses tercihleri ve hazır ses tamponları korunur. 90 JavaScript testi, 175 Android kontrolü, 90 oyun yerleşimi + 18 ana menü yerleşimi ve 231 paket kontrolü geçti. iOS simülatöründe gerçek WKWebView ve yerel kesinti bildirimleriyle ses dönüşü doğrulandı. Fiziksel iPhone'a kurulum ve açılış tamamlandı. Hesap sahibi, gerçek iPhone’da Mesajlar’a geçip oyuna dönerek Devam et’e dokunduğunda müzik ve efektlerin geri geldiğini doğruladı. Gerçek operatör araması ayrıca bildirilmedi.

Güncel TestFlight durumu TESTFLIGHT-STATUS.json dosyasında. Apple beta dağıtımı, ticari mağaza yayını anlamına gelmez. Ek ödeme yapılmadı; Google kaydı ve çevrimiçi sıralama ertelendi. Alttaki sürüm notları tarihseldir.

---

# Popzuno 0.9.10 (19) — yayın hazırlık dosyası

28 Ekim 2026. Teknik aday hazır; uygulama mağazalara gönderilmedi veya satışa açılmadı.

## Dosyalar

- `../STORE-READINESS.md`: 15 adımın güncel durumu ve kalan bağımlılıklar.
- `VALIDATION.json` ve `PACKAGE-CHECKS.json`: testler, gerçek paket incelemeleri ve sınırlar.
- `legal/`: altı dilde gizlilik metni, marka ön araştırması ve profesyonel inceleme dosyası. Bunlar hukuki uygunluk görüşü/tescil değildir.
- `store/`: altı dilde mağaza açıklamaları, ikonlar, gerçek simülatör/emülatör ekranları, Google tanıtım görseli, inceleme ve test planı.
- `artifacts/Popzuno-0.9.10-debug.apk`: yalnızca Android denemesi için geliştirme imzalı APK. Mağaza satış paketi değildir.
- `artifacts/Popzuno-0.9.10-UNSIGNED.aab`: imzasız Google Play adayı; sahibin upload anahtarıyla yeniden derlenmesi gerekir.
- `artifacts/Popzuno-0.9.10-unsigned.xcarchive`: imzasız iOS Release arşivi; ücretli Team ile dağıtım için yeniden arşivleme/imzalama gerekir. Doğrudan iPhone'a kurulabilir IPA değildir.
- `artifacts/SHA256SUMS.txt`: Android paketlerinin bütünlük kayıtları.

## Sıradaki adım

Apple bireysel üyeliği hesap sahibi tarafından satın alındı ve sipariş onayı doğrulandı; Developer üyeliği **aktif** olarak doğrulandı. Google iki adımlı doğrulama kontrolü geçti, ödeme profili bağlandı ve kamuya açık e-posta doğrulandı; profil görünürlüğü onayı da kullanıcı tarafından verildi. Google kayıt taslağı geri getirildi; deneyim, hesap geçmişi ve uygulama planı tamamlandı. İletişim telefonu tamamlandı. Son sözleşme/ücret adımında kullanıcı ek harcamayı durdurdu; Google kaydı oyun hazır olana kadar bekletiliyor. Google üyeliği henüz satın alınmadı. `ACCOUNT-STATUS.json` güncel durumu, `OWNER-STEPS-TR.md` devam sırasını içerir. Kimlik, sözleşme, ücret, banka ve vergi bilgileri yalnızca resmî hesap ekranlarında tamamlanır.

Üyelikler hazır olduğunda doğru uygulama kimliği ve imzalarla mağaza kayıtları oluşturulur; fiyat, ülkeler ve yaş/hedef kitle yanıtları kesinleştirilir. Ticari hak incelemesi için dosya hazırdır, profesyonel görüş henüz alınmamıştır. Son sürümde gerçek cihaz testleri, TestFlight ve yeni bireysel Google hesabının 12 kişi/14 gün kapalı testi tamamlanmadan son başvuru yapılmaz.

**0.9.8 (17)** Kaydırmadan ekrana sığan mobil düzeni ve Nova kazanıldığında Nova ready anonsunu içerir. Önceki altı ses kaydı korundu. 90 ekran/mod/dil yerleşim kontrolü ve 136 Android yerel kontrolü geçti. Telefon kurulum sonucu doğrulama raporunda tutulur. Son kayıt `../ios/BUILD_STATUS.json` dosyasındadır. Kişisel fotoğraf, imzalama anahtarı, parola, ücretli hesap veya testçi listesi dağıtım ZIP'ine eklenmez.

## Canlı sayfalar

- [Türkçe gizlilik](https://popzuno.frostytang32768.chatgpt.site/privacy/tr.html)
- [Türkçe destek](https://popzuno.frostytang32768.chatgpt.site/support/tr.html)

Diğer beş dil bu sayfalardaki dil bağlantılarından açılır. Mert Bekisoglu / mertbek@gmail.com iletişimi kullanıcının açık onayıyla yayımlandı.

**0.9.8 (17) görsel kimlik:** Yeni ad Popzuno; üç neşeli bloktan oluşan oyun logosu, iPhone/Android ikonları, altı dilde metinler, güncel mağaza görselleri ve destek/gizlilik sayfaları. 74 JavaScript ve 138 yerel Android kontrolü geçti. iPhone’a aynı uygulamanın üzerine yüklenip açıldığı doğrulandı. Marka ön araştırması tescil/uygunluk görüşü değildir.

## 0.9.9 (18) · 30 Ekim 2026

Okunabilir arcade arayüzü, renkli bonus stokları, sayaçla bir bütün gelen satırlar, Overdrive yardımı, Cross lazer/Nova warp efektleri, tehlikeye göre hızlanıp rahatlayınca yavaşlayan müzik ve büyük anonsların bekleme düzeltmesi. 80 JavaScript, 141 yerel Android kontrolü ve 90 ekran/mod/dil/font ölçümü geçti. iPhone’a aynı uygulamanın üzerine yüklendi ve açıldı. Fotoğraf/kayıt alanı ve yedi onaylı ses kaydı korundu.

## 0.9.10 (19) · Açık oyun alanı

Bildirimler, uyarılar ve anons yazıları 28 px sabit durum satırına taşındı. Puan artışı üstteki puan alanında; bonus hatırlatmaları yalnızca düğme üzerinde. Gerçek bir hata mesajı görünürken bloklarla çakışmadığı ve 90 ekran/mod/dil düzeni doğrulandı. 80 JavaScript ve 144 yerel Android kontrolü geçti. iPhone’a mevcut uygulamanın üzerine yüklendi ve açıldı. Oyun kuralları, sesler ve kayıt sistemi 0.9.9 ile aynı.

## 0.9.11 (20) · Relax ve yakın çevre testi

Mevcut beş mod korunarak Relax eklendi. Süre, yükseliş, hız artışı, süreli zincir ve Overdrive baskısı yok; alan hamlelerden sonra yenilenir. Quiet Orbit 72 BPM sakin müzik, yumuşak efektler ve hafif titreşim yalnızca bu modda; oyun anonsu kapalıdır. Diğer modların ses tercihleri ve önceki fotoğraf/kayıt anahtarları korunur. 84 JavaScript testi, 165 yerel Android kontrolü, 108 ekran/mod/dil düzeni ve 231 yayın paket kontrolü geçti. iPhone sürüm 0.9.11 (20) yerinde yüklenip açıldı. Test rehberi publication/testing içinde. APK ve bilgisayar ZIP hazır; TestFlight’a yükleme yapılmadı, davet oluşturulmadı. Online sıralama ve ek ödemeler ertelendi. Mağaza ekran görüntüleri satış öncesi güncellenecek.
