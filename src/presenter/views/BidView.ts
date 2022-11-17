import $ from "jquery";
import { Bid, ContractBid, DoubleBid, PassBid, RedoubleBid } from "../../bridge/model/Bid";
import { SuitHelper } from "../../bridge/model/Suit";
import { Point } from "../classes/Point";
import View from "./View";

export class BidView extends View {
    static images = require.context("@/presenter/assets/bidding-c", false, /\.(png|jpe?g|svg)$/);

    bid: Bid;

    constructor(bid: Bid) {
        super(`<div class='bid ${BidView.getClass(bid)}'>
        <img src='${BidView.getImagePath(bid)}' alt='${bid}'/>
        </div>`);
        this.bid = bid;
    }

    static getImagePath(bid: Bid): string {
        if (bid instanceof ContractBid) {
            return BidView.images(`./${bid.level}${SuitHelper.toLetter(bid.suit)}.png`);
        } else if (bid instanceof PassBid) {
            return BidView.images(`./pass.png`);
        } else if (bid instanceof DoubleBid) {
            return BidView.images(`./x.png`);
        } else if (bid instanceof RedoubleBid) {
            return BidView.images(`./xx.png`);
        }
        throw new Error("Unknown bid type");
    }

    static getClass(bid: Bid): string {
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
        this.root.css("transition", "ease 1s")
        this.root.css(value.asCoords());
    }

}