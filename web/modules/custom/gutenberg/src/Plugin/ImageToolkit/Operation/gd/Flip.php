<?php

namespace Drupal\gutenberg\Plugin\ImageToolkit\Operation\gd;

use Drupal\Core\ImageToolkit\Attribute\ImageToolkitOperation;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\system\Plugin\ImageToolkit\Operation\gd\GDImageToolkitOperationBase;

/**
 * Defines GD2 Flip operation, used by the editor's image editing.
 */
#[ImageToolkitOperation(
  id: "gutenberg_gd_flip",
  toolkit: "gd",
  operation: "gutenberg_flip",
  label: new TranslatableMarkup("Flip"),
  description: new TranslatableMarkup("Flips an image horizontally and/or vertically.")
)]
class Flip extends GDImageToolkitOperationBase {

  /**
   * {@inheritdoc}
   */
  protected function arguments() {
    return [
      'horizontal' => [
        'description' => 'Whether to mirror the image from left to right',
        'required' => FALSE,
        'default' => FALSE,
      ],
      'vertical' => [
        'description' => 'Whether to mirror the image from top to bottom',
        'required' => FALSE,
        'default' => FALSE,
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  protected function validateArguments(array $arguments) {
    $arguments['horizontal'] = (bool) $arguments['horizontal'];
    $arguments['vertical'] = (bool) $arguments['vertical'];
    return $arguments;
  }

  /**
   * {@inheritdoc}
   */
  protected function execute(array $arguments) {
    if ($arguments['horizontal'] && $arguments['vertical']) {
      $mode = IMG_FLIP_BOTH;
    }
    elseif ($arguments['horizontal']) {
      $mode = IMG_FLIP_HORIZONTAL;
    }
    elseif ($arguments['vertical']) {
      $mode = IMG_FLIP_VERTICAL;
    }
    else {
      return TRUE;
    }

    return imageflip($this->getToolkit()->getImage(), $mode);
  }

}
