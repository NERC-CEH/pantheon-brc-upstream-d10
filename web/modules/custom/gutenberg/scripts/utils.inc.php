<?php
/**
 * Gets the Drupal root directory.
 *
 * @return string
 *   The root directory.
 */
function get_drupal_root_directory() {
  $dirs = explode(DIRECTORY_SEPARATOR, __DIR__);

  $root_dir = [];
  foreach ($dirs as $key => $value) {
    if ($value === 'modules') {
      return implode(DIRECTORY_SEPARATOR, $root_dir);
    }
    $root_dir[] = $value;
  }

  // Standalone checkout: use DRUPAL_ROOT or one of the local DDEV sites.
  $candidates = array_merge(
    getenv('DRUPAL_ROOT') ? [getenv('DRUPAL_ROOT')] : [],
    glob(dirname(__DIR__) . '/.sites/*/web') ?: []
  );
  foreach ($candidates as $candidate) {
    if (file_exists($candidate . '/autoload.php')) {
      return $candidate;
    }
  }
  throw new \RuntimeException('Could not find the Drupal root. Set DRUPAL_ROOT or run "ddev start".');
}
