/* İnternetsiz çalışma. index.html önce ağdan, diğer dosyalar önce önbellekten.
   Yalnız bu oyunun önbellekleri (feza-piril-ucus-) silinir; aynı sitedeki diğer oyunlara dokunulmaz. */
const ONEK = 'feza-piril-ucus-';
const CACHE = ONEK + 'v27';
const SESLER = ['birdaha', 'giris', 'iska1', 'iska2', 'iska3', 'kanat', 'kavus1', 'kavus2', 'yildizlar',
  'cokcek', 'azcek', 'yukari', 'mantar', 'besyildiz', 'bolum1', 'bulut', 'nilufer', 'ruzgar', 'halka',
  'cifte', 'final', 'sonraki', 'kutlama', 'ucluKanat', 'ucusUstasi', 'bolum20', 'iska4', 'kavus3', 'kavus4',
  'ortam26', 'ortam27', 'ortam28', 'ortam29', 'ortam30', 'ortam31', 'ortam32', 'ortam33', 'ortam34', 'ortam35', 'ortam36', 'ortam37', 'ortam38', 'ortam39', 'ortam40',
  'ortam41', 'ortam42', 'ortam43', 'ortam44', 'ortam45', 'ortam46', 'ortam47', 'ortam48', 'ortam49', 'ortam50',
  'gunesacti', 'baloncuk', 'esinti', 'kirkbitti', 'ellibitti', 'tekatis', 'kalanyildiz'];
const CORE = ['./', 'index.html', 'style.css', 'vendor/three.js', 'ses.js', 'cekirdek.js', 'bolumler.js', 'bolumler_b.js', 'bolumler_c.js', 'bolumler_d.js', 'bolumler_e.js', 'bolumler_f.js', 'dunya.js', 'ortam_a.js', 'ortam_b.js', 'ortam_c.js', 'ortam_d.js', 'ortam_e.js', 'ortam_f.js', 'ortam_g.js', 'ortam_h.js', 'ortam_i.js', 'hava.js', 'piril.js', 'efekt.js', 'arayuz.js', 'oyun.js', 'manifest.webmanifest',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'].concat(SESLER.map(s => 'sesler/' + s + '.mp3'));

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(p => new Request(p, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(ONEK) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  const sayfa = r.mode === 'navigate' || r.url.endsWith('/index.html') || r.url.endsWith('/');
  if (sayfa) {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      try {
        const y = await fetch(r);
        if (y.ok) { try { await c.put('index.html', y.clone()); } catch (_) { /* Depolama dolu olsa da ağdaki oyun açılır. */ } return y; }
        return (await c.match('index.html')) || y;
      } catch (_) { return (await c.match('index.html')) || Response.error(); }
    })());
  } else {
    e.respondWith((async () => {
      const c = await caches.open(CACHE), o = await c.match(r, { ignoreSearch: true });
      if (o) return o;
      const y = await fetch(r);
      if (y.ok) { try { await c.put(r, y.clone()); } catch (_) { /* Depolama hatası oyunu kesmez. */ } }
      return y;
    })());
  }
});
