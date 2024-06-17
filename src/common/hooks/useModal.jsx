import { useCallback, useMemo, useState } from 'react';
import * as React from 'react';
import Modal from '../../components/ui/Modal';

export default function useModal() {
	// Function that returns a modal.
	const [modalContent, setModalContent] = useState(null); // Create a state variable to store the modal content.

	const onClose = useCallback(() => {
		// Function that closes the modal.
		setModalContent(null); // Set the modal content to null.
	}, []);

	const modal = useMemo(() => {
		// Create a memoized modal component.
		if (modalContent === null) {
			// If the modal content is null.
			return null; // Return null.
		}
		const { title, content, closeOnClickOutside } = modalContent; // Destructure the title, content, and closeOnClickOutside from the modal content.
		return (
			// Return a modal component.
			<Modal onClose={onClose} title={title} open={!!modalContent} closeOnClickOutside={closeOnClickOutside}>
				{content}
			</Modal>
		);
	}, [modalContent, onClose]);

	const showModal = useCallback(
		// Function that shows the modal.
		(title, getContent, closeOnClickOutside = false) => { // Destructure the title, getContent, and closeOnClickOutside from the arguments.
			setModalContent({ // Set the modal content.
				closeOnClickOutside, // Set the closeOnClickOutside property.
				content: getContent(onClose), // Set the content property to the result of the getContent function.
				title // Set the title property.
			});
		},
		[onClose] // Add onClose to the dependency array.
	);

	return [modal, showModal]; // Return the modal and showModal function.
}
