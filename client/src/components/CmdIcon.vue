<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "../composables/useI18n";

const emit = defineEmits<{ (e: "open"): void }>();
const { t } = useI18n();
const pressing = ref(false);
</script>

<template>
  <button
    class="deskIcon"
    type="button"
    @pointerdown="pressing = true"
    @pointerup="pressing = false"
    @pointerleave="pressing = false"
    @dblclick.prevent="emit('open')"
    :aria-label="t.desktop.contactLabel"
  >
    <div class="icon cmd" :class="{ press: pressing }">
      <span class="prompt">&gt;_</span>
    </div>

    <div class="label">
      {{ t.desktop.contactLabel }}
    </div>
  </button>
</template>

<style scoped>
.deskIcon {
  width: 92px;
  border: 0;
  background: transparent;
  padding: 10px 8px;
  cursor: pointer;
  user-select: none;
  text-align: center;
}

.icon {
  width: 64px;
  height: 64px;
  margin: 0 auto;
  border-radius: 14px;
  background: #0a0e14;
  border: 1px solid rgba(120, 200, 255, 0.28);
  display: grid;
  place-items: center;
  box-shadow: 0 16px 28px rgba(0, 0, 0, 0.5);
  transition:
    transform 220ms ease,
    filter 220ms ease;
}

.deskIcon:hover .icon {
  transform: translateY(-2px) scale(1.03);
  filter: drop-shadow(0 0 16px rgba(120, 200, 255, 0.28));
}

.icon.press {
  transform: translateY(1px) scale(0.98);
}

.prompt {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 18px;
  color: #9fe870;
}

.label {
  margin-top: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.86);
  text-shadow: 0 10px 24px rgba(0, 0, 0, 0.65);
}
</style>