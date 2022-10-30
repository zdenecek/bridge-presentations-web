import { Card } from "./Card";
import { Position, PartialPositionList, PositionHelper  } from "./Position";
import { Suit } from "./Suit";

export interface CardInTrick {
    card: Card;
    player: Position;
    trick: Trick;
}

export class Trick {
    firstToPlay: Position;
    currentToPlay?: Position;
    _winner: CardInTrick | undefined;
    cardsByPosition: PartialPositionList<CardInTrick> = {};
    cards: Array<CardInTrick> = [];

    constructor(firstToPlay: Position) {
        this.firstToPlay = firstToPlay;
        this.currentToPlay = firstToPlay;
    }

    addCard(card: Card): void {
        if (this.currentToPlay === undefined) throw Error("Cannot add a card to finished trick");

        const c =  {card, player: this.currentToPlay, trick: this};

        this.cardsByPosition[this.currentToPlay] = c;
        this.cards.push(c);

        this.currentToPlay = this.isFinished ? undefined : PositionHelper.nextPosition(this.currentToPlay);
    }

    getCards(): PartialPositionList<CardInTrick> {
        return this.cardsByPosition;
    }

    // TODO Move to undoableTrick ?
 

    get isFinished(): boolean {
        return this.cards.length == 4;
    }

    winner(trumps: Suit): CardInTrick | undefined {
        if (!this.isFinished) return undefined;
        if (this._winner) return this._winner;

        // const winningCard = this.cards.reduce((current, next) => {
        //     if (current.suit == next.suit) {
        //         return current.value >= next.value ? current : next;
        //     } else {
        //         return next.suit == trumps ? next : current;
        //     }
        // });

        this._winner = Object.values(this.cardsByPosition).reduce((current, next) => 
        {
            if(!current) return next;
            if(!next) return current;
            if (current.card.suit == next.card.suit) {
                return current.card.value >= next.card.value ? current : next;
            } else {
                return next.card.suit == trumps ? next : current;
            }
        });

        return this._winner;
    }

    suit(suit: Suit): Array<CardInTrick> {
        return this.cards.filter((c) => c.card.suit == suit);
    }

    toString(): string {
        return `(${this.firstToPlay} leads; ${this.cards.map((c) => c.card.toString()).join(", ")})`;
    }
}
