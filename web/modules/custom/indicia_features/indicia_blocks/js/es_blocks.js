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
  }

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
  }
});