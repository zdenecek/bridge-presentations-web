import * as $ from "jquery";
import CardView from "./CardView";
import {Game} from "../model/Game";
import {Trick} from "../model/Trick";
import { Card } from "../model/Card";
import { Position, PositionList, PositionHelper } from "../model/Position";
import { Point } from "./Point";
import { PresentationPlayer } from "../model/PresentationPlayer";
import  AuctionView from "./AuctionView";
import BiddingBoxView from "./BiddingBoxView";
import { ISimpleEvent, SimpleEventDispatcher } from "ste-simple-events";
import HandView from "./HandView";
import { UndoableGame } from "../model/UndoableGame";

export interface GameChangedEvent {
    game?: Game;
}

export class GameViewMetadata {
    static default = new GameViewMetadata();

    cardWidth = 0;
    cardHeight = 0;
    width = 0;
    height = 0;
    cardSpace = 30;
    padding = 20;
    trickOffset = 0;
    trickSecondaryOffsetNS = 0;
    trickSecondaryOffsetEW = 0;
    dummyCardSpace = 0;
    dummyGap = 0;

    constructor(width = 0, height = 0, cardWidth = 0, cardHeight = 0) {
        this.width = width;
        this.height = height;
        this.cardWidth = cardWidth;
        this.cardHeight = cardHeight;
        this.trickOffset = this.cardHeight * 0.2;
        this.trickSecondaryOffsetNS = this.cardHeight * 0.08;
        this.trickSecondaryOffsetEW = this.cardHeight * 0.1;
        this.cardSpace = this.cardWidth * 0.25;
        this.dummyGap = this.cardWidth * 0.1;
        this.dummyCardSpace = this.cardSpace;
    }

    point(x: number, y: number): Point {
        return new Point(x + this.padding, y + this.padding);
    }
}

export type DummyOptions = 'static' | 'auto' | 'none';

export default class GameView {
    private root: JQuery<HTMLElement>;
    private cardViews = new Map<Card, CardView>();
    private biddingBox: BiddingBoxView;
    private auctionView: AuctionView;
    private handViews: PositionList<HandView>;
    private _game?: Game;
    private _dummy?: Position | undefined;

    private _metadata?: GameViewMetadata;

    public get dummy(): Position | undefined {
        return this._dummy;
    }

    public set dummy(value: Position | undefined) {
        console.log(value ? PositionHelper.toString(value) :  'none');
        if (this._dummy === value) return;
        if (this._dummy) this.handViews[this._dummy].dummy = false;
        this._dummy = value;
        if (!value) return;
        this.handViews[value].dummy = true;
    }

    constructor() {
        this.root = $.default("<div class='presenter-app'></div>");
        this.auctionView = new AuctionView(this.root, this.gameChanged);
        this.biddingBox = new BiddingBoxView(this.root, this.gameChanged);
        this.handViews = {} as PositionList<HandView>;
        PositionHelper.all().forEach((position) => {
            this.handViews[position] = new HandView(position);
        });
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

    public attachGame(game: Game | undefined, dummy: DummyOptions = 'auto', staticDummyPosition?: Position): void {
        if (!this.root) throw new Error("root not attached");
        this._game = game;
        this._gameChanged.dispatch({ game });
        if (!game) return;

        if (game instanceof UndoableGame)
            game.undoMade.sub(() => {
                if (game.state === "bidding") {
                    this.dummy = undefined;
                    this.biddingBox.visible = true;
                    this.auctionView.visible = true;
                }
                this.update();
            });
        
        this.cardViews.forEach((cardView) => cardView.element.detach());
        this.cardViews = new Map<Card, CardView>();

        Object.values(this.handViews).forEach((handView) => {
            handView.hidden = false;
        });

        this.dummy = undefined;

        if (dummy === "auto" || game.bidding) {
            game.leadMade.sub((e) => {
                //TODO
                this.dummy = PositionHelper.nextPosition(e.player.position);
            });
        } else if (dummy === "static" && staticDummyPosition) {
            this.dummy = staticDummyPosition;
        }

        const trick_cards = game.tricks.flatMap((trick) => trick.cards);
        trick_cards.forEach(({ card }) => {
            const view = new CardView(card);
            this.cardViews.set(card, view);
            this.root!.append(view.element);
        });

        game.cardPlayed.sub(() => {
            this.update();
        });

        game.allPlayers.forEach((player) => {
            player.hand?.cards.forEach((card) => {
                const view = new CardView(card);
                this.cardViews.set(card, view);
                this.root.append(view.element);
            });

            player.hand.cardAdded.sub((e) => {
                this.handViews[player.position].update(player.hand, this.cardViews, this.metadata);
            });

            player.playRequested.sub((e) => {
                let playables = e.player.hand.cards;
                if (e.trick.cards.length > 0)
                    playables = playables.filter((c) => c.suit == e.trick.cards[0]?.card.suit);
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

        this.update();
    }

    update(): void {
        if (this.game === undefined) return;
        this.updateMetadata();

        // Hands
        Object.entries(this.handViews).forEach(([position, handView]) => {
            const hand = this.game!.player(position as Position).hand;
            handView.update(hand, this.cardViews, this.metadata!);
        });

        // Tricks
        if (this.game.currentTrick) {
            this.positionTrick(this.game.tricks, this.game.currentTrick);
        }
    }

    toggleVisible(position: Position): void {
        this.handViews[position].hidden = !this.handViews[position].hidden;
    }

    get metadata(): GameViewMetadata {
        if (!this._metadata) this.updateMetadata();
        return this._metadata!;
    }

    private updateMetadata(): void {
        const cardView = this.cardViews.values().next().value;
        if (!this.root || !cardView) {
            this._metadata = GameViewMetadata.default;
            return;
        }

        const cardWidth = cardView.element.width() || 0;
        const cardHeight = cardView.element.height() || 0;

        const width = (this.root.width() || 0) - 2 * (this._metadata?.padding || 0);
        const height = (this.root.height() || 0) - 2 * (this._metadata?.padding || 0);

        if (this._metadata && width === this._metadata.width && height === this._metadata.height) return;

        this._metadata = new GameViewMetadata(width, height, cardWidth, cardHeight);
    }

    private positionTrick(tricks: Array<Trick>, trick: Trick) {
        const cardPositionHelper = trick ? this.calculateCardInTrickPositionHelper() : undefined;

        for (const t of tricks) {
            if (t === trick) {
                trick.cards.forEach(({ card }, index) => {
                    this.cardViews.get(card)!.element.css("z-index", index + 100);
                });
                PositionHelper.all().forEach((pos) => {
                    const card = trick.getCards()[pos]?.card;
                    if (card !== undefined) {
                        const view = this.cardViews.get(card)!;
                        const coord = cardPositionHelper![pos];
                        view.position = coord;
                        view.hidden = false;
                    }
                });
            } else {
                t.cards.forEach(({ card }) => {
                    this.cardViews.get(card)!.hidden = true;
                });
            }
        }
    }

    calculateCardInTrickPositionHelper(): { [key in Position]: Point } {
        const m = this.metadata;
        return {
            north: m.point(
                (m.width - m.cardWidth) / 2 - m.trickSecondaryOffsetNS,
                (m.height - m.cardHeight) / 2 - m.trickOffset
            ),
            east: m.point(
                (m.width - m.cardWidth) / 2 + m.trickOffset,
                (m.height - m.cardHeight) / 2 - m.trickSecondaryOffsetEW
            ),
            south: m.point(
                (m.width - m.cardWidth) / 2 + m.trickSecondaryOffsetNS,
                (m.height - m.cardHeight) / 2 + m.trickOffset
            ),
            west: m.point(
                (m.width - m.cardWidth) / 2 - m.trickOffset,
                (m.height - m.cardHeight) / 2 + m.trickSecondaryOffsetEW
            ),
        };
    }
}
