/***********************************************************************************
* Artwork - every picture in the game, drawn into canvas textures when the game boots.
*
* The original prototype shipped flat placeholder art: the traffic was a coloured
* rectangle on two stubs, the hills were one grey polygon. This module replaces all
* of it with shaded, detailed artwork that is generated once at start up, so it costs
* nothing while driving and keeps the game a single folder of plain files.
*
* Everything here is original work drawn with the 2D canvas API. Nothing is traced
* from, or copied out of, another game.
*
* Two rules shape the drawings:
*
*   1. Sprites stand on the road, so the bottom edge of every sprite canvas is the
*      ground line. Whatever touches the ground must be drawn there.
*   2. Most of the time a sprite is only a few pixels tall, so the silhouette and the
*      big blocks of contrast matter far more than the fine detail. Every vehicle
*      gets a dark outline and bright lamps for exactly that reason.
*
* The parallax layers are tiled sideways, so they are drawn to be seamless: anything
* near an edge is repeated on the opposite one, and the mountain ridges start and end
* at the same height.
***********************************************************************************/

const Artwork = (function(){

	// =================================================================================
	// Small helpers
	// =================================================================================

	/**
	* Seeded random numbers, so the scenery looks the same on every visit.
	*/
	function makeRng(seed){
		var t = seed >>> 0;

		return function(){
			t += 0x6D2B79F5;
			var r = t;
			r = Math.imul(r ^ (r >>> 15), r | 1);
			r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
			return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
		};
	}

	function parseHex(hex){
		var v = parseInt(hex.slice(1), 16);
		return {r: (v>>16) & 255, g: (v>>8) & 255, b: v & 255};
	}

	function rgba(c, a){
		return 'rgba(' + Math.round(c.r) + ',' + Math.round(c.g) + ',' + Math.round(c.b) + ',' + a + ')';
	}

	/**
	* Lightens (t > 0) or darkens (t < 0) a hex colour. t is 0..1.
	*/
	function shade(hex, t){
		var c  = parseHex(hex);
		var to = (t > 0) ? 255 : 0;
		var k  = Math.abs(t);

		return 'rgb(' + Math.round(c.r + (to-c.r)*k) + ',' +
		                Math.round(c.g + (to-c.g)*k) + ',' +
		                Math.round(c.b + (to-c.b)*k) + ')';
	}

	/**
	* Mixes two hex colours, t = 0 returns the first one.
	*/
	function mix(hexA, hexB, t){
		var a = parseHex(hexA), b = parseHex(hexB);

		return 'rgb(' + Math.round(a.r + (b.r-a.r)*t) + ',' +
		                Math.round(a.g + (b.g-a.g)*t) + ',' +
		                Math.round(a.b + (b.b-a.b)*t) + ')';
	}

	/**
	* Rounded rectangle path (written out by hand, ctx.roundRect is too new to rely on).
	*/
	function rr(ctx, x, y, w, h, r){
		r = Math.min(r, Math.abs(w)/2, Math.abs(h)/2);

		ctx.beginPath();
		ctx.moveTo(x+r, y);
		ctx.lineTo(x+w-r, y);
		ctx.quadraticCurveTo(x+w, y, x+w, y+r);
		ctx.lineTo(x+w, y+h-r);
		ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
		ctx.lineTo(x+r, y+h);
		ctx.quadraticCurveTo(x, y+h, x, y+h-r);
		ctx.lineTo(x, y+r);
		ctx.quadraticCurveTo(x, y, x+r, y);
		ctx.closePath();
	}

	function fillRR(ctx, x, y, w, h, r, style){
		rr(ctx, x, y, w, h, r);
		ctx.fillStyle = style;
		ctx.fill();
	}

	/**
	* Draws the same thing three times, one screen width apart, so that a shape sitting
	* on the edge of a tiled layer continues on the other side.
	*/
	function atX(ctx, tileW, x, draw){
		for (var k=-1; k<=1; k++){
			ctx.save();
			ctx.translate(x + k*tileW, 0);
			draw(ctx);
			ctx.restore();
		}
	}

	/**
	* Draws a shape twice through a coloured shadow, which gives lamps a believable halo.
	*/
	function withGlow(ctx, colour, blur, draw){
		ctx.save();
		ctx.shadowColor = colour;
		ctx.shadowBlur  = blur;
		draw(ctx);
		draw(ctx);
		ctx.restore();
	}

	/**
	* Soft dark ellipse for the ground contact shadow of an object.
	*/
	function groundShadow(ctx, cx, cy, rx, ry, strength){
		var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 1);

		g.addColorStop(0.00, 'rgba(0,0,0,' + strength + ')');
		g.addColorStop(0.55, 'rgba(0,0,0,' + (strength*0.6) + ')');
		g.addColorStop(1.00, 'rgba(0,0,0,0)');

		ctx.save();
		ctx.translate(cx, cy);
		ctx.scale(rx, ry);
		ctx.translate(-cx, -cy);
		ctx.fillStyle = g;
		ctx.beginPath();
		ctx.arc(cx, cy, 1, 0, Math.PI*2);
		ctx.fill();
		ctx.restore();
	}

	/**
	* A ridge line for mountains and hills, built by midpoint displacement.
	* Both ends get the same height, which is what makes the layer tile seamlessly.
	* Returns size+1 values normalized to 0..1, where 1 is a peak.
	*/
	function fractalRidge(rng, size, roughness){
		var pts = new Array(size+1);
		var i;

		for (i=0; i<=size; i++) pts[i] = 0;

		pts[0] = pts[size] = 0.35 + rng()*0.15;

		var step = size;
		var amp  = 0.55;

		while (step > 1){
			var half = step/2;

			for (i=half; i<size; i+=step){
				pts[i] = (pts[i-half] + pts[i+half])/2 + (rng()*2-1)*amp;
			}

			amp  *= roughness;
			step  = half;
		}

		// normalize so that the highest peak is exactly 1
		var lo = Infinity, hi = -Infinity;

		for (i=0; i<=size; i++){
			if (pts[i] < lo) lo = pts[i];
			if (pts[i] > hi) hi = pts[i];
		}

		var span = (hi - lo) || 1;
		for (i=0; i<=size; i++) pts[i] = (pts[i]-lo)/span;

		return pts;
	}

	/**
	* Turns a ridge into a closed path reaching down to the bottom of the canvas.
	*	topY	= screen Y of the highest peak
	*	depth	= how far below topY the lowest saddle sits
	*/
	function ridgePath(ctx, pts, W, H, topY, depth){
		var n = pts.length - 1;

		ctx.beginPath();
		ctx.moveTo(0, topY + (1-pts[0])*depth);

		for (var i=1; i<=n; i++){
			ctx.lineTo((i/n)*W, topY + (1-pts[i])*depth);
		}

		ctx.lineTo(W, H);
		ctx.lineTo(0, H);
		ctx.closePath();
	}

	// =================================================================================
	// Background: the still picture behind everything
	// =================================================================================

	/**
	* Full screen sky with the sun. This one does not scroll, so it is the right place
	* for the sun: a sun inside a tiled layer would show up several times at once.
	*/
	function drawSkyBase(ctx, W, H){
		var horizon = CONFIG.background.horizon;

		// ---- graded sky, deep blue overhead and warm just above the ground ----
		var sky = ctx.createLinearGradient(0, 0, 0, horizon);

		sky.addColorStop(0.00, '#123a86');
		sky.addColorStop(0.22, '#2260bd');
		sky.addColorStop(0.48, '#4f95dd');
		sky.addColorStop(0.72, '#8fc4ee');
		sky.addColorStop(0.90, '#c8e4f7');
		sky.addColorStop(1.00, '#ffe9c2');

		ctx.fillStyle = sky;
		ctx.fillRect(0, 0, W, horizon);

		// ---- the sun, high and to the right, which is where all the shading assumes it is ----
		var sunX = W*0.72;
		var sunY = horizon - H*0.30;

		var halo = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, H*0.42);
		halo.addColorStop(0.00, 'rgba(255,244,205,0.55)');
		halo.addColorStop(0.35, 'rgba(255,232,175,0.20)');
		halo.addColorStop(1.00, 'rgba(255,225,160,0)');
		ctx.fillStyle = halo;
		ctx.fillRect(0, 0, W, horizon);

		var core = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, H*0.075);
		core.addColorStop(0.00, 'rgba(255,255,250,1)');
		core.addColorStop(0.42, 'rgba(255,250,225,0.95)');
		core.addColorStop(0.70, 'rgba(255,238,190,0.45)');
		core.addColorStop(1.00, 'rgba(255,232,175,0)');
		ctx.fillStyle = core;
		ctx.fillRect(0, 0, W, horizon);

		// ---- warm haze sitting on the horizon line ----
		var haze = ctx.createLinearGradient(0, horizon - H*0.09, 0, horizon);
		haze.addColorStop(0, 'rgba(255,225,170,0)');
		haze.addColorStop(1, 'rgba(255,222,165,0.75)');
		ctx.fillStyle = haze;
		ctx.fillRect(0, horizon - H*0.09, W, H*0.09);

		// ---- below the horizon: covered by the road, but never leave a hole ----
		var ground = ctx.createLinearGradient(0, horizon, 0, H);
		ground.addColorStop(0.00, '#4a7a48');
		ground.addColorStop(1.00, '#24462a');
		ctx.fillStyle = ground;
		ctx.fillRect(0, horizon, W, H - horizon);
	}

	// =================================================================================
	// Background layer 1: clouds
	// =================================================================================

	/**
	* Lays out the lumps of one cumulus cloud. The local origin is the middle of the
	* flat base, so every lump sits at a negative Y.
	*
	* The lumps have to overlap or the cloud ends up looking like a string of beads,
	* which is why the spacing is derived from the height rather than picked freely.
	*/
	function cloudLumps(rng, h){
		var lumps = [];
		var n     = 7 + Math.floor(rng()*3);
		var step  = h*0.34;						// always smaller than the smallest radius
		var w     = step*(n-1);
		var i;

		for (i=0; i<n; i++){
			var t    = i/(n-1);
			var bell = Math.sin(Math.PI*t);		// fat in the middle, thin at the ends
			var r    = h*(0.40 + 0.42*bell) * (0.88 + rng()*0.24);

			lumps.push({
				x: (t-0.5)*w,
				y: -r*0.80 - bell*h*0.16 + (rng()-0.5)*h*0.08,
				r: r
			});
		}

		// a couple of extra heads on top, for the cauliflower look
		for (i=0; i<3; i++){
			var t2 = 0.22 + rng()*0.56;
			lumps.push({
				x: (t2-0.5)*w,
				y: -h*(0.72 + rng()*0.30),
				r: h*(0.26 + rng()*0.20)
			});
		}

		return lumps;
	}

	/**
	* Adds every lump to the current path. Filled in one go they merge into a single
	* outline instead of a heap of separate circles.
	*/
	function cloudPath(ctx, lumps){
		ctx.beginPath();

		for (var i=0; i<lumps.length; i++){
			ctx.moveTo(lumps[i].x + lumps[i].r, lumps[i].y);
			ctx.arc(lumps[i].x, lumps[i].y, lumps[i].r, 0, Math.PI*2);
		}
	}

	function drawCloud(ctx, rng, h){
		var lumps = cloudLumps(rng, h);

		// Flat base, the way cumulus really sit. This has to wrap both passes below:
		// clipping only the body leaves the bottom of every lump sticking out as a bare
		// circle, which turns the cloud back into a string of beads.
		ctx.save();
		ctx.beginPath();
		ctx.rect(-h*5, -h*5, h*10, h*5);
		ctx.clip();

		// soft edge: the same outline blurred out behind the solid body
		ctx.save();
		ctx.shadowColor = 'rgba(255,255,255,0.85)';
		ctx.shadowBlur  = h*0.22;
		ctx.fillStyle   = 'rgba(255,255,255,0.55)';
		cloudPath(ctx, lumps);
		ctx.fill();
		ctx.fill();
		ctx.restore();

		// body, lit on top and shaded underneath
		ctx.save();
		cloudPath(ctx, lumps);
		ctx.clip();

		var body = ctx.createLinearGradient(0, -h*1.5, 0, 0);
		body.addColorStop(0.00, '#ffffff');
		body.addColorStop(0.55, '#f2f6fb');
		body.addColorStop(0.85, '#cbd8e8');
		body.addColorStop(1.00, '#a8bdd4');
		ctx.fillStyle = body;
		ctx.fillRect(-h*4, -h*4, h*8, h*4);

		// warm light spilling in from the sun, which sits to the right
		var lit = ctx.createLinearGradient(-h*2, 0, h*2, -h*1.2);
		lit.addColorStop(0.00, 'rgba(255,240,205,0)');
		lit.addColorStop(1.00, 'rgba(255,243,214,0.55)');
		ctx.fillStyle = lit;
		ctx.fillRect(-h*4, -h*4, h*8, h*4);

		ctx.restore();
		ctx.restore();
	}

	function drawClouds(ctx, W, H){
		var rng = makeRng(20260809);
		var n, x, y, w, h;

		// high thin streaks first
		for (n=0; n<9; n++){
			x = rng()*W;
			y = H*(0.05 + rng()*0.20);
			w = W*(0.10 + rng()*0.11);
			h = H*(0.012 + rng()*0.020);

			(function(x, y, w, h){
				atX(ctx, W, x, function(c){
					var g = c.createLinearGradient(-w/2, 0, w/2, 0);
					g.addColorStop(0.0, 'rgba(255,255,255,0)');
					g.addColorStop(0.5, 'rgba(255,255,255,0.26)');
					g.addColorStop(1.0, 'rgba(255,255,255,0)');

					c.fillStyle = g;
					c.beginPath();
					c.ellipse(0, y, w/2, h/2, -0.03, 0, Math.PI*2);
					c.fill();
				});
			})(x, y, w, h);
		}

		// cumulus, bigger and lower down
		for (n=0; n<10; n++){
			x = (n + 0.15 + rng()*0.7) * (W/10);
			y = H*(0.24 + rng()*0.30);				// base line of the cloud
			h = H*(0.15 + rng()*0.13);

			(function(x, y, h, seed){
				atX(ctx, W, x, function(c){
					c.save();
					c.translate(0, y);
					drawCloud(c, makeRng(seed), h);
					c.restore();
				});
			})(x, y, h, Math.floor(rng()*100000));
		}
	}

	// =================================================================================
	// Background layer 2: mountains
	// =================================================================================

	function drawMountains(ctx, W, H){
		var rng = makeRng(775511);

		// ---------------------------------------------------------------------------------
		// Three ranges. Each one is lower, darker and less hazy than the one behind it,
		// which is what makes the layer look deep.
		//
		// The town layer covers the bottom half of this one, so all three ridge lines are
		// kept up in the part that actually stays visible.
		// ---------------------------------------------------------------------------------
		var ranges = [
			{pts: fractalRidge(rng, 256, 0.52), topY: H*0.03, depth: H*0.58, light: '#b6d0e4', dark: '#7c9fc0', snow: 0.34, haze: 0.40, trees: 0},
			{pts: fractalRidge(rng, 256, 0.55), topY: H*0.15, depth: H*0.55, light: '#84a9c2', dark: '#456a86', snow: 0.24, haze: 0.24, trees: 0},
			{pts: fractalRidge(rng, 128, 0.58), topY: H*0.30, depth: H*0.52, light: '#4f8058', dark: '#28513a', snow: 0.00, haze: 0.09, trees: 1}
		];

		for (var r=0; r<ranges.length; r++){
			var range = ranges[r];

			ctx.save();
			ridgePath(ctx, range.pts, W, H, range.topY, range.depth);
			ctx.clip();

			// body of the range, lit from above
			var body = ctx.createLinearGradient(0, range.topY, 0, H);
			body.addColorStop(0.00, range.light);
			body.addColorStop(0.55, range.dark);
			body.addColorStop(1.00, shade(range.dark, -0.22));
			ctx.fillStyle = body;
			ctx.fillRect(0, 0, W, H);

			// the sun is on the right, so throw a soft light across from that side
			var side = ctx.createLinearGradient(0, 0, W, 0);
			side.addColorStop(0.0, 'rgba(0,0,0,0.14)');
			side.addColorStop(1.0, 'rgba(255,244,214,0.14)');
			ctx.fillStyle = side;
			ctx.fillRect(0, 0, W, H);

			// snow above the snow line
			if (range.snow > 0){
				var snow = ctx.createLinearGradient(0, range.topY, 0, range.topY + range.depth*range.snow);
				snow.addColorStop(0.00, 'rgba(255,255,255,0.92)');
				snow.addColorStop(0.55, 'rgba(255,255,255,0.55)');
				snow.addColorStop(1.00, 'rgba(255,255,255,0)');
				ctx.fillStyle = snow;
				ctx.fillRect(0, 0, W, H);

				// break the snow line up with bare rock running down the gullies
				ctx.fillStyle = rgba(parseHex(range.dark), 0.45);

				for (var s=0; s<90; s++){
					var sx = rng()*W;
					var sy = range.topY + range.depth*range.snow*(0.25 + rng()*0.85);
					var sw = range.depth*(0.02 + rng()*0.05);

					ctx.beginPath();
					ctx.moveTo(sx, sy - range.depth*0.10);
					ctx.lineTo(sx + sw, sy + range.depth*0.10);
					ctx.lineTo(sx - sw, sy + range.depth*0.10);
					ctx.closePath();
					ctx.fill();
				}
			}

			// forest on the near hills: a scatter of little dark conifers
			if (range.trees){
				var n = range.pts.length - 1;

				ctx.fillStyle = 'rgba(24,54,36,0.55)';

				for (var t=0; t<900; t++){
					var tx = rng()*W;
					var idx = Math.round((tx/W)*n);
					var surfaceY = range.topY + (1-range.pts[idx])*range.depth;
					var ty = surfaceY + rng()*rng()*(H - surfaceY);
					var th = H*(0.020 + rng()*0.030);

					ctx.beginPath();
					ctx.moveTo(tx, ty - th);
					ctx.lineTo(tx + th*0.38, ty);
					ctx.lineTo(tx - th*0.38, ty);
					ctx.closePath();
					ctx.fill();
				}
			}

			// distance haze, thickest at the bottom where the range meets the next one
			var haze = ctx.createLinearGradient(0, range.topY, 0, H);
			haze.addColorStop(0.00, 'rgba(206,228,246,0)');
			haze.addColorStop(0.60, 'rgba(206,228,246,' + (range.haze*0.5) + ')');
			haze.addColorStop(1.00, 'rgba(222,236,250,' + range.haze + ')');
			ctx.fillStyle = haze;
			ctx.fillRect(0, 0, W, H);

			ctx.restore();
		}
	}

	// =================================================================================
	// Background layer 3: the distant town
	// =================================================================================

	function drawTown(ctx, W, H){
		var rng = makeRng(430922);

		var baseY = H*0.74;			// street level, the treeline covers everything below

		// ---------------------------------------------------------------------------------
		// Two passes of buildings: a pale far one, then a slightly firmer near one.
		//
		// The walls are flat colour with one lit edge rather than a left to right gradient.
		// A gradient across a rectangle turns every block into a shiny pipe, which is
		// exactly what the first attempt at this looked like.
		// ---------------------------------------------------------------------------------
		var passes = [
			{tone: '#c6d5e2', top: 0.09, lit: 0.00, y: baseY - H*0.06, span: 0.22},
			{tone: '#adc0d2', top: 0.07, lit: 0.26, y: baseY,          span: 0.30}
		];

		for (var p=0; p<passes.length; p++){
			var pass = passes[p];
			var x = 0;

			while (x < W){
				// a mix of narrow towers and wide slabs
				var wide = rng() < 0.35;
				var bw = W*(wide ? (0.016 + rng()*0.022) : (0.005 + rng()*0.010));
				var bh = H*(pass.top + rng()*rng()*pass.span);
				var by = pass.y - bh;
				var tone = mix(pass.tone, (rng() < 0.50) ? '#dde8f2' : '#5c7495', rng()*0.50);

				(function(bx, bw, by, bh, tone, pass){
					atX(ctx, W, bx, function(c){
						// flat wall
						c.fillStyle = tone;
						c.fillRect(0, by, bw, bh);

						// one lit edge and one shaded edge, the sun is on the right
						c.fillStyle = shade(tone, 0.20);
						c.fillRect(bw - Math.max(1, bw*0.16), by, Math.max(1, bw*0.16), bh);
						c.fillStyle = 'rgba(40,60,84,0.16)';
						c.fillRect(0, by, Math.max(1, bw*0.14), bh);

						// rooftop lip
						c.fillStyle = shade(tone, 0.30);
						c.fillRect(0, by, bw, Math.max(1, H*0.005));

						// windows, kept as a fine speckle: at this distance they only ever
						// need to add texture, never to be read as individual windows
						if (pass.lit > 0 && bw > W*0.006){
							var cols = Math.max(1, Math.round(bw / (H*0.022)));
							var rows = Math.max(1, Math.round(bh / (H*0.034)));
							var gapX = bw/cols, gapY = bh/rows;

							for (var wy=0; wy<rows; wy++){
								for (var wx=0; wx<cols; wx++){
									if (rng() > pass.lit) continue;

									c.fillStyle = (rng() < 0.6)
										? 'rgba(255,232,168,0.55)'
										: 'rgba(90,120,152,0.35)';

									c.fillRect(
										wx*gapX + gapX*0.30, by + wy*gapY + gapY*0.32,
										Math.max(1, gapX*0.40), Math.max(1, gapY*0.36)
									);
								}
							}
						}

						// something on the roof: an aerial, a tank or a spire
						var roll = rng();

						if (roll < 0.16){
							c.fillStyle = shade(tone, -0.28);
							c.fillRect(bw*0.45, by - H*0.07, Math.max(1, bw*0.06), H*0.07);
						}
						else if (roll < 0.26){
							c.fillStyle = shade(tone, -0.12);
							c.fillRect(bw*0.22, by - H*0.030, bw*0.55, H*0.030);
						}
						else if (roll < 0.31){
							c.fillStyle = shade(tone, 0.08);
							c.beginPath();
							c.moveTo(bw*0.5, by - H*0.09);
							c.lineTo(bw*0.85, by);
							c.lineTo(bw*0.15, by);
							c.closePath();
							c.fill();
						}
					});
				})(x, bw, by, bh, tone, pass);

				// occasional gap, so the skyline is not one solid wall
				x += bw + W*((rng() < 0.08) ? (0.006 + rng()*0.012) : (0.0008 + rng()*0.0030));
			}
		}

		// ---------------------------------------------------------------------------------
		// A construction crane, purely because a skyline needs one
		// ---------------------------------------------------------------------------------
		atX(ctx, W, W*0.63, function(c){
			c.strokeStyle = 'rgba(96,120,146,0.75)';
			c.lineWidth   = Math.max(1, H*0.004);

			c.beginPath();
			c.moveTo(0, baseY);
			c.lineTo(0, baseY - H*0.40);
			c.moveTo(-H*0.11, baseY - H*0.38);
			c.lineTo( H*0.22, baseY - H*0.38);
			c.moveTo(0, baseY - H*0.45);
			c.lineTo( H*0.20, baseY - H*0.38);
			c.moveTo(0, baseY - H*0.45);
			c.lineTo(-H*0.10, baseY - H*0.38);
			c.moveTo(H*0.16, baseY - H*0.38);
			c.lineTo(H*0.16, baseY - H*0.30);
			c.stroke();
		});

		// ---------------------------------------------------------------------------------
		// Haze over the town, before the treeline goes in front of it
		// ---------------------------------------------------------------------------------
		var haze = ctx.createLinearGradient(0, 0, 0, baseY);
		haze.addColorStop(0.00, 'rgba(206,227,245,0.26)');
		haze.addColorStop(0.60, 'rgba(206,227,245,0.18)');
		haze.addColorStop(1.00, 'rgba(206,227,245,0.32)');
		ctx.fillStyle = haze;
		ctx.fillRect(0, 0, W, baseY);

		// ---------------------------------------------------------------------------------
		// Treeline along the bottom, tying the town into the ground
		// ---------------------------------------------------------------------------------
		var treeTone = ['#33603f', '#28502f', '#3d6b45', '#22452c'];

		for (var t=0; t<900; t++){
			var tx = rng()*W;
			var th = H*(0.07 + rng()*0.13);
			var ty = baseY + H*(0.04 + rng()*0.18);
			var tw = th*0.44;
			var tone2 = treeTone[Math.floor(rng()*treeTone.length)];

			(function(tx, ty, tw, th, tone2){
				atX(ctx, W, tx, function(c){
					c.fillStyle = tone2;
					c.beginPath();
					c.moveTo(0, ty - th);
					c.lineTo(tw, ty);
					c.lineTo(-tw, ty);
					c.closePath();
					c.fill();
				});
			})(tx, ty, tw, th, tone2);
		}

		// solid ground so the very bottom of the layer never shows a gap
		ctx.fillStyle = '#2a4d33';
		ctx.fillRect(0, H*0.93, W, H*0.07);
	}

	// =================================================================================
	// Vehicles, seen from behind
	// =================================================================================

	/**
	* Tail lamp colours, shared by every vehicle on the road.
	*
	* The traffic and the player are fitted with the same red glass on purpose: if the
	* base colour differs, the player's car reads as having a different kind of light
	* rather than as a car that simply is not braking. Braking lights that same lens up
	* instead of changing its colour - brighter, with a halo and a white hot centre.
	*/
	var LAMP = {
		top:    '#f4614a',
		mid:    '#d0241d',
		low:    '#7d1016',
		sheen:  'rgba(255,208,194,0.32)',

		litTop: '#ffbba4',
		litMid: '#ff3a24',
		litLow: '#ad1218',
		glow:   'rgba(255,72,48,0.90)',
		core:   'rgba(255,240,230,0.92)'
	};

	/**
	* Paints one tail lamp lens into a rounded rect.
	*/
	function lampLens(ctx, x, y, w, h, r, lit){
		var g = ctx.createLinearGradient(0, y, 0, y+h);

		g.addColorStop(0.00, lit ? LAMP.litTop : LAMP.top);
		g.addColorStop(0.42, lit ? LAMP.litMid : LAMP.mid);
		g.addColorStop(1.00, lit ? LAMP.litLow : LAMP.low);

		fillRR(ctx, x, y, w, h, r, g);
	}

	/**
	* The driver, seen through the rear window: a head with brown hair whose loose
	* strands lift in the wind.
	*
	*	phase = 0..1 position in the wind cycle, 0 is hair at rest
	*/
	function drawDriver(ctx, x, y, r, phase){
		var sway  = Math.sin(phase * Math.PI*2);
		var lift  = 0.5 - 0.5*Math.cos(phase * Math.PI*2);
		var drift = sway * r*0.06;			// the whole mop shifts a little

		// ---- shoulders, so the head is not floating in the window ----
		fillRR(ctx, x-r*1.35, y+r*0.70, r*2.7, r*1.8, r*0.50, '#2b323b');

		// ---- neck and ears: this is the back of the head, so very little skin shows ----
		var skin = ctx.createLinearGradient(0, y-r, 0, y+r);
		skin.addColorStop(0.00, '#f3d5b8');
		skin.addColorStop(1.00, '#c99a72');

		ctx.fillStyle = skin;
		fillRR(ctx, x-r*0.34, y+r*0.30, r*0.68, r*0.75, r*0.22, skin);

		[-1, 1].forEach(function(side){
			ctx.beginPath();
			ctx.ellipse(x + side*r*0.92, y + r*0.10, r*0.17, r*0.26, 0, 0, Math.PI*2);
			ctx.fillStyle = skin;
			ctx.fill();
		});

		// ---- the head itself, almost all of it hair from this angle ----
		var hair = ctx.createRadialGradient(x+r*0.30+drift, y-r*0.45, r*0.10, x, y, r*1.25);
		hair.addColorStop(0.00, '#a06d38');
		hair.addColorStop(0.40, '#7b4f23');
		hair.addColorStop(0.80, '#5a381a');
		hair.addColorStop(1.00, '#3c2410');

		ctx.beginPath();
		ctx.ellipse(x + drift*0.5, y - r*0.08, r*0.98, r*1.05, 0, 0, Math.PI*2);
		ctx.fillStyle = hair;
		ctx.fill();

		// clipped to the head: the parting, and a sheen where the sun catches it
		ctx.save();
		ctx.beginPath();
		ctx.ellipse(x + drift*0.5, y - r*0.08, r*0.98, r*1.05, 0, 0, Math.PI*2);
		ctx.clip();

		// strands running down from the crown, so the head reads as hair and not as a ball
		var crownX = x + r*0.18 + drift;
		var crownY = y - r*0.78;

		for (var t=0; t<15; t++){
			var f = t/14;
			var end = -Math.PI*0.98 + f*Math.PI*1.30;
			var wave = Math.sin((phase + f) * Math.PI*2) * r*0.05;

			ctx.strokeStyle = (t % 2)
				? 'rgba(52,31,13,0.45)'
				: 'rgba(178,124,62,0.35)';
			ctx.lineWidth = r*0.07;

			ctx.beginPath();
			ctx.moveTo(crownX, crownY);
			ctx.quadraticCurveTo(
				crownX + Math.cos(end)*r*0.75 + wave,
				crownY + Math.sin(end)*r*0.45 + r*0.45,
				x + Math.cos(end)*r*1.05 + wave,
				y + Math.sin(end)*r*1.05 - r*0.08
			);
			ctx.stroke();
		}

		// the parting, and a sheen where the sun catches the top
		ctx.strokeStyle = 'rgba(46,27,11,0.50)';
		ctx.lineWidth   = r*0.09;
		ctx.beginPath();
		ctx.moveTo(x - r*0.10 + drift, y - r*1.05);
		ctx.quadraticCurveTo(x + r*0.20 + drift, y - r*0.30, x + r*0.05 + drift, y + r*0.55);
		ctx.stroke();

		ctx.beginPath();
		ctx.ellipse(x + r*0.30 + drift, y - r*0.62, r*0.44, r*0.17, -0.38, 0, Math.PI*2);
		ctx.fillStyle = 'rgba(232,190,132,0.34)';
		ctx.fill();

		ctx.restore();

		// ---- loose strands lifting off in the airflow ----
		// They all sweep the same way, otherwise the head ends up wearing a crest.
		ctx.strokeStyle = 'rgba(96,60,26,0.9)';
		ctx.lineCap     = 'round';

		for (var s=0; s<8; s++){
			var a  = -Math.PI*1.02 + s*0.155;
			var sx = x + Math.cos(a)*r*0.88 + drift;
			var sy = y + Math.sin(a)*r*0.92 - r*0.08;

			// each strand trails the one before it, which makes the mop ripple
			var local = Math.sin((phase + s*0.06) * Math.PI*2);
			var wob   = local * r*(0.10 + s*0.022);
			var len   = r*(0.20 + 0.09*((s+1)%3)) * (0.85 + lift*0.30);

			ctx.lineWidth = r*(0.075 - s*0.003);
			ctx.beginPath();
			ctx.moveTo(sx, sy);
			ctx.quadraticCurveTo(sx - r*0.06 + wob*0.6, sy - len*0.80, sx - r*0.14 + wob*1.4, sy - len);
			ctx.stroke();
		}
	}

	/**
	* Draws one car. The shape is described in fractions of the canvas so that the same
	* routine can produce a low coupe, a saloon and a tall hatchback.
	*
	*	body		= paint colour
	*	hipW		= half width at the widest point, as a fraction of the canvas
	*	shoulderW	= half width where the glass starts
	*	roofW		= half width of the roof
	*	roofY		= top of the roof
	*	shoulderY	= boot lid height
	*	bodyBottom	= bottom edge of the painted body
	*	spoiler		= 'none' | 'lip' | 'wing'
	*	rails		= roof rails, for the tall one
	*	stripes		= centre racing stripes
	*/
	function drawCar(ctx, W, H, o){
		var cx     = W/2;
		var ground = H*0.965;

		var hipW  = W*o.hipW;
		var shldW = W*o.shoulderW;
		var roofW = W*o.roofW;

		var roofY = H*o.roofY;
		var shldY = H*o.shoulderY;
		var bodyB = H*o.bodyBottom;

		var body  = o.body;
		var glassTop = roofY + (shldY-roofY)*0.20;
		var glassBot = shldY - (shldY-roofY)*0.10;

		// ---- contact shadow ----
		groundShadow(ctx, cx, ground - H*0.005, hipW*1.30, H*0.055, 0.50);

		// ---- wheels, only the part below the body is visible ----
		var tyreW = W*0.115;
		var tyreT = bodyB - H*0.085;

		[-1, 1].forEach(function(side){
			var x = cx + side*hipW - ((side > 0) ? tyreW : 0);

			fillRR(ctx, x, tyreT, tyreW, ground - tyreT, tyreW*0.30, '#15161a');

			// a hint of sidewall and rim so the tyre is not a black blob
			ctx.fillStyle = 'rgba(255,255,255,0.10)';
			ctx.fillRect(x + tyreW*0.18, tyreT + (ground-tyreT)*0.30, tyreW*0.64, (ground-tyreT)*0.10);
			ctx.fillStyle = 'rgba(0,0,0,0.45)';
			ctx.fillRect(x, ground - (ground-tyreT)*0.16, tyreW, (ground-tyreT)*0.16);
		});

		// ---- body silhouette ----
		function bodyPath(c){
			c.beginPath();
			c.moveTo(cx-hipW*0.97, bodyB);
			c.lineTo(cx-hipW, bodyB - (bodyB-shldY)*0.45);
			c.quadraticCurveTo(cx-hipW, shldY, cx-shldW, shldY);
			c.quadraticCurveTo(cx-shldW*0.95, roofY + (shldY-roofY)*0.30, cx-roofW, roofY);
			c.quadraticCurveTo(cx, roofY - H*0.022, cx+roofW, roofY);
			c.quadraticCurveTo(cx+shldW*0.95, roofY + (shldY-roofY)*0.30, cx+shldW, shldY);
			c.quadraticCurveTo(cx+hipW, shldY, cx+hipW, bodyB - (bodyB-shldY)*0.45);
			c.lineTo(cx+hipW*0.97, bodyB);
			c.closePath();
		}

		var paint = ctx.createLinearGradient(0, roofY, 0, bodyB);
		paint.addColorStop(0.00, shade(body, 0.45));
		paint.addColorStop(0.22, shade(body, 0.14));
		paint.addColorStop(0.46, body);
		paint.addColorStop(0.74, shade(body, -0.20));
		paint.addColorStop(1.00, shade(body, -0.48));

		bodyPath(ctx);
		ctx.fillStyle = paint;
		ctx.fill();

		// everything from here on stays inside the body
		ctx.save();
		bodyPath(ctx);
		ctx.clip();

		// rounded flanks
		var round = ctx.createLinearGradient(cx-hipW, 0, cx+hipW, 0);
		round.addColorStop(0.00, 'rgba(0,0,0,0.45)');
		round.addColorStop(0.13, 'rgba(0,0,0,0.10)');
		round.addColorStop(0.30, 'rgba(255,255,255,0.13)');
		round.addColorStop(0.52, 'rgba(255,255,255,0.00)');
		round.addColorStop(0.80, 'rgba(0,0,0,0.10)');
		round.addColorStop(1.00, 'rgba(0,0,0,0.40)');
		ctx.fillStyle = round;
		ctx.fillRect(cx-hipW, roofY, hipW*2, bodyB-roofY);

		// sky reflected off the flat top of the boot lid
		var sheen = ctx.createLinearGradient(0, shldY - H*0.03, 0, shldY + H*0.06);
		sheen.addColorStop(0.0, 'rgba(255,255,255,0.30)');
		sheen.addColorStop(1.0, 'rgba(255,255,255,0)');
		ctx.fillStyle = sheen;
		ctx.fillRect(cx-hipW, shldY - H*0.03, hipW*2, H*0.09);

		// racing stripes
		if (o.stripes){
			ctx.fillStyle = 'rgba(22,22,26,0.88)';
			ctx.fillRect(cx - W*0.085, roofY, W*0.055, bodyB-roofY);
			ctx.fillRect(cx + W*0.030, roofY, W*0.055, bodyB-roofY);
		}

		ctx.restore();

		// ---- rear window ----
		var glassW  = roofW*0.94;
		var glassW2 = shldW*0.90;

		ctx.beginPath();
		ctx.moveTo(cx-glassW, glassTop);
		ctx.lineTo(cx+glassW, glassTop);
		ctx.quadraticCurveTo(cx+glassW2*0.99, glassBot - (glassBot-glassTop)*0.25, cx+glassW2, glassBot);
		ctx.lineTo(cx-glassW2, glassBot);
		ctx.quadraticCurveTo(cx-glassW2*0.99, glassBot - (glassBot-glassTop)*0.25, cx-glassW, glassTop);
		ctx.closePath();

		var glass = ctx.createLinearGradient(0, glassTop, 0, glassBot);
		glass.addColorStop(0.00, '#0e1a24');
		glass.addColorStop(0.45, '#223d52');
		glass.addColorStop(1.00, '#101d28');
		ctx.fillStyle = glass;
		ctx.fill();

		ctx.save();
		ctx.clip();

		// reflection sweeping across the glass
		ctx.fillStyle = 'rgba(190,222,248,0.20)';
		ctx.beginPath();
		ctx.moveTo(cx-glassW*1.2, glassBot);
		ctx.lineTo(cx-glassW*0.2, glassTop - H*0.02);
		ctx.lineTo(cx+glassW*0.3, glassTop - H*0.02);
		ctx.lineTo(cx-glassW*0.7, glassBot);
		ctx.closePath();
		ctx.fill();

		// head rests, and a driver for the player car
		ctx.fillStyle = 'rgba(10,12,16,0.80)';
		fillRR(ctx, cx-glassW2*0.62, glassBot-(glassBot-glassTop)*0.42, glassW2*0.44, (glassBot-glassTop)*0.50, glassW2*0.12, 'rgba(10,12,16,0.80)');
		fillRR(ctx, cx+glassW2*0.18, glassBot-(glassBot-glassTop)*0.42, glassW2*0.44, (glassBot-glassTop)*0.50, glassW2*0.12, 'rgba(10,12,16,0.80)');

		if (o.driver){
			drawDriver(
				ctx,
				cx - glassW2*0.38,
				glassBot - (glassBot-glassTop)*0.44,
				(glassBot-glassTop)*0.34,
				o.hairPhase || 0
			);
		}

		// roll bar behind the seats
		if (o.rollBar){
			ctx.strokeStyle = 'rgba(168,176,190,0.40)';
			ctx.lineWidth = (glassBot-glassTop)*0.07;
			ctx.beginPath();
			ctx.moveTo(cx-glassW2*0.70, glassBot);
			ctx.lineTo(cx-glassW2*0.70, glassTop + (glassBot-glassTop)*0.12);
			ctx.lineTo(cx+glassW2*0.70, glassTop + (glassBot-glassTop)*0.12);
			ctx.lineTo(cx+glassW2*0.70, glassBot);
			ctx.stroke();
		}

		ctx.restore();

		// bright edge along the top of the glass
		ctx.strokeStyle = 'rgba(255,255,255,0.28)';
		ctx.lineWidth   = Math.max(1, H*0.006);
		ctx.beginPath();
		ctx.moveTo(cx-glassW, glassTop);
		ctx.lineTo(cx+glassW, glassTop);
		ctx.stroke();

		// ---- boot lid shut line ----
		var lidY = shldY + (bodyB-shldY)*0.10;
		ctx.strokeStyle = 'rgba(0,0,0,0.32)';
		ctx.lineWidth   = Math.max(1, H*0.005);
		ctx.beginPath();
		ctx.moveTo(cx-hipW*0.92, lidY);
		ctx.lineTo(cx+hipW*0.92, lidY);
		ctx.stroke();
		ctx.strokeStyle = 'rgba(255,255,255,0.14)';
		ctx.beginPath();
		ctx.moveTo(cx-hipW*0.92, lidY + ctx.lineWidth*1.4);
		ctx.lineTo(cx+hipW*0.92, lidY + ctx.lineWidth*1.4);
		ctx.stroke();

		// ---- tail lights ----
		var lampH = (bodyB-shldY)*0.30;
		var lampW = hipW*0.52;
		var lampY = shldY + (bodyB-shldY)*0.26;

		// the lamps only light up under braking, so the traffic and a coasting player
		// both show the same unlit red glass
		var brakeOn = !!o.brakeOn;

		[-1, 1].forEach(function(side){
			var x = (side < 0) ? cx-hipW*0.94 : cx+hipW*0.94-lampW;

			// bezel
			fillRR(ctx, x-H*0.006, lampY-H*0.006, lampW+H*0.012, lampH+H*0.012, lampH*0.34, 'rgba(12,12,14,0.75)');

			if (brakeOn){
				withGlow(ctx, LAMP.glow, H*0.07, function(c){
					lampLens(c, x, lampY, lampW, lampH, lampH*0.30, true);
				});

				// white hot centre, which is what really sells a lit brake light
				fillRR(ctx, x+lampW*0.16, lampY+lampH*0.24, lampW*0.42, lampH*0.34, lampH*0.16, LAMP.core);
			}
			else {
				lampLens(ctx, x, lampY, lampW, lampH, lampH*0.30, false);

				// a reflection off the glass, so the lens does not read as a flat patch
				fillRR(ctx, x+lampW*0.16, lampY+lampH*0.22, lampW*0.42, lampH*0.26, lampH*0.13, LAMP.sheen);
			}

			// reversing lamp tucked on the inner end
			var rx = (side < 0) ? x+lampW*0.72 : x+lampW*0.06;
			fillRR(ctx, rx, lampY+lampH*0.20, lampW*0.22, lampH*0.44, lampH*0.14, 'rgba(240,246,255,0.75)');
		});

		// ---- number plate ----
		var plateW = W*0.20;
		var plateH = (bodyB-shldY)*0.24;
		var plateX = cx - plateW/2;
		var plateY = bodyB - (bodyB-shldY)*0.42;

		fillRR(ctx, plateX, plateY, plateW, plateH, plateH*0.16, '#e9edf1');
		ctx.strokeStyle = 'rgba(30,36,45,0.85)';
		ctx.lineWidth   = Math.max(1, H*0.004);
		rr(ctx, plateX, plateY, plateW, plateH, plateH*0.16);
		ctx.stroke();

		ctx.fillStyle    = '#232a33';
		ctx.font         = 'bold ' + Math.round(plateH*0.62) + 'px Arial, Helvetica, sans-serif';
		ctx.textAlign    = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(o.plate || 'JA-X', cx, plateY + plateH*0.56);

		// ---- lower valance, diffuser and exhausts ----
		var valT = bodyB - H*0.005;
		var valB = bodyB + H*0.075;

		fillRR(ctx, cx-hipW*0.90, valT, hipW*1.80, valB-valT, H*0.02, '#1e2126');

		ctx.fillStyle = 'rgba(255,255,255,0.08)';
		ctx.fillRect(cx-hipW*0.90, valT, hipW*1.80, H*0.008);

		// diffuser fins
		ctx.fillStyle = 'rgba(0,0,0,0.55)';
		for (var f=-2; f<=2; f++){
			ctx.fillRect(cx + f*hipW*0.24 - hipW*0.02, valT+H*0.012, hipW*0.04, (valB-valT)*0.72);
		}

		// exhaust tips
		[-1, 1].forEach(function(side){
			var ex = cx + side*hipW*0.62;
			var ey = valB - (valB-valT)*0.38;
			var er = H*0.020;

			ctx.beginPath();
			ctx.ellipse(ex, ey, er, er*0.72, 0, 0, Math.PI*2);
			ctx.fillStyle = '#9aa3ad';
			ctx.fill();

			ctx.beginPath();
			ctx.ellipse(ex, ey, er*0.62, er*0.44, 0, 0, Math.PI*2);
			ctx.fillStyle = '#14171b';
			ctx.fill();
		});

		// ---- spoiler ----
		if (o.spoiler === 'wing'){
			var wingY = shldY - H*0.055;
			var wingW = hipW*0.88;

			// struts
			ctx.fillStyle = '#22262c';
			ctx.fillRect(cx-wingW*0.55, wingY, W*0.030, H*0.075);
			ctx.fillRect(cx+wingW*0.55-W*0.030, wingY, W*0.030, H*0.075);

			// blade
			fillRR(ctx, cx-wingW, wingY-H*0.030, wingW*2, H*0.050, H*0.014, '#2b3038');
			ctx.fillStyle = 'rgba(255,255,255,0.20)';
			ctx.fillRect(cx-wingW, wingY-H*0.030, wingW*2, H*0.010);

			// end plates
			ctx.fillStyle = shade(body, -0.25);
			ctx.fillRect(cx-wingW-W*0.014, wingY-H*0.050, W*0.016, H*0.080);
			ctx.fillRect(cx+wingW-W*0.002, wingY-H*0.050, W*0.016, H*0.080);
		}
		else if (o.spoiler === 'lip'){
			fillRR(ctx, cx-shldW*1.02, shldY-H*0.030, shldW*2.04, H*0.040, H*0.014, shade(body, -0.12));
			ctx.fillStyle = 'rgba(255,255,255,0.22)';
			ctx.fillRect(cx-shldW*1.02, shldY-H*0.030, shldW*2.04, H*0.009);
		}

		// ---- roof rails on the tall one ----
		if (o.rails){
			ctx.fillStyle = '#2c3138';
			ctx.fillRect(cx-roofW*0.92, roofY-H*0.014, roofW*0.30, H*0.016);
			ctx.fillRect(cx+roofW*0.62, roofY-H*0.014, roofW*0.30, H*0.016);
		}

		// ---- outline, so the car still reads when it is ten pixels tall ----
		bodyPath(ctx);
		ctx.strokeStyle = 'rgba(0,0,0,0.55)';
		ctx.lineWidth   = Math.max(1.5, W*0.012);
		ctx.stroke();
	}

	/**
	* Draws one lorry: a box on wheels, seen from behind.
	*
	*	style = 'plain' | 'ribs' | 'curtain'
	*/
	function drawTruck(ctx, W, H, o){
		var cx     = W/2;
		var ground = H*0.975;

		var boxL = W*0.045, boxR = W*0.955;
		var boxT = H*0.045, boxB = H*0.760;
		var boxW = boxR - boxL;

		// ---- contact shadow ----
		groundShadow(ctx, cx, ground - H*0.004, boxW*0.62, H*0.030, 0.50);

		// ---- wheels, two on each side ----
		var tyreW = W*0.105;
		var tyreT = H*0.780;

		[[boxL+W*0.030, 0], [boxL+W*0.030+tyreW*1.06, 0], [boxR-W*0.030-tyreW*2.06, 0], [boxR-W*0.030-tyreW, 0]]
			.forEach(function(p){
				fillRR(ctx, p[0], tyreT, tyreW, ground-tyreT, tyreW*0.26, '#141519');
				ctx.fillStyle = 'rgba(255,255,255,0.08)';
				ctx.fillRect(p[0]+tyreW*0.18, tyreT+(ground-tyreT)*0.34, tyreW*0.64, (ground-tyreT)*0.09);
			});

		// ---- chassis rail between the wheels ----
		ctx.fillStyle = '#22262b';
		ctx.fillRect(boxL+W*0.02, H*0.775, boxW-W*0.04, H*0.055);

		// ---- mud flaps ----
		[-1, 1].forEach(function(side){
			var fw = W*0.15;
			var fx = (side < 0) ? boxL+W*0.020 : boxR-W*0.020-fw;

			fillRR(ctx, fx, H*0.845, fw, H*0.110, W*0.008, '#1a1c20');
			ctx.fillStyle = 'rgba(210,215,225,0.35)';
			ctx.fillRect(fx+fw*0.22, H*0.880, fw*0.56, H*0.030);
		});

		// ---- the box ----
		var shell = ctx.createLinearGradient(0, boxT, 0, boxB);
		shell.addColorStop(0.00, shade(o.body, 0.30));
		shell.addColorStop(0.30, shade(o.body, 0.06));
		shell.addColorStop(0.75, shade(o.body, -0.16));
		shell.addColorStop(1.00, shade(o.body, -0.38));

		fillRR(ctx, boxL, boxT, boxW, boxB-boxT, W*0.012, shell);

		ctx.save();
		rr(ctx, boxL, boxT, boxW, boxB-boxT, W*0.012);
		ctx.clip();

		// rounded flanks, same trick as on the cars
		var round = ctx.createLinearGradient(boxL, 0, boxR, 0);
		round.addColorStop(0.00, 'rgba(0,0,0,0.35)');
		round.addColorStop(0.16, 'rgba(0,0,0,0.06)');
		round.addColorStop(0.40, 'rgba(255,255,255,0.10)');
		round.addColorStop(0.72, 'rgba(0,0,0,0.04)');
		round.addColorStop(1.00, 'rgba(0,0,0,0.32)');
		ctx.fillStyle = round;
		ctx.fillRect(boxL, boxT, boxW, boxB-boxT);

		// ---- the two rear doors ----
		var doorInset = W*0.030;
		var doorT = boxT + H*0.030;
		var doorB = boxB - H*0.045;

		[-1, 1].forEach(function(side){
			var dw = (boxW/2) - doorInset*1.5;
			var dx = (side < 0) ? boxL+doorInset : cx + doorInset*0.5;

			ctx.strokeStyle = 'rgba(0,0,0,0.35)';
			ctx.lineWidth   = Math.max(1, W*0.006);
			rr(ctx, dx, doorT, dw, doorB-doorT, W*0.008);
			ctx.stroke();

			ctx.strokeStyle = 'rgba(255,255,255,0.14)';
			rr(ctx, dx+ctx.lineWidth, doorT+ctx.lineWidth, dw, doorB-doorT, W*0.008);
			ctx.stroke();

			// corrugated container panels
			if (o.style === 'ribs'){
				ctx.fillStyle = 'rgba(0,0,0,0.16)';
				for (var i=1; i<9; i++){
					ctx.fillRect(dx + (dw/9)*i, doorT, W*0.010, doorB-doorT);
				}
				ctx.fillStyle = 'rgba(255,255,255,0.10)';
				for (i=1; i<9; i++){
					ctx.fillRect(dx + (dw/9)*i + W*0.010, doorT, W*0.005, doorB-doorT);
				}
			}

			// tarpaulin with tension straps
			if (o.style === 'curtain'){
				ctx.fillStyle = 'rgba(0,0,0,0.10)';
				for (var s=1; s<5; s++){
					ctx.fillRect(dx, doorT + ((doorB-doorT)/5)*s, dw, H*0.008);
				}
				ctx.fillStyle = 'rgba(255,255,255,0.12)';
				for (s=1; s<5; s++){
					ctx.fillRect(dx, doorT + ((doorB-doorT)/5)*s - H*0.006, dw, H*0.005);
				}
			}

			// hinges and the locking bars
			ctx.fillStyle = '#b9c0c9';
			var barX = (side < 0) ? dx+dw*0.10 : dx+dw*0.84;
			ctx.fillRect(barX, doorT+H*0.020, W*0.014, (doorB-doorT)-H*0.040);

			ctx.fillStyle = '#8f979f';
			for (var hgy=0; hgy<3; hgy++){
				var hy = doorT + (doorB-doorT)*(0.16 + hgy*0.32);
				ctx.fillRect(barX-W*0.008, hy, W*0.030, H*0.022);
			}
		});

		// ---- livery panel across the top of the box ----
		if (o.panel){
			ctx.fillStyle = o.panel;
			ctx.fillRect(boxL, boxT+H*0.030, boxW, H*0.115);

			ctx.fillStyle    = o.panelInk || '#ffffff';
			ctx.font         = 'bold ' + Math.round(H*0.075) + 'px Arial, Helvetica, sans-serif';
			ctx.textAlign    = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(o.text || 'HAULAGE', cx, boxT+H*0.090);
		}

		// ---- road dirt thrown up the back ----
		var dirt = ctx.createLinearGradient(0, boxB, 0, boxT + (boxB-boxT)*0.35);
		dirt.addColorStop(0.00, 'rgba(74,63,46,0.45)');
		dirt.addColorStop(0.45, 'rgba(74,63,46,0.16)');
		dirt.addColorStop(1.00, 'rgba(74,63,46,0)');
		ctx.fillStyle = dirt;
		ctx.fillRect(boxL, boxT, boxW, boxB-boxT);

		ctx.restore();

		// ---- top rail with marker lamps ----
		fillRR(ctx, boxL, boxT-H*0.012, boxW, H*0.028, W*0.008, '#3a4048');
		ctx.fillStyle = 'rgba(255,255,255,0.18)';
		ctx.fillRect(boxL, boxT-H*0.012, boxW, H*0.007);

		for (var m=0; m<5; m++){
			var mx = boxL + boxW*(0.08 + m*0.21);

			withGlow(ctx, 'rgba(255,180,60,0.75)', H*0.030, function(c){
				c.beginPath();
				c.arc(mx, boxT-H*0.001, W*0.014, 0, Math.PI*2);
				c.fillStyle = '#ffb23c';
				c.fill();
			});
		}

		// ---- corner posts ----
		ctx.fillStyle = 'rgba(255,255,255,0.16)';
		ctx.fillRect(boxL, boxT, W*0.014, boxB-boxT);
		ctx.fillStyle = 'rgba(0,0,0,0.22)';
		ctx.fillRect(boxR-W*0.014, boxT, W*0.014, boxB-boxT);

		// ---- rear light clusters ----
		[-1, 1].forEach(function(side){
			var lw = W*0.105;
			var lh = H*0.055;
			var lx = (side < 0) ? boxL+W*0.030 : boxR-W*0.030-lw;
			var ly = boxB - H*0.070;

			fillRR(ctx, lx-W*0.006, ly-H*0.006, lw+W*0.012, lh+H*0.012, W*0.010, 'rgba(14,14,16,0.85)');

			// same red glass as the cars, and unlit for the same reason
			lampLens(ctx, lx, ly, lw*0.52, lh, W*0.008, false);
			fillRR(ctx, lx+lw*0.08, ly+lh*0.18, lw*0.26, lh*0.28, W*0.006, LAMP.sheen);

			fillRR(ctx, lx+lw*0.56, ly, lw*0.20, lh, W*0.006, '#ffae2e');
			fillRR(ctx, lx+lw*0.80, ly, lw*0.20, lh, W*0.006, '#eef3fa');
		});

		// ---- under-run bar with hazard chevrons ----
		var barY = H*0.840;
		var barH = H*0.048;
		var barL = boxL + W*0.16;
		var barW = boxW - W*0.32;

		// brackets
		ctx.fillStyle = '#2a2e34';
		ctx.fillRect(barL+barW*0.10, H*0.790, W*0.026, barY-H*0.790);
		ctx.fillRect(barL+barW*0.86, H*0.790, W*0.026, barY-H*0.790);

		fillRR(ctx, barL, barY, barW, barH, W*0.008, '#e8ebee');

		ctx.save();
		rr(ctx, barL, barY, barW, barH, W*0.008);
		ctx.clip();

		ctx.fillStyle = '#cf2b25';
		for (var s2=-1; s2<barW/(W*0.10)+1; s2++){
			ctx.beginPath();
			ctx.moveTo(barL + s2*W*0.10,            barY);
			ctx.lineTo(barL + s2*W*0.10 + W*0.05,   barY);
			ctx.lineTo(barL + s2*W*0.10 + W*0.05 - barH, barY+barH);
			ctx.lineTo(barL + s2*W*0.10 - barH,     barY+barH);
			ctx.closePath();
			ctx.fill();
		}

		ctx.fillStyle = 'rgba(0,0,0,0.20)';
		ctx.fillRect(barL, barY+barH*0.70, barW, barH*0.30);
		ctx.restore();

		// ---- outline ----
		rr(ctx, boxL, boxT, boxW, boxB-boxT, W*0.012);
		ctx.strokeStyle = 'rgba(0,0,0,0.50)';
		ctx.lineWidth   = Math.max(1.5, W*0.011);
		ctx.stroke();
	}

	// =================================================================================
	// Roadside scenery
	// =================================================================================

	/**
	* Conifer: a stack of branch tiers with a jagged lower edge on each one.
	*/
	function drawPine(ctx, W, H){
		var rng = makeRng(9182736);
		var cx  = W/2;
		var ground = H*0.995;

		groundShadow(ctx, cx, ground - H*0.004, W*0.30, H*0.014, 0.40);

		// trunk
		var trunk = ctx.createLinearGradient(cx-W*0.05, 0, cx+W*0.05, 0);
		trunk.addColorStop(0.00, '#4a3423');
		trunk.addColorStop(0.55, '#6b4b31');
		trunk.addColorStop(1.00, '#3c2a1c');
		ctx.fillStyle = trunk;
		ctx.fillRect(cx-W*0.045, H*0.70, W*0.09, ground-H*0.70);

		var tiers = 6;

		for (var t=0; t<tiers; t++){
			var f  = t/(tiers-1);					// 0 at the top
			var ty = H*(0.06 + f*0.66);				// tip of this tier
			var th = H*(0.20 + f*0.06);				// how far down it reaches
			var tw = W*(0.13 + f*0.36);				// half width at the bottom

			var green = mix('#4f8c3a', '#2c5a2a', f*0.7);

			// the tier itself, lit from the upper right
			var g = ctx.createLinearGradient(cx-tw, ty, cx+tw, ty+th);
			g.addColorStop(0.00, shade(green, -0.30));
			g.addColorStop(0.45, green);
			g.addColorStop(1.00, shade(green, 0.22));

			ctx.beginPath();
			ctx.moveTo(cx, ty);

			// jagged right edge going down
			var steps = 7;
			for (var i=1; i<=steps; i++){
				var p = i/steps;
				var ex = cx + tw*p;
				var ey = ty + th*p;
				ctx.lineTo(ex, ey - th*0.05*rng());
				ctx.lineTo(ex + tw*0.05, ey + th*0.06);
			}

			ctx.lineTo(cx + tw*0.35, ty + th*0.92);
			ctx.lineTo(cx - tw*0.35, ty + th*0.92);

			// jagged left edge going back up
			for (i=steps; i>=1; i--){
				var p2 = i/steps;
				var ex2 = cx - tw*p2;
				var ey2 = ty + th*p2;
				ctx.lineTo(ex2 - tw*0.05, ey2 + th*0.06);
				ctx.lineTo(ex2, ey2 - th*0.05*rng());
			}

			ctx.closePath();
			ctx.fillStyle = g;
			ctx.fill();

			// shadow cast by the tier above, kept inside this tier's own outline
			ctx.save();
			ctx.clip();
			ctx.fillStyle = 'rgba(20,44,26,0.30)';
			ctx.fillRect(cx-tw, ty, tw*2, th*0.16);
			ctx.restore();
		}

		// a few sunlit needles picked out on the right
		ctx.strokeStyle = 'rgba(190,225,140,0.35)';
		ctx.lineWidth   = Math.max(1, W*0.006);

		for (var n=0; n<26; n++){
			var sx = cx + W*(0.04 + rng()*0.34);
			var sy = H*(0.12 + rng()*0.70);
			ctx.beginPath();
			ctx.moveTo(sx, sy);
			ctx.lineTo(sx + W*0.035, sy + H*0.018);
			ctx.stroke();
		}
	}

	/**
	* Broadleaf tree: a canopy of overlapping clumps with a lit top and a shaded belly.
	*/
	function drawOak(ctx, W, H){
		var rng = makeRng(5544332);
		var cx  = W/2;
		var ground = H*0.995;

		groundShadow(ctx, cx, ground - H*0.004, W*0.34, H*0.018, 0.40);

		// trunk with a couple of limbs
		ctx.strokeStyle = '#5b402a';
		ctx.lineCap     = 'round';

		ctx.lineWidth = W*0.085;
		ctx.beginPath();
		ctx.moveTo(cx, ground);
		ctx.lineTo(cx - W*0.01, H*0.60);
		ctx.stroke();

		ctx.lineWidth = W*0.050;
		ctx.beginPath();
		ctx.moveTo(cx - W*0.01, H*0.66);
		ctx.lineTo(cx - W*0.16, H*0.50);
		ctx.moveTo(cx - W*0.01, H*0.68);
		ctx.lineTo(cx + W*0.15, H*0.50);
		ctx.stroke();

		// bark shading
		ctx.strokeStyle = 'rgba(0,0,0,0.22)';
		ctx.lineWidth   = W*0.025;
		ctx.beginPath();
		ctx.moveTo(cx - W*0.025, ground);
		ctx.lineTo(cx - W*0.030, H*0.62);
		ctx.stroke();

		// ---------------------------------------------------------------------------------
		// Canopy. The outline is one filled path made of overlapping clumps, so the tree
		// reads as a single leafy mass; drawing the clumps one at a time just produces a
		// heap of visible circles.
		// ---------------------------------------------------------------------------------
		var clumps = [];
		var i;

		for (i=0; i<18; i++){
			var a = (i/18)*Math.PI*2 + rng()*0.35;
			var d = 0.06 + rng()*0.22;

			clumps.push({
				x: cx + Math.cos(a)*W*d,
				y: H*0.35 + Math.sin(a)*H*d*0.92,
				r: W*(0.135 + rng()*0.075)
			});
		}

		ctx.beginPath();
		for (i=0; i<clumps.length; i++){
			ctx.moveTo(clumps[i].x + clumps[i].r, clumps[i].y);
			ctx.arc(clumps[i].x, clumps[i].y, clumps[i].r, 0, Math.PI*2);
		}

		var leaf = ctx.createLinearGradient(0, H*0.05, 0, H*0.62);
		leaf.addColorStop(0.00, '#7bbb4c');
		leaf.addColorStop(0.40, '#4d9139');
		leaf.addColorStop(0.78, '#2f6b30');
		leaf.addColorStop(1.00, '#1d4a26');
		ctx.fillStyle = leaf;
		ctx.fill();

		// shading and foliage texture, all kept inside the canopy
		ctx.save();
		ctx.clip();

		// sunlight from the upper right
		var sun = ctx.createLinearGradient(cx-W*0.4, H*0.55, cx+W*0.4, H*0.05);
		sun.addColorStop(0.00, 'rgba(12,40,20,0.35)');
		sun.addColorStop(0.55, 'rgba(12,40,20,0.00)');
		sun.addColorStop(1.00, 'rgba(214,246,150,0.32)');
		ctx.fillStyle = sun;
		ctx.fillRect(0, 0, W, H);

		// soft clumps of leaves, light on top and dark underneath
		for (i=0; i<70; i++){
			var lx = cx + (rng()*2-1)*W*0.42;
			var ly = H*(0.06 + rng()*0.52);
			var lr = W*(0.035 + rng()*0.070);
			var up = ly < H*0.34;

			var g2 = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
			g2.addColorStop(0.0, up ? 'rgba(190,230,120,0.30)' : 'rgba(18,48,26,0.28)');
			g2.addColorStop(1.0, up ? 'rgba(190,230,120,0)'    : 'rgba(18,48,26,0)');

			ctx.fillStyle = g2;
			ctx.beginPath();
			ctx.arc(lx, ly, lr, 0, Math.PI*2);
			ctx.fill();
		}

		ctx.restore();
	}

	/**
	* Roadside billboard on two posts.
	*/
	function drawBillboard(ctx, W, H, o){
		var cx = W/2;
		var ground = H*0.995;

		var frameT = H*0.06;
		var frameB = H*0.62;
		var frameL = W*0.06;
		var frameR = W*0.94;

		groundShadow(ctx, cx, ground - H*0.004, W*0.30, H*0.016, 0.35);

		// posts
		[cx - W*0.24, cx + W*0.24].forEach(function(px){
			var g = ctx.createLinearGradient(px-W*0.035, 0, px+W*0.035, 0);
			g.addColorStop(0.00, '#4e555d');
			g.addColorStop(0.50, '#79828c');
			g.addColorStop(1.00, '#3b4148');
			ctx.fillStyle = g;
			ctx.fillRect(px-W*0.035, frameB-H*0.02, W*0.07, ground-frameB+H*0.02);
		});

		// cross brace
		ctx.strokeStyle = '#5c646d';
		ctx.lineWidth   = W*0.022;
		ctx.beginPath();
		ctx.moveTo(cx-W*0.24, H*0.92);
		ctx.lineTo(cx+W*0.24, H*0.74);
		ctx.moveTo(cx+W*0.24, H*0.92);
		ctx.lineTo(cx-W*0.24, H*0.74);
		ctx.stroke();

		// board
		fillRR(ctx, frameL, frameT, frameR-frameL, frameB-frameT, W*0.012, '#2b3138');

		var inset = W*0.022;
		var px0 = frameL+inset, py0 = frameT+inset;
		var pw  = (frameR-frameL)-inset*2, ph = (frameB-frameT)-inset*2;

		ctx.save();
		rr(ctx, px0, py0, pw, ph, W*0.006);
		ctx.clip();

		if (o.poster === 'arcade'){
			var sky = ctx.createLinearGradient(0, py0, 0, py0+ph);
			sky.addColorStop(0.00, '#2b1a5e');
			sky.addColorStop(0.45, '#a4327a');
			sky.addColorStop(0.78, '#f4713f');
			sky.addColorStop(1.00, '#ffc861');
			ctx.fillStyle = sky;
			ctx.fillRect(px0, py0, pw, ph);

			// sun disc with the classic cut out bands
			ctx.fillStyle = '#ffd45e';
			ctx.beginPath();
			ctx.arc(px0+pw*0.5, py0+ph*0.62, ph*0.34, 0, Math.PI*2);
			ctx.fill();

			ctx.fillStyle = '#a4327a';
			for (var b=0; b<5; b++){
				ctx.fillRect(px0, py0+ph*(0.60 + b*0.085), pw, ph*0.030 + b*ph*0.006);
			}

			ctx.fillStyle    = '#ffffff';
			ctx.font         = 'bold ' + Math.round(ph*0.26) + 'px Arial, Helvetica, sans-serif';
			ctx.textAlign    = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText("JA-X'S", px0+pw*0.5, py0+ph*0.26);
			ctx.font         = 'bold ' + Math.round(ph*0.20) + 'px Arial, Helvetica, sans-serif';
			ctx.fillText('ARCADE', px0+pw*0.5, py0+ph*0.47);
		}
		else {
			// chequered flag poster
			ctx.fillStyle = '#f3f5f7';
			ctx.fillRect(px0, py0, pw, ph);

			var cells = 10;
			var cw = pw/cells, chh = ph/5;

			ctx.fillStyle = '#20242a';
			for (var y=0; y<5; y++){
				for (var x=0; x<cells; x++){
					if ((x+y)%2) ctx.fillRect(px0+x*cw, py0+y*chh, cw, chh);
				}
			}

			fillRR(ctx, px0+pw*0.08, py0+ph*0.30, pw*0.84, ph*0.40, ph*0.06, '#d81f26');

			ctx.fillStyle    = '#ffffff';
			ctx.font         = 'bold ' + Math.round(ph*0.28) + 'px Arial, Helvetica, sans-serif';
			ctx.textAlign    = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText('RACER', px0+pw*0.5, py0+ph*0.51);
		}

		// paper sheen
		var sheen = ctx.createLinearGradient(px0, py0, px0+pw, py0+ph);
		sheen.addColorStop(0.00, 'rgba(255,255,255,0.16)');
		sheen.addColorStop(0.40, 'rgba(255,255,255,0.00)');
		sheen.addColorStop(1.00, 'rgba(0,0,0,0.14)');
		ctx.fillStyle = sheen;
		ctx.fillRect(px0, py0, pw, ph);

		ctx.restore();

		// frame highlight and lamp bar
		ctx.strokeStyle = 'rgba(255,255,255,0.22)';
		ctx.lineWidth   = Math.max(1, W*0.006);
		rr(ctx, frameL, frameT, frameR-frameL, frameB-frameT, W*0.012);
		ctx.stroke();

		ctx.fillStyle = '#454c55';
		ctx.fillRect(frameL+W*0.10, frameT-H*0.028, (frameR-frameL)-W*0.20, H*0.016);

		for (var l=0; l<3; l++){
			var lx = frameL + (frameR-frameL)*(0.25 + l*0.25);

			withGlow(ctx, 'rgba(255,238,170,0.7)', H*0.020, function(c){
				c.beginPath();
				c.arc(lx, frameT-H*0.020, W*0.020, 0, Math.PI*2);
				c.fillStyle = '#fff0b8';
				c.fill();
			});
		}
	}

	/**
	* Road sign on a post.
	*	kind = 'chevron' | 'warning'
	*/
	function drawSign(ctx, W, H, kind){
		var cx = W/2;
		var ground = H*0.995;

		groundShadow(ctx, cx, ground - H*0.004, W*0.55, H*0.012, 0.35);

		// post
		var post = ctx.createLinearGradient(cx-W*0.07, 0, cx+W*0.07, 0);
		post.addColorStop(0.00, '#4b525a');
		post.addColorStop(0.45, '#8b949e');
		post.addColorStop(1.00, '#3a4046');
		ctx.fillStyle = post;
		ctx.fillRect(cx-W*0.07, H*0.40, W*0.14, ground-H*0.40);

		if (kind === 'chevron'){
			var bw = W*0.86, bh = H*0.34;
			var bx = cx-bw/2, by = H*0.06;

			fillRR(ctx, bx-W*0.03, by-H*0.012, bw+W*0.06, bh+H*0.024, W*0.05, '#20242a');
			fillRR(ctx, bx, by, bw, bh, W*0.04, '#ffd21f');

			// two arrows pointing right
			ctx.fillStyle = '#1b1f24';
			for (var a=0; a<2; a++){
				var ax = bx + bw*(0.18 + a*0.36);

				ctx.beginPath();
				ctx.moveTo(ax, by+bh*0.20);
				ctx.lineTo(ax+bw*0.24, by+bh*0.50);
				ctx.lineTo(ax, by+bh*0.80);
				ctx.lineTo(ax+bw*0.06, by+bh*0.50);
				ctx.closePath();
				ctx.fill();
			}
		}
		else {
			var r = W*0.46;
			var cyv = H*0.24;

			// warning triangle
			function tri(c, scale, style){
				c.beginPath();
				c.moveTo(cx, cyv - r*scale);
				c.lineTo(cx + r*0.92*scale, cyv + r*0.72*scale);
				c.lineTo(cx - r*0.92*scale, cyv + r*0.72*scale);
				c.closePath();
				c.fillStyle = style;
				c.fill();
			}

			tri(ctx, 1.00, '#20242a');
			tri(ctx, 0.90, '#d61f26');
			tri(ctx, 0.72, '#f5f7f9');

			// a bend drawn inside it
			ctx.strokeStyle = '#1b1f24';
			ctx.lineWidth   = W*0.09;
			ctx.lineCap     = 'round';
			ctx.lineJoin    = 'round';
			ctx.beginPath();
			ctx.moveTo(cx - r*0.20, cyv + r*0.40);
			ctx.lineTo(cx - r*0.20, cyv + r*0.02);
			ctx.lineTo(cx + r*0.22, cyv - r*0.16);
			ctx.stroke();
		}

		// reflective sheen
		ctx.fillStyle = 'rgba(255,255,255,0.10)';
		ctx.fillRect(cx-W*0.5, H*0.06, W, H*0.06);
	}

	// =================================================================================
	// Texture plumbing
	// =================================================================================

	/**
	* The player's car is the only sprite that changes while the game runs: its brake
	* lights go out under acceleration and the driver's hair moves. Rather than redraw
	* the car every frame, every combination is drawn once at boot and the sprite is
	* simply pointed at the right one.
	*/
	var PLAYER_HAIR_FRAMES = 6;

	function playerKey(brakeOn, hairFrame){
		return 'player_' + (brakeOn ? 'b1' : 'b0') + '_h' +
		       (((hairFrame % PLAYER_HAIR_FRAMES) + PLAYER_HAIR_FRAMES) % PLAYER_HAIR_FRAMES);
	}

	/**
	* Creates a canvas texture and hands its context to the drawing routine.
	*/
	function texture(scene, key, w, h, draw){
		if (scene.textures.exists(key)) return;

		var tex = scene.textures.createCanvas(key, w, h);
		if (!tex) return;

		var ctx = tex.context;

		ctx.save();
		draw(ctx, w, h);
		ctx.restore();

		tex.refresh();
	}

	// =================================================================================
	// Public entry point
	// =================================================================================

	return {

		// how many steps there are in the driver's hair animation
		hairFrames: PLAYER_HAIR_FRAMES,

		/**
		* Texture key of the player's car for a given brake light and hair state.
		*/
		playerKey: playerKey,

		/**
		* Draws every texture the game needs. Called from the scene preload, so that all
		* keys exist by the time create() starts building sprites.
		*
		* The parallax layers are power of two sized on purpose: Phaser copies a tile
		* sprite source into a power of two buffer, so matching that size keeps them sharp.
		*/
		generate: function(scene){
			// ---- background ----
			texture(scene, 'imgBack',  SCREEN_W, SCREEN_H, drawSkyBase);
			texture(scene, 'imgSky',   4096, 512, drawClouds);
			texture(scene, 'imgHills', 4096, 256, drawMountains);
			texture(scene, 'imgCity',  4096, 256, drawTown);

			// ---- the player's car, one frame per brake light and hair state ----
			for (var brake=0; brake<2; brake++){
				for (var frame=0; frame<PLAYER_HAIR_FRAMES; frame++){
					(function(brakeOn, hairFrame){
						texture(scene, playerKey(brakeOn, hairFrame), 560, 360, function(ctx, w, h){
							drawCar(ctx, w, h, {
								body:       '#ffc400',
								hipW:       0.455,
								shoulderW:  0.410,
								roofW:      0.255,
								roofY:      0.150,
								shoulderY:  0.500,
								bodyBottom: 0.860,
								spoiler:    'wing',
								stripes:    true,
								rollBar:    true,
								driver:     true,
								hairPhase:  hairFrame / PLAYER_HAIR_FRAMES,
								brakeOn:    brakeOn,
								plate:      'JAX-1'
							});
						});
					})(brake === 1, frame);
				}
			}

			// ---- traffic ----
			texture(scene, 'carSport', 512, 384, function(ctx, w, h){
				drawCar(ctx, w, h, {
					body:       '#d5241f',
					hipW:       0.460,
					shoulderW:  0.415,
					roofW:      0.250,
					roofY:      0.185,
					shoulderY:  0.520,
					bodyBottom: 0.855,
					spoiler:    'lip',
					plate:      'RC 88'
				});
			});

			texture(scene, 'carSedan', 512, 384, function(ctx, w, h){
				drawCar(ctx, w, h, {
					body:       '#2f6fd0',
					hipW:       0.440,
					shoulderW:  0.400,
					roofW:      0.285,
					roofY:      0.115,
					shoulderY:  0.470,
					bodyBottom: 0.850,
					spoiler:    'none',
					plate:      'SD 42'
				});
			});

			texture(scene, 'carHatch', 512, 384, function(ctx, w, h){
				drawCar(ctx, w, h, {
					body:       '#e8e9ec',
					hipW:       0.430,
					shoulderW:  0.405,
					roofW:      0.330,
					roofY:      0.075,
					shoulderY:  0.420,
					bodyBottom: 0.850,
					spoiler:    'none',
					rails:      true,
					plate:      'HB 07'
				});
			});

			texture(scene, 'truckBox', 460, 620, function(ctx, w, h){
				drawTruck(ctx, w, h, {
					body:      '#c3352c',
					style:     'plain',
					panel:     '#f2f4f6',
					panelInk:  '#c3352c',
					text:      'HAULAGE'
				});
			});

			texture(scene, 'truckContainer', 460, 620, function(ctx, w, h){
				drawTruck(ctx, w, h, {
					body:  '#2e6f8e',
					style: 'ribs'
				});
			});

			texture(scene, 'truckCurtain', 460, 620, function(ctx, w, h){
				drawTruck(ctx, w, h, {
					body:      '#4c5560',
					style:     'curtain',
					panel:     '#2bb07a',
					panelInk:  '#08301f',
					text:      'FREIGHT'
				});
			});

			// ---- roadside ----
			texture(scene, 'treePine', 480, 640, drawPine);
			texture(scene, 'treeOak',  512, 520, drawOak);

			texture(scene, 'billboardArcade', 560, 520, function(ctx, w, h){
				drawBillboard(ctx, w, h, {poster: 'arcade'});
			});

			texture(scene, 'billboardRacer', 560, 520, function(ctx, w, h){
				drawBillboard(ctx, w, h, {poster: 'flag'});
			});

			texture(scene, 'signCurve', 240, 480, function(ctx, w, h){
				drawSign(ctx, w, h, 'chevron');
			});

			texture(scene, 'signWarn', 240, 480, function(ctx, w, h){
				drawSign(ctx, w, h, 'warning');
			});
		}
	};

})();
