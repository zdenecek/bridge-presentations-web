import { Suit, Suits } from "./Suit";

enum Value {
    Other = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Ten = 10,
    Jack = 11,
    Queen = 12,
    King = 13,
    Ace = 14,
}

class Values {
    static toString(value: Value): string {
        return Value[value];
    }
}

class Card {
    public suit: Suit;
    public value: Value;

    constructor(suit: Suit = Suit.Notrump, value: Value = Value.Two) {
        this.suit = suit;
        this.value = value;
    }

    public toString(): string {
        return `${Values.toString(this.value)} of ${Suits.toString(this.suit)}`;
    }
}

export { Value, Values, Card };
