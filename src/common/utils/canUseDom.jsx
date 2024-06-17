export const CAN_USE_DOM = // Check if the window object is defined.
	typeof window !== 'undefined' && // Check if the document object is defined.
	typeof window.document !== 'undefined' && // Check if the createElement method is defined.
	typeof window.document.createElement !== 'undefined'; // Check if the addEventListener method is defined.
