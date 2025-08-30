export function getOffset(element: HTMLElement): { top: number; left: number } {
  if (!element.getClientRects().length) {
    return { top: 0, left: 0 };
  }

  let rect = element.getBoundingClientRect();
  let win = element.ownerDocument.defaultView;
  if (!win) throw new Error('Window not found');
  return {
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset,
  };
}
