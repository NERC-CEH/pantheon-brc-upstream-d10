<?php

namespace Drupal\gutenberg\Form;

use Drupal\Component\Utility\Html;
use Drupal\Core\Form\BaseFormIdInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\SettingsCommand;
use Drupal\Core\Ajax\ReplaceCommand;
use Drupal\gutenberg\GutenbergContentBlocksManager;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\block_content\Entity\BlockContent;
use Drupal\Component\Utility\NestedArray;
use Drupal\Core\Entity\Entity\EntityFormDisplay;
use Drupal\Core\Entity\EntityDisplayRepositoryInterface;
use Drupal\Core\Form\SubformStateInterface;
use Drupal\Core\Session\AccountInterface;

/**
 * Provides a form to update a block.
 *
 * @internal
 *   Form classes are internal.
 */
class ContentBlockSettingsForm extends FormBase implements BaseFormIdInterface {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The entity display repository.
   *
   * @var \Drupal\Core\Entity\EntityDisplayRepositoryInterface
   */
  protected $entityDisplayRepository;

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $currentUser;

  /**
   * The content block manager.
   *
   * @var \Drupal\gutenberg\GutenbergContentBlocksManager
   */
  protected $contentBlocksManager;

  /**
   * Constructs a new block form.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\Core\Entity\EntityDisplayRepositoryInterface $entity_display_repository
   *   The block manager.
   * @param \Drupal\Core\Session\AccountInterface $current_user
   *   Blocks renderer helper service.
   * @param \Drupal\gutenberg\GutenbergContentBlocksManager $content_blocks_manager
   *   Gutenberg Content Blocks Manager.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager, EntityDisplayRepositoryInterface $entity_display_repository, AccountInterface $current_user, GutenbergContentBlocksManager $content_blocks_manager) {
    $this->entityTypeManager = $entity_type_manager;
    $this->entityDisplayRepository = $entity_display_repository;
    $this->currentUser = $current_user;
    $this->contentBlocksManager = $content_blocks_manager;
  }

  /**
   * {@inheritdoc}
   */
  public function getBaseFormId() {
    return 'gutenberg_content_block_type_settings';
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'gutenberg_content_block_type_settings';
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity_type.manager'),
      $container->get('entity_display.repository'),
      $container->get('current_user'),
      $container->get('gutenberg.content_blocks_manager')
    );
  }

  /**
   * Process callback to insert a Content Block form.
   *
   * @param array $element
   *   The containing element.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   *
   * @return array
   *   The containing element, with the Content Block form inserted.
   */
  public static function processBlockForm(array $element, FormStateInterface $form_state) {
    /** @var \Drupal\block_content\BlockContentInterface $block */
    $block = $element['#block'];
    EntityFormDisplay::collectRenderDisplay($block, 'edit')->buildForm($block, $element, $form_state);

    if (isset($element['revision_log'])) {
      $element['revision_log']['#access'] = FALSE;
    }

    if (isset($element['info'])) {
      $element['info']['#access'] = FALSE;
    }

    return $element;
  }

  /**
   * After build callback for the block form.
   */
  public static function afterBuildBlockForm(array $element, FormStateInterface $form_state) {
    return $element;
  }

  /**
   * Builds the block form.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   * @param string $type
   *   The content block type.
   * @param string $block_id
   *   The block ID.
   * @param string $entity_type
   *   The entity type.
   * @param int|null $entity_id
   *   The entity ID.
   * @param string|null $entity_bundle
   *   The entity bundle.
   * @param array $config
   *   The block configuration.
   *
   * @return array
   *   The form array.
   */
  public function buildForm(array $form, FormStateInterface $form_state, $type = NULL, $block_id = NULL, $entity_type = 'node', $entity_id = NULL, $entity_bundle = NULL, $config = []) {
    $form_state->set('block_theme', $this->config('system.theme')
      ->get('default'));
    $form['#gutenberg_entity'] = [
      'entity_type' => $entity_type,
      'entity_id' => is_numeric($entity_id) ? $entity_id : NULL,
      'entity_bundle' => $entity_bundle,
    ];

    $form['#prefix'] = '<div id="content-block-form-wrapper">';
    $form['#suffix'] = '</div>';

    if ($this->currentUser->hasPermission('create and edit custom gutenberg content blocks')) {

      if ($block_id && is_numeric($block_id)) {
        $block = BlockContent::load($block_id);
      }

      // No block found, create a new one.
      if (empty($block)) {
        $block = BlockContent::create([
          'type' => $type,
          'info' => $this->t('New @type block', ['@type' => $type]),
        ]);
      }

      $form['block_form'] = [
        '#type' => 'container',
        '#process' => [[static::class, 'processBlockForm']],
        '#after_build' => [[static::class, 'afterBuildBlockForm']],
        '#block' => $block,
      ];

      // Set form validation and submission handlers.
      $form['#validate'][] = '::blockValidate';
      $form['#submit'][] = '::submitForm';
      $form['#attached']['library'][] = 'gutenberg/drupal-content-block-utils';

      $form['actions'] = [
        '#type' => 'container',
        '#attributes' => [
          'class' => ['form-actions', 'js-form-wrapper', 'form-wrapper'],
        ],
      ];
      $form['actions']['submit'] = [
        '#type' => 'submit',
        '#value' => $this->submitLabel(),
        '#button_type' => 'primary',
        '#ajax' => [
          'callback' => '::ajaxSubmit',
          'wrapper' => 'content-block-form-wrapper',
        ],
      ];

      // @todo static::ajaxSubmit() requires data-drupal-selector to be the same
      //   between the various Ajax requests. A bug in
      //   \Drupal\Core\Form\FormBuilder prevents that from happening unless
      //   $form['#id'] is also the same. Normally, #id is set to a unique HTML
      //   ID via Html::getUniqueId(), but here we bypass that in order to work
      //   around the data-drupal-selector bug. This is okay so long as we
      //   assume that this form only ever occurs once on a page. Remove this
      //   workaround in https://www.drupal.org/node/2897377.
      $form['#id'] = Html::getId($form_state->getBuildInfo()['form_id']);
    }
    else {
      // Show a warning for users without permission.
      $form['warning'] = [
        '#theme' => 'status_messages',
        '#message_list' => [
          'warning' => [
            $this->t('You do not have sufficient permissions to edit this block.'),
          ],
        ],
      ];
    }

    return $form;
  }

  /**
   * Flattens arrays.
   */
  protected function arrayFlatten($array = NULL) {
    $result = [];

    if (!is_array($array)) {
      $array = func_get_args();
    }

    foreach ($array as $key => $value) {
      if (is_array($value)) {
        $result = array_merge($result, $this->arrayFlatten($value));
      }
      else {
        $result = array_merge($result, [$key => $value]);
      }
    }

    return $result;
  }

  /**
   * {@inheritdoc}
   */
  protected function submitLabel() {
    return $this->t('Update Block');
  }

  /**
   * {@inheritdoc}
   */
  public function blockValidate($form, FormStateInterface $form_state) {
    $block_form = $form['block_form'];
    /** @var \Drupal\block_content\BlockContentInterface $block */
    $block = $block_form['#block'];
    $form_display = EntityFormDisplay::collectRenderDisplay($block, 'edit');
    $complete_form_state = $form_state instanceof SubformStateInterface ? $form_state->getCompleteFormState() : $form_state;
    $form_display->extractFormValues($block, $block_form, $complete_form_state);
    $form_display->validateFormValues($block, $block_form, $complete_form_state);
    // @todo Remove when https://www.drupal.org/project/drupal/issues/2948549 is closed.
    $form_state->setTemporaryValue('block_form_parents', $block_form['#parents']);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    // @todo Remove when https://www.drupal.org/project/drupal/issues/2948549 is closed.
    $block_form = NestedArray::getValue($form, $form_state->getTemporaryValue('block_form_parents'));
    /** @var \Drupal\block_content\BlockContentInterface $block */
    $block = $block_form['#block'];
    $form_display = EntityFormDisplay::collectRenderDisplay($block, 'edit');
    $complete_form_state = $form_state instanceof SubformStateInterface ? $form_state->getCompleteFormState() : $form_state;
    $form_display->extractFormValues($block, $block_form, $complete_form_state);

    $block->setNonReusable();
    $block->save();

    $this->contentBlocksManager->setBlockUsage($block->id(), [
      'entity_id' => $form['#gutenberg_entity']['entity_id'],
      'entity_type' => $form['#gutenberg_entity']['entity_type'],
      'entity_bundle' => $form['#gutenberg_entity']['entity_bundle'],
    // Active 0 because the gutenberg entity hasn't been saved yet.
      'active' => 0,
    ]);

    $block_form['#block'] = $block;
    $form['#block'] = $block;
    $form_state->setRebuild(TRUE);
    $form_state->setTemporaryValue('block_id', $block->id());
    return $form;
  }

  /**
   * Ajax submit handler for the content block form.
   */
  public function ajaxSubmit(array &$form, FormStateInterface $form_state) {
    $response = new AjaxResponse();
    $response->addCommand(new ReplaceCommand(NULL, $form));
    $response->addCommand(new SettingsCommand(['contentBlockId' => $form_state->getTemporaryValue('block_id')], TRUE));
    return $response;
  }

}
