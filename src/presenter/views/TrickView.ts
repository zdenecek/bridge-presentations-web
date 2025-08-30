import CardView from "./CardView";
import { Trick } from "../../bridge/model/Trick";
import { Card } from "../../bridge/model/Card";
import { Position, PositionHelper } from "../../bridge/model/Position";
import { Point } from "../classes/Point";
import View from "./View";

export interface TrickViewMetadata {
  start: Point;
  width: number;
  height: number;
}

export default class TrickView extends View {
  private cardViews: Map<Card, CardView>;
  private currentlyDisplayedTrick?: Trick;
  private originPoints = new Map<Position, View>();

  constructor(cardViews: Map<Card, CardView>) {
    super('<div class="trick-view"></trick>');
    this.cardViews = cardViews;
    PositionHelper.all().forEach((position) => {
      const v = new View(
        `<div class="trick-view-origin trick-view-origin-${position}">`,
      );
      this.addSubView(v);
      const target = new View("<div>");
      v.addSubView(target);
      this.originPoints.set(position, target);
    });
  }

  public attachTrick(t: Trick): void {
    if (t === this.currentlyDisplayedTrick) {
      this.update();
      return;
    }
    if (this.currentlyDisplayedTrick) this.detachTrick();
    this.currentlyDisplayedTrick = t;
  }

  public detachTrick(): void {
    if (this.currentlyDisplayedTrick)
      this.currentlyDisplayedTrick.cards.forEach((c) => {
        const v = this.cardViews.get(c.card);
        if (v) v.hidden = true;
      });
    this.currentlyDisplayedTrick = undefined;
  }

  public update(): void {
    if (this.currentlyDisplayedTrick)
      this.positionTrick(this.currentlyDisplayedTrick);
  }

  private positionTrick(trick: Trick) {
    trick.cards.forEach(({ card }, index) => {
      const view = this.cardViews.get(card);
      if (!view) return;
      view.reverse = false;
      view.hidden = false;
      if (view) view.root.css("z-index", index + 100);
    });
    PositionHelper.all().forEach((pos) => {
      const card = trick.getCards()[pos]?.card;
      if (card === undefined) return;
      const view = this.cardViews.get(card);
      if (!view) return;
      view.reverse = false;
      const origin = this.originPoints.get(pos);
      if (!origin) throw new Error("Origin element missing in trick view!");
      view.position = origin.start;
    });
  }
}
