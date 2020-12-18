import jQuery from 'jquery';
import { debounce } from 'throttle';

var store = (function ($) {
  var getMiniCart = function (skuID) {
    $.ajax({
      url: '/Commerce/CartNotification',
      method: 'GET',
      data: { SKUID: skuID },
      success: function (data) {
        $('.content-container').append(data);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {

      }
    });
  }

  var postWithAjax = function (ele) {
    $('#cart-added').remove();

    var form = $(ele).closest('form');

    var timeout;
    var loader = ["Loading.&nbsp;&nbsp;", "Loading..&nbsp;", "Loading...", "Loading&nbsp;..", "Loading&nbsp;&nbsp;.", "Loading&nbsp;&nbsp;&nbsp;"];
    var len = loader.length - 1;
    var i = 0;
    var timeout;

    var btnContent = $(ele).html();
    if (!$(ele).attr("disabled")) {
      $.ajax({
        url: "/Commerce/AddToCartWithNotification",
        method: 'POST',
        data: form.serialize() + '&pageurl=' + window.location.href.replace(location.origin, ''),
        beforeSend: function () {
          $(ele).attr("disabled", "disabled");
          $(ele).width($(ele).width());
          $(ele).html(loader[i]);
          timeout = setInterval(function () {
            $(ele).html(loader[i]);
            i = (i < len) ? i + 1 : 0
          }, 200);
        },
        success: function (data) {
          clearInterval(timeout);
          $(ele).html(btnContent);
          $(ele).width('auto');
          $(ele).removeAttr("disabled");
          $('body').append(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          console.error(errorThrown);
          clearInterval(timeout);
          if (errorThrown.indexOf("Sorry!")!==-1)
          {
            $(ele).html(errorThrown);
          }
          else
          {
            $(ele).html("Oh no! There was an error.");
          }
          $(ele).width('auto');
          $(ele).removeAttr("disabled");
        },
      });
    }
  }

  var closeMiniCart = function () {
    $('#cart-added').fadeOut('fast', function () { $('#cart-added').remove(); })
  }

  var updateCartTotal = function () {
    var total = [].slice.call(document.getElementsByClassName('cart__row__subtotal'))
      .map(function (x) { return parseFloat(x.innerText) })
      .reduce(function (sum, value) { return sum + value; }, 0);
    var disctotal = [].slice.call(document.getElementsByClassName('cart__row__B4Disctotal'))
      .map(function (x) { return parseFloat(x.innerText) })
      .reduce(function (sum, value) { return sum + value; }, 0);
    var qty = [].slice.call(document.getElementsByClassName('qty'))
      .map(function (x) { return parseFloat(x.value) })
      .reduce(function (sum, value) { return sum + value; }, 0);

    $('.table-subtotal, .table-total, .subtotal').html("$" + total.toFixed(2));
    $('.table-num-items').html(qty + " Item" + (qty > 1 ? "s" : ""));
    $('.cart_subtotal_B4Disc').html("$" + disctotal.toFixed(2));
    
    
  }

  var updateCartRow = function (ele) {
    var form = $(ele);

    if (!ele.updateCartRow) {
      ele.updateCartRow = debounce(function () {
        if (!form.hasClass('submitted')) {
          var url = "/Commerce/UpdateCartRowWithAjax";

          $.ajax({
            url: url,
            method: 'POST',
            data: form.serialize(),
            beforeSend: function () {
              form.css('opacity', '.5').css("pointer-events", "none").addClass('submitted');
            },
            success: function (data) {
              if (data) {
                var $target = form.closest('.ajax-target');
                $target.html(data);
                $target.find(".qty").QtyInput();
              } else {
                form.closest('.ajax-target').remove();
              }

              updateCartTotal();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
              console.error(errorThrown);
            },

          });
        }
      }, 1000, false);
    }

    ele.updateCartRow();
  }

  var updateShippingPrice = function (ele) {
    var shippingCode = $(ele).val();
    var url = "/Commerce/GetShippingPrice";

    $.ajax({
      url: url,
      method: 'POST',
      data: { ShippingCode: shippingCode },
      beforeSend: function () {
        $('#ShippingPriceResults .shipping-price').css('opacity', '.5');
      },
      success: function (data) {
        $('#ShippingPriceResults').html(data);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        console.log(errorThrown);
      },

    });
  }

  var init = function () {
    $(document).click(function (e) {
      var container = $('#cart-added');

      // if the target of the click isn't the container nor a descendant of the container
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.fadeOut('fast', function () { $('#cart-added').remove(); });
      }
    });
  }

  init();

  return {
    closeMiniCart: closeMiniCart,
    getMiniCart: getMiniCart,
    postWithAjax: postWithAjax,
    updateCartRow: updateCartRow,
    updateShippingPrice: updateShippingPrice,
  }
})(jQuery);

export default store;
