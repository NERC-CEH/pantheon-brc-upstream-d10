/* global Drupal, jQuery */
const $ = jQuery;

import '../../../css/sidebar.scss';

Drupal.AjaxCommands.prototype.openInSidebar = (ajax, response, status) => {
  if (!response.selector) {
    return false;
  }

  const $dialog = $(response.selector);

  if (!ajax.wrapper) {
    ajax.wrapper = $dialog.attr('id');
  }

  response.command = 'insert';
  response.method = 'html';
  ajax.commands.insert(ajax, response, status);
};
