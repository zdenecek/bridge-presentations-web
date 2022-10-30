import { Vector } from "./Vector";

class Point {
    public readonly x: number;
    public readonly y: number;

    static readonly Origin = new Point(0, 0);

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    asCoords(): { top: number; left: number } {
        return { top: this.y, left: this.x };
    }

    copy(): Point {
        return new Point(this.x, this.y);
    }

    moveBy(vector: Vector): Point  {
        return new Point(this.x + vector.x, this.y+ vector.y);
    }
}

export { Point };
