/* ortam_e.js - Pırıl'ın Uçuş Okulu: yeni ortamlar (u2-ortam-e)
   26 · Balkabağı Tarlası (bölüm 31) · 30 · Şeker Diyarı (bölüm 35) · 31 · Ay Yüzeyi (bölüm 36)
   Kalıp: scratchpad/notlar/ucus2_ek_api.md. Her şey ctx.grup içinde: bölüm değişince dunya.js söker. */
(function () {
  'use strict';
  window.DY_EK = window.DY_EK || {};
  const PI = Math.PI;

  // ── ortak geometriler: bir kez kurulur, sahneye eklenmez (yalnız birleştirmede kopyalanır), hiç dispose edilmez ──
  const OG = {};
  function ogKabak(T) { // 6 dilimli, tepesi çukur balkabağı (yarıçap 1)
    if (OG.kabak) return OG.kabak;
    const g = new T.SphereGeometry(1, 18, 8), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), f = Math.atan2(z, x);
      const r = 1 - 0.1 * (0.5 + 0.5 * Math.cos(6 * f)) * (1 - y * y);
      const yy = y * 0.86 - 0.22 * Math.exp(-(x * x + z * z) / 0.06) * (y > 0 ? 1 : -0.4);
      p.setXYZ(i, x * r, yy, z * r);
    }
    g.computeVertexNormals();
    return (OG.kabak = g);
  }
  function ogPrizma(T) { // üçgen prizma: tepe +y, taban y=-0.5, ekseni z (çatı alnı)
    if (OG.prizma) return OG.prizma;
    const g = new T.CylinderGeometry(1, 1, 1, 3, 1);
    g.rotateX(PI / 2); g.rotateZ(PI);
    return (OG.prizma = g);
  }
  function ogKrater(T) { // ay krateri: kenarı kabarık, ortası çukur halka (tabanı y=0)
    if (OG.krater) return OG.krater;
    const g = new T.CylinderGeometry(1, 1, 1, 20, 4, false), p = g.attributes.position;
    // silindiri tabak gibi şekillendir: dış kenar 0, sırt 0.85'te, ortası alçak
    const yeni = new T.RingGeometry(0.0, 1.0, 22, 4); yeni.rotateX(-PI / 2);
    const q = yeni.attributes.position;
    for (let i = 0; i < q.count; i++) {
      const x = q.getX(i), z = q.getZ(i), r = Math.sqrt(x * x + z * z);
      const y = r < 0.62 ? 0.05 + 0.25 * (r / 0.62) * (r / 0.62) : 0.3 * Math.max(0, 1 - (r - 0.62) / 0.38);
      q.setY(i, y);
    }
    yeni.computeVertexNormals(); g.dispose();
    return (OG.krater = yeni);
  }
  function ogKalp(T) { // ince yuvarlak disk (lolipop, kurabiye, draje) — ön yüzü +z
    if (OG.disk) return OG.disk;
    const g = new T.CylinderGeometry(1, 1, 1, 20, 1); g.rotateX(PI / 2);
    return (OG.disk = g);
  }
  function ogSarmal(T) { // lolipop sarmalı: düz yüzeyde ince spiral şerit (ön yüz +z)
    if (OG.sarmal) return OG.sarmal;
    const pos = [], N = 70, w = 0.11;
    for (let i = 0; i < N; i++) {
      const a0 = i / N * PI * 5, a1 = (i + 1) / N * PI * 5, r0 = 0.08 + 0.86 * i / N, r1 = 0.08 + 0.86 * (i + 1) / N;
      const P = (a, r) => [Math.cos(a) * r, Math.sin(a) * r];
      const A = P(a0, r0 - w * (0.3 + 0.7 * i / N)), Bq = P(a0, r0 + w * (0.3 + 0.7 * i / N)), C = P(a1, r1 - w * (0.3 + 0.7 * (i + 1) / N)), D = P(a1, r1 + w * (0.3 + 0.7 * (i + 1) / N));
      pos.push(A[0], A[1], 0, Bq[0], Bq[1], 0, D[0], D[1], 0, A[0], A[1], 0, D[0], D[1], 0, C[0], C[1], 0);
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    return (OG.sarmal = g);
  }

  // Ortak: kuş V'si / akan nesneler için güvenli Object3D
  function guvenli(f) { try { return f(); } catch (e) { return null; } }

  // ════════════════════════════════════════════════════════════════════
  // 26 · BALKABAĞI TARLASI — sonbahar öğleden sonrası, açık çiftlik tarlası
  // ════════════════════════════════════════════════════════════════════
  DY_EK[26] = {
    palet: {
      ad: 'Balkabağı Tarlası', gece: 0,
      sisRenk: 0xf6dcb4, sisYogun: 0.0042, arka: 0xf4d8b0,
      gok: [0xffd88c, 0xffcf9a, 0xf6b48c, 0x9cc6ea, 0x5c8ed2], gunesPos: [40, 12], gunesRenk: 0xffd27a,
      ykUst: 0xfff0d4, ykAlt: 0x8a6a34, ykGuc: 1.15, gnRenk: 0xffc070, gnGuc: 2.35, arkaRenk: 0xffb050, arkaGuc: 0.7,
      dag: [[0xb0a4c0, 0xf2d8b8], [0x9c94b4, 0xecd0ac], [0x8e8aa8, 0xe4c8a0]],
      tepe: [0x7e9a3a, 0xbcc45a, 0x9aa468, 0xd6d098],
      agac: [[0xe07818, 0xffb43c], [0xd85a1c, 0xff9038], [0xc89818, 0xffdc50]],
      zemin: [0xc0b860, 0x8a8838, 0xd2c47a], cimen: [0x7a7a2c, 0xd8c864, 0xa8aa48],
      cicek: [[0xe8601c, 0xffa040], [0xc8302a, 0xff6a50], [0xe8b020, 0xffe070], [0xfff0d8, 0xffffff]],
      sisSerit: [0xffe8c4, 0xf8d4a8], siluet: [0x4a2c14, 0x6a4420]
    },
    secenek: {
      agacYok: true, caliYok: true, tepeCicekYok: true, mantarSusYok: true, citYok: true, kusYok: true,
      bulutSay: 7, bulutRenk: [0xf8dcc0, 0xfff6ea], zeminDesen: 'cim', cimenSik: 0.75,
      piknikTur: 'piknik', piknikRenk: [0xc8382c, 0xf6ead2], bayrakRenk: [0xe8661c, 0xffc23a, 0xc8382c, 0xfff2dc, 0x6aa040],
      ucusanTur: 'yaprak', ucusanRenk: [0xe8661c, 0xffb43c, 0xd8402a, 0xffd860],
      salincak: { sarmasik: [0x9a3a1c, 0xe0682a], cicek: [[0xe8601c, 0xffa040], [0xe8b020, 0xffe070], [0xc8302a, 0xff6a50]] }
    },
    yardimci: {
      mantar: { sapka: [0xe0641a, 0xffa040], govde: [0x7a8a2a, 0xa8b850], benek: 0xfff0c0 },
      bulut: { alt: 0xffe8d0, ust: 0xffffff, yanak: 0xffa890, emissive: 0x5a3a20 },
      nilufer: { yaprak: [0x5a8a2a, 0x9cc04a], cicek: [0xe8661c, 0xffb040], halka: 0xfff0c8 },
      ruzgar: { renk: [0xe8a040, 0xfff0c8], emissive: 0xa86018, ok: 0xfff6e0 },
      halka: { renk: [0xe0701c, 0xffc040], emissive: 0xa04810, cicek: [[0xd8402a, 0xff8a50], [0xe8b020, 0xffe070], [0xe8661c, 0xffb040]] },
      baloncuk: { renk: 0xfff0d4, kenar: 0xffffff },
      esinti: { tur: 'yaprak', renk: 0xfff4dc, taneRenk: [0xe8661c, 0xffb43c, 0xd8402a, 0xffd860] }
    },
    yardimciKur: {
      // Salıncağın dibinde minik balkabakları ve saman tutamı
      salincak(ctx, o) {
        const { T, G } = ctx, K = ogKabak(T), S = o.S;
        for (const q of [-1, 1]) {
          const x = q * (o.sapanX + 0.95);
          S.ekle(K, x, 0.34, o.z + 0.55, 0.42, 0.36, 0.4, 0xe0641a, 0xffa040, 0, q, 0);
          S.ekle(G.sil, x, 0.72, o.z + 0.55, 0.05, 0.16, 0.05, 0x5a6a20, 0x8a9a38);
          S.ekle(K, x + q * 0.55, 0.22, o.z + 0.15, 0.26, 0.22, 0.25, 0xe0a020, 0xffd060, 0, q * 2, 0);
        }
      },
      // Mantar yerine iri, gülümseyen balkabağı (tabanı y=0, üstü ~2.5, yarıçap ~1.7)
      mantar(M, i, ctx) {
        const { T, G } = ctx, S = ctx.yapi(), K = ogKabak(T);
        const ton = i % 2 ? [0xd8581a, 0xff9c3c] : [0xe8701c, 0xffb048];
        S.ekle(K, 0, 1.22, 0, 1.82, 1.42, 1.62, ton[0], ton[1]);
        S.ekle(G.sil, 0.05, 2.62, 0, 0.17, 0.5, 0.17, 0x5a6a20, 0x8a9a38, 0, 0, -0.2);           // sap
        S.ekle(G.kureU, -0.62, 2.42, -0.2, 0.62, 0.12, 0.42, 0x4e7a20, 0x86b040, 0, 0.5, 0.25, 0.15); // yapraklar
        S.ekle(G.kureU, 0.66, 2.38, 0.1, 0.5, 0.1, 0.36, 0x4e7a20, 0x86b040, 0, -0.4, -0.2, 0.15);
        S.ekle(G.torusHalka, -0.3, 2.62, 0.3, 0.9, 0.9, 0.9, 0x6a9a30, 0x9cc04a, 0.4, 0.6, 0);       // kıvrık filiz
        // tatlı yüz: kırmızı yanaklar + gülümseme (gözler ayrı: kırpılır)
        for (const q of [-1, 1]) S.ekle(G.kureK, q * 0.78, 1.18, 1.43, 0.24, 0.15, 0.06, 0xff6a50, 0xff8a6a);
        S.ekle(G.torusSap, 0, 1.12, 1.56, 0.95, 0.95, 0.6, 0x5a2a10, 0x6a3418, 0, 0, PI);
        const govde = new T.Mesh(S.geo(), ctx.malz(true, true, 0.6, { roughness: 0.45, emissive: 0xff6a10, emissiveIntensity: 0.32 }));
        const E = ctx.yapi();
        for (const q of [-1, 1]) {
          E.ekle(G.kureK, q * 0.42, 0, 0, 0.13, 0.19, 0.07, 0x3a1c0c, 0x3a1c0c);
          E.ekle(G.kureK, q * 0.42 + 0.04, 0.07, 0.05, 0.04, 0.05, 0.02, 0xffffff, 0xffffff);
        }
        const goz = new T.Mesh(E.geo(), ctx.malz(true, true, 0, { roughness: 0.4 }));
        goz.position.set(0, 1.62, 1.55); govde.add(goz);
        // "buradan zıpla" işareti: tabanda sıcak ışıltı halkası + tepede yukarı akan iki ok
        const I = ctx.yapi();
        I.ekle(G.halka, 0, 0.12, 0, 2.15, 2.15, 0.7, 0xffe08a, 0xfff6d0, PI / 2, 0, 0);
        const im = new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.75, depthWrite: false });
        const hale = new T.Mesh(I.geo(), im);
        const O = ctx.yapi();
        for (const h of [0, 0.55]) for (const q of [-1, 1]) O.ekle(G.kutu, q * 0.24, h, 0, 0.62, 0.15, 0.08, 0xffffff, 0xfff4c0, 0, 0, -q * 0.7);
        const om = new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false });
        const oklar = new T.Mesh(O.geo(), om); oklar.position.set(0, 3.4, 0.6);
        const mesh = new T.Group(); mesh.add(govde); mesh.add(hale); mesh.add(oklar);
        (ctx.veri.zip = ctx.veri.zip || []).push({ govde, oklar, om, im, f: i * 1.3 });
        return { mesh, goz };
      }
    },
    kur(ctx) {
      const { T, G, hx, yerY, tepeY, R, ara } = ctx, S = ctx.yapi(), K = ogKabak(T), PR = ogPrizma(T);
      const xa = -36, xb = hx + 44;
      const yesilY = [0x4e7a20, 0x8ab444];
      // balkabağı (yüzsüz ya da gülümseyen) + yaprak + toprak tümseği
      const kabak = (x, z, s, yuz) => {
        yuz = false; const y = yerY(x, z), rr = R(), ton = rr < 0.4 ? [0xc0703a, 0xe0a06a] : (rr < 0.7 ? [0xc8a058, 0xe8c888] : [0xd8c8a8, 0xf4ead4]);
        S.ekle(G.kureU, x, y - 0.02, z, s * 1.5, s * 0.16, s * 1.2, 0x7a5a2a, 0x9a7a40);
        S.ekle(K, x, y + s * 0.78, z, s * 1.15, s * 0.95, s * 1.05, ton[0], ton[1], 0, R() * PI, 0);
        S.ekle(G.sil, x + s * 0.05, y + s * 1.62, z, s * 0.1, s * 0.34, s * 0.1, 0x5a6a20, 0x8a9a38, 0, 0, -0.25, 0.05);
        S.ekle(G.kureC, x - s * 1.0, y + s * 0.22, z + s * 0.3, s * 0.5, s * 0.12, s * 0.38, yesilY[0], yesilY[1], 0, R() * 3, 0.2, 0.2);
        S.ekle(G.kureC, x + s * 0.95, y + s * 0.2, z - s * 0.2, s * 0.44, s * 0.1, s * 0.34, yesilY[0], yesilY[1], 0, R() * 3, -0.2, 0.2);
        if (yuz) {
          const fz = z + s * 1.02, fy = y + s * 0.86;
          for (const q of [-1, 1]) {
            S.ekle(G.kureK, x + q * s * 0.3, fy + s * 0.18, fz, s * 0.08, s * 0.12, s * 0.05, 0x3a1c0c, 0x3a1c0c);
            S.ekle(G.kureK, x + q * s * 0.55, fy - s * 0.02, fz - s * 0.05, s * 0.15, s * 0.09, s * 0.05, 0xff6a50, 0xff8a6a);
          }
          S.ekle(G.torusSap, x, fy - 0.02 * s, fz + 0.02, s * 0.62, s * 0.62, s * 0.4, 0x5a2a10, 0x6a3418, 0, 0, PI);
        }
      };
      // 1) Sıra sıra balkabağı tarlası (yakın arka, z -3.5 … -9)
      const sira = [[-3.6, 0.48, 3.0], [-6.2, 0.6, 3.3], [-8.8, 0.7, 3.7]];
      for (const [z, s0, ad] of sira) {
        for (let x = xa + R() * 2; x < xb; x += ad * (0.8 + R() * 0.5)) {
          if (R() < 0.3) continue;
          { const ss = s0 * (0.7 + R() * 0.55); kabak(x, z + ara(-0.4, 0.4), ss, z > -4 && ss < 0.6 && R() < 0.3); }
        }
      }
      // birkaç dev, gülümseyen balkabağı (yolun yakınında ama oyun düzleminin gerisinde)
      // (yardımcı balkabağıyla karışmasın: süs olanlar yüzsüz ve daha küçük; yüzlüler yalnız minik)
      for (const [fx, z, s] of [[0.36, -7.6, 0.8], [0.7, -8.0, 0.85]]) kabak(hx * fx, z, s, false);
      // 2) Ahşap çit (tarlanın arka kenarı) — parkur boyunca
      const citZ = -10.8; let onceki = null;
      for (let x = xa; x <= xb; x += 2.6) {
        const y = yerY(x, citZ);
        S.ekle(G.kutu, x, y + 0.55, citZ, 0.16, 1.2, 0.16, 0x7a4e2c, 0xa8784a);
        S.ekle(G.koni4, x, y + 1.22, citZ, 0.12, 0.16, 0.12, 0x7a4e2c, 0x9a6a40, 0, PI / 4, 0);
        if (onceki) {
          const dx = x - onceki[0], dy = y - onceki[1], L = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
          for (const h of [0.42, 0.88]) S.ekle(G.kutu, onceki[0] + dx / 2, onceki[1] + dy / 2 + h, citZ + 0.1, L + 0.1, 0.13, 0.07, 0x8a5a34, 0xb88a56, 0, 0, a);
        }
        onceki = [x, y];
      }
      // 3) Saman balyaları: yuvarlak (yüzü kameraya dönük) ve dikdörtgen
      const yuvarlakBalya = (x, z, s) => {
        const y = yerY(x, z);
        S.ekle(G.sil, x, y + s * 0.62, z, s * 0.66, s * 0.95, s * 0.66, 0xd0a040, 0xf0d070, PI / 2, 0, 0);
        S.ekle(G.halkaInce, x, y + s * 0.62, z + s * 0.48, s * 0.42, s * 0.42, s * 0.5, 0xb8862c, 0xc89838);
        S.ekle(G.halkaInce, x, y + s * 0.62, z + s * 0.48, s * 0.22, s * 0.22, s * 0.5, 0xb8862c, 0xc89838);
      };
      const balya = (x, z, s, ry) => {
        const y = yerY(x, z);
        S.ekle(G.kutu, x, y + s * 0.36, z, s * 1.5, s * 0.72, s * 0.8, 0xd0a442, 0xf4d878, 0, ry || 0, 0);
        for (const q of [-0.4, 0.4]) S.ekle(G.kutu, x + Math.cos(ry || 0) * q * s, y + s * 0.36, z - Math.sin(ry || 0) * q * s, s * 0.06, s * 0.76, s * 0.84, 0x9a6a30, 0xb8843c, 0, ry || 0, 0);
      };
      for (let x = xa + 6; x < xb; x += ara(9, 15)) {
        const z = ara(-14, -22);
        if (R() < 0.5) { yuvarlakBalya(x, z, ara(1.1, 1.5)); yuvarlakBalya(x + ara(1.6, 2.2), z - 0.6, ara(1.0, 1.3)); }
        else { const s = ara(1.0, 1.3), ry = ara(-0.3, 0.3); balya(x, z, s, ry); balya(x + 0.15, z, s * 0.95, ry + 0.08); S.ekle(G.kutu, x + 0.1, yerY(x, z) + s * 1.08, z, s * 1.45, s * 0.7, s * 0.78, 0xd0a442, 0xf4d878, 0, ry + 0.1, 0); }
      }
      // Bilbo'nun yanında küçük saman balyası (ekose örtünün arkası)
      balya(hx + 3.0, -1.9, 0.75, -0.2);
      yuvarlakBalya(hx - 7.5, -2.6, 0.8);
      // 4) Sevimli korkuluk: gülen, hasır şapkalı
      const korkuluk = (x, z, k) => {
        const y = yerY(x, z);
        S.ekle(G.sil, x, y + 1.5 * k, z - 0.05, 0.07 * k, 3.0 * k, 0.07 * k, 0x6a4424, 0x8a6034);
        S.ekle(G.kutu, x, y + 2.42 * k, z - 0.1, 2.5 * k, 0.09 * k, 0.09 * k, 0x6a4424, 0x8a6034);
        S.ekle(G.kule, x, y + 1.62 * k, z, 0.46 * k, 0.55 * k, 0.34 * k, 0x2e5aa0, 0x4a7ac8);                 // tulum
        S.ekle(G.kule, x, y + 2.18 * k, z, 0.5 * k, 0.75 * k, 0.36 * k, 0xc8382c, 0xe8604a, PI, 0, 0);        // ekose gömlek (ters)
        for (const q of [-1, 1]) {
          S.ekle(G.kutu, x + q * 0.12 * k, y + 2.0 * k, z + 0.27 * k, 0.1 * k, 0.75 * k, 0.04 * k, 0x2e5aa0, 0x3a6ab8); // askı
          S.ekle(G.kutu, x + q * 0.68 * k, y + 2.42 * k, z, 0.9 * k, 0.26 * k, 0.26 * k, 0xc8382c, 0xe05a44);     // kollar
          S.ekle(G.kutu, x + q * 0.68 * k, y + 2.42 * k, z + 0.135 * k, 0.04 * k, 0.27 * k, 0.01 * k, 0xffe2a8, 0xffe2a8); // ekose çizgi
          for (const a of [-0.45, 0, 0.45]) S.ekle(G.koni, x + q * 1.24 * k, y + 2.42 * k + a * 0.2 * k, z, 0.07 * k, 0.4 * k, 0.07 * k, 0xd8a840, 0xf8dc70, 0, 0, -q * (PI / 2) + a); // el samanı
        }
        for (const a of [-0.35, 0, 0.35]) S.ekle(G.koni, x + a * 0.25 * k, y + 1.2 * k, z + 0.05, 0.08 * k, 0.42 * k, 0.08 * k, 0xd8a840, 0xf8dc70, 0, 0, PI + a);
        S.ekle(G.kutu, x + 0.12 * k, y + 1.55 * k, z + 0.29 * k, 0.18 * k, 0.18 * k, 0.03 * k, 0xf0c040, 0xffe070); // yama
        // baş: çuval bezi + yüz
        const hy = y + 2.92 * k;
        S.ekle(G.kureO, x, hy, z, 0.44 * k, 0.46 * k, 0.42 * k, 0xe0bc80, 0xf6dcaa);
        for (const q of [-1, 1]) {
          S.ekle(G.kureK, x + q * 0.15 * k, hy + 0.07 * k, z + 0.39 * k, 0.05 * k, 0.07 * k, 0.03 * k, 0x2a1a10, 0x2a1a10);
          S.ekle(G.kureK, x + q * 0.27 * k, hy - 0.08 * k, z + 0.34 * k, 0.08 * k, 0.05 * k, 0.03 * k, 0xff7a6a, 0xff9a88);
        }
        S.ekle(G.torusSap, x, hy - 0.05 * k, z + 0.41 * k, 0.42 * k, 0.42 * k, 0.3 * k, 0x6a2a14, 0x7a3418, 0, 0, PI);
        S.ekle(G.koni, x, hy - 0.02 * k, z + 0.45 * k, 0.05 * k, 0.12 * k, 0.05 * k, 0xff8a30, 0xffb050, PI / 2, 0, 0); // havuç burun
        // hasır şapka
        S.ekle(G.sil, x, hy + 0.36 * k, z, 0.78 * k, 0.06 * k, 0.74 * k, 0xd0a040, 0xf0d070, 0.08, 0, -0.06);
        S.ekle(G.sil, x, hy + 0.56 * k, z, 0.36 * k, 0.38 * k, 0.34 * k, 0xd8ac48, 0xf6dc80, 0.08, 0, -0.06);
        S.ekle(G.sil, x, hy + 0.43 * k, z, 0.37 * k, 0.09 * k, 0.35 * k, 0xc8382c, 0xe85a44, 0.08, 0, -0.06);
        S.ekle(G.kureK, x + 0.32 * k, hy + 0.45 * k, z + 0.2 * k, 0.1 * k, 0.1 * k, 0.06 * k, 0xffd040, 0xfff090); // şapka çiçeği
      };
      korkuluk(hx * 0.42, -7.4, 1.25);
      korkuluk(hx + 16, -6.5, 1.1);
      // 5) Kırmızı ahır + silo (orta katman)
      const ahir = (bx, bz, k) => {
        const by = yerY(bx, bz) - 0.15, W = 7 * k, H = 3.6 * k, D = 5.5 * k, Hg = 2.6 * k;
        S.ekle(G.kutu, bx, by + 0.2, bz, W + 0.3, 0.4, D + 0.3, 0x8e8478, 0xb4aa9c);             // taş temel
        S.ekle(G.kutu, bx, by + H / 2, bz, W, H, D, 0xa82a24, 0xd04a3a);                         // duvarlar
        S.ekle(PR, bx, by + H + 0.5 * Hg / 1.5, bz, W / 2 / 0.866, Hg / 1.5, D, 0xc03a30, 0xd85040); // alın
        const a = Math.atan2(Hg, W / 2), L = Math.hypot(W / 2, Hg) + 0.7 * k;
        for (const q of [-1, 1]) S.ekle(G.kutu, bx + q * (W / 4 + 0.12 * k), by + H + Hg / 2 + 0.16 * k, bz, L, 0.26 * k, D + 0.7 * k, 0x5a3a34, 0x7a5048, 0, 0, -q * a);
        S.ekle(G.kutu, bx, by + H + Hg + 0.18 * k, bz, 0.4 * k, 0.3 * k, D + 0.7 * k, 0x5a3a34, 0x6a4840);
        // beyaz kenarlar + büyük kapı + çapraz çıtalar
        const fz = bz + D / 2 + 0.03;
        for (const q of [-1, 1]) S.ekle(G.kutu, bx + q * W / 2, by + H / 2, fz, 0.22 * k, H, 0.06, 0xf4ece0, 0xffffff);
        S.ekle(G.kutu, bx, by + H, fz, W, 0.2 * k, 0.06, 0xf4ece0, 0xffffff);
        const dw = 2.6 * k, dh = 2.6 * k;
        S.ekle(G.kutu, bx, by + dh / 2, fz + 0.02, dw, dh, 0.05, 0x8a2020, 0xa83028);
        S.ekle(G.kutu, bx, by + dh, fz + 0.05, dw + 0.2 * k, 0.16 * k, 0.05, 0xf4ece0, 0xffffff);
        for (const q of [-1, 0, 1]) S.ekle(G.kutu, bx + q * dw / 2, by + dh / 2, fz + 0.05, 0.14 * k, dh, 0.05, 0xf4ece0, 0xffffff);
        const da = Math.atan2(dh, dw / 2), dl = Math.hypot(dh, dw / 2);
        for (const q of [-1, 1]) for (const s of [-1, 1]) S.ekle(G.kutu, bx + q * dw / 4, by + dh / 2, fz + 0.07, dl * 0.95, 0.12 * k, 0.04, 0xf4ece0, 0xffffff, 0, 0, s * da);
        // samanlık penceresi (saman görünür)
        const wy = by + H + 0.9 * k;
        S.ekle(G.kutu, bx, wy, fz + 0.02, 1.2 * k, 1.1 * k, 0.05, 0xf4ece0, 0xffffff);
        S.ekle(G.kutu, bx, wy, fz + 0.04, 0.95 * k, 0.85 * k, 0.05, 0x5a2a18, 0x6a3420);
        S.ekle(G.kubbe, bx, wy - 0.42 * k, fz + 0.06, 0.45 * k, 0.4 * k, 0.05, 0xd8a840, 0xf8dc70);
        // yan pencere ışığı
        for (const q of [-1, 1]) {
          S.ekle(G.kutu, bx + q * W * 0.33, by + H * 0.62, fz + 0.02, 0.85 * k, 0.75 * k, 0.05, 0xf4ece0, 0xffffff);
          S.ekle(G.kutu, bx + q * W * 0.33, by + H * 0.62, fz + 0.04, 0.65 * k, 0.55 * k, 0.05, 0xffc860, 0xfff0b0);
        }
        // silo
        const sx = bx + W / 2 + 2.0 * k, sz = bz - 0.8 * k, sy = yerY(sx, sz) - 0.1, sh = 7.4 * k, sr = 1.35 * k;
        S.ekle(G.sil, sx, sy + sh / 2, sz, sr, sh, sr, 0x8a9ab0, 0xc8d4e0);
        for (const h of [0.2, 0.42, 0.64, 0.86]) S.ekle(G.sil, sx, sy + sh * h, sz, sr * 1.04, 0.12 * k, sr * 1.04, 0x6a7a90, 0x8a9ab0);
        S.ekle(G.kubbe, sx, sy + sh, sz, sr * 1.04, sr * 0.9, sr * 1.04, 0xb8c4d0, 0xf0f4f8);
        // ahırın önünde: tek çift balya + balkabağı yığını
        yuvarlakBalya(bx - W / 2 - 1.4 * k, bz + D / 2 + 0.8, 1.2 * k);
        kabak(bx + W / 2 + 0.6 * k, bz + D / 2 + 1.2, 0.8 * k, false);
        kabak(bx + W / 2 + 1.7 * k, bz + D / 2 + 0.6, 0.6 * k, false);
      };
      ahir(hx * 0.66, -30, 1.0);
      ahir(-26, -42, 0.9);
      // 6) Tek tük altın-turuncu yapraklı ağaçlar (orta katman)
      const agac = (x, z, k, ci) => {
        const y = yerY(x, z) - 0.1, c = ctx.B.agac[ci % 3];
        S.ekle(G.kule, x, y + 1.6 * k, z, 0.32 * k, 3.2 * k, 0.32 * k, 0x5a3a24, 0x7a5434);
        S.ekle(G.sil, x + 0.45 * k, y + 2.7 * k, z, 0.1 * k, 1.2 * k, 0.1 * k, 0x5a3a24, 0x7a5434, 0, 0, -0.7);
        S.nc = [x, y + 4.0 * k, z];
        for (const [ox, oy, oz, r] of [[0, 4.3, 0, 1.8], [-1.3, 3.7, 0.3, 1.25], [1.35, 3.8, 0.2, 1.3], [-0.5, 5.3, -0.2, 1.2], [0.7, 5.1, 0.5, 1.15], [0.1, 3.4, 0.9, 1.1]])
          S.ekle(G.kureO, x + ox * k, y + oy * k, z + oz * k, r * k, r * 0.85 * k, r * k, c[0], c[1], 0, R() * 3, 0, 0.12);
        S.nc = null;
        for (let j = 0; j < 5; j++) { const a = R() * PI * 2, d = ara(0.6, 2.2) * k; S.ekle(G.daireY, x + Math.cos(a) * d, yerY(x, z) + 0.03, z + Math.sin(a) * d * 0.6, 0.35 * k, 1, 0.35 * k, c[0], c[1]); }
      };
      const agacX = [-18, 6, hx * 0.3, hx * 0.52, hx * 0.86, hx + 9, hx + 28, -34];
      agacX.forEach((x, i) => agac(x + ara(-2, 2), ara(-17, -24), ara(0.85, 1.15), i));
      // 7) Tepelerde sıra sıra saman yığınları ve uzak minik ağaçlar
      for (let r = 0; r < 3; r++) {
        const z = -48 - r * 6;
        for (let x = -70 + r * 3; x < hx + 90; x += ara(4.5, 7)) {
          const y = tepeY(x, z);
          if (y < 0.3) continue;
          S.ekle(G.kureU, x, y - 0.1, z, 0.9, 1.1, 0.9, 0xc89a38, 0xf4d070);
        }
      }
      for (let i = 0; i < 16; i++) {
        const x = ara(-70, hx + 90), z = ara(-46, -66), y = tepeY(x, z), c = ctx.B.agac[i % 3];
        S.ekle(G.sil, x, y + 0.9, z, 0.18, 1.8, 0.18, 0x5a3a24, 0x7a5434);
        S.ekle(G.kureO, x, y + 2.4, z, 1.3, 1.4, 1.3, c[0], c[1]);
      }
      // 8) Hasat ızgarası: el arabası, elma sepetleri
      const sepet = (x, z, s) => {
        const y = yerY(x, z);
        S.ekle(G.kule, x, y + 0.3 * s, z, 0.5 * s, 0.6 * s, 0.5 * s, 0xa87038, 0xd09a58, PI, 0, 0);
        for (const h of [0.15, 0.4]) S.ekle(G.sil, x, y + h * s, z, 0.56 * s - h * 0.1 * s, 0.05 * s, 0.56 * s - h * 0.1 * s, 0x8a5a2c, 0xa87038);
        for (const [ox, oz, oy] of [[-0.2, 0.1, 0], [0.18, 0.14, 0], [0, -0.15, 0], [0.02, 0.05, 0.14], [-0.15, -0.12, 0.05], [0.2, -0.1, 0.04]])
          S.ekle(G.kureK, x + ox * s, y + (0.66 + oy) * s, z + oz * s, 0.17 * s, 0.16 * s, 0.17 * s, R() < 0.75 ? 0xc0201c : 0x7aa82a, R() < 0.75 ? 0xff5040 : 0xb8d84a);
        S.ekle(G.torusSap, x, y + 0.62 * s, z, 1.25 * s, 1.0 * s, 1.25 * s, 0x8a5a2c, 0xa87038);
      };
      sepet(hx - 6.2, -2.0, 1.0); sepet(hx - 5.3, -2.7, 0.85); sepet(-7.2, -2.4, 1.0); sepet(hx * 0.42 + 2.2, -6.2, 0.9);
      const elArabasi = (x, z, ry) => {
        const y = yerY(x, z), c = Math.cos(ry), s = Math.sin(ry), P = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
        let p = P(0, 0); S.ekle(G.kutu, p[0], y + 0.62, p[1], 1.4, 0.45, 0.85, 0x3a7a3a, 0x5aa056, 0, ry, 0);
        p = P(0.75, 0); S.ekle(G.halka, p[0], y + 0.33, p[1], 0.3, 0.3, 0.6, 0x3a2a24, 0x5a443a, 0, ry, 0);
        S.ekle(G.kureK, p[0], y + 0.33, p[1], 0.08, 0.08, 0.12, 0xd8a040, 0xf0c060);
        for (const q of [-1, 1]) {
          p = P(-0.95, q * 0.32); S.ekle(G.kutu, p[0], y + 0.66, p[1], 1.2, 0.07, 0.07, 0x8a5a34, 0xa87048, 0, ry, -0.18);
          p = P(-0.45, q * 0.3); S.ekle(G.kutu, p[0], y + 0.24, p[1], 0.07, 0.5, 0.07, 0x5a3a24, 0x7a5434);
        }
        for (const [lx, lz, sz] of [[-0.25, 0.1, 0.42], [0.3, -0.05, 0.36], [0.05, 0.05, 0.3]]) { p = P(lx, lz); S.ekle(K, p[0], y + 0.92 + sz * 0.4, p[1], sz, sz * 0.82, sz, 0xe0641a, 0xffa040, 0, R() * 3, 0); }
      };
      elArabasi(hx + 6.2, -2.4, -0.35);
      elArabasi(hx * 0.2 - 3, -2.8, 0.3);
      // 9) Yakın ön süsler (alçak): minik balkabakları, saman tutamları, düşmüş yapraklar
      const yRenk = [[0xd8501c, 0xff8a3a], [0xe8a020, 0xffd050], [0xc8302a, 0xff6040], [0xb86a20, 0xe89a40]];
      for (let i = 0; i < 160; i++) {
        const x = ara(xa, xb), z = ara(-3, 4.2);
        if (z > -0.8 && z < 0.8) continue;
        const c = yRenk[i % 4];
        S.ekle(G.daireY, x, 0.03 + R() * 0.01, z, ara(0.12, 0.22), 1, ara(0.09, 0.16), c[0], c[1], 0, R() * PI, 0);
      }
      for (let x = xa + 3; x < xb; x += ara(5, 9)) {
        const z = ara(1.6, 3.6);
        if (Math.abs(x - hx) < 5 || Math.abs(x) < 3) continue;
        if (R() < 0.45) kabak(x, z, ara(0.28, 0.4), false);
        else for (let j = 0; j < 4; j++) S.ekle(G.koni, x + j * 0.12 - 0.18, 0.18, z, 0.05, 0.4, 0.05, 0xc8a040, 0xf4d878, 0, 0, (j - 1.5) * 0.25, 0.15);
      }
      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0.3, { roughness: 0.82, emissive: 0x3a2008, emissiveIntensity: 0.18 })));

      // 10) Alçak güneşin uzun sıcak ışık huzmeleri (gökte; dağların arkasında kalır)
      const gp = ctx.B.gunesPos;
      const hm = new T.ShaderMaterial({
        transparent: true, depthWrite: false, fog: false, blending: T.AdditiveBlending,
        uniforms: { uT: ctx.U.uT, uC: { value: new T.Color(0xffd890) } },
        vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'varying vec2 vP; uniform float uT; uniform vec3 uC; void main(){ float r = length(vP); float a = atan(vP.y, vP.x);' +
          ' float ray = pow(0.5 + 0.5 * sin(a * 9.0 + sin(a * 4.0 + uT * 0.07) * 1.3 + uT * 0.025), 5.0) * (0.6 + 0.4 * sin(a * 3.0 - uT * 0.04));' +
          ' float k = exp(-r * 0.011) * smoothstep(7.0, 20.0, r); gl_FragColor = vec4(uC, ray * k * 0.2); }'
      });
      const huzme = new T.Mesh(new T.PlaneGeometry(420, 240), hm);
      huzme.position.set(20 + gp[0], 40 + gp[1], -146); huzme.renderOrder = -9;
      ctx.ekle(huzme);

      // 11) Göçmen kuşların "V"si (uzakta, tek InstancedMesh)
      const KB = ctx.yapi();
      for (const q of [-1, 1]) KB.ekle(G.kutu, q * 0.34, 0.1, 0, 0.72, 0.07, 0.2, 0x4a3a44, 0x5a4a54, 0, 0, q * -0.42);
      KB.ekle(G.kureK, 0, 0, 0, 0.16, 0.12, 0.14, 0x4a3a44, 0x5a4a54);
      const N = 11, kus = new T.InstancedMesh(KB.geo(), new T.MeshBasicMaterial({ vertexColors: true }), N);
      kus.frustumCulled = false; ctx.ekle(kus);
      ctx.veri.kus = kus; ctx.veri.o = new T.Object3D(); ctx.veri.N = N;
    },
    guncelle(t, dt, ctx) {
      const v = ctx.veri;
      if (v.zip) for (const z of v.zip) {
        const b = Math.abs(Math.sin(t * 2.6 + z.f));
        z.govde.position.y = b * 0.22; z.govde.scale.set(1 + (1 - b) * 0.05, 1 - (1 - b) * 0.06, 1 + (1 - b) * 0.05);
        const u = (t * 0.9 + z.f) % 1;
        z.oklar.position.y = 3.3 + u * 0.9 + b * 0.22; z.om.opacity = Math.sin(u * PI) * 0.95;
        z.im.opacity = 0.45 + 0.3 * Math.sin(t * 3 + z.f);
      }
      const kus = v.kus; if (!kus) return;
      const o = v.o, aralik = ctx.hx + 150, x0 = ((t * 1.6) % aralik) - 60;
      for (let i = 0; i < v.N; i++) {
        const sira = Math.ceil(i / 2), yan = i === 0 ? 0 : (i % 2 ? 1 : -1);
        o.position.set(x0 - sira * 2.4, 30 + yan * sira * 1.35 + Math.sin(t * 0.7 + i) * 0.2, -70);
        o.rotation.set(0, 0, 0);
        const cp = 0.55 + 0.45 * Math.sin(t * 5.5 + i * 0.9);
        o.scale.set(2.1, 2.1 * cp, 2.1);
        o.updateMatrix(); kus.setMatrixAt(i, o.matrix);
      }
      kus.instanceMatrix.needsUpdate = true;
    }
  };

  // ════════════════════════════════════════════════════════════════════
  // 30 · ŞEKER DİYARI — kremadan zemin, lolipop ağaçları, kurabiye evleri, dondurma dağları
  // (arka planda mor ve sarı az: Pırıl mor, yıldızlar sarı)
  // ════════════════════════════════════════════════════════════════════
  const SK = { pembe: [0xff7aa8, 0xffc4da], nane: [0x5ad0a8, 0xb8f4dc], mavi: [0x5ab4f0, 0xbce6ff], turuncu: [0xff8a50, 0xffc4a0], kirmizi: [0xf04a5a, 0xff9aa4], beyaz: [0xf4f0f4, 0xffffff] };
  const SK_RENK = [SK.pembe, SK.nane, SK.mavi, SK.turuncu, SK.kirmizi];
  DY_EK[30] = {
    palet: {
      ad: 'Şeker Diyarı', gece: 0,
      sisRenk: 0xffe4ee, sisYogun: 0.0042, arka: 0xffe2ec,
      gok: [0xfff2f0, 0xffdcea, 0xd4f4ea, 0xa4dcf6, 0x6cb6ec], gunesPos: [58, 24], gunesRenk: 0xfff4ec,
      ykUst: 0xfff4fa, ykAlt: 0xd890a8, ykGuc: 1.25, gnRenk: 0xfff0f0, gnGuc: 2.05, arkaRenk: 0xffb8d4, arkaGuc: 0.55,
      dag: [[0xf4b8cc, 0xffe4ee], [0xa8e0cc, 0xf2fbf6], [0xf0c8b0, 0xfff0e6]],
      tepe: [0x9ee4c4, 0xd8fff0, 0xffc4da, 0xffeef4],
      agac: [[0xff6a9a, 0xffb4cc], [0x48c89c, 0x9cecd0], [0x4aa8e8, 0xa8dcff]],
      zemin: [0xffd4e4, 0xf2aac6, 0xffeee4], cimen: [0xf4a8c4, 0xffffff, 0xc8f4e4],
      cicek: [[0xff6a9a, 0xffb4cc], [0x48c89c, 0x9cecd0], [0x4aa8e8, 0xa8dcff], [0xff8a50, 0xffc4a0]],
      sisSerit: [0xfff4f8, 0xffe0ec], siluet: [0x8a3a5a, 0xc86a8a]
    },
    secenek: {
      agacYok: true, caliYok: true, kulubeYok: true, degirmenYok: true, tepeCicekYok: true, cicekYok: true, cimenYok: true,
      mantarSusYok: true, citYok: true, kusYok: true, onSiluetYok: true, piknikTur: 'yok',
      dagKarli: true, dagYukseklik: 0.85, bulutSay: 10, bulutRenk: [0xffbcd8, 0xfff4fa],
      zeminDesen: 'bulut', zeminParlak: 0.07, ucusanTur: 'yok',
      bayrakRenk: [0xff6a9a, 0x5ad0a8, 0x5ab4f0, 0xff8a50, 0xffffff],
      salincak: { govde: [0xffffff, 0xff8aa8], tacYok: true, sarmasikYok: true, cicekYok: true, kusYok: true }
    },
    yardimci: {
      mantar: { sapka: [[0xf04a5a, 0xff9aa4], [0x48c89c, 0x9cecd0], [0xff8a50, 0xffc4a0]], govde: [0xfff0f4, 0xffffff], benek: 0xffffff },
      bulut: { alt: 0xffb4d4, ust: 0xfff4fa, yanak: 0xff6a9a, emissive: 0x7a3050 },
      nilufer: { yaprak: [0x48c89c, 0x9cecd0], cicek: [0xff6a9a, 0xffc4da], halka: 0xffffff },
      ruzgar: { renk: [0xff7aa8, 0xffffff], emissive: 0xc84a78, ok: 0xffffff },
      halka: { renk: [0xff5a8a, 0xffd4e4], emissive: 0xd03a6a, cicek: [[0x5ad0a8, 0xb8f4dc], [0x5ab4f0, 0xbce6ff], [0xff8a50, 0xffc4a0], [0xffffff, 0xffffff]] },
      baloncuk: { renk: 0xff9ac8, kenar: 0xffe4f0, cizgi: 0xff5a9a, opaklik: 1.1 },
      esinti: { tur: 'cizgi', renk: 0xffffff, taneRenk: [0xff7aa8, 0x5ad0a8, 0x5ab4f0, 0xff8a50] }
    },
    yardimciKur: {
      // Salıncak: şeker kamışı direkler, tepelerinde sarmal lolipoplar, kemerde renkli şekerler
      salincak(ctx, o) {
        const { T, G } = ctx, DK = ogKalp(T), SR = ogSarmal(T), A = o.A, z = o.z, sx = o.sapanX;
        for (const q of [-1, 1]) {
          const c = q < 0 ? SK.pembe : SK.nane, x = q * (sx + 0.85);
          A.ekle(G.sil, x, 5.3, z - 0.45, 0.07, 1.3, 0.07, 0xf0eaea, 0xffffff, 0, 0, 0, 0.1);
          A.ekle(DK, x, 6.15, z - 0.45, 0.95, 0.95, 0.22, c[0], c[1], 0, 0, 0, 0.18);
          A.ekle(SR, x, 6.15, z - 0.33, 0.95, 0.95, 1, 0xffffff, 0xffffff, 0, 0, q, 0.18);
          A.nc = [q * sx, 5.4, z - 0.3];
          for (const [dx, dy, r] of [[0.2, 5.25, 0.55], [-0.25, 5.45, 0.45], [0.55, 5.0, 0.4]]) A.ekle(G.kureO, q * (sx + dx), dy, z - 0.3, r * 1.1, r * 0.9, r, 0xffb4d4, 0xfff0f8, 0, 0, 0, 0.2); // pamuk şeker
          A.nc = null;
        }
        for (let i = 1; i < 12; i++) {
          const u = i / 12, x = -sx + 2 * sx * u, y = 4.74 + 1.15 * (1 - Math.pow(2 * u - 1, 2)) + 0.12, c = SK_RENK[i % 5];
          A.ekle(G.kureO, x, y, z - 0.05, 0.2, 0.2, 0.2, c[0], c[1], 0, 0, 0, 0.12);
        }
      },
      // Mantar yerine parlak, şekerli jöle (tabanı y=0, üstü ~2.6, yarıçap ~1.7)
      mantar(M, i, ctx) {
        const { T, G } = ctx, S = ctx.yapi();
        const c = [[0xe0304a, 0xff8a9a], [0x30b888, 0x8ef0c8], [0xff7030, 0xffb890]][i % 3];
        S.nc = [0, 0.9, 0];
        S.ekle(G.kubbe, 0, 0, 0, 1.75, 2.3, 1.6, c[0], c[1]);
        S.nc = null;
        S.ekle(G.sil, 0, 0.06, 0, 1.82, 0.14, 1.66, c[0], c[0]);
        for (let k = 0; k < 6; k++) { const a = k / 6 * PI * 2; S.ekle(G.kutu, Math.cos(a) * 1.0, 1.2, Math.sin(a) * 1.0 + 0.2, 0.06, 1.6, 0.06, c[1], 0xffffff, 0, -a, 0.12); } // yivler
        for (let k = 0; k < 14; k++) { const a = k * 2.4, h = 0.5 + (k % 5) * 0.35, rr = Math.sqrt(Math.max(0, 1 - Math.pow((h) / 2.3, 2))); S.ekle(G.kureK, Math.cos(a) * 1.7 * rr, h, Math.sin(a) * 1.55 * rr, 0.06, 0.06, 0.06, 0xffffff, 0xffffff); } // şeker taneleri
        for (const q of [-1, 1]) S.ekle(G.kureK, q * 0.72, 1.05, 1.42, 0.22, 0.14, 0.06, 0xff5a8a, 0xff8aac);
        S.ekle(G.torusSap, 0, 1.0, 1.52, 0.8, 0.8, 0.5, 0x5a1a2a, 0x6a2434, 0, 0, PI);
        const mesh = new T.Mesh(S.geo(), ctx.malz(true, true, 0.45, { roughness: 0.18, emissive: c[0], emissiveIntensity: 0.22 }));
        const E = ctx.yapi();
        for (const q of [-1, 1]) {
          E.ekle(G.kureK, q * 0.4, 0, 0, 0.13, 0.19, 0.07, 0x2a0e18, 0x2a0e18);
          E.ekle(G.kureK, q * 0.4 + 0.04, 0.07, 0.05, 0.045, 0.055, 0.02, 0xffffff, 0xffffff);
        }
        const goz = new T.Mesh(E.geo(), ctx.malz(true, true, 0, { roughness: 0.4 }));
        goz.position.set(0, 1.5, 1.5); mesh.add(goz);
        return { mesh, goz };
      }
    },
    kur(ctx) {
      const { T, G, hx, yerY, tepeY, R, ara } = ctx, S = ctx.yapi(), DK = ogKalp(T), SR = ogSarmal(T), PR = ogPrizma(T);
      const xa = -38, xb = hx + 46, rk = () => SK_RENK[Math.floor(R() * SK_RENK.length)];
      // 1) Dev lolipop ağaçları (yassı sarmal ve yuvarlak), şeker kamışı direkleri
      const lolipop = (x, z, k, c, yuvarlak) => {
        const y = yerY(x, z) - 0.1, h = 4.2 * k;
        S.ekle(G.sil, x, y + h / 2, z, 0.12 * k, h, 0.12 * k, 0xf0eaea, 0xffffff);
        if (yuvarlak) {
          S.ekle(G.kure, x, y + h + 1.2 * k, z, 1.35 * k, 1.35 * k, 1.35 * k, c[0], c[1], 0, 0, 0, -0.12);
          S.ekle(G.halkaInce, x, y + h + 1.2 * k, z, 1.37 * k, 1.37 * k, 1.37 * k, 0xffffff, 0xffffff, 0, R() * 3, 0.5, -0.12);
          S.ekle(G.halkaInce, x, y + h + 1.2 * k, z, 1.37 * k, 1.37 * k, 1.37 * k, 0xffffff, 0xffffff, PI / 2, R() * 3, 0, -0.12);
        } else {
          const r = 1.75 * k;
          S.ekle(DK, x, y + h + r * 0.85, z, r, r, 0.32 * k, c[0], c[1], 0, 0, 0, -0.14);
          S.ekle(SR, x, y + h + r * 0.85, z + 0.17 * k, r, r, 1, 0xffffff, 0xffffff, 0, 0, R() * 6, -0.14);
          S.ekle(G.torusYuva, x, y + h + 0.1 * k, z, 0.6 * k, 0.6 * k, 0.6 * k, c[0], c[1], PI / 2, 0, 0); // fiyonk düğümü
          for (const q of [-1, 1]) S.ekle(G.koni, x + q * 0.38 * k, y + h + 0.1 * k, z + 0.05, 0.2 * k, 0.5 * k, 0.12 * k, c[0], c[1], 0, 0, -q * PI / 2);
        }
      };
      const kamis = (x, z, k) => {
        const y = yerY(x, z) - 0.05, n = 9, h = 3.6 * k;
        for (let j = 0; j < n; j++) S.ekle(G.sil, x, y + (j + 0.5) * h / n, z, 0.17 * k, h / n * 1.02, 0.17 * k, j % 2 ? 0xffffff : 0xe8364a, j % 2 ? 0xffffff : 0xff5a6a, 0, j * 0.4, 0.06 * (j % 2 ? 1 : -1));
        S.ekle(G.torusSap, x + 0.38 * k, y + h, z, 1.0 * k, 1.0 * k, 3.4 * k, 0xe8364a, 0xffffff);
        S.ekle(G.sil, x + 0.76 * k, y + h - 0.25 * k, z, 0.17 * k, 0.5 * k, 0.17 * k, 0xffffff, 0xe8364a);
      };
      const lx = [-34, -22, -10, 2, hx * 0.16, hx * 0.3, hx * 0.44, hx * 0.58, hx * 0.72, hx * 0.86, hx + 6, hx + 18, hx + 32];
      lx.forEach((x, i) => {
        const z = ara(-16, -24), k = ara(1.1, 1.5);
        lolipop(x + ara(-2, 2), z, k, SK_RENK[i % SK_RENK.length], i % 3 === 2);
        if (R() < 0.7) lolipop(x + ara(3, 5), z - ara(2, 5), k * 0.75, SK_RENK[(i + 2) % SK_RENK.length], i % 2 === 0);
      });
      for (let x = xa + 4; x < xb; x += ara(10, 16)) kamis(x, ara(-6, -9), ara(0.85, 1.1));
      // 2) Zencefilli kurabiye evleri (şekerleme süslü)
      const ev = (bx, bz, k, cat) => {
        const by = yerY(bx, bz) - 0.12, W = 4.4 * k, H = 3.0 * k, D = 3.6 * k, Hg = 2.4 * k;
        S.ekle(G.kutu, bx, by + H / 2, bz, W, H, D, 0xa8622c, 0xc88048);
        const a = Math.atan2(Hg, W / 2 + 0.4 * k), L = Math.hypot(W / 2 + 0.4 * k, Hg) + 0.3 * k;
        S.ekle(PR, bx, by + H + 0.5 * Hg / 1.5, bz, W / 2 / 0.866, Hg / 1.5, D, 0xa8622c, 0xc07840);
        for (const q of [-1, 1]) {
          S.ekle(G.kutu, bx + q * (W / 4 + 0.1 * k), by + H + Hg / 2 + 0.12 * k, bz, L, 0.32 * k, D + 0.6 * k, cat[0], cat[1], 0, 0, -q * a);
          // çatı kenarı krema damlaları
          for (let j = 0; j < 6; j++) {
            const u = (j + 0.5) / 6, ex = bx + q * (W / 2 + 0.25 * k) * (1 - u), ey = by + H + Hg * u - 0.05 * k;
            S.ekle(G.kureK, ex, ey, bz + D / 2 + 0.32 * k, 0.2 * k, 0.26 * k, 0.12 * k, 0xffffff, 0xffffff);
          }
          for (let j = 0; j < 3; j++) S.ekle(G.kureK, bx + q * (W / 4 + 0.1 * k) + (j - 1) * 0.6 * k * Math.cos(a), by + H + Hg / 2 + 0.36 * k + (j - 1) * -q * 0.6 * k * Math.sin(a), bz + (j - 1) * 0.5, 0.2 * k, 0.18 * k, 0.2 * k, SK_RENK[(j + (q > 0 ? 2 : 0)) % 5][0], SK_RENK[(j + (q > 0 ? 2 : 0)) % 5][1]); // jelibonlar
        }
        S.ekle(G.kureO, bx, by + H + Hg + 0.25 * k, bz, 0.35 * k, 0.35 * k, 0.35 * k, 0xe8304a, 0xff7a8a); // tepede kiraz
        const fz = bz + D / 2 + 0.03;
        // kapı + kamış kenarlar
        S.ekle(G.kutu, bx, by + 0.85 * k, fz, 1.1 * k, 1.7 * k, 0.06, 0x6a3418, 0x8a4a24);
        S.ekle(G.kubbe, bx, by + 1.62 * k, fz, 0.55 * k, 0.35 * k, 0.05, 0x6a3418, 0x8a4a24);
        S.ekle(G.kureK, bx + 0.35 * k, by + 0.85 * k, fz + 0.06, 0.08 * k, 0.08 * k, 0.05, 0xffffff, 0xffffff);
        // pencereler (beyaz krema çerçeveli, pembe ışık)
        for (const q of [-1, 1]) {
          S.ekle(G.kutu, bx + q * 1.4 * k, by + 1.75 * k, fz + 0.02, 0.95 * k, 0.95 * k, 0.05, 0xffffff, 0xffffff);
          S.ekle(G.kutu, bx + q * 1.4 * k, by + 1.75 * k, fz + 0.04, 0.72 * k, 0.72 * k, 0.05, 0xffb4cc, 0xffe4ee);
          S.ekle(G.kutu, bx + q * 1.4 * k, by + 1.75 * k, fz + 0.07, 0.72 * k, 0.07 * k, 0.03, 0xffffff, 0xffffff);
          S.ekle(G.kutu, bx + q * 1.4 * k, by + 1.75 * k, fz + 0.07, 0.07 * k, 0.72 * k, 0.03, 0xffffff, 0xffffff);
        }
        // duvar boyunca krema dalgası ve draje sırası
        for (let j = 0; j < 9; j++) {
          const ex = bx - W / 2 + (j + 0.5) * W / 9;
          S.ekle(G.kureK, ex, by + H - 0.05 * k, fz + 0.04, 0.27 * k, 0.17 * k, 0.1 * k, 0xffffff, 0xffffff);
          const c = SK_RENK[j % 5]; S.ekle(G.kureK, ex, by + 0.32 * k, fz + 0.06, 0.16 * k, 0.16 * k, 0.07 * k, c[0], c[1]);
        }
        kamis(bx - W / 2 - 0.4 * k, bz + D / 2, 0.75 * k);
        kamis(bx + W / 2 + 0.1 * k, bz + D / 2, 0.75 * k);
      };
      ev(hx * 0.32, -27, 1.3, SK.pembe);
      ev(hx * 0.78, -31, 1.35, SK.nane);
      ev(-20, -30, 1.25, SK.mavi);
      ev(hx + 22, -28, 1.3, SK.pembe);
      // 3) Dondurma külahı dağları (külah + top + krema + kiraz)
      const dondurma = (x, z, k, top) => {
        const b = Math.max(yerY(x, z), tepeY(x, z)) - 0.6 * k, y = b + 0.6 * k;
        // krema dağı: külahın ucu bu kabarık krema tepesine gömülü (havada durmasın)
        const kc = top[top.length - 1];
        S.nc = [x, b - 2, z];
        S.ekle(G.kubbe, x, b - 2, z, 10 * k, 7.6 * k, 6.5 * k, 0xe06a94, 0xff9cbc);
        S.ekle(G.kubbe, x - 7 * k, b - 1.5, z + 2, 6 * k, 4.6 * k, 4.5 * k, 0x5ac8a0, 0xa8ecd0);
        S.ekle(G.kubbe, x + 7.4 * k, b - 1.5, z + 1.5, 5.5 * k, 4.0 * k, 4.5 * k, 0xf0a070, 0xffd0b0);
        for (let d = 0; d < 7; d++) { const a = -0.5 + d * 0.17; S.ekle(G.kureU, x + Math.sin(a * 2.4) * 9.2 * k, b + 3.4 * k - Math.abs(a) * 3 * k, z + 4 * k, 0.9 * k, 1.6 * k, 0.6 * k, 0xfff0f6, 0xffffff); } // krema damlaları
        S.nc = null;
        S.ekle(G.koni, x, y + 4.5 * k, z, 3.6 * k, 9 * k, 3.6 * k, 0xe8b070, 0xc88848, PI, 0, 0); // külah (ucu aşağı)
        for (const h of [0.25, 0.5, 0.75]) S.ekle(G.halkaInce, x, y + 9 * k * h, z, 3.6 * k * h, 3.6 * k * h, 3.6 * k * h * 0.6, 0xb87838, 0xb87838, PI / 2, 0, 0);
        S.ekle(G.sil, x, y + 9.1 * k, z, 3.8 * k, 0.6 * k, 3.8 * k, 0xd89858, 0xe8b070);
        let yy = y + 9.4 * k;
        top.forEach((c, j) => {
          const r = (3.7 - j * 0.9) * k;
          S.nc = [x, yy + r * 0.6, z];
          S.ekle(G.kureO, x, yy + r * 0.55, z, r, r * 0.82, r, c[0], c[1]);
          for (let d = 0; d < 6; d++) { const a = d / 6 * PI * 2 + j; S.ekle(G.kureU, x + Math.cos(a) * r * 0.86, yy + r * 0.15 - (d % 2) * 0.35 * k, z + Math.sin(a) * r * 0.8, 0.5 * k, 0.9 * k, 0.5 * k, c[0], c[1]); } // damlalar
          S.nc = null;
          yy += r * 1.15;
        });
        S.ekle(G.kureO, x, yy + 0.2 * k, z, 1.3 * k, 0.9 * k, 1.3 * k, 0xfff4f8, 0xffffff); // krema
        S.ekle(G.kure, x, yy + 1.4 * k, z, 0.75 * k, 0.75 * k, 0.75 * k, 0xd8203a, 0xff6a7a);   // kiraz
        S.ekle(G.sil, x + 0.4 * k, yy + 2.5 * k, z, 0.08 * k, 1.5 * k, 0.08 * k, 0x3a8a3a, 0x5aaa4a, 0, 0, -0.5);
        for (let d = 0; d < 10; d++) { const c = SK_RENK[d % 5]; S.ekle(G.kutu, x + ara(-2.4, 2.4) * k, yy - ara(0.5, 2.5) * k, z + 2.6 * k, 0.35 * k, 0.1 * k, 0.1 * k, c[0], c[1], 0, 0, R() * 3); } // renkli şeker serpintisi
      };
      dondurma(-40, -43, 0.85, [SK.pembe, [0xf4ece0, 0xfffaf2]]);
      dondurma(hx * 0.16, -45, 0.95, [[0x8a5030, 0xb07850], SK.pembe]);
      dondurma(hx * 0.6, -43, 0.85, [SK.nane, [0xf4ece0, 0xfffaf2]]);
      dondurma(hx + 26, -45, 0.95, [SK.pembe, SK.nane]);
      dondurma(hx + 64, -43, 0.85, [[0x8a5030, 0xb07850], [0xf4ece0, 0xfffaf2]]);
      // 4) Tepelerde krema damlası tepecikler ve minik lolipoplar
      for (let i = 0; i < 26; i++) {
        const x = ara(-70, hx + 90), z = ara(-46, -66), y = tepeY(x, z), c = rk();
        if (R() < 0.5) { S.ekle(G.sil, x, y + 1.0, z, 0.12, 2.0, 0.12, 0xffffff, 0xffffff); S.ekle(G.kureO, x, y + 2.6, z, 0.9, 0.9, 0.9, c[0], c[1]); }
        else S.ekle(G.kubbe, x, y - 0.2, z, 1.6, 1.6, 1.6, c[0], c[1]);
      }
      // 5) Jöle tepecikleri (parlak) — ayrı malzeme
      const sargili = (x, z, s, c) => {
        const y = yerY(x, z);
        S.ekle(G.kureO, x, y + s * 0.42, z, s * 0.85, s * 0.42, s * 0.5, c[0], c[1], 0, 0, 0);
        for (const q of [-1, 1]) S.ekle(G.koni, x + q * s * 1.05, y + s * 0.42, z, s * 0.38, s * 0.5, s * 0.3, c[1], c[0], 0, 0, q * PI / 2);
        S.ekle(G.kutu, x, y + s * 0.42, z + s * 0.47, s * 0.14, s * 0.7, s * 0.04, 0xffffff, 0xffffff, 0, 0, 0.35);
      };
      const JR = [[0xe0304a, 0xff8a9a], [0x30b888, 0x8ef0c8], [0xff7030, 0xffb890], [0x3090e0, 0x90d0ff]];
      for (let x = xa + 2; x < xb; x += ara(4, 8)) {
        const z = ara(-8.6, -9.8);
        sargili(x, z, ara(0.55, 0.85), rk());
        if (R() < 0.5) { const c = rk(), s2 = ara(0.3, 0.45), xx = x + ara(1.4, 2.2), zz = z + ara(0.5, 1.2); S.ekle(G.kureK, xx, yerY(xx, zz) + s2 * 0.3, zz, s2 * 1.4, s2 * 0.5, s2 * 1.4, c[0], c[1]); }
      }
      // 6) Renkli draje taşları ve krema damlaları (yakın arka + ön)
      for (let i = 0; i < 300; i++) {
        const x = ara(xa, xb), z = i < 140 ? ara(-9.5, -1.0) : ara(1.2, 8);
        if ((Math.abs(x) < 4 || (z > 0 && Math.abs(x - hx) < 4.5)) && z > -1.5) continue;
        const c = rk(), s = ara(0.14, 0.3);
        S.ekle(G.kureK, x, yerY(x, z) + s * 0.4, z, s, s * 0.55, s, c[0], c[1], 0, R() * 3, ara(-0.3, 0.3));
      }
      for (let i = 0; i < 40; i++) {
        const x = ara(xa, xb), z = ara(-9, -2);
        S.ekle(G.kubbe, x, yerY(x, z) - 0.05, z, ara(0.4, 0.8), ara(0.3, 0.5), ara(0.4, 0.7), 0xfff4f8, 0xffffff);
      }
      for (let x = xa; x < xb; x += ara(5, 9)) {
        const z = ara(2, 7), y = 0.06, c = rk();
        if (Math.abs(x - hx) < 5) continue;
        if (R() < 0.55) {
          S.ekle(DK, x, y, z, 0.55, 0.55, 0.12, 0xc88048, 0xe0a060, -PI / 2, 0, 0);
          S.ekle(DK, x, y + 0.07, z, 0.45, 0.45, 0.04, c[0], c[1], -PI / 2, 0, 0);
          for (let j = 0; j < 4; j++) S.ekle(G.kutu, x + ara(-0.25, 0.25), y + 0.1, z + ara(-0.25, 0.25), 0.14, 0.03, 0.04, 0xffffff, 0xffffff, 0, R() * 3, 0);
        } else {
          S.ekle(G.kubbe, x, -0.05, z, 0.5, 0.42, 0.45, 0xfff4f8, 0xffffff);
          S.ekle(G.kureK, x, 0.42, z, 0.12, 0.12, 0.12, 0xd8203a, 0xff6a7a);
        }
      }
      // 7) Bilbo'nun pasta tabağı + pasta + kek
      S.ekle(DK, hx, 0.06, -0.1, 2.0, 1.7, 0.12, 0xf0e8f0, 0xffffff, -PI / 2, 0, 0);
      S.ekle(G.halka, hx, 0.12, -0.1, 2.0, 1.7, 0.45, 0xff8ab0, 0xffaac8, PI / 2, 0, 0);
      const pasta = (x, z, s) => {
        S.ekle(G.sil, x, 0.12 * s, z, 0.9 * s, 0.24 * s, 0.9 * s, 0xf0e8f0, 0xffffff);
        S.ekle(G.sil, x, 0.5 * s, z, 0.75 * s, 0.5 * s, 0.75 * s, 0xffb4cc, 0xffd4e2);
        S.ekle(G.sil, x, 0.78 * s, z, 0.77 * s, 0.08 * s, 0.77 * s, 0xffffff, 0xffffff);
        S.ekle(G.sil, x, 1.02 * s, z, 0.52 * s, 0.4 * s, 0.52 * s, 0xfff0e0, 0xfffaf2);
        for (let j = 0; j < 8; j++) { const a = j / 8 * PI * 2; S.ekle(G.kureK, x + Math.cos(a) * 0.5 * s, 1.24 * s, z + Math.sin(a) * 0.5 * s, 0.1 * s, 0.09 * s, 0.1 * s, 0xffffff, 0xffffff); }
        S.ekle(G.kureO, x, 1.36 * s, z, 0.16 * s, 0.16 * s, 0.16 * s, 0xd8203a, 0xff6a7a);
      };
      pasta(hx + 2.9, -1.5, 0.9);
      const kek = (x, z, s, c) => {
        S.ekle(G.kule, x, 0.25 * s, z, 0.32 * s, 0.5 * s, 0.32 * s, c[0], c[1], PI, 0, 0);
        S.nc = [x, 0.6 * s, z];
        S.ekle(G.kureO, x, 0.62 * s, z, 0.42 * s, 0.32 * s, 0.42 * s, 0xfff4f8, 0xffffff);
        S.ekle(G.kureO, x, 0.86 * s, z, 0.26 * s, 0.24 * s, 0.26 * s, 0xfff4f8, 0xffffff);
        S.nc = null;
        S.ekle(G.kureK, x, 1.08 * s, z, 0.1 * s, 0.1 * s, 0.1 * s, 0xd8203a, 0xff6a7a);
      };
      kek(hx - 2.6, -1.5, 1.0, SK.mavi); kek(hx - 5.6, -2.4, 0.9, SK.pembe); kek(hx + 5.2, -2.2, 0.9, SK.nane); kek(-6.5, -2.4, 1.0, SK.turuncu);
      // 8) Ön sıra (dikeyde alt kenar): iri şekerli jelibonlar ve krema
      for (let x = xa - 6; x < xb + 6; x += ara(2.6, 4.2)) {
        const z = ara(17, 21), c = JR[Math.floor(R() * 4)], s = ara(0.8, 1.4);
        const mc = rk();
        S.ekle(G.sil, x, s * 0.2, z, s, s * 0.36, s * 0.9, mc[0], mc[1]);
        S.ekle(G.sil, x, s * 0.45, z, s * 0.94, s * 0.16, s * 0.84, 0xfff6f0, 0xffffff);
        S.ekle(G.kubbe, x, s * 0.55, z, s, s * 0.32, s * 0.9, mc[0], mc[1]);
        if (R() < 0.5) S.ekle(G.kubbe, x + s * 1.1, -0.15, z + 0.4, s * 0.8, s * 0.55, s * 0.7, 0xfff4f8, 0xffffff);
      }
      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0.25, { roughness: 0.62, emissive: 0x6a2a40, emissiveIntensity: 0.12 })));

      // 9) Çikolata ırmağı (yakın arka, zemine oturan akan şerit)
      {
        const z0 = -13.2, gen = 6.5, g = new T.PlaneGeometry(xb - xa + 60, gen, 160, 4);
        g.rotateX(-PI / 2);
        const p = g.attributes.position, cx = (xa + xb) / 2;
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i) + cx, z = p.getZ(i) + z0;
          let ym = -1e9; for (const dz of [-gen / 2, 0, gen / 2]) ym = Math.max(ym, yerY(x, z0 + dz));
          p.setXYZ(i, x, ym + 0.06, z);
        }
        g.computeVertexNormals();
        const m = new T.ShaderMaterial({
          fog: true, uniforms: T.UniformsUtils.merge([T.UniformsLib.fog, {}]),
          vertexShader: '#include <fog_pars_vertex>\nvarying vec2 vU; varying vec3 vW; void main(){ vU = uv; vW = position; vec4 mvPosition = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mvPosition;\n#include <fog_vertex>\n}',
          fragmentShader: '#include <fog_pars_fragment>\nvarying vec2 vU; varying vec3 vW; uniform float uT; void main(){ float k = smoothstep(0.0, 0.16, vU.y) * smoothstep(1.0, 0.84, vU.y);' +
            ' float d = 0.5 + 0.5 * sin(vW.x * 0.9 - uT * 1.6 + sin(vW.z * 2.2 + vW.x * 0.3) * 1.4);' +
            ' float p = pow(max(0.0, sin(vW.x * 2.1 - uT * 2.2 + vW.z * 3.0)), 8.0);' +
            ' vec3 c = mix(vec3(0.36, 0.18, 0.09), vec3(0.55, 0.31, 0.17), d) + vec3(0.35, 0.22, 0.16) * p;' +
            ' c = mix(vec3(0.95, 0.85, 0.82), c, k); gl_FragColor = vec4(c, 1.0);\n#include <fog_fragment>\n}'
        });
        m.uniforms.uT = ctx.U.uT;
        const nehir = new T.Mesh(g, m); ctx.ekle(nehir);
        // kıyıda kurabiye köprü taşları (krema kenarlı)
        const K2 = ctx.yapi();
        for (let x = xa; x < xb; x += ara(9, 14)) {
          const y = yerY(x, z0);
          K2.ekle(DK, x, y + 0.1, z0 + gen / 2 + 0.3, 0.7, 0.7, 0.16, 0xc88048, 0xe0a060, -PI / 2 + 0.15, 0, 0);
        }
        for (const bx of [hx * 0.44, hx + 14, -18]) {
          const z1 = z0 + gen / 2 + 1.0, z2 = z0 - gen / 2 - 1.0, n = 9;
          for (let j = 0; j <= n; j++) {
            const u = j / n, zz = z1 + (z2 - z1) * u, yb = Math.max(yerY(bx, z1), yerY(bx, z2)) + 0.15 + 1.3 * Math.sin(PI * u);
            const eg = Math.cos(PI * u) * 1.3 * PI / (z1 - z2);
            K2.ekle(G.kutu, bx, yb, zz, 3.6, 0.26, (z1 - z2) / n * 1.02, 0xc07838, 0xe0a060, Math.atan(eg), 0, 0);
            for (const q of [-1, 1]) K2.ekle(G.kureK, bx + q * 1.6, yb + 0.15, zz, 0.12, 0.08, 0.12, 0xffffff, 0xffffff);
            if (j % 3 === 0) for (const q of [-1, 1]) { const c = SK_RENK[(j + (q > 0 ? 1 : 0)) % 5]; K2.ekle(G.sil, bx + q * 1.75, yb + 0.5, zz, 0.07, 0.8, 0.07, 0xffffff, c[0]); K2.ekle(G.kureO, bx + q * 1.75, yb + 0.95, zz, 0.2, 0.2, 0.2, c[0], c[1]); }
          }
          for (const q of [-1, 1]) K2.ekle(G.halka, bx + q * 1.75, Math.max(yerY(bx, z1), yerY(bx, z2)) + 1.0, z0, 0.5, 0.5, 0.5, 0xf04a5a, 0xffffff, 0, PI / 2, 0);
        }
        ctx.ekle(new T.Mesh(K2.geo(), ctx.malz(true, true, 0.2, { roughness: 0.7 })));
      }
      // 10) Dönen nane şekerleri (lolipop çarkları): tek InstancedMesh
      {
        const P2 = ctx.yapi();
        P2.ekle(DK, 0, 0, 0, 1, 1, 0.22, 0xfff4f6, 0xffffff);
        for (let j = 0; j < 6; j++) { const a = j / 6 * PI * 2 + 0.3; P2.ekle(G.kutu, Math.cos(a) * 0.52, Math.sin(a) * 0.52, 0.12, 0.8, 0.26, 0.02, 0xf04a5a, 0xf04a5a, 0, 0, a + 0.5); }
        P2.ekle(G.halka, 0, 0, 0, 1.0, 1.0, 0.9, 0xf04a5a, 0xff7a84);
        P2.ekle(G.kure, 0, 0, 0.1, 0.18, 0.18, 0.06, 0xf04a5a, 0xf04a5a);
        const N = 7, im = new T.InstancedMesh(P2.geo(), ctx.malz(true, true, 0, { roughness: 0.35 }), N);
        im.frustumCulled = false; ctx.ekle(im);
        const yer = [];
        for (let i = 0; i < N; i++) { const x = -26 + i * (hx + 46) / (N - 1) + ara(-3, 3), z = ara(-33, -36); yer.push([x, yerY(x, z), z, ara(1.4, 1.9), R() < 0.5 ? 1 : -1]); }
        // çarkların sopaları (sabit)
        const SP = ctx.yapi();
        for (const [x, y, z, s] of yer) SP.ekle(G.sil, x, y + 2.6 * s, z - 0.15, 0.1 * s, 5.2 * s, 0.1 * s, 0xf0eaea, 0xffffff);
        ctx.ekle(new T.Mesh(SP.geo(), ctx.malz(true, true, 0)));
        ctx.veri.cark = im; ctx.veri.yer = yer; ctx.veri.o = new T.Object3D();
      }
    },
    guncelle(t, dt, ctx) {
      const v = ctx.veri, im = v.cark; if (!im) return;
      const o = v.o;
      for (let i = 0; i < v.yer.length; i++) {
        const [x, y, z, s, d] = v.yer[i];
        o.position.set(x, y + 5.2 * s + 1.0 * s, z);
        o.rotation.set(0, 0, d * t * 0.8 + i);
        o.scale.set(s * 1.05, s * 1.05, s);
        o.updateMatrix(); im.setMatrixAt(i, o.matrix);
      }
      im.instanceMatrix.needsUpdate = true;
    }
  };

  // ════════════════════════════════════════════════════════════════════
  // 31 · AY YÜZEYİ — gümüş ay toprağı, kraterler, gökte dönen mavi Dünya, roket, ay arabası
  // ════════════════════════════════════════════════════════════════════
  const AY_KR = [[0x30c8e8, 0xb8f4ff], [0xff6aa8, 0xffc4dc], [0x4a90ff, 0xbcd8ff], [0x40e0b0, 0xc0fff0]];
  DY_EK[31] = {
    palet: {
      ad: 'Ay Yüzeyi', gece: 1,
      sisRenk: 0x161a32, sisYogun: 0.0034, arka: 0x0c0e20,
      gok: [0x1e2a4a, 0x121a36, 0x14203e, 0x0a0e24, 0x03040c], gunesPos: [40, 20], gunesRenk: 0xe8f0ff,
      ykUst: 0xb8c8ff, ykAlt: 0x3a3e58, ykGuc: 1.15, gnRenk: 0xf0f4ff, gnGuc: 2.1, arkaRenk: 0x6aa8ff, arkaGuc: 0.7,
      dag: [[0x9498b4, 0x343852], [0x787c9c, 0x2a2e48], [0x62668a, 0x22263e]],
      tepe: [0x8a8ea4, 0xc8ccdc, 0x6e7290, 0xa6aac2],
      agac: [[0x6a6e86, 0x9ea2ba], [0x5e627a, 0x9296ae], [0x72768e, 0xa8acc4]],
      zemin: [0xb2b6c8, 0x7c8096, 0x8a8ea8], cimen: [0x7a7e94, 0xb8bcd0, 0xa0a4b8],
      cicek: [[0x30c8e8, 0xb8f4ff], [0xff6aa8, 0xffc4dc], [0x4a90ff, 0xbcd8ff], [0x40e0b0, 0xc0fff0]],
      sisSerit: [0x2a3058, 0x1a1e3a], siluet: [0x2a2e44, 0x4a4e66]
    },
    secenek: {
      gunesYok: true, yildizlar: 1, agacYok: true, caliYok: true, kulubeYok: true, degirmenYok: true, tepeCicekYok: true,
      cicekYok: true, cimenYok: true, mantarSusYok: true, citYok: true, kusYok: true, bulutYok: true, sisSeritYok: true,
      onSiluetYok: true, piknikTur: 'yok', bayrakYok: true, ucusanTur: 'yok',
      zeminDesen: 'ay', zeminParlak: 0.06, dagYukseklik: 0.8,
      salincak: { govde: [0x8a8ea4, 0xdce0ec], tacYok: true, sarmasikYok: true, cicekYok: true, kusYok: true, tacIsik: 0x3aa0d0 }
    },
    yardimci: {
      mantar: { sapka: [0x7a86b0, 0xc8d4f0], govde: [0x8a8ea4, 0xc0c4d4], benek: 0xb8f4ff },
      bulut: { alt: 0x9ea2b8, ust: 0xe0e4f0, yanak: 0xff9ac0, emissive: 0x303a60 },
      nilufer: { yaprak: [0x8a8ea4, 0xc8ccdc], cicek: [0x30c8e8, 0xb8f4ff], halka: 0xb8f4ff, emissive: 0x2a6a90 },
      ruzgar: { renk: [0x5ab8ff, 0xe0f4ff], emissive: 0x2a70c0, ok: 0xffffff },
      halka: { renk: [0x40c8f0, 0xd0f6ff], emissive: 0x2090d0, cicek: [[0x30c8e8, 0xb8f4ff], [0xff6aa8, 0xffc4dc], [0x40e0b0, 0xc0fff0]] },
      baloncuk: { renk: 0x7ad4ff, kenar: 0xffffff, cizgi: 0x30b0ff, opaklik: 1.5 },
      esinti: { tur: 'isik', renk: 0xcfe8ff, taneRenk: [0xb8f4ff, 0xffffff, 0xffc4dc] }
    },
    yardimciKur: {
      // Salıncak: metal direklerin tepesinde ışıldayan ay kristalleri + minik anten
      salincak(ctx, o) {
        const { G } = ctx, z = o.z, sx = o.sapanX;
        for (const q of [-1, 1]) {
          const c = AY_KR[q < 0 ? 0 : 1], x = q * (sx + 0.7);
          for (const [dx, h, rz] of [[0, 1.3, 0], [-0.32, 0.85, 0.4], [0.34, 0.95, -0.35], [0.12, 0.6, -0.1]])
            o.FL.ekle(G.oct, x + dx, 5.35 + h * 0.5, z - 0.35, 0.2, h * 0.62, 0.2, c[0], c[1], 0, 0.4, rz, 0.1);
          o.S.ekle(G.kureO, x, 5.15, z - 0.35, 0.6, 0.3, 0.5, 0x8a8ea4, 0xc8ccd8);
        }
        o.S.ekle(G.sil, 0, 6.3, z, 0.03, 0.9, 0.03, 0xb4b8c8, 0xe0e4ee);
        o.FL.ekle(G.kureK, 0, 6.8, z, 0.12, 0.12, 0.12, 0xff6aa8, 0xffc4dc);
      },
      // Mantar yerine zıplatan ay taşı tümseği: tepesinde ışıldayan yumuşak krater (tabanı y=0, üstü ~2.4)
      mantar(M, i, ctx) {
        const { T, G } = ctx, S = ctx.yapi(), K = ogKrater(T);
        S.nc = [0, 0.6, 0];
        S.ekle(G.kubbe, 0, 0, 0, 1.85, 2.2, 1.65, 0x7a7e96, 0xc8ccdc);
        S.nc = null;
        S.ekle(K, 0, 2.0, 0, 1.25, 0.9, 1.1, 0x40c8f0, 0xc0f4ff);
        S.ekle(G.halka, 0, 2.08, 0, 1.2, 1.2, 0.8, 0x6ad8ff, 0xd0f6ff, PI / 2, 0, 0);
        for (const [x, y, r] of [[-1.15, 0.9, 0.3], [1.2, 0.7, 0.25], [0.7, 1.55, 0.2]]) S.ekle(K, x, y, Math.sqrt(Math.max(0.1, 1 - (x / 1.85) ** 2 - (y / 2.2) ** 2)) * 1.62, r, r, r * 1.4, 0x6a6e86, 0xa8acc0, PI / 2, 0, 0);
        for (const q of [-1, 1]) S.ekle(G.kureK, q * 0.72, 0.95, 1.45, 0.22, 0.14, 0.06, 0xff8ab4, 0xffaacc);
        S.ekle(G.torusSap, 0, 0.88, 1.56, 0.75, 0.75, 0.5, 0x1a1a2e, 0x24243a, 0, 0, PI);
        const mesh = new T.Mesh(S.geo(), ctx.malz(true, true, 0.4, { roughness: 0.7, emissive: 0x2a4a70, emissiveIntensity: 0.45 }));
        const E = ctx.yapi();
        for (const q of [-1, 1]) {
          E.ekle(G.kureK, q * 0.4, 0, 0, 0.13, 0.19, 0.07, 0x1a1a2e, 0x1a1a2e);
          E.ekle(G.kureK, q * 0.4 + 0.04, 0.07, 0.05, 0.045, 0.055, 0.02, 0xffffff, 0xffffff);
        }
        const goz = new T.Mesh(E.geo(), ctx.malz(true, true, 0, { roughness: 0.4 }));
        goz.position.set(0, 1.35, 1.5); mesh.add(goz);
        return { mesh, goz };
      },
      // Bulut yerine süzülen, gülümseyen ay taşı (merkez 0,0; yarıçap ~2.2)
      bulut(BL, i, ctx) {
        const { T, G } = ctx, S = ctx.yapi(), K = ogKrater(T);
        S.nc = [0, 0, 0];
        S.ekle(G.kure, 0, 0, 0, 2.35, 1.45, 1.9, 0x8a8ea6, 0xd4d8e6);
        S.ekle(G.kureO, -1.3, 0.35, -0.2, 1.1, 0.9, 1.1, 0x9296ae, 0xd0d4e2);
        S.ekle(G.kureO, 1.25, 0.25, -0.1, 1.0, 0.85, 1.0, 0x9296ae, 0xd0d4e2);
        S.nc = null;
        for (const [x, y, r] of [[-1.35, 0.55, 0.42], [1.4, -0.2, 0.32], [0.9, 0.85, 0.26], [-0.6, -0.75, 0.3]]) {
          const z = Math.sqrt(Math.max(0.05, 1 - (x / 2.35) * (x / 2.35) - (y / 1.45) * (y / 1.45))) * 1.9;
          S.ekle(K, x, y, z - 0.02, r, r, r * 1.4, 0x7a7e96, 0xb0b4c8, PI / 2, 0, 0);
        }
        for (const q of [-1, 1]) S.ekle(G.kureK, q * 0.75, -0.25, 1.78, 0.24, 0.15, 0.06, 0xff8ab4, 0xffaacc);
        S.ekle(G.torusSap, 0, -0.32, 1.86, 0.75, 0.75, 0.5, 0x2a2a44, 0x34344e, 0, 0, PI);
        S.ekle(G.halkaInce, 0, -1.25, 0, 2.0, 2.0, 2.0, 0x6ad8ff, 0xb8f4ff, PI / 2, 0, 0); // altında ışıltı halkası
        const mesh = new T.Mesh(S.geo(), ctx.malz(true, true, 0.4, { roughness: 0.85, emissive: 0x28304c, emissiveIntensity: 0.5 }));
        const E = ctx.yapi();
        for (const q of [-1, 1]) {
          E.ekle(G.kureK, q * 0.42, 0, 0, 0.13, 0.19, 0.07, 0x1a1a2e, 0x1a1a2e);
          E.ekle(G.kureK, q * 0.42 + 0.04, 0.07, 0.05, 0.045, 0.055, 0.02, 0xffffff, 0xffffff);
        }
        const goz = new T.Mesh(E.geo(), ctx.malz(true, true, 0, { roughness: 0.4 }));
        goz.position.set(0, 0.22, 1.85); mesh.add(goz);
        return { mesh, goz };
      }
    },
    kur(ctx) {
      const { T, G, hx, yerY, tepeY, R, ara } = ctx, S = ctx.yapi(), KR = ctx.yapi(), K = ogKrater(T), DK = ogKalp(T), PR = ogPrizma(T);
      const xa = -40, xb = hx + 46;
      const gri = () => { const v = ara(0, 1); return [ctx.karH(0x7a7e94, 0x9a9eb4, v), ctx.karH(0xc0c4d4, 0xe0e4ee, v)]; };
      // 1) Kraterler ve ay taşları (yakından uzağa)
      const krater = (x, z, r) => { const c = gri(); S.ekle(K, x, yerY(x, z) - 0.04, z, r, r * 0.9, r * 0.75, c[0], c[1], 0, R() * 3, 0); };
      for (let i = 0; i < 46; i++) {
        const z = i < 16 ? ara(-2.5, -9) : i < 32 ? ara(-10, -24) : ara(-26, -40), x = ara(xa, xb);
        krater(x, z, z > -9 ? ara(0.9, 1.8) : ara(1.8, 4.2));
      }
      for (let i = 0; i < 10; i++) { const x = ara(-70, hx + 90), z = ara(-48, -66); S.ekle(K, x, tepeY(x, z) - 0.2, z, ara(4, 8), ara(3, 5), ara(3, 5), 0x7a7e96, 0xb8bcd0, 0, R() * 3, 0); }
      const tas = (x, z, s) => { const c = gri(); S.ekle(G.kureU, x, yerY(x, z) + s * 0.25, z, s, s * ara(0.5, 0.8), s * ara(0.7, 1), c[0], c[1], ara(-0.3, 0.3), R() * 3, ara(-0.3, 0.3)); };
      for (let i = 0; i < 90; i++) { const z = ara(-2, -34), x = ara(xa, xb); if (z > -5 && Math.abs(x - hx) < 4) continue; tas(x, z, z > -8 ? ara(0.15, 0.45) : ara(0.4, 1.4)); }
      for (let i = 0; i < 70; i++) { const z = ara(1.2, 6), x = ara(xa, xb); if (Math.abs(x - hx) < 4.5) continue; tas(x, z, ara(0.08, 0.3)); }
      // ön sıra (dikeyde alt kenar): alçak ay kayaları ve krater kenarları
      for (let x = xa - 8; x < xb + 8; x += ara(2.5, 4.5)) {
        const z = ara(17, 21), c = gri();
        if (R() < 0.6) S.ekle(G.kureO, x, -0.25, z, ara(0.9, 1.6), ara(0.6, 1.1), ara(0.8, 1.2), c[0], c[1], 0, R() * 3, 0);
        else S.ekle(K, x, -0.05, z, ara(1.5, 2.5), 1.2, 1.2, c[0], c[1]);
      }
      // 2) Sevimli roket (rampada) — ışığı ayrı yanıp söner
      const roket = (x, z, k) => {
        const y = yerY(x, z) - 0.05;
        S.ekle(G.kutu, x, y + 0.2 * k, z, 4.2 * k, 0.4 * k, 3.4 * k, 0x6a6e84, 0x9a9eb4); // rampa
        S.ekle(G.sil, x, y + 4.4 * k, z, 1.15 * k, 6.4 * k, 1.15 * k, 0xe4e8f0, 0xffffff);     // gövde
        S.ekle(G.kure, x, y + 1.25 * k, z, 1.15 * k, 0.6 * k, 1.15 * k, 0xd8dce8, 0xeef0f6);
        S.ekle(G.koni, x, y + 9.0 * k, z, 1.17 * k, 2.8 * k, 1.17 * k, 0xe8364a, 0xff6a6a);   // burun
        S.ekle(G.sil, x, y + 7.5 * k, z, 1.17 * k, 0.28 * k, 1.17 * k, 0xe8364a, 0xff6a6a);
        S.ekle(G.sil, x, y + 2.3 * k, z, 1.17 * k, 0.28 * k, 1.17 * k, 0xe8364a, 0xff6a6a);
        S.ekle(G.halka, x, y + 5.6 * k, z + 1.05 * k, 0.6 * k, 0.6 * k, 0.6 * k, 0xc8ccd8, 0xf0f2f8);   // pencere çerçevesi
        S.ekle(G.kure, x, y + 5.6 * k, z + 0.98 * k, 0.55 * k, 0.55 * k, 0.25 * k, 0x2a78d8, 0x8ad0ff);
        S.ekle(G.kureK, x + 0.18 * k, y + 5.78 * k, z + 1.18 * k, 0.12 * k, 0.12 * k, 0.05 * k, 0xffffff, 0xffffff);
        for (const a of [0, 2.094, 4.189]) {
          const cx = Math.sin(a), cz = Math.cos(a);
          S.ekle(G.kutu, x + cx * 1.35 * k, y + 2.0 * k, z + cz * 1.35 * k, 0.16 * k, 2.6 * k, 1.2 * k, 0xe8364a, 0xff6a6a, 0, a + PI / 2, 0); // kanatçık
          S.ekle(G.sil, x + cx * 1.85 * k, y + 0.6 * k, z + cz * 1.85 * k, 0.12 * k, 1.0 * k, 0.12 * k, 0x9a9eb4, 0xc8ccd8);
        }
        S.ekle(G.kule, x, y + 0.75 * k, z, 0.6 * k, 0.5 * k, 0.6 * k, 0x5a5e72, 0x8a8ea4);       // motor
        for (let j = 0; j < 4; j++) S.ekle(G.kureK, x + (j - 1.5) * 0.35 * k, y + 3.4 * k, z + 1.13 * k, 0.09 * k, 0.09 * k, 0.04 * k, [0xff6aa8, 0x30c8e8, 0x40e0b0, 0xff8a50][j], 0xffffff); // renkli lambalar
        // rampa kulesi
        S.ekle(G.kutu, x - 2.4 * k, y + 4.6 * k, z - 0.6 * k, 0.35 * k, 9.2 * k, 0.35 * k, 0x8a8ea4, 0xb4b8c8);
        for (let j = 1; j < 5; j++) S.ekle(G.kutu, x - 1.9 * k, y + j * 2.0 * k, z - 0.6 * k, 1.0 * k, 0.12 * k, 0.12 * k, 0x8a8ea4, 0xb4b8c8);
        return [x, y + 10.6 * k, z];
      };
      const isik1 = roket(hx * 0.56, -26, 1.3);
      roket(-24, -34, 1.0);
      // 3) İniş aracı (altın folyolu)
      const inis = (x, z, k) => {
        const y = yerY(x, z);
        S.ekle(G.kutu, x, y + 1.7 * k, z, 2.2 * k, 1.3 * k, 2.0 * k, 0xc8901c, 0xffd060, 0, 0.5, 0);
        S.ekle(G.kutu, x, y + 2.75 * k, z, 1.6 * k, 0.9 * k, 1.5 * k, 0xd4d8e4, 0xf4f6fa, 0, 0.5, 0);
        S.ekle(G.kure, x + 0.35 * k, y + 2.85 * k, z + 0.7 * k, 0.28 * k, 0.28 * k, 0.12 * k, 0x2a78d8, 0x8ad0ff, 0, 0.5, 0);
        for (const a of [0.3, 1.87, 3.44, 5.01]) {
          const cx = Math.sin(a), cz = Math.cos(a);
          S.ekle(G.sil, x + cx * 1.6 * k, y + 0.95 * k, z + cz * 1.6 * k, 0.07 * k, 2.0 * k, 0.07 * k, 0xb4b8c8, 0xd8dce8, cz * 0.45, 0, -cx * 0.45);
          S.ekle(G.sil, x + cx * 2.05 * k, y + 0.05, z + cz * 2.05 * k, 0.3 * k, 0.08, 0.3 * k, 0x9a9eb4, 0xc8ccd8);
        }
        S.ekle(G.sil, x - 0.3 * k, y + 3.6 * k, z, 0.04 * k, 1.0 * k, 0.04 * k, 0xb4b8c8, 0xd8dce8);
        S.ekle(G.kubbe, x - 0.3 * k, y + 4.1 * k, z, 0.45 * k, 0.2 * k, 0.45 * k, 0xe4e8f0, 0xffffff, PI, 0, 0.4);
      };
      inis(-16, -15, 1.2);
      inis(hx + 18, -17, 1.0);
      // 4) Ay arabası
      const araba = (x, z, k) => {
        const y = yerY(x, z);
        S.ekle(G.kutu, x, y + 0.85 * k, z, 2.8 * k, 0.3 * k, 1.5 * k, 0xd4d8e4, 0xf4f6fa);
        S.ekle(G.kutu, x - 0.4 * k, y + 1.25 * k, z, 0.7 * k, 0.6 * k, 1.0 * k, 0x3a7ad8, 0x6aa8ff);   // koltuk
        S.ekle(G.kutu, x + 0.9 * k, y + 1.15 * k, z, 0.7 * k, 0.4 * k, 1.1 * k, 0xc8901c, 0xffd060);   // yük kutusu
        for (const qx of [-1, 1]) for (const qz of [-1, 1]) {
          S.ekle(G.halka, x + qx * 1.05 * k, y + 0.45 * k, z + qz * 0.85 * k, 0.4 * k, 0.4 * k, 0.9 * k, 0x3a3c50, 0x5a5e72);
          S.ekle(G.sil, x + qx * 1.05 * k, y + 0.45 * k, z + qz * 0.85 * k, 0.3 * k, 0.12 * k, 0.3 * k, 0xb4b8c8, 0xd8dce8, PI / 2, 0, 0);
        }
        S.ekle(G.sil, x + 1.2 * k, y + 1.8 * k, z - 0.4 * k, 0.03 * k, 1.6 * k, 0.03 * k, 0xb4b8c8, 0xd8dce8);
        S.ekle(G.kubbe, x + 1.2 * k, y + 2.55 * k, z - 0.4 * k, 0.4 * k, 0.18 * k, 0.4 * k, 0xe4e8f0, 0xffffff, PI, 0, -0.5);
        S.ekle(G.kureK, x + 1.2 * k, y + 2.65 * k, z - 0.4 * k, 0.07 * k, 0.07 * k, 0.07 * k, 0xff6aa8, 0xff9ac0);
        // tekerlek izleri
        for (let j = 0; j < 8; j++) for (const qz of [-1, 1]) S.ekle(G.kutu, x - 2.0 * k - j * 0.9 * k, y + 0.015, z + qz * 0.85 * k, 0.5 * k, 0.02, 0.3 * k, 0x7a7e94, 0x7a7e94);
      };
      araba(hx * 0.22, -7.5, 1.5);
      araba(hx + 12, -9, 1.3);
      // 4b) Ay üssü: ışıklı pencereli beyaz kubbeler ve bağlantı tünelleri
      const us = (x, z, k) => {
        const y = yerY(x, z) - 0.1;
        for (const [ox, oz, r] of [[0, 0, 2.4], [3.6, -0.6, 1.6], [-3.2, -0.4, 1.4]]) {
          S.ekle(G.kubbe, x + ox * k, y, z + oz * k, r * k, r * 0.9 * k, r * k, 0xd8dce8, 0xffffff);
          S.ekle(G.sil, x + ox * k, y + 0.1, z + oz * k, r * 1.03 * k, 0.25 * k, r * 1.03 * k, 0x5a8ad8, 0x8ab4ff);
          for (let j = 0; j < 3; j++) S.ekle(G.kure, x + (ox + (j - 1) * r * 0.42) * k, y + r * 0.45 * k, z + (oz + r * 0.86) * k, 0.2 * k, 0.2 * k, 0.08 * k, 0xffc860, 0xfff0b0);
        }
        for (const q of [-1, 1]) S.ekle(G.sil, x + q * 2.2 * k, y + 0.55 * k, z - 0.4 * k, 0.5 * k, 1.6 * k, 0.5 * k, 0xc8ccd8, 0xe8ecf4, 0, 0, PI / 2);
        S.ekle(G.sil, x, y + 2.6 * k, z, 0.04 * k, 1.4 * k, 0.04 * k, 0xc8ccd8, 0xe8ecf4);
        S.ekle(G.kureK, x, y + 3.35 * k, z, 0.12 * k, 0.12 * k, 0.12 * k, 0x40e0b0, 0xc0fff0);
      };
      us(hx * 0.3, -31, 1.2);
      us(hx + 26, -34, 1.1);
      { // uzak ufukta ikinci üs: tepe sırtında, ışıklı kubbeler + anten kulesi
        const ux = hx * 0.7, uz = -58, uy = tepeY(ux, uz) - 0.3;
        for (const [ox, r] of [[0, 3.2], [5.0, 2.2], [-4.6, 2.0], [9.0, 1.5]]) {
          S.ekle(G.kubbe, ux + ox, uy, uz, r, r * 0.9, r, 0xc8ccd8, 0xf4f6fa);
          for (let j = 0; j < 3; j++) S.ekle(G.kure, ux + ox + (j - 1) * r * 0.4, uy + r * 0.42, uz + r * 0.88, 0.28, 0.28, 0.1, 0xffc860, 0xfff0b0);
        }
        S.ekle(G.kutu, ux - 8, uy + 4, uz, 0.4, 8, 0.4, 0x9a9eb4, 0xd8dce8);
        S.ekle(G.kubbe, ux - 8, uy + 8.3, uz, 1.6, 0.6, 1.6, 0xe4e8f0, 0xffffff, PI - 0.5, 0, 0.4);
      }
      // 5) Uydu çanağı
      const canak = (x, z, k) => {
        const y = yerY(x, z);
        for (const a of [0, 2.094, 4.189]) S.ekle(G.sil, x + Math.sin(a) * 0.6 * k, y + 0.9 * k, z + Math.cos(a) * 0.6 * k, 0.07 * k, 2.0 * k, 0.07 * k, 0x9a9eb4, 0xc8ccd8, Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3);
        S.ekle(G.kubbe, x, y + 2.4 * k, z, 1.9 * k, 0.8 * k, 1.9 * k, 0xc8ccd8, 0xf4f6fa, PI - 0.6, 0, 0.5);
        S.ekle(G.sil, x - 0.35 * k, y + 2.9 * k, z + 0.4 * k, 0.05 * k, 1.6 * k, 0.05 * k, 0x9a9eb4, 0xc8ccd8, 0.5, 0, 0.4);
        S.ekle(G.kureK, x - 0.65 * k, y + 3.6 * k, z + 0.75 * k, 0.15 * k, 0.15 * k, 0.15 * k, 0xff6aa8, 0xffaacc);
      };
      canak(-30, -24, 1.4); canak(hx * 0.84, -21, 1.2); canak(hx + 36, -26, 1.3);
      // 6) Bilbo'nun küçük kampı + bayrak
      {
        const tx = hx + 3.2, tz = -1.9;
        S.ekle(PR, tx, 0.42, tz, 1.0, 0.85, 1.6, 0xff8a50, 0xffb48a);
        S.ekle(PR, tx, 0.42, tz + 0.82, 0.55, 0.55, 0.02, 0x3a2a3a, 0x4a3a4a);
        S.ekle(G.sil, tx, 0.78, tz + 0.83, 0.03, 0.1, 0.03, 0xffffff, 0xffffff);
        const fx = hx - 3.0, fz = -1.6;
        S.ekle(G.sil, fx, 1.25, fz, 0.05, 2.5, 0.05, 0xd8dce8, 0xffffff);
        S.ekle(G.kureK, fx, 2.52, fz, 0.09, 0.09, 0.09, 0xffd060, 0xfff0a0);
        S.ekle(G.kutu, fx + 0.62, 2.1, fz, 1.2, 0.75, 0.03, 0x30b8e0, 0x60d8ff, 0, 0, 0, 0.2);
        S.ekle(G.kutu, fx + 0.62, 1.85, fz + 0.02, 1.2, 0.18, 0.03, 0xff6aa8, 0xff6aa8, 0, 0, 0, 0.2);
        S.ekle(G.kureK, fx + 0.62, 2.18, fz + 0.03, 0.18, 0.18, 0.02, 0xffffff, 0xffffff, 0, 0, 0, 0.2);
        // kamp çevresi: küçük taşlarla halka ve fener
        for (let j = 0; j < 7; j++) { const a = j / 7 * PI * 2; S.ekle(G.kureU, hx - 5.6 + Math.cos(a) * 0.55, 0.06, -2.1 + Math.sin(a) * 0.4, 0.16, 0.1, 0.14, 0x8a8ea4, 0xc0c4d4); }
      }
      // 7) Işıldayan ay kristalleri (ayrı, parlayan malzeme)
      const kristal = (x, z, k, c) => {
        const y = yerY(x, z) - 0.1;
        for (const [ox, oz, h, rz] of [[0, 0, 1.6, 0], [-0.35, 0.1, 1.0, 0.35], [0.38, -0.05, 1.15, -0.3], [0.12, 0.3, 0.75, -0.12], [-0.6, -0.2, 0.6, 0.6], [0.65, 0.15, 0.55, -0.55], [-0.15, -0.35, 1.25, 0.15]])
          KR.ekle(G.oct, x + ox * k, y + h * 0.5 * k, z + oz * k, 0.24 * k, h * 0.62 * k, 0.24 * k, c[0], c[1], 0, R(), rz);
      };
      for (let i = 0; i < 44; i++) {
        const z = i < 14 ? ara(-3, -9) : ara(-10, -34), x = ara(xa, xb);
        if ((z > -4 && Math.abs(x) < 5) || (z > -10 && Math.abs(x - hx) < 7)) continue;
        kristal(x, z, z > -9 ? ara(0.8, 1.2) : ara(1.4, 2.4), AY_KR[i % 4]);
      }
      const krMat = ctx.malz(true, true, 0.6, { roughness: 0.25, emissive: 0x3aa0d0, emissiveIntensity: 0.75 });
      ctx.ekle(new T.Mesh(KR.geo(), krMat));
      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0.3, { roughness: 0.88, emissive: 0x20243c, emissiveIntensity: 0.35 })));
      // 8) Roket ucunda yanıp sönen ışık
      const lm = new T.MeshBasicMaterial({ color: 0xff4a5a, fog: false });
      const lamba = new T.Mesh(G.kureO, lm); lamba.position.set(isik1[0], isik1[1], isik1[2]); lamba.scale.setScalar(0.22); ctx.ekle(lamba);
      // 9) Gökte: dönen mavi-beyaz Dünya + ışıltı hâlesi, halkalı gezegen, renkli bulutsu
      const dx = hx * 0.5 + 16, dyy = 57, dz = -140, dr = 11;
      const dm = new T.ShaderMaterial({
        fog: false, uniforms: { uT: ctx.U.uT },
        vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normal; vV = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: [
          'varying vec3 vN; varying vec3 vV; uniform float uT;',
          'void main(){ vec3 n = normalize(vN); float lon = atan(n.z, n.x) + uT * 0.05; float lat = asin(clamp(n.y, -1.0, 1.0));',
          ' float f = sin(lon * 2.0 + sin(lat * 3.0) * 1.6) * cos(lat * 2.5 - 0.4) + 0.45 * sin(lon * 5.0 - lat * 4.0 + 1.3) + 0.25 * sin(lon * 9.0 + lat * 7.0);',
          ' float kara = smoothstep(0.42, 0.52, f) * (1.0 - smoothstep(1.15, 1.35, abs(lat) * 1.0));',
          ' vec3 c = mix(vec3(0.14, 0.42, 0.88), vec3(0.24, 0.62, 0.98), 0.5 + 0.5 * sin(lat * 3.0));',
          ' c = mix(c, mix(vec3(0.36, 0.7, 0.42), vec3(0.78, 0.72, 0.5), smoothstep(0.7, 1.0, f)), kara);',
          ' c = mix(c, vec3(0.97), smoothstep(1.12, 1.3, abs(lat)));',
          ' float bl = smoothstep(0.5, 0.85, sin(lon * 4.0 + uT * 0.08 + sin(lat * 8.0) * 1.8) * sin(lat * 6.0 + lon * 1.5 + uT * 0.03));',
          ' c = mix(c, vec3(1.0), bl * 0.85);',
          ' float d = clamp(dot(normalize(vV), normalize(vec3(0.75, 0.35, 0.55))), 0.0, 1.0);',
          ' c *= 0.18 + 0.95 * smoothstep(-0.15, 0.6, d);',
          ' float rim = pow(1.0 - clamp(vV.z, 0.0, 1.0), 2.5); c += vec3(0.35, 0.65, 1.0) * rim * 0.9;',
          ' gl_FragColor = vec4(c, 1.0); }'
        ].join('\n')
      });
      const dunyaKure = new T.Mesh(new T.SphereGeometry(dr, 40, 26), dm); dunyaKure.position.set(dx, dyy, dz); dunyaKure.rotation.z = 0.35; dunyaKure.renderOrder = -8; ctx.ekle(dunyaKure);
      const hm = new T.ShaderMaterial({
        transparent: true, depthWrite: false, fog: false, blending: T.AdditiveBlending,
        uniforms: { uT: ctx.U.uT },
        vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'varying vec2 vP; uniform float uT; void main(){ float r = length(vP); float a = exp(-pow((r - 1.0) * 5.0, 2.0)) * 0.55 + exp(-max(0.0, r - 1.0) * 3.2) * 0.25 * step(1.0, r);' +
          ' gl_FragColor = vec4(vec3(0.35, 0.6, 1.0) * a, a); }'
      });
      const hale = new T.Mesh(new T.PlaneGeometry(dr * 3.4, dr * 3.4), hm); hale.scale.setScalar(1); hale.position.set(dx, dyy, dz - dr - 1); hale.renderOrder = -9;
      // düzlem birimini Dünya yarıçapına göre: shader r=1 kenar → ölçek
      hale.geometry.scale(1 / dr, 1 / dr, 1); hale.scale.set(dr, dr, 1);
      ctx.ekle(hale);
      // halkalı gezegen (şeftali-turuncu bantlı) + uzak minik ay
      const P2 = ctx.yapi(), gx = 8, gy = 63, gz = -146;
      P2.ekle(G.kure, gx, gy, gz, 4.2, 4.2, 4.2, 0xe89a70, 0xffd4b0, 0, 0, 0.3);
      P2.ekle(G.halka, gx, gy, gz, 7.6, 7.6, 1.2, 0xe8b890, 0xfff0dc, 1.25, 0, 0.3);
      P2.ekle(G.halkaInce, gx, gy, gz, 9.0, 9.0, 1.5, 0xa8c8f0, 0xd8eaff, 1.25, 0, 0.3);
      P2.ekle(G.kure, gx + 14, gy + 6, gz, 1.2, 1.2, 1.2, 0xa8b4d0, 0xe8eef8);
      const gm = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, emissive: 0x403040, emissiveIntensity: 0.6, fog: false });
      const gez = new T.Mesh(P2.geo(), gm); gez.renderOrder = -8; ctx.ekle(gez);
      // bulutsu (gök düzleminin hemen önü; yumuşak, mor yok: camgöbeği ve pembe)
      const nm = new T.ShaderMaterial({
        transparent: true, depthWrite: false, fog: false, blending: T.AdditiveBlending, uniforms: { uT: ctx.U.uT },
        vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'varying vec2 vP; uniform float uT; void main(){ vec2 p = vP * 0.03;' +
          ' float a = sin(p.x * 1.3 + sin(p.y * 2.1 + uT * 0.02) * 1.5) * sin(p.y * 1.7 - p.x * 0.6) + 0.5 * sin(p.x * 3.1 + p.y * 2.3);' +
          ' float b = sin(p.x * 2.2 - p.y * 1.1 + 2.0) * sin(p.y * 2.6 + 1.0) + 0.4 * sin(p.x * 4.3 - p.y * 3.7);' +
          ' float m = exp(-pow(vP.y * 0.02 - 0.2 * sin(vP.x * 0.02), 2.0) * 3.0);' +
          ' vec3 c = vec3(0.12, 0.5, 0.62) * smoothstep(0.1, 1.0, a) + vec3(0.62, 0.2, 0.42) * smoothstep(0.3, 1.1, b);' +
          ' gl_FragColor = vec4(c * m * 0.42, 1.0); }'
      });
      const bulutsu = new T.Mesh(new T.PlaneGeometry(520, 140), nm); bulutsu.position.set(-30, 62, -148); bulutsu.rotation.z = 0.32; bulutsu.renderOrder = -9; ctx.ekle(bulutsu);
      // kayan yıldız: tek şerit, birkaç saniyede bir gökte süzülür (kuyruğu yumuşak söner)
      const km = new T.ShaderMaterial({
        transparent: true, depthWrite: false, fog: false, blending: T.AdditiveBlending, uniforms: { uA: { value: 0 } },
        vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'varying vec2 vU; uniform float uA; void main(){ float k = pow(vU.x, 3.0) * (1.0 - smoothstep(0.0, 0.5, abs(vU.y - 0.5))); float bas = exp(-pow((1.0 - vU.x) * 30.0, 2.0)) * (1.0 - smoothstep(0.0, 0.5, abs(vU.y - 0.5)));' +
          ' gl_FragColor = vec4(vec3(0.85, 0.92, 1.0) * (k + bas * 1.5) * uA, 1.0); }'
      });
      const kayan = new T.Mesh(new T.PlaneGeometry(1, 1), km); kayan.renderOrder = -7; kayan.visible = false; ctx.ekle(kayan);
      ctx.veri.kayan = kayan; ctx.veri.km = km;
      // yavaşça dönen uydu (güneş panelli), Dünya'nın yörüngesinde
      const U2 = ctx.yapi();
      U2.ekle(G.kutu, 0, 0, 0, 1.0, 1.0, 1.0, 0xc8901c, 0xffd060);
      for (const q of [-1, 1]) { U2.ekle(G.kutu, q * 2.0, 0, 0, 2.6, 1.0, 0.06, 0x2a4a9a, 0x5a8ae0); U2.ekle(G.kutu, q * 0.7, 0, 0, 0.5, 0.08, 0.08, 0xb4b8c8, 0xd8dce8); }
      U2.ekle(G.kubbe, 0, 0.6, 0, 0.6, 0.3, 0.6, 0xe4e8f0, 0xffffff, PI, 0, 0);
      const uydu = new T.Mesh(U2.geo(), new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.3, emissive: 0x303850, emissiveIntensity: 0.6, fog: false }));
      uydu.renderOrder = -7; ctx.ekle(uydu); ctx.veri.uydu = uydu; ctx.veri.dm = [dx, dyy, dz, dr];
      ctx.veri.dunya = dunyaKure; ctx.veri.gez = gez; ctx.veri.lm = lm; ctx.veri.krMat = krMat;
    },
    guncelle(t, dt, ctx) {
      const v = ctx.veri; if (!v.lm) return;
      const y = 0.5 + 0.5 * Math.sin(t * 3.2), p = y > 0.75 ? 1 : 0.25 + y * 0.4;
      v.lm.color.setRGB(p, 0.3 * p, 0.35 * p);
      v.krMat.emissiveIntensity = 0.72 + 0.22 * Math.sin(t * 1.6);
      v.gez.position.y = Math.sin(t * 0.2) * 0.4;
      if (v.uydu) {
        const [ux, uy, uz, ur] = v.dm, a = t * 0.18;
        v.uydu.position.set(ux + Math.cos(a) * ur * 1.8, uy + Math.sin(a) * ur * 0.55, uz + Math.sin(a) * ur * 1.2 + 4);
        v.uydu.rotation.set(0.3, t * 0.4, 0.2);
        v.uydu.visible = Math.sin(a) > -0.35;
      }
      // kayan yıldız: her 6.5 sn'de bir, 1.3 sn süren kısa süzülüş
      const per = 6.5, k = Math.floor(t / per), u = (t - k * per) / 1.3, ks = v.kayan;
      if (u < 1) {
        const a = -0.38 - 0.12 * Math.sin(k * 1.7), x0 = -20 + ((k * 37) % 100), y0 = 64 + ((k * 13) % 14);
        ks.visible = true;
        ks.position.set(x0 + Math.cos(a) * u * 26, y0 + Math.sin(a) * u * 26, -128);
        ks.rotation.set(0, 0, a); ks.scale.set(18, 0.6, 1);
        v.km.uniforms.uA.value = Math.sin(u * PI) * 1.3;
      } else ks.visible = false;
    }
  };
})();
