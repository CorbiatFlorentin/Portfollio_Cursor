<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import gsap from "gsap";
import { useI18n } from "../composables/useI18n";
import LocaleSwitcher from "./LocaleSwitcher.vue";

const emit = defineEmits<{ (e: "done"): void }>();
const { t } = useI18n();

const root = ref<HTMLElement | null>(null);
const diving = ref(false);
const pointer = ref({ nx: 0, ny: 0 });

let raf = 0;
let running = true;

const onMove = (e: PointerEvent) => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  pointer.value = {
    nx: (e.clientX / w) * 2 - 1,
    ny: (e.clientY / h) * 2 - 1
  };
};

const tick = () => {
  if (!running || diving.value) return;

  const { nx, ny } = pointer.value;

  const cam = root.value?.querySelector(".cam") as HTMLElement | null;
  const screen = root.value?.querySelector(
    ".screenInner"
  ) as HTMLElement | null;

  const glare = root.value?.querySelector(".glare") as HTMLElement | null;

  const desk = root.value?.querySelector(".desk") as HTMLElement | null;

  const cup = root.value?.querySelector(".cup") as HTMLElement | null;

  if (cam) {
    cam.style.transform =
      `translateX(-50%) translate3d(${nx * 10}px, ${ny * 8}px, 0) scale(0.96)`;
  }

  if (screen) {
    screen.style.transform =
      `translate3d(${nx * 6}px, ${ny * 5}px, 0)`;
  }

  if (glare) {
    glare.style.opacity = "0.24";

    glare.style.transform =
      `translate3d(${nx * 18}px, ${ny * 12}px, 0)`;
  }

  if (desk) {
    desk.style.transform =
      `translate3d(${nx * 8}px, ${ny * 6}px, 0)`;
  }

  if (cup) {
    cup.style.transform =
      `translate3d(${nx * 12}px, ${ny * 8}px, 0)`;
  }

  raf = requestAnimationFrame(tick);
};

const enterDesktop = () => {
  if (diving.value) return;

  diving.value = true;
  running = false;

  const cam = root.value?.querySelector(".cam") as HTMLElement | null;

  const wrap = root.value;

  gsap
    .timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => emit("done")
    })
    .to(cam, { scale: 1.2, duration: 1.05 })
    .to(wrap, { opacity: 0, duration: 0.35 }, "-=0.15");
};

onMounted(() => {
  window.addEventListener("pointermove", onMove, {
    passive: true
  });

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
    <LocaleSwitcher />

    <aside class="callout">
      <h1>{{ t.intro.title }}</h1>

      <p class="sub">
        {{ t.intro.subtitle }}
      </p>

      <p class="detail">
        {{ t.intro.detail }}
      </p>

      <p class="cta">
        {{ t.intro.cta }}
      </p>
    </aside>

    <div class="scene">
      <div class="stage">
        <div class="desk" aria-hidden="true"></div>

        <div class="cam">
          <div class="bezel">
            <button
              class="screen"
              type="button"
              :disabled="diving"
              @click="enterDesktop"
              :aria-label="t.intro.cta"
            >
              <div class="screenInner">
                <div class="screenBg"></div>

                <div class="glare"></div>

                <span class="hint">
                  {{ diving ? t.intro.powering : t.intro.cta }}
                </span>
              </div>
            </button>
          </div>

          <div class="stand"></div>
        </div>

        <div class="cup" aria-hidden="true">
          <div class="steam" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="vignette"></div>
  </div>
</template>

<style scoped>
.wrap {
  position: fixed;
  inset: 0;
  background: #000;
  perspective: 900px;
  overflow: hidden;
}

.callout {
  position: absolute;
  left: 24px;
  top: 24px;
  z-index: 5;
  max-width: min(440px, 90vw);
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(10, 12, 18, 0.55);
  backdrop-filter: blur(14px);
}

h1 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
}

.sub {
  margin: 0 0 8px;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.45;
  font-size: 14px;
}

.detail {
  margin: 0 0 10px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 13px;
  line-height: 1.5;
}

.cta {
  margin: 0;
  font-size: 12px;
  color: rgba(120, 200, 255, 0.9);
  letter-spacing: 0.02em;
}

.scene {
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 5vh;
  position: relative;
}

/* One box: desk + monitor + cup share the same coordinates */
.stage {
  position: relative;
  width: min(1100px, 94vw);
  height: min(480px, 52vh);
}

.desk {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 42%;
  border-radius: 18px;
  background:
    radial-gradient(
      900px 220px at 50% 0%,
      rgba(255, 220, 170, 0.22),
      transparent 60%
    ),
    linear-gradient(90deg, #4a2f1a, #7a4e2b, #5b3a20);
  box-shadow: 0 40px 90px rgba(0, 0, 0, 0.75);
  z-index: 1;
  will-change: transform;
}

.cam {
  position: absolute;
  left: 50%;
  bottom: 34%;
  width: 92%;
  z-index: 3;
  transform: translateX(-50%);
  transform-style: preserve-3d;
  will-change: transform;
}

.bezel {
  border-radius: 18px;
  padding: 14px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.1),
    rgba(0, 0, 0, 0.55)
  );

  border: 1px solid rgba(255, 255, 255, 0.1);

  box-shadow: 0 50px 140px rgba(0, 0, 0, 0.75);
}

.screen {
  position: relative;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 21 / 9;
  cursor: pointer;
  background: #02030a;
  transition: box-shadow 200ms ease;
}

.screen:hover:not(:disabled) {
  box-shadow:
    0 0 0 2px rgba(120, 200, 255, 0.35),
    0 0 40px rgba(120, 200, 255, 0.15);
}

.screen:disabled {
  cursor: wait;
}

.screenInner {
  position: absolute;
  inset: 0;
  will-change: transform;
}

.screenBg {
  position: absolute;
  inset: 0;
  background-color: #008080;
  background-image: url("/windows98-flag.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.glare {
  position: absolute;
  inset: -30%;
  background: linear-gradient(
    115deg,
    transparent 42%,
    rgba(255, 255, 255, 0.2),
    transparent 58%
  );

  mix-blend-mode: screen;
  pointer-events: none;
}

.hint {
  position: absolute;
  left: 16px;
  bottom: 14px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.65);
  pointer-events: none;
}

.stand {
  margin: 10px auto 0;
  width: min(360px, 55vw);
  height: 18px;
  border-radius: 10px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.1),
    rgba(0, 0, 0, 0.55)
  );

  border: 1px solid rgba(255, 255, 255, 0.08);
}

.cup {
  position: absolute;
  left: 10%;
  bottom: 38%;
  width: 56px;
  height: 46px;
  z-index: 4;
  border-radius: 10px 10px 14px 14px;

  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.2),
    rgba(200, 200, 200, 0.08)
  );

  border: 1px solid rgba(255, 255, 255, 0.2);

  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5);

  will-change: transform;
}

/* optional: saucer under cup */
.cup::after {
  content: "";
  position: absolute;
  left: -8px;
  bottom: -6px;
  width: 72px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.steam {
  position: absolute;
  left: 18px;
  top: -34px;
  width: 30px;
  height: 40px;
}

.steam span {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.18);
  animation: steam 2.8s ease-in-out infinite;
}

.steam span:nth-child(1) {
  left: 2px;
  animation-delay: 0s;
}

.steam span:nth-child(2) {
  left: 12px;
  opacity: 0.75;
  animation-delay: 0.35s;
}

.steam span:nth-child(3) {
  left: 20px;
  opacity: 0.55;
  animation-delay: 0.7s;
}

@keyframes steam {
  0% {
    transform: translateY(10px) scale(0.85);
    opacity: 0;
  }

  20% {
    opacity: 0.55;
  }

  100% {
    transform: translateY(-34px) scale(1.25);
    opacity: 0;
  }
}

.vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;

  background: radial-gradient(
    circle at 50% 45%,
    transparent 40%,
    rgba(0, 0, 0, 0.55) 100%
  );
}
</style>