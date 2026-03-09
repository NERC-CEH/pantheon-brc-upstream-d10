/**
 * @file
 * Adds shims for jQuery 4 compatibility.
 *
 * Enables use of legacy libraries such as jqPlot.
 */

(function ($) {
  if (!$.isFunction) $.isFunction = function (obj) { return typeof obj === 'function'; };
  if (!$.isArray) $.isArray = Array.isArray;
  if (!$.isNumeric) $.isNumeric = function (n) { return !isNaN(parseFloat(n)) && isFinite(n); };
})(jQuery);