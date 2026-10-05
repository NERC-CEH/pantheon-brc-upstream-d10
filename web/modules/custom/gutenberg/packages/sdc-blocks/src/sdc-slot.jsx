import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, Placeholder } from '@wordpress/components';
import { createPortal, useContext } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { SdcSlotContext } from './sdc-slot-context';

const SLOT_COLOR = '#65a30d';
const SLOT_COLOR_RGB = '101, 163, 13';

let registered = false;

/**
 * Register the sdc/slot companion block.
 *
 * This block acts as a named slot container inside SDC blocks.
 * It uses createPortal() to render its InnerBlocks at the correct
 * position within the server-rendered component HTML, where a
 * SlotPortalTarget has been placed.
 */
export function registerSdcSlot() {
  if (registered) {
    return;
  }
  registered = true;

  registerBlockType('sdc/slot', {
    apiVersion: 3,
    title: __('Component Slot'),
    description: __('A named slot inside a component.'),
    icon: { src: 'screenoptions', foreground: SLOT_COLOR },
    category: 'sdc',
    parent: ['sdc/*'],
    supports: {
      html: false,
      reusable: false,
      inserter: false,
      lock: false,
    },
    attributes: {
      name: {
        type: 'string',
        default: 'default',
      },
      label: {
        type: 'string',
        default: '',
      },
    },
    __experimentalLabel(attributes) {
      return attributes.label || attributes.name || __('Slot');
    },
    edit({ attributes, clientId }) {
      const blockProps = useBlockProps({
        className: 'sdc-slot is-reusable',
        style: {
          '--wp-block-synced-color': SLOT_COLOR,
          '--wp-block-synced-color--rgb': SLOT_COLOR_RGB,
        },
      });
      const { label, name } = attributes;
      const { targets, slotDefinitions } = useContext(SdcSlotContext);
      const target = targets[name];
      const displayLabel = label || name;

      // Read block template and lock from the slot definition (set in
      // .component.yml). The keys are prefixed so they can't clash with
      // generic slot keys from core or other modules.
      const slotDef = slotDefinitions[name] || {};
      const template = slotDef.gutenberg_template || null;
      const templateLock = slotDef.gutenberg_templateLock || false;

      const hasInnerBlocks = useSelect(
        (select) => select('core/block-editor').getBlockOrder(clientId).length > 0,
        [clientId],
      );

      const content = (
        <div {...blockProps}>
          <InspectorControls>
            <PanelBody title={__('Slot')}>
              <p>
                <strong>{__('Slot name:')}</strong> {displayLabel}
              </p>
            </PanelBody>
          </InspectorControls>

          {hasInnerBlocks || template ? (
            <InnerBlocks template={template} templateLock={templateLock} />
          ) : (
            <Placeholder
              icon="screenoptions"
              label={displayLabel}
              instructions={__('This slot is empty. Use the + button to add blocks.')}
            >
              <InnerBlocks templateLock={false} />
            </Placeholder>
          )}
        </div>
      );

      // Portal to the target position within the component HTML.
      // Falls back to in-place rendering if target is not ready yet.
      if (target) {
        return createPortal(content, target);
      }
      return content;
    },
    save() {
      return <InnerBlocks.Content />;
    },
    deprecated: [
      {
        attributes: {
          name: { type: 'string', default: 'default' },
          label: { type: 'string', default: '' },
        },
        save() {
          return (
            <div {...useBlockProps.save()}>
              <InnerBlocks.Content />
            </div>
          );
        },
      },
    ],
  });
}
