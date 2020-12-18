import jQuery from 'jquery';
import Clock from 'clock';
import { requestAnimFrame } from 'animation';

var ScrollInertia = (function ($) {
  function ScrollInertia(ele) {
    var $ele = $(ele);
    var diff = 0;
    var scrollPosition = $(window).scrollTop();

    var onScroll = function (e) {
      var newScrollPosition = $(window).scrollTop();
      diff += newScrollPosition - scrollPosition;
      scrollPosition = newScrollPosition;

      requestAnimFrame(function () {
        $ele.css("transform", `translateY(${diff}px)`);
      });
    };

    $(window).on("scroll", onScroll);

    var clock = new Clock(function (frames, delta, now) {
      delta = delta / 500;
      diff -= delta / (delta + .5) * diff;

      $ele.css("transform", `translateY(${diff}px)`);
    }, 60);

    clock.start();
  }

  ScrollInertia.makeJQueryPlugin = function () {
    if (!$) return;

    $.fn.scrollInertia = function (options) {
      $(this).each(function () {
        this.scrollInertia = new ScrollInertia($(this).get(0));
      });

      return $(this);
    };
  }

  ScrollInertia.makeJQueryPlugin();

  return ScrollInertia;
}(jQuery))
