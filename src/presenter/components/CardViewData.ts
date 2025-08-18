import { Card } from "../../bridge/model/Card";
import { Point } from "../classes/Point";
import { Rotation } from "../classes/Rotation";


export class CardViewData {
    constructor(
      public card: Card,
      public position: Point = new Point(0, 0),
      public onclick: () => void = () => {},
      public playable: boolean = false,
      public reverse: boolean = false,
      public rotation: Rotation = Rotation.Top,
      public dummy: boolean = false,
      public z: number = 10,
      public hidden: boolean = false
    ) {}
  }