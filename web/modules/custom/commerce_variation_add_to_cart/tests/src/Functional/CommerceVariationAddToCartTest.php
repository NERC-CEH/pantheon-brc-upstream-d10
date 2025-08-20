<?php

namespace Drupal\Tests\commerce_variation_add_to_cart\Functional;

use Drupal\KernelTests\Core\Entity\EntityKernelTestBase;

/**
 * Tests the Commerce Variation Add to Cart formatter.
 *
 * @group commerce_variation_add_to_cart
 */
class CommerceVariationAddToCartTest extends EntityKernelTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  protected static $modules = [
    'commerce_variation_add_to_cart',
  ];

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * Tests widget.
   */
  public function testWidget() {
    $widgets = \Drupal::service('plugin.manager.field.formatter')->getDefinitions();
    $this->assertArrayHasKey('variation_add_to_cart', $widgets);
  }

}
