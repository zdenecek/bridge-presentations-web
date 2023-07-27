import { Bid } from "./Bid";
import { Card } from "./Card";
import { Player } from "./Player";

export class PresentationPlayer extends Player {
  public bid(bid: Bid): boolean {
    return super.bid(bid);
  }

  public playCard(card: Card): boolean {
    return super.playCard(card);
  }

  public toString(): string {
    return `Presentation player sitting ${this.position}`;
  }
}
