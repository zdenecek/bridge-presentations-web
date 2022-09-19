import $ from "jquery";
import { Bid, ContractBid, DoubleBid, PassBid, RedoubleBid } from "../model/Bid";
import { SuitHelper } from "../model/Suit";
import { Point } from "./Point";

export class BidView {
    static images = require.context("@/presenter/assets/bidding", false, /\.(png|jpe?g|svg)$/);

    element: JQuery<HTMLElement>;
    bid: Bid;

    constructor(bid: Bid) {
        this.bid = bid;
        this.element = $(`<div class='bid ${this.getClass(bid)}'>
            <img src='${this.getImagePath()}' alt='${bid}'/>
            </div>`);
    }

    private getImagePath(): string {
        if (this.bid instanceof ContractBid) {
            return BidView.images(`./${this.bid.level}${SuitHelper.toLetter(this.bid.suit)}.png`);
        } else if (this.bid instanceof PassBid) {
            return BidView.images(`./pass.png`);
        } else if (this.bid instanceof DoubleBid) {
            return BidView.images(`./x.png`);
        } else if (this.bid instanceof RedoubleBid) {
            return BidView.images(`./xx.png`);
        }
        throw new Error("Unknown bid type");
    }

    private getClass(bid: Bid): string {
        if (bid instanceof ContractBid) {
            return SuitHelper.toString(bid.suit).toLowerCase();
        } else if (bid instanceof PassBid) {
            return 'pass'
        } else if (bid instanceof DoubleBid) {
            return 'double'
        } else if (bid instanceof RedoubleBid) {
            return "redouble"
        }
        return "unknown";
    }


    public set position(value: Point) {
        this.element.css("transition", "ease 1s")
        this.element.css(value.asCoords());
    }

}
                                                                                                            