import { Position, PositionHelper } from "@/bridge/model/Position";
import { Vulnerability, VulnerabilityHelper } from "@/bridge/model/Vulnerability";
import CenterFrameLabelView from "./CenterFrameLabelView";
import View from "./View";



export default class CenterFrameView  extends View {
    

    labels: Map<Position, CenterFrameLabelView> = new Map();

    constructor() {
        super(`<div class="center-frame"></div>`);

        const frame = new View("<div class='frame'></div>");
        this.addSubView(frame);

        PositionHelper.all().forEach(pos =>{
            const v = new CenterFrameLabelView(pos);
            this.labels.set(pos, v);
            frame.addSubView(v);
        })
    }

    public set vulnerability(value: Vulnerability){
        PositionHelper.all().forEach(pos => {
            const vul = VulnerabilityHelper.IsVulnerable(pos, value);
            this.labels.get(pos)?.root.toggleClass("label-vul", vul);
            this.labels.get(pos)?.root.toggleClass("label-nonvul", !vul);
        })
    }

}