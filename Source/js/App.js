import jQuery from 'jquery'; window.jQuery = jQuery; window.$ = jQuery;
import Animate from 'animation';
import SmoothScroll, { smoothScrollTo } from 'smooth-scroll';
import { debounce, throttle } from 'throttle'; window.debounce = debounce; window.throttle = throttle;
import NeuralNet from 'nn';

window.addEventListener('error', function () {
	$('body').addClass('loaded');
	$('body').addClass('error');
});

var App = (function ($) {
	function handleAnimation() {
		Animate.clearElements();
		$('.animate').scrollAnimate();
	}

	function handleSmoothScroll() {
		$('a[href^="#"]')
			.not('[href="#"]')
			.not('[href="#0"]')
			.not('[data-toggle="tab"]')
			.not('.no-scroll')
			.not(".JumpNav")
			.SmoothScroll();
	}

	function handleNNCanvas() {
		var _ = new NeuralNet(document.getElementById("nn"));
	}

	return {
		main: function () {
			handleNNCanvas();
			handleAnimation();
			handleSmoothScroll();
		},
	};
}(jQuery));

jQuery(document).ready(function () {
	App.main();
});
