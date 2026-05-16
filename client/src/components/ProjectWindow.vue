<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import gsap from "gsap";
import type { OpenWindow } from "../composables/useWindowManager";
import type { Project } from "../types/project";
import { useI18n } from "../composables/useI18n";

const { t } = useI18n();

const props = defineProps<{
  model: OpenWindow;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "minimize"): void;
  (e: "maximize"): void;
  (e: "focus"): void;
}>();

const project = computed((): Project | undefined => {
  if (props.model.kind !== "project") return undefined;
  return props.model.project;
});

const root = ref<HTMLElement | null>(null);

const dragging = ref(false);
let dragStartX = 0;
let dragStartY = 0;
let winStartX = 0;
let winStartY = 0;

const style = computed(() => {
  if (props.model.maximized) {
    return {
      left: "18px",
      top: "18px",
      right: "18px",
      bottom: "18px",
      width: "auto",
      height: "auto",
      transform: "none"
    } as const;
  }

  return {
    left: "0px",
    top: "0px",
    width: "min(980px, calc(100vw - 36px))",
    height: "min(640px, calc(100vh - 36px))",
    transform: `translate3d(${props.model.x}px, ${props.model.y}px, 0)`
  } as const;
});

const onDownBar = (e: PointerEvent) => {
  if (props.model.maximized) return;
  dragging.value = true;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  winStartX = props.model.x;
  winStartY = props.model.y;
  emit("focus");
};

const onMoveBar = (e: PointerEvent) => {
  if (!dragging.value || props.model.maximized) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  props.model.x = winStartX + dx;
  props.model.y = winStartY + dy;
};

const onUpBar = () => {
  dragging.value = false;
};

onMounted(() => {
  const el = root.value;
  if (!el) return;
  gsap.fromTo(
    el,
    { opacity: 0, scale: 0.985, filter: "blur(6px)" },
    { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.55, ease: "power3.out" }
  );
});

const closeAnimated = () => {
  const el = root.value;
  if (!el) {
    emit("close");
    return;
  }
  gsap.to(el, {
    opacity: 0,
    scale: 0.985,
    duration: 0.35,
    ease: "power2.in",
    onComplete: () => emit("close")
  });
};
</script>

<template>
  <section
    v-if="project"
    ref="root"
    class="win"
    :class="{ minimized: model.minimized, maximized: model.maximized }"
    :style="style"
    @pointerdown="emit('focus')"
  >
    <header
      class="titlebar"
      @pointerdown="onDownBar"
      @pointermove="onMoveBar"
      @pointerup="onUpBar"
      @pointercancel="onUpBar"
    >
      <div class="traffic">
        <button
          class="dot red"
          type="button"
          :aria-label="t.window.close"
          @pointerdown.stop
          @click="closeAnimated"
        ></button>
        <button
          class="dot yellow"
          type="button"
          aria-label="Minimize"
          @pointerdown.stop
          @click="emit('minimize')"
        ></button>
        <button
          class="dot green"
          type="button"
          aria-label="Maximize"
          @pointerdown.stop
          @click="emit('maximize')"
        ></button>
      </div>

      <motion class="title">{{ project.title }}</motion>

      <button
        class="iconBtn"
        type="button"
        :aria-label="t.window.close"
        @pointerdown.stop
        @click="closeAnimated"
      >
        ✕
      </button>
    </header>

    <div class="content">
      <div v-if="project.previewImageUrl" class="hero">
        <img
          :src="project.previewImageUrl"
          :alt="`${project.title} preview`"
          loading="lazy"
        />
        <div class="reflection"></div>
      </div>

      <div class="copy">
        <p class="desc">{{ project.description }}</p>

        <div class="pills">
          <span v-for="tech in project.technologies" :key="tech" class="pill">{{ tech }}</span>
        </div>

        <div class="actions">
          <a class="cta" :href="project.liveUrl" target="_blank" rel="noreferrer">
            {{ t.desktop.openLive }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.win {
  position: fixed;
  z-index: 10;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(10, 12, 18, 0.62);
  backdrop-filter: blur(18px) saturate(140%);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.06) inset;
}

.win.minimized {
  opacity: 0;
  pointer-events: none;
  transform: translate3d(0, 120vh, 0) scale(0.98);
}

.titlebar {
  height: 44px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  cursor: default;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.traffic {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.35);
  padding: 0;
  cursor: pointer;
}

.red {
  background: #ff5f57;
}

.yellow {
  background: #febc2e;
}

.green {
  background: #28c840;
}

.title {
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.72);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.iconBtn {
  width: 34px;
  height: 30px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  cursor: pointer;
}

.iconBtn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.content {
  display: grid;
  grid-template-rows: 1fr auto;
  height: calc(100% - 44px);
}

.hero {
  position: relative;
  min-height: 240px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: saturate(1.05) contrast(1.05);
}

.reflection {
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.18), transparent 62%);
  opacity: 0.35;
  mix-blend-mode: screen;
  transform: translateX(-30%);
  animation: sweep 6.5s ease-in-out infinite;
}

@keyframes sweep {
  0% {
    transform: translateX(-35%);
  }
  50% {
    transform: translateX(35%);
  }
  100% {
    transform: translateX(-35%);
  }
}

.copy {
  padding: 16px 16px 18px;
}

.meta {
  margin: 0 0 10px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 13px;
}

.desc {
  margin: 0 0 12px;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.55;
}

.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.pill {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.78);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  text-decoration: none;
  border: 1px solid rgba(120, 200, 255, 0.35);
  background: radial-gradient(circle at 20% 20%, rgba(120, 200, 255, 0.25), rgba(255, 255, 255, 0.04));
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.92);
  font-size: 13px;
}

.cta.secondary {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
}

@media (prefers-reduced-motion: reduce) {
  .reflection {
    animation: none;
  }
}
</style>