import jQuery from 'jquery';

var InverseHover = (function ($) {
  function InverseHover($eles) {
    $eles.on('blur mouseleave', function () {
      $eles.removeClass('hover').removeClass('inverse-hover');
    });

    $eles.on('hover focus mouseenter', function () {
      $eles.removeClass('hover').addClass('inverse-hover');
      $(this).removeClass('inverse-hover').addClass('hover');
    });
  }

  InverseHover.makeJQueryPlugin = function () {
    if (!$) return;

    $.fn.inverseHover = function (options) {
      new InverseHover($(this));
      return $(this);
    };
  }

  InverseHover.makeJQueryPlugin();

  return InverseHover;

}(jQuery));

export default InverseHover;
