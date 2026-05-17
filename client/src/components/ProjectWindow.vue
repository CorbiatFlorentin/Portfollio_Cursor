<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
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

const previewBroken = ref(false);

watch(
  () => project.value?.previewImageUrl,
  () => {
    previewBroken.value = false;
  }
);

const showPreviewImage = computed(() => {
  return !!project.value?.previewImageUrl && !previewBroken.value;
});

const onPreviewError = () => {
  previewBroken.value = true;
};

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
      transform: "none",
      zIndex: props.model.z
    } as const;
  }

  return {
    left: "0",
    top: "0",
    width: "min(900px, calc(100vw - 36px))",
    height: "min(640px, calc(100vh - 36px))",
    transform: `translate3d(${props.model.x}px, ${props.model.y}px, 0)`,
    zIndex: props.model.z
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

  props.model.x = winStartX + (e.clientX - dragStartX);
  props.model.y = winStartY + (e.clientY - dragStartY);
};

const onUpBar = () => {
  dragging.value = false;
};

onMounted(() => {
  if (!root.value) return;

  gsap.fromTo(
    root.value,
    { opacity: 0, scale: 0.985 },
    { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }
  );
});

const closeAnimated = () => {
  if (!root.value) return emit("close");

  gsap.to(root.value, {
    opacity: 0,
    scale: 0.985,
    duration: 0.3,
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
      class="bar"
      @pointerdown="onDownBar"
      @pointermove="onMoveBar"
      @pointerup="onUpBar"
      @pointercancel="onUpBar"
    >
      <span class="title">{{ project.title }}</span>

      <div class="controls">
        <button
          type="button"
          class="btn98"
          @pointerdown.stop
          @click="emit('minimize')"
        >
          _
        </button>

        <button
          type="button"
          class="btn98"
          @pointerdown.stop
          @click="emit('maximize')"
        >
          □
        </button>

        <button
          type="button"
          class="btn98"
          @pointerdown.stop
          @click="closeAnimated"
        >
          ✕
        </button>
      </div>
    </header>

    <div class="body">
      <div class="hero">
        <img
          v-if="showPreviewImage"
          :src="project.previewImageUrl"
          :alt="`${project.title} preview`"
          loading="lazy"
          referrerpolicy="no-referrer"
          @error="onPreviewError"
        />

        <div v-else class="preview404" role="status">
          <div class="browserBar">
            <span class="browserIcon">🌐</span>

            <span class="browserUrl">
              {{ project.liveUrl }}
            </span>
          </div>

          <div class="errorBox">
            <div class="errorIcon">X</div>

            <div class="errorText">
              <h2>{{ t.preview.notFoundTitle }}</h2>

              <p>{{ t.preview.notFoundLine1 }}</p>

              <p class="muted">
                {{ t.preview.notFoundLine2 }}
              </p>

              <a
                class="tryLink"
                :href="project.liveUrl"
                target="_blank"
                rel="noreferrer"
              >
                {{ t.preview.tryLive }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="pills">
        <span
          v-for="tech in project.technologies"
          :key="tech"
          class="pill"
        >
          {{ tech }}
        </span>
      </div>

      <div class="actions">
        <a
          class="btn primary"
          :href="project.liveUrl"
          target="_blank"
          rel="noreferrer"
        >
          {{ t.desktop.openLive }}
        </a>

        <a
          v-if="project.githubUrl"
          class="btn"
          :href="project.githubUrl"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.win {
  position: fixed;
  display: grid;
  grid-template-rows: 28px 1fr;
  overflow: hidden;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  background: #c0c0c0;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.6);
  font-family: Tahoma, "MS Sans Serif", sans-serif;
}

.win.minimized {
  opacity: 0;
  pointer-events: none;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  background: linear-gradient(90deg, #000080, #1084d0);
  color: #fff;
  cursor: default;
  user-select: none;
}

.title {
  font-size: 12px;
  font-weight: bold;
  text-shadow: 1px 1px 0 #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.controls {
  display: flex;
  gap: 2px;
}

.btn98 {
  width: 16px;
  height: 14px;
  padding: 0;
  line-height: 12px;
  font-size: 10px;
  font-weight: bold;
  color: #000;
  background: #c0c0c0;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  cursor: pointer;
}

.body {
  padding: 12px;
  overflow: auto;
  background: #c0c0c0;
}

.hero {
  margin-bottom: 10px;
  border: 2px inset #c0c0c0;
  overflow: hidden;
  min-height: 200px;
  max-height: 240px;
  background: #fff;
}

.hero img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.preview404 {
  height: 220px;
  display: grid;
  grid-template-rows: 24px 1fr;
  background: #c0c0c0;
  font-family: Tahoma, "MS Sans Serif", sans-serif;
}

.browserBar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 6px;
  background: #ece9d8;
  border-bottom: 1px solid #808080;
  font-size: 11px;
}

.browserIcon {
  font-size: 12px;
}

.browserUrl {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #000080;
}

.errorBox {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #fff;
  margin: 8px;
  border: 2px inset #c0c0c0;
}

.errorIcon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  font-size: 28px;
  font-weight: bold;
  color: #c00;
  border: 2px solid #c0c0c0;
  background: #fff;
}

.errorText h2 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #000080;
}

.errorText p {
  margin: 0 0 6px;
  font-size: 12px;
  color: #000;
  line-height: 1.4;
}

.errorText .muted {
  color: #444;
}

.tryLink {
  display: inline-block;
  margin-top: 8px;
  font-size: 12px;
  color: #000080;
  text-decoration: underline;
  cursor: pointer;
}

.meta {
  margin: 0 0 8px;
  font-size: 12px;
  color: #222;
}

.desc {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.45;
  color: #111;
}

.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.pill {
  font-size: 11px;
  padding: 4px 8px;
  background: #d4d0c8;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  text-decoration: none;
  color: #000;
  font-size: 12px;
  font-weight: bold;
  background: #c0c0c0;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
}

.btn.primary {
  background: #d4d0c8;
}
</style>