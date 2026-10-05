/* global Drupal */
import { Fragment, useState, useEffect } from '@wordpress/element';
import { BlockControls } from '@wordpress/block-editor';
import {
  Placeholder,
  Toolbar,
  IconButton,
  Button,
  Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

async function getBlock(item, settings) {
  const response = await fetch(Drupal.url(`editor/blocks/load/${item}`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  const block = await response.json();

  return block;
}

function openBlockSettings(id, settings) {
  const ajaxSettings = {
    url: Drupal.url(`editor/blocks/settings/${id}`),
    dialogType: 'modal',
    dialog: {
      width: 600,
      position: { at: 'center center' },
    },
    submit: { settings },
  };
  Drupal.ajax(ajaxSettings).execute();
}

function processHtml(html) {
  const node = document.createElement('div');
  node.innerHTML = html;

  // Disable form elements
  const formElements = node.querySelectorAll(
    'input, select, button, textarea, checkbox, radio',
  );
  formElements.forEach((ele) => {
    ele.setAttribute('readonly', true);
    ele.setAttribute('required', false);
    ele.setAttribute('disabled', true);
  });

  return node.innerHTML;
}

function hasEmptyContent(html) {
  const node = document.createElement('div');
  node.innerHTML = html;

  return !node.innerText.trim();
}

function DrupalBlock(props) {
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState('');
  const [access, setAccess] = useState(false);
  const { id, settings, name, className } = props;

  useEffect(() => {
    setLoading(true);

    getBlock(id, settings)
      .then((block) => {
        setHtml(block.html);
        setAccess(block.access);
        setLoading(false);
      })
      .catch((r) => {
        setHtml(__('An error occurred when loading the block.') + r);
        setAccess(false);
        setLoading(false);
      });
  }, [id, settings]);

  return (
    <Fragment>
      <BlockControls>
        <Toolbar>
          <IconButton
            label={__('Open block settings')}
            icon="admin-generic"
            className="drupal-block-settings"
            onClick={() => openBlockSettings(id, settings)}
          />
        </Toolbar>
      </BlockControls>
      {loading && (
        <Placeholder
          label={`${name} ${__('block')}`}
          instructions={__('Loading block…')}
        >
          <Spinner />
        </Placeholder>
      )}

      {(!access || !html) && (
        <Placeholder
          label={`${name} ${__('block')}`}
          instructions={__(
            'Unable to render the block. You might need to check block settings or permissions.',
          )}
        >
          <Button
            icon="admin-generic"
            variant="primary"
            onClick={() => openBlockSettings(id, settings)}
          >
            {__('Block settings')}
          </Button>
        </Placeholder>
      )}

      {access && html && (
        <Fragment>
          <div
            className={className}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: processHtml(html) }}
          />
          {hasEmptyContent(html) && (
            <Placeholder
              label={`${name} ${__('block')}`}
              instructions={__('This block is rendering empty content.')}
            />
          )}
        </Fragment>
      )}
    </Fragment>
  );
}

export default DrupalBlock;
