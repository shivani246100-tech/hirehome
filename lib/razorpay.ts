import crypto from "crypto";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export const razorpayEnabled = Boolean(keyId && keySecret);
export const demoCheckoutEnabled = !razorpayEnabled && process.env.NODE_ENV !== "production";

type RazorpayOrderInput = {
  amount: number;
  receipt: string;
  notes?: Record<string, string>;
};

export async function createRazorpayOrder({ amount, receipt, notes }: RazorpayOrderInput) {
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amount * 100,
      currency: "INR",
      receipt,
      notes,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Razorpay order failed: ${response.status}`);
  }

  try {
    return (await response.json()) as { id: string; amount: number; currency: string };
  } catch {
    throw new Error("Razorpay returned an invalid response");
  }
}

export function verifyRazorpaySignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  if (!keySecret) return false;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const signatureBuffer = Buffer.from(input.signature ?? "", "utf8");
  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string) {
  if (!webhookSecret) return false;
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");
  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

export function publicRazorpayKeyId() {
  return keyId ?? null;
}
