    
import * as $ from "jquery";
import CardView from "./CardView";
import View from "./View";

export default class BaseView extends View {


    constructor(template:string) {
        super(template);

        CardView.initTestCard(this);
    }
}