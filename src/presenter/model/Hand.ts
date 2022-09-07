import { ISimpleEvent, SimpleEventDispatcher } from "ste-simple-events";
import { Card } from "./Card";
import { Position } from "./Position";

export interface HandEvent {
    hand: Hand;
}

export default class Hand {
    cards: Array<Card> = [];
    position?: Position;

    protected _cardAdded = new SimpleEventDispatcher<HandEvent>();
    protected _cardRemoved = new SimpleEventDispatcher<HandEvent>();

    public get cardAdded(): ISimpleEvent<HandEvent> {
        return this._cardAdded.asEvent();
    }

    public get cardRemoved(): ISimpleEvent<HandEvent> {
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
        this._cardAdded.dispatch({ hand: this });
    }

    public removeCard(card: Card): boolean {
        const index = this.cards.indexOf(card);
        if (index === -1) return false;
        this.cards.splice(index, 1);
        this._cardRemoved.dispatch({ hand: this });
        return true;
    }

    toString(): string {
        return `(${this.cards.map((card) => card.toString()).join(" ")})`;
    }
}
