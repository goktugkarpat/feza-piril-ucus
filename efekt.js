// efekt.js — Pırıl'ın Uçuş Okulu: nişan (yol noktaları, iniş işareti, çekiş lastiği, önceki atışın izi), yıldızlar,
// uçuş izi, pırıltılar, konfeti, ateşböcekleri, karahindiba tohumları, ışık huzmeleri.
// Sahibi: EFEKT. Sağlar: efektKur(), efektGuncelle(dt, t). Kare başına yeni nesne yok; her şey önceden ayrılmış havuzlarda.
(function () {
  'use strict';
  var kuruldu = false;
  var ana = null;           // tüm efektlerin grubu
  var ADD, NOR, YOL;        // parçacık havuzları (parlak / normal / nişan)
  var yildizMesh = null, halkaMesh = null, izMesh = null, huzmeMesh = null;
  var _m4, _v3a, _v3b, _q, _s3, _e, _v2, _renk;
  var zaman = 0;

  // ---------- ortak değerler (oyun yoksa varsayılanlar) ----------
  var R_P = 0.7;            // Pırıl'ın çarpışma yarıçapı (oyun.js ile aynı)
  var _varsayilanHedef = { x: 46, y: 0 };
  var _varsayilanSapan = { x: 0, y: 3.2 };
  function yerY() { return (typeof D !== 'undefined' && D) ? D.zemin : 0; }
  function yc() { return (typeof YC !== 'undefined') ? YC : 16; }
  function hedef() { return (typeof D !== 'undefined' && D && D.hedef) ? D.hedef : _varsayilanHedef; }
  function sapan() { return (typeof D !== 'undefined' && D && D.sapan) ? D.sapan : _varsayilanSapan; }
  function pVar() { return (typeof P !== 'undefined' && P); }
  function durum() { return pVar() ? P.durum : ''; }

  // ---------- parçacık gölgelendiricisi ----------
  var VS = [
    'attribute vec3 renk; attribute float boy; attribute float alfa; attribute float tur; attribute float don;',
    'uniform float uOlcek;',
    'varying vec3 vC; varying float vA; varying float vK; varying float vR;',
    'void main(){ vC=renk; vA=alfa; vK=tur; vR=don;',
    ' vec4 mv = modelViewMatrix*vec4(position,1.0);',
    ' gl_Position = projectionMatrix*mv;',
    ' gl_PointSize = (alfa<=0.001) ? 0.0 : boy*uOlcek/max(0.1,-mv.z); }'
  ].join('\n');
  var FS = [
    'varying vec3 vC; varying float vA; varying float vK; varying float vR;',
    'float kalp(vec2 p){ p.x=abs(p.x);',
    ' if(p.y+p.x>1.0) return sqrt(dot(p-vec2(0.25,0.75),p-vec2(0.25,0.75)))-0.35355;',
    ' vec2 q=p-0.5*max(p.x+p.y,0.0); vec2 w=p-vec2(0.0,1.0);',
    ' return sqrt(min(dot(w,w),dot(q,q)))*sign(p.x-p.y); }',
    'void main(){',
    ' vec2 c=gl_PointCoord-0.5; c.y=-c.y;',
    ' float cs=cos(vR), sn=sin(vR); vec2 d=vec2(cs*c.x-sn*c.y, sn*c.x+cs*c.y);',
    ' float r=length(c); float a=0.0; vec3 col=vC;',
    ' if(vK<0.5){ a=exp(-r*r*26.0); }',                                         // 0 yumuşak parıltı
    ' else if(vK<1.5){ float x=abs(d.x), y=abs(d.y);',                           // 1 pırıltı yıldızı
    '   a=(max(exp(-x*38.0)*exp(-y*6.0), exp(-y*38.0)*exp(-x*6.0))+exp(-r*r*70.0))*smoothstep(0.5,0.34,r);',
    '   col=mix(col,vec3(1.0),exp(-r*r*140.0)); }',
    ' else if(vK<2.5){ a=smoothstep(0.5,0.16,r); col=mix(col*0.86,col,smoothstep(0.3,-0.2,c.y)); }', // 2 puf
    ' else if(vK<3.5){ a=step(abs(d.x),0.42)*step(abs(d.y),0.22); col=mix(col*0.85,vec3(1.0),0.45*pow(abs(sin(vR*2.0)),6.0)); }', // 3 konfeti
    ' else if(vK<4.5){ float k=kalp(vec2(d.x,d.y)*1.25+vec2(0.0,0.52)); a=smoothstep(0.03,-0.03,k);', // 4 kalp
    '   col=mix(col,vec3(1.0),0.55*smoothstep(0.11,0.0,length(d-vec2(-0.14,0.12)))); }',
    ' else if(vK<5.5){ float e=(d.x*d.x)/0.2304+(d.y*d.y)/0.0441; a=smoothstep(1.0,0.75,e); col=mix(col*0.9,col,d.y+0.5); }', // 5 yaprak/tüy
    ' else if(vK<6.5){',                                                         // 6 yol noktası (inci gibi parlak, mor-lacivert hâleli)
    '   float dis=smoothstep(0.45,0.33,r); float ic=smoothstep(0.31,0.19,r);',
    '   float hale=exp(-r*r*6.5)*0.65*smoothstep(0.50,0.30,r);',
    '   vec3 kenar=mix(vec3(0.22,0.13,0.46),col*0.55,0.18);',
    '   float par=smoothstep(0.28,0.0,length(c-vec2(-0.09,0.10)));',
    '   vec3 dol=mix(col,vec3(1.0),0.74*par+0.35*exp(-r*r*18.0));',
    '   col=mix(kenar,dol,ic); a=max(hale,dis*mix(0.94,1.0,ic)); }',
    ' else if(vK<7.5){ a=smoothstep(0.5,0.4,r); col=mix(col,vec3(1.0),0.3*pow(abs(sin(vR*2.0)),6.0)); col=mix(col,vec3(1.0),0.35*smoothstep(0.2,0.0,length(c-vec2(-0.12,0.12)))); }', // 7 benek
    ' else if(vK<8.5){ float h=d.y+0.5; a=step(abs(d.x),0.11*(1.0-h)+0.015)*step(0.0,h)*step(h,0.96); col=mix(col*0.75,col*1.15,h); }', // 8 çimen
    ' else if(vK<9.5){ vec2 q=vec2(c.x/0.48,(c.y+0.02)/0.17); float e=length(q);',  // 9 yerde yumuşak halka (elips)
    '   float hl=exp(-pow((e-0.74)*9.5,2.0)); float hale=exp(-pow((e-0.74)*3.6,2.0))*0.28;',
    '   float icH=exp(-pow((e-0.42)*11.0,2.0))*0.26; float merkez=exp(-e*e*14.0)*0.26;',
    '   float ol=exp(-pow((e-0.90)*16.0,2.0));',
    '   a=(1.48*hl+hale+icH+merkez+0.88*ol+0.12*smoothstep(0.76,0.0,e))*smoothstep(1.02,0.88,e);',
    '   col=mix(mix(col,vec3(1.0,0.99,0.90),0.34*hl*hl+0.26*icH+0.30*merkez),vec3(0.24,0.14,0.48),0.68*ol/(hl+ol+0.001)); }',
    ' else if(vK<10.5){ a=0.55*smoothstep(0.5,0.12,r)+0.45*smoothstep(0.16,0.08,r);',  // 10 karahindiba tüyü (yumuşak top)
    '   col=mix(col,vec3(1.0),smoothstep(0.3,0.0,length(c-vec2(-0.1,0.1)))); }',
    ' else if(vK<11.5){ a=exp(-abs(d.y)*34.0)*smoothstep(0.5,0.0,abs(d.x))*(0.35+d.x); }', // 11 hız çizgisi
    ' else { vec2 p=vec2(d.x,abs(d.y)); vec2 n=vec2(0.504,0.864);',          // 12 tombul ok ucu (yuvarlak köşeli üçgen)
    '   float sd=max(max(dot(vec2(p.x-0.27,p.y),n), -dot(vec2(p.x-0.03,p.y),n)), p.y-0.3)-0.055;',   // "›" biçimi: yönü belli olsun
    '   a=smoothstep(0.015,-0.015,sd); col=mix(col,vec3(0.52,0.34,0.88),smoothstep(-0.06,-0.035,sd));',
    '   col=mix(col,vec3(1.0),0.52*smoothstep(0.13,0.0,length(p-vec2(-0.04,0.0)))); }',
    ' a*=vA; if(a<0.01) discard;',
    ' gl_FragColor=vec4(col,min(a,1.0)); }'
  ].join('\n');

  function havuz(n, parlak, derinlik) {
    var g = new THREE.BufferGeometry();
    var H = {
      n: n, poz: new Float32Array(n * 3), renk: new Float32Array(n * 3), boy: new Float32Array(n),
      alfa: new Float32Array(n), tur: new Float32Array(n), don: new Float32Array(n),
      hiz: new Float32Array(n * 3), yas: new Float32Array(n), omur: new Float32Array(n),
      b0: new Float32Array(n), b1: new Float32Array(n), cek: new Float32Array(n), surt: new Float32Array(n),
      donh: new Float32Array(n), a0: new Float32Array(n), canli: new Uint8Array(n), bas: 0, imlec: 0
    };
    g.setAttribute('position', new THREE.BufferAttribute(H.poz, 3));
    g.setAttribute('renk', new THREE.BufferAttribute(H.renk, 3));
    g.setAttribute('boy', new THREE.BufferAttribute(H.boy, 1));
    g.setAttribute('alfa', new THREE.BufferAttribute(H.alfa, 1));
    g.setAttribute('tur', new THREE.BufferAttribute(H.tur, 1));
    g.setAttribute('don', new THREE.BufferAttribute(H.don, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
    var m = new THREE.ShaderMaterial({
      uniforms: { uOlcek: { value: 600 } }, vertexShader: VS, fragmentShader: FS,
      transparent: true, depthWrite: false, depthTest: derinlik,
      blending: parlak ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    H.geo = g; H.mat = m;
    H.obj = new THREE.Points(g, m); H.obj.frustumCulled = false;
    return H;
  }

  // yeni parçacık: döndürür indeks
  function yay(H, x, y, z, vx, vy, vz, omur, b0, b1, r, g, b, tur, cek, surt, a0) {
    var i = H.imlec; H.imlec++; if (H.imlec >= H.n) H.imlec = H.bas;
    var i3 = i * 3;
    H.poz[i3] = x; H.poz[i3 + 1] = y; H.poz[i3 + 2] = z;
    H.hiz[i3] = vx; H.hiz[i3 + 1] = vy; H.hiz[i3 + 2] = vz;
    H.renk[i3] = r; H.renk[i3 + 1] = g; H.renk[i3 + 2] = b;
    H.yas[i] = 0; H.omur[i] = omur; H.b0[i] = b0; H.b1[i] = b1; H.tur[i] = tur;
    H.cek[i] = cek; H.surt[i] = surt; H.a0[i] = a0; H.canli[i] = 1;
    H.don[i] = Math.random() * 6.283; H.donh[i] = 0; H.alfa[i] = 0; H.boy[i] = b0;
    return i;
  }

  function havuzGuncelle(H, dt, t) {
    var zy = yerY();
    for (var i = H.bas; i < H.n; i++) {
      if (!H.canli[i]) continue;
      var y = H.yas[i] + dt; H.yas[i] = y;
      var om = H.omur[i];
      if (y >= om) { H.canli[i] = 0; H.alfa[i] = 0; continue; }
      var i3 = i * 3, s = Math.max(0, 1 - H.surt[i] * dt), tr = H.tur[i];
      H.hiz[i3 + 1] -= H.cek[i] * dt;
      if (tr === 3 || tr === 5) { H.hiz[i3] += Math.sin(t * 4.2 + i * 1.7) * dt * 4.0; } // konfeti/yaprak savrulur
      else if (tr === 4) { H.hiz[i3] += Math.sin(t * 2.4 + i * 1.9) * dt * 0.45; }        // kalpler yumuşakça süzülür
      H.hiz[i3] *= s; H.hiz[i3 + 1] *= s; H.hiz[i3 + 2] *= s;
      H.poz[i3] += H.hiz[i3] * dt; H.poz[i3 + 1] += H.hiz[i3 + 1] * dt; H.poz[i3 + 2] += H.hiz[i3 + 2] * dt;
      if ((tr === 3 || tr === 5) && H.poz[i3 + 1] < zy + 0.05) { H.poz[i3 + 1] = zy + 0.05; H.hiz[i3] = 0; H.hiz[i3 + 1] = 0; }
      H.don[i] += H.donh[i] * dt;
      var f = y / om;
      var gir = Math.min(1, y / 0.06);
      gir = gir * gir * (3 - 2 * gir);
      var cik = f < 0.55 ? 1 : (1 - f) / 0.45;
      cik = cik * cik * (3 - 2 * cik);
      H.alfa[i] = H.a0[i] * gir * cik;
      H.boy[i] = H.b0[i] + (H.b1[i] - H.b0[i]) * f;
    }
  }
  function havuzYukle(H) {
    var a = H.geo.attributes;
    a.position.needsUpdate = true; a.renk.needsUpdate = true; a.boy.needsUpdate = true;
    a.alfa.needsUpdate = true; a.tur.needsUpdate = true; a.don.needsUpdate = true;
  }

  // =====================================================================
  // NİŞAN: yol noktaları + iniş işareti + önceki atışın izi (hepsi YOL havuzunda, tek çizim)
  // =====================================================================
  var YOL_N = 22;                   // akan noktalar (seyrek, zarif ve yere kadar)
  var I_INIS = YOL_N, I_INIS_Y = YOL_N + 1;          // iniş halkası + iniş yıldızcığı
  var ONC_N = 60, I_ONC = YOL_N + 2;                 // önceki atışın noktaları
  var I_ONC_INIS = I_ONC + ONC_N;                    // önceki atışın iniş yeri (soluk halka)
  var OK_N = 3, I_OK = I_ONC_INIS + 1;                // çekiş oku: salıncaktan fırlama yönüne 3 tombul "›"
  var INIS_KIV_N = 5, I_INIS_KIV = I_OK + OK_N;       // iniş halkası üstünde altın-yeşil dönen kıvılcımlar
  var YOL_TOP = I_INIS_KIV + INIS_KIV_N;
  var yolGorunur = 0, yolHedef = 0, inisPirTimer = 0;
  var yolX = 0, yolY = 0, yolVx = 0, yolVy = 0, yolGuc = 0, yolGucG = 0, yolKf = 1;
  function yolGuncelle(dt, t) {
    var cekiliyor = durum() === 'cek';
    if (!cekiliyor) { yolHedef = 0; if (yolGorunur <= 0) kademe = 0; }
    if (yolGorunur < yolHedef) yolGorunur = Math.min(yolHedef, yolGorunur + dt / 0.12);
    else yolGorunur = Math.max(yolHedef, yolGorunur - dt / (durum() === 'ucus' ? 0.14 : 0.25));
    yolGucG += (yolGuc - yolGucG) * Math.min(1, dt * 12);   // güç yumuşak izlenir
    var gu = yolGucG;
    var g = yc(), zy = yerY();
    // kamera uzaklaşınca (bütün parkuru gösterirken) noktalar ekranda küçülmesin: iri ve okunaklı kalsın
    var kamZ = (typeof camera !== 'undefined' && camera) ? Math.abs(camera.position.z) : 30;
    var kf = Math.max(1, Math.min(2.7, Math.pow(kamZ / 34, 0.78)));
    yolKf = kf;
    // güç kademesi: az → krem-altın; orta → sıcak altın; tam → parlak altın, nabız atar
    var kd = kademe > 0 ? kademe : (gu < 0.5 ? 1 : gu < 0.88 ? 2 : 3);
    kademeG += (kd - kademeG) * Math.min(1, dt * 10);
    kademePop = Math.max(0, kademePop - dt * 3);
    var kk = (kademeG - 1) / 2;                       // 0 hafif, 0,5 orta, 1 tam
    var tam = kd === 3 ? 1 : 0;
    var nabiz = tam ? 0.5 + 0.5 * Math.sin(t * 10.0) : 0;
    var cR = 1.0, cG = 0.94 - 0.08 * kk, cB = 0.62 - 0.24 * kk;    // her kademede parlak krem-altın; tam güçte daha sıcak altın
    var ph = (t * 2.2) % 1;
    var vh = Math.sqrt(yolVx * yolVx + yolVy * yolVy) || 1;
    // çekiş oku: Pırıl'ın önünden fırlama yönüne; ok ucu sayısı = güç kademesi (1, 2, 3)
    var okN = Math.max(0, Math.min(OK_N, kd));
    var okAng = Math.atan2(yolVy, yolVx), okx = yolVx / vh, oky = yolVy / vh;
    var s0 = Math.max(0.16, (1.6 + 0.62 * okN + 0.15) / vh);   // ilk nokta okların ötesinde
    for (var q = 0; q < OK_N; q++) {
      var io = I_OK + q, o3 = io * 3, uq = 1.6 + 0.62 * q;
      var dalga = 0.5 + 0.5 * Math.sin(t * 8.0 - q * 1.6);
      YOL.poz[o3] = yolX + okx * uq; YOL.poz[o3 + 1] = yolY + oky * uq; YOL.poz[o3 + 2] = 0.7;
      YOL.boy[io] = (0.68 + 0.28 * gu + 0.18 * kademePop) * (0.94 + 0.1 * dalga);
      YOL.don[io] = -okAng;
      YOL.alfa[io] = (q < okN && yolVx !== 0) ? yolGorunur * (0.88 + 0.12 * dalga) : 0;
      YOL.renk[o3] = 1.0; YOL.renk[o3 + 1] = 0.984 - 0.08 * kk; YOL.renk[o3 + 2] = 0.92 - 0.42 * kk;
    }
    // yere değme anı: y(s) = R_P (Pırıl'ın merkezi yere değdiğinde)
    var hy = zy + R_P, a_ = 0.5 * g, b_ = -yolVy, c_ = hy - yolY;
    var disk = b_ * b_ - 4 * a_ * c_;
    var sInis = disk >= 0 ? (-b_ + Math.sqrt(disk)) / (2 * a_) : 99;
    var gecerliInis = sInis > 0.18 && sInis < 7.5;
    // iniş işareti ve hedefe yakınlık: tüm geçerli çekişlerde (yüksek açılarda da) net görünür
    var ia = 0;
    if (gecerliInis) {
      var iaBas = Math.min(1, (sInis - 0.18) / 0.17);
      var iaSon = sInis <= 6.8 ? 1 : Math.max(0, (7.5 - sInis) / 0.7);
      ia = iaBas * iaSon;
    }
    var ix = yolX + yolVx * sInis;
    var dxHedef = Math.abs(ix - hedef().x);
    var hyak = gecerliInis ? Math.max(0, Math.min(1, 1 - dxHedef / 7.5)) : 0;
    hyak = hyak * hyak * (3 - 2 * hyak);
    // noktalar salıncaktan yere/iniş yuvarlağına kadar tam uçuş yolu boyunca akar
    var sSon = gecerliInis ? Math.max(s0 + 0.35, sInis) : (s0 + 0.55 + 1.25 * gu);
    var yaySure = Math.max(0.35, sSon - s0);
    var ar = yaySure / YOL_N;
    for (var k = 0; k < YOL_N; k++) {
      var s = s0 + (k + ph) * ar;
      var x = yolX + yolVx * s, y = yolY + yolVy * s - 0.5 * g * s * s;
      var u = Math.max(0, Math.min(1, (s - s0) / yaySure));   // 0..1 tüm uçuş yolu boyunca
      var ucU = u > 0.85 ? (u - 0.85) / 0.15 : 0;
      var ucE = ucU * ucU * (3 - 2 * ucU);
      var px_ = x, py_ = Math.max(y, zy + 0.08);
      if (gecerliInis && ucE > 0) {
        px_ += (ix - px_) * (ucE * 0.35);
        py_ += ((zy + 0.10) - py_) * (ucE * 0.72);
      }
      var k3 = k * 3;
      YOL.poz[k3] = px_; YOL.poz[k3 + 1] = py_; YOL.poz[k3 + 2] = 0.6;
      var akis = 0.5 + 0.5 * Math.sin(t * 7.5 - k * 0.55);
      var bas = Math.min(1, (k + ph) / 0.35);                  // ilk nokta hızla doğar; yakınlar tam opak
      var son = Math.max(0, Math.min(1, (1 - u) / (gecerliInis ? 0.045 : 0.25))); // sadece yere son 1-2 noktada yumuşakça sıfırlanır
      var yerde = s > sInis + 0.02 ? 0 : Math.min(1, (sInis + 0.02 - s) / 0.05);
      var boyEgri = (0.78 + 1.24 * u * (1 - u) - 0.16 * u) * (1 - 0.28 * ucE); // uçta (u>0.85) ~0.72'ye incelerek iniş merkezine bağlanır
      var hedefPay = u * u * hyak;                             // hedefe yakınsa yolun sonu altın-yeşile çalar
      YOL.boy[k] = (0.50 + 0.16 * gu + 0.12 * kk) * boyEgri * (0.94 + 0.14 * akis + 0.12 * nabiz + 0.24 * kademePop) * kf;
      YOL.alfa[k] = yolGorunur * (0.86 + 0.10 * kk) * bas * son * yerde;
      YOL.renk[k3] = cR - 0.34 * hedefPay;
      YOL.renk[k3 + 1] = Math.min(1, cG + 0.06 * akis + 0.06 * nabiz + 0.08 * hedefPay);
      YOL.renk[k3 + 2] = Math.min(1, cB + 0.20 * akis + 0.26 * nabiz + 0.24 * hedefPay);
    }
    EFEKT.inis.x = ix; EFEKT.inis.s = sInis; EFEKT.inis.gorunur = yolGorunur * ia; EFEKT.inis.hedefYakin = hyak;
    var inisNabiz = Math.sin(t * (2.8 + 4.4 * hyak));
    var sicakPar = hyak > 0.7 ? (hyak - 0.7) / 0.3 : 0;
    sicakPar = sicakPar * sicakPar * (3 - 2 * sicakPar);
    var parilti = 0.5 + 0.5 * Math.sin(t * 6.8);
    var i3 = I_INIS * 3;
    YOL.poz[i3] = ix; YOL.poz[i3 + 1] = zy + 0.08; YOL.poz[i3 + 2] = 0.8;
    YOL.boy[I_INIS] = (2.85 + 0.70 * hyak) * (0.35 + 0.65 * kf) * (1.0 + (0.07 + 0.04 * hyak) * inisNabiz) * (1.0 + 0.08 * sicakPar * parilti);
    YOL.alfa[I_INIS] = Math.min(1, yolGorunur * ia * (0.94 + 0.06 * inisNabiz + 0.05 * sicakPar * parilti));
    YOL.renk[i3] = Math.min(1, 1.0 - 0.48 * hyak + sicakPar * (0.20 + 0.10 * parilti));
    YOL.renk[i3 + 1] = Math.min(1, 0.82 + 0.18 * hyak);
    YOL.renk[i3 + 2] = Math.max(0.18, 0.18 + 0.34 * hyak - 0.16 * sicakPar);
    var j3 = I_INIS_Y * 3;
    YOL.poz[j3] = ix; YOL.poz[j3 + 1] = zy + (0.44 + 0.10 * Math.sin(t * 3.8)) * kf; YOL.poz[j3 + 2] = 0.85;
    YOL.boy[I_INIS_Y] = (1.18 + 0.48 * hyak) * kf * (0.94 + 0.12 * Math.sin(t * 5.2)) * (1.0 + 0.14 * sicakPar * (0.5 + 0.5 * Math.sin(t * 8.4)));
    YOL.don[I_INIS_Y] = t * (1.1 + 1.4 * hyak);
    YOL.alfa[I_INIS_Y] = Math.min(1, yolGorunur * ia * (0.95 + 0.05 * Math.sin(t * 5.2) + 0.04 * sicakPar));
    YOL.renk[j3] = Math.min(1, 1.0 - 0.28 * hyak + sicakPar * (0.14 + 0.10 * parilti));
    YOL.renk[j3 + 1] = Math.min(1, 0.95 + 0.05 * hyak);
    YOL.renk[j3 + 2] = Math.max(0.38, 0.58 + 0.22 * hyak - 0.24 * sicakPar);
    // hedefe yakın nişan alırken iniş halkasının üstünde zarif altın-yeşil dönen kıvılcımlar
    var kivGor = (yolGorunur * ia > 0.01 && hyak > 0.2) ? Math.max(0, Math.min(1, (hyak - 0.2) / 0.55)) * yolGorunur * ia : 0;
    for (var m = 0; m < INIS_KIV_N; m++) {
      var km = I_INIS_KIV + m, km3 = km * 3;
      if (kivGor > 0.01) {
        var angK = t * (2.4 + 1.8 * hyak) + m * (6.28318 / INIS_KIV_N);
        var radK = (0.72 + 0.26 * hyak) * (0.86 + 0.14 * Math.sin(t * 3.1 + m * 1.9)) * (0.35 + 0.65 * kf);
        var yukK = 0.26 + 0.34 * (0.5 + 0.5 * Math.sin(t * 2.8 + m * 1.4)) + 0.14 * Math.sin(angK);
        var parK = 0.5 + 0.5 * Math.sin(t * 7.5 + m * 2.3);
        var yesilPay = 0.5 + 0.5 * Math.sin(t * 2.2 + m * 1.256);
        YOL.poz[km3] = ix + Math.cos(angK) * radK;
        YOL.poz[km3 + 1] = zy + yukK;
        YOL.poz[km3 + 2] = 0.88 + Math.sin(angK) * 0.08;
        YOL.boy[km] = (0.34 + 0.22 * hyak) * (0.65 + 0.55 * parK) * kivGor * kf;
        YOL.don[km] = t * (2.6 + 1.4 * hyak) + m * 0.8;
        YOL.alfa[km] = kivGor * (0.48 + 0.48 * parK);
        YOL.renk[km3] = 0.98 - (0.42 + 0.22 * yesilPay) * hyak;
        YOL.renk[km3 + 1] = 0.90 + 0.10 * hyak;
        YOL.renk[km3 + 2] = 0.36 + (0.24 + 0.18 * yesilPay) * hyak;
      } else {
        YOL.alfa[km] = 0;
      }
    }
    if (yolGorunur * ia > 0.45 && hyak > 0.45 && ADD) {
      inisPirTimer += dt;
      if (inisPirTimer > 0.12 - 0.05 * hyak) {
        inisPirTimer = 0;
        var angI = Math.random() * 6.283;
        var ip = yay(ADD, ix + Math.cos(angI) * 0.72, zy + 0.2, 0.75,
          -Math.sin(angI) * 0.55 + Math.cos(angI) * 0.2, 0.85 + Math.random() * 0.65, 0,
          0.58, 0.36, 0.05, 1 - (0.38 + 0.18 * Math.random()) * hyak, 0.97, 0.48 + 0.24 * hyak, 1, -0.3, 0.65, 0.92);
        ADD.donh[ip] = 3.2;
      }
    } else {
      inisPirTimer = 0;
    }
  }

  // önceki atışın izi: uçuş boyunca 0,12 sn'de bir konum; bir sonraki atışa kadar soluk kalır
  // (oyun izKaydet yayarsa onun noktaları kullanılır; yoksa kendimiz 0,12 sn'de bir örnekleriz)
  var oncX = new Float32Array(ONC_N), oncY = new Float32Array(ONC_N), oncSay = 0, oncG = 0;
  var kayX = new Float32Array(ONC_N), kayY = new Float32Array(ONC_N), kaySay = 0, kaySure = 0, kayOnceki = '', izOlayVar = false;
  function oncYaz(n, xs, ys, dizi) {        // en az 0,7 m aralıkla seyrelt
    oncSay = 0; var sx = -1e9, sy = -1e9;
    for (var k = 0; k < n && oncSay < ONC_N; k++) {
      var x = dizi ? dizi[k][0] : xs[k], y = dizi ? dizi[k][1] : ys[k];
      if (!(isFinite(x) && isFinite(y))) continue;
      if ((x - sx) * (x - sx) + (y - sy) * (y - sy) < 0.49 && k < n - 1) continue;
      oncX[oncSay] = x; oncY[oncSay] = y; oncSay++; sx = x; sy = y;
    }
  }
  function onIzKaydet(v) {
    if (!v || !v.noktalar || !v.noktalar.length) return;
    izOlayVar = true; oncYaz(v.noktalar.length, null, null, v.noktalar);
  }
  function oncekiGuncelle(dt, t) {
    var d = durum();
    if (d === 'ucus') {
      kaySure += dt;
      if (kaySure >= 0.12 && kaySay < ONC_N) { kaySure -= 0.12; kayX[kaySay] = P.x; kayY[kaySay] = P.y; kaySay++; }
    } else if (kayOnceki === 'ucus' && !izOlayVar && kaySay > 2) {
      kayX[kaySay < ONC_N ? kaySay : ONC_N - 1] = P.x; kayY[kaySay < ONC_N ? kaySay : ONC_N - 1] = P.y; if (kaySay < ONC_N) kaySay++;
      oncYaz(kaySay, kayX, kayY, null);
    }
    kayOnceki = d;
    // bir sonraki atış boyunca da kalır (uçarken ve yeni nişan alırken daha soluk)
    var hedefG = (oncSay > 2 && d !== 'kavus' && d !== 'yuvar') ? (d === 'ucus' ? 0.6 : 1) : 0;
    oncG += (hedefG - oncG) * Math.min(1, dt * (hedefG ? 2.5 : 6));
    var nisanSoluk = 1 - 0.45 * yolGorunur;
    var px_ = pVar() ? P.x : sapan().x, py_ = pVar() ? P.y : sapan().y;
    for (var k = 0; k < ONC_N; k++) {
      var i = I_ONC + k, i3 = i * 3;
      if (k < oncSay) {
        YOL.poz[i3] = oncX[k]; YOL.poz[i3 + 1] = oncY[k]; YOL.poz[i3 + 2] = -0.2;
        // salıncağın çok yakınındaki ilk noktalar Pırıl'ın üstüne binmesin
        var yak = Math.hypot(oncX[k] - px_, oncY[k] - py_);
        YOL.alfa[i] = oncG * 0.36 * nisanSoluk * Math.min(1, Math.max(0, (yak - 1.2) / 1.0));
        YOL.boy[i] = 0.21;
      } else YOL.alfa[i] = 0;
    }
    // önceki inişin yeri: son nokta (yere yakınsa) soluk halka
    var o3 = I_ONC_INIS * 3;
    if (oncSay > 2 && oncY[oncSay - 1] < yerY() + 1.6) {
      YOL.poz[o3] = oncX[oncSay - 1]; YOL.poz[o3 + 1] = yerY() + 0.06; YOL.poz[o3 + 2] = 0.7;
      YOL.alfa[I_ONC_INIS] = oncG * 0.34 * nisanSoluk; YOL.boy[I_ONC_INIS] = 1.35;
    } else YOL.alfa[I_ONC_INIS] = 0;
  }

  // =====================================================================
  // YILDIZLAR (pahlı 3B, InstancedMesh: 5 yerinde + 5 uçan)
  // =====================================================================
  var YN = 5;
  var yX = new Float32Array(YN), yY = new Float32Array(YN);
  var yDurum = new Float32Array(YN);   // 1 = asılı, 0 = alındı
  var yOlcek = new Float32Array(YN);   // görünen ölçek
  var yGecik = new Float32Array(YN);   // geri gelme gecikmesi
  var yYak = new Float32Array(YN);     // Pırıl'a yakınlık (0..1, yumuşak)
  var uAkt = new Float32Array(YN), uSx = new Float32Array(YN), uSy = new Float32Array(YN), uT = new Float32Array(YN), uIzTimer = new Float32Array(YN);
  var yIsiltiSay = 0;

  function yildizGeo() {
    var sh = new THREE.Shape(), dis = 0.78, ic = 0.44;
    for (var i = 0; i < 10; i++) {
      var a = Math.PI / 2 + i * Math.PI / 5, r = (i % 2) ? ic : dis;
      if (i === 0) sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); else sh.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    sh.closePath();
    var g = new THREE.ExtrudeGeometry(sh, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.1, bevelSegments: 3, curveSegments: 4 });
    g.translate(0, 0, -0.08); g.scale(0.85, 0.85, 0.85); g.computeVertexNormals();
    return g;
  }
  var aktifBolum = null, geceMod = false, yAktifSay = YN;
  function yildizYerleri() {
    var yer = (aktifBolum && aktifBolum.yildizYer && aktifBolum.yildizYer.length) ? aktifBolum.yildizYer
      : (typeof DUNYA !== 'undefined' && DUNYA && DUNYA.yildizYer && DUNYA.yildizYer.length) ? DUNYA.yildizYer
      : [[8, 9], [15, 13], [24, 13.5], [33, 13], [40, 8]];
    yAktifSay = Math.min(YN, yer.length);
    for (var i = 0; i < YN; i++) {
      if (i < yAktifSay && yer[i]) { yX[i] = yer[i][0]; yY[i] = yer[i][1]; }
      else { yDurum[i] = 0; yOlcek[i] = 0; }
    }
  }
  // ekrandaki sayaç yeri (üst) → z=0 düzleminde dünya noktası
  var sayacNx = new Float32Array(YN), sayacNy = new Float32Array(YN);
  function sayacOlc(i, toplam) {
    sayacNx[i] = (((toplam || 1) - 3) * 0.11); sayacNy[i] = 0.84;
    try {
      var el = document.querySelectorAll('#sayac i'), k = Math.max(0, Math.min(4, (toplam || 1) - 1));
      if (el && el[k] && typeof renderer !== 'undefined') {
        var r = el[k].getBoundingClientRect(), c = renderer.domElement.getBoundingClientRect();
        if (r.width > 0 && c.width > 0) {
          sayacNx[i] = ((r.left + r.width / 2 - c.left) / c.width) * 2 - 1;
          sayacNy[i] = -((r.top + r.height / 2 - c.top) / c.height) * 2 + 1;
        }
      }
    } catch (e) { }
  }
  function sayacYeri(out, i) {
    if (typeof camera === 'undefined' || !camera) { out.set(0, 10, 0); return; }
    _v3a.set(sayacNx[i], sayacNy[i], 0.5).unproject(camera);
    _v3a.sub(camera.position);
    var s = -camera.position.z / (_v3a.z || -1e-4);
    out.copy(camera.position).addScaledVector(_v3a, s);
  }
  // tahmin yayı bir yıldızın üstünden geçiyorsa (bu atış onu alır) o yıldız parlar, büyür ve sırayla nabız atar
  var yYol = new Float32Array(YN), yYolS = new Float32Array(YN), yYolPirT = 0;
  function yildizYolOlc(dt) {
    var gor = yolGorunur > 0.05 && (yolVx !== 0 || yolVy !== 0);
    var g = yc(), sSon = (EFEKT.inis.s > 0 && EFEKT.inis.s < 7.5) ? EFEKT.inis.s : 4.0;
    for (var i = 0; i < YN; i++) {
      var hedefY = 0;
      if (gor && yDurum[i] > 0) {
        var enK = 1e9, enS = 0;
        for (var k = 0; k <= 56; k++) {
          var s = sSon * k / 56;
          var dx = yolX + yolVx * s - yX[i], dy = yolY + yolVy * s - 0.5 * g * s * s - yY[i];
          var d2 = dx * dx + dy * dy;
          if (d2 < enK) { enK = d2; enS = s; }
        }
        var d = Math.sqrt(enK);
        hedefY = d < 1.7 ? 1 : Math.max(0, 1 - (d - 1.7) / 0.9);
        yYolS[i] = enS;
      }
      yYol[i] += (hedefY - yYol[i]) * Math.min(1, dt * (hedefY > yYol[i] ? 14 : 8));
    }
  }
  function yildizGuncelle(dt, t) {
    var bekleyen = false, uc = durum() === 'ucus', kam = (typeof camera !== 'undefined' && camera);
    yildizYolOlc(dt);
    yYolPirT += dt;
    var yolPir = yYolPirT > 0.16; if (yolPir) yYolPirT = 0;
    for (var i = 0; i < YN; i++) {
      var hedefO = yDurum[i];
      if (hedefO > 0 && yGecik[i] > 0) { yGecik[i] -= dt; hedefO = 0; }
      if (hedefO > yOlcek[i]) yOlcek[i] = Math.min(1.12, yOlcek[i] + dt * 2.6);
      else yOlcek[i] = Math.max(hedefO, yOlcek[i] - dt * 7.0);
      if (hedefO >= 1 && yOlcek[i] > 1) yOlcek[i] = Math.max(1, yOlcek[i] - dt * 0.4);
      // Pırıl yaklaşınca yıldız ona doğru hafifçe uzanır ve parlar
      var dxp = 0, dyp = 0, yak = 0;
      if (uc && yDurum[i] > 0) {
        dxp = P.x - yX[i]; dyp = P.y - yY[i];
        var dd = Math.sqrt(dxp * dxp + dyp * dyp) || 1;
        yak = Math.max(0, 1 - dd / 5.5); yak *= yak;
        dxp /= dd; dyp /= dd;
      }
      yYak[i] += (yak - yYak[i]) * Math.min(1, dt * 8);
      var yk = yYak[i], yo = yYol[i];
      // sırayla nabız: yıldızlar 1→5 dizilişinde dalga gibi kısaca kabarır (yol gibi)
      var sira = Math.max(0, Math.sin(t * 2.2 - i * 0.75)); sira = sira * sira * sira * sira;
      // yayın üstündeki yıldızlar: uçuş sırasına göre (yaya yakınlık zamanı) peş peşe "pıt pıt" nabız
      var yolNab = Math.max(0, Math.sin(t * 7.0 - yYolS[i] * 5.0)); yolNab = yolNab * yolNab;
      var nefes = 1 + 0.06 * Math.sin(t * 2.6 + i * 1.3) + 0.10 * sira + 0.16 * yk + yo * (0.24 + 0.14 * yolNab);
      var o = yOlcek[i] * nefes;
      var bx = yX[i] + dxp * 0.45 * yk, by = yY[i] + Math.sin(t * 1.8 + i * 2.1) * 0.14 + dyp * 0.45 * yk;
      // yıldız hiç tam yandan görünmesin (ince çubuk gibi durmasın): dönüş yerine ±50° salınım
      _e.set(Math.sin(t * 0.9 + i) * 0.16, Math.sin(t * (1.3 + 3.2 * yo) + i * 1.25) * 0.6, Math.sin(t * 1.1 + i * 0.6) * 0.16 + Math.sin(t * 14) * 0.14 * yk);
      if (yolPir && yo > 0.6 && yOlcek[i] > 0.5) {     // yayın üstündeki yıldızdan minik pırıltı
        var ap = Math.random() * 6.283, rp = 0.75 * yolKf;
        var pp = yay(ADD, yX[i] + Math.cos(ap) * rp, yY[i] + Math.sin(ap) * rp, 0.4, Math.cos(ap) * 1.2, Math.sin(ap) * 1.2 + 0.4, 0,
          0.5, 0.42 * yolKf, 0.05, 1, 0.95, 0.62, 1, 0, 2.0, 0.95);
        ADD.donh[pp] = 3.0;
      }
      _q.setFromEuler(_e); _v3b.set(bx, by, 0); _s3.set(o, o, o);
      _m4.compose(_v3b, _q, _s3); yildizMesh.setMatrixAt(i, _m4);
      // hâle: yumuşak nabız; ekranın üst kenarına yakınsa kısılır (sayaçla üst üste görünmesin)
      var ust = 1;
      if (kam) {
        _v3a.set(bx, by, 0).project(camera);
        if (_v3a.y > 0.55) ust = Math.max(0.2, 1 - (_v3a.y - 0.55) / 0.3);
      }
      var h3 = (40 + i) * 3;
      ADD.poz[h3] = bx; ADD.poz[h3 + 1] = by; ADD.poz[h3 + 2] = -0.25;
      var nab = 0.5 + 0.5 * Math.sin(t * 2.8 + i * 1.3);
      var par = 0.5 + 0.5 * Math.sin(t * 6.4 + i * 2.7);
      ADD.boy[40 + i] = (2.9 + 0.72 * nab + 0.28 * par + 1.35 * yk + 0.8 * sira + yo * (1.6 + 0.9 * yolNab) * yolKf) * Math.max(0.001, yOlcek[i]) * (0.65 + 0.35 * ust);
      ADD.alfa[40 + i] = yOlcek[i] > 0.02 ? Math.min(0.95, (0.38 + 0.18 * nab + 0.08 * par + 0.34 * yk + 0.12 * sira + 0.34 * yo) * Math.min(1, yOlcek[i]) * ust) : 0;
      if (yOlcek[i] > 0.5) bekleyen = true;
      // uçan sayaç yıldızı
      var j = YN + i;
      if (uAkt[i] > 0) {
        uT[i] += dt / 0.64;
        if (uT[i] >= 1) {
          uAkt[i] = 0; uIzTimer[i] = 0;
          sayacYeri(_v3b, i);
          yay(ADD, _v3b.x, _v3b.y, 0.65, 0, 0, 0, 0.40, 1.25, 2.15, 1, 0.93, 0.48, 0, 0, 0, 0.68);
          patlat(_v3b.x, _v3b.y, 8, 3.6, 0.46, 1, 0.93, 0.5, 1);
          halka(_v3b.x, _v3b.y, 0.28, 1.75, 0.40, 1, 0.94, 0.52);
          _s3.set(0, 0, 0); _m4.compose(_v3b, _q, _s3);
        } else {
          sayacYeri(_v3b, i);
          var f = uT[i], e = f * f * (3 - 2 * f);
          var x = uSx[i] + (_v3b.x - uSx[i]) * e, y = uSy[i] + (_v3b.y - uSy[i]) * e + Math.sin(f * Math.PI) * 2.2;
          _v3b.set(x, y, 0.8); var so = 1.02 * (1 - 0.55 * f) + 0.14 * Math.sin(f * Math.PI);
          _e.set(0, 0, f * 10.0); _q.setFromEuler(_e); _s3.set(so, so, so);
          _m4.compose(_v3b, _q, _s3);
          // parlak altın çekirdek izi + seyreltilmiş parıltı kıvılcımı
          uIzTimer[i] += dt;
          if (uIzTimer[i] >= 0.032) {
            uIzTimer[i] -= 0.032;
            yay(ADD, x, y, 0.66, 0, 0, 0, 0.34, 0.68, 0.10, 1.0, 0.94, 0.55, 0, 0, 0.4, 0.85);
            var pIz = yay(ADD, x + (Math.random() - 0.5) * 0.22, y + (Math.random() - 0.5) * 0.22, 0.72,
              (Math.random() - 0.5) * 0.7, (Math.random() - 0.5) * 0.7, 0, 0.46, 0.50, 0.08, 1.0, 0.92, 0.48, 1, 0, 1.1, 0.92);
            ADD.donh[pIz] = 5.5;
          }
        }
        yildizMesh.setMatrixAt(j, _m4);
      }
    }
    yildizMesh.instanceMatrix.needsUpdate = true;
    // asılı yıldızların çevresinde dönen/parlayan küçük pırıltılar
    yIsiltiSay += dt;
    if (bekleyen && yIsiltiSay > 0.055 && yAktifSay > 0) {
      yIsiltiSay = 0;
      var k = (Math.random() * yAktifSay) | 0;
      if (yOlcek[k] > 0.5) {
        var a = Math.random() * 6.283, rr = 0.48 + Math.random() * 0.65;
        var ii = yay(ADD, yX[k] + Math.cos(a) * rr, yY[k] + Math.sin(a) * rr, 0.3,
          -Math.sin(a) * 0.42, 0.28 + Math.cos(a) * 0.22, 0, 0.82, 0.44 + Math.random() * 0.12, 0.05,
          1, 0.94, 0.56, 1, 0, 0.55, 0.96);
        ADD.donh[ii] = (k % 2 ? -1 : 1) * 2.8;
        if (Math.random() < 0.45 + 0.4 * yYak[k]) {
          var a2 = a + 2.4 + Math.random() * 1.4, r2 = 0.36 + Math.random() * 0.5;
          yay(ADD, yX[k] + Math.cos(a2) * r2, yY[k] + Math.sin(a2) * r2, 0.26,
            (Math.random() - 0.5) * 0.22, 0.35 + Math.random() * 0.35, 0, 0.92, 0.28, 0.04,
            1, 0.97, 0.72, 0, 0, 0.4, 0.72);
        }
      }
    }
  }

  // ---------- HALKALAR (InstancedMesh; gecikmeli ve yatık olabilir) ----------
  var HN = 24, hX = new Float32Array(HN), hY = new Float32Array(HN), hYas = new Float32Array(HN), hOmur = new Float32Array(HN),
    hR0 = new Float32Array(HN), hR1 = new Float32Array(HN), hCr = new Float32Array(HN), hCg = new Float32Array(HN), hCb = new Float32Array(HN),
    hGec = new Float32Array(HN), hEg = new Float32Array(HN), hImlec = 0;
  function halka(x, y, r0, r1, omur, r, g, b, gecik, egim) {
    var i = hImlec; hImlec = (hImlec + 1) % HN;
    hX[i] = x; hY[i] = y; hYas[i] = 0; hOmur[i] = omur; hR0[i] = r0; hR1[i] = r1; hCr[i] = r; hCg[i] = g; hCb[i] = b;
    hGec[i] = gecik || 0; hEg[i] = egim || 0;
  }
  function halkaGuncelle(dt) {
    for (var i = 0; i < HN; i++) {
      var o = 0, f = 1, bekl = false;
      if (hOmur[i] > 0) {
        if (hGec[i] > 0) { hGec[i] -= dt; bekl = true; }
        else {
          hYas[i] += dt; f = hYas[i] / hOmur[i];
          if (f >= 1) { hOmur[i] = 0; f = 1; }
        }
      }
      var e = 1 - (1 - f) * (1 - f);
      var var_ = hOmur[i] > 0 && !bekl;
      o = var_ ? hR0[i] + (hR1[i] - hR0[i]) * e : 0;
      _v3b.set(hX[i], hY[i], hEg[i] ? 0.6 : 0.4);
      _e.set(-hEg[i], 0, 0); _q.setFromEuler(_e); _s3.set(o + 1e-4, o + 1e-4, 1);
      _m4.compose(_v3b, _q, _s3); halkaMesh.setMatrixAt(i, _m4);
      var a = var_ ? (1 - f) * (1 - f) : 0;
      _renk.setRGB(hCr[i] * a, hCg[i] * a, hCb[i] * a); halkaMesh.setColorAt(i, _renk);
    }
    halkaMesh.instanceMatrix.needsUpdate = true;
    if (halkaMesh.instanceColor) halkaMesh.instanceColor.needsUpdate = true;
  }

  // =====================================================================
  // UÇUŞ İZİ (şerit + yıldız tozu + ara sıra pırıltı + hız çizgileri + tepe ışıltısı)
  // =====================================================================
  var IN = 48, izX = new Float32Array(IN), izY = new Float32Array(IN), izT = new Float32Array(IN), izBas = 0, izSay = 0;
  var izPoz, izA, izH, izTozSay = 0, izPirSay = 0, kanatPirSay = 0, kanatTozSay = 0, cizgiSay = 0, ucusT = 0, sonVy = 0, kanatIzSure = 0;
  function cizgi(x, y, vx, vy, b, a0) {
    var v = Math.sqrt(vx * vx + vy * vy) || 1, ang = Math.atan2(vy, vx);
    var ii = yay(ADD, x, y, 0.4, -vx / v * 3.0, -vy / v * 3.0, 0, 0.4, b, b * 0.7, 1, 0.95, 0.85, 11, 0, 3, Math.min(1, a0 * 1.4));
    ADD.don[ii] = -ang; ADD.donh[ii] = 0;
  }
  function izGuncelle(dt, t) {
    var uc = durum() === 'ucus';
    if (kanatIzSure > 0) kanatIzSure = Math.max(0, kanatIzSure - dt);
    var kanatF = kanatIzSure > 0 ? Math.min(1, kanatIzSure / 0.55) : 0;
    var hizF = 0;
    if (uc) {
      ucusT += dt;
      var vx = P.vx || 0, vy = P.vy || 0;
      var spd = Math.sqrt(vx * vx + vy * vy);
      if (izSay === 0) {
        var sv = spd || 1;
        izX[izBas] = P.x - (vx / sv) * 0.32; izY[izBas] = P.y - (vy / sv) * 0.32; izT[izBas] = t - 0.035;
        izBas = (izBas + 1) % IN; izSay = 1;
        izX[izBas] = P.x; izY[izBas] = P.y; izT[izBas] = t;
        izBas = (izBas + 1) % IN; izSay = 2;
      } else {
        var son = (izBas + IN - 1) % IN;
        var dx = P.x - izX[son], dy = P.y - izY[son];
        if (dx * dx + dy * dy > 0.03) {
          izX[izBas] = P.x; izY[izBas] = P.y; izT[izBas] = t; izBas = (izBas + 1) % IN; if (izSay < IN) izSay++;
        } else { izX[son] = P.x; izY[son] = P.y; izT[son] = t; }
      }
      hizF = Math.min(1, Math.max(0, (spd - 6) / 18));
      var cosku = Math.max(hizF, kanatF);
      // altın-mor-pembe pırıltı tozu: hız ve kanat çırpışıyla yoğunlaşır
      var tozAralik = 0.045 - 0.020 * cosku;
      izTozSay += dt;
      while (izTozSay > tozAralik) {
        izTozSay -= tozAralik;
        var sec = Math.random(), tr, tg, tb;
        if (sec < 0.36) { tr = 1.0; tg = 0.88; tb = 0.42; }        // sıcak altın
        else if (sec < 0.70) { tr = 1.0; tg = 0.54; tb = 0.82; }   // gül pembe
        else { tr = 0.72; tg = 0.52; tb = 1.0; }                   // yumuşak mor
        yay(ADD, P.x - vx * 0.03 + (Math.random() - 0.5) * 0.48, P.y - vy * 0.03 + (Math.random() - 0.5) * 0.48, -0.18,
          -vx * 0.06 + (Math.random() - 0.5) * 0.55, -vy * 0.06 + (Math.random() - 0.3) * 0.55, 0,
          0.52 + Math.random() * 0.38, 0.24 + 0.08 * cosku, 0.04, tr, tg, tb, 0, 0.5, 1.15, 0.92);
      }
      // altın-mor-pembe yıldız pırıltıları: izde süzülür
      var pirAralik = 0.16 - 0.08 * cosku;
      izPirSay += dt;
      while (izPirSay > pirAralik) {
        izPirSay -= pirAralik;
        var pSec = Math.random(), pr, pg, pb;
        if (pSec < 0.4) { pr = 1.0; pg = 0.9; pb = 0.5; }
        else if (pSec < 0.72) { pr = 1.0; pg = 0.62; pb = 0.86; }
        else { pr = 0.76; pg = 0.58; pb = 1.0; }
        var p = yay(ADD, P.x - vx * 0.04 + (Math.random() - 0.5) * 0.72, P.y - vy * 0.04 + (Math.random() - 0.5) * 0.72, -0.08,
          -vx * 0.03, 0.18 + (Math.random() - 0.5) * 0.25, 0, 0.78, 0.48 + 0.14 * cosku, 0.06, pr, pg, pb, 1, 0, 0.3, 0.96);
        ADD.donh[p] = (Math.random() - 0.5) * 3.5;
      }
      // kanat çırpma sonrası 0.55s süzülme boyunca uçuş izinde ekstra parlak ışıltı akışı
      if (kanatF > 0) {
        kanatPirSay += dt;
        while (kanatPirSay > 0.055) {
          kanatPirSay -= 0.055;
          var kSec = Math.random(), kr, kg, kb;
          if (kSec < 0.45) { kr = 1.0; kg = 0.92; kb = 0.50; }
          else if (kSec < 0.80) { kr = 0.84; kg = 0.66; kb = 1.0; }
          else { kr = 1.0; kg = 0.96; kb = 1.0; }
          var kp = yay(ADD,
            P.x - vx * 0.035 + (Math.random() - 0.5) * 0.62,
            P.y - vy * 0.035 + (Math.random() - 0.5) * 0.52,
            -0.05,
            -vx * 0.05 + (Math.random() - 0.5) * 0.7,
            -vy * 0.05 + 0.25 + (Math.random() - 0.5) * 0.4,
            0,
            0.48 + Math.random() * 0.24,
            0.46 + 0.18 * kanatF, 0.05,
            kr, kg, kb, (Math.random() < 0.65 ? 1 : 0), -0.2, 0.8, 1.0);
          ADD.donh[kp] = (Math.random() - 0.5) * 5.0;
        }
        kanatTozSay += dt;
        while (kanatTozSay > 0.038) {
          kanatTozSay -= 0.038;
          var ktKaris = Math.min(1, Math.max(0, (1 - kanatF) * 0.65 + Math.random() * 0.35));
          var ktR = 1.0 + (0.84 - 1.0) * ktKaris;
          var ktG = 0.90 + (0.72 - 0.90) * ktKaris;
          var ktB = 0.48 + (1.0 - 0.48) * ktKaris;
          var kt = yay(ADD,
            P.x - vx * 0.032 + (Math.random() - 0.5) * 0.46,
            P.y - vy * 0.032 + (Math.random() - 0.5) * 0.38,
            -0.07,
            -vx * 0.04 + (Math.random() - 0.5) * 0.45,
            -vy * 0.04 + 0.14 + (Math.random() - 0.5) * 0.28,
            0,
            0.42 + Math.random() * 0.22,
            0.13 + 0.09 * kanatF, 0.02,
            ktR, ktG, ktB,
            (Math.random() < 0.25 ? 1 : 0), -0.1, 0.95, 0.76 * kanatF);
          ADD.donh[kt] = (Math.random() - 0.5) * 4.2;
        }
      } else {
        kanatPirSay = 0;
        kanatTozSay = 0;
      }
      // hız çizgileri: fırlamanın ilk anında (onBirak dalgasının ardından) veya yüksek hızda
      if ((ucusT > 0.05 && ucusT < 0.38) || hizF > 0.65) {
        cizgiSay += dt;
        var cizAralik = ucusT < 0.38 ? 0.048 : 0.075;
        while (cizgiSay > cizAralik) {
          cizgiSay -= cizAralik;
          var sp = (Math.random() - 0.5) * 1.3, v = spd || 1;
          var cAlfa = ucusT < 0.38 ? 0.42 * (1 - ucusT / 0.38) : 0.28 * hizF;
          cizgi(P.x - vx / v * 0.9 - vy / v * sp, P.y - vy / v * 0.9 + vx / v * sp, vx, vy, 1.0 + Math.random() * 0.45, cAlfa);
        }
      }
      // tepe noktası: küçük ışıltı
      if (ucusT > 0.25 && sonVy > 0 && vy <= 0) {
        halka(P.x, P.y, 0.3, 1.5, 0.45, 1, 0.92, 0.7);
        for (var q = 0; q < 6; q++) {
          var a = q / 6 * 6.283 + Math.random() * 0.5;
          var ii = yay(ADD, P.x + Math.cos(a) * 0.6, P.y + Math.sin(a) * 0.6, 0.5, Math.cos(a) * 1.6, Math.sin(a) * 1.6, 0, 0.55, 0.28, 0.05, 1, 0.94, 0.7, 1, 0, 2, 0.6);
          ADD.donh[ii] = 2;
        }
      }
      sonVy = vy;
    } else { izTozSay = 0; kanatPirSay = 0; kanatTozSay = 0; ucusT = 0; sonVy = 0; }
    // şerit köşeleri
    var kSon = Math.max(0, izSay - 1);
    var genOlcek = 1 + 0.22 * hizF + 0.32 * kanatF;
    var ucusGiris = uc ? Math.min(1, ucusT / 0.16) : 1;
    ucusGiris = ucusGiris * ucusGiris * (3 - 2 * ucusGiris);
    var girisA = 0.32 + 0.68 * ucusGiris;
    var girisW = 0.48 + 0.52 * ucusGiris;
    for (var k = 0; k < IN; k++) {
      var kk = Math.min(k, kSon);          // kayıtsız köşeler son geçerli noktaya yapışır (eski uçuşa uzanan çizgi olmasın)
      var j = (izBas - 1 - kk + IN * 2) % IN;
      var jn = (kk < kSon) ? (izBas - 2 - kk + IN * 2) % IN : j;
      var jp = (kk > 0) ? (izBas - kk + IN * 2) % IN : j;
      var var_ = k < izSay;
      var px = izX[j], py = izY[j];
      var tx = izX[jp] - izX[jn], ty = izY[jp] - izY[jn];
      var l = Math.sqrt(tx * tx + ty * ty) || 1; var nx = -ty / l, ny = tx / l;
      var u = k / (IN - 1);
      var kuyrukU = kSon > 0 ? k / kSon : 0;
      var kuyrukS = Math.min(1, Math.max(0, (1 - kuyrukU) / 0.24));
      kuyrukS = kuyrukS * kuyrukS * (3 - 2 * kuyrukS);
      var yasA = var_ ? Math.max(0, 1 - (t - izT[j]) / 0.85) : 0;
      var w = (0.32 * (1 - u) + 0.03 + 0.13 * Math.max(0, 1 - u * 5)) * genOlcek * girisW * (0.25 + 0.75 * kuyrukS);   // ucu (Pırıl'a yakın) daha dolgun, kuyruk ucu ipeksi incelir
      var o = k * 6;
      izPoz[o] = px + nx * w; izPoz[o + 1] = py + ny * w; izPoz[o + 2] = -0.35;
      izPoz[o + 3] = px - nx * w; izPoz[o + 4] = py - ny * w; izPoz[o + 5] = -0.35;
      var al = yasA * (1 - u) * kuyrukS * girisA * (k === 0 ? 0.35 : 1);
      izA[k * 2] = al; izA[k * 2 + 1] = al;
      izH[k * 2] = u; izH[k * 2 + 1] = u;
    }
    var ga = izMesh.geometry.attributes;
    ga.position.needsUpdate = true; ga.al.needsUpdate = true; ga.ton.needsUpdate = true;
    izMesh.material.uniforms.uT.value = t;
  }
  function izKur() {
    var g = new THREE.BufferGeometry();
    izPoz = new Float32Array(IN * 6); izA = new Float32Array(IN * 2); izH = new Float32Array(IN * 2);
    var yan = new Float32Array(IN * 2), idx = [];
    for (var k = 0; k < IN; k++) { yan[k * 2] = 0; yan[k * 2 + 1] = 1; }
    for (k = 0; k < IN - 1; k++) { var a = k * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    g.setAttribute('position', new THREE.BufferAttribute(izPoz, 3));
    g.setAttribute('al', new THREE.BufferAttribute(izA, 1));
    g.setAttribute('ton', new THREE.BufferAttribute(izH, 1));
    g.setAttribute('yan', new THREE.BufferAttribute(yan, 1));
    g.setIndex(idx); g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
    var m = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 } },
      vertexShader: 'attribute float al; attribute float ton; attribute float yan; varying float vA; varying float vT; varying float vY;' +
        'void main(){ vA=al; vT=ton; vY=yan; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: 'uniform float uT; varying float vA; varying float vT; varying float vY;' +
        'void main(){ float e=1.0-abs(vY*2.0-1.0); e=e*e*(3.0-2.0*e);' +
        ' float u=clamp(vT,0.0,1.0);' +
        ' float dalga=0.5+0.5*sin(u*18.0-uT*11.0);' +
        ' vec3 col=mix(mix(vec3(1.0,0.88,0.42),vec3(1.0,0.52,0.80),smoothstep(0.0,0.48,u)),vec3(0.66,0.48,1.0),smoothstep(0.42,1.0,u));' +
        ' col=mix(col,vec3(1.0),(0.48+0.34*smoothstep(0.22,0.0,u)+0.12*dalga)*smoothstep(0.65,1.0,e)*(1.0-u));' +
        ' float a=vA*e*(0.86+0.12*dalga); if(a<0.01) discard; gl_FragColor=vec4(col,min(a,1.0)); }',
      transparent: true, depthWrite: false, blending: THREE.NormalBlending, side: THREE.DoubleSide
    });
    izMesh = new THREE.Mesh(g, m); izMesh.frustumCulled = false;
  }

  // ---------- IŞIK HUZMELERİ (çok hafif) ----------
  function huzmeKur() {
    var pos = [], uv = [], idx = [], gen = [2.2, 3.4, 1.6], ofs = [-6, 2, 9], aci = [0.42, 0.36, 0.48];
    for (var i = 0; i < 3; i++) {
      var b = i * 4, L = 46, w0 = gen[i] * 0.4, w1 = gen[i];
      var ca = Math.cos(aci[i]), sa = Math.sin(aci[i]);
      var dx = -sa, dy = -ca; var nx = ca, ny = -sa;
      var sx = 18 + ofs[i], sy = 22;
      var ex = sx + dx * L, ey = sy + dy * L;
      pos.push(sx + nx * w0, sy + ny * w0, 0, sx - nx * w0, sy - ny * w0, 0, ex + nx * w1, ey + ny * w1, 0, ex - nx * w1, ey - ny * w1, 0);
      uv.push(0, 0, 1, 0, 0, 1, 1, 1);
      idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    var m = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 } },
      vertexShader: 'varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: 'uniform float uT; varying vec2 vU; void main(){' +
        ' float x=1.0-abs(vU.x*2.0-1.0); x=x*x; float y=smoothstep(0.0,0.3,vU.y)*smoothstep(1.0,0.45,vU.y);' +
        ' float a=x*y*(0.05+0.018*sin(uT*0.45+vU.y*3.0)); gl_FragColor=vec4(1.0,0.86,0.58,a); }',
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
    });
    huzmeMesh = new THREE.Mesh(g, m); huzmeMesh.frustumCulled = false; huzmeMesh.renderOrder = -5;
  }

  // ---------- ATEŞBÖCEKLERİ & ORTAM PARILTILARI (ADD 0..39, derinlikte; tema duyarlı) ----------
  var FN = 40, fBx = new Float32Array(FN), fBy = new Float32Array(FN), fBz = new Float32Array(FN),
    fF = new Float32Array(FN), fBoy = new Float32Array(FN),
    fCr = new Float32Array(FN), fCg = new Float32Array(FN), fCb = new Float32Array(FN), fYOfs = new Float32Array(FN);
  var fParlak = 0, aktifTema = 'cayir';
  function atesTemala(gece, tema) {
    if (!ADD) return;
    var tm = (tema || aktifTema || 'cayir').toString().toLowerCase();
    var aurora = tm.indexOf('aurora') !== -1 || tm.indexOf('final') !== -1;
    var final20 = tm.indexOf('final') !== -1;
    var mercan = tm.indexOf('mercan') !== -1;
    var kristal = tm.indexOf('kristal') !== -1;
    var gok = tm.indexOf('gokkusagi') !== -1;
    var kiraz = tm.indexOf('kiraz') !== -1 || tm.indexOf('sakura') !== -1;
    var sonbahar = tm.indexOf('sonbahar') !== -1;
    var lavanta = tm.indexOf('lavanta') !== -1;
    var pamuk = tm.indexOf('pamuk') !== -1;
    var su = tm.indexOf('dere') !== -1 || tm.indexOf('deniz') !== -1 || tm.indexOf('okyanus') !== -1 || tm.indexOf('su') !== -1 || tm.indexOf('buz') !== -1 || tm.indexOf('kar') !== -1 || tm.indexOf('kis') !== -1;
    fParlak = aurora ? 2 : ((mercan || kristal || gok || pamuk) ? 3 : (gece ? 1 : 0));
    for (var i = 0; i < FN; i++) {
      var i3 = i * 3, k = (i * 37 % 100) / 100;
      fYOfs[i] = 0;
      if (aurora) {
        var mod = final20 ? (i % 4) : (i % 3);
        if (mod === 0) { fCr[i] = 0.28; fCg[i] = 1.0; fCb[i] = 0.68; }
        else if (mod === 1) { fCr[i] = 0.74; fCg[i] = 0.42; fCb[i] = 1.0; }
        else if (mod === 2) { fCr[i] = 0.30; fCg[i] = 0.92; fCb[i] = 1.0; }
        else { fCr[i] = 1.0; fCg[i] = 0.88; fCb[i] = 0.42; }
        fBoy[i] = 0.24 + k * 0.24;
        ADD.tur[i] = (i % 3 === 0) ? 1 : 0;
        fYOfs[i] = (i % 2 === 0) ? 2.4 : 0.6;
      } else if (mercan || kristal) {
        var m3 = i % 3;
        if (m3 === 0) { fCr[i] = 0.24; fCg[i] = 0.94; fCb[i] = 0.92; }
        else if (m3 === 1) {
          fCr[i] = mercan ? 1.0 : 0.78; fCg[i] = mercan ? 0.56 : 0.66; fCb[i] = mercan ? 0.68 : 1.0;
        } else {
          fCr[i] = mercan ? 0.84 : 1.0; fCg[i] = mercan ? 0.98 : 0.80; fCb[i] = mercan ? 1.0 : 0.94;
        }
        fBoy[i] = 0.20 + k * 0.16;
        ADD.tur[i] = (i % 3 === 0) ? 1 : 0;
      } else if (gok) {
        var gc = GOKKUSAGI[i % GOKKUSAGI.length];
        fCr[i] = gc[0]; fCg[i] = gc[1]; fCb[i] = gc[2];
        fBoy[i] = 0.18 + k * 0.14;
        ADD.tur[i] = (i % 3 === 0) ? 1 : 0;
      } else if (gece) {
        var bal = (i % 5 === 0);
        fCr[i] = 1.0; fCg[i] = bal ? 0.88 : (0.64 + k * 0.22); fCb[i] = bal ? 0.34 : (0.12 + k * 0.16);
        fBoy[i] = 0.26 + k * 0.20;
        ADD.tur[i] = (i % 4 === 0) ? 1 : 0;
      } else if (kiraz) {
        var kp = i % 3 === 0;
        fCr[i] = 1.0; fCg[i] = kp ? 0.90 : 0.76; fCb[i] = kp ? 0.68 : 0.88;
        fBoy[i] = 0.14 + k * 0.08;
        ADD.tur[i] = (i % 5 === 0) ? 1 : 0;
      } else if (sonbahar) {
        fCr[i] = 1.0; fCg[i] = 0.72 + k * 0.14; fCb[i] = 0.34 + k * 0.16;
        fBoy[i] = 0.14 + k * 0.08;
        ADD.tur[i] = 0;
      } else if (lavanta) {
        var lp = i % 3 === 0;
        fCr[i] = lp ? 1.0 : 0.84; fCg[i] = lp ? 0.88 : 0.70; fCb[i] = lp ? 0.56 : 1.0;
        fBoy[i] = 0.14 + k * 0.08;
        ADD.tur[i] = (i % 5 === 0) ? 1 : 0;
      } else if (pamuk) {
        var pm3 = i % 3;
        if (pm3 === 0) { fCr[i] = 1.0; fCg[i] = 0.72; fCb[i] = 0.86; }
        else if (pm3 === 1) { fCr[i] = 0.84; fCg[i] = 0.74; fCb[i] = 1.0; }
        else { fCr[i] = 0.70; fCg[i] = 0.90; fCb[i] = 1.0; }
        fBoy[i] = 0.16 + k * 0.12;
        ADD.tur[i] = (i % 3 === 0) ? 1 : 0;
      } else if (su) {
        fCr[i] = 0.62; fCg[i] = 0.94; fCb[i] = 1.0;
        fBoy[i] = 0.13 + k * 0.08;
        ADD.tur[i] = (i % 4 === 0) ? 1 : 0;
      } else {
        fCr[i] = 1.0; fCg[i] = 0.85 + k * 0.12; fCb[i] = 0.45 + k * 0.25;
        fBoy[i] = 0.12 + k * 0.07;
        ADD.tur[i] = 0;
      }
      ADD.renk[i3] = fCr[i]; ADD.renk[i3 + 1] = fCg[i]; ADD.renk[i3 + 2] = fCb[i];
      ADD.boy[i] = fBoy[i];
    }
  }
  function atesKur() {
    for (var i = 0; i < FN; i++) {
      fBx[i] = -12 + Math.random() * 74;
      fBz[i] = -1.5 - Math.random() * 14;           // hepsi oyun düzleminin arkasında
      fBy[i] = 0.6 + Math.random() * 14;
      fF[i] = Math.random() * 100;
      ADD.tur[i] = 0;
    }
    atesTemala(geceMod, aktifTema);
    for (i = 40; i < 45; i++) { var h3 = i * 3; ADD.renk[h3] = 1.0; ADD.renk[h3 + 1] = 0.9; ADD.renk[h3 + 2] = 0.45; ADD.tur[i] = 0; }
  }
  function atesGuncelle(t) {
    var canliMod = (fParlak === 1 || fParlak === 2);
    var aTab = canliMod ? (fParlak === 2 ? 0.16 : 0.10) : (fParlak === 3 ? 0.16 : 0.12);
    var aGen = canliMod ? (fParlak === 2 ? 0.84 : 0.88) : (fParlak === 3 ? 0.56 : 0.38);
    for (var i = 0; i < FN; i++) {
      var f = fF[i], i3 = i * 3;
      if (canliMod) {
        ADD.poz[i3] = fBx[i] + Math.sin(t * 0.21 + f) * 1.75 + Math.sin(t * 0.53 + f * 2.0) * 0.52 + Math.cos(t * 0.13 + f * 3.1) * 0.55;
        ADD.poz[i3 + 1] = fBy[i] + fYOfs[i] + Math.sin(t * 0.37 + f * 1.7) * 1.02 + Math.cos(t * 0.67 + f) * 0.28;
        ADD.poz[i3 + 2] = fBz[i] * 0.45 - 0.5;
        var w1 = Math.sin(t * (0.72 + (i % 7) * 0.11) + f * 2.3);
        var w2 = Math.sin(t * (0.31 + (i % 5) * 0.07) + f * 4.1);
        var p = Math.max(0, 0.55 * w1 + 0.45 * w2 + 0.18);
        p = p * p * (1.5 - 0.5 * p);
        ADD.alfa[i] = aTab + aGen * p;
        ADD.boy[i] = fBoy[i] * (0.78 + 0.46 * p);
        if (fParlak === 1) {
          var k = (i * 37 % 100) / 100, bal = (i % 5 === 0);
          ADD.renk[i3] = 1.0;
          ADD.renk[i3 + 1] = (bal ? 0.84 : (0.60 + k * 0.22)) + 0.14 * p;
          ADD.renk[i3 + 2] = (bal ? 0.28 : (0.10 + k * 0.14)) + 0.18 * p;
        } else {
          ADD.renk[i3] = Math.min(1.0, fCr[i] + (1.0 - fCr[i]) * 0.22 * p);
          ADD.renk[i3 + 1] = Math.min(1.0, fCg[i] + (1.0 - fCg[i]) * 0.22 * p);
          ADD.renk[i3 + 2] = Math.min(1.0, fCb[i] + (1.0 - fCb[i]) * 0.22 * p);
        }
        if (ADD.tur[i] === 1) ADD.don[i] = t * 0.8 + f;
      } else {
        ADD.poz[i3] = fBx[i] + Math.sin(t * 0.23 + f) * 1.65 + Math.sin(t * 0.59 + f * 2.0) * 0.48;
        ADD.poz[i3 + 1] = fBy[i] + fYOfs[i] + Math.sin(t * 0.39 + f * 1.7) * 0.95 + Math.cos(t * 0.71 + f) * 0.25;
        ADD.poz[i3 + 2] = fBz[i];
        var pg = 0.5 + 0.5 * Math.sin(t * (1.05 + (i % 5) * 0.22) + f * 3.0);
        ADD.alfa[i] = aTab + aGen * pg * pg;
        if (fParlak === 3) {
          ADD.boy[i] = fBoy[i] * (0.82 + 0.34 * pg);
          if (ADD.tur[i] === 1) ADD.don[i] = t * 0.65 + f;
        }
      }
    }
  }

  // ---------- BÖLÜM MEKANİKLERİ: RÜZGAR SÜTUNLARI + HALKALAR (sıfır ayırma) ----------
  var MAX_RUZGAR = 8, ruzSay = 0, ruzTimer = 0;
  var ruzX = new Float32Array(MAX_RUZGAR), ruzY0 = new Float32Array(MAX_RUZGAR),
    ruzY1 = new Float32Array(MAX_RUZGAR), ruzGen = new Float32Array(MAX_RUZGAR);
  var MAX_HALKA = 12, bhSay = 0, bhTimer = 0, bhOncekiDurum = '';
  var bhX = new Float32Array(MAX_HALKA), bhY = new Float32Array(MAX_HALKA),
    bhR = new Float32Array(MAX_HALKA), bhGec = new Uint8Array(MAX_HALKA);

  function geceMi(b) {
    if (!b) return false;
    if (b.gece) return true;
    var tm = (b.tema || b.zaman || b.mod || b.id || '').toString().toLowerCase();
    return tm.indexOf('gece') !== -1 || tm === 'night';
  }
  function bolumAyarla(b) {
    aktifBolum = b || null;
    aktifTema = (aktifBolum && aktifBolum.tema) ? String(aktifBolum.tema).toLowerCase() : ((aktifBolum && (aktifBolum.zaman || aktifBolum.mod)) ? String(aktifBolum.zaman || aktifBolum.mod).toLowerCase() : 'cayir');
    geceMod = geceMi(aktifBolum);
    atesTemala(geceMod, aktifTema);
    tohumTemala(aktifTema);
    if (huzmeMesh) huzmeMesh.visible = !geceMod;
    // rüzgar sütunları
    ruzSay = 0;
    var rl = aktifBolum && (aktifBolum.ruzgarlar || aktifBolum.ruzgar || aktifBolum.ruzgarSutunlari);
    if (rl && rl.length) {
      for (var i = 0; i < rl.length && ruzSay < MAX_RUZGAR; i++) {
        var r = rl[i]; if (!r) continue;
        var x = (r.x !== undefined) ? r.x : ((r.x1 !== undefined && r.x2 !== undefined) ? (r.x1 + r.x2) * 0.5 : 0);
        var gen = r.gen || r.w || r.genislik || ((r.x1 !== undefined && r.x2 !== undefined) ? Math.abs(r.x2 - r.x1) : (r.r ? r.r * 2 : 3.2));
        var y0 = (r.y0 !== undefined) ? r.y0 : ((r.y1 !== undefined && r.y2 !== undefined) ? Math.min(r.y1, r.y2) : ((r.y !== undefined) ? r.y : yerY() + 0.3));
        var y1 = (r.y2 !== undefined) ? Math.max(r.y1 || y0, r.y2) : ((r.y1 !== undefined && r.y0 !== undefined) ? r.y1 : y0 + (r.yuk || r.h || r.yukseklik || 11));
        ruzX[ruzSay] = x; ruzY0[ruzSay] = y0; ruzY1[ruzSay] = y1; ruzGen[ruzSay] = gen;
        ruzSay++;
      }
    }
    // bölüm halkaları
    bhSay = 0;
    var hl = aktifBolum && (aktifBolum.halkalar || aktifBolum.halka);
    if (hl && hl.length) {
      for (i = 0; i < hl.length && bhSay < MAX_HALKA; i++) {
        var h = hl[i]; if (!h) continue;
        bhX[bhSay] = h.x || 0; bhY[bhSay] = h.y || 8; bhR[bhSay] = h.r || h.yaricap || 2.1;
        bhGec[bhSay] = 0; bhSay++;
      }
    }
  }
  function ruzgarGuncelle(dt, t) {
    if (ruzSay <= 0) return;
    ruzTimer += dt;
    while (ruzTimer > 0.058) {
      ruzTimer -= 0.058;
      for (var i = 0; i < ruzSay; i++) {
        var gen = ruzGen[i], y0 = ruzY0[i], y1 = ruzY1[i];
        var h = Math.max(1, (y1 - y0) * 0.76);
        var px = ruzX[i] + (Math.random() - 0.5) * gen * 0.84;
        var py = y0 + Math.random() * h;
        var vy = 4.4 + Math.random() * 3.2;
        var vx = Math.sin(t * 2.3 + px * 0.65 + py * 0.22) * 0.75;
        // yukarı süzülen ışıltılı rüzgâr çizgisi (ADD, tur=11 akış yönüne eğimli)
        var ton = Math.random();
        var ii = yay(ADD, px, py, 0.25, vx, vy, 0,
          0.84 + Math.random() * 0.36, 0.78 + Math.random() * 0.22, 0.36,
          0.72 + ton * 0.14, 0.96 + ton * 0.04, 1.0, 11, -1.65, 0.42, 0.48 + Math.random() * 0.12);
        ADD.don[ii] = -Math.atan2(vy, vx); ADD.donh[ii] = 0;
        // hafif hava pufu
        if (Math.random() < 0.18) {
          yay(ADD, px, py, 0.2, vx * 0.45, vy * 0.62, 0,
            0.72, 0.42, 0.12, 0.80, 0.97, 1.0, 0, -0.95, 0.52, 0.16);
        }
        // zarifçe savrulan yaprak veya ince yıldız pırıltısı
        var rP = Math.random();
        if (rP < 0.30) {
          var lTon = Math.random();
          var jj = yay(NOR, px + (Math.random() - 0.5) * 0.25, py, 0.35,
            vx + (Math.random() - 0.5) * 1.15, vy * 0.76, 0,
            1.18 + Math.random() * 0.42, 0.23 + Math.random() * 0.07, 0.15,
            0.56 + lTon * 0.16, 0.92 + lTon * 0.04, 0.68 - lTon * 0.10,
            5, -2.15, 0.78, geceMod ? 0.72 : 0.85);
          NOR.donh[jj] = (Math.random() - 0.5) * 4.2;
        } else if (rP < 0.50) {
          var kk = yay(ADD, px, py, 0.3, vx * 0.6, vy * 0.75, 0,
            0.68 + Math.random() * 0.26, 0.26 + Math.random() * 0.10, 0.04,
            0.88, 1.0, 0.95, 1, -1.25, 0.42, 0.72);
          ADD.donh[kk] = (Math.random() < 0.5 ? 2.4 : -2.4);
        }
      }
    }
  }
  function halkaKonfetiPatlat(x, y) {
    var yk = yay(ADD, x, y, 0.68, 0, 0, 0, 0.40, 0.85, 1.80, 1, 0.97, 0.82, 1, 0, 0, 0.88);
    ADD.donh[yk] = 2.2;
    halka(x, y, 0.35, 2.4, 0.34, 1.0, 0.97, 0.82);
    for (var k = 0; k < 2; k++) {
      var c = GOKKUSAGI[(k * 2) % GOKKUSAGI.length];
      halka(x, y, 0.65 + k * 0.22, 3.6 + k * 0.65, 0.64, 0.82 * c[0] + 0.18, 0.82 * c[1] + 0.16, 0.82 * c[2] + 0.10, k * 0.05);
    }
    for (var h = 0; h < 4; h++) {
      var ah = (h / 4) * 6.283 + 0.35, ch = GOKKUSAGI[h % GOKKUSAGI.length], sh = 4.2 + Math.random() * 1.2;
      var bh = 0.64 + (h % 2) * 0.14 + Math.random() * 0.08;
      var ih = yay(ADD, x + Math.cos(ah) * 0.45, y + Math.sin(ah) * 0.45, 0.64,
        Math.cos(ah) * sh, Math.sin(ah) * sh, 0, 0.30, bh, bh * 0.26,
        0.55 + 0.45 * ch[0], 0.52 + 0.48 * ch[1], 0.45 + 0.50 * ch[2], 11, 0, 2.4, 0.74);
      ADD.don[ih] = -ah; ADD.donh[ih] = 0;
    }
    for (var i = 0; i < 16; i++) {
      var c2 = GOKKUSAGI[i % GOKKUSAGI.length];
      var altinPul = (i % 5 === 0);
      var r2 = altinPul ? 1.0 : 0.88 * c2[0] + 0.12;
      var g2 = altinPul ? 0.92 : 0.88 * c2[1] + 0.10;
      var bb2 = altinPul ? 0.62 : 0.88 * c2[2] + 0.06;
      var a = (i / 16) * 6.283 + Math.random() * 0.3, sp = 3.0 + Math.random() * 3.4;
      var pul = (i % 4 === 0);
      var b0 = pul ? (0.14 + Math.random() * 0.10) : (0.19 + (i % 3) * 0.055 + Math.random() * 0.05);
      var ii = yay(NOR, x + Math.cos(a) * 0.4, y + Math.sin(a) * 0.4, 0.6,
        Math.cos(a) * sp, Math.sin(a) * sp + 1.15, 0, 1.95 + Math.random() * 0.65, b0, b0 * (pul ? 0.72 : 0.78),
        r2, g2, bb2, pul ? 7 : 3, 1.65, 1.75, 1);
      NOR.donh[ii] = (Math.random() - 0.5) * 8.0;
    }
    for (i = 0; i < 10; i++) {
      var c3 = GOKKUSAGI[i % GOKKUSAGI.length];
      var sicak = (i % 3 === 0);
      var r3 = sicak ? 1.0 : 0.84 * c3[0] + 0.16;
      var g3 = sicak ? 0.93 : 0.84 * c3[1] + 0.14;
      var bb3 = sicak ? 0.64 : 0.84 * c3[2] + 0.08;
      var a2 = (i / 10) * 6.283 + Math.random() * 0.4, sp2 = 2.8 + Math.random() * 3.4;
      var b3 = 0.30 + (i % 3) * 0.12 + Math.random() * 0.08;
      var jj = yay(ADD, x, y, 0.7, Math.cos(a2) * sp2, Math.sin(a2) * sp2, 0,
        0.65 + Math.random() * 0.30, b3, b3 * 0.14, r3, g3, bb3, 1, 0.8, 1.75, 1);
      ADD.donh[jj] = (i % 2 ? 1 : -1) * (3.2 + Math.random() * 1.8);
    }
  }
  function bolumHalkaGuncelle(dt, t) {
    if (bhSay <= 0) return;
    var d = durum();
    if (d === 'cek' && bhOncekiDurum !== 'cek') {
      for (var r = 0; r < bhSay; r++) bhGec[r] = 0;
    }
    bhOncekiDurum = d;
    bhTimer += dt;
    if (bhTimer > 0.085) {
      bhTimer = 0;
      var zamanT = t || 0;
      for (var k = 0; k < bhSay; k++) {
        if (bhGec[k]) continue;
        // altın kıvılcım: halka çevresinde davetkâr yörünge pırıltısı
        var ang = zamanT * 1.85 + k * 2.1 + Math.random() * 1.8;
        var rad = bhR[k] * (0.90 + Math.sin(zamanT * 2.4 + k) * 0.04);
        var cs = Math.cos(ang), sn = Math.sin(ang);
        var ip = yay(ADD, bhX[k] + cs * rad, bhY[k] + sn * rad, 0.3,
          -sn * 0.45, 0.24 + cs * 0.26, 0, 0.66, 0.38, 0.05, 1.0, 0.90, 0.46, 1, 0, 0.3, 0.90);
        ADD.donh[ip] = 2.8;

        // gökkuşağı kıvılcımı: karşı yayda yumuşak parıltı
        var ang2 = ang + 2.3 + Math.random() * 1.6;
        var rad2 = bhR[k] * (0.88 + Math.random() * 0.08);
        var cs2 = Math.cos(ang2), sn2 = Math.sin(ang2);
        var cIdx = ((zamanT * 2.5 + k + Math.random() * 2) | 0) % GOKKUSAGI.length;
        if (cIdx < 0) cIdx += GOKKUSAGI.length;
        var c = GOKKUSAGI[cIdx];
        var ip2 = yay(ADD, bhX[k] + cs2 * rad2, bhY[k] + sn2 * rad2, 0.3,
          -sn2 * 0.36, 0.20 + cs2 * 0.20, 0, 0.58, 0.30, 0.04, c[0], c[1], c[2], 1, 0, 0.32, 0.82);
        ADD.donh[ip2] = -2.4;

        // ara sıra sıcak altın hâle zerresi
        if (Math.random() < 0.35) {
          yay(ADD, bhX[k] + cs * rad * 0.96, bhY[k] + sn * rad * 0.96, 0.28,
            -cs * 0.14, 0.18, 0, 0.52, 0.28, 0.06, 1.0, 0.92, 0.58, 0, 0, 0.4, 0.34);
        }
      }
    }
    if (d === 'ucus' && pVar()) {
      for (var i = 0; i < bhSay; i++) {
        if (bhGec[i]) continue;
        var dx = P.x - bhX[i], dy = P.y - bhY[i], lim = bhR[i] + R_P * 0.6;
        if (dx * dx + dy * dy <= lim * lim) {
          bhGec[i] = 1;
          halkaKonfetiPatlat(bhX[i], bhY[i]);
        }
      }
    }
  }

  // ---------- ORTAM PARÇACIKLARI: KARAHİNDİBA / SAKURA / SONBAHAR / AURORA / MERCAN (NOR 0..SN-1) ----------
  var SN = 24, sX = new Float32Array(SN), sY = new Float32Array(SN), sZ = new Float32Array(SN), sVx = new Float32Array(SN), sVy = new Float32Array(SN), sF = new Float32Array(SN);
  var sMod = 0, sFallVy = 0, sDriftVx = 0.35;
  function tohumTemala(tema) {
    if (!NOR) return;
    var tm = (tema || aktifTema || 'cayir').toString().toLowerCase();
    var kiraz = tm.indexOf('kiraz') !== -1 || tm.indexOf('sakura') !== -1;
    var sonbahar = tm.indexOf('sonbahar') !== -1;
    var aurora = tm.indexOf('aurora') !== -1 || tm.indexOf('final') !== -1;
    var final20 = tm.indexOf('final') !== -1;
    var mercan = tm.indexOf('mercan') !== -1;
    var kristal = tm.indexOf('kristal') !== -1;
    var kar = tm.indexOf('kar') !== -1 || tm.indexOf('kis') !== -1 || tm.indexOf('buz') !== -1;
    var lavanta = tm.indexOf('lavanta') !== -1;
    var aycicegi = tm.indexOf('aycicegi') !== -1;
    var pamuk = tm.indexOf('pamuk') !== -1;
    var gok = tm.indexOf('gokkusagi') !== -1;
    var safak = tm.indexOf('safak') !== -1;
    var su = tm.indexOf('dere') !== -1 || tm.indexOf('deniz') !== -1 || tm.indexOf('okyanus') !== -1 || tm.indexOf('su') !== -1;
    var bulut = tm.indexOf('bulut') !== -1 || tm.indexOf('gok') !== -1;
    var col = tm.indexOf('col') !== -1 || tm.indexOf('gunbatimi') !== -1 || tm.indexOf('kum') !== -1;
    var gece = tm.indexOf('gece') !== -1 || tm === 'night' || geceMod;

    sMod = (kiraz || sonbahar) ? 1 : ((mercan || su) ? 2 : (kar ? 3 : 0));
    sFallVy = kiraz ? -0.62 : (sonbahar ? -0.92 : (kar ? -0.72 : (mercan ? 0.34 : (su ? 0.22 : 0))));
    sDriftVx = kiraz ? 0.48 : (sonbahar ? 0.62 : (kar ? 0.22 : (aycicegi ? 0.38 : 0.35)));

    for (var i = 0; i < SN; i++) {
      var i3 = i * 3, k = (i * 29 % 100) / 100;
      if (kiraz) {
        var p3 = i % 3;
        NOR.renk[i3] = 1.0; NOR.renk[i3 + 1] = p3 === 0 ? 0.64 : (p3 === 1 ? 0.78 : 0.90); NOR.renk[i3 + 2] = p3 === 0 ? 0.80 : (p3 === 1 ? 0.88 : 0.94);
        NOR.tur[i] = 5; NOR.boy[i] = 0.21 + k * 0.11;
      } else if (sonbahar) {
        var s3 = i % 3;
        NOR.renk[i3] = s3 === 2 ? 0.90 : 0.98; NOR.renk[i3 + 1] = s3 === 0 ? 0.52 : (s3 === 1 ? 0.74 : 0.34); NOR.renk[i3 + 2] = s3 === 1 ? 0.20 : 0.14;
        NOR.tur[i] = 5; NOR.boy[i] = 0.23 + k * 0.11;
      } else if (aurora) {
        var a4 = final20 ? (i % 4) : (i % 3);
        if (a4 === 0) { NOR.renk[i3] = 0.36; NOR.renk[i3 + 1] = 1.0; NOR.renk[i3 + 2] = 0.72; }
        else if (a4 === 1) { NOR.renk[i3] = 0.78; NOR.renk[i3 + 1] = 0.52; NOR.renk[i3 + 2] = 1.0; }
        else if (a4 === 2) { NOR.renk[i3] = 0.44; NOR.renk[i3 + 1] = 0.94; NOR.renk[i3 + 2] = 1.0; }
        else { NOR.renk[i3] = 1.0; NOR.renk[i3 + 1] = 0.90; NOR.renk[i3 + 2] = 0.48; }
        NOR.tur[i] = (i % 3 === 0) ? 1 : 0; NOR.boy[i] = 0.16 + k * 0.10;
      } else if (mercan || kristal) {
        var m3 = i % 3;
        if (m3 === 0) { NOR.renk[i3] = 0.32; NOR.renk[i3 + 1] = 0.94; NOR.renk[i3 + 2] = 0.94; }
        else if (m3 === 1) { NOR.renk[i3] = mercan ? 1.0 : 0.82; NOR.renk[i3 + 1] = mercan ? 0.64 : 0.74; NOR.renk[i3 + 2] = mercan ? 0.74 : 1.0; }
        else { NOR.renk[i3] = mercan ? 0.88 : 1.0; NOR.renk[i3 + 1] = mercan ? 0.99 : 0.82; NOR.renk[i3 + 2] = mercan ? 1.0 : 0.95; }
        NOR.tur[i] = (kristal && i % 3 === 0) ? 1 : 7; NOR.boy[i] = 0.14 + k * 0.09;
      } else if (kar) {
        NOR.renk[i3] = 0.92; NOR.renk[i3 + 1] = 0.97; NOR.renk[i3 + 2] = 1.0;
        NOR.tur[i] = (i % 4 === 0) ? 1 : 7; NOR.boy[i] = 0.14 + k * 0.09;
      } else if (lavanta) {
        var lv = i % 3 === 0;
        NOR.renk[i3] = lv ? 0.78 : 0.92; NOR.renk[i3 + 1] = lv ? 0.58 : 0.82; NOR.renk[i3 + 2] = 1.0;
        NOR.tur[i] = (i % 3 === 0) ? 5 : 10; NOR.boy[i] = 0.19 + k * 0.08;
      } else if (aycicegi) {
        var ay3 = i % 3;
        NOR.renk[i3] = 1.0;
        NOR.renk[i3 + 1] = ay3 === 0 ? 0.90 : (ay3 === 1 ? 0.78 : 0.96);
        NOR.renk[i3 + 2] = ay3 === 0 ? 0.36 : (ay3 === 1 ? 0.24 : 0.58);
        NOR.tur[i] = (i % 5 === 0) ? 1 : 0; NOR.boy[i] = 0.11 + k * 0.08;
      } else if (pamuk) {
        var pm3 = i % 3;
        if (pm3 === 0) { NOR.renk[i3] = 1.0; NOR.renk[i3 + 1] = 0.76; NOR.renk[i3 + 2] = 0.88; }
        else if (pm3 === 1) { NOR.renk[i3] = 0.86; NOR.renk[i3 + 1] = 0.78; NOR.renk[i3 + 2] = 1.0; }
        else { NOR.renk[i3] = 0.74; NOR.renk[i3 + 1] = 0.92; NOR.renk[i3 + 2] = 1.0; }
        NOR.tur[i] = (i % 4 === 0) ? 1 : 10; NOR.boy[i] = 0.17 + k * 0.09;
      } else if (gok) {
        var gc = GOKKUSAGI[i % GOKKUSAGI.length];
        NOR.renk[i3] = gc[0]; NOR.renk[i3 + 1] = gc[1]; NOR.renk[i3 + 2] = gc[2];
        NOR.tur[i] = (i % 3 === 0) ? 1 : 7; NOR.boy[i] = 0.15 + k * 0.08;
      } else if (safak) {
        var sf3 = i % 3;
        NOR.renk[i3] = 1.0;
        NOR.renk[i3 + 1] = sf3 === 0 ? 0.88 : (sf3 === 1 ? 0.76 : 0.94);
        NOR.renk[i3 + 2] = sf3 === 0 ? 0.48 : (sf3 === 1 ? 0.44 : 0.68);
        NOR.tur[i] = 0; NOR.boy[i] = 0.12 + k * 0.07;
      } else if (su) {
        NOR.renk[i3] = 0.56; NOR.renk[i3 + 1] = 0.92; NOR.renk[i3 + 2] = 1.0;
        NOR.tur[i] = 7; NOR.boy[i] = 0.12 + k * 0.07;
      } else if (bulut) {
        NOR.renk[i3] = 1.0; NOR.renk[i3 + 1] = 0.99; NOR.renk[i3 + 2] = 0.98;
        NOR.tur[i] = (i % 3 === 0) ? 2 : 10; NOR.boy[i] = 0.20 + k * 0.10;
      } else if (col) {
        NOR.renk[i3] = 1.0; NOR.renk[i3 + 1] = 0.84; NOR.renk[i3 + 2] = 0.52;
        NOR.tur[i] = 0; NOR.boy[i] = 0.14 + k * 0.07;
      } else if (gece) {
        NOR.renk[i3] = 0.84; NOR.renk[i3 + 1] = 0.86; NOR.renk[i3 + 2] = 1.0;
        NOR.tur[i] = 0; NOR.boy[i] = 0.13 + k * 0.06;
      } else {
        var pol = i % 4 === 0;
        NOR.renk[i3] = 1; NOR.renk[i3 + 1] = pol ? 0.92 : 0.99; NOR.renk[i3 + 2] = pol ? 0.6 : 0.95;
        NOR.tur[i] = pol ? 0 : 10; NOR.boy[i] = pol ? 0.13 : 0.2 + k * 0.08;
      }
    }
  }
  function tohumKur() {
    for (var i = 0; i < SN; i++) {
      sX[i] = -10 + Math.random() * 60; sY[i] = 1 + Math.random() * 11; sZ[i] = (i % 3 === 0) ? 0.8 + Math.random() * 1.2 : -0.8 - Math.random() * 3;
      sF[i] = Math.random() * 50; sVx[i] = 0; sVy[i] = 0;
    }
    tohumTemala(aktifTema);
  }
  function tohumGuncelle(dt, t) {
    var uc = durum() === 'ucus', kx = (typeof camera !== 'undefined' && camera) ? camera.position.x : 10;
    var hiz2 = uc ? (P.vx * P.vx + P.vy * P.vy) : 0;
    var zy = yerY();
    for (var i = 0; i < SN; i++) {
      var f = sF[i];
      // Pırıl hızla geçerken yakın tohumlar/yapraklar savrulur
      if (uc && hiz2 > 25 && Math.abs(sZ[i]) < 2.2) {
        var dx = sX[i] - P.x, dy = sY[i] - P.y, d2 = dx * dx + dy * dy;
        if (d2 < 7) {
          var k = (1 - d2 / 7) * dt * 6;
          sVx[i] += (P.vx * 0.35 + dx * 2) * k; sVy[i] += (P.vy * 0.35 + dy * 2) * k;
        }
      }
      var s = Math.exp(-dt * 1.4); sVx[i] *= s; sVy[i] *= s;
      var salinimX = sMod === 1 ? Math.sin(t * 1.5 + f * 1.2) * 0.65 : Math.sin(t * 0.3 + f) * 0.25;
      var salinimY = sMod === 1 ? Math.cos(t * 1.9 + f) * 0.16 : Math.sin(t * 0.6 + f * 1.3) * 0.18;
      sX[i] += (sDriftVx + salinimX + sVx[i]) * dt;
      sY[i] += (sFallVy + salinimY + sVy[i]) * dt;
      if (sMod === 1 || sMod === 3) {
        if (sY[i] < zy + 0.35) { sY[i] = 12.5 + (i % 5) * 0.45; sX[i] = kx - 22 + Math.random() * 44; sVy[i] = 0; }
      } else if (sMod === 2) {
        if (sY[i] > 13.5) { sY[i] = zy + 0.6 + (i % 4) * 0.3; sX[i] = kx - 22 + Math.random() * 44; sVy[i] = 0; }
        if (sY[i] < zy + 0.5) sY[i] = zy + 0.5;
      } else {
        if (sY[i] < 0.6) { sY[i] = 0.6; sVy[i] = Math.abs(sVy[i]) * 0.3; }
        if (sY[i] > 13) sY[i] = 13;
      }
      // kameranın çevresinde döner (sağdan çıkan soldan girer)
      if (sX[i] > kx + 26) sX[i] -= 52; else if (sX[i] < kx - 26) sX[i] += 52;
      var i3 = i * 3;
      NOR.poz[i3] = sX[i]; NOR.poz[i3 + 1] = sY[i]; NOR.poz[i3 + 2] = sZ[i];
      NOR.don[i] = sMod === 1 ? (t * (0.9 + (i % 3) * 0.35) + f) : Math.sin(t * 0.8 + f) * 0.5;
      NOR.alfa[i] = (sZ[i] > 0 ? 0.55 : 0.65) * (0.8 + 0.2 * Math.sin(t * 1.3 + f));
    }
  }

  // =====================================================================
  // OLAY TEPKİLERİ
  // =====================================================================
  function patlat(x, y, n, hiz, b, r, g, bb, tur) {
    for (var i = 0; i < n; i++) {
      var a = (i / n) * 6.283 + Math.random() * 0.4, v = hiz * (0.6 + Math.random() * 0.6);
      var ii = yay(ADD, x, y, 0.5, Math.cos(a) * v, Math.sin(a) * v, 0, 0.62 + Math.random() * 0.36, b, b * 0.06, r, g, bb, tur, 1.5, 2.6, 0.96);
      ADD.donh[ii] = (Math.random() - 0.5) * 6;
    }
  }
  function onCek(v) {
    if (!v) return;
    yolX = v.x; yolY = v.y; yolVx = v.vx || 0; yolVy = v.vy || 0; yolGuc = v.guc || 0;
    yolHedef = (yolVx !== 0 || yolVy !== 0) ? 1 : 0;   // ölü bölgede (vx=vy=0) gizli
    if (yolGorunur <= 0.01) yolGucG = yolGuc;
  }
  function onBirak(v) {
    yolHedef = 0; izSay = 0; ucusT = 0; kanatIzSure = 0; kanatPirSay = 0;
    kanatTozSay = 0; izTozSay = 0; izPirSay = 0; cizgiSay = 0;
    kaySay = 0; kaySure = 0.12;           // yeni atış kaydedilir; önceki iz yenisi gelene dek kalır
    // fırlarken salıncaktan rüzgâr dalgası, hız çizgileri ve hız pırıltısı
    var vx = (v && v.vx) || (pVar() ? P.vx : 10), vy = (v && v.vy) || (pVar() ? P.vy : 10);
    var x = pVar() ? P.x : 0, y = pVar() ? P.y : 3;
    var vv = Math.sqrt(vx * vx + vy * vy) || 1;
    var nx = vx / vv, ny = vy / vv;
    var guc = Math.min(1, Math.max(0.2, (vv - 6) / 22));
    for (var i = 0; i < 4; i++) {
      var u = i / 3 - 0.5;
      var sp = u * 1.45;
      var geri = 0.45 + Math.abs(u) * 0.4;
      var merkez = 1 - Math.abs(u) * 1.2;
      cizgi(x - nx * geri - ny * sp, y - ny * geri + nx * sp, vx, vy, 1.05 + 0.35 * guc + merkez * 0.25, (0.36 + 0.24 * guc) * (0.72 + 0.28 * merkez));
    }
    for (var j = 0; j < 6; j++) {
      var s = (j / 5 - 0.5) * 1.3 + (Math.random() - 0.5) * 0.22;
      var mes = 0.32 + Math.random() * 0.48;
      var hizGeri = 2.2 + Math.random() * 2.4 + guc * 1.4;
      var altin = (j % 2 === 0);
      var ip = yay(ADD,
        x - nx * mes - ny * s, y - ny * mes + nx * s, 0.55,
        -nx * hizGeri - ny * (s * 1.0), -ny * hizGeri + nx * (s * 1.0) + 0.22, 0,
        0.38 + Math.random() * 0.20, 0.28 + 0.12 * guc, 0.04,
        altin ? 1.0 : 0.88, altin ? 0.93 : 0.82, altin ? 0.62 : 1.0,
        1, 0.35, 3.0, 0.78 + 0.16 * guc);
      ADD.donh[ip] = (j % 2 ? -1 : 1) * (3.2 + Math.random() * 2.2);
    }
    halka(x - nx * 0.22, y - ny * 0.22, 0.26, 1.65 + 0.45 * guc, 0.36, 1.0, 0.95, 0.84);
    halka(x - nx * 0.46, y - ny * 0.46, 0.20, 1.35 + 0.35 * guc, 0.40, 0.86, 0.88, 1.0, 0.045, 0.35);
  }
  var kademe = 0, kademeG = 0, kademePop = 0;
  function onGucSeviye(n) {
    n = n | 0; if (n === kademe) return;
    if (n > kademe && n > 0 && pVar() && durum() === 'cek') {     // kademe atlayınca küçük "dolu!" pırıltısı
      kademePop = 1;
      var cr = n === 3 ? 1 : (n === 2 ? 1 : 0.92), cg = n === 3 ? 0.82 : (n === 2 ? 0.92 : 0.9), cb = n === 3 ? 0.35 : (n === 2 ? 0.6 : 1);
      for (var i = 0; i < 4 + n * 2; i++) {
        var a = i / (4 + n * 2) * 6.283, s = 1.2 + n * 0.5;
        var ii = yay(ADD, P.x, P.y, 0.8, Math.cos(a) * s, Math.sin(a) * s, 0, 0.45, 0.3 + 0.06 * n, 0.04, cr, cg, cb, 1, 0, 2.5, 0.9);
        ADD.donh[ii] = 3;
      }
    }
    kademe = n;
  }
  function onSalla() { yolHedef = 0; kademe = 0; }
  function onKanat(v) {
    if (!pVar()) return;
    kanatIzSure = 0.55;
    var px = P.x, py = P.y;
    var vx = P.vx || 0, vy = P.vy || 0;
    var vLen = Math.sqrt(vx * vx + vy * vy) || 1;
    var ax = px - (vx / vLen) * 0.35, ay = py - 0.32 - (vy / vLen) * 0.18;
    // Pırıl'ın altında/arkasında yumuşak kanat parıltısı + genişleyen lavanta-altın rüzgâr halkası
    yay(ADD, ax, ay, 0.62, vx * 0.8, vy * 0.8, 0, 0.28, 0.95, 1.85, 1.0, 0.95, 0.78, 0, 0, 0, 0.68);
    // aşağı doğru itiş çizgileri: kanadın havayı aşağı ittiğini gösterir (Pırıl'la birlikte akar)
    for (var dc = -1; dc <= 1; dc++) {
      var idc = yay(ADD, px + dc * 0.42, py - 0.75 - Math.abs(dc) * 0.1, 0.6, vx * 0.6 + dc * 0.4, vy * 0.4 - 5.5, 0,
        0.30, 1.05 - 0.2 * Math.abs(dc), 0.5, 1.0, 0.95, 0.88, 11, 0, 3.2, 0.75);
      ADD.don[idc] = Math.PI / 2 + dc * 0.18; ADD.donh[idc] = 0;
    }
    for (var w = -1; w <= 1; w += 2) {
      var wa = Math.atan2(-0.55, -(vx / vLen) * 0.7 + w * 0.65);
      var iw = yay(ADD, ax + w * 0.34, ay - 0.08, 0.58,
        Math.cos(wa) * 3.8, Math.sin(wa) * 3.8, 0, 0.26, 0.68, 0.18,
        0.92, 0.86, 1.0, 11, 0, 2.8, 0.68);
      ADD.don[iw] = -wa; ADD.donh[iw] = 0;
    }
    var sonKanat = !!(v && v.kalan === 0);
    halka(ax, ay, 0.34, 2.35, 0.42, 0.86, 0.72, 1.0, 0, 1.05);
    if (sonKanat) {
      halka(px, py - 0.1, 0.24, 2.55, 0.46, 1.0, 0.96, 0.84, 0.04, 1.05);
    } else {
      halka(ax, ay, 0.22, 1.75, 0.36, 1.0, 0.90, 0.52, 0.05, 1.05);
    }
    // parlayan altın-mor yıldızcık patlaması
    for (var k = 0; k < 6; k++) {
      var ak = (k / 6) * 6.283 + Math.random() * 0.35;
      var vk = 3.2 + Math.random() * 2.2;
      var altin = (k % 2 === 0);
      var ip = yay(ADD, ax + Math.cos(ak) * 0.2, ay + Math.sin(ak) * 0.2, 0.55,
        Math.cos(ak) * vk - (vx / vLen) * 0.8 + vx * 0.45, Math.sin(ak) * vk - 0.3 + vy * 0.3, 0,
        0.46 + Math.random() * 0.20, 0.44, 0.08,
        altin ? 1.0 : 0.78, altin ? 0.90 : 0.54, altin ? 0.42 : 1.0, 1, 1.2, 2.4, 0.95);
      ADD.donh[ip] = (k % 2 ? -1 : 1) * (3.5 + Math.random() * 2.5);
    }
    // son kanat çırpışında sade inci-altın yıldızcık vurgusu
    if (sonKanat) {
      for (var s0 = 0; s0 < 4; s0++) {
        var as0 = (s0 / 4) * 6.283 + Math.random() * 0.3;
        var vs0 = 2.6 + Math.random() * 1.8;
        var inci = (s0 % 2 === 0);
        var is0 = yay(ADD, px + Math.cos(as0) * 0.24, py - 0.1 + Math.sin(as0) * 0.24, 0.65,
          Math.cos(as0) * vs0, Math.sin(as0) * vs0 + 0.35, 0,
          0.54 + Math.random() * 0.18, 0.50, 0.06,
          1.0, inci ? 0.98 : 0.88, inci ? 0.90 : 0.48, 1, 0.7, 2.0, 0.95);
        ADD.donh[is0] = (s0 % 2 ? 1 : -1) * (4.0 + Math.random() * 2.2);
      }
    }
    // parlayan altın-mor tüy patlaması (NOR)
    for (var i = 0; i < 4; i++) {
      var a = (i / 4) * 6.283 + Math.random() * 0.32, s = 2.3 + Math.random() * 1.3;
      var mor = i % 2;
      var ii = yay(NOR, ax + Math.cos(a) * 0.35, ay + Math.sin(a) * 0.35, 0.6,
        Math.cos(a) * s, Math.sin(a) * s * 0.85, 0, 1.10, 0.34, 0.26,
        mor ? 0.76 : 1.0, mor ? 0.58 : 0.88, mor ? 1.0 : 0.46, 5, 2.0, 2.2, 0.94);
      NOR.don[ii] = a; NOR.donh[ii] = (Math.random() - 0.5) * 4.5;
    }
  }
  var GOKKUSAGI = [[1, 0.42, 0.42], [1, 0.66, 0.3], [1, 0.9, 0.35], [0.45, 0.88, 0.5], [0.42, 0.7, 1], [0.7, 0.5, 1]];
  function onYildiz(v) {
    if (!v) return;
    var i = v.i | 0; if (i < 0 || i >= YN) return;
    var x = (v.x !== undefined) ? v.x : yX[i], y = (v.y !== undefined) ? v.y : yY[i];
    yDurum[i] = 0; yOlcek[i] = 1.45; yGecik[i] = 0; yYak[i] = 0; yYol[i] = 0;
    // art arda toplamada efekt büyür: 1. yıldız sade, 5. yıldız en coşkulu
    var sr = Math.max(1, Math.min(5, v.toplam | 0 || 1)), cf = 0.82 + 0.11 * sr;
    halka(x, y, 0.4, 2.5 * cf, 0.44, 1, 0.86, 0.3);
    halka(x, y, 0.25, 1.65 * cf, 0.34, 1, 0.96, 0.65, 0.05);
    if (sr >= 3) halka(x, y, 0.3, 3.1 * cf, 0.52, 1, 0.74, 0.86, 0.11);   // 3. yıldızdan sonra pembe ek halka
    var pn = 8 + 2 * sr;
    for (var p = 0; p < pn; p++) {
      var ap = (p / pn) * 6.283 + Math.random() * 0.4, vp = 5.2 * cf * (0.58 + Math.random() * 0.6);
      var bp = (0.28 + (p % 3) * 0.11 + Math.random() * 0.08) * (0.9 + 0.08 * sr);
      var sic = (p % 3 === 0) ? 1 : (p % 3 === 1 ? 0.5 : 0);
      var ip = yay(ADD, x, y, 0.5, Math.cos(ap) * vp, Math.sin(ap) * vp, 0,
        0.55 + Math.random() * 0.35, bp, bp * 0.06,
        1.0, 0.88 + 0.09 * sic, 0.44 + 0.32 * sic, 1, 1.5, 2.6, 0.94);
      ADD.donh[ip] = (p % 2 ? 1 : -1) * (2.6 + Math.random() * 2.4);
    }
    for (var q = 0; q < 6; q++) {      // küçük altın benekler ve minik yıldızlar hafifçe düşer
      var a = Math.random() * 6.283, s = 1.8 + Math.random() * 2.2;
      var yT = (q % 2 === 0) ? 1 : 0;
      var bq = (yT ? 0.24 : 0.18) + (q % 3) * 0.07 + Math.random() * 0.06;
      var tq = (q % 3) * 0.5;
      var iq = yay(ADD, x, y, 0.4, Math.cos(a) * s, Math.sin(a) * s + 1.2, 0,
        0.82 + Math.random() * 0.32, bq, 0.02,
        1.0, 0.84 + 0.12 * tq, 0.36 + 0.34 * tq, yT, 4, 1.5, 0.90);
      if (yT) ADD.donh[iq] = (q % 4 === 0 ? 1 : -1) * 3.8;
    }
    var yv = yay(ADD, x, y, 0.45, 0, 0, 0, 0.34, 0.85, 1.65 * cf, 1, 0.96, 0.82, 1, 0, 0, 0.90);
    ADD.donh[yv] = 1.6;
    uAkt[i] = 1; uT[i] = 0; uIzTimer[i] = 0; uSx[i] = x; uSy[i] = y; sayacOlc(i, v.toplam);
    // beşinci yıldız: gökkuşağı halkası
    if (v.toplam === 5) {
      for (var k = 0; k < 3; k++) {
        var c = GOKKUSAGI[(k * 2) % GOKKUSAGI.length];
        halka(x, y, 0.6 + k * 0.22, 4.0 + k * 0.55, 1.0, 0.84 * c[0] + 0.16, 0.84 * c[1] + 0.14, 0.84 * c[2] + 0.08, 0.10 + k * 0.07);
      }
      for (k = 0; k < 12; k++) {
        var c2 = GOKKUSAGI[k % 6], an = k / 12 * 6.283, sp2 = 5.8 + Math.random() * 2;
        var b5 = 0.38 + (k % 3) * 0.10 + Math.random() * 0.08;
        var ii = yay(ADD, x, y, 0.5, Math.cos(an) * sp2, Math.sin(an) * sp2, 0, 0.95, b5, 0.03,
          0.84 * c2[0] + 0.16, 0.84 * c2[1] + 0.14, 0.84 * c2[2] + 0.08, 1, 1, 2.2, 0.92);
        ADD.donh[ii] = (k % 2 ? 1 : -1) * (2.6 + Math.random() * 1.4);
      }
      for (k = 0; k < 16; k++) {        // beşinci yıldızda havada küçük konfeti yağmuru
        var c3 = KONFETI[k % KONFETI.length], a3 = 0.25 + (k / 15) * 2.64, s3 = 3.2 + Math.random() * 3.0, bk = 0.16 + Math.random() * 0.07;
        var kk3 = yay(NOR, x, y, 0.4, Math.cos(a3) * s3, Math.sin(a3) * s3 + 1.0, 0, 2.0 + Math.random() * 0.6, bk, bk,
          c3[0], c3[1], c3[2], (k % 3 === 0) ? 7 : 3, 2.2, 1.6, 0.96);
        NOR.donh[kk3] = (Math.random() - 0.5) * 7;
      }
    }
  }
  // sekme efekti gerçek yüzeyin üstünde çıksın: en yakın mantar/bulut/nilüferin değme noktasını bul
  var _yuz = { x: 0, y: 0 };
  // kamera uzaktayken (dikey ekran) yassı su halkaları biraz daha geniş açılsın
  function yolKf2() { var z = (typeof camera !== 'undefined' && camera) ? Math.abs(camera.position.z) : 30; return Math.max(1, Math.min(1.5, z / 30)); }
  function yuzeyNokta(liste, x, y, nilufer) {
    _yuz.x = x; _yuz.y = y;
    if (!liste || !liste.length || !pVar()) return _yuz;
    var en = null, enD = 1e9;
    for (var k = 0; k < liste.length; k++) {
      var o = liste[k]; if (!o) continue;
      var d = Math.hypot(P.x - o.x, P.y - o.y) - (o.r || 1.5);
      if (d < enD) { enD = d; en = o; }
    }
    if (!en || enD > 2.5) return _yuz;
    var r = en.r || 1.5;
    if (nilufer) {                      // nilüfer yaprağı yassı: suyun/yaprağın hemen üstü
      _yuz.x = Math.max(en.x - r * 0.85, Math.min(en.x + r * 0.85, P.x));
      _yuz.y = en.y + 0.12;
    } else {
      var dx = P.x - en.x, dy = P.y - en.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
      _yuz.x = en.x + dx / l * r * 0.92; _yuz.y = en.y + dy / l * r * 0.92;
    }
    return _yuz;
  }
  function onSek(v) {
    if (!v) return;
    var x = v.x, y = v.y, tur = v.tur, i, ii, a, s;
    var bv = aktifBolum;
    if (bv && !(bv.mantarlar || bv.bulutlar || bv.niluferler) && typeof BOLUMLER !== 'undefined' && BOLUMLER) {
      var bix = (bv.idx != null) ? bv.idx : ((bv.no || bv.bolum || 1) - 1);
      bv = BOLUMLER[bix] || null;
    }
    if (bv && (tur === 'mantar' || tur === 'bulut' || tur === 'nilufer')) {
      var yz = yuzeyNokta(tur === 'mantar' ? bv.mantarlar : tur === 'bulut' ? bv.bulutlar : bv.niluferler, x, y, tur === 'nilufer');
      x = yz.x; y = yz.y;
    }
    if (tur === 'mantar') {
      // "boing": iki sıcak kırmızı-altın halka + benekli puf + sıcak pırıltılar
      halka(x, y, 0.32, 2.75, 0.54, 1.0, 0.56, 0.32);
      halka(x, y, 0.24, 2.00, 0.46, 1.0, 0.86, 0.48, 0.09);
      halka(x, y + 0.1, 0.5, 3.2, 0.42, 1.0, 0.94, 0.80, 0.03, 1.25);   // şapkanın üstünde yatık "yay" halkası
      for (i = 0; i < 14; i++) {        // spor tozu: altın-krem benekler kabarıp yavaşça yükselir, süzülür
        var spA = 0.3 + Math.random() * 2.54, spS = 1.4 + Math.random() * 2.2;
        var spi = yay(i % 2 ? ADD : NOR, x + (Math.random() - 0.5) * 1.8, y + 0.1 + Math.random() * 0.3, 0.5,
          Math.cos(spA) * spS, Math.sin(spA) * spS * 0.8 + 0.6, 0,
          1.3 + Math.random() * 0.7, i % 2 ? 0.34 + Math.random() * 0.14 : 0.16 + Math.random() * 0.08, i % 2 ? 0.12 : 0.12,
          1.0, i % 2 ? 0.88 : 0.95, i % 2 ? 0.55 : 0.80, i % 2 ? 0 : 7, -0.35, 1.9, 0.95);
        if (!(i % 2)) NOR.donh[spi] = (Math.random() - 0.5) * 3;
      }
      for (i = 0; i < 7; i++) {
        a = 0.35 + Math.random() * 2.44; s = 2 + Math.random() * 3;
        var kir = (i % 3 !== 0);
        ii = yay(NOR, x, y, 0.5, Math.cos(a) * s, Math.sin(a) * s, 0, 0.78, 0.32, 0.18, kir ? 0.93 : 1, kir ? 0.2 : 1, kir ? 0.22 : 1, 7, 9, 1.2, 1);
      }
      for (i = 0; i < 3; i++) {
        a = 0.3 + Math.random() * 2.5; s = 1 + Math.random() * 1.5;
        yay(NOR, x + Math.cos(a) * 0.6, y + 0.1, 0.4, Math.cos(a) * s, Math.sin(a) * s * 0.6, 0, 0.75, 0.5, 1.0, 1, 0.94, 0.92, 2, 0, 2.5, 0.72);
      }
      for (i = 0; i < 5; i++) {
        a = 0.4 + (i / 4) * 2.34 + (Math.random() - 0.5) * 0.2; s = 2.0 + Math.random() * 2.4;
        var altin = (i % 2 === 0);
        ii = yay(ADD, x + (Math.random() - 0.5) * 0.6, y + 0.12, 0.56, Math.cos(a) * s, Math.sin(a) * s + 0.4, 0,
          0.52 + Math.random() * 0.16, 0.30 + Math.random() * 0.10, 0.05,
          1.0, altin ? 0.82 : 0.46, altin ? 0.34 : 0.24, 1, 5.2, 1.4, 0.85);
        ADD.donh[ii] = (i % 2 ? -1 : 1) * 3.4;
      }
    } else if (tur === 'cali') {
      halka(x, y, 0.3, 1.8, 0.45, 0.8, 0.95, 0.6);
      for (i = 0; i < 7; i++) {
        a = 0.3 + Math.random() * 2.5; s = 1.8 + Math.random() * 2.2;
        ii = yay(NOR, x + (Math.random() - 0.5) * 0.8, y + 0.1, 0.6, Math.cos(a) * s, Math.sin(a) * s, 0, 0.95, 0.3, 0.26,
          0.42 + Math.random() * 0.15, 0.72 + Math.random() * 0.12, 0.3, 5, 5, 1.5, 1);
        NOR.donh[ii] = (Math.random() - 0.5) * 7;
      }
    } else if (tur === 'bulut') {
      // yumuşak pembe-inci çift halka + bulut pufu + inci pırıltılar
      halka(x, y, 0.3, 2.5, 0.54, 1.0, 0.86, 0.94);
      halka(x, y, 0.22, 1.9, 0.46, 1.0, 0.96, 0.99, 0.09);
      for (i = 0; i < 12; i++) {       // pofuduk bulut parçaları: iri, yuvarlak, yana ve aşağı kabarıp erir
        a = (i / 11) * Math.PI + (Math.random() - 0.5) * 0.3; s = 1.6 + Math.random() * 2.0;
        var pb = 0.75 + Math.random() * 0.4;
        yay(NOR, x + Math.cos(a) * 0.7, y + (Math.random() - 0.4) * 0.4, 0.5, Math.cos(a) * s, -Math.abs(Math.sin(a)) * s * 0.35 - 0.3, 0,
          0.95 + Math.random() * 0.4, pb, pb * 1.55, (i % 3 === 0) ? 0.80 : 1, (i % 3 === 0) ? 0.86 : 0.96 - 0.04 * (i % 2), (i % 3 === 0) ? 0.98 : 0.99, 2, 0, 2.4, 0.96);
      }
      for (i = 0; i < 4; i++) {        // yukarı zıplayan minik pamuk topları
        yay(NOR, x + (Math.random() - 0.5) * 1.2, y + 0.3, 0.55, (Math.random() - 0.5) * 2.4, 3 + Math.random() * 1.6, 0,
          0.9, 0.36 + Math.random() * 0.14, 0.22, 1, 0.9, 0.96, 2, 6, 0.6, 0.95);
      }
      for (i = 0; i < 5; i++) {
        a = 0.35 + (i / 4) * 2.44 + (Math.random() - 0.5) * 0.2; s = 1.5 + Math.random() * 2.0;
        var pembe = (i % 2 === 0);
        ii = yay(ADD, x + (Math.random() - 0.5) * 1.1, y + (Math.random() - 0.2) * 0.35, 0.56, Math.cos(a) * s, Math.sin(a) * s * 0.55 + 0.35, 0,
          0.58 + Math.random() * 0.18, 0.28 + Math.random() * 0.10, 0.04,
          1.0, pembe ? 0.74 : 0.94, pembe ? 0.88 : 0.98, 1, 1.8, 1.5, 0.84);
        ADD.donh[ii] = (i % 2 ? -1 : 1) * 3.0;
      }
    } else if (tur === 'nilufer') {
      // zarif su tacı: iki katmanlı su halkası + kristal damlacıklar + ince su serpintisi
      halka(x, y + 0.06, 0.28, 2.55 * yolKf2(), 0.60, 0.46, 0.90, 1.0, 0, 1.25);
      halka(x, y + 0.06, 0.20, 1.85, 0.50, 0.76, 0.96, 1.0, 0.09, 1.25);
      halka(x, y + 0.04, 0.30, 3.30 * yolKf2(), 0.80, 0.55, 0.88, 1.0, 0.22, 1.35);   // geç açılan geniş su halkası
      halka(x, y + 0.04, 0.25, 2.60 * yolKf2(), 0.70, 0.80, 0.97, 1.0, 0.40, 1.35);
      for (i = 0; i < 5; i++) {        // ortadan yükselen su sütunu damlaları
        yay(NOR, x + (Math.random() - 0.5) * 0.3, y + 0.15, 0.6, (Math.random() - 0.5) * 0.9, 5.5 + Math.random() * 2.2, 0,
          0.85, 0.40 + Math.random() * 0.12, 0.16, 0.62, 0.92, 1.0, 7, 12, 0.5, 0.95);
      }
      for (i = 0; i < 11; i++) {
        var uDam = i / 10;
        var tepe = Math.sin(uDam * Math.PI);
        a = 0.42 + uDam * 2.30 + (Math.random() - 0.5) * 0.16;
        s = 2.4 + 2.5 * tepe + Math.random() * 1.3;
        var inci = i % 3 === 0;
        yay(NOR, x + (uDam - 0.5) * 0.85, y + 0.08, 0.55, Math.cos(a) * s, Math.sin(a) * s, 0,
          0.74 + 0.22 * tepe + Math.random() * 0.16, inci ? 0.20 + Math.random() * 0.08 : 0.28 + Math.random() * 0.10, 0.06,
          inci ? 0.95 : 0.52, inci ? 0.99 : 0.90, 1.0, 7, 11.2, 0.75, 0.92);
      }
      for (i = 0; i < 5; i++) {
        var sa = 0.55 + (i / 4) * 2.04 + (Math.random() - 0.5) * 0.18, ss = 2.1 + Math.random() * 2.2;
        var su = yay(ADD, x + (Math.random() - 0.5) * 0.65, y + 0.14, 0.58, Math.cos(sa) * ss, Math.sin(sa) * ss, 0,
          0.52, 0.30 + Math.random() * 0.10, 0.04, 0.80, 0.98, 1.0, 1, 7.8, 1.1, 0.80);
        ADD.donh[su] = (i % 2 ? -1 : 1) * 3.6;
      }
      for (i = 0; i < 2; i++) {
        yay(NOR, x + (Math.random() - 0.5) * 0.85, y + 0.12, 0.48, (Math.random() - 0.5) * 1.2, 0.7 + Math.random() * 0.7, 0,
          0.50, 0.36, 0.78, 0.88, 0.98, 1.0, 2, 0, 2.3, 0.40);
      }
    } else {
      halka(x, y + 0.08, 0.4, 2.0, 0.5, 0.95, 0.97, 0.85, 0, 1.25);
      for (i = 0; i < 6; i++) {
        a = 0.5 + Math.random() * 2.1; s = 2 + Math.random() * 3;
        ii = yay(NOR, x, y + 0.05, 0.5, Math.cos(a) * s * 0.7, Math.sin(a) * s, 0, 0.7, 0.34, 0.2, 0.36, 0.72, 0.25, 8, 10, 1, 1);
        NOR.don[ii] = (Math.random() - 0.5) * 1.2; NOR.donh[ii] = (Math.random() - 0.5) * 6;
      }
      for (i = 0; i < 4; i++) {        // çiçek yaprakları
        a = 0.6 + Math.random() * 1.9; s = 2 + Math.random() * 2;
        var pm = i % 2;
        ii = yay(NOR, x, y + 0.1, 0.6, Math.cos(a) * s, Math.sin(a) * s, 0, 0.95, 0.24, 0.2, 1, pm ? 0.7 : 1, pm ? 0.82 : 0.97, 5, 5, 1.5, 1);
        NOR.donh[ii] = (Math.random() - 0.5) * 7;
      }
      for (i = 0; i < 7; i++) {        // yumuşak toz pufları: iki yana yayılıp kabarır
        var ty = (i % 2 ? 1 : -1), ts = 1.6 + Math.random() * 2.0;
        yay(NOR, x + ty * (0.2 + Math.random() * 0.4), y + 0.5 + Math.random() * 0.25, 0.9, ty * ts, 0.6 + Math.random() * 0.8, 0,
          0.75 + Math.random() * 0.3, 0.5 + Math.random() * 0.2, 1.2 + Math.random() * 0.3, 0.97, 0.92, 0.80, 2, 0, 2.6, 0.9);
      }
      for (i = 0; i < 4; i++) {        // ek çimen parçaları
        a = 0.7 + Math.random() * 1.7; s = 2.5 + Math.random() * 2;
        ii = yay(NOR, x + (Math.random() - 0.5) * 0.6, y + 0.05, 0.5, Math.cos(a) * s * 0.7, Math.sin(a) * s, 0, 0.75, 0.38, 0.24, 0.42, 0.78, 0.30, 8, 10, 1, 1);
        NOR.don[ii] = (Math.random() - 0.5) * 1.4; NOR.donh[ii] = (Math.random() - 0.5) * 7;
      }
    }
  }
  // rüzgâr akımı: girişte serin bir "vuuş" girdabı, içindeyken Pırıl'ın çevresinde yukarı akan şeritler
  var ruzSonT = -9;
  function onRuzgar(v) {
    if (!pVar()) return;
    var x = P.x, y = P.y, vx = P.vx || 0, vy = P.vy || 0, i, ii;
    var giris = (zaman - ruzSonT) > 0.6;
    ruzSonT = zaman;
    for (i = 0; i < 4; i++) {           // Pırıl'la birlikte yükselen akış şeritleri
      var sx = (i - 1.5) * 0.55 + (Math.random() - 0.5) * 0.2;
      ii = yay(ADD, x + sx, y - 0.9 - Math.random() * 0.6, 0.6, vx * 0.85, vy * 0.85 + 6.5 + Math.random() * 2, 0,
        0.42, 1.6 + Math.random() * 0.5, 0.8, 0.82, 0.98, 1.0, 11, 0, 1.2, 0.95);
      ADD.don[ii] = -Math.PI / 2 - sx * 0.12; ADD.donh[ii] = 0;
    }
    if (giris) {
      halka(x, y, 0.4, 2.6, 0.45, 0.70, 0.95, 1.0);
      halka(x, y - 0.4, 0.3, 2.0, 0.5, 0.86, 1.0, 0.96, 0.08, 1.15);
      for (i = 0; i < 10; i++) {        // girdap: Pırıl'ın çevresinde dönerek yükselen pırıltılar
        var ga = (i / 10) * 6.283, gr = 0.9;
        ii = yay(ADD, x + Math.cos(ga) * gr, y + Math.sin(ga) * gr * 0.5, 0.6,
          vx * 0.7 - Math.sin(ga) * 3.2, vy * 0.7 + Math.cos(ga) * 1.6 + 3.0, 0,
          0.6 + Math.random() * 0.2, 0.36, 0.06, i % 2 ? 0.80 : 1.0, i % 2 ? 0.96 : 0.98, 1.0, 1, 0, 1.4, 0.95);
        ADD.donh[ii] = 4;
      }
      for (i = 0; i < 4; i++) {         // savrulan yapraklar
        ii = yay(NOR, x + (Math.random() - 0.5) * 1.6, y - 0.6, 0.5, vx * 0.6 + (Math.random() - 0.5) * 3, vy * 0.6 + 4 + Math.random() * 2, 0,
          1.1, 0.26, 0.2, 0.58, 0.9, 0.55, 5, 1.5, 1.2, 0.95);
        NOR.donh[ii] = (Math.random() - 0.5) * 8;
      }
    }
  }
  // kanat hakkı bitince dokunuş: kızdırmayan, tatlı minik tüyler ve bir kalp
  function onKanatBos(v) {
    if (!pVar()) return;
    var x = (v && v.x !== undefined) ? v.x : P.x, y = (v && v.y !== undefined) ? v.y : P.y;
    for (var i = 0; i < 3; i++) {
      var a = 1.2 + i * 0.4, s = 1.2 + Math.random() * 0.8;
      var ii = yay(NOR, x + (i - 1) * 0.3, y + 0.2, 0.6, Math.cos(a) * s, Math.sin(a) * s, 0, 0.9, 0.26, 0.2,
        i === 1 ? 1.0 : 0.80, i === 1 ? 0.88 : 0.62, i === 1 ? 0.5 : 1.0, 5, 1.8, 1.8, 0.92);
      NOR.don[ii] = a; NOR.donh[ii] = (Math.random() - 0.5) * 4;
    }
    var k = yay(NOR, x, y + 0.6, 0.7, 0, 0.9, 0, 0.9, 0.16, 0.26, 1, 0.6, 0.78, 4, 0, 1.5, 0.85);
    NOR.don[k] = 0; NOR.donh[k] = 0;
  }
  function onIska(v) {
    var x = (v && v.x !== undefined) ? v.x : (pVar() ? P.x : 0);
    var y = yerY() + 0.2;
    // komik "puf!" toz bulutu: yuvarlak toplar yarım daire halinde kabarır, biri tepeye zıplar
    for (var i = 0; i < 9; i++) {
      var ua = (i / 8) * Math.PI, us = 1.3 + Math.random() * 0.8;
      var ub = 0.55 + Math.random() * 0.25 + (i === 4 ? 0.2 : 0);
      yay(NOR, x + Math.cos(ua) * 0.55, y + 0.35 + Math.sin(ua) * 0.4, 0.9, Math.cos(ua) * us, Math.sin(ua) * us * 0.7 + 0.2, 0,
        0.95 + Math.random() * 0.3, ub, ub * 1.8, 0.98, 0.95, 0.88, 2, 0, 2.8, 0.95);
    }
    var tep = yay(NOR, x, y + 0.6, 0.65, 0, 3.4, 0, 0.9, 0.38, 0.5, 0.97, 0.95, 0.88, 2, 5, 0.6, 0.9);
    NOR.donh[tep] = 0;
    for (i = 0; i < 3; i++) {           // tepeden fırlayan minik sarı yıldızcıklar (tatlı, olumsuz değil)
      var ys2 = yay(ADD, x + (i - 1) * 0.35, y + 0.7, 0.7, (i - 1) * 1.6, 3.2 + Math.random(), 0, 0.8, 0.42, 0.2, 1, 0.9, 0.45, 1, 6, 0.6, 0.95);
      ADD.donh[ys2] = (i - 1 || 1) * 4;
    }
    for (i = 0; i < 9; i++) {           // papatya yaprakları (beyaz, birkaç sarı benek)
      var a = 0.5 + Math.random() * 2.1, s = 2 + Math.random() * 2.5, sari = i % 4 === 0;
      var ii = yay(NOR, x, y, 0.7, Math.cos(a) * s, Math.sin(a) * s, 0, 1.2, sari ? 0.2 : 0.3, sari ? 0.18 : 0.26, 1, sari ? 0.86 : 1, sari ? 0.3 : 0.97, sari ? 7 : 5, 5, 1.5, 1);
      NOR.donh[ii] = (Math.random() - 0.5) * 7;
    }
    for (i = 0; i < 5; i++) {
      var a2 = 0.6 + Math.random() * 1.9, s2 = 1.5 + Math.random() * 2;
      var j = yay(NOR, x, y - 0.1, 0.65, Math.cos(a2) * s2, Math.sin(a2) * s2, 0, 0.6, 0.32, 0.2, 0.4, 0.75, 0.28, 8, 10, 1, 1);
      NOR.don[j] = (Math.random() - 0.5) * 1.2;
    }
  }
  var kavusSure = 0, KAVUS_T = 3.0;
  var KONFETI = [[1, 0.8, 0.2], [1, 0.45, 0.68], [0.64, 0.46, 0.96], [0.32, 0.84, 0.64], [0.36, 0.74, 1], [1, 0.62, 0.26], [1, 0.92, 0.56], [0.98, 0.58, 0.84]];
  // kavuşma coşkusu: 5 yıldızda daha büyük; son bölümde (BOLUMLER.length) havai fişek finali
  var kavusYildiz = 0, kavusFinal = false, fisekT = 0, fisekSay = 0;
  function fisekPatlat(x, y, buyuk) {
    var c = KONFETI[(Math.random() * KONFETI.length) | 0], c2 = KONFETI[(Math.random() * KONFETI.length) | 0];
    var n = buyuk ? 26 : 18, hz = buyuk ? 6.2 : 5.0;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * 6.283 + Math.random() * 0.2, s = hz * (0.75 + Math.random() * 0.35), cc = (i % 2) ? c : c2;
      var ii = yay(ADD, x, y, 0.3, Math.cos(a) * s, Math.sin(a) * s, 0, 0.85 + Math.random() * 0.3, (i % 2 === 0) ? 0.85 : 0.62, 0.10,
        cc[0], cc[1], cc[2], (i % 2 === 0) ? 1 : 0, 1.0, 2.2, 1.0);
      ADD.donh[ii] = (i % 2 ? 1 : -1) * 3.0;
    }
    yay(ADD, x, y, 0.3, 0, 0, 0, 0.30, 1.2, 2.6, c[0] * 0.8, c[1] * 0.8, c[2] * 0.8, 0, 0, 0, 0.45);
    halka(x, y, 0.4, buyuk ? 3.6 : 2.8, 0.5, 0.5 + 0.5 * c[0], 0.5 + 0.5 * c[1], 0.5 + 0.5 * c[2]);
  }
  function onKavus(v) {
    kavusYildiz = (v && v.yildiz) | 0;
    var sonIdx = (typeof BOLUMLER !== 'undefined' && BOLUMLER && BOLUMLER.length) ? BOLUMLER.length - 1 : -1;
    kavusFinal = !!(v && sonIdx >= 0 && v.bolumIdx === sonIdx);
    fisekT = 0.25; fisekSay = 0;
    kavusSure = kavusFinal ? 7.4 : (kavusYildiz >= 5 ? 4.2 : KAVUS_T);
    var h = hedef(), x = pVar() ? P.x : h.x, y = pVar() ? P.y : h.y + 1;
    if (kavusYildiz >= 5 || kavusFinal) {          // 5 yıldız: gökkuşağı halkaları + iki yandan konfeti topu
      for (var gk = 0; gk < 3; gk++) {
        var gc = GOKKUSAGI[(gk * 2 + 1) % GOKKUSAGI.length];
        halka((x + h.x) * 0.5, h.y + 1.4, 1.0 + gk * 0.3, 5.5 + gk * 0.8, 1.2, 0.8 * gc[0] + 0.2, 0.8 * gc[1] + 0.2, 0.8 * gc[2] + 0.2, 0.12 + gk * 0.1);
      }
      for (var yn = -1; yn <= 1; yn += 2) {
        for (var kb = 0; kb < 14; kb++) {
          var kc5 = KONFETI[kb % KONFETI.length], ka = Math.PI / 2 - yn * (0.35 + Math.random() * 0.5), ks = 6 + Math.random() * 3.5;
          var kb5 = 0.16 + Math.random() * 0.07;
          var kx5 = yay(NOR, (x + h.x) * 0.5 + yn * 3.2, h.y + 0.3, 0.6, Math.cos(ka) * ks, Math.sin(ka) * ks, 0,
            3.2 + Math.random() * 0.8, kb5, kb5, kc5[0], kc5[1], kc5[2], (kb % 3 === 0) ? 7 : 3, 4.2, 1.4, 0.96);
          NOR.donh[kx5] = (Math.random() - 0.5) * 7;
        }
      }
    }
    halka(x, y, 1.2, 3.0, 0.3, 1, 0.82, 0.35);            // hızla açılır, yüzleri örtmez
    // yerde ışık halkası (yatık)
    var ox = (x + h.x) * 0.5;
    halka(ox, h.y + 0.06, 0.8, 5.0, 1.5, 1, 0.86, 0.45, 0.05, 1.3);
    for (var q = 0; q < 10; q++) {                         // pırıltılar başların çevresinden dışa
      var aq = q / 10 * 6.283, vq = 3.2 + Math.random() * 1.4;
      var iq = yay(ADD, x + Math.cos(aq) * 1.5, y + 0.5 + Math.sin(aq) * 1.5, 0.6, Math.cos(aq) * vq, Math.sin(aq) * vq + 0.3, 0, 0.88, 0.40, 0.03, 1, 0.87, 0.48, 1, 1.1, 2.4, 0.84);
      ADD.donh[iq] = 2.2;
    }
    // Pırıl ile Bilbo'nun ortasından yükselen yumuşak altın pırıltılar
    for (var qp = 0; qp < 5; qp++) {
      var ip = yay(ADD, ox + (Math.random() - 0.5) * 1.1, h.y + 1.3 + Math.random() * 0.55, 0.75,
        (Math.random() - 0.5) * 0.34, 0.52 + Math.random() * 0.42, 0,
        1.7 + Math.random() * 0.6, 0.13, 0.26, 1, 0.88, 0.48, 1, -0.14, 0.65, 0.72);
      ADD.donh[ip] = (Math.random() - 0.5) * 1.6;
    }
    // küçük pembe kalpler: iki karakterin ortasından doğar, zarifçe süzülerek yükselir
    var ust = h.y + 1.9;
    for (var i = 0; i < 5; i++) {
      var yon = (i - 2) / 2;
      var k = yay(NOR, ox + yon * 0.55, ust + (i % 2) * 0.35, 0.85, yon * 0.28, 0.38 + (i % 3) * 0.10, 0,
        2.7, 0.16 + (i % 3) * 0.03, 0.27 + (i % 2) * 0.04, 1, 0.58 + (i % 2) * 0.12, 0.76 + (i % 2) * 0.06, 4, -0.16, 0.55, 0.78);
      NOR.don[k] = -yon * 0.18;
      NOR.donh[k] = -yon * 0.12;
    }
    // ilk kutlama konfetisi patlaması: yukarı-yanlara yumuşakça açılıp süzülür
    for (i = 0; i < 16; i++) {
      var kc = KONFETI[i % KONFETI.length];
      var kPul = (i % 3 === 0);
      var kAng = 0.42 + (i / 15) * 2.30 + (Math.random() - 0.5) * 0.22;
      var kSpd = 2.6 + Math.random() * 2.4;
      var kBoy = kPul ? (0.10 + Math.random() * 0.04) : (0.15 + Math.random() * 0.06);
      var ki = yay(NOR, ox + (Math.random() - 0.5) * 1.8, h.y + 1.5 + Math.random() * 0.9, 0.45 + Math.random() * 1.0,
        Math.cos(kAng) * kSpd, Math.sin(kAng) * kSpd + 0.6, 0,
        3.0 + Math.random() * 1.0, kBoy, kBoy, kc[0], kc[1], kc[2], kPul ? 7 : 3, 1.25, 1.8, 0.96);
      NOR.donh[ki] = (Math.random() - 0.5) * 6.5;
    }
  }
  function kavusGuncelle(dt) {
    if (kavusSure <= 0) return;
    kavusSure -= dt;
    var h = hedef(), cx = pVar() ? P.x : h.x, ox = (cx + h.x) * 0.5;
    var yog = Math.max(0, Math.min(1, kavusSure / 1.5));   // son 1,5 sn'de yavaşça seyrelir; 3 sn'de biter
    yog = yog * yog * (3 - 2 * yog);
    if (kavusFinal && kavusSure > 0.9) {        // son bölüm: başların çok üstünde peş peşe havai fişekler
      fisekT -= dt;
      if (fisekT <= 0) {
        fisekSay++;
        fisekT = 0.28 + Math.random() * 0.18;
        // ekranın üst yarısında, iki yanda patlasın (yüzlerin üstünde değil)
        var cxF = ox, cyF = h.y + 3, yarH = 4, yarW = 6;
        if (typeof camera !== 'undefined' && camera) {
          yarH = Math.abs(camera.position.z) * Math.tan((camera.fov || 45) * Math.PI / 360);
          yarW = yarH * (camera.aspect || 1.4);
          cxF = camera.position.x; cyF = camera.position.y;
        }
        var yanF = (fisekSay % 2 ? -1 : 1) * yarW * (0.32 + Math.random() * 0.38);
        fisekPatlat(cxF + yanF, cyF + yarH * (0.45 + Math.random() * 0.28), fisekSay % 4 === 0);
      }
    }
    var sonA = 0.45 + 0.55 * yog;
    var n = 0;
    if (Math.random() < 36 * dt * yog) n++;
    if (Math.random() < 36 * dt * yog) n++;
    for (var i = 0; i < n; i++) {
      var c = KONFETI[(Math.random() * KONFETI.length) | 0];
      var pul = Math.random() < 0.36;
      var boy = pul ? (0.10 + Math.random() * 0.05) : (0.15 + Math.random() * 0.07);
      var ii = yay(NOR, cx + (Math.random() - 0.5) * 13, h.y + 5.8 + Math.random() * 4.2, 0.3 + Math.random() * 1.2,
        (Math.random() - 0.5) * 1.4, -0.35 - Math.random() * 0.75, 0,
        3.4 + Math.random() * 1.1, boy, boy, c[0], c[1], c[2], pul ? 7 : 3,
        1.15 + Math.random() * 0.45, 1.65 + Math.random() * 0.35, sonA);
      NOR.donh[ii] = (Math.random() - 0.5) * 6.5;
    }
    // Pırıl ile Bilbo'nun ortasından yükselen küçük pembe kalpler (tur = 4)
    if (Math.random() < 2.2 * dt * yog) {
      var hk = yay(NOR, ox + (Math.random() - 0.5) * 1.0, h.y + 1.8 + Math.random() * 0.45, 0.85,
        (Math.random() - 0.5) * 0.28, 0.36 + Math.random() * 0.22, 0,
        2.4 + Math.random() * 0.6, 0.15 + Math.random() * 0.04, 0.25 + Math.random() * 0.05,
        1, 0.58 + Math.random() * 0.14, 0.76 + Math.random() * 0.08, 4, -0.15, 0.58, 0.75 * sonA);
      NOR.don[hk] = (Math.random() - 0.5) * 0.3;
      NOR.donh[hk] = (Math.random() - 0.5) * 0.22;
    }
    // Pırıl ile Bilbo'nun ortasından yükselen altın pırıltılar
    if (Math.random() < 4.5 * dt * yog) {
      var gj = yay(ADD, ox + (Math.random() - 0.5) * 1.2, h.y + 1.25 + Math.random() * 0.55, 0.75,
        (Math.random() - 0.5) * 0.32, 0.48 + Math.random() * 0.36, 0,
        1.5 + Math.random() * 0.5, 0.12 + Math.random() * 0.05, 0.22 + Math.random() * 0.05,
        1, 0.88, 0.48, 1, -0.14, 0.65, 0.70 * sonA);
      ADD.donh[gj] = (Math.random() - 0.5) * 1.8;
    }
    // altın pırıltı yağmuru: yukarıdan yavaşça süzülür (yüzlerin önünde değil, iki yanda)
    if (Math.random() < 10 * dt * yog) {
      var yan = Math.random() < 0.5 ? -1 : 1;
      var j = yay(ADD, h.x - 0.6 + yan * (1.6 + Math.random() * 4), h.y + 4 + Math.random() * 3, 0.8, 0, -0.7, 0, 2.2, 0.36, 0.04, 1, 0.86, 0.42, 1, 0, 0.45, 0.88 * sonA);
      ADD.donh[j] = 1.4;
    }
  }
  function onYeniden() {
    yildizYerleri();
    for (var i = 0; i < yAktifSay; i++) { if (yDurum[i] < 1) { yDurum[i] = 1; yGecik[i] = 0.15 + i * 0.12; } uAkt[i] = 0; }
    for (i = 0; i < bhSay; i++) bhGec[i] = 0;
    kavusSure = 0; yolHedef = 0; izSay = 0; oncSay = 0; oncG = 0; kaySay = 0; kanatIzSure = 0; kanatPirSay = 0; kanatTozSay = 0;
  }
  function onBolum(b) {
    bolumAyarla(b);
    yildizYerleri();
    for (var i = 0; i < yAktifSay; i++) {
      yDurum[i] = 1; yOlcek[i] = 0.01; yGecik[i] = 0.1 + i * 0.1; yYak[i] = 0; uAkt[i] = 0;
    }
    kavusSure = 0; yolHedef = 0; izSay = 0; oncSay = 0; oncG = 0; kaySay = 0; kanatIzSure = 0; kanatPirSay = 0; kanatTozSay = 0;
  }
  function onHalkaGec(v) {
    if (!v) return;
    var x = v.x, y = v.y;
    if (v.i !== undefined && v.i >= 0 && v.i < bhSay) {
      if (bhGec[v.i]) return;
      bhGec[v.i] = 1;
      if (x === undefined) x = bhX[v.i];
      if (y === undefined) y = bhY[v.i];
    }
    if (x !== undefined && y !== undefined) halkaKonfetiPatlat(x, y);
  }

  // dışarıya salt-okunur bilgi (ör. kamera iniş işaretini kadraja alabilir)
  var EFEKT = window.EFEKT = { inis: { x: 0, s: 99, gorunur: 0, hedefYakin: 0 } };

  // ---------- KUR ----------
  window.efektKur = function () {
    if (kuruldu) return; kuruldu = true;
    if (typeof THREE === 'undefined' || typeof scene === 'undefined' || !scene) { kuruldu = false; return; }
    _m4 = new THREE.Matrix4(); _v3a = new THREE.Vector3(); _v3b = new THREE.Vector3(); _q = new THREE.Quaternion();
    _s3 = new THREE.Vector3(); _e = new THREE.Euler(); _v2 = new THREE.Vector2(); _renk = new THREE.Color();
    ana = new THREE.Group(); ana.name = 'efekt';

    ADD = havuz(520, true, true); ADD.bas = 45; ADD.imlec = 45;
    NOR = havuz(400, false, true); NOR.bas = SN; NOR.imlec = SN;
    YOL = havuz(YOL_TOP, false, false);
    for (var k = 0; k < YOL_N; k++) YOL.tur[k] = 6;
    YOL.tur[I_INIS] = 9; YOL.tur[I_INIS_Y] = 1;
    for (k = 0; k < ONC_N; k++) { var o3 = (I_ONC + k) * 3; YOL.tur[I_ONC + k] = 7; YOL.renk[o3] = 0.72; YOL.renk[o3 + 1] = 0.78; YOL.renk[o3 + 2] = 0.98; }
    for (k = 0; k < OK_N; k++) YOL.tur[I_OK + k] = 12;
    for (k = 0; k < INIS_KIV_N; k++) YOL.tur[I_INIS_KIV + k] = 1;
    YOL.tur[I_ONC_INIS] = 9; YOL.renk[I_ONC_INIS * 3] = 0.70; YOL.renk[I_ONC_INIS * 3 + 1] = 0.76; YOL.renk[I_ONC_INIS * 3 + 2] = 0.96;
    YOL.obj.renderOrder = 20; NOR.obj.renderOrder = 6; ADD.obj.renderOrder = 7;
    atesKur(); tohumKur();

    yildizYerleri();
    var ym = [new THREE.MeshStandardMaterial({ color: 0xffd84a, emissive: 0xc48a0a, emissiveIntensity: 1.05, roughness: 0.22, metalness: 0.26 }),
      new THREE.MeshStandardMaterial({ color: 0xffad24, emissive: 0xa66200, emissiveIntensity: 1.0, roughness: 0.28, metalness: 0.30 })];
    yildizMesh = new THREE.InstancedMesh(yildizGeo(), ym, YN * 2);
    yildizMesh.frustumCulled = false; yildizMesh.renderOrder = 2;
    for (var i = 0; i < YN; i++) { yDurum[i] = 1; yOlcek[i] = 1; }
    _m4.makeScale(0, 0, 0); for (i = 0; i < YN * 2; i++) yildizMesh.setMatrixAt(i, _m4);

    var hg = new THREE.PlaneGeometry(2, 2);
    var hm = new THREE.ShaderMaterial({
      vertexShader: 'varying vec2 vU; varying vec3 vC; void main(){ vU=uv*2.0-1.0;\n' +
        '#ifdef USE_INSTANCING_COLOR\n vC=instanceColor;\n#else\n vC=vec3(1.0);\n#endif\n' +
        ' gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0); }',
      fragmentShader: 'varying vec2 vU; varying vec3 vC; void main(){ float r=length(vU);' +
        ' float a=(exp(-pow((r-0.86)*9.0,2.0))+0.18*smoothstep(0.86,0.0,r)*smoothstep(0.0,0.86,r))*smoothstep(1.0,0.90,r); if(a<0.01) discard;' +
        ' float m=max(vC.r,max(vC.g,vC.b)); gl_FragColor=vec4(mix(vC/max(m,0.001),vec3(1.0),0.35),min(1.0,a*m*0.9)); }',
      transparent: true, depthWrite: false, blending: THREE.NormalBlending, side: THREE.DoubleSide
    });
    halkaMesh = new THREE.InstancedMesh(hg, hm, HN);
    _renk.setRGB(0, 0, 0);
    _m4.makeScale(0, 0, 0);
    for (i = 0; i < HN; i++) { halkaMesh.setMatrixAt(i, _m4); halkaMesh.setColorAt(i, _renk); }
    halkaMesh.frustumCulled = false; halkaMesh.renderOrder = 8;

    izKur(); izMesh.renderOrder = 3;
    huzmeKur();

    ana.add(huzmeMesh, ADD.obj, NOR.obj, yildizMesh, halkaMesh, izMesh, YOL.obj);
    scene.add(ana);

    if (typeof OLAY !== 'undefined' && OLAY && OLAY.on) {
      OLAY.on('cek', onCek); OLAY.on('birak', onBirak); OLAY.on('kanat', onKanat);
      OLAY.on('yildiz', onYildiz); OLAY.on('sek', onSek); OLAY.on('iska', onIska);
      OLAY.on('kavus', onKavus); OLAY.on('yeniden', onYeniden); OLAY.on('bolum', onBolum);
      OLAY.on('halka', onHalkaGec); OLAY.on('halkaGec', onHalkaGec);
      OLAY.on('izKaydet', onIzKaydet); OLAY.on('gucSeviye', onGucSeviye); OLAY.on('salla', onSalla);
      OLAY.on('kanatBos', onKanatBos); OLAY.on('ruzgar', onRuzgar);
    }
  };

  // ---------- TAM ÇEKİŞ PIRILTISI (ADD havuzu, P.durum === 'cek' && CEK.guc > 0.82) ----------
  var tamCekPirTimer = 0, tamCekPembe = false;
  function tamCekGuncelle(dt) {
    if (!ADD || !pVar() || P.durum !== 'cek' || typeof CEK === 'undefined' || !CEK || !(CEK.guc > 0.82)) {
      tamCekPirTimer = 0;
      return;
    }
    tamCekPirTimer += dt;
    var pay = Math.min(1, (CEK.guc - 0.82) / 0.18);
    if (tamCekPirTimer >= 0.14 - 0.05 * pay) {
      tamCekPirTimer = 0;
      tamCekPembe = !tamCekPembe;
      var ang = Math.random() * 6.283;
      var rad = 0.48 + Math.random() * 0.52;
      var ip = yay(ADD, P.x + Math.cos(ang) * rad, P.y + Math.sin(ang) * rad, 0.78,
        Math.cos(ang) * 0.45, 0.55 + Math.random() * 0.55, 0,
        0.46 + Math.random() * 0.16, 0.32 + 0.12 * pay, 0.04,
        1.0, tamCekPembe ? 0.62 : 0.88, tamCekPembe ? 0.80 : 0.44, 1, -0.45, 1.4, 0.92);
      ADD.donh[ip] = (tamCekPembe ? -1 : 1) * (2.6 + Math.random() * 2.2);
    }
  }

  // ---------- HER KARE ----------
  window.efektGuncelle = function (dt, t) {
    if (!kuruldu) { window.efektKur(); if (!kuruldu) return; }
    if (!(dt > 0)) dt = 0; if (dt > 0.1) dt = 0.1;
    if (t === undefined) { zaman += dt; t = zaman; } else zaman = t;
    // nokta ölçeği: ekran yüksekliği (piksel) / (2·tan(fov/2))
    if (typeof renderer !== 'undefined' && renderer && typeof camera !== 'undefined' && camera) {
      renderer.getDrawingBufferSize(_v2);
      var olc = _v2.y / (2 * Math.tan((camera.fov || 50) * Math.PI / 360));
      // kamera uzaktayken (dikey ekran, geniş görünüm) parçacıklar biraz iri kalsın ki efektler okunaklı olsun
      var efKf = Math.max(1, Math.min(1.4, Math.pow(Math.abs(camera.position.z) / 28, 0.5)));
      ADD.mat.uniforms.uOlcek.value = olc * 1.3 * efKf; NOR.mat.uniforms.uOlcek.value = olc * 1.5 * efKf; YOL.mat.uniforms.uOlcek.value = olc;
      huzmeMesh.position.set(camera.position.x * 0.85, camera.position.y * 0.6 - 4, -24);
    }
    huzmeMesh.material.uniforms.uT.value = t;
    atesGuncelle(t);
    tohumGuncelle(dt, t);
    ruzgarGuncelle(dt, t);
    bolumHalkaGuncelle(dt, t);
    yildizGuncelle(dt, t);
    kavusGuncelle(dt);
    izGuncelle(dt, t);
    tamCekGuncelle(dt);
    havuzGuncelle(ADD, dt, t); havuzYukle(ADD);
    havuzGuncelle(NOR, dt, t); havuzYukle(NOR);
    yolGuncelle(dt, t);
    oncekiGuncelle(dt, t);
    havuzYukle(YOL);
    halkaGuncelle(dt);
  };
})();
