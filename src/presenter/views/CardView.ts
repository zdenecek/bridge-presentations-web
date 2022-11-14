import { Card, CardValue, CardValueHelper } from "../../bridge/model/Card";
import { SuitHelper } from "../../bridge/model/Suit";
import { Point } from "../classes/Point";
import { Rotation } from "../classes/Rotation";
import View from "./View";
import BaseView from "./BaseView";

export default class CardView  extends View {
    static images = require.context("@/presenter/assets/cards", false, /\.(png|jpe?g|svg)$/);

    static getCardPath(model: Card): string {
        if(model.value === CardValue.Other)  return CardView.images('./O.png');
        const s = SuitHelper.toString(model.suit).charAt(0).toUpperCase();
        const v =
            model.value <= 9
                ? model.value.toString()
                : CardValueHelper.toString(model.value).charAt(0).toUpperCase();
        return CardView.images(`./${s}-${v}.png`);
    }

    static get width(): number {
        return this.testCard?.width ?? 0;
    }

    static get height(): number {
        return this.testCard?.height ?? 0;
    }

    private static testCard?: CardView;

    static initTestCard(view: BaseView) : void {
        this.testCard = new CardView(new Card());
        view.addSubView(this.testCard);
        this.testCard.root.addClass("test-card");
    }

    model: Card;

    constructor(model: Card) {
        super(`
        <div class="card">
        <img class="front" src='${CardView.getCardPath(model)}'>
        <img class="back" src='${CardView.images("./back.png")}'>
        </div>
        `);
        this.model = model;
    }


    public set  position(value: Point) {
        this.root.css(value.asCoords());
    }

    public set onclick(value: (() => void)  | undefined) {
        this.root.off("click.cardplayed");
        if(!value) return;
        this.root.on("click.cardplayed",() => {
            if(this._reverse) value();
        });
    }

    public set playable(value: boolean) {
        if (value) {
            this.root.addClass("playable");
        } else {
            this.root.removeClass("playable");
        }
    }

    private _hidden = false;
    
    get hidden(): boolean {
        return this._hidden;
    }

    set hidden(value: boolean) {
        if(this.hidden === value) return;
        this._hidden = value;
        if(value) this.root.hide()
        else this.root.show()
    }

    set rotation(value: Rotation) {
        this.root.removeClass("horizontal-left horizontal-rigth vertical-upside")
        if(value ===Rotation.Left) this.root.addClass("horizontal-left");
        else if(value ===Rotation.Right) this.root.addClass("horizontal-right");
        else if(value ===Rotation.Upside) this.root.addClass("vertical-upside");
    }

    private _reverse = false;

    get reverse(): boolean {
        return this._reverse;
    }

    set reverse(value: boolean) {
        this.hidden = false;
        if(this.reverse === value) return;
        this._reverse = value;
        this.root.toggleClass('reverse', value)
    }
}                                                                                      