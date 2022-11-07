import { Card } from "./Card";
import { Player } from "./Player";
import { Position, PositionHelper, PositionList } from "./Position";
import { Suit } from "./Suit";
import { Trick } from "./Trick";
import { Bid } from "./Bid";
import { Auction } from "./Auction";
import { Contract } from "./Contract";
import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { runLater } from "../utils/runLater";
import { Vulnerability } from "./Vulnerability";

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
    trumps: Suit = Suit.Notrump;
    auction: Auction | undefined;
    finalContract: Contract | undefined;
    state: GameState;
    bidding: boolean;
    vulnerability: Vulnerability;
    currentlyRequestedPlayer: Player | undefined;

    constructor(players: PositionList<Player>, bidding = true, vulnerability = Vulnerability.None) {
        this.players = players;
        this.state = "notStarted";
        this.bidding = bidding;
        this.vulnerability = vulnerability;
    }

    get currentTrick(): Trick | undefined {
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

    public player(position: Position): Player {
        return this.players[position];
    }

    public get allPlayers(): Player[] {
        return Object.values(this.players);
    }

    public start(firstToPlay: Position, trumps?: Suit): void {
        runLater(() => this._gameStarted.dispatch({ game: this }));
        if (this.bidding) runLater(() => this.startBidding(firstToPlay));
        else {
            this.trumps = trumps || Suit.Notrump;
            runLater(() => this.startPlay(firstToPlay));
        }
    }

    protected end(): void {
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
            runLater(() => this.startPlay(PositionHelper.nextPosition(contract.declarer)));
        }
    }

    protected startNewTrick(firstToPlay: Position): void {
        const trick = new Trick(firstToPlay);
        const player = this.players[firstToPlay];
        this.tricks.push(trick);

        runLater(() => this._trickStarted.dispatch({ game: this, trick }));
        runLater(() => {
            this.currentlyRequestedPlayer = player;
            player.requestPlay(this, trick, (player: Player, card: Card) => this.addCard(trick, card, player));
        });
    }

    protected endTrick(): void {
        const trick = this.currentTrick;
        if (!trick) throw Error("No trick to end");
        const winner = trick.winner(this.trumps)?.player;
        if (!winner) throw Error(`Cannot end unfinished trick: ${trick}`);

        runLater(() => this._trickEnded.dispatch({ game: this, trick }));

        if (this.players[Position.North].hand.cards.length > 0) {
            runLater((() => this.startNewTrick(winner)).bind(this));
        } else {
            runLater(() => this.endPlay());
        }
    }

    protected addCard(trick: Trick, card: Card, player: Player): boolean {
        // TODO check follow suit
        // check correct playeer, correct trick, correct card

        trick.addCard(card);
        runLater(() => this._cardPlayed.dispatch({ card, trick, player, game: this }));
        if (this.tricks.length === 1 && trick.cards.length === 1)
            runLater(() => this._leadMade.dispatch({ card, trick, player, game: this }));

        if (trick.isFinished) runLater(() => this.endTrick());
        else {
            const nextPlayer = this.players[PositionHelper.nextPosition(player.position)];
            runLater(() => {
                this.currentlyRequestedPlayer = nextPlayer;
                nextPlayer.requestPlay(this, trick, (player: Player, card: Card) =>
                    this.addCard(trick, card, nextPlayer)
                );
            });
        }
        return true;
    }

    protected addBid(bid: Bid, player: Player): boolean {
        if (!this.auction) throw Error("No auction");
        // todo check correct player, correct bid

        const success = this.auction.addBid(bid, player.position);
        if (!success) return false;

        runLater(() => this._bidMade.dispatch({ bid, player, game: this }));
        if (this.auction.isFinished) runLater(() => this.endBidding());
        else {
            const nextPlayer = this.players[PositionHelper.nextPosition(player.position)];
            this.currentlyRequestedPlayer = nextPlayer;
            runLater(() => nextPlayer.requestBid(this, (player: Player, bid: Bid) => this.addBid(bid, nextPlayer)));
        }

        return true;
    }
}
