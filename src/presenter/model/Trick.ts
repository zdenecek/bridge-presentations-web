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

        let winningCard = this.cards[0];
        this._winner = this.firstToPlay;
        for (const pos of Positions.all()) {
            const card = this.cardsByPosition[pos];
            if (!card) continue;
            if (card.value > winningCard.value && (card.suit == winningCard.suit || card.suit == trumps)) {
                winningCard = card;
                this._winner = pos;
            }
        }
        return this._winner;
    }

    suit(suit: Suit): Array<Card> {
        return this.cards.filter((c) => c.suit == suit);
    }
}
