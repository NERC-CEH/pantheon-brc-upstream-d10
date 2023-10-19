<?php

namespace Drupal\bibcite_authors\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\bibcite_entity\Entity\Contributor;
use Drupal\user\Entity\User;

/**
 * Plugin implementation of the 'Authors (with link to user)' formatter.
 *
 * @FieldFormatter(
 *   id = "bibcite_authors_authors_with_link_to_user",
 *   label = @Translation("Authors (with link to user)"),
 *   field_types = {
 *     "bibcite_contributor"
 *   }
 * )
 */
class AuthorsWithLinkToUserFormatter extends FormatterBase {


  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $element = [];

    foreach ($items as $delta => $item) {
      $author_id = $item->target_id;
      $user = \Drupal::entityQuery('user')
      ->condition('field_author', $author_id)
      ->execute();
      if (empty($user)) {
        $author = Contributor::load($author_id);
        if (!empty($author)) {
          $element[$delta] = [
            '#markup' => '<p>' . $author->first_name->getString() . " " . $author->last_name->getString() . '</p>',
          ];
        };
      } else {
        $author = User::load(key($user));
        $element[$delta] = [
          '#markup' => '<a href="/user/' . $author->id() . '">' . $author->field_name->getString() . "</a>",
        ];
      }
    }

    return $element;
  }

}
