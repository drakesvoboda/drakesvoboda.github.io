import jQuery from 'jquery';

import { smoothScrollTo } from 'smooth-scroll';
import { debounce } from 'throttle';

var SnapScroll = (function ($) {
  function SnapScroll(ele) {
    var $ele = $(ele);
    var $window = $(window); 
    var down = false;
    var oldScroll = $window.scrollTop();

    var detectDirection = function () {
      var scroll = $window.scrollTop();
      down = scroll > oldScroll;
      oldScroll = scroll <= 0 ? 0 : scroll;
    };

    var onScroll = debounce(function () {
      if (down) {
        var offset = $ele.offset().top;

        var height = $window.height();

        var scroll = $window.scrollTop();

        if (scroll < offset && scroll > offset - height * .75) {
          smoothScrollTo($ele, 750);
        }
      }
    }, 250);

    $window.on('scroll', detectDirection);
    $window.on('scroll', onScroll);
  }

  SnapScroll.makeJQueryPlugin = function () {
    if (!$) return;

    $.fn.snapScroll = function (options) {
      $(this).each(function () {
        this.snapScroll = new SnapScroll($(this).get(0));
      });

      return $(this);
    };
  }

  SnapScroll.makeJQueryPlugin();

  return SnapScroll;
}(jQuery));

export default SnapScroll
