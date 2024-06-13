// Function to move cursor to the end
export function moveCursorToEnd(element: HTMLElement) {
  const range = document.createRange();
  const selection = window.getSelection();

  // Ensure that the element contains a text node
  if (element.childNodes.length > 0 && element.childNodes[0].nodeType === Node.TEXT_NODE && selection !== null) {
    const textNode = element.childNodes[0];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    range.setStart(textNode, textNode.length);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    // element.focus();
  } else {
    // If there's no text node, create one and set the cursor at the end
    const textNode = document.createTextNode('');
    element.appendChild(textNode);
    range.setStart(textNode, 0);
    range.collapse(true);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    selection.removeAllRanges();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    selection.addRange(range);
    // element.focus();
  }
}
