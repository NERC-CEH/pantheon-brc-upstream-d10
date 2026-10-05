/* eslint-disable react/no-danger */
/* global Drupal */
import { Component, Fragment } from '@wordpress/element';
import {
  BlockIcon,
  MediaUpload,
  BlockControls,
  InspectorControls,
  URLInput,
} from '@wordpress/block-editor';
import {
  Placeholder,
  Button,
  FormFileUpload,
  SelectControl,
  PanelBody,
  Toolbar,
} from '@wordpress/components';
import { withSelect } from '@wordpress/data';

const __ = Drupal.t;

class DrupalMediaEntity extends Component {
  constructor(args) {
    super(args);
    this.state = {
      value: '',
      loading: false,
    };
    this.insertMedia = this.insertMedia.bind(this);
    this.openMediaEdit = this.openMediaEdit.bind(this);
    this.onUpload = this.onUpload.bind(this);
    this.changeViewMode = this.changeViewMode.bind(this);
  }

  onUpload(event) {
    const { attributes, mediaUpload, onError } = this.props;
    const { allowedTypes } = attributes;

    mediaUpload({
      allowedTypes,
      filesList: event.target.files,
      onError,
      onFileChange: (fileData) => {
        if (
          fileData &&
          fileData[0] &&
          fileData[0].media_entity &&
          fileData[0].media_entity.id
        ) {
          this.insertMedia(fileData[0].media_entity.id);
        }
      },
    });
  }

  changeViewMode(viewMode) {
    const { setAttributes } = this.props;
    setAttributes({
      viewMode,
    });
  }

  insertMedia(mediaEntityId) {
    const { setAttributes } = this.props;

    if (Number.isNaN(mediaEntityId)) {
      const regex = /\((\d*)\)$/;
      const match = regex.exec(mediaEntityId);
      [mediaEntityId] = match;
    }

    setAttributes({
      mediaEntityIds: [mediaEntityId],
    });

    this.setState({ value: '' });
  }

  openMediaEdit(mediaEntityIds, clientId) {
    this.setState({ loading: true });

    const elementSettings = {
      progress: { type: 'throbber' },
      dialogType: 'modal',
      dialog: { width: 800 },
      dialogRenderer: null,
      url: Drupal.url(`media/${mediaEntityIds[0]}/edit?gutenberg`),
      base: clientId,
    };

    Drupal.ajax(elementSettings)
      .execute()
      .done(() => {
        this.setState({ loading: false });
      });
  }

  render() {
    const {
      className,
      isMediaLibraryEnabled,
      mediaContent,
      mediaViewModes,
      attributes,
      setAttributes,
      isSelected,
      clientId,
      title = __('Media'),
      icon = <BlockIcon icon="admin-media" />,
      isReadOnly,
      readOnlyInstructions = __(
        'Cannot edit this block. Probably mapped to a non-translatable field.',
      ),
    } = this.props;

    const { value, loading } = this.state;
    const { mediaEntityIds } = attributes;
    const { view_modes: viewModes } = mediaContent;

    const instructions = __(
      'Upload a media file or pick one from your media library.',
    );
    const placeholderClassName = [
      'block-editor-media-placeholder',
      'editor-media-placeholder',
      className,
    ].join(' ');

    if (Array.isArray(mediaViewModes) && mediaViewModes.length) {
      const inspectorControls = (
        <InspectorControls>
          {!attributes.lockViewMode && (
            <PanelBody title={__('Media entity settings')}>
              <SelectControl
                label={__('View mode')}
                value={attributes.viewMode}
                options={mediaViewModes}
                onChange={this.changeViewMode}
              />
            </PanelBody>
          )}
        </InspectorControls>
      );

      let html = viewModes.default.processedHtml;
      if (viewModes[attributes.viewMode]) {
        html = viewModes[attributes.viewMode].processedHtml;
      }

      return (
        <Fragment>
          <div className="drupal-media-entity__content">
            <div dangerouslySetInnerHTML={{ __html: html }} />
            {!isSelected && (
              <div className="drupal-media-entity__interactive-overlay" />
            )}
          </div>
          {inspectorControls}
          <BlockControls>
            {!isReadOnly && (
              <Toolbar
                controls={[
                  {
                    icon: 'edit',
                    title: __('Edit media'),
                    onClick: () => this.openMediaEdit(mediaEntityIds, clientId),
                  },
                  {
                    icon: 'no',
                    title: __('Clear media'),
                    onClick: () => setAttributes({ mediaEntityIds: [] }),
                  },
                ]}
              >
                {loading && (
                  <div className="ajax-progress ajax-progress-throbber">
                    <div className="throbber">&nbsp;</div>
                  </div>
                )}
              </Toolbar>
            )}
            {isReadOnly && (
              <Toolbar
                controls={[
                  {
                    icon: 'edit',
                    title: __('Edit media'),
                    onClick: () => this.openMediaEdit(mediaEntityIds, clientId),
                  },
                ]}
              >
                {loading && (
                  <div className="ajax-progress ajax-progress-throbber">
                    <div className="throbber">&nbsp;</div>
                  </div>
                )}
              </Toolbar>
            )}
          </BlockControls>
        </Fragment>
      );
    }

    const fetchMedia = (search) =>
      new Promise((resolve) => {
        fetch(
          Drupal.url(
            `editor/media/autocomplete?search=${encodeURIComponent(search)}`,
          ),
        )
          .then((response) => response.json())
          .then((json) => {
            resolve(json);
          });
      });

    const processMediaResult = (url) => {
      this.setState({ value: url });
    };

    const linkId = 'search_media_0001';

    const content = isMediaLibraryEnabled ? (
      <MediaUpload
        onSelect={this.insertMedia}
        allowedTypes={attributes.allowedTypes}
        multiple={false}
        handlesMediaEntity
      />
    ) : (
      <Fragment>
        <URLInput
          className="media-entity-search-input"
          value={value}
          placeholder={__('Type media ID or text to search media')}
          /* eslint-disable jsx-a11y/no-autofocus */
          // Disable Reason: The rule is meant to prevent enabling auto-focus, not disabling it.
          autoFocus={false}
          /* eslint-enable jsx-a11y/no-autofocus */
          onChange={processMediaResult}
          disableSuggestions={!isSelected}
          id={linkId}
          hasBorder
          __experimentalFetchLinkSuggestions={fetchMedia}
        />
        {/* <input
          type="text"
          value={value}
          onChange={e => this.setState({ value: e.target.value })}
        /> */}
        <Button
          isLarge
          isPrimary
          title={__('Insert')}
          onClick={() => this.insertMedia(value)}
        >
          {__('Insert')}
        </Button>
      </Fragment>
    );

    return (
      <Fragment>
        {!isReadOnly && (
          <Placeholder
            icon={icon}
            label={title}
            instructions={instructions}
            className={placeholderClassName}
          >
            <FormFileUpload
              onChange={this.onUpload}
              accept={'image/*,video/*,audio/*,application/*'}
              multiple={false}
              render={({ openFileDialog }) => (
                <Fragment>
                  <Button
                    isLarge
                    onClick={openFileDialog}
                    className={[
                      'block-editor-media-placeholder__button',
                      'editor-media-placeholder__button',
                      'block-editor-media-placeholder__upload-button',
                    ].join(' ')}
                    icon="upload"
                  >
                    {__('Upload')}
                  </Button>
                </Fragment>
              )}
            />
            {content}
          </Placeholder>
        )}
        {isReadOnly && (
          <Placeholder
            icon={icon}
            label={title}
            instructions={readOnlyInstructions}
            className={placeholderClassName}
          />
        )}
      </Fragment>
    );
  }
}

const DrupalMediaEntityWithSelect = withSelect((select, props) => {
  const { getSettings } = select('core/block-editor');
  const { getMediaEntity } = select('drupal');
  const { attributes } = props;
  const mediaEntityIds = attributes.mediaEntityIds || [];

  const defaultData = {
    mediaContent: {},
    mediaViewModes: [],
    mediaUpload: getSettings().mediaUpload,
  };

  if (!mediaEntityIds.length) {
    return defaultData;
  }

  const mediaEntity = getMediaEntity(mediaEntityIds[0]);

  if (!mediaEntity) {
    return defaultData;
  }

  const { view_modes: viewModes } = mediaEntity;
  const mediaViewModes = [];

  if (Object.keys(viewModes).length) {
    // eslint-disable-next-line no-restricted-syntax
    for (const viewMode in viewModes) {
      if (!viewModes.hasOwnProperty(viewMode)) {
        // eslint-disable-next-line no-continue
        continue;
      }

      mediaViewModes.push({
        value: viewModes[viewMode].view_mode,
        label: viewModes[viewMode].view_mode_name,
      });

      // Process media HTML.
      const node = document.createElement('div');
      node.innerHTML = viewModes[viewMode].html;
      const formElements = node.querySelectorAll(
        'input, select, button, textarea, a',
      );
      formElements.forEach((el) => {
        el.setAttribute('readonly', true);
        el.setAttribute('required', false);

        if (el.tagName === 'A') {
          el.removeAttribute('href');
        }
      });
      viewModes[viewMode].processedHtml = node.innerHTML;
    }
  }

  return {
    mediaContent: mediaEntity,
    mediaViewModes,
    mediaUpload: getSettings().mediaUpload,
  };
})(DrupalMediaEntity);

export default DrupalMediaEntityWithSelect;
