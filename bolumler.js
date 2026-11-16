// bolumler.js — 25 bölümlük oyun mimarisi (window.BOLUMLER)
// Her bölüm: hedef, kanatHak, yildizYer (5 yıldız), engel/yardımcı dizileri (mantarlar, bulutlar, niluferler, ruzgarlar, halkalar, cali),
// biyom (dunya.js görünüşü, 1-20; yoksa no). Yıldızlar ölçülerek yerleştirildi: gerçek fizik kopyasıyla (salıncaktan çekilmiş yerden fırlatma)
// her bölüm için bölümün fikrini kullanan sağlam bir atış seçildi, yıldızlar o yolun üstüne, yakın atışların da geçtiği yerlere kondu.
// Çekiş %: tam çekişin oranı (çekilmiş yerden fırlatma); açı: fırlatma açısı; kanat: uçuşun kaçıncı saniyesinde dokunulacağı.
//   1. İlk Uçuş — ilk uçuş: yalnız çek-bırak | çözüm: çekiş %60, açı 24°, kanat yok sn → 5 yıldız (yakın atışlar: 8/8 kavuşur, ort. 5 yıldız)
//   2. Mantar Trambolini — ilk mantar sekmesi | çözüm: çekiş %30, açı 58°, kanat yok sn → 5 yıldız (yakın atışlar: 6/8 kavuşur, ort. 5 yıldız)
//   3. İlk Kanat Çırpışı — ilk kanat çırpışı | çözüm: çekiş %42, açı 54°, kanat 1.4 sn → 5 yıldız (yakın atışlar: 25/26 kavuşur, ort. 4.96 yıldız)
//   4. Yumuşak Bulut Yastığı — ilk bulut yastığı | çözüm: çekiş %48, açı 52°, kanat 1.4 sn → 5 yıldız (yakın atışlar: 26/26 kavuşur, ort. 4.96 yıldız)
//   5. Nilüferli Dere — ilk nilüfer sekmesi (dere) | çözüm: çekiş %22, açı 50°, kanat yok → 5 yıldız + kavuşma (gerçek parmak çekişiyle denendi; otoAra da 5 bulur)
//   6. Lavanta Rüzgârı — ilk sıcak rüzgâr sütunu | çözüm: çekiş %35, açı 62°, kanat 1.7 sn → 5 yıldız (yakın atışlar: 26/26 kavuşur, ort. 4.73 yıldız)
//   7. Gökkuşağı Halkaları — ilk gökkuşağı halkaları (uzağa fırlatır) | çözüm: çekiş %30, açı 58°, kanat 0.8 sn → 5 yıldız (yakın atışlar: 23/26 kavuşur, ort. 5 yıldız)
//   8. Çifte Kanat ve Yüksek Uçuş — iki kanat hakkı, yüksek uçuş | çözüm: çekiş %80, açı 24°, kanat 0.5, 2.6 sn → 5 yıldız (yakın atışlar: 26/26 kavuşur, ort. 5 yıldız)
//   9. Büyük Parkur — mantar + rüzgâr + bulut parkuru | çözüm: çekiş %30, açı 52°, kanat 2.3 sn → 5 yıldız (yakın atışlar: 25/26 kavuşur, ort. 5 yıldız)
//  10. Yıldızlı Gece Şenliği — gece şenliği: iki halka + bulut | çözüm: çekiş %35, açı 64°, kanat 1.4 sn → 5 yıldız (yakın atışlar: 22/26 kavuşur, ort. 4.95 yıldız)
//  11. Kiraz Çiçeği Bahçesi — mantar + halka | çözüm: çekiş %35, açı 64°, kanat 3.5 sn → 5 yıldız (parmakla çekiş; otoAra 4 bulur)
//  12. Ayçiçeği Tarlası — rüzgâr + bulut | çözüm: çekiş %57, açı 48°, kanat 0.5 sn → 5 yıldız (yakın atışlar: 26/26 kavuşur, ort. 4.92 yıldız)
//  13. Mercan Kıyısı — iki nilüfer + halka | çözüm: çekiş %30, açı 64°, kanat 4.1 sn → 5 yıldız (yakın atışlar: 17/26 kavuşur, ort. 5 yıldız)
//  14. Kristal Vadi — mantar + rüzgâr + halka, 3 kanat | çözüm: çekiş %20, açı 64°, kanat 1.4, 2.0, 3.5 sn → 5 yıldız + kavuşma (gerçek parmak çekişiyle denendi)
//  15. Pamuk Şeker Gökyüzü — iki bulut + iki halka | çözüm: çekiş %30, açı 64°, kanat 0.5, 3.5 sn → 5 yıldız (yakın atışlar: 18/26 kavuşur, ort. 4.61 yıldız)
//  16. Akçaağaç Ormanı — rüzgâr + mantar + bulut | çözüm: çekiş %40, açı 36°, kanat 1.4, 2.3 sn → 5 yıldız + kavuşma (gerçek parmak çekişiyle denendi; otoAra da 5 bulur)
//  17. Kuzey Işıkları — kuzey ışıkları: iki halka + bulut | çözüm: çekiş %38, açı 56°, kanat 0.8, 2.3 sn → 5 yıldız (yakın atışlar: 23/26 kavuşur, ort. 5 yıldız)
//  18. Yüzen Masal Adaları — nilüferden göğe: nilüfer + halka + bulut | çözüm: çekiş %32, açı 64°, kanat 3.2, 4.1 sn → 5 yıldız (yakın atışlar: 26/26 kavuşur, ort. 5 yıldız)
//  19. Altın Şafak Tapınağı — şafak: dört yardımcı bir arada | çözüm: çekiş %30, açı 64°, kanat 2.3, 3.5 sn → 5 yıldız (yakın atışlar: 16/26 kavuşur, ort. 4.75 yıldız)
//  20. Dev Mantar — dev mantar: en yüksek zıplayış | çözüm (oyunun kendi aramasıyla, salıncağın ortasından): vx 12.23, vy 11.81, kanat 1.90, 3.20 sn → 5 yıldız + kavuşma
//  21. Nilüfer Atlamaca — nilüfer atlamaca: iki nilüferden sekip kanatla uzun süzülüş | çözüm: çekiş %30, açı 58°, kanat 3.8, 4.4 sn → 5 yıldız + kavuşma (gerçek parmak çekişiyle denendi)
//  22. Halka Tüneli — halka tüneli: dipdibe iki halka (çifte hız) | çözüm (oyunun kendi aramasıyla, salıncağın ortasından): vx 26.29, vy 16.43, kanat yok sn → 5 yıldız + kavuşma
//  23. Gün Batımı Kanyonu — gün batımı kanyonu: hepsi bir arada, 4 kanat | çözüm: çekiş %30, açı 64°, kanat 2.3, 4.4 sn → 5 yıldız (yakın atışlar: 17/26 kavuşur, ort. 4.94 yıldız)
//  24. Rüzgâr Merdiveni — gece rüzgâr merdiveni: iki rüzgâr + bulut | çözüm: çekiş %30, açı 36°, kanat 0.5, 1.4 sn → 5 yıldız (yakın atışlar: 25/26 kavuşur, ort. 4.88 yıldız)
//  25. Büyük Yıldız Şenliği — büyük final: mantar, rüzgâr, iki halka, bulut | çözüm: çekiş %38, açı 64°, kanat 1.7, 2.9 sn → 5 yıldız (yakın atışlar: 26/26 kavuşur, ort. 4.92 yıldız)
(function () {
  'use strict';

  window.BOLUMLER = [
    // 1. Bölüm: İlk Uçuş — ilk uçuş: yalnız çek-bırak
    {
      no: 1,
      ad: 'İlk Uçuş',
      altAd: 'Altın Çayır',
      tema: 'cayir',
      hedef: { x: 28, y: 0 },
      cali: null,
      kanatHak: 0,
      mantarlar: [],
      bulutlar: [],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [],
      yildizYer: [
        [5.3, 4.7],
        [9.5, 5.2],
        [14, 5.1],
        [18.8, 4.3],
        [23.2, 3]
      ]
    },

    // 2. Bölüm: Mantar Trambolini — ilk mantar sekmesi
    {
      no: 2,
      ad: 'Mantar Trambolini',
      altAd: 'Zıplayan Şapka',
      tema: 'cayir',
      hedef: { x: 38, y: 0 },
      cali: { x: 33.5, y: 0.55, r: 0.9 },
      kanatHak: 0,
      mantarlar: [{ x: 16, y: 1.9, r: 1.7 }],
      bulutlar: [],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [],
      yildizYer: [
        [7, 9.2],
        [14.6, 5.9],
        [19.3, 9.8],
        [25.6, 13.1],
        [34.9, 4.1]
      ]
    },

    // 3. Bölüm: İlk Kanat Çırpışı — ilk kanat çırpışı
    {
      no: 3,
      ad: 'İlk Kanat Çırpışı',
      altAd: 'Gökyüzüne Dokun',
      tema: 'cayir',
      hedef: { x: 44, y: 0 },
      cali: { x: 39.5, y: 0.55, r: 1 },
      kanatHak: 1,
      mantarlar: [],
      bulutlar: [],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [],
      yildizYer: [
        [6.4, 9],
        [14.5, 10.2],
        [27.1, 12.6],
        [31.7, 11.5],
        [41, 4.4]
      ]
    },

    // 4. Bölüm: Yumuşak Bulut Yastığı — ilk bulut yastığı
    {
      no: 4,
      ad: 'Yumuşak Bulut Yastığı',
      altAd: 'Pamuk Gökyüzü',
      tema: 'bulut',
      hedef: { x: 48, y: 0 },
      cali: { x: 43.5, y: 0.55, r: 1 },
      kanatHak: 1,
      mantarlar: [],
      bulutlar: [{ x: 38, y: 9, r: 2.3 }],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [],
      yildizYer: [
        [7.3, 9.3],
        [15.8, 10.7],
        [30.6, 13],
        [34.6, 11.9],
        [43.3, 9.8]
      ]
    },

    // 5. Bölüm: Nilüferli Dere — ilk nilüfer sekmesi (dere)
    {
      no: 5,
      ad: 'Nilüferli Dere',
      altAd: 'Serin Sular',
      tema: 'dere',
      dere: { x: 26, w: 22 },
      hedef: { x: 52, y: 0 },
      cali: { x: 47.5, y: 0.55, r: 1 },
      kanatHak: 1,
      mantarlar: [],
      bulutlar: [],
      niluferler: [
        { x: 17.7, y: 0.5, r: 1.9 },
        { x: 31.5, y: 0.5, r: 1.9 }
      ],
      ruzgarlar: [],
      halkalar: [],
      yildizYer: [
        [6, 7.1],
        [16.7, 3.4],
        [26.4, 6.9],
        [37.9, 8.6],
        [48.4, 2.8]
      ]
    },

    // 6. Bölüm: Lavanta Rüzgârı — ilk sıcak rüzgâr sütunu
    {
      no: 6,
      ad: 'Lavanta Rüzgârı',
      altAd: 'Sıcak Esinti',
      tema: 'lavanta',
      hedef: { x: 54, y: 0 },
      cali: { x: 49.5, y: 0.55, r: 1 },
      kanatHak: 1,
      mantarlar: [],
      bulutlar: [],
      niluferler: [],
      ruzgarlar: [
        { x: 20, y: 0, w: 5, h: 16, guc: 32 },
        { x: 37, y: 0, w: 5, h: 18, guc: 34 }
      ],
      halkalar: [],
      yildizYer: [
        [9.1, 10.8],
        [23, 15.1],
        [26, 18.7],
        [40.8, 16.3],
        [50.5, 4.3]
      ]
    },

    // 7. Bölüm: Gökkuşağı Halkaları — ilk gökkuşağı halkaları (uzağa fırlatır)
    {
      no: 7,
      ad: 'Gökkuşağı Halkaları',
      altAd: 'Renkli Geçit',
      tema: 'gokkusagi',
      hedef: { x: 70, y: 0 },
      cali: { x: 65.5, y: 0.55, r: 1 },
      kanatHak: 1,
      mantarlar: [],
      bulutlar: [],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [
        { x: 18, y: 11, r: 2.3 },
        { x: 36, y: 12, r: 2.3 }
      ],
      yildizYer: [
        [8.2, 9.9],
        [22.7, 14.6],
        [31.8, 12.7],
        [43, 14.2],
        [62.2, 7.6]
      ]
    },

    // 8. Bölüm: Çifte Kanat ve Yüksek Uçuş — iki kanat hakkı, yüksek uçuş
    {
      no: 8,
      ad: 'Çifte Kanat ve Yüksek Uçuş',
      altAd: 'Yüksek Dağ Geçidi',
      tema: 'dag',
      hedef: { x: 58, y: 0 },
      cali: { x: 53.5, y: 0.55, r: 1 },
      kanatHak: 2,
      mantarlar: [],
      bulutlar: [],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [],
      yildizYer: [
        [8.3, 5.3],
        [19, 8],
        [29.8, 9.5],
        [40.7, 8.7],
        [50.5, 5.8]
      ]
    },

    // 9. Bölüm: Büyük Parkur — mantar + rüzgâr + bulut parkuru
    {
      no: 9,
      ad: 'Büyük Parkur',
      altAd: 'Üçlü Macera',
      tema: 'parkur',
      hedef: { x: 64, y: 0 },
      cali: { x: 59.5, y: 0.55, r: 1 },
      kanatHak: 2,
      mantarlar: [{ x: 18, y: 1.9, r: 1.7 }],
      bulutlar: [{ x: 54, y: 9.5, r: 2.4 }],
      niluferler: [],
      ruzgarlar: [{ x: 34, y: 0, w: 5.5, h: 18, guc: 34 }],
      halkalar: [],
      yildizYer: [
        [10.3, 8.3],
        [21.7, 10.3],
        [33.5, 17],
        [41.4, 20.9],
        [56.9, 11.3]
      ]
    },

    // 10. Bölüm: Yıldızlı Gece Şenliği — gece şenliği: iki halka + bulut
    {
      no: 10,
      ad: 'Yıldızlı Gece Şenliği',
      altAd: 'Ateşböceği Gecesi',
      tema: 'gece',
      gece: true,
      ay: true,
      fenerler: true,
      atesbocekleri: true,
      hedef: { x: 66, y: 0 },
      cali: { x: 61.5, y: 0.55, r: 1 },
      kanatHak: 2,
      mantarlar: [],
      bulutlar: [{ x: 52.1, y: 10.5, r: 2.4 }],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [
        { x: 22, y: 12.9, r: 2.3 },
        { x: 31.4, y: 14.3, r: 2.3 }
      ],
      yildizYer: [
        [8.9, 11],
        [18.5, 13.1],
        [33.9, 16.8],
        [50.6, 14.2],
        [54.6, 14.6]
      ]
    },

    // 11. Bölüm: Kiraz Çiçeği Bahçesi — mantar + halka
    {
      no: 11,
      ad: 'Kiraz Çiçeği Bahçesi',
      altAd: 'Pembe Yapraklar',
      tema: 'kiraz',
      hedef: { x: 62, y: 0 },
      cali: { x: 57.5, y: 0.55, r: 1 },
      kanatHak: 2,
      mantarlar: [{ x: 18, y: 1.9, r: 1.7 }],
      bulutlar: [],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [{ x: 38, y: 12.5, r: 2.3 }],
      yildizYer: [
        [9.2, 11],
        [17.3, 5.6],
        [24.8, 12.6],
        [39.5, 15.7],
        [59.2, 4.8]
      ]
    },

    // 12. Bölüm: Ayçiçeği Tarlası — rüzgâr + bulut
    {
      no: 12,
      ad: 'Ayçiçeği Tarlası',
      altAd: 'Altın Güneş',
      tema: 'aycicegi',
      hedef: { x: 64, y: 0 },
      cali: { x: 59.5, y: 0.55, r: 1 },
      kanatHak: 2,
      mantarlar: [],
      bulutlar: [{ x: 48, y: 10, r: 2.4 }],
      niluferler: [],
      ruzgarlar: [{ x: 24, y: 0, w: 5.5, h: 18, guc: 34 }],
      halkalar: [],
      yildizYer: [
        [8.7, 9.8],
        [24.1, 15.1],
        [28.5, 16.7],
        [49.7, 14],
        [61.9, 3.4]
      ]
    },

    // 13. Bölüm: Mercan Kıyısı — iki nilüfer + halka
    {
      no: 13,
      ad: 'Mercan Kıyısı',
      altAd: 'Turkuaz Dalgalar',
      tema: 'mercan',
      dere: { x: 30, w: 28 },
      hedef: { x: 66, y: 0 },
      cali: { x: 61.5, y: 0.55, r: 1 },
      kanatHak: 2,
      mantarlar: [],
      bulutlar: [],
      niluferler: [
        { x: 16.5, y: 0.5, r: 2.2 },
        { x: 32.4, y: 0.5, r: 2.2 }
      ],
      ruzgarlar: [],
      halkalar: [{ x: 42.3, y: 11.4, r: 2.3 }],
      yildizYer: [
        [10, 9.3],
        [19.9, 7.9],
        [31, 3.5],
        [44.9, 13.5],
        [63.9, 4.7]
      ]
    },

    // 14. Bölüm: Kristal Vadi — mantar + rüzgâr + halka, 3 kanat
    {
      no: 14,
      ad: 'Kristal Vadi',
      altAd: 'Parlayan Yankı',
      tema: 'kristal',
      hedef: { x: 68, y: 0 },
      cali: { x: 63.5, y: 0.55, r: 1 },
      kanatHak: 3,
      mantarlar: [{ x: 17, y: 1.9, r: 1.7 }],
      bulutlar: [],
      niluferler: [],
      ruzgarlar: [{ x: 33, y: 0, w: 5.5, h: 18, guc: 34 }],
      halkalar: [{ x: 50, y: 13, r: 2.3 }],
      yildizYer: [
        [11.1, 8.9],
        [21.8, 12.6],
        [36.9, 19.3],
        [55.8, 17.1],
        [64.7, 4.3]
      ]
    },

    // 15. Bölüm: Pamuk Şeker Gökyüzü — iki bulut + iki halka
    {
      no: 15,
      ad: 'Pamuk Şeker Gökyüzü',
      altAd: 'Tatlı Bulutlar',
      tema: 'pamuk',
      hedef: { x: 70, y: 0 },
      cali: { x: 65.5, y: 0.55, r: 1 },
      kanatHak: 3,
      mantarlar: [],
      bulutlar: [
        { x: 30, y: 9.5, r: 2.4 },
        { x: 56, y: 10, r: 2.4 }
      ],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [
        { x: 18, y: 11.5, r: 2.3 },
        { x: 43, y: 13, r: 2.3 }
      ],
      yildizYer: [
        [8.6, 12.6],
        [23, 14.6],
        [32, 13.6],
        [57.6, 14.5],
        [67.6, 3.3]
      ]
    },

    // 16. Bölüm: Akçaağaç Ormanı — rüzgâr + mantar + bulut
    {
      no: 16,
      ad: 'Akçaağaç Ormanı',
      altAd: 'Sonbahar Esintisi',
      tema: 'sonbahar',
      hedef: { x: 72, y: 0 },
      cali: { x: 67.5, y: 0.55, r: 1 },
      kanatHak: 3,
      mantarlar: [{ x: 30.5, y: 1.9, r: 1.7 }],
      bulutlar: [{ x: 60.4, y: 9.7, r: 2.4 }],
      niluferler: [],
      ruzgarlar: [{ x: 18.5, y: 0, w: 5.5, h: 18, guc: 34 }],
      halkalar: [],
      yildizYer: [
        [6.1, 5],
        [21.2, 5.5],
        [36.4, 9.5],
        [56.6, 12],
        [68.4, 8.7]
      ]
    },

    // 17. Bölüm: Kuzey Işıkları — kuzey ışıkları: iki halka + bulut
    {
      no: 17,
      ad: 'Kuzey Işıkları',
      altAd: 'Dans Eden Işıklar',
      tema: 'aurora',
      gece: true,
      hedef: { x: 74, y: 0 },
      cali: { x: 69.5, y: 0.55, r: 1 },
      kanatHak: 3,
      mantarlar: [],
      bulutlar: [{ x: 60, y: 10, r: 2.4 }],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [
        { x: 20, y: 12, r: 2.3 },
        { x: 42, y: 13.5, r: 2.3 }
      ],
      yildizYer: [
        [9.1, 10.5],
        [24.3, 15.8],
        [45.4, 18.8],
        [60.9, 13.5],
        [72.5, 4.6]
      ]
    },

    // 18. Bölüm: Yüzen Masal Adaları — nilüferden göğe: nilüfer + halka + bulut
    {
      no: 18,
      ad: 'Yüzen Masal Adaları',
      altAd: 'Bulut Köprüsü',
      tema: 'adalar',
      dere: { x: 28, w: 26 },
      hedef: { x: 76, y: 0 },
      cali: { x: 71.5, y: 0.55, r: 1 },
      kanatHak: 3,
      mantarlar: [],
      bulutlar: [{ x: 60, y: 10.5, r: 2.4 }],
      niluferler: [
        { x: 18, y: 0.5, r: 2.2 },
        { x: 34, y: 0.5, r: 2.2 }
      ],
      ruzgarlar: [],
      halkalar: [{ x: 47, y: 12.5, r: 2.3 }],
      yildizYer: [
        [10.8, 9.5],
        [21.9, 7.9],
        [45.7, 13.2],
        [57.6, 14.1],
        [68.4, 10.5]
      ]
    },

    // 19. Bölüm: Altın Şafak Tapınağı — şafak: dört yardımcı bir arada
    {
      no: 19,
      ad: 'Altın Şafak Tapınağı',
      altAd: 'Güneşin Kapısı',
      tema: 'safak',
      hedef: { x: 78, y: 0 },
      cali: { x: 73.5, y: 0.55, r: 1 },
      kanatHak: 3,
      mantarlar: [{ x: 14.7, y: 1.9, r: 1.7 }],
      bulutlar: [{ x: 65.4, y: 9.3, r: 2.4 }],
      niluferler: [],
      ruzgarlar: [{ x: 28.5, y: 0, w: 5.5, h: 18, guc: 34 }],
      halkalar: [{ x: 47.4, y: 13.5, r: 2.3 }],
      yildizYer: [
        [10.2, 9.4],
        [18.2, 10.8],
        [31.2, 20.9],
        [49.7, 17.4],
        [68.4, 13.1]
      ]
    },

    // 20. Bölüm: Dev Mantar — dev mantar: en yüksek zıplayış
    {
      no: 20,
      ad: 'Dev Mantar',
      altAd: 'En Yüksek Zıplayış',
      tema: 'mantar',
      biyom: 2,
      hedef: { x: 70, y: 0 },
      cali: { x: 65.5, y: 0.55, r: 1 },
      kanatHak: 3,
      mantarlar: [{ x: 20, y: 1.9, r: 2 }],
      bulutlar: [],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [],
      yildizYer: [
        [10.5, 9],
        [22.1, 9.7],
        [29.3, 16.6],
        [39.7, 14.6],
        [67, 4]
      ]
    },

    // 21. Bölüm: Nilüfer Atlamaca — iki nilüferden sekip kanatla uzun süzülüş
    {
      no: 21,
      ad: 'Nilüfer Atlamaca',
      altAd: 'Kurbağa Gibi',
      tema: 'dere',
      biyom: 5,
      dere: { x: 28, w: 26 },
      hedef: { x: 64, y: 0 },
      cali: { x: 59.5, y: 0.55, r: 1 },
      kanatHak: 3,
      mantarlar: [],
      bulutlar: [],
      niluferler: [
        { x: 20, y: 0.5, r: 2 },
        { x: 34, y: 0.5, r: 2 }
      ],
      ruzgarlar: [],
      halkalar: [],
      yildizYer: [
        [10.1, 9.4],
        [20.4, 5.5],
        [29.9, 6.5],
        [38, 9.7],
        [58.4, 12.5]
      ]
    },

    // 22. Bölüm: Halka Tüneli — dipdibe iki halka (çifte hız)
    {
      no: 22,
      ad: 'Halka Tüneli',
      altAd: 'Renk Renk Kapılar',
      tema: 'gokkusagi',
      biyom: 7,
      hedef: { x: 86, y: 0 },
      cali: { x: 81.5, y: 0.55, r: 1 },
      kanatHak: 3,
      mantarlar: [],
      bulutlar: [],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [
        { x: 22, y: 11, r: 2.3 },
        { x: 29, y: 12, r: 2.3 }
      ],
      yildizYer: [
        [11.3, 8.4],
        [25.8, 13.1],
        [43.7, 17.6],
        [60.3, 15.2],
        [79, 5.3]
      ]
    },

    // 23. Bölüm: Gün Batımı Kanyonu — gün batımı kanyonu: hepsi bir arada, 4 kanat
    {
      no: 23,
      ad: 'Gün Batımı Kanyonu',
      altAd: 'Turuncu Gökyüzü',
      tema: 'gunbatimi',
      biyom: 9,
      hedef: { x: 82, y: 0 },
      cali: { x: 77.5, y: 0.55, r: 1 },
      kanatHak: 4,
      mantarlar: [{ x: 14.1, y: 1.9, r: 1.7 }],
      bulutlar: [{ x: 68.7, y: 11, r: 2.4 }],
      niluferler: [],
      ruzgarlar: [{ x: 31.4, y: 0, w: 5.5, h: 18, guc: 35 }],
      halkalar: [{ x: 53.3, y: 15.6, r: 2.3 }],
      yildizYer: [
        [11.4, 7.9],
        [18.2, 11.5],
        [36.6, 18.1],
        [56.7, 18.7],
        [72.1, 14.6]
      ]
    },

    // 24. Bölüm: Rüzgâr Merdiveni — gece rüzgâr merdiveni: iki rüzgâr + bulut
    {
      no: 24,
      ad: 'Rüzgâr Merdiveni',
      altAd: 'Kuzey Işıkları Altında',
      tema: 'aurora',
      biyom: 17,
      gece: true,
      hedef: { x: 76, y: 0 },
      cali: { x: 71.5, y: 0.55, r: 1 },
      kanatHak: 4,
      mantarlar: [],
      bulutlar: [{ x: 60, y: 10.5, r: 2.4 }],
      niluferler: [],
      ruzgarlar: [
        { x: 17, y: 0, w: 5, h: 15, guc: 32 },
        { x: 38, y: 0, w: 5, h: 19, guc: 34 }
      ],
      halkalar: [],
      yildizYer: [
        [10.7, 7.9],
        [25.3, 14.3],
        [40.8, 18.2],
        [62.4, 13.9],
        [73.4, 3.7]
      ]
    },

    // 25. Bölüm: Büyük Yıldız Şenliği — büyük final: mantar, rüzgâr, iki halka, bulut
    {
      no: 25,
      ad: 'Büyük Yıldız Şenliği',
      altAd: 'Efsane Final',
      tema: 'final20',
      biyom: 20,
      gece: true,
      ay: true,
      fenerler: true,
      atesbocekleri: true,
      hedef: { x: 88, y: 0 },
      cali: { x: 83.5, y: 0.55, r: 1 },
      kanatHak: 4,
      mantarlar: [{ x: 10.2, y: 1.9, r: 1.7 }],
      bulutlar: [{ x: 75.2, y: 10.3, r: 2.4 }],
      niluferler: [],
      ruzgarlar: [{ x: 27.9, y: 0, w: 5.5, h: 18, guc: 34 }],
      halkalar: [
        { x: 48.8, y: 16.3, r: 2.3 },
        { x: 55.1, y: 14.1, r: 2.3 }
      ],
      yildizYer: [
        [10, 11.3],
        [24.6, 10.8],
        [51.7, 19.3],
        [63.3, 18.7],
        [77.7, 14.2]
      ]
    }
  ];

  // Geriye dönük tekil mantar/bulut uyumu
  for (let i = 0; i < window.BOLUMLER.length; i++) {
    const b = window.BOLUMLER[i];
    b.mantar = b.mantarlar && b.mantarlar.length ? b.mantarlar[0] : null;
    b.bulut = b.bulutlar && b.bulutlar.length ? b.bulutlar[0] : null;
  }
})();
