import jQuery from 'jquery';

export function smoothScrollTo($target, timing = 1000, offset = 0) {
  $('html, body').animate({
    scrollTop: $target.offset().top - offset
  }, timing, function () {
    // Callback after animation
    // Must change focus!
    $target.focus();
    if ($target.is(":focus")) { // Checking if the target was focused
      return false;
    } else {
      $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
      $target.focus(); // Set focus again
    };
  });
}

function factory($) {
  function SmoothScroll($a) {
    $a.on('click', function (event) {
      // Figure out element to scroll to
      var target = $(this.hash);

      // Does a scroll target exist?
      if (target.length) {
        // Only prevent default if animation is actually gonna happen
        event.preventDefault();
        smoothScrollTo(target, 100);
      }
    });
  }

  SmoothScroll.makeJQueryPlugin = function () {
    if (!$)
      return;

    $('html, body').on("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", function () {
      $('html, body').stop();
    });

    $.fn.SmoothScroll = function (options, callback) {
      return new SmoothScroll($(this));
    };
  };

  // try making plugin
  SmoothScroll.makeJQueryPlugin();

  return SmoothScroll;
}

export default factory(jQuery);
