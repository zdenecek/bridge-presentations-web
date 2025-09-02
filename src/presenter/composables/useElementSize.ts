import { Ref, ref, TemplateRef, watch } from "vue";

export function useElementSize(element: TemplateRef<HTMLElement>): {
  width: Ref<number>;
  height: Ref<number>;
} {
  const width = ref<number>(0);
  const height = ref<number>(0);

  let observer: ResizeObserver | null = null;

  function disconnect() {
    if (observer !== null) {
      observer.disconnect();
      observer = null;
    }
  }

  function connect(element: HTMLElement) {
    disconnect();
    observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) {
        width.value = rect.width;
        height.value = rect.height;
      }
    });

    observer.observe(element);
  }

  watch(element, (el) => {
    if (el) connect(el);
    else disconnect();
  });

  return {
    width,
    height,
  };
}
