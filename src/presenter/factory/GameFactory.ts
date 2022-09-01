import { Player, PresentationPlayer } from "../model/Player";
import { PositionList, Position, Positions } from "../model/Position";
import Game from "../model/Game";
import Hand from "../model/Hand";
import { Card, Value } from "../model/Card";
import { Suit } from "../model/Suit";

export default class GameFactory {
    static makeTestGame(): Game {
        const players = {} as PositionList<Player>;
        Positions.all().forEach((position) => {
            players[position] = new PresentationPlayer(position);
        });

        players[Position.North].hand = new Hand([new Card(Suit.Clubs, Value.Jack), new Card(Suit.Spades, Value.Jack)]);
        players[Position.East].hand = new Hand([
            new Card(Suit.Diamonds, Value.Jack),
            new Card(Suit.Spades, Value.Queen),
        ]);
        players[Position.West].hand = new Hand([new Card(Suit.Hearts, Value.Jack), new Card(Suit.Spades, Value.King)]);
        players[Position.South].hand = new Hand([new Card(Suit.Spades, Value.Jack), new Card(Suit.Spades, Value.Ace)]);
        return GameFactory.makeObservableGame(players);
    }

    static makeObservableGame(players: PositionList<Player>): Game {
        const game = new Game(players);
        game.cardPlayed.sub((e) => {console.debug(`card played: ${e.card}`)});
        game.trickEnded.sub((e) => {console.debug(`trick ended: ${e.trick}`)});
        game.trickStarted.sub((e) => {console.debug(`trick started: ${e.trick}`)})
        game.biddingStarted.sub((e) => {console.debug(`bidding started`)})
        game.biddingEnded.sub((e) => {console.debug(`bidding ended: ${e.game.auction?.finalContract}`)})
        game.bidMade.sub((e) => {console.debug(`bid made: ${e.bid}`)})
        game.cardplayStarted.sub((e) => {console.debug(`cardplay started`)})
        game.cardplayEnded.sub((e) => {console.debug(`cardplay ended`)})
        game.gameStarted.sub((e) => {console.debug(`game started`)})
        game.gameEnded.sub((e) => {console.debug(`game ended`)})

        return game;
    }
}
