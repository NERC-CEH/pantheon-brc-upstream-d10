<?php

namespace Drupal\recording_system_links\Plugin\RemoteRecordingSystemApi;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\recording_system_links\RemoteRecordingSystemApiInterface;
use Drupal\recording_system_links\Utility\SqlLiteLookups;

/**
 * Plugin for interaction with Observation.org's API.
 *
 * Mappings for life stage can be obtained from the API, via
 * https://observation-test.org/api/v1/species-groups/ (to get the group IDs)
 * and https://observation-test.org/api/v1/species-groups/4/attributes/ (to get
 * the stages for the group).
 *
 * @RemoteRecordingSystemApi(
 *   id = "observation_org",
 *   title = @Translation("Observation.org")
 * )
 */
class ObservationOrg implements RemoteRecordingSystemApiInterface {

  use StringTranslationTrait;

  /**
   * Retrieve a list of fields that need a value mapping for this API.
   *
   * @return array
   *   List of field names.
   */
  public function requiredMappingFields() : array {
    return ['taxonID', 'lifeStage'];
  }

  /**
   * Adds mapped values to the record for mapped fields.
   *
   * For fields where the data value is mapped to a value in the destination
   * API, adds the mapped values to the record.
   *
   * @param object $link
   *   Link information object.
   * @param array $record
   *   Record data which will have additional keys added for the mapped values.
   *
   * @todo Should this be in a base class for API providers?
   */
  public function addMappedValues($link, array &$record) {
    $linkLookupInfo = \helper_base::explode_lines_key_value_pairs($link->lookups);
    $lookups = new SqlLiteLookups();
    $lookups->getDatabase();
    foreach (self::requiredMappingFields() as $field) {
      $record["$field-mapped"] = $lookups->lookup($linkLookupInfo[$field], $record[$field]);
    }
  }

  /**
   * Is the record valid for this provider's requirements?
   *
   * Messages are displayed for any validation errors.
   *
   * @param object $link
   *   Link information object.
   * @param array $record
   *   Record data.
   *
   * @return array
   *   List of errors, empty if valid.
   */
  public function getValidationErrors($link, array $record): array {
    $errors = [];
    $requiredFields = [
      'taxonID',
      'eventDate',
      'decimalLatitude',
      'decimalLongitude',
    ];
    foreach ($requiredFields as $field) {
      if (empty($record[$field])) {
        $errors[$field] = $this->t('The @field field is required.', ['@field' => $field]);
      }
    }
    foreach (self::requiredMappingFields() as $field) {
      if (!empty($record[$field]) && empty($record["$field-mapped"])) {
        $errors[$field] = $this->t('The @field field value "@value" cannot be mapped to the destination system.', [
          '@field' => $field,
          '@value' => $record[$field],
        ]);
      }
    }
    return $errors;
  }

  /**
   * Submit a sample.
   *
   * @param object $link
   *   Link information object.
   * @param array $tokens
   *   Contains enties for access (oAuth2 access token) and refresh (oAuth2
   *   refresh token).
   * @param array $record
   *   Record data.
   * @param array $existingInfo
   *   Optional existing record metadata if updating the remote system's copy,
   *   containing entries for local_id, remote_id, href and uuid.
   *
   * @return array
   *   Contains status (OK or fail), plus metadata (on success) or errors (on
   *   fail). Metadata should contain required information for accessing the
   *   record on the remote system and will be stored in occurrences.metadata.
   */
  public function submit($link, array $tokens, array $record, array $existingInfo = NULL): array {
    $fields = $this->getRecordData($record, $existingInfo);
    $session = curl_init();
    $url = preg_replace('/oauth2\/$/', '', $link->oauth2_url);
    curl_setopt($session, CURLOPT_URL, "{$url}observations/create-single/");
    curl_setopt($session, CURLOPT_HEADER, TRUE);
    curl_setopt($session, CURLOPT_RETURNTRANSFER, TRUE);
    if ($existingInfo) {
      curl_setopt($session, CURLOPT_CUSTOMREQUEST, "PUT");
    }
    else {
      curl_setopt($session, CURLOPT_POST, 1);
    }
    curl_setopt($session, CURLOPT_POSTFIELDS, $this->fieldsToRawPostString($fields, $record));
    curl_setopt($session, CURLOPT_HTTPHEADER, [
      "Authorization: Bearer $tokens[access_token]",
      'Content-type: multipart/form-data; boundary=fieldboundary',
    ]);
    $response = $this->getCurlResponse($session);
    $errors = $this->checkSubmitErrors($link, $response);
    curl_close($session);
    if (count($errors) > 0) {
      return [
        'status' => 'fail',
        'errors' => $errors,
      ];
    }
    else {
      return [
        'status' => 'OK',
        'metadata' => [
          'href' => $response['data']->permalink,
          'id' => $response['data']->id,
          'uuid' => $fields['uuid'],
        ],
      ];
    }

  }

  /**
   * Utility method for retrieving a cUrl response in a usable form.
   *
   * @param mixed $session
   *   cUrl handle.
   *
   * @return array
   *   Reponse data.
   */
  private function getCurlResponse($session) {
    $rawResponse = curl_exec($session);
    $arrResponse = explode("\r\n\r\n", $rawResponse);
    // Last part of response is the actual data.
    $responsePayload = array_pop($arrResponse);
    $responseObj = json_decode($responsePayload);
    $r = [
      'data' => $responseObj,
      'httpCode' => curl_getinfo($session, CURLINFO_HTTP_CODE),
      'curlErrNo' => curl_errno($session),
    ];
    if ($r['curlErrNo']) {
      $r['curlError'] = curl_error($session);
    }
    return $r;
  }

  /**
   * Checks the results of a cUrl POST and displays errors.
   *
   * @param object $link
   *   Link information object.
   * @param array $response
   *   Response information from Observation.org.
   *
   * @return array
   *   List of errors messages, or empty array.
   */
  private function checkSubmitErrors($link, array $response) {
    // Check for an error, or check if the http response was not OK.
    if ($response['curlErrNo'] || !in_array($response['httpCode'], [200, 201])) {
      $messages = [
        $this->t('Error sending data to @title.', ['@title' => $link->title]),
      ];
      if ($response['curlErrNo']) {
        $messages[] = $this->t('Error number @errNo', ['@errNo' => $response['curlErrNo']]) . ' ' . $response['curlError'];
      }
      if ($response['httpCode'] !== 200) {
        $messages[] = $this->t('Response status: @code', ['@code' => $response['httpCode']]);
      }
      if ($response) {
        foreach ($response as $key => $msg) {
          $messages[] = "$key: " . json_encode($msg);
        }
      }
      // @todo Dependency injection for logger.
      \Drupal::logger('recording_system_links')->error(implode(' ', $messages));
      return $messages;
    }
    return [];
  }

  /**
   * Converts record data loaded from the warehouse to POST data.
   *
   * @param array $record
   *   Record data loaded from the warehouse.
   * @param array $existingInfo
   *   Metadata stored for any existing records if doing update.
   *
   * @return string
   *   POST data string in Observation.org's format.
   */
  private function getRecordData(array $record, array $existingInfo = NULL) {
    iform_load_helpers(['helper_base']);
    $lookups = new SqlLiteLookups();
    $lookups->getDatabase();
    // @todo consider vague dates.
    $fields = [
      'external_reference' => $record['occurrenceID'],
      'point' => "POINT($record[decimalLongitude] $record[decimalLatitude])",
      'species' => $record['taxonID-mapped'],
      'date' => $record['eventDate'],
      'accuracy' => $record['coordinateUncertaintyInMeters'],
    ];
    if (preg_match('/^\d+$/', $record['organismQuantity'])) {
      $fields['number'] = $record['organismQuantity'];
    }
    $maleChoices = [$this->t('male'), substr($this->t('male'), 0, 1)];
    $femaleChoices = [$this->t('female'), substr($this->t('female'), 0, 1)];
    if (in_array(strtolower($record['sex']), $maleChoices)) {
      $fields['sex'] = 'M';
    }
    elseif (in_array(strtolower($record['sex']), $femaleChoices)) {
      $fields['sex'] = 'F';
    }
    if (!empty($record['occurrencRemarks']) || !empty($record['eventRemarks'])) {
      $notes = [];
      if (!empty($record['occurrencRemarks'])) {
        $notes[] = $record['occurrencRemarks'];
      }
      if (!empty($record['eventRemarks'])) {
        $notes[] = $record['eventRemarks'];
      }
      $fields['notes'] = implode(' ', $notes);
    }
    if (!empty($record['lifeStage-mapped'])) {
      $fields['life_stage'] = $record['lifeStage-mapped'];
    }
    // Uuid required to allow updates on Observation.org.
    if (!empty($existingInfo)) {
      $fields['uuid'] = $existingInfo['uuid'];
    }
    else {
      $fields['uuid'] = $this->guidv4();
    }
    return $fields;
  }

  /**
   * Generate a V4 UUID.
   *
   * For unique record identification on Observation.org.
   *
   * @return string
   *   UUID.
   */
  private function guidv4() {
    $data = $data ?? random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
  }

  /**
   * Creates the raw POST payload for a record.
   *
   * This approach required due to incompatibilities between PHP's cUrl
   * multiple file handling and the Observation.org web service.
   */
  private function fieldsToRawPostString($fields, $record) {
    $delimiter = 'fieldboundary';
    $data = '';
    // Create form data as in raw form, as we can then add multiple
    // upload_photos which other methods don't allow.
    foreach ($fields as $name => $content) {
      $data .= "--$delimiter\r\n";
      $data .= "Content-Disposition: form-data; name=\"$name\"\r\n";
      // End of the headers.
      $data .= "\r\n";
      // Data value.
      $data .= "$content\r\n";
    }
    if (!empty($record['media'])) {
      $files = explode(',', $record['media']);
      // Allow GD to load image data from warehouse URL.
      ini_set("allow_url_fopen", TRUE);
      foreach ($files as $fileName) {
        $ext = strtolower(substr($fileName, strrpos($fileName, '.') + 1));
        if (!in_array($ext, ['jpg', 'jpeg'])) {
          // @todo Check Observation.org API to see if it supports other formats.
          \Drupal::logger('recording_system_links')->warning("File $fileName format not supported for upload to Observation.org for record $record[occurrenceID].");
          continue;
        }
        $data .= "--$delimiter\r\n";
        $data .= "Content-Disposition: form-data; name=\"upload_photos\"; filename=\"$fileName\"\r\n";
        $data .= "Content-Type: image/jpeg\r\n";
        $data .= "Content-Transfer-Encoding: binary\r\n";
        // End of the headers.
        $data .= "\r\n";
        // Add file content.
        $data .= $this->getResizedWarehouseImageData($fileName, 1000, 1000, $record['occurrenceID']) . "\r\n";
      }
    }
    $data .= "--$delimiter--\r\n";
    return $data;
  }

  /**
   * Retrieve resized binary data for an image from the warehouse.
   *
   * @param string $fileName
   *   File name from the upload folder on the warehouse.
   * @param int $widthDest
   *   Maximum final image width.
   * @param int $heightDest
   *   Maximum final image height.
   * @param int $recordId
   *   Indicia record ID (for error reporting only).
   *
   * @return string
   *   Binary image data.
   */
  private function getResizedWarehouseImageData($fileName, $widthDest, $heightDest, $recordId) {
    list($widthSrc, $heightSrc, $type) = getimagesize("http://localhost/warehouse/upload/$fileName");
    $ratio = $widthSrc / $heightSrc;
    if ($widthDest / $heightDest > $ratio) {
      $widthDest = floor($heightDest * $ratio);
    }
    else {
      $heightDest = floor($widthDest / $ratio);
    }
    $imgSrc = imagecreatefromjpeg("http://localhost/warehouse/upload/$fileName");
    if ($imgSrc === FALSE) {
      \Drupal::logger('recording_system_links')->warning("File $fileName could not be accessed from warehouse for upload to Observation.org for record $recordId.");
    }
    $imgDest = imagecreatetruecolor($widthDest, $heightDest);
    imagecopyresampled($imgDest, $imgSrc, 0, 0, 0, 0, $widthDest, $heightDest, $widthSrc, $heightSrc);
    ob_start();
    imagejpeg($imgDest);
    $imageAsString = ob_get_contents();
    ob_end_clean();
    imagedestroy($imgSrc);
    imagedestroy($imgDest);
    return $imageAsString;
  }

}
