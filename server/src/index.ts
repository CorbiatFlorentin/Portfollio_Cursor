import "dotenv/config";
import express from "express";
import cors from "cors";
import { getProjects } from "./routes/projects.js";
import { postContact } from "./routes/contact.js";

const app = express();
app.use(
  cors({
    origin: [
      "https://portfollio-corbiat-florentin.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/projects", getProjects);

app.post("/api/contact", postContact);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});