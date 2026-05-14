import { computed, reactive } from "vue";
import type { Project } from "../types/project";

export type OpenWindow = {
  id: string;
  project: Project;
  x: number;
  y: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
};

let zSeed = 50;

export function useWindowManager() {
  const state = reactive<{ windows: OpenWindow[] }>({ windows: [] });

  const openProject = (project: Project) => {
    const existing = state.windows.find((w) => w.id === project.id);
    if (existing) {
      existing.z = ++zSeed;
      existing.minimized = false;
      return;
    }

    const offset = 26 * state.windows.length;
    state.windows.push({
      id: project.id,
      project,
      x: 80 + offset,
      y: 70 + offset,
      z: ++zSeed,
      minimized: false,
      maximized: false
    });
  };

  const focus = (id: string) => {
    const w = state.windows.find((x) => x.id === id);
    if (!w) return;
    w.z = ++zSeed;
  };

  const close = (id: string) => {
    state.windows = state.windows.filter((w) => w.id !== id);
  };

  const minimize = (id: string) => {
    const w = state.windows.find((x) => x.id === id);
    if (!w) return;
    w.minimized = true;
  };

  const maximize = (id: string) => {
    const w = state.windows.find((x) => x.id === id);
    if (!w) return;
    w.maximized = !w.maximized;
    w.z = ++zSeed;
  };

  const sorted = computed(() => [...state.windows].sort((a, b) => a.z - b.z));

  return { windows: sorted, openProject, focus, close, minimize, maximize };
}
