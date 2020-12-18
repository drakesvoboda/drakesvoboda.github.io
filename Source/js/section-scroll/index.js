import { requestAnimFrame } from "../animation";
import Bezier from "./bezier";
import $ from 'jquery';
import Inertia from "../inertia";

if (!String.prototype.startsWith) { // Polyfill for string.startsWith
  String.prototype.startsWith = function (searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

var Animator = (function () {
  var SectionsHashMap = [];
  var IsRunning = false;
  var key = 0;

  var fps = 120,
    now,
    then = Date.now(),
    interval = 1000 / fps,
    delta;

  var flush = function () {
    SectionsHashMap.forEach(function (x) { x.flushStyles(); });
  }

  var loop = function () {
    if (!IsRunning) return;

    requestAnimFrame(loop);
    now = Date.now();
    delta = now - then;

    if (delta > interval) {
      then = Date.now();
      flush();
    }
  }

  return {
    run: function () {
      if (!IsRunning) {
        IsRunning = true;
        requestAnimFrame(loop);
      }
    },

    addSection: function (sec) {
      SectionsHashMap[key] = sec;

      if (!IsRunning) {
        IsRunning = true;
        requestAnimFrame(loop);
      }

      return key++;
    },

    removeSection: function (key) {
      delete SectionsHashMap[key];
    }
  }

})();

var TimingFunctions = {
  ease: Bezier(.25, .1, .25, 1),
  easeIn: Bezier(.42, 0, 1, 1),
  easeOut: Bezier(0, 0, .58, 1),
  easeInOut: Bezier(.42, 0, .58, 1)
}

var Section = (function () {
  function Section($obj) {
    var _ = this;
    _.objects = []; /* List of transitionObj for each object that has a transition  */
    _.ele = $obj;
    _.range = { min: null, max: null };
    _.scrollHandler;
    _.scrollTop = $obj.get(0).getBoundingClientRect().top + $(window).scrollTop() - $(window).innerHeight();
    _.shouldFlush = false;

    $(window).resize(function () { _.scrollTop = $obj.get(0).getBoundingClientRect().top + $(window).scrollTop() - $(window).innerHeight(); })

    $(_.ele).find('.scroll-transition').each(function () {
      var newTransition = new transitionObj($(this))
      _.objects.push(newTransition); /* Add each object with transitions */
      _.range = { min: Math.min(_.range.min, newTransition.range.min), max: Math.max(_.range.max, newTransition.range.max) };
    });

    _.attachScroll();

    _.key = Animator.addSection(_);
  }

  return Section;
}());


Section.prototype.flushStyles = function () {
  var _ = this;
  if (_.shouldFlush) {
    _.objects.forEach(function (x) { x.ele.setAttribute('style', x.styleString) });
  }
}

Section.prototype.attachScroll = function () {
  var _ = this;
  var objects = _.objects, percentage, height = _.ele.innerHeight(), scrollTop, inRange = true, range = _.range;

  _.scrollHandler = function (scrollPosition) {
    percentage = ($(window).scrollTop() - _.scrollTop) / height;

    if (percentage >= range.min && percentage <= range.max) {
      objects.forEach(function (x) { x.applyTransitions(percentage); });
      _.shouldFlush = true;
      inRange = true;
    } else if (inRange) { /*Only runs out of bounds transition once: avoids repeat transitions*/
      objects.forEach(function (x) { x.applyTransitions(percentage); });
      _.shouldFlush = true;
      inRange = false;
    }
  }

  _.scrollHandler();

  window.addEventListener('scroll', _.scrollHandler);
}

Section.prototype.destroy = function () {
  var _ = this;
  Animator.removeSection(_.key);
  window.removeEventListener('scroll', _.scrollHandler)
  _.scrollHandler = null;

  var destroy = function () {
    var dfd = new $.Deferred();
    _.objects.forEach(function (x) { x.destroy(); });
    dfd.resolve("");

    return dfd.promise();
  }

  destroy().then(function () {
    _.objects = null;
  });

  _.range = null;
  _.ele = null;
}

var transitionObj = (function () {

  function transitionObj($obj) {
    var _ = this;
    _.ele = $obj.get(0); /* JQuery object */
    _.initialStyleString = $obj.attr('style') || "";
    _.initialStyleString = _.initialStyleString.replace(/\s/g, '').replace(/;+$/, ""); /* Get initial inline style and remove whitespace and trailing ";" */

    _.styleString = _.initialStyleString

    _.range = { min: null, max: null };

    _.transitions = _.defineTransitions([].filter.call(_.ele.attributes, function (at) { return /^data-transition-/.test(at.name); })); /*  define a transition for each data-transition attribute  */
  }

  return transitionObj;
}());

transitionObj.prototype.destroy = function () {
  var _ = this;

  _.ele.setAttribute('style', _.initialStyleString);
}

transitionObj.prototype.applyTransitions = function (percentage) {
  /* Precondition: percentage
   * Postcondition: elements in dom are updated with new styles
   */
  var _ = this;
  var styleString = _.initialStyleString,
    attributeRhs, replacement,
    ele = _.ele,
    regEx = /^([\S\s]*?)(?:\{\})([\S\s]*)$/, /* Splits string around first "{}" */
    k, i = 0, len = _.transitions.length;


  for (; i < len; ++i) {
    attributeRhs = _.transitions[i].attributeRhs;
    k = 0;

    replacement = attributeRhs.match(regEx);
    while (replacement) { /* If there is still a remaining "{}" */

      attributeRhs = replacement[1] + _.transitions[i].values[k++].getValue(percentage) + replacement[2]; /* Replace "{}" with the associated value */
      replacement = attributeRhs.match(regEx);
    }

    styleString += ";" + _.transitions[i].attributeLhs + ":" + attributeRhs; /* Append new style to style attribute string */
  }

  _.styleString = styleString; /* Update element */
}

transitionObj.prototype.defineTransitions = function (transitionList) {
  //Precondition: CSS styles in an array ["style[easing]:value", ...]

  var transitions = [],
    _ = this,
    decimalRegEx = /\-?\.?\d+\.?\d*/; //Matches decimal number with or without leading "-"

  for (var i = 0; i < transitionList.length; ++i) {
    var dataPercentage = transitionList[i].name.match(/(?:\-)(\-?\d+)/)[1] / 100; //Get percentage from data attribute.
    _.range = { min: Math.min(dataPercentage, _.range.min), max: Math.max(dataPercentage, _.range.max) };

    var cssAttributes = transitionList[i].value.replace(/;+$/, "").replace(/\s/g, '').split(';'); //Remove whitepace and trailing ";" then split each style

    for (var j = 0; j < cssAttributes.length; ++j) {
      var attribute = cssAttributes[j];
      var splitAttribute = attribute.split(':');
      var attributeLhs = splitAttribute[0],
        attributeRhs = splitAttribute[1];

      //Determine easing function
      var parsedEasingFunction = parseEasingFunction(attributeLhs);

      var easingFunction = parsedEasingFunction.easingFunction;
      attributeLhs = parsedEasingFunction.outputString;

      _.initialStyleString = _.initialStyleString.replace(new RegExp(attributeLhs + ".+?;"), ""); //Remove transition style attribute from initial style string

      //Populate Values
      var populatedValues = populateNumericalValues(attributeRhs, dataPercentage, easingFunction);

      var values = populatedValues.values;
      attributeRhs = populatedValues.outputString;

      //Define Transitions
      var newTransition = true;
      for (var l = 0, len = transitions.length; l < len; ++l) { //Determine if the style was already defined in a seperate data-transition attribute. If found, only record the new cssValuePair
        if (transitions[l].equals(attributeLhs, attributeRhs)) {
          for (var m = 0, mlen = transitions[l].values.length; m < mlen; ++m) {
            transitions[l].values[m].valuePairs = transitions[l].values[m].valuePairs.concat(values[m].valuePairs).sort(function (a, b) { return a.percentage - b.percentage });
            if (!transitions[l].values[m].easingFunction) transitions[l].values[m].easingFunction = values[m].easingFunction;
          }
          newTransition = false;
          break;
        }
      }

      if (newTransition) {
        transitions.push(new transition(attributeLhs, attributeRhs, values)); //Push new transitions 
      }
    }

  }

  return transitions;
}

function populateNumericalValues(inputString, percentage, easingFunction) {
  /* Precondition: string for value of css style, percentage for value, easingFunction for transition 
   * Postcondition: List of values and value pairs
   *                inputString with each decimal number replaced with "{}"
   */

  var values = [],
    value = inputString.match(/\-?\.?\d+\.?\d*/);

  while (value) { //Replace each number in the string with '{}', record the number and percentage as a cssValuePair for that cssValue
    inputString = inputString.replace(value[0], '{}');
    values.push(new cssValue([new cssValuePair(percentage, value[0])], inputString.startsWith('rgb'), easingFunction));
    value = inputString.match(/\-?\.?\d+\.?\d*/);
  }

  return {
    values: values, //List of values and value pairs
    outputString: inputString //inputString with each decimal replaced by "{}"
  };
}

function parseEasingFunction(inputString) {
  /* Precondition: String containing an easing function between two brackets.      
   * Postcondition: Easing function with parameter x
   *                String with brackets removed
   */
  var bracketRegex = /(.*)(\[.*\])/,
    easingFunctionString,
    easingFunction;

  var matchEasing = inputString.match(bracketRegex);

  if (matchEasing) {
    inputString = matchEasing[1];
    easingFunctionString = matchEasing[2];

    switch (easingFunctionString) {
      case "[ease]":
        easingFunction = TimingFunctions.ease;
        break;
      case "[easeIn]":
        easingFunction = TimingFunctions.easeIn;
        break;
      case "[easeOut]":
        easingFunction = TimingFunctions.easeOut;
        break;
      case "[easeInOut]":
        easingFunction = TimingFunctions.easeInOut;
        break;
      default:
        var parseBezier = easingFunctionString.match(/\[(0?\.\d+|1|0)\,(\-?\d*\.?\d+?)\,(0?\.\d+|1|0)\,(\-?\d*\.?\d+?)\]/);
        if (parseBezier) {
          easingFunction = Bezier(parseFloat(parseBezier[1]), parseFloat(parseBezier[2]), parseFloat(parseBezier[3]), parseFloat(parseBezier[4]));
        }
    }
  }

  return {
    easingFunction: easingFunction, //Matching Easing function with parameter x
    outputString: inputString //String with "[..]" removed
  };
}


var transition = (function () { /* css transition */
  function transition(attributeLhs, attributeRhs, values) {
    var _ = this;
    _.attributeLhs = attributeLhs;
    _.attributeRhs = attributeRhs;
    _.values = values; /* List of cssValues */
  }

  return transition;
}());

transition.prototype.equals = function (lhs, rhs) {
  return this.attributeLhs === lhs && this.attributeRhs === rhs;
}

var cssValue = (function () {
  function cssValue(pairs, requireInt, easingFunction) {
    var _ = this;
    _.requireInt = typeof requireInt !== 'undefined' ? requireInt : false; /* is an integer required for this value? */
    _.valuePairs = pairs; /* List of cssValuePairs sorted by percentage */
    _.easingFunction = easingFunction;
  }

  return cssValue;
}());

cssValue.prototype.getValue = function (percentage) {
  /* Precondition: percentage
   * Postcondition: value for transition
   */
  var _ = this, i = 0, len = _.valuePairs.length;

  while (i < _.valuePairs.length && percentage > _.valuePairs[i].percentage)++i;

  if (i === 0) {
    return _.valuePairs[0].value;
  } else if (i >= len) {
    return _.valuePairs[len - 1].value;
  } else {
    var endVal = _.valuePairs[i].value, beginVal = _.valuePairs[i - 1].value, endPerc = _.valuePairs[i].percentage, beginPerc = _.valuePairs[i - 1].percentage;
    percentage = (_.easingFunction) ? _.easingFunction((percentage - beginPerc) / (endPerc - beginPerc)) : (percentage - beginPerc) / (endPerc - beginPerc)
    if (_.requireInt) {
      return Math.floor(beginVal + percentage * (endVal - beginVal));
    } else {
      return beginVal + percentage * (endVal - beginVal);
    }
  }
}

var cssValuePair = (function () {
  function cssValuePair(percentage, value) {
    var _ = this;
    _.percentage = parseFloat(percentage);
    _.value = parseFloat(value);
  }

  return cssValuePair;
}());

$.fn.SectionScroll = function () {
  var _ = this,
    opt = arguments[0],
    args = Array.prototype.slice.call(arguments, 1),
    l = _.length,
    i,
    ret;
  for (i = 0; i < l; i++) {
    if (typeof opt === 'object' || typeof opt === 'undefined')
      _[i].section = new Section($(_[i]));
    else
      ret = _[i].section[opt].apply(_[i].section, args);
    if (typeof ret !== 'undefined') return ret;
  }
  return _;
};
