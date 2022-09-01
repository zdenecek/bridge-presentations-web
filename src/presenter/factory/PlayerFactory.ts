import { Parser } from "../utils/Parser";
import Hand from "../model/Hand";
import { Player, PresentationPlayer } from "../model/Player";
import { Position, PositionList, Positions } from "../model/Position";

export default class PlayerFactory {

    static makePlayers(): PositionList<Player> {
        const players = {} as PositionList<Player>;
        players[Position.North] = new PresentationPlayer(Position.North);
        players[Position.East] = new PresentationPlayer(Position.East);
        players[Position.South] = new PresentationPlayer(Position.South);
        players[Position.West] = new PresentationPlayer(Position.West);
        
        return players;
    }

    static putHands(players: PositionList<Player>, cards: PositionList<string>) {
        Positions.all().forEach(position => {
            const _cards = Parser.parseHandString(cards[position]);
            players[position].hand = new Hand(_cards);
        })
    }
}