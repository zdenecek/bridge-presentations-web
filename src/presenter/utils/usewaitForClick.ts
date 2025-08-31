import { onMounted, onUnmounted, ref } from "vue";

export function useWaitForClick() {
  const waitForClick = ref(false);

  function handleClick() {
    waitForClick.value = false;
  }
  onMounted(() => {
    window.addEventListener("click", handleClick);
  });
  onUnmounted(() => {
    window.removeEventListener("click", handleClick);
  });

  return {
    waiting: waitForClick,
    reset: () => waitForClick.value = false,
    set: () => waitForClick.value = true,
  };
}
