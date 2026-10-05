/* global Drupal, sprintf */

window.wp.i18n = {};

// Upstream strings that link to WordPress, replaced with their Drupal
// counterparts.
const drupalStrings = new Map([
  // The Help item of the Options menu.
  [
    'https://wordpress.org/documentation/article/wordpress-block-editor/',
    'https://www.drupal.org/docs/contributed-modules/gutenberg',
  ],
]);

window.wp.i18n.__ = (value, parameters) =>
  drupalStrings.get(value) ?? Drupal.t(value, parameters);
window.wp.i18n._x = (value, context) => Drupal.t(value, {}, { context });
window.wp.i18n._n = (single, plural, number) => {
  if (typeof number === 'undefined') {
    number = 1;
  }
  number = number || 0;
  return Drupal.formatPlural(number, single, plural);
};
window.wp.i18n._nx = (single, plural, number, context) => {
  if (typeof number === 'undefined') {
    number = 1;
  }
  number = number || 0;
  return Drupal.formatPlural(number, single, plural, {}, { context });
};

window.wp.i18n.isRTL = () =>
  Drupal.t('ltr', {}, { context: 'text direction' }) === 'rtl';
window.wp.i18n.setLocaleData = () => {
  console.warn('wp.i18n.setLocaleData() is a noop.');
};
window.wp.i18n.sprintf = (format, ...args) => {
  try {
    return sprintf(format, ...args);
  } catch (error) {
    console.warn(`sprintf error: \n\n${error.toString()}`);
    return format;
  }
};
