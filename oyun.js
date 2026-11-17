// oyun.js — durum akışı, çek-bırak, fizik, yardım, kamera, ana döngü, window.UCUS (OYUN ajanı)
(function () {
  'use strict';
  // ---------- ayarlar ----------
  const A = {
    cekEn: 4.2,        // Pırıl'ın görünen en çok geri gidişi (m)
    tamOran: 0.30,     // tam çekiş = kısa kenarın bu oranı (piksel)
    olu: 0.10,         // ölü bölge (tam çekişin oranı): altında fırlamaz (küçük parmaklar için düşük eşik)
    vMin: 12.5,        // ölü bölge sınırında hız (küçük el hareketi de bir yere götürür)
    vMax: 32,          // tam çekişte hız
    us: 0.85,          // güç eğrisi üssü (<1: küçük çekiş hızlı güçlenir)
    aciMin: 18, aciMax: 70, // fırlatma açısı sınırları (derece)
    yumusak: 20,       // parmak titremesi süzme hızı
    kanatVy: 7.5, kanatVx: 1.0,
    hedefR0: 1.8,
    yildizR: 1.9,      // yıldız toplama yarıçapı (cömert)
    yildizMik: 3.2, yildizMikG: 4.0, // yıldız mıknatısı: bu yakınlıkta Pırıl'ı yumuşakça çeker
    bilboCekR: 3.6, bilboCekG: 1.3, // Bilbo'ya yakın inişte yumuşak çekim (yarıçap m, güç)
    kanatAra: 0.30,   // iki kanat çırpma arası en kısa süre (hızlı ardışık dokunuş hak harcamaz)
    bulutVx: 0.5, bulutVy: 0.4, bulutVyEn: 6, // buluttan sekme (yumuşak yastık)
    // bu bölümdeki önceki uçuş sayısına göre gizli cömertlik (0,1,2,3,4+ uçuş) ve 4. uçuştan sonra ek büyüme
    // (cocukOzet ile 14 zor bölümde ölçüldü: 5 denemede tam başarı %64 → %72, 8 denemede %91 → %96)
    // Bilbo koşar: Pırıl Bilbo'nun önünde 7 m / arkasında 5 m içinde durursa Bilbo koşup gelir, kavuşma sayılır (gizli yardımla +2 m)
    guvenliKamera: true, // uçuş kamerası yakındaki yıldızları gösterge altında bırakmaz
    inisKanat: false, // deneme: Bilbo'ya 10 m kala alçakta kanat yarı güçte (ölçüldü, bkz. istek dosyası)
    bilboKos: true, kosOn: 7, kosArka: 5, kosEk: 2, kosBekle: 0.25,
    denemeYardim: [0, 0.2, 0.5, 0.8, 1], denemeBuyuk: { n: 3, yildizR: 0.7, yildizMik: 1.2, hedefR: 0.9 }
  };
  const R_PIRIL = 0.7;
  const HIZ = clamp(parseFloat(Q.get('hiz')) || 1, 0.1, 8);
  const OTO = Q.has('oto');
  const DER = Math.PI / 180;

  // BOLUMLER / DUNYA yoksa yedek değerler
  const YEDEK = {
    no: 1, ad: 'Altın Çayır', altAd: 'Altın Çayır', kanatHak: 1,
    hedef: { x: 46, y: 0 },
    yildizYer: [[11, 10.5], [20, 20.5], [25.5, 8.5], [34.5, 13], [39, 5.2]],
    mantar: { x: 22, y: 1.9, r: 1.6 }, bulut: { x: 33, y: 9, r: 2.2 },
    mantarlar: [{ x: 22, y: 1.9, r: 1.6 }], bulutlar: [{ x: 33, y: 9, r: 2.2 }],
    niluferler: [], ruzgarlar: [], halkalar: [],
    sapanSol: { x: -1.3, y: 4.6 }, sapanSag: { x: 1.3, y: 4.6 }
  };
  const CALI_YEDEK = { x: 41.5, y: 0.55, r: 1.0 };
  const KAYIT_ANAHTAR = 'feza-piril-ucus-kayit';
  const HEPSI_ACIK = Q.has('hepsiacik');

  function bolumListesi() {
    return (typeof window !== 'undefined' && Array.isArray(window.BOLUMLER) && window.BOLUMLER.length)
      ? window.BOLUMLER : [YEDEK];
  }
  function kayitOku() {
    const n = bolumListesi().length;
    const bos = { acik: 1, yildiz: new Array(n).fill(0), tek: new Array(n).fill(0) };
    try {
      const ham = localStorage.getItem(KAYIT_ANAHTAR);
      if (!ham) return bos;
      const p = JSON.parse(ham);
      const y = new Array(n).fill(0);
      if (Array.isArray(p.yildiz)) {
        for (let i = 0; i < n && i < p.yildiz.length; i++) y[i] = clamp(parseInt(p.yildiz[i], 10) || 0, 0, 5);
      }
      let acik = clamp(parseInt(p.acik, 10) || 1, 1, n);
      // bölüm sayısı arttıysa (25 → 40): eskiden son bölümü bitirmiş çocuğun yeni bölümü açık olsun
      for (let i = n - 2; i >= 0; i--) if (y[i] > 0) { acik = Math.max(acik, i + 2); break; }
      const tk = new Array(n).fill(0); // bölüm başına "tek atışta 5 yıldız" bayrağı
      if (Array.isArray(p.tek)) for (let i = 0; i < n && i < p.tek.length; i++) tk[i] = p.tek[i] ? 1 : 0;
      return { acik: clamp(acik, 1, n), yildiz: y, tek: tk };
    } catch (_) { return bos; }
  }
  function kayitYaz() {
    try { localStorage.setItem(KAYIT_ANAHTAR, JSON.stringify(KAYIT)); } catch (_) {}
  }
  const KAYIT = kayitOku();

  function aktifBolum() {
    const l = bolumListesi();
    return l[clamp(G.bolumIdx, 0, l.length - 1)] || YEDEK;
  }
  function aktifKanatHak() {
    const b = aktifBolum();
    return b.kanatHak != null ? b.kanatHak : 1;
  }
  function DW() {
    if (typeof window !== 'undefined' && Array.isArray(window.BOLUMLER) && window.BOLUMLER.length) return aktifBolum();
    return (typeof DUNYA !== 'undefined' && DUNYA) ? DUNYA : YEDEK;
  }
  function CALI() {
    const w = DW();
    return w.cali !== undefined ? w.cali : CALI_YEDEK;
  }

  const G = {
    bolumIdx: 0,
    deneme: 0, iska: 0, yildizAlindi: [false, false, false, false, false], yildizSay: 0,
    ucusT: 0, yerTemas: 0, durumT: 0, kanatVar: true, kanatKalan: 1, kanatBekle: 0, kanatBosBekle: 0, suzT: 0, sim: false, sekSay: 0,
    sekBekle: 0, caliBekle: 0, ruzgarBekle: 0, halkaAlindi: [], otoKanatT: [], baloncukAlindi: [], esintiIc: [], bolumDeneme: 0, kanatSira: false, iskaGec: false, gecKanatT: 0,
    donX0: 0, donY0: 0, t: 0, kare: 0, fps: 60, oyunHazir: false, otoT: 0,
    // zaman ölçeği (his)
    zs: 1, durakT: 0, yildizT: 0, yaklas: 0, sonYavas: 1,
    // salıncak yayı
    sox: 0, soy: 0, svx: 0, svy: 0,
    // iz
    izN: 0, izT: 0, sonSonuc: '', seviye: 0,
    gucEk: 0, yonSalla: 0, ayna: false, kisaSalla: 0
  };
  const IZ_EN = 80, IZ = [];
  for (let i = 0; i < IZ_EN; i++) IZ.push([0, 0]);
  const yedek = { piril: null, bilbo: null, yildiz: [], nokta: [], aktif: false };

  function durumYap(d) {
    if (P.durum === d) return;
    if (P.durum === 'ucus' && !G.sim) G.sonInis = { x: +P.x.toFixed(3), y: +P.y.toFixed(3), durum: d, yildiz: G.yildizSay };
    P.durum = d; G.durumT = 0;
    if (window.UCUS) window.UCUS.durum = d;
    OLAY.emit('durum', d);
  }

  // ---------- yardım düzeyi (görünmez, kademeli) ----------
  function yd() { return clamp((G.iska - 1) / 5, 0, 1); }            // 0 (0–1 ıska) → 1 (6 ıska)
  // bu bölümde önceki uçuş sayısına göre (kavuşup "bir daha" denese de sürer; bölüm değişince sıfırlanır):
  // 2 uçuştan sonra biraz, 4 uçuştan sonra belirgin cömertlik (yıldız toplama/çekim yarıçapı, kavuşma alanı)
  function onceUcus() { return Math.max(0, G.bolumDeneme - 1); }
  function ydB() { const n = onceUcus(), l = A.denemeYardim; return l[Math.min(n, l.length - 1)]; }
  function ydBuyuk() { return onceUcus() >= A.denemeBuyuk.n ? 1 : 0; }
  function yardimDuzey() { return G.iska >= 6 ? 3 : G.iska >= 4 ? 2 : (G.iska >= 2 || onceUcus() >= 2) ? 1 : 0; }
  function hedefR() { return A.hedefR0 + 0.6 * Math.max(yd(), ydB()) + (G.iska >= 6 ? 1.3 : 0) + A.denemeBuyuk.hedefR * ydBuyuk(); }

  // ---------- çekme (göreli sürükleme, her yerden) ----------
  let tutuyor = false, tutId = null;
  const C = { px0: 0, py0: 0, px: 0, py: 0, ox: 0, oy: 0, tam: 240, gecerli: false, vx: 0, vy: 0, guc: 0 };

  // ox, oy: ekran pikseli sürükleme (ox sağa +, oy aşağı +). Geriye-aşağı çekmek ileri-yukarı fırlatır.
  function cekHesapla(ox, oy, yay) {
    const l = Math.hypot(ox, oy);
    const raw = clamp(l / C.tam, 0, 1);
    let a = Math.atan2(oy, -ox); // fırlatma yönü (dünya: x sağ, y yukarı)
    let gecerliYon = l > 1 && a > -40 * DER && a < 120 * DER; // ileri/yukarı çekiş geçersiz (zararsız)
    if (!gecerliYon && G.ayna && l > 1) { // üst üste yanlış yöne çeken çocuk: parmağın gittiği yöne de fırlatır
      ox = -ox; oy = -oy; a = Math.atan2(oy, -ox); gecerliYon = a > -40 * DER && a < 120 * DER;
    }
    a = clamp(a, A.aciMin * DER, A.aciMax * DER);
    let guc = 0, vx = 0, vy = 0, sev = 0, dx, dy;
    if (gecerliYon && raw >= A.olu) {
      const f = Math.pow((raw - A.olu) / (1 - A.olu), A.us);
      const v = Math.min(lerp(A.vMin, A.vMax, f) * (1 + G.gucEk), A.vMax); // gucEk: kısa çeken çocuğa görünmez destek
      vx = Math.cos(a) * v; vy = Math.sin(a) * v;
      guc = 0.08 + 0.92 * f;
      sev = guc < 0.5 ? 1 : guc < 0.88 ? 2 : 3;
      dx = -Math.cos(a) * A.cekEn * raw; dy = -Math.sin(a) * A.cekEn * raw;
    } else {
      // ölü bölge ya da yanlış yön: Pırıl yalnızca biraz kıpırdar
      if (gecerliYon) {
        dx = -Math.cos(a) * A.cekEn * raw; dy = -Math.sin(a) * A.cekEn * raw;
        guc = (raw / A.olu) * 0.08;
      } else {
        dx = l > 0 ? (ox / l) * raw : 0; dy = l > 0 ? (-oy / l) * raw : 0;
        guc = 0;
      }
    }
    C.gecerli = sev > 0; C.vx = vx; C.vy = vy; C.guc = guc;
    if (!yay) return;
    P.x = D.sapan.x + dx;
    P.y = Math.max(D.sapan.y + dy, 1.3);
    P.vx = vx; P.vy = vy;
    P.aci = sev > 0 ? Math.atan2(vy, vx) : 0;
    CEK.x = P.x; CEK.y = P.y; CEK.guc = guc;
    if (sev !== G.seviye) { G.seviye = sev; OLAY.emit('gucSeviye', sev); }
    OLAY.emit('cek', { x: P.x, y: P.y, guc: guc, vx: vx, vy: vy });
  }

  function arayuzHedefi(e) {
    if (typeof ARAYUZ !== 'undefined' && ARAYUZ && ARAYUZ.baslikAcik) return true;
    const t = e.target;
    if (!t || !t.closest) return false;
    // yalnız düğmeler (ve başlık ekranı) çekmeyi engeller; sayaç gibi süsler engellemez
    return !!t.closest('button,a,[data-dugme],.dugme,#baslik');
  }

  // havada dokunuş: kanat çırp (oyunda, oto testte ve görünmez denemede aynı kod)
  function kanatCirp() {
    if (P.durum !== 'ucus') return false;
    // çok erken dokunuş (fırlar fırlamaz, hâlâ hızla yükselirken): boşa gitmesin, tepeye yaklaşınca kendiliğinden çırpar
    if (G.kanatKalan > 0 && !G.kanatSira && G.ucusT < 0.5 && P.vy > 6) {
      G.kanatSira = true;
      K.esne -= 0.06; K.itY += 0.05; // anında minik tepki: "duydum, birazdan!"
      OLAY.emit('kanatSira', { x: P.x, y: P.y, kalan: G.kanatKalan, toplam: aktifKanatHak() });
      return true;
    }
    if (G.kanatSira) return false; // sıradaki çırpış beklerken ikinci dokunuş hak harcamaz
    if (G.kanatKalan <= 0 || G.ucusT <= 0.12) {
      // hak yok: ceza değil, minik tatlı bir kıpırtı (yol değişmez)
      if (G.kanatBosBekle <= 0) {
        G.kanatBosBekle = 0.35; K.esne += 0.06;
        OLAY.emit('kanatBos', { x: P.x, y: P.y, toplam: aktifKanatHak() });
      }
      return false;
    }
    if (G.kanatBekle <= 0) {
      G.kanatKalan--;
      G.kanatBekle = A.kanatAra;
      G.kanatVar = G.kanatKalan > 0;
      // düşüşteyse düşüşü anında kesip güçlü bir yukarı kaldırma ver; yükseliyorsa (mantar/nilüfer/rüzgâr çıkışı) ivmeyi koruyup destekle + süzülme başlat
      P.vy = P.vy < 0 ? (Math.max(P.vy * 0.25, 0) + A.kanatVy) : Math.max(P.vy + A.kanatVy * 0.25, P.vy * 0.35 + A.kanatVy);
      P.vx = (P.vx < 0 ? 0 : P.vx) + A.kanatVx;
      G.suzT = 0.58;
      if (A.inisKanat && P.vy > 0 && P.y < 6 && D.hedef.x - P.x < 10 && D.hedef.x - P.x > -2) { // Bilbo'ya yakın ve alçakta: kısa "iniş kanadı"
        P.vy *= 0.5; P.vx -= A.kanatVx; G.suzT = 0.3;
      }
      K.itY += 0.14; K.esne -= 0.12;
      OLAY.emit('kanat', { kalan: G.kanatKalan, toplam: aktifKanatHak(), x: P.x, y: P.y, vx: P.vx, vy: P.vy });
      return true;
    }
    return false;
  }

  function gecKanat() {
    G.iskaGec = false; G.gecKanatT = 0;
    P.y = D.zemin + R_PIRIL + 0.05; P.vy = 0; P.vx = Math.max(P.vx, 3);
    G.yerTemas = 1; G.durdu = false; G.acele = false;
    durumYap('ucus');
    kanatCirp();
  }
  function basla(e) {
    if (arayuzHedefi(e)) return;
    if (e && e.pointerType === 'mouse' && e.button !== 0) return;
    if (e && e.cancelable && e.preventDefault) e.preventDefault();
    if (P.durum === 'ucus') { kanatCirp(); return; }
    if (P.durum === 'yuvar') {
      if (G.iskaGec && G.gecKanatT > 0 && G.kanatKalan > 0) { gecKanat(); return; } // yere değdiği an dokundu: kanat yine çırpar
      G.acele = true; return; // sabırsız parmak: durunca beklemeden hemen döner
    }
    if (P.durum === 'don' && !tutuyor) { // dönerken dokunduysa salıncağa ışınla ve hemen çekmeye başla
      P.x = D.sapan.x; P.y = D.sapan.y; P.vx = P.vy = 0; P.aci = 0;
      G.sox = G.soy = G.svx = G.svy = 0; G.acele = false;
      durumYap('bekle');
    }
    if (P.durum !== 'bekle' || tutuyor) return;
    tutuyor = true; tutId = e.pointerId;
    if (e.preventDefault) e.preventDefault();
    C.px0 = C.px = e.clientX; C.py0 = C.py = e.clientY; C.ox = C.oy = 0;
    C.tam = clamp(A.tamOran * Math.min(window.innerWidth, window.innerHeight), 150, 330);
    G.seviye = -1; G.sox = G.soy = G.svx = G.svy = 0;
    durumYap('cek');
    cekHesapla(0, 0, true);
  }
  function surukle(e) {
    if (!tutuyor || e.pointerId !== tutId) return;
    C.px = e.clientX; C.py = e.clientY;
  }
  function cekKare(dt) { // her kare: titremeyi süz
    if (!tutuyor || P.durum !== 'cek') return;
    const k = us(dt, A.yumusak);
    const nx = lerp(C.ox, C.px - C.px0, k), ny = lerp(C.oy, C.py - C.py0, k);
    if (Math.abs(nx - C.ox) + Math.abs(ny - C.oy) > 0.05 || G.seviye < 0) { C.ox = nx; C.oy = ny; cekHesapla(C.ox, C.oy, true); }
    // gerilme titremesi: güç arttıkça Pırıl salıncakta hafifçe titrer (bırakınca fırlama noktası titremesiz hesaplanır)
    const g = C.gecerli ? CEK.guc : 0;
    if (g > 0.55) {
      const amp = (g - 0.55) / 0.45 * 0.045;
      P.x = CEK.x + Math.sin(G.t * 61) * amp;
      P.y = CEK.y + Math.sin(G.t * 47 + 1.3) * amp * 0.7;
      K.itX = Math.sin(G.t * 37) * amp * 0.25;
    }
  }
  function birak(e) {
    if (!tutuyor || (e && e.pointerId !== tutId)) return;
    tutuyor = false; tutId = null;
    if (P.durum !== 'cek') return;
    if (e && typeof e.clientX === 'number' && isFinite(e.clientX) && typeof e.clientY === 'number' && isFinite(e.clientY)) {
      C.px = e.clientX; C.py = e.clientY;
    }
    // bırakırken son süzülmüş değerin yarısı kadar parmağa yaklaş (hızlı bırakışta güç kaybolmasın)
    C.ox = lerp(C.ox, C.px - C.px0, 0.5); C.oy = lerp(C.oy, C.py - C.py0, 0.5);
    cekHesapla(C.ox, C.oy, true);
    if (!C.gecerli) { salla(Math.hypot(C.ox, C.oy) / C.tam >= A.olu && !G.ayna ? 'yon' : 'kisa'); return; }
    G.yonSalla = 0;
    G.durakT = 0.045 + 0.055 * clamp(C.guc, 0, 1); // kısa duraklama: "gerildi... fırladı!" (güçlü çekişte biraz daha uzun)
    firlatIc(C.vx, C.vy, true);
    K.itX += clamp(C.vx, 0, 32) * 0.02; K.itY += clamp(C.vy, 0, 32) * 0.012; K.esne -= 0.4;
  }
  function salla(neden) {
    // fırlamaz; salıncak Pırıl'ı yayla ortaya geri çeker (ıska/deneme değil)
    if (neden === 'yon') { G.yonSalla++; if (G.yonSalla >= 3) G.ayna = true; } else G.kisaSalla++;
    G.sox = P.x - D.sapan.x; G.soy = P.y - D.sapan.y; G.svx = G.svy = 0;
    const g = CEK.guc;
    CEK.guc = 0; G.seviye = 0; G.sonSonuc = 'salla';
    durumYap('bekle');
    OLAY.emit('cek', { x: D.sapan.x, y: D.sapan.y, guc: 0, vx: 0, vy: 0 });
    OLAY.emit('salla', { guc: g, neden: neden || 'kisa', ust: neden === 'yon' ? G.yonSalla : G.kisaSalla });
  }

  function firlatIc(vx, vy, cekten) {
    if (!cekten) { P.x = D.sapan.x; P.y = D.sapan.y; }
    P.vx = vx; P.vy = vy; P.aci = Math.atan2(vy, vx);
    const kh = aktifKanatHak();
    G.ucusT = 0; G.yerTemas = 0; G.kanatKalan = kh; G.kanatVar = kh > 0; G.kanatBekle = 0; G.suzT = 0;
    G.sekBekle = 0; G.caliBekle = 0; G.ruzgarBekle = 0; G.halkaAlindi = []; G.sekSay = 0; G.kanatBosBekle = 0;
    G.baloncukAlindi = []; G.esintiIc = []; G.kanatSira = false; G.iskaGec = false; G.gecKanatT = 0;
    G.kos = null; G.bilboKostu = false; G.kosAday = false; G.ucusYildiz = 0;
    if (cekten) G.otoKanatT = [];
    G.izN = 0; G.izT = 0; G.yaklas = 0;
    G.sox = G.soy = G.svx = G.svy = 0;
    G.deneme++; G.bolumDeneme++;
    durumYap('ucus');
    OLAY.emit('birak', { vx: vx, vy: vy });
  }

  function tutusuIptal() {
    if (!tutuyor) return;
    tutuyor = false; tutId = null;
    if (P.durum === 'cek') salla('kisa');
  }
  function iptal(e) {
    if (!tutuyor || (e && e.pointerId !== tutId)) return;
    tutusuIptal();
  }

  window.addEventListener('pointerdown', basla, { passive: false });
  window.addEventListener('pointermove', surukle, { passive: true });
  window.addEventListener('pointerup', birak);
  window.addEventListener('pointercancel', iptal);
  window.addEventListener('blur', function () { son = 0; tutusuIptal(); });
  window.addEventListener('keydown', function (e) { // yedek: boşluk = hazır atış / kanat
    if (e.code !== 'Space' || e.repeat) return;
    if (P.durum === 'bekle') firlatIc(17, 19, false);
    else if (P.durum === 'ucus' || P.durum === 'yuvar') basla({ target: null, clientX: 0, clientY: 0 });
  });

  // ---------- iz ----------
  function izEkle() {
    if (G.izN >= IZ_EN) return;
    IZ[G.izN][0] = +P.x.toFixed(2); IZ[G.izN][1] = +P.y.toFixed(2); G.izN++;
  }
  function izGonder() {
    if (G.izN < 2) return;
    izEkle();
    const n = [];
    for (let i = 0; i < G.izN; i++) n.push([IZ[i][0], IZ[i][1]]);
    OLAY.emit('izKaydet', { noktalar: n });
    G.izN = 0;
  }
  function iskaYap() {
    G.iska++; G.sonSonuc = 'iska';
    // kısa düşene görünmez güç desteği (2. ıskadan sonra), aşana geri al
    if (G.iska >= 2 && P.x < D.hedef.x - 8) G.gucEk = Math.min(G.gucEk + 0.3, 1.6);
    else if (G.iska >= 2 && P.x < D.hedef.x) G.gucEk = Math.min(G.gucEk + 0.12, 1.6);
    else if (P.x > D.hedef.x + 2) G.gucEk = Math.max(G.gucEk - 0.3, 0);
    OLAY.emit('iska', { x: P.x });
    izGonder();
  }

  // ---------- 2. tur yardımcıları: baloncuk ve esinti (tek fizik işlevleri; oyun, dene, otoAra aynı kodu kullanır) ----------
  // p: {x, y, vx, vy} (P ya da benzeri). Sayılar UCUS.yardimciAyar'da.
  const BALONCUK = { pay: R_PIRIL, vyTasi: 0.3, vyEk: 12, vxEn: 9, vxEk: 1.5, vxTavan: 24, suz: 0.3 };
  const ESINTI = { guc: 14, vxTavan: 22, dusTasi: 0.4, dusEn: -5, dusUs: 3 };
  function baloncukDegdi(p, b) {
    return Math.hypot(p.x - b.x, p.y - b.y) < (b.r != null ? b.r : 1.4) + BALONCUK.pay;
  }
  function baloncukItis(p) { // hangi yönden gelirse gelsin yumuşakça yukarı ve ileri
    p.vy = Math.max(p.vy, 0) * BALONCUK.vyTasi + BALONCUK.vyEk;
    p.vx = Math.min(Math.max(Math.max(p.vx, 0) + BALONCUK.vxEk, BALONCUK.vxEn), Math.max(BALONCUK.vxTavan, p.vx));
    return p;
  }
  function esintiIcinde(p, e) { // ruzgarlar ile aynı kural: x orta, y alt kenar
    return Math.abs(p.x - e.x) <= (e.w != null ? e.w : 8) * 0.5 && p.y >= e.y && p.y <= e.y + (e.h != null ? e.h : 4);
  }
  function esintiIvme(p, e, dt) { // ileri it, düşüşü biraz yavaşlat
    const g = e.guc != null ? e.guc : ESINTI.guc;
    if (p.vx < ESINTI.vxTavan) p.vx = Math.min(p.vx + g * dt, ESINTI.vxTavan);
    if (p.vy < 0) {
      p.vy += YC * ESINTI.dusTasi * dt;
      if (p.vy < ESINTI.dusEn) p.vy = lerp(p.vy, ESINTI.dusEn, us(dt, ESINTI.dusUs));
    }
    return p;
  }

  // ---------- Bilbo koşar (uçuş fiziğine dokunmaz; yalnız durduktan sonra) ----------
  function kosBolge(x) {
    if (!A.bilboKos || (D.hedef.y || 0) > 0.5) return false;
    const hx = D.hedef.x, ek = A.kosEk * Math.max(yd(), ydB()), d = x - hx;
    if (d < -(A.kosOn + ek) || d > A.kosArka + ek) return false;
    const dr = DW().dere; // arada su varsa Bilbo yüzmez: bağış yok
    if (dr && isFinite(dr.x)) {
      const a = Math.min(x, hx), b = Math.max(x, hx), w2 = (dr.w || 0) / 2;
      if (a < dr.x + w2 && b > dr.x - w2) return false;
    }
    return true;
  }
  function kosSure(d) { return clamp(0.55 + Math.abs(d) * 0.1, 0.8, 1.3); }
  function kosGuncelle(dt) { // yuvar durumunda, Pırıl durduktan sonra
    const k = G.kos;
    k.t += dt;
    // çalı yüzünden Bilbo'nun yeri Pırıl'ın gerisine kaydıysa Pırıl da çalıdan uzaklaşıp yanına yuvarlanır
    const px = k.x1 - 1.3;
    if (Math.abs(P.x - px) > 0.01) { const yon = px > P.x ? 1 : -1, s = Math.min(Math.abs(P.x - px), 2.4 * dt); P.x += yon * s; P.aci -= yon * s / R_PIRIL; P.vx = 2.4 * yon; } else P.vx = 0;
    if (!k.yayildi && k.t >= A.kosBekle) {
      k.yayildi = true;
      const c = CALI();
      const engel = (c && c.x > Math.min(k.x0, k.x1) && c.x < Math.max(k.x0, k.x1)) ? c.x : null;
      OLAY.emit('bilboKos', { x0: k.x0, x1: k.x1, sure: k.sure, pirilX: P.x, engel: engel });
    }
    if (k.t >= A.kosBekle + k.sure) {
      G.kos = null;
      D.hedef.x = k.x1; // Bilbo artık burada: kavuşma akışı (kamera, efekt, sarılma) yeni yerde
      G.bilboKostu = true;
      kavus();
    }
  }

  // ---------- fizik ----------
  function kavus() {
    durumYap('kavus');
    P.vx = P.vy = 0; G.sonSonuc = 'kavus';
    G.kavusX0 = P.x; G.kavusY0 = P.y;
    if (G.sim) return; // ekrana çizmeden deneme: kayda dokunma
    const n = bolumListesi().length;
    const tekAtis = (G.ucusYildiz || 0) >= 5; // 5 yıldızın hepsi bu tek uçuşta
    if (G.yildizSay > (KAYIT.yildiz[G.bolumIdx] || 0)) KAYIT.yildiz[G.bolumIdx] = G.yildizSay;
    if (tekAtis) KAYIT.tek[G.bolumIdx] = 1;
    if (G.bolumIdx + 1 < n && KAYIT.acik < G.bolumIdx + 2) KAYIT.acik = G.bolumIdx + 2;
    kayitYaz();
    OLAY.emit('kavus', { bolumIdx: G.bolumIdx, yildiz: G.yildizSay, enIyiYildiz: KAYIT.yildiz[G.bolumIdx], sonBolum: G.bolumIdx + 1 >= n, bolumSay: n, bilboKos: !!G.bilboKostu, tekAtis: tekAtis, ucusYildiz: G.ucusYildiz || 0, tekKayit: !!KAYIT.tek[G.bolumIdx] });
    izGonder();
  }

  function fizik(dt) {
    G.durumT += dt;
    const w = DW();
    if (P.durum === 'ucus') {
      G.ucusT += dt;
      if (G.kanatSira && (P.vy <= 4 || G.ucusT >= 0.95)) { G.kanatSira = false; kanatCirp(); } // erken dokunuşun çırpışı
      const hx = D.hedef.x, hy = D.hedef.y + 0.7;
      // tahmini iniş
      const kalanT = (P.vy + Math.sqrt(P.vy * P.vy + 2 * YC * Math.max(P.y - hy, 0))) / YC;
      const inisX = P.x + P.vx * kalanT;
      // gizli yardım: henüz hedefe varmamışken son anda nazikçe ileri destek (geçtiyse asla geriye çekme)
      const y = Math.max(yd(), ydB()), yBuyuk = ydBuyuk();
      if (G.ucusT > 1.0 && G.yerTemas === 0 && P.vy < 0 && kalanT > 0.05 && kalanT < 1.4 && P.x <= hx + 0.5) {
        const fark = hx - inisX, pencere = 3.2 + 5 * y + (G.iska >= 6 ? 2 : 0);
        if (fark > 0 && fark < pencere) P.vx += Math.min(fark / Math.max(kalanT, 0.3), 0.4 + 4.5 * y) * us(dt, 3);
      }
      G.yaklas = (P.vy < 0 && Math.abs(P.x - hx) < 9 && Math.abs(inisX - hx) < hedefR() + 1.2) ? 1 : 0;

      const suzul = G.suzT > 0;
      const gEf = suzul ? YC * 0.55 : YC;
      if (suzul) {
        G.suzT = Math.max(0, G.suzT - dt);
        if (P.vx >= 0) P.vx = Math.min(P.vx + 0.6 * dt, 28);
      }
      P.x += P.vx * dt;
      P.y += P.vy * dt - 0.5 * gEf * dt * dt;
      P.vy -= gEf * dt;
      P.aci = Math.atan2(P.vy, P.vx);
      G.sekBekle -= dt; G.caliBekle -= dt; G.ruzgarBekle -= dt; G.kanatBekle = Math.max(0, G.kanatBekle - dt);
      G.kanatBosBekle = Math.max(0, G.kanatBosBekle - dt);
      G.izT -= dt; if (G.izT <= 0) { G.izT = 0.05; izEkle(); }

      // güvenlik: bir yerde takılırsa (çok uzun uçuş) yere indir
      if (G.ucusT > 12) { P.vx = Math.max(P.vx, 3); P.vy = Math.min(P.vy, -4); G.sekBekle = 2; G.caliBekle = 2; }
      // sınırlar: yumuşakça geri
      if (P.x > D.sagSinir) { P.x = D.sagSinir; P.vx = -Math.abs(P.vx) * 0.45; }
      if (P.x < D.solSinir) { P.x = D.solSinir; P.vx = Math.abs(P.vx) * 0.45; }
      if (P.y > D.tavan) { P.y = D.tavan; P.vy = -Math.abs(P.vy) * 0.3; }

      // yıldızlar
      const yy = w.yildizYer || [];
      const yR = A.yildizR + 0.35 * y + A.denemeBuyuk.yildizR * yBuyuk, yMik = A.yildizMik + 0.8 * y + A.denemeBuyuk.yildizMik * yBuyuk; // ıskaladıkça / denedikçe yıldızlar da biraz daha cömert
      for (let i = 0; i < yy.length && i < 5; i++) {
        if (G.yildizAlindi[i]) continue;
        const yd0 = Math.hypot(P.x - yy[i][0], P.y - yy[i][1]);
        if (yd0 < yMik && yd0 > yR) { // yakından geçerken yıldız Pırıl'ı hafifçe kendine çeker
          const mk = (1 - yd0 / yMik) * A.yildizMikG * dt;
          P.x += (yy[i][0] - P.x) * mk; P.y += (yy[i][1] - P.y) * mk;
        }
        if (Math.hypot(P.x - yy[i][0], P.y - yy[i][1]) < yR) {
          G.yildizAlindi[i] = true; G.yildizSay++; G.ucusYildiz = (G.ucusYildiz || 0) + 1; G.yildizT = 0.16;
          OLAY.emit('yildiz', { i: i, x: yy[i][0], y: yy[i][1], toplam: G.yildizSay });
        }
      }

      // rüzgâr sütunları (yukarı kaldırma akımı)
      const rz = w.ruzgarlar || [];
      for (let i = 0; i < rz.length; i++) {
        const r = rz[i];
        if (r && Math.abs(P.x - r.x) <= r.w * 0.5 && P.y >= r.y && P.y <= r.y + r.h) {
          P.vy = Math.min(P.vy + (r.guc != null ? r.guc : 32) * dt, 16);
          P.vx = Math.max(P.vx, 7);
          if (G.ruzgarBekle <= 0) {
            G.ruzgarBekle = 0.25;
            OLAY.emit('ruzgar', { x: P.x, y: P.y, ruzgar: r, i: i });
          }
          break;
        }
      }

      // gökkuşağı halkaları (içinden geçince hız ve yükseliş)
      const hk = w.halkalar || [];
      for (let i = 0; i < hk.length; i++) {
        if (G.halkaAlindi[i]) continue;
        const h = hk[i];
        if (h && Math.hypot(P.x - h.x, P.y - h.y) < h.r + R_PIRIL * 0.6) {
          G.halkaAlindi[i] = true;
          P.vx = Math.min(Math.max(P.vx * 1.25, P.vx + 4.5), 26);
          P.vy = Math.max(P.vy * 0.5, 0) + 8.5;
          K.esne += 0.5;
          OLAY.emit('halka', { i: i, x: h.x, y: h.y, halka: h });
        }
      }

      // baloncuklar (her yönden: "hop, yukarı!") ve esintiler (ileri iten şerit) — 2. tur yardımcıları; alan yoksa hiçbir şey yapmaz
      const bl = w.baloncuklar;
      if (bl && bl.length) {
        for (let i = 0; i < bl.length; i++) {
          const b = bl[i];
          if (!b || G.baloncukAlindi[i] || !baloncukDegdi(P, b)) continue;
          G.baloncukAlindi[i] = true;
          baloncukItis(P);
          G.suzT = Math.max(G.suzT, BALONCUK.suz); // kısa havada asılı kalma
          G.yerTemas = 0; K.esne += 0.45;
          OLAY.emit('baloncuk', { x: b.x, y: b.y, i: i, baloncuk: b });
        }
      }
      const es = w.esintiler;
      if (es && es.length) {
        for (let i = 0; i < es.length; i++) {
          const e = es[i];
          const ic = !!e && esintiIcinde(P, e);
          if (ic) {
            esintiIvme(P, e, dt);
            if (!G.esintiIc[i]) OLAY.emit('esinti', { x: P.x, y: P.y, i: i, esinti: e });
          }
          G.esintiIc[i] = ic;
        }
      }

      // mantar, bulut ve nilüfer (yalnız düşerken, üstten)
      if (G.sekBekle <= 0 && P.vy < 0 && G.sekSay < 14) { // 14 sekmeden sonra sonsuz sekme olmasın
        const mantarlar = (w.mantarlar && w.mantarlar.length) ? w.mantarlar : (w.mantar ? [w.mantar] : []);
        const bulutlar = (w.bulutlar && w.bulutlar.length) ? w.bulutlar : (w.bulut ? [w.bulut] : []);
        const niluferler = w.niluferler || [];
        let sekti = false;
        for (let i = 0; i < mantarlar.length; i++) {
          const m = mantarlar[i];
          if (m && P.y > m.y && Math.hypot(P.x - m.x, P.y - m.y) < m.r + R_PIRIL) {
            P.vy = Math.max(Math.abs(P.vy) * 0.95, 17); P.vx = Math.max(P.vx * 0.9, 6);
            G.sekBekle = 0.35; G.yerTemas = 0; K.esne += 0.9; G.sekSay++;
            OLAY.emit('sek', { x: P.x, y: P.y - R_PIRIL, tur: 'mantar' });
            sekti = true; break;
          }
        }
        if (!sekti) {
          for (let i = 0; i < bulutlar.length; i++) {
            const b = bulutlar[i];
            if (b && P.y > b.y && Math.hypot(P.x - b.x, P.y - b.y) < b.r + R_PIRIL) {
              P.vy = Math.max(Math.abs(P.vy) * A.bulutVy, A.bulutVyEn);
              P.vx = P.x < b.x ? Math.max(P.vx * A.bulutVx, 4) : Math.max(P.vx * A.bulutVx, 3);
              G.sekBekle = 0.45; K.esne += 0.6; G.sekSay++;
              OLAY.emit('sek', { x: P.x, y: P.y - R_PIRIL, tur: 'bulut' });
              sekti = true; break;
            }
          }
        }
        if (!sekti) {
          for (let i = 0; i < niluferler.length; i++) {
            const n = niluferler[i];
            if (n && P.y > n.y - 0.3 && Math.hypot(P.x - n.x, P.y - n.y) < n.r + R_PIRIL) {
              P.vy = Math.max(Math.abs(P.vy) * 0.85, 13.5); P.vx = Math.max(P.vx * 0.92, 8.5);
              G.sekBekle = 0.35; G.yerTemas = 0; K.esne += 0.7; G.sekSay++;
              OLAY.emit('sek', { x: P.x, y: P.y - R_PIRIL, tur: 'nilufer' });
              break;
            }
          }
        }
      }
      // çalı: üstten değerse sekip geçer, yandan değerse yumuşakça geri iter
      const c = CALI();
      if (c && G.caliBekle <= 0 && Math.hypot(P.x - c.x, P.y - c.y) < c.r + R_PIRIL) {
        if ((P.vy < -5 || G.iska >= 6) && P.y > c.y) { P.vy = Math.max(Math.abs(P.vy) * 0.4, 5); P.vx = Math.max(P.vx * 0.5, 5.5); } // inerken: üstünden hoplar
        else { P.vx = -Math.abs(P.vx) * 0.3; P.vy = Math.max(P.vy, 3); }
        G.caliBekle = 0.35; K.esne += 0.4;
        OLAY.emit('sek', { x: P.x, y: P.y - R_PIRIL, tur: 'cali' });
      }

      // Bilbo'ya yakın inişte yumuşak çekim (ıskaladıkça biraz güçlenir)
      if (P.vy < 0 && P.y < 5.5 && Math.abs(P.x - hx) < A.bilboCekR + y * 1.5) {
        P.x += (hx - P.x) * (A.bilboCekG + y * 1.5) * dt;
      }
      // kavuşma
      const dH = Math.hypot(P.x - hx, P.y - hy);
      if (dH < hedefR() && P.y < hy + hedefR()) { kavus(); return; }
      if (P.y <= 0.85 && Math.abs(P.x - D.hedef.x) < hedefR() + 0.65) { kavus(); return; }

      // yer
      if (P.y <= D.zemin + R_PIRIL && P.vy <= 0) {
        P.y = D.zemin + R_PIRIL;
        if (Math.abs(P.x - hx) < hedefR()) { kavus(); return; }
        if (G.yerTemas === 0 && P.vy < -3) {
          G.yerTemas = 1;
          P.vy = Math.min(Math.abs(P.vy) * 0.3, 5); P.vx *= 0.7;
          K.esne += 0.3;
          OLAY.emit('sek', { x: P.x, y: 0, tur: 'yer' });
        } else {
          P.vy = 0;
          G.durdu = false; G.acele = false;
          durumYap('yuvar');
          // hedefin dibine düştüyse (veya hedefe doğru geri yuvarlanıyorsa) ıskayı yuvarlanma bitince say
          G.iskaBekle = (P.x < hx && hx - P.x < hedefR() + 5 && P.vx >= 0) || (P.x >= hx && P.x - hx < hedefR() + 5 && P.vx < 0) || Math.abs(P.x - hx) < hedefR() + 0.65;
          G.kosAday = kosBolge(P.x) || kosBolge(P.x + P.vx * 0.3); // Bilbo'nun yakınında duracaksa ıskaya durunca karar ver
          if (!G.iskaBekle && !G.kosAday) {
            // geç kanat payı: yere değdiği an (0.2 sn) dokunursa hâlâ kanat çırpabilir; ıska bu pay bitince sayılır
            if (G.kanatKalan > 0 && !G.sim) { G.gecKanatT = 0.2; G.iskaGec = true; }
            else iskaYap();
          }
        }
      }
    } else if (P.durum === 'yuvar') {
      if (G.iskaGec) { G.gecKanatT -= dt; if (G.gecKanatT <= 0) { G.iskaGec = false; iskaYap(); } }
      const s = Math.sign(P.vx), a = Math.abs(P.vx);
      P.vx = s * Math.max(0, a - (7 + a * 1.8) * dt);
      P.x = clamp(P.x + P.vx * dt, D.solSinir, D.sagSinir);
      P.y = D.zemin + R_PIRIL;
      P.aci -= P.vx * dt / R_PIRIL;
      const c = CALI();
      if (c && P.vx > 0 && P.x < c.x && P.x + R_PIRIL > c.x - c.r * 0.9 && G.iska >= 6 && P.vx > 2) { // çok ıskadan sonra: çalının üstünden hoplar
        durumYap('ucus'); P.vy = 6; P.vx = Math.max(P.vx, 5); P.y = D.zemin + R_PIRIL + 0.05; G.yerTemas = 1; G.caliBekle = 0.4;
        OLAY.emit('sek', { x: P.x + R_PIRIL, y: 0.5, tur: 'cali' }); return;
      }
      if (c && P.vx > 0 && P.x < c.x && P.x + R_PIRIL > c.x - c.r * 0.9) { // çalıya yumuşakça tosla
        P.x = c.x - c.r * 0.9 - R_PIRIL; P.vx = -P.vx * 0.25;
        if (G.caliBekle <= 0) { G.caliBekle = 0.5; OLAY.emit('sek', { x: P.x + R_PIRIL, y: 0.5, tur: 'cali' }); }
      }
      G.caliBekle -= dt;
      if (Math.abs(P.x - D.hedef.x) < hedefR()) { kavus(); return; }
      if (!G.durdu && ((Math.abs(P.vx) < 0.2 && G.durumT > 0.3) || G.durumT > (G.iskaBekle ? 1.35 : 0.75))) {
        if (Math.abs(P.x - D.hedef.x) < hedefR() + 0.65) { kavus(); return; }
        G.durdu = true; G.durduT = G.durumT; P.vx = 0;
        if (kosBolge(P.x)) { // Bilbo sevinçle koşup gelir → kavuşma
          if (G.iskaGec) { G.iskaGec = false; G.gecKanatT = 0; }
          G.iskaBekle = false; G.kosAday = false;
          let x1 = P.x + 1.3; // Bilbo Pırıl'ın sağında durur
          const cl = CALI();
          if (cl) { // çalının dibinde durmasın: kenarından ~1.6 m açıkta (gerekirse Pırıl da birkaç adım yanına gelir)
            const pay = (cl.r || 1) + 0.9;
            if (P.x < cl.x && x1 > cl.x - pay) x1 = cl.x - pay;
            else if (P.x >= cl.x && x1 < cl.x + pay) x1 = cl.x + pay;
          }
          { // piknik sepeti (dunya.js ile aynı kural): Bilbo da Pırıl da sepetin üstüne denk gelmesin
            const hx0 = D.hedef.x, sepX = (cl && cl.x > hx0 + 0.2 && cl.x < hx0 + 5) ? hx0 - 2.6 : hx0 + 1.9;
            if (Math.abs(x1 - sepX) < 1.0 || Math.abs(x1 - 1.3 - sepX) < 1.0) x1 = (P.x < sepX) ? sepX - 1.0 : sepX + 2.3;
          }
          G.kos = { t: 0, x0: D.hedef.x, x1: x1, sure: kosSure(x1 - D.hedef.x), yayildi: false };
        } else if (G.iskaBekle || G.kosAday) { G.iskaBekle = false; G.kosAday = false; iskaYap(); }
      }
      if (G.kos) { kosGuncelle(dt); return; }
      // durduktan sonra ~0,95 sn kıkırdama/silkelenme payı (dokunursa hemen döner)
      if (G.durdu && (G.durumT - G.durduT > 0.95 || G.acele)) {
        G.donX0 = P.x; G.donY0 = P.y; P.vx = 0;
        durumYap('don');
      }
    } else if (P.durum === 'don') {
      const mesafe = Math.hypot(D.sapan.x - G.donX0, D.sapan.y - G.donY0);
      const sure = donSure();
      const k = clamp(G.durumT / sure, 0, 1);
      const e = k * k * (3 - 2 * k);
      const yayH = Math.min(3.2, 1.4 + mesafe * 0.08);
      P.x = lerp(G.donX0, D.sapan.x, e);
      P.y = lerp(G.donY0, D.sapan.y, e) + Math.sin(k * Math.PI) * yayH;
      P.vx = (D.sapan.x - G.donX0) / sure; P.vy = 0; P.aci = 0;
      if (k >= 1) {
        P.x = D.sapan.x; P.y = D.sapan.y; P.vx = P.vy = 0;
        G.sox = 0; G.soy = -0.5; G.svx = 0; G.svy = 0; G.acele = false; // salıncağa konunca hafif esneme
        durumYap('bekle');
      }
    } else if (P.durum === 'kavus') {
      P.x = lerp(P.x, D.hedef.x - 1.3, us(dt, 4));
      P.y = lerp(P.y, D.zemin + R_PIRIL, us(dt, 5));
      P.aci = lerp(P.aci, 0, us(dt, 5));
    } else if (P.durum === 'bekle') {
      // salıncak yayı: çekip bırakınca / konunca hafif sallanıp ortaya gelir
      G.svx += (-G.sox * 70 - G.svx * 7) * dt; G.svy += (-G.soy * 70 - G.svy * 7) * dt;
      G.sox += G.svx * dt; G.soy += G.svy * dt;
      if (Math.abs(G.sox) + Math.abs(G.soy) + Math.abs(G.svx) + Math.abs(G.svy) < 0.01) G.sox = G.soy = G.svx = G.svy = 0;
      P.x = D.sapan.x + G.sox; P.y = Math.max(D.sapan.y + G.soy, 1.3); P.vx = P.vy = 0; P.aci = 0;
    }
  }

  // yeniden(birikim): birikim true ise ("bir daha") bu bölümde alınmış yıldızlar kalır (5'i tamamsa baştan);
  // bölüm seçilince/değişince birikim false (hepsi sıfırlanır).
  function yeniden(birikim) {
    tutuyor = false; tutId = null;
    C.px0 = C.py0 = C.px = C.py = C.ox = C.oy = 0; C.gecerli = false; C.vx = C.vy = C.guc = 0;
    P.x = D.sapan.x; P.y = D.sapan.y; P.vx = P.vy = 0; P.aci = 0;
    CEK.x = P.x; CEK.y = P.y; CEK.guc = 0;
    const tut = birikim === true && G.yildizSay > 0 && G.yildizSay < 5;
    if (!tut) for (let i = 0; i < 5; i++) G.yildizAlindi[i] = false;
    const alinan = [];
    for (let i = 0; i < 5; i++) if (G.yildizAlindi[i]) alinan.push(i);
    G.yildizSay = alinan.length; G.ucusYildiz = 0; G.iska = 0; G.deneme = 0; G.izN = 0; G.sonSonuc = '';
    G.gucEk = 0; G.yonSalla = 0; G.kisaSalla = 0; G.ayna = false;
    const kh = aktifKanatHak();
    G.ucusT = 0; G.yerTemas = 0; G.sekBekle = 0; G.caliBekle = 0;
    G.kanatKalan = kh; G.kanatVar = kh > 0; G.kanatBekle = 0; G.suzT = 0;
    G.halkaAlindi = []; G.otoKanatT = []; G.ruzgarBekle = 0; G.baloncukAlindi = []; G.esintiIc = []; G.kanatSira = false; G.iskaGec = false; G.gecKanatT = 0;
    G.kos = null; G.bilboKostu = false; G.kosAday = false;
    { const bb = aktifBolum(); if (bb && bb.hedef) { D.hedef.x = bb.hedef.x; D.hedef.y = bb.hedef.y || 0; } } // Bilbo koştuysa yerine döner
    G.sox = G.soy = G.svx = G.svy = 0; G.zs = 1; G.durakT = 0; G.yildizT = 0;
    G.yaklas = 0; G.acele = false; G.durdu = false; G.seviye = 0; G.otoT = 0; G.sonYavas = 1;
    K.itX = K.itY = K.esne = K.ox = 0;
    P.durum = '';
    durumYap('bekle');
    // birikim: alinan = bu bölümde önceden alınmış yıldızlar (efekt bunları gizli/soluk tutar, sayaç bunlarla dolu başlar)
    OLAY.emit('yeniden', { birikim: tut, alinan: alinan, toplam: alinan.length });
  }

  // ---------- zaman ölçeği (his) ----------
  function zamanOlcek(dt) {
    let h = 1;
    if (G.durakT > 0) { G.durakT -= dt; h = 0.02; }
    else if (G.yildizT > 0) { G.yildizT -= dt; h = 0.5; }
    else if (P.durum === 'ucus' && G.yaklas) h = 0.62;
    G.zs = h <= 0.05 ? h : lerp(G.zs, h, us(dt, 14));
    const b = G.zs < 0.9 ? Math.round(G.zs * 10) / 10 : 1;
    if (b !== G.sonYavas && (b === 1 || Math.abs(b - G.sonYavas) >= 0.3)) { G.sonYavas = b; OLAY.emit('yavas', { k: b }); }
    return dt * G.zs;
  }

  // ---------- kamera ----------
  const K = { cx: 22, cy: 9, d: 55, hazir: false, itX: 0, itY: 0, esne: 0, ox: 0 };
  const _kh = { cx: 0, cy: 0, d: 0 };
  const _bk = { cx: 0, hw: 0, hh: 0, alt: 0 };
  function donSure() {
    const mesafe = Math.hypot(D.sapan.x - G.donX0, D.sapan.y - G.donY0);
    const hiz = Math.max(24, mesafe * 0.85); // uzun dönüş biraz daha sakin (göz takip edebilsin)
    return G.acele ? 0.35 : clamp(mesafe / hiz, 0.45, 1.35);
  }
  function donKameraGecis() {
    const k = clamp(G.durumT / donSure(), 0, 1);
    const t = clamp((k - 0.42) / 0.58, 0, 1);
    return t * t * (3 - 2 * t);
  }
  function bekleKamera(dik) {
    // Tüm parkur (salıncak → yıldızlar → engeller → Bilbo) ilk bakışta görünsün
    const w = DW();
    const sol = D.sapan.x - 4.0, sag = D.hedef.x + 5.0;
    let hw = Math.max(dik ? 14 : 16, (sag - sol) / 2);
    let cx = (sol + sag) / 2;
    // Dikey tutuşta uzun parkur çok küçük kalıyor: önce tüm parkur görünür, sonra kamera salıncağa yaklaşır (çekince yine açılır)
    // Yatayda da uzun parkurda aynısı: kısa süre bütün yol, sonra salıncak ve ilk yıldızlar (yarı genişlik ~19 m)
    let yakK = 0;
    const yakHw = dik ? 13 : 19;
    // Dikeyde çok uzun parkur (40. bölüm gibi) bütünüyle sığınca her şey minicik bir şerit oluyor: önce Bilbo'nun olduğu
    // son kısmı göster, sonra yıldızların üstünden salıncağa doğru kay. Bir uçuştan sonra doğrudan salıncağa yakın kal.
    const dikUzun = dik && hw > 40, panHw = 24;
    let panSure = 1.6, panGec = -1;
    if (dikUzun && (G.deneme > 0 || P.durum !== 'bekle')) { cx = sol + yakHw; hw = yakHw; yakK = 1; }
    else if (dikUzun) { hw = panHw; cx = sag - panHw; panSure = 1.5; panGec = 0.9; } // toplam ~2.4 sn; çekmeye başlayınca zaten çekiş kamerası alır
    if (hw > yakHw + 1 && P.durum === 'bekle') {
      const gec = panGec >= 0 ? panGec : G.deneme > 0 ? 1.3 : 2.4; // ilk açılışta parkura uzun bakış, sonraki dönüşlerde kısa
      const t = clamp((G.durumT - gec) / panSure, 0, 1), k = t * t * (3 - 2 * t);
      cx = lerp(cx, sol + yakHw, k); hw = lerp(hw, yakHw, k); // salıncağa daha yakın: Pırıl büyük görünsün
      yakK = k;
    }
    let enYuksekY = 12;
    const yy = w.yildizYer || [];
    for (let i = 0; i < yy.length; i++) enYuksekY = Math.max(enYuksekY, yy[i][1] + 2.5);
    const bl = w.bulutlar || [];
    for (let i = 0; i < bl.length; i++) enYuksekY = Math.max(enYuksekY, bl[i].y + 2.5);
    const hk = w.halkalar || [];
    for (let i = 0; i < hk.length; i++) enYuksekY = Math.max(enYuksekY, hk[i].y + hk[i].r + 2.0);
    const bc = w.baloncuklar || [];
    for (let i = 0; i < bc.length; i++) if (bc[i]) enYuksekY = Math.max(enYuksekY, bc[i].y + (bc[i].r || 1.4) + 2.0);
    const alt = -2.2;
    let hh = clamp(Math.max(hw * (dik ? 0.52 : 0.42), (enYuksekY - alt) * 0.52), 9.5, 17.0);
    if (yakK > 0) hh = lerp(hh, clamp(hw * (dik ? 0.52 : 0.5), 9.5, 17.0), yakK); // yaklaşınca yükseklik de daralsın
    _bk.cx = cx; _bk.hw = hw; _bk.hh = hh; _bk.alt = alt;
    return _bk;
  }
  function kameraHedef() {
    const asp = camera.aspect, tanY = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    let cx, hw, hh, alt, cyZorla = null, donW = 0;
    const dik = asp < 1;
    if (P.durum === 'bekle') {
      const b = bekleKamera(dik);
      cx = b.cx; hw = b.hw; hh = b.hh; alt = b.alt;
    } else if (P.durum === 'cek') {
      // Çekerken salıncak solda kalır; güç arttıkça veya iniş işareti uzadıkça Pırıl, tam yay ve iniş bölgesi kadrajlanır
      const g = clamp(CEK.guc, 0, 1);
      const ei = (typeof EFEKT !== 'undefined' && EFEKT && EFEKT.inis) ? EFEKT.inis : null;
      const eiGorunur = !!(ei && ei.gorunur > 0.2 && isFinite(ei.x));
      const minSag = Math.min(20, D.hedef.x * 0.65 + 4);
      const hedefSag = D.hedef.x + 5.0;
      const varsayilanSag = lerp(minSag, hedefSag, g);
      const inisSag = eiGorunur ? (ei.x + 5.5) : varsayilanSag;
      const maxSag = eiGorunur ? Math.max(hedefSag, Math.min(D.hedef.x + 18, inisSag)) : hedefSag;
      let sag = clamp(Math.max(inisSag, varsayilanSag), minSag, maxSag);
      if (eiGorunur) sag = Math.max(sag, Math.min(D.hedef.x + 20, ei.x + 7.5));
      const sol = Math.min(-6.0, P.x - 4.4); // çekilen Pırıl kenara yapışmasın
      hw = Math.max(dik ? 12.5 : 13.0, (sag - sol) / 2);
      cx = (sol + sag) / 2;
      if (dik) { // dikey: en geniş kadraj sınırlı; iniş işareti görünsün yeter, Pırıl hep okunaklı
        const sagD = eiGorunur ? Math.max(ei.x + 3.5, minSag) : Math.min(sag, minSag + (hedefSag - minSag) * g);
        hw = clamp((sagD - sol) / 2, 12.5, 25); cx = sol + hw;
      }
      else if (!dik && hw > 14.5) { hw = 14.5 + (hw - 14.5) * 0.45; cx = sol + hw; } // yatayda da Pırıl büyük kalsın; güç arttıkça hedefe doğru açılır // dikeyde Pırıl minicik kalmasın: yayın başı ve gerilme büyük görünsün
      alt = Math.min(-1.8 - g * 0.7, P.y - 2.6);
      if (eiGorunur) alt = Math.min(alt, -2.4);
      let baseHh = 7.8 + g * (dik ? 4.6 : 4.2) + (D.hedef.x > 50 ? g * 2.0 : 0);
      if (C.gecerli && C.vy > 0) {
        const sMax = 0.55 + 1.25 * g;
        const sTepe = Math.min(C.vy / YC, eiGorunur ? Math.max(sMax, C.vy / YC) : sMax);
        const yayTepeY = P.y + C.vy * sTepe - 0.5 * YC * sTepe * sTepe;
        baseHh = Math.max(baseHh, (yayTepeY + 2.6 - alt) * 0.5);
      }
      hh = clamp(baseHh, 7.8, 17.5);
    } else if (P.durum === 'kavus') {
      const tK = G.durumT, yH = D.hedef.y || 0;
      const s0 = clamp((tK - 0.25) / 0.8, 0, 1), s1 = clamp((tK - 2.15) / 0.6, 0, 1);
      const sarilW = (s0 * s0 * (3 - 2 * s0)) * (1 - s1 * s1 * (3 - 2 * s1));
      const d0 = clamp((tK - 2.15) / 0.7, 0, 1), dansW = d0 * d0 * (3 - 2 * d0);
      cx = lerp(lerp(D.hedef.x - 0.65, D.hedef.x - 0.55, sarilW), D.hedef.x - 0.65, dansW);
      hw = lerp(lerp(dik ? 3.0 : 4.2, dik ? 2.05 : 3.15, sarilW), dik ? 2.65 : 4.05, dansW);
      hh = lerp(lerp(dik ? 2.55 : 2.5, dik ? 2.05 : 1.95, sarilW), 2.45, dansW);
      alt = -1.5;
      cyZorla = yH + lerp(lerp(1.15, 1.05, sarilW), 1.22, dansW);
      if (G.bolumIdx + 1 >= bolumListesi().length) { // BÜYÜK FİNAL: sarılmadan sonra geri ve yukarı açıl; ikisi alt üçte birde, üstte gökyüzü (havai fişekler)
        const f0 = clamp((tK - 3.2) / 1.2, 0, 1), fW = f0 * f0 * (3 - 2 * f0); // önce 3.2 sn yakın: sarılma + sevinç dansı
        if (fW > 0) {
          hw = lerp(hw, dik ? 6 : 9, fW); hh = lerp(hh, dik ? 8.5 : 6, fW);
          const dF = Math.max(hw / (tanY * asp), hh / tanY), vF = dF * tanY;
          cyZorla = lerp(cyZorla, yH + 1.0 + 0.62 * vF, fW);
        }
      }
    } else if (P.durum === 'don' || P.durum === 'yuvar') {
      if (P.durum === 'yuvar') {
        cx = P.x + clamp(P.vx, -8, 12) * 0.08; hw = dik ? 5.2 : 7.5; hh = 4.8; alt = -1.2;
        if (G.kos || (A.bilboKos && G.durdu === false && G.kosAday && kosBolge(P.x))) { // Bilbo koşup gelecek: ikisi de kadrajda
          const hx = G.kos ? G.kos.x0 : D.hedef.x;
          cx = (P.x + hx) / 2; hw = Math.max(hw, Math.abs(hx - P.x) / 2 + (dik ? 2.6 : 3.6)); hh = Math.max(hh, dik ? 4.8 : 4.4);
        }
      } else {
        donW = donKameraGecis();
        const yon = Math.sign(D.sapan.x - G.donX0) || -1;
        const b = bekleKamera(dik);
        cx = lerp(P.x + yon * 1.5, b.cx, donW);
        hw = lerp(dik ? 7.5 : 10.5, b.hw, donW);
        hh = lerp(6.8, b.hh, donW);
        alt = lerp(-1.4, b.alt, donW);
      }
    } else { // uçuş: geniş ileri görüş; yükseldikçe ve hedefe yaklaştıkça akıcı kadraj
      const px = P.x, yakin = D.hedef.x - px;
      const yt = clamp((P.y - 12) / 10, 0, 1), yuksek = yt * yt * (3 - 2 * yt);
      hh = clamp((Math.max(P.y, 0) + 2.5) * 0.68, 7.2, dik ? 12.5 : 10.5) + yuksek * (dik ? 3.0 : 2.8);
      hw = (dik ? 8.2 : 11.5) + clamp((P.y - 8) * 0.35, 0, 3.0) + yuksek * (dik ? 2.0 : 2.5);
      cx = px + clamp(P.vx, -10, 32) * 0.14;
      // inişe geçince gideceği yer de görünsün: önü (iniş noktasına doğru) biraz daha aç
      if (P.vy < 0 && P.vx > 0) {
        const kT = (P.vy + Math.sqrt(P.vy * P.vy + 2 * YC * Math.max(P.y - R_PIRIL, 0))) / YC;
        const on = clamp((P.vx * kT) * 0.5, 0, hw * 0.6);
        const inisK = clamp(-P.vy / 8, 0, 1);
        cx = Math.max(cx, lerp(cx, px + on, inisK));
      }
      let k = 0;
      if (yakin < 18 && yakin > -12) {
        const kSol = clamp((18 - yakin) / 10, 0, 1);
        const kSag = clamp((yakin + 12) / 6, 0, 1);
        k = (kSol * kSol * (3 - 2 * kSol)) * (kSag * kSag * (3 - 2 * kSag));
        const yhw = Math.max(dik ? 6.2 : 8.5, Math.abs(yakin) / 2 + 4.4);
        const yhh = clamp(Math.max(P.y, D.hedef.y || 0) * 0.65 + 3.2, dik ? 6.0 : 5.2, hh);
        cx = lerp(cx, (px + D.hedef.x) / 2, k);
        hw = lerp(hw, yhw, k);
        hh = lerp(hh, yhh, k);
      }
      alt = -1.5;
      const d0 = Math.max(hw / (tanY * asp), hh / tanY), visH = d0 * tanY;
      const cyYer = alt + visH * (dik ? 0.84 : 1);
      cyZorla = Math.max(cyYer, P.y - visH * 0.05 + clamp(P.vy, -10, 15) * 0.14 * (1 - k * 0.65));
      // güvenli alan: Pırıl'ın önündeki/üstündeki (14 m içinde) toplanmamış yıldızlar ve halkalar üstteki göstergenin
      // (%14) altında ve yan kenarlardan içeride kalsın; gerekirse kamera yukarı bakar, sağa kayar ya da biraz uzaklaşır
      const wS = DW(), yyS = wS.yildizYer || [], hkS = wS.halkalar || [];
      let ust = -1e9, sagS = -1e9;
      for (let j = 0; j < yyS.length && j < 5; j++) {
        if (G.yildizAlindi[j]) continue;
        const sx = yyS[j][0], sy = yyS[j][1];
        if (sx < P.x - 2 || Math.hypot(sx - P.x, sy - P.y) > 16) continue;
        ust = Math.max(ust, sy + 0.9); sagS = Math.max(sagS, sx + 1.0);
      }
      for (let j = 0; j < hkS.length; j++) {
        const hq = hkS[j];
        if (!hq || G.halkaAlindi[j] || hq.x < P.x - 2 || Math.hypot(hq.x - P.x, hq.y - P.y) > 16) continue;
        ust = Math.max(ust, hq.y + (hq.r || 1.5) * 0.8); sagS = Math.max(sagS, hq.x + (hq.r || 1.5));
      }
      G.kamGuv = false;
      if (ust > -1e8 && A.guvenliKamera) {
        let vH = Math.max(hw / asp, hh);
        const wCap = dik ? 13.5 : 19, hCap = dik ? 20 : 18, UK = 0.6; // UK: üst %16 gösterge şeridi + yıldız payı
        if (ust > cyZorla + UK * vH || sagS > cx + 0.9 * vH * asp) G.kamGuv = true;
        if (sagS > cx + 0.9 * vH * asp) { // önde: sağa kay, yetmezse biraz aç
          const istW = clamp((sagS - P.x + 0.4) / 1.55, 0, wCap);
          if (istW > vH * asp) { hw = Math.max(hw, istW); vH = Math.max(hw / asp, hh); }
          const vW = vH * asp;
          cx = Math.max(cx, Math.min(sagS - 0.9 * vW, P.x + 0.62 * vW));
        }
        let cyU = ust - UK * vH;
        if (cyU > cyZorla) { // yukarıda: yukarı bak, Pırıl alt kenara inmesin; yetmezse biraz uzaklaş
          const istH = clamp((ust - P.y + 0.7) / (UK + 0.8), 0, hCap);
          if (istH > vH) { hh = Math.max(hh, istH); vH = Math.max(hw / asp, hh); }
          cyU = Math.min(ust - UK * vH, P.y - 0.7 + 0.8 * vH);
          cyZorla = Math.max(cyZorla, cyU, alt + vH * (dik ? 0.84 : 1));
        }
      }
    }
    const d = Math.max(hw / (tanY * asp), hh / tanY);
    const visH = d * tanY;
    let cy = cyZorla !== null ? cyZorla : alt + visH;
    const dikY = P.durum === 'don' ? lerp(0.84, 0.64, donW) : ((P.durum === 'bekle' || P.durum === 'cek') ? 0.64 : 0.84); // dikeyde yer alt-ortaya otursun, boş gök azalsın
    if (cyZorla === null && dik && P.durum !== 'kavus') cy = alt + visH * dikY;
    _kh.cx = cx; _kh.cy = cy; _kh.d = d; return _kh;
  }
  function kameraGuncelle(dt) {
    const h = kameraHedef();
    if (!K.hazir) { K.cx = h.cx; K.cy = h.cy; K.d = h.d; K.itX = K.itY = K.esne = K.ox = 0; K.sonDurum = P.durum; K.hazir = true; }
    const hz = P.durum === 'ucus' ? 3.5 : P.durum === 'kavus' ? 2.6 : P.durum === 'cek' ? 3.2 : P.durum === 'don' ? lerp(4.6, 2.6, donKameraGecis()) : P.durum === 'yuvar' ? 3 : 2.6;
    if (P.durum === 'ucus') { // Pırıl'a göre farkı yumuşat: hızlı uçuşta kamera geride kalmaz
      if (K.sonDurum !== 'ucus') K.ox = K.cx - P.x;
      K.ox = lerp(K.ox, h.cx - P.x, us(dt, 2.2));
      K.cx = P.x + K.ox;
      K.cy = lerp(K.cy, h.cy, us(dt, h.cy > K.cy ? (G.kamGuv ? 8 : 4.5) : 3));
      K.d = lerp(K.d, h.d, us(dt, h.d < K.d ? 2.0 : (G.kamGuv ? 5 : 1.6))); // yıldız göstergenin altına girecekse daha çabuk açıl
    } else {
      K.cx = lerp(K.cx, h.cx, us(dt, hz));
      K.cy = lerp(K.cy, h.cy, us(dt, hz));
      K.d = lerp(K.d, h.d, us(dt, P.durum === 'kavus' ? 2.3 : hz * 0.8));
    }
    K.sonDurum = P.durum;
    // Pırıl hiç kadrajdan çıkmasın (hızlı dönüş, sekme, uzun uçuş): görünen alanın %70'i içinde tut
    if (P.durum === 'ucus' || P.durum === 'don' || P.durum === 'yuvar') {
      const tY = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const yG = K.d * tY, xG = yG * camera.aspect;
      const px = P.x, py = P.y + 0.3;
      const ks = us(dt, 9); // önce yumuşakça (sıçramasız) yaklaş, yalnız kenara çok yaklaşırsa kesin tut
      if (px < K.cx - xG * 0.7) K.cx = lerp(K.cx, px + xG * 0.7, ks); else if (px > K.cx + xG * 0.7) K.cx = lerp(K.cx, px - xG * 0.7, ks);
      if (px < K.cx - xG * 0.9) K.cx = px + xG * 0.9; else if (px > K.cx + xG * 0.9) K.cx = px - xG * 0.9;
      if (py > K.cy + yG * 0.7) K.cy = lerp(K.cy, py - yG * 0.7, ks); else if (py < K.cy - yG * 0.85) K.cy = lerp(K.cy, py + yG * 0.85, ks);
      if (py > K.cy + yG * 0.9) K.cy = py - yG * 0.9;
      if (P.durum === 'ucus') K.ox = K.cx - P.x;
    }
    // itme / esneme: yumuşak yay gibi söner
    const s = us(dt, 5);
    K.itX = lerp(K.itX, 0, s); K.itY = lerp(K.itY, 0, s); K.esne = lerp(K.esne, 0, us(dt, 4));
    K.esne = clamp(K.esne, -1, 1.5);
    const d = K.d * (1 + K.esne * 0.05);
    camera.position.set(K.cx + K.itX, K.cy + K.itY + d * 0.06, d);
    camera.lookAt(K.cx + K.itX, K.cy + K.itY, 0);
  }

  // ---------- yer tutucular (modüller yoksa) ----------
  function yedekKur(dunyaVar, pirilVar, efektVar) {
    if (!dunyaVar) {
      scene.add(new THREE.HemisphereLight(0xfff1d6, 0x6a8a4a, 1.6));
      const gl = new THREE.DirectionalLight(0xffe2b0, 1.4); gl.position.set(-10, 20, 15); scene.add(gl);
      const zem = new THREE.Mesh(new THREE.BoxGeometry(140, 4, 14), new THREE.MeshLambertMaterial({ color: 0x8cc35a }));
      zem.position.set(25, -2, -3); scene.add(zem);
      const dm = new THREE.MeshLambertMaterial({ color: 0x8a5a35 });
      [-1.3, 1.3].forEach(function (x) {
        const dir = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 4.6, 8), dm);
        dir.position.set(x, 2.3, -0.3); scene.add(dir);
      });
      const w = YEDEK;
      const man = new THREE.Mesh(new THREE.SphereGeometry(w.mantar.r, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0xe0504a }));
      man.position.set(w.mantar.x, w.mantar.y, 0); scene.add(man);
      const bul = new THREE.Mesh(new THREE.SphereGeometry(w.bulut.r, 16, 10), new THREE.MeshLambertMaterial({ color: 0xffffff }));
      bul.scale.y = 0.55; bul.position.set(w.bulut.x, w.bulut.y, 0); scene.add(bul);
    }
    if (!dunyaVar && !(DW().cali)) { // DUNYA çalıyı çizmiyorsa basit bir yeşil tümsek
      const c = CALI_YEDEK;
      const cm = new THREE.Mesh(new THREE.SphereGeometry(c.r, 16, 10), new THREE.MeshLambertMaterial({ color: 0x5f9e3c }));
      cm.scale.set(1.15, 1, 0.9); cm.position.set(c.x, c.y, 0); scene.add(cm);
    }
    if (!pirilVar) {
      yedek.piril = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 14), new THREE.MeshLambertMaterial({ color: 0x9a5bd6 }));
      yedek.bilbo = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 14), new THREE.MeshLambertMaterial({ color: 0x9a6a3a }));
      yedek.bilbo.position.set(D.hedef.x, 0.7, 0);
      scene.add(yedek.piril, yedek.bilbo);
    }
    if (!efektVar) {
      const ym = new THREE.MeshBasicMaterial({ color: 0xffd84a });
      const yy = DW().yildizYer || [];
      for (let i = 0; i < yy.length && i < 5; i++) {
        const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.5), ym);
        m.position.set(yy[i][0], yy[i][1], 0); scene.add(m); yedek.yildiz.push(m);
      }
      const nm = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const ng = new THREE.SphereGeometry(0.16, 8, 6);
      for (let i = 0; i < 14; i++) { const n = new THREE.Mesh(ng, nm); n.visible = false; scene.add(n); yedek.nokta.push(n); }
      OLAY.on('cek', function (c) {
        for (let i = 0; i < 14; i++) {
          const s = (i + 1) * 0.09, n = yedek.nokta[i];
          n.visible = c.guc > 0.05 && (c.vx || c.vy);
          n.position.set(c.x + c.vx * s, c.y + c.vy * s - 0.5 * YC * s * s, 0.2);
        }
      });
      OLAY.on('birak', function () { yedek.nokta.forEach(function (n) { n.visible = false; }); });
      OLAY.on('yildiz', function (y) { if (yedek.yildiz[y.i]) yedek.yildiz[y.i].visible = false; });
      OLAY.on('yeniden', function () { yedek.yildiz.forEach(function (m) { m.visible = true; }); });
    }
    yedek.aktif = !dunyaVar || !pirilVar || !efektVar;
  }
  function yedekGuncelle(dt, t) {
    if (yedek.piril) { yedek.piril.position.set(P.x, P.y, 0.3); yedek.piril.rotation.z = P.aci; }
    if (yedek.bilbo) yedek.bilbo.position.y = 0.7 + (P.durum === 'kavus' ? Math.abs(Math.sin(t * 7)) * 0.8 : 0);
    for (let i = 0; i < yedek.yildiz.length; i++) yedek.yildiz[i].rotation.y = t * 2 + i;
  }

  // ---------- görünmez deneme: gerçek fizik koduyla, ekrana çizmeden ----------
  // dene(vx, vy, kanatlar, bolumIdx, secenek) → {yildiz, kavustu, x, y, ...}
  // kanatlar: uçuş saatine göre (G.ucusT, yavaşlamalar dahil) kanat çırpma anları, sn. bolumIdx: 0 tabanlı (yoksa şimdiki bölüm).
  // secenek: { iska: yardım için sayılacak ıska (varsayılan 0), iz: true → yol noktaları }
  const _yedekG = {}, _yedekK = {}, _yedekD = {};
  function dene(vx, vy, kanatlar, bolumIdx, secenek) {
    const sec = secenek || {};
    const l = bolumListesi();
    Object.assign(_yedekG, G);
    _yedekG.yildizAlindi = G.yildizAlindi.slice(); _yedekG.halkaAlindi = G.halkaAlindi.slice(); _yedekG.otoKanatT = G.otoKanatT.slice();
    _yedekG.baloncukAlindi = G.baloncukAlindi.slice(); _yedekG.esintiIc = G.esintiIc.slice();
    Object.assign(_yedekK, K);
    _yedekD.hx = D.hedef.x; _yedekD.hy = D.hedef.y; _yedekD.sag = D.sagSinir; _yedekD.tavan = D.tavan;
    const p0 = { x: P.x, y: P.y, vx: P.vx, vy: P.vy, aci: P.aci, durum: P.durum };
    const c0 = { x: CEK.x, y: CEK.y, guc: CEK.guc }, ucusDurum = window.UCUS ? window.UCUS.durum : P.durum;
    const izN0 = G.izN, iz0 = IZ.slice(0, izN0).map(function (n) { return [n[0], n[1]]; });
    let sonuc;
    OLAY.sus++;
    try {
      G.sim = true;
      if (bolumIdx != null && isFinite(bolumIdx)) {
        const i = clamp(bolumIdx | 0, 0, l.length - 1), b = l[i];
        G.bolumIdx = i;
        if (b.hedef) { D.hedef.x = b.hedef.x; D.hedef.y = b.hedef.y || 0; }
        D.sagSinir = Math.max(58, D.hedef.x + 14); D.tavan = b.tavan || 34;
      }
      G.iska = sec.iska | 0; G.gucEk = 0;
      G.bolumDeneme = sec.deneme | 0; // bu bölümde önceki uçuş sayısı (gizli yardım için; varsayılan 0 = yardımsız)
      for (let i = 0; i < 5; i++) G.yildizAlindi[i] = false;
      G.yildizSay = 0; G.durakT = 0; G.yildizT = 0; G.zs = 1; G.yaklas = 0;
      if (Array.isArray(sec.alinan)) { // önceki ıskalı uçuşlarda alınmış yıldızlar (oyunda "bir daha"ya kadar kalır)
        for (let i = 0; i < sec.alinan.length; i++) { const j = sec.alinan[i] | 0; if (j >= 0 && j < 5 && !G.yildizAlindi[j]) { G.yildizAlindi[j] = true; G.yildizSay++; } }
      }
      P.durum = 'bekle';
      firlatIc(vx, vy, false);
      if (sec.x0 != null && sec.y0 != null && isFinite(sec.x0) && isFinite(sec.y0)) { P.x = +sec.x0; P.y = +sec.y0; } // çekilen yerden fırlatma
      G.otoKanatT = (kanatlar || []).slice().sort(function (a, b) { return a - b; });
      const iz = sec.iz ? [[+P.x.toFixed(2), +P.y.toFixed(2)]] : null;
      let t = 0, enX = P.x, enY = P.y, kanatSay = 0, kavustu = false, f = 0;
      let inisX = null, inisY = null;
      const dt = clamp(+sec.dt || 1 / 60, 1 / 240, 1 / 20); // secenek.dt: kare süresi (iPad 120 Hz denemesi için 1/120)
      const fEn = Math.ceil(30 / dt);
      for (f = 0; f < fEn; f++) {
        const kk0 = G.kanatKalan;
        fizikAdim(dt); // oyunla aynı adım işlevi
        if (G.kanatKalan < kk0) kanatSay += kk0 - G.kanatKalan;
        if (inisX === null && P.durum !== 'ucus') { inisX = +P.x.toFixed(3); inisY = +P.y.toFixed(3); }
        t += dt;
        if (P.x > enX) enX = P.x; if (P.y > enY) enY = P.y;
        if (iz && (f % Math.max(1, Math.round(0.05 / dt))) === 0) iz.push([+P.x.toFixed(2), +P.y.toFixed(2)]);
        if (P.durum === 'kavus') { kavustu = true; break; }
        if (P.durum === 'don' || P.durum === 'bekle') break;
      }
      const yl = [];
      for (let i = 0; i < 5; i++) if (G.yildizAlindi[i]) yl.push(i);
      sonuc = {
        yildiz: G.yildizSay, kavustu: kavustu, x: +P.x.toFixed(2), y: +P.y.toFixed(2),
        yildizlar: yl, kanat: kanatSay, enX: +enX.toFixed(2), enY: +enY.toFixed(2), sure: +t.toFixed(2),
        hedefX: G.bilboKostu && l[G.bolumIdx] && l[G.bolumIdx].hedef ? l[G.bolumIdx].hedef.x : D.hedef.x, // Bilbo koştuysa bölümün asıl hedefi
        durum: P.durum, inisX: inisX, inisY: inisY,
        bilboKos: !!G.bilboKostu, ucusYildiz: G.ucusYildiz || 0, tekAtis: (G.ucusYildiz || 0) >= 5
      };
      if (iz) sonuc.iz = iz;
    } finally {
      Object.assign(G, _yedekG);
      Object.assign(K, _yedekK);
      D.hedef.x = _yedekD.hx; D.hedef.y = _yedekD.hy; D.sagSinir = _yedekD.sag; D.tavan = _yedekD.tavan;
      P.x = p0.x; P.y = p0.y; P.vx = p0.vx; P.vy = p0.vy; P.aci = p0.aci; P.durum = p0.durum;
      CEK.x = c0.x; CEK.y = c0.y; CEK.guc = c0.guc;
      for (let i = 0; i < iz0.length; i++) { IZ[i][0] = iz0[i][0]; IZ[i][1] = iz0[i][1]; }
      G.izN = izN0;
      if (window.UCUS) window.UCUS.durum = ucusDurum;
      G.sim = false;
      OLAY.sus--;
    }
    return sonuc;
  }

  // ---------- oto test ----------
  // oto fırlatma: gerçek fizikle (dene) tarar; en çok yıldız + kavuşma, komşu atışlarda da tutan (sağlam) çözümü seçer
  function otoKanatAdaylari(kh) {
    const l = [[]];
    if (kh <= 0) return l;
    const n = Math.min(kh, 4);
    const basl = [0.7, 0.95, 1.2, 1.5, 1.9], ara = [0.75, 1.0, 1.3];
    for (let c = Math.max(1, n - 1); c <= n; c++) {
      for (let i = 0; i < basl.length; i++) for (let j = 0; j < ara.length; j++) {
        const k = []; for (let q = 0; q < c; q++) k.push(+(basl[i] + ara[j] * q).toFixed(2));
        l.push(k);
      }
    }
    return l;
  }
  function otoArama(idx) {
    const kh = (bolumListesi()[idx] || {}).kanatHak != null ? bolumListesi()[idx].kanatHak : aktifKanatHak();
    const ka = otoKanatAdaylari(kh), adaylar = [];
    for (let v = 13; v <= 31.5; v += 1.0) {
      for (let a = 20; a <= 68; a += 3) {
        const vx = v * Math.cos(a * DER), vy = v * Math.sin(a * DER);
        for (let k = 0; k < ka.length; k++) {
          const r = dene(vx, vy, ka[k], idx);
          if (!r || !r.kavustu) continue;
          adaylar.push({ vx: vx, vy: vy, kt: ka[k], yildiz: r.yildiz, skor: r.yildiz * 100 - ka[k].length * 2 });
        }
      }
    }
    adaylar.sort(function (p, q) { return q.skor - p.skor; });
    let enIyi = null, enSkor = -1e9;
    for (let i = 0; i < adaylar.length && i < 12; i++) { // sağlamlık: biraz farklı hızla da tutuyor mu?
      const c = adaylar[i];
      let s = c.skor;
      const sap = [[1.03, 1], [0.97, 1], [1, 1.03], [1, 0.97]];
      for (let j = 0; j < sap.length; j++) {
        const r = dene(c.vx * sap[j][0], c.vy * sap[j][1], c.kt, idx);
        if (r && r.kavustu) s += 6 + (r.yildiz === c.yildiz ? 4 : 0);
      }
      if (s > enSkor) { enSkor = s; enIyi = c; }
    }
    return enIyi;
  }
  function otoFirlat() {
    const e = otoArama(G.bolumIdx);
    if (e) { G.otoKanatT = e.kt.slice(); firlatIc(e.vx, e.vy, false); return; }
    otoFirlatEski();
  }
  function otoFirlatEski() { // çözüm bulunamazsa: Bilbo'ya düz bir atış
    const dx = D.hedef.x - D.sapan.x, dy = (D.hedef.y + 0.7) - D.sapan.y;
    const tn = Math.tan(0.82), vc = dx * Math.sqrt(YC / 2 / Math.max(dx * tn - dy, 1));
    G.otoKanatT = [];
    firlatIc(vc, vc * tn, false);
  }

  // ---------- ölçü: 5 yaşında çocuk taklidi (çizmeden, dene ile; gizli yardım dahil) ----------
  // Çekiş uzayı: r = çekiş oranı (0..1, tam çekişin oranı), a = açı (derece). Oyunla aynı dönüşüm (cekHesapla).
  function cekHiz(r, aDer, gucEk) {
    if (r < A.olu) return null;
    const a = clamp(aDer, A.aciMin, A.aciMax) * DER, rr = clamp(r, 0, 1);
    const f = Math.pow((rr - A.olu) / (1 - A.olu), A.us);
    const v = Math.min(lerp(A.vMin, A.vMax, f) * (1 + (gucEk || 0)), A.vMax);
    return {
      vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      x0: D.sapan.x - Math.cos(a) * A.cekEn * rr, y0: Math.max(D.sapan.y - Math.sin(a) * A.cekEn * rr, 1.3)
    };
  }
  function cekOran(vx, vy) { // hızdan (gucEk yok) çekiş oranı ve açı
    const v = Math.hypot(vx, vy), f = clamp((v - A.vMin) / (A.vMax - A.vMin), 0, 1);
    return { r: A.olu + (1 - A.olu) * Math.pow(f, 1 / A.us), a: Math.atan2(vy, vx) / DER };
  }
  function yolParlak(c, yy, alinan) { // efekt.js'teki gibi: çekerken görünen yay (salt parabol) hangi yıldızların 1.7 m yakınından geçiyor
    let n = 0;
    const hy = R_PIRIL, a_ = 0.5 * YC, b_ = -c.vy, c_ = hy - c.y0, disk = b_ * b_ - 4 * a_ * c_;
    const sSon = disk >= 0 ? Math.min((-b_ + Math.sqrt(disk)) / (2 * a_), 7.5) : 4;
    for (let i = 0; i < yy.length && i < 5; i++) {
      if (alinan[i]) continue;
      let en = 1e9;
      for (let k = 0; k <= 56; k++) {
        const s = sSon * k / 56, dx = c.x0 + c.vx * s - yy[i][0], dy = c.y0 + c.vy * s - 0.5 * YC * s * s - yy[i][1];
        en = Math.min(en, dx * dx + dy * dy);
      }
      if (en < 1.7 * 1.7) n++;
    }
    return n;
  }
  const _cozumBellek = [];
  function cocukCozum(idx, sec) {
    const b = bolumListesi()[idx];
    if (sec && sec.cozum) { const o = cekOran(sec.cozum.vx, sec.cozum.vy); return { r: o.r, a: o.a, kt: (sec.cozum.kt || []).slice() }; }
    const bel = _cozumBellek[idx];
    if (bel && bel.b === b) return bel.c;
    // tasarımcının gerçek çekişle doğruladığı ana çözüm: { cozum: { cekis: r, aci: derece, kanat: [sn…] } }
    if (b && b.cozum && isFinite(b.cozum.cekis) && isFinite(b.cozum.aci)) {
      const kt = Array.isArray(b.cozum.kanat) ? b.cozum.kanat.slice() : [], c = cekHiz(+b.cozum.cekis, +b.cozum.aci, 0);
      const s = c ? dene(c.vx, c.vy, kt, idx, { x0: c.x0, y0: c.y0 }) : null;
      const cz = { r: +b.cozum.cekis, a: +b.cozum.aci, kt: kt, yildiz: s ? s.yildiz : 0, kavustu: !!(s && s.kavustu), tasarim: true };
      _cozumBellek[idx] = { b: b, c: cz };
      return cz;
    }
    // çocuk çektiği yerden fırlatır: çekiş uzayında (oran × açı × kanat anları) tara, en sağlam 5 yıldız + kavuşmayı seç
    const kh = b.kanatHak != null ? b.kanatHak : 1, ka = otoKanatAdaylari(kh), ad = [];
    for (let r = 0.12; r <= 0.951; r += 0.03) for (let a = 20; a <= 68.01; a += 2.5) {
      const c = cekHiz(r, a, 0);
      if (!c) continue;
      for (let k = 0; k < ka.length; k++) {
        const s = dene(c.vx, c.vy, ka[k], idx, { x0: c.x0, y0: c.y0 });
        if (s.kavustu) ad.push({ r: r, a: a, kt: ka[k], yildiz: s.yildiz, kavustu: true, sk: s.yildiz * 100 - ka[k].length * 3 });
      }
    }
    if (!ad.length) { _cozumBellek[idx] = { b: b, c: null }; return null; }
    ad.sort(function (p, q) { return q.sk - p.sk; });
    const ust = ad[0].sk, sap = [[0.04, 0, 0], [-0.04, 0, 0], [0, 4, 0], [0, -4, 0], [0, 0, 0.3], [0, 0, -0.3], [0.03, 3, 0.2], [-0.03, -3, -0.2]];
    let en = null, enS = -1e9;
    for (let i = 0; i < ad.length && i < 40 && ad[i].sk >= ust - 100; i++) {
      const p = ad[i];
      let s = p.sk;
      for (let j = 0; j < sap.length; j++) {
        const c = cekHiz(p.r * (1 + sap[j][0]), p.a + sap[j][1], 0);
        if (!c) continue;
        const kt = p.kt.map(function (q) { return q + sap[j][2]; });
        const q = dene(c.vx, c.vy, kt, idx, { x0: c.x0, y0: c.y0 });
        if (q.kavustu) s += 8 + (q.yildiz >= p.yildiz ? 12 : 0);
      }
      s -= Math.abs(p.r - 0.5) * 10; // çocuğun tahmin edebileceği orta çekiş biraz yeğlenir
      if (s > enS) { enS = s; en = p; }
    }
    _cozumBellek[idx] = { b: b, c: en };
    return en;
  }
  function rastgele(tohum) { // mulberry32
    let s = (tohum >>> 0) || 1;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0; let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // cocukDene(idx, tohum, {enCok:12, ogren:0.5, cozum:{vx,vy,kt}}) → {deneme (5 yıldız + kavuşmanın geldiği uçuş; yoksa null), atislar}
  function cocukDene(idx, tohum, secenek) {
    const sec = secenek || {}, l = bolumListesi();
    idx = clamp(idx != null ? idx | 0 : G.bolumIdx, 0, l.length - 1);
    const b = l[idx], yy = b.yildizYer || [], hedefX = b.hedef ? b.hedef.x : D.hedef.x;
    const coz = cocukCozum(idx, sec);
    const rnd = rastgele(tohum != null ? tohum : 1), u = function (a, c) { return a + (c - a) * rnd(); };
    const enCok = sec.enCok || 12, ogren = sec.ogren != null ? sec.ogren : 0.5;
    const hedefKt = coz ? coz.kt : [];
    const kh = b.kanatHak != null ? b.kanatHak : 1;
    // ilk çekiş: rastgele ama makul
    let ir = u(0.3, 0.75), ia = u(28, 58);
    let iska = 0, gucEk = 0, alinan = [false, false, false, false, false];
    const atislar = [];
    // ilk: birikmiş 5★ + kavuşmanın geldiği uçuş; tek: tek uçuşta 5★ + kavuşma (ustalık), tekEn uçuşa kadar aranır
    let ilk = null, tek = null;
    const tekEn = sec.tekEn || 8;
    for (let n = 0; n < Math.max(enCok, tekEn); n++) {
      if (ilk != null && n >= tekEn) break;
      if (ilk == null && n >= enCok) break;
      // parlayan yıldızlara bakarak çekişi biraz oynatır (parmağı gezdirip yayın yıldızdan geçtiği yeri arar)
      let br = ir, ba = ia, bp = -1;
      for (let k = 0; k < (sec.parlakYok ? 1 : 7); k++) {
        const rr = k === 0 ? ir : ir * (1 + u(-0.06, 0.06)), aa = k === 0 ? ia : ia + u(-5, 5);
        const c = cekHiz(rr, aa, gucEk);
        if (!c) continue;
        const p = yolParlak(c, yy, alinan);
        if (p > bp) { bp = p; br = rr; ba = aa; }
      }
      // parmak titremesi ve kanat anı gürültüsü
      const r = clamp(br * (1 + u(-0.08, 0.08)), 0, 1), a = ba + u(-5, 5);
      const kGur = n === 0 ? 0.6 : 0.35, kt = [];
      for (let j = 0; j < hedefKt.length; j++) kt.push(Math.max(0.15, hedefKt[j] + u(-kGur, kGur)));
      const c = cekHiz(r, a, gucEk);
      if (!c) { atislar.push({ r: +r.toFixed(3), a: +a.toFixed(1), salla: true }); ir = Math.max(ir, 0.3); continue; } // fırlamadı (deneme sayılmaz ama süre geçer)
      if (sec.fazlaKanat !== false && kh > 0) {
        // gerçek çocuk: hakkı varken bazen fazladan dokunur, bazen bir kanadı unutur; denedikçe biraz azalır
        const az = Math.max(0.4, 1 - 0.1 * n);
        if (kt.length && rnd() < 0.20 * az) kt.splice(Math.floor(rnd() * kt.length), 1);
        const q = rnd(), ekSay = q < 0.20 * az ? 2 : q < 0.65 * az ? 1 : 0;
        const tepe = Math.max(0.3, c.vy / YC);
        for (let e = 0; e < ekSay && kt.length < kh; e++) {
          kt.push(Math.max(0.6, rnd() < 0.5 ? tepe + u(-0.3, 0.3) : tepe + u(0.3, 1.6)));
        }
        kt.sort(function (p, q2) { return p - q2; });
      }
      const al = []; for (let i = 0; i < 5; i++) if (alinan[i]) al.push(i);
      const s = dene(c.vx, c.vy, kt, idx, { iska: sec.yardimYok ? 0 : iska, deneme: sec.yardimYok ? 0 : n, alinan: al, x0: c.x0, y0: c.y0 });
      atislar.push({ r: +r.toFixed(3), a: +a.toFixed(1), kt: kt.map(function (q) { return +q.toFixed(2); }), parlak: bp, yildiz: s.yildiz, kavustu: s.kavustu, x: s.x });
      if (s.kavustu && s.tekAtis && tek == null) tek = n + 1;
      if (s.kavustu) {
        if (s.yildiz >= 5 && ilk == null) ilk = n + 1;
        if (ilk != null && (tek != null || n + 1 >= tekEn)) return { deneme: ilk, tek: tek, atislar: atislar, cozum: coz };
        iska = 0; gucEk = 0; // "bir daha": oyundaki gibi yıldızlar birikir (5 tamamsa baştan)
        if (s.yildiz >= 5 || sec.birikimYok) alinan = [false, false, false, false, false];
        else for (let i = 0; i < s.yildizlar.length; i++) alinan[s.yildizlar[i]] = true;
      } else {
        iska++;
        if (iska >= 2 && s.x < hedefX - 8) gucEk = Math.min(gucEk + 0.3, 1.6);
        else if (iska >= 2 && s.x < hedefX) gucEk = Math.min(gucEk + 0.12, 1.6);
        else if (s.x > hedefX + 2) gucEk = Math.max(gucEk - 0.3, 0);
        for (let i = 0; i < s.yildizlar.length; i++) alinan[s.yildizlar[i]] = true;
      }
      // öğrenme: önceki atışın izine ve kaçan yıldızlara bakıp doğru çekişe doğru düzeltir
      if (coz) { ir += (coz.r - ir) * ogren; ia += (coz.a - ia) * ogren; }
    }
    return { deneme: ilk, tek: tek, atislar: atislar, cozum: coz };
  }
  function cocukOzet(idx, n, secenek) {
    const say = n || 40, d = [];
    let tekSay = 0;
    for (let t = 1; t <= say; t++) { const r = cocukDene(idx, t * 7919 + 13, secenek); d.push(r.deneme == null ? 99 : r.deneme); if (r.tek != null && r.tek <= 8) tekSay++; }
    d.sort(function (p, q) { return p - q; });
    const ic = function (k) { return Math.round(100 * d.filter(function (x) { return x <= k; }).length / say); };
    return { bolum: (idx | 0) + 1, medyan: d[Math.floor(say / 2)], en3: ic(3), en5: ic(5), en8: ic(8), hic: Math.round(100 * d.filter(function (x) { return x === 99; }).length / say), tek8: Math.round(100 * tekSay / say), cozum: cocukCozum(idx | 0, secenek) };
  }

  // ---------- kurulum ve ana döngü ----------
  function guvenli(ad, f) { try { f(); } catch (e) { console.warn(ad + ' hatası:', e); } }

  function bolumBilgi() {
    const l = bolumListesi(), b = aktifBolum();
    return {
      idx: G.bolumIdx,
      no: G.bolumIdx + 1,
      bolum: G.bolumIdx + 1,
      toplam: l.length,
      ad: b.ad || ('Bölüm ' + (G.bolumIdx + 1)),
      altAd: b.altAd || '',
      acik: HEPSI_ACIK ? l.length : KAYIT.acik,
      hepsiAcik: HEPSI_ACIK,
      yildizlar: KAYIT.yildiz.slice(0, l.length),
      enIyiYildiz: KAYIT.yildiz[G.bolumIdx] || 0,
      tekler: KAYIT.tek.slice(0, l.length), tek: !!KAYIT.tek[G.bolumIdx],
      alinan: G.yildizAlindi.map(function (a, i) { return a ? i : -1; }).filter(function (i) { return i >= 0; }),
      kanatHak: aktifKanatHak(),
      kanatKalan: G.kanatKalan,
      hedef: { x: D.hedef.x, y: D.hedef.y },
      biyom: b.biyom != null ? b.biyom : null,
      hava: b.hava || null,
      zeminTur: b.zeminTur || null,
      kiyafet: b.kiyafet || null,
      gece: !!b.gece,
      sonBolum: G.bolumIdx + 1 >= l.length,
      bolumVeri: b,
      bolum: b
    };
  }

  function bolumAyarla(idx) {
    const l = bolumListesi();
    const i = clamp(parseInt(idx, 10) || 0, 0, l.length - 1);
    G.bolumIdx = i;
    const b = l[i];
    if (b.hedef) { D.hedef.x = b.hedef.x; D.hedef.y = b.hedef.y || 0; }
    D.sagSinir = Math.max(58, D.hedef.x + 14);
    D.tavan = b.tavan || 34;
    if (typeof DUNYA !== 'undefined' && DUNYA) {
      DUNYA.yildizYer = b.yildizYer || [];
      DUNYA.cali = b.cali !== undefined ? b.cali : null;
      DUNYA.mantar = b.mantar || (b.mantarlar && b.mantarlar[0]) || null;
      DUNYA.bulut = b.bulut || (b.bulutlar && b.bulutlar[0]) || null;
      DUNYA.mantarlar = b.mantarlar || [];
      DUNYA.bulutlar = b.bulutlar || [];
      DUNYA.niluferler = b.niluferler || [];
      DUNYA.ruzgarlar = b.ruzgarlar || [];
      DUNYA.halkalar = b.halkalar || [];
      DUNYA.baloncuklar = b.baloncuklar || [];
      DUNYA.esintiler = b.esintiler || [];
      DUNYA.dere = b.dere || null;
      DUNYA.gece = !!b.gece;
      DUNYA.hedef = { x: D.hedef.x, y: D.hedef.y };
    }
    return b;
  }

  function bolumSec(idx) {
    bolumAyarla(idx);
    K.hazir = false;
    yeniden();
    G.bolumDeneme = 0; // gizli "denedikçe cömertleş" yardımı yeni bölümde baştan
    const bilgi = bolumBilgi();
    OLAY.emit('bolum', bilgi);
    return bilgi;
  }

  function kur() {
    const qBolum = Q.get('bolum');
    const ilkIdx = qBolum ? (parseInt(qBolum, 10) || 1) - 1 : 0;
    bolumAyarla(ilkIdx);
    const dv = typeof dunyaKur === 'function', pv = typeof pirilKur === 'function', ev = typeof efektKur === 'function';
    if (dv) guvenli('dunyaKur', dunyaKur);
    if (pv) guvenli('pirilKur', pirilKur);
    if (ev) guvenli('efektKur', efektKur);
    yedekKur(dv, pv, ev);
    cekirdekBoyut();
    const kh = aktifKanatHak();
    G.kanatKalan = kh; G.kanatVar = kh > 0; G.kanatBekle = 0; G.suzT = 0;
    G.oyunHazir = true;
    OLAY.emit('bolum', bolumBilgi());
    OLAY.emit('durum', P.durum);
    requestAnimationFrame(dongu);
  }

  let son = 0, durak = false;
  document.addEventListener('visibilitychange', function () {
    durak = document.hidden;
    son = 0;
    if (durak) tutusuIptal();
  });

  function dongu(ms) {
    requestAnimationFrame(dongu);
    if (durak) return;
    let dt = son ? (ms - son) / 1000 : 1 / 60;
    son = ms;
    if (dt > 0) G.fps = lerp(G.fps, 1 / Math.max(dt, 0.001), 0.05);
    dt = Math.min(dt, 1 / 30) * HIZ;
    adim(dt);
  }

  // takılma bekçisi: hiçbir durumda oyun kilitlenmesin, her şey 'bekle'ye döner
  function bekci() {
    if (!isFinite(P.x) || !isFinite(P.y) || !isFinite(P.vx) || !isFinite(P.vy)) {
      P.x = D.sapan.x; P.y = D.sapan.y; P.vx = P.vy = 0; P.aci = 0; tutuyor = false; tutId = null;
      G.sox = G.soy = G.svx = G.svy = 0; durumYap('bekle'); return;
    }
    const d = P.durum;
    if (d === 'ucus' && G.ucusT > 18) { // çok uzun uçuş: yere indir, yuvarlanmadan dön
      P.y = D.zemin + R_PIRIL; P.vy = 0; P.vx = 0; G.durdu = false; G.acele = true; G.iskaBekle = false;
      durumYap('yuvar'); iskaYap();
    } else if (d === 'yuvar' && G.durumT > 5) { G.donX0 = P.x; G.donY0 = P.y; P.vx = 0; durumYap('don'); }
    else if (d === 'don' && G.durumT > 3) { P.x = D.sapan.x; P.y = D.sapan.y; P.vx = P.vy = 0; G.acele = false; durumYap('bekle'); }
    else if (d === 'cek' && !tutuyor) salla('kisa');
    else if (d !== 'bekle' && d !== 'cek' && d !== 'ucus' && d !== 'yuvar' && d !== 'don' && d !== 'kavus') durumYap('bekle');
  }

  // ---------- sabit adımlı fizik (kare hızından bağımsız: 30/60/120 Hz ve hiz=N aynı yolu izler) ----------
  const TIK = 1 / 60;          // UCUS.dene'nin varsayılan adımıyla AYNI
  const TIK_EN = 24;           // bir karede en çok bu kadar adım (takılmada sarmal olmasın)
  let tikBirikim = 0;
  const IC = { x0: 0, y0: 0, a0: 0, d0: '', x: 0, y: 0, a: 0, aktif: false };
  // tek fizik adımı: oyun ve görünmez deneme (dene) aynı işlevi kullanır
  function fizikAdim(tik) {
    const fdt = zamanOlcek(tik);
    const n = Math.max(1, Math.ceil(fdt / (1 / 60) - 1e-9));
    for (let i = 0; i < n; i++) {
      fizik(fdt / n);
      if (P.durum === 'ucus' && G.otoKanatT.length && G.ucusT >= G.otoKanatT[0]) {
        G.otoKanatT.shift();
        kanatCirp();
      }
    }
    return fdt;
  }

  function adim(dt, cizme) {
    G.t += dt; G.kare++;
    bekci();
    cekKare(dt);
    tikBirikim += dt;
    let fdt = 0, say = 0;
    while (tikBirikim >= TIK - 1e-7) {
      tikBirikim -= TIK;
      if (++say > TIK_EN) { tikBirikim = 0; break; }
      IC.x0 = P.x; IC.y0 = P.y; IC.a0 = P.aci; IC.d0 = P.durum;
      if (G.durakT > 0) { G.durakT -= TIK; continue; } // bırakış duraklaması: zaman bir an durur (yol değişmez)
      fdt += fizikAdim(TIK);
    }
    if (tikBirikim < 0) tikBirikim = 0;
    if (OTO && (P.durum === 'bekle') && (G.otoT += dt) > 1.2) { G.otoT = 0; otoFirlat(); }
    const vdt = G.durakT > 0 ? dt * 0.02 : dt * G.zs; // süsler için akıcı zaman (120 Hz'de adımsız karelerde de oynar)
    // görüntü yumuşatma: son iki fizik adımı arasında ara konum (yalnız çizim için; fizik değerleri sonra geri konur)
    IC.aktif = say > 0 || IC.aktif;
    const ara = IC.aktif && IC.d0 === P.durum && P.durum !== 'cek' && P.durum !== 'bekle';
    IC.x = P.x; IC.y = P.y; IC.a = P.aci;
    if (ara) {
      const k = clamp(tikBirikim / TIK, 0, 1) - 1; // bir adım geriden, ara değerle
      P.x = IC.x + (IC.x - IC.x0) * k; P.y = IC.y + (IC.y - IC.y0) * k;
      let da = IC.a - IC.a0; if (da > Math.PI) da -= 2 * Math.PI; else if (da < -Math.PI) da += 2 * Math.PI;
      P.aci = IC.a + da * k;
    }
    try { ciz(dt, vdt, cizme); } finally { if (ara) { P.x = IC.x; P.y = IC.y; P.aci = IC.a; } }
  }
  function ciz(dt, fdt, cizme) {
    if (typeof dunyaGuncelle === 'function') guvenli('dunyaGuncelle', function () { dunyaGuncelle(fdt, G.t); });
    if (typeof dunyaSapan === 'function') guvenli('dunyaSapan', function () { dunyaSapan(P.x, P.y); });
    if (typeof pirilGuncelle === 'function') guvenli('pirilGuncelle', function () { pirilGuncelle(fdt, G.t); });
    if (typeof efektGuncelle === 'function') guvenli('efektGuncelle', function () { efektGuncelle(fdt, G.t); });
    if (yedek.aktif) yedekGuncelle(fdt, G.t);
    kameraGuncelle(dt);
    if (!cizme) renderer.render(scene, camera);
  }

  // ---------- test: gerçek girdi yolundan çek-bırak ----------
  function sahte(x, y) { return { target: null, pointerId: 777, clientX: x, clientY: y, preventDefault: function () {} }; }
  function cekBirak(dx, dy, sonucBekle, kanatSn) {
    // yol: dx bir dizi ise [[dx,dy],…] parmak yolu (titreme vb.), değilse düz çekiş
    let g = 0;
    if (P.durum === 'kavus') yeniden(true); // "bir daha" düğmesi gibi
    while (P.durum !== 'bekle' && g++ < 600) adim(1 / 60, true);
    for (let i = 0; i < 40 && (Math.abs(G.sox) + Math.abs(G.svx)) > 0.02; i++) adim(1 / 60, true);
    const yol = Array.isArray(dx) ? dx : null;
    const x0 = window.innerWidth * (0.2 + Math.random() * 0.4), y0 = window.innerHeight * (0.3 + Math.random() * 0.4);
    const deneme0 = G.deneme, iska0 = G.iska, yil0 = G.yildizSay;
    G.sonSonuc = '';
    basla(sahte(x0, y0)); adim(1 / 60, true);
    const adimlar = yol ? yol : (function () { const a = []; for (let i = 1; i <= 18; i++) { const k = i / 18; a.push([dx * k, dy * k]); } return a; })();
    for (let i = 0; i < adimlar.length; i++) { surukle(sahte(x0 + adimlar[i][0], y0 + adimlar[i][1])); adim(1 / 60, true); }
    for (let i = 0; i < 8; i++) adim(1 / 60, true); // bırakmadan önce kısa tutuş
    const cekBilgi = { guc: +CEK.guc.toFixed(2), vx: +C.vx.toFixed(2), vy: +C.vy.toFixed(2), seviye: G.seviye };
    const son = adimlar[adimlar.length - 1];
    birak(sahte(x0 + son[0], y0 + son[1]));
    if (!sonucBekle) return Object.assign({ cek: cekBilgi }, window.UCUS.bilgi());
    let t = 0, enX = P.x;
    // kanatSn: sayı ya da dizi (uçuş saatine göre dokunma anları, sn)
    const kanatlar = kanatSn == null ? [] : (Array.isArray(kanatSn) ? kanatSn.slice() : [kanatSn])
      .filter(function (q) { return isFinite(q); }).sort(function (a, b) { return a - b; });
    let kanatI = 0;
    while (t < 20) {
      adim(1 / 60, true); t += 1 / 60;
      if (P.durum === 'ucus') enX = Math.max(enX, P.x);
      while (kanatI < kanatlar.length && P.durum === 'ucus' && G.ucusT >= kanatlar[kanatI]) { kanatI++; basla(sahte(10, 10)); }
      if (G.sonSonuc && (G.sonSonuc === 'salla' || G.sonSonuc === 'kavus' || G.iska > iska0)) break;
    }
    return {
      sonuc: G.sonSonuc || (P.durum === 'kavus' ? 'kavus' : 'belirsiz'), x: +P.x.toFixed(2), enX: +enX.toFixed(2),
      yildiz: G.yildizSay - yil0, yildizToplam: G.yildizSay, deneme: G.deneme, sayildi: G.deneme > deneme0,
      iska: G.iska, yardim: yardimDuzey(), hedefR: +hedefR().toFixed(2), cek: cekBilgi
    };
  }

  window.UCUS = {
    durum: P.durum,
    ayar: A,
    bilgi: function () {
      const i = renderer.info.render;
      return {
        durum: P.durum, P: { x: +P.x.toFixed(2), y: +P.y.toFixed(2), vx: +P.vx.toFixed(2), vy: +P.vy.toFixed(2) },
        bolum: G.bolumIdx + 1, bolumIdx: G.bolumIdx, toplamBolum: bolumListesi().length,
        biyom: aktifBolum().biyom != null ? aktifBolum().biyom : null, hava: aktifBolum().hava || null,
        zeminTur: aktifBolum().zeminTur || null, kiyafet: aktifBolum().kiyafet || null, gece: !!aktifBolum().gece,
        kanatKalan: G.kanatKalan, kanatHak: aktifKanatHak(), suzT: +G.suzT.toFixed(2),
        yildiz: G.yildizSay, deneme: G.deneme, iska: G.iska, yardim: yardimDuzey(), hedefR: +hedefR().toFixed(2), gucEk: +G.gucEk.toFixed(2), ayna: G.ayna,
        sonSonuc: G.sonSonuc, zs: +G.zs.toFixed(2),
        cizim: i.calls, ucgen: i.triangles, fps: Math.round(G.fps), hazir: G.oyunHazir,
        modul: {
          dunya: typeof dunyaKur === 'function', piril: typeof pirilKur === 'function',
          efekt: typeof efektKur === 'function', ses: typeof SES !== 'undefined'
        }
      };
    },
    bolum: function (idx) { return bolumSec(idx); },
    bolumSec: function (no) { return bolumSec(Math.max(0, (no | 0) - 1)); },
    sonraki: function () {
      const l = bolumListesi();
      if (G.bolumIdx + 1 >= l.length) return null;
      return bolumSec(G.bolumIdx + 1);
    },
    sonrakiBolum: function () {
      const l = bolumListesi();
      if (G.bolumIdx + 1 >= l.length) return null;
      return bolumSec(G.bolumIdx + 1);
    },
    ekran: function (wx, wy) {
      if (typeof THREE === 'undefined' || !camera || !renderer) return null;
      const v = new THREE.Vector3(wx, wy, 0).project(camera);
      const r = renderer.domElement.getBoundingClientRect();
      return { x: r.left + (v.x * 0.5 + 0.5) * r.width, y: r.top + (-v.y * 0.5 + 0.5) * r.height };
    },
    bolumBilgi: bolumBilgi,
    bolumVeri: function (idx) { const l = bolumListesi(); return idx != null ? (l[clamp(idx | 0, 0, l.length - 1)] || null) : aktifBolum(); },
    // 2. tur yardımcıları: sayılar ve tek fizik işlevleri (p = {x,y,vx,vy}; p değişir ve döner)
    yardimciAyar: { baloncuk: BALONCUK, esinti: ESINTI },
    baloncukDegdi: baloncukDegdi, baloncukItis: baloncukItis,
    esintiIcinde: esintiIcinde, esintiIvme: esintiIvme,
    otoFirlat: otoFirlat,
    dene: dene,
    cocukDene: cocukDene, cocukOzet: cocukOzet,
    cekHiz: function (r, a, gucEk) { return cekHiz(r, a, gucEk); },
    otoAra: function (idx) { return otoArama(idx != null ? idx : G.bolumIdx); },
    firlat: function (vx, vy, kanatlar) { firlatIc(vx, vy, false); if (Array.isArray(kanatlar)) G.otoKanatT = kanatlar.slice().sort(function (a, b) { return a - b; }); },
    kare: function (dt, cizme) { adim(+dt || 1 / 60, cizme !== false); return this.bilgi(); }, // değişken kare süresi denemesi (1/30, 1/120…)
    sonInis: function () { return G.sonInis || null; },
    cekBirak: cekBirak,
    kanat: function () { basla(sahte(10, 10)); },
    yeniden: function () { yeniden(true); }, // "bir daha": bu bölümde alınmış yıldızlar kalır (5 tamamsa baştan)
    yenidenSifir: function () { yeniden(false); },
    adim: function (sn) { const n = Math.round(sn * 60); for (let i = 0; i < n; i++) adim(1 / 60, true); return this.bilgi(); }
  };

  if (document.readyState === 'complete') kur();
  else window.addEventListener('load', kur);
})();
