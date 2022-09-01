import { runLater } from "../utils/runLater";
import { Bid, PassBid } from "./Bid";
import { Card } from "./Card";
import Game from "./Game";
import Hand from "./Hand";
import { Position, Positions } from "./Position";
import Trick from "./Trick";

export interface Player {
    position: Position;
    hand: Hand;

    requestPlay(game: Game, toTrick: Trick, addCard: (player: Player, card: Card) => boolean): void;
    cancelRequestToPlay(): void;

    requestBid(game: Game, addBid: (player: Player, bid: Bid) => boolean): void;
    cancelRequestToBid(): void;
}

export class PresentationPlayer implements Player {
    position: Position;
    private _hand!: Hand;
    callback: ((player: Player, card: Card) => boolean) | undefined;
    currentTrick?: Trick;

    constructor(position: Position) {
        this.position = position;
    }
    
    set hand(hand: Hand) {
        this._hand = hand;
        this._hand.position = this.position;
    }

    get hand(): Hand {
        return this._hand;
    }

    cancelRequestToBid(): void {
        return;
    }

    cancelRequestToPlay(): void {
        this.callback = undefined;
    }

    requestBid(game: Game, addBid: (player: Player, bid: Bid) => boolean): void {
        runLater(() => addBid(this, new PassBid()));
    }

    requestPlay(game: Game, toTrick: Trick, addCard: (player: Player, card: Card) => boolean): void {
        console.debug("Card has been requested from player sitting " + Positions.toString(this.position));

        this.currentTrick = toTrick;
        this.callback = addCard;

        let playables = this.hand.cards;
        if (toTrick.cards.length > 0) playables = playables.filter((c) => c.suit == toTrick.cards[0]?.suit);
        if (playables.length == 0) playables = this.hand.cards;

        console.debug(`Cards ${this.hand.cards.length}, playable ${playables.length}`);

        playables.forEach((c) => (c.playable = true));
    }

    playCard(card: Card): void {
        if (!card.playable) return;

        const successfullyPlayed = this.callback?.(this, card);
        if (!successfullyPlayed) return;

        console.debug(Positions.toString(this.position) + " plays " + card.toString());

        this.callback = undefined;

        this.hand.cards.forEach((c) => (c.playable = false));
        this.hand.cards.splice(this.hand.cards.indexOf(card), 1);
    }
}
