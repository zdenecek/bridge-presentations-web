import { Card } from "./Card";
import { Position, PositionHelper } from "./Position";
import { Suit } from "./Suit";

export interface CardInTrick {
  card: Card;
  player: Position;
  trick: Trick;
}

export class Trick {
  public cards: Array<CardInTrick> = [];
  public firstToPlay: Position;
  public trumps: Suit;

  constructor(
    firstToPlay: Position = Position.North,
    trumps: Suit = Suit.Notrump,
  ) {
    this.firstToPlay = firstToPlay;
    this.trumps = trumps;
  }

  public get currentToPlay(): Position | undefined {
    if (this.cards.length === 0) return this.firstToPlay;
    if (this.isFinished) return undefined;
    return PositionHelper.nextPosition(this.cards[this.cards.length - 1].player);
  }

  public get isFinished(): boolean {
    return this.cards.length == 4;
  }

  public get winner(): CardInTrick | undefined {
    if (!this.isFinished) return undefined;

    // Calculate winner on-the-fly without memoization
    return this.cards.reduce((current, next) => {
      if (!current) return next;
      if (current.card.suit == next.card.suit) {
        return current.card.value >= next.card.value ? current : next;
      } else {
        return next.card.suit == this.trumps ? next : current;
      }
    });
  }

  /**
   * The suit of the trick, if it has at least one card.
   */
  public get suit(): Suit | undefined {
    if (this.cards.length === 0) return undefined;
    return this.cards[0].card.suit;
  }

  public addCard(card: Card): void {
    if (this.isFinished)
      throw Error("Cannot add a card to finished trick");

    const c = { card, player: this.currentToPlay!, trick: this };

    // Use array methods that create new arrays for better reactivity
    this.cards = [...this.cards, c];
  }

  toString(): string {
    return `(${this.firstToPlay} leads; ${this.cards.map((c) => c.card.toString()).join(", ")})`;
  }
}
