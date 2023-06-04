import * as $ from "jquery";
import { Point } from "../classes/Point";

export default class View {
  // todo make private
  root: JQuery<HTMLElement>;

  constructor(template: string) {
    this.root = $.default(template);
  }

  attach(parent: HTMLElement | JQuery<HTMLElement>): void {
    $.default(parent).append(this.root);
  }

  addSubView(view: View): void {
    view.attach(this.root);
  }

  detach(): void {
    this.root.detach();
  }

  public hide(): void {
    this.hidden = true;
  }

  public show(): void {
    this.hidden = false;
  }

  private _hidden = false;

  get hidden(): boolean {
    return this._hidden;
  }

  set hidden(value: boolean) {
    if (this.hidden === value) return;
    this._hidden = value;
    if (value) this.root.hide();
    else this.root.show();
  }

  public get height(): number {
    return this.root.height() || 0;
  }

  public get width(): number {
    return this.root.width() || 0;
  }

  public get start(): Point {
    const c = this.root.offset();
    if (!c) return Point.Origin;
    return new Point(c.left, c.top);
  }
}
