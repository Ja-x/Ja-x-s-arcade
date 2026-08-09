/***********************************************************************************
* Ja-x's Arcade Racer - central configuration
*
* Every value that tunes how the game plays lives here. The engine files read from
* this object only, so the game can be re-balanced without touching game logic.
*
* Based on the Pseudo-3D Racing game prototype by Srdjan Susnic (MIT).
***********************************************************************************/

const CONFIG = {

	// ---------------------------------------------------------------------------------
	// Screen
	// ---------------------------------------------------------------------------------
	screen: {
		width:  1920,
		height: 1080
	},

	// ---------------------------------------------------------------------------------
	// Road geometry
	// ---------------------------------------------------------------------------------
	road: {
		segmentLength:   100,	// world units of a single road segment
		visibleSegments: 260,	// how many segments are drawn ahead of the camera
		rumbleSegments:  5,		// segments per rumble strip block
		lanes:           3,
		width:           1000	// half width of the road, in world units
	},

	// ---------------------------------------------------------------------------------
	// Camera
	// ---------------------------------------------------------------------------------
	camera: {
		height:       1000,		// above the road surface
		distToPlayer: 500		// how far the camera trails the player
	},

	// ---------------------------------------------------------------------------------
	// Player physics
	//
	// Acceleration values are fractions of maxSpeed gained (or lost) per second, so the
	// feel stays the same even if maxSpeed changes.
	// ---------------------------------------------------------------------------------
	player: {
		topSpeedKmh:   300,		// speedometer reading at maxSpeed
		accel:         0.22,	// throttle
		decel:         0.16,	// engine braking while coasting
		braking:       0.65,	// brake pedal
		offRoadDecel:  0.60,	// extra drag on the grass
		offRoadLimit:  0.36,	// speed the grass slows you down to (fraction of maxSpeed)
		turnSpeed:     2.4,		// lateral units per second at full speed
		centrifugal:   0.32,	// how strongly curves push the car outwards
		maxOffRoad:    1.8,		// how far off the road the car may wander (1.0 = road edge)
		width:         0.50,	// sprite + collision width, in road-half-width units
		crashCooldown: 0.6		// seconds of collision immunity after a crash
	},

	// ---------------------------------------------------------------------------------
	// Traffic
	// ---------------------------------------------------------------------------------
	traffic: {
		carCount:   38,
		minSpeed:   0.28,		// fraction of the player's maxSpeed
		maxSpeed:   0.62,
		crashSpeed: 0.30,		// speed kept right after hitting a car
		crashPush:  0.18,		// sideways shove on impact
		lookahead:  20			// segments a traffic car looks ahead when avoiding
	},

	// ---------------------------------------------------------------------------------
	// Roadside scenery (offsets are in road-half-width units, 1.0 = road edge)
	// ---------------------------------------------------------------------------------
	scenery: {
		treeGapMin:   5,
		treeGapMax:   16,
		signGapMin:   35,
		signGapMax:   110,
		minOffset:    2.0,		// kept outside player.maxOffRoad on purpose
		maxOffset:    5.5
	},

	// ---------------------------------------------------------------------------------
	// Scoring and session length
	// ---------------------------------------------------------------------------------
	scoring: {
		pointsPerSecond: 320,	// awarded at full speed, scaled down at lower speeds
		overtakeBonus:   120,
		startTime:       80,	// seconds on the clock at the start
		lapBonusTime:    40		// seconds added for every completed lap
	},

	// ---------------------------------------------------------------------------------
	// Track building blocks
	// ---------------------------------------------------------------------------------
	track: {
		LENGTH: {NONE: 0, SHORT:  25, MEDIUM:  50, LONG: 100},
		HILL:   {NONE: 0, LOW:    20, MEDIUM:  40, HIGH:  60},
		CURVE:  {NONE: 0, EASY:    2, MEDIUM:   4, HARD:   6}
	},

	// ---------------------------------------------------------------------------------
	// Parallax background scroll speeds
	// ---------------------------------------------------------------------------------
	// The layers are drawn by artwork.js, scaled down to the given screen height and
	// tiled sideways. The nearer the layer, the faster it scrolls.
	//
	// The heights also decide how much of each layer stays uncovered: the town is kept
	// low so that all three mountain ranges behind it remain visible.
	background: {
		horizon: 552,			// screen Y where the background layers rest

		layers: [
			{key: 'imgSky',   height: 430, speed: 0.7},
			{key: 'imgHills', height: 250, speed: 2.6},
			{key: 'imgCity',  height: 140, speed: 5.0}
		]
	}
};
