/***********************************************************************************
* Ja-x's Arcade Racer
*
* Built on the Pseudo-3D Racing game prototype by Srdjan Susnic (MIT licensed):
* https://github.com/ssusnic/Pseudo-3d-Racer
*
* @author		Srdjan Susnic (original engine)
* @copyright	2020 Ask For Game Task
* @website		http://www.askforgametask.com
***********************************************************************************/

// ---------------------------------------------------------------------------------
// Global Constants
// ---------------------------------------------------------------------------------

// screen size
const SCREEN_W = CONFIG.screen.width;
const SCREEN_H = CONFIG.screen.height;

// coordinates of the screen center
const SCREEN_CX = SCREEN_W/2;
const SCREEN_CY = SCREEN_H/2;

// game states
const STATE_TITLE    = 1;
const STATE_PLAY     = 2;
const STATE_GAMEOVER = 3;

// used whenever the car has to drive without the player
const NO_CONTROLS = {left: false, right: false, accel: false, brake: false};

// ---------------------------------------------------------------------------------
// Main Scene
// ---------------------------------------------------------------------------------

class MainScene extends Phaser.Scene
{
	constructor(){
		super({key: 'SceneMain'});
	}

	/**
	* Loads all assets.
	*/
	preload(){
		this.load.image('imgBack',   'assets/img_back.png');
		this.load.image('imgSky',    'assets/img_sky.png');
		this.load.image('imgHills',  'assets/img_hills.png');
		this.load.image('imgCity',   'assets/img_city.png');
		this.load.image('imgPlayer', 'assets/img_player.png');

		// the sprite sheets have no atlas file, the frames are described in sprites.js
		for (var key in SPRITE_SHEETS){
			var sheet = SPRITE_SHEETS[key];

			this.load.spritesheet(key, 'assets/' + sheet.file, {
				frameWidth:  sheet.frameWidth,
				frameHeight: sheet.frameHeight,
				spacing:     sheet.spacing
			});
		}
	}

	/**
	* Creates all objects.
	*/
	create(){
		// parallax background, created first so it ends up behind the road
		this.background = new Background(this);

		// source images that are "manually" drawn on a rendering texture
		// (that's why they must be invisible after creation)
		this.sprites = {};
		this.sprites.PLAYER = this.add.image(0, 0, 'imgPlayer').setVisible(false);

		for (var name in SPRITES){
			var source = SPRITES[name];
			if (!source || !source.key) continue;		// skip the grouping arrays

			this.sprites[name] = this.add.image(0, 0, source.key, source.frame).setVisible(false);
		}

		// instances
		this.circuit  = new Circuit(this);
		this.player   = new Player(this);
		this.camera   = new Camera(this);
		this.traffic  = new Traffic(this);
		this.controls = new Controls(this);
		this.hud      = new Hud(this);

		// state of the current run
		this.session = {
			state:    STATE_TITLE,
			score:    0,
			timeLeft: CONFIG.scoring.startTime,
			laps:     0,
			paused:   false
		};

		// build the world
		this.camera.init();
		this.circuit.create();
		this.player.init();

		this.showTitle();

		// listeners
		this.input.keyboard.on('keydown-SPACE', this.onConfirm, this);
		this.input.keyboard.on('keydown-ENTER', this.onConfirm, this);
		this.input.keyboard.on('keydown-P', this.togglePause, this);
		this.input.on('pointerdown', this.onConfirm, this);

		// stop the page from scrolling when the arrow keys or space are used
		this.input.keyboard.addCapture('SPACE,UP,DOWN,LEFT,RIGHT');
	}

	// =================================================================================
	// Game states
	// =================================================================================

	showTitle(){
		this.session.state  = STATE_TITLE;
		this.session.paused = false;

		this.player.restart();
		this.traffic.create();
		this.background.restart();

		this.hud.showGameHud(false);
		this.hud.showScreen(
			'RACER',
			"Ja-x's Arcade",
			['Arrow keys / WASD to drive'],
			Controls.isTouchDevice() ? 'Tap to start' : 'Press SPACE to start'
		);
	}

	startGame(){
		this.session.state    = STATE_PLAY;
		this.session.score    = 0;
		this.session.timeLeft = CONFIG.scoring.startTime;
		this.session.laps     = 0;
		this.session.paused   = false;

		this.player.restart();
		this.traffic.create();
		this.background.restart();
		this.controls.reset();

		this.hud.hideOverlay();
		this.hud.showGameHud(true);
		this.hud.update(this.session);
	}

	gameOver(){
		this.session.state = STATE_GAMEOVER;

		this.hud.showGameHud(false);
		this.hud.showScreen(
			'TIME UP',
			'',
			[
				'Score   ' + Math.floor(this.session.score),
				'Distance   ' + Math.floor(this.player.getDistanceMeters()) + ' m',
				'Laps   ' + this.session.laps
			],
			Controls.isTouchDevice() ? 'Tap to play again' : 'Press SPACE to play again'
		);
	}

	togglePause(){
		if (this.session.state !== STATE_PLAY) return;

		this.session.paused = !this.session.paused;

		if (this.session.paused){
			this.controls.reset();
			this.hud.showGameHud(false);
			this.hud.showScreen('PAUSED', '', [], 'Press P to resume');
		}
		else {
			this.hud.hideOverlay();
			this.hud.showGameHud(true);
		}
	}

	/**
	* SPACE, ENTER or a tap: start a new run from the title or the game over screen.
	*/
	onConfirm(){
		if (this.session.state === STATE_TITLE || this.session.state === STATE_GAMEOVER){
			this.startGame();
		}
	}

	// =================================================================================
	// Main Game Loop
	// =================================================================================

	update(time, delta){
		// duration of the time period, capped so that a hiccup can't teleport the car
		var dt = Math.min(1/30, delta/1000);

		this.controls.update();

		switch(this.session.state){
			case STATE_TITLE:
				this.updateTitle(dt);
				break;

			case STATE_PLAY:
				if (!this.session.paused) this.updatePlay(dt);
				break;

			case STATE_GAMEOVER:
				this.updateGameOver(dt);
				break;
		}

		this.camera.update();
		this.circuit.render3D();
	}

	/**
	* Attract mode: the car cruises along on its own so the title screen shows the track.
	*/
	updateTitle(dt){
		this.player.update(dt, NO_CONTROLS);

		// hold a steady cruising speed in the middle of the road
		this.player.speed = this.player.maxSpeed * 0.35;
		this.player.x += (0 - this.player.x) * dt * 2;

		this.traffic.update(dt);
		this.background.update(dt);
	}

	updatePlay(dt){
		var player  = this.player;
		var session = this.session;

		player.update(dt, this.controls);

		var overtaken = this.traffic.update(dt);
		this.background.update(dt);

		// ---- score: driving fast pays off, so does getting past the traffic ----
		var speedPercent = player.speed / player.maxSpeed;

		session.score += CONFIG.scoring.pointsPerSecond * speedPercent * speedPercent * dt;
		session.score += overtaken * CONFIG.scoring.overtakeBonus;

		// ---- the clock ----
		session.timeLeft -= dt;

		if (player.lapJustCompleted){
			session.laps++;
			session.timeLeft += CONFIG.scoring.lapBonusTime;
			this.hud.flash('LAP ' + player.lap + '    + ' + CONFIG.scoring.lapBonusTime + 's');
		}

		if (player.justCrashed){
			this.cameras.main.shake(180, 0.006);
		}

		if (session.timeLeft <= 0){
			session.timeLeft = 0;
			this.hud.update(session);
			this.gameOver();
			return;
		}

		this.hud.update(session);
	}

	/**
	* After the clock runs out the car simply rolls to a stop behind the overlay.
	*/
	updateGameOver(dt){
		this.player.update(dt, NO_CONTROLS);
		this.traffic.update(dt);
		this.background.update(dt);
	}
}

// ---------------------------------------------------------------------------------
// Initializing Phaser Game
// ---------------------------------------------------------------------------------

// game configuration
var config = {
	type: Phaser.AUTO,
	parent: 'game',
	width: SCREEN_W,
	height: SCREEN_H,

	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},

	scene: [MainScene]
};

// game instance
var game = new Phaser.Game(config);
