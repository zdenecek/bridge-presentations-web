import { Card } from "@/bridge/model/Card";
import { PositionHelper } from "@/bridge/model/Position";
import { Vulnerability } from "@/bridge/model/Vulnerability";
import AuctionView from "./AuctionView";
import CardView from "./CardView";
import CenterFrameView from "./CenterFrameView";
import TrickView from "./TrickView";
import View from "./View";



export default class CenterPanelView  extends View {
    

    centerFrameView: CenterFrameView;

    constructor(centerFrameView: CenterFrameView) {
        super(`<div class="center-panel"></div>`); 
        this.centerFrameView = centerFrameView;     
        this.bidding = true;  
    }

    public set bidding (value: boolean) {
        this.root.toggleClass("center-panel-bidding", value)
    }



}