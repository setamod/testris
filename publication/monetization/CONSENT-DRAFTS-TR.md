# AdMob rıza taslakları — 2 Kasım 2026

Ödeme profili hesap sahibi tarafından tamamlandı; AdMob panelinde hesap doğrulaması sürüyor.
Uygulama mağaza bağlantıları ayrı inceleme koşuludur. Hesap doğrulanmış veya reklamlar canlı kabul edilmez.
Üretim kimlikleri Git dışında `monetization.local.json` içinde; live/store/audience/privacy kapıları kapalıdır.
Bu adımda uygulama kaynak kodu veya native ikililer değiştirilmedi.

| Taslak | Kapsam | Diller | Gerçek durum |
|---|---|---|---|
| Popzuno EU consent - DRAFT | İki Popzuno platformu; EEA, İngiltere, İsviçre | en, de, it, ru, es, tr | Draft; Publish kapalı |
| Popzuno US privacy - DRAFT | İki platform; desteklenen mevcut/gelecekteki ABD eyaletleri | en-US, es, es-419 | Draft; Publish kapalı |

Avrupa taslağında kabul, seçenekleri yönet ve ilk ekranda reddetme vardır. Reddetme tüm bölgelerde açıktır.
ABD taslağında opt-out açıktır. Oluşturucu burada yalnızca İngilizce ve İspanyolca varyantlarını sundu;
altı dilde ABD SDK ekranı varmış gibi raporlanmaz. Uygulamanın kendi altı dil desteği korunur.
IDFA açıklama mesajı, ATT istemi veya yeni izleme özelliği açılmadı.

## Yayından önce giderilecek koşullar

1. Canlı `https://popzuno.frostytang32768.chatgpt.site/privacy.html` sayfası bu kontrolde hâlâ
   29 Ekim tarihli, reklamsız eski sürümü açıklıyordu. Altı dilde güncel yerel taslaklar hazırdır;
   yayımlanıp doğrulanmadan mesajın gizlilik URL'si tamamlanmış sayılmaz. Eski sayfa taslağa eklenmedi.
2. Reklam sağlayıcıları, amaçlar ve Google'ın varsayılan mesaj metni gerçek SDK davranışıyla eşleştirilmeli.
   Oluşturucu önizlemesi henüz hassas konum/kişiselleştirme ifadeleri gösterebiliyor; bunlar uygulamanın
   hassas konum topladığını göstermez. Kodda konum izni yok ve reklam kişiselleştirmesi kapalıdır.
   Özellikle ABD şablonundaki ilgi alanına dayalı reklam ifadesi yayımdan önce incelenmelidir.
3. Yaş/Families/Kids kapsamı, Google veri beyanları ve Apple App Privacy son kontrolü yapılmalı.
   Çocuk/genç/belirsiz yaşlarda reklam veya yeni satın alma başlatmayan native sınır korunur.
4. Yalnızca bu kontrollerin ardından, ayrı yayın onayıyla mesajlar etkinleştirilmeli; bölge/ret/kabul/
   rıza geri alma akışları gerçek uygulama kimlikleri ve test reklamlarıyla cihazda sınanmalı.
   Mevcut Debug ikililer Google örnek app/ad kimlikleriyle hazırlanmıştı; bu taslakları uçtan uca
   sınamak için kendi app kimliğimizi kullanan güvenli test derlemesi ayrıca gerekir.

Taslakların varlığı hukuki uygunluk, çalışan bölgesel CMP veya tamamlanmış gerçek cihaz testi anlamına gelmez.
Hesap sahibinin adresi, ödeme profili numarası, banka/vergi bilgileri kaynaklara veya Git'e kopyalanmadı.

Resmî kaynaklar: [Google UMP mesaj türleri](https://support.google.com/admob/answer/10114020),
[Avrupa mesajı hazırlama](https://support.google.com/admob/answer/10113207),
[ABD eyalet mesajları](https://support.google.com/admob/answer/10862202),
[iOS UMP](https://developers.google.com/admob/ios/privacy),
[Android UMP](https://developers.google.com/admob/android/privacy).
