const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function isEmailDeliveryConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Send an email through the configured provider (Resend by default).
 * When no provider keys exist (local development), the action link is logged
 * to the server console so the flow can still be tested end to end.
 */
export async function sendEmail(input: { to: string; subject: string; text: string; url?: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[hirohome-email] to=${input.to} subject="${input.subject}"`);
    if (input.url) console.log(`[hirohome-email] action_url=${input.url}`);
    return { sent: false };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? "HiroHome <hello@hirohome.in>",
      to: [input.to],
      subject: input.subject,
      text: input.url ? `${input.text}\n\n${input.url}` : input.text,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Email provider failed with status ${response.status}`);
  }

  const data = (await response.json().catch(() => null)) as { id?: string } | null;
  return { sent: true, id: data?.id ?? null };
}

export function buildActionUrl(path: string, token: string) {
  return `${APP_URL}${path}?token=${token}`;
}
