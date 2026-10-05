/* global Drupal */

import { dispatch, select } from '@wordpress/data';

/**
 * Add the "Fields" block category, for the blocks showing entity data.
 */
export default function registerFieldsCategory() {
  const categories = select('core/blocks').getCategories();
  if (!categories.some((item) => item.slug === 'fields')) {
    dispatch('core/blocks').setCategories([
      ...categories,
      { slug: 'fields', title: Drupal.t('Fields') },
    ]);
  }
}
