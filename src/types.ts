import { Position } from "./presenter/model/Position";
import { Suit } from "./presenter/model/Suit";

export type configuratorOptions = {
    cards: {
        north: string;
        east: string;
        south: string;
        west: string;
    };
    firstPlayer: Position;
    bidding: boolean;
    trumps?: Suit;
    dummy?: DummyOptions;
    staticDummyPosition?: Position;
};

export type DummyOptions = 'static' | 'auto' | 'none';
