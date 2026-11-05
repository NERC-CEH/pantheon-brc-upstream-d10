<?php

namespace Drupal\simple_oauth\Plugin\Validation\Constraint;

use Symfony\Component\Validator\Constraint;

/**
 * Validation constraint for consumer fields that grant privileges.
 *
 * @Constraint(
 *   id = "Oauth2PrivilegedConsumerField",
 *   label = @Translation("OAuth2 privileged consumer field", context = "Validation"),
 * )
 */
class Oauth2PrivilegedConsumerField extends Constraint {

  /**
   * The default violation message.
   *
   * @var string
   */
  public $message = 'Setting %field on this consumer requires the "Administer consumer access settings" permission.';

}
