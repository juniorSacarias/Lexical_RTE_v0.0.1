export function getDOMRangeRect(nativeSelection, rootElement) { // Function that returns the bounding rectangle of a DOM range.
	const domRange = nativeSelection.getRangeAt(0); // Get the range of the native selection.

	let rect; // Create a variable to store the bounding rectangle.

	if (nativeSelection.anchorNode === rootElement) { // If the anchor node is the root element.
		let inner = rootElement; // Set the inner element to the root element.
		while (inner.firstElementChild != null) { // While the inner element has a first child element.
			inner = inner.firstElementChild; // Set the inner element to the first child element.
		}
		rect = inner.getBoundingClientRect(); // Get the bounding rectangle of the inner element.
	} else {
		rect = domRange.getBoundingClientRect(); // Get the bounding rectangle of the range.
	}

	return rect;
}
