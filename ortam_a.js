/* ortam_a.js — u2-ortam-a: biyom 21 Yağmurlu Orman, 25 Fırtına Tepesi, 32 Lale Tarlaları (dunya.js ortam eklentisi; bkz. DY_EK) */
(function () {
  'use strict';
  window.DY_EK = window.DY_EK || {};
  const PI = Math.PI;

  // ───────── ortak yardımcılar (yalnız kur içinde çağrılır) ─────────
  // Euler XYZ, rx = 0: önce rz (eğim), sonra ry (yön) — yerel noktanın dünya karşılığı
  function oaDon(x, y, z, rz, ry) {
    const cz = Math.cos(rz), sz = Math.sin(rz), x1 = x * cz - y * sz, y1 = x * sz + y * cz;
    const cy = Math.cos(ry), sy = Math.sin(ry);
    return [x1 * cy + z * sy, y1, -x1 * sy + z * cy];
  }
  // Eğrelti yaprağı: sap +y boyunca (0..1), yaprakçıklar ±z, uç +x'e sarkar
  function oaEgrelti(T, n, sark) {
    const pos = [], dx = (y) => sark * y * y;
    for (let i = 0; i < n; i++) {
      const y0 = i / n, y1 = (i + 1) / n, yt = Math.min(1.02, y1 + 0.05);
      const L = 0.3 * Math.pow(1 - y0, 0.55) * Math.min(1, 0.35 + y0 * 5);
      for (const s of [-1, 1]) {
        pos.push(dx(y0), y0, 0, dx(y1), y1, 0, dx(yt) - 0.06 * L, yt, s * L);
      }
    }
    pos.push(dx(0.9), 0.9, 0, dx(1), 1.02, -0.03, dx(1), 1.02, 0.03);
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    return g;
  }
  // Geniş yaprak (muz / fil kulağı): sap +y, genişlik ±z, ortası katlı, uç +x'e sarkar
  function oaGenis(T, seg, sark, gen) {
    const pos = [], dx = (y) => sark * y * y, w = (y) => gen * Math.pow(Math.sin(PI * Math.pow(y, 0.85)), 0.8);
    const P = (y, k) => [dx(y) - Math.abs(k) * 0.12 * gen, y, k * w(y)];
    for (let i = 0; i < seg; i++) {
      const a = i / seg, b = (i + 1) / seg;
      for (const k of [-1, 1]) {
        const a0 = P(a, 0), b0 = P(b, 0), a1 = P(a, k), b1 = P(b, k);
        pos.push(...a0, ...b0, ...a1, ...a1, ...b0, ...b1);
      }
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    return g;
  }
  // Lale kadehi: üstü taçlı, altı yuvarlak (tabanı y=0, boy 1)
  function oaLale(T) {
    const p = [];
    const prof = [[0.0, 0.0], [0.4, 0.1], [0.55, 0.4], [0.5, 0.72], [0.36, 0.9], [0.44, 1.0], [0.0, 0.88]];
    for (const [r, y] of prof) p.push(new T.Vector2(r, y));
    return new T.LatheGeometry(p, 5);
  }
  // Rozet: n yaprak/eğrelti etrafa yayılır
  function oaRozet(S, geo, x, y, z, n, boy, gen, egim0, egim1, r1, r2, sal, ctx, kayd) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const ry = (i / n) * PI * 2 + ctx.ara(-0.3, 0.3) + (kayd || 0), a = ctx.ara(egim0, egim1), b = boy * ctx.ara(0.8, 1.15);
      S.ekle(geo, x, y, z, b, b, b * gen, r1, r2, 0, ry, -a, sal);
      out.push([ry, a, b]);
    }
    return out;
  }

  // Su birikintisi: yuvarlak-organik, kenarı saydamlaşarak ıslak toprağa karışır (tek çizim; kendi gölgelendiricisi)
  function oaGolYapi() {
    const pos = [], uv = [];
    return {
      renk: null,
      ekle(x, y, z, w, d, R) {
        const N = 26, p1 = R() * 6, p2 = R() * 6, P = [], rr = [];
        for (let i = 0; i < N; i++) { const a = i / N * PI * 2; rr.push(1 + 0.13 * Math.sin(2 * a + p1) + 0.08 * Math.sin(3 * a + p2)); P.push(a); }
        const V = (i, k) => { const a = P[i % N], r = rr[i % N] * k; return [x + Math.cos(a) * r * w, y, z + Math.sin(a) * r * d, Math.cos(a) * k, Math.sin(a) * k]; };
        const put = (v) => { pos.push(v[0], v[1], v[2]); uv.push(v[3], v[4]); };
        const c = [x, y, z, 0, 0];
        for (let i = 0; i < N; i++) {
          const a0 = V(i, 1), a1 = V(i + 1, 1), b0 = V(i, 1.3), b1 = V(i + 1, 1.3);
          put(c); put(a1); put(a0);
          put(a0); put(a1); put(b1); put(a0); put(b1); put(b0);
        }
      },
      mesh(ctx) {
        const T = ctx.T, g = new T.BufferGeometry(), r = this.renk || [0x3a6a34, 0x86b0c6, 0xcfe8f2];
        g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
        const m = new T.ShaderMaterial({
          transparent: true, depthWrite: false, fog: false,
          uniforms: { uK: { value: new T.Color(r[0]) }, uS: { value: new T.Color(r[1]) }, uP: { value: new T.Color(r[2]) }, uT: ctx.U.uT },
          vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: 'varying vec2 vU; uniform vec3 uK; uniform vec3 uS; uniform vec3 uP; uniform float uT; void main(){' +
            ' float r = length(vU); float su = smoothstep(1.0, 0.78, r); float kenar = smoothstep(1.3, 0.95, r) * 0.45;' +
            ' vec2 q = (vU - vec2(-0.32, -0.28)) * vec2(1.0, 2.2); float p = smoothstep(0.55, 0.0, length(q)) * (0.75 + 0.25 * sin(uT * 1.3 + vU.x * 3.0));' +
            ' vec3 c = mix(uS, uP, p * 0.8 + 0.15 * (1.0 - r)); c = mix(uK, c, su);' +
            ' gl_FragColor = vec4(c, max(su * 0.92, kenar)); }'
        });
        const ms = new T.Mesh(g, m); ms.renderOrder = 1; return ms;
      }
    };
  }
  function oaBirikinti(ctx, S, PU, gol, x, z, w, d, kenar, su, parla) {
    const y = ctx.yerY(x, z);
    if (!PU.renk) PU.renk = [kenar, su, parla];
    PU.ekle(x, y + 0.03, z, w, d, ctx.R);
    gol.push([x, y + 0.05, z, w, d]);
  }
  // Birikintilerde yağmur halkaları (tek InstancedMesh, açık renkten su rengine söner)
  function oaHalkaKur(ctx, gol, su) {
    const T = ctx.T, V = ctx.veri; if (!gol.length) return;
    const NH = Math.min(48, gol.length * 3), hm = new T.MeshBasicMaterial({ color: 0xffffff });
    const geo = new T.RingGeometry(0.82, 1, 20, 1); geo.rotateX(-PI / 2);
    const im = new T.InstancedMesh(geo, hm, NH); im.frustumCulled = false;
    for (let i = 0; i < NH; i++) im.setColorAt(i, new T.Color(0xffffff));
    ctx.ekle(im);
    const hl = [];
    for (let i = 0; i < NH; i++) { const g = gol[i % gol.length]; hl.push([g[0] + ctx.ara(-0.55, 0.55) * g[3], g[1] + 0.02, g[2] + ctx.ara(-0.4, 0.4) * g[4], ctx.R() * 2, 1.3 + ctx.R() * 0.8, Math.min(g[3], g[4]) * 0.55]); }
    V.halka = { im, hl, c0: new T.Color(0xffffff), c1: new T.Color(su), c: new T.Color(), o: new T.Object3D(), k: 1 };
  }
  function oaHalkaGuncelle(V, t) {
    const H = V.halka; if (!H) return;
    const im = H.im, o = H.o;
    for (let i = 0; i < H.hl.length; i++) {
      const h = H.hl[i], s = ((t + h[3]) % h[4]) / h[4], r = (0.05 + s * h[5]) * H.k;
      o.position.set(h[0], h[1], h[2]); o.scale.set(r, 1, r * 0.8); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
      H.c.copy(H.c0).lerp(H.c1, s * s); im.setColorAt(i, H.c);
    }
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  }

  // Olaylar (OLAY'da 'off' yok: bir kez bağlanır, etkin ortamın verisine yazar)
  let oaAktif = null;
  try {
    if (typeof OLAY !== 'undefined' && OLAY && OLAY.on) {
      OLAY.on('havaDindi', () => { if (oaAktif) oaAktif.dindiH = 1; });
      OLAY.on('kavus', () => { if (oaAktif) oaAktif.kavusH = 1; });
      OLAY.on('durum', (d) => { if (oaAktif && d !== 'kavus') { oaAktif.dindiH = 0; oaAktif.kavusH = 0; } });
    }
  } catch (e) { /* olay yoksa süs yine çalışır */ }
  // Yel değirmeni kanatları (merkez yerelde 0,0; +z öne bakar)
  function oaKanatGeo(ctx, yelken, cubuk) {
    const S = ctx.yapi(), G = ctx.G;
    for (let j = 0; j < 4; j++) {
      const a = j / 4 * PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      S.ekle(G.kutu, ca * 1.95, sa * 1.95, 0.02, 3.1, 0.86, 0.06, yelken[0], yelken[1], 0, 0, a);
      S.ekle(G.kutu, ca * 1.8, sa * 1.8, -0.04, 3.7, 0.13, 0.13, cubuk[0], cubuk[1], 0, 0, a);
      for (const u of [1.0, 2.0, 3.0]) S.ekle(G.kutu, ca * u, sa * u, 0.05, 0.07, 0.9, 0.07, cubuk[0], cubuk[1], 0, 0, a);
    }
    S.ekle(G.kure, 0, 0, 0.12, 0.42, 0.42, 0.32, cubuk[0], cubuk[1]);
    S.ekle(G.kure, 0, 0, 0.24, 0.2, 0.2, 0.18, 0xd8a230, 0xffe880);
    return S.geo();
  }
  // Büyük gökkuşağı kemeri (kendi malzemesi: opaklık ayarlanır)
  function oaGokkusagi(ctx, x, y, z, r0, op) {
    const T = ctx.T, S = ctx.yapi(), renk = [0xff5c8d, 0xff9b42, 0xffe64d, 0x5ee886, 0x4cc4ff, 0x7c84ff, 0xc96eff];
    for (let i = 0; i < renk.length; i++) {
      const g = new T.TorusGeometry(r0 - i * 1.75, 0.95, 6, 64, PI);
      S.ekle(g, 0, 0, -i * 0.05, 1, 1, 1, renk[i], renk[i]); g.dispose();
    }
    const m = new T.MeshBasicMaterial({ vertexColors: true, fog: false, transparent: true, opacity: op, depthWrite: false });
    const ms = new T.Mesh(S.geo(), m); ms.position.set(x, y, z); ms.renderOrder = -1; ctx.ekle(ms);
    return ms;
  }
  // Rüzgâr çarkı (fırıldak) geometrisi: 4 renkli kanat, merkez yerelde 0,0
  function oaFirildak(ctx) {
    const S = ctx.yapi(), G = ctx.G, renk = [0xff5a6a, 0xffd23a, 0x4ac0ff, 0x6ad86a];
    for (let j = 0; j < 4; j++) {
      const a = j / 4 * PI * 2;
      S.ekle(G.yaprak, Math.cos(a + 0.4) * 0.22, Math.sin(a + 0.4) * 0.22, 0, 0.2, 0.5, 0.03, renk[j], ctx.karH(renk[j], 0xffffff, 0.45), 0, 0, a - PI / 2 + 0.4);
    }
    S.ekle(G.kureK, 0, 0, 0.04, 0.07, 0.07, 0.05, 0xffffff, 0xffffff);
    return S.geo();
  }

  // ═════════════════════════ 21 · YAĞMURLU ORMAN ═════════════════════════
  DY_EK[21] = {
    palet: {
      ad: 'Yağmurlu Orman', gece: 0,
      sisRenk: 0xc9e2d8, sisYogun: 0.0056, arka: 0xc6e0d6,
      gok: [0xe4f2e6, 0xcfe6e2, 0xbcdce0, 0x9cc4d4, 0x7aa6c4], gunesPos: [52, 27], gunesRenk: 0xfff8e0,
      ykUst: 0xe6f6f0, ykAlt: 0x3e6a44, ykGuc: 1.2, gnRenk: 0xfff4dc, gnGuc: 1.95, arkaRenk: 0xb8f0d8, arkaGuc: 0.55,
      dag: [[0x6aa290, 0xc9e2d8], [0x528c78, 0xbcdccc], [0x3e7a64, 0xaed4c0]],
      tepe: [0x2a7a40, 0x4ea852, 0x3a805a, 0x6aaa78],
      agac: [[0x1e6a3a, 0x4eae4c], [0x2a7c3c, 0x6cc252], [0x175a36, 0x3c9846]],
      zemin: [0x4a9a4a, 0x2a6a36, 0x7ab47a], cimen: [0x2a7a34, 0x7ed05a, 0x5cba48],
      cicek: [[0xf03c5a, 0xff7a8a], [0xff8a1e, 0xffc050], [0xd040b0, 0xff80d8], [0xffd21e, 0xfff07a], [0xffffff, 0xf4fff4]],
      sisSerit: [0xdcefe6, 0xc4e2d6], siluet: [0x123a22, 0x205a32]
    },
    secenek: {
      agacYok: true, degirmenYok: true, kulubeYok: true, kusYok: true, ucusanTur: 'yok', tepeCicekYok: true,
      gunesGuc: 0.25, bulutRenk: [0x98acba, 0xdce8ec], bulutSay: 7, dagYukseklik: 1.35,
      zeminPuruz: 0.42, cimenSik: 0.5, piknikTur: 'yok', citYok: true, mantarSusYok: true,
      bayrakRenk: [0xf03c5a, 0xffd21e, 0x40c070, 0xff8a1e, 0x40b0e0]
    },
    yardimci: {
      mantar: { sapka: [[0xe04628, 0xff8450], [0xf0a020, 0xffd860]], govde: [0xe8e0c8, 0xfffaf0], benek: 0xffffff },
      bulut: { alt: 0xa8bccc, ust: 0xf6fafc, yanak: 0xffa8b8, emissive: 0x506878 },
      nilufer: { yaprak: [0x2a8a3a, 0x6ccc5a], cicek: [0xff70a8, 0xffd0e4], halka: 0xd8f4ff },
      ruzgar: { renk: [0x8ad8c8, 0xe8fff8], ok: 0xffffff },
      halka: { renk: [0x3a9a3a, 0x8ad86a], cicek: [[0xf03c5a, 0xff7a8a], [0xffd21e, 0xfff07a], [0xd040b0, 0xff80d8]] },
      baloncuk: { renk: 0xcff0ff, kenar: 0xffffff, opaklik: 1.0 },
      esinti: { tur: 'yaprak', renk: 0xe8fff4, taneRenk: [0x6ccc5a, 0x9ee070, 0xffffff] }
    },
    kur(ctx) {
      const { T, G, hx, yerY, tepeY, B } = ctx, V = ctx.veri, ara = ctx.ara, R = ctx.R;
      oaAktif = V;
      const FR = oaEgrelti(T, 12, 0.55), BY = oaGenis(T, 8, 0.45, 0.3), BYD = oaGenis(T, 8, 0.0, 0.3);
      const S = ctx.yapi();          // orta + yakın: ağaçlar, eğreltiler, yapraklar (çift yüzlü, sallanır)
      const F = ctx.yapi();          // uzak: kayalık, şelale çevresi, dev ağaç siluetleri
      const C = ctx.yapi();          // alçak tombul yağmur bulutları
      const PU = oaGolYapi();        // su birikintileri
      const ucu = [];                // damla düşecek yaprak uçları
      const X0 = -46, X1 = hx + 46;
      const yesil = [[0x1d6a36, 0x58b84e], [0x247a3a, 0x7ccc58], [0x2e8a40, 0x9ad866], [0x1a5c34, 0x48a248]];
      const yr = () => yesil[Math.floor(R() * yesil.length)];

      // ── dev yağmur ormanı ağacı: payandalı gövde, şemsiye taç, sarmaşıklar, gövdede iri yapraklar
      const agac = (x, z, k) => {
        const y = yerY(x, z), H = 9 * k;
        S.ekle(G.kule, x, y + H / 2, z, 0.75 * k, H, 0.75 * k, 0x5a4434, 0x9a8466);
        for (let j = 0; j < 4; j++) { const a = j * PI / 2 + 0.4; S.ekle(G.yaprak, x + Math.cos(a) * 0.5 * k, y + 0.9 * k, z + Math.sin(a) * 0.5 * k, 0.5 * k, 1.8 * k, 0.12 * k, 0x4e3a2c, 0x7a6450, 0, -a, 0); }
        const ty = y + H, c = yr();
        S.nc = [x, ty + 0.4 * k, z];
        S.ekle(G.kureU, x, ty + 1.0 * k, z, 3.0 * k, 2.2 * k, 2.6 * k, c[0], c[1], 0, 0, 0, 0.12);
        for (let j = 0; j < 7; j++) { const a = j / 7 * PI * 2 + ara(0, 1); S.ekle(G.kureU, x + Math.cos(a) * 2.5 * k, ty + ara(-0.6, 1.4) * k, z + Math.sin(a) * 1.7 * k, 1.9 * k, 1.5 * k, 1.7 * k, c[0], c[1], 0, 0, 0, 0.18); }
        S.ekle(G.kureU, x + ara(-1, 1) * k, ty + 2.6 * k, z - 0.4 * k, 1.9 * k, 1.3 * k, 1.6 * k, c[0], ctx.karH(c[1], 0xd8ffa0, 0.3), 0, 0, 0, 0.18);
        S.nc = null;
        for (let j = 0; j < 4; j++) { // sarmaşık
          const lx = x + ara(-3, 3) * k, lz = z + ara(0.6, 1.8) * k, L = ara(2.5, 5.5) * k;
          S.ekle(G.sil, lx, ty - 0.3 * k - L / 2, lz, 0.05, L, 0.05, 0x3c7a30, 0x5a9a3c, 0, 0, 0, -0.25);
          for (let q = 0; q < 3; q++) S.ekle(G.kureC, lx + 0.1, ty - 0.5 * k - L * (0.3 + q * 0.3), lz + 0.05, 0.22, 0.12, 0.16, 0x3c9a3c, 0x7ad05a, 0, 0, 0.5, -0.25);
        }
        for (let j = 0; j < 3; j++) { const ry = ara(0, PI * 2), yy = y + H * ara(0.35, 0.75); S.ekle(BY, x, yy, z, 1.6 * k, 1.6 * k, 1.6 * k, 0x2a7a34, 0x7ed05a, 0, ry, -ara(0.9, 1.2), 0.15); }
      };
      // ── muz bitkisi: kısa gövde + sarkan iri yapraklar
      const muz = (x, z, k, kayit) => {
        const y = yerY(x, z), H = 1.6 * k;
        S.ekle(G.kule, x, y + H / 2, z, 0.2 * k, H, 0.2 * k, 0x4e7a34, 0x8ab456);
        const r = oaRozet(S, BY, x, y + H, z, 7, 2.6 * k, 1, 0.55, 1.25, 0x2c8034, 0x9ae06a, 0.3, ctx);
        if (kayit) for (const [ry, a, b] of r) { const p = oaDon(0.45 * b, b, 0, -a, ry); if (p[1] > -1) ucu.push([x + p[0], y + H + p[1] - 0.05, z + p[2]]); }
      };
      // ── dev eğrelti
      const egrelti = (x, z, k, kayit) => {
        const y = yerY(x, z), r = oaRozet(S, FR, x, y, z, 9, 2.2 * k, 1, 0.35, 1.15, 0x2a7034, 0x8ad460, 0.35, ctx);
        if (kayit) { const [ry, a, b] = r[0]; const p = oaDon(0.55 * b, b, 0, -a, ry); ucu.push([x + p[0], y + p[1], z + p[2]]); }
      };
      // ── kırmızı-sarı heliconia (alçak)
      const helikonya = (x, z, k) => {
        const y = yerY(x, z);
        S.ekle(G.sil, x, y + 0.9 * k, z, 0.05 * k, 1.8 * k, 0.05 * k, 0x3c7a30, 0x6aa040);
        for (let q = 0; q < 5; q++) { const s = q % 2 ? 1 : -1; S.ekle(G.koni4, x + s * 0.16 * k, y + (1.75 - q * 0.26) * k, z, 0.12 * k, 0.4 * k, 0.08 * k, 0xffc21e, 0xf0302a, 0, 0, s * 1.15); }
        oaRozet(S, BY, x, y + 0.2, z, 3, 1.4 * k, 1, 0.3, 0.6, 0x2c8034, 0x7ed05a, 0.25, ctx);
      };
      // ── iri yaprak şemsiye altında mantarlar
      const mantarlar = (x, z, k) => {
        const y = yerY(x, z), renk = [[0xe04628, 0xff8450], [0xf0a020, 0xffd860], [0xb050d0, 0xe090ff]];
        for (let q = 0; q < 3; q++) {
          const mx = x + (q - 1) * 0.5 * k, mz = z + (q === 1 ? -0.25 : 0.15) * k, s = (q === 1 ? 1 : 0.7) * k, c = renk[(q + Math.floor(x)) % 3 < 0 ? 0 : (q + Math.floor(Math.abs(x))) % 3];
          S.ekle(G.sil, mx, y + 0.28 * s, mz, 0.12 * s, 0.56 * s, 0.12 * s, 0xe8dcc0, 0xfffaf0);
          S.ekle(G.kubbe, mx, y + 0.5 * s, mz, 0.42 * s, 0.36 * s, 0.42 * s, c[0], c[1]);
          for (const [ox, oy, oz] of [[0.15, 0.3, 0.3], [-0.2, 0.22, 0.3], [0.02, 0.36, 0.1]]) S.ekle(G.kureC, mx + ox * s, y + 0.5 * s + oy * s, mz + oz * s, 0.06 * s, 0.04 * s, 0.06 * s, 0xffffff, 0xffffff);
        }
        const sx = x + 0.9 * k, sz = z - 0.4 * k;
        S.ekle(G.sil, sx, y + 0.8 * k, sz, 0.04 * k, 1.6 * k, 0.04 * k, 0x3c7a30, 0x6aa040, 0, 0, 0.12);
        S.ekle(BY, sx - 0.1 * k, y + 1.55 * k, sz, 2.1 * k, 2.1 * k, 2.1 * k, 0x2a7a34, 0x8ad860, 0, PI + 0.25, -1.35, 0.2);
        const p = oaDon(0.45 * 2.1 * k, 2.1 * k, 0, -1.35, PI + 0.25); ucu.push([sx - 0.1 * k + p[0], y + 1.5 * k + p[1], sz + p[2]]);
      };
      // ── nilüfer + gülen kurbağa yeri
      const kurbagaYer = [];
      const nilufer = (x, y, z, k, kurb) => {
        S.ekle(G.daireY, x, y + 0.04, z, 0.95 * k, 1, 0.8 * k, 0x2a8034, 0x2a8034);
        S.ekle(G.daireY, x, y + 0.05, z, 0.8 * k, 1, 0.66 * k, 0x5cb84a, 0x5cb84a);
        if (kurb) kurbagaYer.push([x, y + 0.06, z, k * 1.05]);
        else {
          S.ekle(G.cicek, x + 0.2 * k, y + 0.16, z + 0.1, 0.32 * k, 0.32 * k, 0.32 * k, 0xff70a8, 0xff70a8, -PI / 2.6, 0, 0);
          S.ekle(G.cicek, x + 0.2 * k, y + 0.2, z + 0.1, 0.2 * k, 0.2 * k, 0.2 * k, 0xffd0e4, 0xffd0e4, -PI / 2.2, 0, 0.6);
          S.ekle(G.kureK, x + 0.2 * k, y + 0.24, z + 0.1, 0.07 * k, 0.05 * k, 0.07 * k, 0xffd21e, 0xfff07a);
        }
      };
      // ── su birikintisi (parlak), kenarı çamur-yosun
      const gol = [];
      const birikinti = (x, z, w, d) => oaBirikinti(ctx, S, PU, gol, x, z, w, d, 0x2e5a2c, 0x94c0d4, 0xeef8fc);

      // ═══ UZAK: yosunlu kayalık + şelale, dev ağaç siluetleri, alçak yağmur bulutları
      const sx = Math.min(hx * 0.62, 44), sz = -66, sy = tepeY(sx, sz);
      F.nc = [sx, sy + 6, sz];
      for (const [ox, oy, a, b, c] of [[0, 6, 7, 9, 4], [-6, 3.5, 6, 6, 4], [6.5, 4, 6, 7.5, 4], [-2.5, 11.5, 5, 4, 3.5], [3, 12, 4.5, 3.5, 3.4]]) {
        F.ekle(G.kureO, sx + ox, sy + oy - 1, sz, a, b, c, 0x4a6a5a, 0x6e9a70);
      }
      F.nc = null;
      for (let j = 0; j < 7; j++) F.ekle(G.kureU, sx + ara(-7, 7), sy + 14 + ara(-1, 1.2), sz + 1, ara(2.4, 3.6), ara(1.3, 1.9), 2.2, 0x2e7a40, 0x6ab85a);
      F.ekle(G.daireY, sx, sy + 0.15, sz + 4.5, 5.2, 1, 2.2, 0x8ac4d0, 0xb8e4ec);
      for (let j = 0; j < 6; j++) F.ekle(G.kureO, sx + ara(-2.4, 2.4), sy + 0.6 + ara(0, 0.8), sz + 4.4, ara(1, 1.6), ara(0.6, 1), 0.9, 0xe8f4f4, 0xffffff);
      // ikinci, daha küçük şelale (sol uzak)
      const sx2 = -22, sz2 = -80, sy2 = tepeY(sx2, sz2);
      F.nc = [sx2, sy2 + 4, sz2];
      for (const [ox, oy, a, b] of [[0, 4.5, 5, 7], [-4.5, 2.5, 4.5, 4.5], [4.5, 3, 4.5, 5.5]]) F.ekle(G.kureO, sx2 + ox, sy2 + oy - 1, sz2, a, b, 3.4, 0x4e6e60, 0x729a76);
      F.nc = null;
      for (let j = 0; j < 4; j++) F.ekle(G.kureU, sx2 + ara(-4, 4), sy2 + 10 + ara(-0.6, 0.8), sz2 + 0.8, ara(2, 2.8), 1.3, 1.8, 0x2e7a40, 0x6ab85a);
      // dev ağaç siluetleri (tepeler üstünde)
      for (let i = 0; i < 22; i++) {
        const x = X0 - 30 + i * (X1 - X0 + 60) / 21 + ara(-3, 3), z = ara(-56, -46), y = tepeY(x, z) - 0.5, H = ara(7, 12), c = yr();
        if (Math.abs(x - sx) < 9) continue;
        F.ekle(G.kule, x, y + H / 2, z, 0.5, H, 0.5, 0x4a5a48, 0x6a7a60);
        F.nc = [x, y + H, z];
        F.ekle(G.kureU, x, y + H + 0.5, z, 3.4, 1.4, 2.4, c[0], c[1]);
        F.ekle(G.kureU, x - 2.6, y + H, z, 2.0, 1.1, 1.8, c[0], c[1]);
        F.ekle(G.kureU, x + 2.6, y + H + 0.1, z, 2.0, 1.1, 1.8, c[0], c[1]);
        F.nc = null;
      }
      // alçak tombul yağmur bulutları
      for (let i = 0; i < 11; i++) {
        const x = -70 + i * (hx + 140) / 10 + ara(-6, 6), y = ara(21, 29), z = ara(-92, -78), k = ara(1, 1.5);
        C.nc = [x, y - 1, z];
        C.ekle(G.kureO, x, y, z, 5.5 * k, 3.2 * k, 3 * k, 0x8498a8, 0xe4ecf0);
        C.ekle(G.kureO, x - 5 * k, y - 1 * k, z + 0.5, 3.8 * k, 2.4 * k, 2.6 * k, 0x8498a8, 0xdce6ec);
        C.ekle(G.kureO, x + 5.2 * k, y - 0.8 * k, z + 0.3, 4 * k, 2.6 * k, 2.6 * k, 0x8498a8, 0xdce6ec);
        C.ekle(G.kureO, x + 1.8 * k, y + 2.2 * k, z - 0.5, 3.4 * k, 2.6 * k, 2.4 * k, 0xa4b4c0, 0xf2f6f8);
        C.ekle(G.kureU, x, y - 2.2 * k, z + 1, 8 * k, 1.2 * k, 2.4 * k, 0x7a8e9e, 0x9aacb8);
        C.nc = null;
      }

      // orman örtüsü: tepelerin önünde sık, tombul taç sırası (uzak yeşil duvar)
      for (let i = 0; i < 54; i++) {
        const x = X0 - 50 + i * (X1 - X0 + 100) / 53 + ara(-1.5, 1.5), z = ara(-46, -38), y = yerY(x, z), c = yr(), k = ara(0.9, 1.5);
        F.nc = [x, y + 2, z];
        F.ekle(G.kureU, x, y + ara(2, 4.5) * k, z, ara(2.6, 3.6) * k, ara(2.4, 3.4) * k, 2.4 * k, c[0], ctx.karH(c[1], 0xd8ffa0, 0.15));
        F.ekle(G.kureU, x + 1.5, y + ara(0.6, 1.8), z + 1.2, ara(2, 2.8), ara(1.6, 2.2), 2, c[0], c[1]);
        F.nc = null;
      }
      // ═══ ORTA: dev ağaçlar, muzlar, eğreltiler (bütün parkura)
      for (let i = 0; i < 19; i++) {
        const x = X0 + i * (X1 - X0) / 18 + ara(-2, 2), z = ara(-36, -21);
        agac(x, z, ara(0.95, 1.4));
      }
      // alt kat çalılığı: iri yapraklı sık çalılar (z -10..-20)
      for (let i = 0; i < 34; i++) {
        const x = X0 + i * (X1 - X0) / 33 + ara(-1, 1), z = ara(-21, -11), y = yerY(x, z), c = yr(), k = ara(0.8, 1.3);
        S.nc = [x, y + 0.6, z];
        S.ekle(G.kureU, x, y + 0.7 * k, z, 1.8 * k, 1.3 * k, 1.4 * k, c[0], c[1], 0, 0, 0, 0.1);
        S.ekle(G.kureU, x + 1.3 * k, y + 0.5 * k, z + 0.3, 1.2 * k, 0.95 * k, 1.1 * k, c[0], c[1], 0, 0, 0, 0.1);
        S.nc = null;
        oaRozet(S, BY, x - 0.8 * k, y + 0.6 * k, z + 0.6, 4, 1.7 * k, 1, 0.7, 1.2, 0x2c8034, 0x9ae06a, 0.25, ctx);
        if (i % 4 !== 3) for (let q = 0; q < 5; q++) { const f = B.cicek[(i + q) % 4], fx = x + ara(-1.3, 1.6) * k, fy = y + ara(0.8, 1.7) * k, fz = z + ara(1.0, 1.4) * k; S.ekle(G.cicek, fx, fy, fz, 0.34, 0.34, 0.34, f[0], f[1], ara(-0.4, 0.1), 0, ara(0, 3)); S.ekle(G.kureC, fx, fy, fz + 0.06, 0.07, 0.07, 0.07, 0xfff07a, 0xfff07a); }
      }
      for (let i = 0; i < 26; i++) {
        const x = X0 + i * (X1 - X0) / 25 + ara(-1.5, 1.5), z = ara(-20, -12);
        if (i % 2) muz(x, z, ara(0.9, 1.3)); else egrelti(x, z, ara(1.1, 1.6));
      }

      // ═══ YAKIN (z -2..-10): eğrelti, muz, heliconia, mantar şemsiyeleri, birikinti, nilüfer
      const yakinX = [];
      for (let x = -14; x < hx + 22; x += ara(3.2, 4.6)) yakinX.push(x);
      for (let i = 0; i < yakinX.length; i++) {
        const x = yakinX[i];
        const tur = i % 5;
        if (tur === 0) egrelti(x, ara(-7.5, -5.5), ara(0.8, 1.05), true);
        else if (tur === 1) muz(x, ara(-9.5, -7.5), ara(0.65, 0.8), true);
        else if (tur === 2) helikonya(x, ara(-5, -3.5), ara(0.75, 0.95));
        else if (tur === 3) mantarlar(x, ara(-4.2, -2.6), ara(0.85, 1.05));
        else {
          const hz = ara(-8.5, -6.5), y = yerY(x, hz), c = yr();
          S.nc = [x, y + 0.5, hz];
          S.ekle(G.kureU, x, y + 0.6, hz, 1.3, 1.0, 1.0, c[0], c[1], 0, 0, 0, 0.1); S.ekle(G.kureU, x + 0.9, y + 0.45, hz + 0.2, 0.9, 0.75, 0.8, c[0], c[1], 0, 0, 0, 0.1);
          S.nc = null;
          for (let q = 0; q < 6; q++) { const f = B.cicek[(q + i) % 4], fx = x + ara(-1, 1.6), fy = y + ara(0.5, 1.3), fz = hz + ara(0.75, 1.0); S.ekle(G.cicek, fx, fy, fz, 0.3, 0.3, 0.3, f[0], f[1], ara(-0.3, 0.1), 0, ara(0, 3), 0.1); S.ekle(G.kureC, fx, fy, fz + 0.05, 0.06, 0.06, 0.06, 0xfff07a, 0xfff07a); }
        }
        if (i % 3 === 1) { // ıslak taşlar
          const tx = x + ara(1, 2), tz = ara(-3.4, -2.2);
          S.ekle(G.kureO, tx, yerY(tx, tz), tz, ara(0.35, 0.6), ara(0.22, 0.35), 0.4, 0x5a6a62, 0x9aaaa0);
        }
      }
      // birikintiler ve gölcükler (yakın + ön)
      birikinti(-6.5, -4.2, 2.2, 1.1); nilufer(-7.2, 0, -4.4, 0.8, true); nilufer(-5.6, 0, -4.0, 0.55, false);
      birikinti(hx * 0.3, -5.2, 3.0, 1.4); nilufer(hx * 0.3 - 1.0, 0, -5.4, 0.9, true); nilufer(hx * 0.3 + 1.2, 0, -5.0, 0.6, false);
      birikinti(hx * 0.55, -3.6, 1.8, 0.8);
      birikinti(hx * 0.78, -6, 2.6, 1.2); nilufer(hx * 0.78 + 0.6, 0, -6.2, 0.85, true);
      birikinti(hx + 6.5, -3.4, 2.0, 1.0); nilufer(hx + 6.2, 0, -3.5, 0.75, true);
      birikinti(hx * 0.15, 2.6, 1.6, 0.6); birikinti(hx * 0.48, 3.2, 2.0, 0.7); birikinti(hx * 0.9, 2.4, 1.4, 0.55);

      // ═══ ÖN (z 1.2..4, alçak): küçük eğrelti ve yapraklar
      for (let x = -12; x < hx + 18; x += ara(2.2, 3.6)) {
        const z = ara(1.4, 3.6);
        if (Math.abs(x - hx) < 3 || Math.abs(x) < 3) continue;
        if (R() < 0.55) oaRozet(S, FR, x, 0, z, 6, ara(0.8, 1.1), 1, 0.9, 1.3, 0x2a7034, 0x8ad460, 0.3, ctx);
        else oaRozet(S, BY, x, 0, z, 4, ara(0.9, 1.2), 1, 1.0, 1.35, 0x2c8034, 0x9ae06a, 0.25, ctx);
      }

      // ═══ ÖN ZEMİN (z 4.5..14; dikeyde alt kenar): yere yayılmış iri yapraklar, taşlar, birikintiler, minik mantarlar
      for (let x = -16; x < hx + 20; x += ara(1.8, 3.0)) {
        const z = ara(4.5, 13), r = R();
        if (r < 0.4) oaRozet(S, BY, x, 0, z, 5, ara(1.3, 1.9), 1, 1.2, 1.45, 0x2a7a34, 0x8ad860, 0.2, ctx);
        else if (r < 0.7) oaRozet(S, FR, x, 0, z, 7, ara(1.2, 1.6), 1, 1.15, 1.45, 0x2a7034, 0x8ad460, 0.25, ctx);
        else if (r < 0.85) { S.ekle(G.kureO, x, 0, z, ara(0.5, 0.8), ara(0.3, 0.42), 0.55, 0x52645a, 0x9aaca2); S.ekle(G.kureO, x + 0.7, 0, z + 0.3, 0.35, 0.22, 0.35, 0x52645a, 0x9aaca2); }
        else {
          for (let q = 0; q < 2; q++) { const mx = x + q * 0.35, s = q ? 0.5 : 0.7; S.ekle(G.sil, mx, 0.2 * s, z, 0.1 * s, 0.4 * s, 0.1 * s, 0xe8dcc0, 0xfffaf0); S.ekle(G.kubbe, mx, 0.36 * s, z, 0.34 * s, 0.3 * s, 0.34 * s, 0xe04628, 0xff8450); }
        }
        if (R() < 0.35) birikinti(x + ara(1.5, 2.5), ara(5, 12), ara(1.2, 2), ara(0.5, 0.8));
      }

      // ═══ BİLBO'NUN YERİ: yerde iri yaprak örtü + meyve kâsesi + yanında yaprak şemsiye
      S.ekle(BYD, hx - 1.7, 0.03, -1.3, 3.4, 3.4, 3.4, 0x3a9a3c, 0x8ad860, 0, 0, -PI / 2, 0);
      S.ekle(G.kubbe, hx - 0.9, 0.06, -1.2, 0.34, 0.2, 0.34, 0x8a5a30, 0xb88450, PI, 0, 0);
      S.ekle(G.sil, hx - 0.9, 0.06, -1.2, 0.34, 0.02, 0.34, 0xc89a60, 0xc89a60);
      for (const [ox, oz, c] of [[-0.1, 0, 0xe0304a], [0.1, 0.06, 0xffb020], [0, -0.1, 0x9a40c0], [0.05, 0.1, 0xe0304a]]) S.ekle(G.kureK, hx - 0.9 + ox, 0.12, -1.2 + oz, 0.1, 0.09, 0.1, c, c);
      S.ekle(G.sil, hx + 2.4, 1.15, -1.7, 0.05, 2.3, 0.05, 0x3c7a30, 0x6aa040, 0, 0, 0.08);
      S.ekle(BY, hx + 2.3, 2.25, -1.7, 2.4, 2.4, 2.4, 0x2a7a34, 0x8ad860, 0, PI - 0.15, -1.45, 0.15);
      { const p = oaDon(0.45 * 2.4, 2.4, 0, -1.45, PI - 0.15); ucu.push([hx + 2.3 + p[0], 2.2 + p[1], -1.7 + p[2]]); }
      mantarlar(hx + 4.2, -2.4, 0.8);
      egrelti(hx - 4.6, -2.6, 0.8, true);

      // ── ağları kur
      const malzS = ctx.malz(true, true, 0.3, { side: T.DoubleSide, roughness: 0.6 });
      ctx.ekle(new T.Mesh(S.geo(), malzS));
      ctx.ekle(new T.Mesh(F.geo(), ctx.malz(true, true, 0, { emissive: 0x2a4a3a, emissiveIntensity: 0.35 })));
      const bm = new T.Mesh(C.geo(), ctx.malz(true, true, 0, { emissive: 0x6a8090, emissiveIntensity: 0.35, roughness: 1 }));
      ctx.ekle(bm); V.bulut = bm;
      ctx.ekle(PU.mesh(ctx));
      FR.dispose(); BY.dispose(); BYD.dispose();

      // ── ağaçların arasından süzülen yumuşak ışık huzmeleri (tek çizim)
      {
        const pos = [], uv = [];
        for (let i = 0; i < 9; i++) {
          const x = X0 + 10 + i * (X1 - X0 - 20) / 8 + ara(-3, 3), z = ara(-24, -15), y0 = ara(11, 14), w0 = ara(1.0, 1.6), w1 = w0 * 2.4, sk = 4.5;
          const A = [x - w0, y0], B2 = [x + w0, y0], C2 = [x + sk + w1, 0], D = [x + sk - w1, 0];
          pos.push(D[0], D[1], z, C2[0], C2[1], z, B2[0], B2[1], z, D[0], D[1], z, B2[0], B2[1], z, A[0], A[1], z);
          uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
        }
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
        const m = new T.ShaderMaterial({
          transparent: true, depthWrite: false, fog: false, blending: T.AdditiveBlending, uniforms: { uT: ctx.U.uT },
          vertexShader: 'varying vec2 vU; varying float vX; void main(){ vU = uv; vX = position.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: 'varying vec2 vU; varying float vX; uniform float uT; void main(){ float k = smoothstep(0.0, 0.35, vU.x) * smoothstep(1.0, 0.65, vU.x) * smoothstep(0.0, 0.45, vU.y) * smoothstep(1.0, 0.8, vU.y);' +
            ' float n = 0.7 + 0.3 * sin(uT * 0.5 + vX * 0.3); gl_FragColor = vec4(vec3(1.0, 0.97, 0.82) * k * n * 0.3, 1.0); }'
        });
        const ms = new T.Mesh(g, m); ms.renderOrder = 1; ms.frustumCulled = false; ctx.ekle(ms);
      }
      // ── şelale suyu (akan çizgiler; tek çizim)
      {
        const pos = [], uv = [], q = (x, y0, y1, z, w) => {
          pos.push(x - w, y0, z, x + w, y0, z, x + w, y1, z, x - w, y0, z, x + w, y1, z, x - w, y1, z);
          uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
        };
        q(sx, sy + 0.3, sy + 13.5, sz + 4.05, 1.4);
        q(sx2, sy2 + 0.3, sy2 + 8.2, sz2 + 3.45, 0.9);
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
        const m = new T.ShaderMaterial({
          transparent: true, depthWrite: false, fog: false, uniforms: { uT: ctx.U.uT },
          vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: 'varying vec2 vU; uniform float uT; void main(){ float k = smoothstep(0.0, 0.22, vU.x) * smoothstep(1.0, 0.78, vU.x);' +
            ' float s = fract(vU.y * 5.0 + uT * 0.9 + sin(vU.x * 17.0) * 0.35); float c = 0.82 + 0.18 * smoothstep(0.6, 1.0, s);' +
            ' vec3 col = mix(vec3(0.66, 0.84, 0.88), vec3(0.97, 1.0, 1.0), c * (0.75 + 0.25 * sin(vU.x * 21.0)));' +
            ' gl_FragColor = vec4(col, k * (0.88 - 0.25 * smoothstep(0.85, 1.0, vU.y))); }'
        });
        const ms = new T.Mesh(g, m); ms.renderOrder = 1; ctx.ekle(ms);
      }

      // ── yaprak uçlarından düşen damlalar (tek InstancedMesh)
      const ND = Math.min(30, ucu.length);
      if (ND > 0) {
        // en çok ND uç: parkura eşit dağıt
        ucu.sort((a, b) => a[0] - b[0]);
        const sec = []; for (let i = 0; i < ND; i++) sec.push(ucu[Math.floor(i * ucu.length / ND)]);
        const dm = new T.MeshStandardMaterial({ color: 0xd8f2ff, emissive: 0x80b8d0, emissiveIntensity: 0.6, roughness: 0.1, metalness: 0.1 });
        const im = new T.InstancedMesh(G.kureK, dm, ND); im.frustumCulled = false; ctx.ekle(im);
        V.damla = { im, uc: sec, faz: sec.map(() => R() * 3), per: sec.map(() => 1.8 + R() * 1.6) };
      }
      oaHalkaKur(ctx, gol, 0x86b0c6);
      // ── gülen kurbağalar (tek InstancedMesh; ara sıra zıplar)
      if (kurbagaYer.length) {
        const K = ctx.yapi(), gA = 0x2f8a34, gU = 0x7ad45a;
        K.ekle(G.kureO, 0, 0.4, 0, 0.62, 0.42, 0.55, gA, gU);
        K.ekle(G.kureO, 0, 0.34, 0.24, 0.44, 0.3, 0.36, 0xc8e890, 0xf0ffc8);
        for (const s of [-1, 1]) {
          K.ekle(G.kureO, s * 0.27, 0.74, 0.1, 0.21, 0.2, 0.2, gA, gU);
          K.ekle(G.kureO, s * 0.27, 0.78, 0.24, 0.15, 0.15, 0.08, 0xffffff, 0xffffff);
          K.ekle(G.kureK, s * 0.27, 0.78, 0.31, 0.075, 0.085, 0.03, 0x1a2a1a, 0x1a2a1a);
          K.ekle(G.kureC, s * 0.25, 0.82, 0.33, 0.028, 0.028, 0.02, 0xffffff, 0xffffff);
          K.ekle(G.kureK, s * 0.36, 0.52, 0.42, 0.085, 0.055, 0.03, 0xff9aa8, 0xff9aa8);
          K.ekle(G.kureO, s * 0.24, 0.07, 0.4, 0.12, 0.09, 0.16, gA, gU);
          K.ekle(G.kureO, s * 0.47, 0.18, 0.02, 0.2, 0.18, 0.32, gA, gU);
        }
        K.ekle(G.torusSap, 0, 0.56, 0.47, 0.42, 0.34, 0.5, 0x1f4a24, 0x1f4a24, 0, 0, PI);
        const kg = K.geo();
        const im = new T.InstancedMesh(kg, ctx.malz(true, true, 0.25, { roughness: 0.45 }), kurbagaYer.length); im.frustumCulled = false; ctx.ekle(im);
        V.kurb = { im, yer: kurbagaYer, faz: kurbagaYer.map(() => R() * 6) };
      }
      V.o = new T.Object3D();
    },
    guncelle(t, dt, ctx) {
      const V = ctx.veri, o = V.o; if (!o) return;
      if (V.bulut) V.bulut.position.x = Math.sin(t * 0.04) * 4;
      if (V.damla) {
        const D = V.damla, im = D.im;
        for (let i = 0; i < D.uc.length; i++) {
          const u = D.uc[i], p = D.per[i], s = ((t + D.faz[i]) % p);
          if (s < 0.9) { // uçta şişer
            const k = s / 0.9;
            o.position.set(u[0], u[1] - 0.05 - k * 0.04, u[2]); o.scale.set(0.05 + k * 0.05, 0.06 + k * 0.08, 0.05 + k * 0.05);
          } else {
            const f = s - 0.9, y = u[1] - 0.1 - 4.9 * f * f;
            if (y < 0.02) o.scale.set(0, 0, 0); else o.scale.set(0.08, 0.16, 0.08);
            o.position.set(u[0], y, u[2]);
          }
          o.rotation.set(0, 0, 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
        }
        im.instanceMatrix.needsUpdate = true;
      }
      oaHalkaGuncelle(V, t);
      if (V.kurb) {
        const K = V.kurb, im = K.im;
        for (let i = 0; i < K.yer.length; i++) {
          const y = K.yer[i], s = (t + K.faz[i]) % 6.5;
          let h = 0, sq = 1;
          if (s < 0.5) { h = Math.sin(s / 0.5 * PI) * 0.6; sq = 1 + Math.sin(s / 0.5 * PI) * 0.12; } else if (s < 0.7) sq = 1 - Math.sin((s - 0.5) / 0.2 * PI) * 0.14;
          const nefes = 1 + Math.sin(t * 2.4 + i) * 0.025;
          o.position.set(y[0], y[1] + h * y[3], y[2]); o.rotation.set(0, Math.sin(t * 0.3 + i * 2) * 0.35, 0);
          o.scale.set(y[3] * nefes / Math.sqrt(sq), y[3] * sq, y[3] * nefes / Math.sqrt(sq)); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
        }
        im.instanceMatrix.needsUpdate = true;
      }
    },
    sok() { oaAktif = null; }
  };

  // ═════════════════════════ 25 · FIRTINA TEPESİ ═════════════════════════
  DY_EK[25] = {
    palet: {
      ad: 'Fırtına Tepesi', gece: 0,
      sisRenk: 0xa49cc0, sisYogun: 0.0048, arka: 0xa098bc,
      gok: [0xe8b8a0, 0xc09ab4, 0x9484bc, 0x5c5498, 0x2e2a62], gunesPos: [60, 14], gunesRenk: 0xffe2a0,
      ykUst: 0xc4bce8, ykAlt: 0x4a5a44, ykGuc: 1.15, gnRenk: 0xffe2b8, gnGuc: 2.0, arkaRenk: 0xffc070, arkaGuc: 0.7,
      dag: [[0x5c5a8e, 0xa49cc0], [0x4c4c80, 0x9890b6], [0x3e3e70, 0x8a84ac]],
      tepe: [0x4e8a4c, 0x9ac46a, 0x6a7c78, 0xa0a8a0],
      agac: [[0x2e6a3a, 0x6aa850], [0x3a7a40, 0x7cb85a], [0x285a38, 0x5a9446]],
      zemin: [0x6aa456, 0x3e723e, 0x8eaa78], cimen: [0x3e7a3a, 0xb0d878, 0x90c464],
      cicek: [[0xffc820, 0xfff07a], [0xffffff, 0xfff8f0], [0xa070e0, 0xd8b8ff], [0xff7a50, 0xffb898]],
      sisSerit: [0xb8b0d4, 0xa49cc4], siluet: [0x1e3428, 0x34503c]
    },
    secenek: {
      agacYok: true, degirmenYok: true, kulubeYok: true, kusYok: true, tepeCicekYok: true, gunesYok: true,
      bulutYok: true, ucusanTur: 'yaprak', ucusanRenk: [0x8ac850, 0xc8e070, 0xffc840, 0x6aa848],
      zeminPuruz: 0.5, cimenSik: 0.85, piknikTur: 'yok', citYok: true, mantarSusYok: true,
      bayrakRenk: [0xffc820, 0x4ac0ff, 0xff5a6a, 0x6ad86a, 0xffffff]
    },
    yardimci: {
      mantar: { sapka: [0xffb020, 0xffe070], govde: [0xe8e0c8, 0xfffaf0], benek: 0xffffff },
      bulut: { alt: 0x8a84b4, ust: 0xf4f0ff, yanak: 0xffa8c0, emissive: 0x5a5488 },
      nilufer: { yaprak: [0x3a8a3a, 0x7ccc5a], cicek: [0xffd040, 0xfff0a0], halka: 0xe8f0ff },
      ruzgar: { renk: [0xa8a0e0, 0xf4f0ff], ok: 0xffffff },
      halka: { renk: [0xffb020, 0xffe070], cicek: [[0xffc820, 0xfff07a], [0xffffff, 0xfff8f0]] },
      baloncuk: { renk: 0xe8e4ff, kenar: 0xffffff, opaklik: 1.05 },
      esinti: { tur: 'yaprak', renk: 0xf4f0ff, taneRenk: [0x8ac850, 0xffc840, 0xffffff] }
    },
    kur(ctx) {
      const { T, G, hx, yerY, tepeY, B } = ctx, V = ctx.veri, ara = ctx.ara, R = ctx.R;
      oaAktif = V; V.dindiH = 0; V.dindi = 0;
      const S = ctx.yapi(), F = ctx.yapi(), CL = ctx.yapi(), CR = ctx.yapi(), PU = oaGolYapi(), gol = [];
      const X0 = -46, X1 = hx + 46;
      const egY = (x, z) => (z < -40 ? tepeY(x, z) : yerY(x, z));

      // ── rüzgârda eğilmiş ağaç (taç rüzgâr yönüne, sağa yatık)
      const egikAgac = (Y, x, z, k, sal) => {
        const y = egY(x, z) - 0.1, a1 = 0.22, a2 = 0.55, h1 = 2.6 * k, h2 = 2.2 * k;
        Y.ekle(G.kule, x + Math.sin(a1) * h1 / 2, y + Math.cos(a1) * h1 / 2, z, 0.32 * k, h1, 0.32 * k, 0x5a4a3c, 0x7a6450, 0, 0, -a1);
        const x1 = x + Math.sin(a1) * h1, y1 = y + Math.cos(a1) * h1;
        Y.ekle(G.kule, x1 + Math.sin(a2) * h2 / 2, y1 + Math.cos(a2) * h2 / 2, z, 0.22 * k, h2, 0.22 * k, 0x5a4a3c, 0x7a6450, 0, 0, -a2);
        const cx = x1 + Math.sin(a2) * h2 + 0.6 * k, cy = y1 + Math.cos(a2) * h2 + 0.2 * k, c = B.agac[Math.floor(R() * 3)];
        Y.nc = [cx, cy, z];
        Y.ekle(G.kureU, cx, cy, z, 2.4 * k, 1.25 * k, 1.6 * k, c[0], c[1], 0, 0, -0.15, sal);
        Y.ekle(G.kureU, cx - 1.6 * k, cy - 0.3 * k, z + 0.2, 1.5 * k, 1.0 * k, 1.3 * k, c[0], c[1], 0, 0, -0.2, sal);
        Y.ekle(G.kureU, cx + 1.7 * k, cy - 0.45 * k, z - 0.2, 1.6 * k, 0.9 * k, 1.2 * k, c[0], c[1], 0, 0, -0.3, sal);
        Y.ekle(G.kureU, cx + 0.3 * k, cy + 0.8 * k, z - 0.3, 1.5 * k, 0.9 * k, 1.2 * k, c[0], ctx.karH(c[1], 0xfff0b0, 0.3), 0, 0, -0.2, sal);
        Y.nc = null;
      };
      // ── yatık ot öbeği (+ sarı düğün çiçekleri)
      const ot = (x, z, k, cicekli) => {
        const y = yerY(x, z);
        for (let q = 0; q < 8; q++) S.ekle(G.bicak, x + ara(-0.35, 0.35) * k, y, z + ara(-0.3, 0.3) * k, ara(0.1, 0.16) * k, ara(0.8, 1.5) * k, 1, 0x3e7a3a, q % 3 ? 0xb4dc7a : 0xd8e890, 0, ara(-0.5, 0.5), -ara(0.35, 0.8), 0.5);
        if (cicekli) for (let q = 0; q < 3; q++) {
          const fx = x + ara(-0.4, 0.4) * k, fh = ara(0.5, 0.9) * k, f = B.cicek[q === 1 ? 2 : 0];
          S.ekle(G.sil, fx + fh * 0.2, y + fh / 2, z + 0.15, 0.02, fh, 0.02, 0x4a8a3a, 0x6aaa48, 0, 0, -0.4, 0.5);
          S.ekle(G.cicek, fx + fh * 0.42, y + fh * 0.95, z + 0.18, 0.13 * k, 0.13 * k, 0.13 * k, f[0], f[1], -0.2, 0, -0.5, 0.5);
        }
      };

      // ═══ UZAK: fırtına bulutları (altı altın ışıklı), eğik ağaç siluetleri
      for (let r = 0; r < 3; r++) {
        const n = 18 - r * 2, z0 = -72 - r * 14, yy = 17 + r * 7;
        for (let i = 0; i < n; i++) {
          const x = -90 + i * (hx + 180) / (n - 1) + ara(-6, 6), y = yy + ara(-2, 3), z = z0 + ara(-3, 3), k = ara(1.1, 1.7) + r * 0.25;
          const Y = x < hx ? CL : CR;
          const alt = r === 0 ? 0xd8a0a0 : (r === 1 ? 0x7a6aa8 : 0x5a5290), ust = r === 0 ? 0x8a7cbc : (r === 1 ? 0x6a62a4 : 0x4a4488);
          Y.nc = [x, y - 1, z];
          Y.ekle(G.kureO, x, y, z, 6 * k, 3.6 * k, 3.4 * k, alt, ust);
          Y.ekle(G.kureO, x - 5.5 * k, y - 1.2 * k, z + 0.6, 4.2 * k, 2.8 * k, 2.8 * k, alt, ust);
          Y.ekle(G.kureO, x + 5.6 * k, y - 0.9 * k, z + 0.4, 4.4 * k, 3 * k, 2.8 * k, alt, ust);
          Y.ekle(G.kureU, x + 2 * k, y + 2.6 * k, z - 0.6, 3.8 * k, 3 * k, 2.6 * k, ust, ctx.karH(ust, 0xc8c0f0, 0.35));
          Y.ekle(G.kureU, x - 2.4 * k, y + 2.1 * k, z - 0.4, 3.2 * k, 2.6 * k, 2.4 * k, ust, ctx.karH(ust, 0xc8c0f0, 0.3));
          Y.nc = null;
        }
      }
      // ufka inen yumuşak bulut perdesi (tepelerle bulut arası açık kalmasın; altı sıcak şeftali, yumuşak geçiş)
      for (let i = 0; i < 16; i++) {
        const x = -110 + i * (hx + 220) / 15 + ara(-5, 5), y = ara(9, 12), z = ara(-106, -100), k = ara(1.3, 1.7);
        const Y = x < hx ? CL : CR;
        Y.nc = [x, y, z];
        Y.ekle(G.kureU, x, y, z, 9 * k, 4.2 * k, 3 * k, 0xc89aa8, 0x7a6aa8);
        Y.ekle(G.kureU, x + 7 * k, y + 1.2, z - 1, 7 * k, 4 * k, 3 * k, 0xc89aa8, 0x6e62a4);
        Y.nc = null;
      }
      for (let i = 0; i < 18; i++) {
        const x = X0 - 40 + i * (X1 - X0 + 80) / 17 + ara(-4, 4), z = ara(-60, -48);
        egikAgac(F, x, z, ara(1.1, 1.6), 0.15);
      }

      // ═══ ORTA: taş yel değirmeni (tepede) + uzakta ikinci değirmen, eğik ağaçlar, taş duvar
      const dx = -17, dz = -42, dyy = tepeY(dx, dz) - 0.3;
      S.ekle(G.kule, dx, dyy + 0.4, dz, 2.0, 0.9, 2.0, 0x7e7a80, 0xa8a2a8);
      S.ekle(G.kule, dx, dyy + 3.6, dz, 1.7, 6.4, 1.7, 0x9a948e, 0xd4ccc0);
      for (const yh of [1.6, 3.4, 5.2]) S.ekle(G.sil, dx, dyy + yh, dz, 1.75 - yh * 0.06, 0.12, 1.75 - yh * 0.06, 0x7e7672, 0x8e8682);
      S.ekle(G.koni, dx, dyy + 7.8, dz, 2.3, 2.4, 2.3, 0x4a4a7a, 0x6a6aa4);
      S.ekle(G.kure, dx, dyy + 9.05, dz, 0.24, 0.24, 0.24, 0xe8b238, 0xfff098);
      S.ekle(G.kutu, dx, dyy + 1.2, dz + 1.7, 0.9, 1.5, 0.2, 0x6e442a, 0x8e5c3a);
      S.ekle(G.torusHalka, dx, dyy + 4.4, dz + 1.45, 1.3, 1.3, 0.9, 0x6e442a, 0x8e5c3a);
      S.ekle(G.kure, dx, dyy + 4.4, dz + 1.4, 0.36, 0.36, 0.15, 0xffc860, 0xfff0b0);
      S.ekle(G.sil, dx, dyy + 9.6, dz, 0.04, 1.2, 0.04, 0x3a3a4a, 0x5a5a6a);
      S.ekle(G.kutu, dx + 0.1, dyy + 10.1, dz, 1.1, 0.07, 0.07, 0x3a3a4a, 0x5a5a6a); S.ekle(G.koni4, dx + 0.75, dyy + 10.1, dz, 0.16, 0.3, 0.06, 0xffc820, 0xffe070, 0, 0, -PI / 2); S.ekle(G.kutu, dx - 0.45, dyy + 10.1, dz, 0.25, 0.32, 0.04, 0xffc820, 0xffe070);
      const d2x = hx + 22, d2z = -58, d2y = tepeY(d2x, d2z) - 0.3;
      S.ekle(G.kule, d2x, d2y + 2.6, d2z, 1.2, 5.2, 1.2, 0x9a948e, 0xd4ccc0);
      S.ekle(G.koni, d2x, d2y + 6, d2z, 1.6, 1.8, 1.6, 0x4a4a7a, 0x6a6aa4);
      V.degirmen = [[dx, dyy + 6.1, dz + 1.75, 1.15], [d2x, d2y + 4.6, d2z + 1.25, 0.8]];
      for (let i = 0; i < 16; i++) {
        const x = X0 + i * (X1 - X0) / 15 + ara(-2.5, 2.5), z = ara(-34, -18);
        if (Math.abs(x - dx) < 6 && z < -30) continue;
        egikAgac(S, x, z, ara(0.9, 1.25), 0.3);
      }
      for (let x = X0; x < X1; x += 0.95) {
        const z = -13 + Math.sin(x * 0.07) * 2.5, y = yerY(x, z);
        S.ekle(G.kureU, x, y + 0.25, z, ara(0.55, 0.7), ara(0.32, 0.42), 0.45, 0x6e6a78, 0xa8a4b0);
        if (R() < 0.7) S.ekle(G.kureU, x + 0.45, y + 0.62, z + 0.05, ara(0.42, 0.55), ara(0.25, 0.32), 0.4, 0x7a7684, 0xb8b4c0);
        if (R() < 0.22) ot(x + 0.3, z + 0.8, 0.8, R() < 0.5);
      }
      for (let i = 0; i < 46; i++) { const x = X0 + i * (X1 - X0) / 45 + ara(-1, 1); ot(x, ara(-11, -5), ara(1, 1.5), R() < 0.4); }

      // ═══ YAKIN: fenerli direkler (fener sallanır), fırıldaklar, otlar, birikintiler
      const fener = [];
      const direk = (x, z) => {
        const y = yerY(x, z);
        S.ekle(G.kutu, x, y + 1.35, z, 0.16, 2.7, 0.16, 0x5a3e2a, 0x8a6446);
        S.ekle(G.kutu, x + 0.4, y + 2.6, z, 0.9, 0.12, 0.12, 0x5a3e2a, 0x8a6446);
        S.ekle(G.kutu, x + 0.2, y + 2.38, z, 0.08, 0.5, 0.08, 0x5a3e2a, 0x8a6446, 0, 0, 0.8);
        fener.push([x + 0.78, y + 2.55, z]);
      };
      for (let x = 8; x < hx + 12; x += ara(11, 14)) { if (Math.abs(x - hx) < 6) continue; direk(x, -2.6); }
      direk(hx - 4.6, -2.2);
      const firil = [];
      for (let x = -9; x < hx + 16; x += ara(7, 10)) {
        if (Math.abs(x - hx) < 4 || Math.abs(x) < 4) continue;
        const z = ara(-6.5, -4), h = ara(1.4, 1.9);
        S.ekle(G.sil, x, h / 2, z, 0.035, h, 0.035, 0xe8e0d0, 0xfffaf0);
        firil.push([x, h, z + 0.06, ara(1.6, 2.0)]);
      }
      for (let i = 0; i < 40; i++) { const x = -14 + i * (hx + 30) / 39 + ara(-0.8, 0.8); if (Math.abs(x) < 3) continue; ot(x, ara(-4, -1.2), ara(0.75, 1.1), R() < 0.35); }
      const su = [0x3a5a34, 0x8e94c4, 0xf0e4f4];
      oaBirikinti(ctx, S, PU, gol, -7, -3.6, 1.6, 0.7, ...su);
      oaBirikinti(ctx, S, PU, gol, hx * 0.35, -4.2, 2.2, 0.9, ...su);
      oaBirikinti(ctx, S, PU, gol, hx * 0.68, -3.4, 1.8, 0.7, ...su);
      oaBirikinti(ctx, S, PU, gol, hx + 7, -3.8, 1.5, 0.7, ...su);
      // ═══ ÖN (z 1.2..13): yatık otlar, taşlar, birikinti
      for (let x = -16; x < hx + 20; x += ara(1.0, 1.8)) {
        const z = ara(1.3, 16);
        if (z < 4 && (Math.abs(x - hx) < 3 || Math.abs(x) < 3)) continue;
        ot(x, z, ara(0.9, 1.3) * (z < 4 ? 0.8 : 1.15), R() < 0.4);
        if (R() < 0.18) S.ekle(G.kureO, x + 0.8, 0, z + 0.4, ara(0.4, 0.7), ara(0.25, 0.4), 0.5, 0x6e6a78, 0xb0acb8);
        if (R() < 0.12) oaBirikinti(ctx, S, PU, gol, x + 1.5, z + 0.5, ara(1.1, 1.7), ara(0.45, 0.7), ...su);
      }
      // ═══ BİLBO'NUN YERİ: tahta bank + çizgili şemsiye
      S.ekle(G.kutu, hx - 1.2, 0.5, -1.5, 2.0, 0.12, 0.6, 0x8a5a3a, 0xb27a52);
      for (const q of [-1, 1]) S.ekle(G.kutu, hx - 1.2 + q * 0.8, 0.25, -1.5, 0.12, 0.5, 0.5, 0x6e442a, 0x8e5c3a);
      S.ekle(G.kutu, hx - 1.2, 0.85, -1.78, 2.0, 0.5, 0.08, 0x8a5a3a, 0xb27a52);
      S.ekle(G.sil, hx + 1.4, 1.3, -1.7, 0.05, 2.6, 0.05, 0xe8e0d0, 0xffffff, 0, 0, 0.12);
      S.ekle(G.koni, hx + 1.24, 2.62, -1.7, 1.6, 0.62, 1.6, 0xe8404e, 0xff8a94, 0, 0, 0.12);
      S.ekle(G.halkaInce, hx + 1.2, 2.32, -1.7, 1.6, 1.6, 1.6, 0xffffff, 0xffffff, PI / 2, 0, 0.12);
      S.ekle(G.kureK, hx + 1.2, 3.0, -1.7, 0.08, 0.08, 0.08, 0xffd040, 0xffd040);

      // ── ağlar
      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0.4, { side: T.DoubleSide, roughness: 0.65 })));
      ctx.ekle(new T.Mesh(F.geo(), ctx.malz(true, true, 0, { emissive: 0x3a3a5a, emissiveIntensity: 0.3 })));
      ctx.ekle(PU.mesh(ctx));
      const bmat = ctx.malz(true, true, 0, { emissive: 0x9a8ad0, emissiveIntensity: 0.3, roughness: 1 });
      const bL = new T.Mesh(CL.geo(), bmat), bR = new T.Mesh(CR.geo(), bmat); bL.frustumCulled = bR.frustumCulled = false;
      ctx.ekle(bL); ctx.ekle(bR);
      V.bL = bL; V.bR = bR; V.bmat = bmat; V.e0 = new T.Color(0x9a8ad0); V.e1 = new T.Color(0xfff0d8); V.eS = new T.Color(0xe8e0ff);
      oaHalkaKur(ctx, gol, 0x8a90c0);

      // yel değirmeni kanatları (2 değirmen tek çizim)
      {
        const kg = oaKanatGeo(ctx, [0xe8e0d0, 0xfffaf2], [0x5a3e2a, 0x8a6446]);
        const im = new T.InstancedMesh(kg, ctx.malz(true, true, 0), V.degirmen.length); im.frustumCulled = false; ctx.ekle(im); V.kanat = im;
      }
      // sallanan fenerler (tek çizim; kanca yerelde 0,0)
      {
        const L = ctx.yapi();
        L.ekle(G.sil, 0, -0.12, 0, 0.015, 0.24, 0.015, 0x2a2a3a, 0x2a2a3a);
        L.ekle(G.torusHalka, 0, -0.26, 0, 0.3, 0.3, 0.3, 0x2a2a3a, 0x4a4a5a);
        L.ekle(G.koni, 0, -0.42, 0, 0.26, 0.2, 0.26, 0x3a3a4a, 0x5a5a6a);
        L.ekle(G.sil, 0, -0.72, 0, 0.2, 0.42, 0.2, 0xffb030, 0xffe890);
        for (let j = 0; j < 4; j++) L.ekle(G.kutu, Math.cos(j * PI / 2 + PI / 4) * 0.2, -0.72, Math.sin(j * PI / 2 + PI / 4) * 0.2, 0.03, 0.44, 0.03, 0x3a3a4a, 0x3a3a4a);
        L.ekle(G.sil, 0, -0.96, 0, 0.24, 0.06, 0.24, 0x3a3a4a, 0x5a5a6a);
        V.fenerM = ctx.malz(true, true, 0, { emissive: 0xffa030, emissiveIntensity: 0.55 });
        const im = new T.InstancedMesh(L.geo(), V.fenerM, fener.length); im.frustumCulled = false; ctx.ekle(im);
        V.fener = { im, yer: fener };
      }
      // fırıldaklar (tek çizim)
      if (firil.length) {
        const im = new T.InstancedMesh(oaFirildak(ctx), ctx.malz(true, true, 0, { side: T.DoubleSide, emissive: 0x404040, emissiveIntensity: 0.3 }), firil.length); im.frustumCulled = false; ctx.ekle(im);
        V.firil = { im, yer: firil };
      }
      // uçurtmalar (ip + uçurtma + kuyruk; yerdeki bağdan sallanır; tek çizim)
      {
        const K = ctx.yapi(), kx = 5, ky = 13;
        const L = Math.hypot(kx, ky), a = Math.atan2(kx, ky);
        K.ekle(G.sil, kx / 2, ky / 2, 0, 0.02, L, 0.02, 0xf4f0ff, 0xffffff, 0, 0, -a);
        K.ekle(G.oct, kx, ky + 0.3, 0, 0.85, 1.25, 0.06, 0xff5a6a, 0xffd040);
        K.ekle(G.kutu, kx, ky + 0.3, 0.05, 0.05, 2.4, 0.03, 0x8a5a3a, 0x8a5a3a);
        K.ekle(G.kutu, kx, ky + 0.55, 0.05, 1.6, 0.05, 0.03, 0x8a5a3a, 0x8a5a3a);
        for (let q = 0; q < 5; q++) { const tx = kx - 0.15 - q * 0.42, ty = ky - 1.1 - q * 0.45; K.ekle(G.kureK, tx, ty, 0.02, 0.16, 0.08, 0.04, q % 2 ? 0x4ac0ff : 0xffd040, q % 2 ? 0x8ae0ff : 0xfff090, 0, 0, 0.6, -0.3 - q * 0.15); }
        const kites = [[hx * 0.22, -30], [hx * 0.72, -36]];
        const im = new T.InstancedMesh(K.geo(), ctx.malz(true, true, 0, { side: T.DoubleSide, emissive: 0x403040, emissiveIntensity: 0.25 }), kites.length); im.frustumCulled = false; ctx.ekle(im);
        V.ucurtma = { im, yer: kites.map(([x, z]) => [x, yerY(x, z), z]) };
      }
      // rüzgârda uçuşan şemsiye
      {
        const U = ctx.yapi();
        U.ekle(G.koni, 0, 0.35, 0, 1.05, 0.45, 1.05, 0xffb020, 0xfff090);
        for (let j = 0; j < 8; j++) { const a = j * PI / 4; U.ekle(G.kureK, Math.cos(a) * 1.0, 0.12, Math.sin(a) * 1.0, 0.1, 0.07, 0.1, 0x4ac0ff, 0x8ae0ff); }
        U.ekle(G.sil, 0, -0.35, 0, 0.03, 1.3, 0.03, 0x5a3e2a, 0x8a6446);
        U.ekle(G.torusSap, -0.2, -1.0, 0, 0.5, 0.5, 0.5, 0x5a3e2a, 0x8a6446, 0, 0, PI);
        const ms = new T.Mesh(U.geo(), ctx.malz(true, true, 0, { side: T.DoubleSide, emissive: 0x404050, emissiveIntensity: 0.3 })); ms.frustumCulled = false; ctx.ekle(ms); V.semsiye = ms;
      }
      // rüzgâr kıvrımları (uzakta sağa kayan beyaz çizgiler; tek çizim)
      {
        const g1 = new T.TorusGeometry(0.8, 0.045, 3, 18, PI * 1.5), g2 = new T.CylinderGeometry(0.045, 0.01, 4.5, 3, 1);
        const W = ctx.yapi();
        W.ekle(g1, 0, 0, 0, 1, 1, 1, 0xffffff, 0xffffff, 0, 0, PI * 0.25);
        W.ekle(g2, -2.25, -0.8, 0, 1, 1, 1, 0xffffff, 0xffffff, 0, 0, PI / 2);
        g1.dispose(); g2.dispose();
        const NW = 12, wm = new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false, fog: false });
        const im = new T.InstancedMesh(W.geo(), wm, NW); im.frustumCulled = false; im.renderOrder = 1; ctx.ekle(im);
        V.kivrim = { im, N: NW, x: [], y: [], z: [], h: [] };
        for (let i = 0; i < NW; i++) { V.kivrim.x.push(ara(X0, X1)); V.kivrim.y.push(ara(4, 11)); V.kivrim.z.push(ara(-34, -20)); V.kivrim.h.push(ara(5, 8)); }
      }
      // kavuşma ödülü: güneş ışınları + büyük gökkuşağı (başta görünmez)
      {
        const pos = [], uv = [], ax = hx + 10, ay = 40, az = -100;
        for (let i = 0; i < 9; i++) {
          const a = -PI / 2 + (i - 4) * 0.17, L = 80, w = 0.05 + 0.02 * (i % 3);
          const ex = ax + Math.cos(a - w) * L, ey = ay + Math.sin(a - w) * L, fx = ax + Math.cos(a + w) * L, fy = ay + Math.sin(a + w) * L;
          pos.push(ax, ay, az, ex, ey, az, fx, fy, az); uv.push(0.5, 0, 0, 1, 1, 1);
        }
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
        V.uA = { value: 0 };
        const m = new T.ShaderMaterial({
          transparent: true, depthWrite: false, fog: false, blending: T.AdditiveBlending, uniforms: { uA: V.uA },
          vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: 'varying vec2 vU; uniform float uA; void main(){ float k = smoothstep(0.0, 0.25, vU.y) * (1.0 - vU.y) * (1.0 - abs(vU.x - 0.5) * 1.6); gl_FragColor = vec4(vec3(1.0, 0.9, 0.62) * k * uA * 0.55, 1.0); }'
        });
        const ms = new T.Mesh(g, m); ms.renderOrder = 1; ms.visible = false; ms.frustumCulled = false; ctx.ekle(ms); V.isin = ms;
        V.gk = oaGokkusagi(ctx, hx - 6, -2, -84, 40, 0); V.gk.visible = false;
      }
      V.o = new T.Object3D();
    },
    guncelle(t, dt, ctx) {
      const V = ctx.veri, o = V.o; if (!o) return;
      // hava dinince (kavuşma) bulutlar aralanır, ışınlar ve gökkuşağı gelir
      const hd = V.dindiH || 0; V.dindi += (hd - V.dindi) * Math.min(1, dt * (hd ? 0.7 : 3));
      const d = V.dindi, e = d * d * (3 - 2 * d), sim = ctx.U.uSimsek ? ctx.U.uSimsek.value : 0;
      V.bL.position.set(-34 * e + Math.sin(t * 0.05) * 3, 7 * e, 0); V.bR.position.set(34 * e + Math.sin(t * 0.05) * 3, 7 * e, 0);
      V.bmat.emissive.copy(V.e0).lerp(V.eS, Math.min(1, sim * 1.4)).lerp(V.e1, e);
      V.bmat.emissiveIntensity = 0.3 + sim * 0.9 + e * 0.35;
      V.isin.visible = e > 0.01; V.uA.value = e * (0.85 + 0.15 * Math.sin(t * 1.3));
      V.gk.visible = e > 0.01; V.gk.material.opacity = 0.9 * Math.min(1, e * 1.4); const gs = 0.8 + 0.2 * e; V.gk.scale.set(gs * 1.12, gs * 0.88, 1);
      if (V.halka) V.halka.k = 1 - e;
      oaHalkaGuncelle(V, t);
      { const im = V.kanat, hiz = 1.6 - e * 1.1;
        V.kAci = (V.kAci || 0) + dt * hiz;
        for (let i = 0; i < V.degirmen.length; i++) { const q = V.degirmen[i]; o.position.set(q[0], q[1], q[2]); o.rotation.set(0, 0, -V.kAci * (1 + i * 0.2)); o.scale.setScalar(q[3]); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
        im.instanceMatrix.needsUpdate = true; }
      V.fenerM.emissiveIntensity = 0.55 + sim * 1.6;
      { const F = V.fener, im = F.im, g = 1 - e * 0.7;
        for (let i = 0; i < F.yer.length; i++) { const q = F.yer[i]; o.position.set(q[0], q[1], q[2]); o.rotation.set(Math.sin(t * 1.3 + i) * 0.08 * g, 0, (0.18 + Math.sin(t * 2.1 + i * 1.7) * 0.16) * g); o.scale.setScalar(1); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
        im.instanceMatrix.needsUpdate = true; }
      if (V.firil) { const F = V.firil, im = F.im;
        for (let i = 0; i < F.yer.length; i++) { const q = F.yer[i]; o.position.set(q[0], q[1], q[2]); o.rotation.set(0, 0.25, -t * (5 + i % 3) * (1 - e * 0.6)); o.scale.setScalar(q[3]); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
        im.instanceMatrix.needsUpdate = true; }
      { const U = V.ucurtma, im = U.im;
        for (let i = 0; i < U.yer.length; i++) { const q = U.yer[i]; o.position.set(q[0], q[1], q[2]); o.rotation.set(0, 0, Math.sin(t * 0.9 + i * 2) * 0.09 - 0.05); o.scale.setScalar(1 + i * 0.15); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
        im.instanceMatrix.needsUpdate = true; }
      if (V.kivrim) { const W = V.kivrim, im = W.im, X0 = -46, L = ctx.hx + 92;
        for (let i = 0; i < W.N; i++) {
          W.x[i] += W.h[i] * dt * (1 - e * 0.8); if (W.x[i] > X0 + L) W.x[i] -= L;
          const u = (W.x[i] - X0) / L, f = Math.sin(((t * 0.35 + i * 0.37) % 1) * PI) * (1 - e);
          o.position.set(W.x[i], W.y[i] + Math.sin(t + i) * 0.4, W.z[i]); o.rotation.set(0, 0, 0); o.scale.set(f * 1.1, f, 1); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
        }
        im.instanceMatrix.needsUpdate = true; }
      { const s = V.semsiye, L = ctx.hx + 110, u = ((t * 2.6) % L);
        s.position.set(-50 + u, 19 + Math.sin(t * 0.7) * 2.5 + Math.sin(u * 0.08) * 3, -30); s.rotation.set(Math.sin(t * 0.9) * 0.5, t * 0.8, -0.6 + Math.sin(t * 1.4) * 0.5); }
    },
    sok() { oaAktif = null; }
  };

  // ═════════════════════════ 32 · LALE TARLALARI ═════════════════════════
  DY_EK[32] = {
    palet: {
      ad: 'Lale Tarlaları', gece: 0,
      sisRenk: 0xe2f0fc, sisYogun: 0.0040, arka: 0xdeeefc,
      gok: [0xf6fcff, 0xd6eeff, 0xb6ddff, 0x88c4f8, 0x4f96ea], gunesPos: [64, 27], gunesRenk: 0xfff6d8,
      ykUst: 0xeaf6ff, ykAlt: 0x78a85c, ykGuc: 1.2, gnRenk: 0xfff6e6, gnGuc: 2.3, arkaRenk: 0xc0e8ff, arkaGuc: 0.5,
      dag: [[0xa4c4ea, 0xe2f0fc], [0x8eb4e0, 0xd6eafa], [0x7aa6d6, 0xcae2f6]],
      tepe: [0x6cc04e, 0xa8e070, 0x8cc49a, 0xc8e8c8],
      agac: [[0x3e8a3a, 0x86c85a], [0x4a9a40, 0x98d468], [0x357a36, 0x76b850]],
      zemin: [0x6ccc52, 0x3e9a3c, 0xa0dc7e], cimen: [0x3e9a3c, 0xb0ec74, 0x8edc62],
      cicek: [[0xe8203a, 0xff6a78], [0xffb808, 0xfff060], [0xff5aa8, 0xffb4d8], [0x8e46e0, 0xc89aff], [0xff6a10, 0xffb060], [0xffffff, 0xfff4f8]],
      sisSerit: [0xf0f8ff, 0xe2f0fc], siluet: [0x245a2c, 0x3a7a40]
    },
    secenek: {
      tepeYok: true, tepeCicekYok: true, agacYok: true, caliYok: true, degirmenYok: true, kulubeYok: true, cicekYok: true,
      dagYukseklik: 0.55, bulutSay: 8, bulutRenk: [0xe4eefa, 0xffffff], gokkusagi: false,
      ucusanTur: 'yaprak', ucusanRenk: [0xff6a78, 0xfff060, 0xffb4d8, 0xc89aff, 0xffb060],
      zeminPuruz: 0.45, cimenSik: 0.8, mantarSusYok: true, piknikTur: 'piknik', piknikRenk: [0xe8203a, 0xffffff],
      bayrakRenk: [0xe8203a, 0xffffff, 0x2a6ad8, 0xff6a10, 0xffb808]
    },
    yardimci: {
      mantar: { sapka: [0xe8203a, 0xff6a78], govde: [0xe8f0d8, 0xffffff], benek: 0xffffff },
      bulut: { alt: 0xd8e8fa, ust: 0xffffff, yanak: 0xffa8c0, emissive: 0x7a90b0 },
      nilufer: { yaprak: [0x3a9a3a, 0x8ad860], cicek: [0xff5aa8, 0xffb4d8], halka: 0xffffff },
      ruzgar: { renk: [0xff8ac0, 0xfff0f8], emissive: 0xff70a8, ok: 0xffffff },
      halka: { renk: [0xff6a10, 0xffd060], emissive: 0xff8a20, cicek: [[0xe8203a, 0xff6a78], [0xffb808, 0xfff060], [0xff5aa8, 0xffb4d8], [0x8e46e0, 0xc89aff]] },
      baloncuk: { renk: 0xfff0f8, kenar: 0xffffff, opaklik: 1.0 },
      esinti: { tur: 'yaprak', renk: 0xffffff, taneRenk: [0xff6a78, 0xfff060, 0xffb4d8, 0xc89aff] }
    },
    kur(ctx) {
      const { T, G, hx, yerY, B } = ctx, V = ctx.veri, ara = ctx.ara, R = ctx.R;
      oaAktif = V; V.kavusH = 0; V.kv = 0;
      const S = ctx.yapi(), F = ctx.yapi(), SU = ctx.yapi(), pir = [];
      const X0 = -50, X1 = hx + 50;
      const LR = [[0xc81030, 0xff5a68], [0xf0a000, 0xfff060], [0xf0489a, 0xffb4d8], [0x7a36d0, 0xc89aff], [0xf05a08, 0xffb060], [0xe8e0e8, 0xffffff]];
      const LG = oaLale(T);
      // sırt (tarla sırası): üçgen kesitli, uzunlamasına z boyunca; renk alttan (yeşil) üste (lale)
      const SR = (() => {
        const K = [[-0.5, 0], [-0.42, 0.55], [-0.2, 0.92], [0.2, 0.92], [0.42, 0.55], [0.5, 0]], pos = [];
        for (let i = 0; i < K.length - 1; i++) { const [a, b] = K[i], [c, d] = K[i + 1]; pos.push(a, b, -0.5, a, b, 0.5, c, d, 0.5, a, b, -0.5, c, d, 0.5, c, d, -0.5); }
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g;
      })();
      // tek lale (sap + yaprak + kadeh)
      const lale = (Y, x, z, k, c, sal) => {
        const y = yerY(x, z), h = 0.62 * k, eg = ara(-0.12, 0.12);
        Y.ekle(G.silA3, x + eg * h * 0.5, y + h / 2, z, 0.025 * k, h, 0.025 * k, 0x3a8a34, 0x5aac44, 0, 0, -eg, sal);
        Y.ekle(G.yaprak, x - 0.06 * k, y + 0.16 * k, z + 0.02, 0.07 * k, 0.42 * k, 0.03 * k, 0x3a8a34, 0x7ac458, 0, ara(0, 3), 0.35, sal * 0.6);
        Y.ekle(LG, x + eg * h, y + h, z, 0.21 * k, 0.34 * k, 0.21 * k, c[0], c[1], 0, ara(0, 3), -eg, sal);
      };

      // ═══ UZAK: renk renk tarla şeritleri ufka kadar (sıralar z boyunca → ufka koşan çizgiler)
      const bandlar = [[-17, -29], [-33, -47], [-52, -74]];
      let ci = 0;
      const LB = [LR[0], LR[1], LR[2], LR[4], LR[2]]; // tarlalarda mor yok: Pırıl mor, sıranın önünde solmasın
      const tP = [], tC = [], tH = [], tc = new T.Color();
      const KS = [[-0.5, 0], [-0.42, 0.55], [-0.2, 0.92], [0.2, 0.92], [0.42, 0.55], [0.5, 0]];
      const sira = (x, y, z, w, h, L, renk) => {
        tc.setHex(renk);
        for (let i = 0; i < KS.length - 1; i++) {
          const [a, b] = KS[i], [c2, d] = KS[i + 1], z0 = z - L / 2, z1 = z + L / 2;
          const V = [[a, b, z0], [a, b, z1], [c2, d, z1], [a, b, z0], [c2, d, z1], [c2, d, z0]];
          for (const v of V) { tP.push(x + v[0] * w, y + v[1] * h, v[2]); tC.push(tc.r, tc.g, tc.b); tH.push(v[1] / 0.92); }
        }
      };
      for (let bi = 0; bi < bandlar.length; bi++) {
        const [za, zb] = bandlar[bi], zc = (za + zb) / 2, L = za - zb, gen = 12 + bi * 4, ara0 = 0.85 + bi * 0.3;
        for (let x = X0 - 30 - bi * 25 + ara(0, 6); x < X1 + 30 + bi * 25; x += gen + ara(1.5, 3)) {
          const c = LB[(ci++ * 3 + bi) % 5];
          for (let rx = 0; rx < gen; rx += ara0) {
            const xx = x + rx, y = yerY(xx, zc);
            sira(xx, y - 0.05, zc, ara0 * 0.9, 0.6 + bi * 0.2, L, ctx.karH(c[0], c[1], 0.3));
          }
        }
      }
      // kanallar (uzunlamasına, x boyunca) ve kenar taşları
      const kanal = (z, w) => {
        SU.ekle(G.kutu, (X0 + X1) / 2, -0.02, z, X1 - X0 + 160, 0.1, w, 0x5aa8e8, 0x8ccaf8);
        for (const s of [-1, 1]) S.ekle(G.kutu, (X0 + X1) / 2, 0.02, z + s * (w / 2 + 0.12), X1 - X0 + 160, 0.14, 0.28, 0x8a9a7a, 0xb0bca0);
        for (let i = 0; i < 26; i++) pir.push([ara(X0 - 20, X1 + 20), 0.12, z + ara(-w / 2.5, w / 2.5), R() * 6, ara(0.12, 0.2)]);
      };
      kanal(-12.2, 2.0); kanal(-31, 2.4); kanal(-49.5, 2.6);
      // kemerli tahta köprü (yakın kanal üstünde) + kayık
      {
        const bx = Math.round(hx * 0.42), bz = -12.2;
        for (let i = -6; i <= 6; i++) { const u = i / 6, yy = 0.55 * (1 - u * u) + 0.12; S.ekle(G.kutu, bx, yy, bz + u * 2.0, 1.6, 0.1, 0.34, 0x8a5a3a, 0xc08a5a, -Math.atan(-1.1 * u * 0.55 / 1.0), 0, 0); }
        for (const s of [-1, 1]) {
          for (let i = -3; i <= 3; i++) { const u = i / 3, yy = 0.55 * (1 - u * u) + 0.12; S.ekle(G.kutu, bx + s * 0.75, yy + 0.35, bz + u * 1.8, 0.08, 0.7, 0.08, 0xf4f0e8, 0xffffff); }
          for (let i = -3; i < 3; i++) { const u0 = i / 3, u1 = (i + 1) / 3, y0 = 0.55 * (1 - u0 * u0) + 0.82, y1 = 0.55 * (1 - u1 * u1) + 0.82; S.ekle(G.kutu, bx + s * 0.75, (y0 + y1) / 2, bz + (u0 + u1) * 0.9, 0.07, 0.07, 0.66, 0xf4f0e8, 0xffffff, -Math.atan2(y1 - y0, 0.6), 0, 0); }
        }
        const K = ctx.yapi();
        K.ekle(G.kureO, 0, 0.08, 0, 1.3, 0.3, 0.5, 0x2a5aa8, 0x4a8ad8);
        K.ekle(G.kureO, 0, 0.2, 0, 1.15, 0.12, 0.38, 0xc08a5a, 0xe0b080);
        for (let q = 0; q < 7; q++) { const c = LR[q % 5]; K.ekle(LG, -0.6 + q * 0.2, 0.22, (q % 2 ? 0.1 : -0.1), 0.16, 0.26, 0.16, c[0], c[1]); }
        K.ekle(G.sil, 0.95, 0.5, 0, 0.03, 0.8, 0.03, 0x8a5a3a, 0xc08a5a);
        K.ekle(G.yaprak, 1.15, 0.72, 0, 0.25, 0.4, 0.02, 0xffffff, 0xfff4e0, 0, 0, -PI / 2);
        const km = new T.Mesh(K.geo(), ctx.malz(true, true, 0, { side: T.DoubleSide })); km.frustumCulled = false; ctx.ekle(km);
        V.kayik = { m: km, x0: bx + 4, x1: bx + 26 };
      }
      // kavak sıraları (kanal boyunca) ve küçük Hollanda evleri
      for (let x = X0 - 60; x < X1 + 60; x += ara(2.6, 3.4)) {
        const z = -34.2, y = yerY(x, z), c = B.agac[Math.floor(R() * 3)], h = ara(4.5, 6.5);
        F.ekle(G.sil, x, y + 0.8, z, 0.12, 1.6, 0.12, 0x5a4a3a, 0x7a6450);
        F.ekle(G.kureU, x, y + 1.4 + h / 2, z, 0.85, h / 2, 0.85, c[0], c[1], 0, 0, 0, 0.12);
      }
      const evRenk = [[0xb84a3a, 0xd86a50], [0xf4ece0, 0xffffff], [0x3a6ab8, 0x5a8ad8], [0x6a8a4a, 0x8aaa5a], [0xe8b040, 0xf8d070]];
      const ev = (x, z, k) => {
        const y = yerY(x, z), c = evRenk[Math.floor(R() * evRenk.length)];
        F.ekle(G.kutu, x, y + 1.0 * k, z, 2.0 * k, 2.0 * k, 2.2 * k, c[0], c[1]);
        F.ekle(G.koni4, x, y + 2.75 * k, z, 1.62 * k, 1.5 * k, 1.75 * k, 0x8a3a2a, 0xb85a3a, 0, PI / 4, 0);
        F.ekle(G.kutu, x, y + 2.2 * k, z + 1.12 * k, 0.5 * k, 0.5 * k, 0.05, 0xffffff, 0xffffff);
        F.ekle(G.kutu, x - 0.4 * k, y + 0.55 * k, z + 1.12 * k, 0.45 * k, 1.0 * k, 0.05, 0x2a5aa8, 0x3a6ac8);
        F.ekle(G.kutu, x + 0.45 * k, y + 1.1 * k, z + 1.12 * k, 0.5 * k, 0.5 * k, 0.05, 0xfff0b0, 0xffffff);
      };
      for (let x = X0 - 40; x < X1 + 40; x += ara(14, 22)) { ev(x, ara(-41, -37), ara(0.9, 1.2)); if (R() < 0.6) ev(x + ara(2.8, 3.6), ara(-42, -38), ara(0.8, 1.0)); }
      for (let x = X0 - 60; x < X1 + 60; x += ara(18, 28)) ev(x, ara(-60, -56), 1.3);

      // ═══ YEL DEĞİRMENLERİ (kanatlar döner; tek çizim)
      const deg = [];
      const degirmen = (Y, x, z, k) => {
        const y = yerY(x, z);
        Y.ekle(G.kule, x, y + 0.5 * k, z, 2.1 * k, 1.0 * k, 2.1 * k, 0x8a3a2a, 0xa85040);
        Y.ekle(G.kule, x, y + 3.6 * k, z, 1.45 * k, 5.4 * k, 1.45 * k, 0x2e5a3a, 0x4a7a50);
        Y.ekle(G.sil, x, y + 1.15 * k, z, 2.0 * k, 0.12 * k, 2.0 * k, 0xf4f0e8, 0xffffff);
        Y.ekle(G.koni, x, y + 7.0 * k, z, 1.45 * k, 1.8 * k, 1.45 * k, 0x6a5a40, 0x9a8a60);
        Y.ekle(G.kutu, x, y + 0.6 * k, z + 1.75 * k, 0.7 * k, 1.0 * k, 0.12, 0xf4f0e8, 0xffffff);
        Y.ekle(G.kutu, x, y + 4.0 * k, z + 1.18 * k, 0.45 * k, 0.6 * k, 0.1, 0xfff0b0, 0xffffff);
        deg.push([x, y + 6.6 * k, z + 1.5 * k, 1.05 * k, ara(0.5, 0.9)]);
      };
      degirmen(S, Math.round(hx * 0.8), -39, 1.15);
      degirmen(S, -18, -27, 0.95);
      degirmen(S, hx + 14, -27, 1.0);
      degirmen(F, hx * 0.25, -44, 1.2);
      degirmen(F, hx * 0.85, -46, 1.2);
      degirmen(F, -40, -45, 1.1);
      degirmen(F, hx + 45, -45, 1.1);

      // ═══ YAKIN (z -2..-10): lale öbekleri (renk blokları), ıslak çimen pırıltıları
      for (let x = -16; x < hx + 22; x += ara(2.2, 3.2)) {
        if (Math.abs(x - hx) < 3.5) continue;
        const c = LR[Math.floor(R() * 5)], w = ara(1.8, 2.8), z0 = ara(-9.5, -3.2), n = Math.round(w * 7);
        for (let i = 0; i < n; i++) lale(S, x + ara(-w / 2, w / 2), z0 + ara(-0.9, 0.9), ara(0.9, 1.25), c, 0.25);
        if (R() < 0.5) { const c2 = LR[Math.floor(R() * 5)]; for (let i = 0; i < 6; i++) lale(S, x + w / 2 + 0.8 + ara(-0.6, 0.6), ara(-8, -5), ara(0.85, 1.1), c2, 0.25); }
      }
      for (let i = 0; i < 26; i++) pir.push([ara(-14, hx + 20), 0.25, ara(-8, -1.5), R() * 6, ara(0.08, 0.13)]);
      // ═══ ÖN (z 1.2..16): alçak lale öbekleri, çimen tutamları, birkaç ıslak taş
      for (let x = -16; x < hx + 22; x += ara(1.3, 2.2)) {
        const z = ara(1.4, 15);
        if (z < 4 && (Math.abs(x - hx) < 3.5 || Math.abs(x) < 3.5)) continue;
        const c = LR[Math.floor(R() * 6)], n = z < 4 ? 4 : 9;
        for (let i = 0; i < n; i++) lale(S, x + ara(-0.7, 0.7), z + ara(-0.5, 0.5), ara(0.75, 1.05) * (z < 4 ? 0.85 : 1.2), c, 0.25);
        if (R() < 0.15) S.ekle(G.kureO, x + 1, 0, z + 0.4, ara(0.35, 0.55), ara(0.2, 0.3), 0.4, 0x8a9a8a, 0xc0ccc0);
        if (R() < 0.4) pir.push([x + ara(-1, 1), 0.2, z, R() * 6, ara(0.08, 0.12)]);
      }
      // ═══ BİLBO'NUN YERİ: piknik yanında tahta takunyalar + lale kovası
      for (const q of [0, 1]) { const tx = hx + 2.1 + q * 0.42, tz = -1.0 + q * 0.12; S.ekle(G.kureO, tx, 0.13, tz, 0.17, 0.13, 0.36, 0xf0b820, 0xffe070); S.ekle(G.kureO, tx, 0.2, tz - 0.08, 0.12, 0.06, 0.18, 0x8a5a2a, 0x8a5a2a); }
      S.ekle(G.kule, hx - 2.6, 0.28, -1.4, 0.32, 0.56, 0.32, 0x7a8a9a, 0xb0c0d0);
      for (let i = 0; i < 7; i++) lale(S, hx - 2.6 + ara(-0.18, 0.18), -1.4 + ara(-0.15, 0.15), 1.25, LR[i % 5], 0.15);

      // ── ağlar
      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0.3, { side: T.DoubleSide, roughness: 0.6 })));
      ctx.ekle(new T.Mesh(F.geo(), ctx.malz(true, true, 0, { emissive: 0x405870, emissiveIntensity: 0.25 })));
      ctx.ekle(new T.Mesh(SU.geo(), ctx.malz(true, true, 0, { roughness: 0.06, metalness: 0.2, emissive: 0x3a7ac0, emissiveIntensity: 0.45 })));
      LG.dispose(); SR.dispose();
      // tarla sıraları: lale başları desenli (dünya konumundan benekler; uzakta yumuşar)
      {
        const g = new T.BufferGeometry();
        g.setAttribute('position', new T.Float32BufferAttribute(tP, 3)); g.setAttribute('color', new T.Float32BufferAttribute(tC, 3)); g.setAttribute('h', new T.Float32BufferAttribute(tH, 1));
        g.computeVertexNormals();
        const m = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, metalness: 0 });
        m.onBeforeCompile = (sh) => {
          sh.vertexShader = 'attribute float h; varying float vH; varying vec3 vWP;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvH = h; vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
          sh.fragmentShader = 'varying float vH; varying vec3 vWP;\n' + sh.fragmentShader.replace('#include <color_fragment>',
            '#include <color_fragment>\n' +
            ' float zz = vWP.z * 2.4 + floor(vWP.x * 1.2) * 0.37; float cz = fract(zz);' +
            ' float bas = smoothstep(0.5, 0.32, abs(cz - 0.5)) * smoothstep(0.2, 0.6, vH);' +
            ' float f = clamp(1.0 - fwidth(zz) * 1.6, 0.0, 1.0); bas = mix(0.8 * smoothstep(0.2, 0.6, vH), bas, f);' +
            ' vec3 yap = mix(vec3(0.22, 0.48, 0.2), diffuseColor.rgb, 0.18);' +
            ' diffuseColor.rgb = mix(yap, diffuseColor.rgb * 1.2, bas);');
        };
        const ms = new T.Mesh(g, m); ctx.ekle(ms);
      }
      // değirmen kanatları
      {
        const kg = oaKanatGeo(ctx, [0xf0ece4, 0xffffff], [0x8a3a2a, 0xa85040]);
        const im = new T.InstancedMesh(kg, ctx.malz(true, true, 0, { side: T.DoubleSide }), deg.length); im.frustumCulled = false; ctx.ekle(im);
        V.kanat = im; V.deg = deg;
      }
      // pırıltılar (ıslak çimen + kanal)
      {
        const pm = new T.MeshBasicMaterial({ color: 0xffffff, fog: false });
        const im = new T.InstancedMesh(G.oct, pm, pir.length); im.frustumCulled = false; ctx.ekle(im);
        V.pir = { im, yer: pir };
      }
      // büyük net gökkuşağı + soluk ikinci kemer
      V.gk = oaGokkusagi(ctx, hx * 0.5, -3, -88, 50, 0.92); V.gk.scale.set(1.15, 0.9, 1);
      V.gk2 = oaGokkusagi(ctx, hx * 0.5, -3, -89, 61, 0.22); V.gk2.scale.set(1.15, 0.9, 1);
      V.o = new T.Object3D();
    },
    guncelle(t, dt, ctx) {
      const V = ctx.veri, o = V.o; if (!o) return;
      const kh = V.kavusH || 0; V.kv += (kh - V.kv) * Math.min(1, dt * 1.5);
      if (V.kayik) { const K = V.kayik, L = K.x1 - K.x0, u = (t * 0.6) % (2 * L), x = u < L ? K.x0 + u : K.x1 - (u - L);
        K.m.position.set(x, Math.sin(t * 1.6) * 0.04, -12.0); K.m.rotation.set(Math.sin(t * 1.3) * 0.04, u < L ? 0 : PI, Math.sin(t * 1.1) * 0.03); }
      V.gk.material.opacity = 0.92 + V.kv * 0.08; V.gk2.material.opacity = 0.22 + V.kv * 0.25;
      { const im = V.kanat; V.kAci = (V.kAci || 0) + dt * 0.9;
        for (let i = 0; i < V.deg.length; i++) { const q = V.deg[i]; o.position.set(q[0], q[1], q[2]); o.rotation.set(0, 0, -V.kAci * q[4] - i); o.scale.setScalar(q[3]); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
        im.instanceMatrix.needsUpdate = true; }
      { const P = V.pir, im = P.im;
        for (let i = 0; i < P.yer.length; i++) {
          const q = P.yer[i], s = (t * 0.8 + q[3]) % 3, k = s < 0.6 ? Math.sin(s / 0.6 * PI) : 0;
          o.position.set(q[0], q[1], q[2]); o.rotation.set(0, t + i, 0.6); o.scale.set(q[4] * k * 0.5, q[4] * k * 1.4, q[4] * k * 0.5); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
        }
        im.instanceMatrix.needsUpdate = true; }
    },
    sok() { oaAktif = null; }
  };
})();
