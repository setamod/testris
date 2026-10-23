# Familytris — iPhone ve App Store projesi

`BLOK.xcodeproj` dosyasını Xcode'da açın. Oyun, yazı tipleri, ses sentezi ve lisanslar uygulamanın içindedir; oyun sırasında internet gerekmez. CocoaPods, npm veya başka bir paket kurulumu gerekmez.

## Familytris karakterleri

Ailem düğmesinden en fazla 7 yüz fotoğrafı eklenebilir. Yüzler cihazda otomatik yakınlaştırılır ve onaylanan kıyafetli çizgi gövdelere yerleştirilir. Kişiler adlandırılabilir, şekillere yeniden dağıtılabilir ve Sil ile kaldırılabilir. Küçük yüz kopyaları cihazda saklanır; fotoğraflar sunucuya gönderilmez. Fotoğraf seçme, kalıcı kayıt ve gerçek iPhone görünümü fiziksel cihazda ayrıca kontrol edilmelidir.

## Hazır olanlar

- iOS 16 ve üzeri iPhone hedefi; dikey ekran ve sistem güvenli alanları.
- SwiftUI uygulama, yerel WebKit oyun alanı ve 3 × 2 dokunmatik kontrol düzeni.
- Döndürme, saklama, bırakma ve satır temizleme için yerel dokunsal geri bildirim.
- Yardım ekranından açılan yerel ayarlar, titreşim tercihi ve gizlilik/lisans görünümü.
- Uygulama arka plana geçtiğinde veya ses kesintisinde duraklatma.
- Rekor ve ses tercihleri için uygulamaya özel kalıcı kayıt.
- Çevrimdışı kaynaklar, iPhone ikonları, 1024 × 1024 App Store ikonu ve gizlilik manifesti.
- Türkçe mağaza açıklaması, inceleme notları ve yayımlanabilecek destek/gizlilik sayfaları.

## Bu bilgisayardaki doğrulama sınırı

Xcode 27.1 ve iOS 27.1 SDK ile hem simülatör hem gerçek iPhone işlemcisi için imzasız derleme başarılı. 39 JavaScript testi, Swift sözdizimi ve proje/plist kontrolleri geçti. Gerçek örnek fotoğrafta otomatik kadraj ve 7 şeklin 4 dönüşünde çizim sınırları kontrol edildi. Personal Team seçildi, imzalama profili oluşturuldu ve Xcode’da imzalı iPhone derlemesi başarılı. Geliştirici Modu açıldı ve cihaz hazırlığı tamamlandı. Uygulamanın açılması, iPhone’da Ayarlar → Genel → VPN ve Aygıt Yönetimi bölümündeki geliştirici sertifikasına güven onayını bekliyor. Simülatör çalıştırması, fiziksel cihazda oyun testi ve mağaza yüklemesi henüz yapılmadı. Son durum BUILD_STATUS.json dosyasındadır.

## 1. Xcode'u kurun

[Mac App Store'dan Xcode](https://apps.apple.com/app/xcode/id497799835) kurun. Xcode'u açıp Apple'ın ilk kurulum ve lisans adımlarını kendiniz tamamlayın; iOS platform bileşenini yükleyin. App Store'a gönderim için güncel kararlı Xcode kullanın. Apple, 28 Nisan 2026'dan itibaren en az Xcode 26 / iOS 26 SDK ile derleme istiyor; desteklenen en düşük cihaz sürümü projede iOS 16 olarak ayrı tanımlıdır.

## 2. iPhone simülatöründe açın

1. `BLOK.xcodeproj` dosyasına çift tıklayın.
2. Üstte `BLOK` şemasını ve bir iPhone simülatörünü seçin.
3. Run (▶) düğmesine basın.
4. Küçük bir iPhone ve çentikli bir iPhone boyutunda kontrol düzenini, sesleri, rekoru ve arka plana geçişi test edin. Dokunsal geri bildirimi fiziksel iPhone'da test edin.

Komut satırından imzasız simülatör derlemesi:

```sh
xcodebuild -project BLOK.xcodeproj -scheme BLOK -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath build CODE_SIGNING_ALLOWED=NO build
```

## 3. Kendi iPhone'unuza yükleyin

1. Xcode → Settings → Accounts bölümünden Apple hesabınızla kendiniz giriş yapın.
2. Projede `BLOK` hedefini, sonra `Signing & Capabilities` bölümünü açın.
3. `Automatically manage signing` açık kalsın; `Team` alanından hesabınızı seçin.
4. Varsayılan Bundle Identifier `com.mertbekisoglu.blok`. Hesabınızda bu kimlik kullanılamıyorsa benzersiz bir kimlikle değiştirin. App Store kaydı açıldıktan sonra kimliği tutarlı kullanın.
5. iPhone'u Mac'e bağlayın, cihazın istediği güven/geliştirici adımlarını tamamlayın, çalıştırma hedefi olarak iPhone'u seçip Run'a basın.

Ücretsiz bir Personal Team ile kendi cihazınızda test edebilirsiniz; Apple'ın ücretsiz imzalama profilleri süreli olduğu için yeniden yükleme gerekir. App Store ve TestFlight dağıtımı için Apple Developer Program üyeliği gerekir.

## 4. TestFlight ve App Store

1. Apple Developer Program üyeliğini ve hesap sözleşmelerini hesap sahibi tamamlamalıdır.
2. App Store Connect'te iOS uygulaması oluşturun; Xcode'daki Bundle Identifier ile eşleştirin.
3. `AppStore/metadata.tr.json` ve `AppStore/review-notes.txt` dosyalarını başlangıç olarak kullanın. Geliştirici telif bilgisi ve inceleme iletişim bilgilerini doldurun.
4. `AppStore/public/privacy.html` ve `support.html` sayfalarını herkese açık HTTPS adreslerinde yayımlayın; gerçek adresleri mağaza formuna girin. Mevcut özel oyun bağlantısı yerine erişilebilir destek/gizlilik adresleri kullanın.
5. Gerçek simülatör/cihaz ekran görüntülerini ekleyin. Bu pakette cihaz ekran görüntüsü üretilmiş gibi sunulan görseller yoktur.
6. App Privacy sorularını mevcut koda göre yanıtlayın: uygulama kişisel veri toplamaz; rekor ve tercihler cihaz dışına aktarılmaz. Yeni SDK, reklam veya sunucu eklenirse bu beyanı güncelleyin.
7. Yaş derecelendirme, kategori, fiyatlandırma, dağıtım ve gerekli geliştirici/işletme bilgilerini tamamlayın.
8. Xcode'da hedefi `Any iOS Device (arm64)` yapın, Product → Archive → Distribute App → App Store Connect yolunu kullanın.
9. Yüklenen derlemeyi önce kendi iPhone'unuzda TestFlight ile test edin; ardından mağaza sürümüne bağlayıp incelemeye gönderin.

Bu proje bir kaynak paketidir; imzalı `.ipa` veya onaylanmış mağaza yayını değildir. App Store'a kabul, Apple'ın incelemesine bağlıdır.

## Kaynakları güncelleme

Ana proje klasöründe `node scripts/prepare-ios.mjs` oyun HTML'ini ve Xcode proje dosyasını günceller. Bu komut Xcode’da seçilen Team, Bundle Identifier ve sürüm ayarlarını korur. `node scripts/package-ios.mjs` doğrulama yapıp `../releases/Familytris-iOS-Projesi.zip` dosyasını oluşturur. Xcode'u açıp derlemek için bu scriptleri çalıştırmanız gerekmez.

## Resmi başvuru kaynakları

- [Cihaz testi ve üyelik](https://developer.apple.com/help/account/basics/about-your-developer-account)
- [Apple Developer Program](https://developer.apple.com/programs/whats-included/)
- [Güncel SDK gerekliliği](https://developer.apple.com/news/upcoming-requirements/?id=04282026a)
- [UserDefaults gizlilik gerekçeleri](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes/nsprivacyaccessedapitype)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
