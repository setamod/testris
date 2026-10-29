# Popzuno — yayın hazırlığı görev sırası

Başlangıç: 27 Ekim 2026. Kapsam: mevcut Popzuno; eski Familytris ayrı kalır.

Bu dosya tamamlanan işleri kanıtlarıyla, dış hesap/insan kararı gerektiren işleri ise açık durumlarıyla izler. Bir taslak, test edilmemiş paket veya ön araştırma tamamlanmış yayın/onay olarak gösterilmez.

| Sıra | Görev | Durum | Çıktı / tamamlanma ölçütü |
|---|---|---|---|
| 1 | Mevcut sürümü yedekle, kapsamı sabitle | Tamamlandı | `backups/Popzuno-0.9-before-store-readiness.zip`; eski Familytris için 84 dosyanın hash kontrolü |
| 2 | Kod, model, font ve ses hak envanterini tamamla | Tamamlandı | `vendor/ASSET-INVENTORY.json`, kaynaklar ve altı lisans/bildirim dosyası; pico modelinin resmî MIT dağıtımı doğrulandı |
| 3 | Popzuno isim/marka ön araştırması | Ön araştırma tamamlandı | `publication/legal/TRADEMARK-SEARCH.md`; WIPO/TÜRKPATENT sorguları ve kapsam sınırları. Benzerlik incelemesi/tescil değildir |
| 4 | Ticari fikrî hak incelemesi için dosya hazırla | Dosya tamamlandı | `publication/legal/IP-REVIEW-TR.md`; profesyonel görüş alınmadı |
| 5 | Veri akışını denetle; gizlilik ve destek metinlerini hazırla | Tamamlandı | Altı dilde gerçek yerel saklama/silme davranışı ve iOS yedekleme açıklaması; `publication/legal/PRIVACY-TR.md` |
| 6 | Uygulama içi gizlilik/lisans erişimini ve tam veri silmeyi tamamla | Tamamlandı | Altı dil; web/native kayıt silme ve iptal testleri geçti; eski kayıt anahtarları da temizleniyor |
| 7 | iOS mağaza adayını hazırla ve doğrula | Teknik aday tamamlandı | 0.9.8 (17) Release arşivi, altı dilde izinler ve simülatör kontrolü. Dağıtım imzası, TestFlight ve son gerçek cihaz testi bekliyor |
| 8 | Android uygulamasını hazırla ve doğrula | Teknik aday tamamlandı | API 26–36 çevrimdışı native kabuk; debug APK ve imzasız AAB; emülatörde 43 kontrol. Sahip imzası ve gerçek cihaz testi bekliyor |
| 9 | Mağaza metinleri ve görsellerini hazırla | Hazırlık tamamlandı | `publication/store/`: altı dilde metin, gerçek TR iOS/TR–EN Android ekranları, ikonlar, Google görseli; konsol formları henüz gönderilmedi |
| 10 | Yayın öncesi otomatik ve elle kontroller | Yerel kapsam tamamlandı | `publication/VALIDATION.json`, `publication/PACKAGE-CHECKS.json`; gerçek cihaz/mağaza testleri 14. adımda |
| 11 | Gizlilik/destek sayfalarını yayımla | Tamamlandı | [Gizlilik](https://popzuno.frostytang32768.chatgpt.site/privacy/tr.html), [destek](https://popzuno.frostytang32768.chatgpt.site/support/tr.html); halka açık erişim doğrulandı |
| 12 | Apple/Google hesap, vergi/banka ve sözleşme işlemleri | Apple aktif; Google kullanıcı isteğiyle bekletiliyor | Google kayıt bilgileri ve iletişim telefonu tamamlandı; son sözleşme/25 USD kayıt ücreti aşamasında kullanıcı ek ödeme yapmamayı ve oyunu önce olgunlaştırmayı istedi. Kayıt sekmesi açık tutuluyor. Kimlik/cihaz doğrulamaları ve mağaza satıcı banka/vergi adımları bekliyor. `publication/ACCOUNT-STATUS.json` |
| 13 | Fiyat, ülkeler, yaş/hedef kitle ve hukuki son kontrol | Karar / dış inceleme bekliyor | Tek seferlik ücretli model onaylı; tutar, ülkeler ve formların nihai yanıtları seçilmedi; ticari hak görüşü alınmadı. Google Play'de seçilen profildeki tam yasal adresin ücretli satışta kamuya açılması kullanıcı tarafından açıkça onaylandı; özel adres kaynak dosyalara kopyalanmadı |
| 14 | TestFlight / Google Play test kanalı | Hesap ve imzaya bağlı | Plan ve boş testçi şablonu hazır; henüz yükleme/davet yok. Yeni bireysel Play hesabında 12 kişi/14 gün kapalı test, sonra üretim erişimi başvurusu |
| 15 | Son kontrol ve mağaza incelemesine gönderim | 12–14. adımlara bağlı | Henüz mağazaya gönderilmedi veya satışa açılmadı; hesap, imza, test ve ticari seçimler tamamlanınca yapılır |

## Çalışma varsayımları

- Geliştirici/iletişim: Mert Bekisoglu / mertbek@gmail.com. Kullanıcı kamuya açılmasını açıkça onayladı; sayfalar yayımlandı.
- Onaylanan model: tek seferlik ücretli, reklam/analitik/IAP yok. Henüz fiyat veya satış ülkesi seçilmedi.
- Popzuno çalışma adıdır; veri tabanı sorgusu tescil veya hukuki uygunluk garantisi değildir.
- Ücretli üyelik, ödeme, banka/vergi kimliği, bağlayıcı sözleşme ve mağazaya nihai gönderim otomatik tamamlanmış sayılmaz.
- 0.9.8 (17) telefon güncellemesinin son doğrulaması ios/BUILD_STATUS.json dosyasında tutulur; uzun oturum, gerçek ses/titreşim ve oyun dengesi için oyuncu geri bildirimi sürüyor.
- Harcama kararı: Kullanıcı oyun tamamen hazır olmadan ek ödeme istemiyor. Google kayıt ücreti ve diğer ücretli hizmetler bekletiliyor; açık sekmede işlem yapılmayacak. Mevcut Apple üyeliğiyle ücretsiz geliştirme/test ve oyun iyileştirme çalışmaları sürdürülebilir.
