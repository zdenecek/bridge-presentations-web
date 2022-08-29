enum Position {
    North = "north" ,
    East = 'east',
    South = 'south',
    West = 'west',
}

class Positions {

    static nextPosition(position: Position): Position {

        switch(position) {
            case Position.North: return Position.East;
            case Position.East: return Position.South;
            case Position.South: return Position.West;
            case Position.West: return Position.North;
        }
    }

    static NS(position: Position): boolean {
        return position === Position.North || position === Position.East ;
    }

    static toString(position: Position): string {
        return Object.keys(Position)[Object.values(Position).indexOf(position)];;
    }

    static all(): Array<Position> {
        // no idea
        return [
            Position.North, 
            Position.East,
            Position.South,
            Position.West
        ];
    }
}

type PositionList<T> = { [key in Position]: T }
type PartialPositionList<T> = { [key in Position]?: T }

export { Position, Positions, PositionList, PartialPositionList};
