/* ortam_g.js - Pırıl'ın Uçuş Okulu: yeni ortamlar (u2-ortam-g)
   39 · Su Altı Krallığı (bölüm 44) · 40 · Oyuncak Diyarı (bölüm 45) · 41 · Gökkuşağı Şelalesi (bölüm 46)
   Kalıp: DY_EK API. Her şey ctx.grup içinde: bölüm değişince dunya.js söker. */
(function () {
  'use strict';
  window.DY_EK = window.DY_EK || {};
  const PI = Math.PI;

  // ── ortak geometriler: bir kez kurulur, sahneye doğrudan eklenmez (yalnız ctx.yapi().ekle ile kopyalanır), dispose edilmez ──
  const OG = {};

  // Dilimli deniz kabuğu (menteşe (0,0,0), öne +z yönünde yelpaze açılır)
  function ogMidye(T) {
    if (OG.midye) return OG.midye;
    const NR = 10, NV = 4, pos = [];
    const pt = (ir, iv, ust) => {
      const u = (ir / NR) * 2 - 1, v = iv / NV, a = u * PI * 0.48;
      const dalga = Math.cos(u * PI * 7);
      const r = (0.1 + v * 0.96) * (1 + 0.055 * v * dalga);
      const kal = 0.044 * (1 - 0.35 * v);
      const y = -0.15 * Math.sin(v * PI) + 0.032 * dalga * v + (ust ? kal : -kal);
      return [Math.sin(a) * r, y, Math.cos(a) * r];
    };
    const ucgen = (a, b, c) => { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); };
    for (let iv = 0; iv < NV; iv++) {
      for (let ir = 0; ir < NR; ir++) {
        const a0 = pt(ir, iv, true), b0 = pt(ir + 1, iv, true), c0 = pt(ir + 1, iv + 1, true), d0 = pt(ir, iv + 1, true);
        ucgen(a0, c0, b0); ucgen(a0, d0, c0);
        const a1 = pt(ir, iv, false), b1 = pt(ir + 1, iv, false), c1 = pt(ir + 1, iv + 1, false), d1 = pt(ir, iv + 1, false);
        ucgen(a1, b1, c1); ucgen(a1, c1, d1);
      }
    }
    for (let ir = 0; ir < NR; ir++) {
      const u0 = pt(ir, NV, true), u1 = pt(ir + 1, NV, true), l0 = pt(ir, NV, false), l1 = pt(ir + 1, NV, false);
      ucgen(u0, l0, l1); ucgen(u0, l1, u1);
      const hu0 = pt(ir, 0, true), hu1 = pt(ir + 1, 0, true), hl0 = pt(ir, 0, false), hl1 = pt(ir + 1, 0, false);
      ucgen(hu0, hl1, hl0); ucgen(hu0, hu1, hl1);
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return (OG.midye = g);
  }

  // Kıvrımlı su altı yosun şeridi (tabanı y=0, ucu y=1, rüzgâr/akıntıyla salınır)
  function ogKelp(T) {
    if (OG.kelp) return OG.kelp;
    const N = 8, pos = [];
    const ucgen = (a, b, c) => { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); };
    const kenar = (i) => {
      const v = i / N, cx = Math.sin(v * PI * 2.4) * 0.14;
      const hw = Math.sin(Math.pow(v, 0.72) * PI) * 0.24 + 0.03 * (1 - v);
      const zr = Math.sin(v * PI * 6.5) * 0.055;
      return [[cx - hw, v, zr], [cx + hw, v, -zr], [cx - hw, v, zr - 0.018], [cx + hw, v, -zr - 0.018]];
    };
    for (let i = 0; i < N; i++) {
      const A = kenar(i), B = kenar(i + 1);
      ucgen(A[0], A[1], B[1]); ucgen(A[0], B[1], B[0]);
      ucgen(A[2], B[3], A[3]); ucgen(A[2], B[2], B[3]);
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return (OG.kelp = g);
  }

  // Dallı geyikboynuzu mercanı (tabanı y=0, tepe y=1)
  function ogMercanDal(T) {
    if (OG.mercanDal) return OG.mercanDal;
    const pos = [];
    const ucgen = (a, b, c) => { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); };
    const dal = (pts, r0, r1) => {
      const crv = new T.CatmullRomCurve3(pts.map((p) => new T.Vector3(p[0], p[1], p[2])));
      const tg = new T.TubeGeometry(crv, 5, 1, 5, false), p = tg.attributes.position, mc = new T.Vector3();
      for (let i = 0; i < p.count; i++) {
        const j = Math.floor(i / 6), u = j / 5;
        crv.getPointAt(u, mc);
        const r = r0 + (r1 - r0) * u;
        p.setXYZ(i, mc.x + (p.getX(i) - mc.x) * r, mc.y + (p.getY(i) - mc.y) * r, mc.z + (p.getZ(i) - mc.z) * r);
      }
      const ni = tg.index ? tg.toNonIndexed() : tg, np = ni.attributes.position;
      for (let i = 0; i < np.count; i++) pos.push(np.getX(i), np.getY(i), np.getZ(i));
      const tip = pts[pts.length - 1];
      for (let k = 0; k < 5; k++) {
        const a0 = (k / 5) * PI * 2, a1 = ((k + 1) / 5) * PI * 2;
        ucgen([tip[0], tip[1] + r1 * 0.9, tip[2]], [tip[0] + Math.cos(a0) * r1, tip[1], tip[2] + Math.sin(a0) * r1], [tip[0] + Math.cos(a1) * r1, tip[1], tip[2] + Math.sin(a1) * r1]);
      }
      if (ni !== tg) ni.dispose();
      tg.dispose();
    };
    dal([[0, 0, 0], [-0.05, 0.38, 0.02], [-0.14, 0.72, 0.04], [-0.2, 0.98, 0.02]], 0.14, 0.07);
    dal([[-0.02, 0.3, 0], [0.16, 0.55, 0.03], [0.34, 0.86, 0.05]], 0.1, 0.058);
    dal([[-0.1, 0.54, 0.02], [-0.32, 0.72, -0.05], [-0.46, 0.88, -0.06]], 0.085, 0.05);
    dal([[0.12, 0.48, 0.02], [0.1, 0.74, -0.1], [0.06, 0.94, -0.14]], 0.08, 0.048);
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return (OG.mercanDal = g);
  }

  // Yelpaze mercanı (tabanı y=0, genişlik ~1.3, yükseklik 1.0)
  function ogYelkenMercan(T) {
    if (OG.yelkenMercan) return OG.yelkenMercan;
    const pos = [];
    const ekle = (sx, sy, sz, rz, tx, ty, tz) => {
      const cg = new T.CylinderGeometry(0.85, 0.45, 1, 5, 1, false);
      cg.scale(sx, sy, sz); cg.rotateZ(rz); cg.translate(tx, ty, tz);
      const ni = cg.toNonIndexed(), np = ni.attributes.position;
      for (let i = 0; i < np.count; i++) pos.push(np.getX(i), np.getY(i), np.getZ(i));
      ni.dispose(); cg.dispose();
    };
    ekle(0.11, 0.28, 0.08, 0, 0, 0.14, 0);
    for (let k = -2; k <= 2; k++) {
      const a = k * 0.34, len = 0.74 - Math.abs(k) * 0.08;
      ekle(0.19, len, 0.042, -a, Math.sin(a) * len * 0.48, 0.2 + Math.cos(a) * len * 0.48, (k % 2) * 0.015);
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return (OG.yelkenMercan = g);
  }

  // Ahşap oyuncak / taş kemer bloğu: x in [-1, 1], y in [0, 1], z in [-0.35, 0.35]
  function ogKemer(T) {
    if (OG.kemer) return OG.kemer;
    const N = 10, D = 0.35, R0 = 0.56, R1 = 1.0, HY = 0.34, pos = [];
    const ucgen = (a, b, c) => { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); };
    const quad = (a, b, c, d) => { ucgen(a, b, c); ucgen(a, c, d); };
    const oy = HY, ry = 1.0 - HY;
    for (let i = 0; i < N; i++) {
      const t0 = PI * (1 - i / N), t1 = PI * (1 - (i + 1) / N);
      const c0 = Math.cos(t0), s0 = Math.sin(t0), c1 = Math.cos(t1), s1 = Math.sin(t1);
      const i0 = [c0 * R0, oy + s0 * ry * R0], i1 = [c1 * R0, oy + s1 * ry * R0];
      const o0 = [c0 * R1, oy + s0 * ry * R1], o1 = [c1 * R1, oy + s1 * ry * R1];
      quad([i0[0], i0[1], D], [o0[0], o0[1], D], [o1[0], o1[1], D], [i1[0], i1[1], D]);
      quad([i1[0], i1[1], -D], [o1[0], o1[1], -D], [o0[0], o0[1], -D], [i0[0], i0[1], -D]);
      quad([o0[0], o0[1], D], [o0[0], o0[1], -D], [o1[0], o1[1], -D], [o1[0], o1[1], D]);
      quad([i1[0], i1[1], D], [i1[0], i1[1], -D], [i0[0], i0[1], -D], [i0[0], i0[1], D]);
    }
    for (const q of [-1, 1]) {
      const xA = q < 0 ? -R1 : R0, xB = q < 0 ? -R0 : R1;
      quad([xA, 0, D], [xB, 0, D], [xB, oy, D], [xA, oy, D]);
      quad([xB, 0, -D], [xA, 0, -D], [xA, oy, -D], [xB, oy, -D]);
      quad([xA, 0, -D], [xA, 0, D], [xA, oy, D], [xA, oy, -D]);
      quad([xB, 0, D], [xB, 0, -D], [xB, oy, -D], [xB, oy, D]);
      quad([xA, 0, -D], [xB, 0, -D], [xB, 0, D], [xA, 0, D]);
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return (OG.kemer = g);
  }

  // Üçgen çatı prizması (1×1×1 kutu sınırında, sırtı +y boyunca, ekseni z)
  function ogPrizma(T) {
    if (OG.prizma) return OG.prizma;
    const pos = [];
    const ucgen = (a, b, c) => { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); };
    const quad = (a, b, c, d) => { ucgen(a, b, c); ucgen(a, c, d); };
    const L = [-0.5, -0.5, 0.5], R = [0.5, -0.5, 0.5], U = [0, 0.5, 0.5];
    const Lb = [-0.5, -0.5, -0.5], Rb = [0.5, -0.5, -0.5], Ub = [0, 0.5, -0.5];
    ucgen(L, R, U); ucgen(Rb, Lb, Ub);
    quad(R, Rb, Ub, U); quad(Lb, L, U, Ub); quad(Lb, Rb, R, L);
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return (OG.prizma = g);
  }

  // Tombul ahşap oyuncak halkası (yatay, yarıçap ~1, kalınlık ~0.5)
  function ogHalka(T) {
    if (OG.halka) return OG.halka;
    const g = new T.TorusGeometry(0.72, 0.28, 8, 18);
    g.rotateX(PI / 2);
    g.scale(1, 0.72, 1);
    return (OG.halka = g);
  }

  function temizSok(ctx) {
    if (!ctx || !ctx.veri) return;
    for (const k in ctx.veri) delete ctx.veri[k];
  }

  // Zıplatan yardımcı tabanında ışıltılı halka + tepede yukarı akan oklar
  function zipIsaretKur(ctx, okY, haleRenk) {
    const { T, G } = ctx, I = ctx.yapi();
    I.ekle(G.halka, 0, 0.1, 0, 2.05, 2.05, 0.65, haleRenk[0], haleRenk[1], PI / 2, 0, 0);
    const im = new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.78, depthWrite: false });
    const hale = new T.Mesh(I.geo(), im);
    const O = ctx.yapi();
    for (const h of [0, 0.54]) for (const q of [-1, 1]) O.ekle(G.kutu, q * 0.24, h, 0, 0.6, 0.15, 0.08, 0xffffff, 0xe8ffff, 0, 0, -q * 0.7);
    const om = new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false });
    const oklar = new T.Mesh(O.geo(), om);
    oklar.position.set(0, okY, 0.6);
    return { hale, im, oklar, om, okY };
  }

  function zipAnim(v, t) {
    if (!v.zip) return;
    for (const z of v.zip) {
      const b = Math.abs(Math.sin(t * 2.5 + z.f));
      z.govde.position.y = b * 0.18;
      z.govde.scale.set(1 + (1 - b) * 0.04, 1 - (1 - b) * 0.05, 1 + (1 - b) * 0.04);
      const u = (t * 0.9 + z.f) % 1;
      z.oklar.position.y = z.okY + u * 0.88 + b * 0.18;
      z.om.opacity = Math.sin(u * PI) * 0.94;
      z.im.opacity = 0.45 + 0.3 * Math.sin(t * 3 + z.f);
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // 39 · SU ALTI KRALLIĞI (Bölüm 44) — güneşli turkuaz mercan resifi
  // (arka planda mor ve yıldız sarısı yok: Pırıl ve yıldızlar parlak seçilir)
  // ════════════════════════════════════════════════════════════════════
  DY_EK[39] = {
    palet: {
      ad: 'Su Altı Krallığı', gece: 0,
      sisRenk: 0x6cded8, sisYogun: 0.0044, arka: 0x62d6d2,
      gok: [0x9cf4ec, 0x65e2dc, 0x35c6d4, 0x1a9ec2, 0x0c7aa8], gunesPos: [44, 34], gunesRenk: 0xe6fff8,
      ykUst: 0xcffff8, ykAlt: 0x4ca89c, ykGuc: 1.24, gnRenk: 0xe8fff6, gnGuc: 2.15, arkaRenk: 0x5ae2d8, arkaGuc: 0.6,
      dag: [[0x34a8b4, 0x74e0da], [0x2892a2, 0x62d2d0], [0x1e7c8e, 0x4ec0c4]],
      tepe: [0x4cb8a8, 0xa4e2ce, 0x3ea29a, 0x86d4c8],
      agac: [[0x1e8e7a, 0x5cd8b8], [0x2a9e86, 0x70e4c4], [0xff7a70, 0xffbeb4]],
      zemin: [0xf2dec2, 0xd4bd9c, 0xa2dcd2], cimen: [0x229480, 0x5ed8b4, 0x42bea0],
      cicek: [[0xff7a70, 0xffbeb4], [0xff9a78, 0xffd4c2], [0x48d8c8, 0xb0faf0], [0xffffff, 0xe8fffc]],
      sisSerit: [0x92ece6, 0x5ed2d0], siluet: [0x0e4652, 0x1a6872]
    },
    secenek: {
      agacYok: true, caliYok: true, tepeCicekYok: true, mantarSusYok: true,
      bulutYok: true, kusYok: true, cicekYok: true, cimenYok: true,
      citYok: true, kulubeYok: true, degirmenYok: true, onSiluetYok: true,
      gunesGuc: 0.7, zeminDesen: 'kum', zeminParlak: 0.04, dagYukseklik: 0.9,
      ucusanTur: 'isilti', ucusanRenk: [0xb4fff8, 0xffffff, 0xffc6bc, 0x7be8f4],
      piknikTur: 'piknik', piknikRenk: [0xff8a7a, 0xfff4ea],
      bayrakRenk: [0xff7a70, 0x48d8c8, 0xffa888, 0xffffff, 0x58c4e8],
      salincak: {
        govde: [0x289296, 0x72e0d4],
        sarmasik: [0x1c9674, 0x62e2a8],
        cicek: [[0xff7a70, 0xffbeb4], [0xff9eb8, 0xffe0ee], [0x58dcd4, 0xb8faf4]],
        tacYok: true, kusYok: true, tacIsik: 0x104a54
      }
    },
    yardimci: {
      mantar: { sapka: [0xe85a82, 0xffb4c8], govde: [0xfff0f4, 0xffffff], benek: 0xffffff },
      bulut: { alt: 0xffc4bc, ust: 0xffffff, yanak: 0xff6a78, emissive: 0x583840 },
      nilufer: { yaprak: [0x26967a, 0x6ae0b8], cicek: [0xff7a70, 0xffd0c8], halka: 0xd8fffc },
      ruzgar: { renk: [0x6ae8f0, 0xffffff], emissive: 0x1a8aa0, ok: 0xffffff },
      halka: { renk: [0xff7a70, 0xffd8c8], emissive: 0xc04038, cicek: [[0xff8a7a, 0xffd0c8], [0x58e0d0, 0xc0fff8], [0xffffff, 0xe8fffc]] },
      baloncuk: { renk: 0xe8ffff, kenar: 0xffffff, cizgi: 0x0e6a8c, opaklik: 1.25 },
      esinti: { tur: 'isik', renk: 0xd8fffc, taneRenk: [0xffffff, 0xffc0b8, 0x80f4ec] }
    },
    yardimciKur: {
      // Salıncak kemeri: deniz kabukları, sallanan yosunlar ve mercan süsleri
      salincak(ctx, o) {
        const { T, G } = ctx, MD = ogMidye(T), KP = ogKelp(T), YM = ogYelkenMercan(T);
        const { S, A, FL, sapanX, z } = o;
        for (const q of [-1, 1]) {
          const x = q * sapanX, bx = q * (sapanX + 0.92);
          // Direk tepesinde inci yuvalı sedef-pembe deniz kabuğu
          S.ekle(MD, x, 4.92, z - 0.12, 0.72, 0.72, 0.72, 0xe85a82, 0xffb8cc, -0.45, q * 0.25, 0);
          S.ekle(MD, x, 4.95, z - 0.16, 0.68, 0.68, 0.68, 0xffb8cc, 0xfff6f8, -1.25, q * 0.25, 0);
          FL.ekle(G.kureK, x, 5.18, z + 0.12, 0.24, 0.24, 0.24, 0xffeef4, 0xffffff);
          // Direklerin dibinde deniz kabukları, mercanlar ve sallanan uzun yosun şeritleri
          S.ekle(MD, bx, 0.26, z + 0.35, 0.56, 0.56, 0.56, 0xf27a6e, 0xffd4c8, -0.35, -q * 0.4, 0);
          S.ekle(YM, bx + q * 0.52, 0.08, z + 0.1, 0.68, 0.9, 0.68, 0x26b498, 0x80f0d8, 0, q * 0.3, -q * 0.15, 0.15);
          for (let k = 0; k < 4; k++) {
            const kx = bx + q * (0.2 + k * 0.22), kh = 2.6 + (k % 2) * 1.1;
            A.ekle(KP, kx, 0.05, z - 0.38 - (k % 2) * 0.25, 0.78, kh, 0.78, 0x168068, 0x5ce0b0, 0, k * 0.8, q * 0.06, 0.45);
          }
          // Kemerin üst yanlarında sallanan yosun püskülleri ve yelpaze mercanlar
          A.ekle(YM, x + q * 0.55, 5.2, z - 0.32, 0.74, 0.98, 0.74, 0xff7068, 0xffbeb8, 0, 0, -q * 0.4, 0.22);
          A.ekle(KP, x - q * 0.45, 5.25, z - 0.35, 0.55, 1.45, 0.55, 0x1c9678, 0x6ae8b8, 0, q * 0.5, q * 0.2, 0.35);
        }
        // Kemerin tam tepesinde çift deniz kabuğu tacı + parlak inci
        A.ekle(MD, 0, 6.18, z - 0.1, 0.62, 0.62, 0.62, 0x3ac8c0, 0xb8faf4, -0.75, 0, 0, 0.08);
        FL.ekle(G.kureK, 0, 6.32, z + 0.1, 0.18, 0.18, 0.18, 0xffeef6, 0xffffff);
      },

      // Zıplatan yardımcı: gülümseyen pembe inci istiridyesi (tabanı y=0, üstü ~2.35)
      mantar(M, i, ctx) {
        const { T, G } = ctx, S = ctx.yapi(), MD = ogMidye(T);
        const kabukTon = i % 2 ? [0xe0527c, 0xffacc4] : [0xee6472, 0xffb8be];
        // Tabanda mercan-kum yastığı
        S.ekle(G.kureU, 0, 0.2, 0, 1.55, 0.32, 1.25, 0x269682, 0x66d8be);
        S.ekle(G.kureK, -1.15, 0.36, 0.35, 0.26, 0.22, 0.24, 0xff7a70, 0xffc0b4);
        S.ekle(G.kureK, 1.18, 0.34, 0.3, 0.24, 0.2, 0.22, 0x48d8c8, 0xb0faf0);
        // Alt kabuk (taban çanağı) ve ön kenarda tombul gülen yüz bandı
        S.ekle(MD, 0, 0.56, -0.82, 1.88, 1.65, 1.65, kabukTon[0], kabukTon[1], 0.14, 0, 0);
        S.ekle(MD, 0, 0.63, -0.78, 1.68, 1.35, 1.48, 0xffdce8, 0xffffff, 0.14, 0, 0);
        S.ekle(G.kureO, 0, 0.72, 0.96, 1.05, 0.34, 0.42, kabukTon[0], kabukTon[1]);
        // Yukarı açılan üst dilimli kabuk
        S.ekle(MD, 0, 0.82, -0.85, 1.85, 1.75, 1.68, kabukTon[0], kabukTon[1], -0.92, 0, 0);
        S.ekle(MD, 0, 0.82, -0.8, 1.65, 1.5, 1.48, 0xffc8da, 0xffeef4, -0.92, 0, 0);
        // Ortada zıplatan dev ışıldayan inci yastığı
        S.ekle(G.kure, 0, 1.45, 0.08, 1.18, 0.92, 1.06, 0xffe6f0, 0xffffff);
        S.ekle(G.kureK, -0.35, 1.86, 0.65, 0.22, 0.15, 0.12, 0xffffff, 0xffffff);
        // Alt kenarda sevimli yanaklar ve gülümseme
        for (const q of [-1, 1]) S.ekle(G.kureK, q * 0.56, 0.68, 1.34, 0.16, 0.1, 0.05, 0xff5a7a, 0xff8aa4);
        S.ekle(G.torusSap, 0, 0.64, 1.4, 0.62, 0.62, 0.45, 0x4a1828, 0x5e2234, 0, 0, PI);

        const govde = new T.Mesh(S.geo(), ctx.malz(true, true, 0.2, { roughness: 0.34, emissive: 0x521830, emissiveIntensity: 0.28 }));
        const E = ctx.yapi();
        for (const q of [-1, 1]) {
          E.ekle(G.kureK, q * 0.28, 0, 0, 0.1, 0.14, 0.05, 0x241428, 0x241428);
          E.ekle(G.kureK, q * 0.28 + 0.03, 0.05, 0.04, 0.035, 0.045, 0.02, 0xffffff, 0xffffff);
        }
        const goz = new T.Mesh(E.geo(), ctx.malz(false, true, 0, { roughness: 0.35 }));
        goz.position.set(0, 0.88, 1.38);
        govde.add(goz);

        const zp = zipIsaretKur(ctx, 3.15, [0xffb8cc, 0xffffff]);
        const mesh = new T.Group();
        mesh.add(govde); mesh.add(zp.hale); mesh.add(zp.oklar);
        (ctx.veri.zip = ctx.veri.zip || []).push({ govde, oklar: zp.oklar, om: zp.om, im: zp.im, okY: zp.okY, f: i * 1.3 });
        return { mesh, goz };
      }
    },

    kur(ctx) {
      const { T, G, hx, yerY, R, ara } = ctx;
      const S = ctx.yapi(), K = ctx.yapi(), F = ctx.yapi();
      const MD = ogMidye(T), KP = ogKelp(T), MC = ogMercanDal(T), YM = ogYelkenMercan(T), KM = ogKemer(T);
      const xa = -38, xb = hx + 46;
      const mRenk = [[0xe84848, 0xff8c7e], [0xf27c4a, 0xffc098], [0x24b898, 0x7ef0d6], [0xe05884, 0xffa8c2]];
      const yasak = (x, z, pay) => z > -2.5 && (Math.abs(x) < (pay || 5.0) || Math.abs(x - hx) < (pay || 5.0));

      // 1) Batık mermer tapınak kemerleri ve antik sütunlar (z -14 .. -26)
      const kemerYapi = (x, z, k, cift) => {
        const y = yerY(x, z) - 0.15;
        const t1 = 0xb8b4a8, t2 = 0xfaf6ee;
        S.ekle(G.kutu, x, y + 0.35 * k, z, (cift ? 7.6 : 5.4) * k, 0.7 * k, 2.4 * k, 0x8ea8a0, 0xdceae4);
        const xs = cift ? [-2.7, 0, 2.7] : [-1.8, 1.8];
        for (const qx of xs) {
          S.ekle(G.sil, x + qx * k, y + 2.4 * k, z, 0.44 * k, 3.6 * k, 0.44 * k, t1, t2);
          S.ekle(G.kutu, x + qx * k, y + 4.32 * k, z, 1.08 * k, 0.3 * k, 1.08 * k, t1, t2);
        }
        if (cift) {
          S.ekle(KM, x - 1.35 * k, y + 4.46 * k, z, 1.65 * k, 1.9 * k, 1.45 * k, t1, t2);
          S.ekle(KM, x + 1.35 * k, y + 4.46 * k, z, 1.65 * k, 1.9 * k, 1.45 * k, t1, t2);
        } else {
          S.ekle(KM, x, y + 4.46 * k, z, 2.25 * k, 2.25 * k, 1.55 * k, t1, t2);
        }
        K.ekle(KP, x - 1.7 * k, y + 4.4 * k, z + 0.5 * k, 0.9 * k, 2.5 * k, 0.9 * k, 0x16806c, 0x62e2b4, 0, 0.4, 0.25, 0.4);
        K.ekle(KP, x + 1.5 * k, y + 4.4 * k, z - 0.4 * k, 0.8 * k, 2.1 * k, 0.8 * k, 0x1c9478, 0x70ecbe, 0, -0.3, -0.2, 0.35);
        const mc = mRenk[Math.floor(R() * mRenk.length)];
        S.ekle(YM, x + 2.1 * k, y + 0.68 * k, z + 0.7 * k, 1.15 * k, 1.55 * k, 1.0 * k, mc[0], mc[1]);
        S.ekle(MD, x - 2.0 * k, y + 0.75 * k, z + 0.7 * k, 0.65 * k, 0.65 * k, 0.65 * k, 0xf27a70, 0xffd0c8, -0.4, 0.3, 0);
      };
      kemerYapi(-18, -20, 1.3, false);
      kemerYapi(hx * 0.28, -21, 1.4, true);
      kemerYapi(hx * 0.68, -23, 1.35, false);
      kemerYapi(hx + 16, -20, 1.35, true);

      // 2) Katmanlı resif kaya çıkıntıları + gür renkli mercan buketleri & boru süngerleri (z -4.5 .. -24)
      const resifKume = (x, z, k) => {
        const y = yerY(x, z) - 0.15;
        // Düz yastıklar yerine yassı kayalık katmanlar
        S.ekle(G.kule, x, y + 0.45 * k, z, 1.65 * k, 0.95 * k, 1.15 * k, 0x5c8e88, 0x9ec8be);
        S.ekle(G.kule, x + 0.85 * k, y + 0.3 * k, z + 0.35 * k, 1.1 * k, 0.62 * k, 0.85 * k, 0x8a9284, 0xcac6b4);
        S.ekle(G.kureU, x - 0.8 * k, y + 0.25 * k, z + 0.25 * k, 1.05 * k, 0.42 * k, 0.85 * k, 0x5c8e88, 0xa2cec4);

        const cA = mRenk[Math.floor(R() * mRenk.length)];
        const cB = mRenk[(Math.floor(R() * mRenk.length) + 1) % mRenk.length];
        const cC = mRenk[(Math.floor(R() * mRenk.length) + 2) % mRenk.length];
        // Gür geyikboynuzu mercanı + yelpaze mercan
        S.ekle(MC, x - 0.25 * k, y + 0.86 * k, z, 1.95 * k, 2.45 * k, 1.85 * k, cA[0], cA[1], 0, R() * PI, ara(-0.14, 0.14));
        S.ekle(YM, x + 0.78 * k, y + 0.56 * k, z + 0.3 * k, 1.55 * k, 1.95 * k, 1.45 * k, cB[0], cB[1], 0, ara(-0.4, 0.4), ara(-0.2, 0.2));
        // Boru süngeri kümesi (organ-pipe corals)
        for (let b = 0; b < 3; b++) {
          const bx = x - 0.85 * k + b * 0.28 * k, bh = (0.75 + (b % 2) * 0.45) * k;
          S.ekle(G.sil, bx, y + 0.42 * k + bh * 0.5, z + 0.32 * k, 0.14 * k, bh, 0.14 * k, cC[0], cC[1], 0, 0, (b - 1) * 0.14);
          F.ekle(G.kureK, bx, y + 0.42 * k + bh, z + 0.32 * k, 0.14 * k, 0.08 * k, 0.14 * k, cC[1], 0xffffff);
        }
      };
      for (let x = xa + 2; x < xb; x += ara(7.5, 11.5)) {
        const z = ara(-13, -22);
        resifKume(x + ara(-1.5, 1.5), z, ara(0.95, 1.45));
      }
      for (let x = xa + 4; x < xb; x += ara(6.0, 9.5)) {
        const z = ara(-4.8, -10.0);
        if (yasak(x, z, 5.0)) continue;
        const y = yerY(x, z) - 0.08, k = ara(0.75, 1.15), c = mRenk[Math.floor(R() * mRenk.length)];
        S.ekle(G.kule, x, y + 0.22 * k, z, 0.75 * k, 0.44 * k, 0.58 * k, 0x6c968e, 0xb6d6cc);
        if (R() < 0.5) S.ekle(MC, x, y + 0.4 * k, z, 1.35 * k, 1.85 * k, 1.35 * k, c[0], c[1], 0, R() * PI, 0);
        else S.ekle(YM, x, y + 0.4 * k, z, 1.25 * k, 1.6 * k, 1.25 * k, c[0], c[1], 0, ara(-0.4, 0.4), 0);
      }

      // 3) Öbek öbek salınan yosun (kelp) koruları (z -7 .. -24, arka plan ağırlıklı)
      const kelpKume = (x, z, adet, hA, hB) => {
        const y = yerY(x, z) - 0.06;
        S.ekle(G.kureU, x, y + 0.12, z, 0.85, 0.28, 0.65, 0x4a8c84, 0x8cc8bc);
        for (let i = 0; i < adet; i++) {
          const kx = x + ara(-0.9, 0.9), kz = z + ara(-0.6, 0.6), kh = ara(hA, hB);
          const yesil = i % 2 ? [0x127864, 0x56d8a8] : [0x1c8c78, 0x6ae8be];
          K.ekle(KP, kx, y, kz, ara(0.9, 1.35), kh, ara(0.9, 1.35), yesil[0], yesil[1], 0, R() * PI, ara(-0.12, 0.12), 0.35 + kh * 0.06);
        }
      };
      for (let x = xa; x < xb; x += ara(8, 12)) kelpKume(x, ara(-14, -24), 5, 4.8, 9.2);
      for (let x = xa + 4; x < xb; x += ara(10, 15)) {
        const z = ara(-7.2, -11.2);
        if (!yasak(x, z, 5.2)) kelpKume(x, z, 4, 2.8, 5.2);
      }
      // Uzak resif silueti (z -30 .. -40): doğal kayalık çıkıntılar ve büyük mercan dalları
      for (let x = xa - 12; x < xb + 14; x += ara(9, 14)) {
        const z = ara(-30, -40), y = yerY(x, z) - 0.3, k = ara(1.4, 2.2), c = mRenk[Math.floor(R() * mRenk.length)];
        S.nc = [x, y + k * 0.8, z];
        S.ekle(G.kureU, x, y + k * 0.7, z, 2.4 * k, 1.4 * k, 1.4 * k, 0x2a8686, 0x64cac0);
        S.ekle(G.kureU, x + 1.3 * k, y + k * 0.5, z + 0.3, 1.6 * k, 1.0 * k, 1.1 * k, 0x267c7e, 0x58beb4);
        S.ekle(G.kureU, x - 1.2 * k, y + k * 0.45, z + 0.2, 1.4 * k, 0.9 * k, 1.0 * k, 0x267c7e, 0x58beb4);
        S.nc = null;
        S.ekle(MC, x + ara(-0.8, 0.8), y + k * 1.6, z + 0.3, 1.8 * k, 2.4 * k, 1.5 * k, c[0], c[1], 0, R() * 2, 0);
        S.ekle(YM, x + 1.2 * k, y + k * 1.1, z + 0.5, 1.3 * k, 1.7 * k, 1.1 * k, mRenk[(Math.floor(R() * 4) + 1) % 4][0], c[1]);
      }

      // 4) Ön kum tabanı: deniz kabukları ve mercan çakılları (yıldız biçimli olmayan süsler)
      for (let x = xa + 2; x < xb; x += ara(2.6, 4.4)) {
        const z = ara(2.2, 14.5);
        if (z < 4.8 && (Math.abs(x) < 4.8 || Math.abs(x - hx) < 4.8)) continue;
        const y = yerY(x, z);
        if (R() < 0.45) {
          const sc = ara(0.24, 0.42), mc = R() < 0.5 ? [0xff8a80, 0xffdcd4] : [0x5cd8ce, 0xd8fffc];
          S.ekle(MD, x, y + 0.08, z - 0.15, sc, sc, sc, mc[0], mc[1], -0.2, R() * PI, 0);
        } else {
          S.ekle(G.kureU, x, y + 0.05, z, ara(0.22, 0.42), ara(0.1, 0.18), ara(0.18, 0.34), 0x8ab8ae, 0xd0eee6, 0, R() * 3, 0);
        }
      }
      // En ön çerçeve (dikey iPad alt kenarı, z 17..20.5)
      for (let x = xa - 6; x < xb + 6; x += ara(2.8, 4.2)) {
        const z = ara(17, 20.5), y = yerY(x, z), k = ara(0.8, 1.25), mc = mRenk[Math.floor(R() * mRenk.length)];
        S.ekle(G.kureU, x, y + 0.2 * k, z, 0.9 * k, 0.42 * k, 0.7 * k, 0x3b8682, 0x80cec4);
        if (R() < 0.55) K.ekle(KP, x + ara(-0.4, 0.4), y + 0.25 * k, z, 0.58 * k, 1.4 * k, 0.58 * k, 0x168068, 0x62e2b4, 0, R() * 2, 0, 0.25);
        else S.ekle(YM, x, y + 0.25 * k, z, 0.72 * k, 0.95 * k, 0.72 * k, mc[0], mc[1]);
      }

      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0.12, { roughness: 0.74, emissive: 0x0c3c44, emissiveIntensity: 0.18 })));
      ctx.ekle(new T.Mesh(K.geo(), ctx.malz(true, true, 0.16, { roughness: 0.58, emissive: 0x0a4842, emissiveIntensity: 0.22 })));
      ctx.ekle(new T.Mesh(F.geo(), ctx.malz(false, true, 0, { emissive: 0xff9890, emissiveIntensity: 0.45 })));

      // 5) Üst su yüzeyinden süzülen eğik güneş huzmeleri + su yüzeyi parıltısı (ShaderMaterial, depthWrite: false)
      {
        const pos = [], uv = [], faz = [];
        const addQuad = (x0, y0, x1, y1, w0, w1, z, f) => {
          pos.push(x0 - w0, y0, z, x0 + w0, y0, z, x1 + w1, y1, z, x0 - w0, y0, z, x1 + w1, y1, z, x1 - w1, y1, z);
          uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
          for (let k = 0; k < 6; k++) faz.push(f);
        };
        for (let i = 0; i < 9; i++) {
          const x = xa + 6 + i * (xb - xa - 12) / 8 + ara(-2, 2);
          const z = ara(-44, -18), wTop = ara(1.6, 2.8), wBot = wTop * 2.5;
          addQuad(x - 6.0, -1, x + 5.5, 50, wBot, wTop, z, i * 0.95);
        }
        const g = new T.BufferGeometry();
        g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
        g.setAttribute('aFaz', new T.Float32BufferAttribute(faz, 1));
        const m = new T.ShaderMaterial({
          transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false, side: T.DoubleSide,
          uniforms: { uT: ctx.U.uT },
          vertexShader: 'attribute float aFaz; varying vec2 vU; varying float vF; void main(){ vU = uv; vF = aFaz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: 'varying vec2 vU; varying float vF; uniform float uT; void main(){' +
            ' float kn = smoothstep(0.0, 0.42, vU.x) * smoothstep(1.0, 0.58, vU.x);' +
            ' float dik = smoothstep(0.0, 0.48, vU.y) * smoothstep(1.0, 0.85, vU.y);' +
            ' float dal = 0.62 + 0.38 * sin(vU.x * 10.0 + uT * 0.55 + vF + sin(vU.y * 5.0 - uT * 0.35) * 0.8);' +
            ' vec3 c = mix(vec3(0.24, 0.88, 0.88), vec3(0.84, 1.0, 0.98), vU.y);' +
            ' gl_FragColor = vec4(c * kn * dik * dal * 0.15, 1.0); }'
        });
        const huz = new T.Mesh(g, m);
        huz.renderOrder = 2; huz.frustumCulled = false;
        ctx.ekle(huz);
      }

      // 6) Yükselen yarı saydam baloncuk akımları (tek InstancedMesh)
      {
        const BG = ctx.yapi();
        BG.ekle(G.kureU, 0, 0, 0, 1, 1, 1, 0xb8f8ff, 0xffffff);
        BG.ekle(G.kureC, -0.34, 0.38, 0.72, 0.26, 0.22, 0.14, 0xffffff, 0xffffff);
        const bm = new T.MeshStandardMaterial({
          vertexColors: true, transparent: true, opacity: 0.62, depthWrite: false,
          roughness: 0.1, metalness: 0.05, emissive: 0x70ecff, emissiveIntensity: 0.42
        });
        const NB = 56, bim = new T.InstancedMesh(BG.geo(), bm, NB);
        bim.frustumCulled = false; bim.renderOrder = 3;
        ctx.ekle(bim);
        const bacalar = [];
        for (let i = 0; i < 12; i++) {
          bacalar.push([xa + 12 + i * (xb - xa - 24) / 11 + ara(-2, 2), ara(-4.5, -16), ara(0.11, 0.22)]);
        }
        const bListe = [];
        for (let i = 0; i < NB; i++) {
          const bc = bacalar[i % bacalar.length];
          bListe.push({ x: bc[0] + ara(-0.4, 0.4), z: bc[1] + ara(-0.3, 0.3), r: bc[2] * ara(0.7, 1.35), faz: R(), hiz: ara(0.12, 0.22) });
        }
        ctx.veri.balon = { im: bim, L: bListe };
      }

      // 7) Turuncu-beyaz çizgili sevimli palyaço balığı sürüleri (z -6 .. -20, tek InstancedMesh)
      {
        const BK = ctx.yapi();
        BK.ekle(G.kureU, 0, 0, 0, 0.44, 0.26, 0.17, 0xe84810, 0xff7e28);
        for (const [sx, ry, rz] of [[0.14, 0.24, 0.165], [-0.06, 0.255, 0.172], [-0.25, 0.2, 0.14]]) {
          BK.ekle(G.silA, sx, 0, 0, 0.055, ry * 2.02, rz * 2.02, 0x201418, 0x201418, 0, 0, PI / 2);
          BK.ekle(G.silA, sx, 0, 0, 0.036, ry * 2.06, rz * 2.06, 0xf2f8ff, 0xffffff, 0, 0, PI / 2);
        }
        BK.ekle(G.koni, -0.46, 0, 0, 0.2, 0.28, 0.06, 0xe84810, 0xff9448, 0, 0, -PI / 2);
        BK.ekle(G.kureK, -0.04, 0.24, 0, 0.18, 0.12, 0.04, 0xe84810, 0xff9448, 0, 0, 0.25);
        for (const qz of [-1, 1]) {
          BK.ekle(G.kureK, 0.05, -0.06, qz * 0.16, 0.11, 0.06, 0.08, 0xff8030, 0xffffff, 0, -qz * 0.4, -0.2);
          BK.ekle(G.kureC, 0.27, 0.05, qz * 0.11, 0.045, 0.05, 0.03, 0x161018, 0x161018);
          BK.ekle(G.kureC, 0.28, 0.065, qz * 0.125, 0.018, 0.02, 0.015, 0xffffff, 0xffffff);
        }
        const fm = ctx.malz(true, true, 0.15, { roughness: 0.42, emissive: 0x481a08, emissiveIntensity: 0.24 });
        const NF = 24, fim = new T.InstancedMesh(BK.geo(), fm, NF);
        fim.frustumCulled = false;
        ctx.ekle(fim);
        const suru = [];
        const okul = [
          { yon: 1, x0: 44, z: -7.5, y: 5.4, hiz: 1.85, n: 5 },
          { yon: -1, x0: 82, z: -11.5, y: 8.8, hiz: 1.55, n: 5 },
          { yon: 1, x0: 64, z: -15.5, y: 12.2, hiz: 1.35, n: 5 },
          { yon: -1, x0: 26, z: -18.8, y: 6.8, hiz: 1.65, n: 5 },
          { yon: 1, x0: 96, z: -9.5, y: 14.8, hiz: 1.4, n: 4 }
        ];
        let fi = 0;
        for (const ok of okul) {
          for (let j = 0; j < ok.n && fi < NF; j++) {
            suru.push({
              yon: ok.yon,
              x0: ok.x0 + j * 1.45 + ara(-0.3, 0.3),
              y0: ok.y + ara(-0.9, 0.9),
              z: ok.z + ara(-0.8, 0.8),
              hiz: ok.hiz + ara(-0.1, 0.1),
              s: ara(0.82, 1.18),
              faz: fi * 0.9
            });
            fi++;
          }
        }
        ctx.veri.balik = { im: fim, L: suru, o: new T.Object3D(), xMin: xa - 4, xMax: xb + 4 };
      }

      ctx.veri.o = ctx.veri.o || new T.Object3D();
      DY_EK[39].guncelle(0, 0, ctx);
    },

    guncelle(t, dt, ctx) {
      const v = ctx.veri;
      zipAnim(v, t);
      const o = v.o;
      if (v.balon && o) {
        const { im, L } = v.balon;
        for (let i = 0; i < L.length; i++) {
          const b = L[i], u = (t * b.hiz + b.faz) % 1;
          const y = 0.6 + u * 26.0, x = b.x + Math.sin(t * 2.0 + i * 1.3) * (0.18 + u * 0.45);
          const sc = b.r * Math.min(1, u * 8) * (1 - Math.pow(u, 6));
          o.position.set(x, y, b.z + Math.cos(t * 1.7 + i) * 0.18);
          o.rotation.set(0, 0, 0);
          o.scale.set(sc * (1 + 0.08 * Math.sin(t * 5 + i)), sc * (1 - 0.08 * Math.sin(t * 5 + i)), sc);
          o.updateMatrix();
          im.setMatrixAt(i, o.matrix);
        }
        im.instanceMatrix.needsUpdate = true;
      }
      if (v.balik) {
        const { im, L, xMin, xMax } = v.balik, gen = xMax - xMin;
        for (let i = 0; i < L.length; i++) {
          const f = L[i];
          const u = ((f.x0 + f.yon * t * f.hiz) % gen + gen) % gen;
          const x = xMin + u;
          const y = f.y0 + Math.sin(t * 1.5 + f.faz) * 0.55;
          o.position.set(x, y, f.z);
          o.rotation.set(0, (f.yon > 0 ? 0 : PI) + Math.sin(t * 6.5 + f.faz) * 0.14, Math.cos(t * 1.5 + f.faz) * 0.08);
          o.scale.setScalar(f.s);
          o.updateMatrix();
          im.setMatrixAt(i, o.matrix);
        }
        im.instanceMatrix.needsUpdate = true;
      }
    },

    sok(ctx) { temizSok(ctx); }
  };

  // ════════════════════════════════════════════════════════════════════
  // 40 · OYUNCAK DİYARI (Bölüm 45) — pastel ahşap bloklar ve oyuncak tren
  // (arka planda mor ve parlak sarı kısıtlı: Pırıl ve yıldızlar öne çıkar)
  // ════════════════════════════════════════════════════════════════════
  const OD_RENK = [
    [0xe84855, 0xff8a94], // oyuncak kırmızısı
    [0x24b4a4, 0x7ceadc], // turkuaz-nane
    [0x3692d8, 0x8cd4ff], // gök mavisi
    [0x38b474, 0x88e6b6], // nane yeşili
    [0xf07e44, 0xffbe94]  // şeftali-mercan
  ];

  DY_EK[40] = {
    palet: {
      ad: 'Oyuncak Diyarı', gece: 0,
      sisRenk: 0xfef0e0, sisYogun: 0.0032, arka: 0xfcecd8,
      gok: [0xffe8d6, 0xffdfd2, 0xf2e4ee, 0xb8dcf8, 0x76b4ec], gunesPos: [54, 24], gunesRenk: 0xfff4d6,
      ykUst: 0xfff8ec, ykAlt: 0x94b89c, ykGuc: 1.24, gnRenk: 0xfff2dc, gnGuc: 2.18, arkaRenk: 0xffc8b0, arkaGuc: 0.55,
      dag: [[0xb4d8e4, 0xfef0dc], [0x9ec8d8, 0xf8e8d4], [0x8ab8cc, 0xf2e0cc]],
      tepe: [0x5ac498, 0xa8edd0, 0x72d0aa, 0xc8f6e2],
      agac: [[0x3ab878, 0x88e4b6], [0x28b8a8, 0x80ecdc], [0xe84855, 0xff8a94]],
      zemin: [0x90dcb8, 0x62b48e, 0xc8f0dc], cimen: [0x4ca47c, 0x96e4be, 0x7ed4aa],
      cicek: [[0xe84855, 0xff8c94], [0x3aa8d8, 0x8ce0ff], [0x38b882, 0x88e8be], [0xf28246, 0xffbe94]],
      sisSerit: [0xfff6e8, 0xfce6d4], siluet: [0x245848, 0x3a7a64]
    },
    secenek: {
      agacYok: true, tepeCicekYok: true, mantarSusYok: true, citYok: true,
      caliYok: true, kulubeYok: true, degirmenYok: true, cicekYok: true, onSiluetYok: true,
      bulutSay: 7, bulutRenk: [0xffe8dc, 0xffffff],
      zeminDesen: 'cim', cimenSik: 0.28,
      piknikTur: 'piknik', piknikRenk: [0xe84855, 0xfef4d8],
      bayrakRenk: [0xe84855, 0x38a8d8, 0x48c48c, 0xf4884a, 0xfef4d8],
      ucusanTur: 'yaprak', ucusanRenk: [0xff8a94, 0x8cd8ff, 0x96eac4, 0xffffff],
      salincak: {
        govde: [0xdca064, 0xf8d4a4],
        tacYok: true, sarmasikYok: true, cicekYok: true, kusYok: true, tacIsik: 0x3a2414
      }
    },
    yardimci: {
      mantar: { sapka: [[0xe84855, 0xff9aa4], [0x28b8a8, 0x88f0e0], [0x3894d8, 0x96d8ff]], govde: [0xf4d8b4, 0xfff6e4], benek: 0xffffff },
      bulut: { alt: 0xffc8c0, ust: 0xffffff, yanak: 0xe84855, emissive: 0x6a3840 },
      nilufer: { yaprak: [0x38b882, 0x8ce8be], cicek: [0xe84855, 0xffa8b0], halka: 0xffffff },
      ruzgar: { renk: [0x38a8d8, 0xd8f4ff], emissive: 0x1a78a8, ok: 0xffffff },
      halka: { renk: [0xe84855, 0xffb8a8], emissive: 0xb83038, cicek: [[0x38b882, 0x98eec8], [0x38a8d8, 0x9ae0ff], [0xf4884a, 0xffc898], [0xfef4d8, 0xffffff]] },
      baloncuk: { renk: 0x98dcff, kenar: 0xffffff, cizgi: 0x2068a8, opaklik: 1.2 },
      esinti: { tur: 'yaprak', renk: 0xfff8ec, taneRenk: [0xe84855, 0x38a8d8, 0x48c48c, 0xf4884a] }
    },
    yardimciKur: {
      // Salıncak kemeri: renkli oyuncak blokları ve sallanan kurdeleler
      salincak(ctx, o) {
        const { T, G } = ctx, PR = ogPrizma(T), HK = ogHalka(T);
        const { S, A, FL, sapanX, z } = o;
        for (const q of [-1, 1]) {
          const x = q * sapanX, bx = q * (sapanX + 0.95);
          const cA = OD_RENK[q < 0 ? 0 : 1], cB = OD_RENK[q < 0 ? 2 : 3];
          S.ekle(G.kutu, bx, 0.28, z + 0.22, 0.56, 0.56, 0.56, cA[0], cA[1], 0, q * 0.25, 0);
          S.ekle(G.kutu, bx + q * 0.54, 0.22, z + 0.05, 0.44, 0.44, 0.44, cB[0], cB[1], 0, -q * 0.3, 0);
          S.ekle(PR, bx, 0.78, z + 0.22, 0.62, 0.44, 0.62, 0xf28246, 0xffc098, 0, q * 0.25, 0);
          S.ekle(G.kutu, x, 5.02, z - 0.1, 0.68, 0.52, 0.68, cB[0], cB[1]);
          S.ekle(HK, x, 5.4, z - 0.1, 0.36, 0.36, 0.36, cA[0], cA[1]);
          S.ekle(PR, x, 5.76, z - 0.1, 0.58, 0.44, 0.58, 0xf4d6a8, 0xfff6e4);
          for (let k = 0; k < 5; k++) {
            const yy = 1.0 + k * 0.72, rc = OD_RENK[(k + (q > 0 ? 2 : 0)) % 5];
            S.ekle(G.halka, x + q * 0.32 * (1 - k * 0.16), yy, z + 0.05, 0.36, 0.14, 0.36, rc[0], rc[1], 0.3, k * 0.5, q * 0.35);
          }
          A.ekle(G.kutu, x + q * 0.42, 4.45, z + 0.18, 0.12, 1.1, 0.04, cA[0], cA[1], 0, 0, q * 0.18, 0.35);
          A.ekle(G.kutu, x + q * 0.6, 4.55, z + 0.12, 0.1, 0.85, 0.04, cB[0], cB[1], 0, 0, q * 0.32, 0.42);
        }
        for (let i = 1; i < 10; i++) {
          const u = i / 10, kx = -sapanX + 2 * sapanX * u;
          const ky = 4.74 + 1.34 * Math.sin(u * PI) + 0.12, rc = OD_RENK[i % 5];
          A.ekle(G.kutu, kx, ky, z + 0.18, 0.24, 0.24, 0.24, rc[0], rc[1], 0.2, i * 0.5, 0.3, 0.14);
          if (i % 2 === 0) FL.ekle(G.kureK, kx, ky - 0.26, z + 0.2, 0.11, 0.11, 0.11, rc[0], 0xfff8ec);
        }
      },

      // Zıplatan yardımcı: gülümseyen renkli ahşap halka kulesi / yaylı oyuncak yastık (tabanı y=0, üstü ~2.45)
      mantar(M, i, ctx) {
        const { T, G } = ctx, S = ctx.yapi(), HK = ogHalka(T);
        S.ekle(G.sil, 0, 0.14, 0, 1.62, 0.28, 1.62, 0xc2864a, 0xefc088);
        S.ekle(G.sil, 0, 1.0, 0, 0.34, 1.7, 0.34, 0xb87a40, 0xe8b478);
        const halkalar = [
          [0.44, 1.48, 0.48, OD_RENK[i % 5]],
          [0.84, 1.34, 0.46, OD_RENK[(i + 1) % 5]],
          [1.22, 1.18, 0.44, OD_RENK[(i + 2) % 5]],
          [1.58, 1.04, 0.42, OD_RENK[(i + 4) % 5]]
        ];
        for (const [hy, hr, hs, rc] of halkalar) {
          S.ekle(HK, 0, hy, 0, hr, hs, hr, rc[0], rc[1]);
        }
        S.ekle(G.kureO, 0, 2.02, 0, 1.14, 0.56, 1.08, 0xefd0a6, 0xfff6e4);
        S.ekle(G.kubbe, 0, 2.26, 0, 0.72, 0.28, 0.7, OD_RENK[i % 5][0], OD_RENK[i % 5][1]);
        for (const q of [-1, 1]) S.ekle(G.kureK, q * 0.56, 1.94, 0.96, 0.16, 0.1, 0.05, 0xff6278, 0xff94a8);
        S.ekle(G.torusSap, 0, 1.88, 1.04, 0.6, 0.6, 0.45, 0x4e2618, 0x623220, 0, 0, PI);

        const govde = new T.Mesh(S.geo(), ctx.malz(true, true, 0.25, { roughness: 0.38, emissive: 0x4a2414, emissiveIntensity: 0.22 }));
        const E = ctx.yapi();
        for (const q of [-1, 1]) {
          E.ekle(G.kureK, q * 0.28, 0, 0, 0.1, 0.14, 0.05, 0x2a1410, 0x2a1410);
          E.ekle(G.kureK, q * 0.28 + 0.03, 0.05, 0.04, 0.035, 0.045, 0.02, 0xffffff, 0xffffff);
        }
        const goz = new T.Mesh(E.geo(), ctx.malz(false, true, 0, { roughness: 0.35 }));
        goz.position.set(0, 2.1, 1.02);
        govde.add(goz);

        const zp = zipIsaretKur(ctx, 3.22, [0xffa8a0, 0xfff8ec]);
        const mesh = new T.Group();
        mesh.add(govde); mesh.add(zp.hale); mesh.add(zp.oklar);
        (ctx.veri.zip = ctx.veri.zip || []).push({ govde, oklar: zp.oklar, om: zp.om, im: zp.im, okY: zp.okY, f: i * 1.3 });
        return { mesh, goz };
      }
    },

    kur(ctx) {
      const { T, G, hx, yerY, tepeY, R, ara } = ctx;
      const S = ctx.yapi();
      const KM = ogKemer(T), PR = ogPrizma(T), HK = ogHalka(T);
      const xa = -38, xb = hx + 46;

      // 1) Naneli dama desenli tepe yamaları (z -38 .. -50, tepelerin eğimine oturan dama blokları)
      for (const cx of [-48, -8, 30, 68, 104]) {
        const cz = -42, rows = 3, cols = 8;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = cx + (c - 3.5) * 2.5, z = cz + r * 2.2, y = tepeY(x, z) - 0.15;
            const c1 = (r + c) % 2 ? [0xf6ecd6, 0xfff8ec] : [0x3ab484, 0x7ce0b2];
            S.ekle(G.kutu, x, y, z, 2.48, 0.35, 2.18, c1[0], c1[1], 0.26, 0, 0);
          }
        }
      }

      // 2) Dev üst üste ahşap oyuncak blok kaleleri ve köprü kemerleri (z -12 .. -24)
      const blokKutu = (x, y, z, s, rc, des) => {
        S.ekle(G.kutu, x, y + s * 0.5, z, s, s, s, rc[0], rc[1]);
        S.ekle(G.kutu, x, y + s * 0.5, z + s * 0.49, s * 0.78, s * 0.78, s * 0.04, 0xf2d4a6, 0xfff4de);
        if (des === 0) S.ekle(G.sil, x, y + s * 0.5, z + s * 0.52, s * 0.26, s * 0.04, s * 0.26, rc[0], rc[1], PI / 2, 0, 0);
        else if (des === 1) S.ekle(G.kutu, x, y + s * 0.5, z + s * 0.52, s * 0.34, s * 0.34, s * 0.04, rc[0], rc[1], 0, 0, PI / 4);
        else S.ekle(PR, x, y + s * 0.5, z + s * 0.52, s * 0.42, s * 0.38, s * 0.04, rc[0], rc[1]);
      };

      const kale = (x, z, k, renkIdx) => {
        const y = yerY(x, z) - 0.08, s = 2.4 * k;
        const c1 = OD_RENK[renkIdx % 5], c2 = OD_RENK[(renkIdx + 1) % 5], c3 = OD_RENK[(renkIdx + 2) % 5], c4 = OD_RENK[(renkIdx + 3) % 5];
        blokKutu(x - s * 1.15, y, z, s, c1, 0);
        blokKutu(x + s * 1.15, y, z, s, c2, 1);
        blokKutu(x - s * 1.15, y + s, z, s * 0.9, c3, 2);
        blokKutu(x + s * 1.15, y + s, z, s * 0.9, c4, 0);
        S.ekle(KM, x, y + s * 1.9, z, s * 1.52, s * 1.15, s * 1.0, 0xe8c48e, 0xfff0d4);
        S.ekle(PR, x - s * 1.15, y + s * 2.25, z, s * 0.95, s * 0.72, s * 0.95, c1[0], c1[1]);
        S.ekle(G.koni, x + s * 1.15, y + s * 2.32, z, s * 0.52, s * 0.85, s * 0.52, c2[0], c2[1]);
        S.ekle(G.sil, x, y + s * 3.05 + s * 0.35, z, s * 0.35, s * 0.7, s * 0.35, 0xe8c48e, 0xfff0d4);
        S.ekle(G.koni, x, y + s * 3.9, z, s * 0.48, s * 0.82, s * 0.48, c3[0], c3[1]);
      };
      kale(-26, -21, 1.15, 0);
      kale(hx * 0.15, -19, 1.15, 2);
      kale(hx * 0.58, -22, 1.25, 1);
      kale(hx + 24, -20, 1.15, 3);

      // Daha küçük blok kümeleri & kemerler (z -6 .. -15, orta koridorlarda)
      for (let x = xa + 4; x < xb; x += ara(11, 16)) {
        const z = ara(-12.2, -14.8);
        if (Math.abs(x - hx * 0.28) < 5 || Math.abs(x - hx * 0.74) < 5) continue;
        const y = yerY(x, z) - 0.06, k = ara(0.85, 1.15), cA = OD_RENK[Math.floor(R() * 5)], cB = OD_RENK[Math.floor(R() * 5)];
        blokKutu(x, y, z, 1.5 * k, cA, Math.floor(R() * 3));
        S.ekle(PR, x, y + 1.85 * k, z, 1.6 * k, 0.75 * k, 1.5 * k, cB[0], cB[1]);
        S.ekle(G.sil, x + 1.5 * k, y + 0.7 * k, z + 0.3, 0.44 * k, 1.4 * k, 0.44 * k, 0xe8c48e, 0xfff0d4);
      }

      // 3) Uzakta dev ahşap oyuncak ayıcık, ördekçik ve yel değirmeni siluetleri (z -16 .. -25, yüzsüz)
      const oyuncakAyi = (x, z, k) => {
        const y = yerY(x, z) - 0.08, a1 = 0xba7440, a2 = 0xe8ae76;
        S.ekle(G.kutu, x, y + 0.25 * k, z, 2.8 * k, 0.5 * k, 2.0 * k, 0x3894d8, 0x8cd4ff); // oyuncak kaidesi
        const yb = y + 0.5 * k;
        S.ekle(G.kureU, x, yb + 1.45 * k, z, 1.42 * k, 1.6 * k, 1.12 * k, a1, a2);
        S.ekle(G.kureU, x, yb + 1.45 * k, z + 0.65 * k, 0.88 * k, 1.0 * k, 0.55 * k, 0xf2d8b4, 0xfff4e0);
        S.ekle(G.kureU, x, yb + 3.35 * k, z, 1.12 * k, 1.02 * k, 1.02 * k, a1, a2);
        S.ekle(G.kureU, x, yb + 3.12 * k, z + 0.85 * k, 0.46 * k, 0.34 * k, 0.34 * k, 0xf2d8b4, 0xfff4e0);
        for (const q of [-1, 1]) {
          S.ekle(G.kureK, x + q * 0.92 * k, yb + 4.22 * k, z, 0.38 * k, 0.38 * k, 0.25 * k, a1, a2);
          S.ekle(G.kureU, x + q * 1.38 * k, yb + 1.95 * k, z + 0.2 * k, 0.48 * k, 0.82 * k, 0.45 * k, a1, a2, 0, 0, q * 0.45);
          S.ekle(G.kureU, x + q * 0.82 * k, yb + 0.45 * k, z + 0.72 * k, 0.54 * k, 0.46 * k, 0.7 * k, a1, a2);
          S.ekle(G.koni, x + q * 0.32 * k, yb + 2.48 * k, z + 0.95 * k, 0.22 * k, 0.42 * k, 0.14 * k, 0xe84855, 0xff8a94, 0, 0, q * PI / 2);
        }
        S.ekle(G.kureK, x, yb + 2.48 * k, z + 0.98 * k, 0.14 * k, 0.14 * k, 0.14 * k, 0xe84855, 0xff8a94);
      };
      oyuncakAyi(-16, -20, 1.25);
      oyuncakAyi(hx * 0.28, -18, 1.3);

      const oyuncakOrdek = (x, z, k) => {
        const y = yerY(x, z) - 0.05;
        S.ekle(G.kutu, x, y + 0.24 * k, z, 3.4 * k, 0.34 * k, 1.4 * k, 0xd89c60, 0xf8cc94);
        S.ekle(G.kureU, x, y + 1.28 * k, z, 1.55 * k, 1.0 * k, 1.05 * k, 0xf08c54, 0xffc89c);       // şeftali ahşap gövde
        S.ekle(G.kureU, x + 0.95 * k, y + 2.48 * k, z, 0.82 * k, 0.78 * k, 0.8 * k, 0xf08c54, 0xffc89c); // baş
        S.ekle(G.kureU, x + 1.85 * k, y + 2.4 * k, z, 0.52 * k, 0.24 * k, 0.44 * k, 0xe84855, 0xff8a94); // kırmızı-turuncu gaga
        S.ekle(G.kureU, x - 0.1 * k, y + 1.38 * k, z + 0.92 * k, 0.78 * k, 0.48 * k, 0.22 * k, 0x24b4a4, 0x7ceadc, 0, 0, -0.2); // kanat
        S.ekle(PR, x - 1.45 * k, y + 1.84 * k, z, 0.55 * k, 0.68 * k, 0.45 * k, 0xf08c54, 0xffc89c, 0, 0, 0.55); // kuyruk
      };
      oyuncakOrdek(hx * 0.74, -17.5, 1.32);
      oyuncakOrdek(hx + 16, -19.5, 1.2);

      // Dönen rüzgar gülü oyuncak kulesi (z -24, uzun ve renkli)
      const ydx = hx * 0.44, ydz = -24, ydy = yerY(ydx, ydz) - 0.08;
      S.ekle(G.kutu, ydx, ydy + 2.0, ydz, 3.2, 4.0, 2.6, 0x3692d8, 0x8cd4ff);
      S.ekle(G.kutu, ydx, ydy + 5.2, ydz, 2.5, 2.8, 2.2, 0xf2d4a6, 0xfff4de);
      S.ekle(G.koni4, ydx, ydy + 7.8, ydz, 2.3, 2.5, 2.3, 0xe84855, 0xff8a94, 0, PI / 4, 0);
      S.ekle(G.kureK, ydx, ydy + 5.5, ydz + 1.15, 0.38, 0.38, 0.26, 0x24b4a4, 0x7ceadc);

      const YP = ctx.yapi();
      for (let j = 0; j < 4; j++) {
        const a = (j / 4) * PI * 2, rc = OD_RENK[j % 5];
        YP.ekle(G.kutu, Math.cos(a) * 1.85, Math.sin(a) * 1.85, 0, 2.9, 0.76, 0.12, rc[0], rc[1], 0, 0, a);
        YP.ekle(G.sil, Math.cos(a) * 1.65, Math.sin(a) * 1.65, -0.07, 0.08, 3.1, 0.08, 0xd89c60, 0xf8cc94, 0, 0, a + PI / 2);
      }
      YP.ekle(G.kureK, 0, 0, 0.1, 0.38, 0.38, 0.24, 0xf07e44, 0xffbe94);
      const yelPervane = new T.Mesh(YP.geo(), ctx.malz(true, true, 0.2, { roughness: 0.45 }));
      yelPervane.position.set(ydx, ydy + 5.5, ydz + 1.35);
      ctx.ekle(yelPervane);
      ctx.veri.pervane = yelPervane;

      // 4) Oyuncak tren yolu (z = -9): ahşap yastık taban + traversler + raylar
      const rayZ = -9, rayY = 0.24, rayL = xb - xa + 24, rayCx = (xa + xb) / 2;
      S.ekle(G.kutu, rayCx, 0.08, rayZ, rayL, 0.28, 1.9, 0xd4a46a, 0xf2ce9c);
      for (const rz of [-0.42, 0.42]) S.ekle(G.kutu, rayCx, rayY + 0.06, rayZ + rz, rayL, 0.1, 0.1, 0xe8b878, 0xfff0d0);
      for (let x = xa - 8; x <= xb + 8; x += 1.25) {
        S.ekle(G.kutu, x, rayY + 0.01, rayZ, 0.28, 0.07, 1.38, 0x8a5834, 0xb88254);
      }

      // 5) Yakın & en ön kenar süsleri (z 16..20, küçük ahşap bloklar ve halkalar — oyun düzlemini kapatmaz)
      for (let x = xa - 4; x < xb + 4; x += ara(3.6, 5.6)) {
        const z = ara(17, 20.2), y = yerY(x, z), c = OD_RENK[Math.floor(R() * 5)], s = ara(0.7, 1.15);
        S.ekle(G.kutu, x, y + s * 0.4, z, s, s * 0.8, s, c[0], c[1], 0, ara(-0.4, 0.4), 0);
        if (R() < 0.5) S.ekle(HK, x + s * 0.85, y + 0.2, z + 0.1, 0.48 * s, 0.48 * s, 0.48 * s, OD_RENK[(Math.floor(R() * 5) + 1) % 5][0], 0xffffff);
      }
      for (let x = xa + 4; x < xb; x += ara(7, 12)) {
        const z = ara(2.6, 5.5);
        if (Math.abs(x) < 4.5 || Math.abs(x - hx) < 4.5) continue;
        const c = OD_RENK[Math.floor(R() * 5)], s = ara(0.32, 0.5);
        S.ekle(G.kutu, x, s * 0.45, z, s, s * 0.9, s, c[0], c[1], 0, R(), 0);
      }

      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0.2, { roughness: 0.62, emissive: 0x3a2414, emissiveIntensity: 0.12 })));

      // 6) Minik ahşap çuf-çuf oyuncak treni (lokomotif + 2 vagon + baca dumanı)
      const trenMalz = ctx.malz(true, true, 0.22, { roughness: 0.42, emissive: 0x381814, emissiveIntensity: 0.16 });
      const tekerEkle = (B, xs) => {
        for (const tx of xs) for (const qz of [-0.56, 0.56]) {
          B.ekle(G.sil, tx, 0.24, qz, 0.26, 0.12, 0.26, 0xe84855, 0xff9aa4, PI / 2, 0, 0);
          B.ekle(G.kureK, tx, 0.24, qz + (qz > 0 ? 0.05 : -0.05), 0.11, 0.11, 0.04, 0xfef4d8, 0xffffff);
        }
      };

      const LK = ctx.yapi();
      LK.ekle(G.kutu, 0, 0.34, 0, 2.4, 0.22, 1.05, 0x423026, 0x6a4e3e);
      LK.ekle(G.sil, 0.3, 0.78, 0, 0.44, 1.48, 0.44, 0xd83644, 0xff707c, 0, 0, PI / 2);
      LK.ekle(G.kureU, 1.02, 0.78, 0, 0.22, 0.44, 0.44, 0x24b4a4, 0x7ceadc);
      LK.ekle(G.kutu, -0.68, 0.98, 0, 0.96, 1.08, 1.04, 0x3692d8, 0x8cd4ff);
      LK.ekle(G.kutu, -0.68, 1.56, 0, 1.16, 0.16, 1.2, 0xe84855, 0xff8a94);
      LK.ekle(G.kule, 0.65, 1.34, 0, 0.22, 0.66, 0.22, 0x24b4a4, 0x7ceadc, PI, 0, 0);
      LK.ekle(PR, 1.24, 0.36, 0, 0.38, 0.36, 0.9, 0xf07e44, 0xffbe94, 0, PI / 2, 0);
      tekerEkle(LK, [-0.72, 0.05, 0.72]);
      const loko = new T.Mesh(LK.geo(), trenMalz);
      loko.scale.setScalar(1.22);
      loko.position.set(0, rayY + 0.08, rayZ);
      ctx.ekle(loko);

      const V1 = ctx.yapi();
      V1.ekle(G.kutu, 0, 0.36, 0, 2.1, 0.26, 1.0, 0x38b474, 0x88e6b6);
      V1.ekle(G.kutu, 0, 0.68, 0, 0.64, 0.48, 0.64, 0xe84855, 0xff8a94, 0, 0.2, 0);
      V1.ekle(G.kutu, -0.58, 0.64, 0.04, 0.48, 0.38, 0.5, 0x3692d8, 0x8cd4ff);
      V1.ekle(PR, 0.58, 0.68, 0, 0.58, 0.48, 0.58, 0xf07e44, 0xffbe94);
      tekerEkle(V1, [-0.62, 0.62]);
      const vagon1 = new T.Mesh(V1.geo(), trenMalz);
      vagon1.scale.setScalar(1.22);
      vagon1.position.set(0, rayY + 0.08, rayZ);
      ctx.ekle(vagon1);

      const V2 = ctx.yapi();
      V2.ekle(G.kutu, 0, 0.34, 0, 2.0, 0.2, 1.0, 0xf2d4a6, 0xfff4de);
      V2.ekle(G.kutu, 0, 0.8, 0, 1.82, 0.78, 0.96, 0x3692d8, 0x8cd4ff);
      V2.ekle(G.kutu, 0, 1.24, 0, 1.98, 0.14, 1.1, 0xf07e44, 0xffbe94);
      for (const px of [-0.45, 0.45]) V2.ekle(G.kutu, px, 0.84, 0.49, 0.42, 0.36, 0.04, 0xfff4de, 0xffffff);
      tekerEkle(V2, [-0.6, 0.6]);
      const vagon2 = new T.Mesh(V2.geo(), trenMalz);
      vagon2.scale.setScalar(1.22);
      vagon2.position.set(0, rayY + 0.08, rayZ);
      ctx.ekle(vagon2);

      const DM = ctx.yapi();
      DM.ekle(G.kureK, 0, 0, 0, 1, 1, 1, 0xf2eee8, 0xffffff);
      const dmMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, transparent: true, opacity: 0.76, emissive: 0xffffff, emissiveIntensity: 0.32 });
      const ND = 9, dim = new T.InstancedMesh(DM.geo(), dmMat, ND);
      dim.frustumCulled = false;
      ctx.ekle(dim);

      ctx.veri.tren = { loko, vagon1, vagon2, dim, ND, xMin: xa - 8, xMax: xb + 8, y0: rayY + 0.08, z0: rayZ };
      ctx.veri.o = new T.Object3D();
      DY_EK[40].guncelle(0, 0, ctx);
    },

    guncelle(t, dt, ctx) {
      const v = ctx.veri;
      zipAnim(v, t);
      if (v.pervane) v.pervane.rotation.z = -t * 0.85;
      if (v.tren) {
        const tr = v.tren, gen = tr.xMax - tr.xMin, hiz = 4.6;
        // Oyun başında parkurun tam ortasından geçerken görünsün
        const xBase = tr.xMin + ((t * hiz + 66) % gen);
        const hop = (faz) => Math.abs(Math.sin(t * 10 + faz)) * 0.05;
        tr.loko.position.set(xBase, tr.y0 + hop(0), tr.z0);
        tr.loko.rotation.z = Math.sin(t * 10) * 0.025;
        tr.vagon1.position.set(xBase - 3.25, tr.y0 + hop(1.1), tr.z0);
        tr.vagon1.rotation.z = Math.sin(t * 10 + 1.1) * 0.02;
        tr.vagon2.position.set(xBase - 6.25, tr.y0 + hop(2.2), tr.z0);
        tr.vagon2.rotation.z = Math.sin(t * 10 + 2.2) * 0.02;

        const o = v.o;
        for (let i = 0; i < tr.ND; i++) {
          const u = (t * 0.85 + i / tr.ND) % 1;
          const sc = (0.18 + u * 0.4) * Math.sin(u * PI);
          o.position.set(xBase + 0.8 - u * 2.1, tr.y0 + 2.0 + u * 2.4, tr.z0 + Math.sin(t * 2 + i) * 0.14);
          o.rotation.set(0, 0, u * 1.4);
          o.scale.setScalar(Math.max(0.01, sc));
          o.updateMatrix();
          tr.dim.setMatrixAt(i, o.matrix);
        }
        tr.dim.instanceMatrix.needsUpdate = true;
      }
    },

    sok(ctx) { temizSok(ctx); }
  };

  // ════════════════════════════════════════════════════════════════════
  // 41 · GÖKKUŞAĞI ŞELALESİ (Bölüm 46) — zümrüt teraslı kayalıklar, çift gökkuşağı, şelaleler & su çarkları
  // ════════════════════════════════════════════════════════════════════
  DY_EK[41] = {
    palet: {
      ad: 'Gökkuşağı Şelalesi', gece: 0,
      sisRenk: 0xd0f2fa, sisYogun: 0.0036, arka: 0xcbeffa,
      gok: [0xe6f8fc, 0xc6eefc, 0xa2e0fa, 0x5ebaf0, 0x267ed8], gunesPos: [58, 28], gunesRenk: 0xfff6d8,
      ykUst: 0xf4fcff, ykAlt: 0x5aa474, ykGuc: 1.24, gnRenk: 0xfff6dc, gnGuc: 2.3, arkaRenk: 0x90ecd8, arkaGuc: 0.55,
      dag: [[0x6abca0, 0xd0f2fa], [0x54a88e, 0xc2ecf6], [0x42947e, 0xb4e4f0]],
      tepe: [0x32a062, 0x82de88, 0x46b07a, 0xa8e8b8],
      agac: [[0x207e48, 0x58c86c], [0x2a8e52, 0x6cd87e], [0x1c6c42, 0x4ab264]],
      zemin: [0x46b45a, 0x2a8642, 0x92de8c], cimen: [0x248244, 0x74d86c, 0x5ac45e],
      cicek: [[0xff6a92, 0xffc0d4], [0x48b8f0, 0xb4e8ff], [0xff8a50, 0xffcaa8], [0xffffff, 0xeefcff]],
      sisSerit: [0xe6fbff, 0xc8f0f6], siluet: [0x144028, 0x225a38]
    },
    secenek: {
      agacTur: 'selvi', bulutSay: 8, bulutRenk: [0xdcf0fa, 0xffffff],
      gokkusagi: 0.96, dere: true, suRenk: [0x249ec8, 0x7be8f4], zeminDesen: 'cim', cimenSik: 0.62,
      kulubeYok: true, degirmenYok: true,
      bayrakRenk: [0xff6a88, 0x48c4e8, 0x5ad87a, 0xff9a48, 0xffffff],
      ucusanTur: 'yaprak', ucusanRenk: [0x8ee684, 0xc8f8d0, 0xa8ecff, 0xffffff],
      salincak: {
        yaprak: [[0x248c52, 0x6cd876], [0x2ea05e, 0x84e88a]],
        sarmasik: [0x28904e, 0x78e07c],
        cicek: [[0xff7a9e, 0xffd0e0], [0x5ac8f0, 0xc0eeff], [0xff9a62, 0xffd2b4], [0xffffff, 0xe8f8ff]],
        tacIsik: 0x10321a
      }
    },
    yardimci: {
      mantar: { sapka: [0xe8384a, 0xff7a88], govde: [0xf0e4ce, 0xffffff], benek: 0xffffff },
      bulut: { alt: 0xc8ecff, ust: 0xffffff, yanak: 0xff7aa0, emissive: 0x5882a8 },
      nilufer: { yaprak: [0x289650, 0x7ae27c], cicek: [0xff7eb0, 0xffe4f0], halka: 0xd8fbff },
      ruzgar: { renk: [0x38b8f0, 0xe8fbff], emissive: 0x1888c8, ok: 0xffffff },
      halka: { renk: [0xf47040, 0xffc898], emissive: 0xc84818, cicek: [[0xff6a92, 0xffc8d8], [0x48c4f0, 0xc0f0ff], [0x5ad87a, 0xb8f8c8], [0xffffff, 0xe8fbff]] },
      baloncuk: { renk: 0xb8f0ff, kenar: 0xffffff, cizgi: 0x1a78b0, opaklik: 1.2 },
      esinti: { tur: 'yaprak', renk: 0xf0fff8, taneRenk: [0x90e890, 0xa8f0ff, 0xffffff] }
    },
    yardimciKur: {
      // Salıncak: taze yaprak demetleri ve parıldayan çiy damlaları
      salincak(ctx, o) {
        const { G } = ctx, { S, A, FL, sapanX, z } = o;
        for (const q of [-1, 1]) {
          const x = q * sapanX;
          for (let k = 0; k < 5; k++) {
            const a = -0.7 + k * 0.35;
            A.ekle(G.yaprak, x + q * 0.45 + Math.sin(a) * 0.4, 5.25 + k * 0.14, z - 0.15, 0.24, 0.85, 0.05, 0x228c4e, 0x80e888, 0, 0, -q * (0.6 + k * 0.14), 0.24);
            FL.ekle(G.kureC, x + q * 0.72 + k * q * 0.12, 4.95 + (k % 2) * 0.35, z + 0.18, 0.065, 0.09, 0.065, 0x84ecff, 0xffffff, 0, 0, 0, 0.18);
          }
          for (let k = 0; k < 4; k++) {
            const rx = q * (sapanX + 0.9) + (k - 1.5) * 0.24;
            S.ekle(G.yaprak, rx, 0.38, z + 0.28, 0.18, 0.72, 0.04, 0x208046, 0x74dc7c, 0, 0, (k - 1.5) * 0.32, 0.16);
            FL.ekle(G.kureC, rx, 0.62, z + 0.32, 0.05, 0.065, 0.05, 0x84ecff, 0xffffff);
          }
        }
        for (let i = -3; i <= 3; i++) {
          const ux = i * 0.45, uy = 6.08 - Math.abs(i) * 0.12;
          FL.ekle(G.kureC, ux, uy - 0.22, z + 0.22, 0.058, 0.085, 0.058, 0x8cf0ff, 0xffffff, 0, 0, 0, 0.14);
        }
      }
    },

    kur(ctx) {
      const { T, G, hx, yerY, R, ara } = ctx;
      const S = ctx.yapi(), V = ctx.yapi();
      const xa = -38, xb = hx + 46;

      // 1) Dış ikinci soluk gökkuşağı kemeri (dunya.js iç gökkuşağının dışında belirgin boşlukla çift gökkuşağı)
      {
        const GK2 = ctx.yapi();
        const renk2 = [0xb86eff, 0x7284ff, 0x4cc4ff, 0x5ee886, 0xffe64d, 0xff9b42, 0xff5c8d];
        const rx = hx * 0.52, ry = 5, rz = -88;
        for (let i = 0; i < renk2.length; i++) {
          const tg = new T.TorusGeometry(63 - i * 1.45, 0.95, 6, 48, PI);
          GK2.ekle(tg, rx, ry, rz - i * 0.04, 1.15, 0.85, 1, renk2[i], renk2[i]);
          tg.dispose();
        }
        const gm2 = new T.MeshBasicMaterial({ vertexColors: true, fog: false, transparent: true, opacity: 0.36, depthWrite: false });
        ctx.ekle(new T.Mesh(GK2.geo(), gm2));
      }

      // 2) Çok katmanlı yosunlu zümrüt kayalıklar + köpüklü şelale şeritleri (z -12 .. -28)
      const selP = [], selU = [], selF = [];
      const sisYer = [];
      const selaleEkle = (x, yUst, yAlt, z, w, faz) => {
        const NS = 6;
        for (let i = 0; i < NS; i++) {
          const v0 = i / NS, v1 = (i + 1) / NS;
          const yy0 = yAlt + (yUst - yAlt) * v0, yy1 = yAlt + (yUst - yAlt) * v1;
          const dz0 = (1 - v0 * v0) * 1.6, dz1 = (1 - v1 * v1) * 1.6;
          selP.push(x - w, yy0, z + dz0, x + w, yy0, z + dz0, x + w, yy1, z + dz1, x - w, yy0, z + dz0, x + w, yy1, z + dz1, x - w, yy1, z + dz1);
          selU.push(0, v0, 1, v0, 1, v1, 0, v0, 1, v1, 0, v1);
          for (let k = 0; k < 6; k++) selF.push(faz);
        }
        sisYer.push([x, yAlt + 0.35, z + 1.8, w]);
      };

      const kayaKatman = (x, yTab, z, w, h, dz) => {
        // Doğal kayalık basamağı: yan yana organik kaya sütunları + taşkın yosun yastıkları
        for (const [ox, ok, oy, oz] of [[0, 1.0, 1.0, 0], [-0.46, 0.72, 0.88, 0.25], [0.48, 0.74, 0.85, 0.22], [-0.82, 0.52, 0.62, 0.45], [0.84, 0.5, 0.58, 0.4]]) {
          const kh = h * oy, kw = w * 0.46 * ok, kd = w * 0.34 * ok;
          S.ekle(G.kule, x + ox * w, yTab + kh * 0.5, z + oz * dz, kw, kh, kd, 0x4b685e, 0x84a092, 0, ox, 0);
          S.nc = [x + ox * w, yTab + kh * 0.8, z + oz * dz];
          S.ekle(G.kureU, x + ox * w, yTab + kh * 0.98, z + oz * dz + 0.1, kw * 1.28, 0.55 + ok * 0.3, kd * 1.22, 0x20884c, 0x6cd874);
          S.nc = null;
        }
      };

      const kayalikTeras = (x, z, w, h, selaleler) => {
        const y0 = yerY(x, z) - 0.7;
        kayaKatman(x, y0, z, w, h * 0.56, 1.0);
        kayaKatman(x - w * 0.08, y0 + h * 0.52, z - 1.1, w * 0.68, h * 0.48, 0.8);
        // Teras üstünde küçük zümrüt selviler & çalılar
        for (const [tx, ty, tk] of [[-w * 0.62, h * 0.54, 0.52], [w * 0.58, h * 0.52, 0.48], [-w * 0.32, h * 0.98, 0.56]]) {
          S.ekle(G.kule, x + tx, y0 + ty + 0.6 * tk, z - 0.4, 0.14 * tk, 1.2 * tk, 0.14 * tk, 0x5c3e2a, 0x8a6042);
          S.ekle(G.kureU, x + tx, y0 + ty + 1.8 * tk, z - 0.4, 0.72 * tk, 1.3 * tk, 0.68 * tk, 0x1e7e46, 0x6cd876);
        }
        // Sarkan sarmaşıklar & eğrelti
        for (let j = 0; j < 7; j++) {
          const vx = x + (j - 3) * (w * 0.28), vy = y0 + h * (j % 2 ? 0.54 : 0.94), vz = z + w * 0.34;
          const len = ara(1.1, 2.3);
          V.ekle(G.silA3, vx, vy - len * 0.5, vz, 0.04, len, 0.04, 0x208046, 0x6cd874, 0, 0, 0, -0.2);
          V.ekle(G.yaprak, vx, vy - len, vz + 0.05, 0.16, 0.42, 0.04, 0x289450, 0x84e888, 0, 0, 0, -0.25);
        }
        for (const [ox, yu, ya, sz, sw, fz] of selaleler) {
          selaleEkle(x + ox, y0 + yu, y0 + ya, z + sz, sw, fz);
        }
      };

      kayalikTeras(-16, -24, 5.4, 13.0, [[-0.2, 12.8, 7.0, 0.9, 1.45, 0.4], [0.4, 7.2, 0.9, 2.2, 1.85, 1.7]]);
      kayalikTeras(hx * 0.2, -20, 5.0, 11.2, [[0.2, 11.0, 5.8, 0.8, 1.4, 1.1], [0.5, 6.0, 0.9, 2.1, 1.8, 2.3]]);
      kayalikTeras(hx * 0.55, -24, 6.6, 15.0, [[-0.4, 14.8, 8.0, 1.0, 1.8, 0.9], [0.2, 8.2, 1.0, 2.6, 2.4, 3.1]]);
      kayalikTeras(hx + 18, -22, 5.2, 12.0, [[-0.1, 11.8, 6.4, 0.8, 1.4, 2.5], [0.3, 6.6, 0.9, 2.2, 1.8, 4.2]]);

      // Şelaleler (kaydırılmış UV köpüklü ShaderMaterial)
      {
        const sg = new T.BufferGeometry();
        sg.setAttribute('position', new T.Float32BufferAttribute(selP, 3));
        sg.setAttribute('uv', new T.Float32BufferAttribute(selU, 2));
        sg.setAttribute('aFaz', new T.Float32BufferAttribute(selF, 1));
        sg.computeVertexNormals();
        const sm = new T.ShaderMaterial({
          transparent: true, depthWrite: false, fog: false, side: T.DoubleSide,
          uniforms: { uT: ctx.U.uT },
          vertexShader: 'attribute float aFaz; varying vec2 vU; varying float vF; void main(){ vU = uv; vF = aFaz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: 'varying vec2 vU; varying float vF; uniform float uT; void main(){' +
            ' float kenar = smoothstep(0.0, 0.16, vU.x) * smoothstep(1.0, 0.84, vU.x);' +
            ' float serit = 0.5 + 0.5 * sin(vU.x * 26.0 + sin(vU.y * 8.0 + uT * 2.4) * 0.9);' +
            ' float akis = fract(vU.y * 3.8 + uT * 2.1 + vF + sin(vU.x * 14.0) * 0.25);' +
            ' float kopuk = smoothstep(0.42, 0.94, akis) * serit + smoothstep(0.24, 0.0, vU.y) * 0.72 + smoothstep(0.84, 1.0, vU.y) * 0.5;' +
            ' vec3 c = mix(vec3(0.14, 0.72, 0.88), vec3(0.94, 0.99, 1.0), clamp(kopuk, 0.0, 1.0));' +
            ' gl_FragColor = vec4(c, kenar * (0.88 + 0.1 * kopuk)); }'
        });
        const selMesh = new T.Mesh(sg, sm);
        selMesh.renderOrder = 2; selMesh.frustumCulled = false;
        ctx.ekle(selMesh);
      }

      // 3) Üst dere (z = -9.5), ahşap köprü, kıyı taşları
      const uDereZ = -9.5, uDereGen = 3.2;
      {
        const ug = new T.PlaneGeometry(xb - xa + 20, uDereGen, 80, 4);
        ug.rotateX(-PI / 2);
        const up = ug.attributes.position, cx = (xa + xb) / 2;
        for (let i = 0; i < up.count; i++) {
          const x = up.getX(i) + cx, z = up.getZ(i) + uDereZ;
          up.setXYZ(i, x, 0.24, z);
        }
        ug.computeVertexNormals();
        const um = new T.ShaderMaterial({
          transparent: true, depthWrite: false, uniforms: { uT: ctx.U.uT },
          vertexShader: 'varying vec2 vU; varying vec3 vW; void main(){ vU = uv; vW = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: 'varying vec2 vU; varying vec3 vW; uniform float uT; void main(){' +
            ' float k = smoothstep(0.0, 0.2, vU.y) * smoothstep(1.0, 0.8, vU.y);' +
            ' float d = 0.5 + 0.5 * sin(vW.x * 1.4 - uT * 2.3 + sin(vW.z * 2.2) * 1.2);' +
            ' float p = pow(max(0.0, sin(vW.x * 3.1 + uT * 2.8) * cos(vW.z * 4.5 - uT * 1.7)), 6.0);' +
            ' vec3 c = mix(vec3(0.14, 0.62, 0.78), vec3(0.48, 0.91, 0.96), d) + vec3(0.85, 0.99, 1.0) * p * 0.65;' +
            ' gl_FragColor = vec4(c, k * 0.9); }'
        });
        const uDere = new T.Mesh(ug, um);
        uDere.renderOrder = 1;
        ctx.ekle(uDere);
      }
      for (let x = xa; x < xb; x += ara(2.0, 3.5)) {
        for (const qz of [-1, 1]) {
          const z = uDereZ + qz * (uDereGen * 0.52 + ara(-0.2, 0.3)), y = yerY(x, z);
          S.ekle(G.kureU, x, y + 0.14, z, ara(0.45, 0.85), ara(0.22, 0.4), ara(0.35, 0.6), 0x4d685e, 0x86a296, 0, R() * 3, 0);
          if (R() < 0.35) S.ekle(G.kureK, x, y + 0.34, z, 0.38, 0.16, 0.32, 0x289854, 0x76e280);
        }
      }
      // Üst dere üzerinde kavisli küçük ahşap köprü
      {
        const bx = hx * 0.44, z0 = uDereZ - 2.2, z1 = uDereZ + 2.2;
        for (let i = 0; i < 8; i++) {
          const u = (i + 0.5) / 8, zz = z0 + (z1 - z0) * u, yy = 0.36 + 0.85 * Math.sin(u * PI);
          S.ekle(G.kutu, bx, yy, zz, 2.2, 0.14, 0.48, i % 2 ? 0x8a5a34 : 0x9e6c44, 0xc8925e, Math.cos(u * PI) * 0.35, 0, 0);
        }
        for (const qx of [-1, 1]) for (const qz of [z0 + 0.3, uDereZ, z1 - 0.3]) {
          S.ekle(G.sil, bx + qx * 1.0, 0.85 + (qz === uDereZ ? 0.5 : 0), qz, 0.08, 1.3, 0.08, 0x6a4228, 0x9c6842);
        }
      }

      // 4) Üst dere kenarında dönen ahşap su çarkları (z = -8)
      const carkYer = [-12, hx * 0.25, hx * 0.64];
      for (const cx of carkYer) {
        const y = yerY(cx, -8) - 0.1;
        S.ekle(G.kutu, cx, y + 0.95, -7.25, 1.35, 2.0, 0.7, 0x526a60, 0x8ea89c);
        S.ekle(G.kureU, cx, y + 1.98, -7.25, 0.75, 0.25, 0.45, 0x268e50, 0x72dc7c);
        S.ekle(G.sil, cx, y + 2.05, -7.95, 0.16, 1.5, 0.16, 0x6a4228, 0x9c6842, PI / 2, 0, 0);
        S.ekle(G.kutu, cx + 1.5, y + 0.78, -8.35, 2.3, 1.55, 1.5, 0xc8a47c, 0xf2dfc2);
        S.ekle(G.kutu, cx + 1.5, y + 0.78, -7.58, 0.6, 0.9, 0.06, 0x6a4228, 0x9c6842);
        S.ekle(G.koni4, cx + 1.5, y + 2.05, -8.35, 1.85, 1.2, 1.45, 0xd85848, 0xff8a78, 0, PI / 4, 0);
      }
      {
        const CK = ctx.yapi(), Rw = 1.82;
        CK.ekle(G.halka, 0, 0, 0.22, Rw, Rw, 0.45, 0x7a4c2c, 0xb87e4e);
        CK.ekle(G.halka, 0, 0, -0.22, Rw, Rw, 0.45, 0x7a4c2c, 0xb87e4e);
        CK.ekle(G.sil, 0, 0, 0, 0.22, 0.62, 0.22, 0x5e381e, 0x9c6842, PI / 2, 0, 0);
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * PI * 2;
          CK.ekle(G.kutu, Math.cos(a) * Rw * 0.5, Math.sin(a) * Rw * 0.5, 0, Rw, 0.1, 0.48, 0x825232, 0xc28a56, 0, 0, a);
          CK.ekle(G.kutu, Math.cos(a) * Rw * 1.02, Math.sin(a) * Rw * 1.02, 0, 0.26, 0.12, 0.68, 0x5a3820, 0x5ad0e0, 0, 0, a + 0.35);
        }
        const cw = new T.InstancedMesh(CK.geo(), ctx.malz(true, true, 0.2, { roughness: 0.68 }), carkYer.length);
        cw.frustumCulled = false;
        ctx.ekle(cw);
        ctx.veri.cark = { im: cw, x: carkYer, o: new T.Object3D() };
      }

      // 5) Şelale tabanından yükselen su serpintisi / buğu bulutları (InstancedMesh)
      {
        const SF = ctx.yapi();
        SF.ekle(G.kureK, 0, 0, 0, 1, 0.78, 1, 0xdcf8ff, 0xffffff);
        const sm = new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.66, depthWrite: false });
        const N = sisYer.length * 6, sim = new T.InstancedMesh(SF.geo(), sm, N);
        sim.frustumCulled = false; sim.renderOrder = 3;
        ctx.ekle(sim);
        const sL = [];
        for (let i = 0; i < N; i++) {
          const b = sisYer[i % sisYer.length];
          sL.push({ x: b[0] + ara(-b[3] * 0.75, b[3] * 0.75), y: b[1], z: b[2], faz: R(), s: ara(0.7, 1.3) });
        }
        ctx.veri.sis = { im: sim, L: sL };
      }

      // 6) Ön dere kıyısında yosunlu taşlar ve taze eğrelti otları (dere 6..hx-5, z -2.2..2.5 hariç)
      for (let x = xa + 2; x < xb; x += ara(2.4, 4.0)) {
        for (const z of [-2.8, 3.1]) {
          if (Math.abs(x) < 4.5 || Math.abs(x - hx) < 4.5) continue;
          const y = yerY(x, z);
          S.ekle(G.kureU, x, y + 0.08, z, ara(0.28, 0.55), ara(0.14, 0.26), ara(0.22, 0.42), 0x4c685c, 0x86a496, 0, R() * 3, 0);
          for (let k = 0; k < 3; k++) V.ekle(G.yaprak, x + (k - 1) * 0.14, y + 0.25, z + 0.1, 0.12, 0.52, 0.03, 0x208448, 0x7ae27c, 0, 0, (k - 1) * 0.35, 0.32);
        }
      }

      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0.22, { roughness: 0.76, emissive: 0x10321e, emissiveIntensity: 0.16 })));
      ctx.ekle(new T.Mesh(V.geo(), ctx.malz(true, true, 0.26, { roughness: 0.62, emissive: 0x123e24, emissiveIntensity: 0.2 })));
      ctx.veri.o = new T.Object3D();
      DY_EK[41].guncelle(0, 0, ctx);
    },

    guncelle(t, dt, ctx) {
      const v = ctx.veri, o = v.o;
      if (!o) return;
      if (v.cark) {
        const { im, x } = v.cark;
        for (let i = 0; i < x.length; i++) {
          o.position.set(x[i], 2.05, -8.0);
          o.rotation.set(0, 0, -t * 1.15 - i * 0.8);
          o.scale.setScalar(1);
          o.updateMatrix();
          im.setMatrixAt(i, o.matrix);
        }
        im.instanceMatrix.needsUpdate = true;
      }
      if (v.sis) {
        const { im, L } = v.sis;
        for (let i = 0; i < L.length; i++) {
          const p = L[i], u = (t * 0.55 + p.faz) % 1;
          const sc = p.s * (0.4 + u * 1.05) * Math.sin(u * PI);
          o.position.set(p.x + Math.sin(t * 1.8 + i) * 0.35 * u, p.y + u * 1.85, p.z + u * 0.55);
          o.rotation.set(0, 0, u * 0.8);
          o.scale.setScalar(Math.max(0.01, sc));
          o.updateMatrix();
          im.setMatrixAt(i, o.matrix);
        }
        im.instanceMatrix.needsUpdate = true;
      }
    },

    sok(ctx) { temizSok(ctx); }
  };
})();
