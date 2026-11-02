# Popzuno 0.10.0 — yayın hazırlığı

2 Kasım 2026. Yeni dal: `codex/popzuno-rewarded-premium`; güvenli taban `popzuno` / `b21be94`.

Uygulama ücretsizdir. Beş mod, standart fotoğraflar ve güçlendirmeler ücretsiz kalır.
Yalnızca isteğe bağlı rewarded kurtarma ve 2,99 USD hedefli tek seferlik kozmetik Premium vardır.
Abonelik veya zorunlu reklam yoktur. Sonuçlar [ayrıntılı raporda](publication/monetization/REPORT-TR.md)
ve [aşama durumunda](publication/monetization/STATUS.json) tutulur.

| İş | Gerçek durum |
|---|---|
| Güvenli dal ve gerçek kod analizi | Tamamlandı; orijinal kaynak ve telefon korunur |
| Rewarded altyapısı / mod kurtarmaları | Kod, otomatik motor/native/UI testleri ve Android gerçek Google test reklamı doğrulandı |
| Kota / tekrar ödül / skor bütünlüğü | Native monoton sayaç; tek oyun, kayan 24 saat ve assisted rekor ayrımı test edildi |
| StoreKit / Play Billing | Derlendi; yerel StoreKit ve Android imza/UI testleri var; gerçek mağaza testleri bekliyor |
| Kozmetik içerik | Prizma/Krom çerçeveler, Aurora efekt, Yörünge animasyonu, Kristal bonus sesi |
| Çocuklar dahil karma kitle | Nötr yaş aralığı; çocuk/genç/belirsiz yaşta reklam/yeni satın alma yok; son mağaza incelemesi bekliyor |
| Gizlilik, veri güvenliği, hukuk | Altı dilde taslak güncellendi; mağaza beyanı ve hukuki onay tamamlanmadı |
| AdMob / UMP | Hesap ve iOS/Android rewarded kimlikleri hazır; ödeme profili, inceleme, mağaza bağlantıları ve bölgesel mesajlar bekliyor |
| Mağaza ürünleri / vergi / banka | Gerçek ürünler oluşturulmadı; gerekli işlemler sahibi tarafından tamamlanmalı |
| Android yayın | Google kayıt ödemesi sahibinin isteğiyle ertelendi; imzalı dağıtım yok |
| iOS / TestFlight | Bu dalda yalnızca imzasız aday; bu sürüm yüklenmedi veya telefona kurulmadı |
| Canlı destek sitesi | Bu dala ait metinler yerel taslak; eski canlı sayfa yeni SDK'ları henüz açıklamıyor |
| Canlıya geçiş | Kapalı; yayın kontrolü eksik hesap/ürün/beyan kapılarını reddeder |

[Hesap sahibi rehberi](publication/monetization/OWNER-STEPS-TR.md) gerekli resmî sayfa ve menüleri içerir.
Marka/ticari hak incelemesi sonuçlandırılmış sayılmaz. Ücretli hizmet, ödeme, sözleşme kabulü veya canlı yayın yapılmadı.
Kesin kişi başına kota ve güçlü mağaza/ödül sunucu doğrulaması için ayrıca backend gerekir;
bu sürüm cihaz başına sınır uygular. Test ayrıntıları raporda açıkça ayrılır.
