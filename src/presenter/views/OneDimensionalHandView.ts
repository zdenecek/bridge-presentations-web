import { sortCards, sortCardsByPrioritizedSuit, sortSuits } from "@/bridge/utils/CardSorter";
import { Card } from "../../bridge/model/Card";
import { Hand } from "../../bridge/model/Hand";
import { Position } from "../../bridge/model/Position";
import { Suit } from "../../bridge/model/Suit";
import { Rotation, RotationHelper } from "../classes/Rotation";
import { Vector } from "../classes/Vector";
import CardView from "./CardView";
import HandView from "./HandView";

export default class OneDimensionalHandView extends HandView {
  private primaryDimension(): "x" | "y" {
    return RotationHelper.isHorizontal(this.rotation) ? "x" : "y";
  }
  private make1DVector(size: number, perpendicular = false): Vector {
    return RotationHelper.isHorizontal(this.rotation) === perpendicular ? new Vector(0, size) : new Vector(size, 0);
  }

  private maximumCardOffset: () => number;
  private dummySuitOffset: () => number;
  private dummyCardOffset: () => number;
  private rotation: Rotation;

  constructor(
    cardViews: Map<Card, CardView>,
    position: Position,
    rotation = Rotation.Top,
    maximumCardOffset?: () => number,
    dummySuitOffset?: () => number,
    dummyCardOffset?: () => number
  ) {
    super(cardViews, position);

    this.rotation = rotation;
    this.maximumCardOffset = maximumCardOffset ?? (() => CardView.width / 4);
    this.dummySuitOffset = dummySuitOffset ?? (() => CardView.width * 0.05);
    this.dummyCardOffset = dummyCardOffset ?? (() => CardView.width / 4.5);
  }

  public set hand(hand: Hand) {
    hand.cards.forEach((card) => {
      const view = this._cardViews.get(card);
      if (!view) return;
      view.rotation = this.rotation;
    });

    hand.cardAdded.sub((e) => {
      const view = this._cardViews.get(e.card);
      if (!view) return;
      view.rotation = this.rotation;
    });

    this._hand = hand;
  }

  private get primaryDimensionSize() {
    return RotationHelper.isHorizontal(this.rotation) ? this.width : this.height;
  }

  getCardOffsetVector(): Vector {
    const remainingSpace = this.primaryDimensionSize - CardView.width;
    let cardOffset = 0;
    if (this._hand && this._hand.cards.length > 1) {
      cardOffset = Math.min(remainingSpace / this._hand.cards.length, this.maximumCardOffset());
    }
    return this.make1DVector(cardOffset);
  }

  private getCardsBySuit(): Record<Suit, Array<Card>> {
    if (!this._hand) return {} as Record<Suit, Card[]>;
    return this._hand.cards.reduce((groups, card) => {
      (groups[card.suit] ||= []).push(card);
      return groups;
    }, {} as Record<Suit, Card[]>);
  }

  private getHandSuits(): Array<Suit> {
    if (!this._hand) return new Array<Suit>();
    const suits = Object.keys(this.getCardsBySuit()).map((suit) => parseInt(suit)) as Suit[];
    return sortSuits(suits, this.prioritizedSuit);
  }

  updateNonDummy(): void {
    if (!this._hand) return;
    const offsetVector = this.getCardOffsetVector();
    const primarySize = CardView.width + offsetVector[this.primaryDimension()] * (this._hand.cards.length - 1);

    const center = this.start.moveBy(this.make1DVector(this.primaryDimensionSize / 2));
    let currentPosition = center.moveBy(this.make1DVector(-primarySize / 2));

    const cards = [...this._hand.cards];


    const reverseZIndex = this.rotation === Rotation.Left;

    if (this.prioritizedSuit) sortCardsByPrioritizedSuit(cards, this.prioritizedSuit);
    else {
      sortCards(cards);
      // patch for Milan: West is sorted other way around
      if (this.position === Position.West) cards.reverse();
    }

    cards.forEach((card, index) => {
      const view = this._cardViews.get(card);
      if (!view) return;
      view.reverse = this.reverse;
      view.position = currentPosition;
      view.root.style.zIndex = reverseZIndex ? `${cards.length - index}` : `${index}`;
      currentPosition = currentPosition.moveBy(offsetVector);
    });
  }

  updateDummy(): void {
    if (!this._hand) return;

    const suits = this.getHandSuits();
    const suitCount = suits.length;
    const primarySize = (CardView.width + this.dummySuitOffset()) * suitCount - this.dummySuitOffset();

    const center = this.start.moveBy(this.make1DVector(this.primaryDimensionSize / 2));
    let currentPosition = center.moveBy(this.make1DVector(-primarySize / 2));

    const suitOffset = this.make1DVector(this.dummySuitOffset() + CardView.width);
    let c = this.dummyCardOffset();
    if (this.rotation == Rotation.Right || this.rotation == Rotation.Upside) c *= -1;

    const cardOffset = this.make1DVector(c, true);

    const cardsBySuit = this.getCardsBySuit();

    for (const [suitIndex, suit] of suits.entries()) {
      let currentSuitPos = currentPosition.copy();
      let index = 0;
      for (const card of cardsBySuit[suit]) {
        const view = this._cardViews.get(card);
        if (!view) return;
        view.position = currentSuitPos;
        view.reverse = false;

        view.root.style.zIndex = `${index + suitIndex * 10}`;
        currentSuitPos = currentSuitPos.moveBy(cardOffset);
        index++;
      }
      currentPosition = currentPosition.moveBy(suitOffset);
    }
  }
}
