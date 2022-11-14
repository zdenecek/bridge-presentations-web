import { Game } from "@/bridge/model/Game";
import { Player } from "@/bridge/model/Player";
import { PresentationPlayer } from "@/bridge/model/PresentationPlayer";
import * as $ from "jquery";
import View from "./View";

export default class ControlPanel extends View {
    buttons: Array<View>;
    hotkeys = "0123456789/*-";

    constructor() {
        super("<div class='control-panel'>");

        this.buttons = [];
        for (let i = 0; i < 13; i++) {
            const b = new View(
                `<button><div class='content-label'></div><div class='hotkey-label'>(${this.hotkeys[i]})</div></button>`
            );
            this.buttons.push(b);
            b.root.on("click", () => this.handle(i));
            this.addSubView(b);
        }

        $.default(window).on("keydown", (e) => {
            for (let i = 0; i < 13; i++) {
                if (e.key === this.hotkeys[i]) this.buttons[i].root.trigger("click");
            }
        });
    }

    private handle(index: number) {
        if (!this.player) return;

        const cards = this.player.hand.cardsWithPlayInfo;
        if (cards.length >= index && cards[index].played === false) {
            if (this.player.playCard(cards[index].card)) this.player = undefined;
        }
    }


    private _player?: PresentationPlayer;
    private get player(): PresentationPlayer | undefined {
        return this._player;
    }
    private set player(value: PresentationPlayer | undefined) {
        this._player = value;
        if (value) {
            value.hand.cardsWithPlayInfo.forEach((card, index) => {
                if (index >= this.buttons.length) return;
                this.buttons[index].root.children(".content-label")[0].innerText = card.card.toShortString();
                this.buttons[index].root.prop("disabled", card.played);
            });
        }
    }

    attachGame(game?: Game): void {
        if (!game) return;

        Object.entries(game.players).forEach(([pos, player]) => {
            player.playRequested.sub((e) => {
                if (e.player instanceof PresentationPlayer) this.player = e.player;
                else this.player = undefined;
            });
        });
    }
}
