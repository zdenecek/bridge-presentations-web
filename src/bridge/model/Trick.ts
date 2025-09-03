import { Card } from "./Card";
import { Position, PartialPositionList, PositionHelper } from "./Position";
import { Suit } from "./Suit";

export interface CardInTrick {
  card: Card;
  player: Position;
  trick: Trick;
}

export class Trick {
  public currentToPlay?: Position;
  public cards: Array<CardInTrick> = [];
  public firstToPlay: Position;
  public trumps: Suit;

  constructor(
    firstToPlay: Position = Position.North,
    trumps: Suit = Suit.Notrump,
  ) {
    this.firstToPlay = firstToPlay;
    this.trumps = trumps;
    this.currentToPlay = firstToPlay;
  }

  protected nextToPlay(): Position | undefined {
    if (this.currentToPlay === undefined)
      throw Error("Error, cannot play card in finished trick");
    return this.isFinished
      ? undefined
      : PositionHelper.nextPosition(this.currentToPlay);
  }

  addCard(card: Card): void {
    if (this.currentToPlay === undefined)
      throw Error("Cannot add a card to finished trick");

    const c = { card, player: this.currentToPlay, trick: this };

    // Use array methods that create new arrays for better reactivity
    this.cards = [...this.cards, c];

    this.currentToPlay = this.nextToPlay();
  }

  getCards(): PartialPositionList<CardInTrick> {
    // Create a position map from the cards array
    const result: PartialPositionList<CardInTrick> = {};
    this.cards.forEach((card) => {
      result[card.player] = card;
    });
    return result;
  }

  // Use a computed property for reactive data
  get isFinished(): boolean {
    return this.cards.length == 4;
  }

  get winner(): CardInTrick | undefined {
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

  suit(suit: Suit): Array<CardInTrick> {
    return this.cards.filter((c) => c.card.suit == suit);
  }

  toString(): string {
    return `(${this.firstToPlay} leads; ${this.cards.map((c) => c.card.toString()).join(", ")})`;
  }

  // Helper method specifically for Vue templates
  getCardByPosition(position: Position): CardInTrick | undefined {
    return this.cards.find((card) => card.player === position);
  }
}
