export { registerDrupalBlocks } from './drupal-blocks';
export { registerDrupalMedia } from './drupal-media';
export { registerContentBlocks } from './content-block-types';
export {
  registerFieldBlock,
  reportInvalidFieldWidget,
} from './blocks/field/index';
export {
  registerEntityTitleBlock,
  getEntityTitleBlocks,
  isTitleInEditor,
} from './blocks/entity-title/index';

// Register block types (side effects)
import './blocks/section/index';
import './blocks/simple-text/index';
