import View from "./View";



export default class TextView extends View {


    constructor(classes?: string) {
        super('<span>');

        if(classes) this.root.addClass(classes);
    }

    public set text(value: string) {
        this.root.text(value);
    }

}