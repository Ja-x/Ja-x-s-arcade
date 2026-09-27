/* Onnenpeli – PELI
 *
 * Vastuu:
 *  - pelitila READY / SPINNING / RESULT
 *  - ilmansuunnan ja numeroiden arvonta
 *  - osumien tunnistus: ilmansuunta ratkaisee, mitä riviä vasten verrataan
 *  - käyttöliittymä: vipu, äänikytkin, vähintään neljän osuman viesti
 */

(function (NJ) {
  'use strict';

  var CONFIG = NJ.CONFIG;
  var DEBUG = NJ.DEBUG;
  var Audio = NJ.Audio;
  var Reels = NJ.Reels;
  var I18n = NJ.I18n;
  var t = I18n.t;

  /* ---------------- GAME STATE ---------------- */

  var state = {
    phase: 'READY',       // READY | SPINNING | RESULT
    direction: null,      // kierroksen arvottu ilmansuunta
    digits: null,         // kierroksen arvotut numerot A–H
    result: null,         // evaluate()-funktion tulos
    stopped: 0,
    litSoFar: 0,          // vain osumaäänen sävelkorkeutta varten
    rounds: 0             // pelatut kierrokset; nollautuu sivun latauksessa
  };

  var winning = NJ.getWinningCoordinates();

  var dom = {};
  var luckyTimer = null;

  /* ---------------- RANDOMIZATION ---------------- */

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  /* Ilmansuunta: kaikki neljä samalla todennäköisyydellä. */
  function rollDirection() {
    return pick(CONFIG.directions);
  }

  /* Yksi numeropaikka: käyttää juuri sen paikan sallittuja arvoja. */
  function rollPlace(index) {
    return pick(Reels.facesFor(index));
  }

  function rollDigits() {
    var out = [];
    for (var i = 0; i < CONFIG.variableNames.digits.length; i++) out.push(rollPlace(i));
    return out;
  }

  function rollRound() {
    var values = { direction: rollDirection(), digits: rollDigits() };

    if (DEBUG.enabled) values = applyDebug(values);
    if (DEBUG.enabled && DEBUG.logRolls) {
      console.log('[onnenpeli]', values.direction, values.digits.join(''));
    }
    return values;
  }

  /* Kehitystila: pakotettu tulos, suunta tai osumien määrä. */
  function applyDebug(values) {
    if (DEBUG.forceResult) {
      return {
        direction: DEBUG.forceResult.direction,
        digits: DEBUG.forceResult.digits.slice()
      };
    }
    if (DEBUG.forceDirection) values.direction = DEBUG.forceDirection;

    if (DEBUG.forceHits > 0) {
      /* Osumia voi syntyä vain oikealla ilmansuunnalla. Jos pakotettu
       * suunta on väärä, se jätetään voimaan – silloin osumia on nolla,
       * mikä on juuri spesifikaation testi 12. */
      var winners = Object.keys(winning);
      if (!winning[values.direction] && !DEBUG.forceDirection) {
        values.direction = pick(winners);
      }
      var row = winning[values.direction];
      if (row) {
        var places = [];
        for (var i = 0; i < values.digits.length; i++) places.push(i);
        /* Fisher–Yates, jotta pakotetut osumat osuvat satunnaisiin paikkoihin. */
        for (var k = places.length - 1; k > 0; k--) {
          var j = Math.floor(Math.random() * (k + 1));
          var tmp = places[k]; places[k] = places[j]; places[j] = tmp;
        }
        /* Oikea ilmansuunta on jo yksi osuma. */
        var need = Math.min(DEBUG.forceHits - 1, places.length);
        for (var p = 0; p < need; p++) values.digits[places[p]] = row[places[p]];
      }
    }
    return values;
  }

  /* ---------------- MATCHING ----------------
   *
   * Ydinsääntö: numerorivi voi sisältää osumia vain, jos arvottu ilmansuunta
   * löytyy voittokoordinaateista. Vertailu tehdään aina juuri kyseisen
   * ilmansuunnan omaa riviä vasten. Oikea ilmansuunta on yksi osuma.        */

  function evaluate(direction, digits) {
    var row = winning[direction];

    if (!row) {
      return {
        directionMatch: false,
        digitMatches: digits.map(function () { return false; }),
        hitCount: 0
      };
    }

    var digitMatches = digits.map(function (value, index) {
      return value === row[index];
    });

    return {
      directionMatch: true,
      digitMatches: digitMatches,
      hitCount: 1 + digitMatches.filter(Boolean).length
    };
  }

  /* Onko juuri pysähtynyt rulla osuma? */
  function isHit(reel) {
    if (!state.result) return false;
    return (reel.kind === 'dir')
      ? state.result.directionMatch
      : state.result.digitMatches[reel.index];
  }

  /* ---------------- UI ---------------- */

  /* Kierroslaskurin teksti. Laskuri elää vain muistissa, joten sivun
   * lataaminen uudelleen nollaa sen. */
  function roundsText() {
    return t('rounds', state.rounds);
  }

  function setPhase(phase) {
    state.phase = phase;
    document.body.dataset.phase = phase;
    dom.lever.disabled = (phase === 'SPINNING');
    dom.lever.setAttribute('aria-disabled', phase === 'SPINNING' ? 'true' : 'false');

    updateHint();
  }

  function updateHint() {
    if (state.phase === 'SPINNING') dom.hint.textContent = t('hintSpinning');
    else if (state.phase === 'RESULT') dom.hint.textContent = roundsText();
    else dom.hint.textContent = t('hintReady');
  }

  function animateLever() {
    var ms = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      ? CONFIG.reducedTiming.leverMs : CONFIG.timing.leverMs;
    dom.lever.classList.remove('is-pulled');
    void dom.lever.offsetWidth;
    dom.lever.classList.add('is-pulled');
    setTimeout(function () { dom.lever.classList.remove('is-pulled'); }, ms);
  }

  function hideLucky() {
    if (luckyTimer) { clearTimeout(luckyTimer); luckyTimer = null; }
    dom.lucky.hidden = true;
    dom.lucky.classList.remove('is-visible');
  }

  function showLucky() {
    hideLucky();
    dom.lucky.hidden = false;
    void dom.lucky.offsetWidth;
    dom.lucky.classList.add('is-visible');
    Audio.lucky();
    luckyTimer = setTimeout(hideLucky, CONFIG.luckyMessageMs);
  }

  /* Ruudunlukijoille sama tieto kuin vihreät valot antavat visuaalisesti. */
  function announceRound() {
    var d = state.digits;
    var row = state.direction + ' ' + d.slice(0, 3).join('') + ' ' + t('srDegrees') + ' ' +
              d.slice(3, 5).join('') + ' ' + t('srPoint') + ' ' + d.slice(5).join('') + '.';

    var lit = [];
    Reels.each(function (reel) {
      if (isHit(reel)) lit.push(reel.kind === 'dir' ? t('srDirection') : reel.name);
    });

    dom.srStatus.textContent = row + ' ' +
      (lit.length ? t('srLit') + lit.join(', ') + '.' : t('srNone'));
  }

  function updateSoundButton() {
    var on = Audio.isEnabled();
    dom.soundToggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    dom.soundToggle.classList.toggle('is-off', !on);
    dom.soundText.textContent = on ? 'SOUNDS: ON' : 'SOUNDS: OFF';
  }

  function toggleSound() {
    Audio.setEnabled(!Audio.isEnabled());
    updateSoundButton();
    if (Audio.isEnabled()) Audio.unlock();
  }

  /* Kaikki staattiset tekstit valitulla kielellä. Rullien ja
   * ruudunlukijan tekstit päivitetään samalla. */
  function applyLanguage() {
    var lang = I18n.get();
    document.documentElement.lang = lang;
    document.title = t('pageTitle');
    dom.gameTitle.textContent = t('gameTitle');
    dom.subtitle.textContent = t('subtitle');
    dom.display.setAttribute('aria-label', t('displayLabel'));
    dom.luckyText.textContent = t('lucky');
    dom.lever.setAttribute('aria-label', t('leverAria'));
    dom.leverLabel.textContent = t('leverLabel');
    dom.backlink.textContent = t('backlink');
    dom.langToggle.dataset.lang = lang;
    dom.langToggle.setAttribute('aria-label', t('langButton'));
    dom.langToggle.title = t('langButton');
    updateHint();
    Reels.each(function (reel) {
      Reels.setLabel(reel, reel.value, reel.el.classList.contains('is-hit'));
    });
    if (state.phase === 'RESULT') announceRound();
  }

  function toggleLanguage() {
    I18n.set(I18n.get() === 'fi' ? 'en' : 'fi');
    applyLanguage();
  }

  /* ---------------- KIERROS ---------------- */

  function onReelStop(reel) {
    state.stopped++;
    Audio.reelStop();
    Audio.spinIntensity(1 - state.stopped / Reels.count());

    if (isHit(reel)) {
      Reels.markHit(reel);
      if (reel.kind === 'dir') Audio.directionHit();
      else Audio.hit(state.litSoFar);
      state.litSoFar++;
    } else {
      Reels.setLabel(reel, reel.value, false);
    }
  }

  function onRoundComplete() {
    Audio.spinStop();
    setPhase('RESULT');
    announceRound();
    if (state.result.hitCount >= CONFIG.luckyThreshold) showLucky();
  }

  function pullLever() {
    if (state.phase === 'SPINNING') return;

    Audio.unlock();
    Audio.lever();
    animateLever();

    hideLucky();
    Reels.clearHits();

    var values = rollRound();
    state.direction = values.direction;
    state.digits = values.digits;
    state.result = evaluate(values.direction, values.digits);
    state.stopped = 0;
    state.litSoFar = 0;
    state.rounds++;
    setPhase('SPINNING');

    Audio.spinStart();
    Reels.spin(values, {
      onReelStop: onReelStop,
      onComplete: onRoundComplete
    });
  }

  /* ---------------- KÄYNNISTYS ---------------- */

  function cacheDom() {
    dom.lever = document.getElementById('lever');
    dom.soundToggle = document.getElementById('soundToggle');
    dom.soundText = document.getElementById('soundToggleText');
    dom.lucky = document.getElementById('luckyMessage');
    dom.hint = document.getElementById('stateHint');
    dom.srStatus = document.getElementById('srStatus');
    dom.row = document.getElementById('row-main');
    dom.langToggle = document.getElementById('langToggle');
    dom.gameTitle = document.getElementById('gameTitle');
    dom.subtitle = document.getElementById('subtitle');
    dom.display = document.getElementById('display');
    dom.luckyText = document.getElementById('luckyText');
    dom.leverLabel = document.getElementById('leverLabel');
    dom.backlink = document.getElementById('backlink');
  }

  function bindEvents() {
    /* click kattaa sekä hiiren että kosketuksen; ei hover-riippuvuuksia. */
    dom.lever.addEventListener('click', pullLever);
    dom.soundToggle.addEventListener('click', toggleSound);
    dom.langToggle.addEventListener('click', toggleLanguage);

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(Reels.handleResize, 100);
    });
    window.addEventListener('orientationchange', function () {
      setTimeout(Reels.handleResize, 200);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(Reels.handleResize);
    }
  }

  function init() {
    cacheDom();
    Audio.loadPreference();
    updateSoundButton();
    I18n.load();
    Reels.build(dom.row);
    bindEvents();
    setPhase('READY');
    applyLanguage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Kehitystilan apurit konsoliin (eivät näy pelaajalle). */
  if (NJ.DEBUG.enabled) {
    NJ.debugSpin = pullLever;
    NJ.debugEvaluate = evaluate;
  }

})(window.NJ);
