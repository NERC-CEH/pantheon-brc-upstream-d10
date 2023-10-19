<?php

namespace Drupal\bibcite_authors\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\bibcite_entity\Entity\Contributor;

/**
 * Plugin implementation of the 'Authors (Last name first)' formatter.
 *
 * @FieldFormatter(
 *   id = "bibcite_authors_last_name_first",
 *   label = @Translation("Authors (Last name first)"),
 *   field_types = {
 *     "bibcite_contributor"
 *   }
 * )
 */
class LastNameFirst extends FormatterBase {


  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $element = [];

    foreach ($items as $delta => $item) {
      $author_id = $item->target_id;
      $author = Contributor::load($author_id);
      if (!empty($author)) {
        $element[$delta] = [
          '#markup' => $author->last_name->getString() . ', ' . $author->first_name->getString() . " " . $author->middle_name->getString(),
        ];
      };
    }

    return $element;
  }
}
