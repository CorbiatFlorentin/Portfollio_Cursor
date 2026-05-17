import type { Project } from "../types/project";

const API_URL =
  (import.meta as ImportMeta & {
    env: {
      VITE_API_URL: string;
    };
  }).env.VITE_API_URL;

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_URL}/projects`);

  if (!res.ok) {
    throw new Error(`Failed to load projects (${res.status})`);
  }

  return (await res.json()) as Project[];
}