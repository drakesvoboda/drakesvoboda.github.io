import jQuery from 'jquery';

import { requestAnimFrame } from 'animation';
import { debounce } from 'throttle';

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

var TabSection = (function ($) {
  function TabSection(parent) {
    var that = this;
    var navigationOpen = false;
    that.parent = parent;
    that.$parent = $(parent);
    that.$content = that.$parent.children();
    that.$sections = that.$content.children(".tab-section__tab");
    that.$toggles = that.$parent.find('.tab-section__nav').children();

    var onResize = function () {
      that.windowHeight = $(window).height();
      that.parentHeight = that.$parent.height();
      that.parentWidth = that.$parent.innerWidth();
    };

    var onScroll = function () {
      var box = that.parent.getBoundingClientRect();
      var percentage = clamp(-1 * (box.top - that.windowHeight) / (that.parentHeight + that.windowHeight), 0, 1);
      var activeIdx = Math.floor(that.$sections.length * percentage);

      that.$sections.add(that.$toggles).removeClass('active');

      var $active = that.$sections.eq(activeIdx).add(that.$toggles.eq(activeIdx));
      $active.addClass('active');

      var height = $active.height();
      that.$content.css('height', height + 'px');
      var bound_top = 0;
      var bound_bottom = that.parentHeight - height;
      var scroll_position = -box.top + (that.windowHeight / 2) - (height / 2);

      if (navigationOpen) {
        var scaleFactor = box.width / that.parentWidth;
        scroll_position = scroll_position / scaleFactor
      }

      var below = scroll_position >= bound_top;
      var above = scroll_position <= bound_bottom

      if (below && above) {
        if (!navigationOpen) {
          requestAnimFrame(function () {
            that.$content.addClass("fixed").removeClass("fixed-bottom");
            that.$content.css({
              "width": `${that.parentWidth}px`,
              "top": "",
              "left": `${box.left}px`
            });
          });
        } else {
          requestAnimFrame(function () {
            that.$content.addClass("fixed").removeClass("fixed-bottom");
            that.$content.css({
              "width": `${that.parentWidth}px`,
              "top": `${scroll_position}px`,
              "left": ""
            });
          });
        }
      } else {
        if (!above) that.$content.addClass("fixed-bottom");
        requestAnimFrame(function () {
          that.$content.removeClass("fixed");
          that.$content.css({ "width": "", "left": "", "top": "" });
        });
      }
    };

    $(window).on('resize', debounce(function () { onResize(); onScroll(); }, 500));
    $(window).on('scroll', onScroll);

    onResize();
    onScroll();

    $(window).on('navigation:open', () => { navigationOpen = true; onScroll(); });
    $(window).on('navigation:closed', () => { navigationOpen = false; onScroll(); });
  }

  TabSection.makeJQueryPlugin = function () {
    if (!$) return;

    $.fn.tabSection = function (options) {
      $(this).each(function () {
        this.tabSection = new TabSection($(this).get(0));
      });

      return $(this);
    };
  }

  TabSection.makeJQueryPlugin();


  return TabSection;
}(jQuery));

export default TabSection;
