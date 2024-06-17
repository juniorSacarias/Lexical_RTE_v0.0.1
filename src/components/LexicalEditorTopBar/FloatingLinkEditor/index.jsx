import { useEffect, useRef, useState } from "react";
import {
  SELECTION_CHANGE_COMMAND,
  $getSelection,
  $isRangeSelection,
} from "lexical";
import { mergeRegister } from "@lexical/utils";
import { useCallback } from "react";
import EditIcon from "@mui/icons-material/Edit";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import DoneIcon from "@mui/icons-material/Done";

import { $isAtNodeEnd } from "@lexical/selection";
import {
  FloatingDivContainer,
  FloatingDivLink,
  FloatingDivLinkInput,
} from "./styles";
import { Grid, IconButton } from "@mui/material";

const LowPriority = 1;

// FloatingLinkEditor is a component that displays a floating link editor, which allows the user to edit the URL of a link. props.editor is the editor instance.
function FloatingLinkEditor({ editor }) {
  const editorRef = useRef(null); // The ref to the floating link editor element.
  const inputRef = useRef(null); // The ref to the input element in the floating link editor.
  const mouseDownRef = useRef(false); // A ref to store whether the mouse is down.
  const [linkUrl, setLinkUrl] = useState(""); // The URL of the link.
  const [isEditMode, setEditMode] = useState(false); // Whether the editor is in edit mode.
  const [lastSelection, setLastSelection] = useState(null); // The last selection.

  // updateLinkEditor is a function that updates the link editor based on the current selection.
  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection(); // Get the current selection.
    if ($isRangeSelection(selection)) { // If the selection is a range selection.
      const node = getSelectedNode(selection); // Get the selected node.
      const parent = node.getParent(); // Get the parent of the selected node.
      if ($isLinkNode(parent)) { // If the parent is a link node.
        setLinkUrl(parent.getURL()); // Set the URL of the link.
      } else if ($isLinkNode(node)) { // If the selected node is a link node.
        setLinkUrl(node.getURL()); // Set the URL of the link.
      } else { 
        setLinkUrl(""); // Set the URL of the link to an empty string.
      }
    }
    const editorElem = editorRef.current; // Get the editor element.
    const nativeSelection = window.getSelection(); // Get the native selection.
    const activeElement = document.activeElement; // Get the active element.

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement(); // Get the root element of the editor.

    // If the selection is not null, the selection is not collapsed, the root element is not null, and the root element contains the anchor node of the native 
    // selection.
    if (
      selection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const domRange = nativeSelection.getRangeAt(0); // Get the DOM range of the selection.
      let rect; // The rectangle of the selection.
      if (nativeSelection.anchorNode === rootElement) { // If the anchor node of the native selection is the root element.
        let inner = rootElement; // Set inner to the root element.
        while (inner.firstElementChild != null) { // While the first element child of inner is not null.
          inner = inner.firstElementChild; // Set inner to the first element child of inner.
        }
        rect = inner.getBoundingClientRect(); // Get the bounding client rectangle of inner.
      } else {
        rect = domRange.getBoundingClientRect(); // Get the bounding client rectangle of the DOM range.
      }

      if (!mouseDownRef.current) { // If the mouse is not down.
        positionEditorElement(editorElem, rect); // Position the editor element.
      }
      setLastSelection(selection); // Set the last selection.
    } else if (!activeElement || activeElement.className !== "link-input") { // If the active element is null or the class name of the active element is not "link-input".
      positionEditorElement(editorElem, null); // Position the editor element.
      setLastSelection(null); // Set the last selection to null.
      setEditMode(false); // Set the edit mode to false.
      setLinkUrl(""); // Set the URL of the link to an empty string.
    }

    return true;
  }, [editor]); // The dependencies of the function.

  useEffect(() => {
    // Register the update listener and the selection change command.
    return mergeRegister(
      // Register the update listener.
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => { // Read the editor state.
          updateLinkEditor(); // Update the link editor.
        });
      }),
      // Register the selection change command.
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => { // The handler of the command.
          updateLinkEditor(); // Update the link editor.
          return true;
        },
        LowPriority // The priority of the command.
      )
    );
  }, [editor, updateLinkEditor]); // The dependencies of the effect.

  useEffect(() => {
    editor.getEditorState().read(() => { // Read the editor state.
      updateLinkEditor(); // Update the link editor.
    });
  }, [editor, updateLinkEditor]); // The dependencies of the effect.

  useEffect(() => {
    if (isEditMode && inputRef.current) { // If the editor is in edit mode and the input ref is not null.
      inputRef.current.focus(); // Focus on the input.
    }
  }, [isEditMode]); // The dependencies of the effect.

  return (
    <FloatingDivContainer ref={editorRef}>
      <Grid container alignItems="center">
        <Grid item xs={10}>
          {isEditMode ? (
            <FloatingDivLinkInput
              ref={inputRef}
              fullWidth
              value={linkUrl}
              inputProps={{ sx: { height: 10 } }}
              onChange={(event) => {
                setLinkUrl(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (lastSelection !== null) {
                    if (linkUrl !== "") {
                      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
                    }
                    setEditMode(false);
                  }
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  setEditMode(false);
                }
              }}
            />
          ) : (
            <FloatingDivLink>
              <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                {linkUrl}
              </a>
            </FloatingDivLink>
          )}
        </Grid>
        <Grid item xs={1}>
          <IconButton
            className="link-edit"
            role="button"
            tabIndex={0}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setEditMode(!isEditMode);
            }}
          >
            {isEditMode ? <DoneIcon /> : <EditIcon />}
          </IconButton>
        </Grid>
      </Grid>
    </FloatingDivContainer>
  );
}

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

function positionEditorElement(editor, rect) {
  if (rect === null) {
    editor.style.opacity = "0";
    editor.style.top = "-1000px";
    editor.style.left = "-1000px";
  } else {
    editor.style.opacity = "1";
    editor.style.top = `${rect.top + rect.height + window.pageYOffset + 10}px`;
    editor.style.left = `${
      rect.left + window.pageXOffset - editor.offsetWidth / 2 + rect.width / 2
    }px`;
  }
}

export default FloatingLinkEditor;
