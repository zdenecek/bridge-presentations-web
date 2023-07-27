export enum Rotation {
  Top = "top",
  Right = "right",
  Upside = "upside",
  Left = "left",
}

export class RotationHelper {
  static isHorizontal(rotation: Rotation): boolean {
    return rotation === Rotation.Top || rotation === Rotation.Upside;
  }
}
