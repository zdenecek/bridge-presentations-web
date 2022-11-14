import { ISimpleEvent, SimpleEventDispatcher } from "ste-simple-events";
import { runLater } from "../utils/runLater";
import { Bid } from "./Bid";
import { Card } from "./Card";
import { Game } from "./Game";
import { Hand } from "./Hand";
import { Position } from "./Position";
import { Trick } from "./Trick";

export interface PlayRequestedEvent {
    player: Player;
    game: Game;
    trick: Trick;
}

export interface BidRequestedEvent {
    player: Player;
    game: Game;
}

export interface PlayerEvent {
    player: Player;
    game: Game;
}

export interface CardEvent {
    player: Player;
    game: Game;
    card: Card;
}

export interface BidEvent {
    player: Player;
    game: Game;
    bid: Bid;
}

export class Player {
    position: Position;
    private _hand!: Hand;
    private game!: Game;
    private playCallback: ((player: Player, card: Card) => boolean) | undefined;
    private bidCallback: ((player: Player, bid: Bid) => boolean) | undefined;

    private _playRequested = new SimpleEventDispatcher<PlayRequestedEvent>();
    private _playRequestCancelled = new SimpleEventDispatcher<PlayerEvent>();
    private _bidRequested = new SimpleEventDispatcher<BidRequestedEvent>();
    private _bidRequestCancelled = new SimpleEventDispatcher<PlayerEvent>();
    private _bidMade = new SimpleEventDispatcher<BidEvent>();
    private _cardPlayer = new SimpleEventDispatcher<CardEvent>();

    constructor(position: Position) {
        this.position = position;
    }

    get bidMade(): ISimpleEvent<BidEvent> {
        return this._bidMade.asEvent();
    }
    get cardPlayed(): ISimpleEvent<CardEvent> {
        return this._cardPlayer.asEvent();
    }

    get playRequested(): ISimpleEvent<PlayRequestedEvent> {
        return this._playRequested.asEvent();
    }
    get playRequestCancelled(): ISimpleEvent<PlayerEvent> {
        return this._playRequestCancelled.asEvent();
    }
    get bidRequested(): ISimpleEvent<BidRequestedEvent> {
        return this._bidRequested.asEvent();
    }
    get bidRequestCancelled(): ISimpleEvent<PlayerEvent> {
        return this._bidRequestCancelled.asEvent();
    }

    set hand(hand: Hand) {
        this._hand = hand;
        this._hand.position = this.position;
    }

    get hand(): Hand {
        return this._hand;
    }

    cancelRequestToBid(): void {
        this.bidCallback = undefined;
        runLater(() => this._bidRequestCancelled.dispatch({ player: this, game: this.game }));
    }

    cancelRequestToPlay(): void {
        this.playCallback = undefined;
        runLater(() => this._playRequestCancelled.dispatch({ player: this, game: this.game }));
    }

    requestBid(game: Game, addBid: (player: Player, bid: Bid) => boolean): void {
        this.game = game;
        this.bidCallback = addBid;
        runLater(() => this._bidRequested.dispatch({ player: this, game: game }));
    }

    requestPlay(game: Game, toTrick: Trick, addCard: (player: Player, card: Card) => boolean): void {
        this.game = game;
        this.playCallback = addCard;

        runLater(() => this._playRequested.dispatch({ player: this, game: game, trick: toTrick }));
    }

    protected playCard(card: Card): boolean {
        const successfullyPlayed = this.playCallback?.(this, card);
        if (!successfullyPlayed) return false;

        this.playCallback = undefined;
        this.hand.removeCard(card);

        
        runLater(() => this._cardPlayer.dispatch({ player: this, game: this.game, card: card }));
        return true;
    }

    protected bid(bid: Bid): boolean {
        const successfullyPlayed = this.bidCallback?.(this, bid);
        if (!successfullyPlayed) return false;

        this.bidCallback = undefined;

        runLater(() => this._bidMade.dispatch({ player: this, game: this.game, bid: bid }));
        return true;
    }
}
