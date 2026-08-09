/***********************************************************************************
* Circuit - builds the track and renders it in pseudo 3D.
*
* Extends the straight-road renderer of the original Pseudo-3d-Racer prototype with
* curves, hills, roadside scenery and traffic sprites.
***********************************************************************************/

class Circuit
{
	constructor(scene){
		// reference to the game scene
		this.scene = scene;

		// graphics to draw the road polygons on it
		this.graphics = scene.add.graphics(0, 0);

		// texture to draw the sprites on it
		this.texture = scene.add.renderTexture(0, 0, SCREEN_W, SCREEN_H);

		// array of road segments
		this.segments = [];

		// single segment length
		this.segmentLength = CONFIG.road.segmentLength;

		// total number of road segments
		this.total_segments = null;

		// number of visible segments to be drawn
		this.visible_segments = CONFIG.road.visibleSegments;

		// number of segments that forms a rumble strip
		this.rumble_segments = CONFIG.road.rumbleSegments;

		// number of road lanes
		this.roadLanes = CONFIG.road.lanes;

		// road width (actually half of the road)
		this.roadWidth = CONFIG.road.width;

		// total road length
		this.roadLength = null;

		// curve of the segment the camera is currently on (used by the background)
		this.baseCurve = 0;
	}

	// =================================================================================
	// Building the track
	// =================================================================================

	/**
	* Creates the entire environment with road and roadside objects.
	*/
	create(){
		// clear arrays
		this.segments = [];

		// create a road
		this.createRoad();

		// colorize first segments in a starting color, and last segments in a finishing color
		for (var n=0; n<this.rumble_segments; n++){
			this.segments[n].color.road = '0xFFFFFF';							// start
			this.segments[this.segments.length-1-n].color.road = '0x222222';	// finish
		}

		// store the total number of segments
		this.total_segments = this.segments.length;

		// calculate the road length
		this.roadLength = this.total_segments * this.segmentLength;

		// scatter trees, billboards and signs along the road
		this.addScenery();
	}

	/**
	* Creates the whole circuit as a sequence of straights, curves and hills.
	* The last section brings the road back to height 0 so the loop is seamless.
	*/
	createRoad(){
		const LENGTH = CONFIG.track.LENGTH;
		const HILL   = CONFIG.track.HILL;
		const CURVE  = CONFIG.track.CURVE;

		this.addStraight(LENGTH.SHORT);								// start / finish straight
		this.addLowRollingHills();
		this.addCurve(LENGTH.MEDIUM, CURVE.EASY, HILL.NONE);
		this.addSCurves();
		this.addCurve(LENGTH.MEDIUM, -CURVE.MEDIUM, HILL.LOW);
		this.addStraight(LENGTH.SHORT);
		this.addCurve(LENGTH.LONG, CURVE.MEDIUM, HILL.MEDIUM);
		this.addHill(LENGTH.MEDIUM, HILL.HIGH);
		this.addCurve(LENGTH.MEDIUM, -CURVE.HARD, HILL.NONE);
		this.addStraight(LENGTH.SHORT);
		this.addSCurves();
		this.addCurve(LENGTH.MEDIUM, CURVE.HARD, -HILL.LOW);
		this.addHill(LENGTH.MEDIUM, -HILL.MEDIUM);
		this.addDownhillToEnd(LENGTH.SHORT);
	}

	/**
	* Returns the height of the last created segment.
	*/
	lastY(){
		return (this.segments.length === 0) ? 0 : this.segments[this.segments.length-1].point.world.y;
	}

	/**
	* Creates a road section that eases into a curve, holds it and eases out of it,
	* while climbing (or descending) to a new height.
	*	enter, hold, leave	= number of segments of each phase
	*	curve				= curve strength, negative turns left
	*	y					= height change, in multiples of the segment length
	*/
	addRoad(enter, hold, leave, curve, y){
		var startY = this.lastY();
		var endY   = startY + (y * this.segmentLength);

		var total = enter + hold + leave;
		var n;

		for (n=0; n<enter; n++){
			this.createSegment(Util.easeIn(0, curve, n/enter), Util.easeInOut(startY, endY, n/total));
		}

		for (n=0; n<hold; n++){
			this.createSegment(curve, Util.easeInOut(startY, endY, (enter+n)/total));
		}

		for (n=0; n<leave; n++){
			this.createSegment(Util.easeInOut(curve, 0, n/leave), Util.easeInOut(startY, endY, (enter+hold+n)/total));
		}
	}

	addStraight(n){
		n = n || CONFIG.track.LENGTH.MEDIUM;
		this.addRoad(n, n, n, 0, 0);
	}

	addCurve(n, curve, height){
		n      = n      || CONFIG.track.LENGTH.MEDIUM;
		curve  = curve  || CONFIG.track.CURVE.MEDIUM;
		height = height || CONFIG.track.HILL.NONE;
		this.addRoad(n, n, n, curve, height);
	}

	addHill(n, height){
		n      = n      || CONFIG.track.LENGTH.MEDIUM;
		height = height || CONFIG.track.HILL.MEDIUM;
		this.addRoad(n, n, n, 0, height);
	}

	addLowRollingHills(n, height){
		n      = n      || CONFIG.track.LENGTH.SHORT;
		height = height || CONFIG.track.HILL.LOW;

		this.addRoad(n, n, n,  0, height/2);
		this.addRoad(n, n, n,  0, -height);
		this.addRoad(n, n, n,  CONFIG.track.CURVE.EASY, height);
		this.addRoad(n, n, n,  0, 0);
		this.addRoad(n, n, n, -CONFIG.track.CURVE.EASY, height/2);
		this.addRoad(n, n, n,  0, 0);
	}

	addSCurves(){
		const LENGTH = CONFIG.track.LENGTH;
		const HILL   = CONFIG.track.HILL;
		const CURVE  = CONFIG.track.CURVE;

		this.addRoad(LENGTH.SHORT, LENGTH.SHORT, LENGTH.SHORT,  -CURVE.EASY,    HILL.NONE);
		this.addRoad(LENGTH.SHORT, LENGTH.SHORT, LENGTH.SHORT,   CURVE.MEDIUM,  HILL.MEDIUM);
		this.addRoad(LENGTH.SHORT, LENGTH.SHORT, LENGTH.SHORT,   CURVE.EASY,   -HILL.LOW);
		this.addRoad(LENGTH.SHORT, LENGTH.SHORT, LENGTH.SHORT,  -CURVE.EASY,    HILL.MEDIUM);
		this.addRoad(LENGTH.SHORT, LENGTH.SHORT, LENGTH.SHORT,  -CURVE.MEDIUM, -HILL.MEDIUM);
	}

	/**
	* Final section: eases the road back down to height 0 so that the end of the track
	* joins its beginning without a step.
	*/
	addDownhillToEnd(n){
		n = n || CONFIG.track.LENGTH.MEDIUM;
		this.addRoad(n, n, n, -CONFIG.track.CURVE.EASY, -this.lastY()/this.segmentLength);
	}

	/**
	* Creates a new segment.
	*/
	createSegment(curve, worldY){
		// define colors
		const COLORS = {
			LIGHT:	{road: '0x888888', grass: '0x429352', rumble: '0xb8312e'},
			DARK:	{road: '0x666666', grass: '0x397d46', rumble: '0xDDDDDD', lane: '0xFFFFFF'}
		};

		// get the current number of the segments
		var n = this.segments.length;

		// add new segment
		this.segments.push({
			index: n,

			point: {
				world:	{x: 0, y: worldY || 0, z: n*this.segmentLength},
				camera:	{x: 0, y: 0, z: 0},
				screen:	{x: 0, y: 0, w: 0},
				scale: -1
			},

			// how strongly this segment bends the road
			curve: curve || 0,

			// roadside objects and traffic cars currently on this segment
			sprites: [],
			cars: [],

			// screen line this segment was clipped at (filled in while rendering)
			clip: 0,

			// alternately color the groups of segments dark and light
			color: Math.floor(n/this.rumble_segments)%2 ? COLORS.DARK : COLORS.LIGHT
		});
	}

	/**
	* Scatters roadside objects along the finished road.
	*/
	addScenery(){
		const S = CONFIG.scenery;
		var total = this.total_segments;
		var n, side, offset;

		// billboards and road signs, sparsely placed
		for (n = 10; n < total; n += Util.randomInt(S.signGapMin, S.signGapMax)){
			side   = Util.randomChoice([-1, 1]);
			offset = side * Util.interpolate(S.minOffset, S.minOffset + 0.6, Math.random());
			this.addSprite(n, Util.randomChoice(SPRITES.SIGNS), offset);
		}

		// trees on both sides of the road
		for (n = 10; n < total; n += Util.randomInt(S.treeGapMin, S.treeGapMax)){
			side   = Util.randomChoice([-1, 1]);
			offset = side * Util.interpolate(S.minOffset, S.maxOffset, Math.random());
			this.addSprite(n, Util.randomChoice(SPRITES.TREES), offset);
		}
	}

	/**
	* Attaches a roadside object to a segment.
	*/
	addSprite(index, source, offset){
		if (index < 0 || index >= this.total_segments) return;
		this.segments[index].sprites.push({source: source, offset: offset});
	}

	// =================================================================================
	// Projection and rendering
	// =================================================================================

	/**
	* Returns a segment at the given Z position.
	*/
	getSegment(positionZ) {
		if (positionZ<0) positionZ += this.roadLength;
		var index = Math.floor(positionZ / this.segmentLength) % this.total_segments;
		return this.segments[index];
	}

	/**
	* Returns how far into its own segment the given Z position is, as 0..1.
	*/
	getSegmentPercent(positionZ){
		return (Util.wrap(positionZ, this.roadLength) % this.segmentLength) / this.segmentLength;
	}

	/**
	* Returns the road surface height at the given Z position.
	*/
	getRoadHeight(positionZ){
		var segment = this.getSegment(positionZ);
		var next    = this.segments[(segment.index + 1) % this.total_segments];
		return Util.interpolate(segment.point.world.y, next.point.world.y, this.getSegmentPercent(positionZ));
	}

	/**
	* Projects a point from its world coordinates to screen coordinates (pseudo 3D view).
	*/
	project3D(point, cameraX, cameraY, cameraZ, cameraDepth){
		// translating world coordinates to camera coordinates
		var transX = point.world.x - cameraX;
		var transY = point.world.y - cameraY;
		var transZ = point.world.z - cameraZ;

		point.camera.x = transX;
		point.camera.y = transY;
		point.camera.z = transZ;

		// scaling factor based on the law of similar triangles
		point.scale = cameraDepth/transZ;

		// projecting camera coordinates onto a normalized projection plane
		var projectedX = point.scale * transX;
		var projectedY = point.scale * transY;
		var projectedW = point.scale * this.roadWidth;

		// scaling projected coordinates to the screen coordinates
		point.screen.x = Math.round((1 + projectedX) * SCREEN_CX);
		point.screen.y = Math.round((1 - projectedY) * SCREEN_CY);
		point.screen.w = Math.round(projectedW * SCREEN_CX);
	}

	/**
	* Renders the road by drawing segment by segment (pseudo 3D view), then all the
	* sprites standing on those segments, from the farthest to the nearest one.
	*/
	render3D(){
		this.graphics.clear();

		// get the camera
		var camera = this.scene.camera;

		// get the base segment
		var baseSegment = this.getSegment(camera.z);
		var baseIndex   = baseSegment.index;
		var basePercent = this.getSegmentPercent(camera.z);

		this.baseCurve = baseSegment.curve;

		// define the clipping bottom line to render only segments above it
		var clipBottomLine = SCREEN_H;

		// accumulated horizontal shift that bends the road on the screen
		var x  = 0;
		var dx = -(baseSegment.curve * basePercent);

		var n, currIndex, currSegment, prevSegment, offsetZ, p1, p2, i;

		for (n=0; n<this.visible_segments; n++){
			// get the current segment
			currIndex   = (baseIndex + n) % this.total_segments;
			currSegment = this.segments[currIndex];

			// get the camera offset-Z to loop back the road
			offsetZ = (currIndex < baseIndex) ? this.roadLength : 0;

			// remember where this segment got clipped, the sprites on it need to know
			currSegment.clip = clipBottomLine;

			// project the segment to the screen space
			this.project3D(currSegment.point, camera.x - x, camera.y, camera.z-offsetZ, camera.distToPlane);

			// bend the road
			x  += dx;
			dx += currSegment.curve;

			if (n > 0){
				prevSegment = this.segments[(currIndex>0) ? currIndex-1 : this.total_segments-1];

				p1 = prevSegment.point.screen;
				p2 = currSegment.point.screen;

				// skip segments behind the camera, and those hidden behind a hill
				if (prevSegment.point.camera.z > camera.distToPlane && p2.y < p1.y && p2.y < clipBottomLine){
					this.drawSegment(
						p1.x, p1.y, p1.w,
						p2.x, p2.y, p2.w,
						currSegment.color
					);

					// move the clipping bottom line up
					clipBottomLine = p2.y;
				}
			}
		}

		// draw all the visible objects on the rendering texture
		this.texture.clear();

		// back to front, so that near objects cover the far ones
		for (n=this.visible_segments-1; n>0; n--){
			currSegment = this.segments[(baseIndex + n) % this.total_segments];

			// nothing to draw if this segment ended up behind the camera
			if (currSegment.point.camera.z <= camera.distToPlane) continue;

			for (i=0; i<currSegment.sprites.length; i++){
				this.renderSprite(currSegment.sprites[i].source, currSegment.point, currSegment.sprites[i].offset, currSegment.clip, false);
			}

			for (i=0; i<currSegment.cars.length; i++){
				this.renderSprite(currSegment.cars[i].sprite, currSegment.point, currSegment.cars[i].offset, currSegment.clip, true);
			}
		}

		// draw player on top of everything else
		var player = this.scene.player;
		this.texture.draw(player.sprite, player.screen.x, player.screen.y);
	}

	/**
	* Draws a single 3D-projected sprite standing on the road surface. Parameters:
	*	source		= entry of the SPRITES catalogue
	*	point		= projected point of the segment the sprite stands on
	*	offset		= sideways position, 1.0 = right edge of the road
	*	clipY		= screen line below which the sprite is hidden by a hill
	*	centered	= true for traffic (centered on the offset), false for scenery
	*				  (grows away from the road)
	*/
	renderSprite(source, point, offset, clipY, centered){
		var img = this.scene.sprites[source.name];
		if (!img || point.screen.w <= 0) return;

		var destW = point.screen.w * source.w;
		var destH = destW * (img.height / img.width);

		if (destH < 1) return;

		var destX = point.screen.x + (point.screen.w * offset);
		var destY = point.screen.y - destH;			// sprites stand on the road surface

		if (!centered) destX += (offset < 0) ? -destW/2 : destW/2;

		// skip everything that is completely off screen
		if (destX + destW/2 < 0 || destX - destW/2 > SCREEN_W || destY > SCREEN_H) return;

		// hide the part that is behind a hill
		var clipH = clipY ? Math.max(0, (destY + destH) - clipY) : 0;
		if (clipH >= destH) return;

		img.setOrigin(0.5, 0);
		img.setDisplaySize(destW, destH);

		if (clipH > 0) img.setCrop(0, 0, img.width, img.height * (1 - clipH/destH));

		this.texture.draw(img, destX, destY);

		if (clipH > 0) img.setCrop();
	}

	/**
	* Draws a segment.
	*/
	drawSegment(x1, y1, w1, x2, y2, w2, color){
		// draw grass
		this.graphics.fillStyle(color.grass, 1);
		this.graphics.fillRect(0, y2, SCREEN_W, y1 - y2);

		// draw road
		this.drawPolygon(x1-w1, y1,	x1+w1, y1, x2+w2, y2, x2-w2, y2, color.road);

		// draw rumble strips
		var rumble_w1 = w1/5;
		var rumble_w2 = w2/5;
		this.drawPolygon(x1-w1-rumble_w1, y1, x1-w1, y1, x2-w2, y2, x2-w2-rumble_w2, y2, color.rumble);
		this.drawPolygon(x1+w1+rumble_w1, y1, x1+w1, y1, x2+w2, y2, x2+w2+rumble_w2, y2, color.rumble);

		// draw lanes
		if (color.lane) {
			var line_w1 = (w1/20) / 2;
			var line_w2 = (w2/20) / 2;

			var lane_w1 = (w1*2) / this.roadLanes;
			var lane_w2 = (w2*2) / this.roadLanes;

			var lane_x1 = x1 - w1;
			var lane_x2 = x2 - w2;

			for(var i=1; i<this.roadLanes; i++){
				lane_x1 += lane_w1;
				lane_x2 += lane_w2;

				this.drawPolygon(
					lane_x1-line_w1, y1,
					lane_x1+line_w1, y1,
					lane_x2+line_w2, y2,
					lane_x2-line_w2, y2,
					color.lane
				);
			}
		}
	}

	/**
	* Draws a polygon defined with four points and color.
	*/
	drawPolygon(x1, y1, x2, y2, x3, y3, x4, y4, color){
		this.graphics.fillStyle(color, 1);
		this.graphics.beginPath();

		this.graphics.moveTo(x1, y1);
		this.graphics.lineTo(x2, y2);
		this.graphics.lineTo(x3, y3);
		this.graphics.lineTo(x4, y4);

		this.graphics.closePath();
		this.graphics.fill();
	}
}
