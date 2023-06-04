import CenterFrameView from "./CenterFrameView";
import View from "./View";

export default class CenterPanelView extends View {
  centerFrameView: CenterFrameView;

  constructor(centerFrameView: CenterFrameView) {
    super(`<div class="center-panel"></div>`);
    this.centerFrameView = centerFrameView;
    this.bidding = true;
  }

  public set bidding(value: boolean) {
    this.root.toggleClass("center-panel-bidding", value);
  }
}
