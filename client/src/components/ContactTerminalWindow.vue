<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import gsap from "gsap";
import { sendContact } from "../api/contact";
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
const logEl = ref<HTMLElement | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);
const input = ref("");

type Step = "booting" | "name" | "email" | "message" | "sending" | "done";
const step = ref<Step>("booting");
const lines = ref<string[]>([]);
const data = ref({ name: "", email: "", message: "" });

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const canType = computed(() => step.value === "name" || step.value === "email" || step.value === "message");

const push = (s: string) => {
  lines.value.push(s);
  nextTick(() => {
    if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight;
  });
};

const pause = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const boot = async () => {
  push(t.value.contact.prompt);
  await pause(350);
  push(t.value.contact.init);
  await pause(500);
  step.value = "name";
  push(t.value.contact.askName);
  inputEl.value?.focus();
};

const submitLine = async () => {
  const v = input.value.trim();
  if (!v || !canType.value) return;

  push(`> ${v}`);
  input.value = "";

  if (step.value === "name") {
    data.value.name = v;
    step.value = "email";
    push(t.value.contact.askEmail);
    return;
  }

  if (step.value === "email") {
    if (!emailOk(v)) {
      push(t.value.contact.invalidEmail);
      push(t.value.contact.askEmail);
      return;
    }
    data.value.email = v;
    step.value = "message";
    push(t.value.contact.askMessage);
    return;
  }

  if (step.value === "message") {
    data.value.message = v;
    step.value = "sending";
    push(t.value.contact.sending);

    try {
      await sendContact({ ...data.value });
      step.value = "done";
      push(t.value.contact.success);
    } catch {
      step.value = "message";
      push(t.value.contact.error);
      push(t.value.contact.askMessage);
    }
  }
};

onMounted(() => {
  if (root.value) {
    gsap.fromTo(
      root.value,
      { opacity: 0, scale: 0.985 },
      { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }
    );
  }
  boot();
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
      width: maximized ? 'auto' : 'min(760px, calc(100vw - 36px))',
      height: maximized ? 'auto' : 'min(520px, calc(100vh - 36px))'
    }"
    @pointerdown="emit('focus')"
  >
    <header class="bar">
      <span class="title">{{ t.contact.title }}</span>
      <button type="button" class="x" :aria-label="t.window.close" @click="closeAnimated">✕</button>
    </header>

    <div ref="logEl" class="log">
  <div
    v-for="(line, i) in lines"
    :key="i"
    class="line"
  >
    {{ line }}
  </div>
</div>

    <form class="inputRow" @submit.prevent="submitLine">
      <span class="caret">&gt;</span>
      <input
        ref="inputEl"
        v-model="input"
        :disabled="!canType"
        :placeholder="t.contact.hint"
        autocomplete="off"
        spellcheck="false"
      />
    </form>
  </section>
</template>

<style scoped>
.win {
  position: fixed;
  display: grid;
  grid-template-rows: 44px 1fr 48px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #06080c;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.65);
  font-family: ui-monospace, Consolas, "Courier New", monospace;
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
  background: rgba(255, 255, 255, 0.04);
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

.log {
  padding: 14px;
  overflow: auto;
  color: #cde8cd;
  font-size: 13px;
  line-height: 1.45;
}

.line {
  white-space: pre-wrap;
  margin-bottom: 4px;
}

.inputRow {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: #04060a;
}

.caret {
  color: #9fe870;
}

input {
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  color: #e8ffe8;
  font: inherit;
}

input:disabled {
  opacity: 0.5;
}

input::placeholder {
  color: rgba(232, 255, 232, 0.35);
}
</style>
