import { Card, Value, Values } from "../model/Card";
import { Suits } from "../model/Suit";
import $ from "jquery";
import { Point } from "./Point";

export default class CardView {
    static images = require.context("@/presenter/assets/cards", false, /\.(png|jpe?g|svg)$/);

    model: Card;
    element: JQuery<HTMLElement>;
    private imageElement: HTMLImageElement;
    private _onclick: (() => void) | undefined;
    private cardPath: string;
    private backPath = CardView.images("./back.png");	
    private _reverse = true;

    constructor(model: Card) {
        this.model = model;
        this.cardPath = this.getCardPath();
        this.element = $(`
            <div class="card">
                <img class="front" src='${this.cardPath}'>
                <img class="back" src='${this.backPath}'>
            </div>
        `);
        this.imageElement = this.element.find("img")[0];
    }

    private getCardPath() {
        if(this.model.value === Value.Other)  return CardView.images('./O.png');
        const s = Suits.toString(this.model.suit).charAt(0).toUpperCase();
        const v =
            this.model.value <= 9
                ? this.model.value.toString()
                : Values.toString(this.model.value).charAt(0).toUpperCase();
        return CardView.images(`./${s}-${v}.png`);
    }

    public set position(value: Point) {
        this.element.css(value.asCoords());
    }

    public set onclick(value: (() => void)  | undefined) {
        this.element.off("click.cardplayed");
        if(!value) return;
        this.element.on("click.cardplayed",() => {
            if(this._reverse) value();
        });
    }

    public set playable(value: boolean) {
        if (value) {
            this.element.addClass("playable");
        } else {
            this.element.removeClass("playable");
        }
    }

    private _hidden = false;
    
    get hidden(): boolean {
        return this._hidden;
    }

    set hidden(value: boolean) {
        if(this.hidden === value) return;
        this._hidden = value;
        if(value) this.element.hide()
        else this.element.show()
    }

    get reverse(): boolean {
        return this._reverse;
    }


    set reverse(value: boolean) {
        this.hidden = false;
        if(this.reverse === value) return;
        this._reverse = value;
        if(!value) {
            this.element.addClass('reverse')
        } else {
            this.element.removeClass('reverse')
        }
    }
}
