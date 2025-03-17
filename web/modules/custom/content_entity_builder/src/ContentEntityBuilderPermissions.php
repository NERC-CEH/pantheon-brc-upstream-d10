<?php

namespace Drupal\content_entity_builder;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\content_entity_builder\Entity\ContentType;
use Drupal\Core\Config\Entity\ConfigEntityBundleBase;

/**
 * Provides dynamic permissions for nodes of different types.
 */
class ContentEntityBuilderPermissions {

  use StringTranslationTrait;

  /**
   * Returns an array of content type permissions.
   *
   * @return array
   *   The content type permissions.
   *
   * @see \Drupal\user\PermissionHandlerInterface::getPermissions()
   */
  public function contentTypePermissions() {
    $perms = [];
    // Generate node permissions for all node types.
    foreach (ContentType::loadMultiple() as $type) {
      $mode = $type->getMode();
      if($mode === "basic" || $mode === "basic_plus"){
        $perms += $this->buildPermissions($type);
      }elseif($mode === "advanced" || $mode === "full"){
        $perms += $this->buildAdvancedPermissions($type);
	  }elseif($mode === "full"){
		// do we need this feature?
        //$bundles = \Drupal::entityTypeManager()->getStorage($type->id() . "_type")->loadMultiple();
        //foreach ($bundles as $bundle) {		
        //  $perms += $this->buildFullPermissions($type, $bundle);
        //}
	  }
    }

    return $perms;
  }

  /**
   * Returns a list of content permissions for a given content entity type.
   *
   * @param \Drupal\content_entity_builder\Entity\ContentType $type
   *   The content type.
   *
   * @return array
   *   An associative array of permission names and descriptions.
   */
  protected function buildPermissions(ContentType $type) {
    $type_id = $type->id();
    $type_params = ['%type_name' => $type->label()];

    return [
      "access $type_id content entity" => [
        'title' => $this->t('%type_name: Access content entity', $type_params),
      ],
      "create $type_id content entity" => [
        'title' => $this->t('%type_name: Create new content entity', $type_params),
      ],
      "edit any $type_id content entity" => [
        'title' => $this->t('%type_name: Edit any content entity', $type_params),
      ],
      "delete any $type_id content entity" => [
        'title' => $this->t('%type_name: Delete any content entity', $type_params),
      ],

    ];
  }
  
  /**
   * Returns a list of content permissions for a given content entity type.
   *
   * @param \Drupal\content_entity_builder\Entity\ContentType $type
   *   The content type.
   *
   * @return array
   *   An associative array of permission names and descriptions.
   */
  protected function buildAdvancedPermissions(ContentType $type) {
    $type_id = $type->id();
    $type_params = ['%type_name' => $type->label()];

    return [
      "access $type_id content entity" => [
        'title' => $this->t('%type_name: Access content entity', $type_params),
      ],
      "create $type_id content entity" => [
        'title' => $this->t('%type_name: Create new content entity', $type_params),
      ],
      "edit any $type_id content entity" => [
        'title' => $this->t('%type_name: Edit any content entity', $type_params),
      ],
      "edit own $type_id content entity" => [
        'title' => $this->t('%type_name: Edit own content entity', $type_params),
      ],	  
      "delete any $type_id content entity" => [
        'title' => $this->t('%type_name: Delete any content entity', $type_params),
      ],
      "delete own $type_id content entity" => [
        'title' => $this->t('%type_name: Delete own content entity', $type_params),
      ],
    ];
  }  
  
  /**
   * Returns a list of entity permissions for a given bundle.
   *
   * @param \Drupal\node\Entity\NodeType $type
   *   The entity bundle type.
   *
   * @return array
   *   An associative array of permission names and descriptions.
   */
  protected function buildFullPermissions(ContentType $type, ConfigEntityBundleBase $bundle) {
    $type_id = $type->id();
    $bundle_id = $bundle->id();
    $type_params = ['%bundle_name' => $bundle->label(), '%entity_name' => $type->id()];

    return [
      "create $bundle_id $type_id" => [
        'title' => $this->t('%bundle_name: Create new %entity_name', $type_params),
      ],
      "edit own $bundle_id $type_id" => [
        'title' => $this->t('%bundle_name: Edit own %entity_name', $type_params),
      ],
      "edit any $bundle_id $type_id" => [
        'title' => $this->t('%bundle_name: Edit any %entity_name', $type_params),
      ],
      "delete own $bundle_id $type_id" => [
        'title' => $this->t('%bundle_name: Delete own %entity_name', $type_params),
      ],
      "delete any $bundle_id $type_id" => [
        'title' => $this->t('%bundle_name: Delete any %entity_name', $type_params),
      ],
      "view $bundle_id $type_id revisions" => [
        'title' => $this->t('%bundle_name: View %entity_name revisions', $type_params),
      ],
      "revert $bundle_id $type_id revisions" => [
        'title' => $this->t('%bundle_name: Revert %entity_name revisions', $type_params),
      ],
      "delete $bundle_id $type_id revisions" => [
        'title' => $this->t('%bundle_name: Delete %entity_name revisions', $type_params),
      ],
    ];
  }  

}
