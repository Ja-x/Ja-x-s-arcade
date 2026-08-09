/***********************************************************************************
* Sprite catalogue.
*
* All artwork comes from the original Pseudo-3d-Racer assets by Srdjan Susnic.
* The sheets have no atlas file, so the frames are described here:
*
*   img_cars.png       754 x 250   3 frames of 250 x 250, 2 px spacing
*   img_trucks.png     906 x 430   3 frames of 300 x 430, 3 px spacing
*   img_trees.png     1482 x 900   2 frames of 740 x 900, 2 px spacing
*   img_billboards.png 1482 x 900  2 frames of 740 x 900, 2 px spacing
*   img_signs.png      402 x 390   2 frames of 200 x 390, 2 px spacing
*   img_player.png     250 x 150   single frame
*
* "w" is the world width of the sprite in road-half-width units, so w = 1.0 is
* exactly half of the road. The height follows from the frame aspect ratio.
***********************************************************************************/

const SPRITE_SHEETS = {
	cars:       {file: 'img_cars.png',       frameWidth: 250, frameHeight: 250, spacing: 2},
	trucks:     {file: 'img_trucks.png',     frameWidth: 300, frameHeight: 430, spacing: 3},
	trees:      {file: 'img_trees.png',      frameWidth: 740, frameHeight: 900, spacing: 2},
	billboards: {file: 'img_billboards.png', frameWidth: 740, frameHeight: 900, spacing: 2},
	signs:      {file: 'img_signs.png',      frameWidth: 200, frameHeight: 390, spacing: 2}
};

const SPRITES = {
	TREE1:      {name: 'TREE1',      key: 'trees',      frame: 0, w: 1.70},
	TREE2:      {name: 'TREE2',      key: 'trees',      frame: 1, w: 1.85},
	BILLBOARD1: {name: 'BILLBOARD1', key: 'billboards', frame: 0, w: 1.40},
	BILLBOARD2: {name: 'BILLBOARD2', key: 'billboards', frame: 1, w: 1.40},
	SIGN1:      {name: 'SIGN1',      key: 'signs',      frame: 0, w: 0.55},
	SIGN2:      {name: 'SIGN2',      key: 'signs',      frame: 1, w: 0.55},

	CAR1:       {name: 'CAR1',       key: 'cars',       frame: 0, w: 0.50},
	CAR2:       {name: 'CAR2',       key: 'cars',       frame: 1, w: 0.50},
	CAR3:       {name: 'CAR3',       key: 'cars',       frame: 2, w: 0.50},
	TRUCK1:     {name: 'TRUCK1',     key: 'trucks',     frame: 0, w: 0.62},
	TRUCK2:     {name: 'TRUCK2',     key: 'trucks',     frame: 1, w: 0.62},
	TRUCK3:     {name: 'TRUCK3',     key: 'trucks',     frame: 2, w: 0.62}
};

// sprites that can be scattered along the roadside
SPRITES.TREES      = [SPRITES.TREE1, SPRITES.TREE2];
SPRITES.SIGNS      = [SPRITES.BILLBOARD1, SPRITES.BILLBOARD2, SPRITES.SIGN1, SPRITES.SIGN2];

// vehicles used by the traffic. Trucks are slower, so they are listed separately.
SPRITES.CARS       = [SPRITES.CAR1, SPRITES.CAR2, SPRITES.CAR3];
SPRITES.TRUCKS     = [SPRITES.TRUCK1, SPRITES.TRUCK2, SPRITES.TRUCK3];
SPRITES.TRAFFIC    = SPRITES.CARS.concat(SPRITES.TRUCKS);
