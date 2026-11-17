/* ortam_d.js - Pırıl'ın Uçuş Okulu: yeni ortamlar (u2-ortam-d)
   24 · Çöl Vahası (bölüm 29) · 28 · Palmiye Kumsalı (bölüm 33) · 34 · Gök Şatosu (bölüm 39)
   Her şey kodla çizilir; süsler birleştirilmiş geometri (dunya.js `ctx.yapi()`), hareketler gölgelendiricide (kare başına bellek yok). */
(function () {
  'use strict';
  window.DY_EK = window.DY_EK || {};
  const PI = Math.PI;

  // ───────── ortak yardımcılar ─────────
  // Yapı kurucusuna köşe sayacı ekle: hareketli nesnelere (faz, merkez) özniteliği vermek için
  function sayacli(ctx) {
    const S = ctx.yapi(), ek = S.ekle;
    let n = 0;
    S.ekle = function (geo) {
      ek.apply(S, arguments);
      const g = geo.userData.dyD; n += g ? g.attributes.position.count : 0;
    };
    S.n = () => n;
    return S;
  }
  // liste: [[ilkKöşe, sonKöşe, mx, my, mz, faz], ...]
  function nesneOz(T, geo, liste) {
    const N = geo.attributes.position.count, f = new Float32Array(N), m = new Float32Array(N * 3);
    for (const [a, b, x, y, z, ph] of liste) for (let i = a; i < b && i < N; i++) { f[i] = ph; m[i * 3] = x; m[i * 3 + 1] = y; m[i * 3 + 2] = z; }
    geo.setAttribute('faz', new T.BufferAttribute(f, 1));
    geo.setAttribute('merk', new T.BufferAttribute(m, 3));
  }
  // dunya malzemesine ek köşe hareketi (kod: `transformed`, `position`, `faz`, `merk`, `uT` kullanabilir)
  function canliMalz(ctx, pbr, kod, isikli) {
    const m = ctx.malz(isikli !== false, true, 0, pbr), ob = m.onBeforeCompile;
    m.onBeforeCompile = (sh, r) => {
      ob(sh, r);
      sh.vertexShader = 'attribute float faz; attribute vec3 merk;\n' + sh.vertexShader.replace('#include <project_vertex>', kod + '\n#include <project_vertex>');
    };
    return m;
  }
  // Çizgili külah dilimi (şemsiye, çadır tepesi): tepe (0,1,0), kenar r=1 y=0, ortası hafif sarkık
  function dilimGeo(T, n) {
    const h = PI / n, s = Math.sin(h), c = Math.cos(h);
    const A = [0, 1, 0], Bp = [-s, 0, c], C = [s, 0, c], M = [0, -0.1, 1.03], O1 = [-s * 0.55, 0.5, c * 0.55], O2 = [s * 0.55, 0.5, c * 0.55], OM = [0, 0.47, 0.58];
    const p = [].concat(A, O1, OM, A, OM, O2, O1, Bp, M, O1, M, OM, OM, M, C, OM, C, O2);
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(p, 3)); g.computeVertexNormals();
    return g;
  }
  // Güneş diski (gök düzleminin hemen önünde, iri ve yumuşak hâleli)
  function gunesDiski(ctx, gx, gy, r, renk, hale, guc) {
    const T = ctx.T, c1 = new T.Color(renk), c2 = new T.Color(hale);
    const m = new T.ShaderMaterial({
      transparent: true, depthWrite: false, fog: false,
      uniforms: { uT: ctx.U.uT, uA: { value: c1 }, uB: { value: c2 }, uR: { value: r }, uG: { value: guc || 1 } },
      vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying vec2 vP; uniform vec3 uA, uB; uniform float uR, uG, uT; void main(){ float d = length(vP);' +
        ' float disk = smoothstep(uR, uR - 0.6, d); float hale = exp(-(d - uR) * 0.16) * 0.55 * step(uR - 0.6, d) + exp(-d * 0.05) * 0.18;' +
        ' float isin = max(0.0, cos(atan(vP.y, vP.x) * 12.0 + uT * 0.1)) * exp(-d * 0.06) * 0.12 * step(uR, d);' +
        ' vec3 c = mix(uB, uA, disk); float a = max(disk, (hale + isin) * uG); gl_FragColor = vec4(c + vec3(0.06) * disk * (1.0 - d / uR), clamp(a, 0.0, 1.0)); }'
    });
    const g = new T.PlaneGeometry(r * 9, r * 9);
    const ms = new T.Mesh(g, m); ms.position.set(gx + 20, gy + 40, -149); ms.renderOrder = -9; ms.frustumCulled = false;
    ctx.ekle(ms);
    return ms;
  }
  // Palmiye (eğik gövde + sallanan yapraklar + hindistan cevizi)
  function palmiye(S, G, R, x, y, z, k, egim, yRenk, kokYok) {
    const H = 6.4 * k, n = 9;
    for (let i = 0; i < n; i++) {
      const u = i / n, u2 = (i + 1) / n;
      const x0 = x + egim * H * u * u, y0 = y + H * u, x1 = x + egim * H * u2 * u2, y1 = y + H * u2;
      const len = Math.hypot(x1 - x0, y1 - y0), ang = Math.atan2(x1 - x0, y1 - y0), r = 0.27 * k * (1 - 0.32 * u);
      S.ekle(G.kule, (x0 + x1) / 2, (y0 + y1) / 2, z, r, len * 1.12, r, i % 2 ? 0x94643a : 0x86562e, i % 2 ? 0xd09a62 : 0xbe8650, 0, 0, -ang);
    }
    if (!kokYok) S.ekle(G.kureO, x, y + 0.05, z, 0.5 * k, 0.22 * k, 0.5 * k, 0x8a5a30, 0xb88454);
    const tx = x + egim * H, ty = y + H;
    // hindistan cevizleri
    for (let j = 0; j < 3; j++) { const a = j * 2.1 + 0.4; S.ekle(G.kureU, tx + Math.cos(a) * 0.26 * k, ty - 0.28 * k, z + Math.sin(a) * 0.24 * k, 0.22 * k, 0.24 * k, 0.22 * k, 0x5a3418, 0x8a5a2c); }
    const fN = 9, a0 = R() * PI;
    for (let j = 0; j < fN; j++) {
      const a = a0 + j / fN * PI * 2, dx = Math.cos(a), dz = Math.sin(a) * 0.75, L = (2.5 + R() * 0.7) * k, kalk = (0.7 + R() * 0.5) * k;
      const c = yRenk[j % yRenk.length];
      let px = tx, py = ty, pz = z;
      for (let s = 1; s <= 5; s++) {
        const u = s / 5, nx = tx + dx * L * u, ny = ty + kalk * u - 2.3 * k * u * u, nz = z + dz * L * u;
        const mx = (px + nx) / 2, my = (py + ny) / 2, mz = (pz + nz) / 2, len = Math.hypot(nx - px, ny - py, nz - pz);
        const yat = Math.hypot(nx - px, nz - pz), rz = Math.atan2(ny - py, yat), ry = -Math.atan2(nz - pz, nx - px);
        S.ekle(G.kureK, mx, my, mz, len * 0.8, 0.06 * k, 0.46 * k * Math.sin(PI * (u * 0.8 + 0.12)) + 0.12 * k, c[0], c[1], 0, ry, rz, -(0.08 + 0.14 * u));
        px = nx; py = ny; pz = nz;
      }
    }
  }
  // Salıncak direklerinin tepesine palmiye tacı (dunya.js salincak kancası için)
  function palmTac(A, G, R, tx, ty, z, k, yRenk) {
    for (let j = 0; j < 3; j++) { const a = j * 2.1 + 0.4; A.ekle(G.kureU, tx + Math.cos(a) * 0.26 * k, ty - 0.28 * k, z + Math.sin(a) * 0.24 * k, 0.22 * k, 0.24 * k, 0.22 * k, 0x5a3418, 0x8a5a2c); }
    const fN = 8, a0 = R() * PI;
    for (let j = 0; j < fN; j++) {
      const a = a0 + j / fN * PI * 2, dx = Math.cos(a), dz = Math.sin(a) * 0.7, L = 2.3 * k, kalk = 0.8 * k, c = yRenk[j % yRenk.length];
      let px = tx, py = ty, pz = z;
      for (let s = 1; s <= 5; s++) {
        const u = s / 5, nx = tx + dx * L * u, ny = ty + kalk * u - 2.2 * k * u * u, nz = z + dz * L * u;
        const yat = Math.hypot(nx - px, nz - pz), len = Math.hypot(nx - px, ny - py, nz - pz);
        A.ekle(G.kureK, (px + nx) / 2, (py + ny) / 2, (pz + nz) / 2, len * 0.8, 0.06 * k, 0.46 * k * Math.sin(PI * (u * 0.8 + 0.12)) + 0.12 * k, c[0], c[1], 0, -Math.atan2(nz - pz, nx - px), Math.atan2(ny - py, yat), 0.1 + 0.15 * u);
        px = nx; py = ny; pz = nz;
      }
    }
  }
  // 5 yapraklı küçük çiçek (kameraya bakar)
  function cicekK(S, G, x, y, z, r, c) {
    for (let k = 0; k < 5; k++) { const a = k / 5 * PI * 2 + 0.3; S.ekle(G.kureC, x + Math.cos(a) * r, y + Math.sin(a) * r, z, r * 0.85, r * 0.85, r * 0.45, c[0], c[1]); }
    S.ekle(G.kureC, x, y, z + r * 0.3, r * 0.6, r * 0.6, r * 0.4, 0xffb020, 0xffe070);
  }

  // ═════════════════════════ 24 · ÇÖL VAHASI ═════════════════════════
  DY_EK[24] = {
    palet: {
      ad: 'Çöl Vahası', gece: 0,
      sisRenk: 0xf6c08a, sisYogun: 0.0042, arka: 0xf6c08a,
      gok: [0xffd08a, 0xffb282, 0xf4aca8, 0x66ace8, 0x2c66c4], gunesPos: [60, 20], gunesRenk: 0xfff0b0,
      ykUst: 0xfff0d8, ykAlt: 0xc4844a, ykGuc: 1.18, gnRenk: 0xffdca0, gnGuc: 2.3, arkaRenk: 0xffa060, arkaGuc: 0.55,
      dag: [[0xe89a68, 0xf6c08a], [0xdc8a5a, 0xf2b480], [0xd27c50, 0xeeaa78]],
      tepe: [0xe69c50, 0xffd488, 0xeeac6c, 0xffd49c],
      agac: [[0x4e8a3a, 0x94c85a], [0x5e9a42, 0xa8d468], [0x467c36, 0x86ba52]],
      zemin: [0xf8cc8a, 0xe2a262, 0xf0c49a], cimen: [0xb88a48, 0xf0cc78, 0xe0b868],
      cicek: [[0xff5a8e, 0xffaacb], [0xffa820, 0xffe070], [0xe8445a, 0xff8a8a], [0xb070e0, 0xe0b0ff]],
      sisSerit: [0xffdcac, 0xf6c08a], siluet: [0x6a3a24, 0x9a5a34]
    },
    secenek: {
      cimenYok: true, cicekYok: true, agacYok: true, caliYok: true, tepeCicekYok: true, mantarSusYok: true,
      degirmenYok: true, kulubeYok: true, citYok: true, piknikTur: 'yok', bayrakYok: true, onSiluetYok: true,
      ucusanTur: 'yok', zeminDesen: 'kum', dagYukseklik: 0.55, suRenk: [0x0ea4b4, 0x6ee8e0],
      salincak: { tacYok: true, sarmasikYok: true, kusYok: true, govde: [0x86562e, 0xd09a62], cicek: [[0xff5a8e, 0xffaacb], [0xffa820, 0xffe070]] }, bulutSay: 5, bulutRenk: [0xffd2a8, 0xfff6ea]
    },
    yardimci: {
      ruzgar: { renk: [0xff8a4a, 0xffd49a], emissive: 0xff7a3a, ok: 0xfff2d0 },
      esinti: { tur: 'cizgi', renk: 0xd85c1a, ton: 0xf07020 },
      halka: { renk: [0xe8a020, 0xffe070], emissive: 0xffa020, cicekYok: true },
      baloncuk: { renk: 0xfff0d8, kenar: 0xffffff },
      bulut: { alt: 0xffe4c8, ust: 0xffffff, yanak: 0xff9a8a },
      nilufer: { yaprak: [0x4a9a50, 0x8ad070], cicek: [0xff6a9a, 0xffc0d8] }
    },
    yardimciKur: {
      salincak(ctx, o) { palmTac(o.A, ctx.G, ctx.R, -o.sapanX, 6.2, o.z - 0.3, 1.0, [[0x3a8a36, 0x86d05a], [0x2e7a34, 0x6cc050]]); palmTac(o.A, ctx.G, ctx.R, o.sapanX, 6.2, o.z - 0.3, 1.0, [[0x3a8a36, 0x86d05a], [0x48983c, 0x9ad866]]); },
      // Bilbo'nun yanındaki çalı yerine çiçekli fıçı kaktüs kümesi
      cali(C, i, ctx) {
        const { T, G } = ctx, S = ctx.yapi();
        for (const [x, z, k] of [[0, 0, 1.0], [-0.75, 0.2, 0.7], [0.7, 0.25, 0.62]]) {
          S.ekle(G.kureO, x, 0.62 * k, z, 0.62 * k, 0.7 * k, 0.6 * k, 0x3a8a48, 0x82c868);
          for (let s = 0; s < 5; s++) S.ekle(G.kureU, x + (s - 2) * 0.22 * k, 0.62 * k, z + 0.5 * k, 0.05 * k, 0.62 * k, 0.05 * k, 0x9ad878, 0xc8f0a8);
          cicekK(S, G, x, 1.36 * k, z + 0.1, 0.13 * k, k > 0.9 ? [0xff5a8e, 0xffaacb] : [0xffa820, 0xffe070]);
        }
        return new T.Mesh(S.geo(), ctx.malz(true, true, 0.3, { roughness: 0.7 }));
      },
      // Mantar yerine renkli, gülen bir davul (üstü gergin deri: zıplatan yüzey)
      mantar(M, i, ctx) {
        const { T, G } = ctx, S = ctx.yapi();
        const govde = [[0xd8402c, 0xff7a3a], [0x2a8ab8, 0x58c0e8], [0x8a40c0, 0xc078f0]][i % 3];
        S.ekle(G.sil, 0, 0.14, 0, 1.5, 0.28, 1.5, 0x6a3418, 0x9a5028);
        S.ekle(G.sil, 0, 1.2, 0, 1.62, 2.0, 1.62, govde[0], govde[1]);
        for (const yy of [0.34, 2.12]) S.ekle(G.sil, 0, yy, 0, 1.68, 0.2, 1.68, 0xe0a020, 0xffd860);
        for (let k = 0; k < 16; k++) {
          const a = k / 16 * PI * 2; if (Math.cos(a) > 0.72) continue;
          S.ekle(G.koni, Math.sin(a) * 1.63, 1.2, Math.cos(a) * 1.63, 0.26, 0.62, 0.05, k % 2 ? 0xfff2d8 : 0x2ab0a0, k % 2 ? 0xffffff : 0x60e0c8, 0, a, k % 2 ? PI : 0);
        }
        for (let k = 0; k < 12; k++) { const a = k / 12 * PI * 2; if (Math.cos(a) > 0.55) continue; S.ekle(G.sil, Math.sin(a) * 1.66, 1.2, Math.cos(a) * 1.66, 0.035, 1.75, 0.035, 0xc89858, 0xf0d098, 0, a, k % 2 ? 0.5 : -0.5); }
        S.ekle(G.kureO, 0, 2.2, 0, 1.64, 0.42, 1.64, 0xf2dcb4, 0xfff6e4);
        for (const q of [-1, 1]) S.ekle(G.kure, q * 0.62, 1.05, 1.6, 0.2, 0.12, 0.05, 0xff8aa8, 0xffb0c8);
        for (let k = 0; k < 9; k++) { const a = (k - 4) * 0.24; S.ekle(G.kure, Math.sin(a) * 0.32, 1.02 - Math.cos(a) * 0.15, 1.66, 0.06, 0.05, 0.03, 0x5a2a30, 0x5a2a30); }
        const mesh = new T.Mesh(S.geo(), ctx.malz(true, true, 0.4, { roughness: 0.5, emissive: 0x3c1c10 }));
        const E = ctx.yapi();
        for (const q of [-1, 1]) { E.ekle(G.kure, q * 0.36, 0, 0, 0.17, 0.23, 0.06, 0x2a1a24, 0x3a2430); E.ekle(G.kureK, q * 0.36 - 0.05, 0.08, 0.06, 0.06, 0.06, 0.02, 0xffffff, 0xffffff); }
        const goz = new T.Mesh(E.geo(), ctx.malz(false, true, 0, { emissive: 0xffffff, emissiveIntensity: 0.4 }));
        goz.position.set(0, 1.42, 1.63); mesh.add(goz);
        return { mesh, goz };
      }
    },
    kur(ctx) {
      const { T, G, hx, yerY, R, ara } = ctx, S = ctx.yapi();
      const yasak = (x, z, p) => z > -1.6 && (Math.abs(x) < (p || 4.5) || Math.abs(x - hx) < (p || 4.2));
      const x0 = -40, x1 = hx + 40;
      const yesil = [[0x3e8a3a, 0x7cc858], [0x4a9a40, 0x92d866], [0x36803a, 0x6cbc50]];

      // ── UZAK: piramitler, kaya kemerleri, kızıl kayalıklar ──
      const piramit = (x, z, h, w) => {
        const y = -2;
        S.ekle(G.koni4, x, y + h / 2, z, w, h, w, 0xd2904e, 0xfadca0);
        S.ekle(G.koni4, x, y + h * 0.93, z, w * 0.1, h * 0.14, w * 0.1, 0xfff0c0, 0xffffff); // parlak tepe taşı
      };
      piramit(hx * 0.62, -104, 26, 19); piramit(hx * 0.62 + 24, -112, 18, 13); piramit(hx * 0.62 - 17, -100, 13, 9.5);
      piramit(-46, -108, 20, 15); piramit(-28, -116, 12, 9); piramit(hx + 58, -106, 22, 16);
      const kemer = (x, z, r, k) => { // yumuşak topaklardan kaya kemeri
        const y0 = yerY(x, z) - 0.6, n = 22;
        for (let i = 0; i <= n; i++) {
          const a = PI * i / n, px = x - Math.cos(a) * r, py = y0 + Math.sin(a) * r * 1.05, t = 0.9 + 0.35 * Math.abs(Math.cos(a));
          S.ekle(G.kureO, px, py, z + ara(-0.2, 0.2), k * t * 1.05, k * 1.05, k * 0.85, 0xb85a36, 0xf09a62, 0, 0, a - PI / 2);
        }
        for (const q of [-1, 1]) S.ekle(G.kule, x + q * r, y0 + 0.4, z, k * 1.25, 2.4, k * 1.0, 0xa84c2e, 0xd88050);
      };
      kemer(hx * 0.16, -41, 6.5, 1.5); kemer(hx * 0.86, -42, 8, 1.8); kemer(-30, -41.5, 5.5, 1.3); kemer(hx + 34, -41, 6, 1.4);
      const mesa = (x, z, w, h) => { // katmanlı kızıl kaya sütunu
        const y = yerY(x, z) - 1, n = 4;
        for (let i = 0; i < n; i++) S.ekle(G.kule, x, y + h * (i + 0.5) / n, z, w * (1 - i * 0.08), h / n * 1.02, w * 0.7 * (1 - i * 0.08), i % 2 ? 0xc8643c : 0xb24e30, i % 2 ? 0xf0a070 : 0xe08858);
        S.ekle(G.kureO, x, y + h, z, w * 0.72, 0.5, w * 0.5, 0xd88050, 0xf6b078);
      };
      mesa(hx * 0.42, -43, 4.5, 13); mesa(hx * 0.42 + 6.5, -44, 3, 9); mesa(-12, -43, 4, 11); mesa(hx + 18, -43.5, 4.8, 14); mesa(hx * 0.68, -44, 3.2, 9.5); mesa(-48, -43, 4, 12);

      // ── ORTA: katman katman kum tepeleri, deve kervanı, çadır kampları ──
      for (let i = 0; i < 17; i++) {
        const x = x0 - 20 + i * (x1 - x0 + 40) / 16 + ara(-4, 4), z = ara(-30, -38), w = ara(10, 15), h = ara(2.6, 4.4);
        S.ekle(G.kureO, x, yerY(x, z) - 0.3, z, w, h, ara(5, 7), 0xe6a256, 0xffd896, 0, ara(-0.1, 0.1), 0);
      }
      for (let i = 0; i < 12; i++) {
        const x = x0 + i * (x1 - x0) / 11 + ara(-5, 5), z = ara(-20, -26), w = ara(7, 10), h = ara(1.4, 2.2);
        S.ekle(G.kureO, x, yerY(x, z) - 0.4, z, w, h, ara(3.5, 5), 0xeaa660, 0xffdca0, 0, ara(-0.15, 0.15), 0);
      }
      // deve kervanı (uzun kum sırtının üstünde)
      {
        const cz = -39, cx = hx * 0.36, sirtY = yerY(cx, cz) + 2.2;
        S.ekle(G.kureO, cx, sirtY - 3.2, cz - 1, 22, 3.6, 5, 0xe2a058, 0xffd690);
        const K = sayacli(ctx), kOz = [];
        const deve = (x, k, eyer) => {
          const y = sirtY + 0.1, c1 = 0x8a5634, c2 = 0xc08850, S = K, n0 = K.n();
          for (const [lx, lz] of [[-0.55, 0.25], [-0.45, -0.25], [0.5, 0.25], [0.6, -0.25]]) S.ekle(G.sil, x + lx * k, y + 0.6 * k, cz + lz * k, 0.09 * k, 1.2 * k, 0.09 * k, c1, c2);
          S.ekle(G.kureO, x, y + 1.45 * k, cz, 0.95 * k, 0.48 * k, 0.42 * k, c1, c2);
          S.ekle(G.kureO, x - 0.05 * k, y + 1.85 * k, cz, 0.45 * k, 0.42 * k, 0.32 * k, c1, c2);
          S.ekle(G.sil, x + 1.0 * k, y + 1.9 * k, cz, 0.13 * k, 1.0 * k, 0.13 * k, c1, c2, 0, 0, -0.45);
          S.ekle(G.kureO, x + 1.32 * k, y + 2.4 * k, cz, 0.3 * k, 0.17 * k, 0.17 * k, c1, c2);
          if (eyer) { S.ekle(G.kutu, x - 0.05 * k, y + 1.82 * k, cz, 0.7 * k, 0.5 * k, 0.9 * k, eyer[0], eyer[1]); }
          kOz.push([n0, K.n(), x, y, cz, R() * 6.28]);
        };
        deve(cx - 7, 1.0, [0xc83040, 0xff6070]); deve(cx - 3.4, 1.05, [0x2a7ab8, 0x58b0f0]); deve(cx + 0.4, 0.95, [0xe8a020, 0xffd060]); deve(cx + 3.8, 0.62, null);
        { // yürüyen bacaklar + başını sallayan develer
          const geo = K.geo(); nesneOz(T, geo, kOz);
          const km = canliMalz(ctx, { roughness: 0.85 },
            'vec3 dyL = transformed - merk; float dyA = uT * 2.6 + faz; float dyB = clamp((1.25 - dyL.y) / 1.25, 0.0, 1.0) * step(dyL.y, 1.2);' +
            'transformed.x += sin(dyA + step(0.0, dyL.x) * 3.1416 + step(0.0, dyL.z) * 1.5708) * 0.22 * dyB;' +
            'transformed.y += sin(dyA * 2.0) * 0.035 * (1.0 - dyB) + sin(dyA) * 0.09 * smoothstep(0.75, 1.3, dyL.x);');
          const km2 = new T.Mesh(geo, km); km2.frustumCulled = false; ctx.ekle(km2);
        }
        for (let i = 0; i < 4; i++) S.ekle(G.sil, cx - 5.2 + i * 3.6, sirtY + 2.3, cz, 0.02, 3.2, 0.02, 0x6a4028, 0x6a4028, 0, 0, PI / 2 - 0.25); // yular ipi
      }
      // renkli çadırlar + kilimler
      const dil = dilimGeo(T, 10);
      const cadir = (x, z, k, ca, cb, bay) => {
        const y = yerY(x, z);
        S.ekle(G.sil, x, y + 0.7 * k, z, 1.8 * k, 1.4 * k, 1.8 * k, ctx.karH(ca, 0x000000, 0.25), ca);
        S.ekle(G.sil, x, y + 1.18 * k, z, 1.83 * k, 0.16 * k, 1.83 * k, cb, ctx.karH(cb, 0xffffff, 0.3));
        for (let i = 0; i < 10; i++) S.ekle(dil, x, y + 1.36 * k, z, 2.1 * k, 1.75 * k, 2.1 * k, i % 2 ? ca : cb, i % 2 ? ctx.karH(ca, 0xffffff, 0.3) : ctx.karH(cb, 0xffffff, 0.35), 0, i * PI / 5, 0);
        S.ekle(G.kureO, x, y + 0.55 * k, z + 1.72 * k, 0.45 * k, 0.6 * k, 0.12 * k, 0x5a2418, 0x7a3420);
        S.ekle(G.sil, x, y + 3.4 * k, z, 0.04 * k, 0.7 * k, 0.04 * k, 0x6a4028, 0x8a5a38);
        S.ekle(G.koni, x + 0.3 * k, y + 3.55 * k, z, 0.14 * k, 0.6 * k, 0.03 * k, bay, ctx.karH(bay, 0xffffff, 0.3), 0, 0, -PI / 2, 0.3);
      };
      const kilim = (x, y, z, w, d, ry, dik) => { // yere serili ya da ipe asılı kilim
        const R2 = [0xc8323a, 0xe86a28, 0xfff0d0, 0x2a5a9a, 0xffc030];
        const rx = dik ? PI / 2 : 0;
        S.ekle(G.kutu, x, y, z, w, 0.04, d, 0xb02830, 0xd84048, rx, ry, 0);
        for (let i = 0; i < 5; i++) {
          const u = (i - 2) / 2.6, c = R2[(i + 1) % R2.length];
          if (dik) S.ekle(G.kutu, x, y + u * d * 0.4, z + 0.02, w * 0.96, 0.05, d * 0.07, c, c, rx, ry, 0);
          else S.ekle(G.kutu, x + Math.cos(ry) * u * w * 0.4, y + 0.012, z - Math.sin(ry) * u * w * 0.4, w * 0.07, 0.05, d * 0.94, c, c, rx, ry, 0);
        }
        if (dik) S.ekle(G.kutu, x, y, z + 0.04, w * 0.28, 0.05, w * 0.28, 0xffc030, 0xffe080, PI / 2, PI / 4, 0);
        else S.ekle(G.kutu, x, y + 0.02, z, w * 0.24, 0.05, w * 0.24, 0xffc030, 0xffe080, 0, ry + PI / 4, 0);
      };
      const kamp = (x, z, s) => {
        const C = [[0xd83a3a, 0xfff0d8, 0x2a7ab8], [0x2a8ab8, 0xffe8b0, 0xe8a020], [0xe87a20, 0xfff4e0, 0xc83a6a], [0x8a48c0, 0xffe0f0, 0x2ab0a0]];
        const a = C[s % 4], b = C[(s + 1) % 4], c = C[(s + 2) % 4];
        cadir(x, z, 1.0, a[0], a[1], a[2]); cadir(x + 4.6, z - 2.2, 0.82, b[0], b[1], b[2]); cadir(x - 4.2, z - 2.8, 0.72, c[0], c[1], c[2]);
        // ipe asılı kilim
        const kz = z + 2.2, ky = yerY(x, kz);
        for (const q of [-1, 1]) S.ekle(G.sil, x + 2.4 + q * 1.3, ky + 0.9, kz, 0.05, 1.8, 0.05, 0x6a4028, 0x9a6a40);
        S.ekle(G.sil, x + 2.4, ky + 1.8, kz, 0.025, 2.7, 0.025, 0xfff0e0, 0xfff0e0, 0, 0, PI / 2);
        kilim(x + 2.4, ky + 1.15, kz + 0.03, 2.1, 1.25, 0, true);
        kilim(x - 1.4, yerY(x - 1.4, z + 2.6) + 0.03, z + 2.6, 2.2, 1.4, 0.25, false);
        // kapı önünde minik ateş taşları + çaydanlık
        S.ekle(G.kureO, x + 0.6, ky + 0.1, kz + 0.6, 0.35, 0.18, 0.3, 0x9a8878, 0xc8b8a8);
        S.ekle(G.kule, x + 0.6, ky + 0.4, kz + 0.6, 0.18, 0.32, 0.18, 0xd8a030, 0xffd870);
      };
      kamp(-13, -10, 0); kamp(hx * 0.22, -14, 1); kamp(hx + 12, -9, 2); kamp(hx * 0.74, -16, 3);

      // ── VAHA: turkuaz göl + palmiyeler + yeşil kıyı ──
      const vx = hx * 0.5, vz = -9.5, rx = 9.5, rz = 3.6;
      let vy = 0;
      for (let i = 0; i < 40; i++) { const a = i / 40 * PI * 2; for (const u of [0.5, 1]) vy = Math.max(vy, yerY(vx + Math.cos(a) * rx * u, vz + Math.sin(a) * rz * u)); }
      vy += 0.05;
      {
        const g = new T.CircleGeometry(1, 56); g.rotateX(-PI / 2);
        const m = new T.ShaderMaterial({
          transparent: true, depthWrite: false, uniforms: { uT: ctx.U.uT },
          vertexShader: 'varying vec2 vU; varying vec3 vW; void main(){ vU = uv * 2.0 - 1.0; vW = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vW,1.0); }',
          fragmentShader: 'varying vec2 vU; varying vec3 vW; uniform float uT; void main(){ float r = length(vU);' +
            ' vec3 c = mix(vec3(0.05, 0.62, 0.72), vec3(0.36, 0.9, 0.86), smoothstep(0.25, 0.95, r));' +
            ' c += vec3(0.12, 0.16, 0.12) * smoothstep(0.55, 0.95, sin(r * 26.0 - uT * 1.4 + sin(vW.x * 0.7) * 0.8)) * (1.0 - r * 0.4);' +
            ' float par = pow(max(0.0, sin(vW.x * 5.3 + uT * 2.6) * cos(vW.z * 7.1 - uT * 1.8)), 10.0); c += vec3(1.0) * par * 0.7;' +
            ' c = mix(c, vec3(0.88, 1.0, 0.95), smoothstep(0.86, 0.96, r) * 0.65);' +
            ' gl_FragColor = vec4(c, smoothstep(1.0, 0.95, r)); }'
        });
        const su = new T.Mesh(g, m); su.position.set(vx, vy, vz); su.scale.set(rx, 1, rz); su.renderOrder = 1; ctx.ekle(su);
      }
      for (let i = 0; i < 44; i++) { // yeşil kıyı topakları + sazlar
        const a = i / 44 * PI * 2, cx = vx + Math.cos(a) * rx * 1.02, cz = vz + Math.sin(a) * rz * 1.06, y = Math.max(vy - 0.25, yerY(cx, cz));
        const c = yesil[i % 3];
        S.ekle(G.kureU, cx, y, cz, ara(0.8, 1.3), ara(0.25, 0.42), ara(0.45, 0.7), c[0], c[1], 0, -a, 0);
        if (i % 3 === 0 && Math.sin(a) < 0.5) for (let j = 0; j < 4; j++) S.ekle(G.bicak, cx + (j - 1.5) * 0.12, y, cz + ara(-0.1, 0.1), 0.12, ara(0.9, 1.5), 1, 0x3e8a3a, 0x9ad060, 0, 0, (j - 1.5) * 0.18, 0.5);
        if (i % 5 === 2 && Math.sin(a) < 0.3) cicekK(S, G, cx, y + 0.42, cz + 0.3, 0.1, [0xff5a8e, 0xffaacb]);
      }
      for (let i = 0; i < 70; i++) { // gölün çevresinde yeşil çimen halkası (yalnız burada)
        const a = R() * PI * 2, u = ara(1.08, 1.45), cx = vx + Math.cos(a) * rx * u, cz = vz + Math.sin(a) * rz * u * 1.25;
        if (cz > -1.8) continue;
        const y = yerY(cx, cz), c = yesil[i % 3];
        for (let j = 0; j < 4; j++) S.ekle(G.bicak, cx + (j - 1.5) * 0.1, y - 0.03, cz, 0.16, ara(0.35, 0.6), 1, c[0], c[1], 0, ara(-0.3, 0.3), (j - 1.5) * 0.25, 0.6);
      }
      const yR = [[0x3a8a36, 0x86d05a], [0x2e7a34, 0x6cc050], [0x48983c, 0x9ad866]];
      for (const [dx, dz, k, e] of [[-rx - 1.2, -1.0, 1.15, -0.28], [-rx * 0.45, -rz - 1.4, 1.3, 0.12], [rx * 0.1, -rz - 2.2, 1.0, -0.15], [rx * 0.6, -rz - 1.2, 1.2, 0.22], [rx + 1.4, -0.6, 1.05, 0.32], [-rx * 0.8, -rz - 3.6, 0.85, -0.1], [rx * 0.95, -rz - 3.8, 0.9, 0.12]]) {
        const px = vx + dx, pz = vz + dz; palmiye(S, G, R, px, yerY(px, pz), pz, k, e, yR);
      }
      // çadırların üstünde süzülen renkli uçurtma (ipi kampa iner, kuyruğu dalgalanır)
      {
        const U = sayacli(ctx), ux = hx * 0.22 + 3, uy = 19, uz = -17, n0 = U.n();
        U.ekle(G.kutu, ux, uy, uz, 2.6, 2.6, 0.05, 0xff4a6a, 0xffd040, 0, 0, PI / 4);
        U.ekle(G.kutu, ux, uy, uz + 0.03, 3.6, 0.12, 0.05, 0x2a7ab8, 0x2a7ab8);
        U.ekle(G.kutu, ux, uy, uz + 0.03, 0.12, 3.6, 0.05, 0x2a7ab8, 0x2a7ab8);
        for (let k = 0; k < 6; k++) { const ky = uy - 2.0 - k * 0.7; U.ekle(G.sil, ux, ky + 0.35, uz, 0.03, 0.7, 0.03, 0xfff0e0, 0xfff0e0); U.ekle(G.koni, ux, ky, uz, 0.28, 0.36, 0.05, [0xff4a6a, 0xffc020, 0x2ab0a0][k % 3], 0xffffff, 0, 0, PI / 2); }
        const ipY0 = yerY(hx * 0.22, -14) + 1.2, L = Math.hypot(ux - hx * 0.22, uy - ipY0);
        U.ekle(G.sil, (ux + hx * 0.22) / 2, (uy + ipY0) / 2, (uz - 14) / 2, 0.015, L, 0.015, 0xfff4e8, 0xfff4e8, Math.atan2(uz + 14, uy - ipY0) * 0, 0, -Math.atan2(ux - hx * 0.22, uy - ipY0));
        const geo = U.geo(); nesneOz(T, geo, [[n0, U.n(), ux, uy, uz, 0]]);
        const um = canliMalz(ctx, { roughness: 0.6, side: T.DoubleSide },
          'vec3 dyL = transformed - merk; float dyU = clamp(1.0 - abs(dyL.y) / 6.0, 0.0, 1.0) * step(-7.0, dyL.y);' +
          'transformed.x += sin(uT * 0.8) * 0.7 * dyU + sin(uT * 3.0 + dyL.y * 1.8) * 0.18 * clamp(-dyL.y - 1.8, 0.0, 4.5) * step(-7.0, dyL.y); transformed.y += sin(uT * 1.2) * 0.4 * dyU;');
        const um2 = new T.Mesh(geo, um); um2.frustumCulled = false; ctx.ekle(um2);
      }
      // vahanın kıyısında dinlenen sevimli deve
      {
        const dx = vx + rx + 3.4, dz = -6.2, dy = yerY(dx, dz), c1 = 0xc08850, c2 = 0xecc48a;
        S.ekle(G.kureO, dx, dy + 0.5, dz, 1.15, 0.55, 0.62, c1, c2);
        S.ekle(G.kureO, dx - 0.1, dy + 0.98, dz, 0.5, 0.42, 0.4, c1, c2);
        S.ekle(G.kutu, dx - 0.1, dy + 0.95, dz, 0.75, 0.42, 0.95, 0xd83a5a, 0xff7a8a);
        for (let k = 0; k < 4; k++) S.ekle(G.kutu, dx - 0.4 + k * 0.2, dy + 0.75, dz + 0.48, 0.08, 0.1, 0.02, [0xffc040, 0x2a8ab8, 0xfff0d8, 0x3cb882][k], 0xffffff);
        for (const q of [-1, 1]) S.ekle(G.kureO, dx + q * 0.6, dy + 0.12, dz + 0.45, 0.42, 0.14, 0.2, c1, c2);
        S.ekle(G.sil, dx + 1.05, dy + 1.0, dz, 0.16, 1.0, 0.16, c1, c2, 0, 0, -0.35);
        S.ekle(G.kureO, dx + 1.3, dy + 1.55, dz + 0.05, 0.36, 0.26, 0.26, c1, c2);
        S.ekle(G.kureO, dx + 1.6, dy + 1.48, dz + 0.05, 0.2, 0.16, 0.2, 0xd8a070, 0xf0c898);
        for (const q of [-1, 1]) { S.ekle(G.kureK, dx + 1.38, dy + 1.62, dz + q * 0.2, 0.06, 0.07, 0.04, 0x2a1a20, 0x2a1a20); S.ekle(G.kureK, dx + 1.15, dy + 1.78, dz + q * 0.18, 0.1, 0.05, 0.06, c1, c2, 0, 0, 0.6); }
        S.ekle(G.kureK, dx + 1.48, dy + 1.5, dz + 0.24, 0.07, 0.04, 0.03, 0xff8aa8, 0xff8aa8);
      }
      // başka yerlerde birkaç tek palmiye (kamplarla)
      for (const [px, pz, k, e] of [[-16.5, -14, 1.0, 0.2], [-8, -15, 0.8, -0.2], [hx * 0.22 + 4, -18.5, 0.9, 0.25], [hx + 16, -13, 1.05, -0.22], [hx + 7.5, -12.5, 0.75, 0.18], [hx * 0.74 - 4, -19, 0.95, -0.2], [hx + 30, -20, 1.0, 0.15]]) {
        palmiye(S, G, R, px, yerY(px, pz), pz, k, e, yR);
      }

      // ── kaktüsler (çiçek açmış), kayalar, kuru otlar ──
      const yKak = [0x3a8a48, 0x7cc464];
      const kaktus = (x, z, k, cr) => {
        const y = yerY(x, z) - 0.05;
        S.ekle(G.sil, x, y + 1.05 * k, z, 0.4 * k, 2.1 * k, 0.4 * k, yKak[0], yKak[1]);
        S.ekle(G.kureO, x, y + 2.1 * k, z, 0.4 * k, 0.42 * k, 0.4 * k, 0x6ab858, 0x9ad878);
        for (let s = 0; s < 3; s++) S.ekle(G.sil, x + (s - 1) * 0.2 * k, y + 1.05 * k, z + 0.36 * k, 0.03 * k, 2.0 * k, 0.03 * k, 0x8ad070, 0xb8ec98);
        for (const q of [-1, 1]) {
          if (q === 1 && k < 0.9) continue;
          const ah = (q < 0 ? 0.85 : 1.2) * k, uz = (q < 0 ? 0.8 : 0.62) * k;
          S.ekle(G.sil, x + q * 0.55 * k, y + ah, z, 0.22 * k, 0.5 * k, 0.22 * k, yKak[0], yKak[1], 0, 0, PI / 2);
          S.ekle(G.kureO, x + q * 0.8 * k, y + ah, z, 0.24 * k, 0.24 * k, 0.24 * k, yKak[0], yKak[1]);
          S.ekle(G.sil, x + q * 0.8 * k, y + ah + uz / 2, z, 0.24 * k, uz, 0.24 * k, yKak[0], yKak[1]);
          S.ekle(G.kureO, x + q * 0.8 * k, y + ah + uz, z, 0.24 * k, 0.26 * k, 0.24 * k, 0x6ab858, 0x9ad878);
          cicekK(S, G, x + q * 0.8 * k, y + ah + uz + 0.24 * k, z + 0.06 * k, 0.1 * k, cr);
        }
        cicekK(S, G, x, y + 2.5 * k, z + 0.1 * k, 0.15 * k, cr);
      };
      const fici = (x, z, k, cr) => { // fıçı kaktüs
        const y = yerY(x, z);
        S.ekle(G.kureO, x, y + 0.42 * k, z, 0.5 * k, 0.55 * k, 0.5 * k, 0x3a8a48, 0x82c868);
        for (let s = 0; s < 4; s++) S.ekle(G.kureU, x + (s - 1.5) * 0.22 * k, y + 0.42 * k, z + 0.38 * k, 0.05 * k, 0.5 * k, 0.05 * k, 0x9ad878, 0xc8f0a8);
        cicekK(S, G, x, y + 0.98 * k, z + 0.08 * k, 0.12 * k, cr);
      };
      const firavun = (x, z, k) => { // yassı yapraklı kaktüs + kırmızı meyveler
        const y = yerY(x, z);
        S.ekle(G.kureU, x, y + 0.5 * k, z, 0.45 * k, 0.58 * k, 0.14 * k, 0x4a9248, 0x8acc66);
        S.ekle(G.kureU, x - 0.42 * k, y + 1.0 * k, z, 0.34 * k, 0.44 * k, 0.12 * k, 0x4a9248, 0x8acc66, 0, 0, 0.5);
        S.ekle(G.kureU, x + 0.38 * k, y + 1.08 * k, z + 0.05, 0.36 * k, 0.46 * k, 0.12 * k, 0x4a9248, 0x8acc66, 0, 0, -0.45);
        for (const [fx, fy] of [[-0.6, 1.42], [-0.32, 1.4], [0.55, 1.5]]) S.ekle(G.kureK, x + fx * k, y + fy * k, z + 0.06, 0.1 * k, 0.12 * k, 0.1 * k, 0xe83a6a, 0xff8aa8);
      };
      const CR = [[0xff5a8e, 0xffaacb], [0xffa820, 0xffe070], [0xff6a50, 0xffb090], [0xd070f0, 0xf0b8ff]];
      for (let i = 0; i < 16; i++) { // saguaro kaktüsleri: bütün parkura
        const x = x0 + 15 + i * (x1 - x0 - 25) / 15 + ara(-3, 3), z = ara(-5, -15);
        if (yasak(x, z, 5) || (Math.abs(x - vx) < rx + 2 && z > vz - rz - 2)) continue;
        kaktus(x, z, ara(0.75, 1.35), CR[i % 4]);
      }
      for (let i = 0; i < 18; i++) {
        const x = ara(x0 + 20, x1 - 10), z = ara(-2.2, -8);
        if (yasak(x, z) || (Math.abs(x - vx) < rx + 1 && z < -4.5)) continue;
        if (i % 3 === 0) firavun(x, z, ara(0.7, 1.0)); else fici(x, z, ara(0.6, 1.0), CR[(i + 1) % 4]);
      }
      const kaya = (x, z, k) => {
        const y = yerY(x, z);
        S.ekle(G.kureO, x, y + 0.12 * k, z, 0.55 * k, 0.38 * k, 0.45 * k, 0xb0683e, 0xe8a26c, ara(-0.2, 0.2), ara(0, 3), 0);
        if (R() < 0.6) S.ekle(G.kureO, x + 0.5 * k, y + 0.05, z + 0.15, 0.32 * k, 0.22 * k, 0.28 * k, 0xa8603a, 0xe09a64, 0, ara(0, 3), 0);
      };
      const ot = (x, z, k) => { const y = yerY(x, z); for (let j = 0; j < 5; j++) S.ekle(G.bicak, x + (j - 2) * 0.09 * k, y - 0.02, z, 0.13 * k, ara(0.35, 0.6) * k, 1, 0xb07a40, 0xf0cc80, 0, ara(-0.3, 0.3), (j - 2) * 0.3, 0.5); };
      for (let i = 0; i < 46; i++) { const x = ara(x0 + 10, x1), z = ara(-1.8, -14); if (!yasak(x, z) && !(Math.abs(x - vx) < rx + 1 && Math.abs(z - vz) < rz + 1)) kaya(x, z, ara(0.5, 1.4)); }
      for (let i = 0; i < 70; i++) { const x = ara(x0 + 10, x1), z = ara(-1.8, -12); if (!yasak(x, z) && !(Math.abs(x - vx) < rx + 1.5 && Math.abs(z - vz) < rz + 2)) ot(x, z, ara(0.8, 1.3)); }

      // ── ÖN: alçak taşlar, minik kaktüsler (z 1..4) ──
      for (let i = 0; i < 30; i++) {
        const x = ara(-14, hx + 18), z = ara(1.2, 4);
        if (yasak(x, -1, 4.6)) continue;
        const s = i % 3;
        if (s === 0) kaya(x, z, ara(0.35, 0.7)); else if (s === 1) ot(x, z, ara(0.6, 0.9)); else fici(x, z, ara(0.4, 0.6), CR[i % 4]);
      }
      // ── EN ÖN (z 17..21): sıcak gölgeli kum tümsekleri + yassı kaktüsler ──
      const agav = (x, z, k) => { // mavi-yeşil sivri yapraklı agav
        const y = yerY(x, z);
        for (let j = 0; j < 9; j++) { const a = j / 9 * PI * 2; S.ekle(G.bicak, x + Math.cos(a) * 0.1 * k, y - 0.02, z + Math.sin(a) * 0.1 * k, 0.3 * k, ara(0.7, 1.0) * k, 1, 0x3a8a78, 0x9ad8b8, 0, -a, Math.cos(a) * 0.7, 0.2); }
        S.ekle(G.bicak, x, y, z, 0.28 * k, 1.1 * k, 1, 0x3a8a78, 0x9ad8b8, 0, 0, 0, 0.2);
      };
      for (let i = 0; i < 64; i++) { // oyun alanının önündeki kum: dalgacık tümsekler, taşlar, otlar, minik kaktüsler (alçak)
        const x = ara(-18, hx + 22), z = ara(4.5, 15), s = i % 6;
        if (s === 0 || s === 3) S.ekle(G.kureO, x, -0.12 - (z - 6) * 0.05, z, ara(1.6, 3.2), ara(0.22, 0.38), ara(0.8, 1.4), 0xe8a868, 0xffd8a0, 0, ara(-0.3, 0.3), 0);
        else if (s === 1) kaya(x, z, ara(0.4, 0.9)); else if (s === 2) ot(x, z, ara(0.7, 1.0));
        else if (s === 4) agav(x, z, ara(0.5, 0.75)); else fici(x, z, ara(0.45, 0.65), CR[i % 4]);
      }
      for (let i = 0; i < 44; i++) {
        const x = -40 + i * (hx + 80) / 43 + ara(-1, 1), z = ara(17, 21), r = ara(1.1, 1.9);
        S.ekle(G.kure, x, -0.85, z, r * 2.0, r * 1.2, r, 0xc87a40, 0xf8c888, 0, ara(-0.3, 0.3), 0);
        if (i % 4 === 1) firavun(x + ara(-0.5, 0.5), z + 0.6, ara(0.9, 1.2));
        else if (i % 4 === 2) agav(x + ara(-0.8, 0.8), z + 0.5, ara(1.0, 1.4));
        else if (i % 4 === 3) for (let j = 0; j < 6; j++) S.ekle(G.bicak, x + (j - 2.5) * 0.25, -0.2, z + 0.7, 0.3, ara(0.8, 1.4), 1, 0x9a6a38, 0xe0b870, 0, 0, (j - 2.5) * 0.28, 0.6);
      }

      // ── BİLBO'NUN YERİ: kilim + gölgelik (renkli saçaklı) ──
      {
        const bx = hx, bz = 0.05;
        kilim(bx, 0.03, bz, 4.4, 2.3, 0, false);
        for (let i = 0; i < 9; i++) for (const q of [-1, 1]) S.ekle(G.kureC, bx - 2.0 + i * 0.5, 0.04, bz + q * 1.2, 0.06, 0.04, 0.1, 0xfff0d0, 0xffffff);
        S.ekle(G.kureO, bx - 1.5, 0.14, bz - 0.8, 0.45, 0.14, 0.32, 0xe8a020, 0xffd060); // minder
        S.ekle(G.kureO, bx + 1.55, 0.14, bz - 0.82, 0.42, 0.13, 0.3, 0x2a8ab8, 0x60c0f0);
        // hurma tabağı + su testisi
        S.ekle(G.sil, bx + 0.6, 0.07, bz + 0.55, 0.36, 0.04, 0.36, 0xd8a050, 0xf8d088);
        for (let k = 0; k < 5; k++) S.ekle(G.kureK, bx + 0.6 + Math.cos(k * 1.3) * 0.16, 0.13, bz + 0.55 + Math.sin(k * 1.3) * 0.12, 0.08, 0.06, 0.06, 0x7a3a1a, 0xa85a2a);
        S.ekle(G.kureO, bx - 2.6, 0.36, bz - 1.05, 0.32, 0.38, 0.32, 0xc8643c, 0xf0a070);
        S.ekle(G.sil, bx - 2.6, 0.78, bz - 1.05, 0.12, 0.2, 0.12, 0xc8643c, 0xf0a070);
        // gölgelik: 4 direk + çizgili örtü + saçak bayrakçıklar (Bilbo'nun arkasında)
        const gz0 = -2.0, gz1 = -4.0, gy = 3.9, gx0 = hx - 2.9, gx1 = hx + 2.9;
        for (const px of [gx0, gx1]) for (const pz of [gz0, gz1]) S.ekle(G.sil, px, (pz === gz0 ? gy - 0.2 : gy + 0.25) / 2, pz, 0.07, pz === gz0 ? gy - 0.2 : gy + 0.25, 0.07, 0x7a4a28, 0xb07a48);
        for (let i = 0; i < 8; i++) {
          const u = (i + 0.5) / 8, xx = gx0 + (gx1 - gx0) * u;
          S.ekle(G.kutu, xx, gy, (gz0 + gz1) / 2, (gx1 - gx0) / 8 + 0.01, 0.06, gz0 - gz1 + 0.5, i % 2 ? 0xfff0d8 : 0xd83a3a, i % 2 ? 0xffffff : 0xff6a5a, -0.2, 0, 0);
        }
        const SR = [0xd83a3a, 0xffb020, 0x2a8ab8, 0x3cb882, 0xe85a9a];
        for (let i = 0; i < 13; i++) { const xx = gx0 + 0.1 + i * (gx1 - gx0 - 0.2) / 12; if (i % 2) continue; S.ekle(G.koni, xx, gy - 0.3, gz0 + 0.18, 0.13, 0.26, 0.03, SR[i % 5], ctx.karH(SR[i % 5], 0xffffff, 0.3), PI, 0, 0, 0.25); }
        // yanlarda iki küçük fıçı kaktüs ve saksı
        fici(hx - 4.4, -2.4, 0.7, CR[0]); fici(hx + 4.6, -2.0, 0.6, CR[1]);
        // önde: pirinç fener, çay tepsisi, renkli çakıllar (alçak)
        S.ekle(G.sil, hx + 2.9, 0.04, 2.2, 0.5, 0.05, 0.5, 0xc89030, 0xf0c060);
        for (let k = 0; k < 3; k++) { S.ekle(G.kule, hx + 2.75 + k * 0.22, 0.16, 2.1 + (k % 2) * 0.25, 0.07, 0.18, 0.07, 0xe8f4ff, 0xffffff); }
        S.ekle(G.kureO, hx - 3.2, 0.3, 2.4, 0.22, 0.3, 0.22, 0xd8a030, 0xffe080); S.ekle(G.koni, hx - 3.2, 0.68, 2.4, 0.2, 0.22, 0.2, 0xb87820, 0xe0a840);
        for (let k = 0; k < 14; k++) { const cx = hx + ara(-4, 4), cz = ara(1.6, 3.8); S.ekle(G.kureK, cx, 0.04, cz, ara(0.1, 0.18), 0.07, ara(0.08, 0.14), [0xe85a5a, 0x5ab0e8, 0xffc040, 0xfff0e0][k % 4], 0xffffff); }
      }

      dil.dispose();
      const sm = new T.Mesh(S.geo(), ctx.malz(true, true, 0, { roughness: 0.82 }));
      ctx.ekle(sm);
      // iri sıcak güneş
      gunesDiski(ctx, ctx.B.gunesPos[0], ctx.B.gunesPos[1], 11, 0xfff4c8, 0xffc070, 0.9);
    }
  };

  // ═════════════════════════ 28 · PALMİYE KUMSALI (gün doğumu) ═════════════════════════
  // Deniz yüzeyi: oyun zemini arkaya doğru yükseldiği için deniz onun en yüksek yerinin hemen üstünden geçer
  function denizY(z, duz) {
    if (duz) return 0.06;
    const a = Math.max(0, (-z - 4) / 30);
    return Math.min(6.5, a * Math.min(1, a * 1.5) * 2.56) + 0.07;
  }
  DY_EK[28] = {
    palet: {
      ad: 'Palmiye Kumsalı', gece: 0,
      sisRenk: 0xffd6c4, sisYogun: 0.0036, arka: 0xffd6c4,
      gok: [0xffd690, 0xffbc9e, 0xffa8c4, 0xa4a6ec, 0x5c74d0], gunesPos: [46, -21], gunesRenk: 0xffe2a0,
      ykUst: 0xfff0e8, ykAlt: 0xd8a890, ykGuc: 1.22, gnRenk: 0xffd8b4, gnGuc: 2.2, arkaRenk: 0xff9ec0, arkaGuc: 0.6,
      dag: [[0xd8a0c0, 0xffd6c4], [0xc890b8, 0xffd0c4], [0xb882b0, 0xffcac0]],
      tepe: [0xf0d4a8, 0xfff0d0, 0xf0d4b8, 0xfff0e0],
      agac: [[0x2e8a4a, 0x7ad070], [0x3a9a50, 0x8ade7a], [0x268040, 0x68c060]],
      zemin: [0xfff0d4, 0xf2d6aa, 0xffe6cc], cimen: [0x8aa860, 0xe0e4a0, 0xc8d888],
      cicek: [[0xff5a7a, 0xffa0b8], [0xffa030, 0xffd070], [0xff7ac0, 0xffc0e0], [0x5ad0e0, 0xb0f0f8]],
      sisSerit: [0xffeee6, 0xffd6d0], siluet: [0x8a5a50, 0xc08a78]
    },
    secenek: {
      cimenYok: true, cicekYok: true, agacYok: true, caliYok: true, tepeYok: true, dagYok: true, mantarSusYok: true,
      degirmenYok: true, kulubeYok: true, citYok: true, piknikTur: 'yok', bayrakYok: true, onSiluetYok: true, kusYok: true,
      ucusanTur: 'yok', zeminDesen: 'kum', zeminParlak: 0.08, suRenk: [0x18b8c0, 0x8af0e8],
      salincak: { tacYok: true, sarmasikYok: true, kusYok: true, govde: [0x86562e, 0xd09a62], cicek: [[0xff4a7a, 0xffa0c0], [0xffb020, 0xffe070], [0xffffff, 0xfff0f6]] }, bulutSay: 9, bulutRenk: [0xffb4c8, 0xfff6f0]
    },
    yardimci: {
      bulut: { alt: 0xffd8e4, ust: 0xffffff, yanak: 0xff8aa8 },
      halka: { renk: [0xff6a5a, 0xffb090], emissive: 0xff7050, cicek: [[0xff4a7a, 0xffa0c0], [0xffb020, 0xffe070], [0xffffff, 0xfff0f6]] },
      esinti: { tur: 'cizgi', renk: 0xd8501e, ton: 0xff6a2a },
      ruzgar: { renk: [0x40c8d0, 0xb8f4f0], emissive: 0x30b0c0, ok: 0xffffff },
      baloncuk: { renk: 0xe0fbff, kenar: 0xffffff },
      nilufer: { yaprak: [0xe8323a, 0xffffff], cicek: [0xffffff, 0xffffff] },
      mantar: { sapka: [0xff5a6a, 0xffb0b8], govde: [0xf0e8e0, 0xffffff], benek: 0xffffff }
    },
    yardimciKur: {
      salincak(ctx, o) { for (const q of [-1, 1]) palmTac(o.A, ctx.G, ctx.R, q * o.sapanX, 6.2, o.z - 0.3, 1.0, [[0x2e8a4a, 0x7ad070], [0x3a9a50, 0x8ade7a]]); },
      // Mantar yerine çizgili plaj şemsiyesi (üstü zıplatır)
      mantar(M, i, ctx) {
        const { T, G } = ctx, S = ctx.yapi(), dil = dilimGeo(T, 10);
        const C = [[0xff4a5a, 0xffffff], [0x2a9ad8, 0xfff4c0], [0xffa020, 0xffffff]][i % 3];
        S.ekle(G.sil, 0, 1.25, 0, 0.12, 2.5, 0.12, 0xd8d0c8, 0xffffff);
        for (let k = 0; k < 10; k++) S.ekle(dil, 0, 2.2, 0, 1.95, 1.05, 1.95, k % 2 ? C[0] : C[1], k % 2 ? ctx.karH(C[0], 0xffffff, 0.3) : 0xffffff, 0, k * PI / 5, 0);
        S.ekle(G.kureO, 0, 3.28, 0, 0.16, 0.16, 0.16, C[0], C[0]);
        S.ekle(G.kureO, 0, 0.1, 0, 0.6, 0.18, 0.6, 0xf0d4aa, 0xfff0d4);
        dil.dispose();
        return new T.Mesh(S.geo(), ctx.malz(true, true, 0.4, { roughness: 0.55, side: T.DoubleSide }));
      },
      // Nilüfer yerine suda yüzen kırmızı-beyaz can simidi
      nilufer(N, i, ctx) {
        const { T, G } = ctx, S = ctx.yapi(), yay = new T.TorusGeometry(1.4, 0.42, 8, 6, PI / 4);
        for (let k = 0; k < 8; k++) S.ekle(yay, 0, 0, 0, 1, 1, 1, k % 2 ? 0xffffff : 0xe8323a, k % 2 ? 0xffffff : 0xff5a5a, PI / 2, 0, k * PI / 4);
        for (let k = 0; k < 4; k++) { const a = k * PI / 2 + PI / 8; S.ekle(G.kureK, Math.cos(a) * 1.4, 0.05, -Math.sin(a) * 1.4, 0.2, 0.46, 0.46, 0xe8dcc0, 0xfff4e0); }
        yay.dispose();
        return new T.Mesh(S.geo(), ctx.malz(true, true, 0.3, { roughness: 0.45 }));
      }
    },
    kur(ctx) {
      const { T, G, hx, yerY, R, ara } = ctx, S = ctx.yapi();
      const duz = Math.abs(yerY(20, -60)) < 0.01;
      const sY = (z) => denizY(z, duz);
      const yasak = (x, z, p) => z > -1.6 && (Math.abs(x) < (p || 4.5) || Math.abs(x - hx) < (p || 4.2));
      const gx = ctx.B.gunesPos[0] + 20, gy = ctx.B.gunesPos[1] + 40;
      const dil = dilimGeo(T, 10);
      // esinti bölgeleri (oyun düzleminde): deniz pırıltısı bunların arkasında kısılır
      const esB = [new T.Vector4(1e4, 1e4, 1e4, 1e4), new T.Vector4(1e4, 1e4, 1e4, 1e4)];
      ((ctx.bolum && Array.isArray(ctx.bolum.esintiler)) ? ctx.bolum.esintiler : []).slice(0, 2).forEach((e, i) => { if (e && isFinite(e.x) && isFinite(e.y)) { const w = e.w || 12, h = e.h || 8; esB[i].set(e.x - w / 2, e.y, e.x + w / 2, e.y + h); } });

      // ── DENİZ: turkuaz dalgalar, kıyıya vuran köpük, güneşe uzanan pırıltı yolu ──
      {
        const g = new T.PlaneGeometry(560, 146, 90, 56); g.rotateX(-PI / 2); g.translate(80, 0, -78);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) p.setY(i, sY(p.getZ(i)));
        const m = new T.ShaderMaterial({
          transparent: true, depthWrite: true, fog: false,
          uniforms: { uT: ctx.U.uT, uGun: { value: new T.Vector3(gx, gy, -150) }, uE: { value: esB } },
          vertexShader: 'varying vec3 vW; void main(){ vW = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vW,1.0); }',
          fragmentShader: [
            'varying vec3 vW; uniform float uT; uniform vec3 uGun; uniform vec4 uE[2];',
            'float esinti(){ float t = cameraPosition.z / max(0.001, cameraPosition.z - vW.z); vec2 p = cameraPosition.xy + (vW.xy - cameraPosition.xy) * t; float k = 0.0;',
            ' for (int i = 0; i < 2; i++) { vec4 e = uE[i]; k = max(k, smoothstep(e.x - 2.0, e.x + 1.0, p.x) * smoothstep(e.z + 2.0, e.z - 1.0, p.x) * smoothstep(e.y - 1.5, e.y + 0.5, p.y) * smoothstep(e.w + 1.5, e.w - 0.5, p.y)); } return k; }',
            'void main(){',
            ' float d = clamp((-vW.z - 6.0) / 135.0, 0.0, 1.0);',
            ' vec3 yakin = vec3(0.16, 0.82, 0.80), orta = vec3(0.22, 0.62, 0.84), uzak = vec3(0.98, 0.76, 0.74);',
            ' vec3 c = mix(yakin, orta, smoothstep(0.0, 0.35, d)); c = mix(c, uzak, smoothstep(0.45, 1.0, d) * 0.85);',
            ' float dal = sin(vW.z * 1.3 + sin(vW.x * 0.23 + uT * 0.4) * 1.6 - uT * 1.1);',
            ' c += vec3(0.16, 0.2, 0.2) * smoothstep(0.75, 1.0, dal) * (1.0 - d);',
            ' c -= vec3(0.03, 0.05, 0.04) * smoothstep(0.2, -0.8, dal) * (1.0 - d);',
            ' float ux = (vW.x - cameraPosition.x) / max(1.0, cameraPosition.z - vW.z) - (uGun.x - cameraPosition.x) / (cameraPosition.z - uGun.z);',
            ' float yol = exp(-ux * ux * mix(260.0, 1400.0, d)) * (1.0 - 0.8 * esinti());',
            ' float par = pow(max(0.0, sin(vW.x * 2.7 + uT * 2.3 + sin(vW.z * 0.7) * 2.0) * sin(vW.z * 3.1 - uT * 1.6 + vW.x * 1.3)), 12.0) * smoothstep(0.1, 0.9, sin(vW.x * 0.37 + vW.z * 0.53 + uT * 0.4));',
            ' c = mix(c, vec3(1.0, 0.86, 0.62), yol * (0.25 + 0.4 * d));',
            ' c += vec3(1.0, 0.96, 0.86) * par * (0.12 + yol * 2.0) * (1.0 - d * 0.5);',
            ' float kz = -6.4 + sin(uT * 0.75) * 0.9 + sin(vW.x * 0.35 + uT * 0.5) * 0.35;',
            ' float kopuk = smoothstep(0.55, 0.0, abs(vW.z - kz)) + 0.55 * smoothstep(0.35, 0.0, abs(vW.z - kz + 1.6 + 0.3 * sin(vW.x * 0.6 - uT)));',
            ' c = mix(c, vec3(1.0, 0.99, 0.97), clamp(kopuk, 0.0, 1.0) * 0.9);',
            ' float a = vW.z > kz ? mix(0.5, 0.0, smoothstep(kz, -4.6, vW.z)) : 1.0;',
            ' gl_FragColor = vec4(c, max(a, clamp(kopuk, 0.0, 1.0) * 0.9));',
            '}'
          ].join('\n')
        });
        const deniz = new T.Mesh(g, m); deniz.renderOrder = 1; deniz.frustumCulled = false; ctx.ekle(deniz);
      }

      // ── UZAK: adalar, deniz feneri, yelkenliler ──
      for (const [x, z, w, h] of [[-60, -128, 22, 7], [-10, -138, 30, 9], [hx + 70, -126, 26, 8], [hx + 120, -136, 30, 10], [-120, -134, 26, 8]]) {
        S.ekle(G.kureO, x, sY(z) - 1.2, z, w, h, 7, 0xd0a0b8, 0xf2c4cc);
      }
      for (const [x, z, k] of [[-14, -136, 1.4], [-6, -137, 1.1], [hx + 68, -125, 1.3]]) palmiye(S, G, R, x, sY(z) + 7, z, k, 0.15, [[0xb88aa8, 0xd8a8c0]], true);
      // deniz feneri (kayalık adacıkta)
      const fx = hx * 0.72, fz = -44, fy = sY(fz);
      {
        for (let i = 0; i < 9; i++) { const a = i / 9 * PI * 2; S.ekle(G.kureO, fx + Math.cos(a) * 3.2, fy + 0.2, fz + Math.sin(a) * 1.8, ara(1.4, 2.2), ara(1.0, 1.8), ara(1.2, 1.8), 0x7a6a70, 0xb8a4a0); }
        S.ekle(G.kureO, fx, fy + 0.8, fz, 3.0, 1.6, 2.0, 0x8a7a7a, 0xc0aca8);
        const H = 9;
        for (let i = 0; i < 6; i++) { const r = 1.15 - i * 0.09; S.ekle(G.kule, fx, fy + 1.6 + H * (i + 0.5) / 6, fz, r, H / 6 * 1.02, r, i % 2 ? 0xe8e4e0 : 0xd8323a, i % 2 ? 0xffffff : 0xff5a5a); }
        const ty = fy + 1.6 + H;
        S.ekle(G.sil, fx, ty + 0.12, fz, 1.15, 0.24, 1.15, 0x3a3a4a, 0x5a5a6a);
        for (let k = 0; k < 10; k++) { const a = k / 10 * PI * 2; S.ekle(G.sil, fx + Math.cos(a) * 1.05, ty + 0.5, fz + Math.sin(a) * 1.05, 0.04, 0.6, 0.04, 0x3a3a4a, 0x5a5a6a); }
        S.ekle(G.koni, fx, ty + 1.95, fz, 0.95, 0.9, 0.95, 0xc82a32, 0xff5a5a);
        S.ekle(G.kureO, fx, ty + 2.5, fz, 0.18, 0.18, 0.18, 0xffd060, 0xfff0a0);
        // küçük ev
        S.ekle(G.kutu, fx + 2.6, fy + 2.2, fz + 0.4, 2.2, 1.5, 1.6, 0xe8e0d8, 0xffffff);
        S.ekle(G.koni4, fx + 2.6, fy + 3.4, fz + 0.4, 1.7, 1.0, 1.3, 0xc82a32, 0xff5a5a, 0, PI / 4, 0);
      }
      const L = ctx.yapi(); // fener ışığı ve ev penceresi (kendi ışığıyla)
      L.ekle(G.sil, fx, fy + 1.6 + 9 + 0.95, fz, 0.8, 1.1, 0.8, 0xffd060, 0xfff6c0);
      L.ekle(G.kutu, fx + 2.6, fy + 2.2, fz + 1.22, 0.5, 0.5, 0.05, 0xffd060, 0xfff0a0);
      ctx.veri.isik = ctx.ekle(new T.Mesh(L.geo(), ctx.malz(false, true, 0, { emissive: 0xffd878, emissiveIntensity: 1.0 }))).material;
      // yelkenliler: gölgelendiricide hafifçe sallanır ve yavaşça kayar
      {
        const Y = sayacli(ctx), oz = [], yel = new T.BufferGeometry();
        yel.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3)); yel.computeVertexNormals();
        const tekne = (x, z, k, c) => {
          const n0 = Y.n(), y = sY(z);
          Y.ekle(G.kureO, x, y + 0.05, z, 1.7 * k, 0.45 * k, 0.55 * k, 0x8a4a2a, 0xfff4ec);
          Y.ekle(G.sil, x + 0.1 * k, y + 1.9 * k, z, 0.05 * k, 3.6 * k, 0.05 * k, 0x8a6a4a, 0xb08a60);
          Y.ekle(yel, x + 0.2 * k, y + 0.55 * k, z + 0.02, 1.6 * k, 3.3 * k, 1, 0xfff4ec, 0xffffff);
          Y.ekle(yel, x - 0.05 * k, y + 0.6 * k, z + 0.02, -1.2 * k, 2.8 * k, 1, c, ctx.karH(c, 0xffffff, 0.4));
          Y.ekle(G.koni, x + 0.42 * k, y + 3.85 * k, z, 0.12 * k, 0.5 * k, 0.02, c, c, 0, 0, -PI / 2);
          oz.push([n0, Y.n(), x, y, z, R() * 6.28]);
        };
        tekne(hx * 0.3, -70, 1.3, 0xff6a8a); tekne(hx * 0.85, -88, 1.5, 0x3aa0e0); tekne(-22, -62, 1.2, 0xffb020);
        tekne(hx + 30, -66, 1.3, 0x40c890); tekne(hx * 0.55, -110, 1.8, 0xb070e0); tekne(-50, -96, 1.6, 0xff7a40);
        const geo = Y.geo(); nesneOz(T, geo, oz); yel.dispose();
        const tm = canliMalz(ctx, { roughness: 0.6, side: T.DoubleSide },
          'vec3 dyL = transformed - merk; float dyS = sin(uT * 1.3 + faz) * 0.06;' +
          'transformed.y += sin(uT * 1.1 + faz) * 0.18 + dyL.x * dyS; transformed.x += dyL.y * dyS * 0.6 + sin(uT * 0.05 + faz) * 6.0;');
        const tk = new T.Mesh(geo, tm); tk.frustumCulled = false; ctx.ekle(tk);
      }
      // martılar: gökte süzülür, kanat çırpar
      {
        const Y = sayacli(ctx), oz = [];
        for (let i = 0; i < 9; i++) {
          const x = -10 + i * (hx + 30) / 8 + ara(-4, 4), y = ara(18, 26), z = ara(-9, -24), k = ara(1.2, 1.6), n0 = Y.n();
          Y.ekle(G.kureO, x, y, z, 0.42 * k, 0.17 * k, 0.17 * k, 0xd8dce4, 0xffffff);
          Y.ekle(G.kureK, x + 0.4 * k, y + 0.08 * k, z, 0.15 * k, 0.13 * k, 0.13 * k, 0xe8ecf0, 0xffffff);
          Y.ekle(G.koni, x + 0.6 * k, y + 0.06 * k, z, 0.04 * k, 0.16 * k, 0.04 * k, 0xffa020, 0xffc040, 0, 0, -PI / 2);
          for (const q of [-1, 1]) {
            Y.ekle(G.kureK, x - 0.05 * k, y + 0.08 * k, z + q * 0.55 * k, 0.26 * k, 0.04 * k, 0.5 * k, 0xc8ccd8, 0xffffff, q * 0.25, 0, 0);
            Y.ekle(G.kureK, x - 0.15 * k, y + 0.2 * k, z + q * 1.15 * k, 0.18 * k, 0.03 * k, 0.4 * k, 0x6a7080, 0xc8ccd8, -q * 0.3, 0, 0);
          }
          oz.push([n0, Y.n(), x, y, z, R() * 6.28]);
        }
        const geo = Y.geo(); nesneOz(T, geo, oz);
        const mm = canliMalz(ctx, { roughness: 0.7, emissive: 0x5a5060, emissiveIntensity: 0.4 },
          'vec3 dyL = transformed - merk; float dyK = sin(uT * 5.0 + faz);' +
          'transformed.y += dyK * abs(dyL.z) * 0.55 + sin(uT * 0.6 + faz * 1.7) * 1.4;' +
          'transformed.x += sin(uT * 0.22 + faz) * 7.0; transformed.z += cos(uT * 0.22 + faz) * 3.0;');
        const ms = new T.Mesh(geo, mm); ms.frustumCulled = false; ctx.ekle(ms);
      }

      // ── KUMSAL: eğik palmiyeler, kumdan kale, şemsiyeler, can simidi ──
      const yR = [[0x2e8a4a, 0x7ad070], [0x3a9a50, 0x8ade7a], [0x268040, 0x68c060]];
      for (const [px, pz, k, e] of [[-12, -3.2, 1.1, 0.42], [-7.5, -4.4, 0.9, -0.3], [-17, -4.6, 1.0, 0.25], [hx * 0.24, -4.0, 1.05, 0.45], [hx * 0.5, -3.6, 0.95, -0.38], [hx * 0.5 + 3.2, -4.4, 0.8, 0.3],
        [hx * 0.8, -4.2, 1.0, 0.4], [hx + 9, -3.4, 1.15, -0.45], [hx + 13, -4.6, 0.9, 0.3], [hx + 22, -3.8, 1.0, -0.35], [-28, -3.6, 1.0, 0.4], [hx + 32, -4.2, 1.1, 0.3]]) {
        palmiye(S, G, R, px, yerY(px, pz), pz, k, e, yR);
        for (let j = 0; j < 2; j++) S.ekle(G.kureU, px + ara(-1.2, 1.2), 0.15, pz + ara(0.4, 1.4), 0.24, 0.24, 0.24, 0x5a3418, 0x8a5a2c);
      }
      // kumdan kale
      {
        const kx = hx * 0.36, kz = -3.6, kum = [0xd8b07a, 0xf4d8a4];
        S.ekle(G.kutu, kx, 0.3, kz, 2.8, 0.6, 1.8, kum[0], kum[1]);
        for (const [dx, dz] of [[-1.3, -0.8], [1.3, -0.8], [-1.3, 0.8], [1.3, 0.8]]) {
          S.ekle(G.sil, kx + dx, 0.75, kz + dz, 0.38, 1.5, 0.38, kum[0], kum[1]);
          for (let k = 0; k < 5; k++) { const a = k / 5 * PI * 2; S.ekle(G.kutu, kx + dx + Math.cos(a) * 0.3, 1.58, kz + dz + Math.sin(a) * 0.3, 0.16, 0.18, 0.16, kum[0], kum[1]); }
        }
        S.ekle(G.sil, kx, 1.25, kz, 0.62, 1.9, 0.62, kum[0], kum[1]);
        S.ekle(G.koni, kx, 2.55, kz, 0.68, 0.75, 0.68, kum[0], kum[1]);
        S.ekle(G.sil, kx, 3.2, kz, 0.02, 0.6, 0.02, 0x8a6a4a, 0x8a6a4a);
        S.ekle(G.koni, kx + 0.18, 3.38, kz, 0.1, 0.36, 0.02, 0xff4a6a, 0xff8aa0, 0, 0, -PI / 2);
        S.ekle(G.kureO, kx, 0.35, kz + 0.92, 0.32, 0.4, 0.06, 0x8a6a48, 0xa8845a);
        for (let k = 0; k < 5; k++) S.ekle(G.kureK, kx - 1.0 + k * 0.5, 0.62, kz + 0.92, 0.07, 0.07, 0.04, 0xff8aa8, 0xffd0dc); // deniz kabuğu süsleri
        S.ekle(G.kule, kx + 2.1, 0.32, kz + 0.6, 0.32, 0.6, 0.32, 0xd8323a, 0xff6a5a, PI, 0, 0); // kova
        S.ekle(G.torusSap, kx + 2.1, 0.62, kz + 0.6, 1, 1, 1, 0xe8e0d8, 0xffffff);
        S.ekle(G.kutu, kx + 2.8, 0.25, kz + 0.9, 0.12, 0.6, 0.04, 0x2a8ad8, 0x60c0ff, 0, 0, -0.5); // kürek
        S.ekle(G.kutu, kx + 3.0, 0.05, kz + 0.9, 0.36, 0.06, 0.26, 0x2a8ad8, 0x60c0ff, 0, 0, -0.5);
      }
      // kumdan kalenin yanında iki minik yengeç
      const yengec = (x, z, k) => {
        S.ekle(G.kureO, x, 0.16 * k, z, 0.32 * k, 0.18 * k, 0.24 * k, 0xe8402a, 0xff7a50);
        for (const q of [-1, 1]) {
          S.ekle(G.sil, x + q * 0.1 * k, 0.36 * k, z + 0.1 * k, 0.025 * k, 0.2 * k, 0.025 * k, 0xe8402a, 0xff7a50);
          S.ekle(G.kureK, x + q * 0.1 * k, 0.48 * k, z + 0.1 * k, 0.07 * k, 0.07 * k, 0.07 * k, 0xffffff, 0xffffff);
          S.ekle(G.kureK, x + q * 0.1 * k, 0.48 * k, z + 0.16 * k, 0.035 * k, 0.04 * k, 0.03 * k, 0x1a1a24, 0x1a1a24);
          S.ekle(G.kureO, x + q * 0.42 * k, 0.24 * k, z + 0.12 * k, 0.13 * k, 0.1 * k, 0.08 * k, 0xe8402a, 0xff7a50, 0, 0, q * 0.4);
          for (let j = 0; j < 3; j++) S.ekle(G.sil, x + q * (0.26 + j * 0.04) * k, 0.08 * k, z - 0.08 * k + j * 0.06 * k, 0.02 * k, 0.2 * k, 0.02 * k, 0xd83a2a, 0xff6a50, 0, 0, q * 1.1);
        }
      };
      yengec(hx * 0.36 - 2.2, -2.4, 1.0); yengec(hx * 0.62 - 2.5, 1.8, 0.9); yengec(-4.8, 2.6, 1.1);
      // şemsiye + havlu takımı
      const SC = [[0xff4a5a, 0xffffff], [0x2a9ad8, 0xfff4c0], [0xffa020, 0xffffff], [0x3cc0a0, 0xffffff], [0xb070e0, 0xfff0ff]];
      const semsiye = (x, z, k, c, egim) => {
        const top = 3.0 * k;
        S.ekle(G.sil, x + egim * top * 0.5, top / 2, z, 0.06 * k, top, 0.06 * k, 0xd8d0c8, 0xffffff, 0, 0, -egim);
        const tx = x + egim * top;
        for (let i = 0; i < 10; i++) S.ekle(dil, tx, top - 0.3 * k, z, 2.0 * k, 0.9 * k, 2.0 * k, i % 2 ? c[0] : c[1], i % 2 ? ctx.karH(c[0], 0xffffff, 0.3) : 0xffffff, 0, i * PI / 5, -egim * 0.8);
        S.ekle(G.kureK, tx, top + 0.62 * k, z, 0.12 * k, 0.12 * k, 0.12 * k, c[0], c[0]);
      };
      const havlu = (x, z, w, d, c, ry) => {
        for (let i = 0; i < 5; i++) { const u = (i - 2) / 5; S.ekle(G.kutu, x + Math.cos(ry) * u * w, 0.03, z - Math.sin(ry) * u * w, w / 5 + 0.01, 0.04, d, i % 2 ? 0xffffff : c, i % 2 ? 0xffffff : ctx.karH(c, 0xffffff, 0.2), 0, ry, 0); }
      };
      semsiye(-9.5, -1.8, 1.0, SC[1], 0.1); havlu(-8.4, -0.9, 2.2, 1.0, SC[1][0], 0.2);
      semsiye(hx * 0.62, -2.6, 0.95, SC[2], -0.12); havlu(hx * 0.62 + 1.2, -1.6, 2.0, 0.95, SC[3][0], -0.15);
      semsiye(hx + 15, -2.2, 1.05, SC[3], 0.12); havlu(hx + 16, -1.2, 2.2, 1.0, SC[4][0], 0.1);
      semsiye(hx * 0.18, -6.0, 0.9, SC[4], -0.1);
      // cankurtaran direği + can simidi
      {
        const cx = hx * 0.88, cz = -3.2, yay = new T.TorusGeometry(0.62, 0.2, 8, 6, PI / 4);
        S.ekle(G.sil, cx, 1.5, cz, 0.1, 3.0, 0.1, 0xf0e8e0, 0xffffff);
        S.ekle(G.kutu, cx, 3.0, cz, 0.9, 0.5, 0.06, 0xe8323a, 0xff5a5a);
        for (let k = 0; k < 8; k++) S.ekle(yay, cx, 1.9, cz + 0.16, 1, 1, 1, k % 2 ? 0xffffff : 0xe8323a, k % 2 ? 0xffffff : 0xff5a5a, 0, 0, k * PI / 4);
        yay.dispose();
      }
      // deniz kabukları ve denizyıldızları
      const yildizB = (x, z, k, c) => {
        for (let j = 0; j < 5; j++) { const a = j / 5 * PI * 2 + 0.3; S.ekle(G.kureK, x + Math.cos(a) * 0.2 * k, 0.04, z + Math.sin(a) * 0.2 * k, 0.24 * k, 0.06 * k, 0.09 * k, c[0], c[1], 0, -a, 0); }
        S.ekle(G.kureK, x, 0.05, z, 0.13 * k, 0.07 * k, 0.13 * k, c[0], c[1]);
      };
      const kabuk = (x, z, k, c) => {
        for (let j = 0; j < 5; j++) { const a = (j - 2) * 0.32; S.ekle(G.kureK, x + Math.sin(a) * 0.12 * k, 0.05, z - Math.cos(a) * 0.12 * k, 0.07 * k, 0.07 * k, 0.17 * k, c[0], c[1], 0, -a, 0); }
      };
      const helezon = (x, z, k) => { S.ekle(G.koni, x, 0.12 * k, z, 0.14 * k, 0.4 * k, 0.14 * k, 0xe8a088, 0xfff0e0, 0, 0, PI / 2 + 0.3); S.ekle(G.kureK, x - 0.12 * k, 0.1 * k, z, 0.14 * k, 0.14 * k, 0.14 * k, 0xf0b098, 0xffe8d8); };
      const YC = [[0xff6a3a, 0xffa070], [0xff5a8a, 0xffa0c0], [0xffb020, 0xffe070], [0xe85a5a, 0xff9a8a]], KC = [[0xffc0c8, 0xfff0f0], [0xffe0b0, 0xfffaf0], [0xd8c0f0, 0xfff4ff]];
      const kucuk = (x, z, i) => { const s = i % 4; if (s === 0) yildizB(x, z, ara(0.8, 1.3), YC[i % 4]); else if (s === 3) helezon(x, z, ara(0.8, 1.2)); else kabuk(x, z, ara(0.8, 1.3), KC[i % 3]); };
      for (let i = 0; i < 46; i++) { const x = ara(-30, hx + 30), z = ara(-1.6, -5); if (!yasak(x, z)) kucuk(x, z, i); }
      for (let i = 0; i < 36; i++) { const x = ara(-18, hx + 22), z = ara(1.2, 4); if (!yasak(x, -1, 4.6)) kucuk(x, z, i + 1); }
      const kayik = (x, z, ry, c) => { // kumda yatan küçük sandal
        S.ekle(G.kureO, x, 0.05, z, 1.6, 0.5, 0.65, 0xe8e0d8, 0xffffff, 0, ry, 0);
        S.ekle(G.kureO, x, 0.38, z, 1.5, 0.12, 0.6, c, ctx.karH(c, 0xffffff, 0.3), 0, ry, 0);
        S.ekle(G.kutu, x, 0.42, z, 0.18, 0.06, 1.0, 0xb07a48, 0xd09a60, 0, ry, 0);
        S.ekle(G.kutu, x + 0.6, 0.12, z + 1.0, 1.4, 0.05, 0.12, 0xb07a48, 0xd09a60, 0, ry + 0.4, 0);
      };
      const minikKale = (x, z) => {
        const kum = [0xd8b07a, 0xf4d8a4];
        S.ekle(G.kutu, x, 0.15, z, 1.3, 0.3, 0.9, kum[0], kum[1]);
        for (const dx of [-0.5, 0.5]) { S.ekle(G.sil, x + dx, 0.45, z, 0.22, 0.9, 0.22, kum[0], kum[1]); S.ekle(G.koni, x + dx, 1.05, z, 0.26, 0.32, 0.26, kum[0], kum[1]); }
        S.ekle(G.kule, x + 1.1, 0.2, z + 0.4, 0.2, 0.36, 0.2, 0xffc020, 0xffe070, PI, 0, 0);
      };
      for (let j = 0; j < 4; j++) { const bx = -10 + j * (hx + 20) / 3; kayik(bx + 3, 9.5, 0.25 - j * 0.2, [0xff6a8a, 0x3aa0e0, 0xffb020, 0x3cc0a0][j]); minikKale(bx - 4, 7.0 + (j % 2) * 3); }
      for (let i = 0; i < 90; i++) { // oyun alanı önü (alçak): kabuklar, kum tümsekleri, ayak izleri
        const x = ara(-18, hx + 24), z = ara(4.5, 15), y0 = -(z - 6) * 0.05 * (z > 6 ? 1 : 0);
        if (i % 4 === 0) S.ekle(G.kureO, x, y0 - 0.1, z, ara(1.6, 3.0), ara(0.2, 0.32), ara(0.8, 1.3), 0xf0d4a8, 0xfff2da, 0, ara(-0.3, 0.3), 0);
        else if (i % 4 === 1) { for (let j = 0; j < 4; j++) S.ekle(G.kureK, x + j * 0.55, y0 + 0.005, z + (j % 2) * 0.3, 0.13, 0.03, 0.08, 0xd8b88a, 0xe8c8a0); }
        else { const s = i % 4 === 2 ? 1.7 : 1.3; if (i % 8 === 2) yildizB(x, z, s, YC[i % 4]); else if (i % 8 === 6) kabuk(x, z, s, KC[i % 3]); else kucuk(x, z, i); }
      }
      // en ön (z 17..21): açık kum tümsekleri + deniz otları + kabuklar
      for (let i = 0; i < 44; i++) {
        const x = -40 + i * (hx + 80) / 43 + ara(-1, 1), z = ara(17, 21), r = ara(1.1, 1.8);
        S.ekle(G.kure, x, -0.85, z, r * 2.0, r * 1.15, r, 0xdcb488, 0xfff2d8, 0, ara(-0.3, 0.3), 0);
        if (i % 3 !== 2) for (let j = 0; j < 7; j++) S.ekle(G.bicak, x + (j - 3) * 0.22 + ara(-0.1, 0.1), -0.6 + r * 0.6, z + 0.3, 0.22, ara(1.0, 1.8), 1, 0x8aa860, 0xe8e8a8, 0, 0, (j - 3) * 0.2, 0.7);
        else yildizB(x, z + 0.9, 1.6, YC[i % 4]);
      }

      // ── BİLBO'NUN YERİ: çizgili havlu + şemsiye + plaj topu ──
      {
        havlu(hx, 0.15, 4.0, 1.9, 0x2a9ad8, 0);
        S.ekle(G.kureO, hx - 1.5, 0.14, -0.35, 0.5, 0.15, 0.35, 0xffd060, 0xfff0a0);
        semsiye(hx + 3.6, -4.4, 0.9, SC[0], -0.15);
        const top = [0xff4a5a, 0xffffff, 0xffc020, 0xffffff, 0x2a9ad8, 0xffffff];
        for (let k = 0; k < 6; k++) { const gg = new T.SphereGeometry(0.4, 6, 14, k * PI / 3, PI / 3); S.ekle(gg, hx - 2.7, 0.4, -1.15, 1, 1, 1, top[k], top[k], 0, 0.4, 0); gg.dispose(); }
        S.ekle(G.kule, hx + 2.6, 0.22, 1.1, 0.24, 0.42, 0.24, 0x3cc0a0, 0x80e8d0, PI, 0, 0);
        S.ekle(G.torusSap, hx + 2.6, 0.42, 1.1, 0.75, 0.75, 0.75, 0xe8e0d8, 0xffffff);
        yildizB(hx + 1.2, 1.4, 1.2, YC[0]); kabuk(hx - 1.0, 1.5, 1.2, KC[0]);
      }

      dil.dispose();
      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0, { roughness: 0.8, side: T.DoubleSide })));
      gunesDiski(ctx, ctx.B.gunesPos[0], ctx.B.gunesPos[1], 10, 0xfff2c0, 0xffa070, 1.0);
    },
    guncelle(t, dt, ctx) { // deniz feneri ışığı yavaşça yanıp söner
      const m = ctx.veri.isik; if (m) m.emissiveIntensity = 0.8 + 0.6 * Math.max(0, Math.sin(t * 1.3));
    }
  };

  // ═════════════════════════ 34 · GÖK ŞATOSU (bulutların üstü, gün batımı) ═════════════════════════
  DY_EK[34] = {
    palet: {
      ad: 'Gök Şatosu', gece: 0,
      sisRenk: 0xffd8e4, sisYogun: 0.0038, arka: 0xffd8e4,
      gok: [0xffc878, 0xffb0b8, 0xec98d0, 0x9a7ad8, 0x4a3c9c], gunesPos: [36, -14], gunesRenk: 0xffc87a,
      ykUst: 0xffeef8, ykAlt: 0xd0a8d8, ykGuc: 1.25, gnRenk: 0xffd0b0, gnGuc: 2.15, arkaRenk: 0xc890ff, arkaGuc: 0.65,
      dag: [[0xe8b8e0, 0xffd8e4], [0xdcaad8, 0xffd2e2], [0xd09cd0, 0xffcce0]],
      tepe: [0xf2d4ec, 0xffffff, 0xecc8e8, 0xfff4fc],
      agac: [[0xecc4e2, 0xffffff], [0xf2cce8, 0xffffff], [0xe4bcdc, 0xfff4fc]],
      zemin: [0xfff6fb, 0xf2d6ec, 0xffe6f0], cimen: [0xe8c8e8, 0xffffff, 0xfff0f8],
      cicek: [[0xff7ab0, 0xffc0dc], [0x8ab8ff, 0xd0e4ff], [0xffd060, 0xfff0a0], [0xc890ff, 0xeed8ff]],
      sisSerit: [0xfff0f6, 0xffdcec], siluet: [0xc8a0d0, 0xf0d0ec]
    },
    secenek: {
      cimenYok: true, cicekYok: true, agacYok: true, caliYok: true, tepeYok: true, dagYok: true, mantarSusYok: true,
      degirmenYok: true, kulubeYok: true, citYok: true, piknikTur: 'yok', bayrakYok: true, onSiluetYok: true, kusYok: true,
      ucusanTur: 'yok', zeminDesen: 'bulut', zeminParlak: 0.22, suRenk: [0xb48cf0, 0xffd8f2],
      salincak: { govde: [0xd8c4e8, 0xfff8ff], yaprak: [[0xf4c8e6, 0xffffff], [0xe4c0f4, 0xfff6ff]], sarmasik: [0xd8a020, 0xfff080], cicek: [[0xff7ab0, 0xffc0dc], [0x8ab8ff, 0xd0e4ff], [0xffd060, 0xfff0a0]], tacIsik: 0xffe8f6, kusYok: true }, bulutSay: 10, bulutRenk: [0xffc0dc, 0xfff8fc], yildizlar: 0.45
    },
    yardimci: {
      bulut: { alt: 0x9c84ec, ust: 0xfff4ff, yanak: 0xff7aa8, emissive: 0xc8b4ff },
      halka: { renk: [0xc88208, 0xffd040], emissive: 0xc07808, cicek: [[0xff3a7a, 0xffa0c8], [0x3aa0ff, 0xa8e0ff], [0x9a50ff, 0xe0b8ff], [0x30d0a0, 0xa8ffe0]] },
      esinti: { tur: 'isik', renk: 0xffffff, ton: 0xff8ac8, taneRenk: [0xffe8a0, 0xffc0e0, 0xffffff] },
      ruzgar: { renk: [0xffa8d8, 0xfff0fa], emissive: 0xff90c8, ok: 0xffffff },
      baloncuk: { renk: 0xd4bcff, kenar: 0xffffff, cizgi: 0x8a5ae0, opaklik: 1.25 },
      mantar: { sapka: [0x8a5ae0, 0xc8a8ff], govde: [0xf0e4f4, 0xffffff], benek: 0xffe070 },
      nilufer: { yaprak: [0xe8c8f0, 0xffffff], cicek: [0xff8ac0, 0xffd0e8] }
    },
    kur(ctx) {
      const { T, G, hx, yerY, R, ara } = ctx, S = ctx.yapi(), P = ctx.yapi(), L = ctx.yapi();
      const yasak = (x, z, p) => z > -1.6 && (Math.abs(x) < (p || 4.5) || Math.abs(x - hx) < (p || 4.2));
      const gx = ctx.B.gunesPos[0] + 20, gy = ctx.B.gunesPos[1] + 40;
      // pofuduk bulut kümesi (P: kendi ışığıyla yumuşak beyaz-pembe)
      const puf = (x, y, z, k, n, alt) => {
        const m = n || 5, ca = alt || 0xf8d8ee, kg = k > 4.2 ? G.kure : k < 1.25 ? G.kureU : G.kureO;
        for (let i = 0; i < m; i++) {
          const u = m === 1 ? 0 : (i / (m - 1)) * 2 - 1, r = k * (1 - Math.abs(u) * 0.4) * ara(0.85, 1.1);
          P.ekle(kg, x + u * k * 1.6, y + r * 0.25, z + ara(-0.4, 0.4) * k, r * 1.1, r * 0.9, r * 0.85, ca, 0xffffff);
        }
        P.ekle(kg, x + ara(-0.3, 0.3) * k, y + k * 0.75, z + 0.2 * k, k * 0.95, k * 0.85, k * 0.8, ctx.karH(ca, 0xffffff, 0.5), 0xffffff);
      };

      // ── UFUK: düz bulut denizi + gün batımına uzanan altın parıltı ──
      {
        const g = new T.PlaneGeometry(620, 134, 60, 40); g.rotateX(-PI / 2); g.translate(60, 0, -85);
        const gp = g.attributes.position, duz = Math.abs(yerY(20, -60)) < 0.01;
        for (let i = 0; i < gp.count; i++) gp.setY(i, denizY(gp.getZ(i), duz) - 0.05);
        const m = new T.ShaderMaterial({
          fog: false, transparent: true, uniforms: { uT: ctx.U.uT, uGun: { value: new T.Vector3(gx, gy, -150) } },
          vertexShader: 'varying vec3 vW; void main(){ vW = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vW,1.0); }',
          fragmentShader: 'varying vec3 vW; uniform float uT; uniform vec3 uGun; void main(){ float d = clamp((-vW.z - 40.0) / 110.0, 0.0, 1.0);' +
            ' vec3 c = mix(vec3(1.0, 0.95, 0.98), vec3(1.0, 0.8, 0.68), smoothstep(0.2, 1.0, d));' +
            ' float n = sin(vW.x * 0.11 + uT * 0.04) * sin(vW.z * 0.27 - uT * 0.03) + 0.5 * sin(vW.x * 0.29 - vW.z * 0.13 + uT * 0.05);' +
            ' c *= 0.93 + 0.07 * smoothstep(-0.6, 0.9, n);' +
            ' float ux = (vW.x - cameraPosition.x) / max(1.0, cameraPosition.z - vW.z) - (uGun.x - cameraPosition.x) / (cameraPosition.z - uGun.z);' +
            ' c = mix(c, vec3(1.0, 0.86, 0.55), exp(-ux * ux * 300.0) * (0.3 + 0.5 * d));' +
            ' gl_FragColor = vec4(c, smoothstep(-18.0, -27.0, vW.z)); }'
        });
        const ms = new T.Mesh(g, m); ms.frustumCulled = false; ms.renderOrder = 1; ctx.ekle(ms);
      }
      // ufuk ve uzak bulut tepeleri
      for (let i = 0; i < 16; i++) { const x = -110 + i * (hx + 220) / 15 + ara(-6, 6); puf(x, 5.5, ara(-96, -128), ara(6, 9), 6, 0xf8c8d8); }
      for (let i = 0; i < 14; i++) { const x = -70 + i * (hx + 140) / 13 + ara(-5, 5), z = ara(-64, -80); puf(x, yerY(x, z) + ara(1, 3), z, ara(4.5, 6.5), 6); }
      const BLx = (ctx.bolum && Array.isArray(ctx.bolum.bulutlar)) ? ctx.bolum.bulutlar.map((b) => b && b.x).filter((v) => isFinite(v)) : [];
      const bulutArkasi = (x, p) => BLx.some((bx) => Math.abs(x - bx) < p);
      for (let i = 0; i < 14; i++) { const x = -50 + i * (hx + 100) / 13 + ara(-4, 4), z = ara(-30, -44); if (bulutArkasi(x, 7)) continue; puf(x, yerY(x, z) + ara(0.2, 1.4), z, ara(2.6, 3.8), 5); }
      for (let i = 0; i < 16; i++) { const x = -30 + i * (hx + 60) / 15 + ara(-3, 3), z = ara(-12, -22); if ((Math.abs(x - hx * 0.55) < 9 && z < -18) || bulutArkasi(x, 5)) continue; puf(x, yerY(x, z) + 0.1, z, ara(1.3, 2.2), 4); }

      // ── ŞATO: bulutların içinden yükselen sivri kuleli masal şatosu ──
      const DUV = [0xf0dcf0, 0xfffaff], CAT = [[0x7a52d8, 0xb898ff], [0xe0508e, 0xff98c8], [0x3a7ee0, 0x88c4ff]];
      const bayrak = []; // [x, y, z, renk]
      const kule = (x, by, z, r, h, cat, bay, pencere) => {
        S.ekle(G.sil, x, by + h / 2, z, r, h, r, DUV[0], DUV[1]);
        S.ekle(G.sil, x, by + h + 0.12, z, r * 1.12, 0.3, r * 1.12, 0xe8c8e8, 0xffffff);
        const rh = r * 2.6;
        S.ekle(G.koni, x, by + h + 0.25 + rh / 2, z, r * 1.25, rh, r * 1.25, cat[0], cat[1]);
        S.ekle(G.kureO, x, by + h + 0.3 + rh, z, r * 0.16, r * 0.16, r * 0.16, 0xe8a818, 0xfff080);
        S.ekle(G.sil, x, by + h + 0.3 + rh + 0.6, z, 0.04, 1.2, 0.04, 0xc89020, 0xffe070);
        if (bay != null) bayrak.push([x, by + h + 0.3 + rh + 1.05, z, bay]);
        for (let k = 0; k < (pencere || 0); k++) {
          const wy = by + h * (0.35 + k * 0.25);
          L.ekle(G.kutu, x, wy, z + r * 0.98, r * 0.32, r * 0.5, 0.06, 0xffc040, 0xfff0a0);
          L.ekle(G.kureK, x, wy + r * 0.25, z + r * 0.98, r * 0.16, r * 0.16, 0.04, 0xfff0a0, 0xfff0a0);
        }
      };
      const sato = (cx, cz, k, ana) => {
        const by = yerY(cx, cz) - 1.0;
        // gövde + mazgallar
        S.ekle(G.sil, cx, by + 4.5 * k, cz, 5.5 * k, 9 * k, 3.6 * k, DUV[0], DUV[1]);
        for (let i = 0; i < 18; i++) { const a = i / 18 * PI * 2; S.ekle(G.kutu, cx + Math.cos(a) * 5.4 * k, by + 9.3 * k, cz + Math.sin(a) * 3.5 * k, 0.8 * k, 0.7 * k, 0.8 * k, 0xead2ea, 0xffffff, 0, -a, 0); }
        // kapı
        S.ekle(G.kureO, cx, by + 1.6 * k, cz + 3.55 * k, 1.5 * k, 2.4 * k, 0.15 * k, 0xd8a020, 0xffd860);
        S.ekle(G.kureO, cx, by + 1.6 * k, cz + 3.62 * k, 1.2 * k, 2.1 * k, 0.12 * k, 0x8a4a9a, 0xb070c8);
        for (let i = 0; i < 5; i++) L.ekle(G.kutu, cx + (i - 2) * 1.9 * k, by + 6 * k, cz + 3.6 * k, 0.55 * k, 0.9 * k, 0.06, 0xffc040, 0xfff0a0);
        // orta büyük kule + çevre kuleler
        kule(cx, by + 9 * k, cz, 2.5 * k, 9 * k, CAT[0], 0xff5a9a, ana ? 2 : 1);
        kule(cx - 6.4 * k, by, cz + 1.6 * k, 1.7 * k, 13 * k, CAT[1], 0xffc020, 3);
        kule(cx + 6.4 * k, by, cz + 1.6 * k, 1.7 * k, 14 * k, CAT[2], 0x5ac0ff, 3);
        if (ana) {
          kule(cx - 3.8 * k, by, cz - 3.2 * k, 1.5 * k, 17 * k, CAT[2], 0xa070ff, 2);
          kule(cx + 3.6 * k, by, cz - 3.4 * k, 1.4 * k, 19 * k, CAT[1], 0xffe060, 2);
          // asılı küçük kuleler
          for (const q of [-1, 1]) {
            const tx = cx + q * 4.3 * k, ty = by + 12.5 * k, tz = cz + 3.4 * k;
            S.ekle(G.sil, tx, ty, tz, 0.7 * k, 2.4 * k, 0.7 * k, DUV[0], DUV[1]);
            S.ekle(G.koni, tx, ty - 1.6 * k, tz, 0.7 * k, 0.9 * k, 0.7 * k, 0xe8c8e8, DUV[0], PI, 0, 0);
            S.ekle(G.koni, tx, ty + 2.4 * k, tz, 0.9 * k, 2.4 * k, 0.9 * k, CAT[q < 0 ? 0 : 1][0], CAT[q < 0 ? 0 : 1][1]);
          }
        }
        // tabanı saran bulutlar
        for (let i = 0; i < 9; i++) { const u = (i / 8) * 2 - 1; puf(cx + u * 8 * k, by + 0.4, cz + 4 * k + ara(-0.5, 1.5), ara(1.8, 2.8) * k, 4); }
      };
      const scx = hx * 0.55, scz = -58;
      sato(scx, scz, 1.0, true);
      sato(hx + 34, -76, 0.7, false);
      sato(-38, -84, 0.6, false);

      // gökkuşağı köprüsü (şato kapısından sola, bulutlara iner)
      {
        const K = ctx.yapi(), RR = [0xff4a7a, 0xff9a3a, 0xffe050, 0x5ad87a, 0x3ab4ff, 0x6a7aff, 0xb860ff];
        const by = yerY(scx, scz) - 1.0, rcx = scx - 14, rcz = scz + 3;
        for (let i = 0; i < 7; i++) { const tg = new T.TorusGeometry(14 - i * 0.55, 0.3, 6, 44, PI); K.ekle(tg, rcx, by, rcz, 1, 0.72, 1, RR[i], RR[i]); tg.dispose(); }
        const km = new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.62, depthWrite: false });
        const kk = new T.Mesh(K.geo(), km); kk.renderOrder = 1; ctx.ekle(kk);
        puf(rcx - 14, by + 0.5, rcz + 1, 2.4, 4); puf(rcx + 14, by + 0.5, rcz + 2, 2.0, 4);
      }

      // ── yüzen adacıklar (şelaleli) + sıcak hava balonları: gölgelendiricide süzülür ──
      const AD = sayacli(ctx), adOz = [], selP = [], selU = [], selF = [];
      const ada = (x, y, z, k) => {
        const n0 = AD.n(), f = R() * 6.28;
        AD.ekle(G.koni, x, y - 2.0 * k, z, 2.6 * k, 4.0 * k, 2.0 * k, 0x8a5a48, 0xc89a78, PI, 0, 0);
        AD.ekle(G.koni, x + 1.0 * k, y - 1.2 * k, z + 0.3, 1.2 * k, 2.2 * k, 1.0 * k, 0x8a5a48, 0xb88a68, PI, 0, 0.2);
        AD.ekle(G.kureO, x, y, z, 2.9 * k, 0.55 * k, 2.2 * k, 0x5ab060, 0x9ae07a);
        AD.ekle(G.sil, x - 0.8 * k, y + 0.8 * k, z - 0.3, 0.12 * k, 1.4 * k, 0.12 * k, 0x8a5a38, 0xb07a50);
        AD.ekle(G.kureO, x - 0.8 * k, y + 1.9 * k, z - 0.3, 0.9 * k, 0.85 * k, 0.8 * k, 0x3c9a56, 0x8ad870);
        AD.ekle(G.kureO, x + 1.1 * k, y + 0.5 * k, z + 0.4, 0.55 * k, 0.4 * k, 0.5 * k, 0x48a85a, 0x90dc78);
        for (let j = 0; j < 4; j++) { const c = ctx.B.cicek[j % 4]; AD.ekle(G.kureK, x + (j - 1.5) * 0.6 * k, y + 0.45 * k, z + 1.5 * k, 0.16 * k, 0.16 * k, 0.1 * k, c[0], c[1]); }
        adOz.push([n0, AD.n(), x, y, z, f]);
        // şelale: adanın ön kenarından aşağı
        const w = 0.7 * k, h = 4.5 * k, sx = x + 1.4 * k, st = y + 0.1, sz = z + 1.7 * k;
        selP.push(sx - w, st - h, sz, sx + w, st - h, sz, sx + w, st, sz, sx - w, st - h, sz, sx + w, st, sz, sx - w, st, sz);
        selU.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
        for (let j = 0; j < 6; j++) selF.push(f);
      };
      ada(-20, 23, -34, 1.0); ada(6, 27, -46, 1.2); ada(scx + 22, 25, -44, 1.1); ada(hx + 18, 21, -32, 0.9); ada(hx + 44, 26, -50, 1.2); ada(-46, 19, -52, 1.1);
      // balonlar
      const BR = [[0xff4a7a, 0xffd040], [0x3ab4ff, 0xffffff], [0xffa030, 0xff5a5a], [0x8a5ae0, 0x5ad8c0], [0x5ad87a, 0xfff060], [0xff7ac0, 0x7ab0ff], [0xffd040, 0xe8505a]];
      const balon = (x, y, z, k, c) => {
        const n0 = AD.n();
        for (let i = 0; i < 8; i++) { const gg = new T.SphereGeometry(1, 2, 10, i * PI / 4, PI / 4); AD.ekle(gg, x, y, z, 1.5 * k, 1.75 * k, 1.5 * k, c[i % 2], ctx.karH(c[i % 2], 0xffffff, 0.25)); gg.dispose(); }
        AD.ekle(G.kule, x, y - 1.95 * k, z, 0.55 * k, 0.5 * k, 0.55 * k, c[0], c[1], PI, 0, 0);
        AD.ekle(G.kutu, x, y - 3.05 * k, z, 0.6 * k, 0.5 * k, 0.6 * k, 0x8a5a30, 0xc89058);
        for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) AD.ekle(G.sil, x + dx * 0.3 * k, y - 2.5 * k, z + dz * 0.3 * k, 0.02 * k, 0.9 * k, 0.02 * k, 0x6a4a30, 0x8a6a48);
        adOz.push([n0, AD.n(), x, y, z, R() * 6.28]);
      };
      balon(-8, 17, -22, 1.0, BR[0]); balon(14, 24, -30, 0.9, BR[1]); balon(hx * 0.5 - 6, 29, -26, 0.8, BR[2]); balon(hx * 0.7, 17, -24, 0.95, BR[3]);
      balon(hx - 4, 27, -34, 1.0, BR[4]); balon(hx + 12, 15, -20, 0.9, BR[5]); balon(-30, 26, -36, 1.1, BR[6]); balon(hx + 30, 22, -26, 1.0, BR[0]);
      {
        const geo = AD.geo(); nesneOz(T, geo, adOz);
        const mm = canliMalz(ctx, { roughness: 0.6 }, 'transformed.y += sin(uT * 0.7 + faz) * 0.55; transformed.x += sin(uT * 0.17 + faz) * 0.9;');
        const ms = new T.Mesh(geo, mm); ms.frustumCulled = false; ctx.ekle(ms);
        const sg = new T.BufferGeometry();
        sg.setAttribute('position', new T.Float32BufferAttribute(selP, 3)); sg.setAttribute('uv', new T.Float32BufferAttribute(selU, 2)); sg.setAttribute('faz', new T.Float32BufferAttribute(selF, 1));
        const sm = new T.ShaderMaterial({
          transparent: true, depthWrite: false, uniforms: { uT: ctx.U.uT },
          vertexShader: 'attribute float faz; varying vec2 vU; uniform float uT; void main(){ vU = uv; vec3 p = position; p.y += sin(uT * 0.7 + faz) * 0.55; p.x += sin(uT * 0.17 + faz) * 0.9; gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }',
          fragmentShader: 'varying vec2 vU; uniform float uT; void main(){ float iz = smoothstep(0.4, 1.0, sin(vU.x * 22.0 + sin(vU.y * 3.0) * 0.6));' +
            ' float ak = 0.5 + 0.5 * sin(vU.y * 16.0 + uT * 9.0 + vU.x * 5.0); float s = 0.25 + 0.55 * iz * ak + 0.35 * smoothstep(0.3, 0.0, vU.y);' +
            ' vec3 c = mix(vec3(0.5, 0.82, 1.0), vec3(1.0), clamp(s, 0.0, 1.0));' +
            ' float a = 0.85 * smoothstep(0.0, 0.25, vU.x) * smoothstep(1.0, 0.75, vU.x) * smoothstep(0.0, 0.5, vU.y); gl_FragColor = vec4(c, a); }'
        });
        const se = new T.Mesh(sg, sm); se.frustumCulled = false; se.renderOrder = 2; ctx.ekle(se);
      }
      // dalgalanan bayraklar
      {
        const FB = sayacli(ctx), oz = [];
        for (const [x, y, z, c] of bayrak) { const n0 = FB.n(); FB.ekle(G.koni, x + 0.7, y, z, 0.32, 1.4, 0.04, c, ctx.karH(c, 0xffffff, 0.35), 0, 0, -PI / 2); oz.push([n0, FB.n(), x, y, z, R() * 6.28]); }
        const geo = FB.geo(); nesneOz(T, geo, oz);
        const mm = canliMalz(ctx, { roughness: 0.6, side: T.DoubleSide, emissive: 0x402030, emissiveIntensity: 0.4 },
          'vec3 dyL = transformed - merk; transformed.z += sin(uT * 5.0 - dyL.x * 2.6 + faz) * 0.22 * max(dyL.x, 0.0); transformed.y += sin(uT * 4.0 - dyL.x * 2.0 + faz) * 0.06 * dyL.x;');
        const ms = new T.Mesh(geo, mm); ms.frustumCulled = false; ctx.ekle(ms);
      }

      // kule tepelerinden yükselen yumuşak yıldız tozu (yuvarlak ışık noktaları; toplanan yıldızlara benzemesin)
      if (bayrak.length) {
        const N = 90, pp = [], ff = [];
        for (let i = 0; i < N; i++) { const t = bayrak[i % bayrak.length]; pp.push(t[0] + ara(-0.6, 0.6), t[1] - 1.0, t[2] + ara(-0.4, 0.4)); ff.push(R()); }
        const tg = new T.BufferGeometry(); tg.setAttribute('position', new T.Float32BufferAttribute(pp, 3)); tg.setAttribute('faz', new T.Float32BufferAttribute(ff, 1));
        const tm = new T.ShaderMaterial({
          transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: { uT: ctx.U.uT },
          vertexShader: 'attribute float faz; uniform float uT; varying float vA; varying float vF; void main(){ float u = fract(uT * 0.12 + faz); vec3 p = position;' +
            ' p.y += u * 9.0; p.x += sin(uT * 0.9 + faz * 20.0) * (0.4 + u * 1.6); vA = sin(u * 3.1416) * (0.6 + 0.4 * sin(uT * 5.0 + faz * 30.0)); vF = faz;' +
            ' vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = (0.28 + 0.2 * fract(faz * 7.0)) * 900.0 / -mv.z; gl_Position = projectionMatrix * mv; }',
          fragmentShader: 'varying float vA; varying float vF; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d) * vA;' +
            ' vec3 c = mix(vec3(1.0, 0.85, 0.55), vec3(1.0, 0.7, 0.9), step(0.5, fract(vF * 3.0))); gl_FragColor = vec4(c * a, a); }'
        });
        const tp = new T.Points(tg, tm); tp.frustumCulled = false; tp.renderOrder = 2; ctx.ekle(tp);
      }

      // ── YAKIN: alçak bulut topakları, pastel inci ve mücevherler ──
      const MC = [[0xff7ab0, 0xffd0e4], [0x7ab8ff, 0xd8ecff], [0xb88aff, 0xeedcff], [0x6ae0c0, 0xd0fff0]];
      for (let i = 0; i < 30; i++) { const x = ara(-26, hx + 26), z = ara(-2, -9); if (!yasak(x, z, 5)) puf(x, -0.3, z, ara(0.5, 1.0), 3); }
      for (let i = 0; i < 26; i++) {
        const x = ara(-22, hx + 22), z = ara(-1.8, -7); if (yasak(x, z)) continue;
        const c = MC[i % 4];
        if (i % 2) S.ekle(G.oct, x, 0.25, z, 0.2, 0.3, 0.2, c[0], c[1], 0, ara(0, 3), 0); else S.ekle(G.kureU, x, 0.12, z, 0.14, 0.14, 0.14, 0xf0e4f0, 0xffffff);
      }
      for (let i = 0; i < 24; i++) { const x = ara(-18, hx + 18), z = ara(1.4, 4); if (!yasak(x, -1, 4.6)) puf(x, -0.35, z, ara(0.4, 0.7), 3); }
      for (let i = 0; i < 26; i++) { const x = ara(-20, hx + 24), z = ara(5, 15); puf(x, -0.45 - (z > 6 ? (z - 6) * 0.05 : 0), z, ara(0.7, 1.4), 4); }
      // en ön (z 17..21): iri pofuduk bulutlar
      for (let i = 0; i < 40; i++) { const x = -40 + i * (hx + 80) / 39 + ara(-1, 1); puf(x, -0.9, ara(17, 21), ara(1.2, 1.9), 4, 0xf0c8e6); }

      // ── BİLBO'NUN YERİ: kırmızı halı + altın direkler + taçlı yastık ──
      {
        S.ekle(G.kutu, hx, 0.05, 0.1, 7.6, 0.08, 1.5, 0xb81c2c, 0xe83a4a);
        for (const q of [-1, 1]) S.ekle(G.kutu, hx, 0.07, 0.1 + q * 0.72, 7.6, 0.08, 0.08, 0xd8a020, 0xffe070);
        for (let i = 0; i < 12; i++) for (const q of [-1, 1]) S.ekle(G.kureC, hx - 3.75 + i * (7.5 / 11), 0.06, 0.1 + q * 0.84, 0.05, 0.04, 0.08, 0xffd060, 0xfff0a0);
        const dz = -1.5;
        for (const dx of [-3.4, -1.2, 1.2, 3.4]) { S.ekle(G.sil, hx + dx, 0.5, dz, 0.07, 1.0, 0.07, 0xd8a020, 0xffe070); S.ekle(G.kureO, hx + dx, 1.05, dz, 0.15, 0.15, 0.15, 0xe8b030, 0xfff080); S.ekle(G.sil, hx + dx, 0.03, dz, 0.28, 0.06, 0.28, 0xd8a020, 0xffe070); }
        for (const [a, b] of [[-3.4, -1.2], [1.2, 3.4]]) for (let i = 0; i < 6; i++) {
          const u0 = i / 6, u1 = (i + 1) / 6, xa = hx + a + (b - a) * u0, xb = hx + a + (b - a) * u1, ya = 0.98 - Math.sin(u0 * PI) * 0.3, yb = 0.98 - Math.sin(u1 * PI) * 0.3;
          S.ekle(G.sil, (xa + xb) / 2, (ya + yb) / 2, dz, 0.055, Math.hypot(xb - xa, yb - ya) + 0.06, 0.055, 0xa81c3c, 0xd83a5a, 0, 0, -Math.atan2(xb - xa, yb - ya));
        }
        for (let i = 0; i < 10; i++) { const q = i % 2 ? 1 : -1, x = hx + q * ara(1.6, 4.4), z = ara(1.8, 3.6); puf(x, -0.3, z, ara(0.35, 0.6), 3); }
        // taçlı yastık
        S.ekle(G.kureO, hx - 2.4, 0.22, -1.05, 0.5, 0.2, 0.42, 0x6a3ac0, 0x9a6ae8);
        S.ekle(G.kule, hx - 2.4, 0.55, -1.05, 0.22, 0.22, 0.22, 0xd8a020, 0xffe070);
        for (let k = 0; k < 5; k++) { const a = k / 5 * PI * 2; S.ekle(G.koni, hx - 2.4 + Math.cos(a) * 0.2, 0.74, -1.05 + Math.sin(a) * 0.2, 0.06, 0.18, 0.06, 0xd8a020, 0xffe070); S.ekle(G.kureK, hx - 2.4 + Math.cos(a) * 0.2, 0.84, -1.05 + Math.sin(a) * 0.2, 0.04, 0.04, 0.04, 0xff4a7a, 0xffa0c0); }
        puf(hx - 4.6, -0.2, -2.6, 0.9, 3); puf(hx + 4.7, -0.2, -2.4, 1.0, 3);
      }

      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0, { roughness: 0.6 })));
      ctx.ekle(new T.Mesh(P.geo(), ctx.malz(true, true, 0, { roughness: 0.95, emissive: 0xfff0f8, emissiveIntensity: 0.5 })));
      ctx.veri.isik = ctx.ekle(new T.Mesh(L.geo(), ctx.malz(false, true, 0, { emissive: 0xffd070, emissiveIntensity: 1.1 }))).material;
      gunesDiski(ctx, ctx.B.gunesPos[0], ctx.B.gunesPos[1], 10, 0xffeab0, 0xff9a70, 1.0);
    },
    guncelle(t, dt, ctx) { // şato pencereleri yumuşakça ışıldar
      const m = ctx.veri.isik; if (m) m.emissiveIntensity = 1.0 + 0.25 * Math.sin(t * 1.6);
    }
  };
})();
