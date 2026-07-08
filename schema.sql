-- Issuance ledger. Apply with:
--   wrangler d1 execute midnightsoftworks-orders --file schema.sql          (local)
--   wrangler d1 execute midnightsoftworks-orders --file schema.sql --remote (production)
CREATE TABLE IF NOT EXISTS orders (
  order_id     TEXT PRIMARY KEY,  -- Lemon Squeezy order id (idempotency key)
  email        TEXT NOT NULL,     -- buyer email, lowercased
  license_file TEXT NOT NULL,     -- full signed gudrun.key content
  issued_at    TEXT NOT NULL,     -- ISO timestamp
  delivered_at TEXT               -- null until the email provider accepts
);
