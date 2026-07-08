import { describe, expect, it } from "vitest";
import {
  HEADER, SIG_PREFIX,
  base64ToBytes, buildPayload, importPrivateKey, signLicense,
} from "../functions/_lib/license";

// Deterministic test-only keypair: seed = 32 bytes of 0x42.
// The corresponding public key is asserted below so a WebCrypto or wrapping
// regression can't slip through as "both sides changed together".
const TEST_SEED_B64 = Buffer.from(new Uint8Array(32).fill(0x42)).toString("base64");

describe("license file format", () => {
  it("produces the exact three-line GUDRUN-LICENSE-V1 structure", async () => {
    const file = await signLicense(
      { licensee: "buyer@example.com", issued: "2026-07-07" }, TEST_SEED_B64);
    const lines = file.split("\n");

    expect(lines).toHaveLength(4);            // 3 content lines + trailing newline
    expect(lines[0]).toBe(HEADER);
    expect(lines[1]).toBe(
      '{"licensee":"buyer@example.com","type":"personal","seats":1,"issued":"2026-07-07","expires":null}');
    expect(lines[2].startsWith(SIG_PREFIX)).toBe(true);
    expect(lines[3]).toBe("");

    const sig = base64ToBytes(lines[2].slice(SIG_PREFIX.length));
    expect(sig.length).toBe(64);              // Ed25519 signature size
  });

  it("signature verifies against the payload line bytes", async () => {
    const file = await signLicense(
      { licensee: "buyer@example.com", issued: "2026-07-07" }, TEST_SEED_B64);
    const [, payload, sigLine] = file.split("\n");

    // Re-derive the public key from the same seed via a sign/verify pair.
    const seed = base64ToBytes(TEST_SEED_B64);
    const keyPair = await importAsKeyPair(seed);
    const ok = await crypto.subtle.verify(
      { name: "Ed25519" },
      keyPair.publicKey,
      base64ToBytes(sigLine.slice(SIG_PREFIX.length)),
      new TextEncoder().encode(payload));
    expect(ok).toBe(true);
  });

  it("defaults type/seats/expires and stamps today when issued is omitted", () => {
    const payload = JSON.parse(buildPayload({ licensee: "x@y.z" }));
    expect(payload.type).toBe("personal");
    expect(payload.seats).toBe(1);
    expect(payload.expires).toBeNull();
    expect(payload.issued).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("rejects seeds that are not 32 bytes", async () => {
    await expect(importPrivateKey(Buffer.from("short").toString("base64")))
      .rejects.toThrow(/32 bytes/);
  });

  it("matches the cross-implementation parity fixture byte-for-byte", async () => {
    // Ed25519 is deterministic, so fixed seed + fixed date = fixed file. The
    // SAME string is embedded in the Gudrun repo's JsSignerParityTests, where
    // the real C# LicenseVerifier verifies it. If this assertion ever needs
    // updating, update that test in the same change — the fixture is the
    // contract between the store's signer and the shipped app's verifier.
    const file = await signLicense(
      { licensee: "parity-fixture@example.com", issued: "2026-07-07" }, TEST_SEED_B64);
    expect(file).toBe(
      "GUDRUN-LICENSE-V1\n" +
      '{"licensee":"parity-fixture@example.com","type":"personal","seats":1,"issued":"2026-07-07","expires":null}\n' +
      "sig: dPd9bMFLcU+5AeIhT43sIpaKeF056Wu3ZNpcLJu89IudISRtefBOYWP+a9KOfR/PA7hgrSsgR9HQpshC8IMoCA==\n");
  });
});

/** Builds a full Ed25519 key pair from a raw seed (test helper: node supports jwk export). */
async function importAsKeyPair(seed: Uint8Array): Promise<CryptoKeyPair> {
  const { createPrivateKey, createPublicKey } = await import("node:crypto");
  const pkcs8Prefix = Buffer.from("302e020100300506032b657004220420", "hex");
  const privDer = Buffer.concat([pkcs8Prefix, Buffer.from(seed)]);
  const privNode = createPrivateKey({ key: privDer, format: "der", type: "pkcs8" });
  const pubDer = createPublicKey(privNode).export({ format: "der", type: "spki" });
  const publicKey = await crypto.subtle.importKey(
    "spki", pubDer, { name: "Ed25519" }, false, ["verify"]);
  const privateKey = await crypto.subtle.importKey(
    "pkcs8", privDer, { name: "Ed25519" }, false, ["sign"]);
  return { publicKey, privateKey };
}
