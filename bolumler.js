// bolumler.js — 1–25. bölümler (window.BOLUMLER; 26–40 bolumler_b/c/d.js'te)
// Her bölüm: hedef, kanatHak, cozum, yildizYer (5 yıldız), engel/yardımcı dizileri (mantarlar, bulutlar, niluferler, ruzgarlar, halkalar, cali), biyom.
// 2. tur ölçümü (u2-bolum-eski): oyunun kendi fiziğiyle, ÇEKİLEN YERDEN fırlatma (UCUS.cekBirak ile birebir aynı; ana çözümler gerçek cekBirak ile denendi).
// Sağlamlık: ana çözümün 50 komşusu (çekiş ±%10, açı ±6°, her kanat anı ±0.35 sn) içinde kaçı 5 yıldız + kavuşma, kaçı kavuşma veriyor.
// Feza taklidi: UCUS.cocukOzet 30 tohum (yıldızlar birikir, Bilbo koşar, gizli yardım): ≤3 / ≤5 denemede 5 yıldız + kavuşma, ortanca, tek atışta 5 (8 uçuşta).
// Yıldızlar sağlam atış demetinin ORTAK geçtiği yerlere kondu; çalı (cali) her bölümde Bilbo'nun 3.2 m ARKASINDA (tek kural): ileri kaçan Pırıl'ı tutar, Bilbo koşusuna engel olmaz.
// cozum: { cekis: tam çekişin oranı, aci: derece, kanat: uçuşun kaçıncı saniyesinde dokunulacağı }.
//   1. İlk Uçuş — ilk uçuş: yalnız çek-bırak | çözüm: çekiş %40, açı 34°, kanat yok → 5 yıldız + kavuşma | komşular: %96 5 yıldız, %100 kavuşma | Feza: ≤3 %100, ≤5 %100, ortanca 2, tek atış %100
//   2. Mantar Trambolini — ilk mantar sekmesi | çözüm: çekiş %25, açı 33°, kanat yok → 5 yıldız + kavuşma | komşular: %100 5 yıldız, %100 kavuşma | Feza: ≤3 %63, ≤5 %100, ortanca 3, tek atış %100
//   3. İlk Kanat Çırpışı — ilk kanat çırpışı | çözüm: çekiş %27, açı 32°, kanat 1 sn → 5 yıldız + kavuşma | komşular: %76 5 yıldız, %100 kavuşma | Feza: ≤3 %90, ≤5 %100, ortanca 3, tek atış %100
//   4. Yumuşak Bulut Yastığı — ilk bulut yastığı | çözüm: çekiş %42, açı 49°, kanat 1.2 sn → 5 yıldız + kavuşma | komşular: %66 5 yıldız, %98 kavuşma | Feza: ≤3 %90, ≤5 %100, ortanca 3, tek atış %100
//   5. Nilüferli Dere — ilk nilüfer sekmesi (dere) | çözüm: çekiş %27, açı 61°, kanat yok → 5 yıldız + kavuşma | komşular: %92 5 yıldız, %92 kavuşma | Feza: ≤3 %70, ≤5 %100, ortanca 3, tek atış %90
//   6. Lavanta Rüzgârı — ilk sıcak rüzgâr sütunu | çözüm: çekiş %33, açı 58°, kanat 1.6 sn → 5 yıldız + kavuşma | komşular: %50 5 yıldız, %76 kavuşma | Feza: ≤3 %45, ≤5 %95, ortanca 4, tek atış %88
//   7. Gökkuşağı Halkaları — ilk gökkuşağı halkaları (uzağa fırlatır) | çözüm: çekiş %57, açı 54°, kanat 1.2 sn → 5 yıldız + kavuşma | komşular: %60 5 yıldız, %94 kavuşma | Feza: ≤3 %77, ≤5 %100, ortanca 3, tek atış %93
//   8. Çifte Kanat ve Yüksek Uçuş — iki kanat hakkı, yüksek uçuş | çözüm: çekiş %27, açı 28°, kanat 0.6, 1.5 sn → 5 yıldız + kavuşma | komşular: %82 5 yıldız, %98 kavuşma | Feza: ≤3 %67, ≤5 %100, ortanca 3, tek atış %87
//   9. Büyük Parkur — mantar + rüzgâr + bulut parkuru | çözüm: çekiş %28, açı 37°, kanat yok → 5 yıldız + kavuşma | komşular: %100 5 yıldız, %100 kavuşma | Feza: ≤3 %35, ≤5 %90, ortanca 4, tek atış %95
//  10. Yıldızlı Gece Şenliği — gece şenliği: iki halka + bulut | çözüm: çekiş %32, açı 54°, kanat 0.6, 1.2 sn → 5 yıldız + kavuşma | komşular: %76 5 yıldız, %80 kavuşma | Feza: ≤3 %87, ≤5 %100, ortanca 2, tek atış %100
//  11. Kiraz Çiçeği Bahçesi — mantar + halka | çözüm: çekiş %32, açı 30°, kanat 1.6 sn → 5 yıldız + kavuşma | komşular: %72 5 yıldız, %74 kavuşma | Feza: ≤3 %40, ≤5 %93, ortanca 4, tek atış %100
//  12. Ayçiçeği Tarlası — rüzgâr + bulut | çözüm: çekiş %55, açı 48°, kanat 0.6 sn → 5 yıldız + kavuşma | komşular: %72 5 yıldız, %86 kavuşma | Feza: ≤3 %63, ≤5 %90, ortanca 3, tek atış %93
//  13. Mercan Kıyısı — iki nilüfer + halka | çözüm: çekiş %25, açı 55°, kanat 3.5 sn → 5 yıldız + kavuşma | komşular: %78 5 yıldız, %82 kavuşma | Feza: ≤3 %33, ≤5 %97, ortanca 4, tek atış %87
//  14. Kristal Vadi — mantar + rüzgâr + halka, 3 kanat | çözüm: çekiş %35, açı 40°, kanat 1.9 sn → 5 yıldız + kavuşma | komşular: %28 5 yıldız, %70 kavuşma | Feza: ≤3 %43, ≤5 %90, ortanca 4, tek atış %60
//  15. Pamuk Şeker Gökyüzü — iki bulut + iki halka | çözüm: çekiş %27, açı 48°, kanat 0.6, 2.2 sn → 5 yıldız + kavuşma | komşular: %62 5 yıldız, %94 kavuşma | Feza: ≤3 %43, ≤5 %93, ortanca 4, tek atış %73
//  16. Akçaağaç Ormanı — rüzgâr + mantar + bulut | çözüm: çekiş %37, açı 36°, kanat 2.2 sn → 5 yıldız + kavuşma | komşular: %60 5 yıldız, %68 kavuşma | Feza: ≤3 %33, ≤5 %88, ortanca 4, tek atış %88
//  17. Kuzey Işıkları — kuzey ışıkları: iki halka + bulut | çözüm: çekiş %35, açı 56°, kanat 0.8, 2.4 sn → 5 yıldız + kavuşma | komşular: %48 5 yıldız, %88 kavuşma | Feza: ≤3 %37, ≤5 %93, ortanca 4, tek atış %70
//  18. Yüzen Masal Adaları — nilüferden göğe: nilüfer + halka + bulut | çözüm: çekiş %50, açı 26°, kanat 2.2 sn → 5 yıldız + kavuşma | komşular: %54 5 yıldız, %80 kavuşma | Feza: ≤3 %68, ≤5 %88, ortanca 3, tek atış %78
//  19. Altın Şafak Tapınağı — şafak: dört yardımcı bir arada | çözüm: çekiş %30, açı 40°, kanat 1.9 sn → 5 yıldız + kavuşma | komşular: %64 5 yıldız, %96 kavuşma | Feza: ≤3 %50, ≤5 %97, ortanca 4, tek atış %80
//  20. Dev Mantar — dev mantar: en yüksek zıplayış | çözüm: çekiş %32, açı 29°, kanat 1, 1.6 sn → 5 yıldız + kavuşma | komşular: %44 5 yıldız, %80 kavuşma | Feza: ≤3 %73, ≤5 %90, ortanca 3, tek atış %70
//  21. Nilüfer Atlamaca — nilüfer atlamaca: iki nilüferden sekip uzun atlayış | çözüm: çekiş %52, açı 26°, kanat yok → 5 yıldız + kavuşma | komşular: %92 5 yıldız, %100 kavuşma | Feza: ≤3 %67, ≤5 %93, ortanca 3, tek atış %100
//  22. Halka Tüneli — halka tüneli: dipdibe iki halka (çifte hız) | çözüm: çekiş %37, açı 40°, kanat 0.6 sn → 5 yıldız + kavuşma | komşular: %96 5 yıldız, %96 kavuşma | Feza: ≤3 %73, ≤5 %97, ortanca 3, tek atış %100
//  23. Gün Batımı Kanyonu — gün batımı kanyonu: hepsi bir arada, 4 kanat | çözüm: çekiş %29, açı 57°, kanat 2.2, 3.1 sn → 5 yıldız + kavuşma | komşular: %52 5 yıldız, %60 kavuşma | Feza: ≤3 %37, ≤5 %90, ortanca 4, tek atış %80
//  24. Rüzgâr Merdiveni — gece rüzgâr merdiveni: iki rüzgâr + bulut | çözüm: çekiş %48, açı 38°, kanat 0.8 sn → 5 yıldız + kavuşma | komşular: %54 5 yıldız, %100 kavuşma | Feza: ≤3 %37, ≤5 %100, ortanca 4, tek atış %90
//  25. Büyük Yıldız Şenliği — büyük final: mantar, rüzgâr, iki halka, bulut | çözüm: çekiş %38, açı 60°, kanat 1.6, 2.8 sn → 5 yıldız + kavuşma | komşular: %46 5 yıldız, %62 kavuşma | Feza: ≤3 %38, ≤5 %95, ortanca 4, tek atış %63
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
      cali: { x: 31.2, y: 0.55, r: 1 },
      kanatHak: 0,
      cozum: { cekis: 0.40, aci: 34, kanat: [] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
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
      hedef: { x: 49.5, y: 0 },
      cali: { x: 52.7, y: 0.55, r: 1 },
      kanatHak: 0,
      cozum: { cekis: 0.25, aci: 33, kanat: [] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [{ x: 16, y: 1.9, r: 1.7 }],
      bulutlar: [],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [],
      yildizYer: [
        [15.6, 5.3],
        [20.4, 10],
        [24.7, 12.2],
        [28.8, 12.6],
        [33.2, 11.2]
      ]
    },

    // 3. Bölüm: İlk Kanat Çırpışı — ilk kanat çırpışı
    {
      no: 3,
      ad: 'İlk Kanat Çırpışı',
      altAd: 'Gökyüzüne Dokun',
      tema: 'cayir',
      hedef: { x: 46, y: 0 },
      cali: { x: 49.2, y: 0.55, r: 1 },
      kanatHak: 1,
      cozum: { cekis: 0.27, aci: 32, kanat: [1] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [],
      bulutlar: [],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [],
      yildizYer: [
        [7.3, 5.2],
        [21.8, 6.8],
        [25.8, 7.2],
        [29.8, 6.5],
        [33.8, 4.9]
      ]
    },

    // 4. Bölüm: Yumuşak Bulut Yastığı — ilk bulut yastığı
    {
      no: 4,
      ad: 'Yumuşak Bulut Yastığı',
      altAd: 'Pamuk Gökyüzü',
      tema: 'bulut',
      hedef: { x: 47.3, y: 0 },
      cali: { x: 50.5, y: 0.55, r: 1 },
      kanatHak: 1,
      cozum: { cekis: 0.42, aci: 49, kanat: [1.2] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [],
      bulutlar: [{ x: 38, y: 9, r: 2.3 }],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [],
      yildizYer: [
        [10.9, 9.5],
        [15, 9.3],
        [24.9, 12.2],
        [29.4, 12],
        [33.6, 10.6]
      ]
    },

    // 5. Bölüm: Nilüferli Dere — ilk nilüfer sekmesi (dere)
    {
      no: 5,
      ad: 'Nilüferli Dere',
      altAd: 'Serin Sular',
      tema: 'dere',
      dere: { x: 26, w: 22 },
      hedef: { x: 51, y: 0 },
      cali: { x: 54.2, y: 0.55, r: 1 },
      kanatHak: 1,
      cozum: { cekis: 0.27, aci: 61, kanat: [] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [],
      bulutlar: [],
      niluferler: [
        { x: 17.7, y: 0.5, r: 1.9 },
        { x: 31.5, y: 0.5, r: 1.9 }
      ],
      ruzgarlar: [],
      halkalar: [],
      yildizYer: [
        [7.5, 9.5],
        [11.2, 8.7],
        [22.8, 8.5],
        [27, 6.9],
        [36.3, 9]
      ]
    },

    // 6. Bölüm: Lavanta Rüzgârı — ilk sıcak rüzgâr sütunu
    {
      no: 6,
      ad: 'Lavanta Rüzgârı',
      altAd: 'Sıcak Esinti',
      tema: 'lavanta',
      hedef: { x: 54, y: 0 },
      cali: { x: 57.2, y: 0.55, r: 1 },
      kanatHak: 1,
      cozum: { cekis: 0.33, aci: 58, kanat: [1.6] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
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
        [23, 15.5],
        [26, 19.1],
        [40.8, 16.7],
        [50.5, 4.7]
      ]
    },

    // 7. Bölüm: Gökkuşağı Halkaları — ilk gökkuşağı halkaları (uzağa fırlatır)
    {
      no: 7,
      ad: 'Gökkuşağı Halkaları',
      altAd: 'Renkli Geçit',
      tema: 'gokkusagi',
      hedef: { x: 77.5, y: 0 },
      cali: { x: 80.7, y: 0.55, r: 1 },
      kanatHak: 1,
      cozum: { cekis: 0.57, aci: 54, kanat: [1.2] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [],
      bulutlar: [],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [
        { x: 18, y: 11, r: 2.3 },
        { x: 36, y: 12, r: 2.3 }
      ],
      yildizYer: [
        [6.6, 9.6],
        [24.7, 15.8],
        [44.1, 15.9],
        [48.5, 15.6],
        [70.6, 2.1]
      ]
    },

    // 8. Bölüm: Çifte Kanat ve Yüksek Uçuş — iki kanat hakkı, yüksek uçuş
    {
      no: 8,
      ad: 'Çifte Kanat ve Yüksek Uçuş',
      altAd: 'Yüksek Dağ Geçidi',
      tema: 'dag',
      hedef: { x: 64.5, y: 0 },
      cali: { x: 67.7, y: 0.55, r: 1 },
      kanatHak: 2,
      cozum: { cekis: 0.27, aci: 28, kanat: [0.6, 1.5] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [],
      bulutlar: [],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [],
      yildizYer: [
        [5.3, 4.7],
        [22.4, 7.7],
        [37.9, 10.6],
        [42.2, 9.7],
        [54.8, 2.2]
      ]
    },

    // 9. Bölüm: Büyük Parkur — mantar + rüzgâr + bulut parkuru
    {
      no: 9,
      ad: 'Büyük Parkur',
      altAd: 'Üçlü Macera',
      tema: 'parkur',
      hedef: { x: 62.4, y: 0 },
      cali: { x: 65.6, y: 0.55, r: 1 },
      kanatHak: 2,
      cozum: { cekis: 0.28, aci: 37, kanat: [] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [{ x: 18, y: 1.9, r: 2 }],
      bulutlar: [{ x: 54, y: 9.5, r: 2.9 }],
      niluferler: [],
      ruzgarlar: [{ x: 34, y: 0, w: 5.5, h: 18, guc: 34 }],
      halkalar: [],
      yildizYer: [
        [8.4, 5.9],
        [23.2, 10.2],
        [29.7, 12.4],
        [37.6, 13.8],
        [41.7, 14.6]
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
      hedef: { x: 70, y: 0 },
      cali: { x: 73.2, y: 0.55, r: 1 },
      kanatHak: 2,
      cozum: { cekis: 0.32, aci: 54, kanat: [0.6, 1.2] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [],
      bulutlar: [{ x: 52.1, y: 10.5, r: 2.4 }],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [
        { x: 22, y: 12.9, r: 2.3 },
        { x: 31.4, y: 14.3, r: 2.3 }
      ],
      yildizYer: [
        [7.1, 9.2],
        [12.8, 12.2],
        [38.9, 17.6],
        [43.4, 17],
        [54, 14.5]
      ]
    },

    // 11. Bölüm: Kiraz Çiçeği Bahçesi — mantar + halka
    {
      no: 11,
      ad: 'Kiraz Çiçeği Bahçesi',
      altAd: 'Pembe Yapraklar',
      tema: 'kiraz',
      hedef: { x: 68, y: 0 },
      cali: { x: 71.2, y: 0.55, r: 1 },
      kanatHak: 2,
      cozum: { cekis: 0.32, aci: 30, kanat: [1.6] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [{ x: 18, y: 1.9, r: 1.7 }],
      bulutlar: [],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [{ x: 38, y: 12.5, r: 2.3 }],
      yildizYer: [
        [8.1, 5.3],
        [24.7, 10.6],
        [28.2, 12.8],
        [41.6, 15.4],
        [46.3, 13.7]
      ]
    },

    // 12. Bölüm: Ayçiçeği Tarlası — rüzgâr + bulut
    {
      no: 12,
      ad: 'Ayçiçeği Tarlası',
      altAd: 'Altın Güneş',
      tema: 'aycicegi',
      hedef: { x: 64, y: 0 },
      cali: { x: 67.2, y: 0.55, r: 1 },
      kanatHak: 2,
      cozum: { cekis: 0.55, aci: 48, kanat: [0.6] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
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
      hedef: { x: 77.5, y: 0 },
      cali: { x: 80.7, y: 0.55, r: 1 },
      kanatHak: 2,
      cozum: { cekis: 0.25, aci: 55, kanat: [3.5] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [],
      bulutlar: [],
      niluferler: [{ x: 16.5, y: 0.5, r: 2.6 }, { x: 32.4, y: 0.5, r: 2.6 }],
      ruzgarlar: [],
      halkalar: [{ x: 40, y: 10.5, r: 2.6 }],
      yildizYer: [
        [7.5, 8.2],
        [23.3, 8.7],
        [27.2, 7.2],
        [46.7, 15.6],
        [51.4, 15.8]
      ]
    },

    // 14. Bölüm: Kristal Vadi — mantar + rüzgâr + halka, 3 kanat
    {
      no: 14,
      ad: 'Kristal Vadi',
      altAd: 'Parlayan Yankı',
      tema: 'kristal',
      hedef: { x: 81, y: 0 },
      cali: { x: 84.2, y: 0.55, r: 1 },
      kanatHak: 3,
      cozum: { cekis: 0.35, aci: 40, kanat: [1.9] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [{ x: 17, y: 1.9, r: 2 }],
      bulutlar: [],
      niluferler: [],
      ruzgarlar: [{ x: 33, y: 0, w: 5.5, h: 18, guc: 34 }],
      halkalar: [{ x: 50, y: 13, r: 2.3 }],
      yildizYer: [
        [9.7, 6.9],
        [16.2, 6.3],
        [43.7, 15.3],
        [56, 17.7],
        [62.5, 16.6]
      ]
    },

    // 15. Bölüm: Pamuk Şeker Gökyüzü — iki bulut + iki halka
    {
      no: 15,
      ad: 'Pamuk Şeker Gökyüzü',
      altAd: 'Tatlı Bulutlar',
      tema: 'pamuk',
      hedef: { x: 73.4, y: 0 },
      cali: { x: 76.6, y: 0.55, r: 1 },
      kanatHak: 3,
      cozum: { cekis: 0.27, aci: 48, kanat: [0.6, 2.2] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
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
        [7.6, 8.1],
        [25.3, 14.1],
        [41, 16.1],
        [45.6, 16.3],
        [59.1, 14.4]
      ]
    },

    // 16. Bölüm: Akçaağaç Ormanı — rüzgâr + mantar + bulut
    {
      no: 16,
      ad: 'Akçaağaç Ormanı',
      altAd: 'Sonbahar Esintisi',
      tema: 'sonbahar',
      hedef: { x: 75.8, y: 0 },
      cali: { x: 79, y: 0.55, r: 1 },
      kanatHak: 3,
      cozum: { cekis: 0.37, aci: 36, kanat: [2.2] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [{ x: 30.5, y: 1.9, r: 2 }],
      bulutlar: [{ x: 60.4, y: 9.7, r: 2.9 }],
      niluferler: [],
      ruzgarlar: [{ x: 18.5, y: 0, w: 5.5, h: 18, guc: 34 }],
      halkalar: [],
      yildizYer: [
        [10.5, 6.4],
        [34, 8.5],
        [38.2, 11.7],
        [50.6, 16.4],
        [62.7, 13.7]
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
      cali: { x: 77.2, y: 0.55, r: 1 },
      kanatHak: 3,
      cozum: { cekis: 0.35, aci: 56, kanat: [0.8, 2.4] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
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
      hedef: { x: 77.9, y: 0 },
      cali: { x: 81.1, y: 0.55, r: 1 },
      kanatHak: 3,
      cozum: { cekis: 0.50, aci: 26, kanat: [2.2] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [],
      bulutlar: [{ x: 60, y: 10.5, r: 2.9 }],
      niluferler: [{ x: 18, y: 0.5, r: 2.6 }, { x: 34, y: 0.5, r: 2.6 }],
      ruzgarlar: [],
      halkalar: [{ x: 47, y: 12.5, r: 2.3 }],
      yildizYer: [
        [10.4, 5.2],
        [44.5, 10.4],
        [54.1, 13.7],
        [60.6, 15.2],
        [64.8, 14.5]
      ]
    },

    // 19. Bölüm: Altın Şafak Tapınağı — şafak: dört yardımcı bir arada
    {
      no: 19,
      ad: 'Altın Şafak Tapınağı',
      altAd: 'Güneşin Kapısı',
      tema: 'safak',
      hedef: { x: 80.3, y: 0 },
      cali: { x: 83.5, y: 0.55, r: 1 },
      kanatHak: 3,
      cozum: { cekis: 0.30, aci: 40, kanat: [1.9] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [{ x: 14.7, y: 1.9, r: 1.7 }],
      bulutlar: [{ x: 65.4, y: 9.3, r: 2.4 }],
      niluferler: [],
      ruzgarlar: [{ x: 28.5, y: 0, w: 5.5, h: 18, guc: 34 }],
      halkalar: [{ x: 47.4, y: 13.5, r: 2.3 }],
      yildizYer: [
        [9.5, 6.5],
        [16.3, 4.2],
        [32.5, 10.3],
        [54.3, 17.9],
        [62, 15.8]
      ]
    },

    // 20. Bölüm: Dev Mantar — dev mantar: en yüksek zıplayış
    {
      no: 20,
      ad: 'Dev Mantar',
      altAd: 'En Yüksek Zıplayış',
      tema: 'mantar',
      biyom: 2,
      hedef: { x: 69.5, y: 0 },
      cali: { x: 72.7, y: 0.55, r: 1 },
      kanatHak: 3,
      cozum: { cekis: 0.32, aci: 29, kanat: [1, 1.6] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [{ x: 20, y: 1.9, r: 2.4 }],
      bulutlar: [],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [],
      yildizYer: [
        [7.9, 5],
        [28.8, 7.8],
        [38.1, 10],
        [42.8, 9.8],
        [48.4, 8.4]
      ]
    },

    // 21. Bölüm: Nilüfer Atlamaca — iki nilüferden sekip uzun atlayış
    {
      no: 21,
      ad: 'Nilüfer Atlamaca',
      altAd: 'Kurbağa Gibi',
      tema: 'dere',
      biyom: 5,
      dere: { x: 28, w: 26 },
      hedef: { x: 60.5, y: 0 },
      cali: { x: 63.7, y: 0.55, r: 1 },
      kanatHak: 3,
      cozum: { cekis: 0.52, aci: 26, kanat: [] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [],
      bulutlar: [],
      niluferler: [
        { x: 20, y: 0.5, r: 2 },
        { x: 34, y: 0.5, r: 2 }
      ],
      ruzgarlar: [],
      halkalar: [],
      yildizYer: [
        [10.6, 5.3],
        [22.5, 2.8],
        [39.4, 6.3],
        [44, 6.7],
        [49.2, 4.7]
      ]
    },

    // 22. Bölüm: Halka Tüneli — dipdibe iki halka (çifte hız)
    {
      no: 22,
      ad: 'Halka Tüneli',
      altAd: 'Renk Renk Kapılar',
      tema: 'gokkusagi',
      biyom: 7,
      hedef: { x: 91.5, y: 0 },
      cali: { x: 94.7, y: 0.55, r: 1 },
      kanatHak: 3,
      cozum: { cekis: 0.37, aci: 40, kanat: [0.6] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [],
      bulutlar: [],
      niluferler: [],
      ruzgarlar: [],
      halkalar: [
        { x: 22, y: 11, r: 2.3 },
        { x: 29, y: 12, r: 2.3 }
      ],
      yildizYer: [
        [8, 7],
        [34.4, 15.3],
        [43.4, 16.4],
        [53.1, 15.3],
        [78.4, 2.3]
      ]
    },

    // 23. Bölüm: Gün Batımı Kanyonu — gün batımı kanyonu: hepsi bir arada, 4 kanat
    {
      no: 23,
      ad: 'Gün Batımı Kanyonu',
      altAd: 'Turuncu Gökyüzü',
      tema: 'gunbatimi',
      biyom: 9,
      hedef: { x: 82.1, y: 0 },
      cali: { x: 85.3, y: 0.55, r: 1 },
      kanatHak: 4,
      cozum: { cekis: 0.29, aci: 57, kanat: [2.2, 3.1] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [{ x: 14.1, y: 1.9, r: 1.7 }],
      bulutlar: [{ x: 68.7, y: 11, r: 2.4 }],
      niluferler: [],
      ruzgarlar: [{ x: 31.4, y: 0, w: 5.5, h: 18, guc: 35 }],
      halkalar: [{ x: 53.3, y: 15.6, r: 2.3 }],
      yildizYer: [
        [8.2, 9.1],
        [12.4, 7.6],
        [44.6, 20.9],
        [48.4, 18.9],
        [71.3, 15]
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
      cali: { x: 79.2, y: 0.55, r: 1 },
      kanatHak: 4,
      cozum: { cekis: 0.48, aci: 38, kanat: [0.8] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
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
      cali: { x: 91.2, y: 0.55, r: 1 },
      kanatHak: 4,
      cozum: { cekis: 0.38, aci: 60, kanat: [1.6, 2.8] }, // ölçülmüş sağlam atış (çekiş oranı, açı°, kanat sn)
      mantarlar: [{ x: 10.2, y: 1.9, r: 2 }],
      bulutlar: [{ x: 75.2, y: 10.3, r: 2.9 }],
      niluferler: [],
      ruzgarlar: [{ x: 27.9, y: 0, w: 5.5, h: 18, guc: 34 }],
      halkalar: [
        { x: 48.8, y: 16.3, r: 2.3 },
        { x: 55.1, y: 14.1, r: 2.3 }
      ],
      yildizYer: [
        [10, 11.3],
        [24.6, 11.6],
        [51.7, 20.1],
        [63.3, 19.5],
        [77.7, 15]
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
