
import { Position, PositionHelper } from "./Position";
import { Suit } from "./Suit";
import { Trick } from "./Trick";


export class PresentationTrick extends Trick {
    
    constructor(firstToPlay: Position, trumps: Suit, private activePositions: Array<Position> = PositionHelper.all()) {
        super(firstToPlay, trumps);
    }

    get isFinished(): boolean {
        return this.cards.length == this.activePositions.length;
    }

    protected nextToPlay(): Position | undefined {
        if (this.currentToPlay === undefined) throw Error("Error, cannot play card in finished trick");
        return this.isFinished ? undefined :  PositionHelper.nextPosisitionFrom(this.activePositions, this.currentToPlay);
        
    }

}
