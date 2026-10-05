<?php

namespace Drupal\gutenberg\Controller;

use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\HtmlCommand;
use Drupal\Core\Block\BlockManagerInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Render\Renderer;
use Drupal\gutenberg\BlocksRendererHelper;
use Drupal\gutenberg\GutenbergContentBlocksManager;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Plugin\Context\ContextRepositoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Theme\ThemeInitializationInterface;
use Drupal\Core\Theme\ThemeManagerInterface;

/**
 * Returns responses for our blocks routes.
 */
class BlocksController extends ControllerBase {

  /**
   * Drupal\Core\Block\BlockManagerInterface instance.
   *
   * @var \Drupal\Core\Block\BlockManagerInterface
   */
  protected $blockManager;

  /**
   * Drupal\Core\Config\ConfigFactoryInterface instance.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * Drupal\Core\Render\Renderer instance.
   *
   * @var \Drupal\Core\Render\Renderer
   */
  protected $renderer;

  /**
   * Drupal\gutenberg\BlocksRendererHelper instance.
   *
   * @var \Drupal\gutenberg\BlocksRendererHelper
   */
  protected $blocksRenderer;

  /**
   * Drupal\Core\Plugin\Context\ContextRepositoryInterface.
   *
   * @var \Drupal\Core\Plugin\Context\ContextRepositoryInterface
   */
  protected $contextRepository;

  /**
   * Drupal\Core\Entity\EntityTypeManagerInterface.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The GutenbergContentBlocksManager service.
   *
   * @var \Drupal\gutenberg\GutenbergContentBlocksManager
   */
  protected $contentBlocksManager;

  /**
   * The theme manager.
   *
   * @var \Drupal\Core\Theme\ThemeManagerInterface
   */
  protected $themeManager;

  /**
   * The theme initialization.
   *
   * @var \Drupal\Core\Theme\ThemeInitializationInterface
   */
  protected $themeInitialization;

  /**
   * BlocksController constructor.
   *
   * @param \Drupal\Core\Block\BlockManagerInterface $block_manager
   *   Block manager service.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   Config factory service.
   * @param \Drupal\Core\Render\Renderer $renderer
   *   Render service.
   * @param \Drupal\gutenberg\BlocksRendererHelper $blocks_renderer
   *   Blocks renderer helper service.
   * @param \Drupal\Core\Plugin\Context\ContextRepositoryInterface $context_repository
   *   Context repository service.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   Entity type manager service.
   * @param \Drupal\Core\Theme\ThemeManagerInterface $theme_manager
   *   The theme manager service.
   * @param \Drupal\Core\Theme\ThemeInitializationInterface $theme_initialization
   *   The theme initialization service.
   * @param \Drupal\gutenberg\GutenbergContentBlocksManager $gutenberg_content_blocks_manager
   *   GutenbergContentBlocksManager service.
   */
  public function __construct(
    BlockManagerInterface $block_manager,
    ConfigFactoryInterface $config_factory,
    Renderer $renderer,
    BlocksRendererHelper $blocks_renderer,
    ContextRepositoryInterface $context_repository,
    EntityTypeManagerInterface $entity_type_manager,
    ThemeManagerInterface $theme_manager,
    ThemeInitializationInterface $theme_initialization,
    GutenbergContentBlocksManager $gutenberg_content_blocks_manager,
  ) {
    $this->blockManager = $block_manager;
    $this->configFactory = $config_factory;
    $this->renderer = $renderer;
    $this->blocksRenderer = $blocks_renderer;
    $this->contextRepository = $context_repository;
    $this->entityTypeManager = $entity_type_manager;
    $this->themeManager = $theme_manager;
    $this->themeInitialization = $theme_initialization;
    $this->contentBlocksManager = $gutenberg_content_blocks_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new static(
      $container->get('plugin.manager.block'),
      $container->get('config.factory'),
      $container->get('renderer'),
      $container->get('gutenberg.blocks_renderer'),
      $container->get('context.repository'),
      $container->get('entity_type.manager'),
      $container->get('theme.manager'),
      $container->get('theme.initialization'),
      $container->get('gutenberg.content_blocks_manager')
    );
  }

  /**
   * Returns JSON representing the loaded blocks.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request.
   * @param string $content_type
   *   The content type to fetch settings from.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   */
  public function loadByType(Request $request, $content_type) {
    $config = $this->configFactory->getEditable('gutenberg.settings');
    $config_values = $config->get($content_type . '_allowed_drupal_blocks');

    // Get blocks definition.
    $definitions = $this->blockManager->getDefinitionsForContexts($this->contextRepository->getAvailableContexts());
    $definitions = $this->blockManager->getSortedDefinitions($definitions);
    $groups = $this->blockManager->getGroupedDefinitions($definitions);
    foreach ($groups as $key => $blocks) {
      $group_reference = preg_replace('@[^a-z0-9-]+@', '_', strtolower($key));
      $groups['drupalblock/all_' . $group_reference] = $blocks;
      unset($groups[$key]);
    }

    $return = [];
    foreach ($config_values as $key => $value) {
      if ($value) {
        if (preg_match('/^drupalblock\/all/', $value)) {
          // Getting all blocks from group.
          foreach ($groups[$value] as $key_block => $definition) {
            $return[$key_block] = $definition;
          }
        }
        elseif (empty($definitions[$value])) {
          $return[$value] = NULL;
        }
        else {
          $return[$value] = $definitions[$value];
        }
      }
    }

    return new JsonResponse($return);
  }

  /**
   * Returns JSON representing the loaded blocks.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request.
   * @param string $plugin_id
   *   Plugin ID.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   */
  public function loadById(Request $request, $plugin_id) {
    $request_content = $request->getContent();

    $config = [];
    if (!empty($request_content)) {
      $config = json_decode($request_content, TRUE);
    }

    $plugin_block = $this->blocksRenderer->getBlockFromPluginId($plugin_id, $config);

    $content = '';

    if ($plugin_block) {
      $access_result = $this->blocksRenderer->getBlockAccess($plugin_block);
      if ($access_result->isForbidden()) {
        // You might need to add some cache tags/contexts.
        return new JsonResponse([
          'access' => FALSE,
          'html' => $this->t('Unable to render block. Check block settings or permissions.'),
        ]);
      }

      $content = $this->blocksRenderer->getRenderFromBlockPlugin($plugin_block);
    }

    // If the block is a view with contexts defined, it may
    // not render on the editor because of, for example, the
    // node path. Let's just write some warning if no content.
    if ($content === '') {
      $content = $this->t('Unable to render the content possibly due to path restrictions.');
    }

    return new JsonResponse(['access' => TRUE, 'html' => $content]);
  }

  /**
   * Load content block types and returns a JSON response.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request.
   * @param string $content_type
   *   The content type to fetch settings from.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   */
  public function loadContentBlockTypes(Request $request, $content_type) {
    $config = $this->configFactory->getEditable('gutenberg.settings');
    $config_values = $config->get($content_type . '_allowed_content_block_types') ?? [];
    $content_block_types = $this->entityTypeManager->getStorage('block_content_type')->loadMultiple();
    $content_block_types = array_filter($content_block_types, function ($content_block_type) use ($config_values) {
      return $content_block_type->id() !== 'reusable_block'
        && in_array('content-block/' . $content_block_type->id(), $config_values);
    });

    $content_block_types = array_map(function ($content_block_type) {
      return [
        'id' => $content_block_type->id(),
        'label' => $content_block_type->label(),
        'description' => $content_block_type->getDescription(),
      ];
    }, $content_block_types);

    return new JsonResponse($content_block_types);
  }

  /**
   * Load content block by id and returns a JSON response.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request.
   * @param string $content_block_id
   *   The content block id.
   * @param string $view_mode
   *   The view mode.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   */
  public function renderContentBlock(Request $request, $content_block_id, $view_mode = 'default') {
    $content_block = $this->entityTypeManager->getStorage('block_content')->load($content_block_id);

    $selector = '#content_block-' . $content_block_id . '-' . $view_mode;
    $response = new AjaxResponse();

    if (!$content_block) {
      $build = [
        '#theme' => 'status_messages',
        '#message_list' => [
          'warning' => [
            $this->t('Unable to render block. Check block settings or permissions.'),
          ],
        ],
        '#status_headings' => [
          'error' => $this->t('Warning Message'),
        ],
      ];
      $response->addCommand(new HtmlCommand($selector, $build));
      return $response;
    }

    $render = $this
      ->entityTypeManager
      ->getViewBuilder('block_content')
      ->view($content_block, $view_mode);

    $build = [
      '#theme' => 'block',
      '#attributes' => [],
      '#contextual_links' => [],
      '#configuration' => [
        'provider' => 'gutenberg',
        'view_mode' => $view_mode,
      ],
      '#plugin_id' => 'content_block:' . $content_block->bundle(),
      '#base_plugin_id' => 'content_block',
      '#derivative_plugin_id' => $content_block->bundle(),
      'content' => $render,
    ];

    // Render the block content using the frontend theme if it's not the active
    // theme. We can't use a theme negotiator here because this is an AJAX
    // request and if we change the active theme with the negotiator, it will be
    // sent back in the response and changed on the editor page resulting in
    // future ajax requests to be rendered with the wrong theme.
    $active_theme = $this->themeManager->getActiveTheme()->getName();
    $default_theme = $this->configFactory->get('system.theme')->get('default');
    if ($default_theme !== $active_theme) {
      $this->themeManager->setActiveTheme($this->themeInitialization->initTheme($default_theme));
      $build = $this->renderer->render($build);
      $this->themeManager->setActiveTheme($this->themeInitialization->initTheme($active_theme));
    }

    $response->addCommand(new HtmlCommand($selector, $build));
    return $response;

  }

  /**
   * Checks a content block's usage and clones it if already used.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request body contains the following json data:
   *
   *    isDuplicate: Boolean, True if we already detected this is a duplicate
   *                 on the client side and know it needs to be cloned.
   *                 False means we need to check.
   *    contentBlockId: Integer, the original contentBlockId we are checking.
   *    entityId: Integer, The node id or null if it is a new node.
   *    entityType: String, this is always 'node' for now.
   *    entityBundle: String, The node type/bundle the block id being used in.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   */
  public function cloneIfUsed(Request $request) {

    // Get the $request POST data.
    $request_content = $request->getContent();
    $data = [];
    if (!empty($request_content)) {
      $data = json_decode($request_content, TRUE);
    }

    if ($data['isDuplicate']) {
      // 'isDuplicate' means we already know this is a duplicate, so clone it.
      $cloned_block = $this->contentBlocksManager->cloneBlock($data['contentBlockId'], $data['entityId'], $data['entityType'], $data['entityBundle']);
      // Return the cloned blocks id or 0 if it wasn't cloned.
      $cloned_block_id = $cloned_block ? $cloned_block->id() : 0;
      return new JsonResponse(['id' => $cloned_block_id]);
    }
    else {

      $usage = $this->contentBlocksManager->getBlockUsage($data['contentBlockId']);

      if ($usage && $usage['entity_id'] != $data['entityId']) {
        $cloned_block = $this->contentBlocksManager->cloneBlock($data['contentBlockId'], $data['entityId'], $data['entityType'], $data['entityBundle']);
        // Return the cloned blocks id or 0 if it wasn't cloned.
        $cloned_block_id = $cloned_block ? $cloned_block->id() : 0;
        return new JsonResponse(['id' => $cloned_block_id]);
      }

    }

    // We have no usage record yet, so it's ok to use if it exists.
    if ($content_block = $this->entityTypeManager->getStorage('block_content')->load($data['contentBlockId'])) {
      return new JsonResponse(['id' => $content_block->id()]);
    }

    // If all else fails, return 0 and force the user to create a new block.
    return new JsonResponse(['id' => 0]);

  }

}
