import { Card } from "./Card";
import { Position } from "./Position";
import { ISimpleEvent, SimpleEventDispatcher } from "ste-simple-events";

export interface HandEvent {
    hand: Hand;
}

export interface HandCardEvent {
    hand: Hand;
    card: Card;
}

export class Hand {
    cards: Array<Card> = [];
    position?: Position;

    protected _cardAdded = new SimpleEventDispatcher<HandCardEvent>();
    protected _cardRemoved = new SimpleEventDispatcher<HandCardEvent>();

    public get cardAdded(): ISimpleEvent<HandCardEvent> {
        return this._cardAdded.asEvent();
    }

    public get cardRemoved(): ISimpleEvent<HandCardEvent> {
        return this._cardRemoved.asEvent();
    }

    constructor(cards: Array<Card> = [], position?: Position) {
        this.cards = cards;
        this.position = position;
        this.sortCards();
    }

    private sortCards(): void {
        this.cards.sort((a, b) => (a.suit - b.suit !== 0 ? a.suit - b.suit : b.value - a.value));
    }

    public addCard(card: Card): void {
        this.cards.push(card);
        this.sortCards();
        this._cardAdded.dispatch({ hand: this , card: card });
    }

    public removeCard(card: Card): boolean {
        const index = this.cards.indexOf(card);
        if (index === -1) return false;
        this.cards.splice(index, 1);
        this._cardRemoved.dispatch({ hand: this, card: card });
        return true;
    }

    toString(): string {
        return `(${this.cards.map((card) => card.toString()).join(" ")})`;
    }
}
