import { ISimpleEvent, SimpleEventDispatcher } from "ste-simple-events";
import { runLater } from "../utils/runLater";
import { Auction } from "./Auction";
import { Bid } from "./Bid";
import { Card } from "./Card";
import Game, { GameEvent } from "./Game";
import { Player } from "./Player";
import { Position, Positions } from "./Position";
import Trick, { CardInTrick } from "./Trick";
import { UndoableAuction } from "./UndoableAuction";

export class UndoableGame extends Game {
    private _undoMade = new SimpleEventDispatcher<GameEvent>();

    public get undoMade(): ISimpleEvent<GameEvent> {
        return this._undoMade.asEvent();
    }

    public undo(): void {
        switch (this.state) {
            case "notStarted":
                return;
            case "bidding":
                this.undoBidding();
                break;
            case "cardplay":
                this.undoCardplay();
                break;
            case "finished":
                this.undoGameEnded();
                break;
        }
    }

    protected makeAuction(dealer: Position): Auction {
        return new UndoableAuction(dealer);
    }

    private undoBidding(): void {
        const lastBid = (this.auction as UndoableAuction).undo();
        if (!lastBid) return;

        this.currentlyRequestedPlayer?.cancelRequestToBid();

        runLater(() => this._undoMade.dispatch({ game: this }));
        runLater(() => {
            this.currentlyRequestedPlayer = this.players[lastBid.position];
            this.players[lastBid.position].requestBid(this, (player: Player, bid: Bid) => this.addBid(bid, player));
        });
    }

    private undoCardplay(): void {
        if (this.tricks.length === 0) return;

        let lastTrick = this.tricks[this.tricks.length - 1];

        this.currentlyRequestedPlayer?.cancelRequestToPlay();

        if (lastTrick.cards.length === 0) {
            this.tricks.pop();
        }

        if (this.tricks.length === 0) {
            if(this.bidding) {
                this.state = "bidding";
                this.undoBidding();
            }
            else {
                this.startNewTrick(lastTrick.firstToPlay);
                runLater(() => this._undoMade.dispatch({ game: this }));
            }
        } else {
            lastTrick = this.tricks[this.tricks.length - 1];
            const lastCard = this.popCard(lastTrick)!;
            this.players[lastCard.player].hand.addCard(lastCard.card);
            lastTrick.currentToPlay = lastCard.player;
            
            runLater(() => this._undoMade.dispatch({ game: this }));
            runLater(() => {
                this.currentlyRequestedPlayer = this.players[lastCard.player];
                this.currentlyRequestedPlayer.requestPlay(this, lastTrick, (player: Player, card: Card) => this.addCard(lastTrick, card, player));
                
            });
        }
    }

    private undoGameEnded(): void {
        //TODO check if passed
        this.state = "cardplay";
        this.undoCardplay();
    }

    private popCard(trick: Trick): CardInTrick | undefined {
        const lastCard = trick.cards.pop();
        if (lastCard) {
            delete trick.cardsByPosition[lastCard.player];
            trick.currentToPlay = lastCard.player;
        }
        return lastCard;
    }
}
