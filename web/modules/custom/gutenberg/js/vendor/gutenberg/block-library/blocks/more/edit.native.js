"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.MoreEdit = void 0;
var _element = require("@wordpress/element");
var _i18n = require("@wordpress/i18n");
var _compose = require("@wordpress/compose");
var _components = require("@wordpress/components");
var _editor = _interopRequireDefault(require("./editor.scss"));
/**
 * WordPress dependencies
 */

/**
 * Internal dependencies
 */

class MoreEdit extends _element.Component {
  constructor() {
    super(...arguments);
    this.state = {
      defaultText: (0, _i18n.__)('Read more')
    };
  }
  render() {
    const {
      attributes,
      getStylesFromColorScheme
    } = this.props;
    const {
      customText
    } = attributes;
    const {
      defaultText
    } = this.state;
    const content = customText || defaultText;
    const textStyle = getStylesFromColorScheme(_editor.default.moreText, _editor.default.moreTextDark);
    const lineStyle = getStylesFromColorScheme(_editor.default.moreLine, _editor.default.moreLineDark);
    return (0, _element.createElement)(_components.HorizontalRule, {
      text: content,
      marginLeft: 0,
      marginRight: 0,
      textStyle: textStyle,
      lineStyle: lineStyle
    });
  }
}
exports.MoreEdit = MoreEdit;
var _default = (0, _compose.withPreferredColorScheme)(MoreEdit);
exports.default = _default;
//# sourceMappingURL=edit.native.js.map