# Midnight Softworks site redesign — "Deep Field"

**Date:** 2026-07-20
**Status:** Approved direction from visual brainstorming (7 mockup rounds in
`.superpowers/brainstorm/1816-1784557624/content/`, final: `final-design.html`).
**Scope:** Visual redesign + restructure of midnightsoftworks.com. No changes to
Pages Functions, the licensing pipeline, URLs of existing pages, or `_redirects`.

## Goal

Turn the current docs-style Gudrun landing site into a studio-first home for
Midnight Softworks that sells Gudrun today and absorbs future products (a game
in development, more paid utilities) without restructuring later. The game is
NOT mentioned anywhere yet.

## Brand & logo

- **Mark:** the script M, modified: entry-flourish hook ("tick") trimmed off at
  the stroke's natural top contour; no badge rectangle behind it; no star/sparkle
  embellishments. Fill: linear gradient `#b78ae0 → #6d3a97` (top-left to
  bottom-right). Monochrome uses: `#a97fd1`.
- The final path data lives in the approved mockup
  (`.superpowers/brainstorm/1816-1784557624/content/final-design.html`, the
  `<path id="mk">` element) and is reproduced in Appendix A so it survives
  mockup cleanup. Implementation replaces `public/logo.svg` with this mark
  (viewBox cropped to the glyph, roughly `8 32 200 150`).
- **Usage:** header brand (~24px, gradient), favicon (same SVG), no watermark
  anywhere — the top-right corner of pages stays empty sky.
- **Wordmark lockup:** mark + "Midnight Softworks" in letterspaced small-caps
  sans.

## Visual system

Design tokens (replace the current `:root` block in `style.css`):

- Sky base: `#0a0a14`; glow: radial ellipse from `#2a1b4a` at top center fading
  through `#131022`. Secondary pages use a dimmer glow (`#221639`) so content
  leads.
- Text: `#e6e2f0` body on sky, `#f2eefc` headings, `#a99fc9` muted,
  `#6f6785` fine print, `#a08bc0` overlines, `#8f7fc0` kind-labels,
  `#c9aef2` links/italic accents.
- Accent: `#6d3a97` (button fill), `#a97fd1` (button border, bright accent).
- Rules/borders: `rgba(169,127,209,.18)` hairlines; media frames
  `rgba(169,127,209,.3)`.

**Starfield:** pure CSS, tiles seamlessly at any viewport width, no visible
regularity. One large SVG tile (913×701, inlined as a data URI) containing
~78 irregularly scattered stars — seeded-random positions with mild
clustering, mixed sizes (r 0.7 / 0.9 / 1.35) and opacities (.2–.9), ~25%
violet-tinted `#c8aaff` — repeating over the full document. Regenerate the
tile with `tools/gen-starfield.js` (seeded LCG, reproducible). Density matches
the approved "deep night" option; there is NO nebula haze. Stars scroll with
the content (full-document absolute layer, not a fixed viewport layer); the
glow ellipse is a second background layer pinned to the top of the page and
sized to the first viewport (`100% 100vh`, `no-repeat`).

**Typography:**

- Display/headings: Georgia, serif (system font — zero download; deliberate
  choice consistent with the no-telemetry ethos; no webfonts).
- Body/UI: "Segoe UI", system-ui stack (unchanged from current site).
- Code: "Cascadia Mono", Consolas, monospace (unchanged).
- Signature details: small-caps letterspaced overlines (`10.5px+`,
  `letter-spacing ≈ 3px`, uppercase) above page titles; italic violet phrases
  inside serif headlines ("made after dark").

**Components:**

- Structure via thin violet hairline rules, not boxed cards. The existing
  `.card` component is retired from marketing pages (form pages may keep a
  quiet panel where a box genuinely helps, e.g. the license lookup form).
- Buttons: primary = `#6d3a97` fill, `#a97fd1` 1px border, white text, 5px
  radius; ghost = transparent, `#c9aef2` text, `rgba(169,127,209,.35)` border.
- Media frames: 1px `rgba(169,127,209,.3)` border, 8px radius, deep shadow
  `0 16px 44px rgba(0,0,0,.55)`; captions in muted sans below.
- Fine-print trust line under CTAs: "Free 30 days · no feature limits · no
  account · no telemetry".

## Site structure

Nav everywhere: **Software · FAQ · License** (brand at left links home).
"Buy" and "Themes" leave the top nav; they're reachable from the Gudrun page.
Footer everywhere: © · Terms · Privacy (+ support email where it exists today).

### Homepage `/` (rebuilt)

1. Hero: overline "A one-person software studio"; headline "Honest software,
   *made after dark.*" (italic accent); subline "Fast, focused tools. Sold
   once, owned forever, licensed with a file — not an account."
2. Hairline rule.
3. Gudrun section (open, no card): kind-line "DISK UTILITY · WINDOWS & LINUX",
   serif "Gudrun", one-sentence pitch, buttons [Download free trial]
   [Buy a license — $15 (ghost)], trust fine-print.
4. Framed hero screenshot (current placeholder SVG until real capture).
5. Footer.

Future products append as additional rule-separated sections between 4 and 5.

### Gudrun page `/gudrun/` (new)

Takes over the deep content currently on the homepage:

1. Product hero: kind-line (with version), "Gudrun — *see what's eating your
   disk*" lockup.
2. Full download row: [Download for Windows] + ghost buttons for portable zip,
   Linux x64/arm64, [Buy — $15]; trust fine-print. Links use the existing
   `/download/*` redirects.
3. "Why Gudrun" as a 4-up ruled row (Fast / A real treemap / Honest licensing /
   Yours), stacking 2-up then 1-up on narrow screens. Copy carried over from
   the current homepage.
4. Gallery: three framed demo-GIF slots with captions (current placeholder
   SVGs until captured).
5. "How the license works" section (copy carried over), linking FAQ.
6. Footer.

Homepage Gudrun buttons: "Download free trial" → `/download/windows` directly;
the section heading "Gudrun" and nav "Software" → `/gudrun/`.

### Existing pages (restyled only, same URLs & content)

`/buy/`, `/faq/`, `/license/`, `/themes/`, `/terms/`, `/privacy/`, `/thanks/`
get: the shared restyled header/footer, dimmer-glow sky, overline + serif page
title, hairline-rule section structure. FAQ answers, buy checkout link
(`TODO(release)` marker preserved), license lookup form behavior, and theme
docs content are unchanged. Form inputs restyle to the new tokens (sky-dark
fields, violet focus border).

## Responsive rules

- Content column: `max-width: 860px` retained.
- Nav wraps naturally at narrow widths (few links, small caps) — no hamburger,
  no design/layout JS anywhere on the site. (The existing license-lookup fetch
  script on `/license/` is functional, not design, and stays.)
- Button rows and the "Why" row wrap/stack; media frames are `width: 100%`.
- Test at 360px, 768px, and desktop; no horizontal scroll at any width.

## Media asset requirements (for capture later)

- **Hero screenshot** (homepage only; the Gudrun page uses the gallery): 16:9, capture at
  1920×1080 (1280×720 minimum), PNG (or lossless WebP), target ≤ 500 KB —
  dark UI compresses well. Show a finished scan of a real-looking drive with
  a file selected in the status bar.
- **Demo GIFs** (3, Gudrun page): 640×400 (8:5) each, 10–15 fps, 5–10 seconds,
  target ≤ 4 MB each. Preferred alternative: MP4/H.264 or WebM loops
  (`<video autoplay muted loop playsinline>`) at 1280×800 — typically 5–10×
  smaller than GIF at better quality; the design supports either in the same
  framed slots. Cloudflare Pages hard limit is 25 MiB/file — not a constraint
  at these targets.
- Slots keep explicit `width`/`height` attributes to avoid layout shift.

## Implementation constraints

- Zero build step: hand-written HTML in `public/`, one shared `style.css`,
  no JS, no framework, no generator. Header/footer duplicated per page (9
  pages — acceptable; consistency enforced by copy-paste discipline during
  implementation).
- Functions (`functions/`), `schema.sql`, tests, `wrangler.toml`,
  `_redirects`, and all existing URLs unchanged.
- `<title>`/meta descriptions updated per page (homepage becomes studio-titled;
  `/gudrun/` carries the current Gudrun title/description).
- Verification: vitest suite still passes (it doesn't touch HTML, but run it);
  manual visual check of every page at the three test widths; every internal
  link resolves.

## Out of scope

- Any mention of the game or future products.
- Email templates, Lemon Squeezy configuration, release artifacts.
- Webfonts, analytics, or any third-party requests (site currently makes none;
  keep it that way).

## Appendix A — final logo path

ViewBox for the cropped mark: `8 32 200 150`. Gradient: linear, x1=0 y1=0 →
x2=1 y2=1, stops `#b78ae0` → `#6d3a97`.

```
M189.81 135.17L189.81 144.37C183.32 150.45 177.96 155.22 173.74 158.67C169.52 162.13 165.31 165.24 161.11 168.01C156.91 170.78 153.34 172.79 150.4 174.04C147.47 175.29 144.88 175.91 142.64 175.91C137.38 175.91 133.11 173.98 129.81 170.13C126.52 166.27 124.87 161.37 124.87 155.4C124.87 148.82 126.18 142.37 128.78 136.06C131.39 129.74 135.1 123.24 139.91 116.54C144.72 109.84 151.84 102.16 161.26 93.49C163.97 88.21 165.33 85.44 165.33 85.17C165.33 85.28 165.35 85.36 165.39 85.4C165.42 85.44 165.53 85.46 165.7 85.46C165.01 85.46 161.68 88.02 155.7 93.14C149.72 98.26 141.94 105.91 132.36 116.09C122.78 126.26 112.39 138.42 101.21 152.56C100.55 153.35 98.51 155.97 95.08 160.42C91.66 164.87 89.15 167.85 87.55 169.38C85.96 170.9 84.38 171.66 82.81 171.66C80.15 171.66 78.08 169.63 76.61 165.58C75.13 161.52 74.4 157.34 74.4 153.04C74.4 150.25 75.25 147.35 76.95 144.36C78.65 141.36 82.17 136.21 87.52 128.92C92.88 121.62 97.32 115.45 100.86 110.39C104.4 105.34 108.29 99.2 112.54 91.98C115.54 86.94 117.7 83.04 119.02 80.28C120.34 77.52 121 75.15 121 73.17C121 72.48 121.06 72.13 121.19 72.13C119.35 72.13 115.23 75.23 108.83 81.42C102.42 87.62 94.36 97 84.65 109.57C74.94 122.14 64.92 136.51 54.59 152.67C50.9 158.71 48.24 162.83 46.6 165.04C44.96 167.25 42.92 168.35 40.47 168.35C37.39 168.35 34.8 165.76 32.68 160.59C30.56 155.41 29.5 151.23 29.5 148.03C29.5 146.69 30 145.28 30.99 143.79C39.4 132.57 46.27 123.11 51.6 115.4C56.93 107.69 61.62 100.44 65.68 93.65C69.73 86.86 72.69 81.25 74.55 76.83C76.4 72.4 77.33 69.04 77.33 66.74C77.33 65.29 76.73 64.57 75.53 64.57C73.88 64.57 70.68 65.83 65.95 68.35C61.22 70.87 55.18 74.34 47.85 78.77C40.52 83.21 34.52 86.66 29.84 89.13C25.16 91.59 21.55 92.83 19.01 92.83C15.67 92.83 14 91.03 14 87.44C14 86.01 14.45 82.84 15.36 77.94C16.27 73.04 17.23 69.54 18.25 67.43C22.5 64.9 27.5 62.8 33 61.35C42.7 54.54 52.17 49.29 61.42 45.61C70.66 41.93 77.17 40.09 80.92 40.09C83.4 40.09 85.55 41.45 87.36 44.17C89.18 46.9 90.67 49.91 91.84 53.21C93 56.51 93.59 58.69 93.59 59.75C93.59 63.14 92.74 67.1 91.04 71.65C89.34 76.19 87.08 81.38 84.26 87.2C81.45 93.02 78.03 99.37 74.02 106.25C74.92 102.58 76.85 98.96 79.81 95.37C82.77 91.78 86.05 88.14 89.65 84.46C93.26 80.78 97.09 77.2 101.15 73.74C103.02 69.38 106.55 65.02 111.74 60.63C116.92 56.25 121.83 52.62 126.47 49.76C131.1 46.9 134.38 45.48 136.31 45.48C139.21 45.48 141.68 46.91 143.73 49.77C145.78 52.64 146.8 55.65 146.8 58.8C146.8 60.89 145.58 64.58 143.14 69.85C140.69 75.12 137.08 81.95 132.3 90.33C127.52 98.71 121.58 108.08 114.47 118.44C120.37 110.82 126.86 103.16 133.97 95.47C141.07 87.77 146.64 81.95 150.66 77.99C154.68 74.04 157.71 71.62 159.75 70.73C163.44 67.23 167.08 63.91 170.67 60.77C174.26 57.63 177.07 55.18 179.08 53.41C181.1 51.65 183.03 50.22 184.87 49.11C186.7 48.01 188.45 47.46 190.09 47.46C192.45 47.46 195.02 49.58 197.81 53.82C200.6 58.06 202 60.88 202 62.3C202 64.05 201.19 65.92 199.58 67.91C197.96 69.91 194.77 73.45 190 78.53C181.57 87.58 174.23 96.75 167.98 106.04C161.72 115.33 157.01 123.75 153.83 131.3C150.66 138.86 149.07 144.75 149.07 148.97C149.07 151.34 149.41 152.93 150.1 153.77C150.79 154.61 151.93 155.02 153.51 155.02C155.29 155.02 156.94 154.69 158.47 154.02C159.99 153.36 161.8 152.34 163.88 150.97C165.96 149.6 167.84 148.36 169.51 147.25C172.29 145.6 175.01 143.83 177.69 141.95C180.37 140.06 182.37 138.63 183.7 137.66C185.02 136.69 187.06 135.86 189.81 135.17Z
```
