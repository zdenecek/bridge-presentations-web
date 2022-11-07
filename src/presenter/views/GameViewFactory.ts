import { Card } from "@/bridge/model/Card";
import { PositionList, PositionHelper, Position } from "@/bridge/model/Position";
import { Rotation } from "../classes/Rotation";
import View from "./View";
import AuctionView from "./AuctionView";
import CardView from "./CardView";
import CenterFrameView from "./CenterFrameView";
import CenterPanelView from "./CenterPanelView";
import GameView from "./GameView";
import OneDimensionalHandView from "./OneDimensionalHandView";
import TrickView from "./TrickView";
import ControlPanel from "./ControlPanel";
import BiddingBoxView from "./BiddingBoxView";
import { Game } from "@/bridge/model/Game";

export default class GameViewFactory {
    static make(): GameView {
        const cardViews = new Map<Card, CardView>();

        const frameView = new CenterFrameView();
        const centerPanelView = new CenterPanelView(frameView);
        const auctionView = new AuctionView(centerPanelView);

        centerPanelView.addSubView(frameView);

        const trickView = new TrickView(cardViews);
        frameView.addSubView(trickView);

        const handViews = {} as PositionList<OneDimensionalHandView>;
        PositionHelper.all().forEach((position) => {
            const rotation =
                position === Position.East ? Rotation.Right : position === Position.West ? Rotation.Left : Rotation.Top;
            handViews[position] = new OneDimensionalHandView(cardViews, position, rotation);
        });

        const mainView = new View("<div class='main'>");
        mainView.addSubView(centerPanelView);
        Object.values(handViews).forEach((handView) => {
            mainView.addSubView(handView);
        });

        const bb = new BiddingBoxView();

        const gameView = new GameView(cardViews, centerPanelView, auctionView, trickView, handViews, bb);

        const controlPanel = new ControlPanel();

        gameView.gameChanged.sub((e) => controlPanel.attachGame(e.game));
        gameView.gameChanged.sub((e) => {
            this.makeCards(cardViews, e.game);
            cardViews.forEach((v) => gameView.addSubView(v));
        });

        gameView.addSubView(mainView);
        gameView.addSubView(bb);
        gameView.addSubView(controlPanel);
        return gameView;
    }

    static makeCards(cardViews: Map<Card, CardView>, game?: Game): void {
        cardViews.forEach((cardView) => cardView.detach());
        cardViews.clear();

        if (!game) return;

        const trick_cards = game.tricks.flatMap((trick) => trick.cards);
        trick_cards.forEach(({ card }) => {
            const view = new CardView(card);
            cardViews.set(card, view);
        });

        game.allPlayers.forEach((player) => {
            player.hand?.cards.forEach((card) => {
                const view = new CardView(card);
                cardViews.set(card, view);
            });
        });
    }
}
