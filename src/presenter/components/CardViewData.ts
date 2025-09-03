import { Card } from "../../bridge/model/Card";
import { Point } from "../model/Point";
import { Orientation } from "../model/Orientation";

export class CardViewData {
  constructor(
    public card: Card,
    public position: Point = new Point(0, 0),
    public onclick: () => void = () => {},
    public playable: boolean = false,
    public reverse: boolean = false,
    public rotation: Orientation = Orientation.Up,
    public dummy: boolean = false,
    public z: number = 10,
    public hidden: boolean = false,
  ) {}
}
