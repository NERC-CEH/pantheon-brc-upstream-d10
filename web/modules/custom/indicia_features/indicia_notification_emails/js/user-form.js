jQuery(document).ready(function docReady($) {
  'use strict';

  var $advancedSelects = $(
    '#edit-email-comment-frequency, ' +
    '#edit-email-query-frequency, ' +
    '#edit-email-redet-frequency, ' +
    '#edit-email-auto-check-frequency, ' +
    '#edit-email-verification-frequency, ' +
    '#edit-email-milestone-frequency, ' +
    '#edit-email-verifier-task-frequency, ' +
    '#edit-email-pending-record-task-frequency, ' +
    '#edit-email-pending-groups-users-frequency'
  );

  $('#edit-email-frequency').on('change', function changeOverallFrequency() {
    if ($('#edit-email-frequency').val() === '-') {
      // Use advanced options, so show the details pane.
      $('#edit-advanced-email-settings').attr('open', 'open');
    }
    else {
      // Change advanced settings to match overall setting.
      $advancedSelects.val($('#edit-email-frequency').val());
      // Hide the details pane.
      $('#edit-advanced-email-settings').removeAttr('open');
    }
  });

  function updateOveralModeSelect() {
    // Change overall setting to match advanced settings.
    var firstFound = false;
    var mixFound = false;
    $advancedSelects.each(function() {
      if (firstFound === false) {
        firstFound = $(this).val();
      }
      if (firstFound !== $(this).val()) {
        mixFound = true;
        // Break out of each loop.
        return false;
      }
    });
    // set the basic select to match the advanced options
    $('#edit-email-frequency').val(mixFound ? '-' : firstFound);
  }
  $advancedSelects.on('change', updateOveralModeSelect);
});
