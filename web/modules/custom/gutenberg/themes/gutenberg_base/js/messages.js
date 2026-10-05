/**
 * @file
 * Dismiss button of the status messages.
 */

/* global Drupal, once */
(function (Drupal, once) {
  'use strict';

  Drupal.behaviors.gutenbergBaseMessages = {
    attach(context) {
      once('messages-dismiss', '.messages__dismiss', context).forEach(
        (button) => {
          button.addEventListener('click', () => {
            const message = button.closest('.messages');
            if (message) {
              message.remove();
            }
          });
        },
      );
    },
  };
})(Drupal, once);
