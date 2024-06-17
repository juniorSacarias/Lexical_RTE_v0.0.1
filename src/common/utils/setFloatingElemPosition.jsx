const VERTICAL_GAP = 10; // px
const HORIZONTAL_OFFSET = 5; // px

export function setFloatingElemPosition( // Function that sets the position of a floating element.
	targetRect,
	floatingElem,
	anchorElem,
	verticalGap = VERTICAL_GAP,
	horizontalOffset = HORIZONTAL_OFFSET
) {
	// Function that sets the position of a floating element.
	const scrollerElem = anchorElem.parentElement; // Get the parent element of the anchor element.

	if (targetRect === null || !scrollerElem) {
		// If the target rectangle is null or the scroller element does not exist.
		floatingElem.style.opacity = '0'; // Set the opacity of the floating element to 0.
		floatingElem.style.transform = 'translate(-10000px, -10000px)'; // Set the transform of the floating element.
		return; // Return.
	}

	const floatingElemRect = floatingElem.getBoundingClientRect(); // Get the bounding rectangle of the floating element.
	const anchorElementRect = anchorElem.getBoundingClientRect(); // Get the bounding rectangle of the anchor element.
	const editorScrollerRect = scrollerElem.getBoundingClientRect(); // Get the bounding rectangle of the scroller element.

	let top = targetRect.top - floatingElemRect.height - verticalGap; // Set the top position of the floating element.
	let left = targetRect.left - horizontalOffset; // Set the left position of the floating element.

	if (top < editorScrollerRect.top) {
		// If the top position is less than the top of the scroller element.
		top += floatingElemRect.height + targetRect.height + verticalGap * 2; // Set the top position.
	}

	if (left + floatingElemRect.width > editorScrollerRect.right) {
		// If the left position plus the width of the floating element is greater than the right of the scroller element.
		left = editorScrollerRect.right - floatingElemRect.width - horizontalOffset; // Set the left position.
	}

	top -= anchorElementRect.top; // Subtract the top of the anchor element.
	left -= anchorElementRect.left; // Subtract the left of the anchor element.

	floatingElem.style.opacity = '1'; // Set the opacity of the floating element to 1.
	floatingElem.style.transform = `translate(${left}px, ${top}px)`; // Set the transform of the floating element.
}
