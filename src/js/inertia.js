import { requestAnimFrame } from './animation';

var Inertia = (function () {
    function Inertia(value, mass, callback = () => { }) {
        mass = mass ? mass : 1;

        this.value = value;
        this.targetVal = value;

        this.callback = callback;
        this.mass = mass;

        this.run();
    }

    return Inertia;
}());

Inertia.prototype = {
    run: function () {
        var _ = this;

        var fps = 60, now, then = Date.now(), interval = 1000 / fps, delta;

        var cycle = function () {
            requestAnimFrame(cycle);
            now = Date.now();
            delta = now - then;

            if (delta > interval) {
                then = Date.now();
                _.update(delta / 1000);
            }
        }

        requestAnimFrame(cycle);
    },

    update: function (dt) {
        var _ = this;
        var force = _.targetVal - _.value;
        _.value += (force / _.mass) * Math.min(dt, 1);
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