import $ from "jquery";
import { Bid } from "../../bridge/model/Bid";
import { Position } from "../../bridge/model/Position";
import { BidView } from "./BidView";

export class BidStack {
    root: JQuery<HTMLElement>;
    bidViews: BidView[] = [];
    position: Position;

    constructor(parent: JQuery<HTMLElement>, position: Position) {
        this.position = position;
        this.root = $(`<div class='bid-stack bid-stack-${position}'></div>`);
        parent.append(this.root);
    }

    addBid(bid: Bid): void {
        const bidView = new BidView(bid);
        this.bidViews.push(bidView);
        this.root.append(bidView.element);
        bidView.element.css("top", "10vh").animate({ top: "0px" });
        this.updateSpacing();
    }
    
    removeLastBid(): void {
        if(this.bidViews.length === 0) return;
        const bidView = this.bidViews.pop()!;
        bidView.element.animate({ top: "10vh" }, () => bidView.element.remove());
    }

    updateSpacing(): void {
        const newWidth = Math.min(Math.max(20, (this.root.width() || 200) / this.bidViews.length), 40);
        this.bidViews.forEach((bidView, index) => bidView.element.css('left', `${newWidth * index}px`))
    }


    reset(): void {
        this.bidViews.forEach((bidView) => bidView.element.remove());
        this.bidViews = [];
    }
}
