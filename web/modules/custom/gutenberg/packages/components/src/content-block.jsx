/* global Drupal, drupalSettings */
import { useState, useEffect, useCallback } from '@wordpress/element';
import { InspectorControls } from '@wordpress/block-editor';
import {
  SelectControl,
  Card,
  CardBody,
  Placeholder,
  Spinner,
} from '@wordpress/components';

const __ = Drupal.t;

function openBlockSettings(type, contentBlockId) {
  const entityId = drupalSettings.gutenberg.entityId || null;
  const entityType = 'node';
  const entityBundle = drupalSettings.gutenberg.nodeType;
  const ajaxSettings = {
    url: Drupal.url(
      `editor/content_block_type/settings/${type}/${contentBlockId}/${entityType}/${entityId}/${entityBundle}`,
    ),
    dialogType: 'dialog',
    dialogRenderer: 'sidebar',
  };
  Drupal.ajax(ajaxSettings).execute();
}

function RenderedEntity({ id, viewMode = 'default' }) {
  const [html, setHtml] = useState(null);

  useEffect(() => {
    setHtml(null);

    fetch(Drupal.url(`editor/content_block/render/${id}/${viewMode}`), {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    })
      .then((response) => response.json())
      .then((commands) => {
        // Drupal AJAX response is an array of commands.
        // Find the insert/html command and extract its rendered HTML.
        const insertCmd = commands.find(
          (cmd) => cmd.command === 'insert' && cmd.method === 'html',
        );
        if (insertCmd?.data) {
          setHtml(insertCmd.data);
        }
      })
      .catch(() => {
        setHtml(
          `<p>${__('An error occurred when loading the content block.')}</p>`,
        );
      });
  }, [id, viewMode]);

  if (html === null) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  return (
    <div
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function ContentBlock({
  type,
  contentBlockId,
  name,
  viewMode: viewModeOriginal,
  onViewModeChange,
}) {
  const settingsFormRef = useCallback(
    (node) => {
      if (node !== null) {
        openBlockSettings(type, contentBlockId);
      }
    },
    [type, contentBlockId],
  );

  const [viewMode, setViewMode] = useState(viewModeOriginal);
  const [viewModeOptions, setViewModeOptions] = useState([]);

  useEffect(() => {
    if (onViewModeChange) {
      onViewModeChange(viewMode);
    }
  }, [viewMode, onViewModeChange]);

  useEffect(() => {
    const fetchViewModes = async () => {
      const response = await fetch(
        Drupal.url(`editor/entity/view_modes/block_content/${type}`),
      );
      const result = await response.json();
      setViewModeOptions(result.view_modes);
    };
    fetchViewModes();
  }, [type]);

  return (
    <div>
      <InspectorControls key="content-block-settings">
        <Card>
          <CardBody>
            <SelectControl
              label={__('View mode')}
              value={viewMode}
              options={Object.entries(viewModeOptions).map(([k, v]) => ({
                label: v,
                value: k,
              }))}
              onChange={(newValue) => setViewMode(newValue)}
              __nextHasNoMarginBottom
            />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div ref={settingsFormRef} id="gutenberg-sidebar-dialog">
              <Spinner />
            </div>
          </CardBody>
        </Card>
      </InspectorControls>
      {!contentBlockId && (
        <Placeholder icon="media-document" label={name}>
          <div className="content-blocks__placeholder">
            <div className="content-blocks__placeholder__description">
              <p>{Drupal.t('This content block is not configured.')}</p>
              <p>{Drupal.t('Fill the form at the sidebar to configure it.')}</p>
            </div>
          </div>
        </Placeholder>
      )}
      {contentBlockId && (
        <RenderedEntity id={contentBlockId} viewMode={viewMode} />
      )}
    </div>
  );
}

export default ContentBlock;
