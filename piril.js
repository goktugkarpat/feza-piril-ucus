// piril.js — Pırıl (küçük mor ejderha) ve köpek Bilbo: modeller + hareketler (KARAKTER ajanı)
// Klasik <script>. Dışarıya yalnız pirilKur() ve pirilGuncelle(dt, t) açılır; diğer bütün adlar "pr" önekli.
// Her parça birçok küçük biçimin TEK ağda birleştirilmesiyle kurulur (köşe renkleri, alttan üste ton geçişi).
// Kare başına yeni nesne oluşturulmaz.

const prT = THREE;
const prM4 = new prT.Matrix4(), prQ = new prT.Quaternion(), prE = new prT.Euler(), prV = new prT.Vector3(), prS = new prT.Vector3(), prN3 = new prT.Matrix3(), prC = new prT.Color();
function prYapi() { return { p: [], n: [], c: [], i: [] }; }
// geo'yu (px,py,pz) konumuna, (sx,sy,sz) ölçeğine, (rx,ry,rz) dönüşüne koyup yapıya ekler. ton: üst yüzler açık, alt yüzler koyu.
function prKat(y, geo, renk, px, py, pz, sx, sy, sz, rx, ry, rz, ton) {
  if (sy === undefined) sy = sx; if (sz === undefined) sz = sx;
  prE.set(rx || 0, ry || 0, rz || 0); prQ.setFromEuler(prE);
  prM4.compose(prV.set(px, py, pz), prQ, prS.set(sx, sy, sz)); if (y.taban) prM4.premultiply(y.taban); prN3.getNormalMatrix(prM4);
  const pos = geo.attributes.position, nor = geo.attributes.normal, b = y.p.length / 3, tn = ton === undefined ? 0.16 : ton;
  prC.set(renk);
  for (let i = 0; i < pos.count; i++) {
    prV.fromBufferAttribute(pos, i).applyMatrix4(prM4); y.p.push(prV.x, prV.y, prV.z);
    prV.fromBufferAttribute(nor, i).applyMatrix3(prN3).normalize(); y.n.push(prV.x, prV.y, prV.z);
    const k = 1 + tn * prV.y;
    y.c.push(Math.min(1, prC.r * k), Math.min(1, prC.g * k), Math.min(1, prC.b * k));
  }
  if (geo.index) { const ix = geo.index.array; for (let i = 0; i < ix.length; i++) y.i.push(b + ix[i]); }
  else for (let i = 0; i < pos.count; i++) y.i.push(b + i);
}
// yapının [bas..] köşelerini yüksekliğe göre boyar (alt koyu → üst açık; yumuşak geçiş)
function prTonla(y, bas, yAlt, yUst, kAlt, kUst) {
  for (let i = bas * 3; i < y.p.length; i += 3) {
    const t = Math.min(1, Math.max(0, (y.p[i + 1] - yAlt) / (yUst - yAlt))), k = kAlt + (kUst - kAlt) * t * t * (3 - 2 * t);
    y.c[i] *= k; y.c[i + 1] *= k; y.c[i + 2] *= k;
  }
}
// yapının [bas..] köşelerini (cx,cy,cz) merkezine uzaklığa göre boyar (kök → uç ton geçişi)
function prRadyalTonla(y, bas, cx, cy, cz, rAlt, rUst, kAlt, kUst) {
  for (let i = bas * 3; i < y.p.length; i += 3) {
    const r = Math.hypot(y.p[i] - cx, y.p[i + 1] - cy, y.p[i + 2] - cz);
    const t = Math.min(1, Math.max(0, (r - rAlt) / (rUst - rAlt))), k = kAlt + (kUst - kAlt) * t * t * (3 - 2 * t);
    y.c[i] *= k; y.c[i + 1] *= k; y.c[i + 2] *= k;
  }
}
function prBitir(y, mat) {
  const g = new prT.BufferGeometry();
  g.setAttribute('position', new prT.Float32BufferAttribute(y.p, 3));
  g.setAttribute('normal', new prT.Float32BufferAttribute(y.n, 3));
  g.setAttribute('color', new prT.Float32BufferAttribute(y.c, 3));
  g.setIndex(y.i); g.computeBoundingSphere();
  const m = new prT.Mesh(g, mat); m.frustumCulled = false;
  if (mat !== prMatGoz && mat !== prMatYanak) { m.castShadow = true; m.receiveShadow = true; }
  return m;
}
function prGrup(ust, x, y, z) { const g = new prT.Group(); g.position.set(x || 0, y || 0, z || 0); if (ust) ust.add(g); return g; }

// Temel biçimler (bir kez)
const prKureB = new prT.SphereGeometry(1, 28, 20), prKure = new prT.SphereGeometry(1, 16, 11), prKureK = new prT.SphereGeometry(1, 10, 7), prKureM = new prT.SphereGeometry(1, 8, 6);
const prKoni = new prT.ConeGeometry(1, 1, 10, 1); prKoni.translate(0, 0.5, 0);           // tabanı 0'da, ucu +Y
const prDamla = new prT.LatheGeometry([[0.0001, -0.2], [0.7, -0.1], [1, 0.15], [0.8, 0.5], [0.42, 0.8], [0.0001, 1]].map(q => new prT.Vector2(q[0], q[1])), 9);
const prYay = new prT.TorusGeometry(1, 0.16, 6, 16, Math.PI);                           // gülüş yayı (∩; ters çevrilince ∪)
const prHalka = new prT.TorusGeometry(1, 0.22, 8, 22);
const prYarim = new prT.SphereGeometry(1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);   // alt yarım küre (açık ağız)
const prKalpGeo = (function () {
  const s = new prT.Shape(); s.moveTo(0, -0.5);
  s.bezierCurveTo(-0.15, -0.3, -0.6, -0.15, -0.55, 0.15); s.bezierCurveTo(-0.5, 0.5, -0.1, 0.5, 0, 0.25);
  s.bezierCurveTo(0.1, 0.5, 0.5, 0.5, 0.55, 0.15); s.bezierCurveTo(0.6, -0.15, 0.15, -0.3, 0, -0.5);
  const g = new prT.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2, curveSegments: 8 });
  g.translate(0, 0, -0.06); g.computeVertexNormals(); return g;
})();
const prKanatGeo = [-1, 1].map(s => {   // yarasa kanadı: kök → bilek → uç, arka kenarda üç yuvarlak tarak (yarış oyunundaki kanadın aynısı)
  const sh = new prT.Shape(); sh.moveTo(0, 0); sh.lineTo(s * 0.28, 0.44); sh.lineTo(s * 0.8, 0.4);
  sh.quadraticCurveTo(s * 0.6, 0.34, s * 0.56, 0.15); sh.quadraticCurveTo(s * 0.4, 0.15, s * 0.31, -0.03); sh.quadraticCurveTo(s * 0.15, 0.02, s * 0.05, -0.13); sh.lineTo(0, 0);
  const g = new prT.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 1, curveSegments: 5 });
  g.computeVertexNormals(); return g;
});
const prKanatIcGeo = [-1, 1].map(s => { // yumuşak katmanlı iç kanat tüyü/zarı (daha şeffaf pastel parlaklık)
  const sh = new prT.Shape(); sh.moveTo(0, 0.02); sh.lineTo(s * 0.22, 0.34); sh.lineTo(s * 0.58, 0.31);
  sh.quadraticCurveTo(s * 0.44, 0.25, s * 0.4, 0.11); sh.quadraticCurveTo(s * 0.28, 0.11, s * 0.22, -0.01); sh.quadraticCurveTo(s * 0.11, 0.02, s * 0.03, -0.07); sh.lineTo(0, 0.02);
  const g = new prT.ExtrudeGeometry(sh, { depth: 0.025, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1, curveSegments: 5 });
  g.computeVertexNormals(); return g;
});

// Malzemeler: yumuşak peluş (Standard + hafif iç ışık), gözler ışıktan bağımsız parlak
const prMat = new prT.MeshStandardMaterial({ vertexColors: true, roughness: 0.68, metalness: 0.02, emissive: 0x221235, emissiveIntensity: 0.28 });
// kenar ışığı (fresnel): koyu temalarda da iki karakter net okunsun; ışık/çizim eklemez
const prRim = { renk: { value: new prT.Color(0xfff2e0) }, guc: { value: 0.18 } };
function prRimEkle(m, renkU) {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.prRimRenk = renkU || prRim.renk; sh.uniforms.prRimGuc = prRim.guc;
    sh.fragmentShader = 'uniform vec3 prRimRenk; uniform float prRimGuc;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\n{ float prF = 1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0); totalEmissiveRadiance += prRimRenk * pow(prF, 2.6) * prRimGuc; }');
  };
  m.customProgramCacheKey = () => 'prRim';
}
const prMatB = prMat.clone(); prMatB.emissive.set(0x2a1608); prMatB.emissiveIntensity = 0.3;
prRimEkle(prMat, { value: new prT.Color(0xf4e6ff) }); prRimEkle(prMatB, { value: new prT.Color(0xffe2c2) });
let prKaranlik = -1;
function prTemaIsik() {   // sahnenin genel aydınlığına göre (gece/koyu tema) iç ışık ve kenar ışığını artırır
  let L = 0.7; const r = typeof scene !== 'undefined' ? scene : null;
  const col = r && r.fog && r.fog.color ? r.fog.color : (r && r.background && r.background.isColor ? r.background : null);
  if (col) L = col.r * 0.3 + col.g * 0.59 + col.b * 0.11;
  const k = clampPr((0.62 - L) / 0.4, 0, 1);
  prKaranlik = prKaranlik < 0 ? k : prKaranlik + (k - prKaranlik) * 0.05;
  prMat.emissiveIntensity = 0.28 + prKaranlik * 0.2; prMatB.emissiveIntensity = 0.3 + prKaranlik * 0.55;
  prRim.guc.value = 0.16 + prKaranlik * 0.22;
}
const prMatGoz = new prT.MeshBasicMaterial({ vertexColors: true });
const prMatZar = new prT.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.04, emissive: 0x6b2654, emissiveIntensity: 0.22, transparent: true, opacity: 0.86, side: prT.DoubleSide });
const prMatYanak = new prT.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0.0, emissive: 0xff4d88, emissiveIntensity: 0.14, transparent: true, opacity: 0.58 });

// Renkler (yarış oyunundaki Pırıl ve Bilbo)
const PR_MOR = 0x9a7ad8, PR_LEYLAK = 0xb79bea, PR_BURUN = 0xdccdfb, PR_KARIN = 0xcdeb8a, PR_IBIK = 0x8dde78, PR_IBIK2 = 0x5fbf52, PR_YANAK = 0xf59cc8, PR_ZAR = 0xf7a0d4, PR_KEMIK = 0x7d62b8;
const PR_CIKO = 0x7a5034, PR_CIKO2 = 0xa8794f, PR_CIKO3 = 0x553524, PR_KULAK = 0x4e3222;

let prPiril = null, prBilbo = null;

// ---------- Pırıl ----------
function prPirilKur() {
  const R = {};
  R.kok = prGrup(scene);               // oyun konumu (P.x, P.y) + dönüş
  R.yon = prGrup(R.kok); R.yon.scale.setScalar(0.58);   // yüz yönü (sağ/sol, 3/4 görünüş); boy ≈ 1,15 m
  R.ez = prGrup(R.yon, 0, -0.55, 0);    // ez-uzat merkezi ayak tabanında
  R.gov = prGrup(R.ez, 0, 0.55, 0);     // gövde merkezi (P noktası)
  // gövde + bacaklar + sırt ibikleri + karın
  let y = prYapi();
  prKat(y, prKureB, PR_MOR, 0, -0.1, -0.02, 0.56, 0.6, 0.54);
  prKat(y, prKureB, PR_KARIN, 0, -0.14, 0.27, 0.42, 0.48, 0.3, 0, 0, 0, 0.1);
  prKat(y, prKure, 0xe4f9b4, 0, -0.15, 0.36, 0.28, 0.33, 0.2, 0, 0, 0, 0.06);           // yumuşak iç karın parıltısı
  for (let i = 0; i < 4; i++) prKat(y, prKure, 0xa9dc72, 0, 0.14 - i * 0.14, 0.525 - Math.abs(i - 0.9) * 0.028, 0.25 - Math.abs(i - 1.3) * 0.042, 0.021, 0.048, 0.1, 0, 0, 0);
  for (const x of [-1, 1]) {
    prKat(y, prKure, PR_MOR, x * 0.27, -0.52, 0.06, 0.2, 0.18, 0.22);                 // tombul but
  }
  const basIbik = y.p.length / 3;
  for (let i = 0; i < 5; i++) {   // sırt ibikleri (ensede başlayıp kuyruğa iner)
    const a = 0.5 - i * 0.42, r = 0.6, h = [0.2, 0.24, 0.22, 0.18, 0.14][i];
    prKat(y, prDamla, i % 2 ? PR_IBIK2 : PR_IBIK, 0, -0.1 + Math.sin(a) * r * 0.95, -0.02 - Math.cos(a) * r * 0.9, 0.07, h, 0.11, -Math.PI / 2 - a + 0.35, 0, 0);
  }
  prTonla(y, 0, -0.75, 0.4, 0.9, 1.1);
  prRadyalTonla(y, basIbik, 0, -0.1, -0.02, 0.54, 0.82, 0.78, 1.32);
  R.govdeM = prBitir(y, prMat); R.gov.add(R.govdeM);
  // ayaklar (uçuşta geriye kıvrılır)
  R.ayak = [];
  for (const x of [-1, 1]) {
    const g = prGrup(R.gov, x * 0.29, -0.56, 0.06);
    y = prYapi();
    prKat(y, prKure, PR_LEYLAK, 0, -0.1, 0.1, 0.16, 0.08, 0.22, 0.1);                 // ayak
    for (let j = -1; j <= 1; j++) prKat(y, prKureK, 0xfff0d0, j * 0.065, -0.1, 0.3, 0.035, 0.035, 0.035);  // tırnakçıklar
    prTonla(y, 0, -0.2, 0.05, 0.88, 1.05);
    g.add(prBitir(y, prMat)); g.userData.x = x; R.ayak.push(g);
  }
  // kuyruk (kıvrık; sırtı minik tüycüklü, ucu katmanlı kalp yaprak)
  R.kuyruk = prGrup(R.gov, 0, -0.42, -0.42);
  y = prYapi();
  for (let i = 0; i <= 9; i++) {
    const t = i / 9, a = t * 2.4, r = 0.21 - t * 0.12;
    prKat(y, prKureK, PR_MOR, 0, -0.04 + Math.sin(a) * 0.42 * t + t * 0.12, -Math.sin(a * 0.75) * 0.75 - t * 0.2, r, r, r * 1.15);
  }
  for (let i = 0; i < 3; i++) {   // kuyruk üstü minik sevimli tüy/ibikcik
    const t = 0.28 + i * 0.22, a = t * 2.4;
    prKat(y, prDamla, i % 2 ? PR_IBIK2 : PR_IBIK, 0, 0.08 + Math.sin(a) * 0.42 * t + t * 0.12, -Math.sin(a * 0.75) * 0.75 - t * 0.2, 0.042, 0.11 - i * 0.015, 0.06, -0.6 - i * 0.25, 0, 0);
  }
  const basKalp = y.p.length / 3;
  prKat(y, prKalpGeo, PR_IBIK, 0, 0.6, -0.72, 0.31, 0.31, 0.3, 0.4, Math.PI / 2, 0);
  prKat(y, prKalpGeo, 0xbef89e, 0.045, 0.61, -0.72, 0.17, 0.17, 0.22, 0.4, Math.PI / 2, 0);
  prKat(y, prKalpGeo, 0xbef89e, -0.045, 0.61, -0.72, 0.17, 0.17, 0.22, 0.4, Math.PI / 2, 0);
  prTonla(y, 0, -0.2, 0.5, 0.85, 1.05);
  prTonla(y, basKalp, 0.44, 0.76, 0.74, 1.32);
  R.kuyruk.add(prBitir(y, prMat));
  // kanatlar (sırtta, omuz arkasında; katmanlı yarı-saydam zar + yumuşak tüy/uç vurgusu + opak kemikler)
  R.kanat = [];
  for (const x of [-1, 1]) {
    const g = prGrup(R.gov, x * 0.2, 0.22, -0.32);
    y = prYapi();
    prKat(y, prKanatGeo[x < 0 ? 0 : 1], PR_ZAR, 0, 0, -0.02, 1.05, 1.05, 1, 0, 0, 0, 0.05);
    prKat(y, prKanatIcGeo[x < 0 ? 0 : 1], 0xffcef0, x * 0.03, 0.03, 0.005, 1.04, 1.04, 1.05, 0, 0, 0, 0.02); // katmanlı iç tüy/zar
    prKat(y, prKureK, 0xffe4f5, x * 0.82, 0.42, 0.0, 0.055, 0.04, 0.035, 0, 0, -x * 0.2, 0);              // yumuşak kanat ucu parıltısı
    prRadyalTonla(y, 0, 0, 0, 0, 0.16, 0.86, 0.92, 1.3);
    g.add(prBitir(y, prMatZar));
    const yKemik = prYapi();
    prKat(yKemik, prKureK, PR_KEMIK, x * 0.15, 0.24, 0.02, 0.035, 0.27, 0.035, 0, 0, -x * 0.56);
    prKat(yKemik, prKureK, PR_KEMIK, x * 0.57, 0.45, 0.02, 0.03, 0.27, 0.03, 0, 0, -x * 1.65);
    prKat(yKemik, prKureK, 0x9175cf, x * 0.3, 0.47, 0.02, 0.062, 0.062, 0.062);                            // yumuşak bilek pufu
    prKat(yKemik, prKureK, 0xd98fc6, x * 0.45, 0.3, 0.035, 0.016, 0.17, 0.016, 0, 0, -x * 2.2);
    prKat(yKemik, prKureK, 0xe7a2d6, x * 0.29, 0.22, 0.032, 0.014, 0.15, 0.014, 0, 0, -x * 2.55);          // ikinci ince tüy damarı
    prKat(yKemik, prKureK, 0xffd2ec, x * 0.8, 0.415, 0.012, 0.028, 0.028, 0.026, 0, 0, 0, 0);              // uç vurgusu
    prKat(yKemik, prKureK, 0xffeaf6, x * 0.57, 0.17, 0.014, 0.018, 0.018, 0.018, 0, 0, 0, 0);              // tarak ucu minik inci
    g.add(prBitir(yKemik, prMat)); g.userData.x = x; R.kanat.push(g);
  }
  // kollar
  R.kol = [];
  for (const x of [-1, 1]) {
    const g = prGrup(R.gov, x * 0.4, 0.06, 0.12); y = prYapi();
    prKat(y, prKure, PR_MOR, 0, -0.14, 0, 0.11, 0.2, 0.11);
    prKat(y, prKure, 0xcdb8f5, 0, -0.32, 0.02, 0.11, 0.1, 0.11);
    for (let j = -1; j <= 1; j++) prKat(y, prKureM, 0xfff0d0, j * 0.05, -0.39, 0.08, 0.025, 0.025, 0.025);
    g.add(prBitir(y, prMat)); g.userData.x = x; R.kol.push(g);
  }
  // baş
  R.bas = prGrup(R.gov, 0, 0.62, 0.06);
  y = prYapi();
  prKat(y, prKureB, PR_LEYLAK, 0, 0, 0, 0.53, 0.48, 0.48);
  prKat(y, prKureB, PR_BURUN, 0, -0.17, 0.3, 0.33, 0.21, 0.24);                       // tombul burun
  prKat(y, prKure, 0xede3ff, 0, -0.13, 0.41, 0.2, 0.11, 0.14, 0, 0, 0, 0.05);          // yumuşak burun üstü parıltısı
  for (const x of [-1, 1]) {
    prKat(y, prKureK, 0x7d62b8, x * 0.08, -0.09, 0.535, 0.026, 0.018, 0.015);           // burun delikleri
    prKat(y, prDamla, 0xfff0c8, x * 0.2, 0.38, -0.06, 0.072, 0.24, 0.072, -0.25, 0, -x * 0.35);  // boynuzcuk
  }
  prTonla(y, 0, -0.45, 0.45, 0.86, 1.08);
  R.basM = prBitir(y, prMat); R.bas.add(R.basM);
  // yanaklar (iki katmanlı yumuşak allık + minik parlaklık; çekilirken kızarıp şişer)
  R.yanak = prGrup(R.bas, 0, -0.14, 0.33);
  y = prYapi();
  for (const x of [-1, 1]) {
    prKat(y, prKure, PR_YANAK, x * 0.34, 0, 0, 0.115, 0.074, 0.054, 0, x * 0.75, 0, 0);
    prKat(y, prKure, 0xff7db9, x * 0.345, -0.004, 0.014, 0.072, 0.045, 0.038, 0, x * 0.75, 0, 0);
    prKat(y, prKureM, 0xffeef6, x * 0.31, 0.02, 0.048, 0.016, 0.012, 0.01, 0, x * 0.75, 0, 0);
    prKat(y, prKureM, 0xffeef6, x * 0.35, 0.015, 0.042, 0.011, 0.009, 0.008, 0, x * 0.75, 0, 0);
  }
  R.yanakM = prBitir(y, prMatYanak); R.yanak.add(R.yanakM);
  // kulaklar + baş ibikleri: ayrı ağ, başın arkasındaki eksende (savrulma/gecikmeli takip)
  R.sac = prGrup(R.bas, 0, 0.12, -0.1);
  y = prYapi();
  for (const x of [-1, 1]) {
    prKat(y, prDamla, PR_IBIK, x * 0.47, 0.02 - 0.12, -0.08 + 0.1, 0.095, 0.34, 0.052, 0.1, x * 0.3, -x * 1.15);   // yüzgeç kulak
    prKat(y, prDamla, PR_YANAK, x * 0.49, 0.03 - 0.12, -0.06 + 0.1, 0.052, 0.23, 0.036, 0.1, x * 0.3, -x * 1.15, 0);
    prKat(y, prDamla, 0xffcae6, x * 0.5, 0.035 - 0.12, -0.048 + 0.1, 0.028, 0.14, 0.022, 0.1, x * 0.3, -x * 1.15, 0); // iç kulak parıltısı
    prKat(y, prKureK, 0xb5f298, x * 0.77, 0.15 - 0.12, -0.06 + 0.1, 0.036, 0.036, 0.032, 0, 0, 0, 0);            // yumuşak kulak ucu
  }
  prKat(y, prDamla, 0xb6f598, 0, 0.41, 0.12, 0.048, 0.14, 0.065, 0.32, 0, 0);                                    // alın perçemi
  for (let i = 0; i < 3; i++) prKat(y, prDamla, i % 2 ? PR_IBIK2 : PR_IBIK, 0, 0.42 - i * 0.12 - 0.12, -0.12 - i * 0.16 + 0.1, 0.075, [0.22, 0.19, 0.16][i], 0.105, -0.5 - i * 0.45, 0, 0);
  prTonla(y, 0, -0.35, 0.4, 0.88, 1.1);
  R.sac.add(prBitir(y, prMat));
  // gözler (kırpma: grup y ölçeği)
  R.goz = prGrup(R.bas, 0, 0.06, 0.36);
  y = prYapi();
  const yB = prYapi();   // gözbebekleri ayrı ağ: bakış yönüne kayar
  const prTb = new prT.Matrix4();
  for (const x of [-1, 1]) {
    y.taban = prTb.compose(prV.set(x * 0.19, 0, 0.0), prQ.setFromEuler(prE.set(0, x * 0.2, 0)), prS.set(1.14, 1.15, 1)).clone();   // iri, parlak gözler
    prKat(y, prKure, 0x4b3182, x * 0.004, 0.012, -0.008, 0.151, 0.168, 0.078);                  // üst kirpik/göz kapağı vurgusu
    prKat(y, prKure, 0x5a3f96, 0, 0.004, -0.012, 0.15, 0.172, 0.08);                   // ince mor çerçeve
    prKat(y, prKure, 0xffffff, 0, 0, 0, 0.142, 0.165, 0.08, 0, 0, 0, 0);
    for (let j = 0; j < 2; j++)   // dış köşede iki minik kıvrık kirpik
      prKat(y, prDamla, 0x3d2470, x * (0.105 + j * 0.035), 0.115 - j * 0.04, 0.0, 0.016, 0.075 - j * 0.012, 0.014, 0, 0, -x * (0.75 + j * 0.45), 0);
    yB.taban = y.taban; const yA = y; y = yB;
    prKat(y, prKure, 0x1e7e42, x * 0.008, -0.008, 0.038, 0.108, 0.128, 0.06, 0, 0, 0, 0);
    prKat(y, prKure, 0x35b360, x * 0.008, -0.024, 0.048, 0.095, 0.105, 0.052, 0, 0, 0, 0);
    prKat(y, prKure, 0x9cf57c, x * 0.008, -0.062, 0.062, 0.072, 0.052, 0.045, 0, 0, 0, 0);
    prKat(y, prKure, 0x0c0e18, x * 0.01, -0.004, 0.074, 0.068, 0.084, 0.045, 0, 0, 0, 0);
    prKat(y, prKureK, 0xffffff, 0.044 - x * 0.008, 0.054, 0.112, 0.044, 0.048, 0.02, 0, 0, 0, 0);   // ana canlı parıltı
    prKat(y, prKureK, 0xe8fff4, -0.036, -0.054, 0.108, 0.024, 0.024, 0.015, 0, 0, 0, 0);            // alt yansıma
    prKat(y, prKureK, 0xffffff, -0.028 - x * 0.006, 0.068, 0.106, 0.016, 0.016, 0.012, 0, 0, 0, 0); // üst kenar kıvılcımı
    prKat(y, prKureM, 0xffffff, 0.018 - x * 0.004, 0.016, 0.115, 0.011, 0.011, 0.01, 0, 0, 0, 0);   // minik yıldız kıvılcımı
    y = yA;
  }
  y.taban = null; yB.taban = null;
  R.gozM = prBitir(y, prMatGoz); R.goz.add(R.gozM);
  R.bebek = prGrup(R.goz); R.bebek.add(prBitir(yB, prMatGoz)); R.bakX = 0; R.bakY = 0;
  // kaşlar: iki küçük yay; çekerken kararlı (içe-aşağı), şaşırınca yukarı kalkar
  y = prYapi(); prKat(y, prKure, 0x5a3f96, 0, 0, 0, 0.085, 0.022, 0.022, 0, 0, 0, 0.12); prKat(y, prKure, 0x5a3f96, 0.05, -0.008, 0, 0.04, 0.018, 0.02, 0, 0, -0.35, 0.12); prKat(y, prKure, 0x5a3f96, -0.05, -0.008, 0, 0.04, 0.018, 0.02, 0, 0, 0.35, 0.12);
  const kasM = prBitir(y, prMat); R.kas = [];
  for (const x of [-1, 1]) { const g = prGrup(R.bas, x * 0.2, 0.335, 0.33); g.rotation.y = x * 0.38; const m = new prT.Mesh(kasM.geometry, prMat); m.frustumCulled = false; g.add(m); g.userData.x = x; R.kas.push(g); }
  // ağız hâlleri: gülümseme, şaşkın "o", kocaman gülüş (yalnız biri görünür)
  R.agiz = prGrup(R.bas, 0, -0.28, 0.48);
  y = prYapi(); prKat(y, prYay, 0x5a2f72, 0, 0.03, 0, 0.09, 0.07, 0.06, 0, 0, Math.PI, 0);
  R.agizGul = prBitir(y, prMat); R.agiz.add(R.agizGul);
  y = prYapi(); prKat(y, prKure, 0x5a2f72, 0, 0, 0, 0.05, 0.06, 0.03, 0, 0, 0, 0); prKat(y, prKureK, 0xff8fa8, 0, -0.025, 0.015, 0.03, 0.02, 0.02, 0, 0, 0, 0);
  R.agizO = prBitir(y, prMat); R.agiz.add(R.agizO);
  y = prYapi(); prKat(y, prYarim, 0x5a2050, 0, 0.03, -0.01, 0.13, 0.11, 0.05, 0, 0, 0, 0); prKat(y, prKure, 0xff8fa8, 0, -0.045, 0.012, 0.075, 0.035, 0.03, 0, 0, 0, 0);
  prKat(y, prKureK, 0xffffff, -0.05, 0.02, 0.025, 0.025, 0.02, 0.01, 0, 0, 0, 0); prKat(y, prKureK, 0xffffff, 0.05, 0.02, 0.025, 0.025, 0.02, 0.01, 0, 0, 0, 0);
  R.agizKoca = prBitir(y, prMat); R.agiz.add(R.agizKoca);
  // canlandırma durumu (yumuşak geçiş için şimdiki değerler)
  // canlandırma kanalları (yay-sönüm: değer s, hız v)
  R.s = { olcek: 1, yaw: 0.5, egim: 0, ez: 1, gozB: 1, kanatAc: 0.3, kanatCirp: 0, kanatEsne: 0, k0x: 0.1, k0z: -0.3, k1x: 0.1, k1z: 0.3, basX: 0, basY: 0, basZ: 0,
    kuyX: 0, kuyY: 0, kuyZ: 0, kasY: 0, kasR: -0.1, sacX: 0, sacZ: 0, sacS: 1, ayakX: 0, yanak: 0, ofX: 0, ofY: 0.42 };
  R.v = {}; for (const k in R.s) R.v[k] = 0;
  R.zaman = { kanat: 9, sek: 9, yildiz: 9, halka: 9, durum: 0, kirp: 2.5, kavus: 9, birak: 9, salla: 9, seviye: 9, basla: 9, ruzgar: 9, kanatBos: 9, takla: 9 };
  R.sekTur = ''; R.onX = 0; R.onY = 0; R.onVy = 0; R.ivY = 0; R.ivX = 0; R.cifte = 0;
  R.sonDurum = ''; R.yon1 = 1; R.oncekiX = 0; R.mutlu = 0; R.yerT = -1; R.dalga = true; R.bekleOfs = 0;
  return R;
}

// ---------- Bilbo ----------
function prBilboKur() {
  const R = {};
  R.kok = prGrup(scene);
  R.yon = prGrup(R.kok);
  R.ez = prGrup(R.yon);
  let y = prYapi();
  prKat(y, prKureB, PR_CIKO, 0, 0.62, -0.12, 0.42, 0.4, 0.58);                           // tombul gövde
  prKat(y, prKure, 0xe8c9a0, 0, 0.6, 0.18, 0.3, 0.32, 0.3, 0, 0, 0, 0.1);              // açık krem göğüs
  for (const x of [-1, 1]) {
    prKat(y, prKure, PR_CIKO, x * 0.24, 0.42, -0.48, 0.2, 0.26, 0.24);                 // arka but
    prKat(y, prKure, PR_CIKO, x * 0.22, 0.2, -0.46, 0.11, 0.2, 0.11);
    prKat(y, prKure, PR_CIKO2, x * 0.22, 0.05, -0.4, 0.12, 0.07, 0.16);                 // arka pati
    for (let j = -1; j <= 1; j++) prKat(y, prKureM, 0xc99c72, x * 0.22 + j * 0.042, 0.04, -0.26, 0.032, 0.028, 0.036);
  }
  prKat(y, prKure, PR_CIKO, -0.2, 0.26, 0.24, 0.11, 0.26, 0.11);                       // ön sol bacak
  prKat(y, prKure, PR_CIKO2, -0.2, 0.05, 0.3, 0.12, 0.07, 0.16);
  for (let j = -1; j <= 1; j++) prKat(y, prKureM, 0xc99c72, -0.2 + j * 0.042, 0.04, 0.44, 0.032, 0.028, 0.036);
  prKat(y, prHalka, 0xe8433a, 0, 0.88, 0.26, 0.245, 0.245, 0.245, Math.PI / 2 - 0.55, 0, 0, 0.12);   // kırmızı tasma
  prKat(y, prHalka, 0xffdf6b, 0, 0.785, 0.465, 0.032, 0.032, 0.032, 0, Math.PI / 2, 0, 0.25);     // altın tasma halkası
  prTonla(y, 0, 0, 1, 0.78, 1.08);
  R.ez.add(prBitir(y, prMatB));
  // altın madalyon (tasma halkasından sarkar; neşeyle sallanır)
  R.madalyon = prGrup(R.ez, 0, 0.785, 0.465);
  y = prYapi();
  prKat(y, prKureK, 0xffc82c, 0, -0.075, 0.02, 0.068, 0.068, 0.024, -0.15, 0, 0, 0.32);             // altın madalyon dış
  prKat(y, prKureK, 0xffe97d, 0, -0.075, 0.03, 0.052, 0.052, 0.018, -0.15, 0, 0, 0.35);             // altın madalyon iç parlama
  prKat(y, prKalpGeo, 0xff9e1b, 0, -0.073, 0.041, 0.055, 0.055, 0.04, -0.15, 0, 0, 0.2);            // madalyon üstü minik kalp
  prTonla(y, 0, 0, 1, 0.82, 1.08);
  R.madalyon.add(prBitir(y, prMatB));
  // ön sağ pati (sallanır)
  R.pati = prGrup(R.ez, 0.2, 0.46, 0.24);
  y = prYapi(); prKat(y, prKure, PR_CIKO, 0, -0.2, 0, 0.11, 0.26, 0.11); prKat(y, prKure, PR_CIKO2, 0, -0.41, 0.06, 0.12, 0.07, 0.16);
  for (let j = -1; j <= 1; j++) prKat(y, prKureM, 0xc99c72, j * 0.042, -0.42, 0.2, 0.032, 0.028, 0.036);
  prTonla(y, 0, -0.5, 0.1, 0.85, 1.05); R.pati.add(prBitir(y, prMatB));
  // kuyruk
  R.kuyruk = prGrup(R.ez, 0, 0.78, -0.62);
  y = prYapi();
  {   // pürüzsüz, uca doğru incelen kuyruk (boğumsuz tüp)
    const nk = [];
    for (let i = 0; i <= 6; i++) { const t = i / 6; nk.push(new prT.Vector3(0, t * 0.42, -t * 0.12 - t * t * 0.1)); }
    const egri = new prT.CatmullRomCurve3(nk), TS = 16, RS = 10, tup = new prT.TubeGeometry(egri, TS, 0.085, RS, false), tp = tup.attributes.position;
    for (let i = 0; i < tp.count; i++) {
      const hal = Math.floor(i / (RS + 1)), t = hal / TS, m = egri.getPointAt(t), k = 1 - t * 0.38;
      tp.setXYZ(i, m.x + (tp.getX(i) - m.x) * k, m.y + (tp.getY(i) - m.y) * k, m.z + (tp.getZ(i) - m.z) * k);
    }
    tup.computeVertexNormals();
    prKat(y, tup, PR_CIKO, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0.1);
    prKat(y, prKure, PR_CIKO, 0, 0, 0, 0.085, 0.085, 0.085);                          // kök yuvarlağı
    tup.dispose();
  }
  prKat(y, prKure, 0xf2dac0, 0, 0.45, -0.235, 0.065, 0.08, 0.065);                       // krem kuyruk ucu pufu
  R.kuyruk.add(prBitir(y, prMatB));
  // baş (+ kulaklar, burun, dil)
  R.bas = prGrup(R.ez, 0, 1.08, 0.36);
  y = prYapi();
  prKat(y, prKureB, PR_CIKO, 0, 0, 0, 0.37, 0.34, 0.34);
  prKat(y, prKure, 0xebd0aa, 0, -0.095, 0.26, 0.21, 0.145, 0.2);                       // yumuşak krem burun kemeri
  for (const x of [-1, 1]) prKat(y, prKure, 0xf2dac0, x * 0.088, -0.135, 0.33, 0.115, 0.095, 0.125);  // tatlı puf yanak-burun yastıkları
  prKat(y, prKure, 0x1c120e, 0, -0.025, 0.455, 0.072, 0.056, 0.052, 0, 0, 0, 0.3);     // yuvarlak düğme burun
  prKat(y, prKureK, 0xfff8f4, -0.024, -0.004, 0.495, 0.022, 0.014, 0.01, 0, 0, 0, 0);  // burun ana parlaklık
  prKat(y, prKureK, 0xeadcd5, 0.022, -0.02, 0.494, 0.01, 0.008, 0.008, 0, 0, 0, 0);    // ikinci minik parlama
  prKat(y, prYay, 0x2a1a12, -0.042, -0.145, 0.405, 0.045, 0.036, 0.036, 0, 0, Math.PI, 0);
  prKat(y, prYay, 0x2a1a12, 0.042, -0.145, 0.405, 0.045, 0.036, 0.036, 0, 0, Math.PI, 0);
  for (const x of [-1, 1]) {
    prKat(y, prKure, 0xe0b88c, x * 0.13, 0.19, 0.28, 0.055, 0.028, 0.022, 0, 0, x * 0.3); // parlak kaş benekleri
    prKat(y, prKure, 0xf2a3a0, x * 0.22, -0.1, 0.25, 0.065, 0.044, 0.032, 0, 0, 0, 0);    // hafif pembe yanak
  }
  prTonla(y, 0, -0.4, 0.35, 0.85, 1.08);
  R.bas.add(prBitir(y, prMatB));
  // dil: ayrı ağ, ağızdan sarkar; heyecanla soluyunca oynar, sarılınca yalar
  R.dil = prGrup(R.bas, 0.012, -0.16, 0.39);
  y = prYapi();
  prKat(y, prKure, 0x3a1416, 0, -0.005, -0.012, 0.058, 0.03, 0.022, 0, 0, 0, 0);          // ağız içi (havlarken/yalarken açılır)
  prKat(y, prKure, 0xff7d93, 0, -0.085, 0, 0.062, 0.1, 0.026, 0, 0, 0, 0.1);
  prKat(y, prKureK, 0xe85d78, 0, -0.07, 0.022, 0.008, 0.07, 0.008, 0, 0, 0, 0);          // dil ortasındaki çizgi
  prKat(y, prKureK, 0xffb3c2, 0.018, -0.13, 0.02, 0.018, 0.014, 0.008, 0, 0, 0, 0);      // parlaklık
  R.dil.add(prBitir(y, prMatB)); R.dil.rotation.set(0.35, 0, 0.08);
  // sarkık kulaklar: ayrı ağ, başın üstündeki eksende (tatlı yuvarlak hatlar; kalkar, zıplarken savrulur)
  R.kulak = prGrup(R.bas, 0, 0.14, -0.04);
  y = prYapi();
  for (const x of [-1, 1]) {
    prKat(y, prKure, PR_KULAK, x * 0.32, -0.18, 0.01, 0.105, 0.22, 0.17, 0.1, 0, x * 0.22);
    prKat(y, prKure, PR_KULAK, x * 0.34, -0.37, 0.03, 0.115, 0.17, 0.18, 0.12, 0, x * 0.12);
    prKat(y, prKure, 0x8e5d3e, x * 0.27, -0.32, 0.04, 0.05, 0.15, 0.1, 0.1, 0, x * 0.15, 0);  // sıcak iç kulak tonu
    prKat(y, prKureK, 0x6a4632, x * 0.33, -0.49, 0.04, 0.085, 0.075, 0.13);                   // yumuşak yuvarlak kulak ucu
  }
  prTonla(y, 0, -0.6, 0.1, 0.86, 1.06);
  R.kulak.add(prBitir(y, prMatB));
  R.goz = prGrup(R.bas, 0, 0.07, 0.27);
  y = prYapi(); const yBb = prYapi();
  for (const x of [-1, 1]) {
    prKat(y, prKure, 0x3b2416, x * 0.14, 0.012, -0.008, 0.114, 0.124, 0.048, 0, 0, 0, 0);
    prKat(y, prKure, 0xffffff, x * 0.14, 0, 0, 0.108, 0.122, 0.05, 0, 0, 0, 0);
    prKat(yBb, prKure, 0x7a4a1c, x * 0.14, -0.01, 0.03, 0.08, 0.092, 0.04, 0, 0, 0, 0);
    prKat(yBb, prKure, 0x120c08, x * 0.14, -0.01, 0.05, 0.052, 0.064, 0.03, 0, 0, 0, 0);
    prKat(yBb, prKureK, 0xffffff, x * 0.14 + 0.03, 0.035, 0.075, 0.027, 0.03, 0.01, 0, 0, 0, 0);
    prKat(yBb, prKureK, 0xffffff, x * 0.14 - 0.03, -0.045, 0.07, 0.012, 0.012, 0.008, 0, 0, 0, 0);
  }
  R.goz.add(prBitir(y, prMatGoz));
  R.bebek = prGrup(R.goz); R.bebek.add(prBitir(yBb, prMatGoz)); R.bakX = 0; R.bakY = 0;   // gözbebekleri Pırıl'ı izler
  R.s = { yaw: -0.75, basY: 0, basX: 0, basZ: 0, zip: 0, pati: 0, otur: 0, egil: 0, kulX: 0, kulZ: 0, kulS: 1, ofX: 0, kuyGen: 0.45, gozB: 1 };
  R.v = {}; for (const k in R.s) R.v[k] = 0;
  R.zaman = { iska: 9, kirp: 3.3, kavus: 9, heyecan: 9, basla: 9 };
  R.kuyFaz = 0; R.zipFaz = 0; R.oncZip = 0; R.iskaX = 0; R.cifte = 0;
  return R;
}


function pirilKur() {
  if (prPiril) return;
  prPiril = prPirilKur(); prBilbo = prBilboKur();
  if (typeof OLAY !== 'undefined') {
    const R = prPiril;
    OLAY.on('kanat', () => { R.zaman.kanat = 0; prMatZar.emissiveIntensity = 0.85; R.v.sacX -= 6.5; R.v.kuyX += 4.0; R.v.ez -= 2.2; R.v.ofY -= 0.45; R.v.kanatEsne += 1.4; });
    OLAY.on('sek', (e) => {
      const tur = e && e.tur || '';
      R.zaman.sek = 0; R.sekTur = tur; if (tur !== 'yer' && R.zaman.takla > 0.5) R.zaman.takla = -0.08; R.v.ez -= tur === 'yer' ? 4 : 7.5; R.v.gozB += 4;
      if (tur === 'mantar') { R.v.sacX -= 4.5; R.v.kuyX += 3.5; }
      else if (tur === 'nilufer') { R.v.ayakX += 4; R.v.sacX -= 3.5; }
      if (!e || tur !== 'yer') { prBilbo.zaman.heyecan = 0; prBilbo.v.kulX -= 11; prBilbo.v.zip += 5.5; }
    });
    OLAY.on('halka', () => { R.zaman.halka = 0; if (R.zaman.takla > 0.5) R.zaman.takla = 0; R.v.ez += 4; R.v.gozB += 3.8; R.v.sacS += 2.0; R.v.kanatAc += 2.0; prBilbo.zaman.heyecan = 0; prBilbo.v.kulX -= 10; prBilbo.v.zip += 5; });
    OLAY.on('yildiz', () => { R.zaman.yildiz = 0; if (R.zaman.takla > 0.5) R.zaman.takla = 0; R.v.ez += 3.2; R.v.gozB += 3.2; R.v.sacS += 1.6; R.v.kanatAc += 2.2; prBilbo.zaman.heyecan = Math.min(prBilbo.zaman.heyecan, 0.35); prBilbo.v.zip += 2.5; });
    OLAY.on('birak', () => { R.zaman.birak = 0; R.v.ez += 7; R.s.kanatAc = -0.3; R.v.kanatAc = 14; R.v.gozB += 3; });
    OLAY.on('salla', () => { R.zaman.salla = 0; R.v.egim += 4 * R.yon1; R.v.ez += 3; });
    OLAY.on('gucSeviye', (n) => { R.zaman.seviye = 0; if (n > 0) { R.v.ez -= 1.5 + n; R.v.gozB += 2 + n; } });
    OLAY.on('basla', () => { R.zaman.basla = 0; R.v.ez += 5; prBilbo.zaman.basla = 0; prBilbo.v.zip += 4.5; prBilbo.v.kulX -= 9; });
    OLAY.on('iska', (e) => { prBilbo.zaman.iska = 0; prBilbo.iskaX = e && e.x !== undefined ? e.x : P.x; });
    OLAY.on('kavus', (e) => {
      R.zaman.kavus = 0; prBilbo.zaman.kavus = 0; prBilbo.v.kulX -= 12;
      const n = typeof BOLUMLER !== 'undefined' && BOLUMLER.length ? BOLUMLER.length : 0;
      R.coskun = prBilbo.coskun = !!(e && e.yildiz >= 5);
      R.son = prBilbo.son = !!(e && n && e.bolumIdx === n - 1);
    });
    OLAY.on('ruzgar', () => { R.zaman.ruzgar = 0; R.v.ez += 3.5; R.v.gozB += 3.0; R.v.sacS += 1.4; R.v.kanatAc += 1.8; });
    OLAY.on('yeniden', () => { R.zaman.kavus = 9; R.zaman.halka = 9; R.zaman.ruzgar = 9; prBilbo.zaman.kavus = 9; prBilbo.zaman.iska = 9; prBilbo.zaman.heyecan = 9; prBilbo.zaman.basla = 9; R.zaman.durum = 0; });
    OLAY.on('bolum', () => { R.zaman.halka = 9; R.zaman.ruzgar = 9; });
    OLAY.on('kanatBos', () => { if (R.zaman.kanatBos > 0.3) { R.zaman.kanatBos = 0; R.v.kanatCirp += 3; R.v.ez += 1.2; } });   // hak bitince: boşta pırpır + omuz silkip kıkırdama
  }
}

function prUs(dt, k) { return 1 - Math.exp(-dt * k); }
function clampPr(v, a, b) { return v < a ? a : v > b ? b : v; }
function prYum(x) { x = clampPr(x, 0, 1); return x * x * (3 - 2 * x); }          // yumuşak giriş-çıkış
function prPenc(t, a, b) { return t > a && t < b ? Math.sin((t - a) / (b - a) * Math.PI) : 0; }   // a..b arası yumuşak tümsek
// yay-sönüm: k sertlik, z sönüm oranı (z<1 → yaylanır, hafif taşar)
function prYayla(R, ad, h, dt, k, z) {
  const v = R.v, s = R.s;
  const n = dt > 0.016 ? Math.ceil(dt / 0.016) : 1, hdt = dt / n, c = 2 * Math.sqrt(k) * z;
  for (let i = 0; i < n; i++) {
    v[ad] += ((h - s[ad]) * k - v[ad] * c) * hdt;
    s[ad] += v[ad] * hdt;
  }
}
function prAciYayla(R, ad, h, dt, k, z) { let d = h - R.s[ad]; d = Math.atan2(Math.sin(d), Math.cos(d)); prYayla(R, ad, R.s[ad] + d, dt, k, z); }

function pirilGuncelle(dt, t) {
  if (!prPiril || typeof P === 'undefined') return;
  dt = clampPr(dt || 0.016, 0.001, 0.05);
  prTemaIsik();
  const R = prPiril, s = R.s, v = R.v, z = R.zaman, d = P.durum;
  for (const k in z) z[k] += dt;
  const onceki = R.sonDurum;
  if (d !== R.sonDurum) {
    R.sonDurum = d; z.durum = 0;
    if (d === 'kavus') z.kavus = Math.min(z.kavus, 0);
    if (d === 'bekle') { R.dalga = !(onceki === 'don' || onceki === 'cek'); R.bekleOfs = onceki === 'don' ? 5.8 : onceki === 'cek' ? 9.4 : 0; }   // dönüşte el sallamak yerine "beni çek" daveti
    if (d === 'bekle' && onceki === 'don') { v.ez -= 5; v.ofY -= 1.5; }        // salıncağa "pof" diye konar
    if (d === 'bekle' && onceki === 'cek' && z.salla > 0.2) { v.egim += 3 * R.yon1; v.ez += 2; }   // bırakılınca yaylanıp ortaya döner
    if (d === 'yuvar') { v.ez -= 5; }
    if (d === 'cek') { v.ez -= 2; v.gozB += 3; v.sacX += 4.5; v.sacS += 1.6; }
  }
  const zd = z.durum, hiz = Math.hypot(P.vx || 0, P.vy || 0);
  const baslik = typeof window !== 'undefined' && window.ARAYUZ && window.ARAYUZ.baslikAcik;
  // hedef değerler
  let olcek = 1, yaw = 0.95 * R.yon1, egim = 0, ez = 1, gozB = 1, kanatAc = 0.25, kanatCirp = 0,
    k0x = 0.15, k0z = -0.25, k1x = 0.15, k1z = 0.25, basX = 0, basY = 0, basZ = 0, kuyX = 0, kuyY = 0, kuyZ = Math.sin(t * 2.6) * 0.12, sacX = 0, sacZ = 0, sacS = 1, ayakX = 0, yanak = 0,
    kasY = 0.01, kasR = -0.1, gulus = 1, ofX = 0, ofY = 0, hop = 0, takla = 0, dondur = null, kirpZorla = false, agizS = 1, sert = 1;
  const dx = P.x - R.oncekiX; R.oncekiX = P.x;
  if (d === 'bekle') {
    // yaprak salıncağında oturur: nefes, ağırlık kaydırma, minik baş eğmeleri, kanat kıpırtıları, bakış gezinmesi, sabırsızlık, kanat silkeleme, "beni çek" daveti
    R.yon1 = 1; yaw = 0.45; ofY = 0.42;
    const nefes = Math.sin(t * 2.2), sal = Math.sin(t * 1.1);
    ez = 1 + nefes * 0.035; basX = Math.sin(t * 2.2 - 0.6) * 0.035;
    ofX = sal * 0.022; egim = sal * 0.018;
    basZ = Math.sin(t * 1.45) * 0.06 + Math.sin(t * 0.65) * 0.035;
    sacX = Math.sin(t * 2.2 - 0.8) * 0.045; sacZ = Math.sin(t * 1.45 - 0.5) * 0.045;
    ayakX = Math.sin(t * 2.2 - 0.4) * 0.07;
    kanatAc = 0.25 + nefes * 0.04;
    kanatCirp = Math.sin(t * 2.8) * 0.05 + Math.pow(Math.max(0, Math.sin(t * 1.85)), 12) * 0.16;
    kuyY = Math.sin(t * 1.6) * 0.34 + Math.sin(t * 3.2 + 0.4) * 0.08;
    kuyZ = Math.sin(t * 1.6 + 0.8) * 0.14 + Math.cos(t * 0.85) * 0.05;
    kuyX = 0.1 + nefes * 0.025;
    k0x = -0.3 + nefes * 0.03; k1x = -0.3 + nefes * 0.03; k0z = -0.35 - nefes * 0.02; k1z = 0.35 + nefes * 0.02;
    const w = R.dalga ? 3.2 : 0, c = baslik ? 0.5 : (zd < w ? 0.5 : (zd - w + R.bekleOfs) % 12 + 2.6);
    if (c < 2.6) {            // kameraya (Feza'ya) bakıp el sallar
      yaw = 0.15; k0x = -0.2; k0z = -2.75 + Math.sin(t * 11) * 0.38; basY = -0.25 + Math.sin(t * 5.5) * 0.06; basZ += 0.12; gulus = 2;
      sacX -= Math.abs(Math.sin(t * 5.5)) * 0.05; sacS = 1.04;
      if (baslik) {
        hop = Math.abs(Math.sin(t * 3.1)) * 0.16 * (Math.sin(t * 0.9) > 0.3 ? 1 : 0);
        const bq = zd % 7.2;
        if (bq > 4.6 && bq < 6.3) {   // ara sıra merakla Bilbo'nun yönüne (sağa) göz atıp oyuncuya döner
          const g = prPenc(bq, 4.6, 6.3);
          yaw += g * 0.32; basY += g * 0.7; basX -= g * 0.07; basZ -= g * 0.18; gozB = 1 + g * 0.08; sacS = 1 + g * 0.08;
          sacX -= g * 0.07; sacZ += Math.sin(t * 9) * 0.035 * g;
        }
      }
    } else if (c < 4.4) {     // Bilbo'ya bakar (uzakta, sağda)
      yaw = 0.9; basY = 0.35; basX = -0.12; gulus = 2; basZ += -0.08; k0x = -1.45 + Math.sin(t * 9) * 0.12; k0z = -0.35;   // Bilbo'yu gösterir
      sacX -= 0.08; sacZ += Math.sin(t * 8.5) * 0.035; sacS = 1.07;
    } else if (c < 6) {       // yukarıya, yıldızlara bakar
      yaw = 0.55; basX = -0.45; basY = 0.15; gozB = 1.12; gulus = 3; k1z = 0.6;
    } else if (c < 7.6) {     // sabırsız ayak sallama: tık tık sekme, kollar belde; önce sağa göz atar, sonra oyuncuya döner
      yaw = 0.35; const q = Math.sin((c - 6) * Math.PI * 5), sag = c < 6.75;
      hop = Math.max(0, q) * 0.05; ez = 1 - Math.max(0, -q) * 0.05; basZ += q * 0.08 + (sag ? -0.08 : 0.1);
      basY = sag ? 0.38 : -0.32; basX += sag ? -0.06 : 0.02;
      k0x = 0.1; k1x = 0.1; k0z = -0.75; k1z = 0.75; gulus = sag ? 1 : 2; kuyY = q * 0.48 + Math.sin(t * 5) * 0.12;
    } else if (c < 8.4) {     // kanat silkeleme
      const q = (c - 7.6) / 0.8; kanatAc = 0.6; kanatCirp = Math.sin(q * Math.PI * 7) * 0.55 * Math.sin(q * Math.PI);
      ez = 1 + Math.sin(q * Math.PI * 7) * 0.04; basY = Math.sin(q * Math.PI * 7) * 0.12; sacZ += Math.sin(q * Math.PI * 7) * 0.12; gozB = 0.3; gulus = 2; kirpZorla = true;
    } else if (c < 10.6) {    // "beni çek!" daveti: geriye yaslanıp kolunu arkaya uzatır, sonra zıplar
      const q = c - 8.4; yaw = 0.25; gulus = 2; basZ += 0.15;
      k1x = -0.4; k1z = 1.7 + Math.sin(t * 8) * 0.2; k0z = -0.4;
      egim = 0.14; basY = -0.3;
      if (q > 1.2) { const h = Math.sin((q - 1.2) * Math.PI * 2.8); hop = Math.max(0, h) * 0.24; ez = 1 + h * 0.1; egim = 0; kanatAc = 0.65; kanatCirp = Math.sin(t * 18) * 0.28; kuyY = Math.sin(t * 10) * 0.45; }
    } else {                  // merakla Bilbo'nun yönüne (sağa) dönüp duraksar, sonra tatlı bir baş eğimiyle oyuncuya bakar
      const q = c - 10.6;
      if (q < 1.65) {
        const g = prYum(q / 0.45);
        yaw = 0.42 + g * 0.14; basY = g * 0.5; basX -= g * 0.07; basZ -= g * 0.1; gozB = 1 + g * 0.07; sacS = 1 + g * 0.07;
        sacX -= g * 0.06; sacZ += Math.sin(q * Math.PI * 2) * 0.05; gulus = 1;
      } else {
        const g = prYum((q - 1.65) / 0.55);
        yaw = 0.56 - g * 0.28; basY = 0.5 - g * 0.86; basX += -0.07 * (1 - g) + prPenc(q, 2.2, 2.75) * 0.08;
        basZ += -0.1 + g * 0.22; gozB = 1.07 - g * 0.03; sacS = 1.07 - g * 0.03; gulus = g > 0.6 ? 2 : 1;
      }
    }
    if (!baslik && (c < 6 || c >= 10.6)) {   // ara sıra minik neşeli zıplama + kanat silkeleme
      const mc = zd % 5.6;
      if (mc > 4.85) {
        const q = (mc - 4.85) / 0.75, j = Math.abs(Math.sin(q * Math.PI * 2));
        hop += j * 0.14; ez = 0.94 + j * 0.1;
        kanatAc = 0.74; kanatCirp = Math.sin(q * Math.PI * 6) * 0.44 * Math.sin(q * Math.PI);
        kuyY = Math.sin(t * 14) * 0.55; gulus = 2; basZ += Math.sin(q * Math.PI * 4) * 0.08;
      }
    }
    if (!baslik && c >= 4.4 && c < 7.6 && (zd % 4.5) < 1.3) {   // ileriye, Bilbo'ya doğru işaret eder
      yaw = 0.9; basY = 0.3; basX = -0.1; k0x = -1.45 + Math.sin(t * 9) * 0.12; k0z = -0.35; gulus = 2; hop = 0; ez = 1;
    }
    if (z.basla < 0.8) { const q = z.basla / 0.8; hop = Math.sin(q * Math.PI) * 0.42; ez = 0.94 + Math.sin(q * Math.PI) * 0.14; kanatAc = 0.85; kanatCirp = Math.sin(q * Math.PI * 3) * 0.42; k0z = -2.6; k1z = 2.6; k0x = k1x = -0.3; gulus = 2; yaw = 0.2; kuyY = Math.sin(t * 12) * 0.45; }
    if (z.salla < 1.0) { gulus = 3; gozB = 1.15; basZ += Math.sin(z.salla * 14) * 0.15 * (1 - z.salla); }
  } else if (d === 'cek') {
    const g = typeof CEK !== 'undefined' ? CEK.guc || 0 : 0;
    const gK = clampPr(g, 0, 1), gY = prYum(gK);
    const vx = P.vx || 0, vy = P.vy || 0;
    if (vx < -0.3) R.yon1 = -1; else if (vx > 0.3) R.yon1 = 1;
    const ang = Math.atan2(vy, Math.abs(vx) + 0.001);
    yaw = 0.8 * R.yon1; ofY = 0.38 - gY * 0.05;
    basX = clampPr(-ang * 0.45, -0.5, 0.4);            // uçacağı yöne bakar
    egim = R.yon1 * (0.04 + 0.3 * gY);                 // yaprakla birlikte giderek iyice geriye yaslanır
    kasR = 0.1 + gY * 0.4; kasY = -gY * 0.03; olcek = 1 + gY * 0.1;
    yanak = clampPr((g - 0.08) / 0.62, 0, 1);          // çekildikçe yanaklar kızarır ve şişer
    kanatAc = 0.16 + gY * 0.62;
    kuyX = 0.14 + gY * 0.95 + Math.sin(t * (14 + gK * 24)) * (0.015 + gK * 0.055);
    kuyZ = R.yon1 * (0.05 + gY * 0.18) + Math.cos(t * (16 + gK * 26)) * (0.03 + gK * 0.075);
    ez = 0.98 - gY * 0.13;
    if (g < 0.3) {          // az: merak ve hafif çömelme, kulaklar dikelir
      gulus = 3; gozB = 1.12 + gK * 0.15; basZ = 0.18; k0x = -0.5 - gK * 0.8; k1x = k0x; kuyY = Math.sin(t * 5.5) * 0.42;
      sacX = 0.22 + gK * 0.12; sacZ = Math.sin(t * 7) * 0.06; sacS = 1.12 + gK * 0.08; kanatCirp = Math.sin(t * 10) * 0.04;
    } else if (g < 0.72) {  // orta: heyecan, kulaklar iyice dikelip pürdikkat kesilir, kanatlar fırlamaya hazırlanır
      gulus = 2; gozB = 1.24; k0x = -1.05; k1x = -1.05; k0z = -0.15; k1z = 0.15;
      kuyY = Math.sin(t * 9.5) * 0.28; hop = Math.abs(Math.sin(t * 9)) * 0.03;
      sacX = 0.28 + Math.sin(t * 12) * 0.06; sacZ = Math.sin(t * 10) * 0.08; sacS = 1.2 + Math.sin(t * 14) * 0.04;
      kanatCirp = Math.sin(t * 18) * 0.05 * gK;
    } else {                // tam: gözler kocaman, yanaklar şişer ve kızarır, kulaklar dimdik titrer, kanatlar gergin
      gulus = 0; gozB = 1.42; yanak = 1.05; kanatAc += Math.sin(t * 34) * 0.045 * g; kanatCirp = Math.sin(t * 28) * 0.075 * g;
      k0x = -1.28; k1x = -1.28; k0z = -0.05; k1z = 0.05; ez = 0.78;
      kuyY = 0; sacX = 0.34 + Math.sin(t * 28) * 0.05 * g; sacZ = Math.sin(t * 24) * 0.07 * g; sacS = 1.28 + Math.sin(t * 32) * 0.03 * g;
      ofX = Math.sin(t * 57) * 0.03 * g; ofY += Math.sin(t * 43) * 0.022 * g; basZ = Math.sin(t * 31) * 0.03; egim += Math.sin(t * 47) * 0.03;
    }
  } else if (d === 'ucus') {
    const vx = P.vx || 0, vy = P.vy || 0;
    if (Math.abs(vx) > 0.3) R.yon1 = vx > 0 ? 1 : -1;
    const ang = Math.atan2(vy, Math.abs(vx) + 0.001), ruz = clampPr(hiz / 22, 0, 1);
    const ivK = clampPr(R.ivY / 30, -1, 1);
    const cikisW = prYum((vy - 0.5) / 5.5), inisW = prYum((-vy - 1.5) / 5.5), suzW = Math.max(0, 1 - cikisW - inisW);
    const suzDalga = Math.sin(t * 2.6), suzInisGecis = suzW * (1 - inisW * 0.45);
    yaw = 0.72 * R.yon1; olcek = 1.25;
    egim = R.yon1 * clampPr(-0.26 - ang * 0.85 + ivK * 0.06, -0.7, 0.44) + R.yon1 * suzW * suzDalga * 0.042;
    // kuyruk dümeni: hızla geriye uzanır, süzülmede zarif yay çizer, inişte denge verir
    kuyX = 0.48 + ruz * 0.46 + clampPr(-ang * 0.32, -0.25, 0.28) + suzW * 0.14;
    kuyY = -R.yon1 * clampPr(ang * 0.22, -0.25, 0.25) + Math.sin(t * (5.8 + ruz * 3.5)) * (0.2 + suzW * 0.06) * (1 - ruz * 0.5);
    kuyZ = R.yon1 * clampPr(ang * 0.34, -0.35, 0.35) + Math.cos(t * (5.8 + ruz * 3.5)) * (0.12 + suzW * 0.05) * (1 - ruz * 0.35);
    ayakX = 0.38 + ruz * 0.46 + clampPr(-ang * 0.2, -0.12, 0.22) + suzW * 0.12;
    sacX = -0.25 - ruz * 0.75 + Math.sin(t * 16) * 0.04 + suzW * (0.06 + suzDalga * 0.04) + inisW * (-0.18 + Math.sin(t * 23) * 0.035); sacS = 1 + ruz * 0.15 + suzW * 0.04 + inisW * 0.05;
    // hız, dikey hız ve dikey ivmeye göre organik kanat çırpış ↔ süzülme ↔ paraşüt geçişi
    const cikisCirp = Math.sin(t * (21 + ruz * 6)) * (0.2 + ruz * 0.08);
    const suzCirp = Math.sin(t * (2.6 + ruz * 1.2)) * (0.075 + ruz * 0.04) + Math.sin(t * 14) * (0.02 + ruz * 0.026);
    const inisTit = Math.sin(t * (21 + ruz * 7)) * (0.024 + ruz * 0.022);
    const inisCirp = 0.76 + ruz * 0.14 + Math.sin(t * (5.8 + ruz * 2.4)) * (0.048 + ruz * 0.028) + inisTit;
    kanatAc = cikisW * (1.06 + ruz * 0.06) + suzW * (1.29 + ruz * 0.06 + Math.sin(t * 3.1) * 0.03) + inisW * (1.3 + ruz * 0.06 + Math.sin(t * 14) * (0.022 + ruz * 0.015)) + Math.abs(ivK) * 0.04;
    kanatCirp = cikisW * cikisCirp + suzW * suzCirp + inisW * inisCirp - ivK * 0.14;
    ez = 1 + suzW * Math.sin(t * 3.2 - 0.6) * 0.022 + inisW * (0.04 + Math.sin(t * 14) * 0.015);
    hop = suzW * Math.sin(t * 3.8) * 0.038 + inisW * Math.sin(t * 14) * 0.018;
    basZ = suzW * Math.sin(t * 2.7) * 0.095 + inisW * Math.sin(t * 11) * 0.045;
    basX = cikisW * -0.12 + suzInisGecis * 0.25 + inisW * 0.12;
    basY = suzW * 0.12 * R.yon1;
    ayakX -= inisW * 0.52;
    kuyX -= inisW * 0.16;
    k0x = cikisW * -1.1 + suzW * -1.38 + inisW * -0.25;
    k1x = k0x;
    k0z = cikisW * -1.3 + suzW * (-0.96 + Math.sin(t * 2.9) * 0.06) + inisW * (-1.75 + Math.sin(t * 18) * 0.035);
    k1z = -k0z;
    if (z.takla >= 0 && z.takla < 0.5) takla = R.yon1 * prYum(z.takla / 0.5) * Math.PI * 2;   // tek takla zamanlayıcısı: üst üste binen taklalar sıçramasın
    if (inisW > 0.05) {   // düşerken komik minik panik: kollar çark gibi döner, ayaklar havada pedal çevirir
      const fl = inisW * prYum((-vy - 4) / 4);
      k0x += Math.sin(t * 15) * 0.7 * fl; k1x = k1x + Math.sin(t * 15 + Math.PI) * 0.7 * fl;
      k0z += Math.cos(t * 15) * 0.25 * fl; k1z -= Math.cos(t * 15 + Math.PI) * 0.25 * fl;
      ayakX += Math.sin(t * 13) * 0.3 * fl; basZ += Math.sin(t * 7.5) * 0.06 * fl;
    }
    if (vy > 0.8) { gulus = 2; yanak = Math.max(yanak, 0.3); }
    else if (vy > -3.5) { gulus = 1; gozB = 1.08 + suzW * 0.08; yanak = Math.max(yanak, 0.24 * suzW); agizS = Math.max(agizS, 1 + suzW * 0.07); }
    else { gulus = 3; gozB = 1.32; }
    if (z.birak < 0.38) {    // fırlama: anlık sıkışma (squash) → güçlü uzama (stretch) → yumuşak açılma; kollar öne, kanatlar bir anda açık
      const q = z.birak / 0.38, sik = prPenc(q, 0, 0.22), firla = prYum(q / 0.3), acil = prYum((q - 0.3) / 0.7);
      ez = 0.92 - sik * 0.14 + firla * 0.3 - acil * 0.2; k0x = -2.25; k1x = -2.25; k0z = -0.1; k1z = 0.1; gulus = 2; gozB = z.birak < 0.3 ? 1.24 : 1.15;
      egim = R.yon1 * clampPr(-0.3 - ang * 0.5, -0.7, 0.3); sert = 2; kuyX = 0.95 + firla * 0.14; sacX = -1.04 - firla * 0.14;
      kanatAc = 1.22 + Math.sin(q * Math.PI) * 0.14; kanatCirp = -0.38 * (1 - q);
      basX = clampPr(-ang * 0.35, -0.35, 0.25);
      ayakX = 0.85;
    }
    if (z.kanat < 0.58) {    // güçlü kanat çırpışı: yukarı hazırlık → geniş aşağı vuruş (gövde yükselip esner) → süzülmeye toparlanma
      const q = z.kanat / 0.58;
      if (q < 0.22) {
        const r = prYum(q / 0.22);
        kanatCirp = 0.92 * r; ez = 1 - 0.17 * r; kanatAc = 1.18 + 0.12 * r; ofY = -0.06 * r; basX = 0.18 * r;
        kuyX = 0.35 + 0.2 * r; sacX = -0.18 + 0.22 * r; sacS = 1.04;
        egim += R.yon1 * 0.08 * r;
        ayakX = ayakX + (-0.28 - ayakX) * r;
      } else if (q < 0.56) {
        const r = prYum((q - 0.22) / 0.34);
        kanatCirp = 0.92 - 2.28 * r; ez = 0.83 + 0.43 * r + Math.sin(r * Math.PI) * 0.05; ofY = -0.06 + 0.22 * r + Math.sin(r * Math.PI) * 0.04; kanatAc = 1.35;
        basX = 0.18 - 0.34 * r; basZ += Math.sin(r * Math.PI) * 0.065 * R.yon1; egim += R.yon1 * (0.08 + 0.24 * r);
        kuyX = 0.55 + 0.56 * r; kuyZ += Math.sin(r * Math.PI) * 0.2 * R.yon1;
        sacX = -1.0 * r; sacS = 1 + 0.26 * r; sacZ = Math.sin(r * Math.PI) * 0.16 * R.yon1;
        ayakX = -0.25 + 0.3 * r;
      } else {
        const r = prYum((q - 0.56) / 0.44);
        kanatCirp = -1.36 * (1 - r) + 0.16 * r; ez = 1.26 - 0.23 * r - Math.sin(r * Math.PI) * 0.04; ofY = 0.16 * (1 - r);
        kanatAc = 1.35 - 0.03 * r; egim += R.yon1 * 0.32 * (1 - r); basZ -= Math.sin(r * Math.PI) * 0.045 * R.yon1;
        kuyX = 1.11 * (1 - r) + 0.78 * r; sacX = -1.0 * (1 - r) - 0.45 * r; sacS = 1.26 - 0.12 * r;
        ayakX = 0.05 - 0.3 * r;
      }
      gulus = 2; gozB = 1.18 + 0.05 * Math.sin(q * Math.PI); k0z = -1.72; k1z = 1.72; k0x = -0.9; k1x = -0.9;
    }
    if (z.kanat >= 0.32 && z.kanat < 0.90) {    // çırpıştan hemen sonra 0.58 sn'lik süzülme penceresiyle uyumlu zarif süzülme pozu
      const suzPozW = prYum((z.kanat - 0.32) / 0.20) * (1 - prYum((z.kanat - 0.58) / 0.32)) * (1 - inisW * 0.55);
      const ruzSal = Math.sin(t * 4.2), ruzTit = Math.sin(t * 9.5);
      const suzEgim = R.yon1 * clampPr(-0.24 - ang * 0.72 + ruzSal * 0.052 * (0.5 + ruz * 0.5), -0.62, 0.35);
      kanatAc = kanatAc + (1.32 + ruzSal * 0.045 - kanatAc) * suzPozW;
      kanatCirp = kanatCirp + (0.16 + Math.sin(t * 5.6) * 0.075 + ruzTit * 0.028 * (0.4 + ruz * 0.6) - kanatCirp) * suzPozW;
      egim = egim + (suzEgim - egim) * suzPozW;
      basX = basX + (0.2 - ruzSal * 0.028 - basX) * suzPozW;
      basY = basY + (0.1 * R.yon1 - basY) * suzPozW;
      basZ = basZ + (Math.sin(t * 3.6) * 0.11 - basZ) * suzPozW;
      k0x = k0x + (-1.35 - k0x) * suzPozW; k1x = k0x;
      k0z = k0z + (-0.9 - k0z) * suzPozW; k1z = -k0z;
      kuyX = kuyX + (0.76 + ruz * 0.26 + ruzSal * 0.055 + clampPr(-ang * 0.16, -0.14, 0.16) - kuyX) * suzPozW;
      kuyY = kuyY + (Math.sin(t * 6.2 - 0.5) * (0.17 + ruz * 0.07) - kuyY) * suzPozW;
      kuyZ = kuyZ + (Math.cos(t * 4.8 - 0.4) * (0.12 + ruz * 0.05) - kuyZ) * suzPozW;
      sacX = sacX + (-0.52 - ruz * 0.38 + ruzSal * 0.048 + Math.sin(t * 10.5 - 0.6) * (0.048 + ruz * 0.03) - sacX) * suzPozW;
      sacZ = sacZ + (Math.sin(t * 8.5 - 0.4) * (0.07 + ruz * 0.03) - sacZ) * suzPozW;
      sacS = sacS + (1.06 + ruz * 0.12 + ruzTit * 0.025 - sacS) * suzPozW;
      ayakX = ayakX + (-0.55 - ayakX) * suzPozW;
      ez = ez + (1.03 + Math.sin(t * 4.5 - 0.7) * 0.03 - ez) * suzPozW;
      hop = hop + (Math.sin(t * 4.5) * 0.046 + ruzTit * 0.014 - hop) * suzPozW;
      if (suzPozW > 0.25) {
        gulus = 2;
        gozB = Math.max(gozB, 1.15 + suzPozW * 0.09);
        agizS = Math.max(agizS, 1 + suzPozW * 0.14 + Math.sin(t * 6) * 0.035 * suzPozW);
        yanak = Math.max(yanak, 0.42 * suzPozW);
      }
    }
    if (z.birak < 0.28) { gulus = 2; gozB = Math.max(gozB, 1.2); }
    sacX -= Math.abs(kanatCirp) * 0.18 + Math.max(0, -kanatCirp) * 0.22;
    sacZ += Math.sin(t * 18) * 0.045 * ruz - kanatCirp * 0.06 * R.yon1;
    if (z.yildiz < 0.6) {    // yıldız: dönüp yakalar, sevinir (parlak göz + kızarık yanak + neşeli kanat + kulak kıpırtısı)
      const q = z.yildiz / 0.6, yw = Math.sin(q * Math.PI);
      const kk = R.yon1 >= 0 ? 0 : 1; if (kk === 0) { k0x = -2.9; k0z = -0.6; } else { k1x = -2.9; k1z = 0.6; }
      gulus = 2; gozB = Math.max(gozB, 1.3 + 0.14 * yw + Math.sin(q * Math.PI * 3) * 0.04 * yw);
      agizS = Math.max(agizS, 1 + 0.18 * yw); yanak = Math.max(yanak, 0.62 * yw + Math.sin(q * Math.PI * 4) * 0.08 * yw);
      kanatAc = Math.max(kanatAc, 1.28 + 0.07 * yw);
      kanatCirp = kanatCirp * (1 - 0.55 * yw) + Math.sin(q * Math.PI * 5) * 0.34 * yw;
      ez = 1 + yw * 0.12; kuyY = Math.sin(t * 14) * 0.45;
      sacX = sacX * (1 - 0.5 * yw) + (0.18 + Math.sin(q * Math.PI * 4) * 0.14) * yw;
      sacZ += Math.sin(q * Math.PI * 5) * 0.18 * yw;
      sacS = Math.max(sacS, 1.18 + 0.1 * Math.sin(q * Math.PI * 3) * yw);
    }
    if (z.sek < 0.55 && R.sekTur !== 'yer') { gulus = z.sek < 0.3 ? 3 : 2; gozB = 1.35; k0z = -1.8; k1z = 1.8; }
    if (z.sek < 0.58 && R.sekTur === 'mantar') {
      const q = z.sek / 0.58, w = Math.sin(q * Math.PI), yay = Math.sin(q * Math.PI * 3) * (1 - q);
      ez = 1 + w * 0.14 - yay * 0.08;
      yanak = Math.max(yanak, 0.48 * w); agizS = Math.max(agizS, 1 + 0.18 * w);
      basZ += Math.sin(q * Math.PI * 3) * 0.18 * w; basX -= 0.08 * w;
      kanatAc = Math.max(kanatAc, 1.24 + 0.08 * w); kanatCirp = kanatCirp * (1 - 0.4 * w) + Math.sin(q * Math.PI * 4) * 0.28 * w;
      sacX = sacX * (1 - 0.5 * w) + (0.2 + Math.sin(q * Math.PI * 4) * 0.16) * w;
      sacS = Math.max(sacS, 1.18 + 0.1 * w);
      kuyY = Math.sin(t * 17) * 0.55; kuyX = 0.2 + 0.25 * w;
      ayakX += (-0.28 + Math.sin(q * Math.PI * 4) * 0.22) * w;
    }
    if (z.sek < 0.54 && R.sekTur === 'nilufer') {
      const q = z.sek / 0.54, w = Math.sin(q * Math.PI);
      gulus = 2; ez = 1 + w * 0.1;
      yanak = Math.max(yanak, 0.44 * w); agizS = Math.max(agizS, 1 + 0.16 * w);
      basZ += Math.sin(q * Math.PI * 4) * 0.16 * w; basX -= 0.1 * w;
      kanatAc = Math.max(kanatAc, 1.26 + 0.06 * w); kanatCirp = kanatCirp * (1 - 0.45 * w) + Math.sin(q * Math.PI * 5) * 0.32 * w;
      sacX = sacX * (1 - 0.45 * w) + (0.14 + Math.sin(q * Math.PI * 4) * 0.12) * w;
      sacZ += Math.sin(q * Math.PI * 5) * 0.16 * w;
      kuyY = Math.sin(t * 18) * 0.52;
      ayakX += Math.sin(q * Math.PI * 6) * 0.34 * w;
    }
    if (z.halka < 0.55) {    // halka geçişi: neşeli kanat açma + hızlı sevinç dönüşü + göz/kulak sevinci
      const q = z.halka / 0.55, w = Math.sin(q * Math.PI);
      kanatAc = Math.max(kanatAc, 1.3 + 0.05 * w);
      kanatCirp = kanatCirp * (1 - 0.55 * w) + Math.sin(q * Math.PI * 4) * 0.38 * w;
      k0z = -2.0; k1z = 2.0; gulus = 2; gozB = Math.max(gozB, 1.3 + 0.12 * w);
      agizS = Math.max(agizS, 1 + 0.2 * w);
      ez = 1 + w * 0.12; basZ += Math.sin(q * Math.PI * 4) * 0.16 * w;
      sacX = sacX * (1 - 0.55 * w) + (0.16 + Math.sin(q * Math.PI * 5) * 0.16) * w;
      sacZ += Math.sin(q * Math.PI * 6) * 0.22 * w;
      sacS = Math.max(sacS, 1.24 + 0.08 * Math.sin(q * Math.PI * 4) * w);
      kuyY = Math.sin(t * 18) * 0.55; yanak = Math.max(yanak, 0.58 * w);
    }
    if (z.ruzgar < 0.45) {   // rüzgâr sütunu: kanatları yukarı açıp neşeyle gülümseyerek yükselme
      const q = z.ruzgar / 0.45, w = Math.sin(q * Math.PI);
      kanatAc = Math.max(kanatAc, 1.3 + 0.05 * w);
      kanatCirp = kanatCirp * (1 - 0.65 * w) + (0.68 + Math.sin(q * Math.PI * 3) * 0.14) * w;
      hop += 0.22 * w;
      ez = 1 + 0.14 * w;
      gulus = 2; gozB = Math.max(gozB, 1.24 + 0.1 * w);
      agizS = Math.max(agizS, 1 + 0.16 * w);
      k0z = Math.min(k0z, -1.75); k1z = Math.max(k1z, 1.75);
      basX -= 0.12 * w; basZ += Math.sin(q * Math.PI * 3) * 0.1 * w;
      sacX -= 0.35 * w;
      sacZ += Math.sin(q * Math.PI * 5) * 0.14 * w;
      sacS = Math.max(sacS, 1.16 + 0.08 * w);
      yanak = Math.max(yanak, 0.48 * w);
    }
    if (z.kanatBos < 0.5) {   // kanat hakkı bitmiş: minik boşta pırpır, omuz silkme, kıkır
      const q = z.kanatBos / 0.5, w = Math.sin(q * Math.PI);
      kanatCirp = kanatCirp * (1 - w) + Math.sin(q * Math.PI * 8) * 0.3 * w; k0z = k0z * (1 - w) - 0.3 * w; k1z = k1z * (1 - w) + 0.3 * w;
      k0x = k0x * (1 - w) - 0.5 * w; k1x = k0x; basZ += Math.sin(q * Math.PI * 4) * 0.12 * w; hop += w * 0.06;
      gulus = 2; agizS = 1 + Math.abs(Math.sin(q * Math.PI * 6)) * 0.2 * w; gozB = 1 - 0.75 * w; kirpZorla = w > 0.4; yanak = Math.max(yanak, 0.5 * w);
    }
  } else if (d === 'yuvar') {
    // sevimli yuvarlanma; durunca şaşkın-sevimli göz kırpma, kuyruk kıvrılması, başını sallar, kıkırdar
    const yavas = hiz < 0.6;
    if (!yavas || zd < 0.3) {
      dondur = P.aci || 0; ez = 0.92;
      k0x = -1.2; k1x = -1.2; kanatAc = -0.35; basX = 0.3; gozB = 0.15; kirpZorla = true; gulus = 2;
      kuyX = 1.05 + Math.sin(t * 20) * 0.12; kuyZ = 0.25 * R.yon1; sacX = -0.4;
      if (Math.abs(P.vx || 0) > 0.3) R.yon1 = P.vx > 0 ? 1 : -1;
      R.yerT = -1;
    } else {
      if (R.yerT < 0) { R.yerT = 0; v.ez -= 4; }
      const yt = (R.yerT += dt);
      yaw = 0.3 * R.yon1; ofY = -0.06;
      basY = Math.sin(yt * 11) * 0.4 * Math.max(0, 1 - yt / 0.5);              // başını sallar
      basZ = Math.sin(yt * 5) * 0.15;
      const kik = Math.sin(yt * 22);                                            // kıkır kıkır: omuzlar oynar
      k0z = -0.5 + kik * 0.25; k1z = 0.5 - kik * 0.25; k0x = -0.6; k1x = -0.6; ez = 0.94 + Math.abs(kik) * 0.04;
      agizS = 1 + kik * 0.15;
      kanatCirp = Math.sin(yt * 40) * 0.35 * prPenc(yt, 0.2, 0.7);
      if (yt < 0.22) {
        gulus = 3; gozB = 0.22; kirpZorla = true;
        kuyX = 0.95; kuyZ = 0.35 * R.yon1; kuyY = Math.sin(yt * 8) * 0.2;
      } else if (yt < 0.5) {
        const sask = prPenc(yt, 0.26, 0.36) + prPenc(yt, 0.38, 0.48);
        const acil = prYum((yt - 0.22) / 0.26);
        gulus = 3; gozB = 1.28 - sask * 1.1; kirpZorla = true;
        kuyX = 0.95 - acil * 0.5; kuyY = Math.sin(yt * 10) * 0.45; kuyZ = Math.cos(yt * 10) * 0.32 * R.yon1;
      } else {
        gulus = 2; gozB = 1.06; kirpZorla = false;
        kuyX = 0.4 + Math.sin(yt * 6) * 0.14; kuyY = Math.sin(yt * 12) * 0.45; kuyZ = Math.cos(yt * 12) * 0.24;
        const sw = prPenc(yt, 0.5, 0.98);
        if (sw > 0) {   // ıslak köpek gibi komik silkinme: baştan kuyruğa dalga, gözler mutlu kısık
          const q = Math.sin(yt * 40);
          egim = q * 0.13 * sw; basY = -q * 0.38 * sw; basZ = Math.sin(yt * 40 - 0.8) * 0.2 * sw; sacZ = Math.sin(yt * 40 - 1.4) * 0.25 * sw; sacX -= 0.2 * sw;
          kuyY = Math.sin(yt * 40 - 2.2) * 0.7 * sw; kanatAc = 0.6; kanatCirp = Math.sin(yt * 40 - 1) * 0.5 * sw; ofX = q * 0.025 * sw;
          gozB = 1.06 - 0.9 * sw; kirpZorla = sw > 0.3; ez = 0.96 + Math.abs(q) * 0.05 * sw;
        }
      }
    }
  } else if (d === 'don') {
    // toz silkeler, sonra neşeyle zıplaya zıplaya salıncağa döner
    R.yon1 = (typeof D !== 'undefined' ? D.sapan.x : 0) >= P.x ? 1 : -1;
    if (zd < 0.28) {        // toz silkeleme: kol gövdeye vurur, kanat titrer, gülüş
      const q = Math.sin(zd * 45);
      yaw = 0.45 * R.yon1; k0x = -0.6 + q * 0.5; k0z = -0.1; k1x = -0.6 - q * 0.5; k1z = 0.1;
      kanatCirp = q * 0.4; ofX = q * 0.03; gulus = 2; gozB = 0.16; kirpZorla = true; ez = 0.9 + Math.abs(q) * 0.05; basY = -q * 0.25; egim = q * 0.08;
    } else {
      yaw = 0.95 * R.yon1;
      const f = 9.5, h = Math.abs(Math.sin(t * f));
      hop = h * 0.24; ez = 0.9 + h * 0.18; egim = -R.yon1 * 0.15;
      k0x = Math.sin(t * f) * 1.15 - 0.3; k1x = -Math.sin(t * f) * 1.15 - 0.3; k0z = -0.45; k1z = 0.45;
      kanatAc = 0.65; kanatCirp = Math.sin(t * f * 2) * 0.35 - 0.1;
      kuyY = Math.sin(t * f) * 0.5; kuyZ = Math.cos(t * f) * 0.2; kuyX = 0.35 + h * 0.15;
      sacX = -0.35; gulus = 2; basX = -h * 0.1; basZ = Math.sin(t * f) * 0.12;
    }
  } else if (d === 'kavus') {
    const k = z.kavus, bx = typeof D !== 'undefined' ? D.hedef.x : 46;
    R.yon1 = bx >= P.x ? 1 : -1;
    yaw = 0.6 * R.yon1; gulus = 2; gozB = 1.08; kanatAc = 0.9;
    kuyY = Math.sin(t * 11) * 0.55; kuyZ = Math.cos(t * 11) * 0.24; kuyX = 0.25;
    if (k < 0.45) {                      // iniş: yumuşak ezilme + kanat toplama + şaşkın sevinç
      const q = k / 0.45, inis = prYum(q), ezCok = Math.sin(q * Math.PI);
      gulus = 3; gozB = 1.32; ez = 0.96 - 0.04 * inis - 0.14 * ezCok; kanatAc = 1.24 - 0.24 * inis;
      kanatCirp = 0.35 + Math.sin(k * 30) * 0.2 * (1 - q); sacX = -0.22 * (1 - q) + ezCok * 0.16; k0z = -1.5; k1z = 1.5;
      basX = ezCok * 0.18; ayakX = -0.35 * (1 - inis);
      kuyY = Math.sin(t * 14) * 0.4; kuyZ = Math.cos(t * 14) * 0.22;
    } else if (k < 1.05) {               // Bilbo'ya neşeyle zıplayarak koşar, kollarını sarılmaya uzatır
      const q = (k - 0.45) / 0.6, h = Math.abs(Math.sin(q * Math.PI * 3));
      ofX = R.yon1 * prYum(q) * 0.5; hop = h * 0.25; ez = 0.91 + h * 0.15;
      yaw = 0.95 * R.yon1; k0x = -1.45; k1x = -1.45; k0z = -0.95; k1z = 0.95; egim = -R.yon1 * 0.15;
      kanatAc = 1.04; kanatCirp = Math.sin(t * 20) * 0.38; kuyY = Math.sin(t * 16) * 0.68; kuyZ = Math.cos(t * 16) * 0.32;
    } else if (k < 2.25) {               // tatlı sarılma + uyumlu salınım + kıkırdama + yanak kızarması
      const s = Math.sin((k - 1.05) * 6);
      ofX = R.yon1 * 0.64; yaw = 0.82 * R.yon1; egim = -R.yon1 * 0.14 + s * 0.065;
      k0x = -1.58; k1x = -1.58; k0z = 0.38; k1z = -0.38;
      kanatAc = 0.84 + Math.sin(k * 12) * 0.09; kanatCirp = Math.sin(t * 15) * 0.26;
      kuyY = Math.sin(t * 18) * 0.75; kuyZ = Math.cos(t * 18) * 0.36; kuyX = 0.4;
      yanak = 0.92; basX = 0.08 + Math.sin(k * 9) * 0.05;
      const yg = prYum((k - 1.65) / 0.3);   // yalanınca kıkırdar; sonra yanak yanağa Feza'ya döner
      if (k > 1.2) {
        gozB = 0.24 + yg * 0.96; kirpZorla = yg < 0.5; basZ = R.yon1 * (0.22 - yg * 0.04) + s * 0.085 * (1 - yg);
        const kik = Math.sin(k * 24) * (1 - yg); ez = 0.97 + Math.abs(kik) * 0.055; agizS = 1 + kik * 0.15;
      }
      ofX = R.yon1 * (0.5 - yg * 0.02); yaw = (0.7 - yg * 0.28) * R.yon1; basY = -(0.45 + 0.05 * yg) * R.yon1; basX -= 0.1; gulus = 2;
    } else if (k < 3.25) {               // hazırlık çökmesi + birlikte 2 kez senkronize sevinç zıplaması + kanat çırpma
      const q = k - 2.25, cok = prPenc(q, 0, 0.14), p = clampPr((q - 0.08) / 0.88, 0, 1), h = Math.abs(Math.sin(p * Math.PI * 2));
      ofX = R.yon1 * 0.48 * (1 - prYum(q));
      hop = h * 0.54; ez = 0.92 - cok * 0.12 + h * 0.24; yaw = 0.28 * R.yon1; gozB = 1.24;
      k0z = -2.5 - h * 0.28; k1z = 2.5 + h * 0.28; k0x = -0.3; k1x = -0.3; yanak = 0.5 * (1 - q);
      kanatAc = 1.26; kanatCirp = Math.sin(t * 20) * 0.32 - 0.12 - h * 0.2; sacX = -0.35 - h * 0.28;
      kuyY = Math.sin(t * 18) * 0.8; kuyZ = Math.cos(t * 18) * 0.38; kuyX = 0.45;
    } else {                             // uyumlu zafer dansı ↔ kameraya el sallama (kalp-kuyruk sekiz çizer)
      const c = (k - 3.25) % 5;
      if (c < 2.5) {
        const q = Math.sin(c * Math.PI * 1.6), h = Math.abs(q), w = prYum(c / 0.25) * (1 - prYum((c - 2.25) / 0.25));
        ofX = q * 0.08 * w; yaw = 0.24 + q * 0.24 * w; egim = q * 0.15 * w; hop = h * 0.2 * w; ez = 0.95 + h * 0.12 * w;
        k0z = -1.4 - Math.max(0, q) * 1.25 * w; k1z = 1.4 + Math.max(0, -q) * 1.25 * w; k0x = k1x = -0.3;
        basZ = -q * 0.18 * w; basX = -h * 0.08 * w;
        gozB = 1.12 + h * 0.1 * w; agizS = 1 + h * 0.14 * w; yanak = 0.35 + h * 0.24 * w;
        sacX = -0.15 + Math.sin(c * Math.PI * 3.2) * 0.12 * w; sacZ = -q * 0.14 * w;
        kanatAc = 0.98 + h * 0.08 * w; kanatCirp = Math.sin(t * 15) * 0.34;
        kuyY = Math.sin(t * 11) * 0.76; kuyZ = Math.cos(t * 11) * 0.38; kuyX = 0.28 + h * 0.22;
      } else {
        const w = prYum((c - 2.5) / 0.28) * (1 - prYum((c - 4.72) / 0.28));
        yaw = 0.14; k0x = -0.2; k0z = -2.72 + Math.sin(t * 11) * 0.36 * w; k1z = 0.35;
        basZ = 0.14 + Math.sin(t * 4) * 0.04 * w; basY = -0.1;
        hop = Math.abs(Math.sin(t * 4.5)) * 0.09 * w; ez = 0.97 + hop * 0.45;
        yanak = 0.28 * w; agizS = 1 + 0.08 * w;
        kanatAc = 0.74; kanatCirp = Math.sin(t * 8) * 0.16;
        kuyY = Math.sin(t * 9) * 0.58; kuyZ = Math.cos(t * 9) * 0.26;
      }
    }
  }
  if (d === 'kavus' && z.kavus > 3.25 && (R.coskun || R.son)) {   // 5 yıldız / son bölüm: Bilbo dönerken Pırıl havada takla atar
    const c = (z.kavus - 3.25) % 5;
    hop *= R.son ? 1.7 : 1.4;
    if (c > 2.55 && c < 3.35) {
      const q = (c - 2.55) / 0.8;
      takla = -R.yon1 * prYum(q) * Math.PI * 2; hop += Math.sin(q * Math.PI) * (R.son ? 0.75 : 0.5);
      kanatAc = 1.3; kanatCirp = Math.sin(t * 22) * 0.45; gulus = 2; gozB = 1.25; k0z = -2.4; k1z = 2.4; k0x = k1x = -0.3; yanak = 0.6;
    }
  }
  // ikincil hareket: gövdenin dikey ivmesi kuyruk/kulak/kanada gecikmeli yansır
  const kx = R.kok.position.x, ky = R.kok.position.y;
  const vyG = (ky - R.onY) / dt; R.onY = ky; R.onX = kx;
  const ay = clampPr((vyG - R.onVy) / dt, -80, 80); R.onVy = vyG;
  R.ivY += (ay - R.ivY) * prUs(dt, 20);
  if (Math.abs(R.ivY) < 70) { v.kuyX -= R.ivY * 0.05 * dt; v.sacX -= R.ivY * 0.06 * dt; v.kanatCirp -= R.ivY * 0.03 * dt; }
  if (d === 'ucus') {
    const kHiz = clampPr(v.kanatCirp, -12, 12);
    v.ofY -= kHiz * 0.018 * dt;
    v.ez -= kHiz * 0.035 * dt;
  }
  // göz kırpma (yumuşak ritim, ara sıra çift)
  if (z.kirp > 0 && z.kirp > 2.4 + (Math.sin(t * 1.7) + 1) * 1.6) { z.kirp = -0.13; R.cifte = Math.sin(t * 3.3) > 0.6 ? 1 : 0; }
  if (z.kirp > -0.01 && z.kirp < 0 && R.cifte) { R.cifte = 0; z.kirp = -0.32; }
  let kirpF = 1;
  if (z.kirp < 0) {
    if (z.kirp > -0.13) kirpF = 1 - 0.88 * Math.sin(((z.kirp + 0.13) / 0.13) * Math.PI);
    else if (z.kirp <= -0.19 && z.kirp > -0.32) kirpF = 1 - 0.88 * Math.sin(((z.kirp + 0.32) / 0.13) * Math.PI);
  }
  // yaylarla yumuşat
  if (dondur === null) prAciYayla(R, 'yaw', yaw, dt, sert === 3 ? 400 : 110 * sert, sert === 3 ? 0.9 : 0.62);
  if (dondur !== null) { s.egim = 0; v.egim = 0; } else prYayla(R, 'egim', egim, dt, d === 'ucus' ? 150 : 90, 0.45);
  prYayla(R, 'ez', ez, dt, 260, 0.3);
  prYayla(R, 'gozB', gozB, dt, 320, 0.5);
  prYayla(R, 'kanatAc', kanatAc, dt, 220, 0.42);
  prYayla(R, 'kanatCirp', kanatCirp, dt, 600, 0.6);
  prYayla(R, 'kanatEsne', clampPr(-v.kanatCirp * 0.024 - R.ivY * 0.004, -0.28, 0.28), dt, 190, 0.34);
  prYayla(R, 'k0x', k0x, dt, 170, 0.55); prYayla(R, 'k1x', k1x, dt, 150, 0.55);   // iki kol biraz farklı: üst üste binen eylem
  prYayla(R, 'k0z', k0z, dt, 170, 0.55); prYayla(R, 'k1z', k1z, dt, 150, 0.55);
  prYayla(R, 'basX', basX, dt, 90, 0.7); prYayla(R, 'basY', basY, dt, 70, 0.75); prYayla(R, 'basZ', basZ, dt, 90, 0.6);
  prYayla(R, 'kuyX', kuyX, dt, 60, 0.22); prYayla(R, 'kuyY', kuyY, dt, 45, 0.25); prYayla(R, 'kuyZ', kuyZ, dt, 55, 0.25);
  prYayla(R, 'sacX', sacX, dt, 120, 0.22); prYayla(R, 'sacZ', sacZ, dt, 130, 0.28); prYayla(R, 'sacS', sacS, dt, 120, 0.3);
  prYayla(R, 'ayakX', ayakX, dt, 160, 0.55);
  if (gulus === 3 || gozB > 1.26) { kasY = Math.max(kasY, 0.035); kasR = Math.min(kasR, -0.2); }
  prYayla(R, 'kasY', kasY, dt, 200, 0.5); prYayla(R, 'kasR', kasR, dt, 200, 0.5);
  for (let i = 0; i < 2; i++) { const g = R.kas[i], x = g.userData.x; g.position.y = 0.335 + clampPr(s.kasY, -0.04, 0.06); g.rotation.z = x * clampPr(s.kasR, -0.4, 0.55); }
  prYayla(R, 'yanak', yanak, dt, 200, 0.5);
  prYayla(R, 'ofX', ofX, dt, 160, 0.7); prYayla(R, 'ofY', ofY, dt, 160, 0.5);
  s.olcek += (olcek - s.olcek) * prUs(dt, 12);
  // yerleştir
  R.yon.scale.setScalar(0.58 * s.olcek);
  R.kok.position.set(P.x + s.ofX, P.y + s.ofY + hop + (takla ? 0.35 * Math.sin(Math.abs(takla) / 2) : 0), 0);
  R.kok.rotation.z = dondur !== null ? -dondur : s.egim + takla;
  R.yon.rotation.y = s.yaw;
  const eY = clampPr(s.ez, 0.55, 1.5), eX = 1 / Math.sqrt(eY);
  R.ez.scale.set(eX, eY, eX);
  // bakış: gözbebekleri gittiği yöne / Bilbo'ya / Feza'ya kayar (baştan önce davranır)
  let bX = 0, bY = 0;
  if (d === 'bekle') { bX = clampPr(basY * 0.07, -0.03, 0.03) + (((Math.floor(t * 0.75) * 7) % 3) - 1) * 0.011 * (baslik ? 0.5 : 1); bY = clampPr(-basX * 0.06, -0.025, 0.03); }
  else if (d === 'cek') { bX = 0.026 * R.yon1; bY = 0.018 + Math.sin(t * 23) * 0.003; }
  else if (d === 'ucus') { bX = 0.028 * R.yon1; bY = clampPr((P.vy || 0) / 10, -1, 1) * 0.026; if (z.yildiz < 0.5 || z.halka < 0.5) { bX = 0; bY = 0.01; } }
  else if (d === 'yuvar') { const yt = R.yerT < 0 ? 0 : R.yerT; const sw = Math.max(0, 1 - yt / 1.1); bX = Math.sin(yt * 13) * 0.03 * sw; bY = Math.cos(yt * 13) * 0.02 * sw; }
  else if (d === 'don') { bX = 0.024 * R.yon1; }
  else if (d === 'kavus') { bX = z.kavus < 2.25 ? 0.026 * R.yon1 : 0; bY = z.kavus < 2.25 ? 0.006 : 0; }
  const bu = prUs(dt, d === 'yuvar' ? 30 : 14); R.bakX += (bX - R.bakX) * bu; R.bakY += (bY - R.bakY) * bu;
  R.bebek.position.set(R.bakX, R.bakY, 0);
  R.goz.scale.set(clampPr(s.gozB, 0.6, 1.45), Math.max(0.08, clampPr(s.gozB, 0.1, 1.5) * (kirpZorla ? 1 : kirpF)), 1);
  for (let i = 0; i < R.kanat.length; i++) {
    const g = R.kanat[i], x = g.userData.x, ac = clampPr(s.kanatAc, -0.5, 1.35), a0 = Math.max(0, ac), cirp = clampPr(s.kanatCirp, -1.5, 1.5);
    const esne = clampPr(s.kanatEsne, -0.28, 0.28);
    const suzEsne = d === 'ucus' ? Math.sin(t * 7.5 - x * 0.45) * 0.026 * a0 : 0;
    const dalga = Math.sin(t * 9.5 - x * 0.5) * 0.018 * (0.3 + Math.abs(cirp) * 0.7);
    const kanatOlc = 1 + Math.min(a0, 1.25) * 0.88 + Math.max(0, -cirp) * 0.12;
    g.rotation.set(-a0 * 0.24 - cirp * 0.24 + esne * 0.52, x * (1.22 - ac * 0.48 - cirp * 0.16 + suzEsne + dalga), x * (0.25 + ac * 0.45 + cirp + esne * 0.42 + suzEsne * 0.65));
    g.scale.set(kanatOlc * (1 + Math.abs(esne) * 0.28), kanatOlc * (1 + Math.abs(cirp) * 0.065 + esne * 0.14), kanatOlc);
  }
  const kanatParla = z.kanat < 0.55 ? 1 - prYum(z.kanat / 0.55) : 0;
  const yildizParla = z.yildiz < 0.55 ? (1 - prYum(z.yildiz / 0.55)) * 0.75 : 0;
  const halkaParla = z.halka < 0.55 ? (1 - prYum(z.halka / 0.55)) * 0.7 : 0;
  const ruzgarParla = z.ruzgar < 0.45 ? (1 - prYum(z.ruzgar / 0.45)) * 0.6 : 0;
  const suzParla = d === 'ucus' ? Math.max(z.kanat >= 0.32 && z.kanat < 0.90 ? 0.22 * prPenc(z.kanat, 0.32, 0.90) : 0, 0.14 * clampPr(1 - Math.abs(P.vy || 0) / 4.5, 0, 1)) : 0;
  prMatZar.emissiveIntensity = 0.22 + 0.63 * Math.max(kanatParla, yildizParla, halkaParla, ruzgarParla, suzParla);
  R.kol[0].rotation.set(s.k0x, 0, s.k0z); R.kol[1].rotation.set(s.k1x, 0, s.k1z);
  R.bas.rotation.set(s.basX, s.basY, s.basZ - (d === 'ucus' && !takla ? s.egim * 0.55 : 0));
  R.basM.scale.set(1 + s.yanak * 0.07, 1 - s.yanak * 0.02, 1 + s.yanak * 0.03);
  const ykKiz = clampPr(s.yanak, 0, 1.2);
  R.yanak.scale.set(1 + ykKiz * 0.32, 1 + ykKiz * 0.24, 1 + ykKiz * 0.28);
  prMatYanak.emissiveIntensity = 0.14 + ykKiz * 0.58;
  prMatYanak.opacity = clampPr(0.58 + ykKiz * 0.42, 0.58, 1);
  R.sac.rotation.set(clampPr(s.sacX, -1.3, 0.6), 0, clampPr(s.sacZ, -0.25, 0.25)); R.sac.scale.set(clampPr(s.sacS, 0.85, 1.3), 1 + Math.max(0, s.sacS - 1) * 0.55, 1);
  R.kuyruk.rotation.set(clampPr(s.kuyX, -0.6, 1.3), s.kuyY, s.kuyZ);
  for (let i = 0; i < R.ayak.length; i++) {
    const g = R.ayak[i], ax = clampPr(s.ayakX, -0.65, 1.05);
    g.rotation.set(ax, 0, -g.userData.x * ax * 0.14);
  }
  R.agiz.scale.set(1, agizS, 1);
  const gl = gulus;
  R.agizGul.visible = gl === 0 || gl === 1; R.agizO.visible = gl === 3; R.agizKoca.visible = gl === 2;
  R.agizGul.scale.set(gl === 0 ? 0.75 : 1, gl === 0 ? 0.6 : 1, 1);   // tam çekişte dudaklar sıkılı (yanaklar şişkin)
  prBilboGuncelle(dt, t);
}

function prBilboGuncelle(dt, t) {
  const B = prBilbo, s = B.s, z = B.zaman;
  for (const k in z) z[k] += dt;
  const hx = typeof D !== 'undefined' ? D.hedef.x : 46, hy = typeof D !== 'undefined' ? D.hedef.y : 0;
  const ddx = P.x - hx, ddy = P.y - hy, mes = Math.hypot(ddx, ddy), dP = P.durum;
  const baslik = typeof window !== 'undefined' && window.ARAYUZ && window.ARAYUZ.baslikAcik;
  let yaw = ddx > 0.3 ? 0.75 : -0.75, basX = clampPr(-Math.atan2(ddy - 1, Math.abs(ddx) + 2) * 0.6, -0.55, 0.35), basY = 0.12, basZ = 0,
    zip = 0, pati = 0, kuyHiz = 9, kuyGen = 0.45, ofX = 0, otur = 0, egil = 0, kulX = 0, kulZ = 0, kulS = 1, gozB = 1, gozKapa = false, yawSert = 0, heyecanGuc = 0, dilYala = 0;
  if (dP === 'kavus') {
    const k = z.kavus;
    kuyHiz = 26; kuyGen = 0.85; kulS = 1.2; gozB = 1.08; heyecanGuc = 0.65;
    if (k < 0.45) {
      zip = Math.abs(Math.sin(k * 9)) * 0.52; kulX = -0.5 - Math.abs(Math.sin(k * 10)) * 0.35; kulZ = Math.sin(k * 12) * 0.12; basZ = Math.sin(k * 9) * 0.14;
      pati = Math.abs(Math.sin(k * 11)) * 0.45; gozB = 1.14;
    } else if (k < 1.05) {
      const q = (k - 0.45) / 0.6;
      ofX = -0.48 * prYum(q); zip = Math.abs(Math.sin(q * Math.PI * 3)) * 0.32;
      kulX = -0.4 - Math.abs(Math.sin(k * 14)) * 0.32; kulZ = Math.sin(k * 14) * 0.14; basZ = -0.08 + Math.sin(q * Math.PI * 3) * 0.08;
    } else if (k < 2.25) {
      const s = Math.sin((k - 1.05) * 6);
      const yanak = prYum((k - 1.65) / 0.3);          // önce Pırıl'ı yalar, sonra yanağını ona yaslayıp Feza'ya bakar
      ofX = -0.48 + yanak * 0.04; egil = -0.08; basX = (0.18 + Math.sin(k * 18) * 0.2) * (1 - yanak) - 0.05 * yanak; basY = 0.52 * (1 - yanak) + (0.78 + Math.sin(k * 5) * 0.05) * yanak; basZ = -0.14 - s * 0.08 + yanak * 0.12;
      zip = 0.04; pati = 0.65; kuyHiz = 28; kuyGen = 0.92; heyecanGuc = 0.78;
      if (k > 1.15 && k < 1.65) dilYala = prPenc(k, 1.15, 1.65);
      kulX = -0.28 - Math.abs(Math.sin(k * 16)) * 0.3; kulZ = Math.sin(k * 12) * 0.14; kulS = 1.18 + Math.sin(k * 14) * 0.06;
      if (k > 1.7 && k < 2.15) gozKapa = true;
    } else if (k < 3.25) {
      const q = k - 2.25, cok = prPenc(q, 0, 0.14), p = clampPr((q - 0.08) / 0.88, 0, 1), h = Math.abs(Math.sin(p * Math.PI * 2));
      ofX = -0.44 * (1 - prYum(q));
      zip = h * 0.7 - cok * 0.04; yaw = -0.75 + prYum(p * 2.5) * 0.45; pati = 0.25 + h * 0.58;
      kulX = -0.68 - h * 0.3 + Math.sin(k * 16) * 0.14; kulZ = Math.sin(p * Math.PI * 4) * 0.22;
      pati = 0.25 + h * 0.58; basX = -h * 0.16; basZ = Math.sin(p * Math.PI * 2) * 0.15;
      egil = cok * 0.12; gozB = 1.15;
      kuyHiz = 30; kuyGen = 0.95; heyecanGuc = 0.9;
    } else {
      const c = (k - 3.25) % 5;
      kuyGen = 0.84; heyecanGuc = 0.58;
      if (c < 2.5) {
        const q = Math.sin(c * Math.PI * 1.6), h = Math.abs(q), w = prYum(c / 0.25) * (1 - prYum((c - 2.25) / 0.25));
        ofX = q * 0.08 * w; yaw = -0.35 + q * 0.22 * w;
        zip = h * 0.28 * w; basZ = q * 0.2 * w; basY = q * 0.12 * w; basX = -h * 0.1 * w; egil = -h * 0.06 * w;
        pati = (0.2 + Math.max(0, q) * 0.45) * w;
        kulX = -0.3 - h * 0.35 * w; kulZ = -q * 0.18 * w; kulS = 1.16 + h * 0.1 * w;
        gozB = 1.06 + h * 0.08 * w;
      } else {
        const w = prYum((c - 2.5) / 0.28) * (1 - prYum((c - 4.72) / 0.28));
        yaw = -0.35; basY = -0.15; basZ = 0.14 + Math.sin(t * 3.5) * 0.05 * w;
        pati = (0.4 + Math.abs(Math.sin(t * 7)) * 0.28) * w;
        zip = Math.abs(Math.sin(t * 3.5)) * 0.09 * w;
        kulX = -0.25 - Math.abs(Math.sin(t * 7)) * 0.25 * w; kulZ = Math.sin(t * 3.5) * 0.12 * w;
        kulS = 1.15 + Math.abs(Math.sin(t * 7)) * 0.08 * w;
        gozB = 1.05 + 0.05 * w;
      }
    }
  } else if (z.iska < 2.4) {
    // ıska: "gel gel" pati, kısa koşup geri döner
    const k = z.iska; kuyHiz = 16; kulS = 1.1;
    if (k < 0.9) { pati = 1; basY = -0.3; basZ = 0.15; zip = Math.abs(Math.sin(k * 9)) * 0.08; }
    else if (k < 1.5) { const q = (k - 0.9) / 0.6; ofX = -1.6 * prYum(q); zip = Math.abs(Math.sin(k * 14)) * 0.18; egil = 0.1; kulX = -0.5; }
    else { const q = (k - 1.5) / 0.9; ofX = -1.6 * (1 - prYum(q)); zip = Math.abs(Math.sin(k * 14)) * 0.15 * (1 - q); if (q < 0.75) yaw = 0.75; kulX = -0.4; }
  } else if (dP === 'cek') {
    // dikkat kesilir: kulaklar Pırıl'a doğru dikelip hafifçe oynar, baş merakla yana eğilir; güçlü çekişte oyun eğilmesi ve sabırsız kuyruk
    const g = typeof CEK !== 'undefined' ? CEK.guc || 0 : 0;
    const gK = clampPr(g, 0, 1), gY = prYum(gK);
    basY += clampPr(ddx * 0.025, -0.22, 0.22);
    basZ = 0.2 + gY * 0.08 + Math.sin(t * (2.4 + gK * 2.2)) * 0.035;
    kulX = -0.58 - gY * 0.34;
    kulS = 1.18 + gY * 0.12;
    kulZ = Math.sin(t * (4.5 + gK * 7)) * (0.045 + gK * 0.075);
    kuyHiz = 12 + gY * 12;
    kuyGen = 0.38 + gY * 0.4;
    egil = prYum((gK - 0.3) / 0.6) * 0.2;
    pati = prYum((gK - 0.55) / 0.45) * (0.28 + Math.abs(Math.sin(t * 9)) * 0.18);
    zip = prYum((gK - 0.7) / 0.3) * Math.abs(Math.sin(t * 10)) * 0.08;
  } else if (dP === 'ucus') {
    // başıyla izler, heyecanla yerinde zıplar; yaklaştıkça ileri-geri sabırsız adımlar, pati kaldırıp kulak ve kuyruk sallar
    const yk = clampPr(1 - mes / 30, 0, 1), yakinMes = prYum(1 - mes / 10);
    zip = Math.abs(Math.sin(t * (8.5 + yk * 2.4))) * (0.08 + yk * 0.36); kuyHiz = 18 + yk * 10; kuyGen = 0.58 + yk * 0.28; kulS = 1.1; basZ = 0.1;
    kulZ = Math.sin(t * 10) * (0.04 + yk * 0.08);
    basY += clampPr(ddx * 0.035, -0.28, 0.28);
    if (P.durum === 'ucus' && P.x > hx - 18) {
      const yak = prYum((P.x - (hx - 18)) / 18);
      heyecanGuc = Math.max(heyecanGuc, yak * 0.85 + yakinMes * 0.15);
      ofX = -(yak * 0.14 + yakinMes * 0.12) * (0.5 + 0.5 * Math.sin(t * 7.5));
      zip = Math.max(zip, Math.abs(Math.sin(t * (10 + yak * 3.8))) * (0.16 + yak * 0.44 + yakinMes * 0.14));
      pati = 0.48 + yak * 0.52 + yakinMes * 0.18 + Math.abs(Math.sin(t * 13)) * 0.2;
      kuyHiz = 26 + yak * 14 + yakinMes * 10; kuyGen = 0.78 + yak * 0.18 + yakinMes * 0.1;
      kulX = -0.3 - yak * 0.42 - Math.abs(Math.sin(t * 15)) * (0.22 * yak + 0.08 * yakinMes);
      kulZ = Math.sin(t * 15) * (0.08 + 0.24 * yak + 0.08 * yakinMes);
      kulS = 1.16 + yak * 0.14 + Math.abs(Math.sin(t * 14)) * 0.06 * yak;
      egil = Math.max(egil, yak * 0.09 + yakinMes * 0.08 * Math.sin(t * 6.5));
      basZ += Math.sin(t * 11) * (0.14 * yak + 0.06 * yakinMes);
      basY += Math.sin(t * 7.5) * 0.1 * yak;
      basX -= Math.abs(Math.sin(t * 12)) * (0.12 * yak + 0.06 * yakinMes);
      yaw += Math.sin(t * 9) * 0.12 * yak;
      const hv = prPenc((t * 0.85) % 1, 0, 0.16) * prYum((yak - 0.25) / 0.4);   // "hav!": başını kaldırıp öne uzatır, kulaklar fırlar, gövde ileri itilir
      if (hv > 0) { basX -= hv * 0.38; kulX -= hv * 0.5; egil -= hv * 0.1; ofX -= hv * 0.08; dilYala = Math.max(dilYala, hv * 0.4); }
    }
    if (z.heyecan < 1.15) {   // Pırıl havada zıplayıcıya veya halkaya denk gelince heyecanla zıplayıp kulak diker
      const q = z.heyecan / 1.15, hz = prYum(q / 0.16) * (1 - prYum((q - 0.68) / 0.32)),
        j = Math.abs(Math.sin(q * Math.PI * 2.5)) * (1 - q * 0.25) * hz;
      heyecanGuc = Math.max(heyecanGuc, hz);
      zip = Math.max(zip, j * 0.68);
      kulX = Math.min(kulX, (-0.82 - j * 0.28) * hz); kulZ += Math.sin(q * Math.PI * 6) * 0.26 * hz; kulS = Math.max(kulS, 1 + 0.28 * hz);
      pati = Math.max(pati, (0.78 + j * 0.32) * hz);
      kuyHiz += Math.max(0, 34 - kuyHiz) * hz; kuyGen += Math.max(0, 0.96 - kuyGen) * hz;
      basX = Math.min(basX, -0.22 * j);
      basY += Math.sin(q * Math.PI * 5) * 0.15 * (1 - q * 0.3) * hz;
      basZ = Math.sin(q * Math.PI * 4) * 0.2 * hz;
      egil = -0.14 * j;
      yaw += Math.sin(q * Math.PI * 4) * 0.22 * hz;
    }
  } else {
    // bekleme çeşitliliği: başlangıç sevinci, kuyruk sallama, kulak oynatma, oturma, esneme, kalkma
    if (baslik) {
      const h = Math.abs(Math.sin(t * 3.4)), salla = prPenc((t + 1.2) % 4.6, 0.4, 2.3);
      zip = h * 0.22 * (Math.sin(t * 0.95) > 0.15 ? 1 : 0) + salla * Math.abs(Math.sin(t * 6.5)) * 0.12;
      pati = salla * (0.78 + Math.sin(t * 13) * 0.22);
      kulX = -0.35 - h * 0.22 - salla * 0.35; kulZ = Math.sin(t * 6.5) * (0.06 + salla * 0.14); kulS = 1.12 + salla * 0.14;
      kuyHiz = 15 + salla * 14; kuyGen = 0.65 + salla * 0.25;
      basZ = Math.sin(t * 2.2) * 0.12 + salla * (0.16 + Math.sin(t * 7.5) * 0.1);
      basX -= salla * 0.14; egil = -salla * 0.08;
      yaw += salla * 0.14; gozB = 1.04 + salla * 0.08;
    } else if (z.basla < 1.15) {
      const q = z.basla / 1.15, j = Math.abs(Math.sin(q * Math.PI * 2)) * (1 - q * 0.2);
      zip = j * 0.48;
      pati = 0.65 + j * 0.35;
      kulX = -0.75 - j * 0.25; kulZ = Math.sin(q * Math.PI * 4) * 0.18; kulS = 1.22;
      kuyHiz = 26; kuyGen = 0.88; gozB = 1.1;
      basX = -0.15 * j; basZ = Math.sin(q * Math.PI * 3) * 0.18;
      egil = -0.1 * j;
    } else {
      const c = (t + 3) % 16;
      if (c < 5) {
        const mr = prPenc(c, 1.2, 3.4);
        basZ = Math.sin(t * 0.8) * 0.1 + mr * 0.1;
        basY += mr * 0.12;
        kulX = -0.16 - mr * 0.24; kulZ = Math.sin(t * 2.1) * 0.06 * (0.4 + mr);
        kuyHiz = 9 + mr * 6; kuyGen = 0.42 + mr * 0.2 + Math.sin(t * 1.4) * 0.05;
      } else if (c < 6.2) {
        const mr = prPenc(c, 5, 6.2);
        kulX = prPenc(c, 5, 5.3) * -0.62 + prPenc(c, 5.42, 5.85) * -0.48;
        kulZ = Math.sin(t * 8) * 0.08 * mr; kulS = 1 + 0.16 * mr;
        basZ = 0.24; basY += 0.14 * mr; gozB = 1 + 0.09 * mr;
        kuyHiz = 16; kuyGen = 0.68;
      } else if (c < 10.5) { otur = 1; kuyHiz = 5; kuyGen = 0.3; kulZ = Math.sin(t * 4) * 0.04;
        if (c > 8 && c < 9.6) { basX = -0.5 * prPenc(c, 8, 9.6) * 1.2; gozKapa = true; kulX = 0.2; } }   // esneme
      else if (c < 11.3) { const u = prPenc(c, 10.5, 11.3); zip = u * 0.15; kulX = -0.25 * u; kulZ = Math.sin((c - 10.5) * 12) * 0.1; } // kalkış hoplaması
      else { yaw = 0.25; basY = -0.1; basZ = -0.12; }
      if (prPiril && prPiril.zaman.salla < 1.0) {
        const sw = 1 - prYum(prPiril.zaman.salla / 1.0);
        kulX = Math.min(kulX, -0.58 * sw); kulZ += Math.sin(t * 11) * 0.09 * sw; kulS = Math.max(kulS, 1 + 0.16 * sw);
        basZ += 0.16 * sw; kuyHiz = Math.max(kuyHiz, 18); kuyGen = Math.max(kuyGen, 0.72); gozB = Math.max(gozB, 1 + 0.1 * sw);
      }
    }
  }
  if (dP === 'kavus' && z.kavus > 3.25 && (B.coskun || B.son)) {   // 5 yıldız / son bölüm: ekstra coşku (daha yüksek zıplama, fırıl fırıl dönüş)
    const c = (z.kavus - 3.25) % 5, gK = B.son ? 1.8 : 1.45;
    zip *= gK; pati = Math.max(pati, 0.5 + Math.abs(Math.sin(t * 9)) * 0.3); kuyHiz = Math.max(kuyHiz, 32); kuyGen = Math.max(kuyGen, 0.95); heyecanGuc = 1;
    if (c > 2.55 && c < 3.35) { const q = (c - 2.55) / 0.8, w = Math.sin(q * Math.PI); yaw = -0.35 + Math.sin(q * Math.PI * 4) * 0.25 * w; zip = Math.max(zip, w * 0.6); pati = 1; kulX = -1 * w; kulS = 1.25; egil = -0.15 * w; }   // yüzü hep bize dönük koca sevinç zıplaması
  }
  // dil: soluma (heyecan) + yalama
  const dilH = heyecanGuc + (dP === 'kavus' ? 0.4 : 0);
  B.dil.rotation.set(0.35 - dilYala * (0.9 + Math.sin(t * 22) * 0.5) + Math.sin(t * 15) * 0.12 * dilH, 0, 0.08 + Math.sin(t * 7) * 0.05 * dilH);
  B.dil.scale.set(1, 1 + dilYala * (0.7 + Math.sin(t * 22) * 0.25) + Math.abs(Math.sin(t * 15)) * 0.18 * dilH, 1 + dilYala * 0.6);
  // yay-sönüm
  prYayla(B, 'zip', zip, dt, 300, 0.5); prYayla(B, 'pati', pati, dt, 120, 0.6); prYayla(B, 'ofX', ofX, dt, 140, 0.75);
  prYayla(B, 'basX', basX, dt, 90, 0.65); prYayla(B, 'basY', basY, dt, 60, 0.75); prYayla(B, 'basZ', basZ, dt, 80, 0.6);
  prYayla(B, 'otur', otur, dt, 50, 0.8); prYayla(B, 'egil', egil, dt, 90, 0.6); prYayla(B, 'kuyGen', kuyGen, dt, 40, 0.8);
  prYayla(B, 'gozB', gozKapa ? 0.14 : gozB, dt, 260, 0.55);
  // kulaklar zıplamanın hızına gecikmeli tepki verir
  const zv = (s.zip - B.oncZip) / dt; B.oncZip = s.zip;
  B.v.kulX += clampPr(zv, -8, 8) * 1.4 * dt * 10;
  prYayla(B, 'kulX', kulX, dt, 110, 0.18); prYayla(B, 'kulZ', kulZ, dt, 130, 0.22); prYayla(B, 'kulS', kulS, dt, 90, 0.4);
  if (yawSert) s.yaw = yaw; else prAciYayla(B, 'yaw', yaw, dt, 80, 0.7);
  B.kuyFaz += dt * kuyHiz;
  const wag = Math.sin(B.kuyFaz);
  B.kok.position.set(hx + 0.5 + s.ofX, hy, -0.3);
  B.yon.rotation.y = s.yaw + wag * s.kuyGen * 0.08;                         // kuyrukla birlikte kalça sallanır
  const ez = 1 + Math.sin(t * 2.4) * 0.02 - Math.max(0, 0.05 - s.zip) * 0.65 + Math.max(0, s.zip - 0.15) * 0.18;
  const ezX = 1 / Math.sqrt(clampPr(ez, 0.75, 1.3));
  B.ez.position.y = Math.max(-0.05, s.zip) - s.otur * 0.08;
  B.ez.rotation.set(-s.otur * 0.22 + s.egil, 0, wag * s.kuyGen * 0.05 + Math.sin(t * 13) * 0.045 * heyecanGuc);
  B.ez.scale.set(ezX, ez, ezX);
  B.madalyon.rotation.set(-clampPr(zv, -4, 4) * 0.08 - heyecanGuc * 0.18 * Math.abs(Math.sin(t * 14)), 0, wag * s.kuyGen * 0.12 + Math.sin(t * 17) * 0.24 * heyecanGuc);
  B.bas.rotation.set(s.basX + Math.sin(t * 1.3) * 0.04 + s.otur * 0.18, s.basY, s.basZ + Math.sin(t * 0.8) * 0.06);
  B.kulak.position.y = 0.14 + Math.max(0, -s.kulX) * 0.045;
  B.kulak.rotation.set(clampPr(s.kulX, -1.15, 0.7), clampPr(s.kulZ * 0.35, -0.2, 0.2), clampPr(s.kulZ, -0.45, 0.45)); B.kulak.scale.set(clampPr(s.kulS, 0.9, 1.3), 1, 1);
  B.kuyruk.rotation.set(-0.5 - s.otur * 0.4 + Math.abs(wag) * s.kuyGen * 0.16 + heyecanGuc * 0.15, wag * s.kuyGen * 0.18, wag * s.kuyGen);
  B.pati.rotation.set(-s.pati * (2.2 + Math.sin(t * 10) * 0.45), 0, -s.pati * (0.3 + Math.sin(t * 12) * 0.22));
  if (z.kirp > 0 && z.kirp > 2.8 + (Math.sin(t * 1.3 + 0.7) + 1) * 1.3) { z.kirp = -0.13; B.cifte = Math.sin(t * 2.9) > 0.55 ? 1 : 0; }
  if (z.kirp > -0.01 && z.kirp < 0 && B.cifte) { B.cifte = 0; z.kirp = -0.32; }
  let bKirpF = 1;
  if (z.kirp < 0) {
    if (z.kirp > -0.13) bKirpF = 1 - 0.9 * Math.sin(((z.kirp + 0.13) / 0.13) * Math.PI);
    else if (z.kirp <= -0.19 && z.kirp > -0.32) bKirpF = 1 - 0.9 * Math.sin(((z.kirp + 0.32) / 0.13) * Math.PI);
  }
  const bbX = dP === 'kavus' || baslik ? 0 : clampPr(ddx / 5, -1, 1) * 0.017, bbY = dP === 'kavus' || baslik ? 0 : clampPr((ddy - 0.5) / 5, -1, 1) * 0.012, bu = prUs(dt, 10);
  B.bakX += (bbX - B.bakX) * bu; B.bakY += (bbY - B.bakY) * bu; B.bebek.position.set(B.bakX, B.bakY, 0);
  const bGozB = clampPr(s.gozB, 0.1, 1.25);
  B.goz.scale.set(clampPr(0.95 + bGozB * 0.05, 0.92, 1.15), Math.max(0.08, bGozB * (gozKapa ? 1 : bKirpF)), 1);
}
