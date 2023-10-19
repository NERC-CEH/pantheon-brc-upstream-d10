<?php

namespace Drupal\filefield_sources\Access;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Routing\Access\AccessInterface;
use Drupal\Core\Session\AccountInterface;

/**
 * Access check for file field source routes.
 *
 * NOTE: AccessInterface has no methods declared, so it might be removed in the
 * future.
 */
class FieldAccessCheck implements AccessInterface {

  /**
   * The entity type manager service.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Constructs an EntityCreateAccessCheck object.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager service.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager) {
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * Checks access.
   *
   * @param string $entity_type
   *   Entity type.
   * @param string $bundle_name
   *   Bundle name.
   * @param string $field_name
   *   Field name.
   * @param \Drupal\Core\Session\AccountInterface $account
   *   The currently logged in account.
   *
   * @return \Drupal\Core\Access\AccessResultInterface
   *   AccessResult object
   */
  public function access(string $entity_type, string $bundle_name, string $field_name, AccountInterface $account) {
    $field = $this->entityTypeManager->getStorage('field_config')->load($entity_type . '.' . $bundle_name . '.' . $field_name);
    return $this->entityTypeManager->getAccessControlHandler($entity_type)->fieldAccess('edit', $field, $account, NULL, TRUE);
  }

}
