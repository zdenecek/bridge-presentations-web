import { Card, CardValue } from "@/bridge/model/Card";
import { Parser } from "@/bridge/utils/Parser";
import { Position } from "@/bridge/model/Position";

export class CardsInputValidator {
  static validate(cardsObject: Map<Position, string>): Map<Position, Array<string>> {
    const errors = new Map<Position, Array<string>>();

    const counts = new Map<number, number>();
    const playerCards = new Map<Position, Card[]>();
    cardsObject.forEach((cardstr, pos) => {
      const [c, e] = Parser.parseHandStringStrict(cardstr);
      playerCards.set(pos, c);
      counts.set(c.length, (counts.get(c.length) ?? 0) + 1);

      if (e.length > 0) errors.set(pos, e);
    });

    const [correct] = [...counts.entries()].reduce(([a, b], [c, d]) => (d > b ? [c, d] : [a, b]));
    const unique = new Set<string>();

    playerCards.forEach((cards, pos) => {
      const ar = errors.get(pos) ?? [];
      if (cards.length != correct) {
        ar.push(`Irregular card count: ${cards.length} instead of ${correct}`);
      }
      cards.forEach((card) => {
        if (card.value === CardValue.Other || card.value === CardValue.Honor || card.value === CardValue.X) return;
        if (unique.has(card.toString())) ar.push(`Duplicate card: ${card}`);
        unique.add(card.toString());
      });

      errors.set(pos, ar);
    });

    return errors;
  }
}
