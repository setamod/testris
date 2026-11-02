# Popzuno gelir sistemi — çalışma planı

Başlangıç: 2 Kasım 2026. Güvenli taban: `popzuno` / `b21be94` / 0.9.17 (26).
Çalışma dalı: `codex/popzuno-rewarded-premium`. Kaynak: bu bağımsız Git çalışma klasörü.
`aile-akisi`, orijinal Familytris ve telefondaki uygulama değiştirilmez.

## A — Gerçek mimari ve başlangıç doğrulaması

8×11 JavaScript motoru, önbellekli Canvas portreleri, Web Audio; iOS SwiftUI/WKWebView,
Android Java/WebView. Sunucu, kullanıcı hesabı veya online skor otoritesi yok.
Beş menü modu: Ascend, Rush (`survival`), Time Rush, Daily 90, Relax.
Blitz 60 yalnızca eski motor/kayıt uyumluluğu için duruyor.
Rush/Ascend: üst satır doluyken bir sonraki yükselişte taşma. Time Rush: 30 sn'den başlayan,
eşleşmelerle uzayan saat; 60 sn tavan ve artan zaman tüketimi. Daily/Blitz sabit süreli.
Bomb=2×2; Rocket=yatay 4; Shuffle=dikey 4; Cross=L/T; Nova=5+.
Fotoğraflar 256px JPEG'e yerel hazırlanır, isim/kadraj yerelde saklanır; native bridge
zaten yalnızca paketlenmiş ana çerçeveyi kabul eder. Reklam sağlayıcısına fotoğraf gönderilmez.
Mevcut normal rekorlar oyun/pause/etap/bitişte saklanır: kurtarılmış oyunlar bu kayıtlara yazılmayacak.

## B–C — İsteğe bağlı rewarded ve kurtarma

Resmi SDK'lar: iOS Google Mobile Ads+UMP (SPM); Android Google Mobile Ads 25.5.0+UMP (Gradle).
Yalnızca Settings'teki kullanıcı isteğinden sonra gizlilik akışı ve reklam yükleme.
Oyun sonu teklifi yalnızca yüklenmiş, süresi geçmemiş reklam ve kullanılabilir native kota varken.
Ödül sadece SDK earned callback'i + kapanıştan sonra, tek nonce ve tek oturuma uygulanır.
Rush: puan/bonus vermeden alt 3 satır temizlenir, kalanlar aşağı kayar.
Time Rush: 15 saniye; yarım kalan faz korunur. Ascend: aynı etabın başlangıç kontrol noktası;
etap içindeki başarısız denemenin puan/bonusları geri alınır. Sonraki etap açılmaz.
Oturum başına 1; cihazdaki native monoton saate dayalı kayan 24 saatte 3 başarı.
Saat değiştirmek kota açmaz. Yeniden kurulum/root/çoklu cihaz ve kesin oyuncu limiti için
sunucu/hesap gerekir; bu sürüm böyle bir kesinlik iddia etmez. Reklamlı skorlar ayrı etiketlenir.

## D — Tek seferlik kozmetik Premium

StoreKit 2 non-consumable; Play Billing INAPP ve consume edilmeyen ürün.
Ürün: `com.mertbekisoglu.bulusko.premium`; hedef ABD fiyatı 2,99 USD; UI yalnızca mağaza fiyatını gösterir.
Özel çerçeve temaları, alternatif kontrollü efekt/animasyon ve ses rengi seçenekleri.
Hiçbir mod, standart fotoğraf, ücretsiz bonus veya kurtarma Premium'a bağlanmaz.
StoreKit verified/currentEntitlements/updates/sync; Android imzalı işlem doğrulaması,
PURCHASED kontrolü, acknowledge, queryPurchases ve offline doğrulanmış hak.
İade son güncel mağaza sorgusunda düşer; anlık çevrimdışı iade bilgisi için sunucu gerekir.

## E — Gizlilik ve canlı kapıları

Canlı reklam kimliği/UMP mesajları, hedef yaş seçimi, iki mağazada ürün ve sözleşmeler,
Android doğrulama anahtarı, fiyat/beyan/gerçek sandbox testleri hesap sahibi tarafından tamamlanmalı.
Varsayılan Release reklamları ve satın alma satışını kapalı tutar. Test kimlikleri Release'e gömülmez.
Eski "reklamsız/IAP yok" mağaza metinleri bu dal için düzeltilir; canlı destek sitesi yayımlanmaz.
ATT/IDFA takibi istenmez; reklam SDK veri beyanı yine yapılmalıdır.

## F — Doğrulama

Başlangıç JS 98 test, iOS ve Android build/lint. Başlangıç native smoke.
Deterministik earned/close/load-error/disconnect/background/duplicate/daily/session/clock/restart testleri.
Motor puan/etap/özel güç/fotoğraf testleri ve küçük ekran 6 dil kontrolleri.
Yeni native SDK'larla iOS/Android build ve gerçek test-reklam denemesi.
Gerçek mağaza/sandbox, UMP ve cihaz dinleme testleri ayrı kaydedilir; simülasyon gerçek satın alma sayılmaz.
Her aşamanın sonucu STATUS.json'da kanıtıyla kaydedilecek.

Karma çocuk kitlesi sahibi tarafından doğrulandı. Google Families listesi nedeniyle Android'de
Next-Gen yerine listelenmiş `play-services-ads` 25.5.0 seçildi. Nötr yaş aralığı ekranında
çocuk/genç/belirsiz yaş için reklam başlatılmaz, yeni satın alma istenmez; her ücretsiz özellik açıktır.
Tam doğum tarihi toplanmaz. Ebeveyn onayı/mağaza Kids kategorisi incelemesi canlı kapısıdır.
