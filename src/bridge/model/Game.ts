import { Card } from "./Card";
import { Player } from "./Player";
import { Position, PositionHelper, PositionList, Side } from "./Position";
import { Suit } from "./Suit";
import { Trick } from "./Trick";
import { Bid } from "./Bid";
import { Auction } from "./Auction";
import { Contract } from "./Contract";
import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { runLater } from "../utils/runLater";
import { Vulnerability } from "./Vulnerability";
import { Result } from "./Result";

type GameState = "notStarted" | "bidding" | "cardplay" | "finished";

export interface CardPlayedEvent {
  card: Card;
  game: Game;
  trick: Trick;
  player: Player;
}

export interface TrickEvent {
  game: Game;
  trick: Trick;
}

export interface GameEvent {
  game: Game;
}

export interface BidMadeEvent {
  game: Game;
  bid: Bid;
  player: Player;
}

export class Game {
  players: PositionList<Player>;
  tricks: Array<Trick> = [];
  trumps: Suit | undefined;
  auction: Auction | undefined;
  _finalContract: Contract | undefined;
  protected _result: Result | undefined;
  _state: GameState;
  vulnerability: Vulnerability;
  currentlyRequestedPlayer: Player | undefined;
  protected claimedTricks = { ns: 0, ew: 0 };
  claimed = false;

  public get finalContract(): Contract | undefined {
    return this._finalContract;
  }
  public set finalContract(value: Contract | undefined) {
    if (value && value !== "passed") this.trumps = value.suit;
    this._finalContract = value;
  }

  constructor(players: PositionList<Player>, vulnerability = Vulnerability.None) {
    this.players = players;
    this._state = "notStarted";
    this.vulnerability = vulnerability;
  }

  get currentTrick(): Trick | undefined {
    if (this.state !== "cardplay") return undefined;
    return this.tricks[this.tricks.length - 1];
  }

  protected _cardPlayed = new SimpleEventDispatcher<CardPlayedEvent>();
  protected _trickEnded = new SimpleEventDispatcher<TrickEvent>();
  protected _trickStarted = new SimpleEventDispatcher<TrickEvent>();
  protected _biddingStarted = new SimpleEventDispatcher<GameEvent>();
  protected _biddingEnded = new SimpleEventDispatcher<GameEvent>();
  protected _bidMade = new SimpleEventDispatcher<BidMadeEvent>();
  protected _cardplayStarted = new SimpleEventDispatcher<GameEvent>();
  protected _cardplayEnded = new SimpleEventDispatcher<GameEvent>();
  protected _gameStarted = new SimpleEventDispatcher<GameEvent>();
  protected _gameEnded = new SimpleEventDispatcher<GameEvent>();
  protected _leadMade = new SimpleEventDispatcher<CardPlayedEvent>();
  protected _trickCountChanged = new SimpleEventDispatcher<GameEvent>();
  protected _stateChanged = new SimpleEventDispatcher<GameEvent>();
  protected _claimMade = new SimpleEventDispatcher<GameEvent>();

  // Events

  public get cardPlayed(): ISimpleEvent<CardPlayedEvent> {
    return this._cardPlayed.asEvent();
  }
  public get trickEnded(): ISimpleEvent<TrickEvent> {
    return this._trickEnded.asEvent();
  }
  public get trickStarted(): ISimpleEvent<TrickEvent> {
    return this._trickStarted.asEvent();
  }
  public get biddingStarted(): ISimpleEvent<GameEvent> {
    return this._biddingStarted.asEvent();
  }
  public get biddingEnded(): ISimpleEvent<GameEvent> {
    return this._biddingEnded.asEvent();
  }
  public get bidMade(): ISimpleEvent<BidMadeEvent> {
    return this._bidMade.asEvent();
  }
  public get cardplayStarted(): ISimpleEvent<GameEvent> {
    return this._cardplayStarted.asEvent();
  }
  public get cardplayEnded(): ISimpleEvent<GameEvent> {
    return this._cardplayEnded.asEvent();
  }
  public get gameStarted(): ISimpleEvent<GameEvent> {
    return this._gameStarted.asEvent();
  }
  public get gameEnded(): ISimpleEvent<GameEvent> {
    return this._gameEnded.asEvent();
  }
  public get leadMade(): ISimpleEvent<CardPlayedEvent> {
    return this._leadMade.asEvent();
  }
  public get trickCountChanged(): ISimpleEvent<GameEvent> {
    return this._trickCountChanged.asEvent();
  }
  public get stateChanged(): ISimpleEvent<GameEvent> {
    return this._stateChanged.asEvent();
  }
  public get claimMade(): ISimpleEvent<GameEvent> {
    return this._claimMade.asEvent();
  }

  public get state(): GameState {
    return this._state;
  }

  public set state(value: GameState) {
    this._state = value;
    this._stateChanged.dispatch({ game: this });
  }

  public get result(): Result | undefined {
    if (this.state !== "finished") return undefined;
    return this._result;
  }

  public player(position: Position): Player {
    return this.players[position];
  }

  public get allPlayers(): Player[] {
    return Object.values(this.players);
  }

  public trickCount(side: Side): number {
    return this.tricks.filter((t) => t.winner && PositionHelper.side(t.winner.player) === side).length + this.claimedTricks[side];
  }

  public start(firstToPlay: Position): void {
    runLater(() => this._gameStarted.dispatch({ game: this }));
    runLater(() => this.startBidding(firstToPlay));
  }

  public claim(tricksNS: number): void {
    if (this.state !== "cardplay") return;

    this.claimedTricks.ns = tricksNS;
    this.claimedTricks.ew = 13 - this.tricks.filter((t) => t.isFinished).length - tricksNS;

    this.claimed = true;

    this.currentlyRequestedPlayer?.cancelRequestToPlay();

    runLater(() => this._claimMade.dispatch({ game: this }));
    runLater(() => this._trickCountChanged.dispatch({ game: this }));
    runLater(() => this.endPlay());
  }

  protected end(): void {
    if (this.finalContract)
      this._result = Result.make(
        this.finalContract,
        this.vulnerability,
        this.finalContract === "passed" ? undefined : this.trickCount(PositionHelper.side(this.finalContract.declarer))
      );
    this.state = "finished";
    runLater(() => this._gameEnded.dispatch({ game: this }));
  }

  protected startPlay(firstToPlay: Position): void {
    this.state = "cardplay";
    runLater(() => this._cardplayStarted.dispatch({ game: this }));
    runLater(() => this.startNewTrick(firstToPlay));
  }

  protected endPlay(): void {
    runLater(() => this._cardplayEnded.dispatch({ game: this }));
    runLater(() => this.end());
  }

  protected makeAuction(dealer: Position): Auction {
    return new Auction(dealer);
  }

  protected startBidding(dealer: Position): void {
    this.auction = this.makeAuction(dealer);
    this.state = "bidding";
    const player = this.players[dealer];

    runLater(() => this._biddingStarted.dispatch({ game: this }));
    runLater(() => {
      this.currentlyRequestedPlayer = player;
      player.requestBid(this, (player: Player, bid: Bid) => this.addBid(bid, player));
    });
  }

  protected endBidding(): void {
    if (!this.auction) throw Error("No auction");
    if (!this.auction.isFinished || !this.auction.finalContract) throw Error("Bidding not finished");
    this.finalContract = this.auction.finalContract;

    runLater(() => this._biddingEnded.dispatch({ game: this }));

    if (this.finalContract === "passed") runLater(() => this.end());
    else {
      const contract = this.finalContract;
      this.trumps = this.finalContract.suit;
      if (this.cardplayShouldEnd()) runLater(() => this.endPlay());
      else runLater(() => this.startPlay(this.nextToPlay(contract.declarer)));
    }
  }

  protected makeTrick(firstToPlay: Position): Trick {
    if (!this.trumps) throw Error("No trumps are set");
    return new Trick(firstToPlay, this.trumps);
  }

  protected startNewTrick(firstToPlay: Position): void {
    const trick = this.makeTrick(firstToPlay);
    const player = this.players[firstToPlay];
    this.tricks.push(trick);

    runLater(() => this._trickStarted.dispatch({ game: this, trick }));
    runLater(() => {
      this.currentlyRequestedPlayer = player;
      player.requestPlay(this, trick, (player: Player, card: Card) => this.addCard(trick, card, player));
    });
  }

  protected cardplayShouldEnd(): boolean {
    return Math.min(...this.allPlayers.map((p) => p.hand.cards.length)) > 0;
  }

  protected endTrick(): void {
    const trick = this.currentTrick;
    if (!trick) throw Error("No trick to end");
    const winner = trick.winner?.player;
    if (!winner) throw Error(`Cannot end unfinished trick: ${trick}`);

    runLater(() => this._trickEnded.dispatch({ game: this, trick }));
    runLater(() => this._trickCountChanged.dispatch({ game: this }));

    if (this.cardplayShouldEnd()) {
      runLater(() => this.endPlay());
    } else {
      runLater((() => this.startNewTrick(winner)).bind(this));
    }
  }

  protected nextToPlay(position: Position): Position {
    return PositionHelper.nextPosition(position);
  }

  protected addCard(trick: Trick, card: Card, player: Player): boolean {
    // check correct playeer, correct trick, correct card
    if (this.state !== "cardplay") return false;
    if (trick.cards.length > 0) {
      const suit = trick.cards[0].card.suit;
      if (suit !== card.suit && player.hand.cardsWithSuit(suit).length > 0) return false;
    }

    trick.addCard(card);
    runLater(() => this._cardPlayed.dispatch({ card, trick, player, game: this }));
    if (this.tricks.length === 1 && trick.cards.length === 1) runLater(() => this._leadMade.dispatch({ card, trick, player, game: this }));

    if (trick.isFinished) runLater(() => this.endTrick());
    else {
      const nextPlayer = this.players[this.nextToPlay(player.position)];
      runLater(() => {
        this.currentlyRequestedPlayer = nextPlayer;
        nextPlayer.requestPlay(this, trick, (_: Player, card: Card) => this.addCard(trick, card, nextPlayer));
      });
    }
    return true;
  }

  protected addBid(bid: Bid, player: Player): boolean {
    if (!this.auction) throw Error("No auction");
    // todo check correct player, correct bid

    if (this.state !== "bidding") return false;

    const success = this.auction.addBid(bid, player.position);
    if (!success) return false;

    runLater(() => this._bidMade.dispatch({ bid, player, game: this }));
    if (this.auction.isFinished) runLater(() => this.endBidding());
    else {
      const nextPlayer = this.players[this.nextToPlay(player.position)];
      this.currentlyRequestedPlayer = nextPlayer;
      runLater(() => nextPlayer.requestBid(this, (_: Player, bid: Bid) => this.addBid(bid, nextPlayer)));
    }

    return true;
  }
}
