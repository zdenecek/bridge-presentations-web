import { Position, PositionHelper } from "@/bridge/model/Position";
import { Vulnerability, VulnerabilityHelper } from "@/bridge/model/Vulnerability";
import CenterFrameLabelView from "./CenterFrameLabelView";
import View from "./View";

export default class CenterFrameView extends View {
  labels: Map<Position, CenterFrameLabelView> = new Map();
  private _focus: Position | undefined;

  constructor() {
    super(`<div class="center-frame"></div>`);

    const frame = new View("<div class='frame'></div>");
    this.addSubView(frame);

    PositionHelper.all().forEach((pos) => {
      const v = new CenterFrameLabelView(pos);
      this.labels.set(pos, v);
      frame.addSubView(v);
    });
  }

  public set vulnerability(value: Vulnerability) {
    PositionHelper.all().forEach((pos) => {
      const vul = VulnerabilityHelper.IsVulnerable(pos, value);
      this.labels.get(pos)?.root.toggleClass("label-vul", vul);
      this.labels.get(pos)?.root.toggleClass("label-nonvul", !vul);
    });
  }

  public get focus(): Position | undefined {
    return this._focus;
  }
  public set focus(value: Position | undefined) {
    if (this.focus === value) return;
    if (this.focus) {
      const label = this.labels.get(this.focus);
      if (label) label.focus = false;
    }
    this._focus = value;
    if (value) {
      const label = this.labels.get(value);

      if (label) label.focus = true;
    }
  }
}
