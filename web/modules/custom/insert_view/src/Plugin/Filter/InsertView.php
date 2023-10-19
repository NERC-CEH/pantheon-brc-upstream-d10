<?php

namespace Drupal\insert_view\Plugin\Filter;

use Drupal\filter\FilterProcessResult;
use Drupal\filter\Plugin\FilterBase;
use Drupal\views\Views;
use Drupal\Core\Security\TrustedCallbackInterface;

/**
 * Provides a filter for insert view.
 *
 * @Filter(
 *   id = "insert_view",
 *   module = "insert_view",
 *   title = @Translation("Insert View"),
 *   description = @Translation("Allows to embed views using the simple syntax: [view:name=display=args=limit:number]"),
 *   type = Drupal\filter\Plugin\FilterInterface::TYPE_TRANSFORM_IRREVERSIBLE,
 * )
 */
class InsertView extends FilterBase implements TrustedCallbackInterface {

  /**
   * {@inheritdoc}
   */
  public function process($text, $langcode) {
    $result = new FilterProcessResult($text);
    if (!empty($text)) {
      $match = [];
      if (preg_match_all("/\[view:([^=\]]+)=?([^=\]]+)?=?([^=\]]+)?=?(?:limit:)?([\d]+)?\]/i", $text, $match)) {
        $search = $replace = [];
        foreach ($match[0] as $key => $value) {
          $view_name = $match[1][$key];
          $display_id = ($match[2][$key] && !is_numeric($match[2][$key])) ? $match[2][$key] : 'default';
          $args = $match[3][$key];
          $limit = $match[4][$key] ?? '';
          // Let's create a placeholder from the renderable array of the view.
          $view_output = $result->createPlaceholder('\Drupal\insert_view\Plugin\Filter\InsertView::build', [
            $view_name,
            $display_id,
            $args,
            $limit,
          ]);
          // Populate the replace statement.
          $search[] = $value;
          $replace[] = !empty($view_output) ? $view_output : '';
        }
        $text = str_replace($search, $replace, $text);
        // Add some more caching options.
        $result->setProcessedText($text)->addCacheTags(
          ['insert_view'])->addCacheContexts(['url', 'user.permissions']
        );
      }
    }
    return $result;
  }

  /**
   * The parameters to tag syntax.
   *
   * @param mixed $view_name
   *   The name of the view.
   * @param mixed $display_id
   *   The display ID of the view.
   * @param mixed $args
   *   An associative array of arguments.
   * @param string $limit
   *   The limit to itens per page.
   *
   * @return array
   *   A renderable array containing the view output
   */
  public static function build($view_name, $display_id, $args, $limit = '') {
    $plain = '';
    $view = Views::getView($view_name);
    if (empty($view)) {
      // Return renderable array.
      return ['#attached' => [], '#markup' => $plain];
    }
    if (!$view->access($display_id)) {
      // Return renderable array.
      return ['#attached' => [], '#markup' => $plain];
    }
    $current_path = \Drupal::service('path.current')->getPath();
    $url_args = explode('/', $current_path);
    foreach ($url_args as $id => $arg) {
      $args = str_replace("%$id", $arg, $args);
    }
    $args = preg_replace(',/?(%\d),', '', $args);
    $args = $args ? explode('/', $args) : [];
    if (is_numeric($limit)) {
      $view->setItemsPerPage($limit);
    }
    return $view->preview($display_id, $args);
  }

  /**
   * {@inheritdoc}
   */
  public function tips($long = FALSE) {
    if ($long) {

      $output = '<br />';
      $output .= '<dl>';
      $output .= '<dt>' . $this->t('Insert view filter allows to embed views using tags. The tag syntax is relatively simple: [view:name=display=args=limit:number]') . '</dt>';
      $output .= '<dt>' . $this->t('For example [view:tracker=page=1] says, embed a view named "tracker", use the "page" display, and supply the argument "1".') . '</dt>';
      $output .= '<dt>' . $this->t("The <em>display</em>, <em>args</em>, and <em>limit</em> parameters can be omitted. If the display is left empty, the view\'s default display is used. If the limit is left empty, the view display\'s settings are used. Use <em>0</em> to show all results.") . '</dt>';
      $output .= '<dt>' . $this->t('Multiple arguments are separated with slash. The <em>args</em> format is the same as used in the URL (or view preview screen).') . '</dt>';
      $output .= '</dl>';
      $output .= $this->t('Valid examples:');
      $output .= '<dl>';
      $output .= '<dt>[view:my_view]</dt>';
      $output .= '<dt>[view:my_view=my_display]</dt>';
      $output .= '<dt>[view:my_view=my_display=arg1/arg2/arg3=limit:number]</dt>';
      $output .= '<dt>[view:my_view==arg1/arg2/arg3]</dt>';
      $output .= '<dt>[view:my_view===limit:0]</dt>';
      $output .= '</dl>';
      $output .= '<br />';

      return $output;
    }
    else {
      return $this->t('You may use [view:<em>name=display=args</em>] tags to display views.');
    }
  }

  /**
   * {@inheritdoc}
   */
  public static function trustedCallbacks() {
    return [
      'build',
    ];
  }

}
