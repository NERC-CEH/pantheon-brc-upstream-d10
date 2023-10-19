<?php

namespace Drupal\recording_system_links;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\Logger\LoggerChannelFactory;
use Drupal\Core\Database\Connection;
use Drupal\user\Entity\User;
use Drupal\recording_system_links\Utility\IndiciaUtils;

/**
 * Service with useful functions for the recording_system_links module.
 */
class RecordingSystemUtils {

  use StringTranslationTrait;

  /**
   * Include the messenger service.
   *
   * @var \Drupal\Core\Messenger\MessengerInterface
   */
  protected $messenger;

  /**
   * Logger.
   *
   * @var \Drupal\Core\Logger\LoggerChannel
   */
  protected $logger;

  /**
   * Database.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $database;

  /**
   * List of loaded user access tokens.
   *
   * @var array
   */
  private array $accessTokensByWarehouseUserId = [];

  /**
   * Constructs a RecordingSystemUtils object.
   *
   * Dependency injection to access Drupal core services.
   *
   * @param \Drupal\Core\StringTranslation\TranslationInterface $stringTranslation
   *   The string translation service.
   * @param \Drupal\Core\Messenger\MessengerInterface $messenger
   *   The messenger service.
   * @param \Drupal\Core\Logger\LoggerChannelFactory $loggerFactory
   *   The logger service.
   * @param \Drupal\Core\Database\Connection $database
   *   The database connection.
   */
  public function __construct(
      TranslationInterface $stringTranslation,
      MessengerInterface $messenger,
      LoggerChannelFactory $loggerFactory,
      Connection $database) {
    $this->stringTranslation = $stringTranslation;
    $this->messenger = $messenger;
    $this->logger = $loggerFactory->get('recording_system_links');
    $this->database = $database;
  }

  /**
   * Find details of a link using it's machine name to locate it.
   *
   * @param string $machineName
   *   Machine name of the link to find.
   *
   * @return obj
   *   Link object.
   */
  public function getLinkConfigFromMachineName($machineName) {
    $results = $this->database->query(
      'SELECT * FROM {recording_system_config} WHERE machine_name = :machine_name',
      [':machine_name' => $machineName]);
    $link = $results->fetch();
    return $link;
  }

  /**
   * Retrieve a list of the recording system links from the database.
   *
   * @param string $type
   *   Filter on the trigger on settings - one of 'all', 'hook' or 'cron'.
   *
   * @return array
   *   List of links and access tokens.
   */
  public function getAllSystemLinkList($type = 'all') {
    $query = $this->database->select('recording_system_config', 'rsc');
    $query->fields('rsc');
    if ($type === 'hook') {
      $query->condition('trigger_on_hooks', 0, '<>');
    }
    elseif ($type === 'cron') {
      $query->condition('trigger_on_cron', 0, '<>');
    }
    $query->orderBy('title');
    return $query->execute()->fetchAll();
  }

  /**
   * Retrieve a list of the recording system links and User IDs.
   *
   * Includes an aggregated list of all the users who are connected for each
   * link.
   *
   * @param string $type
   *   Filter on the trigger on settings - one of 'all', 'hook' or 'cron'.
   *
   * @return array
   *   List of links and access tokens.
   */
  public function getAllSystemLinkWithUserIdsList($type = 'all') {
    $query = $this->database->select('recording_system_config', 'rsc');
    $query->addJoin('INNER', 'recording_system_oauth_tokens', 'rst', 'rst.recording_system_config_id=rsc.id');
    // Use addField to ensure correct aliases.
    $query->addField('rsc', 'id', 'id');
    $query->addField('rsc', 'title', 'title');
    $query->addField('rsc', 'survey_ids', 'survey_ids');
    $query->addField('rsc', 'api_provider', 'api_provider');
    $query->addField('rsc', 'oauth2_url', 'oauth2_url');
    $query->addField('rsc', 'client_id', 'client_id');
    $query->addField('rsc', 'lookups', 'lookups');
    $query->addField('rsc', 'tracking', 'tracking');
    if ($type === 'hook') {
      $query->condition('trigger_on_hooks', 0, '<>');
    }
    elseif ($type === 'cron') {
      $query->condition('trigger_on_cron', 0, '<>');
    }
    $query->groupBy('id');
    $query->groupBy('title');
    $query->groupBy('survey_ids');
    $query->groupBy('api_provider');
    $query->groupBy('oauth2_url');
    $query->groupBy('client_id');
    $query->groupBy('lookups');
    $query->groupBy('tracking');
    $query->addExpression("group_concat(concat(rst.uid, ''))", 'user_list');
    return $query->execute()->fetchAll();
  }

  /**
   * Get warehouse user IDs for filtering the warehouse query to fetch records.
   *
   * * Only finds users for cron-enabled links.
   * * If more than 100, return NULL (as no point filtering).
   * * If none, returns empty array so no need to run the query.
   *
   * @return array
   *   List of up to 100 warehouse user IDs, or NULL.
   */
  public function getWarehouseUserIdFilterForCron() {
    $query = $this->database->select('recording_system_config', 'rsc');
    $query->addJoin('INNER', 'recording_system_oauth_tokens', 'rst', 'rst.recording_system_config_id=rsc.id');
    $query->condition('trigger_on_cron', 0, '<>');
    $query->addExpression("group_concat(distinct concat(rst.uid, ''))", 'user_list');
    $result = $query->execute()->fetch()->user_list;
    $uids = $result ? explode(',', $result) : [];
    if (count($uids) > 100) {
      return NULL;
    }
    $warehouseUserIds = [];
    foreach ($uids as $uid) {
      $user = User::load($uid);
      $warehouseUserIds[] = $user->field_indicia_user_id->value;
    }
    return $warehouseUserIds;
  }

  /**
   * Retrieve a list of the recording system links from the database.
   *
   * Includes the user's access tokens.
   *
   * @param bool $includeUnlinked
   *   Set to true to include system links that the user has not connected
   *   their account to.
   * @param string $type
   *   Filter on the trigger on settings - one of 'all', 'hook' or 'cron'.
   *
   * @return array
   *   List of links and access tokens.
   */
  public function getUsersSystemLinkList($includeUnlinked, $type = 'all') {
    $query = $this->database->select('recording_system_config', 'rsc');
    $query->addJoin($includeUnlinked ? 'LEFT OUTER' : 'INNER', 'recording_system_oauth_tokens', 'rst', 'rst.recording_system_config_id=rsc.id AND rst.uid=' . \Drupal::currentUser()->id());
    $query->fields('rsc');
    $query->addField('rst', 'uid', 'rst_uid');
    $query->fields('rst', ['access_token', 'refresh_token', 'expiry']);
    if ($type === 'hook') {
      $query->condition('trigger_on_hooks', 0, '<>');
    }
    elseif ($type === 'cron') {
      $query->condition('trigger_on_cron', 0, '<>');
    }
    $query->orderBy('title');
    return $query->execute()->fetchAll();
  }

  /**
   * Returns the lowest tracking ID from a list of links.
   *
   * Allows fetching all the records that might need syncing.
   *
   * @param array $links
   *   List of loaded link config data.
   *
   * @return int
   *   Min tracking value, or NULL if none.
   */
  public function getMinTracking(array $links) {
    $r = NULL;
    foreach ($links as $link) {
      if ($link->tracking && ($r === NULL || $link->tracking < $r)) {
        $r = $link->tracking;
      }
    }
    return $r;
  }

  /**
   * Applies the current max tracking ID to the list of links.
   *
   * Ensures next cron run only picks up changes.
   *
   * @param array $links
   *   List of link objects.
   * @param int $tracking
   *   Tracking ID to set. If not provided, then the current max is used.
   */
  public function setCurrentTrackingOnLinks(array $links, $tracking = NULL) {
    $linkIds = [];
    foreach ($links as $link) {
      $linkIds[] = $link->id;
    }
    $tracking = $tracking ?? IndiciaUtils::getCurrentMaxTracking();
    $this->database->update('recording_system_config')
      ->fields(['tracking' => $tracking])
      ->condition('id', $linkIds, 'IN')
      ->execute();
  }

  /**
   * Syncronise a batch of records to a batch of links.
   *
   * @param array $records
   *   List of record data as loaded from the warehouse.
   * @param array $links
   *   List of link objects to sync to.
   * @param bool $fetchMessage
   *   If true, then returns a suggested message to inform the user that their
   *   records have been synced.
   * @param string $op
   *   C(reate) or (U)pdate - required to create the correct message.
   */
  public function syncRecords(array $records, array $links, $fetchMessage = FALSE, $op = NULL) {
    iform_load_helpers(['data_entry_helper']);
    // Prepare warehouse auth tokens so we can write back the remote system's
    // record info.
    $conn = iform_get_connection_details();
    $auth = \data_entry_helper::get_read_write_auth($conn['website_id'], $conn['password']);
    $auth['write_tokens']['persist_auth'] = TRUE;
    $successfulSystemNames = [];
    $apis = [];
    $apiManager = \Drupal::service('plugin.manager.remote_recording_system_api');
    foreach ($links as $link) {
      $apis[$link->api_provider] = $apiManager->createInstance($link->api_provider);
    };

    // Query to get systems the user is connected to.
    foreach ($records as $record) {
      $thisRecordMetadata = empty($record['metadata']) ? [] : json_decode($record['metadata'], TRUE);
      $thisRecordMetadata['links'] = empty($thisRecordMetadata['links']) ? [] : $thisRecordMetadata['links'];
      foreach ($links as $link) {
        if ($record['tracking'] <= $link->tracking) {
          // Record doesn't need to be synced - likely to happen if cron mode
          // turned on for this link since last cron run.
          continue;
        }
        // Link may also be survey ID filtered.
        if (!empty($link->survey_ids)) {
          if (!in_array($record['survey_id'], explode(',', $link->survey_ids))) {
            continue;
          }
        }
        $tokens = $this->getOauth2TokensForRecord($link, $record);
        if ($tokens === NULL) {
          // Record creator not connected to this link.
          continue;
        }
        $recordToSend = array_merge($record);
        $apis[$link->api_provider]->addMappedValues($link, $recordToSend);
        $errors = $apis[$link->api_provider]->getValidationErrors($link, $recordToSend);
        if (count($errors)) {
          $this->logFailinfo($this->t('A record could not be posted to @title as it was considered invalid for that system.', ['@title' => $link->title]), $fetchMessage, 'warning');
          $this->logFailinfo(implode(' ', $errors), $fetchMessage, 'warning');
          continue;
        }
        $existingInfo = isset($thisRecordMetadata['links'][$link->title]) ? $thisRecordMetadata['links'][$link->title] : NULL;

        $result = $apis[$link->api_provider]->submit($link, $tokens, $recordToSend, $existingInfo);
        if ($result['status'] === 'OK') {
          $successfulSystemNames[$link->title] = $link->title;
          $thisRecordMetadata['links'][$link->title] = $result['metadata'];
        }
        else {
          $this->logFailinfo($this->t('An error occurred when posting a record to @title.', ['@title' => $link->title]), $fetchMessage, 'error');
          $this->logFailinfo(implode(' ', $result['errors']), $fetchMessage, 'error');
        }
      }
      // Attach metadata to the warehouse record so we know it's linked.
      $update = [
        'occurrence:id' => $record['occurrenceID'],
        'occurrence:metadata' => json_encode($thisRecordMetadata),
        'website_id' => $conn['website_id'],
      ];
      $s = \submission_builder::wrap($update, 'occurrence');
      \data_entry_helper::forward_post_to('save', $s, $auth['write_tokens'] + ['cache_updates' => 'off']);
    }
    // Show a message summarising the extra places the record has been sent to.
    if ($fetchMessage && count($successfulSystemNames) > 0) {
      $opString = [
        'C' => $this->t('added to'),
        'U' => $this->t('updated on'),
        'D' => $this->t('removed from'),
      ][$op];
      $lastSystemName = array_pop($successfulSystemNames);
      $systemNameString = (count($successfulSystemNames) > 0 ? implode(', ', $successfulSystemNames) . ' ' . $this->t('and') . ' ' : '') . $lastSystemName;
      $entity = count($records) === 1 ? 'record' : 'sample';
      return $this->t('The @entity has also been @action @systems.', [
        '@entity' => $entity,
        '@action' => $opString,
        '@systems' => $systemNameString,
        '@title' => $link->title,
      ]);
    }
    return NULL;
  }

  /**
   * Retreive an oAuth2 access token.
   *
   * Can either do initial request for token, or a token refresh.
   *
   * @param object $link
   *   Link config object.
   * @param int $uid
   *   Drupal user ID.
   * @param array $params
   *   Parameters for the token request. Either a refresh token for a token
   *   refresh, or a code and redirect_uri for an initial token request.
   *
   * @return array
   *   Contains refresh, access and expiry (unix timestamp).
   */
  public function getAccessToken($link, $uid, array $params) {
    $tokenUrl = "{$link->oauth2_url}token/";
    $session = curl_init();
    // Set the POST options.
    curl_setopt($session, CURLOPT_URL, $tokenUrl);
    curl_setopt($session, CURLOPT_HEADER, TRUE);
    curl_setopt($session, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($session, CURLOPT_POST, 1);
    if (isset($params['refreshToken'])) {
      $postFields = "client_id=$link->client_id&grant_type=refresh_token&refresh_token=$params[refreshToken]";
    }
    else {
      $postFields = "client_id=$link->client_id&grant_type=authorization_code&code=$params[code]&redirect_uri=$params[redirect_uri]";
    }
    curl_setopt($session, CURLOPT_POSTFIELDS, $postFields);
    $rawResponse = curl_exec($session);
    $httpCode = curl_getinfo($session, CURLINFO_HTTP_CODE);
    $curlErrNo = curl_errno($session);
    if ($curlErrNo || $httpCode !== 200) {
      $errorInfo = ['Request failed when exchanging code for a token.'];
      $errorInfo[] = "URL: $tokenUrl.";
      $errorInfo[] = "POST data: $postFields";
      if ($curlErrNo) {
        $errorInfo[] = 'cUrl error: ' . $curlErrNo . ': ' . curl_error($session);
      }
      if ($httpCode !== 200) {
        $errorInfo[] = "HTTP status $httpCode.";
      }
      $errorInfo[] = $rawResponse;
      $this->logger->error(implode(' ', $errorInfo));
      throw new \Exception('Token request failed');
    }
    else {
      $parts = explode("\r\n\r\n", $rawResponse);
      $responseBody = array_pop($parts);
      $authObj = json_decode($responseBody);
      // Store the access token and refresh token in the
      // recording_system_oauth_tokens table.
      $tokens = [
        'access_token' => $authObj->access_token,
        'refresh_token' => $authObj->refresh_token,
        'expiry' => time() + $authObj->expires_in,
      ];
      if (isset($params['refreshToken'])) {
        $this->database
          ->update('recording_system_oauth_tokens')
          ->fields($tokens)
          ->condition('uid', $uid)
          ->condition('recording_system_config_id', $link->id)
          ->execute();
      }
      else {
        $this->database
          ->insert('recording_system_oauth_tokens')
          ->fields([
            'uid' => $uid,
            'recording_system_config_id' => $link->id,
          ] + $tokens)
          ->execute();
      }
      return $tokens;
    }
  }

  /**
   * Retreive the oAuth2 tokens to use for a record.
   *
   * Tokens may be in the link data (when syncing on submit of a single form)
   * or need to be looked up using a record's created_by_id (when syncing on
   * cron).
   *
   * @param object $link
   *   Link data object.
   * @param array $record
   *   Record data loaded from the warehouse.
   *
   * @return array
   *   Array containing access and refresh tokens, or NULL if the user not
   *   connected to this system.
   */
  private function getOauth2TokensForRecord($link, array $record) {
    if (isset($link->access_token)) {
      $tokens = [
        'access_token' => $link->access_token,
        'refresh_token' => $link->refresh_token,
        'expiry' => $link->expiry,
      ];
      $uid = $link->rst_uid;
    }
    else {
      $users = hostsite_find_cms_user_by_field_value('indicia_user_id', $record['created_by_id']);
      $uid = $users[0];
      // Load the access token info for the user inferred by the record
      // created_by_id. We use a class variable to avoid repeat lookups.
      if (isset($this->accessTokensByWarehouseUserId[$record['created_by_id']])) {
        $tokens = $this->accessTokensByWarehouseUserId[$record['created_by_id']];
      }
      else {
        $tokens = $this->database->select('recording_system_oauth_tokens', 'rst')
          ->fields('rst', ['access_token', 'refresh_token', 'expiry'])
          ->condition('uid', $uid)
          ->execute()->fetchAssoc();
      }
    }
    if ($tokens) {
      if ($tokens['expiry'] <= time()) {
        $tokens = $this->getAccessToken($link, $uid, ['refreshToken' => $tokens['refresh_token']]);
      }
      $this->accessTokensByWarehouseUserId[$record['created_by_id']] = $tokens;
    }
    else {
      $this->accessTokensByWarehouseUserId[$record['created_by_id']] = NULL;
    }
    return $this->accessTokensByWarehouseUserId[$record['created_by_id']];
  }

  /**
   * Logs some sort of failure, with optional message.
   *
   * @param string $message
   *   Message to log.
   * @param bool $showMessage
   *   If TRUE, then message shown to user.
   * @param string $status
   *   Either error or warning.
   */
  private function logFailInfo($message, $showMessage, $status) {
    switch ($status) {
      case 'warning':
        $this->logger->warning($message);
        if ($showMessage) {
          $this->messenger->addWarning($message);
        }
        break;

      default:
        $this->logger->error($message);
        if ($showMessage) {
          $this->messenger->addError($message);
        }
        break;
    }
  }

}
