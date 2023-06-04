import { Game } from "@/bridge/model/Game";
import { PresentationPlayer } from "@/bridge/model/PresentationPlayer";
import { SuitHelper } from "@/bridge/model/Suit";
import { Application } from "@/presentations/class/Application";
import * as $ from "jquery";
import GameView from "./GameView";
import View from "./View";

export default class ControlPanel extends View {
  buttons: Array<View>;
  hotkeys = "0123456789/*-";
  private game?: Game;

  constructor(gameView: GameView) {
    super("<div class='control-panel'>");

    const bs = new View("<div class='buttons'>");
    this.addSubView(bs);
    this.buttons = [];
    for (let i = 0; i < 13; i++) {
      const b = new View(`<button><div class='content-label'></div><div class='hotkey-label'>(${this.hotkeys[i]})</div></button>`);
      this.buttons.push(b);
      b.root.on("click", () => this.handle(i));
      bs.addSubView(b);
    }

    const claimPanel = new View("<form  class='claim-panel'>");
    const claimInput = new View(`<input  class="claim-input" type="number" placeholder="claim (claimed tricks NS)">`);
    const defocuser = new View(`<input type="checkbox" style="filter: opacity(0); width: 0px;">`);

    claimPanel.addSubView(claimInput);
    claimPanel.addSubView(defocuser);
    this.addSubView(claimPanel);

    gameView.onEachGame((game) => (this.game = game));
    claimPanel.root.on("submit", (e) => {
      e.preventDefault();
      const v = claimInput.root.val();
      if (v) this.game?.claim(parseInt(v as string));
      defocuser.root.trigger("focus");
    });

    $.default(window).on("keydown", (e) => {
      if (Application.state !== "presenter") return;

      if (claimInput.root.is(":focus")) {
        if (e.key.toLowerCase() === "c") {
          claimPanel.root.trigger("submit");
          e.preventDefault();
        }
        return;
      }

      for (let i = 0; i < 13; i++) {
        if (e.key === this.hotkeys[i]) {
          this.buttons[i].root.trigger("click");
          return;
        }
      }
      if (e.key.toLowerCase() === "c") {
        claimInput.root.trigger("focus");
        e.preventDefault();
        claimInput.root.val("");
      }
    });
  }

  private handle(index: number) {
    if (!this.player) return;

    const cards = this.player.hand.cardsWithPlayInfo;
    if (cards.length > index && cards[index].played === false) {
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
      const cards = value.hand.cardsWithPlayInfo;
      this.buttons.forEach((button, index) => {
        if (index >= this.buttons.length) return;
        button.root.toggleClass("clubs spades hearts diamonds", false);
        button.root.prop("hidden", true);

        if (index >= cards.length) {
          return;
        }
        button.root.children(".content-label")[0].innerText = cards[index].card.toShortString();
        button.root.toggleClass(SuitHelper.toString(cards[index].card.suit).toLowerCase(), true);
        button.root.prop("disabled", cards[index].played);
        button.root.prop("hidden", false);
      });
    }
  }

  attachGame(game?: Game): void {
    if (!game) return;

    this.root.hide();

    Object.values(game.players).forEach((player) => {
      player.playRequested.sub((e) => {
        if (e.player instanceof PresentationPlayer) {
          this.player = e.player;
          this.root.show();
        } else this.player = undefined;
      });
    });

    game.stateChanged.sub(({ game }) => {
      this.hidden = game.state !== "cardplay";
    });
  }
}
