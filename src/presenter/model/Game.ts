import { runLater } from "../utils/runLater";
import { Card } from "./Card";
import { Player } from "./Player";
import { Position, Positions, PositionList } from "./Position";
import { Suit } from "./Suit";
import Trick from "./Trick";
import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { Bid } from "./Bid";
import { Auction } from "./Auction";
import { Contract } from "./Contract";

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

export default class Game {
    players: PositionList<Player>;
    tricks: Array<Trick> = [];
    currentTrick: Trick | undefined;
    trumps: Suit = Suit.Notrump;
    auction: Auction | undefined;
    finalContract: Contract | undefined;

    constructor(players: PositionList<Player>) {
        this.players = players;
    }

    private _cardPlayed = new SimpleEventDispatcher<CardPlayedEvent>();
    private _trickEnded = new SimpleEventDispatcher<TrickEvent>();
    private _trickStarted = new SimpleEventDispatcher<TrickEvent>();
    private _biddingStarted = new SimpleEventDispatcher<GameEvent>();
    private _biddingEnded = new SimpleEventDispatcher<GameEvent>();
    private _bidMade = new SimpleEventDispatcher<BidMadeEvent>();
    private _cardplayStarted = new SimpleEventDispatcher<GameEvent>();
    private _cardplayEnded = new SimpleEventDispatcher<GameEvent>();
    private _gameStarted = new SimpleEventDispatcher<GameEvent>();
    private _gameEnded = new SimpleEventDispatcher<GameEvent>();

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

    public player(position: Position): Player {
        return this.players[position];
    }

    public get allPlayers(): Player[] {
        return Object.values(this.players);
    }

    public start(firstToPlay: Position, bidding = true): void {
        runLater(() => this._gameStarted.dispatch({ game: this }));
        if (bidding) runLater(() => this.startBidding(firstToPlay));
        else runLater(() => this.startPlay(firstToPlay));
    }

    private end(): void {
        runLater(() => this._gameEnded.dispatch({ game: this }));
    }

    private startPlay(firstToPlay: Position): void {
        runLater(() => this._cardplayStarted.dispatch({ game: this }));
        runLater(() => this.startNewTrick(firstToPlay));
    }

    private endPlay() {
        runLater(() => this._cardplayEnded.dispatch({ game: this }));
        runLater(() => this.end());
    }

    private startBidding(dealer: Position): void {
        this.auction = new Auction(dealer);
        const player = this.players[dealer];

        runLater(() => this._biddingStarted.dispatch({ game: this }));
        runLater(() => player.requestBid(this, (player: Player, bid: Bid) => this.addBid(bid, player)));
    }

    private endBidding(): void {
        if (!this.auction) throw Error("No auction");
        if (!this.auction.isFinished) throw Error("Bidding not finished");
        this.finalContract = this.auction.finalContract!;

        runLater(() => this._biddingEnded.dispatch({ game: this }));

        if (this.finalContract === "passed") runLater(() => this.end());
        else {
            const contract = this.finalContract;
            runLater(() => this.startPlay(Positions.nextPosition(contract.declarer)));
        }
    }

    private startNewTrick(firstToPlay: Position): void {
        const trick = new Trick(firstToPlay);
        const player = this.players[firstToPlay];
        this.currentTrick = trick;
        this.tricks.push(trick);

        runLater(() => this._trickStarted.dispatch({ game: this, trick }));
        runLater(() =>
            player.requestPlay(this, trick, (player: Player, card: Card) => this.addCard(trick, card, player))
        );
    }

    private endTrick(): void {
        const trick = this.currentTrick;
        if (!trick) throw Error("No trick to end");
        const winner = trick.winner(this.trumps);
        if (!winner) throw Error(`Cannot end unfinished trick: ${trick}`);

        this.currentTrick = undefined;

        runLater(() => this._trickEnded.dispatch({ game: this, trick }));

        if (this.players[Position.North].hand.cards.length > 0) {
            runLater((() => this.startNewTrick(winner)).bind(this));
        } else {
            runLater(() => this.end());
        }
    }

    private addCard(trick: Trick, card: Card, player: Player): boolean {
        // TODO check follow suit
        // check correct playeer, correct trick, correct card

        trick.addCard(card);
        runLater(() => this._cardPlayed.dispatch({ card, trick, player, game: this }));

        if (trick.isFinished) runLater(() => this.endTrick());
        else {
            const nextPlayer = this.players[Positions.nextPosition(player.position)];
            runLater(() =>
                nextPlayer.requestPlay(this, trick, (player: Player, card: Card) =>
                    this.addCard(trick, card, nextPlayer)
                )
            );
        }
        return true;
    }

    private addBid(bid: Bid, player: Player): boolean {
        if (!this.auction) throw Error("No auction");
        // todo check correct player, correct bid

        const success = this.auction.addBid(bid, player.position);
        if (!success) return false;

        runLater(() => this._bidMade.dispatch({ bid, player, game: this }));
        if (this.auction.isFinished) runLater(() => this.endBidding());
        else {
            const nextPlayer = this.players[Positions.nextPosition(player.position)];
            runLater(() => nextPlayer.requestBid(this, (player: Player, bid: Bid) => this.addBid(bid, nextPlayer)));
        }

        return true;
    }
}
