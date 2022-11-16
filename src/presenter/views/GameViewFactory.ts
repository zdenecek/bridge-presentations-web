import { Card } from "@/bridge/model/Card";
import { PositionList, PositionHelper, Position, Side } from "@/bridge/model/Position";
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
import BiddingHistoryView from "./BiddingHistoryView";
import TextView from "./TextView";
import { UndoableGame } from "@/bridge/model/UndoableGame";

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
            const view = new OneDimensionalHandView(cardViews, position, rotation);
            view.addSubView;
            handViews[position] = view;
        });

        const mainView = new View("<div class='main'>");
        mainView.addSubView(centerPanelView);
        Object.values(handViews).forEach((handView) => {
            mainView.addSubView(handView);
        });

        const bb = new BiddingBoxView();

        const gameView = new GameView(cardViews, centerPanelView, handViews, bb);

        const controlPanel = new ControlPanel();


        gameView.onEachGame(game => controlPanel.attachGame(game));
        gameView.gameChanged.sub((e) => {
            this.makeCards(cardViews, e.game);
            cardViews.forEach((v) => gameView.addSubView(v));
        });

        gameView.gameChanged.sub((e) => {
            e.game?.allPlayers.forEach((player) => {
                player.bidRequested.sub(() => (frameView.focus = player.position));
                player.playRequested.sub(() => (frameView.focus = player.position));
            });
            e.game?.gameEnded.sub(() => (frameView.focus = undefined));
        });

        gameView.addSubView(mainView);

        const controlCenter = new View('<div id="control-center">');
        controlCenter.addSubView(controlPanel);
        controlCenter.addSubView(bb);

        const auctionHistoryView = new BiddingHistoryView();
        gameView.gameChanged.sub((e) => {
            e.game?.biddingEnded.sub(() => {
                auctionHistoryView.attachAuction(e.game?.auction);
                auctionHistoryView.show();
            });
            e.game?.gameStarted.sub(() => auctionHistoryView.hide());
        });

        gameView.addSubView(controlCenter);
        gameView.addSubView(auctionHistoryView);

        const centerText = new TextView("center-text");
        frameView.addSubView(centerText);

        gameView.updateDispatched.sub((e) => {
            e.game?.biddingEnded.sub(() => {
                auctionHistoryView.attachAuction(e.game?.auction);
                auctionHistoryView.show();
            });
            e.game?.gameStarted.sub(() => auctionHistoryView.hide());
        });

        gameView.updateDispatched.sub((e) => {
            if (e.game.currentTrick) {
                trickView.attachTrick(e.game.currentTrick);
            } else {
                trickView.detachTrick();
                if (e.game.state === "finished") {
                    centerText.text = gameView.getEndText();
                }
            }
            trickView.update();
        });

        gameView.onEachGame(game => {
            game.stateChanged.sub(({game}) => {
                centerText.hidden = game.state !== "finished";
                
            });
        })
        gameView.updateDispatched.sub((e) => auctionView.update());
        gameView.updateDispatched.sub((e) => Object.values(handViews).forEach((handView) => handView.update()));

        gameView.gameChanged.sub(({ game }) => {

            if(!game) return;
            auctionView.setGame(game);

            bb.visible = false;
            game?.biddingStarted.sub(() => (bb.visible = true));
            game?.biddingEnded.sub(() => (bb.visible = false));


            if (game instanceof UndoableGame)
                game.undoMade.sub(() => {
                    if (game.state === "bidding") {
                        gameView.dummy = undefined;
                        bb.visible = true;
                        auctionView.visible = true;
                    }
                    gameView.update();
                });
        });

        const sidePanel = this.makeSidePanel(gameView);
        gameView.addSubView(sidePanel);

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

    static makeSidePanel(gameView: GameView): View {
        const sidePanel = new View(`<div class="side-panel"><div class="t-label-tricks">Tricks</div><div class="t-label-ns">NS</div><div class="t-label-ew">EW</div><div class="t-label-contract">Contract</div></div>`);

        const ew = new TextView("t-ew", "0");
        const ns = new TextView("t-ns", "0");
        const contract = new TextView("t-contract");

        sidePanel.addSubView(ew);
        sidePanel.addSubView(ns);
        sidePanel.addSubView(contract);

        gameView.onEachGame(game => game.biddingEnded.sub((e) => 
            contract.text = e.game.finalContract!.toString()
        ));

        gameView.onEachGame(game => game.trickCountChanged.sub(({game})=> {
            ew.text = game.trickCount(Side.EW).toString();
            ns.text = game.trickCount(Side.NS).toString();
        }))

        gameView.onEachGame(game => {
            game.stateChanged.sub(({game}) => {
                sidePanel.hidden = !(game.state === "cardplay" || game.state === "finished") ;
                
            });

        });

        return sidePanel;
    }
}
