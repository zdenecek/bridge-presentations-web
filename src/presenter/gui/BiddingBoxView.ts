import $ from "jquery";
import { ISimpleEvent } from "ste-simple-events";
import { Bid, ContractBid, DoubleBid, PassBid, RedoubleBid } from "../model/Bid";
import { ContractLevel } from "../model/Contract";
import { Suit, SuitHelper } from "../model/Suit";
import { GameChangedEvent } from "./GameView";

export default class BiddingBoxView {
    root: JQuery<HTMLElement>;
    contractBidElements = new Map<{ suit: Suit; level: ContractLevel }, JQuery<HTMLElement>>();
    otherBidElements: { [key in "pass" | "double" | "redouble"]: JQuery<HTMLElement> };

    callback: ((bid: Bid) => void) | undefined;

    constructor(parent: JQuery<HTMLElement>, gameChanged: ISimpleEvent<GameChangedEvent>) {
        this.root = $(`
            <div class="bidding-box">
            </div>
        `);

        parent.append(this.root);
        this.visible = false;

        gameChanged.sub((e) => {
            this.visible = false;
            e.game?.biddingStarted.sub(() => (this.visible = true));
            e.game?.biddingEnded.sub(() => (this.visible = false));
        });

        for (let level = 1; level <= 7; level++) {
            for (const suit of SuitHelper.all()) {
                const element = $(
                    `<div class="bidding-box-bid  level-${level} suit-${SuitHelper.toString(suit).toLowerCase()}">
                    <span class="level">${level}</span><span class="suit">${SuitHelper.toSymbol(suit)}</span>
                    </div>`
                );
                element.on("click", () => {
                    this.callback?.(new ContractBid(suit, level as ContractLevel));
                });
                this.contractBidElements.set({ suit: suit, level: level as ContractLevel }, element);
                this.root.append(element);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const o: any = {};

        const passElement = $(`<div class="bidding-box-bid pass">Pass</div>`);
        passElement.on("click", () => {
            this.callback?.(new PassBid());
        });
        this.root.append(passElement);
        o.pass = passElement;

        const doubleElement = $(`<div class="bidding-box-bid double">X</div>`);
        doubleElement.on("click", () => {
            this.callback?.(new DoubleBid());
        });
        this.root.append(doubleElement);
        o.double = doubleElement;

        const redoubleElement = $(`<div class="bidding-box-bid redouble">XX</div>`);
        redoubleElement.on("click", () => {
            this.callback?.(new RedoubleBid());
        });
        this.root.append(redoubleElement);
        o.redouble = redoubleElement;

        this.otherBidElements = o;
    }

    public set visible(visible: boolean) {
        if(visible) 
        this.root.slideDown();
        else 
        this.root.slideUp()
    }

}
