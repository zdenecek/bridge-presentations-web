import $ from "jquery";
import { Bid } from "../../bridge/model/Bid";
import { Position, PositionList } from "../../bridge/model/Position";
import { BidStack } from "./BidStack";
import { ISimpleEvent } from "ste-simple-events";
import { GameChangedEvent } from "./GameView";
import { UndoableAuction } from "../../bridge/model/UndoableAuction";

export default class AuctionView {
    private root: JQuery<HTMLElement>;
    private bidStacks: PositionList<BidStack>;

    constructor(parent: JQuery<HTMLElement>, gameChanged: ISimpleEvent<GameChangedEvent>) {
        this.root = $(`<div class='bidding'></div>`);
        // TODO add class for bidstack?
        this.bidStacks = {
            north: new BidStack(this.root, Position.North),
            east: new BidStack(this.root, Position.East),
            south: new BidStack(this.root, Position.South),
            west: new BidStack(this.root, Position.West),
        };

        parent.append(this.root);

        this.visible = false;

        gameChanged.sub((e) => {
            this.visible = false;
            e.game?.biddingStarted.sub((f) => {
                this.visible = true;
                if (e.game?.auction instanceof UndoableAuction) {
                    e.game.auction.bidRemoved.sub(({ position }) => {
                        this.bidStacks[position].removeLastBid();
                        this.update();
                    });
                }
            });
            e.game?.cardPlayed.sub(() => (this.visible = false));
            this.reset();
            e.game?.bidMade.sub((e) => this.addBid(e.player.position, e.bid));
        });
    }

    public set visible(visible: boolean) {
        this.root.toggle(visible);
    }

    public update(): void {
        Object.values(this.bidStacks).forEach((bidStack) => bidStack.updateSpacing());
    }

    private reset(): void {
        Object.values(this.bidStacks).forEach((bidStack) => bidStack.reset());
    }

    private addBid(player: Position, bid: Bid): void {
        this.bidStacks[player].addBid(bid);
    }
}
