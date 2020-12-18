import jQuery from 'jquery'; window.jQuery = jQuery; window.$ = jQuery;
import Animate from 'animation';
import SmoothScroll, { smoothScrollTo } from 'smooth-scroll';
import { debounce, throttle } from 'throttle'; window.debounce = debounce; window.throttle = throttle;
import Listing from 'ajax-listing'; window.Listing = Listing;
import 'object-fit';
import 'inverse-hover';
import 'fixed-header';
import 'bootstrap';
import 'slick-carousel';
import 'slick-carousel/slick/slick.css';
import 'header-nav';
import "navigation";
import 'quantity-input';
import store from 'store'; window.store = store;

window.addEventListener('error', function () {
  $('body').addClass('loaded');
  $('body').addClass('error');
});

jQuery.fn.extend({
  autoHeight: function () {
    function autoHeight_(element) {
      return jQuery(element).css({
        'height': 'auto',
        'overflow-y': 'hidden'
      }).height(element.scrollHeight);
    }

    return this.each(function () {
      autoHeight_(this).on('input', function () {
        autoHeight_(this);
      });
    });
  }
});

var App = (function ($) {



  function handleSliders() {
    $('.slider').each(function () {
      var options = {
        arrows: false,
        dots: false,
        slidesToShow: 1,
        autoplay: false,
        rows: 0,
        autoplaySpeed: 6000,
        speed: 500,
      };

      var $this = $(this);

      if ($this.hasClass("slider--project-video-content")) {
        $.extend(options, {
          asNavFor: ".slider--project-videos",
          dots: true,
          appendDots: '.slider--project-video__dots'
        });
      }

      if ($this.hasClass("slider--project-videos")) {
        $.extend(options, {
          asNavFor: ".slider--project-video-content"
        });
      }

      if ($this.hasClass("featured-projects--content")) {
        $.extend(options, {
          asNavFor: ".featured-projects--background"
        });
      }

      if ($this.hasClass("featured-projects--background")) {
        $.extend(options, {
          asNavFor: ".featured-projects--content"
        });
      }

      if ($this.data('slider-append-dots'))
        $.extend(options, { appendDots: $this.data("slider-append-dots") });

      if ($this.data('slider-height') === "adaptive")
        $.extend(options, { adaptiveHeight: true });

      if ($this.hasClass('slider--dots'))
        $.extend(options, { dots: true });

      if ($this.hasClass('slider--related-projects')) {
        $.extend(options, {
          variableWidth: true,
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          centerMode: true,
          prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="Previous" tabindex="0" role="button"><span class="sr-only">Previous</span></button>',
          nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="Next" tabindex="0" role="button"><span class="sr-only">Next</span></button>',
          centerPadding: '0px',
        });
      }

      if ($this.hasClass('banner--home__background')) {
        $.extend(options, {
          pauseOnHover: false,
          autoplay: true
        });
      }

      if ($this.hasClass('slider--arrows') || $this.hasClass('slider--arrows-alt'))
        $.extend(options, { arrows: true });

      if ($this.data('slider-items'))
        $.extend(options, { slidesToShow: $this.data('slider-items') });

      if ($this.data('slider-fade'))
        $.extend(options, { fade: true });

      if ($this.data('slider-center'))
        $.extend(options, { centerMode: true });

      if ($this.data('slider-asnavfor'))
        $.extend(options, { asNavFor: $this.data('slider-asnavfor') });

      if ($this.data('slider-autoplay'))
        $.extend(options, { autoplay: true });

      $this.on("beforeChange", function () {
        $this.find('video').trigger('pause');
      })

      var $slides = $this.children();

      $this.slick(options);

      $this.find('iframe')
        .on("youtube:play", function () {
          $this.slick('slickPause');
        })
        .on("youtube:pause", function () {
          $this.slick('slickPlay');
        });

      $this.on("beforeChange", function (event, slick, currentSlide, nextSlide) {
        $this.find('video').trigger('pause');
        $this.find('iframe').each(function (idx) {
          this.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*')
        });
      });
    });
  }

  function handleSelect() {
    $('.select > select').each(function () {
      var selected = $(this).find(':selected').get(0);
      if (selected.hasAttribute('default') || selected.value == "") {
        $(this).parent().addClass('default-selected')
      }
    })

  $('.select > select').on("change", function () {
    var selected = $(this).find(':selected').get(0);
    if (selected.hasAttribute('default') || selected.value == "") {
        $(this).parent().addClass('default-selected')
      } else {
        $(this).parent().removeClass('default-selected')
      }
    });
  }

  function handleProductImages() {
      if ($('#image-slider-nav').length) {
          let $imgs = $('#image-slider-nav').find('.slick-slide');
          $imgs.click(function () {
              let $id = $(this).attr('data-slick-index');
              $imgs.find('div.slick-current').removeClass('slick-current');
              $(this).addClass('slick-current');
              $('#image-slider').slick('slickGoTo', $id, true);
          })
      }
  };

  function handleFilters() {
    $('#filters select').on('change', function () {
      $(this).closest('form').submit();
    });

    $('#filters').on('submit', function (e) {
      e.preventDefault();
    });
  }

  function handleFileInput() {
    $('.file-input input[type="file"]').on("change", function () {
      if (this.value) {
        $(this).removeClass("placeholder-shown");
        $(this).siblings('.file-name').html(this.value.replace(/^.*\\/, ""))
      } else {
        $(this).addClass("placeholder-shown");
        $(this).siblings('.file-name').html("Browse...")
      }
    });
  }

  function handleScrollToTop() {
    var $balloon = $('#big-balloon');

    var onScroll = function () {
      if ($(window).scrollTop() >= 800) {
        $balloon.addClass('active');
      } else {
        $balloon.removeClass('active');
      }
    }

    onScroll();

    $(window).scroll(debounce(onScroll, 250));

    var $root = $('html, body');

    $balloon.click(function (e) {
      e.preventDefault();
      smoothScrollTo($root);
    });
  }

  function handleAnimation() {
    Animate.clearElements();

    $('.animate--video').on("animate:in", function () {
      var video = $(this).get(0);
      video.play();
    });

    $('.animate--video').on("animate:out", function () {
      var video = $(this).get(0);
      video.pause();
      video.currentTime = 0;
    });

    $('.animate').scrollAnimate();
  }

  function handleSmoothScroll() {
    $('a[href^="#"]')
      .not('[href="#"]')
      .not('[href="#0"]')
      .not('[data-toggle="tab"]')
      .not('.no-scroll')
      .not(".JumpNav")
      .SmoothScroll();
  }

  function handleLazyLoad() {
    var $lazy = $('[data-lazy]');

    $lazy.on("animate:in", function () {
      $(this).attr('src', $(this).data('lazy'))
    });

    $lazy.scrollAnimate({ displacement: -2000 });
  }

  function handleHeader() {
    $("#header").fixedHeader();

    $("#toggle-search").click(function () {
      $("#search-bar").toggleClass('active');
      $("#search-bar input").focus();
    });

    $(window).click(function (e) {
      if (!$(e.target).is("#search-bar, #toggle-search") && !$(e.target).closest("#search-bar, #toggle-search").length) {
        $("#search-bar").removeClass('active');
      }
    });
  }

  function handleObjectFit() {
    var edgeVersion = window.navigator.userAgent.match(/Edge\/(\d{2})\./);
    var edgePartialSupport = edgeVersion ? parseInt(edgeVersion[1], 10) >= 16 : false;

    var hasSupport = 'objectFit' in document.documentElement.style !== false;

    if (!hasSupport || edgePartialSupport) {
      function fit() {
        $(".bg > figure, .bg > img, .bg > span, .bg > video").objectFit();
      }

      $(window).on('ajax:loaded', function () {
        setTimeout(fit, 200);
      });

      $(window).on('resize', debounce(fit, 800));

      fit();
    }
  }

  function handleBillingAddress() {
    if ($("#use-shipping").length) {
      var $required = $("#billing").find("[required]");
      $required.removeAttr("required");

      $("#use-shipping").on("change click", function () {
        if (this.checked) {
          $("#shipping").css("display", "block");
          $("#billing").css("display", "none");
          $required.attr("required", "true");
          $required.removeAttr("required");
        } else {
          $("#shipping").css("display", "none");
          $("#billing").css("display", "block");
          $required.attr("required", "true");
        }
      });
    }
  }

  return {
    main: function () {
      handleSliders();
      handleAnimation();
      handleLazyLoad();
      handleSelect();
      handleFileInput();
      handleSmoothScroll();
      handleScrollToTop();
      handleFilters();
      handleHeader();
      handleObjectFit();
      handleBillingAddress();
      handleProductImages();
      //handleVariants();
      $("#qty, .qty").QtyInput();

      $('body').addClass('loaded');
    },
  };
}(jQuery));

jQuery(document).ready(function () {
  App.main();
});
