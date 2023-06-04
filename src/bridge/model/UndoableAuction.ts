import { Auction, PositionedBid } from "./Auction";
import { Bid } from "./Bid";
import { Position } from "./Position";
import { ISimpleEvent, SimpleEventDispatcher } from "ste-simple-events";

export interface BidEvent {
  position: Position;
  bid: Bid;
}

export class UndoableAuction extends Auction {
  private _bidRemoved = new SimpleEventDispatcher<BidEvent>();

  public get bidRemoved(): ISimpleEvent<BidEvent> {
    return this._bidRemoved.asEvent();
  }

  public undo(): PositionedBid | undefined {
    const lastBid = this.bids.pop();
    if (!lastBid) return;
    this._isFinished = false;

    this.resetStanding();
    this.bids.forEach((bid) => this.updateStanding(bid));

    this._bidRemoved.dispatch(lastBid);

    return lastBid;
  }

  protected resetStanding(): void {
    this._standingBid = undefined;
    this._standingBidPosition = undefined;
    this._standingContractState = undefined;
    this._standingPassCount = 0;
  }
}
