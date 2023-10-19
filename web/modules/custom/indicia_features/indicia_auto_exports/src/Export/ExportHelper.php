<?php

namespace Drupal\indicia_auto_exports\Export;

/**
 * Class which supports the export of data to Darwin Core Archive files.
 */
class ExportHelper {

  /**
   * Configuration.
   *
   * @var object
   */
  private $options;

  /**
   * CSV header row for Darwin Core standard output.
   *
   * @var array
   */
  private $headerRowDwc = [
    'occurrenceID',
    'otherCatalogNumbers',
    'eventID',
    'scientificName',
    'taxonID',
    'lifeStage',
    'sex',
    'individualCount',
    'vernacularName',
    'eventDate',
    'recordedBy',
    'licence',
    'rightsHolder',
    'coordinateUncertaintyInMeters',
    'decimalLatitude',
    'decimalLongitude',
    'geodeticDatum',
    'datasetName',
    'datasetID',
    'collectionCode',
    'locality',
    'basisOfRecord',
    'identificationVerificationStatus',
    'identifiedBy',
    'occurrenceStatus',
    'eventRemarks',
    'occurrenceRemarks',
  ];

  /**
   * CSV header row for Darwin Core NBN variant output.
   *
   * Differs in the way grid references are handled.
   *
   * @var array
   */
  private $headerRowNbn = [
    'occurrenceID',
    'otherCatalogNumbers',
    'eventID',
    'scientificName',
    'taxonID',
    'lifeStage',
    'sex',
    'individualCount',
    'vernacularName',
    'eventDate',
    'recordedBy',
    'licence',
    'rightsHolder',
    'coordinateUncertaintyInMeters',
    'gridReference',
    'decimalLatitude',
    'decimalLongitude',
    'datasetName',
    'datasetID',
    'collectionCode',
    'locality',
    'basisOfRecord',
    'identificationVerificationStatus',
    'identifiedBy',
    'occurrenceStatus',
    'eventRemarks',
    'occurrenceRemarks',
  ];

  /**
   * Field name URI list.
   *
   * @var array
   */
  private $fieldToUriMapping = [
    'occurrenceID' => 'http://rs.tdwg.org/dwc/terms/occurrenceID',
    'otherCatalogNumbers' => 'http://rs.tdwg.org/dwc/terms/otherCatalogNumbers',
    'eventID' => 'http://rs.tdwg.org/dwc/terms/eventID',
    'scientificName' => 'http://rs.tdwg.org/dwc/terms/scientificName',
    'taxonID' => 'http://rs.tdwg.org/dwc/terms/taxonID',
    'lifeStage' => 'http://rs.tdwg.org/dwc/terms/lifeStage',
    'sex' => 'http://rs.tdwg.org/dwc/terms/sex',
    'individualCount' => 'http://rs.tdwg.org/dwc/terms/individualCount',
    'vernacularName' => 'http://rs.tdwg.org/dwc/terms/vernacularName',
    'eventDate' => 'http://rs.tdwg.org/dwc/terms/eventDate',
    'recordedBy' => 'http://rs.tdwg.org/dwc/terms/recordedBy',
    'licence' => 'http://purl.org/dc/terms/license',
    'rightsHolder' => 'http://purl.org/dc/terms/rightsHolder',
    'coordinateUncertaintyInMeters' => 'http://rs.tdwg.org/dwc/terms/coordinateUncertaintyInMeters',
    'decimalLatitude' => 'http://rs.tdwg.org/dwc/terms/decimalLatitude',
    'decimalLongitude' => 'http://rs.tdwg.org/dwc/terms/decimalLongitude',
    'datasetName' => 'http://rs.tdwg.org/dwc/terms/datasetName',
    'geodeticDatum' => 'http://rs.tdwg.org/dwc/terms/geodeticDatum',
    'datasetID' => 'http://rs.tdwg.org/dwc/terms/datasetID',
    'collectionCode' => 'http://rs.tdwg.org/dwc/terms/collectionCode',
    'locality' => 'http://rs.tdwg.org/dwc/terms/locality',
    'basisOfRecord' => 'http://rs.tdwg.org/dwc/terms/basisOfRecord',
    'identificationVerificationStatus' => 'http://rs.tdwg.org/dwc/terms/identificationVerificationStatus',
    'identifiedBy' => 'http://rs.tdwg.org/dwc/terms/identifiedBy',
    'occurrenceStatus' => 'http://rs.tdwg.org/dwc/terms/occurrenceStatus',
    'eventRemarks' => 'http://rs.tdwg.org/dwc/terms/eventRemarks',
    'occurrenceRemarks' => 'http://rs.tdwg.org/dwc/terms/occurrenceRemarks',
  ];

  /**
   * CSV header row that is in use for the loaded config.
   *
   * @var array
   */
  private $headerRow;

  /**
   * Constructor loads and sets config.
   *
   * @param array $options
   *   Export configuration. Options include:
   *   * elasticsearchHost
   *   * index
   *   * outputFile
   *   * metadataFormContents - list of key value field names for the metadata
   *     form.
   *   * outputType - dwca (Darwin Core archive) or csv.
   *   * outputTypeVariant - optionally specify a variant of the DwC output. Set to
   *     nbn to modify the columns to include gridReference for the NBN Atlas.
   */
  public function __construct(array $options) {
    $this->options = $options;
    // Set the appropriate columns list.
    $this->headerRow = isset($options['outputTypeVariant']) && $options['outputTypeVariant'] === 'nbn' ? $this->headerRowNbn : $this->headerRowDwc;
    $this->validateOptions();
  }

  /**
   * Validates parameters in the options.
   *
   * @throw Exception
   *   Throws exceptions where problems found.
   */
  private function validateOptions() {
    if (empty($this->options['elasticsearchHost'])) {
      throw new \Exception("Missing elasticsearchHost setting in options");
    }
    if (empty($this->options['index'])) {
      throw new \Exception("Missing index setting in configuration");
    }
    if (empty($this->options['outputType'])) {
      throw new \Exception("Missing outputType setting in configuration");
    }
    if (!in_array($this->options['outputType'], ['dwca', 'csv'])) {
      throw new \Exception("Unsupported outputType setting in configuration");
    }
    if (empty($this->options['outputFile'])) {
      throw new \Exception("Missing outputFile setting in configuration");
    }
    if (empty($this->options['metadataFormContents'])) {
      throw new \Exception("Missing metadataFormContents setting in configuration");
    }
    if (empty($this->options['metadataFormContents']['rights_holder'])) {
      throw new \Exception("Missing rightsHolder setting in configuration");
    }
    if (empty($this->options['metadataFormContents']['dataset_name'])) {
      throw new \Exception("Missing datasetName setting in configuration");
    }
    if (empty($this->options['metadataFormContents']['basis_of_record'])) {
      $this->options['metadataFormContents']['basis_of_record'] = 'HumanObservation';
    }
    if (empty($this->options['metadataFormContents']['occurrence_status'])) {
      $this->options['metadataFormContents']['occurrence_status'] = 'present';
    }
    if (!isset($this->options['metadataFormContents']['occurrence_id_prefix'])) {
      $this->options['metadataFormContents']['occurrence_id_prefix'] = '';
    }
    if (empty($this->options['metadataFormContents']['defaultLicenceCode'])) {
      $this->options['metadataFormContents']['defaultLicenceCode'] = '';
    }
  }

  /**
   * Performs the task of building the file.
   */
  public function buildFile() {
    $url = $this->options['elasticsearchHost'] . '/' . $this->options['index'] . '/_search';
    $query = [
      'query' => $this->options['query'],
      'size' => 1000,
      'sort' => [['id' => 'ASC']],
    ];
    $csvFile = $this->getOutputCsvFileName();
    if (!file_exists(dirname($csvFile))) {
      mkdir(dirname($csvFile));
    }
    $response = json_decode($this->curlPost($url, $query), TRUE);
    $file = fopen($csvFile, 'w');
    fputcsv($file, $this->headerRow);
    // Now we loop until the scroll "cursors" are exhausted.
    while (isset($response['hits']['hits']) && count($response['hits']['hits']) > 0) {
      foreach ($response['hits']['hits'] as $hit) {
        fputcsv($file, $this->getRowData($hit['_source']));
      }

      $lastHit = array_pop($response['hits']['hits']);
      $query['search_after'] = $lastHit['sort'];
      // Execute another request for data after the last hit and repeat.
      $response = json_decode($this->curlPost($url, $query), TRUE);
    }

    fclose($file);
    if ($this->options['outputType'] === 'dwca') {
      $this->updateDwcaFile();
    }
  }

  /**
   * Send a request to the Warehouse Elasticsearch REST endpoints.
   *
   * @param string $url
   *   Service URL.
   * @param array $data
   *   POST data.
   *
   * @return string
   *   Response (normally a JSON string).
   */
  private function curlPost($url, array $data) {
    $session = curl_init($url);
    curl_setopt($session, CURLOPT_POST, 1);
    curl_setopt($session, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($session, CURLOPT_HTTPHEADER, self::getHttpRequestHeaders('application/json'));
    curl_setopt($session, CURLOPT_REFERER, $_SERVER['HTTP_HOST']);
    curl_setopt($session, CURLOPT_SSL_VERIFYPEER, FALSE);
    curl_setopt($session, CURLOPT_HEADER, FALSE);
    curl_setopt($session, CURLOPT_RETURNTRANSFER, TRUE);
    // Do the POST and then close the session.
    $response = curl_exec($session);
    curl_close($session);
    return $response;
  }

  /**
   * Retrieves the required HTTP headers for an Elasticsearch request.
   *
   * Header sets content type to application/json and adds an Authorization
   * header appropriate to the method.
   *
   * @param string $contentType
   *   Content type, defaults to application/json.
   *
   * @return array
   *   Header strings.
   */
  public static function getHttpRequestHeaders($contentType = 'application/json') {
    $headers = [
      "Content-Type: $contentType",
    ];
    $conn = \iform_get_connection_details();
    $tokens = [
      'WEBSITE_ID',
      $conn['website_id'],
      'SECRET',
      $conn['password'],
      'SCOPE',
      'data_flow',
    ];
    $headers[] = 'Authorization: ' . implode(':', $tokens);
    return $headers;
  }

  /**
   * Return the CSV file to output raw data into.
   *
   * Either returns the specified file name, or modifies the extension if the
   * output type is Darwin Core Archive.
   *
   * @return string
   *   File name.
   */
  private function getOutputCsvFileName() {
    if ($this->options['outputType'] === 'csv') {
      return $this->options['outputFile'];
    }
    else {
      $info = pathinfo($this->options['outputFile']);
      return $info['dirname'] . DIRECTORY_SEPARATOR . $info['filename'] . '.csv';
    }
  }

  /**
   * If the file type is DwcA, build the zip file.
   *
   * Adds the occurrences CSV file and the optional XML files.
   */
  private function updateDwcaFile() {
    $zip = new \ZipArchive();
    $zip->open($this->options['outputFile'], \ZipArchive::CREATE);
    $zip->addFile($this->getOutputCsvFileName(), 'occurrences.csv');
    $moduleHandler = \Drupal::service('module_handler');
    $modulePath = $moduleHandler->getModule('indicia_auto_exports')->getPath();
    // Dynamically build the meta.xml file's field list.
    $fieldList = [];
    foreach ($this->headerRow as $idx => $column) {
      $uri = $this->fieldToUriMapping[$column];
      $fieldList[] = "<field index=\"$idx\" term=\"$uri\" />";
    }
    // Theme_hook_original prevents error when Twig debugging enabled.
    $meta = twig_render_template($modulePath . '/templates/meta.html.twig', [
      'fieldList' => implode("\n    ", $fieldList),
      'theme_hook_original' => 'meta',
    ]);
    $zip->addFromString('meta.xml', $meta);
    $eml = twig_render_template($modulePath . '/templates/eml.html.twig', $this->options['metadataFormContents'] + ['theme_hook_original' => 'eml']);
    // Add the metadata and EML files.
    $zip->addFromString('eml.xml', $eml);
    // @todo Addition of EML/Metadata files from templates.
    $zip->close();
    // Don't need the CSV file.
    unlink($this->getOutputCsvFileName());
  }

  /**
   * Converts an occurrence data array into the correct row order for CSV.
   *
   * @param array $row
   *   Associative array of occurrence values.
   *
   * @return array
   *   Values array in same order as the header row.
   */
  private function convertToHeaderRowOrder(array $row) {
    $converted = [];
    foreach ($this->headerRow as $column) {
      $converted[] = $row[$column];
    }
    return $converted;
  }

  /**
   * Return the array to represent a document as DwcA CSV.
   *
   * @param array $source
   *   ES document source.
   *
   * @return array
   *   CSV data.
   */
  private function getRowData(array $source) {
    $points = explode(',', $source['location']['point']);
    $sensitiveOrNotPoint = $source['metadata']['sensitive'] === 'true' || !preg_match('/^\d+$/', $source['location']['input_sref_system']);
    $useGridRefsIfPossible = $this->options['outputType'] === 'nbn';
    $row = [
      'occurrenceID' => $this->options['metadataFormContents']['occurrence_id_prefix'] . $source['id'],
      'otherCatalogNumbers' => empty($source['occurrence']['source_system_key']) ? '' : $source['occurrence']['source_system_key'],
      'eventID' => $source['event']['event_id'],
      'scientificName' => $source['taxon']['accepted_name'] . (empty($source['taxon']['accepted_name_authorship']) ? '' : ' ' . $source['taxon']['accepted_name_authorship']),
      'taxonID' => $source['taxon']['accepted_taxon_id'],
      'lifeStage' => empty($source['occurrence']['life_stage']) ? '' : $source['occurrence']['life_stage'],
      'sex' => empty($source['occurrence']['sex']) ? '' : $source['occurrence']['sex'],
      'individualCount' => empty($source['occurrence']['organism_quantity']) ? '' : $source['occurrence']['organism_quantity'],
      'vernacularName' => empty($source['taxon']['vernacular_name']) ? '' : $source['taxon']['vernacular_name'],
      'eventDate' => $this->getDate($source),
      'recordedBy' => empty($source['event']['recorded_by']) ? '' : $source['event']['recorded_by'],
      'licence' => empty($source['metadata']['licence_code']) ? $this->options['metadataFormContents']['default_licence_code'] : $source['metadata']['licence_code'],
      'rightsHolder' => $this->options['metadataFormContents']['rights_holder'],
      'coordinateUncertaintyInMeters' => empty($source['location']['coordinate_uncertainty_in_meters']) ? '' : $source['location']['coordinate_uncertainty_in_meters'],
      'gridReference' => $useGridRefsIfPossible && $sensitiveOrNotPoint ? $source['location']['output_sref'] : '',
      'decimalLatitude' => $useGridRefsIfPossible && $sensitiveOrNotPoint ? '' : $points[1],
      'decimalLongitude' => $useGridRefsIfPossible && $sensitiveOrNotPoint ? '' : $points[0],
      'geodeticDatum' => 'WGS84',
      'datasetName' => $this->options['metadataFormContents']['dataset_name'],
      'datasetID' => $this->getDatasetId($source),
      'collectionCode' => $this->getCollectionCode($source),
      'locality' => empty($source['location']['verbatim_locality']) ? '' : $source['location']['verbatim_locality'],
      'basisOfRecord' => $this->options['metadataFormContents']['basis_of_record'],
      'identificationVerificationStatus' => $this->getIdentificationVerificationStatus($source),
      'identifiedBy' => empty($source['identification']['identified_by']) ? '' : $source['identification']['identified_by'],
      'occurrenceStatus' => $this->options['metadataFormContents']['occurrence_status'],
      'eventRemarks' => empty($source['event']['event_remarks']) ? '' : $source['event']['event_remarks'],
      'occurrenceRemarks' => empty($source['occurrence']['occurrence_remarks']) ? '' : $source['occurrence']['occurrence_remarks'],
    ];

    return $this->convertToHeaderRowOrder($row);
  }

  /**
   * Format date info from ES document as DwC event date.
   *
   * @param array $source
   *   ES Document source.
   *
   * @return string
   *   Date string.
   *
   * @todo Following is simplistic, doesn't handle YYYY, YYYY-MM, YYYY/YYYY or YYYY-MM/YYYY-MM formats.
   */
  private function getDate(array $source) {
    return $source['event']['date_start'] .
          ($source['event']['date_start'] === $source['event']['date_end']
          ? '' : '/' . $source['event']['date_end']);
  }

  /**
   * Extract dataset ID from an ES document.
   *
   * @param array $source
   *   ES Document source.
   *
   * @return string
   *   Dataset ID or empty string if not present.
   */
  private function getDatasetId(array $source) {
    if (!empty($this->options['datasetIdSampleAttrId']) && !empty($source['event']['attributes'])) {
      foreach ($source['event']['attributes'] as $attr) {
        if ($attr['id'] == $this->options['datasetIdSampleAttrId']) {
          return $attr['value'];
        }
      }
    }
    return '';
  }

  /**
   * Format website and survey title as CollectionCode.
   *
   * @param array $source
   *   ES Document source.
   *
   * @return string
   *   CollectionCode string.
   */
  private function getCollectionCode(array $source) {
    $website = $source['metadata']['website']['title'];
    $survey = $source['metadata']['survey']['title'];
    $uniquePartOfSurveyName = ucfirst(trim(preg_replace('/^' . $website . '/', '', $survey)));
    return "$website | $uniquePartOfSurveyName";
  }

  /**
   * Format record status as identificationVerificationStatus.
   *
   * @param array $source
   *   ES Document source.
   *
   * @return string
   *   IdentificationVerificationStatus string.
   */
  private function getIdentificationVerificationStatus(array $source) {
    $status = $source['identification']['verification_status'] . $source['identification']['verification_substatus'];
    switch ($status) {
      case 'V0':
        return 'Accepted';

      case 'V1':
        return 'Accepted - correct';

      case 'V2':
        return 'Accepted - considered correct';

      case 'C0':
        return 'Unconfirmed - not reviewed';

      case 'C3':
        return 'Unconfirmed - plausible';

      default:
        return '';
    }
  }

}
