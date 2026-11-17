/* ortam_b.js — Pırıl'ın Uçuş Okulu: kış ortamları (u2-ortam-b)
   22 · Karlı Köy (bölüm 27) · 27 · Buzul Gölü (bölüm 32) · 35 · Kış Gecesi Şenliği (bölüm 40, büyük final)
   Kalıp: scratchpad/notlar/ucus2_ek_api.md. Her şey birleştirilmiş geometri ya da InstancedMesh; kare başına yeni nesne yok. */
(function () {
  'use strict';
  window.DY_EK = window.DY_EK || {};
  const PI = Math.PI;

  // ── Ortak şablon geometriler (yalnız kaynak: S.ekle içinde kopyalanır, sahneye eklenmez; bir kez kurulur) ──
  let OB_GEO = null;
  function obGeo() {
    if (OB_GEO) return OB_GEO;
    const T = THREE;
    OB_GEO = {
      prizma: new T.CylinderGeometry(1, 1, 1, 3, 1).rotateX(-PI / 2),   // üçgen alın (tepe y=1, taban y=-0.5, x ±0.866, z ±0.5)
      altigen: new T.CylinderGeometry(1, 1, 1, 6, 1),                    // buz kristali gövdesi
      altiKoni: new T.ConeGeometry(1, 1, 6, 1),                          // kristal ucu
      kesik: new T.CylinderGeometry(0.8, 1, 1, 7, 1),                    // buz kütlesi / buz parçası
      ikosa: new T.IcosahedronGeometry(1, 0),                            // köşeli buz kayası
      kubbeK: new T.SphereGeometry(1, 12, 5, 0, PI * 2, 0, PI * 0.56),   // ucuz kar yığını kubbesi
      daire: new T.CircleGeometry(1, 28)                                 // yuvarlak hâle
    };
    return OB_GEO;
  }

  // Parlayan (ışıksız) malzeme: pencere, fener, ampul. sal > 0 ise yanıp söner (sal = faz)
  function obParlak(ctx, opak) {
    const T = ctx.T, U = ctx.U;
    const m = new T.MeshBasicMaterial({ vertexColors: true });
    if (opak != null) { m.transparent = true; m.opacity = opak; m.depthWrite = false; }
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uT = U.uT;
      sh.vertexShader = 'attribute float sal;\nvarying float vObTw;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvObTw = sal;');
      sh.fragmentShader = 'uniform float uT;\nvarying float vObTw;\n' + sh.fragmentShader.replace('#include <dithering_fragment>',
        '#include <dithering_fragment>\nif (vObTw > 0.0) { float obS = 0.5 + 0.5 * sin(uT * 2.3 + vObTw * 41.0); gl_FragColor.rgb *= 0.5 + 0.62 * obS * obS; }');
    };
    m.toneMapped = false;
    m.customProgramCacheKey = () => 'obParlak1';
    return m;
  }

  // ── Kış süsleri kurucuları. S: ışıklı birleşik yapı, L: parlayan birleşik yapı ──
  function obKis(ctx, S, L, ayar) {
    const { G, yerY } = ctx, ara = ctx.ara, R = ctx.R, OG = obGeo();
    const tY = (x, z) => Math.max(yerY(x, z), ctx.tepeY ? ctx.tepeY(x, z) || 0 : 0);
    const KG = (ayar && ayar.KG) || 0xc0c6ee, KB = 0xffffff;       // karın gölgeli (mavi-mor) ve aydınlık rengi
    const koyu = (h, t) => ctx.karH(h, 0x1a1830, t == null ? 0.35 : t), acik = (h, t) => ctx.karH(h, 0xffffff, t == null ? 0.25 : t);
    const A = {
      tY, KG, KB, koyu, acik,
      // Karla kaplı çam (katmanlı; her katın üstünde kar başlığı)
      cam(x, z, k, renk, y0) {
        const y = y0 != null ? y0 : tY(x, z), c = renk || [0x1f5a48, 0x3c8a68];
        S.ekle(G.sil, x, y + 0.45 * k, z, 0.16 * k, 0.9 * k, 0.16 * k, 0x5a3c2c, 0x7a5638);
        const kat = 3;
        for (let i = 0; i < kat; i++) {
          const r = (1.25 - i * 0.3) * k, h = (1.5 - i * 0.18) * k, yy = y + (0.95 + i * 0.95) * k;
          S.ekle(G.koni, x, yy + h / 2, z, r, h, r, c[0], c[1], 0, i * 0.7, 0, 0.12 * (i + 1) * k);
          S.ekle(G.koni, x, yy + h * 0.66, z, r * 0.8, h * 0.68, r * 0.8, KG, KB, 0, i * 0.7 + 0.3, 0, 0.12 * (i + 1) * k);
        }
        S.ekle(G.kureK, x, y + 0.08 * k, z, 0.55 * k, 0.18 * k, 0.55 * k, KG, KB);
      },
      // Kar yığını
      yigin(x, z, sx, sy, sz, y0) {
        const y = y0 != null ? y0 : yerY(x, z);
        S.ekle(OG.kubbeK, x, y - 0.05, z, sx, Math.max(sy, sx * 0.38), sz, KG, KB);
      },
      // Karlı kaya
      kaya(x, z, k, renk) {
        const y = yerY(x, z), c = renk || [0x6a7090, 0x9aa0c0];
        S.ekle(G.kureO, x, y + 0.2 * k, z, 0.7 * k, 0.5 * k, 0.6 * k, c[0], c[1], 0.3, R() * 3, 0.2);
        S.ekle(G.kureO, x - 0.05 * k, y + 0.52 * k, z + 0.04 * k, 0.6 * k, 0.2 * k, 0.5 * k, KG, KB, 0, R() * 3, 0);
      },
      // Kardan adam (havuç burun, atkı, şapka/bere)
      kardanAdam(x, z, k, atki, sapkaTur, ry) {
        const y = yerY(x, z), at = atki || [0xd8384a, 0xff6a78], r = ry || 0;
        const cz = Math.cos(r), sz = Math.sin(r);
        const P = (dx, dz) => [x + dx * cz + dz * sz, z - dx * sz + dz * cz];
        S.ekle(G.kureO, x, y + 0.62 * k, z, 0.78 * k, 0.72 * k, 0.78 * k, KG, KB);
        S.ekle(G.kureO, x, y + 1.58 * k, z, 0.56 * k, 0.52 * k, 0.56 * k, KG, KB);
        S.ekle(G.kureO, x, y + 2.3 * k, z, 0.42 * k, 0.4 * k, 0.42 * k, KG, KB);
        let p = P(0, 0.62 * k);
        S.ekle(G.koni, p[0], y + 2.28 * k, p[1], 0.08 * k, 0.42 * k, 0.08 * k, 0xff7a20, 0xffb060, PI / 2, r, 0);
        for (const q of [-1, 1]) {
          p = P(q * 0.15 * k, 0.36 * k); S.ekle(G.kureK, p[0], y + 2.42 * k, p[1], 0.055 * k, 0.065 * k, 0.04 * k, 0x1e1e2e, 0x3a3a50);
          p = P(q * 0.62 * k, 0); S.ekle(G.sil, p[0], y + 1.72 * k, p[1], 0.04 * k, 0.75 * k, 0.04 * k, 0x5a3a28, 0x7a5236, 0, r, -q * 1.05);
          p = P(q * 0.95 * k, 0); S.ekle(G.sil, p[0], y + 2.02 * k, p[1], 0.025 * k, 0.25 * k, 0.025 * k, 0x5a3a28, 0x7a5236, 0, r, -q * 0.4);
        }
        for (let i = 0; i < 5; i++) { const a = (i - 2) * 0.28; p = P(Math.sin(a) * 0.24 * k, 0.37 * k); S.ekle(G.kureK, p[0], y + (2.15 - Math.cos(a) * 0.02 - (2 - Math.abs(i - 2)) * 0.025) * k, p[1], 0.035 * k, 0.035 * k, 0.03 * k, 0x2a2a3a, 0x2a2a3a); }
        for (let i = 0; i < 3; i++) { p = P(0, 0.54 * k); S.ekle(G.kureK, p[0], y + (1.35 + i * 0.2) * k, p[1] - 0.02 * k, 0.06 * k, 0.06 * k, 0.04 * k, 0x2a2a3a, 0x40405a); }
        // atkı: boyunda halka + sarkan uç
        S.ekle(G.sil, x, y + 1.98 * k, z, 0.47 * k, 0.16 * k, 0.47 * k, at[0], at[1]);
        p = P(0.22 * k, 0.4 * k); S.ekle(G.kutu, p[0], y + 1.72 * k, p[1], 0.16 * k, 0.5 * k, 0.06 * k, at[0], at[1], 0.25, r, 0.18);
        if (sapkaTur === 'bere') {
          S.ekle(OG.kubbeK, x, y + 2.5 * k, z, 0.4 * k, 0.36 * k, 0.4 * k, at[0], at[1]);
          S.ekle(G.sil, x, y + 2.52 * k, z, 0.42 * k, 0.1 * k, 0.42 * k, 0xf4f4ff, 0xffffff);
          S.ekle(G.kureK, x, y + 2.9 * k, z, 0.13 * k, 0.13 * k, 0.13 * k, 0xf4f4ff, 0xffffff);
        } else {
          S.ekle(G.sil, x, y + 2.6 * k, z, 0.42 * k, 0.05 * k, 0.42 * k, 0x22263a, 0x34384e);
          S.ekle(G.sil, x, y + 2.86 * k, z, 0.27 * k, 0.5 * k, 0.27 * k, 0x22263a, 0x3a3e56);
          S.ekle(G.sil, x, y + 2.7 * k, z, 0.28 * k, 0.08 * k, 0.28 * k, at[0], at[1]);
        }
      },
      // Küçük ev: gövde, karlı çatı, baca, sıcak ışıklı pencereler. Bacanın tepesini döndürür.
      ev(x, z, k, duvar, cati, y0, sus) {
        const y = y0 != null ? y0 : tY(x, z), w = 3.0 * k, h = 2.0 * k, d = 2.4 * k, s = 0.75 * k, rise = 1.5 * s, on = z + d / 2;
        S.ekle(G.kutu, x, y + h / 2, z, w, h, d, koyu(duvar, 0.25), duvar);
        S.ekle(G.kutu, x, y + 0.16 * k, z, w + 0.12 * k, 0.32 * k, d + 0.12 * k, 0x7a7e9c, 0xa0a4c2);
        // ahşap kirişler
        for (const q of [-1, 1]) S.ekle(G.kutu, x + q * (w / 2 - 0.06 * k), y + h / 2, on + 0.02, 0.14 * k, h, 0.06 * k, koyu(duvar, 0.45), koyu(duvar, 0.3));
        S.ekle(OG.prizma, x, y + h + 0.5 * s, z, w / 1.732, s, d, duvar, acik(duvar, 0.15));
        const a = Math.atan2(rise, w / 2), uz = Math.hypot(w / 2, rise) + 0.5 * k;
        for (const q of [-1, 1]) S.ekle(G.kutu, x + q * (w / 4 + 0.1 * k), y + h + rise / 2 + 0.17 * k, z, uz, 0.3 * k, d + 0.55 * k, cati, KB, 0, 0, -q * a);
        S.ekle(G.kureO, x, y + h + rise + 0.2 * k, z, 0.3 * k, 0.16 * k, d / 2 + 0.3 * k, KG, KB);
        // saçaktan sarkan kar
        for (const q of [-1, 1]) S.ekle(G.kureO, x + q * (w / 2 + 0.1 * k), y + h + 0.05 * k, z, 0.28 * k, 0.16 * k, d / 2 + 0.25 * k, KG, KB);
        // baca
        const bx = x + 0.55 * w / 2, by = y + h + rise * 0.45 + 0.6 * k;
        S.ekle(G.kutu, bx, by, z - 0.2 * k, 0.45 * k, 1.3 * k, 0.45 * k, 0x8a4038, 0xb85c4c);
        S.ekle(G.kureO, bx, by + 0.68 * k, z - 0.2 * k, 0.32 * k, 0.13 * k, 0.32 * k, KG, KB);
        // pencereler (çerçeve + sıcak ışık + kar pervazı)
        const pw = 0.72 * k, ph = 0.78 * k, py = y + h * 0.55;
        for (const q of [-1, 1]) {
          const px = x + q * w * 0.27;
          S.ekle(G.kutu, px, py, on + 0.01, pw + 0.16 * k, ph + 0.16 * k, 0.05, 0xe8dcc8, 0xfff6e8);
          L.ekle(G.kutu, px, py, on + 0.04, pw, ph, 0.04, 0xff9a30, 0xffe08a);
          S.ekle(G.kutu, px, py, on + 0.07, 0.06 * k, ph, 0.03, 0xe8dcc8, 0xfff6e8);
          S.ekle(G.kutu, px, py + 0.04 * k, on + 0.07, pw, 0.06 * k, 0.03, 0xe8dcc8, 0xfff6e8);
          S.ekle(G.kureO, px, py - ph / 2 - 0.08 * k, on + 0.1 * k, pw / 2 + 0.12 * k, 0.09 * k, 0.12 * k, KG, KB);
        }
        // kapı
        S.ekle(G.kutu, x, y + 0.6 * k, on + 0.02, 0.62 * k, 1.2 * k, 0.06, 0x5a3424, 0x8a5236);
        S.ekle(G.kureK, x + 0.2 * k, y + 0.6 * k, on + 0.07, 0.05 * k, 0.05 * k, 0.04, 0xd8a840, 0xffe080);
        // alındaki yuvarlak pencere
        L.ekle(G.kureK, x, y + h + 0.42 * s, on + 0.02, 0.24 * k, 0.24 * k, 0.04, 0xffa840, 0xffe8a0);
        S.ekle(G.halkaInce, x, y + h + 0.42 * s, on + 0.04, 0.27 * k, 0.27 * k, 1.5, 0xe8dcc8, 0xfff6e8);
        // önünde kar kümesi
        S.ekle(OG.kubbeK, x - 0.9 * w / 2, y, on + 0.15 * k, 0.6 * k, 0.32 * k, 0.4 * k, KG, KB);
        S.ekle(OG.kubbeK, x + 0.8 * w / 2, y, on + 0.1 * k, 0.5 * k, 0.26 * k, 0.35 * k, KG, KB);
        if (sus) sus(x, y, z, w, h, d, rise, on);
        return [bx, by + 0.8 * k, z - 0.2 * k, k];
      },
      // Karlı çit parçası (x0..x1)
      cit(x0, x1, z, k, renk) {
        const c = renk || [0x8a6448, 0xb88c64], n = Math.max(2, Math.round((x1 - x0) / (1.3 * k)));
        for (let i = 0; i <= n; i++) {
          const x = x0 + (x1 - x0) * i / n, y = yerY(x, z);
          S.ekle(G.kutu, x, y + 0.5 * k, z, 0.15 * k, 1.0 * k, 0.15 * k, c[0], c[1]);
          S.ekle(G.kureK, x, y + 1.04 * k, z, 0.12 * k, 0.09 * k, 0.12 * k, KG, KB);
        }
        const m = (x0 + x1) / 2, y = yerY(m, z), L = x1 - x0;
        for (const hh of [0.38, 0.75]) S.ekle(G.kutu, m, y + hh * k, z + 0.09 * k, L, 0.11 * k, 0.05 * k, c[0], c[1]);
        S.ekle(G.kureO, m, y + 0.82 * k, z + 0.09 * k, L / 2, 0.08 * k, 0.07 * k, KG, KB);
        S.ekle(OG.kubbeK, m, y - 0.02, z, L / 2 + 0.3, 0.22 * k, 0.5 * k, KG, KB);
      },
      // Sokak feneri (direk + parlayan fener)
      fener(x, z, k, isik) {
        const y = yerY(x, z), c = isik || [0xffb040, 0xfff0b0];
        S.ekle(G.sil, x, y + 1.25 * k, z, 0.07 * k, 2.5 * k, 0.07 * k, 0x22283c, 0x3a4060);
        S.ekle(G.sil, x, y + 0.1 * k, z, 0.18 * k, 0.2 * k, 0.18 * k, 0x22283c, 0x3a4060);
        S.ekle(G.sil, x, y + 2.52 * k, z, 0.2 * k, 0.06 * k, 0.2 * k, 0x22283c, 0x3a4060);
        L.ekle(G.kureO, x, y + 2.75 * k, z, 0.2 * k, 0.26 * k, 0.2 * k, c[0], c[1]);
        S.ekle(G.koni4, x, y + 3.08 * k, z, 0.3 * k, 0.24 * k, 0.3 * k, 0x22283c, 0x3a4060, 0, PI / 4, 0);
        S.ekle(G.kureK, x, y + 3.15 * k, z, 0.22 * k, 0.08 * k, 0.22 * k, KG, KB);
      },
      // Kızak
      kizak(x, z, k, renk, ry) {
        const y = yerY(x, z), c = renk || [0xc83040, 0xff5a60], r = ry || 0;
        S.ekle(G.kutu, x, y + 0.36 * k, z, 1.3 * k, 0.1 * k, 0.6 * k, c[0], c[1], 0, r, 0);
        for (const q of [-1, 1]) {
          const ox = -Math.sin(r) * q * 0.26 * k, oz = Math.cos(r) * q * 0.26 * k;
          S.ekle(G.kutu, x + ox, y + 0.06 * k, z + oz, 1.5 * k, 0.05 * k, 0.05 * k, 0x8a6a4c, 0xb08a60, 0, r, 0);
          S.ekle(G.torusSap, x + ox + Math.cos(r) * 0.74 * k, y + 0.12 * k, z + oz - Math.sin(r) * 0.74 * k, 0.32 * k, 0.32 * k, 0.6 * k, 0x8a6a4c, 0xb08a60, 0, r, -PI / 2);
          S.ekle(G.kutu, x + ox * 0.9, y + 0.2 * k, z + oz * 0.9, 0.05 * k, 0.28 * k, 0.05 * k, 0x8a6a4c, 0xb08a60, 0, r, 0);
        }
      },
      // Kızak izi: ikili ince çizgi (kar üstünde gölgeli oyuk)
      kizakIzi(x0, x1, z0, gen, egr) {
        const n = Math.max(4, Math.round((x1 - x0) / 1.4));
        for (let i = 0; i < n; i++) {
          const xa = x0 + (x1 - x0) * i / n, xb = x0 + (x1 - x0) * (i + 1) / n, f = (x) => z0 + Math.sin(x * 0.11 + egr) * gen;
          const za = f(xa), zb = f(xb), L = Math.hypot(xb - xa, zb - za), ry = -Math.atan2(zb - za, xb - xa);
          for (const q of [-0.28, 0.28]) S.ekle(G.kutu, (xa + xb) / 2, 0.012, (za + zb) / 2 + q, L + 0.05, 0.02, 0.12, 0xb8c0ea, 0xb8c0ea, 0, ry, 0);
        }
      },
      // Hediye paketi
      hediye(x, z, k, renk, kurdele, y0, ry) {
        const y = y0 != null ? y0 : yerY(x, z), r = ry || 0, kr = kurdele || 0xffd84a;
        S.ekle(G.kutu, x, y + 0.4 * k, z, 0.8 * k, 0.8 * k, 0.8 * k, koyu(renk, 0.2), renk, 0, r, 0);
        S.ekle(G.kutu, x, y + 0.4 * k, z, 0.84 * k, 0.82 * k, 0.16 * k, kr, acik(kr, 0.3), 0, r, 0);
        S.ekle(G.kutu, x, y + 0.4 * k, z, 0.16 * k, 0.82 * k, 0.84 * k, kr, acik(kr, 0.3), 0, r, 0);
        for (const q of [-1, 1]) S.ekle(G.kureK, x + q * 0.14 * k * Math.cos(r), y + 0.88 * k, z - q * 0.14 * k * Math.sin(r), 0.16 * k, 0.1 * k, 0.08 * k, kr, acik(kr, 0.3), 0, r, q * 0.5);
      },
      // Sıcak battaniye (Bilbo'nun yeri): kareli örtü + fener + kakao fincanları
      battaniye(hx, renk, fenerX) {
        const c = renk || [0xc8324a, 0xfff2e0];
        for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) {
          const x = hx - 1.65 + i * 0.66, z = -1.0 + j * 0.62, cc = ((i + j) % 2) ? c[0] : c[1];
          S.ekle(G.kutu, x, 0.025, z, 0.66, 0.05, 0.62, cc, cc);
        }
        for (let i = 0; i < 6; i++) S.ekle(G.kutu, hx - 1.65 + i * 0.66, 0.035, -1.0 + 1.5 * 0.62, 0.1, 0.05, 2.48, c[0], c[0]);
        // püsküller
        for (let i = 0; i < 9; i++) S.ekle(G.kureK, hx - 1.9 + i * 0.475, 0.03, 1.33, 0.06, 0.04, 0.12, c[0], c[0]);
        const fx = fenerX != null ? fenerX : hx + 2.4;
        S.ekle(G.kutu, fx, 0.08, -0.7, 0.42, 0.16, 0.42, 0x2a3048, 0x3a4262);
        L.ekle(G.kureO, fx, 0.42, -0.7, 0.2, 0.26, 0.2, 0xffa030, 0xfff0b0);
        for (const q of [-1, 1]) S.ekle(G.sil, fx + q * 0.19, 0.42, -0.7, 0.025, 0.56, 0.025, 0x2a3048, 0x3a4262);
        S.ekle(G.koni4, fx, 0.8, -0.7, 0.32, 0.22, 0.32, 0x2a3048, 0x3a4262, 0, PI / 4, 0);
        S.ekle(G.kureK, fx, 0.95, -0.7, 0.07, 0.07, 0.07, 0x2a3048, 0x3a4262);
        // kakao fincanları
        for (const [mx, mz, mc] of [[hx - 1.2, 0.75, 0x4a8ad8], [hx + 1.15, 0.6, 0xe8a030]]) {
          S.ekle(G.sil, mx, 0.16, mz, 0.12, 0.22, 0.12, mc, acik(mc, 0.3));
          S.ekle(G.sil, mx, 0.27, mz, 0.1, 0.01, 0.1, 0x6a3a22, 0x8a5030);
          S.ekle(G.torusSap, mx + 0.13, 0.16, mz, 0.22, 0.25, 0.2, mc, mc, 0, 0, -PI / 2);
        }
        // yastık
        S.ekle(G.kureO, hx - 1.75, 0.16, -0.8, 0.42, 0.16, 0.32, 0xffd860, 0xfff0a0);
      }
    };
    return A;
  }

  // Bacadan duman (InstancedMesh). Bacalar: [[x,y,z,k],...]
  function obDumanKur(ctx, bacalar, renk, opak) {
    const T = ctx.T, PUF = 5, N = Math.max(1, bacalar.length * PUF);
    const m = new T.MeshStandardMaterial({ color: renk || 0xf2f2fa, roughness: 1, transparent: true, opacity: opak || 0.55, depthWrite: false, emissive: renk || 0xf2f2fa, emissiveIntensity: 0.18 });
    const im = new T.InstancedMesh(ctx.G.kureO, m, N); im.frustumCulled = false;
    ctx.ekle(im);
    ctx.veri.duman = { im, bacalar, PUF, N, o: new T.Object3D() };
  }
  function obDumanGuncelle(t, v) {
    const d = v.duman; if (!d) return;
    const o = d.o;
    for (let b = 0; b < d.bacalar.length; b++) {
      const e = d.bacalar[b], k = e[3] || 1;
      for (let j = 0; j < d.PUF; j++) {
        const p = (t * 0.16 + j / d.PUF + b * 0.37) % 1;
        const s = (0.14 + p * 0.46) * k * (1 - Math.max(0, (p - 0.72) / 0.28)) * Math.min(1, p * 8);
        o.position.set(e[0] + p * 1.6 * k + Math.sin(t * 0.9 + j * 2 + b) * 0.18 * k, e[1] + p * 3.4 * k, e[2]);
        o.scale.set(s, s * 0.85, s);
        o.updateMatrix(); d.im.setMatrixAt(b * d.PUF + j, o.matrix);
      }
    }
    d.im.instanceMatrix.needsUpdate = true;
  }

  // Kar/buz pırıltısı (yerde yanıp sönen küçük yıldızcıklar). yerler: [[x,y,z,boy],...]
  function obPirilKur(ctx, yerler, renk) {
    const T = ctx.T, N = yerler.length;
    const m = new T.MeshBasicMaterial({ color: renk || 0xffffff });
    const im = new T.InstancedMesh(ctx.G.oct, m, N); im.frustumCulled = false;
    ctx.ekle(im);
    ctx.veri.piril = { im, yerler, N, o: new T.Object3D() };
  }
  function obPirilGuncelle(t, v) {
    const d = v.piril; if (!d) return;
    const o = d.o;
    for (let i = 0; i < d.N; i++) {
      const e = d.yerler[i], ph = Math.sin(t * (1.3 + (i % 5) * 0.31) + i * 2.17);
      const s = e[3] * Math.pow(Math.max(0, ph), 6) * (e[2] > -2 ? 0.55 : 1);
      o.position.set(e[0], e[1], e[2]); o.rotation.set(0, t * 0.8 + i, 0.785);
      o.scale.set(s * 0.35, s, s * 0.35);
      o.updateMatrix(); d.im.setMatrixAt(i, o.matrix);
    }
    d.im.instanceMatrix.needsUpdate = true;
  }

  // ── Ek kış parçaları (buz, ışık dizisi, büyük çam, iglo, fok) ──
  function obKisEk(ctx, S, L, A, I) {
    const { G, yerY } = ctx, ara = ctx.ara, R = ctx.R, OG = obGeo(), KG = A.KG, KB = A.KB;
    const B2 = I || S;   // buz parçaları için ayrı (parlak) yapı
    const E = {
      hale: [],
      // Buz kristali kümesi (altıgen gövde + sivri uç)
      kristal(x, z, k, renk, y0) {
        const y = y0 != null ? y0 : yerY(x, z), c = renk || [0x6ac8ec, 0xeafcff], n = 3 + Math.floor(R() * 3);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * PI * 2 + R(), d = i === 0 ? 0 : ara(0.3, 0.6) * k, h = (i === 0 ? ara(2.2, 3.0) : ara(1.0, 2.0)) * k, r = (i === 0 ? 0.36 : ara(0.18, 0.28)) * k;
          const ex = Math.cos(a) * (i === 0 ? 0 : 0.42), ez = Math.sin(a) * (i === 0 ? 0 : 0.3);
          const px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d * 0.7, cx = ex * h * 0.5, cz = ez * h * 0.5;
          B2.ekle(OG.altigen, px + cx * 0.5, y + h * 0.45, pz + cz * 0.5, r, h * 0.9, r, c[0], c[1], ez, R(), -ex);
          B2.ekle(OG.altiKoni, px + cx * 1.0, y + h * 0.9 + r * 0.6, pz + cz * 1.0, r, r * 2.0, r, c[1], 0xffffff, ez, R(), -ex);
        }
        S.ekle(OG.kubbeK, x, y - 0.05, z, 0.9 * k, 0.28 * k, 0.7 * k, KG, KB);
      },
      // Köşeli buz kayası / buzdağı
      buzKaya(x, z, k, renk, y0) {
        const y = y0 != null ? y0 : yerY(x, z), c = renk || [0x48b0d4, 0xe4faff];
        B2.ekle(OG.ikosa, x, y + 0.55 * k, z, 1.2 * k, 1.1 * k, 0.9 * k, c[0], c[1], R(), R() * 3, R() * 0.4);
        B2.ekle(OG.ikosa, x + 0.9 * k, y + 0.35 * k, z + 0.2 * k, 0.7 * k, 0.75 * k, 0.6 * k, c[0], c[1], R(), R() * 3, R() * 0.4);
      },
      // Işık dizisi (sarkan tel + yanıp sönen renkli ampuller)
      isikDizisi(x0, y0, x1, y1, z, sark, renkler, ara0) {
        const uz = Math.hypot(x1 - x0, y1 - y0), n = Math.max(3, Math.round(uz / 0.55)), aralik = ara0 || 1;
        let px = x0, py = y0;
        for (let i = 1; i <= n; i++) {
          const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t - sark * 4 * t * (1 - t);
          const sl = Math.hypot(x - px, y - py);
          S.ekle(G.silA, (x + px) / 2, (y + py) / 2, z, 0.022, sl, 0.022, 0x1a1e30, 0x2a2e44, 0, 0, -Math.atan2(x - px, y - py));
          if (i < n && i % aralik === 0) {
            const c = renkler[(i + Math.floor(x0)) % renkler.length];
            S.ekle(G.kutu, x, y - 0.06, z, 0.07, 0.08, 0.07, 0x30344a, 0x30344a);
            L.ekle(G.kureC, x, y - 0.2, z, 0.12, 0.17, 0.12, ctx.karH(c, 0x200818, 0.15), ctx.karH(c, 0xffffff, 0.25), 0, 0, 0, -(0.05 + R() * 0.95));
          }
          px = x; py = y;
        }
      },
      // Işık direği (dizileri taşır)
      direk(x, z, h) {
        const y = yerY(x, z);
        S.ekle(G.sil, x, y + h / 2, z, 0.08, h, 0.08, 0x3a2c28, 0x5a4234);
        S.ekle(G.kureK, x, y + h + 0.05, z, 0.12, 0.08, 0.12, KG, KB);
        return y + h - 0.05;
      },
      // Büyük süslü çam (şenlik ağacı). Yıldızın yerini döndürür
      buyukCam(x, z, H, renkler) {
        const y = yerY(x, z), kat = 6;
        S.ekle(G.sil, x, y + H * 0.06, z, 0.4, H * 0.12, 0.4, 0x5a3c2c, 0x7a5638);
        for (let i = 0; i < kat; i++) {
          const f = i / kat, r = H * 0.34 * (1 - f * 0.82), h = H * 0.26 * (1 - f * 0.35), yy = y + H * 0.1 + i * H * 0.135;
          S.ekle(G.koni, x, yy + h / 2, z, r, h, r, 0x184a3c, 0x2e7a5e, 0, i * 0.5, 0);
          S.ekle(G.koni, x, yy + h * 0.68, z, r * 0.74, h * 0.64, r * 0.74, KG, KB, 0, i * 0.5 + 0.4, 0);
          // tabaka kenarında süs topları (öne bakan yüzde)
          const n = 7 - Math.floor(i * 0.8);
          for (let j = 0; j < n; j++) {
            const a = -1.35 + 2.7 * (j + 0.5) / n + ara(-0.1, 0.1), rr = r * 0.9;
            const c = renkler[(i * 3 + j) % renkler.length], bx = x + Math.sin(a) * rr, bz = z + Math.cos(a) * rr, by = yy + h * 0.12;
            if ((i + j) % 2) L.ekle(G.kureO, bx, by - 0.16, bz, 0.26, 0.26, 0.26, ctx.karH(c, 0x200818, 0.3), ctx.karH(c, 0xffffff, 0.3));
            else L.ekle(G.kureK, bx, by - 0.1, bz, 0.15, 0.19, 0.15, c, ctx.karH(c, 0xffffff, 0.3), 0, 0, 0, -(0.05 + R() * 0.95));
          }
        }
        // sarmal ışık zinciri
        const top = y + H * 0.1 + kat * H * 0.135;
        for (let s = 0; s < 150; s++) {
          const t = s / 150, yy = y + H * 0.16 + t * (top - y - H * 0.3), a = t * PI * 2 * 4.2;
          if (Math.cos(a) < -0.15) continue;
          const f = (yy - y - H * 0.1) / (kat * H * 0.135), r = H * 0.34 * (1 - f * 0.9) * 0.82;
          L.ekle(G.kureC, x + Math.sin(a) * r, yy, z + Math.cos(a) * r, 0.1, 0.1, 0.1, 0xffe8a0, 0xffffff, 0, 0, 0, -(0.05 + R() * 0.95));
        }
        // tepe yıldızı (4 köşeli parıltı)
        const sy = top + 0.35;
        // tepede beyaz-gümüş kar tanesi (toplanan yıldızlara benzemesin)
        const kt = H / 13;
        for (let a = 0; a < 6; a++) {
          const r = a * PI / 3, ca = Math.cos(r), sa = Math.sin(r);
          L.ekle(G.kutu, x + sa * 0.42 * kt, sy + ca * 0.42 * kt, z + 0.1, 0.09 * kt, 0.84 * kt, 0.06, 0xc8d8ff, 0xffffff, 0, 0, -r);
          for (const q of [-1, 1]) L.ekle(G.kutu, x + sa * 0.6 * kt + Math.sin(r + q * 0.8) * 0.12 * kt, sy + ca * 0.6 * kt + Math.cos(r + q * 0.8) * 0.12 * kt, z + 0.1, 0.06 * kt, 0.26 * kt, 0.05, 0xd4e0ff, 0xffffff, 0, 0, -(r + q * 0.8));
        }
        L.ekle(G.kureK, x, sy, z + 0.12, 0.16 * kt, 0.16 * kt, 0.08, 0xe0e8ff, 0xffffff);
        if (E.hale) E.hale.push([x, sy, z - 0.2, kt]);
        S.ekle(OG.kubbeK, x, y - 0.05, z, H * 0.3, 0.5, H * 0.22, KG, KB);
        return [x, sy, z];
      },
      // İglo (kar tuğlalı kubbe + ışıklı kapı)
      iglo(x, z, k) {
        const y = yerY(x, z);
        S.ekle(OG.kubbeK, x, y - 0.1, z, 2.0 * k, 1.75 * k, 2.0 * k, 0xc8daf0, 0xffffff);
        for (const hh of [0.35, 0.7, 1.05, 1.38]) {
          const f = hh / 1.75, rr = Math.sqrt(Math.max(0, 1 - f * f)) * 2.0 * k;
          S.ekle(G.halkaInce, x, y + hh * k, z, rr * 1.005, rr * 1.005, 0.6, 0xa8c4e4, 0xa8c4e4, PI / 2, 0, 0);
        }
        S.ekle(OG.kubbeK, x, y - 0.05, z + 1.75 * k, 0.85 * k, 0.95 * k, 0.9 * k, 0xc8daf0, 0xffffff);
        S.ekle(G.kureO, x, y + 0.35 * k, z + 2.55 * k, 0.48 * k, 0.55 * k, 0.12 * k, 0x2a3a5a, 0x3a4a6a);
        L.ekle(G.kureO, x, y + 0.32 * k, z + 2.6 * k, 0.36 * k, 0.42 * k, 0.08 * k, 0xff9a30, 0xffd890);
      },
      // Uzanmış fok
      fok(x, z, k, ry, y0) {
        const y = y0 != null ? y0 : yerY(x, z), r = ry || 0, c = Math.cos(r), s = Math.sin(r);
        const P = (dx, dz) => [x + dx * c + dz * s, z - dx * s + dz * c];
        let p = P(0, 0);
        S.ekle(G.kureO, p[0], y + 0.32 * k, p[1], 0.85 * k, 0.36 * k, 0.42 * k, 0x7a8aa4, 0xc4d0e4, 0, r, 0);
        p = P(0.72 * k, 0); S.ekle(G.kureO, p[0], y + 0.62 * k, p[1], 0.36 * k, 0.34 * k, 0.34 * k, 0x8a9ab4, 0xd4dcec, 0, r, 0);
        p = P(-0.9 * k, 0); S.ekle(G.kureO, p[0], y + 0.18 * k, p[1], 0.32 * k, 0.1 * k, 0.24 * k, 0x6a7a94, 0x9aa8c0, 0, r, 0.3);
        p = P(0.78 * k, 0.3 * k); S.ekle(G.kureK, p[0], y + 0.58 * k, p[1], 0.14 * k, 0.11 * k, 0.12 * k, 0xe0e8f4, 0xffffff, 0, r, 0);
        p = P(0.78 * k, 0.38 * k); S.ekle(G.kureK, p[0], y + 0.62 * k, p[1], 0.05 * k, 0.04 * k, 0.04 * k, 0x1e2230, 0x2e3240, 0, r, 0);
        for (const q of [-1, 1]) {
          p = P(0.72 * k + q * 0.13 * k, 0.29 * k); S.ekle(G.kureK, p[0], y + 0.72 * k, p[1], 0.055 * k, 0.065 * k, 0.03 * k, 0x1e2230, 0x2e3240, 0, r, 0);
          p = P(0.15 * k, q * 0.4 * k); S.ekle(G.kureO, p[0], y + 0.1 * k, p[1], 0.24 * k, 0.06 * k, 0.12 * k, 0x6a7a94, 0x9aa8c0, 0, r + q * 0.5, 0);
        }
      }
    };
    return E;
  }

  // Penguen modeli (tabanı y=0, öne +z bakar, boy ~1.15). atki verilirse atkılı
  function obPenguenGeo(ctx, atki) {
    const G = ctx.G, S = ctx.yapi(), D = [0x1c2236, 0x343e5c], W = [0xe4e8f6, 0xffffff], O = [0xff8a20, 0xffb84a];
    S.ekle(G.kureO, 0, 0.48, 0, 0.36, 0.48, 0.32, D[0], D[1]);
    S.ekle(G.kureO, 0, 0.42, 0.12, 0.27, 0.38, 0.22, W[0], W[1]);
    S.ekle(G.kureO, 0, 0.98, 0.02, 0.27, 0.25, 0.25, D[0], D[1]);
    S.ekle(G.kureO, 0, 0.95, 0.12, 0.2, 0.16, 0.15, W[0], W[1]);
    for (const q of [-1, 1]) {
      S.ekle(G.kureK, q * 0.085, 1.0, 0.255, 0.04, 0.05, 0.02, 0x101018, 0x202030);
      S.ekle(G.kureC, q * 0.085 - 0.012, 1.02, 0.272, 0.013, 0.013, 0.01, 0xffffff, 0xffffff);
      S.ekle(G.kureK, q * 0.16, 0.92, 0.2, 0.05, 0.03, 0.02, 0xff9ab0, 0xffb8c8);
      S.ekle(G.kureO, q * 0.36, 0.55, 0, 0.07, 0.27, 0.14, D[0], D[1], 0, 0, q * 0.38);
      S.ekle(G.kureK, q * 0.12, 0.03, 0.13, 0.1, 0.04, 0.14, O[0], O[1]);
    }
    S.ekle(G.koni, 0, 0.93, 0.31, 0.05, 0.13, 0.05, O[0], O[1], PI / 2, 0, 0);
    if (atki) {
      S.ekle(G.sil, 0, 0.76, 0.02, 0.3, 0.09, 0.28, atki[0], atki[1]);
      S.ekle(G.kutu, 0.13, 0.62, 0.25, 0.09, 0.26, 0.04, atki[0], atki[1], 0.2, 0, 0.15);
      S.ekle(G.kubbe, 0, 1.14, 0, 0.24, 0.16, 0.23, atki[0], atki[1]);
      S.ekle(G.kureK, 0, 1.33, 0, 0.07, 0.07, 0.07, 0xffffff, 0xffffff);
    }
    return S.geo();
  }
  // Penguen sürüsü: liste [{x,z,k,tur:'dur'|'yuru'|'kay'|'paten', a,b (alan), ph}]
  function obPenguenKur(ctx, liste, atki) {
    const T = ctx.T;
    const im = new T.InstancedMesh(obPenguenGeo(ctx, atki), ctx.malz(true, true, 0, { roughness: 0.55, emissive: 0x20243a, emissiveIntensity: 0.15 }), liste.length);
    im.frustumCulled = false; ctx.ekle(im);
    const o = new T.Object3D(); o.rotation.order = 'YXZ';
    ctx.veri.penguen = { im, liste, o };
  }
  function obPenguenGuncelle(t, ctx) {
    const d = ctx.veri.penguen; if (!d) return;
    const o = d.o, yerY = ctx.yerY;
    for (let i = 0; i < d.liste.length; i++) {
      const p = d.liste[i], k = p.k || 1, ph = p.ph || 0;
      if (p.tur === 'kay') {
        // karnının üstünde buzda kayar: a'dan b'ye, sonra kalkıp geri yürür gibi yeniden başlar
        const sure = 7, u = ((t + ph) % sure) / sure;
        const git = u < 0.55, v = git ? u / 0.55 : (u - 0.55) / 0.45;
        if (git) {
          const e = 1 - Math.pow(1 - v, 1.6);
          o.position.set(p.a + (p.b - p.a) * e, (p.y || 0) + 0.3 * k, p.z);
          o.rotation.set(PI / 2 - 0.08, (p.b > p.a ? 1 : -1) * PI / 2, Math.sin(t * 9 + i) * 0.05);
        } else {
          const e = v * v * (3 - 2 * v);
          o.position.set(p.b + (p.a - p.b) * e, (p.y || 0) + Math.abs(Math.sin(t * 9 + i)) * 0.06 * k, p.z - 0.8);
          o.rotation.set(0, (p.b > p.a ? -1 : 1) * 0.9, Math.sin(t * 9 + i) * 0.14);
        }
      } else if (p.tur === 'yuru') {
        const u = Math.sin(t * 0.35 + ph), x = p.x + u * (p.a || 1.5), yon = Math.cos(t * 0.35 + ph);
        o.position.set(x, yerY(x, p.z) + Math.abs(Math.sin(t * 7 + i)) * 0.05 * k, p.z);
        o.rotation.set(0, yon > 0 ? 0.8 : -0.8, Math.sin(t * 7 + i) * 0.12);
      } else if (p.tur === 'paten') {
        const a = t * 0.55 + ph, x = p.x + Math.cos(a) * p.a, z = p.z + Math.sin(a) * p.b;
        o.position.set(x, (p.y || 0) + 0.02, z);
        o.rotation.set(0.12, -a, Math.sin(t * 2.4 + i) * 0.1);
      } else {
        o.position.set(p.x, yerY(p.x, p.z), p.z);
        o.rotation.set(0, (p.ry || 0) + Math.sin(t * 0.5 + ph) * 0.25, Math.sin(t * 1.6 + ph) * 0.06);
      }
      o.scale.setScalar(k * (p.tur === 'dur' ? 1 + Math.sin(t * 3 + ph) * 0.015 : 1));
      o.updateMatrix(); d.im.setMatrixAt(i, o.matrix);
    }
    d.im.instanceMatrix.needsUpdate = true;
  }

  // Parlak buz yüzeyi (göl / paten pisti): yuvarlatılmış dikdörtgen, çatlaklar, cilalı şeritler, kırağı kenar
  function obBuzYuzey(ctx, cx, cz, hw, hd, renk, yEk) {
    const T = ctx.T, c = renk || { koyu: 0x2aa8c4, acik: 0xa4eef4, kenar: 0xf4fbff };
    const g = new T.PlaneGeometry(hw * 2, hd * 2, Math.max(4, Math.round(hw)), Math.max(2, Math.round(hd)));
    g.rotateX(-PI / 2); g.translate(cx, 0, cz);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, Math.max(0, ctx.yerY(p.getX(i), p.getZ(i))) + (yEk || 0.07));
    g.computeVertexNormals();
    const m = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.14, metalness: 0.08 });
    const v3 = (h) => { const q = new T.Color(h); return new T.Vector3(q.r, q.g, q.b); };
    const un = { uMer: { value: new T.Vector4(cx, cz, hw, hd) }, uK: { value: v3(c.koyu) }, uA: { value: v3(c.acik) }, uKn: { value: v3(c.kenar) }, uT: ctx.U.uT, uRen: { value: c.renkli ? 1 : 0 } };
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, un);
      sh.vertexShader = 'varying vec2 vObB;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvObB = position.xz;');
      sh.fragmentShader = 'varying vec2 vObB; uniform vec4 uMer; uniform vec3 uK, uA, uKn; uniform float uT, uRen;\n' + sh.fragmentShader.replace('#include <color_fragment>',
        ['#include <color_fragment>',
          'vec2 q = (vObB - uMer.xy) / uMer.zw; float e = pow(abs(q.x), 5.0) + pow(abs(q.y), 3.0);',
          'if (e > 1.0) discard;',
          'float n = 0.5 + 0.25 * sin(vObB.x * 0.31 + sin(vObB.y * 0.7) * 1.6) + 0.25 * sin(vObB.x * 0.13 - vObB.y * 0.5);',
          'vec3 col = mix(uK, uA, clamp(n, 0.0, 1.0));',
          'float ser = smoothstep(0.72, 1.0, sin(vObB.x * 0.55 + vObB.y * 1.9 + sin(vObB.x * 0.11) * 3.0));',
          'col = mix(col, vec3(0.92, 0.99, 1.0), ser * 0.35);',
          'float c1 = abs(sin(vObB.x * 0.42 + sin(vObB.y * 1.1 + vObB.x * 0.2) * 2.2));',
          'float c2 = abs(sin(vObB.y * 1.3 - vObB.x * 0.18 + sin(vObB.x * 0.5) * 1.4));',
          'float cat = max(smoothstep(0.05, 0.0, c1), smoothstep(0.04, 0.0, c2) * step(0.3, sin(vObB.x * 0.37 + 1.0)));',
          'col = mix(col, vec3(0.96, 1.0, 1.0), cat * 0.55);',
          'col = mix(col, uKn, smoothstep(0.55, 0.98, e));',
          'float yan = pow(max(0.0, sin(vObB.x * 1.6 + sin(vObB.y * 0.9) * 0.6)), 10.0) * smoothstep(0.9, 0.2, e);',
          'vec3 ton = 0.5 + 0.5 * cos(6.2832 * (floor(vObB.x * 0.255) * 0.29 + vec3(0.0, 0.33, 0.67)));',
          'col += ton * yan * uRen * (0.55 + 0.35 * sin(uT * 2.0 + vObB.x));',
          'diffuseColor.rgb = col;'].join('\n'))
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * 0.22;');
    };
    m.customProgramCacheKey = () => 'obBuz1';
    const mesh = new T.Mesh(g, m);
    ctx.ekle(mesh);
    return mesh;
  }

  // ═══════════════════════════ 22 · KARLI KÖY ═══════════════════════════
  DY_EK[22] = {
    palet: {
      ad: 'Karlı Köy', gece: 0,
      sisRenk: 0xdcd6f0, sisYogun: 0.0036, arka: 0xd8d2ee,
      gok: [0xffd6e2, 0xf2bcd8, 0xc8b4ec, 0x8aa2e2, 0x4462bc], gunesPos: [58, 21], gunesRenk: 0xfff0e0,
      ykUst: 0xeef0ff, ykAlt: 0x9a96c4, ykGuc: 1.12, gnRenk: 0xfff0e2, gnGuc: 1.85, arkaRenk: 0xffbcd8, arkaGuc: 0.5,
      dag: [[0x8a94d0, 0xdcd6f0], [0x7484c4, 0xcfcaea], [0x6070b4, 0xc4c0e4]],
      tepe: [0xc8cef0, 0xf8f9ff, 0xb4bae4, 0xe2e4f8],
      agac: [[0x1e5848, 0x3a8466], [0x245e4e, 0x488e70], [0x1a4c42, 0x347a60]],
      zemin: [0xf2f4ff, 0xaeb6e6, 0xd2d4f2], cimen: [0xbcc4e8, 0xffffff, 0xeef0ff],
      cicek: [[0xd8384a, 0xff6c7c], [0xffb830, 0xffe08a], [0x3a7ad0, 0x8cc4ff], [0xffffff, 0xffffff]],
      sisSerit: [0xf2f0ff, 0xe0dcf4], siluet: [0x3e4c78, 0x6a78a8]
    },
    secenek: {
      agacTur: 'cam', agacMeyveYok: true, caliYok: true, tepeCicekYok: true,
      cicekYok: true, cimenYok: true, mantarSusYok: true, zeminDesen: 'kar', zeminParlak: 0.04,
      dagKarli: true, kulubeYok: true, degirmenYok: true, piknikTur: 'yok', citYok: true,
      bayrakRenk: [0xd8384a, 0xffffff, 0x2e8a5a, 0xffc040, 0x3a7ad0],
      ucusanTur: 'kar', bulutRenk: [0xe6e2f4, 0xffffff], gunesGuc: 0.8
    },
    yardimci: {
      mantar: { sapka: [0xc8283c, 0xff5a64], govde: [0xe6e8f6, 0xffffff], benek: 0xffffff },
      bulut: { alt: 0xdde2f6, ust: 0xffffff, yanak: 0xffa0b8 },
      nilufer: { yaprak: [0x9ac8e8, 0xe4f4ff], cicek: [0xffffff, 0xe8f0ff], halka: 0xd4ecff },
      ruzgar: { renk: [0xb8d8ff, 0xffffff], ok: 0xffffff },
      halka: { renk: [0x2e7a52, 0x5aae7a], emissive: 0x103a24, cicek: [[0xd8384a, 0xff6c7c], [0xffc040, 0xffe890]] },
      baloncuk: { renk: 0xe4f2ff, kenar: 0xffffff },
      esinti: { tur: 'kar', renk: 0x7484e6, taneRenk: [0x8a90f0, 0xb4b8ff, 0xffffff] }
    },
    kur(ctx) {
      const { T, hx } = ctx, ara = ctx.ara, R = ctx.R;
      const S = ctx.yapi(), L = ctx.yapi(), A = obKis(ctx, S, L);
      const bacalar = [], pir = [];
      const duvarlar = [0xc8483c, 0xe0a048, 0x4a86b0, 0xf0e2c8, 0x7a9a5a, 0xd87a8a];
      const catilar = [0x6a3a30, 0x5a3e5a, 0x3a4a6a];
      // Orta katman köy evleri (bütün parkur boyunca, iki sıra)
      let i = 0;
      for (let x = -34; x < hx + 40; x += ara(9, 13)) {
        const z = (i % 2) ? ara(-22, -27) : ara(-15, -18), k = (i % 2) ? ara(1.25, 1.5) : ara(1.0, 1.2);
        bacalar.push(A.ev(x, z, k, duvarlar[i % duvarlar.length], catilar[i % catilar.length]));
        // ev yanında çam
        if (R() < 0.7) A.cam(x + ara(2.4, 3.2) * k * (R() < 0.5 ? -1 : 1), z - ara(1, 2.5), ara(1.0, 1.5));
        i++;
      }
      // Uzak tepelerde minik evler ve kilise kulesi
      for (let j = 0; j < 9; j++) {
        const x = -40 + j * (hx + 80) / 8 + ara(-4, 4), z = ara(-48, -58);
        bacalar.push(A.ev(x, z, ara(1.1, 1.4), duvarlar[(j + 2) % duvarlar.length], catilar[j % catilar.length]));
      }
      {
        const x = hx * 0.55, z = -52, y = A.tY(x, z), k = 1.6;
        S.ekle(ctx.G.kutu, x, y + 2 * k, z, 2.6 * k, 4 * k, 2.6 * k, 0xd8d0e6, 0xfff8f0);
        S.ekle(ctx.G.kutu, x, y + 5.2 * k, z, 1.3 * k, 2.4 * k, 1.3 * k, 0xd8d0e6, 0xfff8f0);
        S.ekle(ctx.G.koni4, x, y + 7.6 * k, z, 1.1 * k, 2.4 * k, 1.1 * k, 0x5a4a7a, 0xeef0ff, 0, PI / 4, 0);
        S.ekle(ctx.G.koni4, x, y + 4.75 * k, z, 2.1 * k, 1.5 * k, 2.1 * k, 0x5a4a7a, 0xeef0ff, 0, PI / 4, 0);
        L.ekle(ctx.G.kureK, x, y + 5.4 * k, z + 0.66 * k, 0.34 * k, 0.4 * k, 0.05, 0xffb040, 0xffe8a0);
        for (const q of [-1, 1]) L.ekle(ctx.G.kutu, x + q * 0.7 * k, y + 1.8 * k, z + 1.31 * k, 0.4 * k, 1.0 * k, 0.04, 0xff9a30, 0xffe08a);
        S.ekle(ctx.G.kureK, x, y + 8.9 * k, z, 0.14 * k, 0.14 * k, 0.14 * k, 0xffc840, 0xfff0a0);
      }
      // Orta-arka çamlar (köy çevresi)
      for (let x = -30; x < hx + 35; x += ara(3, 6)) {
        const z = ara(-10, -13.5);
        if (R() < 0.55) A.cam(x, z, ara(0.8, 1.3));
        else A.yigin(x, z, ara(0.9, 1.6), ara(0.35, 0.6), ara(0.7, 1.0));
      }
      // Yakın arka: kardan adamlar, çitler, fenerler, kızaklar, kar yığınları
      const adamX = [-7, hx * 0.22, hx * 0.42, hx * 0.63, hx * 0.82, hx + 8];
      const atkilar = [[0xd8384a, 0xff6a78], [0x2e8a5a, 0x5ac08a], [0x3a6ad0, 0x7aaaff], [0xe8a020, 0xffd060], [0x9a4ac8, 0xd090ff], [0xd8384a, 0xff6a78]];
      adamX.forEach((x, j) => A.kardanAdam(x, -ara(5, 7.5), ara(0.95, 1.2), atkilar[j], j % 2 ? 'bere' : 'silindir', ara(-0.35, 0.35)));
      for (let x = -16; x < hx + 22; x += ara(11, 16)) { const L0 = ara(4, 7); A.cit(x, x + L0, -8.6, 1); }
      for (let x = -11; x < hx + 20; x += ara(12, 15)) A.fener(x, -3.6, 1.05);
      A.kizak(hx * 0.22 + 1.6, -4.6, 1.0, null, 0.4);
      A.kizak(hx * 0.7 - 2, -3.2, 0.9, [0x2e6ad0, 0x6aa0ff], -0.3);
      // kısa, kıvrık kızak izleri (kızakların arkasında)
      A.kizakIzi(hx * 0.22 - 8, hx * 0.22 + 1, -4.4, 1.2, 0.5);
      A.kizakIzi(hx * 0.7 - 11, hx * 0.7 - 2.5, -3.2, 1.0, 2.2);
      for (let x = -24; x < hx + 30; x += ara(2.2, 4)) {
        const z = ara(-2.6, -9);
        if (Math.abs(x) < 3 && z > -4) continue;
        if (R() < 0.75) A.yigin(x, z, ara(0.4, 1.1), ara(0.18, 0.42), ara(0.35, 0.7));
        else if (Math.abs(x - hx) > 6) A.kaya(x, z, ara(0.5, 0.9));
      }
      // Ön katman: alçak kar yığınları ve minik çam fidanları
      for (let x = -20; x < hx + 26; x += ara(1.6, 3.2)) {
        if (Math.abs(x) < 3.2) continue;
        const z = ara(1.4, 3.8);
        if (R() < 0.25 && Math.abs(x - hx) > 3) A.cam(x, z, ara(0.3, 0.38));
        else A.yigin(x, z, ara(0.5, 1.2), ara(0.14, 0.3), ara(0.35, 0.6));
      }
      // En ön (dikey ekranda alt kısım): kar dalgaları, fidanlar, kızak izi
      for (let x = -22; x < hx + 26; x += ara(1.8, 3.2)) {
        const z = ara(5, 14), r = R();
        if (r < 0.4) { A.cam(x, z, ara(0.32, 0.46)); A.yigin(x + 0.5, z + 0.3, 0.9, 0.25, 0.6); }
        else if (r < 0.52) A.kaya(x, z, ara(0.5, 0.9));
        else A.yigin(x, z, ara(0.9, 2.2), ara(0.25, 0.5), ara(0.6, 1.2));
      }
      for (const x of [hx * 0.3, hx * 0.75]) A.kardanAdam(x, 9.5, 0.55, [0x2e8a5a, 0x5ac08a], 'bere', 0.2);
      // Bilbo'nun sıcak battaniyesi + fener; önünde minik kardan adam, kızak, fidanlar
      A.battaniye(hx);
      A.kardanAdam(hx + 3.9, 2.9, 0.5, [0xe8a020, 0xffd060], 'bere', -0.3);
      A.kizak(hx - 3.6, 3.0, 0.7, null, -0.2);
      A.kardanAdam(hx - 1.5, 2.6, 0.32, [0xd8384a, 0xff6a78], 'bere', 0.3); A.yigin(hx + 1.7, 2.5, 0.7, 0.28, 0.45); A.yigin(hx + 0.4, 3.3, 0.9, 0.3, 0.5);
      for (const [ox, oz] of [[-5.2, 4.2], [5.6, 4.6], [-2.4, 5.4], [2.8, 6.2]]) { A.cam(hx + ox, oz, 0.34); A.yigin(hx + ox + 0.4, oz + 0.2, 0.8, 0.3, 0.5); }
      // Yerde kar pırıltıları
      for (let j = 0; j < 46; j++) pir.push([ara(-14, hx + 18), ara(0.06, 0.3), ara(-7, 3.6), ara(0.16, 0.3)]);
      pir.forEach((p) => { if (Math.abs(p[0] - hx) < 2.5 && p[2] > -1.4) p[2] = -2.2; });

      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0, { emissive: 0x6a6898, emissiveIntensity: 0.12 })));
      ctx.ekle(new T.Mesh(L.geo(), obParlak(ctx)));
      obDumanKur(ctx, bacalar);
      obPirilKur(ctx, pir);
    },
    guncelle(t, dt, ctx) {
      obDumanGuncelle(t, ctx.veri);
      obPirilGuncelle(t, ctx.veri);
    }
  };

  // ═══════════════════════════ 27 · BUZUL GÖLÜ ═══════════════════════════
  DY_EK[27] = {
    palet: {
      ad: 'Buzul Gölü', gece: 0,
      sisRenk: 0x9ccfee, sisYogun: 0.0026, arka: 0x98ccec,
      gok: [0xc8f0ff, 0x8cd8f4, 0x5cbcee, 0x2e8ee0, 0x1458c0], gunesPos: [54, 26], gunesRenk: 0xfffbe6,
      ykUst: 0xd8f0ff, ykAlt: 0x4a7cb0, ykGuc: 0.98, gnRenk: 0xfff6e6, gnGuc: 1.6, arkaRenk: 0x7ae0ff, arkaGuc: 0.6,
      dag: [[0x2e74b4, 0x9ccfee], [0x2864a8, 0x92c6ea], [0x1e5698, 0x88bce4]],
      tepe: [0x78b4de, 0xd4ecfa, 0x5e9ccc, 0xa8d2ee],
      agac: [[0x2a7a8a, 0x5ab4c4], [0x34889a, 0x6ac4d4], [0x226a7a, 0x4aa4b4]],
      zemin: [0xe2f4fe, 0x82bce2, 0xa8d4ee], cimen: [0xa0cce6, 0xffffff, 0xe0f4ff],
      cicek: [[0x48c8e0, 0xb4f4ff], [0xffffff, 0xffffff], [0x8ab0ff, 0xd0e0ff], [0xffd060, 0xfff0b0]],
      sisSerit: [0xc8e8fa, 0xa8d8f4], siluet: [0x245878, 0x4886aa]
    },
    secenek: {
      agacYok: true, caliYok: true, tepeCicekYok: true, cicekYok: true, cimenYok: true, mantarSusYok: true,
      zeminDesen: 'kar', zeminParlak: 0.02, dagYukseklik: 1.25,
      kulubeYok: true, degirmenYok: true, piknikTur: 'yok', citYok: true, onSiluetYok: true,
      bayrakRenk: [0x2e8ad8, 0xffffff, 0x4ad0e0, 0xffc040],
      ucusanTur: 'kar', bulutSay: 8, bulutRenk: [0xc4e4f8, 0xffffff],
      suRenk: [0x38b8cc, 0xa8f0f4]
    },
    yardimci: {
      mantar: { sapka: [0x2a8ad0, 0x8ad8ff], govde: [0xe0eef8, 0xffffff], benek: 0xffffff },
      bulut: { alt: 0xd6eef8, ust: 0xffffff, yanak: 0xffb0c8 },
      nilufer: { halka: 0x0e6a9a, emissive: 0x0a4a70 },
      ruzgar: { renk: [0xa8e8ff, 0xffffff], ok: 0xffffff },
      halka: { renk: [0x5ac8ec, 0xe0fbff], emissive: 0x2a90c0, cicek: [[0xffffff, 0xffffff], [0x9ae8ff, 0xe0fbff]] },
      baloncuk: { renk: 0xffb8e4, kenar: 0xff4fa8, opaklik: 1.5 },
      esinti: { tur: 'kar', renk: 0xffffff }
    },
    yardimciKur: {
      // Nilüfer yerine yüzen buz parçası (üstü karlı, gülen yüzlü)
      nilufer(N, i, ctx) {
        const { T, G } = ctx, S = ctx.yapi(), OG = obGeo();
        S.ekle(OG.kesik, 0, -0.04, 0, 1.85, 0.3, 1.45, 0x064a7a, 0x2aa8d4, 0, 0.3 + i, 0);
        S.ekle(OG.kesik, 0, 0.12, 0, 1.62, 0.03, 1.27, 0x5ad0ec, 0xa8f0fc, 0, 0.3 + i, 0);
        S.ekle(G.halka, 0, 0.12, 0, 1.7, 1.32, 0.9, 0x0a5a8c, 0x1a86b8, PI / 2, 0, 0);
        S.ekle(G.kubbe, -0.45, 0.1, -0.35, 0.8, 0.12, 0.55, 0xd4ecfa, 0xffffff, 0, 0.3 + i, 0);
        // pembe parıltılı işaret kristali
        S.ekle(OG.altigen, 0.55, 0.42, -0.25, 0.17, 0.6, 0.17, 0xff4fa8, 0xffa8d8, 0, 0.4, -0.15);
        S.ekle(OG.altiKoni, 0.6, 0.83, -0.25, 0.17, 0.3, 0.17, 0xffa8d8, 0xffffff, 0, 0.4, -0.15);
        S.ekle(OG.altigen, 0.85, 0.3, -0.05, 0.11, 0.38, 0.11, 0xff6ab8, 0xffc4e4, 0, 0.2, -0.45);
        S.ekle(OG.altigen, -0.95, 0.42, -0.45, 0.16, 0.7, 0.16, 0x7ad8f0, 0xf0fdff, 0.15, 0, 0.25);
        S.ekle(OG.altiKoni, -1.04, 0.84, -0.4, 0.16, 0.26, 0.16, 0xd8f8ff, 0xffffff, 0.15, 0, 0.25);
        S.ekle(OG.altigen, -0.68, 0.3, -0.62, 0.11, 0.45, 0.11, 0x7ad8f0, 0xf0fdff, -0.2, 0, -0.3);
        S.ekle(OG.altiKoni, -0.6, 0.58, -0.66, 0.11, 0.18, 0.11, 0xd8f8ff, 0xffffff, -0.2, 0, -0.3);
        for (const q of [-1, 1]) {
          S.ekle(G.kure, q * 0.32, 0.1, 1.33, 0.1, 0.13, 0.06, 0x1a3a5a, 0x24486a);
          S.ekle(G.kureK, q * 0.32 - 0.03, 0.15, 1.38, 0.035, 0.035, 0.02, 0xffffff, 0xffffff);
          S.ekle(G.kure, q * 0.6, 0.03, 1.24, 0.12, 0.06, 0.05, 0xff9ab4, 0xffb4c8);
        }
        for (let k = 0; k < 7; k++) { const a = (k - 3) * 0.2; S.ekle(G.kureK, Math.sin(a) * 0.2, 0.02 - Math.cos(a) * 0.06 + 0.04, 1.4, 0.035, 0.03, 0.025, 0x1a3a5a, 0x1a3a5a); }
        return new T.Mesh(S.geo(), ctx.malz(true, true, 0.3, { roughness: 0.25, emissive: 0x2a5a8a, emissiveIntensity: 0.16 }));
      }
    },
    kur(ctx) {
      const { T, G, hx, yerY } = ctx, ara = ctx.ara, R = ctx.R;
      const S = ctx.yapi(), L = ctx.yapi(), I = ctx.yapi(), A = obKis(ctx, S, L, { KG: 0xa4d0ec }), E = obKisEk(ctx, S, L, A, I);
      const pir = [];
      const dx0 = ctx.dere.var ? ctx.dere.x0 : 12, dx1 = ctx.dere.var ? ctx.dere.x1 : Math.min(hx - 14, 42);
      const gx = (dx0 + dx1) / 2, ghw = (dx1 - dx0) / 2 + 2.5;
      // Donmuş turkuaz göl (oyun düzleminin önünden arkasına)
      obBuzYuzey(ctx, gx, -2.4, ghw, 5.6, { koyu: 0x1288b4, acik: 0x6cd4ea, kenar: 0xd8f0fc });
      // buz parçalarının çevresinde koyu açık su halkası (beyaz buzda seçilsinler)
      (ctx.bolum && Array.isArray(ctx.bolum.niluferler) ? ctx.bolum.niluferler : []).forEach((N) => {
        const sc = (N.r || 1.8) / 1.8;
        S.ekle(G.kubbe, N.x, 0.09, 0.1, 2.35 * sc, 0.012, 1.8 * sc, 0x0a4a78, 0x0a4a78);
        S.ekle(G.kubbe, N.x, 0.085, 0.1, 2.75 * sc, 0.012, 2.15 * sc, 0x2a90c0, 0x2a90c0);
      });
      // Göl kıyısı: kar setleri ve buz kırıntıları
      for (let x = dx0 - 3; x < dx1 + 3; x += ara(1.6, 2.6)) {
        A.yigin(x, -8.4 + ara(-0.3, 0.3), ara(1.0, 1.8), ara(0.3, 0.55), ara(0.6, 0.9));
        if (R() < 0.35) E.buzKaya(x + ara(-0.5, 0.5), -7.6, ara(0.3, 0.5), null, 0.02);
      }
      for (const q of [-1, 1]) {
        const ex = q < 0 ? dx0 - 2.6 : dx1 + 2.6;
        for (let j = 0; j < 4; j++) A.yigin(ex + q * ara(0, 1.2), -6 + j * 2.4, ara(0.7, 1.2), ara(0.25, 0.4), ara(0.6, 1.0));
      }
      // Uzakta buzul duvarı: üst üste binen turkuaz buz sütunları, sivri tepeler, kar saçak
      for (let x = -80; x < hx + 90; x += ara(1.8, 2.8)) {
        const z = -70 + ara(-3, 3), h = ara(11, 19) * (0.85 + 0.25 * Math.sin(x * 0.045 + 1)), w = ara(2.6, 4.4), dz = ara(3, 5);
        I.ekle(obGeo().kesik, x, h / 2 - 3, z, w, h, dz, 0x1462a8, 0xc8eeff, 0, ara(0, 3), ara(-0.05, 0.05));
        if (R() < 0.6) I.ekle(G.koni4, x + ara(-0.6, 0.6), h - 3 + ara(0.6, 1.6), z, w * 0.55, ara(1.6, 3.4), dz * 0.5, 0xb8e8fa, 0xffffff, 0, ara(0, 1.5), ara(-0.15, 0.15));
        else S.ekle(G.kureO, x, h - 3.1, z, w * 0.62, ara(0.5, 0.9), dz * 0.55, 0xd4e8f6, 0xffffff);
      }
      // Orta katman: buzdağları ve dev buz kristalleri
      const bx = hx * 0.55, bz = -36;
      for (let x = -40; x < hx + 45; x += ara(5, 9)) {
        const z = ara(-18, -34);
        if (Math.abs(x - bx) < 8) continue;
        if (R() < 0.55) E.buzKaya(x, z, ara(1.6, 3.2));
        else E.kristal(x, z, ara(1.6, 2.6));
        if (R() < 0.3) A.yigin(x + ara(-3, 3), z + ara(1, 3), ara(2, 4), ara(0.5, 1.1), ara(1.2, 2));
      }
      // Tepelerin üstünde sivri buz kuleleri
      for (let x = -50; x < hx + 60; x += ara(10, 16)) {
        const z = ara(-48, -62), y = A.tY(x, z), h = ara(5, 9);
        I.ekle(obGeo().altigen, x, y + h * 0.4, z, ara(0.9, 1.4), h * 0.8, ara(0.9, 1.4), 0x4aa4d4, 0xe4f8ff, 0, R(), ara(-0.1, 0.1));
        I.ekle(obGeo().altiKoni, x, y + h * 0.8 + 0.8, z, 1.2, 2.2, 1.2, 0xc4ecfa, 0xffffff, 0, R(), 0);
      }
      // Yakın arka: kristal kümeleri, buz kayaları, kar yığınları (gölün arkasında ve kıyılarda)
      for (let x = -22; x < hx + 26; x += ara(4, 7)) {
        const z = ara(-9.5, -12.5);
        if (R() < 0.5) E.kristal(x, z, ara(0.8, 1.3));
        else E.buzKaya(x, z, ara(0.7, 1.2));
      }
      for (let x = -20; x < hx + 24; x += ara(2.2, 3.8)) {
        const z = ara(-3, -8);
        if (x > dx0 - 2 && x < dx1 + 2) continue;
        if (Math.abs(x) < 3 && z > -4) continue;
        if (R() < 0.6) A.yigin(x, z, ara(0.5, 1.2), ara(0.2, 0.45), ara(0.4, 0.8));
        else if (R() < 0.5) E.kristal(x, z, ara(0.35, 0.6));
        else E.buzKaya(x, z, ara(0.35, 0.6));
      }
      // Göl üstünde donmuş küçük buz parçaları (arka yarıda)
      for (let j = 0; j < 10; j++) { const x = ara(dx0 + 1, dx1 - 1), z = ara(-5.5, -7.2); E.buzKaya(x, z, ara(0.2, 0.35), [0x6ac8e4, 0xf0fcff], 0.04); }
      // Foklar ve iglo
      E.fok(dx1 + 4.5, -4.2, 0.9, -0.3);
      E.fok(dx0 - 4.5, -5.5, 0.8, 0.5);
      E.fok(gx + 2, -6.6, 0.7, 0.2, 0.08);
      E.iglo(hx + 6, -6.5, 1.0);
      // Ön katman: alçak kar dalgaları, buz parçaları, minik kristaller
      for (let x = -20; x < hx + 26; x += ara(1.6, 3.0)) {
        if (Math.abs(x) < 3.2 || Math.abs(x - hx) < 3) continue;
        const z = ara(1.6, 3.9);
        if (x > dx0 - 1 && x < dx1 + 1 && z < 3.5) continue;
        if (R() < 0.3) E.buzKaya(x, z, ara(0.2, 0.32));
        else A.yigin(x, z, ara(0.5, 1.2), ara(0.14, 0.28), ara(0.35, 0.6));
      }
      for (let x = -22; x < hx + 26; x += ara(1.8, 3.2)) {
        const z = ara(5, 14), r = R();
        if (r < 0.4) E.kristal(x, z, ara(0.35, 0.55));
        else if (r < 0.7) E.buzKaya(x, z, ara(0.4, 0.75));
        else A.yigin(x, z, ara(0.9, 1.8), ara(0.35, 0.6), ara(0.6, 1.0));
      }
      // En ön kenar (dikey ekranın altı): kar setleri ve buz kristalleri
      for (let x = -26; x < hx + 30; x += ara(2.0, 3.0)) {
        const z = ara(16, 20);
        A.yigin(x, z, ara(1.6, 2.8), ara(0.7, 1.1), ara(1.0, 1.5));
        if (R() < 0.55) E.kristal(x + ara(-0.8, 0.8), z + ara(-0.5, 0.8), ara(0.5, 0.8));
        else E.buzKaya(x + ara(-0.8, 0.8), z + 0.6, ara(0.5, 0.8));
      }
      // Bilbo'nun yeri: mavi-beyaz battaniye + fener; önünde buz kristalleri ve kar setleri
      A.battaniye(hx, [0x2e6ad0, 0xf4f8ff]);
      for (const [ox, oz] of [[-4.2, 3.0], [4.4, 3.4], [-2.2, 5.6], [2.6, 6.2], [-5.8, 5.2], [6.2, 5.6]]) { E.kristal(hx + ox, oz, 0.42); A.yigin(hx + ox + 0.5, oz + 0.3, 1.0, 0.35, 0.6); }
      E.kristal(hx + 1.7, 2.5, 0.3); A.yigin(hx - 1.4, 2.6, 0.8, 0.3, 0.5); E.buzKaya(hx - 0.3, 3.3, 0.25);
      // Penguenler: biri gölde karnı üstünde kayar, diğerleri kıyıda sallanır ve yürür
      const pg = [
        { tur: 'kay', a: dx0 + 1, b: dx1 - 2, z: -3.4, k: 1.3, ph: 0, y: 0.07 },
        { tur: 'kay', a: dx1 - 1, b: dx0 + 3, z: -5.4, k: 1.1, ph: 3.4, y: 0.07 },
        { tur: 'dur', x: dx0 - 2.2, z: -2.8, k: 1.35, ph: 0.5, ry: 0.4 },
        { tur: 'dur', x: dx0 - 3.5, z: -3.9, k: 1.0, ph: 1.7, ry: 0.6 },
        { tur: 'yuru', x: dx1 + 2.8, z: -2.8, k: 1.25, ph: 2.0, a: 1.4 },
        { tur: 'dur', x: hx + 4.6, z: -3.6, k: 1.15, ph: 0.9, ry: -0.5 },
        { tur: 'yuru', x: hx * 0.4, z: 7.5, k: 1.0, ph: 1.1, a: 1.2 },
        { tur: 'dur', x: hx * 0.62, z: 10, k: 1.1, ph: 2.2, ry: 0.3 },
        { tur: 'dur', x: -6.5, z: -3.6, k: 1.2, ph: 2.6, ry: 0.3 },
        { tur: 'yuru', x: hx * 0.82, z: -4.2, k: 1.15, ph: 4.0, a: 1.6 },
        { tur: 'dur', x: hx * 0.82 + 1.2, z: -4.9, k: 0.8, ph: 1.3, ry: -0.3 }
      ];
      obPenguenKur(ctx, pg);
      // Uzakta açık su ve ara sıra suya dalan balina kuyruğu
      {
        const by = yerY(bx, bz);
        S.ekle(G.daireY, bx, by + 0.12, bz, 7, 1, 2.8, 0x0c4a7c, 0x0c4a7c);
        S.ekle(G.daireY, bx, by + 0.1, bz, 7.8, 1, 3.3, 0x3aa8d8, 0x3aa8d8);
        for (let j = 0; j < 14; j++) { const a = j / 14 * PI * 2; if (Math.sin(a) > 0.6) continue; A.yigin(bx + Math.cos(a) * 7.9, bz + Math.sin(a) * 3.3, ara(1.0, 1.6), 0.5, 0.7, by); }
        const K = ctx.yapi(), D = [0x22406e, 0x4a72aa];
        K.ekle(G.kureO, 0, 1.0, 0, 0.42, 1.3, 0.36, D[0], D[1]);
        for (const q of [-1, 1]) K.ekle(G.kureO, q * 0.95, 2.35, 0, 1.15, 0.36, 0.16, D[0], 0x7a9ad0, 0, 0, -q * 0.38);
        K.ekle(G.kureK, 0, 2.15, 0, 0.3, 0.3, 0.2, D[0], D[1]);
        const kuy = new T.Mesh(K.geo(), ctx.malz(true, true, 0.2, { roughness: 0.4, emissive: 0x10203a, emissiveIntensity: 0.2 }));
        kuy.position.set(bx, by - 3, bz); kuy.scale.setScalar(1.3); ctx.ekle(kuy);
        ctx.veri.balina = { m: kuy, y0: by };
      }
      // Güneş pırıltıları: gölde yoğun, karda seyrek
      for (let j = 0; j < 44; j++) pir.push([ara(dx0 - 1, dx1 + 1), ara(0.12, 0.2), ara(-7.5, 3), ara(0.22, 0.42)]);
      for (let j = 0; j < 22; j++) pir.push([ara(-14, hx + 18), ara(0.08, 0.25), ara(-8, 3.5), ara(0.15, 0.28)]);
      pir.forEach((p) => { if (Math.abs(p[0] - hx) < 2.5 && p[2] > -1.4) p[2] = -2.2; });

      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0, { emissive: 0x5a8ab0, emissiveIntensity: 0.12 })));
      ctx.ekle(new T.Mesh(I.geo(), ctx.malz(true, true, 0.25, { roughness: 0.2, metalness: 0.06, emissive: 0x2a8ab0, emissiveIntensity: 0.28 })));
      ctx.ekle(new T.Mesh(L.geo(), obParlak(ctx)));
      obPirilKur(ctx, pir, 0xfffbe8);
    },
    guncelle(t, dt, ctx) {
      obPirilGuncelle(t, ctx.veri);
      obPenguenGuncelle(t, ctx);
      const b = ctx.veri.balina;
      if (b) {
        const u = (t % 11) / 11, c = u < 0.45 ? Math.sin((u / 0.45) * PI) : 0;
        b.m.position.y = b.y0 - 3.4 + c * 3.2;
        b.m.rotation.set(0, 0.2, Math.sin(t * 1.3) * 0.12 * c);
      }
    }
  };

  // ═══════════════════════════ 35 · KIŞ GECESİ ŞENLİĞİ (BÜYÜK FİNAL) ═══════════════════════════
  DY_EK[35] = {
    palet: {
      ad: 'Kış Gecesi Şenliği', gece: 1,
      sisRenk: 0x262a60, sisYogun: 0.0038, arka: 0x24285c,
      gok: [0x4a3c8c, 0x30307e, 0x22246a, 0x161a50, 0x0a0c2e], gunesPos: [62, 27], gunesRenk: 0xfff6dc,
      ykUst: 0x8c9ce0, ykAlt: 0x3a3466, ykGuc: 1.15, gnRenk: 0xc8d4ff, gnGuc: 1.6, arkaRenk: 0xffb868, arkaGuc: 0.7,
      dag: [[0x3e4686, 0x262a60], [0x343c78, 0x22264e], [0x2a326a, 0x1e2246]],
      tepe: [0x7480c4, 0xb4c0ec, 0x56629c, 0x8692c8],
      agac: [[0x174640, 0x2a7462], [0x1c4e46, 0x337e6a], [0x143c38, 0x266656]],
      zemin: [0xd0d8f8, 0x8290cc, 0x98a4d8], cimen: [0x8a98d0, 0xe8eeff, 0xc8d2f4],
      cicek: [[0xffc840, 0xfff0a0], [0xff4a6a, 0xff9aa8], [0x4ae08a, 0xa8ffc8], [0x5aa8ff, 0xb8dcff], [0xd070ff, 0xf0c0ff]],
      sisSerit: [0x343a7c, 0x282c66], siluet: [0x10162e, 0x1c2648]
    },
    secenek: {
      agacTur: 'cam', agacMeyveYok: true, caliYok: true, tepeCicekYok: true, cicekYok: true, cimenYok: true, mantarSusYok: true,
      zeminDesen: 'kar', zeminParlak: 0.2, dagKarli: true, aurora: true, yildizlar: true,
      kulubeYok: true, degirmenYok: true, piknikTur: 'yok', citYok: true, kusYok: true,
      bayrakRenk: [0xff4a6a, 0xffc840, 0x4ae08a, 0x5aa8ff, 0xd070ff],
      ucusanTur: 'kar', bulutSay: 6, bulutRenk: [0x3a3c7a, 0x6a6ca8]
    },
    yardimci: {
      mantar: { sapka: [0xc8203a, 0xff5262], govde: [0xe8e4f4, 0xffffff], benek: 0xffffff },
      bulut: { alt: 0x9aa0dc, ust: 0xf0f2ff, yanak: 0xff9ac0, emissive: 0x2a2c66 },
      nilufer: { yaprak: [0x9ac8e8, 0xe4f4ff], cicek: [0xffffff, 0xe8f0ff] },
      ruzgar: { renk: [0xffe8a0, 0xfff8e0], emissive: 0x806020, ok: 0xfff4c0 },
      halka: { renk: [0x1e6a4a, 0x3aa070], emissive: 0x0e3a26, cicek: [[0xffc840, 0xfff0a0], [0xff4a6a, 0xffa0b0], [0x5aa8ff, 0xc0e0ff]] },
      baloncuk: { renk: 0xe0f0ff, kenar: 0xffffff, opaklik: 1.1 },
      esinti: { tur: 'isik', renk: 0xfff0c0, taneRenk: [0xffe08a, 0xfff4c8, 0xffc0d0] }
    },
    kur(ctx) {
      const { T, G, hx, yerY } = ctx, ara = ctx.ara, R = ctx.R;
      const S = ctx.yapi(), L = ctx.yapi(), A = obKis(ctx, S, L, { KG: 0xa4aee4 }), E = obKisEk(ctx, S, L, A);
      const RENK = [0xff4a6a, 0xffc840, 0x4ae08a, 0x5aa8ff, 0xd070ff, 0xff9a40];
      const bacalar = [], pir = [];
      const hRenk = [0xd8283c, 0x2e8a5a, 0x3a6ad0, 0xe8a020, 0x9a4ac8, 0xf0f0f8];
      const duvarlar = [0xc8483c, 0xe0a048, 0x4a86b0, 0xf0e2c8, 0x7a9a5a, 0xd87a8a];
      const catilar = [0x6a3a30, 0x5a3e5a, 0x3a4a6a];
      // Evlerin çatı kenarında ışık dizisi + kapıda çelenk
      const evSus = (x, y, z, w, h, d, rise, on) => {
        const k = w / 3.0, zz = on + 0.32 * k;
        E.isikDizisi(x - w / 2 - 0.35 * k, y + h + 0.02, x, y + h + rise + 0.3 * k, zz, 0.02, RENK);
        E.isikDizisi(x, y + h + rise + 0.3 * k, x + w / 2 + 0.35 * k, y + h + 0.02, zz, 0.02, RENK);
        S.ekle(G.halka, x, y + 0.95 * k, on + 0.08, 0.22 * k, 0.22 * k, 0.5, 0x1e6a3a, 0x3aa060);
        S.ekle(G.kureK, x, y + 0.75 * k, on + 0.12, 0.09 * k, 0.07 * k, 0.05, 0xd8203a, 0xff5060);
      };
      let i = 0;
      for (let x = -34; x < hx + 40; x += ara(9, 12)) {
        if (Math.abs(x - (hx - 1)) < 7) { i++; continue; }   // büyük çamın yeri boş kalsın
        const z = (i % 2) ? ara(-22, -26) : ara(-15, -17.5), k = (i % 2) ? ara(1.25, 1.5) : ara(1.0, 1.2);
        bacalar.push(A.ev(x, z, k, duvarlar[i % duvarlar.length], catilar[i % catilar.length], null, evSus));
        if (R() < 0.6) A.cam(x + ara(2.4, 3.2) * k * (R() < 0.5 ? -1 : 1), z - ara(1, 2.5), ara(1.0, 1.4), [0x174640, 0x2a7462]);
        i++;
      }
      // Uzak tepelerde ışıklı evler + kilise
      for (let j = 0; j < 10; j++) {
        const x = -40 + j * (hx + 80) / 9 + ara(-4, 4), z = ara(-48, -58);
        bacalar.push(A.ev(x, z, ara(1.1, 1.4), duvarlar[(j + 2) % duvarlar.length], catilar[j % catilar.length]));
      }
      {
        const x = hx * 0.35, z = -52, y = A.tY(x, z), k = 1.6;
        S.ekle(G.kutu, x, y + 2 * k, z, 2.6 * k, 4 * k, 2.6 * k, 0xa8a0c8, 0xe0dcf4);
        S.ekle(G.kutu, x, y + 5.2 * k, z, 1.3 * k, 2.4 * k, 1.3 * k, 0xa8a0c8, 0xe0dcf4);
        S.ekle(G.koni4, x, y + 7.6 * k, z, 1.1 * k, 2.4 * k, 1.1 * k, 0x3a3a6a, 0xeef0ff, 0, PI / 4, 0);
        S.ekle(G.koni4, x, y + 4.75 * k, z, 2.1 * k, 1.5 * k, 2.1 * k, 0x3a3a6a, 0xeef0ff, 0, PI / 4, 0);
        L.ekle(G.kureK, x, y + 5.4 * k, z + 0.66 * k, 0.34 * k, 0.4 * k, 0.05, 0xffb040, 0xffe8a0);
        for (const q of [-1, 1]) L.ekle(G.kutu, x + q * 0.7 * k, y + 1.8 * k, z + 1.31 * k, 0.4 * k, 1.0 * k, 0.04, 0xff9a30, 0xffe08a);
        L.ekle(G.kureK, x, y + 8.9 * k, z, 0.16 * k, 0.16 * k, 0.16 * k, 0xffc840, 0xfff0a0);
      }
      // Büyük süslü çam (Bilbo'nun arkasında) + altında hediyeler
      const tx = hx - 1, tz = -11;
      E.buyukCam(tx, tz, 13, RENK);
      ctx.veri.haleCam = [tx, tz, 13];
      for (let j = 0; j < 9; j++) {
        const a = -1.2 + 2.4 * j / 8, r = ara(3.2, 4.4);
        A.hediye(tx + Math.sin(a) * r, tz + Math.cos(a) * r * 0.8, ara(0.7, 1.2), hRenk[j % hRenk.length], j % 2 ? 0xffd84a : 0xffffff, null, ara(-0.6, 0.6));
      }
      // Meydanı saran ışık dizileri (direkler arasında, oyun düzleminin arkasında)
      const direkler = [];
      for (let x = -14; x < hx + 22; x += ara(7, 9)) direkler.push([x, -8.2 + ara(-0.4, 0.4), ara(3.6, 4.4)]);
      for (let j = 0; j < direkler.length; j++) {
        const [x, z, h] = direkler[j]; direkler[j].push(E.direk(x, z, h));
        if (j > 0) { const p = direkler[j - 1]; E.isikDizisi(p[0], p[3], x, direkler[j][3], (p[1] + z) / 2, 0.9, RENK); }
      }
      // Arka sırada ağaçtan ağaca ışık dizileri (evlerin önünde)
      const ortaCam = [hx * 0.28, hx * 0.6];
      for (const ox of ortaCam) {
        E.buyukCam(ox, -11.5, 7.5, RENK);
        for (let j = 0; j < 4; j++) A.hediye(ox - 2.2 + j * 1.45, -9.6 + (j % 2) * 0.5, ara(0.55, 0.8), hRenk[(j + 2) % hRenk.length], j % 2 ? 0xffd84a : 0xffffff, null, ara(-0.5, 0.5));
      }
      for (let x = -26; x < hx + 30; x += ara(8, 11)) {
        if (ortaCam.some((o) => x > o - 10 && x < o + 4) || (x > tx - 10 && x < tx + 4)) continue;
        const z = ara(-12.5, -13.5), k = ara(1.1, 1.4);
        A.cam(x, z, k, [0x174640, 0x2a7462]);
        A.cam(x + 6.5, z - 0.4, k * 0.9, [0x174640, 0x2a7462]);
        E.isikDizisi(x + 0.6, yerY(x, z) + 3.0 * k, x + 5.9, yerY(x + 6.5, z) + 2.6 * k, z + 0.6, 0.7, RENK);
      }
      // Paten pisti (parlak buz) + kenarında kar seti ve fenerler, üstünde atkılı penguenler
      const rx = hx * 0.42, rz = -6.2;
      obBuzYuzey(ctx, rx, rz, 7.5, 2.6, { koyu: 0x4a64b8, acik: 0x9cb4ec, kenar: 0xe0e6fa, renkli: 1 }, 0.08);
      for (let j = 0; j < 22; j++) {
        const a = j / 22 * PI * 2, x = rx + Math.cos(a) * 7.9, z = rz + Math.sin(a) * 2.9;
        if (Math.sin(a) > 0.55) continue;
        A.yigin(x, z, ara(0.8, 1.2), ara(0.22, 0.32), 0.5);
      }
      for (const q of [-1, 1]) A.fener(rx + q * 8.6, rz + 0.4, 0.95);
      obPenguenKur(ctx, [
        { tur: 'paten', x: rx, z: rz, a: 5.2, b: 1.4, k: 0.85, ph: 0, y: 0.08 },
        { tur: 'paten', x: rx, z: rz, a: 5.2, b: 1.4, k: 0.7, ph: 2.6, y: 0.08 },
        { tur: 'dur', x: rx + 9.6, z: rz - 1.2, k: 0.75, ph: 1.0, ry: -0.5 }
      ], [0xd8283c, 0xff6070]);
      // Kardan adamlar, fenerler, hediyeli kızak
      const adamX = [-7, hx * 0.2, hx * 0.62, hx * 0.8, hx + 8];
      const atkilar = [[0xd8384a, 0xff6a78], [0x2e8a5a, 0x5ac08a], [0x3a6ad0, 0x7aaaff], [0xe8a020, 0xffd060], [0x9a4ac8, 0xd090ff]];
      adamX.forEach((x, j) => A.kardanAdam(x, -ara(4.8, 6.5), ara(0.95, 1.15), atkilar[j], j % 2 ? 'bere' : 'silindir', ara(-0.35, 0.35)));
      for (let x = -11; x < hx + 20; x += ara(10, 13)) { if (Math.abs(x - rx) > 9.5) A.fener(x, -3.6, 1.05); }
      {
        const kx = hx * 0.3, kz = -4.4;
        A.kizak(kx, kz, 1.3, [0xc8203a, 0xff5262], 0.15);
        A.hediye(kx - 0.3, kz, 0.42, 0x3a6ad0, 0xffd84a, yerY(kx, kz) + 0.52, 0.2);
        A.hediye(kx + 0.35, kz + 0.05, 0.36, 0x2e8a5a, 0xffffff, yerY(kx, kz) + 0.52, -0.3);
        A.hediye(kx + 0.05, kz - 0.05, 0.3, 0xe8a020, 0xd8283c, yerY(kx, kz) + 0.9, 0.5);
      }
      for (let x = -16; x < hx + 22; x += ara(14, 18)) { const L0 = ara(4, 6); if (Math.abs(x - rx) > 10) A.cit(x, x + L0, -9.6, 1); }
      // Yakın arka kar yığınları ve hediyeler
      for (let x = -24; x < hx + 30; x += ara(2.4, 4.2)) {
        const z = ara(-2.6, -9.5);
        if (Math.abs(x) < 3 && z > -4) continue;
        if (Math.abs(x - rx) < 8.6 && z < -3.2 && z > -9.2) continue;
        if (R() < 0.82) A.yigin(x, z, ara(0.4, 1.1), ara(0.18, 0.42), ara(0.35, 0.7));
        else A.hediye(x, z, ara(0.45, 0.65), hRenk[Math.floor(R() * hRenk.length)], 0xffd84a, null, ara(-0.6, 0.6));
      }
      // Ön katman: alçak kar dalgaları, minik ışıklı fidanlar
      for (let x = -20; x < hx + 26; x += ara(1.6, 3.2)) {
        if (Math.abs(x) < 3.2 || Math.abs(x - hx) < 3) continue;
        const z = ara(1.4, 3.8);
        if (R() < 0.22) { A.cam(x, z, ara(0.3, 0.36), [0x174640, 0x2a7462]); L.ekle(G.kureC, x, yerY(x, z) + 1.3 * 0.33, z + 0.3, 0.06, 0.06, 0.06, RENK[Math.floor(R() * 6)], 0xffffff, 0, 0, 0, -(0.05 + R() * 0.9)); }
        else A.yigin(x, z, ara(0.5, 1.2), ara(0.14, 0.3), ara(0.35, 0.6));
      }
      for (let x = -22; x < hx + 26; x += ara(1.8, 3.2)) {
        const z = ara(5, 14), r = R();
        if (r < 0.35) {
          const k = ara(0.32, 0.46); A.cam(x, z, k, [0x174640, 0x2a7462]);
          for (let j = 0; j < 4; j++) L.ekle(G.kureC, x + ara(-0.4, 0.4) * k * 2, yerY(x, z) + (1.2 + j * 0.7) * k, z + 0.5 * k, 0.07, 0.07, 0.07, RENK[(j + Math.floor(x)) % 6 < 0 ? 0 : (j + Math.floor(Math.abs(x))) % 6], 0xffffff, 0, 0, 0, -(0.05 + R() * 0.9));
        } else if (r < 0.45) A.hediye(x, z, ara(0.5, 0.8), hRenk[Math.floor(R() * hRenk.length)], 0xffd84a, null, ara(-0.6, 0.6));
        else A.yigin(x, z, ara(0.9, 2.2), ara(0.25, 0.5), ara(0.6, 1.2));
      }
      for (const x of [hx * 0.25, hx * 0.7]) A.kardanAdam(x, 9.5, 0.55, [0xd8384a, 0xff6a78], 'bere', 0.2);
      // Bilbo'nun yeri: sıcak battaniye + fener + hediyeler
      A.battaniye(hx);
      A.hediye(hx - 2.6, -1.6, 0.55, 0xd8283c, 0xffd84a);
      A.hediye(hx + 2.4, -1.9, 0.45, 0x3a6ad0, 0xffffff, null, 0.4);
      for (const [ox, oz, j] of [[-4.0, 3.0, 0], [4.2, 3.2, 1], [-2.2, 5.4, 2], [2.6, 6.0, 3], [-5.8, 5.0, 4], [6.0, 5.4, 5]]) {
        if (j % 2) A.hediye(hx + ox, oz, 0.5, hRenk[j], 0xffd84a, null, 0.3 * j);
        else { A.cam(hx + ox, oz, 0.36, [0x174640, 0x2a7462]); for (let q = 0; q < 5; q++) L.ekle(G.kureC, hx + ox + (q - 2) * 0.13, yerY(hx + ox, oz) + (0.55 + q * 0.2), oz + 0.42 - q * 0.05, 0.06, 0.06, 0.06, RENK[(q + j) % 6], 0xffffff, 0, 0, 0, -(0.05 + R() * 0.9)); }
        A.yigin(hx + ox + 0.5, oz + 0.3, 0.9, 0.3, 0.5);
      }
      A.hediye(hx - 1.5, 2.6, 0.42, 0x2e8a5a, 0xffd84a, null, 0.3); A.hediye(hx + 1.8, 2.4, 0.36, 0x9a4ac8, 0xffffff, null, -0.4); A.yigin(hx + 0.3, 3.2, 0.9, 0.3, 0.5);
      // Karda altın-beyaz pırıltılar
      for (let j = 0; j < 50; j++) pir.push([ara(-14, hx + 18), ara(0.06, 0.3), ara(-9, 3.6), ara(0.16, 0.3)]);
      for (let j = 0; j < 18; j++) pir.push([rx + ara(-6.5, 6.5), 0.16, rz + ara(-2, 2), ara(0.2, 0.34)]);
      pir.forEach((p) => { if (Math.abs(p[0] - hx) < 2.5 && p[2] > -1.4) p[2] = -2.2; });

      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0, { emissive: 0x2a2c5c, emissiveIntensity: 0.22 })));
      // Çam tepelerindeki kar tanelerine ve büyük çama yumuşak ışık hâlesi (tek saydam, toplamalı çizim)
      {
        const H = ctx.yapi();
        for (const [x, y, z, kt] of E.hale) {
          for (const [r, c] of [[2.0, 0x0a0e20], [1.5, 0x10162e], [1.05, 0x182244], [0.7, 0x2a3870]]) H.ekle(obGeo().daire, x, y, z, r * kt * 1.3, r * kt * 1.3, 1, c, c);
        }
        const hm = obParlak(ctx, 1); hm.blending = T.AdditiveBlending; hm.fog = false;
        const hMesh = new T.Mesh(H.geo(), hm); hMesh.renderOrder = -1; ctx.ekle(hMesh);
      }
      ctx.ekle(new T.Mesh(L.geo(), obParlak(ctx)));
      obDumanKur(ctx, bacalar, 0xa8b0d8, 0.42);
      obPirilKur(ctx, pir, 0xfff2c8);
    },
    guncelle(t, dt, ctx) {
      obDumanGuncelle(t, ctx.veri);
      obPirilGuncelle(t, ctx.veri);
      obPenguenGuncelle(t, ctx);
    }
  };
})();
