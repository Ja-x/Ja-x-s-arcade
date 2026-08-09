/***********************************************************************************
* Player - the car driven by the user.
*
* X is normalized: 0 is the middle of the road, -1 and +1 are its edges. Anything
* beyond that is grass.
***********************************************************************************/

class Player
{
	constructor(scene){
		// reference to the main scene
		this.scene = scene;

		// reference to the player sprite
		this.sprite = scene.sprites.PLAYER;

		// player world coordinates
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.w = CONFIG.player.width;

		// player screen coordinates
		this.screen = {x:0, y:0, w:0, h:0};

		// max speed (to avoid moving for more than 1 road segment, assuming fps=60)
		this.maxSpeed = (scene.circuit.segmentLength) / (1/60);

		// driving control parameters
		this.speed = 0;							// current speed
		this.steer = 0;							// -1 left, 0 straight, +1 right
		this.offRoad = false;					// true while driving on the grass

		// progress
		this.distance = 0;						// total distance driven, never wraps
		this.lap = 1;
		this.lapJustCompleted = false;

		// collisions
		this.crashTimer = 0;					// counts down the post-crash immunity
		this.justCrashed = false;				// set for one frame on impact

		// appearance
		this.brakeLights   = true;				// lit whenever the throttle is closed
		this.hairTimer     = 0;					// runs the driver's hair animation
		this.hairFrame     = 0;
		this.appearanceKey = null;				// texture the sprite is currently showing
	}

	/**
	* Initializes player (must be called when initializing game or changing settings).
	*/
	init(){
		var camera  = this.scene.camera;
		var circuit = this.scene.circuit;

		// projected half width of the road at the position of the player, in pixels
		var scale = camera.distToPlane / camera.distToPlayer;
		var roadHalfWidthPx = scale * circuit.roadWidth * SCREEN_CX;

		// draw the player at the same scale as the traffic, so they match on screen
		this.screen.w = roadHalfWidthPx * CONFIG.player.width;
		this.screen.h = this.screen.w * (this.sprite.height / this.sprite.width);

		this.sprite.setOrigin(0.5, 1);
		this.sprite.setDisplaySize(this.screen.w, this.screen.h);

		// set the player screen position (the car sits just above the bottom edge)
		this.screen.x = SCREEN_CX;
		this.screen.y = SCREEN_H - 24;
	}

	/**
	* Restarts player.
	*/
	restart(){
		this.x = 0;
		this.y = 0;
		this.z = 0;

		this.speed = 0;
		this.steer = 0;
		this.offRoad = false;

		this.distance = 0;
		this.lap = 1;
		this.lapJustCompleted = false;

		this.crashTimer = 0;
		this.justCrashed = false;

		this.brakeLights = true;
		this.hairTimer   = 0;
		this.hairFrame   = 0;
	}

	/**
	* Points the sprite at the car picture that matches the current brake light and hair
	* state. Every combination was drawn once at boot, so this is only a texture swap.
	*/
	applyAppearance(){
		var key = Artwork.playerKey(this.brakeLights, this.hairFrame);

		if (key === this.appearanceKey) return;

		this.appearanceKey = key;

		// setTexture resets the frame, so the placement has to be applied again
		this.sprite.setTexture(key);
		this.sprite.setOrigin(0.5, 1);
		this.sprite.setDisplaySize(this.screen.w, this.screen.h);
	}

	/**
	* Updates player position.
	*/
	update(dt, controls){
		// references to the scene objects
		var circuit = this.scene.circuit;
		var cfg = CONFIG.player;

		this.lapJustCompleted = false;
		this.justCrashed = false;

		var playerSegment = circuit.getSegment(this.z);
		var speedPercent  = this.speed / this.maxSpeed;

		// ---------------------------------------------------------------------------------
		// Steering
		// ---------------------------------------------------------------------------------

		// the faster the car goes, the more ground a turn covers
		var dx = dt * cfg.turnSpeed * speedPercent;

		this.steer = 0;

		if (controls.left){
			this.x -= dx;
			this.steer = -1;
		}
		else if (controls.right){
			this.x += dx;
			this.steer = 1;
		}

		// a curve throws the car towards its outside edge
		this.x -= dx * speedPercent * playerSegment.curve * cfg.centrifugal;

		// ---------------------------------------------------------------------------------
		// Throttle and brakes
		// ---------------------------------------------------------------------------------

		if (controls.accel){
			this.speed += cfg.accel * this.maxSpeed * dt;
		}
		else if (controls.brake){
			this.speed -= cfg.braking * this.maxSpeed * dt;
		}
		else {
			// releasing the throttle slows the car down on its own
			this.speed -= cfg.decel * this.maxSpeed * dt;
		}

		// ---------------------------------------------------------------------------------
		// Leaving the road
		// ---------------------------------------------------------------------------------

		this.offRoad = Math.abs(this.x) > 1;

		if (this.offRoad && this.speed > cfg.offRoadLimit * this.maxSpeed){
			// the grass drags the car down, but never brings it to a full stop
			this.speed -= cfg.offRoadDecel * this.maxSpeed * dt;
		}

		this.x     = Util.limit(this.x, -cfg.maxOffRoad, cfg.maxOffRoad);
		this.speed = Util.limit(this.speed, 0, this.maxSpeed);

		// ---------------------------------------------------------------------------------
		// Moving in Z-direction
		// ---------------------------------------------------------------------------------

		var startZ = this.z;
		var moved  = this.speed * dt;

		this.z += moved;
		this.distance += moved;

		if (this.z >= circuit.roadLength){
			this.z -= circuit.roadLength;
			this.lap++;
			this.lapJustCompleted = true;
		}

		// follow the road surface so that the camera rides over the hills
		this.y = circuit.getRoadHeight(this.z);

		// ---------------------------------------------------------------------------------
		// Collisions with the traffic
		// ---------------------------------------------------------------------------------

		if (this.crashTimer > 0){
			this.crashTimer -= dt;
		}
		else if (moved > 0){
			this.checkTrafficCollision(startZ, moved);
		}

		// ---------------------------------------------------------------------------------
		// Appearance
		// ---------------------------------------------------------------------------------

		// the brake lights are out only while the throttle is held down
		this.brakeLights = !controls.accel;

		// the driver's hair only moves while the car is actually going somewhere, and it
		// flutters faster the quicker the car is travelling
		if (this.speed > this.maxSpeed*0.02){
			this.hairTimer += dt * (5 + 16 * (this.speed / this.maxSpeed));
			this.hairFrame  = Math.floor(this.hairTimer) % Artwork.hairFrames;
		}

		this.applyAppearance();
	}

	/**
	* Checks every segment the car has passed through during this frame, so that no car
	* can be skipped over when the frame rate drops.
	*/
	checkTrafficCollision(startZ, moved){
		var circuit = this.scene.circuit;

		var firstIndex = circuit.getSegment(startZ).index;
		var passed     = Math.floor(moved / circuit.segmentLength) + 1;

		for (var n=0; n<=passed; n++){
			var segment = circuit.segments[(firstIndex + n) % circuit.total_segments];

			for (var i=0; i<segment.cars.length; i++){
				var car = segment.cars[i];

				// you only run into cars that are slower than you
				if (this.speed <= car.speed) continue;
				if (!Util.overlap(this.x, this.w, car.offset, car.sprite.w, 0.85)) continue;

				// a hit costs most of the speed and shoves the car sideways
				this.speed = Math.max(car.speed * 0.55, this.speed * CONFIG.traffic.crashSpeed);
				this.x += (this.x < car.offset ? -1 : 1) * CONFIG.traffic.crashPush;
				this.x = Util.limit(this.x, -CONFIG.player.maxOffRoad, CONFIG.player.maxOffRoad);

				// the speed loss alone is enough to drop back behind the other car, so the
				// player is never teleported (that would confuse the lap counter)
				this.crashTimer  = CONFIG.player.crashCooldown;
				this.justCrashed = true;
				return;
			}
		}
	}

	/**
	* Speed shown on the speedometer.
	*/
	getSpeedKmh(){
		return Math.round((this.speed / this.maxSpeed) * CONFIG.player.topSpeedKmh);
	}

	/**
	* Distance driven, in metres. Derived from the top speed so that the two readings
	* on the HUD agree with each other.
	*/
	getDistanceMeters(){
		var metersPerUnit = (CONFIG.player.topSpeedKmh / 3.6) / this.maxSpeed;
		return this.distance * metersPerUnit;
	}
}
