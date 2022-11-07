import $ from "jquery";
import { Bid } from "../../bridge/model/Bid";
import { Position } from "../../bridge/model/Position";
import { BidView } from "./BidView";
import View from "./View";

import _ from "lodash";

export class BidStack extends View {
    bidViews: BidView[] = [];
    position: Position;

    element: View;

    constructor(position: Position) {
        super(`<div class='bid-stack-container bid-stack-container-${position}'></div>`);
        this.element = new View(`<div class='bid-stack bid-stack-${position}'></div>`);
        this.addSubView(this.element);
        this.position = position;

        new ResizeObserver(_.throttle(() => {
            if(this.position == Position.East || this.position == Position.West)  {
                this.element.root.css({transition: "none"});
                this.element.root.css({width: this.height, height: this.width, "transform-origin": this.width/2 + "px " +  this.width/2 + "px "});
                this.element.root.css({transition: "initial"});
            }
        }, 10)).observe(this.root[0]);
    }

    update(): void {
        this.updateSpacing();
    }

    updateSpacing(): void {
        const newWidth = Math.min(Math.max(20, (this.root.width() || 200) / this.bidViews.length), 40);
        this.bidViews.forEach((bidView, index) => bidView.root.css("left", `${newWidth * index}px`));
    }

    addBid(bid: Bid): void {
        const bidView = new BidView(bid);
        this.bidViews.push(bidView);
        this.element.addSubView(bidView);
        bidView.root.css("top", "10vh").animate({ top: "0px" });
        this.updateSpacing();
    }

    removeLastBid(): void {
        if (this.bidViews.length === 0) return;
        const bidView = this.bidViews.pop()!;
        bidView.root.animate({ top: "10vh" }, () => bidView.root.remove());
    }



    reset(): void {
        this.bidViews.forEach((bidView) => bidView.root.remove());
        this.bidViews = [];
    }
}
