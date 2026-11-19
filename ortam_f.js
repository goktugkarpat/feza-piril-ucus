/* ortam_f.js - Pırıl'ın Uçuş Okulu: yeni ortamlar (u2-ortam-f)
   36 · Balon Vadisi (bölüm 41) · 37 · Müzik Çayırı (bölüm 42) · 38 · Yel Değirmeni Tepesi (bölüm 43)
   Kalıp: DY_EK[n] = { palet, secenek, yardimci, yardimciKur, kur(ctx), guncelle(t, dt, ctx), sok(ctx) }.
   Her şey ctx.ekle(...) (ctx.grup) içinde: bölüm değişince dunya.js söker; OG geometrileri yalnız ctx.yapi().ekle(...) ile kullanılır. */
(function () {
  'use strict';
  window.DY_EK = window.DY_EK || {};
  const PI = Math.PI;

  // ── Ortak geometriler: bir kez kurulur, doğrudan Mesh'e verilmez (yalnız ctx.yapi().ekle ile kopyalanır), hiç dispose edilmez ──
  const OG = {};
  function ogPeri(T) { // Kapadokya peribacası gövdesi: taban y=0, tepe y=1, yumuşak yivli ve daralan
    if (OG.peri) return OG.peri;
    const g = new T.CylinderGeometry(0.62, 1.05, 1, 10, 4);
    g.translate(0, 0.5, 0);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x);
      const etek = 1 + 0.15 * Math.exp(-y * 5.0);
      const bel = 1 - 0.14 * Math.exp(-Math.pow((y - 0.82) / 0.14, 2));
      const yiv = 1 + 0.06 * Math.sin(a * 5.0 + y * 2.4) * (1 - 0.35 * y);
      const k = etek * bel * yiv;
      p.setXYZ(i, x * k, y, z * k);
    }
    g.computeVertexNormals();
    return (OG.peri = g);
  }
  function ogBalonDilim(T) { // Sıcak hava balonu dikey dilimi (45° = PI/4): 8 tanesi tam damla balon kurar
    if (OG.balonDilim) return OG.balonDilim;
    const prof = [
      [0.001, 1.2], [0.46, 1.12], [0.84, 0.86], [1.0, 0.48],
      [0.95, 0.06], [0.74, -0.38], [0.5, -0.78], [0.33, -1.06], [0.27, -1.2]
    ];
    return (OG.balonDilim = new T.LatheGeometry(prof.map(([r, y]) => new T.Vector2(r, y)), 2, 0, PI / 4));
  }
  function ogLale(T) { // Lale kadehi: taban y=0, boy 1 (hafif 4 dilimli)
    if (OG.lale) return OG.lale;
    const prof = [[0.0, 0.0], [0.42, 0.16], [0.56, 0.5], [0.36, 0.9], [0.45, 1.0], [0.0, 0.84]];
    return (OG.lale = new T.LatheGeometry(prof.map(([r, y]) => new T.Vector2(r, y)), 4));
  }
  function ogDisk(T) { // Ön yüzü +z olan ince disk (davul derisi, fırıldak göbeği)
    if (OG.disk) return OG.disk;
    const g = new T.CylinderGeometry(1, 1, 1, 14, 1);
    g.rotateX(PI / 2);
    return (OG.disk = g);
  }
  function ogNotaKure(T) { // Nota başı için küre
    if (OG.notaKure) return OG.notaKure;
    return (OG.notaKure = new T.SphereGeometry(1, 7, 5));
  }
  function ogNotaSil(T) { // Nota sapı / kirişi için silindir
    if (OG.notaSil) return OG.notaSil;
    return (OG.notaSil = new T.CylinderGeometry(1, 1, 1, 6, 1));
  }
  function ogPrizma(T) { // Çatı alnı üçgen prizması (tepe +y, taban y=-0.5)
    if (OG.prizma) return OG.prizma;
    const g = new T.CylinderGeometry(1, 1, 1, 3, 1);
    g.rotateX(PI / 2); g.rotateZ(PI);
    return (OG.prizma = g);
  }

  // Ortak: yer ve tepe yüksekliğinin üstüne oturt + temizleme yardımcısı
  function zeminY(ctx, x, z) {
    return z < -36 ? Math.max(ctx.yerY(x, z), ctx.tepeY(x, z)) : ctx.yerY(x, z);
  }
  function veriTemizle(ctx) {
    if (!ctx || !ctx.veri) return;
    for (const k in ctx.veri) ctx.veri[k] = null;
  }

  // ════════════════════════════════════════════════════════════════════
  // 36 · BALON VADİSİ — Kapadokya peribacaları, kayaya oyulmuş kapılar, renkli balonlar
  // (arka planda mor ve yıldız sarısı yok: Pırıl mor, yıldızlar sarı)
  // ════════════════════════════════════════════════════════════════════
  const BV_BALON = [
    [0xe85a48, 0xfff4e6], [0x3ca8dc, 0xffffff], [0x4cc48a, 0xffe4c4],
    [0xf48638, 0xffffff], [0xf06488, 0xb8ecff], [0x2c9e98, 0xffd2a8]
  ];
  DY_EK[36] = {
    palet: {
      ad: 'Balon Vadisi', gece: 0,
      sisRenk: 0xf6dfc6, sisYogun: 0.0036, arka: 0xf4dcc2,
      gok: [0xffe2be, 0xf6d8c4, 0xc8e4f6, 0x8cc6ef, 0x529be0], gunesPos: [56, 20], gunesRenk: 0xffe4bc,
      ykUst: 0xfff4e8, ykAlt: 0xb67a4e, ykGuc: 1.2, gnRenk: 0xfff0dc, gnGuc: 2.25, arkaRenk: 0x88c4ec, arkaGuc: 0.6,
      dag: [[0xd49a74, 0xf6dfc6], [0xc28662, 0xf0d6ba], [0xb07656, 0xe8ccb0]],
      tepe: [0xd89f6e, 0xf2c694, 0xc48b5e, 0xe6b888],
      agac: [[0x3e6b46, 0x6ea064], [0x4c7a4c, 0x82b070], [0x355c3c, 0x609058]],
      zemin: [0xe8bc88, 0xc6925e, 0xf2cfa2], cimen: [0x6f8e48, 0xb6c878, 0x98b062],
      cicek: [[0xe8644c, 0xffa690], [0x4ea8d8, 0xa8e0fa], [0xf08c46, 0xffc490], [0xf6ede4, 0xffffff]],
      sisSerit: [0xfff0dc, 0xf6d8be], siluet: [0x8c5638, 0xb87a52]
    },
    secenek: {
      agacTur: 'selvi', tepeCicekYok: true, mantarSusYok: true, degirmenYok: true, kulubeYok: true,
      bulutSay: 8, bulutRenk: [0xf6e4d4, 0xfffaf4], zeminDesen: 'kum', cimenSik: 0.55,
      piknikTur: 'piknik', piknikRenk: [0xe06444, 0xfff0dc],
      bayrakRenk: [0xe86848, 0x58b8e0, 0xf4a040, 0x6ac480],
      ucusanTur: 'yaprak', ucusanRenk: [0xffa690, 0xffcca0, 0xa8e0fa, 0xfff6ea],
      salincak: { sarmasik: [0x588a48, 0x98c274], cicek: [[0xe86848, 0xffa690], [0x58b8e0, 0xb0e4fa], [0xf4a040, 0xffcca0]] }
    },
    yardimci: {
      mantar: { sapka: [0xd85838, 0xff9878], govde: [0xf6e6d0, 0xffffff], benek: 0xfff8ec },
      bulut: { alt: 0xf4d8c4, ust: 0xffffff, yanak: 0xff8070, emissive: 0x7a503c },
      nilufer: { yaprak: [0x4c8e58, 0x92cc80], cicek: [0xe86848, 0xffaa90], halka: 0xfff0dc },
      ruzgar: { renk: [0x38a8d8, 0xb8ecff], emissive: 0x2080b8, ok: 0xffffff },
      halka: { renk: [0xe86838, 0xffb880], emissive: 0xc04820, cicek: [[0xe86848, 0xffa690], [0x58b8e0, 0xb0e4fa], [0x6ac480, 0xb6eec0]] },
      baloncuk: { renk: 0xb8e8ff, kenar: 0xffffff, cizgi: 0x2a7ac0, opaklik: 1.15 },
      esinti: { tur: 'yaprak', renk: 0xfff6ea, taneRenk: [0xffa690, 0x80d0f8, 0xffcca0, 0xffffff] }
    },
    yardimciKur: {
      // Salıncağın iki yanında güneşli pastel kurdeleler + sütun fiyonkları
      salincak(ctx, o) {
        const { G, karH } = ctx, sx = o.sapanX, z = o.z;
        const kurdeleR = [0xe86848, 0x58b8e0, 0xf4a040, 0x6ac480, 0xff98aa];
        const fiyonk = (x, y, zz, k, c1) => {
          const c2 = karH(c1, 0xffffff, 0.35);
          o.A.ekle(G.kureC, x, y, zz, 0.1 * k, 0.1 * k, 0.08 * k, c1, c2);
          for (const q of [-1, 1]) {
            o.A.ekle(G.koni4, x + q * 0.2 * k, y + 0.04 * k, zz, 0.14 * k, 0.28 * k, 0.05 * k, c1, c2, 0, 0, q * 1.25, -0.06);
            o.A.ekle(G.kutu, x + q * 0.14 * k, y - 0.36 * k, zz - 0.02, 0.08 * k, 0.62 * k, 0.025, c1, c2, 0, 0, -q * 0.18, 0.16);
          }
        };
        for (const q of [-1, 1]) {
          fiyonk(q * (sx + 0.08), 4.74, z + 0.26, 1.1, q < 0 ? kurdeleR[0] : kurdeleR[1]);
          for (let j = 0; j < 3; j++) {
            const rx = q * (sx + 1.02 + j * 0.22), ry = 4.92 - j * 0.05, len = 1.25 + (j % 2) * 0.3;
            const c = kurdeleR[(j + (q > 0 ? 2 : 0)) % kurdeleR.length], c2 = karH(c, 0xffffff, 0.38);
            o.A.ekle(G.kureC, rx, ry + 0.03, z + 0.18, 0.07, 0.07, 0.06, c, c2);
            o.A.ekle(G.kutu, rx, ry - len * 0.5, z + 0.16, 0.095, len, 0.025, c, c2, 0, 0, q * (0.06 + j * 0.04), 0.22);
            o.A.ekle(G.koni4, rx + q * 0.04, ry - len - 0.06, z + 0.16, 0.075, 0.14, 0.03, c, c2, 0, 0, PI, -0.2);
          }
        }
        for (const [ax, ay, ci] of [[-sx * 0.56, 5.82, 2], [0, 6.18, 4], [sx * 0.56, 5.82, 3]]) {
          fiyonk(ax, ay, z + 0.44, 0.9, kurdeleR[ci]);
        }
        for (const q of [-1, 1]) {
          const px = q * (sx + 1.05), pz = z + 0.58;
          o.S.ekle(G.kureU, px, 0.24, pz, 0.24, 0.28, 0.24, 0xb85838, 0xe88864);
          o.S.ekle(G.sil, px, 0.5, pz, 0.15, 0.1, 0.15, 0xc86442, 0xf09470);
          o.S.ekle(G.halkaInce, px, 0.54, pz, 0.16, 0.16, 0.4, 0xa84c2e, 0xd87450, PI / 2, 0, 0);
        }
      }
    },
    kur(ctx) {
      const { T, G, hx, yerY, R, ara, karH } = ctx;
      const S = ctx.yapi(), F = ctx.yapi(), L = ctx.yapi();
      const PR = ogPeri(T), BD = ogBalonDilim(T);
      const xa = -38, xb = hx + 46;

      // 1) Kapadokya peribacaları (z: -5 .. -24) + konik bazalt şapkalar + kemerli kaya kapıları (z <= -6)
      const kumTon = [[0xd69660, 0xf2c898], [0xc88454, 0xebb886], [0xdfaa78, 0xf8d8b2]];
      const bazaltTon = [[0x543a30, 0x826254], [0x624438, 0x906c5c], [0x483228, 0x745648]];
      const kapiRenk = [[0x3c90a8, 0x70c6dc], [0xd46040, 0xf4906e], [0x589858, 0x8cd088], [0xc87a3c, 0xefa664]];

      const periBacasi = (x, z, r, h, sapkaOran, kapiVar, ci) => {
        const y = zeminY(ctx, x, z) - 0.18;
        const kt = kumTon[ci % kumTon.length], bt = bazaltTon[ci % bazaltTon.length];
        S.ekle(PR, x, y, z, r, h, r * 0.92, kt[0], kt[1], 0, ara(-0.4, 0.4), 0);
        S.ekle(G.sil, x, y + h * 0.42, z, r * 0.78, h * 0.1, r * 0.73, karH(kt[0], 0xc47848, 0.45), kt[1]);
        const capY = y + h * 0.94, capR = r * (0.98 + sapkaOran * 0.25), capH = h * (0.34 + sapkaOran * 0.12);
        S.ekle(G.kureU, x, capY + 0.04, z, capR * 0.92, capH * 0.26, capR * 0.86, bt[0], bt[1]);
        S.ekle(G.koni, x, capY + capH * 0.5, z, capR, capH, capR * 0.94, bt[0], bt[1], ara(-0.04, 0.04), R() * PI, ara(-0.06, 0.06));
        S.ekle(G.kureU, x - r * 0.65, y + 0.22, z + r * 0.35, r * 0.65, 0.36, r * 0.55, kt[0], kt[1]);
        if (kapiVar && z <= -6) {
          const kz = z + r * 0.88, dw = Math.min(0.84, r * 0.54), dh = Math.min(1.36, h * 0.28);
          const kr = kapiRenk[ci % kapiRenk.length];
          S.ekle(G.kutu, x, y + dh * 0.52 + 0.18, kz - 0.04, dw + 0.28, dh * 0.96, 0.14, kt[1], 0xf8dec0);
          S.ekle(G.torusSap, x, y + dh + 0.14, kz + 0.02, (dw + 0.22) / 0.76, (dw + 0.22) / 0.76, 0.85, kt[1], 0xf8dec0);
          S.ekle(G.kutu, x, y + dh * 0.5 + 0.16, kz + 0.02, dw, dh * 0.9, 0.08, kr[0], kr[1]);
          S.ekle(G.kureU, x, y + dh * 0.95 + 0.16, kz + 0.02, dw * 0.5, dw * 0.44, 0.07, kr[0], kr[1]);
          S.ekle(G.kureC, x + dw * 0.28, y + dh * 0.48 + 0.16, kz + 0.08, 0.05, 0.05, 0.035, 0xd89c40, 0xffe498);
          S.ekle(G.kutu, x, y + 0.12, kz + 0.2, dw + 0.42, 0.2, 0.36, kt[0], kt[1]);
          // Kapı yanında minik saksı + üstte sıcak ışıklı kaya penceresi
          S.ekle(G.kule, x - dw * 0.72, y + 0.26, kz + 0.12, 0.14, 0.24, 0.14, 0xb85838, 0xe88864, PI, 0, 0);
          S.ekle(G.kureC, x - dw * 0.72, y + 0.42, kz + 0.12, 0.15, 0.12, 0.15, 0x4c8e48, 0x82be6c);
          const wy = y + h * 0.56, wz = z + r * 0.72;
          S.ekle(G.torusSap, x, wy + 0.12, wz + 0.02, 0.72, 0.72, 0.55, kt[1], 0xf8dec0);
          L.ekle(G.kutu, x, wy, wz, 0.38, 0.4, 0.06, 0xe88a3c, 0xffc878);
          L.ekle(G.kureC, x, wy + 0.2, wz, 0.19, 0.18, 0.06, 0xe88a3c, 0xffc878);
        }
      };

      const yakinX = [-30, -18, -6.5, 8, hx * 0.32, hx * 0.52, hx * 0.72, hx + 8, hx + 21, hx + 34];
      yakinX.forEach((x0, i) => {
        const x = x0 + ara(-1.8, 1.8), z = ara(-5.8, -13.2);
        const r = ara(1.15, 1.75), h = ara(3.8, 6.2), kapili = i % 2 === 0 || r > 1.38;
        periBacasi(x, z, r, h, ara(0.1, 0.45), kapili, i);
        if (i % 3 !== 1) periBacasi(x + (i % 2 ? 1.8 : -1.8), z - ara(0.8, 2.0), r * 0.65, h * 0.66, 0.25, false, i + 1);
      });

      for (let i = 0; i < 14; i++) {
        const x = xa + 4 + i * ((xb - xa - 8) / 13) + ara(-2.2, 2.2), z = ara(-15.5, -23.8);
        const r = ara(1.4, 2.3), h = ara(5.4, 8.8);
        periBacasi(x, z, r, h, ara(0.15, 0.5), i % 3 === 0, i + 2);
        if (R() < 0.6) {
          const sx = x + ara(-2.6, 2.6), sz = z - ara(1.5, 4.0), sr = ara(1.2, 1.85), sh = ara(3.2, 5.0), sy = zeminY(ctx, sx, sz) - 0.2;
          S.ekle(PR, sx, sy, sz, sr, sh, sr * 0.9, kumTon[i % 3][0], kumTon[i % 3][1]);
          S.ekle(G.kureU, sx, sy + sh * 0.98, sz, sr * 0.62, sr * 0.34, sr * 0.56, kumTon[i % 3][0], kumTon[i % 3][1]);
        }
      }

      for (let i = 0; i < 14; i++) {
        const x = ara(-68, hx + 82), z = ara(-42, -56), y = zeminY(ctx, x, z) - 0.3;
        if (y < 0.1) continue;
        const kt = kumTon[i % 3], bt = bazaltTon[i % 3], r = ara(1.2, 2.0), h = ara(3.2, 5.2);
        S.ekle(PR, x, y, z, r, h, r * 0.9, kt[0], kt[1]);
        S.ekle(G.koni, x, y + h + h * 0.16, z, r * 1.05, h * 0.36, r * 0.95, bt[0], bt[1]);
      }

      // 2) Vadi kır çiçekleri (F: sallanan; kureC ile hafif üçgen bütçesi)
      const cicekRenk = [[0xe8644c, 0xffa690], [0x4ea8d8, 0xa8e0fa], [0xf08c46, 0xffc490], [0xf6ede4, 0xffffff]];
      const kirCicegi = (x, z, s, c) => {
        const y = yerY(x, z);
        F.ekle(G.silA3, x, y + s * 0.34, z, 0.02 * s, s * 0.68, 0.02 * s, 0x5c8240, 0x90b464, 0, 0, 0, 0.65);
        for (let k = 0; k < 5; k++) {
          const a = k / 5 * PI * 2 + x;
          F.ekle(G.kureC, x + Math.cos(a) * 0.1 * s, y + s * 0.68 + Math.sin(a) * 0.1 * s, z, 0.08 * s, 0.08 * s, 0.045 * s, c[0], c[1], 0, 0, 0, -0.6);
        }
        F.ekle(G.kureC, x, y + s * 0.68, z + 0.04 * s, 0.06 * s, 0.06 * s, 0.04 * s, 0xe89448, 0xffcc98, 0, 0, 0, -0.6);
      };
      for (let i = 0; i < 55; i++) {
        const x = ara(xa + 2, xb - 2), z = i < 32 ? ara(-13, -2.0) : ara(1.6, 13.5);
        if (z > -2.5 && z < 4.5 && (Math.abs(x) < 5.0 || Math.abs(x - hx) < 5.2)) continue;
        kirCicegi(x, z, ara(0.75, 1.15), cicekRenk[i % cicekRenk.length]);
      }

      for (const [ax, az, sc] of [[hx - 3.8, -2.2, 0.95], [hx + 4.0, -2.4, 0.85]]) {
        const ay = yerY(ax, az);
        S.ekle(G.kureU, ax, ay + 0.36 * sc, az, 0.34 * sc, 0.42 * sc, 0.34 * sc, 0xb85838, 0xe88864);
        S.ekle(G.kule, ax, ay + 0.78 * sc, az, 0.16 * sc, 0.24 * sc, 0.16 * sc, 0xc86442, 0xf09470);
        S.ekle(G.halkaInce, ax, ay + 0.9 * sc, az, 0.16 * sc, 0.16 * sc, 0.45, 0xa84c2e, 0xd87450, PI / 2, 0, 0);
      }

      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0.25, { roughness: 0.85, emissive: 0x3a2010, emissiveIntensity: 0.16 })));
      ctx.ekle(new T.Mesh(F.geo(), ctx.malz(true, true, 0.35, { roughness: 0.65 })));
      ctx.ekle(new T.Mesh(L.geo(), ctx.malz(false, true, 0, { emissive: 0xffa048, emissiveIntensity: 0.95 })));

      // 3) Renkli çizgili sıcak hava balonları (arka katman z: -18 .. -65, 3 senkron InstancedMesh)
      const BA = ctx.yapi(), BB = ctx.yapi(), BC = ctx.yapi();
      for (let k = 0; k < 8; k++) {
        (k % 2 === 0 ? BA : BB).ekle(BD, 0, 0, 0, 1.5, 1.55, 1.5, 0xd8d8d8, 0xffffff, 0, k * PI / 4, 0);
      }
      BA.ekle(G.kureU, 0, 1.84, 0, 0.36, 0.12, 0.36, 0xd8d8d8, 0xffffff);
      BB.ekle(G.kule, 0, -1.78, 0, 0.44, 0.26, 0.44, 0xd8d8d8, 0xffffff, PI, 0, 0);
      BC.ekle(G.kutu, 0, -2.75, 0, 0.72, 0.56, 0.72, 0x8a582e, 0xc88e56);
      BC.ekle(G.kutu, 0, -2.48, 0, 0.78, 0.08, 0.78, 0x6e421e, 0xa8703c);
      for (const [rx, rz] of [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]]) {
        BC.ekle(G.sil, rx, -2.14, rz, 0.025, 0.7, 0.025, 0x6e4a2c, 0x986e48);
      }
      BC.ekle(G.kureC, 0, -1.92, 0, 0.13, 0.18, 0.13, 0xff8028, 0xffd288);

      const N = 16;
      const imA = new T.InstancedMesh(BA.geo(), ctx.malz(true, true, 0.35, { roughness: 0.58 }), N);
      const imB = new T.InstancedMesh(BB.geo(), ctx.malz(true, true, 0.35, { roughness: 0.58 }), N);
      const imC = new T.InstancedMesh(BC.geo(), ctx.malz(true, true, 0.2, { roughness: 0.75 }), N);
      imA.frustumCulled = false; imB.frustumCulled = false; imC.frustumCulled = false;

      const balonlar = [], tc = new T.Color();
      for (let i = 0; i < N; i++) {
        const c = BV_BALON[i % BV_BALON.length];
        imA.setColorAt(i, tc.setHex(c[0]));
        imB.setColorAt(i, tc.setHex(c[1]));
        const u = i / (N - 1);
        const x = -28 + u * (hx + 66) + ara(-4, 4);
        const z = -19 - (i % 5) * 10.5 - ara(0, 4.5);
        const y = 13 + (i % 4) * 4.4 + (-z - 19) * 0.16 + ara(-1, 2);
        const s = (0.78 + (i % 3) * 0.22) * (1 + (-z - 20) * 0.014);
        balonlar.push({ x, y, z, s, faz: i * 1.37 + R() * 2, hiz: 0.16 + (i % 4) * 0.05 });
      }
      if (imA.instanceColor) imA.instanceColor.needsUpdate = true;
      if (imB.instanceColor) imB.instanceColor.needsUpdate = true;
      ctx.ekle(imA); ctx.ekle(imB); ctx.ekle(imC);

      ctx.veri.balon = { imA, imB, imC, liste: balonlar };
      ctx.veri.o = new T.Object3D();
      this.guncelle(0, 0, ctx);
    },
    guncelle(t, dt, ctx) {
      const v = ctx && ctx.veri;
      if (!v || !v.balon || !v.o) return;
      const { imA, imB, imC, liste } = v.balon, o = v.o;
      for (let i = 0; i < liste.length; i++) {
        const b = liste[i];
        const yuk = (t * b.hiz + b.faz * 1.4) % 9.0;
        const nefes = Math.sin(yuk / 9.0 * PI) * 3.8 + Math.sin(t * 0.65 + b.faz) * 0.75;
        o.position.set(b.x + Math.sin(t * 0.18 + b.faz) * 2.2, b.y + nefes, b.z);
        o.rotation.set(Math.sin(t * 0.5 + b.faz) * 0.04, t * 0.12 + b.faz, Math.sin(t * 0.6 + b.faz) * 0.06);
        o.scale.setScalar(b.s);
        o.updateMatrix();
        imA.setMatrixAt(i, o.matrix);
        imB.setMatrixAt(i, o.matrix);
        imC.setMatrixAt(i, o.matrix);
      }
      imA.instanceMatrix.needsUpdate = true;
      imB.instanceMatrix.needsUpdate = true;
      imC.instanceMatrix.needsUpdate = true;
    },
    sok(ctx) { veriTemizle(ctx); }
  };

  // ════════════════════════════════════════════════════════════════════
  // 37 · MÜZİK ÇAYIRI — pastel ksilofon köprüleri, altın arp kemerleri, dans eden 3B notalar
  // ════════════════════════════════════════════════════════════════════
  const MC_TUS = [
    [0xff7088, 0xffbac6], [0xff9658, 0xffceaa], [0xf4b468, 0xffe2be],
    [0x48ca96, 0xa8f4d4], [0x4cc0e8, 0xb2ecff], [0x689cf0, 0xbcd8ff], [0xe688b8, 0xffcbe6]
  ];
  const MC_NOTA_RENK = [0xff5c8a, 0x26bfa0, 0xff8644, 0x3aa8ee, 0x56c870];
  DY_EK[37] = {
    palet: {
      ad: 'Müzik Çayırı', gece: 0,
      sisRenk: 0xdff6ec, sisYogun: 0.0035, arka: 0xdaf4ea,
      gok: [0xffdfcc, 0xffe8d8, 0xb8f0e4, 0x7cd8d8, 0x4eb8c8], gunesPos: [54, 24], gunesRenk: 0xffe4c4,
      ykUst: 0xf4fff8, ykAlt: 0x4e8e68, ykGuc: 1.2, gnRenk: 0xfff6ea, gnGuc: 2.2, arkaRenk: 0x90e8d8, arkaGuc: 0.58,
      dag: [[0x7ec8b8, 0xdff6ec], [0x6bb8a8, 0xd4f0e4], [0x5aa698, 0xc8e8dc]],
      tepe: [0x42b472, 0x8ae4a6, 0x56a884, 0x9ed8b4],
      agac: [[0x2a8e58, 0x6ad68e], [0x389e66, 0x80e4a0], [0x247c4c, 0x5cc47e]],
      zemin: [0x62cc82, 0x369a5c, 0x9aeaa8], cimen: [0x2c8c50, 0x92f0a8, 0x64d684],
      cicek: [[0xff6a88, 0xffbcd0], [0xff9a52, 0xffd2a8], [0x48b8f0, 0xb2e8ff], [0xfff2ee, 0xffffff]],
      sisSerit: [0xf2fff8, 0xdcf4ea], siluet: [0x1c623a, 0x2e8250]
    },
    secenek: {
      tepeCicekYok: true, mantarSusYok: true, degirmenYok: true, kulubeYok: true,
      bulutSay: 7, bulutRenk: [0xffe6dc, 0xffffff], cimenSik: 0.6,
      ucusanTur: 'cicek', ucusanRenk: [0xff88a8, 0x88e8d0, 0xffb888, 0x88d4ff, 0xffffff],
      piknikTur: 'piknik', piknikRenk: [0x46b892, 0xfff4ec],
      bayrakRenk: [0xff7294, 0x56c8a8, 0x58b4ec, 0xff9e58, 0xffffff],
      salincak: { sarmasik: [0x2e8e54, 0x76d68c], cicek: [[0xff7294, 0xffc6d6], [0x50bce8, 0xb4ebff], [0xff9e58, 0xffd6b0]] }
    },
    yardimci: {
      mantar: { sapka: [0xe85a48, 0xff9480], govde: [0xfff2d8, 0xffffff], benek: 0xffffff },
      bulut: { alt: 0xc2f0e4, ust: 0xffffff, yanak: 0xff7aa0, emissive: 0x4c8a7a },
      nilufer: { yaprak: [0x2e9a5c, 0x78e09a], cicek: [0xff749c, 0xffcce0], halka: 0xeafff6 },
      ruzgar: { renk: [0x38b8e0, 0xbcf6ff], emissive: 0x2490c0, ok: 0xffffff },
      halka: { renk: [0xff7258, 0xffcba4], emissive: 0xd85038, cicek: [[0xff7294, 0xffc6d6], [0x4cc49c, 0xaaf4d8], [0x58b8ec, 0xb4e8ff]] },
      baloncuk: { renk: 0xb0f4ea, kenar: 0xffffff, cizgi: 0x2890b0, opaklik: 1.15 },
      esinti: { tur: 'isik', renk: 0xf4fff8, taneRenk: [0xff94b4, 0x88eed0, 0xffc290, 0xffffff] }
    },
    yardimciKur: {
      // Salıncak: kemer üstü müzikli pastel flamalar + minik altın çan süsleri
      salincak(ctx, o) {
        const { G, karH } = ctx, sx = o.sapanX, z = o.z;
        const flamaR = [0xff7294, 0x56c8a8, 0x58b4ec, 0xff9e58, 0xffb4c8];
        const flama = (x0, y0, x1, y1, zz, sark, n, off) => {
          for (let i = 0; i < n; i++) {
            const u0 = i / n, u1 = (i + 1) / n;
            const xa = x0 + (x1 - x0) * u0, xb = x0 + (x1 - x0) * u1;
            const ya = y0 + (y1 - y0) * u0 - Math.sin(u0 * PI) * sark;
            const yb = y0 + (y1 - y0) * u1 - Math.sin(u1 * PI) * sark;
            o.A.ekle(G.sil, (xa + xb) / 2, (ya + yb) / 2, zz, 0.015, Math.hypot(xb - xa, yb - ya) + 0.02, 0.015, 0xfff4e8, 0xffffff, 0, 0, -Math.atan2(xb - xa, yb - ya));
            if (i > 0) {
              const c = flamaR[(i + off) % flamaR.length];
              o.A.ekle(G.koni4, xa, ya - 0.14, zz, 0.13, 0.26, 0.03, c, karH(c, 0xffffff, 0.35), 0, 0, PI, -0.1);
            }
          }
        };
        flama(-sx * 0.98, 5.38, 0, 6.46, z + 0.34, 0.2, 7, 0);
        flama(0, 6.46, sx * 0.98, 5.38, z + 0.34, 0.2, 7, 2);
        for (const q of [-1, 1]) {
          flama(q * (sx + 0.1), 5.08, q * (sx + 1.28), 5.44, z + 0.22, 0.18, 5, q < 0 ? 1 : 3);
          const cx = q * (sx + 1.24), cy = 5.02;
          o.S.ekle(G.sil, cx, cy + 0.2, z + 0.2, 0.018, 0.36, 0.018, 0xc89028, 0xf6d078);
          o.FL.ekle(G.kule, cx, cy, z + 0.2, 0.12, 0.22, 0.12, 0xd89c30, 0xffdf88);
          o.FL.ekle(G.kureC, cx, cy - 0.13, z + 0.2, 0.055, 0.055, 0.055, 0xfff0b0, 0xffffff);
        }
      },
      // Mantar yerine gülen, renkli yaylı davul (tabanı y=0, üst deri ~2.3, yarıçap ~1.65)
      mantar(M, i, ctx) {
        const { T, G } = ctx, DK = ogDisk(T), S = ctx.yapi();
        const ton = [
          [0xe85848, 0xff9278, 0x3ec0a8],
          [0x36a8b8, 0x84e4ec, 0xff8068],
          [0xf08638, 0xffbe80, 0x48be8a]
        ][i % 3];
        S.ekle(G.sil, 0, 0.14, 0, 1.56, 0.24, 1.56, 0x8c542a, 0xc48850);
        for (let k = 0; k < 6; k++) {
          const a = k / 6 * PI * 2 + 0.25, cx = Math.cos(a) * 1.48, cz = Math.sin(a) * 1.48;
          S.ekle(G.sil, cx, 0.38, cz, 0.075, 0.48, 0.075, 0xd89038, 0xffd280, Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35);
          S.ekle(G.kureC, cx * 0.98, 0.38, cz * 0.98, 0.11, 0.09, 0.11, ton[2], 0xffffff);
        }
        S.ekle(G.sil, 0, 1.36, 0, 1.58, 1.58, 1.58, ton[0], ton[1]);
        for (let k = 0; k < 10; k++) {
          const a = k / 10 * PI * 2, a2 = (k + 0.5) / 10 * PI * 2;
          if (Math.sin(a) > 0.45 && Math.abs(Math.cos(a)) < 0.72) continue;
          S.ekle(G.sil, Math.cos((a + a2) / 2) * 1.6, 1.36, Math.sin((a + a2) / 2) * 1.6, 0.032, 1.52, 0.032, 0xf2e4cc, 0xffffff, 0, 0, 0.24 * (k % 2 ? 1 : -1));
          S.ekle(G.kureC, Math.cos(a) * 1.63, 2.08, Math.sin(a) * 1.63, 0.08, 0.08, 0.08, 0xc88e28, 0xffe288);
        }
        S.ekle(G.halka, 0, 0.58, 0, 1.56, 1.56, 0.85, 0x8e5226, 0xd29456, PI / 2, 0, 0);
        S.ekle(G.halka, 0, 2.15, 0, 1.58, 1.58, 0.9, 0x8e5226, 0xd29456, PI / 2, 0, 0);
        S.ekle(DK, 0, 2.18, 0, 1.54, 1.54, 0.14, 0xf2e2c4, 0xfffcf2, -PI / 2, 0, 0);
        S.ekle(G.halkaInce, 0, 2.25, 0, 1.15, 1.15, 0.55, ton[0], ton[1], PI / 2, 0, 0);
        S.ekle(DK, 0, 2.25, 0, 0.58, 0.58, 0.03, 0xffe6cc, 0xfff8ec, -PI / 2, 0, 0);
        for (const q of [-1, 1]) S.ekle(G.kureK, q * 0.72, 1.16, 1.44, 0.22, 0.14, 0.06, 0xff7688, 0xff9eb0);
        S.ekle(G.torusSap, 0, 1.12, 1.57, 0.88, 0.88, 0.55, 0x421a1a, 0x5a2424, 0, 0, PI);
        const govde = new T.Mesh(S.geo(), ctx.malz(true, true, 0.55, { roughness: 0.42, emissive: ton[0], emissiveIntensity: 0.22 }));
        const E = ctx.yapi();
        for (const q of [-1, 1]) {
          E.ekle(G.kureK, q * 0.4, 0, 0, 0.13, 0.19, 0.07, 0x261214, 0x261214);
          E.ekle(G.kureC, q * 0.4 + 0.04, 0.07, 0.05, 0.045, 0.055, 0.02, 0xffffff, 0xffffff);
        }
        const goz = new T.Mesh(E.geo(), ctx.malz(true, true, 0, { roughness: 0.35 }));
        goz.position.set(0, 1.52, 1.58); govde.add(goz);
        const I = ctx.yapi();
        I.ekle(G.halka, 0, 0.1, 0, 2.1, 2.1, 0.65, 0xffd29a, 0xfff6e2, PI / 2, 0, 0);
        const im = new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.72, depthWrite: false });
        const hale = new T.Mesh(I.geo(), im);
        const O = ctx.yapi();
        for (const h of [0, 0.52]) for (const q of [-1, 1]) O.ekle(G.kutu, q * 0.24, h, 0, 0.6, 0.14, 0.08, 0xffffff, 0xfff4e0, 0, 0, -q * 0.7);
        const om = new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false });
        const oklar = new T.Mesh(O.geo(), om); oklar.position.set(0, 3.15, 0.45);
        const mesh = new T.Group(); mesh.add(govde); mesh.add(hale); mesh.add(oklar);
        (ctx.veri.zip = ctx.veri.zip || []).push({ govde, oklar, om, im, f: i * 1.4 });
        return { mesh, goz };
      }
    },
    kur(ctx) {
      const { T, G, hx, yerY, R, ara } = ctx;
      const S = ctx.yapi(), F = ctx.yapi();
      const NK = ogNotaKure(T), NS = ogNotaSil(T);
      const xa = -38, xb = hx + 46;

      // 1) Dev pastel gökkuşağı ksilofon köprüleri (orta-ön katman z: -6 .. -14)
      const ksilofon = (cx, cz, gen, k) => {
        const y0 = yerY(cx, cz), nTus = 9, yuk = 1.65 * k, w = gen * k;
        for (const qz of [-1.05 * k, 1.05 * k]) {
          for (let i = 0; i < nTus - 1; i++) {
            const u0 = i / (nTus - 1), u1 = (i + 1) / (nTus - 1);
            const x0 = cx + (u0 - 0.5) * w, x1 = cx + (u1 - 0.5) * w;
            const ya = y0 + 0.5 * k + Math.sin(u0 * PI) * yuk, yb = y0 + 0.5 * k + Math.sin(u1 * PI) * yuk;
            const len = Math.hypot(x1 - x0, yb - ya);
            S.ekle(G.kutu, (x0 + x1) / 2, (ya + yb) / 2, cz + qz, len + 0.16 * k, 0.22 * k, 0.24 * k, 0x8a5228, 0xc2864e, 0, 0, Math.atan2(yb - ya, x1 - x0));
          }
          for (const u of [0.08, 0.5, 0.92]) {
            const px = cx + (u - 0.5) * w, py = y0 + 0.5 * k + Math.sin(u * PI) * yuk;
            S.ekle(G.sil, px, (y0 + py) * 0.5, cz + qz, 0.13 * k, py - y0, 0.13 * k, 0x764420, 0xa86e3c);
          }
        }
        for (let i = 0; i < nTus; i++) {
          const u = i / (nTus - 1), tx = cx + (u - 0.5) * w, ty = y0 + 0.64 * k + Math.sin(u * PI) * yuk;
          const eg = Math.cos(u * PI) * yuk * PI / w, tusL = (3.0 - Math.abs(u - 0.5) * 0.72) * k;
          const c = MC_TUS[i % MC_TUS.length];
          S.ekle(G.kutu, tx, ty, cz, w / nTus * 0.82, 0.18 * k, tusL, c[0], c[1], 0, 0, Math.atan(eg));
          for (const qz of [-0.78 * k, 0.78 * k]) S.ekle(G.kureC, tx, ty + 0.12 * k, cz + qz, 0.08 * k, 0.055 * k, 0.08 * k, 0xc88e28, 0xffe498);
        }
        for (const q of [-1, 1]) {
          const u = q < 0 ? 0.34 : 0.66, mx = cx + (u - 0.5) * w, my = y0 + 0.64 * k + Math.sin(u * PI) * yuk;
          S.ekle(G.kureU, mx, my + 0.28 * k, cz + 0.55 * k, 0.25 * k, 0.25 * k, 0.25 * k, 0xff7088, 0xffd8e4);
          S.ekle(G.sil, mx + q * 0.45 * k, my + 0.34 * k, cz + 1.02 * k, 0.055 * k, 1.45 * k, 0.055 * k, 0xa8703c, 0xd8a068, 0.6, 0, q * 0.92);
        }
      };
      ksilofon(-14, -8.5, 6.6, 1.08);
      ksilofon(hx * 0.34, -10.5, 7.6, 1.16);
      ksilofon(hx * 0.72, -8.2, 7.0, 1.1);
      ksilofon(hx + 16, -11.5, 7.2, 1.1);

      // 2) Altın arp kemerleri (z: -16 .. -24)
      const arp = (cx, cz, k) => {
        const y = yerY(cx, cz) - 0.1, h = 6.6 * k, w = 4.0 * k;
        S.ekle(G.kutu, cx, y + 0.28 * k, cz, w * 1.18, 0.56 * k, 1.15 * k, 0x9c6a1e, 0xd8a244);
        S.ekle(G.kutu, cx, y + 0.64 * k, cz, w, 0.24 * k, 0.9 * k, 0xb88028, 0xf0c268);
        const egri = new T.CatmullRomCurve3([
          new T.Vector3(cx - w * 0.42, y + 0.7 * k, cz),
          new T.Vector3(cx - w * 0.38, y + h * 0.56, cz),
          new T.Vector3(cx - w * 0.14, y + h * 0.98, cz),
          new T.Vector3(cx + w * 0.22, y + h * 0.82, cz),
          new T.Vector3(cx + w * 0.45, y + h * 0.94, cz)
        ]);
        const tg = new T.TubeGeometry(egri, 18, 0.26 * k, 7, false);
        S.ekle(tg, 0, 0, 0, 1, 1, 1, 0xb88028, 0xf2ca6c); tg.dispose();
        S.ekle(G.kule, cx + w * 0.45, y + h * 0.51, cz, 0.26 * k, h * 0.88, 0.26 * k, 0x9c6a1e, 0xe8bc5c);
        S.ekle(G.kureU, cx + w * 0.45, y + h * 0.97, cz, 0.36 * k, 0.34 * k, 0.36 * k, 0xd09430, 0xffe494);
        S.ekle(G.kureU, cx - w * 0.12, y + h * 1.03, cz, 0.26 * k, 0.26 * k, 0.26 * k, 0xd89c38, 0xffe89e);
        for (let i = 0; i < 9; i++) {
          const u = (i + 1) / 10, tx = cx + (u - 0.48) * w * 0.82;
          const ustY = y + h * (0.95 - 0.12 * Math.sin(u * PI * 1.4));
          const len = ustY - (y + 0.72 * k);
          S.ekle(G.sil, tx, y + 0.72 * k + len * 0.5, cz, 0.024 * k, len, 0.024 * k, 0xebd8b0, 0xfffaf0);
        }
      };
      arp(-20, -19.5, 1.05);
      arp(hx * 0.22, -21.5, 1.18);
      arp(hx * 0.58, -18.5, 1.08);
      arp(hx + 20, -21, 1.12);

      // 3) Yüzsüz süs çan askılıkları (davula benzemez, zarif kemerli ahşap askı + renkli çanlar)
      const canAskisi = (cx, cz, k, c1) => {
        const y = yerY(cx, cz) - 0.05;
        for (const q of [-1, 1]) {
          S.ekle(G.sil, cx + q * 1.05 * k, y + 1.65 * k, cz, 0.08 * k, 3.3 * k, 0.08 * k, 0x7c4e28, 0xb07c4a);
          S.ekle(G.kureC, cx + q * 1.05 * k, y + 3.35 * k, cz, 0.14 * k, 0.14 * k, 0.14 * k, 0xd89830, 0xffe290);
        }
        S.ekle(G.sil, cx, y + 3.28 * k, cz, 0.085 * k, 2.5 * k, 0.085 * k, 0x7c4e28, 0xb07c4a, 0, 0, PI / 2);
        S.ekle(G.torusSap, cx, y + 3.28 * k, cz, 2.5 * k, 1.4 * k, 0.8 * k, 0xc88c2c, 0xf2c868);
        for (let j = 0; j < 4; j++) {
          const bx = cx + (j - 1.5) * 0.52 * k, boy = (0.95 - j * 0.12) * k, col = MC_TUS[(j + c1) % MC_TUS.length];
          S.ekle(G.sil, bx, y + 3.28 * k - boy * 0.45, cz, 0.022 * k, boy * 0.9, 0.022 * k, 0xc89028, 0xf6d078);
          S.ekle(G.kule, bx, y + 3.28 * k - boy - 0.16 * k, cz, 0.17 * k, 0.32 * k, 0.17 * k, col[0], col[1]);
          S.ekle(G.kureC, bx, y + 3.28 * k - boy - 0.34 * k, cz, 0.07 * k, 0.07 * k, 0.07 * k, 0xd8a038, 0xffe8a0);
        }
      };
      for (const [cx, cz, k, ci] of [[-26, -7.2, 0.95, 0], [3, -15, 1.05, 2], [hx * 0.48, -14.5, 1.08, 4], [hx + 6.5, -6.8, 0.95, 1], [hx + 28, -13, 1.02, 3]]) {
        canAskisi(cx, cz, k, ci);
      }

      // 4) Ön ve orta çayır çiçekleri (mor ve yıldız sarısı hariç)
      const cicR = [[0xff6a88, 0xffbcd0], [0xff9a52, 0xffd2a8], [0x48b8f0, 0xb2e8ff], [0xfff2ee, 0xffffff]];
      for (let i = 0; i < 50; i++) {
        const x = ara(xa + 2, xb - 2), z = i < 28 ? ara(-14, -2.2) : ara(1.6, 13.5);
        if (z > -2.5 && z < 4.5 && (Math.abs(x) < 5.0 || Math.abs(x - hx) < 5.2)) continue;
        const c = cicR[i % cicR.length], s = ara(0.7, 1.15), y = yerY(x, z);
        F.ekle(G.silA3, x, y + 0.34 * s, z, 0.02 * s, 0.68 * s, 0.02 * s, 0x2c8c50, 0x64d684, 0, 0, 0, 0.7);
        for (let k = 0; k < 5; k++) {
          const a = k / 5 * PI * 2 + x;
          F.ekle(G.kureC, x + Math.cos(a) * 0.1 * s, y + 0.68 * s + Math.sin(a) * 0.1 * s, z, 0.08 * s, 0.08 * s, 0.045 * s, c[0], c[1], 0, 0, 0, -0.65);
        }
        F.ekle(G.kureC, x, y + 0.68 * s, z + 0.04 * s, 0.055 * s, 0.055 * s, 0.04 * s, 0xff9a52, 0xffd8b4, 0, 0, 0, -0.65);
      }

      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0.3, { roughness: 0.55 })));
      ctx.ekle(new T.Mesh(F.geo(), ctx.malz(true, true, 0.3, { roughness: 0.65 })));

      // 5) Dans eden 3B müzik notaları (♪ ve ♫; z: -8 .. -26; paylaşımlı OG küre + silindirlerle kurulu)
      const N1 = ctx.yapi();
      N1.ekle(NK, -0.22, -0.4, 0, 0.44, 0.32, 0.25, 0xe2e2e2, 0xffffff, 0, 0, 0.34);
      N1.ekle(NS, 0.14, 0.24, 0, 0.095, 1.32, 0.095, 0xe2e2e2, 0xffffff);
      N1.ekle(NK, 0.14, 0.9, 0, 0.11, 0.11, 0.11, 0xffffff, 0xffffff);
      N1.ekle(NS, 0.36, 0.72, 0, 0.09, 0.56, 0.09, 0xe8e8e8, 0xffffff, 0, 0, 0.74);
      N1.ekle(NS, 0.54, 0.42, 0, 0.08, 0.42, 0.08, 0xe8e8e8, 0xffffff, 0, 0, 0.24);
      N1.ekle(NK, 0.5, 0.23, 0, 0.085, 0.085, 0.085, 0xffffff, 0xffffff);

      const N2 = ctx.yapi();
      N2.ekle(NK, -0.5, -0.42, 0, 0.4, 0.29, 0.24, 0xe2e2e2, 0xffffff, 0, 0, 0.32);
      N2.ekle(NK, 0.42, -0.28, 0, 0.4, 0.29, 0.24, 0xe2e2e2, 0xffffff, 0, 0, 0.32);
      N2.ekle(NS, -0.19, 0.22, 0, 0.09, 1.3, 0.09, 0xe2e2e2, 0xffffff);
      N2.ekle(NS, 0.73, 0.36, 0, 0.09, 1.3, 0.09, 0xe2e2e2, 0xffffff);
      N2.ekle(NS, 0.27, 0.92, 0, 0.11, 1.0, 0.11, 0xffffff, 0xffffff, 0, 0, -PI / 2 + 0.15);
      N2.ekle(NS, 0.27, 0.65, 0, 0.08, 0.96, 0.08, 0xebebeb, 0xffffff, 0, 0, -PI / 2 + 0.15);
      for (const [cx, cy] of [[-0.19, 0.85], [0.73, 0.99]]) N2.ekle(NK, cx, cy, 0, 0.115, 0.115, 0.115, 0xffffff, 0xffffff);

      const nMat = ctx.malz(true, true, 0.45, { roughness: 0.34, emissive: 0x382a32, emissiveIntensity: 0.3 });
      const n1Say = 16, n2Say = 12;
      const imN1 = new T.InstancedMesh(N1.geo(), nMat, n1Say);
      const imN2 = new T.InstancedMesh(N2.geo(), nMat, n2Say);
      imN1.frustumCulled = false; imN2.frustumCulled = false;

      const tc = new T.Color(), notalar1 = [], notalar2 = [];
      for (let i = 0; i < n1Say; i++) {
        imN1.setColorAt(i, tc.setHex(MC_NOTA_RENK[i % MC_NOTA_RENK.length]));
        notalar1.push({
          x: -24 + i * (hx + 52) / (n1Say - 1) + ara(-2, 2),
          y: ara(4.8, 11.2),
          z: ara(-8.5, -24.5),
          s: ara(0.95, 1.4),
          faz: i * 0.9
        });
      }
      for (let i = 0; i < n2Say; i++) {
        imN2.setColorAt(i, tc.setHex(MC_NOTA_RENK[(i + 2) % MC_NOTA_RENK.length]));
        notalar2.push({
          x: -20 + i * (hx + 44) / (n2Say - 1) + ara(-2.2, 2.2),
          y: ara(5.4, 12.2),
          z: ara(-10.5, -25.8),
          s: ara(0.9, 1.32),
          faz: i * 1.15 + 0.6
        });
      }
      if (imN1.instanceColor) imN1.instanceColor.needsUpdate = true;
      if (imN2.instanceColor) imN2.instanceColor.needsUpdate = true;
      ctx.ekle(imN1); ctx.ekle(imN2);

      ctx.veri.notalar = { imN1, imN2, n1: notalar1, n2: notalar2 };
      ctx.veri.o = new T.Object3D();
      this.guncelle(0, 0, ctx);
    },
    guncelle(t, dt, ctx) {
      const v = ctx && ctx.veri;
      if (!v) return;
      if (v.zip) {
        for (const z of v.zip) {
          const p = Math.sin(t * 2.8 + z.f);
          z.govde.position.y = Math.max(0, p) * 0.14;
          const u = (t * 0.9 + z.f) % 1;
          z.oklar.position.y = 2.95 + u * 0.85 + Math.max(0, p) * 0.14;
          z.om.opacity = Math.sin(u * PI) * 0.92;
          z.im.opacity = 0.42 + 0.28 * Math.sin(t * 3.0 + z.f);
        }
      }
      const n = v.notalar, o = v.o;
      if (!n || !o) return;
      const guncelleGrup = (im, liste, hiz) => {
        for (let i = 0; i < liste.length; i++) {
          const d = liste[i], ritim = Math.abs(Math.sin(t * hiz + d.faz));
          o.position.set(d.x + Math.sin(t * 1.1 + d.faz) * 0.28, d.y + ritim * 0.72, d.z);
          o.rotation.set(0, Math.sin(t * 0.8 + d.faz) * 0.16, Math.sin(t * 2.2 + d.faz) * 0.22);
          const sc = d.s * (0.94 + ritim * 0.14);
          o.scale.set(sc * (1 + (1 - ritim) * 0.06), sc * (1 - (1 - ritim) * 0.04), sc);
          o.updateMatrix();
          im.setMatrixAt(i, o.matrix);
        }
        im.instanceMatrix.needsUpdate = true;
      };
      guncelleGrup(n.imN1, n.n1, 3.0);
      guncelleGrup(n.imN2, n.n2, 2.7);
    },
    sok(ctx) { veriTemizle(ctx); }
  };

  // ════════════════════════════════════════════════════════════════════
  // 38 · YEL DEĞİRMENİ TEPESİ — kıyı tepeleri, tuğla-beyaz değirmenler, dönen fırıldaklar
  // ════════════════════════════════════════════════════════════════════
  const YD_FIRILDAK = [0xe83242, 0x2e82dc, 0xf27e28, 0x3eb458];
  DY_EK[38] = {
    palet: {
      ad: 'Yel Değirmeni Tepesi', gece: 0,
      sisRenk: 0xd4ecfc, sisYogun: 0.0034, arka: 0xcce8fa,
      gok: [0xdcf0ff, 0xbce2ff, 0x92ccf8, 0x5ea8ee, 0x347ed8], gunesPos: [58, 26], gunesRenk: 0xfff2cf,
      ykUst: 0xf4faff, ykAlt: 0x628c46, ykGuc: 1.22, gnRenk: 0xfff6e4, gnGuc: 2.3, arkaRenk: 0xaad8ff, arkaGuc: 0.56,
      dag: [[0x88b4da, 0xd4ecfc], [0x76a2ca, 0xc8e4f6], [0x6492bc, 0xbcdef2]],
      tepe: [0x5cb84e, 0xa2dc68, 0xc8a44e, 0xe8cc76],
      agac: [[0xc8582c, 0xf29c46], [0xd8742a, 0xffba54], [0x4c9442, 0x8ad260]],
      zemin: [0x6ecc54, 0x429c3a, 0xa8de74], cimen: [0x3a943c, 0xb2ea72, 0x86d45e],
      cicek: [[0xe83848, 0xff828a], [0xf48430, 0xffbe74], [0x3c8ee0, 0x9ad4ff], [0xfff4ec, 0xffffff]],
      sisSerit: [0xf4faff, 0xe2f2fc], siluet: [0x265c2c, 0x3e7e40]
    },
    secenek: {
      agacYok: false, agacTur: 'akcaagac', tepeCicekYok: true, mantarSusYok: true,
      degirmenYok: true, kulubeYok: true, ruzgarSerit: true,
      bulutSay: 8, bulutRenk: [0xdceeff, 0xffffff], cimenSik: 0.52,
      ucusanTur: 'yaprak', ucusanRenk: [0xff8a58, 0xffc070, 0x8ad468, 0xff7a8a],
      piknikTur: 'piknik', piknikRenk: [0xd8463c, 0xfff8f0],
      bayrakRenk: [0xe83848, 0xffffff, 0x3c8ee0, 0xf48430],
      salincak: { sarmasik: [0x4c9844, 0x90d466], cicek: [[0xe83848, 0xff828a], [0x3c8ee0, 0x9ad4ff], [0xf48430, 0xffbe74]] }
    },
    yardimci: {
      mantar: { sapka: [0xdc3c36, 0xff7a70], govde: [0xf6ecdc, 0xffffff], benek: 0xffffff },
      bulut: { alt: 0xcce4fa, ust: 0xffffff, yanak: 0xff7e94, emissive: 0x6280a4 },
      nilufer: { yaprak: [0x449a42, 0x8ad868], cicek: [0xe84858, 0xffa0a8], halka: 0xffffff },
      ruzgar: { renk: [0x40a8ec, 0xc2ecff], emissive: 0x2080cc, ok: 0xffffff },
      halka: { renk: [0xe86438, 0xffbe7c], emissive: 0xc84820, cicek: [[0xe83848, 0xff828a], [0x3c8ee0, 0x9ad4ff], [0xf48430, 0xffbe74]] },
      baloncuk: { renk: 0xb6ecff, kenar: 0xffffff, cizgi: 0x2674c4, opaklik: 1.15 },
      esinti: { tur: 'yaprak', renk: 0xf4faff, taneRenk: [0xff8a58, 0x96e074, 0xff7a8a, 0xffffff] }
    },
    yardimciKur: {
      // Salıncak tepesi ve yan direklerinde neşeli ahşap fırıldaklar
      salincak(ctx, o) {
        const { G, karH } = ctx, sx = o.sapanX, z = o.z;
        const firildak = (x, y, zz, k, off, sapBoy) => {
          const sb = sapBoy || 0.78;
          o.A.ekle(G.sil, x, y - sb * 0.5 * k, zz, 0.038 * k, sb * k, 0.038 * k, 0x8a5832, 0xc28a56);
          for (let j = 0; j < 4; j++) {
            const a = j / 4 * PI * 2 + 0.38, c = YD_FIRILDAK[(j + off) % 4], c2 = karH(c, 0xffffff, 0.32);
            o.A.ekle(G.koni4, x + Math.cos(a) * 0.26 * k, y + Math.sin(a) * 0.26 * k, zz + 0.05, 0.2 * k, 0.48 * k, 0.05 * k, c, c2, 0.18, 0, a - PI / 2, -0.14);
          }
          o.A.ekle(G.kureC, x, y, zz + 0.08, 0.095 * k, 0.095 * k, 0.065 * k, 0xfff4e0, 0xffffff);
          for (const q of [-1, 1]) {
            const rc = YD_FIRILDAK[(off + (q > 0 ? 1 : 0)) % 4];
            o.A.ekle(G.kutu, x + q * 0.06 * k, y - 0.52 * k, zz + 0.01, 0.04 * k, 0.36 * k, 0.02, rc, karH(rc, 0xffffff, 0.3), 0, 0, q * 0.14, 0.2);
          }
        };
        firildak(-0.92, 7.18, z + 0.02, 1.08, 0, 1.15);
        firildak(0.92, 7.18, z + 0.02, 1.08, 2, 1.15);
        firildak(-(sx + 2.08), 5.65, z + 0.38, 1.02, 1, 0.92);
        firildak(sx + 2.08, 5.65, z + 0.38, 1.02, 3, 0.92);
        firildak(-(sx + 0.1), 4.92, z + 0.32, 0.72, 2, 0.42);
        firildak(sx + 0.1, 4.92, z + 0.32, 0.72, 0, 0.42);
      }
    },
    kur(ctx) {
      const { T, G, hx, yerY, R, ara, karH } = ctx;
      const S = ctx.yapi(), F = ctx.yapi(), L = ctx.yapi();
      const LG = ogLale(T), PR = ogPrizma(T);
      const xa = -38, xb = hx + 46;

      // 1) Altın buğday ve renkli lale şeritleri (z <= -4; temiz tarla şeritleri + hafif üçgen)
      const laleRenk = [[0xd82838, 0xff6e7a], [0xf07828, 0xffb878], [0x3884d4, 0x90d0ff], [0xf06290, 0xffbad0], [0xf4ede4, 0xffffff]];
      const bugday = (x, z, k) => {
        const y = zeminY(ctx, x, z), h = 0.72 * k, eg = ara(-0.15, 0.15);
        F.ekle(G.silA3, x + eg * 0.2, y + h * 0.45, z, 0.022 * k, h, 0.022 * k, 0xa87e2e, 0xdcb050, 0, 0, -eg, 0.72);
        F.ekle(G.kureC, x + eg * 0.42, y + h * 0.95, z, 0.075 * k, 0.22 * k, 0.075 * k, 0xc89638, 0xf2cd74, 0, 0, -eg, 0.72);
      };
      const lale = (x, z, k, c) => {
        const y = zeminY(ctx, x, z), h = 0.54 * k;
        F.ekle(G.silA3, x, y + h * 0.5, z, 0.022 * k, h, 0.022 * k, 0x3a8a38, 0x62b44e, 0, 0, 0, 0.55);
        F.ekle(LG, x, y + h, z, 0.2 * k, 0.32 * k, 0.2 * k, c[0], c[1], 0, R() * 3, 0, 0.55);
      };
      for (let bx = xa + 2; bx < xb; bx += 7.5) {
        const idx = Math.floor((bx - xa) / 7.5);
        if (idx % 2 === 0) {
          const c = laleRenk[idx % laleRenk.length];
          for (let s = 0; s < 3; s++) {
            const sx = bx + 0.9 + s * 1.85;
            S.ekle(G.kureU, sx, zeminY(ctx, sx, -7.9) - 0.03, -7.9, 1.05, 0.09, 2.2, 0x428836, 0x5aa848);
          }
          for (let rx = 0.2; rx < 5.4; rx += 0.95) {
            for (const zz of [-6.4, -7.9, -9.4]) lale(bx + rx + ara(-0.2, 0.2), zz + ara(-0.25, 0.25), ara(0.9, 1.2), c);
          }
        } else {
          for (let s = 0; s < 3; s++) {
            const sx = bx + 0.9 + s * 1.85;
            S.ekle(G.kureU, sx, zeminY(ctx, sx, -8.2) - 0.03, -8.2, 1.05, 0.09, 2.4, 0xb88c34, 0xdcb454);
          }
          for (let rx = 0.2; rx < 5.4; rx += 0.85) {
            for (const zz of [-6.5, -8.2, -9.9]) bugday(bx + rx + ara(-0.18, 0.18), zz + ara(-0.25, 0.25), ara(0.9, 1.25));
          }
        }
      }

      // 2) Kırmızı / mercan renkli sahil evleri (z <= -10)
      const ev = (x, z, k, duvar) => {
        const y = zeminY(ctx, x, z) - 0.1, W = 3.6 * k, H = 2.4 * k, D = 2.8 * k, Hg = 1.9 * k;
        S.ekle(G.kutu, x, y + 0.16 * k, z, W + 0.2 * k, 0.32 * k, D + 0.2 * k, 0x8a7e72, 0xb8aca0);
        S.ekle(G.kutu, x, y + H * 0.5, z, W, H, D, duvar[0], duvar[1]);
        S.ekle(PR, x, y + H + Hg * 0.33, z, W * 0.577, Hg / 1.5, D, duvar[0], duvar[1]);
        const a = Math.atan2(Hg, W * 0.5), Lc = Math.hypot(W * 0.5, Hg) + 0.45 * k;
        for (const q of [-1, 1]) {
          S.ekle(G.kutu, x + q * (W * 0.25 + 0.08 * k), y + H + Hg * 0.5 + 0.1 * k, z, Lc, 0.2 * k, D + 0.45 * k, 0xa84028, 0xd86244, 0, 0, -q * a);
          S.ekle(G.kutu, x + q * W * 0.49, y + H * 0.5, z + D * 0.5 + 0.02, 0.14 * k, H, 0.06, 0xf2ece4, 0xffffff);
        }
        S.ekle(G.kutu, x + W * 0.24, y + H + Hg * 0.8, z - 0.2 * k, 0.38 * k, 0.9 * k, 0.38 * k, 0x9c4230, 0xc45e46);
        S.ekle(G.kutu, x + W * 0.24, y + H + Hg * 0.8 + 0.48 * k, z - 0.2 * k, 0.48 * k, 0.12 * k, 0.48 * k, 0xf2ece4, 0xffffff);
        const fz = z + D * 0.5 + 0.03;
        S.ekle(G.kutu, x - W * 0.18, y + 0.68 * k, fz, 0.72 * k, 1.32 * k, 0.06, 0xf2ece4, 0xffffff);
        S.ekle(G.kutu, x - W * 0.18, y + 0.66 * k, fz + 0.03, 0.54 * k, 1.18 * k, 0.05, 0x2c6496, 0x488ac0);
        S.ekle(G.kutu, x + W * 0.22, y + 1.25 * k, fz, 0.82 * k, 0.78 * k, 0.05, 0xf2ece4, 0xffffff);
        L.ekle(G.kutu, x + W * 0.22, y + 1.25 * k, fz + 0.03, 0.64 * k, 0.6 * k, 0.04, 0xffbe68, 0xfff0b8);
        S.ekle(G.kutu, x + W * 0.22, y + 1.25 * k, fz + 0.06, 0.64 * k, 0.06 * k, 0.03, 0xf2ece4, 0xffffff);
        S.ekle(G.kutu, x + W * 0.22, y + 1.25 * k, fz + 0.06, 0.06 * k, 0.6 * k, 0.03, 0xf2ece4, 0xffffff);
      };
      ev(-12, -16, 0.9, [0xc8463c, 0xe86858]);
      ev(hx * 0.26, -13, 0.88, [0xe46450, 0xff927e]);
      ev(hx * 0.64, -25, 1.0, [0xc03e36, 0xe25e4e]);
      ev(hx + 10, -16.5, 0.92, [0xe05c4a, 0xff8876]);
      ev(hx + 28, -23, 0.96, [0xc8463c, 0xe86858]);

      // 3) Kıyı tepelerinde tuğla & kireç badanalı, pişmiş toprak çatılı 5 yel değirmeni (z: -8 .. -30)
      const degirmenYer = [
        [-22, -25, 1.02, 0.45],
        [7, -14.5, 0.88, 0.62],
        [hx * 0.42, -25, 1.15, 0.48],
        [hx * 0.74, -15, 0.92, 0.56],
        [hx + 20, -27, 1.08, 0.42]
      ];
      const vaneGeoYap = () => {
        const VY = ctx.yapi();
        for (let j = 0; j < 4; j++) {
          const a = j / 4 * PI * 2, ca = Math.cos(a), sa = Math.sin(a);
          VY.ekle(G.kutu, ca * 1.75, sa * 1.75, -0.04, 3.45, 0.13, 0.13, 0x6e4224, 0x98643e, 0, 0, a);
          VY.ekle(G.kutu, ca * 1.95 - sa * 0.34, sa * 1.95 + ca * 0.34, 0.02, 2.75, 0.66, 0.04, 0xfaf0dc, 0xffffff, 0, 0, a);
          VY.ekle(G.kutu, ca * 3.05 - sa * 0.34, sa * 3.05 + ca * 0.34, 0.05, 0.34, 0.66, 0.03, j % 2 ? 0x3a88d0 : 0xd84c38, 0xffffff, 0, 0, a);
          for (const u of [1.1, 2.1, 3.1]) VY.ekle(G.kutu, ca * u - sa * 0.32, sa * u + ca * 0.32, 0.05, 0.06, 0.74, 0.06, 0x7c4c2a, 0xaa744a, 0, 0, a);
          VY.ekle(G.kutu, ca * 1.95 - sa * 0.66, sa * 1.95 + ca * 0.66, 0.04, 2.75, 0.06, 0.06, 0x7c4c2a, 0xaa744a, 0, 0, a);
        }
        VY.ekle(G.sil, 0, 0, 0.04, 0.34, 0.42, 0.34, 0x6e4224, 0xa87246, PI / 2, 0, 0);
        VY.ekle(G.kureU, 0, 0, 0.25, 0.22, 0.22, 0.16, 0xc88e28, 0xffe490);
        return VY.geo();
      };
      const vaneler = [];
      for (let i = 0; i < degirmenYer.length; i++) {
        const [x, z, k, hiz] = degirmenYer[i], y = yerY(x, z) - 0.12;
        S.ekle(G.kule, x, y + 1.05 * k, z, 1.55 * k, 2.1 * k, 1.55 * k, 0x9c4234, 0xc45c48);
        S.ekle(G.sil, x, y + 2.12 * k, z, 1.24 * k, 0.18 * k, 1.24 * k, 0xf2eae0, 0xffffff);
        S.ekle(G.kule, x, y + 4.35 * k, z, 1.22 * k, 4.4 * k, 1.22 * k, 0xe8e0d6, 0xffffff);
        S.ekle(G.sil, x, y + 3.65 * k, z, 1.52 * k, 0.15 * k, 1.52 * k, 0x7a4a2a, 0xa67048);
        S.ekle(G.halkaInce, x, y + 4.05 * k, z, 1.48 * k, 1.48 * k, 0.55, 0x7a4a2a, 0xa67048, PI / 2, 0, 0);
        S.ekle(G.sil, x, y + 6.56 * k, z, 1.08 * k, 0.2 * k, 1.08 * k, 0x7a4a2a, 0xa67048);
        S.ekle(G.koni, x, y + 7.72 * k, z, 1.68 * k, 2.2 * k, 1.68 * k, 0xb8462c, 0xdf6848);
        S.ekle(G.kureC, x, y + 8.88 * k, z, 0.18 * k, 0.18 * k, 0.18 * k, 0xd89828, 0xffe490);
        S.ekle(G.kutu, x, y + 0.72 * k, z + 1.52 * k, 0.86 * k, 1.32 * k, 0.12 * k, 0xf2eae0, 0xffffff);
        S.ekle(G.kutu, x, y + 0.68 * k, z + 1.56 * k, 0.64 * k, 1.18 * k, 0.1, 0x2c6496, 0x488ac0);
        S.ekle(G.torusHalka, x, y + 5.1 * k, z + 1.12 * k, 1.05 * k, 1.05 * k, 0.75 * k, 0x7a4a2a, 0xa67048);
        L.ekle(G.kureU, x, y + 5.1 * k, z + 1.1 * k, 0.28 * k, 0.28 * k, 0.1 * k, 0xffbe68, 0xfff0b8);
        const vane = new T.Mesh(vaneGeoYap(), ctx.malz(true, true, 0.25, { roughness: 0.65 }));
        vane.position.set(x, y + 6.18 * k, z + 1.36 * k);
        vane.scale.setScalar(k);
        ctx.ekle(vane);
        vaneler.push({ vane, hiz, faz: i * 1.1 });
      }

      // 4) Ahşap çit boyunca sıralı dönen renkli fırıldaklar (z: -4.5)
      const citZ = -4.5, firildakYer = [];
      let onceki = null;
      for (let x = xa + 8; x <= xb - 6; x += 3.2) {
        const y = yerY(x, citZ);
        S.ekle(G.kutu, x, y + 0.45, citZ, 0.14, 0.94, 0.14, 0x8a5a34, 0xbc8a56);
        S.ekle(G.koni4, x, y + 0.98, citZ, 0.1, 0.14, 0.1, 0x8a5a34, 0xb88450, 0, PI / 4, 0);
        if (onceki) {
          const dx = x - onceki[0], dy = y - onceki[1], len = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
          for (const h of [0.32, 0.68]) S.ekle(G.kutu, onceki[0] + dx * 0.5, onceki[1] + dy * 0.5 + h, citZ + 0.08, len + 0.08, 0.1, 0.05, 0x9c6a3e, 0xd09e6a, 0, 0, a);
        }
        onceki = [x, y];
        if (Math.round((x - xa) / 3.2) % 2 === 0 && Math.abs(x) > 3.2 && Math.abs(x - hx) > 3.2) {
          S.ekle(G.sil, x, y + 1.36, citZ + 0.08, 0.036, 0.92, 0.036, 0x7c4c28, 0xaa744a);
          firildakYer.push([x, y + 1.82, citZ + 0.18, ara(1.22, 1.52), ara(2.0, 3.0)]);
        }
      }
      const FY = ctx.yapi();
      for (let j = 0; j < 4; j++) {
        const a = j / 4 * PI * 2 + 0.35, c = YD_FIRILDAK[j];
        FY.ekle(G.koni4, Math.cos(a) * 0.25, Math.sin(a) * 0.25, 0.02, 0.18, 0.46, 0.045, c, karH(c, 0xffffff, 0.32), 0.18, 0, a - PI / 2);
      }
      FY.ekle(G.kureC, 0, 0, 0.05, 0.08, 0.08, 0.055, 0xf6ebd4, 0xffffff);
      const imPin = new T.InstancedMesh(FY.geo(), ctx.malz(true, true, 0.25, { roughness: 0.45 }), Math.max(1, firildakYer.length));
      imPin.frustumCulled = false;

      // 5) Yakın ön laleler (alçak; mor ve star-sarısı hariç)
      for (let i = 0; i < 40; i++) {
        const x = ara(xa + 2, xb - 2), z = ara(1.6, 13.0);
        if (z < 4.5 && (Math.abs(x) < 5.0 || Math.abs(x - hx) < 5.2)) continue;
        lale(x, z, ara(0.65, 1.0), laleRenk[i % laleRenk.length]);
      }

      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0.25, { roughness: 0.78 })));
      ctx.ekle(new T.Mesh(F.geo(), ctx.malz(true, true, 0.3, { roughness: 0.65 })));
      ctx.ekle(new T.Mesh(L.geo(), ctx.malz(false, true, 0, { emissive: 0xffae52, emissiveIntensity: 0.9 })));
      ctx.ekle(imPin);

      ctx.veri.vaneler = vaneler;
      ctx.veri.pin = { im: imPin, yer: firildakYer };
      ctx.veri.o = new T.Object3D();
      this.guncelle(0, 0, ctx);
    },
    guncelle(t, dt, ctx) {
      const v = ctx && ctx.veri;
      if (!v) return;
      if (v.vaneler) {
        for (const item of v.vaneler) {
          item.vane.rotation.z = -t * item.hiz + item.faz;
        }
      }
      if (v.pin && v.o && v.pin.yer.length) {
        const { im, yer } = v.pin, o = v.o;
        for (let i = 0; i < yer.length; i++) {
          const [x, y, z, s, hiz] = yer[i];
          o.position.set(x, y, z);
          o.rotation.set(0, 0, -t * hiz + i * 0.8);
          o.scale.setScalar(s);
          o.updateMatrix();
          im.setMatrixAt(i, o.matrix);
        }
        im.instanceMatrix.needsUpdate = true;
      }
    },
    sok(ctx) { veriTemizle(ctx); }
  };
})();
