import { CardValue } from "@/presenter/model/Card";
import { SuitHelper } from "@/presenter/model/Suit";

const cardChars: any = {};

const suitIncrement = 0x10;
const valueIncrement = 0x1;
const base = 0x1f0a0;

for (const suit of SuitHelper.all()) {
    let b = base + suitIncrement * (suit - 1);
    cardChars[suit] = {};
    for (const value of [
        CardValue.Ace,
        CardValue.Two,
        CardValue.Three,
        CardValue.Four,
        CardValue.Five,
        CardValue.Six,
        CardValue.Seven,
        CardValue.Eight,
        CardValue.Nine,
        CardValue.Ten,
        CardValue.Jack,
        CardValue.Queen,
        CardValue.King,
    ]) {
        b += valueIncrement;
        cardChars[suit][value] = String.fromCodePoint(b);
    }
}

export { cardChars };
