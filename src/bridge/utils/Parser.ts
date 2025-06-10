import { Card, CardValue } from "../model/Card";
import { Suit } from "../model/Suit";

export class Parser {
  static parseHandString(input: string): Array<Card> {
    const cards = new Array<Card>();
    let suit = Suit.Spades;
    const strs = input.trim().replace(/ +/g, " ").replace(/10/g, "T").split(" ");

    for (const str of strs) {
      if (str !== "-") {
        for (const char of str) {
          cards.push(new Card(suit, Parser.parseCardValue(char)));
        }
      }
      if (suit === Suit.Clubs) break;
      suit--;
    }

    return cards;
  }

  static parseHandStringStrict(input: string): [Array<Card>, Array<string>] {
    const cards = new Array<Card>();
    let suit = Suit.Spades;
    const strs = input.trim().replace(/ +/g, " ").replace(/10/g, "T").split(" ");

    const errors = new Array<string>();
    if (strs.length != 4) errors.push(`Malformed string: ${strs.length} suits`);

    for (const str of strs) {
      if (str !== "-") {
        for (const char of str) {
          try {
            cards.push(new Card(suit, Parser.parseCardValue(char, true)));
          } catch (e) {
            errors.push((e as Error).message);
          }
        }
      }
      if (suit === Suit.Clubs) break;
      suit--;
    }

    return [cards, errors];
  }

  static parseCardValue(input: string, strict = false): CardValue {
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
      case "H":
       return CardValue.Honor; 
      case "X":
        return CardValue.X;
      default:
        if (strict) throw new Error(`Unknown character: ${input}`);
        return CardValue.Other;
    }
  }
}
