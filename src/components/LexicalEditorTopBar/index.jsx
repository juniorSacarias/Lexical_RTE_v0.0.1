import { createPortal } from 'react-dom';
import { Grid, styled } from '@mui/material';
import FloatingLinkEditor from './FloatingLinkEditor';
import toolbarIconsList from './toolbarIconsList';
import useOnClickListener from './useOnClickListener';

/**
 * useOnClickListener is a custom hook that handles the click event of the toolbar icons.
 * isIconSelected is a function that checks if the icon is selected.
 * LexicalEditorTopBar is a functional component that renders the toolbar icons and the link editor
 * ToolbarGridContainer is a styled component that renders the toolbar grid containerWithin this component the different icons for the toolbar are rendered, in addition each one receives an onClick which activates the function associated with the icon and a color which can be changed by replacing warning
 * modal is a prop that is used to render the modal component
 * isLink is a prop that is used to render the link editor component
 */

const ToolbarGridContainer = styled(Grid)(({ theme }) => ({
	justifyContent: 'space-between',
	spacing: 2,
	alignItems: 'center',
	background: 'white'
}));

const IconGridContainer = styled(Grid)(({ theme }) => ({
	cursor: 'pointer'
}));

const LexicalEditorTopBar = () => {
	const { onClick, selectedEventTypes, blockType, isLink, editor, modal } = useOnClickListener();

	const isIconSelected = plugin => selectedEventTypes.includes(plugin.event) || blockType.includes(plugin.event);

	return (
		<ToolbarGridContainer container py={2} px={1}>
			{toolbarIconsList.map(plugin => (
				<IconGridContainer key={plugin.id} item>
					{
						<plugin.Icon
							sx={plugin.sx}
							onClick={() => onClick(plugin.event)}
							color={isIconSelected(plugin) ? 'warning' : undefined}
						/>
					}
				</IconGridContainer>
			))}
			{modal}
			{isLink && createPortal(<FloatingLinkEditor editor={editor} />, document.body)}
		</ToolbarGridContainer>
	);
};

export default LexicalEditorTopBar;
