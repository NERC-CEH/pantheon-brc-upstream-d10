import {
    PanelBody,
    PanelRow,
    TextControl,
    TextareaControl,
    Toolbar,
    Button,
} from "@wordpress/components";

import {
  useBlockProps,
  BlockControls,
  InnerBlocks,
  InspectorControls,
  RichText,
  MediaPlaceholder,
} from "@wordpress/block-editor";

// drupal import is set as external in webpack.config.js
import { t } from "drupal";
// i18n package could be also used. It is a wrapper around Drupal.t.
//   import { __ } from "@wordpress/i18n";
//   __('Text to be translated');

const ALLOWED_BLOCKS = ["core/heading", "core/paragraph", "core/quote"];

function Edit({ attributes, setAttributes }) {
  const { imageUrl, imageAlt, imageUuid, title, subhead, metadata } = attributes;

  function onSelectMedia(media) {
    setAttributes({
      imageAlt: media.alt,
      imageUuid: media.data.entity_uuid,
      imageUrl: media.url,
    });
  }

  function clearImage() {
    setAttributes({
      imageUrl: '',
      imageUuid: '',
      imageAlt: '',
    });
  }

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div {...useBlockProps()}>
      <BlockControls>
        <Toolbar>
          <Button
            label={t('Clear image')}
            icon="no-alt"
            onClick={() => clearImage()}
          />
        </Toolbar>
      </BlockControls>
      <InspectorControls>
        <PanelBody title={ t('Block settings') } initialOpen>
          <PanelRow>
            <TextControl
              label={t('Image Alt Text')}
              value={imageAlt}
              onChange={(value) => setAttributes({ imageAlt: value })}
            />
          </PanelRow>
          <PanelRow>
            <TextareaControl
              label={t('Metadata information')}
              help={t('Add some metadata information')}
              value={metadata}
              onChange={(value) => setAttributes({ metadata: value })}
            />
          </PanelRow>
        </PanelBody>
      </InspectorControls>
      {!imageUrl && (
        <MediaPlaceholder
          onSelect={value => onSelectMedia(value)}
          allowedTypes={["image"]}
          multiple={false}
          labels={{ title: t('Picture') }}
        >
          {t('Upload an image or select from media library.')}
        </MediaPlaceholder>
      )}
      {imageUrl && (
        <img
          data-entity-type="file"
          data-entity-uuid={imageUuid}
          src={imageUrl}
          alt={imageAlt}
        />
      )}
      <div>
        <RichText
          tagName="h2"
          placeholder={t("Title")}
          value={title}
          onChange={(value) => setAttributes({ title: value })}
        />
        <RichText
          tagName="p"
          placeholder={t("Subhead")}
          value={subhead}
          onChange={(value) => setAttributes({ subhead: value })}
        />
        <div>
          <InnerBlocks allowedBlocks={ALLOWED_BLOCKS} />
        </div>
      </div>
    </div>
  );
}

export default Edit;