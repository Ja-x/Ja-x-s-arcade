/***********************************************************************************
* Hud - speedometer, clock, score and the title / game over screens.
*
* Kept deliberately plain and pushed into the corners, so that it never covers the
* road or the traffic ahead.
***********************************************************************************/

const FONT_FAMILY = "'Arial Black', 'Arial Bold', Arial, sans-serif";

class Hud
{
	constructor(scene){
		// reference to the main scene
		this.scene = scene;

		this.buildGameHud();
		this.buildOverlay();
	}

	/**
	* Creates one piece of text.
	*/
	text(x, y, content, size, color, originX, originY){
		return this.scene.add.text(x, y, content, {
			fontFamily: FONT_FAMILY,
			fontSize: size + 'px',
			color: color,
			stroke: '#000000',
			strokeThickness: Math.max(2, Math.round(size/12))
		}).setOrigin(originX === undefined ? 0 : originX, originY === undefined ? 0 : originY);
	}

	/**
	* The readouts shown while driving.
	*/
	buildGameHud(){
		const LABEL = '#bfe2ff';
		const VALUE = '#ffffff';

		// clock, top left
		this.lblTime  = this.text(60, 40, 'TIME', 34, LABEL);
		this.txtTime  = this.text(60, 78, '0:00', 88, VALUE);

		// score, top right
		this.lblScore = this.text(SCREEN_W-60, 40, 'SCORE', 34, LABEL, 1, 0);
		this.txtScore = this.text(SCREEN_W-60, 78, '0', 88, VALUE, 1, 0);

		// on touch devices the on-screen buttons sit in the bottom corners, so the
		// bottom row of the HUD is lifted above them
		var bottom = SCREEN_H - (Controls.isTouchDevice() ? 190 : 0);

		// speedometer, bottom left
		this.lblSpeed = this.text(60, bottom-160, 'SPEED', 34, LABEL);
		this.txtSpeed = this.text(60, bottom-124, '0', 92, VALUE);
		this.txtUnit  = this.text(60, bottom-52, 'km/h', 34, LABEL);

		// lap and distance, bottom right
		this.txtLap   = this.text(SCREEN_W-60, bottom-160, 'LAP 1', 46, VALUE, 1, 0);
		this.txtDist  = this.text(SCREEN_W-60, bottom-100, '0 m', 40, LABEL, 1, 0);

		this.gameHud = [
			this.lblTime, this.txtTime, this.lblScore, this.txtScore,
			this.lblSpeed, this.txtSpeed, this.txtUnit, this.txtLap, this.txtDist
		];

		// short lived message in the middle of the screen
		this.txtFlash = this.text(SCREEN_CX, 300, '', 72, '#ffe680', 0.5, 0.5);
		this.txtFlash.setAlpha(0);

		this.showGameHud(false);
	}

	/**
	* The title and game over screens.
	*/
	buildOverlay(){
		this.overlayBg = this.scene.add.rectangle(0, 0, SCREEN_W, SCREEN_H, 0x000000, 0.62).setOrigin(0, 0);

		this.txtTitle    = this.text(SCREEN_CX, 220, '', 140, '#ffffff', 0.5, 0.5);
		this.txtSubtitle = this.text(SCREEN_CX, 340, '', 46, '#bfe2ff', 0.5, 0.5);

		this.txtLines = [
			this.text(SCREEN_CX, 460, '', 52, '#ffffff', 0.5, 0.5),
			this.text(SCREEN_CX, 530, '', 52, '#ffffff', 0.5, 0.5),
			this.text(SCREEN_CX, 600, '', 52, '#ffffff', 0.5, 0.5)
		];

		// kept above the car, which is parked in the middle of the bottom edge
		this.txtPrompt = this.text(SCREEN_CX, 720, '', 56, '#ffe680', 0.5, 0.5);

		this.overlay = [this.overlayBg, this.txtTitle, this.txtSubtitle, this.txtPrompt].concat(this.txtLines);

		// make the prompt blink so it reads as "do this now"
		this.scene.tweens.add({
			targets: this.txtPrompt,
			alpha: {from: 1, to: 0.25},
			duration: 650,
			yoyo: true,
			repeat: -1
		});

		this.hideOverlay();
	}

	setVisible(items, visible){
		for (var n=0; n<items.length; n++) items[n].setVisible(visible);
	}

	showGameHud(visible){
		this.setVisible(this.gameHud, visible);
	}

	hideOverlay(){
		this.setVisible(this.overlay, false);
	}

	/**
	* Shows a screen with a title, an optional subtitle, up to three lines of text and
	* a prompt at the bottom.
	*/
	showScreen(title, subtitle, lines, prompt){
		this.txtTitle.setText(title);
		this.txtSubtitle.setText(subtitle || '');

		for (var n=0; n<this.txtLines.length; n++){
			this.txtLines[n].setText(lines && lines[n] ? lines[n] : '');
		}

		this.txtPrompt.setText(prompt || '');

		this.setVisible(this.overlay, true);
	}

	/**
	* Pops a message in the middle of the screen and fades it out.
	*/
	flash(message){
		this.txtFlash.setText(message);
		this.txtFlash.setAlpha(1);
		this.txtFlash.setScale(1);

		this.scene.tweens.killTweensOf(this.txtFlash);
		this.scene.tweens.add({
			targets: this.txtFlash,
			alpha: 0,
			scale: 1.25,
			duration: 1400,
			ease: 'Quad.easeIn'
		});
	}

	/**
	* Refreshes the driving readouts.
	*/
	update(session){
		var player = this.scene.player;

		this.txtSpeed.setText(String(player.getSpeedKmh()));
		this.txtTime.setText(Util.formatTime(session.timeLeft));
		this.txtScore.setText(String(Math.floor(session.score)));
		this.txtLap.setText('LAP ' + player.lap);
		this.txtDist.setText(Math.floor(player.getDistanceMeters()) + ' m');

		// warn the player when the clock is running out
		this.txtTime.setColor(session.timeLeft <= 10 ? '#ff6666' : '#ffffff');
	}
}
