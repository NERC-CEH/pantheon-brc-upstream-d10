<?php

namespace Drupal\indicia_auto_exports\Plugin\WebformHandler;

use Drupal\webform\Plugin\WebformHandlerBase;
use Drupal\webform\WebformSubmissionInterface;

/**
 * Webform handler for Indicia Auto Exports.
 *
 * @WebformHandler(
 *   id = "indicia_auto_exports_webform_handler",
 *   label = @Translation("Indicia auto exports webform handler"),
 *   description = @Translation("Webform handler integrating with Indicia Auto Exports."),
 *   cardinality = \Drupal\webform\Plugin\WebformHandlerInterface::CARDINALITY_SINGLE,
 *   results = \Drupal\webform\Plugin\WebformHandlerInterface::RESULTS_PROCESSED,
 * )
 */
class IndiciaAutoExportsWebformHandler extends WebformHandlerBase {

  /**
   * {@inheritdoc}
   *
   * Calculates the export due date.
   */
  public function preSave(WebformSubmissionInterface $webformSubmission) {
    // If group never exported, then set the due date to now.
    $lastExportDate = $webformSubmission->getElementData('last_export_date');
    $exportFrequency = $webformSubmission->getElementData('export_frequency');
    if (empty($lastExportDate)) {
      // Never done before, so immediately due.
      $webformSubmission->setElementData('export_due', date('Y-m-d\TH:i:s'));
    }
    else {
      // Calculate time from last export according to frequency.
      $webformSubmission->setElementData('export_due', date('Y-m-d\TH:i:s', strtotime("$lastExportDate + $exportFrequency")));
    }
  }

}
