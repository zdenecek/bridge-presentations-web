import { Card, Value } from "./Card";
import Hand from "./Hand";
import { Position, Positions } from "./Position";
import {Suit} from "./Suit";
import Trick from "./Trick";

export interface Player {
    
    position: Position;
    hand: Hand;

    requestPlay(toTrick: Trick, addCard: (card: Card) => boolean): void;
    cancelRequestToPlay(): void;
}

export class PresentationPlayer implements Player{

    position: Position;
    hand: Hand;
    callback: ((card: Card) => boolean) | undefined;
    currentTrick?: Trick;

    constructor(position: Position, hand: Hand) {
        this.position = position;
        this.hand = hand;
    }
    cancelRequestToPlay(): void {
        this.callback = undefined;
    }

    requestPlay(toTrick: Trick, addCard: (card: Card) => boolean): void {

        console.debug("Card has been requested from player sitting " + Positions.toString(this.position))
        
        this.currentTrick = toTrick;
        this.callback = addCard;

        let playables = this.hand.cards;
        if(toTrick.cards.length > 0) playables = playables.filter(c => c.suit == toTrick.cards[0]?.suit);
        if(playables.length == 0) playables = this.hand.cards;

        console.debug(`Cards ${this.hand.cards.length}, playable ${playables.length}`)

        playables.forEach(c => c.playable = true);

    }

    playCard(card: Card): void {
        
        if(!card.playable) return;

        const successfullyPlayed = this.callback?.(card);
        if(!successfullyPlayed) return;
        
        console.debug(Positions.toString(this.position) + " plays " + card.toString() )

        this.callback = undefined;
        
        this.hand.cards.forEach(c => c.playable = false);
        this.hand.cards.splice(this.hand.cards.indexOf(card), 1)
    }
}