/***********************************************************************************
* Small math helpers shared by the road builder, the player and the traffic.
***********************************************************************************/

const Util = {

	limit: function(value, min, max){
		return Math.max(min, Math.min(value, max));
	},

	interpolate: function(a, b, percent){
		return a + (b - a) * percent;
	},

	easeIn: function(a, b, percent){
		return a + (b - a) * Math.pow(percent, 2);
	},

	easeOut: function(a, b, percent){
		return a + (b - a) * (1 - Math.pow(1 - percent, 2));
	},

	easeInOut: function(a, b, percent){
		return a + (b - a) * (-Math.cos(percent * Math.PI) / 2 + 0.5);
	},

	randomInt: function(min, max){
		return Math.round(Util.interpolate(min, max, Math.random()));
	},

	randomChoice: function(options){
		return options[Util.randomInt(0, options.length - 1)];
	},

	/**
	* Wraps a position into [0, max).
	*/
	wrap: function(value, max){
		while (value >= max) value -= max;
		while (value < 0)    value += max;
		return value;
	},

	/**
	* True when two objects, given as center + width, overlap each other.
	* "tolerance" shrinks (or grows) the hit boxes, 1 = exact widths.
	*/
	overlap: function(x1, w1, x2, w2, tolerance){
		var half = (tolerance === undefined ? 1 : tolerance) / 2;

		var min1 = x1 - (w1 * half);
		var max1 = x1 + (w1 * half);
		var min2 = x2 - (w2 * half);
		var max2 = x2 + (w2 * half);

		return !((max1 < min2) || (min1 > max2));
	},

	/**
	* Formats seconds as m:ss.
	*/
	formatTime: function(seconds){
		var s = Math.max(0, Math.ceil(seconds));
		var m = Math.floor(s / 60);
		s = s % 60;
		return m + ':' + (s < 10 ? '0' : '') + s;
	}
};
