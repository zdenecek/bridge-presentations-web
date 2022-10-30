import { Point } from "./Point";

class Vector {
    public readonly x: number;
    public readonly y: number;

    public static Zero = new Vector(0, 0);

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    asCoords(): { top: number; left: number } {
        return { top: this.y, left: this.x };
    }

    copy(): Vector {
        return new Vector(this.x, this.y);
    }

    add(other: Vector | { x: number; y: number }): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
    }
}

export {Vector};
