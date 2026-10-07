window.NJ = window.NJ || {};

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
  directions: ['N', 'S', 'E', 'W'],
  rowLayout: ['dir', 'reel', 'reel', 'reel', 'deg', 'reel', 'reel', 'dot', 'reel', 'reel', 'reel'],
  restrictedIndexes: [3],
  faces: {
    normal:     [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    restricted: [0, 1, 2, 3, 4, 5]
  },
  variableNames: {
    direction: 'X',
    digits: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  },
  timing: {
    spinSpeed: 26,
    spinSpeedJitter: 0.12,
    startStaggerMs: 30,
    firstStopMs: 1000,
    stopIntervalMs: 180,
    decelMs: 520,
    extraSpins: 2,
    leverMs: 420
  },
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
  luckyThreshold: 4,
  luckyMessageMs: 4500,
  audio: {
    defaultEnabled: true,
    masterVolume: 0.5,
    storageKey: 'onnenpeli.sounds',
    spinVolume: 0.07
  }
};

NJ.DEBUG = {
  enabled: false,
  forceResult: null,
  forceDirection: null,
  forceHits: 0,
  logRolls: false
};
