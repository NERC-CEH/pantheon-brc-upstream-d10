<?php

namespace Drupal\content_entity_builder\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Link;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Render\RendererInterface;
use Symfony\Component\HttpFoundation\Request;
use Drupal\content_entity_builder\ContentTypeInterface;
use Drupal\content_entity_builder\ContentTypeBundleInterface;

/**
 * Class QuizController.
 *
 * @package Drupal\iquiz\Controller
 */
class ContentEntityBuilderController extends ControllerBase implements ContainerInjectionInterface {

  /**
   * The renderer service.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * @param \Drupal\Core\Render\RendererInterface $renderer
   */
  public function __construct(RendererInterface $renderer) {
    $this->renderer = $renderer;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('renderer')
    );
  }

  public function editContentType(Request $request, $content_type) {
    $content_type_entity = $this->entityTypeManager()->getStorage('content_type')->load($content_type);
    $form = $this->entityFormBuilder()->getForm($content_type_entity, 'edit');
    return $form;
  }
  
  /**
   * Displays add content links for available bundle types.
   *
   * Redirects to [entity]/add/[type] if only one bundle type is available.
   *
   * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
   *   A render array for a list of the bundle types that can be added.
   */
  public function addPage(Request $request, $content_type) {
    //$definition = $this->entityTypeManager()->getDefinition('node_type');
    $build = [
      '#theme' => 'entity_add_list',
      '#cache' => [
        'tags' => $this->entityTypeManager()->getDefinition($content_type . '_type')->getListCacheTags(),
      ],
    ];

    $bundles = [];
	
	$content_type_entity = $this->entityTypeManager()->getStorage('content_type')->load($content_type);

    $types = $this->entityTypeManager()->getStorage($content_type . '_type')->loadMultiple();
    //uasort($types, [$definition->getClass(), 'sort']);
    // Only use node types the user has access to.
    foreach ($types as $type) {
      //$access = $this->entityTypeManager()->getAccessControlHandler($content_type)->createAccess($type->id(), NULL, [], TRUE);
      //if ($access->isAllowed()) {
        $bundles[$type->id()] = [
		  'add_link' =>  Link::fromTextAndUrl($type->label(), Url::fromRoute('entity.' . $content_type . '.add', ['content_type' => $content_type, 'entity_bundle' => $type->id()]))->toString(),
		  //'add_link' =>  Link::fromTextAndUrl($type->label(), '/drupal10/movie/add'),
		  'label' => $type->label(),
		  'description' => $type->getDescription(),
		];
      //}
      //$this->renderer->addCacheableDependency($build, $access);
    }

    // Bypass the [entity]/add listing if only one bundle type is available.
    //if (count($content) == 1) {
    //  $type = array_shift($content);
    //  return $this->redirect('node.add', ['node_type' => $type->id()]);
    //}

    $build['#bundles'] = $bundles;

    return $build;
  } 

  /**
   * The _title_callback for the entity.add_page route.
   *
   * @param \Drupal\content_entity_builder\ContentTypeInterface $node_type
   *   The current content entity type.
   *
   * @return string
   *   The page title.
   */
  public function addPageTitle($content_type) {
    $content_type_entity = $this->entityTypeManager()->getStorage('content_type')->load($content_type);
    return $this->t('Create @name', ['@name' => $content_type_entity->label()]);
  }
  
  /**
   * Provides the content entity form.
   *
   * @param $content_type
   *   The content entity type.
   * @param string $content_entity_type
   *   The  content entity bundle.
   *
   * @return array
   *   The entity form.
   */
  public function addEntityPage( $content_type, $entity_bundle) {
    $entity = $this->entityTypeManager()->getStorage($content_type)->create(['type' => $entity_bundle]);
    return $this->entityFormBuilder()->getForm($entity);
  } 
  
  /**
   * The _title_callback for the entity.add route.
   *
   * @param $content_type
   *   The current content entity type.
   *
   * @param $content_entity_bundle
   *   The current content entity bundle.   
   *
   * @return string
   *   The page title.
   */
  public function addEntityPageTitle( $content_type, $entity_bundle) {
    $bundle_entity = $this->entityTypeManager()->getStorage($content_type . '_type')->load($entity_bundle);
    return $this->t('Create @name', ['@name' => $bundle_entity->label()]);
  }
}
