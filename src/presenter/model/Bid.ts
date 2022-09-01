import { ContractLevel } from "./Contract";
import { Suit } from "./Suit";


export abstract class Bid {

    alerted = false;

}

export class ContractBid extends Bid {

    suit: Suit;
    level: ContractLevel;

    constructor(suit: Suit, level: ContractLevel) {
        super();
        this.suit = suit;
        this.level = level;
    }
}

export class DoubleBid extends Bid {

}

export class RedoubleBid extends Bid {

}

export class PassBid extends Bid {

}