export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

const API_URL = import.meta.env.VITE_API_URL;
console.log("API URL =", API_URL);

export async function sendContact(
  payload: ContactPayload
): Promise<void> {
  console.log("[CONTACT PAYLOAD]", payload);

  const res = await fetch(`${API_URL}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  console.log("[CONTACT STATUS]", res.status);

  let data: any = {};

  try {
    data = await res.json();
  } catch {
    console.warn("No JSON response");
  }

  if (!res.ok) {
    console.error("[CONTACT ERROR RESPONSE]", data);

    throw new Error(data.error || `HTTP ${res.status}`);
  }

  console.log("[CONTACT SUCCESS]", data);
}