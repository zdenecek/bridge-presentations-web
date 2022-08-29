


class Point {

    x: number;
     y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y; 
    }

    asCoords(): { "top": number, "left": number} {
        return { "top": this.y, "left": this.x };
    }
}

export { Point};