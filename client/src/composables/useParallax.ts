import { onMounted, onUnmounted, ref, type Ref } from "vue";

type Opts = {
  maxPx?: number;
  ease?: number;
};

export function useParallax(root: Ref<HTMLElement | null>, opts: Opts = {}) {
  const maxPx = opts.maxPx ?? 10;
  const ease = opts.ease ?? 0.06;

  let raf = 0;
  const tx = ref(0);
  const ty = ref(0);
  let targetX = 0;
  let targetY = 0;

  const onMove = (e: PointerEvent) => {
    const el = root.value;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width * 0.5;
    const cy = r.top + r.height * 0.5;
    const nx = (e.clientX - cx) / Math.max(1, r.width * 0.5);
    const ny = (e.clientY - cy) / Math.max(1, r.height * 0.5);
    targetX = nx * maxPx;
    targetY = ny * maxPx;
    if (raf === 0) raf = requestAnimationFrame(loop);
  };

  const THRESHOLD = 0.05;

  const loop = () => {
    const dx = targetX - tx.value;
    const dy = targetY - ty.value;

    tx.value += dx * ease;
    ty.value += dy * ease;

    if (Math.abs(dx) > THRESHOLD || Math.abs(dy) > THRESHOLD) {
      raf = requestAnimationFrame(loop);
    } else {
      tx.value = targetX;
      ty.value = targetY;
      raf = 0;
    }
  };

  onMounted(() => {
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
  });

  onUnmounted(() => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onMove);
  });

  return { tx, ty };
}
