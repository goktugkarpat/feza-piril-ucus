/* ortam_h.js — Pırıl'ın Uçuş Okulu: ek ortamlar (u2-ortam-h)
   42 · Origami Bahçesi (bölüm 47) · 43 · Deniz Feneri Koyu (bölüm 48)
   Kalıp: DY_EK[n] = { palet, secenek, yardimci, yardimciKur, kur(ctx), guncelle(t, dt, ctx), sok(ctx) }.
   Tüm sahne nesneleri ctx.ekle(...) içindedir; OG geometrileri yalnız ctx.yapi().ekle(...) ile kopyalanır. */
(function () {
  'use strict';
  window.DY_EK = window.DY_EK || {};
  const PI = Math.PI;

  // ── Ortak şablon geometriler (yalnız ctx.yapi().ekle içine verilir, sahneye doğrudan konmaz) ──
  const OG = {};

  function geoYap(pos) {
    const T = THREE;
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return g;
  }

  function ucgen(pos, a, b, c) {
    pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
  }

  // Verilen dışa dönük referans yönüyle aynı yarı-uzayda normal üreten üçgen
  function ucgenYon(pos, a, b, c, dis) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    if (nx * dis[0] + ny * dis[1] + nz * dis[2] < 0) ucgen(pos, a, c, b);
    else ucgen(pos, a, b, c);
  }

  function dortgenYon(pos, a, b, c, d, dis) {
    ucgenYon(pos, a, b, c, dis);
    ucgenYon(pos, a, c, d, dis);
  }

  // Üçgen prizma: tepe +y, taban y=-0.5, eksen z
  function ogPrizma(T) {
    if (OG.prizma) return OG.prizma;
    const g = new T.CylinderGeometry(1, 1, 1, 3, 1);
    g.rotateX(PI / 2);
    g.rotateZ(PI);
    const ng = g.toNonIndexed();
    ng.computeVertexNormals();
    g.dispose();
    return (OG.prizma = ng);
  }

  // Keskin köşeli origami tepe piramidi (asimetrik kat izli, tabanı y=0, tepesi y=1)
  function ogKatTepe() {
    if (OG.katTepe) return OG.katTepe;
    const pos = [];
    const T0 = [0.06, 1.0, -0.05];
    const P = [[-1.0, 0, 0.55], [0.0, 0, 0.85], [1.0, 0, 0.45], [0.75, 0, -0.65], [-0.8, 0, -0.6]];
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length];
      ucgenYon(pos, a, b, T0, [(a[0] + b[0]) * 0.5, 0.45, (a[2] + b[2]) * 0.5]);
    }
    return (OG.katTepe = geoYap(pos));
  }

  // Katlı origami ağaç katmanı: 6 köşeli kıvrımlı piramit (tabanı y=0, tepesi y=1)
  function ogKatAgac(T) {
    if (OG.katAgac) return OG.katAgac;
    const g = new T.ConeGeometry(1, 1, 6, 1);
    g.translate(0, 0.5, 0);
    const ng = g.toNonIndexed();
    ng.computeVertexNormals();
    g.dispose();
    return (OG.katAgac = ng);
  }

  // 4 kenarlı keskin katlı piramit (tabanı y=0, tepesi y=1)
  function ogKat4(T) {
    if (OG.kat4) return OG.kat4;
    const g = new T.ConeGeometry(1, 1, 4, 1);
    g.translate(0, 0.5, 0);
    const ng = g.toNonIndexed();
    ng.computeVertexNormals();
    g.dispose();
    return (OG.kat4 = ng);
  }

  // Origami fener gövdesi (kıvrımlı 6 yüzlü çift piramit, merkez y=0)
  function ogFener(T) {
    if (OG.fener) return OG.fener;
    const p = [
      new T.Vector2(0.0, -0.58),
      new T.Vector2(0.32, -0.44),
      new T.Vector2(0.54, 0.0),
      new T.Vector2(0.32, 0.44),
      new T.Vector2(0.0, 0.58)
    ];
    const g = new T.LatheGeometry(p, 6);
    const ng = g.toNonIndexed();
    ng.computeVertexNormals();
    g.dispose();
    return (OG.fener = ng);
  }

  // Deniz feneri cam silindiri (merkez 0, yükseklik 1.32)
  function ogCamSil(T) {
    if (OG.camSil) return OG.camSil;
    return (OG.camSil = new T.CylinderGeometry(0.88, 0.88, 1.32, 16, 1));
  }

  // Kâğıt kayık gövdesi (klasik katlanmış origami kayık teknesi: x ±1.72, y -0.06..0.62, z ±0.64)
  function ogKayikGovde() {
    if (OG.kayikGovde) return OG.kayikGovde;
    const pos = [];
    const kSol = [-0.95, -0.06, 0], kSag = [0.95, -0.06, 0];
    const ucSol = [-1.72, 0.62, 0], ucSag = [1.72, 0.62, 0];
    for (const s of [-1, 1]) {
      const mAlt = [0, -0.06, s * 0.34];
      const o1 = [-0.72, 0.42, s * 0.62], o0 = [0, 0.46, s * 0.68], o2 = [0.72, 0.42, s * 0.62];
      const i1 = [-0.62, 0.36, s * 0.42], i0 = [0, 0.38, s * 0.46], i2 = [0.62, 0.36, s * 0.42];
      const d0 = [0, 0.14, s * 0.12];
      const dis = [0, -0.2, s];
      ucgenYon(pos, kSol, mAlt, o1, dis); ucgenYon(pos, mAlt, o0, o1, dis);
      ucgenYon(pos, mAlt, kSag, o2, dis); ucgenYon(pos, mAlt, o2, o0, dis);
      ucgenYon(pos, ucSol, kSol, o1, [-0.5, 0, s]); ucgenYon(pos, kSag, ucSag, o2, [0.5, 0, s]);
      dortgenYon(pos, o1, o0, i0, i1, [0, 1, 0]); dortgenYon(pos, o0, o2, i2, i0, [0, 1, 0]);
      ucgenYon(pos, ucSol, o1, i1, [0, 1, 0]); ucgenYon(pos, o2, ucSag, i2, [0, 1, 0]);
      ucgenYon(pos, ucSol, i1, d0, [0, 1, -s * 0.3]); ucgenYon(pos, i1, i0, d0, [0, 1, -s * 0.3]);
      ucgenYon(pos, i0, i2, d0, [0, 1, -s * 0.3]); ucgenYon(pos, i2, ucSag, d0, [0, 1, -s * 0.3]);
    }
    return (OG.kayikGovde = geoYap(pos));
  }

  // Kâğıt kayığın katlı alt kenar şeridi
  function ogKayikKenar() {
    if (OG.kayikKenar) return OG.kayikKenar;
    const pos = [];
    const kSol = [-0.96, -0.07, 0], kSag = [0.96, -0.07, 0];
    const ucSol = [-1.62, 0.44, 0], ucSag = [1.62, 0.44, 0];
    for (const s of [-1, 1]) {
      const mAlt = [0, -0.07, s * 0.36];
      const k1 = [-0.74, 0.19, s * 0.52], k0 = [0, 0.21, s * 0.56], k2 = [0.74, 0.19, s * 0.52];
      const dis = [0, -0.2, s];
      ucgenYon(pos, kSol, mAlt, k1, dis); ucgenYon(pos, mAlt, k0, k1, dis);
      ucgenYon(pos, mAlt, kSag, k2, dis); ucgenYon(pos, mAlt, k2, k0, dis);
      ucgenYon(pos, ucSol, kSol, k1, [-0.5, 0, s]); ucgenYon(pos, kSag, ucSag, k2, [0.5, 0, s]);
    }
    return (OG.kayikKenar = geoYap(pos));
  }

  // Kâğıt kayığın orta üçgen piramit yelkeni (y=0.14..1.48)
  function ogKayikYelken() {
    if (OG.kayikYelken) return OG.kayikYelken;
    const pos = [];
    const tepe = [0, 1.48, 0];
    const A = [-0.74, 0.16, 0], B = [0, 0.18, 0.34], C = [0.74, 0.16, 0], D = [0, 0.18, -0.34];
    ucgenYon(pos, A, B, tepe, [-0.4, 0.3, 1]);
    ucgenYon(pos, B, C, tepe, [0.4, 0.3, 1]);
    ucgenYon(pos, C, D, tepe, [0.4, 0.3, -1]);
    ucgenYon(pos, D, A, tepe, [-0.4, 0.3, -1]);
    return (OG.kayikYelken = geoYap(pos));
  }

  // 3B origami turna kuşu parçaları: gövde+boyun+kuyruk (|z|<=0.15) + katlı kanatlar (|z|>=0.15)
  // Uçuş yönü +x; kanat menteşe çizgisi |z|=0.15 (shader kanat çırpması burada bükülür)
  function ogTurna() {
    if (OG.turna) return OG.turna;
    const pos = [];
    const ust = [0, 0.28, 0], alt = [0, -0.18, 0], on = [0.46, 0.08, 0], ark = [-0.46, 0.1, 0];
    const sol = [0.02, 0.08, 0.15], sag = [0.02, 0.08, -0.15];
    ucgenYon(pos, ust, sol, on, [1, 1, 1]); ucgenYon(pos, ust, ark, sol, [-1, 1, 1]);
    ucgenYon(pos, ust, on, sag, [1, 1, -1]); ucgenYon(pos, ust, sag, ark, [-1, 1, -1]);
    ucgenYon(pos, alt, on, sol, [1, -1, 1]); ucgenYon(pos, alt, sol, ark, [-1, -1, 1]);
    ucgenYon(pos, alt, sag, on, [1, -1, -1]); ucgenYon(pos, alt, ark, sag, [-1, -1, -1]);
    // İnce boyun, baş ve sivri gaga (+x)
    const b0L = [0.34, 0.06, 0.06], b0R = [0.34, 0.06, -0.06], b0U = [0.46, 0.14, 0];
    const b1L = [0.78, 0.64, 0.035], b1R = [0.78, 0.64, -0.035], b1U = [0.68, 0.68, 0];
    const gaga = [1.06, 0.56, 0];
    dortgenYon(pos, b0L, b0U, b1U, b1L, [-0.4, 0.4, 1]);
    dortgenYon(pos, b0U, b0R, b1R, b1U, [-0.4, 0.4, -1]);
    dortgenYon(pos, b0R, b0L, b1L, b1R, [1, -0.5, 0]);
    ucgenYon(pos, b1L, b1U, gaga, [0.4, 0.5, 1]);
    ucgenYon(pos, b1U, b1R, gaga, [0.4, 0.5, -1]);
    ucgenYon(pos, b1R, b1L, gaga, [0.2, -1, 0]);
    // Yukarı kıvrılan ince origami kuyruk (-x)
    const q0L = [-0.34, 0.08, 0.05], q0R = [-0.34, 0.08, -0.05], q0U = [-0.46, 0.14, 0], qUst = [-0.94, 0.72, 0];
    ucgenYon(pos, q0L, q0U, qUst, [0.4, 0.4, 1]);
    ucgenYon(pos, q0U, q0R, qUst, [0.4, 0.4, -1]);
    ucgenYon(pos, q0R, q0L, qUst, [-1, -0.4, 0]);
    // İki geniş kat izli kanat (|z| >= 0.15)
    for (const s of [-1, 1]) {
      const mOn = [0.3, 0.08, s * 0.15], mArk = [-0.28, 0.08, s * 0.15];
      const kOn = [0.16, 0.2, s * 0.82], kArk = [-0.24, 0.12, s * 0.76], uc = [0.02, 0.14, s * 1.54];
      dortgenYon(pos, mOn, mArk, kArk, kOn, [0, 1, 0]);
      ucgenYon(pos, kOn, kArk, uc, [0, 1, 0]);
    }
    return (OG.turna = geoYap(pos));
  }

  // Küçük yüzsüz origami kurbağa süsü (tabanı y=0, ön +z)
  function ogKurbaga() {
    if (OG.kurbaga) return OG.kurbaga;
    const pos = [];
    const burun = [0, 0.24, 0.55], sirt = [0, 0.42, -0.05], sag = [0.34, 0.14, -0.15], sol = [-0.34, 0.14, -0.15], alt = [0, 0.05, -0.35];
    ucgenYon(pos, sol, sirt, burun, [-1, 1, 0.5]); ucgenYon(pos, sirt, sag, burun, [1, 1, 0.5]);
    ucgenYon(pos, alt, sirt, sol, [-1, 0.5, -1]); ucgenYon(pos, sag, sirt, alt, [1, 0.5, -1]);
    ucgenYon(pos, sol, burun, alt, [0, -1, 0]); ucgenYon(pos, alt, burun, sag, [0, -1, 0]);
    for (const s of [-1, 1]) {
      const a = [s * 0.28, 0.14, -0.2], b = [s * 0.58, 0.34, -0.34], c = [s * 0.48, 0.04, 0.05], d = [s * 0.72, 0.04, -0.45];
      ucgenYon(pos, a, b, c, [s, 0.6, 0.3]); ucgenYon(pos, b, d, c, [s, 0.5, -0.5]);
      const e = [s * 0.22, 0.12, 0.22], f = [s * 0.44, 0.04, 0.46], g = [s * 0.38, 0.04, 0.15];
      ucgenYon(pos, e, f, g, [s, 1, 0.3]);
    }
    return (OG.kurbaga = geoYap(pos));
  }

  // Küçük yüzsüz origami kelebek süsü (4 katlı üçgen kanat, tabanı y=0)
  function ogKelebek() {
    if (OG.kelebek) return OG.kelebek;
    const pos = [];
    const on = [0, 0.06, 0.3], ark = [0, 0.04, -0.28];
    for (const s of [-1, 1]) {
      const oU = [s * 0.62, 0.44, 0.38], oD = [s * 0.52, 0.34, -0.02];
      const aU = [s * 0.44, 0.3, -0.06], aD = [s * 0.34, 0.22, -0.38];
      ucgenYon(pos, ark, on, oU, [0, 1, 0]); ucgenYon(pos, ark, oU, oD, [0, 1, 0]);
      ucgenYon(pos, ark, aU, aD, [0, 1, 0]); ucgenYon(pos, on, aU, ark, [0, 1, 0]);
    }
    return (OG.kelebek = geoYap(pos));
  }

  // Can simidi 1/8 dilimi (yarıçap 1.42, tüp 0.36; dış yarıçap ~1.78)
  function ogSimitDilim(T) {
    if (OG.simitDilim) return OG.simitDilim;
    return (OG.simitDilim = new T.TorusGeometry(1.42, 0.36, 10, 8, PI / 4));
  }

  // Deniz feneri dönen ışık huzmesi konisi: x=0 ince uç (r=0.42), x=1 geniş ağız (r=5.2)
  function ogHuzme(T) {
    if (OG.huzme) return OG.huzme;
    const g = new T.CylinderGeometry(5.2, 0.42, 1, 24, 1, true);
    g.rotateZ(-PI / 2);
    g.translate(0.5, 0, 0);
    return (OG.huzme = g);
  }

  // Tekne gövdesi (kavisli burunlu şirin yelkenli teknesi: x -1.35..1.55, y -0.08..0.46, z ±0.54)
  function ogTekneGovde() {
    if (OG.tekneGovde) return OG.tekneGovde;
    const pos = [];
    const pr = [1.55, 0.46, 0], prAlt = [1.22, -0.06, 0];
    const kicU = [-1.35, 0.4, 0], kicAlt = [-1.18, -0.08, 0];
    for (const s of [-1, 1]) {
      const mU = [0.1, 0.36, s * 0.54], mAlt = [0.08, -0.08, s * 0.3];
      const oU = [0.85, 0.4, s * 0.4], oAlt = [0.75, -0.07, s * 0.2];
      const aU = [-0.75, 0.37, s * 0.46], aAlt = [-0.68, -0.08, s * 0.26];
      const dis = [0, -0.2, s];
      dortgenYon(pos, kicAlt, aAlt, aU, kicU, dis);
      dortgenYon(pos, aAlt, mAlt, mU, aU, dis);
      dortgenYon(pos, mAlt, oAlt, oU, mU, dis);
      dortgenYon(pos, oAlt, prAlt, pr, oU, [0.4, -0.2, s]);
      ucgenYon(pos, [0, 0.36, 0], mU, oU, [0, 1, 0]); ucgenYon(pos, [0, 0.36, 0], oU, pr, [0, 1, 0]);
      ucgenYon(pos, [0, 0.36, 0], aU, mU, [0, 1, 0]); ucgenYon(pos, [0, 0.36, 0], kicU, aU, [0, 1, 0]);
    }
    return (OG.tekneGovde = geoYap(pos));
  }

  // Yelken üçgeni (hafif rüzgârla şişmiş, x 0..1, y 0..1)
  function ogYelken() {
    if (OG.yelken) return OG.yelken;
    const pos = [];
    const A = [0, 0, 0], B = [1.0, 0.05, 0], C = [0.04, 1.0, 0];
    const M = [0.46, 0.38, 0.14];
    ucgenYon(pos, A, B, M, [0, 0, 1]);
    ucgenYon(pos, B, C, M, [0, 0, 1]);
    ucgenYon(pos, C, A, M, [0, 0, 1]);
    return (OG.yelken = geoYap(pos));
  }

  // Kendi renginde ışıldayan malzeme (fenerler & camlar)
  function isikMalz(ctx, guc, pbr) {
    const m = ctx.malz(false, true, 0, Object.assign({ emissive: 0xffffff, emissiveIntensity: guc }, pbr || {}));
    const ob = m.onBeforeCompile;
    m.onBeforeCompile = (sh, r) => {
      ob(sh, r);
      sh.fragmentShader = sh.fragmentShader.replace(
        'vec3 totalEmissiveRadiance = emissive;',
        'vec3 totalEmissiveRadiance = emissive * vColor.rgb;'
      );
    };
    return m;
  }

  // Tek çizimde yumuşak ışık hâleleri
  function haloYap(ctx) {
    const T = ctx.T, pos = [], uv = [], col = [], faz = [], c = new T.Color();
    const ek = (r, f) => {
      c.setHex(r);
      for (let k = 0; k < 6; k++) { col.push(c.r, c.g, c.b); faz.push(f); }
      uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
    };
    return {
      q(x, y, z, w, h, renk, f) {
        pos.push(x - w, y - h, z, x + w, y - h, z, x + w, y + h, z, x - w, y - h, z, x + w, y + h, z, x - w, y + h, z);
        ek(renk, f || 0);
      },
      mesh(guc, us) {
        if (!pos.length) return null;
        const g = new T.BufferGeometry();
        g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
        g.setAttribute('hRenk', new T.Float32BufferAttribute(col, 3));
        g.setAttribute('hFaz', new T.Float32BufferAttribute(faz, 1));
        const m = new T.ShaderMaterial({
          transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, fog: false,
          uniforms: { uT: ctx.U.uT, uG: { value: guc }, uUs: { value: us || 2.1 } },
          vertexShader: 'attribute vec3 hRenk; attribute float hFaz; varying vec2 vU; varying vec3 vR; varying float vF;' +
            'void main(){ vU = uv; vR = hRenk; vF = hFaz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
          fragmentShader: 'varying vec2 vU; varying vec3 vR; varying float vF; uniform float uT, uG, uUs;' +
            'void main(){ float d = length(vU - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), uUs);' +
            ' float ti = 0.86 + 0.14 * sin(uT * 2.2 + vF); gl_FragColor = vec4(vR * a * uG * ti, 1.0); }'
        });
        const me = new T.Mesh(g, m);
        me.renderOrder = 3;
        me.frustumCulled = false;
        return me;
      }
    };
  }

  // Deniz koyu ve zemin örtüşme önleyici yükseklik eğrisi (dunya.js yerY zarfının hemen üstü)
  function koySuY(z) {
    const a = Math.max(0, (-z - 4) / 30);
    return Math.min(6.3, a * Math.min(1, a * 1.5) * 2.56 + 0.14);
  }

  // ════════════════════════════════════════════════════════════════════
  // 42 · ORİGAMİ BAHÇESİ — şeftali çiçeği şafağı, katlı kâğıt bahçe ve turnalar
  // ════════════════════════════════════════════════════════════════════
  DY_EK[42] = {
    palet: {
      ad: 'Origami Bahçesi', gece: 0,
      sisRenk: 0xfadcc8, sisYogun: 0.0036, arka: 0xfce4d4,
      gok: [0xffcfa8, 0xffd8be, 0xf8c4c0, 0xd2dfd8, 0x8eb8c8], gunesPos: [54, 17], gunesRenk: 0xffe0b8,
      ykUst: 0xfff4ea, ykAlt: 0x9aa88a, ykGuc: 1.22, gnRenk: 0xffd8b4, gnGuc: 2.25, arkaRenk: 0xffb8a8, arkaGuc: 0.52,
      dag: [[0xc4cebe, 0xf8dfd0], [0xb0bea8, 0xf2d6c4], [0x9eb098, 0xecd0bc]],
      tepe: [0x9ab888, 0xe8edd0, 0xb8ccb2, 0xf4efe0],
      agac: [[0x6aa678, 0xb6dcb0], [0x7eb886, 0xc8e8be], [0x589468, 0xa2cca0]],
      zemin: [0xa6c88a, 0x769e66, 0xe4e8c8], cimen: [0x6a945c, 0xb6d698, 0xd4e2b4],
      cicek: [[0xff94a8, 0xffd8e0], [0xf47a66, 0xffc4b4], [0xffffff, 0xfff6ee], [0x74c6c2, 0xc4f0ec]],
      sisSerit: [0xffe8d8, 0xf8d4c4], siluet: [0x3a4e3c, 0x5c7258]
    },
    secenek: {
      agacYok: true, tepeYok: true, caliYok: true, degirmenYok: true, kulubeYok: true, onSiluetYok: true,
      tepeCicekYok: true, mantarSusYok: true, citYok: true,
      bulutSay: 6, bulutRenk: [0xf6dfd4, 0xfffaf4],
      dere: true, suRenk: [0x3ca0c4, 0x8ce2f0],
      zeminDesen: 'cim', cimenSik: 0.35,
      ucusanTur: 'cicek', ucusanRenk: [0xffb4c4, 0xffd8dc, 0xfff6f2, 0xffbba8],
      piknikTur: 'piknik', piknikRenk: [0xf07868, 0xfff6ee],
      bayrakRenk: [0xf07868, 0x54b8b4, 0xffb4a2, 0xfff6ee, 0x88c88c],
      salincak: {
        yaprak: [[0x74b484, 0xcce8c4], [0x8ac494, 0xdcf0d4], [0xf494a4, 0xffd8e0]],
        govde: [0xb88c66, 0xead4b8],
        sarmasik: [0x6ca878, 0xb8deb0],
        cicek: [[0xf47a6c, 0xffc4b8], [0xff9eb4, 0xffe0e8], [0x68c4c0, 0xc0f0ec]],
        tacYok: true, tacIsik: 0x3a3228
      }
    },
    yardimci: {
      mantar: { sapka: [0xf06858, 0xffb4a8], govde: [0xf8efe4, 0xffffff], benek: 0xfffaf4 },
      bulut: { alt: 0xf4dfd6, ust: 0xffffff, yanak: 0xff8ea4, emissive: 0x8a6458 },
      nilufer: { yaprak: [0xfff8f2, 0xffffff], cicek: [0xf06858, 0xffa898], halka: 0xb8f4ff, emissive: 0x382a24 },
      ruzgar: { renk: [0x50b8d4, 0xd8f8ff], emissive: 0x3888a8, ok: 0xffffff },
      halka: { renk: [0xf06858, 0xffb4a4], emissive: 0xb84838, cicek: [[0xf06858, 0xffc0b4], [0x58c4c0, 0xc0f4f0], [0xffffff, 0xfff6f0]] },
      baloncuk: { renk: 0xd4f4fc, kenar: 0xffffff },
      esinti: { tur: 'yaprak', renk: 0xffe4dc, taneRenk: [0xff9eb4, 0xffc4b4, 0xffffff] }
    },
    yardimciKur: {
      // Salıncak kemerinde katlanmış origami kâğıt yaprak kümeleri, fenerler ve üçgen bayrak dizisi
      salincak(ctx, o) {
        const { T, G } = ctx, F = ogFener(T), P = ogPrizma(T), K4 = ogKat4(T), sx = o.sapanX, z = o.z;
        const bRenk = [[0xf06858, 0xffb4a4], [0x54b8b4, 0xb8ecea], [0xff9eb4, 0xffdce6], [0xfff8f0, 0xffffff]];
        // Üst taçta katlı kâğıt yaprak piramitleri (pürüzsüz küre yerine keskin origami tacı)
        for (const q of [-1, 1]) {
          for (const [dx, dy, r, c1, c2] of [[0.65, 5.45, 0.95, 0x6aa678, 0xbce2b8], [1.45, 5.05, 0.72, 0x7eb886, 0xd4ecd0], [0.15, 5.85, 0.68, 0xf28ea2, 0xffd8e0]]) {
            o.A.ekle(G.oct, q * (sx + dx), dy, z - 0.35, r, r * 0.85, r * 0.8, c1, c2, 0, q * 0.4, q * 0.15, 0.16);
          }
        }
        // Kemer altında belirgin renkli üçgen origami bayrak dizisi (o.A ile hafif sallanır)
        for (let i = 0; i <= 10; i++) {
          const u = i / 10, bx = -sx * 0.9 + sx * 1.8 * u;
          const by = 4.92 + Math.sin(u * PI) * 0.72;
          const c = bRenk[i % bRenk.length];
          o.A.ekle(G.koni4, bx, by - 0.22, z + 0.36, 0.22, 0.42, 0.09, c[0], c[1], PI, PI / 4, 0, 0.14);
        }
        // Sağ ve sol direk kollarından + kemerden sarkan kıvrımlı origami fenerler
        const fenerler = [
          [-sx - 1.15, 4.18, z + 0.2, 0.86, 0xf47a66, 0xffd2c4],
          [sx + 1.15, 4.18, z + 0.2, 0.86, 0x58c4c0, 0xd0f8f4],
          [-sx * 0.48, 5.22, z + 0.28, 0.62, 0xff9eb4, 0xffe6ee],
          [sx * 0.48, 5.22, z + 0.28, 0.62, 0xffb48a, 0xfff0dc]
        ];
        for (const [fx, fy, fz, sc, c1, c2] of fenerler) {
          o.S.ekle(G.silA3, fx, fy + 0.48 * sc, fz, 0.015, 0.45 * sc, 0.015, 0x8a5e3c, 0xc89a6e);
          o.S.ekle(G.koni4, fx, fy + 0.34 * sc, fz, 0.28 * sc, 0.14 * sc, 0.28 * sc, 0x6a442c, 0xa8784e, 0, PI / 4, 0);
          o.S.ekle(G.koni4, fx, fy - 0.34 * sc, fz, 0.24 * sc, 0.12 * sc, 0.24 * sc, 0x6a442c, 0xa8784e, PI, PI / 4, 0);
          o.FL.ekle(F, fx, fy, fz, 0.52 * sc, 0.62 * sc, 0.52 * sc, c1, c2, 0, PI / 6, 0, -0.06);
          o.S.ekle(G.silA3, fx, fy - 0.48 * sc, fz, 0.025, 0.22 * sc, 0.025, 0xf06858, 0xffb4a4, 0, 0, 0, -0.08);
        }
        // Direk tabanlarında katlı kağıttan küçük origami çiçek/prizma süsü
        for (const q of [-1, 1]) {
          o.S.ekle(P, q * (sx + 1.05), 0.24, z + 0.35, 0.48, 0.42, 0.56, 0x74b484, 0xcce8c4, 0, q * 0.5, 0);
          o.S.ekle(K4, q * (sx + 1.48), 0.18, z + 0.25, 0.34, 0.55, 0.34, 0x6aa678, 0xb8deb0, 0, q * 0.4, 0);
        }
      },
      // Dere üstünde yüzen gülen kâğıt kayık (nilüfer yardımcısı: r≈2)
      nilufer(N, i, ctx) {
        const { T, G } = ctx, S = ctx.yapi();
        const K = ogKayikGovde(), KE = ogKayikKenar(), KY = ogKayikYelken();
        // Altta su üstünde parlayan turkuaz halka
        S.ekle(G.halkaInce, 0, -0.05, 0, 1.82, 1.35, 0.45, 0x7ae6f4, 0xe8fcff, PI / 2, 0, 0);
        // Keskin katlı beyaz-mercan kâğıt kayık gövdesi + kenar şeridi
        S.ekle(K, 0, 0.06, 0, 1.08, 1.08, 1.08, 0xf6ece4, 0xffffff);
        S.ekle(KE, 0, 0.05, 0, 1.09, 1.08, 1.09, 0xe85a4a, 0xffa494);
        // Ortadan yükselen katlı piramit yelken + tepede minik flama
        const yRenk = i % 2 ? [0x3ca8b8, 0xb8f4f8] : [0xf06858, 0xffc8bc];
        S.ekle(KY, 0, 0.08, 0, 1.04, 1.04, 1.04, 0xfff4ea, 0xffffff);
        S.ekle(KY, 0, 0.88, 0, 0.42, 0.42, 0.42, yRenk[0], yRenk[1]);
        S.ekle(G.koni4, 0.14, 1.56, 0, 0.09, 0.26, 0.04, yRenk[0], yRenk[1], 0, 0, -PI / 2);
        // Ön (+z) burunda sevimli gülen yüz: iri parlak gözler, pembe yanaklar, tatlı gülümseme
        for (const q of [-1, 1]) {
          S.ekle(G.kureK, q * 0.28, 0.34, 0.62, 0.09, 0.12, 0.05, 0x222638, 0x323850);
          S.ekle(G.kureK, q * 0.28 - 0.025, 0.38, 0.665, 0.032, 0.035, 0.02, 0xffffff, 0xffffff);
          S.ekle(G.kureK, q * 0.52, 0.24, 0.57, 0.11, 0.065, 0.04, 0xff829c, 0xffb4c4);
        }
        for (let k = 0; k < 7; k++) {
          const a = (k - 3) * 0.22;
          S.ekle(G.kureK, Math.sin(a) * 0.18, 0.22 - Math.cos(a) * 0.05 + 0.02, 0.65, 0.03, 0.026, 0.02, 0x222638, 0x222638);
        }
        const m = ctx.malz(true, true, 0.35, { roughness: 0.5, emissive: 0x382824, emissiveIntensity: 0.22, side: T.DoubleSide });
        m.flatShading = true;
        return new T.Mesh(S.geo(), m);
      }
    },
    kur(ctx) {
      const { T, G, hx, yerY, tepeY, R, ara } = ctx;
      const S = ctx.yapi(); // katlı origami tepeler, ağaçlar, köprü, direkler, uzak kurbağa/kelebek (flatShading)
      const L = ctx.yapi(); // parlayan asılı kâğıt fenerler ve kayık alt halkaları
      const H = haloYap(ctx);
      const PR = ogPrizma(T), KT = ogKatTepe(), KA = ogKatAgac(T), K4 = ogKat4(T), FN = ogFener(T);
      const KB = ogKurbaga(), KL = ogKelebek();
      const xa = -42, xb = hx + 46;

      const dereX0 = ctx.dere.var ? ctx.dere.x0 : 6;
      const dereX1 = ctx.dere.var ? ctx.dere.x1 : Math.max(36, hx - 5);
      const yasakDere = (x, z) => x > dereX0 - 1.5 && x < dereX1 + 1.5 && z > -2.8 && z < 3.0;
      const yasakOyun = (x, z) => (Math.abs(x) < 5.2 && z > -4.6) || (Math.abs(x - hx) < 5.6 && z > -5.2);

      // 1) Katlı origami basamaklı tepeler ve geometrik kâğıt sırtlar (z: -16 .. -68)
      const tepeTon = [
        [0x86ac78, 0xdbe6be], [0x98bc86, 0xecf0ce], [0x749c6e, 0xcadac0], [0xb0c89c, 0xf2f0dc]
      ];
      const basamakTepe = (x, z, w, h, sira) => {
        const y0 = yerY(x, z) * 0.45 - 0.3;
        const c = tepeTon[sira % tepeTon.length];
        S.ekle(KT, x, y0, z, w, h, w * 0.62, c[0], c[1], 0, (sira % 3 - 1) * 0.25, 0);
        S.ekle(PR, x + w * 0.44, y0 + h * 0.26, z + 0.9, w * 0.58, h * 0.58, w * 0.48, tepeTon[(sira + 1) % 4][0], tepeTon[(sira + 1) % 4][1], 0, 0.2, -0.08);
      };
      for (let i = 0; i < 20; i++) {
        const x = -64 + i * ((hx + 132) / 19) + ara(-2.5, 2.5);
        const z = i % 3 === 0 ? ara(-22, -32) : (i % 3 === 1 ? ara(-36, -48) : ara(-50, -64));
        const h = z < -48 ? ara(8.5, 14.5) : (z < -34 ? ara(5.5, 9.5) : ara(3.5, 6.2));
        const w = z < -48 ? ara(12, 19) : ara(6.5, 11.5);
        basamakTepe(x, z, w, h, i);
      }
      // Uzak origami bahçe köşkü (katlı çatı ve sütunlar, z: -28)
      {
        const px = Math.min(hx * 0.42, 26), pz = -28, py = yerY(px, pz) + 0.2;
        S.ekle(KT, px, py - 0.6, pz - 0.8, 6.5, 2.4, 4.2, 0x86ac78, 0xdbe6be);
        S.ekle(G.kutu, px, py + 1.1, pz, 4.2, 0.35, 2.8, 0xead8c4, 0xfff6ea);
        for (const q of [-1.6, 1.6]) for (const qz of [-0.9, 0.9]) {
          S.ekle(G.kutu, px + q, py + 2.35, pz + qz, 0.22, 2.2, 0.22, 0xd85a4a, 0xff9888);
        }
        S.ekle(PR, px, py + 3.95, pz, 3.2, 1.35, 3.4, 0xe86858, 0xffb8a8);
        S.ekle(PR, px, py + 4.95, pz, 2.1, 0.95, 2.3, 0x54b8b4, 0xc8f4f0);
      }
      // Yüzsüz katlı origami bahçe çalıları (küçük küre çalı yerine keskin oktahedron kümeleri)
      for (let i = 0; i < 16; i++) {
        const bx = ara(-28, hx + 32), bz = ara(-8, -24);
        if (yasakOyun(bx, bz)) continue;
        const by = yerY(bx, bz), sc = ara(0.65, 1.15), c = tepeTon[i % 4];
        S.ekle(G.oct, bx, by + 0.35 * sc, bz, 0.95 * sc, 0.65 * sc, 0.8 * sc, c[0], c[1], 0, i * 0.6, 0);
        S.ekle(G.oct, bx + 0.55 * sc, by + 0.24 * sc, bz + 0.15 * sc, 0.65 * sc, 0.45 * sc, 0.55 * sc, c[0], c[1], 0, i * 1.1, 0);
      }

      // Dere kıyısı boyunca basamaklı origami teras taşları + minik kâğıt köprü kenarı
      for (let x = dereX0 - 2; x <= dereX1 + 2; x += ara(2.1, 3.2)) {
        for (const qz of [-1, 1]) {
          const pz = qz * ara(2.25, 2.75), py = yerY(x, pz);
          const sc = ara(0.45, 0.82), tc = tepeTon[Math.floor(Math.abs(x)) % 4];
          S.ekle(PR, x, py + 0.08 * sc, pz, sc * 1.15, sc * 0.34, sc * 0.72, tc[0], tc[1], 0, ara(-0.35, 0.35), 0);
        }
      }
      // Dere kenarındaki nilüfer kâğıt kayıklarının altında ekstra parlak turkuaz halka
      (ctx.bolum && Array.isArray(ctx.bolum.niluferler) ? ctx.bolum.niluferler : []).forEach((N) => {
        if (!N) return;
        const sc = (N.r || 1.8) / 1.8;
        L.ekle(G.halkaInce, N.x, 0.06, 0, 2.15 * sc, 1.55 * sc, 0.3, 0x8ef4ff, 0xffffff, PI / 2, 0, 0);
      });

      // 2) Katlı geometrik origami çam & selvi ağaçları (flatShading: true)
      const camTon = [[0x5e9c6e, 0xaad8a4], [0x6ead78, 0xc2e6b6], [0x4c8860, 0x94c692]];
      const cicekCam = [0xf28ea2, 0xffd8e0];
      const origamiCam = (x, z, k, tur) => {
        const y = z < -36 ? Math.max(yerY(x, z), tepeY(x, z) - 0.3) : yerY(x, z);
        const c = camTon[Math.floor(Math.abs(x * 3 + z)) % camTon.length];
        if (tur === 'selvi') {
          // İnce katlı origami selvi (gerilmiş oktahedron + 4 yüzlü taç)
          S.ekle(K4, x, y + 0.5 * k, z, 0.22 * k, 1.1 * k, 0.22 * k, 0x7c5438, 0xb8885e, 0, PI / 4, 0);
          S.ekle(G.oct, x, y + 2.4 * k, z, 0.72 * k, 1.65 * k, 0.72 * k, c[0], c[1], 0, 0.35, 0, 0.18 * k);
          S.ekle(G.oct, x, y + 4.15 * k, z, 0.52 * k, 1.35 * k, 0.52 * k, c[1], 0xeaf4d8, 0, 0.75, 0, 0.26 * k);
          S.ekle(K4, x, y + 4.95 * k, z, 0.36 * k, 0.9 * k, 0.36 * k, c[1], 0xffffff, 0, 0.2, 0, 0.3 * k);
          return;
        }
        // Katmanlı kâğıt çam / origami kiraz ağacı
        S.ekle(K4, x, y + 0.45 * k, z, 0.24 * k, 1.0 * k, 0.24 * k, 0x7c5438, 0xb8885e, 0, PI / 4, 0);
        const kat = 3 + (Math.floor(k * 2) % 2);
        const pembeMi = tur === 'kiraz';
        for (let i = 0; i < kat; i++) {
          const r = (1.18 - i * 0.24) * k, h = (1.38 - i * 0.16) * k, yy = y + (0.75 + i * 0.88) * k;
          const rk = pembeMi ? cicekCam : c;
          const geo = i % 2 === 0 ? KA : K4;
          S.ekle(geo, x, yy, z, r, h, r, rk[0], rk[1], 0, i * 0.55, 0, 0.14 * (i + 1) * k);
        }
      };

      const agacYer = [
        [-14, -7.5, 1.15, 'cam'], [-22, -12, 1.35, 'selvi'], [-8, -11, 1.05, 'kiraz'],
        [-30, -18, 1.4, 'cam'], [12, -13, 1.1, 'selvi'], [20, -11, 1.25, 'cam'],
        [29, -15, 1.15, 'kiraz'], [38, -12, 1.2, 'selvi'], [hx - 6, -13, 1.1, 'cam'],
        [hx + 10, -9, 1.25, 'kiraz'], [hx + 17, -14, 1.4, 'selvi'], [hx + 25, -11, 1.2, 'cam']
      ];
      for (const [ax, az, ak, at] of agacYer) origamiCam(ax, az, ak, at);
      for (let i = 0; i < 20; i++) {
        const ax = ara(xa, xb), az = ara(-18, -38);
        if (yasakOyun(ax, az)) continue;
        origamiCam(ax, az, ara(0.95, 1.55), i % 4 === 0 ? 'kiraz' : (i % 2 ? 'selvi' : 'cam'));
      }

      // 3) Işıldayan asılı kâğıt fenerler (z: -5 .. -12) — kemerli direkler + sıcak parlayan origami fenerler
      const fenerRenk = [[0xf06858, 0xffb8a4], [0x58c4c0, 0xc8f8f4], [0xff9eb4, 0xffe2ea], [0xffa878, 0xffe8d0]];
      const fenerDirek = (fx, fz, h, yon, fi) => {
        const y0 = yerY(fx, fz);
        const c = fenerRenk[fi % fenerRenk.length];
        S.ekle(G.kutu, fx, y0 + h * 0.5, fz, 0.12, h, 0.12, 0x7c5438, 0xb8885e);
        S.ekle(G.kutu, fx + yon * 0.5, y0 + h - 0.12, fz, 1.1, 0.1, 0.1, 0x7c5438, 0xb8885e);
        S.ekle(K4, fx, y0 + h + 0.08, fz, 0.14, 0.2, 0.14, 0xf06858, 0xffb4a4, 0, PI / 4, 0);
        const lx = fx + yon * 0.88, ly = y0 + h - 0.65;
        S.ekle(G.silA3, lx, ly + 0.42, fz, 0.014, 0.38, 0.014, 0x5a3a24, 0x8a5e3c);
        S.ekle(K4, lx, ly + 0.28, fz, 0.24, 0.12, 0.24, 0x5a3a24, 0x9a6c48, 0, PI / 4, 0);
        S.ekle(K4, lx, ly - 0.28, fz, 0.2, 0.1, 0.2, 0x5a3a24, 0x9a6c48, PI, PI / 4, 0);
        L.ekle(FN, lx, ly, fz, 0.44, 0.52, 0.44, c[0], c[1], 0, fi * 0.5, 0, -0.06);
        S.ekle(G.silA3, lx, ly - 0.42, fz, 0.02, 0.2, 0.02, c[0], c[1], 0, 0, 0, -0.08);
        H.q(lx, ly, fz + 0.25, 1.35, 1.35, c[0], fx);
        H.q(lx, ly, fz + 0.28, 0.58, 0.58, c[1], fx);
      };
      const fenerSay = 10;
      for (let i = 0; i < fenerSay; i++) {
        const fx = -16 + i * ((hx + 34) / (fenerSay - 1)) + ara(-1.2, 1.2);
        const fz = -5.4 - (i % 4) * 1.9; // -5.4 .. -11.1 (z: -5..-12 aralığında)
        if (Math.abs(fx) < 4.5 || Math.abs(fx - hx) < 4.5) continue;
        fenerDirek(fx, fz, ara(2.9, 3.8), i % 2 ? 1 : -1, i);
      }

      // 4) Küçük yüzsüz süs origami kurbağalar & kelebekler uzak arka katmanda (z <= -6)
      const kurbRenk = [[0x3e9a64, 0x98dca4], [0x48a87e, 0xace8c0], [0x34885a, 0x86c894]];
      for (let i = 0; i < 10; i++) {
        const kx = -14 + i * ((hx + 30) / 9) + ara(-1.2, 1.2);
        const kz = -6.4 - (i % 3) * 2.1; // kesinlikle z <= -6
        const ky = yerY(kx, kz), sc = ara(0.46, 0.58), c = kurbRenk[i % 3];
        // Altına küçük origami kâğıt nilüfer altlığı + yüzsüz katlı kurbağa
        S.ekle(G.kureK, kx, ky + 0.05, kz, 0.6 * sc, 0.05, 0.52 * sc, 0x5aa06a, 0xa4dab0, 0, i, 0);
        S.ekle(KB, kx, ky + 0.06, kz, sc, sc, sc, c[0], c[1], 0, (i % 2 ? 0.5 : -0.5), 0);
      }
      const kelRenk = [[0xe85a4a, 0xffb4a8], [0x3ca8b4, 0xb8f4f4], [0xf47a98, 0xffd4e0], [0xf49468, 0xffe4cc]];
      for (let i = 0; i < 12; i++) {
        const kx = -18 + i * ((hx + 36) / 11) + ara(-1.2, 1.2);
        const kz = -6.6 - (i % 4) * 1.6; // kesinlikle z <= -6
        const ky = yerY(kx, kz), sapH = ara(0.65, 1.15), sc = ara(0.44, 0.58), c = kelRenk[i % 4];
        S.ekle(G.silA3, kx, ky + sapH * 0.5, kz, 0.018, sapH, 0.018, 0x548852, 0x9ac488);
        S.ekle(KL, kx, ky + sapH, kz, sc, sc, sc, c[0], c[1], 0.25, ara(-0.8, 0.8), ara(-0.2, 0.2), -0.35);
      }

      // Katlı kâğıt ön plân tepeleri (pürüzsüz onSiluet yerine keskin origami kenar katmanları)
      for (let i = 0; i < 24; i++) {
        const x = -40 + i * ((hx + 82) / 23) + ara(-1.5, 1.5), z = ara(17.5, 20.5), sc = ara(0.95, 1.55), c = tepeTon[i % 4];
        S.ekle(KT, x, -0.45, z, sc * 1.9, sc * 1.15, sc * 1.1, c[0], c[1], 0, i * 0.55, 0);
      }

      const sMat = ctx.malz(true, true, 0.22, { roughness: 0.72, side: T.DoubleSide });
      sMat.flatShading = true;
      const sm = new T.Mesh(S.geo(), sMat);
      sm.receiveShadow = true;
      ctx.ekle(sm);

      const lg = L.geo();
      if (lg.attributes.position.count) {
        const lMat = isikMalz(ctx, 0.85, { roughness: 0.35 });
        lMat.flatShading = true;
        ctx.ekle(new T.Mesh(lg, lMat));
      } else lg.dispose();

      const hm = H.mesh(0.44, 2.1);
      if (hm) ctx.ekle(hm);

      // 5) Şeftali gökyüzünde kanat çırparak süzülen 3B origami turnalar (z: -12 .. -45)
      const TGeo = ogTurna(), TY = ctx.yapi();
      TY.ekle(TGeo, 0, 0, 0, 1, 1, 1, 0xe4ddd4, 0xffffff);
      const tMat = new T.MeshStandardMaterial({
        vertexColors: true, roughness: 0.48, metalness: 0.02,
        emissive: 0x3a2a24, emissiveIntensity: 0.28,
        flatShading: true, side: T.DoubleSide
      });
      tMat.onBeforeCompile = (sh) => {
        sh.uniforms.uT = ctx.U.uT;
        sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>',
          '#include <begin_vertex>\nfloat trH = max(0.0, abs(position.z) - 0.15);\n' +
          'float trF = sin(uT * 4.4 + float(gl_InstanceID) * 1.47);\n' +
          'transformed.y += trH * trF * 0.62;\n' +
          'transformed.z -= sign(position.z) * trH * (1.0 - cos(trF * 0.52)) * 0.35;'
        );
      };
      const turnaN = 14;
      const turnaIm = new T.InstancedMesh(TY.geo(), tMat, turnaN);
      turnaIm.frustumCulled = false;
      const tRenk = [0xffffff, 0xffb4a4, 0xffcdd6, 0x9ce2d6, 0xffe6d8, 0x8cd8e6];
      const tBilgi = [];
      for (let i = 0; i < turnaN; i++) {
        turnaIm.setColorAt(i, new T.Color(tRenk[i % tRenk.length]));
        const z = -12.5 - (i / (turnaN - 1)) * 31.5; // -12.5 .. -44 (z: -12..-45)
        const x0 = -34 + i * ((hx + 68) / turnaN);
        const y0 = 14.0 + (i % 4) * 3.2 + ara(-0.5, 0.8);
        const sc = 1.25 + (i % 3) * 0.34;
        const hiz = 2.1 + (i % 4) * 0.45;
        const yon = i % 3 === 2 ? -1 : 1;
        tBilgi.push({ x0, y0, z, sc, hiz, yon, faz: i * 1.37 });
      }
      if (turnaIm.instanceColor) turnaIm.instanceColor.needsUpdate = true;
      ctx.ekle(turnaIm);
      ctx.veri.turna = { im: turnaIm, liste: tBilgi, o: new T.Object3D(), xa: -46, xb: hx + 50 };

      DY_EK[42].guncelle(0, 0, ctx);
    },
    guncelle(t, dt, ctx) {
      const tr = ctx.veri && ctx.veri.turna;
      if (!tr) return;
      const { im, liste, o, xa, xb } = tr;
      const araX = xb - xa;
      for (let i = 0; i < liste.length; i++) {
        const b = liste[i];
        const raw = ((b.x0 - xa + b.yon * t * b.hiz) % araX + araX) % araX;
        const x = xa + raw;
        const dalga = Math.sin(t * 0.85 + b.faz);
        const y = b.y0 + dalga * 1.15;
        const egim = Math.cos(t * 0.85 + b.faz) * 0.14;
        o.position.set(x, y, b.z);
        o.rotation.set(Math.sin(t * 0.6 + b.faz) * 0.08, b.yon > 0 ? 0.14 : PI - 0.14, egim);
        o.scale.setScalar(b.sc);
        o.updateMatrix();
        im.setMatrixAt(i, o.matrix);
      }
      im.instanceMatrix.needsUpdate = true;
    },
    sok(ctx) {
      if (ctx && ctx.veri) ctx.veri.turna = null;
    }
  };

  // ════════════════════════════════════════════════════════════════════
  // 43 · DENİZ FENERİ KOYU — altın ikindi kıyısı, çizgili deniz feneri ve yelkenliler
  // ════════════════════════════════════════════════════════════════════
  DY_EK[43] = {
    palet: {
      ad: 'Deniz Feneri Koyu', gece: 0,
      sisRenk: 0xf6dfc2, sisYogun: 0.0032, arka: 0xf4dec0,
      gok: [0xffdca8, 0xffd6a6, 0x9cd6f0, 0x5aaae0, 0x2c78c8], gunesPos: [56, 22], gunesRenk: 0xffe6b0,
      ykUst: 0xeef8ff, ykAlt: 0xb88c68, ykGuc: 1.22, gnRenk: 0xffe2ae, gnGuc: 2.3, arkaRenk: 0xffb884, arkaGuc: 0.52,
      dag: [[0x8ab8d0, 0xf2dcc2], [0x76a6c0, 0xebd2b6], [0x6494b0, 0xe4c8aa]],
      tepe: [0x9e5034, 0x5a884c, 0x8a4e36, 0x729c64],
      agac: [[0x2e6e48, 0x5da46a], [0x387c50, 0x6cb474], [0x265e3e, 0x4e905a]],
      zemin: [0xeed2a2, 0xc8a472, 0xf6e2b8], cimen: [0x6a8e48, 0xa8be6c, 0xc8cc80],
      cicek: [[0xe85040, 0xff9888], [0xf47a58, 0xffbca4], [0xffffff, 0xfff8f0], [0x2c82c9, 0x84c4f4]],
      sisSerit: [0xfff0dc, 0xf4d8ba], siluet: [0x3e2a1c, 0x62442e]
    },
    secenek: {
      agacTur: 'selvi', caliYok: true, bulutSay: 8, bulutRenk: [0xfce6d2, 0xfffcf6],
      deniz: [0x1c78b8, 0x6cd4ec], dere: true, suRenk: [0x1c7cb8, 0x6cd4ec],
      zeminDesen: 'kum', cimenSik: 0.25,
      degirmenYok: true, kulubeYok: true,
      bayrakRenk: [0xe85040, 0xffffff, 0x2c82c9],
      piknikTur: 'piknik', piknikRenk: [0x2c82c9, 0xfff8ee],
      ucusanTur: 'yaprak', ucusanRenk: [0xfff8f0, 0xffe4cc, 0xc8ecff],
      salincak: {
        govde: [0x825838, 0xc49264],
        tacYok: true, sarmasikYok: true, cicekYok: true, kusYok: true,
        tacIsik: 0x3a2a1e
      }
    },
    yardimci: {
      mantar: { sapka: [0xe85040, 0xff9a8a], govde: [0xf8efe4, 0xffffff], benek: 0xffffff },
      bulut: { alt: 0xfce6d2, ust: 0xffffff, yanak: 0xff8c84, emissive: 0x8a6450 },
      nilufer: { yaprak: [0xe85040, 0xffffff], cicek: [0xffffff, 0xfff6ee], halka: 0x9ef0ff, emissive: 0x30201c },
      ruzgar: { renk: [0x2c82c9, 0xb8ecff], emissive: 0x1c62a0, ok: 0xffffff },
      halka: { renk: [0xe85040, 0xffa494], emissive: 0xb83828, cicek: [[0xe85040, 0xffb0a4], [0x2c82c9, 0x9cd8ff], [0xffffff, 0xfff6f0]] },
      baloncuk: { renk: 0xd0f4ff, kenar: 0xffffff },
      esinti: { tur: 'yaprak', renk: 0xfff0e4, taneRenk: [0xffffff, 0xc8ecff, 0xffe0cc] }
    },
    yardimciKur: {
      // Salıncakta halat babaları (ip sarmalları) ve üçgen denizci bayrak süsleri
      salincak(ctx, o) {
        const { G } = ctx, sx = o.sapanX, z = o.z;
        const bRenk = [[0xe85040, 0xff988c], [0xfff8f0, 0xffffff], [0x2c82c9, 0x84c4f4]];
        // Kemerde sallanan renkli denizci bayrakları (kırmızı-beyaz-mavi)
        for (let i = 0; i <= 10; i++) {
          const u = i / 10, bx = -sx * 0.92 + sx * 1.84 * u;
          const by = 4.94 + Math.sin(u * PI) * 0.72;
          const c = bRenk[i % 3];
          o.A.ekle(G.koni4, bx, by - 0.19, z + 0.28, 0.19, 0.36, 0.08, c[0], c[1], PI, PI / 4, 0, 0.12);
        }
        // Direk tepelerinde ahşap denizci başlıkları + pirinç topuz
        for (const q of [-1, 1]) {
          o.S.ekle(G.sil, q * sx, 4.92, z, 0.26, 0.2, 0.26, 0x6a462c, 0xa8764c);
          o.S.ekle(G.kureO, q * sx, 5.14, z, 0.16, 0.16, 0.16, 0xd8a23c, 0xffe498);
          // Direk yanlarında halat sarılı ahşap iskele babaları (bollard)
          const bx = q * (sx + 1.05), bz = z + 0.45;
          o.S.ekle(G.sil, bx, 0.52, bz, 0.24, 1.04, 0.24, 0x6e4a2e, 0xa47850);
          o.S.ekle(G.sil, bx, 1.06, bz, 0.3, 0.1, 0.3, 0x5c3c24, 0x906640);
          for (let r = 0; r < 3; r++) {
            o.S.ekle(G.halka, bx, 0.36 + r * 0.16, bz, 0.28, 0.28, 0.44, 0xc8a470, 0xf0dcba, PI / 2, 0, 0);
          }
          // Direğe bağlanan sarkık kendir halat eğrisi
          for (let s = 0; s < 6; s++) {
            const u = (s + 0.5) / 6;
            const hx = bx + (q * sx - bx) * u, hy = 0.85 + u * 0.65 - Math.sin(u * PI) * 0.22;
            o.S.ekle(G.sil, hx, hy, (bz + z) * 0.5, 0.038, 0.28, 0.038, 0xc8a470, 0xf0dcba, 0, 0, q * 0.72);
          }
        }
      },
      // Koy suyunda yüzen kırmızı-beyaz çizgili can simidi sal ve gülümseyen fener direği (r≈2)
      nilufer(N, i, ctx) {
        const { T, G } = ctx, S = ctx.yapi(), D = ogSimitDilim(T);
        // Altta koy suyu ışıltı halkası
        S.ekle(G.halkaInce, 0, -0.04, 0, 1.9, 1.48, 0.45, 0x7ae6f8, 0xe8fcff, PI / 2, 0, 0);
        // Kırmızı-beyaz 8 dilimli can simidi halkası
        for (let k = 0; k < 8; k++) {
          const c = k % 2 ? [0xf6ece4, 0xffffff] : [0xe03e34, 0xff7060];
          S.ekle(D, 0, 0.04, 0, 1, 0.86, 1, c[0], c[1], PI / 2, 0, k * PI / 4);
        }
        // Simidin etrafında 4 adet krem kendir tutma halatı düğümü
        for (let k = 0; k < 4; k++) {
          const a = k * PI / 2 + PI / 4;
          S.ekle(G.kureK, Math.cos(a) * 1.44, 0.16, Math.sin(a) * 1.44, 0.16, 0.26, 0.16, 0xd4b280, 0xf4e4c4, 0, -a, 0);
        }
        // Ortada eskitilmiş ahşap sal tahtaları (Pırıl'ın zıplayacağı sağlam yüzey)
        for (let t = -2; t <= 2; t++) {
          S.ekle(G.kutu, 0, 0.08, t * 0.34, 2.15 - Math.abs(t) * 0.22, 0.1, 0.28, 0x865834, 0xc48e5a);
        }
        // Gülümseyen şamandıra / fener direği (arka-orta, +z'ye güler)
        const dz = -0.35;
        S.ekle(G.kule, 0, 0.46, dz, 0.46, 0.72, 0.46, 0xe8483c, 0xff9a8a);
        S.ekle(G.sil, 0, 0.86, dz, 0.44, 0.14, 0.44, 0xf4ece4, 0xffffff);
        S.ekle(G.sil, 0, 1.2, dz, 0.26, 0.46, 0.26, 0xffc864, 0xfff4c0);
        S.ekle(G.koni, 0, 1.56, dz, 0.38, 0.28, 0.38, 0x24466c, 0x4878a8);
        S.ekle(G.kureK, 0, 1.72, dz, 0.07, 0.07, 0.07, 0xffe498, 0xffffff);
        // Ön yüzde tatlı gözler, yanaklar ve gülümseme
        for (const q of [-1, 1]) {
          S.ekle(G.kureK, q * 0.18, 0.56, dz + 0.44, 0.068, 0.09, 0.04, 0x202438, 0x2e3450);
          S.ekle(G.kureK, q * 0.18 - 0.02, 0.59, dz + 0.475, 0.024, 0.028, 0.015, 0xffffff, 0xffffff);
          S.ekle(G.kureK, q * 0.33, 0.44, dz + 0.38, 0.085, 0.05, 0.035, 0xff829c, 0xffb4c4);
        }
        for (let k = 0; k < 7; k++) {
          const a = (k - 3) * 0.22;
          S.ekle(G.kureK, Math.sin(a) * 0.13, 0.42 - Math.cos(a) * 0.035 + 0.015, dz + 0.47, 0.024, 0.022, 0.018, 0x202438, 0x202438);
        }
        return new T.Mesh(S.geo(), ctx.malz(true, true, 0.35, { roughness: 0.45, emissive: 0x382018, emissiveIntensity: 0.2 }));
      }
    },
    kur(ctx) {
      const { T, G, hx, yerY, tepeY, R, ara } = ctx;
      const S = ctx.yapi(); // kayalık burun, terakota falezler, çizgili deniz feneri, iskele, sahil süsleri
      const L = ctx.yapi(); // sıcak yanan fener cam özü, bekçi kulübesi penceresi, iskele feneri
      const PR = ogPrizma(T), TG = ogTekneGovde(), YL = ogYelken(), HZ = ogHuzme(T);
      const dereX0 = ctx.dere.var ? ctx.dere.x0 : 6;
      const dereX1 = ctx.dere.var ? ctx.dere.x1 : Math.max(36, hx - 5);

      // 1) Kıyı koyu suyu (z: -14 .. -145, SE.deniz ile açık deniz ufkuna kesintisiz uzanır)
      {
        const bg = new T.PlaneGeometry(520, 134, 72, 36);
        bg.rotateX(-PI / 2);
        bg.translate(25, 0, -80); // z: -13 .. -147
        const bp = bg.attributes.position;
        for (let i = 0; i < bp.count; i++) bp.setY(i, koySuY(bp.getZ(i)));
        bg.computeVertexNormals();
        const bm = new T.ShaderMaterial({
          transparent: true, depthWrite: true, fog: false,
          uniforms: { uT: ctx.U.uT },
          vertexShader: 'varying vec3 vW; void main(){ vW = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vW,1.0); }',
          fragmentShader: [
            'varying vec3 vW; uniform float uT;',
            'void main(){',
            ' float kz = -15.4 + sin(vW.x * 0.14 + uT * 0.45) * 0.85 + sin(uT * 0.85) * 0.45;',
            ' float d = clamp((-vW.z - 15.0) / 115.0, 0.0, 1.0);',
            ' vec3 sig = vec3(0.424, 0.831, 0.925), derin = vec3(0.110, 0.486, 0.722), ufuk = vec3(0.32, 0.68, 0.88);',
            ' vec3 c = mix(sig, derin, smoothstep(0.0, 0.35, d));',
            ' c = mix(c, ufuk, smoothstep(0.55, 1.0, d) * 0.5);',
            ' float dal = 0.5 + 0.5 * sin(vW.z * 1.45 - uT * 1.3 + sin(vW.x * 0.25 + uT * 0.5) * 1.4);',
            ' c += vec3(0.12, 0.22, 0.24) * smoothstep(0.7, 1.0, dal) * (1.0 - d * 0.6);',
            ' float par = pow(max(0.0, sin(vW.x * 2.1 + uT * 1.9 + sin(vW.z * 0.8) * 1.6) * sin(vW.z * 2.6 - uT * 1.4)), 10.0);',
            ' c += vec3(1.0, 0.94, 0.78) * par * 0.6;',
            ' float kopuk = smoothstep(0.75, 0.0, abs(vW.z - kz)) + 0.45 * smoothstep(0.45, 0.0, abs(vW.z - kz + 1.4));',
            ' c = mix(c, vec3(0.98, 0.99, 1.0), clamp(kopuk, 0.0, 1.0) * 0.88);',
            ' float onKenar = smoothstep(kz + 0.5, kz - 0.6, vW.z);',
            ' float arkaGecis = smoothstep(-146.0, -132.0, vW.z);',
            ' float a = max(onKenar * 0.95, clamp(kopuk, 0.0, 1.0) * 0.85) * arkaGecis;',
            ' if (a < 0.01) discard;',
            ' gl_FragColor = vec4(c, a);',
            '}'
          ].join('\n')
        });
        const koyMesh = new T.Mesh(bg, bm);
        koyMesh.renderOrder = 1;
        koyMesh.frustumCulled = false;
        ctx.ekle(koyMesh);
      }

      // 2) Koyu çevreleyen sıcak terakota falezleri (sol/sağ burunlar ve koy adalarının kayalık ön yüzleri)
      const falezTon = [[0xb45c3c, 0xe89c6c], [0xc46c44, 0xf0b280], [0x9e4c34, 0xd8885c]];
      const falezKaya = (x, z, w, h, d, idx) => {
        const y0 = Math.max(yerY(x, z), koySuY(z)) - 0.35;
        const c = falezTon[idx % falezTon.length];
        S.ekle(G.kule, x, y0 + h * 0.48, z, w, h, d, c[0], c[1], 0, (idx % 3 - 1) * 0.4, 0);
        S.ekle(G.kubbe, x, y0 + h * 0.92, z, w * 0.82, h * 0.22, d * 0.82, 0xc88450, 0xf2cca0);
        S.ekle(G.kureO, x, y0 + h * 1.02, z, w * 0.72, h * 0.16, d * 0.72, 0x4e7c44, 0x90ba64);
      };
      const falezler = [
        [-32, -22, 6.5, 6.2, 5.0], [-23, -18, 5.2, 4.8, 4.2], [-16, -26, 5.8, 5.5, 4.6], [-28, -32, 7.2, 7.2, 5.5],
        [hx + 18, -19, 5.4, 5.0, 4.2], [hx + 25, -24, 6.8, 6.6, 5.2], [hx + 34, -20, 7.0, 7.0, 5.4], [hx + 30, -33, 7.6, 7.4, 5.8]
      ];
      for (let i = 0; i < falezler.length; i++) {
        const [x, z, w, h, d] = falezler[i];
        falezKaya(x, z, w, h, d, i);
      }
      // Arka koy adalarının su çizgisi boyunca terakota kayalık falez şeritleri (z: -36 .. -44)
      for (const [ax, az, rx] of [[-8, -40, 14], [30, -38, 13], [68, -41, 15]]) {
        for (let k = -2; k <= 2; k++) {
          const cx = ax + k * rx * 0.34, cz = az + Math.abs(k) * 0.9, c = falezTon[(k + 4) % 3];
          const ky0 = koySuY(cz) - 0.3, kh = 2.6 + (2 - Math.abs(k)) * 0.65;
          S.ekle(G.kule, cx, ky0 + kh * 0.5, cz, 3.6 - Math.abs(k) * 0.4, kh, 2.4, c[0], c[1], 0, k * 0.3, 0);
          S.ekle(G.halkaInce, cx, koySuY(cz + 1.2) + 0.03, cz + 0.8, 3.2, 1.4, 0.25, 0xdcf8ff, 0xffffff, PI / 2, 0, 0);
        }
      }

      // 3) Kayalık burun (z: -14) üzerinde klasik uzun kırmızı-beyaz çizgili deniz feneri + dönen altın ışık huzmesi
      const fx = Math.min(hx * 0.64, 34), fz = -14;
      const fy = Math.max(yerY(fx, fz), koySuY(fz)) + 0.15;
      // Kayalık burun kaidesi (terakota + kıyı graniti + beyaz köpük)
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * PI * 2;
        const rx = fx + Math.cos(a) * 3.4, rz = fz + Math.sin(a) * 2.1;
        const c = falezTon[i % falezTon.length];
        S.ekle(G.kureO, rx, fy - 0.1, rz, ara(1.5, 2.3), ara(1.1, 1.8), ara(1.3, 1.9), c[0], c[1], 0, a, 0);
      }
      S.ekle(G.kureO, fx, fy + 0.75, fz, 3.6, 1.8, 2.5, 0xa86446, 0xdfa078);
      S.ekle(G.kule, fx, fy + 1.85, fz, 1.65, 1.2, 1.65, 0x8e867c, 0xd0c6b8); // taş temel
      S.ekle(G.halkaInce, fx, koySuY(fz - 1.5) + 0.04, fz - 0.5, 4.2, 2.6, 0.35, 0xdcf8ff, 0xffffff, PI / 2, 0, 0);

      // Deniz feneri çizgili gövde (6 kırmızı-beyaz katman, toplam 11.4 m)
      const H = 11.4, kat = 6;
      const fTaban = fy + 2.4;
      for (let i = 0; i < kat; i++) {
        const r = 1.38 - i * 0.095, kh = H / kat;
        const c = i % 2 === 0 ? [0xd8342c, 0xff6258] : [0xefe8de, 0xffffff];
        S.ekle(G.kule, fx, fTaban + kh * (i + 0.5), fz, r, kh * 1.02, r, c[0], c[1]);
      }
      // Kule kapısı ve yuvarlak lumboz pencereler
      S.ekle(G.kutu, fx, fTaban + 0.85, fz + 1.45, 0.72, 1.28, 0.18, 0x5c3a24, 0x8a5838);
      S.ekle(G.halkaInce, fx, fTaban + 4.4, fz + 1.22, 0.28, 0.28, 0.5, 0x243448, 0x486280);
      L.ekle(G.kureK, fx, fTaban + 4.4, fz + 1.18, 0.22, 0.22, 0.08, 0xffc864, 0xfff6c0);
      S.ekle(G.halkaInce, fx, fTaban + 8.0, fz + 1.04, 0.25, 0.25, 0.5, 0x243448, 0x486280);
      L.ekle(G.kureK, fx, fTaban + 8.0, fz + 1.0, 0.2, 0.2, 0.08, 0xffc864, 0xfff6c0);

      // Şerefeli balkon, korkuluk ve tepedeki sıcak cam fener evi
      const fUst = fTaban + H;
      S.ekle(G.sil, fx, fUst + 0.16, fz, 1.36, 0.28, 1.36, 0x243040, 0x4a5e78);
      S.ekle(G.halkaInce, fx, fUst + 0.82, fz, 1.28, 1.28, 0.65, 0x243040, 0x4a5e78, PI / 2, 0, 0);
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * PI * 2;
        S.ekle(G.silA3, fx + Math.cos(a) * 1.24, fUst + 0.52, fz + Math.sin(a) * 1.24, 0.03, 0.6, 0.03, 0x243040, 0x4a5e78);
      }
      // Cam fener çerçevesi + kubbe çatı
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * PI * 2;
        S.ekle(G.silA3, fx + Math.cos(a) * 0.88, fUst + 0.96, fz + Math.sin(a) * 0.88, 0.04, 1.32, 0.04, 0x243040, 0x485c74);
      }
      S.ekle(G.kubbe, fx, fUst + 1.62, fz, 1.08, 0.86, 1.08, 0xc8322c, 0xff6258);
      S.ekle(G.silA3, fx, fUst + 2.54, fz, 0.04, 0.45, 0.04, 0xd8a23c, 0xffe498);
      S.ekle(G.kureK, fx, fUst + 2.78, fz, 0.12, 0.12, 0.12, 0xd8a23c, 0xfff4b0);

      // Bekçi kulübesi (burnun yanında sıcak beyaz badana + terakota kiremit çatı)
      const kx = fx + 2.65, kz = fz + 0.35, ky = fy + 1.45;
      S.ekle(G.kutu, kx, ky + 0.8, kz, 2.6, 1.6, 2.0, 0xefe6da, 0xffffff);
      S.ekle(PR, kx, ky + 2.05, kz, 1.72, 1.15, 2.3, 0xd44438, 0xff7866);
      S.ekle(G.kutu, kx + 0.65, ky + 2.35, kz - 0.3, 0.35, 0.85, 0.35, 0xb84034, 0xe86c58);
      S.ekle(G.kutu, kx - 0.55, ky + 0.65, kz + 1.02, 0.52, 0.95, 0.08, 0x2c6ca8, 0x5ca4e4);
      L.ekle(G.kutu, kx + 0.55, ky + 0.9, kz + 1.02, 0.58, 0.54, 0.08, 0xffca60, 0xfff6be);

      // Sıcak cam fener evi duvarı (ayrı yarı saydam cam malzeme)
      const CY = ctx.yapi();
      CY.ekle(ogCamSil(T), fx, fUst + 0.96, fz, 1, 1, 1, 0xffeba8, 0xfff8dc);
      const camMat = new T.MeshStandardMaterial({
        color: 0xfff4c4, roughness: 0.12, metalness: 0.08,
        emissive: 0xffd268, emissiveIntensity: 0.85,
        transparent: true, opacity: 0.34
      });
      ctx.ekle(new T.Mesh(CY.geo(), camMat));

      // Fener evinin içindeki parlayan altın lamba çekirdeği
      const lambaY = fUst + 0.96;
      L.ekle(G.oct, fx, lambaY, fz, 0.62, 0.72, 0.62, 0xffe488, 0xffffff);

      // Dönen yavaş altın deniz feneri ışık huzmesi (parlak ışıldayan ShaderMaterial koni)
      const beamPivot = new T.Group();
      beamPivot.position.set(fx, lambaY, fz);
      const beamYapi = ctx.yapi();
      beamYapi.ekle(HZ, 0, 0, 0, 38, 1.05, 1.05, 0xffffff, 0xffffff);
      beamYapi.ekle(HZ, 0, 0, 0, -24, 0.82, 0.82, 0xffffff, 0xffffff);
      const beamMat = new T.ShaderMaterial({
        transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, fog: false,
        uniforms: { uT: ctx.U.uT },
        vertexShader: 'varying vec3 vN, vV, vL; void main(){ vL = position; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
        fragmentShader: [
          'varying vec3 vN, vV, vL; uniform float uT;',
          'void main(){',
          ' float dist = abs(vL.x) / (vL.x >= 0.0 ? 38.0 : 24.0);',
          ' float lon = smoothstep(0.0, 0.03, dist) * pow(max(0.0, 1.0 - dist), 1.2);',
          ' float kenar = pow(abs(dot(normalize(vN), normalize(vV))), 0.72);',
          ' float yan = vL.x >= 0.0 ? 1.0 : 0.72;',
          ' float a = lon * kenar * 0.68 * yan * (0.94 + 0.06 * sin(uT * 2.1));',
          ' vec3 c = mix(vec3(1.0, 0.84, 0.36), vec3(1.0, 0.98, 0.84), smoothstep(0.45, 0.0, dist)) * a;',
          ' gl_FragColor = vec4(c, 1.0);',
          '}'
        ].join('\n')
      });
      const beamMesh = new T.Mesh(beamYapi.geo(), beamMat);
      beamMesh.rotation.z = -0.11;
      beamMesh.renderOrder = 4;
      beamMesh.frustumCulled = false;
      beamPivot.add(beamMesh);
      ctx.ekle(beamPivot);

      // 4) Eskitilmiş ahşap iskele direkleri & tahtalar (z: -5)
      const iskeleKur = (ix, uz, direkSay) => {
        const z0 = -5.0, y0 = 0.72;
        const w = (direkSay - 1) * uz;
        // Yatay eskitilmiş tahta güverte
        for (let p = 0; p < 5; p++) {
          S.ekle(G.kutu, ix + w * 0.5, y0, z0 - 0.68 + p * 0.34, w + 1.2, 0.08, 0.28, 0x98826a, 0xcab496);
        }
        for (let i = 0; i < direkSay; i++) {
          const px = ix + i * uz;
          for (const qz of [-0.82, 0.82]) {
            const py = yerY(px, z0 + qz);
            const h = y0 + 0.65 - py;
            S.ekle(G.sil, px, py + h * 0.5, z0 + qz, 0.14, h, 0.14, 0x6a5442, 0x9c826c);
            S.ekle(G.sil, px, y0 + 0.66, z0 + qz, 0.16, 0.07, 0.16, 0x8a7460, 0xc2ab92);
          }
          if (i < direkSay - 1) {
            // Ön direkler arası sarkık kalın halat
            for (let s = 0; s < 5; s++) {
              const u = (s + 0.5) / 5;
              const rx = px + u * uz, ry = y0 + 0.48 - Math.sin(u * PI) * 0.22;
              S.ekle(G.sil, rx, ry, z0 + 0.82, 0.034, uz / 4.4, 0.034, 0xc8a470, 0xf0dcba, 0, 0, PI / 2 - Math.cos(u * PI) * 0.28);
            }
          }
        }
        // İskele ucunda sıcak liman feneri + sarılı halat
        const lx = ix + w + 0.35;
        S.ekle(G.sil, lx, y0 + 1.15, z0 + 0.82, 0.055, 1.3, 0.055, 0x3a322c, 0x685c52);
        L.ekle(G.oct, lx, y0 + 1.88, z0 + 0.82, 0.18, 0.24, 0.18, 0xffca60, 0xfff8c8);
        S.ekle(G.koni, lx, y0 + 2.12, z0 + 0.82, 0.22, 0.16, 0.22, 0x243448, 0x486280);
        S.ekle(G.halka, ix + 0.8, y0 + 0.09, z0, 0.34, 0.34, 0.55, 0xc8a470, 0xf0dcba, PI / 2, 0, 0);
      };
      iskeleKur(8.5, 2.3, 5);
      if (hx > 36) iskeleKur(hx - 14, 2.3, 4);

      // İskele kenarındaki kumda ufak tefek yüzsüz deniz kabukları ve denizyıldızları (z <= -4 ve z >= 5)
      const kabukRenk = [[0xff9c8c, 0xfff0ec], [0xf4b888, 0xfff8ee], [0xe86454, 0xffb4a4]];
      for (let i = 0; i < 24; i++) {
        const kz = i % 2 === 0 ? ara(-4.2, -11.5) : ara(5.2, 12.0);
        const kx = ara(-24, hx + 28);
        if (Math.abs(kx) < 4.5 && kz > -5) continue;
        const ky = yerY(kx, kz), c = kabukRenk[i % 3], sc = ara(0.14, 0.24);
        if (i % 3 === 0) {
          for (let j = 0; j < 5; j++) {
            const a = (j / 5) * PI * 2;
            S.ekle(G.kureK, kx + Math.cos(a) * sc * 0.9, ky + 0.04, kz + Math.sin(a) * sc * 0.9, sc * 1.1, sc * 0.28, sc * 0.4, c[0], c[1], 0, -a, 0);
          }
        } else {
          S.ekle(G.kureK, kx, ky + 0.04, kz, sc * 1.2, sc * 0.36, sc, c[0], c[1], 0, i * 0.7, 0);
        }
      }

      // Dere kıyısında dere boyunca küçük yuvarlak kıyı taşları ve iki uçta küçük ahşap basamaklar (dere sınırını ihlal etmez)
      for (let x = dereX0 - 0.8; x <= dereX1 + 0.8; x += ara(1.6, 2.6)) {
        for (const qz of [-1, 1]) {
          const pz = qz * ara(2.25, 2.75), pr = ara(0.16, 0.32);
          S.ekle(G.kureO, x, pr * 0.28, pz, pr * 1.35, pr * 0.45, pr * 0.95, 0xa8927a, 0xdfd0bc, 0, ara(0, PI), 0);
        }
      }
      for (const ux of [dereX0 - 0.9, dereX1 + 0.9]) {
        for (let k = -2; k <= 2; k++) {
          const pr = 0.24 + (Math.abs(k) % 2) * 0.1;
          S.ekle(G.kureO, ux + (k % 2) * 0.25, pr * 0.3, k * 0.75, pr * 1.4, pr * 0.5, pr * 1.1, 0x9c8672, 0xd8c6b2);
        }
      }

      const sm = new T.Mesh(S.geo(), ctx.malz(true, true, 0.22, { roughness: 0.78 }));
      sm.receiveShadow = true;
      ctx.ekle(sm);

      const lMat = isikMalz(ctx, 1.0, { roughness: 0.3 });
      ctx.ekle(new T.Mesh(L.geo(), lMat));

      // 5) Koy sularında nazikçe sallanıp süzülen renkli yelkenliler (z: -20 .. -45)
      const HY = ctx.yapi(), SY = ctx.yapi();
      HY.ekle(TG, 0, 0, 0, 1, 1, 1, 0x9c5a38, 0xf8f0e6); // tekne gövdesi
      HY.ekle(G.kutu, -0.15, 0.5, 0, 0.85, 0.26, 0.46, 0xede6dc, 0xffffff); // kamara
      HY.ekle(G.sil, 0.05, 1.95, 0, 0.045, 3.3, 0.045, 0x7a5234, 0xba8858); // direk
      HY.ekle(G.sil, -0.45, 0.85, 0, 0.032, 1.15, 0.032, 0x7a5234, 0xba8858, 0, 0, PI / 2); // bumba
      HY.ekle(YL, 0.14, 0.62, 0, 1.18, 2.55, 0.9, 0xefe8de, 0xffffff); // beyaz flok yelkeni

      SY.ekle(YL, 0.0, 0.9, 0, -1.16, 2.75, 1.0, 0xd8d8d8, 0xffffff); // renkli ana yelken
      SY.ekle(G.koni4, 0.28, 3.58, 0, 0.07, 0.42, 0.03, 0xe8e8e8, 0xffffff, 0, 0, -PI / 2); // flama

      const hMat = ctx.malz(true, true, 0.2, { roughness: 0.65, side: T.DoubleSide });
      const sMat = ctx.malz(true, true, 0.2, { roughness: 0.55, side: T.DoubleSide });
      const tekneSay = 8;
      const hullIm = new T.InstancedMesh(HY.geo(), hMat, tekneSay);
      const sailIm = new T.InstancedMesh(SY.geo(), sMat, tekneSay);
      hullIm.frustumCulled = false;
      sailIm.frustumCulled = false;

      const sRenk = [0xe85040, 0x2c82c9, 0xf08a40, 0x38a898, 0xe86480, 0x3a94d8, 0xd84438, 0x4cb89c];
      // Açık koy şeritleri (z: -20 .. -44; arka tekneler koy adaları arasındaki açık boğazlarda süzülür)
      const zSerit = [-20.5, -24.5, -28.5, -32.5, -22.5, -36.5, -40.5, -43.5];
      const xSerit = [-12, 8, 22, 46, hx + 8, 12, 49, -24];
      const tekneler = [];
      for (let i = 0; i < tekneSay; i++) {
        sailIm.setColorAt(i, new T.Color(sRenk[i % sRenk.length]));
        const z = zSerit[i], x0 = xSerit[i];
        const sc = 1.0 + (i % 3) * 0.22;
        const hiz = z < -34 ? 0.35 : 0.9 + (i % 4) * 0.25;
        const yon = i % 2 === 0 ? 1 : -1;
        tekneler.push({ x0, z, sc, hiz, yon, faz: i * 1.43, bogaz: z < -34 });
      }
      if (sailIm.instanceColor) sailIm.instanceColor.needsUpdate = true;
      ctx.ekle(hullIm);
      ctx.ekle(sailIm);

      ctx.veri.fener = { pivot: beamPivot, lMat };
      ctx.veri.tekne = { hullIm, sailIm, liste: tekneler, o: new T.Object3D(), xa: -42, xb: hx + 48 };

      DY_EK[43].guncelle(0, 0, ctx);
    },
    guncelle(t, dt, ctx) {
      const v = ctx.veri;
      if (!v) return;
      if (v.fener) {
        v.fener.pivot.rotation.y = t * 0.38 + 0.25;
        v.fener.lMat.emissiveIntensity = 1.05 + 0.2 * Math.sin(t * 2.4);
      }
      if (v.tekne) {
        const { hullIm, sailIm, liste, o, xa, xb } = v.tekne;
        const araX = xb - xa;
        for (let i = 0; i < liste.length; i++) {
          const b = liste[i];
          const x = b.bogaz
            ? b.x0 + Math.sin(t * 0.22 + b.faz) * 5.2
            : xa + (((b.x0 - xa + b.yon * t * b.hiz) % araX + araX) % araX);
          const dir = b.bogaz ? (Math.cos(t * 0.22 + b.faz) >= 0 ? 1 : -1) : b.yon;
          const y = koySuY(b.z) + Math.sin(t * 1.35 + b.faz) * 0.1;
          o.position.set(x, y, b.z);
          o.rotation.set(
            Math.cos(t * 1.4 + b.faz) * 0.035,
            dir > 0 ? 0 : PI,
            Math.sin(t * 1.15 + b.faz) * 0.055
          );
          o.scale.setScalar(b.sc);
          o.updateMatrix();
          hullIm.setMatrixAt(i, o.matrix);
          sailIm.setMatrixAt(i, o.matrix);
        }
        hullIm.instanceMatrix.needsUpdate = true;
        sailIm.instanceMatrix.needsUpdate = true;
      }
    },
    sok(ctx) {
      if (ctx && ctx.veri) {
        ctx.veri.fener = null;
        ctx.veri.tekne = null;
      }
    }
  };
})();
