/* Arayüz: başlık ekranı, 20 bölümlük adım göstergesi, yıldız sayacı, canlı kanat hakkı göstergesi,
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
  var PIRIL_BAS = '<svg viewBox="0 0 100 100" aria-hidden="true">' +
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
    '<path d="M44 60q6 5 12 0" fill="none" stroke="#6b45ad" stroke-width="2.6" stroke-linecap="round"/></svg>';
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

  var KANAT_SVG = '<svg viewBox="0 0 64 64" aria-hidden="true">' +
    '<defs><linearGradient id="kanatMor" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="#e3c8ff"/><stop offset="52%" stop-color="#a86ef2"/><stop offset="100%" stop-color="#6b45ad"/>' +
    '</linearGradient></defs>' +
    '<path d="M12 52C10 30 24 10 54 8c-6 10-7 17-1 23-9 1-14 6-12 14-8-1-14 3-16 10-5-2-9-2-13-3z" fill="url(#kanatMor)" stroke="#ffc928" stroke-width="3.6" stroke-linejoin="round"/>' +
    '<path d="M16 49C22 33 34 20 49 13" fill="none" stroke="#fff3b0" stroke-width="2.6" stroke-linecap="round" opacity=".88"/>' +
    '<circle cx="44" cy="18" r="2.6" fill="#fff8c8"/>' +
    '</svg>';

  var ilerleme = depoOku();
  var aktifBolum = ilerleme.aktif, kayitliAktif = ilerleme.aktif;
  var acikBolum = ilerleme.acik;
  var bolumYildiz = ilerleme.yildiz;

  function depoOku() {
    var y0 = [];
    for (var k = 0; k < TOPLAM_BOLUM; k++) y0.push(0);
    var varsayilan = { aktif: 1, acik: 1, yildiz: y0 };
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
      return { aktif: aktif, acik: acik, yildiz: y.map(function (n) { return Math.max(0, Math.min(5, n | 0)); }) };
    } catch (_) { return varsayilan; }
  }
  function depoKaydet() {
    try {
      localStorage.setItem(DEPO_ANAHTAR, JSON.stringify({ aktif: (basladi || !kayitliAktif) ? aktifBolum : kayitliAktif, acik: acikBolum, yildiz: bolumYildiz }));
    } catch (_) {}
  }

  var html =
    '<div id="baslik">' +
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
        '<svg class="ui-yol" aria-hidden="true"><path class="ui-yol-golge"/><path class="ui-yol-ana"/><path class="ui-yol-ilerleme"/><path class="ui-yol-cizgi"/></svg>' +
        '<div class="ui-bilbo" aria-hidden="true">' + BILBO_SVG + '</div>' +
        '<nav id="bolumler" aria-label="Bölümler"></nav>' +
      '</div>' +
    '</div>' +
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
    '<div id="rozet" class="gizli" aria-hidden="true"><div class="isin"></div><svg viewBox="0 0 120 120">' +
      '<path d="M40 70 28 112l16-8 10 14 8-40zM80 70l12 42-16-8-10 14-8-40z" fill="#9b5de5" stroke="#6b45ad" stroke-width="4" stroke-linejoin="round"/>' +
      '<circle cx="60" cy="52" r="40" fill="#ffd34d" stroke="#e08a00" stroke-width="5"/><circle cx="60" cy="52" r="31" fill="#ffe680"/>' +
      '<g transform="translate(36 28) scale(.48)" fill="#ffb300" stroke="#e08a00" stroke-width="5" stroke-linejoin="round">' + YILDIZ + '</g>' +
      '<g fill="#fff6c0">' + [0, 1, 2, 3, 4].map(function (k) {
        var a = (-90 + k * 72) * Math.PI / 180;
        return '<circle cx="' + (60 + Math.cos(a) * 35.5).toFixed(1) + '" cy="' + (52 + Math.sin(a) * 35.5).toFixed(1) + '" r="3.6"/>';
      }).join('') + '</g>' +
      '<ellipse cx="45" cy="32" rx="9" ry="5" fill="#fff" opacity=".7" transform="rotate(-35 45 32)"/>' +
    '</svg></div>' +
    '<div id="sonrakiKutu" class="gizli">' +
      '<button id="sonraki" type="button" aria-label="Sonraki Bölüm"><span class="ui-parilti" aria-hidden="true"></span>' + OK_SVG + '</button>' +
      '<button id="tekrar" type="button" class="kucuk-tekrar" aria-label="Bölümü bir daha oyna">' + TEKRAR_SVG + '</button>' +
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
  var yolSvg = haritaEl.querySelector('.ui-yol'), haritaAcik = false, haritaSutun = 5;
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
    if (b && b.gece) return '#4b58b8';
    return 'hsl(' + Math.round(100 + (n - 1) / Math.max(1, TOPLAM_BOLUM - 1) * 200) + ' 70% 68%)';
  }
  var MINI_YILDIZ ='<svg viewBox="0 0 100 100"><path d="M50 6 63 35l31 3-24 21 7 31-27-16-27 16 7-31L6 38l31-3z"/></svg>';
  function bolumCiz() {
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

  // Düğümleri ekrana sığan kıvrımlı bir patikaya diz (yatayda geniş, dikeyde uzun ızgara; satırlar yılan gibi döner)
  var haritaNokta = [], haritaKapaT = 0, haritaGelT = 0, haritaDonusT = 0;
  function haritaYerlestir() {
    var W = haritaAlan.clientWidth, H = haritaAlan.clientHeight, N = TOPLAM_BOLUM;
    if (!W || !H) return;
    var en = null;
    for (var c = 2; c <= 10; c++) {
      var r = Math.ceil((N + 1) / c), cw = W / c, rh = H / r; // +1: yolun sonunda Bilbo'nun pikniği için yer
      var s = Math.min(cw * 0.6, rh * 0.52);
      if (!en || s > en.s + 0.5) en = { c: c, r: r, s: s, cw: cw, rh: rh };
    }
    if (N <= 1) en = { c: 1, r: 1, s: Math.min(W, H) * 0.4, cw: W, rh: H };
    haritaSutun = en.c;
    var s = Math.max(64, Math.min(104, en.s));
    bolumlerEl.style.setProperty('--s', s.toFixed(0) + 'px');
    var dugmeler = bolumlerEl.querySelectorAll('.bolum-adim');
    haritaNokta.length = 0;
    for (var i = 0; i < N; i++) {
      var sat = Math.floor(i / en.c), sut = i % en.c;
      if (sat % 2) sut = en.c - 1 - sut;
      var x = (sut + 0.5) * en.cw;
      var y = (sat + 0.5) * en.rh - en.rh * 0.08 + Math.sin(i * 1.7) * en.rh * 0.06;
      haritaNokta.push([x, y]);
      if (dugmeler[i]) { dugmeler[i].style.left = (x - s / 2).toFixed(1) + 'px'; dugmeler[i].style.top = (y - s / 2).toFixed(1) + 'px'; }
    }
    // Bilbo: son sıradaki boş yerlerin ortasında (en çok 3 hücre genişliğinde)
    var sonSat = Math.floor(N / en.c), bosIlk = N % en.c, bosSay = Math.min(3, en.c - bosIlk);
    var orta = bosIlk + (bosSay - 1) / 2;
    if (sonSat % 2) orta = en.c - 1 - orta;
    var bx = (orta + 0.5) * en.cw, by = (sonSat + 0.5) * en.rh;
    var bw = Math.min(en.cw * bosSay * 0.92, s * 2.3, en.rh * 1.25);
    var bilbo = haritaEl.querySelector('.ui-bilbo');
    bilbo.style.width = bw.toFixed(0) + 'px'; bilbo.style.height = (bw * 0.75).toFixed(0) + 'px';
    bilbo.style.left = (bx - bw / 2).toFixed(0) + 'px'; bilbo.style.top = (by - bw * 0.42).toFixed(0) + 'px';
    var yolN = haritaNokta.concat([[bx + (sonSat % 2 ? 1 : -1) * bw * 0.32, by + bw * 0.14]]);
    yolSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var tam = yolYap(yolN, N + 1), ilerle = yolYap(haritaNokta, Math.min(N, acikBolum));
    var p = yolSvg.querySelectorAll('path');
    p[0].setAttribute('d', tam); p[1].setAttribute('d', tam); p[2].setAttribute('d', ilerle); p[3].setAttribute('d', tam);
    yolSvg.style.setProperty('--yk', (s * 0.42).toFixed(0) + 'px');
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
    clearTimeout(haritaGelT);
    haritaGelT = setTimeout(function () { haritaEl.classList.remove('gel'); }, 80 + TOPLAM_BOLUM * 22 + 600); // giriş bitince sallanma/nabız serbest
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
  document.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('touchstart', function (e) { if (e.touches.length > 1 && !dugmeMi(e)) e.preventDefault(); }, { passive: false });
  var sonDokunus = 0;
  document.addEventListener('touchend', function (e) {
    var s = Date.now();
    if (s - sonDokunus < 350 && !dugmeMi(e)) e.preventDefault(); // çift dokunma yakınlaştırması
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
      var vb = v && (typeof v.bolum === 'number' ? v.bolum : v.no);
      if (typeof vb === 'number') aktifBolum = Math.max(1, Math.min(TOPLAM_BOLUM, vb | 0));
      else if (v && typeof v.bolumIdx === 'number') aktifBolum = Math.max(1, Math.min(TOPLAM_BOLUM, (v.bolumIdx | 0) + 1));
      var y = Math.max(yildizSay, (v && typeof v.yildiz === 'number') ? v.yildiz : 0);
      if (y > (bolumYildiz[aktifBolum - 1] || 0)) bolumYildiz[aktifBolum - 1] = Math.min(5, y);
      if (aktifBolum < TOPLAM_BOLUM && acikBolum < aktifBolum + 1) acikBolum = aktifBolum + 1;
      depoKaydet();
      bolumCiz();
      tekrarZaman = performance.now() + (aktifBolum >= TOPLAM_BOLUM ? 6200 : 2400); // son bölümde havai fişekli kutlama bitsin, kart sonra gelsin
    });
    OLAY.on('yeniden', function () { sonEkranGizle(); sayacBosalt(); beklemeT = 0; });
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
    if (haritaAcik) haritaYerlestir();
    setTimeout(function () { if (!sonrakiKutu.classList.contains('gizli')) sonYerlestir(); }, 150);
  });

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
        setTimeout(function () { if (durumAl() === 'kavus') { sonYerlestir(); rozet.classList.remove('gizli'); yeniden(rozet, 'gel'); } }, 1400);
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
    if (haritaAcik) elIste = false;
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
    var kw = sonrakiKutu.offsetWidth || 290, kh = sonrakiKutu.offsetHeight || 84;
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
