import jQuery from 'jquery';

var Listing = (function ($) {
  return {
    Filter: function (form, postUrl) {
      window.history.replaceState('', '', '?' + $(form).serialize());

      if ($.ajax) {
        var $listArticles = $("#listing");
        if ($listArticles.length) {
          $.ajax({
            type: "GET",
            url: postUrl,
            data: $(form).serialize(),
            datatype: "html",
            beforeSend: function () {
              $listArticles.addClass('opaque');
            },
            success: function (data) {
              $listArticles.html(data).removeClass('opaque');

              //for ADA
              setTimeout(function () {
                $("#Aria-Announcements").html('<div aria-live="polite" role="alert"> Main content has been updated. Tab to discover.</div>');
              }, 3000);

              setTimeout(function () {
                $("#Aria-Announcements").html('');
              }, 10000);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
            }
          });
        }
        return false;
      }

      return true;
    },

    Paginate: function (pagenumber, postUrl, event) {
      if ($.ajax) {
        var $listArticles = $("#list-articles");
        if ($listArticles.length) {
          event.preventDefault();
          $.ajax({
            type: "GET",
            url: postUrl,
            data: { 'currentpage': pagenumber },
            datatype: "html",
            beforeSend: function () {
              document.body.scrollTop = document.documentElement.scrollTop = 0;
              $listArticles.addClass('opaque');
            },
            success: function (data) {
              $listArticles.html(data).removeClass('opaque');
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {

            }
          });
        }
      }
    },

    LoadMore: function (pagenumber, postUrl, event, ele) {
      if ($.ajax) {
        var $listArticles = $("#listing");
        if ($listArticles.length) {
          event.preventDefault();
          var loader = ["Loading.&nbsp;&nbsp;", "Loading..&nbsp;", "Loading...", "Loading&nbsp;..", "Loading&nbsp;&nbsp;.", "Loading&nbsp;&nbsp;&nbsp;"];
          var len = loader.length - 1;
          var i = 0;
          var timeout;
          var $button = $("#load-more-button a");
          var $span = $("#load-more-button span");
          if (!$button.attr("disabled")) {
            $.ajax({
              type: "GET",
              url: postUrl,
              data: { 'CurrentPage': pagenumber },
              datatype: "html",
              beforeSend: function (jqXHR, settings) {
                $button.attr("disabled", "disabled");
                $button.width($("#load-more-button a").width());
                $span.get(0).innerHTML = loader[i];
                timeout = setInterval(function () {
                  $span.get(0).innerHTML = loader[i];
                  i = (i < len) ? i + 1 : 0
                }, 200);
              },
              success: function (data) {
                clearInterval(timeout);
                $("#load-more-button").remove();

                $listArticles.append('<div id="page-' + pagenumber + '" tab-index="0" class="sr-only"> page ' + pagenumber + ' contents displayed below.</div>' + data);

                //for ada
                setTimeout(function () {
                  $("#Aria-Announcements").html('<div aria-live="polite" role="alert"> Page ' + pagenumber + ' content has been updated. Tab to discover.</div>');
                }, 3000);
                $("#page-" + pagenumber).focus();
                setTimeout(function () {
                  $("#Aria-Announcements").html('');
                }, 10000);

                $(window).trigger('resize');
              },
              error: function (XMLHttpRequest, textStatus, errorThrown) {

              }
            });
          }
        }
      }
    },
  }
}(jQuery));

export default Listing;
