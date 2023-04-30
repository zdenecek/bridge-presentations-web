import { runLater } from "../utils/runLater";
import { Bid } from "./Bid";
import { Contract } from "./Contract";
import { Player } from "./Player";
import { Position, PositionHelper, PositionList, Side } from "./Position";
import { Suit } from "./Suit";
import { UndoableGame } from "./UndoableGame";
import { Vulnerability } from "./Vulnerability";

export class PresentationGameOptions {
    bidding: boolean;
    fakeNSTricks: number;
    fakeEWTricks: number;
    contract?: Contract;
    trumps?: Suit;

    static Default = new PresentationGameOptions(true, 0, 0, undefined);

    constructor(
        bidding: boolean,
        fakeNSTricks = 0,
        fakeEWTricks = 0,
        contract?: Contract,
        trumps?: Suit
    ) {
        this.bidding = bidding;
        this.fakeEWTricks = fakeEWTricks;
        this.fakeNSTricks = fakeNSTricks;
        if (!bidding) {
            if (contract)  {
                this.contract = contract;
                this.trumps = contract == "passed" ? undefined : contract.suit;
            }
            else if(trumps) this.trumps = trumps;
        }
    }
}

export class PresentationGame extends UndoableGame {
    private options: PresentationGameOptions;

    public get bidding(): boolean {
        return this.options.bidding;
    }

    constructor(players: PositionList<Player>, options: PresentationGameOptions, vulnerability = Vulnerability.None) {
        super(players, vulnerability);
        this.options = options;

        if (options.contract) this.finalContract = options.contract;
        else if (options.trumps) this.trumps = options.trumps;
    }

    public start(firstToPlay: Position, trumps?: Suit | undefined): void {

        runLater(() => this._gameStarted.dispatch({ game: this }));

        

        if (this.bidding) runLater(() => this.startBidding(firstToPlay));
        else {
            if(this.finalContract) {
                if(this.finalContract == "passed") {
                    runLater(() => this.end());
                    return;
                }
                firstToPlay = PositionHelper.nextPosition(this.finalContract.declarer);
            } else if(trumps) {
                this.trumps = trumps;
            }
            runLater(() => this.startPlay(firstToPlay));
        }
    }

    public trickCount(side: Side): number {
        return super.trickCount(side) + ((side === Side.NS) ? this.options.fakeNSTricks : this.options.fakeEWTricks);
    }

    protected undoCardplay(): void {
        if (!this.bidding && this.tricks.length === 1 && this.tricks[0].cards.length === 0) return;
        else super.undoCardplay();
    }

    public tryAddBid(bid: Bid, player: Player): boolean {
       return this.addBid(bid, player);
    }
}
