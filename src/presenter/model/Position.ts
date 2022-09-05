enum Position {
    North = "north" ,
    East = 'east',
    South = 'south',
    West = 'west',
}

enum Side {
    NS =  'ns',
    EW = 'ew',
}

class Positions {

    static nextPosition(position: Position, count = 1): Position {

        if(count == 0) return position;
        let pos: Position;
        switch(position) {
            case Position.North: pos = Position.East; break;
            case Position.East: pos = Position.South; break;
            case Position.South: pos = Position.West; break;
            case Position.West: pos = Position.North; break;
        }

        return Positions.nextPosition(pos, count - 1);
    }

    static side(position: Position): Side  {
        return position === Position.North || position === Position.South  ? Side.NS : Side.EW;
    }


    static toString(position: Position): string {
        return Object.keys(Position)[Object.values(Position).indexOf(position)];
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

export { Position, Positions, PositionList, PartialPositionList, Side};
