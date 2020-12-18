import jQuery from 'jquery';

var QtyInput = (function ($) {
  function QtyInput(ele, options) {
    var $btnSub = $('<button class="qty-input__sub" type="button"><span class="sr-only">Deincrement quantity</span></button>');
    var $btnAdd = $('<button class="qty-input__add" type="button"><span class="sr-only">Increment quantity</span></button>');
    var $container = $('<div class="qty-input"></div>');

    $(ele).wrap($container);
    $(ele).before($btnSub);
    $(ele).after($btnAdd);

    $btnSub.on('click', function () {
      if (ele.value == "") ele.value = 1;
      else if (parseInt(ele.value) - parseInt(ele.step) >= parseInt(ele.min)) {
        ele.value = parseInt(ele.value) - parseInt(ele.step);
        $(ele).trigger("change");
      }
    });

    $btnAdd.on('click', function () {
      if (ele.value == "") ele.value = 1;
      else {
        ele.value = parseInt(ele.value) + parseInt(ele.step);
        $(ele).trigger("change");
      }
    });

    $(ele).on('input', function () {
      this.value = this.value.replace(/[^0-9.]/g, '');
      this.value = this.value.replace(/(\..*)\./g, '$1');
    });
  }

  QtyInput.makeJQueryFunction = function () {
    if (!$) return;

    $.fn.QtyInput = function (options) {
      $(this).each(function () {
        this.qtyInput = new QtyInput($(this).get(0), options);
      });

      return $(this);
    };
  }

  QtyInput.makeJQueryFunction();

  return QtyInput;
}(jQuery));
