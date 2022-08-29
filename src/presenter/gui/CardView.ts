import { Card, Values } from "../model/Card";
import { Suits } from "../model/Suit";
import $ from "jquery";
import { Point } from "./Point";

export default class CardView {
    static images = require.context("@/presenter/assets/cards", false, /\.(png|jpe?g|svg)$/);

    model: Card;
    element: JQuery<HTMLElement>;
    private _onclick: (() => void) | undefined;

    constructor(model: Card) {
        this.model = model;
        model.playableChanged.sub(this.updatePlayable.bind(this));
        this.element = $(`
            <div class="card">
                <img src='${this.cardPath}'>
            </div>
        `);
    }

    public set position(value: Point) {
        this.element.css("transition", "ease 1s")
        this.element.css(value.asCoords());
    }

    public set onclick(value: (() => void)  | undefined) {
        this.element.off("click.cardplayed");
        if(!value) return;
        this.element.on("click.cardplayed",() => value());
    }

    private updatePlayable() {
        if (this.model.playable) {
            this.element.addClass("playable");
        } else {
            this.element.removeClass("playable");
        }
    }

    get cardPath(): string {
        const s = Suits.toString(this.model.suit).charAt(0).toUpperCase();
        const v =
            this.model.value <= 9
                ? this.model.value.toString()
                : Values.toString(this.model.value).charAt(0).toUpperCase();
        return CardView.images(`./${s}-${v}.png`);
    }
}
