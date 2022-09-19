import { Card } from "../model/Card";
import { Hand } from "../model/Hand";
import { Position } from "../model/Position";
import { Suit } from "../model/Suit";
import CardView from "./CardView";
import { GameViewMetadata } from "./GameView";
import { Point } from "./Point";

export default class HandView {
    position: Position;
    private _dummy = false;
    private _hidden = false;

    constructor(position: Position) {
        this.position = position;
    }

    get hidden(): boolean {
        return this._hidden;
    }

    set hidden(value: boolean) {
        if (this._hidden === value) return;
        this._hidden = value;
        if (this.hand) this.hand.cards.forEach((c) => (this.cardViews!.get(c)!.reverse = !value));
        this.update();
    }

    public get dummy(): boolean {
        return this._dummy;
    }
    public set dummy(value: boolean) {
        if (this._dummy === value) return;
        this._dummy = value;
        if (this.dummy) this._hidden = false;
        this.update();
    }

    private meta?: GameViewMetadata;
    private cardViews?: Map<Card, CardView>;
    private hand?: Hand;

    update(hand?: Hand, cardViews?: Map<Card, CardView>, meta?: GameViewMetadata): void {
        if (hand) this.hand = hand;
        if (cardViews) this.cardViews = cardViews;
        if (meta) this.meta = meta;
        if (!this.hand || !this.cardViews || !this.meta) return;

        if (hand && meta) this.calculateMeta(hand, meta);

        if (this.dummy && !this.hidden) this.positionDummy(this.hand, this.cardViews, this.meta);
        else this.positionHand(this.hand, this.cardViews, this.meta);
    }

    private positionHand(hand: Hand, cardViews: Map<Card, CardView>, meta: GameViewMetadata) {
        const currentPosition = this.calculateHandPosition(hand, meta);

        hand.cards.forEach((card, index) => {
            const view = cardViews.get(card)!;
            view.reverse = !this.hidden;
            view.position = currentPosition;
            view.element.css("z-index", index);
            currentPosition.x += meta.cardSpace;
        });
    }

    calculateHandPosition(hand: Hand, meta: GameViewMetadata): Point {
        switch (hand.position) {
            case Position.North:
                return meta.point((meta.width - this.width) / 2, 0);
            case Position.East:
                return meta.point(meta.width - this.width, (meta.height - meta.cardHeight) / 2);
            case Position.South:
                return meta.point((meta.width - this.width) / 2, meta.height - meta.cardHeight);
            case Position.West:
                return meta.point(0, (meta.height - meta.cardHeight) / 2);
            default:
                throw new Error("invalid argument: position");
        }
    }

    private width = 0;
    private mainDimensionSize = 0;
    private cardOffset = { x: 0, y: 0 };
    private suitOffset = { x: 0, y: 0 };
    private start = new Point(0, 0);

    calculateMeta(hand: Hand, meta: GameViewMetadata): void {
        this.width = meta.cardWidth + meta.cardSpace * (hand.cards.length - 1);

        const suitCount = new Set(hand.cards.map((c) => c.suit)).size;

        switch (hand.position) {
            case Position.North:
                this.mainDimensionSize = meta.cardWidth * suitCount + meta.dummyGap * (suitCount - 1);
                this.cardOffset = { x: 0, y: meta.dummyCardSpace };
                this.suitOffset = { x: meta.cardWidth + meta.dummyGap, y: 0 };
                this.start = meta.point((meta.width - this.mainDimensionSize) / 2, 0);
                break;
            case Position.East:
                this.mainDimensionSize = meta.cardHeight * suitCount + meta.dummyGap * (suitCount - 1);
                this.cardOffset = { x: -meta.dummyCardSpace, y: 0 };
                this.suitOffset = { x: 0, y: meta.dummyGap + meta.cardHeight };
                this.start = meta.point(meta.width - meta.cardWidth, (meta.height - this.mainDimensionSize) / 2);
                break;
            case Position.South:
                this.mainDimensionSize = meta.cardWidth * suitCount + meta.dummyGap * (suitCount - 1);
                this.cardOffset = { x: 0, y: -meta.cardSpace };
                this.suitOffset = { x: meta.dummyGap + meta.cardWidth, y: 0 };
                this.start = meta.point((meta.width - this.mainDimensionSize) / 2, meta.height - meta.cardHeight);
                break;
            case Position.West:
                this.mainDimensionSize = meta.cardHeight * suitCount + meta.dummyGap * (suitCount - 1);
                this.cardOffset = { x: meta.dummyCardSpace, y: 0 };
                this.suitOffset = { x: 0, y: meta.dummyGap + meta.cardHeight };
                this.start = meta.point(0, (meta.height - this.mainDimensionSize) / 2);
                break;
        }
    }

    positionDummy(hand: Hand, cardViews: Map<Card, CardView>, meta: GameViewMetadata): void {
        const bySuit = hand.cards.reduce((groups, card) => {
            (groups[card.suit] ||= []).push(card);
            return groups;
        }, {} as Record<Suit, Card[]>);

        const suitCount = Object.keys(bySuit).length;

        let current = this.start.copy();

        for (let s = 0; s < suitCount; s++) {
            let currentSuitPos = current.copy();
            let index = 0;
            for (const card of bySuit[Object.keys(bySuit)[s] as any as Suit]) {
                const view = cardViews.get(card)!;
                view.position = currentSuitPos;
                view.reverse = !this.hidden;

                view.element.css("z-index", index);
                currentSuitPos = currentSuitPos.add(this.cardOffset);
                index++;
            }
            current = current.add(this.suitOffset);
        }
    }
}
