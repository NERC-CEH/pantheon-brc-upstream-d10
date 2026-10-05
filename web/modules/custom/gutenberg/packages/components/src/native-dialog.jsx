/* global Drupal, drupalSettings, jQuery */
import apiFetch from '@wordpress/api-fetch';

const $ = jQuery;

const withNativeDialog = (Component) => {
  const onDialogCreate = (element, multiple) => {
    drupalSettings.media_library = drupalSettings.media_library || {};
    drupalSettings.media_library.selection_remaining = multiple ? 1000 : 1;

    // @todo: it's temporary bugfix for the issue with initial loading (cannot upload a file in media library dialog).
    setTimeout(() => {
      $('#media-library-wrapper li:first-child a').click();
    }, 0);
  };

  const getDefaultMediaSelections = () =>
    ((Drupal.MediaLibrary && Drupal.MediaLibrary.currentSelection) || []).filter(
      (selection) => +selection,
    );

  const getSpecialMediaSelections = () =>
    [...((Drupal.SpecialMediaSelection && Drupal.SpecialMediaSelection.currentSelection) || [])].map(
      (selection) =>
        JSON.stringify({
          [selection.processor]: selection.data,
        }),
    );

  async function onDialogInsert(element, props) {
    const { onSelect, handlesMediaEntity, multiple } = props;

    let selections = [
      ...getDefaultMediaSelections(),
      ...getSpecialMediaSelections(),
    ];
    selections = multiple ? selections : selections.slice(0, 1);

    const endpointUrl = handlesMediaEntity
      ? Drupal.url('editor/media/render')
      : Drupal.url('editor/media/load-media');

    let selectionData = await Promise.all(
      selections.map((selection) =>
        fetch(`${endpointUrl}/${encodeURIComponent(selection)}`).then(
          (response) => response.json(),
        ),
      ),
    );

    if (handlesMediaEntity) {
      selectionData = selectionData.map(
        (selectionItem) =>
          selectionItem.media_entity && selectionItem.media_entity.id,
      );
    }

    onSelect(multiple ? selectionData : selectionData[0]);
  }

  const onDialogClose = () => {
    const modal = document.getElementById('media-entity-browser-modal');
    if (modal) {
      modal.remove();
    }

    const nodes = document.querySelectorAll(
      '[aria-describedby="media-entity-browser-modal"]',
    );
    nodes.forEach((node) => node.remove());
  };

  const getDialog = ({ allowedTypes, allowedBundles }) =>
    new Promise((resolve, reject) => {
      apiFetch({
        path: 'load-media-library-dialog',
        data: { allowedTypes, allowedBundles },
      })
        .then((result) => {
          resolve({
            component: (props) => (
              <div
                {...props}
                dangerouslySetInnerHTML={{ __html: result.html }}
              />
            ),
          });
        })
        .catch((reason) => {
          reject(reason);
        });
    });

  return (props) => (
    <Component
      {...props}
      onDialogCreate={onDialogCreate}
      onDialogInsert={onDialogInsert}
      onDialogClose={onDialogClose}
      getDialog={getDialog}
    />
  );
};

export default withNativeDialog;
