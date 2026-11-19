// bolumler_e.js — 41–45. bölümler (biyom 36–40). window.BOLUMLER'e ekler; bölüm sayısı sabit yazılmaz.
// Bu bölümlere numarayla değil BOLUMLER.findIndex(b => b.no === 41) ile erişilir.
// Ölçüm: gerçek çekiş taklidi (UCUS.dene) + gerçek piksel çek-bırak (UCUS.cekBirak: 1194×834 yatay ve 834×1194 dikey) + 5 yaş taklidi (UCUS.cocukOzet(idx, 40)).
// Yıldızlar ana çözüm ve komşularının (çekiş ±%10, açı ±6°, kanat ±0.35 sn) ortak koridoruna, y ∈ [2.5, 18] aralığına kondu; tüm yardımcılar ana çözüm yolunda tetiklenir.
//  41. Balon Vadisi — baloncuktan yüksel, buluttan sek, esintide süzül | çekiş %36, açı 40°, kanat [0.8] sn | cocukOzet: en5=%98, en3=%75, hic=%0, tek8=%93, medyan=2
//  42. Müzik Çayırı — gülen davuldan zıpla, halkadan geç, esintiden süzül, ikinci davulla Bilbo'ya | çekiş %34, açı 50°, kanat [4.8] sn | cocukOzet: en5=%95, en3=%55, hic=%0, tek8=%90, medyan=3
//  43. Yel Değirmeni Tepesi — yel değirmeni rüzgârıyla yüksel, buluttan sek, esintiyle Bilbo'ya | çekiş %46, açı 40°, kanat [1.2] sn | cocukOzet: en5=%100, en3=%53, hic=%0, tek8=%78, medyan=3
//  44. Su Altı Krallığı — baloncuktan yüksel, mercan halkasından geç, inci istiridyesinden sek | çekiş %42, açı 34°, kanat [3.4] sn | cocukOzet: en5=%95, en3=%58, hic=%0, tek8=%83, medyan=3
//  45. Oyuncak Diyarı — oyuncak kuleden zıpla, halkadan geç, baloncukla Bilbo'ya süzül | çekiş %38, açı 42°, kanat [4] sn | cocukOzet: en5=%100, en3=%68, hic=%0, tek8=%83, medyan=3
(function () {
  'use strict';
  const L = window.BOLUMLER || (window.BOLUMLER = []);

  // 41. Bölüm: Balon Vadisi — baloncuktan yüksel, buluttan yumuşak sek, esintide Bilbo'ya süzül
  L.push({
    no: 41, ad: 'Balon Vadisi', altAd: 'Gökyüzü Balonları', tema: 'balonVadisi',
    biyom: 36, hava: null, zeminTur: 'cim', kiyafet: 'pelerin', gece: false,
    hedef: { x: 78, y: 0 }, cali: { x: 73.5, y: 0.55, r: 1 }, kanatHak: 3,
    mantarlar: [],
    bulutlar: [{ x: 50, y: 10, r: 3 }],
    niluferler: [],
    ruzgarlar: [],
    halkalar: [],
    baloncuklar: [{ x: 24, y: 9, r: 2.5 }],
    esintiler: [{ x: 58, y: 2, w: 18, h: 11, guc: 18 }],
    yildizYer: [[5.7, 6.3], [33.8, 15.8], [44.5, 15.1], [54.1, 13.8], [64, 8.7]],
    cozum: { cekis: 0.36, aci: 40, kanat: [0.8] }
  });

  // 42. Bölüm: Müzik Çayırı — gülen yaylı davuldan zıpla, halkadan geç, esintiyle ikinci davula ve Bilbo'ya
  L.push({
    no: 42, ad: 'Müzik Çayırı', altAd: 'Notalar Dans Ediyor', tema: 'muzikCayiri',
    biyom: 37, hava: 'cicek', zeminTur: 'cim', kiyafet: 'cicektaci', gece: false,
    hedef: { x: 82, y: 0 }, cali: { x: 77.5, y: 0.55, r: 1 }, kanatHak: 3,
    mantarlar: [{ x: 17.5, y: 3.2, r: 2.7 }, { x: 64.5, y: 3.2, r: 2.7 }],
    bulutlar: [],
    niluferler: [],
    ruzgarlar: [],
    halkalar: [{ x: 20.5, y: 11.7, r: 2.9 }],
    baloncuklar: [],
    esintiler: [{ x: 38.5, y: 7.5, w: 18, h: 11, guc: 12 }],
    yildizYer: [[5.9, 7.7], [20.8, 11.3], [36.2, 16.7], [51.4, 13.4], [65.5, 7.7]],
    cozum: { cekis: 0.34, aci: 50, kanat: [4.8] }
  });

  // 43. Bölüm: Yel Değirmeni Tepesi — rüzgâr sütunuyla yüksel, buluttan sek, esintiyle Bilbo'ya süzül
  L.push({
    no: 43, ad: 'Yel Değirmeni Tepesi', altAd: 'Rüzgârın Şarkısı', tema: 'degirmen',
    biyom: 38, hava: 'yaprak', zeminTur: 'cim', kiyafet: 'gunes', gece: false,
    hedef: { x: 86, y: 0 }, cali: { x: 81.5, y: 0.55, r: 1 }, kanatHak: 4,
    mantarlar: [],
    bulutlar: [{ x: 52, y: 9.5, r: 3.1 }],
    niluferler: [],
    ruzgarlar: [{ x: 19, y: 0, w: 7, h: 14, guc: 34 }],
    halkalar: [],
    baloncuklar: [],
    esintiler: [{ x: 64, y: 2, w: 20, h: 11.5, guc: 18 }],
    yildizYer: [[6.2, 6.7], [22, 10.1], [52.7, 13.9], [63.4, 10.1], [82, 3.4]],
    cozum: { cekis: 0.46, aci: 40, kanat: [1.2] }
  });

  // 44. Bölüm: Su Altı Krallığı — baloncuktan yüksel, mercan halkasından geç, pembe inci istiridyesinden sek
  L.push({
    no: 44, ad: 'Su Altı Krallığı', altAd: 'İnci ve Mercanlar', tema: 'sualti',
    biyom: 39, hava: 'isilti', zeminTur: 'kum', kiyafet: 'uzay', gece: false,
    hedef: { x: 88, y: 0 }, cali: { x: 83.5, y: 0.55, r: 1 }, kanatHak: 4,
    mantarlar: [{ x: 65, y: 3.3, r: 2.8 }],
    bulutlar: [],
    niluferler: [],
    ruzgarlar: [],
    halkalar: [{ x: 24, y: 12.5, r: 2.9 }],
    baloncuklar: [{ x: 14, y: 7.5, r: 2.6 }],
    esintiler: [],
    yildizYer: [[5.7, 5.6], [22.2, 11.9], [38.6, 15.4], [55, 11], [70.7, 10.9]],
    cozum: { cekis: 0.42, aci: 34, kanat: [3.4] }
  });

  // 45. Bölüm: Oyuncak Diyarı — oyuncak kuleden zıpla, halkadan geç, baloncukla Bilbo'ya süzül
  L.push({
    no: 45, ad: 'Oyuncak Diyarı', altAd: 'Renkli Bloklar', tema: 'oyuncak',
    biyom: 40, hava: 'seker', zeminTur: 'seker', kiyafet: 'parti', gece: false,
    hedef: { x: 84, y: 0 }, cali: { x: 79.5, y: 0.55, r: 1 }, kanatHak: 3,
    mantarlar: [{ x: 19.5, y: 3.3, r: 2.8 }],
    bulutlar: [],
    niluferler: [],
    ruzgarlar: [],
    halkalar: [{ x: 26.5, y: 12, r: 2.9 }],
    baloncuklar: [{ x: 60, y: 6.5, r: 2.6 }],
    esintiler: [],
    yildizYer: [[5.7, 6.5], [21.3, 10.4], [36.6, 17.6], [52.1, 12.4], [70.8, 14.3]],
    cozum: { cekis: 0.38, aci: 42, kanat: [4] }
  });

  // Geriye dönük tekil mantar/bulut uyumu (yalnız bu dosyanın bölümleri)
  for (let i = 0; i < L.length; i++) {
    const b = L[i];
    if (!(b.no >= 41 && b.no <= 45)) continue;
    b.mantar = b.mantarlar[0] || null;
    b.bulut = b.bulutlar[0] || null;
  }
})();
