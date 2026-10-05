/**
 * Illustrations of the Drupal editor for the welcome guide, in place of the
 * upstream animated GIFs of the WordPress editor. They are animated with CSS
 * (style.scss), and show their last frame with reduced motion.
 */

const DROP_PATH =
	'M29.8,11.7C25.9,7.9,22.2,4.2,21.1,0c-1.1,4.2-4.8,7.9-8.7,11.7C6.6,17.5,0,24.1,0,34c-0.3,11.6,9,21.3,20.6,21.5s21.3-9,21.5-20.6c0-0.3,0-0.6,0-0.9C42.2,24.1,35.6,17.5,29.8,11.7z M10.8,35.9c-0.6,0.8-1.2,1.7-1.6,2.6c-0.1,0.1-0.2,0.3-0.4,0.3H8.7c-0.5,0-1-0.9-1-0.9l0,0c-0.1-0.2-0.3-0.5-0.4-0.7L7.2,37C5.9,34.2,7,30.3,7,30.3l0,0c0.5-1.9,1.4-3.8,2.5-5.4c0.7-1,1.5-2,2.3-3l1,1l4.7,4.8c0.2,0.2,0.2,0.5,0,0.7l-4.9,5.5l0,0L10.8,35.9z M21.3,49.7c-4,0-7.3-3.3-7.2-7.3c0-1.8,0.7-3.5,1.8-4.8c1.5-1.8,3.4-3.6,5.5-6c2.4,2.6,4,4.3,5.5,6.3c0.1,0.1,0.2,0.3,0.3,0.5c0.8,1.2,1.3,2.6,1.3,4.1C28.6,46.5,25.3,49.7,21.3,49.7C21.3,49.7,21.3,49.7,21.3,49.7z M35,38.1L35,38.1c-0.1,0.3-0.4,0.5-0.7,0.6h-0.1c-0.3-0.1-0.5-0.3-0.7-0.5l0,0c-1.3-1.9-2.7-3.7-4.3-5.3l-1.9-2l-6.4-6.6c-1.3-1.2-2.6-2.6-3.8-3.9c0-0.1-0.1-0.1-0.1-0.1c-0.2-0.3-0.4-0.6-0.5-1c0-0.1,0-0.1,0-0.2c-0.2-1.1,0.2-2.2,1-3c1.2-1.2,2.5-2.5,3.7-3.8c1.3,1.4,2.7,2.8,4.1,4.2l0,0c2.8,2.6,5.3,5.5,7.6,8.6c1.9,2.7,2.9,5.8,2.9,9.1C35.6,35.4,35.4,36.8,35,38.1z';

const CLASS = 'drupal-welcome-illustration';

function Illustration( { name, children } ) {
	return (
		<svg
			className={ `edit-post-welcome-guide__image ${ CLASS } ${ CLASS }--${ name }` }
			width="312"
			height="240"
			viewBox="0 0 312 240"
			fill="none"
			aria-hidden="true"
			focusable="false"
		>
			<rect className={ `${ CLASS }__bg` } width="312" height="240" />
			{ /* Leaves room for the close button of the guide. */ }
			<g transform="translate(12 18) scale(0.923)">{ children }</g>
		</svg>
	);
}

function Drop( { x, y, className, fill = '#1e1e1e' } ) {
	return (
		<path
			className={ className }
			transform={ `translate(${ x } ${ y }) scale(0.25)` }
			d={ DROP_PATH }
			fill={ fill }
		/>
	);
}

function Cursor( { className } ) {
	return (
		<g className={ `${ CLASS }__cursor ${ className }` }>
			<path
				className={ `${ CLASS }__cursor-arrow` }
				d="M0 0v12.5l3.2-3.1 2.4 5.4 2.3-1-2.4-5.3h4.5z"
				fill="#1e1e1e"
				stroke="#fff"
				strokeWidth="1"
				strokeLinejoin="round"
			/>
		</g>
	);
}

function ImageIcon( { x, y } ) {
	return (
		<g
			transform={ `translate(${ x } ${ y })` }
			stroke="#1e1e1e"
			strokeWidth="1.25"
			strokeLinejoin="round"
		>
			<rect x="0.6" y="0.6" width="12.8" height="10.8" rx="1" />
			<path d="M0.6 9l3.6-3 2.6 2 3-3 3.6 3.4" />
		</g>
	);
}

/**
 * The editor window: the header, with the Drupal drop, the block inserter,
 * the document bar, Save and Preview. The window runs off the bottom.
 *
 * @param {Object}  props                   Component props.
 * @param {Element} props.children          The content of the window.
 * @param {string}  props.inserterClassName Class of the inserter button.
 */
function EditorWindow( { children, inserterClassName = '' } ) {
	return (
		<>
			<rect x="24" y="24" width="264" height="232" rx="4" fill="#fff" />
			<Drop x="31" y="29" />
			<g className={ `${ CLASS }__inserter ${ inserterClassName }` }>
				<rect
					className={ `${ CLASS }__accent ${ CLASS }__inserter-bg` }
					x="48"
					y="30"
					width="12"
					height="12"
					rx="1"
				/>
				<path
					className={ `${ CLASS }__inserter-plus` }
					d="M54 32.5v7M50.5 36h7"
					stroke="#fff"
					strokeWidth="1.25"
				/>
			</g>
			<g stroke="#1e1e1e" strokeWidth="1.25">
				<path d="M67 37.5h5.5a2 2 0 0 0 0-4H67m1.6-1.6L67 33.5l1.6 1.6" />
				<path
					d="M86 37.5h-5.5a2 2 0 0 1 0-4H86m-1.6-1.6L86 33.5l-1.6 1.6"
					opacity="0.4"
				/>
				<path d="M93 32.5h8M93 36h8M93 39.5h8" />
			</g>
			<rect x="112" y="31" width="88" height="10" rx="2" fill="#f0f0f0" />
			<rect x="138" y="35" width="36" height="2" rx="1" fill="#757575" />
			<rect
				className={ `${ CLASS }__accent` }
				x="224"
				y="30"
				width="26"
				height="12"
				rx="1"
			/>
			<rect x="231" y="35" width="12" height="2" rx="1" fill="#fff" />
			<rect x="253" y="30" width="26" height="12" rx="1" fill="#ddd" />
			<rect x="259" y="35" width="14" height="2" rx="1" fill="#1e1e1e" />
			<g fill="#1e1e1e">
				<circle cx="283.5" cy="32.5" r="0.9" />
				<circle cx="283.5" cy="36" r="0.9" />
				<circle cx="283.5" cy="39.5" r="0.9" />
			</g>
			<path d="M24 48.5h264" stroke="#e0e0e0" />
			{ children }
		</>
	);
}

function Lines( { x, y, widths, fill = '#ccc', gap = 8 } ) {
	return widths.map( ( width, index ) => (
		<rect
			key={ index }
			x={ x }
			y={ y + index * gap }
			width={ width }
			height="4"
			rx="1"
			fill={ fill }
		/>
	) );
}

function Outline( { className = '', x, y, width, height } ) {
	return (
		<rect
			className={ `${ CLASS }__outline ${ className }` }
			x={ x }
			y={ y }
			width={ width }
			height={ height }
			rx="2"
			strokeWidth="1.5"
		/>
	);
}

/**
 * Blocks: a page is built block by block.
 */
export function CanvasIllustration() {
	return (
		<Illustration name="canvas">
			<EditorWindow>
				<g className={ `${ CLASS }__block ${ CLASS }__block--1` }>
					<rect
						x="64"
						y="64"
						width="120"
						height="10"
						rx="1"
						fill="#1e1e1e"
					/>
					<Outline
						className={ `${ CLASS }__outline--1` }
						x="60"
						y="60"
						width="192"
						height="18"
					/>
				</g>
				<g className={ `${ CLASS }__block ${ CLASS }__block--2` }>
					<Lines x={ 64 } y={ 86 } widths={ [ 184, 184, 120 ] } />
					<Outline
						className={ `${ CLASS }__outline--2` }
						x="60"
						y="82"
						width="192"
						height="28"
					/>
				</g>
				<g className={ `${ CLASS }__block ${ CLASS }__block--3` }>
					<rect x="64" y="118" width="184" height="62" fill="#e0e0e0" />
					<ImageIcon x={ 149 } y={ 143 } />
					<Outline
						className={ `${ CLASS }__outline--3` }
						x="60"
						y="114"
						width="192"
						height="70"
					/>
				</g>
				<g className={ `${ CLASS }__block ${ CLASS }__block--4` }>
					<rect x="64" y="192" width="88" height="44" fill="#e0e0e0" />
					<rect x="160" y="192" width="88" height="44" fill="#e0e0e0" />
					<ImageIcon x={ 101 } y={ 208 } />
					<ImageIcon x={ 197 } y={ 208 } />
					<Outline
						className={ `${ CLASS }__outline--4` }
						x="60"
						y="188"
						width="192"
						height="52"
					/>
				</g>
			</EditorWindow>
		</Illustration>
	);
}

const SWATCHES = [ '#1e1e1e', '#cf2e2e', '#00d084', '#fcb900' ];

/**
 * Block settings: picking a color in the sidebar colors the selected block.
 */
export function EditorIllustration() {
	return (
		<Illustration name="editor">
			<EditorWindow>
				<rect x="48" y="64" width="96" height="8" rx="1" fill="#1e1e1e" />
				<rect
					className={ `${ CLASS }__block-color` }
					x="44"
					y="104"
					width="152"
					height="44"
					fill="#fcb900"
				/>
				<Lines
					x={ 52 }
					y={ 112 }
					widths={ [ 136, 136, 136, 88 ] }
					fill="rgba(30, 30, 30, 0.25)"
				/>
				<Outline x="44" y="104" width="152" height="44" />
				<rect
					x="44.5"
					y="86.5"
					width="66"
					height="14"
					rx="1"
					fill="#fff"
					stroke="#1e1e1e"
				/>
				<g fill="#1e1e1e">
					<rect x="49" y="91" width="6" height="6" rx="1" />
					<rect x="62" y="91" width="6" height="6" rx="1" />
					<rect x="73" y="91" width="6" height="6" rx="1" />
					<rect x="84" y="91" width="6" height="6" rx="1" />
					<circle cx="98" cy="94" r="0.9" />
					<circle cx="101.5" cy="94" r="0.9" />
					<circle cx="105" cy="94" r="0.9" />
				</g>
				<path d="M58.5 87v13" stroke="#1e1e1e" />
				<rect x="48" y="160" width="144" height="76" fill="#e0e0e0" />
				<ImageIcon x={ 113 } y={ 192 } />

				<path d="M208.5 49v191" stroke="#e0e0e0" />
				<rect x="216" y="58" width="30" height="3" rx="1" fill="#757575" />
				<rect x="254" y="58" width="18" height="3" rx="1" fill="#1e1e1e" />
				<rect
					className={ `${ CLASS }__accent` }
					x="251"
					y="66"
					width="24"
					height="1.5"
				/>
				<path d="M209 70.5h79" stroke="#e0e0e0" />
				<rect x="216" y="80" width="30" height="3" rx="1" fill="#1e1e1e" />
				{ SWATCHES.map( ( color, index ) => (
					<circle
						key={ color }
						cx={ 222 + index * 15 }
						cy="96"
						r="5"
						fill={ color }
					/>
				) ) }
				<circle
					className={ `${ CLASS }__swatch-ring` }
					cx="267"
					cy="96"
					r="7"
					stroke="#1e1e1e"
				/>
				<path d="M209 112.5h79" stroke="#e0e0e0" />
				<rect x="216" y="122" width="40" height="3" rx="1" fill="#1e1e1e" />
				<rect
					x="216.5"
					y="132.5"
					width="63"
					height="12"
					rx="1"
					fill="#fff"
					stroke="#949494"
				/>
				<path d="M209 154.5h79" stroke="#e0e0e0" />
				<rect x="216" y="164" width="44" height="3" rx="1" fill="#1e1e1e" />
				<path d="M276 162v7M272.5 165.5h7" stroke="#1e1e1e" />
				<path d="M209 178.5h79" stroke="#e0e0e0" />
				<rect x="216" y="188" width="32" height="3" rx="1" fill="#1e1e1e" />
				<path d="M276 186v7M272.5 189.5h7" stroke="#1e1e1e" />
			</EditorWindow>
			<Cursor className={ `${ CLASS }__cursor--editor` } />
		</Illustration>
	);
}

/**
 * Icons of the blocks in the inserter, drawn in a 14x14 box.
 */
const LIBRARY_ICONS = [
	// Paragraph.
	<path key="p" d="M2 3h10M2 7h10M2 11h6" stroke="#1e1e1e" />,
	// Heading.
	<path
		key="h"
		d="M3 2v10M11 2v10M3 7h8"
		stroke="#1e1e1e"
		strokeWidth="1.5"
	/>,
	// List.
	<g key="l" fill="#1e1e1e">
		<circle cx="2.5" cy="3" r="1" />
		<circle cx="2.5" cy="7" r="1" />
		<circle cx="2.5" cy="11" r="1" />
		<path d="M5.5 3H12M5.5 7H12M5.5 11H12" stroke="#1e1e1e" />
	</g>,
	// Quote.
	<path key="q" d="M2 2v10M5 4h7M5 7h7M5 10h4" stroke="#1e1e1e" />,
	// Image.
	<ImageIcon key="i" x={ 0 } y={ 1 } />,
	// Gallery.
	<g key="g" stroke="#1e1e1e">
		<rect x="1.5" y="1.5" width="4.5" height="4.5" />
		<rect x="8" y="1.5" width="4.5" height="4.5" />
		<rect x="1.5" y="8" width="4.5" height="4.5" />
		<rect x="8" y="8" width="4.5" height="4.5" />
	</g>,
	// Columns.
	<g key="c" stroke="#1e1e1e">
		<rect x="1.5" y="1.5" width="4.5" height="11" />
		<rect x="8" y="1.5" width="4.5" height="11" />
	</g>,
	// Group.
	<rect
		key="gr"
		x="1.5"
		y="1.5"
		width="11"
		height="11"
		stroke="#1e1e1e"
		strokeDasharray="2 1.5"
	/>,
	// Buttons.
	<rect
		key="b"
		x="1.5"
		y="4"
		width="11"
		height="6"
		rx="3"
		stroke="#1e1e1e"
	/>,
	// Video.
	<g key="v">
		<rect x="1.5" y="2.5" width="11" height="9" rx="1" stroke="#1e1e1e" />
		<path d="M6 5v4l3.5-2z" fill="#1e1e1e" />
	</g>,
	// Table.
	<g key="t" stroke="#1e1e1e">
		<rect x="1.5" y="2.5" width="11" height="9" />
		<path d="M1.5 7h11M7 2.5v9" />
	</g>,
	// Separator.
	<path key="s" d="M1.5 7h11" stroke="#1e1e1e" strokeWidth="1.5" />,
];

/**
 * Block library: the inserter opens, and a block is added from it.
 */
export function BlockLibraryIllustration() {
	return (
		<Illustration name="library">
			<defs>
				<clipPath id="drupal-welcome-illustration-library-clip">
					<rect x="24" y="49" width="264" height="191" />
				</clipPath>
			</defs>
			<EditorWindow inserterClassName={ `${ CLASS }__inserter--toggle` }>
				<rect x="148" y="64" width="96" height="8" rx="1" fill="#1e1e1e" />
				<Lines x={ 148 } y={ 82 } widths={ [ 124, 124, 80 ] } />
				<g className={ `${ CLASS }__new-block` }>
					<rect x="148" y="112" width="124" height="60" fill="#e0e0e0" />
					<ImageIcon x={ 203 } y={ 137 } />
					<Outline x="144" y="108" width="132" height="68" />
				</g>
				<g className={ `${ CLASS }__after-new-block` }>
					<Lines x={ 148 } y={ 184 } widths={ [ 124, 124, 124, 60 ] } />
				</g>
				<g clipPath="url(#drupal-welcome-illustration-library-clip)">
					<g className={ `${ CLASS }__panel` }>
						<rect x="24" y="49" width="104" height="191" fill="#fff" />
						<path d="M128.5 49v191" stroke="#e0e0e0" />
						<rect
							x="32"
							y="56"
							width="88"
							height="12"
							rx="2"
							fill="#f0f0f0"
						/>
						<rect
							x="38"
							y="61"
							width="30"
							height="2"
							rx="1"
							fill="#757575"
						/>
						<rect
							className={ `${ CLASS }__panel-highlight` }
							x="63"
							y="111"
							width="26"
							height="30"
							rx="2"
							strokeWidth="1.5"
						/>
						{ LIBRARY_ICONS.map( ( icon, index ) => {
							const x = 39 + ( index % 3 ) * 30;
							const y = 82 + Math.floor( index / 3 ) * 34;
							return (
								<g key={ index }>
									<g transform={ `translate(${ x } ${ y })` }>
										{ icon }
									</g>
									<rect
										x={ x - 1 }
										y={ y + 20 }
										width="16"
										height="2"
										rx="1"
										fill="#757575"
									/>
								</g>
							);
						} ) }
					</g>
				</g>
			</EditorWindow>
			<Cursor className={ `${ CLASS }__cursor--library` } />
		</Illustration>
	);
}

/**
 * Documentation: a page of the Gutenberg guide on drupal.org.
 */
export function DocumentationIllustration() {
	const sections = [ [ 172, 172, 172, 96 ], [ 172, 172, 140 ] ];
	return (
		<Illustration name="documentation">
			<defs>
				<clipPath id="drupal-welcome-illustration-documentation-clip">
					<rect x="24" y="64" width="264" height="176" />
				</clipPath>
			</defs>
			<rect x="24" y="24" width="264" height="232" rx="4" fill="#fff" />
			<path
				d="M24 28a4 4 0 0 1 4-4h256a4 4 0 0 1 4 4v12H24z"
				fill="#f0f0f0"
			/>
			<g fill="#ccc">
				<circle cx="33" cy="32" r="2" />
				<circle cx="40" cy="32" r="2" />
				<circle cx="47" cy="32" r="2" />
			</g>
			<rect x="60" y="28" width="168" height="8" rx="4" fill="#fff" />
			<rect x="66" y="31" width="56" height="2" rx="1" fill="#949494" />
			<rect x="24" y="40" width="264" height="24" fill="#1e1e1e" />
			<Drop x="32" y="45" fill="#fff" />
			<g fill="#fff" opacity="0.7">
				<rect x="54" y="51" width="22" height="2" rx="1" />
				<rect x="82" y="51" width="26" height="2" rx="1" />
				<rect x="114" y="51" width="20" height="2" rx="1" />
			</g>
			<rect
				className={ `${ CLASS }__accent` }
				x="248"
				y="46"
				width="32"
				height="12"
				rx="1"
			/>
			<rect x="255" y="51" width="18" height="2" rx="1" fill="#fff" />
			<g clipPath="url(#drupal-welcome-illustration-documentation-clip)">
				<g fill="#ccc">
					<rect x="32" y="80" width="44" height="3" rx="1" />
					<rect x="32" y="92" width="36" height="3" rx="1" />
					<rect x="32" y="104" width="48" height="3" rx="1" />
					<rect x="32" y="116" width="40" height="3" rx="1" />
					<rect x="32" y="128" width="32" height="3" rx="1" />
				</g>
				<rect
					className={ `${ CLASS }__accent ${ CLASS }__toc-current` }
					x="28"
					y="77"
					width="2"
					height="9"
				/>
				<g className={ `${ CLASS }__page` }>
					<rect x="100" y="76" width="60" height="2" rx="1" fill="#949494" />
					<rect x="100" y="86" width="148" height="10" rx="1" fill="#1e1e1e" />
					<Lines x={ 100 } y={ 106 } widths={ sections[ 0 ] } />
					<rect x="100" y="146" width="172" height="72" rx="2" fill="#f0f0f0" />
					<rect x="112" y="156" width="148" height="56" rx="2" fill="#fff" />
					<rect
						className={ `${ CLASS }__accent` }
						x="118"
						y="161"
						width="7"
						height="7"
						rx="1"
					/>
					<rect x="132" y="163" width="28" height="3" rx="1" fill="#ddd" />
					<rect
						className={ `${ CLASS }__accent` }
						x="234"
						y="161"
						width="20"
						height="7"
						rx="1"
					/>
					<rect x="118" y="176" width="72" height="5" rx="1" fill="#1e1e1e" />
					<Lines x={ 118 } y={ 188 } widths={ [ 136, 112 ] } gap={ 7 } />
					<rect x="100" y="232" width="96" height="7" rx="1" fill="#1e1e1e" />
					<Lines x={ 100 } y={ 248 } widths={ sections[ 1 ] } />
					<Lines x={ 100 } y={ 282 } widths={ sections[ 0 ] } />
				</g>
			</g>
		</Illustration>
	);
}

/**
 * The block inserter button, as shown in the editor header.
 */
export function InserterIcon() {
	return (
		<svg
			className="edit-post-welcome-guide__inserter-icon"
			width="18"
			height="18"
			viewBox="0 0 18 18"
			aria-hidden="true"
			focusable="false"
		>
			<rect width="18" height="18" rx="2" />
			<path d="M9 4v10M4 9h10" stroke="#fff" strokeWidth="1.5" />
		</svg>
	);
}
