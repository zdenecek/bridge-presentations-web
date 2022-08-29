

export function runLater(callback: Function, delay: number = 0) {

    window.setTimeout(callback, delay);

}
