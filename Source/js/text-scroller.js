import jQuery from 'jquery';

const ANIMATION_TIMING = 600;
const ANIMATION_DELAY = 4000;

(function ($) {
  $.event.special.destroyed = {
    remove: function (o) {
      if (o.handler) {
        o.handler()
      }
    }
  }
})(jQuery)

var TextScroller = (function ($) {
  function TextScroller(ele) {
    var $ele = $(ele);
    var $phrases = $ele.children();

    var idx = 0;

    var $first = $phrases.eq(idx);

    $first.addClass("active");

    $ele.css("width", `${$first.width()}px`);

    var change = function () {
      var $active = $phrases.eq(idx);
      idx = idx + 1 < $phrases.length ? idx + 1 : 0;
      var $new = $phrases.eq(idx);

      $active.addClass("out");
      $new.addClass("active");

      $ele.css("width", `${$new.width()}px`);

      setTimeout(function () {
        $active.removeClass("active").removeClass("out");
      }, ANIMATION_TIMING);
    };

    var animationInterval = setInterval(change, ANIMATION_DELAY);

    $ele.bind('destroyed', function () {
      clearInterval(animationInterval)
    });
  }

  TextScroller.makeJQueryPlugin = function () {
    if (!$) return;

    $.fn.textScoller = function (options) {
      $(this).each(function () {
        this.textScroller = new TextScroller($(this).get(0));
      });

      return $(this);
    };
  }

  TextScroller.makeJQueryPlugin();

  return TextScroller;
}(jQuery));

export default TextScroller;
