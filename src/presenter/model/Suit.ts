enum Suit {
    Clubs = 1,
    Diamonds = 2,
    Hearts = 3,
    Spades = 4,
    Notrump = 5,
}

class Suits {
    static toString(suit: Suit): string {
        return Suit[suit];
    }
}

export {Suit, Suits};
