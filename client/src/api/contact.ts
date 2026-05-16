export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export async function sendContact(
  payload: ContactPayload
): Promise<void> {

  console.log("[CONTACT PAYLOAD]", payload);

  const res = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  console.log("[CONTACT STATUS]", res.status);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));

    console.error("[CONTACT ERROR RESPONSE]", data);

    throw new Error(
      (data as { error?: string }).error || `HTTP ${res.status}`
    );
  }

  const successData = await res.json().catch(() => ({}));

  console.log("[CONTACT SUCCESS]", successData);
}