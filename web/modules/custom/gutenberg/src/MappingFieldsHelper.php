<?php

namespace Drupal\gutenberg;

use Drupal\Component\Utility\Html;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\gutenberg\Controller\UtilsController;
use Drupal\gutenberg\Parser\BlockParser;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Handles the mappingFields configuration manipulation.
 *
 * This class contains functions primarily for processing mappingFields
 * configurations.
 */
class MappingFieldsHelper implements ContainerInjectionInterface {

  use StringTranslationTrait;
  use DependencySerializationTrait;

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The Gutenberg logger.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $logger;

  /**
   * EntityTypePresave constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   * @param \Psr\Log\LoggerInterface $logger
   *   The Gutenberg logger.
   */
  public function __construct(ConfigFactoryInterface $config_factory, LoggerInterface $logger) {
    $this->logger = $logger;
    $this->configFactory = $config_factory;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('logger.channel.gutenberg')
    );
  }

  /**
   * Validation callback that checks for empty required fields.
   */
  public function validateMappedFields(array $form, FormStateInterface $form_state) {
    $entity = $form_state->getFormObject()->getEntity();
    $text_fields = UtilsController::getEntityTextFields($entity);
    if (count($text_fields) === 0) {
      return;
    }
    $field_content = $form_state->getValue($text_fields[0])[0]['value'] ?? '';

    $fields = $this->getMappedValuesFromContent($field_content);

    foreach ($fields as $key => $value) {
      try {
        $field_definition = $entity->get($key)->getFieldDefinition();

        // Deal with translatable fields and node translations.
        if ($field_definition->isRequired() && empty($value)) {
          $form_state->setErrorByName($key, $this->t('%label field is required.', ['%label' => $field_definition->getLabel()]));
        }
      }
      // The field/property might not exist.
      catch (\Exception $e) {
        $this->logger->error(
          $this->t('Mapping field failed: @message', ['@message' => $e->getMessage()])
        );
      }
    }
  }

  /**
   * Parses gutenberg markup and returns mapped block values.
   *
   * @param string $field_content
   *   The field content containing Gutenberg markup.
   *
   * @return array
   *   An array of mapped field values keyed by field name.
   */
  public function getMappedValuesFromContent(string $field_content) {
    // Fetch only blocks with mapping fields.
    $block_parser = new BlockParser();
    $blocks = $block_parser->parse($field_content, [
      $this,
      'filterMappingFieldsBlock',
    ]);

    // Let's build the field's array of values.
    $fields = [];
    $filter_formats = filter_formats();

    // For each block match.
    foreach ($blocks as $block) {
      // Get block attributes.
      $attributes = $block['attrs'];
      $innerHTML = $this->getInnerHtmlRecursive($block);
      $content = trim(implode('', $innerHTML));

      foreach ($attributes['mappingFields'] as $mapping_field) {
        if (!isset($mapping_field['field'])) {
          // No field name specified.
          continue;
        }

        $mapping_field_name = $mapping_field['field'];
        if (!isset($fields[$mapping_field_name])) {
          $fields[$mapping_field_name] = [];
        }

        if (isset($mapping_field['attribute'], $attributes[$mapping_field['attribute']])) {
          $value = $attributes[$mapping_field['attribute']];
        }
        else {
          $value = $content;
        }
        // Value doesn't support array yet.
        if ($value && is_array($value)) {
          $value = $value[0];
        }

        if (is_string($value)) {
          // Strip the text if the 'no_strip' and 'text_format' attributes are
          // empty.
          if (empty($mapping_field['no_strip']) && empty($mapping_field['text_format'])) {
            $allowed_tags = $mapping_field['allowed_tags'] ?? '';
            $value = strip_tags($value, $allowed_tags);
          }

          $value = Html::decodeEntities($value);
        }

        if (isset($mapping_field['property'])) {
          if (isset($mapping_field['text_format'])) {
            $text_format = $mapping_field['text_format'];
            /*
             * Allow use of a specific text format if it's valid.
             * FIXME: Not a fan of setting the text format this way, but can't
             *  think of a more elegant solution for it at the moment.
             */
            if (isset($filter_formats[$text_format])) {
              $value = check_markup($value, $text_format);
              $fields[$mapping_field_name]['format'] = $text_format;
            }
          }
          $fields[$mapping_field_name][$mapping_field['property']] = $value;
        }
        else {
          $fields[$mapping_field_name] = $value;
        }
      }
    }
    return $fields;
  }

  /**
   * Set the entity field values based on the mapping field settings.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The Drupal entity to presave.
   */
  public function setFieldMappingValues(EntityInterface $entity) {
    $text_fields = UtilsController::getEntityTextFields($entity);

    if (count($text_fields) === 0) {
      return;
    }

    $field_content = $entity->get($text_fields[0])->getString();

    $original_field_content = '';
    if ($entity->original) {
      $original_field_content = $entity->original->get($text_fields[0])
        ->getString();
    }
    // If content hasn't changed, no need to update fields.
    if ($field_content === $original_field_content) {
      return;
    }

    $fields = $this->getMappedValuesFromContent($field_content);

    foreach ($fields as $key => $value) {
      try {
        $entity->set($key, $value);
      }
      // The field/property might not exist.
      catch (\Exception $e) {
        $this->logger->error(
          $this->t('Mapping field failed: @message', ['@message' => $e->getMessage()])
        );
      }
    }
  }

  /**
   * Get innerHTML for innerBlocks as well.
   *
   * @param array $block
   *   The Gutenberg block definition.
   *
   * @return array
   *   An array of innerHTML values found recursively.
   */
  public function getInnerHtmlRecursive(array $block): array {
    $iterator = new \RecursiveArrayIterator($block);
    $recursive = new \RecursiveIteratorIterator($iterator, \RecursiveIteratorIterator::SELF_FIRST);
    $return = [];
    foreach ($recursive as $key => $value) {
      if ($key === 'innerHTML') {
        $return[] = $value;
      }
    }

    return $return;
  }

  /**
   * Filter Gutenberg blocks to only those with mappingFields attributes.
   *
   * @param array $block
   *   The Gutenberg block definition.
   *
   * @return bool
   *   Whether the block is supported.
   */
  public function filterMappingFieldsBlock(array $block) {
    if (isset($block['attrs']['mappingFields'])) {
      $mapping_fields = $block['attrs']['mappingFields'];
      return $mapping_fields && is_array($mapping_fields);
    }
    return FALSE;
  }

  /**
   * Returns all mapping fields (recursively) on the template.
   *
   * @param array $template
   *   Template to check.
   *
   * @return array
   *   The list of mapping fields.
   */
  public function getMappedFields(?array $template = NULL) {
    $result = [];
    if (empty($template)) {
      return [];
    }

    foreach ($template as $block) {
      if (isset($block[1]) && isset($block[1]->mappingFields)) {
        foreach ($block[1]->mappingFields as $field) {
          $item = [];
          $item['field'] = $field->field;
          if (isset($field->property)) {
            $item['property'] = $field->property;
          }
          if (isset($field->attribute)) {
            $item['attribute'] = $field->attribute;
          }
          $result[] = $item;
        }
      }
      if (isset($block[2])) {
        $result = array_merge($result, $this->getMappedFields($block[2]));
      }
    }

    return $result;
  }

  /**
   * Returns all mapping fields (recursively) from content.
   *
   * @param string $content
   *   Content to check.
   * @param array $blocks
   *   Blocks to check.
   *
   * @return array
   *   The list of mapping fields.
   */
  public function getMappedFieldsFromContent(?string $content = NULL, array $blocks = []) {
    $result = [];
    if (empty($content) && empty($blocks)) {
      return [];
    }

    if (!empty($content)) {
      $block_parser = new BlockParser();
      $blocks = $block_parser->parse($content);
    }

    foreach ($blocks as $block) {
      $mapping_fields = $block['attrs']['mappingFields'] ?? [];

      foreach ($mapping_fields as $field) {
        $item = [];
        $item['field'] = $field['field'];
        if (isset($field['property'])) {
          $item['property'] = $field['property'];
        }
        if (isset($field['attribute'])) {
          $item['attribute'] = $field['attribute'];
        }
        $result[] = $item;
      }
      if (isset($block['innerBlocks']) && !empty($block['innerBlocks'])) {
        $result = array_merge($result, $this->getMappedFieldsFromContent(NULL, $block['innerBlocks']));
      }
    }

    return $result;
  }

}
