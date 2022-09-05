import * as $ from "jquery";
import { Card } from "../model/Card";
import CardView from "./CardView";
import Game from "../model/Game";
import { Position, Positions, Side } from "../model/Position";
import { Point } from "./Point";
import Hand from "../model/Hand";
import BiddingBoxView from "./BiddingBoxView";
import { PresentationPlayer } from "../model/PresentationPlayer";
import { AuctionView } from "./AuctionView";
import { ISimpleEvent, SimpleEventDispatcher } from "ste-simple-events";


export interface GameChangedEvent { game?: Game; }


export default class GameView {
    
    private root: JQuery<HTMLElement>;
    private cardViews = new Map<Card, CardView>();
    private biddingBox: BiddingBoxView;
    private auctionView: AuctionView;
    private _game?: Game;

    constructor() {
        this.root = $.default("<div class='presenter-app'></div>");
        this.auctionView = new AuctionView(this.root, this.gameChanged);
        this.biddingBox = new BiddingBoxView(this.root,  this.gameChanged);
    }

    private _gameChanged = new SimpleEventDispatcher<GameChangedEvent>();
    private get gameChanged(): ISimpleEvent<GameChangedEvent> {
        return this._gameChanged.asEvent();
    }

    public attach(parent: HTMLElement): void {
        $.default(parent).append(this.root);
    }

    public get game(): Game | undefined {
        return this._game;
    }

    public set game(game: Game | undefined) {
        if (!this.root) throw new Error("root not attached");
        this._game = game;
        this._gameChanged.dispatch({ game });
        if (!game) return;



        this.cardViews.forEach((cardView) => cardView.element.detach());
        this.cardViews = new Map<Card, CardView>();

        game.allPlayers.forEach((player) => {
            player.hand?.cards.forEach((card) => {
                const view = new CardView(card);
                this.cardViews.set(card, view);
                this.root!.append(view.element);
            });

            player.playRequested.sub((e) => {
                let playables = e.player.hand.cards;
                if (e.trick.cards.length > 0) playables = playables.filter((c) => c.suit == e.trick.cards[0]?.suit);
                if (playables.length == 0) playables = e.player.hand.cards;

                playables.forEach((card) => {
                    const cardView = this.cardViews.get(card)!;
                    cardView.playable = true;
                    cardView.onclick = () => (player as PresentationPlayer).playCard(card);
                });
            });

            player.playRequestCancelled.sub((e) => {
                e.player.hand.cards.forEach((card) => (this.cardViews.get(card)!.playable = false));
            });

            player.cardPlayed.sub((e) => {
                e.player.hand.cards.forEach((card) => {
                    const cardView = this.cardViews.get(card)!;
                    cardView.playable = false;
                    cardView.onclick = undefined;
                });
                const cardView = this.cardViews.get(e.card)!;
                cardView.playable = false;
                cardView.onclick = undefined;
            });

            player.bidRequested.sub(() => {
                this.biddingBox.callback = (bid) => (player as PresentationPlayer).bid(bid);
            });

            player.bidRequestCancelled.sub(() => {
                this.biddingBox.callback = undefined;
            });

            player.bidMade.sub(() => {
                this.biddingBox.callback = undefined;
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
                    this.cardViews.get(c)!.element.css("z-index", index + 10);
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

    toggleVisible(position: Position): void {
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
        if (!this.root) return;
        const cardView = this.cardViews.values().next().value;
        if (!cardView) return;

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
            if (Positions.side(position) === Side.NS) currentPosition.x += this.cardSpace;
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
