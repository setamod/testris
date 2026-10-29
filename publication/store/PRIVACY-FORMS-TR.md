# Mağaza veri ve içerik beyanları — hazırlanmış çalışma sayfası

Sürüm: Popzuno 0.9.8 (17). Konsollara henüz girilmedi. Aşağıdaki cevaplar mevcut kod/paket davranışından çıkarılmış adaylardır; son imzalı sürüm ve konsoldaki güncel sorularla kontrol edilmelidir.

| Konu | Mevcut uygulama davranışı |
|---|---|
| Hesap oluşturma/giriş | Yok |
| Reklam / analitik / takip SDK'sı | Yok |
| Geliştiriciye gönderilen oyun verisi | Yok |
| Fotoğraf / karakter adı | İsteğe bağlı, yalnızca yerelde işlenir ve saklanır; sunucuya yüklenmez |
| Yüz işlemi | Genel yüz konumu/kırpma; kimlik tanıma veya kişi şablonu yok |
| Rekorlar / etaplar / tercihler | Yerel kayıt; çevrimiçi liderlik tablosu yok |
| Sonuç paylaşımı | Yalnızca kullanıcı başlatır; metin skor/mod/zincir içerir, fotoğraf/isim içermez |
| Destek | Kullanıcı kendi e-posta uygulamasında mesaj başlatır; otomatik log/fotoğraf gönderilmez |
| Mağaza ödemesi | Apple/Google yönetir; uygulama kart/banka verisi almaz |
| iOS izinleri | İsteğe bağlı fotoğraf/kamera; altı dilde kullanım açıklaması |
| Android izinleri | VIBRATE; INTERNET/READ_MEDIA/konum/kamera/mikrofon/reklam kimliği yok; tekil sistem seçicisi |
| Yedek | iOS sistem yedekleri kullanıcı ayarlarına bağlı olabilir; Android yedek/cihaz aktarımı kapalı |
| Silme | Tekil fotoğraf veya uygulama içinden tüm yerel oyun verileri; eski sistem yedekleri ayrıca yönetilir |

## Apple App Privacy

Mevcut cihaz dışına veri aktarmayan oyun için aday: **Data Not Collected**, tracking **No**. Cihazda işlenen fotoğraflar/isimler sunucuya gönderilmediği sürece Apple'ın tanımında toplanan veri değildir. Gönüllü destek e-postaları ve harici hizmetlerin kapsamı, Apple'ın Optional Disclosure koşullarıyla son aşamada kontrol edilir. Yeni SDK, sunucu kaydı, cloud sync veya reklam eklenirse bu aday cevaplar tekrar değerlendirilir.

`PrivacyInfo.xcprivacy`: tracking false, collected-data listesi boş, UserDefaults için CA92.1 gerekçesi. Bu dosya App Store Connect anketinin yerini tutmaz. Uygulamada kendi muaf olmayan kripto uygulaması yok; mevcut şifreleme beyanı buna göre hazırlanmıştır.

Kaynak: https://developer.apple.com/app-store/app-privacy-details/

## Google Data safety

Mevcut uygulama için aday: geliştirici/SDK tarafından cihaz dışına **veri toplanması/paylaşılması yok**. Yalnızca cihazda işleme Google tanımında veri toplama kapsamı dışındadır. Kullanıcının başlattığı dış paylaşım ve destek iş akışı gerçek konsol sorularıyla kontrol edilir. Hesap olmadığı için hesap silme hizmeti yoktur; yerel veri silme uygulama içinde vardır.

Kaynak: https://support.google.com/googleplay/android-developer/answer/10787469

## Yaş ve hedef kitle — henüz seçilmedi

Ürün gerçekleri: soyut blok patlama efektleri, çizilmiş karakterler, kişisel isteğe bağlı fotoğraflar; kan/gore, sohbet, çevrimiçi kullanıcı içeriği, kumar, gerçek para ödülü, reklam veya alışveriş sistemi yok. Yaş puanı mağazaların soru formlarından hesaplanır. “Aile fotoğrafı” özelliği tek başına Kids Category veya çocuk hedef kitle seçimi değildir. Hedef yaşlar/ülkeler hesap sahibiyle belirlenmeden form tamamlanmış sayılmaz.

Gizlilik URL: https://popzuno.frostytang32768.chatgpt.site/privacy.html

Destek URL: https://popzuno.frostytang32768.chatgpt.site/support.html
