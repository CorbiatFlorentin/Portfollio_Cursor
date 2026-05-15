import type { Request, Response } from "express";
import { sendContactEmail } from "../services/mail.js";

export type ContactBody = {
  name?: string;
  email?: string;
  message?: string;
};

const emailOk = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function postContact(
  req: Request,
  res: Response
) {
  const body = req.body as ContactBody;

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const message = (body.message || "").trim();

  if (name.length < 2) {
    return res.status(400).json({
      error: "Name too short"
    });
  }

  if (!emailOk(email)) {
    return res.status(400).json({
      error: "Invalid email"
    });
  }

  if (message.length < 5) {
    return res.status(400).json({
      error: "Message too short"
    });
  }

  try {
    await sendContactEmail({
      name,
      email,
      message
    });

    return res.json({
      ok: true
    });
  } catch (err) {
    console.error("[CONTACT ERROR]", err);

    return res.status(500).json({
      error: "Failed to send email"
    });
  }
}