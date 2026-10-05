<?php

namespace Drupal\gutenberg\Ajax;

use Drupal\Core\Ajax\OpenDialogCommand;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * Defines an AJAX command to open content in a dialog in a custom dialog.
 *
 * @ingroup ajax
 */
class OpenInSidebarCommand extends OpenDialogCommand {
  use StringTranslationTrait;

  public function __construct($title, $content, array $dialog_options = [], $settings = NULL) {
    parent::__construct('#gutenberg-sidebar-dialog', $title, $content, $dialog_options, $settings);
  }

  /**
   * Implements \Drupal\Core\Ajax\CommandInterface:render().
   */
  public function render() {
    return [
      'command' => 'openInSidebar',
      'selector' => $this->selector,
      'settings' => $this->settings,
      'data' => $this->getRenderedContent(),
      'dialogOptions' => $this->dialogOptions,
    ];
  }

  /**
   * Custom Renderer calls the Parent Renderer.
   */
  protected function getRenderedContent() {
    $close_label = $this->t('Close');
    $button = '<div class="wrapper_popup--close">'
      . '<a class="btn-icon icon-close" id="custom-close-button"'
      . ' data-close aria-label="' . $close_label . '"></a></div>';
    return '<div class="wrapper_popup_content">'
      . $button . parent::getRenderedContent() . '</div>';
  }

}
