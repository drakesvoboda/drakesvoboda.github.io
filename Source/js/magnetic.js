import { throttle, debounce } from 'throttle';
import Clock from 'clock';

const cold_range = 40;
const hot_range = 100;
const default_mass = 10;

function distance(x, y, x1, y1) {
  var dx = x1 - x;
  var dy = y1 - y;
  var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

  return { dx: dx, dy: dy, dist: dist };
}

function force(dist) {
  var percent = Math.abs(dist.dist / hot_range);
  var force = (-1 * Math.pow(percent / 2 - 1, 2) + 1) * hot_range;

  return { x: force * (-dist.dx / dist.dist), y: force * (-dist.dy / dist.dist) };
}

var Magnetic = (function ($) {
  var initialized = false;
  var $shortest = $(), $cursor, $links = $(), mouse = { x: 0, y: 0, window_x: 0, window_y: 0 };

  function Magnetic() {
    Magnetic.init();
  }

  Magnetic.init = function () {
    if (initialized) return;
    initialized = true;
    Magnetic.makeCursor();
    Magnetic.bindMouse();
    Magnetic.bindClick();
    Magnetic.animate();
  }

  Magnetic.makeCursor = function () {
    $cursor = $('#cursor');

    $cursor
      .data('mass', 5)
      .data('x', 0)
      .data('y', 0)
      .data('target_x', 0)
      .data('target_y', 0)
      .data('over', false);

    $('body').prepend($cursor);

    $(document).on("ajax:loading", function () {
      Magnetic.clearElements();
      $cursor.addClass('hooked loading-cursor');
    });

    $(document).on('ajax:loaded', function () {
      $cursor.addClass('out');

      setTimeout(function () {
        $cursor.removeClass('out');

        var isAnyHookedAfterTimeout = $shortest.data('hooked');

        if (!isAnyHookedAfterTimeout) {
          $cursor.attr('class', '');
        }
      }, 600);
    });
  };

  Magnetic.bindMouse = function () {
    var onmousemove = function (e) {
      var shortest = { dx: Infinity, dy: Infinity, dist: Infinity };
      mouse = { x: e.clientX, y: e.clientY };

      var wasHooked = $shortest.data('hooked');
      var oldCursorClass = $shortest.data('cursor-class');

      // Find the elements that is closest to the mouse
      $links.each(function () {
        var rect = $(this).get(0).getBoundingClientRect();

        var dist = distance(e.clientX, e.clientY,
          rect.left + ((rect.right - rect.left) / 2) - $(this).data('x'),
          rect.top + ((rect.bottom - rect.top) / 2) - $(this).data('y'));

        if (dist.dist < shortest.dist || $(this).data('over')) {
          shortest = dist;
          $shortest = $(this);
        }
      });

      // Move all but the shortest element to it's starting point
      $links.not($shortest).data('target_x', 0).data('target_y', 0).removeClass('hover').data('hooked', false);

      var isVisible = $shortest.is(":visible");
      var isHovered = $shortest.data('over')
      var isInRange = shortest.dist <= cold_range || (shortest.dist <= hot_range && $shortest.data('hooked'))
      var isHooked = isVisible && (isHovered || isInRange);

      $shortest.data('hooked', isHooked);

      if (isHooked) {
        $('body').css('cursor', 'pointer');
        $cursor.attr('class', 'hooked ' + $shortest.data('cursor-class'));
        $shortest.addClass('hover');

        if (!$shortest.data('fixed')) {
          var f = force(shortest);
          $shortest.data('target_x', f.x).data('target_y', f.y);
        }
      } else {
        $shortest.data('target_x', 0).data('target_y', 0).removeClass('hover');
        $('body').css('cursor', 'auto');

        if (wasHooked) {
          $cursor.addClass('out');

          setTimeout(function () {
            $cursor.removeClass('out');

            var isAnyHookedAfterTimeout = $shortest.data('hooked');

            if (!isAnyHookedAfterTimeout) {
              $cursor.attr('class', '');
            }
          }, 600);
        }
      }

    };

    $(document).on('mousemove', throttle(onmousemove, 100, { leading: true, trailing: true }));
  };

  Magnetic.bindClick = function () {
    $('body').on('click', function (e) {
      if (!$shortest.data('hooked') || $(e.target).closest($shortest).length) return;
      e.preventDefault();
      $shortest.get(0).click();
    });
  };

  Magnetic.animate = function () {
    var clock = new Clock(function (frames, delta, now) {
      if ($shortest.data('hooked') && $shortest.data('attract-mouse')) {
        var ele = $shortest.get(0);

        var $proxy = $($shortest.data('magnetic-proxy'));
        if ($proxy.length) ele = $proxy.get(0);

        var rect = ele.getBoundingClientRect();
        $cursor.data('target_x', rect.left + ((rect.right - rect.left) / 2)).data('target_y', rect.top + ((rect.bottom - rect.top) / 2));
      } else {
        $cursor.data('target_x', mouse.x).data('target_y', mouse.y);
      }

      var move = function ($ele) {
        var mass = $ele.data('mass') ? $ele.data('mass') : default_mass;

        var x = $ele.data('x'),
          target_x = $ele.data('target_x'),
          y = $ele.data('y'),
          target_y = $ele.data('target_y');

        $ele.data('x', x + ((target_x - x) / mass))
        $ele.data('y', y + ((target_y - y) / mass))

        $ele.css('transform', `translate3d(${$ele.data('x')}px, ${$ele.data('y')}px, 0)`);
      }

      $links.each(function () { move($(this)) });
      move($cursor);
    }.bind(this), 24);

    clock.start();
  };

  const default_options = {
    attractMouse: true,
    cursorClass: '',
    fixed: false
  }

  Magnetic.addElements = function ($eles, options) {
    options = $.extend({}, default_options, options);

    $eles
      .data('x', 0)
      .data('y', 0)
      .data('target_x', 0)
      .data('target_y', 0)
      .data('over', false)
      .data('hooked', false)
      .data('attract-mouse', options.attractMouse)
      .data('cursor-class', options.cursorClass)
      .data('fixed', options.fixed)
      .on('mouseenter', function () {
        $(this).data('over', true);
      })
      .on('mouseleave', function () {
        $(this).data('over', false);
      });

    $links = $links.add($eles);
  };

  Magnetic.clearElements = function () {
    $links = $();
    $shortest = $();
  };

  Magnetic.makeJQueryPlugin = function () {
    if (!$) return;

    $.fn.magnetic = function (options) {
      Magnetic.init();
      Magnetic.addElements($(this), options);
    };
  };

  // try making plugin
  Magnetic.makeJQueryPlugin();

  return Magnetic;

}(jQuery));

export default Magnetic;
