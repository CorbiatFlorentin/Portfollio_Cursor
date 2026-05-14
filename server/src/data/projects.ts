import type { ProjectDto } from "../types.js";

export const projects: ProjectDto[] = [
  {
    id: "sample-nebula",
    title: "Nebula Console",
    description: "A fictional analytics surface with glass panels, charts, and realtime-ish motion.",
    technologies: ["Vue", "TypeScript", "Vite", "GSAP"],
    liveUrl: "https://example.com",
    previewImageUrl: "https://picsum.photos/seed/nebula/1200/720"
  },
  {
    id: "sample-orbit",
    title: "Orbit CRM",
    description: "A minimalist CRM concept focused on speed, clarity, and keyboard-first flows.",
    technologies: ["TypeScript", "Node", "Express"],
    liveUrl: "https://example.com",
    previewImageUrl: "https://picsum.photos/seed/orbit/1200/720"
  }
];
