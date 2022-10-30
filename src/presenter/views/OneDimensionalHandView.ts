import { Card } from "../../bridge/model/Card";
import { Hand } from "../../bridge/model/Hand";
import { Position, PositionHelper, PositionList, Side } from "../../bridge/model/Position";
import { Suit } from "../../bridge/model/Suit";
import { Point } from "../classes/Point";
import { Rotation, RotationHelper } from "../classes/Rotation";
import { Vector } from "../classes/Vector";
import CardView from "./CardView";
import HandView from "./HandView";

export interface OneDimensionalHandViewMetadata {
    primaryDimensionSize: number;
    primaryDimensionCardSize: number;
    start: Point;
    rotation: Rotation;
    maximumCardOffset: number;
    dummySuitOffset: number;
    dummyCardOffset: number;

}

export class OneDimensionalHandViewMetadataFactory {
    private cardWidth: number;
    private cardHeight: number;
    private width: number;
    private height: number;
    private maximumCardOffset: number;
    private dummySuitOffset: number;
    private dummyCardOffset: number;

    constructor(
        cardWidth: number,
        cardHeight: number,
        width: number,
        height: number,
        maximumCardOffset?: number,
        dummySuitOffset?: number,
        dummyCardOffset?: number
    ) {
        this.cardWidth = cardWidth;
        this.cardHeight = cardHeight;
        this.width = width;
        this.height = height;

        this.maximumCardOffset = maximumCardOffset || cardWidth / 4;
        this.dummySuitOffset = dummySuitOffset || cardHeight / 5;
        this.dummyCardOffset = dummyCardOffset || this.maximumCardOffset;
    }

    public make(rotation: Rotation, start: Point): OneDimensionalHandViewMetadata {
        return {
            primaryDimensionSize: RotationHelper.isHorizontal(rotation) ? this.width : this.height,
            primaryDimensionCardSize: this.cardWidth,
            start: start,
            rotation,
            maximumCardOffset: this.maximumCardOffset,
            dummySuitOffset: this.dummySuitOffset,
            dummyCardOffset: this.dummyCardOffset,
        };
    }
}

export class OneDimensionalHandViewMetadataByPositionFactory extends OneDimensionalHandViewMetadataFactory {
    
    private starts: PositionList<Point>;

    constructor(
        cardWidth: number,
        cardHeight: number,
        width: number,
        height: number,
        starts: PositionList<Point>,
        maximumCardOffset?: number,
        dummySuitOffset?: number,
        dummyCardOffset?: number
    ) {
        super(cardWidth, cardHeight, width, height, maximumCardOffset, dummySuitOffset, dummyCardOffset);
        this.starts = starts;
    }

    public makeWithPosition(position: Position, start?: Point): OneDimensionalHandViewMetadata {

        const rot = position === Position.East ? Rotation.Right :
                    position === Position.West ? Rotation.Left :
                    Rotation.Top;
        return this.make(rot, start || this.starts[position]);
    }
}

export default class OneDimensionalHandView extends HandView {
    private meta: OneDimensionalHandViewMetadata;

    private primaryDimension(): "x" | "y" {
        return RotationHelper.isHorizontal(this.meta?.rotation) ? "x" : "y";
    }
    private make1DVector(size: number, perpendicular = false): Vector {
        return RotationHelper.isHorizontal(this.meta?.rotation) === perpendicular ? new Vector(0, size) : new Vector(size, 0);
    }

    constructor(cardViews: Map<Card, CardView>, position: Position, hand: Hand, meta: OneDimensionalHandViewMetadata) {
        super(cardViews, position, hand);
        this.meta = meta;

        
        hand.cards.forEach(card => {
            const view = cardViews.get(card);
            if(!view) return;
            view.rotation = meta.rotation;
        })

        hand.cardAdded.sub(e =>  {
            const view = cardViews.get(e.card);
            if(!view) return;
            view.rotation = meta.rotation;
        });
    }

    update(meta?: OneDimensionalHandViewMetadata): void {
        if(meta) this.meta = meta;
        super.update();
    }

    getCardOffsetVector(): Vector {
        const remainingSpace = this.meta.primaryDimensionSize - this.meta.primaryDimensionCardSize;
        let cardOffset = 0;
        if (this._hand.cards.length > 1) {
            cardOffset = Math.min(remainingSpace / this._hand.cards.length, this.meta.maximumCardOffset);
        }

        return this.make1DVector(cardOffset);
    }

     

    updateNonDummy(): void {
        const offsetVector = this.getCardOffsetVector();
        const primarySize =
            this.meta.primaryDimensionCardSize + offsetVector[this.primaryDimension()] * this._hand.cards.length;

        const center = this.meta.start.moveBy(this.make1DVector(this.meta.primaryDimensionSize / 2));
        let currentPosition = center.moveBy(this.make1DVector(-primarySize / 2));

        this._hand.cards.forEach((card, index) => {
            const view = this._cardViews.get(card);
            if (!view) throw new Error(`Card view does not exist: ${card}`);
            view.reverse = !this.hidden;
            view.position = currentPosition;
            view.element.css("z-index", index);
            currentPosition = currentPosition.moveBy(offsetVector);
        });
    }

    updateDummy(): void {
        const bySuit = this._hand.cards.reduce((groups, card) => {
            (groups[card.suit] ||= []).push(card);
            return groups;
        }, {} as Record<Suit, Card[]>);

        const suitCount = Object.keys(bySuit).length;
        // start SUIT offset SUIT offset ... SUIT end
        const primarySize =
            (this.meta.primaryDimensionCardSize + this.meta.dummySuitOffset) * suitCount - this.meta.dummySuitOffset;

        const center = this.meta.start.moveBy(this.make1DVector(this.meta.primaryDimensionSize / 2));
        let currentPosition = center.moveBy(this.make1DVector(-primarySize / 2));

        const suitOffset = this.make1DVector(this.meta.dummySuitOffset + this.meta.primaryDimensionCardSize);
        const cardOffset = this.make1DVector(this.meta.dummySuitOffset, true);

        for (let s = 0; s < suitCount; s++) {
            let currentSuitPos = currentPosition.copy();
            let index = 0;
            for (const card of bySuit[Object.keys(bySuit)[s] as any as Suit]) {
                const view = this._cardViews.get(card);
                if (!view) throw new Error(`Card view does not exist: ${card}`);
                view.position = currentSuitPos;
                view.reverse = !this.hidden;

                view.element.css("z-index", index);
                currentSuitPos = currentSuitPos.moveBy(cardOffset);
                index++;
            }
            currentPosition = currentPosition.moveBy(suitOffset);
        }
    }
}
