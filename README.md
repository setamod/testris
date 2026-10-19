# BLOK

Türkçe arayüzlü, tarayıcıda çalışan bir blok yerleştirme oyunu. Cyberpunk teması; neon camgöbeği ve pembe ışıklar, çerçeveli bloklar, tarama çizgileri ve ışık izleri içerir. Kurulum veya derleme gerektirmez.

## Çalıştırma

`python3 -m http.server 4173 --directory dist`

Ardından http://localhost:4173 adresini açın.

## Kontroller

| Tuş | İşlev |
| --- | --- |
| ← / → | Hareket |
| ↑ / X | Saat yönünde döndür |
| Z | Saat yönünün tersine döndür |
| ↓ | Hızlı indir |
| Space | Anında bırak |
| C | Parçayı sakla |
| P / Esc | Duraklat / devam |

Tablet ve telefonda ekran kontrolleri görünür. Her 10 temizlenen satırda seviye artar. Rekor ve ses tercihi localStorage'da saklanır. Sekmeden ayrıldığınızda oyun duraklar. Ağ bağlantısı olmadan da oyun çalışır; isteğe bağlı web yazı tipleri için sistem yazı tipi yedeği bulunur.

Cyberpunk ses efektleri Web Audio ile tarayıcıda sentezlenir. Hareket, döndürme, saklama, indirme, yerleşme, satır temizleme, seviye geçişi ve oyun sonu farklı efektler kullanır. Sesler ilk kullanıcı etkileşiminde açılır. Üstteki hoparlör düğmesi sesi kapatır; sayfa altındaki kaydırıcı ses düzeyini ayarlar ve “Sesi dene” düğmesi bir efekt çalar. Tercihler tarayıcıda korunur. Arka plana geçiş, yeni oyun veya sesi kapatma, bekleyen efektleri iptal eder.

## Testler

`node --test tests/*.test.mjs`

`dist/engine.mjs` oyun kurallarını, `dist/app.mjs` çizim ve etkileşimi içerir. `dist/style.css` yerleşimi, `dist/cyberpunk.css` görsel temayı tanımlar.

`dist/audio.mjs` ses sentezini ve efekt dizilerini içerir.
