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
  indiciaFns.handlePhenologyChartResponse = function(div, sourceSettings, response) {
    let monthlyRecordsData = [];
    let allMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    response.aggregations.by_month.buckets.forEach(function (w) {
      if (w.key) {
        let index = allMonths.indexOf(w.key);
        if (index !== -1) {
          allMonths.splice(index, 1);
        }
        monthlyRecordsData.push({
          taxon: 'foo',
          period: w.key,
          n: w.doc_count
        });
      }
    });
    // Fill in the zeros.
    allMonths.forEach(function (m) {
      monthlyRecordsData.push({
        taxon: 'foo',
        period: m,
        n: 0
      });
    });
    brccharts.temporal({
      selector: '#' + div.id,
      chartStyle: 'line',
      periodType: 'month',
      taxa: ['foo'],
      expand: true,
      perRow: 1,
      data: monthlyRecordsData,
      metrics: [{ prop: 'n', label: 'Records per month', opacity: 1, colour: '#337ab7' }],
      showLegend: false,
      showTaxonLabel: false,
      axisLeftLabel: 'Records per month',
      axisLabelFontSize: 14,
      margin: {left: 60, right: 0, top: 10, bottom: 20},
      lineInterpolator: 'curveMonotoneX'
    });
  };

  /**
   * AJAX response handler for the accumulation charts (species or records).
   */
  function handleAccumulationChartResponse(div, sourceSettings, response, show) {
    let data = [];
    var thisYear = new Date().getFullYear();
    var lastYear = thisYear - 1;
    $.each(response.aggregations.by_week.buckets, function() {
      var week = this.key;
      $.each(this.by_taxon.buckets, function() {
        var rowData = {
          taxon: this.key,
          week: week,
        };
        rowData[lastYear] = 0;
        rowData[thisYear] = 0;
        $.each(this.by_year.buckets, function() {
          rowData[this.key] = this.doc_count;
        });
        data.push(rowData);
      });
    });
    brccharts.accum({
      selector: '#' + div.id,
      data: data,
      show: show,
      expand: true,
      axisCountLabel: 'Number of records',
      axisTaxaLabel: 'Number of taxa',
      interactivity: 'mouseclick',
      margin: {left: 45, right: 68, bottom: 30, top: 10},
      titleFontSize: 18,
      axisLabelFontSize: 12,
      legendFontSize: 12,
      metrics: [{
        prop: lastYear,
        labelTaxa: lastYear + ' taxa',
        labelCounts: lastYear + ' records',
        colourTaxa: 'red',
        colourCounts: 'red',
        styleTaxa: 'solid',
        styleCounts: 'dashed'
      },
      {
        prop: thisYear,
        labelTaxa: thisYear + ' taxa',
        labelCounts: thisYear + ' records',
        colourTaxa: 'blue',
        colourCounts: 'blue',
        styleTaxa: 'solid',
        styleCounts: 'dashed'
      }]
    });
  }

  indiciaFns.handleAccumulationChartResponseBoth = function(div, sourceSettings, response) {
    handleAccumulationChartResponse(div, sourceSettings, response, 'both');
  }

  indiciaFns.handleAccumulationChartResponseTaxa = function(div, sourceSettings, response) {
    handleAccumulationChartResponse(div, sourceSettings, response, 'taxa');
  }

  indiciaFns.handleAccumulationChartResponseCounts = function(div, sourceSettings, response) {
    handleAccumulationChartResponse(div, sourceSettings, response, 'counts');
  }

  /**
   * AJAX handler for the by-year temporal chart response.
   */
  indiciaFns.handleRecordsByYearChartResponse = function(div, sourceSettings, response) {
    let chartData = [];
    response.aggregations.by_year.buckets.forEach(function (w) {
      chartData.push({
        taxon: 'foo',
        period: w.key,
        values: w.doc_count
      });
    });
    brccharts.temporal({
      selector: '#' + div.id,
      chartStyle: 'bar',
      periodType: 'year',
      taxa: ['foo'],
      expand: true,
      perRow: 1,
      data: chartData,
      metrics: [
        { prop: 'values', colour: '#337ab7', taxon: 'foo' },
      ],
      showLegend: false,
      showTaxonLabel: false,
      axisLeftLabel: 'Records per year',
      minY: 0,
      axisLabelFontSize: 14,
      margin: {left: 60, right: 0, top: 10, bottom: 20}
    })
  }

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
   * Handle the AJAX ES response for the phenology taxon group pie data.
   */
  indiciaFns.handleRecordsBySpeciesPieResponse = function(div, sourceSettings, response) {
    let pieSectionsData = [];
    response.aggregations.by_species.buckets.forEach(function (w) {
      pieSectionsData.push({
        name: w.key,
        number: w.doc_count
      });
    });
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