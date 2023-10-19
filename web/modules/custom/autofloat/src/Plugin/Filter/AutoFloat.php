<?php

namespace Drupal\autofloat\Plugin\Filter;

use Drupal\Core\Form\FormStateInterface;
use Drupal\filter\FilterProcessResult;
use Drupal\filter\Plugin\FilterBase;
use Drupal\Core\Url;
use Drupal\Core\Link;

/**
 * Provides a filter that wraps images in a selector with odd/even classes.
 *
 * @Filter(
 *   id = "filter_autofloat",
 *   module = "autofloat",
 *   title = @Translation("Float images alternately left and right"),
 *   type = Drupal\filter\Plugin\FilterInterface::TYPE_TRANSFORM_IRREVERSIBLE,
 *   weight = 20
 * )
 */
class AutoFloat extends FilterBase {

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $url = Url::fromRoute('autofloat.settings');
    $config_link = Link::fromTextAndUrl($this->t('AutoFloat Filter Settings'), $url)->toString();

    $form['notice'] = [
      '#markup' => $this->t('@config_link are shared by all the text formats where it is enabled.', [
        '@config_link' => $config_link,
      ]),
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function process($text, $langcode) {
    return new FilterProcessResult(_autofloat_filter($text));
  }

  /**
   * {@inheritdoc}
   */
  public function tips($long = FALSE) {
    return $this->t('Images get an odd/even classes to make them float alternately left and right.');
  }

}
