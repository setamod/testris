# Popzuno 0.9.8 (17) — yayın hazırlık dosyası

28 Ekim 2026. Teknik aday hazır; uygulama mağazalara gönderilmedi veya satışa açılmadı.

## Dosyalar

- `../STORE-READINESS.md`: 15 adımın güncel durumu ve kalan bağımlılıklar.
- `VALIDATION.json` ve `PACKAGE-CHECKS.json`: testler, gerçek paket incelemeleri ve sınırlar.
- `legal/`: altı dilde gizlilik metni, marka ön araştırması ve profesyonel inceleme dosyası. Bunlar hukuki uygunluk görüşü/tescil değildir.
- `store/`: altı dilde mağaza açıklamaları, ikonlar, gerçek simülatör/emülatör ekranları, Google tanıtım görseli, inceleme ve test planı.
- `artifacts/Popzuno-0.9.8-debug.apk`: yalnızca Android denemesi için geliştirme imzalı APK. Mağaza satış paketi değildir.
- `artifacts/Popzuno-0.9.8-UNSIGNED.aab`: imzasız Google Play adayı; sahibin upload anahtarıyla yeniden derlenmesi gerekir.
- `artifacts/Popzuno-0.9.8-unsigned.xcarchive`: imzasız iOS Release arşivi; ücretli Team ile dağıtım için yeniden arşivleme/imzalama gerekir. Doğrudan iPhone'a kurulabilir IPA değildir.
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
