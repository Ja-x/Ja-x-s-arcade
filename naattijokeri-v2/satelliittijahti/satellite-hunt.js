/* Satelliittijahti – itsenäinen krediittipeli
 *
 * Moduuli ei tiedä mitään Naattijokerin arvontalogiikasta. Se rakentaa oman
 * käyttöliittymänsä annettuun mount-elementtiin ja ilmoittaa kierroksen
 * alusta ja lopusta callbackeilla:
 *
 *   SatelliteHunt.init({
 *     mount:        HTMLElement,
 *     onRoundStart: function () {},
 *     onRoundEnd:   function (earnedCredits) {}
 *   });
 *
 * Yhteinen krediittisaldo pidetään integraatiokerroksessa, ei täällä.
 * Sama moduuli voidaan siksi liittää myöhemmin myös Onnenpeliin.
 */

(function (global) {
  'use strict';

  /* ================================================================
   * KEHITYSTILA
   * Pidä DEBUG_MODE = false tuotannossa. Mikään debug-toiminto ei näy
   * pelaajalle, kun lippu on false.
   * ================================================================ */

  var DEBUG_MODE = false;

  var DEBUG = {
    shortRound: true,        // lyhennetty kierros kehitystilassa
    shortRoundMs: 8000,
    forceSatellite: null,    // 'normal' | 'rare' | null
    forceFall: false,        // pakota jokainen satelliitti putoamaan
    forceSignal: null,       // 'good' | 'interference' | null
    showHitboxes: true,      // piirrä törmäysalueet
    showCounters: true       // näytä aktiivisten kohteiden määrät
  };

  /* ================================================================
   * ASETUKSET
   *
   * Vaakasuuntaiset arvot ovat prosentteja pelialueen leveydestä,
   * pystysuuntaiset prosentteja korkeudesta. Nopeudet ovat
   * yksiköitä sekunnissa. Vaikeustaso on vakio koko kierroksen ajan.
   * ================================================================ */

  var ROUND_MS = 20000;
  var STUN_MS = 1500;

  var SATELLITE_WEIGHTS = {
    normal: 0.85,
    rare: 0.15
  };

  var SIGNAL_WEIGHTS = {
    good: 0.70,
    interference: 0.30
  };

  var SATELLITE_FALL_PROBABILITY = 0.10;

  var SATELLITE_SPAWN_MIN = 3000;
  var SATELLITE_SPAWN_MAX = 6000;

  var SIGNAL_EMIT_MIN = 800;
  var SIGNAL_EMIT_MAX = 1500;

  var CONFIG = {
    satellite: {
      maxActive: 2,          // vain vaakalennossa olevat lasketaan
      speed: 21,             // %/s vaakasuunnassa
      rareSpeedFactor: 1.2,  // harvinainen ~20 % nopeampi
      laneMin: 11,           // ylin lentokorkeus (% korkeudesta)
      laneMax: 27,
      fallGravity: 58,       // %/s² – sama molemmille tyypeille
      fallStartMin: 22,      // putoaminen alkaa tällä välillä radan varrella
      fallStartMax: 78,
      creditsNormal: 3,
      creditsRare: 5
    },

    signal: {
      maxActive: 6,
      goodSpeed: 46,                 // %/s alaspäin
      interferenceSpeedFactor: 1.15, // häiriö ~15 % nopeampi
      driftMax: 22,                  // %/s sivuttain (vino signaali)
      creditsGood: 1
    },

    receiver: {
      speed: 62,   // %/s
      y: 86        // keskipisteen korkeus (% korkeudesta)
    },

    /* Osuma-alue on hieman grafiikkaa anteeksiantavampi. */
    hitPadPx: 5
  };

  /* Elementtien koot suhteessa pelialueen leveyteen (px-rajoilla). */
  var SIZE = {
    satellite: { factor: 0.135, min: 46, max: 88 },
    signal:    { factor: 0.050, min: 17, max: 30 },
    receiver:  { factor: 0.145, min: 54, max: 96 }
  };

  /* ================================================================
   * ÄÄNET
   * Kaikki tehosteet tuotetaan Web Audio APIlla. Ei taustamusiikkia,
   * ei äänitiedostoja.
   * ================================================================ */

  var Sound = (function () {
    var STORAGE_KEY = 'satelliittijahti.sounds';
    var MASTER = 0.45;

    var ctx = null;
    var master = null;
    var noise = null;
    var enabled = true;

    function ensure() {
      if (!ctx) {
        var Ctor = global.AudioContext || global.webkitAudioContext;
        if (!Ctor) return null;
        ctx = new Ctor();
        master = ctx.createGain();
        master.gain.value = MASTER;
        master.connect(ctx.destination);
      }
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
      return ctx;
    }

    function ready() {
      return enabled ? ensure() : null;
    }

    function noiseBuffer() {
      if (noise) return noise;
      var len = Math.floor(ctx.sampleRate * 0.7);
      noise = ctx.createBuffer(1, len, ctx.sampleRate);
      var data = noise.getChannelData(0);
      for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      return noise;
    }

    function burst(opts) {
      var t = ctx.currentTime + (opts.delay || 0);
      var src = ctx.createBufferSource();
      src.buffer = noiseBuffer();
      src.loop = true;

      var filter = ctx.createBiquadFilter();
      filter.type = opts.type || 'bandpass';
      filter.frequency.setValueAtTime(opts.freq || 1200, t);
      if (opts.freqTo) {
        filter.frequency.exponentialRampToValueAtTime(opts.freqTo, t + (opts.decay || 0.1));
      }
      filter.Q.value = opts.q || 1;

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(opts.gain || 0.2, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + (opts.decay || 0.1));

      src.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      src.start(t);
      src.stop(t + (opts.decay || 0.1) + 0.05);
    }

    function tone(opts) {
      var t = ctx.currentTime + (opts.delay || 0);
      var osc = ctx.createOscillator();
      osc.type = opts.type || 'triangle';
      osc.frequency.setValueAtTime(opts.from || 440, t);
      if (opts.to && opts.to !== opts.from) {
        osc.frequency.exponentialRampToValueAtTime(opts.to, t + (opts.decay || 0.2));
      }

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(opts.gain || 0.18, t + (opts.attack || 0.008));
      gain.gain.exponentialRampToValueAtTime(0.0001, t + (opts.decay || 0.2));

      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + (opts.decay || 0.2) + 0.05);
    }

    return {
      /* 1. kierroksen käynnistyminen */
      roundStart: function () {
        if (!ready()) return;
        tone({ type: 'square', from: 320, to: 780, gain: 0.16, decay: 0.24 });
        tone({ type: 'sine', from: 640, to: 1560, gain: 0.12, decay: 0.3, delay: 0.1 });
      },

      /* 2. hyvä signaali vastaanotettu */
      good: function (streak) {
        if (!ready()) return;
        var scale = [880, 987.77, 1174.66, 1318.51, 1567.98, 1760];
        var f = scale[Math.min(streak || 0, scale.length - 1)];
        tone({ type: 'triangle', from: f, gain: 0.2, decay: 0.16 });
        tone({ type: 'sine', from: f * 2, gain: 0.07, decay: 0.12 });
      },

      /* 3. tavallinen satelliitti napattu */
      catchNormal: function () {
        if (!ready()) return;
        burst({ freq: 900, q: 1.1, gain: 0.2, decay: 0.09 });
        tone({ type: 'square', from: 440, to: 880, gain: 0.18, decay: 0.22 });
      },

      /* 4. harvinainen satelliitti napattu */
      catchRare: function () {
        if (!ready()) return;
        var notes = [659.25, 830.61, 987.77, 1318.5];
        for (var i = 0; i < notes.length; i++) {
          tone({ type: 'square', from: notes[i], gain: 0.15, decay: 0.24, delay: i * 0.07 });
        }
      },

      /* 5. häiriösignaaliin osuminen */
      interference: function () {
        if (!ready()) return;
        burst({ type: 'lowpass', freq: 1800, freqTo: 220, q: 3, gain: 0.3, decay: 0.42 });
        tone({ type: 'sawtooth', from: 220, to: 70, gain: 0.16, decay: 0.4 });
      },

      /* 6. vastaanottimen palautuminen */
      recover: function () {
        if (!ready()) return;
        tone({ type: 'sine', from: 420, to: 880, gain: 0.14, decay: 0.2 });
      },

      /* 7. kierroksen päättyminen */
      roundEnd: function () {
        if (!ready()) return;
        var notes = [784, 659.25, 523.25];
        for (var i = 0; i < notes.length; i++) {
          tone({ type: 'triangle', from: notes[i], gain: 0.17, decay: 0.3, delay: i * 0.12 });
        }
      },

      isEnabled: function () { return enabled; },

      setEnabled: function (value) {
        enabled = !!value;
        try { localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off'); } catch (e) { /* ei tallennusta */ }
        return enabled;
      },

      loadPreference: function () {
        try {
          var saved = localStorage.getItem(STORAGE_KEY);
          if (saved === 'on') enabled = true;
          else if (saved === 'off') enabled = false;
        } catch (e) { /* ei tallennusta */ }
        return enabled;
      },

      unlock: function () { if (enabled) ensure(); }
    };
  })();

  /* ================================================================
   * APUFUNKTIOT
   * ================================================================ */

  function rand(min, max) { return min + Math.random() * (max - min); }
  function clamp(v, min, max) { return v < min ? min : (v > max ? max : v); }

  function sizePx(spec, width) {
    return clamp(width * spec.factor, spec.min, spec.max);
  }

  function el(tag, cls, parent) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (parent) parent.appendChild(node);
    return node;
  }

  /* ================================================================
   * TILA
   * ================================================================ */

  var STATE = {
    WAITING: 'WAITING',
    PLAYING: 'PLAYING',
    STUNNED: 'STUNNED',
    ROUND_END: 'ROUND_END',
    LOCKED: 'LOCKED_BY_CREDITS'
  };

  var hooks = { onRoundStart: null, onRoundEnd: null };
  var dom = {};
  var view = { w: 0, h: 0 };
  var size = { satellite: 0, signal: 0, receiver: 0 };

  var state = STATE.WAITING;
  var raf = null;
  var lastTs = 0;

  var roundCredits = 0;
  var remainingMs = ROUND_MS;
  var spawnTimer = 0;
  var stunLeft = 0;
  var goodStreak = 0;

  var satellites = [];
  var signals = [];

  var receiver = { x: 50, moving: 0 };
  var input = { left: false, right: false };

  var reducedMotion = false;

  /* ================================================================
   * KÄYTTÖLIITTYMÄN RAKENTAMINEN
   * ================================================================ */

  function build(mount) {
    mount.classList.add('sh');
    mount.innerHTML = '';

    var crown = el('header', 'sh__crown', mount);
    var title = el('h2', 'sh__title', crown);
    title.textContent = 'SATELLIITTIJAHTI';

    /* ---- mittarit ---- */
    var hud = el('div', 'sh__hud', mount);

    var timeStat = el('div', 'sh__stat sh__stat--time', hud);
    timeStat.appendChild(document.createTextNode('AIKAA: '));
    dom.time = el('b', 'sh__stat-value', timeStat);
    timeStat.appendChild(document.createTextNode(' s'));

    var scoreStat = el('div', 'sh__stat sh__stat--score', hud);
    scoreStat.appendChild(document.createTextNode('KERÄTTY: '));
    dom.score = el('b', 'sh__stat-value', scoreStat);
    dom.scoreStat = scoreStat;

    dom.soundToggle = el('button', 'sh__sound', hud);
    dom.soundToggle.type = 'button';
    dom.soundToggle.setAttribute('aria-pressed', 'true');
    var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('class', 'sh__sound-icon');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML =
      '<path class="sh__sound-cone" d="M4 9h4l5-4v14l-5-4H4z"/>' +
      '<g class="sh__sound-waves"><path d="M16.5 9a4.5 4.5 0 0 1 0 6"/><path d="M19 6.5a8 8 0 0 1 0 11"/></g>' +
      '<g class="sh__sound-cross"><path d="M17 9.5l5 5"/><path d="M22 9.5l-5 5"/></g>';
    dom.soundToggle.appendChild(icon);
    dom.soundText = el('span', 'sh__sound-text', dom.soundToggle);

    /* ---- pelialue ---- */
    dom.field = el('div', 'sh__field', mount);
    el('div', 'sh__stars', dom.field);
    el('div', 'sh__horizon', dom.field);
    dom.layer = el('div', 'sh__layer', dom.field);

    dom.receiver = el('div', 'sh__receiver', dom.field);
    dom.receiver.innerHTML =
      '<span class="sh__rec-antenna"></span>' +
      '<span class="sh__rec-body">' +
        '<span class="sh__rec-screen">' +
          '<span class="sh__rec-eye"></span><span class="sh__rec-eye"></span>' +
          '<span class="sh__rec-mouth"></span>' +
        '</span>' +
        '<span class="sh__rec-buttons"></span>' +
      '</span>' +
      '<span class="sh__rec-jam">HÄIRIÖ!</span>';

    /* ---- peittokerros: aloitus ja tulos ---- */
    dom.overlay = el('div', 'sh__overlay', dom.field);
    dom.overlayTitle = el('p', 'sh__overlay-title', dom.overlay);
    dom.overlayText = el('p', 'sh__overlay-text', dom.overlay);
    dom.start = el('button', 'sh__start', dom.overlay);
    dom.start.type = 'button';
    dom.start.textContent = 'ALOITA SATELLIITTIJAHTI';

    /* ---- ohjauspainikkeet ---- */
    var controls = el('div', 'sh__controls', mount);
    dom.padLeft = el('button', 'sh__pad sh__pad--left', controls);
    dom.padLeft.type = 'button';
    dom.padLeft.setAttribute('aria-label', 'Liikuta vastaanotinta vasemmalle');
    dom.padLeft.innerHTML = '<span class="sh__pad-arrow">&#9664;</span><span>VASEN</span>';

    dom.padRight = el('button', 'sh__pad sh__pad--right', controls);
    dom.padRight.type = 'button';
    dom.padRight.setAttribute('aria-label', 'Liikuta vastaanotinta oikealle');
    dom.padRight.innerHTML = '<span>OIKEA</span><span class="sh__pad-arrow">&#9654;</span>';

    dom.hint = el('p', 'sh__hint', mount);
    dom.hint.textContent =
      'Kerää hyviä signaaleja (+1), nappaa putoavia satelliitteja (+3 / +5) ja väistä häiriöitä.';

    dom.status = el('p', 'sh__sr', mount);
    dom.status.setAttribute('role', 'status');
    dom.status.setAttribute('aria-live', 'polite');

    if (DEBUG_MODE && DEBUG.showCounters) {
      dom.debug = el('p', 'sh__debug', mount);
    }
    if (DEBUG_MODE && DEBUG.showHitboxes) {
      dom.field.classList.add('sh--hitboxes');
    }
  }

  /* ================================================================
   * MITAT
   * ================================================================ */

  function measure() {
    var rect = dom.field.getBoundingClientRect();
    view.w = rect.width || 1;
    view.h = rect.height || 1;

    size.satellite = sizePx(SIZE.satellite, view.w);
    size.signal = sizePx(SIZE.signal, view.w);
    size.receiver = sizePx(SIZE.receiver, view.w);

    dom.receiver.style.width = size.receiver + 'px';
    dom.receiver.style.height = (size.receiver * 0.95) + 'px';

    satellites.forEach(applyEntitySize);
    signals.forEach(applyEntitySize);
  }

  function applyEntitySize(item) {
    item.el.style.width = item.w + 'px';
    item.el.style.height = item.h + 'px';
  }

  /* Prosenttikoordinaatit pikseleiksi törmäystunnistusta varten. */
  function boxOf(item) {
    return {
      x: item.x / 100 * view.w,
      y: item.y / 100 * view.h,
      w: item.w,
      h: item.h
    };
  }

  function receiverBox() {
    return {
      x: receiver.x / 100 * view.w,
      y: CONFIG.receiver.y / 100 * view.h,
      w: size.receiver * 0.78,          // hieman grafiikkaa kapeampi runko
      h: size.receiver * 0.8
    };
  }

  /* Yksinkertainen AABB, hieman anteeksiantava. */
  function overlaps(a, b) {
    var pad = CONFIG.hitPadPx;
    return Math.abs(a.x - b.x) * 2 < (a.w + b.w + pad * 2) &&
           Math.abs(a.y - b.y) * 2 < (a.h + b.h + pad * 2);
  }

  /* ================================================================
   * SATELLIITIT
   * ================================================================ */

  function pickSatelliteType() {
    if (DEBUG_MODE && DEBUG.forceSatellite) return DEBUG.forceSatellite;
    return Math.random() < SATELLITE_WEIGHTS.rare ? 'rare' : 'normal';
  }

  function flyingSatellites() {
    var n = 0;
    for (var i = 0; i < satellites.length; i++) if (!satellites[i].falling) n++;
    return n;
  }

  function spawnSatellite() {
    var cfg = CONFIG.satellite;
    var type = pickSatelliteType();
    var rare = (type === 'rare');
    var dir = Math.random() < 0.5 ? 1 : -1;
    var speed = cfg.speed * (rare ? cfg.rareSpeedFactor : 1);
    var w = size.satellite * (rare ? 0.78 : 1);

    var willFall = DEBUG_MODE && DEBUG.forceFall
      ? true
      : Math.random() < SATELLITE_FALL_PROBABILITY;

    var node = el('div', 'sh-sat' + (rare ? ' sh-sat--rare' : ''), dom.layer);
    node.innerHTML =
      '<span class="sh-sat__panel sh-sat__panel--l"></span>' +
      '<span class="sh-sat__body"></span>' +
      '<span class="sh-sat__dish"></span>' +
      '<span class="sh-sat__panel sh-sat__panel--r"></span>';

    var sat = {
      el: node,
      type: type,
      rare: rare,
      x: dir > 0 ? -8 : 108,
      y: rand(cfg.laneMin, cfg.laneMax),
      vx: speed * dir,
      vy: 0,
      dir: dir,
      w: w,
      h: w * 0.62,
      falling: false,
      willFall: willFall,
      fallAt: rand(cfg.fallStartMin, cfg.fallStartMax),
      emitTimer: rand(SIGNAL_EMIT_MIN, SIGNAL_EMIT_MAX)
    };

    applyEntitySize(sat);
    satellites.push(sat);
  }

  function startFalling(sat) {
    sat.falling = true;
    sat.vy = 0;
    sat.el.classList.add('is-falling');
  }

  function removeSatellite(index) {
    var sat = satellites[index];
    if (sat.el.parentNode) sat.el.parentNode.removeChild(sat.el);
    satellites.splice(index, 1);
  }

  function updateSatellites(dt) {
    var cfg = CONFIG.satellite;

    for (var i = satellites.length - 1; i >= 0; i--) {
      var sat = satellites[i];

      sat.x += sat.vx * dt;

      if (sat.falling) {
        sat.vy += cfg.fallGravity * dt;
        sat.y += sat.vy * dt;
      } else if (sat.willFall) {
        /* Putoaminen alkaa satunnaisessa kohdassa vaakalentoa. */
        var passed = sat.dir > 0 ? (sat.x >= sat.fallAt) : (sat.x <= sat.fallAt);
        if (passed) startFalling(sat);
      }

      /* Putoavakin satelliitti jatkaa signaalien lähettämistä. */
      sat.emitTimer -= dt * 1000;
      if (sat.emitTimer <= 0) {
        if (signals.length < CONFIG.signal.maxActive) {
          emitSignal(sat);
          sat.emitTimer = rand(SIGNAL_EMIT_MIN, SIGNAL_EMIT_MAX);
        }
        /* Jos signaaliraja on täynnä, odotetaan tilan vapautumista. */
      }

      if (sat.y > 112 || sat.x < -14 || sat.x > 114) removeSatellite(i);
    }

    /* Uusien satelliittien luonti: enintään kaksi vaakalennossa. */
    spawnTimer -= dt * 1000;
    if (spawnTimer <= 0 && flyingSatellites() < cfg.maxActive) {
      spawnSatellite();
      spawnTimer = rand(SATELLITE_SPAWN_MIN, SATELLITE_SPAWN_MAX);
    }
  }

  /* ================================================================
   * SIGNAALIT
   * ================================================================ */

  function pickSignalType() {
    if (DEBUG_MODE && DEBUG.forceSignal) return DEBUG.forceSignal;
    return Math.random() < SIGNAL_WEIGHTS.good ? 'good' : 'interference';
  }

  function emitSignal(sat) {
    var cfg = CONFIG.signal;
    var type = pickSignalType();
    var bad = (type === 'interference');

    var node = el('div', 'sh-sig sh-sig--' + (bad ? 'bad' : 'good'), dom.layer);
    if (!bad) {
      node.innerHTML = '<span></span><span></span><span></span>';
    }

    var sig = {
      el: node,
      type: type,
      bad: bad,
      x: sat.x,
      y: sat.y + 4,
      vx: rand(-cfg.driftMax, cfg.driftMax),
      vy: cfg.goodSpeed * (bad ? cfg.interferenceSpeedFactor : 1),
      w: size.signal,
      h: size.signal * 1.7
    };

    applyEntitySize(sig);

    /* Käännä signaali kulkusuuntaansa, jotta vino lähetys näkyy. */
    var angle = Math.atan2(sig.vx / 100 * view.w, sig.vy / 100 * view.h) * 180 / Math.PI;
    sig.angle = clamp(-angle, -38, 38);

    signals.push(sig);
  }

  function removeSignal(index) {
    var sig = signals[index];
    if (sig.el.parentNode) sig.el.parentNode.removeChild(sig.el);
    signals.splice(index, 1);
  }

  function updateSignals(dt) {
    for (var i = signals.length - 1; i >= 0; i--) {
      var sig = signals[i];
      sig.x += sig.vx * dt;
      sig.y += sig.vy * dt;
      /* Ohi menevä signaali katoaa ilman vaikutusta. */
      if (sig.y > 108) removeSignal(i);
    }
  }

  /* ================================================================
   * VASTAANOTIN JA OHJAUS
   * ================================================================ */

  function updateReceiver(dt) {
    if (state === STATE.STUNNED) { receiver.moving = 0; return; }

    var dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    receiver.moving = dir;
    if (!dir) return;

    var halfPct = (size.receiver / 2) / view.w * 100;
    receiver.x = clamp(receiver.x + dir * CONFIG.receiver.speed * dt, halfPct, 100 - halfPct);
  }

  function setKey(event, down) {
    var key = event.key;
    var left = (key === 'ArrowLeft' || key === 'a' || key === 'A');
    var right = (key === 'ArrowRight' || key === 'd' || key === 'D');
    if (!left && !right) return;

    if (state === STATE.PLAYING || state === STATE.STUNNED) event.preventDefault();
    if (left) input.left = down;
    if (right) input.right = down;
  }

  function bindPad(button, side) {
    function press(event) {
      event.preventDefault();
      input[side] = true;
      button.classList.add('is-down');
      if (button.setPointerCapture && event.pointerId !== undefined) {
        try { button.setPointerCapture(event.pointerId); } catch (e) { /* ohitetaan */ }
      }
    }
    function release() {
      input[side] = false;
      button.classList.remove('is-down');
    }

    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    /* Varmistus: jos ote katoaa painikkeen ulkopuolella, liike päättyy silti. */
    document.addEventListener('pointerup', release);
    document.addEventListener('pointercancel', release);
    /* Näppäimistökäyttö: painallus liikuttaa niin kauan kuin näppäin on pohjassa. */
    button.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); input[side] = true; }
    });
    button.addEventListener('keyup', function (e) {
      if (e.key === ' ' || e.key === 'Enter') release();
    });
  }

  /* ================================================================
   * TÖRMÄYKSET
   * ================================================================ */

  function checkCollisions() {
    /* Jumituksen aikana mikään ei osu: kaikki kulkee läpi. */
    if (state === STATE.STUNNED) return;

    var rec = receiverBox();
    var i;

    for (i = signals.length - 1; i >= 0; i--) {
      if (!overlaps(rec, boxOf(signals[i]))) continue;

      if (signals[i].bad) {
        removeSignal(i);
        startStun();
        return;               // jumitus keskeyttää loput tarkistukset
      }

      removeSignal(i);
      addCredits(CONFIG.signal.creditsGood, 'good');
    }

    for (i = satellites.length - 1; i >= 0; i--) {
      var sat = satellites[i];
      if (!sat.falling) continue;                 // vain putoavan voi napata
      if (!overlaps(rec, boxOf(sat))) continue;

      var reward = sat.rare ? CONFIG.satellite.creditsRare : CONFIG.satellite.creditsNormal;
      removeSatellite(i);                          // signaalien lähetys loppuu samalla
      addCredits(reward, sat.rare ? 'rare' : 'normal');
    }
  }

  function addCredits(amount, kind) {
    roundCredits += amount;
    dom.score.textContent = roundCredits;

    dom.scoreStat.classList.remove('is-pop');
    void dom.scoreStat.offsetWidth;
    dom.scoreStat.classList.add('is-pop');

    if (kind === 'good') {
      Sound.good(goodStreak);
      goodStreak++;
    } else if (kind === 'rare') {
      Sound.catchRare();
      flashField('rare');
    } else {
      Sound.catchNormal();
      flashField('normal');
    }
  }

  function flashField(kind) {
    if (reducedMotion) return;
    var cls = 'is-flash-' + kind;
    dom.field.classList.remove(cls);
    void dom.field.offsetWidth;
    dom.field.classList.add(cls);
    setTimeout(function () { dom.field.classList.remove(cls); }, 380);
  }

  function startStun() {
    state = STATE.STUNNED;
    stunLeft = STUN_MS;
    goodStreak = 0;
    input.left = false;
    input.right = false;
    dom.padLeft.classList.remove('is-down');
    dom.padRight.classList.remove('is-down');
    dom.receiver.classList.add('is-stunned');
    dom.field.dataset.state = state;
    dom.status.textContent = 'Häiriö! Vastaanotin ei toimi hetkeen.';
    Sound.interference();
  }

  function endStun() {
    state = STATE.PLAYING;
    dom.receiver.classList.remove('is-stunned');
    dom.field.dataset.state = state;
    Sound.recover();
  }

  /* ================================================================
   * PIIRTO
   * ================================================================ */

  function render() {
    var i;

    for (i = 0; i < satellites.length; i++) {
      var sat = satellites[i];
      var sx = sat.x / 100 * view.w;
      var sy = sat.y / 100 * view.h;
      /* Peilaus hoitaa vasemmalle lentävän kallistuksen suunnan. */
      var tilt = sat.falling ? clamp(sat.vy * 0.6, 0, 55) : 0;
      sat.el.style.transform =
        'translate(-50%, -50%) translate(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px)' +
        (sat.dir < 0 ? ' scaleX(-1)' : '') +
        (tilt ? ' rotate(' + (-tilt).toFixed(1) + 'deg)' : '');
    }

    for (i = 0; i < signals.length; i++) {
      var sig = signals[i];
      var gx = sig.x / 100 * view.w;
      var gy = sig.y / 100 * view.h;
      sig.el.style.transform =
        'translate(-50%, -50%) translate(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px)' +
        ' rotate(' + sig.angle.toFixed(1) + 'deg)';
    }

    var rx = receiver.x / 100 * view.w;
    var ry = CONFIG.receiver.y / 100 * view.h;
    dom.receiver.style.transform =
      'translate(-50%, -50%) translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)';

    if (dom.debug) {
      dom.debug.textContent =
        'DEBUG – satelliitit: ' + satellites.length +
        ' (vaakalennossa ' + flyingSatellites() + ')' +
        ' · signaalit: ' + signals.length +
        ' · tila: ' + state;
    }
  }

  /* ================================================================
   * KIERROS
   * ================================================================ */

  function roundLength() {
    return (DEBUG_MODE && DEBUG.shortRound) ? DEBUG.shortRoundMs : ROUND_MS;
  }

  function showTime() {
    dom.time.textContent = Math.max(0, Math.ceil(remainingMs / 1000));
  }

  function clearEntities() {
    while (satellites.length) removeSatellite(satellites.length - 1);
    while (signals.length) removeSignal(signals.length - 1);
  }

  function startRound() {
    if (state !== STATE.WAITING && state !== STATE.ROUND_END) return;

    Sound.unlock();
    clearEntities();
    measure();

    roundCredits = 0;
    goodStreak = 0;
    remainingMs = roundLength();
    spawnTimer = 0;               // ensimmäinen satelliitti heti
    stunLeft = 0;
    receiver.x = 50;
    input.left = false;
    input.right = false;

    dom.score.textContent = '0';
    showTime();
    dom.overlay.classList.remove('is-visible');
    dom.receiver.classList.remove('is-stunned');

    state = STATE.PLAYING;
    dom.field.dataset.state = state;
    dom.status.textContent = 'Satelliittijahti alkoi.';

    Sound.roundStart();
    if (hooks.onRoundStart) hooks.onRoundStart();

    lastTs = 0;
    if (!raf) raf = requestAnimationFrame(loop);
    render();
  }

  function endRound() {
    state = STATE.ROUND_END;
    dom.field.dataset.state = state;

    clearEntities();
    input.left = false;
    input.right = false;
    dom.receiver.classList.remove('is-stunned');
    remainingMs = 0;
    showTime();

    stopLoop();
    Sound.roundEnd();

    dom.overlayTitle.textContent = 'KIERROS PÄÄTTYI';
    dom.overlayText.textContent = 'ANSAITSIT ' + roundCredits +
      (roundCredits === 1 ? ' KREDIITIN' : ' KREDIITTIÄ');
    dom.overlay.classList.add('is-visible');
    dom.status.textContent = 'Kierros päättyi. Ansaitsit ' + roundCredits + ' krediittiä.';

    /* Krediitit siirtyvät yhteiseen saldoon vasta tässä. */
    if (hooks.onRoundEnd) hooks.onRoundEnd(roundCredits);

    /* Jos integraatio ei lukinnut peliä (saldo jäi nollaan), uuden
       kierroksen voi aloittaa heti. */
    if (state === STATE.ROUND_END) showWaiting(true);
  }

  function showWaiting(afterRound) {
    state = STATE.WAITING;
    dom.field.dataset.state = state;
    dom.start.disabled = false;
    dom.start.hidden = false;
    dom.overlay.classList.add('is-visible');

    if (!afterRound) {
      dom.overlayTitle.textContent = 'SATELLIITTIJAHTI';
      dom.overlayText.textContent = 'Kerää krediittejä Naattijokerin arvontoihin.';
    } else {
      dom.overlayText.textContent += ' – uusi kierros voi alkaa heti.';
    }
    remainingMs = roundLength();
    showTime();
  }

  function showLocked() {
    /* Heti kierroksen jälkeen tulosteksti jää näkyviin. */
    var afterRound = (state === STATE.ROUND_END);

    state = STATE.LOCKED;
    dom.field.dataset.state = state;
    dom.start.disabled = true;
    dom.start.hidden = true;
    dom.overlay.classList.add('is-visible');

    if (afterRound) {
      dom.overlayText.textContent += ' – käytä ne Naattijokerin vivulla.';
    } else {
      dom.overlayTitle.textContent = 'KREDIITIT ODOTTAVAT';
      dom.overlayText.textContent = 'Käytä krediitit Naattijokerin vivulla. ' +
        'Uusi Satelliittijahti aukeaa, kun saldo on 0.';
    }
  }

  /* ================================================================
   * SILMUKKA
   * ================================================================ */

  function stopLoop() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  function loop(ts) {
    raf = requestAnimationFrame(loop);

    if (!lastTs) { lastTs = ts; return; }
    var dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    if (state !== STATE.PLAYING && state !== STATE.STUNNED) return;

    /* Ajastin jatkaa myös jumituksen aikana. */
    remainingMs -= dt * 1000;
    showTime();

    if (state === STATE.STUNNED) {
      stunLeft -= dt * 1000;
      if (stunLeft <= 0) endStun();
    }

    updateReceiver(dt);
    updateSatellites(dt);
    updateSignals(dt);
    checkCollisions();
    render();

    if (remainingMs <= 0) endRound();
  }

  /* ================================================================
   * ÄÄNIKYTKIN
   * ================================================================ */

  function updateSoundButton() {
    var on = Sound.isEnabled();
    dom.soundToggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    dom.soundToggle.classList.toggle('is-off', !on);
    dom.soundText.textContent = on ? 'SOUNDS: ON' : 'SOUNDS: OFF';
  }

  function toggleSound() {
    Sound.setEnabled(!Sound.isEnabled());
    updateSoundButton();
    if (Sound.isEnabled()) Sound.unlock();
  }

  /* ================================================================
   * JULKINEN RAJAPINTA
   * ================================================================ */

  function init(options) {
    var opts = options || {};
    var mount = opts.mount ||
      (opts.mountId ? document.getElementById(opts.mountId) : null);
    if (!mount) return null;

    hooks.onRoundStart = opts.onRoundStart || null;
    hooks.onRoundEnd = opts.onRoundEnd || null;

    reducedMotion = !!(global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches);

    build(mount);
    Sound.loadPreference();
    updateSoundButton();

    dom.soundToggle.addEventListener('click', toggleSound);
    dom.start.addEventListener('click', startRound);
    bindPad(dom.padLeft, 'left');
    bindPad(dom.padRight, 'right');

    document.addEventListener('keydown', function (e) { setKey(e, true); });
    document.addEventListener('keyup', function (e) { setKey(e, false); });

    /* Välilehden vaihto ei saa jättää näppäintä pohjaan. */
    global.addEventListener('blur', function () {
      input.left = false;
      input.right = false;
    });

    var resizeTimer = null;
    global.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { measure(); render(); }, 100);
    });
    global.addEventListener('orientationchange', function () {
      setTimeout(function () { measure(); render(); }, 200);
    });

    measure();
    showWaiting(false);
    render();

    return SatelliteHunt;
  }

  /* Integraatiokerros lukitsee pelin, kun krediittejä on jäljellä. */
  function setLocked(locked) {
    if (state === STATE.PLAYING || state === STATE.STUNNED) return;

    if (locked) { showLocked(); return; }
    if (state === STATE.LOCKED) { showWaiting(false); return; }

    /* WAITING tai juuri päättynyt kierros: pidetään tulosteksti näkyvissä
       ja varmistetaan vain, että aloitus on käytettävissä. */
    dom.start.disabled = false;
    dom.start.hidden = false;
  }

  var SatelliteHunt = {
    init: init,
    setLocked: setLocked,
    getState: function () { return state; },
    getRoundCredits: function () { return roundCredits; },
    /* Kehitystilan apurit – eivät näy pelaajalle. */
    debug: DEBUG_MODE ? {
      config: CONFIG,
      flags: DEBUG,
      start: startRound,
      end: endRound,
      stun: startStun,
      spawn: spawnSatellite
    } : undefined
  };

  global.SatelliteHunt = SatelliteHunt;

})(window);
