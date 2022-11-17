enum Suit {
    Clubs = 1,
    Diamonds = 2,
    Hearts = 3,
    Spades = 4,
    Notrump = 5,
}

class SuitHelper {
    static toString(suit: Suit): string {
        return Suit[suit];
    }

    static toSymbol(suit: Suit): string {
        switch (suit) {
            case Suit.Clubs:
                return "♣";
            case Suit.Diamonds:
                return "♦";
            case Suit.Hearts:
                return "♥";
            case Suit.Spades:
                return "♠";
            case Suit.Notrump:
                return "NT";
        }
    }

    static toLetter(suit: Suit): string {
        switch (suit) {
            case Suit.Clubs:
                return "C";
            case Suit.Diamonds:
                return "D";
            case Suit.Hearts:
                return "H";
            case Suit.Spades:
                return "S";
            case Suit.Notrump:
                return "N";
        }
    }

    static fromLetter(letter: string): Suit | undefined {
        switch (letter.toUpperCase()[0]) {
            case "C":
                return Suit.Clubs;
            case "D":
                return Suit.Diamonds;
            case "H":
                return Suit.Hearts;
            case "S":
                return Suit.Spades;
            case "N":
                return Suit.Notrump;
        }
    }

    static all(): Array<Suit> {
        return [Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades, Suit.Notrump];
    }
}

export { Suit, SuitHelper };
