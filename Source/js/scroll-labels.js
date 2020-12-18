import jQuery from 'jquery';
import { throttle, debounce } from 'throttle';

var ScrollLabel = (function ($) {
  var sections = [];
  var $sections = $("[data-section]");
  var $label = $("#side-bar__label");
  var bound = false;

  function ScrollLabel() {
    ScrollLabel.init();
  }

  ScrollLabel.init = function () {
    $sections = $("[data-section]");

    $label.html("");

    $sections.each(function () {
      var title = $(this).data('section');
      $label.append(`<span data-section-label="${title}">${title}</span>`);
    });

    ScrollLabel.setSections();
    ScrollLabel.setLabel();



    if (!bound) ScrollLabel.bindEvents();
  };

  ScrollLabel.bindEvents = function () {
    $(window).on('scroll', throttle(ScrollLabel.setLabel, 500));
    $(window).on("scroll navigation.open navigation.closed", debounce(ScrollLabel.setSections, 1000));
    bound = true;
  };

  ScrollLabel.setLabel = function () {
    var scroll = $(window).scrollTop();
    var scroll_bottom = scroll + $(window).height();
    var max_overlap = Number.NEGATIVE_INFINITY, activeSection;

    for (var i = 0, len = sections.length; i < len; ++i) {
      var section = sections[i];
      var overlap = Math.min(section.bottom, scroll_bottom) - Math.max(section.top, scroll);

      if (overlap > max_overlap) {
        max_overlap = overlap;
        activeSection = section;
      } else {
        break;
      }
    }

    if (activeSection && !activeSection.label.hasClass('active')) {
      $("#side-bar__label span").removeClass('active');
      activeSection.label.addClass('active');
    }
  };

  ScrollLabel.setSections = function () {
    sections = $sections.map((i, ele) => {
      var rect = ele.getBoundingClientRect();
      var scrollTop = $(window).scrollTop();
      return {
        ele: ele,
        label: $(`#side-bar__label span[data-section-label="${$(ele).data('section')}"]`),
        top: rect.top + scrollTop,
        bottom: rect.bottom + scrollTop
      };
    }).get().sort((a, b) => a.top - b.top);
  };

  return ScrollLabel;

}(jQuery));

export default ScrollLabel;
