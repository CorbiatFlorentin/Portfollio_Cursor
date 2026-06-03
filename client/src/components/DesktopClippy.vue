<script setup lang="ts">
import { onMounted, ref } from "vue";
import gsap from "gsap";
import { useI18n } from "../composables/useI18n";

const { t } = useI18n();

const wrap     = ref<HTMLElement | null>(null);
const clippyEl = ref<HTMLElement | null>(null);
const bubbleEl = ref<HTMLElement | null>(null);
const paperEl  = ref<HTMLElement | null>(null);
const smokeEl  = ref<HTMLElement | null>(null);

const step          = ref(0);
const bubbleVisible = ref(false);

function pulseIcon(attr: string, color: string) {
  const el = document.querySelector<HTMLElement>(`[${attr}]`);
  if (!el) return;
  gsap.timeline()
    .to(el, { scale: 1.18, filter: `drop-shadow(0 0 24px ${color})`, duration: 0.26, ease: "power2.out" })
    .to(el, { scale: 1,    filter: `drop-shadow(0 0  0px ${color})`, duration: 0.26, ease: "power2.in"  })
    .to(el, { scale: 1.13, filter: `drop-shadow(0 0 18px ${color})`, duration: 0.20, ease: "power2.out" })
    .to(el, { scale: 1,    filter: `drop-shadow(0 0  0px ${color})`, duration: 0.20, ease: "power2.in"  })
    .to(el, { scale: 1.08, filter: `drop-shadow(0 0 12px ${color})`, duration: 0.16, ease: "power2.out" })
    .to(el, { scale: 1,    filter: `drop-shadow(0 0  0px ${color})`, duration: 0.16, ease: "power2.in"  });
}

function nextStep() {
  if (step.value !== 0) return;
  gsap.to(bubbleEl.value, {
    opacity: 0, y: -8, duration: 0.2, ease: "power2.in",
    onComplete: () => {
      step.value = 1;
      gsap.fromTo(
        bubbleEl.value,
        { opacity: 0, y: 8, scale: 0.88, transformOrigin: "bottom right" },
        { opacity: 1, y: 0, scale: 1,    duration: 0.38, ease: "back.out(2)" }
      );
      pulseIcon("data-clippy-contact", "rgba(120,200,255,0.95)");
    },
  });
}

function dismiss() {
  gsap.to(bubbleEl.value, { opacity: 0, scale: 0.8, duration: 0.16, ease: "power2.in" });
  gsap.to(paperEl.value,  { opacity: 0, scale: 0.8, duration: 0.16, ease: "power2.in" });

  smokeEl.value?.querySelectorAll<HTMLElement>(".smoke-puff").forEach((p, i) => {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const r = 28 + (i % 4) * 14;
    gsap.fromTo(p,
      { x: 0, y: 0, scale: 0.25, opacity: 0.8 },
      {
        x: Math.cos(a) * r,
        y: Math.sin(a) * r - 18,
        scale: 2.4 + (i % 3) * 0.7,
        opacity: 0,
        duration: 0.68 + (i % 5) * 0.1,
        delay: i * 0.045,
        ease: "power1.out",
      }
    );
  });

  gsap.to(clippyEl.value, {
    y: -52, scale: 1.14, opacity: 0,
    filter: "blur(14px)",
    duration: 0.65,
    delay: 0.08,
    ease: "power2.in",
    onComplete: () => { if (wrap.value) wrap.value.style.display = "none"; },
  });
}

onMounted(() => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const r  = wrap.value!.getBoundingClientRect();
  const dx = vw / 2 - (r.left + r.width  / 2);
  const dy = vh / 2 - (r.top  + r.height / 2);

  gsap.set(wrap.value,     { opacity: 1 });
  gsap.set(clippyEl.value, { x: dx, y: dy, scale: 0.15, opacity: 0 });
  gsap.set(bubbleEl.value, { opacity: 0, scale: 0.8, transformOrigin: "bottom right" });
  gsap.set(paperEl.value,  { opacity: 0, scale: 0.8, transformOrigin: "bottom right" });

  const tl = gsap.timeline({ delay: 0.6 });

  tl.to(clippyEl.value, { opacity: 1, duration: 0.15 });
  tl.to(clippyEl.value, { x: 0, y: 0, scale: 1, duration: 1.1, ease: "back.out(1.5)" });
  tl.to(paperEl.value,  { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.4)" }, "-=0.3");
  tl.add(() => {
    bubbleVisible.value = true;
    pulseIcon("data-clippy-pdf", "rgba(255,80,80,0.95)");
  }, "+=0.8");
  tl.fromTo(
    bubbleEl.value,
    { opacity: 0, scale: 0.75, transformOrigin: "bottom right" },
    { opacity: 1, scale: 1,    duration: 0.45, ease: "back.out(2)" }
  );
});
</script>

<template>
  <div class="clippy-outer" ref="wrap">

    <!-- Smoke particles (dismissed into view on close) -->
    <div class="smoke-container" ref="smokeEl">
      <div class="smoke-puff" v-for="n in 10" :key="n"></div>
    </div>

    <!-- Notepad paper (behind Clippy) -->
    <div class="paper" ref="paperEl">
      <svg class="paper-svg" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="dc-paperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stop-color="#f5f0c0"/>
            <stop offset="60%"  stop-color="#ede878"/>
            <stop offset="100%" stop-color="#d4c84a"/>
          </linearGradient>
        </defs>
        <polygon points="10,10 190,0 200,230 20,240" fill="url(#dc-paperGrad)" stroke="#b8a830" stroke-width="1.5"/>
        <line x1="38" y1="14" x2="35" y2="234" stroke="#e08080" stroke-width="1.2" opacity="0.7"/>
        <line x1="12"  y1="35"  x2="188" y2="33"  stroke="#a0c0a0" stroke-width="0.8" opacity="0.6"/>
        <line x1="12"  y1="55"  x2="188" y2="53"  stroke="#a0c0a0" stroke-width="0.8" opacity="0.6"/>
        <line x1="12"  y1="75"  x2="188" y2="73"  stroke="#a0c0a0" stroke-width="0.8" opacity="0.6"/>
        <line x1="12"  y1="95"  x2="188" y2="93"  stroke="#a0c0a0" stroke-width="0.8" opacity="0.6"/>
        <line x1="12"  y1="115" x2="188" y2="113" stroke="#a0c0a0" stroke-width="0.8" opacity="0.6"/>
        <line x1="12"  y1="135" x2="188" y2="133" stroke="#a0c0a0" stroke-width="0.8" opacity="0.6"/>
        <line x1="12"  y1="155" x2="188" y2="153" stroke="#a0c0a0" stroke-width="0.8" opacity="0.6"/>
        <line x1="12"  y1="175" x2="188" y2="173" stroke="#a0c0a0" stroke-width="0.8" opacity="0.6"/>
        <line x1="12"  y1="195" x2="188" y2="193" stroke="#a0c0a0" stroke-width="0.8" opacity="0.6"/>
        <line x1="12"  y1="215" x2="188" y2="213" stroke="#a0c0a0" stroke-width="0.8" opacity="0.6"/>
        <polygon points="190,0 200,230 196,232 188,2" fill="rgba(0,0,0,0.08)"/>
      </svg>
    </div>

    <!-- Speech bubble (step 0 = CV, step 1 = Contact) -->
    <div
      class="bubble"
      :class="{ clickable: step === 0 }"
      ref="bubbleEl"
      v-show="bubbleVisible"
      @click="nextStep"
    >
      <button class="bubble-close" @click.stop="dismiss" aria-label="Fermer">✕</button>

      <template v-if="step === 0">
        <p class="bubble-title">{{ t.desktopHint.cvTitle }}</p>
        <p class="bubble-body">{{ t.desktopHint.cvBody }}</p>
        <p class="bubble-cta">► {{ t.desktopHint.cvCta }}</p>
      </template>

      <template v-else>
        <p class="bubble-title">{{ t.desktopHint.contactTitle }}</p>
        <p class="bubble-body">{{ t.desktopHint.contactBody }}</p>
      </template>

      <div class="bubble-tail"></div>
    </div>

    <!-- Clippy -->
    <div class="clippy-figure" ref="clippyEl">
      <svg class="clippy-svg" viewBox="0 0 110 180" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="dc-tubeG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="#6060aa"/>
            <stop offset="30%"  stop-color="#b8b8de"/>
            <stop offset="65%"  stop-color="#9090c8"/>
            <stop offset="100%" stop-color="#5050a0"/>
          </linearGradient>
          <linearGradient id="dc-tubeG2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="#5050a0"/>
            <stop offset="40%"  stop-color="#a0a0cc"/>
            <stop offset="100%" stop-color="#4848a0"/>
          </linearGradient>
          <radialGradient id="dc-eyeG" cx="36%" cy="32%" r="60%">
            <stop offset="0%"   stop-color="#ffffff"/>
            <stop offset="70%"  stop-color="#eeeef8"/>
            <stop offset="100%" stop-color="#ccccdd"/>
          </radialGradient>
          <radialGradient id="dc-pupilG" cx="33%" cy="28%" r="65%">
            <stop offset="0%"  stop-color="#444"/>
            <stop offset="100%" stop-color="#000"/>
          </radialGradient>
        </defs>

        <path d="M28 70 C28 145 82 145 82 70"      fill="none" stroke="url(#dc-tubeG)"  stroke-width="14" stroke-linecap="round"/>
        <path d="M40 82 C40 128 70 128 70 82"      fill="none" stroke="url(#dc-tubeG2)" stroke-width="10" stroke-linecap="round"/>
        <line x1="28" y1="70"  x2="28" y2="30"    stroke="url(#dc-tubeG)"  stroke-width="14" stroke-linecap="round"/>
        <line x1="82" y1="70"  x2="82" y2="18"    stroke="url(#dc-tubeG)"  stroke-width="14" stroke-linecap="round"/>
        <line x1="40" y1="82"  x2="40" y2="38"    stroke="url(#dc-tubeG2)" stroke-width="10" stroke-linecap="round"/>
        <line x1="70" y1="82"  x2="70" y2="28"    stroke="url(#dc-tubeG2)" stroke-width="10" stroke-linecap="round"/>
        <path d="M28 30 C28 6 56 4 58 20 C60 35 46 42 40 38"      fill="none" stroke="url(#dc-tubeG)"  stroke-width="13" stroke-linecap="round"/>
        <path d="M82 18 C82 0 96 -2 99 13 C102 26 88 34 70 28"    fill="none" stroke="url(#dc-tubeG)"  stroke-width="13" stroke-linecap="round"/>
        <path d="M25 68 L25 30" stroke="rgba(255,255,255,0.4)" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M79 68 L79 20" stroke="rgba(255,255,255,0.3)" stroke-width="3"   stroke-linecap="round"/>

        <circle cx="38" cy="36" r="23" fill="url(#dc-eyeG)"   stroke="#d8d8ec" stroke-width="1.2"/>
        <circle cx="38" cy="36" r="14" fill="url(#dc-pupilG)"/>
        <circle cx="31" cy="29" r="5.5" fill="rgba(255,255,255,0.8)"/>
        <circle cx="44" cy="44" r="2.5" fill="rgba(255,255,255,0.4)"/>

        <circle cx="77" cy="30" r="19" fill="url(#dc-eyeG)"   stroke="#d8d8ec" stroke-width="1.2"/>
        <circle cx="77" cy="30" r="12" fill="url(#dc-pupilG)"/>
        <circle cx="71" cy="24" r="4.5" fill="rgba(255,255,255,0.8)"/>

        <path d="M21 15 Q36 8 51 14"  fill="none" stroke="#1a1a1a" stroke-width="4"   stroke-linecap="round"/>
        <path d="M64 9  Q76 2 88 8"   fill="none" stroke="#1a1a1a" stroke-width="3.2" stroke-linecap="round"/>
      </svg>
    </div>

  </div>
</template>

<style scoped>
.clippy-outer {
  position: absolute;
  right: 60px;
  bottom: 70px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
  opacity: 0;
}

/* ── Smoke ──────────────────────────────────────────────────────────────────── */
.smoke-container {
  position: absolute;
  bottom: 60px;
  right: 65px;
  pointer-events: none;
}
.smoke-puff {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(190, 190, 190, 0.75);
  filter: blur(4px);
  opacity: 0;
  top: -9px;
  left: -9px;
}

/* ── Paper ───────────────────────────────────────────────────────────────────── */
.paper {
  position: absolute;
  bottom: 10px;
  right: -10px;
  width: 200px;
  pointer-events: none;
  transform-origin: bottom right;
  filter: drop-shadow(4px 8px 14px rgba(0,0,0,0.45));
}
.paper-svg { width: 100%; height: auto; }

/* ── Clippy ──────────────────────────────────────────────────────────────────── */
.clippy-figure {
  position: relative;
  z-index: 2;
  pointer-events: all;
  cursor: default;
}
.clippy-svg {
  width: 130px;
  height: auto;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.6));
  animation: dc-bob 3.2s ease-in-out infinite;
  transform-origin: bottom center;
}
@keyframes dc-bob {
  0%, 100% { transform: translateY(0)   rotate(0deg);  }
  45%       { transform: translateY(-8px) rotate(-2deg); }
  55%       { transform: translateY(-8px) rotate(2deg);  }
}

/* ── Bubble ──────────────────────────────────────────────────────────────────── */
.bubble {
  position: absolute;
  bottom: calc(100% + 22px);
  right: 10px;
  width: min(340px, 82vw);
  padding: 18px 20px 16px;
  border-radius: 16px;
  background: #fffdf0;
  border: 2px solid #c4b840;
  box-shadow: 5px 8px 28px rgba(0,0,0,0.4);
  pointer-events: all;
  color: #1a1a10;
  transform-origin: bottom right;
  user-select: none;
}
.bubble.clickable { cursor: pointer; }
.bubble.clickable:hover { background: #fffbe8; }

.bubble-tail {
  position: absolute;
  bottom: -15px;
  right: 52px;
  width: 0; height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 15px solid #fffdf0;
}
.bubble-tail::before {
  content: "";
  position: absolute;
  bottom: 2px; left: -14px;
  width: 0; height: 0;
  border-left: 14px solid transparent;
  border-right: 14px solid transparent;
  border-top: 17px solid #c4b840;
  z-index: -1;
}

.bubble-close {
  position: absolute;
  top: 8px; right: 10px;
  background: none; border: none;
  font-size: 14px; cursor: pointer;
  color: #aaa; padding: 3px 6px;
  border-radius: 5px;
  transition: color 150ms, background 150ms;
}
.bubble-close:hover { color: #333; background: rgba(0,0,0,0.08); }

.bubble-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 700;
  color: #111;
  padding-right: 22px;
}
.bubble-body {
  margin: 0 0 10px;
  font-size: 13px;
  color: #333;
  line-height: 1.55;
}
.bubble-cta {
  margin: 0;
  font-size: 12px;
  color: #1a44cc;
  font-weight: 700;
}
</style>
