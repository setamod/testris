# Popzuno — kaynak ve üretim kaydı

Gözden geçirme: 2026-10-29. Bu kayıt mevcut 8×11 eşleştirme oyununu kapsar; eski Familytris ve kaldırılan altıgen prototip bu ürüne dahil değildir. Hukuki uygunluk veya marka tescili belgesi değildir.

## Bu proje için oluşturulan içerik

- `dist/arcade-engine.mjs`, `arcade.mjs`, `board.mjs`: dört yönlü komşu değişimi, çizgi/kare eşleştirme, şekle göre güçler ve beş oyun modu. Yaygın oyun fikirleri üzerinde bağımsız uygulama; tüm mekaniklerin ilk kez icat edildiği iddia edilmez.
- iOS Swift ve Android Java kabukları ile Android uyarlanabilir/tek renk ikon çizimleri bu proje için oluşturuldu; işletim sistemi API’leri kullanılır, uygulamaya üçüncü taraf native SDK paketlenmez. Derleme araçları oyun içine dahil edilmez.
- `dist/avatars.mjs`, `style.css`: kodla çizilmiş karakterler ve arayüz. Başka bir ticari oyunun parça seti, karakterleri veya arayüz varlıkları taşınmadı.
- `dist/sound.mjs`, `impact.mjs`: Circuit Bloom ve Quiet Orbit besteleri ile prosedürel efektler bu proje için programlandı. Ticari kayıt, örnek ses paketi, film/oyun repliği, Korobeiniki melodisi veya uzaktan ses servisi kullanılmaz. Arcade tempo 118–178 BPM; yalnızca Relax’ta sakin Quiet Orbit 72 BPM.
- Kullanıcı fotoğrafları ve isimleri isteğe bağlı yerel içeriktir; paketleme bunları okumaz veya dağıtmaz. Mağaza görsellerinde yalnızca varsayılan çizimler veya ayrıca kullanım izni bulunan görseller kullanılmalıdır.

- Popzuno logosu ve uygulama ikonu: 29 Ekim 2026 tarihinde OpenAI image generation aracıyla bu proje için, referans görsel olmadan üretildi. Ana dosya `branding/popzuno-master.png`; platform boyutları `scripts/prepare-brand.swift` ile türetilir. Gerçek kişi, üçüncü taraf karakter veya kullanıcı fotoğrafı içermez. Üretim, marka tescili veya münhasırlık garantisi değildir. Önceki Kynburst adı yalnızca geçmiş kayıtlarda ve veri uyumluluğu için iç kimliklerde korunur.

## Üçüncü taraf bileşenler

| Bileşen | Kaynak | Lisans / kullanım |
|---|---|---|
| pico.js işleme kodu | https://github.com/nenadmarkus/picojs | Upstream MIT beyanı; uygulamaya uyarlanmış kod. Kaynak ve bildirim `dist/face.mjs` içinde korunur. |
| facefinder eğitilmiş modeli | https://github.com/nenadmarkus/pico/tree/7d550c78b2c31a4e1dfc5bcdfe9da013297b5cc8/rnt/cascades | Bu revizyondaki depo MIT lisanslıdır. Gömülü model, resmî güncel modelle bayt düzeyinde aynıdır: 239632 bayt; SHA-256 `d8014993e7298c7b1865d1f8b855d6dbf4ec5c808bf879e2091ab6837abf90cd`. |
| Chakra Petch SemiBold | https://github.com/google/fonts/tree/main/ofl/chakrapetch | SIL OFL 1.1. Font ve telif/lisans bildirimi birlikte paketlenir. |
| IBM Plex Mono Regular | https://github.com/google/fonts/tree/main/ofl/ibmplexmono | SIL OFL 1.1. Font ve telif/lisans bildirimi birlikte paketlenir. |

Önemli sürüm ayrımı: pico'nun eski `c2e81f9d...` revizyonundaki LICENSE ticari kullanımı izne bağlar. Bu nedenle yalnızca eski demo bağlantısına dayanılmaz; aynı modelin yukarıda sabitlenen MIT lisanslı dağıtımı esas alınır. Güncel kaynak lisansı: https://github.com/nenadmarkus/pico/blob/7d550c78b2c31a4e1dfc5bcdfe9da013297b5cc8/LICENSE . Model eşleşmesi ve yerel dosya özetleri `ASSET-INVENTORY.json` içinde kayıtlıdır. Kendi bildirimimizi MIT olarak yazmak tek başına bir bileşeni yeniden lisanslamaz.

MIT ve OFL bildirimleri oyunun taşınabilir paketinde, iOS kaynaklarında ve Android varlıklarında korunmalıdır. OFL fontlarının lisansı oyunun tamamını açık kaynak yapmayı gerektirmez. Fontlar tek başına satılmaz; değiştirilmiş fontlarda ayrılmış ad kuralları ayrıca geçerlidir.

## Ticari yayın sınırları

- Popzuno adı ve ikonunun hedef pazarlardaki aynı/benzer marka ve tasarımlarla karşılaştırılması gerekir. Ön araştırma tescil veya kesin hak uygunluğu anlamına gelmez.
- Üçüncü taraf kodlarının ticari kullanıma izin vermesi; patent, marka, kişilik hakları veya tüm görsel/işitsel benzerliklerin araştırıldığı anlamına gelmez.
- Kaynaklarda gerçek kişilerin fotoğrafları bulunmaz; fotoğraf kullanıcının seçimiyle cihazda işlenir. İşletim sistemi yedekleri ve kullanıcının başlattığı destek/paylaşım işlemleri gizlilik metninde ayrı açıklanır.
