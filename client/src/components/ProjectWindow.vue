<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import gsap from "gsap";
import type { OpenWindow } from "../composables/useWindowManager";
import type { Project } from "../types/project";
import { useI18n } from "../composables/useI18n";
import { fetchReadme } from "../api/projects";

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

const readmeHtml = ref<string | null>(null);
const readmeLoading = ref(false);
const readmeError = ref(false);

watch(
  () => project.value?.id,
  async (id) => {
    if (!id) return;
    readmeHtml.value = null;
    readmeError.value = false;
    readmeLoading.value = true;
    try {
      readmeHtml.value = await fetchReadme(id);
    } catch {
      readmeError.value = true;
    } finally {
      readmeLoading.value = false;
    }
  },
  { immediate: true }
);

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
      <div class="toolbar">
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

      <div class="readme-wrap">
        <div v-if="readmeLoading" class="readme-state">Loading README…</div>

        <div v-else-if="readmeError" class="readme-state muted">
          No README available for this project.
        </div>

        <div
          v-else-if="readmeHtml"
          class="readme-content"
          v-html="readmeHtml"
        />
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
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
  background: #c0c0c0;
}

.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 2px solid #808080;
  background: #d4d0c8;
}

.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

.pill {
  font-size: 11px;
  padding: 2px 7px;
  background: #c0c0c0;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.btn {
  padding: 4px 10px;
  text-decoration: none;
  color: #000;
  font-size: 11px;
  font-weight: bold;
  background: #c0c0c0;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  white-space: nowrap;
}

.btn.primary {
  background: #d4d0c8;
}

.readme-wrap {
  overflow: auto;
  padding: 16px 20px;
  background: #fff;
}

.readme-state {
  font-size: 13px;
  color: #444;
  padding: 24px 0;
  text-align: center;
}

.readme-state.muted {
  color: #888;
}

/* GitHub README HTML styles */
.readme-content {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #24292e;
  word-wrap: break-word;
}

.readme-content :deep(h1),
.readme-content :deep(h2),
.readme-content :deep(h3),
.readme-content :deep(h4) {
  margin: 20px 0 10px;
  font-weight: 600;
  line-height: 1.25;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
}

.readme-content :deep(h1) { font-size: 20px; }
.readme-content :deep(h2) { font-size: 17px; }
.readme-content :deep(h3) { font-size: 15px; border-bottom: none; }

.readme-content :deep(p) {
  margin: 0 0 12px;
}

.readme-content :deep(a) {
  color: #0366d6;
  text-decoration: none;
}

.readme-content :deep(a:hover) {
  text-decoration: underline;
}

.readme-content :deep(code) {
  padding: 2px 5px;
  background: #f3f4f6;
  border-radius: 3px;
  font-size: 12px;
  font-family: "Consolas", "Courier New", monospace;
}

.readme-content :deep(pre) {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 4px;
  padding: 12px;
  overflow: auto;
  margin: 0 0 14px;
}

.readme-content :deep(pre code) {
  padding: 0;
  background: none;
  font-size: 12px;
}

.readme-content :deep(ul),
.readme-content :deep(ol) {
  margin: 0 0 12px;
  padding-left: 20px;
}

.readme-content :deep(li) {
  margin-bottom: 4px;
}

.readme-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.readme-content :deep(blockquote) {
  margin: 0 0 12px;
  padding: 0 12px;
  border-left: 4px solid #dfe2e5;
  color: #6a737d;
}

.readme-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 12px;
  font-size: 13px;
}

.readme-content :deep(th),
.readme-content :deep(td) {
  border: 1px solid #dfe2e5;
  padding: 6px 10px;
}

.readme-content :deep(th) {
  background: #f6f8fa;
  font-weight: 600;
}
</style>