import { useBlockProps, InnerBlocks } from "@wordpress/block-editor";

function Save({ attributes }) {
  const { imageUrl, imageUuid, imageAlt, title, subhead } = attributes;

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div {...useBlockProps.save()}>
      <img
        data-entity-type="file"
        data-entity-uuid={imageUuid}
        src={imageUrl}
        alt={imageAlt}
      />
      <div>
        <h2>{title}</h2>
        <p>{subhead}</p>
        <div>
          <InnerBlocks.Content />
        </div>
      </div>
    </div>
  );
}

export default Save;