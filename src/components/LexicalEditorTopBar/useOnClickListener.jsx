import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
	REDO_COMMAND,
	UNDO_COMMAND,
	SELECTION_CHANGE_COMMAND,
	FORMAT_TEXT_COMMAND,
	FORMAT_ELEMENT_COMMAND,
	$getSelection,
	$isRangeSelection,
	$createParagraphNode,
	createCommand
} from 'lexical';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import { useCallback } from 'react';
import {
	INSERT_ORDERED_LIST_COMMAND,
	INSERT_UNORDERED_LIST_COMMAND,
	REMOVE_LIST_COMMAND,
	$isListNode,
	ListNode
} from '@lexical/list';
import { $isHeadingNode, $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $createCodeNode } from '@lexical/code';
import { $isParentElementRTL, $wrapNodes, $isAtNodeEnd } from '@lexical/selection';
import { eventTypes } from './toolbarIconsList';
import { InsertImageDialog } from '../CustomPlugins/ImagePlugin';
import useModal from '../../common/hooks/useModal';

const LowPriority = 1;

const INCREASE_FONT_SIZE_COMMAND = createCommand();
const DECREASE_FONT_SIZE_COMMAND = createCommand();

const useOnClickListener = () => {
	// LexicalComposer provides access to the underlying LexicalEditor instance via React Context, with this access to the Editor can be extend Lexical.
	const [editor] = useLexicalComposerContext();
	// useModal is a State of React imported for useModal() used for create a dialog modal for insert image.
	const [modal, showModal] = useModal();
	// blockType is a State of React used to store the type of block that is selected.
	const [blockType, setBlockType] = useState('paragraph');
	// selectedElementKey is a State of React used to store the key of the selected element.
	const [selectedElementKey, setSelectedElementKey] = useState(null);
	// isRTL is a State of React used to store the direction of the text.
	const [isRTL, setIsRTL] = useState(false);
	// isLink is a State of React used to store if the selected element is a link.
	const [isLink, setIsLink] = useState(false);
	// selectedEventTypes is a State of React used to store the selected event types.
	const [selectedEventTypes, setSelectedEventTypes] = useState([]);

	// updateToolbar is a function that updates the toolbar.
	const updateToolbar = useCallback(() => {
		// $getSelection is a function that returns the current selection.
		const selection = $getSelection();
		// allSelectedEvents is a variable that stores all the selected events.
		let allSelectedEvents = [...selectedEventTypes];

		// pushInEventTypesState is a function that pushes the event types in the state, props are selectionFormat and event.
		const pushInEventTypesState = (selectionFormat, event) => {
			if (selectionFormat) {
				// If the selectionFormat is true.
				if (selectedEventTypes.includes(event)) return; // Prevents adding the same event multiple times
				else allSelectedEvents.push(event); // Adds the event to the state
			} else {
				allSelectedEvents = allSelectedEvents.filter(ev => ev !== event); // Removes the event from the state
			}
		};

		// If the selection is a range selection, props are selection.
		if ($isRangeSelection(selection)) {
			const anchorNode = selection.anchor.getNode(); // anchorNode is the node where the selection starts.
			const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow(); // element is the top level element of the anchorNode.
			const elementKey = element.getKey(); // elementKey is the key of the element.
			const elementDOM = editor.getElementByKey(elementKey); // elementDOM is the element by key.
			if (elementDOM !== null) {
				// If the elementDOM is not null.
				setSelectedElementKey(elementKey); // Sets the selectedElementKey to the elementKey.
				if ($isListNode(element)) {
					// If the element is a list node.
					const parentList = $getNearestNodeOfType(anchorNode, ListNode); // parentList is the nearest node of type ListNode.
					const type = parentList ? parentList.getTag() : element.getTag(); // type is the tag of the parentList or the element.
					setBlockType(type); // Sets the blockType to the type.
				} else {
					// If the element is not a list node.
					const type = $isHeadingNode(element) ? element.getTag() : element.getType(); // type is the tag of the element if it is a heading node, otherwise the type of the element.
					setBlockType(type); // Sets the blockType to the type.
				}
			}

			// pushInEventTypesState is called with the selectionFormat and event.
			pushInEventTypesState(selection.hasFormat('bold'), eventTypes.formatBold);
			pushInEventTypesState(selection.hasFormat('italic'), eventTypes.formatItalic);
			pushInEventTypesState(selection.hasFormat('underline'), eventTypes.formatUnderline);
			pushInEventTypesState(selection.hasFormat('strikethrough'), eventTypes.formatStrike);
			pushInEventTypesState(selection.hasFormat('code'), eventTypes.formatCode);
			// If the selection is a link node or the parent of the selection is a link node, pushInEventTypesState is called with the selectionFormat and event.
			setIsRTL($isParentElementRTL(selection));
			// If the selection is a link node or the parent of the selection is a link node, pushInEventTypesState is called with the selectionFormat and event.
			const node = getSelectedNode(selection); // node is the selected node.
			const parent = node.getParent(); // parent is the parent of the node.
			if ($isLinkNode(parent) || $isLinkNode(node)) {
				// If the parent is a link node or the node is a link node.
				if (!allSelectedEvents.includes(eventTypes.formatInsertLink))
					// If the allSelectedEvents does not include the eventTypes.formatInsertLink.
					allSelectedEvents.push(eventTypes.formatInsertLink); // Adds the eventTypes.formatInsertLink to the allSelectedEvents.
				setIsLink(true); // Sets isLink to true.
			} else {
				// If the parent is not a link node or the node is not a link node.
				if (allSelectedEvents.includes(eventTypes.formatInsertLink)) {
					// If the allSelectedEvents includes the eventTypes.formatInsertLink.
					allSelectedEvents = allSelectedEvents.filter(ev => ev !== eventTypes.formatCode); // Removes the eventTypes.formatCode from the allSelectedEvents.
				}
				setIsLink(false); // Sets isLink to false.
			}

			setSelectedEventTypes(allSelectedEvents); // Sets the selectedEventTypes to allSelectedEvents.
		}
	}, [editor]); // Dependencies of the updateToolbar function.

	useEffect(() => {
		// mergeRegister is a function that merges the registerUpdateListener and registerCommand.
		return mergeRegister(
			// registerUpdateListener is a function that registers an update listener.
			editor.registerUpdateListener(({ editorState }) => {
				// editorState.read is a function that reads the editor state.
				editorState.read(() => {
					// updateToolbar is called.
					updateToolbar();
				});
			}),
			// registerCommand is a function that registers a command.
			editor.registerCommand(
				// SELECTION_CHANGE_COMMAND is a constant that stores the selection change command.
				SELECTION_CHANGE_COMMAND,
				// The function that is called when the command is executed, props are _payload and newEditor.
				(_payload, newEditor) => {
					updateToolbar();
					return false;
				},
				LowPriority // LowPriority is a constant that stores the priority of the command.
			),
			editor.registerCommand(
				INCREASE_FONT_SIZE_COMMAND,
				payload => {
					editor.update(() => {
						const selection = $getSelection();
						if ($isRangeSelection(selection)) {
							selection.getNodes().forEach(node => {
								const element = editor.getElementByKey(node.getKey());
								if (element) {
									const currentFontSize = window.getComputedStyle(element).fontSize;
									const newFontSize = parseInt(currentFontSize) + payload + 'px';
									element.style.fontSize = newFontSize;
								}
							});
						}
					});
					return true;
				},
				LowPriority
			),
			editor.registerCommand(
				DECREASE_FONT_SIZE_COMMAND,
				payload => {
					editor.update(() => {
						const selection = $getSelection();
						if ($isRangeSelection(selection)) {
							selection.getNodes().forEach(node => {
								const element = editor.getElementByKey(node.getKey());
								if (element) {
									const currentFontSize = window.getComputedStyle(element).fontSize;
									const newFontSize = parseInt(currentFontSize) - payload + 'px';
									element.style.fontSize = newFontSize;
								}
							});
						}
					});
					return true;
				},
				LowPriority
			)
		);
	}, [editor, updateToolbar]); // Dependencies of the useEffect.

	// onClick is a function that is called when an event is clicked, props are eventType.
	const onClick = eventType => {
		if (eventType === eventTypes.formatUndo) {
			editor.dispatchCommand(UNDO_COMMAND);
		} else if (eventType === eventTypes.formatRedo) {
			editor.dispatchCommand(REDO_COMMAND);
		} else if (eventType === eventTypes.formatBold) {
			editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
		} else if (eventType === eventTypes.formatItalic) {
			editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
		} else if (eventType === eventTypes.formatStrike) {
			editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
		} else if (eventType === eventTypes.formatUnderline) {
			editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
		} else if (eventType === eventTypes.formatAlignLeft) {
			editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
		} else if (eventType === eventTypes.formatAlignRight) {
			editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
		} else if (eventType === eventTypes.formatAlignCenter) {
			editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
		} else if (eventType === eventTypes.paragraph) {
			formatParagraph();
		} else if (eventType === eventTypes.h1) {
			formatLargeHeading();
		} else if (eventType === eventTypes.h2) {
			formatSmallHeading();
		} else if (eventType === eventTypes.ul) {
			formatBulletList();
		} else if (eventType === eventTypes.ol) {
			formatNumberedList();
		} else if (eventType === eventTypes.quote) {
			formatQuote();
		} else if (eventType === eventTypes.formatCode) {
			formatCode();
		} else if (eventType === eventTypes.formatInsertLink) {
			insertLink();
		} else if (eventType === eventTypes.insertImage) {
			// showModal is called with the title and the dialog.
			showModal('Insert Image', onClose => <InsertImageDialog activeEditor={editor} onClose={onClose} />);
		} else if (eventType === eventTypes.increaseFontSize) {
			increaseFontSize(2);
		} else if (eventType === eventTypes.decreaseFontSize) {
			decreaseFontSize(2);
		}
	};

	const increaseFontSize = amount => {
		editor.dispatchCommand(INCREASE_FONT_SIZE_COMMAND, amount);
	};

	const decreaseFontSize = amount => {
		editor.dispatchCommand(DECREASE_FONT_SIZE_COMMAND, amount);
	};

	// insertLink is a function that inserts a link.
	const insertLink = useCallback(() => {
		if (!isLink) {
			// If the selected element is not a link, dispatch the command with the link.
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
		} else {
			// If the selected element is a link, dispatch the command with null.
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
		}
	}, [editor, isLink]); // Dependencies of the insertLink function.

	// formatParagraph is a function that formats the paragraph.
	const formatParagraph = () => {
		// If the blockType is not a paragraph, update the editor.
		if (blockType !== 'paragraph') {
			editor.update(() => {
				// $getSelection is a function that returns the current selection.
				const selection = $getSelection();
				// If the selection is a range selection, wrap the nodes with a paragraph node.
				if ($isRangeSelection(selection)) {
					// $wrapNodes is a function that wraps the nodes with a node, props are selection and the function that creates the paragraph node.
					$wrapNodes(selection, () => $createParagraphNode());
				}
			});
		}
	};

	// formatLargeHeading is a function that formats the large heading.
	const formatLargeHeading = () => {
		// If the blockType is not a heading 1, update the editor.
		if (blockType !== 'h1') {
			// update is a function that updates the editor.
			editor.update(() => {
				// $getSelection is a function that returns the current selection.
				const selection = $getSelection();
				// If the selection is a range selection, wrap the nodes with a heading 1 node.
				if ($isRangeSelection(selection)) {
					// $wrapNodes is a function that wraps the nodes with a node, props are selection and the function that creates the heading 1 node.
					$wrapNodes(selection, () => $createHeadingNode('h1'));
				}
			});
		}
	};

	// formatSmallHeading is a function that formats the small heading.
	const formatSmallHeading = () => {
		// If the blockType is not a heading 2, update the editor.
		if (blockType !== 'h2') {
			// update is a function that updates the editor.
			editor.update(() => {
				// $getSelection is a function that returns the current selection.
				const selection = $getSelection();
				// If the selection is a range selection, wrap the nodes with a heading 2 node.
				if ($isRangeSelection(selection)) {
					// $wrapNodes is a function that wraps the nodes with a node, props are selection and the function that creates the heading 2 node.
					$wrapNodes(selection, () => $createHeadingNode('h2'));
				}
			});
		}
	};

	// formatBulletList is a function that formats the bullet list.
	const formatBulletList = () => {
		// If the blockType is not a unordered list, dispatch the command.
		if (blockType !== 'ul') {
			// dispatchCommand is a function that dispatches a command.
			editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND); // INSERT_UNORDERED_LIST_COMMAND is a constant that stores the insert unordered list command.
		} else {
			// If the blockType is a unordered list, dispatch the command.
			editor.dispatchCommand(REMOVE_LIST_COMMAND); // REMOVE_LIST_COMMAND is a constant that stores the remove list command.
		}
	};

	// formatNumberedList is a function that formats the numbered list.
	const formatNumberedList = () => {
		// If the blockType is not a ordered list, dispatch the command.
		if (blockType !== 'ol') {
			// dispatchCommand is a function that dispatches a command.
			editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND); // INSERT_ORDERED_LIST_COMMAND is a constant that stores the insert ordered list command.
		} else {
			// If the blockType is a ordered list, dispatch the command.
			editor.dispatchCommand(REMOVE_LIST_COMMAND); // REMOVE_LIST_COMMAND is a constant that stores the remove list command.
		}
	};

	// formatQuote is a function that formats the quote.
	const formatQuote = () => {
		// If the blockType is not a quote, update the editor.
		if (blockType !== 'quote') {
			// update is a function that updates the editor.
			editor.update(() => {
				// $getSelection is a function that returns the current selection.
				const selection = $getSelection();
				// If the selection is a range selection, wrap the nodes with a quote node.
				if ($isRangeSelection(selection)) {
					// $wrapNodes is a function that wraps the nodes with a node, props are selection and the function that creates the quote node.
					$wrapNodes(selection, () => $createQuoteNode()); // $createQuoteNode is a function that creates a quote node.
				}
			});
		}
	};

	// formatCode is a function that formats the code.
	const formatCode = () => {
		// If the blockType is not a code, update the editor.
		if (blockType !== 'code') {
			// update is a function that updates the editor.
			editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code'); // FORMAT_TEXT_COMMAND is a constant that stores the format text command.
			// update is a function that updates the editor.
			editor.update(() => {
				// $getSelection is a function that returns the current selection.
				const selection = $getSelection();
				// If the selection is a range selection, wrap the nodes with a code node.
				if ($isRangeSelection(selection)) {
					// $wrapNodes is a function that wraps the nodes with a node, props are selection and the function that creates the code node.
					$wrapNodes(selection, () => $createCodeNode()); // $createCodeNode is a function that creates a code node.
				}
			});
		}
	};
	// Returns the modal, onClick, selectedEventTypes, blockType, isLink, and editor, this is used in other parts of the components
	return { modal, onClick, selectedEventTypes, blockType, isLink, editor };
};

// getSelectedNode is a function that returns the selected node, props are selection.
function getSelectedNode(selection) {
	const anchor = selection.anchor; // anchor is the anchor of the selection.
	const focus = selection.focus; // focus is the focus of the selection.
	const anchorNode = selection.anchor.getNode(); // anchorNode is the node of the anchor.
	const focusNode = selection.focus.getNode(); // focusNode is the node of the focus.
	// If the anchorNode is the focusNode, return the anchorNode.
	if (anchorNode === focusNode) {
		// If the selection is backward, return the anchorNode, otherwise return the focusNode.
		return anchorNode;
	}
	// If the selection is backward, return the anchorNode if the focus is at the node end, otherwise return the focusNode.
	const isBackward = selection.isBackward(); // isBackward is a boolean that stores if the selection is backward.
	// If the selection is backward, return the anchorNode if the focus is at the node end, otherwise return the focusNode.
	if (isBackward) {
		return $isAtNodeEnd(focus) ? anchorNode : focusNode; // $isAtNodeEnd is a function that returns if the focus is at the node end.
	} else {
		return $isAtNodeEnd(anchor) ? focusNode : anchorNode; // $isAtNodeEnd is a function that returns if the anchor is at the node end.
	}
}

export default useOnClickListener;
