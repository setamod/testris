# Familytris — Android projesi

`android/` klasörünü Android Studio'nun güncel kararlı sürümüyle açın. İlk açılışta Android Studio, gereken Gradle ve Android SDK bileşenlerini indirir. Oyun kaynakları, yazı tipleri ve lisanslar uygulamanın içindedir; oynarken internet gerekmez.

## Hazır olanlar

- Android 8.0 (API 26) ve üzeri telefonlar için dikey WebView uygulaması.
- Çevrimdışı, tek HTML oyun paketi; harici gezinme ve ağ yüklemeleri engellenir.
- Skor, ses, ses düzeyi ve Familytris aile kaydı için uygulamaya özel kalıcı kayıt.
- Döndürme, saklama, bırakma ve satır temizleme için isteğe bağlı dokunsal geri bildirim.
- Arka plana geçince duraklatma, uygulama ayarları, lisanslar ve fotoğraf seçici.
- Türkçe Google Play taslak metni: `play-store/metadata.tr.json`.

## Kaynakları güncelleme

Ana proje dizininde:

```sh
npm run prepare:android
```

Bu komut oyunu tek bir çevrimdışı HTML olarak `app/src/main/assets/game/index.html` içine yerleştirir ve lisansları kopyalar. Android Studio'da derlemek için Node.js gerekmez; yalnızca oyun kaynakları değiştiğinde bu komutu çalıştırın.

## Cihazda çalıştırma

1. Android Studio'da `android/` klasörünü açın ve Gradle eşitlemesinin bitmesini bekleyin.
2. Bir emülatör veya USB hata ayıklaması açık fiziksel Android telefon seçin.
3. **Run** düğmesine basın.
4. Küçük ve büyük ekranlarda dokunmatik kontrolleri, aile fotoğrafı seçimini, sesi, dokunsal geri bildirimi, arka plana geçişi ve çevrimdışı başlatmayı kontrol edin.

Komut satırında, Android SDK ve Gradle kuruluysa:

```sh
gradle :app:assembleDebug
```

## Google Play yayını

1. `applicationId` (`com.mertbekisoglu.familytris`) hesabınızda uygun değilse yayımdan önce benzersiz bir kimlikle değiştirin; Play Console kaydından sonra sabit tutun.
2. Bir yükleme anahtarı oluşturun ve release imzalamayı yerel, gizli bir yapılandırmayla ayarlayın. Anahtar veya parolaları depoya eklemeyin.
3. Fiziksel cihaz ve farklı ekran boyutlarında release AAB'yi test edin.
4. Play Console'da uygulamayı oluşturun; taslak metni, gerçek cihaz ekran görüntülerini, içerik derecelendirmesini ve fiyatlandırmayı ekleyin.
5. Veri güvenliği formunu mevcut koda göre doldurun: uygulama kişisel verileri cihaz dışına iletmez. Yeni SDK, reklam, analiz veya sunucu eklendiğinde bu beyanı güncelleyin.
6. Play App Signing ile imzalı AAB'yi önce dahili test kanalına, ardından üretime gönderin.

Kaynak proje bir APK/AAB veya yayınlanmış Play Store sürümü değildir.
