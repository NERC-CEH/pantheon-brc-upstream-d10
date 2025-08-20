<?php

namespace Drupal\commerce_variation_add_to_cart\Controller;

use Drupal\commerce_cart\CartManagerInterface;
use Drupal\commerce_cart\CartProviderInterface;
use Drupal\commerce_order\Entity\OrderItem;
use Drupal\commerce_product\Entity\ProductVariation;
use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Variation add to cart form controller.
 */
class VariationAddToCart extends ControllerBase {

  /**
   * The cart manager.
   *
   * @var \Drupal\commerce_cart\CartManagerInterface
   */
  protected $cartManager;

  /**
   * The cart provider.
   *
   * @var \Drupal\commerce_cart\CartProviderInterface
   */
  protected $cartProvider;

  /**
   * The current request.
   *
   * @var \Symfony\Component\HttpFoundation\Request
   */
  protected $currentRequest;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    $instance = parent::create($container);
    $instance->setCartManager($container->get('commerce_cart.cart_manager'));
    $instance->setCartProvider($container->get('commerce_cart.cart_provider'));
    $instance->setCurrentRequest($container->get('request_stack'));
    return $instance;
  }

  /**
   * Sets the cart manager.
   *
   * @param \Drupal\commerce_cart\CartManagerInterface $cart_manager
   *   The cart manager.
   */
  public function setCartManager(CartManagerInterface $cart_manager) {
    $this->cartManager = $cart_manager;
  }

  /**
   * Sets the cart provider.
   *
   * @param \Drupal\commerce_cart\CartProviderInterface $cart_provider
   *   The cart provider.
   */
  public function setCartProvider(CartProviderInterface $cart_provider) {
    $this->cartProvider = $cart_provider;
  }

  /**
   * Sets the current request.
   *
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   The request stack.
   */
  public function setCurrentRequest(RequestStack $request_stack) {
    $this->currentRequest = $request_stack->getCurrentRequest();
  }

  /**
   * Add item to cart.
   */
  public function addItem() {
    // Get item data from post request.
    $product_id = (integer) $this->currentRequest->request->get('product_id');
    $variation_id = (integer) $this->currentRequest->request->get('variation_id');
    $quantity = (integer) $this->currentRequest->request->get('quantity');
    $destination = $this->currentRequest->request->get('destination');
    if (empty($destination)) {
      $destination = '/cart';
    }

    if ($product_id > 0 && $variation_id > 0 && $quantity > 0) {
      // Load product variation and get store.
      $variation = ProductVariation::load($variation_id);
      $variation_price = $variation->getPrice();
      $stores = $variation->getStores();
      $store = reset($stores);

      $all_carts = $this->cartProvider->getCarts();
      $cart = reset($all_carts);
      // Create cart for user if it already doesn't exist.
      if (!$cart) {
        $cart = $this->cartProvider->createCart('default', $store);
      }

      $order_item = OrderItem::create([
        'type' => 'default',
        'purchased_entity' => (string) $variation_id,
        'quantity' => $quantity,
        'unit_price' => $variation_price,
      ]);
      $order_item->save();
      $this->cartManager->addOrderItem($cart, $order_item);

      return new RedirectResponse($destination);
    }

    $this->messenger()->addMessage($this->t('Product not added to your cart.'), 'error', TRUE);
    return new RedirectResponse($destination);
  }

}
