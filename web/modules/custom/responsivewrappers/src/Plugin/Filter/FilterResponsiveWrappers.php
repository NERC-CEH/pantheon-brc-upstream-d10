<?php

namespace Drupal\responsivewrappers\Plugin\Filter;

use Drupal\Component\Utility\Html;
use Drupal\Core\Form\FormStateInterface;
use Drupal\filter\FilterProcessResult;
use Drupal\filter\Plugin\FilterBase;

/**
 * Check the content and add responsive classes and wrappers.
 *
 * @Filter(
 *   id = "filter_bootstrap_responsive_wrapper",
 *   title = @Translation("Responsive wrappers filter"),
 *   description = @Translation("Scans content to add responsive wrappers and classes to make it responsive. Set this filter after Video Embed WYSIWYG filter if it exists."),
 *   type = Drupal\filter\Plugin\FilterInterface::TYPE_TRANSFORM_IRREVERSIBLE
 * )
 */
class FilterResponsiveWrappers extends FilterBase {

  /**
   * Implements filter processor.
   */
  public function process($text, $langcode) {
    $result = new FilterProcessResult($text);

    if ($this->settings['responsive_iframe'] || $this->settings['responsive_table'] || $this->settings['responsive_image']) {
      // The module base config.
      $config = \Drupal::config('responsivewrappers.settings');
      // The field content DOM.
      $dom = Html::load($text);

      // Responsive iframe class and wrapper.
      if ($this->settings['responsive_iframe']) {
        $iframe_pattern = $this->settings['responsive_iframe_pattern'];

        $iframe_wrapper_class = $config->get('iframe_wrapper_class') ?? 'embed-responsive embed-responsive-16by9';
        $iframe_class = $config->get('iframe_class') ?? 'embed-responsive-item';

        $iframes = $dom->getElementsByTagName('iframe');
        foreach ($iframes as $iframe) {
          // Iframe detection pattern.
          $iframe_src = $iframe->getAttribute('src');
          if (preg_match($iframe_pattern, $iframe_src)) {

            // Iframe wrapper.
            $current_iframe_wrapper_class = ($iframe->parentNode->tagName === 'div') ? $iframe->parentNode->getAttribute('class') : '';

            // If exists, replace video-embed-field functionality.
            if (strpos($current_iframe_wrapper_class, 'video-embed-field-responsive-video') !== FALSE) {
              $current_iframe_wrapper_class = str_replace('video-embed-field-responsive-video', $iframe_wrapper_class, $current_iframe_wrapper_class);
              $iframe->parentNode->setAttribute('class', $current_iframe_wrapper_class);
            }
            elseif (strpos($current_iframe_wrapper_class, $iframe_wrapper_class) === FALSE) {
              // If not exists the wrapper create it.
              $iframe_wrapper = $dom->createElement('div');
              $iframe_wrapper->setAttribute('class', $iframe_wrapper_class);
              $iframe = $iframe->parentNode->replaceChild($iframe_wrapper, $iframe);
              $iframe_wrapper->appendChild($iframe);
            }

            // Iframe class.
            $current_iframe_class = $iframe->getAttribute('class');
            if (empty($current_iframe_class) || !in_array($iframe_class, explode(' ', $current_iframe_class))) {
              $iframe->setAttribute('class', trim($current_iframe_class . ' ' . $iframe_class));
            }
          }
        }
      }

      // Responsive table wrapper and class.
      if ($this->settings['responsive_table']) {
        $table_wrapper_class = $config->get('table_wrapper_class') ?? 'table-responsive';
        $table_class = $config->get('table_class') ?? 'table';

        $tables = $dom->getElementsByTagName('table');
        foreach ($tables as $table) {

          // Table wrapper.
          $current_table_wrapper_class = ($table->parentNode->tagName === 'div') ? $table->parentNode->getAttribute('class') : '';
          if (strpos($current_table_wrapper_class, $table_wrapper_class) === FALSE) {
            $table_wrapper = $dom->createElement('div');
            $table_wrapper->setAttribute('class', $table_wrapper_class);
            $table = $table->parentNode->replaceChild($table_wrapper, $table);
            $table_wrapper->appendChild($table);
          }

          // Table class.
          $current_table_class = $table->getAttribute('class');
          if (empty($current_table_class) || !in_array($table_class, explode(' ', $current_table_class))) {
            $table->setAttribute('class', trim($current_table_class . ' ' . $table_class));
          }
        }
      }

      // Responsive image class.
      if ($this->settings['responsive_image']) {
        $image_class = $config->get('image_class') ?? 'img-fluid';

        $images = $dom->getElementsByTagName('img');
        foreach ($images as $image) {
          // Image class.
          $current_image_class = $image->getAttribute('class');
          if (strpos($current_image_class, $image_class) === FALSE) {
            $image->setAttribute('class', trim($current_image_class . ' ' . $image_class));
          }
        }
      }

      $result->setProcessedText(Html::serialize($dom));

      // Attach responsive CSS if needed.
      if (1 === $config->get('add_css')) {
        $version = $config->get('version') ?? 4;

        switch ($version) {
          case 3:
            $result->setAttachments(['library' => ['responsivewrappers/responsivewrappers_v3']]);
            break;

          case 4:
          case 5:
            $result->setAttachments(['library' => ['responsivewrappers/responsivewrappers_v4']]);
            break;
        }

      }
    }

    return $result;
  }

  /**
   * Implements settings filter form.
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $form['responsive_iframe'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Responsive video'),
      '#default_value' => $this->settings['responsive_iframe'] ?? '',
      '#description' => $this->t('Add responsive class and wrapper for videos.'),
    ];
    $form['responsive_iframe_pattern'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Source video pattern detection'),
      '#default_value' => $this->settings['responsive_iframe_pattern'] ?? '#.*(youtube.|vimeo.).*#ui',
      '#description' => $this->t('Regular expresion for source video detection. This pattern evaluates scr iframe attribute.'),
    ];
    $form['responsive_table'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Responsive tables'),
      '#default_value' => $this->settings['responsive_table'] ?? '',
      '#description' => $this->t('Add responsive wrapper and class for tables.'),
    ];
    $form['responsive_image'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Responsive images'),
      '#default_value' => $this->settings['responsive_image'] ?? '',
      '#description' => $this->t('Add responsive class for images.'),
    ];

    return $form;
  }

}
