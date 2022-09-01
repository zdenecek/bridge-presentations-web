import { Card, Value } from "../model/Card";
import { Suit } from "../model/Suit";

export class Parser {
    static parseHandString(input: string): Array<Card> {
        const chars = input.trim().replace(/ +/g, " ").replace("10", "T").split("");
        const cards = new Array<Card>();
        let suit = Suit.Spades;

        for (let i = 0; i < chars.length; i++) {
            if (chars[i] === " ") {
                if (suit === Suit.Clubs) break;
                suit--;
            } else {
                cards.push(new Card(suit, Parser.parseCardValue(chars[i])));
            }
        }

        return cards;
    }

    static parseCardValue(input: string): Value {
        switch (input.toUpperCase()) {
            case "2":
                return Value.Two;
            case "3":
                return Value.Three;
            case "4":
                return Value.Four;
            case "5":
                return Value.Five;
            case "6":
                return Value.Six;
            case "7":
                return Value.Seven;
            case "8":
                return Value.Eight;
            case "9":
                return Value.Nine;
            case "T":
            case "10":
                return Value.Ten;
            case "J":
                return Value.Jack;
            case "Q":
                return Value.Queen;
            case "K":
                return Value.King;
            case "A":
                return Value.Ace;
            default:
                return Value.Other;
        }
    }
}
