/***********************************************************************************
* Sprite catalogue.
*
* Every picture is drawn at boot by artwork.js, so each entry here is simply a
* texture key plus the size the object should have out in the world.
*
* "w" is the world width of the sprite in road-half-width units, so w = 1.0 is
* exactly half of the road. The height follows from the aspect ratio of the texture,
* which is why the values below are tuned to the canvas sizes in artwork.js.
***********************************************************************************/

const SPRITES = {
	TREE1:      {name: 'TREE1',      key: 'treePine',        w: 1.55},
	TREE2:      {name: 'TREE2',      key: 'treeOak',         w: 1.85},
	BILLBOARD1: {name: 'BILLBOARD1', key: 'billboardArcade', w: 1.70},
	BILLBOARD2: {name: 'BILLBOARD2', key: 'billboardRacer',  w: 1.70},
	SIGN1:      {name: 'SIGN1',      key: 'signCurve',       w: 0.55},
	SIGN2:      {name: 'SIGN2',      key: 'signWarn',        w: 0.55},

	CAR1:       {name: 'CAR1',       key: 'carSport',        w: 0.50},
	CAR2:       {name: 'CAR2',       key: 'carSedan',        w: 0.50},
	CAR3:       {name: 'CAR3',       key: 'carHatch',        w: 0.50},
	TRUCK1:     {name: 'TRUCK1',     key: 'truckBox',        w: 0.62},
	TRUCK2:     {name: 'TRUCK2',     key: 'truckContainer',  w: 0.62},
	TRUCK3:     {name: 'TRUCK3',     key: 'truckCurtain',    w: 0.62}
};

// sprites that can be scattered along the roadside
SPRITES.TREES      = [SPRITES.TREE1, SPRITES.TREE2];
SPRITES.SIGNS      = [SPRITES.BILLBOARD1, SPRITES.BILLBOARD2, SPRITES.SIGN1, SPRITES.SIGN2];

// vehicles used by the traffic. Trucks are slower, so they are listed separately.
SPRITES.CARS       = [SPRITES.CAR1, SPRITES.CAR2, SPRITES.CAR3];
SPRITES.TRUCKS     = [SPRITES.TRUCK1, SPRITES.TRUCK2, SPRITES.TRUCK3];
SPRITES.TRAFFIC    = SPRITES.CARS.concat(SPRITES.TRUCKS);
