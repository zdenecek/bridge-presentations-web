import { Card, CardValue, CardValueHelper } from "../../bridge/model/Card";
import { SuitHelper } from "../../bridge/model/Suit";
import { Point } from "../classes/Point";
import { Orientation } from "../classes/Orientation";
import View from "./View";
import BaseView from "./BaseView";

export default class CardView extends View {
  static _images = import.meta.glob(['@/presenter/assets/cards/*.png'], { eager: true });
  // TODO: prettify
  static images(path: string): string {
    return (CardView._images["/src/presenter/assets/cards/" + path + ".png"] as any).default as string;
  }

  static getCardPath(model: Card): string {
    if (model.value === CardValue.Other) return CardView.images("O");
    const s = SuitHelper.toString(model.suit).charAt(0).toUpperCase();
    const v = model.value <= 9 && model.value >= 2 ? model.value.toString() : CardValueHelper.toString(model.value).charAt(0).toUpperCase();
    return CardView.images(`${s}-${v}`);
  }

  static get width(): number {
    return this.testCard?.width ?? 0;
  }

  static get height(): number {
    return this.testCard?.height ?? 0;
  }

  private static testCard?: CardView;

  static initTestCard(view: HTMLElement): void {
    this.testCard = new CardView(new Card());
    console.log("testCard", this.testCard);
    view.appendChild(this.testCard.root[0]);
    this.testCard.root.addClass("test-card");
  }

  model: Card;

  constructor(model: Card) {
    super(`
        <div class="card">
        <img class="front" src='${CardView.getCardPath(model)}'>
        <img class="back" src='${CardView.images("back")}'>
        </div>
        `);
    this.model = model;
  }

  public set onclick(value: (() => void) | undefined) {
    this.root.off("click.cardplayed");
    if (!value) return;
    this.root.on("click.cardplayed", () => {
      if (!this._reverse) value();
    });
  }

  public setPlayable(value: boolean, dummy = false): void {
    if (value) {
      this.root.addClass(dummy ? "playable-dummy" : "playable");
    } else {
      this.root.removeClass("playable playable-dummy");
    }
  }

  _position: Point = new Point(0, 0);

  public set position(value: Point) {
    this._position = value;
    this.updateTransform();
  }

  private _rotation = Orientation.Up;
  private static rotations = {
    [Orientation.Left]: "rotate(-90deg) translateX(-100%)",
    [Orientation.Right]: "rotate(90deg) translateY(-100%)",
    [Orientation.Down]: "rotate(180deg)",
    [Orientation.Up]: "",
  };

  set rotation(value: Orientation) {
    this._rotation = value;
    this.updateTransform();
  }

  private updateTransform(): void {
    this.root.css("transform", this._position.asTransform() + " " + CardView.rotations[this._rotation]);
  }

  private _reverse = false;

  get reverse(): boolean {
    return this._reverse;
  }

  set reverse(value: boolean) {
    this.hidden = false;
    if (this.reverse === value) return;
    this._reverse = value;
    this.root.toggleClass("reverse", value);
  }
}
