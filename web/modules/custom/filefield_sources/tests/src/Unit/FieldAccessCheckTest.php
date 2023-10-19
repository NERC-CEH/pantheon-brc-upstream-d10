<?php

namespace Drupal\Tests\filefield_sources\Unit;

use Drupal\Component\DependencyInjection\Container;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\filefield_sources\Access\FieldAccessCheck;
use Drupal\Core\Access\AccessResult;
use Drupal\Tests\UnitTestCase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityAccessControlHandlerInterface;

/**
 * @coversDefaultClass \Drupal\filefield_sources\Access\FieldAccessCheck
 * @group Access
 */
class FieldAccessCheckTest extends UnitTestCase {
  /**
   * The entity type manager service.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {

    $field_definition = $this->createMock(FieldDefinitionInterface::class);

    $field_storage = $this->createMock(EntityStorageInterface::class);
    $field_storage->expects($this->any())
      ->method('load')
      ->willReturn($field_definition);

    $this->entityTypeManager = $this->createMock(EntityTypeManagerInterface::class);
    $this->entityTypeManager->expects($this->any())
      ->method('getStorage')
      ->willReturn($field_storage);

    $container = new Container();
    \Drupal::setContainer($container);
  }

  /**
   * Provides test data for testAccess().
   *
   * Only will return true only if the field is editable.
   *
   * @see \Drupal\Tests\filefield_sources\Unit\FieldAccessCheckTest::testAccess()
   */
  public function providerTestAccess() {
    $data = [];
    $data[] = [TRUE, AccessResult::allowed()];
    $data[] = [FALSE, AccessResult::forbidden()];

    return $data;
  }

  /**
   * Tests the FileFieldAccessCheck.
   *
   * This check is pretty straightforward if the user is not allowed to edit
   * the field value then is not allowed then the access check is not allowed
   * either.
   *
   * This is used for instance in the reference FilefieldSource if the user
   * cannot use the field then the route for the autocomplete is now allowed
   * either.
   *
   * @param bool $field_storage_is_accessible
   *   Whether the user has access to the field storage entity.
   * @param \Drupal\Core\Access\AccessResult $expected_result
   *   The expected result of the access call.
   *
   * @dataProvider providerTestAccess
   */
  public function testAccess(bool $field_storage_is_accessible, AccessResult $expected_result) {
    $access_result = AccessResult::forbidden();
    if ($field_storage_is_accessible) {
      $access_result = AccessResult::allowed();
    }
    $access_control = $this->createMock(EntityAccessControlHandlerInterface::class);
    $access_control->expects($this->any())
      ->method('fieldAccess')
      ->willReturn($access_result);

    $this->entityTypeManager->expects($this->any())
      ->method('getAccessControlHandler')
      ->willReturn($access_control);

    $editAccessCheck = new FieldAccessCheck($this->entityTypeManager);

    $account = $this->createMock('Drupal\Core\Session\AccountInterface');
    $access = $editAccessCheck->access('edit', 'bundle', 'field', $account);
    $this->assertEquals($expected_result, $access);
  }

}
