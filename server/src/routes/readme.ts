import type { Request, Response } from "express";

const TTL = 30 * 60 * 1000;
const cache = new Map<string, { html: string; ts: number }>();

export async function getReadme(req: Request, res: Response) {
  const { id } = req.params;

  if (!id.startsWith("gh-")) {
    res.status(404).json({ error: "No README available for this project" });
    return;
  }

  const username = process.env.GITHUB_USERNAME?.trim();
  if (!username) {
    res.status(503).json({ error: "GITHUB_USERNAME not configured" });
    return;
  }

  const repoName = id.slice(3);

  const hit = cache.get(id);
  if (hit && Date.now() - hit.ts < TTL) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(hit.html);
    return;
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.html",
    "User-Agent": "portfolio-workstation"
  };

  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const ghRes = await fetch(
      `https://api.github.com/repos/${username}/${repoName}/readme`,
      { headers }
    );

    if (!ghRes.ok) {
      res.status(ghRes.status).json({ error: "README not found" });
      return;
    }

    const html = await ghRes.text();
    cache.set(id, { html, ts: Date.now() });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (e) {
    console.error("[readme]", e);
    res.status(500).json({ error: "Failed to fetch README" });
  }
}
