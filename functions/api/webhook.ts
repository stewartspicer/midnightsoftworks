/**
 * POST /api/webhook — Lemon Squeezy webhook receiver.
 *
 * order_created → verify signature → idempotency check → sign a per-order
 * gudrun.key (licensee = buyer email) → store in D1 → email it (best-effort).
 * Everything else is acked with 200 so LS doesn't retry events we ignore.
 *
 * This endpoint mints licenses: NOTHING happens on an unverified body.
 */
import { signLicense } from "../_lib/license";
import { verifyWebhookSignature } from "../_lib/lemonsqueezy";

interface Env {
  DB: D1Database;
  LICENSE_PRIVATE_KEY: string;
  LS_WEBHOOK_SECRET: string;
  RESEND_API_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const rawBody = await ctx.request.arrayBuffer();

  const ok = await verifyWebhookSignature(
    rawBody, ctx.request.headers.get("X-Signature"), ctx.env.LS_WEBHOOK_SECRET);
  if (!ok) return new Response("invalid signature", { status: 401 });

  let event: any;
  try {
    event = JSON.parse(new TextDecoder().decode(rawBody));
  } catch {
    return new Response("malformed body", { status: 400 });
  }

  if (event?.meta?.event_name !== "order_created")
    return new Response("ignored", { status: 200 });

  const orderId = String(event?.data?.id ?? "");
  const email = String(event?.data?.attributes?.user_email ?? "").trim().toLowerCase();
  if (!orderId || !email) return new Response("missing order fields", { status: 400 });

  // Idempotency: LS retries failed webhooks; a fulfilled order must not
  // re-sign or re-email.
  const existing = await ctx.env.DB
    .prepare("SELECT order_id FROM orders WHERE order_id = ?").bind(orderId).first();
  if (existing) return new Response("already fulfilled", { status: 200 });

  const licenseFile = await signLicense({ licensee: email }, ctx.env.LICENSE_PRIVATE_KEY);
  await ctx.env.DB
    .prepare("INSERT INTO orders (order_id, email, license_file, issued_at) VALUES (?, ?, ?, ?)")
    .bind(orderId, email, licenseFile, new Date().toISOString())
    .run();

  // Email is best-effort: the key is already safe in D1 and reachable via
  // /thanks and /license, so a mail failure must not 500 the webhook (LS
  // would retry into our idempotency wall and the buyer would get nothing).
  if (ctx.env.RESEND_API_KEY) {
    const delivered = await sendLicenseEmail(ctx.env.RESEND_API_KEY, email, orderId, licenseFile);
    if (delivered) {
      await ctx.env.DB
        .prepare("UPDATE orders SET delivered_at = ? WHERE order_id = ?")
        .bind(new Date().toISOString(), orderId)
        .run();
    }
  }

  return new Response("fulfilled", { status: 200 });
};

async function sendLicenseEmail(
  apiKey: string, to: string, orderId: string, licenseFile: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Midnight Softworks <licenses@midnightsoftworks.com>",
        to: [to],
        subject: "Your Gudrun license",
        // Inline copy as well as attachment: some corporate filters strip
        // unknown attachments, and the file is three short lines.
        text:
`Thanks for buying Gudrun!

Attached is your license file, gudrun.key. To activate:
  1. Save it to %APPDATA%\\Gudrun\\  (or the folder containing Gudrun.exe), or
  2. Use the Import button in the reminder dialog.

If the attachment is missing, create a file named gudrun.key containing
exactly these lines:

${licenseFile}
Lost the file later? Re-download any time:
https://midnightsoftworks.com/license  (order #${orderId} + this email address)

Reply to this email for support.`,
        attachments: [{ filename: "gudrun.key", content: btoa(licenseFile) }],
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
