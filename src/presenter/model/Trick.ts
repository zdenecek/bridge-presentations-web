import { Card } from "./Card";
import { Position, PartialPositionList, Positions } from "./Position";
import { Suit } from "./Suit";

export default class Trick {
    firstToPlay: Position;
    currentToPlay?: Position;
    cards: Array<Card> = [];
    _winner: Position | undefined;
    private cardsByPosition: PartialPositionList<Card> = {};

    constructor(firstToPlay: Position) {
        this.firstToPlay = firstToPlay;
        this.currentToPlay = firstToPlay;
    }

    addCard(card: Card): void {
        if (this.currentToPlay === undefined) throw Error("Cannot add a card to finished trick");
        this.cards.push(card);
        this.cardsByPosition[this.currentToPlay] = card;

        this.currentToPlay = this.isFinished ? undefined : Positions.nextPosition(this.currentToPlay);
    }

    getCards(): PartialPositionList<Card> {
        return this.cardsByPosition;
    }

    get isFinished(): boolean {
        return this.cards.length == 4;
    }

    winner(trumps: Suit): Position | undefined {
        if (!this.isFinished) return undefined;
        if (this._winner) return this._winner;

        // const winningCard = this.cards.reduce((current, next) => {
        //     if (current.suit == next.suit) {
        //         return current.value >= next.value ? current : next;
        //     } else {
        //         return next.suit == trumps ? next : current;
        //     }
        // });

        const [pos, card] = Object.entries(this.cardsByPosition).reduce(([currentPos, current], [nextPos, next]) => 
        {
            if(!current) return [nextPos, next];
            if(!next) return [currentPos, current];
            if (current.suit == next.suit) {
                return current.value >= next.value ? [currentPos, current] : [nextPos, next];
            } else {
                return next.suit == trumps ? [nextPos, next] : [currentPos, current];
            }
        });

        this._winner = pos as Position;
        return this._winner;
    }

    suit(suit: Suit): Array<Card> {
        return this.cards.filter((c) => c.suit == suit);
    }

    toString(): string {
        return `(${this.firstToPlay} leads; ${this.cards.map((c) => c.toString()).join(", ")})`;
    }
}
