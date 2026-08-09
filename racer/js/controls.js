/***********************************************************************************
* Controls - collects keyboard and touch input into one simple state object.
*
* The touch buttons are plain HTML elements laid over the canvas, so they stay
* readable no matter how the canvas is scaled, and they are only shown on devices
* that actually have a touch screen.
***********************************************************************************/

class Controls
{
	constructor(scene){
		// reference to the main scene
		this.scene = scene;

		// current control state, read by the player each frame
		this.left  = false;
		this.right = false;
		this.accel = false;
		this.brake = false;

		// state coming from the on-screen buttons
		this.touch = {left: false, right: false, accel: false, brake: false};

		// keyboard
		this.cursors = scene.input.keyboard.createCursorKeys();
		this.keys    = scene.input.keyboard.addKeys('W,A,S,D');

		this.bindTouchButtons();
	}

	/**
	* True on devices with a touch screen.
	*/
	static isTouchDevice(){
		return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
	}

	/**
	* Wires the on-screen buttons and reveals them on touch devices.
	*/
	bindTouchButtons(){
		var panel = document.getElementById('touch-controls');
		if (!panel) return;

		if (!Controls.isTouchDevice()) return;

		panel.classList.remove('hidden');

		var buttons = {
			'btn-left':  'left',
			'btn-right': 'right',
			'btn-accel': 'accel',
			'btn-brake': 'brake'
		};

		var touch = this.touch;

		Object.keys(buttons).forEach(function(id){
			var el = document.getElementById(id);
			if (!el) return;

			var action = buttons[id];

			var press = function(event){
				event.preventDefault();
				touch[action] = true;
			};

			var release = function(event){
				event.preventDefault();
				touch[action] = false;
			};

			el.addEventListener('pointerdown',   press);
			el.addEventListener('pointerup',     release);
			el.addEventListener('pointerleave',  release);
			el.addEventListener('pointercancel', release);

			// stop the browser from scrolling or zooming while driving
			el.addEventListener('touchstart', function(e){ e.preventDefault(); }, {passive: false});
			el.addEventListener('touchmove',  function(e){ e.preventDefault(); }, {passive: false});
		});
	}

	/**
	* Clears every held control (used when the game is paused or restarted).
	*/
	reset(){
		this.left = this.right = this.accel = this.brake = false;
		this.touch.left = this.touch.right = this.touch.accel = this.touch.brake = false;
	}

	/**
	* Merges keyboard and touch input.
	*/
	update(){
		var c = this.cursors;
		var k = this.keys;
		var t = this.touch;

		this.left  = c.left.isDown  || k.A.isDown || t.left;
		this.right = c.right.isDown || k.D.isDown || t.right;
		this.accel = c.up.isDown    || k.W.isDown || t.accel;
		this.brake = c.down.isDown  || k.S.isDown || t.brake;
	}
}
