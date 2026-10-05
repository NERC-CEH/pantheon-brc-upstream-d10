<?php

namespace Drupal\gutenberg;

use Drupal\Component\Utility\Bytes;
use Drupal\Component\Utility\Environment;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Utility\Token;
use Drupal\editor\Entity\Editor;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Upload files from Gutenberg editor upload method.
 *
 * @package Drupal\gutenberg
 */
class MediaUploader implements MediaUploaderInterface {

  /**
   * The file system service.
   *
   * @var \Drupal\Core\File\FileSystemInterface
   */
  protected $fileSystem;

  /**
   * Drupal token service container.
   *
   * @var \Drupal\Core\Utility\Token
   */
  protected $token;

  /**
   * MediaUploader constructor.
   *
   * @param \Drupal\Core\File\FileSystemInterface $file_system
   *   The file system service.
   * @param \Drupal\Core\Utility\Token $token
   *   The token service.
   */
  public function __construct(FileSystemInterface $file_system, Token $token) {
    $this->fileSystem = $file_system;
    $this->token = $token;
  }

  /**
   * {@inheritDoc}
   */
  public function upload(string $form_field_name, UploadedFile $uploaded_file, Editor $editor, array $file_settings = []) {
    $image_settings = $editor->getImageUploadSettings();

    $image_settings['directory'] = $this->token->replace($file_settings['file_directory'] ?: $image_settings['directory']);
    $image_settings['scheme'] = $file_settings['uri_scheme'] ?: $image_settings['scheme'];
    $image_settings['max_size'] = $file_settings['max_filesize'] ?: $image_settings['max_size'];
    $image_settings['max_dimensions'] = $file_settings['max_resolution'] ?: $image_settings['max_dimensions'];

    $destination = $image_settings['scheme'] . '://' . $image_settings['directory'];

    if (!$this->fileSystem->prepareDirectory($destination, FileSystemInterface::CREATE_DIRECTORY)) {
      return NULL;
    }

    $validators = [];

    if (explode('/', $uploaded_file->getClientMimeType())[0] === 'image') {
      // Validate file type.
      // Image type.
      if (!empty($image_settings['max_dimensions']['width']) || !empty($image_settings['max_dimensions']['height'])) {
        $max_dimensions = $image_settings['max_dimensions']['width'] . 'x' . $image_settings['max_dimensions']['height'];
      }
      else {
        $max_dimensions = 0;
      }
      $max_filesize = min(Bytes::toNumber($image_settings['max_size']), Environment::getUploadMaxSize());

      // @todo Remove when Drupal 10.2 is the minimum requirement.
      if (version_compare(\Drupal::VERSION, '10.2.0', '<')) {
        $validators['file_validate_size'] = [$max_filesize];
        $validators['file_validate_image_resolution'] = [$max_dimensions];
      }
      else {
        $validators['FileSizeLimit'] = ['fileLimit' => $max_filesize];
        $validators['FileImageDimensions'] = ['maxDimensions' => $max_dimensions];
      }
    }

    if (!empty($file_settings['file_extensions'])) {
      // Validate the media file extensions.
      // @todo Remove when Drupal 10.2 is the minimum requirement.
      if (version_compare(\Drupal::VERSION, '10.2.0', '<')) {
        $validators['file_validate_extensions'] = [$file_settings['file_extensions']];
      }
      else {
        $validators['FileExtension'] = ['extensions' => $file_settings['file_extensions']];
      }
    }

    // Upload a temporary file.
    $result = file_save_upload($form_field_name, $validators, $destination);
    if (is_array($result) && $result[0]) {
      /** @var \Drupal\file\Entity\File $file */
      $file = $result[0];
      return $file;
    }

    return NULL;
  }

}
