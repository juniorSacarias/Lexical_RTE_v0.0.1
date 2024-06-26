import { createPortal } from 'react-dom';
import { Grid, styled } from '@mui/material';
import FloatingLinkEditor from './FloatingLinkEditor';
import toolbarIconsList from './toolbarIconsList';
import useOnClickListener from './useOnClickListener';
import FontFamilyDropdown from '../CustomPlugins/FontFamilyDropdown';
import { $getSelection, $isRangeSelection } from 'lexical';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { useState } from 'react';
import TableChart from '@mui/icons-material/TableChart'
import FormTablePlugin from '../CustomPlugins/TablePlugin/FormTablePlugin/FormTablePlugin';

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

	const [selectedFont, setSelectedFont] = useState('Roboto');
	const [isTableFormOpen, setTableFormOpen] = useState(false);

	const handleChange = event => {
		const font = event.target.value;
		setSelectedFont(font);
		applyFontToSelection(font);
	};

	const applyFontToSelection = font => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				selection.getNodes().forEach(node => {
					const element = editor.getElementByKey(node.getKey());
					if (element) {
						element.style.fontFamily = font;
					}
				});
			}
		});
	};

	const insertTable = ({ rows, columns }) => {
		editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows, columns });
	};

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
			<IconGridContainer>
				<TableChart onClick={() => setTableFormOpen(true)}/>
			</IconGridContainer>
			<IconGridContainer item>
				<FontFamilyDropdown selectedFont={selectedFont} onChange={handleChange} />
			</IconGridContainer>
			<FormTablePlugin open={isTableFormOpen} onClose={() => setTableFormOpen(false)} onSubmit={insertTable}/>
			{modal}
			{isLink && createPortal(<FloatingLinkEditor editor={editor} />, document.body)}
		</ToolbarGridContainer>
	);
};

export default LexicalEditorTopBar;
