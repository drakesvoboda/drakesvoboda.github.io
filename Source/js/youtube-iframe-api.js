import jQuery from 'jquery';

(function ($) {
  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  function onYouTubeIframeAPIReady() {
    var $iframes = $('iframe');

    $iframes.each(function () {
      if ($(this).attr('src').includes('youtube')) {
        var src = $(this).attr('src');
        var url = new URL(src);
        url.searchParams.append('enablejsapi', '1');
        $(this).attr('src', url);

        new YT.Player(this, {
          events: {
            'onStateChange': onPlayerStateChange(this)
          }
        });
      }
    });
  }

  window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

  function handleVideo(ele, playerStatus) {
    if (playerStatus == -1) {
      // unstarted
      $(ele).trigger("youtube:unstarted");
    } else if (playerStatus == 0) {
      // ended
      $(ele).trigger("youtube:ended");
    } else if (playerStatus == 1) {
      // playing = green
      $(ele).trigger("youtube:play");
    } else if (playerStatus == 2) {
      // paused = red
      $(ele).trigger("youtube:paused");
    } else if (playerStatus == 3) {
      // buffering = purple
      $(ele).trigger("youtube:buffering");
    } else if (playerStatus == 5) {
      // video cued
      $(ele).trigger("youtube:cued");
    }
  }

  function onPlayerStateChange(ele) {
    return function (event) {
      handleVideo(ele, event.data);
    }
  }
}(jQuery))
