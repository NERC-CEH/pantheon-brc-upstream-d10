/* global Drupal, jQuery */
import { select, dispatch } from '@wordpress/data';

const $ = jQuery;

function addToTree(obj, keys, def) {
  for (let i = 0, length = keys.length; i < length; ++i) {
    obj = obj[keys[i]] = i === length - 1 ? def : obj[keys[i]] || {};
  }
}

function serializedToNested(elements) {
  const regex = /\[([a-z0-9_]*)]/gm;

  const tree = {};

  elements.forEach((element) => {
    let m;
    const nested = [];

    while ((m = regex.exec(element.name)) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex += 1;
      }

      m.forEach((match, groupIndex) => {
        if (groupIndex === 1 && match !== 'override') {
          nested.push(match);
        }
      });
    }

    addToTree(tree, nested, element.value);
  });

  return tree;
}

function getIdFromEntityFormElement(str) {
  const regex = /.+\s\(([^\)]+)\)/gi;
  const matches = regex.exec(str);
  return matches ? matches[1] : null;
}

Drupal.behaviors.gutenbergBlockSettings = {
  attach(form) {
    if (form.elements && form.id === 'gutenberg-block-settings') {
      const btn = Array.from(form.elements).filter((el) => el.name === 'op')[0];

      btn.onclick = () => {
        const elements = document.querySelectorAll(
          `#${form.id} [data-autocomplete-path]`,
        );
        elements.forEach((el) => {
          el.value = getIdFromEntityFormElement(el.value);
        });

        let values = $(form).serializeArray();
        values = values.filter((el) => el.name.match(/^settings/i));

        form.querySelectorAll(`input[type=checkbox]`).forEach((el) => {
          if (el.checked) {
            values = values.filter((v) => v.name !== el.name);
            values = values.concat({ name: el.name, value: el.value });
          } else {
            values = values.concat({ name: el.name, value: 0 });
          }
        });

        $('#drupal-modal').dialog('close');

        const block = select('core/block-editor').getSelectedBlock();
        const clientId = select('core/block-editor').getSelectedBlockClientId();
        const attrs = {
          ...block.attributes,
          settings: serializedToNested(values),
        };
        dispatch('core/block-editor').updateBlockAttributes(clientId, attrs);

        return false;
      };
    }
  },
};
