export function runLater(callback: () => void, delay = 0): void {
  window.setTimeout(callback, delay);
}
