/* global drupalSettings */
import { Fill, MenuGroup } from '@wordpress/components';
import { privateApis as editorPrivateApis } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { unlock } from '../../lock-unlock';

const { MoreMenuItem } = unlock( editorPrivateApis );

/**
 * Lists the entity's local tasks (View, Revisions, Translate, ...).
 *
 * They replace the Navigation module's top bar page actions, which is removed
 * on the editor page. The DrupalMoreMenuTop slot at the top of the Options
 * menu is added by patches/@wordpress+editor+*.patch.
 *
 * @see _gutenberg_attach_page_context()
 */
function PageActionsMenuGroup() {
	const pageActions = drupalSettings?.gutenberg?.pageActions ?? [];

	if ( ! pageActions.length ) {
		return null;
	}

	// The editor's Menu.Group isn't exposed, and @wordpress/ui is bundled per
	// package, so its components don't share the menu's context. MenuGroup
	// only needs the markup, and MoreMenuItem comes from the editor itself.
	return (
		<Fill name="DrupalMoreMenuTop">
			<MenuGroup
				label={ __( 'Page actions' ) }
				className="drupal-page-actions-menu-group"
			>
				{ pageActions.map( ( { title, url } ) => (
					<MoreMenuItem key={ url } href={ url }>
						{ title }
					</MoreMenuItem>
				) ) }
			</MenuGroup>
		</Fill>
	);
}

export default PageActionsMenuGroup;
