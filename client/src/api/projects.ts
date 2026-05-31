import type { Project } from "../types/project";

const API_URL =
  (import.meta as ImportMeta & {
    env: {
      VITE_API_URL: string;
    };
  }).env.VITE_API_URL;

const CACHE_KEY = "portfolio_projects";
const CACHE_TTL = 10 * 60 * 1000; // 10 min

type CacheEntry = { ts: number; data: Project[] };

function readCache(): Project[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_TTL) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache(data: Project[]) {
  try {
    const entry: CacheEntry = { ts: Date.now(), data };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // sessionStorage peut être indisponible (mode privé strict)
  }
}

// Promise partagée pour éviter les doubles requêtes simultanées
let inflight: Promise<Project[]> | null = null;

export function fetchProjects(): Promise<Project[]> {
  const cached = readCache();
  if (cached) return Promise.resolve(cached);

  if (inflight) return inflight;

  inflight = fetch(`${API_URL}/api/projects`)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load projects (${res.status})`);
      return res.json() as Promise<Project[]>;
    })
    .then((data) => {
      writeCache(data);
      inflight = null;
      return data;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });

  return inflight;
}

const readmeCache = new Map<string, string>();
const readmeInflight = new Map<string, Promise<string>>();

export function fetchReadme(projectId: string): Promise<string> {
  if (readmeCache.has(projectId)) return Promise.resolve(readmeCache.get(projectId)!);

  if (readmeInflight.has(projectId)) return readmeInflight.get(projectId)!;

  const req = fetch(`${API_URL}/api/projects/${encodeURIComponent(projectId)}/readme`)
    .then((res) => {
      if (!res.ok) throw new Error(`README not found (${res.status})`);
      return res.text();
    })
    .then((html) => {
      readmeCache.set(projectId, html);
      readmeInflight.delete(projectId);
      return html;
    })
    .catch((err) => {
      readmeInflight.delete(projectId);
      throw err;
    });

  readmeInflight.set(projectId, req);
  return req;
}