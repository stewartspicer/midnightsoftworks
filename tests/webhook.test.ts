import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { verifyWebhookSignature } from "../functions/_lib/lemonsqueezy";

const SECRET = "test-signing-secret";
const body = (s: string) => new TextEncoder().encode(s).buffer as ArrayBuffer;
const sign = (s: string) => createHmac("sha256", SECRET).update(s).digest("hex");

describe("Lemon Squeezy webhook signature", () => {
  it("accepts a correctly signed body", async () => {
    const raw = '{"meta":{"event_name":"order_created"}}';
    expect(await verifyWebhookSignature(body(raw), sign(raw), SECRET)).toBe(true);
  });

  it("rejects a tampered body", async () => {
    const raw = '{"meta":{"event_name":"order_created"}}';
    const tampered = raw.replace("order_created", "order_refunded");
    expect(await verifyWebhookSignature(body(tampered), sign(raw), SECRET)).toBe(false);
  });

  it("rejects a signature made with the wrong secret", async () => {
    const raw = "{}";
    const wrong = createHmac("sha256", "other-secret").update(raw).digest("hex");
    expect(await verifyWebhookSignature(body(raw), wrong, SECRET)).toBe(false);
  });

  it("rejects missing or malformed signature headers", async () => {
    expect(await verifyWebhookSignature(body("{}"), null, SECRET)).toBe(false);
    expect(await verifyWebhookSignature(body("{}"), "not-hex", SECRET)).toBe(false);
    expect(await verifyWebhookSignature(body("{}"), "abcd", SECRET)).toBe(false);
  });
});
