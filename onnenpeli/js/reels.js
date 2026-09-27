/* Onnenpeli – RULLAT (rakennus + animaatio)
 *
 * Vastuu:
 *  - arvottavan rivin DOM:n rakentaminen layout-kuvauksesta
 *  - ilmansuuntarullan X ja kahdeksan numerorullan animaatio
 *  - hallittu pysähtyminen ja vihreiden osumavalojen sytyttäminen
 *
 * Rullat pysähtyvät aina taulukkojärjestyksessä: X → A → B → … → H.
 */

(function (NJ) {
  'use strict';

  var CONFIG = NJ.CONFIG;

  var reels = [];          // pysähtymisjärjestyksessä, reels[0] = X
  var dirReel = null;      // ilmansuuntarulla
  var digitReels = [];     // A–H
  var rafId = null;
  var round = null;        // käynnissä olevan kierroksen tila

  /* ---------------- rakennus ---------------- */

  function isRestricted(index) {
    return CONFIG.restrictedIndexes.indexOf(index) !== -1;
  }

  /* Numeropaikan sallitut arvot. */
  function facesFor(index) {
    return isRestricted(index) ? CONFIG.faces.restricted : CONFIG.faces.normal;
  }

  /* Ilmansuuntarullan arvot. */
  function directionFaces() {
    return CONFIG.directions;
  }

  function createReel(kind, index) {
    var faces = (kind === 'dir') ? directionFaces() : facesFor(index);

    var el = document.createElement('div');
    el.className = 'reel' + (kind === 'dir' ? ' reel--dir' : '');
    el.setAttribute('role', 'img');
    el.dataset.kind = kind;
    el.dataset.index = String(index);

    var win = document.createElement('div');
    win.className = 'reel__window';

    /* Kompassikoriste erottaa ilmansuuntarullan numerorullista. */
    if (kind === 'dir') {
      var compass = document.createElement('span');
      compass.className = 'reel__compass';
      compass.setAttribute('aria-hidden', 'true');
      compass.innerHTML = '<svg viewBox="0 0 100 100"><path d="M50 4 L58 42 L96 50 L58 58 L50 96 L42 58 L4 50 L42 42 Z"/></svg>';
      win.appendChild(compass);
    }

    var strip = document.createElement('div');
    strip.className = 'reel__strip';
    strip.setAttribute('aria-hidden', 'true');

    /* Kaksi peräkkäistä kopiota kiekosta, jotta vieritys kiertää saumatta. */
    for (var copy = 0; copy < 2; copy++) {
      for (var i = 0; i < faces.length; i++) {
        var cell = document.createElement('span');
        cell.className = 'reel__cell';
        cell.textContent = String(faces[i]);
        strip.appendChild(cell);
      }
    }

    var symbol = document.createElement('span');
    symbol.className = 'reel__symbol';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.innerHTML = '<svg viewBox="0 0 100 100"><use href="#hannunvaakuna"></use></svg>';

    var lamp = document.createElement('span');
    lamp.className = 'reel__lamp';
    lamp.setAttribute('aria-hidden', 'true');

    win.appendChild(strip);
    win.appendChild(symbol);
    el.appendChild(win);
    el.appendChild(lamp);

    var reel = {
      kind: kind,
      index: index,
      name: (kind === 'dir') ? CONFIG.variableNames.direction
                             : CONFIG.variableNames.digits[index],
      el: el,
      win: win,
      strip: strip,
      faces: faces,
      cellH: 0,
      pos: Math.random() * faces.length,  // rullat eivät ole samassa asennossa
      phase: 'idle',
      value: null,
      target: null,
      speed: 0,
      startAt: 0,
      stopAt: 0,
      decelFrom: 0,
      decelDelta: 0,
      decelStart: 0,
      decelMs: 0,
      extraSpins: 0
    };

    setLabel(reel, null, false);
    return reel;
  }

  function setLabel(reel, value, isHit) {
    var t = NJ.I18n.t;
    var what = (reel.kind === 'dir') ? t('reelDirection') : t('reelPlace') + ' ' + reel.name;
    var text = what + ': ';
    if (value === null) text += t('reelBlank');
    else text += value + (isHit ? ', ' + t('reelHit') : '');
    reel.el.setAttribute('aria-label', text);
  }

  function createMark(kind) {
    var el = document.createElement('span');
    el.className = 'coord-mark coord-mark--' + kind;
    el.textContent = (kind === 'deg') ? '°' : '.';
    el.setAttribute('aria-hidden', 'true');
    return el;
  }

  function build(rowEl) {
    reels = [];
    digitReels = [];
    dirReel = null;

    var digitIndex = 0;

    CONFIG.rowLayout.forEach(function (item) {
      if (item === 'dir') {
        dirReel = createReel('dir', 0);
        rowEl.appendChild(dirReel.el);
        reels.push(dirReel);
      } else if (item === 'reel') {
        var reel = createReel('digit', digitIndex++);
        rowEl.appendChild(reel.el);
        digitReels.push(reel);
        reels.push(reel);
      } else {
        rowEl.appendChild(createMark(item));
      }
    });

    measure();
    render();
  }

  /* ---------------- mitat ja piirto ---------------- */

  function measure() {
    for (var i = 0; i < reels.length; i++) {
      var h = reels[i].win.getBoundingClientRect().height;
      if (h > 0) reels[i].cellH = h;
    }
  }

  function render() {
    for (var i = 0; i < reels.length; i++) {
      var r = reels[i];
      var n = r.faces.length;
      var offset = ((r.pos % n) + n) % n;
      r.strip.style.transform = 'translate3d(0,' + (-offset * r.cellH) + 'px,0)';
    }
  }

  function handleResize() {
    measure();
    render();
  }

  /* ---------------- animaatio ---------------- */

  function easeOutBack(u) {
    var c1 = 1.15, c3 = c1 + 1;
    var p = u - 1;
    return 1 + c3 * p * p * p + c1 * p * p;
  }

  function timing() {
    var reduced = window.matchMedia &&
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return reduced ? CONFIG.reducedTiming : CONFIG.timing;
  }

  /* Käynnistää koko kierroksen.
   * values = { direction: 'N', digits: [8 numeroa] } */
  function spin(values, handlers) {
    var t = timing();
    var now = performance.now();

    measure();
    round = {
      t0: now,
      remaining: reels.length,
      total: reels.length,
      onReelStop: (handlers && handlers.onReelStop) || function () {},
      onComplete: (handlers && handlers.onComplete) || function () {}
    };

    for (var i = 0; i < reels.length; i++) {
      var r = reels[i];
      var jitter = 1 + (Math.random() * 2 - 1) * t.spinSpeedJitter;

      r.el.classList.remove('is-hit');
      r.el.classList.add('is-live', 'is-spinning');
      r.value = null;
      r.target = (r.kind === 'dir') ? values.direction : values.digits[r.index];
      r.speed = t.spinSpeed * jitter;
      r.startAt = now + i * t.startStaggerMs;
      r.stopAt = now + t.firstStopMs + i * t.stopIntervalMs;
      r.decelMs = t.decelMs;
      r.extraSpins = t.extraSpins;
      r.phase = 'waiting';
      r.last = now;
      setLabel(r, null, false);
    }

    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  function beginDecel(r, now) {
    var n = r.faces.length;
    var targetIndex = r.faces.indexOf(r.target);
    var current = ((r.pos % n) + n) % n;
    var delta = targetIndex - current;
    while (delta <= 0) delta += n;
    delta += r.extraSpins * n;

    r.decelFrom = r.pos;
    r.decelDelta = delta;
    r.decelStart = now;
    r.phase = 'decel';
  }

  function finishReel(r) {
    var n = r.faces.length;
    var pos = r.decelFrom + r.decelDelta;
    r.pos = ((pos % n) + n) % n;
    r.phase = 'stopped';
    r.value = r.target;
    r.el.classList.remove('is-spinning');

    round.remaining--;
    round.onReelStop(r);
  }

  function tick(now) {
    var active = false;

    for (var i = 0; i < reels.length; i++) {
      var r = reels[i];
      var dt = Math.min((now - r.last) / 1000, 0.1);
      r.last = now;

      if (r.phase === 'waiting') {
        if (now >= r.startAt) r.phase = 'spin';
        else { active = true; continue; }
      }

      if (r.phase === 'spin') {
        r.pos += r.speed * dt;
        if (now >= r.stopAt) beginDecel(r, now);
        active = true;
      } else if (r.phase === 'decel') {
        var u = (now - r.decelStart) / r.decelMs;
        if (u >= 1) {
          finishReel(r);
        } else {
          r.pos = r.decelFrom + r.decelDelta * easeOutBack(u);
          active = true;
        }
      }
    }

    render();

    if (active) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      if (round) {
        var done = round;
        round = null;
        done.onComplete();
      }
    }
  }

  /* ---------------- osumavalot ---------------- */

  function markHit(reel) {
    reel.el.classList.add('is-hit');
    /* Lyhyt välähdys ennen jatkuvaa hohdetta. */
    reel.el.classList.remove('flash');
    void reel.el.offsetWidth;
    reel.el.classList.add('flash');
    setLabel(reel, reel.value, true);
  }

  function clearHits() {
    for (var i = 0; i < reels.length; i++) {
      reels[i].el.classList.remove('is-hit', 'flash');
    }
  }

  function each(fn) { reels.forEach(fn); }

  NJ.Reels = {
    build: build,
    spin: spin,
    markHit: markHit,
    clearHits: clearHits,
    setLabel: setLabel,
    handleResize: handleResize,
    each: each,
    isRestricted: isRestricted,
    facesFor: facesFor,
    directionFaces: directionFaces,
    count: function () { return reels.length; },
    digitCount: function () { return digitReels.length; }
  };

})(window.NJ);
