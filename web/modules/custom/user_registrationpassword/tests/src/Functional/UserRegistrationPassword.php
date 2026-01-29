<?php

namespace Drupal\Tests\user_registrationpassword\Functional;

use Drupal\Component\Render\FormattableMarkup;
use Drupal\Core\Url;
use Drupal\Tests\BrowserTestBase;

/**
 * Functionality tests for User registration password module.
 *
 * @group user_registrationpassword
 */
class UserRegistrationPassword extends BrowserTestBase {

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * Modules to install.
   *
   * @var array
   */
  protected static $modules = ['user_registrationpassword'];

  /**
   * Implements testRegistrationWithEmailVerificationAndPassword().
   */
  public function testRegistrationWithEmailVerificationAndPassword() {
    // Register a new account.
    $edit = [];
    $edit['name'] = $name = $this->randomMachineName();
    $edit['mail'] = $mail = $edit['name'] . '@example.com';
    $edit['pass[pass1]'] = $new_pass = $this->randomMachineName();
    $edit['pass[pass2]'] = $new_pass;
    $pass = $new_pass;
    $this->drupalGet('user/register');
    $this->submitForm($edit, 'Create new account');
    $this->assertSession()->pageTextContains('A welcome message with further instructions has been sent to your email address.');

    // Load the new user.
    $accounts = \Drupal::entityQuery('user')
      ->condition('name', $name)
      ->condition('mail', $mail)
      ->condition('status', 0)
      ->accessCheck(FALSE)
      ->execute();
    /** @var \Drupal\user\UserInterface $account */
    $account = \Drupal::entityTypeManager()->getStorage('user')->load(reset($accounts));

    // Configure some timestamps.
    // We up the timestamp a bit, else the check will fail.
    // The function that checks this uses the execution time
    // and that's always larger in real-life situations
    // (and it fails correctly when you remove the + 5000).
    $requestTime = \Drupal::time()->getRequestTime();
    $timestamp = $requestTime + 5000;
    $test_timestamp = $requestTime;
    $bogus_timestamp = $requestTime - 86500;

    // Check if the account has not been activated.
    $this->assertFalse($account->isActive(), 'New account is blocked until approved via email confirmation. status check.');
    $this->assertEquals(0, $account->getLastLoginTime(), 'New account is blocked until approved via email confirmation. login check.');
    $this->assertEquals(0, $account->getLastAccessedTime(), 'New account is blocked until approved via email confirmation. access check.');

    // Login before activation.
    $auth = [
      'name' => $name,
      'pass' => $pass,
    ];
    $this->drupalGet('user/login');
    $this->submitForm($auth, 'Log in');
    $this->assertSession()->pageTextContains('The username ' . $name . ' has not been activated or is blocked.');

    // Timestamp can not be smaller than current. (== registration time).
    // If this is the case, something is really wrong.
    $this->drupalGet("user/registrationpassword/" . $account->id() . "/$test_timestamp/" . user_pass_rehash($account, $test_timestamp));
    $this->assertSession()->pageTextContains('You have tried to use a one-time login link that has either been used or is no longer valid. Please request a new one using the form below.');

    // Fake key combination.
    $this->drupalGet("user/registrationpassword/" . $account->id() . "/$timestamp/" . user_pass_rehash($account, $bogus_timestamp));
    $this->assertSession()->pageTextContains('You have tried to use a one-time login link that has either been used or is no longer valid. Please request a new one using the form below.');

    // Fake timestamp.
    $this->drupalGet("user/registrationpassword/" . $account->id() . "/$bogus_timestamp/" . user_pass_rehash($account, $timestamp));
    $this->assertSession()->pageTextContains('You have tried to use a one-time login link that has either been used or is no longer valid. Please request a new one using the form below.');

    // Wrong password.
    $account_cloned = clone $account;
    $account_cloned->setPassword('boguspass');
    $this->drupalGet("user/registrationpassword/" . $account->id() . "/$timestamp/" . user_pass_rehash($account_cloned, $timestamp));
    $this->assertSession()->pageTextContains('You have tried to use a one-time login link that has either been used or is no longer valid. Please request a new one using the form below.');

    // Other user already authenticated.
    $another_account = $this->drupalCreateUser();
    $this->drupalLogin($another_account);
    $this->drupalGet("user/registrationpassword/" . $account->id() . "/$timestamp/" . user_pass_rehash($account, $timestamp));
    $this->assertSession()->responseContains(new FormattableMarkup(
      'Another user (%other_user) is already logged into the site on this computer, but you tried to use a one-time link for user %resetting_user. Please <a href=":logout">log out</a> and try using the link again.',
      [
        '%other_user' => $another_account->getAccountName(),
        '%resetting_user' => $account->getAccountName(),
        ':logout' => Url::fromRoute('user.logout')->toString(),
      ]
    ));
    $this->drupalLogout();

    // Attempt to use the activation link.
    $this->drupalGet("user/registrationpassword/" . $account->id() . "/$timestamp/" . user_pass_rehash($account, $timestamp));
    $this->assertSession()->pageTextContains('You have just used your one-time login link. Your account is now active and you are authenticated.');

    // Attempt to use the activation link again.
    $this->drupalGet("user/registrationpassword/" . $account->id() . "/$timestamp/" . user_pass_rehash($account, $timestamp));
    $this->assertSession()->pageTextContains('You are currently authenticated as user ' . $account->getAccountName() . '.');

    // Logout the user.
    $this->drupalLogout();

    // Then attempt to use the activation link yet again.
    $this->drupalGet("user/registrationpassword/" . $account->id() . "/$timestamp/" . user_pass_rehash($account, $timestamp));
    $this->assertSession()->pageTextContains('You have tried to use a one-time login link that has either been used or is no longer valid. Please request a new one using the form below.');

    // And then try to do normal login.
    $auth = [
      'name' => $name,
      'pass' => $pass,
    ];
    $this->drupalGet('user/login');
    $this->submitForm($auth, 'Log in');
    $this->assertSession()->pageTextContains('Member for');

    // Logout the user.
    $this->drupalLogout();

    // Register a new account.
    $edit = [];
    $edit['name'] = $name = $this->randomMachineName();
    $edit['mail'] = $mail = $edit['name'] . '@example.com';
    $edit['pass[pass1]'] = $new_pass = $this->randomMachineName();
    $edit['pass[pass2]'] = $new_pass;
    $pass = $new_pass;
    $this->drupalGet('user/register');
    $this->submitForm($edit, 'Create new account');
    $this->assertSession()->pageTextContains('A welcome message with further instructions has been sent to your email address.');

    // Load the new user.
    $accounts = \Drupal::entityQuery('user')
      ->condition('name', $name)
      ->condition('mail', $mail)
      ->condition('status', 0)
      ->accessCheck(FALSE)
      ->execute();
    /** @var \Drupal\user\UserInterface $account */
    $another_account = \Drupal::entityTypeManager()->getStorage('user')->load(reset($accounts));
    $another_account_id = $another_account->id();
    $hash = user_pass_rehash($another_account, $timestamp);

    // Delete the accounts.
    $another_account->delete();

    // Attempt to use the activation link.
    $this->drupalGet("user/registrationpassword/" . $another_account_id . "/$timestamp/" . $hash);
    $this->assertSession()->pageTextContains('You have tried to use a one-time login link that has either been used or is no longer valid. Please request a new one using the form below.');
  }

  /**
   * Implements testPasswordResetFormResendActivation().
   */
  public function testPasswordResetFormResendActivation() {
    // Register a new account.
    $edit1 = [];
    $edit1['name'] = $this->randomMachineName();
    $edit1['mail'] = $edit1['name'] . '@example.com';
    $edit1['pass[pass1]'] = $new_pass = $this->randomMachineName();
    $edit1['pass[pass2]'] = $new_pass;
    $this->drupalGet('user/register');
    $this->submitForm($edit1, 'Create new account');
    $this->assertSession()->pageTextContains('A welcome message with further instructions has been sent to your email address.');

    // Request a new activation email.
    $edit2 = [];
    $edit2['name'] = $edit1['name'];
    $this->drupalGet('user/password');
    $this->submitForm($edit2, 'Submit');
    $this->assertSession()->pageTextContains('Further instructions have been sent to your email address.');

    // Request a new activation email for a non-existing user name.
    $edit3 = [];
    $edit3['name'] = $this->randomMachineName();
    $this->drupalGet('user/password');
    $this->submitForm($edit3, 'Submit');
    if (version_compare(\Drupal::VERSION, '10', '<')) {
      $this->assertSession()->pageTextContains(
        $edit3['name'] . ' is not recognized as a username or an email address.');
    }
    else {
      $this->assertSession()->pageTextContains(
        'If ' . $edit3['name'] . ' is a valid account, an email will be sent with instructions to reset your password.');
    }

    // Request a new activation email for a non-existing user email.
    $edit4 = [];
    $edit4['name'] = $this->randomMachineName() . '@example.com';
    $this->drupalGet('user/password');
    $this->submitForm($edit4, 'Submit');
    if (version_compare(\Drupal::VERSION, '10', '<')) {
      $this->assertSession()->pageTextContains(
        $edit4['name'] . ' is not recognized as a username or an email address.');
    }
    else {
      $this->assertSession()->pageTextContains(
        'If ' . $edit4['name'] . ' is a valid account, an email will be sent with instructions to reset your password.');
    }
  }

  /**
   * Implements testLoginWithUrpLinkWhileBlocked().
   */
  public function testLoginWithUrpLinkWhileBlocked() {
    $timestamp = \Drupal::time()->getRequestTime() + 5000;

    // Register a new account.
    $edit = [];
    $edit['name'] = $name = $this->randomMachineName();
    $edit['mail'] = $mail = $edit['name'] . '@example.com';
    $edit['pass[pass1]'] = $new_pass = $this->randomMachineName();
    $edit['pass[pass2]'] = $new_pass;
    $this->drupalGet('user/register');
    $this->submitForm($edit, 'Create new account');

    // Load the new user.
    $accounts = \Drupal::entityQuery('user')
      ->condition('name', $name)
      ->condition('mail', $mail)
      ->condition('status', 0)
      ->accessCheck(FALSE)
      ->execute();
    /** @var \Drupal\user\UserInterface $account */
    $account = \Drupal::entityTypeManager()->getStorage('user')->load(reset($accounts));

    // Attempt to use the activation link.
    $this->drupalGet("user/registrationpassword/" . $account->id() . "/$timestamp/" . user_pass_rehash($account, $timestamp));
    $this->assertSession()->pageTextContains('You have just used your one-time login link. Your account is now active and you are authenticated.');

    $this->drupalLogout();

    // Block the user.
    $account
      ->setLastLoginTime(\Drupal::time()->getRequestTime())
      ->block()
      ->save();

    // Then try to use the link.
    $this->drupalGet("user/registrationpassword/" . $account->id() . "/$timestamp/" . user_pass_rehash($account, $timestamp));
    $this->assertSession()->pageTextContains('You have tried to use a one-time login link that has either been used or is no longer valid. Please request a new one using the form below.');

    // Try to request a new activation email.
    $edit2['name'] = $edit['name'];
    $this->drupalGet('user/password');
    $this->submitForm($edit2, 'Submit');
    if (version_compare(\Drupal::VERSION, '10', '<')) {
      $this->assertSession()->pageTextContains(
        $edit2['name'] . ' is blocked or has not been activated yet.');
    }
    else {
      $this->assertSession()->pageTextContains(
        'If ' . $edit2['name'] . ' is a valid account, an email will be sent with instructions to reset your password.');
    }
  }

}
