import { Card, CardValue } from "@/bridge/model/Card";
import { Hand } from "@/bridge/model/Hand";
import { Player } from "@/bridge/model/Player";
import { Position, PositionHelper, PositionList } from "@/bridge/model/Position";
import { PresentationGame, PresentationGameOptions } from "@/bridge/model/PresentationGame";
import { PresentationPlayer } from "@/bridge/model/PresentationPlayer";
import { Suit } from "@/bridge/model/Suit";


export function makeGameLogEvents(game: PresentationGame) {

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

}

export function makeTestGame(options?: PresentationGameOptions): PresentationGame {
    const players = {} as PositionList<Player>;
    PositionHelper.all().forEach((position) => {
      players[position] = new PresentationPlayer(position);
    });

    players[Position.North].hand = new Hand([
      new Card(Suit.Clubs, CardValue.Jack),
      new Card(Suit.Spades, CardValue.Jack),
    ]);
    players[Position.East].hand = new Hand([
      new Card(Suit.Diamonds, CardValue.Jack),
      new Card(Suit.Spades, CardValue.Queen),
    ]);
    players[Position.West].hand = new Hand([
      new Card(Suit.Hearts, CardValue.Jack),
      new Card(Suit.Spades, CardValue.King),
    ]);
    players[Position.South].hand = new Hand([
      new Card(Suit.Spades, CardValue.Jack),
      new Card(Suit.Spades, CardValue.Ace),
    ]);
    const game = new PresentationGame(players, options ?? PresentationGameOptions.Default);
    makeGameLogEvents(game);
    return game;
  }