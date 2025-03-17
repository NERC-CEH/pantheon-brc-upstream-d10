<?php

namespace Drupal\content_entity_builder;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Entity\EntityAccessControlHandler;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Session\AccountInterface;

/**
 * Access controller for the Content entity.
 *
 * @ingroup content_entity_builder
 *
 * @see \Drupal\content_entity_builder\Entity\Content.
 */
class ContentEntityBuilderAccessControlHandler extends EntityAccessControlHandler {

  /**
   * {@inheritdoc}
   */
  public function access(EntityInterface $entity, $operation, AccountInterface $account = NULL, $return_as_object = FALSE) {
    return parent::access($entity, $operation, $account, $return_as_object);
  }

  /**
   * {@inheritdoc}
   */
  public function createAccess($entity_bundle = NULL, AccountInterface $account = NULL, array $context = array(), $return_as_object = FALSE) {
    return parent::createAccess($entity_bundle, $account, $context, $return_as_object);
  }

  /**
   * {@inheritdoc}
   */
  protected function checkAccess(EntityInterface $entity, $operation, AccountInterface $account) {
    // Check edit permission on update operation.
    $operation = ($operation === 'update') ? 'edit' : $operation;
    $permission = "";
    if ($operation === 'view') {
      $permission = 'access ' . $entity->getEntityTypeId() . ' content entity';
    }elseif($operation === 'edit' || $operation === 'delete') {
      $permissions[] = $operation . ' any ' . $entity->getEntityTypeId() . ' content entity';
	  //entity instanceof EntityOwnerInterface has getOwnerId function, we check it
      if (($entity instanceof \Drupal\user\EntityOwnerInterface) && ($entity->getOwnerId() == $account->id())) {
      //if ( ($entity->getOwnerId() == $account->id())) {		  
        $permissions[] = $operation . ' own ' . $entity->getEntityTypeId() . ' content entity';
		//\Drupal::logger('content_entity_builder')->notice(var_export($permissions, true));
      }
	  //$owner_id = $entity->getOwnerId();
	  // \Drupal::logger('content_entity_builder')->notice("owner_id:" .var_export($owner_id, true));
	  //\Drupal::logger('content_entity_builder')->notice(var_export($permissions, true));
      return AccessResult::allowedIfHasPermissions($account, $permissions, 'OR');		
	}else {
      $permission = $operation . ' any ' . $entity->getEntityTypeId() . ' content entity';		
	}

    return AccessResult::allowedIfHasPermission($account, $permission);
  }

  /**
   * {@inheritdoc}
   */
  protected function checkCreateAccess(AccountInterface $account, array $context, $entity_bundle = NULL) {
    $permission = 'create ' . $this->entityTypeId . ' content entity';
    return AccessResult::allowedIfHasPermission($account, $permission);
  }

}
