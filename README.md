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

## Testler

`node --test tests/engine.test.mjs`

`dist/engine.mjs` oyun kurallarını, `dist/app.mjs` çizim ve etkileşimi içerir. `dist/style.css` yerleşimi, `dist/cyberpunk.css` görsel temayı tanımlar.
