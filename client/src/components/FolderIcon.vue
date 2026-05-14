<script setup lang="ts">
import { ref } from "vue";
import type { Project } from "../types/project";

const props = defineProps<{ project: Project }>();
const emit = defineEmits<{ (e: "open", p: Project): void }>();

const pressing = ref(false);

const onDown = () => (pressing.value = true);
const onUp = () => (pressing.value = false);

const onDbl = () => emit("open", props.project);
</script>

<template>
  <button
    class="folder"
    type="button"
    @pointerdown="onDown"
    @pointerup="onUp"
    @pointerleave="onUp"
    @pointercancel="onUp"
    @dblclick.prevent="onDbl"
    :aria-label="`Open project ${project.title}`"
  >
    <div class="icon" :class="{ press: pressing }">
      <div class="tab"></div>
      <div class="body">
        <div class="shine"></div>
      </div>
    </div>
    <div class="label">{{ project.title }}</div>
  </button>
</template>

<style scoped>
.folder {
  width: 92px;
  border: 0;
  background: transparent;
  padding: 10px 8px;
  cursor: pointer;
  user-select: none;
  text-align: center;
  color: rgba(255, 255, 255, 0.92);
}

.icon {
  width: 76px;
  height: 58px;
  margin: 0 auto;
  position: relative;
  filter: drop-shadow(0 14px 22px rgba(0, 0, 0, 0.55));
  transition: transform 220ms ease, filter 220ms ease;
}

.folder:hover .icon {
  transform: translateY(-2px) scale(1.03);
  filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.62)) drop-shadow(0 0 18px rgba(120, 200, 255, 0.22));
}

.icon.press {
  transform: translateY(1px) scale(0.98);
}

.tab {
  position: absolute;
  left: 10px;
  top: 6px;
  width: 34px;
  height: 12px;
  border-radius: 8px 8px 0 0;
  background: linear-gradient(180deg, rgba(255, 220, 160, 0.95), rgba(255, 190, 110, 0.85));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.body {
  position: absolute;
  left: 0;
  right: 0;
  top: 16px;
  bottom: 0;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 210, 120, 0.95), rgba(210, 140, 40, 0.92));
  border: 1px solid rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.shine {
  position: absolute;
  inset: -40% -40%;
  background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.55), transparent 55%);
  opacity: 0.55;
  transform: rotate(-12deg);
}

.label {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.15;
  text-shadow: 0 10px 24px rgba(0, 0, 0, 0.65);
  color: rgba(255, 255, 255, 0.86);
}

@media (prefers-reduced-motion: reduce) {
  .icon {
    transition: none;
  }
}
</style>
