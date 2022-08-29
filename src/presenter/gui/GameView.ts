import * as $ from "jquery";
import { Card } from "../model/Card";
import CardView from "./CardView";
import GameManager from "../model/GameManager";
import { Position, Positions } from "../model/Position";
import { Player, PresentationPlayer } from "../model/Player";
import { Point } from "./Point";
import Hand from "../model/Hand";

export default class GameView {
    root!: JQuery<HTMLElement>;
    cardViews = new Map<Card, CardView>();

    gm: GameManager | undefined;

    private cardWidth = 0;
    private cardHeight = 0;
    private width = 0;
    private height = 0;
    private cardSpace = 30;
    private padding = 20;
    private trickOffset = 0;
    private trickSecondaryOffsetNS = 0;
    private trickSecondaryOffsetEW = 0;

    private calculatePositions() {
        const cardView = this.cardViews.values().next().value;

        const newWidth = this.root.width()! - 2 * this.padding;
        const newHeight = this.root.height()! - 2 * this.padding;

        if (newWidth === this.width && newHeight === this.height) return;

        this.width = newWidth;
        this.height = newHeight;
        this.cardWidth = cardView.element?.width();
        this.cardHeight = cardView.element?.height();
        this.trickOffset = this.cardHeight * 0.2;
        this.trickSecondaryOffsetNS = this.cardHeight * 0.08;
        this.trickSecondaryOffsetEW = this.cardHeight * 0.1;
        this.cardSpace = this.cardWidth * 0.25;
        console.log(this.cardWidth);
    }

    private point(x: number, y: number): Point {
        return new Point(x + this.padding, y + this.padding);
    }

    attach(gm: GameManager, root?: HTMLElement , selector?: string): void {
        
        this.root = root ? $.default(root) : $.default(selector ?? "#cards").first();
        this.gm = gm;

        gm.allPlayers.forEach((player) => {
            player.hand.cards.forEach((card) => {
                const view = new CardView(card);
                view.onclick = () => (player as PresentationPlayer).playCard(card);
                this.cardViews.set(card, view);
                this.root.append(view.element);
            });
        });

        const trick_cards = gm.tricks.flatMap((trick) => trick.cards);
        trick_cards.forEach((card) => {
            const view = new CardView(card);
            this.cardViews.set(card, view);
            this.root.append(view.element);
        });

        gm.cardPlayed.sub(() => {
            this.updatePositions();
        });

        this.updatePositions();
    }

    updatePositions(): void {
        if (this.gm === undefined) return;

        console.debug("update");
        this.calculatePositions();

        for (const pos of Positions.all()) {
            const currentPosition = this.calculateHandPosition(this.gm.player(pos).hand);

            for (const card of this.gm.player(pos).hand.cards) {
                this.cardViews.get(card)!.position = currentPosition;
                currentPosition.x += this.cardSpace;
            }
        }

        const currentTrick = this.gm.currentTrick;
        const cardPositions = currentTrick ? this.calculateCardInTrickPositions() : undefined;

        for (const trick of this.gm.tricks) {
            if (trick === currentTrick) {
                currentTrick.cards.forEach((c, index) => {
                    this.cardViews.get(c)!.element.css("z-index", index);
                });
                Positions.all().forEach((pos) => {
                    const card = trick.getCards()[pos];
                    if (card !== undefined) {
                        const view = this.cardViews.get(card)!;
                        const coord = cardPositions![pos];
                        view.position = coord;
                    }
                });
            } else {
                trick.cards.forEach((card) => {
                    this.cardViews.get(card)?.element.hide();
                });
            }
        }
    }

    updateHandPosition(start: Point, hand: Hand, position: Position): Point {
        const currentPosition = start;
        for (const card of hand.cards) {
            this.cardViews.get(card)!.element.offset(start.asCoords());
            if (Positions.NS(position)) start.x += this.cardSpace;
            else start.y += this.cardSpace;
        }

        return start;
    }

    calculateHandPosition(hand: Hand): Point {
        switch (hand.position) {
            case Position.North:
                return this.point((this.width - this.handWidth(hand)) / 2, 0);
            case Position.East:
                return this.point(this.width - this.handWidth(hand), (this.height - this.cardHeight) / 2);
            case Position.South:
                return this.point((this.width - this.handWidth(hand)) / 2, this.height - this.cardHeight);
            case Position.West:
                return this.point(0, (this.height - this.cardHeight) / 2);
            default:
                throw new Error("invalid argument: position");
        }
    }

    calculateCardInTrickPositions(): { [key in Position]: Point } {
        return {
            north: this.point(
                (this.width - this.cardWidth) / 2 - this.trickSecondaryOffsetNS,
                (this.height - this.cardHeight) / 2 - this.trickOffset
            ),
            east: this.point(
                (this.width - this.cardWidth) / 2 + this.trickOffset,
                (this.height - this.cardHeight) / 2 - this.trickSecondaryOffsetEW
            ),
            south: this.point(
                (this.width - this.cardWidth) / 2 + this.trickSecondaryOffsetNS,
                (this.height - this.cardHeight) / 2 + this.trickOffset
            ),
            west: this.point(
                (this.width - this.cardWidth) / 2 - this.trickOffset,
                (this.height - this.cardHeight) / 2 + this.trickSecondaryOffsetEW
            ),
        };
    }

    handWidth(hand: Hand): number {
        return this.cardWidth + this.cardSpace * (hand.cards.length - 1);
    }
}
