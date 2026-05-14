<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import gsap from "gsap";
import { useReducedMotion } from "../composables/useReducedMotion";

const emit = defineEmits<{ (e: "done"): void }>();

const root = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);
const { reduced } = useReducedMotion();

let ctx: gsap.Context | null = null;

onMounted(() => {
  const el = root.value;
  const st = stage.value;
  if (!el || !st) return;

  ctx = gsap.context(() => {
    if (reduced.value) {
      gsap.set(el, { opacity: 1 });
      gsap.set([".ambient", ".desk", ".cup", ".steam", ".monitor", ".cam", ".screen"], { opacity: 1, filter: "none", y: 0, scale: 1 });
      emit("done");
      return;
    }

    gsap.set(el, { opacity: 1 });
    gsap.set(
      [".desk", ".cup", ".steam", ".monitor", ".screenInner", ".boot", ".glow", ".rgb"],
      { opacity: 0 }
    );
    gsap.set(".ambient", { opacity: 0 });
    gsap.set(".desk", { y: 18, filter: "blur(12px)" });
    gsap.set(".cup", { y: 26, scale: 0.98 });
    gsap.set(".monitor", { y: 30, rotateX: 10, transformOrigin: "50% 80%" });
    gsap.set(".cam", { scale: 1, y: 0 });
    gsap.set(".screenInner", { scale: 0.985 });

    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

    tl.to(".ambient", { opacity: 1, duration: 1.2 })
      .to(".desk", { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.35 }, "-=0.55")
      .to(".cup", { opacity: 1, y: 0, scale: 1, duration: 0.85 }, "-=0.65")
      .to(".steam", { opacity: 1, duration: 0.6 }, "-=0.45")
      .to(".monitor", { opacity: 1, y: 0, rotateX: 0, duration: 1.15 }, "-=0.55")
      .to(".screen", { opacity: 1, duration: 0.55 }, "-=0.45")
      .to(".cam", { scale: 1.12, y: -18, duration: 2.2, ease: "power3.inOut" }, "-=0.35")
      .to(".glow", { opacity: 1, duration: 0.8 }, "-=1.85")
      .to(".rgb", { opacity: 1, duration: 0.9 }, "-=1.75")
      .to(".boot", { opacity: 1, duration: 0.25 }, "-=1.35")
      .to(".bootLine", { scaleX: 1, duration: 0.9, ease: "power2.out" }, "-=1.05")
      .to(".boot", { opacity: 0, duration: 0.35 }, "+=0.15")
      .to(".screenInner", { opacity: 1, scale: 1, duration: 0.75, ease: "power3.out" }, "-=0.35")
      .to(el, { opacity: 0, duration: 0.55, ease: "power2.inOut" }, "+=0.05")
      .add(() => emit("done"));
  }, root);
});

onBeforeUnmount(() => {
  ctx?.revert();
  ctx = null;
});
</script>

<template>
  <div class="wrap" ref="root">
    <div class="ambient" aria-hidden="true"></div>

    <div class="stage" ref="stage">
      <div class="cam">
        <div class="desk" aria-hidden="true"></div>

        <div class="cup" aria-hidden="true">
          <div class="steam" aria-hidden="true">
            <span class="s1"></span>
            <span class="s2"></span>
            <span class="s3"></span>
          </div>
        </div>

        <div class="monitor" aria-hidden="true">
          <div class="bezel">
            <div class="screen">
              <div class="glow" aria-hidden="true"></div>
              <div class="rgb" aria-hidden="true"></div>

              <div class="screenInner" aria-hidden="true">
                <div class="wallpaper"></div>
                <div class="scan" aria-hidden="true"></div>
              </div>

              <div class="boot" aria-hidden="true">
                <div class="bootMark">WORKSTATION</div>
                <div class="bootLine" aria-hidden="true"></div>
              </div>
            </div>
          </div>
          <div class="stand" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: #000;
  opacity: 0;
  perspective: 1100px;
}

.ambient {
  position: absolute;
  inset: -20%;
  background: radial-gradient(circle at 50% 35%, rgba(140, 210, 255, 0.22), transparent 55%),
    radial-gradient(circle at 40% 80%, rgba(255, 160, 255, 0.10), transparent 55%);
  filter: blur(18px);
  opacity: 0;
}

.stage {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: end center;
  padding-bottom: 6vh;
}

.cam {
  width: min(1100px, 92vw);
  transform-style: preserve-3d;
  will-change: transform, opacity;
}

.desk {
  height: 220px;
  width: 100%;
  border-radius: 18px;
  transform: translateY(10px);
  background: radial-gradient(900px 220px at 50% 0%, rgba(255, 220, 170, 0.22), transparent 60%),
    linear-gradient(90deg, rgba(60, 35, 18, 0.95), rgba(90, 55, 28, 0.95), rgba(55, 32, 16, 0.95));
  box-shadow: 0 40px 90px rgba(0, 0, 0, 0.75);
  opacity: 0;
}

.cup {
  position: absolute;
  left: 14%;
  bottom: 210px;
  width: 64px;
  height: 52px;
  border-radius: 10px 10px 14px 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.18);
  opacity: 0;
}

.steam {
  position: absolute;
  left: 18px;
  top: -34px;
  width: 30px;
  height: 40px;
  opacity: 0;
}

.steam span {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.18);
  filter: blur(0.2px);
  animation: steam 2.8s ease-in-out infinite;
}

.s1 {
  left: 2px;
  animation-delay: 0s;
}
.s2 {
  left: 12px;
  animation-delay: 0.35s;
  opacity: 0.75;
}
.s3 {
  left: 20px;
  animation-delay: 0.7s;
  opacity: 0.55;
}

@keyframes steam {
  0% {
    transform: translate3d(0, 10px, 0) scale(0.85);
    opacity: 0;
  }
  20% {
    opacity: 0.55;
  }
  100% {
    transform: translate3d(6px, -34px, 0) scale(1.25);
    opacity: 0;
  }
}

.monitor {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 190px;
  width: min(760px, 86vw);
  opacity: 0;
  transform-style: preserve-3d;
}

.bezel {
  border-radius: 18px;
  padding: 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.10), rgba(0, 0, 0, 0.55));
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow: 0 40px 120px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.10);
}

.screen {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 21 / 9;
  background: #02030a;
  opacity: 0;
}

.glow {
  position: absolute;
  inset: -40%;
  background: radial-gradient(circle at 50% 50%, rgba(120, 200, 255, 0.35), transparent 55%);
  opacity: 0;
  mix-blend-mode: screen;
  filter: blur(18px);
  pointer-events: none;
}

.rgb {
  position: absolute;
  left: -20%;
  right: -20%;
  bottom: -35%;
  height: 45%;
  opacity: 0;
  background: conic-gradient(from 200deg, rgba(255, 0, 140, 0.35), rgba(0, 200, 255, 0.35), rgba(120, 255, 120, 0.30), rgba(255, 0, 140, 0.35));
  filter: blur(22px);
  mix-blend-mode: screen;
  pointer-events: none;
  animation: rgb 6s linear infinite;
}

@keyframes rgb {
  to {
    filter: blur(22px) hue-rotate(360deg);
  }
}

.screenInner {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform-origin: 50% 50%;
}

.screenInner .wallpaper {
  position: absolute;
  inset: 0;
  background: radial-gradient(800px 420px at 25% 20%, rgba(120, 200, 255, 0.35), transparent 60%),
    radial-gradient(700px 420px at 75% 60%, rgba(190, 120, 255, 0.22), transparent 55%), linear-gradient(180deg, #070814, #05060a);
}

.scan {
  position: absolute;
  inset: -20% -20%;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.06), transparent);
  transform: translateY(-40%);
  animation: scan 2.2s ease-in-out infinite;
  mix-blend-mode: overlay;
  opacity: 0.35;
}

@keyframes scan {
  0% {
    transform: translateY(-45%);
  }
  100% {
    transform: translateY(45%);
  }
}

.boot {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 14px;
  background: radial-gradient(circle at 50% 40%, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.75));
  opacity: 0;
}

.bootMark {
  letter-spacing: 0.35em;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
  text-align: center;
}

.bootLine {
  height: 2px;
  width: min(360px, 60vw);
  margin: 0 auto;
  border-radius: 99px;
  background: linear-gradient(90deg, transparent, rgba(120, 200, 255, 0.85), transparent);
  transform: scaleX(0.08);
  transform-origin: 50% 50%;
  filter: drop-shadow(0 0 12px rgba(120, 200, 255, 0.35));
}

.stand {
  margin: 10px auto 0;
  width: min(360px, 55vw);
  height: 18px;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.10), rgba(0, 0, 0, 0.55));
  border: 1px solid rgba(255, 255, 255, 0.08);
}

@media (prefers-reduced-motion: reduce) {
  .steam span,
  .rgb,
  .scan {
    animation: none !important;
  }
}
</style>
