"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _element = require("@wordpress/element");
var _primitives = require("@wordpress/primitives");
/**
 * WordPress dependencies
 */

function TagName(props, ref) {
  const {
    start,
    ...extraProps
  } = props;
  return (0, _element.createElement)(_primitives.View, {
    ref: ref,
    ...extraProps
  });
}
var _default = (0, _element.forwardRef)(TagName);
exports.default = _default;
//# sourceMappingURL=tag-name.native.js.map