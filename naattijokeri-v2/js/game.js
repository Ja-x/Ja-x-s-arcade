/* Naattijokeri – PELI
 *
 * Vastuu:
 *  - pelitila READY / SPINNING / RESULT
 *  - arvontalogiikka
 *  - osumien tunnistus
 *  - käyttöliittymä: vipu, äänikytkin, vähintään neljän osuman viesti
 *
 * Peli ei tunne krediittejä eikä Satelliittijahtia. Se tarjoaa vain kaksi
 * koukkua integraatiokerrokselle (js/credits.js):
 *   NJ.Game.setLocked(bool)   lukitsee vivun
 *   NJ.Game.setSpinGuard(fn)  fn palauttaa false, jos arvontaa ei sallita
 */

(function (NJ) {
  'use strict';

  var CONFIG = NJ.CONFIG;
  var DEBUG = NJ.DEBUG;
  var Audio = NJ.Audio;
  var Reels = NJ.Reels;

  /* ---------------- GAME STATE ---------------- */

  var state = {
    phase: 'READY',       // READY | SPINNING | RESULT
    values: null,         // kierroksen arvotut numerot
    hits: 0,              // vain sisäiseen käyttöön, ei näytetä pelaajalle
    stopped: 0
  };

  var winning = NJ.getWinningCoordinates();

  var dom = {};
  var luckyTimer = null;

  /* Integraatiokerroksen koukut: lukitus ja arvonnan lupa. */
  var locked = false;
  var spinGuard = null;

  /* ---------------- RANDOMIZATION ---------------- */

  /* Yksi numeropaikka: käyttää juuri sen rullan sallittuja arvoja. */
  function rollPlace(index) {
    var faces = Reels.facesFor(index);
    return faces[Math.floor(Math.random() * faces.length)];
  }

  function rollLine() {
    var out = [];
    for (var i = 0; i < 8; i++) out.push(rollPlace(i));
    return out;
  }

  function rollRound() {
    var values = { north: rollLine(), east: rollLine() };

    if (DEBUG.enabled) values = applyDebug(values);
    if (DEBUG.enabled && DEBUG.logRolls) {
      console.log('[naattijokeri] N', values.north.join(''), 'E', values.east.join(''));
    }
    return values;
  }

  /* Kehitystila: pakotettu tulos tai pakotettu määrä osumia. */
  function applyDebug(values) {
    if (DEBUG.forceResult) {
      return {
        north: DEBUG.forceResult.north.slice(),
        east: DEBUG.forceResult.east.slice()
      };
    }
    if (DEBUG.forceHits > 0) {
      var places = [];
      CONFIG.lines.forEach(function (line) {
        for (var i = 0; i < 8; i++) places.push({ line: line, index: i });
      });
      /* Fisher–Yates, jotta pakotetut osumat osuvat satunnaisiin paikkoihin. */
      for (var k = places.length - 1; k > 0; k--) {
        var j = Math.floor(Math.random() * (k + 1));
        var tmp = places[k]; places[k] = places[j]; places[j] = tmp;
      }
      var need = Math.min(DEBUG.forceHits, places.length);
      for (var p = 0; p < need; p++) {
        var slot = places[p];
        values[slot.line][slot.index] = winning[slot.line][slot.index];
      }
    }
    return values;
  }

  /* ---------------- MATCHING ---------------- */

  /* Osuma = sama numero samalla paikalla. */
  function isHit(reel) {
    return reel.value === winning[reel.line][reel.index];
  }

  /* ---------------- UI ---------------- */

  function setPhase(phase) {
    state.phase = phase;
    document.body.dataset.phase = phase;
    refreshLever();
  }

  /* Vipu on pois käytöstä sekä pyörimisen aikana että ilman krediittejä. */
  function refreshLever() {
    var off = (state.phase === 'SPINNING') || locked;
    dom.lever.disabled = off;
    dom.lever.setAttribute('aria-disabled', off ? 'true' : 'false');

    if (state.phase === 'SPINNING') {
      dom.hint.textContent = 'Rullat pyörivät…';
    } else if (locked) {
      dom.hint.textContent = 'Ei krediittejä – hae lisää Satelliittijahdista.';
    } else if (state.phase === 'RESULT') {
      dom.hint.textContent = 'Kirjoita vihreänä hohtavat numerot muistiin ja vedä uudelleen.';
    } else {
      dom.hint.textContent = 'Paina vipua ja katso, mitkä numerot syttyvät vihreinä.';
    }
  }

  function setLocked(value) {
    locked = !!value;
    document.body.dataset.credits = locked ? 'empty' : 'ok';
    if (dom.lever) refreshLever();
  }

  function setSpinGuard(fn) {
    spinGuard = (typeof fn === 'function') ? fn : null;
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
    var lit = [];
    var text = [];

    CONFIG.lines.forEach(function (line) {
      var d = state.values[line];
      var prefix = (line === 'north') ? 'N ' : 'E ';
      text.push(prefix + d.slice(0, 3).join('') + ' astetta ' +
                d.slice(3, 5).join('') + ' pilkku ' + d.slice(5).join(''));
    });

    Reels.each(function (reel) {
      if (isHit(reel)) lit.push(reel.name);
    });

    dom.srStatus.textContent = text.join('. ') + '. ' +
      (lit.length ? 'Vihreä valo paikoissa: ' + lit.join(', ') + '.' : 'Ei vihreitä valoja.');
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

  /* ---------------- KIERROS ---------------- */

  function onReelStop(reel) {
    state.stopped++;
    Audio.reelStop();
    Audio.spinIntensity(1 - state.stopped / Reels.count());

    if (isHit(reel)) {
      Reels.markHit(reel);
      Audio.hit(state.hits);
      state.hits++;
    } else {
      Reels.setLabel(reel, reel.value, false);
    }
  }

  function onRoundComplete() {
    Audio.spinStop();
    setPhase('RESULT');
    announceRound();
    if (state.hits >= CONFIG.luckyThreshold) showLucky();
  }

  function pullLever() {
    if (state.phase === 'SPINNING' || locked) return;

    /* Integraatiokerros veloittaa krediitin ja voi estää arvonnan. */
    if (spinGuard && !spinGuard()) return;

    Audio.unlock();
    Audio.lever();
    animateLever();

    hideLucky();
    Reels.clearHits();

    state.values = rollRound();
    state.hits = 0;
    state.stopped = 0;
    setPhase('SPINNING');

    Audio.spinStart();
    Reels.spin(state.values, {
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
    dom.rowNorth = document.getElementById('row-north');
    dom.rowEast = document.getElementById('row-east');
  }

  function bindEvents() {
    /* click kattaa sekä hiiren että kosketuksen; ei hover-riippuvuuksia. */
    dom.lever.addEventListener('click', pullLever);
    dom.soundToggle.addEventListener('click', toggleSound);

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
    Reels.build({ north: dom.rowNorth, east: dom.rowEast });
    bindEvents();
    setPhase('READY');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Rajapinta integraatiokerrokselle. */
  NJ.Game = {
    setLocked: setLocked,
    setSpinGuard: setSpinGuard,
    isLocked: function () { return locked; }
  };

  /* Kehitystilan apuri konsoliin (ei näy pelaajalle). */
  if (NJ.DEBUG.enabled) NJ.debugSpin = pullLever;

})(window.NJ);
