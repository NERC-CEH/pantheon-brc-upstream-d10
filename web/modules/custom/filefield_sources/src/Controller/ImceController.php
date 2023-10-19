<?php

namespace Drupal\filefield_sources\Controller;

use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Controller\ControllerBase;
use Drupal\imce\Imce;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Drupal\Core\Render\BubbleableMetadata;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Controller routines for imce routes.
 */
class ImceController extends ControllerBase {
  /**
   * @var Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  public static function create(ContainerInterface $container) {
    $instance = new static();
    $instance->entityTypeManager = $container->get('entity_type.manager');
    // $instance->connection = $container->get('');
    return $instance;
  }

  /**
   * Outputs the IMCE browser for FileField.
   */
  public function page($entity_type, $bundle_name, $field_name, Request $request) {
    // Check access.
    if (!\Drupal::moduleHandler()->moduleExists('imce') || !Imce::access() || !$instance = $this->entityTypeManager->getStorage('field_config')->load($entity_type . '.' . $bundle_name . '.' . $field_name)) {
      throw new AccessDeniedHttpException();
    }

    $settings = $instance->getSettings();
    $imceFM = Imce::userFM(\Drupal::currentUser(), $settings['uri_scheme'], $request);

    // Override scanner.
    if (!empty($imceFM)) {
      $scanner = \Drupal::service('filefield_sources.imce_scanner');
      $widget = $this->entityTypeManager->getStorage('entity_form_display')->load($entity_type . '.' . $bundle_name . '.' . 'default');
      // Full mode.
      if (!empty($widget['third_party_settings']['filefield_sources']['filefield_sources']['source_imce']['imce_mode'])) {
        $imceFM->setConf('scanner', [$scanner, 'customScanFull']);
        // Set context.
        $scanner->setContext([
          'scheme' => $imceFM->getConf('scheme'),
        ]);
      }
      // Restricted mode.
      else {
        $imceFM->setConf('scanner', [$scanner, 'customScanRestricted']);

        // Make field directory the only accessible one.
        $field_uri = static::getUploadLocation($settings);
        static::disablePerms($imceFM, $field_uri, ['browse_files']);

        // Set context.
        $scanner->setContext([
          'entity_type' => $entity_type,
          'field_name' => $field_name,
          'uri' => $field_uri,
          'is_rool' => $is_root,
        ]);
      }

      // Disable absolute URLs.
      \Drupal::configFactory()->getEditable('imce.settings')->set('abs_urls', FALSE);

      return $imceFM->pageResponse();
    }
  }

  /**
   * Determines the URI for a file field.
   *
   * @param array $data
   *   An array of token objects to pass to token_replace().
   *
   * @return string
   *   A file directory URI with tokens replaced.
   *
   * @see token_replace()
   */
  protected static function getUploadLocation($settings, $data = []) {
    $destination = trim($settings['file_directory'], '/');

    // Replace tokens. To ensure that render context is empty, pass a bubbleable
    // metadata object to the replace method.
    $bubbleable_metadata = new BubbleableMetadata();
    $destination = \Drupal::token()->replace($destination, $data, [], $bubbleable_metadata);

    return $settings['uri_scheme'] . '://' . $destination;
  }

  /**
   * Disable IMCE profile permissions.
   */
  protected static function disablePerms($imceFM, $field_uri, $exceptions = []) {
    $scheme = $imceFM->getConf('scheme');
    $root = $scheme . '://';
    $is_root = $field_uri == $root;
    $path = $is_root ? '.' : substr($field_uri, strlen($root));

    $folders = $imceFM->getConf('folders');
    $perms = \Drupal::service('plugin.manager.imce.plugin')->permissionInfo();
    $folders['.']['permissions']['all'] = FALSE;
    $folders[$path]['permissions']['all'] = FALSE;
    foreach ($perms as $perm => $title) {
      $folders['.']['permissions'][$perm] = FALSE;
      $folders[$path]['permissions'][$perm] = in_array($perm, ['browse_files']) ? TRUE : FALSE;
    }
    $imceFM->setConf('folders', $folders);
  }

}
