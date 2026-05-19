import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
  const to = required("CONTACT_TO");

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

  const response = await resend.emails.send({
    from: "Portfolio <onboarding@resend.dev>",
    to,
    replyTo: cleanEmail,
    subject,
    html,
  });

  console.log("[RESEND RESPONSE]", response);

  return response;
}