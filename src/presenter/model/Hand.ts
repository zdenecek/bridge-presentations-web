import { Card } from "./Card";
import { Position } from "./Position";

export default class Hand {

    cards: Array<Card> = [];
    public position: Position;

    constructor(cards: Array<Card> = [], position: Position) {
        this.cards = cards.sort((a, b) => (a.suit - b.suit) !== 0 ? a.suit - b.suit : b.value - a.value);
        this.position = position;
    }
}