function addKeyListeners() {
	keypress.register_combo({
		keys: "left",
		on_keydown: function() {
			if (MainHex && gameState !== 0) {
				MainHex.rotate(1);
			}
		}
	});

	keypress.register_combo({
		keys: "right",
		on_keydown: function() {
			if (MainHex && gameState !== 0){
				MainHex.rotate(-1);
			}
		}
	});
		keypress.register_combo({
		keys: "down",
		on_keydown: function() {
			if (MainHex && gameState !== 0) {
				startRush();
			}
		},
		on_keyup: function() {
			stopRush();
		}
	});
	
	keypress.register_combo({
		keys: "a",
		on_keydown: function() {
			if (MainHex && gameState !== 0) {
				MainHex.rotate(1);
			}
		}
	});

	keypress.register_combo({
		keys: "d",
		on_keydown: function() {
			if (MainHex && gameState !== 0){
				MainHex.rotate(-1);
			}
		}
	});
	
	keypress.register_combo({
		keys: "s",
		on_keydown: function() {
			if (MainHex && gameState !== 0) {
				startRush();
			}
		},
		on_keyup: function() {
			stopRush();
		}
	});
	keypress.register_combo({
		keys: "p",
		on_keydown: function(){pause();}
	});

	keypress.register_combo({
		keys: "space",
		on_keydown: function(){pause();}
	});

	keypress.register_combo({
		keys: "q",
		on_keydown: function() {
			if (devMode) toggleDevTools();
		}
	});

	keypress.register_combo({
		keys: "enter",
		on_keydown: function() {
			if (gameState==1 || importing == 1) {
				init(1);
			}
			if (gameState == 2) {
				init();
				$("#gameoverscreen").fadeOut();
			}
			if (gameState===0) {
				resumeGame();
			}
		}
	});

	$("#pauseBtn").on('touchstart mousedown', function() {
		if (gameState != 1 && gameState != -1) {
			return;
		}

		if ($('#helpScreen').is(":visible")) {
			$('#helpScreen').fadeOut(150, "linear");
		}
		pause();
		return false;
	});

	$("#colorBlindBtn").on('touchstart mousedown', function() {
	window.colors = ["#8e44ad", "#f1c40f", "#3498db", "#d35400"];

	window.hexColorsToTintedColors = {
		"#8e44ad": "rgb(229,152,102)",
		"#f1c40f": "rgb(246,223,133)",
		"#3498db": "rgb(151,201,235)",
		"#d35400": "rgb(210,180,222)"
	};

	window.rgbToHex = {
		"rgb(142,68,173)": "#8e44ad",
		"rgb(241,196,15)": "#f1c40f",
		"rgb(52,152,219)": "#3498db",
		"rgb(211,84,0)": "#d35400"
	};

	window.rgbColorsToTintedColors = {
		"rgb(142,68,173)": "rgb(229,152,102)",
		"rgb(241,196,15)": "rgb(246,223,133)",
		"rgb(52,152,219)": "rgb(151,201,235)",
		"rgb(46,204,113)": "rgb(210,180,222)"
	};
	});


	if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			$("#restart").on('touchstart', function() {
			init();
			canRestart = false;
			$("#gameoverscreen").fadeOut();
		});

	}
	else {
		$("#restart").on('mousedown', function() {
			init();
			canRestart = false;
			$("#gameoverscreen").fadeOut();
		});

	}
	if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			$("#restartBtn").on('touchstart', function() {
			init(1);
			canRestart = false;
			$("#gameoverscreen").fadeOut();
		});

	}
	else {
		$("#restartBtn").on('mousedown', function() {
			init(1);
			canRestart = false;
			$("#gameoverscreen").fadeOut();
		});


	}

}
function inside (point, vs) {
	// ray-casting algorithm based on
	// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
	
	var x = point[0], y = point[1];
	
	var inside = false;
	for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
		var xi = vs[i][0], yi = vs[i][1];
		var xj = vs[j][0], yj = vs[j][1];
		
		var intersect = ((yi > y) != (yj > y))
			&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		if (intersect) inside = !inside;
	}
	
	return inside;
};

// Speeds up falling blocks while held (down arrow, S, or holding the hexagon on touch).
function startRush() {
	if (settings.speedUpKeyHeld) return;
	settings.speedUpKeyHeld = true;
	window.rush *= 4;
}

function stopRush() {
	if (!settings.speedUpKeyHeld) return;
	settings.speedUpKeyHeld = false;
	window.rush /= 4;
}

function isOnHex(x, y) {
	var dx = x - trueCanvas.width / 2;
	var dy = y - trueCanvas.height / 2;
	return dx * dx + dy * dy <= settings.hexWidth * settings.hexWidth;
}

var rushTouchId = null;

function handleTouchRushStart(touch) {
	if (!MainHex || gameState !== 1 || rushTouchId !== null) return false;
	if (!isOnHex(touch.clientX, touch.clientY)) return false;
	rushTouchId = touch.identifier;
	startRush();
	return true;
}

function handleTouchRushEnd(e) {
	if (rushTouchId === null) return;
	for (var i = 0; i < e.changedTouches.length; i++) {
		if (e.changedTouches[i].identifier === rushTouchId) {
			rushTouchId = null;
			stopRush();
			return;
		}
	}
}

function resetRush() {
	rushTouchId = null;
	stopRush();
}

function handleClickTap(x,y) {
	if (x < 120 && y < 83 && $('.helpText').is(':visible')) {
		showHelp();
		return;
	}

	if (!MainHex || gameState === 0 || gameState==-1) {
		return;
	}

	if (x < window.innerWidth/2) {
		MainHex.rotate(1);
	}
	if (x > window.innerWidth/2) {
		MainHex.rotate(-1);
	}
}
