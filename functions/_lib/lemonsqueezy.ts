/**
 * Lemon Squeezy webhook signature verification.
 * LS sends X-Signature: lowercase-hex HMAC-SHA256 of the RAW request body,
 * keyed with the webhook's signing secret. Constant-time comparison via
 * crypto.subtle.verify rather than string equality.
 */
export async function verifyWebhookSignature(
  rawBody: ArrayBuffer,
  signatureHex: string | null,
  secret: string,
): Promise<boolean> {
  if (!signatureHex || !/^[0-9a-fA-F]{64}$/.test(signatureHex)) return false;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const sig = new Uint8Array(32);
  for (let i = 0; i < 32; i++)
    sig[i] = parseInt(signatureHex.slice(i * 2, i * 2 + 2), 16);
  return crypto.subtle.verify("HMAC", key, sig, rawBody);
}
