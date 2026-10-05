/**
 * @file
 * Overrides registerCoreBlocks.
 */

/* global Drupal, wp, drupalSettings */

import {
  setDefaultBlockName,
  setGroupingBlockName,
  setUnregisteredTypeHandlerName,
  unregisterBlockVariation,
  getBlockType,
} from '@wordpress/blocks';
import { __experimentalGetCoreBlocks } from '@wordpress/block-library';

function registerCoreBlocks() {
  const { allowedBlocks } =
    drupalSettings.editor.formats.gutenberg.editorSettings;

  const defaultBlocks = [
    'core/block',
    'core/heading',
    'core/list',
    'core/list-item',
    'core/paragraph',
    'core/pattern',
    'core/missing',
    // Child-only blocks that should always be registered
    // since they can only be used inside their parent block.
    'core/accordion-heading',
    'core/accordion-item',
    'core/accordion-panel',
    'core/form-input',
    'core/form-submit-button',
    'core/form-submission-notification',
    'core/playlist-track',
    'core/tab',
    'core/tab-panel',
    'core/tabs-menu',
    'core/tabs-menu-item',
  ];

  const coreBlocks = __experimentalGetCoreBlocks();
  const allowedCoreBlocks = coreBlocks.filter(
    (block) =>
      (allowedBlocks && allowedBlocks.includes(block.name)) ||
      defaultBlocks.includes(block.name),
  );

  allowedCoreBlocks.forEach((block) => {
    block.init();
  });

  setUnregisteredTypeHandlerName('core/missing');
  setDefaultBlockName('core/paragraph');
  setGroupingBlockName('core/group');

  // Handle core embed variations.
  const embedBlockType = getBlockType('core/embed');
  if (embedBlockType) {
    embedBlockType.variations.forEach((variation) => {
      if (!allowedBlocks.includes(`core-embed/${variation.name}`)) {
        unregisterBlockVariation('core/embed', variation.name);
      }
    });
  }
}

function __experimentalRegisterExperimentalCoreBlocks() {
  return null;
}

wp.blockLibrary = {
  ...wp.blockLibrary,
  registerCoreBlocks,
  __experimentalRegisterExperimentalCoreBlocks,
};
