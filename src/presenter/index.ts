import GameView from "./gui/GameView";
import { Card, Value } from "./model/Card"
import Game from "./model/Game";
import { Position } from "./model/Position";
import { Suit } from "./model/Suit"
import './styles/style.scss';
import * as $ from "jquery";
import { runLater } from "./utils/runLater";



jQuery( function () { 

    const gm = new Game();
    
    const gameView = new GameView();
    jQuery(window).on('resize', () => gameView.updatePositions());

    gameView.attach(gm)

    runLater(() => gm.startGame(Position.North));

});


