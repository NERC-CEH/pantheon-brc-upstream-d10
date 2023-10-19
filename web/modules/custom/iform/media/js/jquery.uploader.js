/**
 * Indicia, the OPAL Online Recording Toolkit.
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

/**
 * Add functions to mediaUploadAddedHooks to recieve a notification when a file is added.
 */
var mediaUploadAddedHooks = [];

/**
 * Add functions to mediaDeleteAddedHooks to recieve a notification when a file
 * is deleted.
 */
var mediaDeleteAddedHooks = [];

 /**
 * Form submit handler that prevents the user clicking save during an upload
 */
var checkSubmitInProgress = function () {
  if ($('.file-box .progress').val() !== 0) {
    alert('Please wait till your images have finished uploading before submitting the form.');
    indiciaData.formSubmitted = false;
    return false;
  }
  return true;
};


/**
* Class: uploader
* A jQuery plugin that provides an upload box for multiple images.
*/


(function($) {

  var currentDiv;
  // When adding a link to a remote resource, the oembed protocol is used to
  // fetch the HTML to display for the external resource. Use the noembed
  // service to guarantee jsonp support and a consistent response.
  var noembed = function(div, id, url, requestId, typename, isNew, caption) {
    var duplicate = false;
    // Check for duplicate links to the same resource
    $.each($(div).find('.path-field'), function(idx, input) {
      if ($(input).val()===url) {
        duplicate = true;
        return false;
      }
    });
    if (duplicate) {
      // cleanup
      $('#link-'+requestId).remove();
      alert(indiciaData.msgDuplicateLink);
      return;
    }
    $.ajax({
      url: 'https://noembed.com/embed?url=' + encodeURIComponent(url),
      dataType: 'jsonp',
      success: function(data) {
        if (data.error) {
          alert(data.error);
          // cleanup
          $('#link-'+requestId).remove();
        } else {
          $('#link-title-'+requestId).html(data.title);
          var uniqueId='link-' + requestId;
          var typeId = indiciaData.mediaTypeTermIdLookup[typename];
          var tmpl = div.settings.file_box_uploaded_linkTemplate + div.settings.file_box_uploaded_extra_fieldsTemplate;
          if (isNew && div.settings.mediaLicenceId) {
            tmpl += div.settings.file_box_uploaded_licence_fieldTemplate;
          }
          $('#link-embed-'+requestId).html(tmpl
              .replace(/\{embed\}/g, data.html)
              .replace(/\{idField\}/g, div.settings.table + ':id:' + uniqueId)
              .replace(/\{idValue\}/g, id)
              .replace(/\{pathField\}/g, div.settings.table + ':path:' + uniqueId)
              .replace(/\{pathValue\}/g, url)
              .replace(/\{captionField\}/g, div.settings.table + ':caption:' + uniqueId)
              .replace(/\{captionValue\}/g, caption)
              .replace(/\{captionPlaceholder\}/g, div.settings.msgCaptionPlaceholder)
              .replace(/\{typeField\}/g, div.settings.table + ':media_type_id:' + uniqueId)
              .replace(/\{typeValue\}/g, typeId)
              .replace(/\{typeNameField\}/g, div.settings.table + ':media_type:' + uniqueId)
              .replace(/\{typeNameValue\}/g, typename)
              .replace(/\{deletedField\}/g, div.settings.table + ':deleted:' + uniqueId)
              .replace(/\{deletedValue\}/g, 'f')
              .replace(/\{isNewField\}/g, 'isNew-' + uniqueId)
              .replace(/\{isNewValue\}/g, isNew ? 't' : 'f')
              .replace(/\{licenceIdField\}/g, div.settings.table + ':licence_id:' + uniqueId)
              .replace(/\{licenceIdValue\}/g, div.settings.mediaLicenceId)
          );
        }
      },
      error: function(data) {
        alert(div.settings.msgNoembedResponseError);
      }
    });
  };

  indiciaData.mediaTypes = {
    "Audio:SoundCloud" : {
      regex: /^http(s)?:\/\/(www.)?soundcloud.com\//
    },
    "Image:Flickr" : {
      regex: /^http(s)?:\/\/((www.)?flickr.com|flic.kr)\//
    },
    "Image:Instagram" : {
      regex: /^http:\/\/(instagram.com|instagr.am)\//
    },
    "Image:Twitpic" : {
      regex: /^http:\/\/twitpic.com\//
    },
    "Social:Facebook" : {
      regex: /^http(s)?:\/\/(www.)?facebook.com\//
    },
    "Social:Twitter" : {
      regex: /^http(s)?:\/\/twitter.com\//
    },
    "Video:Youtube" : {
      regex: /^http(s)?:\/\/(www.youtube.com|youtu.be)\//
    },
    "Video:Vimeo" : {
      regex: /^http:\/\/vimeo.com\//
    }
  };

  function enableDropIfDesktop(el, uploadOpts) {
    var dropEl;
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      dropEl = $(el).find('.filelist');
      dropEl.addClass('image-drop');
      dropEl.append('<span class="drop-instruct">Drop files here...</span>');
      uploadOpts.drop_element = dropEl[0];
    }
  }

  $(document).ready(function() {
    $("#add-link-form").keypress(function(e) {
      if (e.keyCode == $.ui.keyCode.ENTER) {
        $(this).parent().find("button:eq(0)").trigger("click");
      }
    });
    $("#add-link-form input").change(function(e) {
      $("#add-link-form ." + indiciaData.inlineErrorClass).remove();
    });
  });

  $.fn.uploader = function(options) {
    // Extend our default options with those provided, basing this on an empty object
    // so the defaults don't get changed.
    var opts = $.extend({}, $.fn.uploader.defaults, options), html5OK=true;

    if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)){ //test for Firefox/x.x or Firefox x.x (ignoring remaining digits);
      var ffversion=new Number(RegExp.$1); // capture x.x portion and store as a number
      if (ffversion<3.5) {
        // Browser is FF3.5+, so Html5 is a good runtime as HTML5 resize only works on FF3.5+.
        html5OK = false;
      }
    }
    if (!html5OK) {
      // browser not FF3.5+. This replacement does not remove html5 if already the last runtime.
      opts.runtimes = opts.runtimes.replace('html5,','');
    }

    if (typeof opts.jsPath == "undefined") {
      alert('The file_box control requires a jsPath setting to operate correctly. It should point to the URL '+
          'path of the media/js folder.');
    }

    return this.each(function() {
      var uploadSelectBtn='', linkSelectBtn='', id=Math.floor((Math.random())*0x10000), tokens,
          hasLocalFiles = false, hasLinks = false, div=this, fileTypes=[], caption=opts.msgPhoto, linkTypes=[];
      this.settings = opts;
      $.each(this.settings.mediaTypes, function(idx, mediaType) {
        tokens = mediaType.split(':');
        if (tokens[1]==='Local') {
          hasLocalFiles = true;
          // If a recognised file type, join it's known extensions.
          if (typeof opts.fileTypes[tokens[0].toLowerCase()] !== 'undefined') {
            fileTypes.push(opts.fileTypes[tokens[0].toLowerCase()].join(','));
          }
          if (tokens[0] !== 'Image') {
            // If non-images allowed, change the caption from Image to File .
            caption = opts.msgFile;
          }
        } else {
          hasLinks = true;
          linkTypes.push(tokens[1]);
        }
      });
      if (this.settings.upload && !this.settings.browse_button && hasLocalFiles) {
        uploadSelectBtn = this.settings.buttonTemplate
            .replace('{caption}', this.settings.addBtnCaption.replace('{1}', caption))
            .replace('{id}', 'upload-select-btn-' + id)
            .replace('{class}', '')
            .replace('{title}', this.settings.msgUseAddFileBtn.replace('{1}', fileTypes.join(',').replace(/,/g, ', ')));
        this.settings.browse_button = 'upload-select-btn-'+id;
      }
      if (hasLinks) {
        linkSelectBtn = this.settings.buttonTemplate
            .replace('{caption}', this.settings.addBtnCaption.replace('{1}', this.settings.msgLink))
            .replace('{id}', 'link-select-btn-' + id)
            .replace('{class}', '')
            .replace('{title}', this.settings.msgUseAddLinkBtn.replace('{1}', linkTypes.join(',').replace(/,/g, ', ')));
      }

      $(this).append(this.settings.file_boxTemplate
          .replace('{caption}', this.settings.caption)
          .replace('{captionClass}', this.settings.captionClass)
          .replace('{uploadSelectBtn}', uploadSelectBtn)
          .replace('{linkSelectBtn}', linkSelectBtn)
          .replace('{helpText}', this.settings.helpText)
          .replace('{helpTextClass}', this.settings.helpTextClass)
      );
      if (hasLinks) {
        $('#link-select-btn-' + id).click(function(el) {
          // store things that will be needed on OK click
          currentDiv = div;
          $('#link_url').val('');
          $.fancyDialog({
            title: 'Add a link',
            contentElement: '#add-link-form',
            callbackValidate: function() {
              var url=$('#link_url').val(), found=false;
              $("#add-link-form ." + indiciaData.inlineErrorClass).remove();
              // validate the link matches one of our file type regexes
              $.each(indiciaData.mediaTypes, function(name, cfg) {
                if ($.inArray(name, currentDiv.settings.mediaTypes) >= 0 && url.match(cfg.regex)) {
                  found = true;
                  return false;
                }
              });
              if (!found) {
                $('#link_url')
                  .after("<span class=\"" + indiciaData.inlineErrorClass + "\">Unrecognised URL format. Please check you've copied and pasted it properly from one of the supported websites.</span>");
              }
              return found;
            },
            callbackOk: function() {
              var linkRequestId = indiciaData.linkRequestCount++;
              uniqueId = 'link-' + linkRequestId;
              $('#' + currentDiv.id.replace(/:/g,'\\:') + ' .filelist').append(currentDiv.settings.file_box_initial_link_infoTemplate
                .replace(/\{id\}/g, uniqueId)
                .replace(/\{linkRequestId\}/g, linkRequestId)
              );
              var url=$('#link_url').val();
              // validate the link matches one of our file type regexes
              $.each(indiciaData.mediaTypes, function(name, cfg) {
                if ($.inArray(name, currentDiv.settings.mediaTypes) >= 0 && url.match(cfg.regex)) {
                  noembed(currentDiv, '', url, linkRequestId, name, true, '');
                }
              });
            }
          });
        });
      }
      // Set up a resize object if required
      var resize = (this.settings.resizeWidth!==0 || this.settings.resizeHeight!==0) ?
          {width: this.settings.resizeWidth, height: this.settings.resizeHeight, quality: this.settings.resizeQuality} : null;
      var uploadOpts = {
        runtimes : this.settings.runtimes,
        container : this.id,
        browse_button : this.settings.browse_button,
        url : this.settings.uploadScript + '?destination=' + this.settings.relativeImageFolder,
        resize : resize,
        flash_swf_url : this.settings.jsPath + 'plupload/js/Moxie.swf',
        silverlight_xap_url : this.settings.jsPath + 'plupload/js/Moxie.xap',
        filters : [
          {title : "Image files", extensions : fileTypes.join(',')}
        ],
        chunk_size: '1MB',
        // limit the max file size to the Indicia limit, unless it is first resized.
        max_file_size : resize ? '10mb' : plupload.formatSize(this.settings.maxUploadSize)
      };
      enableDropIfDesktop(this, uploadOpts);
      this.uploader = new plupload.Uploader(uploadOpts);
      this.uploader.bind('QueueChanged', function(up) {
        up.start();
      });

      // make the main object accessible
      var div = this;

      // load the existing data if there are any
      var existing, uniqueId, requestId, thumbnailfilepath, origfilepath, tmpl, ext;
      indiciaData.linkRequestCount=div.settings.existingFiles.length;
      $.each(div.settings.existingFiles, function(i, file) {
        var isLocal = file.media_type.match(/:Local$/) || file.media_type.match(/:Local:/);
        requestId = $('.filelist .mediafile, .filelist .link').length,
            uniqueId = 'link-' + requestId;
        //Media sub-types are now supported of the form like "Image:Local:SubTypeName
        //The original format for media items would just have "Local" at the end.
        //So include both of these possibilities
        if (isLocal || file.media_type === 'Image:iNaturalist') {
          if (file.media_type === 'Image:iNaturalist') {
            origfilepath = file.path.replace('/square.', '/original.');
            thumbnailfilepath = file.path;
          } else {
            origfilepath = div.settings.finalImageFolder + file.path;
            if (file.id === '') {
              thumbnailfilepath = div.settings.destinationFolder + file.path;
            }
            else {
              if (typeof div.settings.finalImageFolderThumbs === 'undefined') {
                // default thumbnail location if Indicia in charge of images
                thumbnailfilepath = div.settings.finalImageFolder + 'med-' + file.path;
              } else {
                // overridden thumbnail location
                thumbnailfilepath = div.settings.finalImageFolderThumbs + file.path;
              }
            }
          }
          ext = file.path.split('.').pop().split('?')[0].toLowerCase();
          existing = div.settings.file_box_initial_file_infoTemplate.replace(/\{id\}/g, uniqueId)
              .replace(/\{filename\}/g, file.media_type.match(/^(Audio|Pdf):/) ? div.settings.msgFile : div.settings.msgPhoto)
              .replace(/\{imagewidth\}/g, div.settings.imageWidth);
          $('#' + div.id.replace(/:/g,'\\:') + ' .filelist').append(existing);
          $('#' + uniqueId + ' .progress-wrapper').remove();

          // Default.
          tmpl = div.settings['file_box_uploaded_genericTemplate'];
          // Scan the known types for this extension.
          $.each(div.settings.fileTypes, function(thisType) {
            if ($.inArray(ext, this) !== -1) {
              tmpl = div.settings['file_box_uploaded_' + thisType + 'Template']
            }
          });
          tmpl += div.settings.file_box_uploaded_extra_fieldsTemplate;
          file.caption = file.caption === null ? '' : file.caption;
          $('#' + uniqueId + ' .media-wrapper').html(tmpl
                .replace(/\{id\}/g, uniqueId)
                .replace(/\{thumbnailfilepath\}/g, thumbnailfilepath)
                .replace(/\{origfilepath\}/g, origfilepath)
                .replace(/\{imagewidth\}/g, div.settings.imageWidth)
                .replace(/\{captionField\}/g, div.settings.table + ':caption:' + uniqueId)
                .replace(/\{captionValue\}/g, file.caption.replace(/\"/g, '&quot;'))
                .replace(/\{captionPlaceholder\}/g, div.settings.msgCaptionPlaceholder)
                .replace(/\{pathField\}/g, div.settings.table + ':path:' + uniqueId)
                .replace(/\{pathValue\}/g, file.path)
                .replace(/\{typeField\}/g, div.settings.table + ':media_type_id:' + uniqueId)
                .replace(/\{typeValue\}/g, file.media_type_id)
                .replace(/\{typeNameField\}/g, div.settings.table + ':media_type:' + uniqueId)
                .replace(/\{typeNameValue\}/g, isLocal ? 'Image:Local' : file.media_type)
                .replace(/\{deletedField\}/g, div.settings.table + ':deleted:' + uniqueId)
                .replace(/\{deletedValue\}/g, 'f')
                .replace(/\{isNewField\}/g, 'isNew-' + uniqueId)
                .replace(/\{isNewValue\}/g, 'f')
                .replace(/\{idField\}/g, div.settings.table + ':id:' + uniqueId)
                .replace(/\{idValue\}/g, file.id) // If ID is set, the picture is uploaded to the server
          );
        } else {
          existing = div.settings.file_box_initial_link_infoTemplate
              .replace(/\{id\}/g, uniqueId)
              .replace(/\{linkRequestId\}/g, requestId);
          $('#' + div.id.replace(/:/g,'\\:') + ' .filelist').append(existing);
          noembed(div, file.id, file.path, requestId, file.media_type, false, file.caption.replace(/\"/g, '&quot;'));
        }
      });

      // Add a box to indicate a file that is added to the list to upload, but not yet uploaded.
      this.uploader.bind('FilesAdded', function(up, files) {
        $(div).parents('form').bind('submit', checkSubmitInProgress);
        // Hide the drop here hint once we have something, so it doesn't occupy space.
        $(div).find('.drop-instruct').remove();
        // Find any files over the upload limit
        var existingCount = $('#' + div.id.replace(/:/g,'\\:') + ' .filelist').children().length, ext;
        extras = files.splice(div.settings.maxFileCount - existingCount, 9999);
        if (extras.length!==0) {
          alert(div.settings.msgTooManyFiles.replace('[0]', div.settings.maxFileCount));
          // Remove excess files from the uploader queue.
          $.each(extras, function(i, file){
            div.uploader.removeFile(file);
          });
        }
        $.each(files, function(i, file) {
          ext=file.name.split('.').pop();
          $('#' + div.id.replace(/:/g,'\\:') + ' .filelist').append(div.settings.file_box_initial_file_infoTemplate.replace(/\{id\}/g, file.id)
              .replace(/\{filename\}/g, $.inArray(ext, div.settings.fileTypes.image) > -1 ? div.settings.msgPhoto : div.settings.msgFile)
              .replace(/\{imagewidth\}/g, div.settings.imageWidth)
          );
          // change the file name to be unique & lowercase, since the warehouse lowercases files
          file.name=(plupload.guid()+'.'+ext).toLowerCase();
          $('#' + file.id + ' .progress').val(0);
          $('#' + file.id + ' .progress').text('0 %');
          var msg='Resizing...';
          if (div.settings.resizeWidth===0 || div.settings.resizeHeight===0 || typeof div.uploader.features.jpgresize === "undefined") {
            msg='Uploading...';
          }
          var mediaPath = div.settings.jsPath.substr(0, div.settings.jsPath.length - 3);
          $('#' + file.id + ' .progress-gif').html('<img style="display: inline; margin: 4px;" src="'+ mediaPath +'images/ajax-loader2.gif" width="32" height="32" alt="In progress"/>');
          $('#' + file.id + ' .progress-percent').html('<span>'+msg+'</span>');
        });

      });

      // As a file uploads, update the progress bar and percentage indicator
      this.uploader.bind('UploadProgress', function(up, file) {
        $('#' + file.id + ' .progress').val(file.percent);
        $('#' + file.id + ' .progress').text(file.percent + ' %');
        $('#' + file.id + ' .progress-percent').html('<span>' + file.percent + '% Uploaded...</span>');
      });

      this.uploader.bind('Error', function(up, error) {
        if (error.code==-600) {
          alert(div.settings.msgFileTooBig);
        } else {
          alert(error.message);
        }
        $('#' + error.file.id).remove();
      });

      // On upload completion, check for errors, and show the uploaded file if OK.
      this.uploader.bind('FileUploaded', function(uploader, file, response) {
        $('#' + file.id + ' .progress-wrapper').remove();
        // check the JSON for errors
        var resp = eval('['+response.response+']'), filepath, uniqueId,
           tmpl, fileType, mediaTypeId;
        if (resp[0].error) {
          $('#' + file.id).remove();
          alert(div.settings.msgUploadError + ' ' + resp[0].error.message);
        } else {
          filepath = div.settings.destinationFolder + file.name;
          uniqueId = $('.filelist .media-wrapper').length - $('.filelist .progress').length;
          ext = filepath.split('.').pop().toLowerCase();
          // Default.
          fileType = 'Image';
          // Scan the known types for this extension.
          $.each(div.settings.fileTypes, function(thisType) {
            if ($.inArray(ext, this) !== -1) {
              fileType = thisType.charAt(0).toUpperCase() + thisType.slice(1);
            }
          });
          // If this type has a template, use it.
          if (typeof div.settings['file_box_uploaded_' + fileType.toLowerCase() + 'Template'] !== 'undefined') {
            tmpl = div.settings['file_box_uploaded_' + fileType.toLowerCase() + 'Template']
          }
          else {
            tmpl = div.settings['file_box_uploaded_genericTemplate'];
          }
          tmpl += div.settings.file_box_uploaded_extra_fieldsTemplate;
          if (div.settings.mediaLicenceId) {
            tmpl += div.settings.file_box_uploaded_licence_fieldTemplate;
          }
          //If indiciaData.subTypes is supplied then the user is intending to use more than one photo control,
          //each control will have their own media sub-type.
          if (indiciaData.subTypes) {
            for (var i=0; i<indiciaData.subTypes.length; i++) {
              //Each item of the array consists of a control id and the sub type.
              //So all we need to do here is cycle through the options until we find a control
              //id for the control we are currenty uploading too, and then select that sub-type
              if (div.settings.id.indexOf(indiciaData.subTypes[i][0])>-1) {
                fileType=indiciaData.subTypes[i][1];
              }
            }
          }
          if ("mediaTypeTermIdLookup" in indiciaData) {
            // Backwards compatibility test. Property only exists if
            // data_entry_helper::add_link_popup has set it.
            if (!indiciaData.subTypes)
              mediaTypeId = indiciaData.mediaTypeTermIdLookup[fileType + ':Local'];
            else
              //If user has supplied an option to limit a photo control to a particular media type
              //then we get the media type name straight from the option they provide
              mediaTypeId = indiciaData.mediaTypeTermIdLookup[fileType];
          }
          else {
            // If no value is supplied, warehouse defaults to Image:Local
            mediaTypeId = '';
          }

          // Show the uploaded file, and also set the mini-form values to contain the file details.
          $('#' + file.id + ' .media-wrapper').html(tmpl
                .replace(/\{id\}/g, file.id)
                .replace(/\{thumbnailfilepath\}/g, filepath)
                .replace(/\{origfilepath\}/g, filepath)
                .replace(/\{imagewidth\}/g, div.settings.imageWidth)
                .replace(/\{captionField\}/g, div.settings.table + ':caption:' + uniqueId)
                .replace(/\{captionValue\}/g, '')
                .replace(/\{captionPlaceholder\}/g, div.settings.msgCaptionPlaceholder)
                .replace(/\{pathField\}/g, div.settings.table + ':path:' + uniqueId)
                .replace(/\{pathValue\}/g, file.name)
                .replace(/\{typeField\}/g, div.settings.table + ':media_type_id:' + uniqueId)
                .replace(/\{typeValue\}/g, mediaTypeId)
                .replace(/\{typeNameField\}/g, div.settings.table + ':media_type:' + uniqueId)
                .replace(/\{typeNameValue\}/g, fileType + ':Local')
                .replace(/\{deletedField\}/g, div.settings.table + ':deleted:' + uniqueId)
                .replace(/\{deletedValue\}/g, 'f')
                .replace(/\{isNewField\}/g, 'isNew-' + file.id)
                .replace(/\{isNewValue\}/g, 't')
                .replace(/\{idField\}/g, div.settings.table + ':id:' + uniqueId)
                .replace(/\{idValue\}/g, '') // Set ID to blank, as this is a new record.
                .replace(/\{licenceIdField\}/g, div.settings.table + ':licence_id:' + uniqueId)
                .replace(/\{licenceIdValue\}/g, div.settings.mediaLicenceId)
          );
          $.each(mediaUploadAddedHooks, function() {
            this(div, file);
          });
        }
        // reset the form handler if this is the last upload in progress
        if ($('.file-box .progress').length===0) {
          $("form").unbind('submit', checkSubmitInProgress);
        }
      });

      this.uploader.init();

      if (this.settings.useFancybox && !indiciaData.fileListFancyBoxDone) {
        // Hack to get fancybox working as a jQuery live, because some of our images load from AJAX calls.
        // So we temporarily create a dummy link to our image and click it.
        indiciaFns.on('click', '.filelist a.fancybox', null, function() {
          jQuery("body").after('<a id="link_fancybox" style="display: hidden;" href="'+jQuery(this).attr('href')+'"></a>');
          jQuery('#link_fancybox').fancybox();
          jQuery('#link_fancybox').click();
          jQuery('#link_fancybox').remove();
          return false;
        });
        indiciaData.fileListFancyBoxDone = true;
      }

      indiciaFns.on('click', '.delete-file', null, function(evt) {
        // The delete button has an id like del-<id> where <id> is the id of the
        // containing div.mediafile
        var id = evt.target.id.substr(4);
        var $div = $(evt.target).parents('#'+id)

        // The isNew field is a hidden input that marks up new and existing
        // files. It has an id like isNew-<id>
        var isNew = $('#isNew-' + id).length === 0 || 
          $('#isNew-' + id).val() === 't';

        // Call any hooks prior to delete.
        $.each(mediaDeleteAddedHooks, function() {
          this($div, isNew);
        });

        // If this is a newly uploaded file or still uploading, we can simply
        // delete the div since all that has been done is an upload to the
        // temp upload folder, which will get purged anyway. 
        if (isNew)
          $div.remove();
        else {
          $div.addClass('disabled').css('opacity', 0.5);
          $div.find('.deleted-value').val('t');
          $div.find('.progress').remove();
        }
      });

      if (this.settings.autopick && !hasLinks) {
        var browseButton = $('#'+this.settings.browse_button.replace(/:/g,'\\:'));
        // Auto-display a file picker
        browseButton.trigger('click');

      }
    });
  };
})(jQuery);

/**
 * Main default options for the uploader
 */
jQuery.fn.uploader.defaults = {
  caption : "Files",
  captionClass : '',
  addBtnCaption : 'Add {1}',
  msgPhoto : 'photo',
  msgFile : 'file',
  msgLink : 'link',
  msgNewImage : 'New {1}',
  msgDelete : 'Delete this item',
  msgUseAddFileBtn: 'Use the Add file button to select a file from your local disk. Files of type {1} are allowed.',
  msgUseAddLinkBtn: 'Use the Add link button to add a link to information stored elsewhere on the internet. You can enter links from {1}.',
  msgCaptionPlaceholder: 'Enter caption...',
  helpText : '',
  helpTextClass: 'helpText',
  useFancybox: true,
  imageWidth: 200,
  resizeWidth: 0,
  resizeHeight: 0,
  resizeQuality: 90,
  upload : true,
  maxFileCount : 4,
  existingFiles : [],
  buttonTemplate : '<button id="{id}" type="button"{class} title="{title}">{caption}</button>',
  file_boxTemplate : '<fieldset class="ui-corner-all">\n<legend class={captionClass}>{caption}</legend>\n{uploadSelectBtn}\n{linkSelectBtn}\n' +
    '<div class="filelist"></div>' +
    '</fieldset>\n<p class="{helpTextClass}">{helpText}</p>',
  file_box_initial_link_infoTemplate : '<div id="link-{linkRequestId}" class="ui-widget-content ui-corner-all link"><div class="ui-widget-header ui-corner-all ui-helper-clearfix"><span id="link-title-{linkRequestId}">Loading...</span> ' +
          '<span class="delete-file ind-delete-icon" id="del-{id}"></span></div>'+
          '<div id="link-embed-{linkRequestId}"></div></div>',
  file_box_initial_file_infoTemplate : '<div id="{id}" class="ui-widget-content ui-corner-all mediafile"><div class="ui-widget-header ui-corner-all ui-helper-clearfix"><span>{filename}</span> ' +
          '<span class="delete-file ind-delete-icon" id="del-{id}"></span></div><div class="progress-wrapper"><progress class="progress" value="0" max="100">0 %</progress>'+
          '<div class="progress-percent"></div><div class="progress-gif"></div></div><div class="media-wrapper"></div></div>',
  file_box_uploaded_extra_fieldsTemplate : '<input type="hidden" name="{idField}" id="{idField}" value="{idValue}" />' +
      '<input type="hidden" name="{pathField}" id="{pathField}" value="{pathValue}" />' +
      '<input type="hidden" name="{typeField}" id="{typeField}" value="{typeValue}" />' +
      '<input type="hidden" name="{typeNameField}" id="{typeNameField}" value="{typeNameValue}" />' +
      '<input type="hidden" name="{deletedField}" id="{deletedField}" value="{deletedValue}" class="deleted-value" />' +
      '<input type="hidden" id="{isNewField}" value="{isNewValue}" />' +
      '<input type="text" maxlength="100" style="width: {imagewidth}px" name="{captionField}" id="{captionField}" value="{captionValue}" placeholder="{captionPlaceholder}" />',
  file_box_uploaded_licence_fieldTemplate: '<input type="hidden" name="{licenceIdField}" id="{licenceIdField}" value="{licenceIdValue}" />',
  file_box_uploaded_linkTemplate : '<div>{embed}</div>',
  file_box_uploaded_imageTemplate : '<a class="fancybox" href="{origfilepath}"><img src="{thumbnailfilepath}" width="{imagewidth}"/></a>',
  file_box_uploaded_audioTemplate : '<audio controls src="{origfilepath}" type="audio/mpeg"/>',
  file_box_uploaded_pdfTemplate : '<div><a href="{origfilepath}" target="_blank" class="file-icon pdf"></a></div>',
  file_box_uploaded_genericTemplate : '<div><span class="file-icon"></span></div>',
  msgUploadError : 'An error occurred uploading the file.',
  msgFileTooBig : 'The file is too big to upload. Please resize it then try again.',
  msgTooManyFiles : 'Only [0] files can be uploaded.',
  msgDuplicateLink : 'You\'ve already to that web address.',
  msgNoembedResponseError : 'An error occurred trying to link to that resource. Are you sure the URL is correct and that you are connected to the internet?',
  uploadScript : 'upload.php',
  destinationFolder : '',
  relativeImageFolder: '',
  runtimes : 'html5,flash,silverlight,html4',
  mediaTypes : ["Image:Local"],
  fileTypes : {
    image : ["jpg", "gif", "png", "jpeg"],
    pdf : ["pdf"],
    audio : ["mp3", "wav"],
    zerocrossing: ['zc']
  }
};