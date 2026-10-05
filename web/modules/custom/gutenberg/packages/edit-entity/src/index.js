import './style.scss';
import { store as blocksStore } from '@wordpress/blocks';
import {
	registerCoreBlocks,
	__experimentalRegisterExperimentalCoreBlocks,
} from '@wordpress/block-library';
import deprecated from '@wordpress/deprecated';
import { createRoot, StrictMode } from '@wordpress/element';
import { dispatch } from '@wordpress/data';
import { store as preferencesStore } from '@wordpress/preferences';
import {
	registerLegacyWidgetBlock,
	registerWidgetGroupBlock,
} from '@wordpress/widgets';
import { privateApis as editorPrivateApis } from '@wordpress/editor';
import Layout from './components/layout';
import { unlock } from './lock-unlock';

const {
	BackButton: __experimentalMainDashboardButton,
	registerCoreBlockBindingsSources,
} = unlock( editorPrivateApis );

/**
 * Initializes and returns an instance of Editor.
 *
 * @param {string}  id           Unique identifier for editor instance.
 * @param {string}  postType     Post type of the post to edit.
 * @param {Object}  postId       ID of the post to edit.
 * @param {?Object} settings     Editor settings object.
 * @param {Object}  initialEdits Programmatic edits to apply initially, to be
 *                               considered as non-user-initiated (bypass for
 *                               unsaved changes prompt).
 */
export function initializeEditor(
	id,
	postType,
	postId,
	settings,
	initialEdits
) {
	const target = document.getElementById( id );
	const root = createRoot( target );

	dispatch( preferencesStore ).setDefaults( 'core/edit-post', {
		fullscreenMode: true,
		themeStyles: true,
		welcomeGuide: true,
		welcomeGuideTemplate: true,
	} );

	dispatch( preferencesStore ).setDefaults( 'core', {
		allowRightClickOverrides: true,
		editorMode: 'visual',
		fixedToolbar: false,
		hiddenBlockTypes: [],
		inactivePanels: [],
		openPanels: [ 'post-status' ],
		showBlockBreadcrumbs: true,
		showIconLabels: false,
		showListViewByDefault: false,
		enableChoosePatternModal: true,
		isPublishSidebarEnabled: true,
		showCollaborationCursor: false,
		showCollaborationJoinNotifications: true,
		showCollaborationLeaveNotifications: true,
		showCollaborationPostSaveNotifications: true,
	} );

	if ( window.__clientSideMediaProcessing ) {
		dispatch( preferencesStore ).setDefaults( 'core/media', {
			requireApproval: true,
			optimizeOnUpload: true,
		} );
	}

	dispatch( blocksStore ).reapplyBlockTypeFilters();

	registerCoreBlocks();
	registerCoreBlockBindingsSources();
	registerLegacyWidgetBlock( { inserter: false } );
	registerWidgetGroupBlock( { inserter: false } );
	if ( globalThis.IS_GUTENBERG_PLUGIN ) {
		__experimentalRegisterExperimentalCoreBlocks( {
			enableFSEBlocks: settings.__unstableEnableFullSiteEditingBlocks,
		} );
	}

	// Show a console log warning if the browser is not in Standards rendering mode.
	const documentMode =
		document.compatMode === 'CSS1Compat' ? 'Standards' : 'Quirks';
	if ( documentMode !== 'Standards' ) {
		// eslint-disable-next-line no-console
		console.warn(
			"Your browser is using Quirks Mode. \nThis can cause rendering issues such as blocks overlaying meta boxes in the editor. Quirks Mode can be triggered by PHP errors or HTML code appearing before the opening <!DOCTYPE html>. Try checking the raw page source or your site's PHP error log and resolving errors there, removing any HTML before the doctype, or disabling plugins."
		);
	}

	// Prevent the default browser action for files dropped outside of dropzones.
	window.addEventListener( 'dragover', ( e ) => e.preventDefault(), false );
	window.addEventListener( 'drop', ( e ) => e.preventDefault(), false );

	// Drupal: upstream drives core-data resolvers against the WordPress REST
	// preload cache here before mounting. Drupal has no such cache and most of
	// those endpoints (themes, global styles, templates, autosaves) do not
	// exist, so render right away and let EditorProvider run setupEditor.
	root.render(
		<StrictMode>
			<Layout
				settings={ settings }
				postId={ postId }
				postType={ postType }
				initialEdits={ initialEdits }
			/>
		</StrictMode>
	);

	return root;
}

/**
 * Used to reinitialize the editor after an error. Now it's a deprecated noop function.
 */
export function reinitializeEditor() {
	deprecated( 'wp.editPost.reinitializeEditor', {
		since: '6.2',
		version: '6.3',
	} );
}

export { default as __experimentalFullscreenModeClose } from './components/back-button/fullscreen-mode-close';
export { __experimentalMainDashboardButton };
export { store } from './store';
export * from './deprecated';
