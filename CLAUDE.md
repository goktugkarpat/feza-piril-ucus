# Pırıl'ın Uçuş Okulu – çalışma notları
Genel kurallar: `../CLAUDE.md`. 50 bölümlük yandan görünüşlü sapan/uçuş oyunu (Three.js r170, `vendor/three.js`; klasik `<script>`, ES module yok).

## Dosyalar (yükleme sırası)
`vendor/three.js` → `ses.js` (SES) → `cekirdek.js` (renderer/scene/camera, D, YC, OLAY, P, CEK) → `bolumler.js` (1–25) → `bolumler_b.js` (26–30) → `bolumler_c.js` (31–35) → `bolumler_d.js` (36–40) → `bolumler_e.js` (41–45) → `bolumler_f.js` (46–50) (hepsi `window.BOLUMLER`'e ekler; bölüm sayısı hiçbir yerde sabit yazılmaz, hep `BOLUMLER.length`) → `dunya.js` (gök, tepeler, salıncak, yardımcıların görünüşü, 20 eski biyom + eklenti altyapısı `DY_EK`; `DUNYA`) → `ortam_a.js … ortam_i.js` (25 yeni biyom, 21–45: her biri `DY_EK[n] = { palet, secenek, yardimci, yardimciKur, kur(ctx), guncelle(t,dt,ctx), sok(ctx) }`) → `hava.js` (yağmur, kar, şimşek, yaprak…; `HAVA`) → `piril.js` (Pırıl ve Bilbo, kıyafetler) → `efekt.js` (yol noktaları, yıldızlar, zemine göre iniş efektleri, konfeti, final fişekleri) → `arayuz.js` (başlık, kaydırılan 50 bölümlük harita, üst gösterge, ipuçları, kavuşma düğmeleri, madalyalar) → `oyun.js` (durum akışı, çek-bırak, fizik, `window.UCUS`).
Sayfa: `index.html`, `style.css`. PWA: `manifest.webmanifest`, `sw.js` (önek `feza-piril-ucus-`; yeni dosya/ses eklenince `CORE`/`SESLER`'e ekle ve `CACHE` sürümünü artır), `icons/`. Sesler: `sesler/*.mp3` (61 kayıt; cümleler `ses.js` içindeki `/*SESLER*/` bloğunda, `gen_voice.py` kaydeder).

## Ortak adlar
- Durumlar `P.durum`: `bekle | cek | ucus | yuvar | don | kavus`
- Olaylar (`OLAY.on/emit`): `basla`, `durum`, `bolum({…, biyom, hava, zeminTur, kiyafet, gece, sonBolum, bolumVeri})`, `cek`, `birak`, `kanat`, `kanatBos`, `kanatSira` (erken dokunuş sıraya alındı), `yildiz`, `sek({x,y,tur})`, `ruzgar`, `halka`, `baloncuk({x,y,i})`, `esinti({x,y,i})`, `iska`, `bilboKos({x0,x1,sure,pirilX,engel})`, `kavus({bolumIdx,yildiz,enIyiYildiz,tekAtis,bilboKos,sonBolum})`, `yeniden({birikim,alinan,toplam})`, `simsek({guc})`, `havaDindi`, `silkin({x,y,kim})`, `gucSeviye`, `salla`, `izKaydet`, `yavas`
- `UCUS`: `yeniden()`, `yenidenSifir()`, `firlat(vx,vy,kanatlar)`, `cekBirak(dx,dy,sonucBekle,kanatSn|dizi)` (gerçek çekiş, piksel), `kanat()`, `bolum(idx)`, `bolumVeri(idx?)`, `bolumBilgi()`, `sonraki()`, `adim(sn)`, `bilgi()` (cizim, ucgen, biyom, hava…), `dene(vx,vy,kanatlar,idx,{dt,x0,y0,deneme,alinan})` (çizmeden, oyunun kendi fiziği), `otoAra(idx)`, `cocukDene(idx,tohum,sec)` / `cocukOzet(idx,n,sec)` (5 yaş taklidi: kaç denemede bütün yıldızlar), `ayar`, `yardimciAyar`.
- `ARAYUZ`: `basla`, `baslikAcik`, `harita(ac)`, `haritaAcik`.

## Bölüm verisi (`bolumler*.js`)
- Bölüm verisi (`bolumler*.js`):
  `no, ad, altAd, tema, hedef{x,y}, cali, kanatHak, yildizYer[5], cozum{cekis,aci,kanat}` + yardımcılar: `mantarlar, bulutlar, niluferler (+dere), ruzgarlar, halkalar, baloncuklar[{x,y,r}], esintiler[{x,y,w,h,guc}]` + görünüş: `biyom` (1–45), `gece`, `hava` (`yagmur|firtina|gunesliyagmur|kar|karhafif|yaprak|cicek|kum|sis|seker|yildiztozu|isilti`), `zeminTur` (`cim|islak|kar|buz|kum|seker|ay|bulut`), `kiyafet` (`atki|yagmurluk|gunes|uzay|cicektaci|parti|pelerin`). Eksik/bilinmeyen alanlarda hiçbir dosya çökmez.
- Kanat hakkı: 1–2: 0, 3–7: 1, 8–13: 2, 14–22: 3, 23–25: 4, 26–50: 3–4.
- Baloncuk: değince hangi yönden gelirse gelsin yukarı-ileri fırlatır (bir uçuşta bir kez). Esinti: içindeyken ileri iter, düşüşü yavaşlatır.

## Feza için bağışlamalar (`oyun.js`) — bozma
- Kaybetmek yok. Yıldızlar bölüm içinde BİRİKİR: ıskada da "bir daha"da da alınan yıldızlar kalır; çocuk yalnız eksikleri toplar. Beşini tek uçuşta almak ayrı bir başarıdır (`kavus.tekAtis` → gökkuşağı madalya).
- "Bilbo koşar": Pırıl Bilbo'nun önünde 7 m / arkasında 5 m içinde durursa Bilbo koşup gelir, kavuşma sayılır (arada dere varsa yok).
- Gizli yardım: bölümdeki deneme sayısı arttıkça yıldız toplama/çekim ve kavuşma alanı büyür. Erken kanat dokunuşu sıraya alınır, yere değdikten 0.2 sn içindeki geç dokunuş da sayılır.
- Tasarım ölçütü: her bölümde gerçek parmak çekişiyle tek atışta 5 yıldız + kavuşma mümkün; `UCUS.cocukOzet(idx, 40)` ile 5 denemede bütün yıldızlar ≥ %85 hedeflenir. 1–25'in uçuş fiziği (yerçekimi, fırlatma, kanat, sekme) değiştirilmez.

## Görünüş kuralları
- Ekranda oyunun adı dışında yazı yok (rakam olur). Korkutucu şey ve böcek yok; fırtına yumuşak (uzak şimşek, tatlı gök gürültüsü), kavuşunca güneş açar.
- Pırıl, yıldızlar ve yardımcılar her ortamda rahat seçilmeli; süsler zıplatan yardımcılara benzememeli; hava parçacıkları yıldız sarısı olmamalı.
- Bütçe (M1 iPad Pro): bölüm başına ≤ 120 çizim çağrısı, ≤ 340 bin üçgen (`UCUS.bilgi()`); gölge haritası, son işlem yok; bölüm değişince her şey sökülür (`dispose`).

## Test
`index.html?sessiz` (her zaman), `&atla` başlığı geçer, `&oto` kendisi fırlatıp kavuşur, `&hiz=N`, `&bolum=N` (1–50), `&hepsiacik`, `&sw0` service worker'ı kapatır.
Ekranlar: 1194×834, 834×1194, 1024×768, 768×1024. Düğmeler kenardan ≥5vh içeride.
Gönderme: yalnız ebeveyn "yükle" deyince `yayinla.command` (depo `goktugkarpat/feza-piril-ucus`, doğrudan main).
