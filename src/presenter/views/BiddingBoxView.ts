import { Bid, ContractBid, DoubleBid, PassBid, RedoubleBid } from "../../bridge/model/Bid";
import { ContractLevel } from "../../bridge/model/Contract";
import { Suit, SuitHelper } from "../../bridge/model/Suit";
import View from "./View";

export default class BiddingBoxView extends View {
  contractBidElements = new Map<{ suit: Suit; level: ContractLevel }, View>();
  otherBidElements: { [key in "pass" | "double" | "redouble"]: View };

  callback: ((bid: Bid) => void) | undefined;

  constructor() {
    super(`
        <div class="bidding-box">
        </div>
        `);

    this.visible = false;

    for (let level = 1; level <= 7; level++) {
      for (const suit of SuitHelper.all()) {
        const element = new View(
          `<div class="bidding-box-bid  level-${level} suit-${SuitHelper.toString(suit).toLowerCase()}">
                    <span class="level">${level}</span><span class="suit">${SuitHelper.toSymbol(suit)}</span>
                    </div>`
        );
        element.on("click", () => {
          this.callback?.(new ContractBid(suit, level as ContractLevel));
        });
        this.contractBidElements.set({ suit: suit, level: level as ContractLevel }, element);
        this.addSubView(element);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const o: any = {};

    const passElement = new View(`<div class="bidding-box-bid pass">Pass</div>`);
    passElement.on("click", () => {
      this.callback?.(new PassBid());
    });
    this.addSubView(passElement);
    o.pass = passElement;

    const doubleElement = new View(`<div class="bidding-box-bid double">X</div>`);
    doubleElement.on("click", () => {
      this.callback?.(new DoubleBid());
    });
    this.addSubView(doubleElement);
    o.double = doubleElement;

    const redoubleElement = new View(`<div class="bidding-box-bid redouble">XX</div>`);
    redoubleElement.on("click", () => {
      this.callback?.(new RedoubleBid());
    });
    this.addSubView(redoubleElement);
    o.redouble = redoubleElement;

    this.otherBidElements = o;
  }

  public set visible(visible: boolean) {
    if (visible) this.slideDown();
    else this.slideUp();
  }
}
