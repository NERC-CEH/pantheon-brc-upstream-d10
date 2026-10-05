import { useDispatch } from '@wordpress/data';
import { ExternalLink, Guide } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';
import {
	BlockLibraryIllustration,
	CanvasIllustration,
	DocumentationIllustration,
	EditorIllustration,
	InserterIcon,
} from './illustrations';
import { store as editPostStore } from '../../store';

export default function WelcomeGuideDefault() {
	const { toggleFeature } = useDispatch( editPostStore );

	return (
		<Guide
			className="edit-post-welcome-guide"
			contentLabel={ __( 'Welcome to the editor' ) }
			finishButtonText={ __( 'Get started' ) }
			onFinish={ () => toggleFeature( 'welcomeGuide' ) }
			pages={ [
				{
					image: <CanvasIllustration />,
					content: (
						<>
							<h1 className="edit-post-welcome-guide__heading">
								{ __( 'Welcome to the editor' ) }
							</h1>
							<p className="edit-post-welcome-guide__text">
								{ __(
									'In the Gutenberg editor, each paragraph, image, or video is presented as a distinct “block” of content.'
								) }
							</p>
						</>
					),
				},
				{
					image: <EditorIllustration />,
					content: (
						<>
							<h1 className="edit-post-welcome-guide__heading">
								{ __( 'Customize each block' ) }
							</h1>
							<p className="edit-post-welcome-guide__text">
								{ __(
									'Each block comes with its own set of controls for changing things like color, width, and alignment. These will show and hide automatically when you have a block selected.'
								) }
							</p>
						</>
					),
				},
				{
					image: <BlockLibraryIllustration />,
					content: (
						<>
							<h1 className="edit-post-welcome-guide__heading">
								{ __( 'Explore all blocks' ) }
							</h1>
							<p className="edit-post-welcome-guide__text">
								{ createInterpolateElement(
									__(
										'All of the blocks available to you live in the block library. You’ll find it wherever you see the <InserterIconImage /> icon.'
									),
									{
										InserterIconImage: <InserterIcon />,
									}
								) }
							</p>
						</>
					),
				},
				{
					image: <DocumentationIllustration />,
					content: (
						<>
							<h1 className="edit-post-welcome-guide__heading">
								{ __( 'Learn more' ) }
							</h1>
							<p className="edit-post-welcome-guide__text">
								{ createInterpolateElement(
									__(
										"New to the Gutenberg editor? Want to learn more about using it? <a>Here's a detailed guide.</a>"
									),
									{
										a: (
											<ExternalLink href="https://www.drupal.org/docs/8/modules/gutenberg/how-to-use-gutenberg-editor" />
										),
									}
								) }
							</p>
						</>
					),
				},
			] }
		/>
	);
}
