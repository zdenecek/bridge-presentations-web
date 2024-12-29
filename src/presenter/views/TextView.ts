import View from "./View";

export default class TextView extends View {
  constructor(classes?: string, text?: string) {
    super("<span>");

    if (classes) this.root.classList.add(classes);
    if (text) this.text = text;
  }

  public set text(value: string) {
    const valueWithNewLines = value.replaceAll("\n", "<br>");
    this.root.innerHTML = valueWithNewLines;
  }
}
