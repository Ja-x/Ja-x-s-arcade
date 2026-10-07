/* Onnenpeli – CONFIG
 *
 * Kaikki pelin säädettävät arvot ovat tässä tiedostossa.
 * Muun koodin ei pidä sisältää kovakoodattuja koordinaatteja, ilmansuuntia
 * tai ajoituksia.
 */

window.NJ = window.NJ || {};

/* ------------------------------------------------------------------
 * VOITTOKOORDINAATIT
 *
 * Ratkaisu on tallennettu koodattuna merkkijonona, jotta se ei näy
 * lähdekoodissa selväkielisenä. Purettu muoto on peräkkäisiä
 * 9 merkin lohkoja: ilmansuunta + numerot A–H.
 *
 * Avaimen olemassaolo ratkaisee, onko ilmansuunta oikea. Puuttuvat suunnat
 * ovat vääriä suuntia. Pelilogiikka ei tunne suuntia nimeltä.
 *
 * Peli lukee arvot aina getWinningCoordinates()-funktion kautta.
 * ------------------------------------------------------------------ */
NJ.winningCipher = 'BlFYW0VdR1lVLkVcVHpZW1tF';

NJ.getWinningCoordinates = function () {
  var key = 'Hannunvaakuna';
  var bytes = atob(NJ.winningCipher);
  var plain = '';
  for (var i = 0; i < bytes.length; i++) {
    plain += String.fromCharCode(bytes.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  var out = {};
  for (var p = 0; p + 9 <= plain.length; p += 9) {
    out[plain.charAt(p)] = plain.substr(p + 1, 8).split('').map(Number);
  }
  return out;
};

NJ.CONFIG = {

  /* Ilmansuuntarullan arvot. Kaikki arvotaan samalla todennäköisyydellä. */
  directions: ['N', 'S', 'E', 'W'],

  /* Rivin ulkoasu vasemmalta oikealle.
   * 'dir'  = ilmansuuntarulla X
   * 'reel' = numerorulla
   * 'deg'  = kiinteä astemerkki
   * 'dot'  = kiinteä desimaalipiste                       */
  rowLayout: ['dir', 'reel', 'reel', 'reel', 'deg', 'reel', 'reel', 'dot', 'reel', 'reel', 'reel'],

  /* Numeropaikat, joissa sallitaan vain 0–5 (minuuttiosan kymmenet: D).
   * Indeksi numerorullien joukossa (A = 0). */
  restrictedIndexes: [3],

  /* Numerorullien kiekot. */
  faces: {
    normal:     [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    restricted: [0, 1, 2, 3, 4, 5]
  },

  /* Muuttujien nimet spesifikaatiosta (aria-labelit, debug-tulosteet). */
  variableNames: {
    direction: 'X',
    digits: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  },

  /* ---------------- ANIMAATION AJOITUKSET ----------------
   * X pysähtyy ensimmäisenä, sitten A–H vasemmalta oikealle.
   * Kokonaiskesto tällä asetuksella noin 3,0 s. */
  timing: {
    /* Rullien pyörimisnopeus (merkkiä sekunnissa) ja satunnaisvaihtelu. */
    spinSpeed: 26,
    spinSpeedJitter: 0.12,
    /* Käynnistysporrastus: rullat lähtevät pyörimään lähes yhtä aikaa. */
    startStaggerMs: 30,
    /* X alkaa hidastua tässä ajassa vivun painalluksesta. */
    firstStopMs: 1000,
    /* Seuraavien rullien pysähtymisväli. */
    stopIntervalMs: 180,
    /* Hidastuksen kesto rullaa kohti. */
    decelMs: 520,
    /* Montako ylimääräistä kierrosta hidastuksen aikana. */
    extraSpins: 2,
    /* Vivun animaation kesto. */
    leverMs: 420
  },

  /* prefers-reduced-motion: lyhennetyt ajat, sama pysähtymisjärjestys. */
  reducedTiming: {
    spinSpeed: 18,
    spinSpeedJitter: 0,
    startStaggerMs: 0,
    firstStopMs: 320,
    stopIntervalMs: 70,
    decelMs: 220,
    extraSpins: 0,
    leverMs: 200
  },

  /* ---------------- ERIKOISTILANNE ----------------
   * Oikea ilmansuunta lasketaan yhdeksi osumaksi. */
  luckyThreshold: 4,
  luckyMessageMs: 4500,

  /* ---------------- ÄÄNET ---------------- */
  audio: {
    defaultEnabled: true,
    masterVolume: 0.5,
    storageKey: 'onnenpeli.sounds',
    spinVolume: 0.07
  }
};

/* ------------------------------------------------------------------
 * DEBUG
 *
 * Pidä enabled=false tuotannossa. Debug ei näy pelaajalle mitenkään.
 *
 *   forceResult    : { direction:'N', digits:[1,2,3,4,5,6,7,8] }
 *                    pakottaa koko kierroksen tuloksen
 *   forceDirection : 'N' | 'S' | 'E' | 'W' – pakottaa vain ilmansuunnan
 *   forceHits      : pakota vähintään N osumaa (X lasketaan mukaan).
 *                    Käyttää forceDirectionin suuntaa, jos se on oikea,
 *                    muuten arpoo oikean suunnan voittokoordinaateista.
 *   logRolls       : tulosta arvonnat konsoliin
 *
 * Esimerkkejä spesifikaation testitapauksiin:
 *   Oikea rivi:       forceResult = { direction:<oikea suunta>, digits:<sen rivi> }
 *   Väärä suunta:     forceResult = { direction:'S', digits:[...] }
 *   Testi 11: forceHits = 4
 *   Testi 12: forceDirection = 'S', forceHits = 5
 * ------------------------------------------------------------------ */
NJ.DEBUG = {
  enabled: false,
  forceResult: null,
  forceDirection: null,
  forceHits: 0,
  logRolls: false
};
