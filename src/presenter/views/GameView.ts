import { GameEvent } from "../../bridge/model/Game";
import { Position, PositionHelper } from "../../bridge/model/Position";
import { ISimpleEvent, SimpleEventDispatcher } from "ste-simple-events";

import BaseView from "./BaseView";
import { UndoableGame } from "@/bridge/model/UndoableGame";
import { PresentationGame } from "@/bridge/model/PresentationGame";

export interface GameChangedEvent {
  game?: PresentationGame;
}

export interface GameViewEvent {
  gameView: GameView;
}

export interface PositionEvent {
  position: Position;
  value?: boolean;
}

export type DummyOptions = "static" | "auto" | "none";

export default class GameView extends BaseView {
  private _game?: PresentationGame;
  private _dummy?: Position | undefined;

  public endMessage?: string;

  constructor() {
    super("<div class='presenter-app'></div>");
  }

  protected _updateDispatched = new SimpleEventDispatcher<GameEvent>();

  public get updateDispatched(): ISimpleEvent<GameEvent> {
    return this._updateDispatched.asEvent();
  }

  private _visibilityToggle = new SimpleEventDispatcher<PositionEvent>();
  public get visibilityToggle(): ISimpleEvent<PositionEvent> {
    return this._visibilityToggle.asEvent();
  }

  public toggleVisible(position: Position, value?: boolean): void {
    this._visibilityToggle.dispatch({ position, value });
  }

  private _dummyChanged = new SimpleEventDispatcher<GameViewEvent>();
  public get dummyChanged(): ISimpleEvent<GameViewEvent> {
    return this._dummyChanged.asEvent();
  }

  public get dummy(): Position | undefined {
    return this._dummy;
  }

  public set dummy(value: Position | undefined) {
    if (this._dummy === value) return;
    this._dummy = value;
    this._dummyChanged.dispatch({ gameView: this });
  }

  private _gameChanged = new SimpleEventDispatcher<GameChangedEvent>();
  public get gameChanged(): ISimpleEvent<GameChangedEvent> {
    return this._gameChanged.asEvent();
  }

  public get game(): PresentationGame | undefined {
    return this._game;
  }

  public onEachGame(action: (game: PresentationGame) => void): void {
    this.gameChanged.sub(({ game }) => {
      if (game) action(game);
    });
  }

  public attachGame(game: PresentationGame | undefined, dummy: DummyOptions = "auto", staticDummyPosition?: Position): void {
    if (!this.root) throw new Error("root not attached");
    this._game = game;
    this._gameChanged.dispatch({ game });
    if (!game) return;

    this.dummy = undefined;

    if (dummy === "auto" || game.bidding) {
      game.leadMade.sub((e) => {
        this.dummy = PositionHelper.nextPosition(e.player.position);
      });
    } else if (dummy === "static" && staticDummyPosition) {
      this.dummy = staticDummyPosition;
    }

    game.cardPlayed.sub(() => {
      this.update();
    });

    game.claimMade.sub(() => this.update());

    if (game instanceof UndoableGame) {
      game.undoMade.sub(() => {
        this.update();
        if (game.state === "bidding" || game.tricks?.[0]?.cards.length === 0) this.dummy = undefined;
      });
    }

    this.update();
  }

  update(): void {
    if (this.game === undefined) return;

    this._updateDispatched.dispatch({ game: this.game });
  }

  getEndText(): string {
    let s = "";
    if (this.game?.finalContract) s += `${this.game.finalContract.toString()}\n`;
    if (this.game?.result?.tricksMade) s += `${this.game.result.resultString}\n`;
    if (this.game?.result) s += `${this.game.result.scoreNS}\n`;
    if (this.endMessage) s += this.endMessage + "\n";
    return s;
  }
}
