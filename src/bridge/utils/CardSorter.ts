import { CardInHand } from "../model/Hand";
import { Suit } from "../model/Suit";
import errorMessage from "./throw";

const defaultOrder = [
    Suit.Spades,
    Suit.Hearts,
    Suit.Clubs,
    Suit.Diamonds,
]

export function sortCards(cards: Array<CardInHand>): void {

    cards.sort((a,b) => (a.card.suit - b.card.suit !== 0 ? defaultOrder.indexOf(a.card.suit) - defaultOrder.indexOf(b.card.suit) : b.card.value - a.card.value));
}

export function sortSuits(suits: Array<Suit>, prioritizedSuit: Suit | undefined = undefined): Array<Suit> {
    const new_order = Object.assign([], defaultOrder);

    if(prioritizedSuit) {
        
        while(new_order[0] != prioritizedSuit) new_order.unshift( new_order.pop() ?? errorMessage("Error in sortSuits"));
    }

    return suits.sort((a,b) => {
        console.log(new_order.indexOf(a), new_order.indexOf(b));
       return new_order.indexOf(b) - new_order.indexOf(a);
    });
}