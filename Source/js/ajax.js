import jQuery from 'jquery';

import { throttle } from 'throttle';

var Ajax = (function ($) {
  if (!(window.history && history.pushState)) {
    $.fn.ajaxLoad = $.noop;
    return
  };

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  var scroll = sessionStorage.getItem('scroll');

  if (scroll) {
    window.scrollTo(0, scroll);
  }

  var Ajax = {};

  var localCache = {
    /**
     * timeout for cache in millis
     * @type {number}
     */
    timeout: 30000,
    /** 
     * @type {{_: number, data: {}}}
     **/
    data: {},
    remove: function (url) {
      delete localCache.data[url];
    },
    exist: function (url) {
      return !!localCache.data[url] && ((new Date().getTime() - localCache.data[url]._) < localCache.timeout);
    },
    get: function (url) {
      return localCache.data[url].data;
    },
    set: function (url, cachedData, callback) {
      localCache.remove(url);
      localCache.data[url] = {
        _: new Date().getTime(),
        data: cachedData
      };
      if ($.isFunction(callback)) callback(cachedData);
    }
  };

  var $content = $("#main-content");

  Ajax.LoadPage = function (url, shouldPush = true, scroll = null) {
    var loadPromise = new Promise(function (resolve, reject) {
      $.ajax({
        url: url,
        cache: false,
        beforeSend: function () {
          $(document).trigger("ajax:loading");

          $("body").removeClass("loaded").addClass("loading");

          if (localCache.exist(url)) {
            resolve(localCache.get(url));
            return false;
          }

          return true;
        },
        success: function (html) {
          localCache.set(url, html);
          resolve(html);
        },
        error: function (e) {
          reject(e);
        }
      });
    });

    var timingPromise = new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve();
      }, 800);
    });

    Promise.all([loadPromise, timingPromise])
      .then(function (values) {
        history.replaceState({ scroll: $(window).scrollTop() }, document.title, window.location);

        var html = values[0];
        $content.html(html);

        var href = url.indexOf("#") != -1 ? url.substr(url.indexOf("#")) : "";

        var $ele = $(href);

        if (scroll) {
          window.scrollTo(0, scroll);
        }
        else if ($ele.length) {
          window.scrollTo(0, $ele.offset().top);
          $ele.focus();
        } else {
          window.scrollTo(0, 0);
          $content.focus();
        }

        var pageMeta = {
          title: ""
        };

        try {
          pageMeta = JSON.parse($("#page-meta").html());
        } catch (e) {
          pageMeta = {
            title: ""
          };
        }

        if (shouldPush) {
          history.pushState({ scroll: 0 }, pageMeta.title, url);
        }

        document.title = pageMeta.title;

        $("body").removeClass("loading").addClass("loaded");

        $(document).trigger("ajax:loaded");
      })
      .catch(function (e) {
        window.location = url;
        $(document).trigger("ajax:failed");
      });

    return loadPromise;
  };

  Ajax.BindEvents = function () {
    window.addEventListener('popstate', (event) => {
      if (event.state) {
        Ajax.LoadPage(window.location.pathname, false, event.state.scroll);
      }
    });

    $(window).on('scroll', throttle(function () {
      var scroll = $(window).scrollTop()
      history.replaceState({ scroll: scroll }, document.title, window.location);
      sessionStorage.setItem('scroll', scroll);
    }, 1000));
  };

  Ajax.BindEvents();

  Ajax.BindLinks = function ($links) {
    $links.on('click', function (e) {
      var $ele = $(this);
      var href = this.href;

      var isInternal = location.hostname === this.hostname || !this.hostname.length;
      var isHashChange = location.pathname == this.pathname && this.hash.length > 0;
      
      if (isInternal && !isHashChange) {
        e.preventDefault();
        Ajax.LoadPage(href, location.pathname != this.pathname);
      }
    });
  };

  Ajax.makeJQueryPlugin = function () {
    if (!$) return; 

    $.fn.ajaxLoad = function (options) {
      Ajax.BindLinks($(this));

      return $(this);
    };
  };

  // try making plugin
  Ajax.makeJQueryPlugin();
}(jQuery));


export default Ajax;
