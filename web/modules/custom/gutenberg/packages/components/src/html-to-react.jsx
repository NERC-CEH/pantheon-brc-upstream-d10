import { createElement } from '@wordpress/element';

/**
 * Shared click handler that prevents navigation on links inside the editor.
 */
function preventNavigation(e) {
  e.preventDefault();
}

/**
 * Map of HTML attribute names to their React equivalents.
 */
const ATTR_MAP = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  cellspacing: 'cellSpacing',
  cellpadding: 'cellPadding',
  rowspan: 'rowSpan',
  colspan: 'colSpan',
  usemap: 'useMap',
  frameborder: 'frameBorder',
  contenteditable: 'contentEditable',
  crossorigin: 'crossOrigin',
  accesskey: 'accessKey',
  allowfullscreen: 'allowFullScreen',
  autocomplete: 'autoComplete',
  autofocus: 'autoFocus',
  autoplay: 'autoPlay',
  enctype: 'encType',
  formaction: 'formAction',
  novalidate: 'noValidate',
  spellcheck: 'spellCheck',
  srcdoc: 'srcDoc',
  srcset: 'srcSet',
};

/**
 * Convert an HTML attribute name to its React prop name.
 *
 * @param {string} name The HTML attribute name.
 * @return {string} The React prop name.
 */
function toReactAttr(name) {
  // Handle data-* and aria-* attributes as-is.
  if (name.startsWith('data-') || name.startsWith('aria-')) {
    return name;
  }

  // Handle style attribute (needs object conversion, but we pass as string
  // via dangerouslySetInnerHTML for simplicity — skip for now).
  if (name === 'style') {
    return name;
  }

  return ATTR_MAP[name.toLowerCase()] || name;
}

/**
 * Parse an inline style string into a React style object.
 *
 * @param {string} styleString The CSS style string.
 * @return {Object} The React style object.
 */
function parseStyle(styleString) {
  if (!styleString) {
    return undefined;
  }

  const style = {};
  styleString.split(';').forEach((declaration) => {
    const [prop, ...valueParts] = declaration.split(':');
    if (prop && valueParts.length) {
      const cssProp = prop.trim();
      const value = valueParts.join(':').trim();
      // Convert CSS property to camelCase.
      const reactProp = cssProp.replace(/-([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
      );
      style[reactProp] = value;
    }
  });

  return Object.keys(style).length > 0 ? style : undefined;
}

/**
 * Convert a DOM node to a React element.
 *
 * @param {Node}     node           The DOM node.
 * @param {Function} getReplacement Returns the element that replaces a DOM
 *                                  element, given (domNode, key), or undefined
 *                                  to convert it as is.
 * @param {string[]} stripAttributes Attributes to leave out, e.g. markers.
 * @param {number}   key            React key for lists.
 * @return {*} A React element, string, or null.
 */
function convertNode(node, getReplacement, stripAttributes, key) {
  // Text node.
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }

  // Comment node — skip.
  if (node.nodeType === Node.COMMENT_NODE) {
    return null;
  }

  // Only process element nodes.
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  // Check for a replacement.
  const replacement = getReplacement(node, key);
  if (replacement !== undefined) {
    return replacement;
  }

  // Build props from attributes.
  const props = { key };
  for (let i = 0; i < node.attributes.length; i++) {
    const attr = node.attributes[i];
    const reactName = toReactAttr(attr.name);

    // Skip markers.
    if (stripAttributes.includes(attr.name)) {
      continue;
    }

    if (attr.name === 'style') {
      props.style = parseStyle(attr.value);
    } else {
      props[reactName] = attr.value;
    }
  }

  // Disable links and buttons to prevent navigation/submission in the editor.
  const tagName = node.tagName.toLowerCase();
  if (tagName === 'a') {
    delete props.href;
    props.role = 'link';
    props.onClick = preventNavigation;
    props.draggable = false;
  } else if (tagName === 'button' || (tagName === 'input' && (props.type === 'submit' || props.type === 'button'))) {
    props.disabled = true;
  }

  // Self-closing elements.
  const selfClosing = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
  ];

  if (selfClosing.includes(tagName)) {
    return createElement(tagName, props);
  }

  // Convert children recursively.
  const children = [];
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = convertNode(node.childNodes[i], getReplacement, stripAttributes, i);
    if (child !== null) {
      children.push(child);
    }
  }

  return createElement(tagName, props, ...children);
}

/**
 * Convert an HTML string to React elements, with optional replacements
 * for marked elements, e.g. to make parts of server-rendered HTML editable.
 *
 * @param {string}   html                    The HTML string.
 * @param {Function} getReplacement          Returns the element that replaces
 *                                           a DOM element, given
 *                                           (domNode, key), or undefined.
 * @param {Object}   options                 Options.
 * @param {string[]} options.stripAttributes Attributes to leave out.
 * @return {Array} Array of React elements.
 */
export function htmlToReact(
  html,
  getReplacement = () => undefined,
  { stripAttributes = [] } = {},
) {
  if (!html) {
    return [];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  const elements = [];
  for (let i = 0; i < body.childNodes.length; i++) {
    const element = convertNode(body.childNodes[i], getReplacement, stripAttributes, i);
    if (element !== null) {
      elements.push(element);
    }
  }

  return elements;
}
