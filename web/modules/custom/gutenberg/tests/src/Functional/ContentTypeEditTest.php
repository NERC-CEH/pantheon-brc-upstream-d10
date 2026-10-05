<?php

namespace Drupal\Tests\gutenberg\Functional;

use Drupal\Tests\BrowserTestBase;

/**
 * Test that we can enable gutenberg on a content type.
 *
 * @group gutenberg
 */
class ContentTypeEditTest extends BrowserTestBase {

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'claro';

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'gutenberg',
  ];

  /**
   * A user we can use.
   *
   * @var \Drupal\user\Entity\User
   */
  protected $adminUser;

  /**
   * {@inheritdoc}
   */
  public function setUp(): void {
    parent::setUp();
    $this->adminUser = $this->drupalCreateUser([
      'administer content types',
    ]);
  }

  /**
   * Test that editing a content type and enabling gutenberg works.
   */
  public function testEditContentType() {
    $this->drupalLogin($this->adminUser);
    $content_type = $this->createContentType([
      'type' => 'page',
      'name' => 'Page',
    ]);
    $this->drupalGet('admin/structure/types/manage/' . $content_type->id());
    // Save it, and now it should be checked?
    $this->submitForm([
      "enable_gutenberg_experience" => TRUE,
    ], 'edit-submit');
    $this->drupalGet('admin/structure/types/manage/' . $content_type->id());
    // We should have the checkbox.
    $this->assertSession()->checkboxChecked('enable_gutenberg_experience');
  }

  /**
   * Test the "Show the title in the editor" content type setting.
   */
  public function testTitleInEditorSetting() {
    $this->drupalLogin($this->adminUser);
    $content_type = $this->createContentType([
      'type' => 'page',
      'name' => 'Page',
    ]);
    $path = 'admin/structure/types/manage/' . $content_type->id();

    $this->drupalGet($path);
    $this->submitForm([
      'enable_gutenberg_experience' => TRUE,
      'title_in_editor' => TRUE,
    ], 'edit-submit');
    $this->drupalGet($path);
    $this->assertSession()->checkboxChecked('title_in_editor');
    $this->assertTrue($this->config('gutenberg.settings')->get('page_title_in_editor'));

    // Disabling Gutenberg clears the setting.
    $this->submitForm([
      'enable_gutenberg_experience' => FALSE,
    ], 'edit-submit');
    $this->assertNull($this->config('gutenberg.settings')->get('page_title_in_editor'));
  }

}
