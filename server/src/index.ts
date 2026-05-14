import express from "express";
import cors from "cors";
import type { ProjectDto } from "./types.js";
import { projects } from "./data/projects.js";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/projects", (_req, res) => {
  const payload: ProjectDto[] = projects;
  res.json(payload);
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
