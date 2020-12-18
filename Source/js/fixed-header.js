import jQuery from 'jquery';
import { throttle } from 'throttle';

function factory($) {
  function FixedHeader($header) {
    var scrollTop = $(window).scrollTop(), down = false, mark;
    var scrolled = false;
    $header.removeClass('unloaded');
    var height = 700;

    var paused = false;

    var scrollFunction = function () {
      if (paused) return;

      var newScrollTop = $(window).scrollTop();

      if (newScrollTop > height) {
        $header.addClass('below-height');
        $header.addClass('scrolled');
      }
      else if (newScrollTop > 0) {
        $header.addClass('scrolled');
        $header.removeClass('below-height');
      }
      else {
        $header.removeClass('scrolled');
        $header.removeClass('below-height');
      }

      if (newScrollTop > scrollTop) {
        if (down) {
          $header.addClass('down').removeClass('up');
          mark = scrollTop + 200;
        }

        down = false;

        if ($(window).scrollTop() > mark) {
          $header.addClass('down-delay').removeClass('up-delay');
        }
      }
      else {
        if (!down) {
          $header.addClass('up').removeClass('down');
          mark = scrollTop - 200;
        }

        down = true;

        if (newScrollTop < mark || newScrollTop <= 0) {
          $header.removeClass('down-delay').addClass('up-delay');
        }
      }

      scrollTop = $(window).scrollTop();
    }

    scrollFunction();

    window.onscroll = throttle(scrollFunction, 50);

    return {
      pause: function () { paused = true; },
      resume: function () { paused = false; }
    }
  }

  FixedHeader.makeJQueryPlugin = function () {
    if (!$)
      return;

    $.fn.fixedHeader = function (options, callback) {
      return new FixedHeader($(this));
    };
  };

  // try making plugin
  FixedHeader.makeJQueryPlugin();

  return FixedHeader;
}

export default factory(jQuery);
