import { computed, reactive } from "vue";
import type { Project } from "../types/project";

export type WindowKind =
  | "project"
  | "pdf"
  | "contact";

export type OpenWindow = {
  id: string;
  kind: WindowKind;
  project?: Project;

  x: number;
  y: number;
  z: number;

  minimized: boolean;
  maximized: boolean;
};

let zSeed = 500;

export function useWindowManager() {
  const state = reactive<{
    windows: OpenWindow[];
  }>({
    windows: []
  });

  const open = (
    kind: WindowKind,
    id: string,
    project?: Project
  ) => {
    const existing = state.windows.find(
      (w) => w.id === id
    );

    if (existing) {
      existing.z = ++zSeed;
      existing.minimized = false;
      return;
    }

    const offset = 26 * state.windows.length;

    state.windows.push({
      id,
      kind,
      project,

      x: 80 + offset,
      y: 70 + offset,

      z: ++zSeed,

      minimized: false,

      // PDF ouvert directement en grand
      maximized: kind === "pdf"
    });
  };

  const openProject = (project: Project) =>
    open("project", project.id, project);

  const openPdf = () =>
    open("pdf", "cv-pdf");

  const openContact = () =>
    open("contact", "contact-cmd");

  const focus = (id: string) => {
    const w = state.windows.find(
      (x) => x.id === id
    );

    if (w) {
      w.z = ++zSeed;
    }
  };

  const close = (id: string) => {
    state.windows = state.windows.filter(
      (w) => w.id !== id
    );
  };

  const minimize = (id: string) => {
    const w = state.windows.find(
      (x) => x.id === id
    );

    if (w) {
      w.minimized = true;
    }
  };

  const maximize = (id: string) => {
    const w = state.windows.find(
      (x) => x.id === id
    );

    if (!w) return;

    w.maximized = !w.maximized;

    w.z = ++zSeed;
  };

  const windows = computed(() =>
    [...state.windows].sort(
      (a, b) => a.z - b.z
    )
  );

  return {
    windows,

    openProject,
    openPdf,
    openContact,

    focus,
    close,
    minimize,
    maximize
  };
}