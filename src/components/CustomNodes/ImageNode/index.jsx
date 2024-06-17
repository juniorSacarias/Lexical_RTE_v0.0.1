import { $applyNodeReplacement, createEditor, DecoratorNode } from 'lexical';
import React, { Suspense } from 'react';

const ImageComponent = React.lazy(() => import('./ImageComponent')); // Path: src/components/CustomNodes/ImageNode/ImageComponent

// This function is used to convert an image element to a node.
function convertImageElement(domNode) {
	if (domNode instanceof HTMLImageElement) {
		const { alt: altText, src, width, height } = domNode; // Extract the alt, src, width, and height attributes from the image element.
		const node = $createImageNode({ altText, height, src, width }); // Create a new image node with the extracted attributes.
		return { node }; // Return the new image node.
	}
	return null; // Return null if the domNode is not an image element.
}

export class ImageNode extends DecoratorNode {
	// ImageNode class extends the DecoratorNode class.
	__src;
	__altText;
	__width;
	__height;
	__maxWidth;
	__showCaption;
	__caption;
	__captionsEnabled;

	static getType() {
		// Static method that returns the type of the node.
		return 'image';
	}

	static clone(node) {
		// Static method that clones the node.
		return new ImageNode( // Create a new image node with the same attributes as the original node.
			node.__src,
			node.__altText,
			node.__maxWidth,
			node.__width,
			node.__height,
			node.__showCaption,
			node.__caption,
			node.__captionsEnabled,
			node.__key
		);
	}

	static importJSON(serializedNode) {
		// Static method that imports a node from a JSON object.
		const { altText, height, width, maxWidth, caption, src, showCaption } = serializedNode; // Extract the altText, height, width, maxWidth, caption, src, and showCaption attributes from the serializedNode.
		const node = $createImageNode({
			// Create a new image node with the extracted attributes.
			altText,
			height,
			maxWidth,
			showCaption,
			src,
			width
		});
		const nestedEditor = node.__caption; // Get the nested editor from the node.
		const editorState = nestedEditor.parseEditorState(caption.editorState); // Parse the editor state from the caption attribute.
		if (!editorState.isEmpty()) {
			// If the editor state is not empty, set the editor state of the nested editor.
			nestedEditor.setEditorState(editorState); // Set the editor state of the nested editor.
		}
		return node; // Return the new image node.
	}

	exportDOM() {
		// Method that exports the node to a DOM element.
		const element = document.createElement('img'); // Create a new image element.
		element.setAttribute('src', this.__src); // Set the src attribute of the image element to the src attribute of the node.
		element.setAttribute('alt', this.__altText); // Set the alt attribute of the image element to the altText attribute of the node.
		element.setAttribute('width', this.__width.toString()); // Set the width attribute of the image element to the width attribute of the node.
		element.setAttribute('height', this.__height.toString()); // Set the height attribute of the image element to the height attribute of the node.
		return { element }; // Return the image element.
	}

	static importDOM() {
		// Static method that imports a node from a DOM element.
		return {
			// Return an object with the following properties.
			img: node => ({
				// The img property is a function that takes a node as an argument and returns an object with the following properties.
				conversion: convertImageElement, // The conversion property is a function that converts the image element to a node.
				priority: 0 // The priority property is set to 0.
			})
		};
	}

	constructor(src, altText, maxWidth, width, height, showCaption, caption, captionsEnabled, key) {
		// Constructor that initializes the image node with the specified attributes.
		super(key);
		this.__src = src;
		this.__altText = altText;
		this.__maxWidth = maxWidth;
		this.__width = width || 'inherit';
		this.__height = height || 'inherit';
		this.__showCaption = showCaption || false;
		this.__caption = caption || createEditor();
		this.__captionsEnabled = captionsEnabled || captionsEnabled === undefined;
	}

	exportJSON() {
		// Method that exports the node to a JSON object.
		return {
			altText: this.getAltText(),
			caption: this.__caption.toJSON(),
			height: this.__height === 'inherit' ? 0 : this.__height,
			maxWidth: this.__maxWidth,
			showCaption: this.__showCaption,
			src: this.getSrc(),
			type: 'image',
			version: 1,
			width: this.__width === 'inherit' ? 0 : this.__width
		};
	}

	setWidthAndHeight(width, height) {
		// Method that sets the width and height of the node.
		const writable = this.getWritable(); // Get the writable version of the node.
		writable.__width = width; // Set the width attribute of the writable node to the specified width.
		writable.__height = height; // Set the height attribute of the writable node to the specified height.
	}

	setShowCaption(showCaption) {
		// Method that sets the showCaption attribute of the node.
		const writable = this.getWritable(); // Get the writable version of the node.
		writable.__showCaption = showCaption; // Set the showCaption attribute of the writable node to the specified value.
	}

	// View

	createDOM(config) {
		// Method that creates a DOM element for the node.
		const span = document.createElement('span'); // Create a new span element.
		const theme = config.theme; // Get the theme from the config.
		const className = theme.image; // Get the image class name from the theme.
		if (className !== undefined) {
			// If the class name is defined, set the class name of the span element.
			span.className = className; // Set the class name of the span element to the image class name.
		}
		return span; // Return the span element.
	}

	updateDOM() {
		// Method that updates the DOM element of the node.
		return false;
	}

	getSrc() {
		// Method that returns the src attribute of the node.
		return this.__src;
	}

	getAltText() {
		// Method that returns the altText attribute of the node.
		return this.__altText;
	}

	decorate() {
		// Method that returns the caption of the node.
		return (
			<Suspense fallback={null}>
				<ImageComponent
					src={this.__src}
					altText={this.__altText}
					width={this.__width}
					height={this.__height}
					maxWidth={this.__maxWidth}
					nodeKey={this.getKey()}
					showCaption={this.__showCaption}
					caption={this.__caption}
					captionsEnabled={this.__captionsEnabled}
					resizable={true}
				/>
			</Suspense>
		);
	}
}

export function $createImageNode({
	// Function that creates a new image node with the specified attributes.
	altText,
	height,
	maxWidth = 500,
	captionsEnabled,
	src,
	width,
	showCaption,
	caption,
	key
}) {
	return $applyNodeReplacement(
		// Apply the node replacement.
		new ImageNode(src, altText, maxWidth, width, height, showCaption, caption, captionsEnabled, key) // Create a new image node with the specified attributes.
	);
}

export function $isImageNode(node) {
	// Function that returns true if the node is an image node.
	return node instanceof ImageNode; // Return true if the node is an instance of the ImageNode class.
}
