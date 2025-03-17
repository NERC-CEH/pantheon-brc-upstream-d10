<?php

namespace Drupal\content_entity_builder\Plugin\Derivative;

use Drupal\Component\Plugin\Derivative\DeriverBase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\Discovery\ContainerDeriverInterface;
use Drupal\Core\Routing\RouteProviderInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides local action definitions for all content entity list.
 */
class ContentEntityBuilderLocalAction extends DeriverBase implements ContainerDeriverInterface {

  use StringTranslationTrait;

  /**
   * The entity manager
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityManager;

  /**
   * The route provider.
   *
   * @var \Drupal\Core\Routing\RouteProviderInterface
   */
  protected $routeProvider;

  /**
   * Constructs a ContentEntityBuilderLocalAction object.
   *
   * @param \Drupal\Core\Routing\RouteProviderInterface $route_provider
   *   The route provider to load routes by name.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_manager
   *   The entity manager.
   */
  public function __construct(RouteProviderInterface $route_provider, EntityTypeManagerInterface $entity_manager) {
    $this->routeProvider = $route_provider;
    $this->entityManager = $entity_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, $base_plugin_id) {
    return new static(
      $container->get('router.route_provider'),
      $container->get('entity_type.manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getDerivativeDefinitions($base_plugin_definition) {
    $this->derivatives = [];

    $content_types = $this->entityManager->getStorage('content_type')->loadMultiple();
    foreach ($content_types as $content_type_id => $content_type) {
      $mode = $content_type->getMode() ?? "basic";
      if($mode === "basic"){		
        $this->derivatives["entity.$content_type_id.add_form"] = [
          'route_name' => "entity.$content_type_id.add_form",
          'title' => $this->t('Add content'),
          'appears_on' => ["entity.$content_type_id.collection"],
        ];
      }else{
        $this->derivatives["entity.$content_type_id.add_page"] = [
          'route_name' => "entity.$content_type_id.add_page",
          'title' => $this->t('Add content'),
          'appears_on' => ["entity.$content_type_id.collection"],
        ];

        $this->derivatives["entity.{$content_type_id}_type.add_form"] = [
          'route_name' => "entity.{$content_type_id}_type.add_form",
          'title' => $this->t('Add bundle'),
          'appears_on' => ["entity.{$content_type_id}_type.collection"],
        ];
      }

    }

    foreach ($this->derivatives as &$entry) {
      $entry += $base_plugin_definition;
    }

    return $this->derivatives;
  }

}
