"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/block-library/src/playlist/edit.jsx
var edit_exports = {};
__export(edit_exports, {
  default: () => edit_default
});
module.exports = __toCommonJS(edit_exports);
var import_clsx = __toESM(require("clsx"));
var import_element = require("@wordpress/element");
var import_block_editor = require("@wordpress/block-editor");
var import_components = require("@wordpress/components");
var import_data = require("@wordpress/data");
var import_notices = require("@wordpress/notices");
var import_i18n = require("@wordpress/i18n");
var import_icons = require("@wordpress/icons");
var import_blocks = require("@wordpress/blocks");
var import_blob = require("@wordpress/blob");
var import_caption = require("../utils/caption.cjs");
var import_hooks = require("../utils/hooks.cjs");
var import_waveform_player = require("../utils/waveform-player.cjs");
var import_context = require("./context.cjs");
var import_utils = require("./utils.cjs");
var import_jsx_runtime = require("react/jsx-runtime");
var ALLOWED_MEDIA_TYPES = ["audio"];
var AUDIO_FILE_EXTENSION = /\.(aac|aif|aiff|flac|m4a|m4b|mp3|oga|ogg|opus|wav|weba)$/i;
var DEFAULT_WAVEFORM_STYLE = "bars";
var FILE_LIST_OBJECT_NAME = "[object FileList]";
var WAVEFORM_STYLE_OPTIONS = [
  { label: (0, import_i18n._x)("Bars", "waveform style option"), value: "bars" },
  { label: (0, import_i18n._x)("Mirror", "waveform style option"), value: "mirror" },
  { label: (0, import_i18n._x)("Line", "waveform style option"), value: "line" },
  { label: (0, import_i18n._x)("Blocks", "waveform style option"), value: "blocks" },
  { label: (0, import_i18n._x)("Dots", "waveform style option"), value: "dots" },
  { label: (0, import_i18n._x)("Seekbar", "waveform style option"), value: "seekbar" }
];
function isFile(value) {
  return Object.prototype.toString.call(value) === "[object File]" || typeof File !== "undefined" && value instanceof File;
}
function isAudioFile(file) {
  return file.type ? file.type.startsWith("audio/") : AUDIO_FILE_EXTENSION.test(file.name);
}
function getTrackIdentifier(track) {
  return track.id ?? track.src ?? track.blob;
}
var PlaylistEdit = ({
  attributes,
  setAttributes,
  isSelected,
  insertBlocksAfter,
  clientId
}) => {
  const {
    order,
    showTracklist,
    showNumbers,
    showImages,
    showPlayButtonArtwork,
    showArtists,
    showTrackLength,
    waveformStyle = DEFAULT_WAVEFORM_STYLE,
    waveformColor,
    waveformGradient,
    waveformBackgroundColor,
    waveformBackgroundGradient
  } = attributes;
  const blockProps = (0, import_block_editor.useBlockProps)();
  const waveformPanelId = `${clientId}-waveform`;
  const {
    replaceInnerBlocks,
    replaceBlocks,
    insertBlocks,
    selectBlock,
    __unstableMarkNextChangeAsNotPersistent
  } = (0, import_data.useDispatch)(import_block_editor.store);
  const { createErrorNotice } = (0, import_data.useDispatch)(import_notices.store);
  const dropdownMenuProps = (0, import_hooks.useToolsPanelDropdownMenuProps)();
  const colorGradientSettings = (0, import_block_editor.__experimentalUseMultipleOriginColorsAndGradients)();
  const colors = (0, import_element.useMemo)(
    () => colorGradientSettings.colors.flatMap(
      (origin) => origin?.colors ?? []
    ),
    [colorGradientSettings.colors]
  );
  const gradients = (0, import_element.useMemo)(
    () => colorGradientSettings.gradients.flatMap(
      (origin) => origin?.gradients ?? []
    ),
    [colorGradientSettings.gradients]
  );
  const hasColors = colors.length > 0 || !colorGradientSettings.disableCustomColors;
  const hasGradients = gradients.length > 0 || !colorGradientSettings.disableCustomGradients;
  const waveformGradientValue = waveformGradient;
  const waveformBackgroundGradientValue = waveformBackgroundGradient;
  let waveformColorGradientChange;
  let waveformBackgroundColorGradientChange;
  const onUploadError = (0, import_element.useCallback)(
    (message) => {
      createErrorNotice(message, { type: "snackbar" });
    },
    [createErrorNotice]
  );
  const [currentTrackClientId, setCurrentTrackClientId] = (0, import_element.useState)(null);
  const { innerBlockTracks } = (0, import_data.useSelect)(
    (select) => {
      const { getBlock: _getBlock } = select(import_block_editor.store);
      return {
        innerBlockTracks: _getBlock(clientId)?.innerBlocks ?? []
      };
    },
    [clientId]
  );
  const validTracks = (0, import_element.useMemo)(
    () => innerBlockTracks.filter(
      (block) => !!block.attributes.src || !!block.attributes.blob
    ),
    [innerBlockTracks]
  );
  const tracks = (0, import_element.useMemo)(
    () => validTracks.map((block) => ({
      ...block.attributes,
      clientId: block.clientId
    })),
    [validTracks]
  );
  (0, import_element.useEffect)(() => {
    if (validTracks.length === 0) {
      if (currentTrackClientId !== null) {
        setCurrentTrackClientId(null);
      }
      return;
    }
    const currentTrackExists = validTracks.some(
      (block) => block.clientId === currentTrackClientId
    );
    if (!currentTrackExists) {
      setCurrentTrackClientId(validTracks[0].clientId);
    }
  }, [currentTrackClientId, setCurrentTrackClientId, validTracks]);
  (0, import_element.useEffect)(() => {
    if (validTracks.length > 0 || innerBlockTracks.length === 0) {
      return;
    }
    __unstableMarkNextChangeAsNotPersistent();
    replaceInnerBlocks(clientId, []);
  }, [
    clientId,
    innerBlockTracks,
    replaceInnerBlocks,
    validTracks,
    __unstableMarkNextChangeAsNotPersistent
  ]);
  const createTrackBlocks = (0, import_element.useCallback)(
    (media) => {
      if (!media) {
        return [];
      }
      let mediaItems = [media];
      if (Object.prototype.toString.call(media) === FILE_LIST_OBJECT_NAME) {
        mediaItems = Array.from(media);
      } else if (Array.isArray(media)) {
        mediaItems = media;
      }
      let hasInvalidFile = false;
      const blocks = mediaItems.map((mediaItem) => {
        if (isFile(mediaItem)) {
          if (!isAudioFile(mediaItem)) {
            hasInvalidFile = true;
            return null;
          }
          return (0, import_blocks.createBlock)("core/playlist-track", {
            blob: (0, import_blob.createBlobURL)(mediaItem),
            title: mediaItem.name
          });
        }
        const track = (0, import_utils.getTrackAttributes)(mediaItem);
        return track.src ? (0, import_blocks.createBlock)("core/playlist-track", track) : null;
      }).filter(Boolean);
      if (hasInvalidFile) {
        onUploadError(
          (0, import_i18n.__)("Only audio files can be added to a playlist.")
        );
      }
      return blocks;
    },
    [onUploadError]
  );
  const onSelectTracks = (0, import_element.useCallback)(
    (media) => {
      const newBlocks = createTrackBlocks(media);
      if (newBlocks.length === 0) {
        return;
      }
      setCurrentTrackClientId(newBlocks[0]?.clientId ?? null);
      replaceInnerBlocks(clientId, newBlocks);
    },
    [
      clientId,
      createTrackBlocks,
      replaceInnerBlocks,
      setCurrentTrackClientId
    ]
  );
  const onAddTracks = (0, import_element.useCallback)(
    (media) => {
      const existingIds = new Set(
        validTracks.map((block) => getTrackIdentifier(block.attributes)).filter(Boolean)
      );
      const newBlocks = createTrackBlocks(media).filter(
        (block) => !existingIds.has(getTrackIdentifier(block.attributes))
      );
      if (newBlocks.length === 0) {
        return;
      }
      setCurrentTrackClientId(newBlocks[0].clientId);
      insertBlocks(newBlocks, void 0, clientId, false);
      selectBlock(newBlocks[0].clientId);
    },
    [
      clientId,
      createTrackBlocks,
      insertBlocks,
      selectBlock,
      setCurrentTrackClientId,
      validTracks
    ]
  );
  const removeTrack = (0, import_element.useCallback)(
    (trackClientId) => {
      replaceBlocks(trackClientId, []);
    },
    [replaceBlocks]
  );
  const playlistContext = (0, import_element.useMemo)(
    () => ({
      currentTrackClientId,
      setCurrentTrackClientId,
      removeTrack
    }),
    [currentTrackClientId, setCurrentTrackClientId, removeTrack]
  );
  const currentTrackData = tracks.find((track) => track.clientId === currentTrackClientId) ?? tracks[0];
  const onTrackEnded = (0, import_element.useCallback)(() => {
    const currentIndex = tracks.findIndex(
      (track) => track.clientId === currentTrackClientId
    );
    const nextTrack = tracks[currentIndex + 1] || tracks[0];
    if (nextTrack?.clientId) {
      setCurrentTrackClientId(nextTrack.clientId);
    }
  }, [currentTrackClientId, setCurrentTrackClientId, tracks]);
  const onChangeOrder = (0, import_element.useCallback)(
    (trackOrder) => {
      const sortedBlocks = [...innerBlockTracks].sort((a, b) => {
        const titleA = a.attributes.title || "";
        const titleB = b.attributes.title || "";
        if (trackOrder === "asc") {
          return titleA.localeCompare(titleB);
        }
        return titleB.localeCompare(titleA);
      });
      replaceInnerBlocks(clientId, sortedBlocks);
      setCurrentTrackClientId(sortedBlocks[0]?.clientId ?? null);
      setAttributes({
        order: trackOrder
      });
    },
    [
      clientId,
      innerBlockTracks,
      replaceInnerBlocks,
      setAttributes,
      setCurrentTrackClientId
    ]
  );
  function toggleAttribute(attribute) {
    return (newValue) => {
      setAttributes({ [attribute]: newValue });
    };
  }
  const onChangeWaveformStyle = (0, import_element.useCallback)(
    (newWaveformStyle) => {
      setAttributes({
        waveformStyle: newWaveformStyle === DEFAULT_WAVEFORM_STYLE ? void 0 : newWaveformStyle
      });
    },
    [setAttributes]
  );
  function updateWaveformColor(colorValue) {
    const isSettingColor = colorValue !== void 0;
    if (!isSettingColor && waveformColorGradientChange === "gradient") {
      waveformColorGradientChange = void 0;
      return;
    }
    waveformColorGradientChange = "color";
    setAttributes({
      waveformColor: colorValue,
      waveformGradient: void 0
    });
  }
  function updateWaveformGradient(gradientValue) {
    const isSettingGradient = gradientValue !== void 0;
    if (!isSettingGradient && waveformColorGradientChange === "color") {
      waveformColorGradientChange = void 0;
      return;
    }
    waveformColorGradientChange = "gradient";
    setAttributes({
      waveformGradient: gradientValue,
      waveformColor: void 0
    });
  }
  function updateWaveformBackgroundColor(colorValue) {
    const isSettingColor = colorValue !== void 0;
    if (!isSettingColor && waveformBackgroundColorGradientChange === "gradient") {
      waveformBackgroundColorGradientChange = void 0;
      return;
    }
    waveformBackgroundColorGradientChange = "color";
    setAttributes({
      waveformBackgroundColor: colorValue,
      waveformBackgroundGradient: void 0
    });
  }
  function updateWaveformBackgroundGradient(gradientValue) {
    const isSettingGradient = gradientValue !== void 0;
    if (!isSettingGradient && waveformBackgroundColorGradientChange === "color") {
      waveformBackgroundColorGradientChange = void 0;
      return;
    }
    waveformBackgroundColorGradientChange = "gradient";
    setAttributes({
      waveformBackgroundGradient: gradientValue,
      waveformBackgroundColor: void 0
    });
  }
  const colorSettings = [];
  if (hasColors || hasGradients) {
    colorSettings.push(
      {
        colorValue: hasColors ? waveformColor : void 0,
        gradientValue: hasGradients ? waveformGradientValue : void 0,
        label: (0, import_i18n.__)("Waveform & Play button"),
        onColorChange: hasColors ? updateWaveformColor : void 0,
        onGradientChange: hasGradients ? updateWaveformGradient : void 0,
        isShownByDefault: true,
        clearable: true,
        enableAlpha: true,
        resetAllFilter: () => ({
          waveformColor: void 0,
          waveformGradient: void 0
        })
      },
      {
        colorValue: hasColors ? waveformBackgroundColor : void 0,
        gradientValue: hasGradients ? waveformBackgroundGradientValue : void 0,
        label: (0, import_i18n.__)("Waveform background"),
        onColorChange: hasColors ? updateWaveformBackgroundColor : void 0,
        onGradientChange: hasGradients ? updateWaveformBackgroundGradient : void 0,
        isShownByDefault: true,
        clearable: true,
        enableAlpha: true,
        resetAllFilter: () => ({
          waveformBackgroundColor: void 0,
          waveformBackgroundGradient: void 0
        })
      }
    );
  }
  const { children: innerBlocks, ...trackListProps } = (0, import_block_editor.useInnerBlocksProps)(
    {
      className: (0, import_clsx.default)("wp-block-playlist__tracklist", {
        "wp-block-playlist__tracklist-is-hidden": !showTracklist,
        "wp-block-playlist__tracklist-show-numbers": showNumbers,
        "wp-block-playlist__tracklist-length-is-hidden": !showTrackLength
      })
    },
    {
      __experimentalAppenderTagName: "li",
      renderAppender: false
    }
  );
  if (tracks.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        ...blockProps,
        className: (0, import_clsx.default)("is-placeholder", blockProps.className),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_block_editor.MediaPlaceholder,
          {
            icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockIcon, { icon: import_icons.playlist }),
            labels: {
              title: (0, import_i18n.__)("Playlist"),
              instructions: (0, import_i18n.__)(
                "Upload an audio file or pick one from your media library."
              )
            },
            onSelect: onSelectTracks,
            accept: "audio/*",
            multiple: "add",
            handleUpload: false,
            allowedTypes: ALLOWED_MEDIA_TYPES,
            onError: onUploadError
          }
        )
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.BlockControls, { group: "other", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_block_editor.MediaReplaceFlow,
      {
        name: (0, import_i18n.__)("Add track"),
        onSelect: onAddTracks,
        accept: "audio/*",
        multiple: "add",
        handleUpload: false,
        allowedTypes: ALLOWED_MEDIA_TYPES,
        onError: onUploadError
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Settings"),
        resetAll: () => {
          setAttributes({
            showTracklist: true,
            showArtists: true,
            showNumbers: true,
            showTrackLength: true,
            showImages: true,
            showPlayButtonArtwork: false,
            order: "asc"
          });
        },
        dropdownMenuProps,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Show tracklist"),
              isShownByDefault: true,
              hasValue: () => showTracklist !== true,
              onDeselect: () => setAttributes({ showTracklist: true }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show tracklist"),
                  onChange: toggleAttribute("showTracklist"),
                  checked: showTracklist
                }
              )
            }
          ),
          showTracklist && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.__experimentalToolsPanelItem,
              {
                label: (0, import_i18n.__)("Show artist name in tracklist"),
                isShownByDefault: true,
                hasValue: () => showArtists !== true,
                onDeselect: () => setAttributes({ showArtists: true }),
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.ToggleControl,
                  {
                    label: (0, import_i18n.__)(
                      "Show artist name in tracklist"
                    ),
                    onChange: toggleAttribute(
                      "showArtists"
                    ),
                    checked: showArtists
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.__experimentalToolsPanelItem,
              {
                label: (0, import_i18n.__)(
                  "Show track numbers in tracklist"
                ),
                isShownByDefault: true,
                hasValue: () => showNumbers !== true,
                onDeselect: () => setAttributes({ showNumbers: true }),
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.ToggleControl,
                  {
                    label: (0, import_i18n.__)(
                      "Show track numbers in tracklist"
                    ),
                    onChange: toggleAttribute(
                      "showNumbers"
                    ),
                    checked: showNumbers
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.__experimentalToolsPanelItem,
              {
                label: (0, import_i18n.__)(
                  "Show track duration in tracklist"
                ),
                isShownByDefault: true,
                hasValue: () => showTrackLength !== true,
                onDeselect: () => setAttributes({ showTrackLength: true }),
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_components.ToggleControl,
                  {
                    label: (0, import_i18n.__)(
                      "Show track duration in tracklist"
                    ),
                    onChange: toggleAttribute(
                      "showTrackLength"
                    ),
                    checked: showTrackLength
                  }
                )
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Show tracklist images"),
              isShownByDefault: true,
              hasValue: () => showImages !== true,
              onDeselect: () => setAttributes({ showImages: true }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show tracklist images"),
                  onChange: toggleAttribute("showImages"),
                  checked: showImages
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Show track image on play button"),
              isShownByDefault: true,
              hasValue: () => showPlayButtonArtwork === true,
              onDeselect: () => setAttributes({ showPlayButtonArtwork: false }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.ToggleControl,
                {
                  label: (0, import_i18n.__)("Show track image on play button"),
                  onChange: toggleAttribute(
                    "showPlayButtonArtwork"
                  ),
                  checked: showPlayButtonArtwork === true
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Order"),
              isShownByDefault: true,
              hasValue: () => order !== "asc",
              onDeselect: () => setAttributes({ order: "asc" }),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.SelectControl,
                {
                  label: (0, import_i18n.__)("Order"),
                  value: order,
                  options: [
                    { label: (0, import_i18n.__)("Descending"), value: "desc" },
                    { label: (0, import_i18n.__)("Ascending"), value: "asc" }
                  ],
                  onChange: (value) => onChangeOrder(value)
                }
              )
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_block_editor.InspectorControls, { group: "styles", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalToolsPanel,
      {
        label: (0, import_i18n.__)("Waveform"),
        resetAll: () => {
          setAttributes({
            waveformStyle: void 0,
            waveformColor: void 0,
            waveformGradient: void 0,
            waveformBackgroundColor: void 0,
            waveformBackgroundGradient: void 0
          });
        },
        panelId: waveformPanelId,
        dropdownMenuProps,
        children: [
          colorSettings.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wp-block-playlist__waveform-color-controls", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_block_editor.__experimentalColorGradientSettingsDropdown,
            {
              __experimentalIsRenderedInSidebar: true,
              settings: colorSettings,
              panelId: waveformPanelId,
              ...colorGradientSettings
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.__experimentalToolsPanelItem,
            {
              label: (0, import_i18n.__)("Shape"),
              isShownByDefault: true,
              hasValue: () => waveformStyle !== DEFAULT_WAVEFORM_STYLE,
              onDeselect: () => onChangeWaveformStyle(DEFAULT_WAVEFORM_STYLE),
              panelId: waveformPanelId,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_components.SelectControl,
                {
                  label: (0, import_i18n.__)("Shape"),
                  value: waveformStyle,
                  options: WAVEFORM_STYLE_OPTIONS,
                  onChange: onChangeWaveformStyle
                }
              )
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { ...blockProps, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_block_editor.MediaPlaceholder,
        {
          onSelect: onAddTracks,
          accept: "audio/*",
          multiple: "add",
          handleUpload: false,
          disableMediaButtons: true,
          allowedTypes: ALLOWED_MEDIA_TYPES,
          onError: onUploadError
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Disabled, { isDisabled: !isSelected, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_waveform_player.WaveformPlayer,
        {
          src: currentTrackData?.src,
          title: currentTrackData?.title,
          artist: currentTrackData?.artist,
          image: currentTrackData?.image,
          imageAlt: currentTrackData?.imageAlt,
          waveformStyle,
          color: waveformColor,
          gradient: waveformGradientValue,
          backgroundColor: waveformBackgroundColor,
          backgroundGradient: waveformBackgroundGradientValue,
          onEnded: onTrackEnded,
          showPlayButtonArtwork: showPlayButtonArtwork === true
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", { ...trackListProps, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_context.PlaylistContext.Provider, { value: playlistContext, children: innerBlocks }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_caption.Caption,
        {
          attributes,
          setAttributes,
          isSelected,
          insertBlocksAfter,
          label: (0, import_i18n.__)("Playlist caption text"),
          showToolbarButton: isSelected,
          style: { marginTop: 16 }
        }
      )
    ] })
  ] });
};
var edit_default = PlaylistEdit;
//# sourceMappingURL=edit.cjs.map
