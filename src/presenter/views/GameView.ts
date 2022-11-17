import { Game, GameEvent } from "../../bridge/model/Game";
import { Card } from "../../bridge/model/Card";
import { Position, PositionList, PositionHelper } from "../../bridge/model/Position";
import { ISimpleEvent, SimpleEventDispatcher } from "ste-simple-events";

import CardView from "./CardView";
import BaseView from "./BaseView";
import { UndoableGame } from "@/bridge/model/UndoableGame";

export interface GameChangedEvent {
    game?: Game;
}

export interface GameViewEvent {
    gameView: GameView;
}

export interface PositionEvent {
    position: Position;
}

export type DummyOptions = "static" | "auto" | "none";

export default class GameView extends BaseView {
    private _game?: Game;
    private _dummy?: Position | undefined;

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

    public toggleVisible(position: Position): void {
        this._visibilityToggle.dispatch({ position });
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

    public get game(): Game | undefined {
        return this._game;
    }

    public onEachGame(action: (game: Game) => void): void {
        this.gameChanged.sub(({ game }) => {
            if (game) action(game);
        });
    }

    public attachGame(game: Game | undefined, dummy: DummyOptions = "auto", staticDummyPosition?: Position): void {
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

        game.cardPlayed.sub((e) => {
            this.update();
        });

        if (game instanceof UndoableGame) {
           game.undoMade.sub((e) => this.update());
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
        if (this.game?.result?.madeTricks) s += `${this.game.result.madeTricks}\n`;
        if (this.game?.result) s += `${this.game.result.scoreDeclarer}\n`;
        s += "Well done!";
        return s;
    }
}
