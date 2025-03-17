<?php

namespace Drupal\content_entity_builder\Entity;

use Drupal\Core\Config\Entity\ConfigEntityBundleBase;
use Drupal\content_entity_builder\ContentTypeBundleInterface;
use Drupal\content_entity_builder\Entity\ContentType;

/**
 * Defines the custom block type entity.
 *
 * @ConfigEntityType(
 *   id = "content_type_bundle",
 *   label = @Translation("Content entity type bundle"),
 *   handlers = {
 *     "form" = {
 *       "default" = "Drupal\content_entity_builder\Form\ContentTypeBundleForm",
 *       "add" = "Drupal\content_entity_builder\Form\ContentTypeBundleForm",
 *       "edit" = "Drupal\content_entity_builder\Form\ContentTypeBundleForm",
 *       "delete" = "Drupal\content_entity_builder\Form\Form\ContentTypeBundleDeleteForm"
 *     },
 *     "list_builder" = "Drupal\content_entity_builder\ContentTypeBundleListBuilder"
 *   },
 *   admin_permission = "administer content entity bundles",
 *   config_prefix = "content_bundle",
 *   entity_keys = {
 *     "id" = "id",
 *     "label" = "label"
 *   },
 *   config_export = {
 *     "id",
 *     "label",
 *     "content_type", 
 *     "description"
 *   }
 * )
 */
class ContentTypeBundle extends ConfigEntityBundleBase implements ContentTypeBundleInterface {

  /**
   * The custom bundle ID.
   *
   * @var string
   */
  protected $id;

  /**
   * The custom bundle label.
   *
   * @var string
   */
  protected $label;


  /**
   * The description of the bundle.
   *
   * @var string
   */
  protected $description;
  
  /**
   * The content entity type that this bundle used.
   *
   * @var string
   */
  protected $content_type;

  /**
   * {@inheritdoc}
   */
  public function getDescription() {
    return $this->description;
  }

  
  /**
   * {@inheritdoc}
   */
  public function getContentType() {
    return $this->content_type;
  }

  /**
   * {@inheritdoc}
   */
  public function setContentType($content_type) {
    $this->content_type = $content_type;
    return $content_type;
  }  
  
  /**
   * {@inheritdoc}
   */
  public static function loadMultiple(array $ids = NULL) {
	//never call it from here
	// "Drupal\Core\Entity\Exception\AmbiguousEntityClassException: Multiple entity types found"
   /* $bundle_type = self::getContentType() . '_type';
	$bundles = \Drupal::entityTypeManager()->getStorage($bundle_type)->loadMultiple($ids);
    return $bundles;
  */	

    //$entity_manager = \Drupal::entityTypeManager();
	//$content_types = ContentType::loadMultiple();
    $bundles = [];

    return $bundles;
  }

  /**
   * {@inheritdoc}
   */
  public static function load($id) {
    $entities = self::loadMultiple([$id]);
    return reset($entities);
  }  

}
