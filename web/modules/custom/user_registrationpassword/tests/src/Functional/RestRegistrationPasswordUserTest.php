<?php

namespace Drupal\Tests\user_registrationpassword\Functional;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Test\AssertMailTrait;
use Drupal\Core\Url;
use Drupal\Tests\rest\Functional\CookieResourceTestTrait;
use Drupal\Tests\rest\Functional\ResourceTestBase;
use Drupal\user\UserInterface;
use Drupal\user_registrationpassword\UserRegistrationPassword;
use GuzzleHttp\RequestOptions;

/**
 * Tests user registration via REST resource.
 *
 * @group user
 */
class RestRegistrationPasswordUserTest extends ResourceTestBase {

  use CookieResourceTestTrait;

  use AssertMailTrait {
    getMails as drupalGetMails;
  }

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * {@inheritdoc}
   */
  protected static $format = 'hal_json';

  /**
   * {@inheritdoc}
   */
  protected static $mimeType = 'application/hal+json';

  /**
   * {@inheritdoc}
   */
  protected static $auth = 'cookie';

  /**
   * {@inheritdoc}
   */
  protected static $resourceConfigId = 'user_registrationpassword';

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['hal', 'user_registrationpassword'];

  const USER_EMAIL_DOMAIN = '@example.com';

  const TEST_EMAIL_DOMAIN = 'simpletest@example.com';

  /**
   * {@inheritdoc}
   */
  public function setUp(): void {
    parent::setUp();

    $auth = isset(static::$auth) ? [static::$auth] : [];
    $this->provisionResource([static::$format], $auth);

    $this->setUpAuthorization('POST');
  }

  /**
   * Tests that only anonymous users can register users.
   */
  public function testRegisterUser() {
    $config = $this->config('user.settings');
    $module_config = $this->config('user_registrationpassword.settings');

    $user = $this->registerUser('user1');
    $this->assertTrue($user->isBlocked());
    $this->assertFalse(empty($user->getPassword()));
    $email_count = count($this->drupalGetMails());
    $this->assertEquals($email_count, 1);

    // Attempt to register without sending a password.
    $response = $this->registerRequest('user2', FALSE);
    $this->assertResourceErrorResponse(422, "No password provided.", $response);

    // Attempt to register with a password when email verification is on, but
    // verify_mail and register are configured incorrectly.
    $config->set('register', UserInterface::REGISTER_VISITORS);
    $config->set('verify_mail', 1);
    $config->save();
    $config->set('register', UserRegistrationPassword::VERIFICATION_DEFAULT);
    $config->save();
    $response = $this->registerRequest('user3');
    $this->assertResourceErrorResponse(400, 'The current configuration does not allow this registration.', $response);

    // Verify that an authenticated user cannot register a new user, despite
    // being granted permission to do so because only anonymous users can
    // register themselves, authenticated users with the necessary permissions
    // can POST a new user to the "user" REST resource.
    $this->initAuthentication();
    $response = $this->registerRequest($this->account->getAccountName());
    $this->assertResourceErrorResponse(403, "Only anonymous users can register a user.", $response);
  }

  /**
   * Create the request body.
   *
   * @param string $name
   *   Name.
   * @param bool $include_password
   *   Include Password.
   * @param bool $include_email
   *   Include Email.
   *
   * @return array
   *   Return the request body.
   */
  protected function createRequestBody($name, $include_password = TRUE, $include_email = TRUE) {
    global $base_url;
    $request_body = [
      '_links' => ['type' => ["href" => $base_url . "/rest/type/user/user"]],
      'langcode' => [['value' => 'en']],
      'name' => [['value' => $name]],
    ];

    if ($include_email) {
      $request_body['mail'] = [['value' => $name . self::USER_EMAIL_DOMAIN]];
    }

    if ($include_password) {
      $request_body['pass']['value'] = 'SuperSecretPassword';
    }

    return $request_body;
  }

  /**
   * Helper function to generate the request body.
   *
   * @param array $request_body
   *   The request body array.
   *
   * @return array
   *   Return the request options.
   */
  protected function createRequestOptions(array $request_body) {
    $request_options = $this->getAuthenticationRequestOptions('POST');
    $request_options[RequestOptions::BODY] = $this->serializer->encode($request_body, static::$format);
    $request_options[RequestOptions::HEADERS]['Content-Type'] = static::$mimeType;

    return $request_options;
  }

  /**
   * Registers a user via REST resource.
   *
   * @param string $name
   *   User name.
   * @param bool $include_password
   *   Include the password.
   * @param bool $include_email
   *   Include the email?
   *
   * @return bool|\Drupal\user\Entity\User
   *   Return bool or the user.
   */
  protected function registerUser($name, $include_password = TRUE, $include_email = TRUE) {
    // Verify that an anonymous user can register.
    $response = $this->registerRequest($name, $include_password, $include_email);
    $this->assertResourceResponse(200, FALSE, $response);
    $user = user_load_by_name($name);
    $this->assertFalse(empty($user), 'User was create as expected');
    return $user;
  }

  /**
   * Make a REST user registration request.
   *
   * @param string $name
   *   The name.
   * @param bool $include_password
   *   Include the password?
   * @param bool $include_email
   *   Include the email?
   *
   * @return \Psr\Http\Message\ResponseInterface
   *   Return the Response.
   */
  protected function registerRequest($name, $include_password = TRUE, $include_email = TRUE) {
    $user_register_url = Url::fromRoute('rest.user_registrationpassword.POST')
      ->setRouteParameter('_format', static::$format);
    $request_body = $this->createRequestBody($name, $include_password, $include_email);
    $request_options = $this->createRequestOptions($request_body);
    $response = $this->request('POST', $user_register_url, $request_options);
    return $response;
  }

  /**
   * {@inheritdoc}
   */
  protected function setUpAuthorization($method) {
    switch ($method) {
      case 'POST':
        $this->grantPermissionsToAuthenticatedRole(['restful post user_registrationpassword']);
        $this->grantPermissionsToAnonymousRole(['restful post user_registrationpassword']);
        break;

      default:
        throw new \UnexpectedValueException();
    }
  }

  /**
   * {@inheritdoc}
   */
  protected function assertNormalizationEdgeCases($method, Url $url, array $request_options) {
  }

  /**
   * {@inheritdoc}
   */
  protected function getExpectedBcUnauthorizedAccessMessage($method) {
  }

  /**
   * {@inheritdoc}
   */
  protected function getExpectedUnauthorizedAccessCacheability() {
    // There is cacheability metadata to check as file uploads only allows POST
    // requests, which will not return cacheable responses.
    return new CacheableMetadata();
  }

}
