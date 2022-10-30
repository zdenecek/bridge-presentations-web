import { Bid, ContractBid, DoubleBid, PassBid, RedoubleBid } from "./Bid";
import { Contract, ContractDoubledState, NonPassedContract } from "./Contract";
import { Position, PositionHelper } from "./Position";

export class PositionedBid {
    position: Position;
    bid: Bid;

    constructor(position: Position, bid: Bid) {
        this.position = position;
        this.bid = bid;
    }
}

export class Auction {
    protected _bids = new Array<PositionedBid>();
    protected _dealer: Position;
    protected _isFinished = false;
    protected _finalContract: Contract | undefined;

    public get bids(): Array<PositionedBid> {
        return this._bids;
    }
    public get dealer(): Position {
        return this._dealer;
    }
    public get isFinished(): boolean {
        return this._isFinished;
    }
    public get finalContract(): Contract | undefined {
        return this._finalContract;
    }

    protected _standingBid: ContractBid | undefined;
    protected _standingBidPosition: Position | undefined;
    protected _standingContractState: ContractDoubledState | undefined;
    protected _standingPassCount = 0;

    public get standingBid(): ContractBid | undefined {
        return this._standingBid;
    }
    public get standingBidPosition(): Position | undefined {
        return this._standingBidPosition;
    }
    public get standingContractState(): ContractDoubledState | undefined {
        return this._standingContractState;
    }
    public get standingPassCount(): number {
        return this._standingPassCount;
    }

    constructor(dealer: Position) {
        this._dealer = dealer;
    }

    addBid(bid: Bid, position: Position): boolean {
        if (!this.isLegal(bid, position)) return false;

        const positionedBid = new PositionedBid(position, bid);
        this.bids.push(positionedBid);
        this.updateStanding(positionedBid);
        if (this._standingPassCount >= 3 && this.bids.length >= 4) this.finalize();
        
        return true;
    }

    protected updateStanding( {bid, position}: PositionedBid): void {
        if (bid instanceof PassBid) {
            this._standingPassCount++;
            return;
        }
        this._standingPassCount = 0;
        if (bid instanceof DoubleBid) {
            this._standingContractState = "doubled";
        }
        if (bid instanceof RedoubleBid) {
            this._standingContractState = "redoubled";
        }
        if (bid instanceof ContractBid) {
            this._standingBid = bid;
            this._standingBidPosition = position;
            this._standingContractState = "undoubled";
        }
    }

    public isLegal(bid: Bid, position: Position): boolean {
        if (this.isFinished) return false;

        if (bid instanceof PassBid) {
            return true;
        } else if (bid instanceof DoubleBid) {
            return (
                this._standingContractState === "undoubled" &&
                PositionHelper.side(position) !== PositionHelper.side(this.standingBidPosition!)
            );
        } else if (bid instanceof RedoubleBid) {
            return this._standingContractState === "doubled"  &&
            PositionHelper.side(position) === PositionHelper.side(this.standingBidPosition!)
        } else if (bid instanceof ContractBid) {
            return this._standingBid === undefined || bid.isGreaterThan(this._standingBid);
        }

        return false;
    }

    protected finalize(): void {
        if (this._standingPassCount === 4) this._finalContract = "passed";
        else {
            const lastBid = this._standingBid!;
            const side = PositionHelper.side(this._standingBidPosition!);
            const declarer = this.bids.filter(
                (b) =>
                    b.bid instanceof ContractBid && b.bid.suit === lastBid.suit && PositionHelper.side(b.position) === side
            )[0].position;
            this._finalContract = new NonPassedContract(
                lastBid.suit,
                lastBid.level,
                declarer,
                this._standingContractState!
            );
        }

        this._isFinished = true;
    }
}
