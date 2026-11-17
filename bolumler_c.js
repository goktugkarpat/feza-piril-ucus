// bolumler_c.js — 31–35. bölümler (u2-bolum-c). window.BOLUMLER'e eklenir; dizideki sırası değişebilir, no alanı 31…35.
// Yerleşim yöntemi: yardımcılar ve hedef, çekilen yerden fırlatan gerçek fizikle (UCUS.dene) binlerce atış taranarak seçildi; ana çözümün
// komşularının (çekiş ±%10, açı ±6°, kanat anı ±0.35 sn; 80 rastgele komşu) en çok kavuştuğu ve 5 yaş taklidinin (UCUS.cocukDene: fazla
// kanat, yıldız birikimi, gizli yardım dahil) en çabuk bitirdiği yerleşim alındı; yıldızlar ana yol ile komşu yolların ORTAK geçtiği
// noktalara, y ≤ 18 (üst göstergenin altında kalmasın) kondu. Ana çözüm gerçek parmak çekişiyle (UCUS.cekBirak + kanat dizisi), yatay ve
// dikey, 5 yıldız + kavuşma verdi. Hepsi tek kanatla çözülür; kanat hakkının hepsini kullanmak gerekmez. Ölçüm 05:00 (cocukOzet n=40; ≤5 uçuşta 5★: 31 %95, 32 %95, 33 %90, 34 %93, 35 %98):
//  31. Balkabağı Tarlası — balkabağından zıpla, yapraklı meltemde uzun süzül | çekiş %40, açı 30°, kanat 1.65 sn (zıplayıştan sonra) | komşu %100 kavuşma / %94 5★
//  32. Buzul Gölü — iki buz parçasından sek, kar baloncuğuyla Bilbo'ya | çekiş %42.5, açı 62°, kanat 3.25 sn (ilk buzdan sekince tepede) | komşu %94 / %94
//  33. Palmiye Kumsalı — buluttan sek, halkadan geç, deniz melteminde süzül | çekiş %57.5, açı 32°, kanat 0.8 sn (tepede) | komşu %95 / %91
//  34. Sisli Bambu Ormanı — üç baloncuk basamağında yüksel, sisin üstünden in | çekiş %37.5, açı 32°, kanat 0.6 sn (tepede) | komşu %91 / %72
//  35. Şeker Diyarı — jöleden zıpla, yan yana iki şeker çemberi, baloncukla Bilbo'ya | çekiş %62.5, açı 22°, kanat 0.6 sn (tepede) | komşu %80 / %64
// cozum alanı: UCUS.cocukDene/cocukOzet'in hedef çözümü (cekis = tam çekişin oranı, aci = derece, kanat = uçuş saati sn).
(function () {
  'use strict';
  if (!Array.isArray(window.BOLUMLER)) window.BOLUMLER = [];
  const L = window.BOLUMLER;
  const ilk = L.length;

  // 31. Balkabağı Tarlası — fikir: balkabağı mantarından zıpla, yapraklarla esen meltemin içinde uzun süzül.
  L.push({
    no: 31, ad: 'Balkabağı Tarlası', altAd: 'Yapraklarla Süzülüş', tema: 'balkabagi',
    biyom: 26, hava: 'yaprak', zeminTur: 'cim', kiyafet: 'atki',
    hedef: { x: 75, y: 0 }, cali: { x: 70.5, y: 0.55, r: 1 }, kanatHak: 3,
    mantarlar: [{ x: 20, y: 1.9, r: 2 }], bulutlar: [], niluferler: [], ruzgarlar: [], halkalar: [],
    baloncuklar: [], esintiler: [{ x: 50.3, y: 4.1, w: 18, h: 9.4, guc: 20.4 }],
    yildizYer: [[11.8, 5.4], [24.2, 9.1], [38.4, 15.6], [58.2, 10.6], [66, 6.9]],
    cozum: { cekis: 0.4, aci: 30, kanat: [1.65] }
  });

  // 32. Buzul Gölü — fikir: göldeki iki buz parçasından sek sek, sonra kar baloncuğu seni Bilbo'ya yükseltir.
  L.push({
    no: 32, ad: 'Buzul Gölü', altAd: 'Buzdan Buza', tema: 'buzul',
    biyom: 27, hava: 'karhafif', zeminTur: 'buz', kiyafet: 'atki',
    dere: { x: 25, w: 22 }, hedef: { x: 69, y: 0 }, cali: { x: 64.5, y: 0.55, r: 1 }, kanatHak: 3,
    mantarlar: [], bulutlar: [], niluferler: [{ x: 18.9, y: 0.5, r: 2 }, { x: 27.6, y: 0.5, r: 2 }], ruzgarlar: [], halkalar: [],
    baloncuklar: [{ x: 44.6, y: 6.1, r: 2.2 }], esintiler: [],
    yildizYer: [[10.9, 12], [18.7, 6.1], [40.2, 9.9], [47.2, 12.2], [57.1, 13.2]],
    cozum: { cekis: 0.425, aci: 62, kanat: [3.25] }
  });

  // 33. Palmiye Kumsalı — fikir: buluttan sekip halkadan geç, deniz melteminde ferah süzül.
  L.push({
    no: 33, ad: 'Palmiye Kumsalı', altAd: 'Gün Doğarken', tema: 'kumsal',
    biyom: 28, zeminTur: 'kum', kiyafet: 'gunes',
    hedef: { x: 85, y: 0 }, cali: { x: 80.5, y: 0.55, r: 1 }, kanatHak: 4,
    mantarlar: [], bulutlar: [{ x: 16.7, y: 10, r: 2.4 }], niluferler: [], ruzgarlar: [], halkalar: [{ x: 36.4, y: 10.4, r: 2.3 }],
    baloncuklar: [], esintiler: [{ x: 64.6, y: 5.2, w: 13.3, h: 9.9, guc: 17.9 }],
    yildizYer: [[10.2, 6.6], [32.5, 9.8], [42.6, 11.6], [60.8, 10], [73.9, 6.2]],
    cozum: { cekis: 0.575, aci: 32, kanat: [0.8] }
  });

  // 34. Sisli Bambu Ormanı — fikir: üç baloncuk merdiveninden basamak basamak yüksel, sisin üstünden süzülerek in.
  L.push({
    no: 34, ad: 'Sisli Bambu Ormanı', altAd: 'Baloncuk Merdiveni', tema: 'bambu',
    biyom: 29, hava: 'sis', zeminTur: 'cim',
    hedef: { x: 92, y: 0 }, cali: { x: 87.5, y: 0.55, r: 1 }, kanatHak: 4,
    mantarlar: [], bulutlar: [], niluferler: [], ruzgarlar: [], halkalar: [],
    baloncuklar: [{ x: 18.1, y: 6.2, r: 1.6 }, { x: 32.6, y: 6.3, r: 2 }, { x: 40.5, y: 13, r: 1.8 }], esintiler: [],
    yildizYer: [[8, 5.7], [23.1, 8.9], [49.8, 17.7], [70.1, 17.9], [77.6, 14.4]],
    cozum: { cekis: 0.375, aci: 32, kanat: [0.6] }
  });

  // 35. Şeker Diyarı — fikir: jöle seni yan yana iki şeker çemberine fırlatır, baloncukla Bilbo'ya sekersin.
  L.push({
    no: 35, ad: 'Şeker Diyarı', altAd: 'Zıp Zıp Jöle', tema: 'seker',
    biyom: 30, hava: 'seker', zeminTur: 'seker', kiyafet: 'parti',
    hedef: { x: 88, y: 0 }, cali: { x: 83.5, y: 0.55, r: 1 }, kanatHak: 4,
    mantarlar: [{ x: 11.8, y: 1.9, r: 2 }], bulutlar: [], niluferler: [], ruzgarlar: [],
    halkalar: [{ x: 33.4, y: 9.7, r: 2.3 }, { x: 38.3, y: 9, r: 2.3 }],
    baloncuklar: [{ x: 76.4, y: 4.3, r: 1.8 }], esintiler: [],
    yildizYer: [[8.1, 4.8], [29.8, 8], [45.3, 12.2], [60.9, 12.7], [84.4, 3]],
    cozum: { cekis: 0.625, aci: 22, kanat: [0.6] }
  });

  // tekil mantar/bulut uyumu (yalnız bu dosyanın bölümleri)
  for (let i = ilk; i < L.length; i++) {
    const b = L[i];
    b.mantar = b.mantarlar[0] || null;
    b.bulut = b.bulutlar[0] || null;
  }
})();
