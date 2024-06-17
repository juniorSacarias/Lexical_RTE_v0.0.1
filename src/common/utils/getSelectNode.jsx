import { $isAtNodeEnd } from '@lexical/selection'; // Import the is at node end function from the selection module.

export function getSelectedNode(selection) { // Function that returns the selected node.
	const anchor = selection.anchor; // Get the anchor of the selection.
	const focus = selection.focus; // Get the focus of the selection.
	const anchorNode = selection.anchor.getNode(); // Get the anchor node of the selection.
	const focusNode = selection.focus.getNode(); // Get the focus node of the selection.
	if (anchorNode === focusNode) { // If the anchor node is the focus node.
		return anchorNode; // Return the anchor node.
	}
	const isBackward = selection.isBackward(); // Check if the selection is backward.
	if (isBackward) { // If the selection is backward.
		return $isAtNodeEnd(focus) ? anchorNode : focusNode; // Return the anchor node if the focus is at the node end, otherwise return the focus node.
	} else {
		return $isAtNodeEnd(anchor) ? anchorNode : focusNode; // Return the anchor node if the anchor is at the node end, otherwise return the focus node.
	}
}
