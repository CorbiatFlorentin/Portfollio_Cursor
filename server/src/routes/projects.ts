import type { Request, Response } from "express";
import type { ProjectDto } from "../types.js";
import { projects as manualProjects } from "../data/projects.js";
import { staticProjects } from "../data/staticProjects.js";
import { fetchGithubProjects } from "../services/github.js";

export async function getProjects(_req: Request, res: Response) {
  try {
    const githubProjects = await fetchGithubProjects();
    const payload: ProjectDto[] = [
      ...(githubProjects.length ? githubProjects : manualProjects),
      ...staticProjects
    ];
    res.json(payload);
  } catch (e) {
    console.error("[projects]", e);
    res.json([...manualProjects, ...staticProjects]);
  }
}
