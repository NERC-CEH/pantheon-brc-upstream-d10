/* global Drupal, drupalSettings, jQuery, once */
import { dispatch, select } from '@wordpress/data';

const $ = jQuery;

import '../../../css/content-block-form.scss';

Drupal.behaviors.gutenbergContentBlocks = {
  attach(context) {
    $(document).ajaxComplete((event, xhr, settings) => {
      if (!drupalSettings.contentBlockId) {
        return;
      }

      if (
        settings.url &&
        settings.url.includes('/editor/content_block_type/settings/')
      ) {
        const elements = once(
          'gutenberg-content-blocks',
          '#gutenberg-content-block-type-settings',
          context,
        );
        elements.forEach(async () => {
          const block = await select('core/block-editor').getSelectedBlock();
          const clientId =
            await select('core/block-editor').getSelectedBlockClientId();
          const attrs = {
            ...block.attributes,
            contentBlockId: drupalSettings.contentBlockId,
          };
          await dispatch('core/block-editor').updateBlockAttributes(clientId, {
            contentBlockId: null,
            viewMode: 'empty',
          });
          await dispatch('core/block-editor').updateBlockAttributes(
            clientId,
            attrs,
          );
          dispatch('core/block-editor').flashBlock(clientId);
          delete drupalSettings.contentBlockId;
        });
      }
    });
  },
};
