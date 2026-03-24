<?php

declare(strict_types=1);

namespace Drupal\Tests\forum_access\Functional;

use Drupal\Tests\BrowserTestBase;
use PHPUnit\Framework\Attributes\Group;

/**
 * Forum Node display test
 */
#[Group('forum_access')]
final class ForumNodeDisplayTest extends BrowserTestBase {

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'claro';

  /**
   * Disabled config schema checking temporarily until all errors are resolved.
   */
  protected $strictConfigSchema = FALSE;

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'field_ui',
    'forum',
    'forum_access'
  ];

  /**
   * Test node type display.
   */
  public function testNodeTypeDisplay(): void {
    $admin_user = $this->drupalCreateUser(['administer node display']);
    $this->drupalLogin($admin_user);
    $this->drupalGet('/admin/structure/types/manage/forum/display');
    $edit = [
      'fields[comment_forum][type]' => 'comment_forum',
    ];
    $this->submitForm($edit, 'Save');
    $this->assertSession()->statusCodeEquals(200);
  }

}
