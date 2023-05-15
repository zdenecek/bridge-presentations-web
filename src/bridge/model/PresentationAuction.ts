import { Position } from "./Position";
import { UndoableAuction } from "./UndoableAuction";


export class PresentationAuction extends UndoableAuction {

    protected playerCount: number;

    constructor(dealer: Position, playerCount = 4) {
        super(dealer);
        this.playerCount = playerCount;
    }

    protected get auctionFinished(): boolean {
        return this._standingPassCount >= this.playerCount - 1 && this.bids.length >= this.playerCount
    }
}