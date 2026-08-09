/***********************************************************************************
* Traffic - the other cars on the road.
*
* Every car keeps its own Z position and lives in the segment it currently occupies,
* which is what makes both the rendering and the collision checks cheap.
***********************************************************************************/

class Traffic
{
	constructor(scene){
		// reference to the main scene
		this.scene = scene;

		// all traffic cars
		this.cars = [];
	}

	/**
	* Fills the track with traffic. Must be called after the circuit has been created.
	*/
	create(){
		var circuit = this.scene.circuit;
		var player  = this.scene.player;
		var cfg     = CONFIG.traffic;

		this.cars = [];

		// the segments own the cars, so start from a clean slate
		for (var i=0; i<circuit.segments.length; i++){
			circuit.segments[i].cars = [];
		}

		for (var n=0; n<cfg.carCount; n++){
			var source  = Util.randomChoice(SPRITES.TRAFFIC);
			var isTruck = SPRITES.TRUCKS.indexOf(source) >= 0;

			// trucks are the slow ones
			var topFactor = isTruck ? (cfg.minSpeed + cfg.maxSpeed)/2 : cfg.maxSpeed;
			var speed = player.maxSpeed * Util.interpolate(cfg.minSpeed, topFactor, Math.random());

			// keep the starting straight clear so the player isn't hit at the lights
			var segmentIndex = Util.randomInt(30, circuit.total_segments - 1);

			// place the car in the middle of one of the lanes
			var lane   = Util.randomInt(0, circuit.roadLanes - 1);
			var offset = -1 + (2*lane + 1) / circuit.roadLanes;

			var car = {
				sprite: source,
				offset: offset,
				z:      segmentIndex * circuit.segmentLength,
				speed:  speed,
				wasAhead: true
			};

			car.wasAhead = this.isAhead(car);

			this.cars.push(car);
			circuit.segments[segmentIndex].cars.push(car);
		}
	}

	/**
	* Moves every car forward and lets it steer around slower traffic.
	* Returns how many cars the player has overtaken during this frame.
	*/
	update(dt){
		var circuit = this.scene.circuit;
		var player  = this.scene.player;

		var playerSegment = circuit.getSegment(player.z);
		var overtakes = 0;

		for (var n=0; n<this.cars.length; n++){
			var car = this.cars[n];
			var oldSegment = circuit.getSegment(car.z);

			// steer around whatever is in the way
			car.offset += this.getAvoidanceSteering(car, oldSegment, playerSegment);
			car.offset  = Util.limit(car.offset, -0.95, 0.95);

			// move forward
			car.z = Util.wrap(car.z + car.speed * dt, circuit.roadLength);

			// hand the car over to its new segment
			var newSegment = circuit.getSegment(car.z);

			if (oldSegment !== newSegment){
				var index = oldSegment.cars.indexOf(car);
				if (index >= 0) oldSegment.cars.splice(index, 1);
				newSegment.cars.push(car);
			}

			// count the overtakings
			var ahead = this.isAhead(car);
			if (car.wasAhead && !ahead) overtakes++;
			car.wasAhead = ahead;
		}

		return overtakes;
	}

	/**
	* True while the car is still in front of the player.
	*/
	isAhead(car){
		var circuit = this.scene.circuit;
		var player  = this.scene.player;

		return Util.wrap(car.z - player.z, circuit.roadLength) < circuit.roadLength/2;
	}

	/**
	* Looks a few segments ahead and returns the sideways correction the car should make
	* to get around the player or a slower car.
	*/
	getAvoidanceSteering(car, carSegment, playerSegment){
		var circuit = this.scene.circuit;
		var player  = this.scene.player;

		var lookahead = CONFIG.traffic.lookahead;
		var carW = car.sprite.w;
		var dir;

		for (var i=1; i<lookahead; i++){
			var segment = circuit.segments[(carSegment.index + i) % circuit.total_segments];

			// get out of the way of a slower player
			if (segment === playerSegment && car.speed > player.speed &&
				Util.overlap(player.x, player.w, car.offset, carW, 1.2)){

				if (player.x > 0.5)       dir = -1;
				else if (player.x < -0.5) dir =  1;
				else                      dir = (car.offset > player.x) ? 1 : -1;

				return dir * (1/i) * (car.speed - player.speed) / player.maxSpeed;
			}

			// get out of the way of slower traffic
			for (var j=0; j<segment.cars.length; j++){
				var other = segment.cars[j];

				if (car.speed > other.speed &&
					Util.overlap(car.offset, carW, other.offset, other.sprite.w, 1.2)){

					if (other.offset > 0.5)       dir = -1;
					else if (other.offset < -0.5) dir =  1;
					else                          dir = (car.offset > other.offset) ? 1 : -1;

					return dir * (1/i) * (car.speed - other.speed) / player.maxSpeed;
				}
			}
		}

		// drifted too close to the edge, steer back towards the middle
		if (car.offset < -0.9) return  0.1;
		if (car.offset >  0.9) return -0.1;

		return 0;
	}
}
