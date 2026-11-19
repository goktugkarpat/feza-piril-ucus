/* ortam_i.js - Pırıl'ın Uçuş Okulu: final ortamları
   44 · Yıldız Gözlemevi (bölüm 49) · 45 · Büyük Gökkuşağı Karnavalı (bölüm 50)
   Klasik <script> IIFE. OG geometrileri YALNIZ ctx.yapi().ekle(...) içinde kullanılır. */
(function () {
  'use strict';
  window.DY_EK = window.DY_EK || {};
  const PI = Math.PI;

  // ── ortak geometriler (bir kez kurulur, asla doğrudan Mesh'e verilmez ve dispose edilmez) ──
  const OG = {};
  function ogKubbeYarim(T) {
    if (OG.kubbeYarim) return OG.kubbeYarim;
    return (OG.kubbeYarim = new T.SphereGeometry(1, 18, 8, 0, PI * 2, 0, PI * 0.52));
  }
  function ogKemer(T) {
    if (OG.kemer) return OG.kemer;
    return (OG.kemer = new T.TorusGeometry(1, 0.085, 5, 16, PI));
  }
  function ogKemerKalin(T) {
    if (OG.kemerKalin) return OG.kemerKalin;
    return (OG.kemerKalin = new T.TorusGeometry(1, 0.14, 6, 18, PI));
  }
  function ogDilim(T, n) {
    const key = 'dilim_' + n;
    if (OG[key]) return OG[key];
    const h = PI / n, s = Math.sin(h), c = Math.cos(h);
    const A = [0, 1, 0], Bp = [-s, 0, c], C = [s, 0, c], M = [0, -0.07, 1.03];
    const O1 = [-s * 0.52, 0.5, c * 0.52], O2 = [s * 0.52, 0.5, c * 0.52], OM = [0, 0.48, 0.55];
    const pos = [].concat(A, O1, OM, A, OM, O2, O1, Bp, M, O1, M, OM, OM, M, C, OM, C, O2);
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return (OG[key] = g);
  }
  function ogOk(T) {
    if (OG.ok) return OG.ok;
    const s = new T.Shape();
    s.moveTo(-0.18, -0.55);
    s.lineTo(0.18, -0.55);
    s.lineTo(0.18, 0.04);
    s.lineTo(0.54, 0.04);
    s.lineTo(0, 0.64);
    s.lineTo(-0.54, 0.04);
    s.lineTo(-0.18, 0.04);
    s.closePath();
    const g = new T.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: false });
    g.translate(0, 0, -0.07);
    g.computeVertexNormals();
    return (OG.ok = g);
  }
  function ogYildiz(T) {
    if (OG.yildiz) return OG.yildiz;
    const s = new T.Shape();
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * PI * 2 - PI / 2;
      const r = i % 2 === 0 ? 1.0 : 0.44;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
    }
    s.closePath();
    const g = new T.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: false });
    g.translate(0, 0, -0.07);
    g.computeVertexNormals();
    return (OG.yildiz = g);
  }

  // ── ortak yardımcılar ──
  function isikMalz(ctx, guc, pbr) {
    const m = ctx.malz(false, true, 0, Object.assign({ emissive: 0xffffff, emissiveIntensity: guc }, pbr || {}));
    const ob = m.onBeforeCompile;
    m.onBeforeCompile = (sh, r) => {
      if (ob) ob(sh, r);
      sh.fragmentShader = sh.fragmentShader.replace(
        'vec3 totalEmissiveRadiance = emissive;',
        'vec3 totalEmissiveRadiance = emissive * vColor.rgb;'
      );
    };
    return m;
  }

  function haloYap(ctx) {
    const T = ctx.T, pos = [], uv = [], col = [], faz = [], c = new T.Color();
    const it = (r, f) => {
      c.setHex(r);
      for (let k = 0; k < 6; k++) { col.push(c.r, c.g, c.b); faz.push(f); }
      uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
    };
    return {
      q(x, y, z, w, h, renk, f) {
        pos.push(
          x - w, y - h, z, x + w, y - h, z, x + w, y + h, z,
          x - w, y - h, z, x + w, y + h, z, x - w, y + h, z
        );
        it(renk, f || 0);
      },
      qY(x, y, z, rx, rz, renk, f) {
        pos.push(
          x - rx, y, z + rz, x + rx, y, z + rz, x + rx, y, z - rz,
          x - rx, y, z + rz, x + rx, y, z - rz, x - rx, y, z - rz
        );
        it(renk, f || 0);
      },
      mesh(guc, titre, us, order) {
        if (!pos.length) return null;
        const g = new T.BufferGeometry();
        g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
        g.setAttribute('hRenk', new T.Float32BufferAttribute(col, 3));
        g.setAttribute('hFaz', new T.Float32BufferAttribute(faz, 1));
        const m = new T.ShaderMaterial({
          transparent: true, depthWrite: false, blending: T.AdditiveBlending,
          side: T.DoubleSide, fog: false,
          uniforms: { uT: ctx.U.uT, uG: { value: guc }, uTi: { value: titre == null ? 1 : titre }, uUs: { value: us || 2.2 } },
          vertexShader:
            'attribute vec3 hRenk; attribute float hFaz; varying vec2 vU; varying vec3 vR; varying float vF;' +
            'void main(){ vU = uv; vR = hRenk; vF = hFaz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
          fragmentShader:
            'varying vec2 vU; varying vec3 vR; varying float vF; uniform float uT, uG, uTi, uUs;' +
            'void main(){ float d = length(vU - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), uUs);' +
            ' float ti = 1.0 - uTi * (0.12 + 0.08 * sin(uT * 2.1 + vF) + 0.05 * sin(uT * 5.9 + vF * 1.6));' +
            ' gl_FragColor = vec4(vR * a * uG * ti, 1.0); }'
        });
        const me = new T.Mesh(g, m);
        me.renderOrder = order != null ? order : 3;
        me.frustumCulled = false;
        return me;
      }
    };
  }

  let _tmpO = null, _tmpC = null;
  function scratchO(T) { return _tmpO || (_tmpO = new T.Object3D()); }
  function scratchC(T) { return _tmpC || (_tmpC = new T.Color()); }

  // ════════════════════════════════════════════════════════════════════
  // 44 · YILDIZ GÖZLEMEVİ (Bölüm 49)
  // Derin çivit gecede tepede pirinç kubbeli gözlemevleri, dönen teleskoplar,
  // sıcak sokak lambaları ve gökyüzünde halkalı Satürn ile pastel gezegenler
  // ════════════════════════════════════════════════════════════════════
  DY_EK[44] = {
    palet: {
      ad: 'Yıldız Gözlemevi', gece: 1,
      sisRenk: 0x162044, sisYogun: 0.0034, arka: 0x0d1532,
      gok: [0x243462, 0x18264e, 0x121e44, 0x0b1230, 0x040716], gunesPos: [58, 16], gunesRenk: 0xdce8ff,
      ykUst: 0x9eb8f0, ykAlt: 0x2a3454, ykGuc: 1.15, gnRenk: 0xe8f0ff, gnGuc: 1.85, arkaRenk: 0x7aa8ff, arkaGuc: 0.65,
      dag: [[0x344472, 0x1c2648], [0x2a3862, 0x161e3c], [0x202c52, 0x121832]],
      tepe: [0x3c4d78, 0x6278a8, 0x2e3c62, 0x4e608e],
      agac: [[0x1c3a4c, 0x346478], [0x183244, 0x2c566c], [0x224454, 0x3e7488]],
      zemin: [0x6c7a9e, 0x3e486a, 0x505c82], cimen: [0x38486a, 0x687aa4, 0x52648c],
      cicek: [[0x5ac8e8, 0xc0f4ff], [0xff7aa8, 0xffd0e4], [0x58e0b8, 0xc4fff0], [0x7aa8ff, 0xd4e4ff]],
      sisSerit: [0x243260, 0x162044], siluet: [0x141c38, 0x26345c]
    },
    secenek: {
      agacTur: 'selvi', agacMeyveYok: true, caliYok: true, kulubeYok: true, degirmenYok: true,
      tepeCicekYok: true, mantarSusYok: true, cicekYok: true, cimenYok: true, citYok: true,
      piknikTur: 'yok', bayrakYok: true, kusYok: true, onSiluetYok: true,
      bulutSay: 5, bulutRenk: [0x263664, 0x4c629c], ay: true, yildizlar: 1,
      zeminDesen: 'ay', zeminParlak: 0.08,
      ucusanTur: 'isik', ucusanRenk: [0xaee8ff, 0xdcf4ff, 0xffc8dc],
      salincak: {
        govde: [0x3c4c72, 0x7c90b8],
        yaprak: [[0x223e54, 0x46728e], [0x2a4a60, 0x5684a0]],
        sarmasik: [0xb47e28, 0xebc05c],
        cicek: [[0x62d6ff, 0xd4f6ff], [0xff96c0, 0xffe0ee]],
        tacYok: true,
        kusYok: true
      }
    },
    yardimci: {
      mantar: { sapka: [0xdc4c64, 0xff94a4], govde: [0xdce4f0, 0xffffff], benek: 0xfff0d0 },
      bulut: { alt: 0x5c72b8, ust: 0xeaf2ff, yanak: 0xff8ab8, emissive: 0x2c3c74 },
      nilufer: { yaprak: [0x2a7890, 0x62c4d4], cicek: [0xff8ab8, 0xffe0ee], halka: 0xa0f0ff, emissive: 0x1a5068 },
      ruzgar: { renk: [0x58c4ff, 0xe4f8ff], emissive: 0x2080c8, ok: 0xffffff },
      halka: { renk: [0xd48e24, 0xffe088], emissive: 0x9a6010, cicek: [[0x58d4ff, 0xc8f4ff], [0xff82b0, 0xffd4e6], [0x60e8b8, 0xc8fff0]] },
      baloncuk: { renk: 0x82dcff, kenar: 0xffffff, cizgi: 0x42b4f4, opaklik: 1.4 },
      esinti: { tur: 'isik', renk: 0xbce8ff, taneRenk: [0x98e4ff, 0xffffff, 0xffd2e6] }
    },
    yardimciKur: {
      // Salıncak: pirinç usturlap halkaları ve sıcak gözlemevi fenerleri
      salincak(ctx, o) {
        const { G } = ctx, z = o.z, sx = o.sapanX;
        // Kemer tepesinde iç içe geçmiş pirinç usturlap (armillary) halkaları
        o.A.ekle(G.sil, 0, 6.02, z + 0.08, 0.055, 0.48, 0.055, 0xb88424, 0xf2c868);
        o.A.ekle(G.halka, 0, 6.55, z + 0.08, 0.68, 0.68, 0.6, 0xb88424, 0xffe48c, 0.24, 0.22, 0.12);
        o.A.ekle(G.halkaInce, 0, 6.55, z + 0.08, 0.54, 0.54, 0.72, 0xd49a30, 0xfff2b0, -0.38, 0.52, 0.36);
        o.A.ekle(G.halkaInce, 0, 6.55, z + 0.08, 0.38, 0.38, 0.72, 0xc88e28, 0xffe696, 0.55, -0.3, -0.4);
        o.A.ekle(G.sil, 0, 6.55, z + 0.08, 0.028, 1.5, 0.028, 0xc8922c, 0xffe898, 0.15, 0, 0.62);
        for (let k = 0; k < 8; k++) {
          const a = k / 8 * PI * 2;
          o.A.ekle(G.kureK, Math.cos(a) * 0.68, 6.55 + Math.sin(a) * 0.68, z + 0.08, 0.045, 0.045, 0.045, 0xd8a234, 0xfff4b0);
        }
        o.FL.ekle(G.kureK, 0, 6.55, z + 0.08, 0.13, 0.13, 0.13, 0x80e8ff, 0xe8fcff);
        // Yan sütunlarda pirinç usturlap halkaları + sıcak ikincil fenerler
        for (const q of [-1, 1]) {
          const tx = q * sx;
          o.S.ekle(G.halkaInce, tx, 4.95, z + 0.08, 0.56, 0.56, 0.75, 0xb88424, 0xf2c868, 0.18, q * 0.35, 0);
          o.S.ekle(G.kureK, tx, 5.5, z + 0.08, 0.1, 0.12, 0.1, 0xc89228, 0xffe488);
          o.FL.ekle(G.kureK, tx, 4.95, z + 0.08, 0.08, 0.08, 0.08, 0x80e8ff, 0xe8fcff);
          const lx = q * (sx + 1.34), ly = 3.68, lz = z + 0.24;
          o.S.ekle(G.sil, q * (sx + 1.15), 4.46, lz - 0.04, 0.035, 0.58, 0.035, 0x3c4c72, 0x7084ac, 0, 0, -q * 0.95);
          o.S.ekle(G.sil, lx, ly + 0.32, lz, 0.018, 0.44, 0.018, 0xb88424, 0xf2c868);
          o.S.ekle(G.koni, lx, ly + 0.18, lz, 0.15, 0.12, 0.15, 0x9c6820, 0xe0aa48);
          o.S.ekle(G.sil, lx, ly - 0.16, lz, 0.11, 0.05, 0.11, 0x9c6820, 0xe0aa48);
          o.FL.ekle(G.kureK, lx, ly, lz, 0.14, 0.17, 0.14, 0xff9e38, 0xffeeb4);
        }
      }
    },
    kur(ctx) {
      const { T, G, hx, yerY, tepeY, R, ara } = ctx;
      const S = ctx.yapi(), BR = ctx.yapi(), L = ctx.yapi(), H = haloYap(ctx), SH = haloYap(ctx);
      const KB = ogKubbeYarim(T), KM = ogKemer(T), telList = [];
      const zy = (x, z) => Math.max(yerY(x, z), tepeY(x, z));

      // 1) Tepe gözlemevi kuleleri (z: -10 .. -26) — krem sıvalı duvarlar, yivli bakır/pirinç kubbeler, açık yarık ve dönen teleskoplar
      const kule = (x, z, k, bakir, yanOda, bakSol, telVar) => {
        const y0 = zy(x, z) - 0.35;
        const r = 2.35 * k, h = 4.6 * k, yDome = y0 + h + 0.85 * k;
        // Basamaklı arduvaz taş kaide
        S.ekle(G.sil, x, y0 + 0.25 * k, z, r * 1.42, 0.55 * k, r * 1.42, 0x384668, 0x62749a);
        S.ekle(G.sil, x, y0 + 0.65 * k, z, r * 1.24, 0.42 * k, r * 1.24, 0x445478, 0x7488ae);
        // Sıcak krem sıvalı ana silindir duvar
        S.ekle(G.sil, x, y0 + 0.85 * k + h * 0.5, z, r, h, r, 0xcebc9e, 0xfcf0dc);
        // Dikey mimari taş sütunçeler
        for (let i = 0; i < 6; i++) {
          const a = i / 6 * PI * 2 + 0.25;
          if (Math.cos(a) < -0.5) continue;
          S.ekle(G.kutu, x + Math.sin(a) * r * 0.98, y0 + 0.85 * k + h * 0.5, z + Math.cos(a) * r * 0.98,
            0.22 * k, h * 0.94, 0.16 * k, 0xb8a68a, 0xeae0cc, 0, a, 0);
        }
        // Korniş kuşakları ve üst gözlem balkonu
        S.ekle(G.sil, x, y0 + 0.85 * k + h * 0.48, z, r * 1.04, 0.18 * k, r * 1.04, 0xb8a68a, 0xeee2ce);
        S.ekle(G.sil, x, yDome - 0.08 * k, z, r * 1.16, 0.28 * k, r * 1.16, 0x4a5a7c, 0x8498be);
        BR.ekle(G.halkaInce, x, yDome + 0.08 * k, z, r * 1.12, r * 1.12, 0.9 * k, 0x9c6e24, 0xebc05c, PI / 2, 0, 0);
        BR.ekle(G.halkaInce, x, yDome + 0.46 * k, z, r * 1.12, r * 1.12, 0.8 * k, 0xa87628, 0xf2c868, PI / 2, 0, 0);
        for (let i = 0; i < 8; i++) {
          const a = i / 8 * PI * 2;
          if (Math.cos(a) < -0.35) continue;
          BR.ekle(G.sil, x + Math.sin(a) * r * 1.11, yDome + 0.27 * k, z + Math.cos(a) * r * 1.11, 0.045 * k, 0.42 * k, 0.045 * k, 0x9c6e24, 0xebc05c);
        }
        // Kemerli sıcak pencereler ve giriş kapısı
        for (const ox of [-0.95 * k, 0, 0.95 * k]) {
          const pz = z + Math.sqrt(Math.max(0.1, r * r - ox * ox)) * 0.99;
          const py = y0 + 0.85 * k + (ox === 0 ? h * 0.62 : h * 0.56);
          const wy = ox === 0 ? 0.95 * k : 0.72 * k, wx = ox === 0 ? 0.52 * k : 0.38 * k;
          const ry = Math.atan2(ox, r * 0.95);
          S.ekle(G.kutu, x + ox, py, pz, wx * 1.25, wy * 1.18, 0.1 * k, 0x564840, 0x887464, 0, ry, 0);
          L.ekle(G.kutu, x + ox, py, pz + 0.04 * k, wx, wy, 0.06 * k, 0xff9a3c, 0xffe09c, 0, ry, 0);
          L.ekle(G.kureK, x + ox, py + wy * 0.5, pz + 0.04 * k, wx * 0.5, wx * 0.5, 0.04 * k, 0xffa84c, 0xffe6aa, 0, ry, 0);
          H.q(x + ox, py + 0.1 * k, pz + 0.2 * k, wx * 2.2, wy * 1.9, 0xff9e44, ox + z);
        }
        // Kapı
        S.ekle(G.kutu, x, y0 + 1.38 * k, z + r * 0.99, 0.84 * k, 1.3 * k, 0.14 * k, 0x44342e, 0x6a5044);
        S.ekle(G.kureK, x, y0 + 2.02 * k, z + r * 0.99, 0.42 * k, 0.42 * k, 0.08 * k, 0x44342e, 0x6a5044);
        // Opsiyonel yan gözlemevi kanadı + küçük yardımcı kubbe
        if (yanOda) {
          const sx = x + yanOda * 3.1 * k, sz = z - 0.5 * k;
          S.ekle(G.kutu, sx, y0 + 1.65 * k, sz, 2.7 * k, 3.1 * k, 2.4 * k, 0xc6b496, 0xf2e4cc);
          S.ekle(G.sil, sx, y0 + 0.22 * k, sz, 1.8 * k, 0.5 * k, 1.5 * k, 0x3a486a, 0x64769c);
          BR.ekle(KB, sx, y0 + 3.2 * k, sz, 1.32 * k, 1.25 * k, 1.32 * k, 0x9c6e24, 0xf0c25e);
          BR.ekle(G.sil, sx, y0 + 4.58 * k, sz, 0.04 * k, 0.55 * k, 0.04 * k, 0xb88424, 0xffe088);
          L.ekle(G.kutu, sx, y0 + 1.8 * k, sz + 1.22 * k, 0.42 * k, 0.72 * k, 0.06 * k, 0xff9e40, 0xffe2a2);
        }
        // Yivli pirinç / bakır kubbe
        const cDome = bakir ? [0x9c4c24, 0xec944c] : [0xac7620, 0xf4c45c];
        BR.ekle(KB, x, yDome + 0.12 * k, z, r * 1.03, r * 0.98, r * 1.03, cDome[0], cDome[1]);
        BR.ekle(G.halka, x, yDome + 0.14 * k, z, r * 1.03, r * 1.03, 0.7 * k, 0x98681e, 0xe8bc58, PI / 2, 0, 0);
        // Kubbe üzerinde 6 meridyen pirinç kaburga
        for (let i = 0; i < 6; i++) {
          const a = i / 6 * PI;
          BR.ekle(KM, x, yDome + 0.14 * k, z, r * 1.045, r * 0.99, r * 1.045, 0xb88226, 0xffe288, 0, a, 0);
        }
        // Pürüzsüz eğrisel açık gözlem yarığı + yana kaymış kavisli kapak çerçeveleri
        const sd = bakSol ? -1 : 1, slitA = sd * 0.35;
        const slitT = new T.TorusGeometry(r * 1.015, 0.25 * k, 6, 12, PI * 0.42);
        S.ekle(slitT, x, yDome + 0.14 * k, z, 1, 0.97, 1, 0x090e22, 0x101836, 0, -PI / 2 + slitA, 0.26);
        slitT.dispose();
        const railT = new T.TorusGeometry(r * 1.04, 0.06 * k, 5, 12, PI * 0.44);
        for (const q of [-1, 1]) {
          BR.ekle(railT, x + Math.cos(slitA) * q * 0.27 * k, yDome + 0.14 * k, z - Math.sin(slitA) * q * 0.27 * k,
            1, 0.98, 1, cDome[0], 0xf8d274, 0, -PI / 2 + slitA, 0.26);
        }
        railT.dispose();
        // Tepede açık yarıktan göğe uzanan zarif pirinç teleskop
        const pivX = x + Math.sin(slitA) * r * 0.55, pivY = yDome + r * 0.64, pivZ = z + Math.cos(slitA) * r * 0.55;
        if (telVar) {
          const TW = ctx.yapi();
          // Pivot (0,0,0) etrafında +X yönüne uzun ve belirgin uzanan pirinç teleskop
          TW.ekle(G.sil, 0.9 * k, 0, 0, 0.22 * k, 3.1 * k, 0.22 * k, 0xa87420, 0xf8d474, 0, 0, -PI / 2);
          TW.ekle(G.kule, 2.58 * k, 0, 0, 0.28 * k, 0.82 * k, 0.28 * k, 0xc08826, 0xffe894, 0, 0, -PI / 2);
          TW.ekle(G.halka, 1.9 * k, 0, 0, 0.26 * k, 0.26 * k, 0.26 * k, 0x8a5818, 0xdca840, 0, PI / 2, 0);
          TW.ekle(G.halka, 0.55 * k, 0, 0, 0.25 * k, 0.25 * k, 0.25 * k, 0x8a5818, 0xdca840, 0, PI / 2, 0);
          TW.ekle(G.sil, 0.72 * k, 0.34 * k, 0, 0.065 * k, 1.1 * k, 0.065 * k, 0xa87624, 0xf2c868, 0, 0, -PI / 2);
          TW.ekle(G.sil, -0.78 * k, 0, 0, 0.1 * k, 0.5 * k, 0.1 * k, 0x4a382c, 0x7a604c, 0, 0, -PI / 2);
          TW.ekle(G.kureK, 2.98 * k, 0, 0, 0.06 * k, 0.26 * k, 0.26 * k, 0x6ce4ff, 0xf0feff);
          const tm = new T.Mesh(TW.geo(), ctx.malz(true, true, 0.45, { roughness: 0.24, metalness: 0.52, emissive: 0x2e1e08, emissiveIntensity: 0.34 }));
          tm.position.set(pivX, pivY, pivZ);
          ctx.ekle(tm);
          telList.push({ mesh: tm, dir: sd, faz: x * 0.17 + telList.length * 1.9 });
        } else {
          BR.ekle(G.sil, pivX + sd * 0.95 * k, pivY + 0.72 * k, pivZ + 0.28 * k, 0.2 * k, 2.8 * k, 0.2 * k, 0xa87420, 0xf8d474, 0.16, 0, -sd * 0.9);
          BR.ekle(G.kule, pivX + sd * 1.85 * k, pivY + 1.38 * k, pivZ + 0.44 * k, 0.26 * k, 0.74 * k, 0.26 * k, 0xc08826, 0xffe894, 0.16, 0, -sd * 0.9);
        }
      };

      kule(-11, -15, 1.06, true, -1, false, true);
      kule(hx * 0.31, -21, 1.32, false, 1, false, true);
      kule(hx * 0.66, -23.5, 1.46, true, -1, true, true);
      kule(hx + 18, -16, 1.14, false, 1, true, false);
      // Uzak tepelerdeki küçük kubbeli gözlemevleri (z: -38 .. -43)
      for (const [ux, uz, uk, ub] of [[-28, -40, 0.88, false], [hx * 0.47, -41, 0.96, true], [hx + 34, -39, 0.86, false]]) {
        const uy = zy(ux, uz) - 0.35;
        S.ekle(G.sil, ux, uy + 1.9 * uk, uz, 2.0 * uk, 3.8 * uk, 2.0 * uk, 0xb4a48c, 0xe8dac2);
        BR.ekle(KB, ux, uy + 3.8 * uk, uz, 2.08 * uk, 1.95 * uk, 2.08 * uk, ub ? 0x9c4c24 : 0xac7620, ub ? 0xe08844 : 0xebc058);
        L.ekle(G.kutu, ux, uy + 2.2 * uk, uz + 1.98 * uk, 0.44 * uk, 0.72 * uk, 0.06 * uk, 0xff9a3c, 0xffe09c);
      }

      // 2) Orta bahçe usturlap (armillary) anıtı (hx * 0.47, z = -10.5)
      {
        const ax = hx * 0.47, az = -10.5, ay = zy(ax, az) - 0.1;
        S.ekle(G.sil, ax, ay + 0.18, az, 2.6, 0.36, 2.2, 0x3a486a, 0x6a7ca2);
        S.ekle(G.sil, ax, ay + 0.48, az, 1.8, 0.28, 1.5, 0x48587e, 0x7c8eb4);
        S.ekle(G.kule, ax, ay + 1.42, az, 0.5, 1.65, 0.5, 0x56668c, 0x9aaac8);
        const cy = ay + 3.32;
        BR.ekle(G.halka, ax, cy, az, 1.05, 1.05, 0.9, 0x9e6c1e, 0xf2c864, 0.2, 0.25, 0.15);
        BR.ekle(G.halkaInce, ax, cy, az, 0.88, 0.88, 0.9, 0xb88424, 0xffe488, -0.45, 0.6, 0.35);
        BR.ekle(G.halkaInce, ax, cy, az, 0.66, 0.66, 0.9, 0x9e6c1e, 0xf2c864, 0.6, -0.35, -0.4);
        BR.ekle(G.sil, ax, cy, az, 0.035, 2.35, 0.035, 0xb88424, 0xffe488, 0.12, 0, -0.5);
        L.ekle(G.kureK, ax, cy, az, 0.24, 0.24, 0.24, 0x66dcff, 0xe8fcff);
        H.q(ax, cy, az + 0.3, 1.9, 1.9, 0x66dcff, 1.1);
      }

      // 3) Sıcak demir sokak lambaları (z: -5)
      const hamLamp = [-17, -7.5, hx * 0.16, hx * 0.34, hx * 0.52, hx * 0.72, hx - 4.5, hx + 4.5, hx + 15, hx + 25];
      const lampX = [];
      for (let i = 0; i < hamLamp.length; i++) {
        const x = hamLamp[i];
        if (Math.abs(x) < 3.4 || Math.abs(x - hx) < 3.4) continue;
        if (lampX.some((p) => Math.abs(p - x) < 5.2)) continue;
        lampX.push(x);
      }
      for (let i = 0; i < lampX.length; i++) {
        const lx = lampX[i], lz = -5.0 + (i % 2 ? -0.35 : 0.25), ly = yerY(lx, lz) - 0.05;
        const dir = i % 2 ? 1 : -1;
        S.ekle(G.kule, lx, ly + 0.32, lz, 0.24, 0.64, 0.24, 0x1a2238, 0x384668);
        S.ekle(G.kule, lx, ly + 1.95, lz, 0.075, 3.0, 0.075, 0x1e263e, 0x425278);
        BR.ekle(G.sil, lx, ly + 1.5, lz, 0.1, 0.12, 0.1, 0x9c6e22, 0xe8bc58);
        BR.ekle(G.sil, lx, ly + 3.4, lz, 0.11, 0.12, 0.11, 0x9c6e22, 0xe8bc58);
        S.ekle(KM, lx + dir * 0.42, ly + 3.46, lz, 0.42, 0.42, 0.42, 0x202840, 0x48587e, 0, 0, 0);
        const fx = lx + dir * 0.82, fy = ly + 3.16;
        BR.ekle(G.koni, fx, fy + 0.24, lz, 0.24, 0.18, 0.24, 0x9c6e22, 0xe8bc58);
        BR.ekle(G.sil, fx, fy - 0.22, lz, 0.15, 0.06, 0.15, 0x9c6e22, 0xe8bc58);
        L.ekle(G.kureK, fx, fy, lz, 0.18, 0.22, 0.18, 0xff9840, 0xffdea8);
        H.q(fx, fy, lz + 0.22, 1.65, 1.65, 0xffa04a, i * 1.4);
        H.qY(fx, Math.max(0.06, yerY(fx, lz) + 0.05), lz, 2.2, 1.5, 0xff9844, i * 1.4);
      }

      // 4) Bilbo'nun yıldız izleme köşesi (hx, z = -2.2)
      {
        const bz = -2.25;
        S.ekle(G.sil, hx, 0.035, bz + 0.35, 2.75, 0.06, 1.55, 0x243a68, 0x3e5c98);
        BR.ekle(G.halkaInce, hx, 0.06, bz + 0.35, 2.68, 1.5, 0.5, 0xa87826, 0xe8be5e, PI / 2, 0, 0);
        // Küçük ahşap üçayak üzerinde pirinç dürbün
        const tx = hx - 2.35, tz = bz - 0.25;
        for (let j = 0; j < 3; j++) {
          const a = j / 3 * PI * 2 + 0.3;
          S.ekle(G.sil, tx + Math.cos(a) * 0.28, 0.52, tz + Math.sin(a) * 0.24, 0.035, 1.12, 0.035, 0x624028, 0x986842, Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35);
        }
        BR.ekle(G.sil, tx - 0.1, 1.18, tz, 0.09, 0.92, 0.09, 0xa87624, 0xf2c868, 0, 0, 0.92);
        BR.ekle(G.kule, tx - 0.44, 1.42, tz, 0.12, 0.26, 0.12, 0xb88428, 0xffe488, 0, 0, 0.92);
        // Sıcak fener + yıldız haritası sehpası
        const lx = hx + 2.35, lz = bz - 0.15;
        S.ekle(G.sil, lx, 0.22, lz, 0.32, 0.44, 0.32, 0x5a4230, 0x8a6448);
        BR.ekle(G.koni, lx, 0.72, lz, 0.18, 0.14, 0.18, 0x9c6e22, 0xe8bc58);
        L.ekle(G.kureK, lx, 0.54, lz, 0.14, 0.18, 0.14, 0xff9a40, 0xffe0a8);
        H.q(lx, 0.54, lz + 0.18, 1.25, 1.25, 0xffa04a, 2.5);
        S.ekle(G.kutu, hx + 1.15, 0.36, bz - 0.45, 0.72, 0.05, 0.48, 0xd8c8a8, 0xfff4dc, 0.35, -0.25, 0);
      }

      // 5) Gözlemevi patika taşları, alçak ay ışıklı taşlar & ön sıra kaya kenarları
      for (let x = -22; x < hx + 26; x += 2.6) {
        const z = -5.6 + Math.sin(x * 0.14) * 0.9, y = yerY(x, z);
        S.ekle(G.sil, x, y + 0.025, z, ara(0.7, 1.05), 0.05, ara(0.45, 0.65), 0x3a4668, 0x5c6d94, 0, Math.cos(x * 0.14) * 0.2, 0);
      }
      for (let i = 0; i < 42; i++) {
        const z = ara(-3.5, -12), x = ara(-34, hx + 36);
        if ((z > -5 && Math.abs(x) < 4) || (z > -7 && Math.abs(x - hx) < 5)) continue;
        const s = ara(0.22, 0.58), y = yerY(x, z);
        S.ekle(G.kureU, x, y + s * 0.24, z, s * 1.2, s * 0.58, s * 0.9, 0x384668, 0x6c7ea6, ara(-0.2, 0.2), R() * 3, ara(-0.2, 0.2));
      }
      for (let x = -38; x < hx + 44; x += ara(3.0, 5.2)) {
        const z = ara(17, 20.5), s = ara(0.75, 1.35);
        S.ekle(G.kureU, x, -0.3, z, s * 1.3, s * 0.6, s * 0.9, 0x182240, 0x344670, 0, R() * 3, 0);
      }

      // 6) Uzay derinliği: yumuşak camgöbeği-çivit bulutsu (mor & parlak sarı yok)
      {
        const nm = new T.ShaderMaterial({
          transparent: true, depthWrite: false, fog: false, blending: T.AdditiveBlending,
          uniforms: { uT: ctx.U.uT },
          vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
          fragmentShader:
            'varying vec2 vP; uniform float uT;' +
            'void main(){ vec2 p = vP * 0.026;' +
            ' float a = sin(p.x * 1.2 + sin(p.y * 1.9 + uT * 0.02) * 1.4) * sin(p.y * 1.6 - p.x * 0.5) + 0.45 * sin(p.x * 2.9 + p.y * 2.1);' +
            ' float b = sin(p.x * 2.1 - p.y * 1.1 + 1.8) * sin(p.y * 2.4 + 0.9) + 0.35 * sin(p.x * 3.8 - p.y * 3.2);' +
            ' float m = exp(-pow(vP.y * 0.022 - 0.18 * sin(vP.x * 0.018), 2.0) * 3.2);' +
            ' vec3 c = vec3(0.08, 0.42, 0.62) * smoothstep(0.12, 1.0, a) + vec3(0.45, 0.18, 0.36) * smoothstep(0.35, 1.1, b);' +
            ' gl_FragColor = vec4(c * m * 0.36, 1.0); }'
        });
        const neb = new T.Mesh(new T.PlaneGeometry(540, 140), nm);
        neb.position.set(hx * 0.45, 56, -146);
        neb.rotation.z = 0.24;
        neb.renderOrder = -9;
        neb.frustumCulled = false;
        ctx.ekle(neb);
      }

      // 7) Gökte: Görkemli Eğik Halkalı Satürn + Pastel Gezegenler + Dönen Uydular (z: -58 .. -86)
      // A) Büyük Halkalı Satürn
      const sx = hx * 0.52, sy = 33.8, sz = -74, sr = 5.3;
      const satMat = new T.ShaderMaterial({
        fog: false, uniforms: { uT: ctx.U.uT },
        vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normal; vV = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader:
          'varying vec3 vN; varying vec3 vV; uniform float uT;' +
          'void main(){ vec3 n = normalize(vN); float lon = atan(n.z, n.x) + uT * 0.06; float lat = asin(clamp(n.y, -1.0, 1.0));' +
          ' float b1 = 0.5 + 0.5 * sin(lat * 11.0 + 0.3 * sin(lon * 2.0));' +
          ' float b2 = 0.5 + 0.5 * sin(lat * 23.0 + 1.2 + 0.2 * cos(lon * 3.0));' +
          ' vec3 c = mix(vec3(0.88, 0.68, 0.52), vec3(0.98, 0.87, 0.72), b1);' +
          ' c = mix(c, vec3(0.95, 0.76, 0.66), b2 * 0.45);' +
          ' c = mix(c, vec3(0.76, 0.62, 0.58), smoothstep(0.85, 1.35, abs(lat)) * 0.55);' +
          ' float d = clamp(dot(normalize(vV), normalize(vec3(0.62, 0.42, 0.66))), 0.0, 1.0);' +
          ' c *= 0.24 + 0.88 * smoothstep(-0.18, 0.65, d);' +
          ' float rim = pow(1.0 - clamp(vV.z, 0.0, 1.0), 2.6); c += vec3(0.95, 0.78, 0.68) * rim * 0.45;' +
          ' gl_FragColor = vec4(c, 1.0); }'
      });
      const saturn = new T.Mesh(new T.SphereGeometry(sr, 36, 24), satMat);
      saturn.position.set(sx, sy, sz);
      saturn.rotation.z = -0.32;
      saturn.renderOrder = -7;
      ctx.ekle(saturn);
      SH.q(sx, sy, sz - 5, sr * 5.2, sr * 5.2, 0xd8a888, 0.2);

      const satRingMat = new T.ShaderMaterial({
        transparent: true, depthWrite: false, side: T.DoubleSide, fog: false,
        uniforms: { uT: ctx.U.uT },
        vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader:
          'varying vec3 vP; uniform float uT;' +
          'void main(){ float r = length(vP.xy); float u = clamp((r - 7.1) / 5.7, 0.0, 1.0);' +
          ' float kenar = smoothstep(0.0, 0.08, u) * smoothstep(1.0, 0.88, u);' +
          ' float cassini = 1.0 - exp(-pow((u - 0.62) * 26.0, 2.0)) * 0.85;' +
          ' float ince = 0.78 + 0.22 * sin(u * 68.0 + uT * 0.15);' +
          ' vec3 c = mix(vec3(0.84, 0.76, 0.72), vec3(0.99, 0.90, 0.78), smoothstep(0.15, 0.55, u));' +
          ' c = mix(c, vec3(0.86, 0.88, 0.98), smoothstep(0.68, 0.95, u) * 0.55);' +
          ' float a = kenar * cassini * ince * (0.45 + 0.42 * smoothstep(0.05, 0.35, u));' +
          ' gl_FragColor = vec4(c, a); }'
      });
      const saturnRings = new T.Mesh(new T.RingGeometry(7.1, 12.8, 64, 2), satRingMat);
      saturnRings.position.set(sx, sy, sz);
      saturnRings.rotation.order = 'ZYX';
      saturnRings.rotation.set(1.2, 0.0, -0.32);
      saturnRings.renderOrder = -6;
      ctx.ekle(saturnRings);

      // B) Sol üstte halkalı pastel buz-mavi gezegen (z = -60)
      const px1 = hx * 0.16, py1 = 29.0, pz1 = -60, pr1 = 3.1;
      const iceMat = new T.ShaderMaterial({
        fog: false, uniforms: { uT: ctx.U.uT },
        vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normal; vV = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader:
          'varying vec3 vN; varying vec3 vV; uniform float uT;' +
          'void main(){ vec3 n = normalize(vN); float lon = atan(n.z, n.x) - uT * 0.08; float lat = asin(clamp(n.y, -1.0, 1.0));' +
          ' float f = 0.5 + 0.5 * sin(lat * 8.0 + sin(lon * 2.0) * 0.35);' +
          ' vec3 c = mix(vec3(0.42, 0.78, 0.94), vec3(0.76, 0.95, 0.98), f);' +
          ' float d = clamp(dot(normalize(vV), normalize(vec3(0.62, 0.42, 0.66))), 0.0, 1.0);' +
          ' c *= 0.25 + 0.85 * smoothstep(-0.18, 0.65, d);' +
          ' float rim = pow(1.0 - clamp(vV.z, 0.0, 1.0), 2.5); c += vec3(0.6, 0.92, 1.0) * rim * 0.6;' +
          ' gl_FragColor = vec4(c, 1.0); }'
      });
      const icePlanet = new T.Mesh(new T.SphereGeometry(pr1, 28, 18), iceMat);
      icePlanet.position.set(px1, py1, pz1);
      icePlanet.renderOrder = -7;
      ctx.ekle(icePlanet);
      SH.q(px1, py1, pz1 - 4, pr1 * 4.4, pr1 * 4.4, 0x70d4ff, 1.4);

      const iceRingMat = new T.ShaderMaterial({
        transparent: true, depthWrite: false, side: T.DoubleSide, fog: false,
        vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader:
          'varying vec3 vP; void main(){ float r = length(vP.xy); float u = clamp((r - 4.0) / 2.2, 0.0, 1.0);' +
          ' float a = smoothstep(0.0, 0.16, u) * smoothstep(1.0, 0.82, u) * (0.55 + 0.25 * sin(u * 26.0));' +
          ' gl_FragColor = vec4(vec3(0.74, 0.94, 1.0), a * 0.72); }'
      });
      const iceRing = new T.Mesh(new T.RingGeometry(4.0, 6.2, 48, 2), iceRingMat);
      iceRing.position.set(px1, py1, pz1);
      iceRing.rotation.order = 'ZYX';
      iceRing.rotation.set(1.24, 0.0, 0.38);
      iceRing.renderOrder = -6;
      ctx.ekle(iceRing);

      // C) Sağ üstte pastel şeftali-mercan gezegen (z = -84)
      const px2 = hx * 0.86, py2 = 31.8, pz2 = -84, pr2 = 3.8;
      const coralMat = new T.ShaderMaterial({
        fog: false, uniforms: { uT: ctx.U.uT },
        vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normal; vV = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader:
          'varying vec3 vN; varying vec3 vV; uniform float uT;' +
          'void main(){ vec3 n = normalize(vN); float lon = atan(n.z, n.x) + uT * 0.05; float lat = asin(clamp(n.y, -1.0, 1.0));' +
          ' float sw = 0.5 + 0.5 * sin(lat * 6.0 + cos(lon * 2.0 + lat * 2.0) * 0.9);' +
          ' vec3 c = mix(vec3(0.92, 0.54, 0.58), vec3(0.99, 0.78, 0.70), sw);' +
          ' float d = clamp(dot(normalize(vV), normalize(vec3(0.62, 0.42, 0.66))), 0.0, 1.0);' +
          ' c *= 0.24 + 0.86 * smoothstep(-0.18, 0.65, d);' +
          ' float rim = pow(1.0 - clamp(vV.z, 0.0, 1.0), 2.5); c += vec3(1.0, 0.74, 0.76) * rim * 0.55;' +
          ' gl_FragColor = vec4(c, 1.0); }'
      });
      const coralPlanet = new T.Mesh(new T.SphereGeometry(pr2, 28, 18), coralMat);
      coralPlanet.position.set(px2, py2, pz2);
      coralPlanet.renderOrder = -7;
      ctx.ekle(coralPlanet);
      SH.q(px2, py2, pz2 - 4, pr2 * 4.2, pr2 * 4.2, 0xff9494, 2.7);

      // D) Yörüngede dönen 3 uydu + sol uzak nane gezegeni (tek InstancedMesh)
      const MN = ctx.yapi();
      MN.ekle(G.kure, 0, 0, 0, 1, 1, 1, 0xb8c0cc, 0xffffff);
      const moonsIm = new T.InstancedMesh(
        MN.geo(),
        new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, emissive: 0x364468, emissiveIntensity: 0.55, fog: false }),
        4
      );
      const tc = scratchC(T);
      [0xfff0dc, 0xa8e8ff, 0xffd0dc, 0x86ecd0].forEach((hex, idx) => { tc.setHex(hex); moonsIm.setColorAt(idx, tc); });
      moonsIm.frustumCulled = false;
      moonsIm.renderOrder = -7;
      ctx.ekle(moonsIm);
      SH.q(-17, 29.5, -72, 9.5, 9.5, 0x76e8c8, 3.6);

      const shMesh = SH.mesh(0.28, 0.25, 2.3, -8);
      if (shMesh) ctx.ekle(shMesh);

      // E) Uzak gökte zarif kayan yıldız (soğuk buz-beyaz)
      const km = new T.ShaderMaterial({
        transparent: true, depthWrite: false, fog: false, blending: T.AdditiveBlending,
        uniforms: { uA: { value: 0 } },
        vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader:
          'varying vec2 vU; uniform float uA;' +
          'void main(){ float k = pow(vU.x, 3.0) * (1.0 - smoothstep(0.0, 0.5, abs(vU.y - 0.5)));' +
          ' float bas = exp(-pow((1.0 - vU.x) * 28.0, 2.0)) * (1.0 - smoothstep(0.0, 0.5, abs(vU.y - 0.5)));' +
          ' gl_FragColor = vec4(vec3(0.84, 0.94, 1.0) * (k + bas * 1.4) * uA, 1.0); }'
      });
      const kayan = new T.Mesh(new T.PlaneGeometry(1, 1), km);
      kayan.renderOrder = -5;
      kayan.visible = false;
      ctx.ekle(kayan);

      // Birleştirilmiş statik sahne ağları
      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0.25, { roughness: 0.86, emissive: 0x161e38, emissiveIntensity: 0.35 })));
      ctx.ekle(new T.Mesh(BR.geo(), ctx.malz(true, true, 0.45, { roughness: 0.28, metalness: 0.48, emissive: 0x2c1c08, emissiveIntensity: 0.28 })));
      const lMat = isikMalz(ctx, 1.08, { roughness: 0.35 });
      ctx.ekle(new T.Mesh(L.geo(), lMat));
      const hMesh = H.mesh(0.62, 0.5, 2.2, 3);
      if (hMesh) ctx.ekle(hMesh);

      ctx.veri = {
        telList, saturn, saturnRings, icePlanet, iceRing, coralPlanet,
        satPos: [sx, sy, sz], icePos: [px1, py1, pz1], corPos: [px2, py2, pz2],
        moonsIm, kayan, km, lMat
      };
      DY_EK[44].guncelle(0, 0, ctx);
    },
    guncelle(t, dt, ctx) {
      const v = ctx && ctx.veri;
      if (!v || !v.moonsIm) return;
      const T = ctx.T, o = scratchO(T);
      // Gözlemevi teleskopları yavaşça gökyüzünü tarar
      for (let i = 0; i < v.telList.length; i++) {
        const tl = v.telList[i];
        tl.mesh.rotation.z = (tl.dir > 0 ? 0.58 : PI - 0.58) + Math.sin(t * 0.24 + tl.faz) * 0.14 * tl.dir;
        tl.mesh.rotation.y = Math.sin(t * 0.16 + tl.faz * 1.4) * 0.2;
      }
      // Satürn ve pastel gezegenler yavaşça döner / salınır
      const [sx, sy, sz] = v.satPos, [px1, py1] = v.icePos, [px2, py2, pz2] = v.corPos;
      v.saturn.position.y = sy + Math.sin(t * 0.22) * 0.35;
      v.saturnRings.position.y = v.saturn.position.y;
      v.icePlanet.position.y = py1 + Math.sin(t * 0.3 + 1.1) * 0.4;
      v.iceRing.position.y = v.icePlanet.position.y;
      v.coralPlanet.position.y = py2 + Math.sin(t * 0.26 + 2.4) * 0.38;

      // Dönen 3 uydu + nane gezegeni
      const a0 = t * 0.32, a1 = -t * 0.22 + 2.2, a2 = t * 0.38 + 0.8;
      // 0: Satürn'ün iç uydusu
      o.position.set(sx + Math.cos(a0) * 14.6, v.saturn.position.y + Math.sin(a0) * 3.8, sz + Math.sin(a0) * 6.5);
      o.rotation.set(0, t * 0.5, 0); o.scale.setScalar(0.95); o.updateMatrix();
      v.moonsIm.setMatrixAt(0, o.matrix);
      // 1: Satürn'ün dış uydusu
      o.position.set(sx + Math.cos(a1) * 17.5, v.saturn.position.y + Math.sin(a1) * 5.2, sz + Math.sin(a1) * 7.5);
      o.rotation.set(0, -t * 0.4, 0); o.scale.setScalar(0.68); o.updateMatrix();
      v.moonsIm.setMatrixAt(1, o.matrix);
      // 2: Mercan gezegenin uydusu
      o.position.set(px2 + Math.cos(a2) * 6.6, v.coralPlanet.position.y + Math.sin(a2) * 2.4, pz2 + Math.sin(a2) * 3.2);
      o.rotation.set(0, t * 0.45, 0); o.scale.setScalar(0.82); o.updateMatrix();
      v.moonsIm.setMatrixAt(2, o.matrix);
      // 3: Sol uzakta yavaşça süzülen nane gezegeni
      o.position.set(-17 + Math.sin(t * 0.14) * 1.1, 29.5 + Math.cos(t * 0.2) * 0.45, -69);
      o.rotation.set(0.15, t * 0.18, 0.2); o.scale.setScalar(2.45); o.updateMatrix();
      v.moonsIm.setMatrixAt(3, o.matrix);
      v.moonsIm.instanceMatrix.needsUpdate = true;

      if (v.lMat) v.lMat.emissiveIntensity = 1.02 + 0.12 * Math.sin(t * 2.2);

      // Kayan yıldız
      const per = 7.5, k = Math.floor(t / per), u = (t - k * per) / 1.25;
      if (u < 1) {
        const ang = -0.34 - 0.12 * Math.sin(k * 1.9);
        const x0 = -15 + ((k * 31) % 85), y0 = 40 + ((k * 11) % 12);
        v.kayan.visible = true;
        v.kayan.position.set(x0 + Math.cos(ang) * u * 24, y0 + Math.sin(ang) * u * 24, -126);
        v.kayan.rotation.set(0, 0, ang);
        v.kayan.scale.set(16, 0.55, 1);
        v.km.uniforms.uA.value = Math.sin(u * PI) * 1.15;
      } else v.kayan.visible = false;
    },
    sok(ctx) {
      if (ctx && ctx.veri) for (const k in ctx.veri) ctx.veri[k] = null;
    }
  };

  // ════════════════════════════════════════════════════════════════════
  // 45 · BÜYÜK GÖKKUŞAĞI KARNAVALI (Bölüm 50 — Büyük Final)
  // Altın-gül gün batımında dev gökkuşağı, dönen dev dönme dolap, çizgili
  // sirk çadırları ve atlıkarınca, neşeli trambolin davulu ve göğe yükselen dilek fenerleri
  // ════════════════════════════════════════════════════════════════════
  const KN_RENK = [0xff5a6e, 0x3ec8b0, 0x52a8f2, 0xff9a44, 0xffffff];
  DY_EK[45] = {
    palet: {
      ad: 'Büyük Gökkuşağı Karnavalı', gece: 0,
      sisRenk: 0xffd2b8, sisYogun: 0.0032, arka: 0xffc8a8,
      gok: [0xffcc88, 0xffa898, 0xd888c8, 0x7ca2e8, 0x3c6ac8], gunesPos: [64, 24], gunesRenk: 0xffdca0,
      ykUst: 0xfff4ea, ykAlt: 0xb8869a, ykGuc: 1.28, gnRenk: 0xffe6cc, gnGuc: 2.2, arkaRenk: 0xffa8c0, arkaGuc: 0.68,
      dag: [[0xd89cb8, 0xffd2bc], [0xc092be, 0xffc8b8], [0xa88ec2, 0xf8c0b4]],
      tepe: [0x6ec49c, 0xaee8c0, 0x7cb8a4, 0xc8ebd2],
      agac: [[0x34a078, 0x7ee0ac], [0x3ca88a, 0x90e8c0], [0x4ea874, 0xa2e69a]],
      zemin: [0xb4e4cc, 0x76bc9e, 0xdcf4e8], cimen: [0x50ad82, 0xa8e6c6, 0x7ed0a8],
      cicek: [[0xff5a6e, 0xffaec0], [0x3ec8b0, 0xa8f8ea], [0x52a8f2, 0xb8e2ff], [0xff9a44, 0xffd09c]],
      sisSerit: [0xffe8da, 0xffd4c8], siluet: [0x2e645c, 0x569c8e]
    },
    secenek: {
      agacYok: true, caliYok: false, kulubeYok: true, degirmenYok: true,
      tepeCicekYok: true, mantarSusYok: true, citYok: true, kusYok: true,
      piknikTur: 'yok', onSiluetYok: true,
      gokkusagi: 0.95, zeminDesen: 'bulut', zeminParlak: 0.06,
      bulutSay: 8, bulutRenk: [0xffd8d6, 0xfff8f6],
      bayrakRenk: [0xff5a6e, 0x3ec8b0, 0x52a8f2, 0xff9a44, 0xffffff],
      cimenSik: 0.65, yildizlar: 0.25,
      ucusanTur: 'yaprak', ucusanRenk: [0xff6a7e, 0x4ad4bc, 0x62b8ff, 0xffa858, 0xffffff],
      salincak: {
        govde: [0xe85a6a, 0xffb8a8],
        yaprak: [[0x3ec8b0, 0xa8f8ea], [0x52a8f2, 0xc2e6ff]],
        sarmasik: [0xf0a830, 0xffe488],
        cicek: [[0xff5a6e, 0xffb0c0], [0x3ec8b0, 0xa8f8ea], [0x52a8f2, 0xb8e2ff], [0xff9a44, 0xffd4a0]],
        tacYok: true,
        kusYok: true
      }
    },
    yardimci: {
      mantar: { sapka: [0xff5a6e, 0xffa8b8], govde: [0xfff4ec, 0xffffff], benek: 0x3ec8b0 },
      bulut: { alt: 0x86c8f2, ust: 0xffffff, yanak: 0xff8aa8, emissive: 0xffe8f0 },
      nilufer: { yaprak: [0x3ec8b0, 0x9ef6e6], cicek: [0xff5a6e, 0xffb8c8], halka: 0xffffff },
      ruzgar: { renk: [0x4ac8f0, 0xffffff], emissive: 0x2a88c8, ok: 0xffffff },
      halka: { renk: [0xf0a828, 0xffe478], emissive: 0xc87a10, cicek: [[0xff5a6e, 0xffb0c0], [0x3ec8b0, 0xa8f8ea], [0x52a8f2, 0xb8e4ff], [0xff9a44, 0xffd4a0]] },
      baloncuk: { renk: 0x96dcff, kenar: 0xffffff, cizgi: 0x3eb4f0, opaklik: 1.35 },
      esinti: { tur: 'isik', renk: 0xfff4e0, taneRenk: [0xff7a90, 0x52e0c8, 0x6ac0ff, 0xffffff] }
    },
    yardimciKur: {
      // Salıncak: altın ışıklı panayır kemeri ve rengârenk karnaval üçgen bayrakları
      salincak(ctx, o) {
        const { T, G } = ctx, DL = ogDilim(T, 8), z = o.z, sx = o.sapanX;
        // Sütun tepelerinde altın alem ve çizgili karnaval yakalıkları
        for (const q of [-1, 1]) {
          const tx = q * sx;
          o.S.ekle(G.sil, tx, 4.86, z, 0.28, 0.24, 0.28, 0x2ab8a4, 0x76ece0);
          o.S.ekle(G.koni, tx, 5.45, z, 0.26, 0.72, 0.26, 0xc88a1c, 0xffe078);
          o.FL.ekle(G.kureK, tx, 5.88, z, 0.14, 0.14, 0.14, 0xffb838, 0xfff6c0);
          // Yan direklerden sarkan dikey bayraklar
          for (let j = 0; j < 4; j++) {
            const c = KN_RENK[(j + (q > 0 ? 2 : 0)) % KN_RENK.length];
            o.A.ekle(G.koni4, q * (sx + 0.96), 4.1 - j * 0.44, z + 0.1, 0.14, 0.34, 0.04, c, ctx.karH(c, 0xffffff, 0.3), PI, 0, q * 0.15);
          }
          // Büyük yan fenerlerin yerine parlak altın karnaval küreleri
          o.FL.ekle(G.kureK, q * (sx + 0.96), 4.22, z + 0.16, 0.2, 0.22, 0.2, 0xffb838, 0xfff8c8);
        }
        // Kemer üstünde çizgili taç şemsiyecik + altın yıldız ışığı
        for (let k = 0; k < 8; k++) {
          const a = k / 8 * PI * 2, c = k % 2 ? 0xff5a6e : 0xfff6ec;
          o.A.ekle(DL, 0, 6.26, z + 0.02, 0.85, 0.42, 0.85, c, ctx.karH(c, 0xffffff, 0.25), 0, a, 0);
        }
        o.FL.ekle(G.kureK, 0, 6.76, z + 0.02, 0.16, 0.16, 0.16, 0xffc040, 0xfff8d0);
        // Kemer boyunca üçgen karnaval bayrakları + sıcak parlayan altın ampuller
        for (let i = 1; i < 14; i++) {
          const u = i / 14, x = -sx + 2 * sx * u, y = 4.74 + 1.34 * (1 - Math.pow(2 * u - 1, 2));
          const c = KN_RENK[i % KN_RENK.length];
          o.A.ekle(G.koni4, x, y - 0.16, z + 0.16, 0.15, 0.34, 0.04, c, ctx.karH(c, 0xffffff, 0.3), PI, 0, 0);
          if (i % 2 === 1) {
            o.S.ekle(G.sil, x, y + 0.1, z + 0.18, 0.04, 0.06, 0.04, 0xb88420, 0xffe078);
            o.FL.ekle(G.kureK, x, y + 0.16, z + 0.18, 0.085, 0.095, 0.085, 0xffb838, 0xfff8c8);
          }
        }
      },
      // Mantar yerine neşeli yıldız-çizgili karnaval zıplama trambolini / davulu (yukarı oklar + gülen yüz)
      mantar(M, i, ctx) {
        const { T, G } = ctx, S = ctx.yapi(), DL = ogDilim(T, 12), OK = ogOk(T), YD = ogYildiz(T);
        // Taban kaidesi ve altın çember
        S.ekle(G.sil, 0, 0.12, 0, 1.56, 0.24, 1.56, 0xd08e20, 0xffe478);
        S.ekle(G.sil, 0, 1.06, 0, 1.48, 1.78, 1.48, 0xffe6d4, 0xffffff);
        // Dikey mercan & turkuaz & krem karnaval çizgileri
        for (let k = 0; k < 12; k++) {
          const a = k / 12 * PI * 2;
          const c = k % 3 === 0 ? [0xff4a62, 0xff94a4] : k % 3 === 1 ? [0x24b4a0, 0x70ecdc] : [0xffe8dc, 0xffffff];
          S.ekle(G.kutu, Math.sin(a) * 1.46, 1.06, Math.cos(a) * 1.46, 0.42, 1.72, 0.12, c[0], c[1], 0, a, 0);
          // Yan ve arka çapraz davul ipleri
          if (Math.cos(a) < 0.52) {
            S.ekle(G.sil, Math.sin(a) * 1.52, 1.06, Math.cos(a) * 1.52, 0.036, 1.62, 0.036, 0xe8b238, 0xfff0a0, 0, a, k % 2 ? 0.38 : -0.38);
          }
        }
        // Üst altın çerçeve halkası ve mercan-turkuaz fırfırlı çadır saçakları
        S.ekle(G.torusHalka, 0, 1.94, 0, 4.72, 4.72, 1.25, 0xc8881c, 0xffe478, PI / 2, 0, 0);
        for (let k = 0; k < 16; k++) {
          const a = k / 16 * PI * 2, c = k % 2 === 0 ? [0xff4a62, 0xff94a4] : [0x24b4a0, 0x74eee0];
          S.ekle(G.kureO, Math.sin(a) * 1.6, 1.86, Math.cos(a) * 1.6, 0.34, 0.22, 0.24, c[0], c[1], 0, a, 0);
          S.ekle(G.kureK, Math.sin(a + PI / 16) * 1.62, 1.92, Math.cos(a + PI / 16) * 1.62, 0.08, 0.08, 0.08, 0xffffff, 0xffffff);
        }
        // Yıldız-çizgili mercan & turkuaz çadır tepesi trambolin minderi + yıldız süsleri
        for (let k = 0; k < 12; k++) {
          const a = k / 12 * PI * 2;
          const c = k % 2 === 0 ? [0xff4a62, 0xffa0b0] : [0x22b8a4, 0x80f4e4];
          S.ekle(DL, 0, 1.98, 0, 1.72, 0.58, 1.72, c[0], c[1], 0, a, 0);
        }
        S.ekle(G.kureO, 0, 2.48, 0, 0.85, 0.15, 0.85, 0x26bea8, 0xb8fff4);
        S.ekle(YD, 0, 2.58, 0, 0.62, 0.62, 0.35, 0xfff4e8, 0xffffff, PI / 2, 0, 0);
        // Ön kemerde mercan & turkuaz yıldız amblemleri ve net yukarı zıplama okları (yüzden ayrı, temiz yerleşim)
        for (const q of [-1, 1]) {
          // Yanlarda yıldız amblemleri + alt-yan yukarı ok rozetleri
          S.ekle(YD, q * 1.38, 1.48, 0.72, 0.26, 0.26, 0.34, 0x22b8a4, 0x98fff0, 0, q * 0.98, 0);
          S.ekle(G.sil, q * 1.32, 0.88, 0.78, 0.36, 0.12, 0.36, 0x168a7a, 0x2ec8b4, PI / 2, q * 0.92, 0);
          S.ekle(OK, q * 1.38, 0.9, 0.84, 0.44, 0.48, 0.44, 0xffffff, 0xffffff, 0, q * 0.92, 0);
          // Minder kenarlarının hemen yanında ekstra belirgin mercan-çerçeveli yukarı oklar
          S.ekle(OK, q * 1.76, 2.52, 0.52, 0.54, 0.62, 0.42, 0xff4a62, 0xff8094);
          S.ekle(OK, q * 1.76, 2.52, 0.58, 0.36, 0.44, 0.46, 0xffffff, 0xffffff);
        }
        S.ekle(YD, 0, 1.76, 1.62, 0.28, 0.28, 0.34, 0xff4a62, 0xffa8b8);
        S.ekle(OK, 0, 1.78, 1.68, 0.26, 0.3, 0.36, 0xffffff, 0xffffff);
        // Sevimli gülen yüz (yanaklar + gülümseme; gözler ayrı kırpılır)
        for (const q of [-1, 1]) S.ekle(G.kureK, q * 0.58, 0.94, 1.46, 0.19, 0.11, 0.06, 0xff6a8a, 0xff9cb4);
        S.ekle(G.torusSap, 0, 0.88, 1.52, 0.78, 0.78, 0.5, 0x421828, 0x582438, 0, 0, PI);
        const mesh = new T.Mesh(S.geo(), ctx.malz(true, true, 0.4, { roughness: 0.38, emissive: 0x3c1c28, emissiveIntensity: 0.22 }));
        const E = ctx.yapi();
        for (const q of [-1, 1]) {
          E.ekle(G.kureK, q * 0.35, 0, 0, 0.13, 0.18, 0.06, 0x24101e, 0x24101e);
          E.ekle(G.kureK, q * 0.35 + 0.04, 0.06, 0.05, 0.045, 0.055, 0.02, 0xffffff, 0xffffff);
        }
        const goz = new T.Mesh(E.geo(), ctx.malz(false, true, 0, { emissive: 0xffffff, emissiveIntensity: 0.4 }));
        goz.position.set(0, 1.24, 1.5);
        mesh.add(goz);
        return { mesh, goz };
      }
    },
    kur(ctx) {
      const { T, G, hx, yerY, R, ara } = ctx;
      const S = ctx.yapi(), BR = ctx.yapi(), L = ctx.yapi(), H = haloYap(ctx);
      const DL14 = ogDilim(T, 14), DL8 = ogDilim(T, 8), KM = ogKemer(T), KMK = ogKemerKalin(T);

      // 1) Dev ışıklı dönen Dönme Dolap (hx * 0.52, z = -24)
      const wx = hx * 0.52, wz = -24, wy = yerY(wx, wz) + 15.6, WR = 11.0;
      {
        const by = yerY(wx, wz) - 0.15;
        // Ahşap/taş karnaval platformu ve bilet kulübesi
        S.ekle(G.kutu, wx, by + 0.25, wz + 0.4, 15.8, 0.5, 4.8, 0xd8a882, 0xfff0dc);
        S.ekle(G.kutu, wx, by + 0.55, wz + 2.75, 16.0, 0.22, 0.24, 0xff5a6e, 0xff98a8);
        // Ön ve arka ikiz A-ayak kuleleri
        for (const qz of [-1.65, 1.65]) {
          for (const qx of [-1, 1]) {
            const x0 = wx + qx * 6.8, y0 = by + 0.4, dx = -qx * 6.8, dy = wy - y0;
            const len = Math.hypot(dx, dy), ang = Math.atan2(dx, dy);
            S.ekle(G.kutu, (x0 + wx) * 0.5, (y0 + wy) * 0.5, wz + qz, 0.48, len, 0.48, 0xfff0e0, 0xffffff, 0, 0, -ang);
            S.ekle(G.kutu, x0, y0 + 0.2, wz + qz, 1.2, 0.55, 0.95, 0xff5a6e, 0xff98a8);
          }
          S.ekle(G.kutu, wx, by + (wy - by) * 0.42, wz + qz, 8.2, 0.34, 0.34, 0x3ec8b0, 0x8ef4e4);
        }
        // Merkez göbek yıldız rozeti + sıcak merkez ampulleri
        BR.ekle(G.sil, wx, wy, wz, 1.15, 3.9, 1.15, 0xc8881c, 0xffe478, PI / 2, 0, 0);
        L.ekle(G.kureK, wx, wy, wz + 2.02, 0.56, 0.56, 0.25, 0xff9e38, 0xfff4c0);
        H.q(wx, wy, wz + 2.2, 3.2, 3.2, 0xffb850, 0.4);
      }

      // Dönen tekerlek + üzerindeki ışıklı ampuller (ince çelik çemberler: gondollar net görünür)
      const TK = ctx.yapi(), TL = ctx.yapi();
      const disCember = new T.TorusGeometry(WR, 0.24, 8, 44);
      const icCember = new T.TorusGeometry(WR * 0.65, 0.16, 6, 36);
      const araCember = new T.TorusGeometry(WR * 0.94, 0.12, 6, 44);
      for (const qz of [-1.25, 1.25]) {
        TK.ekle(disCember, 0, 0, qz, 1, 1, 1, 0xff5a6e, 0xffb4c0);
        TK.ekle(araCember, 0, 0, qz, 1, 1, 1, 0xfff2e4, 0xffffff);
        TK.ekle(icCember, 0, 0, qz, 1, 1, 1, 0x3ec8b0, 0x98f8e8);
      }
      disCember.dispose(); icCember.dispose(); araCember.dispose();
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * PI * 2, ca = Math.cos(a), sa = Math.sin(a);
        for (const qz of [-1.22, 1.22]) {
          TK.ekle(G.sil, ca * WR * 0.5, sa * WR * 0.5, qz, 0.08, WR, 0.08, 0xfff0e4, 0xffffff, 0, 0, a - PI / 2);
        }
        // Gondol asma mili
        TK.ekle(G.sil, ca * WR, sa * WR, 0, 0.085, 2.6, 0.085, 0xd49628, 0xffe488, PI / 2, 0, 0);
      }
      for (let i = 0; i < 24; i++) {
        const a = i / 24 * PI * 2, c = KN_RENK[i % KN_RENK.length];
        TL.ekle(G.kureK, Math.cos(a) * WR, Math.sin(a) * WR, 1.5, 0.24, 0.24, 0.16, c, ctx.karH(c, 0xffffff, 0.35));
        if (i % 2 === 0) TL.ekle(G.kureK, Math.cos(a) * WR * 0.65, Math.sin(a) * WR * 0.65, 1.42, 0.18, 0.18, 0.12, 0xffb848, 0xfff8d0);
      }
      const teker = new T.Mesh(TK.geo(), ctx.malz(true, true, 0.35, { roughness: 0.42, emissive: 0x3a2028, emissiveIntensity: 0.2 }));
      teker.position.set(wx, wy, wz);
      const tekerIsik = new T.Mesh(TL.geo(), isikMalz(ctx, 1.35, { roughness: 0.3 }));
      teker.add(tekerIsik);
      ctx.ekle(teker);

      // 12 Renkli sallanan gondol (tek InstancedMesh — her kare dik kalır)
      const GD = ctx.yapi();
      GD.ekle(G.sil, 0, -0.58, 0, 0.055, 1.18, 0.055, 0xd8d8d8, 0xffffff);
      for (let k = 0; k < 8; k++) {
        const a = k / 8 * PI * 2, tone = k % 2 ? 0xffffff : 0xd0d0d0;
        GD.ekle(DL8, 0, -1.08, 0, 0.98, 0.56, 0.88, tone, 0xffffff, 0, a, 0);
      }
      GD.ekle(G.sil, 0, -1.58, 0, 0.048, 0.88, 0.048, 0xc8c8c8, 0xeeeeee);
      GD.ekle(G.kubbe, 0, -1.94, 0, 0.86, 0.8, 0.76, 0xb8b8b8, 0xffffff, PI, 0, 0);
      GD.ekle(G.halkaInce, 0, -1.94, 0, 0.86, 0.76, 0.9, 0xeeeeee, 0xffffff, PI / 2, 0, 0);
      const gondolaIm = new T.InstancedMesh(
        GD.geo(),
        ctx.malz(true, true, 0.35, { roughness: 0.42, emissive: 0x34202c, emissiveIntensity: 0.3 }),
        12
      );
      const gRenk = [0xff5a6e, 0x2cc8b0, 0x4ca8f6, 0xff9a44, 0xff78ac, 0x56d89e], tc = scratchC(T);
      for (let i = 0; i < 12; i++) { tc.setHex(gRenk[i % gRenk.length]); gondolaIm.setColorAt(i, tc); }
      gondolaIm.frustumCulled = false;
      ctx.ekle(gondolaIm);

      // 2) Çizgili Sirk Çadırları & Dönen Atlıkarınca Köşkü (z: -10 .. -20)
      const cadir = (x, z, k, rA, rB, rSacak) => {
        const y0 = yerY(x, z) - 0.1, r = 3.1 * k, h = 2.5 * k;
        // Çizgili silindir gövde
        S.ekle(G.sil, x, y0 + h * 0.5, z, r, h, r, rB, 0xffffff);
        for (let i = 0; i < 12; i++) {
          const a = i / 12 * PI * 2;
          if (Math.abs(Math.sin(a)) < 0.25 && Math.cos(a) > 0) continue; // ön kapı açık
          S.ekle(G.kutu, x + Math.sin(a) * r * 0.98, y0 + h * 0.5, z + Math.cos(a) * r * 0.98, 0.46 * k, h * 0.98, 0.14 * k, i % 2 ? rA : rB, 0xffffff, 0, a, 0);
        }
        // Çizgili konik çatı (14 dilim)
        for (let i = 0; i < 14; i++) {
          const a = i / 14 * PI * 2, c = i % 2 ? rA : rB;
          S.ekle(DL14, x, y0 + h, z, r * 1.18, 3.3 * k, r * 1.18, c, ctx.karH(c, 0xffffff, 0.25), 0, a, 0);
        }
        // Fırfırlı çadır saçakları
        for (let i = 0; i < 14; i++) {
          const a = i / 14 * PI * 2, c = i % 2 ? rSacak : rB;
          S.ekle(G.kureO, x + Math.sin(a) * r * 1.08, y0 + h - 0.08 * k, z + Math.cos(a) * r * 1.08, 0.44 * k, 0.3 * k, 0.26 * k, c, 0xffffff, 0, a, 0);
        }
        // Altın tepe alemi + bayrak
        BR.ekle(G.koni, x, y0 + h + 3.45 * k, z, 0.16 * k, 0.65 * k, 0.16 * k, 0xc88a1c, 0xffe478);
        BR.ekle(G.kureK, x, y0 + h + 3.85 * k, z, 0.22 * k, 0.22 * k, 0.22 * k, 0xd49624, 0xfff0a0);
        S.ekle(G.koni4, x + 0.42 * k, y0 + h + 3.92 * k, z, 0.26 * k, 0.72 * k, 0.04 * k, rA, 0xffffff, 0, 0, -PI / 2);
        // Sıcak ışıklı kemer kapı ve yan perdeler
        L.ekle(G.kutu, x, y0 + 0.9 * k, z + r * 0.98, 1.1 * k, 1.75 * k, 0.08 * k, 0xff9e44, 0xffe6a8);
        L.ekle(G.kureK, x, y0 + 1.75 * k, z + r * 0.98, 0.55 * k, 0.5 * k, 0.08 * k, 0xffae54, 0xffeec0);
        for (const q of [-1, 1]) {
          S.ekle(G.kule, x + q * 0.7 * k, y0 + 0.95 * k, z + r * 1.02, 0.26 * k, 1.85 * k, 0.22 * k, rA, ctx.karH(rA, 0xffffff, 0.25), 0, 0, -q * 0.18);
        }
        H.q(x, y0 + 1.15 * k, z + r * 1.12, 2.2 * k, 2.0 * k, 0xffa858, x + z);
      };

      cadir(-13, -15.5, 1.24, 0xff5a6e, 0xfff6ec, 0x3ec8b0);
      cadir(hx * 0.78, -16, 1.24, 0x52a8f2, 0xfff6ec, 0xff5a6e);
      cadir(hx + 18, -14.5, 1.16, 0xff9a44, 0xfff6ec, 0x3ec8b0);
      // Uzak arka plan küçük panayır çadırları
      cadir(-26, -28, 0.9, 0x3ec8b0, 0xfff6ec, 0xff9a44);
      cadir(hx * 0.37, -30, 0.85, 0xff5a6e, 0xfff6ec, 0x52a8f2);
      cadir(hx + 30, -28, 0.9, 0x52a8f2, 0xfff6ec, 0xff9a44);

      // Dönen Atlıkarınca Köşkü (hx * 0.23, z = -13.5)
      const ax = hx * 0.23, az = -13.5, ay = yerY(ax, az) - 0.1, ak = 1.16;
      {
        const r = 3.1 * ak, h = 2.6 * ak;
        S.ekle(G.sil, ax, ay + 0.22 * ak, az, r * 1.05, 0.44 * ak, r * 1.05, 0xff5a6e, 0xffb4c0);
        S.ekle(G.sil, ax, ay + 0.48 * ak, az, r * 0.98, 0.14 * ak, r * 0.98, 0xfff4e8, 0xffffff);
        BR.ekle(G.sil, ax, ay + h * 0.56, az, 0.34 * ak, h, 0.34 * ak, 0xc88a1c, 0xffe478);
        for (let i = 0; i < 6; i++) {
          const a = i / 6 * PI * 2;
          BR.ekle(G.sil, ax + Math.sin(a) * r * 0.86, ay + 0.48 * ak + h * 0.48, az + Math.cos(a) * r * 0.86,
            0.075 * ak, h * 0.96, 0.075 * ak, 0xb88420, 0xffe078);
        }
        for (let i = 0; i < 14; i++) {
          const a = i / 14 * PI * 2, c = i % 2 ? 0x3ec8b0 : 0xfff6ec;
          S.ekle(DL14, ax, ay + 0.48 * ak + h, az, r * 1.16, 2.8 * ak, r * 1.16, c, ctx.karH(c, 0xffffff, 0.25), 0, a, 0);
          const sc = i % 2 ? 0xff5a6e : 0x52a8f2;
          S.ekle(G.kureO, ax + Math.sin(a) * r * 1.05, ay + 0.42 * ak + h, az + Math.cos(a) * r * 1.05, 0.42 * ak, 0.28 * ak, 0.24 * ak, sc, 0xffffff, 0, a, 0);
          if (i % 2 === 0) L.ekle(G.kureK, ax + Math.sin(a) * r * 1.1, ay + 0.54 * ak + h, az + Math.cos(a) * r * 1.1, 0.12 * ak, 0.12 * ak, 0.12 * ak, 0xffb840, 0xfff8c8);
        }
        BR.ekle(G.koni, ax, ay + h + 3.55 * ak, az, 0.16 * ak, 0.65 * ak, 0.16 * ak, 0xc88a1c, 0xffe478);
        S.ekle(G.koni4, ax + 0.4 * ak, ay + h + 3.95 * ak, az, 0.24 * ak, 0.66 * ak, 0.04 * ak, 0x3ec8b0, 0xffffff, 0, 0, -PI / 2);
      }
      // Atlıkarınca döner platformu ve sevimli pastel atları
      const AK = ctx.yapi();
      const atRenk = [[0xff8ca8, 0xffe8f0], [0x68d4e8, 0xe8fcff], [0xffb474, 0xfff2dc], [0x78e0b8, 0xe8fff6], [0x88b8ff, 0xe8f4ff], [0xfff2e8, 0xffffff]];
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * PI * 2, px = Math.sin(a) * 2.15 * ak, pz = Math.cos(a) * 2.15 * ak;
        const py = (i % 2 ? 1.38 : 1.06) * ak, c = atRenk[i];
        AK.ekle(G.sil, px, 1.3 * ak, pz, 0.045 * ak, 2.4 * ak, 0.045 * ak, 0xd49624, 0xffe888);
        AK.ekle(G.kureO, px, py, pz, 0.22 * ak, 0.2 * ak, 0.46 * ak, c[0], c[1], 0, a + PI / 2, 0);
        AK.ekle(G.kureO, px + Math.cos(a) * 0.28 * ak, py + 0.28 * ak, pz - Math.sin(a) * 0.28 * ak, 0.13 * ak, 0.22 * ak, 0.16 * ak, c[0], c[1], 0, a + PI / 2, -0.3);
        AK.ekle(G.sil, px, py - 0.04 * ak, pz, 0.25 * ak, 0.14 * ak, 0.25 * ak, 0xff5a6e, 0xffb0c0);
      }
      const atlK = new T.Mesh(AK.geo(), ctx.malz(true, true, 0.35, { roughness: 0.4, emissive: 0x382028, emissiveIntensity: 0.2 }));
      atlK.position.set(ax, ay + 0.48 * ak, az);
      ctx.ekle(atlK);

      // 3) Şenlik kemerleri ve bayrak çelenkleri (z: -6 .. -10)
      const bayrakIp = (x0, y0, x1, y1, z0, z1, sark) => {
        const n = 14;
        for (let i = 0; i < n; i++) {
          const u0 = i / n, u1 = (i + 1) / n;
          const xa = x0 + (x1 - x0) * u0, xb = x0 + (x1 - x0) * u1;
          const za = z0 + (z1 - z0) * u0, zb = z0 + (z1 - z0) * u1;
          const ya = y0 + (y1 - y0) * u0 - Math.sin(u0 * PI) * sark;
          const yb = y0 + (y1 - y0) * u1 - Math.sin(u1 * PI) * sark;
          S.ekle(G.sil, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2, 0.025, Math.hypot(xb - xa, yb - ya), 0.025, 0xfff2e4, 0xffffff, 0, 0, -Math.atan2(xb - xa, yb - ya));
          if (i > 0 && i < n) {
            const c = KN_RENK[i % KN_RENK.length];
            S.ekle(G.koni4, xa, ya - 0.24, za, 0.19, 0.44, 0.04, c, ctx.karH(c, 0xffffff, 0.3), PI, 0, 0);
            if (i % 3 === 1) {
              L.ekle(G.kureK, xa, ya - 0.04, za + 0.05, 0.09, 0.09, 0.09, 0xffb844, 0xfff8c8);
              H.q(xa, ya - 0.04, za + 0.16, 0.95, 0.95, 0xffbc58, xa * 0.4);
            }
          }
        }
      };
      const direkPos = [[-16, -8.5], [-6, -7.8], [hx * 0.16, -8.5], [hx * 0.40, -9.2], [hx * 0.66, -9.0], [hx + 8, -8.2], [hx + 20, -8.8]];
      for (let i = 0; i < direkPos.length; i++) {
        const [dx, dz] = direkPos[i], dy0 = yerY(dx, dz) - 0.05, dh = 4.4;
        S.ekle(G.sil, dx, dy0 + dh * 0.5, dz, 0.11, dh, 0.11, 0xff5a6e, 0xfff6ec);
        BR.ekle(G.kureK, dx, dy0 + dh + 0.12, dz, 0.18, 0.18, 0.18, 0xc88a1c, 0xffe478);
        if (i > 0) {
          const [px, pz] = direkPos[i - 1], py0 = yerY(px, pz) - 0.05;
          bayrakIp(px, py0 + 4.2, dx, dy0 + 4.2, pz, dz, 0.95);
        }
      }
      // Başlangıç ve final şenlik takları (kemerleri)
      const senlikTaki = (x, z, w, h, cA, cB) => {
        const y0 = yerY(x, z) - 0.05, hw = w * 0.5;
        for (const q of [-1, 1]) {
          S.ekle(G.sil, x + q * hw, y0 + h * 0.5, z, 0.22, h, 0.22, cA, 0xfff8f0);
          S.ekle(G.sil, x + q * hw, y0 + 0.25, z, 0.36, 0.5, 0.36, cB, 0xffffff);
          BR.ekle(G.kureK, x + q * hw, y0 + h + 0.28, z, 0.22, 0.22, 0.22, 0xc88a1c, 0xffe478);
        }
        S.ekle(KMK, x, y0 + h, z, hw, hw * 0.72, 1.35, cA, 0xffffff);
        S.ekle(KM, x, y0 + h, z + 0.08, hw * 0.86, hw * 0.62, 1.0, cB, 0xffffff);
        for (let i = 0; i <= 10; i++) {
          const a = i / 10 * PI, lx = x - Math.cos(a) * hw, ly = y0 + h + Math.sin(a) * hw * 0.72;
          L.ekle(G.kureK, lx, ly, z + 0.2, 0.11, 0.11, 0.11, i % 2 ? 0xffb844 : cB, 0xffffff);
          if (i % 2 === 0) H.q(lx, ly, z + 0.3, 1.15, 1.15, 0xffba5c, i + x);
        }
        BR.ekle(G.sil, x, y0 + h + hw * 0.72 + 0.32, z, 0.06, 0.55, 0.06, 0xc88a1c, 0xffe478);
        L.ekle(G.kureK, x, y0 + h + hw * 0.72 + 0.65, z, 0.2, 0.2, 0.2, 0xffae44, 0xfff6d0);
      };
      senlikTaki(-4.8, -7.8, 5.2, 3.6, 0xff5a6e, 0x3ec8b0);
      senlikTaki(hx, -6.2, 7.2, 4.1, 0x3ec8b0, 0xff5a6e);

      // 4) Bilbo'nun 50. Bölüm Büyük Final Kutlama Alanı (hx, z = -2.2)
      {
        const bz = -1.7;
        // Mercan & turkuaz sahne halısı (z=0 koşu yolunu bozmadan alçak)
        S.ekle(G.sil, hx, 0.035, bz + 0.5, 3.3, 0.06, 1.8, 0xff5a6e, 0xff94a4);
        S.ekle(G.sil, hx, 0.045, bz + 0.5, 2.75, 0.06, 1.45, 0x3ec8b0, 0x9ef8ea);
        BR.ekle(G.halkaInce, hx, 0.065, bz + 0.5, 3.25, 1.76, 0.5, 0xc88a1c, 0xffe478, PI / 2, 0, 0);
        // 3 katlı kutlama pastası (solda)
        const px = hx - 2.35, pz = -2.2;
        S.ekle(G.sil, px, 0.28, pz, 0.44, 0.56, 0.44, 0xfff0e0, 0xffffff);
        S.ekle(G.sil, px, 0.62, pz, 0.58, 0.1, 0.58, 0xc88a1c, 0xffe478);
        S.ekle(G.sil, px, 0.84, pz, 0.46, 0.36, 0.46, 0xff8aa8, 0xffd8e4);
        S.ekle(G.sil, px, 1.18, pz, 0.34, 0.32, 0.34, 0x62d8c8, 0xc8fff4);
        S.ekle(G.sil, px, 1.48, pz, 0.22, 0.28, 0.22, 0xfff4e8, 0xffffff);
        L.ekle(G.kureK, px, 1.74, pz, 0.08, 0.11, 0.08, 0xffaa40, 0xfff8d0);
        // İki yanda bağlı renkli parti balonları + hediye kutuları
        for (const q of [-1, 1]) {
          const bx = hx + q * 2.95, bzz = -2.55;
          S.ekle(G.sil, bx, 0.14, bzz, 0.28, 0.28, 0.28, q < 0 ? 0x52a8f2 : 0xff9a44, 0xffffff);
          for (let j = 0; j < 3; j++) {
            const c = KN_RENK[(j + (q > 0 ? 1 : 0)) % KN_RENK.length];
            const ox = (j - 1) * 0.28, oy = 1.65 + (j === 1 ? 0.32 : 0), oz = (j % 2) * 0.16;
            S.ekle(G.sil, bx + ox * 0.5, oy * 0.5 + 0.12, bzz + oz * 0.5, 0.015, oy, 0.015, 0xf2eae2, 0xffffff, 0, 0, -ox * 0.22);
            S.ekle(G.kureO, bx + ox, oy, bzz + oz, 0.24, 0.3, 0.24, c, ctx.karH(c, 0xffffff, 0.4));
          }
        }
      }

      // 5) Ön kenarda alçak şenlik çiçek tarhları (z: 16.5 .. 20.5)
      for (let x = -34; x < hx + 40; x += ara(3.2, 5.2)) {
        const z = ara(16.6, 20.2), s = ara(0.45, 0.85), c = KN_RENK[Math.floor(R() * 4)];
        S.ekle(G.kureU, x, -0.25, z, s * 1.4, s * 0.5, s * 0.9, 0x3ca078, 0x86e0b0);
        S.ekle(G.kureK, x + ara(-0.3, 0.3), s * 0.18, z + 0.2, s * 0.22, s * 0.2, s * 0.18, c, 0xffffff);
      }

      // 6) Gün batımında göğe yavaşça yükselen sıcak parlayan kâğıt dilek fenerleri (16 adet)
      const FN = ctx.yapi();
      FN.ekle(G.kule, 0, 0.28, 0, 0.36, 0.66, 0.36, 0xd8b8a8, 0xffffff, PI, 0, 0);
      FN.ekle(G.sil, 0, 0.6, 0, 0.44, 0.05, 0.44, 0x883828, 0xb85848);
      FN.ekle(G.sil, 0, -0.04, 0, 0.25, 0.06, 0.25, 0x6a2820, 0x983c30);
      FN.ekle(G.kureK, 0, 0.08, 0, 0.12, 0.15, 0.12, 0xffffff, 0xffffff);
      const fenerIm = new T.InstancedMesh(FN.geo(), isikMalz(ctx, 1.58, { roughness: 0.35, fog: false }), 16);
      const fnRenk = [0xff8c48, 0xff7078, 0xffad64, 0xff6e8e, 0xffbe7c];
      for (let i = 0; i < 16; i++) { tc.setHex(fnRenk[i % fnRenk.length]); fenerIm.setColorAt(i, tc); }
      fenerIm.frustumCulled = false;
      ctx.ekle(fenerIm);

      // Birleştirilmiş statik sahne ağları
      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0.25, { roughness: 0.72 })));
      ctx.ekle(new T.Mesh(BR.geo(), ctx.malz(true, true, 0.45, { roughness: 0.28, metalness: 0.48, emissive: 0x3a2406, emissiveIntensity: 0.28 })));
      const lMat = isikMalz(ctx, 1.1, { roughness: 0.35 });
      ctx.ekle(new T.Mesh(L.geo(), lMat));
      const hMesh = H.mesh(0.56, 0.45, 2.2, 3);
      if (hMesh) ctx.ekle(hMesh);

      ctx.veri = { teker, gondolaIm, atlK, fenerIm, lMat, wx, wy, wz, WR, hx };
      DY_EK[45].guncelle(0, 0, ctx);
    },
    guncelle(t, dt, ctx) {
      const v = ctx && ctx.veri;
      if (!v || !v.teker) return;
      const T = ctx.T, o = scratchO(T);
      // Dev dönme dolap ve 12 dik sallanan gondol
      const aci = t * 0.22;
      v.teker.rotation.z = aci;
      for (let i = 0; i < 12; i++) {
        const a = aci + i / 12 * PI * 2;
        o.position.set(v.wx + Math.cos(a) * v.WR, v.wy + Math.sin(a) * v.WR, v.wz);
        o.rotation.set(0, 0, Math.sin(t * 1.6 + i * 0.9) * 0.045);
        o.scale.setScalar(1);
        o.updateMatrix();
        v.gondolaIm.setMatrixAt(i, o.matrix);
      }
      v.gondolaIm.instanceMatrix.needsUpdate = true;

      // Atlıkarınca döner
      if (v.atlK) v.atlK.rotation.y = t * 0.55;

      // Sıcak kâğıt dilek fenerleri gün batımında göğe yükselir
      for (let i = 0; i < 16; i++) {
        const u = (t * 0.036 + i / 16) % 1;
        const x = -14 + i * ((v.hx + 36) / 15) + Math.sin(t * 0.52 + i * 1.6) * 1.4;
        const y = 3.8 + u * 27.0 + Math.sin(t * 1.05 + i * 2.1) * 0.3;
        const z = -12 - (i % 5) * 6.5;
        const sc = (1.32 + (i % 3) * 0.26) * Math.pow(Math.sin(u * PI), 0.35) * (1 + 0.04 * Math.sin(t * 3.2 + i));
        o.position.set(x, y, z);
        o.rotation.set(Math.sin(t * 0.65 + i) * 0.06, t * 0.14 + i, Math.cos(t * 0.55 + i * 1.2) * 0.07);
        o.scale.setScalar(sc);
        o.updateMatrix();
        v.fenerIm.setMatrixAt(i, o.matrix);
      }
      v.fenerIm.instanceMatrix.needsUpdate = true;

      if (v.lMat) v.lMat.emissiveIntensity = 1.04 + 0.14 * Math.sin(t * 2.8);
    },
    sok(ctx) {
      if (ctx && ctx.veri) for (const k in ctx.veri) ctx.veri[k] = null;
    }
  };
})();
