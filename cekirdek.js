// cekirdek.js — Pırıl'ın Uçuş Okulu: çizici, sahne, kamera, ölçüler, olaylar, yardımcılar (OYUN ajanı)
// Klasik <script>; üst düzey adlar diğer dosyalarla ortak (SOZLESME.md).
const Q = new URLSearchParams(location.search);
const SESSIZ = Q.has('sessiz');

// Ölçüler (metre). Oyun düzlemi: x sağa, y yukarı, z = 0.
const D = { zemin: 0, sapan: { x: 0, y: 3.2 }, hedef: { x: 46, y: 0 }, solSinir: -8, sagSinir: 58, tavan: 30 };
const YC = 16; // yerçekimi m/sn²

// Basit olay yolu
const OLAY = (function () {
  const d = {};
  const O = {
    sus: 0, // >0 iken olaylar yayılmaz (ekrana çizmeden deneme benzetimi için)
    on(ad, f) { (d[ad] || (d[ad] = [])).push(f); },
    emit(ad, veri) {
      if (O.sus > 0) return;
      const l = d[ad]; if (!l) return;
      for (let i = 0; i < l.length; i++) {
        try { l[i](veri); } catch (e) { console.warn('OLAY ' + ad + ':', e); }
      }
    }
  };
  return O;
})();

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function us(dt, k) { return 1 - Math.exp(-dt * k); }

// Pırıl'ın oyun durumu ve çekiş bilgisi
const P = { x: D.sapan.x, y: D.sapan.y, vx: 0, vy: 0, aci: 0, durum: 'bekle' };
const CEK = { x: D.sapan.x, y: D.sapan.y, guc: 0 };

// Çizici / sahne / kamera
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', stencil: false, preserveDrawingBuffer: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = true;
renderer.domElement.style.display = 'block';
renderer.domElement.style.touchAction = 'none';
(document.getElementById('sahne') || document.body).appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffe0c0);
scene.fog = new THREE.FogExp2(0xffe0c0, 0.0024);

// Kamera yandan bakar: +z'de durur, x-y düzlemine hafif sinematik açıyla bakar.
const camera = new THREE.PerspectiveCamera(45, Math.max(1, window.innerWidth) / Math.max(1, window.innerHeight), 0.5, 600);
camera.position.set(22, 10.2, 55);
camera.lookAt(22, 8.8, 0);

let _sonW = window.innerWidth, _sonH = window.innerHeight, _sonDpr = Math.min(window.devicePixelRatio || 1, 2);
let _ekRect = null, _ekRectKirli = true;

function cekirdekBoyut() {
  const vv = window.visualViewport;
  const w = Math.max(1, Math.round((vv && vv.width) || window.innerWidth));
  const h = Math.max(1, Math.round((vv && vv.height) || window.innerHeight));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  _ekRectKirli = true;
  if (w === _sonW && h === _sonH && dpr === _sonDpr) return;
  _sonW = w; _sonH = h; _sonDpr = dpr;
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', cekirdekBoyut);
if (window.visualViewport) window.visualViewport.addEventListener('resize', cekirdekBoyut);
window.addEventListener('orientationchange', function () {
  setTimeout(cekirdekBoyut, 120);
  setTimeout(cekirdekBoyut, 320);
});

// Ekran noktasını (piksel) oyun düzlemine (z=0) çevirir → {x, y}
const _ekV = new THREE.Vector3(), _ekD = new THREE.Vector3();
function ekrandanDunyaya(px, py, hedef) {
  if (_ekRectKirli || !_ekRect) {
    _ekRect = renderer.domElement.getBoundingClientRect();
    _ekRectKirli = false;
  }
  const r = _ekRect;
  const rw = r.width || 1, rh = r.height || 1;
  _ekV.set(((px - r.left) / rw) * 2 - 1, -((py - r.top) / rh) * 2 + 1, 0.5).unproject(camera);
  _ekD.copy(_ekV).sub(camera.position).normalize();
  const s = -camera.position.z / _ekD.z;
  const o = hedef || {};
  o.x = camera.position.x + _ekD.x * s;
  o.y = camera.position.y + _ekD.y * s;
  return o;
}
