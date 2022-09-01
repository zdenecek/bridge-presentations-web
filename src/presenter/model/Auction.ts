import { Bid } from "./Bid";
import { Contract, NonPassedContract } from "./Contract";
import { Position } from "./Position";
import { Suit } from "./Suit";

export class Auction {
    bids = new Array<Bid>();
    dealer: Position;
    isFinished = false;

    constructor(dealer: Position) {
        this.dealer = dealer;
    }

    get finalContract(): Contract | undefined {
        if (!this.isFinished) return undefined;
        return new NonPassedContract(Suit.Notrump, 3, Position.North);
    }

}
