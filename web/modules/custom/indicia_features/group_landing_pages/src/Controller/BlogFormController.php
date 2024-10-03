<?php

namespace Drupal\group_landing_pages\Controller;

use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\OpenModalDialogCommand;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityFormBuilderInterface;
use Drupal\node\Entity\Node;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * A controller class for the group blog entry form.
 */
class BlogFormController extends ControllerBase {

  /**
   * The entity form builder.
   *
   * @var \Drupal\Core\Entity\EntityFormBuilderInterface
   */
  protected $entityFormBuilder;

  /**
   * The request stack.
   */
  protected RequestStack $requestStack;

  /**
   * Dependency inject services.
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity.form_builder'),
      $container->get('request_stack')
    );
  }

  /**
   * Constructs a BlogFormController object.
   *
   * @param \Drupal\Core\Entity\EntityFormBuilderInterface $entity_form_builder
   *   Form builder service.
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   The request stack service.
   */
  public function __construct(EntityFormBuilderInterface $entity_form_builder, RequestStack $request_stack = NULL) {
    $this->entityFormBuilder = $entity_form_builder;
    $this->requestStack = $request_stack;
  }

  /**
   * Callback for opening the modal form for a blog post.
   */
  public function openModalBlogForm() {
    $response = new AjaxResponse();

    // Get the modal form using the form builder.
    $node = Node::create(['type' => 'group_blog']);
    if (!empty($this->requestStack->getCurrentRequest()->query->get('group_id'))) {
      $node->set('field_group_id', $this->requestStack->getCurrentRequest()->query->get('group_id'));
    }
    $form = $this->entityFormBuilder->getForm($node);

    // Add an AJAX command to open a modal dialog with the form as the content.
    $response->addCommand(new OpenModalDialogCommand('Add a post', $form, ['width' => '800']));

    return $response;
  }

}
