# midnightsoftworks.com

Storefront + license delivery for [Gudrun](https://github.com/stewartspicer/gudrun).
Static site on Cloudflare Pages, with Pages Functions that turn Lemon Squeezy
orders into signed, offline-verifiable `gudrun.key` files.
Design: `gudrun/docs/superpowers/specs/2026-07-06-midnight-softworks-site.md`.

## Layout

```
public/               static pages (Pages build output dir — no build step)
functions/api/        webhook.ts (LS order → sign → D1 → email)
                      license.ts (order+email → gudrun.key download)
functions/_lib/       Ed25519 signer (port of Gudrun's LicenseTool) + LS HMAC verify
schema.sql            D1 ledger (one table)
tests/                vitest — signer format, webhook signatures, parity fixture
```

The parity fixture in `tests/license.test.ts` is byte-identical to the one in the
Gudrun repo's `JsSignerParityTests`, where the shipped C# verifier checks it.
Change the signer → both tests must change together.

## One-time setup (Cloudflare dashboard)

1. **Connect the repo:** dash.cloudflare.com → *Workers & Pages* → *Create* →
   **the *Pages* tab, not Workers** → *Connect to Git* → pick
   `stewartspicer/midnightsoftworks`. Build settings: **no framework preset,
   no build command, no deploy command**, build output directory `public`.
   ⚠ The dashboard's default flow creates a Git-connected *Worker*, which runs
   `npx wrangler deploy` and fails against this repo ("Missing entry-point").
   If that happens: delete the project and recreate it from the Pages tab.
   Pages picks up `functions/` as the API routes automatically.
2. **Custom domain:** in the Pages project → *Custom domains* → add
   `midnightsoftworks.com` (the zone is already on Cloudflare, so this is a click).
3. **D1:** `npx wrangler d1 create midnightsoftworks-orders`, paste the returned
   `database_id` into `wrangler.toml`, then apply the schema:
   `npx wrangler d1 execute midnightsoftworks-orders --file schema.sql --remote`.
4. **Secrets** (Pages project → *Settings* → *Variables and Secrets*, or
   `npx wrangler pages secret put <NAME>`):
   - `LICENSE_PRIVATE_KEY` — contents of `private.b64`. Dev key while testing;
     **production key only at release cut** (see the ceremony in the design spec).
   - `LS_WEBHOOK_SECRET` — from the Lemon Squeezy webhook (below).
   - `RESEND_API_KEY` — optional; without it, buyers use the download page only.
5. Every `git push` to `main` deploys automatically after this.

## One-time setup (Lemon Squeezy)

1. Product: *Gudrun — Personal License*, $15, one-time. Paste its checkout URL
   into `public/buy/index.html` (marked `TODO(release)`).
2. Checkout success redirect → `https://midnightsoftworks.com/thanks/`.
3. *Settings → Webhooks* → add `https://midnightsoftworks.com/api/webhook`,
   event `order_created`, and set a signing secret (= `LS_WEBHOOK_SECRET`).
4. Test mode first: LS test orders exercise the whole pipeline without money.

## One-time setup (Resend, optional for launch)

Add the domain, set the two DNS records they give you (zone is on Cloudflare),
create an API key → `RESEND_API_KEY`. Sender is
`licenses@midnightsoftworks.com`. While you're in DNS: enable Cloudflare Email
Routing to forward `support@midnightsoftworks.com` to a real inbox.

## Local dev

```
npm install
npm test          # vitest (works on Node 20+)
npm run dev       # wrangler pages dev — NOTE: wrangler 4 wants Node 22+
```

Local dev with functions + a local D1 needs Node 22; the tests and the deployed
site do not (Pages builds run in Cloudflare's environment).

## Recommended zone hardening

Cloudflare → Security → WAF → rate limiting rule on `/api/license*`
(e.g. 10 requests/min/IP) — the endpoint is enumeration-safe by design
(order id + email must both match), but there's no reason to let anyone hammer it.
