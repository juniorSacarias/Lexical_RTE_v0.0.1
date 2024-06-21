import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils';
import {
	$createParagraphNode,
	$insertNodes,
	$isRootOrShadowRoot,
	COMMAND_PRIORITY_EDITOR,
	createCommand
} from 'lexical';
import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { Box, Button, Grid, TextField } from '@mui/material';
import { CAN_USE_DOM } from '../../../common/utils/canUseDom';
import { $createImageNode, ImageNode } from '../../CustomNodes/ImageNode';
import axios from 'axios';
import loginWithCredentials from '../../../lib/loginWithCredentials';
const getDOMSelection = targetWindow => (CAN_USE_DOM ? (targetWindow || window).getSelection() : null); // Get the DOM selection.

export const INSERT_IMAGE_COMMAND = createCommand('INSERT_IMAGE_COMMAND'); // Create a command to insert an image.

export function InsertImageUriDialogBody({ onClick }) {
	// InsertImageUriDialogBody is a component that displays the dialog body for inserting an image from a URL. props.onClick is a function that is called when the user clicks the confirm button.
	const [src, setSrc] = useState(''); // The URL of the image.
	const [altText, setAltText] = useState(''); // The alternative text of the image.

	const isDisabled = src === ''; // Whether the confirm button is disabled.

	return (
		<>
			<TextField
				label="Image URL"
				placeholder="i.e. https://source.unsplash.com/random"
				onChange={event => setSrc(event.target.value)}
				value={src}
				sx={{ mb: 7, height: 10 }}
				fullWidth
			/>
			<TextField
				label="Alt Text"
				placeholder="Random unsplash image"
				onChange={event => setAltText(event.target.value)}
				sx={{ mb: 7, height: 10 }}
				fullWidth
				value={altText}
				data-test-id="image-modal-alt-text-input"
			/>
			<Grid container justifyContent="flex-end">
				<Button
					data-test-id="image-modal-confirm-btn"
					disabled={isDisabled}
					onClick={() => onClick({ altText, src })}
					variant="outlined">
					Confirm
				</Button>
			</Grid>
		</>
	);
}

// InsertImageUploadedDialogBody is a component that displays the dialog body for inserting an image from a file. props.onClick is a function that is called when the user clicks the confirm button.

const InsertImageUploadedDialogBody = ({ onClick }) => {
	const [token, setToken] = useState('');
	const [file, setFile] = useState(null); 
	const [altText, setAltText] = useState(''); 
	const [isUploading, setIsUploading] = useState(false); 
	const [imagePreviewUrl, setImagePreviewUrl] = useState(''); 

	const isDisabled = !file || altText === ''; 

	useEffect(() => {
		const fetchToken = async () => {
			try {
				const { token } = await loginWithCredentials();
				setToken(token);
			} catch (error) {
				console.error('Error fetching token', error);
				alert('Error fetching token');
			}
		};
		fetchToken();
	}, []);

	const handleFileChange = e => {
		const selectedFile = e.target.files[0];
		setFile(selectedFile);

		// Crear una URL de vista previa de la imagen
		const reader = new FileReader();
		reader.onloadend = () => {
			setImagePreviewUrl(reader.result);
		};
		reader.readAsDataURL(selectedFile);
	};

	const handleImageUpload = async () => {
		if (!file || altText === '') {
			alert('Selecciona un archivo y proporciona un texto alternativo');
			return;
		}

		setIsUploading(true);

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('altText', altText);

			const response = await axios.post(
				`https://dev.api.ahamatic.com/api/richTextUpload?token=${token}`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				}
			);

			const imageUrl = response.data.location// 
			onClick({ altText, src: imageUrl }); 

			setFile(null);
			setAltText('');
			setImagePreviewUrl('');
			alert('Imagen cargada con éxito')
		} catch (error) {
			console.error('Error uploading image', error);
			alert('Error uploading image');
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<>
			<Button fullWidth sx={{ mb: 1 }} variant="contained" component="label">
				{isUploading ? 'Cargando...' : 'Seleccionar Imagen'}
				<input onChange={handleFileChange} hidden accept="image/*" type="file" />
			</Button>

			{imagePreviewUrl && (
				<img src={imagePreviewUrl} alt="Vista previa" style={{ maxWidth: '100%', marginBottom: '10px' }} />
			)}

			<TextField
				label="Texto Alternativo"
				placeholder="Texto descriptivo de la imagen"
				onChange={e => setAltText(e.target.value)}
				value={altText}
				sx={{ mb: 2 }}
				fullWidth
				variant="standard"
				data-test-id="image-modal-alt-text-input"
			/>

			<Grid container justifyContent="flex-end">
				<Button
					disabled={isDisabled || isUploading}
					onClick={handleImageUpload}
					variant="outlined"
					data-test-id="image-modal-confirm-btn">
					Confirmar
				</Button>
			</Grid>
		</>
	);
};

// InsertImageDialog is a component that displays the dialog for inserting an image. props.activeEditor is the active editor. props.onClose is a function that is called when the dialog is closed.
export function InsertImageDialog({ activeEditor, onClose }) {
	const [mode, setMode] = useState(null); // The mode of the dialog.
	const hasModifier = useRef(false); // Whether the user has the alt key pressed.

	useEffect(() => {
		hasModifier.current = false; // Set hasModifier to false.
		const handler = e => {
			// Create a keydown event handler.
			hasModifier.current = e.altKey; // Set hasModifier to the value of e.altKey.
		};
		document.addEventListener('keydown', handler); // Add the keydown event listener to the document.
		return () => {
			// Return a function that removes the event listener.
			document.removeEventListener('keydown', handler); // Remove the keydown event listener from the document.
		};
	}, [activeEditor]); // Add the keydown event listener when the active editor changes.

	// onClick is a function that is called when the user clicks the confirm button.
	const onClick = payload => {
		// Create a function that takes a payload.
		activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload); // Dispatch the INSERT_IMAGE_COMMAND command with the payload.
		onClose(); // Call the onClose function.
	};

	return (
		<>
			{!mode && (
				<Box>
					<Button data-test-id="image-modal-option-url" onClick={() => setMode('url')}>
						URL
					</Button>
					<Button data-test-id="image-modal-option-file" onClick={() => setMode('file')}>
						File
					</Button>
				</Box>
			)}
			{mode === 'url' && <InsertImageUriDialogBody onClick={onClick} />}
			{mode === 'file' && <InsertImageUploadedDialogBody onClick={onClick} />}
		</>
	);
}

// ImagesPlugin is a component that enables the user to insert images into the editor. props.captionsEnabled is a boolean that indicates whether captions are enabled.
export default function ImagesPlugin({ captionsEnabled }) {
	const [editor] = useLexicalComposerContext(); // Get the editor.

	useEffect(() => {
		if (!editor.hasNodes([ImageNode])) {
			// If the editor does not have the ImageNode,
			throw new Error('ImagesPlugin: ImageNode not registered on editor'); // Throw an error.
		}

		return mergeRegister(
			// Return the result of mergeRegister.
			editor.registerCommand(
				// Register a command on the editor.
				INSERT_IMAGE_COMMAND, // The command is INSERT_IMAGE_COMMAND.
				payload => {
					// The command takes a payload.
					const imageNode = $createImageNode(payload); // Create an ImageNode with the payload.
					$insertNodes([imageNode]); // Insert the ImageNode into the editor.
					if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
						// If the parent of the ImageNode is the root or shadow root,
						$wrapNodeInElement(imageNode, $createParagraphNode).selectEnd(); // Wrap the ImageNode in a paragraph node and select the end.
					}

					return true;
				},
				COMMAND_PRIORITY_EDITOR // The priority of the command is COMMAND_PRIORITY_EDITOR.
			)
		);
	}, [captionsEnabled, editor]); // Register the command when the captionsEnabled or editor changes.

	return null; // Return null.
}
