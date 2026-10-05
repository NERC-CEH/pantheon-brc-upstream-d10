<?php

namespace Drupal\gutenberg;

use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\user\UserInterface;

/**
 * Resolves the avatar URL for a user.
 *
 * Reads the user's image field (default: user_picture) and returns its
 * absolute URL. Falls back to Gravatar if the field is empty. Sites can
 * customize the source field or the final URL via two hooks:
 *
 * @see hook_gutenberg_user_avatar_field_alter()
 * @see hook_gutenberg_user_avatar_url_alter()
 */
class UserAvatarResolver {

  /**
   * Default user image field machine name.
   */
  protected const DEFAULT_FIELD = 'user_picture';

  public function __construct(
    protected FileUrlGeneratorInterface $fileUrlGenerator,
    protected ModuleHandlerInterface $moduleHandler,
  ) {}

  /**
   * Returns an absolute avatar URL for the given user.
   *
   * @param \Drupal\user\UserInterface $user
   *   The user entity.
   * @param int $size
   *   The desired pixel size (used in the Gravatar fallback).
   *
   * @return string
   *   Absolute URL to the user's avatar image. Always non-empty.
   */
  public function getAvatarUrl(UserInterface $user, int $size = 48): string {
    $field_name = static::DEFAULT_FIELD;
    // Allow modules to choose a different image field.
    $this->moduleHandler->alter('gutenberg_user_avatar_field', $field_name, $user);

    $url = '';
    if ($field_name && $user->hasField($field_name) && !$user->get($field_name)->isEmpty()) {
      $file = $user->get($field_name)->entity;
      if ($file) {
        $url = $this->fileUrlGenerator->generateAbsoluteString($file->getFileUri());
      }
    }

    if (!$url) {
      // Gravatar fallback. The 'mp' default returns a generic silhouette
      // when no Gravatar exists for the email.
      $hash = md5(strtolower(trim((string) $user->getEmail())));
      $url = "https://www.gravatar.com/avatar/{$hash}?s={$size}&d=mp";
    }

    // Allow modules to replace the resolved URL (e.g., for a CDN or a
    // generated avatar service).
    $this->moduleHandler->alter('gutenberg_user_avatar_url', $url, $user, $size);

    return $url;
  }

}
