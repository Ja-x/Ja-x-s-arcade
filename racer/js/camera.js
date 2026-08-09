/***********************************************************************************
* Camera - trails the player and rides over the hills with the road.
***********************************************************************************/

class Camera
{
	constructor(scene){
		// reference to the main scene
		this.scene = scene;

		// camera world coordinates
		this.x = 0;
		this.y = CONFIG.camera.height;
		this.z = 0;

		// height of the camera above the road surface
		this.height = CONFIG.camera.height;

		// Z-distance between camera and player
		this.distToPlayer = CONFIG.camera.distToPlayer;

		// Z-distance between camera and normalized projection plane
		this.distToPlane = null;
	}

	/**
	* Initializes camera (must be called when initializing game or changing settings).
	*/
	init(){
		// derived from the resting height, so that hills don't change the field of view
		this.distToPlane = 1 / (this.height / this.distToPlayer);
	}

	/**
	* Updates camera position to follow the player.
	*/
	update(){
		// references
		var player = this.scene.player;
		var circuit = this.scene.circuit;

		// since player X is normalized within [-1, 1], then camera X must be multiplied by road width
		this.x = player.x * circuit.roadWidth;

		// stay a fixed height above the road surface under the player
		this.y = player.y + this.height;

		// place the camera behind the player at the desired distance
		this.z = player.z - this.distToPlayer;

		// don't let camera Z to go negative
		if (this.z<0) this.z += circuit.roadLength;
	}
}
