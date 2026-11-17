// hava.js — Pırıl'ın Uçuş Okulu: hava olayları (yağmur, fırtına, kar, yaprak, sakura, kum, sis, şeker, yıldız tozu, ışıltı) (u2-hava)
// Bölümün `hava` alanına göre kameraya bağlı 2-3 katman parçacık çizer. Konumlar gölgelendiricide hesaplanır:
// kare başına bellek ayırma ve tampon yüklemesi yok; yalnız birkaç sayı (uniform) güncellenir.
// Olaylar: dinler `bolum`, `kavus`, `durum`, `yavas`; yayar `simsek({guc,x})`, `havaDindi`.
(function () {
  'use strict';
  if (typeof THREE === 'undefined' || typeof scene === 'undefined' || typeof camera === 'undefined') return;
  var T = THREE;

  // ---------------------------------------------------------------- gölgelendiriciler
  var VS = [
    'attribute vec4 tohum;',
    'uniform vec3 uMerkez; uniform vec2 uKutu; uniform vec2 uN; uniform float uN2;',
    'uniform float uT, uOlcek, uBoy, uYog, uZ, uZJ, uSalA, uSalF, uAci, uAciJ, uDon, uMod, uYer, uKoru, uAsp, uEsK;',
    'uniform vec4 uEs[4]; uniform vec4 uEsG;',
    'uniform vec2 uPir; uniform vec2 uYil[5];',
    'varying float vA; varying float vAci; varying float vRenk; varying float vFaz; varying float vYas; varying float vPx;',
    'float hs(float n){ return fract(sin(n*12.9898)*43758.5453); }',
    'void main(){',
    ' vec3 p; float a=1.0; float boy=uBoy*(0.65+0.7*tohum.y);',
    ' vFaz=0.0; vYas=0.0;',
    ' if(uMod>1.5){',                                   // 2: kayan yıldız
    '   float per=7.0+tohum.y*5.0; float c=uT/per+tohum.x*3.7; float ph=fract(c); float k=floor(c);',
    '   float sur=0.11; vYas=ph/sur; a=step(ph,sur)*sin(clamp(vYas,0.0,1.0)*3.1416);',
    '   vec2 s=vec2(hs(k+tohum.x*7.0),hs(k*1.7+tohum.y*3.0));',
    '   vec2 yon=normalize(vec2(-1.0,-0.42));',
    '   p=vec3(uMerkez.xy+(vec2(s.x*0.8-0.25,0.12+s.y*0.3))*uKutu*0.5,uZ);',
    '   p.xy+=yon*vYas*uKutu.x*0.22; vAci=atan(yon.y,yon.x); boy=uBoy;',
    ' } else if(uMod>0.5){',                            // 1: yerde halka sıçrama
    '   float hz=1.6+tohum.y*1.4; float c=uT*hz+tohum.x*11.0; float ph=fract(c); float k=floor(c);',
    '   float lx=fract(position.x+hs(k+position.y*31.0)*0.618+uN.x);',
    '   p=vec3(uMerkez.x+(lx-0.5)*uKutu.x, uYer+0.1, uZ+position.z*uZJ);',
    '   vFaz=ph; a=pow(1.0-ph,1.4); boy=uBoy*(0.55+0.45*tohum.y); vAci=0.0;',
    ' } else {',                                        // 0: kameraya göre sarılan yağış
    '   vec2 l=fract(position.xy+uN+vec2(0.0,uN2*tohum.z));',
    '   p=vec3(uMerkez.xy+(l-0.5)*uKutu, uZ+position.z*uZJ);',
    '   float f=uSalF*(0.7+0.6*tohum.x);',
    '   p.x+=uSalA*sin(uT*f+tohum.x*6.283); p.y+=uSalA*0.25*sin(uT*f*1.7+tohum.y*6.283);',
    '   for(int i=0;i<4;i++){ vec4 r=uEs[i]; float g=uEsG[i]; if(g>0.0){',  // esinti: bölgede yatay akış
    '     float x0=r.x-r.z*0.5;',
    '     float w=smoothstep(0.0,1.2,p.x-x0)*smoothstep(0.0,1.2,x0+r.z-p.x)*smoothstep(0.0,1.0,p.y-r.y)*smoothstep(0.0,1.0,r.y+r.w-p.y);',
    '     if(w>0.0){ float xs=x0+mod(p.x-x0+uT*g*uEsK,r.z); float kn=min(xs-x0,x0+r.z-xs);',
    '       p.x=mix(p.x,xs,w); a*=mix(1.0,smoothstep(0.0,0.8,kn),w); } } }',
    '   vAci=uAci+(tohum.x-0.5)*uAciJ+uT*uDon*(tohum.y-0.5)*2.0+tohum.w*6.283*step(0.001,abs(uDon));',
    '   vYas=uT*(0.8+tohum.y*1.6)+tohum.x*30.0;',
    ' }',
    ' float r0=fract(tohum.x*13.7+tohum.y*7.1+tohum.w*3.3);',
    ' a*=clamp((uYog-r0)*10.0,0.0,1.0);',
    ' vec4 mv=modelViewMatrix*vec4(p,1.0); vec4 cp=projectionMatrix*mv; gl_Position=cp;',
    ' if(uKoru>0.0){ vec2 nd=cp.xy/max(cp.w,0.001);',   // Pırıl ve yıldızların önünde saydamlaş
    '   float d=length((nd-uPir)*vec2(uAsp,1.0)); a*=mix(0.08,1.0,smoothstep(uKoru*0.55,uKoru,d));',
    '   for(int j=0;j<5;j++){ float e=length((nd-uYil[j])*vec2(uAsp,1.0)); a*=mix(0.3,1.0,smoothstep(uKoru*0.3,uKoru*0.6,e)); } }',
    ' vA=a; vRenk=tohum.w;',
    ' vPx=clamp(boy*uOlcek/max(-mv.z,0.1),1.0,256.0); gl_PointSize=a>0.003 ? vPx : 0.0;',
    '}'
  ].join('\n');

  var FS = [
    'uniform float uTur, uAlfa, uT, uFlip; uniform vec3 uPal[4];',
    'varying float vA; varying float vAci; varying float vRenk; varying float vFaz; varying float vYas; varying float vPx;',
    'void main(){',
    ' vec2 c=gl_PointCoord-0.5; c.y=-c.y; float r=length(c);',
    ' float cs=cos(vAci), sn=sin(vAci); vec2 q=vec2(c.x*cs+c.y*sn,-c.x*sn+c.y*cs);',
    ' int ri=int(floor(vRenk*3.999)); vec3 col=uPal[0]; if(ri==1) col=uPal[1]; else if(ri==2) col=uPal[2]; else if(ri==3) col=uPal[3];',
    ' float a=0.0;',
    ' if(uTur<0.5){',                                   // 0 yağmur damlası (ince, yumuşak, başı tombul)
    '   float u=(q.x+0.5); float th=max(mix(0.012,0.05,smoothstep(0.0,0.95,u)),0.75/vPx);',
    '   a=smoothstep(th+0.02,th*0.4,abs(q.y))*smoothstep(0.0,0.35,u)*smoothstep(0.5,0.42,q.x);',
    '   a*=mix(0.3,1.0,u); float oz=smoothstep(th*0.9,0.0,abs(q.y));',
    '   col=mix(col*vec3(0.55,0.64,0.82),mix(col,vec3(1.0),0.5),oz); col=mix(col,vec3(1.0),0.3*smoothstep(0.7,1.0,u)*oz);',
    '   if(uFlip>0.5){ float tw=0.5+0.5*sin(vYas*4.0); col=mix(col,vec3(1.0),tw*0.5); a*=0.75+0.5*tw; }',
    ' } else if(uTur<1.5){',                            // 1 kar tanesi: yumuşak top + parlak göbek
    '   a=smoothstep(0.5,0.34,r)*0.85+smoothstep(0.2,0.0,r)*0.3;',  // yumuşak ama bulanık leke değil
    '   col=mix(col*vec3(0.80,0.86,0.97),col,smoothstep(0.46,0.24,r));',   // serin yumuşak kenar: karlı zeminde de seçilsin
    '   col=mix(col,vec3(1.0),smoothstep(0.32,0.0,length(c-vec2(-0.08,0.09))));',
    ' } else if(uTur<2.5){',                            // 2 sonbahar yaprağı (döner, takla atar)
    '   float fl=0.3+0.7*abs(cos(vYas*1.3)); vec2 z=vec2(q.x,q.y/fl);',
    '   float xx=z.x/0.44; float hw=0.25*sqrt(max(0.0,1.0-xx*xx))*(1.0+0.25*xx);',
    '   a=smoothstep(0.02,-0.01,abs(z.y)-hw)*step(abs(xx),1.0);',
    '   float sap=step(-0.58,z.x)*step(z.x,-0.40)*step(abs(z.y),0.018); a=max(a,sap);',
    '   col*=mix(0.78,1.06,fl); col=mix(col,col*0.62,smoothstep(0.024,0.0,abs(z.y))*step(z.x,0.36));',
    '   col=mix(col,vec3(1.0,0.95,0.7),0.25*smoothstep(0.2,0.0,length(z-vec2(0.05,0.07))));',
    ' } else if(uTur<3.5){',                            // 3 sakura yaprağı (ucu çentikli)
    '   float fl=0.35+0.65*abs(cos(vYas*1.1)); vec2 z=vec2(q.x,q.y/fl);',
    '   float u=clamp((z.x+0.42)/0.82,0.0,1.0); float hw=0.27*pow(sin(u*2.6),0.8);',
    '   a=smoothstep(0.02,-0.01,abs(z.y)-hw)*step(-0.42,z.x)*step(z.x,0.42);',
    '   a*=smoothstep(-0.02,0.03,(0.40-z.x)-(0.11-abs(z.y))*0.9);',
    '   col=mix(col,vec3(1.0,0.97,0.98),0.45*(1.0-u)); col*=mix(0.86,1.05,fl);',
    ' } else if(uTur<4.5){',                            // 4 pırıltı (dört kollu ışık + yumuşak göbek)
    '   float tw=0.5+0.5*sin(vYas*3.0); tw=tw*tw;',
    '   float kol=exp(-abs(c.x)*26.0)*exp(-abs(c.y)*5.5)+exp(-abs(c.y)*26.0)*exp(-abs(c.x)*5.5);',
    '   a=exp(-r*r*70.0)+exp(-r*r*14.0)*0.35+kol*0.9*tw; a*=0.45+0.55*tw;',
    '   col=mix(col,vec3(1.0),exp(-r*r*90.0)*0.8);',
    ' } else if(uTur<5.5){',                            // 5 şeker serpintisi (yuvarlak uçlu çubuk)
    '   float fl=0.35+0.65*abs(cos(vYas*1.2)); vec2 z=vec2(q.x/fl,q.y);',
    '   float d=length(vec2(max(abs(z.x)-0.2,0.0),z.y))-0.14;',
    '   a=smoothstep(0.025,-0.02,d); col=mix(col,vec3(1.0),0.5*smoothstep(0.1,0.0,length(z-vec2(-0.06,0.06))));',
    ' } else if(uTur<6.5){',                            // 6 ışık taneciği (yuvarlak, yumuşak, nabız gibi)
    '   float pu=0.65+0.35*sin(vYas*2.2);',
    '   a=(exp(-r*r*16.0)*0.55+smoothstep(0.15,0.07,r)*0.6)*pu; col=mix(col,vec3(1.0),smoothstep(0.12,0.0,r)*0.55);',
    ' } else if(uTur<7.5){',                            // 7 yerde halka sıçrama (yassı elips)
    '   float e=length(vec2(c.x,c.y*3.4)); float R=0.08+0.38*sqrt(vFaz);',
    '   a=exp(-pow((e-R)*16.0,2.0))*smoothstep(0.5,0.4,e);',
    '   float dam=exp(-pow(length(vec2(abs(c.x)-0.12*vFaz-0.04,c.y-0.22*sin(vFaz*3.1416)*0.6))*22.0,2.0));',
    '   a=max(a,dam*step(vFaz,0.6));',
    ' } else {',                                        // 8 kayan yıldız
    '   float bas=exp(-dot(q-vec2(0.42,0.0),q-vec2(0.42,0.0))*500.0);',
    '   float kuy=smoothstep(0.03,0.0,abs(q.y)-0.004-0.012*(0.42-q.x))*smoothstep(-0.5,0.42,q.x)*step(q.x,0.43);',
    '   a=bas*1.4+kuy*0.7; col=mix(col,vec3(1.0),bas);',
    ' }',
    ' a*=vA*uAlfa; if(a<0.004) discard;',
    ' gl_FragColor=vec4(col,min(a,1.0));',
    '}'
  ].join('\n');

  // geniş bantlar (sis şeritleri, sıcak hava dalgası) ve uzak şimşek ışığı: tek ağ
  var BVS = [
    'attribute float bant; attribute vec2 kose;',
    'uniform vec4 uB[3]; uniform vec3 uBZ; uniform float uCx, uGen;',
    'varying vec2 vUv; varying float vB; varying float vWx;',
    'void main(){',
    ' int i=int(bant+0.5); vec4 b=uB[0]; float z=uBZ.x; if(i==1){ b=uB[1]; z=uBZ.y; } else if(i==2){ b=uB[2]; z=uBZ.z; }',
    ' float wx=uCx+(kose.x-0.5)*uGen*b.z; float wy=b.x+kose.y*b.y;',
    ' vUv=kose; vB=bant; vWx=wx;',
    ' gl_Position=projectionMatrix*modelViewMatrix*vec4(wx,wy,z,1.0);',
    '}'
  ].join('\n');
  var BFS = [
    'uniform vec4 uB[3]; uniform float uT, uTur, uAlfa; uniform vec3 uRenk;',
    'varying vec2 vUv; varying float vB; varying float vWx;',
    'void main(){',
    ' int i=int(vB+0.5); float mA=uB[0].w; if(i==1) mA=uB[1].w; else if(i==2) mA=uB[2].w;',
    ' float v=vUv.y; float a; vec3 col=uRenk;',
    ' float yan=smoothstep(0.0,0.12,vUv.x)*smoothstep(1.0,0.88,vUv.x);',
    ' if(uTur<0.5){',                                   // sis: alttan yoğun, yukarı doğru eriyen, yavaş kayan bulutsu bant
    '   float pr=smoothstep(0.0,0.22,v)*(1.0-smoothstep(0.3,1.0,v));',
    '   float s=uT*(0.35+vB*0.18);',
    '   float n=0.55+0.25*sin(vWx*0.11+s+vB*2.0)+0.2*sin(vWx*0.27-s*1.4+vB*5.0)+0.12*sin(vWx*0.53+v*4.0+s*0.7);',
    '   a=pr*clamp(n,0.0,1.0)*mA;',
    ' } else {',                                        // sıcak hava dalgası: alçakta titreşen ince sıcak parıltı
    '   float pr=smoothstep(0.0,0.15,v)*(1.0-smoothstep(0.25,1.0,v));',
    '   float dal=sin(v*38.0+sin(vWx*0.9+uT*2.6)*2.2-uT*1.5);',
    '   a=pr*mA*(0.45+0.55*smoothstep(0.55,1.0,dal));',
    ' }',
    ' a*=yan*uAlfa; if(a<0.003) discard; gl_FragColor=vec4(col,a);',
    '}'
  ].join('\n');

  var SVS = [
    'varying vec2 vUv;',
    'void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }'
  ].join('\n');
  var SFS = [
    'uniform float uParla, uCiz, uSeed, uAsp; uniform vec2 uMerk;',
    'varying vec2 vUv;',
    'float hs(float n){ return fract(sin(n*12.9898+uSeed*78.233)*43758.5453); }',
    'void main(){',
    ' vec2 d=(vUv-uMerk)*vec2(uAsp,1.0);',
    ' float g=exp(-dot(d,d)*5.0)*0.75+exp(-dot(d,d)*0.9)*0.35;',   // bulutların arkasında yumuşak aydınlanma
    ' float a=g*uParla; vec3 col=vec3(0.93,0.92,1.0);',
    ' if(uCiz>0.001){',                                 // ufukta ince, sevimli zikzak
    '   float y0=uMerk.y-0.01, y1=y0-0.2; float v=vUv.y;',
    '   if(v<y0 && v>y1){',
    '     float u=(y0-v)/(y0-y1)*5.0; float k=floor(u); float f=fract(u);',
    '     float o0=(k<0.5)?0.0:(hs(k)-0.5)*0.07; float o1=(hs(k+1.0)-0.5)*0.07;',
    '     float x=uMerk.x+mix(o0,o1,f)+(k+f)*0.006;',
    '     float dx=abs(vUv.x-x)*uAsp; float kal=mix(0.0025,0.0008,(y0-v)/(y0-y1));',
    '     float ic=smoothstep(kal+0.0015,kal*0.4,dx); float kn=smoothstep(kal+0.0045,kal+0.002,dx)-ic; float hl=exp(-dx*dx*6000.0)*0.3;',
    '     float bz=clamp((ic+kn*0.8+hl)*uCiz,0.0,1.0)*smoothstep(y0,y0-0.035,v);',  // üst ucu bulutun içinden çıkar gibi yumuşak   // ak-sarı çizgi + ince lila kenar: açık gökte de seçilir
    '     col=mix(col,mix(vec3(0.62,0.56,0.92),vec3(1.0,1.0,0.97),clamp(ic+hl*0.5,0.0,1.0)),clamp(bz*1.6,0.0,1.0)); a=max(a,bz);',
    '   }',
    ' }',
    ' if(a<0.002) discard; gl_FragColor=vec4(col,min(a,1.0));',
    '}'
  ].join('\n');

  // ---------------------------------------------------------------- tür tanımları
  // katman: n adet, dK = kameraya uzaklık (0 düzlemine göre kat), boy (m), hiz [rüzgâr, düşüş] m/sn, sal [genlik, sıklık], don (dönüş)
  function rgb(h) { return [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255]; }
  var YAGMUR_R = [0xbfd7ff, 0xd6e6ff, 0xa9c8f5, 0xe4efff];
  var TURLER = {
    yagmur: {
      ruzgar: 2.6, savK: 1, diner: true,
      katman: [
        { tur: 0, n: 1300, dK: 1.8, zj: 0.25, boy: 0.95, alfa: 0.5, dus: 15, renk: YAGMUR_R, aciJ: 0.06 },
        { tur: 0, n: 420, dK: 1.0, zj: 0.15, boy: 0.85, alfa: 0.62, dus: 17, renk: YAGMUR_R, aciJ: 0.05, koru: 0.16 },
        { tur: 0, n: 55, dK: 0.55, zj: 0.1, boy: 0.75, alfa: 0.55, dus: 19, renk: YAGMUR_R, aciJ: 0.04, koru: 0.22 },
        { tur: 7, mod: 1, koru: 0.1, n: 60, dK: 1.0, z: 0.6, zj: 2.2, boy: 0.85, alfa: 0.5, renk: [0xe8f2ff, 0xd6e8ff, 0xffffff, 0xcfe2ff] }
      ]
    },
    firtina: {
      ruzgar: 7.5, savK: 1, simsek: true, firtina: true, diner: true,
      katman: [
        { tur: 0, n: 2000, dK: 1.8, zj: 0.25, boy: 1.05, alfa: 0.5, dus: 19, renk: YAGMUR_R, aciJ: 0.07 },
        { tur: 0, n: 650, dK: 1.0, zj: 0.15, boy: 0.95, alfa: 0.6, dus: 21, renk: YAGMUR_R, aciJ: 0.06, koru: 0.16 },
        { tur: 0, n: 85, dK: 0.55, zj: 0.1, boy: 0.85, alfa: 0.55, dus: 23, renk: YAGMUR_R, aciJ: 0.05, koru: 0.22 },
        { tur: 7, mod: 1, koru: 0.1, n: 90, dK: 1.0, z: 0.6, zj: 2.2, boy: 0.9, alfa: 0.5, renk: [0xe8f2ff, 0xd6e8ff, 0xffffff, 0xcfe2ff] }
      ]
    },
    gunesliyagmur: {
      ruzgar: 1.6, savK: 0.8,
      katman: [
        { tur: 0, n: 420, dK: 1.8, zj: 0.25, boy: 0.85, alfa: 0.55, dus: 13, renk: [0xf2f8ff, 0xffffff, 0xd8ecff, 0xe8f2ff], aciJ: 0.05, parla: 1 },
        { tur: 0, n: 130, dK: 1.0, zj: 0.15, boy: 0.8, alfa: 0.62, dus: 14, renk: [0xf2f8ff, 0xffffff, 0xd8ecff, 0xe8f2ff], aciJ: 0.05, parla: 1, koru: 0.16 },
        { tur: 0, n: 16, dK: 0.55, zj: 0.1, boy: 0.7, alfa: 0.55, dus: 15, renk: [0xf2f8ff, 0xffffff, 0xd8ecff, 0xe8f2ff], aciJ: 0.04, parla: 1, koru: 0.22 },
        { tur: 7, mod: 1, koru: 0.1, n: 22, dK: 1.0, z: 0.6, zj: 2.2, boy: 0.75, alfa: 0.5, renk: [0xf4f8ff, 0xffffff, 0xffffff, 0xeef4ff] }
      ]
    },
    kar: {
      ruzgar: 0.7, savK: 0.6,
      katman: [
        { tur: 1, n: 1400, dK: 1.8, zj: 0.25, boy: 0.22, alfa: 0.75, dus: 1.15, sal: [0.45, 0.8], renk: [0xffffff, 0xf2f7ff, 0xe8f0ff, 0xffffff] },
        { tur: 1, n: 360, dK: 1.0, zj: 0.15, boy: 0.39, alfa: 0.88, dus: 1.5, sal: [0.6, 0.9], renk: [0xffffff, 0xf4f8ff, 0xeef4ff, 0xffffff], koru: 0.15 },
        { tur: 1, n: 24, dK: 0.55, zj: 0.1, boy: 0.38, alfa: 0.72, dus: 1.9, sal: [0.7, 0.75], renk: [0xffffff, 0xf8fbff, 0xffffff, 0xf0f6ff], koru: 0.22 }
      ]
    },
    karhafif: {
      ruzgar: 0.5, savK: 0.5,
      katman: [
        { tur: 4, n: 650, dK: 1.6, zj: 0.3, boy: 0.45, alfa: 0.7, dus: 0.2, sal: [0.5, 0.5], renk: [0xdff4ff, 0xffffff, 0xbfe6ff, 0xe8f0ff], ek: 1 },
        { tur: 1, n: 200, dK: 1.0, zj: 0.15, boy: 0.39, alfa: 0.85, dus: 1.2, sal: [0.6, 0.85], renk: [0xffffff, 0xf2f8ff, 0xeef4ff, 0xffffff], koru: 0.15 },
        { tur: 1, n: 12, dK: 0.55, zj: 0.1, boy: 0.38, alfa: 0.72, dus: 1.5, sal: [0.7, 0.7], renk: [0xffffff, 0xf8fbff, 0xffffff, 0xf0f6ff], koru: 0.22 }
      ]
    },
    yaprak: {
      ruzgar: 2.4, savK: 0.6,
      katman: [
        { tur: 2, n: 115, dK: 1.7, zj: 0.25, boy: 0.71, alfa: 0.85, dus: 1.3, sal: [0.9, 0.7], don: 2.2, renk: [0xe04a3a, 0xc4522e, 0x9c4636, 0xd8663a] },
        { tur: 2, n: 48, dK: 1.0, zj: 0.15, boy: 0.82, alfa: 0.95, dus: 1.5, sal: [1.0, 0.65], don: 2.4, renk: [0xe04a3a, 0xc4522e, 0x9c4636, 0xd8663a], koru: 0.15 },
        { tur: 2, n: 6, dK: 0.55, zj: 0.1, boy: 0.7, alfa: 0.95, dus: 1.8, sal: [1.1, 0.6], don: 2.0, renk: [0xe85040, 0xc8582e, 0xa04a38, 0xd06a3a], koru: 0.22 }
      ]
    },
    cicek: {
      ruzgar: 1.3, savK: 0.5,
      katman: [
        { tur: 3, n: 420, dK: 1.7, zj: 0.25, boy: 0.47, alfa: 0.85, dus: 0.85, sal: [0.8, 0.6], don: 1.6, renk: [0xffc2d8, 0xffd9e6, 0xf9a8c8, 0xffb6d0] },
        { tur: 3, n: 110, dK: 1.0, zj: 0.15, boy: 0.65, alfa: 0.95, dus: 1.0, sal: [0.9, 0.6], don: 1.7, renk: [0xffc2d8, 0xffd9e6, 0xf9a8c8, 0xffb6d0], koru: 0.15 },
        { tur: 3, n: 9, dK: 0.55, zj: 0.1, boy: 0.6, alfa: 0.95, dus: 1.2, sal: [1.0, 0.55], don: 1.5, renk: [0xffb0cc, 0xf8a0c0, 0xfb98bc, 0xf48cb8], koru: 0.22 }
      ]
    },
    seker: {
      ruzgar: 0.6, savK: 0.5,
      katman: [
        { tur: 5, n: 300, dK: 1.7, zj: 0.25, boy: 0.36, alfa: 0.85, dus: 0.9, sal: [0.35, 0.7], don: 2.0, renk: [0xff7eb6, 0x7fe0c4, 0xffa8c8, 0xa98bff] },
        { tur: 5, n: 100, dK: 1.0, zj: 0.15, boy: 0.5, alfa: 0.95, dus: 1.05, sal: [0.4, 0.7], don: 2.2, renk: [0xff7eb6, 0x6fd0ff, 0xffa8c8, 0xa98bff], koru: 0.15 },
        { tur: 5, n: 9, dK: 0.55, zj: 0.1, boy: 0.68, alfa: 0.95, dus: 1.25, sal: [0.45, 0.65], don: 1.8, renk: [0xff8cc0, 0x7fe0c4, 0xffb8a0, 0x6fd0ff], koru: 0.22 }
      ]
    },
    yildiztozu: {
      ruzgar: 0.25, savK: 0.3,
      katman: [
        { tur: 4, n: 800, dK: 1.7, zj: 0.3, boy: 0.42, alfa: 0.7, dus: 0.05, sal: [0.35, 0.35], renk: [0xf4f6ff, 0xd8e4ff, 0xffffff, 0xe6d4ff] },
        { tur: 4, n: 200, dK: 1.0, zj: 0.15, boy: 0.61, alfa: 0.75, dus: -0.08, sal: [0.45, 0.4], renk: [0xeef2ff, 0xdfe8ff, 0xffffff, 0xf0dcff], koru: 0.15 },
        { tur: 8, mod: 2, n: 2, dK: 2.6, boy: 7.0, alfa: 0.9, renk: [0xf4f6ff, 0xf4f6ff, 0xf4f6ff, 0xf4f6ff], toplam: 1 }
      ]
    },
    isilti: {
      ruzgar: 0.15, savK: 0.3,
      katman: [
        { tur: 6, n: 170, dK: 1.6, zj: 0.3, boy: 0.5, alfa: 0.75, dus: -0.35, sal: [0.5, 0.45], renk: [0x6fe8e0, 0xb48cff, 0xff9fd8, 0x8fd8ff] },
        { tur: 6, n: 75, dK: 1.0, zj: 0.15, boy: 0.6, alfa: 0.85, dus: -0.45, sal: [0.6, 0.5], renk: [0x6fe8e0, 0xb48cff, 0xff9fd8, 0x8fd8ff], koru: 0.16 },
        { tur: 6, n: 5, dK: 0.55, zj: 0.1, boy: 0.62, alfa: 0.6, dus: -0.5, sal: [0.7, 0.45], renk: [0x6fe8e0, 0xb48cff, 0xff9fd8, 0x8fd8ff], koru: 0.24 }
      ]
    },
    kum: {
      ruzgar: 1.4, savK: 0.4,
      katman: [
        { tur: 4, n: 320, dK: 1.0, zj: 0.5, boy: 0.5, alfa: 0.9, dus: -0.05, sal: [0.3, 0.6], renk: [0xfff8ee, 0xffeedd, 0xffffff, 0xf6e6dc], alcak: 6, koru: 0.12 }
      ],
      bant: { tur: 1, renk: 0xfff0d0, b: [[-0.2, 3.4, 1.6, 0.22], [-0.2, 2.4, 1.6, 0.16], [0, 0, 0, 0]], z: [-10, -2, 0] }
    },
    sis: {
      ruzgar: 0.5, savK: 0,
      katman: [],
      bant: { tur: 0, renk: 0xf6f8fb, b: [[-0.5, 5.0, 1.7, 0.8], [-0.4, 2.6, 1.7, 0.55], [-0.3, 1.0, 1.7, 0]], z: [-16, -5, 2.5] }
    }
  };

  // ---------------------------------------------------------------- durum
  var Q2 = (typeof Q !== 'undefined' && Q) ? Q : new URLSearchParams(location.search);
  var HIZ = Math.min(8, Math.max(0.1, parseFloat(Q2.get('hiz')) || 1));
  var H = {
    tur: null, tanim: null, katmanlar: [], bant: null, simsek: null,
    t: 0, yavasK: 1, disDt: -1, sonMs: 0, sonKare: -1,
    yog: 1, yogHedef: 1, alfa: 0, dindi: false, savX: 0, ruzgarAn: 0,
    simsekT: 0, simsekTut: -1, kavusA: 1, simsekSonra: 10, simsekGuc: 0, simsekCiz: 0, esN: 0
  };
  var esV = [new T.Vector4(), new T.Vector4(), new T.Vector4(), new T.Vector4()], esG = new T.Vector4();
  var pirV = new T.Vector2(), yilV = [new T.Vector2(9, 9), new T.Vector2(9, 9), new T.Vector2(9, 9), new T.Vector2(9, 9), new T.Vector2(9, 9)];
  var _v = new T.Vector3(), _ileri = new T.Vector3(), _boyut = new T.Vector2();

  function ortakUniform() {
    return {
      uT: { value: 0 }, uOlcek: { value: 600 }, uAsp: { value: 1 }, uAlfa: { value: 1 },
      uEs: { value: esV }, uEsG: { value: esG }, uPir: { value: pirV }, uYil: { value: yilV }
    };
  }

  function katmanKur(k, i) {
    var n = k.n | 0, g = new T.BufferGeometry();
    var pos = new Float32Array(n * 3), toh = new Float32Array(n * 4);
    for (var j = 0; j < n; j++) {
      // düzgün dağılım: tabakalı rastgele (öbeklenme ve boşluk olmasın)
      pos[j * 3] = (j + Math.random()) / n;
      pos[j * 3 + 1] = Math.random();
      pos[j * 3 + 2] = Math.random() * 2 - 1;
      toh[j * 4] = Math.random(); toh[j * 4 + 1] = Math.random();
      toh[j * 4 + 2] = Math.floor(Math.random() * 7) / 16; // düşüş farkı (1/16 katları: sarmada kopma olmasın)
      toh[j * 4 + 3] = Math.random();
    }
    for (var s = n - 1; s > 0; s--) { var r = Math.floor(Math.random() * (s + 1)); var tx = pos[s * 3]; pos[s * 3] = pos[r * 3]; pos[r * 3] = tx; }
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    g.setAttribute('tohum', new T.BufferAttribute(toh, 4));
    g.boundingSphere = new T.Sphere(new T.Vector3(), 1e6);
    var u = ortakUniform();
    var pal = []; for (var c = 0; c < 4; c++) { var rr = rgb(k.renk[c % k.renk.length]); pal.push(new T.Vector3(rr[0], rr[1], rr[2])); }
    u.uPal = { value: pal };
    u.uTur = { value: k.tur }; u.uFlip = { value: k.parla ? 1 : 0 };
    u.uMerkez = { value: new T.Vector3() }; u.uKutu = { value: new T.Vector2(40, 30) };
    u.uN = { value: new T.Vector2() }; u.uN2 = { value: 0 };
    u.uBoy = { value: k.boy }; u.uYog = { value: 1 }; u.uZ = { value: 0 }; u.uZJ = { value: 0 };
    u.uSalA = { value: k.sal ? k.sal[0] : 0 }; u.uSalF = { value: k.sal ? k.sal[1] : 0 };
    u.uAci = { value: 0 }; u.uAciJ = { value: k.aciJ || 0 }; u.uDon = { value: k.don || 0 };
    u.uMod = { value: k.mod || 0 }; u.uYer = { value: 0 }; u.uKoru = { value: k.koru || 0 };
    u.uEsK = { value: i === 0 ? 0.6 : 1.0 };
    var m = new T.ShaderMaterial({
      uniforms: u, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, depthTest: k.mod !== 1,
      blending: k.toplam ? T.AdditiveBlending : T.NormalBlending
    });
    var o = new T.Points(g, m);
    o.frustumCulled = false;
    o.renderOrder = k.dK < 0.8 ? 9 : (k.dK > 1.3 ? -4 : 4);
    if (k.mod === 1) o.renderOrder = 3;
    o.onBeforeRender = kareOncesi;
    var L = { k: k, o: o, g: g, m: m, u: u, cx: 0, cy: 0, ilk: true };
    scene.add(o);
    return L;
  }

  function bantKur(b) {
    var g = new T.BufferGeometry();
    var kose = new Float32Array(3 * 6 * 2), bant = new Float32Array(3 * 6), pos = new Float32Array(3 * 6 * 3);
    var kq = [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1];
    for (var i = 0; i < 3; i++) for (var j = 0; j < 6; j++) {
      kose[(i * 6 + j) * 2] = kq[j * 2]; kose[(i * 6 + j) * 2 + 1] = kq[j * 2 + 1]; bant[i * 6 + j] = i;
    }
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    g.setAttribute('kose', new T.BufferAttribute(kose, 2));
    g.setAttribute('bant', new T.BufferAttribute(bant, 1));
    g.boundingSphere = new T.Sphere(new T.Vector3(), 1e6);
    var rr = rgb(b.renk);
    var u = {
      uB: { value: [new T.Vector4().fromArray(b.b[0]), new T.Vector4().fromArray(b.b[1]), new T.Vector4().fromArray(b.b[2])] },
      uBZ: { value: new T.Vector3(b.z[0], b.z[1], b.z[2]) }, uCx: { value: 0 }, uGen: { value: 60 },
      uT: { value: 0 }, uTur: { value: b.tur }, uAlfa: { value: 1 }, uRenk: { value: new T.Vector3(rr[0], rr[1], rr[2]) }
    };
    var m = new T.ShaderMaterial({ uniforms: u, vertexShader: BVS, fragmentShader: BFS, transparent: true, depthWrite: false, depthTest: true });
    var o = new T.Mesh(g, m); o.frustumCulled = false; o.renderOrder = -6; o.onBeforeRender = kareOncesi; // yıldızlardan önce: sis yıldızı örtmez
    scene.add(o);
    return { o: o, g: g, m: m, u: u, b: b };
  }

  function simsekKur() {
    var g = new T.PlaneGeometry(1, 1);
    var u = { uParla: { value: 0 }, uCiz: { value: 0 }, uSeed: { value: 0 }, uAsp: { value: 1 }, uMerk: { value: new T.Vector2(0.5, 0.75) } };
    var m = new T.ShaderMaterial({ uniforms: u, vertexShader: SVS, fragmentShader: SFS, transparent: true, depthWrite: false, depthTest: true });
    var o = new T.Mesh(g, m); o.frustumCulled = false; o.renderOrder = -9; o.onBeforeRender = kareOncesi;
    scene.add(o);
    return { o: o, g: g, m: m, u: u };
  }

  function sok() {
    var i;
    for (i = 0; i < H.katmanlar.length; i++) { var L = H.katmanlar[i]; scene.remove(L.o); L.g.dispose(); L.m.dispose(); }
    H.katmanlar.length = 0;
    if (H.bant) { scene.remove(H.bant.o); H.bant.g.dispose(); H.bant.m.dispose(); H.bant = null; }
    if (H.simsek) { scene.remove(H.simsek.o); H.simsek.g.dispose(); H.simsek.m.dispose(); H.simsek = null; }
    H.tur = null; H.tanim = null; HAVA.tur = null;
  }

  function bolumCoz(bilgi) {
    if (bilgi && typeof bilgi === 'object') {
      if (bilgi.bolum && typeof bilgi.bolum === 'object') return bilgi.bolum;
    }
    try { if (typeof UCUS !== 'undefined' && UCUS && typeof UCUS.bolumVeri === 'function') { var b = UCUS.bolumVeri(); if (b) return b; } } catch (e) { }
    var l = window.BOLUMLER;
    if (bilgi && l && typeof bilgi.idx === 'number' && l[bilgi.idx]) return l[bilgi.idx];
    return bilgi && bilgi.hava ? { hava: bilgi.hava } : null;
  }

  function kur(bolum) {
    sok();
    var ad = bolum && typeof bolum.hava === 'string' ? bolum.hava : null;
    var tn = ad && Object.prototype.hasOwnProperty.call(TURLER, ad) ? TURLER[ad] : null;
    // esinti bölgeleri (en çok 4)
    var es = (bolum && Array.isArray(bolum.esintiler)) ? bolum.esintiler : [];
    H.esN = 0;
    for (var e = 0; e < 4; e++) {
      var r = es[e];
      if (r && isFinite(r.x) && isFinite(r.y) && isFinite(r.w) && isFinite(r.h) && r.w > 0 && r.h > 0) {
        var gg = +r.guc || 1; // küçük sayı = kat, büyük sayı = itiş gücü (m/sn²): ikisinde de yumuşak bir akış hızına çevir
        var akis = gg <= 3 ? Math.max(0.5, gg) * 4.5 : Math.max(4, Math.min(11, gg * 0.55));
        esV[e].set(r.x, r.y, r.w, r.h); esG.setComponent(e, akis); H.esN++;
      } else { esV[e].set(0, 0, 0, 0); esG.setComponent(e, 0); }
    }
    if (!tn) return;
    H.tur = ad; H.tanim = tn; HAVA.tur = ad;
    for (var i = 0; i < tn.katman.length; i++) H.katmanlar.push(katmanKur(tn.katman[i], i));
    if (tn.bant) H.bant = bantKur(tn.bant);
    if (tn.simsek) H.simsek = simsekKur();
    H.t = 0; H.yog = 1; H.yogHedef = 1; H.dindi = false; H.savX = 0; H.alfa = 0;
    H.simsekT = 99; H.simsekSonra = 4 + Math.random() * 4; H.simsekGuc = 0;
  }

  // ---------------------------------------------------------------- kare güncellemesi
  function gizliMi() {
    try { return !!(typeof ARAYUZ !== 'undefined' && ARAYUZ && (ARAYUZ.baslikAcik || ARAYUZ.haritaAcik)); } catch (e) { return false; }
  }

  function guncelle(dt) { // dışarıdan çağrılırsa (oyun döngüsü) zamanı o verir
    if (isFinite(dt) && dt >= 0) H.disDt = Math.min(dt, 0.1);
  }

  function kareOncesi(rnd) {
    var kare = rnd.info.render.frame;
    if (kare === H.sonKare) return;
    H.sonKare = kare;
    var ms = performance.now();
    var dt;
    if (H.disDt >= 0) { dt = H.disDt; H.disDt = -1; }
    else { dt = H.sonMs ? Math.min((ms - H.sonMs) / 1000, 1 / 30) : 1 / 60; dt *= HIZ * H.yavasK; }
    H.sonMs = ms;
    if (!(dt >= 0)) dt = 0;
    adim(dt, rnd);
  }

  function adim(dt, rnd) {
    var tn = H.tanim; if (!tn) return;
    H.t += dt;
    var t = H.t;
    // görünürlük (başlık/harita) ve yoğunluk (kavuşmada diner)
    H.alfa += ((gizliMi() ? 0 : 1) - H.alfa) * (1 - Math.exp(-dt * 3));
    var yh = H.yogHedef;
    if (H.yog > yh) H.yog = Math.max(yh, H.yog - dt / 2.0); else H.yog = Math.min(yh, H.yog + dt / 1.2);

    // rüzgâr: fırtınada esintiyle dalgalanır; Pırıl hızla uçarken yağış geriye savrulur
    var ruz = tn.ruzgar;
    if (tn.firtina) ruz *= (0.8 + 0.22 * Math.sin(t * 0.63) + 0.12 * Math.sin(t * 1.71 + 1.3)) * (0.35 + 0.65 * H.yog);
    var ucus = (typeof P !== 'undefined' && P && P.durum === 'ucus');
    var savH = ucus ? -Math.max(0, Math.min(30, P.vx || 0)) * 0.2 * tn.savK : 0;
    H.savX += (savH - H.savX) * (1 - Math.exp(-dt * 2.5));

    // kamera ölçüleri
    camera.getWorldDirection(_ileri);
    var tanY = Math.tan(camera.fov * Math.PI / 360), asp = camera.aspect;
    rnd.getDrawingBufferSize(_boyut);
    var olcek = _boyut.y / (2 * tanY);
    var camZ = Math.max(4, camera.position.z);
    var boyK = Math.min(2.2, Math.max(0.3, Math.pow(camZ / 32, 0.75)));
    // yakın plan (kavuşma, kamera çok yakın): kameranın dibindeki iri taneler yüzleri örtmesin
    var yk = Math.min(1, Math.max(0, (camZ - 9) / 9)); yk = yk * yk * (3 - 2 * yk);
    var kavusK = (typeof P !== 'undefined' && P && P.durum === 'kavus') ? 0.45 : 1;
    H.kavusA += (kavusK - H.kavusA) * (1 - Math.exp(-dt * 3));
    H.boyK = boyK;

    // Pırıl ve yıldızlar ekranda nerede (önlerinde parçacıklar saydamlaşır)
    if (typeof P !== 'undefined' && P) {
      _v.set(P.x, P.y + 0.25, 0).project(camera); pirV.set(_v.x, _v.y);
    }
    var yy = (typeof DUNYA !== 'undefined' && DUNYA && DUNYA.yildizYer) || null;
    for (var s = 0; s < 5; s++) {
      var Y = yy && yy[s];
      if (Y) { var yx = Y.x !== undefined ? Y.x : Y[0], yv = Y.y !== undefined ? Y.y : Y[1]; _v.set(yx, yv, 0).project(camera); yilV[s].set(_v.x, _v.y); }
      else yilV[s].set(9, 9);
    }
    var zemin = (typeof D !== 'undefined' && D) ? D.zemin : 0;

    for (var i = 0; i < H.katmanlar.length; i++) {
      var L = H.katmanlar[i], k = L.k, u = L.u;
      var zL = k.z !== undefined ? k.z : Math.max(-125, camZ * (1 - k.dK)); // gök perdesinin (z=-150) önünde kalsın
      var mesafe = (camera.position.z - zL) / Math.max(0.05, -_ileri.z);
      var cx = camera.position.x + _ileri.x * mesafe, cy = camera.position.y + _ileri.y * mesafe;
      var hh = mesafe * tanY, hw = hh * asp;
      var bw = hw * 2 * 1.18 + 2, bh = hh * 2 * 1.18 + 2;
      if (k.alcak) { bh = k.alcak + 1; cy = zemin - 0.5 + bh / 2; }
      if (k.mod === 1) { bw = Math.min(bw, 90); }
      var vx = (ruz + H.savX) * (k.dK > 1.3 ? 0.85 : 1), vy = -(k.dus || 0);
      if (L.ilk) { L.cx = cx; L.cy = cy; L.ilk = false; }
      var dcx = cx - L.cx, dcy = cy - L.cy; L.cx = cx; L.cy = cy;
      if (Math.abs(dcx) > bw || Math.abs(dcy) > bh) { dcx = 0; dcy = 0; } // ışınlanma: sarma zaten boşluk bırakmaz
      var N = u.uN.value;
      var kx = k.mod === 1 ? 0 : vx;
      N.x = (N.x + (kx * dt - dcx) / bw) % 1; if (N.x < 0) N.x += 1;
      N.y = (N.y + (vy * dt - dcy) / bh) % 1; if (N.y < 0) N.y += 1;
      var n2 = u.uN2.value + (vy * 0.6 * dt) / bh; n2 = n2 % 16; if (n2 < 0) n2 += 16; u.uN2.value = n2;
      u.uMerkez.value.set(cx, cy, zL);
      u.uKutu.value.set(bw, bh);
      u.uZ.value = zL; u.uZJ.value = k.mod === 1 ? k.zj : mesafe * (k.zj || 0) * 0.5;
      u.uBoy.value = k.mod === 2 ? k.boy : k.boy * (k.tur === 0 || k.tur === 7 ? Math.sqrt(boyK) : (k.dK < 0.8 ? Math.min(boyK, 1.35) : boyK)); // uzak kadrajda da seçilsin (ekranda boyut aşağı yukarı sabit)
      u.uT.value = t; u.uOlcek.value = olcek; u.uAsp.value = asp; u.uYer.value = zemin;
      u.uAlfa.value = k.alfa * H.alfa * (k.dK < 0.8 ? yk * H.kavusA : (k.dK < 1.3 ? H.kavusA : 1));
      u.uYog.value = H.yog * 1.11;
      if (k.tur === 0) u.uAci.value = Math.atan2(vy, vx); // damla düştüğü yöne bakar
      if (k.mod === 2) { u.uMerkez.value.set(cx, cy, zL); u.uKutu.value.set(hw * 2, hh * 2); }
    }

    if (H.bant) {
      var B = H.bant, bz = B.b.z[1] || 0;
      var mb = (camera.position.z - bz) / Math.max(0.05, -_ileri.z);
      B.u.uCx.value = camera.position.x + _ileri.x * mb;
      B.u.uGen.value = mb * tanY * asp * 2 * 1.3 + 8;
      B.u.uT.value = t; B.u.uAlfa.value = H.alfa;
      var bb = B.u.uB.value;
      for (var q = 0; q < 3; q++) { bb[q].x = zemin + B.b.b[q][0]; bb[q].w = B.b.b[q][3] * (B.b.z[q] > 0 ? yk * H.kavusA : 1); } // yakın planda öndeki bant çekilir
    }

    if (H.simsek) simsekAdim(dt, tanY, asp);
  }

  function simsekAdim(dt, tanY, asp) {
    var S = H.simsek, u = S.u;
    var zS = -135;
    var mesafe = camera.position.z - zS;
    var hh = mesafe * tanY, hw = hh * asp;
    S.o.position.set(camera.position.x, camera.position.y + _ileri.y * mesafe, zS);
    S.o.scale.set(hw * 2.2, hh * 2.2, 1);
    u.uAsp.value = asp;
    if (!H.dindi) {
      H.simsekSonra -= dt;
      if (H.simsekSonra <= 0) {
        H.simsekSonra = 9 + Math.random() * 7;
        H.simsekT = 0;
        H.simsekGuc = 0.55 + Math.random() * 0.45;
        H.simsekCiz = (H.cizZorla || Math.random() < 0.55) ? 1 : 0; H.cizZorla = false;
        u.uSeed.value = Math.random() * 100;
        u.uMerk.value.set(0.3 + Math.random() * 0.4, 0.69 + Math.random() * 0.07);
        if (H.alfa > 0.5) OLAY.emit('simsek', { guc: H.simsekGuc, x: camera.position.x + (u.uMerk.value.x - 0.5) * hw * 2.2 });
      }
    }
    H.simsekT = H.simsekTut >= 0 ? H.simsekTut : H.simsekT + dt; // deneme: çakışı bir anda dondurur
    var st = H.simsekT, env = 0;
    if (st < 0.6) {
      var a1 = (st - 0.05) / 0.045, a2 = (st - 0.17) / 0.05;
      env = Math.exp(-a1 * a1) + 0.6 * Math.exp(-a2 * a2) * (st < 0.3 ? 1 : 0);
    }
    u.uParla.value = Math.min(0.18, 0.18 * env * H.simsekGuc) * H.alfa;
    u.uCiz.value = H.simsekCiz * Math.min(1, env * 1.3) * 0.85 * H.alfa;
  }

  // ---------------------------------------------------------------- olaylar
  OLAY.on('bolum', function (bilgi) {
    try { kur(bolumCoz(bilgi)); } catch (e) { console.warn('hava:', e); sok(); }
  });
  OLAY.on('yavas', function (v) { if (v && isFinite(v.k)) H.yavasK = Math.max(0.02, Math.min(1, v.k)); });
  OLAY.on('kavus', function () {
    if (!H.tanim || !H.tanim.diner || H.dindi) return;
    H.dindi = true; H.yogHedef = 0; // yağmur 2 saniyede diner, şimşek durur
    OLAY.emit('havaDindi', { tur: H.tur });
  });
  OLAY.on('durum', function (d) {
    if (d !== 'kavus' && H.dindi) { H.dindi = false; H.yogHedef = 1; H.simsekSonra = 5 + Math.random() * 5; }
  });

  var HAVA = {
    kur: function (b) { try { kur(b); } catch (e) { console.warn('hava:', e); sok(); } },
    sok: sok,
    guncelle: guncelle,
    tur: null,
    turler: Object.keys(TURLER),
    // yalnız deneme için: şimşeği hemen çaktır; tut >= 0 ise o anda dondurur
    simsekDene: function (tut) { H.simsekSonra = 0; H.cizZorla = true; H.simsekTut = -1; if (tut >= 0) setTimeout(function () { H.simsekTut = tut; }, 40); },
    simsekBirak: function () { H.simsekTut = -1; }
  };
  window.HAVA = HAVA;
})();
