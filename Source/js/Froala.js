import jQuery from 'jquery'; /*window.$ = jQuery; window.jQuery = jQuery;*/

var $ = jQuery;

require('froala-editor');
require('froala-editor/css/froala_editor.pkgd.min.css');
require("froala-editor/js/plugins/align.min.js");
require("froala-editor/js/plugins/code_view.min.js");
require("froala-editor/js/plugins/code_beautifier.min.js");
require("froala-editor/js/plugins/colors.min.js");
require("froala-editor/js/plugins/emoticons.min.js");
require("froala-editor/js/plugins/entities.min.js");
require("froala-editor/js/plugins/file.min.js");
require("froala-editor/js/plugins/font_family.min.js");
require("froala-editor/js/plugins/font_size.min.js");
require("froala-editor/js/plugins/fullscreen.min.js");
require("froala-editor/js/plugins/image.min.js");
require("froala-editor/js/plugins/image_manager.min.js");
require("froala-editor/js/plugins/inline_style.min.js");
require("froala-editor/js/plugins/line_breaker.min.js");
require("froala-editor/js/plugins/link.min.js");
require("froala-editor/js/plugins/lists.min.js");
require("froala-editor/js/plugins/paragraph_format.min.js");
require("froala-editor/js/plugins/paragraph_style.min.js");
require("froala-editor/js/plugins/quick_insert.min.js");
require("froala-editor/js/plugins/quote.min.js");
require("froala-editor/js/plugins/save.min.js");
require("froala-editor/js/plugins/url.min.js");
require("froala-editor/js/plugins/video.min.js");
require("froala-editor/js/plugins/table.min.js");
require("froala-editor/css/plugins/char_counter.min.css");
require("froala-editor/css/plugins/code_view.min.css");
require("froala-editor/css/plugins/colors.min.css");
require("froala-editor/css/plugins/draggable.min.css");
require("froala-editor/css/plugins/emoticons.min.css");
require("froala-editor/css/plugins/file.min.css");
require("froala-editor/css/plugins/fullscreen.min.css");
require("froala-editor/css/plugins/help.min.css");
require("froala-editor/css/plugins/image.min.css");
require("froala-editor/css/plugins/image_manager.min.css");
require("froala-editor/css/plugins/line_breaker.min.css");
require("froala-editor/css/plugins/quick_insert.min.css");
require("froala-editor/css/plugins/special_characters.min.css");
require("froala-editor/css/plugins/table.min.css");
require("froala-editor/css/plugins/video.min.css");

$.FroalaEditor.DEFAULTS.key = "EE3E3B2F1tA6B4C2D4C7D1B1E1D4I4oa2Pe2HTPYh1RNc2E1KDc1==";

const froalaConfig = {
  fileUploadURL: '/administer/InsertImageContent',
  imageUploadURL: '/administer/InsertImageContent',
  imageGetJson: '/administer/GetUploadedFiles',
  htmlRemoveTags: ['html', 'head', 'link', 'body', 'meta', 'applet'],
  toolbarButtons: ['fullscreen', 'html', 'paragraphFormat', 'bold', 'italic', 'fontSize', '|', 'undo', 'redo', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '|', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', '|', 'clearFormatting', 'selectAll', 'color', 'inlineStyle', 'paragraphStyle'],
  toolbarButtonsMD: ['fullscreen', 'html', 'paragraphFormat', 'bold', 'italic', 'fontSize', '|', 'undo', 'redo', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '|', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', '|', 'clearFormatting', 'selectAll', 'color', 'inlineStyle', 'paragraphStyle'],
  toolbarButtonsSM: ['fullscreen', 'html', 'paragraphFormat', 'bold', 'italic', 'fontSize', '|', 'undo', 'redo', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '|', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', '|', 'clearFormatting', 'selectAll', 'color', 'inlineStyle', 'paragraphStyle'],
  toolbarButtonsXS: ['fullscreen', 'html', 'paragraphFormat', 'bold', 'italic', 'fontSize', '|', 'undo', 'redo', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '|', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', '|', 'clearFormatting', 'selectAll', 'color', 'inlineStyle', 'paragraphStyle'],
  paragraphFormat: {
    N: 'Normal',
    H1: 'Heading 1',
    H2: 'Heading 2',
    H3: 'Heading 3',
    H4: 'Heading 4',
    H5: 'Heading 5',
    PRE: 'Code'
  },
  linkStyles: {
    'link': 'Link',
    'btn': 'Button',
    "download-link": 'Download Link'
  },
  paragraphStyles: {
    "no-break": 'No Break',
    "columns-2": 'Two Columns',
    "h1": 'Heading 1',
    "h2": 'Heading 2',
    "h3": 'Heading 3',
    "h4": 'Heading 4',
    "h5": 'Heading 5',
    "h6": 'Heading 6'
  },
}

function validateItems() {
  var ajaxData = [];
  ajaxData = fillAjaxData(0);

  if (ajaxData.length > 0) {
    $.ajax({
      type: "POST",
      url: "/CMS/Administrator/exclusions",
      contentType: 'application/json',
      data: JSON.stringify(ajaxData),
      success: function (msg) {
        // process the results
        var exclusions = jQuery.parseJSON(msg);

        $(".McmsEdit").each(function (index) {
          var table = $(this).data("t");
          var column = $(this).data("c");
          var id = $(this).data("i");
          var key = $(this).data("k");
          var dataType = $(this).data("type");
          var content = $(this).text();
          var removeEdit = false;

          exclusions.forEach(function (exclusion) {
            if (exclusion.t == table && exclusion.i == id) {
              removeEdit = true;
            }
          });

          if (removeEdit) {
            $(this).removeClass("McmsEdit");
          }

        });
      },

      fail: function () {
        $(".McmsEdit").each(function (index) {
          $(this).removeClass("McmsEdit");
        });
      }
    });
  }

};

function handleToolbar() {
  $('.cms_open-toolbar').on('click', function () {
    $('#cmsEditBar').toggleClass('expanded');
  })
}

function startFriola() {
  var pageLanguage = $('html')[0].lang;
  $(".saveLink").css("display", "none");
  $(".publishLink").css("display", "none");
  $(".cancelLink").css("display", "none");
  $(".editLinkInPage").css("display", "none");
  // lets bind the editor

  pageLanguage = 'en';// Localize.getLanguage();

  if (pageLanguage == 'en') {
    $(".editLinkInPage").css("display", "inline-block");
    // lets bind save
    $(".saveLink").on('click', function () {
      saveContent(this, 0);
      return false;
    });

    $(".publishLink").on('click', function () {
      saveContent(this, 1);
      return false;

    });

    $(".editLinkInPage").on('click', function () {
      $('.McmsEdit[data-type="text"]').each(function () {
        var htmlString = $(this).html();
        $(this).text(htmlString);
      });

      initfroala();

      $('html').addClass('CMS-InPageEditing');
      $('#cmsEditBar').removeClass('expanded');

      $(".cancelLink").on('click', function () {

        $('html').removeClass('CMS-InPageEditing');
        destroyfroala();

        return false;

      });

      return false;

    });
  }
}

function saveContent(cItem, publish) {
  // make sure the language is english!!!

  if ($(cItem).data("p") != null) {
    publish = $(cItem).data("p");
  }

  var pageLanguage = $('html')[0].lang;
  pageLanguage = 'en';//Localize.getLanguage();

  if (pageLanguage == 'en') {
    destroyfroala();
    var saveResult = "All Items have been saved.";
    var ajaxData = [];
    ajaxData = fillAjaxData(publish);

    if (ajaxData.length > 0) {
      $.ajax({
        type: "POST",
        url: "/CMS/Administrator/inLineSave",
        contentType: 'application/json',
        data: JSON.stringify(ajaxData),
        success: function (msg) {
          $(".inpageAlert").fadeOut(0);
          $(".inpageAlert").html("<span class='alert'>" + msg + "</span>");
          $(".inpageAlert").fadeIn(500);
        },
        fail: function () {
          $(".inpageAlert").fadeOut(0);
          $(".inpageAlert").html("<span class='alert'>Sorry, not all items were saved.</span>");
          $(".inpageAlert").fadeIn(500);
        }
      });
    }
    else {
      saveResult = "Nothing to save."
    }
  }
  else {
    $(".saveLink").css("display", "none");
    $(".publishLink").css("display", "none");
  }
}

function cancel(e) {
  e.preventDefault();
}

function initfroala() {
  $("a").on('click', cancel);

  $(".inpageAlert").html('');
  $(".editLinkInPage").fadeOut(1);
  $(".editLink").fadeOut(1);
  $(".saveLink").fadeIn(500);
  $(".publishLink").fadeIn(500);;
  $(".cancelLink").fadeIn(500);;
  $(".McmsEdit").addClass("on");

  $(".wrapper a").bind('click', function (e) {
    return false;
  });

  $('.McmsEdit[data-type="text"]').froalaEditor(
    {
      enter: $.FE.ENTER_BR,
      toolbarInline: true,
      initOnClick: true,
      htmlDoNotWrapTags: ['script', ''],
      toolbarButtons: []
    }
  );

  $('.McmsEdit[data-type="html"]').froalaEditor($.extend(froalaConfig, {
    toolbarInline: true,
    initOnClick: true
  }));
}

var ipto;

function destroyfroala() {
  $("a").off('click', cancel);

  $('.McmsEdit[data-type="text"]').froalaEditor('destroy')
  $('.McmsEdit[data-type="html"]').froalaEditor('destroy')

  $(".wrapper a").unbind('click');
  $(".wrapper a").bind('click', function () {
    window.location.href = $(this).attr("href");
  });
  $(".editLinkInPage").fadeIn(500);
  $(".editLink").fadeIn(500);
  $(".saveLink").fadeOut(1);
  $(".publishLink").fadeOut(1);
  $(".cancelLink").fadeOut(1);

  $(".McmsEdit").removeClass("on");

  ipto = setTimeout(function () {
    $(".inpageAlert").fadeOut(500);

  }, 5000);
}

function fillAjaxData(publish) {
  var exclusionData = [];

  $(".McmsEdit").each(function (index) {

    var table = $(this).data("t");
    var column = $(this).data("c");
    var id = $(this).data("i");
    var key = $(this).data("k");
    var dataType = $(this).data("type");

    var content = $(this).text();
    if (dataType == "html") {
      content = $(this).html();
    }

    var ajaxItem = { t: table, c: column, i: id, k: key, type: dataType, ctn: content, p: publish };

    exclusionData.push(ajaxItem);
  });

  return exclusionData
}

$(document).ready(function () {
  validateItems();
  startFriola();
  handleToolbar();

  $('#ceContent, #ceContent2, #ceContent3, #ceContent4').froalaEditor($.extend(froalaConfig, {
    height: 500
  }));
});
