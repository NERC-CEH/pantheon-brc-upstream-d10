<?php

namespace Drupal\disable_user_login_and_registration\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;

/**
 * Listens to the dynamic route events.
 */
class RouteSubscriber extends RouteSubscriberBase {

  /**
   * {@inheritdoc}
   */
  protected function alterRoutes(RouteCollection $collection) {
    // Always deny access to unwanted routes.
    $disallow_routes = [];
    if (\Drupal::state()->get('disable_user_register') === 1) {
      $disallow_routes[] = 'user.register';
    }
    if (\Drupal::state()->get('disable_user_login') === 1) {
      $disallow_routes[] = 'user.pass';
    }
    foreach ($disallow_routes as $disallow_route) {
      if ($route = $collection->get($disallow_route)) {
        $route->setRequirement('_access', 'FALSE');
      }
    }
  }
}