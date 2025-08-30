import { DummyOptions } from "@/presenter/views/GameView";
import { Auction } from "./Auction";
import { Bid } from "./Bid";
import { Contract } from "./Contract";
import { Player } from "./Player";
import { Position, PositionHelper, PositionList, Side } from "./Position";
import { PresentationAuction } from "./PresentationAuction";
import { PresentationTrick } from "./PresentationTrick";
import { Suit } from "./Suit";
import { Trick } from "./Trick";
import { UndoableGame } from "./UndoableGame";
import { Vulnerability } from "./Vulnerability";

export class PresentationGameOptions {
  bidding: boolean;
  fakeNSTricks: number;
  fakeEWTricks: number;
  contract?: Contract;
  trumps?: Suit;
  dummy: DummyOptions;
  staticDummyPosition?: Position;
  activePositions: Array<Position>;

  static Default = new PresentationGameOptions(true, 0, 0, undefined);

  constructor(
    bidding: boolean,
    fakeNSTricks = 0,
    fakeEWTricks = 0,
    contract?: Contract,
    trumps?: Suit,
    dummy: DummyOptions = "auto",
    staticDummyPosition?: Position,
    activePositions: Array<Position> = PositionHelper.all(),
  ) {
    this.bidding = bidding;
    this.fakeEWTricks = fakeEWTricks;
    this.fakeNSTricks = fakeNSTricks;
    this.activePositions = activePositions;
    this.dummy = dummy;
    this.staticDummyPosition = staticDummyPosition;
    if (!bidding) {
      if (contract) {
        this.contract = contract;
        this.trumps = contract == "passed" ? undefined : contract.suit;
      } else if (trumps) this.trumps = trumps;
    }
  }
}

export class PresentationGame extends UndoableGame {
  public readonly options: PresentationGameOptions;

  public get bidding(): boolean {
    return this.options.bidding;
  }

  constructor(
    players: PositionList<Player>,
    options: PresentationGameOptions,
    vulnerability = Vulnerability.None,
  ) {
    super(players, vulnerability);
    this.options = options;

    if (options.contract) this.finalContract = options.contract;
    else if (options.trumps) this.trumps = options.trumps;
  }

  public start(firstToPlay: Position, trumps?: Suit | undefined): void {
    setTimeout(() => this._gameStarted.dispatch({ game: this }));

    if (this.bidding) setTimeout(() => this.startBidding(firstToPlay));
    else {
      if (this.finalContract) {
        if (this.finalContract == "passed") {
          setTimeout(() => this.end());
          return;
        }
        firstToPlay = PositionHelper.nextPosition(this.finalContract.declarer);
      } else if (trumps) {
        this.trumps = trumps;
      }
      setTimeout(() => this.startPlay(firstToPlay));
    }
  }

  public trickCount(side: Side): number {
    return (
      super.trickCount(side) +
      (side === Side.NS ? this.options.fakeNSTricks : this.options.fakeEWTricks)
    );
  }

  protected undoCardplay(): void {
    if (
      !this.bidding &&
      this.tricks.length === 1 &&
      this.tricks[0].cards.length === 0
    )
      return;
    else super.undoCardplay();
  }

  public tryAddBid(bid: Bid, player: Player): boolean {
    return this.addBid(bid, player);
  }

  protected nextToPlay(position: Position): Position {
    return PositionHelper.nextPosisitionFrom(
      this.options.activePositions,
      position,
    );
  }

  protected makeAuction(dealer: Position): Auction {
    return new PresentationAuction(dealer, this.options.activePositions.length);
  }

  protected makeTrick(firstToPlay: Position): Trick {
    if (!this.trumps) throw new Error("Trumps not set");
    return new PresentationTrick(
      firstToPlay,
      this.trumps,
      this.options.activePositions,
    );
  }

  protected cardplayShouldEnd(): boolean {
    return (
      Math.min(
        ...this.options.activePositions.map(
          (p) => this.player(p).hand.cards.length,
        ),
      ) === 0
    );
  }
}
