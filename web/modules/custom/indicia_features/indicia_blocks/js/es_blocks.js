jQuery(document).ready(function($) {
  indiciaFns.handleEsRecentRecordsResponse = function(div, sourceSettings, response) {
    var ul = $('<ul>')
      .attr('id', 'recent-records-container')
      .addClass('list-group');
    if (!response.hits) {
      $(div).append('<div class="alert alert-info">No records found</div>');
      return;
    }
    $(div).append(ul);
    $.each(response.hits.hits, function() {
      var li = $('<li>').appendTo(ul)
        .addClass('recent-records-row clearfix list-group-item');
      var latin = '<span class="latin">' + this._source.taxon.accepted_name + '</span>';
      var common;
      var species;
      var dateLabel = indiciaFns.formatDate(this._source.event.date_start);
      var mediaDiv;
      var taxonInfo = this._source.taxon;
      var id = this._source.id;

      if (taxonInfo.vernacular_name) {
        common = '<span class="common">' + taxonInfo.vernacular_name + '</span>';
        species = taxonInfo.vernacular_name !== taxonInfo.accepted_name ?
          '<div class="record-title">' + common + '</div>(' + latin + ')<br/>' : '<div class="record-title">' + latin + '</div>';
      }
      else {
        species = '<div class="record-title">' + latin + '</div>';
      }
      if (this._source.event.date_end !== this._source.event.date_start) {
        dateLabel = dateLabel + ' -> ' + indiciaFns.formatDate(this._source.event.date_end);
      }
      recorder = this._source.event.recorded_by ? ' by ' + this._source.event.recorded_by : '';
      $(li).append($('<div class="recent-records-details pull-left">' + species + '<span class="extra">' + this._source.location.output_sref + ' on ' + dateLabel + recorder + '</span></div>'));
      if (this._source.occurrence && this._source.occurrence.media) {

        mediaDiv = $('<div class="recent-records-images pull-right">');
        $.each(this._source.occurrence.media, function() {
          $(mediaDiv).append('<div class="thumbnail">' +
            indiciaFns.drawMediaFile(id, this, 'thumb')
            + '</div>');
        });
        $(li).append(mediaDiv);
      }
    });
  };

  /**
   * Handle the AJAX ES response for the totals block data.
   */
  indiciaFns.handleEsTotalsResponse = function(div, sourceSettings, response) {
    var occs;
    var occsString;
    var speciesString;
    var photosString;
    var recordersString;
    if (response.hits && typeof response.hits.total !== 'undefined') {
      occs = response.hits.total;
      // ES version agnostic.
      occs = typeof occs.value === 'undefined' ? occs : occs.value;
      occsString = occs === 1 ? indiciaData.lang.esTotalsBlock.occurrencesSingle : indiciaData.lang.esTotalsBlock.occurrencesMulti;
      speciesString = response.aggregations.species_count.value === 1 ? indiciaData.lang.esTotalsBlock.speciesSingle : indiciaData.lang.esTotalsBlock.speciesMulti;
      photosString = response.aggregations.photo_count.doc_count === 1 ? indiciaData.lang.esTotalsBlock.photosSingle : indiciaData.lang.esTotalsBlock.photosMulti;
      recordersString = response.aggregations.recorder_count.value === 1 ? indiciaData.lang.esTotalsBlock.recordersSingle : indiciaData.lang.esTotalsBlock.recordersMulti;
      nf = new Intl.NumberFormat();
      $(div).find('.occurrences').append(occsString.replace('{1}', nf.format(occs))).addClass('loaded');
      $(div).find('.species').append(speciesString.replace('{1}', nf.format(response.aggregations.species_count.value))).addClass('loaded');
      $(div).find('.photos').append(photosString.replace('{1}', nf.format(response.aggregations.photo_count.doc_count))).addClass('loaded');
      $(div).find('.recorders').append(recordersString.replace('{1}', nf.format(response.aggregations.recorder_count.value))).addClass('loaded');
    }
  };

  /**
   * Handle the AJAX ES response for the phenology graph block data.
   */
  indiciaFns.handlePhenologyGraphResponse = function(div, sourceSettings, response) {
    let monthlyRecordsData = [];
    let allMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    response.aggregations.by_month.buckets.forEach(function (w) {
      if (w.key) {
        let index = allMonths.indexOf(w.key);
        if (index !== -1) {
          allMonths.splice(index, 1);
        }
        monthlyRecordsData.push({
          taxon: 'taxon',
          month: w.key,
          n: w.doc_count
        });
      }
    });
    // Fill in the zeros.
    allMonths.forEach(function (m) {
      monthlyRecordsData.push({
        taxon: 'taxon',
        month: m,
        n: 0
      });
    });
    brccharts.phen1({
      selector: '#' + div.id,
      axisLabelFontSize: 22,
      data: monthlyRecordsData,
      metrics: [{ prop: 'n', label: 'Records per month', opacity: 1, colour: '#337ab7' }],
      taxa: ['taxon'],
      width: 500,
      height: 200,
      perRow: 1,
      expand: true,
      showTaxonLabel: false,
      showLegend: false,
      margin: {left: 60, right: 0, top: 10, bottom: 20},
      axisLeftLabel: 'Records per month'
    });
  };

  /**
   * Handle the AJAX ES response for the phenology taxon group pie data.
   */
  indiciaFns.handleRecordsByTaxonGroupPieResponse = function(div, sourceSettings, response) {
    let pieSectionsData = [];
    response.aggregations.by_group.buckets.forEach(function (w) {
      pieSectionsData.push({
        name: w.key,
        number: w.doc_count
      });
    });
    // Add other bucket for remainder.
    if (response.aggregations.by_group.sum_other_doc_count > 0) {
      pieSectionsData.push({
        name: 'other',
        number: response.aggregations.by_group.sum_other_doc_count
      });
    }
    brccharts.pie({
      selector: '#' + div.id,
      data: pieSectionsData
    })
  };

  /**
   * Handle the AJAX ES response for the the verification status pie or donut data.
   */
  indiciaFns.handleRecordsByVerificationStatusPieResponse = function(div, sourceSettings, response) {
    let pieSectionsData = [];
    let has2ndLevel = false;
    response.aggregations.by_status.buckets.forEach(function (w) {
      pieSectionsData.push({
        set: 1,
        name: indiciaData.lang.statuses[w.key],
        number: w.doc_count,
        colour: indiciaData.statusColours[w.key],
      });
      // Optional 2nd level for decision detail.
      if (w.by_substatus) {
        w.by_substatus.buckets.forEach(function (v) {
          pieSectionsData.push({
            set: 2,
            name: indiciaData.lang.statuses[w.key + v.key],
            number: v.doc_count,
            colour: indiciaData.statusColours[w.key + v.key],
          });
          has2ndLevel = true;
        });
      }
    });
    let opts = {
      selector: '#' + div.id,
      data: pieSectionsData,
      radius: 180
    };
    if (has2ndLevel) {
      // Convert to donut for 2 levels of info.
      opts.innerRadius = 110;
      opts.innerRadius2 = 40;
    }
    brccharts.pie(opts);
  };

  /**
   * Output the top recorders table.
   */
  indiciaFns.handleTopRecordersTableResponse = function(div, sourceSettings, response) {
    const table = $('<table class="table">').appendTo(div);
    const headTr = $('<tr>').appendTo($('<thead>').appendTo(table));
    const body = $(table).append('<tbody>');
    // Prepare the header.
    $('<th>' + indiciaData.lang.topRecordersByRecords.recorderName + '</th>').appendTo(headTr);
    // Columns to include are optional.
    if (indiciaData.topRecordersTableOptions.includeRecords) {
      $('<th>' + indiciaData.lang.topRecordersByRecords.noOfRecords + '</th>').appendTo(headTr);
    }
    if (indiciaData.topRecordersTableOptions.includeSpecies) {
      $('<th>' + indiciaData.lang.topRecordersByRecords.noOfSpecies + '</th>').appendTo(headTr);
    }
    // Add the rows.
    response.aggregations.records_by_user.buckets.forEach(function (w) {
      let tr = $('<tr>').appendTo(body);
      $('<th>' + w.key + '</th>').appendTo(tr);
      if (indiciaData.topRecordersTableOptions.includeRecords) {
        $('<td>' + w.doc_count + '</td>').appendTo(tr);
      }
      if (indiciaData.topRecordersTableOptions.includeSpecies) {
        $('<td>' + w.species_count.value + '</td>').appendTo(tr);
      }
    });
  };

});