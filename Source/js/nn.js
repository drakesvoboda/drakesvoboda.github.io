
import { throttle, debounce } from 'throttle';
import Clock from 'clock';

import { create, all } from 'mathjs'

const math = create(all);

function colorFromCSSClass(className) {
	var tmp = document.createElement("div"), color;
	tmp.style.cssText = "position:fixed;left:-100px;top:-100px;width:1px;height:1px";
	tmp.className = className;
	document.body.appendChild(tmp);  // required in some browsers
	color = getComputedStyle(tmp).getPropertyValue("color");
	document.body.removeChild(tmp);
	return color;
}

function dot(matrix, vector) {
	var result = new Array(matrix.length).fill(0).map(row => new Array(vector.length).fill(0));

	return result.map((row, i) => {
		return row.map((val, j) => {
			return matrix[i][j] * vector[j];
		});
	});
}

function reduce_rows(matrix) {
	return matrix.map((row, i) => {
		return row.reduce((sum, val) => sum + val);
	});
}

function softmax(arr) {
	return arr.map(function (value, index) {
		return Math.exp(value) / arr.map(function (y /*value*/) { return Math.exp(y) }).reduce(function (a, b) { return a + b })
	})
}

function bound(val, min, max) {
	return Math.max(Math.min(val, max), min);
}

var hot_range = 50;

var Neuron = (function () {
	function Neuron(x, y, activation) {
		this.x = x;
		this.y = y;

		this.base_x = x;
		this.base_y = y;

		this.activation = 0;
		this.target_act = 0;
	}

	Neuron.prototype = {
		setActivation: function (activation) {
			this.activation = activation;
		},

		boundsCheck: function (x, y) {
			var half = Neuron.width / 2;

			return this.x - half <= x && x <= this.x + half &&
				this.y - half <= y && y <= this.y + half
		},

		move: function (dt, mouse_x, mouse_y) {
			dt = Math.min(dt, 1);

			var v_act = this.target_act - this.activation;

			this.activation += bound(v_act, -0.1, 0.1) * bound(dt, 1, 1);

			//var VB = this.velocityBase();
			//var VM = this.velocityMouse(mouse_x, mouse_y);
			//var Vx = VB.x + VM.x;
			//var Vy = VB.y + VM.y;

			//this.x += bound(Vx, -200, 200) * dt;
			//this.y += bound(Vy, -200, 200) * dt;
		},

		velocityBase: function () {
			var mass_point = 1.5;

			var diffx = this.base_x - this.x;
			var diffy = this.base_y - this.y;

			var x = mass_point * diffx;
			var y = mass_point * diffy;

			return { x: x ? x : 0, y: y ? y : 0 };
		},

		velocityMouse: function (mouse_x, mouse_y) {
			var mass_mouse = 15000;

			var diffx = mouse_x - this.base_x;
			var diffy = mouse_y - this.base_y;

			var dist = Math.pow(diffx * diffx + diffy * diffy, 0.5);

			if (dist > hot_range) return { x: 0, y: 0 };

			var percent = Math.abs(dist / hot_range);
			var force = (-1 * Math.pow(percent / 2 - 1, 2) + 1) * hot_range;

			var x = force * (diffx / dist);
			var y = force * (diffy / dist);

			return { x: x ? x : 0, y: y ? y : 0, dist: dist };
		}
	}

	Neuron.width = 16;

	return Neuron;
}());

var NeuralNet = (function () {
	function NeuralNet(canvas) {
		this.canvas = canvas;
		this.layer_sizes = [3, 5, 4];
		this.gap = 1 / 4;

		this.mouse = {x: 0, y: 0};

		this.classes = [
			"Bird",
			"Giraffe",
			"Elephant",
			"Mouse"
		]

		this.dense = [[2.5975695, -0.33524495, -0.8130083],
					  [1.408224, -2.4349346, -0.36996832],
					  [-1.2709727, 1.6551275, -1.2513115],
					  [-0.06284013, -0.2909313, 0.26460302],
					  [-0.97454786, 0.64979875, 2.4678032]];

		this.denseBias = [1.1510675, 1.4491386, 1.0726185, -0.4342836, 1.1200753];

		this.cls = [[0.8158076, 1.4879344, -1.5613133, -0.22935046, -4.072526],
					[0.7078722, -3.585404, -1.7949157, -0.2019659, -0.04713372],
					[-3.8165333, -3.2349772, 0.48310646, -0.11528116, 0.73857975],
					[-2.405541, -0.5149222, -3.0119247, -0.1156113, 0.8707766],
					[0.2366246, 0.16812646, 1.8629621, -0.20096223, -1.2207025]];

		this.clsBias = [-0.92681986, 0.14919668, -0.43160573, -0.12390426, 0.61985713];

		this.blue = colorFromCSSClass("text-blue");
		this.maize = colorFromCSSClass("text-accent");

		window.addEventListener('resize', debounce(this.resize.bind(this), 250));

		document.addEventListener('mousemove', this.mousemove.bind(this));
		this.canvas.addEventListener('click', this.click.bind(this));

		this.resize();

		this.forward();
		this.draw();

		//new Clock(function (fps, dt, now) {
		//	this.render(dt/1000);
		//}.bind(this), 24).start();
	}

	NeuralNet.prototype = {
		resize: function () {
			this.canvas.width = this.canvas.parentElement.clientWidth;
			this.canvas.height = this.canvas.parentElement.clientHeight;
			this.ctx = this.canvas.getContext("2d");
			this.ctx.strokeStyle = this.maize;
			this.ctx.fillStyle = this.maize;
			this.ctx.font = "14px Roboto Mono";

			this.layers = this.layer_sizes.map(function (num, idx) {
				var left_percent = idx / (this.layer_sizes.length - 1);
				var neurons = [];
				var start = (1 - (this.gap * (num - 1))) / 2

				for (var i = 0; i < num; ++i) {
					var top_percent = start + i * this.gap;

					var x = left_percent * (this.canvas.width - Neuron.width - 100) + Neuron.width / 2;
					var y = top_percent * (this.canvas.height - Neuron.width) + Neuron.width / 2

					neurons.push(new Neuron(x, y));
				}

				return neurons;
			}.bind(this));

			this.layers[0][1].setActivation(1);
			this.layers[0][2].setActivation(1);

			this.forward();
			this.draw();
		},

		drawDot: function (left, top) {
			this.ctx.beginPath();
			this.ctx.rect(left, top, 15, 15);
			this.ctx.stroke();
		},

		findMousedOverNeuron: function (x, y) {
			var inputs = this.layers[0];

			for (var i = 0; i < inputs.length; ++i) {		
				if (inputs[i].boundsCheck(x, y)) {
					return inputs[i];
				}
			}

			return null;
		},

		mousemove: function (e) {
			var rect = this.canvas.getBoundingClientRect();

			this.mouse = {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top
			}

			var mousedover = this.findMousedOverNeuron(this.mouse.x, this.mouse.y);

			if (mousedover) {
				this.canvas.style.cursor = "pointer";
			} else {
				this.canvas.style.cursor = "";
			}
		},

		click: function (e) {
			var rect = this.canvas.getBoundingClientRect();

			var layerX = e.clientX - rect.left;
			var layerY = e.clientY - rect.top;

			var clicked = this.findMousedOverNeuron(layerX, layerY);

			if (clicked) {
				clicked.setActivation(clicked.activation > 0 ? 0 : 1);
				this.forward();
				this.draw();
			}
		},

		forward: function () {
			var input = this.layers[0].map(neuron => neuron.activation);

			this.acts = [null, null];

			this.acts[0] = dot(this.dense, input);

			var hidden = reduce_rows(this.acts[0]);
			hidden = math.add(hidden, this.denseBias);
			hidden = hidden.map(x => x > 0 ? x : 0);

			this.acts[1] = dot(this.cls, hidden);

			var out = reduce_rows(this.acts[1]);
			out = math.add(out, this.clsBias);

			hidden = softmax(hidden);
			out = softmax(out);

			for (var i = 0; i < this.layer_sizes[1]; ++i) {
				this.layers[1][i].setActivation(hidden[i]);
			}

			for (var i = 0; i < this.layer_sizes[2]; ++i) {
				this.layers[2][i].setActivation(out[i]);
			}
		},

		render: function (dt) {
			//this.move(dt);
			//this.draw();
		},

		move: function (dt) {
			for (var i = 0; i < this.layers.length; ++i) {
				var neurons = this.layers[i];

				for (var j = 0; j < neurons.length; ++j) {
					var neuron = neurons[j];
					neuron.move(dt, this.mouse.x, this.mouse.y);
				}
			}
		},

		draw: function () {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

			this.ctx.strokeStyle = this.maize;
			this.ctx.fillStyle = this.maize;

			for (var i = 0; i < this.layers.length - 1; ++i) {
				var neurons = this.layers[i];

				for (var j = 0; j < neurons.length; ++j) {
					var neuron = neurons[j];
					var nexts = this.layers[i + 1];
					var acts = this.acts[i].map((row, idx) => row[j]);
					acts = softmax(acts);

					for (var k = 0; k < nexts.length; ++k) {
						var next = nexts[k];
						this.ctx.beginPath();
						this.ctx.moveTo(neuron.x, neuron.y);
						this.ctx.lineTo(next.x, next.y);
						this.ctx.globalAlpha = acts[k];
						this.ctx.stroke();
					}
				}
			}

			this.layers.forEach(function (neurons) {
				neurons.forEach(function (neuron) {
					this.ctx.beginPath();
					this.ctx.rect(neuron.x - Neuron.width / 2 + 1, neuron.y - Neuron.width / 2 + 1, Neuron.width - 2, Neuron.width - 2);
					this.ctx.globalAlpha = 1;
					this.ctx.strokeStyle = this.maize;
					this.ctx.fillStyle = this.maize;
					this.ctx.stroke();

					this.ctx.globalAlpha = 1;
					this.ctx.strokeStyle = this.blue;
					this.ctx.fillStyle = this.blue;
					this.ctx.fill();

					this.ctx.globalAlpha = neuron.activation;
					this.ctx.strokeStyle = this.maize;
					this.ctx.fillStyle = this.maize;
					this.ctx.fill();
				}.bind(this));
			}.bind(this));

			this.ctx.fillStyle = this.maize;

			for (var i = 0; i < this.layers[2].length; ++i) {
				var neuron = this.layers[2][i];
				var cls = this.classes[i];


				this.ctx.globalAlpha = math.min(neuron.activation + 0.25, 1);

				this.ctx.fillText(cls, neuron.x + Neuron.width*1.5, neuron.y + Neuron.width / 2 - 3);
			}
		}
	}

	return NeuralNet;
})();

export default NeuralNet;