<?php

namespace Drupal\Tests\gutenberg\Functional;

use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;

/**
 * Test enable the media block update hook.
 */
#[Group('gutenberg')]
#[RunTestsInSeparateProcesses]
class UpdateAddMediaTest extends GutenbergBrowserTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'media',
  ];

  /**
   * Test the function gutenberg_update_8206.
   */
  public function testMediaUpdate() {
    // Cleanly installed site, no media enabled then (it has to be explicitly
    // enabled).
    $this->assertMediaBlockAllowed(FALSE);
    $module_handler = $this->container->get('module_handler');
    $module_handler->loadInclude('gutenberg', 'install');
    gutenberg_update_8206();
    // The update hook of 8301 changed around some of the config for
    // gutenberg.settings, so simply just running the update hook of 8206 will
    // make the settings be in the wrong format. Therefore we also run the
    // 8301 update hook here.
    gutenberg_update_8301();
    // Before this update hook, everyone with the media module installed would
    // get the media block enabled. So we want to make sure it's still always
    // there after it is being applied.
    $this->assertMediaBlockAllowed(TRUE);
  }

  /**
   * Asserts whether the editor of articles allows the media block.
   *
   * @param bool $allowed
   *   Whether the media block should be allowed.
   */
  protected function assertMediaBlockAllowed(bool $allowed) {
    $this->drupalGet('/node/add/article');
    $this->assertGutenbergEditorOnPage();
    $settings = $this->getDrupalSettings()['editor']['formats']['gutenberg']['editorSettings'];
    $this->assertSame($allowed, in_array('drupalmedia/drupal-media-entity', (array) $settings['allowedDrupalBlocks'], TRUE));
  }

}
