<?php

namespace Drupal\indicia_blocks\Plugin\Block;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Component\Render\FormattableMarkup;

/**
 * Provides a 'Recent Records' block.
 *
 * @Block(
 *   id = "indicia_recent_records_block",
 *   admin_label = @Translation("Indicia recent records block"),
 * )
 */
class IndiciaRecentRecordsBlock extends IndiciaBlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    iform_load_helpers(['report_helper']);
    $connection = iform_get_connection_details();
    if (empty($connection['website_id']) || empty($connection['password'])) {
      $this->messenger()->addWarning('Indicia configuration incomplete.');
      return [
        '#markup' => '',
      ];
    }
    $readAuth = \report_helper::get_read_auth($connection['website_id'], $connection['password']);
    $configuredParams = \helper_base::explode_lines_key_value_pairs($this->configuration['report_parameters']);
    $rows = \report_helper::get_report_data([
      'readAuth' => $readAuth,
      'dataSource' => 'library/occurrences/filterable_explore_list_with_geom',
      'extraParams' => [
        'smpattrs' => '',
        'occattrs' => '',
        'limit' => 10,
      ] + $configuredParams,
      'caching' => TRUE,
      'cacheTimeout' => 60,
    ]);
    $r = <<<HTML
<p>The following list of records includes verified records and those awaiting verification of species groups you are
interested in which have been recently added in your area.</p>

HTML;
    $r .= '<ul id="recent-records-container" class="list-group">';
    $pointJs = '';
    foreach ($rows as $row) {
      $latin = "<span class=\"latin\">$row[taxon]</span>";
      if ($row['common']) {
        $common = "<span class=\"common\">$row[common]</span>";
        $species = $row['common'] !== $row['taxon'] ?
          "<div class=\"record-title\">$common</div>($latin)<br/>" : "<div class=\"record-title\">$latin</div>";
      }
      else {
        $species = "<div class=\"record-title\">$latin</div>";
      }
      $r .= '<li class="recent-records-row clearfix list-group-item">';
      $r .= "<div class=\"recent-records-details pull-left\">$species<span class=\"extra\">$row[output_sref] on $row[date] by $row[recorder]</span></div>";
      if (!empty($row['images'])) {
        $r .= '<div class="recent-records-images pull-right">';
        $mediaPaths = explode(',', $row['images']);
        $r .= \report_helper::mediaToThumbnails($mediaPaths, 'thumb', 'occurrence', $row['occurrence_id']);
        $r .= '</div>';
      }
      $r .= '</li>';
      $pointJs .= "  div.addPt(features, {\"occurrence_id\":\"$row[occurrence_id]\",\"taxon\":\"$row[taxon]\",\"geom\":\"$row[geom]\"}, 'geom', {}, '$row[occurrence_id]');\n";
    }
    $r .= '</ul>';
    \report_helper::$javascript .= <<<JS
if (typeof mapInitialisationHooks !== 'undefined') {
  mapInitialisationHooks.push(function(div) {
    var features = [];
  $pointJs
    if (typeof indiciaData.reportlayer==='undefined') {
      var defaultStyle = new OpenLayers.Style(OpenLayers.Util.extend(OpenLayers.Feature.Vector.style['default'], {"strokeColor":"#0000ff","fillColor":"#3333cc","fillOpacity":0.6,"strokeWidth":"\${getstrokewidth}"}), {context: { getstrokewidth: function(feature) {
          var width=feature.geometry.getBounds().right - feature.geometry.getBounds().left,
            strokeWidth=(width===0) ? 1 : 9 - (width / feature.layer.map.getResolution());
          return (strokeWidth<2) ? 2 : strokeWidth;
        } }});
      var selectStyle = new OpenLayers.Style({"strokeColor":"#ff0000","fillColor":"#ff0000","fillOpacity":0.6,"strokeWidth":"\${getstrokewidth}"}, {context: { getstrokewidth: function(feature) {
          var width=feature.geometry.getBounds().right - feature.geometry.getBounds().left,
            strokeWidth=(width===0) ? 1 : 10 - (width / feature.layer.map.getResolution());
          return (strokeWidth<3) ? 3 : strokeWidth;
        } }});
      var styleMap = new OpenLayers.StyleMap({'default' : defaultStyle, 'select' : selectStyle});
      indiciaData.reportlayer = new OpenLayers.Layer.Vector('Report output', {styleMap: styleMap, rendererOptions: {zIndexing: true}});
      div.map.addLayer(indiciaData.reportlayer);
    }
    indiciaData.reportlayer.addFeatures(features);
  });
}

JS;
    return [
      '#markup' => new FormattableMarkup($r, []),
      '#attached' => [
        'library' => [
          'indicia_blocks/es-blocks',
          'iform/fancybox',
        ],
      ],
      '#cache' => [
        // No cache please.
        'max-age' => 0,
      ],
    ];
  }

  /**
   * {@inheritdoc}
   *
   * Prevent caching.
   */
  public function getCacheMaxAge() {
    return 0;
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);
    $form['report_parameters'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Report parameters'),
      '#description' => 'Parameters in the form key=value, one per line. The list of available parameters is described in ' .
        '<a href="https://indicia-docs.readthedocs.io/en/latest/developing/reporting/occurrence-standard-parameters.html" target="_blank">' .
        'the occurrence report standard parameters documentation</a>.',
      '#default_value' => $this->configuration['report_parameters'],
      '#weight' => '0',
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);
    $this->setConfigurationValue('report_parameters', $form_state->getValue('report_parameters'));
  }

}
