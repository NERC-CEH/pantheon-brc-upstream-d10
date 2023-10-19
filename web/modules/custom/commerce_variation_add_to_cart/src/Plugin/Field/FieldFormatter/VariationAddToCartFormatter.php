<?php

namespace Drupal\commerce_variation_add_to_cart\Plugin\Field\FieldFormatter;

use Drupal\commerce_product\Entity\ProductAttributeValue;
use Drupal\commerce_product\Entity\ProductVariation;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Plugin implementation of the 'variation_add_to_cart_form' formatter.
 *
 * @FieldFormatter(
 *   id = "variation_add_to_cart",
 *   label = @Translation("Variation add to cart form"),
 *   field_types = {
 *     "entity_reference"
 *   }
 * )
 */
class VariationAddToCartFormatter extends FormatterBase implements ContainerFactoryPluginInterface {

  /**
   * The entity query.
   *
   * @var \Drupal\Core\Entity\Query\QueryInterface
   */
  protected $entityQuery;

  /**
   * The current request.
   *
   * @var \Symfony\Component\HttpFoundation\Request
   */
  protected $currentRequest;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    $instance = parent::create($container, $configuration, $plugin_id, $plugin_definition);
    $instance->setEntityQuery($container->get('entity_type.manager'));
    $instance->setCurrentRequest($container->get('request_stack'));
    return $instance;
  }

  /**
   * Sets entity query.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   */
  public function setEntityQuery(EntityTypeManagerInterface $entity_type_manager) {
    $this->entityQuery = $entity_type_manager->getStorage('commerce_product_attribute')
      ->getQuery();
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
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'show_title' => FALSE,
      'show_quantity' => TRUE,
      'show_price' => TRUE,
      'show_currency' => TRUE,
      'price_format' => '2',
      'attributes' => [],
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $form = parent::settingsForm($form, $form_state);

    $attributes = $this->entityQuery->execute();

    $form['show_title'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Show variation title.'),
      '#default_value' => $this->getSetting('show_title'),
    ];
    $form['show_quantity'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Show quantity box.'),
      '#default_value' => $this->getSetting('show_quantity'),
    ];
    $form['show_price'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Show price.'),
      '#default_value' => $this->getSetting('show_price'),
    ];
    $form['show_currency'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Show currency.'),
      '#default_value' => $this->getSetting('show_currency'),
    ];
    $form['price_format'] = [
      '#type' => 'select',
      '#title' => $this->t('Price format.'),
      '#options' => ['0' => '0', '2' => '0.00'],
      '#default_value' => $this->getSetting('price_format'),
    ];
    $form['attributes'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Display the following attributes'),
      '#options' => $attributes,
      '#default_value' => $this->getSetting('attributes'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = [];

    if ($this->getSetting('show_title')) {
      $summary[] = $this->t('Show variation title.');
    }
    else {
      $summary[] = $this->t('Do not show variation title.');
    }
    if ($this->getSetting('show_quantity')) {
      $summary[] = $this->t('Show quantity box.');
    }
    else {
      $summary[] = $this->t('Do not show quantity box.');
    }
    if ($this->getSetting('show_price')) {
      $summary[] = $this->t('Show price.');
    }
    else {
      $summary[] = $this->t('Do not show price.');
    }
    if ($this->getSetting('show_currency')) {
      $summary[] = $this->t('Show currency.');
    }
    else {
      $summary[] = $this->t('Do not show currency.');
    }
    if ($this->getSetting('price_format') == 2) {
      $summary[] = $this->t('Price format 0.00');
    }
    else {
      $summary[] = $this->t('Price format 0');
    }

    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $current_path = $this->currentRequest->getRequestUri();
    $element = [];

    foreach ($items as $delta => $item) {
      $variation = ProductVariation::load($item->target_id);

      $is_active = !empty($variation) ? $variation->isPublished() : FALSE;

      if (!$is_active) {
        continue;
      }

      $product_id = $variation->getProductId();
      $variation_price = $variation->getPrice();
      $variation_price_number = $variation_price->getNumber();
      $variation_price_currency = $variation_price->getCurrencyCode();

      $attributes_values = [];
      $attributes = $variation->getAttributeValueIds();
      foreach ($attributes as $key => $value) {
        $variation_attr = str_replace('attribute_', '', $key);
        $selected_attr = $this->getSetting('attributes');
        if (isset($selected_attr[$variation_attr]) && $selected_attr[$variation_attr] === $variation_attr) {
          $attribute_name = ProductAttributeValue::load($value);
          $attributes_values[] = $attribute_name->getName();
        }
      }

      $element[$delta] = [
        '#theme' => 'variation_add_to_cart_formatter',
        '#variation' => $variation,
        '#product_id' => $product_id,
        '#variation_id' => $item->target_id,
        '#show_title' => $this->getSetting('show_title'),
        '#title' => $variation->getTitle(),
        '#show_price' => $this->getSetting('show_price'),
        '#price_number' => $variation_price_number,
        '#price_format' => $this->getSetting('price_format'),
        '#show_currency' => $this->getSetting('show_currency'),
        '#price_currency' => $variation_price_currency,
        '#show_quantity' => $this->getSetting('show_quantity') == 1 ? 'number' : 'hidden',
        '#attributes' => $attributes_values,
        '#destination' => $current_path,
      ];

    }

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public static function isApplicable(FieldDefinitionInterface $field_definition) {
    $has_cart = \Drupal::moduleHandler()->moduleExists('commerce_cart');
    $entity_type = $field_definition->getTargetEntityTypeId();
    $field_name = $field_definition->getName();
    return $has_cart && $entity_type == 'commerce_product' && $field_name == 'variations';
  }

}
