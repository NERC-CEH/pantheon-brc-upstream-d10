<?php

namespace Drupal\filefield_sources;

use Drupal\Core\Security\TrustedCallbackInterface;
use Drupal\Core\Render\Element;

class FilefieldSourcesPreRenderCallback implements TrustedCallbackInterface {

  /**
   * {@inheritdoc}
   */
  public static function trustedCallbacks() {
    return ['preRender'];
  }

  /**
   * #pre_render callback: hide sources if a file is currently uploaded.
   */
  public static function preRender($element) {
    // If we already have a file, we don't want to show the upload controls.
    if (!empty($element['#value']['fids'])) {
      foreach (Element::children($element) as $key) {
        if (!empty($element[$key]['#filefield_source'])) {
          $element[$key]['#access'] = FALSE;
        }
      }
    }
    return $element;
  }
}
