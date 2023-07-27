import View from "./View";

export default class TextView extends View {
  constructor(classes?: string, text?: string) {
    super("<span>");

    if (classes) this.root.addClass(classes);
    if (text) this.text = text;
  }

  public set text(value: string) {
    this.root.html(value.replaceAll("\n", "<br>"));
  }
}
