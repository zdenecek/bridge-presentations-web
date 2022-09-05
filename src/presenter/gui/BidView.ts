import $ from "jquery";
import { Bid, ContractBid, DoubleBid, PassBid, RedoubleBid } from "../model/Bid";
import { Position } from "../model/Position";
import { Suits } from "../model/Suit";
import { Point } from "./Point";

export class BidView {
    static images = require.context("@/presenter/assets/bidding", false, /\.(png|jpe?g|svg)$/);

    element: JQuery<HTMLElement>;
    bid: Bid;
    bidPosition: Position;

    constructor(bid: Bid, position: Position) {
        this.bidPosition = position;
        this.bid = bid;
        this.element = $(`<div class='bid bid-${position}'>
            <img src='${this.getImagePath()}' alt='${bid}'/>
            </div>`);
    }

    private getImagePath(): string {
        if (this.bid instanceof ContractBid) {
            return BidView.images(`./${this.bid.level}${Suits.toLetter(this.bid.suit)}.png`);
        } else if (this.bid instanceof PassBid) {
            return BidView.images(`./pass.png`);
        } else if (this.bid instanceof DoubleBid) {
            return BidView.images(`./double.png`);
        } else if (this.bid instanceof RedoubleBid) {
            return BidView.images(`./redouble.png`);
        }
        throw new Error("Unknown bid type");
    }

    public set position(value: Point) {
        this.element.css("transition", "ease 1s")
        this.element.css(value.asCoords());
    }
    
}
