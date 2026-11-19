/* Pırıl'ın Uçuş Okulu — ses
   Önceden kaydedilmiş Türkçe anlatım (sesler/*.mp3, tr-TR-EmelNeural; cümle değişirse: python3 gen_voice.py <ad>)
   + kodla üretilen yumuşak efektler ve sakin, masalsı müzik (kalimba + yumuşak yaylı + çan; 88 bpm).
   ?sessiz → AudioContext ve ses oynatıcı HİÇ kurulmaz; bütün çağrılar sessizce döner.
   Ses ilk dokunuşta açılır (SES.hazir()); sekme gizlenince her şey susar. Olaylar OLAY'dan kendiliğinden dinlenir.
   2. tur: bölümün hava/zeminTur/gece alanına göre ortam sesi (yağmur, kar, rüzgâr, dalga, pırıltı; başlık/haritada susar),
   şimşekten sonra yumuşak gök gürültüsü, baloncuk/esinti/zemin sesleri, ortama göre müzik çeşitlemesi (MUZIK_PROFIL),
   yeni ortamların ilk açılışında bir kez söylenen cümleler (localStorage). Sınama: SES._sina("ortam:kar"|"profil:col"|"gok:1"…, sn). */
const SES = (() => {
  'use strict';
  const sessiz = new URLSearchParams(location.search).has('sessiz');

  /*SESLER*/
  const CUMLE = {
    giris: 'Pırıl uçmayı öğreniyor! Onu geri çek ve bırak, Bîlbo\'ya uçsun.',
    kanat: 'Uçarken ekrana dokun, Pırıl kanat çırpsın!',
    iska1: 'Az kaldı! Bir daha deneyelim.',
    iska2: 'Pırıl yuvarlandı, ne komikti! Haydi, bir daha uçalım.',
    iska3: 'Hoppa! Pırıl yine deniyor.',
    iska4: 'Hiç dert değil! Her denemede daha iyi uçuyorsun.',
    kavus1: 'Yaşasın! Pırıl Bîlbo\'ya uçtu!',
    kavus2: 'Harika bir uçuş! Bîlbo çok sevindi.',
    kavus3: 'Bravo! Ne güzel uçtun!',
    kavus4: 'Aferin sana! Bîlbo kuyruğunu sallıyor.',
    yildizlar: 'Bütün yıldızları topladın!',
    birdaha: 'Bir daha uçalım mı?',
    cokcek: 'Daha çok geri çek!',
    azcek: 'Bu sefer biraz daha az çek.',
    yukari: 'Biraz daha yukarı doğru bırak!',
    mantar: 'Bak, yaylı bir mantar! Üstüne düşersen seni yukarı zıplatır.',
    besyildiz: 'Beş yıldızın hepsi! Süpersin!',
    bolum1: 'Hadi başlayalım! Pırıl\'ı geri çek ve bırak, Bîlbo\'ya uçsun.',
    bulut: 'Bak, yumuşacık bir bulut! Üstüne düşersen pıt diye sektirir.',
    nilufer: 'Suda nilüfer yaprağı var! Üstünden hop diye sekebilirsin.',
    ruzgar: 'Vay, rüzgâr esiyor! İçinden geçersen seni yukarı uçurur.',
    halka: 'Parlak halkadan geç, hızlan!',
    cifte: 'Artık iki kez kanat çırpabilirsin! Havada iki kere dokun.',
    final: 'Son bölüm! Bütün öğrendiklerini göster, Bîlbo seni bekliyor!',
    sonraki: 'Harikasın! Haydi sonraki bölüme geçelim!',
    kutlama: 'Tebrikler! Bütün bölümleri bitirdin! Pırıl artık usta bir uçucu!',
    ucluKanat: 'Üç kez kanat çırpabilirsin! Gökyüzünde süzül!',
    ucusUstasi: 'Pırıl artık gerçek bir uçuş ustası! Haydi Bîlbo\'ya!',
    bolum20: 'İşte büyük final! Yıldızların arasında Bîlbo\'ya uçalım!',
    // 2. tur: yeni ortamların ilk açılışı (biyom 21–45 → ortam26–ortam50), yeni yardımcılar
    ortam26: 'Yağmur yağıyor! Pırıl ıslanmayı çok seviyor.',
    ortam27: 'Her yer bembeyaz! Kar yağıyor.',
    ortam28: 'Pembe çiçekler ay ışığında dans ediyor.',
    ortam29: 'Burası sıcacık bir çöl. Bîlbo vahada bekliyor.',
    ortam30: 'Gök gürlüyor ama korkmak yok. Bîlbo\'ya uçalım!',
    ortam31: 'Sonbahar geldi, yapraklar uçuşuyor.',
    ortam32: 'Buz pırıl pırıl parlıyor.',
    ortam33: 'Deniz kenarına geldik. Dalgaların sesini duyuyor musun?',
    ortam34: 'Sisli bir sabah. Bambular hışırdıyor.',
    ortam35: 'Burası şeker diyarı! Her şey rengârenk.',
    ortam36: 'Ay\'a geldik! Bak, Dünya ne kadar uzakta.',
    ortam37: 'Yağmurdan sonra gökkuşağı çıktı.',
    ortam38: 'Bu orman geceleri ışıl ışıl parlıyor.',
    ortam39: 'Bulutların üstündeyiz! Ne kadar yüksek.',
    ortam40: 'Kış şenliğine hoş geldin! Işıklar pırıl pırıl parlıyor.',
    ortam41: 'Vay, gökyüzü rengârenk balonlarla dolu! Haydi aralarından uçalım.',
    ortam42: 'Müzik çayırına geldik! Davullardan zıplayıp notalarla dans edelim.',
    ortam43: 'Bak bak, kocaman yel değirmenleri dönüyor! Rüzgârla yükselelim.',
    ortam44: 'Suyun altına daldık! Minik balıklar ve inciler arasında yüzelim.',
    ortam45: 'Oyuncak diyarına hoş geldin! Renkli küplerin üstünden sıçrayalım.',
    ortam46: 'Şırıl şırıl şelale akıyor! Nilüferlerden sekip gökkuşağına uçalım.',
    ortam47: 'Her şey kâğıttan katlanmış! Kâğıt kayıklardan sekip turnalarla süzülelim.',
    ortam48: 'Bak bak, kocaman deniz feneri ışık saçıyor! Yelkenlilerin üstünden uçalım.',
    ortam49: 'Yıldız gözlemevine vardık! Gezegen halkalarının içinden süzülelim.',
    ortam50: 'Büyük karnavala hoş geldin! Ellinci bölüm, en büyük uçuş başlıyor!',
    gunesacti: 'Bak, güneş açtı!',
    baloncuk: 'Baloncuğa değ, seni yukarı fırlatsın!',
    esinti: 'Rüzgâr arkadan itiyor, hızlan!',
    kirkbitti: 'Kırk bölümün hepsini bitirdin! Sen gerçek bir uçuş ustasısın.',
    ellibitti: 'Elli bölümün hepsini bitirdin! Sen harika bir gökyüzü kahramanısın!',
    tekatis: 'Hepsini tek uçuşta topladın! Harikasın!',
    kalanyildiz: 'Kalan yıldızları da toplayalım mı?'
  };
  /*SESLER-SON*/

  // ---------------- ortak yardımcılar (canlı ve sessiz sınama bağlamında aynı) ----------------
  const mf = m => 440 * Math.pow(2, (m - 69) / 12);
  const gurultuler = new WeakMap();
  function gurultu(c) {                                   // bağlam başına bir kez: 2 sn yumuşak (pembemsi) gürültü
    let b = gurultuler.get(c);
    if (b) return b;
    b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = b.getChannelData(0); let s = 0;
    for (let i = 0; i < d.length; i++) { s = s * 0.86 + (Math.random() * 2 - 1) * 0.14; d[i] = s * 2.4; }
    gurultuler.set(c, b); return b;
  }
  // zarf: atak a, sönüm d sn, tepe g
  function zarf(c, hedef, t, g, a, d) {
    const z = c.createGain(); z.gain.setValueAtTime(0.0001, t);
    z.gain.linearRampToValueAtTime(g, t + a);
    z.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    z.connect(hedef); return z;
  }
  function osil(c, tur, f, t, son, hedef) {
    const o = c.createOscillator(); o.type = tur; o.frequency.setValueAtTime(f, t);
    o.connect(hedef); o.start(t); o.stop(son + 0.05); return o;
  }
  function gurultuCal(c, hedef, t, sure, fTur, f1, f2, q, g, a) {
    const s = c.createBufferSource(); s.buffer = gurultu(c);
    const fl = c.createBiquadFilter(); fl.type = fTur; fl.Q.value = q;
    fl.frequency.setValueAtTime(f1, t); fl.frequency.exponentialRampToValueAtTime(f2, t + sure);
    const z = zarf(c, hedef, t, g, a, sure);
    s.connect(fl); fl.connect(z); s.start(t, Math.random()); s.stop(t + a + sure + 0.05);
    return s;
  }

  let _tavan = null;
  function tavanEgrisi() {
    if (_tavan) return _tavan;
    const n = 2048; _tavan = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = i / (n - 1) * 2 - 1, m = Math.abs(x);
      _tavan[i] = Math.sign(x) * (m < 0.5 ? m : 0.5 + 0.2 * Math.tanh((m - 0.5) / 0.2));   // en çok 0,7 ≈ -3,1 dB
    }
    return _tavan;
  }
  // ses grafiği: efekt + müzik → ana → yumuşak sınırlayıcı → yumuşak tavan → çıkış
  function kur(c) {
    const G = { c };
    G.cikis = c.createDynamicsCompressor();
    G.cikis.threshold.value = -10; G.cikis.knee.value = 8; G.cikis.ratio.value = 8;
    G.cikis.attack.value = 0.004; G.cikis.release.value = 0.2;
    G.ana = c.createGain(); G.ana.gain.value = 0.85;
    // son güvenlik: yumuşak tavan (-6 dB'ye kadar dokunmaz; çok şey üst üste binse de tepe -3 dB'yi geçemez)
    G.sinir = c.createWaveShaper(); G.sinir.curve = tavanEgrisi(); G.sinir.oversample = '2x';
    G.ana.connect(G.cikis); G.cikis.connect(G.sinir); G.sinir.connect(c.destination);
    G.efekt = c.createGain(); G.efekt.gain.value = 0.9; G.efekt.connect(G.ana);
    G.muzik = c.createGain(); G.muzik.gain.value = 0; G.muzik.connect(G.ana);
    G.muzikYum = c.createBiquadFilter(); G.muzikYum.type = 'lowpass'; G.muzikYum.frequency.value = 5200; G.muzikYum.connect(G.muzik);
    G.ortam = c.createGain(); G.ortam.gain.value = 0; G.ortam.connect(G.ana);   // ortam sesleri (yağmur, rüzgâr, pırıltı, gök gürültüsü)
    // küçük yankı (masalsı hava): iki gecikme hattı
    G.yanki = c.createGain(); G.yanki.gain.value = 0.22;
    const d1 = c.createDelay(1), d2 = c.createDelay(1), g1 = c.createGain(), g2 = c.createGain(), yf = c.createBiquadFilter();
    d1.delayTime.value = 0.23; d2.delayTime.value = 0.37; g1.gain.value = 0.35; g2.gain.value = 0.3; yf.type = 'lowpass'; yf.frequency.value = 2600;
    G.yanki.connect(yf); yf.connect(d1); yf.connect(d2); d1.connect(g1); d2.connect(g2); g1.connect(d2); g2.connect(d1);
    g1.connect(G.ana); g2.connect(G.ana);
    return G;
  }

  // ---------------- efektler (E.ad(G, t, ...)) ----------------
  const BES = [72, 74, 76, 79, 84, 88];                    // yıldız çıngırağı: do-re-mi-sol-DO (6.+ yıldız: mi), her yıldızda bir basamak yukarı
  const E = {
    tik(G, t) {                                            // düğme: yumuşak tahta tık
      const c = G.c, z = zarf(c, G.efekt, t, 0.32, 0.003, 0.09);
      const o = osil(c, 'sine', 1180, t, t + 0.1, z); o.frequency.exponentialRampToValueAtTime(720, t + 0.08);
    },
    birak(G, t, guc) {                                     // "fıyuv": yükselen hava + kayan ıslık
      const c = G.c, k = 0.5 + 0.5 * (guc == null ? 1 : guc);
      gurultuCal(c, G.efekt, t, 0.45, 'bandpass', 500, 2600, 1.6, 0.42 * k, 0.03);
      const z = zarf(c, G.efekt, t, 0.12 * k, 0.04, 0.38);
      const o = osil(c, 'sine', 380, t, t + 0.45, z); o.frequency.exponentialRampToValueAtTime(1150, t + 0.32);
    },
    kanat(G, t, perde) {                                   // iki tok, tatlı kanat çırpışı: yumuşak "fup fup" + minik yükselen armonik pırıltı
      const p = perde || 1;
      for (let i = 0; i < 2; i++) {
        const b = t + i * 0.15, k = i ? 0.8 : 1;
        gurultuCal(G.c, G.efekt, b, 0.13, 'lowpass', 1100, 260, 0.6, 0.42 * k, 0.018);
        const z = zarf(G.c, G.efekt, b, 0.2 * k, 0.012, 0.13);
        const o = osil(G.c, 'sine', 190 * p, b, b + 0.16, z); o.frequency.exponentialRampToValueAtTime(95 * p, b + 0.13);
      }
      const z = zarf(G.c, G.efekt, t + 0.2, 0.05, 0.02, 0.3); z.connect(G.yanki);
      const o = osil(G.c, 'sine', mf(76) * p, t + 0.2, t + 0.55, z); o.frequency.exponentialRampToValueAtTime(mf(83) * p, t + 0.45);
      const z2 = zarf(G.c, G.efekt, t + 0.24, 0.024, 0.02, 0.26); z2.connect(G.yanki);
      const o2 = osil(G.c, 'sine', mf(83) * p, t + 0.24, t + 0.55, z2); o2.frequency.exponentialRampToValueAtTime(mf(88) * p, t + 0.48);
    },
    gucTik(G, t, n) {                                      // çekerken güç kademesi: her kademe bir nota yukarı minik "tık"
      const c = G.c, m = [64, 67, 72, 79][Math.max(0, Math.min(3, n | 0))];
      const z = zarf(c, G.efekt, t, 0.13, 0.003, 0.16); osil(c, 'sine', mf(m), t, t + 0.2, z);
      const z2 = zarf(c, G.efekt, t, 0.05, 0.002, 0.05); osil(c, 'triangle', mf(m) * 2, t, t + 0.07, z2);
    },
    boyoyoy(G, t) {                                        // kısa çekiş: salıncak geri sallanır, sevimli "boyoyoy"
      const c = G.c, z = c.createGain();
      z.gain.setValueAtTime(0.0001, t); z.gain.linearRampToValueAtTime(0.2, t + 0.02);
      z.gain.setTargetAtTime(0.0001, t + 0.12, 0.22); z.connect(G.efekt);
      const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 1500; fl.connect(z);
      const o = osil(c, 'triangle', 330, t, t + 0.95, fl);
      o.frequency.exponentialRampToValueAtTime(230, t + 0.85);
      const v = c.createOscillator(), vg = c.createGain(); v.frequency.setValueAtTime(7, t); v.frequency.linearRampToValueAtTime(4.5, t + 0.85);
      vg.gain.setValueAtTime(70, t); vg.gain.exponentialRampToValueAtTime(8, t + 0.9);
      v.connect(vg); vg.connect(o.frequency); v.start(t); v.stop(t + 0.95);
    },
    tepe(G, t) {                                           // uçuşun tepe noktası: minik, havada asılı çıngırak
      const c = G.c;
      [[88, 0], [91, 0.06], [96, 0.12]].forEach(([m, dt]) => {
        const z = zarf(c, G.efekt, t + dt, 0.07, 0.003, 0.35); z.connect(G.yanki); osil(c, 'sine', mf(m), t + dt, t + dt + 0.4, z);
      });
    },
    pof(G, t) {                                            // çalıya/samana yumuşak "pof"
      const c = G.c;
      gurultuCal(c, G.efekt, t, 0.28, 'lowpass', 1300, 240, 0.6, 0.34, 0.008);
      gurultuCal(c, G.efekt, t + 0.03, 0.18, 'bandpass', 2600, 1500, 1.2, 0.12, 0.01);   // yaprak hışırtısı
      const z = zarf(c, G.efekt, t, 0.22, 0.006, 0.18); const o = osil(c, 'sine', 150, t, t + 0.22, z); o.frequency.exponentialRampToValueAtTime(80, t + 0.18);
    },
    yuvarlan(G, t) {                                       // ıska: çimende tombul, komik yuvarlanma (gittikçe sıklaşan yumuşak "dum"lar)
      const c = G.c; let b = t;
      for (let i = 0; i < 5; i++) {
        const g = 0.26 * Math.pow(0.78, i), z = zarf(c, G.efekt, b, g, 0.005, 0.12);
        const o = osil(c, 'sine', 170 - i * 12, b, b + 0.15, z); o.frequency.exponentialRampToValueAtTime(90 - i * 6, b + 0.12);
        gurultuCal(c, G.efekt, b, 0.1, 'bandpass', 1800, 900, 0.9, g * 0.35, 0.005);
        b += 0.17 - i * 0.022;
      }
      // "pıt-pıt!" diye duruş: yukarı kayan iki minik, şen ıslık (aşağı inen "üzgün" ton yok)
      [[0.02, 520, 820], [0.15, 660, 1040]].forEach(([dt, f1, f2]) => {
        const z = zarf(c, G.efekt, b + dt, 0.06, 0.008, 0.12); z.connect(G.yanki);
        const o = osil(c, 'sine', f1, b + dt, b + dt + 0.16, z); o.frequency.exponentialRampToValueAtTime(f2, b + dt + 0.1);
      });
    },
    pitir(G, t, n) {                                       // geri koşarken tek ayak sesi (pıtır)
      const c = G.c, f = (n | 0) % 2 ? 620 : 540, z = zarf(c, G.efekt, t, 0.06, 0.002, 0.05);
      const o = osil(c, 'sine', f, t, t + 0.07, z); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.05);
      gurultuCal(c, G.efekt, t, 0.03, 'bandpass', 2400, 1800, 1, 0.05, 0.002);
    },
    yildiz(G, t, n) {                                      // n = kaçıncı yıldız (1..5): her biri bir nota yukarı
      const c = G.c, siraN = Math.max(1, n || 1), m = BES[Math.min(5, siraN - 1)];
      [[m, 0.22, 0], [m + 12, 0.09, 0.0], [m + 7, 0.1, 0.07], [m + 12, 0.08, 0.14]].forEach(([mm, g, dt]) => {
        const z = zarf(c, G.efekt, t + dt, g, 0.004, 0.55); z.connect(G.yanki);
        osil(c, 'sine', mf(mm), t + dt, t + dt + 0.6, z);
        const z2 = zarf(c, G.efekt, t + dt, g * 0.25, 0.002, 0.18); osil(c, 'sine', mf(mm) * 2.76, t + dt, t + dt + 0.2, z2);   // çan pırıltısı
      });
      if (siraN >= 2) {                                    // seri büyüdükçe sıcak alt oktav + üst üçlü armonisi
        const zAlt = zarf(c, G.efekt, t, 0.045 * Math.min(1, siraN / 5), 0.01, 0.45);
        osil(c, 'triangle', mf(m - 12), t, t + 0.5, zAlt);
      }
      if (siraN >= 3) {
        const zUst = zarf(c, G.efekt, t + 0.11, 0.035, 0.005, 0.4); zUst.connect(G.yanki);
        osil(c, 'sine', mf(m + 16), t + 0.11, t + 0.55, zUst);
      }
      if (n >= 5) {                                        // 5. yıldız: temiz, tatlı bir pırıltı
        [79, 84, 88, 91].forEach((mm, i) => {
          const b = t + 0.2 + i * 0.075, z = zarf(c, G.efekt, b, 0.085, 0.004, 0.45); z.connect(G.yanki);
          osil(c, 'sine', mf(mm), b, b + 0.5, z);
        });
      }
    },
    mantar(G, t) {                                         // "boing": yaylı, sıcak harmonikli aşağı-yukarı kayan ton
      const c = G.c, z = zarf(c, G.efekt, t, 0.26, 0.005, 0.48); z.connect(G.yanki);
      const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 1800; fl.connect(z);
      const o = osil(c, 'triangle', 150, t, t + 0.55, fl);
      o.frequency.exponentialRampToValueAtTime(420, t + 0.12); o.frequency.exponentialRampToValueAtTime(260, t + 0.5);
      const v = c.createOscillator(), vg = c.createGain(); v.frequency.value = 18; vg.gain.value = 22; v.connect(vg); vg.connect(o.frequency); v.start(t); v.stop(t + 0.55);
      const zh = zarf(c, G.efekt, t, 0.09, 0.006, 0.34); zh.connect(G.yanki);
      const oh = osil(c, 'sine', 300, t, t + 0.4, zh);
      oh.frequency.exponentialRampToValueAtTime(840, t + 0.12); oh.frequency.exponentialRampToValueAtTime(520, t + 0.38);
      const zp = zarf(c, G.efekt, t, 0.12, 0.003, 0.08);
      const op = osil(c, 'sine', 115, t, t + 0.1, zp); op.frequency.exponentialRampToValueAtTime(72, t + 0.08);
    },
    bulut(G, t) {                                          // "puf": yumuşak hava
      gurultuCal(G.c, G.efekt, t, 0.42, 'lowpass', 1800, 300, 0.5, 0.36, 0.02);
      const z = zarf(G.c, G.efekt, t, 0.07, 0.03, 0.3); const o = osil(G.c, 'sine', 520, t, t + 0.35, z); o.frequency.exponentialRampToValueAtTime(330, t + 0.3);
    },
    nilufer(G, t) {                                        // su damlası + sıcak harmonikli yumuşak sekme
      const c = G.c, z = zarf(c, G.efekt, t, 0.22, 0.004, 0.28); z.connect(G.yanki);
      const o = osil(c, 'sine', 420, t, t + 0.3, z); o.frequency.exponentialRampToValueAtTime(880, t + 0.14);
      const zh = zarf(c, G.efekt, t + 0.045, 0.09, 0.004, 0.24); zh.connect(G.yanki);
      const oh = osil(c, 'sine', 630, t + 0.045, t + 0.3, zh); oh.frequency.exponentialRampToValueAtTime(1320, t + 0.18);
      const zy = zarf(c, G.efekt, t, 0.11, 0.003, 0.11);
      const oy = osil(c, 'sine', 210, t, t + 0.13, zy); oy.frequency.exponentialRampToValueAtTime(140, t + 0.1);
      gurultuCal(c, G.efekt, t, 0.18, 'bandpass', 1400, 600, 1.2, 0.15, 0.01);
    },
    halka(G, t, n) {                                       // parlak halka: pırıltılı geçiş (art arda halkalarda Do majör/pentatonik yükselir)
      const c = G.c, d = [0, 3, 5, 8][Math.max(0, Math.min(3, (n || 1) - 1))];
      [[76 + d, 0], [83 + d, 0.05], [88 + d, 0.1]].forEach(([m, dt]) => {
        const z = zarf(c, G.efekt, t + dt, 0.15, 0.004, 0.32); z.connect(G.yanki);
        osil(c, 'sine', mf(m), t + dt, t + dt + 0.35, z);
      });
    },
    dus(G, t) {                                            // çimene yumuşak düşme
      const c = G.c, z = zarf(c, G.efekt, t, 0.3, 0.006, 0.22);
      const o = osil(c, 'sine', 120, t, t + 0.25, z); o.frequency.exponentialRampToValueAtTime(60, t + 0.2);
      gurultuCal(c, G.efekt, t, 0.2, 'lowpass', 900, 250, 0.6, 0.25, 0.005);
    },
    hav(G, t) {                                            // Bilbo: sevinçli, sevimli sentetik "hav hav HAV" (her biri biraz daha tiz)
      const c = G.c;
      for (let i = 0; i < 3; i++) {
        const b = t + i * 0.2, k = 1 + i * 0.08, z = zarf(c, G.efekt, b, i === 2 ? 0.32 : 0.26, 0.012, i === 2 ? 0.17 : 0.12);
        const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 950 * k; f.Q.value = 2.2; f.connect(z);
        const o = osil(c, 'sawtooth', 500 * k, b, b + 0.2, f);
        o.frequency.linearRampToValueAtTime(600 * k, b + 0.03); o.frequency.exponentialRampToValueAtTime(340 * k, b + 0.15);
        const s = c.createGain(); s.gain.value = 0.6; s.connect(z);
        const o2 = osil(c, 'sine', 580 * k, b, b + 0.2, s); o2.frequency.exponentialRampToValueAtTime(390 * k, b + 0.15);
      }
    },
    kanatBos(G, t) {                                       // kanat hakkı bitmişken dokunuş: minik, tatlı "pıt" (ceza değil)
      const c = G.c;
      gurultuCal(c, G.efekt, t, 0.07, 'lowpass', 900, 300, 0.6, 0.24, 0.006);
      const z = zarf(c, G.efekt, t, 0.1, 0.004, 0.09); z.connect(G.yanki);
      const o = osil(c, 'sine', 880, t, t + 0.11, z); o.frequency.exponentialRampToValueAtTime(1180, t + 0.06);
    },
    esinti(G, t) {                                         // rüzgâra girince: yumuşak, yükselip alçalan "fşşuu" hışırtısı + minik yukarı ıslık
      const c = G.c, s = c.createBufferSource(); s.buffer = gurultu(c);
      const fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = 1.1;
      fl.frequency.setValueAtTime(500, t); fl.frequency.exponentialRampToValueAtTime(1700, t + 0.35); fl.frequency.exponentialRampToValueAtTime(800, t + 0.8);
      const z = c.createGain(); z.gain.setValueAtTime(0.0001, t); z.gain.linearRampToValueAtTime(0.32, t + 0.22);
      z.gain.exponentialRampToValueAtTime(0.0001, t + 0.85); z.connect(G.efekt);
      s.connect(fl); fl.connect(z); s.start(t, Math.random()); s.stop(t + 0.9);
      const zo = zarf(c, G.efekt, t + 0.1, 0.045, 0.08, 0.4); zo.connect(G.yanki);
      const o = osil(c, 'sine', mf(79), t + 0.1, t + 0.6, zo); o.frequency.exponentialRampToValueAtTime(mf(86), t + 0.5);
    },
    // ---- 2. tur ----
    baloncuk(G, t) {                                       // baloncuğa değince: tatlı "blup-pıt" + yukarı kayan üç nota
      const c = G.c;
      const zb = zarf(c, G.efekt, t, 0.26, 0.004, 0.12);
      const ob = osil(c, 'sine', 260, t, t + 0.14, zb); ob.frequency.exponentialRampToValueAtTime(820, t + 0.09);
      gurultuCal(c, G.efekt, t + 0.07, 0.05, 'bandpass', 3200, 2200, 1.4, 0.1, 0.002);   // "pıt" patlama
      [[72, 0.1], [76, 0.17], [84, 0.24]].forEach(([m, dt], i) => {
        const z = zarf(c, G.efekt, t + dt, 0.11 - i * 0.015, 0.005, 0.4); z.connect(G.yanki);
        const o = osil(c, 'sine', mf(m - 2), t + dt, t + dt + 0.45, z); o.frequency.exponentialRampToValueAtTime(mf(m), t + dt + 0.06);
      });
    },
    vuus(G, t) {                                           // esinti şeridine girince: geniş, yumuşak "vuuş" (ıslıksız, alçak)
      const c = G.c, s = c.createBufferSource(); s.buffer = gurultu(c);
      const fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = 0.7;
      fl.frequency.setValueAtTime(260, t); fl.frequency.exponentialRampToValueAtTime(1100, t + 0.4); fl.frequency.exponentialRampToValueAtTime(420, t + 1.0);
      const z = c.createGain(); z.gain.setValueAtTime(0.0001, t); z.gain.linearRampToValueAtTime(0.24, t + 0.3);
      z.gain.exponentialRampToValueAtTime(0.0001, t + 1.05); z.connect(G.efekt);
      s.connect(fl); fl.connect(z); s.start(t, Math.random()); s.stop(t + 1.1);
      const zo = zarf(c, G.efekt, t + 0.15, 0.03, 0.12, 0.45); zo.connect(G.yanki);
      const o = osil(c, 'sine', mf(67), t + 0.15, t + 0.75, zo); o.frequency.exponentialRampToValueAtTime(mf(74), t + 0.6);
    },
    // zemine göre iniş/yuvarlanma dokusu (k: 1 iniş, ~0.5 yuvarlanma sekmesi)
    zemin(G, t, v) {
      const c = G.c, tur = v && v.tur, k = (v && v.k) || 1;
      if (tur === 'kar') {                                 // hışır-puf
        gurultuCal(c, G.efekt, t, 0.26, 'lowpass', 2200, 380, 0.5, 0.3 * k, 0.01);
        gurultuCal(c, G.efekt, t, 0.09, 'bandpass', 5200, 3600, 1.2, 0.07 * k, 0.004);
        const z = zarf(c, G.efekt, t, 0.12 * k, 0.008, 0.16); const o = osil(c, 'sine', 140, t, t + 0.2, z); o.frequency.exponentialRampToValueAtTime(75, t + 0.16);
      } else if (tur === 'buz') {                          // cam gibi kayma tınısı
        const z = zarf(c, G.efekt, t, 0.07 * k, 0.006, 0.55); z.connect(G.yanki);
        const o = osil(c, 'sine', 1500, t, t + 0.6, z); o.frequency.exponentialRampToValueAtTime(2300, t + 0.45);
        const z2 = zarf(c, G.efekt, t + 0.03, 0.025 * k, 0.004, 0.4); z2.connect(G.yanki);
        const o2 = osil(c, 'sine', 1500 * 2.76, t + 0.03, t + 0.45, z2); o2.frequency.exponentialRampToValueAtTime(2300 * 2.76, t + 0.4);
        gurultuCal(c, G.efekt, t, 0.35, 'highpass', 4500, 6500, 0.7, 0.05 * k, 0.02);
        const zt = zarf(c, G.efekt, t, 0.12 * k, 0.005, 0.1); osil(c, 'sine', 120, t, t + 0.12, zt);
      } else if (tur === 'kum') {                          // yumuşak hışırtı
        gurultuCal(c, G.efekt, t, 0.32, 'bandpass', 3000, 1300, 0.8, 0.18 * k, 0.012);
        const z = zarf(c, G.efekt, t, 0.16 * k, 0.006, 0.16); const o = osil(c, 'sine', 110, t, t + 0.2, z); o.frequency.exponentialRampToValueAtTime(65, t + 0.16);
      } else if (tur === 'islak') {                        // şap/şıp
        gurultuCal(c, G.efekt, t, 0.08, 'bandpass', 1400, 900, 1.1, 0.24 * k, 0.003);
        [[0.02, 600, 1500, 0.09], [0.11, 800, 1900, 0.06]].forEach(([dt, f1, f2, g]) => {
          const z = zarf(c, G.efekt, t + dt, g * k, 0.003, 0.08); z.connect(G.yanki);
          const o = osil(c, 'sine', f1, t + dt, t + dt + 0.1, z); o.frequency.exponentialRampToValueAtTime(f2, t + dt + 0.06);
        });
        const zt = zarf(c, G.efekt, t, 0.14 * k, 0.005, 0.12); const ot = osil(c, 'sine', 130, t, t + 0.14, zt); ot.frequency.exponentialRampToValueAtTime(70, t + 0.12);
      } else if (tur === 'seker') {                        // çıtır çıtır + minik tatlı tın
        for (let i = 0; i < 5; i++) gurultuCal(c, G.efekt, t + i * 0.028 + (i % 2) * 0.008, 0.018, 'highpass', 3800, 5200, 0.8, (0.2 - i * 0.022) * k, 0.001);
        const z = zarf(c, G.efekt, t + 0.04, 0.08 * k, 0.003, 0.25); z.connect(G.yanki); osil(c, 'sine', mf(88), t + 0.04, t + 0.3, z);
        const zt = zarf(c, G.efekt, t, 0.16 * k, 0.005, 0.1); osil(c, 'sine', 150, t, t + 0.12, zt);
      } else if (tur === 'ay') {                           // boğuk, yavaş "pof" (toz bulutu)
        gurultuCal(c, G.efekt, t, 0.6, 'lowpass', 520, 140, 0.5, 0.3 * k, 0.05);
        const z = zarf(c, G.efekt, t, 0.16 * k, 0.04, 0.5); const o = osil(c, 'sine', 92, t, t + 0.6, z); o.frequency.exponentialRampToValueAtTime(52, t + 0.5);
      } else if (tur === 'bulut') {                        // pamuk puf
        gurultuCal(c, G.efekt, t, 0.45, 'lowpass', 1500, 260, 0.5, 0.3 * k, 0.03);
        const z = zarf(c, G.efekt, t, 0.05 * k, 0.04, 0.3); const o = osil(c, 'sine', 600, t, t + 0.36, z); o.frequency.exponentialRampToValueAtTime(400, t + 0.3);
      } else return false;
      return true;
    },
    hazirTin(G, t) {                                       // erken dokunuş sıraya alındı: çok kısa, yumuşak "hazır" tınısı
      const c = G.c;
      [[84, 0], [91, 0.05]].forEach(([m, dt]) => {
        const z = zarf(c, G.efekt, t + dt, 0.075, 0.004, 0.16); z.connect(G.yanki); osil(c, 'sine', mf(m), t + dt, t + dt + 0.2, z);
      });
    },
    bilboKos(G, t, v) {                                    // Bilbo koşuyor: 2 neşeli kısa havlama + pıtır pıtır adımlar (zemine göre)
      const c = G.c, sure = Math.max(0.5, Math.min(1.6, (v && v.sure) || 1)), zt = v && v.zemin;
      for (let i = 0; i < 2; i++) {                        // minik, tiz "hav-hav" (kavuşmadaki büyük havlamadan küçük)
        const b = t + 0.05 + i * 0.17, k = 1.12 + i * 0.06, z = zarf(c, G.efekt, b, 0.17, 0.01, 0.1);
        const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1000 * k; f.Q.value = 2.2; f.connect(z);
        const o = osil(c, 'sawtooth', 520 * k, b, b + 0.16, f); o.frequency.linearRampToValueAtTime(620 * k, b + 0.03); o.frequency.exponentialRampToValueAtTime(360 * k, b + 0.12);
        const s = c.createGain(); s.gain.value = 0.6; s.connect(z);
        const o2 = osil(c, 'sine', 600 * k, b, b + 0.16, s); o2.frequency.exponentialRampToValueAtTime(400 * k, b + 0.12);
      }
      for (let b = t + 0.08, n = 0; b < t + sure - 0.05; b += 0.11, n++) {   // pıtır pıtır (kavuşmadan önce biter)
        const f = n % 2 ? 640 : 560, z = zarf(c, G.efekt, b, 0.05, 0.002, 0.045);
        const o = osil(c, 'sine', f, b, b + 0.06, z); o.frequency.exponentialRampToValueAtTime(f * 0.6, b + 0.045);
        if (zt === 'kar') gurultuCal(c, G.efekt, b, 0.06, 'lowpass', 2400, 600, 0.5, 0.07, 0.004);
        else if (zt === 'kum') gurultuCal(c, G.efekt, b, 0.06, 'bandpass', 2800, 1500, 0.8, 0.05, 0.004);
        else if (zt === 'islak') { const zs = zarf(c, G.efekt, b, 0.03, 0.002, 0.04); const os = osil(c, 'sine', 900, b, b + 0.05, zs); os.frequency.exponentialRampToValueAtTime(1700, b + 0.035); }
        else if (zt === 'buz') { const zs = zarf(c, G.efekt, b, 0.015, 0.002, 0.08); osil(c, 'sine', 2400 + (n % 3) * 200, b, b + 0.1, zs); }
        else gurultuCal(c, G.efekt, b, 0.03, 'bandpass', 2200, 1600, 1, 0.035, 0.002);
      }
    },
    gokkusagi(G, t) {                                      // tek atışta 5 yıldız: kısa, parlak, şenlikli "gökkuşağı" fanfarı
      const c = G.c;
      [72, 74, 76, 79, 81, 84, 88].forEach((m, i) => {    // yedi renk: hızlı yükselen pırıltılı merdiven
        const b = t + i * 0.055, z = zarf(c, G.efekt, b, 0.075, 0.003, 0.4); z.connect(G.yanki);
        osil(c, 'sine', mf(m + 12), b, b + 0.45, z);
        const z2 = zarf(c, G.efekt, b, 0.012, 0.002, 0.15); osil(c, 'sine', mf(m + 12) * 2.76, b, b + 0.17, z2);
      });
      const ta = t + 0.42;
      [84, 88, 91, 96].forEach((m, i) => {                 // parlak akor + çan
        const b = ta + i * 0.01, z = zarf(c, G.efekt, b, 0.05, 0.005, 0.9); z.connect(G.yanki); osil(c, 'sine', mf(m), b, b + 1, z);
      });
      [100, 96, 103, 98, 105].forEach((m, i) => {          // serpilen pırıltı
        const b = ta + 0.12 + i * 0.07, z = zarf(c, G.efekt, b, 0.03, 0.002, 0.3); z.connect(G.yanki); osil(c, 'sine', mf(m), b, b + 0.35, z);
      });
    },
    gok(G, t, guc) {                                       // uzak, tatlı "gurul gurul": yavaş açılan, yuvarlanan alçak dalgalar (çatırtı yok)
      // düzey ölçüldü: en güçlüsünde bile tepe ≈ müziğin tepesi (-18 dB), ortalama müziğin ortalamasını geçmez
      const c = G.c, k = 0.34 * (0.55 + 0.45 * Math.max(0, Math.min(1, guc == null ? 0.7 : guc)));
      const s = c.createBufferSource(); s.buffer = gurultu(c);
      const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 0.4;
      fl.frequency.setValueAtTime(220, t); fl.frequency.exponentialRampToValueAtTime(110, t + 2.6);
      const fl2 = c.createBiquadFilter(); fl2.type = 'lowpass'; fl2.frequency.value = 260;
      const z = c.createGain(); z.gain.setValueAtTime(0.0001, t);
      // üç yumuşak tümsek: gurul ... gurul ... gurrr
      z.gain.linearRampToValueAtTime(0.42 * k, t + 0.35); z.gain.linearRampToValueAtTime(0.22 * k, t + 0.75);
      z.gain.linearRampToValueAtTime(0.5 * k, t + 1.1); z.gain.linearRampToValueAtTime(0.24 * k, t + 1.6);
      z.gain.linearRampToValueAtTime(0.34 * k, t + 1.95); z.gain.exponentialRampToValueAtTime(0.0001, t + 3.4);
      s.connect(fl); fl.connect(fl2); fl2.connect(z); z.connect(G.ortam || G.efekt);
      s.start(t, Math.random()); s.stop(t + 3.5);
      const zo = c.createGain(); zo.gain.setValueAtTime(0.0001, t);   // altta tok bir sinüs dalgası
      zo.gain.linearRampToValueAtTime(0.06 * k, t + 0.5); zo.gain.linearRampToValueAtTime(0.03 * k, t + 0.9);
      zo.gain.linearRampToValueAtTime(0.065 * k, t + 1.2); zo.gain.exponentialRampToValueAtTime(0.0001, t + 3.0);
      zo.connect(G.ortam || G.efekt);
      const o = osil(c, 'sine', 58, t, t + 3.1, zo); o.frequency.linearRampToValueAtTime(46, t + 3.0);
    },
    gunes(G, t) {                                          // fırtına dindi: kısa, neşeli "güneş açtı" pırıltısı
      const c = G.c;
      [72, 76, 79, 84, 88].forEach((m, i) => {
        const b = t + i * 0.085, z = zarf(c, G.efekt, b, 0.07, 0.004, 0.6); z.connect(G.yanki);
        osil(c, 'sine', mf(m), b, b + 0.65, z);
        const z2 = zarf(c, G.efekt, b, 0.018, 0.002, 0.2); osil(c, 'sine', mf(m) * 2.76, b, b + 0.22, z2);
      });
      yayli(G, G.efekt, t + 0.1, 60, 1.1, 0.008); yayli(G, G.efekt, t + 0.1, 64, 1.1, 0.007);
    },
    final(G, t) {                                          // son bölüm bitti: neşeli fanfar (Do majör arpej + parlak akor + çan yağmuru)
      const c = G.c;
      [[60, 0], [64, 0.11], [67, 0.22], [72, 0.33]].forEach(([m, dt]) => {
        const z = zarf(c, G.efekt, t + dt, 0.11, 0.006, 0.35); z.connect(G.yanki);
        const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 2200; fl.connect(z);
        osil(c, 'triangle', mf(m + 12), t + dt, t + dt + 0.4, fl);
      });
      const ta = t + 0.46;
      [72, 76, 79, 84].forEach((m, i) => {                 // tutulan parlak akor (yumuşak yaylı + çan)
        yayli(G, G.efekt, ta, m - 12, 1.3, 0.009);
        const b = ta + i * 0.012, z = zarf(c, G.efekt, b, 0.065, 0.006, 1.2); z.connect(G.yanki); osil(c, 'sine', mf(m), b, b + 1.3, z);
      });
      bas(G, G.efekt, ta, 48, 0.1);
      [96, 91, 88, 84, 88, 91, 96, 100].forEach((m, i) => { // çan yağmuru
        const b = ta + 0.25 + i * 0.09, z = zarf(c, G.efekt, b, 0.04, 0.003, 0.4); z.connect(G.yanki); osil(c, 'sine', mf(m), b, b + 0.45, z);
      });
    },
    kavus(G, t) {                                          // sıcak, sade, masalsı 3 notalı yumuşak kavuşma çanı
      const c = G.c;
      [[72, 0, 0.45], [76, 0.14, 0.45], [84, 0.28, 0.9]].forEach(([m, dt, d], i) => {
        const son = i === 2, z = zarf(c, G.efekt, t + dt, son ? 0.16 : 0.13, 0.006, d); z.connect(G.yanki);
        osil(c, 'sine', mf(m), t + dt, t + dt + d + 0.1, z);
        const z2 = zarf(c, G.efekt, t + dt, 0.035, 0.004, d * 0.6); z2.connect(G.yanki);
        osil(c, 'sine', mf(m + 12), t + dt, t + dt + d * 0.7, z2);
      });
    }
  };

  // sürekli sesler (çekme gerilimi, uçuş rüzgârı): her biri tek düğüm; yalnız ayar değişir
  // çekme: tek sürekli "gerilen lastik" sesi; güçle perdesi bir oktavdan fazla, parlaklığı ve düzeyi belirgin artar.
  // tam güçte üstüne hafif titreşen parlak bir ton eklenir (çocuk "en çok bu kadar" olduğunu kulaktan anlar).
  function cekBaslat(G, t) {
    const c = G.c, n = { g: c.createGain(), f: c.createBiquadFilter(), tam: c.createGain() };
    n.g.gain.setValueAtTime(0.0001, t); n.f.type = 'lowpass'; n.f.frequency.value = 800; n.f.Q.value = 2;
    n.o1 = c.createOscillator(); n.o1.type = 'triangle'; n.o2 = c.createOscillator(); n.o2.type = 'sine';
    n.o1.frequency.value = 180; n.o2.frequency.value = 270.7;
    n.o1.connect(n.f); n.o2.connect(n.f); n.f.connect(n.g); n.g.connect(G.efekt);
    // tam güç katmanı: iki oktav yukarıda sinüs, 7 Hz titreşim (perde + düzey)
    n.o3 = c.createOscillator(); n.o3.type = 'sine'; n.o3.frequency.value = 720;
    n.lfo = c.createOscillator(); n.lfo.frequency.value = 7; n.lfoP = c.createGain(); n.lfoP.gain.value = 14;
    n.lfoG = c.createGain(); n.lfoG.gain.value = 0;
    n.lfo.connect(n.lfoP); n.lfoP.connect(n.o3.frequency); n.lfo.connect(n.lfoG); n.lfoG.connect(n.tam.gain);
    n.tam.gain.setValueAtTime(0, t); n.o3.connect(n.tam); n.tam.connect(G.efekt);
    n.o1.start(t); n.o2.start(t); n.o3.start(t); n.lfo.start(t); return n;
  }
  function cekAyar(n, t, guc, tamMi) {
    const g = Math.max(0, Math.min(1, guc || 0)), f = 175 * Math.pow(2, g * 1.25);   // 175 → ~415 Hz
    n.o1.frequency.setTargetAtTime(f, t, 0.04);
    n.o2.frequency.setTargetAtTime(f * 1.504, t, 0.04);
    n.o3.frequency.setTargetAtTime(f * 4, t, 0.04);
    n.f.frequency.setTargetAtTime(600 + g * g * 2400, t, 0.05);
    n.g.gain.setTargetAtTime(g < 0.02 ? 0.012 : 0.02 + g * 0.09, t, 0.05);
    const tam = (tamMi != null ? tamMi : g >= 0.96) ? 0.032 : 0;
    n.tam.gain.setTargetAtTime(tam, t, 0.06); n.lfoG.gain.setTargetAtTime(tam * 0.5, t, 0.06);
  }
  function cekBitir(n, t) {
    n.g.gain.cancelScheduledValues(t); n.g.gain.setTargetAtTime(0.0001, t, 0.04);
    n.tam.gain.cancelScheduledValues(t); n.tam.gain.setTargetAtTime(0, t, 0.03);
    n.lfoG.gain.cancelScheduledValues(t); n.lfoG.gain.setTargetAtTime(0, t, 0.03);
    [n.o1, n.o2, n.o3, n.lfo].forEach(o => o.stop(t + 0.3));
  }
  // müzikte çekme gerilimi: tek uzun, yumuşak yaylı nota (Sol), güçle hafifçe açılır
  function gerilimBaslat(G, hedef, t) {
    const c = G.c, n = { g: c.createGain(), f: c.createBiquadFilter() };
    n.f.type = 'lowpass'; n.f.frequency.value = 700; n.g.gain.setValueAtTime(0.0001, t); n.g.gain.linearRampToValueAtTime(0.03, t + 0.5);
    n.f.connect(n.g); n.g.connect(hedef);
    n.o = [55, 67].map((m, i) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mf(m); o.detune.value = i ? 5 : -5; o.connect(n.f); o.start(t); return o; });
    return n;
  }
  function gerilimAyar(n, t, guc) { const g = Math.max(0, Math.min(1, guc || 0)); n.f.frequency.setTargetAtTime(600 + g * 900, t, 0.1); n.g.gain.setTargetAtTime(0.025 + g * 0.025, t, 0.15); }
  function gerilimBitir(n, t) { n.g.gain.cancelScheduledValues(t); n.g.gain.setTargetAtTime(0.0001, t, 0.12); n.o.forEach(o => o.stop(t + 0.9)); }
  // iniş yaklaşırken (Bilbo'ya doğru alçalırken) hafif, yükselen beklenti tonu
  function beklentiBaslat(G, t) {
    const c = G.c, n = { g: c.createGain(), o: c.createOscillator(), tr: c.createOscillator(), trg: c.createGain() };
    n.g.gain.setValueAtTime(0, t); n.o.type = 'sine'; n.o.frequency.value = mf(76);
    n.tr.frequency.value = 9; n.trg.gain.value = 0; n.tr.connect(n.trg); n.trg.connect(n.g.gain);
    n.o.connect(n.g); n.g.connect(G.efekt); n.g.connect(G.yanki); n.o.start(t); n.tr.start(t); return n;
  }
  function beklentiAyar(n, t, k) {   // k: 0 (uzak) → 1 (çok yakın)
    const g = 0.03 * k; n.g.gain.setTargetAtTime(g, t, 0.12); n.trg.gain.setTargetAtTime(g * 0.4, t, 0.12);
    n.o.frequency.setTargetAtTime(mf(76) * Math.pow(2, k * 7 / 12), t, 0.1);
  }
  function beklentiBitir(n, t) { n.g.gain.cancelScheduledValues(t); n.g.gain.setTargetAtTime(0, t, 0.06); n.trg.gain.setTargetAtTime(0, t, 0.06); n.o.stop(t + 0.5); n.tr.stop(t + 0.5); }
  function ruzgarBaslat(G, t) {
    const c = G.c, n = { s: c.createBufferSource(), f: c.createBiquadFilter(), g: c.createGain() };
    n.s.buffer = gurultu(c); n.s.loop = true; n.f.type = 'bandpass'; n.f.Q.value = 0.8; n.f.frequency.value = 700;
    n.g.gain.setValueAtTime(0.0001, t); n.s.connect(n.f); n.f.connect(n.g); n.g.connect(G.efekt); n.s.start(t); return n;
  }
  function ruzgarAyar(n, t, hiz) { const k = Math.max(0, Math.min(1, hiz / 22)); n.g.gain.setTargetAtTime(0.02 + k * 0.1, t, 0.15); n.f.frequency.setTargetAtTime(450 + k * 900, t, 0.15); }
  function ruzgarBitir(n, t) { n.g.gain.cancelScheduledValues(t); n.g.gain.setTargetAtTime(0.0001, t, 0.12); n.s.stop(t + 0.8); }

  // ---------------- ortam sesleri (bölümün `hava`sına göre; döngüsel, alçak, müziğin altında) ----------------
  // Her ortam: döngüsel gürültü katmanları (süzgeç + yavaş dalgalanma) + seyrek, minik olaylar (damla, pırıltı, bambu tıkırtısı).
  const ORTAM_TUR = {
    yagmur: 'yagmur', gunesliyagmur: 'hafifyagmur', firtina: 'firtina', kar: 'kar', karhafif: 'kar', yaprak: 'yaprak',
    kum: 'kum', sis: 'sis', cicek: 'buyu', isilti: 'buyu', seker: 'buyu', yildiztozu: 'yildiz'
  };
  function ortamSec(b) {
    if (!b || typeof b !== 'object') return null;
    const by = b.biyom | 0;
    if (by === 39 || by === 43) return 'dalga';             // sualtı ve deniz feneri: dalgalar
    const h = typeof b.hava === 'string' && ORTAM_TUR[b.hava];
    if (h) return h;
    if (b.zeminTur === 'kum') return 'dalga';              // kumsal: hava yok ama dalgalar var
    if (b.zeminTur === 'bulut') return 'yuksek';           // bulutların üstü: yüksekte ince esinti
    return null;
  }
  const beyazlar = new WeakMap();
  function beyaz(c) {                                      // bağlam başına bir kez: 3 sn beyaz gürültü (yağmur hışırtısı için parlak)
    let b = beyazlar.get(c);
    if (b) return b;
    b = c.createBuffer(1, c.sampleRate * 3, c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    beyazlar.set(c, b); return b;
  }
  // döngüsel katman: kaynak → süzgeç → düzey (+ isteğe bağlı yavaş düzey/süzgeç dalgası)
  function katman(n, buf, fTur, f, q, g, lfoHz, lfoDerin, fDerin) {
    const c = n.c, s = c.createBufferSource(), fl = c.createBiquadFilter(), z = c.createGain();
    s.buffer = buf; s.loop = true; fl.type = fTur; fl.frequency.value = f; fl.Q.value = q; z.gain.value = g;
    s.connect(fl); fl.connect(z); z.connect(n.g); s.start(n.t0, Math.random() * 2); n.kaynak.push(s);
    if (lfoHz) {
      const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = lfoHz; lg.gain.value = g * (lfoDerin || 0);
      l.connect(lg); lg.connect(z.gain);
      if (fDerin) { const lf = c.createGain(); lf.gain.value = fDerin; l.connect(lf); lf.connect(fl.frequency); }
      l.start(n.t0); n.kaynak.push(l);
    }
  }
  // ortam düzeyleri çevrimdışı ölçüldü: müziğin ortalamasından (≈ -33 dB) 8–12 dB aşağıda kalsın diye
  const ORTAM_DUZEY = { yagmur: 0.36, hafifyagmur: 0.36, firtina: 0.2, kar: 0.36, yaprak: 0.4, kum: 0.25, sis: 0.38, buyu: 1, yildiz: 0.36, dalga: 0.24, yuksek: 0.4 };
  function ortamKur(G, tur, t, sure) {
    const c = G.c, n = { c, tur, t0: t, g: c.createGain(), kaynak: [], sonraki: t + 0.6, duzey: ORTAM_DUZEY[tur] || 0.4 };
    n.g.gain.setValueAtTime(0.0001, t); n.g.gain.linearRampToValueAtTime(ORTAM_DUZEY[tur] || 0.4, t + (sure == null ? 0.8 : sure));
    n.g.connect(G.ortam || G.efekt);
    const B = beyaz(c), P_ = gurultu(c);
    if (tur === 'yagmur' || tur === 'hafifyagmur' || tur === 'firtina') {
      const k = tur === 'firtina' ? 1.35 : tur === 'hafifyagmur' ? 0.6 : 1;
      katman(n, B, 'bandpass', 3600, 0.55, 0.05 * k, 0.11, 0.25);           // ince yağmur hışırtısı
      katman(n, B, 'bandpass', 1100, 0.7, 0.03 * k, 0.07, 0.3);             // gövde
      if (tur === 'firtina') katman(n, P_, 'bandpass', 380, 1.1, 0.13, 0.065, 0.55, 140);   // alçak, dalgalanan rüzgâr uğultusu
    } else if (tur === 'kar') {
      katman(n, P_, 'bandpass', 620, 0.8, 0.05, 0.08, 0.6, 120);            // pamuk gibi, çok hafif rüzgâr
    } else if (tur === 'yaprak') {
      katman(n, B, 'bandpass', 2600, 1.1, 0.026, 0.16, 0.75);               // hışırtılı esinti (esintiyle kabarır)
      katman(n, P_, 'lowpass', 420, 0.5, 0.05, 0.1, 0.5);
    } else if (tur === 'kum') {
      katman(n, P_, 'lowpass', 330, 0.6, 0.09, 0.06, 0.5);                  // sıcak, alçak esinti
      katman(n, B, 'bandpass', 2100, 1, 0.006, 0.06, 0.6);                  // uçuşan kum taneleri
    } else if (tur === 'sis') {
      katman(n, P_, 'lowpass', 460, 0.5, 0.035, 0.05, 0.4);                 // sakin, uzak hava
    } else if (tur === 'buyu' || tur === 'yildiz') {
      katman(n, B, 'highpass', 7200, 0.5, 0.0035, 0.09, 0.6);               // çok ince ışıltı
      if (tur === 'yildiz') {                                              // uzayda yumuşak, derin bir tını
        [48, 55].forEach((m, i) => {
          const z = c.createGain(); z.gain.value = 0.012; z.connect(n.g);
          const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = mf(m); o.detune.value = i ? 4 : -4; o.connect(z); o.start(t); n.kaynak.push(o);
          const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 0.07 + i * 0.03; lg.gain.value = 0.008; l.connect(lg); lg.connect(z.gain); l.start(t); n.kaynak.push(l);
        });
      }
    } else if (tur === 'dalga') {
      katman(n, P_, 'lowpass', 650, 0.5, 0.075, 0.12, 0.85, 220);           // yavaş kabarıp çekilen dalga
      katman(n, B, 'bandpass', 2600, 0.7, 0.012, 0.12, 0.9);                // köpük
    } else if (tur === 'yuksek') {
      katman(n, P_, 'bandpass', 900, 0.6, 0.04, 0.1, 0.6, 200);
    }
    return n;
  }
  function ortamBitir(n, t, sure) {
    const s = sure == null ? 0.8 : sure;
    n.g.gain.cancelScheduledValues(t); n.g.gain.setValueAtTime(Math.max(0.0001, n.g.gain.value), t);
    n.g.gain.linearRampToValueAtTime(0.0001, t + s);
    n.kaynak.forEach(k => { try { k.stop(t + s + 0.1); } catch (_) {} });
    n.bitti = true;
  }
  // seyrek ortam olayları (zamanla() her 50 ms'de çağırır; olaylar ortamın kendi düzeyinden geçer, onunla söner)
  const PENTA = [84, 86, 88, 91, 93, 96, 98, 100];
  const rnd = (a, b) => a + Math.random() * (b - a);
  function ortamOlay(G, n, t) {
    if (!n || n.bitti || t < n.sonraki) return;
    const c = G.c, h = n.g, b = t + 0.02, tur = n.tur;
    const damla = (bb, g) => {                             // minik "pıt"
      const f = rnd(1700, 3000), z = zarf(c, h, bb, g, 0.002, 0.05);
      const o = osil(c, 'sine', f, bb, bb + 0.07, z); o.frequency.exponentialRampToValueAtTime(f * 1.5, bb + 0.04);
    };
    const pirilti = (bb, g, kac, d) => {                   // 2-4 notalı kristal pırıltı
      let m = PENTA[(Math.random() * 4) | 0];
      for (let i = 0; i < kac; i++) {
        const tt = bb + i * rnd(0.07, 0.12), z = zarf(c, h, tt, g * (1 - i * 0.15), 0.003, d); z.connect(G.yanki);
        osil(c, 'sine', mf(m), tt, tt + d + 0.05, z);
        m = PENTA[Math.min(PENTA.length - 1, PENTA.indexOf(m) + 1 + ((Math.random() * 2) | 0))];
      }
    };
    if (tur === 'yagmur' || tur === 'firtina') { damla(b, tur === 'firtina' ? 0.022 : 0.018); n.sonraki = t + rnd(0.15, 0.5); }
    else if (tur === 'hafifyagmur') {
      if (Math.random() < 0.18) pirilti(b, 0.012, 3, 0.45); else damla(b, 0.014);
      n.sonraki = t + rnd(0.35, 0.9);
    } else if (tur === 'kar') { pirilti(b, 0.011, 2 + ((Math.random() * 2) | 0), 0.35); n.sonraki = t + rnd(2.5, 5.5); }
    else if (tur === 'yaprak') {                           // kuru yaprak çıtırtısı
      for (let i = 0; i < 3; i++) gurultuCal(c, h, b + i * rnd(0.03, 0.07), 0.04, 'bandpass', rnd(2800, 4200), 2400, 1.5, 0.05, 0.003);
      n.sonraki = t + rnd(1.2, 3.2);
    } else if (tur === 'sis') {
      if (Math.random() < 0.7) {                           // uzak bambu tıkırtısı: tok-tok(-tok)
        const f = rnd(560, 760), kac = 2 + ((Math.random() * 2) | 0);
        for (let i = 0; i < kac; i++) {
          const tt = b + i * rnd(0.13, 0.2), ff = f * Math.pow(0.93, i), z = zarf(c, h, tt, 0.032, 0.002, 0.12); z.connect(G.yanki);
          osil(c, 'sine', ff, tt, tt + 0.14, z);
          const z2 = zarf(c, h, tt, 0.01, 0.001, 0.05); osil(c, 'sine', ff * 2.3, tt, tt + 0.07, z2);
        }
      } else { const z = zarf(c, h, b, 0.02, 0.003, 0.18); z.connect(G.yanki); const o = osil(c, 'sine', 900, b, b + 0.2, z); o.frequency.exponentialRampToValueAtTime(1500, b + 0.08); }
      n.sonraki = t + rnd(2.5, 6);
    } else if (tur === 'buyu') { pirilti(b, 0.016, 2 + ((Math.random() * 3) | 0), 0.55); n.sonraki = t + rnd(1.4, 3.8); }
    else if (tur === 'yildiz') { pirilti(b, 0.013, 2 + ((Math.random() * 2) | 0), 1.1); n.sonraki = t + rnd(2.2, 5); }
    else n.sonraki = t + 60;
  }

  // ---------------- müzik ----------------
  // Do majör, 8 ölçü döngü (4/4, sekizlik adımlar). Ezgi: harf = nota, '-' uzat, '.' sus.
  const NOTA = { g: 67, a: 69, b: 71, c: 72, d: 74, e: 76, f: 77, G: 79, A: 81, C: 84 };
  const AKOR = { C: [48, [60, 64, 67]], Am: [45, [57, 60, 64]], F: [41, [57, 60, 65]], G: [43, [59, 62, 67]], Em: [40, [55, 59, 64]], Dm: [50, [57, 62, 65]] };
  const DIZI = ['C', 'Am', 'F', 'G', 'C', 'Em', 'F', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'C'];
  const MEL = [
    'e-g-c---', 'e-d-c-a-', 'c---a-c-', 'd---..b-', 'e-g-G---', 'g-e-d-e-', 'f-e-d-c-', 'd-----..',
    'a-c-e---', 'f-e-c-a-', 'g-e-c-e-', 'd---b---', 'c-d-f-a-', 'g-f-e-d-', 'c-e-d-b-', 'c-----..'
  ];
  const SEVINC = ['c-e-g-C-', 'A-G-C---'];                // kavuşmada kısa sevinç cümlesi
  const BPM = 88, ADIM = 60 / BPM / 2;

  function kalimba(G, hedef, t, m, g, uzun) {
    const c = G.c, z = zarf(c, hedef, t, g, 0.007, uzun ? 1.45 : 0.95); z.connect(G.yanki);
    osil(c, 'sine', mf(m), t, t + 1.55, z);
    const z2 = zarf(c, hedef, t, g * 0.11, 0.005, 0.22); osil(c, 'sine', mf(m) * 2, t, t + 0.28, z2);
    const z3 = zarf(c, hedef, t, g * 0.08, 0.003, 0.1); osil(c, 'sine', mf(m) * 3.01, t, t + 0.14, z3);
  }
  function yayli(G, hedef, t, m, sure, g) {
    const c = G.c, z = c.createGain();
    z.gain.setValueAtTime(0.0001, t); z.gain.linearRampToValueAtTime(g, t + sure * 0.35);
    z.gain.linearRampToValueAtTime(g * 0.8, t + sure * 0.8); z.gain.linearRampToValueAtTime(0.0001, t + sure + 0.25);
    const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 950; fl.connect(z); z.connect(hedef);
    [-6, 6].forEach(dt => { const o = osil(c, 'sawtooth', mf(m), t, t + sure + 0.3, fl); o.detune.value = dt; });
  }
  function bas(G, hedef, t, m, g) {
    const c = G.c, z = zarf(c, hedef, t, g, 0.025, 0.9);
    const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 440; fl.connect(z);
    osil(c, 'triangle', mf(m), t, t + 1, fl);
  }

  // tek adım (sekizlik) — canlı ve sınama bağlamında ortak
  // temaya göre küçük çeşitleme: aynı ezgi başka tonda (hep majör, hep neşeli); gece/aurora gibi temalarda daha yumuşak ve seyrek
  const TEMA_MUZIK = {
    cayir: [0, 0], bulut: [2, 0], dere: [-1, 0], lavanta: [-3, 1], gokkusagi: [2, 0], dag: [-2, 0], parkur: [0, 0],
    gece: [-3, 1], kiraz: [3, 0], aycicegi: [0, 0], mercan: [-1, 0], kristal: [-3, 1], pamuk: [2, 0], sonbahar: [-2, 0],
    aurora: [-3, 1], adalar: [1, 0], safak: [3, 0], final20: [0, 0], final: [0, 0]
  };
  let muzikTon = 0, muzikSakin = 0;
  // 2. tur: ortama göre çalgı/gam/tempo çeşitlemesi (aynı sevimli ezgi; 40 bölümde sıkmasın)
  //  tini: ezgiyi çalan çalgı · gam: 'penta' (fa/si yerine sol/la: uzakdoğu tınısı), 'mikso' (si bemol: sıcak çöl) · tempo: hız çarpanı
  //  cingirak: kar çıngırağı · davul: yumuşak el davulu · arpHep: beklerken de hafif arp (şenlik)
  const MUZIK_PROFIL = {
    normal: {},
    gece: { sakin: 1, tempo: 0.86 },
    kar: { tini: 'celesta', cingirak: 1 },
    karGece: { tini: 'celesta', cingirak: 1, sakin: 1, tempo: 0.88 },
    col: { gam: 'mikso', davul: 1, ton: -2, tempo: 0.94 },
    kumsal: { tini: 'ukulele', ton: 2, davul: 1 },
    sakura: { tini: 'kanun', gam: 'penta', sakin: 1, tempo: 0.84, ton: -1 },
    bambu: { tini: 'kanun', gam: 'penta', tempo: 0.92 },
    seker: { tini: 'piyano', ton: 3, tempo: 1.05 },
    uzay: { tini: 'uzay', sakin: 1, tempo: 0.8, ton: -3 },
    firtina: { ton: -2, sakin: 1, tempo: 0.92 },
    sonbahar: { tini: 'ukulele', ton: -2, tempo: 0.95 },
    yagmur: { ton: -1, tempo: 0.95 },
    gokkusagi: { ton: 3, tini: 'celesta' },
    isilti: { tini: 'celesta', sakin: 1, tempo: 0.86, ton: -3 },
    sato: { tini: 'arp', ton: 2 },
    senlik: { tini: 'celesta', cingirak: 1, arpHep: 1, tempo: 1.06, ton: 0 }
  };
  let MP = MUZIK_PROFIL.normal, mpBekleyen = null, adimSure = ADIM, mpAd = null;
  const BIYOM_PROFIL = {
    37: 'seker', 38: 'sonbahar', 39: 'isilti', 40: 'seker',
    41: 'gokkusagi', 42: 'sakura', 43: 'kumsal', 44: 'uzay', 45: 'senlik'
  };
  function profilSec(b, sonMu) {
    if (!b || typeof b !== 'object') return null;
    const h = b.hava, z = b.zeminTur, gece = !!b.gece, by = b.biyom | 0;
    if (by >= 21 || h || z) {                              // yalnız 2. tur bölümleri (eski 25 bölüm eski temasıyla kalır)
      if (sonMu && by >= 21) return 'senlik';
      if (BIYOM_PROFIL[by]) return BIYOM_PROFIL[by];
      if (z === 'ay' || h === 'yildiztozu') return 'uzay';
      if (z === 'seker' || h === 'seker') return 'seker';
      if (h === 'kar' || h === 'karhafif' || z === 'kar' || z === 'buz') return gece ? 'karGece' : 'kar';
      if (h === 'kum') return 'col';
      if (z === 'kum') return 'kumsal';
      if (h === 'cicek') return 'sakura';
      if (h === 'sis') return 'bambu';
      if (h === 'isilti') return 'isilti';
      if (h === 'firtina') return 'firtina';
      if (h === 'yaprak') return 'sonbahar';
      if (h === 'gunesliyagmur') return 'gokkusagi';
      if (h === 'yagmur') return 'yagmur';
      if (z === 'bulut') return 'sato';
      if (gece) return 'gece';
    }
    return null;
  }
  function temaMuzik(tema, profilAd) {
    const v = TEMA_MUZIK[tema] || [0, 0];
    const p = (profilAd && MUZIK_PROFIL[profilAd]) || null;
    mpAd = p ? profilAd : (tema || null);
    // profil bir sonraki ölçü başında devreye girer (ezgi ortasında ton/tempo sıçramasın)
    mpBekleyen = { ton: p ? (p.ton || 0) : v[0], sakin: p ? (p.sakin || 0) : v[1], mp: p || MUZIK_PROFIL.normal };
  }
  function profilUygula() {
    if (!mpBekleyen) return;
    muzikTon = mpBekleyen.ton; muzikSakin = mpBekleyen.sakin; MP = mpBekleyen.mp; mpBekleyen = null;
    adimSure = ADIM / (MP.tempo || 1);
  }
  // gam: ezgi notalarını ortama göre çevir
  function gamla(m, ezgi) {
    const pc = ((m % 12) + 12) % 12;
    if (MP.gam === 'mikso' && pc === 11) return m - 1;                 // si → si bemol
    if (MP.gam === 'penta' && ezgi) { if (pc === 5) return m + 2; if (pc === 11) return m - 2; }   // fa → sol, si → la
    return m;
  }
  const AKOR_MIKSO = { G: [43, [58, 62, 67]], Em: [48, [55, 60, 64]] };   // sol minör, mi minör yerine do
  // ezgi çalgısı: ortamın tınısı (hepsi yumuşak, kısa; düzeyleri kalimbayla eşit tutuldu)
  function nota(G, hedef, t, m, g, uzun) {
    const c = G.c, tn = MP.tini;
    if (!tn) return kalimba(G, hedef, t, m, g, uzun);
    if (tn === 'celesta') {                                // kar/şenlik: çan gibi, parlak ama yumuşak
      const z = zarf(c, hedef, t, g * 0.9, 0.004, uzun ? 1.2 : 0.8); z.connect(G.yanki); osil(c, 'sine', mf(m), t, t + 1.3, z);
      const z2 = zarf(c, hedef, t, g * 0.16, 0.003, 0.4); osil(c, 'sine', mf(m) * 4, t, t + 0.45, z2);
      const z3 = zarf(c, hedef, t, g * 0.07, 0.002, 0.15); osil(c, 'sine', mf(m) * 2.76, t, t + 0.18, z3);
    } else if (tn === 'piyano') {                          // oyuncak piyano: metalik, tıngırdak
      const z = zarf(c, hedef, t, g * 0.85, 0.003, uzun ? 0.75 : 0.5); osil(c, 'triangle', mf(m), t, t + 0.8, z);
      const z2 = zarf(c, hedef, t, g * 0.22, 0.002, 0.3); osil(c, 'sine', mf(m) * 3.93, t, t + 0.32, z2);
      const z3 = zarf(c, hedef, t, g * 0.12, 0.002, 0.18); osil(c, 'sine', mf(m) * 2.01, t, t + 0.2, z3);
    } else if (tn === 'uzay') {                            // ay: yavaş açılan, titreşimli, uzun yankılı tını
      const z = zarf(c, hedef, t, g * 0.8, 0.05, uzun ? 1.9 : 1.3); z.connect(G.yanki);
      const o = osil(c, 'sine', mf(m), t, t + 2.0, z);
      const v = c.createOscillator(), vg = c.createGain(); v.frequency.value = 4.5; vg.gain.value = mf(m) * 0.006; v.connect(vg); vg.connect(o.frequency); v.start(t); v.stop(t + 2.0);
      const z2 = zarf(c, hedef, t, g * 0.25, 0.08, 1.2); const o2 = osil(c, 'sine', mf(m + 12), t, t + 1.4, z2); o2.detune.value = 7;
    } else if (tn === 'kanun') {                           // telli, tok ve kısa (sakura, bambu)
      const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 2; fl.frequency.setValueAtTime(3200, t); fl.frequency.exponentialRampToValueAtTime(700, t + 0.4);
      const z = zarf(c, hedef, t, g * 0.75, 0.003, uzun ? 1.0 : 0.6); z.connect(G.yanki); fl.connect(z);
      osil(c, 'triangle', mf(m), t, t + 1.1, fl);
      const z2 = zarf(c, hedef, t, g * 0.3, 0.002, uzun ? 0.9 : 0.5); osil(c, 'sine', mf(m), t, t + 1, z2);
    } else if (tn === 'ukulele') {                         // kumsal/sonbahar: sıcak telli çalgı
      const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 1; fl.frequency.setValueAtTime(2400, t); fl.frequency.exponentialRampToValueAtTime(600, t + 0.3);
      const z = zarf(c, hedef, t, g * 0.55, 0.004, uzun ? 0.7 : 0.45); fl.connect(z);
      [-4, 4].forEach(d => { const o = osil(c, 'sawtooth', mf(m), t, t + 0.8, fl); o.detune.value = d; });
      const z2 = zarf(c, hedef, t, g * 0.4, 0.004, uzun ? 0.8 : 0.5); osil(c, 'sine', mf(m), t, t + 0.9, z2);
    } else if (tn === 'arp') {                             // gök şatosu: arp
      const z = zarf(c, hedef, t, g * 0.85, 0.005, uzun ? 1.5 : 1.0); z.connect(G.yanki); osil(c, 'sine', mf(m), t, t + 1.6, z);
      const z2 = zarf(c, hedef, t, g * 0.2, 0.004, 0.5); osil(c, 'triangle', mf(m) * 2, t, t + 0.55, z2);
    } else kalimba(G, hedef, t, m, g, uzun);
  }
  function cingirak(G, hedef, t, g) {                      // minik kızak çıngırağı
    const c = G.c;
    gurultuCal(c, hedef, t, 0.07, 'bandpass', 8200, 7400, 3, g, 0.002);
    [5300, 6900].forEach(f => { const z = zarf(c, hedef, t, g * 0.25, 0.002, 0.1); osil(c, 'sine', f, t, t + 0.12, z); });
  }
  function davul(G, hedef, t, g, tiz) {                    // yumuşak el davulu (dum / tek)
    const c = G.c, f = tiz ? 230 : 120, z = zarf(c, hedef, t, g, 0.003, tiz ? 0.1 : 0.2);
    const o = osil(c, 'sine', f, t, t + 0.25, z); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.15);
    if (tiz) gurultuCal(c, hedef, t, 0.04, 'bandpass', 1800, 1200, 1, g * 0.3, 0.002);
  }
  function adimCal(G, hedef, i, t, canli) {
    if (i % 8 === 0) profilUygula();
    const olc = Math.floor(i / 8) % 16, a = i % 8, akAd = DIZI[olc], tn = muzikTon;
    const ak = (MP.gam === 'mikso' && AKOR_MIKSO[akAd]) || AKOR[akAd];
    if (a === 0) {
      bas(G, hedef, t, ak[0] + tn, 0.14);
      ak[1].forEach(m => yayli(G, hedef, t, m + tn, adimSure * 7.6, MP.tini === 'uzay' ? 0.024 : 0.02));
    }
    if (a === 4 && !muzikSakin) bas(G, hedef, t, ak[0] + 7 + tn, 0.085);
    const ch = MEL[olc][a], uzun = MEL[olc][a + 1] === '-';
    // döngü her ikinci turda hafifler (yormasın): ezginin yalnız uzun notaları + ölçü başında yüksek, yumuşak bir çan
    const ikinci = Math.floor(i / 128) % 2 === 1;
    if (ch && NOTA[ch] && (!ikinci || uzun || a === 0)) nota(G, hedef, t, gamla(NOTA[ch], true) + tn, muzikSakin ? 0.12 : 0.135, uzun);
    if (ikinci && a === 0 && olc % 2 === 0) nota(G, hedef, t + adimSure, ak[1][2] + 24 + tn, 0.03, true);
    if (canli || MP.arpHep) {                               // uçuşta hafif canlanma: yumuşak arp (sakin temalarda seyrek)
      if (a % 2 === 1 && (!muzikSakin || a === 3 || a === 7)) nota(G, hedef, t, gamla(ak[1][(a >> 1) % 3], false) + 12 + tn, canli ? 0.038 : 0.026, false);
    } else if (a === 6 && olc % 2 === 1) nota(G, hedef, t, ak[1][2] + 12 + tn, 0.035, false);
    if (MP.cingirak && (canli ? a % 2 === 0 : (a === 0 || a === 4))) cingirak(G, hedef, t, canli ? 0.03 : 0.022);
    if (MP.davul) { if (a === 0) davul(G, hedef, t, 0.07, false); else if (a === 3 || a === 6) davul(G, hedef, t, 0.04, true); }
  }
  function sevincCal(G, hedef, t) {
    profilUygula();
    const tn = muzikTon, ad = adimSure;
    for (let i = 0; i < 16; i++) {
      const s = SEVINC[i >> 3], k = i % 8, ch = s[k];
      if (ch && NOTA[ch]) nota(G, hedef, t + i * ad * 0.75, gamla(NOTA[ch], true) + tn, 0.125, s[k + 1] === '-');
    }
    bas(G, hedef, t, 48 + tn, 0.135); bas(G, hedef, t + 8 * ad * 0.75, 41 + tn, 0.135);
    [60, 64, 67].forEach(m => yayli(G, hedef, t + 8 * ad * 0.75, m + tn, 1.6, 0.022));
  }

  // ---------------- canlı durum ----------------
  let ac = null, G = null, oynatici = null, kaynak = '', muzikAcik = true, gizli = false, bekleyen = null, sira = null;
  let adimNo = 0, sonrakiAdim = 0, canliMod = false, muzikDuraklat = 0, sonHedefG = 0;
  let cekN = null, ruzgarN = null, gerilimN = null, beklentiN = null, durumSon = 'bekle';
  let girisDendi = false, kanatDendi = false, iskaN = 0, iskaSoz = 1, kavusN = 0, birDahaZ = 0, yildizlarDendi = false, yildizOvgu = 0, halkaN = 0;
  let mantarDendi = false, mantarVurdu = false, ipucuSira = 0, sonAci = 0.8, seviyeOlayi = false, sonSeviye = 0;
  let oncekiVy = 0, tepeCaldi = false, pitirT = 0, pitirN = 0, sonKanatHak = 1, kavusOvgu = 0, besN = 0;
  let zeminTur = null, gunesDendi = false, sonVeri = null, tanitim = null, kalanN = 0;
  function tanitimDene() {
    const n = tanitim;
    if (!n || !oynatici || Date.now() < n.t || durumSon !== 'bekle' || ekranKapali() || konusuyor()) return;
    tanitim = null;
    if (n.ortam) birKez(n.ortam);                          // önce ortam cümlesi, sonra (sıraya girerek) yardımcı tanıtımı
    if (n.ad) mekanik(n.ad);
  }
  const tanitilan = {};
  function mekanik(ad) {
    if (!ad || tanitilan[ad] || !CUMLE[ad]) return;
    tanitilan[ad] = true;
    if (KALICI[ad]) hatirla(ad);
    sonraSoyle(ad);
  }
  // yeni ortam/yardımcı cümleleri cihazda BİR KEZ söylenir (localStorage ile hatırlanır)
  const KALICI = { baloncuk: 1, esinti: 1, kirkbitti: 0, ellibitti: 0 };
  const DEPO = 'feza-piril-ucus-ses-dendi';
  let dendi = {};
  try { dendi = JSON.parse(localStorage.getItem(DEPO) || '{}') || {}; } catch (_) { dendi = {}; }
  for (const k in dendi) if (dendi[k]) tanitilan[k] = true;
  function hatirla(ad) { dendi[ad] = 1; try { localStorage.setItem(DEPO, JSON.stringify(dendi)); } catch (_) {} }
  function birKez(ad) {                                   // ortam cümlesi: daha önce hiç söylenmediyse sıraya koy
    if (!ad || !CUMLE[ad] || dendi[ad] || tanitilan[ad]) return false;
    tanitilan[ad] = true; hatirla(ad); sonraSoyle(ad); return true;
  }

  // ---- ortam sesi durumu: istenen ortam (bölümden) ile çalan ortam her 50 ms'de eşitlenir ----
  let ortamN = null, ortamHedef = null, ortamSondu = false, sonGokT = 0, ortamDuzeySon = -1;
  function ekranKapali() {                                 // başlık ya da harita açıkken ortam susar
    const A = typeof ARAYUZ !== 'undefined' && ARAYUZ ? ARAYUZ : null;
    return !!(A && (A.baslikAcik || A.haritaAcik));
  }
  function ortamIzle(t) {
    const istenen = ortamSondu ? null : ortamHedef;
    if ((ortamN ? ortamN.tur : null) !== istenen) {
      if (ortamN) ortamBitir(ortamN, t, 0.8);
      ortamN = istenen ? ortamKur(G, istenen, t, 0.8) : null;
    }
    if (ortamN) ortamOlay(G, ortamN, t);
    // uçarken yağmur hıza göre hafifçe açılır (en çok +3 dB), inince yavaşça geri döner
    const n = ortamN;
    if (n && !n.bitti && t > n.t0 + 0.9 && (n.tur === 'yagmur' || n.tur === 'hafifyagmur' || n.tur === 'firtina')) {
      const p = pOku(), k = durumSon === 'ucus' && p ? Math.min(1, Math.hypot(p.vx || 0, p.vy || 0) / 22) : 0;
      const hedef = n.duzey * (1 + 0.4 * k);
      if (Math.abs(hedef - (n.acik || n.duzey)) > 0.01) { n.acik = hedef; n.g.gain.setTargetAtTime(hedef, t, 0.35); }
    }
    // düzey: ekran kapalıyken 0, anlatım sürerken biraz kısık, müzik kapalıyken yarı
    const d = ekranKapali() ? 0 : (konusuyor() ? 0.7 : 1) * (muzikAcik ? 1 : 0.5);
    if (d !== ortamDuzeySon) { ortamDuzeySon = d; G.ortam.gain.setTargetAtTime(d, t, d === 0 ? 0.25 : 0.35); }
  }
  const canli = () => !!(ac && G && ac.state === 'running');
  const pOku = () => (typeof P !== 'undefined' && P) ? P : null;
  const hedefX = () => (typeof D !== 'undefined' && D && D.hedef) ? D.hedef.x : 46;

  // her 50 ms: uçuşun tepe noktası, Bilbo'ya alçalırken beklenti, geri koşarken pıtır pıtır
  function ucusIzle(t) {
    const p = pOku(); if (!p) return;
    if (durumSon === 'ucus') {
      const vy = p.vy || 0;
      if (!tepeCaldi && oncekiVy > 1 && vy <= 0 && (p.y || 0) > 4.5) { tepeCaldi = true; E.tepe(G, t + 0.01); }
      oncekiVy = vy;
      const dx = Math.abs((p.x || 0) - hedefX()), k = vy < 0 && dx < 10 && p.y < 9 ? Math.min(1, (1 - dx / 10) * 0.6 + (1 - p.y / 9) * 0.5) : 0;
      if (k > 0 && !beklentiN) beklentiN = beklentiBaslat(G, t);
      if (beklentiN) beklentiAyar(beklentiN, t, k);
    } else if (durumSon === 'don') {
      if (t >= pitirT) { E.pitir(G, t + 0.01, pitirN++); pitirT = t + 0.13; }
    }
  }

  function muzikDenge(t) {
    if (!canli()) return;
    const konus = konusuyor();
    // anlatım varken müzik yumuşakça alçalır, bitince yavaşça geri yükselir; çekerken hafifçe kısılır
    const hedefG = !muzikAcik ? 0 : konus ? 0.18 : (durumSon === 'cek' ? 0.3 : 0.42 * (canliMod ? 1.1 : 1));
    if (hedefG === sonHedefG) return;
    const tc = !muzikAcik ? 0.15 : konus ? (hedefG < sonHedefG ? 0.14 : 0.3) : hedefG > sonHedefG ? 0.55 : durumSon === 'cek' ? 0.4 : 0.25;
    sonHedefG = hedefG;
    G.muzik.gain.setTargetAtTime(hedefG, t, tc);
  }

  function zamanla() {
    if (!canli()) return;
    const t = ac.currentTime;
    muzikDenge(t);
    ucusIzle(t);
    if (sonrakiAdim < t) sonrakiAdim = t + 0.05;
    while (sonrakiAdim < t + 0.3) {
      if (adimNo % 8 === 0) profilUygula();
      if (muzikAcik && sonrakiAdim >= muzikDuraklat) adimCal(G, G.muzikYum, adimNo, sonrakiAdim, canliMod);
      if (sonrakiAdim >= muzikDuraklat) adimNo++;
      sonrakiAdim += adimSure;
    }
    ortamIzle(t);
    tanitimDene();
    // uçuş rüzgârı: hız arttıkça biraz artar
    if (ruzgarN && typeof P !== 'undefined' && P) ruzgarAyar(ruzgarN, t, Math.hypot(P.vx || 0, P.vy || 0));
  }

  function hazir() {
    if (sessiz) return;
    if (!oynatici) {
      oynatici = new Audio(); oynatici.preload = 'auto';
      oynatici.addEventListener('ended', siradaki);
      oynatici.addEventListener('error', siradaki);     // kayıt yoksa sessizce geç
    }
    if (ac) { uyandir(); return; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      G = kur(ac);
      uyandir();
      setInterval(zamanla, 50);
      document.addEventListener('visibilitychange', () => {
        gizli = document.hidden;
        if (gizli) {
          try { const p = ac.suspend(); if (p && p.catch) p.catch(() => {}); } catch (_) {}
          if (oynatici && !oynatici.paused) { try { oynatici.pause(); } catch (_) {} bekleyen = oynatici; }
        } else {
          uyandir();
          if (bekleyen) { const a = bekleyen; bekleyen = null; try { const p = a.play(); if (p && p.catch) p.catch(() => {}); } catch (_) {} }
        }
      });
    } catch (e) { ac = null; G = null; }
    if (!girisDendi) { girisDendi = true; soyle('giris'); }
  }
  function uyandir() { if (!sessiz && ac && ac.state !== 'running' && !document.hidden) { try { const p = ac.resume(); if (p && p.catch) p.catch(() => {}); } catch (_) {} } }

  function konusuyor() { return !!(oynatici && kaynak && !oynatici.paused && !oynatici.ended); }
  // sıra: konuşma sürerken gelen cümleler sırayla (en çok 3, aynısı iki kez girmez) söylenir
  function siradaki() {
    const k = sira && sira.length ? sira.shift() : null;
    if (k) { const kalan = sira; soyle(k); sira = kalan; }
    else { sira = null; if (canli()) muzikDenge(ac.currentTime); }
  }
  function soyle(ad) {
    if (sessiz || !CUMLE[ad]) return;
    if (!oynatici) return;                               // ilk dokunuştan önce konuşma yok
    sira = null;
    try {
      oynatici.pause();
      const yol = 'sesler/' + ad + '.mp3';
      if (kaynak !== yol) { kaynak = yol; oynatici.src = yol; }
      oynatici.currentTime = 0;
      if (document.hidden) { bekleyen = oynatici; return; }
      const p = oynatici.play(); if (p && p.catch) p.catch(() => {});
      if (canli()) muzikDenge(ac.currentTime);
    } catch (_) { /* çalınamadı: sessizce geç */ }
  }
  function sonraSoyle(ad) {                                // konuşan cümleyi kesme: sıraya gir
    if (!konusuyor()) { soyle(ad); return; }
    if (!sira) sira = [];
    if (sira.indexOf(ad) < 0 && sira.length < 3) sira.push(ad);
  }
  function sus() { sira = null; bekleyen = null; if (oynatici) { try { oynatici.pause(); } catch (_) {} } if (canli()) muzikDenge(ac.currentTime); }

  function efekt(ad, v) {
    if (sessiz || !canli() || typeof E[ad] !== 'function') return;
    try { E[ad](G, ac.currentTime + 0.01, v); } catch (_) {}
  }
  function muzik(acik) { if (sessiz) return; muzikAcik = !!acik; }

  // ---------------- olaylar ----------------
  function cekSes(o) {
    if (!canli() || durumSon !== 'cek') return;            // bırakıldıktan sonra gelen 'cek' (sıfırlama) sesi yeniden başlatmasın
    const t = ac.currentTime, g = (o && o.guc) || 0;
    if (!cekN) cekN = cekBaslat(G, t);
    cekAyar(cekN, t, g, seviyeOlayi ? sonSeviye >= 3 : null);
    if (gerilimN) gerilimAyar(gerilimN, t, g);
    if (!seviyeOlayi) {                                    // oyun gucSeviye yaymıyorsa kademeyi kendimiz bulalım
      const n = g < 0.12 ? 0 : g < 0.45 ? 1 : g < 0.96 ? 2 : 3;
      seviyeDegis(n);
    }
  }
  function seviyeDegis(n) {
    n = Math.max(0, Math.min(3, n | 0));
    if (n > sonSeviye && canli()) E.gucTik(G, ac.currentTime + 0.005, n);   // yalnız yükselirken tık (geri gelirken sessiz)
    sonSeviye = n;
  }
  function cekKapat() {
    if (cekN && ac) cekBitir(cekN, ac.currentTime); cekN = null;
    if (gerilimN && ac) gerilimBitir(gerilimN, ac.currentTime); gerilimN = null;
    sonSeviye = 0;
  }
  function ruzgarKapat() {
    if (ruzgarN && ac) ruzgarBitir(ruzgarN, ac.currentTime); ruzgarN = null;
    if (beklentiN && ac) beklentiBitir(beklentiN, ac.currentTime); beklentiN = null;
  }

  // ıskada ARA SIRA ipucu: nereye düştüğüne ve atış açısına göre (kısa → "daha çok çek" ya da "yukarı bırak", uzun → "az çek")
  function iskaCumle(o) {
    const x = o && typeof o.x === 'number' ? o.x : null, h = hedefX();
    let ipucu = null;
    if (x != null && x < h - 3) ipucu = sonAci < 0.42 ? 'yukari' : 'cokcek';
    else if (x != null && x > h + 3) ipucu = 'azcek';
    if (iskaN === 1) return 'iska1';                       // ilk ıska: yalnız cesaret
    if (iskaN % 2 === 0) return null;                      // her ıskada değil: ikide bir konuş
    if (ipucu && (ipucuSira++ % 2 === 0)) return ipucu;   // konuşulan ıskaların yarısında ipucu
    return 'iska' + ((iskaSoz++ % 4) + 1);
  }

  function baglan() {
    if (sessiz || typeof OLAY === 'undefined' || !OLAY || typeof OLAY.on !== 'function') return;
    OLAY.on('durum', d => {
      durumSon = d;
      if (d !== 'kavus' && ortamSondu) ortamSondu = false;   // hava.js de kavuşmadan çıkınca fırtınayı geri getirir
      if (d !== 'cek') cekKapat();
      else if (canli() && !gerilimN && muzikAcik) gerilimN = gerilimBaslat(G, G.muzikYum, ac.currentTime);
      if (d === 'ucus') {
        canliMod = true; tepeCaldi = false; oncekiVy = 0;
        if (canli() && !ruzgarN) ruzgarN = ruzgarBaslat(G, ac.currentTime);
        if (!kanatDendi && oynatici && sonKanatHak > 0) { /* kanat hakkı olmayan bölümde "dokun" deme */ kanatDendi = true; setTimeout(() => { if (durumSon === 'ucus') sonraSoyle('kanat'); else kanatDendi = false; }, 450); }
      } else {
        ruzgarKapat();
        if (d === 'bekle' || d === 'don') { canliMod = false; halkaN = 0; }
      }
      if (d === 'yuvar' && canli()) {
        const t = ac.currentTime + 0.02;
        E.yuvarlan(G, t);
        if (zeminTur && zeminTur !== 'cim') { try { E.zemin(G, t, { tur: zeminTur, k: 0.55 }); E.zemin(G, t + 0.32, { tur: zeminTur, k: 0.35 }); } catch (_) {} }
      }
      if (d === 'don') { pitirT = canli() ? ac.currentTime + 0.25 : 0; pitirN = 0; }
    });
    OLAY.on('cek', cekSes);
    OLAY.on('gucSeviye', n => { seviyeOlayi = true; seviyeDegis(typeof n === 'object' && n ? (n.n != null ? n.n : n.seviye) : n); });
    OLAY.on('salla', () => { cekKapat(); efekt('boyoyoy'); });
    OLAY.on('birak', o => {
      cekKapat();
      if (o && o.vx != null) sonAci = Math.atan2(o.vy || 0, Math.max(0.01, o.vx));
      if (canli()) E.birak(G, ac.currentTime + 0.01, o && o.vx != null ? Math.min(1, Math.hypot(o.vx, o.vy) / 24) : 1);
    });
    OLAY.on('kanat', o => {
      const adim = (o && o.toplam != null && o.kalan != null) ? Math.max(0, o.toplam - o.kalan - 1) : 0;
      const yarim = [0, 2, 4, 7][Math.min(3, adim)];
      efekt('kanat', Math.pow(2, yarim / 12));
      kanatDendi = true;
    });
    OLAY.on('yildiz', o => {
      const n = (o && o.toplam) || 1;
      efekt('yildiz', n);
      // büyülü/karlı ortamda yıldızın ardından ortam pırıltısı da uyumla çınlar (aynı do-majör beşli dizi)
      if (canli() && ortamN && !ortamN.bitti && /^(buyu|yildiz|kar|hafifyagmur)$/.test(ortamN.tur)) ortamN.sonraki = Math.min(ortamN.sonraki, ac.currentTime + 0.3);
      if (n >= 5 && !yildizlarDendi) {                     // övgü çeşitli ve ara sıra: ilk iki kez, sonra üç seferde bir (çıngırak fanfarı her zaman)
        yildizlarDendi = true; besN++;
        if (besN <= 2 || besN % 3 === 0) {
          const ad = (yildizOvgu++ % 2) ? 'yildizlar' : 'besyildiz';
          setTimeout(() => { if (durumSon !== 'kavus') sonraSoyle(ad); }, 900);
        }
      }
    });
    OLAY.on('sek', o => {
      const tur = o && o.tur;
      if (tur === 'mantar') mantarVurdu = true;
      if (tur === 'mantar' || tur === 'bulut' || tur === 'nilufer') mekanik(tur);
      const yerMi = !tur || tur === 'yer';
      // zemine iniş: bölümün zeminTur'una göre (kar, buz, kum, ıslak, şeker, ay, bulut); yoksa / çimse eski ses
      if (yerMi && zeminTur && zeminTur !== 'cim' && canli()) {
        const t = ac.currentTime + 0.01;
        try { if (E.zemin(G, t, { tur: zeminTur, k: 1 })) return; } catch (_) {}   // zemin sesi kendi tok vuruşunu taşır
      }
      efekt(tur === 'mantar' ? 'mantar' : tur === 'bulut' ? 'bulut' : tur === 'nilufer' ? 'nilufer' : (tur === 'cali' || tur === 'engel') ? 'pof' : 'dus');
    });
    // ---- 2. tur olayları ----
    let balT = 0, vuusT = 0;
    OLAY.on('baloncuk', () => {
      if (canli()) { const t = ac.currentTime; if (t >= balT) { balT = t + 0.15; E.baloncuk(G, t + 0.01); } }
      mekanik('baloncuk');
    });
    OLAY.on('esinti', () => {
      if (canli()) { const t = ac.currentTime; if (t >= vuusT) { vuusT = t + 0.6; E.vuus(G, t + 0.01); } }
      mekanik('esinti');
    });
    OLAY.on('simsek', o => {                              // uzak şimşek: 0,4–1,2 sn sonra yumuşak gök gürültüsü (güçlüsü daha erken)
      if (!canli() || ekranKapali()) return;
      const guc = Math.max(0, Math.min(1, o && typeof o.guc === 'number' ? o.guc : 0.6)), t = ac.currentTime;
      if (t < sonGokT) return;                             // üst üste binmesin
      const gec = 1.2 - 0.8 * guc + rnd(-0.1, 0.1), b = t + Math.max(0.4, Math.min(1.2, gec));
      sonGokT = b + 2.2;
      E.gok(G, b, guc);
    });
    OLAY.on('bilboKos', o => {                             // Bilbo Pırıl'a koşuyor (ardından normal 'kavus' gelir; adımlar ondan önce biter)
      if (!canli()) return;
      E.bilboKos(G, ac.currentTime + 0.01, { sure: o && o.sure, zemin: zeminTur });
    });
    let hazirT = 0;
    OLAY.on('kanatSira', () => {                           // erken dokunuş sıraya alındı: minik "hazır" tınısı
      if (!canli()) return;
      const t = ac.currentTime; if (t < hazirT) return;
      hazirT = t + 0.3; E.hazirTin(G, t + 0.01);
    });
    OLAY.on('havaDindi', () => {                           // fırtına bitti: yağmur 2 sn'de söner, ardından "güneş açtı" pırıltısı
      if (ortamSondu) return;
      ortamSondu = true;
      if (canli()) {
        const t = ac.currentTime;
        if (ortamN) { ortamBitir(ortamN, t, 2); ortamN = null; }
        if (!ekranKapali()) E.gunes(G, t + 2.05);
      }
      if (!gunesDendi) { gunesDendi = true; setTimeout(() => sonraSoyle('gunesacti'), 2300); }
    });
    OLAY.on('mekanik', o => {
      const tur = typeof o === 'string' ? o : (o && (o.tur || o.ad || o.mekanik));
      if (tur) mekanik(tur);
    });
    OLAY.on('halka', () => { efekt('halka', ++halkaN); mekanik('halka'); });
    let esintiT = 0, bosT = 0;
    OLAY.on('kanatBos', () => {                            // hak bitti ama dokundu: minik pıt (sık dokunuşta en çok 0,25 sn'de bir)
      if (!canli()) return;
      const t = ac.currentTime; if (t < bosT) return;
      bosT = t + 0.25; E.kanatBos(G, t + 0.01);
    });
    OLAY.on('ruzgar', () => {                              // rüzgâr içinde her karede yayılabilir: en çok 0,9 sn'de bir hışırtı
      if (!canli()) return;
      const t = ac.currentTime; if (t < esintiT) return;
      esintiT = t + 0.9; E.esinti(G, t + 0.01); mekanik('ruzgar');
    });
    // bölüm sayısı hiçbir yerde sabit değil: olaydaki 'toplam' ya da BOLUMLER.length
    const bolumSayisi = o => (o && typeof o.toplam === 'number' && o.toplam > 0) ? o.toplam
      : (typeof BOLUMLER !== 'undefined' && BOLUMLER && BOLUMLER.length) ? BOLUMLER.length : 0;
    const bolumNo = o =>typeof o === 'number' ? o : (o && (typeof o.bolum === 'number' ? o.bolum : (typeof o.no === 'number' ? o.no : (typeof o.bolumIdx === 'number' ? o.bolumIdx + 1 : 0))));
    const bolumOlay = o => {
      yildizlarDendi = false; iskaN = 0; halkaN = 0;
      const b = bolumNo(o), son = bolumSayisi(o);
      // bölüm verisi: olaydaki nesne (oyun.js 'bolum: b') ya da sıra numarasından BOLUMLER[idx]; yalnız numara gelirse (arayüz) ortam/müzik değişmez
      const L = typeof BOLUMLER !== 'undefined' && Array.isArray(BOLUMLER) ? BOLUMLER : null;
      const veri = o && o.bolum && typeof o.bolum === 'object' ? o.bolum
        : (o && typeof o.idx === 'number' && L && L[o.idx]) ? L[o.idx] : null;
      if (!veri) return;
      sonVeri = veri;
      const hava = (o && typeof o.hava === 'string') ? o.hava : veri.hava;
      zeminTur = (o && typeof o.zeminTur === 'string') ? o.zeminTur : (typeof veri.zeminTur === 'string' ? veri.zeminTur : null);
      const ozet = { hava, zeminTur, gece: veri.gece, biyom: veri.biyom };
      const sonMu = son > 1 && b === son;
      temaMuzik(veri.tema, profilSec(ozet, sonMu));
      ortamHedef = ortamSec(ozet); ortamSondu = false;
      const kh = o && typeof o.kanatHak === 'number' ? o.kanatHak : (typeof veri.kanatHak === 'number' ? veri.kanatHak : 0);
      sonKanatHak = kh;
      const var_ = alan => !!(Array.isArray(veri[alan]) && veri[alan].length);
      // yeni ortamın ilk açılışında (cihazda bir kez) sıcak bir cümle: biyom 21–45 → ortam26–ortam50
      const by = veri.biyom | 0, ortamAd = by >= 21 ? 'ortam' + (by + 5) : null;
      const ortamYeni = !!(ortamAd && CUMLE[ortamAd] && !dendi[ortamAd] && !tanitilan[ortamAd]);
      // bölüm başında tek tanıtım: son bölüm duyurusu > yeni kanat hakkı > bölümde İLK KEZ görülen şey (mantar, bulut, nilüfer, rüzgâr, halka, baloncuk, esinti)
      // (yeni ortamın kendi cümlesi son bölümü zaten duyuruyorsa 'final' söylenmez)
      const aday = [
        o && o.mekanik,
        sonMu && !(ortamYeni && ortamAd === 'ortam' + son) ? 'final' : null,
        var_('baloncuklar') ? 'baloncuk' : null, var_('esintiler') ? 'esinti' : null,   // yeni yardımcılar önce
        kh >= 4 ? 'ucusUstasi' : kh === 3 ? 'ucluKanat' : kh === 2 ? 'cifte' : null,
        var_('mantarlar') ? 'mantar' : null, var_('bulutlar') ? 'bulut' : null, var_('niluferler') ? 'nilufer' : null,
        var_('ruzgarlar') ? 'ruzgar' : null, var_('halkalar') ? 'halka' : null
      ];
      const ad = aday.find(a => a && CUMLE[a] && !tanitilan[a]);
      // başlık/harita kapanınca, Pırıl salıncakta beklerken söylenir (zamanla → tanitimDene)
      tanitim = (ortamYeni || ad) ? { ortam: ortamYeni ? ortamAd : null, ad, t: Date.now() + 700 } : null;
    };
    OLAY.on('bolum', bolumOlay);
    OLAY.on('iska', o => {
      ruzgarKapat(); iskaN++;
      const ad = iskaCumle(o);
      if (ad) setTimeout(() => { if (durumSon !== 'kavus' && durumSon !== 'ucus') sonraSoyle(ad); }, 1300);
    });
    OLAY.on('kavus', o => {
      cekKapat(); ruzgarKapat(); canliMod = false; kavusN++;
      const b = bolumNo(o), son = bolumSayisi(o);
      const finalMi = !!(o && (o.final != null ? o.final : (son > 1 && b === son)));
      const tekAtis = !!(o && o.tekAtis);
      if (canli()) {
        const t = ac.currentTime;
        E.kavus(G, t + 0.02);
        if (!(o && o.bilboKos)) E.hav(G, t + 0.75);       // Bilbo koşarken zaten havladı: ikinci kez havlamasın
        if (tekAtis) E.gokkusagi(G, t + 0.5);              // tek uçuşta 5 yıldız: gökkuşağı fanfarı
        muzikDuraklat = t + (finalMi ? 6.0 : 5.0); sonrakiAdim = Math.max(sonrakiAdim, t);
        if (finalMi) E.final(G, t + (tekAtis ? 1.6 : 1.2)); // son bölüm: müzikteki sevinç cümlesi yerine büyük fanfar
        else if (muzikAcik) sevincCal(G, G.muzikYum, t + (tekAtis ? 1.6 : 1.2));
        adimNo = 0;
      }
      // tek atış: cihazda ilk kez olunca bir kez özel cümle (övgünün yerine)
      const tekSoz = tekAtis && !dendi.tekatis && !finalMi;
      if (tekSoz) { hatirla('tekatis'); soyle('tekatis'); }
      // övgü seyrek ve çeşitli: ilk iki kavuşmada, sonra iki kavuşmada bir; 4 farklı cümle sırayla (fanfar ve havlama her zaman)
      else if (!finalMi && (kavusN <= 2 || kavusN % 2 === 1)) soyle(['kavus1', 'kavus3', 'kavus2', 'kavus4'][kavusOvgu++ % 4]);
      clearTimeout(birDahaZ);
      const eksik = o && typeof o.yildiz === 'number' && o.yildiz < 5;
      if (finalMi) {
        // 50 (veya 40) bölümün sonu: özel bitirme cümlesi (sayı değişirse genel kutlama cümlesi)
        birDahaZ = setTimeout(() => sonraSoyle(son === 50 ? 'ellibitti' : (son === 40 ? 'kirkbitti' : 'kutlama')), 1800);
      } else if (eksik && (kalanN++ % 3 === 0)) {           // 5'ten az yıldız: üç seferde bir "kalan yıldızları da toplayalım mı?"
        birDahaZ = setTimeout(() => sonraSoyle('kalanyildiz'), 2500);
      } else if (!tekSoz && (kavusN <= 2 || kavusN % 2 === 1)) {
        birDahaZ = setTimeout(() => sonraSoyle('sonraki'), 2500);   // "Sonraki Bölüm" düğmesi çıkınca
      }
    });
    OLAY.on('yeniden', () => {
      clearTimeout(birDahaZ); cekKapat(); ruzgarKapat(); canliMod = false; yildizlarDendi = false; halkaN = 0;
      ortamSondu = false;                                  // yeni denemede bölümün havası (yağmur/fırtına) yumuşakça geri gelir
      if (oynatici && (kaynak === 'sesler/birdaha.mp3' || kaynak === 'sesler/sonraki.mp3')) sus();
      // bir kez: ilk kavuşmadan sonra yeni turda mantarı hiç kullanmadıysa ustalık ipucu
      if (kavusN >= 1 && !mantarVurdu && !mantarDendi) { mantarDendi = true; setTimeout(() => { if (durumSon === 'bekle') sonraSoyle('mantar'); }, 900); }
    });
    // ilk bölüm olayı ses bağlanmadan önce yayılmış olabilir: o anki bölümü bir kez oku
    setTimeout(() => {
      if (sonVeri || typeof UCUS === 'undefined' || !UCUS || typeof UCUS.bolumBilgi !== 'function') return;
      try { const bb = UCUS.bolumBilgi(); if (bb && !sonVeri) bolumOlay(bb); } catch (_) {}
    }, 0);
    // ekrandaki düğmelere dokununca yumuşak tık
    document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('button'); if (b) efekt('tik'); }, true);
  }

  if (!sessiz) {
    window.addEventListener('load', baglan);
    // ilk dokunuşta ses açılır (arayüz SES.hazir() çağırmasa bile); sonra kesilirse (kilit, arama) yeniden uyanır
    for (const ad of ['pointerdown', 'touchend', 'click', 'keydown']) addEventListener(ad, () => { if (!ac) hazir(); else uyandir(); }, { capture: true, passive: true });
  }

  // ---------------- sessiz sınama: hoparlöre hiçbir şey gitmez, OfflineAudioContext içinde çizilir ----------------
  // SES._sina('muzik'|'muzikUcus'|'sevinc'|efekt adı|'cek'|'ruzgar', sn) → { tepe, ort } (dBFS)
  async function sina(ad, sure) {
    const Off = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const sr = 44100, c = new Off(1, Math.ceil(sr * (sure || 3)), sr), T = kur(c);
    T.muzik.gain.value = 0.42; T.ortam.gain.value = 1;
    const ayri = String(ad).split(':'), on = ayri[0], arg = ayri[1];
    const muzikDoldur = (ucus, i0) => { let t = 0.05, i = i0 || 0; while (t < sure - 0.2) { adimCal(T, T.muzikYum, i++, t, ucus); t += adimSure; } };
    const profille = (p, f) => {                         // profili geçici kur, çal, eski haline döndür
      const eski = [muzikTon, muzikSakin, MP, adimSure, mpBekleyen, mpAd];
      temaMuzik(null, p); profilUygula(); try { f(); } finally { [muzikTon, muzikSakin, MP, adimSure, mpBekleyen, mpAd] = eski; }
    };
    if (on === 'ortam') { const n = ortamKur(T, arg, 0, 0.8); for (let t = 0; t < sure - 0.3; t += 0.05) ortamOlay(T, n, t); ortamBitir(n, sure - 0.9, 0.6); }
    else if (on === 'ortamMuzik') {                      // ortam + uçuş müziği birlikte (müziği bastırıyor mu?)
      profille(arg === 'firtina' ? 'firtina' : null, () => muzikDoldur(true));
      const n = ortamKur(T, arg, 0, 0.8); for (let t = 0; t < sure - 0.3; t += 0.05) ortamOlay(T, n, t);
      if (arg === 'firtina') { E.gok(T, 1.0, 1); E.gok(T, 4.5, 0.6); }
    }
    else if (on === 'profil') profille(arg, () => muzikDoldur(true));
    else if (on === 'profilBekle') profille(arg, () => muzikDoldur(false));
    else if (on === 'zemin') E.zemin(T, 0.05, { tur: arg, k: 1 });
    else if (on === 'bilboKos') E.bilboKos(T, 0.05, { sure: 1.3, zemin: arg });
    else if (on === 'tekKavus') { E.kavus(T, 0.05); E.gokkusagi(T, 0.55); sevincCal(T, T.muzikYum, 1.65); }
    else if (on === 'gok') E.gok(T, 0.05, arg == null ? 1 : +arg);
    else if (on === 'havaDindi') { const n = ortamKur(T, 'firtina', 0, 0.8); for (let t = 0; t < 1.5; t += 0.05) ortamOlay(T, n, t); ortamBitir(n, 1.5, 2); E.gunes(T, 3.55); }
    else if (ad === 'muzik' || ad === 'muzikUcus' || ad === 'muzik2') { let t = 0.05, i = ad === 'muzik2' ? 128 : 0; while (t < sure - 0.2) { adimCal(T, T.muzikYum, i++, t, ad === 'muzikUcus'); t += ADIM; } }
    else if (ad === 'sevinc') sevincCal(T, T.muzikYum, 0.05);
    else if (ad === 'cek') { const n = cekBaslat(T, 0); for (let k = 0; k <= 20; k++) cekAyar(n, k * 0.1, k / 20); cekBitir(n, 2.2); }
    else if (ad === 'ruzgar') { const n = ruzgarBaslat(T, 0); ruzgarAyar(n, 0, 20); ruzgarBitir(n, sure - 0.9); }
    else if (ad === 'yildizlar5') { for (let k = 1; k <= 5; k++) E.yildiz(T, 0.05 + (k - 1) * 0.4, k); }
    else if (ad === 'cekTam') { const n = cekBaslat(T, 0); cekAyar(n, 0, 1); cekBitir(n, sure - 0.3); }
    else if (ad === 'gerilim') { const n = gerilimBaslat(T, T.muzikYum, 0); gerilimAyar(n, 0, 1); gerilimBitir(n, sure - 0.9); }
    else if (ad === 'beklenti') { const n = beklentiBaslat(T, 0); for (let k = 0; k <= 10; k++) beklentiAyar(n, k * 0.15, k / 10); beklentiBitir(n, sure - 0.5); }
    else if (ad === 'cekTiklar') { const n = cekBaslat(T, 0); for (let k = 0; k <= 20; k++) cekAyar(n, k * 0.1, k / 20); [1, 2, 3].forEach((s, i) => E.gucTik(T, 0.4 + i * 0.6, s)); cekBitir(n, 2.2); }
    else if (ad === 'pitir') { for (let k = 0; k < 12; k++) E.pitir(T, 0.05 + k * 0.13, k); }
    else if (ad === 'iskaHepsi') { E.yuvarlan(T, 0.05); for (let k = 0; k < 8; k++) E.pitir(T, 1.4 + k * 0.13, k); }
    else if (ad === 'kavusHepsi') { E.kavus(T, 0.05); E.hav(T, 0.8); sevincCal(T, T.muzikYum, 1.25); }
    else if (ad === 'finalHepsi') { E.kavus(T, 0.05); E.hav(T, 0.8); E.final(T, 1.25); }
    else if (ad === 'muzikGece') profille('gece', () => muzikDoldur(true));
    else if (ad === 'enKotu') {   // en kötü üst üste binme: uçuş müziği + rüzgâr + beklenti + yıldız fanfarı + kanat + mantar + kavuşma
      let t = 0.05, i = 0; while (t < sure - 0.2) { adimCal(T, T.muzikYum, i++, t, true); t += ADIM; }
      const r = ruzgarBaslat(T, 0); ruzgarAyar(r, 0, 22); const bk = beklentiBaslat(T, 0); beklentiAyar(bk, 0, 1);
      E.yildiz(T, 0.3, 5); E.kanat(T, 0.35); E.mantar(T, 0.4); E.tepe(T, 0.45); E.kavus(T, 0.5); E.hav(T, 1.2); sevincCal(T, T.muzikYum, 1.6);
      E.esinti(T, 0.32); E.halka(T, 0.38, 3); E.final(T, 1.0); E.bulut(T, 0.42); E.nilufer(T, 0.44);
    }
    else E[ad](T, 0.05, 1);
    const b = await c.startRendering(), d = b.getChannelData(0);
    let tepe = 0, top = 0, n = 0;
    for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > tepe) tepe = v; if (v > 1e-4) { top += v * v; n++; } }
    const db = x => Math.round(200 * Math.log10(Math.max(x, 1e-9))) / 10;
    return { tepe: db(tepe), ort: db(Math.sqrt(top / Math.max(1, n))), bozuk: !isFinite(tepe) };
  }

  // _durum: sınama için anlık özet (ortam, müzik profili, zemin, konuşma sırası)
  const _durum = () => ({ ortam: ortamN ? ortamN.tur : null, ortamHedef, ortamSondu, profil: mpAd, ton: muzikTon, tempo: MP.tempo || 1,
    zeminTur, sira: sira ? sira.slice() : [], kaynak, tanitim: tanitim ? (tanitim.ortam || '') + '/' + (tanitim.ad || '') : null });
  return { hazir, soyle, sonraSoyle, mekanik, efekt, muzik, sus, CUMLE, _sina: sina, _acik: () => !!ac, _durum };
})();
