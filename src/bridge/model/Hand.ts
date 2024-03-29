import { Card } from "./Card";
import { Position } from "./Position";
import { ISimpleEvent, SimpleEventDispatcher } from "ste-simple-events";
import { Suit } from "./Suit";
import { sortCardsInHand } from "../utils/CardSorter";

export interface HandEvent {
  hand: Hand;
}

export interface HandCardEvent {
  hand: Hand;
  card: Card;
}

export interface CardInHand {
  card: Card;
  played: boolean;
}

export class Hand {
  _cards: Array<CardInHand> = [];
  position?: Position;

  public get cards(): Array<Card> {
    return this._cards.filter((c) => !c.played).map((c) => c.card);
  }

  public get allCards(): Array<Card> {
    return this._cards.map((c) => c.card);
  }

  public get cardsWithPlayInfo(): Array<CardInHand> {
    return new Array<CardInHand>(...this._cards);
  }

  protected _cardAdded = new SimpleEventDispatcher<HandCardEvent>();
  protected _cardRemoved = new SimpleEventDispatcher<HandCardEvent>();

  public get cardAdded(): ISimpleEvent<HandCardEvent> {
    return this._cardAdded.asEvent();
  }

  public get cardRemoved(): ISimpleEvent<HandCardEvent> {
    return this._cardRemoved.asEvent();
  }

  constructor(cards: Array<Card> = [], position?: Position) {
    this._cards = cards.map((card) => ({ card, played: false }));
    this.position = position;
    this.sortCards();
  }

  public cardsWithSuit(suit: Suit): Array<Card> {
    return this.cards.filter((c) => c.suit === suit);
  }

  private sortCards(): void {
    sortCardsInHand(this._cards);
  }

  public addCard(card: Card): void {
    this._cards.push({ card, played: false });
    this.sortCards();
    this._cardAdded.dispatch({ hand: this, card: card });
  }

  public removeCard(card: Card): boolean {
    const c = this._cards.find((a) => a.card === card);
    if (!c) return false;
    c.played = true;
    this._cardRemoved.dispatch({ hand: this, card: card });
    return true;
  }

  toString(): string {
    return `(${this._cards.map((card) => card.toString()).join(" ")})`;
  }
}
