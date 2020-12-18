import jQuery from 'jquery';

import { requestAnimFrame } from 'animation';

(function ($) {
  $.fn.objectFit = function () {
    $(this).each(function () {
      var $ele = $(this);
      var pw = $ele.parent().outerWidth();
      var ph = $ele.parent().outerHeight();

      requestAnimFrame(function () {
        $ele.css({ 'width': 'auto', 'height': 'auto', 'top': '50%', 'left': '50%', 'transform': 'translate(-50%, -50%)' });
      });

      requestAnimFrame(function () {
        if ((pw / ph) > ($ele.outerWidth() / $ele.outerHeight())) {
          $ele.css('width', pw + 2 + 'px');
        } else {
          $ele.css('height', ph + 2 + 'px');
        }
      });
    });
  }
}(jQuery))



