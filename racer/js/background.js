/***********************************************************************************
* Background - parallax layers resting on the horizon.
*
* The layers scroll sideways with the curve of the road, which is what sells the
* feeling of actually turning in an OutRun style racer.
***********************************************************************************/

class Background
{
	constructor(scene){
		// reference to the main scene
		this.scene = scene;

		// solid sky colour behind everything, so no gap can ever show through
		this.base = scene.add.image(SCREEN_CX, SCREEN_CY, 'imgBack');

		this.layers = [];

		for (var n=0; n<CONFIG.background.layers.length; n++){
			this.layers.push(this.addLayer(CONFIG.background.layers[n]));
		}
	}

	/**
	* Adds one tiled layer whose bottom edge sits on the horizon. The source picture is
	* scaled down to the wanted height and repeated sideways.
	*/
	addLayer(def){
		var source = this.scene.textures.get(def.key).getSourceImage();
		var scale  = def.height / source.height;

		var tile = this.scene.add.tileSprite(0, CONFIG.background.horizon - def.height, SCREEN_W, def.height, def.key);
		tile.setOrigin(0, 0);
		tile.tileScaleX = scale;
		tile.tileScaleY = scale;

		return {tile: tile, speed: def.speed};
	}

	/**
	* Resets the layers to their starting offset.
	*/
	restart(){
		for (var n=0; n<this.layers.length; n++){
			this.layers[n].tile.tilePositionX = 0;
		}
	}

	/**
	* Scrolls the layers according to the curve the player is currently driving through.
	*/
	update(dt){
		var player  = this.scene.player;
		var circuit = this.scene.circuit;

		// how many segments the player has covered during this frame
		var segmentsMoved = (player.speed * dt) / circuit.segmentLength;

		for (var n=0; n<this.layers.length; n++){
			var layer = this.layers[n];
			layer.tile.tilePositionX += circuit.baseCurve * layer.speed * segmentsMoved;
		}
	}
}
