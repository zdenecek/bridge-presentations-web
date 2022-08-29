import { runLater } from "../utils/runLater";
import { Card, Value } from "./Card";
import Hand from "./Hand";
import { PresentationPlayer, Player } from "./Player";
import { Position, Positions, PositionList } from "./Position";
import {Suit} from "./Suit";
import Trick from "./Trick";
import { EventDispatcher, IEvent, ISimpleEvent, SimpleEventDispatcher } from 'strongly-typed-events'


export interface CardPlayedEvent {
    card: Card;
    trick: Trick;
    player: Player;
}

export default class GameManager {
    players!: PositionList<Player>;
    tricks: Array<Trick> = [];
    currentTrick: Trick | undefined;
    trumps: Suit = Suit.Notrump;

    positionToPlay: Position | undefined;

    private _cardPlayed = new SimpleEventDispatcher<CardPlayedEvent>();

    constructor() {
        this.players = {} as PositionList<Player>;

        this.players[Position.North] = new PresentationPlayer(
            Position.North,
            new Hand([new Card(Suit.Clubs, Value.Jack), new Card(Suit.Spades, Value.Jack)], Position.North)
        );
        this.players[Position.East] = new PresentationPlayer(
            Position.East,
            new Hand([new Card(Suit.Diamonds, Value.Jack), new Card(Suit.Spades, Value.Queen)], Position.East)
        );
        this.players[Position.West] = new PresentationPlayer(
            Position.West,
            new Hand([new Card(Suit.Hearts, Value.Jack), new Card(Suit.Spades, Value.King)], Position.West)
        );
        this.players[Position.South] = new PresentationPlayer(
            Position.South,
            new Hand([new Card(Suit.Spades, Value.Jack), new Card(Suit.Spades, Value.Ace)], Position.South)
        );
    }

    // Events

    get cardPlayed(): ISimpleEvent<CardPlayedEvent> {
        return this._cardPlayed.asEvent() 
    }

    player(position: Position): Player {
        return this.players[position];
    }

    nextPlayer(player: Player): Player {
        const nextPos = Positions.nextPosition(player.position);
        return this.player(nextPos);
    }

    get allPlayers(): Player[] {
        return Object.values(this.players);
    } 

    startGame(firstToPlay: Position): void {
        console.debug("Starting game");
        this.startNewTrick(firstToPlay);
    }

    endGame() {
        console.debug("Ending game");
    }

    startNewTrick(firstToPlay: Position): void {
        console.debug("Starting new trick, first to play is " + Positions.toString(firstToPlay));
        const trick = new Trick(firstToPlay);
        const player = this.players[firstToPlay];
        this.currentTrick = trick;
        this.tricks.push(trick);

        player.requestPlay(trick, (card: Card) => this.addCard(trick, card, player));
    }

    endTrick(): void {
        const winner = this.currentTrick!.winner(this.trumps);
        this.currentTrick = undefined;

        console.debug("Ending trick " + this.tricks.length.toString());
        
        if(this.players[Position.North].hand.cards.length > 0) {
            runLater((() => this.startNewTrick(winner!)).bind(this));
        }
        else {
            runLater(() => this.endGame());
        }
    }

    addCard(trick: Trick, card: Card, player: Player): boolean {
        
        // TODO check follow suit

        trick.addCard(card);
        runLater(() => this._cardPlayed.dispatch({card, trick, player}));
        
        if (trick.isFinished) runLater(() => this.endTrick());
        else {
            const nextPlayer = this.nextPlayer(player);
            nextPlayer.requestPlay(trick, (card: Card) => this.addCard(trick, card, nextPlayer));
        }
        return true;
    }
}
