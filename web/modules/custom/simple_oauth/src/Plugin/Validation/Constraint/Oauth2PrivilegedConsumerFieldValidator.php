<?php

namespace Drupal\simple_oauth\Plugin\Validation\Constraint;

use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

/**
 * Validates the Oauth2PrivilegedConsumerField constraint.
 *
 * Some consumer fields decide what access the consumer's tokens get: the roles
 * added to every token, the user a token acts as when no user authorized it,
 * and whether authorization skips the consent form. Without the 'administer
 * consumer access settings' permission a user may keep or remove existing
 * values, assign themselves as the user and add roles they have themselves,
 * but not grant anything beyond that.
 */
class Oauth2PrivilegedConsumerFieldValidator extends ConstraintValidator implements ContainerInjectionInterface {

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Constructs a new Oauth2PrivilegedConsumerFieldValidator.
   *
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *   The current user.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   */
  public function __construct(AccountProxyInterface $current_user, EntityTypeManagerInterface $entity_type_manager) {
    $this->currentUser = $current_user;
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('current_user'),
      $container->get('entity_type.manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function validate($value, Constraint $constraint) {
    /** @var \Drupal\Core\Field\FieldItemListInterface $value */
    if ($this->currentUser->hasPermission('administer consumer access settings')) {
      return;
    }

    $values = $this->getPrivilegedValues($value);
    if (!$values) {
      return;
    }

    // Keeping a value that is already saved is allowed; only adding one grants
    // privileges.
    $consumer = $value->getEntity();
    if (!$consumer->isNew()) {
      $original = $this->entityTypeManager
        ->getStorage($consumer->getEntityTypeId())
        ->loadUnchanged($consumer->id());
      if ($original) {
        $values = array_diff($values, $this->getPrivilegedValues($original->get($value->getName())));
      }
    }

    if ($values) {
      $this->context->addViolation($constraint->message, [
        '%field' => $value->getFieldDefinition()->getLabel(),
      ]);
    }
  }

  /**
   * Gets the values of a field that grant privileges.
   *
   * @param \Drupal\Core\Field\FieldItemListInterface $items
   *   The field items.
   *
   * @return string[]
   *   The values that need the 'administer consumer access settings'
   *   permission.
   */
  protected function getPrivilegedValues(FieldItemListInterface $items) {
    $values = [];
    foreach ($items as $item) {
      $value = (string) $item->{$item::mainPropertyName()};
      if ($value !== '' && $value !== '0') {
        $values[] = $value;
      }
    }

    switch ($items->getFieldDefinition()->getName()) {
      case 'third_party':
        // Only an unchecked value skips the consent form.
        return $values ? [] : ['0'];

      case 'user_id':
        // Users may always assign themselves as the consumer's user.
        return array_diff($values, [(string) $this->currentUser->id()]);

      case 'roles':
        // Users may add roles they have themselves.
        return array_diff($values, $this->currentUser->getRoles());
    }
    return $values;
  }

}
