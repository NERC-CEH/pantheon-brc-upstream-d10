<?php

namespace Drupal\gutenberg\Render;

use Drupal\Core\Asset\LibraryDiscoveryInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Render\RenderContext;
use Drupal\Core\Render\RendererInterface;
use Drupal\Core\Theme\ThemeInitializationInterface;
use Drupal\Core\Theme\ThemeManagerInterface;

/**
 * Renders editor previews with the default (frontend) theme.
 *
 * Returns the rendered HTML together with the content of the CSS files of the
 * attached libraries, so the editor can inline them in its canvas.
 */
class FrontendRenderer {

  /**
   * The renderer.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * The theme manager.
   *
   * @var \Drupal\Core\Theme\ThemeManagerInterface
   */
  protected $themeManager;

  /**
   * The theme initialization.
   *
   * @var \Drupal\Core\Theme\ThemeInitializationInterface
   */
  protected $themeInitialization;

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The library discovery.
   *
   * @var \Drupal\Core\Asset\LibraryDiscoveryInterface
   */
  protected $libraryDiscovery;

  /**
   * FrontendRenderer constructor.
   *
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer.
   * @param \Drupal\Core\Theme\ThemeManagerInterface $theme_manager
   *   The theme manager.
   * @param \Drupal\Core\Theme\ThemeInitializationInterface $theme_initialization
   *   The theme initialization.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   * @param \Drupal\Core\Asset\LibraryDiscoveryInterface $library_discovery
   *   The library discovery.
   */
  public function __construct(
    RendererInterface $renderer,
    ThemeManagerInterface $theme_manager,
    ThemeInitializationInterface $theme_initialization,
    ConfigFactoryInterface $config_factory,
    LibraryDiscoveryInterface $library_discovery,
  ) {
    $this->renderer = $renderer;
    $this->themeManager = $theme_manager;
    $this->themeInitialization = $theme_initialization;
    $this->configFactory = $config_factory;
    $this->libraryDiscovery = $library_discovery;
  }

  /**
   * Renders a build with the default theme.
   *
   * @param array $build
   *   The render array.
   *
   * @return array
   *   An array with the rendered 'html' and the 'css' content of the attached
   *   libraries.
   */
  public function render(array $build): array {
    $active_theme = $this->themeManager->getActiveTheme()->getName();
    $default_theme = $this->configFactory->get('system.theme')->get('default');
    $switch_theme = $default_theme && $default_theme !== $active_theme;

    if ($switch_theme) {
      $this->themeManager->setActiveTheme(
        $this->themeInitialization->initTheme($default_theme)
      );
    }

    try {
      // Render in a new context to capture attached libraries.
      $context = new RenderContext();
      $html = $this->renderer->executeInRenderContext($context, function () use (&$build) {
        return $this->renderer->render($build);
      });

      // Read CSS content from attached libraries.
      $css_content = '';
      if (!$context->isEmpty()) {
        $attachments = $context->pop()->getAttachments();
        $css_content = $this->resolveLibraryCssContent($attachments['library'] ?? []);
      }
    }
    finally {
      if ($switch_theme) {
        $this->themeManager->setActiveTheme(
          $this->themeInitialization->initTheme($active_theme)
        );
      }
    }

    return [
      'html' => (string) $html,
      'css' => $css_content,
    ];
  }

  /**
   * Reads CSS file contents from an array of library names.
   *
   * @param string[] $libraries
   *   Array of library names (e.g., ["core/components.gutenberg_base--card"]).
   *
   * @return string
   *   The concatenated CSS content from all libraries.
   */
  public function resolveLibraryCssContent(array $libraries): string {
    $css_content = '';
    $loaded_files = [];

    foreach ($libraries as $library_string) {
      $parts = explode('/', $library_string, 2);
      if (count($parts) !== 2) {
        continue;
      }
      [$extension, $name] = $parts;
      $library = $this->libraryDiscovery->getLibraryByName($extension, $name);
      if (!$library || empty($library['css'])) {
        continue;
      }
      foreach ($library['css'] as $css_file) {
        if (empty($css_file['data']) || ($css_file['type'] ?? 'file') !== 'file') {
          continue;
        }
        // Resolve the path lexically rather than with realpath(), so that
        // symlinked modules and themes are still read.
        $path = $this->normalizeRelativePath($css_file['data']);
        if ($path === NULL || !str_ends_with($path, '.css') || !is_file(DRUPAL_ROOT . '/' . $path)) {
          continue;
        }
        // Avoid duplicate file reads.
        if (in_array($path, $loaded_files, TRUE)) {
          continue;
        }
        $loaded_files[] = $path;
        $content = file_get_contents(DRUPAL_ROOT . '/' . $path);
        if ($content !== FALSE) {
          $css_content .= $this->rewriteRelativeCssUrls($content, base_path() . dirname($path) . '/') . "\n";
        }
      }
    }

    return $css_content;
  }

  /**
   * Normalizes a path relative to the Drupal root without leaving it.
   *
   * @param string $path
   *   The path (e.g., "core/../modules/custom/foo/foo.css").
   *
   * @return string|null
   *   The normalized path, or NULL if it points outside the Drupal root.
   */
  protected function normalizeRelativePath(string $path): ?string {
    $segments = [];
    foreach (explode('/', $path) as $segment) {
      if ($segment === '' || $segment === '.') {
        continue;
      }
      if ($segment === '..') {
        if (!$segments) {
          return NULL;
        }
        array_pop($segments);
        continue;
      }
      $segments[] = $segment;
    }
    return $segments ? implode('/', $segments) : NULL;
  }

  /**
   * Makes relative url() references absolute.
   *
   * The CSS is inlined in the editor, so relative URLs would otherwise resolve
   * against the editor page instead of the stylesheet.
   *
   * @param string $css
   *   The CSS content.
   * @param string $base_url
   *   The URL of the directory the stylesheet lives in, with a trailing slash.
   *
   * @return string
   *   The CSS with relative URLs prefixed with the base URL.
   */
  protected function rewriteRelativeCssUrls(string $css, string $base_url): string {
    return preg_replace_callback(
      '/url\(\s*([\'"]?)(?![a-z][a-z0-9+.-]*:|\/|#)([^\'")]+)\1\s*\)/i',
      fn ($matches) => 'url(' . $matches[1] . $base_url . $matches[2] . $matches[1] . ')',
      $css
    );
  }

}
