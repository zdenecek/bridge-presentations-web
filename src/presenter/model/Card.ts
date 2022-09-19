import { Suit, SuitHelper } from "./Suit";

enum CardValue {
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

class CardValueHelper {
    static toString(value: CardValue): string {
        return CardValue[value];
    }
}

class Card {
    public suit: Suit;
    public value: CardValue;

    constructor(suit: Suit = Suit.Notrump, value: CardValue = CardValue.Two) {
        this.suit = suit;
        this.value = value;
    }

    public toString(): string {
        return `${CardValueHelper.toString(this.value)} of ${SuitHelper.toString(this.suit)}`;
    }
}

export { CardValue, CardValueHelper, Card };
