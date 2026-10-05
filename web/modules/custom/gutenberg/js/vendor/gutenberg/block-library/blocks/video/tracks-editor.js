"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/block-library/src/video/tracks-editor.jsx
var tracks_editor_exports = {};
__export(tracks_editor_exports, {
  default: () => TracksEditor
});
module.exports = __toCommonJS(tracks_editor_exports);
var import_i18n = require("@wordpress/i18n");
var import_components = require("@wordpress/components");
var import_ui = require("@wordpress/ui");
var import_block_editor = require("@wordpress/block-editor");
var import_icons = require("@wordpress/icons");
var import_data = require("@wordpress/data");
var import_element = require("@wordpress/element");
var import_url = require("@wordpress/url");
var import_jsx_runtime = require("react/jsx-runtime");
var ALLOWED_TYPES = ["text/vtt"];
var DEFAULT_KIND = "subtitles";
var KIND_OPTIONS = [
  { label: (0, import_i18n.__)("Subtitles"), value: "subtitles" },
  { label: (0, import_i18n.__)("Captions"), value: "captions" },
  { label: (0, import_i18n.__)("Descriptions"), value: "descriptions" },
  { label: (0, import_i18n.__)("Chapters"), value: "chapters" },
  { label: (0, import_i18n.__)("Metadata"), value: "metadata" }
];
var DEFAULT_TRACK = {
  src: "",
  label: "",
  srcLang: "en",
  kind: DEFAULT_KIND,
  default: false
};
function TrackList({ tracks, onEditPress }) {
  const content = tracks.map((track, index) => {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.__experimentalHStack,
      {
        className: "block-library-video-tracks-editor__track-list-track",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: track.label }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalHStack, { justify: "flex-end", children: [
            track.default && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Badge, { intent: "none", children: (0, import_i18n.__)("Default") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.Button,
              {
                __next40pxDefaultSize: true,
                variant: "tertiary",
                onClick: () => onEditPress(index),
                "aria-label": (0, import_i18n.sprintf)(
                  /* translators: %s: Label of the video text track e.g: "French subtitles". */
                  (0, import_i18n._x)("Edit %s", "text tracks"),
                  track.label
                ),
                children: (0, import_i18n.__)("Edit")
              }
            )
          ] })
        ]
      },
      track.id ?? track.src
    );
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.MenuGroup,
    {
      label: (0, import_i18n.__)("Text tracks"),
      className: "block-library-video-tracks-editor__track-list",
      children: content
    }
  );
}
function SingleTrackEditor({
  track,
  onChange,
  onClose,
  onRemove,
  allowSettingDefault
}) {
  const [trackState, setTrackState] = (0, import_element.useState)({
    ...DEFAULT_TRACK,
    ...track
  });
  const { src, label, srcLang, kind, default: isDefaultTrack } = trackState;
  const fileName = src.startsWith("blob:") ? "" : (0, import_url.getFilename)(src) || "";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_components.__experimentalVStack,
    {
      className: "block-library-video-tracks-editor__single-track-editor",
      spacing: "4",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block-library-video-tracks-editor__single-track-editor-edit-track-label", children: (0, import_i18n.__)("Edit track") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
          (0, import_i18n.__)("File"),
          ": ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: fileName })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalGrid, { columns: 2, gap: 4, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.TextControl,
            {
              onChange: (newLabel) => setTrackState((prevTrackState) => ({
                ...prevTrackState,
                label: newLabel
              })),
              label: (0, import_i18n.__)("Label"),
              value: label,
              help: (0, import_i18n.__)("Title of track")
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.TextControl,
            {
              onChange: (newSrcLang) => setTrackState((prevTrackState) => ({
                ...prevTrackState,
                srcLang: newSrcLang
              })),
              label: (0, import_i18n.__)("Source language"),
              value: srcLang,
              help: (0, import_i18n.__)("Language tag (en, fr, etc.)")
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalVStack, { spacing: "4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.SelectControl,
            {
              className: "block-library-video-tracks-editor__single-track-editor-kind-select",
              options: KIND_OPTIONS,
              value: kind,
              label: (0, import_i18n.__)("Kind"),
              onChange: (newKind) => setTrackState((prevTrackState) => ({
                ...prevTrackState,
                kind: newKind
              }))
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_components.ToggleControl,
            {
              label: (0, import_i18n.__)("Set as default track"),
              checked: isDefaultTrack,
              disabled: !allowSettingDefault,
              onChange: (defaultTrack) => setTrackState((prevTrackState) => ({
                ...prevTrackState,
                default: defaultTrack
              }))
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.__experimentalHStack, { className: "block-library-video-tracks-editor__single-track-editor-buttons-container", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.Button,
              {
                __next40pxDefaultSize: true,
                isDestructive: true,
                variant: "link",
                onClick: onRemove,
                children: (0, import_i18n.__)("Remove track")
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.Button,
              {
                __next40pxDefaultSize: true,
                variant: "primary",
                onClick: () => {
                  onChange(trackState);
                  onClose();
                },
                children: (0, import_i18n.__)("Apply")
              }
            )
          ] })
        ] })
      ]
    }
  );
}
function TracksEditor({ tracks = [], onChange }) {
  const mediaUpload = (0, import_data.useSelect)((select) => {
    return select(import_block_editor.store).getSettings().mediaUpload;
  }, []);
  const [trackBeingEdited, setTrackBeingEdited] = (0, import_element.useState)(null);
  const dropdownPopoverRef = (0, import_element.useRef)();
  const handleTrackSelect = (selectedTracks = [], appendTracks = false) => {
    const existingTracksMap = new Map(
      tracks.map((track) => [track.id, track])
    );
    const tracksToAdd = selectedTracks.map(({ id, title, url }) => {
      if (existingTracksMap.has(id)) {
        return existingTracksMap.get(id);
      }
      return {
        ...DEFAULT_TRACK,
        id,
        label: title || "",
        src: url
      };
    });
    if (tracksToAdd.length === 0) {
      return;
    }
    onChange([...appendTracks ? tracks : [], ...tracksToAdd]);
  };
  function uploadFiles(event) {
    const files = event.target.files;
    mediaUpload({
      allowedTypes: ALLOWED_TYPES,
      filesList: files,
      onFileChange: (selectedTracks) => {
        if (!Array.isArray(selectedTracks)) {
          return;
        }
        const uploadedTracks = selectedTracks.filter(
          (track) => !!track?.id
        );
        if (!uploadedTracks.length) {
          return;
        }
        handleTrackSelect(uploadedTracks, true);
      }
    });
  }
  (0, import_element.useEffect)(() => {
    dropdownPopoverRef.current?.focus();
  }, [trackBeingEdited]);
  if (!mediaUpload) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_components.Dropdown,
    {
      contentClassName: "block-library-video-tracks-editor",
      focusOnMount: true,
      popoverProps: {
        ref: dropdownPopoverRef
      },
      renderToggle: ({ isOpen, onToggle }) => {
        const handleOnToggle = () => {
          if (!isOpen) {
            setTrackBeingEdited(null);
          }
          onToggle();
        };
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.ToolbarGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_components.ToolbarButton,
          {
            "aria-expanded": isOpen,
            "aria-haspopup": "true",
            onClick: handleOnToggle,
            children: (0, import_i18n.__)("Text tracks")
          }
        ) });
      },
      renderContent: () => {
        if (trackBeingEdited !== null) {
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            SingleTrackEditor,
            {
              track: tracks[trackBeingEdited],
              onChange: (newTrack) => {
                const newTracks = [...tracks];
                newTracks[trackBeingEdited] = newTrack;
                onChange(newTracks);
              },
              onClose: () => setTrackBeingEdited(null),
              onRemove: () => {
                onChange(
                  tracks.filter(
                    (_track, index) => index !== trackBeingEdited
                  )
                );
                setTrackBeingEdited(null);
              },
              allowSettingDefault: !tracks.some((track) => track.default) || tracks[trackBeingEdited].default
            }
          );
        }
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          tracks.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "block-library-video-tracks-editor__tracks-informative-message", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "block-library-video-tracks-editor__tracks-informative-message-title", children: (0, import_i18n.__)("Text tracks") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "block-library-video-tracks-editor__tracks-informative-message-description", children: (0, import_i18n.__)(
              "Tracks can be subtitles, captions, chapters, or descriptions. They help make your content more accessible to a wider range of users."
            ) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.NavigableMenu, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              TrackList,
              {
                tracks,
                onEditPress: setTrackBeingEdited
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_components.MenuGroup,
              {
                className: "block-library-video-tracks-editor__add-tracks-container",
                label: (0, import_i18n.__)("Add tracks"),
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_block_editor.MediaUploadCheck, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    import_block_editor.MediaUpload,
                    {
                      onSelect: handleTrackSelect,
                      allowedTypes: ALLOWED_TYPES,
                      value: tracks.map(({ id }) => id),
                      multiple: true,
                      render: ({ open }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                        import_components.MenuItem,
                        {
                          icon: import_icons.media,
                          onClick: open,
                          children: (0, import_i18n.__)("Open Media Library")
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    import_components.FormFileUpload,
                    {
                      onChange: uploadFiles,
                      accept: ".vtt,text/vtt",
                      multiple: true,
                      render: ({ openFileDialog }) => {
                        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          import_components.MenuItem,
                          {
                            icon: import_icons.upload,
                            onClick: openFileDialog,
                            children: (0, import_i18n._x)("Upload", "verb")
                          }
                        );
                      }
                    }
                  )
                ] })
              }
            )
          ] })
        ] });
      }
    }
  );
}
//# sourceMappingURL=tracks-editor.cjs.map
