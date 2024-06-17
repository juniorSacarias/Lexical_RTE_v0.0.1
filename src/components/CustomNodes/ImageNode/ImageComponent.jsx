import './ImageNode.css';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
	$getNodeByKey,
	$getSelection,
	$isNodeSelection,
	$setSelection,
	CLICK_COMMAND,
	COMMAND_PRIORITY_LOW,
	DRAGSTART_COMMAND,
	KEY_BACKSPACE_COMMAND,
	KEY_DELETE_COMMAND,
	KEY_ENTER_COMMAND,
	KEY_ESCAPE_COMMAND,
	SELECTION_CHANGE_COMMAND
} from 'lexical';
import * as React from 'react';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import ImageResizer from '../../ui/ImageResizer';
import { $isImageNode } from '.';

const imageCache = new Set(); // Create a new set to store images.

function useSuspenseImage(src) { // Function that uses suspense to load an image.
	if (!imageCache.has(src)) { // If the image cache does not have the specified source.
		throw new Promise(resolve => { // Return a new promise.
			const img = new Image(); // Create a new image element.
			img.src = src; // Set the source of the image element to the specified source.
			img.onload = () => { // When the image element loads.
				imageCache.add(src); // Add the source to the image cache.
				resolve(null); // Resolve the promise.
			};
		});
	}
}

function LazyImage({ altText, className, imageRef, src, width, height, maxWidth }) { // Function that returns a lazy image.
	useSuspenseImage(src);// Use suspense to load the image.
	return (
		<img
			className={className || undefined}
			src={src}
			alt={altText}
			ref={imageRef}
			style={{
				height,
				maxWidth,
				width
			}}
			draggable="false"
		/>
	);
}

export default function ImageComponent({ // Function that returns an image component.
	src,
	altText,
	nodeKey,
	width,
	height,
	maxWidth,
	resizable,
	showCaption,
	caption,
	captionsEnabled
}) { // Destructure the props.
	const imageRef = useRef(null); // Create a reference to the image element.
	const buttonRef = useRef(null); // Create a reference to the button element.
	const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey); // Destructure the selection state.
	const [isResizing, setIsResizing] = useState(false); // Destructure the resizing state.
	const [editor] = useLexicalComposerContext(); // Destructure the editor.
	const [selection, setSelection] = useState(null); // Destructure the selection state.
	const activeEditorRef = useRef(null); // Create a reference to the active editor.

	const onDelete = useCallback( // Function that handles the delete event.
		payload => { // Destructure the payload.
			if (isSelected && $isNodeSelection($getSelection())) { // If the node is selected.
				const event = payload; // Destructure the payload.
				event.preventDefault(); // Prevent the default event.
				const node = $getNodeByKey(nodeKey); // Get the node by key.
				if ($isImageNode(node)) { // If the node is an image node.
					node.remove(); // Remove the node.
				}
				setSelected(false); // Set the selected state to false.
			}
			return false; // Return false.
		},
		[isSelected, nodeKey, setSelected] // Dependency array.
	);

	const onEnter = useCallback( // Function that handles the enter event.
		event => { // Destructure the event.
			const latestSelection = $getSelection(); // Get the latest selection.
			const buttonElem = buttonRef.current; // Get the button element.
			if (isSelected && $isNodeSelection(latestSelection) && latestSelection.getNodes().length === 1) { // If the node is selected.
				if (showCaption) { // If the caption is shown.
					// Move focus into nested editor
					$setSelection(null); // Set the selection to null.
					event.preventDefault(); // Prevent the default event.
					caption.focus(); // Focus on the caption.
					return true; // Return true.
				} else if (buttonElem !== null && buttonElem !== document.activeElement) { // If the button element is not null and not the active element.
					event.preventDefault();
					buttonElem.focus(); // Focus on the button element.
					return true; // Return true.
				}
			}
			return false; // Return false.
		},
		[caption, isSelected, showCaption] // Dependency array.
	);

	const onEscape = useCallback( // Function that handles the escape event.
		event => { // Destructure the event.
			if (activeEditorRef.current === caption || buttonRef.current === event.target) { // If the active editor is the caption or the button element is the event target.
				$setSelection(null); // Set the selection to null.
				editor.update(() => { // Update the editor.
					setSelected(true); // Set the selected state to true.
					const parentRootElement = editor.getRootElement(); // Get the root element of the editor.
					if (parentRootElement !== null) { // If the parent root element is not null.
						parentRootElement.focus(); // Focus on the parent root element.
					}
				});
				return true; 
			}
			return false;
		},
		[caption, editor, setSelected] // Dependency array.
	);

	useEffect(() => {
		let isMounted = true; // Set the mounted state to true.
		const unregister = mergeRegister( // Merge the register.
			editor.registerUpdateListener(({ editorState }) => { // Register an update listener.
				if (isMounted) { // If the component is mounted.
					setSelection(editorState.read(() => $getSelection())); // Set the selection.
				}
			}),
			editor.registerCommand( // Register a command.
				SELECTION_CHANGE_COMMAND, // Selection change command.
				(_, activeEditor) => { // Destructure the active editor.
					activeEditorRef.current = activeEditor; // Set the active editor reference.
					return false; // Return false.
				},
				COMMAND_PRIORITY_LOW // Command priority low.
			),
			editor.registerCommand( // Register a command.
				CLICK_COMMAND, // Click command.
				payload => { // Destructure the payload.
					const event = payload; // Destructure the payload.

					if (isResizing) { // If the image is resizing.
						return true;
					}
					if (event.target === imageRef.current) { // If the event target is the image element.
						if (event.shiftKey) { // If the shift key is pressed.
							setSelected(!isSelected); // Set the selected state to the opposite of the selected state.
						} else { // If the shift key is not pressed.
							clearSelection(); // Clear the selection.
							setSelected(true); // Set the selected state to true.
						}
						return true;
					}

					return false;
				},
				COMMAND_PRIORITY_LOW // Command priority low.
			), 
			editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW), // Register the delete command.
			editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW), // Register the backspace command.
			editor.registerCommand(KEY_ENTER_COMMAND, onEnter, COMMAND_PRIORITY_LOW), // Register the enter command.
			editor.registerCommand(KEY_ESCAPE_COMMAND, onEscape, COMMAND_PRIORITY_LOW) // Register the escape command.
		);
		return () => { // Return a cleanup function.
			isMounted = false; // Set the mounted state to false.
			unregister(); // Unregister the commands.
		};
	}, [clearSelection, editor, isResizing, isSelected, nodeKey, onDelete, onEnter, onEscape, setSelected]); // Dependency array.

	const setShowCaption = () => { // Function that sets the show caption.
		editor.update(() => { // Update the editor.
			const node = $getNodeByKey(nodeKey); // Get the node by key.
			if ($isImageNode(node)) { // If the node is an image node.
				node.setShowCaption(true); // Set the show caption to true.
			}
		});
	};

	const onResizeEnd = (nextWidth, nextHeight) => { // Function that handles the resize end event.
		setTimeout(() => { // Set a timeout.
			setIsResizing(false); // Set the resizing state to false.
		}, 200); // Set the timeout to 200 milliseconds.

		editor.update(() => { // Update the editor.
			const node = $getNodeByKey(nodeKey); // Get the node by key.
			if ($isImageNode(node)) { // If the node is an image node.
				node.setWidthAndHeight(nextWidth, nextHeight); // Set the width and height of the node.
			}
		});
	};

	const onResizeStart = () => { // Function that handles the resize start event.
		setIsResizing(true); // Set the resizing state to true.
	};

	const isFocused = isSelected || isResizing; // Set the focused state to the selected state or the resizing state.
	return (
		<Suspense fallback={null}>
			<>
				<div>
					<LazyImage
						className={isFocused ? `focused ${$isNodeSelection(selection)}` : null}
						src={src}
						altText={altText}
						imageRef={imageRef}
						width={width}
						height={height}
						maxWidth={maxWidth}
					/>
				</div>

				{resizable && $isNodeSelection(selection) && isFocused && (
					<ImageResizer
						showCaption={showCaption}
						setShowCaption={setShowCaption}
						editor={editor}
						buttonRef={buttonRef}
						imageRef={imageRef}
						maxWidth={maxWidth}
						onResizeStart={onResizeStart}
						onResizeEnd={onResizeEnd}
						captionsEnabled={captionsEnabled}
					/>
				)}
			</>
		</Suspense>
	);
}
