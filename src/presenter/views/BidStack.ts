import { Bid } from "../../bridge/model/Bid";
import { Position } from "../../bridge/model/Position";
import { BidView } from "./BidView";
import View from "./View";

export class BidStack extends View {
  bidViews: BidView[] = [];
  position: Position;

  element: View;

  constructor(position: Position) {
    super(
      `<div class='bid-stack-container bid-stack-container-${position}'></div>`,
    );
    this.element = new View(
      `<div class='bid-stack bid-stack-${position}'></div>`,
    );
    this.addSubView(this.element);
    this.position = position;

    new ResizeObserver(() => {
      if (this.position == Position.East || this.position == Position.West) {
        this.element.root.css({ transition: "none" });
        this.element.root.css({
          width: this.height,
          height: this.width,
          "transform-origin": "0 0",
        });
        this.element.root.css({ transition: "initial" });
      }
      this.update();
    }).observe(this.root[0]);
  }

  update(): void {
    this.updateSpacing();
  }

  updateSpacing(): void {
    if (this.bidViews.length === 0) return;
    const space = Math.min(
      40,
      Math.max(20, this.element.width / this.bidViews.length),
    );

    // interesting fix, the image doesnt load instantenously
    if (this.bidViews[0].width === 0) {
      setTimeout(() => this.updateSpacing(), 2);
      return;
    }

    // yet another hack
    this.bidViews.forEach((e) => e.show());

    const len = this.bidViews[0].width + space * (this.bidViews.length - 1);

    let pos = (this.element.width - len) / 2;

    this.bidViews.forEach((bidView) => {
      bidView.root.css("left", `${pos}px`);
      pos += space;
    });
  }

  addBid(bid: Bid): void {
    const bidView = new BidView(bid);
    this.bidViews.push(bidView);
    bidView.hide();
    this.element.addSubView(bidView);
    bidView.root
      .css("top", this.position === Position.South ? "10vh" : "-10vh")
      .animate({ top: "0px" });
    this.updateSpacing();
  }

  removeLastBid(): void {
    const bidView = this.bidViews.pop();
    if (!bidView) return;

    bidView.root.animate(
      { top: this.position === Position.South ? "10vh" : "-10vh" },
      () => bidView.root.remove(),
    );
  }

  reset(): void {
    this.bidViews.forEach((bidView) => bidView.root.remove());
    this.bidViews = [];
  }
}
