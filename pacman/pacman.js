var _0x41ff = ["FPS", "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", "", "charCodeAt", "charAt", "_keyStr", "length", "replace", "indexOf", "fromCharCode", "n", "T25uZWEg4oCTIGNvbmdyYXR1bGF0aW9ucyEgU2luw6Qgb3Nhc2l0IC0gWW91IG1hZGUgaXQuIA0KVGFsbGVubmEgcmF0a2Fpc3UgdMOkc3TDpCBoZXRpLiBTYXZlIHRoZSBhc3dlciBub3cuDQoqKiogIE42NCA1NSA3MDggICoqKiAgRTAyNSAwNSA0NjIgKioqDQpLaXJqb2l0YSBhbGxlIGdlb2NhY2hpbmcgbmltaW1lcmtraXNpLg0KUGxlYXNlIGVudGVyIHlvdXIgZ2VvY2FjaGluZyBuaWNrIGhlcmUuDQpQcmVzcyBPSyBvbmNlIHlvdSBoYXZlIHNhdmVkIHRoZSBzb2x1dGlvbi4=", "decode", "Ghost", "x", "y", "random", "floor", "getTick", "round", "#FFFFFF", "#0000BB", "#222", "blockSize", "fillStyle", "beginPath", "moveTo", "quadraticCurveTo", "closePath", "fill", "#FFF", "arc", "#000", "isFloorSpace", "isWallSpace", "User", "ARROW_LEFT", "ARROW_UP", "ARROW_RIGHT", "ARROW_DOWN", "keyCode", "undefined", "preventDefault", "stopPropagation", "block", "BISCUIT", "PILL", "setBlock", "completedLevel", "eatenPill", "#FFFF00", "PI", "start", "end", "direction", "Map", "WALL", "EMPTY", "strokeStyle", "#0000FF", "lineWidth", "lineCap", "WALLS", "move", "line", "lineTo", "curve", "stroke", "clone", "MAP", "fillRect", "abs", "BLOCK", "Audio", "audio", "createElement", "canplaythrough", "addEventListener", "preload", "true", "setAttribute", "autobuffer", "src", "pause", "loaded", "total", "function", "removeEventListener", "currentTime", "ended", "push", "soundDisabled", "play", "#00FFDE", "#FF0000", "#FFB8DE", "#FFB847", "font", "12px BDCartoonShoutRegular", "new", "fillText", "14px BDCartoonShoutRegular", "width", "measureText", "height", "resetPosition", "reset", "draw", "N", "S", "disableSound", "P", "resume", "Paused", "keyDown", "loseLife", "getLives", "GC6MCD: ", " ", "theScore", " points,    level ", "\x0A Ota nyt ruutukaappaus lokkauksesi liitteeksi. Take a screen capture and attach it to your log.", "pow", "sqrt", "#000000", "#00FF00", "bold 16px sans-serif", "s", "Score: ", "Level: ", "drawBlock", "ceil", "old", "isVunerable", "eatghost", "eat", "addScore", "isDangerous", "die", "drawPills", "Press N to start a New game", "drawDead", "Starting in: ", "eatpill", "makeEatable", "newLevel", "offsetWidth", "canvas", "px", "appendChild", "2d", "getContext", "Loading ...", "ogg", "mp3", "audio/opening_song.", "audio/die.", "audio/eatghost.", "audio/eatpill.", "eating", "audio/eating.short.", "eating2", "pop", "load", "Press N to Start", "keydown", "keypress", "setInterval", "NUM_PAD_", "F", "prototype", "object"];
alert;
var NONE = 4,
    UP = 3,
    LEFT = 2,
    DOWN = 1,
    RIGHT = 11,
    WAITING = 5,
    PAUSE = 6,
    PLAYING = 7,
    COUNTDOWN = 8,
    EATEN_PAUSE = 9,
    DYING = 10,
    Pacman = {};
Pacman[_0x41ff[0]] = 30;
var Base64 = {
    _keyStr: _0x41ff[1],
    encode: function(_0xa1cdxe) {
        var _0xa1cdxf = _0x41ff[2];
        var _0xa1cdx10, _0xa1cdx11, _0xa1cdx12, _0xa1cdx13, _0xa1cdx14, _0xa1cdx15, _0xa1cdx16;
        var _0xa1cdx17 = 0;
        _0xa1cdxe = Base64._utf8_encode(_0xa1cdxe);
        while (_0xa1cdx17 < _0xa1cdxe[_0x41ff[6]]) {
            _0xa1cdx10 = _0xa1cdxe[_0x41ff[3]](_0xa1cdx17++);
            _0xa1cdx11 = _0xa1cdxe[_0x41ff[3]](_0xa1cdx17++);
            _0xa1cdx12 = _0xa1cdxe[_0x41ff[3]](_0xa1cdx17++);
            _0xa1cdx13 = _0xa1cdx10 >> 2;
            _0xa1cdx14 = (_0xa1cdx10 & 3) << 4 | _0xa1cdx11 >> 4;
            _0xa1cdx15 = (_0xa1cdx11 & 15) << 2 | _0xa1cdx12 >> 6;
            _0xa1cdx16 = _0xa1cdx12 & 63;
            if (isNaN(_0xa1cdx11)) {
                _0xa1cdx15 = _0xa1cdx16 = 64
            } else {
                if (isNaN(_0xa1cdx12)) {
                    _0xa1cdx16 = 64
                }
            };
            _0xa1cdxf = _0xa1cdxf + this[_0x41ff[5]][_0x41ff[4]](_0xa1cdx13) + this[_0x41ff[5]][_0x41ff[4]](_0xa1cdx14) + this[_0x41ff[5]][_0x41ff[4]](_0xa1cdx15) + this[_0x41ff[5]][_0x41ff[4]](_0xa1cdx16)
        };
        return _0xa1cdxf
    },
    decode: function(_0xa1cdxe) {
        var _0xa1cdxf = _0x41ff[2];
        var _0xa1cdx10, _0xa1cdx11, _0xa1cdx12;
        var _0xa1cdx13, _0xa1cdx14, _0xa1cdx15, _0xa1cdx16;
        var _0xa1cdx17 = 0;
        _0xa1cdxe = _0xa1cdxe[_0x41ff[7]](/[^A-Za-z0-9+/=]/g, _0x41ff[2]);
        while (_0xa1cdx17 < _0xa1cdxe[_0x41ff[6]]) {
            _0xa1cdx13 = this[_0x41ff[5]][_0x41ff[8]](_0xa1cdxe[_0x41ff[4]](_0xa1cdx17++));
            _0xa1cdx14 = this[_0x41ff[5]][_0x41ff[8]](_0xa1cdxe[_0x41ff[4]](_0xa1cdx17++));
            _0xa1cdx15 = this[_0x41ff[5]][_0x41ff[8]](_0xa1cdxe[_0x41ff[4]](_0xa1cdx17++));
            _0xa1cdx16 = this[_0x41ff[5]][_0x41ff[8]](_0xa1cdxe[_0x41ff[4]](_0xa1cdx17++));
            _0xa1cdx10 = _0xa1cdx13 << 2 | _0xa1cdx14 >> 4;
            _0xa1cdx11 = (_0xa1cdx14 & 15) << 4 | _0xa1cdx15 >> 2;
            _0xa1cdx12 = (_0xa1cdx15 & 3) << 6 | _0xa1cdx16;
            _0xa1cdxf = _0xa1cdxf + String[_0x41ff[9]](_0xa1cdx10);
            if (_0xa1cdx15 != 64) {
                _0xa1cdxf = _0xa1cdxf + String[_0x41ff[9]](_0xa1cdx11)
            };
            if (_0xa1cdx16 != 64) {
                _0xa1cdxf = _0xa1cdxf + String[_0x41ff[9]](_0xa1cdx12)
            }
        };
        _0xa1cdxf = Base64._utf8_decode(_0xa1cdxf);
        return _0xa1cdxf
    },
    _utf8_encode: function(_0xa1cdxe) {
        _0xa1cdxe = _0xa1cdxe[_0x41ff[7]](/rn/g, _0x41ff[10]);
        var _0xa1cdxf = _0x41ff[2];
        for (var _0xa1cdx10 = 0; _0xa1cdx10 < _0xa1cdxe[_0x41ff[6]]; _0xa1cdx10++) {
            var _0xa1cdx11 = _0xa1cdxe[_0x41ff[3]](_0xa1cdx10);
            if (_0xa1cdx11 < 128) {
                _0xa1cdxf += String[_0x41ff[9]](_0xa1cdx11)
            } else {
                if (_0xa1cdx11 > 127 && _0xa1cdx11 < 2048) {
                    _0xa1cdxf += String[_0x41ff[9]](_0xa1cdx11 >> 6 | 192);
                    _0xa1cdxf += String[_0x41ff[9]](_0xa1cdx11 & 63 | 128)
                } else {
                    _0xa1cdxf += String[_0x41ff[9]](_0xa1cdx11 >> 12 | 224);
                    _0xa1cdxf += String[_0x41ff[9]](_0xa1cdx11 >> 6 & 63 | 128);
                    _0xa1cdxf += String[_0x41ff[9]](_0xa1cdx11 & 63 | 128)
                }
            }
        };
        return _0xa1cdxf
    },
    _utf8_decode: function(_0xa1cdxe) {
        var _0xa1cdxf = _0x41ff[2];
        var _0xa1cdx10 = 0;
        var _0xa1cdx11 = c1 = c2 = 0;
        while (_0xa1cdx10 < _0xa1cdxe[_0x41ff[6]]) {
            _0xa1cdx11 = _0xa1cdxe[_0x41ff[3]](_0xa1cdx10);
            if (_0xa1cdx11 < 128) {
                _0xa1cdxf += String[_0x41ff[9]](_0xa1cdx11);
                _0xa1cdx10++
            } else {
                if (_0xa1cdx11 > 191 && _0xa1cdx11 < 224) {
                    c2 = _0xa1cdxe[_0x41ff[3]](_0xa1cdx10 + 1);
                    _0xa1cdxf += String[_0x41ff[9]]((_0xa1cdx11 & 31) << 6 | c2 & 63);
                    _0xa1cdx10 += 2
                } else {
                    c2 = _0xa1cdxe[_0x41ff[3]](_0xa1cdx10 + 1);
                    c3 = _0xa1cdxe[_0x41ff[3]](_0xa1cdx10 + 2);
                    _0xa1cdxf += String[_0x41ff[9]]((_0xa1cdx11 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                    _0xa1cdx10 += 3
                }
            }
        };
        return _0xa1cdxf
    }
};
var string = _0x41ff[11];
var decodedString = Base64[_0x41ff[12]](string);
var raja = 4;
Pacman[_0x41ff[13]] = function(_0xa1cdx1b, _0xa1cdx1c, _0xa1cdx1d) {
    var _0xa1cdx1e = null,
        _0xa1cdx1f = null,
        _0xa1cdx20 = null,
        _0xa1cdx21 = null,
        _0xa1cdx22 = null;

    function _0xa1cdx23(_0xa1cdx24, _0xa1cdx25) {
        var _0xa1cdx26 = _0xa1cdx2e() ? 1 : _0xa1cdx30() ? 4 : 2,
            _0xa1cdx27 = (_0xa1cdx24 === LEFT && -_0xa1cdx26 || _0xa1cdx24 === RIGHT && _0xa1cdx26 || 0),
            _0xa1cdx28 = (_0xa1cdx24 === DOWN && _0xa1cdx26 || _0xa1cdx24 === UP && -_0xa1cdx26 || 0);
        return {
            "x": _0xa1cdx29(_0xa1cdx25[_0x41ff[14]], _0xa1cdx27),
            "y": _0xa1cdx29(_0xa1cdx25[_0x41ff[15]], _0xa1cdx28)
        }
    }

    function _0xa1cdx29(_0xa1cdx2a, _0xa1cdx2b) {
        var _0xa1cdx2c = _0xa1cdx2a % 10,
            _0xa1cdx2d = _0xa1cdx2c + _0xa1cdx2b;
        if (_0xa1cdx2c !== 0 && _0xa1cdx2d > 10) {
            return _0xa1cdx2a + (10 - _0xa1cdx2c)
        } else {
            if (_0xa1cdx2c > 0 && _0xa1cdx2d < 0) {
                return _0xa1cdx2a - _0xa1cdx2c
            }
        };
        return _0xa1cdx2a + _0xa1cdx2b
    }

    function _0xa1cdx2e() {
        return _0xa1cdx20 !== null
    }

    function _0xa1cdx2f() {
        return _0xa1cdx21 === null
    }

    function _0xa1cdx30() {
        return _0xa1cdx20 === null && _0xa1cdx21 !== null
    }

    function _0xa1cdx31() {
        var _0xa1cdx32 = (_0xa1cdx1f === LEFT || _0xa1cdx1f === RIGHT) ? [UP, DOWN] : [LEFT, RIGHT];
        return _0xa1cdx32[Math[_0x41ff[17]](Math[_0x41ff[16]]() * 2)]
    }

    function _0xa1cdx33() {
        _0xa1cdx21 = null;
        _0xa1cdx20 = null;
        _0xa1cdx1e = {
            "x": 90,
            "y": 80
        };
        _0xa1cdx1f = _0xa1cdx31();
        _0xa1cdx22 = _0xa1cdx31()
    }

    function _0xa1cdx34(_0xa1cdx35) {
        return _0xa1cdx35 % 10 === 0
    }

    function _0xa1cdx36(_0xa1cdx24) {
        return _0xa1cdx24 === LEFT && RIGHT || _0xa1cdx24 === RIGHT && LEFT || _0xa1cdx24 === UP && DOWN || UP
    }

    function _0xa1cdx37() {
        _0xa1cdx1f = _0xa1cdx36(_0xa1cdx1f);
        _0xa1cdx20 = _0xa1cdx1b[_0x41ff[18]]()
    }

    function _0xa1cdx38() {
        _0xa1cdx20 = null;
        _0xa1cdx21 = _0xa1cdx1b[_0x41ff[18]]()
    }

    function _0xa1cdx39(_0xa1cdx35) {
        return Math[_0x41ff[19]](_0xa1cdx35 / 10)
    }

    function _0xa1cdx3a(_0xa1cdx35, _0xa1cdx24) {
        var _0xa1cdx2c = _0xa1cdx35 % 10;
        if (_0xa1cdx2c === 0) {
            return _0xa1cdx35
        } else {
            if (_0xa1cdx24 === RIGHT || _0xa1cdx24 === DOWN) {
                return _0xa1cdx35 + (10 - _0xa1cdx2c)
            } else {
                return _0xa1cdx35 - _0xa1cdx2c
            }
        }
    }

    function _0xa1cdx3b(_0xa1cdx3c) {
        return _0xa1cdx34(_0xa1cdx3c[_0x41ff[15]]) && _0xa1cdx34(_0xa1cdx3c[_0x41ff[14]])
    }

    function _0xa1cdx3d(_0xa1cdx3e) {
        return (_0xa1cdx1b[_0x41ff[18]]() - _0xa1cdx3e) / Pacman[_0x41ff[0]]
    }

    function _0xa1cdx3f() {
        if (_0xa1cdx20) {
            if (_0xa1cdx3d(_0xa1cdx20) > 5) {
                return _0xa1cdx1b[_0x41ff[18]]() % 20 > 10 ? _0x41ff[20] : _0x41ff[21]
            } else {
                return _0x41ff[21]
            }
        } else {
            if (_0xa1cdx21) {
                return _0x41ff[22]
            }
        };
        return _0xa1cdx1d
    }

    function _0xa1cdx40(_0xa1cdx41) {
        var _0xa1cdx13 = _0xa1cdx1c[_0x41ff[23]],
            _0xa1cdx42 = (_0xa1cdx1e[_0x41ff[15]] / 10) * _0xa1cdx13,
            _0xa1cdx43 = (_0xa1cdx1e[_0x41ff[14]] / 10) * _0xa1cdx13;
        if (_0xa1cdx20 && _0xa1cdx3d(_0xa1cdx20) > 8) {
            _0xa1cdx20 = null
        };
        if (_0xa1cdx21 && _0xa1cdx3d(_0xa1cdx21) > 3) {
            _0xa1cdx21 = null
        };
        var _0xa1cdx44 = _0xa1cdx43 + _0xa1cdx13;
        var _0xa1cdx45 = _0xa1cdx42 + _0xa1cdx13 - 3;
        var _0xa1cdx46 = _0xa1cdx13 / 10;
        var _0xa1cdx47 = _0xa1cdx1b[_0x41ff[18]]() % 10 > 5 ? 3 : -3;
        var _0xa1cdx48 = _0xa1cdx1b[_0x41ff[18]]() % 10 > 5 ? -3 : 3;
        _0xa1cdx41[_0x41ff[24]] = _0xa1cdx3f();
        _0xa1cdx41[_0x41ff[25]]();
        _0xa1cdx41[_0x41ff[26]](_0xa1cdx43, _0xa1cdx45);
        _0xa1cdx41[_0x41ff[27]](_0xa1cdx43, _0xa1cdx42, _0xa1cdx43 + (_0xa1cdx13 / 2), _0xa1cdx42);
        _0xa1cdx41[_0x41ff[27]](_0xa1cdx43 + _0xa1cdx13, _0xa1cdx42, _0xa1cdx43 + _0xa1cdx13, _0xa1cdx45);
        _0xa1cdx41[_0x41ff[27]](_0xa1cdx44 - (_0xa1cdx46 * 1), _0xa1cdx45 + _0xa1cdx47, _0xa1cdx44 - (_0xa1cdx46 * 2), _0xa1cdx45);
        _0xa1cdx41[_0x41ff[27]](_0xa1cdx44 - (_0xa1cdx46 * 3), _0xa1cdx45 + _0xa1cdx48, _0xa1cdx44 - (_0xa1cdx46 * 4), _0xa1cdx45);
        _0xa1cdx41[_0x41ff[27]](_0xa1cdx44 - (_0xa1cdx46 * 5), _0xa1cdx45 + _0xa1cdx47, _0xa1cdx44 - (_0xa1cdx46 * 6), _0xa1cdx45);
        _0xa1cdx41[_0x41ff[27]](_0xa1cdx44 - (_0xa1cdx46 * 7), _0xa1cdx45 + _0xa1cdx48, _0xa1cdx44 - (_0xa1cdx46 * 8), _0xa1cdx45);
        _0xa1cdx41[_0x41ff[27]](_0xa1cdx44 - (_0xa1cdx46 * 9), _0xa1cdx45 + _0xa1cdx47, _0xa1cdx44 - (_0xa1cdx46 * 10), _0xa1cdx45);
        _0xa1cdx41[_0x41ff[28]]();
        _0xa1cdx41[_0x41ff[29]]();
        _0xa1cdx41[_0x41ff[25]]();
        _0xa1cdx41[_0x41ff[24]] = _0x41ff[30];
        _0xa1cdx41[_0x41ff[31]](_0xa1cdx43 + 6, _0xa1cdx42 + 6, _0xa1cdx13 / 6, 0, 300, false);
        _0xa1cdx41[_0x41ff[31]]((_0xa1cdx43 + _0xa1cdx13) - 6, _0xa1cdx42 + 6, _0xa1cdx13 / 6, 0, 300, false);
        _0xa1cdx41[_0x41ff[28]]();
        _0xa1cdx41[_0x41ff[29]]();
        var _0xa1cdx17 = _0xa1cdx13 / 12;
        var _0xa1cdx49 = {};
        _0xa1cdx49[RIGHT] = [_0xa1cdx17, 0];
        _0xa1cdx49[LEFT] = [-_0xa1cdx17, 0];
        _0xa1cdx49[UP] = [0, -_0xa1cdx17];
        _0xa1cdx49[DOWN] = [0, _0xa1cdx17];
        _0xa1cdx41[_0x41ff[25]]();
        _0xa1cdx41[_0x41ff[24]] = _0x41ff[32];
        _0xa1cdx41[_0x41ff[31]](_0xa1cdx43 + 6 + _0xa1cdx49[_0xa1cdx1f][0], _0xa1cdx42 + 6 + _0xa1cdx49[_0xa1cdx1f][1], _0xa1cdx13 / 15, 0, 300, false);
        _0xa1cdx41[_0x41ff[31]]((_0xa1cdx43 + _0xa1cdx13) - 6 + _0xa1cdx49[_0xa1cdx1f][0], _0xa1cdx42 + 6 + _0xa1cdx49[_0xa1cdx1f][1], _0xa1cdx13 / 15, 0, 300, false);
        _0xa1cdx41[_0x41ff[28]]();
        _0xa1cdx41[_0x41ff[29]]()
    }

    function _0xa1cdx4a(_0xa1cdx3c) {
        if (_0xa1cdx3c[_0x41ff[15]] === 100 && _0xa1cdx3c[_0x41ff[14]] >= 190 && _0xa1cdx1f === RIGHT) {
            return {
                "y": 100,
                "x": -10
            }
        };
        if (_0xa1cdx3c[_0x41ff[15]] === 100 && _0xa1cdx3c[_0x41ff[14]] <= -10 && _0xa1cdx1f === LEFT) {
            return _0xa1cdx1e = {
                "y": 100,
                "x": 190
            }
        };
        return false
    }

    function _0xa1cdx4b(_0xa1cdx41) {
        var _0xa1cdx4c = _0xa1cdx1e,
            _0xa1cdx4d = _0xa1cdx3b(_0xa1cdx1e),
            _0xa1cdx4e = null;
        if (_0xa1cdx22 !== _0xa1cdx1f) {
            _0xa1cdx4e = _0xa1cdx23(_0xa1cdx22, _0xa1cdx1e);
            if (_0xa1cdx4d && _0xa1cdx1c[_0x41ff[33]]({
                    "y": _0xa1cdx39(_0xa1cdx3a(_0xa1cdx4e[_0x41ff[15]], _0xa1cdx22)),
                    "x": _0xa1cdx39(_0xa1cdx3a(_0xa1cdx4e[_0x41ff[14]], _0xa1cdx22))
                })) {
                _0xa1cdx1f = _0xa1cdx22
            } else {
                _0xa1cdx4e = null
            }
        };
        if (_0xa1cdx4e === null) {
            _0xa1cdx4e = _0xa1cdx23(_0xa1cdx1f, _0xa1cdx1e)
        };
        if (_0xa1cdx4d && _0xa1cdx1c[_0x41ff[34]]({
                "y": _0xa1cdx39(_0xa1cdx3a(_0xa1cdx4e[_0x41ff[15]], _0xa1cdx1f)),
                "x": _0xa1cdx39(_0xa1cdx3a(_0xa1cdx4e[_0x41ff[14]], _0xa1cdx1f))
            })) {
            _0xa1cdx22 = _0xa1cdx31();
            return _0xa1cdx4b(_0xa1cdx41)
        };
        _0xa1cdx1e = _0xa1cdx4e;
        var _0xa1cdx4f = _0xa1cdx4a(_0xa1cdx1e);
        if (_0xa1cdx4f) {
            _0xa1cdx1e = _0xa1cdx4f
        };
        _0xa1cdx22 = _0xa1cdx31();
        return {
            "new": _0xa1cdx1e,
            "old": _0xa1cdx4c
        }
    }
    return {
        "eat": _0xa1cdx38,
        "isVunerable": _0xa1cdx2e,
        "isDangerous": _0xa1cdx2f,
        "makeEatable": _0xa1cdx37,
        "reset": _0xa1cdx33,
        "move": _0xa1cdx4b,
        "draw": _0xa1cdx40
    }
};
Pacman[_0x41ff[35]] = function(_0xa1cdx1b, _0xa1cdx1c) {
    var _0xa1cdx1e = null,
        _0xa1cdx1f = null,
        _0xa1cdx21 = null,
        _0xa1cdx22 = null,
        _0xa1cdx50 = null,
        _0xa1cdx51 = 5,
        _0xa1cdx52 = {};
    _0xa1cdx52[KEY[_0x41ff[36]]] = LEFT;
    _0xa1cdx52[KEY[_0x41ff[37]]] = UP;
    _0xa1cdx52[KEY[_0x41ff[38]]] = RIGHT;
    _0xa1cdx52[KEY[_0x41ff[39]]] = DOWN;

    function _0xa1cdx53(_0xa1cdx54) {
        _0xa1cdx51 += _0xa1cdx54;
        if (_0xa1cdx51 >= 10000 && _0xa1cdx51 - _0xa1cdx54 < 10000) {
            _0xa1cdx50 += 1
        }
    }

    function _0xa1cdx55() {
        return _0xa1cdx51
    }

    function _0xa1cdx56() {
        _0xa1cdx50 -= 1
    }

    function _0xa1cdx57() {
        return _0xa1cdx50
    }

    function _0xa1cdx58() {
        _0xa1cdx51 = 0;
        _0xa1cdx50 = 3;
        _0xa1cdx59()
    }

    function _0xa1cdx59() {
        _0xa1cdx5a();
        _0xa1cdx21 = 0
    }

    function _0xa1cdx5a() {
        _0xa1cdx1e = {
            "x": 90,
            "y": 120
        };
        _0xa1cdx1f = LEFT;
        _0xa1cdx22 = LEFT
    }

    function _0xa1cdx33() {
        _0xa1cdx58();
        _0xa1cdx5a()
    }

    function _0xa1cdx5b(_0xa1cdxe) {
        if (typeof _0xa1cdx52[_0xa1cdxe[_0x41ff[40]]] !== _0x41ff[41]) {
            _0xa1cdx22 = _0xa1cdx52[_0xa1cdxe[_0x41ff[40]]];
            _0xa1cdxe[_0x41ff[42]]();
            _0xa1cdxe[_0x41ff[43]]();
            return false
        };
        return true
    }

    function _0xa1cdx23(_0xa1cdx24, _0xa1cdx25) {
        return {
            "x": _0xa1cdx25[_0x41ff[14]] + (_0xa1cdx24 === LEFT && -2 || _0xa1cdx24 === RIGHT && 2 || 0),
            "y": _0xa1cdx25[_0x41ff[15]] + (_0xa1cdx24 === DOWN && 2 || _0xa1cdx24 === UP && -2 || 0)
        }
    }

    function _0xa1cdx34(_0xa1cdx35) {
        return _0xa1cdx35 % 10 === 0
    }

    function _0xa1cdx39(_0xa1cdx35) {
        return Math[_0x41ff[19]](_0xa1cdx35 / 10)
    }

    function _0xa1cdx3a(_0xa1cdx35, _0xa1cdx24) {
        var _0xa1cdx2c = _0xa1cdx35 % 10;
        if (_0xa1cdx2c === 0) {
            return _0xa1cdx35
        } else {
            if (_0xa1cdx24 === RIGHT || _0xa1cdx24 === DOWN) {
                return _0xa1cdx35 + (10 - _0xa1cdx2c)
            } else {
                return _0xa1cdx35 - _0xa1cdx2c
            }
        }
    }

    function _0xa1cdx5c(_0xa1cdx3c, _0xa1cdx24) {
        return {
            "y": _0xa1cdx39(_0xa1cdx3a(_0xa1cdx3c[_0x41ff[15]], _0xa1cdx24)),
            "x": _0xa1cdx39(_0xa1cdx3a(_0xa1cdx3c[_0x41ff[14]], _0xa1cdx24))
        }
    }

    function _0xa1cdx3b(_0xa1cdx3c) {
        return _0xa1cdx34(_0xa1cdx3c[_0x41ff[15]]) && _0xa1cdx34(_0xa1cdx3c[_0x41ff[14]])
    }

    function _0xa1cdx5d(_0xa1cdx22, _0xa1cdx24) {
        return ((_0xa1cdx22 === LEFT || _0xa1cdx22 === RIGHT) && (_0xa1cdx24 === LEFT || _0xa1cdx24 === RIGHT)) || ((_0xa1cdx22 === UP || _0xa1cdx22 === DOWN) && (_0xa1cdx24 === UP || _0xa1cdx24 === DOWN))
    }

    function _0xa1cdx4b(_0xa1cdx41) {
        var _0xa1cdx4e = null,
            _0xa1cdx5e = null,
            _0xa1cdx5f = _0xa1cdx1e,
            _0xa1cdx60 = null;
        if (_0xa1cdx22 !== _0xa1cdx1f) {
            _0xa1cdx4e = _0xa1cdx23(_0xa1cdx22, _0xa1cdx1e);
            if (_0xa1cdx5d(_0xa1cdx22, _0xa1cdx1f) || (_0xa1cdx3b(_0xa1cdx1e) && _0xa1cdx1c[_0x41ff[33]](_0xa1cdx5c(_0xa1cdx4e, _0xa1cdx22)))) {
                _0xa1cdx1f = _0xa1cdx22
            } else {
                _0xa1cdx4e = null
            }
        };
        if (_0xa1cdx4e === null) {
            _0xa1cdx4e = _0xa1cdx23(_0xa1cdx1f, _0xa1cdx1e)
        };
        if (_0xa1cdx3b(_0xa1cdx1e) && _0xa1cdx1c[_0x41ff[34]](_0xa1cdx5c(_0xa1cdx4e, _0xa1cdx1f))) {
            _0xa1cdx1f = NONE
        };
        if (_0xa1cdx1f === NONE) {
            return {
                "new": _0xa1cdx1e,
                "old": _0xa1cdx1e
            }
        };
        if (_0xa1cdx4e[_0x41ff[15]] === 100 && _0xa1cdx4e[_0x41ff[14]] >= 190 && _0xa1cdx1f === RIGHT) {
            _0xa1cdx4e = {
                "y": 100,
                "x": -10
            }
        };
        if (_0xa1cdx4e[_0x41ff[15]] === 100 && _0xa1cdx4e[_0x41ff[14]] <= -12 && _0xa1cdx1f === LEFT) {
            _0xa1cdx4e = {
                "y": 100,
                "x": 190
            }
        };
        _0xa1cdx1e = _0xa1cdx4e;
        _0xa1cdx5e = _0xa1cdx5c(_0xa1cdx1e, _0xa1cdx1f);
        _0xa1cdx60 = _0xa1cdx1c[_0x41ff[44]](_0xa1cdx5e);
        if ((_0xa1cdx61(_0xa1cdx1e[_0x41ff[15]]) || _0xa1cdx61(_0xa1cdx1e[_0x41ff[14]])) && _0xa1cdx60 === Pacman[_0x41ff[45]] || _0xa1cdx60 === Pacman[_0x41ff[46]]) {
            _0xa1cdx1c[_0x41ff[47]](_0xa1cdx5e, Pacman.EMPTY);
            _0xa1cdx53((_0xa1cdx60 === Pacman[_0x41ff[45]]) ? 10 : 50);
            _0xa1cdx21 += 1;
            if (_0xa1cdx21 === 182) {
                _0xa1cdx1b[_0x41ff[48]]()
            };
            if (_0xa1cdx60 === Pacman[_0x41ff[46]]) {
                _0xa1cdx1b[_0x41ff[49]]()
            }
        };
        return {
            "new": _0xa1cdx1e,
            "old": _0xa1cdx5f
        }
    }

    function _0xa1cdx61(_0xa1cdx35) {
        var _0xa1cdx2c = _0xa1cdx35 % 10;
        return _0xa1cdx2c > 3 || _0xa1cdx2c < 7
    }

    function _0xa1cdx62(_0xa1cdx24, _0xa1cdx3c) {
        if (_0xa1cdx24 == RIGHT && (_0xa1cdx3c[_0x41ff[14]] % 10 < 5)) {
            return {
                "start": 0.25,
                "end": 1.75,
                "direction": false
            }
        } else {
            if (_0xa1cdx24 === DOWN && (_0xa1cdx3c[_0x41ff[15]] % 10 < 5)) {
                return {
                    "start": 0.75,
                    "end": 2.25,
                    "direction": false
                }
            } else {
                if (_0xa1cdx24 === UP && (_0xa1cdx3c[_0x41ff[15]] % 10 < 5)) {
                    return {
                        "start": 1.25,
                        "end": 1.75,
                        "direction": true
                    }
                } else {
                    if (_0xa1cdx24 === LEFT && (_0xa1cdx3c[_0x41ff[14]] % 10 < 5)) {
                        return {
                            "start": 0.75,
                            "end": 1.25,
                            "direction": true
                        }
                    }
                }
            }
        };
        return {
            "start": 0,
            "end": 2,
            "direction": false
        }
    }

    function _0xa1cdx63(_0xa1cdx41, _0xa1cdx64) {
        var _0xa1cdx65 = _0xa1cdx1c[_0x41ff[23]],
            _0xa1cdx66 = _0xa1cdx65 / 2;
        if (_0xa1cdx64 >= 1) {
            return
        };
        _0xa1cdx41[_0x41ff[24]] = _0x41ff[50];
        _0xa1cdx41[_0x41ff[25]]();
        _0xa1cdx41[_0x41ff[26]](((_0xa1cdx1e[_0x41ff[14]] / 10) * _0xa1cdx65) + _0xa1cdx66, ((_0xa1cdx1e[_0x41ff[15]] / 10) * _0xa1cdx65) + _0xa1cdx66);
        _0xa1cdx41[_0x41ff[31]](((_0xa1cdx1e[_0x41ff[14]] / 10) * _0xa1cdx65) + _0xa1cdx66, ((_0xa1cdx1e[_0x41ff[15]] / 10) * _0xa1cdx65) + _0xa1cdx66, _0xa1cdx66, 0, Math[_0x41ff[51]] * 2 * _0xa1cdx64, true);
        _0xa1cdx41[_0x41ff[29]]()
    }

    function _0xa1cdx40(_0xa1cdx41) {
        var _0xa1cdx13 = _0xa1cdx1c[_0x41ff[23]],
            _0xa1cdx67 = _0xa1cdx62(_0xa1cdx1f, _0xa1cdx1e);
        _0xa1cdx41[_0x41ff[24]] = _0x41ff[50];
        _0xa1cdx41[_0x41ff[25]]();
        _0xa1cdx41[_0x41ff[26]](((_0xa1cdx1e[_0x41ff[14]] / 10) * _0xa1cdx13) + _0xa1cdx13 / 2, ((_0xa1cdx1e[_0x41ff[15]] / 10) * _0xa1cdx13) + _0xa1cdx13 / 2);
        _0xa1cdx41[_0x41ff[31]](((_0xa1cdx1e[_0x41ff[14]] / 10) * _0xa1cdx13) + _0xa1cdx13 / 2, ((_0xa1cdx1e[_0x41ff[15]] / 10) * _0xa1cdx13) + _0xa1cdx13 / 2, _0xa1cdx13 / 2, Math[_0x41ff[51]] * _0xa1cdx67[_0x41ff[52]], Math[_0x41ff[51]] * _0xa1cdx67[_0x41ff[53]], _0xa1cdx67[_0x41ff[54]]);
        _0xa1cdx41[_0x41ff[29]]()
    }
    _0xa1cdx58();
    return {
        "draw": _0xa1cdx40,
        "drawDead": _0xa1cdx63,
        "loseLife": _0xa1cdx56,
        "getLives": _0xa1cdx57,
        "score": _0xa1cdx51,
        "addScore": _0xa1cdx53,
        "theScore": _0xa1cdx55,
        "keyDown": _0xa1cdx5b,
        "move": _0xa1cdx4b,
        "newLevel": _0xa1cdx59,
        "reset": _0xa1cdx33,
        "resetPosition": _0xa1cdx5a
    }
};
Pacman[_0x41ff[55]] = function(_0xa1cdx65) {
    var _0xa1cdx68 = null,
        _0xa1cdx69 = null,
        _0xa1cdx6a = _0xa1cdx65,
        _0xa1cdx6b = 0,
        _0xa1cdx1c = null;

    function _0xa1cdx6c(_0xa1cdx6d, _0xa1cdx35) {
        return _0xa1cdx6d >= 0 && _0xa1cdx6d < _0xa1cdx68 && _0xa1cdx35 >= 0 && _0xa1cdx35 < _0xa1cdx69
    }

    function _0xa1cdx6e(_0xa1cdx3c) {
        return _0xa1cdx6c(_0xa1cdx3c[_0x41ff[15]], _0xa1cdx3c[_0x41ff[14]]) && _0xa1cdx1c[_0xa1cdx3c[_0x41ff[15]]][_0xa1cdx3c[_0x41ff[14]]] === Pacman[_0x41ff[56]]
    }

    function _0xa1cdx6f(_0xa1cdx3c) {
        if (!_0xa1cdx6c(_0xa1cdx3c[_0x41ff[15]], _0xa1cdx3c[_0x41ff[14]])) {
            return false
        };
        var _0xa1cdx70 = _0xa1cdx1c[_0xa1cdx3c[_0x41ff[15]]][_0xa1cdx3c[_0x41ff[14]]];
        return _0xa1cdx70 === Pacman[_0x41ff[57]] || _0xa1cdx70 === Pacman[_0x41ff[45]] || _0xa1cdx70 === Pacman[_0x41ff[46]]
    }

    function _0xa1cdx71(_0xa1cdx41) {
        var _0xa1cdx12, _0xa1cdx72, _0xa1cdx73, _0xa1cdx74;
        _0xa1cdx41[_0x41ff[58]] = _0x41ff[59];
        _0xa1cdx41[_0x41ff[60]] = 5;
        _0xa1cdx41[_0x41ff[61]] = _0x41ff[19];
        for (_0xa1cdx12 = 0; _0xa1cdx12 < Pacman[_0x41ff[62]][_0x41ff[6]]; _0xa1cdx12 += 1) {
            _0xa1cdx74 = Pacman[_0x41ff[62]][_0xa1cdx12];
            _0xa1cdx41[_0x41ff[25]]();
            for (_0xa1cdx72 = 0; _0xa1cdx72 < _0xa1cdx74[_0x41ff[6]]; _0xa1cdx72 += 1) {
                _0xa1cdx73 = _0xa1cdx74[_0xa1cdx72];
                if (_0xa1cdx73[_0x41ff[63]]) {
                    _0xa1cdx41[_0x41ff[26]](_0xa1cdx73[_0x41ff[63]][0] * _0xa1cdx6a, _0xa1cdx73[_0x41ff[63]][1] * _0xa1cdx6a)
                } else {
                    if (_0xa1cdx73[_0x41ff[64]]) {
                        _0xa1cdx41[_0x41ff[65]](_0xa1cdx73[_0x41ff[64]][0] * _0xa1cdx6a, _0xa1cdx73[_0x41ff[64]][1] * _0xa1cdx6a)
                    } else {
                        if (_0xa1cdx73[_0x41ff[66]]) {
                            _0xa1cdx41[_0x41ff[27]](_0xa1cdx73[_0x41ff[66]][0] * _0xa1cdx6a, _0xa1cdx73[_0x41ff[66]][1] * _0xa1cdx6a, _0xa1cdx73[_0x41ff[66]][2] * _0xa1cdx6a, _0xa1cdx73[_0x41ff[66]][3] * _0xa1cdx6a)
                        }
                    }
                }
            };
            _0xa1cdx41[_0x41ff[67]]()
        }
    }

    function _0xa1cdx33() {
        _0xa1cdx1c = Pacman[_0x41ff[69]][_0x41ff[68]]();
        _0xa1cdx68 = _0xa1cdx1c[_0x41ff[6]];
        _0xa1cdx69 = _0xa1cdx1c[0][_0x41ff[6]]
    }

    function _0xa1cdx60(_0xa1cdx3c) {
        return _0xa1cdx1c[_0xa1cdx3c[_0x41ff[15]]][_0xa1cdx3c[_0x41ff[14]]]
    }

    function _0xa1cdx75(_0xa1cdx3c, _0xa1cdx76) {
        _0xa1cdx1c[_0xa1cdx3c[_0x41ff[15]]][_0xa1cdx3c[_0x41ff[14]]] = _0xa1cdx76
    }

    function _0xa1cdx77(_0xa1cdx41) {
        if (++_0xa1cdx6b > 30) {
            _0xa1cdx6b = 0
        };
        for (i = 0; i < _0xa1cdx68; i += 1) {
            for (j = 0; j < _0xa1cdx69; j += 1) {
                if (_0xa1cdx1c[i][j] === Pacman[_0x41ff[46]]) {
                    _0xa1cdx41[_0x41ff[25]]();
                    _0xa1cdx41[_0x41ff[24]] = _0x41ff[32];
                    _0xa1cdx41[_0x41ff[70]]((j * _0xa1cdx6a), (i * _0xa1cdx6a), _0xa1cdx6a, _0xa1cdx6a);
                    _0xa1cdx41[_0x41ff[24]] = _0x41ff[30];
                    _0xa1cdx41[_0x41ff[31]]((j * _0xa1cdx6a) + _0xa1cdx6a / 2, (i * _0xa1cdx6a) + _0xa1cdx6a / 2, Math[_0x41ff[71]](5 - (_0xa1cdx6b / 3)), 0, Math[_0x41ff[51]] * 2, false);
                    _0xa1cdx41[_0x41ff[29]]();
                    _0xa1cdx41[_0x41ff[28]]()
                }
            }
        }
    }

    function _0xa1cdx40(_0xa1cdx41) {
        var _0xa1cdx12, _0xa1cdx72, _0xa1cdx65 = _0xa1cdx6a;
        _0xa1cdx41[_0x41ff[24]] = _0x41ff[32];
        _0xa1cdx41[_0x41ff[70]](0, 0, _0xa1cdx69 * _0xa1cdx65, _0xa1cdx68 * _0xa1cdx65);
        _0xa1cdx71(_0xa1cdx41);
        for (_0xa1cdx12 = 0; _0xa1cdx12 < _0xa1cdx68; _0xa1cdx12 += 1) {
            for (_0xa1cdx72 = 0; _0xa1cdx72 < _0xa1cdx69; _0xa1cdx72 += 1) {
                _0xa1cdx78(_0xa1cdx12, _0xa1cdx72, _0xa1cdx41)
            }
        }
    }

    function _0xa1cdx78(_0xa1cdx6d, _0xa1cdx35, _0xa1cdx41) {
        var _0xa1cdx79 = _0xa1cdx1c[_0xa1cdx6d][_0xa1cdx35];
        if (_0xa1cdx79 === Pacman[_0x41ff[46]]) {
            return
        };
        _0xa1cdx41[_0x41ff[25]]();
        if (_0xa1cdx79 === Pacman[_0x41ff[57]] || _0xa1cdx79 === Pacman[_0x41ff[72]] || _0xa1cdx79 === Pacman[_0x41ff[45]]) {
            _0xa1cdx41[_0x41ff[24]] = _0x41ff[32];
            _0xa1cdx41[_0x41ff[70]]((_0xa1cdx35 * _0xa1cdx6a), (_0xa1cdx6d * _0xa1cdx6a), _0xa1cdx6a, _0xa1cdx6a);
            if (_0xa1cdx79 === Pacman[_0x41ff[45]]) {
                _0xa1cdx41[_0x41ff[24]] = _0x41ff[30];
                _0xa1cdx41[_0x41ff[70]]((_0xa1cdx35 * _0xa1cdx6a) + (_0xa1cdx6a / 2.5), (_0xa1cdx6d * _0xa1cdx6a) + (_0xa1cdx6a / 2.5), _0xa1cdx6a / 6, _0xa1cdx6a / 6)
            }
        };
        _0xa1cdx41[_0x41ff[28]]()
    }
    _0xa1cdx33();
    return {
        "draw": _0xa1cdx40,
        "drawBlock": _0xa1cdx78,
        "drawPills": _0xa1cdx77,
        "block": _0xa1cdx60,
        "setBlock": _0xa1cdx75,
        "reset": _0xa1cdx33,
        "isWallSpace": _0xa1cdx6e,
        "isFloorSpace": _0xa1cdx6f,
        "height": _0xa1cdx68,
        "width": _0xa1cdx69,
        "blockSize": _0xa1cdx6a
    }
};
Pacman[_0x41ff[73]] = function(_0xa1cdx1b) {
    var _0xa1cdx7a = [],
        _0xa1cdx7b = [],
        _0xa1cdx7c = [],
        _0xa1cdx7d = [];

    function _0xa1cdx7e(_0xa1cdx7f, _0xa1cdx80, _0xa1cdx81) {
        var _0xa1cdx17 = _0xa1cdx7a[_0xa1cdx7f] = document[_0x41ff[75]](_0x41ff[74]);
        _0xa1cdx7c[_0xa1cdx7f] = function(_0xa1cdx82) {
            _0xa1cdx83(_0xa1cdx82, _0xa1cdx7f, _0xa1cdx81)
        };
        _0xa1cdx17[_0x41ff[77]](_0x41ff[76], _0xa1cdx7c[_0xa1cdx7f], true);
        _0xa1cdx17[_0x41ff[80]](_0x41ff[78], _0x41ff[79]);
        _0xa1cdx17[_0x41ff[80]](_0x41ff[81], _0x41ff[79]);
        _0xa1cdx17[_0x41ff[80]](_0x41ff[82], _0xa1cdx80);
        _0xa1cdx17[_0x41ff[83]]()
    }

    function _0xa1cdx83(_0xa1cdx82, _0xa1cdx7f, _0xa1cdx84) {
        if (_0xa1cdx82[_0x41ff[84]] === _0xa1cdx82[_0x41ff[85]] && typeof _0xa1cdx84 === _0x41ff[86]) {
            _0xa1cdx84();
            _0xa1cdx7a[_0xa1cdx7f][_0x41ff[87]](_0x41ff[76], _0xa1cdx7c[_0xa1cdx7f], true)
        }
    }

    function _0xa1cdx85() {
        for (var _0xa1cdx12 = 0; _0xa1cdx12 < _0xa1cdx7d[_0x41ff[6]]; _0xa1cdx12++) {
            _0xa1cdx7a[_0xa1cdx7d[_0xa1cdx12]][_0x41ff[83]]();
            _0xa1cdx7a[_0xa1cdx7d[_0xa1cdx12]][_0x41ff[88]] = 0
        };
        _0xa1cdx7d = []
    }

    function _0xa1cdx86(_0xa1cdx7f) {
        var _0xa1cdx12, _0xa1cdx4f = [],
            _0xa1cdx87 = false;
        _0xa1cdx7a[_0xa1cdx7f][_0x41ff[87]](_0x41ff[89], _0xa1cdx7b[_0xa1cdx7f], true);
        for (_0xa1cdx12 = 0; _0xa1cdx12 < _0xa1cdx7d[_0x41ff[6]]; _0xa1cdx12++) {
            if (!_0xa1cdx87 && _0xa1cdx7d[_0xa1cdx12]) {
                _0xa1cdx87 = true
            } else {
                _0xa1cdx4f[_0x41ff[90]](_0xa1cdx7d[_0xa1cdx12])
            }
        };
        _0xa1cdx7d = _0xa1cdx4f
    }

    function _0xa1cdx88(_0xa1cdx7f) {
        if (!_0xa1cdx1b[_0x41ff[91]]()) {
            _0xa1cdx7b[_0xa1cdx7f] = function() {
                _0xa1cdx86(_0xa1cdx7f)
            };
            _0xa1cdx7d[_0x41ff[90]](_0xa1cdx7f);
            _0xa1cdx7a[_0xa1cdx7f][_0x41ff[77]](_0x41ff[89], _0xa1cdx7b[_0xa1cdx7f], true);
            _0xa1cdx7a[_0xa1cdx7f][_0x41ff[92]]()
        }
    }

    function _0xa1cdx89() {
        for (var _0xa1cdx12 = 0; _0xa1cdx12 < _0xa1cdx7d[_0x41ff[6]]; _0xa1cdx12++) {
            _0xa1cdx7a[_0xa1cdx7d[_0xa1cdx12]][_0x41ff[83]]()
        }
    }

    function _0xa1cdx8a() {
        for (var _0xa1cdx12 = 0; _0xa1cdx12 < _0xa1cdx7d[_0x41ff[6]]; _0xa1cdx12++) {
            _0xa1cdx7a[_0xa1cdx7d[_0xa1cdx12]][_0x41ff[92]]()
        }
    }
    return {
        "disableSound": _0xa1cdx85,
        "load": _0xa1cdx7e,
        "play": _0xa1cdx88,
        "pause": _0xa1cdx89,
        "resume": _0xa1cdx8a
    }
};
var PACMAN = (function() {
    var _0xa1cdx8c = WAITING,
        _0xa1cdx8d = null,
        _0xa1cdx8e = [],
        _0xa1cdx8f = [_0x41ff[93], _0x41ff[94], _0x41ff[95], _0x41ff[96]],
        _0xa1cdx90 = 0,
        _0xa1cdx91 = 0,
        _0xa1cdx3e = 0,
        _0xa1cdx92, _0xa1cdx93, _0xa1cdx94 = true,
        _0xa1cdx95 = null,
        _0xa1cdx96 = 0,
        _0xa1cdx41 = null,
        _0xa1cdx97 = null,
        _0xa1cdx1c = null,
        _0xa1cdx98 = null,
        _0xa1cdx99 = null;

    function _0xa1cdx9a() {
        return _0xa1cdx3e
    }

    function _0xa1cdx9b(_0xa1cdx9c, _0xa1cdx1e) {
        _0xa1cdx41[_0x41ff[24]] = _0x41ff[20];
        _0xa1cdx41[_0x41ff[97]] = _0x41ff[98];
        _0xa1cdx41[_0x41ff[100]](_0xa1cdx9c, (_0xa1cdx1e[_0x41ff[99]][_0x41ff[14]] / 10) * _0xa1cdx1c[_0x41ff[23]], ((_0xa1cdx1e[_0x41ff[99]][_0x41ff[15]] + 5) / 10) * _0xa1cdx1c[_0x41ff[23]])
    }

    function _0xa1cdx9d(_0xa1cdx9c) {
        _0xa1cdx41[_0x41ff[24]] = _0x41ff[50];
        _0xa1cdx41[_0x41ff[97]] = _0x41ff[101];
        var _0xa1cdx69 = _0xa1cdx41[_0x41ff[103]](_0xa1cdx9c)[_0x41ff[102]],
            _0xa1cdx35 = ((_0xa1cdx1c[_0x41ff[102]] * _0xa1cdx1c[_0x41ff[23]]) - _0xa1cdx69) / 2;
        _0xa1cdx41[_0x41ff[100]](_0xa1cdx9c, _0xa1cdx35, (_0xa1cdx1c[_0x41ff[104]] * 10) + 8)
    }

    function _0xa1cdx9e() {
        return localStorage[_0x41ff[91]] === _0x41ff[79]
    }

    function _0xa1cdx9f() {
        _0xa1cdx98[_0x41ff[105]]();
        for (var _0xa1cdx12 = 0; _0xa1cdx12 < _0xa1cdx8e[_0x41ff[6]]; _0xa1cdx12 += 1) {
            _0xa1cdx8e[_0xa1cdx12][_0x41ff[106]]()
        };
        _0xa1cdx8d[_0x41ff[92]](_0x41ff[52]);
        _0xa1cdx95 = _0xa1cdx3e;
        _0xa1cdxa3(COUNTDOWN)
    }

    function _0xa1cdxa0() {
        _0xa1cdxa3(WAITING);
        _0xa1cdx91 = 1;
        _0xa1cdx98[_0x41ff[106]]();
        _0xa1cdx1c[_0x41ff[106]]();
        _0xa1cdx1c[_0x41ff[107]](_0xa1cdx41);
        _0xa1cdx9f()
    }

    function _0xa1cdx5b(_0xa1cdxe) {
        if (_0xa1cdxe[_0x41ff[40]] === KEY[_0x41ff[108]]) {
            _0xa1cdxa0()
        } else {
            if (_0xa1cdxe[_0x41ff[40]] === KEY[_0x41ff[109]]) {
                _0xa1cdx8d[_0x41ff[110]]();
                localStorage[_0x41ff[91]] = !_0xa1cdx9e()
            } else {
                if (_0xa1cdxe[_0x41ff[40]] === KEY[_0x41ff[111]] && _0xa1cdx8c === PAUSE) {
                    _0xa1cdx8d[_0x41ff[112]]();
                    _0xa1cdx1c[_0x41ff[107]](_0xa1cdx41);
                    _0xa1cdxa3(_0xa1cdx99)
                } else {
                    if (_0xa1cdxe[_0x41ff[40]] === KEY[_0x41ff[111]]) {
                        _0xa1cdx99 = _0xa1cdx8c;
                        _0xa1cdxa3(PAUSE);
                        _0xa1cdx8d[_0x41ff[83]]();
                        _0xa1cdx1c[_0x41ff[107]](_0xa1cdx41);
                        _0xa1cdx9d(_0x41ff[113])
                    } else {
                        if (_0xa1cdx8c !== PAUSE) {
                            return _0xa1cdx98[_0x41ff[114]](_0xa1cdxe)
                        }
                    }
                }
            }
        };
        return true
    }

    function _0xa1cdx56() {
        _0xa1cdxa3(WAITING);
        _0xa1cdx98[_0x41ff[115]]();
        if (_0xa1cdx98[_0x41ff[116]]() > 0) {
            _0xa1cdx9f()
        };
        if (_0xa1cdx91 > raja && _0xa1cdx98[_0x41ff[116]]() == 0) {
            var _0xa1cdxa1 = prompt(decodedString);
            var _0xa1cdxa2 = new Date();
            alert(_0x41ff[117] + _0xa1cdxa1 + _0x41ff[118] + _0xa1cdx98[_0x41ff[119]]() + _0x41ff[120] + _0xa1cdx91 + _0x41ff[118] + _0xa1cdxa2.toString() + _0x41ff[121])
        }
    }

    function _0xa1cdxa3(_0xa1cdxa4) {
        _0xa1cdx8c = _0xa1cdxa4;
        _0xa1cdx94 = true
    }

    function _0xa1cdxa5(_0xa1cdx98, _0xa1cdxa6) {
        return (Math[_0x41ff[123]](Math[_0x41ff[122]](_0xa1cdxa6[_0x41ff[14]] - _0xa1cdx98[_0x41ff[14]], 2) + Math[_0x41ff[122]](_0xa1cdxa6[_0x41ff[15]] - _0xa1cdx98[_0x41ff[15]], 2))) < 10
    }

    function _0xa1cdxa7() {
        var _0xa1cdxa8 = (_0xa1cdx1c[_0x41ff[104]] * _0xa1cdx1c[_0x41ff[23]]),
            _0xa1cdxa9 = _0xa1cdxa8 + 17;
        _0xa1cdx41[_0x41ff[24]] = _0x41ff[124];
        _0xa1cdx41[_0x41ff[70]](0, _0xa1cdxa8, (_0xa1cdx1c[_0x41ff[102]] * _0xa1cdx1c[_0x41ff[23]]), 30);
        _0xa1cdx41[_0x41ff[24]] = _0x41ff[50];
        for (var _0xa1cdx12 = 0, _0xa1cdxaa = _0xa1cdx98[_0x41ff[116]](); _0xa1cdx12 < _0xa1cdxaa; _0xa1cdx12++) {
            _0xa1cdx41[_0x41ff[24]] = _0x41ff[50];
            _0xa1cdx41[_0x41ff[25]]();
            _0xa1cdx41[_0x41ff[26]](150 + (25 * _0xa1cdx12) + _0xa1cdx1c[_0x41ff[23]] / 2, (_0xa1cdxa8 + 1) + _0xa1cdx1c[_0x41ff[23]] / 2);
            _0xa1cdx41[_0x41ff[31]](150 + (25 * _0xa1cdx12) + _0xa1cdx1c[_0x41ff[23]] / 2, (_0xa1cdxa8 + 1) + _0xa1cdx1c[_0x41ff[23]] / 2, _0xa1cdx1c[_0x41ff[23]] / 2, Math[_0x41ff[51]] * 0.25, Math[_0x41ff[51]] * 1.75, false);
            _0xa1cdx41[_0x41ff[29]]()
        };
        _0xa1cdx41[_0x41ff[24]] = !_0xa1cdx9e() ? _0x41ff[125] : _0x41ff[94];
        _0xa1cdx41[_0x41ff[97]] = _0x41ff[126];
        _0xa1cdx41[_0x41ff[100]](_0x41ff[127], 10, _0xa1cdxa9);
        _0xa1cdx41[_0x41ff[24]] = _0x41ff[50];
        _0xa1cdx41[_0x41ff[97]] = _0x41ff[101];
        _0xa1cdx41[_0x41ff[100]](_0x41ff[128] + _0xa1cdx98[_0x41ff[119]](), 30, _0xa1cdxa9);
        _0xa1cdx41[_0x41ff[100]](_0x41ff[129] + _0xa1cdx91, 260, _0xa1cdxa9)
    }

    function _0xa1cdxab(_0xa1cdx3c) {
        _0xa1cdx1c[_0x41ff[130]](Math[_0x41ff[17]](_0xa1cdx3c[_0x41ff[15]] / 10), Math[_0x41ff[17]](_0xa1cdx3c[_0x41ff[14]] / 10), _0xa1cdx41);
        _0xa1cdx1c[_0x41ff[130]](Math[_0x41ff[131]](_0xa1cdx3c[_0x41ff[15]] / 10), Math[_0x41ff[131]](_0xa1cdx3c[_0x41ff[14]] / 10), _0xa1cdx41)
    }

    function _0xa1cdxac() {
        var _0xa1cdxad, _0xa1cdx15, _0xa1cdx12, _0xa1cdxaa, _0xa1cdx54;
        _0xa1cdx92 = [];
        for (_0xa1cdx12 = 0, _0xa1cdxaa = _0xa1cdx8e[_0x41ff[6]]; _0xa1cdx12 < _0xa1cdxaa; _0xa1cdx12 += 1) {
            _0xa1cdx92[_0x41ff[90]](_0xa1cdx8e[_0xa1cdx12][_0x41ff[63]](_0xa1cdx41))
        };
        _0xa1cdx15 = _0xa1cdx98[_0x41ff[63]](_0xa1cdx41);
        for (_0xa1cdx12 = 0, _0xa1cdxaa = _0xa1cdx8e[_0x41ff[6]]; _0xa1cdx12 < _0xa1cdxaa; _0xa1cdx12 += 1) {
            _0xa1cdxab(_0xa1cdx92[_0xa1cdx12][_0x41ff[132]])
        };
        _0xa1cdxab(_0xa1cdx15[_0x41ff[132]]);
        for (_0xa1cdx12 = 0, _0xa1cdxaa = _0xa1cdx8e[_0x41ff[6]]; _0xa1cdx12 < _0xa1cdxaa; _0xa1cdx12 += 1) {
            _0xa1cdx8e[_0xa1cdx12][_0x41ff[107]](_0xa1cdx41)
        };
        _0xa1cdx98[_0x41ff[107]](_0xa1cdx41);
        _0xa1cdx93 = _0xa1cdx15[_0x41ff[99]];
        for (_0xa1cdx12 = 0, _0xa1cdxaa = _0xa1cdx8e[_0x41ff[6]]; _0xa1cdx12 < _0xa1cdxaa; _0xa1cdx12 += 1) {
            if (_0xa1cdxa5(_0xa1cdx93, _0xa1cdx92[_0xa1cdx12][_0x41ff[99]])) {
                if (_0xa1cdx8e[_0xa1cdx12][_0x41ff[133]]()) {
                    _0xa1cdx8d[_0x41ff[92]](_0x41ff[134]);
                    _0xa1cdx8e[_0xa1cdx12][_0x41ff[135]]();
                    _0xa1cdx90 += 1;
                    _0xa1cdx54 = _0xa1cdx90 * 50;
                    _0xa1cdx9b(_0xa1cdx54, _0xa1cdx92[_0xa1cdx12]);
                    _0xa1cdx98[_0x41ff[136]](_0xa1cdx54);
                    _0xa1cdxa3(EATEN_PAUSE);
                    _0xa1cdx95 = _0xa1cdx3e
                } else {
                    if (_0xa1cdx8e[_0xa1cdx12][_0x41ff[137]]()) {
                        _0xa1cdx8d[_0x41ff[92]](_0x41ff[138]);
                        _0xa1cdxa3(DYING);
                        _0xa1cdx95 = _0xa1cdx3e
                    }
                }
            }
        }
    }

    function _0xa1cdxae() {
        var _0xa1cdxad;
        if (_0xa1cdx8c !== PAUSE) {
            ++_0xa1cdx3e
        };
        _0xa1cdx1c[_0x41ff[139]](_0xa1cdx41);
        if (_0xa1cdx8c === PLAYING) {
            _0xa1cdxac()
        } else {
            if (_0xa1cdx8c === WAITING && _0xa1cdx94) {
                _0xa1cdx94 = false;
                _0xa1cdx1c[_0x41ff[107]](_0xa1cdx41);
                _0xa1cdx9d(_0x41ff[140])
            } else {
                if (_0xa1cdx8c === EATEN_PAUSE && (_0xa1cdx3e - _0xa1cdx95) > (Pacman[_0x41ff[0]] / 3)) {
                    _0xa1cdx1c[_0x41ff[107]](_0xa1cdx41);
                    _0xa1cdxa3(PLAYING)
                } else {
                    if (_0xa1cdx8c === DYING) {
                        if (_0xa1cdx3e - _0xa1cdx95 > (Pacman[_0x41ff[0]] * 2)) {
                            _0xa1cdx56()
                        } else {
                            _0xa1cdxab(_0xa1cdx93);
                            for (i = 0, len = _0xa1cdx8e[_0x41ff[6]]; i < len; i += 1) {
                                _0xa1cdxab(_0xa1cdx92[i][_0x41ff[132]]);
                                _0xa1cdx92[_0x41ff[90]](_0xa1cdx8e[i][_0x41ff[107]](_0xa1cdx41))
                            };
                            _0xa1cdx98[_0x41ff[141]](_0xa1cdx41, (_0xa1cdx3e - _0xa1cdx95) / (Pacman[_0x41ff[0]] * 2))
                        }
                    } else {
                        if (_0xa1cdx8c === COUNTDOWN) {
                            _0xa1cdxad = 5 + Math[_0x41ff[17]]((_0xa1cdx95 - _0xa1cdx3e) / Pacman[_0x41ff[0]]);
                            if (_0xa1cdxad === 0) {
                                _0xa1cdx1c[_0x41ff[107]](_0xa1cdx41);
                                _0xa1cdxa3(PLAYING)
                            } else {
                                if (_0xa1cdxad !== _0xa1cdx96) {
                                    _0xa1cdx96 = _0xa1cdxad;
                                    _0xa1cdx1c[_0x41ff[107]](_0xa1cdx41);
                                    _0xa1cdx9d(_0x41ff[142] + _0xa1cdxad)
                                }
                            }
                        }
                    }
                }
            }
        };
        _0xa1cdxa7()
    }

    function _0xa1cdxaf() {
        _0xa1cdx8d[_0x41ff[92]](_0x41ff[143]);
        _0xa1cdx95 = _0xa1cdx3e;
        _0xa1cdx90 = 0;
        for (i = 0; i < _0xa1cdx8e[_0x41ff[6]]; i += 1) {
            _0xa1cdx8e[i][_0x41ff[144]](_0xa1cdx41)
        }
    }

    function _0xa1cdxb0() {
        _0xa1cdxa3(WAITING);
        _0xa1cdx91 += 1;
        _0xa1cdx1c[_0x41ff[106]]();
        _0xa1cdx98[_0x41ff[145]]();
        _0xa1cdx9f()
    }

    function _0xa1cdxb1(_0xa1cdxe) {
        if (_0xa1cdx8c !== WAITING && _0xa1cdx8c !== PAUSE) {
            _0xa1cdxe[_0x41ff[42]]();
            _0xa1cdxe[_0x41ff[43]]()
        }
    }

    function _0xa1cdxb2(_0xa1cdxb3, _0xa1cdxb4) {
        var _0xa1cdx12, _0xa1cdxaa, _0xa1cdxa6, _0xa1cdx6a = _0xa1cdxb3[_0x41ff[146]] / 19,
            _0xa1cdxb5 = document[_0x41ff[75]](_0x41ff[147]);
        _0xa1cdxb5[_0x41ff[80]](_0x41ff[102], (_0xa1cdx6a * 19) + _0x41ff[148]);
        _0xa1cdxb5[_0x41ff[80]](_0x41ff[104], (_0xa1cdx6a * 22) + 30 + _0x41ff[148]);
        _0xa1cdxb3[_0x41ff[149]](_0xa1cdxb5);
        _0xa1cdx41 = _0xa1cdxb5[_0x41ff[151]](_0x41ff[150]);
        _0xa1cdx8d = new Pacman.Audio({
            "soundDisabled": _0xa1cdx9e
        });
        _0xa1cdx1c = new Pacman.Map(_0xa1cdx6a);
        _0xa1cdx98 = new Pacman.User({
            "completedLevel": _0xa1cdxb0,
            "eatenPill": _0xa1cdxaf
        }, _0xa1cdx1c);
        for (_0xa1cdx12 = 0, _0xa1cdxaa = _0xa1cdx8f[_0x41ff[6]]; _0xa1cdx12 < _0xa1cdxaa; _0xa1cdx12 += 1) {
            _0xa1cdxa6 = new Pacman.Ghost({
                "getTick": _0xa1cdx9a
            }, _0xa1cdx1c, _0xa1cdx8f[_0xa1cdx12]);
            _0xa1cdx8e[_0x41ff[90]](_0xa1cdxa6)
        };
        _0xa1cdx1c[_0x41ff[107]](_0xa1cdx41);
        _0xa1cdx9d(_0x41ff[152]);
        var _0xa1cdxb6 = Modernizr[_0x41ff[74]][_0x41ff[153]] ? _0x41ff[153] : _0x41ff[154];
        var _0xa1cdxb7 = [
            [_0x41ff[52], _0xa1cdxb4 + _0x41ff[155] + _0xa1cdxb6],
            [_0x41ff[138], _0xa1cdxb4 + _0x41ff[156] + _0xa1cdxb6],
            [_0x41ff[134], _0xa1cdxb4 + _0x41ff[157] + _0xa1cdxb6],
            [_0x41ff[143], _0xa1cdxb4 + _0x41ff[158] + _0xa1cdxb6],
            [_0x41ff[159], _0xa1cdxb4 + _0x41ff[160] + _0xa1cdxb6],
            [_0x41ff[161], _0xa1cdxb4 + _0x41ff[160] + _0xa1cdxb6]
        ];
        _0xa1cdx7e(_0xa1cdxb7, function() {
            _0xa1cdxb9()
        })
    }

    function _0xa1cdx7e(_0xa1cdxb8, _0xa1cdx84) {
        if (_0xa1cdxb8[_0x41ff[6]] === 0) {
            _0xa1cdx84()
        } else {
            var _0xa1cdx35 = _0xa1cdxb8[_0x41ff[162]]();
            _0xa1cdx8d[_0x41ff[163]](_0xa1cdx35[0], _0xa1cdx35[1], function() {
                _0xa1cdx7e(_0xa1cdxb8, _0xa1cdx84)
            })
        }
    }

    function _0xa1cdxb9() {
        _0xa1cdx9d(_0x41ff[164]);
        document[_0x41ff[77]](_0x41ff[165], _0xa1cdx5b, true);
        document[_0x41ff[77]](_0x41ff[166], _0xa1cdxb1, true);
        _0xa1cdx97 = window[_0x41ff[167]](_0xa1cdxae, 1000 / Pacman[_0x41ff[0]])
    }
    return {
        "init": _0xa1cdxb2
    }
}());
var KEY = {
    "BACKSPACE": 8,
    "TAB": 9,
    "NUM_PAD_CLEAR": 12,
    "ENTER": 13,
    "SHIFT": 16,
    "CTRL": 17,
    "ALT": 18,
    "PAUSE": 19,
    "CAPS_LOCK": 20,
    "ESCAPE": 27,
    "SPACEBAR": 32,
    "PAGE_UP": 33,
    "PAGE_DOWN": 34,
    "END": 35,
    "HOME": 36,
    "ARROW_LEFT": 37,
    "ARROW_UP": 38,
    "ARROW_RIGHT": 39,
    "ARROW_DOWN": 40,
    "PRINT_SCREEN": 44,
    "INSERT": 45,
    "DELETE": 46,
    "SEMICOLON": 59,
    "WINDOWS_LEFT": 91,
    "WINDOWS_RIGHT": 92,
    "SELECT": 93,
    "NUM_PAD_ASTERISK": 106,
    "NUM_PAD_PLUS_SIGN": 107,
    "NUM_PAD_HYPHEN-MINUS": 109,
    "NUM_PAD_FULL_STOP": 110,
    "NUM_PAD_SOLIDUS": 111,
    "NUM_LOCK": 144,
    "SCROLL_LOCK": 145,
    "SEMICOLON": 186,
    "EQUALS_SIGN": 187,
    "COMMA": 188,
    "HYPHEN-MINUS": 189,
    "FULL_STOP": 190,
    "SOLIDUS": 191,
    "GRAVE_ACCENT": 192,
    "LEFT_SQUARE_BRACKET": 219,
    "REVERSE_SOLIDUS": 220,
    "RIGHT_SQUARE_BRACKET": 221,
    "APOSTROPHE": 222
};
(function() {
    for (var _0xa1cdx12 = 48; _0xa1cdx12 <= 57; _0xa1cdx12++) {
        KEY[_0x41ff[2] + (_0xa1cdx12 - 48)] = _0xa1cdx12
    };
    for (_0xa1cdx12 = 65; _0xa1cdx12 <= 90; _0xa1cdx12++) {
        KEY[_0x41ff[2] + String[_0x41ff[9]](_0xa1cdx12)] = _0xa1cdx12
    };
    for (_0xa1cdx12 = 96; _0xa1cdx12 <= 105; _0xa1cdx12++) {
        KEY[_0x41ff[168] + (_0xa1cdx12 - 96)] = _0xa1cdx12
    };
    for (_0xa1cdx12 = 112; _0xa1cdx12 <= 123; _0xa1cdx12++) {
        KEY[_0x41ff[169] + (_0xa1cdx12 - 112 + 1)] = _0xa1cdx12
    }
})();
Pacman[_0x41ff[56]] = 0;
Pacman[_0x41ff[45]] = 1;
Pacman[_0x41ff[57]] = 2;
Pacman[_0x41ff[72]] = 3;
Pacman[_0x41ff[46]] = 4;
Pacman[_0x41ff[69]] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 4, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 4, 0],
    [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [2, 2, 2, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 2, 2, 2],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 3, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [2, 2, 2, 2, 1, 1, 1, 0, 3, 3, 3, 0, 1, 1, 1, 2, 2, 2, 2],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [2, 2, 2, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 2, 2, 2],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 4, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 4, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
Pacman[_0x41ff[62]] = [
    [{
        "move": [0, 9.5]
    }, {
        "line": [3, 9.5]
    }, {
        "curve": [3.5, 9.5, 3.5, 9]
    }, {
        "line": [3.5, 8]
    }, {
        "curve": [3.5, 7.5, 3, 7.5]
    }, {
        "line": [1, 7.5]
    }, {
        "curve": [0.5, 7.5, 0.5, 7]
    }, {
        "line": [0.5, 1]
    }, {
        "curve": [0.5, 0.5, 1, 0.5]
    }, {
        "line": [9, 0.5]
    }, {
        "curve": [9.5, 0.5, 9.5, 1]
    }, {
        "line": [9.5, 3.5]
    }],
    [{
        "move": [9.5, 1]
    }, {
        "curve": [9.5, 0.5, 10, 0.5]
    }, {
        "line": [18, 0.5]
    }, {
        "curve": [18.5, 0.5, 18.5, 1]
    }, {
        "line": [18.5, 7]
    }, {
        "curve": [18.5, 7.5, 18, 7.5]
    }, {
        "line": [16, 7.5]
    }, {
        "curve": [15.5, 7.5, 15.5, 8]
    }, {
        "line": [15.5, 9]
    }, {
        "curve": [15.5, 9.5, 16, 9.5]
    }, {
        "line": [19, 9.5]
    }],
    [{
        "move": [2.5, 5.5]
    }, {
        "line": [3.5, 5.5]
    }],
    [{
        "move": [3, 2.5]
    }, {
        "curve": [3.5, 2.5, 3.5, 3]
    }, {
        "curve": [3.5, 3.5, 3, 3.5]
    }, {
        "curve": [2.5, 3.5, 2.5, 3]
    }, {
        "curve": [2.5, 2.5, 3, 2.5]
    }],
    [{
        "move": [15.5, 5.5]
    }, {
        "line": [16.5, 5.5]
    }],
    [{
        "move": [16, 2.5]
    }, {
        "curve": [16.5, 2.5, 16.5, 3]
    }, {
        "curve": [16.5, 3.5, 16, 3.5]
    }, {
        "curve": [15.5, 3.5, 15.5, 3]
    }, {
        "curve": [15.5, 2.5, 16, 2.5]
    }],
    [{
        "move": [6, 2.5]
    }, {
        "line": [7, 2.5]
    }, {
        "curve": [7.5, 2.5, 7.5, 3]
    }, {
        "curve": [7.5, 3.5, 7, 3.5]
    }, {
        "line": [6, 3.5]
    }, {
        "curve": [5.5, 3.5, 5.5, 3]
    }, {
        "curve": [5.5, 2.5, 6, 2.5]
    }],
    [{
        "move": [12, 2.5]
    }, {
        "line": [13, 2.5]
    }, {
        "curve": [13.5, 2.5, 13.5, 3]
    }, {
        "curve": [13.5, 3.5, 13, 3.5]
    }, {
        "line": [12, 3.5]
    }, {
        "curve": [11.5, 3.5, 11.5, 3]
    }, {
        "curve": [11.5, 2.5, 12, 2.5]
    }],
    [{
        "move": [7.5, 5.5]
    }, {
        "line": [9, 5.5]
    }, {
        "curve": [9.5, 5.5, 9.5, 6]
    }, {
        "line": [9.5, 7.5]
    }],
    [{
        "move": [9.5, 6]
    }, {
        "curve": [9.5, 5.5, 10.5, 5.5]
    }, {
        "line": [11.5, 5.5]
    }],
    [{
        "move": [5.5, 5.5]
    }, {
        "line": [5.5, 7]
    }, {
        "curve": [5.5, 7.5, 6, 7.5]
    }, {
        "line": [7.5, 7.5]
    }],
    [{
        "move": [6, 7.5]
    }, {
        "curve": [5.5, 7.5, 5.5, 8]
    }, {
        "line": [5.5, 9.5]
    }],
    [{
        "move": [13.5, 5.5]
    }, {
        "line": [13.5, 7]
    }, {
        "curve": [13.5, 7.5, 13, 7.5]
    }, {
        "line": [11.5, 7.5]
    }],
    [{
        "move": [13, 7.5]
    }, {
        "curve": [13.5, 7.5, 13.5, 8]
    }, {
        "line": [13.5, 9.5]
    }],
    [{
        "move": [0, 11.5]
    }, {
        "line": [3, 11.5]
    }, {
        "curve": [3.5, 11.5, 3.5, 12]
    }, {
        "line": [3.5, 13]
    }, {
        "curve": [3.5, 13.5, 3, 13.5]
    }, {
        "line": [1, 13.5]
    }, {
        "curve": [0.5, 13.5, 0.5, 14]
    }, {
        "line": [0.5, 17]
    }, {
        "curve": [0.5, 17.5, 1, 17.5]
    }, {
        "line": [1.5, 17.5]
    }],
    [{
        "move": [1, 17.5]
    }, {
        "curve": [0.5, 17.5, 0.5, 18]
    }, {
        "line": [0.5, 21]
    }, {
        "curve": [0.5, 21.5, 1, 21.5]
    }, {
        "line": [18, 21.5]
    }, {
        "curve": [18.5, 21.5, 18.5, 21]
    }, {
        "line": [18.5, 18]
    }, {
        "curve": [18.5, 17.5, 18, 17.5]
    }, {
        "line": [17.5, 17.5]
    }],
    [{
        "move": [18, 17.5]
    }, {
        "curve": [18.5, 17.5, 18.5, 17]
    }, {
        "line": [18.5, 14]
    }, {
        "curve": [18.5, 13.5, 18, 13.5]
    }, {
        "line": [16, 13.5]
    }, {
        "curve": [15.5, 13.5, 15.5, 13]
    }, {
        "line": [15.5, 12]
    }, {
        "curve": [15.5, 11.5, 16, 11.5]
    }, {
        "line": [19, 11.5]
    }],
    [{
        "move": [5.5, 11.5]
    }, {
        "line": [5.5, 13.5]
    }],
    [{
        "move": [13.5, 11.5]
    }, {
        "line": [13.5, 13.5]
    }],
    [{
        "move": [2.5, 15.5]
    }, {
        "line": [3, 15.5]
    }, {
        "curve": [3.5, 15.5, 3.5, 16]
    }, {
        "line": [3.5, 17.5]
    }],
    [{
        "move": [16.5, 15.5]
    }, {
        "line": [16, 15.5]
    }, {
        "curve": [15.5, 15.5, 15.5, 16]
    }, {
        "line": [15.5, 17.5]
    }],
    [{
        "move": [5.5, 15.5]
    }, {
        "line": [7.5, 15.5]
    }],
    [{
        "move": [11.5, 15.5]
    }, {
        "line": [13.5, 15.5]
    }],
    [{
        "move": [2.5, 19.5]
    }, {
        "line": [5, 19.5]
    }, {
        "curve": [5.5, 19.5, 5.5, 19]
    }, {
        "line": [5.5, 17.5]
    }],
    [{
        "move": [5.5, 19]
    }, {
        "curve": [5.5, 19.5, 6, 19.5]
    }, {
        "line": [7.5, 19.5]
    }],
    [{
        "move": [11.5, 19.5]
    }, {
        "line": [13, 19.5]
    }, {
        "curve": [13.5, 19.5, 13.5, 19]
    }, {
        "line": [13.5, 17.5]
    }],
    [{
        "move": [13.5, 19]
    }, {
        "curve": [13.5, 19.5, 14, 19.5]
    }, {
        "line": [16.5, 19.5]
    }],
    [{
        "move": [7.5, 13.5]
    }, {
        "line": [9, 13.5]
    }, {
        "curve": [9.5, 13.5, 9.5, 14]
    }, {
        "line": [9.5, 15.5]
    }],
    [{
        "move": [9.5, 14]
    }, {
        "curve": [9.5, 13.5, 10, 13.5]
    }, {
        "line": [11.5, 13.5]
    }],
    [{
        "move": [7.5, 17.5]
    }, {
        "line": [9, 17.5]
    }, {
        "curve": [9.5, 17.5, 9.5, 18]
    }, {
        "line": [9.5, 19.5]
    }],
    [{
        "move": [9.5, 18]
    }, {
        "curve": [9.5, 17.5, 10, 17.5]
    }, {
        "line": [11.5, 17.5]
    }],
    [{
        "move": [8.5, 9.5]
    }, {
        "line": [8, 9.5]
    }, {
        "curve": [7.5, 9.5, 7.5, 10]
    }, {
        "line": [7.5, 11]
    }, {
        "curve": [7.5, 11.5, 8, 11.5]
    }, {
        "line": [11, 11.5]
    }, {
        "curve": [11.5, 11.5, 11.5, 11]
    }, {
        "line": [11.5, 10]
    }, {
        "curve": [11.5, 9.5, 11, 9.5]
    }, {
        "line": [10.5, 9.5]
    }]
];
Object[_0x41ff[170]][_0x41ff[68]] = function() {
    var _0xa1cdx12, _0xa1cdxbb = (this instanceof Array) ? [] : {};
    for (_0xa1cdx12 in this) {
        if (_0xa1cdx12 === _0x41ff[68]) {
            continue
        };
        if (this[_0xa1cdx12] && typeof this[_0xa1cdx12] === _0x41ff[171]) {
            _0xa1cdxbb[_0xa1cdx12] = this[_0xa1cdx12][_0x41ff[68]]()
        } else {
            _0xa1cdxbb[_0xa1cdx12] = this[_0xa1cdx12]
        }
    };
    return _0xa1cdxbb
}