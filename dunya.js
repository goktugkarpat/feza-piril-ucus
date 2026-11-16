/* Pırıl'ın Uçuş Okulu — DÜNYA: 20 bölümlük masalsı biyom sahneleri (M1 iPad kalitesi, katmanlı tiyatro sahnesi).
   Üst düzey adlar: DUNYA, dunyaKur, dunyaBolumKur, dunyaGuncelle, dunyaSapan; iç durum `dy` nesnesinde. */
'use strict';

const DUNYA = {
  yildizYer: [[11, 10.5], [20, 20.5], [25.5, 8.5], [34.5, 13], [39, 5.2]],
  cali: { x: 41.5, y: 0.55, r: 1.0 },
  mantar: { x: 22, y: 1.9, r: 1.6 },
  bulut: { x: 33, y: 9, r: 2.2 },
  sapanSol: { x: -1.6, y: 4.6 },
  sapanSag: { x: 1.6, y: 4.6 }
};

const dy = {
  U: {
    uT: { value: 0 },
    uP: { value: null },
    uUfuk: { value: null },
    uOrta: { value: null },
    uPembe: { value: null },
    uAcik: { value: null },
    uUst: { value: null },
    uGunes: { value: null },
    uGunesRenk: { value: null },
    uGece: { value: 0 }
  },
  kur: false,
  olayBagli: false,
  grup: null,
  G: null,
  ortakGeo: null,
  hedef: { x: 0, y: 2.75 },
  cekiliyor: false,
  yapis: false,
  mantarlar: [],
  bulutlarList: [],
  niluferler: [],
  ruzgarlar: [],
  halkalar: [],
  cali: null,
  caliT: 9,
  degirmen: null,
  bulutMesh: null,
  kelebek: null,
  kus: null,
  duman: null,
  dumanPos: null,
  fenerler: null,
  dilekFener: null,
  dereMat: null,
  yuzenAdalar: null,
  biyomNo: 1,
  hx: 46,
  kelebekMerkezX: [-4, 14, 28, 38, -2.4, 2.5, 43.6, 48.6]
};

// ── 20 Biyom Tanımı (M1 iPad kalitesi: renk paletleri, sis, ışık, gökyüzü) ──
const DY_BIYOMLAR = [
  null,
  // 1 · Altın Çayır
  {
    ad: 'Altın Çayır', gece: 0, sisRenk: 0xffe2c6, sisYogun: 0.0046, arka: 0xffe0c0,
    gok: [0xffd994, 0xffc2b3, 0xfabdd1, 0xb3c7f7, 0x6166c7], gunesPos: [58, 20], gunesRenk: 0xffeba8,
    ykUst: 0xdce8ff, ykAlt: 0xa88f6c, ykGuc: 1.15, gnRenk: 0xffd49a, gnGuc: 2.2, arkaRenk: 0xffb8d4, arkaGuc: 0.45,
    dag: [[0xc7c3ec, 0xffe2c6], [0xa9b9e6, 0xffdcc0], [0x92b8d6, 0xf6dcbc]],
    tepe: [0x9fc85a, 0xdfe88a, 0xb8c4a4, 0xf4e2bc],
    agac: [[0x7fae4a, 0xcde67e], [0x9cbf55, 0xdcec8a], [0x6a9a52, 0xbcdc7a]],
    zemin: [0x8cc85a, 0x579a40, 0xc9dc8a], cimen: [0x4f9a40, 0xb9e070, 0xa6d860],
    cicek: [[0xf4f0f0, 0xffffff], [0xff8ab8, 0xffb8d6], [0xffd030, 0xffe680], [0xe84a40, 0xff7060]],
    sisSerit: [0xffedd6, 0xffdbc7], siluet: [0x223d32, 0x3a5e48]
  },
  // 2 · Mantar Ormanı
  {
    ad: 'Mantar Ormanı', gece: 0, sisRenk: 0xc8ead4, sisYogun: 0.0052, arka: 0xc4e8d0,
    gok: [0xc2f0c7, 0x99e0c4, 0x8cd4cc, 0x6cb8b8, 0x386b85], gunesPos: [48, 26], gunesRenk: 0xfff0b8,
    ykUst: 0xd8ffe8, ykAlt: 0x6a7852, ykGuc: 1.12, gnRenk: 0xffe8b0, gnGuc: 2.05, arkaRenk: 0x88ffd0, arkaGuc: 0.5,
    dag: [[0x88bfa8, 0xc8ead4], [0x6ea896, 0xbae2c8], [0x589480, 0xa8d8b8]],
    tepe: [0x5aa450, 0xa4d878, 0x80b88e, 0xc6e8c8],
    agac: [[0x428844, 0x86c866], [0x54984c, 0x9cd874], [0x367642, 0x74b85e]],
    zemin: [0x5ea64c, 0x3b7838, 0x8ec474], cimen: [0x387a38, 0x8ed468, 0x76c258],
    cicek: [[0xff7aa8, 0xffb8d8], [0xb884ff, 0xdfc0ff], [0x68e0d0, 0xb8fff4], [0xffcc50, 0xffe898]],
    sisSerit: [0xd6f4e0, 0xbcead0], siluet: [0x1a382c, 0x2a5442]
  },
  // 3 · Esintili Vadi
  {
    ad: 'Esintili Vadi', gece: 0, sisRenk: 0xdcf0ff, sisYogun: 0.0042, arka: 0xd8eeff,
    gok: [0xf0f5e0, 0xc7ebff, 0x9ed9fc, 0x75bbf5, 0x478fe0], gunesPos: [56, 28], gunesRenk: 0xfff5cc,
    ykUst: 0xe4f4ff, ykAlt: 0x8ea878, ykGuc: 1.2, gnRenk: 0xfff0c8, gnGuc: 2.25, arkaRenk: 0xa8e0ff, arkaGuc: 0.45,
    dag: [[0xaecae8, 0xdcf0ff], [0x8eb4de, 0xd0e8fa], [0x74a2d2, 0xc2e0f4]],
    tepe: [0x76c458, 0xc8eb8a, 0x9ec6a8, 0xdcf0dc],
    agac: [[0x5ca44a, 0xa8dc72], [0x6eb854, 0xbce682], [0x4c9048, 0x94ce68]],
    zemin: [0x7fd062, 0x4ea044, 0xb8e69a], cimen: [0x4a9a42, 0xb2e678, 0x9ad868],
    cicek: [[0xffffff, 0xf0f8ff], [0xffe050, 0xfff2a0], [0x80c8ff, 0xc2e6ff], [0xff98c0, 0xffcce0]],
    sisSerit: [0xe8f6ff, 0xd4ecff], siluet: [0x204038, 0x346254]
  },
  // 4 · Pembe Bulutlar
  {
    ad: 'Pembe Bulutlar', gece: 0, sisRenk: 0xffd8e0, sisYogun: 0.0048, arka: 0xffd6de,
    gok: [0xffd8c6, 0xfcb6ba, 0xf59ab8, 0xcf8fd8, 0x946bc4], gunesPos: [54, 24], gunesRenk: 0xffe8d6,
    ykUst: 0xffe8f6, ykAlt: 0xc89ab8, ykGuc: 1.2, gnRenk: 0xffd0e0, gnGuc: 2.1, arkaRenk: 0xffa8e8, arkaGuc: 0.55,
    dag: [[0xdcb4e4, 0xffd6e6], [0xc89ed8, 0xfac8dc], [0xb48cc8, 0xf4bcd4]],
    tepe: [0x8ec490, 0xd6ecc2, 0xc8b8d8, 0xf6d8e8],
    agac: [[0xf08ab4, 0xffc8de], [0xe878a8, 0xffb8d4], [0xf4a0c4, 0xffd8ea]],
    zemin: [0x9fd89a, 0x76b47e, 0xf2c8dc], cimen: [0x68aa72, 0xb4e4a8, 0xf2b8d4],
    cicek: [[0xffa8cc, 0xffd8ea], [0xffffff, 0xfff0f6], [0xd8a8ff, 0xf0d8ff], [0xffe090, 0xfff4c4]],
    sisSerit: [0xffe4f0, 0xfad0e4], siluet: [0x3c2848, 0x5c3e68]
  },
  // 5 · Nilüferli Dere
  {
    ad: 'Nilüferli Dere', gece: 0, sisRenk: 0xd2f4f4, sisYogun: 0.0045, arka: 0xd0f2f2,
    gok: [0xdbfaf5, 0xa8ebed, 0x8adbf5, 0x62b8eb, 0x4294d1], gunesPos: [52, 26], gunesRenk: 0xfff8d6,
    ykUst: 0xe0fbff, ykAlt: 0x6c9a8a, ykGuc: 1.18, gnRenk: 0xfff2c6, gnGuc: 2.2, arkaRenk: 0x80f0ff, arkaGuc: 0.48,
    dag: [[0x9ac8d8, 0xd2f4f4], [0x7eb4cc, 0xc4ecee], [0x66a0be, 0xb4e4e8]],
    tepe: [0x6ec068, 0xb8e692, 0x8ec6be, 0xcceee8],
    agac: [[0x4e9c54, 0x98d87a], [0x5eb060, 0xaae288], [0x408a4c, 0x84c86c]],
    zemin: [0x76c462, 0x4a9246, 0xa8dc96], cimen: [0x448e44, 0x9ed878, 0x86ca66],
    cicek: [[0xff98c4, 0xffd0e6], [0xffffff, 0xf0ffff], [0xffe468, 0xfff4a8], [0x88d8ff, 0xc8f0ff]],
    sisSerit: [0xe0faf8, 0xc8f0f0], siluet: [0x1c3e3a, 0x2e5e56]
  },
  // 6 · Lavanta Tepeleri
  {
    ad: 'Lavanta Tepeleri', gece: 0, sisRenk: 0xe8d4f4, sisYogun: 0.0046, arka: 0xe6d2f2,
    gok: [0xffd6b8, 0xeba8d6, 0xdb9ce0, 0xa882d4, 0x7057b8], gunesPos: [56, 22], gunesRenk: 0xffe2b8,
    ykUst: 0xf0dcff, ykAlt: 0x9c7ea8, ykGuc: 1.15, gnRenk: 0xffd2a8, gnGuc: 2.15, arkaRenk: 0xd898ff, arkaGuc: 0.5,
    dag: [[0xb89ed8, 0xe8d4f4], [0xa288ca, 0xdec4ee], [0x8c74bc, 0xd4b6e8]],
    tepe: [0x7ea664, 0xc0c88a, 0xa898c8, 0xe0cce8],
    agac: [[0x5e8a4c, 0x9ec076], [0x709858, 0xb0cc84], [0x4e7844, 0x8cb068]],
    zemin: [0x88b868, 0x64924e, 0xc6a8dc], cimen: [0x588a48, 0x9ec672, 0x8cb664],
    cicek: [[0x9e5ee8, 0xc898ff], [0xb874f4, 0xe0b4ff], [0x7e42cc, 0xaa78ec], [0xffe090, 0xfff2c0]],
    sisSerit: [0xf0e0fa, 0xe2c8f0], siluet: [0x2e2244, 0x483864]
  },
  // 7 · Gökkuşağı Kemeri
  {
    ad: 'Gökkuşağı Kemeri', gece: 0, sisRenk: 0xe4f4ff, sisYogun: 0.0040, arka: 0xe2f2ff,
    gok: [0xf5f5db, 0xc4edff, 0xb3e6ff, 0x8cc7fa, 0x66a3f5], gunesPos: [58, 25], gunesRenk: 0xfff8d0,
    ykUst: 0xf0faff, ykAlt: 0x98b888, ykGuc: 1.25, gnRenk: 0xfff6d4, gnGuc: 2.3, arkaRenk: 0xffc4ec, arkaGuc: 0.5,
    dag: [[0xb8c8ec, 0xe4f4ff], [0x9eb8e4, 0xd8ecfa], [0x84a8dc, 0xcce4f6]],
    tepe: [0x88d45c, 0xd0f08c, 0xa8d0c8, 0xe2f2ec],
    agac: [[0x66b84c, 0xb4ea7a], [0x78c858, 0xc6f28a], [0x54a448, 0x9ede6e]],
    zemin: [0x8ee060, 0x5eb246, 0xc8f098], cimen: [0x52aa44, 0xb8ec7c, 0xa2de6c],
    cicek: [[0xff6898, 0xffa8c8], [0xffb830, 0xffe480], [0x60b8ff, 0xa8dcff], [0xc878ff, 0xe8b8ff]],
    sisSerit: [0xf0faff, 0xdceeff], siluet: [0x224438, 0x366452]
  },
  // 8 · Altın Dağ Geçidi
  {
    ad: 'Altın Dağ Geçidi', gece: 0, sisRenk: 0xf4e8dc, sisYogun: 0.0044, arka: 0xf2e6da,
    gok: [0xffe0ad, 0xf2cca8, 0xbdcceb, 0x8aa8e0, 0x426bbd], gunesPos: [54, 24], gunesRenk: 0xffe8a4,
    ykUst: 0xeaf2ff, ykAlt: 0x9e9284, ykGuc: 1.2, gnRenk: 0xffe0a4, gnGuc: 2.35, arkaRenk: 0xffd890, arkaGuc: 0.5,
    dag: [[0xaebcf0, 0x7c8ac4], [0x98aae6, 0x6878b6], [0x8a9edc, 0x5868a6]],
    tepe: [0x6ea85a, 0xb8d47e, 0x86ae96, 0xd0e2c0],
    agac: [[0x3a6e48, 0x6ca26a], [0x487c52, 0x7cb078], [0x2e5e3c, 0x5c905c]],
    zemin: [0x8ab86a, 0x668854, 0xb4cc8c], cimen: [0x588048, 0xa4c678, 0x90b468],
    cicek: [[0xffffff, 0xfff8e8], [0xffd048, 0xffe898], [0x88b8ff, 0xc4e0ff], [0xff98b0, 0xffc8d8]],
    sisSerit: [0xf8eee2, 0xeadcc8], siluet: [0x243430, 0x3a5048]
  },
  // 9 · Gün Batımı Kanyonu
  {
    ad: 'Gün Batımı Kanyonu', gece: 0, sisRenk: 0xf8b08a, sisYogun: 0.0048, arka: 0xf6ac86,
    gok: [0xff8f57, 0xf5707a, 0xe85c78, 0xb34c8f, 0x703d8f], gunesPos: [56, 15], gunesRenk: 0xffba78,
    ykUst: 0xffc8a8, ykAlt: 0x8c4c38, ykGuc: 1.1, gnRenk: 0xff9854, gnGuc: 2.4, arkaRenk: 0xff6878, arkaGuc: 0.55,
    dag: [[0xc85e4e, 0xf8b08a], [0xb24e44, 0xf09c78], [0x9c403c, 0xe48868]],
    tepe: [0xc8643c, 0xe8965c, 0xc87a68, 0xf0aa82],
    agac: [[0x887a42, 0xbca85c], [0x968448, 0xc8b264], [0x746c3a, 0xa89854]],
    zemin: [0xd47e4a, 0xa85632, 0xe8a46c], cimen: [0x8a7838, 0xc8a858, 0xb8964c],
    cicek: [[0xffaa40, 0xffd478], [0xff6050, 0xff9888], [0xffe890, 0xfff6c8], [0xff78a8, 0xffb0cc]],
    sisSerit: [0xffc49c, 0xf8a088], siluet: [0x3c1c1e, 0x5a2c2c]
  },
  // 10 · Yıldızlı Gece Şenliği
  {
    ad: 'Yıldızlı Gece Şenliği', gece: 1, sisRenk: 0x181838, sisYogun: 0.0052, arka: 0x161634,
    gok: [0x241f52, 0x1c1a47, 0x17143d, 0x101033, 0x08081f], gunesPos: [54, 24], gunesRenk: 0xfff8dc,
    ykUst: 0x6878c8, ykAlt: 0x2a2444, ykGuc: 1.05, gnRenk: 0xb8c8ff, gnGuc: 1.45, arkaRenk: 0xffb060, arkaGuc: 0.65,
    dag: [[0x2e2c5c, 0x1c1c3e], [0x242652, 0x181a38], [0x1c2046, 0x141630]],
    tepe: [0x284a42, 0x3e685e, 0x2a3654, 0x3a4868],
    agac: [[0x224c3e, 0x3e7864], [0x2a5646, 0x4a8670], [0x1c4036, 0x346a58]],
    zemin: [0x2e5848, 0x1c3c34, 0x46686e], cimen: [0x1e4436, 0x447c64, 0x386a56],
    cicek: [[0xffe680, 0xfff6c0], [0xa8d4ff, 0xdcf0ff], [0xffa8d0, 0xffd4e8], [0xc0a8ff, 0xe4d4ff]],
    sisSerit: [0x2c2c5c, 0x20204a], siluet: [0x0c121e, 0x162030]
  },
  // 11 · Kiraz Çiçeği Bahçesi
  {
    ad: 'Kiraz Çiçeği Bahçesi', gece: 0, sisRenk: 0xffdce8, sisYogun: 0.0044, arka: 0xffdae6,
    gok: [0xffe6ec, 0xffc6d8, 0xf7b2d9, 0xa8c8f8, 0x6c8ee0], gunesPos: [56, 24], gunesRenk: 0xfff0e0,
    ykUst: 0xffeef6, ykAlt: 0x9c8878, ykGuc: 1.2, gnRenk: 0xffe2d6, gnGuc: 2.2, arkaRenk: 0xffa8d0, arkaGuc: 0.52,
    dag: [[0xd8b8dc, 0xffdce8], [0xc2a2ce, 0xf8cedc], [0xaa8ec0, 0xf0c0d2]],
    tepe: [0x78be64, 0xc8e898, 0xb8a8c8, 0xf8dce8],
    agac: [[0xf28ab0, 0xffd2e4], [0xea74a0, 0xffc2da], [0xf6a2c2, 0xffe6f0]],
    zemin: [0x88cc68, 0x5aa048, 0xf0c8d8], cimen: [0x509846, 0xb4e478, 0x9ed668],
    cicek: [[0xffa6c8, 0xffe0ee], [0xffffff, 0xfff2f6], [0xff78a8, 0xffbed6], [0xffe680, 0xfff6c0]],
    sisSerit: [0xffeaf2, 0xfad2e2], siluet: [0x38243a, 0x563858]
  },
  // 12 · Ayçiçeği Tarlası
  {
    ad: 'Ayçiçeği Tarlası', gece: 0, sisRenk: 0xfff0c4, sisYogun: 0.0040, arka: 0xffeec0,
    gok: [0xfff0b8, 0xffd896, 0xf6c494, 0x86c8f8, 0x468ee0], gunesPos: [58, 22], gunesRenk: 0xffe680,
    ykUst: 0xfff8dc, ykAlt: 0x9c8c58, ykGuc: 1.22, gnRenk: 0xffdc88, gnGuc: 2.35, arkaRenk: 0xffe080, arkaGuc: 0.48,
    dag: [[0xc4c8a0, 0xfff0c4], [0xa8b88c, 0xf8e6b4], [0x8ea87c, 0xf0dca6]],
    tepe: [0x74b848, 0xc8e470, 0xa8be88, 0xf2e4b0],
    agac: [[0x58983c, 0xa0d45e], [0x6aa848, 0xb4e06c], [0x488636, 0x8ec454]],
    zemin: [0x84c44e, 0x549434, 0xd8d878], cimen: [0x4a8e34, 0xb4dc60, 0x9ed052],
    cicek: [[0xffc818, 0xfff060], [0xff9e20, 0xffd460], [0xffffff, 0xfff8e0], [0xff7040, 0xffa878]],
    sisSerit: [0xfff6d6, 0xfce6b4], siluet: [0x2a3c1c, 0x425a2c]
  },
  // 13 · Mercan Kıyısı
  {
    ad: 'Mercan Kıyısı', gece: 0, sisRenk: 0xc8f4f0, sisYogun: 0.0042, arka: 0xc6f2ee,
    gok: [0xe4fcf8, 0xa8f0ec, 0x84e2ec, 0x56c2eb, 0x2e90d8], gunesPos: [54, 26], gunesRenk: 0xfff8d4,
    ykUst: 0xe4ffff, ykAlt: 0x7ca898, ykGuc: 1.2, gnRenk: 0xfff4c8, gnGuc: 2.25, arkaRenk: 0x70f8e8, arkaGuc: 0.5,
    dag: [[0x92d4d8, 0xc8f4f0], [0x74c0cc, 0xb8ece8], [0x5aaac0, 0xa8e2e0]],
    tepe: [0x68c488, 0xb4e8b0, 0x86c8c6, 0xc8f2ee],
    agac: [[0x42a472, 0x88dc9c], [0x50b480, 0x9ae6aa], [0xff8a80, 0xffc4bc]],
    zemin: [0x8cd8a0, 0x58a87c, 0xf0dcb4], cimen: [0x449c68, 0x94de98, 0x7ed088],
    cicek: [[0xff7c70, 0xffbeb4], [0xfff4e8, 0xffffff], [0x5ce0d8, 0xb4faf4], [0xffb458, 0xffe49c]],
    sisSerit: [0xdcfaf6, 0xbceee8], siluet: [0x183c3c, 0x285c5a]
  },
  // 14 · Kristal Vadi
  {
    ad: 'Kristal Vadi', gece: 0, sisRenk: 0xd8d8fa, sisYogun: 0.0046, arka: 0xd6d6f8,
    gok: [0xe6e4ff, 0xc4d8ff, 0xb0c8ff, 0x889ee8, 0x5664b8], gunesPos: [56, 24], gunesRenk: 0xeef4ff,
    ykUst: 0xeaf0ff, ykAlt: 0x7e7aa8, ykGuc: 1.18, gnRenk: 0xe4ecff, gnGuc: 2.15, arkaRenk: 0xb0a4ff, arkaGuc: 0.58,
    dag: [[0xa8a4dc, 0xd8d8fa], [0x8e8ec8, 0xc8caf0], [0x7678b4, 0xb8bce6]],
    tepe: [0x68a898, 0xa8d8cc, 0x9498c8, 0xd0d4f0],
    agac: [[0x4c9488, 0x8ad0c2], [0x5ca498, 0x9cded0], [0x7a7ec0, 0xb8bcf4]],
    zemin: [0x74b8a4, 0x4c8a7c, 0xb8c4e8], cimen: [0x428478, 0x8cd4be, 0x78c4ae],
    cicek: [[0x98e8ff, 0xdcf8ff], [0xd498ff, 0xf0d8ff], [0xff9ed2, 0xffd8ee], [0xffffff, 0xeef6ff]],
    sisSerit: [0xe4e6ff, 0xcccef6], siluet: [0x222246, 0x363668]
  },
  // 15 · Pamuk Şeker Gökyüzü
  {
    ad: 'Pamuk Şeker Gökyüzü', gece: 0, sisRenk: 0xffe4f4, sisYogun: 0.0044, arka: 0xffe2f2,
    gok: [0xffe0ec, 0xffc4e2, 0xe8b8f8, 0xa4d8fc, 0x84a8f0], gunesPos: [54, 25], gunesRenk: 0xfff0f8,
    ykUst: 0xfff2fc, ykAlt: 0xc8a4c4, ykGuc: 1.24, gnRenk: 0xffe8f4, gnGuc: 2.2, arkaRenk: 0xffb4ec, arkaGuc: 0.56,
    dag: [[0xe4bce8, 0xffe4f4], [0xd2a8dc, 0xf8d4ec], [0xbe94d0, 0xf0c4e2]],
    tepe: [0x8cd4a4, 0xd4f2dc, 0xd8b8e8, 0xfae0f2],
    agac: [[0xf498c4, 0xffd4ea], [0xa8d8ff, 0xdcf0ff], [0xd4a4f8, 0xf0dcff]],
    zemin: [0x98dca8, 0x6cb886, 0xf6cfe6], cimen: [0x5ea878, 0xaee8ba, 0xf4c4e0],
    cicek: [[0xff9ed0, 0xffd8ec], [0x98d8ff, 0xd8f0ff], [0xd8a8ff, 0xf2dcff], [0xfff098, 0xfffad0]],
    sisSerit: [0xffeef8, 0xf8d8ee], siluet: [0x3c284a, 0x583c6c]
  },
  // 16 · Akçaağaç Ormanı
  {
    ad: 'Akçaağaç Ormanı', gece: 0, sisRenk: 0xfad8b8, sisYogun: 0.0046, arka: 0xf8d6b6,
    gok: [0xffe0a8, 0xf8bc8a, 0xeb9c86, 0x9eb8e2, 0x4e74b8], gunesPos: [56, 20], gunesRenk: 0xffdca0,
    ykUst: 0xfff0dc, ykAlt: 0x8e6242, ykGuc: 1.15, gnRenk: 0xffc888, gnGuc: 2.25, arkaRenk: 0xff9468, arkaGuc: 0.52,
    dag: [[0xc89888, 0xfad8b8], [0xb4847a, 0xf2c8a8], [0x9e706c, 0xe8b898]],
    tepe: [0xc47c38, 0xecae58, 0xb8866c, 0xf2cca8],
    agac: [[0xd84e24, 0xff8c40], [0xe87224, 0xffb848], [0xb83024, 0xe85a44]],
    zemin: [0xba8c44, 0x88622c, 0xe4b468], cimen: [0x785e28, 0xc89e48, 0xd88838],
    cicek: [[0xff8838, 0xffc478], [0xe84438, 0xff8878], [0xffd040, 0xfff098], [0xfff2e0, 0xffffff]],
    sisSerit: [0xffe4c8, 0xf6c8a8], siluet: [0x381e14, 0x562e20]
  },
  // 17 · Kuzey Işıkları
  {
    ad: 'Kuzey Işıkları', gece: 1, sisRenk: 0x162840, sisYogun: 0.0048, arka: 0x14243a,
    gok: [0x1c3a56, 0x162c48, 0x182244, 0x101836, 0x080c1e], gunesPos: [54, 25], gunesRenk: 0xe6f8ff,
    ykUst: 0x60c8c8, ykAlt: 0x203048, ykGuc: 1.1, gnRenk: 0xa8e8ff, gnGuc: 1.5, arkaRenk: 0x58ffa8, arkaGuc: 0.65,
    dag: [[0x2e4a68, 0x1c2c44], [0x243e5a, 0x18263c], [0x1c324c, 0x142034]],
    tepe: [0x285a5c, 0x428884, 0x2a4060, 0x3e5c7c],
    agac: [[0x1e5852, 0x3a9488], [0x286860, 0x4aa89a], [0x184844, 0x307a72]],
    zemin: [0x2c6460, 0x1c4446, 0x528290], cimen: [0x1c4a46, 0x3e8c7e, 0x34766c],
    cicek: [[0x68ffd8, 0xb8fff0], [0xa8d8ff, 0xe0f2ff], [0xd498ff, 0xf0d8ff], [0xffe888, 0xfff6c8]],
    sisSerit: [0x244862, 0x1c364e], siluet: [0x0c1824, 0x142838]
  },
  // 18 · Yüzen Masal Adaları
  {
    ad: 'Yüzen Masal Adaları', gece: 0, sisRenk: 0xdcf2ff, sisYogun: 0.0038, arka: 0xdaf0ff,
    gok: [0xfff0d8, 0xc8ebff, 0xa4d8fc, 0x6cb4f4, 0x3e7ed8], gunesPos: [56, 26], gunesRenk: 0xfff6cc,
    ykUst: 0xeaf6ff, ykAlt: 0x8aa878, ykGuc: 1.22, gnRenk: 0xfff2c8, gnGuc: 2.28, arkaRenk: 0xa8e2ff, arkaGuc: 0.48,
    dag: [[0xaec6e8, 0xdcf2ff], [0x92b2de, 0xd0eaf8], [0x789ed4, 0xc2e2f2]],
    tepe: [0x6cc058, 0xbee886, 0x98c4b4, 0xdcf0e4],
    agac: [[0x50a448, 0x98dc70], [0x60b452, 0xaee680], [0x429044, 0x86cc64]],
    zemin: [0x7ad060, 0x4ca044, 0xb8e69a], cimen: [0x469840, 0xa8e474, 0x92d664],
    cicek: [[0xffffff, 0xf2faff], [0xff92bc, 0xffcae0], [0xffd848, 0xfff098], [0x78c8ff, 0xc0e6ff]],
    sisSerit: [0xe8f6ff, 0xd4ecfc], siluet: [0x1e3e34, 0x305e50]
  },
  // 19 · Altın Şafak Tapınağı
  {
    ad: 'Altın Şafak Tapınağı', gece: 0, sisRenk: 0xfce0c4, sisYogun: 0.0044, arka: 0xfadec2,
    gok: [0xffd8a4, 0xf8b6a0, 0xe8a4c0, 0xa492d8, 0x5c5aa8], gunesPos: [56, 18], gunesRenk: 0xffe098,
    ykUst: 0xfff0dc, ykAlt: 0xa08268, ykGuc: 1.18, gnRenk: 0xffd088, gnGuc: 2.35, arkaRenk: 0xffa8b8, arkaGuc: 0.52,
    dag: [[0xd8b4b8, 0xfce0c4], [0xc29ea8, 0xf4d2b4], [0xac8898, 0xecc4a4]],
    tepe: [0x94b45c, 0xd8dc88, 0xc2b0a0, 0xf6e2c6],
    agac: [[0x4a8248, 0x84b868], [0x5a9252, 0x98c876], [0x3c703e, 0x72a458]],
    zemin: [0x98be64, 0x6e9244, 0xe6d4a8], cimen: [0x5e883e, 0xb8d46c, 0xa4c45c],
    cicek: [[0xffe060, 0xfff4a8], [0xffffff, 0xfff6ea], [0xff90a8, 0xffc6d4], [0xc898ff, 0xe8d0ff]],
    sisSerit: [0xffe8d2, 0xf6d0b8], siluet: [0x2e2624, 0x483c38]
  },
  // 20 · Büyük Yıldız Şenliği Finali
  {
    ad: 'Büyük Yıldız Şenliği Finali', gece: 1, sisRenk: 0x1c183c, sisYogun: 0.0048, arka: 0x1a1638,
    gok: [0x2e225c, 0x241c50, 0x1c1644, 0x121036, 0x080820], gunesPos: [54, 24], gunesRenk: 0xfff8dc,
    ykUst: 0x7888d8, ykAlt: 0x2c2448, ykGuc: 1.1, gnRenk: 0xc8d4ff, gnGuc: 1.55, arkaRenk: 0xffb868, arkaGuc: 0.68,
    dag: [[0x362e66, 0x201c44], [0x2a2658, 0x1a183c], [0x20204c, 0x161434]],
    tepe: [0x2c524a, 0x46766c, 0x303c5e, 0x425278],
    agac: [[0x245446, 0x448872], [0x2e6050, 0x52967e], [0x1e463c, 0x387462]],
    zemin: [0x326252, 0x20443c, 0x4e7278], cimen: [0x204c3e, 0x4a8870, 0x3c7660],
    cicek: [[0xffe878, 0xfff8c8], [0x98e8ff, 0xdcf8ff], [0xffa8d8, 0xffd8ee], [0xc8a8ff, 0xe8d8ff]],
    sisSerit: [0x322c64, 0x242050], siluet: [0x0e1222, 0x182036]
  }
];

// Bölüm numarası -> biyom (1..20). Bölüm sayısı değişebilir (BOLUMLER.length): numara orantılanır.
// Bölüm verisinde `biyom: 1..20` varsa doğrudan o görünüş kullanılır. Bilinmeyen değerlerde 1'e düşer.
function dyBolumNo(bolum) {
  const NB = DY_BIYOMLAR.length - 1, sinir = (n) => Math.max(1, Math.min(NB, Math.round(n) || 1));
  if (!bolum) return 1;
  if (typeof bolum.biyom === 'number' && isFinite(bolum.biyom)) return sinir(bolum.biyom);
  const L = (typeof window !== 'undefined' && Array.isArray(window.BOLUMLER) && window.BOLUMLER.length) ? window.BOLUMLER.length : NB;
  const oran = (n) => (L <= NB ? sinir(n) : sinir(1 + (Math.max(1, Math.min(L, n)) - 1) * (NB - 1) / (L - 1)));
  let n = null;
  if (typeof bolum.no === 'number') n = bolum.no;
  else if (typeof bolum.id === 'number') n = bolum.id;
  else if (typeof window !== 'undefined' && Array.isArray(window.BOLUMLER) && window.BOLUMLER.indexOf(bolum) >= 0) n = window.BOLUMLER.indexOf(bolum) + 1;
  else if (typeof bolum.index === 'number') n = bolum.index + 1;
  if (n == null || !isFinite(n)) return 1;
  // İlk 20 bölüm kendi biyomunu korur; fazlası (biyom alanı yoksa) orantılanır, son bölüm büyük final
  if (n >= 1 && n <= NB && n < L) return sinir(n);
  if (n >= L) return NB;
  let b = oran(n);
  if (bolum.gece === true && !DY_BIYOMLAR[b].gece) { for (const g of [10, 17, 20]) if (Math.abs(g - b) <= 2) { b = g; break; } }
  return b;
}

// Aynı biyom daha önceki bir bölümde de kullanıldıysa, ikinci kez gelişinde farklı bir gün vakti görünüşü:
// gündüz biyomları altın akşamüstü ya da pembe sabah, gece biyomları mor gece olur (ezber/karışıklık olmasın).
const DY_VARYANT = {
  aksam: { gok: [0xffc27a, 0xff9a86, 0xe27aa6, 0x9a6cc4, 0x4a3c8c], k: 0.6, sis: 0xffc8a4, gunes: 0xffb070, isik: 0xffb878, alt: 13 },
  sabah: { gok: [0xfff2d6, 0xffd6dc, 0xe6d4fa, 0xa8ccff, 0x6f98ea], k: 0.6, sis: 0xf6e4f0, gunes: 0xfff2dc, isik: 0xfff0e0, alt: 28 },
  morGece: { gok: [0x4a2a6c, 0x3a2262, 0x2c1a54, 0x1c1240, 0x0c0822], k: 0.65, sis: 0x2a1c48, gunes: 0xffe8f4, isik: 0xd8c0ff, alt: 24 }
};
function dyVaryant(bolum, bNo, B) {
  try {
    const L = (typeof window !== 'undefined' && Array.isArray(window.BOLUMLER)) ? window.BOLUMLER : null;
    const idx = L ? L.indexOf(bolum) : -1;
    if (idx <= 0) return B;
    let tekrar = false;
    for (let i = 0; i < idx; i++) if (L[i] && dyBolumNo(L[i]) === bNo) { tekrar = true; break; }
    if (!tekrar) return B;
    const V = B.gece ? DY_VARYANT.morGece : ([1, 6, 9, 16, 19].indexOf(bNo) >= 0 ? DY_VARYANT.sabah : DY_VARYANT.aksam);
    const m = (a, b, k) => dyKarH(a, b, k), k = V.k;
    const Y = Object.assign({}, B);
    Y.gok = B.gok.map((c, i) => m(c, V.gok[i], k));
    Y.sisRenk = m(B.sisRenk, V.sis, 0.55); Y.arka = m(B.arka, V.sis, 0.55);
    Y.sisSerit = B.sisSerit.map((c) => m(c, V.sis, 0.5));
    Y.dag = B.dag.map((p) => [m(p[0], V.gok[3], 0.3), m(p[1], V.sis, 0.4)]);
    Y.tepe = B.tepe.map((c) => m(c, V.isik, 0.14));
    Y.zemin = B.zemin.map((c) => m(c, V.isik, 0.1));
    Y.gunesRenk = m(B.gunesRenk, V.gunes, 0.7); Y.gnRenk = m(B.gnRenk, V.isik, 0.6); Y.arkaRenk = m(B.arkaRenk, V.gok[2], 0.5);
    Y.ykUst = m(B.ykUst, V.isik, 0.35);
    Y.gunesPos = [B.gunesPos[0] - 10, V.alt];
    return Y;
  } catch (e) { return B; }
}

// ── birçok parçayı tek geometride toplayan yardımcı ──
function dyYapi() {
  const T = THREE, pos = [], nor = [], col = [], sal = [], o = new T.Object3D(), v = new T.Vector3(), w = new T.Vector3(), nm = new T.Matrix3(), c1 = new T.Color(), c2 = new T.Color();
  return {
    nc: null,
    ekle(geo, x, y, z, sx, sy, sz, r1, r2, rx, ry, rz, s) {
      o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.rotation.set(rx || 0, ry || 0, rz || 0); o.updateMatrix(); nm.getNormalMatrix(o.matrix);
      const g = geo.userData.dyD || (geo.userData.dyD = geo.index ? geo.toNonIndexed() : geo), p = g.attributes.position, n = g.attributes.normal;
      if (!geo.userData.dyB) { geo.computeBoundingBox(); geo.userData.dyB = [geo.boundingBox.min.y, geo.boundingBox.max.y]; }
      const [a, b] = geo.userData.dyB; c1.setHex(r1); c2.setHex(r2 == null ? r1 : r2);
      for (let i = 0; i < p.count; i++) {
        const t = (p.getY(i) - a) / ((b - a) || 1);
        v.fromBufferAttribute(p, i).applyMatrix4(o.matrix); pos.push(v.x, v.y, v.z);
        if (this.nc) { w.set(v.x - this.nc[0], (v.y - this.nc[1]) * 1.25, v.z - this.nc[2]).normalize(); }
        v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize();
        if (this.nc) v.multiplyScalar(0.25).addScaledVector(w, 0.75).normalize();
        nor.push(v.x, v.y, v.z);
        col.push(c1.r + (c2.r - c1.r) * t, c1.g + (c2.g - c1.g) * t, c1.b + (c2.b - c1.b) * t);
        sal.push(s < 0 ? -s : (s || 0) * t * t);
      }
    },
    geo() {
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(nor, 3));
      g.setAttribute('color', new T.Float32BufferAttribute(col, 3)); g.setAttribute('sal', new T.Float32BufferAttribute(sal, 1));
      g.computeBoundingSphere(); return g;
    }
  };
}

// Tüm katmanlarda MeshStandardMaterial (M1 iPad kalitesi: PBR ışık + sis + gölge + rüzgâr shader)
function dyMalz(isikli, sisli, rim, pbr) {
  const T = THREE;
  const rgh = pbr && pbr.roughness != null ? pbr.roughness : (isikli ? 0.78 : 0.92);
  const met = pbr && pbr.metalness != null ? pbr.metalness : (isikli ? 0.02 : 0.0);
  const m = new T.MeshStandardMaterial({ vertexColors: true, roughness: rgh, metalness: met });
  if (pbr && pbr.emissive != null) m.emissive = new T.Color(pbr.emissive);
  if (pbr && pbr.emissiveIntensity != null) m.emissiveIntensity = pbr.emissiveIntensity;
  if (pbr && pbr.side != null) m.side = pbr.side;
  m.fog = sisli !== false;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uT = dy.U.uT; sh.uniforms.uP = dy.U.uP;
    sh.vertexShader = 'attribute float sal;\nuniform float uT; uniform vec3 uP;\n' + sh.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\nfloat dyDal = 0.6 + 0.8 * smoothstep(0.3, 1.0, sin(position.x * 0.11 + position.z * 0.04 - uT * 1.15));\n' +
      'float dyR = (sin(uT * 1.7 + position.x * 0.33 + position.z * 0.21) + 0.45 * sin(uT * 3.1 + position.x * 0.9)) * dyDal;\n' +
      'float dyPx = position.x - uP.x; float dyYak = exp(-dyPx * dyPx * 0.3) * smoothstep(4.5, 1.2, uP.y) * smoothstep(-11.0, -3.0, position.z);\n' +
      'transformed.x += sal * (dyR * 0.34 + sign(dyPx) * dyYak * 0.5); transformed.y -= sal * (abs(dyR) * 0.08 + dyYak * 0.1);\n' +
      (rim ? 'transformed += normal * sal * 0.22 * sin(uT * 1.4 + position.x * 0.13 + position.z * 0.2);\n' : ''));
    if (rim && isikli) sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>',
      '#include <dithering_fragment>\nfloat dyRm = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 2.4);\n' +
      'gl_FragColor.rgb += vec3(1.0, 0.8, 0.42) * dyRm * ' + rim.toFixed(2) + ' * clamp(0.55 + 0.45 * normal.x + 0.35 * normal.y, 0.0, 1.0);');
  };
  return m;
}

function dyKarH(a, b, t) { const k = (s) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t); return (k(16) << 16) | (k(8) << 8) | k(0); }
function dyRs(t) { let s = t; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

function dyTemizle() {
  if (!dy.grup) return;
  dy.grup.traverse((obj) => {
    if (obj.geometry && (!dy.ortakGeo || !dy.ortakGeo.has(obj.geometry))) {
      obj.geometry.dispose();
    }
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((mm) => mm.dispose());
      else obj.material.dispose();
    }
  });
  while (dy.grup.children.length > 0) dy.grup.remove(dy.grup.children[0]);
  dy.mantarlar = [];
  dy.bulutlarList = [];
  dy.niluferler = [];
  dy.ruzgarlar = [];
  dy.halkalar = [];
  dy.cali = null;
  dy.degirmen = null;
  dy.bulutMesh = null;
  dy.kelebek = null;
  dy.kus = null;
  dy.duman = null;
  dy.dumanPos = null;
  dy.fenerler = null;
  dy.dilekFener = null;
  dy.dereMat = null;
  dy.yuzenAdalar = null;
  dy.salTac = null;
}

function dunyaKur() {
  if (dy.kur || typeof THREE === 'undefined' || typeof scene === 'undefined') return;
  dy.kur = true;
  const T = THREE, PI = Math.PI;
  dy.U.uP.value = new T.Vector3(0, 3, 0);
  dy.U.uUfuk.value = new T.Color();
  dy.U.uOrta.value = new T.Color();
  dy.U.uPembe.value = new T.Color();
  dy.U.uAcik.value = new T.Color();
  dy.U.uUst.value = new T.Color();
  dy.U.uGunes.value = new T.Vector2(58, 20);
  dy.U.uGunesRenk.value = new T.Color();

  dy.v1 = new T.Vector3();
  dy.v2 = new T.Vector3();
  dy.yuk = new T.Vector3(0, 1, 0);
  dy.o = new T.Object3D();

  const bicak = (() => {
    const w = 0.5, P = [[-w, 0], [w, 0], [w * 0.95, 0.45], [w * 0.7, 0.78], [w * 0.3, 0.96], [0, 1], [-w * 0.3, 0.96], [-w * 0.7, 0.78], [-w * 0.95, 0.45]], pos = [];
    for (let i = 1; i < P.length - 1; i++) pos.push(P[0][0], P[0][1], 0, P[i][0], P[i][1], 0, P[i + 1][0], P[i + 1][1], 0);
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g;
  })();
  const kanat = (k) => {
    const g = new T.BufferGeometry(), pos = [];
    for (const q of [-1, 1]) {
      const ek = (a, b, c) => pos.push(...a, ...b, ...c);
      ek([0, 0, 0], [q * 0.32 * k, 0.32 * k, 0], [q * 0.4 * k, 0.02 * k, 0]);
      ek([0, 0, 0], [q * 0.4 * k, 0.02 * k, 0], [q * 0.22 * k, -0.24 * k, 0]);
    }
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g;
  };
  const bg = (() => {
    const B = dyYapi(), cekirdek = new T.CylinderGeometry(0.55, 0.55, 1, 8, 1);
    cekirdek.translate(0, 0.5, 0);
    B.ekle(cekirdek, 0, 0, 0, 1.0, 1.0, 0.35, 0xd49b2a, 0xffe890);
    cekirdek.dispose();
    for (const f of [0, PI]) {
      const pts = [];
      for (let i = 0; i <= 18; i++) {
        const u = i / 18, a = u * PI * 6 + f;
        pts.push(new T.Vector3(Math.cos(a) * 0.52, u, Math.sin(a) * 0.34));
      }
      const tg = new T.TubeGeometry(new T.CatmullRomCurve3(pts), 24, 0.32, 6, false);
      B.ekle(tg, 0, 0, 0, 1, 1, 1, f === 0 ? 0xc88c20 : 0xe5b842, 0xfff4b8);
      tg.dispose();
    }
    return B.geo();
  })();

  dy.G = {
    kure: new T.SphereGeometry(1, 14, 10),
    kureK: new T.SphereGeometry(1, 6, 4),
    kureC: new T.SphereGeometry(1, 5, 3),
    kureO: new T.SphereGeometry(1, 10, 7),
    kureU: new T.SphereGeometry(1, 8, 5),
    daireY: new T.CircleGeometry(1, 10).rotateX(-PI / 2),
    oct: new T.OctahedronGeometry(1, 0),
    silA3: new T.CylinderGeometry(1, 1, 1, 3, 1, true),
    cicek: (() => {
      const g = new T.CircleGeometry(1, 12), p = g.attributes.position;
      for (let i = 1; i < p.count; i++) if (i % 2 === 0) { p.setX(i, p.getX(i) * 0.6); p.setY(i, p.getY(i) * 0.6); }
      return g;
    })(),
    sil: new T.CylinderGeometry(1, 1, 1, 12, 1),
    silA: new T.CylinderGeometry(1, 1, 1, 8, 1, true),
    yaprak: new T.ConeGeometry(1, 1, 3, 1, true),
    koni: new T.ConeGeometry(1, 1, 8, 1),
    koni4: new T.ConeGeometry(1, 1, 4, 1),
    kule: new T.CylinderGeometry(0.75, 1.25, 1, 10),
    daire: new T.CircleGeometry(1, 8),
    kutu: new T.BoxGeometry(1, 1, 1),
    kubbe: new T.SphereGeometry(1, 24, 10, 0, PI * 2, 0, PI * 0.56),
    torusSap: new T.TorusGeometry(0.38, 0.05, 6, 14, PI),
    torusYuva: new T.TorusGeometry(0.3, 0.13, 6, 12),
    torusHalka: new T.TorusGeometry(0.34, 0.068, 8, 20),
    halka: new T.TorusGeometry(1, 0.14, 10, 28),
    halkaInce: new T.TorusGeometry(1, 0.048, 6, 18),
    bicak,
    bant: bg,
    kanatK: kanat(1.1),
    kanatB: kanat(2.2)
  };
  dy.ortakGeo = new Set(Object.values(dy.G));

  dy.grup = new THREE.Group();
  scene.add(dy.grup);

  if (!dy.olayBagli && typeof OLAY !== 'undefined' && OLAY.on) {
    dy.olayBagli = true;
    OLAY.on('bolum', (v) => {
      let b = v;
      if (typeof v === 'number' && typeof window !== 'undefined' && Array.isArray(window.BOLUMLER)) b = window.BOLUMLER[v];
      else if (v && v.bolum) b = v.bolum;
      dunyaBolumKur(b || DUNYA);
    });
    OLAY.on('sek', (v) => {
      if (!v) return;
      if (v.tur === 'mantar') {
        let best = dy.mantarlar[0], bd = 1e9;
        for (let i = 0; i < dy.mantarlar.length; i++) {
          const m = dy.mantarlar[i], d = v.x != null ? Math.hypot(m.x - v.x, m.y - (v.y || m.y)) : i;
          if (d < bd) { bd = d; best = m; }
        }
        if (best) { best.t = 0; best.sik = 0.35; }
      } else if (v.tur === 'bulut') {
        let best = dy.bulutlarList[0], bd = 1e9;
        for (let i = 0; i < dy.bulutlarList.length; i++) {
          const b = dy.bulutlarList[i], d = v.x != null ? Math.hypot(b.x - v.x, b.y - (v.y || b.y)) : i;
          if (d < bd) { bd = d; best = b; }
        }
        if (best) { best.t = 0; best.sik = 0.35; }
      } else if (v.tur === 'nilufer') {
        let best = dy.niluferler[0], bd = 1e9;
        for (let i = 0; i < dy.niluferler.length; i++) {
          const n = dy.niluferler[i], d = v.x != null ? Math.hypot(n.x - v.x, n.y - (v.y || n.y)) : i;
          if (d < bd) { bd = d; best = n; }
        }
        if (best) best.t = 0;
      } else if (v.tur === 'cali') {
        dy.caliT = 0;
      }
    });
    OLAY.on('ruzgar', (v) => {
      let best = null, bd = 1e9;
      for (let i = 0; i < dy.ruzgarlar.length; i++) {
        const r = dy.ruzgarlar[i], d = (v && v.x != null) ? Math.abs(r.x - v.x) : i;
        if (d < bd) { bd = d; best = r; }
      }
      if (best && best.t > 0.6) best.t = 0;
    });
    // Bırakınca salıncağın yapraklı tacı yaylanarak sallanır
    OLAY.on('birak', () => { dy.salT = 0; });
    OLAY.on('kavus', () => { dy.caliT = 0; });
    OLAY.on('halka', (v) => {
      if (!dy.halkalar.length) return;
      let best = (v && typeof v.i === 'number') ? dy.halkalar[v.i] : dy.halkalar[0], bd = 1e9;
      if (v && v.x != null && typeof v.i !== 'number') {
        for (let i = 0; i < dy.halkalar.length; i++) {
          const h = dy.halkalar[i], d = Math.hypot(h.x - v.x, h.y - (v.y || h.y));
          if (d < bd) { bd = d; best = h; }
        }
      }
      if (best) best.parlaT = 0;
    });
  }

  const basBolum = (typeof window !== 'undefined' && Array.isArray(window.BOLUMLER) && window.BOLUMLER[0]) ? window.BOLUMLER[0] : DUNYA;
  dunyaBolumKur(basBolum);
}

function dunyaBolumKur(bolum) {
  if (!dy.kur) { dunyaKur(); if (!dy.kur) return; }
  dyTemizle();

  const T = THREE, PI = Math.PI, G = dy.G, gr = dy.grup;
  const bNo = dyBolumNo(bolum);
  dy.biyomNo = bNo;
  const B = dyVaryant(bolum, bNo, DY_BIYOMLAR[bNo] || DY_BIYOMLAR[1]);
  dy.biyomGece = !!B.gece;
  const R = dyRs(4711 + bNo * 919), ara = (a, b) => a + (b - a) * R();

  const hx = (bolum && bolum.hedef && bolum.hedef.x != null) ? bolum.hedef.x : 46;
  dy.hx = hx;
  // Dere: bölüm verisindeki `dere: {x, w}` varsa ona göre, yoksa dereli biyomlarda varsayılan şerit
  const dereB = (bolum && bolum.dere && isFinite(bolum.dere.x)) ? bolum.dere : null;
  const dereVar = !!dereB || bNo === 5 || bNo === 13;
  const dereX0 = dereB ? dereB.x - (dereB.w || 20) / 2 : 6, dereX1 = dereB ? dereB.x + (dereB.w || 20) / 2 : hx - 5;
  dy.kelebekMerkezX[3] = Math.max(36, hx - 8);
  dy.kelebekMerkezX[6] = hx - 2.4;
  dy.kelebekMerkezX[7] = hx + 2.6;
  const caliBilgi = (bolum && bolum.cali) ? bolum.cali : (bNo === 1 && DUNYA.cali ? DUNYA.cali : { x: hx - 4.5, y: 0.55, r: 1.0 });
  const mantarList = (bolum && Array.isArray(bolum.mantarlar)) ? bolum.mantarlar : [(bolum && bolum.mantar) || DUNYA.mantar];
  const bulutList = (bolum && Array.isArray(bolum.bulutlar)) ? bolum.bulutlar : [(bolum && bolum.bulut) || DUNYA.bulut];
  const niluferList = (bolum && Array.isArray(bolum.niluferler)) ? bolum.niluferler : [];
  const ruzgarList = (bolum && Array.isArray(bolum.ruzgarlar)) ? bolum.ruzgarlar : [];
  const halkaList = (bolum && Array.isArray(bolum.halkalar)) ? bolum.halkalar : [];

  // ── Işık & Sis (bölüme özel M1 iPad kalitesi) ──
  const yk = new T.HemisphereLight(B.ykUst, B.ykAlt, B.ykGuc); gr.add(yk);
  const gn = new T.DirectionalLight(B.gnRenk, B.gnGuc);
  gn.position.set(34, 28, 22); gn.target.position.set(hx * 0.45, 0, 0);
  gn.castShadow = true;
  gn.shadow.mapSize.set(2048, 2048);
  gn.shadow.camera.left = -16; gn.shadow.camera.right = Math.max(62, hx + 18);
  gn.shadow.camera.top = 26; gn.shadow.camera.bottom = -8;
  gn.shadow.camera.near = 5; gn.shadow.camera.far = 105;
  gn.shadow.bias = -0.0004; gn.shadow.normalBias = 0.03; gn.shadow.radius = 2.5;
  gr.add(gn); gr.add(gn.target);
  const arkaIsik = new T.DirectionalLight(B.arkaRenk, B.arkaGuc);
  arkaIsik.position.set(-24, 14, -20); arkaIsik.target.position.set(22, 2, 0);
  gr.add(arkaIsik); gr.add(arkaIsik.target);

  scene.fog = new T.FogExp2(B.sisRenk, B.sisYogun * (B.gece ? 0.9 : 0.82));
  scene.background = new T.Color(B.arka);

  dy.U.uUfuk.value.setHex(B.gok[0]);
  dy.U.uOrta.value.setHex(B.gok[1]);
  dy.U.uPembe.value.setHex(B.gok[2]);
  dy.U.uAcik.value.setHex(B.gok[3]);
  dy.U.uUst.value.setHex(B.gok[4]);
  dy.U.uGunes.value.set(B.gunesPos[0], B.gunesPos[1]);
  dy.U.uGunesRenk.value.setHex(B.gunesRenk);
  dy.U.uGece.value = B.gece ? 1.0 : 0.0;

  // ── 1 · Gök: ton geçişi + güneş / dolunay hâlesi + gece yıldızları ──
  {
    const m = new T.ShaderMaterial({
      depthWrite: false, fog: false,
      uniforms: {
        uT: dy.U.uT, uUfuk: dy.U.uUfuk, uOrta: dy.U.uOrta, uPembe: dy.U.uPembe,
        uAcik: dy.U.uAcik, uUst: dy.U.uUst, uGunes: dy.U.uGunes, uGunesRenk: dy.U.uGunesRenk, uGece: dy.U.uGece
      },
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: [
        'varying vec3 vP; uniform float uT; uniform float uGece;',
        'uniform vec3 uUfuk, uOrta, uPembe, uAcik, uUst, uGunesRenk; uniform vec2 uGunes;',
        'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
        'void main(){',
        ' float h = clamp((vP.y + 4.0) / 82.0, 0.0, 1.0);',
        ' vec3 c = mix(uUfuk, uOrta, smoothstep(0.0, 0.22, h));',
        ' c = mix(c, uPembe, smoothstep(0.16, 0.34, h) * (1.0 - smoothstep(0.34, 0.5, h)) * 0.6);',
        ' c = mix(c, uAcik, smoothstep(0.26, 0.6, h));',
        ' c = mix(c, uUst, smoothstep(0.55, 1.0, h));',
        ' float ufukPar = exp(-pow(h * 7.2, 2.0)) * (0.28 - 0.14 * uGece);',
        ' c = mix(c, mix(uUfuk, uGunesRenk, 0.42), ufukPar * (0.78 + 0.22 * exp(-abs(vP.x - uGunes.x) * 0.014)));',
        ' c += mix(uUfuk, vec3(1.0, 0.92, 0.78), 0.35) * smoothstep(0.14, 0.0, h) * (0.14 - 0.08 * uGece);',
        ' vec2 g = vP.xy - uGunes; float d = length(g * vec2(1.0, 1.15));',
        ' vec3 dyAyR = mix(uGunesRenk, vec3(0.42, 0.52, 0.95), uGece * 0.75);',
        ' c = mix(c, dyAyR, (0.45 - 0.27 * uGece) * exp(-d * 0.020));',
        ' c = mix(c, mix(dyAyR, vec3(1.0), 0.35), (0.52 - 0.12 * uGece) * exp(-d * 0.048));',
        ' float dySamanyolu = exp(-pow((vP.y - 0.32 * vP.x - 22.0) / 9.0, 2.0)) * uGece * smoothstep(0.25, 0.6, h);',
        ' c += vec3(0.42, 0.36, 0.75) * dySamanyolu * (0.16 + 0.06 * sin(vP.x * 0.21 + vP.y * 0.13));',
        ' c = mix(c, mix(uGunesRenk, vec3(1.0), 0.7), (0.72 + 0.16 * uGece) * exp(-d * 0.15));',
        ' c = mix(c, vec3(1.0, 0.99, 0.95), smoothstep(7.2, 6.2, d));',
        ' float ayHale = exp(-pow((d - 11.2) * 0.22, 2.0)) * 0.22 * uGece * (0.9 + 0.1 * sin(uT * 1.4));',
        ' c += vec3(0.88, 0.90, 1.0) * ayHale;',
        ' float isin = max(0.0, cos(atan(g.y, g.x) * 9.0 + uT * 0.12)) * exp(-d * 0.03) * 0.07 * smoothstep(7.0, 16.0, d) * (1.0 - 0.6 * uGece);',
        ' c += uGunesRenk * isin;',
        ' if (uGece > 0.5) {',
        '   vec2 sg = floor(vP.xy * 0.35); vec2 sf = fract(vP.xy * 0.35) - 0.5;',
        '   float rnd = hash(sg);',
        '   if (rnd > 0.935 && h > 0.12) {',
        '     float tw = 0.55 + 0.45 * sin(uT * (2.2 + rnd * 4.0) + rnd * 50.0);',
        '     float sd = length(sf) * 3.5;',
        '     c += vec3(0.95, 0.92, 1.0) * exp(-sd * sd * 2.2) * tw * smoothstep(0.12, 0.35, h);',
        '   }',
        ' }',
        ' gl_FragColor = vec4(c, 1.0);',
        '}'
      ].join('\n')
    });
    const gok = new T.Mesh(new T.PlaneGeometry(620, 260), m); gok.position.set(20, 40, -150); gok.renderOrder = -10; gr.add(gok);
  }

  // ── 2 · Tombul bulutlar (MeshStandardMaterial ile yumuşak aydınlatma) ──
  {
    const S = dyYapi();
    const pamuk = bNo === 4 || bNo === 15;
    const bAlt = B.gece ? 0x6a70b8 : (pamuk ? 0xffb8d6 : dyKarH(B.gok[1], 0xffffff, 0.55));
    const bUst = B.gece ? 0xb8c0f0 : (pamuk ? 0xfff4fa : 0xffffff);
    // Masal kitabı bulutu: yuvarlak tabanlı, üstü karnabahar gibi kabarık topaklar (yumuşak, pürüzsüz küreler)
    const bul = (x, y, z, k, altR, ustR) => {
      const n = 4 + Math.floor(R() * 3), ustParlak = dyKarH(ustR, 0xffffff, B.gece ? 0.3 : 0.6);
      for (let i = 0; i < n; i++) {
        const u = (i / (n - 1)) * 2 - 1, r = (1.0 - Math.abs(u) * 0.45) * k * ara(0.85, 1.1);
        const px = x + u * k * 2.0, py = y + r * 0.3, pz = z + ara(-0.8, 0.8);
        S.ekle(G.kureO, px, py, pz, r * 1.1, r, r * 0.9, altR, ustR);
      }
      // Üstte iki-üç büyük kabarık topak
      const m = 2 + Math.floor(R() * 2);
      for (let i = 0; i < m; i++) {
        const u = m === 1 ? 0 : (i / (m - 1)) * 2 - 1, r = k * ara(0.95, 1.25) * (1 - Math.abs(u) * 0.2);
        S.ekle(G.kureO, x + u * k * 0.95 + ara(-0.3, 0.3) * k, y + k * 0.75 + r * 0.25, z + 0.4, r, r * 0.9, r * 0.85, dyKarH(altR, ustR, 0.4), ustParlak);
      }
      // Düz, yumuşak alt taban
      S.ekle(G.kureO, x, y - k * 0.05, z + 1, k * 2.8, k * 0.5, k * 0.95, altR, dyKarH(altR, ustR, 0.5));
    };
    const bulSay = pamuk ? 15 : 12;
    const pRenk = [[0xffb0d4, 0xfff0f8], [0xb8dcff, 0xf2f8ff], [0xdcb8ff, 0xf8efff]];
    for (let i = 0; i < bulSay; i++) {
      const pr = bNo === 15 ? pRenk[i % pRenk.length] : [bAlt, bUst];
      bul(-125 + i * 20 + ara(-5, 5), ara(30, 58), ara(-120, -98), ara(2.5, 5.0), pr[0], pr[1]);
    }
    const bm = dyMalz(true, false, 0, { roughness: 0.95, emissive: B.gece ? 0x3a3c78 : dyKarH(B.gok[0], 0xffffff, 0.5), emissiveIntensity: B.gece ? 0.5 : 0.62 });
    dy.bulutMesh = new T.Mesh(S.geo(), bm); gr.add(dy.bulutMesh);
  }

  // ── 3 · Sisli pastel dağlar (3 katman tek birleşik mesh, MeshStandardMaterial) ──
  {
    const pos = [], nor = [], col = [], cKar = new T.Color(0xfffaf0), N = 160, x0 = -240, x1 = 290;
    const cKizil = bNo === 9 ? new T.Color(0x9e2b22) : null;
    const cTuruncu = bNo === 9 ? new T.Color(0xe46232) : null;
    const cKehribar = bNo === 9 ? new T.Color(0xf6a64e) : null;
    const dag = (z, taban, yuk, frek, ust, alt, tohum, karli) => {
      const c1 = new T.Color(ust), c2 = new T.Color(alt);
      const h = (x) => {
        if (bNo === 9) { // Gün Batımı Kanyonu: düz tepeli mesa & kanyon silueti
          const w = 0.5 + 0.5 * Math.sin(x * frek * 1.2 + tohum);
          return taban + yuk * (w > 0.55 ? 0.85 : w > 0.3 ? 0.45 : 0.12);
        }
        return taban + yuk * (0.55 * (0.5 + 0.5 * Math.sin(x * frek + tohum)) + 0.3 * (0.5 + 0.5 * Math.sin(x * frek * 2.3 + tohum * 1.7)) + 0.15 * (0.5 + 0.5 * Math.sin(x * frek * 5.1 + tohum * 0.3)));
      };
      for (let i = 0; i < N; i++) {
        const xa = x0 + (x1 - x0) * i / N, xb = x0 + (x1 - x0) * (i + 1) / N, ha = h(xa), hb = h(xb), y0 = -20;
        pos.push(xa, y0, z, xb, y0, z, xb, hb, z, xa, y0, z, xb, hb, z, xa, ha, z);
        for (let k = 0; k < 6; k++) nor.push(0, 0, 1);
        const ca = (y) => {
          const t = Math.min(1, Math.max(0, (y - y0 + 6) / (taban + yuk - y0 + 6)));
          const r = c2.r + (c1.r - c2.r) * t, g = c2.g + (c1.g - c2.g) * t, b = c2.b + (c1.b - c2.b) * t;
          if (karli && t > 0.64) {
            const kt = Math.min(1, (t - 0.64) / 0.16);
            const kRenk = t > 0.78 ? 1.0 : 0.92;
            return [r + (cKar.r * kRenk - r) * kt, g + (cKar.g * kRenk - g) * kt, b + (cKar.b - b) * kt];
          }
          if (bNo === 9) {
            const seritA = 0.5 + 0.5 * Math.sin(y * 0.95 + tohum);
            const seritB = 0.5 + 0.5 * Math.sin(y * 2.35 - tohum * 0.6);
            const sc = seritA < 0.38 ? cKizil : (seritA < 0.72 ? cTuruncu : cKehribar);
            const k = 0.24 + 0.28 * seritB;
            return [r + (sc.r - r) * k, g + (sc.g - g) * k, b + (sc.b - b) * k];
          }
          return [r, g, b];
        };
        for (const y of [y0, y0, hb, y0, hb, ha]) col.push(...ca(y));
      }
    };
    const dYuk = bNo === 8 ? 1.35 : 1.0;
    dag(-132, 8, 28 * dYuk, 0.028, B.dag[0][0], B.dag[0][1], 1.3, bNo === 8);
    dag(-112, 4, 20 * dYuk, 0.041, B.dag[1][0], B.dag[1][1], 4.1, bNo === 8);
    dag(-92, 1, 13 * dYuk, 0.062, B.dag[2][0], B.dag[2][1], 2.2, bNo === 8);
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new T.Float32BufferAttribute(nor, 3));
    g.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    const dm = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0.0, fog: false, emissive: B.gece ? 0x101028 : 0x554e58, emissiveIntensity: B.gece ? 0.5 : 0.65 });
    gr.add(new T.Mesh(g, dm));
  }

  // ── Bölüm 7 & 15: Gökkuşağı kemeri (Bölüm 15'te daha yumuşak pamuk şeker pasteli) ──
  if (bNo === 7 || bNo === 15) {
    const GK = dyYapi();
    const gRenk = bNo === 15
      ? [0xffa6c9, 0xffc6a8, 0xfff0b3, 0xb8f2d0, 0xb2e2ff, 0xc8c4ff, 0xe8baff]
      : [0xff5c8d, 0xff9b42, 0xffe64d, 0x5ee886, 0x4cc4ff, 0x7c84ff, 0xc96eff];
    const rx = hx * 0.52, ry = 5, rz = -86;
    for (let i = 0; i < gRenk.length; i++) {
      const rad = 47 - i * 1.75;
      const tGeo = new T.TorusGeometry(rad, 1.2, 8, 56, PI);
      GK.ekle(tGeo, rx, ry, rz - i * 0.05, 1.15, 0.85, 1, gRenk[i], gRenk[i]);
      tGeo.dispose();
    }
    const gMat = new T.MeshBasicMaterial({ vertexColors: true, fog: false, transparent: true, opacity: bNo === 15 ? 0.56 : 0.94 });
    gr.add(new T.Mesh(GK.geo(), gMat));
  }

  // ── Bölüm 17 & 20: Gökyüzünde yeşil-mor aurora şeridi ──
  if (bNo === 17 || bNo === 20) {
    const ag = new T.PlaneGeometry(340, 32, 64, 4);
    const ap = ag.attributes.position;
    for (let i = 0; i < ap.count; i++) {
      const x = ap.getX(i), y = ap.getY(i);
      const z = Math.sin(x * 0.032) * 14 + Math.cos(x * 0.065) * 6;
      ap.setZ(i, z);
      ap.setY(i, y + Math.sin(x * 0.024 + 0.7) * 5.5);
    }
    ag.computeVertexNormals();
    const am = new T.ShaderMaterial({
      transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false, side: T.DoubleSide,
      uniforms: { uT: dy.U.uT },
      vertexShader: 'varying vec2 vU; uniform float uT; void main(){ vU = uv; vec3 p = position; p.y += sin(p.x * 0.045 + uT * 0.55) * 2.4; p.z += cos(p.x * 0.035 - uT * 0.4) * 3.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
      fragmentShader: [
        'varying vec2 vU; uniform float uT;',
        'void main(){',
        ' float kenar = smoothstep(0.0, 0.25, vU.y) * smoothstep(1.0, 0.35, vU.y) * smoothstep(0.0, 0.08, vU.x) * smoothstep(1.0, 0.92, vU.x);',
        ' float perde = 0.5 + 0.5 * sin(vU.x * 34.0 + uT * 0.85 + sin(vU.x * 13.0 - uT * 0.45) * 2.2);',
        ' float dalga = 0.55 + 0.45 * sin(vU.x * 19.0 - uT * 0.65);',
        ' vec3 yesil = vec3(0.16, 0.96, 0.58);',
        ' vec3 cam = vec3(0.22, 0.82, 0.96);',
        ' vec3 mor = vec3(0.68, 0.32, 0.98);',
        ' vec3 c = mix(yesil, cam, smoothstep(0.2, 0.65, vU.y));',
        ' c = mix(c, mor, smoothstep(0.55, 1.0, vU.y) * 0.85 + 0.15 * sin(vU.x * 9.0 + uT * 0.3));',
        ' float a = kenar * pow(perde, 1.2) * dalga * 0.78;',
        ' gl_FragColor = vec4(c * a, 1.0);',
        '}'
      ].join('\n')
    });
    const aurora = new T.Mesh(ag, am);
    aurora.position.set(40, 39, -108);
    aurora.renderOrder = -2;
    gr.add(aurora);
  }

  // ── 4 · Orta katman: tepeler, ağaçlar, biyom özel yapıları, sis şeritleri ──
  const yerY = (x, z) => {
    const arka = Math.max(0, (-z - 4) / 30);
    return arka * (0.6 + 0.6 * Math.sin(x * 0.11 + z * 0.07) + 0.4 * Math.sin(x * 0.23 - z * 0.13)) * Math.min(1, arka * 1.5) * 1.6 - (z > 6 ? (z - 6) * 0.05 : 0);
  };
  {
    const S = dyYapi(), A = dyYapi();
    const tepeler = [[-70, -62, 30, 13], [-30, -70, 34, 15], [12, -66, 28, 11], [50, -72, 36, 14], [92, -64, 30, 12], [135, -70, 34, 14], [-110, -70, 32, 14],
                     [-48, -44, 22, 7], [-8, -48, 24, 6], [30, -46, 22, 6.5], [68, -50, 26, 7], [104, -44, 22, 6], [140, -46, 24, 6.5]];
    for (const [x, z, r, h] of tepeler) {
      if (bNo === 9) { // Gün Batımı Kanyonu: kaya oluşumları
        S.ekle(G.kule, x, h * 0.45 - 1, z, r * 0.48, h * 1.1, r * 0.3, B.tepe[0], B.tepe[1]);
      } else {
        S.ekle(G.kubbe, x, -1, z, r, h, r * 0.5, z < -55 ? B.tepe[2] : B.tepe[0], z < -55 ? B.tepe[3] : B.tepe[1]);
      }
    }
    const tepeY = (x, z) => { let y = 0; for (const [tx, tz, r, h] of tepeler) { const d = Math.hypot((x - tx) / r, (z - tz) / (r * 0.5)); if (d < 1) y = Math.max(y, -1 + h * Math.sqrt(1 - d * d)); } return y; };
    // Ön sıra tepelerin yamaçlarında renkli çiçek tarlası şeritleri (her tepe kendi renginde)
    if (bNo !== 9 && !B.gece) {
      let ti = 0;
      for (const [x, z, r, h] of tepeler) {
        if (z < -55) continue;
        const fc = B.cicek[ti++ % B.cicek.length], fc2 = B.cicek[(ti + 1) % B.cicek.length];
        // Yamaçta 3 yumuşak çiçek kümesi: ortası sık ve iri, kenarları seyrek, küçük ve tepe rengine karışan
        for (let kume = 0; kume < 3; kume++) {
          const serit = ara(0.3, 0.62), f0 = ara(0.3, 0.7), yay = ara(0.1, 0.17);
          for (let k = 0; k < 22; k++) {
            const aa = R() * Math.PI * 2, rr = R() * R();
            const c = Math.min(0.85, Math.max(0.15, serit + Math.sin(aa) * rr * yay * 0.8)), sn = Math.sqrt(1 - c * c), f = (f0 + Math.cos(aa) * rr * yay) * Math.PI;
            const s = (0.3 - rr * 0.16) * ara(0.8, 1.15), renk = R() < 0.22 ? fc2 : fc, karis = rr * 0.55;
            S.ekle(G.kureC, x + r * sn * Math.cos(f) * 1.01, -1 + h * c * 1.01, z + 0.5 * r * sn * Math.sin(f) * 1.01, s, s * 0.8, 0.3, dyKarH(renk[0], B.tepe[1], karis), dyKarH(renk[1], B.tepe[1], karis * 0.6));
          }
        }
      }
    }

    const tac = (x, y, z, k, ust, alt, tA = A) => {
      tA.nc = [x, y, z + 0.4 * k];
      const kg = z < -32 ? G.kureU : G.kureO;
      const mid = dyKarH(alt, ust, 0.45), acik = dyKarH(ust, 0xffffff, 0.14);
      tA.ekle(kg, x, y - 0.12 * k, z - 0.08 * k, 1.85 * k, 1.35 * k, 1.45 * k, alt, mid, 0, 0, 0, 0.34 * k);
      for (let j = 0; j < 5; j++) {
        const a = j / 5 * PI * 2 + R() * 0.6, r = ara(0.82, 1.08) * k;
        tA.ekle(kg, x + Math.cos(a) * 1.22 * k, y + Math.sin(a) * 0.56 * k + (j % 2 ? 0.16 : -0.06) * k, z + 0.42 * k, r * 1.05, r * 0.9, r * 0.82, alt, mid, 0, 0, 0, 0.28 * k);
      }
      for (let j = 0; j < 3; j++) {
        const a = j / 3 * PI * 2 + 0.5 + R() * 0.4, r = ara(0.76, 0.96) * k;
        tA.ekle(kg, x + Math.cos(a) * 0.68 * k, y + 0.68 * k + (j % 2) * 0.16 * k, z + 0.32 * k, r * 1.05, r * 0.88, r * 0.85, mid, ust, 0, 0, 0, 0.42 * k);
      }
      tA.ekle(kg, x + ara(-0.18, 0.18) * k, y + 1.02 * k, z + 0.18 * k, 1.06 * k, 0.86 * k, 0.92 * k, ust, acik, 0, 0, 0, 0.48 * k);
      if (z > -38) {
        const cicekMi = bNo === 4 || bNo === 11 || bNo === 15 || bNo === 10 || bNo === 17 || bNo === 20;
        const meyveRenk = [[0xe84a3c, 0xff8a70], [0xffaa28, 0xffe478], [0xe85a7a, 0xff9ec0]];
        const adet = cicekMi ? 5 : 4;
        for (let m = 0; m < adet; m++) {
          const ma = m / adet * PI * 1.35 - 0.55 + R() * 0.25;
          const mx = x + Math.sin(ma) * 1.25 * k, my = y + Math.cos(ma * 1.2) * 0.55 * k + (m % 2 ? 0.15 : -0.25) * k;
          const mz = z + (0.72 + (m % 2) * 0.25) * k;
          const rk = (cicekMi || bNo === 16 || m % 2 === 0) ? B.cicek[m % B.cicek.length] : meyveRenk[(m + bNo) % meyveRenk.length];
          const br = (cicekMi ? 0.17 : 0.14) * k;
          tA.ekle(G.kureK, mx, my, mz, br, br, br * 0.9, rk[0], rk[1], 0, 0, 0, 0.34 * k);
        }
      }
      tA.nc = null;
    };
    const kokler = (x, yy, z, k, koyu, acik, tS) => {
      if (z <= -42) return;
      for (let r = 0; r < 3; r++) {
        const ra = (r - 1) * 0.95 + (r === 1 ? 0.2 : 0);
        tS.ekle(G.kureK, x + Math.cos(ra) * 0.32 * k, yy + 0.12 * k, z + Math.sin(ra) * 0.22 * k, 0.28 * k, 0.14 * k, 0.18 * k, koyu, acik, 0, -ra, 0.25);
      }
      tS.ekle(G.kureK, x - 0.22 * k, yy + 0.1 * k, z + 0.22 * k, 0.2 * k, 0.11 * k, 0.16 * k, B.cimen[0], B.cimen[1]);
      tS.ekle(G.kureK, x + 0.24 * k, yy + 0.09 * k, z + 0.18 * k, 0.18 * k, 0.1 * k, 0.15 * k, B.cimen[0], B.cimen[2]);
    };
    const agac = (x, yy, z, k, ust, alt, tS = S, tA = A) => {
      const govAlt = alt || B.agac[0][0];
      if (bNo === 8) { // Altın Dağ Geçidi: katmanlı kar şapkalı çam ağaçları
        tS.ekle(G.kule, x, yy + 1.05 * k, z, 0.24 * k, 2.1 * k, 0.24 * k, 0x4e301e, 0x785036);
        kokler(x, yy, z, k, 0x4a2c1a, 0x6e4830, tS);
        if (z > -42) tS.ekle(G.kubbe, x, yy - 0.02 * k, z, 0.72 * k, 0.26 * k, 0.62 * k, 0xd8e8f6, 0xffffff);
        tA.ekle(G.koni, x, yy + 2.3 * k, z, 1.9 * k, 2.15 * k, 1.9 * k, govAlt, ust, 0, 0, 0, 0.12 * k);
        tA.ekle(G.koni, x, yy + 3.35 * k, z, 1.58 * k, 1.95 * k, 1.58 * k, govAlt, ust, 0, 0.4, 0, 0.18 * k);
        tA.ekle(G.koni, x, yy + 4.35 * k, z, 1.26 * k, 1.75 * k, 1.26 * k, ust, 0xdcecf6, 0, 0.8, 0, 0.24 * k);
        tA.ekle(G.koni, x, yy + 5.25 * k, z, 0.92 * k, 1.5 * k, 0.92 * k, 0xe4f2fa, 0xffffff, 0, 0.2, 0, 0.3 * k);
        tA.ekle(G.koni, x, yy + 5.95 * k, z, 0.56 * k, 1.15 * k, 0.56 * k, 0xf2f8ff, 0xffffff, 0, 0, 0, 0.35 * k);
        if (z > -42) {
          for (let p = 0; p < 4; p++) {
            const pa = (p / 4) * PI * 2 + 0.35;
            tA.ekle(G.kureK, x + Math.cos(pa) * 0.98 * k, yy + 2.48 * k, z + Math.sin(pa) * 0.88 * k, 0.34 * k, 0.2 * k, 0.32 * k, 0xe2effa, 0xffffff, 0, 0, 0, 0.16 * k);
          }
          tA.ekle(G.kureK, x, yy + 6.52 * k, z, 0.16 * k, 0.14 * k, 0.16 * k, 0xf4f9ff, 0xffffff, 0, 0, 0, 0.35 * k);
        }
        return;
      }
      if (bNo === 3) { // Esintili Vadi: katmanlı ince uzun selvi ağaçları
        tS.ekle(G.kule, x, yy + 1.3 * k, z, 0.22 * k, 2.6 * k, 0.22 * k, 0x62402c, 0x9a6c48);
        kokler(x, yy, z, k, 0x563826, 0x865c3e, tS);
        const mid = dyKarH(govAlt, ust, 0.5);
        tA.nc = [x, yy + 4.2 * k, z + 0.3 * k];
        tA.ekle(G.kureO, x, yy + 2.95 * k, z, 1.05 * k, 1.15 * k, 1.0 * k, govAlt, mid, 0, 0, 0, 0.22 * k);
        tA.ekle(G.kureO, x - 0.12 * k, yy + 3.95 * k, z + 0.08 * k, 0.92 * k, 1.2 * k, 0.9 * k, govAlt, ust, 0, 0, 0.04, 0.34 * k);
        tA.ekle(G.kureO, x + 0.08 * k, yy + 4.95 * k, z + 0.04 * k, 0.72 * k, 1.15 * k, 0.72 * k, mid, ust, 0, 0, -0.04, 0.46 * k);
        tA.ekle(G.kureO, x, yy + 5.85 * k, z, 0.44 * k, 0.85 * k, 0.44 * k, ust, dyKarH(ust, 0xffffff, 0.15), 0, 0, 0, 0.55 * k);
        tA.nc = null;
        return;
      }
      if (bNo === 11) { // Kiraz Çiçeği Bahçesi: koyu kiraz gövdeli pembe çiçekli ağaçlar
        tS.ekle(G.kule, x, yy + 1.55 * k, z, 0.28 * k, 3.1 * k, 0.28 * k, 0x4a2630, 0x764452);
        kokler(x, yy, z, k, 0x42222c, 0x6c3e4c, tS);
        tS.ekle(G.kule, x + 0.44 * k, yy + 2.65 * k, z, 0.12 * k, 1.3 * k, 0.12 * k, 0x542e38, 0x7e4c58, 0, 0, -0.78);
        tS.ekle(G.kule, x - 0.4 * k, yy + 2.42 * k, z, 0.11 * k, 1.1 * k, 0.11 * k, 0x542e38, 0x7e4c58, 0, 0, 0.74);
        tac(x, yy + 4.35 * k, z, k * 1.1, ust, govAlt, tA);
        tA.ekle(G.kureO, x - 0.68 * k, yy + 4.95 * k, z + 0.36 * k, 0.82 * k, 0.62 * k, 0.68 * k, 0xff94c0, 0xfff4fa, 0, 0, 0.12, 0.28 * k);
        tA.ekle(G.kureO, x + 0.72 * k, yy + 4.65 * k, z + 0.38 * k, 0.76 * k, 0.58 * k, 0.64 * k, 0xffaad0, 0xffffff, 0, 0, -0.12, 0.26 * k);
        for (let p = 0; p < 4; p++) {
          const px = x + (p - 1.5) * 0.95 * k, py = yy + (3.15 + (p % 2) * 0.5) * k;
          tA.ekle(G.kureK, px, py, z + 0.58 * k, 0.36 * k, 0.26 * k, 0.28 * k, 0xff9ec4, 0xfff0f8, 0, 0, 0, 0.26 * k);
        }
        if (z > -32) {
          for (let p = 0; p < 5; p++) {
            const pa = (p / 5) * PI * 2 + x * 0.4;
            tS.ekle(G.kureC, x + Math.cos(pa) * 0.72 * k, yy + 0.04, z + Math.sin(pa) * 0.48 * k, 0.14 * k, 0.025, 0.11 * k, 0xff9ec4, 0xfff0f8);
          }
        }
        return;
      }
      if (bNo === 16) { // Akçaağaç Ormanı: kızıl-turuncu-altın üç tonlu sonbahar ağaçları
        tS.ekle(G.kule, x, yy + 1.65 * k, z, 0.29 * k, 3.3 * k, 0.29 * k, 0x522e1e, 0x824e36);
        kokler(x, yy, z, k, 0x4a281a, 0x74442e, tS);
        tS.ekle(G.kule, x + 0.38 * k, yy + 2.75 * k, z, 0.12 * k, 1.18 * k, 0.12 * k, 0x623a26, 0x8c563c, 0, 0, -0.72);
        tS.ekle(G.kule, x - 0.34 * k, yy + 2.55 * k, z, 0.1 * k, 0.98 * k, 0.1 * k, 0x623a26, 0x8c563c, 0, 0, 0.68);
        tac(x, yy + 4.5 * k, z, k * 1.06, ust, govAlt, tA);
        tA.ekle(G.kureO, x - 0.62 * k, yy + 5.25 * k, z + 0.35 * k, 0.88 * k, 0.72 * k, 0.72 * k, 0xd84420, 0xffa838, 0, 0, 0, 0.3 * k);
        tA.ekle(G.kureO, x + 0.65 * k, yy + 4.85 * k, z + 0.42 * k, 0.72 * k, 0.62 * k, 0.64 * k, 0xe87824, 0xffcc50, 0, 0, 0, 0.26 * k);
        tA.ekle(G.kureK, x + 0.1 * k, yy + 5.75 * k, z + 0.28 * k, 0.68 * k, 0.56 * k, 0.6 * k, 0xf2a428, 0xffe670, 0, 0, 0, 0.32 * k);
        if (z > -32) {
          for (let p = 0; p < 4; p++) {
            const pa = (p / 4) * PI * 2 + x * 0.3;
            tS.ekle(G.kureC, x + Math.cos(pa) * 0.78 * k, yy + 0.04, z + Math.sin(pa) * 0.5 * k, 0.16 * k, 0.03, 0.12 * k, p % 2 ? 0xe87820 : 0xd84824, 0xffc048);
          }
        }
        return;
      }
      tS.ekle(G.kule, x, yy + 1.6 * k, z, 0.29 * k, 3.25 * k, 0.29 * k, 0x623e2a, 0x9a6c48);
      kokler(x, yy, z, k, 0x543422, 0x845838, tS);
      tS.ekle(G.kule, x + 0.36 * k, yy + 2.72 * k, z, 0.12 * k, 1.15 * k, 0.12 * k, 0x724a32, 0x9a6c48, 0, 0, -0.72);
      tS.ekle(G.kule, x - 0.32 * k, yy + 2.52 * k, z, 0.1 * k, 0.95 * k, 0.1 * k, 0x724a32, 0x9a6c48, 0, 0, 0.68);
      if (k >= 1.2 && z > -30) {
        tS.ekle(G.kureK, x, yy + 1.55 * k, z + 0.24 * k, 0.15 * k, 0.21 * k, 0.08 * k, 0x9a6c48, 0xb8845a);
        tS.ekle(G.kureK, x, yy + 1.55 * k, z + 0.28 * k, 0.1 * k, 0.15 * k, 0.05 * k, 0x2c1810, 0x3c2218);
      }
      tac(x, yy + 4.42 * k, z, k, ust, govAlt, tA);
    };

    if (bNo !== 9) {
      for (let i = 0; i < 11; i++) {
        const cx = -105 + i * 24 + ara(-6, 6), cz = ara(-58, -32), n = 2 + Math.floor(R() * 2);
        for (let j = 0; j < n; j++) {
          const x = cx + ara(-5, 5), z = cz + ara(-3, 3), y = tepeY(x, z);
          if (x > -6 && x < hx + 8 && z > -40) continue;
          const k = [0.75, 1.0, 1.35][Math.floor(R() * 3)], sol = Math.min(0.3, Math.max(0, (-z - 34) / 70)), tn = B.agac[(i + j) % B.agac.length];
          agac(x, Math.max(0, y - 0.6), z, k, dyKarH(tn[1], B.sisRenk, sol), dyKarH(tn[0], B.sisRenk, sol));
        }
      }
      agac(-14, 0, -18, 1.5, B.agac[0][1], B.agac[0][0]);
      agac(-22, 0, -26, 1.8, B.agac[1][1], B.agac[1][0]);
      agac(hx + 18, 0, -24, 1.25, B.agac[2][1], B.agac[2][0]);
      agac(hx + 24, 0, -28, 1.9, B.agac[1][1], B.agac[1][0]);
    } else {
      // Gün Batımı Kanyonu: katmanlı kızıl-turuncu kanyon kayaları ve mesalar
      const kRenk = [
        [0x862820, 0xc84e30],
        [0xa83a28, 0xe86c42],
        [0xc44e2e, 0xf48c50],
        [0x76221e, 0xb8422c]
      ];
      for (let i = 0; i < 21; i++) {
        const x = -52 + i * 9.5 + ara(-2.8, 2.8), z = ara(-52, -16), k = ara(1.25, 3.2);
        if (x > -4 && x < hx + 6 && z > -24) continue;
        const katSay = 3 + (i % 2);
        let yTaban = 0;
        for (let kat = 0; kat < katSay; kat++) {
          const oran = 1 - kat * 0.22;
          const kh = k * (0.85 - kat * 0.12);
          const rk = kRenk[(i + kat) % kRenk.length];
          const mx = x + (kat % 2 ? 0.18 : -0.14) * k;
          S.ekle(G.kule, mx, yTaban + kh * 0.5, z, k * 1.3 * oran, kh, k * 0.95 * oran, rk[0], rk[1]);
          // Yatay kızıl / turuncu / kehribar tortul şerit katmanı
          S.ekle(G.kule, mx, yTaban + kh * 0.88, z + 0.04, k * 1.34 * oran, kh * 0.16, k * 0.98 * oran, 0xd85a2c, 0xf6b052);
          yTaban += kh * 0.88;
        }
        const ustOran = 1 - (katSay - 1) * 0.22;
        S.ekle(G.kubbe, x + ((katSay - 1) % 2 ? 0.18 : -0.14) * k, yTaban, z, k * 1.18 * ustOran, k * 0.24, k * 0.88 * ustOran, 0xe87c3a, 0xffcc74);
        if (i % 2 === 0) S.ekle(G.kureO, x + k * 0.9, k * 0.45, z + 0.45, k * 0.95, k * 0.55, k * 0.72, kRenk[0][0], kRenk[1][1]);
        if (i % 3 === 0) S.ekle(G.kureO, x - k * 0.85, k * 0.34, z + 0.38, k * 0.72, k * 0.42, k * 0.56, kRenk[1][0], kRenk[2][1]);
      }
    }

    // Orta çayır çalıları (katmanlı ve çiçekli)
    const cali = (x, z, k) => {
      const y = yerY(x, z), cAlt = B.agac[0][0], cOrta = B.agac[0][1], cUst = B.agac[1][1];
      A.nc = [x, y, z + 0.3 * k];
      A.ekle(G.kureO, x, y + 0.36 * k, z, 1.32 * k, 0.92 * k, 0.92 * k, cAlt, cOrta, 0, 0, 0, 0.12 * k);
      A.ekle(G.kureO, x - 0.88 * k, y + 0.18 * k, z + 0.2 * k, 0.82 * k, 0.66 * k, 0.72 * k, cAlt, cUst, 0, 0, 0, 0.1 * k);
      A.ekle(G.kureO, x + 0.92 * k, y + 0.14 * k, z + 0.2 * k, 0.78 * k, 0.62 * k, 0.68 * k, cAlt, cUst, 0, 0, 0, 0.1 * k);
      A.ekle(G.kureO, x - 0.25 * k, y + 0.72 * k, z + 0.12 * k, 0.74 * k, 0.56 * k, 0.65 * k, cOrta, cUst, 0, 0, 0, 0.14 * k);
      A.ekle(G.kureO, x + 0.35 * k, y + 0.58 * k, z + 0.28 * k, 0.65 * k, 0.5 * k, 0.58 * k, cOrta, cUst, 0, 0, 0, 0.14 * k);
      for (let f = 0; f < 3; f++) {
        const fc = B.cicek[f % B.cicek.length];
        A.ekle(G.kureK, x + (f - 1) * 0.58 * k, y + (0.44 + (f % 2) * 0.22) * k, z + 0.65 * k, 0.14 * k, 0.14 * k, 0.11 * k, fc[0], fc[1], 0, 0, 0, 0.12 * k);
      }
      A.nc = null;
    };
    for (const [x, z, k] of [[-9, -22, 1.3], [6, -26, 1.0], [24, -21, 1.2], [29, -24, 0.9], [44, -27, 1.1], [52, -19, 1.3], [-18, -14, 1.1], [16, -36, 0.9], [72, -23, 1.15], [92, -25, 1.05]]) {
      if (bNo !== 9) cali(x, z, k);
    }

    // Bölüm 8: Altın Dağ Geçidi orta planına küçük karlı çam/kaya kümeleri (S/A birleşik geometrisi, 0 ek çizim çağrısı)
    if (bNo === 8) {
      for (let i = 0; i < 3; i++) {
        const [cx, cz, sc] = [[-5, -15.5, 0.68], [21, -17.5, 0.64], [hx + 11, -16.5, 0.7]][i];
        const cy = yerY(cx, cz) - 0.15, tn = B.agac[i % B.agac.length];
        S.ekle(G.kureO, cx - 0.55 * sc, cy + 0.34 * sc, cz + 0.25 * sc, 0.92 * sc, 0.58 * sc, 0.76 * sc, 0x646a76, 0x9aa2b0);
        S.ekle(G.kubbe, cx - 0.55 * sc, cy + 0.58 * sc, cz + 0.25 * sc, 0.72 * sc, 0.24 * sc, 0.6 * sc, 0xdce8f4, 0xffffff);
        S.ekle(G.kureO, cx + 0.72 * sc, cy + 0.24 * sc, cz + 0.4 * sc, 0.62 * sc, 0.42 * sc, 0.54 * sc, 0x5c626e, 0x8e96a4);
        S.ekle(G.kubbe, cx + 0.72 * sc, cy + 0.42 * sc, cz + 0.4 * sc, 0.48 * sc, 0.16 * sc, 0.42 * sc, 0xe4eef8, 0xffffff);
        agac(cx + 0.1 * sc, cy, cz - 0.15 * sc, sc * 0.62, tn[1], tn[0]);
        agac(cx - 0.95 * sc, cy, cz - 0.35 * sc, sc * 0.45, B.agac[(i + 1) % B.agac.length][1], B.agac[(i + 1) % B.agac.length][0]);
      }
    }

    // Bölüm 11: Kiraz Çiçeği Bahçesi orta planına pembe çiçek kümeleri (A birleşik geometrisi, 0 ek çizim çağrısı)
    if (bNo === 11) {
      const kumeYer = [
        [-20, -16, 1.1], [-11, -18, 1.0], [-2, -14, 0.95], [8, -21, 1.15],
        [16, -16, 1.05], [25, -23, 1.15], [33, -17, 1.0], [41, -21, 1.1],
        [50, -15, 0.95], [60, -23, 1.15], [70, -17, 1.05], [82, -20, 1.1], [94, -18, 1.0]
      ];
      const pembeTon = [[0xff78a8, 0xffd2e6], [0xff96be, 0xffe6f2], [0xffb4d2, 0xfff4f8]];
      for (let i = 0; i < kumeYer.length; i++) {
        const [cx, cz, sc] = kumeYer[i], cy = yerY(cx, cz);
        A.nc = [cx, cy, cz + 0.25 * sc];
        A.ekle(G.kureO, cx, cy + 0.16 * sc, cz, 0.72 * sc, 0.34 * sc, 0.56 * sc, B.agac[0][0], 0xffbed8, 0, 0, 0, 0.08 * sc);
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * PI * 2 + i * 0.7;
          const px = cx + Math.cos(a) * 0.44 * sc, pz = cz + Math.sin(a) * 0.32 * sc;
          const rk = pembeTon[(i + k) % pembeTon.length];
          A.ekle(G.kureK, px, cy + (0.28 + (k % 2) * 0.12) * sc, pz, 0.26 * sc, 0.22 * sc, 0.24 * sc, rk[0], rk[1], 0, 0, 0, 0.1 * sc);
        }
        A.ekle(G.kureK, cx, cy + 0.42 * sc, cz + 0.06 * sc, 0.24 * sc, 0.2 * sc, 0.22 * sc, 0xff8ab8, 0xfff0f8, 0, 0, 0, 0.12 * sc);
        A.nc = null;
      }
    }

    // Bölüm 18: Yüzen Masal Adaları (havada süzülen yeşil-kayalık adacıklar + sarkan sarmaşıklar)
    if (bNo === 18) {
      const AS = dyYapi(), AA = dyYapi();
      for (const [ax, ay, az, sc] of [[-12, 14, -36, 1.4], [18, 18, -46, 1.8], [46, 15, -38, 1.5], [76, 19, -48, 1.9], [104, 14, -34, 1.3]]) {
        AS.ekle(G.koni, ax, ay - 1.6 * sc, az, 3.2 * sc, 3.2 * sc, 2.2 * sc, 0x8e765c, 0xc2a482, PI, 0, 0);
        AS.ekle(G.kureO, ax - 1.1 * sc, ay - 0.5 * sc, az + 0.3 * sc, 1.1 * sc, 0.8 * sc, 0.9 * sc, 0x7e6850, 0xb29472);
        AS.ekle(G.kureO, ax + 1.1 * sc, ay - 0.6 * sc, az + 0.2 * sc, 1.0 * sc, 0.7 * sc, 0.85 * sc, 0x7e6850, 0xb29472);
        AA.ekle(G.kubbe, ax, ay - 0.1 * sc, az, 3.35 * sc, 1.1 * sc, 2.35 * sc, B.zemin[1], B.zemin[0]);
        agac(ax - 0.7 * sc, ay + 0.55 * sc, az + 0.1, 0.68 * sc, B.agac[0][1], B.agac[0][0], AS, AA);
        agac(ax + 1.1 * sc, ay + 0.35 * sc, az - 0.2, 0.48 * sc, B.agac[1][1], B.agac[1][0], AS, AA);
        // Adanın altından sarkan sarmaşıklar
        for (let v = 0; v < 5; v++) {
          const ox = -2.2 + v * 1.1 + (v % 2 ? 0.18 : -0.14);
          const vx = ax + ox * sc, vz = az + (1.05 - Math.abs(ox) * 0.22) * sc;
          const len = (1.15 + (v % 3) * 0.55) * sc, tilt = (v % 2 ? 0.06 : -0.06);
          AA.ekle(G.silA, vx, ay - 0.35 * sc - len * 0.5, vz, 0.045 * sc, len, 0.045 * sc, 0x2d7a36, 0x62ba48, 0, 0, tilt, -0.18 * sc);
          for (let k = 0; k < 3; k++) {
            const ky = ay - 0.42 * sc - len * (0.3 + k * 0.32);
            AA.ekle(G.kureK, vx + (k % 2 ? 0.08 : -0.08) * sc, ky, vz + 0.05 * sc, 0.14 * sc, 0.18 * sc, 0.09 * sc, 0x3b8f3e, 0x8ad45a, 0, 0, (k % 2 ? 0.25 : -0.25), -0.22 * sc);
          }
        }
        // Adanın tam altında yumuşak beyaz-pastel bulut yastığı (mevcut AS ağında 0 ek çizim çağrısı)
        AS.nc = [ax, ay - 2.9 * sc, az];
        AS.ekle(G.kureU, ax, ay - 2.95 * sc, az, 3.0 * sc, 0.85 * sc, 2.05 * sc, 0xdce8f8, 0xfff8fc);
        AS.ekle(G.kureU, ax - 1.75 * sc, ay - 2.7 * sc, az + 0.25 * sc, 1.55 * sc, 0.95 * sc, 1.25 * sc, 0xe2eaf8, 0xffffff);
        AS.ekle(G.kureU, ax + 1.8 * sc, ay - 2.65 * sc, az - 0.15 * sc, 1.5 * sc, 0.9 * sc, 1.2 * sc, 0xe8e4f8, 0xfff8fe);
        AS.ekle(G.kureU, ax - 0.55 * sc, ay - 2.8 * sc, az + 0.95 * sc, 1.35 * sc, 0.8 * sc, 1.05 * sc, 0xe6eefc, 0xffffff);
        AS.ekle(G.kureU, ax + 0.65 * sc, ay - 2.75 * sc, az - 0.85 * sc, 1.3 * sc, 0.82 * sc, 1.0 * sc, 0xeadcf8, 0xfffaff);
        AS.nc = null;
      }
      dy.yuzenAdalar = new T.Group();
      const asM = new T.Mesh(AS.geo(), dyMalz(true)); asM.castShadow = true; asM.receiveShadow = true;
      const aaM = new T.Mesh(AA.geo(), dyMalz(true, true, 0.55, { emissive: B.gece ? 0x061014 : 0x26300e })); aaM.castShadow = true; aaM.receiveShadow = true;
      dy.yuzenAdalar.add(asM, aaM);
      gr.add(dy.yuzenAdalar);
    }

    // Bölüm 19: Altın Şafak Tapınağı (antik masal taş kemerleri + sıcak parlayan altın güneş rozeti)
    if (bNo === 19) {
      const ROZ = dyYapi();
      for (const [tx, tz, sc] of [[-8, -18, 1.15], [18, -22, 1.35], [48, -19, 1.25], [78, -21, 1.3], [104, -18, 1.15]]) {
        const ty = yerY(tx, tz) - 0.15, w = 2.0 * sc, h = 4.2 * sc;
        S.ekle(G.kutu, tx, ty + 0.18 * sc, tz, (w * 2 + 1.4 * sc), 0.36 * sc, 1.35 * sc, 0xc8b294, 0xefe0c8);
        for (const q of [-1, 1]) {
          S.ekle(G.sil, tx + q * w, ty + h * 0.5, tz, 0.38 * sc, h, 0.38 * sc, 0xd4be9e, 0xfff0d8);
          S.ekle(G.kutu, tx + q * w, ty + 0.42 * sc, tz, 0.92 * sc, 0.34 * sc, 0.92 * sc, 0xc4aa88, 0xead8be);
          S.ekle(G.kutu, tx + q * w, ty + h - 0.12 * sc, tz, 0.96 * sc, 0.28 * sc, 0.96 * sc, 0xd8be94, 0xfff2d6);
          S.ekle(G.kureK, tx + q * (w + 0.3 * sc), ty + h + 0.14 * sc, tz + 0.16 * sc, 0.16 * sc, 0.16 * sc, 0.16 * sc, 0xdfc496, 0xfff6dc);
        }
        S.ekle(G.torusSap, tx, ty + h, tz, w / 0.38, (w * 0.85) / 0.38, 1.8 * sc, 0xd8be94, 0xfff4d8, 0, 0, 0);
        S.ekle(G.kutu, tx, ty + h + w * 0.85 + 0.08 * sc, tz + 0.06 * sc, 0.58 * sc, 0.38 * sc, 0.48 * sc, 0xd8be94, 0xfff4d8);
        S.ekle(G.kutu, tx, ty + h + w * 0.85 + 0.26 * sc, tz + 0.08 * sc, 0.72 * sc, 0.11 * sc, 0.56 * sc, 0xe6c274, 0xfff2b8);
        const ry = ty + h + w * 0.85 + 0.52 * sc, rz = tz + 0.16 * sc;
        ROZ.ekle(G.kureO, tx, ry, rz, 0.34 * sc, 0.34 * sc, 0.14 * sc, 0xffaa18, 0xfff6a8);
        ROZ.ekle(G.oct, tx, ry, rz + 0.1 * sc, 0.15 * sc, 0.15 * sc, 0.09 * sc, 0xffe46a, 0xffffff, 0, 0, PI / 4);
        ROZ.ekle(G.halkaInce, tx, ry, rz, 0.44 * sc, 0.44 * sc, 0.24 * sc, 0xd88c14, 0xffe678);
        for (let p = 0; p < 8; p++) {
          const pa = p / 8 * PI * 2, pb = pa + PI / 8;
          ROZ.ekle(G.koni, tx + Math.cos(pa) * 0.56 * sc, ry + Math.sin(pa) * 0.56 * sc, rz, 0.095 * sc, 0.3 * sc, 0.075 * sc, 0xffa414, 0xfff298, 0, 0, pa - PI / 2);
          ROZ.ekle(G.kureK, tx + Math.cos(pb) * 0.48 * sc, ry + Math.sin(pb) * 0.48 * sc, rz, 0.055 * sc, 0.055 * sc, 0.055 * sc, 0xffc83c, 0xfff8c0);
        }
      }
      gr.add(new T.Mesh(ROZ.geo(), dyMalz(true, true, 0.45, { roughness: 0.28, metalness: 0.35, emissive: 0xffb830, emissiveIntensity: 0.72 })));
    }

    // Masalsı odaklar: yel değirmeni & şirin kulübe
    const dx = Math.min(hx - 10, 34), dz = -44, dyy = tepeY(dx, dz) - 0.4;
    S.ekle(G.kule, dx, dyy + 0.35, dz, 1.62, 0.85, 1.62, 0x988e84, 0xc8beb2); // Taş kaide
    S.ekle(G.kule, dx, dyy + 3.1, dz, 1.4, 5.8, 1.4, 0xe8d6c0, 0xfff4e2); // Ana kule
    S.ekle(G.sil, dx, dyy + 2.55, dz, 1.38, 0.16, 1.38, 0x8a5a3a, 0xa8744e); // Ahşap kuşak
    S.ekle(G.sil, dx, dyy + 5.75, dz, 1.18, 0.2, 1.18, 0x8a5a3a, 0xa8744e); // Çatı altı pervaz
    S.ekle(G.koni, dx, dyy + 6.95, dz, 2.05, 2.3, 2.05, 0xc85a4a, 0xee846c); // Kırmızı masal çatısı
    S.ekle(G.kure, dx, dyy + 8.12, dz, 0.22, 0.22, 0.22, 0xe8b238, 0xfff098); // Çatı alemi
    S.ekle(G.kutu, dx, dyy + 1.15, dz + 1.56, 0.96, 1.48, 0.18, 0x6e442a, 0x8e5c3a); // Kapı çerçevesi
    S.ekle(G.kutu, dx, dyy + 1.1, dz + 1.62, 0.78, 1.3, 0.14, 0x8a5a3a, 0xb27a52); // Kapı
    S.ekle(G.kutu, dx, dyy + 0.18, dz + 1.78, 1.2, 0.28, 0.55, 0x9e9488, 0xcac0b4); // Taş basamak
    S.ekle(G.torusHalka, dx, dyy + 4.15, dz + 1.24, 1.3, 1.3, 0.9, 0x8a5a3a, 0xb27a52); // Yuvarlak pencere çerçevesi
    S.ekle(G.kure, dx, dyy + 4.15, dz + 1.2, 0.36, 0.36, 0.15, 0xffd27a, 0xfff4b8); // Sıcak pencere camı
    S.ekle(G.kutu, dx, dyy + 3.62, dz + 1.32, 1.1, 0.14, 0.45, 0x7e5034, 0xa46e48); // Balkon pervazı
    // Yel değirmeni çevresi küçük çalı ve çiçek kümeleri
    for (const [ox, oz, sc, ci] of [[-2.2, 1.35, 0.72, 0], [2.15, 1.2, 0.65, 1], [-1.9, -1.3, 0.58, 2]]) {
      const cx = dx + ox, cz = dz + oz, cy = tepeY(cx, cz) - 0.15;
      A.nc = [cx, cy, cz + 0.25 * sc];
      A.ekle(G.kureO, cx, cy + 0.3 * sc, cz, 1.15 * sc, 0.82 * sc, 0.85 * sc, B.agac[0][0], B.agac[0][1], 0, 0, 0, 0.1 * sc);
      A.ekle(G.kureO, cx - 0.75 * sc, cy + 0.18 * sc, cz + 0.15 * sc, 0.72 * sc, 0.56 * sc, 0.62 * sc, B.agac[0][0], B.agac[1][1], 0, 0, 0, 0.08 * sc);
      A.ekle(G.kureO, cx + 0.75 * sc, cy + 0.15 * sc, cz + 0.12 * sc, 0.68 * sc, 0.54 * sc, 0.6 * sc, B.agac[0][0], B.agac[1][1], 0, 0, 0, 0.08 * sc);
      A.nc = null;
      const fc1 = B.cicek[ci % B.cicek.length], fc2 = B.cicek[(ci + 1) % B.cicek.length];
      S.ekle(G.kureK, cx - 0.32 * sc, cy + 0.78 * sc, cz + 0.42 * sc, 0.18 * sc, 0.16 * sc, 0.18 * sc, fc1[0], fc1[1]);
      S.ekle(G.kureK, cx + 0.28 * sc, cy + 0.72 * sc, cz + 0.48 * sc, 0.16 * sc, 0.15 * sc, 0.16 * sc, fc2[0], fc2[1]);
      S.ekle(G.kureK, cx + 0.02 * sc, cy + 0.55 * sc, cz + 0.68 * sc, 0.15 * sc, 0.14 * sc, 0.15 * sc, fc1[0], fc1[1]);
    }
    const kx = 10, kz = -33, ky = yerY(kx, kz) - 0.1;
    S.ekle(G.kutu, kx, ky + 0.14, kz, 3.65, 0.32, 2.65, 0x988e84, 0xc4bab0); // Taş temel
    S.ekle(G.kutu, kx, ky + 1.25, kz, 3.4, 2.1, 2.4, 0xf0dcc0, 0xfff2de); // Kulübe duvarı
    for (const qx of [-1.66, 1.66]) S.ekle(G.kutu, kx + qx, ky + 1.25, kz + 1.18, 0.14, 2.15, 0.14, 0x7e5034, 0xa46e48); // Ahşap köşe direkleri
    S.ekle(G.koni4, kx, ky + 3.2, kz, 3.15, 1.98, 2.5, 0xc0503e, 0xee8070, 0, PI / 4, 0); // Geniş saçaklı çatı
    S.ekle(G.kutu, kx + 0.9, ky + 3.42, kz - 0.3, 0.46, 1.2, 0.46, 0xb07a5a, 0xc89070); // Baca
    S.ekle(G.kutu, kx + 0.9, ky + 4.02, kz - 0.3, 0.6, 0.16, 0.6, 0x8e6046, 0xb88464); // Baca şapkası
    S.ekle(G.kutu, kx - 0.7, ky + 0.88, kz + 1.21, 0.88, 1.56, 0.06, 0x6a4228, 0x885838); // Kapı çerçevesi
    S.ekle(G.kutu, kx - 0.7, ky + 0.84, kz + 1.24, 0.72, 1.44, 0.06, 0x8a5a3a, 0xb27a52); // Kapı
    S.ekle(G.kutu, kx - 0.7, ky + 1.72, kz + 1.5, 1.18, 0.14, 0.68, 0xc0503e, 0xe8786a, 0.22, 0, 0); // Kapı sundurması
    S.ekle(G.kutu, kx - 0.7, ky + 0.14, kz + 1.45, 1.05, 0.22, 0.55, 0xa89e92, 0xd4cab8); // Kapı basamağı
    S.ekle(G.kutu, kx + 0.8, ky + 1.35, kz + 1.21, 0.9, 0.84, 0.06, 0x72482c, 0x966240); // Pencere çerçevesi
    S.ekle(G.kutu, kx + 0.8, ky + 1.35, kz + 1.24, 0.74, 0.68, 0.05, 0xffcf6a, 0xfff0a8); // Pencere camı
    S.ekle(G.kutu, kx + 0.8, ky + 1.35, kz + 1.27, 0.74, 0.06, 0.03, 0x72482c, 0x966240); // Pencere çıtası yatay
    S.ekle(G.kutu, kx + 0.8, ky + 1.35, kz + 1.27, 0.06, 0.68, 0.03, 0x72482c, 0x966240); // Pencere çıtası dikey
    S.ekle(G.kutu, kx + 0.8, ky + 0.86, kz + 1.34, 0.96, 0.2, 0.26, 0x8a5a3a, 0xb27a52); // Çiçeklik saksı
    for (let f = 0; f < 3; f++) {
      const fc = B.cicek[f % B.cicek.length];
      S.ekle(G.kureK, kx + 0.52 + f * 0.28, ky + 1.02, kz + 1.38, 0.12, 0.11, 0.11, fc[0], fc[1]);
    }
    var kulubePencere = { x: kx + 0.8, y: ky + 1.35, z: kz + 1.3 };
    dy.dumanPos = { x: kx + 0.9, y: ky + 4.1, z: kz - 0.3 };
    const dmMat = new T.MeshStandardMaterial({ color: B.gece ? 0xd0d4ec : 0xfbf4f8, roughness: 0.95, transparent: true, opacity: 0.58, emissive: B.gece ? 0x2a2a4a : 0x554c58, emissiveIntensity: 0.3 });
    dy.duman = new T.InstancedMesh(G.kureO, dmMat, 7);
    dy.duman.frustumCulled = false;
    gr.add(dy.duman);

    const sm = new T.Mesh(S.geo(), dyMalz(true)); sm.receiveShadow = true; gr.add(sm);
    const am = dyMalz(true, true, 0.55, { emissive: B.gece ? 0x061014 : 0x26300e });
    const amMesh = new T.Mesh(A.geo(), am); amMesh.receiveShadow = true; gr.add(amMesh);

    // Değirmen kanatları (ahşap kafesli masalsı yelkenler)
    {
      const K = dyYapi();
      for (let j = 0; j < 4; j++) {
        const a = j / 4 * PI * 2, ca = Math.cos(a), sa = Math.sin(a);
        K.ekle(G.kutu, ca * 1.9, sa * 1.9, 0.02, 3.15, 0.84, 0.06, 0xfaebd6, 0xfffaf2, 0, 0, a);
        K.ekle(G.kutu, ca * 1.8, sa * 1.8, -0.04, 3.6, 0.12, 0.12, 0x8a5a3a, 0xb0784e, 0, 0, a);
        for (const u of [1.0, 2.0, 3.0]) {
          K.ekle(G.kutu, ca * u, sa * u, 0.05, 0.07, 0.88, 0.07, 0x8a5a3a, 0xb0784e, 0, 0, a);
        }
      }
      K.ekle(G.kure, 0, 0, 0.12, 0.42, 0.42, 0.32, 0x8a5a3a, 0xc48a5c);
      K.ekle(G.kure, 0, 0, 0.24, 0.2, 0.2, 0.18, 0xd8a230, 0xffe880);
      dy.degirmen = new T.Mesh(K.geo(), dyMalz(true)); dy.degirmen.position.set(dx, dyy + 5.6, dz + 1.6); gr.add(dy.degirmen);
    }

    // Yumuşak sis şeritleri
    {
      const pos = [], uv = [], ser = [[-26, 1.2, 7], [-50, 3.5, 9], [-78, 5.5, 12]];
      for (const [z, y, h] of ser) { const x0 = -160, x1 = 220; pos.push(x0, y - h / 2, z, x1, y - h / 2, z, x1, y + h / 2, z, x0, y - h / 2, z, x1, y + h / 2, z, x0, y + h / 2, z); uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1); }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
      const cA = new T.Color(B.sisSerit[0]), cB = new T.Color(B.sisSerit[1]);
      const m = new T.ShaderMaterial({
        transparent: true, depthWrite: false, fog: false,
        uniforms: { uT: dy.U.uT, uC1: { value: cA }, uC2: { value: cB } },
        vertexShader: 'varying vec2 vU; varying vec3 vW; void main(){ vU = uv; vW = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'varying vec2 vU; varying vec3 vW; uniform float uT; uniform vec3 uC1, uC2; void main(){ float v = smoothstep(0.0, 0.5, vU.y) * smoothstep(1.0, 0.45, vU.y);' +
          ' float n = 0.6 + 0.25 * sin(vW.x * 0.07 + uT * 0.08 + vW.z) + 0.15 * sin(vW.x * 0.19 - uT * 0.13);' +
          ' gl_FragColor = vec4(mix(uC1, uC2, vU.y), v * n * 0.38); }'
      });
      const sis = new T.Mesh(g, m); sis.renderOrder = 1; gr.add(sis);
    }
  }

  // ── 5 · Zemin (receiveShadow = true) + Bölüm 5 Parlayan Mavi Su Şeridi ──
  {
    // Zemin kameraya doğru uzun: dikey ekranda alt kenarda boşluk (arka plan rengi) görünmesin
    const g = new T.PlaneGeometry(420, 150, 100, 34); g.rotateX(-PI / 2); g.translate(25, 0, -5);
    const p = g.attributes.position, col = [], c = new T.Color(), a = new T.Color(B.zemin[0]), b = new T.Color(B.zemin[1]), u = new T.Color(B.zemin[2]);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), arka = Math.max(0, (-z - 4) / 30);
      let y = arka * (0.6 + 0.6 * Math.sin(x * 0.11 + z * 0.07) + 0.4 * Math.sin(x * 0.23 - z * 0.13)) * Math.min(1, arka * 1.5) * 1.6 - (z > 6 ? (Math.min(z, 24) - 6) * 0.05 : 0);
      if (dereVar && x > dereX0 && x < dereX1 && z > -2.5 && z < 3.2) {
        y -= 0.28 * Math.exp(-Math.pow((z - 0.1) / 1.8, 2));
      }
      p.setY(i, y);
      const v = 0.5 + 0.35 * Math.sin(x * 0.17 + z * 0.31) * Math.sin(x * 0.05 - z * 0.11) + 0.15 * Math.sin(x * 0.9 + z * 1.3) * Math.sin(x * 0.7 - z * 1.1);
      c.copy(b).lerp(a, v); c.lerp(u, Math.min(1, arka * 0.8)); col.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new T.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
    const zm = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0.0 });
    zm.onBeforeCompile = (sh) => {
      sh.uniforms.uT = dy.U.uT;
      sh.vertexShader = 'varying vec2 vDyW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvDyW = position.xz;');
      sh.fragmentShader = 'varying vec2 vDyW; uniform float uT;\n' + sh.fragmentShader.replace('#include <dithering_fragment>',
        '#include <dithering_fragment>\nfloat dyN = sin(vDyW.x * 0.21 + uT * 0.09) * sin(vDyW.y * 0.33 - uT * 0.06) + 0.45 * sin(vDyW.x * 0.53 + vDyW.y * 0.41 + uT * 0.05);' +
        '\nfloat dyL = smoothstep(0.45, 1.05, dyN), dyG = smoothstep(0.55, 1.1, -dyN) * smoothstep(-2.0, -8.0, vDyW.y);' +
        '\ngl_FragColor.rgb = gl_FragColor.rgb * (1.0 - 0.1 * dyG) + vec3(0.14, 0.11, 0.04) * dyL;');
    };
    const zeminMesh = new T.Mesh(g, zm); zeminMesh.receiveShadow = true; gr.add(zeminMesh);

    if (dereVar) {
      const wg = new T.PlaneGeometry(dereB ? Math.max(6, dereX1 - dereX0 + 2) : Math.max(36, hx - 8), 4.6, 40, 6);
      wg.rotateX(-PI / 2);
      const suA = bNo === 13 ? 'vec3(0.08, 0.72, 0.78)' : 'vec3(0.18, 0.62, 0.88)';
      const suB = bNo === 13 ? 'vec3(0.36, 0.94, 0.92)' : 'vec3(0.42, 0.84, 0.96)';
      const wm = new T.ShaderMaterial({
        transparent: true, depthWrite: false, uniforms: { uT: dy.U.uT },
        vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: [
          'varying vec2 vU; uniform float uT;',
          'void main(){',
          ' float kenar = smoothstep(0.0, 0.18, vU.y) * smoothstep(1.0, 0.82, vU.y) * smoothstep(0.0, 0.06, vU.x) * smoothstep(1.0, 0.94, vU.x);',
          ' float dalga = 0.5 + 0.5 * sin(vU.x * 42.0 - uT * 2.4 + sin(vU.y * 12.0 + uT * 1.5));',
          ' float par = pow(max(0.0, sin(vU.x * 65.0 + uT * 3.1) * cos(vU.y * 18.0 - uT * 2.0)), 4.0);',
          ' float serit = smoothstep(0.64, 0.96, sin(vU.y * 26.0 + sin(vU.x * 16.0 + uT * 1.15) * 1.35)) * (0.5 + 0.5 * sin(vU.x * 20.0 - uT * 1.7));',
          ` vec3 c = mix(${suA}, ${suB}, dalga * 0.7);`,
          ' c += vec3(0.75, 0.96, 1.0) * par * 0.65 + vec3(0.86, 0.98, 1.0) * serit * 0.24;',
          ' gl_FragColor = vec4(c, kenar * 0.88);',
          '}'
        ].join('\n')
      });
      const dere = new T.Mesh(wg, wm);
      dere.position.set(dereB ? (dereX0 + dereX1) / 2 : 6 + (hx - 12) * 0.5, 0.04, 0.15);
      dere.renderOrder = 1;
      dy.dereMat = wm;
      gr.add(dere);
    }
  }

  // ── 6 · Çiçekli çimen, biyom özel süsler, piknik örtüsü (hx) + bayrak ipi ──
  {
    const S = dyYapi(), Y = dyYapi(), F = dyYapi(), L = dyYapi();
    const tutam = (x, z, k) => {
      const n = 3 + Math.floor(R() * 3), ust = R() < 0.5 ? B.cimen[1] : B.cimen[2];
      for (let j = 0; j < n; j++) { const u = (j / (n - 1)) * 2 - 1, h = k * ara(0.36, 0.6) * (1 - 0.3 * Math.abs(u)); S.ekle(G.bicak, x + u * 0.14 * k, -0.03, z + ara(-0.06, 0.06), k * ara(0.18, 0.25), h, 1, B.cimen[0], ust, 0, ara(-0.3, 0.3), -u * 0.32, 0.7); }
    };
    const minX = -40, maxX = Math.max(120, hx + 38);
    for (let i = 0; i < 880; i++) {
      const x = ara(minX, maxX), z = ara(-9, 3.2);
      if (Math.abs(x) < 4 && z > -1) continue;
      if (x > hx - 3.5 && x < hx + 3.5 && z > -1.5) continue;
      if (dereVar && x > dereX0 && x < dereX1 && z > -1.8 && z < 2.2) continue;
      if (Math.abs(x) < 4 && z > -5 && R() < 0.6) continue;
      tutam(x, z, z > 0.6 ? ara(0.7, 0.95) : ara(0.9, 1.3));
    }
    for (let i = 0; i < 280; i++) tutam(ara(minX, maxX), ara(-16, -9), ara(0.5, 0.75));

    const cicek = (x, z, h, renk, renk2) => {
      F.ekle(G.silA3, x, h / 2, z, 0.025, h, 0.025, B.cimen[0], B.cimen[1], 0, 0, 0, 0.8);
      const a0 = R() * 3;
      for (let k = 0; k < 5; k++) { const a = a0 + k / 5 * PI * 2; F.ekle(G.kureC, x + Math.cos(a) * 0.11, h + Math.sin(a) * 0.11, z, 0.09, 0.09, 0.05, renk, renk2, 0, 0, 0, -0.8); }
      F.ekle(G.kureC, x, h, z + 0.05, 0.07, 0.07, 0.06, 0xffb020, 0xffe060, 0, 0, 0, -0.8);
    };
    for (let i = 0; i < 52; i++) {
      const cx = ara(minX + 2, maxX - 4), cz = ara(-14, -1.5), n = 3 + Math.floor(R() * 4), rk = B.cicek[Math.floor(R() * B.cicek.length)];
      if ((Math.abs(cx) < 5 && cz > -6) || (cx > hx - 4 && cx < hx + 4 && cz > -3)) continue;
      for (let j = 0; j < n; j++) cicek(cx + ara(-1.2, 1.2), cz + ara(-0.8, 0.8), ara(0.45, 0.9), rk[0], rk[1]);
    }

    // Bölüm 1: İlk Zıplayış — salıncağın sol ve sağ yakınına sevimli küçük papatya kümeleri (F içinde, 0 ek çizim çağrısı)
    if (bNo === 1) {
      const papatyaKumeleri = [
        [-4.4, -1.5, 4], [-3.4, -0.75, 3], [-3.8, 0.75, 3], [-2.95, -2.2, 3],
        [3.35, -0.8, 3], [4.35, -1.45, 4], [3.7, 0.7, 3], [2.95, -2.25, 3]
      ];
      for (const [px, pz, adet] of papatyaKumeleri) {
        for (let j = 0; j < adet; j++) {
          cicek(px + ara(-0.42, 0.42), pz + ara(-0.3, 0.3), ara(0.26, 0.44), 0xf4f0f0, 0xffffff);
        }
      }
    } else {
      const salincakCicek = [
        [-4.1, -1.45, 3], [-3.25, -0.75, 2], [-3.7, 0.65, 2],
        [3.25, -0.8, 2], [4.15, -1.4, 3], [3.65, 0.6, 2]
      ];
      for (let i = 0; i < salincakCicek.length; i++) {
        const [px, pz, adet] = salincakCicek[i];
        const rk = B.cicek[i % B.cicek.length];
        for (let j = 0; j < adet; j++) {
          cicek(px + ara(-0.36, 0.36), pz + ara(-0.26, 0.26), ara(0.28, 0.48), rk[0], rk[1]);
        }
      }
    }

    // Salıncak altı: minik yuvarlak adım taşları ve yonca öbekleri (Y/S içinde, 0 ek çizim çağrısı)
    {
      const tasRenk = [[0xb6aea4, 0xe8e0d6], [0xa8a096, 0xdcd4ca], [0xc4bab0, 0xf2eae0]];
      const adimTaslari = [
        [-1.85, 0.32, 0.2], [-1.3, 0.52, 0.23], [-0.72, 0.38, 0.19], [-0.15, 0.56, 0.24],
        [0.42, 0.36, 0.2], [0.98, 0.5, 0.22], [1.55, 0.3, 0.19], [-0.45, -0.38, 0.17], [0.55, -0.34, 0.18]
      ];
      for (let i = 0; i < adimTaslari.length; i++) {
        const [tx, tz, tr] = adimTaslari[i], cr = tasRenk[i % tasRenk.length];
        Y.ekle(G.kureO, tx, tr * 0.22, tz, tr * 1.22, tr * 0.34, tr * 0.96, cr[0], cr[1], 0, i * 0.7, 0);
        if (i % 2 === 0) Y.ekle(G.kureK, tx + tr * 0.95, tr * 0.14, tz - tr * 0.45, tr * 0.48, tr * 0.22, tr * 0.42, cr[0], cr[1], 0, i * 1.1, 0);
      }
      const yoncaYer = [
        [-2.28, -0.52], [-1.52, 0.72], [-0.58, -0.66], [0.58, 0.74], [1.52, -0.6], [2.26, 0.44]
      ];
      for (let i = 0; i < yoncaYer.length; i++) {
        const [yx, yz] = yoncaYer[i];
        for (let t = 0; t < 3; t++) {
          const ox = yx + (t - 1) * 0.14 + ara(-0.04, 0.04), oz = yz + ara(-0.1, 0.1);
          const yaprakSay = (i + t) % 4 === 0 ? 4 : 3, sc = ara(0.85, 1.15), h = 0.07 * sc;
          S.ekle(G.silA3, ox, h * 0.5, oz, 0.012, h, 0.012, 0x2a7636, 0x5ec24e, 0, 0, 0, 0.3);
          for (let k = 0; k < yaprakSay; k++) {
            const a = (k / yaprakSay) * PI * 2 + t * 0.5;
            S.ekle(G.kureK, ox + Math.cos(a) * 0.045 * sc, h + 0.01, oz + Math.sin(a) * 0.045 * sc, 0.048 * sc, 0.016, 0.042 * sc, 0x2e883c, 0x7ee060, 0, -a, 0, 0.35);
          }
        }
      }
    }

    // Bölüm 3: Esintili Vadi — hafif rüzgârda daha canlı salınan uzun çiçekli kır otları
    if (bNo === 3) {
      for (let i = 0; i < 36; i++) {
        const kx = ara(minX + 4, maxX - 5), kz = ara(-11.5, -1.6);
        if ((Math.abs(kx) < 5 && kz > -5) || (kx > hx - 4 && kx < hx + 4 && kz > -3)) continue;
        const gy = yerY(kx, kz), rk = B.cicek[i % B.cicek.length];
        for (let b = 0; b < 3; b++) {
          const ox = kx + ara(-0.34, 0.34), oz = kz + ara(-0.24, 0.24), bh = ara(0.92, 1.48);
          F.ekle(G.bicak, ox, gy - 0.02, oz, ara(0.11, 0.16), bh, 1, B.cimen[0], B.cimen[1], 0, ara(-0.35, 0.35), ara(-0.18, 0.18), 1.25);
        }
        for (let s = 0; s < 2; s++) {
          const sx = kx + ara(-0.26, 0.26), sz = kz + ara(-0.18, 0.18), sh = ara(1.05, 1.58), salTip = 1.32;
          F.ekle(G.silA3, sx, gy + sh * 0.5, sz, 0.02, sh, 0.02, B.cimen[0], B.cimen[1], 0, 0, 0, salTip);
          F.ekle(G.kureK, sx, gy + sh, sz + 0.02, 0.085, 0.075, 0.07, rk[0], rk[1], 0, 0, 0, -salTip);
          F.ekle(G.kureK, sx, gy + sh + 0.03, sz + 0.06, 0.04, 0.04, 0.04, 0xffd040, 0xfff498, 0, 0, 0, -salTip);
          F.ekle(G.kureK, sx + (s ? -0.05 : 0.05), gy + sh * 0.82, sz + 0.02, 0.055, 0.055, 0.05, rk[0], rk[1], 0, 0, 0, -(salTip * 0.67));
        }
      }
    }

    // Bölüm 6: Daha dolgun mor lavanta tarlaları
    if (bNo === 6) {
      const lRenk = [[0x6028b0, 0xc894ff], [0x7e42cc, 0xe4b8ff], [0x8e52dc, 0xf2d4ff]];
      for (let i = 0; i < 76; i++) {
        const lx = ara(-22, maxX - 5), lz = ara(-13, -1.5);
        if ((Math.abs(lx) < 5 && lz > -5) || (lx > hx - 4 && lx < hx + 4 && lz > -3)) continue;
        const rk = lRenk[i % 3];
        for (let j = 0; j < 6; j++) {
          const ox = lx + ara(-0.48, 0.48), oz = lz + ara(-0.34, 0.34), h = ara(0.75, 1.32);
          F.ekle(G.silA3, ox, h * 0.45, oz, 0.028, h * 0.9, 0.028, 0x4c7c42, 0x76a864, 0, 0, 0, 0.85);
          F.ekle(G.kureK, ox, h, oz, 0.13, 0.34, 0.13, rk[0], rk[1], 0, 0, 0, -0.85);
          F.ekle(G.kureC, ox + ara(-0.04, 0.04), h + 0.18, oz, 0.08, 0.14, 0.08, rk[1], 0xf6e6ff, 0, 0, 0, -0.85);
        }
      }
      // Orta plan eteklerinde ekstra mor lavanta öbekleri (F içinde, 0 ek çizim çağrısı)
      for (let i = 0; i < 14; i++) {
        const lx = ara(minX + 6, maxX - 8), lz = ara(-16, -8.5);
        const rk = lRenk[i % 3];
        for (let j = 0; j < 5; j++) {
          const ox = lx + ara(-0.62, 0.62), oz = lz + ara(-0.42, 0.42), h = ara(0.62, 1.05);
          const gy = yerY(ox, oz);
          F.ekle(G.silA3, ox, gy + h * 0.45, oz, 0.026, h * 0.9, 0.026, 0x4c7c42, 0x76a864, 0, 0, 0, 0.8);
          F.ekle(G.kureK, ox, gy + h, oz, 0.12, 0.3, 0.12, rk[0], rk[1], 0, 0, 0, -0.8);
          F.ekle(G.kureC, ox + ara(-0.04, 0.04), gy + h + 0.16, oz, 0.075, 0.13, 0.075, rk[1], 0xf6e6ff, 0, 0, 0, -0.8);
        }
      }
    }

    // Bölüm 7: Gökkuşağı Kemeri — çayırda gökkuşağı renklerinde küçük kır çiçeği kümeleri (F içinde, 0 ek çizim çağrısı)
    if (bNo === 7) {
      const gokCicek = [
        [0xff5c8d, 0xffa8c4],
        [0xff9b42, 0xffcc88],
        [0xffdf48, 0xfff4a8],
        [0x5ee886, 0xaef6c2],
        [0x4cc4ff, 0xa6e4ff],
        [0x7c84ff, 0xbec4ff],
        [0xc96eff, 0xe6b8ff]
      ];
      for (let i = 0; i < 14; i++) {
        const cx = ara(minX + 6, maxX - 6), cz = ara(-9.5, 1.4);
        if ((Math.abs(cx) < 4.8 && cz > -3.2) || (cx > hx - 4 && cx < hx + 4 && cz > -3)) continue;
        const adet = 3 + (i % 2);
        for (let j = 0; j < adet; j++) {
          const rk = gokCicek[(i + j) % gokCicek.length];
          cicek(cx + ara(-0.42, 0.42), cz + ara(-0.3, 0.3), ara(0.28, 0.46), rk[0], rk[1]);
        }
      }
    }

    // Bölüm 5: Dere kenarına küçük yuvarlak çakıl taşları ve sazlıklar
    if (bNo === 5) {
      const cRenk = [[0x7d8890, 0xb0bac0], [0xa8a092, 0xdad2c4], [0x6e7e86, 0x9eb0b8], [0xb8aea0, 0xe6ddd0]];
      const dereSon = Math.max(40, hx - 5);
      for (let i = 0; i < 88; i++) {
        const px = ara(6.2, dereSon), taraf = i % 2 === 0 ? -1 : 1;
        const pz = taraf * ara(1.75, 2.45), pr = ara(0.11, 0.26), cr = cRenk[i % cRenk.length];
        Y.ekle(G.kureO, px, pr * 0.32, pz, pr * 1.25, pr * 0.48, pr * 0.95, cr[0], cr[1], 0, ara(0, PI), 0);
      }
      for (let i = 0; i < 24; i++) {
        const sx = ara(7.0, dereSon - 1), taraf = i % 2 === 0 ? -1 : 1, sz = taraf * ara(1.85, 2.55);
        for (let b = 0; b < 4; b++) {
          const bx = sx + ara(-0.24, 0.24), bz = sz + ara(-0.18, 0.18), bh = ara(0.95, 1.55);
          S.ekle(G.bicak, bx, -0.02, bz, 0.09, bh, 1, 0x356e38, 0x76b856, 0, ara(-0.3, 0.3), ara(-0.16, 0.16), 0.75);
        }
        for (let k = 0; k < 2; k++) {
          const kx2 = sx + ara(-0.16, 0.16), kz2 = sz + ara(-0.12, 0.12), kh = ara(1.15, 1.55);
          S.ekle(G.sil, kx2, kh * 0.5, kz2, 0.024, kh, 0.024, 0x46783c, 0x6ea454, 0, 0, ara(-0.08, 0.08), 0.6);
          Y.ekle(G.kureO, kx2, kh - 0.12, kz2, 0.065, 0.24, 0.065, 0x4e2a18, 0x7c4a2e, 0, 0, 0, 0.6);
        }
      }
    }

    // Bölüm 9: Kanyon kenarında sevimli küçük kaktüsler ve çöl çiçekleri
    if (bNo === 9) {
      const kCicek = [[0xff5c8a, 0xffb8d0], [0xff9e38, 0xffe488], [0xe84868, 0xff98b0]];
      for (let i = 0; i < 20; i++) {
        const kx = ara(-16, maxX - 6), kz = ara(-11.5, -2.0);
        if ((Math.abs(kx) < 5 && kz > -5) || (kx > hx - 4.5 && kx < hx + 4.5 && kz > -3.5)) continue;
        const sc = ara(0.75, 1.3), ky0 = yerY(kx, kz), h = 0.72 * sc;
        Y.ekle(G.sil, kx, ky0 + h * 0.5, kz, 0.14 * sc, h, 0.14 * sc, 0x2e7840, 0x62b858);
        Y.ekle(G.kureO, kx, ky0 + h, kz, 0.14 * sc, 0.16 * sc, 0.14 * sc, 0x3a8848, 0x74cc68);
        if (i % 3 !== 0) {
          const q = i % 2 === 0 ? 1 : -1;
          Y.ekle(G.sil, kx + q * 0.18 * sc, ky0 + h * 0.52, kz, 0.08 * sc, 0.22 * sc, 0.08 * sc, 0x2e7840, 0x5cb052, 0, 0, PI / 2);
          Y.ekle(G.sil, kx + q * 0.27 * sc, ky0 + h * 0.68, kz, 0.085 * sc, 0.34 * sc, 0.085 * sc, 0x368246, 0x6ac260);
          Y.ekle(G.kureO, kx + q * 0.27 * sc, ky0 + h * 0.85, kz, 0.085 * sc, 0.1 * sc, 0.085 * sc, 0x429250, 0x7ad46c);
          if (i % 3 === 1) {
            Y.ekle(G.sil, kx - q * 0.16 * sc, ky0 + h * 0.64, kz, 0.07 * sc, 0.18 * sc, 0.07 * sc, 0x2e7840, 0x5cb052, 0, 0, PI / 2);
            Y.ekle(G.sil, kx - q * 0.23 * sc, ky0 + h * 0.77, kz, 0.075 * sc, 0.26 * sc, 0.075 * sc, 0x368246, 0x6ac260);
            Y.ekle(G.kureO, kx - q * 0.23 * sc, ky0 + h * 0.9, kz, 0.075 * sc, 0.085 * sc, 0.075 * sc, 0x429250, 0x7ad46c);
          }
        }
        Y.ekle(G.kureK, kx - 0.16 * sc, ky0 + 0.05 * sc, kz + 0.14 * sc, 0.1 * sc, 0.06 * sc, 0.09 * sc, 0xb85838, 0xea9a62);
        const fc = kCicek[i % kCicek.length];
        F.ekle(G.kureK, kx, ky0 + h + 0.14 * sc, kz + 0.02, 0.09 * sc, 0.08 * sc, 0.08 * sc, fc[0], fc[1], 0, 0, 0, -0.8);
        F.ekle(G.kureK, kx, ky0 + h + 0.2 * sc, kz + 0.04, 0.045 * sc, 0.045 * sc, 0.045 * sc, 0xffd240, 0xfff6a8, 0, 0, 0, -0.8);
        if (i % 2 === 0) cicek(kx + ara(-0.7, 0.7), kz + ara(-0.4, 0.4), ara(0.28, 0.48), fc[0], fc[1]);
      }
    }

    // Bölüm 10, 17, 20: Gece parlayan ekstra çiçekler
    if (bNo === 10 || bNo === 17 || bNo === 20) {
      for (let i = 0; i < 30; i++) {
        const cx = ara(minX + 6, maxX - 5), cz = ara(-11, -1.6), rk = B.cicek[i % B.cicek.length];
        if ((Math.abs(cx) < 5 && cz > -5) || (cx > hx - 4 && cx < hx + 4 && cz > -3)) continue;
        cicek(cx, cz, ara(0.55, 0.95), rk[0], rk[1]);
      }
    }

    // Bölüm 10: Yıldızlı Gece Şenliği — çayırda ekstra parlayan gece çiçeği kümeleri (F içinde, 0 ek çizim çağrısı)
    if (bNo === 10) {
      for (let i = 0; i < 12; i++) {
        const cx = ara(minX + 6, maxX - 6), cz = ara(-9.5, 1.4), rk = B.cicek[i % B.cicek.length];
        if ((Math.abs(cx) < 4.8 && cz > -3.2) || (cx > hx - 4 && cx < hx + 4 && cz > -3)) continue;
        const adet = 2 + (i % 2);
        for (let j = 0; j < adet; j++) {
          cicek(cx + ara(-0.45, 0.45), cz + ara(-0.32, 0.32), ara(0.42, 0.82), rk[0], rk[1]);
        }
      }
    }

    // Bölüm 20: Büyük Yıldız Şenliği — çayırda ekstra parlayan gece çiçeği kümeleri (F içinde, 0 ek çizim çağrısı)
    if (bNo === 20) {
      for (let i = 0; i < 16; i++) {
        const cx = ara(minX + 6, maxX - 6), cz = ara(-9.5, 1.4), rk = B.cicek[i % B.cicek.length];
        if ((Math.abs(cx) < 4.8 && cz > -3.2) || (cx > hx - 4 && cx < hx + 4 && cz > -3)) continue;
        const adet = 2 + (i % 2);
        for (let j = 0; j < adet; j++) {
          cicek(cx + ara(-0.45, 0.45), cz + ara(-0.32, 0.32), ara(0.42, 0.82), rk[0], rk[1]);
        }
      }
    }

    // Bölüm 11: Kiraz Çiçeği Bahçesi — zemine dökülmüş pembe kiraz yaprakları
    if (bNo === 11) {
      for (let i = 0; i < 95; i++) {
        const px = ara(minX + 4, maxX - 6), pz = ara(-10, 2.2);
        if ((Math.abs(px) < 4.5 && pz > -2) || (px > hx - 3.5 && px < hx + 3.5 && pz > -1.5)) continue;
        F.ekle(G.kureK, px, 0.04, pz, ara(0.08, 0.14), 0.025, ara(0.06, 0.1), i % 3 === 0 ? 0xffe4f0 : 0xff9ec4, 0xfff4f8, 0, ara(0, PI), 0);
      }
    }

    // Bölüm 12: Ayçiçeği Tarlası — dev sarı ayçiçekleri + orta plan eteklerinde küçük ayçiçeği kümeleri (S + F içinde 0 ek çizim çağrısı)
    if (bNo === 12) {
      for (let i = 0; i < 34; i++) {
        const ax = ara(minX + 4, maxX - 6), az = ara(-13.5, -2.0);
        if ((Math.abs(ax) < 5.5 && az > -5.5) || (ax > hx - 4.5 && ax < hx + 4.5 && az > -3.5)) continue;
        const sc = ara(0.85, 1.45), h = 1.85 * sc, ay0 = yerY(ax, az);
        S.ekle(G.silA, ax, ay0 + h * 0.5, az, 0.055 * sc, h, 0.055 * sc, 0x3a7a2c, 0x6cb848, 0, 0, ara(-0.08, 0.08), 0.28 * sc);
        for (const q of [-1, 1]) {
          S.ekle(G.kureK, ax + q * 0.22 * sc, ay0 + h * (0.42 + q * 0.08), az, 0.22 * sc, 0.07 * sc, 0.13 * sc, 0x3e8430, 0x76c650, 0, 0, q * 0.45, 0.2 * sc);
        }
        const cy = ay0 + h + 0.08 * sc, cz = az + 0.08 * sc;
        S.ekle(G.kureK, ax, cy - 0.02 * sc, cz - 0.06 * sc, 0.2 * sc, 0.2 * sc, 0.09 * sc, 0x3a7a2c, 0x6cb848, 0, 0, 0, -0.28 * sc);
        for (let p = 0; p < 12; p++) {
          const pa = p / 12 * PI * 2;
          F.ekle(G.kureC, ax + Math.cos(pa) * 0.34 * sc, cy + Math.sin(pa) * 0.34 * sc, cz, 0.16 * sc, 0.08 * sc, 0.05 * sc, 0xffaa10, 0xffe848, 0, 0, pa, -0.28 * sc);
        }
        F.ekle(G.kureK, ax, cy, cz + 0.05 * sc, 0.22 * sc, 0.22 * sc, 0.08 * sc, 0x4a2a14, 0x784824, 0, 0, 0, -0.28 * sc);
        F.ekle(G.kureC, ax, cy, cz + 0.09 * sc, 0.13 * sc, 0.13 * sc, 0.05 * sc, 0x7c4a20, 0xb87634, 0, 0, 0, -0.28 * sc);
      }
      // Orta plan eteklerinde küçük ayçiçeği kümeleri
      for (let i = 0; i < 11; i++) {
        const kx = ara(minX + 6, maxX - 8), kz = ara(-15.5, -8.5);
        for (let k = 0; k < 3; k++) {
          const ax = kx + ara(-0.95, 0.95), az = kz + ara(-0.6, 0.55);
          const sc = ara(0.46, 0.72), h = 1.65 * sc, ay0 = yerY(ax, az);
          S.ekle(G.silA, ax, ay0 + h * 0.5, az, 0.05 * sc, h, 0.05 * sc, 0x3a7a2c, 0x6cb848, 0, 0, ara(-0.1, 0.1), 0.24 * sc);
          for (const q of [-1, 1]) {
            S.ekle(G.kureC, ax + q * 0.2 * sc, ay0 + h * (0.44 + q * 0.08), az, 0.2 * sc, 0.065 * sc, 0.12 * sc, 0x3e8430, 0x76c650, 0, 0, q * 0.45, 0.18 * sc);
          }
          const cy = ay0 + h + 0.07 * sc, cz = az + 0.07 * sc;
          for (let p = 0; p < 10; p++) {
            const pa = p / 10 * PI * 2;
            F.ekle(G.kureC, ax + Math.cos(pa) * 0.32 * sc, cy + Math.sin(pa) * 0.32 * sc, cz, 0.15 * sc, 0.075 * sc, 0.048 * sc, 0xffaa10, 0xffe848, 0, 0, pa, -0.24 * sc);
          }
          F.ekle(G.kureC, ax, cy, cz + 0.045 * sc, 0.2 * sc, 0.2 * sc, 0.075 * sc, 0x4a2a14, 0x784824, 0, 0, 0, -0.24 * sc);
          F.ekle(G.kureC, ax, cy, cz + 0.08 * sc, 0.115 * sc, 0.115 * sc, 0.045 * sc, 0x7c4a20, 0xb87634, 0, 0, 0, -0.24 * sc);
        }
      }
    }

    // Bölüm 13: Mercan Kıyısı — turkuaz kıyı çakılları, sevimli deniz kabukları ve mercan kümeleri
    if (bNo === 13) {
      const kRenk = [[0xff9488, 0xffd2cc], [0xffe8c8, 0xfff8ee], [0xffb478, 0xffe6b8], [0xd8b8ff, 0xf2e4ff], [0x78e8dc, 0xc8fff8]];
      const kiyiSon = Math.max(40, hx - 5);
      for (let i = 0; i < 64; i++) {
        const kx = ara(6.2, kiyiSon), taraf = i % 2 === 0 ? -1 : 1;
        const kz = taraf * ara(1.75, 2.75), sc = ara(0.75, 1.35), kr = kRenk[i % kRenk.length];
        if (i % 3 === 0) {
          // Deniz yıldızı
          for (let p = 0; p < 5; p++) {
            const pa = p / 5 * PI * 2;
            Y.ekle(G.koni, kx + Math.cos(pa) * 0.1 * sc, 0.06 * sc, kz + Math.sin(pa) * 0.1 * sc, 0.055 * sc, 0.18 * sc, 0.035 * sc, kr[0], kr[1], PI / 2, pa, 0);
          }
        } else {
          // Yelpaze deniz kabuğu
          Y.ekle(G.kureO, kx, 0.06 * sc, kz, 0.18 * sc, 0.055 * sc, 0.16 * sc, kr[0], kr[1], 0, ara(0, PI), 0);
          Y.ekle(G.kureK, kx, 0.05 * sc, kz - 0.12 * sc, 0.07 * sc, 0.05 * sc, 0.07 * sc, kr[0], kr[1]);
        }
      }
      // Ekstra sedef-pembe deniz kabukları ve küçük deniz yıldızları (dere kıyısı boyunca)
      const sRenk = [[0xf498b8, 0xffeef6], [0xffb4cc, 0xfff8fc], [0xee84a8, 0xffd8ea]];
      for (let i = 0; i < 16; i++) {
        const kx = ara(6.8, kiyiSon - 0.5), taraf = i % 2 === 0 ? -1 : 1;
        const kz = taraf * ara(1.68, 2.58), sr = sRenk[i % sRenk.length];
        if (i % 2 === 0) {
          const sc = ara(0.7, 1.1), ry = ara(0, PI);
          Y.ekle(G.kureO, kx, 0.055 * sc, kz, 0.16 * sc, 0.05 * sc, 0.14 * sc, sr[0], sr[1], 0, ry, 0);
          Y.ekle(G.kureK, kx - Math.sin(ry) * 0.1 * sc, 0.05 * sc, kz - Math.cos(ry) * 0.1 * sc, 0.065 * sc, 0.045 * sc, 0.065 * sc, sr[0], 0xffffff);
          if (i % 4 === 0) Y.ekle(G.kureC, kx, 0.095 * sc, kz, 0.04 * sc, 0.04 * sc, 0.04 * sc, 0xf8eefc, 0xffffff);
        } else {
          const sc = ara(0.55, 0.82);
          for (let p = 0; p < 5; p++) {
            const pa = p / 5 * PI * 2 + i * 0.4;
            Y.ekle(G.koni, kx + Math.cos(pa) * 0.085 * sc, 0.05 * sc, kz + Math.sin(pa) * 0.085 * sc, 0.048 * sc, 0.15 * sc, 0.03 * sc, sr[0], sr[1], PI / 2, pa, 0);
          }
          Y.ekle(G.kureK, kx, 0.055 * sc, kz, 0.05 * sc, 0.035 * sc, 0.05 * sc, sr[1], 0xffffff);
        }
      }
      // Dere/kıyı kenarına sevimli mercan kümeleri
      const mRenk = [[0xff6b78, 0xffb8c2], [0xff964e, 0xffd8a8], [0xe672c6, 0xffc8ef], [0x4ed4c4, 0xb8fff4]];
      for (let i = 0; i < 10; i++) {
        const mx = 7.5 + i * ((kiyiSon - 9) / 9) + ara(-1.0, 1.0), taraf = i % 2 === 0 ? -1 : 1;
        const mz = taraf * ara(1.85, 2.85), sc = ara(0.8, 1.2), mr = mRenk[i % mRenk.length];
        Y.ekle(G.kureO, mx, 0.08 * sc, mz, 0.25 * sc, 0.11 * sc, 0.21 * sc, 0xd8b89a, 0xfff0dc);
        Y.ekle(G.kureC, mx - 0.14 * sc, 0.07 * sc, mz + 0.1 * sc, 0.09 * sc, 0.06 * sc, 0.08 * sc, 0x70c8b0, 0xb8f4e4);
        for (let b = 0; b < 4; b++) {
          const ba = b / 4 * PI * 2 + i * 0.6, bx = mx + Math.cos(ba) * 0.11 * sc, bz = mz + Math.sin(ba) * 0.09 * sc;
          const bh = (0.28 + (b % 2) * 0.16) * sc, tiltZ = -Math.cos(ba) * 0.28, tiltX = Math.sin(ba) * 0.28;
          const tx = bx + Math.sin(-tiltZ) * bh * 0.45, tz = bz + Math.sin(tiltX) * bh * 0.45;
          Y.ekle(G.sil, bx, 0.08 * sc + bh * 0.5, bz, 0.048 * sc, bh, 0.048 * sc, mr[0], mr[1], tiltX, 0, tiltZ);
          Y.ekle(G.kureK, tx, 0.08 * sc + bh, tz, 0.078 * sc, 0.078 * sc, 0.078 * sc, mr[0], mr[1]);
          if (b % 2 === 0) {
            const subH = 0.16 * sc, stZ = tiltZ * 1.55, stX = tiltX * 1.55;
            Y.ekle(G.silA3, tx * 0.65 + bx * 0.35, 0.08 * sc + bh * 0.68, tz * 0.65 + bz * 0.35, 0.032 * sc, subH, 0.032 * sc, mr[0], mr[1], stX, 0, stZ);
            Y.ekle(G.kureC, tx * 0.65 + bx * 0.35 + Math.sin(-stZ) * subH * 0.5, 0.08 * sc + bh * 0.78, tz * 0.65 + bz * 0.35 + Math.sin(stX) * subH * 0.5, 0.055 * sc, 0.055 * sc, 0.055 * sc, mr[1], 0xffffff);
          }
        }
      }
    }

    // Bölüm 14: Kristal Vadi — parlayan pastel kristaller ve ışık küreleri
    if (bNo === 14) {
      const KRS = dyYapi();
      const krRenk = [[0x70d8ff, 0xd8f8ff], [0xc488ff, 0xf2dcff], [0xff8ed0, 0xffd8f0], [0x78f4d4, 0xd4fff4]];
      for (let i = 0; i < 26; i++) {
        const kx = ara(minX + 6, maxX - 6), kz = ara(-13, -2.0);
        if ((Math.abs(kx) < 5 && kz > -5) || (kx > hx - 4.5 && kx < hx + 4.5 && kz > -3.5)) continue;
        const ky0 = yerY(kx, kz), sc = ara(0.75, 1.45), kr = krRenk[i % krRenk.length];
        for (let j = 0; j < 3; j++) {
          const ox = kx + (j - 1) * 0.24 * sc, oz = kz + (j % 2 ? 0.14 : -0.1) * sc;
          const h = (j === 1 ? 1.35 : 0.88) * sc, r = (j === 1 ? 0.22 : 0.16) * sc;
          KRS.ekle(G.koni4, ox, ky0 + h * 0.5, oz, r, h, r, kr[0], kr[1], (j - 1) * 0.14, j * 0.5, (j - 1) * -0.22);
        }
        // Taban yosun/taş yastığı + havada parlayan küçük kristal elmasçık
        KRS.ekle(G.kureC, kx, ky0 + 0.06 * sc, kz, 0.34 * sc, 0.1 * sc, 0.28 * sc, 0x566494, 0x90a4d8);
        KRS.ekle(G.oct, kx, ky0 + 1.58 * sc, kz, 0.07 * sc, 0.11 * sc, 0.07 * sc, kr[1], 0xffffff, 0, i * 0.5, 0);
        // Kristal kümesi içine ve üstüne küçük parlak pastel ışık küreleri
        KRS.ekle(G.kureK, kx, ky0 + 0.52 * sc, kz + 0.04 * sc, 0.11 * sc, 0.11 * sc, 0.11 * sc, kr[1], 0xffffff);
        KRS.ekle(G.kureK, kx + (i % 2 ? 0.14 : -0.14) * sc, ky0 + 1.42 * sc, kz + 0.06 * sc, 0.075 * sc, 0.075 * sc, 0.075 * sc, kr[1], 0xffffff);
      }
      // Orta planda 4 adet daha büyük pastel parlayan kristal kümesi (KRS içinde, 0 ek çizim çağrısı)
      for (const [kx, kz, sc, ci] of [[-12, -16.5, 2.35, 0], [18, -19.5, 2.65, 1], [50, -17.5, 2.5, 2], [82, -19.0, 2.7, 3]]) {
        const ky0 = yerY(kx, kz) - 0.1, kr = krRenk[ci % krRenk.length];
        KRS.ekle(G.kureC, kx, ky0 + 0.08 * sc, kz, 0.55 * sc, 0.14 * sc, 0.45 * sc, 0x526090, 0x8ea2d6);
        for (let j = 0; j < 5; j++) {
          const ang = (j / 5) * PI * 2 + ci * 0.4, dist = j === 0 ? 0 : 0.32 * sc;
          const ox = kx + Math.cos(ang) * dist, oz = kz + Math.sin(ang) * dist * 0.75;
          const h = (j === 0 ? 1.65 : (j % 2 ? 1.18 : 0.92)) * sc, r = (j === 0 ? 0.28 : 0.19) * sc;
          KRS.ekle(G.koni4, ox, ky0 + h * 0.5, oz, r, h, r, kr[0], kr[1],
            j === 0 ? 0 : Math.sin(ang) * 0.2, j * 0.45, j === 0 ? 0 : -Math.cos(ang) * 0.24);
        }
        KRS.ekle(G.oct, kx, ky0 + 1.92 * sc, kz, 0.11 * sc, 0.17 * sc, 0.11 * sc, kr[1], 0xffffff, 0, ci * 0.6, 0);
        KRS.ekle(G.kureK, kx, ky0 + 0.64 * sc, kz + 0.12 * sc, 0.15 * sc, 0.15 * sc, 0.15 * sc, kr[1], 0xffffff);
        KRS.ekle(G.kureK, kx + (ci % 2 ? 0.18 : -0.18) * sc, ky0 + 1.72 * sc, kz + 0.08 * sc, 0.1 * sc, 0.1 * sc, 0.1 * sc, kr[1], 0xffffff);
      }
      const km = dyMalz(true, true, 0.5, { roughness: 0.22, metalness: 0.15, emissive: 0x5878c8, emissiveIntensity: 0.55 });
      const kMesh = new T.Mesh(KRS.geo(), km); kMesh.castShadow = true; kMesh.receiveShadow = true; gr.add(kMesh);
    }

    // Bölüm 16: Akçaağaç Ormanı — zemine dökülmüş sonbahar yaprakları, yaprak öbekleri ve yosunlu kütükler
    if (bNo === 16) {
      const yRenk = [[0xd84824, 0xff8c38], [0xe87820, 0xffc048], [0xc03224, 0xee5c38]];
      for (let i = 0; i < 90; i++) {
        const lx = ara(minX + 4, maxX - 6), lz = ara(-10, 2.2), yr = yRenk[i % yRenk.length];
        if ((Math.abs(lx) < 4.5 && lz > -2) || (lx > hx - 3.5 && lx < hx + 3.5 && lz > -1.5)) continue;
        F.ekle(G.kureK, lx, yerY(lx, lz) + 0.04, lz, ara(0.09, 0.15), 0.025, ara(0.07, 0.12), yr[0], yr[1], 0, ara(0, PI), 0);
      }
      // Sevimli düşmüş sonbahar yaprak öbekleri
      for (let i = 0; i < 14; i++) {
        const ox = ara(minX + 5, maxX - 7), oz = ara(-9.5, 1.4);
        if ((Math.abs(ox) < 5 && oz > -2.5) || (ox > hx - 4 && ox < hx + 4 && oz > -2)) continue;
        const oy = yerY(ox, oz), sc = ara(0.85, 1.3);
        for (let k = 0; k < 5; k++) {
          const yr = yRenk[(i + k) % yRenk.length], a = (k / 5) * PI * 2 + i * 0.6, d = k === 0 ? 0 : 0.18 * sc;
          F.ekle(G.kureK, ox + Math.cos(a) * d, oy + (k === 0 ? 0.07 : 0.04) * sc, oz + Math.sin(a) * d * 0.75,
            (k === 0 ? 0.26 : 0.2) * sc, (k === 0 ? 0.09 : 0.06) * sc, (k === 0 ? 0.22 : 0.17) * sc, yr[0], yr[1], 0, a, 0);
        }
      }
      // 2 yosunlu ağaç kütüğü detayı
      const kutuk = (kx, kz, sc) => {
        const ky = yerY(kx, kz);
        S.ekle(G.kule, kx, ky + 0.16 * sc, kz, 0.42 * sc, 0.34 * sc, 0.42 * sc, 0x4c301c, 0x6e482c);
        S.ekle(G.sil, kx, ky + 0.34 * sc, kz, 0.32 * sc, 0.48 * sc, 0.32 * sc, 0x5c3c24, 0x7e5438);
        S.ekle(G.sil, kx, ky + 0.58 * sc, kz, 0.27 * sc, 0.03 * sc, 0.27 * sc, 0xd4aa78, 0xf2d6a6);
        S.ekle(G.kureK, kx + 0.22 * sc, ky + 0.42 * sc, kz + 0.16 * sc, 0.22 * sc, 0.14 * sc, 0.19 * sc, 0x467e32, 0x7cb844);
        S.ekle(G.kureK, kx - 0.18 * sc, ky + 0.18 * sc, kz + 0.26 * sc, 0.2 * sc, 0.11 * sc, 0.17 * sc, 0x4c8836, 0x88c44c);
        F.ekle(G.kureK, kx + 0.06 * sc, ky + 0.61 * sc, kz - 0.05 * sc, 0.11 * sc, 0.028 * sc, 0.09 * sc, 0xd84824, 0xff8c38, 0, 0.4, 0);
        F.ekle(G.kureK, kx - 0.26 * sc, ky + 0.05 * sc, kz + 0.32 * sc, 0.12 * sc, 0.03 * sc, 0.1 * sc, 0xe87820, 0xffc048, 0, 1.1, 0);
      };
      kutuk(hx * 0.28, -3.5, 1.05);
      kutuk(hx * 0.66, -4.4, 0.92);
    }

    // Bölüm 17: Kuzey Işıkları — çayırda küçük parlayan buz/kuzey çiçeği detayları (F içinde, 0 ek çizim çağrısı)
    if (bNo === 17) {
      const bzRenk = [[0x68ffd8, 0xd8fff6], [0x88d8ff, 0xeef8ff], [0xb898ff, 0xf2e4ff]];
      for (let i = 0; i < 16; i++) {
        const kx = ara(minX + 6, maxX - 6), kz = ara(-10.5, 1.8);
        if ((Math.abs(kx) < 4.8 && kz > -2.6) || (kx > hx - 4 && kx < hx + 4 && kz > -2.6)) continue;
        const br = bzRenk[i % bzRenk.length];
        for (let k = 0; k < 2; k++) {
          const fx = kx + ara(-0.38, 0.38), fz = kz + ara(-0.28, 0.28), sc = ara(0.75, 1.15);
          const gy = yerY(fx, fz), fh = 0.28 * sc;
          F.ekle(G.silA3, fx, gy + fh * 0.5, fz, 0.018 * sc, fh, 0.018 * sc, 0x2a7a78, 0x68e8d8, 0, 0, 0, 0.65);
          for (let y = 0; y < 3; y++) {
            const ya = y / 3 * PI * 2 + i * 0.7;
            F.ekle(G.kureK, fx + Math.cos(ya) * 0.075 * sc, gy + 0.03 * sc, fz + Math.sin(ya) * 0.065 * sc, 0.062 * sc, 0.025 * sc, 0.042 * sc, 0x308a8c, 0x8ef8ea, 0, -ya, 0.25);
          }
          for (let p = 0; p < 5; p++) {
            const pa = p / 5 * PI * 2 + i * 0.5;
            F.ekle(G.koni4, fx + Math.cos(pa) * 0.065 * sc, gy + fh + Math.sin(pa) * 0.065 * sc, fz, 0.042 * sc, 0.095 * sc, 0.03 * sc, br[0], br[1], 0, 0, pa - PI / 2, -0.65);
          }
          F.ekle(G.oct, fx, gy + fh, fz + 0.024 * sc, 0.048 * sc, 0.048 * sc, 0.048 * sc, 0xb8ffff, 0xffffff, 0, i * 0.4, PI / 4, -0.65);
        }
      }
    }

    // Bölüm 18: Yüzen Masal Adaları — dere kıyısına küçük yuvarlak çakıl taşları ve birkaç çiçek (Y/F içinde, 0 ek çizim çağrısı)
    if (bNo === 18) {
      const cRenk = [[0x8a96a0, 0xc6d0d8], [0xb4aa9e, 0xeae2d6], [0x7e949c, 0xb8ccd4], [0xc2b8ae, 0xf0e8de]];
      const dereSon = Math.max(40, hx - 5);
      for (let i = 0; i < 64; i++) {
        const px = ara(6.2, dereSon), taraf = i % 2 === 0 ? -1 : 1;
        const pz = taraf * ara(1.75, 2.45), pr = ara(0.1, 0.23), cr = cRenk[i % cRenk.length];
        Y.ekle(G.kureO, px, pr * 0.32, pz, pr * 1.25, pr * 0.48, pr * 0.95, cr[0], cr[1], 0, ara(0, PI), 0);
      }
      for (let i = 0; i < 16; i++) {
        const fx = ara(6.8, dereSon - 0.6), taraf = i % 2 === 0 ? -1 : 1;
        const fz = taraf * ara(1.85, 2.55), rk = B.cicek[i % B.cicek.length];
        cicek(fx, fz, ara(0.32, 0.56), rk[0], rk[1]);
      }
    }

    // Su/nilüfer bölümleri (5, 13, 18): su yüzeyi minik parıltı ve köpük halkaları (Y/L içinde, 0 ek çizim çağrısı)
    if (bNo === 5 || bNo === 13 || bNo === 18) {
      const dereSon = Math.max(40, hx - 5);
      const kopukRenk = bNo === 13 ? [0x9ef8f0, 0xf2ffff] : (bNo === 18 ? [0xd8f0ff, 0xfff8e8] : [0xc8f4ff, 0xffffff]);
      const pariltiRenk = bNo === 13 ? [0xb4fff8, 0xffffff] : (bNo === 18 ? [0xffeeb0, 0xffffff] : [0xd8f8ff, 0xffffff]);
      for (let i = 0; i < 28; i++) {
        const sx = 7.0 + i * ((dereSon - 8.0) / 27) + ara(-0.45, 0.45);
        const sz = ara(-1.55, 1.75), hr = ara(0.14, 0.34);
        Y.ekle(G.halkaInce, sx, 0.052, sz, hr, hr, 0.24, kopukRenk[0], kopukRenk[1], PI / 2, 0, 0, -0.04);
        if (i % 2 === 0) {
          Y.ekle(G.halkaInce, sx + ara(-0.22, 0.22), 0.052, sz + ara(-0.18, 0.18), hr * 0.52, hr * 0.52, 0.22, kopukRenk[1], 0xffffff, PI / 2, 0, 0, -0.05);
        }
        const px = sx + ara(-0.35, 0.35), pz = sz + ara(-0.35, 0.35), pr = ara(0.038, 0.065);
        L.ekle(G.oct, px, 0.06, pz, pr, pr * 0.42, pr, pariltiRenk[0], pariltiRenk[1], 0, i * 0.65, 0, -0.06);
      }
      for (let idx = 0; idx < niluferList.length; idx++) {
        const N = niluferList[idx]; if (!N) continue;
        const sc = (N.r || 1.8) / 1.8, sy = (N.y != null ? N.y : 0.18) - 0.08;
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * PI * 2 + idx * 0.7, dist = 1.68 * sc + (k % 2) * 0.28;
          const kx = N.x + Math.cos(a) * dist, kz = Math.sin(a) * dist * 0.78;
          const kr = (0.14 + (k % 2) * 0.07) * sc;
          Y.ekle(G.halkaInce, kx, sy, kz, kr, kr, 0.22, kopukRenk[0], kopukRenk[1], PI / 2, 0, 0, -0.04);
          L.ekle(G.oct, kx + Math.cos(a + 0.4) * 0.2, sy + 0.012, kz + Math.sin(a + 0.4) * 0.16, 0.048, 0.02, 0.048, pariltiRenk[0], pariltiRenk[1], 0, a, 0, -0.06);
        }
      }
    }

    // Bölüm 19: Altın Şafak Tapınağı — taş kemerlerinin tabanına yumuşak yosun, çiçek ve altın taşlı patika plakaları (S/F/Y içinde, 0 ek çizim çağrısı)
    if (bNo === 19) {
      const kemerler = [[-8, -18, 1.15], [18, -22, 1.35], [48, -19, 1.25], [78, -21, 1.3], [104, -18, 1.15]];
      for (const [tx, tz, sc] of kemerler) {
        const ty = yerY(tx, tz) - 0.15, w = 2.0 * sc;
        for (const q of [-1, 1]) {
          const bx = tx + q * w, bz = tz + 0.48 * sc;
          S.ekle(G.kureK, bx - q * 0.22 * sc, ty + 0.38 * sc, bz, 0.34 * sc, 0.16 * sc, 0.28 * sc, 0x4e7c38, 0x94c454);
          S.ekle(G.kureK, bx + q * 0.28 * sc, ty + 0.24 * sc, bz + 0.14 * sc, 0.28 * sc, 0.13 * sc, 0.24 * sc, 0x5c8a40, 0xa8d262);
          S.ekle(G.kureK, bx - q * 0.46 * sc, ty + 0.22 * sc, bz + 0.18 * sc, 0.24 * sc, 0.11 * sc, 0.2 * sc, 0x4a7634, 0x88b84c);
          const fc1 = B.cicek[(q > 0 ? 0 : 1) % B.cicek.length], fc2 = B.cicek[(q > 0 ? 2 : 3) % B.cicek.length];
          F.ekle(G.kureK, bx - q * 0.22 * sc, ty + 0.48 * sc, bz + 0.06 * sc, 0.09 * sc, 0.07 * sc, 0.09 * sc, fc1[0], fc1[1]);
          F.ekle(G.kureK, bx + q * 0.26 * sc, ty + 0.32 * sc, bz + 0.2 * sc, 0.08 * sc, 0.065 * sc, 0.08 * sc, fc2[0], fc2[1]);
          F.ekle(G.kureK, bx - q * 0.44 * sc, ty + 0.29 * sc, bz + 0.22 * sc, 0.075 * sc, 0.06 * sc, 0.075 * sc, fc1[0], fc1[1]);
        }
        S.ekle(G.kureK, tx - 0.45 * sc, ty + 0.24 * sc, tz + 0.66 * sc, 0.3 * sc, 0.12 * sc, 0.22 * sc, 0x56843c, 0x9ec85a);
        S.ekle(G.kureK, tx + 0.42 * sc, ty + 0.22 * sc, tz + 0.68 * sc, 0.26 * sc, 0.11 * sc, 0.2 * sc, 0x4e7c38, 0x90be52);
        const fc3 = B.cicek[0], fc4 = B.cicek[2];
        F.ekle(G.kureK, tx - 0.44 * sc, ty + 0.32 * sc, tz + 0.72 * sc, 0.08 * sc, 0.065 * sc, 0.08 * sc, fc3[0], fc3[1]);
        F.ekle(G.kureK, tx + 0.4 * sc, ty + 0.3 * sc, tz + 0.74 * sc, 0.075 * sc, 0.06 * sc, 0.075 * sc, fc4[0], fc4[1]);
      }
      // Kemerler boyunca uzanan küçük altın taşlı patika plakaları (Y içinde, 0 ek çizim çağrısı)
      const ptRenk = [[0xd6aa52, 0xfae494], [0xc89846, 0xf2d67c]];
      for (let i = 0; i < kemerler.length - 1; i++) {
        const [x0, z0] = kemerler[i], [x1, z1] = kemerler[i + 1];
        const adim = 11;
        for (let s = 0; s < adim; s++) {
          const u = s / adim, px = x0 + (x1 - x0) * u + ara(-0.22, 0.22);
          const pz = z0 + (z1 - z0) * u + 1.25 + Math.sin(u * PI) * 0.9 + ara(-0.28, 0.28);
          const pr = ptRenk[(i + s) % ptRenk.length];
          Y.ekle(G.kutu, px, yerY(px, pz) + 0.035, pz, ara(0.78, 1.16), 0.07, ara(0.48, 0.72), pr[0], pr[1], 0, ara(-0.18, 0.18), 0);
        }
      }
    }

    // Küçük mantar süsleri (Bölüm 2 Mantar Ormanı'nda ekstra renkli & bol!)
    const mnt = (x, z, k, renk, ustRenk) => {
      Y.ekle(G.kule, x, 0.25 * k, z, 0.12 * k, 0.5 * k, 0.12 * k, 0xe4d6be, 0xfff6e8);
      Y.ekle(G.kureO, x, 0.42 * k, z, 0.28 * k, 0.06 * k, 0.28 * k, 0xf2e2ca, 0xfff8ec);
      Y.ekle(G.kubbe, x, 0.42 * k, z, 0.34 * k, 0.28 * k, 0.34 * k, renk, ustRenk || 0xff9a8a);
      for (const [bx, by, bz, br] of [[0, 0.65, 0.18, 0.055], [-0.16, 0.57, 0.2, 0.045], [0.16, 0.56, 0.21, 0.045], [-0.08, 0.62, -0.18, 0.04], [0.11, 0.6, -0.16, 0.038]]) {
        Y.ekle(G.kureK, x + bx * k, by * k, z + bz * k, br * k, br * 0.8 * k, br * 0.7 * k, 0xfffaf2, 0xffffff);
      }
      for (let t = 0; t < 3; t++) {
        const ta = t / 3 * PI * 2 + 0.3;
        Y.ekle(G.kureK, x + Math.cos(ta) * 0.14 * k, 0.06 * k, z + Math.sin(ta) * 0.14 * k, 0.09 * k, 0.07 * k, 0.08 * k, B.cimen[0], B.cimen[1]);
      }
    };
    mnt(-6, -2.5, 1.2, 0xd8403a); mnt(-5.2, -3.2, 0.8, 0xe0603a); mnt(12, -4, 1.0, 0xd8403a); mnt(hx + 6, -3, 1.3, 0xd8403a);
    if (bNo === 2) {
      const mRenk = [[0xe03a78, 0xff8ab8], [0x8e48e8, 0xc898ff], [0x28b8a8, 0x78f0e0], [0xe87828, 0xffb858], [0xd83a3a, 0xff7868]];
      for (let i = 0; i < 24; i++) {
        const mx = ara(-18, maxX - 8), mz = ara(-11, -1.8), mr = mRenk[i % mRenk.length];
        if (mx > hx - 4 && mx < hx + 4 && mz > -3) continue;
        mnt(mx, mz, ara(0.9, 2.1), mr[0], mr[1]);
      }
      for (const [mx, mz, mk, ci] of [[-12, -3.4, 0.85, 0], [4.5, -2.6, 0.78, 1], [hx * 0.36, -3.8, 0.92, 2], [hx * 0.68, -2.9, 0.82, 3], [hx + 9.5, -3.6, 0.88, 4]]) {
        const mr = mRenk[ci % mRenk.length];
        mnt(mx, mz, mk, mr[0], mr[1]);
      }
    }

    // Piknik örtüsü + minder + sepet + elmalar + tabak/çörek + çiçek halkası (hx)
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) Y.ekle(G.kutu, hx - 1.5 + 0.5 * i + 0.25, 0.04, -0.9 + 0.5 * j + 0.25, 0.5, 0.06, 0.5, (i + j) % 2 ? 0xfff3e6 : 0xe85a5a, (i + j) % 2 ? 0xffffff : 0xf07070);
    for (let i = 0; i < 6; i++) {
      Y.ekle(G.kureK, hx - 1.25 + i * 0.5, 0.04, 1.13, 0.14, 0.03, 0.06, i % 2 ? 0xfff3e6 : 0xf27878, 0xffffff);
      Y.ekle(G.kureK, hx - 1.25 + i * 0.5, 0.04, -0.93, 0.14, 0.03, 0.06, i % 2 ? 0xf27878 : 0xfff3e6, 0xffffff);
    }
    // Örtü üzerinde yumuşak yastık + tabak & poğaça/çilek
    Y.ekle(G.kureO, hx - 0.85, 0.13, -0.35, 0.42, 0.14, 0.34, 0xffb86c, 0xffe4a8, 0, 0.2, 0);
    Y.ekle(G.sil, hx + 0.15, 0.09, 0.1, 0.34, 0.04, 0.34, 0xf2eee8, 0xffffff);
    Y.ekle(G.kureO, hx + 0.08, 0.16, 0.08, 0.14, 0.09, 0.12, 0xd88838, 0xf6b860);
    Y.ekle(G.kureO, hx + 0.26, 0.15, 0.14, 0.11, 0.08, 0.1, 0xd88838, 0xf6b860);
    // Örgülü piknik sepeti + kapağı + elmalar
    Y.ekle(G.kule, hx + 1.9, 0.28, -0.8, 0.46, 0.56, 0.36, 0x986234, 0xd59a5a);
    Y.ekle(G.kutu, hx + 1.9, 0.56, -0.8, 0.98, 0.08, 0.78, 0x8a582e, 0xc4884c);
    Y.ekle(G.kutu, hx + 1.9, 0.62, -1.02, 0.94, 0.07, 0.38, 0xa86e3c, 0xdca060, -0.35, 0, 0);
    Y.ekle(G.torusSap, hx + 1.9, 0.58, -0.8, 1, 1, 1, 0x8a5a30, 0xb8804a);
    Y.ekle(G.kure, hx + 1.76, 0.7, -0.72, 0.16, 0.16, 0.16, 0xe23a3a, 0xff6a5a);
    Y.ekle(G.kure, hx + 2.02, 0.68, -0.68, 0.14, 0.14, 0.14, 0x78c038, 0xb8ee60);
    Y.ekle(G.kureK, hx + 1.78, 0.86, -0.72, 0.06, 0.03, 0.04, 0x469838, 0x80d458, 0, 0, 0.4);
    // Sepette örgü kuşakları + üstüne serili kareli peçete
    for (const yy of [0.1, 0.24, 0.38, 0.5]) {
      const r = 0.575 - 0.23 * (yy / 0.56);
      Y.ekle(G.halkaInce, hx + 1.9, yy, -0.8, r, r * 0.78, 1.4, 0x7a4a24, 0xb87c44, PI / 2, 0, 0);
    }
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) Y.ekle(G.kutu, hx + 1.62 + i * 0.16, 0.64, -0.62 + j * 0.16, 0.16, 0.02, 0.16, (i + j) % 2 ? 0xffffff : 0x4aa0e0, (i + j) % 2 ? 0xffffff : 0x70c0ff, 0, 0, -0.12);
    // Bilbo'ya kemik biçimli kurabiye + çay fincanı
    const kbx = hx - 0.35, kbz = 0.6;
    Y.ekle(G.sil, kbx, 0.1, kbz, 0.07, 0.36, 0.07, 0xe8c890, 0xfff0d0, 0, 0, PI / 2);
    for (const q of [-1, 1]) for (const w of [-1, 1]) Y.ekle(G.kureK, kbx + q * 0.2, 0.1, kbz + w * 0.06, 0.08, 0.08, 0.08, 0xe8c890, 0xfff0d0);
    Y.ekle(G.sil, hx + 0.75, 0.15, 0.45, 0.1, 0.16, 0.1, 0xf0f4ff, 0xffffff);
    Y.ekle(G.sil, hx + 0.75, 0.235, 0.45, 0.085, 0.01, 0.085, 0xa8603a, 0xc87c4c);
    Y.ekle(G.torusYuva, hx + 0.86, 0.15, 0.45, 0.18, 0.18, 0.18, 0xf0f4ff, 0xffffff);
    Y.ekle(G.sil, hx + 0.75, 0.075, 0.45, 0.16, 0.015, 0.16, 0xffb0c8, 0xffd0e0);

    // Bayrak ipi + sıcak fener
    const x0 = hx - 3.0, x1 = hx + 3.3, zb = -1.9, hb = 3.1;
    for (const xp of [x0, x1]) { S.ekle(G.sil, xp, hb / 2, zb, 0.08, hb, 0.08, 0x8a5a3a, 0xb8804a); S.ekle(G.kure, xp, hb + 0.06, zb, 0.13, 0.13, 0.13, 0xffd060, 0xfff0a0); }
    const ipY = (u) => hb - 0.05 - Math.sin(u * PI) * 0.75, BR = [[0xe8507e, 0xff7aa6], [0xf0a818, 0xffcc40], [0x3c96dc, 0x62b4f0], [0x3cb882, 0x62d8a0], [0xf06a32, 0xff8c50]];
    const bayraklar = [];
    for (let i = 0; i < 24; i++) {
      const u0 = i / 24, u1 = (i + 1) / 24, xa = x0 + (x1 - x0) * u0, xb = x0 + (x1 - x0) * u1, ya = ipY(u0), yb = ipY(u1);
      S.ekle(G.sil, (xa + xb) / 2, (ya + yb) / 2, zb, 0.02, Math.hypot(xb - xa, yb - ya) + 0.02, 0.02, 0xfff0e0, 0xfff0e0, 0, 0, -Math.atan2(xb - xa, yb - ya));
    }
    for (let i = 1; i < 10; i++) { const u = i / 10, x = x0 + (x1 - x0) * u, y = ipY(u); bayraklar.push([x, y - 0.27, zb + 0.02, BR[i % 5]]); }
    S.ekle(G.sil, x1 + 0.28, hb - 0.35, zb, 0.02, 0.4, 0.02, 0x6a4a30, 0x6a4a30, 0, 0, PI / 2);
    const fx = x1 + 0.5, fy = hb - 0.75, fz = zb + 0.05;

    for (let k = 0; k < 16; k++) {
      const a = k / 16 * PI * 2, x = hx + Math.cos(a) * 2.5, z = Math.sin(a) * 1.4 - 0.3;
      if (z > 0.6) continue;
      const rk = B.cicek[k % 2]; cicek(x, z, 0.35, rk[0], rk[1]);
    }
    // Hedef çayırı ve çit arkasına nazikçe sallanan birkaç kır çiçeği (F içinde, 0 ek çizim çağrısı)
    for (let k = 0; k < 10; k++) {
      const u = k / 9, fx = hx - 3.6 + u * 7.5 + ara(-0.22, 0.22);
      const fz = (k === 0 || k === 9) ? ara(-1.5, -0.45) : ara(-3.25, -2.55);
      const rk = B.cicek[(k + 1) % B.cicek.length];
      cicek(fx, fz, 0.36 + (k % 3) * 0.06, rk[0], rk[1]);
    }
    for (let k = 0; k < 4; k++) {
      const u = k / 3, bx = (k % 2 === 0 ? hx - 2.15 : hx + 2.25) + (k >= 2 ? (k === 2 ? -0.65 : 0.7) : 0);
      const bz = k < 2 ? 0.72 + u * 0.08 : -0.38;
      const rk = B.cicek[(k + 2) % B.cicek.length];
      cicek(bx, bz, 0.32 + (k % 2) * 0.1, rk[0], rk[1]);
    }

    // Piknik alanı çevresinde sevimli çit ve taş süsleri
    {
      const cx0 = hx - 3.35, cx1 = hx + 3.65, cz = -2.25;
      for (let i = 0; i <= 10; i++) {
        const px = cx0 + (cx1 - cx0) * (i / 10);
        Y.ekle(G.kutu, px, 0.34, cz, 0.14, 0.68, 0.07, 0xe8d6c0, 0xfff8ee);
        Y.ekle(G.koni4, px, 0.74, cz, 0.11, 0.14, 0.08, 0xfff4e6, 0xffffff, 0, PI / 4, 0);
      }
      Y.ekle(G.kutu, (cx0 + cx1) * 0.5, 0.22, cz - 0.04, cx1 - cx0 + 0.15, 0.07, 0.05, 0xd8c2a8, 0xf2e4d0);
      Y.ekle(G.kutu, (cx0 + cx1) * 0.5, 0.48, cz - 0.04, cx1 - cx0 + 0.15, 0.07, 0.05, 0xd8c2a8, 0xf2e4d0);
      for (let k = 0; k < 12; k++) {
        const a = PI + (k / 11) * PI, sx = hx + Math.cos(a) * 2.75, sz = -0.35 + Math.sin(a) * 1.45;
        const sr = 0.16 + (k % 3) * 0.04;
        Y.ekle(G.kureO, sx, sr * 0.3, sz, sr * 1.3, sr * 0.45, sr * 0.95, 0xb8b0a6, 0xe8e0d6, 0, a, 0);
      }
      // Bilbo'nun piknik alanı çevresinde minik yuvarlak adım taşları ve yonca öbekleri (Y/S içinde, 0 ek çizim çağrısı)
      const pTasRenk = [[0xc4bab0, 0xf2eae0], [0xb4aca2, 0xe4dcd2], [0xa8a096, 0xd8d0c6]];
      const pAdim = [
        [hx - 3.15, 0.85, 0.21], [hx - 2.65, 1.12, 0.23], [hx - 2.1, 0.95, 0.2], [hx - 1.72, 1.24, 0.18],
        [hx + 1.85, 1.16, 0.19], [hx + 2.38, 0.88, 0.22], [hx + 2.86, 0.48, 0.2]
      ];
      for (let i = 0; i < pAdim.length; i++) {
        const [tx, tz, tr] = pAdim[i], cr = pTasRenk[i % pTasRenk.length];
        Y.ekle(G.kureO, tx, tr * 0.22, tz, tr * 1.24, tr * 0.35, tr * 0.95, cr[0], cr[1], 0, i * 0.8, 0);
        if (i % 2 === 1) Y.ekle(G.kureK, tx - tr * 0.9, tr * 0.14, tz + tr * 0.42, tr * 0.46, tr * 0.2, tr * 0.4, cr[0], cr[1], 0, i * 1.2, 0);
      }
      const pYonca = [
        [hx - 2.85, 0.25], [hx - 2.32, 1.28], [hx - 0.15, 1.34], [hx + 1.45, 1.3],
        [hx + 2.55, 0.05], [hx + 2.75, -1.15], [hx - 2.95, -0.85]
      ];
      for (let i = 0; i < pYonca.length; i++) {
        const [yx, yz] = pYonca[i];
        for (let t = 0; t < 3; t++) {
          const ox = yx + (t - 1) * 0.14 + ara(-0.04, 0.04), oz = yz + ara(-0.09, 0.09);
          const yaprakSay = (i + t) % 4 === 0 ? 4 : 3, sc = ara(0.85, 1.15), h = 0.07 * sc;
          S.ekle(G.silA3, ox, h * 0.5, oz, 0.012, h, 0.012, 0x2a7636, 0x5ec24e, 0, 0, 0, 0.3);
          for (let k = 0; k < yaprakSay; k++) {
            const a = (k / yaprakSay) * PI * 2 + t * 0.55;
            S.ekle(G.kureK, ox + Math.cos(a) * 0.045 * sc, h + 0.01, oz + Math.sin(a) * 0.045 * sc, 0.048 * sc, 0.016, 0.042 * sc, 0x2e883c, 0x7ee060, 0, -a, 0, 0.35);
          }
        }
      }
    }

    const sm = new T.Mesh(S.geo(), dyMalz(true)); sm.receiveShadow = true; gr.add(sm);
    const ym = new T.Mesh(Y.geo(), dyMalz(true, true, 0, { roughness: 0.65 })); ym.castShadow = true; ym.receiveShadow = true; gr.add(ym);
    const geceParla = bNo === 10 || bNo === 17 || bNo === 20;
    const fm = dyMalz(true, true, 0, { emissive: geceParla ? 0x8a78d8 : (B.gece ? 0x3a3248 : 0x7a6656), emissiveIntensity: geceParla ? 0.78 : 1.0 }); gr.add(new T.Mesh(F.geo(), fm));

    // Fener + bayraklar + Bölüm 10 Yıldızlı Gece Şenliği sıcak ışıklı fenerler
    L.ekle(G.kure, fx, fy, fz, 0.22, 0.28, 0.22, 0xff9418, 0xffc840, 0, 0, 0, -0.07);
    L.ekle(G.koni, fx, fy + 0.34, fz, 0.2, 0.16, 0.2, 0xc0503e, 0xe07060, 0, 0, 0, -0.07);
    L.ekle(G.sil, fx, fy - 0.27, fz, 0.16, 0.06, 0.16, 0xc0503e, 0xc0503e, 0, 0, 0, -0.07);
    for (const [x, y, z, br] of bayraklar) L.ekle(G.koni, x, y + 0.03, z, 0.23, 0.46, 0.05, br[1], br[0], PI, 0, 0, -0.12);
    // Piknik alanı çevresinde masalsı parlayan yıldız süsleri (L içinde, 0 ek çizim çağrısı)
    for (const sx of [hx - 3.35, hx + 3.65]) {
      L.ekle(G.oct, sx, 0.96, -2.25, 0.065, 0.085, 0.065, 0xffd260, 0xffffd8, 0, PI / 4, 0, -0.12);
    }
    for (let k = 0; k < 5; k++) {
      const a = PI + (k / 4) * PI, sx = hx + Math.cos(a) * 2.65, sz = Math.sin(a) * 1.45 - 0.35;
      L.ekle(G.oct, sx, 0.58 + (k % 2) * 0.16, sz, 0.05, 0.068, 0.05, 0xffe488, 0xfffff0, 0, k * 0.6, 0, -0.16);
    }

    const hlPos = [], hlUv = [], q = (cx, cy, cz, w, h) => {
      hlPos.push(cx - w, cy - h, cz, cx + w, cy - h, cz, cx + w, cy + h, cz, cx - w, cy - h, cz, cx + w, cy + h, cz, cx - w, cy + h, cz);
      hlUv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
    };
    const qZ = (cx, cy, cz, rx, rz) => {
      hlPos.push(cx - rx, cy, cz - rz, cx + rx, cy, cz - rz, cx + rx, cy, cz + rz, cx - rx, cy, cz - rz, cx + rx, cy, cz + rz, cx - rx, cy, cz + rz);
      hlUv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
    };
    q(fx, fy, fz + 0.1, 0.9, 0.9);
    q(fx, fy, fz + 0.08, 1.65, 1.65);
    {
      const yZeminP = Math.max(0.06, yerY(fx, fz) + 0.06);
      qZ(fx, yZeminP, fz, 1.9, 1.35);
      qZ(fx, yZeminP + 0.01, fz, 0.95, 0.7);
    }
    q(hx, 1.6, -2.6, 6.5, 3.6);
    if (kulubePencere) {
      q(kulubePencere.x, kulubePencere.y, kulubePencere.z, 2.2, 1.9);
      q(kulubePencere.x, kulubePencere.y, kulubePencere.z + 0.02, 1.05, 0.95);
    }

    if (bNo === 10 || bNo === 20) {
      const fenerSay = bNo === 20 ? 15 : 12;
      for (let i = 0; i < fenerSay; i++) {
        const lx = -6 + i * ((hx + 16) / (fenerSay - 1)), lz = -2.8 - (i % 3) * 2.4, ly = 3.2 + (i % 2) * 1.4;
        L.ekle(G.sil, lx, ly * 0.5, lz, 0.05, ly, 0.05, 0x4a3428, 0x6a4c38);
        L.ekle(G.kure, lx, ly + 0.28, lz, 0.28, 0.36, 0.28, 0xff9830, 0xfff2a8);
        L.ekle(G.koni, lx, ly + 0.65, lz, 0.24, 0.18, 0.24, 0x8c2838, 0xb83c4c);
        for (let k = 0; k < 4; k++) {
          const a = k / 4 * PI * 2 + i * 0.7;
          L.ekle(G.kureK, lx + Math.cos(a) * 0.65, ly + 0.28 + Math.sin(a * 1.5) * 0.32, lz + Math.sin(a) * 0.45, 0.065, 0.065, 0.065, 0xffd260, 0xfff8c8);
        }
        q(lx, ly + 0.28, lz + 0.15, 2.2, 2.2);
        const yZemin = Math.max(0.06, yerY(lx, lz) + 0.06);
        qZ(lx, yZemin, lz, 2.8, 2.0);
        qZ(lx, yZemin + 0.01, lz, 1.35, 0.95);
      }
    }

    // Işıltı her parçanın kendi renginde olsun (bayraklar soluk bej değil, canlı renkli görünsün)
    const lMat = dyMalz(false, false, 0, { emissive: 0xffffff, emissiveIntensity: B.gece ? 0.85 : 0.5 });
    const lOb = lMat.onBeforeCompile;
    lMat.onBeforeCompile = (sh, rr) => { lOb(sh, rr); sh.fragmentShader = sh.fragmentShader.replace('vec3 totalEmissiveRadiance = emissive;', 'vec3 totalEmissiveRadiance = emissive * vColor.rgb;'); };
    gr.add(new T.Mesh(L.geo(), lMat));
    if (bNo === 20) {
      const DF = dyYapi();
      DF.ekle(G.kule, 0, 0.26, 0, 0.34, 0.62, 0.34, 0xff8c28, 0xffe898, PI, 0, 0);
      DF.ekle(G.sil, 0, 0.56, 0, 0.42, 0.045, 0.42, 0xc84828, 0xffb848);
      DF.ekle(G.sil, 0, 0.28, 0, 0.38, 0.03, 0.38, 0xd85828, 0xffcc58);
      DF.ekle(G.sil, 0, -0.04, 0, 0.24, 0.06, 0.24, 0x7c2620, 0xa83830);
      DF.ekle(G.silA3, 0, -0.14, 0, 0.015, 0.14, 0.015, 0xb83828, 0xffa838);
      DF.ekle(G.kureC, 0, -0.22, 0, 0.04, 0.055, 0.04, 0xe84828, 0xffc848);
      DF.ekle(G.kureK, 0, 0.06, 0, 0.11, 0.14, 0.11, 0xffd860, 0xffffe0);
      DF.ekle(G.kureC, 0, 0.08, 0, 0.065, 0.085, 0.065, 0xfffff0, 0xffffff);
      const dfMat = dyMalz(false, false, 0, { emissive: 0xff9838, emissiveIntensity: 1.5, roughness: 0.45 });
      dy.dilekFener = new T.InstancedMesh(DF.geo(), dfMat, 8);
      dy.dilekFener.frustumCulled = false;
      gr.add(dy.dilekFener);
    }
    dy._hlPos = hlPos; dy._hlUv = hlUv;
  }

  // ── 7 · En önde koyu çimen silueti (MeshStandardMaterial) ──
  {
    // Ön planda yuvarlak tombul çalılar, uzun ot yaprakları ve iri çiçekler (dikey ekranda boş toprak görünmesin)
    const S = dyYapi();
    const koyu = (c) => dyKarH(c, B.siluet[1], 0.35);
    for (let i = 0; i < 54; i++) {
      const x = ara(-40, Math.max(120, hx + 35)), z = ara(17, 21), r = ara(0.85, 1.5);
      const ac = B.agac[i % B.agac.length];
      S.nc = [x, -0.2, z];
      for (let k = 0; k < 3; k++) {
        const ox = (k - 1) * r * 0.95, rr = r * (k === 1 ? 1.0 : 0.72);
        S.ekle(G.kureU, x + ox, -0.25 + rr * 0.35, z + (k === 1 ? 0 : 0.3), rr * 1.25, rr, rr * 0.8, koyu(ac[0]), dyKarH(ac[1], B.siluet[1], 0.15), 0, 0, 0, 0.12);
      }
      S.nc = null;
      for (let k = 0; k < 6; k++) {
        const u = (k / 5) * 2 - 1;
        S.ekle(G.bicak, x + u * r * 1.8, -0.1, z + 0.5, r * 0.5, r * ara(1.2, 1.9), 1, koyu(B.cimen[0]), B.cimen[1], 0, 0, -u * 0.35, 0.6);
      }
      if (i % 2 === 0) {
        const fc = B.cicek[i % B.cicek.length], fx = x + ara(-0.6, 0.6) * r, fy = r * 1.15;
        for (let p = 0; p < 5; p++) { const a = p / 5 * Math.PI * 2; S.ekle(G.kureK, fx + Math.cos(a) * 0.17 * r, fy + Math.sin(a) * 0.17 * r, z + 0.75, 0.13 * r, 0.13 * r, 0.06, fc[0], fc[1], 0, 0, 0, -0.1); }
        S.ekle(G.kureK, fx, fy, z + 0.8, 0.09 * r, 0.09 * r, 0.06, 0xffc830, 0xfff088, 0, 0, 0, -0.1);
      }
    }
    gr.add(new T.Mesh(S.geo(), dyMalz(true, false, 0.3, { roughness: 0.9, emissive: B.siluet[0], emissiveIntensity: B.gece ? 0.6 : 0.35 })));
  }

  // ── 8 · Masalsı çiçekli kemerli yaprak salıncağı (sapan) ──
  {
    const S = dyYapi(), A = dyYapi(), FL = dyYapi();
    const sapanX = (bolum && bolum.sapanSol) ? Math.abs(bolum.sapanSol.x) : 1.6;
    const fPos = dy._hlPos || [], fUv = dy._hlUv || [];
    delete dy._hlPos; delete dy._hlUv;
    const fQuad = (cx, cy, cz, w, h) => {
      fPos.push(cx - w, cy - h, cz, cx + w, cy - h, cz, cx + w, cy + h, cz, cx - w, cy - h, cz, cx + w, cy + h, cz, cx - w, cy + h, cz);
      fUv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
    };
    const fQuadZ = (cx, cy, cz, rx, rz) => {
      fPos.push(cx - rx, cy, cz + rz, cx + rx, cy, cz + rz, cx + rx, cy, cz - rz, cx - rx, cy, cz + rz, cx + rx, cy, cz - rz, cx - rx, cy, cz - rz);
      fUv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
    };

    for (const q of [-1, 1]) {
      const tx = q * sapanX, z = -0.15;
      // Budaklı masal ağacı gövdesi
      const egri = new T.CatmullRomCurve3([
        new T.Vector3(tx + q * 0.82, 0, z),
        new T.Vector3(tx + q * 0.56, 1.25, z + 0.05),
        new T.Vector3(tx + q * 0.12, 2.55, z - 0.04),
        new T.Vector3(tx + q * 0.34, 3.72, z + 0.03),
        new T.Vector3(tx, 4.78, z)
      ]);
      const tg = new T.TubeGeometry(egri, 30, 1, 12, false), tp = tg.attributes.position, mc = new T.Vector3();
      for (let i = 0; i < tp.count; i++) {
        const j = Math.floor(i / 13), u = j / 30; egri.getPointAt(u, mc);
        const budak = 0.04 * Math.sin(u * 26);
        const r = 0.38 - 0.13 * u + 0.42 * Math.pow(Math.max(0, 1 - u * 4.5), 2) + budak;
        tp.setXYZ(i, mc.x + (tp.getX(i) - mc.x) * r, mc.y + (tp.getY(i) - mc.y) * r, mc.z + (tp.getZ(i) - mc.z) * r);
      }
      S.ekle(tg, 0, 0, 0, 1, 1, 1, 0x7c4628, 0xc88850); tg.dispose();

      // Ağaç budakları + zengin kabuk/ton katmanları
      const kabukTon = [[0x4e2918, 0x8a4e2c], [0x683820, 0xb27042], [0x5c311a, 0x9c5e36]];
      for (let b = 0; b < 11; b++) {
        const u = 0.08 + b * 0.078, pt = egri.getPointAt(u);
        const r = 0.36 - 0.12 * u + 0.32 * Math.pow(Math.max(0, 1 - u * 4.5), 2);
        const a = b * 1.45 + (q > 0 ? 0.6 : -0.6), kt = kabukTon[b % kabukTon.length];
        S.ekle(G.kureO, pt.x + Math.cos(a) * r * 0.88, pt.y, pt.z + Math.sin(a) * r * 0.88, 0.085, 0.24, 0.065, kt[0], kt[1], 0, -a, 0.08);
      }
      for (const u of [0.28, 0.54, 0.78]) {
        const pt = egri.getPointAt(u);
        S.ekle(G.kureO, pt.x + q * 0.18, pt.y, pt.z + 0.12, 0.16, 0.22, 0.14, 0x6e3e24, 0xa86c40, 0, 0, -q * 0.3);
        S.ekle(G.kureK, pt.x + q * 0.08, pt.y - 0.06, pt.z + 0.2, 0.12, 0.08, 0.09, 0x428838, 0x86cc54);
      }

      // Yosunlu & çiçekli yayılan kökler
      for (let r = 0; r < 4; r++) {
        const ra = (r - 1.5) * 0.65 + (q > 0 ? 0.15 : -0.15);
        const kx0 = tx + q * 0.82, rx = kx0 + Math.cos(ra) * q * 0.85, rz = z + Math.sin(ra) * 0.65;
        const kegri = new T.CatmullRomCurve3([
          new T.Vector3(kx0, 0.35, z),
          new T.Vector3((kx0 + rx) * 0.5, 0.22, (z + rz) * 0.5),
          new T.Vector3(rx, 0.04, rz)
        ]);
        const ktg = new T.TubeGeometry(kegri, 10, 0.14, 7, false);
        S.ekle(ktg, 0, 0, 0, 1, 0.72, 1, 0x5c3a24, 0x8a5c3a); ktg.dispose();
        // Kök yosunları ve minik kök çiçekleri
        S.ekle(G.kureO, (kx0 + rx) * 0.52, 0.24, (z + rz) * 0.52 + 0.05, 0.28, 0.13, 0.22, 0x428838, 0x8ad054);
        if (r % 2 === 0) {
          const fc = B.cicek[r % B.cicek.length];
          for (let p = 0; p < 5; p++) {
            const pa = p / 5 * PI * 2;
            S.ekle(G.kureK, rx * 0.7 + kx0 * 0.3 + Math.cos(pa) * 0.08, 0.24 + Math.sin(pa) * 0.08, rz * 0.7 + z * 0.3 + 0.14, 0.06, 0.06, 0.04, fc[0], fc[1]);
          }
          S.ekle(G.kureK, rx * 0.7 + kx0 * 0.3, 0.24, rz * 0.7 + z * 0.3 + 0.16, 0.045, 0.045, 0.04, 0xffd040, 0xffe880);
        }
      }

      // Gövdeye sarılan sarmaşık yaprakları ve çiçekler
      for (let k = 0; k < 14; k++) {
        const u = 0.1 + k * 0.06, pt = egri.getPointAt(u), a = k * 1.85 + (q > 0 ? 1 : 0), rr = 0.36 - 0.12 * u + 0.06;
        const x = pt.x + Math.cos(a) * rr, zz = pt.z + Math.sin(a) * rr; if (zz < z - 0.12) continue;
        S.ekle(G.kureK, x, pt.y, zz, 0.16, 0.09, 0.08, B.cimen[0], B.cimen[1], 0, 0, a);
        if (k % 3 === 1) {
          const fc = B.cicek[k % B.cicek.length];
          S.ekle(G.kureK, x, pt.y + 0.08, zz + 0.05, 0.1, 0.1, 0.06, fc[0], fc[1]);
        }
      }

      // Üst bağlantı noktasında altın/pirinç halka ve bilezik
      S.ekle(G.sil, tx, 4.65, z, 0.3, 0.18, 0.3, 0x9c6e1c, 0xe8bd52);
      S.ekle(G.torusHalka, tx, 4.58, z + 0.04, 0.82, 0.82, 0.82, 0xb88620, 0xffe478, 0, 0, 0);
      S.ekle(G.kure, tx, 4.74, z, 0.32, 0.14, 0.32, 0xc88a50, 0xe2a870);

      // Yana uzanan dal + sarkan sıcak küçük fener
      const fx = tx + q * 0.96, fy = 4.22, fz = z + 0.16;
      S.ekle(G.sil, tx + q * 0.48, 4.88, z + 0.06, 0.11, 1.05, 0.11, 0x7c4628, 0xb87a48, 0, 0, -q * 1.38);
      S.ekle(G.sil, fx, 4.58, fz, 0.025, 0.56, 0.025, 0xb88620, 0xffd460, 0, 0, 0, -0.04);
      S.ekle(G.koni, fx, fy + 0.24, fz, 0.18, 0.15, 0.18, 0x8c5c18, 0xd8a840, 0, 0, 0, -0.08);
      S.ekle(G.sil, fx, fy - 0.22, fz, 0.13, 0.06, 0.13, 0x8c5c18, 0xd8a840, 0, 0, 0, -0.08);
      FL.ekle(G.kure, fx, fy, fz, 0.17, 0.22, 0.17, 0xff9e2c, 0xfff4b0, 0, 0, 0, -0.08);
      fQuad(fx, fy, fz + 0.14, 0.95, 0.95);
      fQuad(fx, fy, fz + 0.12, 1.85, 1.85);
      const yZemin = Math.max(0.06, yerY(fx, fz) + 0.06);
      fQuadZ(fx, yZemin, fz, 2.35, 1.65);
      fQuadZ(fx, yZemin + 0.01, fz, 1.15, 0.85);

      // Üst taç yaprakları
      A.nc = [tx + q * 0.75, 5.65, z - 0.1];
      const ts = [[0.8, 5.55, 1.15], [1.6, 5.1, 0.85], [0.15, 6.05, 0.82], [1.35, 6.2, 0.8], [0.75, 6.55, 0.7], [-0.25, 5.35, 0.6]];
      for (const [ddx, y, r] of ts) A.ekle(G.kureO, tx + q * ddx, y, z - 0.45, r * 1.1, r, r, B.agac[0][0], B.agac[0][1], 0, 0, 0, 0.22);
      A.nc = null;
    }

    // Üstte iki sütunu birleştiren çiçekli kemer + çiçek çelenkleri
    {
      const z = -0.15;
      const kemerEgri = new T.CatmullRomCurve3([
        new T.Vector3(-sapanX, 4.74, z),
        new T.Vector3(-sapanX * 0.55, 5.72, z),
        new T.Vector3(0, 6.08, z),
        new T.Vector3(sapanX * 0.55, 5.72, z),
        new T.Vector3(sapanX, 4.74, z)
      ]);
      const ktg = new T.TubeGeometry(kemerEgri, 28, 0.16, 8, false);
      S.ekle(ktg, 0, 0, 0, 1, 1, 1, 0x7c4628, 0xb87846); ktg.dispose();

      // Kemer boyunca yaprak taçları ve çiçekler
      for (let i = 0; i <= 14; i++) {
        const u = i / 14, pt = kemerEgri.getPointAt(u);
        const r = 0.52 + 0.22 * Math.sin(u * PI);
        A.ekle(G.kureO, pt.x, pt.y + 0.15, z - 0.18, r * 1.15, r * 0.85, r * 0.85, B.agac[i % B.agac.length][0], B.agac[i % B.agac.length][1], 0, 0, 0, 0.18);
        if (i % 2 === 0) {
          const fc = B.cicek[i % B.cicek.length];
          for (let p = 0; p < 5; p++) {
            const pa = p / 5 * PI * 2;
            S.ekle(G.kureK, pt.x + Math.cos(pa) * 0.11, pt.y + 0.14 + Math.sin(pa) * 0.11, z + 0.28, 0.08, 0.08, 0.05, fc[0], fc[1], 0, 0, 0, 0.16);
          }
          S.ekle(G.kureK, pt.x, pt.y + 0.14, z + 0.32, 0.06, 0.06, 0.04, 0xffd040, 0xffe880, 0, 0, 0, 0.16);
        }
      }

      // Kemer altından sarkan zarif çiçek çelenkleri ve minik çan damlaları
      for (const [cx0, cx1, cy] of [[-sapanX * 0.85, 0, 5.28], [0, sapanX * 0.85, 5.28]]) {
        for (let i = 0; i <= 8; i++) {
          const u = i / 8, gx = cx0 + (cx1 - cx0) * u, gy = cy + Math.cos((u - 0.5) * PI) * -0.45 + 0.35;
          const fc = B.cicek[(i + 1) % B.cicek.length];
          S.ekle(G.kureK, gx, gy, z + 0.24, 0.09, 0.07, 0.06, B.cimen[0], B.cimen[1], 0, 0, 0, 0.14);
          if (i % 2 === 1) S.ekle(G.kureK, gx, gy - 0.06, z + 0.28, 0.085, 0.085, 0.05, fc[0], fc[1], 0, 0, 0, 0.14);
          if (i === 4) {
            S.ekle(G.silA3, gx, gy - 0.13, z + 0.28, 0.012, 0.12, 0.012, 0xb88620, 0xffe070, 0, 0, 0, 0.14);
            FL.ekle(G.kureC, gx, gy - 0.21, z + 0.28, 0.055, 0.07, 0.055, 0xffd260, 0xffffe8, 0, 0, 0, 0.14);
            fQuad(gx, gy - 0.21, z + 0.31, 0.36, 0.36);
          }
        }
      }

      // Kemerin tam ortasından sarkan minik çiçekli taç süsü
      {
        const tx = 0, ty = 5.46, tz = z + 0.14;
        S.ekle(G.sil, tx, 5.76, tz, 0.018, 0.58, 0.018, 0xb88620, 0xffe070, 0, 0, 0, -0.04);
        S.ekle(G.torusHalka, tx, ty, tz, 0.56, 0.56, 0.56, 0xb88620, 0xffe478, 0, 0, 0, -0.08);
        for (let k = 0; k < 6; k++) {
          const a = k / 6 * PI * 2, rx = tx + Math.cos(a) * 0.19, ry = ty + Math.sin(a) * 0.19;
          const fc = B.cicek[k % B.cicek.length];
          A.ekle(G.kureK, rx, ry, tz - 0.02, 0.09, 0.065, 0.05, B.agac[0][0], B.agac[0][1], 0, 0, a, -0.08);
          if (k % 2 === 0) S.ekle(G.kureK, rx, ry, tz + 0.04, 0.065, 0.065, 0.045, fc[0], fc[1], 0, 0, 0, -0.08);
        }
        S.ekle(G.sil, tx, ty - 0.28, tz, 0.014, 0.22, 0.014, 0x48903c, 0x86cc54, 0, 0, 0, -0.08);
        FL.ekle(G.kureK, tx, ty - 0.4, tz + 0.02, 0.058, 0.078, 0.055, 0xffc848, 0xfff8c8, 0, 0, 0, -0.08);
        fQuad(tx, ty - 0.4, tz + 0.05, 0.45, 0.45);
      }
    }

    // Kuş yuvası + mavi kuş + sol tarafta minik arkadaş kuş
    {
      const nx = sapanX + 0.75, ny = 5.15, nz = 0.42;
      S.ekle(G.torusYuva, nx, ny, nz, 1, 0.55, 1, 0x7a5232, 0xa8784a, PI / 2, 0, 0);
      S.ekle(G.kure, nx, ny - 0.05, nz, 0.3, 0.14, 0.3, 0x6a4628, 0x8a5c3a);
      S.ekle(G.kure, nx - 0.02, ny + 0.17, nz + 0.05, 0.19, 0.17, 0.17, 0x6aa8e8, 0x9ad0ff, 0, 0, 0, -0.05);
      S.ekle(G.kure, nx + 0.12, ny + 0.36, nz + 0.07, 0.13, 0.13, 0.13, 0x7ab8f0, 0xa8d8ff, 0, 0, 0, -0.05);
      S.ekle(G.koni, nx + 0.27, ny + 0.35, nz + 0.07, 0.05, 0.1, 0.05, 0xffa830, 0xffc050, 0, 0, -PI / 2, -0.05);
      S.ekle(G.kureK, nx + 0.17, ny + 0.4, nz + 0.17, 0.03, 0.035, 0.02, 0x2a2030, 0x2a2030, 0, 0, 0, -0.05);
      // Sol dalda minik şeftali-pembe kuş
      const bx = -sapanX - 0.48, by = 4.98, bz = 0.22;
      S.ekle(G.kureK, bx, by + 0.12, bz, 0.15, 0.13, 0.13, 0xf2889c, 0xffc4d0, 0, 0, 0, -0.05);
      S.ekle(G.kureK, bx - 0.1, by + 0.26, bz + 0.02, 0.1, 0.1, 0.1, 0xff9eb0, 0xffd6e0, 0, 0, 0, -0.05);
      S.ekle(G.koni, bx - 0.21, by + 0.25, bz + 0.02, 0.04, 0.08, 0.04, 0xffa830, 0xffc050, 0, 0, PI / 2, -0.05);
      S.ekle(G.kureC, bx - 0.14, by + 0.29, bz + 0.09, 0.024, 0.028, 0.02, 0x2a2030, 0x2a2030, 0, 0, 0, -0.05);
    }
    const amMesh = new T.Mesh(A.geo(), dyMalz(true, true, 0.6, { emissive: 0x16220a })); amMesh.castShadow = true; amMesh.receiveShadow = true; gr.add(amMesh);
    dy.salTac = amMesh; dy.salT = 9;
    const sapanMesh = new T.Mesh(S.geo(), dyMalz(true)); sapanMesh.castShadow = true; sapanMesh.receiveShadow = true; gr.add(sapanMesh);
    gr.add(new T.Mesh(FL.geo(), dyMalz(false, false, 0, { emissive: 0xffc860, emissiveIntensity: B.gece ? 1.35 : 0.95 })));
    const fhg = new T.BufferGeometry(); fhg.setAttribute('position', new T.Float32BufferAttribute(fPos, 3)); fhg.setAttribute('uv', new T.Float32BufferAttribute(fUv, 2));
    const fhm = new T.ShaderMaterial({
      transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, fog: false, uniforms: { uT: dy.U.uT, uGece: dy.U.uGece },
      vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying vec2 vU; uniform float uT; uniform float uGece; void main(){ float d = length(vU - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), 2.1) * (0.84 + 0.10 * sin(uT * 2.6) + 0.06 * sin(uT * 6.3)); float g = mix(0.45, 0.82, uGece); gl_FragColor = vec4(vec3(1.0, 0.77, 0.37) * a * g, 1.0); }'
    });
    const fhl = new T.Mesh(fhg, fhm); fhl.renderOrder = 2; gr.add(fhl);

    // Örgü/kurdele dokulu altın-ipek bantlar
    const bm = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.34, metalness: 0.28, emissive: 0x382406, emissiveIntensity: 0.32 });
    dy.bantA = new T.Mesh(G.bant, bm); dy.bantB = new T.Mesh(G.bant, bm); gr.add(dy.bantA, dy.bantB);

    // Kenarı kıvrımlı, yastıklı, damarları zarif işlenmiş, altın-zümrüt yaprak hamak koltuğu + uçlarda çiçek tokaları
    const K = dyYapi();
    K.ekle(G.kure, 0, -0.02, 0, 1.08, 0.28, 0.64, 0x1a6838, 0xd8b842);
    K.ekle(G.kure, 0, 0.08, 0, 1.0, 0.16, 0.56, 0x2e8e46, 0xe8d060);
    // Kıvrımlı yaprak kenarı
    for (const qz of [-1, 1]) {
      for (let i = -3; i <= 3; i++) {
        const x = i * 0.28, zz = qz * (0.56 * Math.sqrt(Math.max(0.08, 1 - (x / 1.08) ** 2)));
        K.ekle(G.kureO, x, 0.13, zz, 0.2, 0.075, 0.09, 0x62b844, 0xf2dc68, qz * 0.35, 0, -i * 0.08);
      }
    }
    // Yastıklı hamak minderi + orta düğme + çiy damlaları
    K.ekle(G.kure, 0, 0.16, 0, 0.74, 0.13, 0.42, 0xf4dca0, 0xfff6dc);
    K.ekle(G.kure, -0.3, 0.17, 0, 0.26, 0.12, 0.36, 0xffe6b0, 0xfff8e6);
    K.ekle(G.kure, 0.3, 0.17, 0, 0.26, 0.12, 0.36, 0xffe6b0, 0xfff8e6);
    K.ekle(G.kureC, 0, 0.28, 0.02, 0.07, 0.035, 0.07, 0xd8a830, 0xfff0a0);
    K.ekle(G.kureC, -0.52, 0.18, 0.42, 0.042, 0.038, 0.042, 0xa8f0ff, 0xffffff);
    K.ekle(G.kureC, 0.48, 0.18, 0.43, 0.038, 0.035, 0.038, 0xa8f0ff, 0xffffff);
    // Zarif yaprak damarları
    K.ekle(G.sil, 0, 0.24, 0.02, 0.032, 1.92, 0.032, 0x76c848, 0xf2de78, 0, 0, PI / 2);
    for (const q of [-1, 1]) for (let k = 0; k < 4; k++) {
      const x = q * (0.18 + k * 0.22), zz = 0.54 * Math.sqrt(Math.max(0.04, 1 - (x / 1.08) ** 2)) + 0.02;
      K.ekle(G.sil, x, 0.15, zz, 0.016, 0.28 - k * 0.04, 0.016, 0x68bc42, 0xe8d068, 0, 0, -q * 0.9);
    }
    // İki uçta sivri yaprak ucu, altın sargı ve çiçek tokaları
    for (const q of [-1, 1]) {
      const tx = q * 1.04, ty = 0.11;
      K.ekle(G.koni4, q * 1.18, 0.1, 0, 0.13, 0.28, 0.16, 0x268240, 0xd8c848, 0, 0, -q * PI / 2);
      K.ekle(G.sil, q * 0.93, 0.1, 0, 0.11, 0.08, 0.18, 0xb88620, 0xffe478, 0, 0, PI / 2);
      K.ekle(G.kure, tx, ty, 0, 0.12, 0.12, 0.12, 0xc89024, 0xffe478);
      for (let p = 0; p < 5; p++) {
        const pa = p / 5 * PI * 2;
        K.ekle(G.kureK, tx + Math.cos(pa) * 0.08, ty + Math.sin(pa) * 0.08, 0.1, 0.065, 0.065, 0.04, 0xff9ec8, 0xfff0f8);
      }
      K.ekle(G.kureK, tx, ty, 0.13, 0.05, 0.05, 0.04, 0xffc830, 0xfff088);
    }
    // Hamak kesesinin altında zarif yaprak püskülü
    K.ekle(G.kure, 0, -0.15, 0, 0.09, 0.07, 0.09, 0xc89024, 0xffe478);
    for (let i = -2; i <= 2; i++) {
      const px = i * 0.065, len = 0.24 - Math.abs(i) * 0.035;
      K.ekle(G.sil, px * 0.65, -0.18 - len * 0.45, 0.02, 0.016, len, 0.016, 0x2a7c42, 0xe8d060, 0, 0, i * 0.22);
      K.ekle(G.kureO, px, -0.18 - len * 0.9, 0.03, 0.048, 0.085, 0.028, 0x268240, 0x88dc5c, 0, 0, i * 0.22);
    }
    dy.kese = new T.Mesh(K.geo(), new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.02, emissive: 0x102004 }));
    dy.kese.castShadow = true; dy.kese.receiveShadow = true; dy.kese.userData.k = 1.3; gr.add(dy.kese);
    dy.kx = 0; dy.ky = 2.75; dy.kvx = 0; dy.kvy = 0; dy.kAci = 0;
  }

  // ── 9 · Dinamik Zıplatan Mantarlar (`bolum.mantarlar`) ──
  {
    const mRenkler = bNo === 2 ? [[0xc92f2a, 0xff6a4a], [0xc83088, 0xff78b8], [0x7c38d8, 0xb884ff], [0x209898, 0x60e0d0]] : [[0xc92f2a, 0xff6a4a]];
    for (let idx = 0; idx < mantarList.length; idx++) {
      const M = mantarList[idx]; if (!M) continue;
      const sc = (M.r || 1.6) / 1.6, baseY = Math.max(0, (M.y != null ? M.y : 1.9) - 1.9 * sc), mr = mRenkler[idx % mRenkler.length];
      const S = dyYapi();
      // Tombul gövde + sevimli yanaklar ve gülümseme
      S.ekle(G.kule, 0, 0.95, 0, 0.62, 1.9, 0.62, 0xe6d6bc, 0xfff8ea);
      for (const q of [-1, 1]) S.ekle(G.kure, q * 0.4, 0.92, 0.5, 0.13, 0.08, 0.05, 0xff9ab8, 0xffb0c8);
      for (let k = 0; k < 9; k++) { const a = (k - 4) * 0.24; S.ekle(G.kure, Math.sin(a) * 0.26, 0.9 - Math.cos(a) * 0.13 + 0.02, 0.645, 0.05, 0.045, 0.03, 0x5a2a30, 0x5a2a30); }
      // Gövde boynunda fırfırlı krem mantar yakası
      for (let k = 0; k < 10; k++) {
        const a = k / 10 * PI * 2;
        S.ekle(G.kureK, Math.cos(a) * 0.58, 1.48, Math.sin(a) * 0.58, 0.2, 0.11, 0.2, 0xe8d6b8, 0xfff8ec);
      }
      // Şapka altı lameller ve kıvrımlı kenar halkası
      S.ekle(G.kure, 0, 1.74, 0, 1.56, 0.24, 1.56, 0xf2dfc4, 0xfff2de);
      for (let k = 0; k < 14; k++) {
        const a = k / 14 * PI * 2;
        S.ekle(G.kureK, Math.cos(a) * 1.05, 1.66, Math.sin(a) * 1.05, 0.06, 0.06, 0.56, 0xe6caa4, 0xfff0d8, 0, -a + PI / 2, 0);
      }
      S.ekle(G.torusHalka, 0, 1.67, 0, 4.95, 4.95, 1.15, 0xfff0d4, 0xffffff, PI / 2, 0, 0);
      // Benekli kubbe şapka
      S.ekle(G.kubbe, 0, 1.75, 0, 1.75, 1.75, 1.75, mr[0], mr[1]);
      // Kubbenin önüne yayılmış yassı, iri beyaz benekler (az: yatay açı, p: tepeden açı)
      const ben = [
        [0, 0.12, 0.42], [0.05, 0.72, 0.38], [-0.75, 0.62, 0.32], [0.8, 0.58, 0.33], [-0.35, 1.18, 0.3],
        [0.42, 1.2, 0.3], [-1.25, 1.05, 0.28], [1.3, 1.02, 0.28], [0, 1.42, 0.22], [-0.9, 1.4, 0.2], [0.95, 1.38, 0.2], [2.4, 0.7, 0.3], [-2.4, 0.75, 0.3]
      ];
      for (const [az, p, r] of ben) {
        const sx = Math.sin(p) * Math.sin(az), sy = Math.cos(p), sz = Math.sin(p) * Math.cos(az);
        S.ekle(G.kure, sx * 1.72, 1.75 + sy * 1.72, sz * 1.72, r, r * 0.32, r, 0xfff6ea, 0xffffff, 0, az - PI / 2, -p);
      }
      // Taban çim halkası + minik çiçekler + yavru mantar
      for (let k = 0; k < 8; k++) {
        const a = k / 8 * PI * 2 + 0.2;
        S.ekle(G.kureK, Math.cos(a) * 0.74, 0.11, Math.sin(a) * 0.74, 0.24, 0.15, 0.2, B.cimen[0], B.cimen[1]);
      }
      for (let k = 0; k < 3; k++) {
        const a = (k - 1) * 0.75 + 0.2, fc = B.cicek[k % B.cicek.length];
        S.ekle(G.kureK, Math.sin(a) * 0.86, 0.24, Math.cos(a) * 0.76, 0.1, 0.09, 0.09, fc[0], fc[1]);
      }
      S.ekle(G.kule, 0.94, 0.2, 0.36, 0.11, 0.38, 0.11, 0xe8d8c0, 0xfff8ea);
      S.ekle(G.kubbe, 0.94, 0.34, 0.36, 0.26, 0.24, 0.26, mr[0], mr[1]);
      S.ekle(G.kureK, 0.94, 0.52, 0.48, 0.05, 0.04, 0.04, 0xfffaf2, 0xffffff);

      const mm = dyMalz(true, true, 0.55, { roughness: 0.4, emissive: B.gece ? 0x5a2a24 : 0x3c1c14 });
      const mesh = new T.Mesh(S.geo(), mm); mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.position.set(M.x, baseY, -1.2); mesh.scale.setScalar(sc); gr.add(mesh);
      const E = dyYapi();
      for (const q of [-1, 1]) { E.ekle(G.kure, q * 0.25, 0, 0, 0.13, 0.18, 0.05, 0x2a1a24, 0x3a2430); E.ekle(G.kureK, q * 0.25 - 0.04, 0.07, 0.05, 0.05, 0.05, 0.02, 0xffffff, 0xffffff); }
      const goz = new T.Mesh(E.geo(), dyMalz(false, true, 0, { emissive: 0xffffff, emissiveIntensity: 0.4 }));
      goz.position.set(0, 1.17, 0.61); mesh.add(goz);
      dy.mantarlar.push({ mesh, goz, x: M.x, y: M.y != null ? M.y : 1.9, sc, t: 9, kirp: 2.0 + idx * 1.1, sik: 0 });
    }
  }

  // ── 9b · Bilbo'nun önündeki alçak tombul çalı (katmanlı, yapraklı ve çiçekli) ──
  {
    const C = caliBilgi, S = dyYapi(); S.nc = [0, 0.2, 0.3];
    const cAlt = B.agac[0][0], cOrta = B.agac[0][1], cUst = B.agac[1][1];
    for (const [x, y, z, rx, ry, r1, r2] of [
      [0, 0.6, 0, 0.88, 0.86, cAlt, cOrta],
      [-0.64, 0.42, 0.14, 0.56, 0.54, cAlt, cOrta],
      [0.66, 0.42, 0.14, 0.54, 0.54, cAlt, cOrta],
      [-0.32, 0.38, 0.48, 0.58, 0.44, cAlt, cUst],
      [0.36, 0.36, 0.48, 0.56, 0.44, cAlt, cUst],
      [-0.22, 0.94, 0.12, 0.52, 0.48, cOrta, cUst],
      [0.28, 0.9, 0.16, 0.48, 0.46, cOrta, cUst],
      [0, 0.68, 0.42, 0.46, 0.42, cOrta, cUst]
    ]) S.ekle(G.kureO, x, y, z, rx * 1.08, ry, rx * 0.84, r1, r2);
    S.nc = null;
    // Kenar yaprakçıkları ve minik meyveler
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * PI - 0.15;
      S.ekle(G.kureK, Math.cos(a) * 1.02, 0.28 + Math.sin(a) * 0.55, 0.32, 0.16, 0.1, 0.1, B.cimen[0], B.cimen[1], 0, 0, a - PI / 2);
    }
    for (const [x, y, z, c1, c2] of [[-0.45, 1.25, 0.55, 0xfff4f4, 0xffffff], [0.3, 1.34, 0.52, 0xff8ab8, 0xffb8d6], [0.85, 0.82, 0.58, 0xffd040, 0xffe880], [-0.92, 0.74, 0.54, 0xff8ab8, 0xffb8d6], [0.05, 0.95, 0.82, 0xfff4f4, 0xffffff], [-0.52, 0.52, 0.8, 0xffd040, 0xffe880]]) {
      for (let k = 0; k < 5; k++) { const a = k / 5 * PI * 2; S.ekle(G.kureC, x + Math.cos(a) * 0.09, y + Math.sin(a) * 0.09, z, 0.075, 0.075, 0.04, c1, c2); }
      S.ekle(G.kureK, x, y, z + 0.04, 0.055, 0.055, 0.04, 0xffb020, 0xffe060);
    }
    for (const [bx, by, bz] of [[-0.2, 0.62, 0.78], [0.46, 0.58, 0.76], [0.12, 1.18, 0.52], [-0.62, 0.96, 0.45]]) {
      S.ekle(G.kureK, bx, by, bz, 0.06, 0.06, 0.05, 0xe84858, 0xff8898);
    }
    const cm = dyMalz(true, true, 0.25, { emissive: 0x0a1404 });
    dy.cali = new T.Mesh(S.geo(), cm); dy.cali.castShadow = true; dy.cali.receiveShadow = true; dy.cali.position.set(C.x, C.y - 0.55, -0.1); gr.add(dy.cali); dy.caliT = 9;
  }

  // ── 10 · Dinamik Sektiren Gülen Bulutlar (`bolum.bulutlar`) ──
  {
    const pamuk = bNo === 4 || bNo === 15;
    const cAlt = pamuk ? 0xffa4cc : 0xd4dcff, cUst = pamuk ? 0xfff6fb : 0xffffff;
    for (let idx = 0; idx < bulutList.length; idx++) {
      const BL = bulutList[idx]; if (!BL) continue;
      const sc = (BL.r || 2.2) / 2.2, S = dyYapi();
      const p = [[0, 0.1, 1.55], [-1.35, -0.25, 1.15], [1.35, -0.2, 1.2], [-0.7, 0.75, 1.05], [0.75, 0.7, 1.1], [-2.1, -0.55, 0.75], [2.1, -0.5, 0.8]];
      for (const [x, y, r] of p) S.ekle(G.kure, x, y, 0, r * 1.05, r, r * 0.9, cAlt, cUst);
      for (const q of [-1, 1]) S.ekle(G.kure, q * 0.9, -0.12, 1.23, 0.31, 0.19, 0.1, 0xff5292, 0xff86b8);
      for (let k = 0; k < 7; k++) { const a = (k - 3) * 0.22; S.ekle(G.kure, Math.sin(a) * 0.4, -0.12 - Math.cos(a) * 0.24 + 0.22 - 0.25, 1.42, 0.075, 0.065, 0.05, 0x3a2848, 0x3a2848); }
      const bmz = dyMalz(true, true, 0.6, { roughness: 0.88, emissive: pamuk ? 0xa87494 : (B.gece ? 0x8a90c8 : 0xa4a8c8) });
      const mesh = new T.Mesh(S.geo(), bmz); mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.position.set(BL.x, BL.y, -0.3); mesh.scale.setScalar(sc); gr.add(mesh);
      const E = dyYapi();
      for (const q of [-1, 1]) { E.ekle(G.kure, q * 0.48, 0, 0, 0.15, 0.21, 0.08, 0x3a2848, 0x3a2848); E.ekle(G.kureK, q * 0.48 - 0.05, 0.08, 0.07, 0.05, 0.05, 0.03, 0xffffff, 0xffffff); }
      const goz = new T.Mesh(E.geo(), dyMalz(false, true, 0, { emissive: 0x3a2848 }));
      goz.position.set(0, 0.25, 1.35); mesh.add(goz);
      dy.bulutlarList.push({ mesh, goz, x: BL.x, y: BL.y, sc, t: 9, kirp: 3.0 + idx * 0.9, sik: 0 });
    }
  }

  // ── 10b · Dinamik Yüzen Dev Nilüfer Yaprakları (`bolum.niluferler`) ──
  {
    for (let idx = 0; idx < niluferList.length; idx++) {
      const N = niluferList[idx]; if (!N) continue;
      const sc = (N.r || 1.8) / 1.8, ny = N.y != null ? N.y : 0.18;
      const S = dyYapi();
      S.ekle(G.kure, 0, 0, 0, 1.85, 0.16, 1.45, 0x2c8a48, 0x62cc6a);
      S.ekle(G.kure, 0, 0.08, 0, 1.55, 0.08, 1.2, 0x52b85a, 0x8ae286);
      // Yaprak üstü ışınsal damarlar ve su damlacıkları
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * PI * 2 + 0.35;
        S.ekle(G.silA3, Math.cos(a) * 0.65, 0.155, Math.sin(a) * 0.5, 0.016, 1.25, 0.016, 0x6cd86c, 0xc8ff98, PI / 2, 0, -a + PI / 2);
      }
      S.ekle(G.kureC, 0.72, 0.18, 0.32, 0.055, 0.045, 0.055, 0xb8f8ff, 0xffffff);
      S.ekle(G.kureC, 0.35, 0.18, -0.58, 0.042, 0.036, 0.042, 0xb8f8ff, 0xffffff);
      // Pembe-beyaz katmerli nilüfer çiçeği + minik yan gonca
      const cx = -0.68, cy = 0.16, cz = -0.18;
      for (let k = 0; k < 8; k++) {
        const a = k / 8 * PI * 2;
        S.ekle(G.kureO, cx + Math.cos(a) * 0.24, cy + 0.05, cz + Math.sin(a) * 0.2, 0.17, 0.22, 0.1, 0xff7eb0, 0xffcce0, 0, -a, 0.55);
      }
      for (let k = 0; k < 6; k++) {
        const a = (k + 0.5) / 6 * PI * 2;
        S.ekle(G.kureO, cx + Math.cos(a) * 0.14, cy + 0.14, cz + Math.sin(a) * 0.12, 0.13, 0.22, 0.08, 0xffd8ea, 0xffffff, 0, -a, 0.28);
      }
      S.ekle(G.kureK, cx, cy + 0.16, cz, 0.13, 0.14, 0.13, 0xffc830, 0xfff088);
      S.ekle(G.kureK, cx + 0.44, cy + 0.04, cz + 0.36, 0.09, 0.07, 0.09, 0x3aa050, 0x86e068);
      S.ekle(G.kureK, cx + 0.44, cy + 0.13, cz + 0.36, 0.085, 0.14, 0.085, 0xff8ec0, 0xfff0f8);
      // Ön kenarda sevimli yüz: gözler, pembe yanaklar, gülümseme (zıplatan yaprak olduğu belli olsun)
      for (const q of [-1, 1]) {
        S.ekle(G.kure, q * 0.32, 0.17, 1.3, 0.1, 0.13, 0.06, 0x203a24, 0x2a4a2c);
        S.ekle(G.kureK, q * 0.32 - 0.03, 0.22, 1.35, 0.035, 0.035, 0.02, 0xffffff, 0xffffff);
        S.ekle(G.kure, q * 0.6, 0.1, 1.2, 0.12, 0.06, 0.05, 0xff8aa8, 0xffa8c0);
      }
      for (let k = 0; k < 7; k++) { const a = (k - 3) * 0.2; S.ekle(G.kureK, Math.sin(a) * 0.2, 0.08 - Math.cos(a) * 0.06 + 0.04, 1.36, 0.035, 0.03, 0.025, 0x203a24, 0x203a24); }
      const nm = dyMalz(true, true, 0.45, { roughness: 0.48, emissive: 0x184220 });
      const mesh = new T.Mesh(S.geo(), nm); mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.position.set(N.x, ny, 0); mesh.scale.setScalar(sc); mesh.rotation.x = 0.3; gr.add(mesh);

      const rIn = new T.RingGeometry(1.56, 1.65, 32), rOut = new T.RingGeometry(1.88, 1.96, 32);
      const R2 = dyYapi(); R2.ekle(rIn, 0, 0, 0, 1, 1, 1, 0xb8f4ff, 0xe8fbff, -PI / 2); R2.ekle(rOut, 0, 0, 0, 1, 1, 1, 0xb8f4ff, 0xe8fbff, -PI / 2);
      rIn.dispose(); rOut.dispose();
      const rg = R2.geo();
      const rm = new T.MeshStandardMaterial({ color: 0xc8f8ff, roughness: 0.3, transparent: true, opacity: 0.65, emissive: 0x90e8ff, emissiveIntensity: 0.72, side: T.DoubleSide });
      const ripple = new T.Mesh(rg, rm); ripple.position.set(N.x, ny - 0.06, 0); ripple.scale.setScalar(sc); gr.add(ripple);

      dy.niluferler.push({ mesh, ripple, rm, x: N.x, y: ny, sc, t: 9 });
    }
  }

  // ── 10c · Dinamik Dönen Rüzgâr Sütunları (`bolum.ruzgarlar`) ──
  {
    for (let idx = 0; idx < ruzgarList.length; idx++) {
      const RZ = ruzgarList[idx]; if (!RZ) continue;
      const rx = RZ.x, ry = RZ.y != null ? RZ.y : 4.2, h = RZ.h || 7.5, rr = RZ.r || 1.6;
      const S = dyYapi();
      const c1 = bNo === 6 ? 0x9a50f0 : (bNo === 16 || bNo === 9 ? 0xf07a28 : 0x2aa8f4), c2 = bNo === 6 ? 0xe2c4ff : (bNo === 16 || bNo === 9 ? 0xffe0a0 : 0x9ce6ff);
      for (const f of [0, PI]) {
        const pts = [];
        for (let i = 0; i <= 28; i++) {
          const u = i / 28, a = u * PI * 6 + f, rad = rr * (0.42 + 0.58 * u);
          pts.push(new T.Vector3(Math.cos(a) * rad, (u - 0.5) * h, Math.sin(a) * rad));
        }
        const tg = new T.TubeGeometry(new T.CatmullRomCurve3(pts), 28, f === 0 ? 0.17 : 0.1, 6, false);
        S.ekle(tg, 0, 0, 0, 1, 0.96, 1, c1, c2); tg.dispose();
        for (let k = 2; k < 26; k += 4) {
          const p = pts[k];
          if (bNo === 6) S.ekle(G.kureK, p.x, p.y, p.z, 0.11, 0.05, 0.08, 0xd89eff, 0xfff0ff, 0, k, 0.4);
          else S.ekle(G.kureK, p.x, p.y, p.z, 0.09, 0.14, 0.09, 0xb0ecff, 0xffffff, 0, k, 0.25);
        }
      }
      S.ekle(G.halkaInce, 0, -h * 0.44, 0, rr * 0.65, rr * 0.65, 0.55, c1, c2, PI / 2, 0, 0);
      const rm = new T.MeshStandardMaterial({
        vertexColors: true,
        emissive: bNo === 6 ? 0x8a48e0 : (bNo === 16 || bNo === 9 ? 0xd05a10 : 0x1c8ce0),
        emissiveIntensity: 0.55,
        roughness: 0.25,
        transparent: true,
        opacity: 0.72
      });
      const mesh = new T.Mesh(S.geo(), rm);
      mesh.position.set(rx, ry, -0.2);
      gr.add(mesh);
      // Yukarı doğru akan tombul ok başları: rüzgârın yönü bir bakışta belli olsun
      const O = dyYapi(), oAra = h / 4;
      for (let k = 0; k < 4; k++) {
        const oy = -h * 0.5 + oAra * (k + 0.5);
        for (const q of [-1, 1]) {
          O.ekle(G.sil, q * 0.38, oy, 0, 0.2, 1.05, 0.2, 0xffffff, 0xffffff, 0, 0, q * 0.85);
          O.ekle(G.kureK, q * 0.76, oy - 0.36, 0, 0.2, 0.2, 0.2, 0xffffff, 0xffffff);
        }
        O.ekle(G.kureK, 0, oy + 0.38, 0, 0.22, 0.22, 0.22, 0xffffff, 0xffffff);
      }
      const om = new T.MeshBasicMaterial({ color: bNo === 6 ? 0xf4e4ff : 0xeefcff, transparent: true, opacity: 0.85, depthWrite: false, fog: false });
      const ok = new T.Mesh(O.geo(), om); ok.position.set(rx, ry, 0.35); ok.renderOrder = 2; gr.add(ok);
      dy.ruzgarlar.push({ mesh, ok, okAra: oAra, h, rm, x: rx, y: ry, faz: idx * 1.4, t: 9 });
    }
  }

  // ── 10d · Dinamik Havada Çiçekli Halkalar (`bolum.halkalar`) ──
  {
    for (let idx = 0; idx < halkaList.length; idx++) {
      const HK = halkaList[idx]; if (!HK) continue;
      const sc = (HK.r || 1.9) / 1.0;
      const S = dyYapi();
      S.ekle(G.halka, 0, 0, 0, 1, 1, 1, 0xf0b21a, 0xfff6a8);
      S.ekle(G.halkaInce, 0, 0, 0.12, 1.06, 1.06, 1, 0xffe048, 0xfffcc8);
      S.ekle(G.halkaInce, 0, 0, -0.12, 0.94, 0.94, 1, 0xd4961c, 0xffe478);
      for (let k = 0; k < 8; k++) {
        const a = k / 8 * PI * 2, cx = Math.cos(a) * 1.02, cy = Math.sin(a) * 1.02;
        const rk = B.cicek[k % B.cicek.length];
        for (let p = 0; p < 5; p++) {
          const pa = p / 5 * PI * 2;
          S.ekle(G.kureK, cx + Math.cos(pa) * 0.11, cy + Math.sin(pa) * 0.11, 0.15, 0.085, 0.085, 0.05, rk[0], rk[1]);
        }
        S.ekle(G.kureK, cx, cy, 0.18, 0.06, 0.06, 0.05, 0xffd030, 0xfff288);
        S.ekle(G.kureK, cx + Math.cos(a + 0.28) * 0.14, cy + Math.sin(a + 0.28) * 0.14, -0.06, 0.12, 0.075, 0.06, 0x4eb848, 0x98e67a, 0, 0, a);
      }
      const hm = dyMalz(true, true, 0.7, { roughness: 0.25, metalness: 0.25, emissive: 0xd89418, emissiveIntensity: 0.8 });
      const mesh = new T.Mesh(S.geo(), hm);
      mesh.position.set(HK.x, HK.y, 0);
      mesh.rotation.y = 0.32;
      mesh.scale.setScalar(sc);
      gr.add(mesh);
      // Halkanın çevresinde yumuşak altın ışık hâlesi (içinden geçilecek yer belli olsun)
      const hg = new T.RingGeometry(0.72, 1.42, 40, 1);
      const hcol = [], hp = hg.attributes.position;
      for (let i = 0; i < hp.count; i++) { const r = Math.hypot(hp.getX(i), hp.getY(i)), k = 1 - Math.min(1, Math.abs(r - 1.02) / 0.4); hcol.push(k, k * 0.86, k * 0.45); }
      hg.setAttribute('color', new T.Float32BufferAttribute(hcol, 3));
      const hlm = new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: B.gece ? 0.6 : 0.45, blending: T.AdditiveBlending, depthWrite: false, fog: false });
      const hale = new T.Mesh(hg, hlm); hale.position.z = -0.05; hale.renderOrder = 2; mesh.add(hale);
      dy.halkalar.push({ mesh, mat: hm, hale: hlm, x: HK.x, y: HK.y, sc, parlaT: 9, faz: idx * 1.1 });
    }
  }

  // ── 11 · Kelebekler / Ateş Böcekleri ve Kuş Sürüsü ──
  {
    const flap = (m, hiz, en) => {
      m.onBeforeCompile = (sh) => {
        sh.uniforms.uT = dy.U.uT;
        sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>',
          `#include <begin_vertex>\nfloat dyF = sin(uT * ${hiz} + float(gl_InstanceID) * 1.7);\ntransformed.x *= ${en} + (1.0 - ${en}) * abs(dyF); transformed.y += abs(transformed.x) * dyF * 0.3;`);
      };
    };
    // Rüzgârla süzülen çiçek yaprakları / sonbahar yaprakları / gece parıltılı polenler (böcek yok)
    const km = new T.MeshBasicMaterial({ side: T.DoubleSide, transparent: true, opacity: 0.92 });
    const YN = 34;
    dy.kelebek = new T.InstancedMesh(B.gece ? G.kureK : G.cicek, km, YN);
    const kr = B.gece ? [0xfff2a0, 0xffd080, 0xb8f4ff, 0xffe8f8] : (bNo === 16 ? [0xff7a30, 0xffb040, 0xe04428, 0xffd060] : [B.cicek[0][1], B.cicek[1][1], B.cicek[2][1], 0xffffff, B.cicek[3][0]]);
    for (let i = 0; i < YN; i++) dy.kelebek.setColorAt(i, new T.Color(kr[i % kr.length]));
    dy.kelebek.frustumCulled = false; gr.add(dy.kelebek);
    dy.yaprakN = YN; dy.yaprakX0 = -14; dy.yaprakAra = hx + 30; dy.yaprakGece = !!B.gece;

    const bm = new T.MeshStandardMaterial({ color: B.gece ? 0x2c2c58 : 0x7a6a9a, roughness: 0.8, side: T.DoubleSide, fog: false, emissive: B.gece ? 0x181838 : 0x443a5a, emissiveIntensity: 0.5 });
    flap(bm, '6.0', '0.55');
    dy.kus = new T.InstancedMesh(G.kanatB, bm, 7); dy.kus.frustumCulled = false; gr.add(dy.kus);
  }
}

function dunyaSapan(px, py) {
  const d = (typeof P !== 'undefined' && P) ? P.durum : 'bekle';
  dy.cekiliyor = d === 'cek';
  if (d === 'bekle' || d === 'cek') { dy.hedef.x = px; dy.hedef.y = py - 0.5; dy.yapis = true; }
  else { dy.hedef.x = 0; dy.hedef.y = 2.75; dy.yapis = false; }
}

function dyBant(m, ax, ay, bx, by) {
  const dx = bx - ax, dyy = by - ay, L = Math.max(0.01, Math.hypot(dx, dyy)), k = 0.18 * Math.max(0.55, Math.min(1, 2.2 / L));
  m.position.set(ax, ay, -0.05); m.scale.set(k, L, k);
  dy.v1.set(dx / L, dyy / L, 0); m.quaternion.setFromUnitVectors(dy.yuk, dy.v1);
}

function dunyaGuncelle(dt, t) {
  if (!dy.kur) return;
  dt = Math.min(dt || 0.016, 0.05);
  dy.U.uT.value = t;
  if (typeof P !== 'undefined' && P && isFinite(P.x)) {
    const u = dy.U.uP.value;
    u.x += (P.x - u.x) * Math.min(1, dt * 12);
    u.y += (P.y - u.y) * Math.min(1, dt * 12);
  }
  if (dy.degirmen) dy.degirmen.rotation.z = -t * 0.42 - Math.sin(t * 0.55) * 0.14;
  if (dy.bulutMesh) { dy.bulutMesh.position.x = Math.sin(t * 0.012) * 26; dy.bulutMesh.position.y = Math.sin(t * 0.07) * 0.6; }
  if (dy.yuzenAdalar) dy.yuzenAdalar.position.y = Math.sin(t * 0.75) * 0.35;

  // Sapan kesesi ve bantlar
  if (dy.kese && dy.bantA && dy.bantB) {
    if (dy.yapis) {
      const k = dy.cekiliyor ? 1 : Math.min(1, dt * 14);
      const nx = dy.kx + (dy.hedef.x - dy.kx) * k, ny = dy.ky + (dy.hedef.y - dy.ky) * k;
      dy.kvx = (nx - dy.kx) / dt; dy.kvy = (ny - dy.ky) / dt; dy.kx = nx; dy.ky = ny;
    } else {
      const ax = (dy.hedef.x - dy.kx) * 210 - dy.kvx * 7, ay = (dy.hedef.y - dy.ky) * 210 - dy.kvy * 7;
      dy.kvx += ax * dt; dy.kvy += ay * dt;
      const vm = 40;
      dy.kvx = Math.max(-vm, Math.min(vm, dy.kvx)); dy.kvy = Math.max(-vm, Math.min(vm, dy.kvy));
      dy.kx += dy.kvx * dt; dy.ky += dy.kvy * dt;
    }
    const sl = DUNYA.sapanSol, sg = DUNYA.sapanSag, mx = (sl.x + sg.x) / 2, my = (sl.y + sg.y) / 2;
    const cekme = Math.hypot(dy.kx, dy.ky - 2.75);
    let aci = Math.atan2(dy.ky - my, dy.kx - mx) + Math.PI / 2;
    if (cekme < 0.6) aci *= cekme / 0.6;
    const nef = dy.yapis && !dy.cekiliyor ? Math.sin(t * 2.2) * 0.03 : 0;
    const salinimY = !dy.yapis && !dy.cekiliyor && cekme < 0.35 ? Math.sin(t * 1.45) * 0.028 * (1 - cekme / 0.35) : 0;
    const salinimAci = !dy.yapis && !dy.cekiliyor && cekme < 0.35 ? Math.sin(t * 1.15) * 0.032 * (1 - cekme / 0.35) : 0;
    const sonY = dy.ky + nef + salinimY, sonAci = aci + salinimAci;
    dy.kese.position.set(dy.kx, sonY, -0.02);
    dy.kese.rotation.z = sonAci;
    dy.kese.rotation.x = dy.cekiliyor ? 0 : Math.sin(t * (dy.yapis ? 1.8 : 1.65)) * (dy.yapis ? 0.02 : 0.035);
    dy.kese.scale.set(1.3 * (1 - Math.min(0.25, cekme * 0.05)), 1.3 * (1 + Math.min(0.4, cekme * 0.06)), 1.3);
    const c = Math.cos(sonAci), s = Math.sin(sonAci), e = 1.0 * dy.kese.scale.x;
    dyBant(dy.bantA, sl.x, sl.y, dy.kx - c * e, sonY - s * e + 0.1);
    dyBant(dy.bantB, sg.x, sg.y, dy.kx + c * e, sonY + s * e + 0.1);
  }

  // Dinamik mantarlar
  for (let i = 0; i < dy.mantarlar.length; i++) {
    const m = dy.mantarlar[i];
    m.t += dt; m.kirp -= dt; m.sik -= dt;
    let gk = 1;
    if (m.kirp <= 0) m.kirp = 2.5 + (i % 3) * 0.9;
    else if (m.kirp < 0.14) gk = Math.abs(m.kirp - 0.07) / 0.07 * 0.9 + 0.1;
    if (m.sik > 0) gk = 0.12;
    m.goz.scale.y = gk;
    const a = Math.exp(-m.t * 5) * Math.cos(m.t * 22);
    const sy = (1 - 0.3 * a) * (1 + Math.sin(t * 2.1 + i) * 0.03);
    m.mesh.scale.set(m.sc * (1 + 0.18 * a), m.sc * sy, m.sc * (1 + 0.18 * a));
  }

  // Dinamik bulutlar
  for (let i = 0; i < dy.bulutlarList.length; i++) {
    const b = dy.bulutlarList[i];
    b.t += dt; b.kirp -= dt; b.sik -= dt;
    let gk = 1;
    if (b.kirp <= 0) b.kirp = 2.8 + (i % 3) * 1.0;
    else if (b.kirp < 0.14) gk = Math.abs(b.kirp - 0.07) / 0.07 * 0.9 + 0.1;
    if (b.sik > 0) gk = 0.12;
    b.goz.scale.y = gk;
    const a = Math.exp(-b.t * 4.5) * Math.cos(b.t * 18);
    b.mesh.scale.set(b.sc * (1 + 0.2 * a), b.sc * (1 - 0.26 * a), b.sc * (1 + 0.1 * a));
    b.mesh.position.y = b.y + Math.sin(t * 1.3 + i * 1.5) * 0.14 - 0.3 * Math.max(0, a);
  }

  // Dinamik nilüfer yaprakları
  for (let i = 0; i < dy.niluferler.length; i++) {
    const n = dy.niluferler[i];
    n.t += dt;
    const a = Math.exp(-n.t * 4.2) * Math.cos(n.t * 16);
    n.mesh.position.y = n.y + Math.sin(t * 1.6 + i) * 0.04 - 0.16 * Math.max(0, a);
    n.mesh.scale.set(n.sc * (1 + 0.14 * a), n.sc * (1 - 0.22 * a), n.sc * (1 + 0.14 * a));
    const rs = n.sc * (1 + 0.05 * Math.sin(t * 2.1 + i) + Math.min(0.6, n.t < 1.2 ? n.t * 0.5 : 0));
    n.ripple.scale.set(rs, rs, 1);
    n.rm.opacity = n.t < 1.2 ? 0.85 * (1 - n.t / 1.2) : 0.35 + 0.15 * Math.sin(t * 2.1 + i);
  }

  // Dinamik dönen rüzgâr sütunları
  for (let i = 0; i < dy.ruzgarlar.length; i++) {
    const r = dy.ruzgarlar[i];
    r.t += dt;
    const rp = Math.exp(-r.t * 2.2);
    r.don = (r.don || 0) + dt * (3.4 + rp * 9);
    r.mesh.rotation.y = r.don + r.faz;
    r.mesh.position.y = r.y + Math.sin(t * 2.2 + r.faz) * 0.22;
    const rs = 1 + rp * 0.12 * Math.sin(r.t * 10);
    r.mesh.scale.set(rs, 1, rs);
    r.rm.emissiveIntensity = 0.55 + rp * 1.4;
    if (r.ok) {
      r.ok.position.y = r.y + ((t * (1.7 + rp * 4) + r.faz) % r.okAra) - r.okAra * 0.5;
      r.ok.material.opacity = 0.85 + 0.1 * Math.sin(t * 4 + r.faz) + rp * 0.05;
    }
  }

  // Dinamik çiçekli halkalar (`halka` olayında parlar ve esner)
  for (let i = 0; i < dy.halkalar.length; i++) {
    const h = dy.halkalar[i];
    h.parlaT += dt;
    const p = Math.exp(-h.parlaT * 3.5);
    const s = h.sc * (1 + 0.28 * p * Math.cos(h.parlaT * 14));
    h.mesh.scale.setScalar(s);
    h.mesh.position.y = h.y + Math.sin(t * 1.7 + h.faz) * 0.15;
    h.mesh.rotation.z = t * 0.35 + h.faz + p * h.parlaT * 6;
    h.mesh.rotation.y = 0.32 + p * Math.sin(h.parlaT * 9) * 0.5;
    h.mat.emissiveIntensity = 0.8 + 0.2 * Math.sin(t * 3.2 + h.faz) + p * 1.8;
    if (h.hale) h.hale.opacity = (dy.biyomGece ? 0.55 : 0.4) + 0.12 * Math.sin(t * 2.6 + h.faz) + p * 0.5;
  }

  // Salıncak tacı: bırakınca yaylanma, çekerken hafif öne eğilme
  if (dy.salTac) {
    dy.salT += dt;
    const a = Math.exp(-dy.salT * 3.2) * Math.sin(dy.salT * 13);
    const egil = dy.cekiliyor ? Math.max(-0.025, Math.min(0.025, -(dy.kx || 0) * 0.008)) : 0;
    dy.salEgil = (dy.salEgil || 0) + (egil - (dy.salEgil || 0)) * Math.min(1, dt * 6);
    dy.salTac.rotation.z = a * 0.03 + dy.salEgil + Math.sin(t * 0.9) * 0.004;
    dy.salTac.scale.set(1 + a * 0.025, 1 - a * 0.02, 1);
  }

  // Çalı esnemesi
  if (dy.cali) {
    dy.caliT += dt;
    const a = Math.exp(-dy.caliT * 5) * Math.cos(dy.caliT * 20), nf = 1 + Math.sin(t * 1.6) * 0.015;
    dy.cali.scale.set(1 + 0.15 * a, (1 - 0.22 * a) * nf, 1 + 0.1 * a);
  }

  // Kelebekler / Ateş böcekleri (uçuş yolu + salıncak + hedef çayırı)
  if (dy.kelebek) {
    const o = dy.o, N = dy.yaprakN || 0, ara = dy.yaprakAra || 60, x0 = dy.yaprakX0 || -14, gece = dy.yaprakGece;
    for (let i = 0; i < N; i++) {
      const h1 = (i * 0.618034) % 1, h2 = (i * 0.414214 + 0.3) % 1, hiz = 0.9 + h2 * 0.9;
      const x = x0 + ((h1 * ara + t * hiz) % ara);
      const y = 0.8 + h2 * 9 + Math.sin(t * 0.8 + i * 1.3) * 0.7 - ((t * 0.25 + h1 * 3) % 3) * 0.15;
      const z = -0.8 - (i % 6) * 1.3;
      if (gece) {
        const s = 0.1 * (0.7 + 0.5 * Math.sin(t * 3 + i * 2.1));
        o.position.set(x, y, z); o.rotation.set(0, 0, 0); o.scale.setScalar(Math.max(0.02, s));
      } else {
        o.position.set(x, y, z);
        o.rotation.set(t * (1.1 + h1) + i, t * (0.7 + h2) + i * 0.5, Math.sin(t * 1.3 + i) * 1.2);
        o.scale.set(0.16, 0.11, 0.16);
      }
      o.updateMatrix();
      dy.kelebek.setMatrixAt(i, o.matrix);
    }
    dy.kelebek.instanceMatrix.needsUpdate = true;
  }

  // Kuş sürüsü
  if (dy.kus) {
    const o = dy.o, fx = ((t * 3.2) % 320) - 120;
    for (let i = 0; i < 7; i++) {
      const r = Math.abs(i - 3), x = fx - r * 2.6, y = 27 +(i - 3) * 0.4 * (i < 3 ? -1 : 1) + Math.sin(t * 0.8 + i) * 0.6;
      o.position.set(x, y + r * 1.2, -70); o.rotation.set(0, 0, 0); o.scale.setScalar(1); o.updateMatrix();
      dy.kus.setMatrixAt(i, o.matrix);
    }
    dy.kus.instanceMatrix.needsUpdate = true;
  }

  // Kulübe bacasından yükselen duman
  if (dy.duman && dy.dumanPos) {
    const o = dy.o, dp = dy.dumanPos;
    for (let i = 0; i < 7; i++) {
      const u = ((t * 0.28 + i / 7) % 1);
      const x = dp.x + u * 1.65 + Math.sin(t * 1.4 + i * 1.1) * 0.16 * u;
      const y = dp.y + u * 3.4;
      const z = dp.z + Math.cos(t * 1.1 + i) * 0.1 * u;
      const sc = (0.22 + u * 0.48) * (1 - Math.pow(u, 4));
      o.position.set(x, y, z);
      o.rotation.set(0, 0, u * 1.5);
      o.scale.set(sc * 1.15, sc * 0.9, sc);
      o.updateMatrix();
      dy.duman.setMatrixAt(i, o.matrix);
    }
    dy.duman.instanceMatrix.needsUpdate = true;
  }

  // Bölüm 20: Gökyüzünde yavaşça yükselen/salınan sıcak dilek fenerleri
  if (dy.dilekFener) {
    const o = dy.o;
    for (let i = 0; i < 8; i++) {
      const u = (t * 0.032 + i / 8) % 1;
      const x = -8 + i * ((dy.hx + 18) / 7) + Math.sin(t * 0.55 + i * 1.7) * 1.3;
      const y = 4.5 + u * 20.0 + Math.sin(t * 1.1 + i * 2.1) * 0.25;
      const z = -10 - (i % 4) * 5.2;
      const sc = (0.58 + (i % 3) * 0.12) * 1.45 * Math.pow(Math.sin(u * Math.PI), 0.35) * (1 + 0.035 * Math.sin(t * 3.4 + i * 1.9));
      o.position.set(x, y, z);
      o.rotation.set(Math.sin(t * 0.7 + i) * 0.06, t * 0.15 + i, Math.cos(t * 0.6 + i * 1.3) * 0.08);
      o.scale.setScalar(sc);
      o.updateMatrix();
      dy.dilekFener.setMatrixAt(i, o.matrix);
    }
    dy.dilekFener.instanceMatrix.needsUpdate = true;
  }
}
