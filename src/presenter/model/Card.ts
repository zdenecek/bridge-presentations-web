import {Suit, Suits} from "./Suit";
import { SimpleEventDispatcher } from "strongly-typed-events"

enum Value {
    "Two" = 2,
    "Three" = 3,
    "Four" = 4,
    "Five" = 5,
    "Six" = 6,
    "Seven" = 7,
    "Eight" = 8,
    "Nine" = 9,
    "Ten" = 10,
    "Jack" = 11,
    "Queen" = 12,
    "King" = 13,
    "Ace" = 14,
    "Other" = 15,
}

class Values {
    static toString(value: Value): string {
        return Value[value];
    }
}

class Card {
    public suit: Suit;
    public value: Value;
    public _playable = false;

    private _playableChanged = new SimpleEventDispatcher<Card>();

    constructor(suit: Suit = Suit.Clubs, value: Value = Value.Two ) {
        this.suit = suit;
        this.value = value;
    }

    public get playableChanged() {
        return this._playableChanged.asEvent();
    }

    public set playable(value: boolean) {
        if(value === this.playable) return;
        console.debug(`setting playable on ${this.toString()} to ${value}` );
        this._playable = value;
        this._playableChanged.dispatch(this);
    }

    public get playable() {
        return this._playable;
    }
 
    public toString(): string {
        return `${Values.toString(this.value)} of ${Suits.toString(this.suit)}`;
    }
}

export { Value, Values, Card };