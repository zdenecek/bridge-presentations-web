import { Contract } from "@/bridge/model/Contract";
import { Position } from "@/bridge/model/Position";
import { Suit } from "@/bridge/model/Suit";
import { Vulnerability } from "@/bridge/model/Vulnerability";
import { DummyOptions } from "@/presenter/views/GameView";

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
    contract?: Contract;
    fake: {ns: number, ew: number},
    dummy?: DummyOptions;
    staticDummyPosition?: Position;
    vulnerability?: Vulnerability;
};

