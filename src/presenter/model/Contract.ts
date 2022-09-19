import { Position } from "./Position";
import { Suit, SuitHelper } from "./Suit";


export type ContractDoubledState = 'undoubled' | 'doubled' | 'redoubled';
export type ContractLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Contract = NonPassedContract | 'passed';

export class NonPassedContract {

    suit: Suit;
    level: ContractLevel;
    dbl: ContractDoubledState;
    declarer: Position;

    constructor(suit: Suit, level: ContractLevel, declarer: Position, dbl: ContractDoubledState = 'undoubled') {
        this.suit = suit;
        this.level = level;
        this.declarer = declarer;
        this.dbl = dbl;
    }

    toString(): string {
        const doubled = this.dbl === 'doubled' ? 'x' : this.dbl === 'redoubled' ? 'xx' : '';
        return `${this.level}${SuitHelper.toSymbol(this.suit)}${doubled} ${this.declarer}`;
    }

}
