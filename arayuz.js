/* Arayüz: başlık ekranı (arkada süzülen mevsim süsleri), kaydırılabilir patikalı bölüm haritası (BOLUMLER.length bölüm, ortam simgeleri),
   yeni yardımcılar (baloncuk/esinti) için resimli ipucu, yıldız sayacı, canlı kanat hakkı göstergesi,
   "Sonraki Bölüm ▶" + küçük "Bir Daha" düğmeleri, 20. bölüm final kutlaması + baştan oynama, beş yıldız rozeti, kavuşma kalpleri ve yazısız çek-bırak / kanat ipuçları.
   Yalnız OLAY'ı dinler; oyunu UCUS.bolumSec / UCUS.sonrakiBolum / UCUS.yeniden ile yönlendirir. */
(function () {
  'use strict';
  var Qa = new URLSearchParams(location.search);
  var kok = document.getElementById('arayuz') || document.body;
  var TOPLAM_BOLUM = Math.max(1, (Array.isArray(window.BOLUMLER) && window.BOLUMLER.length) || 1);
  var DEPO_ANAHTAR = 'feza_piril_ucus_ilerleme_v1';

  var YILDIZ = '<path d="M50 6 63 35l31 3-24 21 7 31-27-16-27 16 7-31L6 38l31-3z"/>';
  var EL_SEKIL = '<rect x="30" y="4" width="17" height="56" rx="8.5"/><rect x="24" y="42" width="56" height="50" rx="20"/><rect x="47" y="34" width="14" height="30" rx="7"/><rect x="61" y="38" width="14" height="28" rx="7"/><ellipse cx="22" cy="62" rx="9" ry="15" transform="rotate(-35 22 62)"/>';
  var EL_SVG = '<g fill="#8a63c9" stroke="#8a63c9" stroke-width="10" stroke-linejoin="round">' + EL_SEKIL + '</g><g fill="#ffe2c8">' + EL_SEKIL + '</g>' +
    '<path d="M33 12h10" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>';
  var KALP = '<path d="M50 86C22 66 8 50 8 33 8 20 18 11 30 11c9 0 16 5 20 12 4-7 11-12 20-12 12 0 22 9 22 22 0 17-14 33-42 53z"/><ellipse cx="28" cy="27" rx="7" ry="4" fill="#fff" stroke="none" opacity=".68" transform="rotate(-30 28 27)"/>';
  var KILIT_SVG = '<svg class="kilit-simge" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1zm2 0h6V7a3 3 0 0 0-6 0v3z" fill="currentColor"/></svg>';
  var OK_SVG = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M32 20 78 50 32 80z" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"/></svg>';
  var TEKRAR_SVG = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M63 29.5A26 26 0 1 1 39 28.5" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/><path d="M50 22 37 41 27 19z" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/></svg>';

  // harita simgesi: kıvrılan patika, duraklar, sonunda yıldız
  var HARITA_SVG = '<svg viewBox="0 0 100 100" aria-hidden="true">' +
    '<path d="M16 80C40 82 28 52 50 52S66 26 82 24" fill="none" stroke="rgba(70,30,130,.35)" stroke-width="15" stroke-linecap="round" transform="translate(0 3)"/>' +
    '<path d="M16 80C40 82 28 52 50 52S66 26 82 24" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/>' +
    '<path d="M16 80C40 82 28 52 50 52S66 26 82 24" fill="none" stroke="#c9a6ff" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 9"/>' +
    '<circle cx="16" cy="80" r="9" fill="#ff8fc0" stroke="#fff" stroke-width="4"/><circle cx="50" cy="52" r="9" fill="#7fd6ff" stroke="#fff" stroke-width="4"/>' +
    '<g transform="translate(62 4) scale(.4)" fill="#ffc928" stroke="#fff" stroke-width="9" stroke-linejoin="round">' + YILDIZ + '</g></svg>';
  // küçük Pırıl başı (haritada "buradasın" işareti)
  // minik Pırıl: mor bebek ejderha — küçük yuvarlak boynuzlar, iri yeşil gözler, pembe yanaklar, açık yeşil karın, minik pembe kanatlar
  var PIRIL_IC =
    '<path d="M20 62C4 54 4 38 12 32c4 10 10 14 18 16zM80 62c16-8 16-24 8-30-4 10-10 14-18 16z" fill="#f4a8d8" stroke="#7a4cc7" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<ellipse cx="50" cy="78" rx="24" ry="18" fill="#a77be8" stroke="#6b45ad" stroke-width="4"/>' +
    '<ellipse cx="50" cy="81" rx="14" ry="12" fill="#c9eba0"/>' +
    '<path d="M36 22c-2-9 2-15 6-15 1 6 0 10-1 14zM64 22c2-9-2-15-6-15-1 6 0 10 1 14z" fill="#fff1c2" stroke="#c99b2e" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<path d="M46 14l4-6 4 6z" fill="#f4a8d8" stroke="#7a4cc7" stroke-width="2" stroke-linejoin="round"/>' +
    '<ellipse cx="50" cy="44" rx="31" ry="27" fill="#a77be8" stroke="#6b45ad" stroke-width="4"/>' +
    '<ellipse cx="50" cy="57" rx="15" ry="9" fill="#c9a8f5"/>' +
    '<circle cx="37" cy="41" r="10" fill="#fff"/><circle cx="63" cy="41" r="10" fill="#fff"/>' +
    '<circle cx="38" cy="42" r="7.5" fill="#3fbf6a"/><circle cx="62" cy="42" r="7.5" fill="#3fbf6a"/>' +
    '<circle cx="38.5" cy="43" r="4" fill="#163a24"/><circle cx="61.5" cy="43" r="4" fill="#163a24"/>' +
    '<circle cx="41" cy="39" r="2.6" fill="#fff"/><circle cx="64" cy="39" r="2.6" fill="#fff"/>' +
    '<ellipse cx="25" cy="53" rx="6" ry="4" fill="#ff8fc0" opacity=".85"/><ellipse cx="75" cy="53" rx="6" ry="4" fill="#ff8fc0" opacity=".85"/>' +
    '<circle cx="46" cy="55" r="1.4" fill="#6b45ad"/><circle cx="54" cy="55" r="1.4" fill="#6b45ad"/>' +
    '<path d="M44 60q6 5 12 0" fill="none" stroke="#6b45ad" stroke-width="2.6" stroke-linecap="round"/>';
  var PIRIL_BAS = '<svg viewBox="0 0 100 100" aria-hidden="true">' + PIRIL_IC + '</svg>';
  // yolun sonunda Bilbo: kahverengi sarkık kulaklı köpek, kırmızı-beyaz piknik örtüsü, sepet
  var BILBO_SVG = '<svg viewBox="0 0 160 120" aria-hidden="true">' +
    '<defs><pattern id="uiDama" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#fff"/><rect width="8" height="8" fill="#ef5b5b"/><rect x="8" y="8" width="8" height="8" fill="#ef5b5b"/></pattern></defs>' +
    '<path d="M10 96 32 76h104l18 20-18 18H28z" fill="url(#uiDama)" stroke="#d24848" stroke-width="3" stroke-linejoin="round"/>' +
    '<g transform="translate(112 64)"><path d="M2 14h30l-4 22H6z" fill="#d99a4e" stroke="#9a6224" stroke-width="3" stroke-linejoin="round"/><path d="M6 15c0-16 22-16 22 0" fill="none" stroke="#9a6224" stroke-width="3.5"/>' +
      '<circle cx="11" cy="12" r="6" fill="#e84a4a"/><circle cx="22" cy="11" r="6" fill="#8fd16a"/></g>' +
    '<ellipse cx="68" cy="84" rx="26" ry="18" fill="#8a5330" stroke="#5a321a" stroke-width="3.5"/>' +
    '<ellipse cx="68" cy="88" rx="13" ry="11" fill="#f0d2a8"/>' +
    '<path d="M44 34C28 34 24 62 34 70c8 4 14-6 14-14z" fill="#5e3420" stroke="#3e200f" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M92 34c16 0 20 28 10 36-8 4-14-6-14-14z" fill="#5e3420" stroke="#3e200f" stroke-width="3" stroke-linejoin="round"/>' +
    '<ellipse cx="68" cy="46" rx="25" ry="23" fill="#9a6036" stroke="#5a321a" stroke-width="3.5"/>' +
    '<ellipse cx="68" cy="57" rx="13" ry="10" fill="#f0d2a8"/>' +
    '<ellipse cx="68" cy="51" rx="5.5" ry="4" fill="#2a1408"/>' +
    '<circle cx="58" cy="42" r="4.8" fill="#2a1408"/><circle cx="78" cy="42" r="4.8" fill="#2a1408"/><circle cx="59.5" cy="40.5" r="1.8" fill="#fff"/><circle cx="79.5" cy="40.5" r="1.8" fill="#fff"/>' +
    '<path d="M64 59q4 4 8 0" fill="none" stroke="#2a1408" stroke-width="2.4" stroke-linecap="round"/><path d="M66 61q2 9 5 0" fill="#ff7aa8"/>' +
    '<path d="M50 70h36" stroke="#e84a4a" stroke-width="5" stroke-linecap="round"/><circle cx="68" cy="74" r="4" fill="#ffc928" stroke="#c98a00" stroke-width="2"/>' +
    '<path d="M24 30c-4-6 0-12 5-9 5-3 9 3 5 9l-5 5z" fill="#ff6fa8" class="ui-bkalp"/>' +
    '</svg>';
  // haritayı kapat = geri dön (yuvarlak geri oku, olumsuz çarpı değil)
  var KAPAT_SVG = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M40 30h18a20 20 0 0 1 0 40H36" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M44 12 20 30l24 18z" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/></svg>';
  var KUPA_MINI = '<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M35 26h50v24c0 16-11 28-25 28S35 66 35 50V26z" fill="#ffd34d" stroke="#e08a00" stroke-width="7" stroke-linejoin="round"/>' +
    '<path d="M35 32H22c0 14 6 22 15 22M85 32h13c0 14-6 22-15 22" fill="none" stroke="#e08a00" stroke-width="7" stroke-linecap="round"/>' +
    '<rect x="50" y="76" width="20" height="16" rx="3" fill="#e08a00"/><rect x="36" y="90" width="48" height="14" rx="7" fill="#9b5de5" stroke="#6b45ad" stroke-width="5"/></svg>';
  // bütün bölümler 5 yıldız olunca Bilbo'nun üstünde parlayan taç
  var TAC_SVG = '<svg viewBox="0 0 120 96" aria-hidden="true"><defs><linearGradient id="uiTacGk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff6f9a"/><stop offset=".22" stop-color="#ffa63a"/><stop offset=".42" stop-color="#ffe14a"/><stop offset=".62" stop-color="#5fd36a"/><stop offset=".8" stop-color="#4fb8f0"/><stop offset="1" stop-color="#a77be8"/></linearGradient></defs><path class="tac-govde" d="M14 78 8 26l26 22L60 10l26 38 26-22-6 52z" fill="#ffd34d" stroke="#e08a00" stroke-width="6" stroke-linejoin="round"/>' +
    '<path d="M22 40l6 30M60 26v40" stroke="#fff3b0" stroke-width="4" stroke-linecap="round" opacity=".8"/>' +
    '<rect class="tac-govde" x="12" y="70" width="96" height="18" rx="8" fill="#ffc21c" stroke="#e08a00" stroke-width="6"/>' +
    '<circle cx="60" cy="52" r="8" fill="#ff5fa2" stroke="#fff" stroke-width="2.5"/><circle cx="34" cy="60" r="5.5" fill="#36c2e0" stroke="#fff" stroke-width="2"/><circle cx="86" cy="60" r="5.5" fill="#36c24a" stroke="#fff" stroke-width="2"/>' +
    '<circle cx="8" cy="24" r="6.5" fill="#fff6c0" stroke="#e08a00" stroke-width="4"/><circle cx="60" cy="9" r="7" fill="#fff6c0" stroke="#e08a00" stroke-width="4"/><circle cx="112" cy="24" r="6.5" fill="#fff6c0" stroke="#e08a00" stroke-width="4"/></svg>';

  var KANAT_SVG = '<svg viewBox="0 0 64 64" aria-hidden="true">' +
    '<defs><linearGradient id="kanatMor" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="#e3c8ff"/><stop offset="52%" stop-color="#a86ef2"/><stop offset="100%" stop-color="#6b45ad"/>' +
    '</linearGradient></defs>' +
    '<path d="M12 52C10 30 24 10 54 8c-6 10-7 17-1 23-9 1-14 6-12 14-8-1-14 3-16 10-5-2-9-2-13-3z" fill="url(#kanatMor)" stroke="#ffc928" stroke-width="3.6" stroke-linejoin="round"/>' +
    '<path d="M16 49C22 33 34 20 49 13" fill="none" stroke="#fff3b0" stroke-width="2.6" stroke-linecap="round" opacity=".88"/>' +
    '<circle cx="44" cy="18" r="2.6" fill="#fff8c8"/>' +
    '</svg>';

  // ───── ortam simgeleri: haritada her bölümün arkasında o ortamı anlatan minik resim (40×40) ─────
  function cicekS(y, k, o) {
    var s = '';
    for (var a = 0; a < 5; a++) s += '<ellipse cx="20" cy="11.5" rx="5.8" ry="8" transform="rotate(' + (a * 72) + ' 20 20)"/>';
    return '<g fill="' + y + '" stroke="' + k + '" stroke-width="1.8">' + s + '</g><circle cx="20" cy="20" r="4.8" fill="' + o + '" stroke="' + k + '" stroke-width="1.4"/>';
  }
  function bulutS(f, k) { return '<path d="M10 30a7 7 0 0 1 .5-14 9.5 9.5 0 0 1 18-2.5A7.5 7.5 0 0 1 30 30z" fill="' + f + '" stroke="' + k + '" stroke-width="2.4" stroke-linejoin="round"/>'; }
  var KAR_D = 'M20 5v30M7 12.5l26 15M7 27.5l26-15M15 8l5 4 5-4M15 32l5-4 5 4M6.5 17.5l6.3 1.6-1.8 6.2M33.5 22.5l-6.3-1.6 1.8-6.2M6.5 22.5l6.3-1.6-1.8-6.2M33.5 17.5l-6.3 1.6 1.8 6.2';
  var SIMGE = {
    kar: '<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="' + KAR_D + '" stroke="#78ade0" stroke-width="6.5"/><path d="' + KAR_D + '" stroke="#fff" stroke-width="3"/></g>',
    damla: '<path d="M20 4C14 14 9.5 20 9.5 25.5a10.5 10.5 0 0 0 21 0C30.5 20 26 14 20 4z" fill="#62b8f2" stroke="#2f7fc0" stroke-width="2.4" stroke-linejoin="round"/><ellipse cx="15.5" cy="25" rx="2.6" ry="4.4" fill="#fff" opacity=".75"/>',
    sakura: cicekS('#ffc2db', '#e0609a', '#fff3a0'),
    papatya: cicekS('#fff', '#9fb98a', '#ffd23f'),
    aycicek: cicekS('#ffd23f', '#d99a00', '#8a5330'),
    kaktus: '<g fill="#5cbf5a" stroke="#2f8a3a" stroke-width="2.2" stroke-linejoin="round"><rect x="16" y="7" width="8.5" height="29" rx="4.2"/><path d="M16 25h-4a3 3 0 0 1-3-3v-7a2.5 2.5 0 0 1 5 0v5h2z"/><path d="M24.5 21h3.5v-6a2.5 2.5 0 0 1 5 0v7a3 3 0 0 1-3 3h-5.5z"/></g><circle cx="20.2" cy="7" r="3" fill="#ff8fc0" stroke="#d9579a" stroke-width="1.4"/><path d="M8 36h24" stroke="#d9a64a" stroke-width="3" stroke-linecap="round"/>',
    firtina: bulutS('#eef2f8', '#7d8aa3') + '<path d="M21.5 22l-5.5 8h4.5l-2 7.5 8-10.5h-4.5l3-5z" fill="#ffd84a" stroke="#d99a00" stroke-width="1.6" stroke-linejoin="round"/>',
    balkabagi: '<ellipse cx="20" cy="25" rx="14.5" ry="11" fill="#ff9a3c" stroke="#c9621a" stroke-width="2.4"/><path d="M14.5 15.5c-2.4 6-2.4 13 0 19M25.5 15.5c2.4 6 2.4 13 0 19M20 14v22" fill="none" stroke="#c9621a" stroke-width="1.8"/><path d="M19.5 14c0-4 1.6-6.5 5-8" stroke="#5a8a2a" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M24 9c4-2 7-1 8 1-3 1-6 1-8-1z" fill="#7fc04a" stroke="#4f8a2a" stroke-width="1.2"/>',
    buz: '<path d="M20 4l10.5 8v16L20 36 9.5 28V12z" fill="#cdf3ff" stroke="#4fb2d8" stroke-width="2.4" stroke-linejoin="round"/><path d="M20 4v32M9.5 12 30.5 28M30.5 12 9.5 28" stroke="#fff" stroke-width="1.8" opacity=".9"/><path d="M14 10l3-2" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>',
    kristal: '<path d="M20 3l7 9-7 25-7-25z" fill="#d9c6ff" stroke="#8a63c9" stroke-width="2.2" stroke-linejoin="round"/><path d="M9 14l5 4-1 13-6-9zM31 14l-5 4 1 13 6-9z" fill="#b7f0f7" stroke="#4fb2d8" stroke-width="2" stroke-linejoin="round"/><path d="M17 12l3-5" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>',
    palmiye: '<path d="M8 37c6-3 18-3 24 0" stroke="#e8b45a" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M20 36c0-9 1-16 3.5-22" stroke="#a8743a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M23.5 14c-6-4-12-3.5-17 .5 6-1 11 0 17-.5zM23.5 14c5-5 11-5.5 15-2.5-6 0-10 1-15 2.5zM23.5 14c-2.5-5-1.5-9.5 2.5-11.5-1 4-.5 7.5-2.5 11.5zM23.5 14c4.5 0 8.5 3 10.5 8.5-4-3-7-5.2-10.5-8.5zM23.5 14c-4 1-7 4-8 9 3-3.4 5.4-5.6 8-9z" fill="#4fbf63" stroke="#2c8a40" stroke-width="1.6" stroke-linejoin="round"/>',
    bambu: '<g fill="#93d26c" stroke="#4f9a3a" stroke-width="2"><rect x="10" y="4" width="7.5" height="33" rx="3.5"/><rect x="22" y="9" width="7.5" height="28" rx="3.5"/></g><path d="M10 14h7.5M10 25h7.5M22 19h7.5M22 29h7.5" stroke="#4f9a3a" stroke-width="2"/><path d="M29.5 13c4-3.5 7-3.5 9-2.5-3 2.4-6 3.4-9 2.5zM10 9C6 6 3 6 1.5 7c3 2.2 6 3 8.5 2z" fill="#93d26c" stroke="#4f9a3a" stroke-width="1.5"/>',
    seker: '<path d="M20 24v13" stroke="#cdb6e6" stroke-width="5" stroke-linecap="round"/><path d="M20 24v13" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="20" cy="15" r="11.5" fill="#ff8fc8" stroke="#e0509a" stroke-width="2.4"/><path d="M20 15m-6.5 0a6.5 6.5 0 1 1 6.5 6.5 3.4 3.4 0 1 1-3.4-3.4" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/>',
    ay: '<path d="M25 4.5a15 15 0 1 0 10 25A12.5 12.5 0 0 1 25 4.5z" fill="#ffe680" stroke="#d9a600" stroke-width="2.2" stroke-linejoin="round"/><circle cx="15" cy="23" r="2.2" fill="#f2c94a"/><circle cx="21" cy="30" r="1.6" fill="#f2c94a"/>',
    lale: '<path d="M20 37V20" stroke="#3f9a3a" stroke-width="3" stroke-linecap="round"/><path d="M20 31c-5.5-1-8.5-4.5-9.5-9 5.5 0 8.5 3.5 9.5 9zM20 34c4.5-.8 7.5-3.6 8.5-7.6-4.6.2-7.6 3-8.5 7.6z" fill="#5cbf5a" stroke="#3f9a3a" stroke-width="1.4" stroke-linejoin="round"/><path d="M11.5 9.5l4.5 4 4-6.5 4 6.5 4.5-4V19a8.5 8.5 0 0 1-17 0z" fill="#ff5a6e" stroke="#c42a40" stroke-width="2.2" stroke-linejoin="round"/>',
    isilti: '<circle cx="20" cy="19" r="15" fill="#8ff7ea" opacity=".35"/><path d="M5.5 21a14.5 12.5 0 0 1 29 0z" fill="#6ff0e0" stroke="#1fa39b" stroke-width="2.2" stroke-linejoin="round"/><circle cx="14" cy="15" r="2.2" fill="#fff"/><circle cx="23" cy="12" r="2" fill="#fff"/><path d="M15.5 21h9l1 14h-11z" fill="#f4f8ff" stroke="#9fb4d0" stroke-width="2" stroke-linejoin="round"/>',
    sato: '<path d="M7 37V17h5.2v4h3.6v-4h8.4v4h3.6v-4H33v20z" fill="#f4e6ff" stroke="#8a63c9" stroke-width="2.2" stroke-linejoin="round"/><path d="M16.5 37v-7a3.5 3.5 0 0 1 7 0v7z" fill="#8a63c9"/><path d="M20 17V5" stroke="#8a63c9" stroke-width="1.8"/><path d="M20 5l7.5 2.6L20 10.2z" fill="#ff7aa8" stroke="#d9579a" stroke-width="1.2" stroke-linejoin="round"/>',
    cam: '<path d="M20 4l10 13h-5.5l7.5 11H8l7.5-11H10z" fill="#3fa36a" stroke="#22704a" stroke-width="2" stroke-linejoin="round"/><rect x="18" y="28" width="4" height="8" rx="1" fill="#9a6036"/><path d="M14.5 16.5h11M12 26h16" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="20" cy="4.5" r="2.8" fill="#ffd84a" stroke="#d99a00" stroke-width="1.4"/>',
    bulut: bulutS('#fff', '#8cc4ee'),
    pamuk: bulutS('#ffd6ee', '#e88ac0'),
    nilufer: '<ellipse cx="20" cy="23" rx="13.5" ry="7.5" fill="#6cc65a" stroke="#3a8a3a" stroke-width="2"/><path d="M20 23l10-5.5" stroke="#3a8a3a" stroke-width="2"/><circle cx="15.5" cy="18.5" r="4.4" fill="#ffa8d0" stroke="#d9579a" stroke-width="1.6"/><path d="M4 34q4-3 8 0t8 0 8 0 8 0" fill="none" stroke="#3fa8d8" stroke-width="2.6" stroke-linecap="round"/>',
    lavanta: '<path d="M20 37V8" stroke="#5f9a4a" stroke-width="2.4"/><g fill="#b48cf0" stroke="#6b45ad" stroke-width="1.2"><ellipse cx="20" cy="6" rx="2.8" ry="3.6"/><ellipse cx="16.8" cy="10.5" rx="3" ry="4"/><ellipse cx="23.2" cy="13.5" rx="3" ry="4"/><ellipse cx="16.8" cy="16.5" rx="3" ry="4"/><ellipse cx="23.2" cy="19.5" rx="3" ry="4"/><ellipse cx="16.8" cy="22.5" rx="3" ry="4"/></g>',
    gokkusagi: '<g fill="none" stroke-width="3.8" stroke-linecap="round"><path d="M4.5 31a15.5 15.5 0 0 1 31 0" stroke="#ff5f6e"/><path d="M8.5 31a11.5 11.5 0 0 1 23 0" stroke="#ffc928"/><path d="M12.5 31a7.5 7.5 0 0 1 15 0" stroke="#4fc3e0"/></g>',
    dag: '<path d="M3 35L15 12l6 9 4.5-5.5L37 35z" fill="#9bb0c8" stroke="#5f7590" stroke-width="2.2" stroke-linejoin="round"/><path d="M15 12l-4.2 8 3.2-1.5 2 2 2.2-3.6z" fill="#fff"/>',
    bayrak: '<path d="M12 37V5" stroke="#8a5330" stroke-width="3" stroke-linecap="round"/><path d="M13 6h19l-5 6.5 5 6.5H13z" fill="#ff7a59" stroke="#c94a2a" stroke-width="2" stroke-linejoin="round"/>',
    deniz: '<path d="M20 35L6 19a14 14 0 0 1 28 0z" fill="#ffb4a4" stroke="#e0705a" stroke-width="2.2" stroke-linejoin="round"/><path d="M20 35L12.5 12.5M20 35V8M20 35l7.5-22.5" stroke="#e0705a" stroke-width="1.6"/>',
    yaprak: '<path d="M20 4l3 7 6.5-3-1 7.5 7 1-5 5 4 4-8 1v8.5h-2.6V26.5l-8-1 4-4-5-5 7-1-1-7.5 6.5 3z" fill="#f08a3a" stroke="#b9561a" stroke-width="1.8" stroke-linejoin="round"/>',
    aurora: '<path d="M4 21c6-8 10 4 16-4s10 4 16-4" fill="none" stroke="#5fe0b8" stroke-width="4.2" stroke-linecap="round"/><path d="M4 30c6-8 10 4 16-4s10 4 16-4" fill="none" stroke="#a48ff2" stroke-width="3.4" stroke-linecap="round"/>',
    ada: '<path d="M6 21h28l-6 8-8 6.5-8-6.5z" fill="#c4935e" stroke="#7a5432" stroke-width="2" stroke-linejoin="round"/><path d="M5 21a15 6.5 0 0 1 30 0z" fill="#6cc65a" stroke="#3a8a3a" stroke-width="2"/><circle cx="25" cy="12.5" r="4.4" fill="#4fbf63" stroke="#2c8a40" stroke-width="1.6"/><path d="M25 17v-2" stroke="#7a5432" stroke-width="2"/>',
    gunes: '<g stroke="#f0a020" stroke-width="3" stroke-linecap="round"><path d="M20 2.5v5M20 32.5v5M2.5 20h5M32.5 20h5M7.6 7.6l3.5 3.5M28.9 28.9l3.5 3.5M7.6 32.4l3.5-3.5M28.9 11.1l3.5-3.5"/></g><circle cx="20" cy="20" r="9" fill="#ffd84a" stroke="#f0a020" stroke-width="2.4"/>',
    gunbatimi: '<path d="M20 5v5M8 11l3.2 3.2M32 11l-3.2 3.2" stroke="#ffae6a" stroke-width="3" stroke-linecap="round"/><path d="M6 29a14 14 0 0 1 28 0z" fill="#ff9a5c" stroke="#e0602a" stroke-width="2.4" stroke-linejoin="round"/><path d="M3.5 33h33" stroke="#e0602a" stroke-width="2.8" stroke-linecap="round"/>',
    mantar: '<path d="M5 22a15 13 0 0 1 30 0z" fill="#ff5f56" stroke="#c0302a" stroke-width="2.2" stroke-linejoin="round"/><circle cx="14" cy="15" r="2.7" fill="#fff"/><circle cx="24" cy="12" r="2.3" fill="#fff"/><circle cx="28.5" cy="18" r="2" fill="#fff"/><path d="M15 22h10l1 14H14z" fill="#fff6e6" stroke="#c9a888" stroke-width="2" stroke-linejoin="round"/>',
    yildiz: '<g transform="translate(2 2) scale(.36)" fill="#ffd84a" stroke="#d99a00" stroke-width="7" stroke-linejoin="round">' + YILDIZ + '</g>',
    balon: '<path d="M20 3.5c6.8 0 11.5 5 11.5 11.5 0 6.5-5 11.5-7 13h-9c-2-1.5-7-6.5-7-13C8.5 8.5 13.2 3.5 20 3.5z" fill="#ff7369"/><path d="M20 3.5c3.6 0 5.4 5 5.4 11.5s-1.8 11.2-2.7 13h-5.4c-.9-1.8-2.7-6.7-2.7-13s1.8-11.5 5.4-11.5z" fill="#ffe066"/><path d="M20 3.5c1.5 0 2.2 5 2.2 11.5s-.8 11.2-1 13h-2.4c-.2-1.8-1-6.7-1-13s.7-11.5 2.2-11.5z" fill="#6ad2f0"/><path d="M20 3.5c6.8 0 11.5 5 11.5 11.5 0 6.5-5 11.5-7 13h-9c-2-1.5-7-6.5-7-13C8.5 8.5 13.2 3.5 20 3.5z" fill="none" stroke="#c44a3a" stroke-width="2" stroke-linejoin="round"/><path d="M16.5 28l1 3.5M23.5 28l-1 3.5" stroke="#8a5330" stroke-width="1.8" stroke-linecap="round"/><rect x="15.5" y="31.5" width="9" height="5.5" rx="1.6" fill="#d99a54" stroke="#8a5330" stroke-width="1.8"/>',
    nota: '<path d="M15.5 29V10.5l16.5-3.3v18.8" fill="none" stroke="#c2364a" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5 29V10.5l16.5-3.3v18.8" fill="none" stroke="#ff7382" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.5 9.2l18.5-3.7v4.6l-18.5 3.7z" fill="#ff7382" stroke="#c2364a" stroke-width="1.8" stroke-linejoin="round"/><ellipse cx="11.5" cy="29.5" rx="5.3" ry="4" transform="rotate(-18 11.5 29.5)" fill="#ff7382" stroke="#c2364a" stroke-width="2"/><ellipse cx="27.5" cy="26.5" rx="5.3" ry="4" transform="rotate(-18 27.5 26.5)" fill="#ff7382" stroke="#c2364a" stroke-width="2"/><circle cx="10.2" cy="28.3" r="1.3" fill="#fff" opacity=".75"/><circle cx="26.2" cy="25.3" r="1.3" fill="#fff" opacity=".75"/>',
    degirmen: '<path d="M14 36L16.5 16h7L26 36z" fill="#fff2dc" stroke="#b87642" stroke-width="2" stroke-linejoin="round"/><path d="M15 16.5a5 5 0 0 1 10 0z" fill="#ff7359" stroke="#b8442e" stroke-width="1.8" stroke-linejoin="round"/><path d="M18.2 36v-4.5a1.8 1.8 0 0 1 3.6 0V36z" fill="#a86a3a"/><g transform="rotate(45 20 15.5)"><path d="M20 3.5v24M8 15.5h24" stroke="#8a5330" stroke-width="2.2" stroke-linecap="round"/><g fill="#fff" stroke="#5aa2e0" stroke-width="1.5" stroke-linejoin="round"><rect x="18" y="4" width="4" height="8.5" rx="1"/><rect x="18" y="18.5" width="4" height="8.5" rx="1"/><rect x="8.5" y="13.5" width="8.5" height="4" rx="1"/><rect x="23" y="13.5" width="8.5" height="4" rx="1"/></g></g><circle cx="20" cy="15.5" r="2.6" fill="#ffd84a" stroke="#b87642" stroke-width="1.5"/>',
    inci: '<path d="M7 22c0-9 5.8-14.5 13-14.5S33 13 33 22c0 3.5-2.5 5.5-6 6H13c-3.5-.5-6-2.5-6-6z" fill="#ffe2d6" stroke="#d47266" stroke-width="2" stroke-linejoin="round"/><path d="M20 26L11 13M20 26L15.5 9.5M20 26V8.5M20 26L24.5 9.5M20 26L29 13" stroke="#e89a8e" stroke-width="1.4" stroke-linecap="round"/><circle cx="20" cy="21.5" r="5.6" fill="#ff9ed0" stroke="#d94e8c" stroke-width="1.8"/><circle cx="18.2" cy="19.6" r="1.8" fill="#fff" opacity=".85"/><path d="M6.5 26.5c3.5-2 7-2 13.5-2s10 0 13.5 2c-1.5 5-6.5 8-13.5 8s-12-3-13.5-8z" fill="#ffc4b0" stroke="#d47266" stroke-width="2" stroke-linejoin="round"/><path d="M14 34.5h12" stroke="#d47266" stroke-width="2.2" stroke-linecap="round"/>',
    oyuncak: '<rect x="6" y="21" width="13.5" height="13.5" rx="2.5" fill="#ff7369" stroke="#c24036" stroke-width="2"/><rect x="9" y="24" width="7.5" height="7.5" rx="1.2" fill="#fff" opacity=".6"/><rect x="20.5" y="21" width="13.5" height="13.5" rx="2.5" fill="#5fc4ea" stroke="#2f85ad" stroke-width="2"/><circle cx="27.2" cy="27.7" r="3.2" fill="#fff" opacity=".75"/><rect x="13.2" y="6.5" width="13.5" height="13.5" rx="2.5" fill="#ffd84a" stroke="#cf8c16" stroke-width="2"/><path d="M20 9.4l1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4z" fill="#fff" opacity=".85"/>',
    selale: '<path d="M4 31V14a6 6 0 0 1 6-6h4c-1 8-1 15-1 23z" fill="#70c47a" stroke="#368846" stroke-width="1.8" stroke-linejoin="round"/><path d="M36 31V14a6 6 0 0 0-6-6h-4c1 8 1 15 1 23z" fill="#70c47a" stroke="#368846" stroke-width="1.8" stroke-linejoin="round"/><path d="M11 8c3-1.5 15-1.5 18 0 .8 7 1.8 14 2.5 23h-23c.7-9 1.7-16 2.5-23z" fill="#5fd0f5" stroke="#2286b8" stroke-width="2" stroke-linejoin="round"/><path d="M15.5 10v16M20 9v18M24.5 10v15" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".82"/><path d="M7 31a4.5 4.5 0 0 1 7.5-2 5 5 0 0 1 11 0 4.5 4.5 0 0 1 7.5 2 3.5 3.5 0 0 1-3.5 4.5h-19A3.5 3.5 0 0 1 7 31z" fill="#eefaff" stroke="#3fa8d8" stroke-width="2" stroke-linejoin="round"/>',
    turna: '<polygon points="15,24 5,11 18,20" fill="#ff847a" stroke="#d15248" stroke-width="1.8" stroke-linejoin="round"/><polygon points="19,18 23,5 26,19" fill="#ffe6e2" stroke="#d15248" stroke-width="1.8" stroke-linejoin="round"/><polygon points="23,23 30,10 32,12 27,25" fill="#ffb3ab" stroke="#d15248" stroke-width="1.8" stroke-linejoin="round"/><polygon points="30,10 36.5,12.5 31.5,13.5" fill="#ff766a" stroke="#d15248" stroke-width="1.8" stroke-linejoin="round"/><polygon points="14,24 21,18 28,23 21,31" fill="#ff948a" stroke="#d15248" stroke-width="1.8" stroke-linejoin="round"/><polygon points="16,22 13,8 25,20" fill="#fff2f0" stroke="#d15248" stroke-width="1.8" stroke-linejoin="round"/>',
    fener: '<path d="M15.5 10.5L4 6.5v8zM24.5 10.5L36 6.5v8z" fill="#fff088" opacity=".8"/><path d="M14 33l2.4-18h7.2L26 33z" fill="#fff"/><path d="M15.8 19h8.4l.6 4.5h-9.6zM14.7 27.5h10.6l.5 4H14.2z" fill="#ff5e52"/><path d="M14 33l2.4-18h7.2L26 33z" fill="none" stroke="#b84234" stroke-width="2" stroke-linejoin="round"/><rect x="14.5" y="13.5" width="11" height="2.4" rx="1" fill="#b84234"/><rect x="16.8" y="8.5" width="6.4" height="5" fill="#ffe45e" stroke="#b84234" stroke-width="1.6"/><path d="M16 9a4 4 0 0 1 8 0z" fill="#ff5e52" stroke="#b84234" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 36c2-3.5 6-5 12-5s10 1.5 12 5z" fill="#c9a87c" stroke="#7a5836" stroke-width="2" stroke-linejoin="round"/>',
    gezegen: '<g transform="rotate(-24 20 20)"><path d="M3 20a17 5.5 0 0 1 34 0" fill="none" stroke="#ffd859" stroke-width="4.2" stroke-linecap="round"/><path d="M3 20a17 5.5 0 0 1 34 0" fill="none" stroke="#fff3b0" stroke-width="1.8" stroke-linecap="round"/></g><circle cx="20" cy="20" r="10.2" fill="#ff9f6e" stroke="#cc5a38" stroke-width="2"/><path d="M11.5 16.5c4-1.5 13-1.5 17 0M11 22c4 1.5 14 1.5 18 0" fill="none" stroke="#ffc69c" stroke-width="2.2" stroke-linecap="round"/><g transform="rotate(-24 20 20)"><path d="M3 20a17 5.5 0 0 0 34 0" fill="none" stroke="#d98c1e" stroke-width="5.2" stroke-linecap="round"/><path d="M3 20a17 5.5 0 0 0 34 0" fill="none" stroke="#ffd859" stroke-width="3" stroke-linecap="round"/></g><circle cx="8" cy="8.5" r="1.4" fill="#ffe878"/><circle cx="32.5" cy="31" r="1.2" fill="#ffe878"/>',
    karnaval: '<path d="M12 36L20 19l8 17" fill="none" stroke="#8a5a9c" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 36h22" stroke="#8a5a9c" stroke-width="2.4" stroke-linecap="round"/><path d="M20 5.5v27M6.5 19h27M10.5 9.5l19 19M29.5 9.5l-19 19" stroke="#ff9cc2" stroke-width="1.6" stroke-linecap="round"/><circle cx="20" cy="19" r="13.5" fill="none" stroke="#e04878" stroke-width="2.6"/><g stroke="#c2365c" stroke-width="1.2"><circle cx="20" cy="5.5" r="2.7" fill="#ffd84a"/><circle cx="29.5" cy="9.5" r="2.7" fill="#5fd0f5"/><circle cx="33.5" cy="19" r="2.7" fill="#7ce068"/><circle cx="29.5" cy="28.5" r="2.7" fill="#ff8a5c"/><circle cx="20" cy="32.5" r="2.7" fill="#ff6ea8"/><circle cx="10.5" cy="28.5" r="2.7" fill="#ffd84a"/><circle cx="6.5" cy="19" r="2.7" fill="#5fd0f5"/><circle cx="10.5" cy="9.5" r="2.7" fill="#7ce068"/></g><circle cx="20" cy="19" r="3" fill="#ffd84a" stroke="#c2365c" stroke-width="1.6"/>'
  };
  // anahtar: [zemin (arkadaki yumuşak leke), halka (düğmenin renk halkası), simge, ikinci simge]
  var ORTAM = {
    cayir: ['#c9f0a8', '#8fd16a', 'papatya'], bulut: ['#d6ecff', '#9fd3ff', 'bulut'], dere: ['#bfe9f5', '#5cc8e8', 'nilufer'],
    lavanta: ['#e4d6fb', '#b89cf0', 'lavanta'], gokkusagi: ['#ffd8ec', '#ff9ccf', 'gokkusagi'], dag: ['#d8e1ec', '#9bb0c8', 'dag'],
    parkur: ['#ffe2bc', '#ffb35c', 'bayrak'], gece: ['#a9b0e6', '#4b58b8', 'ay', 'yildiz'], kiraz: ['#ffd6e8', '#ff9fc2', 'sakura'],
    aycicegi: ['#fff1a6', '#ffcf3a', 'aycicek'], mercan: ['#ffd8ce', '#ff8a7a', 'deniz'], kristal: ['#cdf3fa', '#7fdcec', 'kristal'],
    pamuk: ['#fbdcf1', '#f5bfe6', 'pamuk'], sonbahar: ['#f9cb9a', '#e8873a', 'yaprak'], aurora: ['#aee9da', '#36b7a0', 'aurora', 'yildiz'],
    adalar: ['#c8f0de', '#4fc3a1', 'ada'], safak: ['#ffe2c6', '#ffb08a', 'gunes'], mantar: ['#ffcfc8', '#e8584f', 'mantar'],
    gunbatimi: ['#ffcaa8', '#ff8a5c', 'gunbatimi'], kis: ['#e4f3ff', '#bfe3ff', 'kar'], final20: ['#d8c8f6', '#7a4cc7', 'yildiz', 'ay'],
    yagmur: ['#bfe6d4', '#3fae8a', 'damla'], kar: ['#ffffff', '#8ec6f2', 'kar'], sakura: ['#ffd3e6', '#ff8fbf', 'sakura', 'ay'],
    col: ['#f8e2a2', '#e8b44a', 'kaktus'], firtina: ['#c8d0df', '#7d8aa3', 'firtina', 'damla'], balkabagi: ['#f9c996', '#f08a3a', 'balkabagi', 'yaprak'],
    buz: ['#d6f5fd', '#59c8e8', 'buz', 'kar'], palmiye: ['#ffddb4', '#ffa24a', 'palmiye', 'gunes'], bambu: ['#d2eac6', '#6fb84f', 'bambu'],
    seker: ['#ffd2ee', '#ff7ac0', 'seker'], ay: ['#b8bbe2', '#7a7fc0', 'ay', 'yildiz'], lale: ['#d6f1bb', '#ff5a6e', 'lale', 'gokkusagi'],
    isilti: ['#9aa3e0', '#3fd0c8', 'isilti'], sato: ['#ffd6bf', '#c48af0', 'sato', 'bulut'], senlik: ['#b3bdec', '#4b58b8', 'cam', 'kar'],
    balonVadisi: ['#ffdcb8', '#ff8c5a', 'balon', 'gunes'], muzikCayiri: ['#d4f0bc', '#66c266', 'nota'],
    degirmen: ['#dcecff', '#5aa2e0', 'degirmen'], sualti: ['#bceef2', '#26b8c4', 'inci'],
    oyuncak: ['#ffe0ca', '#f26a5a', 'oyuncak'], selale: ['#c2eedc', '#2eb894', 'selale', 'gokkusagi'],
    origami: ['#ffe0dc', '#ef766a', 'turna', 'sakura'], denizFeneri: ['#ffe5b8', '#e6823a', 'fener', 'gunes'],
    gozlemevi: ['#a8b6e6', '#4a5db8', 'gezegen', 'ay'], karnaval: ['#ffd6dc', '#f05a84', 'karnaval', 'gokkusagi']
  };
  var BIYOM_ORTAM = { 21: 'yagmur', 22: 'kar', 23: 'sakura', 24: 'col', 25: 'firtina', 26: 'balkabagi', 27: 'buz', 28: 'palmiye',
    29: 'bambu', 30: 'seker', 31: 'ay', 32: 'lale', 33: 'isilti', 34: 'sato', 35: 'senlik',
    36: 'balonVadisi', 37: 'muzikCayiri', 38: 'degirmen', 39: 'sualti', 40: 'oyuncak',
    41: 'selale', 42: 'origami', 43: 'denizFeneri', 44: 'gozlemevi', 45: 'karnaval' };
  var HAVA_ORTAM = { yagmur: 'yagmur', kar: 'kar', cicek: 'sakura', kum: 'col', firtina: 'firtina', yaprak: 'balkabagi', karhafif: 'buz',
    sis: 'bambu', seker: 'seker', yildiztozu: 'ay', gunesliyagmur: 'lale', isilti: 'isilti' };
  var ZEMIN_ORTAM = { kar: 'kar', buz: 'buz', kum: 'col', seker: 'seker', ay: 'ay', bulut: 'sato', islak: 'yagmur' };
  function ortamAnahtar(n) {
    var b = Array.isArray(window.BOLUMLER) ? window.BOLUMLER[n - 1] : null;
    if (!b) return 'cayir';
    if (typeof b.biyom === 'number' && BIYOM_ORTAM[b.biyom]) return BIYOM_ORTAM[b.biyom];
    if (typeof b.biyom === 'string' && ORTAM[b.biyom]) return b.biyom;
    if (typeof b.tema === 'string' && ORTAM[b.tema]) return b.tema;
    var tk = { buzul: 'buz', kumsal: 'palmiye', gokSato: 'sato', kisSenlik: 'senlik', yagmurluOrman: 'yagmur', karliKoy: 'kar' }[b.tema];
    if (tk) return tk;
    if (typeof b.hava === 'string' && HAVA_ORTAM[b.hava]) return HAVA_ORTAM[b.hava];
    if (typeof b.zeminTur === 'string' && ZEMIN_ORTAM[b.zeminTur]) return ZEMIN_ORTAM[b.zeminTur];
    return b.gece ? 'gece' : 'cayir';
  }
  function simgeSvg(ad) { return '<svg viewBox="0 0 40 40" aria-hidden="true">' + (SIMGE[ad] || SIMGE.yildiz) + '</svg>'; }

  var ilerleme = depoOku();
  var aktifBolum = ilerleme.aktif, kayitliAktif = ilerleme.aktif;
  var acikBolum = ilerleme.acik;
  var bolumYildiz = ilerleme.yildiz;
  var bolumTek = ilerleme.tek; // 5 yıldızı tek uçuşta aldığı bölümler (gökkuşağı madalya)

  function depoOku() {
    var y0 = [];
    for (var k = 0; k < TOPLAM_BOLUM; k++) y0.push(0);
    var varsayilan = { aktif: 1, acik: 1, yildiz: y0, tek: y0.slice() };
    try {
      var ham = localStorage.getItem(DEPO_ANAHTAR);
      if (!ham) return varsayilan;
      var v = JSON.parse(ham);
      if (!v || typeof v !== 'object') return varsayilan;
      var y = Array.isArray(v.yildiz) ? v.yildiz.slice(0, TOPLAM_BOLUM) : [];
      while (y.length < TOPLAM_BOLUM) y.push(0);
      var acik = Math.max(1, Math.min(TOPLAM_BOLUM, (v.acik | 0) || 1));
      // eski (daha az bölümlü) kayıt: son açık bölüm bitirilmişse yeni eklenen bir sonrakini de aç
      if (acik < TOPLAM_BOLUM && (y[acik - 1] | 0) > 0) acik++;
      var aktif = Math.max(1, Math.min(acik, (v.aktif | 0) || 1));
      var tk = Array.isArray(v.tek) ? v.tek.slice(0, TOPLAM_BOLUM) : [];
      while (tk.length < TOPLAM_BOLUM) tk.push(0);
      return { aktif: aktif, acik: acik, yildiz: y.map(function (n) { return Math.max(0, Math.min(5, n | 0)); }), tek: tk.map(function (n) { return n ? 1 : 0; }) };
    } catch (_) { return varsayilan; }
  }
  // Bölüm sayısı her zaman BOLUMLER.length (sonradan eklenen bölümler de sayılır)
  var hepsiAcikMod = Qa.has('hepsiacik');
  function bolumSayGuncelle() {
    var n = Math.max(1, (Array.isArray(window.BOLUMLER) && window.BOLUMLER.length) || 1);
    if (n !== TOPLAM_BOLUM) {
      var eski = TOPLAM_BOLUM;
      TOPLAM_BOLUM = n;
      while (bolumYildiz.length < n) bolumYildiz.push(0);
      while (bolumTek.length < n) bolumTek.push(0);
      // eski son bölüm bitirilmişse yeni eklenen bir sonrakini aç
      if (n > eski && acikBolum === eski && (bolumYildiz[eski - 1] | 0) > 0) acikBolum = eski + 1;
      if (acikBolum > n) acikBolum = n;
      if (aktifBolum > n) aktifBolum = n;
    }
    if (hepsiAcikMod) acikBolum = n;
  }
  function depoKaydet() {
    try {
      localStorage.setItem(DEPO_ANAHTAR, JSON.stringify({ aktif: (basladi || !kayitliAktif) ? aktifBolum : kayitliAktif, acik: acikBolum, yildiz: bolumYildiz, tek: bolumTek }));
    } catch (_) {}
  }

  var html =
    '<div id="baslik">' +
      '<div class="ui-mevsim" aria-hidden="true">' + ['sakura', 'kar', 'yaprak', 'damla', 'lale', 'yildiz', 'kar', 'sakura', 'yaprak', 'isilti'].map(function (ad, k) {
        return '<i style="--k:' + k + '"><b>' + simgeSvg(ad) + '</b></i>';
      }).join('') + '</div>' +
      '<div class="baslik-ust">' +
        '<div class="baslik-yildizcik" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
        '<h1><span class="ust">' + harfler("Pırıl'ın") + '</span><span>' + harfler('Uçuş Okulu') + '</span></h1>' +
      '</div>' +
      '<div class="ui-baslik-dugmeler">' +
        '<button id="oyna" type="button" class="buyuk" aria-label="Oyna"><span class="oyna-parilti" aria-hidden="true"></span><svg viewBox="0 0 100 100" aria-hidden="true"><path d="M34 22 80 50 34 78z" fill="#fff" stroke="#fff" stroke-width="12" stroke-linejoin="round"/></svg></button>' +
        '<button id="ui-harita-baslik" type="button" class="ui-harita-btn" aria-label="Bölüm haritası">' + HARITA_SVG + '</button>' +
      '</div>' +
    '</div>' +
    '<button id="ui-harita-ac" type="button" class="gizli" aria-label="Bölüm haritası"><span class="ui-ha-simge">' + HARITA_SVG + '</span><b id="ui-bolum-no">1</b></button>' +
    '<div id="ui-harita" class="gizli" role="dialog" aria-modal="true" aria-label="Bölüm haritası" data-dugme="1">' +
      '<button id="ui-harita-kapat" type="button" aria-label="Geri dön">' + KAPAT_SVG + '</button>' +
      '<div class="ui-harita-alan">' +
        '<div class="ui-harita-ic">' +
          '<div class="ui-ortam" aria-hidden="true"></div>' +
          '<svg class="ui-yol" aria-hidden="true"><defs class="ui-yol-defs"></defs><path class="ui-yol-golge"/><path class="ui-yol-ana"/><g class="ui-yol-parca"></g><path class="ui-yol-cizgi"/><path class="ui-yol-ilerleme"/></svg>' +
          '<div class="ui-bilbo" aria-hidden="true"><span class="ui-tac">' + TAC_SVG + '</span>' + BILBO_SVG + '</div>' +
          '<nav id="bolumler" aria-label="Bölümler"></nav>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="ui-harita-ok geri" aria-label="Geri kaydır">' + OK_SVG + '</button>' +
      '<button type="button" class="ui-harita-ok ileri" aria-label="İleri kaydır">' + OK_SVG + '</button>' +
    '</div>' +
    '<div id="ui-yardim" aria-hidden="true"><svg class="ui-yb" viewBox="0 0 170 170">' +
      '<g class="yb-balon"><circle cx="106" cy="108" r="36" fill="rgba(178,228,255,.5)" stroke="#5cb8ec" stroke-width="5"/>' +
        '<ellipse cx="92" cy="92" rx="11" ry="6" fill="#fff" opacity=".9" transform="rotate(-35 92 92)"/><circle cx="122" cy="124" r="3.5" fill="#fff" opacity=".7"/></g>' +
      '<g class="yb-pit" stroke="#5cb8ec" stroke-width="5" stroke-linecap="round"><path d="M106 62v-12M140 78l9-8M72 78l-9-8M148 112h12M64 112h-12M136 144l8 7M76 144l-8 7"/></g>' +
      '<path class="yb-iz" d="M52 112C66 84 92 54 126 34" fill="none" stroke="#ffc928" stroke-width="7" stroke-linecap="round" stroke-dasharray="1 15"/>' +
      '<g class="yb-ok"><path d="M124 24l20-6-4 20" fill="none" stroke="#ffc928" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>' +
      '<g class="yb-piril"><svg x="-33" y="-33" width="66" height="66" viewBox="0 0 100 100">' + PIRIL_IC + '</svg></g>' +
    '</svg><svg class="ui-ye" viewBox="0 0 170 170">' +
      '<g class="ye-ruzgar" fill="none" stroke-linecap="round"><path d="M10 62h84c13 0 15-18 3-18" stroke="#8fd3f5" stroke-width="7"/>' +
        '<path d="M20 98h112c14 0 16 20 3 20" stroke="#6cc4f0" stroke-width="7"/><path d="M8 134h70" stroke="#8fd3f5" stroke-width="7"/></g>' +
      '<g class="ye-piril"><g class="ye-cizgi" stroke="#5cb8ec" stroke-width="6" stroke-linecap="round"><path d="M-38 -12h-26M-36 8h-34M-44 -2h-14"/></g><svg x="-33" y="-33" width="66" height="66" viewBox="0 0 100 100">' + PIRIL_IC + '</svg></g>' +
    '</svg></div>' +
    '<div id="sayac" class="gizli" role="status" aria-live="polite" aria-label="Toplanan yıldızlar: 0 / 5"><div class="isik" aria-hidden="true"></div>' + [0, 1, 2, 3, 4].map(function () {
      return '<i aria-hidden="true"><svg viewBox="0 0 100 100"><g class="bos" stroke-linejoin="round">' + YILDIZ + '</g></svg>' +
        '<svg class="dolu" viewBox="0 0 100 100"><g fill="#ffc928" stroke="#f09a00" stroke-width="4" stroke-linejoin="round">' + YILDIZ + '</g>' +
        '<ellipse cx="40" cy="36" rx="9" ry="5" fill="#fff8c8" transform="rotate(-30 40 36)"/></svg></i>';
    }).join('') + '<div class="kivilcim" aria-hidden="true">' + '<b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b>' + '</div></div>' +
    '<div id="kanatlar" class="gizli" role="status" aria-live="polite" aria-label="Kalan kanat hakkı"></div>' +
    '<div id="bolumRozet" class="gizli" aria-hidden="true"></div>' +
    '<div id="kalpler" class="gizli" aria-hidden="true"></div>' +
    '<div id="el" aria-hidden="true"><div class="ui-hayalet"></div><div class="noktalar"></div><div class="iz"></div>' +
      '<div class="ui-birak"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="ui-ucan">' + PIRIL_BAS + '</div><div class="kol"><div class="halka"></div>' +
      '<svg class="parmak" viewBox="0 0 100 100">' + EL_SVG + '</svg></div></div>' +
    '<div id="dokun" aria-hidden="true"><svg viewBox="0 0 170 170">' +
      '<g class="kanat"><path d="M86 92c-6-28 6-52 34-62-4 12-2 20 6 26-10 2-13 8-10 16-9-1-15 4-15 12-6-2-11 0-15 8z" fill="#b48cf0" stroke="#6b45ad" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M84 92c6-28-6-52-34-62 4 12 2 20-6 26 10 2 13 8 10 16 9-1 15 4 15 12 6-2 11 0 15 8z" fill="#b48cf0" stroke="#6b45ad" stroke-width="5" stroke-linejoin="round"/></g>' +
      '<circle class="dalga" cx="96" cy="118" r="26" fill="none" stroke="#fff" stroke-width="6"/>' +
      '<g class="tik"><g transform="translate(68 86) scale(.7)">' + EL_SVG + '</g></g>' +
    '</svg></div>' +
    '<div id="rozet" class="gizli" aria-hidden="true"><div class="isin"></div><div class="ui-gk-isilti"><i></i><i></i><i></i><i></i><i></i><i></i></div><svg viewBox="0 0 120 120">' +
      '<defs><linearGradient id="uiRozetGk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6f9a"/><stop offset=".22" stop-color="#ffa63a"/><stop offset=".42" stop-color="#ffe14a"/><stop offset=".62" stop-color="#5fd36a"/><stop offset=".8" stop-color="#4fb8f0"/><stop offset="1" stop-color="#a77be8"/></linearGradient></defs>' +
      '<path d="M40 70 28 112l16-8 10 14 8-40zM80 70l12 42-16-8-10 14-8-40z" fill="#9b5de5" stroke="#6b45ad" stroke-width="4" stroke-linejoin="round"/>' +
      '<circle class="rz-dis" cx="60" cy="52" r="40" fill="#ffd34d" stroke="#e08a00" stroke-width="5"/><circle class="rz-ic" cx="60" cy="52" r="31" fill="#ffe680"/>' +
      '<g transform="translate(36 28) scale(.48)" fill="#ffb300" stroke="#e08a00" stroke-width="5" stroke-linejoin="round">' + YILDIZ + '</g>' +
      '<g fill="#fff6c0">' + [0, 1, 2, 3, 4].map(function (k) {
        var a = (-90 + k * 72) * Math.PI / 180;
        return '<circle cx="' + (60 + Math.cos(a) * 35.5).toFixed(1) + '" cy="' + (52 + Math.sin(a) * 35.5).toFixed(1) + '" r="3.6"/>';
      }).join('') + '</g>' +
      '<ellipse cx="45" cy="32" rx="9" ry="5" fill="#fff" opacity=".7" transform="rotate(-35 45 32)"/>' +
    '</svg></div>' +
    '<div id="sonrakiKutu" class="gizli">' +
      '<button id="sonraki" type="button" aria-label="Sonraki Bölüm"><span class="ui-parilti" aria-hidden="true"></span>' + OK_SVG + '</button>' +
      '<div class="ui-tekrar-kutu"><button id="tekrar" type="button" class="kucuk-tekrar" aria-label="Bölümü bir daha oyna">' + TEKRAR_SVG + '</button>' +
      '<span id="ui-eksik" aria-hidden="true"></span></div>' +
    '</div>' +
    '<div id="kutlama" class="gizli" role="dialog" aria-modal="true" aria-labelledby="kutlamaBaslik">' +
      '<div class="konfeti" aria-hidden="true">' + new Array(19).join('<i></i>') + '</div>' +
      '<div class="kutlama-kart">' +
        '<div class="kutlama-parilti" aria-hidden="true"></div>' +
        '<div class="kutlama-yildizcik" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>' +
        '<div class="kupa"><svg viewBox="0 0 120 120" aria-hidden="true">' +
          '<circle cx="60" cy="58" r="48" fill="#fff3b0" opacity=".65"/>' +
          '<path d="M35 26h50v24c0 16-11 28-25 28S35 66 35 50V26z" fill="#ffd34d" stroke="#e08a00" stroke-width="5" stroke-linejoin="round"/>' +
          '<path d="M35 32H22c0 14 6 22 15 22M85 32h13c0 14-6 22-15 22" fill="none" stroke="#e08a00" stroke-width="5" stroke-linecap="round"/>' +
          '<rect x="52" y="76" width="16" height="16" rx="3" fill="#e08a00"/><rect x="38" y="90" width="44" height="12" rx="6" fill="#9b5de5" stroke="#6b45ad" stroke-width="4"/>' +
          '<g transform="translate(42 32) scale(.36)" fill="#fff8c8" stroke="#e08a00" stroke-width="6" stroke-linejoin="round">' + YILDIZ + '</g>' +
        '</svg></div>' +
        '<div id="kutlamaBaslik" class="kutlama-baslik">Tebrikler!</div>' +
        '<div class="kutlama-alt">Tüm Bölümler Tamamlandı</div>' +
        '<div class="kutlama-yildiz"><svg viewBox="0 0 100 100" aria-hidden="true"><g fill="#ffc928" stroke="#e08a00" stroke-width="5" stroke-linejoin="round">' + YILDIZ + '</g></svg><span id="toplamYildiz">0 / ' + (TOPLAM_BOLUM * 5) + '</span></div>' +
        '<div class="kutlama-cubuk" aria-hidden="true"><div id="kutlamaCubukDolgu" class="kutlama-cubuk-dolgu"></div></div>' +
        '<div class="kutlama-dugmeler">' +
          '<button id="kutlamaTekrar" type="button" class="kucuk-tekrar" aria-label="Son bölümü bir daha oyna">' + TEKRAR_SVG + '</button>' +
          '<button id="bastan" type="button" aria-label="Baştan Oyna">' + TEKRAR_SVG + '<span>1</span></button>' +
          '<button id="ui-kutlama-harita" type="button" class="ui-harita-btn kucuk" aria-label="Bölüm haritası">' + HARITA_SVG + '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  kok.insertAdjacentHTML('beforeend', html);

  function harfler(s) {
    var k = 0;
    return s.split('').map(function (c) {
      if (c === ' ') return ' ';
      var r = '<b class="h' + (k % 6) + '" style="--i:' + k + '">' + c + '</b>'; k++; return r;
    }).join('');
  }

  var $ = function (id) { return document.getElementById(id); };
  var baslik = $('baslik'), bolumlerEl = $('bolumler'), sayac = $('sayac'), kanatlarEl = $('kanatlar'), bolumRozetEl = $('bolumRozet'), el = $('el'), dokun = $('dokun');
  var sonrakiKutu = $('sonrakiKutu'), sonrakiBtn = $('sonraki'), tekrar = $('tekrar'), rozet = $('rozet'), kalpler = $('kalpler');
  var kutlama = $('kutlama'), toplamYildizEl = $('toplamYildiz'), kutlamaCubukDolgu = $('kutlamaCubukDolgu'), bastanBtn = $('bastan'), kutlamaTekrar = $('kutlamaTekrar');
  var haritaEl = $('ui-harita'), haritaAcBtn = $('ui-harita-ac'), bolumNoEl = $('ui-bolum-no'), haritaAlan = haritaEl.querySelector('.ui-harita-alan');
  var yolSvg = haritaEl.querySelector('.ui-yol'), haritaAcik = false, haritaSutun = 1;
  var haritaIc = haritaEl.querySelector('.ui-harita-ic'), ortamEl = haritaEl.querySelector('.ui-ortam');
  var okGeri = haritaEl.querySelector('.ui-harita-ok.geri'), okIleri = haritaEl.querySelector('.ui-harita-ok.ileri');
  var basladi = false, cekildi = false, kanatGoruldu = false, ucusKanatCirpildi = false, ucusSayisi = 0, beklemeT = 0, oncekiDurum = '';
  var tekrarZaman = 0, dokunZaman = 0, dokunDene = false, sonT = 0, oncekiVy = 0, bolumRozetT = 0;
  var iskaSay = 0, sallaSay = 0, sonIskaX = null, elMod = '', elZorla = false, yildizSay = 0, kavusSay = 0;
  var alinan = [false, false, false, false, false];
  var icBolumDegis = false;
  var sonKanatHak = 0, sonKanatKalan = 0;

  // ───── bölüm haritası: patika üstünde bütün bölümler (ayrı ekran) ─────
  // bölümün görünüşüne göre düğmenin altındaki yumuşak renk halkası (bolumler.js `tema`; bilinmezse sıraya göre renk geçişi)
  var TEMA_RENK = { cayir: '#8fd16a', bulut: '#9fd3ff', dere: '#5cc8e8', lavanta: '#b89cf0', gokkusagi: '#ff9ccf', dag: '#9bb0c8',
    parkur: '#ffb35c', gece: '#4b58b8', kiraz: '#ff9fc2', aycicegi: '#ffcf3a', mercan: '#ff8a7a', kristal: '#7fdcec', pamuk: '#f5bfe6',
    sonbahar: '#e8873a', aurora: '#36b7a0', adalar: '#4fc3a1', safak: '#ffb08a', mantar: '#e8584f', gunbatimi: '#ff8a5c', kis: '#bfe3ff', final20: '#7a4cc7' };
  function temaRenk(n) {
    var b = Array.isArray(window.BOLUMLER) ? window.BOLUMLER[n - 1] : null;
    var t = b && (b.biyom || b.tema);
    if (typeof t === 'string' && TEMA_RENK[t]) return TEMA_RENK[t];
    return (ORTAM[ortamAnahtar(n)] || ORTAM.cayir)[1]; // yeni ortamlar ve sayı biyomlu bölümler (21–50)
  }
  var MINI_YILDIZ ='<svg viewBox="0 0 100 100"><path d="M50 6 63 35l31 3-24 21 7 31-27-16-27 16 7-31L6 38l31-3z"/></svg>';
  function ortamCiz() {
    var out = '';
    for (var i = 1; i <= TOPLAM_BOLUM; i++) {
      var ad = ortamAnahtar(i), o = ORTAM[ad] || ORTAM.cayir, b = window.BOLUMLER[i - 1] || {};
      var s2 = o[3] || o[2];
      if (b.gece && !o[3] && ad !== 'gece') s2 = 'ay';
      out += '<i class="ui-zemin' + (b.gece ? ' gece' : '') + '" data-o="' + ad + '" style="--z:' + o[0] + '"></i>' +
        '<i class="ui-osimge a" style="--gk:' + (i % 5) + '">' + simgeSvg(o[2]) + '</i>' +
        '<i class="ui-osimge b" style="--gk:' + ((i + 2) % 5) + '">' + simgeSvg(s2) + '</i>';
    }
    ortamEl.innerHTML = out;
  }
  var ortamSay = -1;
  function bolumCiz() {
    bolumSayGuncelle();
    if (ortamSay !== TOPLAM_BOLUM) { ortamSay = TOPLAM_BOLUM; ortamCiz(); }
    var hepsi5 = true;
    for (var h = 0; h < TOPLAM_BOLUM; h++) if ((bolumYildiz[h] | 0) < 5) { hepsi5 = false; break; }
    haritaEl.classList.toggle('hepsi5', hepsi5);
    var hepsiTek = hepsi5;
    for (var h2 = 0; hepsiTek && h2 < TOPLAM_BOLUM; h2++) if (!bolumTek[h2]) hepsiTek = false;
    haritaEl.classList.toggle('hepsitek', hepsiTek);
    var zs = ortamEl.querySelectorAll('.ui-zemin');
    for (var zi = 0; zi < zs.length; zi++) zs[zi].classList.toggle('kilit', zi + 1 > acikBolum);
    var out = '';
    for (var i = 1; i <= TOPLAM_BOLUM; i++) {
      var acik = i <= acikBolum;
      var aktif = i === aktifBolum;
      var y = bolumYildiz[i - 1] || 0;
      var tamam = y > 0 || i < acikBolum;
      var sinif = 'bolum-adim' + (aktif ? ' aktif' : '') + (acik ? ' acik' : ' kilit') + (tamam ? ' tamam' : '') + (acik && y > 0 ? ' yildizli' : '') + (y >= 5 ? ' tam5' : '') + (i === TOPLAM_BOLUM ? ' final' : '');
      var icerik = acik ? ('<span class="no">' + i + '</span>') : KILIT_SVG;
      var yildizlar = '';
      if (acik) {
        yildizlar = '<span class="ui-dy" aria-hidden="true">';
        for (var k = 0; k < 5; k++) yildizlar += '<i' + (k < y ? ' class="d"' : '') + '>' + MINI_YILDIZ + '</i>';
        yildizlar += '</span>';
      }
      if (acik && bolumTek[i - 1] && y >= 5) yildizlar += '<span class="ui-tek" aria-hidden="true">' + simgeSvg('gokkusagi') + '</span>';
      var ek = (aktif ? '<span class="ui-piril" aria-hidden="true">' + PIRIL_BAS + '</span>' : '') +
        (i === TOPLAM_BOLUM ? '<span class="ui-kupa" aria-hidden="true">' + KUPA_MINI + '</span>' : '');
      var etiket = 'Bölüm ' + i + (aktif ? ', şu anki bölüm' : '') + (acik ? (y > 0 ? ', ' + y + ' yıldız' : '') : ', kilitli');
      out += '<button type="button" class="' + sinif + '" data-bolum="' + i + '" style="--tema:' + temaRenk(i) + ';--gi:' + i + '" aria-label="' + etiket + '"' + (aktif ? ' aria-current="step"' : '') + (acik ? '' : ' aria-disabled="true"') + '>' +
        icerik + yildizlar + ek + '</button>';
    }
    bolumlerEl.innerHTML = out;
    if (bolumNoEl) bolumNoEl.textContent = aktifBolum;
    if (haritaAcik) haritaYerlestir();
  }
  bolumCiz();

  // Bölümler uzun, kıvrılan bir patikada: yatay ekranda soldan sağa, dikey ekranda yukarıdan aşağı uzanır;
  // parmakla kaydırılır (iri oklarla da). Düğmeler hep iri (80–104 px); yolun sonunda Bilbo'nun pikniği.
  var haritaNokta = [], haritaKapaT = 0, haritaGelT = 0, haritaDonusT = 0, haritaYatay = true, haritaAdim = 140;
  function haritaYerlestir() {
    bolumSayGuncelle();
    var W = haritaAlan.clientWidth, H = haritaAlan.clientHeight, N = TOPLAM_BOLUM;
    if (!W || !H) return;
    var yatay = W >= H, vh = innerHeight / 100, pay = 5 * vh;
    haritaYatay = yatay;
    haritaEl.classList.toggle('yatay', yatay); haritaEl.classList.toggle('dikey', !yatay);
    var s = clampS((yatay ? H : W) * (yatay ? 0.118 : 0.112), 80, 104);
    var adim = haritaAdim = s * 1.62;
    var kapatAlt = pay + 72 + 14; // geri düğmesinin altı
    var cMin, cMax, a0;
    if (yatay) { cMin = kapatAlt + s * 0.58; cMax = H - pay - s * 0.85; a0 = pay + s * 1.0; }
    else { cMin = pay + s * 0.95; cMax = W - pay - s * 0.95; a0 = s * 1.1; }
    var orta = (cMin + cMax) / 2, gen = Math.max(0, (cMax - cMin) / 2);
    function capraz(i) { return orta + gen * Math.sin(i * 0.78 + 1.25); }
    bolumlerEl.style.setProperty('--s', s.toFixed(0) + 'px');
    ortamEl.style.setProperty('--s', s.toFixed(0) + 'px');
    var dugmeler = bolumlerEl.querySelectorAll('.bolum-adim');
    var zeminler = ortamEl.querySelectorAll('.ui-zemin'), simA = ortamEl.querySelectorAll('.ui-osimge.a'), simB = ortamEl.querySelectorAll('.ui-osimge.b');
    var odak = Math.max(1, Math.min(N, acikBolum));
    haritaNokta.length = 0;
    for (var i = 0; i < N; i++) {
      var al = a0 + i * adim, cr = capraz(i);
      haritaNokta.push(yatay ? [al, cr] : [cr, al]);
    }
    // Bilbo: patikanın sonunda
    var bAl = a0 + N * adim + s * 0.45, bCr = orta + (capraz(N) - orta) * 0.5;
    var bw = s * 2.5, bilboM = yatay ? [bAl, bCr] : [bCr, bAl];
    var uzun = bAl + bw * (yatay ? 0.5 : 0.36) + pay + 10;
    haritaIc.style.width = (yatay ? uzun : W).toFixed(0) + 'px';
    haritaIc.style.height = (yatay ? H : uzun).toFixed(0) + 'px';
    var zb = adim * 1.9, ss = s * 0.56;
    for (var j = 0; j < N; j++) {
      var x = haritaNokta[j][0], y = haritaNokta[j][1];
      if (dugmeler[j]) {
        dugmeler[j].style.left = (x - s / 2).toFixed(1) + 'px'; dugmeler[j].style.top = (y - s / 2).toFixed(1) + 'px';
        dugmeler[j].style.setProperty('--gi', Math.min(14, Math.abs(j + 1 - odak)));
      }
      if (zeminler[j]) {
        zeminler[j].style.left = (x - zb / 2).toFixed(1) + 'px'; zeminler[j].style.top = (y - zb / 2).toFixed(1) + 'px';
        zeminler[j].style.width = zeminler[j].style.height = zb.toFixed(0) + 'px';
      }
      // ortam simgeleri yolun iki yanında (yola dik), komşu düğmelere değmeden
      var p0 = haritaNokta[Math.max(0, j - 1)], p1 = j + 1 < N ? haritaNokta[j + 1] : bilboM;
      var tx = p1[0] - p0[0], ty = p1[1] - p0[1], tl = Math.sqrt(tx * tx + ty * ty) || 1;
      var nx = -ty / tl, ny = tx / tl, uz = s * 1.08;
      if (yatay ? ny > 0 : nx < 0) { nx = -nx; ny = -ny; } // a: üstte (yatay) / sağda (dikey)
      var ka = yatay ? 0.92 : 1.0, kb = yatay ? 1.12 : 1.0; // altta yıldız sırası var: biraz daha uzak
      if (simA[j]) { simA[j].style.left = (x + nx * uz * ka - ss / 2 - tx / tl * s * 0.18).toFixed(1) + 'px'; simA[j].style.top = (y + ny * uz * ka - ss / 2).toFixed(1) + 'px'; }
      if (simB[j]) { simB[j].style.left = (x - nx * uz * kb - ss / 2 + tx / tl * s * 0.18).toFixed(1) + 'px'; simB[j].style.top = (y - ny * uz * kb - ss / 2).toFixed(1) + 'px'; }
    }
    var bilbo = haritaEl.querySelector('.ui-bilbo');
    bilbo.style.width = bw.toFixed(0) + 'px'; bilbo.style.height = (bw * 0.75).toFixed(0) + 'px';
    bilbo.style.left = (bilboM[0] - bw / 2).toFixed(0) + 'px'; bilbo.style.top = (bilboM[1] - bw * 0.42).toFixed(0) + 'px';
    var giris = yatay ? [bilboM[0] - bw * 0.3, bilboM[1] + bw * 0.14] : [bilboM[0] - bw * 0.05, bilboM[1] - bw * 0.1];
    var yolN = haritaNokta.concat([giris]);
    var iw = yatay ? uzun : W, ih = yatay ? H : uzun;
    yolSvg.setAttribute('viewBox', '0 0 ' + iw.toFixed(0) + ' ' + ih.toFixed(0));
    var tam = yolYap(yolN, N + 1), ilerle = yolYap(haritaNokta, Math.min(N, acikBolum));
    yolSvg.querySelector('.ui-yol-golge').setAttribute('d', tam); yolSvg.querySelector('.ui-yol-ana').setAttribute('d', tam);
    yolSvg.querySelector('.ui-yol-ilerleme').setAttribute('d', ilerle); yolSvg.querySelector('.ui-yol-cizgi').setAttribute('d', tam);
    yolParcaCiz(yolN, N + 1);
    yolSvg.style.setProperty('--yk', (s * 0.42).toFixed(0) + 'px');
    okGuncelle();
  }
  // n. bölümü ekranın ortasına getir
  function haritaOdakla(n, yumusak) {
    var nk = haritaNokta[Math.max(0, Math.min(haritaNokta.length - 1, (n | 0) - 1))];
    if (!nk) return;
    var hedef = haritaYatay ? nk[0] - haritaAlan.clientWidth / 2 : nk[1] - haritaAlan.clientHeight / 2;
    var o = haritaYatay ? { left: hedef, top: 0 } : { top: hedef, left: 0 };
    if (yumusak && haritaAlan.scrollTo) { o.behavior = 'smooth'; haritaAlan.scrollTo(o); }
    else { if (haritaYatay) haritaAlan.scrollLeft = hedef; else haritaAlan.scrollTop = hedef; }
    okGuncelle();
  }
  function kaydirmaDurum() {
    var bas = haritaYatay ? haritaAlan.scrollLeft : haritaAlan.scrollTop;
    var son = haritaYatay ? haritaAlan.scrollWidth - haritaAlan.clientWidth : haritaAlan.scrollHeight - haritaAlan.clientHeight;
    return { bas: bas, son: son };
  }
  var okAnahtar = '';
  function okGuncelle() {
    var k = kaydirmaDurum();
    var g = k.bas > 6, i = k.bas < k.son - 6, a = (g ? 1 : 0) + '' + (i ? 1 : 0);
    if (a === okAnahtar) return;
    okAnahtar = a;
    okGeri.classList.toggle('yok', !g); okIleri.classList.toggle('yok', !i);
  }
  haritaAlan.addEventListener('scroll', okGuncelle, { passive: true });
  function okKaydir(yon) {
    sesAc();
    var boy = (haritaYatay ? haritaAlan.clientWidth : haritaAlan.clientHeight) * 0.7 * yon;
    var o = haritaYatay ? { left: boy, top: 0, behavior: 'smooth' } : { top: boy, left: 0, behavior: 'smooth' };
    if (haritaAlan.scrollBy) haritaAlan.scrollBy(o);
    else if (haritaYatay) haritaAlan.scrollLeft += boy; else haritaAlan.scrollTop += boy;
  }
  okGeri.addEventListener('click', function () { okKaydir(-1); });
  okIleri.addEventListener('click', function () { okKaydir(1); });
  // fareyle de sürüklenebilsin (parmakla tarayıcının kendi kaydırması çalışır)
  var surukle = null, sonSurukT = 0;
  haritaAlan.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    surukle = { x: e.clientX, y: e.clientY, sl: haritaAlan.scrollLeft, st: haritaAlan.scrollTop, oynadi: false };
  });
  window.addEventListener('pointermove', function (e) {
    if (!surukle) return;
    if (!(e.buttons & 1)) { surukleBitir(); return; }
    var dx = e.clientX - surukle.x, dy = e.clientY - surukle.y;
    if (!surukle.oynadi && Math.abs(dx) + Math.abs(dy) > 8) { surukle.oynadi = true; basiliTemizle(); }
    if (surukle.oynadi) { haritaAlan.scrollLeft = surukle.sl - dx; haritaAlan.scrollTop = surukle.st - dy; }
  });
  function surukleBitir() {
    if (!surukle) return;
    if (surukle.oynadi) sonSurukT = performance.now();
    surukle = null;
  }
  document.addEventListener('pointerup', surukleBitir, true);
  document.addEventListener('pointercancel', surukleBitir, true);
  haritaAlan.addEventListener('dragstart', function (e) { e.preventDefault(); });
  haritaAlan.addEventListener('click', function (e) {
    if (performance.now() - sonSurukT < 300) { e.stopPropagation(); e.preventDefault(); }
  }, true);
  // patika ortamdan ortama renk ve doku değiştirir: karda beyaz + kar taneleri, çölde kum, ayda gri kraterler, şekerde pembe…
  var YOL_RENK = { kar: '#ffffff', buz: '#dff6ff', kis: '#f6fbff', senlik: '#eef2ff', col: '#f0cd78', palmiye: '#f5d496', ay: '#b8bbd3',
    seker: '#ffbfe2', pamuk: '#ffd6ee', sakura: '#ffcfe4', kiraz: '#ffd8ea', yagmur: '#bde4d4', firtina: '#c6cfdf', balkabagi: '#f4bc80',
    sonbahar: '#f4c48e', isilti: '#c2c8ff', gece: '#d4d7f4', aurora: '#c4ece2', bambu: '#cde7ba', lale: '#d5efbd', sato: '#ffdcee', mercan: '#ffd6ca', cayir: '#e9f6cf' };
  var YOL_DOKU = { kar: 'kar', buz: 'kar', kis: 'kar', senlik: 'kar', col: 'kum', palmiye: 'kum', ay: 'ay', seker: 'seker', pamuk: 'seker',
    sakura: 'cicek', kiraz: 'cicek', yagmur: 'damla', firtina: 'damla', balkabagi: 'yaprak', sonbahar: 'yaprak', isilti: 'isik' };
  function segD(n, i, adet) {
    var p0 = n[Math.max(0, i - 1)], p1 = n[i], p2 = n[i + 1], p3 = n[Math.min(adet - 1, i + 2)], k = 0.42;
    return 'M' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + 'C' + (p1[0] + (p2[0] - p0[0]) * k / 2 * 1.2).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) * k / 2).toFixed(1) + ' ' +
      (p2[0] - (p3[0] - p1[0]) * k / 2 * 1.2).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) * k / 2).toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
  }
  function yolParcaCiz(n, adet) {
    var g = '', defs = '', N = adet - 1;
    for (var i = 0; i < adet - 1; i++) {
      var a = ortamAnahtar(i + 1), b = i + 1 < N ? ortamAnahtar(i + 2) : a;
      var ra = YOL_RENK[a] || '#fff6e2', rb = YOL_RENK[b] || '#fff6e2', d = segD(n, i, adet), renk = ra;
      if (ra !== rb) { // ortam sınırında renk yumuşakça geçsin
        var id = 'uiYg' + i;
        defs += '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + n[i][0].toFixed(0) + '" y1="' + n[i][1].toFixed(0) + '" x2="' + n[i + 1][0].toFixed(0) + '" y2="' + n[i + 1][1].toFixed(0) + '">' +
          '<stop offset=".3" stop-color="' + ra + '"/><stop offset=".7" stop-color="' + rb + '"/></linearGradient>';
        renk = 'url(#' + id + ')';
      }
      g += '<path class="ui-yp" d="' + d + '" stroke="' + renk + '"/>';
      var dk = YOL_DOKU[a];
      if (dk) g += '<path class="ui-yd ' + dk + '" d="' + d + '"/>';
    }
    yolSvg.querySelector('.ui-yol-defs').innerHTML = defs;
    yolSvg.querySelector('.ui-yol-parca').innerHTML = g;
  }
  // noktalardan geçen yumuşak eğri (Catmull-Rom → Bezier)
  function yolYap(n, adet) {
    if (adet < 1) return '';
    var d = 'M' + n[0][0].toFixed(1) + ' ' + n[0][1].toFixed(1);
    for (var i = 0; i < adet - 1; i++) {
      var p0 = n[Math.max(0, i - 1)], p1 = n[i], p2 = n[i + 1], p3 = n[Math.min(adet - 1, i + 2)];
      var k = 0.42;
      d += 'C' + (p1[0] + (p2[0] - p0[0]) * k / 2 * 1.2).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) * k / 2).toFixed(1) + ' ' +
        (p2[0] - (p3[0] - p1[0]) * k / 2 * 1.2).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) * k / 2).toFixed(1) + ' ' +
        p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }
  function haritaAc() {
    if (haritaAcik) return;
    sesAc();
    haritaAcik = true; ARAYUZ.haritaAcik = true;
    if (!basladi && !Qa.has('bolum') && kayitliAktif > 1 && kayitliAktif <= acikBolum) aktifBolum = kayitliAktif;
    bolumCiz();
    clearTimeout(haritaKapaT); haritaEl.classList.remove('kapan');
    kok.classList.add('ui-harita-acik'); // arkadaki başlık/düğmeler karışmasın
    haritaEl.classList.remove('gizli');
    yeniden(haritaEl, 'gel');
    haritaYerlestir();
    haritaOdakla(acikBolum, false); // en son açılan bölüm ortada
    clearTimeout(haritaGelT);
    haritaGelT = setTimeout(function () { haritaEl.classList.remove('gel'); }, 80 + 14 * 22 + 600); // giriş bitince sallanma/nabız serbest
    elGoster(false);
    var akt = bolumlerEl.querySelector('.bolum-adim.aktif');
    if (akt) try { akt.focus({ preventScroll: true }); } catch (_) {}
  }
  function haritaKapat() {
    if (!haritaAcik) return;
    haritaAcik = false; ARAYUZ.haritaAcik = false;
    haritaEl.classList.remove('gel');
    haritaEl.classList.add('kapan');
    kok.classList.remove('ui-harita-acik');
    kok.classList.add('ui-harita-donus'); // arkadakiler yumuşakça geri gelsin
    clearTimeout(haritaDonusT);
    haritaDonusT = setTimeout(function () { kok.classList.remove('ui-harita-donus'); }, 450);
    clearTimeout(haritaKapaT);
    haritaKapaT = setTimeout(function () { if (!haritaAcik) haritaEl.classList.add('gizli'); haritaEl.classList.remove('kapan'); }, 260);
    beklemeT = 0;
  }

  bolumlerEl.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('.bolum-adim');
    if (!b) return;
    sesAc();
    var n = parseInt(b.getAttribute('data-bolum'), 10);
    if (!n || n > acikBolum) {
      yeniden(b, 'salla-kilit');
      return;
    }
    yeniden(b, 'ui-secildi');
    setTimeout(function () {
      haritaKapat();
      if (!basladi) basla(false, n);
      else bolumGec(n);
    }, 180);
  });

  bolumlerEl.addEventListener('keydown', function (e) {
    var b = e.target && e.target.closest && e.target.closest('.bolum-adim');
    if (!b) return;
    var n = parseInt(b.getAttribute('data-bolum'), 10);
    if (!n) return;
    var hedef = 0;
    if (e.key === 'ArrowRight') hedef = Math.min(TOPLAM_BOLUM, n + 1);
    else if (e.key === 'ArrowLeft') hedef = Math.max(1, n - 1);
    else if (e.key === 'ArrowDown') hedef = Math.min(TOPLAM_BOLUM, n + haritaSutun);
    else if (e.key === 'ArrowUp') hedef = Math.max(1, n - haritaSutun);
    else if (e.key === 'Escape') { haritaKapat(); return; }
    else if (e.key === 'Home') hedef = 1;
    else if (e.key === 'End') hedef = TOPLAM_BOLUM;
    if (!hedef || hedef === n) return;
    e.preventDefault();
    var btn = bolumlerEl.querySelector('.bolum-adim[data-bolum="' + hedef + '"]');
    if (btn) btn.focus();
  });

  function bolumAdiAl(n, v) {
    if (v && v.bolum && typeof v.bolum === 'object' && v.bolum.ad) return v.bolum.ad;
    if (v && typeof v.ad === 'string' && v.ad) return v.ad;
    if (Array.isArray(window.BOLUMLER) && window.BOLUMLER[n - 1] && window.BOLUMLER[n - 1].ad) {
      return window.BOLUMLER[n - 1].ad;
    }
    return '';
  }
  function bolumKanatHakAl(n, v) {
    if (v && v.bolum && typeof v.bolum === 'object' && typeof v.bolum.kanatHak === 'number') {
      return Math.max(0, v.bolum.kanatHak | 0);
    }
    if (v && typeof v.kanatHak === 'number') return Math.max(0, v.kanatHak | 0);
    if (Array.isArray(window.BOLUMLER) && window.BOLUMLER[n - 1] && typeof window.BOLUMLER[n - 1].kanatHak === 'number') {
      return Math.max(0, window.BOLUMLER[n - 1].kanatHak | 0);
    }
    return kanatDurumAl().hak;
  }
  function bolumRozetGizle() {
    clearTimeout(bolumRozetT);
    bolumRozetT = 0;
    bolumRozetEl.classList.remove('goster');
    bolumRozetEl.classList.add('gizli');
  }
  function bolumRozetGoster() {
    bolumRozetGizle();
  }

  function bolumGec(n) {
    bolumSayGuncelle();
    n = Math.max(1, Math.min(TOPLAM_BOLUM, n | 0));
    if (n > acikBolum) acikBolum = n;
    aktifBolum = n;
    depoKaydet();
    bolumCiz();
    sonEkranGizle();
    sayacBosalt();
    beklemeT = 0;
    icBolumDegis = true;
    if (window.UCUS && typeof UCUS.bolumSec === 'function') UCUS.bolumSec(n);
    else if (window.UCUS && typeof UCUS.yeniden === 'function') UCUS.yeniden(n);
    else emit('yeniden', { bolum: n });
    emit('bolum', { bolum: n });
    icBolumDegis = false;
    if (basladi && !sayac.classList.contains('gizli')) bolumRozetGoster(n);
  }

  // ───── sayfa davranışları: kaydırma, yakınlaştırma, çift dokunma, uzun basma menüsü kapalı ─────
  function dugmeMi(e) { var t = e.target; return !!(t && t.closest && t.closest('button')); }
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (ad) {
    document.addEventListener(ad, function (e) { e.preventDefault(); }, { passive: false });
  });
  // bölüm haritası kendi içinde parmakla kayar: onun dokunuşlarını engelleme
  function haritaKaydirMi(e) { var t = e.target; return !!(haritaAcik && t && t.closest && t.closest('.ui-harita-alan')); }
  document.addEventListener('touchmove', function (e) { if (e.touches.length > 1 || !haritaKaydirMi(e)) e.preventDefault(); }, { passive: false });
  document.addEventListener('touchstart', function (e) { if (e.touches.length > 1 && !dugmeMi(e)) e.preventDefault(); }, { passive: false });
  var sonDokunus = 0;
  document.addEventListener('touchend', function (e) {
    var s = Date.now();
    if (s - sonDokunus < 350 && !dugmeMi(e) && !haritaKaydirMi(e)) e.preventDefault(); // çift dokunma yakınlaştırması
    sonDokunus = s;
  }, { passive: false });
  document.addEventListener('dblclick', function (e) { e.preventDefault(); });
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('selectstart', function (e) { e.preventDefault(); });
  window.addEventListener('wheel', function (e) { if (e.ctrlKey) e.preventDefault(); }, { passive: false });

  // Arayüzdeki dokunuşlar oyuna (çek-bırak) karışmasın.
  [baslik, haritaEl, haritaAcBtn, sonrakiKutu, kutlama].forEach(function (d) {
    ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup'].forEach(function (ad) {
      d.addEventListener(ad, function (e) { e.stopPropagation(); }, { passive: true });
    });
  });

  function emit(ad, v) { if (typeof OLAY !== 'undefined' && OLAY.emit) OLAY.emit(ad, v); }
  function sesAc() { try { if (typeof SES !== 'undefined' && SES.hazir) SES.hazir(); } catch (_) {} }
  // iPad Safari'de arayüz düğmeleri stopPropagation() yapsa bile hem düğmelerde hem sahneye ilk dokunuşta ses kilidi açılsın.
  document.addEventListener('pointerdown', sesAc, { capture: true, passive: true });
  function yeniden(d, sinif) { d.classList.remove(sinif); void d.offsetWidth; d.classList.add(sinif); }

  // iPad dokunmatik ve fare basışlarında 0ms :active hissi için .basili sınıfı
  var basiliBtn = null;
  function basiliTemizle() {
    if (basiliBtn) { basiliBtn.classList.remove('basili'); basiliBtn = null; }
  }
  kok.addEventListener('pointerdown', function (e) {
    var b = e.target && e.target.closest && e.target.closest('button');
    basiliTemizle();
    if (b && !b.classList.contains('kilit') && b.getAttribute('aria-disabled') !== 'true') {
      basiliBtn = b;
      b.classList.add('basili');
    }
  }, { passive: true });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ad) {
    window.addEventListener(ad, basiliTemizle, { passive: true });
  });
  kok.addEventListener('pointerleave', function (e) {
    if (basiliBtn && e.target === basiliBtn) basiliTemizle();
  }, true);
  window.addEventListener('blur', basiliTemizle);
  document.addEventListener('visibilitychange', basiliTemizle);

  var ARAYUZ = window.ARAYUZ = {
    basla: basla,
    bolum: bolumGec,
    mekanik: function (ad) { try { if (typeof SES !== 'undefined' && SES.mekanik) SES.mekanik(ad); } catch (_) {} },
    baslikAcik: !(Qa.has('atla') || Qa.has('oto')),
    haritaAcik: false,
    harita: function (ac) { if (ac === false) haritaKapat(); else haritaAc(); }
  };
  $('ui-harita-baslik').addEventListener('click', haritaAc);
  haritaAcBtn.addEventListener('click', haritaAc);
  $('ui-kutlama-harita').addEventListener('click', haritaAc);
  $('ui-harita-kapat').addEventListener('click', function () { sesAc(); haritaKapat(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && haritaAcik) haritaKapat(); });

  function basla(atla, secilenBolum) {
    if (basladi) return;
    basladi = true; ARAYUZ.baslikAcik = false;
    sesAc();
    baslik.setAttribute('aria-hidden', 'true');
    $('oyna').tabIndex = -1;
    bolumlerEl.classList.remove('baslikta');
    if (atla) baslik.classList.add('gizli');
    else { baslik.classList.add('kapan'); setTimeout(function () { baslik.classList.add('gizli'); }, 700); }
    setTimeout(function () {
      sayac.classList.remove('gizli');
      yeniden(sayac, 'gel');
      haritaAcBtn.classList.remove('gizli');
      yeniden(haritaAcBtn, 'gel');
      if (!atla) bolumRozetGoster(aktifBolum);
    }, atla ? 0 : 450);
    beklemeT = 0;
    // "oyna": kaldığı bölümden devam (adres çubuğunda bölüm seçilmediyse)
    if (!secilenBolum && !atla && !Qa.has('bolum') && kayitliAktif > 1 && kayitliAktif <= acikBolum) secilenBolum = kayitliAktif;
    var oyunNo = 0;
    try { oyunNo = (window.UCUS && UCUS.bolumBilgi) ? (UCUS.bolumBilgi().no | 0) : aktifBolum; } catch (_) { oyunNo = aktifBolum; }
    if (secilenBolum && secilenBolum !== oyunNo) bolumGec(secilenBolum);
    else if (aktifBolum === 1 && !atla) {
      setTimeout(function () {
        if (!cekildi && typeof SES !== 'undefined' && SES.sonraSoyle) SES.sonraSoyle('bolum1');
      }, 900);
    }
    emit('basla');
  }
  $('oyna').addEventListener('click', function () { basla(false); });

  function tekrarBaslat() {
    sesAc();
    sonEkranGizle();
    if (window.UCUS && typeof UCUS.yeniden === 'function') UCUS.yeniden(aktifBolum); else emit('yeniden', { bolum: aktifBolum });
  }
  tekrar.addEventListener('click', tekrarBaslat);
  kutlamaTekrar.addEventListener('click', tekrarBaslat);

  sonrakiBtn.addEventListener('click', function () {
    sesAc();
    var hedef = Math.min(TOPLAM_BOLUM, aktifBolum + 1);
    if (window.UCUS && typeof UCUS.sonrakiBolum === 'function') {
      sonEkranGizle(); sayacBosalt(); beklemeT = 0;
      aktifBolum = hedef; if (hedef > acikBolum) acikBolum = hedef;
      depoKaydet(); bolumCiz();
      UCUS.sonrakiBolum();
    } else {
      bolumGec(hedef);
    }
  });

  bastanBtn.addEventListener('click', function () {
    sesAc();
    bolumGec(1);
  });

  // ───── yıldız sayacı ─────
  function sayacBosalt() {
    var i = sayac.querySelectorAll('i');
    for (var k = 0; k < i.length; k++) i[k].classList.remove('tamam');
    sayac.classList.remove('hepsi');
    sayac.setAttribute('aria-label', 'Toplanan yıldızlar: 0 / 5');
    yildizSay = 0; alinan = [false, false, false, false, false];
  }
  // oyunun o anki yıldız sayısı (bölüm içinde birikir: ıskada ve "bir daha"da kalır)
  function sayacEsitle() {
    var b = null;
    try { b = (window.UCUS && UCUS.bilgi) ? UCUS.bilgi() : null; } catch (_) { b = null; }
    if (!b) return;
    var n = Math.max(0, Math.min(5, (typeof b.yildiz === 'number' ? b.yildiz : (b.yildizToplam | 0)) | 0));
    var al = Array.isArray(b.yildizAlindi) ? b.yildizAlindi : (Array.isArray(b.alinan) ? b.alinan : null);
    for (var k = 0; k < 5; k++) alinan[k] = al ? !!al[k] : false;
    if (n === yildizSay) return;
    yildizSay = n;
    var i = sayac.querySelectorAll('i');
    for (var j = 0; j < i.length; j++) i[j].classList.toggle('tamam', j < n);
    sayac.classList.toggle('hepsi', n >= 5);
    sayac.setAttribute('aria-label', 'Toplanan yıldızlar: ' + n + ' / 5');
  }
  // kavuşmada eksik yıldızlar "bir daha" düğmesinin altında soluk yıldız olarak davet eder
  var eksikEl = null, kavusYildiz = 0, kavusTek = false, kosBitis = 0;
  function eksikCiz(n) {
    if (!eksikEl) eksikEl = $('ui-eksik');
    var s = '';
    for (var k = 0; k < n; k++) s += '<i style="--ek:' + k + '">' + MINI_YILDIZ + '</i>';
    eksikEl.innerHTML = s;
    sonrakiKutu.classList.toggle('eksikli', n > 0);
  }
  function sayacDoldur(n) {
    var i = sayac.querySelectorAll('i');
    for (var k = 0; k < i.length; k++) i[k].classList.toggle('tamam', k < n);
    sayac.setAttribute('aria-label', 'Toplanan yıldızlar: ' + Math.max(0, Math.min(5, n | 0)) + ' / 5');
    if (n < 5) sayac.classList.remove('hepsi');
    yeniden(sayac, 'zipla');
    if (n >= 5) setTimeout(function () { if (yildizSay >= 5) yeniden(sayac, 'hepsi'); }, 250);
  }
  function yildizAl(v) {
    var n = (v && typeof v.toplam === 'number') ? v.toplam : yildizSay + 1;
    if (v && typeof v.i === 'number' && v.i >= 0 && v.i < 5) alinan[v.i] = true;
    yildizSay = n;
    setTimeout(function () { if (yildizSay >= n) sayacDoldur(n); }, 620); // efektteki uçan yıldız sayaca varınca
  }

  // ───── kavuşma: "Sonraki Bölüm ▶" + küçük "Bir Daha", 20. bölüm kutlaması, rozet, kalpler ─────
  function kalpCiz(yeni) {
    var n = Math.min(kavusSay, 8), s = '';
    for (var k = 0; k < n; k++) s += '<i' + (yeni && k === n - 1 ? ' class="yeni"' : '') + '><svg viewBox="0 0 100 100">' + KALP + '</svg></i>';
    kalpler.innerHTML = s;
  }
  function kanatDurumAl() {
    var b = (window.UCUS && typeof UCUS.bilgi === 'function') ? UCUS.bilgi()
      : ((window.UCUS && typeof UCUS.bolumBilgi === 'function') ? UCUS.bolumBilgi() : null);
    if (!b) return { hak: 0, kalan: 0 };
    return { hak: Math.max(0, b.kanatHak | 0), kalan: Math.max(0, b.kanatKalan | 0) };
  }
  function kanatGizle() {
    kanatlarEl.classList.add('gizli');
    kanatlarEl.classList.remove('az-kaldi', 'bitti');
    sonKanatHak = 0;
    sonKanatKalan = 0;
  }
  function kanatGuncelle(hak, kalan, canlandir) {
    var dk = durumAl();
    if (hak <= 0 || !(dk === 'ucus' || dk === 'bekle' || dk === 'cek')) { // fırlatmadan önce de kaç kanadı olduğunu görsün
      kanatGizle();
      return;
    }
    var ikonlar = kanatlarEl.querySelectorAll('i');
    var yenile = (hak !== sonKanatHak) || (kalan > sonKanatKalan) || ikonlar.length !== hak;
    if (yenile) {
      var out = '';
      for (var i = 0; i < hak; i++) {
        out += '<i' + (i >= kalan ? ' class="sonuk"' : '') + '>' + KANAT_SVG + '</i>';
      }
      kanatlarEl.innerHTML = out;
      if (kanatlarEl.classList.contains('gizli')) {
        kanatlarEl.classList.remove('gizli');
        yeniden(kanatlarEl, 'gel');
      }
    } else {
      if (kanatlarEl.classList.contains('gizli')) {
        kanatlarEl.classList.remove('gizli');
        yeniden(kanatlarEl, 'gel');
      }
      for (var k = 0; k < ikonlar.length; k++) {
        var sonukMu = k >= kalan;
        if (sonukMu && !ikonlar[k].classList.contains('sonuk')) {
          ikonlar[k].classList.add('sonuk');
          if (canlandir) yeniden(ikonlar[k], 'cirp');
        } else if (!sonukMu && ikonlar[k].classList.contains('sonuk')) {
          ikonlar[k].classList.remove('sonuk', 'cirp');
        }
      }
      var sayiEl = kanatlarEl.querySelector('.kanat-sayi');
      if (sayiEl) sayiEl.textContent = kalan + '/' + hak;
    }
    kanatlarEl.classList.toggle('az-kaldi', kalan === 1 && hak > 1);
    kanatlarEl.classList.toggle('bitti', kalan <= 0);
    kanatlarEl.setAttribute('aria-label', 'Kalan kanat hakkı: ' + kalan + ' / ' + hak);
    sonKanatHak = hak;
    sonKanatKalan = kalan;
  }
  function sonEkranGizle() {
    tekrarZaman = 0;
    sonX = null; sonY = null;
    dokunX = null; dokunY = null;
    sonrakiKutu.classList.add('gizli');
    sonrakiKutu.classList.remove('gel');
    kutlama.classList.add('gizli');
    kutlama.classList.remove('gel');
    rozet.classList.add('gizli');
    kalpler.classList.add('gizli');
    kanatGizle();
    bolumRozetGizle();
  }

  function toplamYildizHesapla() {
    var top = 0;
    for (var i = 0; i < TOPLAM_BOLUM; i++) top += (bolumYildiz[i] || 0);
    return top;
  }

  function bagla() {
    if (typeof OLAY === 'undefined' || !OLAY.on) return false;
    OLAY.on('yildiz', yildizAl);
    OLAY.on('cek', function (c) { if (c && c.guc > 0.05) { cekildi = true; beklemeT = 0; } });
    OLAY.on('kanat', function (v) {
      kanatGoruldu = true; ucusKanatCirpildi = true; dokunGoster(false);
      var kd = kanatDurumAl();
      var hak = (v && typeof v.toplam === 'number') ? (v.toplam | 0) : kd.hak;
      var kalan = (v && typeof v.kalan === 'number') ? (v.kalan | 0) : kd.kalan;
      if (durumAl() === 'ucus' && hak > 0) kanatGuncelle(hak, kalan, true);
    });
    // kanat hakkı bitmişken havada dokunuş: göstergede tatlı, minik bir "boş" kıpırtısı (ceza değil)
    OLAY.on('kanatBos', function () {
      if (!kanatlarEl.classList.contains('gizli')) yeniden(kanatlarEl, 'ui-bos');
    });
    OLAY.on('salla', function () { sallaSay++; if (sallaSay >= 2) { sallaSay = 0; elMod = 'cok'; elZorla = true; } });
    OLAY.on('iska', function (v) {
      iskaSay++;
      sonIskaX = (v && typeof v.x === 'number') ? v.x : null;
      if (iskaSay >= 2) {
        iskaSay = 0; elZorla = true;
        var hx = (typeof D !== 'undefined') ? D.hedef.x : 46;
        elMod = (sonIskaX !== null && sonIskaX > hx + 2.5) ? 'az' : 'cok';
      }
    });
    OLAY.on('bolum', function (v) {
      if (icBolumDegis) return;
      if (v && v.hepsiAcik) hepsiAcikMod = true;
      bolumSayGuncelle();
      var b = typeof v === 'number' ? v : (v && (typeof v.bolum === 'number' ? v.bolum : v.no));
      if (!b) return;
      aktifBolum = Math.max(1, Math.min(TOPLAM_BOLUM, b | 0));
      if (aktifBolum > acikBolum) acikBolum = aktifBolum;
      if (v && typeof v.acik === 'number') acikBolum = Math.max(acikBolum, Math.min(TOPLAM_BOLUM, v.acik | 0));
      if (v && Array.isArray(v.yildizlar)) { // oyunun kendi kaydıyla birleştir (en iyisi kalsın)
        for (var yi = 0; yi < TOPLAM_BOLUM && yi < v.yildizlar.length; yi++) {
          var yv = Math.max(0, Math.min(5, v.yildizlar[yi] | 0));
          if (yv > (bolumYildiz[yi] || 0)) bolumYildiz[yi] = yv;
        }
      }
      depoKaydet();
      bolumCiz();
      sonEkranGizle();
      sayacBosalt();
      beklemeT = 0;
      if (basladi && !sayac.classList.contains('gizli')) bolumRozetGoster(aktifBolum, v);
    });
    OLAY.on('kavus', function (v) {
      elGoster(false); dokunGoster(false);
      bolumRozetGizle();
      iskaSay = 0; sallaSay = 0; elZorla = false; elMod = '';
      kavusSay++;
      bolumSayGuncelle();
      var vb = v && (typeof v.bolum === 'number' ? v.bolum : v.no);
      if (typeof vb === 'number') aktifBolum = Math.max(1, Math.min(TOPLAM_BOLUM, vb | 0));
      else if (v && typeof v.bolumIdx === 'number') aktifBolum = Math.max(1, Math.min(TOPLAM_BOLUM, (v.bolumIdx | 0) + 1));
      var y = Math.max(yildizSay, (v && typeof v.yildiz === 'number') ? v.yildiz : 0);
      kavusYildiz = Math.min(5, y); kavusTek = !!(v && v.tekAtis) && y >= 5;
      if (kavusTek) bolumTek[aktifBolum - 1] = 1;
      eksikCiz(5 - kavusYildiz);
      if (y > (bolumYildiz[aktifBolum - 1] || 0)) bolumYildiz[aktifBolum - 1] = Math.min(5, y);
      if (aktifBolum < TOPLAM_BOLUM && acikBolum < aktifBolum + 1) acikBolum = aktifBolum + 1;
      depoKaydet();
      bolumCiz();
      tekrarZaman = performance.now() + (aktifBolum >= TOPLAM_BOLUM ? 9200 : 2400);
      if (kosBitis) tekrarZaman = Math.max(tekrarZaman, kosBitis + 1900); kosBitis = 0; // Bilbo koştuysa sarılma bitsin, düğmeler sonra // son bölümde havai fişekli kutlama bitsin, kart sonra gelsin
    });
    OLAY.on('yeniden', function () { sonEkranGizle(); sayacBosalt(); sayacEsitle(); setTimeout(sayacEsitle, 0); beklemeT = 0; });
    OLAY.on('baloncuk', function () { gorulduKaydet('baloncuk'); });
    OLAY.on('bilboKos', function (e) { // Bilbo Pırıl'a koşuyor: ipuçları sussun, kavuşma düğmeleri koşu ve sarılma bitince gelsin
      var s = (e && typeof e.sure === 'number') ? e.sure : 1.2;
      kosBitis = performance.now() + s * 1000;
      elGoster(false); dokunGoster(false); yardimGizle();
    });
    OLAY.on('esinti', function () { gorulduKaydet('esinti'); });
    return true;
  }
  if (!bagla()) window.addEventListener('load', bagla);

  // Dünya → ekran
  var v3 = null;
  function ekran(x, y) {
    if (window.UCUS && typeof UCUS.ekran === 'function') { var r = UCUS.ekran(x, y); if (r) return r; }
    if (typeof camera === 'undefined' || typeof THREE === 'undefined' || !camera) return null;
    if (!v3) v3 = new THREE.Vector3();
    v3.set(x, y, 0).project(camera);
    return { x: (v3.x * 0.5 + 0.5) * innerWidth, y: (-v3.y * 0.5 + 0.5) * innerHeight };
  }

  var elAcik = false, dokunAcik = false;
  var elKapaT = 0, dokunX = null, dokunY = null;
  function elGoster(a) {
    if (a === elAcik) return;
    elAcik = a; clearTimeout(elKapaT);
    if (a) { el.classList.add('oyna'); void el.offsetWidth; el.classList.add('goster'); } // döngü her görünüşte baştan başlar
    else { el.classList.remove('goster'); elKapaT = setTimeout(function () { if (!elAcik) el.classList.remove('oyna'); }, 550); }
  }
  function dokunGoster(a) {
    if (a !== dokunAcik) {
      dokunAcik = a;
      dokun.classList.toggle('goster', a);
      if (a) dokunZaman = performance.now();
      else { dokunX = null; dokunY = null; }
    }
  }

  // Çekince Pırıl'ın gideceği yönü gösteren noktalar
  var nk = el.querySelector('.noktalar');
  for (var q = 1; q <= 5; q++) nk.insertAdjacentHTML('beforeend', '<b></b>');
  var noktaB = nk.querySelectorAll('b'), elAnahtar = '';

  // El ipucunu yerleştir: ekranın açık bir yerinden (Pırıl'ın sağında, çimen/gök üstünde) geriye-aşağı sürükler.
  // Oyun çekişi her yerden kabul ettiği için elin Pırıl'ın üstünde olması gerekmez.
  var EL_FX = [0.62, 0.72, 0.52, 0.8, 0.44, 0.36], EL_FY = [0.57, 0.68, 0.46, 0.76, 0.38];
  var elAday = [0, 0], elSecX = null, elSecY = 0, elSecT = 0, elSecMod = '';
  var yEx = [0, 0, 0, 0, 0], yEy = [0, 0, 0, 0, 0], yEn = 0;
  function yildizEkranTopla() {
    yEn = 0;
    if (typeof DUNYA === 'undefined' || !DUNYA || !DUNYA.yildizYer) return;
    for (var k = 0; k < 5; k++) {
      if (alinan[k] || !DUNYA.yildizYer[k]) continue;
      var e = ekran(DUNYA.yildizYer[k][0], DUNYA.yildizYer[k][1]);
      if (e) { yEx[yEn] = e.x; yEy[yEn] = e.y; yEn++; }
    }
  }
  // elin kapladığı yerler (başlangıç halkası, sürükleme yolu, bitişteki el resmi) yıldıza/Pırıl'a ne kadar yakın: 0 = hiç
  function elCakisma(sx, sy, dx, dy, p) {
    var c = 0;
    for (var k = 0; k <= 4; k++) {
      var f = k / 4, x = sx + dx * f, y = sy + dy * f;
      for (var j = 0; j < yEn; j++) {
        var ex = yEx[j] - (x + 12), ey = yEy[j] - (y + 40), d = Math.sqrt(ex * ex + ey * ey);
        if (d < 105) c += 105 - d;
      }
      if (p) { var px = p.x - (x + 12), py = p.y - (y + 40), dp = Math.sqrt(px * px + py * py); if (dp < 130) c += (130 - dp) * 1.5; }
    }
    return c;
  }
  function elYerlestir() {
    var W = innerWidth, H = innerHeight, m = Math.min(W, H), dik = H > W;
    var p = ekran((typeof P !== 'undefined') ? P.x : 0, (typeof P !== 'undefined') ? P.y : 3.2);
    var sx = dik ? W * 0.72 : Math.max(W * 0.62, p ? p.x + m * 0.45 : 0), sy = H * (dik ? 0.62 : 0.57);
    var oran = elMod === 'cok' ? 0.3 : elMod === 'az' ? 0.13 : 0.22;
    var en = m * oran, ux = -0.86, uy = 0.51;
    var dx = ux * en, dy = uy * en;
    // bitiş ve başlangıç üst HUD ile kenarlar içinde kalsın (iPad yatay/dikey 0 çakışma)
    var ustPay = Math.max(H * 0.24, ustHudAlt() + 24);
    var altPay = H * 0.06 + 110, solPay = W * 0.06 + 50, sagPay = W * 0.04 + 60;
    function kenar(x, y) {
      if (x > W - sagPay) x = W - sagPay;
      if (x + en * 1.35 + 34 > W) x = W - en * 1.35 - 34; // uçuş noktaları ve minik Pırıl ekranda kalsın
      if (y + dy > H - altPay) y = H - altPay - dy;
      if (y < ustPay) y = ustPay;
      if (x + dx < solPay) x = solPay - dx;
      elAday[0] = x; elAday[1] = y;
    }
    // El yıldızların ve Pırıl'ın önüne gelmesin: birkaç aday yerden boş olanı seç (yarım saniyede bir; seçili yer hâlâ boşsa kalır)
    var simdi = performance.now();
    if (elSecX !== null && simdi - elSecT < 450 && elSecMod === elMod) { sx = elSecX; sy = elSecY; }
    else {
      yildizEkranTopla();
      kenar(sx, sy);
      var enIyiX = elAday[0], enIyiY = elAday[1], enIyiC = elCakisma(enIyiX, enIyiY, dx, dy, p);
      if (elSecX !== null && elSecMod === elMod) {
        kenar(elSecX, elSecY);
        var cOnce = elCakisma(elAday[0], elAday[1], dx, dy, p);
        if (cOnce <= enIyiC) { enIyiX = elAday[0]; enIyiY = elAday[1]; enIyiC = cOnce; }
      }
      for (var ai = 0; ai < EL_FX.length && enIyiC > 0; ai++) {
        for (var bi = 0; bi < EL_FY.length && enIyiC > 0; bi++) {
          kenar(W * EL_FX[ai], H * EL_FY[bi]);
          var c = elCakisma(elAday[0], elAday[1], dx, dy, p);
          if (c < enIyiC) { enIyiC = c; enIyiX = elAday[0]; enIyiY = elAday[1]; }
        }
      }
      sx = enIyiX; sy = enIyiY; elSecX = sx; elSecY = sy; elSecT = simdi; elSecMod = elMod;
    }
    var anahtar = [Math.round(sx), Math.round(sy), Math.round(dx), Math.round(dy), elMod].join();
    if (anahtar === elAnahtar) return;
    elAnahtar = anahtar;
    el.style.transform = 'translate(' + sx.toFixed(0) + 'px,' + sy.toFixed(0) + 'px)';
    el.style.setProperty('--dx', dx.toFixed(0)); el.style.setProperty('--dy', dy.toFixed(0));
    el.style.setProperty('--boy', en.toFixed(0) + 'px');
    el.style.setProperty('--a', Math.atan2(dy, dx).toFixed(3) + 'rad');
    el.classList.toggle('cok', elMod === 'cok'); el.classList.toggle('az', elMod === 'az');
    // Noktalar fırlama yönünü (çekişin tersi, yukarı-sağa yay) bırakış anında gösterir
    for (var k = 0; k < noktaB.length; k++) {
      var s = (k + 1) * en * 0.3;
      var nx = (-ux * s), ny = (-uy * s - s * 0.5 + (k + 1) * (k + 1) * 6);
      noktaB[k].style.transform = 'translate(' + nx.toFixed(0) + 'px,' + ny.toFixed(0) + 'px)';
      el.style.setProperty('--n' + (k + 1) + 'x', nx.toFixed(0) + 'px'); el.style.setProperty('--n' + (k + 1) + 'y', ny.toFixed(0) + 'px');
    }
    // çok/az ipucu: soluk halka "geçen sefer buraya çektin" — el bu kez daha uzağa / daha yakına gider
    var hk = elMod === 'cok' ? 0.5 : elMod === 'az' ? 1.9 : 0;
    el.style.setProperty('--hx', (dx * hk).toFixed(0) + 'px'); el.style.setProperty('--hy', (dy * hk).toFixed(0) + 'px');
  }

  function kutlamaAcikMi() { return !kutlama.classList.contains('gizli'); }
  function durumAl() { return (typeof P !== 'undefined' && P) ? P.durum : ''; }
  function kanatHakkiVar() {
    if (window.UCUS && typeof UCUS.bolumBilgi === 'function') {
      var b = UCUS.bolumBilgi();
      if (b) return (b.kanatHak > 0) && (b.kanatKalan > 0);
    }
    return true;
  }

  // Oyundaki yıldızlar sayacın altına gelirse sayaç saydamlaşır
  var sayacR = null, kanatR = null, sayacOlcT = 0;
  function sayacOrtusur(R) {
    if (typeof DUNYA === 'undefined' || !DUNYA || !DUNYA.yildizYer) return false;
    if (!R) return false;
    var sayacR = R;
    for (var k = 0; k < 5; k++) {
      if (alinan[k] || !DUNYA.yildizYer[k]) continue;
      var e = ekran(DUNYA.yildizYer[k][0], DUNYA.yildizYer[k][1]);
      if (e && e.x > sayacR.left - 50 && e.x < sayacR.right + 50 && e.y > sayacR.top - 50 && e.y < sayacR.bottom + 55) return true;
    }
    var p = (typeof P !== 'undefined') ? ekran(P.x, P.y + 0.6) : null;
    return !!(p && p.x > sayacR.left - 40 && p.x < sayacR.right + 40 && p.y < sayacR.bottom + 50);
  }

  window.addEventListener('resize', function () {
    elAnahtar = ''; sayacOlcT = 0;
    if (haritaAcik) { haritaYerlestir(); haritaOdakla(acikBolum, false); }
    setTimeout(function () { if (!sonrakiKutu.classList.contains('gizli')) sonYerlestir(); }, 150);
  });

  // ───── yeni yardımcılar için resimli ipucu (baloncuk: değince yukarı fırlatır; esinti: arkadan iten rüzgâr) ─────
  // Yardımcının ilk göründüğü bölümde, Pırıl salıncakta beklerken kısa süre yardımcının yanında belirir (en çok 3 kez).
  var IPUCU_ANAHTAR = 'feza_piril_ucus_ipucu_v1';
  var gorulen = (function () { try { var v = JSON.parse(localStorage.getItem(IPUCU_ANAHTAR) || '{}'); return (v && typeof v === 'object') ? v : {}; } catch (_) { return {}; } })();
  function gorulduKaydet(ad) {
    if (gorulen[ad]) return;
    gorulen[ad] = 1;
    try { localStorage.setItem(IPUCU_ANAHTAR, JSON.stringify(gorulen)); } catch (_) {}
  }
  var yardimEl = $('ui-yardim'), yardimTur = '', yardimSure = 0, yardimSay = 0, yardimBolum = 0, yardimBuBekle = false;
  var yardimX = null, yardimY = 0;
  function yardimListe(tur) {
    var d = (typeof DUNYA !== 'undefined' && DUNYA) ? DUNYA[tur === 'baloncuk' ? 'baloncuklar' : 'esintiler'] : null;
    if (!Array.isArray(d) || !d.length) {
      var b = Array.isArray(window.BOLUMLER) ? window.BOLUMLER[aktifBolum - 1] : null;
      d = b ? b[tur === 'baloncuk' ? 'baloncuklar' : 'esintiler'] : null;
    }
    return (Array.isArray(d) && d.length && d[0] && typeof d[0].x === 'number') ? d[0] : null;
  }
  function yardimHedef(tur) { // [orta x, orta y, yarıçap] (dünya birimi)
    var k = yardimListe(tur);
    if (!k) return null;
    if (tur === 'baloncuk') return [k.x, k.y || 0, k.r || 1.2];
    var h = k.h || 4, w = k.w || 4; // esinti: ruzgarlar gibi x orta, y alt kenar
    return [k.x, (k.y || 0) + h / 2, Math.min(w, h) / 2];
  }
  function yardimGoster(tur) {
    yardimTur = tur; yardimSure = 0; yardimX = null;
    yardimEl.classList.toggle('esinti', tur === 'esinti');
    yardimEl.classList.add('oyna');
    void yardimEl.offsetWidth;
    yardimEl.classList.add('goster');
    yardimYerlestir();
  }
  function yardimGizle() {
    if (!yardimTur) return;
    yardimTur = '';
    yardimEl.classList.remove('goster');
    setTimeout(function () { if (!yardimTur) yardimEl.classList.remove('oyna'); }, 400);
  }
  function yardimYerlestir() {
    var h = yardimHedef(yardimTur);
    if (!h) { yardimGizle(); return; }
    var m = ekran(h[0], h[1]), u = ekran(h[0], h[1] + h[2]);
    if (!m) return;
    var W = innerWidth, H = innerHeight;
    var rp = u ? Math.max(18, Math.abs(m.y - u.y)) : 40;
    var cw = yardimEl.offsetWidth || 140;
    var ustS = Math.max(H * 0.05, ustHudAlt() + 16), altS = H - cw - Math.max(H * 0.06, 24);
    var yanS = Math.max(16, W * 0.04);
    var simdi = performance.now();
    if (yardimX === null || simdi - yardimSecT > 500) { yardimSecT = simdi; yardimSec(m, rp, cw, ustS, altS, yanS, W); }
    var x = yardimAday[0], y = yardimAday[1], alt = yardimAday[2];
    if (yardimX === null) { yardimX = x; yardimY = y; }
    else { yardimX += (x - yardimX) * 0.25; yardimY += (y - yardimY) * 0.25; }
    yardimEl.style.left = yardimX.toFixed(1) + 'px'; yardimEl.style.top = yardimY.toFixed(1) + 'px';
    yardimEl.style.setProperty('--kx', clampS(m.x - yardimX, 26, cw - 26).toFixed(0) + 'px'); // baloncuk ucu yardımcıyı göstersin
    yardimEl.classList.toggle('alt', alt);
    yardimEl.classList.toggle('uzak', !!yardimAday[3]); // üst sırada: ok yok
  }
  var yardimAday = [0, 0, false], yardimSecT = 0;
  // kartın örteceği şeyler: öteki yardımcılar, alınmamış yıldızlar, Pırıl
  function yardimMaliyet(x, y, cw) {
    var c = 0, x0 = x - 18, y0 = y - 18, x1 = x + cw + 18, y1 = y + cw + 18;
    function nokta(px, py, r) {
      var dx = Math.max(x0 - px, 0, px - x1), dy = Math.max(y0 - py, 0, py - y1), d = Math.sqrt(dx * dx + dy * dy);
      if (d < r) c += r - d;
    }
    var lis = (typeof DUNYA !== 'undefined' && DUNYA) ? [DUNYA.baloncuklar, DUNYA.esintiler] : [];
    for (var a = 0; a < lis.length; a++) {
      var L = lis[a];
      if (!Array.isArray(L)) continue;
      for (var i = 0; i < L.length; i++) {
        var k = L[i]; if (!k || typeof k.x !== 'number') continue;
        if (a === 0) { // baloncuk: daire
          var e = ekran(k.x, k.y || 0), u = ekran(k.x, (k.y || 0) + (k.r || 1.2));
          if (e) nokta(e.x, e.y, 30 + (u ? Math.abs(e.y - u.y) : 40));
        } else { // esinti: dikdörtgen (x orta, y alt kenar) — örtülen alan kadar pahalı
          var hw = (k.w || 4) / 2, p0 = ekran(k.x - hw, k.y || 0), p1 = ekran(k.x + hw, (k.y || 0) + (k.h || 4));
          if (p0 && p1) {
            var ox = Math.min(x1, Math.max(p0.x, p1.x)) - Math.max(x0, Math.min(p0.x, p1.x));
            var oy = Math.min(y1, Math.max(p0.y, p1.y)) - Math.max(y0, Math.min(p0.y, p1.y));
            if (ox > 0 && oy > 0) c += Math.sqrt(ox * oy) * 2;
          }
        }
      }
    }
    if (typeof DUNYA !== 'undefined' && DUNYA && DUNYA.yildizYer) {
      for (var j = 0; j < 5; j++) {
        if (alinan[j] || !DUNYA.yildizYer[j]) continue;
        var s = ekran(DUNYA.yildizYer[j][0], DUNYA.yildizYer[j][1]);
        if (s) nokta(s.x, s.y, 50);
      }
    }
    var p = (typeof P !== 'undefined') ? ekran(P.x, P.y) : null;
    if (p) nokta(p.x, p.y, 80);
    return c;
  }
  function yardimSec(m, rp, cw, ustS, altS, yanS, W) {
    // önce üst gösterge sırasının hemen altı (orta, sağ, sol), sonra yardımcının çevresi
    var g = 26, ad = [
      [W / 2 - cw / 2, ustS, false, 1], [W - cw - yanS, ustS, false, 1], [W * 0.68 - cw / 2, ustS, false, 1], [W * 0.3 - cw / 2, ustS, false, 1], [yanS, ustS, false, 1],
      [m.x - cw / 2, m.y - rp - cw - g, false], [m.x + rp * 0.4, m.y - rp - cw - g, false], [m.x - cw - rp * 0.4, m.y - rp - cw - g, false],
      [m.x - cw / 2, m.y + rp + g, true], [m.x + rp + g, m.y - cw * 0.9, false], [m.x - rp - g - cw, m.y - cw * 0.9, false]];
    var en = null, enC = 1e9;
    for (var i = 0; i < ad.length; i++) {
      var x = clampS(ad[i][0], yanS, Math.max(yanS, W - cw - yanS)), y = clampS(ad[i][1], ustS, Math.max(ustS, altS));
      var alt = ad[i][2] || y > m.y;
      var c = yardimMaliyet(x, y, cw) * 4 + i * 3 + Math.abs(y - ad[i][1]) * 0.5; // örtmek çok pahalı; sıra önceliği küçük
      if (c < enC) { enC = c; en = [x, y, alt, !!ad[i][3]]; }
    }
    yardimAday = en;
  }
  function yardimDongu(d, dt) {
    if (yardimBolum !== aktifBolum) { yardimBolum = aktifBolum; yardimSay = 0; yardimGizle(); }
    if (d !== 'bekle') yardimBuBekle = false;
    if (yardimTur) {
      yardimSure += dt;
      if (d !== 'bekle' || haritaAcik || kutlamaAcikMi() || yardimSure > 4.6 || gorulen[yardimTur]) yardimGizle();
      else yardimYerlestir();
      return;
    }
    if (!basladi || d !== 'bekle' || haritaAcik || kutlamaAcikMi() || yardimBuBekle || yardimSay >= 3 || beklemeT < 0.5) return;
    var tur = (!gorulen.baloncuk && yardimHedef('baloncuk')) ? 'baloncuk' : ((!gorulen.esinti && yardimHedef('esinti')) ? 'esinti' : '');
    yardimBuBekle = true;
    if (!tur) return;
    yardimSay++;
    yardimGoster(tur);
  }

  function dongu(t) {
    requestAnimationFrame(dongu);
    var dt = sonT ? Math.min(0.1, (t - sonT) / 1000) : 0; sonT = t;
    var d = durumAl();
    if (d !== oncekiDurum) {
      if (d === 'ucus' && oncekiDurum !== 'ucus') {
        ucusSayisi++;
        ucusKanatCirpildi = false;
        dokunDene = kanatHakkiVar();
        oncekiVy = 99;
        var kdBas = kanatDurumAl();
        if (kdBas.hak > 0) kanatGuncelle(kdBas.hak, kdBas.kalan, false);
        else kanatGizle();
      }
      if (d !== 'ucus') { dokunGoster(false); dokunDene = false; if (d !== 'bekle' && d !== 'cek') kanatGizle(); }
      if (d === 'bekle') beklemeT = 0;
      if (d === 'kavus' && yildizSay >= 5 && aktifBolum < TOPLAM_BOLUM) {
        setTimeout(function () { if (durumAl() === 'kavus') { sonYerlestir(); rozet.classList.toggle('gk', kavusTek); rozet.classList.remove('gizli'); yeniden(rozet, 'gel'); } }, 1400);
      }
      oncekiDurum = d;
    }

    // Kanat ipucu: kanat hakkı varsa ve bu uçuşta henüz kanat çırpılmadıysa tepe noktasında dokunma halkası göster
    if (d === 'ucus' && typeof P !== 'undefined') {
      if (dokunDene && !ucusKanatCirpildi && kanatHakkiVar() && oncekiVy > 2.4 && P.vy <= 2.4 && P.y >= 2.2) {
        dokunDene = false;
        dokunGoster(true);
      }
      oncekiVy = P.vy;
      if (dokunAcik) {
        var pe = ekran(P.x, P.y - 0.8), bw = dokun.offsetWidth || Math.min(114, innerHeight * 0.145, innerWidth * 0.16);
        if (P.y < 2.0 || ucusKanatCirpildi || !kanatHakkiVar()) dokunGoster(false); // yere yaklaşınca veya kanat çırpılınca gizle
        else if (pe) { // Pırıl'ın hemen altına yapışır, kareden kareye yumuşakça izler
          var dokunUst = Math.max(innerHeight * 0.22, ustHudAlt() + 14);
          var dokunAlt = Math.max(dokunUst, innerHeight - bw - innerHeight * 0.06);
          var yanPay = Math.max(16, innerWidth * 0.04);
          var bx = clampS(pe.x - bw / 2, yanPay, Math.max(yanPay, innerWidth - bw - yanPay));
          var by = clampS(pe.y + 58, dokunUst, dokunAlt);
          if (dokunX === null) { dokunX = bx; dokunY = by; }
          else { dokunX += (bx - dokunX) * 0.35; dokunY += (by - dokunY) * 0.35; }
          dokun.style.left = dokunX.toFixed(1) + 'px'; dokun.style.top = dokunY.toFixed(1) + 'px';
        }
      }
    }
    if (dokunAcik && t - dokunZaman > 2200) dokunGoster(false);

    // Sayaç ve bölüm göstergesi: uçuşta hafif küçülür; yıldız/Pırıl altına gelirse saydamlaşır
    var ucusMod = d === 'ucus' || d === 'yuvar' || d === 'don';
    haritaAcBtn.classList.toggle('ucus', ucusMod);
    if ((d === 'ucus' || d === 'bekle' || d === 'cek') && basladi && !kutlamaAcikMi()) {
      var kdAnlik = kanatDurumAl();
      if (kdAnlik.hak > 0) {
        if (kdAnlik.hak !== sonKanatHak || kdAnlik.kalan !== sonKanatKalan || kanatlarEl.classList.contains('gizli')) {
          kanatGuncelle(kdAnlik.hak, kdAnlik.kalan, kdAnlik.kalan < sonKanatKalan);
        }
      } else if (!kanatlarEl.classList.contains('gizli')) {
        kanatGizle();
      }
    }
    if (!sayac.classList.contains('gizli')) {
      sayac.classList.toggle('ucus', ucusMod);
      sayacOlcT -= dt;
      var kanatAcik = !kanatlarEl.classList.contains('gizli');
      if (sayacOlcT <= 0) { sayacOlcT = 0.25; sayacR = sayac.getBoundingClientRect(); kanatR = kanatAcik ? kanatlarEl.getBoundingClientRect() : null; }
      var oynuyor = d === 'ucus' || d === 'cek';
      sayac.classList.toggle('saydam', oynuyor && sayacOrtusur(sayacR));
      if (kanatAcik) kanatlarEl.classList.toggle('saydam', oynuyor && !!kanatR && sayacOrtusur(kanatR));
    }

    // Çeken el: Pırıl salıncakta beklerken; Bölüm 1'de ilk çekişten önce hemen belirir
    var elIste = false;
    if (basladi && d === 'bekle') {
      beklemeT += dt;
      if (!cekildi) elIste = beklemeT > (aktifBolum === 1 ? 0.25 : 0.7);
      else if (elZorla) elIste = beklemeT > 0.6;
      else elIste = beklemeT > 6;
    }
    if (d === 'cek' && elAcik) { elZorla = false; elMod = ''; }
    yardimDongu(d, dt);
    if (haritaAcik || yardimTur) elIste = false; // resimli ipucu açıkken çeken el beklesin
    if (elIste) { elYerlestir(); elGoster(true); } else elGoster(false);

    if (d === 'kavus' && !sonrakiKutu.classList.contains('gizli')) sonYerlestir(true); // kamera yerleşirken düğmeler yumuşakça izler
    if (tekrarZaman && t >= tekrarZaman) {
      tekrarZaman = 0;
      if (aktifBolum >= TOPLAM_BOLUM) {
        kalpler.classList.add('gizli');
        var topY = toplamYildizHesapla();
        var maksY = TOPLAM_BOLUM * 5;
        toplamYildizEl.textContent = topY + ' / ' + maksY;
        if (kutlamaCubukDolgu) {
          kutlamaCubukDolgu.style.width = Math.max(4, Math.min(100, Math.round((topY / maksY) * 100))) + '%';
        }
        kutlama.classList.remove('gizli');
        yeniden(kutlama, 'gel');
      } else {
        if (kavusSay > 0) { kalpCiz(true); kalpler.classList.remove('gizli'); }
        sonrakiKutu.classList.remove('gizli');
        sonYerlestir();
        yeniden(sonrakiKutu, 'gel');
      }
    }
  }

  function ustHudAlt() {
    var alt = 0;
    [haritaAcBtn, sayac, kanatlarEl, bolumRozetEl, kalpler].forEach(function (d) {
      if (d && !d.classList.contains('gizli')) {
        var r = d.getBoundingClientRect();
        if (r.height > 0 && r.bottom > alt) alt = r.bottom;
      }
    });
    return alt;
  }

  // "Sonraki Bölüm" + "Bir Daha" düğmeleri ve rozet karakterleri kapatmasın
  var sonX = null, sonY = null;
  function sonYerlestir(yumusak) {
    var W = innerWidth, H = innerHeight;
    var kw = sonrakiKutu.offsetWidth || 290, kh = (sonrakiKutu.offsetHeight || 84) + (sonrakiKutu.classList.contains('eksikli') ? 44 : 0); // altta eksik yıldızlar
    var rw = rozet.offsetWidth || 110;
    var hx = (typeof D !== 'undefined') ? D.hedef.x : 46;
    var ayak = ekran(hx - 0.6, -0.15), sag = ekran(hx + 1.9, 0.5);
    var altPay = Math.max(H * 0.05, 24), ustPay = Math.max(H * 0.24, ustHudAlt() + 14, 210);
    var kenarPay = Math.max(W * 0.04, 20), x = W / 2 - kw / 2, y = H - altPay - kh;
    if (ayak && ayak.y > y + kh * 0.45 && sag) {
      x = clampS(sag.x - kw * 0.2, W * 0.4, W - kw - kenarPay);
      y = clampS(sag.y - kh * 0.7, ustPay, H - altPay - kh);
    }
    x = clampS(x, kenarPay, Math.max(kenarPay, W - kw - kenarPay));
    y = clampS(y, ustPay, Math.max(ustPay, H - altPay - kh));
    if (yumusak && sonX !== null) {
      x = sonX + (x - sonX) * 0.08;
      y = sonY + (y - sonY) * 0.08;
      if (Math.abs(x - sonX) < 0.12 && Math.abs(y - sonY) < 0.12) return;
    }
    if (sonrakiKutu.offsetWidth > 0) { sonX = x; sonY = y; }
    sonrakiKutu.style.left = x.toFixed(1) + 'px'; sonrakiKutu.style.top = y.toFixed(1) + 'px';
    var rx = x + kw + 28, ry = y + kh - rw;
    if (rx + rw > W - kenarPay) rx = x - rw - 28;
    if (rx < kenarPay) {
      rx = clampS(x + kw / 2 - rw / 2, kenarPay, W - rw - kenarPay);
      ry = Math.max(ustPay, y - rw - 14);
    }
    ry = clampS(ry, ustPay, Math.max(ustPay, H - rw - altPay));
    rozet.style.left = rx.toFixed(1) + 'px'; rozet.style.top = ry.toFixed(1) + 'px';
  }
  function clampS(v, a, b) { return v < a ? a : v > b ? b : v; }
  requestAnimationFrame(dongu);

  if (Qa.has('atla') || Qa.has('oto')) {
    if (document.readyState === 'complete') basla(true);
    else window.addEventListener('load', function () { basla(true); });
  }
})();
