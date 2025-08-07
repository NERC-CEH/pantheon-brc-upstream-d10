<?php

namespace Drupal\Tests\responsivewrappers\Functional;

use Drupal\filter\Entity\FilterFormat;
use Drupal\Tests\BrowserTestBase;

/**
 * Provides a class for responsivewrappers functional tests.
 *
 * @group responsivewrappers
 */
class ResponsiveWrappersTest extends BrowserTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'field',
    'node',
    'responsivewrappers',
    'text',
    'user',
  ];

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * The user.
   *
   * @var \Drupal\user\UserInterface
   */
  protected $user;

  /**
   * The node content.
   *
   * @var \Drupal\node\NodeInterface
   */
  protected $node;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->user = $this->drupalCreateUser([
      'access content',
      'access administration pages',
      'administer filters',
    ]);

    FilterFormat::create([
      'format' => 'full_html',
      'name' => 'Full HTML',
      'weight' => 1,
      'filters' => [],
    ])->save();

    $this->drupalCreateContentType([
      'type' => 'page',
      'name' => 'Basic Page',
    ]);

    $this->node = $this->drupalCreateNode([
      'type' => 'page',
      'title' => 'Responsive filter test',
      'body' => [
        'value' => '<img scr="#" /><table></table><iframe src="https://www.youtube.com/embed/"></iframe><iframe src="https://player.vimeo.com/video/"></iframe>',
        'format' => 'full_html',
      ],
    ]);

    $this->drupalLogin($this->user);
  }

  /**
   * Tests responsive wrappers filter content output.
   */
  public function testsFilterContentOutput() {
    // Tests the node output without responsive wrappers filter enabled.
    $this->drupalGet('node/' . $this->node->id());
    $this->assertSession()->statusCodeEquals(200);
    $this->assertSession()->responseContains('<img scr="#" />');
    $this->assertSession()->responseContains('<table></table>');
    $this->assertSession()->responseContains('<iframe src="https://www.youtube.com/embed/"></iframe>');
    $this->assertSession()->responseContains('<iframe src="https://player.vimeo.com/video/"></iframe>');

    // Enable the responsive wrappers filter.
    $this->drupalGet('admin/config/content/formats/manage/full_html');
    $edit = [
      'filters[filter_bootstrap_responsive_wrapper][status]' => TRUE,
      'filters[filter_bootstrap_responsive_wrapper][settings][responsive_iframe]' => TRUE,
      'filters[filter_bootstrap_responsive_wrapper][settings][responsive_table]' => TRUE,
      'filters[filter_bootstrap_responsive_wrapper][settings][responsive_image]' => TRUE,
    ];
    $this->submitForm($edit, 'Save configuration');

    // Tests the node output with responsive wrappers filter enabled. Bootstrap
    // 4 output by default.
    $this->drupalGet('node/' . $this->node->id());
    $this->assertSession()->statusCodeEquals(200);
    $this->assertSession()->responseContains('<img scr="#" class="img-fluid" />');
    $this->assertSession()->responseContains('<div class="table-responsive"><table class="table"></table></div>');
    $this->assertSession()->responseContains('<div class="embed-responsive embed-responsive-16by9"><iframe src="https://www.youtube.com/embed/" class="embed-responsive-item"></iframe></div>');
    $this->assertSession()->responseContains('<div class="embed-responsive embed-responsive-16by9"><iframe src="https://player.vimeo.com/video/" class="embed-responsive-item"></iframe></div>');

    // Set Bootstrap 3 output.
    $this->drupalGet('admin/config/content/responsivewrappers');
    $this->submitForm(['version' => 3], 'Save configuration');
    // Update node to apply new filter settings.
    $this->node->setTitle('Responsive filter test B3');
    $this->node->save();
    // Tests Bootstrap 3 output.
    $this->drupalGet('node/' . $this->node->id());
    $this->assertSession()->statusCodeEquals(200);
    $this->assertSession()->responseContains('<img scr="#" class="img-responsive" />');

    // Set Bootstrap 5 output.
    $this->drupalGet('admin/config/content/responsivewrappers');
    $this->submitForm(['version' => 5], 'Save configuration');
    // Update node to apply new filter settings.
    $this->node->setTitle('Responsive filter test B5');
    $this->node->save();
    // Tests Bootstrap 5 output.
    $this->drupalGet('node/' . $this->node->id());
    $this->assertSession()->statusCodeEquals(200);
    $this->assertSession()->responseContains('<img scr="#" class="img-fluid" />');

    // Set Custom image class.
    $this->drupalGet('admin/config/content/responsivewrappers');
    $this->submitForm(['version' => 0, 'image_class' => 'holi'], 'Save configuration');
    // Update node to apply new filter settings.
    $this->node->setTitle('Responsive filter test Custom');
    $this->node->save();
    // Tests Custom image class output.
    $this->drupalGet('node/' . $this->node->id());
    $this->assertSession()->statusCodeEquals(200);
    $this->assertSession()->responseContains('<img scr="#" class="holi" />');
  }

}
