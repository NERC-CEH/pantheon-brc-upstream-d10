/* Indicia, the OPAL Online Recording Toolkit.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see http://www.gnu.org/licenses/gpl.html.
 */

var displayReportMetadata;

jQuery(document).ready(function($) {

  /**
   * When clicking on an entry in the list of reports available, display the title and description of that report
   * in the metadata panel on the report_picker.
   */
  displayReportMetadata = function (control, path) {
    // safe for Windows paths
    path = path.replace('\\', '/');
    path = path.split('/');
    var current = indiciaData.reportList;
    $.each(path, function (idx, item) {
      current = current[item];
      if (current.type === 'report') {
        $('#' + control + ' .report-metadata').html('<strong>' + current.title + '</strong><br/>' +
          '<p>' + current.description + '</p>');
        $('#picker-more').show();
      } else {
        current = current['content'];
      }
    });
  }

  function showMoreInfo() {
    var rpt = $('ul.treeview input:checked').val();
    $.ajax({
      url: indiciaData.read.url + 'index.php/services/report/requestMetadata',
      data: {
        report: rpt + '.xml',
        auth_token: indiciaData.read.auth_token,
        nonce: indiciaData.read.nonce
      },
      dataType: 'jsonp',
      crossDomain: true
    })
    .done(function(data) {
      var columnRows='', paramRows='', display, description, datatype, ns='<em>Not set</em>';
      if (typeof data.columns!=="undefined") {
        $.each(data.columns, function(field, def) {
          display = typeof def.display==="undefined" || def.display===null ? ns : def.display;
          columnRows += '<tr><th scope="row">' + field + '</th><td>' + display + '</td></tr>';
        });
        $.each(data.parameters, function(parameter, def) {
          display = def.display===null ? ns : def.display;
          description = def.description===null ? ns : def.description;
          if (typeof def.description_extra !== 'undefined') {
            description += '<br/>' + def.description_extra;
          }
          datatype = def.datatype===null ? ns : def.datatype;
          paramRows += '<tr><th scope="row">' + parameter + '</th><td>' + display +
            '</td><td>' + description + '</td><td>' + datatype + '</td></tr>';
        });
        $.fancybox.open('<div class="report-metadata-popup">' +
            '<table class="ui-widget"><caption class="ui-widget-header">Report summary</caption>' +
            '<thead class="ui-widget-header"><tr><th>Attribute</th><th>Value</th></tr></thead>' +
            '<tbody><tr><th scope="row">Report path</th><td>' + rpt + '</td>' +
            '</tbody></table>' +
            '<table class="ui-widget"><caption class="ui-widget-header">Report columns</caption>' +
            '<thead class="ui-widget-header"><tr><th>Field</th><th>Title</th></tr></thead>' +
            '<tbody>' + columnRows + '</tbody></table>' +
            '<table class="ui-widget"><caption class="ui-widget-header">Report parameters</caption>' +
            '<thead class="ui-widget-header"><tr><th>Field</th><th>Title</th><th>Description</th><th>Data type</th></tr></thead>' +
            '<tbody>' + paramRows + '</tbody></table>' +
          '</div>');
      }
    })
    .fail(function() {
      alert('Report information could not be obtained');
    });
  }

  $('#picker-more').on('click', showMoreInfo);

  $('#picker-more').hide();

});