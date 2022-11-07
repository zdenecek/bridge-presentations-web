    
import { Game } from "@/bridge/model/Game";
import * as $ from "jquery";
import View from "./View";

export default class ControlPanel extends View {


    buttons: Array<View> ;
    hotkeys = "0123456789/*-";

    constructor() {
        super("<div class='control-panel'>");

        this.buttons = [];
        for(let i = 0; i < 13; i++) {
            const b = new View(`<button><div class='content-label'></div><div class='hotkey-label'>(${this.hotkeys[i]})</div></button>`);
            this.buttons.push(b);
            this.addSubView(b);
        }
    }

    attachGame(game?: Game) : void {
        if(!game) return;

        Object.entries(game.players).forEach(([pos, player]) => {
            player.playRequested.sub(() => {
                return;
            });
        })
    }
}