import jQuery from 'jquery';

import { requestAnimFrame } from 'animation';

function factory($) {
  function Letters($ele, duration, delay) {

    $ele.each(function () {
      var text = $(this).text();
      var words = text.split(" ");

      words = words.map(w => w.replace(/([^\x00-\x80]|\w)/g, '<span class="letter">$&</span>'))
      words = words.map(w => `<span style="white-space: nowrap">${w}</span>`);

      $(this).html(words.join(' '));
    });

    var $letters = $ele.find(".letter");

    $letters.each(function (i) {
      $(this).css("transition-delay", delay + (duration / $letters.length * i) + "ms")
    });

    $ele.addClass("letters-init");
   
  }

  Letters.makeJQueryPlugin = function () {
    if (!$) return;

    $.fn.letters = function () {
      return new Letters($(this), ...arguments);
    };
  };

  // try making plugin
  Letters.makeJQueryPlugin();

  return Letters;
};

export default factory(jQuery);
