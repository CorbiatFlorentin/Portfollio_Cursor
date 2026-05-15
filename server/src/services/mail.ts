import nodemailer from "nodemailer";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function sendContactEmail(input: {
  name: string;
  email: string;
  message: string;
}) {
  const host = process.env.SMTP_HOST || "smtp.mail.yahoo.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE !== "false"; // true for 465

  const user = required("SMTP_USER");
  const pass = required("SMTP_PASS");
  const to = process.env.CONTACT_TO || user;
  const from = process.env.CONTACT_FROM || user;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });

  const subject = `[Portfolio] Message from ${input.name}`;
  const text = [
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    "",
    input.message
  ].join("\n");

  await transporter.sendMail({
    from,
    to,
    replyTo: input.email,
    subject,
    text
  });
}
