import { Bid } from "../../bridge/model/Bid";
import { Position, PositionList } from "../../bridge/model/Position";
import { BidStack } from "./BidStack";
import { UndoableAuction } from "../../bridge/model/UndoableAuction";
import View from "./View";
import { Game } from "@/bridge/model/Game";
import CenterPanelView from "./CenterPanelView";
import { runLater } from "@/bridge/utils/runLater";

export default class AuctionView {
    private bidStacks: PositionList<BidStack>;
    private centerPanelView: CenterPanelView;

    constructor(centerPanelView: CenterPanelView) {
        this.bidStacks = {
            north: new BidStack(Position.North),
            east: new BidStack(Position.East),
            south: new BidStack(Position.South),
            west: new BidStack(Position.West),
        };

        Object.values(this.bidStacks).forEach((b) => {
            centerPanelView.addSubView(b);
        });

        this.centerPanelView = centerPanelView;

        this.visible = false;
    }

    public setGame(game: Game): void {
        this.visible = false;
        game?.biddingStarted.sub(() => {
            this.visible = true;
            this.centerPanelView.bidding = true;
            this.update();
            if (game?.auction instanceof UndoableAuction) {
                game.auction.bidRemoved.sub(({ position }) => {
                    this.bidStacks[position].removeLastBid();
                    this.update();
                });
            }
        });

        game?.biddingEnded.sub(() => {
            runLater(() => { this.visible = false}, 1000)
        });

        game?.cardPlayed.sub(() => {
            this.visible = false;
            this.update();
        });
        this.reset();
        game?.bidMade.sub((e) => this.addBid(e.player.position, e.bid));
    }

    public set visible(visible: boolean) {
        Object.values(this.bidStacks).forEach((b) => b.root.toggle(visible));
        this.centerPanelView.bidding = false;

    }

    public update(): void {
        Object.values(this.bidStacks).forEach((bidStack) => bidStack.update());
    }

    private reset(): void {
        Object.values(this.bidStacks).forEach((bidStack) => bidStack.reset());
    }

    private addBid(player: Position, bid: Bid): void {
        this.bidStacks[player].addBid(bid);
    }
}
