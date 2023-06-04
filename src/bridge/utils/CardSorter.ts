import { Card } from "../model/Card";
import { CardInHand } from "../model/Hand";
import { Suit } from "../model/Suit";
import errorMessage from "./throw";

const defaultOrder = [Suit.Spades, Suit.Hearts, Suit.Clubs, Suit.Diamonds];

export function sortCardsInHand(cards: Array<CardInHand>): void {
  sortCardsInHandBySuitOrder(cards, defaultOrder);
}

export function sortCards(cards: Array<Card>): void {
  sortCardsBySuitOrder(cards, defaultOrder);
}

export function sortCardsInHandBySuitOrder(cards: Array<CardInHand>, order: Array<Suit>): void {
  _sortCards(cards, order, (card: CardInHand) => card.card);
}

export function sortCardsBySuitOrder(cards: Array<Card>, order: Array<Suit>): void {
  _sortCards(cards, order, (card: Card) => card);
}

export function sortCardsInHandByPrioritizedSuit(cards: Array<CardInHand>, suit: Suit): void {
    _sortCards(cards, sortSuits(defaultOrder, suit), (card: CardInHand) => card.card);
  }
  
  export function sortCardsByPrioritizedSuit(cards: Array<Card>, suit: Suit): void {
    _sortCards(cards, sortSuits(defaultOrder, suit), (card: Card) => card);
  }

function _sortCards<T>(cards: Array<T>, order: Array<Suit>, selector: (arg: T) => Card): void {
  cards.sort((a, b) =>
    selector(a).suit - selector(b).suit !== 0
      ? order.indexOf(selector(a).suit) - order.indexOf(selector(b).suit)
      : selector(b).value - selector(a).value
  );
}

export function sortSuits(suits: Array<Suit>, prioritizedSuit: Suit | undefined = undefined): Array<Suit> {
  const new_order = Object.assign([], defaultOrder);

  if (prioritizedSuit) {
    while (new_order[0] != prioritizedSuit) new_order.unshift(new_order.pop() ?? errorMessage("Error in sortSuits"));
  }

  new_order.reverse();

  return suits.sort((a, b) => new_order.indexOf(b) - new_order.indexOf(a));
}
