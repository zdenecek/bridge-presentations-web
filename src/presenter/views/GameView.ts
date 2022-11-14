import { Game } from "../../bridge/model/Game";
import { Card } from "../../bridge/model/Card";
import { Position, PositionList, PositionHelper } from "../../bridge/model/Position";
import { PresentationPlayer } from "../../bridge/model/PresentationPlayer";
import { ISimpleEvent, SimpleEventDispatcher } from "ste-simple-events";
import { UndoableGame } from "../../bridge/model/UndoableGame";

import CardView from "./CardView";
import AuctionView from "./AuctionView";
import BiddingBoxView from "./BiddingBoxView";
import BaseView from "./BaseView";
import OneDimensionalHandView from "./OneDimensionalHandView";
import TrickView from "./TrickView";
import CenterPanelView from "./CenterPanelView";

import _ from "lodash";

export interface GameChangedEvent {
    game?: Game;
}

export type DummyOptions = "static" | "auto" | "none";

export default class GameView extends BaseView {
    
    private cardViews: Map<Card, CardView>;
    private biddingBox: BiddingBoxView;
    private handViews: PositionList<OneDimensionalHandView>;
    private auctionView: AuctionView;
    private trickView: TrickView;
    private centerPanelView: CenterPanelView;

    private _game?: Game;
    private _dummy?: Position | undefined;


    constructor(cardViews: Map<Card, CardView>, centerPanelView: CenterPanelView, auctionView: AuctionView, trickView: TrickView, handViews: PositionList<OneDimensionalHandView>,  biddingBox: BiddingBoxView) {
        super("<div class='presenter-app'></div>");

        this.cardViews = cardViews;
        this.trickView = trickView;
        this.auctionView = auctionView;
        this.handViews = handViews;
        this.centerPanelView = centerPanelView;

        new ResizeObserver(_.debounce(this.update, 100)).observe(centerPanelView.centerFrameView.root[0]); 

        this.biddingBox = biddingBox;
    }

    public get dummy(): Position | undefined {
        return this._dummy;
    }

    public set dummy(value: Position | undefined) {
        if (this._dummy === value) return;
        if (this._dummy) this.handViews[this._dummy].dummy = false;
        this._dummy = value;
        if (!value) return;
        this.handViews[value].dummy = true;
    }

    private _gameChanged = new SimpleEventDispatcher<GameChangedEvent>();
    public get gameChanged(): ISimpleEvent<GameChangedEvent> {
        return this._gameChanged.asEvent();
    }

    public get game(): Game | undefined {
        return this._game;
    }

    public attachGame(game: Game | undefined, dummy: DummyOptions = "auto", staticDummyPosition?: Position): void {
        if (!this.root) throw new Error("root not attached");
        this._game = game;
        this._gameChanged.dispatch({ game });
        if (!game) return;
        this.auctionView.setGame(game);

        this.biddingBox.visible = false;
        game?.biddingStarted.sub(() => (this.biddingBox.visible = true));
        game?.biddingEnded.sub(() => (this.biddingBox.visible = false));

        this.centerPanelView.centerFrameView.vulnerability = game.vulnerability;

        if (game instanceof UndoableGame)
            game.undoMade.sub(() => {
                if (game.state === "bidding") {
                    this.dummy = undefined;
                    this.biddingBox.visible = true;
                    this.auctionView.visible = true;
                }
                this.update();
            });


        this.dummy = undefined;

        if (dummy === "auto" || game.bidding) {
            game.leadMade.sub((e) => {
                this.dummy = PositionHelper.nextPosition(e.player.position);
            });
        } else if (dummy === "static" && staticDummyPosition) {
            this.dummy = staticDummyPosition;
        }

        game.cardPlayed.sub(e => {
            this.update();
            
        });

        game.allPlayers.forEach((player) => {

            this.handViews[player.position].hand = player.hand;

            player.hand.cardAdded.sub((e) => {
                this.handViews[player.position].update();
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

        // Hands
        Object.values(this.handViews).forEach((handView) => handView.update());

        // Tricks
        if (this.game.currentTrick) {
            this.trickView.attachTrick(this.game.currentTrick);
        }

        this.trickView.update();
        this.auctionView.update();
    }

    toggleVisible(position: Position): void {
        this.handViews[position].hidden = !this.handViews[position].hidden;
    }

}
