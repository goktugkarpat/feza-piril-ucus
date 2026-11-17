// bolumler_b.js — 26–30. bölümler (2. tur: baloncuk ve esinti tanıtımı). window.BOLUMLER'e eklenir (bolumler.js'ten sonra yüklenir).
// Ölçüm: oyunun kendi fiziğiyle (UCUS.dene), salıncakta çekilmiş yerden fırlatma; yıldızlar ana yolun ve komşu yolların ORTAK geçtiği yerlerde.
// Çekiş %: tam çekişin oranı; açı: fırlatma açısı; kanat: uçuşun kaçıncı saniyesinde dokunulacağı.
// Komşular: çekiş ±%10, açı ±6°, her kanat anı ±0.35 sn (60 rastgele komşu). Ana yol Bilbo'yu aşıp kenardan geri dönmez;
// kanat anı tepe noktasında ya da bir yardımcıdan hemen sonra; her yardımcı ana yolda gerçekten kullanılır.
// Çocuk denemesi: UCUS.cocukDene, 30 tohum (5 yıldız + kavuşmaya kaçıncı uçuşta ulaşıldı: ortanca / 90. yüzdelik).
//  26. Yağmurlu Orman — fikir: kısa bir atış, tepede tek kanat, düşerken iri yağmur baloncuğu Pırıl'ı ağaçların üstünden Bilbo'ya fırlatır (ilk baloncuk)
//      çözüm: çekiş %32.5, açı 29°, kanat 0.6 sn → 5 yıldız + kavuşma (gerçek parmak çekişiyle denendi)
//      komşular: %98 kavuşur, %90 beş yıldız | çocuk: ortanca 3, %90'ı ≤4 uçuş
//  27. Karlı Köy — fikir: orta bir yay, tepede tek kanat, alçaktaki geniş kar rüzgârı Pırıl'ı damların üstünden Bilbo'ya taşır (ilk esinti)
//      çözüm: çekiş %47, açı 46°, kanat 2.1 sn → 5 yıldız + kavuşma (gerçek cekBirak, yatay + dikey)
//  28. Sakura Gecesi — fikir: fenerli gecede alçak bir yay, baloncuktan sekip yüksekteki çiçek halkasından geçerek uzun bir süzülüş
//      çözüm: çekiş %32.5, açı 26°, kanat 0.6 sn → 5 yıldız + kavuşma (gerçek cekBirak, yatay + dikey)
// Son ölçüm (04:55, cocukOzet 40 tohum, ≤3 / ≤5 / ortanca): 26 %48/%90/4 · 27 %43/%93/4 · 28 %40/%95/4 · 29 %50/%95/4 · 30 %50/%98/4
//  29. Çöl Vahası — fikir: sıcak hava sütunu Pırıl'ı kaldırır, tepede kanat, kum esintisi onu alçaktan uzun uzun vahaya taşır;
//      vahanın önündeki davul (mantar) alçak gelen atışları Bilbo'ya zıplatır (ana yol davulun üstünden süzülür)
//      çözüm: çekiş %57.5, açı 35°, kanat 1.5 sn → 5 yıldız + kavuşma (gerçek parmak çekişiyle denendi)
//      komşular: %97 kavuşur, %65 beş yıldız | çocuk: ortanca 3, %90'ı ≤5 uçuş
//  30. Fırtına Tepesi — fikir: fırtına rüzgârında hızlı zincir: baloncuk → esinti → baloncuk → bulut, buluttan son sıçrayışla Bilbo'ya
//      çözüm: çekiş %27.5, açı 41°, kanat 1.2 sn → 5 yıldız + kavuşma (dört yardımcının hepsi ana yolda kullanılıyor)
//      komşular: %90 kavuşur, %90 beş yıldız | çocuk: ortanca 3-4, %90.ı ≤5 uçuş; son yıldız buluttan sıçrayışın doruğunda
(function () {
  'use strict';
  if (!Array.isArray(window.BOLUMLER)) return;
  const L = window.BOLUMLER;
  const bos = function () { return { mantarlar: [], bulutlar: [], niluferler: [], ruzgarlar: [], halkalar: [], baloncuklar: [], esintiler: [] }; };

  // 26. Bölüm: Yağmurlu Orman — ilk baloncuk
  L.push(Object.assign(bos(), {
    no: 26,
    ad: 'Yağmurlu Orman',
    altAd: 'Damla Baloncuğu',
    tema: 'yagmur',
    biyom: 21, hava: 'yagmur', zeminTur: 'islak', kiyafet: 'yagmurluk',
    hedef: { x: 64, y: 0 },
    cali: { x: 59.5, y: 0.55, r: 1 },
    kanatHak: 3,
    baloncuklar: [{ x: 24, y: 7.5, r: 2.2 }],
    cozum: { cekis: 0.325, aci: 29, kanat: [0.6] },
    yildizYer: [
      [8, 5],
      [20.1, 8.1],
      [30.5, 12.8],
      [43.1, 13.6],
      [55.9, 7.8]
    ]
  }));

  // 27. Bölüm: Karlı Köy — ilk esinti
  L.push(Object.assign(bos(), {
    no: 27,
    ad: 'Karlı Köy',
    altAd: 'Kar Rüzgârı',
    tema: 'kar',
    biyom: 22, hava: 'kar', zeminTur: 'kar', kiyafet: 'atki',
    hedef: { x: 64, y: 0 },
    cali: { x: 59.5, y: 0.55, r: 1 },
    kanatHak: 3,
    esintiler: [{ x: 31.7, y: 2.2, w: 19.6, h: 7.8, guc: 10 }],
    cozum: { cekis: 0.47, aci: 46, kanat: [2.1] },
    yildizYer: [
      [7.9, 8.3],
      [17.7, 8.7],
      [27.2, 3.9],
      [45.3, 4.7],
      [52, 4.6]
    ]
  }));

  // 28. Bölüm: Sakura Gecesi — baloncuk + halka
  L.push(Object.assign(bos(), {
    no: 28,
    ad: 'Sakura Gecesi',
    altAd: 'Fenerli Yay',
    tema: 'sakura',
    biyom: 23, hava: 'cicek', zeminTur: 'cim', kiyafet: 'cicektaci', gece: true, ay: true, fenerler: true,
    hedef: { x: 88, y: 0 },
    cali: { x: 83.5, y: 0.55, r: 1 },
    kanatHak: 3,
    baloncuklar: [{ x: 21.2, y: 6.4, r: 2.1 }],
    halkalar: [{ x: 44, y: 13.2, r: 2.4 }],
    cozum: { cekis: 0.325, aci: 26, kanat: [0.6] },
    yildizYer: [
      [7.4, 4.7],
      [22.8, 9.8],
      [38.5, 14.1],
      [58.6, 15.8],
      [77, 9.3]
    ]
  }));

  // 29. Bölüm: Çöl Vahası — mantar (davul) + rüzgâr sütunu (sıcak hava) + esinti
  L.push(Object.assign(bos(), {
    no: 29,
    ad: 'Çöl Vahası',
    altAd: 'Sıcak Kum Esintisi',
    tema: 'col',
    biyom: 24, hava: 'kum', zeminTur: 'kum', kiyafet: 'gunes',
    hedef: { x: 89, y: 0 },
    cali: { x: 84.5, y: 0.55, r: 1 },
    kanatHak: 3,
    ruzgarlar: [{ x: 21.4, y: 0, w: 6, h: 10, guc: 32 }],
    esintiler: [{ x: 48.5, y: 1.5, w: 20.1, h: 7.8, guc: 19 }],
    mantarlar: [{ x: 73.9, y: 1.9, r: 2.3 }],
    cozum: { cekis: 0.575, aci: 35, kanat: [1.5] },
    yildizYer: [
      [8.1, 6.7],
      [17.9, 7.4],
      [26.6, 7.3],
      [49.4, 9.6],
      [60.3, 6.1]
    ]
  }));

  // 30. Bölüm: Fırtına Tepesi — esinti + iki baloncuk + bulut
  L.push(Object.assign(bos(), {
    no: 30,
    ad: 'Fırtına Tepesi',
    altAd: 'Rüzgârlı Doruk',
    tema: 'firtina',
    biyom: 25, hava: 'firtina', zeminTur: 'islak', kiyafet: 'yagmurluk',
    hedef: { x: 86, y: 0 },
    cali: { x: 81.5, y: 0.55, r: 1 },
    kanatHak: 4,
    baloncuklar: [{ x: 16.1, y: 5.9, r: 2.1 }, { x: 50.9, y: 5.1, r: 2.1 }],
    esintiler: [{ x: 37, y: 2.7, w: 18, h: 7.4, guc: 14 }],
    bulutlar: [{ x: 74, y: 11, r: 2.4 }],
    cozum: { cekis: 0.275, aci: 41, kanat: [1.2] },
    yildizYer: [
      [7.9, 6.5],
      [20, 10.1],
      [39.2, 12.9],
      [57, 11],
      [76.9, 14.2]
    ]
  }));

  // Geriye dönük tekil mantar/bulut uyumu (yalnız bu dosyanın bölümleri)
  for (let i = 0; i < L.length; i++) {
    const b = L[i];
    if (!b || b.no < 26 || b.no > 30) continue;
    b.mantar = b.mantarlar && b.mantarlar.length ? b.mantarlar[0] : null;
    b.bulut = b.bulutlar && b.bulutlar.length ? b.bulutlar[0] : null;
  }
})();
