<?php

namespace Drupal\recording_system_links;

/**
 * Define methods required for an API providers' utility class.
 */
interface RemoteRecordingSystemApiInterface {

  /**
   * Retrieve a list of fields that need a value mapping for this API.
   *
   * @return array
   *   List of field names.
   */
  public function requiredMappingFields() : array;

  /**
   * Is the record valid for this provider's requirements?
   *
   * Messages are returned for any validation errors.
   *
   * @param object $link
   *   Link information object.
   * @param array $record
   *   Record data.
   *
   * @return array
   *   List of errors, empty if valid.
   */
  public function getValidationErrors($link, array $record): array;

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
  public function submit($link, array $tokens, array $record, array $existingInfo = NULL): array;

}
