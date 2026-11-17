// bolumler_d.js — 36–40. bölümler (u2-bolum-d). window.BOLUMLER'e ekler; bölüm sayısı sabit yazılmaz.
// Bu bölümlere numarayla değil BOLUMLER.findIndex(b => b.no === 36) ile erişilir (bolumler_b/c dolana kadar dizideki yer değişir).
// Ölçüm: gerçek çekiş taklidi (çekilen yerden fırlatma, oyunun kendi UCUS.dene fiziği) + UCUS.cekBirak ile doğrulama.
// Komşular: çekiş ±%10, açı ±6°, her kanat anı ±0.35 sn (kanatsız çözümde 7×7 ızgara). Çekiş %: tam çekişin oranı; kanat: uçuşun kaçıncı saniyesi.
// Ana çözümler en az (kanatHak − 2) kanat kullanır; ilk kanat çoğunlukla tepe noktasında ya da bir yardımcıdan hemen sonra (çocuğun doğal dokunuşu).
// Her bölümde `cozum: {cekis, aci, kanat}` alanı var (cocukDene/cocukOzet bunu hedef alır).
//  36. Ay Yüzeyi — ağırlıksız sıçrayış: ay baloncuklarından yükselip süzülen ay taşına konarak uzun, yavaş yaylar
//      kanat hakkı 3; çözüm: çekiş %36, açı 52°, kanat 0.9 sn → 5 yıldız + kavuşma (gerçek cekBirak, kanat dizisiyle; yatay+dikey). Komşular (74): %81 5 yıldız+kavuşma, %99 kavuşma; 1 fazla/eksik kanat (7): %43 kavuşma. cocukOzet (fazla kanat açık, birikimli): ≤3 %60, ≤5 %98, ortanca 3, tek atış (8 uçuşta) %93
//  37. Lale Tarlaları — gökkuşağı geçidi: lale rüzgârıyla yüksel, yay gibi dizilmiş üç renkli halkadan geç
//      kanat hakkı 4; çözüm: çekiş %45, açı 58°, kanat 1.5, 3.9 sn → 5 yıldız + kavuşma (gerçek cekBirak, kanat dizisiyle; yatay+dikey). Komşular (74): %30 5 yıldız+kavuşma, %74 kavuşma; 1 fazla/eksik kanat (8): %75 kavuşma. cocukOzet (fazla kanat açık, birikimli): ≤3 %60, ≤5 %100, ortanca 3, tek atış (8 uçuşta) %98
//  38. Işıldayan Orman — mantardan mantara zıpla, ışıltı baloncuğuyla yüksel, gece esintisiyle Bilbo'ya süzül
//      kanat hakkı 3; çözüm: çekiş %36, açı 52°, kanat 2.4 sn → 5 yıldız + kavuşma (gerçek cekBirak, kanat dizisiyle; yatay+dikey). Komşular (74): %84 5 yıldız+kavuşma, %85 kavuşma; 1 fazla/eksik kanat (7): %57 kavuşma. cocukOzet (fazla kanat açık, birikimli): ≤3 %50, ≤5 %95, ortanca 4, tek atış (8 uçuşta) %90
//  39. Gök Şatosu — bulut basamakları: buluttan buluta sekerek in, halkadan geçip esintiyle şatoya süzül
//      kanat hakkı 4; çözüm: çekiş %33, açı 58°, kanat 0.9, 3.6 sn → 5 yıldız + kavuşma (gerçek cekBirak, kanat dizisiyle; yatay+dikey). Komşular (74): %89 5 yıldız+kavuşma, %92 kavuşma; 1 fazla/eksik kanat (8): %63 kavuşma. cocukOzet (fazla kanat açık, birikimli): ≤3 %58, ≤5 %100, ortanca 3, tek atış (8 uçuşta) %93
//  40. Kış Gecesi Şenliği — büyük final: mantar, kar küresi baloncuğu, halka, bulut ve esinti tek bir şenlik yolunda
//      kanat hakkı 3; çözüm: çekiş %39, açı 46°, kanat 0.9 sn → 5 yıldız + kavuşma (gerçek cekBirak, kanat dizisiyle; yatay+dikey). Komşular (74): %59 5 yıldız+kavuşma, %76 kavuşma; 1 fazla/eksik kanat (7): %86 kavuşma. cocukOzet (fazla kanat açık, birikimli): ≤3 %63, ≤5 %98, ortanca 3, tek atış (8 uçuşta) %93
(function () {
  'use strict';
  const L = window.BOLUMLER || (window.BOLUMLER = []);

  // 36. Bölüm: Ay Yüzeyi — ağırlıksız sıçrayış: ay baloncuklarından yükselip süzülen ay taşına konarak uzun, yavaş yaylar
  L.push({
    no: 36, ad: 'Ay Yüzeyi', altAd: 'Ay Baloncukları', tema: 'ay',
    biyom: 31, hava: 'yildiztozu', zeminTur: 'ay', kiyafet: 'uzay', gece: true,
    hedef: { x: 86, y: 0 }, cali: { x: 81.5, y: 0.55, r: 1 }, kanatHak: 3,
    mantarlar: [],
    bulutlar: [{ x: 72, y: 10, r: 2.6 }],
    niluferler: [],
    ruzgarlar: [],
    halkalar: [],
    baloncuklar: [{ x: 22, y: 11, r: 2.4 }, { x: 42, y: 15, r: 2.7 }],
    esintiler: [],
    yildizYer: [[7, 8.6], [28.8, 18], [45, 20.4], [62.4, 21], [75.8, 14.6]],
    cozum: { cekis: 0.36, aci: 52, kanat: [0.9] }
  });

  // 37. Bölüm: Lale Tarlaları — gökkuşağı geçidi: lale rüzgârıyla yüksel, yay gibi dizilmiş üç renkli halkadan geç
  L.push({
    no: 37, ad: 'Lale Tarlaları', altAd: 'Yağmur Sonrası Gökkuşağı', tema: 'lale',
    biyom: 32, hava: 'gunesliyagmur', zeminTur: 'cim', gece: false,
    hedef: { x: 76, y: 0 }, cali: { x: 71.5, y: 0.55, r: 1 }, kanatHak: 4,
    mantarlar: [],
    bulutlar: [],
    niluferler: [],
    ruzgarlar: [{ x: 18, y: 0, w: 5, h: 11, guc: 34 }],
    halkalar: [{ x: 26, y: 14, r: 3 }, { x: 40, y: 14, r: 2.6 }, { x: 50, y: 13, r: 2.6 }],
    baloncuklar: [],
    esintiler: [],
    yildizYer: [[7.1, 10.4], [19.8, 12.9], [35.8, 18], [58.8, 16.6], [64.5, 18.1]],
    cozum: { cekis: 0.45, aci: 58, kanat: [1.5, 3.9] }
  });

  // 38. Bölüm: Işıldayan Orman — mantardan mantara zıpla, ışıltı baloncuğuyla yüksel, gece esintisiyle Bilbo'ya süzül
  L.push({
    no: 38, ad: 'Işıldayan Orman', altAd: 'Dev Işıltı Mantarları', tema: 'isilti',
    biyom: 33, hava: 'isilti', zeminTur: 'cim', gece: true,
    hedef: { x: 90, y: 0 }, cali: { x: 85.5, y: 0.55, r: 1 }, kanatHak: 3,
    mantarlar: [{ x: 22, r: 3.2, y: 3.8 }, { x: 52, r: 3.4, y: 4.04 }],
    bulutlar: [],
    niluferler: [],
    ruzgarlar: [],
    halkalar: [],
    baloncuklar: [{ x: 52, y: 11, r: 2.4 }],
    esintiler: [{ x: 76, y: 2, w: 14, h: 9, guc: 14 }],
    yildizYer: [[13.5, 8.7], [25.8, 13.1], [40, 17.4], [60.1, 17.9], [86.8, 4.1]],
    cozum: { cekis: 0.36, aci: 52, kanat: [2.4] }
  });

  // 39. Bölüm: Gök Şatosu — bulut basamakları: buluttan buluta sekerek in, halkadan geçip esintiyle şatoya süzül
  L.push({
    no: 39, ad: 'Gök Şatosu', altAd: 'Bulutların Üstü', tema: 'gokSato',
    biyom: 34, zeminTur: 'bulut', kiyafet: 'pelerin', gece: false,
    hedef: { x: 69, y: 0 }, cali: { x: 64.5, y: 0.55, r: 1 }, kanatHak: 4,
    mantarlar: [],
    bulutlar: [{ x: 20, y: 10, r: 2.8 }, { x: 25.5, y: 9, r: 2.8 }, { x: 31, y: 8, r: 2.8 }],
    niluferler: [],
    ruzgarlar: [],
    halkalar: [{ x: 37, y: 8, r: 2.5 }],
    baloncuklar: [],
    esintiler: [{ x: 52, y: 1, w: 22, h: 11, guc: 20 }],
    yildizYer: [[6.3, 9.2], [27.5, 15], [32.5, 14.2], [43.1, 11.3], [56, 5.8]],
    cozum: { cekis: 0.33, aci: 58, kanat: [0.9, 3.6] }
  });

  // 40. Bölüm: Kış Gecesi Şenliği — büyük final: mantar, kar küresi baloncuğu, halka, bulut ve esinti tek bir şenlik yolunda
  L.push({
    no: 40, ad: 'Kış Gecesi Şenliği', altAd: 'Büyük Final', tema: 'kisSenlik',
    biyom: 35, hava: 'kar', zeminTur: 'kar', kiyafet: 'atki', gece: true,
    hedef: { x: 90, y: 0 }, cali: { x: 85.5, y: 0.55, r: 1 }, kanatHak: 3,
    mantarlar: [{ x: 12, y: 3.56, r: 3 }],
    bulutlar: [{ x: 74, y: 11, r: 3.2 }],
    niluferler: [],
    ruzgarlar: [],
    halkalar: [{ x: 42, y: 15, r: 3 }],
    baloncuklar: [{ x: 22, y: 11, r: 2.4 }],
    esintiler: [{ x: 78, y: 2, w: 14, h: 9, guc: 14 }],
    yildizYer: [[7.4, 7.8], [29.2, 17], [47.8, 19.5], [65.9, 15.7], [80.7, 12.6]],
    cozum: { cekis: 0.39, aci: 46, kanat: [0.9] }
  });

  // Geriye dönük tekil mantar/bulut uyumu (yalnız bu dosyanın bölümleri)
  for (let i = 0; i < L.length; i++) {
    const b = L[i];
    if (!(b.no >= 36 && b.no <= 40)) continue;
    b.mantar = (b.mantarlar && b.mantarlar[0]) || null;
    b.bulut = (b.bulutlar && b.bulutlar[0]) || null;
  }
})();
