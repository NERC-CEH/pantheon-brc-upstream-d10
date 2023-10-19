<?php

namespace Drupal\Tests\filefield_sources\Functional;

use Drupal\Component\Render\PlainTextOutput;

/**
 * Tests the attach source.
 *
 * @group filefield_sources
 */
class AttachSourceTest extends FileFieldSourcesTestBase {

  /**
   * Tests move relative files with different names.
   *
   * Default settings: Move file from 'public://file_attach' to 'public://'.
   */
  public function testMoveFilesFromRelativePath() {
    $uri_scheme = $this->getFieldSetting('uri_scheme');
    $path = $uri_scheme . '://' . FILEFIELD_SOURCE_ATTACH_DEFAULT_PATH . '/';
    $this->enableSources([
      'attach' => TRUE,
    ]);

    // File with a random name.
    $file = $this->createTemporaryFile($path);
    $dest_uri = $this->getDestinationUri($file, $uri_scheme);
    $this->drupalGet('node/add/' . $this->typeName);
    $this->fileCanBeUploadAndDeleted($file, $dest_uri);

    // File with an space in the name.
    $file = $this->createTemporaryFile($path, 'test file.txt');
    $dest_uri = $this->getDestinationUri($file, $uri_scheme);
    $this->drupalGet('node/add/' . $this->typeName);
    $this->fileCanBeUploadAndDeleted($file, $dest_uri);

    // File with special characters in the name that are going to be
    // transliterated.
    $original_filename = 'file_áéíóú_ññ.txt';
    $transliterated_filename = 'file_aeiou_nn.txt';
    $file = $this->createTemporaryFile($path, $original_filename);
    $file->filename = $transliterated_filename;
    $dest_uri = $this->getDestinationUri($file, $uri_scheme);
    $this->drupalGet('node/add/' . $this->typeName);
    $this->fileCanBeUploadAndDeleted($file, $dest_uri);
  }

  /**
   * @param object $file
   *   The file object.
   * @param string $dest_uri
   *   The dest Uri where the file was uploaded.
   */
  public function fileCanBeUploadAndDeleted($file, $dest_uri) {
    $this->assertCanAttachFile($file);

    // Upload a file.
    $this->uploadFileByAttachSource($file->uri, $file->filename, 0);

    // We can only attach one file on single value field.
    $this->assertNoFieldByXPath('//input[@type="submit"]', t('Attach'), 'After uploading a file, "Attach" button is no longer displayed.');

    // Ensure file is moved.
    $this->assertFalse(is_file($file->uri), 'Source file has been removed.');
    $this->assertTrue(is_file($dest_uri), 'Destination file has been created.');

    $this->removeFile($file->filename, 0);

    $this->assertCanNotAttachFile($file);
  }

  /**
   * Get destination uri of a .
   *
   * @param object $file
   *   File.
   * @param string $uri_scheme
   *   Uri scheme.
   */
  public function getDestinationUri($file, $uri_scheme) {
    $destination = trim($this->getFieldSetting('file_directory'), '/');
    $destination = PlainTextOutput::renderFromHtml(\Drupal::token()
      ->replace($destination));
    return $uri_scheme . '://' . $destination . '/' . $file->filename;
  }

  /**
   * Check to see if can attach file.
   *
   * @param object $file
   *   File to attach.
   */
  public function assertCanAttachFile($file) {
    // Ensure option is present.
    $this->assertTrue($this->isOptionPresent($file->uri), 'File option is present.');

    // Ensure empty message is not present.
    $this->assertNoText('There currently are no files to attach.', "Empty message is not present.");

    // Attach button is always present.
    $this->assertFieldByXpath('//input[@type="submit"]', t('Attach'), 'Attach button is present.');
  }

  /**
   * Check to see if a option is present.
   *
   * @param string $uri
   *   The option to check.
   *
   * @return bool
   *   TRUE if the option is present, FALSE otherwise.
   */
  public function isOptionPresent($uri) {
    $options = $this->xpath('//select[@name=:name]/option[@value=:option]', [
      ':name' => $this->fieldName . '[0][filefield_attach][filename]',
      ':option' => $uri,
    ]);
    return isset($options[0]);
  }

  /**
   * Check to see if can attach file.
   *
   * @param object $file
   *   File to attach.
   */
  public function assertCanNotAttachFile($file) {
    // Ensure option is not present.
    $this->assertFalse($this->isOptionPresent($file->uri), 'File option is not present.');

    // Ensure empty message is present.
    $this->assertText('There currently are no files to attach.', "Empty message is present.");

    // Attach button is always present.
    $this->assertFieldByXpath('//input[@type="submit"]', t('Attach'), 'Attach button is present.');
  }

  /**
   * Tests copy file from absolute path.
   *
   * Copy file from 'sites/default/files/custom_file_attach' to 'public://'.
   */
  public function testCopyFileFromAbsolutePath() {
    $uri_scheme = $this->getFieldSetting('uri_scheme');
    $path = $this->getCustomAttachPath();

    // Create test file.
    $file = $this->createTemporaryFile($path);
    $dest_uri = $this->getDestinationUri($file, $uri_scheme);

    // Change settings.
    $this->updateFilefieldSourcesSettings('source_attach', 'path', $path);
    $this->updateFilefieldSourcesSettings('source_attach', 'absolute', FILEFIELD_SOURCE_ATTACH_ABSOLUTE);
    $this->updateFilefieldSourcesSettings('source_attach', 'attach_mode', FILEFIELD_SOURCE_ATTACH_MODE_COPY);

    $this->enableSources([
      'attach' => TRUE,
    ]);

    $this->assertCanAttachFile($file);

    // Upload a file.
    $this->uploadFileByAttachSource($file->uri, $file->filename, 0);

    // We can only attach one file on single value field.
    $this->assertNoFieldByXPath('//input[@type="submit"]', t('Attach'), 'After uploading a file, "Attach" button is no longer displayed.');

    // Ensure file is copied.
    $this->assertTrue(is_file($file->uri), 'Source file still exists.');
    $this->assertTrue(is_file($dest_uri), 'Destination file has been created.');

    $this->removeFile($file->filename, 0);

    $this->assertCanAttachFile($file);
  }

  /**
   * Calculate custom absolute path.
   */
  public function getCustomAttachPath() {
    $path = \Drupal::service('file_system')->realpath($this->getFieldSetting('uri_scheme') . '://');
    $path = str_replace(realpath('./'), '', $path);
    $path = ltrim($path, '/');
    $path = $path . '/custom_file_attach/';
    return $path;
  }

}
