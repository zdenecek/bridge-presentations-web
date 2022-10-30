import { Bid } from "./Bid";
import { Card } from "./Card";
import { Player } from "./Player";


export class PresentationPlayer extends Player {
    public bid(bid: Bid): void {
        super.bid(bid);
    }

    public playCard(card: Card): void {
        super.playCard(card);
    }
}
