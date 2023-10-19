<?php

namespace Drupal\recording_system_links\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Url;
use Drupal\Core\Link;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Drupal\recording_system_links\Utility\SqlLiteLookups;

/**
 * Controller for endpoints relating to oAuth2 links to other systems.
 */
class RecordingSystemLinksController extends ControllerBase {

  /**
   * An index page for the administration of links to other systems.
   */
  public function manageLinks() {
    $render = [];
    $db = \Drupal::database();
    $links = $db->query("SELECT id, title, description FROM {recording_system_config} ORDER BY title");
    $header = [
      $this->t('Title'),
      $this->t('Description'),
      '',
    ];
    $rows = [];
    foreach ($links as $link) {
      $editLinkUrl = Url::fromRoute('recording_system_links.configure_link', ['id' => $link->id]);
      $editLinkUrl->setOptions(['attributes' => ['class' => ['button']]]);
      $rows[] = [
        $link->title,
        $link->description,
        Link::fromTextAndUrl($this->t('Edit'), $editLinkUrl),
      ];
    }
    $render['table'] = [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $rows,
    ];

    $url = Url::fromRoute('recording_system_links.configure_link');
    $url->setOptions(['attributes' => ['class' => ['button']]]);
    $render['add_button'] = [Link::fromTextAndUrl($this->t('Add new link'), $url)->toRenderable()];

    return $render;
  }

  /**
   * An index page for the configured mappings tables.
   */
  public function manageMappings() {
    $lookups = new SqlLiteLookups();
    $lookups->getDatabase();
    $mappingTables = $lookups->listTables();
    $header = [
      $this->t('Title'),
      '',
    ];
    $rows = [];
    foreach ($mappingTables as $table) {
      $editUrl = Url::fromRoute('recording_system_links.configure_mapping', ['table' => $table]);
      $editUrl->setOptions(['attributes' => ['class' => ['button']]]);
      $rows[] = [
        $table,
        Link::fromTextAndUrl($this->t('Edit'), $editUrl),
      ];
    }
    $render['table'] = [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $rows,
    ];

    $url = Url::fromRoute('recording_system_links.configure_mapping');
    $url->setOptions(['attributes' => ['class' => ['button']]]);
    $render['add_button'] = [Link::fromTextAndUrl($this->t('Add new mapping table'), $url)->toRenderable()];

    return $render;
  }

  /**
   * Controller action to connect a user account to a recording system.
   *
   * Redirects to the remote systems authorization page via oAuth2.
   *
   * @param string $machineName
   *   Unique identifier for the system being connected to.
   *
   * @return Drupal\Core\Routing\TrustedRedirectResponse
   *   Redirection to remote system.
   */
  public function connect($machineName) {
    $utils = \Drupal::service('recording_system_links.recording_system_utils');
    $linkConfig = $utils->getLinkConfigFromMachineName($machineName);
    if (empty($linkConfig)) {
      throw new NotFoundHttpException();
    }
    $url = $this->getRedirectUri($machineName);
    $response = new TrustedRedirectResponse("{$linkConfig->oauth2_url}authorize/?response_type=code&client_id=$linkConfig->client_id&redirect_uri=" . $url->getGeneratedUrl());
    $response->addCacheableDependency($url);
    return $response;
  }

  /**
   * Callback which the oAuth2 login form on the server can redirect to.
   *
   * Uses the provided token to obtain an access token to store for the current
   * user.
   *
   * @param string $machineName
   *   Name of the system being redirected from.
   *
   * @todo Remove default param when redirect corrected.
   * @todo Dependency inject record_system_utils and messenger.
   */
  public function oauth2Callback($machineName = 'observation_org') {
    $utils = \Drupal::service('recording_system_links.recording_system_utils');
    $linkConfig = $utils->getLinkConfigFromMachineName($machineName);
    if (empty($linkConfig)) {
      throw new NotFoundHttpException();
    }
    $utils->getAccessToken($linkConfig, \Drupal::currentUser()->id(), [
      'code' => $_GET['code'],
      'redirect_uri' => $this->getRedirectUri($machineName)->getGeneratedUrl(),
    ]);
    // @todo Dependency injection for messenger.
    \Drupal::messenger()->addMessage($this->t('Your account is now connected to %title.', ['%title' => $linkConfig->title]));
    return new RedirectResponse(Url::fromRoute('user.page')->toString());
  }

  /**
   * Calculate the redirect_uri for a given system machine name.
   *
   * @param string $machineName
   *   Name of the system being redirected from.
   *
   * @return \Drupal\Core\GeneratedUrl
   *   A GeneratedUrl object is returned, containing the generated URL plus
   *   bubbleable metadata.
   */
  private function getRedirectUri($machineName) {
    // Get a trusted response, convoluted way of getting URL to avoid
    // cacheability metadata error.
    $url = Url::fromRoute('recording_system_links.oauth2-callback', ['machineName' => $machineName], ['absolute' => TRUE])->toString(TRUE);

    // @todo Remove this line of code. Only necessary until accepted
    // redirect_uri updated to include machine_name (observation_org) on
    // obs.org. Associated foo route can then also be removed.
    $url = Url::fromRoute('recording_system_links.oauth2-callback-foo', [], ['absolute' => TRUE])->toString(TRUE);

    return $url;
  }

}
