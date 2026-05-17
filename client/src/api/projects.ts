import type { Project } from "../types/project";

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/projects`);
  if (!res.ok) throw new Error(`Failed to load projects (${res.status})`);
  return (await res.json()) as Project[];
}