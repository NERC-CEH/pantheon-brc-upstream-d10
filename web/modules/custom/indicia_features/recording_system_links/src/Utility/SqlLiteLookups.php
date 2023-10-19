<?php

namespace Drupal\recording_system_links\Utility;

use Drupal\Core\Site\Settings;

/**
 * Utility class for the SQLLite database that handles lookup mapping data.
 */
class SqlLiteLookups {

  private $pdo;

  /**
   * Gets a connection to the SQLLite database.
   *
   * @return \PDO
   *   Database connection.
   */
  public function getDatabase() {
    $folder = Settings::get('file_private_path') . '/recording_system_links';
    if (!file_exists($folder)) {
      mkdir($folder);
    }
    $this->pdo = new \PDO("sqlite:$folder/lookups.sqlite", NULL, NULL, [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]);
    return $this->pdo;
  }

  /**
   * On uninstall, cleanup the data folder.
   */
  public function cleanupDatabaseFolder() {
    $folder = Settings::get('file_private_path') . '/recording_system_links';
    $this->delTree($folder);
  }

  /**
   * List all the lookup mapping tables in SQLLite.
   */
  public function listTables() {
    $this->checkConnected();
    $stmt = $this->pdo->query("SELECT * FROM sqlite_master WHERE type = 'table'");
    $tables = [];
    while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
      $tables[] = $row['tbl_name'];
    }
    return $tables;
  }

  /**
   * Creates a new lookup table if it doesn't exist.
   *
   * @param string $tableName
   *   Name of the table to create.
   */
  public function addLookupTable($tableName) {
    $this->checkConnected();
    $existing = $this->listTables();
    if (!in_array($tableName, $existing)) {
      $this->pdo->exec("CREATE TABLE $tableName(map_from TEXT PRIMARY KEY, map_to TEXT)");
    }
  }

  /**
   * Counts the value mappings in a mapping table.
   *
   * @param string $tableName
   *   Name of the table.
   *
   * @return int
   *   Count of value mappings in the table.
   */
  public function countMappings($tableName) {
    $stmt = $this->pdo->query("SELECT count(*) AS count FROM $tableName");
    $row = $stmt->fetch(\PDO::FETCH_ASSOC);
    return $row['count'];
  }

  /**
   * Import a text area's content into a mappings table.
   *
   * @param string $tableName
   *   Name of the table to import into.
   * @param string $text
   *   Text rows containing key=value mapping data.
   */
  public function importMappings($tableName, $text) {
    $this->checkConnected();
    $stmt = $this->pdo->prepare("INSERT INTO $tableName(map_from, map_to) VALUES(:map_from, :map_to)");
    $map_from = NULL;
    $map_to = NULL;
    $stmt->bindParam(':map_from', $map_from);
    $stmt->bindParam(':map_to', $map_to);
    iform_load_helpers(['helper_base']);
    $rows = \helper_base::explode_lines_key_value_pairs($text);
    foreach ($rows as $key => $value) {
      $map_from = $key;
      $map_to = $value;
      $stmt->execute();
    }
  }

  /**
   * Clear existing mappings from a mappings table.
   *
   * @param string $tableName
   *   Name of the table to import into.
   */
  public function clearMappings($tableName) {
    $this->checkConnected();
    $this->pdo->exec("DELETE FROM $tableName");
  }

  /**
   * Lookup a mapping value.
   *
   * @param string $tableName
   *   Name of the table to lookup the value from.
   * @param string $fromValue
   *   Value to lookup (as supplied by the remote system).
   *
   * @return string
   *   Value mapped as required by the Indicia warehouse, or NULL if no mapping.
   */
  public function lookup($tableName, $fromValue) {
    $this->checkConnected();
    $stmt = $this->pdo->query("SELECT * FROM $tableName WHERE map_from = '$fromValue'");
    $row = $stmt->fetch((\PDO::FETCH_ASSOC));
    if ($row) {
      return $row['map_to'];
    }
    else {
      return NULL;
    }
  }

  /**
   * Check that connection established before any operations.
   */
  private function checkConnected() {
    if (!isset($this->pdo)) {
      throw new \Exception('SQLLite connection not established');
    }
  }

  /**
   * Recursive folder deletion.
   *
   * @param string $dir
   *   Folder to delete.
   */
  private function delTree($dir) {
    $files = array_diff(scandir($dir), ['.', '..']);
    foreach ($files as $file) {
      (is_dir("$dir/$file")) ? $this->delTree("$dir/$file") : unlink("$dir/$file");
    }
    return rmdir($dir);
  }

}
