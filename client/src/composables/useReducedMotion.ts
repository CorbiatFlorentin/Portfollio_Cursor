import { onMounted, onUnmounted, ref } from "vue";

export function useReducedMotion() {
  const reduced = ref(false);
  let mql: MediaQueryList | null = null;

  const sync = () => {
    reduced.value = !!mql?.matches;
  };

  onMounted(() => {
    mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    sync();
    mql.addEventListener?.("change", sync);
  });

  onUnmounted(() => {
    mql?.removeEventListener?.("change", sync);
  });

  return { reduced };
}
