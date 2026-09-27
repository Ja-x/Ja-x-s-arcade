/* Naattijokeri – CONFIG
 *
 * Kaikki pelin säädettävät arvot ovat tässä tiedostossa.
 * Muun koodin ei pidä sisältää kovakoodattuja koordinaatteja tai ajoituksia.
 */

window.NJ = window.NJ || {};

/* ------------------------------------------------------------------
 * VOITTOKOORDINAATIT
 *
 * Testiarvot v0.1:
 *   N 065° 00.123
 *   E 025° 22.456
 *
 * Paikat vastaavat spesifikaation muuttujia:
 *   north[0..7] = A B C D E F G H   ->  N ABC° DE.FGH
 *   east [0..7] = I J K L M N O P   ->  E IJK° LM.NOP
 *
 * Koordinaatit vaihdetaan oikeisiin muuttamalla vain tätä oliota.
 * Peli lukee arvot aina getWinningCoordinates()-funktion kautta, joten
 * myöhemmin arvot voidaan tuottaa myös hajautetusti, koodattuna
 * merkkijonona tai muulla myöhemmin sovittavalla tavalla ilman että
 * pelilogiikkaa tarvitsee muuttaa.
 * ------------------------------------------------------------------ */
NJ.winningCoordinates = {
  north: [0, 6, 5, 0, 0, 1, 2, 3],
  east:  [0, 2, 5, 2, 2, 4, 5, 6]
};

NJ.getWinningCoordinates = function () {
  return {
    north: NJ.winningCoordinates.north.slice(),
    east:  NJ.winningCoordinates.east.slice()
  };
};

NJ.CONFIG = {

  /* Rivit pysähtymisjärjestyksessä: ensin koko N-rivi, sitten koko E-rivi. */
  lines: ['north', 'east'],

  /* Rivin ulkoasu vasemmalta oikealle.
   * 'reel'   = numerorulla
   * 'deg'    = kiinteä astemerkki
   * 'dot'    = kiinteä desimaalipiste                       */
  rowLayout: ['reel', 'reel', 'reel', 'deg', 'reel', 'reel', 'dot', 'reel', 'reel', 'reel'],

  /* Rullat, joissa sallitaan vain 0–5 (minuuttiosan kymmenet: D ja L).
   * Indeksi rivin sisällä (0-pohjainen). */
  restrictedIndexes: [3],

  /* Rullien numerokiekot. */
  faces: {
    normal:     [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    restricted: [0, 1, 2, 3, 4, 5]
  },

  /* Muuttujien nimet spesifikaatiosta (aria-labelit, debug-tulosteet). */
  variableNames: {
    north: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    east:  ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']
  },

  /* ---------------- ANIMAATION AJOITUKSET ---------------- */
  timing: {
    /* Rullien pyörimisnopeus (numeroa sekunnissa) ja satunnaisvaihtelu. */
    spinSpeed: 26,
    spinSpeedJitter: 0.12,
    /* Käynnistysporrastus: rullat lähtevät pyörimään lähes yhtä aikaa. */
    startStaggerMs: 30,
    /* Ensimmäinen rulla alkaa hidastua tässä ajassa vivun painalluksesta. */
    firstStopMs: 1000,
    /* Seuraavien rullien pysähtymisväli. */
    stopIntervalMs: 140,
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
    stopIntervalMs: 55,
    decelMs: 220,
    extraSpins: 0,
    leverMs: 200
  },

  /* ---------------- ERIKOISTILANNE ---------------- */
  /* Vähintään näin monta osumaa samalla kierroksella -> viesti. */
  luckyThreshold: 4,
  /* Kuinka kauan viesti näkyy ennen automaattista poistumista (ms). */
  luckyMessageMs: 4500,

  /* ---------------- ÄÄNET ---------------- */
  audio: {
    defaultEnabled: true,
    masterVolume: 0.5,
    storageKey: 'naattijokeri.sounds',
    spinVolume: 0.07
  }
};

/* ------------------------------------------------------------------
 * DEBUG
 *
 * Pidä enabled=false tuotannossa. Debug ei näy pelaajalle mitenkään.
 *   forceResult : { north:[..8..], east:[..8..] } pakotettu kierroksen tulos
 *   forceHits   : pakota vähintään N osumaa satunnaisiin paikkoihin
 *   logRolls    : tulosta arvonnat konsoliin (arvorajojen testaamiseen)
 * ------------------------------------------------------------------ */
NJ.DEBUG = {
  enabled: false,
  forceResult: null,
  forceHits: 0,
  logRolls: false
};
