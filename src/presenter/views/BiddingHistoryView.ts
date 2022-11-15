import { Auction } from "@/bridge/model/Auction";
import { Bid } from "@/bridge/model/Bid";
import { Position, PositionHelper } from "@/bridge/model/Position";
import View from "./View";


export default class BiddingHistoryView extends View {

    constructor() {
        super(`<div class='bidding-history'>
        <span>West</span> <span>North</span> <span>East</span> <span>South</span>
        <div class='separator'></div>
        </div>`);
    }

    attachAuction(auction?: Auction): void {
        this.Clear();
        if(!auction) return;

        let pos = auction.dealer;
        while(pos != Position.West) {
            pos = PositionHelper.nextPosition(pos, 3);
            const v =new View("<span class='spacer'>");
            this.addSubView(v);
            this.bidViews.push(v);
        }

        auction.bids.forEach(bid => {
            this.addBid(bid.bid);
        })
    }

    private bidViews = new Array<BidView | View>();
    private addBid(bid: Bid) {
        const view = new BidView(bid);
        this.bidViews.push(view);
        this.addSubView(view);
    }


    public Clear(): void {
        this.bidViews.forEach(view => view.detach());
        this.bidViews = [];
    }
}

class BidView extends View {

    constructor(bid: Bid) {
        super(`<span class="bid-view">${bid.toString()}</span>`);
    }
}