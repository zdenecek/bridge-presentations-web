import * as $ from "jquery";
import { Card } from "../model/Card";
import CardView from "./CardView";
import Game from "../model/Game";
import { Position, Positions } from "../model/Position";
import { PresentationPlayer } from "../model/Player";
import { Point } from "./Point";
import Hand from "../model/Hand";

export default class GameView {
    private root?: JQuery<HTMLElement>;
    cardViews = new Map<Card, CardView>();

    _game?: Game;

    public attach(root?: HTMLElement, selector?: string): void {
        this.root = root ? $.default(root) : $.default(selector ?? "#cards").first();
    }

    public get game(): Game | undefined {
        return this._game;
    }

    public set game(game: Game | undefined) {
        if(!this.root) throw new Error("root not attached");
        this._game = game;
        if (!game) return;

        this.cardViews.forEach((cardView) => cardView.element.detach());
        this.cardViews = new Map<Card, CardView>();

        game.allPlayers.forEach((player) => {
            player.hand?.cards.forEach((card) => {
                const view = new CardView(card);
                view.onclick = () => (player as PresentationPlayer).playCard(card);
                this.cardViews.set(card, view);
                this.root!.append(view.element);
            });
        });

        const trick_cards = game.tricks.flatMap((trick) => trick.cards);
        trick_cards.forEach((card) => {
            const view = new CardView(card);
            this.cardViews.set(card, view);
            this.root!.append(view.element);
        });

        game.cardPlayed.sub(() => {
            this.updatePositions();
        });

        this.updatePositions();
    }


    updatePositions(): void {
        if (this.game === undefined) return;

        console.debug("update");
        this.calculatePositions();

        for (const pos of Positions.all()) {
            const currentPosition = this.calculateHandPosition(this.game.player(pos).hand);

            for (const card of this.game.player(pos).hand.cards) {
                this.cardViews.get(card)!.position = currentPosition;
                currentPosition.x += this.cardSpace;
            }
        }

        const currentTrick = this.game.currentTrick;
        const cardPositions = currentTrick ? this.calculateCardInTrickPositions() : undefined;

        for (const trick of this.game.tricks) {
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

    toggleVisible(position: Position) {
        this.game?.player(position).hand?.cards.forEach((card) => {
            this.cardViews.get(card)!.toggleVisible();
        });
    }

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
        if(!this.root) return;
        const cardView = this.cardViews.values().next().value;
        if(!cardView) return;

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
    }

    private point(x: number, y: number): Point {
        return new Point(x + this.padding, y + this.padding);
    }

    updateHandPosition(start: Point, hand: Hand, position: Position): Point {
        const currentPosition = start;
        for (const card of hand.cards) {
            this.cardViews.get(card)!.element.offset(currentPosition.asCoords());
            if (Positions.NS(position)) currentPosition.x += this.cardSpace;
            else currentPosition.y += this.cardSpace;
        }

        return currentPosition;
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
