import { Player } from "../model/Player";
import { PositionList, Position, PositionHelper } from "../model/Position";
import { Hand } from "../model/Hand";
import { Card, CardValue } from "../model/Card";
import { Suit } from "../model/Suit";
import { PresentationPlayer } from "../model/PresentationPlayer";
import { Vulnerability } from "../model/Vulnerability";
import { PresentationGame, PresentationGameOptions } from "../model/PresentationGame";

export default class GameFactory {
  static makeTestGame(): PresentationGame {
    const players = {} as PositionList<Player>;
    PositionHelper.all().forEach((position) => {
      players[position] = new PresentationPlayer(position);
    });

    players[Position.North].hand = new Hand([new Card(Suit.Clubs, CardValue.Jack), new Card(Suit.Spades, CardValue.Jack)]);
    players[Position.East].hand = new Hand([new Card(Suit.Diamonds, CardValue.Jack), new Card(Suit.Spades, CardValue.Queen)]);
    players[Position.West].hand = new Hand([new Card(Suit.Hearts, CardValue.Jack), new Card(Suit.Spades, CardValue.King)]);
    players[Position.South].hand = new Hand([new Card(Suit.Spades, CardValue.Jack), new Card(Suit.Spades, CardValue.Ace)]);
    return GameFactory.makeObservableGame(players, PresentationGameOptions.Default);
  }

  static makeGame(players: PositionList<Player>, vulnerability: Vulnerability, options: PresentationGameOptions): PresentationGame {
    const game = new PresentationGame(players, options, vulnerability);

    return game;
  }

  static makeObservableGame(players: PositionList<Player>, options: PresentationGameOptions, vul = Vulnerability.None): PresentationGame {
    const game = this.makeGame(players, vul, options);
    game.cardPlayed.sub((e) => {
      console.debug(`card played: ${e.card}`);
    });
    game.trickEnded.sub((e) => {
      console.debug(`trick ended: ${e.trick}`);
    });
    game.trickStarted.sub((e) => {
      console.debug(`trick started: ${e.trick}`);
    });
    game.biddingStarted.sub(() => {
      console.debug(`bidding started`);
    });
    game.biddingEnded.sub((e) => {
      console.debug(`bidding ended: ${e.game.auction?.finalContract}`);
    });
    game.bidMade.sub((e) => {
      console.debug(`bid made: ${e.bid}`);
    });
    game.cardplayStarted.sub(() => {
      console.debug(`cardplay started`);
    });
    game.cardplayEnded.sub(() => {
      console.debug(`cardplay ended`);
    });
    game.gameStarted.sub(() => {
      console.debug(`game started`);
    });
    game.gameEnded.sub(() => {
      console.debug(`game ended`);
    });
    game.undoMade.sub(() => {
      console.debug(`undo made`);
    });
    game.stateChanged.sub((e) => {
      console.debug(`state changed to: ${e.game.state}`);
    });
    return game;
  }
}
