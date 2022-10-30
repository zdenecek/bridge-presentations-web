import { Parser } from "../utils/Parser";
import {Hand} from "../model/Hand";
import { Position, PositionList, PositionHelper } from "../model/Position";
import { PresentationPlayer } from "../model/PresentationPlayer";
import { Player } from "../model/Player";

export default class PlayerFactory {
    static makePlayers(): PositionList<Player> {
        const players = {} as PositionList<Player>;
        players[Position.North] = new PresentationPlayer(Position.North);
        players[Position.East] = new PresentationPlayer(Position.East);
        players[Position.South] = new PresentationPlayer(Position.South);
        players[Position.West] = new PresentationPlayer(Position.West);

        return players;
    }

    static makeObservablePlayers(): PositionList<Player> {
        const players = PlayerFactory.makePlayers();

        Object.values(players).forEach((player) => {
            player.bidRequested.sub((e) => console.debug(`A bid has been requested from player ${player.position}`, e));
            player.bidRequestCancelled.sub(() =>
                console.debug(`A bid request has been cancelled from player ${player.position}`)
            );
            player.playRequested.sub((e) =>
                console.debug(`A play has been requested from player ${player.position}`, e)
            );
            player.playRequestCancelled.sub(() =>
                console.debug(`A play request has been cancelled from player ${player.position}`)
            );
        });

        return players;
    }

    static putHands(players: PositionList<Player>, cards: PositionList<string>): void {
        PositionHelper.all().forEach((position) => {
            const _cards = Parser.parseHandString(cards[position]);
            players[position].hand = new Hand(_cards);
        });
    }
}
