import { ISimpleEvent, SimpleEventDispatcher } from "ste-simple-events";
import { runLater } from "../utils/runLater";
import { Auction } from "./Auction";
import { Bid } from "./Bid";
import { Card } from "./Card";
import { Game, GameEvent } from "./Game";
import { Player } from "./Player";
import { Position } from "./Position";
import { Trick, CardInTrick } from "./Trick";
import { UndoableAuction } from "./UndoableAuction";

export class UndoableGame extends Game {
    protected _undoMade = new SimpleEventDispatcher<GameEvent>();

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

    protected undoBidding(): void {
        const lastBid = (this.auction as UndoableAuction).undo();
        if (!lastBid) return;

        this.currentlyRequestedPlayer?.cancelRequestToBid();

        runLater(() => this._undoMade.dispatch({ game: this }));
        runLater(() => {
            this.currentlyRequestedPlayer = this.players[lastBid.position];
            this.players[lastBid.position].requestBid(this, (player: Player, bid: Bid) => this.addBid(bid, player));
        });
    }

    protected undoCardplay(): void {
        if (this.tricks.length === 0) return;

        let lastTrick = this.tricks[this.tricks.length - 1];

        this.currentlyRequestedPlayer?.cancelRequestToPlay();

        if (lastTrick.cards.length === 0) {
            this.tricks.pop();
        }

        if (this.tricks.length === 0) {
            this.state = "bidding";
            this.undoBidding();
            
        } else {
            lastTrick = this.tricks[this.tricks.length - 1];
            const lastCard = this.popCard(lastTrick)!;
            this.players[lastCard.player].hand._cards.find(c => c.card === lastCard.card)!.played = false;
            lastTrick.currentToPlay = lastCard.player;
            
            runLater(() => this._undoMade.dispatch({ game: this }));
            if(lastTrick.cards.length === 3) 
            runLater(() => this._trickCountChanged.dispatch({ game: this }));

            runLater(() => {
                this.currentlyRequestedPlayer = this.players[lastCard.player];
                this.currentlyRequestedPlayer.requestPlay(this, lastTrick, (player: Player, card: Card) => this.addCard(lastTrick, card, player));
                
            });
        }
    }

    protected undoClaim(): void {
        this.claimed = false;
        this.claimedTricks = { ns: 0, ew: 0};
        runLater(() => this._undoMade.dispatch({ game: this }));
        runLater(() => this._trickCountChanged.dispatch({ game: this }));
        const lastTrick = this.tricks[this.tricks.length - 1];
        runLater(() => {
            if(lastTrick.currentToPlay == undefined) throw new Error("No current player");
            this.currentlyRequestedPlayer = this.players[lastTrick.currentToPlay];
            this.currentlyRequestedPlayer.requestPlay(this, lastTrick, (player: Player, card: Card) => this.addCard(lastTrick, card, player)); 
        });
    }

    protected undoGameEnded(): void {
        if(this.finalContract == 'passed') {
            this.state = 'bidding';
            this.undoBidding();
        }
        else if(this.claimed) {
            this.state = 'cardplay';
            this.undoClaim();
        }
        else {
            this.state = "cardplay";
            this.undoCardplay();
        }
    }

    protected popCard(trick: Trick): CardInTrick | undefined {
        const lastCard = trick.cards.pop();
        if (lastCard) {
            delete trick.cardsByPosition[lastCard.player];
            trick.currentToPlay = lastCard.player;
        }
        return lastCard;
    }
}
