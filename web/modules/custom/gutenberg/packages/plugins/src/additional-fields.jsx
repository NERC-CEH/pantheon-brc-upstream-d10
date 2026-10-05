import { Fragment } from '@wordpress/element';
import { PanelBody } from '@wordpress/components';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/editor';

function AdditionalFieldsPluginSidebar() {
  return (
    <Fragment>
      <PluginSidebarMoreMenuItem target="gutenberg-boilerplate-sidebar">
        Gutenberg Boilerplate
      </PluginSidebarMoreMenuItem>
      <PluginSidebar
        name="additional-fields"
        title="Additional fields"
        icons="forms"
        isPinnable="false"
      >
        <PanelBody />
      </PluginSidebar>
    </Fragment>
  );
}

window.DrupalGutenberg = window.DrupalGutenberg || {};
window.DrupalGutenberg.Plugins = window.DrupalGutenberg.Plugins || {};
window.DrupalGutenberg.Plugins.AdditionalFieldsPluginSidebar =
  AdditionalFieldsPluginSidebar;
