import styles from 'navigation/_navigation.scss';
import jQuery from 'jquery';
import { setTimeout } from 'timers';
import { throttle } from 'throttle';

var millis = parseInt(styles.animationMillis);

const MIN_WIDTH = Infinity;

var Navigation = (function ($) {
  var $site = $('#site');
  var $content = $('#main-content');
  var is_open = false;
  var $toggles = $('.toggle-mobile-menu');
  var $fixed = $(".sb-slide");

  function open() {
    $(window).trigger('navigation:open');
    $('body').addClass('mobile-nav-sliding');

    // Save scroll position and prevent scrolling while navigation is opening 
    var x = window.scrollX;
    var y = window.scrollY;
    var scrollFunc = function () { window.scrollTo(x, y); };
    $(window).on('scroll', scrollFunc);

    var windowWidth = $(window).width();

    if (windowWidth >= MIN_WIDTH) {
      var scroll_percentage = ($(window).scrollTop() / ($(document).height() - $(window).height()));
      var scale_factor = ($content.outerWidth() - $('#flyout-nav').outerWidth()) / $content.outerWidth();

      $content.add($fixed).css({
        'transform': `scale(${scale_factor})`,
      });

      $content.css({
        'transform-origin': `0 ${$content.height() * scroll_percentage}px`
      });
    } else {
      $content.add($fixed).css({
        'transform': `translateX(${-1 * $('#flyout-nav').outerWidth()}px)`
      });
    }

    $('body').addClass('mobile-nav-open');
    $('body').addClass('mobile-nav-expanded');

    var afterSlide = function () {
      $('body').removeClass('mobile-nav-sliding');

      if (windowWidth >= MIN_WIDTH) {

        var height = $content.outerHeight() * scale_factor;

        $site.css({ 'height': `${height}px` });

        $content.css({ 'transform-origin': "0 0" });

        window.scrollTo(0, (height - window.innerHeight) * scroll_percentage);
      }

      if (!$('#flyout-nav').find(':focus').length) {
        $('#flyout-nav').focus();
      }

      // Enable scrolling after the animation is finished
      $(window).off('scroll', scrollFunc);

      $(window).trigger('navigation:opened');
    }

    if (is_open) {
      afterSlide();
    } else {
      setTimeout(afterSlide, millis);
    }

    is_open = true;
  }

  function close() {
    $(window).trigger('navigation:close');
    $('body').addClass('mobile-nav-sliding');
    $('#flyout-nav').attr('tabindex', '-1');

    var scroll_percentage = ($(window).scrollTop() / ($(document).height() - $(window).height()));

    $('body').removeClass('mobile-nav-open');

    $content.add($fixed).css({
      'transform': `translate(0, 0) scale(1)`,
    });

    $content.css({
      'transform-origin': `0 ${$content.outerHeight() * scroll_percentage}px`
    });

    $site.css({ 'height': '' });

    window.scrollTo(0, ($(document).height() - window.innerHeight) * scroll_percentage);

    var afterSlide = function () {
      $('body').removeClass('mobile-nav-expanded');
      $('body').removeClass('mobile-nav-sliding');

      $(window).trigger('navigation:closed');

      $content.add($fixed).css({
        'transform': ''
      });

      $content.css({
        'transform-origin': '0 0',
      });
    };

    if (!is_open) {
      afterSlide();
    } else {
      setTimeout(afterSlide, millis);
    }

    is_open = false;
  }

  var toggle_nav = throttle(function (e) {
    $('html, body').stop();

    if (is_open)
      close();
    else {
      open();
    }

  }, millis + 100, { trailing: false });

  $toggles.on('click', toggle_nav);

  $(window).on('resize', function () {
    if (is_open) close();
  });

  $content.on('click', function () {
    var windowWidth = $(window).width();

    if (windowWidth < MIN_WIDTH && is_open) close();
  });

  $(document).on("ajax:loading", function () {
    if (is_open) close();
  });

  $('#flyout-nav').on('focusin', throttle(function () {
    if (!is_open) open();
  }, millis + 100, { trailing: false }));
}(jQuery));
