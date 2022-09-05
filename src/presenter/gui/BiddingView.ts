import $ from "jquery";
import { Bid } from "../model/Bid";
import Game from "../model/Game";
import { Position, PositionList } from "../model/Position";
import { BidView } from "./BidView";

export class BiddingView {
    private root: JQuery<HTMLElement>;
    private bidViews: PositionList<Array<BidView>>;
    private bidStacks: PositionList<JQuery<HTMLElement>>;
    private _game?: Game;

    constructor() {
        this.root = $(`<div class='bidding'></div>`);
        this.bidViews = { north: [], east: [], south: [], west: [] };
        this.bidStacks = {
            north: $(`<div class='bid-stack bid-stack-north'></div>`),
            east: $(`<div class='bid-stack bid-stack-east'></div>`),
            south: $(`<div class='bid-stack bid-stack-south'></div>`),
            west: $(`<div class='bid-stack bid-stack-west'></div>`),
        };
    }

    public attach(parent: JQuery<HTMLElement>): void {
        parent.append(this.root);
    }

    public get game(): Game | undefined {
        return this._game;
    }

    public set game(game: Game | undefined) {
        this._game = game;

        game?.bidMade.sub((e) => this.addBid(e.player.position, e.bid));
    }

    public set visible(visible: boolean) {
        this.root.toggle(visible);
    }

    private height = 0;
    private width = 0;

    public updatePositions(): void {
        const height = this.root.height()!;
        const width = this.root.width()!;
        if (height === this.height && width === this.width) return;

        this.height = height;
        this.width = width;
    }

    private addBid(player: Position, bid: Bid): void {
        const bidView = new BidView(bid, player);
        this.bidViews[player].push(bidView);
        this.root.append(bidView.element);
    }
}
