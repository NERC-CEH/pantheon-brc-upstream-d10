<?php

/**
 * @file
 * Contains \Drupal\locations_shp_importer\Form\ImportOptionsForm.
 */

namespace Drupal\locations_shp_importer\Form;


// dBase file parsing classes.
require __DIR__ . '/../../lib/php-xbase/src/XBase/Memo.php';
require __DIR__ . '/../../lib/php-xbase/src/XBase/Table.php';
require __DIR__ . '/../../lib/php-xbase/src/XBase/Column.php';
require __DIR__ . '/../../lib/php-xbase/src/XBase/Record.php';

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use XBase\Table;
use XBase\Record;

/**
 * Implements a form for importing from SHP file.
 */
class ImportOptionsForm extends FormBase {

  private $wkt;

  private $nameCodeCombinations;

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'locations_shp_importer_import_options_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, $path = NULL, $file = NULL, $extscase = 'lower') {
    $form = [];
    $basefile = \Drupal::service('file_system')->realpath("public://locations_shp_importer/$path") . DIRECTORY_SEPARATOR . $file;
    $dbfExt = $extscase === 'upper' ? 'DBF' : 'dbf';
    try {
      $dBaseTable = new Table("$basefile.$dbfExt");
    }
    catch (\Exception $e) {
      $this->messenger()->addError($this->t('Unable to open DBF file.'));
      $this->messenger()->addError($e->getMessage());
      return;
    }
    $columns = array_combine(array_keys($dBaseTable->getColumns()), array_keys($dBaseTable->getColumns()));
    $locationTypes = $this->getLocationTypes();

    global $indicia_templates;
    $existingInstruct = str_replace(
      '{message}',
      $this->t('If you are uploading a shp file with a replacement or duplicate of an existing site, selected from one of the folowing options.'),
      $indicia_templates['messageBox']
    );
    $multipleInstruct = str_replace(
      '{message}',
      $this->t('Is the shp file you are uploading for a site with multiple polygons i.e is not one contiguous area? If so select from one of the following options.'),
      $indicia_templates['messageBox']
    );

    $form['basefile'] = [
      '#type' => 'hidden',
      '#value' => $basefile,
    ];
    $form['extscase'] = [
      '#type' => 'hidden',
      '#value' => $extscase,
    ];
    // @todo List of options more comprehensive, or use Indicia settings.
    $form['srid'] = [
      '#title' => $this->t('Projection'),
      '#description' => $this->t('Projection used in the SHP file polygons.'),
      '#type' => 'select',
      '#options' => [
        27700 => $this->t('OSGB Easting Northing'),
        4326 => $this->t('WGS84 (GPS lat long)'),
      ],
      '#empty_option' => $this->t('- Please select -'),
      '#required' => TRUE,
    ];
    $form['name_column'] = [
      '#title' => $this->t('Name attribute'),
      '#description' => $this->t('Attribute to use for the location name.'),
      '#type' => 'select',
      '#options' => $columns,
      '#empty_option' => $this->t('- Please select -'),
      '#required' => TRUE,
    ];
    $form['code_column'] = [
      '#title' => $this->t('Code attribute'),
      '#description' => $this->t('Optional attribute to use for the location code.'),
      '#type' => 'select',
      '#options' => $columns,
      '#empty_option' => $this->t('- Please select -'),
    ];
    $form['existing_fieldset'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Existing sites'),
    ];
    $duplicateOptions = $this->getDuplicateHandlingOptions();
    if (count($duplicateOptions) > 1) {
      $form['existing_fieldset']['existing_instruct'] = [
        '#markup' => $existingInstruct,
      ];
      $form['existing_fieldset']['existing'] = [
        '#title' => $this->t('Behaviour for existing locations with same name and code'),
        '#type' => 'radios',
        '#options' => $this->getDuplicateHandlingOptions(),
        '#required' => TRUE,
      ];
    }
    else {
      // Only 1 possible option for duplicate handling, so output the option
      // value as a hidden.
      $form['existing_fieldset']['existing'] = [
        '#type' => 'hidden',
        '#value' => array_keys($duplicateOptions)[0],
      ];
      $optionDescription = array_values($duplicateOptions)[0];
      // Label doesn't need the additional information in the following
      // paragraph.
      $label = explode('<p>', $optionDescription)[0];
      $form['existing_fieldset']['existing_info'] = [
        '#markup' => '<p>' . $this->t('Locations will be imported using the following method of handling duplicates') . ':</p><p class="alert alert-info">' . $label . '</p>',
      ];
    }
    $form['multiple_fieldset'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Multiple polygons'),
    ];
    $form['multiple_fieldset']['multiple_instruct'] = [
      '#markup' => $multipleInstruct,
    ];
    $form['multiple_fieldset']['multiple'] = [
      '#title' => $this->t('Behaviour for multiple polygons with same name and code in imported data'),
      '#type' => 'radios',
      '#options' => [
        'combine' => $this->t('Combine to make a single location.'),
        'separate' => $this->t('Create separate locations with unique names.'),
      ],
      '#required' => TRUE,
      '#default_value' => 'combine',
    ];
    $form['location_type_id'] = [
      '#title' => $this->t('Location type'),
      '#description' => $this->t('Location type assigned to all imported locations.'),
      '#type' => 'select',
      '#options' => $locationTypes,
      '#empty_option' => $this->t('- Please select -'),
      '#required' => TRUE,
    ];
    $form['notice'] = [
      '#markup' => '<div class="alert alert-warning">' .
        $this->t('If you are importing multiple locations, please note that they may take a few minutes to import. If you need to import more than around 50 boundaries at a time then please separate them into several SHP file sets.') .
        '</div>',
    ];
    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Create locations'),
      '#required' => TRUE,
    ];
    return $form;
  }

  /**
   * Retrieve available location type terms from the warehouse.
   *
   * @return array
   *   Associative array of term IDs and terms.
   */
  private function getLocationTypes() {
    $locationTypes = [];
    $conn = iform_get_connection_details();
    iform_load_helpers([]);
    $readAuth = \helper_base::get_read_auth($conn['website_id'], $conn['password']);
    $config = $this->config('locations_shp_importer.settings');
    $params = [
      'view' => 'cache',
      'termlist_title' => 'Location types',
      'orderby' => 'sort_order,term',
    ];
    if (!empty(trim($config->get('location_type_terms')))) {
      $params['query'] = json_encode(['in' => ['term' => \helper_base::explode_lines($config->get('location_type_terms'))]]);
    }
    $typeData = \helper_base::get_population_data([
      'table' => 'termlists_term',
      'extraParams' => $readAuth + $params,
    ]);
    foreach ($typeData as $type) {
      $locationTypes[$type['id']] = $type['term'];
    }
    return $locationTypes;
  }

  /**
   * Retrieve the options available for handling duplicates, as per config.
   *
   * @return array
   *   Associative array of options.
   */
  private function getDuplicateHandlingOptions() {
    $options = [
      'ignore_new' => $this->t('Ignore the new location.') . '<p>' . $this->t('Select this if your shp file upload has multiple site boundaries, and the duplicate site is not a replacement.') . '</p>',
      'update_boundary' => $this->t('Update the existing location with the imported location boundary.') . '<p>' . $this->t('Select this if the duplicate site boundary is an update to an existing site.') . '</p>',
      'always_new' => $this->t('Always treat the imported location as new, giving it a unique name.') . '<p>' . $this->t('Select this if the site boundary is a duplicate, but you wish to keep it as separate/unique to the original - not recommended.') . '</p>',
    ];
    $config = $this->config('locations_shp_importer.settings');
    $existingOptions = $config->get('existing_options');
    if ($existingOptions) {
      $options = array_intersect_key($options, array_combine(array_values($existingOptions), array_values($existingOptions)));
    }
    return $options;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    iform_load_helpers(['data_entry_helper', 'submission_builder']);
    // Get options form values.
    $options = $form_state->cleanValues()->getValues();
    $conn = iform_get_connection_details();
    $auth = \helper_base::get_read_write_auth($conn['website_id'], $conn['password']);
    $dbfExt = $options['extscase'] === 'upper' ? 'DBF' : 'dbf';
    if (!file_exists("$options[basefile].$dbfExt")) {
      $this->messenger()->addError('dBase file not found');
      return;
    }
    $this->getNameCodeCombinationsFromImport($options);
    $this->getExistingMatchingLocations($options, $auth['read']);
    foreach ($this->nameCodeCombinations as $key => $info) {
      $tokens = explode('||', $key);
      $locationName = $tokens[0];
      $locationCode = count($tokens) > 1 ? $tokens[1] : NULL;
      if (count($info['existing']) > 1 && $options['existing'] === 'update_boundary') {
        $this->messenger()->addWarning($this->t('Multiple locations named @name found on the warehouse so this location was not imported.',
          ['@name' => $locationName]));
        continue;
      }
      if (count($info['existing']) > 0 && $options['existing'] === 'ignore_new') {
        $this->messenger()->addWarning($this->t('Location @name found on the warehouse so the matching location in the import file was ignored.',
          ['@name' => $locationName]));
        continue;
      }
      if (count($info['existing']) > 0 && $options['existing'] === 'always_new') {
        // Make name unique to avoid clash.
        $locationName .= ' ' . uniqid();
      }
      $firstIdInsertedForSet = NULL;
      foreach ($info['wkt'] as $idx => $wkt) {
        $data = [
          'location:name' => $locationName,
          'location:code' => $locationCode,
          'location:boundary_geom' => $wkt,
          'location:location_type_id' => $options['location_type_id'],
          'metaFields:srid' => $options['srid'],
        ];
        if (count($info['wkt']) > 1) {
          if ($options['multiple'] === 'separate') {
            // Multiple boundaries to keep separate, so give unique name.
            $data['location:name'] .= " - $idx";
          }
          elseif ($idx > 0) {
            // Tell warehouse to merge subsequent rows into first.
            $data['location:id'] = $firstIdInsertedForSet;
            $data['metaFields:mergeBoundary'] = 't';
          }
        }
        // Overwrite existing if relevant.
        if (count($info['existing']) > 0 && $options['existing'] === 'update_boundary') {
          // Update existing boundary if appropriate.
          $data['location:id'] = $info['existing'][0]['id'];
        }
        $structure = [
          'model' => 'location',
          'metaFields' => ['srid', 'mergeBoundary'],
        ];
        // New locations need to be linked to the website.
        if (empty($data['location:id'])) {
          $data['locations_website:website_id'] = $conn['website_id'];
          $structure['subModels'] = [
            'locations_website' => [
              'fk' => 'location_id',
            ],
          ];
        }
        $s = \submission_builder::build_submission($data, $structure);
        $r = \data_entry_helper::forward_post_to('save', $s, $auth['write_tokens'] + ['persist_auth' => TRUE]);
        if (isset($r['success'])) {
          $this->messenger()->addMessage($this->t('Location @name created.', ['@name' => $locationName]));
          if ($idx === 0) {
            $firstIdInsertedForSet = $r['outer_id'];
          }
        }
        else {
          $this->messenger()->addError($this->t('Creating location @name failed.', ['@name' => $locationName]));
          \Drupal::logger('locations_shp_importer')->error(var_export($r, TRUE));
        }
      }
    }
    $this->messenger()->addMessage($this->t('Locations import completed.'));
    $form_state->setRedirect('locations_shp_importer.import');
  }

  /**
   * Builds an associative array of locations with WKT polygon data.
   *
   * Locations are keyed by name and optional code. WKT data is grouped into
   * each unique combination of name/code.
   *
   * @param array $options
   *   Form options.
   */
  private function getNameCodeCombinationsFromImport(array $options) {
    $dbfExt = $options['extscase'] === 'upper' ? 'DBF' : 'dbf';
    $shpExt = $options['extscase'] === 'upper' ? 'SHP' : 'shp';
    try {
      $dBaseTable = new Table("$options[basefile].$dbfExt");
    }
    catch (\Exception $e) {
      $this->messenger()->addError('Could not open dBase file');
      $this->messenger()->addError($e->getMessage());
      return;
    }
    // Read next polygon.
    $handle = fopen("$options[basefile].$shpExt", 'rb');
    $this->nameCodeCombinations = [];
    // Don't care about file header: jump direct to records.
    fseek($handle, 100, SEEK_SET);
    while ($record = $dBaseTable->nextRecord()) {
      $key = $this->getDbaseRecordFieldValue($record, $options['name_column']);
      if (!empty($options['code_column'])) {
        $key .= '||' . $this->getDbaseRecordFieldValue($record, $options['code_column']);
      }
      $this->loadFromFile($handle);
      if (!isset($this->nameCodeCombinations[$key])) {
        $this->nameCodeCombinations[$key] = ['wkt' => [], 'existing' => []];
      }
      $this->nameCodeCombinations[$key]['wkt'][] = $this->wkt;
    }
    fclose($handle);
  }

  /**
   * Collects info on matching locations based on name/code/type.
   *
   * Only matches if explicitly linked to this website.
   *
   * @param array $options
   *   Form options.
   * @param array $readAuth
   *   Read authorisation tokens.
   */
  private function getExistingMatchingLocations(array $options, array $readAuth) {
    $conn = iform_get_connection_details();
    foreach ($this->nameCodeCombinations as $key => &$info) {
      $tokens = explode('||', $key);
      $checkParams = [
        'name' => $tokens[0],
        'location_type_id' => $options['location_type_id'],
        'website_id' => $conn['website_id'],
      ];
      if (count($tokens) > 1) {
        $checkParams['code'] = $tokens[1];
      }
      $existing = \helper_base::get_population_data([
        'table' => 'location',
        'extraParams' => $readAuth + $checkParams,
        'caching' => FALSE,
      ]);
      foreach ($existing as $loc) {
        $this->nameCodeCombinations[$key]['existing'][] = $loc['id'];
      }
    }
  }

  /**
   * Retrieve a field value from a dBase record.
   *
   * Ensures properly trimmed and utf8 encoded.
   *
   * @param \XBase\Record $record
   *   dBase record object.
   * @param string $name
   *   Nane of the field.
   *
   * @return string
   *   Field value.
   */
  private function getDbaseRecordFieldValue(Record $record, $name) {
    return trim(utf8_encode($record->forceGetString($name)));
  }

  function loadData($type, $data) {
    if (!$data) {
      return $data;
    }
    $tmp = unpack($type, $data);
    return current($tmp);
  }

  function loadStoreHeaders($handle) {
    $this->recordNumber = $this->loadData("N", fread($this->SHPFile, 4));
    // We read the length of the record: NB this ignores the header.
    $this->recordLength = $this->loadData("N", fread($this->SHPFile, 4));
    $this->recordStart = ftell($this->SHPFile);
    $this->shapeType = $this->loadData("V", fread($this->SHPFile, 4));
  }

  private function loadFromFile($handle) {
    $this->SHPFile = $handle;
    $this->loadStoreHeaders($handle);
    $this->firstPoint = "";
    switch ($this->shapeType) {
      case 0:
        $this->loadFromFile($handle);
        break;

      case 1:
        $this->loadPointRecord();
        break;

      case 3:
        $this->loadPolyLineRecord('MULTILINESTRING');
        break;

      case 5:
        $this->loadPolyLineRecord('POLYGON');
        break;

      case 13:
        $this->loadPolyLineZRecord('MULTILINESTRING');
        break;

      case 15:
        // We discard the Z data.
        $this->loadPolyLineZRecord('POLYGON');
        break;

      default:
        throw new \exception('ShapeType ' . $this->shapeType . ' not supported');
    }
  }

  function loadPoint() {
    $x1 = $this->loadData("d", fread($this->SHPFile, 8));
    $y1 = $this->loadData("d", fread($this->SHPFile, 8));
    $data = "$x1 $y1";
    if ($this->firstPoint == "") {
      $this->firstPoint = "$x1, $y1";
    }
    return $data;
  }

  function loadPointRecord() {
    $data = $this->loadPoint();
    $this->wkt = 'POINT(' . $data . ')';
  }

  function loadPolyLineRecord($title) {
    $this->SHPData = array();
    $this->loadData("d", fread($this->SHPFile, 8)); // xmin
    $this->loadData("d", fread($this->SHPFile, 8)); // ymin
    $this->loadData("d", fread($this->SHPFile, 8)); // xmax
    $this->loadData("d", fread($this->SHPFile, 8)); // ymax

    $this->SHPData["numparts"] = $this->loadData("V", fread($this->SHPFile, 4));
    $this->SHPData["numpoints"] = $this->loadData("V", fread($this->SHPFile, 4));

    for ($i = 0; $i < $this->SHPData["numparts"]; $i++) {
      $this->SHPData["parts"][$i] = $this->loadData("V", fread($this->SHPFile, 4));
    }

    $this->wkt = "$title(";
    $firstIndex = ftell($this->SHPFile);
    $readPoints = 0;
    foreach ($this->SHPData["parts"] as $partIndex => $partData) {
      if (!isset($this->SHPData["parts"][$partIndex]["pointString"]) || !is_array($this->SHPData["parts"][$partIndex]["pointString"])) {
        $this->SHPData["parts"][$partIndex] = array();
        $this->SHPData["parts"][$partIndex]["pointString"] = "";
      }
      while (!in_array($readPoints, $this->SHPData["parts"]) && ($readPoints < ($this->SHPData["numpoints"])) && !feof($this->SHPFile)) {
        $data = $this->loadPoint();
        $this->SHPData["parts"][$partIndex]["pointString"] .= ($this->SHPData["parts"][$partIndex]["pointString"] == "" ? "" : ', ') . $data;
        $readPoints++;
      }
      $this->wkt .= ($partIndex == 0 ? "" : ",") . '(' . $this->SHPData["parts"][$partIndex]["pointString"] . ')';
    }

    $this->wkt .= ')';
    // Seek to the exact end of this record.
    fseek($this->SHPFile, $this->recordStart + ($this->recordLength * 2));
  }

  /**
   * Read a PolyLineZ record. This is the same as a PolyLine for our purposes since we do not hold Z data.
   */
  private function loadPolyLineZRecord($title) {
    $this->loadPolyLineRecord($title);
    // According to the spec there are 2 sets of minima and maxima, plus 2 arrays of values * numpoints, that we skip, but since each
    // record's length is read and used to find the next record, this does not matter.
  }

}
