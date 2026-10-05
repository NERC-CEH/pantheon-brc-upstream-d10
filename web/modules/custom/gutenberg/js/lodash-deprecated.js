/* global _ */

/**
 * Exposes lodash as window.lodash, deprecated.
 *
 * The editor doesn't use lodash anymore. It is kept for custom blocks that
 * use the global, and warns the first time each of its functions is used.
 *
 * @param {Function} lodash The lodash function.
 */
((lodash) => {
  const warn = (name) =>
    window.wp.deprecated(name, {
      since: '4.0.0',
      version: '5.0.0',
      plugin: 'Drupal Gutenberg',
      alternative: 'native JavaScript, or lodash bundled with your own scripts',
    });

  window.lodash = new Proxy(lodash, {
    get(target, property, receiver) {
      if (typeof property === 'string') {
        warn(`window.lodash.${property}`);
      }
      return Reflect.get(target, property, receiver);
    },
    apply(target, thisArg, args) {
      warn('window.lodash()');
      return Reflect.apply(target, thisArg, args);
    },
  });
})(_.noConflict());
