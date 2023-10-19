<?php

namespace Drupal\Tests\filefield_sources\Functional;

use Drupal\Core\Field\FieldStorageDefinitionInterface;

/**
 * Tests multiple sources on multiple values field.
 *
 * @group filefield_sources
 */
class MultipleValuesTest extends FileFieldSourcesTestBase {

  /**
   * Permanent file entity.
   *
   * @var object
   */
  protected $permanentFileEntity1;

  /**
   * Permanent file entity.
   *
   * @var object
   */
  protected $permanentFileEntity2;

  /**
   * Temporary file entity.
   *
   * @var object
   */
  protected $temporaryFileEntity1;

  /**
   * Temporary file entity.
   *
   * @var object
   */
  protected $temporaryFileEntity2;

  /**
   * Temporary file entity.
   *
   * @var object
   */
  protected $temporaryFile;

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['imce'];

  /**
   * Sets up for multiple values test case.
   */
  protected function setUp() {
    parent::setUp();
    $this->setUpImce();

    // Create test files.
    $this->permanentFileEntity1 = $this->createPermanentFileEntity();
    $this->permanentFileEntity2 = $this->createPermanentFileEntity();
    $this->temporaryFileEntity1 = $this->createTemporaryFileEntity();
    $this->temporaryFileEntity2 = $this->createTemporaryFileEntity();

    $path = \Drupal::config('system.file')->get('default_scheme') . '://' . FILEFIELD_SOURCE_ATTACH_DEFAULT_PATH . '/';
    $this->temporaryFile = $this->createTemporaryFile($path);

    // Change allowed number of values.
    $this->drupalPostForm('admin/structure/types/manage/' . $this->typeName . '/fields/node.' . $this->typeName . '.' . $this->fieldName . '/storage', ['cardinality' => FieldStorageDefinitionInterface::CARDINALITY_UNLIMITED], t('Save field settings'));

    $this->enableSources([
      'upload' => TRUE,
      'remote' => TRUE,
      'clipboard' => TRUE,
      'reference' => TRUE,
      'attach' => TRUE,
      'imce' => TRUE,
    ]);
  }

  /**
   * Tests uploading then removing files.
   */
  public function testUploadThenRemoveFiles() {
    $this->uploadFiles();

    // Remove all uploaded files.
    $this->removeFile('INSTALL.txt', 0);
    $this->removeFile($this->permanentFileEntity1->getFilename(), 0);
    $this->removeFile($this->temporaryFile->filename, 0);
    $this->removeFile($this->temporaryFileEntity2->getFilename(), 0);
    $this->removeFile($this->temporaryFileEntity1->getFilename(), 0);
    $this->removeFile($this->permanentFileEntity2->getFilename(), 0);

    // Ensure all files have been removed.
    $this->assertNoFieldByXPath('//input[@type="submit"]', t('Remove'), 'All files have been removed.');
  }

  /**
   * Tests uploading files and saving node.
   */
  public function testUploadFilesThenSaveNode() {
    $this->uploadFiles();

    $this->drupalPostForm(NULL, ['title[0][value]' => $this->randomMachineName()], t('Save'));

    // Ensure all files are saved to node.
    $this->assertLink('INSTALL.txt');
    $this->assertLink($this->permanentFileEntity1->getFilename());
    $this->assertLink($this->temporaryFile->filename);
    $this->assertLink($this->temporaryFileEntity2->getFilename());
    $this->assertLink($this->temporaryFileEntity1->getFilename());
    $this->assertLink($this->permanentFileEntity2->getFilename());
  }

  /**
   * Upload files.
   *
   * @return int
   *   Number of files uploaded.
   */
  protected function uploadFiles() {
    $uploaded_files = 0;

    // Ensure no files has been uploaded.
    $this->assertNoFieldByXPath('//input[@type="submit"]', t('Remove'), 'There are no file have been uploaded.');

    // Upload a file by 'Remote' source.
    $this->uploadFileByRemoteSource($GLOBALS['base_url'] . '/core/INSTALL.txt', 'INSTALL.txt', $uploaded_files);
    $uploaded_files++;

    // Upload a file by 'Reference' source.
    $this->uploadFileByReferenceSource($this->permanentFileEntity1->id(), $this->permanentFileEntity1->getFilename(), $uploaded_files);
    $uploaded_files++;

    // Upload a file by 'Attach' source.
    $this->uploadFileByAttachSource($this->temporaryFile->uri, $this->temporaryFile->filename, $uploaded_files);
    $uploaded_files++;

    // Upload a file by 'Upload' source.
    $this->uploadFileByUploadSource($this->temporaryFileEntity2->getFileUri(), $this->temporaryFileEntity2->getFilename(), $uploaded_files, TRUE);
    $uploaded_files++;

    // Upload a file by 'Clipboard' source.
    $this->uploadFileByClipboardSource($this->temporaryFileEntity1->getFileUri(), $this->temporaryFileEntity1->getFileName(), $uploaded_files);
    $uploaded_files++;

    // Upload a file by 'Imce' source.
    $this->uploadFileByImceSource($this->permanentFileEntity2->getFileUri(), $this->permanentFileEntity2->getFileName(), $uploaded_files);
    $uploaded_files++;

    // Ensure files have been uploaded.
    $remove_buttons = $this->xpath('//input[@type="submit" and @value="' . t('Remove') . '"]');
    $this->assertEqual(count($remove_buttons), $uploaded_files, "There are $uploaded_files files have been uploaded.");

    return $uploaded_files;
  }

}
