export enum Orientation {
  Up = "up",
  Right = "right",
  Down = "down",
  Left = "left",
}

/**
 * Returns true if the given rotation is horizontal (Top or Upside).
 * @param rotation - The rotation to check.
 * @returns True if rotation is Top or Upside, false otherwise.
 */
export function isHorizontal(rotation: Orientation): boolean {
  return rotation === Orientation.Up || rotation === Orientation.Down;
}
