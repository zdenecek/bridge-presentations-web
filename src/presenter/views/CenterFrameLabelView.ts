import { Position } from "@/bridge/model/Position";
import View from "./View";

export default class CenterFrameLabelView extends View {
  constructor(position: Position) {
    super(
      `<div class='center-frame-label center-frame-label-${position}'>${position}</div>`,
    );
  }

  public set focus(value: boolean) {
    this.root.toggleClass("focused", value);
  }
}
