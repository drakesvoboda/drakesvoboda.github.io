import jQuery from 'jquery';

import styles from "./styles.scss";

var FloutNav = (function ($) {
  var $site = $(window),
    $nav = $('#flyout-nav'),
    $toggles = $('.nav-toggle'),
    $header = $('#header'),
    siteScroll,
    navScroll,
    is_open = false;

  function open() {
    is_open = true;

    $(window).trigger('mobile-nav.open');

    $('html').addClass('mobile-nav-open');
    $nav.addClass('active');
    $toggles.addClass('active');

    $(window).scrollTop(navScroll);
  }

  function close() {
    is_open = false;

    $(window).trigger('mobile-nav.close');

    $('html').removeClass('mobile-nav-open');
    $nav.removeClass('active');
    $toggles.removeClass('active');

    $(window).scrollTop(siteScroll);
  }

  $site.on('click', function (e) {
    if (!$(e.target).is($toggles) && !$(e.target).closest($toggles).length && !$(e.target).is($header) && !$(e.target).closest($header).length && is_open)
      close();
  });

  $toggles.on('click', function (e) {
    if (is_open)
      close();
    else
      open();
  });
}(jQuery));
