import jQuery from 'jquery';

import { debounce } from '../throttle';
import "./_tabs.scss";

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var Tabs = (function ($) {

  const default_options = {
    fixedHeight: false,
  };

  function Tabs(container, options) {
    this.options = $.extend({}, default_options, options);

    this.$container = $(container);
    this.$tabs = this.$container.children();

    this.$container.addClass("tab-container");
    this.$tabs.addClass("tab-content");

    this.$required = this.$tabs.find("[required]");
    this.$required.attr("data-required", "true");

    var resize = function () {
      var $active = this.$container.find('.tab-content.active');
      if (!this.options.fixedHeight)
        this.$container.css('height', `${$active.height()}px`);
      else {
        var maxHeight = -1;

        this.$tabs.each(function () {
          maxHeight = maxHeight > $(this).height() ? maxHeight : $(this).height();
        });

        this.$container.css('height', `${maxHeight}px`);
      }

    }.bind(this);

    $(window).on('resize', debounce(resize, 500));

    resize();

    this.BindEvents();

    var hash = getParameterByName("tab");

    var $ele = $(`[data-tab="${hash}"]`);

    if ($ele.length) {
      this.ActivateTab($ele);
    } else {
      this.ActivateTab(this.$container.find('.tab-content.active'));
    }
  }

  Tabs.makeJQueryFunction = function () {
    if (!$) return;

    $.fn.tabs = function (options) {
      $(this).each(function () {
        this.tabs = new Tabs($(this).get(0), options);
      });

      return $(this);
    };
  }

  Tabs.makeJQueryFunction();

  return Tabs;
}(jQuery));

Tabs.prototype = {
  BindEvents: function () {
    var that = this;
    that.$toggles = $();

    this.$tabs.each(function () {
      var $ele = $(this);
      var id = $ele.attr("data-tab");

      if (id) {
        var $toggle = $(`[data-toggle="tab"][data-for="${id}"]`);
        that.$toggles = that.$toggles.add($toggle);
        $toggle.on('click', function (e) {
          e.preventDefault();
          that.ActivateTab($ele);
        });
      }
    });
  },

  ActivateTab: function ($activate) {
    if (!$activate.length && this.$tabs.is($activate) != -1) return;   

    this.$tabs.removeClass('active').attr('tabindex', '-1');

    this.$required.removeAttr('required');

    $activate.addClass('active').removeAttr('tabindex');
    $activate.find('[data-required]').attr('required', 'true');

    if (!this.options.fixedHeight) this.$container.css('height', `${$activate.height()}px`);

    this.$toggles.removeClass('active');
    var id = $activate.attr("data-tab");
    $('[data-toggle="tab"][data-for="' + id + '"]').addClass("active");

    this.$container.trigger("tabs:change", [$activate, id]);

    if (this.$active && this.$active.length)
      this.$active.trigger("tabs:out")
 
    $activate.trigger("tabs:in");
 
    this.$active = $activate;
  },

  ActivateTabByIndex: function (index) {
    var $activate = this.$tabs.eq(index);
    this.ActivateTab($activate);
  },

  ActivateTabBySelector: function (selector) {
    this.ActivateTab($(selector));
  },
}

export default Tabs;
