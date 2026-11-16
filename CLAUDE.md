# Pırıl'ın Uçuş Okulu – çalışma notları
Genel kurallar: `../CLAUDE.md`. 25 bölümlük yandan görünüşlü sapan/uçuş oyunu (Three.js r170, `vendor/three.js`; klasik `<script>`, ES module yok).

## Dosyalar (yükleme sırası)
`vendor/three.js` → `ses.js` (SES) → `cekirdek.js` (renderer/scene/camera, D, YC, OLAY, P, CEK, yardımcılar) → `bolumler.js` (`window.BOLUMLER`, 25 bölüm; bölüm sayısı hiçbir yerde sabit yazılmaz, hep `BOLUMLER.length`) → `dunya.js` (gök, tepeler, salıncak, mantar, bulut, nilüfer, dere, rüzgâr, halka; `DUNYA`) → `piril.js` (Pırıl ve Bilbo) → `efekt.js` (yol noktaları, yıldızlar, konfeti) → `arayuz.js` (başlık, patikalı bölüm haritası ekranı, sade üst gösterge, yıldız sayacı, canlı kanat hakkı göstergesi, el/kanat ipucu, "bir daha" / "sonraki" / kutlama) → `oyun.js` (durum akışı, çek-bırak, fizik + süzülme destekli kanat çırpma, `window.UCUS`).
Sayfa: `index.html` (`#sahne` canvas kapsayıcısı, `#arayuz` düğme katmanı), `style.css`. PWA: `manifest.webmanifest`, `sw.js` (önek `feza-piril-ucus-`; yeni dosya/ses eklenince `CORE`/`SESLER`'e ekle ve `CACHE` sürümünü artır), `icons/icon-180/192/512.png`.

## Ortak adlar
- Durumlar `P.durum`: `bekle | cek | ucus | yuvar | don | kavus`
- Olaylar (`OLAY.on/emit`): `basla`, `durum`, `bolum(bilgi)`, `cek`, `birak`, `kanat({kalan,toplam,x,y,vx,vy})`, `yildiz({i,x,y,toplam})`, `sek({x,y,tur})` (`yer|mantar|bulut|nilufer|cali`), `ruzgar`, `halka`, `iska`, `kavus({bolumIdx,yildiz,enIyiYildiz})`, `yeniden`, `gucSeviye(n)`, `salla({guc,neden,ust})`, `izKaydet({noktalar})`, `yavas({k})`, `kanatBos({x,y,toplam})` (hak bitmişken dokunuş)
- `UCUS`: `yeniden()`, `firlat(vx,vy)`, `cekBirak(...)`, `kanat()`, `bolum(idx)`, `bolumSec(no)`, `sonraki()`, `sonrakiBolum()`, `bolumBilgi()`, `otoFirlat()`, `ekran(wx,wy)`, `adim(sn)`, `bilgi()`
- Arayüz düğmeleri olay yayılmasını durdurur; `oyun.js` `button,a,[data-dugme],.dugme,#baslik` hedeflerini çekme saymaz.
- `window.ARAYUZ = { basla, baslikAcik }` (`arayuz.js`): başlık açıkken `baslikAcik` true (`piril.js` bunu el sallama için okur).

## Mekanik ve Bölümler (`bolumler.js`, `oyun.js`)
- 25 bölüm: 1–2 `kanatHak: 0`, 3–7: 1, 8–13: 2, 14–22: 3, 23–25: 4. Her bölümün `biyom` (1–20) alanı görünüşünü seçer; tekrar eden görünüş farklı gün vaktiyle gelir (`dunya.js`).
- Tasarım ölçütü: her bölümde çocuğun GERÇEK çekişiyle (çekilen yerden fırlatma) tek atışta 5 yıldız + kavuşma mümkün olmalı. Ölçüm: `UCUS.dene(vx, vy, kanatlar, bolumIdx, {dt:1/120})` (oyunun kendi fiziği, çizmeden) ve `UCUS.otoAra(idx)`. Fizik sabit adımlıdır (kare hızından bağımsız).
- Bölümlerdeki yardımcılar/engeller: `mantarlar`, `bulutlar`, `niluferler` (+ `dere`), `ruzgarlar`, `halkalar`, `cali`, her bölümde 5 `yildizYer`.
- Süzülme destekli kanat çırpma (`oyun.js`): Havada dokunuşta `G.kanatKalan > 0` ise düşüşü kesip yukarı kaldırma (`A.kanatVy = 7.5`, `A.kanatVx = 1.0`) uygular ve `G.suzT = 0.58` sn süzülme başlatır; süzülme boyunca yerçekimi `YC * 0.55` olur ve yatay hız korunur/artar.

## Arayüz davranışları (`arayuz.js`)
- Çeken el: ekranın açık bir yerinden geriye-aşağı sürükler (oyun çekişi her yerden alır). İlk çekişe kadar kısa bekleme sonrası; sonra boşta kalınca ya da iki ıska/`salla` sonrası "cok" veya hedefi aşınca "az" biçimiyle; `cek` durumunda kaybolur.
- Kanat ipucu & gösterge: `kanatHak > 0` olan bölümlerde üstte canlı kanat hakkı (`#kanatlar`); ilk uçuşlarda tepe noktasında kanat+dokunma ipucu, `kanat` olayı görülünce gizlenir.
- Sayaç ve bölümler: üstte tek ince sıra (harita düğmesi + bölüm no, 5 yıldızlı sayaç, kanat hakları); 25 bölüm ayrı harita ekranında (`ARAYUZ.harita(ac)`, `ARAYUZ.haritaAcik`; `localStorage` ile ilerleme ve en iyi yıldız) (uçuşta küçülür, altına gelinince saydamlaşır, 5'te parlar).
- Kavuşma: "bir daha" ve sonraki açık bölüme geçiren "sonraki" düğmesi; 5 yıldızda madalya; son bölüm sonunda havai fişekli kutlama, ardından (6 sn sonra) toplam yıldız kartı.
- Sayfa: `gesture*`, `touchmove`, çoklu dokunuş, çift dokunma, `contextmenu`, `selectstart` engellenir (düğmeler hariç).

## Test
`index.html?sessiz` (her zaman), `&atla` başlığı geçer, `&oto` kendisi fırlatıp kavuşur, `&hiz=N` hızlandırır, `&bolum=N` bölüm seçer, `&hepsiacik` tüm bölümleri açar, `&sw0` service worker'ı kapatır.
Ekranlar: 1180×820, 1024×768, 820×1180, 768×1024. Düğmeler kenardan ≥5vh içeride (güvenli alan payıyla).
PWA önbelleği: sürüm `sw.js` içindeki `CACHE` (29 MP3 ses). Düğmelerde yazı yok (yalnız resim/rakam); dikeyde uzun parkurda bekleme kamerası önce tüm parkuru gösterir, sonra salıncağa yaklaşır (`bekleKamera`).
Gönderme: yalnız ebeveyn "yükle" deyince `yayinla.command` (depo `goktugkarpat/feza-piril-ucus`, doğrudan main).
