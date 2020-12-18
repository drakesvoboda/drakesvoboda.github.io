import jQuery from 'jquery';

import { throttle, debounce } from "throttle";
import styles from '../styles/components/_work-slider.lib.scss';

var animationDuration = parseInt(styles.animationMillis);

var WorkSlider = (function ($) {
  function WorkSlider(ele) {
    this.$slider = $(ele);
    this.$slides = this.$slider.find(".work-slide");
    this.activeIdx = 0;

    this.GoTo(0, false);

    $(".work-slider__next").on('click', this.Next.bind(this));

    var that = this;

    this.$slides.on('focusin', function () {
      var idx = that.$slides.index($(this));
      that.UnthrottledGoTo(idx, false);
    });

    function resize() {
      $(".work-slide__container, .work-slide__bg").css("width", $(".work-slider").width() * .8 + "px");
    };

    resize();

    $(window).on('resize', debounce(resize, 500));
  }

  WorkSlider.makeJQueryPlugin = function () {
    if (!$) return;

    $.fn.workslider = function (options) {
      $(this).each(function () {
        this.workslider = new WorkSlider($(this).get(0));
      });

      return $(this);
    };
  }

  WorkSlider.makeJQueryPlugin();

  return WorkSlider;
}(jQuery));


WorkSlider.prototype = {
  Next: function () {
    return this.GoTo(this.BoundIndex(this.activeIdx + 1));
  },

  Prev: function () {
    return this.GoTo(this.BoundIndex(this.activeIdx - 1));
  },

  UnthrottledGoTo: function (idx, animation = true) {
    var activate = this.BoundIndex(idx)
    var $activate = this.$slides.eq(activate);

    // Play the video for the active slide
    var $activateVideo = $activate.find('video');
    if ($activateVideo.length) $activateVideo.get(0).play();

    // Start the fake3d effect for the active slide
    var activateFake3d = $activate.find('.work-slide__fake3d').get(0);
    if (activateFake3d && activateFake3d.fake3d) activateFake3d.fake3d.play();

    var $next = this.$slides.eq(this.BoundIndex(idx + 1));
    $next.addClass("next");

    var $prev = this.$slides.eq(this.BoundIndex(idx - 1));
    $prev.addClass("prev");

    // If we are not changing the slide we can stop here
    if (activate == this.activeIdx) return;

    var $deactivate = this.$slides.eq(this.activeIdx);

    var $deactivateVideo = $deactivate.find('video');
    var deactivateFake3d = $deactivate.find('.work-slide__fake3d').get(0);

    if (animation) {
      if (idx == this.activeIdx + 1 || (idx == 0 && this.activeIdx == this.$slides.length - 1)) {
        $activate.addClass("slide");
        $deactivate.addClass("over");
      } else {
        $activate.addClass("active").addClass("under");
        $deactivate.removeClass("active").addClass("away");
      }
    }

    setTimeout(function () {
      // Stop and restart video
      if ($deactivateVideo.length) {
        var vid = $deactivateVideo.get(0);
        vid.pause();
        vid.currentTime = 0;
      }

      // Stop fake3d effect
      if (deactivateFake3d && deactivateFake3d.fake3d) deactivateFake3d.fake3d.pause();

      $deactivate.removeClass("active").removeClass("away").removeClass("over");
      $activate.removeClass("under").removeClass("slide").addClass("active");

      this.$slides.not($next).removeClass("next");
      this.$slides.not($prev).removeClass("prev");

      this.activeIdx = activate;
    }.bind(this), animation ? animationDuration : 0);
  },

  BoundIndex: function (idx) {
    if (idx < 0) {
      return this.$slides.length - 1;
    } else if (idx >= this.$slides.length) {
      return 0;
    } else {
      return idx;
    }
  }
}

WorkSlider.prototype.GoTo = throttle(WorkSlider.prototype.UnthrottledGoTo, animationDuration, { trailing: false });

export default WorkSlider;
