import { requestAnimFrame } from 'animation';

var Inertia = (function () {
	function Inertia(value, mass, callback) {
		var _ = this;
		mass = mass ? mass : 1;

		_.value = value;
		_.targetVal = value;

		_.callback = callback;
		_.mass = mass;

		_.run();
	}

	return Inertia;
}());

Inertia.prototype = {
	run: function () {
		var _ = this;

		var fps = 120, now, then = Date.now(), interval = 1000 / fps, delta;

		var cycle = function () {
			requestAnimFrame(cycle);
			now = Date.now();
			delta = now - then;

			if (delta > interval) {
				then = Date.now();
				_.update();
			}
		}

		requestAnimFrame(cycle);
	},

	update: function () {
		var _ = this;	
		var force = _.targetVal - _.value;
		_.value += force / _.mass
		_.callback(_.value);
	},

	set: function (val) {
		this.targetVal = val;
  },

  setMass: function (val) {
    this.mass = val;
  }
}

export default Inertia;
