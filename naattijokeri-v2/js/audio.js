/* Naattijokeri – AUDIO
 *
 * Kaikki äänet tuotetaan ohjelmallisesti Web Audio APIlla.
 * Pelissä ei ole taustamusiikkia eikä yhtään kolmannen osapuolen äänitiedostoa.
 *
 * AudioContext luodaan vasta ensimmäisen käyttäjän toiminnon yhteydessä,
 * jotta selainten automaattitoiston rajoitukset eivät estä ääniä.
 */

(function (NJ) {
  'use strict';

  var CFG = NJ.CONFIG.audio;

  var ctx = null;
  var master = null;
  var noiseBuffer = null;
  var enabled = CFG.defaultEnabled;
  var spin = null; // { source, gain, filter, lfo }

  /* ---------------- perusta ---------------- */

  function ensureContext() {
    if (!ctx) {
      var Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = CFG.masterVolume;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
    return ctx;
  }

  function ready() {
    if (!enabled) return null;
    return ensureContext();
  }

  function getNoiseBuffer() {
    if (noiseBuffer) return noiseBuffer;
    var len = Math.floor(ctx.sampleRate * 1.0);
    noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = noiseBuffer.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuffer;
  }

  /* Lyhyt kohinapurske: naksahdukset ja mekaaniset äänet. */
  function noiseBurst(opts) {
    var t = ctx.currentTime;
    var src = ctx.createBufferSource();
    src.buffer = getNoiseBuffer();
    src.loop = true;

    var filter = ctx.createBiquadFilter();
    filter.type = opts.type || 'bandpass';
    filter.frequency.value = opts.freq || 1200;
    filter.Q.value = opts.q || 1;

    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(opts.gain || 0.2, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + (opts.decay || 0.08));

    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(t);
    src.stop(t + (opts.decay || 0.08) + 0.05);
  }

  /* Lyhyt sävel. */
  function tone(opts) {
    var t = (opts.at || ctx.currentTime);
    var osc = ctx.createOscillator();
    osc.type = opts.type || 'triangle';
    osc.frequency.setValueAtTime(opts.from || 440, t);
    if (opts.to && opts.to !== opts.from) {
      osc.frequency.exponentialRampToValueAtTime(opts.to, t + (opts.decay || 0.2));
    }

    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(opts.gain || 0.2, t + (opts.attack || 0.008));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + (opts.decay || 0.2));

    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + (opts.decay || 0.2) + 0.05);
  }

  /* ---------------- pelin äänet ---------------- */

  /* 1. Vivun painaminen: mekaaninen kolahdus. */
  function lever() {
    if (!ready()) return;
    noiseBurst({ freq: 320, q: 0.8, gain: 0.35, decay: 0.12 });
    tone({ type: 'sine', from: 240, to: 60, gain: 0.35, decay: 0.22 });
    tone({ type: 'square', from: 110, to: 70, gain: 0.08, decay: 0.1 });
  }

  /* 2. Rullien pyöriminen: kevyt jatkuva surina, joka vaimenee rullien
   *    pysähtyessä. */
  function spinStart() {
    if (!ready()) return;
    spinStop(0.02);

    var t = ctx.currentTime;
    var src = ctx.createBufferSource();
    src.buffer = getNoiseBuffer();
    src.loop = true;

    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 900;
    filter.Q.value = 3.5;

    /* Pieni huojunta tekee surinasta mekaanisen kuuloisen. */
    var lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 22;
    var lfoGain = ctx.createGain();
    lfoGain.gain.value = 260;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(CFG.spinVolume, t + 0.12);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(t);
    lfo.start(t);

    spin = { source: src, gain: gain, lfo: lfo };
  }

  /* Voimakkuus 0..1 – peli laskee tätä sitä mukaa kun rullat pysähtyvät. */
  function spinIntensity(value) {
    if (!spin || !ctx) return;
    var v = Math.max(0.0001, CFG.spinVolume * value);
    spin.gain.gain.cancelScheduledValues(ctx.currentTime);
    spin.gain.gain.setTargetAtTime(v, ctx.currentTime, 0.08);
  }

  function spinStop(fade) {
    if (!spin || !ctx) return;
    var t = ctx.currentTime;
    var f = (fade === undefined) ? 0.18 : fade;
    var s = spin;
    spin = null;
    s.gain.gain.cancelScheduledValues(t);
    s.gain.gain.setValueAtTime(Math.max(s.gain.gain.value, 0.0001), t);
    s.gain.gain.exponentialRampToValueAtTime(0.0001, t + f);
    try {
      s.source.stop(t + f + 0.05);
      s.lfo.stop(t + f + 0.05);
    } catch (e) { /* jo pysäytetty */ }
  }

  /* 3. Yksittäisen rullan pysähtyminen. */
  function reelStop() {
    if (!ready()) return;
    noiseBurst({ freq: 1500, q: 1.2, gain: 0.16, decay: 0.05 });
    tone({ type: 'triangle', from: 190, to: 120, gain: 0.14, decay: 0.09 });
  }

  /* 4. Oikean numeron osuma: kirkas kilahdus, nousee osumien myötä. */
  function hit(index) {
    if (!ready()) return;
    var scale = [880, 987.77, 1174.66, 1318.51, 1567.98, 1760, 1975.53, 2349.32];
    var f = scale[Math.min(index, scale.length - 1)];
    tone({ type: 'triangle', from: f, gain: 0.22, decay: 0.28 });
    tone({ type: 'sine', from: f * 2, gain: 0.08, decay: 0.18 });
  }

  /* 5. Vähintään neljän osuman erikoistilanne. */
  function lucky() {
    if (!ready()) return;
    var notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    for (var i = 0; i < notes.length; i++) {
      tone({
        type: 'square',
        from: notes[i],
        at: ctx.currentTime + i * 0.09,
        gain: 0.13,
        decay: 0.26
      });
    }
  }

  /* ---------------- ON/OFF ---------------- */

  function isEnabled() { return enabled; }

  function setEnabled(value) {
    enabled = !!value;
    if (!enabled) spinStop(0.05);
    try { localStorage.setItem(CFG.storageKey, enabled ? 'on' : 'off'); } catch (e) { /* ei tallennusta */ }
    return enabled;
  }

  function loadPreference() {
    try {
      var saved = localStorage.getItem(CFG.storageKey);
      if (saved === 'on') enabled = true;
      else if (saved === 'off') enabled = false;
    } catch (e) { /* ei tallennusta */ }
    return enabled;
  }

  /* Kutsutaan ensimmäisestä käyttäjän toiminnosta. */
  function unlock() {
    if (enabled) ensureContext();
  }

  NJ.Audio = {
    lever: lever,
    spinStart: spinStart,
    spinIntensity: spinIntensity,
    spinStop: spinStop,
    reelStop: reelStop,
    hit: hit,
    lucky: lucky,
    isEnabled: isEnabled,
    setEnabled: setEnabled,
    loadPreference: loadPreference,
    unlock: unlock
  };

})(window.NJ);
