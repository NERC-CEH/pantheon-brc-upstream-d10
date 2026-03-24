<?php

declare(strict_types=1);

namespace Drupal\Tests\forum\Kernel;

use Drupal\forum\Form\Overview;
use Drupal\KernelTests\KernelTestBase;
use Drupal\taxonomy\Entity\Vocabulary;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;

/**
 * Tests the EntityFormInterface simulation of the Overview form.
 */
#[Group('forum')]
#[RunTestsInSeparateProcesses]
#[CoversClass(Overview::class)]
class OverviewFormTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'system',
    'user',
    'node',
    'options',
    'comment',
    'taxonomy',
    'forum',
    'text',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->installEntitySchema('node');
    $this->installEntitySchema('user');
    $this->installEntitySchema('comment');
    $this->installEntitySchema('taxonomy_term');

    $this->installConfig('forum');
  }

  /**
   * Tests high water property of SqlBase.
   */
  public function testOverviewEntityFormInterface(): void {
    $classResolver = $this->container->get('class_resolver');

    /** @var \Drupal\forum\Form\Overview $form */
    $form = $classResolver->getInstanceFromDefinition(Overview::class);

    $entity = $form->getEntity();
    $this->assertInstanceOf(Vocabulary::class, $entity, 'Returned entity should return a taxonomy vocabulary.');
    $this->assertEquals('forums', $entity->id(), 'Returned entity should be the forum vocabulary.');

    $operation = $form->getOperation();
    $this->assertEquals('overview', $operation, 'Returned operation should be "overview".');
  }

}
