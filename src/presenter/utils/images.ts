import {
  Bid,
  ContractBid,
  DoubleBid,
  PassBid,
  RedoubleBid,
} from "@/bridge/model/Bid";
import { SuitHelper } from "@/bridge/model/Suit";

// Static image imports
const _images = import.meta.glob(["@/presenter/assets/bidding-c/*.png"], {
  eager: true,
});

export const getImagePath = (bid: Bid): string => {
  if (bid instanceof ContractBid) {
    return (
      _images[
        "/src/presenter/assets/bidding-c/" +
          `${bid.level}${SuitHelper.toLetter(bid.suit)}` +
          ".png"
      ] as any
    ).default;
  } else if (bid instanceof PassBid) {
    return (_images["/src/presenter/assets/bidding-c/pass.png"] as any).default;
  } else if (bid instanceof DoubleBid) {
    return (_images["/src/presenter/assets/bidding-c/x.png"] as any).default;
  } else if (bid instanceof RedoubleBid) {
    return (_images["/src/presenter/assets/bidding-c/xx.png"] as any).default;
  }
  throw new Error("Unknown bid type");
};

const BID = 764 / 882;
const BIDDING_RATIO_PASS = 501 / 425;
const BIDDING_RATIO_DOUBLE = 733 / 622;

export function getImageRatio(bid: Bid): number {
  let ratio = BID;

  if (bid instanceof PassBid) {
    ratio = BIDDING_RATIO_PASS;
  } else if (bid instanceof DoubleBid || bid instanceof RedoubleBid) {
    ratio = BIDDING_RATIO_DOUBLE;
  }

  return ratio;
}
