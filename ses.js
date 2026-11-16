/* Pırıl'ın Uçuş Okulu — ses
   Önceden kaydedilmiş Türkçe anlatım (sesler/*.mp3, tr-TR-EmelNeural; cümle değişirse: python3 gen_voice.py <ad>)
   + kodla üretilen yumuşak efektler ve sakin, masalsı müzik (kalimba + yumuşak yaylı + çan; 88 bpm).
   ?sessiz → AudioContext ve ses oynatıcı HİÇ kurulmaz; bütün çağrılar sessizce döner.
   Ses ilk dokunuşta açılır (SES.hazir()); sekme gizlenince her şey susar. Olaylar OLAY'dan kendiliğinden dinlenir. */
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
    bolum20: 'İşte büyük final! Yıldızların arasında Bîlbo\'ya uçalım!'
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
  function temaMuzik(tema) {
    const v = TEMA_MUZIK[tema] || [0, 0]; muzikTon = v[0]; muzikSakin = v[1];
  }
  function adimCal(G, hedef, i, t, canli) {
    const olc = Math.floor(i / 8) % 16, a = i % 8, ak = AKOR[DIZI[olc]], tn = muzikTon;
    if (a === 0) {
      bas(G, hedef, t, ak[0] + tn, 0.14);
      ak[1].forEach(m => yayli(G, hedef, t, m + tn, ADIM * 7.6, 0.02));
    }
    if (a === 4 && !muzikSakin) bas(G, hedef, t, ak[0] + 7 + tn, 0.085);
    const ch = MEL[olc][a], uzun = MEL[olc][a + 1] === '-';
    // döngü her ikinci turda hafifler (yormasın): ezginin yalnız uzun notaları + ölçü başında yüksek, yumuşak bir çan
    const ikinci = Math.floor(i / 128) % 2 === 1;
    if (ch && NOTA[ch] && (!ikinci || uzun || a === 0)) kalimba(G, hedef, t, NOTA[ch] + tn, muzikSakin ? 0.12 : 0.135, uzun);
    if (ikinci && a === 0 && olc % 2 === 0) kalimba(G, hedef, t + ADIM, ak[1][2] + 24 + tn, 0.03, true);
    if (canli) {                                            // uçuşta hafif canlanma: yumuşak arp (sakin temalarda seyrek)
      if (a % 2 === 1 && (!muzikSakin || a === 3 || a === 7)) kalimba(G, hedef, t, ak[1][(a >> 1) % 3] + 12 + tn, 0.038, false);
    } else if (a === 6 && olc % 2 === 1) kalimba(G, hedef, t, ak[1][2] + 12 + tn, 0.035, false);
  }
  function sevincCal(G, hedef, t) {
    const tn = muzikTon;
    for (let i = 0; i < 16; i++) {
      const s = SEVINC[i >> 3], k = i % 8, ch = s[k];
      if (ch && NOTA[ch]) kalimba(G, hedef, t + i * ADIM * 0.75, NOTA[ch] + tn, 0.125, s[k + 1] === '-');
    }
    bas(G, hedef, t, 48 + tn, 0.135); bas(G, hedef, t + 8 * ADIM * 0.75, 41 + tn, 0.135);
    [60, 64, 67].forEach(m => yayli(G, hedef, t + 8 * ADIM * 0.75, m + tn, 1.6, 0.022));
  }

  // ---------------- canlı durum ----------------
  let ac = null, G = null, oynatici = null, kaynak = '', muzikAcik = true, gizli = false, bekleyen = null, sira = null;
  let adimNo = 0, sonrakiAdim = 0, canliMod = false, muzikDuraklat = 0, sonHedefG = 0;
  let cekN = null, ruzgarN = null, gerilimN = null, beklentiN = null, durumSon = 'bekle';
  let girisDendi = false, kanatDendi = false, iskaN = 0, iskaSoz = 1, kavusN = 0, birDahaZ = 0, yildizlarDendi = false, yildizOvgu = 0, halkaN = 0;
  let mantarDendi = false, mantarVurdu = false, ipucuSira = 0, sonAci = 0.8, seviyeOlayi = false, sonSeviye = 0;
  let oncekiVy = 0, tepeCaldi = false, pitirT = 0, pitirN = 0, sonKanatHak = 1, kavusOvgu = 0, besN = 0;
  const tanitilan = {};
  function mekanik(ad) {
    if (!ad || tanitilan[ad] || !CUMLE[ad]) return;
    tanitilan[ad] = true;
    sonraSoyle(ad);
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
      if (muzikAcik && sonrakiAdim >= muzikDuraklat) adimCal(G, G.muzikYum, adimNo, sonrakiAdim, canliMod);
      if (sonrakiAdim >= muzikDuraklat) adimNo++;
      sonrakiAdim += ADIM;
    }
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
  function siradaki() { const k = sira; sira = null; if (k) soyle(k); else if (canli()) muzikDenge(ac.currentTime); }
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
  function sonraSoyle(ad) { if (konusuyor()) sira = ad; else soyle(ad); }   // konuşan cümleyi kesme
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
      if (d === 'yuvar' && canli()) E.yuvarlan(G, ac.currentTime + 0.02);
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
      efekt(tur === 'mantar' ? 'mantar' : tur === 'bulut' ? 'bulut' : tur === 'nilufer' ? 'nilufer' : (tur === 'cali' || tur === 'engel') ? 'pof' : 'dus');
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
    OLAY.on('bolum', o => {
      yildizlarDendi = false; iskaN = 0; halkaN = 0;
      const b = bolumNo(o), son = bolumSayisi(o);
      const veri = o && o.bolum && typeof o.bolum === 'object' ? o.bolum : null;
      temaMuzik(veri && veri.tema);
      const kh = o && typeof o.kanatHak === 'number' ? o.kanatHak : (veri && typeof veri.kanatHak === 'number' ? veri.kanatHak : 0);
      sonKanatHak = kh;
      const var_ = alan => !!(veri && Array.isArray(veri[alan]) && veri[alan].length);
      // bölüm başında tek cümle: son bölüm duyurusu > yeni kanat hakkı > bölümde İLK KEZ görülen şey (mantar, bulut, nilüfer, rüzgâr, halka)
      const aday = [
        o && o.mekanik,
        b > 1 && b === son ? 'final' : null,
        kh >= 4 ? 'ucusUstasi' : kh === 3 ? 'ucluKanat' : kh === 2 ? 'cifte' : null,
        var_('mantarlar') ? 'mantar' : null, var_('bulutlar') ? 'bulut' : null, var_('niluferler') ? 'nilufer' : null,
        var_('ruzgarlar') ? 'ruzgar' : null, var_('halkalar') ? 'halka' : null
      ];
      const ad = aday.find(a => a && CUMLE[a] && !tanitilan[a]);
      if (ad) setTimeout(() => { if (durumSon === 'bekle') mekanik(ad); }, 700);
    });
    OLAY.on('iska', o => {
      ruzgarKapat(); iskaN++;
      const ad = iskaCumle(o);
      if (ad) setTimeout(() => { if (durumSon !== 'kavus' && durumSon !== 'ucus') sonraSoyle(ad); }, 1300);
    });
    OLAY.on('kavus', o => {
      cekKapat(); ruzgarKapat(); canliMod = false; kavusN++;
      const b = bolumNo(o), son = bolumSayisi(o);
      const finalMi = !!(o && (o.final != null ? o.final : (son > 1 && b === son)));
      if (canli()) {
        const t = ac.currentTime;
        E.kavus(G, t + 0.02); E.hav(G, t + 0.75);
        muzikDuraklat = t + (finalMi ? 6.0 : 5.0); sonrakiAdim = Math.max(sonrakiAdim, t);
        if (finalMi) E.final(G, t + 1.2);                  // son bölüm: müzikteki sevinç cümlesi yerine büyük fanfar
        else if (muzikAcik) sevincCal(G, G.muzikYum, t + 1.2);
        adimNo = 0;
      }
      // övgü seyrek ve çeşitli: ilk iki kavuşmada, sonra iki kavuşmada bir; 4 farklı cümle sırayla (fanfar ve havlama her zaman)
      if (!finalMi && (kavusN <= 2 || kavusN % 2 === 1)) soyle(['kavus1', 'kavus3', 'kavus2', 'kavus4'][kavusOvgu++ % 4]);
      clearTimeout(birDahaZ);
      if (finalMi) {
        birDahaZ = setTimeout(() => sonraSoyle('kutlama'), 1800);
      } else if (kavusN <= 2 || kavusN % 2 === 1) {
        birDahaZ = setTimeout(() => sonraSoyle('sonraki'), 2500);   // "Sonraki Bölüm" düğmesi çıkınca
      }
    });
    OLAY.on('yeniden', () => {
      clearTimeout(birDahaZ); cekKapat(); ruzgarKapat(); canliMod = false; yildizlarDendi = false; halkaN = 0;
      if (oynatici && (kaynak === 'sesler/birdaha.mp3' || kaynak === 'sesler/sonraki.mp3')) sus();
      // bir kez: ilk kavuşmadan sonra yeni turda mantarı hiç kullanmadıysa ustalık ipucu
      if (kavusN >= 1 && !mantarVurdu && !mantarDendi) { mantarDendi = true; setTimeout(() => { if (durumSon === 'bekle') sonraSoyle('mantar'); }, 900); }
    });
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
    T.muzik.gain.value = 0.42;
    if (ad === 'muzik' || ad === 'muzikUcus' || ad === 'muzik2') { let t = 0.05, i = ad === 'muzik2' ? 128 : 0; while (t < sure - 0.2) { adimCal(T, T.muzikYum, i++, t, ad === 'muzikUcus'); t += ADIM; } }
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
    else if (ad === 'muzikGece') { const eski = [muzikTon, muzikSakin]; temaMuzik('gece'); let t = 0.05, i = 0; while (t < sure - 0.2) { adimCal(T, T.muzikYum, i++, t, true); t += ADIM; } muzikTon = eski[0]; muzikSakin = eski[1]; }
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

  return { hazir, soyle, sonraSoyle, mekanik, efekt, muzik, sus, CUMLE, _sina: sina, _acik: () => !!ac };
})();
