import { Point } from "../model/Point";

export function getElementOffset(element?: HTMLElement | null): Point {
  if (!element) return Point.Origin;
  
  if (!element.getClientRects().length) {
    return Point.Origin;
  }

  let rect = element.getBoundingClientRect();
  let win = element.ownerDocument.defaultView;
  if (!win) throw new Error("Window not found");
  return new Point(
    rect.left + (win?.pageXOffset ?? 0),
    rect.top + (win?.pageYOffset ?? 0),
  );
}
