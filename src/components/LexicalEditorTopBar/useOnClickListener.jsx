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
	$wrapNodes,
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
import { $isParentElementRTL, $isAtNodeEnd } from '@lexical/selection';
import { eventTypes } from './toolbarIconsList';
import { InsertImageDialog } from '../CustomPlugins/ImagePlugin';
import useModal from '../../common/hooks/useModal';

const LowPriority = 1;

const INCREASE_FONT_SIZE_COMMAND = createCommand();
const DECREASE_FONT_SIZE_COMMAND = createCommand();

const useOnClickListener = () => {
	const [editor] = useLexicalComposerContext();
	const [modal, showModal] = useModal();
	const [blockType, setBlockType] = useState('paragraph');
	const [selectedElementKey, setSelectedElementKey] = useState(null);
	const [isRTL, setIsRTL] = useState(false);
	const [isLink, setIsLink] = useState(false);
	const [selectedEventTypes, setSelectedEventTypes] = useState([]);

	const updateToolbar = useCallback(() => {
		const selection = $getSelection();
		let allSelectedEvents = [...selectedEventTypes];

		const pushInEventTypesState = (selectionFormat, event) => {
			if (selectionFormat) {
				if (selectedEventTypes.includes(event)) return;
				else allSelectedEvents.push(event);
			} else {
				allSelectedEvents = allSelectedEvents.filter(ev => ev !== event);
			}
		};

		if ($isRangeSelection(selection)) {
			const anchorNode = selection.anchor.getNode();
			const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
			const elementKey = element.getKey();
			const elementDOM = editor.getElementByKey(elementKey);
			if (elementDOM !== null) {
				setSelectedElementKey(elementKey);
				if ($isListNode(element)) {
					const parentList = $getNearestNodeOfType(anchorNode, ListNode);
					const type = parentList ? parentList.getTag() : element.getTag();
					setBlockType(type);
				} else {
					const type = $isHeadingNode(element) ? element.getTag() : element.getType();
					setBlockType(type);
				}
			}

			pushInEventTypesState(selection.hasFormat('bold'), eventTypes.formatBold);
			pushInEventTypesState(selection.hasFormat('italic'), eventTypes.formatItalic);
			pushInEventTypesState(selection.hasFormat('underline'), eventTypes.formatUnderline);
			pushInEventTypesState(selection.hasFormat('strikethrough'), eventTypes.formatStrike);
			pushInEventTypesState(selection.hasFormat('code'), eventTypes.formatCode);
			setIsRTL($isParentElementRTL(selection));

			const node = getSelectedNode(selection);
			const parent = node.getParent();
			if ($isLinkNode(parent) || $isLinkNode(node)) {
				if (!allSelectedEvents.includes(eventTypes.formatInsertLink))
					allSelectedEvents.push(eventTypes.formatInsertLink);
				setIsLink(true);
			} else {
				if (allSelectedEvents.includes(eventTypes.formatInsertLink)) {
					allSelectedEvents = allSelectedEvents.filter(ev => ev !== eventTypes.formatInsertLink);
				}
				setIsLink(false);
			}

			setSelectedEventTypes(allSelectedEvents);
		}
	}, [editor]);

	useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					updateToolbar();
				});
			}),
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				(_payload, newEditor) => {
					updateToolbar();
					return false;
				},
				LowPriority
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
	}, [editor, updateToolbar]);

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
			showModal('Insert Image', onClose => <InsertImageDialog activeEditor={editor} onClose={onClose} />);
		} else if (eventType === eventTypes.increaseFontSize) {
			increaseFontSize(2); // Aumentar el tamaño en 2px
		} else if (eventType === eventTypes.decreaseFontSize) {
			decreaseFontSize(2); // Disminuir el tamaño en 2px
		}
	};

	const insertLink = useCallback(() => {
		if (!isLink) {
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
		} else {
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
		}
	}, [editor, isLink]);

	const formatParagraph = () => {
		if (blockType !== 'paragraph') {
			editor.update(() => {
				const selection = $getSelection();
				if ($isRangeSelection(selection)) {
					$wrapNodes(selection, () => $createParagraphNode());
				}
			});
		}
	};

	const increaseFontSize = amount => {
		editor.dispatchCommand(INCREASE_FONT_SIZE_COMMAND, amount);
	};

	const decreaseFontSize = amount => {
		editor.dispatchCommand(DECREASE_FONT_SIZE_COMMAND, amount);
	};

	const formatLargeHeading = () => {
		if (blockType !== 'h1') {
			editor.update(() => {
				const selection = $getSelection();
				if ($isRangeSelection(selection)) {
					$wrapNodes(selection, () => $createHeadingNode('h1'));
				}
			});
		}
	};

	const formatSmallHeading = () => {
		if (blockType !== 'h2') {
			editor.update(() => {
				const selection = $getSelection();
				if ($isRangeSelection(selection)) {
					$wrapNodes(selection, () => $createHeadingNode('h2'));
				}
			});
		}
	};

	const formatBulletList = () => {
		if (blockType !== 'ul') {
			editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND);
		} else {
			editor.dispatchCommand(REMOVE_LIST_COMMAND);
		}
	};

	const formatNumberedList = () => {
		if (blockType !== 'ol') {
			editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND);
		} else {
			editor.dispatchCommand(REMOVE_LIST_COMMAND);
		}
	};

	const formatQuote = () => {
		if (blockType !== 'quote') {
			editor.update(() => {
				const selection = $getSelection();
				if ($isRangeSelection(selection)) {
					$wrapNodes(selection, () => $createQuoteNode());
				}
			});
		}
	};

	const formatCode = () => {
		if (blockType !== 'code') {
			editor.update(() => {
				const selection = $getSelection();
				if ($isRangeSelection(selection)) {
					if (selection.isCollapsed()) {
						$wrapNodes(selection, () => $createCodeNode());
					} else {
						const textContent = selection.getTextContent();
						const codeNode = $createCodeNode();
						selection.insertNodes([codeNode]);
						selection.insertRawText(textContent);
					}
				}
			});
		}
	};

	return { onClick, isLink, modal, showModal, blockType, selectedEventTypes };
};

export default useOnClickListener;

function getSelectedNode(selection) {
	const anchor = selection.anchor;
	const focus = selection.focus;
	const anchorNode = selection.anchor.getNode();
	const focusNode = selection.focus.getNode();
	if (anchorNode === focusNode) {
		return anchorNode;
	}
	const isBackward = selection.isBackward();
	if (isBackward) {
		return $isAtNodeEnd(focus) ? anchorNode : focusNode;
	} else {
		return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
	}
}
