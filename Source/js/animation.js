import jQuery from 'jquery';
import Clock from 'clock';

var requestAnimFrame = function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (/* function */ callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
}();

var Animate = (function ($) {
  var $eles = $();
  var animateList;
  var initialized = false;
  var current = -1;

  function Animate() {
    Animate.init();
  }

  Animate.init = function () {
    if (initialized) return;
    initialized = true;

    $(window).on('error', function () {
      $eles.addClass('active');
    });

    $(window).on('resize', function () {
      Animate.reset();
    });

    var documentHeight = $(document).height();

    var clock = new Clock(function (frames, delta, now) {
      if ($(document).height() != documentHeight) {
        Animate.reset();
        documentHeight = $(document).height();
      }

      Animate.update();

    }, 8);

    clock.start();
  };

  var UpdateResponse = {
    NO_CHANGE: 0,
    IN: 1,
    OUT: -1
  }

  Animate.update = function () {
    var len = animateList.length;

    var obj = animateList[current];

    var response = Animate.updateElement(obj);

    if (response == UpdateResponse.OUT) {
      response = UpdateResponse.NO_CHANGE;

      do {
        obj = animateList[--current];
        response = Animate.updateElement(obj);
      } while (response != UpdateResponse.NO_CHANGE)
    } else {
      do {
        obj = animateList[++current];
        Animate.updateElement(obj);
      } while (obj && $(obj.ele).data("animate.active"))

      --current;
    }
  };

  Animate.updateElement = function (obj) {
    if (!obj) return UpdateResponse.NO_CHANGE;

    var $ele = $(obj.ele);
    var wasActive = $ele.data("animate.active");

    var rect = obj.ele.getBoundingClientRect();

    if (rect.top + obj.displacement < window.innerHeight) {
      if (!wasActive) {
        $ele.addClass('active');
        $ele.addClass(obj.class);
        $ele.trigger('animate:in');
        $ele.data("animate.active", true);
        return UpdateResponse.IN
      }
    } else {
      if (wasActive) {
        $ele.removeClass('active');
        $ele.removeClass(obj.class);
        $ele.trigger('animate:out');
        $ele.data("animate.active", false);
        return UpdateResponse.OUT;
      }
    }

    return UpdateResponse.NO_CHANGE;
  };

  Animate.clearElements = function () {
    animateList = [];
    $eles = $();
  };

  Animate.addElements = function ($ele, options = {}) {
    $eles = $eles.add($ele);

    $ele.each(function () {
      animateList.push({
        ele: this,
        class: $(this).data("animation"),
        displacement: options.displacement != undefined ? options.displacement :
          ($(this).attr('data-anim-displacement') != null) ? parseFloat($(this).attr('data-anim-displacement')) : 100
      });

      $(this).addClass('animated');
    });

    Animate.reset();
  };

  Animate.reset = function () {
    animateList.sort(function (a, b) {
      return (a.ele.getBoundingClientRect().top + a.displacement) - (b.ele.getBoundingClientRect().top + b.displacement);
    });

    current = -1;

    Animate.update();

    for (var i = current, len = animateList.length; i < len; ++i) {

    }
  };

  Animate.makeJQueryPlugin = function () {
    if (!$) return;

    $.fn.scrollAnimate = function (options = {}) {
      Animate.init();
      Animate.addElements($(this), options);
    };
  };

  // try making plugin
  Animate.makeJQueryPlugin();

  return Animate;

}(jQuery));

export default Animate;

export { requestAnimFrame };
