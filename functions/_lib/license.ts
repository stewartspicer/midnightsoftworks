/**
 * Gudrun license signer — TypeScript port of tools/LicenseTool Sign().
 *
 * File format (verified by Gudrun.Core LicenseVerifier, which checks the
 * signature over the payload line's LITERAL UTF-8 bytes — no canonicalization):
 *
 *   GUDRUN-LICENSE-V1
 *   {"licensee":"...","type":"personal","seats":1,"issued":"YYYY-MM-DD","expires":null}
 *   sig: <base64 Ed25519 signature over the payload line>
 *
 * Format drift is caught by a cross-implementation fixture test in the Gudrun
 * repo (Gudrun.Core.Tests JsSignerParityTests) — regenerate the fixture with
 * tests/generate-parity-fixture.mjs if this file's output ever changes.
 */

export const HEADER = "GUDRUN-LICENSE-V1";
export const SIG_PREFIX = "sig: ";

/**
 * LicenseTool's private.b64 is the base64 of the raw 32-byte Ed25519 seed.
 * WebCrypto has no raw-seed import for private keys, so wrap the seed in the
 * fixed PKCS#8 prefix for Ed25519 (RFC 8410 structure, constant for any seed).
 */
const PKCS8_ED25519_PREFIX = new Uint8Array([
  0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06,
  0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20,
]);

export function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64.trim());
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export async function importPrivateKey(privateB64: string): Promise<CryptoKey> {
  const seed = base64ToBytes(privateB64);
  if (seed.length !== 32) throw new Error("Ed25519 private key must be 32 bytes");
  const pkcs8 = new Uint8Array(PKCS8_ED25519_PREFIX.length + seed.length);
  pkcs8.set(PKCS8_ED25519_PREFIX);
  pkcs8.set(seed, PKCS8_ED25519_PREFIX.length);
  return crypto.subtle.importKey("pkcs8", pkcs8, { name: "Ed25519" }, false, ["sign"]);
}

export interface LicenseFields {
  licensee: string;
  type?: string;      // default "personal"
  seats?: number;     // default 1
  issued?: string;    // default today (UTC), YYYY-MM-DD
  expires?: string | null;
}

/** Builds the single-line JSON payload. Property order mirrors LicenseTool for tidy diffs. */
export function buildPayload(fields: LicenseFields): string {
  return JSON.stringify({
    licensee: fields.licensee,
    type: fields.type ?? "personal",
    seats: fields.seats ?? 1,
    issued: fields.issued ?? new Date().toISOString().slice(0, 10),
    expires: fields.expires ?? null,
  });
}

/** Signs the payload line and assembles the complete gudrun.key file content. */
export async function signLicense(fields: LicenseFields, privateB64: string): Promise<string> {
  const payload = buildPayload(fields);
  const key = await importPrivateKey(privateB64);
  const sig = await crypto.subtle.sign(
    { name: "Ed25519" }, key, new TextEncoder().encode(payload));
  return `${HEADER}\n${payload}\n${SIG_PREFIX}${bytesToBase64(new Uint8Array(sig))}\n`;
}
