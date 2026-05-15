<script setup lang="ts">
import { onMounted, ref } from "vue";
import gsap from "gsap";
import { useI18n } from "../composables/useI18n";

const props = defineProps<{
  x: number;
  y: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
}>();

const emit = defineEmits<{ (e: "close"): void; (e: "focus"): void }>();

const { t } = useI18n();
const root = ref<HTMLElement | null>(null);
const cvUrl = "/cv.pdf";

onMounted(() => {
  if (!root.value) return;
  gsap.fromTo(
    root.value,
    { opacity: 0, scale: 0.985 },
    { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }
  );
});

const closeAnimated = () => {
  if (!root.value) {
    emit("close");
    return;
  }
  gsap.to(root.value, {
    opacity: 0,
    scale: 0.985,
    duration: 0.3,
    ease: "power2.in",
    onComplete: () => emit("close")
  });
};
</script>

<template>
  <section
    ref="root"
    class="win"
    :class="{ minimized, maximized }"
    :style="{
      zIndex: z,
      transform: maximized ? 'none' : `translate3d(${x}px, ${y}px, 0)`,
      left: maximized ? '18px' : '0',
      top: maximized ? '18px' : '0',
      right: maximized ? '18px' : 'auto',
      bottom: maximized ? '18px' : 'auto',
      width: maximized ? 'auto' : 'min(920px, calc(100vw - 36px))',
      height: maximized ? 'auto' : 'min(760px, calc(100vh - 36px))'
    }"
    @pointerdown="emit('focus')"
  >
    <header class="bar">
      <span class="title">{{ t.pdf.title }}</span>
      <button type="button" class="x" :aria-label="t.window.close" @click="closeAnimated">✕</button>
    </header>

    <iframe class="frame" :src="cvUrl" :title="t.pdf.title"></iframe>

    <footer class="actions">
      <a class="btn" :href="cvUrl" target="_blank" rel="noreferrer">{{ t.desktop.openTab }}</a>
      <a class="btn primary" :href="cvUrl" download>{{ t.desktop.downloadCv }}</a>
    </footer>
  </section>
</template>

<style scoped>
.win {
  position: fixed;
  display: grid;
  grid-template-rows: 44px 1fr auto;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(10, 12, 18, 0.72);
  backdrop-filter: blur(18px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.65);
}

.win.minimized {
  opacity: 0;
  pointer-events: none;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
}

.title {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
}

.x {
  width: 34px;
  height: 30px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  cursor: pointer;
}

.x:hover {
  background: rgba(255, 255, 255, 0.1);
}

.frame {
  width: 100%;
  border: 0;
  background: #111;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.btn {
  padding: 10px 14px;
  border-radius: 10px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 13px;
}

.btn.primary {
  border-color: rgba(120, 200, 255, 0.35);
  background: rgba(120, 200, 255, 0.12);
}
</style>
