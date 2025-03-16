import { Bid, ContractBid, DoubleBid, PassBid, RedoubleBid } from "../../bridge/model/Bid";
import { SuitHelper } from "../../bridge/model/Suit";
import { Point } from "../classes/Point";
import View from "./View";

export class BidView extends View {
  static _images = import.meta.glob(
    ['@/presenter/assets/bidding-c/*.png'], { eager: true })

  // TODO: prettify
  static images(path: string): string {
    return (BidView._images["/src/presenter/assets/bidding-c/" + path + ".png"] as any).default as string;
  }

  bid: Bid;

  constructor(bid: Bid) {
    super(`<div class='bid ${BidView.getClass(bid)}'>
        <img src='${BidView.getImagePath(bid)}' alt='${bid}'/>
        </div>`);
    this.bid = bid;
  }

  static getImagePath(bid: Bid): string {
    if (bid instanceof ContractBid) {
      return BidView.images(`${bid.level}${SuitHelper.toLetter(bid.suit)}`);
    } else if (bid instanceof PassBid) {
      return BidView.images(`pass`);
    } else if (bid instanceof DoubleBid) {
      return BidView.images(`x`);
    } else if (bid instanceof RedoubleBid) {
      return BidView.images(`xx`);
    }
    throw new Error("Unknown bid type");
  }

  static getClass(bid: Bid): string {
    if (bid instanceof ContractBid) {
      return SuitHelper.toString(bid.suit).toLowerCase();
    } else if (bid instanceof PassBid) {
      return "pass";
    } else if (bid instanceof DoubleBid) {
      return "double";
    } else if (bid instanceof RedoubleBid) {
      return "redouble";
    }
    return "unknown";
  }

  public set position(value: Point) {
    this.root.style.transition = "ease 1s";
    this.root.style.top = `${value.asCoords().top}`;
    this.root.style.left = `${value.asCoords().left}`;
  }
}
