import { onMounted, onUnmounted } from "vue";

export function useKeyboardShortcut(
  key: string,
  modifier: string | null,
  handler: (event: KeyboardEvent) => void,
) {
  const eventHandler = (event: KeyboardEvent) => {
    // Check if the pressed key matches
    if (event.key.toLowerCase() !== key.toLowerCase()) {
      return;
    }

    // Check modifier keys
    if (modifier === "ctrl" && !event.ctrlKey) return;
    if (modifier === "alt" && !event.altKey) return;
    if (modifier === "shift" && !event.shiftKey) return;
    if (modifier === "meta" && !event.metaKey) return;
    if (
      modifier === null &&
      (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey)
    )
      return;

    // Prevent event propagation
    event.preventDefault();
    event.stopPropagation();

    // Call the handler
    handler(event);
  };

  onMounted(() => {
    window.addEventListener("keydown", eventHandler);
  });
  onUnmounted(() => {
    window.removeEventListener("keydown", eventHandler);
  });
}
