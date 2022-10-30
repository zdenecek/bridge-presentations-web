    
import * as $ from "jquery";
import { Point } from "../classes/Point";

export default abstract class View {

    root: JQuery<HTMLElement>;

    constructor(template: string) {
        this.root = $.default(template);
    }
    
    attach(parent: HTMLElement) : void {
        $.default(parent).append(this.root);
    } 
    detach() : void {
        this.root.detach();
    }

    protected get height(): number {
        return this.root.height() || 0;
    }

    protected get width(): number {
        return this.root.height() || 0;
    }

    protected get start(): Point {
        const c = this.root.offset();
        if(!c) return Point.Origin;
        return new Point(c.left, c.top);
    }
}