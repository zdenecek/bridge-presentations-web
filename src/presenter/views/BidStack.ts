import { Bid } from "../../bridge/model/Bid";
import { Position } from "../../bridge/model/Position";
import { BidView } from "./BidView";
import View from "./View";
import { runLater } from "@/bridge/utils/runLater";

export class BidStack extends View {
  bidViews: BidView[] = [];
  position: Position;

  element: View;

  constructor(position: Position) {
    super(
      `<div class='bid-stack-container bid-stack-container-${position}'></div>`
    );
    this.element = new View(
      `<div class='bid-stack bid-stack-${position}'></div>`
    );
    this.addSubView(this.element);
    this.position = position;

    new ResizeObserver(() => {
      if (this.position == Position.East || this.position == Position.West) {
        this.element.root.style.transition = "none";
        this.element.root.style.width = `${this.height}px`;
        this.element.root.style.height = `${this.width}px`;
        this.element.root.style.transformOrigin = "0 0";
        this.element.root.style.transition = "initial";
      }
      this.update();
    }).observe(this.root);
  }

  update(): void {
    this.updateSpacing();
  }

  updateSpacing(): void {
    if (this.bidViews.length === 0) return;
    const space = Math.min(
      40,
      Math.max(20, this.element.width / this.bidViews.length)
    );

    // interesting fix, the image doesnt load instantenously
    if (this.bidViews[0].width === 0) {
      runLater(() => this.updateSpacing(), 2);
      return;
    }

    // yet another hack
    this.bidViews.forEach((e) => e.show());

    const len = this.bidViews[0].width + space * (this.bidViews.length - 1);

    let pos = (this.element.width - len) / 2;

    this.bidViews.forEach((bidView) => {
      bidView.root.style.left = `${pos}px`;
      pos += space;
    });
  }

  addBid(bid: Bid): void {
    const bidView = new BidView(bid);
    bidView.hide();

    this.bidViews.push(bidView);
    this.element.addSubView(bidView);

    const isSouth = this.position === Position.South;

    bidView.root.style.top = isSouth ? "10vh" : "-10vh";
    bidView.root.style.transition = "top 0.5s ease";
    setTimeout(() => {
      bidView.root.style.top = "0px";
    }, 0);

    this.updateSpacing();
  }

  removeLastBid(): void {
    const bidView = this.bidViews.pop();
    if (!bidView) return;

    const isSouth = this.position === Position.South;
    bidView.root.style.transition = "top 0.5s ease"; // Add transition for the animation
    bidView.root.style.top = isSouth ? "10vh" : "-10vh";

    bidView.root.addEventListener(
      "transitionend",
      function handleTransitionEnd() {
        bidView.detach();
        bidView.root.removeEventListener("transitionend", handleTransitionEnd); // Clean up the event listener
      }
    );
  }

  reset(): void {
    this.bidViews.forEach((bidView) => bidView.root.remove());
    this.bidViews = [];
  }
}
