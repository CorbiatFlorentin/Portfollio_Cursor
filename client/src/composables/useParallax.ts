import { onMounted, onUnmounted, ref, type Ref } from "vue";

type Opts = {
  maxPx?: number;
};

export function useParallax(root: Ref<HTMLElement | null>, opts: Opts = {}) {
  const maxPx = opts.maxPx ?? 10;
  let raf = 0;
  const tx = ref(0);
  const ty = ref(0);

  const onMove = (e: PointerEvent) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const el = root.value;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width * 0.5;
      const cy = r.top + r.height * 0.5;
      const nx = (e.clientX - cx) / Math.max(1, r.width * 0.5);
      const ny = (e.clientY - cy) / Math.max(1, r.height * 0.5);
      tx.value = nx * maxPx;
      ty.value = ny * maxPx;
    });
  };

  onMounted(() => window.addEventListener("pointermove", onMove, { passive: true }));
  onUnmounted(() => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onMove);
  });

  return { tx, ty };
}
