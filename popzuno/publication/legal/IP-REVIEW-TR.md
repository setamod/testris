# Popzuno — ticari hak incelemesi dosyası

Tarih: 29 Ekim 2026. Durum: teknik kaynak incelemesi; profesyonel hukuki görüş henüz alınmadı.

## Ürün

8×11 alanda komşu yüzleri dört yönde değiştirerek üçlü çizgi veya 2×2 kare oluşturulan çevrimdışı bir oyun. Kare Bomb, yatay dört Rocket, dikey dört Shuffle, L/T Cross ve düz beşli Nova kazandırır. Rush, Blitz 60, Time Rush, Ascend ve Daily 90 modları; yerel kişiselleştirilmiş yüzler; uyarlanan özgün programlanmış müzik vardır.

Eski Familytris, tetrominolar ve eski müzik paketi bu üründe bulunmaz. Yaygın eşleştirme kuralları ve güç fikirleri özgün icat olarak sunulmaz. Kodun bağımsız yazılması, tüm marka/patent/görsel benzerlik risklerini tek başına ortadan kaldırmaz.

## Kanıtlar

- `../../vendor/SOURCES.md`, `../../vendor/ASSET-INVENTORY.json`: bileşen kaynakları, lisanslar ve özetler.
- `../../dist/arcade-engine.mjs`, `../../README.md`: son kurallar ve sınırlar.
- `../../dist/sound.mjs`, `../../dist/impact.mjs`: beste ve ses üretimi.
- `../store/`: mağaza metni taslakları ve kişisel fotoğrafsız ekranlar.
- `TRADEMARK-SEARCH.md`: yapılan ad aramaları; tamamlanmayan alanlar açıkça belirtilir.

## Fikrî haklar uzmanından istenecek kapsam

1. Popzuno ve sesçe/yazılışça benzer adlar: Türkiye ve seçilecek diğer satış ülkelerindeki kayıtlar, bekleyen başvurular ve ilgili mal/hizmet kapsamı.
2. İkon, karakterler, renk düzeni, bonus simgeleri ve mağaza görsellerinin somut ticari oyun tasarımlarıyla karıştırılma/kopyalama riski.
3. Mevcut oyun mekaniklerinin ilgili pazarlardaki patent ve diğer haklarla ilişkisi; Tetris lisansına bağlı eski projeden ayrım.
4. pico.js, aynı facefinder modelinin güncel MIT dağıtımı ve fontların lisans bildirimlerinin yeterliliği.
5. Yapay zekâ yardımıyla oluşturulmuş kod/müzik/görsellerin hak sahipliği, korunabilirliği ve gerekli sözleşme kayıtları.
6. Kullanıcı fotoğrafları, çocuk fotoğrafları, mağaza tanıtımları ve gizlilik metninin hedef ülkelerdeki gereklilikleri.
7. Ücretli dijital ürün satışı için geliştirici/satıcı bilgileri, uygulanacak mağaza koşulları ve tüketici bilgilendirmesi.

Uzman seçilmedi, ücretli hizmet satın alınmadı, hiçbir kişiye otomatik e-posta gönderilmedi. Bu dosya bir uzmana iletilmeye hazır kapsamdır; uzman onayı yerine geçmez.

## Temel başvuru kaynakları

- Oyun fikri/oynama yöntemi ile somut anlatım ayrımı (ABD): https://www.copyright.gov/register/tx-games.html
- Apple kopya uygulama kuralları: https://developer.apple.com/help/app-review/guideline-reference/4-1-prevent-copycat-rejection
- Google fikrî haklar politikası: https://support.google.com/googleplay/android-developer/answer/9888072
- WIPO marka araştırması ve kapsam sınırlaması: https://www.wipo.int/en/web/global-brand-database

Bu kaynaklar tüm ülkelerde tek bir hukuki sonuç veya mağaza kabulü garantisi vermez.

## 0.9.4 ses varlığı eklemesi

Sekiz sabit yapay spiker klibi, Kokoro-82M v1.0 ağırlıkları ve kokoro-onnx 0.6.1 aracıyla yerel üretildi. Kaynak/model hash’leri, ses stili karışımı ve çıktı hash’leri `../../vendor/ANNOUNCER-ASSETS.json`; model Apache-2.0 ve araç MIT metinleri `../../vendor/music-NOTICE.txt` içindedir. Model ve araçlar uygulamada dağıtılmaz; belirli bir insan spikere ait referans kayıt kullanılmadı. Bu teknik kayıt, çıktıların tüm ülkelerde ticari hak incelemesi yerine geçmez; mevcut profesyonel inceleme görevinin kapsamına dahildir.

## 29 Ekim ad ve logo güncellemesi

Popzuno adı seçildi; eski Kynburst adıyla yapılan sicil araştırmaları bu yeni adın uygunluk araştırması sayılmaz. Popzuno için mevcut çalışma yalnızca hızlı mağaza/açık web taramasıdır (`../evidence/name-review-2026-10-29/popzuno-quick-store-scan.json`). Yeni ikon OpenAI image generation ile dış görsel referans olmadan üretildi; kaynak ve özetler `../../branding/` ile `../../vendor/ASSET-INVENTORY.json` içindedir. Yeni ad ve görsel ayrıca hedef pazarlarda incelenmelidir.
