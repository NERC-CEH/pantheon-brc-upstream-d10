/**
 * @file
 * Fit-text frontend view script.
 *
 * Ported from @wordpress/block-editor/build-module/utils/fit-text-utils.js.
 * Dynamically resizes elements with the "has-fit-text" class to fill their
 * container width using a binary-search algorithm.
 */
(function () {
  "use strict";

  /**
   * Binary-search for the optimal font size that fits the element's container.
   */
  function findOptimalFontSize(textElement, applyFontSize) {
    var alreadyHasScrollableHeight =
      textElement.scrollHeight > textElement.clientHeight;
    var minSize = 5;
    var maxSize = 2400;
    var bestSize = minSize;
    var computedStyle = window.getComputedStyle(textElement);
    var paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    var paddingRight = parseFloat(computedStyle.paddingRight) || 0;
    var range = document.createRange();
    range.selectNodeContents(textElement);
    var referenceElement = textElement;
    var parentElement = textElement.parentElement;

    if (parentElement) {
      var parentStyle = window.getComputedStyle(parentElement);
      if (parentStyle && parentStyle.display === "flex") {
        referenceElement = parentElement;
        paddingLeft += parseFloat(parentStyle.paddingLeft) || 0;
        paddingRight += parseFloat(parentStyle.paddingRight) || 0;
      }
    }

    var maxClientHeight = referenceElement.clientHeight;

    while (minSize <= maxSize) {
      var midSize = Math.floor((minSize + maxSize) / 2);
      applyFontSize(midSize);
      var rect = range.getBoundingClientRect();
      var textWidth = rect.width;
      var fitsWidth =
        textElement.scrollWidth <= referenceElement.clientWidth &&
        textWidth <= referenceElement.clientWidth - paddingLeft - paddingRight;
      var fitsHeight =
        alreadyHasScrollableHeight ||
        textElement.scrollHeight <= referenceElement.clientHeight ||
        textElement.scrollHeight <= maxClientHeight;

      if (referenceElement.clientHeight > maxClientHeight) {
        maxClientHeight = referenceElement.clientHeight;
      }

      if (fitsWidth && fitsHeight) {
        bestSize = midSize;
        minSize = midSize + 1;
      } else {
        maxSize = midSize - 1;
      }
    }

    range.detach();
    return bestSize;
  }

  function optimizeFitText(textElement) {
    if (!textElement) {
      return;
    }
    var applyFontSize = function (fontSize) {
      if (fontSize === 0) {
        textElement.style.fontSize = "";
      } else {
        textElement.style.fontSize = fontSize + "px";
      }
    };
    applyFontSize(0);
    var optimalSize = findOptimalFontSize(textElement, applyFontSize);
    applyFontSize(optimalSize);
  }

  function initFitText() {
    var elements = document.querySelectorAll(".has-fit-text");
    elements.forEach(function (el) {
      optimizeFitText(el);

      if (window.ResizeObserver && el.parentElement) {
        var resizeObserver = new window.ResizeObserver(function () {
          optimizeFitText(el);
        });
        resizeObserver.observe(el.parentElement);
        resizeObserver.observe(el);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFitText);
  } else {
    initFitText();
  }
})();
