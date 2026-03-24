<?php

declare(strict_types=1);

namespace Drupal\Tests\forum\Unit;

use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Tests\UnitTestCase;

/**
 * @coversDefaultClass \Drupal\forum\ForumManager
 * @group forum
 */
class ForumManagerTest extends UnitTestCase {

  /**
   * Tests ForumManager::getIndex().
   */
  public function testGetIndex(): void {
    $entity_field_manager = $this->createMock(EntityFieldManagerInterface::class);
    $entity_type_manager = $this->createMock(EntityTypeManagerInterface::class);

    $storage = $this->createMock('\Drupal\taxonomy\VocabularyStorage');

    $config_factory = $this->createMock('\Drupal\Core\Config\ConfigFactoryInterface');

    $config = $this->createMock('\Drupal\Core\Config\Config');

    $config_factory->expects($this->once())
      ->method('get')
      ->willReturn($config);

    $config->expects($this->once())
      ->method('get')
      ->willReturn('forums');

    $entity_type_manager->expects($this->once())
      ->method('getStorage')
      ->willReturn($storage);

    // This is sufficient for testing purposes.
    $term = new \stdClass();

    $storage->expects($this->once())
      ->method('create')
      ->willReturn($term);

    $connection = $this->createMock('\Drupal\Core\Database\Connection');

    $translation_manager = $this->createMock('\Drupal\Core\StringTranslation\TranslationManager');

    $comment_manager = $this->createMock('\Drupal\comment\CommentManagerInterface');

    $manager = $this->getMockBuilder('\Drupal\forum\ForumManager')
      ->onlyMethods(['getChildren'])
      ->setConstructorArgs([
        $config_factory,
        $entity_type_manager,
        $connection,
        $translation_manager,
        $comment_manager,
        $entity_field_manager,
      ])
      ->getMock();

    $manager->expects($this->once())
      ->method('getChildren')
      ->willReturn([]);

    // Get the index once.
    $index1 = $manager->getIndex();

    // Get it again. This should not return the previously generated index. If
    // it does not, then the test will fail as the mocked methods will be called
    // more than once.
    $index2 = $manager->getIndex();

    $this->assertEquals($index1, $index2);
  }

}
