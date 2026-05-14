<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import gsap from "gsap";

const emit = defineEmits<{ (e: "done"): void }>();

const root = ref<HTMLElement | null>(null);
const dive = ref(0.12); // start slightly "outside"

let raf = 0;
let running = true;

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

const tick = () => {
  if (!running) return;

  // Pull dive toward 1 when pointer is near center; tweak strengths to taste
  const target = nearCenter.value ? 1 : 0.15;
  dive.value += (target - dive.value) * 0.035; // smoothing

  const d = dive.value;
  const nx = pointer.value.nx;
  const ny = pointer.value.ny;

  // “Camera” composition: parallax offsets scale with (1 - d)
  const parallaxStrength = (1 - d) * 18;
  const px = nx * parallaxStrength;
  const py = ny * parallaxStrength;

  const cam = root.value?.querySelector(".cam") as HTMLElement | null;
  const screen = root.value?.querySelector(".screen") as HTMLElement | null;
  const glare = root.value?.querySelector(".glare") as HTMLElement | null;

  if (cam) {
    const scale = 0.92 + d * 0.14; // grows as you dive
    const tz = -220 + d * 220; // push “into” the screen (needs perspective on parent)
    cam.style.transform = `translate3d(${px}px, ${py}px, ${tz}px) scale(${scale})`;
  }

  if (screen) {
    // inner screen feels deeper than bezel
    const sx = nx * (10 * (1 - d));
    const sy = ny * (8 * (1 - d));
    screen.style.transform = `translate3d(${sx}px, ${sy}px, 0) scale(${0.985 + d * 0.03})`;
  }

  if (glare) {
    glare.style.opacity = `${0.18 + d * 0.25}`;
    glare.style.transform = `translate3d(${nx * 22}px, ${ny * 16}px, 0)`;
  }

  if (d > 0.985) {
    running = false;
    gsap.to(root.value, {
      opacity: 0,
      duration: 0.35,
      ease: "power2.inOut",
      onComplete: () => emit("done")
    });
    return;
  }

  raf = requestAnimationFrame(tick);
};

const pointer = ref({ nx: 0, ny: 0 });
const nearCenter = ref(false);

const onMove = (e: PointerEvent) => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const nx = (e.clientX / w) * 2 - 1;
  const ny = (e.clientY / h) * 2 - 1;
  pointer.value = { nx, ny };

  const cx = clamp(Math.hypot(nx, ny), 0, 1);
  nearCenter.value = cx < 0.35; // “center portal” threshold
};

onMounted(() => {
  window.addEventListener("pointermove", onMove, { passive: true });
  raf = requestAnimationFrame(tick);
});

onUnmounted(() => {
  running = false;
  cancelAnimationFrame(raf);
  window.removeEventListener("pointermove", onMove);
});
</script>

<template>
  <div class="wrap" ref="root">
    <div class="vignette"></div>

    <div class="scene">
      <div class="cam">
        <div class="bezel">
          <div class="screen">
            <div class="screenBg"></div>
            <div class="glare"></div>
            <div class="hint">Move toward the center of the screen to enter</div>
          </div>
        </div>
        <div class="stand"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  position: fixed;
  inset: 0;
  background: radial-gradient(900px 600px at 50% 35%, rgba(120, 200, 255, 0.16), transparent 60%), #000;
  perspective: 900px;
  overflow: hidden;
}

.scene {
  height: 100%;
  display: grid;
  place-items: center;
  transform-style: preserve-3d;
}

.cam {
  width: min(920px, 92vw);
  transform-style: preserve-3d;
  will-change: transform;
}

.bezel {
  border-radius: 18px;
  padding: 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.10), rgba(0, 0, 0, 0.55));
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow: 0 50px 140px rgba(0, 0, 0, 0.75);
}

.screen {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 21 / 9;
  background: #02030a;
  transform-style: preserve-3d;
  will-change: transform;
}

.screenBg {
  position: absolute;
  inset: 0;
  background: radial-gradient(800px 420px at 25% 20%, rgba(120, 200, 255, 0.35), transparent 60%),
    radial-gradient(700px 420px at 75% 60%, rgba(190, 120, 255, 0.22), transparent 55%), linear-gradient(180deg, #070814, #05060a);
  filter: saturate(1.05);
}

.glare {
  position: absolute;
  inset: -30%;
  background: linear-gradient(115deg, transparent 42%, rgba(255, 255, 255, 0.20), transparent 58%);
  mix-blend-mode: screen;
  opacity: 0.18;
  will-change: transform, opacity;
  pointer-events: none;
}

.hint {
  position: absolute;
  left: 16px;
  bottom: 14px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.65);
  pointer-events: none;
}

.stand {
  margin: 10px auto 0;
  width: min(360px, 55vw);
  height: 18px;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.10), rgba(0, 0, 0, 0.55));
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 50% 45%, transparent 40%, rgba(0, 0, 0, 0.55) 100%);
}
</style>