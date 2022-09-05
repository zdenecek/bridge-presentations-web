import { Value } from "./presenter/model/Card";
import { Suits } from "./presenter/model/Suit";

const cardChars: any = {};

const suitIncrement = 0x10;
const valueIncrement = 0x1;
const base = 0x1f0a0;

for (const suit of Suits.all()) {
    let b = base + suitIncrement * (suit - 1);
    cardChars[suit] = {};
    for (const value of [
        Value.Ace,
        Value.Two,
        Value.Three,
        Value.Four,
        Value.Five,
        Value.Six,
        Value.Seven,
        Value.Eight,
        Value.Nine,
        Value.Ten,
        Value.Jack,
        Value.Queen,
        Value.King,
    ]) {
        b += valueIncrement;
        cardChars[suit][value] = String.fromCodePoint(b);
    }
}

export { cardChars };
