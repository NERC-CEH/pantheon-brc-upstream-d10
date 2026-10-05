/**
 * WordPress dependencies
 */
import { useRef, useEffect, useState, useCallback } from '@wordpress/element';
import { chevronDown } from '@wordpress/icons';
import { Icon, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import EntityStatus from '../entity-status';

/**
 * @param {Object}  props
 * @param {boolean} props.disabled        Whether the actions are disabled.
 * @param {boolean} props.isEditingEntity Whether the Drupal entity itself is
 *                                        edited, not e.g. a synced pattern.
 */
export default function DrupalFormActions( { disabled, isEditingEntity } ) {
	const containerRef = useRef( null );
	const menuRef = useRef( null );
	const [ isOpen, setIsOpen ] = useState( false );
	const [ hasSecondary, setHasSecondary ] = useState( false );

	useEffect( () => {
		const headerSettings = document.querySelector(
			'.gutenberg-header-settings'
		);
		if ( ! headerSettings || ! containerRef.current ) {
			return;
		}

		// Remember the original parent so we can restore on unmount.
		const originalParent = headerSettings.parentNode;

		// Move the Drupal-rendered form actions into our React container.
		containerRef.current.appendChild( headerSettings );
		headerSettings.style.display = '';

		const formActions = headerSettings.querySelector( '.form-actions' );
		if ( ! formActions ) {
			return () => {
				// Move back to original location so it survives remounts.
				if ( originalParent ) {
					headerSettings.style.display = 'none';
					originalParent.appendChild( headerSettings );
				}
			};
		}

		const allActions = [
			...formActions.querySelectorAll( 'input, button, a, .button' ),
		];
		const secondary = allActions.filter( ( el ) => el.id !== 'edit-submit' );

		if ( secondary.length === 0 ) {
			return () => {
				if ( originalParent ) {
					headerSettings.style.display = 'none';
					originalParent.appendChild( headerSettings );
				}
			};
		}

		setHasSecondary( true );

		// Create the dropdown menu container for secondary actions.
		const menu = document.createElement( 'div' );
		menu.className = 'drupal-form-actions__menu';
		menuRef.current = menu;

		secondary.forEach( ( el ) => menu.appendChild( el ) );
		formActions.appendChild( menu );

		// On unmount, move the element back so it can be found on remount.
		return () => {
			if ( originalParent ) {
				headerSettings.style.display = 'none';
				originalParent.appendChild( headerSettings );
			}
		};
	}, [] );

	// Disable all action elements when editing a navigated-to pattern.
	useEffect( () => {
		if ( ! containerRef.current ) {
			return;
		}
		const actions = containerRef.current.querySelectorAll(
			'input, button, a, .button'
		);
		actions.forEach( ( el ) => {
			if ( disabled ) {
				el.setAttribute( 'disabled', 'disabled' );
				el.style.pointerEvents = 'none';
			} else {
				el.removeAttribute( 'disabled' );
				el.style.pointerEvents = '';
			}
		} );
	}, [ disabled ] );

	// Close on outside click.
	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}
		const handleClick = ( e ) => {
			if ( ! e.target.closest( '.drupal-form-actions__dropdown' ) ) {
				setIsOpen( false );
			}
		};
		document.addEventListener( 'click', handleClick );
		return () => document.removeEventListener( 'click', handleClick );
	}, [ isOpen ] );

	// Sync the is-open class to the DOM menu element.
	useEffect( () => {
		if ( menuRef.current ) {
			menuRef.current.classList.toggle( 'is-open', isOpen );
		}
	}, [ isOpen ] );

	const toggleMenu = useCallback( ( e ) => {
		e.preventDefault();
		e.stopPropagation();
		setIsOpen( ( prev ) => ! prev );
	}, [] );

	return (
		<div className="drupal-form-actions" ref={ containerRef }>
			{ isEditingEntity && <EntityStatus /> }
			{ /* Drupal .gutenberg-header-settings gets appended here by useEffect */ }
			{ hasSecondary && (
				<div className="drupal-form-actions__dropdown">
					<Tooltip text={ __( 'More actions' ) }>
						<button
							type="button"
							className="drupal-form-actions__toggle"
							aria-label={ __( 'More actions' ) }
							aria-expanded={ isOpen }
							onClick={ toggleMenu }
							disabled={ disabled }
						>
							<Icon icon={ chevronDown } />
						</button>
					</Tooltip>
				</div>
			) }
		</div>
	);
}
