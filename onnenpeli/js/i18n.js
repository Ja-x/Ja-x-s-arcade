/* Onnenpeli – KIELET
 *
 * Kaikki pelaajalle näkyvät tekstit suomeksi ja englanniksi.
 * Oletuskieli on suomi; valinta muistetaan selaimessa.
 */

(function (NJ) {
  'use strict';

  var STORAGE_KEY = 'onnenpeli.lang';
  var DEFAULT_LANG = 'fi';

  var STRINGS = {
    fi: {
      pageTitle: "Onnenpeli – Ja-x's Arcade",
      gameTitle: 'ONNENPELI',
      subtitle: 'Tervetuloa pelaamaan, montako pelikierrosta tarvitset mysteerin ratkaisuun?',
      displayLabel: 'Arvottava koordinaattirivi',
      lucky: 'Kannattaisiko laittaa lotto vetämään?',
      leverAria: 'Vipu: käynnistä arvonta',
      leverLabel: 'VEDÄ',
      hintReady: 'Vedä vivusta aloittaaksesi arvonnan.',
      hintSpinning: 'Rullat pyörivät…',
      rounds: function (n) {
        return 'Olet pelannut ' + n + (n === 1 ? ' kierroksen.' : ' kierrosta.');
      },
      reelDirection: 'Ilmansuunta',
      reelPlace: 'Paikka',
      reelBlank: 'hannunvaakuna',
      reelHit: 'osuma',
      srDegrees: 'astetta',
      srPoint: 'pilkku',
      srDirection: 'ilmansuunta',
      srLit: 'Vihreä valo: ',
      srNone: 'Ei vihreitä valoja.',
      langButton: 'Kieli: suomi. Vaihda englanniksi.',
      backlink: "← Ja-x's Arcade"
    },
    en: {
      pageTitle: "Game of Luck – Ja-x's Arcade",
      gameTitle: 'GAME OF LUCK',
      subtitle: 'Welcome! How many rounds will it take you to solve the mystery?',
      displayLabel: 'Coordinate row being drawn',
      lucky: 'Maybe you should play the lottery?',
      leverAria: 'Lever: start the draw',
      leverLabel: 'PULL',
      hintReady: 'Pull the lever to start the draw.',
      hintSpinning: 'The reels are spinning…',
      rounds: function (n) {
        return 'You have played ' + n + (n === 1 ? ' round.' : ' rounds.');
      },
      reelDirection: 'Direction',
      reelPlace: 'Place',
      reelBlank: 'cross symbol',
      reelHit: 'hit',
      srDegrees: 'degrees',
      srPoint: 'point',
      srDirection: 'direction',
      srLit: 'Green light: ',
      srNone: 'No green lights.',
      langButton: 'Language: English. Switch to Finnish.',
      backlink: "← Ja-x's Arcade"
    }
  };

  var lang = DEFAULT_LANG;

  function load() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (STRINGS[saved]) lang = saved;
    } catch (e) { /* ei tallennusta */ }
    return lang;
  }

  function set(next) {
    if (!STRINGS[next]) return lang;
    lang = next;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ei tallennusta */ }
    return lang;
  }

  function t(key) {
    var value = STRINGS[lang][key];
    if (typeof value === 'function') {
      return value.apply(null, Array.prototype.slice.call(arguments, 1));
    }
    return value;
  }

  NJ.I18n = {
    load: load,
    set: set,
    get: function () { return lang; },
    t: t
  };

})(window.NJ);
