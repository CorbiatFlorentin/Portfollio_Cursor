import type { ProjectDto } from "../types.js";

type GhRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  topics?: string[];
  language: string | null;
  fork: boolean;
  archived: boolean;
  private: boolean;
};

export async function fetchGithubProjects(): Promise<ProjectDto[]> {
  const username = process.env.GITHUB_USERNAME?.trim();
  if (!username) return [];

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-workstation"
  };

  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
    headers
  });

  if (!res.ok) {
    console.error("[GitHub]", res.status, await res.text());
    throw new Error(`GitHub API error (${res.status})`);
  }

  const repos = (await res.json()) as GhRepo[];

  const allow = process.env.GITHUB_REPO_FILTER?.split(",").map((s) => s.trim()).filter(Boolean);

  return repos
    .filter((r) => !r.private && !r.fork && !r.archived)
    .filter((r) => !allow?.length || allow.includes(r.name))
    .map((r) => ({
      id: `gh-${r.name}`,
      title: formatTitle(r.name),
      description: r.description || "No description on GitHub.",
      technologies: buildTech(r),
      liveUrl: r.homepage?.startsWith("http") ? r.homepage : r.html_url,
      githubUrl: r.html_url,
      stars: r.stargazers_count,
      previewImageUrl: `https://opengraph.githubassets.com/1/${r.full_name}`
    }));
}

function formatTitle(name: string) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildTech(r: GhRepo): string[] {
  const tech = new Set<string>();
  if (r.language) tech.add(r.language);
  (r.topics ?? []).slice(0, 4).forEach((t) => tech.add(t));
  return [...tech].slice(0, 6);
}
