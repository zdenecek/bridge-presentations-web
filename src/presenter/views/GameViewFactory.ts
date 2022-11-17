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
import { SuitHelper } from "@/bridge/model/Suit";
import { Vulnerability } from "@/bridge/model/Vulnerability";
import { PresentationPlayer } from "@/bridge/model/PresentationPlayer";
import _ from "lodash";

export default class GameViewFactory {
    static make(): GameView {
        const gameView = new GameView();

        const cardViews = this.makeCardViews(gameView);
        const frameView = this.makeFrameView(gameView);
        const centerPanelView = this.makeCenterPanelView(gameView, frameView);
        const mainView = this.makeMainView(gameView, centerPanelView);
        this.makeTrickView(cardViews, gameView, frameView);
        this.makeAuctionView(gameView, centerPanelView);
        this.makeHandViews(gameView, cardViews, mainView);
        this.makeAuctionHistoryView(gameView);
        this.makeCenterText(gameView, frameView);
        this.makeSidePanel(gameView);
        // Control Panel
        const controlPanel = new ControlPanel();
        gameView.onEachGame((game) => controlPanel.attachGame(game));
        // Control Center
        const controlCenter = new View('<div id="control-center">');
        controlCenter.addSubView(controlPanel);
        gameView.addSubView(controlCenter);
        ///
        this.makeBB(gameView, controlCenter);

        return gameView;
    }

    static makeCardViews(gameView: GameView): Map<Card, CardView> {
        const cardViews = new Map<Card, CardView>();
        gameView.gameChanged.sub((e) => {
            this.makeCards(cardViews, e.game);
            cardViews.forEach((v) => gameView.addSubView(v));
        });
        return cardViews;
    }

    static makeMainView(gameView: GameView, centerPanelView: View): View {
        const mainView = new View("<div class='main'>");
        gameView.addSubView(mainView);
        mainView.addSubView(centerPanelView);

        return mainView;
    }

    static makeFrameView(gameView: GameView): CenterFrameView {
        const frameView = new CenterFrameView();

        gameView.gameChanged.sub((e) => {
            e.game?.allPlayers.forEach((player) => {
                player.bidRequested.sub(() => (frameView.focus = player.position));
                player.playRequested.sub(() => (frameView.focus = player.position));
            });
            e.game?.gameEnded.sub(() => (frameView.focus = undefined));
        });

        return frameView;
    }

    static makeTrickView(cardViews: Map<Card, CardView>, gameView: GameView, frameView: View): TrickView {
        const trickView = new TrickView(cardViews);
        frameView.addSubView(trickView);

        gameView.updateDispatched.sub((e) => {
            if (e.game.currentTrick) {
                trickView.attachTrick(e.game.currentTrick);
            } else {
                trickView.detachTrick();
            }
            trickView.update();
        });

        return trickView;
    }

    static makeCenterPanelView(gameView: GameView, frameView: CenterFrameView): CenterPanelView {
        const centerPanelView = new CenterPanelView(frameView);

        centerPanelView.addSubView(frameView);

        gameView.gameChanged.sub(
            ({ game }) => (centerPanelView.centerFrameView.vulnerability = game?.vulnerability ?? Vulnerability.None)
        );

        new ResizeObserver(_.debounce(gameView.update, 100)).observe(centerPanelView.centerFrameView.root[0]);

        return centerPanelView;
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

            player.cardPlayed.sub((e) => {
                e.player.hand.cards.forEach((card) => {
                    const cardView = cardViews.get(card)!;
                    cardView.playable = false;
                    cardView.onclick = undefined;
                });
                const cardView = cardViews.get(e.card)!;
                cardView.playable = false;
                cardView.onclick = undefined;
            });

            player.playRequestCancelled.sub((e) => {
                e.player.hand.cards.forEach((card) => (cardViews.get(card)!.playable = false));
            });

            player.playRequested.sub((e) => {
                let playables = e.player.hand.cards;
                if (e.trick.cards.length > 0)
                    playables = playables.filter((c) => c.suit == e.trick.cards[0]?.card.suit);
                if (playables.length == 0) playables = e.player.hand.cards;

                playables.forEach((card) => {
                    const cardView = cardViews.get(card)!;
                    cardView.playable = true;
                    cardView.onclick = () => (player as PresentationPlayer).playCard(card);
                });
            });
        });
    }

    static makeSidePanel(gameView: GameView): void {
        const sidePanel = new View(
            `<div class="side-panel"><div class="t-label-tricks">Tricks</div><div class="t-label-ns">NS</div><div class="t-label-ew">EW</div><div class="t-label-contract">Contract</div></div>`
        );

        const ew = new TextView("t-ew", "0");
        const ns = new TextView("t-ns", "0");
        const contract = new TextView("t-contract");

        sidePanel.addSubView(ew);
        sidePanel.addSubView(ns);
        sidePanel.addSubView(contract);

        gameView.onEachGame((game) =>
            game.cardplayStarted.sub(({ game }) => {
                if (game.finalContract) contract.text = game.finalContract.toString();
                else contract.text = SuitHelper.toString(game.trumps);
            })
        );

        gameView.onEachGame((game) =>
            game.trickCountChanged.sub(({ game }) => {
                ew.text = game.trickCount(Side.EW).toString();
                ns.text = game.trickCount(Side.NS).toString();
            })
        );

        gameView.onEachGame((game) => {
            game.stateChanged.sub(({ game }) => {
                sidePanel.hidden = !(game.state === "cardplay" || game.state === "finished");
            });
        });

        gameView.addSubView(sidePanel);
    }

    static makeHandViews(gameView: GameView, cardViews: Map<Card, CardView>, mainView: View) {
        const handViews = {} as PositionList<OneDimensionalHandView>;
        PositionHelper.all().forEach((position) => {
            const rotation =
                position === Position.East ? Rotation.Right : position === Position.West ? Rotation.Left : Rotation.Top;
            const view = new OneDimensionalHandView(cardViews, position, rotation);
            view.addSubView;
            handViews[position] = view;
        });
        Object.values(handViews).forEach((handView) => {
            mainView.addSubView(handView);
        });
        gameView.updateDispatched.sub((e) => Object.values(handViews).forEach((handView) => handView.update()));

        gameView.onEachGame((game) => {
            game.allPlayers.forEach((player) => {
                handViews[player.position].hand = player.hand;

                player.hand.cardAdded.sub((e) => {
                    handViews[player.position].update();
                });
            });
        });

        gameView.visibilityToggle.sub(({ position }) => (handViews[position].reverse = !handViews[position].reverse));
        gameView.dummyChanged.sub(({ gameView }) => {
            Object.entries(handViews).forEach(([position, handView]) => (handView.dummy = position === gameView.dummy));
        });

        return handViews;
    }

    static makeAuctionHistoryView(gameView: GameView): View {
        const auctionHistoryView = new BiddingHistoryView();

        
        gameView.onEachGame((game) => {
            game?.biddingEnded.sub(() => {
                auctionHistoryView.attachAuction(game.auction);
            });
            game?.stateChanged.sub(({ game }) => {

                auctionHistoryView.hidden = !(game.state === "cardplay" || game.state === "finished") || !game.bidding;
            });
        });

        gameView.addSubView(auctionHistoryView);

        return auctionHistoryView;
    }
    static makeCenterText(gameView: GameView, frameView: View): TextView {
        const centerText = new TextView("center-text");
        frameView.addSubView(centerText);

        gameView.onEachGame((game) => {
            game.stateChanged.sub(({ game }) => {
                if (game.state !== "finished") {
                    centerText.root.fadeOut();
                } else {
                    centerText.text = gameView.getEndText();
                }
            });
        });

        gameView.updateDispatched.sub(({ game }) => {
            if (game.state === "finished") centerText.root.fadeIn();
        });
        return centerText;
    }

    static makeAuctionView(gameView: GameView, centerPanelView: CenterPanelView): AuctionView {
        const auctionView = new AuctionView(centerPanelView);
        gameView.updateDispatched.sub((e) => auctionView.update());
        gameView.gameChanged.sub(({ game }) => {
            if (!game) return;
            auctionView.setGame(game);

            game.stateChanged.sub(() => {
                if (game.state === "bidding") {
                    auctionView.visible = true;
                }
            });
        });

        return auctionView;
    }

    static makeBB(gameView: GameView, controlCenter: View): View {
        const bb = new BiddingBoxView();

        gameView.gameChanged.sub(({ game }) => {
            if (!game) return;
            game.stateChanged.sub(() => {
                bb.visible = game.state === "bidding";
            });

            game.allPlayers.forEach((player) => {
                player.bidRequested.sub(() => {
                    bb.callback = (bid) => (player as PresentationPlayer).bid(bid);
                });

                player.bidRequestCancelled.sub(() => {
                    bb.callback = undefined;
                });

                player.bidMade.sub(() => {
                    bb.callback = undefined;
                });
            });
        });

        controlCenter.addSubView(bb);
        return bb;
    }
}