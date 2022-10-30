class Point {
    x: number;
    y: number;

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

    add(other: Point | { x: number; y: number }): Point {
        return new Point(this.x + other.x, this.y + other.y);
    }
}

export { Point };
