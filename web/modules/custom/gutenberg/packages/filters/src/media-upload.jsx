/* global Drupal */

import { addFilter } from '@wordpress/hooks';
import {
  MediaLibrary,
  withNativeDialog,
  withGutenbergDialog,
} from '@drupal-gutenberg/components';

addFilter(
  'editor.MediaUpload',
  'core/edit-post/components/media-upload/replace-media-upload',
  () =>
    Drupal.isMediaLibraryEnabled()
      ? withNativeDialog(MediaLibrary)
      : withGutenbergDialog(MediaLibrary),
);

/**
 * Remove the "Use featured image" option from the media replace flow.
 */
addFilter(
  'editor.MediaReplaceFlow',
  'core/edit-post/components/media-replace-flow/replace-media-replace-flow',
  (Component) => {
    return (props) => <Component {...props} onToggleFeaturedImage={false} />;
  },
);

/**
 * Remove the "Use featured image" option from the media placeholder.
 */
addFilter(
  'editor.MediaPlaceholder',
  'core/edit-post/components/media-placeholder/replace-media-placeholder',
  (Component) => {
    return (props) => <Component {...props} onToggleFeaturedImage={false} />;
  },
);
