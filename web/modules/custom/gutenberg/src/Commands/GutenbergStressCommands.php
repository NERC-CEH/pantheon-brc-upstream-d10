<?php

namespace Drupal\gutenberg\Commands;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormBuilderInterface;
use Drupal\Core\Session\AccountSwitcherInterface;
use Drupal\gutenberg\BlocksLibraryManager;
use Drupal\gutenberg\Controller\UtilsController;
use Drupal\gutenberg\Discovery\BlockJsonDiscovery;
use Drupal\gutenberg\GutenbergLibraryManagerInterface;
use Drush\Commands\DrushCommands;
use Drupal\user\UserInterface;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\MockArraySessionStorage;
use Symfony\Component\HttpKernel\HttpKernelInterface;

/**
 * Provides Drush commands for Gutenberg stress testing.
 */
class GutenbergStressCommands extends DrushCommands {

  /**
   * Gutenberg library manager.
   */
  protected GutenbergLibraryManagerInterface $libraryManager;

  /**
   * Gutenberg blocks library manager.
   */
  protected BlocksLibraryManager $blocksLibraryManager;

  /**
   * Account switcher service.
   */
  protected AccountSwitcherInterface $accountSwitcher;

  /**
   * Drupal HTTP kernel.
   */
  protected HttpKernelInterface $httpKernel;

  /**
   * Entity type manager.
   */
  protected EntityTypeManagerInterface $entityTypeManager;

  /**
   * Request stack.
   */
  protected RequestStack $requestStack;

  /**
   * Form builder.
   */
  protected FormBuilderInterface $formBuilder;

  /**
   * Constructs the command class.
   */
  public function __construct(
    GutenbergLibraryManagerInterface $library_manager,
    BlocksLibraryManager $blocks_library_manager,
    AccountSwitcherInterface $account_switcher,
    HttpKernelInterface $http_kernel,
    EntityTypeManagerInterface $entity_type_manager,
    RequestStack $request_stack,
    FormBuilderInterface $form_builder,
  ) {
    parent::__construct();
    $this->libraryManager = $library_manager;
    $this->blocksLibraryManager = $blocks_library_manager;
    $this->accountSwitcher = $account_switcher;
    $this->httpKernel = $http_kernel;
    $this->entityTypeManager = $entity_type_manager;
    $this->requestStack = $request_stack;
    $this->formBuilder = $form_builder;
  }

  /**
   * Stress the Gutenberg discovery and settings building process.
   *
   * @command gutenberg:stress
   * @option iterations The number of measured iterations to run (default 20).
   * @option warm The number of warm-up iterations to ignore in the report (default 2).
   * @option clear-cache Rebuild plugin caches on every iteration (default TRUE).
   * @option sleep Delay in milliseconds between iterations.
   * @option report Either "table" or "json".
   * @option route A relative path (e.g. /node/add/page) to hit after each discovery run.
   * @option route-count Number of times to request the configured route per iteration (default 1).
   * @usage drush gutenberg:stress --iterations=50 --clear-cache=1
   */
  public function stress(
    array $options = [
      'iterations' => 20,
      'warm' => 2,
      'clear-cache' => TRUE,
      'sleep' => 0,
      'report' => 'table',
      'route' => '',
      'route-count' => 1,
    ],
  ) : int {
    $options += [
      'iterations' => 20,
      'warm' => 2,
      'clear-cache' => TRUE,
      'sleep' => 0,
      'report' => 'table',
      'route' => '',
      'route-count' => 1,
    ];

    $iterations = max(1, (int) $options['iterations']);
    $warmUps = max(0, (int) $options['warm']);
    $clearCache = $this->convertToBoolean($options['clear-cache']);
    $sleepMs = max(0, (int) $options['sleep']);
    $reportType = strtolower((string) $options['report']);
    $routePath = trim((string) $options['route']);
    $routeCount = max(0, (int) $options['route-count']);

    if (!in_array($reportType, ['table', 'json'], TRUE)) {
      $this->logger()->warning(dt('Unknown report type @type, falling back to table output.', ['@type' => $reportType]));
      $reportType = 'table';
    }

    $this->io()->title('Gutenberg stress test');
    $routeStatus = $routePath !== '' ? $routePath . ' x' . $routeCount : 'disabled';
    $this->io()->writeln('warm-ups: ' . $warmUps . ' | iterations: ' . $iterations . ' | clear cache: ' . ($clearCache ? 'yes' : 'no') . ' | route: ' . $routeStatus);

    $results = [];
    $totalRuns = $warmUps + $iterations;

    for ($i = 1; $i <= $totalRuns; $i++) {
      $isWarm = $i <= $warmUps;
      $label = $isWarm ? "Warm-up #$i" : 'Run #' . ($i - $warmUps);

      $this->drupalStaticReset();

      if ($clearCache) {
        $this->libraryManager->clearCachedDefinitions();
        $this->blocksLibraryManager->clearCachedDefinitions();
        $this->formBuilder->resetCache();
      }

      $beforeUsage = memory_get_usage(TRUE);
      $beforePeak = memory_get_peak_usage(TRUE);
      $startTime = microtime(TRUE);

      try {
        $definitions = $this->libraryManager->getDefinitions();
        $definitionsByExtension = $this->libraryManager->getDefinitionsByExtension();
        $moduleDefinitions = $this->libraryManager->getModuleDefinitions();
        $themeDefinitions = $this->libraryManager->getThemeDefinitions();
        $activeThemeDefinitions = $this->libraryManager->getActiveThemeDefinitions();
        $activeThemeDefinition = $this->libraryManager->getActiveThemeMergedDefinition();
        $this->libraryManager->generatePresetStylesheet();
        $blocksDefinitions = $this->loadBlockDefinitions();
        $routeMetrics = $this->stressRoute($routePath, $routeCount);
        UtilsController::getBlocksSettings();
        UtilsController::getAllowedBlocks();
        UtilsController::getAllowedCustomBlocks();
      }
      catch (\Throwable $throwable) {
        $this->logger()->error(dt('Iteration failed with message: @message', ['@message' => $throwable->getMessage()]));
        return self::EXIT_FAILURE;
      }

      $duration = microtime(TRUE) - $startTime;
      $memoryDelta = memory_get_usage(TRUE) - $beforeUsage;
      $peakDelta = memory_get_peak_usage(TRUE) - $beforePeak;
      $definitionSize = strlen(serialize($definitions));
      $mergedSize = strlen(serialize($activeThemeDefinition));
      $blocksSize = strlen(serialize($blocksDefinitions));
      $definitionsCount = count($definitions);
      $definitionsByExtensionCount = array_sum(array_map('count', $definitionsByExtension));
      $moduleDefinitionsCount = count($moduleDefinitions);
      $themeDefinitionsCount = count($themeDefinitions);
      $activeThemeDefinitionsCount = count($activeThemeDefinitions);
      $routeDuration = $routeMetrics['duration'] ?? 0;
      $routeRequests = $routeMetrics['requests'] ?? 0;
      $routeFailures = $routeMetrics['failures'] ?? 0;

      $metrics = [
        'label' => $label,
        'duration' => $duration,
        'memory_delta' => $memoryDelta,
        'peak_delta' => $peakDelta,
        'definition_size' => $definitionSize,
        'merged_size' => $mergedSize,
        'blocks_size' => $blocksSize,
        'definitions_count' => $definitionsCount,
        'definitions_by_extension_count' => $definitionsByExtensionCount,
        'module_definitions_count' => $moduleDefinitionsCount,
        'theme_definitions_count' => $themeDefinitionsCount,
        'active_theme_definitions_count' => $activeThemeDefinitionsCount,
        'route_duration' => $routeDuration,
        'route_requests' => $routeRequests,
        'route_failures' => $routeFailures,
      ];

      $this->writeIterationLine($metrics, $isWarm);

      if (!$isWarm) {
        $results[] = $metrics;
      }

      if ($sleepMs > 0 && $i < $totalRuns) {
        usleep($sleepMs * 1000);
      }
    }

    if (empty($results)) {
      $this->io()->warning('No measured iterations to report.');
      return self::EXIT_SUCCESS;
    }

    $this->renderReport($results, $reportType);
    return self::EXIT_SUCCESS;
  }

  /**
   * Render the aggregated report.
   */
  protected function renderReport(array $results, string $reportType) : void {
    $summary = $this->summarize($results);

    if ($reportType === 'json') {
      $payload = [
        'iterations' => count($results),
        'summary' => $summary,
        'runs' => $results,
      ];
      $this->output()->writeln(json_encode($payload, JSON_PRETTY_PRINT));
      return;
    }

    $table = new Table($this->output());
    $table->setHeaders(['metric', 'avg', 'min', 'max']);
    $rows = [
      [
        'duration (s)',
        $this->formatNumber($summary['duration']['avg'], 4),
        $this->formatNumber($summary['duration']['min'], 4),
        $this->formatNumber($summary['duration']['max'], 4),
      ],
      [
        'memory delta',
        $this->formatBytes($summary['memory_delta']['avg']),
        $this->formatBytes($summary['memory_delta']['min']),
        $this->formatBytes($summary['memory_delta']['max']),
      ],
      [
        'peak delta',
        $this->formatBytes($summary['peak_delta']['avg']),
        $this->formatBytes($summary['peak_delta']['min']),
        $this->formatBytes($summary['peak_delta']['max']),
      ],
      [
        'definitions size',
        $this->formatBytes($summary['definition_size']['avg']),
        $this->formatBytes($summary['definition_size']['min']),
        $this->formatBytes($summary['definition_size']['max']),
      ],
      [
        'merged size',
        $this->formatBytes($summary['merged_size']['avg']),
        $this->formatBytes($summary['merged_size']['min']),
        $this->formatBytes($summary['merged_size']['max']),
      ],
      [
        'blocks size',
        $this->formatBytes($summary['blocks_size']['avg']),
        $this->formatBytes($summary['blocks_size']['min']),
        $this->formatBytes($summary['blocks_size']['max']),
      ],
      [
        'definitions (count)',
        $this->formatNumber($summary['definitions_count']['avg'], 0),
        $this->formatNumber($summary['definitions_count']['min'], 0),
        $this->formatNumber($summary['definitions_count']['max'], 0),
      ],
      [
        'definitions by extension (count)',
        $this->formatNumber($summary['definitions_by_extension_count']['avg'], 0),
        $this->formatNumber($summary['definitions_by_extension_count']['min'], 0),
        $this->formatNumber($summary['definitions_by_extension_count']['max'], 0),
      ],
      [
        'module definitions (count)',
        $this->formatNumber($summary['module_definitions_count']['avg'], 0),
        $this->formatNumber($summary['module_definitions_count']['min'], 0),
        $this->formatNumber($summary['module_definitions_count']['max'], 0),
      ],
      [
        'theme definitions (count)',
        $this->formatNumber($summary['theme_definitions_count']['avg'], 0),
        $this->formatNumber($summary['theme_definitions_count']['min'], 0),
        $this->formatNumber($summary['theme_definitions_count']['max'], 0),
      ],
      [
        'active theme definitions (count)',
        $this->formatNumber($summary['active_theme_definitions_count']['avg'], 0),
        $this->formatNumber($summary['active_theme_definitions_count']['min'], 0),
        $this->formatNumber($summary['active_theme_definitions_count']['max'], 0),
      ],
    ];

    $routeRequestsTotal = array_sum(array_column($results, 'route_requests'));
    if ($routeRequestsTotal > 0) {
      $rows[] = [
        'route duration (s)',
        $this->formatNumber($summary['route_duration']['avg'], 4),
        $this->formatNumber($summary['route_duration']['min'], 4),
        $this->formatNumber($summary['route_duration']['max'], 4),
      ];
      $rows[] = [
        'route failures (count)',
        $this->formatNumber($summary['route_failures']['avg'], 0),
        $this->formatNumber($summary['route_failures']['min'], 0),
        $this->formatNumber($summary['route_failures']['max'], 0),
      ];
      $rows[] = [
        'route requests (count)',
        $this->formatNumber($summary['route_requests']['avg'], 0),
        $this->formatNumber($summary['route_requests']['min'], 0),
        $this->formatNumber($summary['route_requests']['max'], 0),
      ];
    }

    $table->addRows($rows);
    $table->render();
  }

  /**
   * Print a short line per iteration.
   */
  protected function writeIterationLine(array $metrics, bool $isWarm) : void {
    $line = sprintf(
      '%s | %.3fs | Δmem %s | Δpeak %s',
      $metrics['label'],
      $metrics['duration'],
      $this->formatBytes($metrics['memory_delta']),
      $this->formatBytes($metrics['peak_delta'])
    );
    if (!empty($metrics['route_requests'])) {
      $line .= sprintf(
        ' | route %.3fs (%d/%d fails)',
        $metrics['route_duration'],
        $metrics['route_failures'],
        $metrics['route_requests']
      );
    }
    $this->output()->writeln($line);
  }

  /**
   * Build aggregated metrics for reporting.
   */
  protected function summarize(array $results) : array {
    $summary = [];
    $keys = [
      'duration',
      'memory_delta',
      'peak_delta',
      'definition_size',
      'merged_size',
      'blocks_size',
      'definitions_count',
      'definitions_by_extension_count',
      'module_definitions_count',
      'theme_definitions_count',
      'active_theme_definitions_count',
      'route_duration',
      'route_failures',
      'route_requests',
    ];
    foreach ($keys as $key) {
      $values = array_column($results, $key);
      $summary[$key] = [
        'avg' => array_sum($values) / count($values),
        'min' => min($values),
        'max' => max($values),
      ];
    }
    return $summary;
  }

  /**
   * Exercise a full page request for the configured route.
   */
  protected function stressRoute(string $path, int $count) : array {
    if ($path === '' || $count <= 0) {
      return [
        'duration' => 0.0,
        'requests' => 0,
        'failures' => 0,
      ];
    }

    $storage = $this->entityTypeManager->getStorage('user');
    $account = $storage->load(1);
    if (!$account instanceof UserInterface) {
      throw new \RuntimeException('Unable to load user 1 for route stress testing.');
    }

    $requests = 0;
    $failures = 0;
    $durationTotal = 0.0;

    $this->accountSwitcher->switchTo($account);

    try {
      for ($i = 0; $i < $count; $i++) {
        $requests++;
        $server = $this->buildServerGlobals($path);
        $request = Request::create($path, 'GET', [], [], [], $server);
        $session = new Session(new MockArraySessionStorage());
        $session->start();
        $request->setSession($session);
        $this->requestStack->push($request);

        $response = NULL;
        try {
          $start = microtime(TRUE);
          $response = $this->httpKernel->handle($request, HttpKernelInterface::MAIN_REQUEST, FALSE);
          $durationTotal += microtime(TRUE) - $start;
          if ($response->getStatusCode() >= 400) {
            $failures++;
            $this->logger()->warning(dt('Route @path returned HTTP @code during stress run.', [
              '@path' => $path,
              '@code' => $response->getStatusCode(),
            ]));
          }
        }
        catch (\Throwable $throwable) {
          $failures++;
          $this->logger()->error(dt('Route @path failed during stress run: @message', [
            '@path' => $path,
            '@message' => $throwable->getMessage(),
          ]));
        }
        finally {
          if ($response) {
            $this->httpKernel->terminate($request, $response);
          }
          $this->requestStack->pop();
        }
      }
    }
    finally {
      $this->accountSwitcher->switchBack();
    }

    return [
      'duration' => $durationTotal,
      'requests' => $requests,
      'failures' => $failures,
    ];
  }

  /**
   * Build server globals for synthetic HTTP requests.
   */
  protected function buildServerGlobals(string $path) : array {
    $root = \Drupal::root();
    return [
      'HTTP_HOST' => 'localhost',
      'SERVER_NAME' => 'localhost',
      'SERVER_PORT' => 80,
      'REQUEST_URI' => $path,
      'REQUEST_METHOD' => 'GET',
      'SCRIPT_NAME' => '/index.php',
      'SCRIPT_FILENAME' => $root . '/index.php',
      'REMOTE_ADDR' => '127.0.0.1',
    ];
  }

  /**
   * Load the block library definitions.
   */
  protected function loadBlockDefinitions() : array {
    $moduleHandler = \Drupal::service('module_handler');
    $module = $moduleHandler->getModule('gutenberg');
    if (!$module) {
      return [];
    }

    $directories = ['gutenberg' => \Drupal::root() . '/' . $module->getPath()];
    $discovery = new BlockJsonDiscovery($directories);
    return $discovery->findAll();
  }

  /**
   * Reset drupal_static caches used by the helpers we call.
   */
  protected function drupalStaticReset() : void {
    drupal_static_reset('Drupal\\gutenberg\\Controller\\UtilsController::getBlocksSettings');
    drupal_static_reset('Drupal\\gutenberg\\Controller\\UtilsController::getAllowedBlocks');
    drupal_static_reset('Drupal\\gutenberg\\Controller\\UtilsController::getAllowedCustomBlocks');
  }

  /**
   * Format bytes as human readable string.
   */
  protected function formatBytes(float $bytes, int $base = 1024) : string {
    $negative = $bytes < 0;
    $bytes = abs($bytes);
    $units = ['B', 'KB', 'MB', 'GB'];
    $i = 0;
    while ($bytes >= $base && $i < count($units) - 1) {
      $bytes /= $base;
      $i++;
    }
    $formatted = ($negative ? '-' : '') . number_format($bytes, $i === 0 ? 0 : 2) . $units[$i];
    return $formatted;
  }

  /**
   * Format numbers with a fixed precision.
   */
  protected function formatNumber(float $value, int $precision = 2) : string {
    return number_format($value, $precision);
  }

  /**
   * Cast option input to bool.
   */
  protected function convertToBoolean($value) : bool {
    if (is_bool($value)) {
      return $value;
    }
    $value = strtolower((string) $value);
    return in_array($value, ['1', 'true', 'yes', 'on'], TRUE);
  }

}
