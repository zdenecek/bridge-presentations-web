import { Game } from "@/bridge/model/Game";
import { PresentationPlayer } from "@/bridge/model/PresentationPlayer";
import { SuitHelper } from "@/bridge/model/Suit";
import { Application } from "@/presentations/class/Application";
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
      const b = new View(
        `<button><div class='content-label'></div><div class='hotkey-label'>(${this.hotkeys[i]})</div></button>`
      );
      this.buttons.push(b);
      b.on("click", () => this.handle(i));
      bs.addSubView(b);
    }

    const claimPanel = new View("<form  class='claim-panel'>");
    const claimInputView = new View(
      `<input  class="claim-input" type="number" placeholder="claim (claimed tricks NS)">`
    );
    const defocuser = new View(
      `<input type="checkbox" style="filter: opacity(0); width: 0px;">`
    );

    claimPanel.addSubView(claimInputView);
    claimPanel.addSubView(defocuser);
    this.addSubView(claimPanel);

    const claimInput = claimInputView.root as HTMLInputElement;

    gameView.onEachGame((game) => (this.game = game));
    claimPanel.on("submit", (e) => {
      e.preventDefault();
      const v = (claimInput as HTMLInputElement).value;
      if (v) this.game?.claim(parseInt(v as string));
      defocuser.root.focus();
    });

   window.addEventListener("keydown", (e) => {
      if (Application.state !== "presenter") return;

      if (document.activeElement === claimInput) {
        if (e.key.toLowerCase() === "c") {
          (claimPanel.root as HTMLFormElement).dispatchEvent(
            new Event("submit", { bubbles: true, cancelable: true })
          );
          e.preventDefault();
        }
        return;
      }

      for (let i = 0; i < 13; i++) {
        if (e.key === this.hotkeys[i]) {
          this.buttons[i].root.click();
          return;
        }
      }
      if (e.key.toLowerCase() === "c") {
        claimInput.focus();
        e.preventDefault();
        claimInput.value = "";
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
        button.toggleClass("clubs spades hearts diamonds", false);
        button.hide();

        if (index >= cards.length) {
          return;
        }
        button.toggleClass(
          SuitHelper.toString(cards[index].card.suit).toLowerCase(),
          true
        );
        const label = button.root.querySelector(
          ".content-label"
        ) as HTMLElement;
        label.innerText = cards[index].card.toShortString();
        (button.root as HTMLButtonElement).disabled = cards[index].played;
        button.root.hidden = false;
      });
    }
  }

  attachGame(game?: Game): void {
    if (!game) return;

    this.hide();

    Object.values(game.players).forEach((player) => {
      player.playRequested.sub((e) => {
        if (e.player instanceof PresentationPlayer) {
          this.player = e.player;
          this.show();
        } else this.player = undefined;
      });
    });

    game.stateChanged.sub(({ game }) => {
      this.hidden = game.state !== "cardplay";
    });
  }
}
