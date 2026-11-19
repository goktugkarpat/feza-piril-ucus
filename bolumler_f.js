// bolumler_f.js — 46–50. bölümler (41–45. biyomlar). window.BOLUMLER'e ekler; bölüm sayısı sabit yazılmaz.
// Bu bölümlere numarayla değil BOLUMLER.findIndex(b => b.no === 46) ile erişilir.
// Ölçüm: gerçek çekiş taklidi (çekilen yerden fırlatma, oyunun kendi UCUS.dene fiziği) + UCUS.cekBirak ile doğrulama (yatay 1194×834 ve dikey 834×1194).
// Komşular: çekiş ±%10, açı ±6°, kanat anı ±0.35 sn (80 rastgele komşu). Yıldızlar ana yol ile komşu yolların ortak koridorunda, 2.5 ≤ y ≤ 18 aralığında.
// Her bölümdeki bütün yardımcılar ana `cozum` yolunda gerçekten tetiklenir ve dereli bölümlerde `hedef.x ≥ dere.x + dere.w/2 + 14` sağlanır.
//  46. Gökkuşağı Şelalesi — iki nilüferden sek, çiçekli halkadan geç, şelale rüzgârıyla Bilbo'ya süzül
//      kanat hakkı 4; çözüm: çekiş %35, açı 56°, kanat 4.4 sn | komşu %86 kavuşma / %86 5★ | cocukOzet (n=40): ≤5 %95, ≤3 %63, tek8 %95, hiç 0
//  47. Origami Bahçesi — iki kâğıt kayıktan sek, buluta konup çiçek esintisiyle Bilbo'ya uç
//      kanat hakkı 3; çözüm: çekiş %32, açı 60°, kanat 4.35 sn | komşu %80 kavuşma / %74 5★ | cocukOzet (n=40): ≤5 %93, ≤3 %28, tek8 %93, hiç 0
//  48. Deniz Feneri Koyu — iki can simidi salından sek, koy esintisinden fener bulutuna zıpla
//      kanat hakkı 4; çözüm: çekiş %32, açı 52°, kanat 4.15 sn | komşu %89 kavuşma / %86 5★ | cocukOzet (n=40): ≤5 %93, ≤3 %38, tek8 %93, hiç 0
//  49. Yıldız Gözlemevi — ay baloncuğundan yüksel, pirinç halkadan geç, yıldızlı buluttan Bilbo'ya in
//      kanat hakkı 4; çözüm: çekiş %34, açı 40°, kanat 0.9 sn | komşu %91 kavuşma / %91 5★ | cocukOzet (n=40): ≤5 %98, ≤3 %55, tek8 %93, hiç 0
//  50. Büyük Gökkuşağı Karnavalı — elli bölüm finali: karnaval trambolini, baloncuk, halka, bulut ve esinti tek yolda
//      kanat hakkı 4; çözüm: çekiş %34, açı 40°, kanat 5.05 sn | komşu %89 kavuşma / %83 5★ | cocukOzet (n=40): ≤5 %98, ≤3 %65, tek8 %100, hiç 0
(function () {
  'use strict';
  const L = window.BOLUMLER || (window.BOLUMLER = []);

  // 46. Bölüm: Gökkuşağı Şelalesi — iki nilüfer + çiçekli halka + şelale rüzgârı
  L.push({
    no: 46, ad: 'Gökkuşağı Şelalesi', altAd: 'Pırıltılı Sular', tema: 'selale',
    biyom: 41, hava: 'gunesliyagmur', zeminTur: 'islak', kiyafet: 'yagmurluk', gece: false,
    dere: { x: 32, w: 24 }, hedef: { x: 86, y: 0 }, cali: { x: 81.5, y: 0.55, r: 1 }, kanatHak: 4,
    mantarlar: [],
    bulutlar: [],
    niluferler: [{ x: 22.4, y: 0.5, r: 2.15 }, { x: 39.6, y: 0.5, r: 2.15 }],
    ruzgarlar: [{ x: 66, y: 0, w: 9, h: 14, guc: 18 }],
    halkalar: [{ x: 46.2, y: 9.2, r: 3 }],
    baloncuklar: [],
    esintiler: [],
    yildizYer: [[6.8, 9.2], [28, 7.8], [40.9, 5.7], [51.7, 12], [62.1, 13.4]],
    cozum: { cekis: 0.35, aci: 56, kanat: [4.4] }
  });

  // 47. Bölüm: Origami Bahçesi — iki kâğıt kayık + bulut + çiçek esintisi
  L.push({
    no: 47, ad: 'Origami Bahçesi', altAd: 'Kâğıt Turnalar', tema: 'origami',
    biyom: 42, hava: 'cicek', zeminTur: 'cim', kiyafet: 'cicektaci', gece: false,
    dere: { x: 30, w: 22 }, hedef: { x: 85, y: 0 }, cali: { x: 80.5, y: 0.55, r: 1 }, kanatHak: 3,
    mantarlar: [],
    bulutlar: [{ x: 52.1, y: 8.8, r: 3 }],
    niluferler: [{ x: 21.2, y: 0.5, r: 2.3 }, { x: 35.1, y: 0.5, r: 2.3 }],
    ruzgarlar: [],
    halkalar: [],
    baloncuklar: [],
    esintiler: [{ x: 65.1, y: 1.5, w: 22, h: 11.5, guc: 19 }],
    yildizYer: [[7.3, 9.8], [33.4, 4.1], [47, 11], [56.1, 11.5], [64.2, 8.1]],
    cozum: { cekis: 0.32, aci: 60, kanat: [4.35] }
  });

  // 48. Bölüm: Deniz Feneri Koyu — iki can simidi salı + koy esintisi + bulut
  L.push({
    no: 48, ad: 'Deniz Feneri Koyu', altAd: 'Fener Işığı', tema: 'denizFeneri',
    biyom: 43, hava: null, zeminTur: 'kum', kiyafet: 'gunes', gece: false,
    dere: { x: 30, w: 24 }, hedef: { x: 88, y: 0 }, cali: { x: 83.5, y: 0.55, r: 1 }, kanatHak: 4,
    mantarlar: [],
    bulutlar: [{ x: 68.5, y: 8.5, r: 3.1 }],
    niluferler: [{ x: 21.2, y: 0.5, r: 2.3 }, { x: 39, y: 0.5, r: 2.3 }],
    ruzgarlar: [],
    halkalar: [],
    baloncuklar: [],
    esintiler: [{ x: 53, y: 1.5, w: 18, h: 11.5, guc: 14 }],
    yildizYer: [[7.3, 8.4], [27.5, 8.2], [38.8, 5], [61.8, 10.9], [71.5, 11.7]],
    cozum: { cekis: 0.32, aci: 52, kanat: [4.15] }
  });

  // 49. Bölüm: Yıldız Gözlemevi — baloncuk + halka + bulut
  L.push({
    no: 49, ad: 'Yıldız Gözlemevi', altAd: 'Gezegenler Bahçesi', tema: 'gozlemevi',
    biyom: 44, hava: 'yildiztozu', zeminTur: 'ay', kiyafet: 'uzay', gece: true, ay: true,
    hedef: { x: 90, y: 0 }, cali: { x: 85.5, y: 0.55, r: 1 }, kanatHak: 4,
    mantarlar: [],
    bulutlar: [{ x: 70.9, y: 7.3, r: 2.9 }],
    niluferler: [],
    ruzgarlar: [],
    halkalar: [{ x: 38.5, y: 15.1, r: 2.7 }],
    baloncuklar: [{ x: 18.4, y: 9.1, r: 2.4 }],
    esintiler: [],
    yildizYer: [[7.8, 6.7], [25.2, 12.2], [38.2, 16.6], [53.4, 17.8], [71.2, 10.7]],
    cozum: { cekis: 0.34, aci: 40, kanat: [0.9] }
  });

  // 50. Bölüm: Büyük Gökkuşağı Karnavalı — elli bölüm finali: mantar + baloncuk + halka + bulut + esinti
  L.push({
    no: 50, ad: 'Büyük Gökkuşağı Karnavalı', altAd: 'Elli Bölüm Finali', tema: 'karnaval',
    biyom: 45, hava: 'isilti', zeminTur: 'bulut', kiyafet: 'pelerin', gece: false,
    hedef: { x: 92, y: 0 }, cali: { x: 87.5, y: 0.55, r: 1 }, kanatHak: 4,
    mantarlar: [{ x: 21.1, y: 3.09, r: 2.6 }],
    bulutlar: [{ x: 70, y: 14.5, r: 3.1 }],
    niluferler: [],
    ruzgarlar: [],
    halkalar: [{ x: 54.7, y: 12, r: 2.9 }],
    baloncuklar: [{ x: 26.1, y: 12.2, r: 2.5 }],
    esintiler: [{ x: 78, y: 1.5, w: 18, h: 11.5, guc: 17 }],
    yildizYer: [[7.8, 6.7], [24.5, 10.8], [46.5, 16.2], [57.3, 14.2], [63.8, 15.3]],
    cozum: { cekis: 0.34, aci: 40, kanat: [5.05] }
  });

  // Geriye dönük tekil mantar/bulut uyumu (yalnız bu dosyanın bölümleri)
  for (let i = 0; i < L.length; i++) {
    const b = L[i];
    if (!(b.no >= 46 && b.no <= 50)) continue;
    b.mantar = (b.mantarlar && b.mantarlar[0]) || null;
    b.bulut = (b.bulutlar && b.bulutlar[0]) || null;
  }
})();
