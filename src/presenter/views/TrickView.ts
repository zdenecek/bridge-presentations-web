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
            const v = new View(`<div class="trick-view-origin trick-view-origin-${position}">`);
            this.addSubView(v);
            const target = new View("<div>");
            v.addSubView(target);
            this.originPoints.set(position, target);
        });
    }

    public attachTrick(t: Trick): void {
        if(t === this.currentlyDisplayedTrick) { this.update(); return;}
        if (this.currentlyDisplayedTrick) this.detachTrick();
        this.currentlyDisplayedTrick = t;
    }

    public detachTrick(): void {
        if(this.currentlyDisplayedTrick) this.currentlyDisplayedTrick.cards.forEach((c) => {
            const v = this.cardViews.get(c.card);
            if(v) v.hidden = true;
        })
        this.currentlyDisplayedTrick = undefined;
    }

    public update(): void {
        if (this.currentlyDisplayedTrick) this.positionTrick(this.currentlyDisplayedTrick);
    }

    private positionTrick(trick: Trick) {
        // const cardPositionHelper = {
        //     north: this.start.moveBy(new Vector((this.width - this.cardWidth) / 2, 0)),
        //     east: this.start.moveBy(new Vector(0, (this.height - this.cardWidth) / 2)),
        //     south: this.start.moveBy(new Vector((this.width - this.cardWidth) / 2, this.height - this.cardHeight)),
        //     west: this.start.moveBy(new Vector(this.width - this.cardHeight, (this.height - this.cardWidth) / 2)),
        // };


        trick.cards.forEach(({ card }, index) => {
            const view = this.cardViews.get(card);
            if(!view) return;
            view.reverse = false;
            view.hidden = false;
            if (view) view.root.css("z-index", index + 100);
        });
        PositionHelper.all().forEach((pos) => {
            const card = trick.getCards()[pos]?.card;
            if (card === undefined) return;
            const view = this.cardViews.get(card);
            if (!view) return;
            // const coord = cardPositionHelper[pos];
            view.reverse = false;
            const c =this.originPoints.get(pos)!.start;
            view.position = c;
        });
    }
}
