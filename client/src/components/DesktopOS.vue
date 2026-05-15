<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { Project } from "../types/project";
import { fetchProjects } from "../api/projects";

import FolderIcon from "./FolderIcon.vue";
import PdfIcon from "./PdfIcon.vue";
import CmdIcon from "./CmdIcon.vue";

import ProjectWindow from "./ProjectWindow.vue";
import PdfWindow from "./PdfWindow.vue";
import ContactTerminalWindow from "./ContactTerminalWindow.vue";

import LocaleSwitcher from "./LocaleSwitcher.vue";

import { useParallax } from "../composables/useParallax";
import { useWindowManager } from "../composables/useWindowManager";

const root = ref<HTMLElement | null>(null);

const { tx, ty } = useParallax(root, { maxPx: 10 });

const {
  windows,
  openProject,
  openPdf,
  openContact,
  focus,
  close,
  minimize,
  maximize
} = useWindowManager();

const projects = ref<Project[]>([]);
const err = ref<string | null>(null);

const layerStyle = computed(() => ({
  transform: `translate3d(${tx.value}px, ${ty.value}px, 0)`
}));

onMounted(async () => {
  try {
    projects.value = await fetchProjects();
  } catch (e) {
    err.value = e instanceof Error ? e.message : "Failed to load projects";
  }
});
</script>

<template>
  <main class="os" ref="root">
    <LocaleSwitcher />

    <div class="wallpaper" :style="layerStyle"></div>
    <div class="vignette"></div>

    <div class="dust" aria-hidden="true">
      <span
        v-for="n in 26"
        :key="n"
        class="p"
        :style="`--i:${n}`"
      ></span>
    </div>

    <section class="desktop" v-if="!err">
      <FolderIcon
        v-for="p in projects"
        :key="p.id"
        :project="p"
        @open="openProject"
      />

      <PdfIcon @open="openPdf" />

      <CmdIcon @open="openContact" />
    </section>

    <section v-else class="error">
      <div class="card">
        <div class="h">
          Could not reach the API
        </div>

        <div class="s">
          {{ err }}
        </div>

        <div class="s">
          Start the server in <code>server/</code>
          on port <code>3001</code>, then refresh.
        </div>
      </div>
    </section>

    <template v-for="w in windows" :key="w.id">
      <template v-if="w">
        <ProjectWindow
          v-if="w.kind === 'project' && w.project"
          :model="w"
          :style="{ zIndex: w.z }"
          @close="close(w.id)"
          @minimize="minimize(w.id)"
          @maximize="maximize(w.id)"
          @focus="focus(w.id)"
        />

        <PdfWindow
          v-else-if="w.kind === 'pdf'"
          :x="w.x"
          :y="w.y"
          :z="w.z"
          :minimized="w.minimized"
          :maximized="w.maximized"
          @close="close(w.id)"
          @focus="focus(w.id)"
        />

        <ContactTerminalWindow
          v-else-if="w.kind === 'contact'"
          :x="w.x"
          :y="w.y"
          :z="w.z"
          :minimized="w.minimized"
          :maximized="w.maximized"
          @close="close(w.id)"
          @focus="focus(w.id)"
        />
      </template>
    </template>
  </main>
</template>

<style scoped>
.os {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.wallpaper {
  position: absolute;
  inset: -3%;
  background:
    radial-gradient(
      1200px 700px at 30% 20%,
      rgba(120, 200, 255, 0.18),
      transparent 60%
    ),
    radial-gradient(
      900px 600px at 70% 60%,
      rgba(190, 120, 255, 0.14),
      transparent 55%
    ),
    linear-gradient(
      180deg,
      #070814,
      #05060a 55%,
      #04050a
    );

  will-change: transform;
}

.vignette {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at 50% 45%,
      transparent 45%,
      rgba(0, 0, 0, 0.55) 100%
    );

  pointer-events: none;
}

.dust {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.55;
}

.p {
  position: absolute;

  left: calc(5% + (var(--i) * 37px) % 90%);
  top: calc(10% + (var(--i) * 53px) % 80%);

  width: 2px;
  height: 2px;

  border-radius: 99px;

  background: rgba(255, 255, 255, 0.35);

  animation: drift calc(10s + (var(--i) * 0.35s)) linear infinite;
}

@keyframes drift {
  to {
    transform: translate3d(18px, -120px, 0);
    opacity: 0.15;
  }
}

.desktop {
  position: relative;
  z-index: 2;

  height: 100%;

  padding: 28px;

  display: flex;
  flex-wrap: wrap;

  gap: 18px 22px;

  align-content: flex-start;
}

.error {
  height: 100%;
  display: grid;
  place-items: center;
  padding: 24px;
}

.card {
  width: min(720px, 100%);

  border-radius: 16px;
  padding: 16px;

  border: 1px solid rgba(255, 255, 255, 0.12);

  background: rgba(10, 12, 18, 0.55);

  backdrop-filter: blur(16px);
}

.h {
  font-size: 16px;
  margin-bottom: 8px;
}

.s {
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.5;
}
</style>