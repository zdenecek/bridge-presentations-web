import * as $ from "jquery";
import { Card } from "../../bridge/model/Card";
import { Hand } from "../../bridge/model/Hand";
import { Position } from "../../bridge/model/Position";
import CardView from "./CardView";
import View from "./View";


export default abstract class HandView extends View {
    public readonly position: Position;
    protected _dummy = false;
    protected _reversed = false;
    protected _cardViews: Map<Card, CardView>;
    protected _hand?: Hand;

    constructor(cardViews: Map<Card, CardView>, position: Position) {
        super(`<div class="hand hand-${position}"></div>`)
        this.position = position;
        this._cardViews = cardViews;
    }

    public set hand(hand: Hand) {
        this.hand = hand;
    }

    get reverse(): boolean {
        return this._reversed;
    }

    set reverse(value: boolean) {
        if (this._reversed === value) return;
        this._reversed = value;
        console.log(this.reverse);
        if (this._hand) this._hand.cards.forEach((c) => {
            const card = this._cardViews.get(c);
            if(card) card.reverse = value;
        });
        this.update();
    }

    public get dummy(): boolean {
        return this._dummy;
    }

    public set dummy(value: boolean) {
        if (this._dummy === value) return;
        this._dummy = value;
        if (this.dummy) this._reversed = false;
        this.update();
    }

    update(): void {
        if(!this._hand) return;
        if(!this._dummy || this.reverse) this.updateNonDummy();
        else this.updateDummy();
    }

    abstract updateDummy(): void;
    abstract updateNonDummy(): void;
    
}
