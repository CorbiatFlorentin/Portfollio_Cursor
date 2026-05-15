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
    :aria-label="t.desktop.cvLabel"
  >
    <div class="icon pdf" :class="{ press: pressing }">
      <span class="fold"></span>
      <span class="badge">PDF</span>
    </div>
    <div class="label">{{ t.desktop.cvLabel }}</div>
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
  width: 58px;
  height: 72px;
  margin: 0 auto;
  border-radius: 10px;
  position: relative;
  background: linear-gradient(180deg, #f5f7fc, #d5dbe6);
  border: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: 0 16px 28px rgba(0, 0, 0, 0.45);
  transition: transform 220ms ease, filter 220ms ease;
}
.deskIcon:hover .icon {
  transform: translateY(-2px) scale(1.03);
  filter: drop-shadow(0 0 14px rgba(255, 80, 80, 0.28));
}
.icon.press {
  transform: translateY(1px) scale(0.98);
}
.fold {
  position: absolute;
  right: 0;
  top: 0;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, transparent 50%, rgba(0, 0, 0, 0.1) 50%);
}
.badge {
  position: absolute;
  left: 8px;
  bottom: 10px;
  font-size: 11px;
  font-weight: 800;
  color: #c41e1e;
}
.label {
  margin-top: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.86);
  text-shadow: 0 10px 24px rgba(0, 0, 0, 0.65);
}
</style>
