<script setup lang="ts">
import { onMounted, ref } from "vue";
import gsap from "gsap";
import { useI18n } from "../composables/useI18n";

const { t } = useI18n();

const wrap        = ref<HTMLElement | null>(null);
const clippyEl    = ref<HTMLElement | null>(null);
const bubbleEl    = ref<HTMLElement | null>(null);
const paperEl     = ref<HTMLElement | null>(null);
const bubbleVisible = ref(false);

const dismiss = () => {
  gsap.to(bubbleEl.value,  { opacity: 0, scale: 0.85, duration: 0.2, ease: "power2.in" });
  gsap.to(paperEl.value,   { opacity: 0, scale: 0.85, duration: 0.2, ease: "power2.in" });
  gsap.to(clippyEl.value,  {
    y: 200, x: 60, scale: 0.3, opacity: 0,
    duration: 0.55, ease: "power3.in", delay: 0.15,
  });
};

onMounted(() => {
  // ── Positions finales (en px depuis le bord) ──
  // On va calculer la position du centre de l'écran pour le départ
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Position finale du wrapper (déjà en CSS: right:60px, bottom:42%)
  // Position de départ = centre de l'écran (là où est le moniteur)
  const wrapEl = wrap.value!;
  const finalRect = wrapEl.getBoundingClientRect(); // position CSS finale

  // Centre moniteur (approximatif)
  const monitorCx = vw / 2;
  const monitorCy = vh * 0.38;

  // Delta entre centre moniteur et position finale de Clippy
  const dx = monitorCx - (finalRect.left + finalRect.width / 2);
  const dy = monitorCy - (finalRect.top  + finalRect.height / 2);

  // État initial : Clippy est au centre de l'écran, tout petit (comme dans l'écran)
  gsap.set(wrap.value, { opacity: 1 });
  gsap.set(clippyEl.value, { x: dx, y: dy, scale: 0.15, opacity: 0 });
  gsap.set(bubbleEl.value,  { opacity: 0, scale: 0.8, transformOrigin: "bottom right" });
  gsap.set(paperEl.value,   { opacity: 0, scale: 0.8, transformOrigin: "bottom right" });

  // ── Animation : sort de l'écran ──
  const tl = gsap.timeline({ delay: 0.5 });

  // 1) Flash visible dans l'écran
  tl.to(clippyEl.value, { opacity: 1, duration: 0.15 });

  // 2) Agrandit et se déplace vers sa position finale avec rebond
  tl.to(clippyEl.value, {
    x: 0, y: 0, scale: 1,
    duration: 1.1,
    ease: "back.out(1.5)",
  });

  // 3) Papier apparaît
  tl.to(paperEl.value, {
    opacity: 1, scale: 1,
    duration: 0.4, ease: "back.out(1.4)",
  }, "-=0.3");

  // 4) Bulle de dialogue
  tl.add(() => { bubbleVisible.value = true; }, "+=0.8");
  tl.fromTo(bubbleEl.value,
    { opacity: 0, scale: 0.75, transformOrigin: "bottom right" },
    { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" },
  );
});
</script>

<template>
  <div class="clippy-outer" ref="wrap">

    <!-- Notepad paper (behind Clippy) -->
    <div class="paper" ref="paperEl">
      <svg class="paper-svg" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="paperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stop-color="#f5f0c0"/>
            <stop offset="60%"  stop-color="#ede878"/>
            <stop offset="100%" stop-color="#d4c84a"/>
          </linearGradient>
        </defs>
        <!-- Paper body (slightly skewed parallelogram) -->
        <polygon points="10,10 190,0 200,230 20,240" fill="url(#paperGrad)" stroke="#b8a830" stroke-width="1.5"/>
        <!-- Red margin line -->
        <line x1="38" y1="14" x2="35" y2="234" stroke="#e08080" stroke-width="1.2" opacity="0.7"/>
        <!-- Horizontal rules -->
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
        <!-- Shadow edge right -->
        <polygon points="190,0 200,230 196,232 188,2" fill="rgba(0,0,0,0.08)"/>
      </svg>
    </div>

    <!-- Speech bubble -->
    <div class="bubble" ref="bubbleEl" v-show="bubbleVisible">
      <button class="bubble-close" @click="dismiss" aria-label="Fermer">✕</button>
      <p class="bubble-title">{{ t.intro.title }}</p>
      <p class="bubble-sub">{{ t.intro.subtitle }}</p>
      <p class="bubble-detail">{{ t.intro.detail }}</p>
      <p class="bubble-cta">► {{ t.intro.cta }}</p>
      <div class="bubble-tail"></div>
    </div>

    <!-- Clippy -->
    <div class="clippy-figure" ref="clippyEl">
      <svg class="clippy-svg" viewBox="0 0 110 180" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tubeG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="#6060aa"/>
            <stop offset="30%"  stop-color="#b8b8de"/>
            <stop offset="65%"  stop-color="#9090c8"/>
            <stop offset="100%" stop-color="#5050a0"/>
          </linearGradient>
          <linearGradient id="tubeG2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="#5050a0"/>
            <stop offset="40%"  stop-color="#a0a0cc"/>
            <stop offset="100%" stop-color="#4848a0"/>
          </linearGradient>
          <radialGradient id="eyeG" cx="36%" cy="32%" r="60%">
            <stop offset="0%"   stop-color="#ffffff"/>
            <stop offset="70%"  stop-color="#eeeef8"/>
            <stop offset="100%" stop-color="#ccccdd"/>
          </radialGradient>
          <radialGradient id="pupilG" cx="33%" cy="28%" r="65%">
            <stop offset="0%"  stop-color="#444"/>
            <stop offset="100%" stop-color="#000"/>
          </radialGradient>
        </defs>

        <!-- ── Body ── -->
        <path d="M28 70 C28 145 82 145 82 70"      fill="none" stroke="url(#tubeG)"  stroke-width="14" stroke-linecap="round"/>
        <path d="M40 82 C40 128 70 128 70 82"      fill="none" stroke="url(#tubeG2)" stroke-width="10" stroke-linecap="round"/>
        <line x1="28" y1="70"  x2="28" y2="30"    stroke="url(#tubeG)"  stroke-width="14" stroke-linecap="round"/>
        <line x1="82" y1="70"  x2="82" y2="18"    stroke="url(#tubeG)"  stroke-width="14" stroke-linecap="round"/>
        <line x1="40" y1="82"  x2="40" y2="38"    stroke="url(#tubeG2)" stroke-width="10" stroke-linecap="round"/>
        <line x1="70" y1="82"  x2="70" y2="28"    stroke="url(#tubeG2)" stroke-width="10" stroke-linecap="round"/>
        <!-- Top loops -->
        <path d="M28 30 C28 6 56 4 58 20 C60 35 46 42 40 38" fill="none" stroke="url(#tubeG)"  stroke-width="13" stroke-linecap="round"/>
        <path d="M82 18 C82 0 96 -2 99 13 C102 26 88 34 70 28" fill="none" stroke="url(#tubeG)"  stroke-width="13" stroke-linecap="round"/>
        <!-- Highlights -->
        <path d="M25 68 L25 30" stroke="rgba(255,255,255,0.4)" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M79 68 L79 20" stroke="rgba(255,255,255,0.3)" stroke-width="3"   stroke-linecap="round"/>

        <!-- ── Eyes ── -->
        <circle cx="38" cy="36" r="23" fill="url(#eyeG)" stroke="#d8d8ec" stroke-width="1.2"/>
        <circle cx="38" cy="36" r="14" fill="url(#pupilG)"/>
        <circle cx="31" cy="29" r="5.5" fill="rgba(255,255,255,0.8)"/>
        <circle cx="44" cy="44" r="2.5" fill="rgba(255,255,255,0.4)"/>

        <circle cx="77" cy="30" r="19" fill="url(#eyeG)" stroke="#d8d8ec" stroke-width="1.2"/>
        <circle cx="77" cy="30" r="12" fill="url(#pupilG)"/>
        <circle cx="71" cy="24" r="4.5" fill="rgba(255,255,255,0.8)"/>

        <!-- ── Brows ── -->
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
  bottom: calc(42% + 10px);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
  pointer-events: none;
  opacity: 0; /* GSAP prend le relai */
}

/* ── Notepad paper ──────────────────────────────────────────────────────────── */
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

/* ── Clippy figure ─────────────────────────────────────────────────────────── */
.clippy-figure {
  position: relative;
  z-index: 2;
  pointer-events: all;
  cursor: pointer;
}

.clippy-svg {
  width: 130px;
  height: auto;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.6));
  animation: clippy-bob 3.2s ease-in-out infinite;
  transform-origin: bottom center;
}

@keyframes clippy-bob {
  0%, 100% { transform: translateY(0) rotate(0deg);    }
  45%       { transform: translateY(-8px) rotate(-2deg); }
  55%       { transform: translateY(-8px) rotate(2deg);  }
}

/* ── Speech bubble ─────────────────────────────────────────────────────────── */
.bubble {
  position: absolute;
  bottom: calc(100% + 18px);
  right: 10px;
  width: min(360px, 85vw);
  padding: 20px 22px 18px;
  border-radius: 16px;
  background: #fffdf0;
  border: 2px solid #c4b840;
  box-shadow: 5px 8px 28px rgba(0,0,0,0.4);
  pointer-events: all;
  color: #1a1a10;
  transform-origin: bottom right;
}

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
  font-size: 15px; cursor: pointer;
  color: #aaa; padding: 3px 6px;
  border-radius: 5px;
  transition: color 150ms, background 150ms;
}
.bubble-close:hover { color: #333; background: rgba(0,0,0,0.08); }

.bubble-title {
  margin: 0 0 10px;
  font-size: 17px;
  font-weight: 700;
  color: #111;
  padding-right: 24px;
}
.bubble-sub {
  margin: 0 0 8px;
  font-size: 14px;
  color: #222;
  line-height: 1.55;
}
.bubble-detail {
  margin: 0 0 12px;
  font-size: 13px;
  color: #444;
  line-height: 1.55;
}
.bubble-cta {
  margin: 0;
  font-size: 13px;
  color: #1a44cc;
  font-weight: 700;
  letter-spacing: 0.01em;
}
</style>
