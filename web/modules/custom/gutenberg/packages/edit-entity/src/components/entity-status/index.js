/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { createPortal, useEffect, useState } from '@wordpress/element';

/**
 * Shows the saved status of the entity next to the title in the document bar,
 * like the Navigation module's top bar badge.
 *
 * The document bar has no slot for it, and it re-renders its title element
 * (it is keyed on the back button), so the badge follows that element.
 *
 * @see _gutenberg_attach_page_context()
 */
export default function EntityStatus() {
	const status = window.drupalSettings?.gutenberg?.entityStatus;
	const [ container, setContainer ] = useState( null );

	useEffect( () => {
		if ( ! status ) {
			return undefined;
		}
		const findContainer = () =>
			setContainer(
				document.querySelector( '.editor-document-bar__title' )
			);
		findContainer();
		const observer = new window.MutationObserver( findContainer );
		observer.observe(
			document.querySelector( '.editor-header' ) ?? document.body,
			{ childList: true, subtree: true }
		);
		return () => observer.disconnect();
	}, [ status ] );

	if ( ! status || ! container ) {
		return null;
	}

	return createPortal(
		<span
			className={ clsx( 'drupal-entity-status', {
				'is-published': status.published,
			} ) }
		>
			{ status.label }
		</span>,
		container
	);
}
