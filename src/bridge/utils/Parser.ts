import { Card, CardValue } from "../model/Card";
import { Suit } from "../model/Suit";

export class Parser {
    static parseHandString(input: string): Array<Card> {
        const chars = input.trim().replace(/ +/g, " ").replace(/10/g, "T").split("");
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

    static parseCardValue(input: string): CardValue {
        switch (input.toUpperCase()) {
            case "2":
                return CardValue.Two;
            case "3":
                return CardValue.Three;
            case "4":
                return CardValue.Four;
            case "5":
                return CardValue.Five;
            case "6":
                return CardValue.Six;
            case "7":
                return CardValue.Seven;
            case "8":
                return CardValue.Eight;
            case "9":
                return CardValue.Nine;
            case "T":
            case "10":
                return CardValue.Ten;
            case "J":
                return CardValue.Jack;
            case "Q":
                return CardValue.Queen;
            case "K":
                return CardValue.King;
            case "A":
                return CardValue.Ace;
            default:
                return CardValue.Other;
        }
    }
}
