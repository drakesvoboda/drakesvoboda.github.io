import jQuery from 'jquery';
import getQueryStringValue from 'query-string';
import './_dropdown-menu.scss';

function getCmsIdFromClass(className, contentPrefix) {
  var result;

  var classList = className.split(/\s+/);

  for (var i = 0; i < classList.length; i++) {
    if (classList[i] && classList[i].length > 0 && classList[i].substring(0, contentPrefix.length) === contentPrefix) {
      result = classList[i].substring(contentPrefix.length);
      i = classList.length;
    }
  }

  return result;
}

function getSubmenuContent(menuID, currentContentId) {
  var cacheQryval = getQueryStringValue("cache");

  return $.ajax({
    type: "GET",
    url: "/CMS/Navigation/DropdownMenu" + ((cacheQryval === '0') ? "?cache=0" : ""),
    data: { MenuId: menuID, contentID: currentContentId },
    dataType: 'html'
  })
}

function factory($) {
  function Dropdown($list) {
    var hoverTimer;
    var bodyContentId = getCmsIdFromClass($("body").attr('class'), 'c');

    $list.addClass('dropdown-menu');

    var $NavItem = $list.children('li');
    var $NavLinks = $NavItem.children('a');

    var closeDropdown = function ($el) {
      $el.children('.dropdown-submenu').remove();
      $el.removeClass('dropdown-open');
    };

    var mouseIn = function () {
      clearTimeout(hoverTimer);

      var self = this;

      var promise = new Promise(function (resolve, reject) {
        closeDropdown($(self).siblings('li'));

        if ($(self).hasClass("dropdown-open")) {
          resolve();
          return;
        }

        $(self).addClass('dropdown-open');

        getSubmenuContent($(self).data('menu-id'), bodyContentId)
          .done(function (html) {
            $(self).append(html);
            resolve();
          }).fail(reject);
      });

      return promise;
    };

    var mouseOut = function () {
      clearTimeout(hoverTimer);
      var self = this;
      hoverTimer = setTimeout(function () { closeDropdown($(self)); }, 500);
    };

    $NavItem
      .hover(mouseIn, mouseOut)
      .focus(mouseIn);

    $(window).click(function (e) {
      if (!$(e.target).is($NavItem) && !$(e.target).closest($NavItem).length) {
        closeDropdown($NavItem);
      }
    });

    $NavItem.on('touchstart', function (e) {
      e.preventDefault();

      var self = this;

      mouseIn.bind(self)()
        .then(function () {
          $(self)
            .children(".dropdown-submenu")
            .children('.overview-link')
            .css('display', 'block');
        })
        .catch(function () {
          $(self).click()
        })
    });
  }

  Dropdown.makeJQueryPlugin = function () {
    if (!$)
      return;

    $.fn.dropdown = function (options, callback) {
      return new Dropdown($(this));
    };
  };

  // try making plugin
  Dropdown.makeJQueryPlugin();

  return Dropdown;
};

export default factory(jQuery);
