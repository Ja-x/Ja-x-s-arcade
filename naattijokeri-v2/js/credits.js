/* Naattijokeri – KREDIITIT (integraatiokerros)
 *
 * Tämä on ainoa paikka, jossa Satelliittijahti ja Naattijokeri kohtaavat.
 * Yhteinen saldo elää täällä, ei kummassakaan pelissä:
 *
 *   Satelliittijahti  ->  onRoundEnd(earned)  ->  creditBalance
 *   Naattijokeri      ->  spinGuard()         ->  creditBalance - 1
 *
 * Saldoa ei tallenneta pysyvästi: ei localStoragea, ei evästeitä,
 * ei palvelinta. Jokainen sivun lataus alkaa nollasta.
 *
 * Kun sama krediittipeli liitetään myöhemmin Onnenpeliin, vain tämä
 * tiedosto kirjoitetaan uusiksi.
 */

(function (NJ, global) {
  'use strict';

  var COST_PER_SPIN = 1;

  var creditBalance = 0;
  var roundActive = false;
  var dom = {};

  /* ---------------- näyttö ---------------- */

  function render() {
    dom.value.textContent = creditBalance;
    dom.plate.classList.toggle('is-empty', creditBalance <= 0);
  }

  function pulse() {
    dom.plate.classList.remove('is-pop');
    void dom.plate.offsetWidth;
    dom.plate.classList.add('is-pop');
  }

  /* ---------------- saldo ---------------- */

  /* Saldo ohjaa suoraan sitä, kumpi peli on käytettävissä. */
  function setBalance(value) {
    creditBalance = Math.max(0, Math.floor(value) || 0);
    render();

    var hasCredits = creditBalance > 0;
    NJ.Game.setLocked(!hasCredits);

    /* Satelliittijahtia ei voi aloittaa, jos krediittejä on jäljellä. */
    if (global.SatelliteHunt) global.SatelliteHunt.setLocked(hasCredits);
  }

  /* Naattijokerin vipu kysyy tätä ennen jokaista arvontaa. */
  function spendForSpin() {
    if (roundActive) return false;
    if (creditBalance < COST_PER_SPIN) return false;

    setBalance(creditBalance - COST_PER_SPIN);
    pulse();
    return true;
  }

  /* ---------------- Satelliittijahdin kierros ---------------- */

  function onRoundStart() {
    roundActive = true;
    NJ.Game.setLocked(true);
  }

  function onRoundEnd(earnedCredits) {
    roundActive = false;
    /* Krediitit siirtyvät saldoon vasta nyt (kierros alkaa aina saldolla 0). */
    setBalance(earnedCredits);
    pulse();
  }

  /* ---------------- käynnistys ---------------- */

  function init() {
    dom.plate = document.getElementById('creditPlate');
    dom.value = document.getElementById('creditValue');
    if (!dom.plate || !dom.value || !NJ.Game) return;

    NJ.Game.setSpinGuard(spendForSpin);

    if (global.SatelliteHunt) {
      global.SatelliteHunt.init({
        mount: document.getElementById('satelliteHunt'),
        onRoundStart: onRoundStart,
        onRoundEnd: onRoundEnd
      });
    }

    setBalance(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  NJ.Credits = {
    getBalance: function () { return creditBalance; },
    setBalance: setBalance
  };

})(window.NJ, window);
