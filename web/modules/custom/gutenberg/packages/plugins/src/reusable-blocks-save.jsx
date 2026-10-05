import { Fragment, useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar } from '@wordpress/editor';
import {
  BaseControl,
  Button,
  CheckboxControl,
  PanelBody,
  PanelRow,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const Sidebar = () => {
  const dirtyEntityRecords = useSelect((select) =>
    select('core').__experimentalGetDirtyEntityRecords(),
  ).filter((item) => item.name === 'wp_block');

  const { createNotice } = useDispatch('core/notices');

  const { saveEditedEntityRecord } = useDispatch('core');

  const { setEntitiesToSave } = useDispatch('drupal');

  // Unchecked entities to be ignored by save function.
  const [unselectedEntities, _setUnselectedEntities] = useState([]);

  const setUnselectedEntities = ({ kind, name, key, property }, checked) => {
    if (checked) {
      _setUnselectedEntities(
        unselectedEntities.filter(
          (elt) =>
            elt.kind !== kind ||
            elt.name !== name ||
            elt.key !== key ||
            elt.property !== property,
        ),
      );
    } else {
      _setUnselectedEntities([
        ...unselectedEntities,
        { kind, name, key, property },
      ]);
    }
  };

  function getEntitiesToSave() {
    return dirtyEntityRecords.filter(
      ({ kind, name, key, property }) =>
        !unselectedEntities.some(
          (elt) =>
            elt.kind === kind &&
            elt.name === name &&
            elt.key === key &&
            elt.property === property,
        ),
    );
  }

  function saveItems() {
    const entitiesToSave = getEntitiesToSave();

    entitiesToSave.forEach(({ kind, name, key, property }) => {
      saveEditedEntityRecord(kind, name, key, property);
    });

    createNotice('success', __('Synced pattern saved!'), {
      type: 'snackbar',
      // isDismissible: true,
    });
  }

  // Whenever reusable blocks change, update "entities to save" store item.
  useEffect(() => {
    setEntitiesToSave(getEntitiesToSave());
  });

  return (
    <Fragment>
      {dirtyEntityRecords.length > 0 && (
        <PluginSidebar
          name="state"
          title={__('Synced Patterns')}
          icon="block-default"
        >
          <PanelBody>
            <BaseControl
              help={__(
                'Saving synced patterns will affect other places where they are being used. You can de-select to not save.',
              )}
            >
              <BaseControl.VisualLabel>
                {__(
                  'The selected synced patterns will be saved when saving the content. Press "Save now" button to save immediately.',
                )}
              </BaseControl.VisualLabel>
            </BaseControl>
            {dirtyEntityRecords.map((item) => (
              <PanelRow>
                <CheckboxControl
                  key={item.key}
                  label={item.title}
                  checked={
                    !unselectedEntities.some(
                      (elt) =>
                        elt.kind === item.kind &&
                        elt.name === item.name &&
                        elt.key === item.key &&
                        elt.property === item.property,
                    )
                  }
                  onChange={(checked) => setUnselectedEntities(item, checked)}
                />
              </PanelRow>
            ))}
            <PanelRow>
              <Button isPrimary onClick={() => saveItems()}>
                {__('Save now')}
              </Button>
            </PanelRow>
          </PanelBody>
        </PluginSidebar>
      )}
    </Fragment>
  );
};

registerPlugin('reusable-blocks-save', {
  render: () => <Sidebar />,
});
