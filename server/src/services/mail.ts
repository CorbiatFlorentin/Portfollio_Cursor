import nodemailer from "nodemailer";

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }

  return value;
}

export async function sendContactEmail(input: {
  name: string;
  email: string;
  message: string;
}) {

  const host = process.env.SMTP_HOST || "smtp.mail.yahoo.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE !== "false";

  const user = required("SMTP_USER");
  const pass = required("SMTP_PASS");

  const to = process.env.CONTACT_TO || user;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });

  const cleanName = input.name.trim();

  const cleanEmail = input.email
    .trim()
    .toLowerCase();

  const cleanMessage = input.message
    .replace(/\r/g, "")
    .trim();

  const subject = `[Portfolio] Message from ${cleanName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 16px;">
      
      <h2 style="margin-bottom: 24px;">
        Nouveau message portfolio
      </h2>

      <p>
        <strong>Nom :</strong>
        ${cleanName}
      </p>

      <p>
        <strong>Email :</strong>
        ${cleanEmail}
      </p>

      <p>
        <strong>Message :</strong>
      </p>

      <p>
        ${cleanMessage.replace(/\n/g, "<br>")}
      </p>

    </div>
  `;

  await transporter.sendMail({
    from: `"Portfolio Contact" <${user}>`,
    to,
    subject,
    html
  });
}