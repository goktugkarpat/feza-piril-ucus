/* ortam_c.js - Pırıl'ın Uçuş Okulu: yeni ortamlar (u2-ortam-c)
   23 · Sakura Gecesi (bölüm 28) · 29 · Sisli Bambu Ormanı (bölüm 34) · 33 · Işıldayan Orman (bölüm 38) */
(function () {
  'use strict';
  window.DY_EK = window.DY_EK || {};
  const PI = Math.PI;

  // ── ortak yardımcılar ──
  // Kendi köşe renginde ışıyan malzeme (fener, çiçek, mantar)
  function isikMalz(ctx, guc, pbr) {
    const m = ctx.malz(false, true, 0, Object.assign({ emissive: 0xffffff, emissiveIntensity: guc }, pbr || {}));
    const ob = m.onBeforeCompile;
    m.onBeforeCompile = (sh, r) => {
      ob(sh, r);
      sh.fragmentShader = sh.fragmentShader.replace('vec3 totalEmissiveRadiance = emissive;', 'vec3 totalEmissiveRadiance = emissive * vColor.rgb;');
    };
    return m;
  }

  // Yumuşak ışık hâleleri: tek çizim (toplamalı karışım), her hâlenin kendi rengi ve titreme evresi
  function haloYap(ctx) {
    const T = ctx.T, pos = [], uv = [], col = [], faz = [], c = new T.Color();
    const it = (r, f) => { c.setHex(r); for (let k = 0; k < 6; k++) { col.push(c.r, c.g, c.b); faz.push(f); } uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1); };
    return {
      q(x, y, z, w, h, renk, f) { // ekrana bakan
        pos.push(x - w, y - h, z, x + w, y - h, z, x + w, y + h, z, x - w, y - h, z, x + w, y + h, z, x - w, y + h, z); it(renk, f || 0);
      },
      qY(x, y, z, rx, rz, renk, f) { // yere yatık
        pos.push(x - rx, y, z + rz, x + rx, y, z + rz, x + rx, y, z - rz, x - rx, y, z + rz, x + rx, y, z - rz, x - rx, y, z - rz); it(renk, f || 0);
      },
      mesh(guc, titre, us) {
        if (!pos.length) return null;
        const g = new T.BufferGeometry();
        g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
        g.setAttribute('hRenk', new T.Float32BufferAttribute(col, 3));
        g.setAttribute('hFaz', new T.Float32BufferAttribute(faz, 1));
        const m = new T.ShaderMaterial({
          transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, fog: false,
          uniforms: { uT: ctx.U.uT, uG: { value: guc }, uTi: { value: titre == null ? 1 : titre }, uUs: { value: us || 2.2 } },
          vertexShader: 'attribute vec3 hRenk; attribute float hFaz; varying vec2 vU; varying vec3 vR; varying float vF;' +
            'void main(){ vU = uv; vR = hRenk; vF = hFaz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
          fragmentShader: 'varying vec2 vU; varying vec3 vR; varying float vF; uniform float uT, uG, uTi, uUs;' +
            'void main(){ float d = length(vU - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), uUs);' +
            ' float ti = 1.0 - uTi * (0.16 + 0.10 * sin(uT * 2.3 + vF) + 0.06 * sin(uT * 7.3 + vF * 1.7));' +
            ' gl_FragColor = vec4(vR * a * uG * ti, 1.0); }'
        });
        const me = new T.Mesh(g, m); me.renderOrder = 3; me.frustumCulled = false;
        return me;
      }
    };
  }

  // Yere yatık oval su yüzeyi (gölet / dere): kendi gölgeli, kıyısı yumuşak
  function suYap(ctx, x, z, rx, rz, renkA, renkB, parlak, yansiX) {
    const T = ctx.T;
    let y = 0;
    for (let i = -4; i <= 4; i++) for (let k = -4; k <= 4; k++) y = Math.max(y, ctx.yerY(x + rx * i / 4, z + rz * k / 4));
    const g = new T.CircleGeometry(1, 48); g.rotateX(-PI / 2); g.scale(rx, 1, rz); g.translate(x, y + 0.05, z);
    const v3 = (h) => new T.Color(h);
    const m = new T.ShaderMaterial({
      transparent: true, depthWrite: false, fog: false,
      uniforms: { uT: ctx.U.uT, uA: { value: v3(renkA) }, uB: { value: v3(renkB) }, uP: { value: v3(parlak) }, uYx: { value: yansiX == null ? 0.62 : yansiX } },
      vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying vec2 vU; uniform float uT, uYx; uniform vec3 uA, uB, uP;' +
        'void main(){ vec2 q = vU - 0.5; float d = length(q) * 2.0; float kenar = smoothstep(1.0, 0.82, d);' +
        ' float dal = 0.5 + 0.5 * sin(vU.x * 38.0 + sin(vU.y * 21.0 + uT * 0.9) * 1.6 - uT * 0.7);' +
        ' vec3 c = mix(uB, uA, smoothstep(0.0, 0.9, d)) + uA * dal * 0.12;' +
        ' float ser = exp(-pow((vU.x - uYx) * 9.0, 2.0)) * (0.55 + 0.45 * sin(vU.y * 70.0 + uT * 2.2 + sin(vU.x * 40.0) * 2.0));' +
        ' float par = pow(max(0.0, sin(vU.x * 90.0 + uT * 1.7) * sin(vU.y * 55.0 - uT * 1.3)), 8.0);' +
        ' c += uP * (ser * 0.75 + par * 0.5) * smoothstep(1.0, 0.5, d);' +
        ' gl_FragColor = vec4(c, kenar * 0.94); }'
    });
    const me = new T.Mesh(g, m); me.renderOrder = 1;
    return { mesh: me, y: y + 0.05 };
  }

  // Dikdörtgen yumuşak perdeler (sis katmanları, ışık huzmeleri): tek çizim. tur 0: sis (normal karışım), 1: huzme (toplamalı)
  function perdeYap(ctx, tur) {
    const T = ctx.T, pos = [], uv = [], col = [], faz = [], c = new T.Color();
    return {
      // (x,y) alt orta; w genişlik, h boy; egim: üst kenarın x kayması
      q(x, y, z, w, h, renk, alfa, egim) {
        const e = egim || 0;
        pos.push(x - w / 2, y, z, x + w / 2, y, z, x + w / 2 + e, y + h, z, x - w / 2, y, z, x + w / 2 + e, y + h, z, x - w / 2 + e, y + h, z);
        uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
        c.setHex(renk); for (let k = 0; k < 6; k++) { col.push(c.r, c.g, c.b); faz.push(alfa); }
      },
      mesh() {
        if (!pos.length) return null;
        const g = new T.BufferGeometry();
        g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
        g.setAttribute('hRenk', new T.Float32BufferAttribute(col, 3));
        g.setAttribute('hAlfa', new T.Float32BufferAttribute(faz, 1));
        const frag = tur === 1
          ? 'void main(){ float a = pow(sin(3.14159 * vU.x), 2.0) * smoothstep(0.0, 0.45, vU.y) * smoothstep(1.0, 0.7, vU.y);' +
            ' a *= 0.75 + 0.25 * sin(uT * 0.5 + vW.x * 0.3); gl_FragColor = vec4(vR * a * vA, 1.0); }'
          : 'void main(){ float a = smoothstep(0.0, 0.35, vU.y) * smoothstep(1.0, 0.45, vU.y) * smoothstep(0.0, 0.04, vU.x) * smoothstep(1.0, 0.96, vU.x);' +
            ' float n = 0.62 + 0.22 * sin(vW.x * 0.09 + uT * 0.11 + vW.z) + 0.16 * sin(vW.x * 0.23 - uT * 0.17 + vU.y * 3.0);' +
            ' gl_FragColor = vec4(vR, a * n * vA); }';
        const m = new T.ShaderMaterial({
          transparent: true, depthWrite: false, fog: false, side: T.DoubleSide,
          blending: tur === 1 ? T.AdditiveBlending : T.NormalBlending,
          uniforms: { uT: ctx.U.uT },
          vertexShader: 'attribute vec3 hRenk; attribute float hAlfa; varying vec2 vU; varying vec3 vR, vW; varying float vA;' +
            'void main(){ vU = uv; vR = hRenk; vA = hAlfa; vW = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
          fragmentShader: 'uniform float uT; varying vec2 vU; varying vec3 vR, vW; varying float vA;' + frag
        });
        const me = new T.Mesh(g, m); me.renderOrder = tur === 1 ? 3 : 2; me.frustumCulled = false;
        return me;
      }
    };
  }

  // ═══════════════════════ 23 · SAKURA GECESİ ═══════════════════════
  DY_EK[23] = {
    palet: {
      ad: 'Sakura Gecesi', gece: 1,
      sisRenk: 0x2c2050, sisYogun: 0.0046, arka: 0x2a1e4c,
      gok: [0x6c3c7e, 0x4a2c6e, 0x7c3c84, 0x24205c, 0x0c0c2e], gunesPos: [44, 25], gunesRenk: 0xfff6ea,
      ykUst: 0x8c7cd4, ykAlt: 0x3a2444, ykGuc: 1.12, gnRenk: 0xc8ccff, gnGuc: 1.5, arkaRenk: 0xff9ac8, arkaGuc: 0.62,
      dag: [[0x3e3274, 0x2c2052], [0x34296a, 0x281e4e], [0x2c2462, 0x241a48]],
      tepe: [0x284646, 0x3c6258, 0x383062, 0x4a427a],
      agac: [[0x9a4478, 0xe08cbc], [0x86386a, 0xcc78a8], [0xa85486, 0xeea2ca]],
      zemin: [0x3c6454, 0x284640, 0x4c4c72], cimen: [0x1c3e36, 0x4a7a62, 0x80628e],
      cicek: [[0xff8ac0, 0xffd2ea], [0xffffff, 0xfff0f8], [0xffb860, 0xffe4a8], [0xc8a8ff, 0xe8d8ff]],
      sisSerit: [0x5c3c7c, 0x3a2a64], siluet: [0x140e22, 0x2a1a3a]
    },
    secenek: {
      agacYok: true, degirmenYok: true, kulubeYok: true, kusYok: true, mantarSusYok: true,
      citYok: true, bayrakYok: true, piknikTur: 'yok',
      ucusanTur: 'isik', ucusanRenk: [0xffc8e8, 0xffe2b8, 0xd8ccff, 0xffffff],
      dagYukseklik: 1.25, bulutSay: 8, bulutRenk: [0x3e3270, 0x8a76b6], cimenSik: 0.85,
      salincak: { yaprak: [[0xd8609c, 0xffc8e4], [0xe878b0, 0xffe0f0], [0xc85090, 0xffb4d8]], govde: [0x2a1a24, 0x5a3a48], sarmasik: [0x5a2a4a, 0xb06090],
        cicek: [[0xffffff, 0xfff0f8], [0xff9cc8, 0xffe0f0]], tacIsik: 0x5a1a44 }
    },
    yardimci: {
      mantar: { sapka: [0xd0487c, 0xff9cc8], govde: [0xe8dcec, 0xfff6fa], benek: 0xffe8f4 },
      bulut: { alt: 0x9c8cd0, ust: 0xf2ecff, yanak: 0xff9cc8, emissive: 0x3a2c6a },
      nilufer: { yaprak: [0x2a6a54, 0x5aa880], cicek: [0xff7ab4, 0xffe0f0], halka: 0xffd6ec, emissive: 0x401838 },
      ruzgar: { renk: [0xd86aa8, 0xffd0ea], emissive: 0x8a3a70, ok: 0xfff0f8 },
      halka: { renk: [0xd8487e, 0xff9ac4], emissive: 0xb03070, cicek: [[0xff8ac0, 0xffe0f0], [0xffffff, 0xfff4fa], [0xffb860, 0xffe8b0]] },
      baloncuk: { renk: 0xd8e2ff, kenar: 0xfff0ff, opaklik: 1.1 },
      esinti: { tur: 'yaprak', renk: 0xffd6ec, taneRenk: [0xff9ccc, 0xffd6ea, 0xffffff] }
    },
    kur(ctx) {
      const { T, G, hx, yerY, tepeY, ara } = ctx;
      const S = ctx.yapi();   // ahşap, taş, köprü, kule (ışımaz)
      const C = ctx.yapi();   // çiçek bulutları (hafif ışır)
      const L = ctx.yapi();   // fener gövdeleri, pencereler (güçlü ışır)
      const H = haloYap(ctx);
      const xA = -40, xB = hx + 46;
      const pembe = [[0x8c3a6c, 0xd88cb8], [0x9a4678, 0xe2a0c8], [0x803264, 0xcc7cac], [0xa45686, 0xe8b0d2]];
      const gov = [0x241620, 0x4a3040];
      const fenerR = [[0xff7a2a, 0xffe0a0], [0xff5050, 0xffb8a0], [0xff9a40, 0xfff0c0]];
      let fi = 0;
      const fener = (x, y, z, s, ipY) => { // asılı kâğıt fener
        const r = fenerR[fi++ % fenerR.length];
        if (ipY != null) L.ekle(G.silA, x, (y + ipY) / 2, z, 0.018, Math.max(0.05, ipY - y), 0.018, 0x2a1a1a, 0x2a1a1a, 0, 0, 0, -0.05);
        L.ekle(G.kureU, x, y, z, 0.32 * s, 0.4 * s, 0.32 * s, r[0], r[1], 0, 0, 0, -0.05);
        S.ekle(G.silA, x, y + 0.4 * s, z, 0.2 * s, 0.08 * s, 0.2 * s, 0x5a1a20, 0x8a2a30, 0, 0, 0, -0.05);
        S.ekle(G.silA, x, y - 0.4 * s, z, 0.18 * s, 0.07 * s, 0.18 * s, 0x5a1a20, 0x8a2a30, 0, 0, 0, -0.05);
        S.ekle(G.silA3, x, y - 0.56 * s, z, 0.03 * s, 0.22 * s, 0.03 * s, 0xc84030, 0xffa040, 0, 0, 0, -0.05);
        H.q(x, y, z + 0.4, 1.5 * s, 1.5 * s, 0xffa040, x * 1.3);
        H.q(x, y, z + 0.45, 0.6 * s, 0.6 * s, 0xffd890, x * 1.3);
      };

      // 1) Sakura ağaçları: koyu eğri gövde + ışıldayan pembe çiçek bulutları + dallarda fenerler
      const sakura = (x, z, s, fenerVar, uzak) => {
        const y0 = z < -42 ? tepeY(x, z) - 0.2 : yerY(x, z) - 0.1;
        const yon = ctx.R() < 0.5 ? -1 : 1;
        // gövde (3 kıvrımlı parça)
        let px = x, py = y0;
        const parca = [[0.0, 1.5, 0.34], [0.35 * yon, 1.3, 0.27], [-0.2 * yon, 1.1, 0.21]];
        for (const [eg, boy, kal] of parca) {
          const nx = px + Math.sin(eg) * boy * s, ny = py + Math.cos(eg) * boy * s;
          S.ekle(G.silA, (px + nx) / 2, (py + ny) / 2, z, kal * s, boy * s * 1.08, kal * s, gov[0], gov[1], 0, 0, -eg);
          px = nx; py = ny;
        }
        S.ekle(G.kureU, x, y0 + 0.05, z, 0.55 * s, 0.25 * s, 0.5 * s, gov[0], gov[1]);
        // dallar ve uçlarında çiçek bulutları
        const uclar = [[px, py + 0.4 * s]];
        for (let d = uzak ? 1 : 0; d < (uzak ? 3 : 4); d++) {
          const a = (-0.95 + d * 0.63) + ara(-0.15, 0.15), boy = ara(1.5, 2.2) * s;
          const sx = x + (px - x) * (0.55 + d * 0.1), sy = y0 + (py - y0) * (0.55 + d * 0.1);
          const ex = sx + Math.sin(a) * boy, ey = sy + Math.cos(a) * boy * 0.8;
          S.ekle(G.silA, (sx + ex) / 2, (sy + ey) / 2, z + ara(-0.4, 0.4), 0.1 * s, boy, 0.1 * s, gov[0], gov[1], 0, 0, -Math.atan2(ex - sx, (ey - sy) || 0.01));
          uclar.push([ex, ey]);
        }
        for (let u = 0; u < uclar.length; u++) {
          const [cx, cy] = uclar[u], cs = s * (u === 0 ? 1.35 : 1.05);
          C.nc = [cx, cy, z];
          const kg = G.kureK;
          for (let k = 0; k < (uzak ? 3 : 4); k++) {
            const a = k / (uzak ? 3 : 4) * PI * 2 + u;
            const p = pembe[(u + k) % pembe.length];
            C.ekle(kg, cx + Math.cos(a) * 0.7 * cs, cy + Math.sin(a) * 0.35 * cs, z + Math.sin(a * 1.3) * 0.5 * cs, 0.95 * cs, 0.72 * cs, 0.85 * cs, p[0], p[1], 0, 0, 0, 0.12);
          }
          C.ekle(uzak ? kg : G.kureU, cx, cy + 0.25 * cs, z + 0.2 * cs, 1.0 * cs, 0.78 * cs, 0.9 * cs, pembe[u % 4][0], 0xfff2fa, 0, 0, 0, 0.14);
          C.nc = null;
          if (uzak) continue;
          // küçük açık pembe benekler (tek tek çiçekler)
          for (let k = 0; k < 3; k++) C.ekle(G.kureC, cx + ara(-1.1, 1.1) * cs, cy + ara(-0.2, 0.9) * cs, z + 0.8 * cs, 0.13 * cs, 0.13 * cs, 0.1 * cs, 0xffe0f0, 0xffffff, 0, 0, 0, 0.12);
          // (çiçek arkası hâlesi kaldırıldı: Pırıl'ın uçtuğu yükseklikte arka plan sakin kalsın)
          if (fenerVar && u > 0 && u % 2 === 1) fener(cx + ara(-0.3, 0.3) * cs, cy - 1.3 * cs, z + 0.6 * cs, 0.85 * s, cy - 0.5 * cs);
        }
      };
      // yakın sıra (z -12..-18, fenerli), orta sıra (-20..-34), uzak tepe sırası (-46..-60)
      for (let x = xA + 4; x < xB; x += ara(8, 11)) sakura(x, ara(-20, -15), ara(0.85, 1.0), true);
      for (let x = xA - 6; x < xB + 10; x += ara(9, 13)) sakura(x, ara(-34, -22), ara(1.2, 1.5), ctx.R() < 0.5);
      for (let x = xA - 30; x < xB + 40; x += ara(12, 17)) sakura(x, ara(-60, -48), ara(1.5, 1.9), false, true);

      // 2) Yol boyunca taş basamaklar + direkli kâğıt fenerler (oyun düzleminin gerisinde)
      for (let x = -7; x < hx + 8; x += ara(1.3, 1.8)) {
        const z = -3.3 + Math.sin(x * 0.21) * 0.5;
        S.ekle(G.kureK, x, yerY(x, z) - 0.02, z, ara(0.42, 0.58), 0.09, ara(0.3, 0.4), 0x5a5670, 0x8c88a4, 0, ara(0, 3), 0);
      }
      for (let x = -6; x < hx + 10; x += 7.2) {
        const z = -4.3 + ((x / 7.2) % 2 ? -0.5 : 0), y = yerY(x, z);
        S.ekle(G.sil, x, y + 0.85, z, 0.06, 1.7, 0.06, 0x3a2420, 0x5a3a30);
        S.ekle(G.kutu, x + 0.22, y + 1.68, z, 0.5, 0.06, 0.06, 0x3a2420, 0x5a3a30);
        S.ekle(G.koni4, x, y + 1.82, z, 0.22, 0.14, 0.22, 0x5a1a20, 0x8a2a30, 0, PI / 4, 0);
        fener(x + 0.42, y + 1.25, z, 0.9, y + 1.66);
        H.qY(x + 0.42, y + 0.06, z, 1.9, 1.3, 0x6a3a10, x);
      }

      // 3) Durgun gölet + kırmızı kemerli köprü
      const pcx = hx * 0.44, pcz = -9.5, prx = 9.5, prz = 3.6;
      const su = suYap(ctx, pcx, pcz, prx, prz, 0x4a46a0, 0x18225a, 0xfff2e0, 0.62);
      ctx.ekle(su.mesh);
      for (let i = 0; i < 34; i++) { // kıyı taşları
        const a = i / 34 * PI * 2, rr = 1.0 + ara(-0.04, 0.05);
        const x = pcx + Math.cos(a) * prx * rr, z = pcz + Math.sin(a) * prz * rr;
        S.ekle(G.kureK, x, su.y - 0.05, z, ara(0.45, 0.8), ara(0.2, 0.32), ara(0.35, 0.5), 0x3c3a54, 0x6a6888, 0, ara(0, 3), 0);
      }
      for (let i = 0; i < 6; i++) { // nilüfer yaprakları + pembe çiçekler
        const x = pcx + ara(-0.75, 0.75) * prx, z = pcz + ara(-0.55, 0.55) * prz;
        if (Math.abs(x - pcx) < 3.2) continue;
        S.ekle(G.daireY, x, su.y + 0.02, z, 0.7, 1, 0.5, 0x24584a, 0x3c7a62);
        L.ekle(G.kureK, x + 0.1, su.y + 0.12, z, 0.16, 0.12, 0.16, 0xff7ab4, 0xffe0f0);
        H.qY(x, su.y + 0.04, z, 0.8, 0.6, 0x50183a, i);
      }
      { // köprü
        const bx0 = pcx - 5.2, bx1 = pcx + 5.2, bz = pcz + 0.6, HB = 2.0, N = 14;
        const by = (t) => su.y + 0.1 + HB * Math.sin(PI * t);
        const kir = [0xa81e34, 0xe24a50];
        for (let i = 0; i < N; i++) {
          const t0 = i / N, t1 = (i + 1) / N, x0 = bx0 + (bx1 - bx0) * t0, x1 = bx0 + (bx1 - bx0) * t1, y0 = by(t0), y1 = by(t1);
          const len = Math.hypot(x1 - x0, y1 - y0), an = Math.atan2(y1 - y0, x1 - x0);
          S.ekle(G.kutu, (x0 + x1) / 2, (y0 + y1) / 2, bz, len * 1.04, 0.2, 1.7, 0x6a3a2a, 0x9a6040, 0, 0, an);
          for (const q of [-1, 1]) S.ekle(G.kutu, (x0 + x1) / 2, (y0 + y1) / 2 + 0.82, bz + q * 0.8, len * 1.04, 0.09, 0.09, kir[0], kir[1], 0, 0, an);
          S.ekle(G.kutu, (x0 + x1) / 2, (y0 + y1) / 2 - 0.14, bz + 0.86, len * 1.04, 0.12, 0.06, kir[0], kir[1], 0, 0, an);
          if (i % 2 === 0) for (const q of [-1, 1]) {
            S.ekle(G.sil, x0, y0 + 0.42, bz + q * 0.8, 0.06, 0.84, 0.06, kir[0], kir[1]);
            S.ekle(G.kureK, x0, y0 + 0.9, bz + q * 0.8, 0.09, 0.09, 0.09, 0xd8a040, 0xffe08a);
          }
        }
        for (const q of [-1, 1]) for (const zz of [-0.8, 0.8]) {
          const x = q < 0 ? bx0 : bx1;
          S.ekle(G.sil, x, su.y + 0.55, bz + zz, 0.09, 1.1, 0.09, kir[0], kir[1]);
          S.ekle(G.kureK, x, su.y + 1.15, bz + zz, 0.13, 0.13, 0.13, 0xd8a040, 0xffe08a);
        }
        // köprünün ortasında ve iki ucunda fener
        fener(pcx, by(0.5) + 1.45, bz + 0.85, 0.75, by(0.5) + 1.95);
        S.ekle(G.sil, pcx, by(0.5) + 1.05, bz + 0.85, 0.035, 1.9, 0.035, 0x3a2420, 0x5a3a30);
        // suda köprü ve ay yansıması ışıltısı
        H.qY(pcx, su.y + 0.03, bz + 0.6, 4.5, 1.2, 0x3a1424, 1);
        // göletin üstünde ayın yansıması (soluk, titreşen ay lekesi)
        H.qY(pcx + prx * 0.24, su.y + 0.04, pcz - prz * 0.35, 1.9, 0.75, 0x9aa4d8, 7);
        H.qY(pcx + prx * 0.24, su.y + 0.05, pcz - prz * 0.35, 0.9, 0.35, 0xe8ecff, 7);
      }

      // 4) Kırmızı torii kapıları (orta katman)
      const torii = (x, z, s) => {
        const y = yerY(x, z), kir = [0xb0202e, 0xe8483e];
        for (const q of [-1, 1]) {
          S.ekle(G.sil, x + q * 1.5 * s, y + 1.7 * s, z, 0.17 * s, 3.4 * s, 0.17 * s, kir[0], kir[1]);
          S.ekle(G.sil, x + q * 1.5 * s, y + 0.15 * s, z, 0.22 * s, 0.3 * s, 0.22 * s, 0x1a1418, 0x2a2228);
        }
        S.ekle(G.kutu, x, y + 2.75 * s, z, 3.6 * s, 0.2 * s, 0.24 * s, kir[0], kir[1]);
        S.ekle(G.kutu, x, y + 3.45 * s, z, 4.4 * s, 0.26 * s, 0.34 * s, kir[0], kir[1]);
        S.ekle(G.kutu, x, y + 3.65 * s, z, 4.7 * s, 0.14 * s, 0.4 * s, 0x1a1418, 0x2e2228);
        S.ekle(G.kutu, x, y + 3.1 * s, z, 0.24 * s, 0.6 * s, 0.2 * s, kir[0], kir[1]);
      };
      torii(-3.5, -19, 1.25); torii(hx * 0.7, -24, 1.4); torii(hx + 16, -20, 1.2);

      // 5) Uzakta katlı çatılı kule (tepede) + ikinci küçük kule
      const kule = (x, z, s, kat) => {
        const y = tepeY(x, z) - 0.3;
        let h = y, w = 2.2 * s;
        S.ekle(G.kutu, x, h + 0.3 * s, z, w * 1.3, 0.6 * s, w * 1.3, 0x3a3044, 0x5a5068); h += 0.6 * s;
        for (let k = 0; k < kat; k++) {
          const bh = 1.5 * s * (1 - k * 0.08);
          S.ekle(G.kutu, x, h + bh / 2, z, w, bh, w, 0x5a2a30, 0x8a3c40);
          for (const q of [-0.28, 0.28]) {
            L.ekle(G.kutu, x + q * w, h + bh * 0.5, z + w * 0.51, 0.3 * s, 0.5 * s, 0.05, 0xffa040, 0xffe0a0);
            H.q(x + q * w, h + bh * 0.5, z + w * 0.6, 0.9 * s, 0.9 * s, 0x6a3a10, k + q);
          }
          h += bh;
          S.ekle(G.koni4, x, h + 0.3 * s, z, w * 1.05, 0.75 * s, w * 1.05, 0x1e1828, 0x3c3050, 0, PI / 4, 0);
          // kıvrık çatı uçları
          for (const q of [-1, 1]) S.ekle(G.koni, x + q * w * 0.78, h + 0.12 * s, z + w * 0.3, 0.1 * s, 0.4 * s, 0.1 * s, 0x1e1828, 0x3c3050, 0, 0, -q * 0.9);
          for (const q of [-1, 1]) fener(x + q * w * 0.72, h - 0.35 * s, z + w * 0.6, 0.6 * s, h);
          h += 0.35 * s; w *= 0.84;
        }
        S.ekle(G.sil, x, h + 1.0 * s, z, 0.07 * s, 2.0 * s, 0.07 * s, 0xc89840, 0xffe08a);
        for (let k = 0; k < 4; k++) S.ekle(G.halkaInce, x, h + 0.5 * s + k * 0.32 * s, z, 0.22 * s, 0.22 * s, 0.22 * s, 0xc89840, 0xffe08a, PI / 2, 0, 0);
      };
      kule(hx * 0.62, -66, 1.5, 5);
      kule(-26, -60, 1.1, 3);

      // 6) Yerde dökülmüş pembe yapraklar (yakın arka ve ön)
      for (let i = 0; i < 420; i++) {
        const x = ara(-30, hx + 30), z = i < 190 ? ara(-11, -0.8) : ara(1.2, 15);
        if (Math.abs(z) < 0.8) continue;
        const p = pembe[i % 4];
        C.ekle(G.daireY, x, yerY(x, z) + 0.035, z, ara(0.08, 0.15), 1, ara(0.06, 0.11), p[1], p[1], 0, ara(0, 3), 0);
      }
      // ön (alçak): küçük ışıldayan çiçek kümeleri + yer fenerleri
      // yakın önde (dikey ekranın alt yarısı): alçak pembe açelya çalıları, yerde ay ışığı ve fener ışığı havuzları
      for (let x = -14; x < hx + 22; x += ara(2.2, 3.4)) {
        const z = ara(4.5, 16.5), y = yerY(x, z), r = ara(0.4, 0.75);
        C.nc = [x, y, z];
        for (let k = 0; k < 3; k++) C.ekle(G.kureK, x + (k - 1) * r * 0.9, y + r * (k === 1 ? 0.45 : 0.3), z, r * (k === 1 ? 1.0 : 0.75), r * 0.7, r * 0.8, 0x6a2c58, 0xc86aa0, 0, 0, 0, 0.1);
        C.nc = null;
        for (let k = 0; k < 6; k++) C.ekle(G.kureC, x + ara(-1.2, 1.2) * r, y + r * ara(0.55, 0.9), z + r * 0.6, 0.12, 0.1, 0.08, 0xff9cc8, 0xffeef8, 0, 0, 0, 0.1);
        H.qY(x + ara(-1, 1), y + 0.04, z + ara(-1, 1), 2.6, 1.6, (x | 0) % 2 ? 0x3a1830 : 0x3a2410, x);
      }
      for (let i = 0; i < 150; i++) { // yakın önde ot tutamları (koyu yeşil, ucu ay ışığında mor-pembe)
        const x = ara(-16, hx + 24), z = ara(4, 16.5), y = yerY(x, z), r = ara(0.25, 0.5);
        for (let k = 0; k < 4; k++) { const u = k / 3 * 2 - 1; S.ekle(G.bicak, x + u * r * 0.6, y - 0.02, z, r * 0.35, r * ara(1.2, 1.9), 1, 0x1a3a30, 0x7a6a9a, 0, 0, -u * 0.4, 0.5); }
      }
      for (let x = -10; x < hx + 18; x += ara(9, 13)) { // alçak taş fenerler (önde, sıcak ışık)
        const z = ara(4.5, 9), y = yerY(x, z);
        S.ekle(G.kutu, x, y + 0.12, z, 0.42, 0.24, 0.42, 0x4a4660, 0x6a6684);
        S.ekle(G.sil, x, y + 0.32, z, 0.1, 0.2, 0.1, 0x4a4660, 0x6a6684);
        L.ekle(G.kutu, x, y + 0.55, z, 0.3, 0.26, 0.3, 0xffa040, 0xffe0a0);
        S.ekle(G.koni4, x, y + 0.8, z, 0.36, 0.24, 0.36, 0x3a3650, 0x5a5674, 0, PI / 4, 0);
        S.ekle(G.kureK, x, y + 0.95, z, 0.06, 0.06, 0.06, 0x4a4660, 0x6a6684);
        H.q(x, y + 0.55, z + 0.3, 0.9, 0.9, 0xffa040, x);
        H.qY(x, y + 0.04, z, 2.2, 1.5, 0x5a3010, x);
      }
      for (let x = -12; x < hx + 20; x += ara(3.5, 6)) {
        const z = ara(1.6, 3.8);
        for (let k = 0; k < 3; k++) {
          const fx = x + ara(-0.5, 0.5), fz = z + ara(-0.3, 0.3), fy = ara(0.22, 0.45);
          S.ekle(G.silA3, fx, fy / 2, fz, 0.015, fy, 0.015, 0x2a5a44, 0x4a8a62, 0, 0, 0, 0.3);
          C.ekle(G.kureK, fx, fy, fz, 0.1, 0.08, 0.1, 0xff9cc8, 0xffeaf6, 0, 0, 0, 0.3);
        }
      }

      // 7) Bilbo'nun yeri: kırmızı örtü, minik çay takımı, iki yanında fener ipi
      {
        S.ekle(G.kutu, hx, 0.03, 0.0, 3.4, 0.05, 2.2, 0xb02838, 0xd03848);
        S.ekle(G.kutu, hx, 0.04, 0.0, 3.0, 0.05, 1.8, 0xe8c8b0, 0xf8e4d0);
        S.ekle(G.kutu, hx, 0.05, 0.0, 2.6, 0.05, 1.4, 0xb02838, 0xd03848);
        S.ekle(G.kureO, hx + 1.0, 0.25, -0.55, 0.22, 0.2, 0.22, 0xe8e0f0, 0xffffff);
        S.ekle(G.torusSap, hx + 1.24, 0.27, -0.55, 0.35, 0.35, 0.35, 0xe8e0f0, 0xffffff, 0, 0, -PI / 2);
        S.ekle(G.kureK, hx + 1.0, 0.47, -0.55, 0.06, 0.05, 0.06, 0xd8487e, 0xff9ac4);
        for (const q of [0.55, 1.45]) S.ekle(G.sil, hx + q, 0.1, -0.05 + (q > 1 ? 0.25 : 0), 0.09, 0.12, 0.09, 0xe8e0f0, 0xffffff);
        // (minder kaldırıldı: Pırıl kavuşmada üstüne basınca havada duran levha gibi görünüyordu)
        const p0 = hx - 4.6, p1 = hx + 4.6, pz = -2.4, ph = 3.4;
        for (const px of [p0, p1]) {
          S.ekle(G.sil, px, ph / 2, pz, 0.08, ph, 0.08, 0x3a2420, 0x5a3a30);
          S.ekle(G.kureK, px, ph + 0.06, pz, 0.12, 0.12, 0.12, 0xd8a040, 0xffe08a);
        }
        for (let i = 0; i <= 12; i++) {
          const t = i / 12, x = p0 + (p1 - p0) * t, y = ph - 0.15 - Math.sin(PI * t) * 0.9;
          if (i < 12) {
            const x2 = p0 + (p1 - p0) * (t + 1 / 12), y2 = ph - 0.15 - Math.sin(PI * (t + 1 / 12)) * 0.9;
            L.ekle(G.silA, (x + x2) / 2, (y + y2) / 2, pz, 0.015, Math.hypot(x2 - x, y2 - y), 0.015, 0x2a1a1a, 0x2a1a1a, 0, 0, -Math.atan2(x2 - x, y2 - y), -0.03);
          }
          if (i > 0 && i < 12 && i % 2 === 0) fener(x, y - 0.45, pz, 0.62, y);
        }
      }

      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0, { emissive: 0x1a1030, emissiveIntensity: 0.6 })));
      const cm = isikMalz(ctx, 0.18, { roughness: 0.85 });
      ctx.ekle(new T.Mesh(C.geo(), cm));
      ctx.ekle(new T.Mesh(L.geo(), isikMalz(ctx, 1.1, { roughness: 0.6 })));
      const hm = H.mesh(0.85, 1); if (hm) ctx.ekle(hm);
      ctx.veri.cm = cm;
    },
    guncelle(t, dt, ctx) {
      // çiçekler gecede yavaşça nefes alır gibi ışıldar
      const cm = ctx.veri.cm; if (cm) cm.emissiveIntensity = 0.17 + 0.04 * Math.sin(t * 0.9);
    }
  };

  // ═══════════════════════ 29 · SİSLİ BAMBU ORMANI ═══════════════════════
  // Oturan sevimli panda (yerel: tabanı y=0, yüzü +z'ye bakar, boy ~2.1)
  function pandaGeo(ctx) {
    const { G } = ctx, P = ctx.yapi();
    const B = [0x1c1c24, 0x34343e], W = [0xe4e4e0, 0xffffff];
    P.nc = [0, 0.75, 0];
    P.ekle(G.kureO, 0, 0.72, 0, 0.82, 0.78, 0.72, W[0], W[1]);            // gövde
    P.nc = null;
    P.ekle(G.kureO, 0, 0.98, -0.02, 0.86, 0.3, 0.74, B[0], B[1]);          // omuz kuşağı (siyah)
    for (const q of [-1, 1]) {
      P.ekle(G.kureO, q * 0.5, 0.26, 0.38, 0.3, 0.26, 0.38, B[0], B[1]);    // ayaklar
      P.ekle(G.kureK, q * 0.5, 0.26, 0.74, 0.16, 0.14, 0.04, 0x5a4a50, 0x6a5a60); // pati içi
      P.ekle(G.kureO, q * 0.55, 0.95, 0.38, 0.22, 0.42, 0.22, B[0], B[1], 0.9, 0, q * 0.5); // kollar
    }
    P.nc = [0, 1.7, 0];
    P.ekle(G.kureO, 0, 1.72, 0.05, 0.62, 0.55, 0.56, W[0], W[1]);          // baş
    P.nc = null;
    for (const q of [-1, 1]) {
      P.ekle(G.kureO, q * 0.46, 2.17, -0.02, 0.2, 0.2, 0.12, B[0], B[1]);   // kulaklar
      P.ekle(G.kureK, q * 0.22, 1.76, 0.52, 0.15, 0.19, 0.07, B[0], B[1], 0, 0, q * -0.5); // göz lekesi
      P.ekle(G.kureK, q * 0.2, 1.79, 0.585, 0.055, 0.06, 0.03, 0xffffff, 0xffffff); // göz parıltısı
      P.ekle(G.kureK, q * 0.36, 1.58, 0.47, 0.09, 0.05, 0.03, 0xffa0a8, 0xffb8c0); // yanak
    }
    P.ekle(G.kureK, 0, 1.62, 0.6, 0.08, 0.06, 0.05, B[0], B[1]);            // burun
    P.ekle(G.kureO, 0, 1.56, 0.5, 0.2, 0.13, 0.12, 0xf4f0ec, 0xffffff);    // ağız çevresi
    // pençesinde bambu dalı + yaprakları
    P.ekle(G.silA, 0.18, 1.25, 0.62, 0.05, 1.5, 0.05, 0x6aa848, 0x9ad070, 0, 0, -0.5);
    for (let k = 0; k < 3; k++) P.ekle(G.yaprak, 0.55 + k * 0.08, 1.92 - k * 0.05, 0.62, 0.07, 0.42, 0.02, 0x4a8a3a, 0x8ac460, 0, 0, -1.4 - k * 0.5);
    return P.geo();
  }

  DY_EK[29] = {
    palet: {
      ad: 'Sisli Bambu Ormanı', gece: 0,
      sisRenk: 0xcfe0c4, sisYogun: 0.0052, arka: 0xcddec2,
      gok: [0xe8eed6, 0xd2e4c6, 0xe6ead0, 0xaed4c0, 0x7cb8b0], gunesPos: [38, 25], gunesRenk: 0xfff6d8,
      ykUst: 0xf2f8e4, ykAlt: 0x7a9a6a, ykGuc: 1.22, gnRenk: 0xfff0c8, gnGuc: 2.0, arkaRenk: 0xe8f0b0, arkaGuc: 0.5,
      dag: [[0xb2c8ac, 0xdce8cc], [0xa0b898, 0xd4e2c4], [0x8ca888, 0xcadcbc]],
      tepe: [0x6a9a58, 0xa8cc88, 0x9cb898, 0xd0e0c0],
      agac: [[0x3e7a40, 0x7ab860], [0x4a8a48, 0x8ac870], [0x356a3a, 0x6aa858]],
      zemin: [0x8cba6a, 0x5e8e48, 0xbcd0a4], cimen: [0x4a8040, 0x9ccc70, 0x86bc60],
      cicek: [[0xffffff, 0xf8fff0], [0xffd8e8, 0xfff0f6], [0xfff0a0, 0xfffad8], [0xc8e0ff, 0xe8f4ff]],
      sisSerit: [0xf2f6e6, 0xe2ecd4], siluet: [0x1e3a24, 0x2e5034]
    },
    secenek: {
      agacYok: true, tepeCicekYok: true, degirmenYok: true, kulubeYok: true, mantarSusYok: true,
      citYok: true, bayrakYok: true, piknikTur: 'yok',
      ucusanTur: 'yaprak', ucusanRenk: [0x9ccc70, 0xc8e090, 0x7ab860, 0xe8f0c0],
      dagYukseklik: 1.35, bulutSay: 6, bulutRenk: [0xe4ecdc, 0xffffff], cimenSik: 1.0,
      salincak: { yaprak: [[0x3e7a32, 0x8cc462], [0x4e8e3e, 0x9ad070]], sarmasik: [0x4e8a3a, 0x86c05a], cicek: [[0xffffff, 0xf8fff0], [0xffd8e8, 0xfff0f6]] }
    },
    yardimci: {
      mantar: { sapka: [0xa86a3a, 0xe8a868], govde: [0xeee4d0, 0xfffaf0], benek: 0xfff4e0 },
      bulut: { alt: 0xdce8d8, ust: 0xffffff, yanak: 0xffb8c0, emissive: 0x506048 },
      nilufer: { yaprak: [0x3a7a40, 0x7ab860], cicek: [0xff9cc0, 0xfff0f6], halka: 0xf0fff0 },
      ruzgar: { renk: [0x7ab060, 0xe0f4c8], emissive: 0x3a6a30, ok: 0xf8fff0 },
      halka: { renk: [0x5a9a3a, 0xb8dc70], emissive: 0x2a5a20, cicek: [[0xffffff, 0xf8fff0], [0xffd8e8, 0xfff0f6], [0xfff0a0, 0xfffad8]] },
      baloncuk: { renk: 0xa8dcff, kenar: 0x2e94e0, opaklik: 1.5 },   // soluk sisli gökte seçilsin diye mavi kenarlı çiy baloncuğu
      esinti: { tur: 'yaprak', renk: 0xf4fae8, taneRenk: [0x9ccc70, 0xc8e090, 0x7ab860] }
    },
    kur(ctx) {
      const { T, G, hx, yerY, tepeY, ara } = ctx;
      const BM = ctx.yapi();  // bambular (rüzgârla salınır)
      const S = ctx.yapi();   // taşlar, köprü, taş fenerler
      const L = ctx.yapi();   // fener ışıkları
      const M = perdeYap(ctx, 0), HU = perdeYap(ctx, 1), H = haloYap(ctx);
      const yesil = [[0x4e8e3e, 0x7ab85a], [0x5a9a46, 0x8cc866], [0x6aa64e, 0x9cd070], [0x46803a, 0x6eaa52]];
      const bambu = (x, z, h, r, ayrinti) => {
        const y0 = z < -42 ? tepeY(x, z) - 0.3 : yerY(x, z) - 0.1;
        const c = yesil[(ctx.R() * yesil.length) | 0], seg = ayrinti ? ara(1.5, 1.9) : ara(2.6, 3.2), n = Math.max(3, Math.round(h / seg));
        const egik = ara(-0.05, 0.05);
        for (let i = 0; i < n; i++) {
          const ya = i * h / n, yb = (i + 1) * h / n, sw = 0.55 * Math.pow((i + 0.5) / n, 2) * (h / 18);
          const cx = x + egik * (ya + yb) / 2;
          BM.ekle(G.silA, cx, y0 + (ya + yb) / 2, z, r, (yb - ya) * 1.01, r, c[0], c[1], 0, 0, -egik, -sw);
          if (ayrinti || i % 2 === 0) BM.ekle(G.silA, x + egik * yb, y0 + yb, z, r * 1.22, 0.09, r * 1.22, 0xa8cc78, 0xc8e090, 0, 0, -egik, -sw); // boğum
          // boğumlardan çıkan ince yaprak demetleri (yukarıda daha sık)
          if (i > n * 0.4 && (ayrinti || i % 2 === 1)) {
            const yon = (i % 2 ? 1 : -1), ly = y0 + yb;
            for (let k = 0; k < (ayrinti ? 6 : 4); k++) {
              // yaprak ucu dışa ve hafif aşağı sarkar (koninin ucu +y; z ekseninde φ dönünce uç (-sinφ, cosφ) yönüne gider)
              const a = -yon * (1.25 + k * 0.2 + ara(-0.1, 0.1)), ll = ara(1.1, 1.6);
              BM.ekle(G.yaprak, x + egik * yb - Math.sin(a) * ll * 0.5, ly + Math.cos(a) * ll * 0.5, z + ara(-0.35, 0.35), 0.17, ll, 0.03, 0x3e7a32, 0x8cc462, 0, 0, a, -sw * 1.2);
            }
          }
        }
        // tepe püskülü
        for (let k = 0; k < 3; k++) BM.ekle(G.yaprak, x + egik * h + (k - 1) * 0.3, y0 + h + 0.2, z, 0.1, 1.1, 0.025, 0x3e7a32, 0x9ad070, 0, 0, (k - 1) * 0.7, -0.6 * (h / 18));
      };
      // bambu öbekleri: yakın sıra seyrek öbekler (oyun alanının çok gerisinde), orta sık, uzak sis içinde
      const obek = (cx, z0, adet, hA, hB, ayr, kal) => {
        for (let i = 0; i < adet; i++) bambu(cx + ara(-1.6, 1.6), z0 + ara(-1.2, 1.2), ara(hA, hB), ara(0.13, 0.2) * (kal || 1), ayr);
      };
      for (let x = -34; x < hx + 40; x += ara(12, 17)) obek(x, ara(-19, -15), 3 + ((ctx.R() * 2) | 0), 13, 21, true, 1.35);
      for (let x = -46; x < hx + 56; x += ara(5, 7.5)) obek(x, ara(-30, -20), 3, 16, 26, false);
      for (let x = -80; x < hx + 90; x += ara(6, 9)) obek(x, ara(-58, -42), 2, 18, 28, false);
      // sis katmanları bambuların arasında (katman katman kaybolsunlar)
      // (oyun düzlemine yakın sis yok: yıldızlar seçilsin; sis yalnız arka katmanlarda yoğun)
      for (const [z, y, h, a, r] of [[-22, -0.5, 5, 0.35, 0xe8f0dc], [-33, 0, 12, 0.6, 0xe0ead4], [-42, 2, 15, 0.5, 0xe6eedc], [-62, 0, 20, 0.75, 0xdce6d0]]) {
        M.q(hx / 2, y, z, hx + 220, h, r, a);
      }
      // sabah ışığı huzmeleri (sol üstten eğik)
      for (let x = -20; x < hx + 30; x += ara(9, 14)) {
        const z = ara(-46, -30), w = ara(2.2, 4.2);
        HU.q(x, -1, z, w, 34, 0xfff0c0, ara(0.08, 0.12), -10);
      }

      // yosunlu taşlar
      const tas = (x, z, s) => {
        const y = yerY(x, z);
        S.nc = [x, y, z];
        S.ekle(G.kureO, x, y + 0.25 * s, z, 0.9 * s, 0.6 * s, 0.7 * s, 0x7e8478, 0xaeb2a4, 0, ara(0, 3), 0);
        S.ekle(G.kureO, x + 0.6 * s, y + 0.15 * s, z + 0.2 * s, 0.5 * s, 0.38 * s, 0.45 * s, 0x767c70, 0xa6aa9c);
        S.nc = null;
        S.ekle(G.kubbe, x - 0.05 * s, y + 0.62 * s, z, 0.7 * s, 0.22 * s, 0.55 * s, 0x4e8a3a, 0x86c05a);
      };
      // taş fener (tōrō)
      const toro = (x, z, s) => {
        const y = yerY(x, z);
        S.ekle(G.kutu, x, y + 0.12 * s, z, 0.7 * s, 0.24 * s, 0.7 * s, 0x8a8e84, 0xaab0a2);
        S.ekle(G.sil, x, y + 0.6 * s, z, 0.13 * s, 0.75 * s, 0.13 * s, 0x8a8e84, 0xb4b8aa);
        S.ekle(G.kutu, x, y + 1.02 * s, z, 0.6 * s, 0.12 * s, 0.6 * s, 0x8a8e84, 0xb4b8aa);
        S.ekle(G.kutu, x, y + 1.3 * s, z, 0.46 * s, 0.44 * s, 0.46 * s, 0x8a8e84, 0xb4b8aa);
        L.ekle(G.kutu, x, y + 1.3 * s, z + 0.02, 0.26 * s, 0.26 * s, 0.48 * s, 0xffb040, 0xffe8b0);
        S.ekle(G.koni4, x, y + 1.72 * s, z, 0.62 * s, 0.4 * s, 0.62 * s, 0x7a7e74, 0xa4a89a, 0, PI / 4, 0);
        S.ekle(G.kureK, x, y + 1.98 * s, z, 0.09 * s, 0.11 * s, 0.09 * s, 0x8a8e84, 0xb4b8aa);
        S.ekle(G.kubbe, x - 0.1 * s, y + 1.86 * s, z + 0.05, 0.38 * s, 0.1 * s, 0.32 * s, 0x5a9a42, 0x8cc460);
        H.q(x, y + 1.3 * s, z + 0.4, 0.8 * s, 0.8 * s, 0xffb050, x);
      };
      for (let x = -12; x < hx + 22; x += ara(5, 8)) tas(x, ara(-9, -4.5), ara(0.6, 1.1));
      for (let x = -6; x < hx + 14; x += ara(13, 17)) toro(x, ara(-6, -4.2), ara(0.95, 1.15));
      toro(hx + 3.8, -1.8, 0.9);
      // taş basamaklı patika
      for (let x = -7; x < hx + 8; x += ara(1.4, 1.9)) {
        const z = -3.2 + Math.sin(x * 0.17) * 0.5;
        S.ekle(G.kureK, x, yerY(x, z) - 0.02, z, ara(0.42, 0.56), 0.09, ara(0.3, 0.4), 0x8a8e84, 0xb0b4a6, 0, ara(0, 3), 0);
      }

      // küçük dere + ahşap köprü
      const dcx = hx * 0.56, dcz = -8.8;
      const su = suYap(ctx, dcx, dcz, 7.5, 2.4, 0x7ac0b0, 0x3a8a90, 0xffffff, 0.4);
      ctx.ekle(su.mesh);
      for (let i = 0; i < 28; i++) {
        const a = i / 28 * PI * 2, x = dcx + Math.cos(a) * 7.5 * ara(0.97, 1.04), z = dcz + Math.sin(a) * 2.4 * ara(0.97, 1.04);
        S.ekle(G.kureK, x, su.y - 0.05, z, ara(0.4, 0.7), ara(0.2, 0.3), ara(0.3, 0.45), 0x6e7468, 0x9ea294, 0, ara(0, 3), 0);
      }
      {
        const bx0 = dcx - 4.2, bx1 = dcx + 4.2, bz = dcz + 0.4, HB = 1.1, N = 12;
        const by = (t) => su.y + 0.12 + HB * Math.sin(PI * t);
        for (let i = 0; i < N; i++) {
          const t0 = i / N, t1 = (i + 1) / N, x0 = bx0 + (bx1 - bx0) * t0, x1 = bx0 + (bx1 - bx0) * t1, y0 = by(t0), y1 = by(t1);
          const len = Math.hypot(x1 - x0, y1 - y0), an = Math.atan2(y1 - y0, x1 - x0);
          S.ekle(G.kutu, (x0 + x1) / 2, (y0 + y1) / 2, bz, len * 0.9, 0.12, 1.5, i % 2 ? 0x8a6040 : 0x9a6e48, 0xb88a5c, 0, 0, an);
          for (const q of [-1, 1]) S.ekle(G.kutu, (x0 + x1) / 2, (y0 + y1) / 2 + 0.7, bz + q * 0.7, len * 1.03, 0.07, 0.07, 0x7a5434, 0xa47a50, 0, 0, an);
          if (i % 3 === 0) for (const q of [-1, 1]) S.ekle(G.sil, x0, y0 + 0.35, bz + q * 0.7, 0.05, 0.72, 0.05, 0x7a5434, 0xa47a50);
        }
        for (const q of [-1, 1]) S.ekle(G.sil, q < 0 ? bx0 : bx1, su.y + 0.4, bz + 0.7, 0.06, 0.8, 0.06, 0x7a5434, 0xa47a50);
      }

      // önde alçak süsler: eğreltiotu, bambu filizleri, yosunlu küçük taşlar, beyaz çiçekler
      const egrelti = (x, z, s) => {
        const y = yerY(x, z);
        for (let k = 0; k < 6; k++) {
          const a = (k / 5 - 0.5) * 2.2;
          S.ekle(G.yaprak, x + Math.sin(a) * 0.35 * s, y + 0.3 * s, z, 0.14 * s, 0.75 * s, 0.03, 0x3a7230, 0x8ac060, 0, 0, -a, 0.4);
        }
      };
      for (let x = -14; x < hx + 24; x += ara(1.6, 2.8)) egrelti(x, ara(1.4, 4.2), ara(0.6, 1.0));
      for (let x = -16; x < hx + 26; x += ara(1.8, 3)) egrelti(x, ara(5, 16), ara(0.8, 1.3));
      for (let x = -14; x < hx + 24; x += ara(6, 10)) { // bambu filizi (alçak)
        const z = ara(5, 14), y = yerY(x, z), h = ara(0.5, 1.0);
        S.ekle(G.koni, x, y + h / 2, z, 0.14, h, 0.14, 0x6a7a3a, 0xa8c070, 0, 0, 0, 0.2);
        S.ekle(G.koni, x + 0.4, y + h * 0.35, z + 0.2, 0.1, h * 0.7, 0.1, 0x6a7a3a, 0xa8c070, 0, 0, 0, 0.2);
      }
      for (let x = -12; x < hx + 22; x += ara(7, 11)) tas(x, ara(6, 14), ara(0.4, 0.7));
      for (let i = 0; i < 70; i++) {
        const x = ara(-14, hx + 24), z = ara(1.4, 15), y = yerY(x, z);
        S.ekle(G.silA3, x, y + 0.15, z, 0.012, 0.3, 0.012, 0x3a7230, 0x6aa050);
        S.ekle(G.cicek, x, y + 0.3, z + 0.02, 0.09, 0.09, 0.09, 0xffffff, 0xffffff);
        S.ekle(G.kureC, x, y + 0.3, z + 0.03, 0.03, 0.03, 0.02, 0xffd860, 0xffe880);
      }

      // Bilbo'nun yeri: bambu hasır + minder + çay
      for (let i = 0; i < 12; i++) S.ekle(G.silA, hx - 1.7 + i * 0.31, 0.06, 0, 0.13, 2.3, 0.06, 0xc8a868, 0xe8d090, PI / 2, 0, 0);
      for (const q of [-1, 1]) S.ekle(G.kutu, hx + q * 1.75, 0.07, 0, 0.08, 0.1, 2.3, 0x7a5a34, 0x9a7a4a);
      S.ekle(G.kureO, hx - 1.05, 0.14, -0.55, 0.4, 0.12, 0.34, 0x5a9a5a, 0x8ac888);
      S.ekle(G.kureO, hx + 1.0, 0.25, -0.55, 0.22, 0.2, 0.22, 0x5a8a6a, 0x9acaa8);
      S.ekle(G.torusSap, hx + 1.24, 0.27, -0.55, 0.35, 0.35, 0.35, 0x5a8a6a, 0x9acaa8, 0, 0, -PI / 2);
      for (const q of [0.55, 1.45]) S.ekle(G.sil, hx + q, 0.1, -0.05 + (q > 1 ? 0.25 : 0), 0.09, 0.12, 0.09, 0xeef0e4, 0xffffff);

      ctx.ekle(new T.Mesh(BM.geo(), ctx.malz(true, true, 0.35, { roughness: 0.6, emissive: 0x24401a, emissiveIntensity: 0.35 })));
      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0, { emissive: 0x30382a, emissiveIntensity: 0.3 })));
      ctx.ekle(new T.Mesh(L.geo(), isikMalz(ctx, 0.9)));
      for (const p of [M.mesh(), HU.mesh(), H.mesh(0.55, 1)]) if (p) ctx.ekle(p);

      // pandalar (tek çizim, guncelle'de yavaş nefes alıp çiğner)
      const pg = pandaGeo(ctx), pm = ctx.malz(true, true, 0.25, { roughness: 0.85 });
      const yer = [[6.5, -6.2, 1.35, 0.25], [hx * 0.36, -7.5, 1.3, -0.3], [hx * 0.8, -6.4, 1.4, 0.2], [hx + 4.2, -3.8, 1.1, -0.4], [-13, -7.5, 1.3, 0.3]];
      const im = new T.InstancedMesh(pg, pm, yer.length); im.frustumCulled = false;
      ctx.ekle(im);
      ctx.veri.panda = im; ctx.veri.pyer = yer; ctx.veri.o = new T.Object3D();
      DY_EK[29].guncelle(0, 0, ctx);
    },
    guncelle(t, dt, ctx) {
      const v = ctx.veri, im = v.panda; if (!im) return;
      const o = v.o;
      for (let i = 0; i < v.pyer.length; i++) {
        const [x, z, s, ry] = v.pyer[i], ci = Math.sin(t * 3.2 + i * 1.7);
        // kavuşmada Bilbo'ya yakın pandalar sevinçle hoplar, yana sallanır
        const sev = (typeof P !== 'undefined' && P && P.durum === 'kavus' && Math.abs(x - ctx.hx) < 14) ? Math.abs(Math.sin(t * 6 + i)) * 0.45 : 0;
        o.position.set(x, ctx.yerY(x, z) - 0.05 + sev, z);
        o.rotation.set(Math.max(0, ci) * 0.04, ry + Math.sin(t * 0.4 + i) * 0.08, Math.sin(t * 0.7 + i * 2) * 0.03 + (sev ? Math.sin(t * 3 + i) * 0.16 : 0));
        const nf = 1 + 0.025 * Math.sin(t * 1.6 + i);
        o.scale.set(s * (2 - nf), s * nf, s * (2 - nf));
        o.updateMatrix(); im.setMatrixAt(i, o.matrix);
      }
      im.instanceMatrix.needsUpdate = true;
    }
  };

  // ═══════════════════════ 33 · IŞILDAYAN ORMAN ═══════════════════════
  const IO_RENK = { tur: [0x0a7a90, 0x50e0e0], mor: [0x5a28b0, 0xb080f0], pem: [0xb02880, 0xf080c8], mav: [0x2a4ac0, 0x80a8f0] };
  const IO_SIRA = ['tur', 'mor', 'pem', 'tur', 'mav', 'mor'];
  let ioKubbe = null; // kur içinde kurulan az üçgenli şapka (kur sonunda dispose)
  // SÜS mantarı (yalnız arka katmanlarda): soğuk tek tonlu, beneksiz, soluk ışık — zıplatan oyun mantarıyla karışmasın
  const IO_SOGUK = [[0x1a2468, 0x34489a], [0x241c66, 0x46389a], [0x142c66, 0x2c5492]];
  function ioMantar(GL, G, x, y, z, s, rk, egik) {
    const r = IO_SOGUK[(rk === 'mor' || rk === 'pem') ? 1 : rk === 'mav' ? 2 : 0], e = egik || 0, kb = ioKubbe || G.kubbe, cx = x - e * 1.6 * s;
    GL.ekle(G.kule, x, y + 0.9 * s, z, 0.32 * s, 1.8 * s, 0.32 * s, 0x121a3c, 0x2a3466, 0, 0, e, 0.06);
    GL.ekle(kb, cx, y + 1.65 * s, z, 1.3 * s, 0.85 * s, 1.3 * s, r[0], r[1], 0, 0, e, 0.08);
    GL.ekle(G.daireY, cx, y + 1.6 * s, z, 1.2 * s, 1, 1.2 * s, 0x10123a, 0x10123a, PI, 0, -e, 0.08); // şapka altı
  }

  DY_EK[33] = {
    palet: {
      ad: 'Işıldayan Orman', gece: 1,
      sisRenk: 0x1a1a4a, sisYogun: 0.0050, arka: 0x181846,
      gok: [0x2c2c70, 0x1e1e5a, 0x3c2a74, 0x141448, 0x080828], gunesPos: [58, 27], gunesRenk: 0xe2f0ff,
      ykUst: 0x6a7ad8, ykAlt: 0x24204c, ykGuc: 1.1, gnRenk: 0xa8b8ff, gnGuc: 1.45, arkaRenk: 0x60f0e0, arkaGuc: 0.7,
      dag: [[0x2c2c66, 0x1c1c4a], [0x24245c, 0x181a44], [0x1e1e52, 0x16163e]],
      tepe: [0x1e3c52, 0x2c566c, 0x262a5c, 0x343a72],
      agac: [[0x1a3650, 0x2c627a], [0x22305a, 0x38588a], [0x182c48, 0x284c68]],
      zemin: [0x264452, 0x182e3c, 0x2e3664], cimen: [0x14303c, 0x2e7a82, 0x4a5aa4],
      cicek: [[0x40e8e0, 0xb0fff8], [0xc070ff, 0xe8c8ff], [0xff70c8, 0xffc8ec], [0x70a8ff, 0xc8e0ff]],
      sisSerit: [0x2c2c6c, 0x1e1e52], siluet: [0x080c1e, 0x121a34]
    },
    secenek: {
      agacMeyveYok: true, degirmenYok: true, kulubeYok: true, kusYok: true, mantarSusYok: true,
      citYok: true, bayrakYok: true, piknikTur: 'yok', ucusanTur: 'yok', tepeCicekYok: true,
      gunesGuc: 0.6, bulutSay: 5, bulutRenk: [0x22225a, 0x3a3a7c], cimenSik: 0.9,
      salincak: { yaprak: [[0x1a2c5a, 0x30548e], [0x1e3460, 0x3a5c96]], govde: [0x1a2040, 0x3a4470], sarmasik: [0x0a7a90, 0x50e0e0],
        cicek: [[0x40e8e0, 0xb0fff8], [0xc070ff, 0xe8c8ff], [0xff70c8, 0xffc8ec]], tacIsik: 0x183a70 }
    },
    yardimci: {
      mantar: { sapka: [0xff2e6e, 0xffb04a], govde: [0xffb48a, 0xfff0dc], benek: 0xffffff },
      bulut: { alt: 0x3a3a8a, ust: 0xa8b4ff, yanak: 0xff9ad8, emissive: 0x3040a0 },
      nilufer: { yaprak: [0x1a6a6a, 0x40c0b0], cicek: [0xff70c8, 0xffe0f4], halka: 0x9afff4, emissive: 0x2a8080 },
      ruzgar: { renk: [0x30b8e0, 0xb0f8ff], emissive: 0x2090c0, ok: 0xe0ffff },
      halka: { renk: [0x8a40e0, 0xe0b0ff], emissive: 0x8040e0, cicek: [[0x40e8e0, 0xb0fff8], [0xff70c8, 0xffc8ec], [0xc070ff, 0xe8c8ff]] },
      baloncuk: { renk: 0xb8f0ff, kenar: 0xe8d4ff, opaklik: 1.2 },
      esinti: { tur: 'isik', renk: 0xa0f0ff, taneRenk: [0x80fff0, 0xd0a8ff, 0xffa8e0] }
    },
    yardimciKur: {
      // bölümdeki zıplatan mantar: sahnenin EN parlak, en sıcak nesnesi (pembe-turuncu ışık, gülen yüz, nabız gibi atan ışık)
      mantar(M, i, ctx) {
        const { T, G } = ctx, GL = ctx.yapi(), r = [0xff2e6e, 0xffb04a];
        GL.ekle(G.kule, 0, 0.95, 0, 0.5, 1.9, 0.5, 0xffb48a, 0xfff0dc);
        GL.nc = [0, 1.8, 0];
        GL.ekle(G.kubbe, 0, 1.8, 0, 1.75, 1.35, 1.75, r[0], r[1]);
        GL.nc = null;
        GL.ekle(G.kubbe, 0, 1.78, 0, 1.6, 0.16, 1.6, 0x8a1a40, 0xff5a7a, PI, 0, 0);
        for (let k = 0; k < 7; k++) {
          const a = k / 7 * PI * 2 + 0.4, rr = k % 2 ? 0.85 : 1.2;
          GL.ekle(G.kureK, Math.cos(a) * rr, 1.8 + 1.35 * Math.sqrt(Math.max(0, 1 - (rr / 1.75) * (rr / 1.75))), Math.sin(a) * rr, 0.22, 0.1, 0.22, 0xffffff, 0xffffff);
        }
        GL.ekle(G.kureK, 0, 3.12, 0, 0.26, 0.1, 0.26, 0xffffff, 0xffffff);
        const mm = isikMalz(ctx, 0.9, { roughness: 0.5 });
        const mesh = new T.Mesh(GL.geo(), mm);
        // gözler (kırpılır)
        const E = ctx.yapi();
        for (const q of [-1, 1]) {
          E.ekle(G.kureK, q * 0.2, 0, 0, 0.1, 0.14, 0.06, 0x2a1020, 0x3a1830);
          E.ekle(G.kureC, q * 0.2 + 0.03, 0.05, 0.05, 0.035, 0.04, 0.02, 0xffffff, 0xffffff);
        }
        for (const q of [-1, 1]) E.ekle(G.kureK, q * 0.34, -0.17, -0.02, 0.09, 0.055, 0.03, 0xff5a8a, 0xff8aa8);
        const goz = new T.Mesh(E.geo(), ctx.malz(false, true, 0, { roughness: 0.4 }));
        goz.position.set(0, 1.15, 0.47);
        mesh.add(goz);
        // gülen ağız (kırpılmaz)
        const A = ctx.yapi();
        A.ekle(G.torusSap, 0, 0.98, 0.5, 0.3, 0.3, 0.3, 0x5a1828, 0x5a1828, 0, 0, PI);
        mesh.add(new T.Mesh(A.geo(), ctx.malz(false, true, 0, { roughness: 0.5 })));
        // arkasında sıcak ışık hâlesi
        const H = haloYap(ctx);
        H.q(0, 2.4, -0.9, 3.6, 3.0, 0xff6a40, i * 2);
        H.q(0, 2.6, -0.85, 2.0, 1.4, 0xffa050, i * 2);
        const hm = H.mesh(0.55, 0.4, 2.0); if (hm) mesh.add(hm);
        const v = ctx.veri; (v.oyunM || (v.oyunM = [])).push({ mm, x: M.x, y: M.y });
        return { mesh, goz };
      }
    },
    kur(ctx) {
      const { T, G, hx, yerY, tepeY, ara } = ctx;
      const S = ctx.yapi();             // koyu gövdeler, kayalar, taş (ışımaz)
      const GA = ctx.yapi(), GB = ctx.yapi(); // ışıldayan süsler (iki grup, sırayla nefes alır)
      const GD = ctx.yapi();                 // arka katman soluk ışıklılar (süs mantarları, ağaç desenleri, kristaller)
      const H = haloYap(ctx);
      ioKubbe = new T.SphereGeometry(1, 12, 4, 0, PI * 2, 0, PI * 0.5);
      const renkAl = (i) => IO_SIRA[((i % IO_SIRA.length) + IO_SIRA.length) % IO_SIRA.length];
      let gi = 0;
      const GL = () => (gi++ % 2 ? GA : GB);

      // 1) Dev ışıldayan mantarlar: orta katmanda kümeler, yakın arkada küçükler
      const kume = (x, z, s, n) => {
        const y = z < -42 ? tepeY(x, z) - 0.2 : yerY(x, z) - 0.05;
        for (let k = 0; k < n; k++) {
          const ks = s * (k === 0 ? 1 : ara(0.4, 0.7)), kx = x + (k === 0 ? 0 : ara(-1.6, 1.6) * s), kz = z + (k === 0 ? 0 : ara(0.2, 1.2) * s);
          const rk = renkAl(gi++ + k);
          ioMantar(GD, G, kx, y, kz, ks, rk, ara(-0.12, 0.12));
          H.q(kx, y + 1.9 * ks, kz - 0.4, 2.4 * ks, 1.7 * ks, 0x141c4c, kx);
        }
      };
      // yalnız uzak katmanlarda (z ≤ -30): oyun düzlemine yakın süs mantarı yok
      for (let x = -40; x < hx + 46; x += ara(13, 18)) kume(x, ara(-42, -32), ara(1.8, 2.8), 3);
      for (let x = -60; x < hx + 70; x += ara(14, 20)) kume(x, ara(-60, -48), ara(3.2, 4.6), 2);

      // 2) Işıldayan desenli ağaç gövdeleri + sarkan ışık sarmaşıkları
      const agac = (x, z, s) => {
        const y = yerY(x, z) - 0.2, h = 13 * s, rk = renkAl(gi++), r = IO_RENK[rk], g = GD;
        S.ekle(G.kule, x, y + h / 2, z, 0.75 * s, h, 0.75 * s, 0x141a34, 0x2a3458);
        for (const q of [-1, 1]) S.ekle(G.koni, x + q * 0.7 * s, y + 0.5 * s, z + 0.2, 0.45 * s, 1.4 * s, 0.4 * s, 0x141a34, 0x222a4a, 0, 0, q * 0.9); // kökler
        // gövdede sarmal ışık benekleri ve halkalar
        for (let k = 0; k < 22; k++) {
          const t = k / 22, a = t * PI * 6, yy = y + 0.6 * s + t * h * 0.62, rr = 0.82 * s * (1.05 - t * 0.35);
          g.ekle(G.kureC, x + Math.cos(a) * rr, yy, z + Math.sin(a) * rr, 0.1 * s, 0.1 * s, 0.1 * s, r[0], r[1]);
        }
        for (let k = 0; k < 3; k++) g.ekle(G.halkaInce, x, y + (1.5 + k * 1.6) * s, z, 0.86 * s * (1 - k * 0.08), 0.86 * s * (1 - k * 0.08), 0.5, r[0], r[1], PI / 2, 0, 0);
        // koyu taç
        S.nc = [x, y + h, z];
        for (let k = 0; k < 5; k++) {
          const a = k / 5 * PI * 2;
          S.ekle(G.kureU, x + Math.cos(a) * 2.2 * s, y + h + Math.sin(a) * 0.7 * s, z + Math.sin(a) * 1.2 * s, 2.4 * s, 1.6 * s, 2.0 * s, 0x1a2c5a, 0x30548e, 0, 0, 0, 0.1);
        }
        S.nc = null;
        for (let k = 0; k < 14; k++) { // tacın kenarında minik ışık yaprakları
          const a = k / 14 * PI * 2;
          g.ekle(G.kureC, x + Math.cos(a) * 4.1 * s, y + h + Math.sin(a) * 1.6 * s - 0.3, z + 1.9 * s, 0.13, 0.13, 0.08, r[0], r[1], 0, 0, 0, 0.1);
        }
        // sarkan ışık sarmaşıkları
        for (let k = 0; k < 7; k++) {
          const vx = x + (k - 3) * 0.95 * s, vz = z + 1.6 * s, len = ara(2, 4.5) * s, vy = y + h - 0.8 * s;
          g.ekle(G.silA, vx, vy - len / 2, vz, 0.03, len, 0.03, r[0], r[1], 0, 0, 0, -0.2);
          for (let j = 0; j < 4; j++) g.ekle(G.kureC, vx + (j % 2 ? 0.1 : -0.1), vy - len * (0.25 + j * 0.25), vz, 0.12, 0.14, 0.08, r[0], 0xffffff, 0, 0, 0, -0.2);
          H.q(vx, vy - len, vz + 0.1, 0.6, 0.6, r[0], k);
        }
      };
      for (let x = -30; x < hx + 34; x += ara(13, 18)) agac(x, ara(-17, -13), ara(0.85, 1.1));

      // 3) Parlayan kristal öbekleri
      const kristal = (x, z, s, rk) => {
        const y = yerY(x, z), r = IO_RENK[rk], g = GD;
        for (let k = 0; k < 5; k++) {
          const a = (k - 2) * 0.32 + ara(-0.1, 0.1), h = (k === 2 ? 1.6 : ara(0.7, 1.2)) * s;
          g.ekle(G.oct, x + (k - 2) * 0.32 * s, y + h * 0.45, z + ara(-0.2, 0.2), 0.22 * s, h, 0.22 * s, r[0], r[1], 0, ara(0, 1), -a);
        }
        S.ekle(G.kureK, x, y + 0.05, z, 1.0 * s, 0.3 * s, 0.7 * s, 0x2a3050, 0x3e4670);
        H.q(x, y + 0.8 * s, z + 0.3, 1.8 * s, 1.6 * s, r[0], x);
      };
      for (let x = -14; x < hx + 20; x += ara(8, 12)) kristal(x, ara(-11, -5), ara(0.8, 1.3), ['tur', 'mor', 'mav'][(x * 7 | 0) % 3 < 0 ? 0 : (x * 7 | 0) % 3]);
      for (let x = -40; x < hx + 50; x += ara(14, 20)) kristal(x, ara(-36, -26), ara(2, 3), 'mor');

      // 4) Işıklı küçük dere
      const dcx = hx * 0.5, dcz = -7.4;
      const su = suYap(ctx, dcx, dcz, 13, 1.7, 0x2ac8d8, 0x1a5a9a, 0xb8fff8, 0.5);
      ctx.ekle(su.mesh);
      for (let i = 0; i < 40; i++) {
        const a = i / 40 * PI * 2, x = dcx + Math.cos(a) * 13 * ara(0.97, 1.03), z = dcz + Math.sin(a) * 1.7 * ara(0.97, 1.05);
        S.ekle(G.kureK, x, su.y - 0.04, z, ara(0.35, 0.6), ara(0.18, 0.28), ara(0.28, 0.4), 0x2a3256, 0x485484, 0, ara(0, 3), 0);
        if (i % 3 === 0) { GA.ekle(G.kureC, x, su.y + 0.2, z, 0.09, 0.09, 0.09, 0x40e8e0, 0xb0fff8); }
      }
      H.qY(dcx, su.y + 0.03, dcz, 15, 3, 0x0a3a48, 0);

      // 5) Işıklı çiçekler ve otlar (yakın arka, ön, dikey ekranın alt yarısı) — hepsi alçak
      const cicek = (x, z, s, rk) => {
        const y = yerY(x, z), r = IO_RENK[rk], g = GL();
        for (let k = 0; k < 3; k++) {
          const fx = x + (k - 1) * 0.25 * s, fh = (0.35 + (k % 2) * 0.25) * s;
          S.ekle(G.silA3, fx, y + fh / 2, z, 0.015, fh, 0.015, 0x1a4a4a, 0x2e7a72, 0, 0, (k - 1) * 0.2, 0.3);
          g.ekle(G.koni, fx, y + fh + 0.04 * s, z, 0.1 * s, 0.14 * s, 0.1 * s, r[1], r[0], PI, 0, 0, 0.3); // çan çiçeği
        }
        for (let k = 0; k < 4; k++) { const u = k / 3 * 2 - 1; S.ekle(G.bicak, x + u * 0.3 * s, y - 0.02, z + 0.1, 0.12 * s, 0.5 * s, 1, 0x10283a, 0x2a6a78, 0, 0, -u * 0.4, 0.4); }
      };
      for (let x = -14; x < hx + 24; x += ara(1.8, 3.2)) cicek(x, ara(-3.8, -1.4), ara(0.8, 1.2), renkAl(x | 0));
      for (let x = -14; x < hx + 24; x += ara(2.2, 3.6)) cicek(x, ara(1.4, 4), ara(0.7, 1.1), renkAl((x | 0) + 1));
      for (let x = -16; x < hx + 26; x += ara(1.6, 2.6)) cicek(x, ara(4.5, 16), ara(0.9, 1.5), renkAl((x | 0) + 2));
      for (let x = -14; x < hx + 22; x += ara(5, 8)) { // önde yerde soluk ışık havuzları
        const z = ara(5, 14), rk = renkAl(x | 0);
        H.qY(x + 0.4, yerY(x, z) + 0.04, z, 1.8, 1.1, IO_RENK[rk][0], x);
      }
      for (let x = -14; x < hx + 22; x += ara(3, 5)) { // yosunlu kayalar
        const z = ara(4.5, 15), y = yerY(x, z), s = ara(0.3, 0.6);
        S.ekle(G.kureK, x, y + 0.1 * s, z, 1.2 * s, 0.6 * s, 0.9 * s, 0x1e2a48, 0x34406a, 0, ara(0, 3), 0);
        GA.ekle(G.kubbe, x, y + 0.42 * s, z, 0.85 * s, 0.22 * s, 0.6 * s, 0x1a6a70, 0x30a8a0);
      }

      // 6) Bilbo'nun yeri: yumuşak ışıklı yosun minderi + arkasında minik mantar halkası + kristaller
      S.ekle(G.kubbe, hx, -0.02, 0, 2.2, 0.1, 1.3, 0x163a48, 0x24606a);
      for (let k = 0; k < 26; k++) { // yosun minderinde minik ışık benekleri
        const a = k * 2.4, rr = Math.sqrt((k + 0.5) / 26);
        GA.ekle(G.kureC, hx + Math.cos(a) * rr * 2.0, 0.1, Math.sin(a) * rr * 1.15, 0.06, 0.03, 0.06, 0x40e8e0, 0xb0fff8);
      }
      for (let k = 0; k < 9; k++) { // arkasında yarım halka ışıklı taşlar
        const a = PI + k / 8 * PI, mx = hx + Math.cos(a) * 2.6, mz = Math.sin(a) * 1.4 - 0.5, r = IO_RENK[renkAl(k)];
        S.ekle(G.kureK, mx, 0.05, mz, 0.22, 0.12, 0.18, 0x2a3050, 0x3e4670);
        GA.ekle(G.oct, mx, 0.25, mz, 0.08, 0.2, 0.08, r[0], r[1], 0, k, 0);
      }
      kristal(hx + 3.9, -2.2, 0.9, 'tur');
      kristal(hx - 3.9, -2.4, 0.8, 'mor');
      H.qY(hx, 0.05, 0, 3.2, 2.0, 0x1a4a5a, 0);

      ctx.ekle(new T.Mesh(S.geo(), ctx.malz(true, true, 0.3, { emissive: 0x0c1028, emissiveIntensity: 0.6 })));
      const ma = isikMalz(ctx, 0.5, { roughness: 0.55 }), mb = isikMalz(ctx, 0.5, { roughness: 0.55 });
      ctx.ekle(new T.Mesh(GA.geo(), ma)); ctx.ekle(new T.Mesh(GB.geo(), mb));
      ctx.ekle(new T.Mesh(GD.geo(), isikMalz(ctx, 0.3, { roughness: 0.7 })));
      ioKubbe.dispose(); ioKubbe = null;
      const hm = H.mesh(0.45, 0.6, 2.4); if (hm) ctx.ekle(hm);
      ctx.veri.ma = ma; ctx.veri.mb = mb; ctx.veri.hm = hm;

      // 7) Yukarı süzülen ışık tanecikleri (oyun düzleminin gerisinde; sarı değil)
      const N = 110, pm = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false });
      const im = new T.InstancedMesh(G.kureK, pm, N); im.frustumCulled = false; im.renderOrder = 4;
      const tr = [], cc = new T.Color(), pal = [0x60fff0, 0xc8a0ff, 0xff90dc, 0x90c0ff];
      for (let i = 0; i < N; i++) {
        tr.push([ara(-16, hx + 22), ara(-18, -2), ara(0, 1), ara(0.35, 0.8), ara(0.05, 0.11), ara(0, 6.28)]);
        cc.setHex(pal[i % pal.length]); im.setColorAt(i, cc);
      }
      ctx.ekle(im);
      ctx.veri.tane = im; ctx.veri.tr = tr; ctx.veri.o = new T.Object3D();
      DY_EK[33].guncelle(0, 0, ctx);
    },
    guncelle(t, dt, ctx) {
      const v = ctx.veri;
      if (v.ma) { v.ma.emissiveIntensity = 0.48 + 0.16 * Math.sin(t * 1.1); v.mb.emissiveIntensity = 0.48 + 0.16 * Math.sin(t * 1.1 + 2.4); }
      if (v.oyunM) { // oyun mantarları zıp zıp nabız gibi atar; Pırıl yaklaşınca daha da parlar
        const P = ctx.U.uP && ctx.U.uP.value;
        for (let i = 0; i < v.oyunM.length; i++) {
          const o = v.oyunM[i];
          let yak = 0;
          if (P) { const dx = P.x - o.x, dy = P.y - o.y; yak = Math.exp(-(dx * dx + dy * dy) / 30); }
          o.mm.emissiveIntensity = 0.85 + 0.18 * Math.max(0, Math.sin(t * 3.4 + i * 1.3)) + 0.55 * yak;
        }
      }
      const im = v.tane; if (!im) return;
      const o = v.o, Hy = 16;
      for (let i = 0; i < v.tr.length; i++) {
        const p = v.tr[i], f = (p[2] + t * p[3] / Hy) % 1;
        o.position.set(p[0] + Math.sin(t * 0.7 + p[5]) * 0.6, f * Hy, p[1]);
        const k = p[4] * Math.min(1, f * 6) * Math.min(1, (1 - f) * 4) * (0.8 + 0.2 * Math.sin(t * 3 + p[5]));
        o.scale.set(k, k, k);
        o.updateMatrix(); im.setMatrixAt(i, o.matrix);
      }
      im.instanceMatrix.needsUpdate = true;
    }
  };
})();
