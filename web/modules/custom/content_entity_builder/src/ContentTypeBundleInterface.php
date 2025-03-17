<?php

namespace Drupal\content_entity_builder;

use Drupal\Core\Config\Entity\ConfigEntityInterface;

/**
 * Provides an interface defining a custom entity bundle.
 */
interface ContentTypeBundleInterface extends ConfigEntityInterface {

  /**
   * Returns the description of the bundle.
   *
   * @return string
   *   The description of the bundle.
   */
  public function getDescription();

}
