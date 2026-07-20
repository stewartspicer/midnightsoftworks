# Deep Field Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle midnightsoftworks.com into the approved "Deep Field" night-sky design and restructure it studio-first (studio homepage + new `/gudrun/` product page), per `docs/superpowers/specs/2026-07-20-site-redesign-deep-field-design.md`.

**Architecture:** Static site in `public/` (Cloudflare Pages, zero build step). One shared `style.css` carries the whole design system; each page is hand-written HTML with duplicated header/footer chrome. A new vitest file guards internal-link integrity. Pages Functions, `_redirects`, and all existing URLs are untouched.

**Tech Stack:** Plain HTML/CSS, SVG, vitest (existing), wrangler (existing, for local preview only).

## Global Constraints

- The game / future products are NOT mentioned anywhere.
- Nav on every page, exactly: brand link (home) + `Software` (→ `/gudrun/`) + `FAQ` (→ `/faq/`) + `License` (→ `/license/`).
- Footer on every page, exactly: `© 2026 Midnight Softworks · <a href="/terms/">License terms &amp; refunds</a> · <a href="/privacy/">Privacy</a> · support@midnightsoftworks.com`
- No webfonts, no analytics, no third-party requests, no new JS (the existing `/license/` lookup script stays as-is).
- Content column max-width: 860px. No horizontal scroll at 360px, 768px, or desktop widths.
- Color tokens, starfield layer values, and logo path come verbatim from the spec — do not improvise values.
- Every page keeps `<meta charset>`, `<meta viewport>`, favicon link to `/logo.svg`, and stylesheet link to `/style.css`.
- Preserve both `TODO(release)` comments (buy-page checkout URL; homepage download-URL note moves to `/gudrun/` only if its markup moves — see Task 5) and the `TODO(media)` placeholder mechanism.
- Run `npm test` after every task; all tests must pass before committing.

**Canonical page chrome** — used by Tasks 4–8. Header (immediately after `<body>`):

```html
  <header class="site">
    <div class="inner">
      <a class="brand" href="/"><svg class="logo" viewBox="8 32 200 150" width="26" height="20" aria-hidden="true"><use href="/logo.svg#mark"/></svg>Midnight Softworks</a>
      <nav>
        <a href="/gudrun/">Software</a>
        <a href="/faq/">FAQ</a>
        <a href="/license/">License</a>
      </nav>
    </div>
  </header>
```

> Note: external `<use href="/logo.svg#mark">` does not work in all browsers for cross-file SVG. To stay dependency-free, **inline the mark instead**: each page embeds the SVG once. The real canonical header is therefore:

```html
  <header class="site">
    <div class="inner">
      <a class="brand" href="/"><img class="logo" src="/logo.svg" alt="" width="26" height="20">Midnight Softworks</a>
      <nav>
        <a href="/gudrun/">Software</a>
        <a href="/faq/">FAQ</a>
        <a href="/license/">License</a>
      </nav>
    </div>
  </header>
```

(`<img src="/logo.svg">` renders the gradient fine — gradients defined inside the same SVG file work in `<img>`. Only cross-file `<use>` is unreliable.)

Footer (immediately before `</body>`):

```html
  <footer class="site">
    © 2026 Midnight Softworks · <a href="/terms/">License terms &amp; refunds</a> · <a href="/privacy/">Privacy</a> · support@midnightsoftworks.com
  </footer>
```

Page-title pattern for secondary pages (first thing inside `<main>`):

```html
    <div class="page-head">
      <div class="overline">OVERLINE TEXT</div>
      <h1>Serif title with <em>violet italic accent</em></h1>
    </div>
```

Secondary pages set `<body class="quiet">` (dimmer glow). Homepage and `/gudrun/` use bare `<body>`.

---

### Task 1: New logo asset

**Files:**
- Modify: `public/logo.svg` (full replacement)

**Interfaces:**
- Produces: `/logo.svg` — the trimmed script-M mark, gradient-filled, transparent background, viewBox `8 32 200 150`. Every page references it via `<img src="/logo.svg">` and `<link rel="icon">`.

- [ ] **Step 1: Replace `public/logo.svg`** with exactly:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="8 32 200 150">
  <!-- Midnight Softworks mark: script M, entry-flourish tick trimmed, no badge.
       Path provenance: docs/superpowers/specs/2026-07-20-site-redesign-deep-field-design.md, Appendix A. -->
  <defs>
    <linearGradient id="mkgrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#b78ae0"/>
      <stop offset="1" stop-color="#6d3a97"/>
    </linearGradient>
  </defs>
  <path id="mark" fill="url(#mkgrad)" d="M189.81 135.17L189.81 144.37C183.32 150.45 177.96 155.22 173.74 158.67C169.52 162.13 165.31 165.24 161.11 168.01C156.91 170.78 153.34 172.79 150.4 174.04C147.47 175.29 144.88 175.91 142.64 175.91C137.38 175.91 133.11 173.98 129.81 170.13C126.52 166.27 124.87 161.37 124.87 155.4C124.87 148.82 126.18 142.37 128.78 136.06C131.39 129.74 135.1 123.24 139.91 116.54C144.72 109.84 151.84 102.16 161.26 93.49C163.97 88.21 165.33 85.44 165.33 85.17C165.33 85.28 165.35 85.36 165.39 85.4C165.42 85.44 165.53 85.46 165.7 85.46C165.01 85.46 161.68 88.02 155.7 93.14C149.72 98.26 141.94 105.91 132.36 116.09C122.78 126.26 112.39 138.42 101.21 152.56C100.55 153.35 98.51 155.97 95.08 160.42C91.66 164.87 89.15 167.85 87.55 169.38C85.96 170.9 84.38 171.66 82.81 171.66C80.15 171.66 78.08 169.63 76.61 165.58C75.13 161.52 74.4 157.34 74.4 153.04C74.4 150.25 75.25 147.35 76.95 144.36C78.65 141.36 82.17 136.21 87.52 128.92C92.88 121.62 97.32 115.45 100.86 110.39C104.4 105.34 108.29 99.2 112.54 91.98C115.54 86.94 117.7 83.04 119.02 80.28C120.34 77.52 121 75.15 121 73.17C121 72.48 121.06 72.13 121.19 72.13C119.35 72.13 115.23 75.23 108.83 81.42C102.42 87.62 94.36 97 84.65 109.57C74.94 122.14 64.92 136.51 54.59 152.67C50.9 158.71 48.24 162.83 46.6 165.04C44.96 167.25 42.92 168.35 40.47 168.35C37.39 168.35 34.8 165.76 32.68 160.59C30.56 155.41 29.5 151.23 29.5 148.03C29.5 146.69 30 145.28 30.99 143.79C39.4 132.57 46.27 123.11 51.6 115.4C56.93 107.69 61.62 100.44 65.68 93.65C69.73 86.86 72.69 81.25 74.55 76.83C76.4 72.4 77.33 69.04 77.33 66.74C77.33 65.29 76.73 64.57 75.53 64.57C73.88 64.57 70.68 65.83 65.95 68.35C61.22 70.87 55.18 74.34 47.85 78.77C40.52 83.21 34.52 86.66 29.84 89.13C25.16 91.59 21.55 92.83 19.01 92.83C15.67 92.83 14 91.03 14 87.44C14 86.01 14.45 82.84 15.36 77.94C16.27 73.04 17.23 69.54 18.25 67.43C22.5 64.9 27.5 62.8 33 61.35C42.7 54.54 52.17 49.29 61.42 45.61C70.66 41.93 77.17 40.09 80.92 40.09C83.4 40.09 85.55 41.45 87.36 44.17C89.18 46.9 90.67 49.91 91.84 53.21C93 56.51 93.59 58.69 93.59 59.75C93.59 63.14 92.74 67.1 91.04 71.65C89.34 76.19 87.08 81.38 84.26 87.2C81.45 93.02 78.03 99.37 74.02 106.25C74.92 102.58 76.85 98.96 79.81 95.37C82.77 91.78 86.05 88.14 89.65 84.46C93.26 80.78 97.09 77.2 101.15 73.74C103.02 69.38 106.55 65.02 111.74 60.63C116.92 56.25 121.83 52.62 126.47 49.76C131.1 46.9 134.38 45.48 136.31 45.48C139.21 45.48 141.68 46.91 143.73 49.77C145.78 52.64 146.8 55.65 146.8 58.8C146.8 60.89 145.58 64.58 143.14 69.85C140.69 75.12 137.08 81.95 132.3 90.33C127.52 98.71 121.58 108.08 114.47 118.44C120.37 110.82 126.86 103.16 133.97 95.47C141.07 87.77 146.64 81.95 150.66 77.99C154.68 74.04 157.71 71.62 159.75 70.73C163.44 67.23 167.08 63.91 170.67 60.77C174.26 57.63 177.07 55.18 179.08 53.41C181.1 51.65 183.03 50.22 184.87 49.11C186.7 48.01 188.45 47.46 190.09 47.46C192.45 47.46 195.02 49.58 197.81 53.82C200.6 58.06 202 60.88 202 62.3C202 64.05 201.19 65.92 199.58 67.91C197.96 69.91 194.77 73.45 190 78.53C181.57 87.58 174.23 96.75 167.98 106.04C161.72 115.33 157.01 123.75 153.83 131.3C150.66 138.86 149.07 144.75 149.07 148.97C149.07 151.34 149.41 152.93 150.1 153.77C150.79 154.61 151.93 155.02 153.51 155.02C155.29 155.02 156.94 154.69 158.47 154.02C159.99 153.36 161.8 152.34 163.88 150.97C165.96 149.6 167.84 148.36 169.51 147.25C172.29 145.6 175.01 143.83 177.69 141.95C180.37 140.06 182.37 138.63 183.7 137.66C185.02 136.69 187.06 135.86 189.81 135.17Z"/>
</svg>
```

- [ ] **Step 2: Verify it renders**

Run: `npx wrangler pages dev public` (background) then open `http://localhost:8788/logo.svg` in a browser — a violet-gradient script M on transparent, no gray box, no tick at the top-left of the entry stroke. Stop the server after checking. (Alternative: open the file directly in a browser.)

- [ ] **Step 3: Run existing tests to confirm nothing broke**

Run: `npm test`
Expected: all existing tests PASS (they don't touch assets; this is a regression guard habit).

- [ ] **Step 4: Commit**

```bash
git add public/logo.svg
git commit -m "feat: new logo - trimmed script M, violet gradient, no badge"
```

---

### Task 2: Internal link-integrity test

**Files:**
- Create: `tests/site-links.test.ts`

**Interfaces:**
- Consumes: `public/**/*.html`, `public/_redirects`.
- Produces: `npm test` now fails if any page links to a missing internal page/asset. Later tasks rely on this as their safety net.

- [ ] **Step 1: Write the test**

Create `tests/site-links.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const PUBLIC = join(__dirname, "..", "public");

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return htmlFiles(p);
    return name.endsWith(".html") ? [p] : [];
  });
}

// Paths handled by _redirects or Pages Functions, not static files.
const redirectPrefixes = readFileSync(join(PUBLIC, "_redirects"), "utf8")
  .split("\n")
  .map((l) => l.trim().split(/\s+/)[0])
  .filter((p) => p && p.startsWith("/"))
  .map((p) => p.replace(/\*.*$/, "")); // "/download/*" -> "/download/"
const dynamicPrefixes = ["/api/", ...redirectPrefixes];

function targetExists(href: string): boolean {
  const path = href.split(/[?#]/)[0];
  if (dynamicPrefixes.some((p) => path === p || path.startsWith(p))) return true;
  const rel = path.replace(/^\//, "");
  if (path.endsWith("/")) return existsSync(join(PUBLIC, rel, "index.html"));
  return existsSync(join(PUBLIC, rel));
}

describe("internal links", () => {
  for (const file of htmlFiles(PUBLIC)) {
    it(`${file.slice(PUBLIC.length)} has no dead internal links`, () => {
      const html = readFileSync(file, "utf8");
      const refs = [...html.matchAll(/(?:href|src)="(\/[^"]*)"/g)].map((m) => m[1]);
      const dead = refs.filter((r) => !targetExists(r));
      expect(dead).toEqual([]);
    });
  }
});
```

- [ ] **Step 2: Run it — expect PASS on the current site**

Run: `npx vitest run tests/site-links.test.ts`
Expected: PASS (every `/...` href/src on the current site resolves to a file, an `/api/` route, or a `_redirects` prefix). If it FAILS, the failure lists real dead links — fix them (they are pre-existing bugs) or, if a listed path is legitimately dynamic, add its prefix to `dynamicPrefixes`, then re-run until green.

- [ ] **Step 3: Run the whole suite**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add tests/site-links.test.ts
git commit -m "test: internal link integrity check across public/*.html"
```

---

### Task 3: The Deep Field stylesheet

**Files:**
- Modify: `public/style.css` (full replacement)

**Interfaces:**
- Consumes: nothing.
- Produces: the class vocabulary all page tasks use — `body.quiet`, `header.site`/`.inner`/`.brand`/`.logo`, `main`, `.page-head`, `.overline`, `h1 em` accent, `.kind`, `.prod`, `.btns`, `.btn`, `.btn.secondary`, `.fine`, `hr.rule`, `figure.shot`/`.hero-shot`, `.gallery`, `.why`, `.card`, `form.lookup`, `.price`, `.error`, `.muted`, `footer.site`. Old pages keep rendering acceptably mid-migration (old class names `.card`, `.btn`, `.muted`, `form.lookup`, `figure.shot`, `.gallery` are all still styled).

- [ ] **Step 1: Replace `public/style.css`** with exactly:

```css
/* Midnight Softworks — "Deep Field" design system.
   Spec: docs/superpowers/specs/2026-07-20-site-redesign-deep-field-design.md
   Night sky + tiling CSS starfield; editorial serif display; violet accents. */
:root {
  --bg: #0a0a14;
  --glow: #2a1b4a;            /* homepage/product glow; .quiet pages dim it */
  --text: #e6e2f0;
  --heading: #f2eefc;
  --muted: #a99fc9;
  --fine: #6f6785;
  --overline: #a08bc0;
  --kind: #8f7fc0;
  --link: #c9aef2;
  --accent: #6d3a97;
  --accent-bright: #a97fd1;
  --rule: rgba(169, 127, 209, 0.18);
  --frame: rgba(169, 127, 209, 0.3);
  --panel: rgba(255, 255, 255, 0.03);
  --warn: #e0a050;
}
* { box-sizing: border-box; }
html { height: 100%; }
body {
  margin: 0;
  min-height: 100%;
  background-color: var(--bg);
  color: var(--text);
  font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
  line-height: 1.6;
}
body.quiet { --glow: #221639; }
/* Starfield: fixed full-viewport layer. Ten repeating dot tiles at mismatched
   sizes (no visible repetition) + one no-repeat glow ellipse. Values from spec. */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-color: var(--bg);
  background-image:
    radial-gradient(1px 1px at 20% 30%, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(1px 1px at 70% 60%, rgba(255, 255, 255, 0.4), transparent),
    radial-gradient(1px 1px at 45% 80%, rgba(200, 170, 255, 0.45), transparent),
    radial-gradient(1px 1px at 85% 20%, rgba(255, 255, 255, 0.35), transparent),
    radial-gradient(1px 1px at 10% 65%, rgba(255, 255, 255, 0.45), transparent),
    radial-gradient(1px 1px at 60% 10%, rgba(255, 255, 255, 0.3), transparent),
    radial-gradient(1px 1px at 35% 45%, rgba(200, 170, 255, 0.35), transparent),
    radial-gradient(1.6px 1.6px at 75% 35%, rgba(255, 255, 255, 0.8), transparent),
    radial-gradient(1.6px 1.6px at 25% 75%, rgba(230, 215, 255, 0.75), transparent),
    radial-gradient(1.6px 1.6px at 55% 55%, rgba(255, 255, 255, 0.7), transparent),
    radial-gradient(ellipse 85% 55% at 50% -12%, var(--glow) 0%, rgba(19, 16, 34, 0) 70%);
  background-size:
    190px 170px, 230px 150px, 270px 210px, 210px 230px, 250px 190px,
    170px 250px, 330px 170px, 390px 260px, 430px 300px, 470px 240px,
    100% 100%;
  background-repeat:
    repeat, repeat, repeat, repeat, repeat,
    repeat, repeat, repeat, repeat, repeat,
    no-repeat;
}
a { color: var(--link); text-decoration: none; }
a:hover { text-decoration: underline; }
code, pre {
  font-family: "Cascadia Mono", Consolas, monospace;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--rule);
  border-radius: 4px;
}
code { padding: 1px 5px; font-size: 0.92em; }
pre { padding: 12px 16px; overflow-x: auto; }

/* ---- chrome ---- */
header.site { position: relative; }
header.site .inner {
  max-width: 860px; margin: 0 auto; padding: 18px 24px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
}
header.site .brand {
  display: inline-flex; align-items: center; gap: 10px;
  color: var(--text);
  font-size: 0.8rem; font-weight: 600;
  letter-spacing: 2px; text-transform: uppercase;
}
header.site .brand:hover { text-decoration: none; color: var(--heading); }
header.site .brand img.logo { width: 26px; height: 20px; display: block; }
header.site nav {
  display: flex; gap: 20px; flex-wrap: wrap;
  font-size: 0.72rem; letter-spacing: 2px; text-transform: uppercase;
}
header.site nav a { color: var(--muted); }
header.site nav a:hover { color: var(--link); text-decoration: none; }
header.site::after {
  content: ""; display: block; max-width: 812px; margin: 0 auto;
  border-top: 1px solid var(--rule);
}

main { max-width: 860px; margin: 0 auto; padding: 8px 24px 64px; }

footer.site {
  color: var(--fine); font-size: 0.8rem; text-align: center;
  padding: 20px 24px 26px;
}
footer.site::before {
  content: ""; display: block; max-width: 812px; margin: 0 auto 18px;
  border-top: 1px solid var(--rule);
}
footer.site a { color: var(--fine); text-decoration: underline; }
footer.site a:hover { color: var(--link); }

/* ---- typography ---- */
h1, h2, h3 {
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 400; color: var(--heading);
}
h1 { font-size: 2.1rem; margin: 0.35em 0; }
h1 em, h2 em { font-style: italic; color: var(--link); }
h2 { font-size: 1.35rem; margin-top: 2em; }
.overline {
  font-size: 0.66rem; letter-spacing: 3px; text-transform: uppercase;
  color: var(--overline);
}
.kind {
  font-size: 0.66rem; letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--kind);
}
.muted { color: var(--muted); }
.fine { color: var(--fine); font-size: 0.78rem; }
hr.rule { border: none; border-top: 1px solid var(--rule); margin: 30px 0; }
.page-head { padding-top: 26px; }

/* ---- hero (homepage) ---- */
.hero { padding: 40px 0 6px; }
.hero .tagline { color: var(--muted); max-width: 460px; margin-top: 12px; }

/* ---- product section ---- */
.prod { padding: 4px 0; }
.prod h2 { font-size: 1.7rem; margin: 0.35em 0 0; }
.prod p.pitch { color: var(--muted); max-width: 500px; }
.btns { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin: 18px 0 0; }
.btn {
  display: inline-block; padding: 9px 20px; border-radius: 5px;
  background: var(--accent); color: #fff; font-weight: 600; font-size: 0.9rem;
  border: 1px solid var(--accent-bright); white-space: nowrap;
}
.btn:hover { background: var(--accent-bright); text-decoration: none; }
.btn.secondary {
  background: transparent; color: var(--link);
  border-color: rgba(169, 127, 209, 0.35);
}
.btn.secondary:hover { background: rgba(169, 127, 209, 0.12); color: var(--link); }
.cta-row { display: flex; gap: 12px; flex-wrap: wrap; margin: 22px 0; }

/* ---- media frames ---- */
figure.shot { margin: 30px 0; }
figure.shot img, figure.shot video {
  display: block; width: 100%; height: auto;
  border: 1px solid var(--frame); border-radius: 8px;
  background: #121016;
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.55);
}
figure.shot figcaption {
  color: var(--fine); font-size: 0.8rem; text-align: center; margin-top: 10px;
}
.gallery {
  display: grid; gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  margin: 8px 0;
}
.gallery figure.shot { margin: 0; }
.gallery figure.shot img { box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45); }

/* ---- "why" row (gudrun page) ---- */
.why {
  display: grid; gap: 0;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  margin: 10px 0 26px;
}
.why > div { padding: 14px 18px 14px 0; }
.why > div + div { border-left: 1px solid var(--rule); padding-left: 18px; }
.why h3 { font-size: 1.02rem; margin: 0 0 4px; }
.why p { font-size: 0.84rem; color: var(--muted); margin: 0; line-height: 1.55; }
@media (max-width: 640px) {
  .why { grid-template-columns: 1fr; }
  .why > div + div { border-left: none; border-top: 1px solid var(--rule); padding-left: 0; padding-top: 14px; }
}

/* ---- quiet panels (forms, price) ---- */
.card {
  background: var(--panel); border: 1px solid var(--rule);
  border-radius: 8px; padding: 22px 26px; margin: 18px 0;
}
.price { font-family: Georgia, serif; font-size: 2.4rem; color: var(--heading); }
.price .per { font-family: "Segoe UI", system-ui, sans-serif; font-size: 0.95rem; color: var(--muted); }

form.lookup { display: flex; flex-direction: column; gap: 14px; max-width: 420px; }
form.lookup label { display: flex; flex-direction: column; gap: 5px; font-size: 0.9rem; color: var(--muted); }
form.lookup input {
  background: rgba(10, 10, 20, 0.6); color: var(--text);
  border: 1px solid var(--frame); border-radius: 5px; padding: 9px 11px;
  font-size: 1rem; font-family: inherit;
}
form.lookup input:focus { outline: none; border-color: var(--accent-bright); }
form.lookup .btn { cursor: pointer; font-family: inherit; }
.error { color: var(--warn); }
```

- [ ] **Step 2: Eyeball the current (not-yet-migrated) pages against the new stylesheet**

Run: `npx wrangler pages dev public`, open `http://localhost:8788/` and `http://localhost:8788/faq/`.
Expected: night-sky background with stars visible edge-to-edge at wide widths; old markup still readable (old pages will look transitional — that's fine, they're rebuilt in Tasks 4–8). No console errors.

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add public/style.css
git commit -m "feat: Deep Field design system stylesheet (night sky, starfield, editorial type)"
```

---

### Task 4: Studio homepage

**Files:**
- Modify: `public/index.html` (full replacement)

**Interfaces:**
- Consumes: chrome snippets (Global Constraints), classes from Task 3, `/logo.svg` from Task 1, existing `/media/hero-treemap.svg` placeholder, existing `/download/windows` redirect.
- Produces: `/` — studio homepage. Deep Gudrun content (why-list, gallery, license explainer) intentionally absent here; it lands on `/gudrun/` in Task 5. **Note: Task 4 and Task 5 must ship in adjacent commits (this task's nav links to `/gudrun/`, which 404s until Task 5 — acceptable between commits, not for longer).** The link test tolerates this only after Task 5 exists, so run the full suite expecting the one known failure here (documented in Step 2).

- [ ] **Step 1: Replace `public/index.html`** with exactly:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Midnight Softworks — honest software, made after dark</title>
  <meta name="description" content="A one-person software studio. Fast, focused tools like Gudrun, the disk-usage treemap analyzer. Sold once, owned forever, licensed with a file — not an account.">
  <link rel="icon" type="image/svg+xml" href="/logo.svg">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header class="site">
    <div class="inner">
      <a class="brand" href="/"><img class="logo" src="/logo.svg" alt="" width="26" height="20">Midnight Softworks</a>
      <nav>
        <a href="/gudrun/">Software</a>
        <a href="/faq/">FAQ</a>
        <a href="/license/">License</a>
      </nav>
    </div>
  </header>
  <main>
    <div class="hero">
      <div class="overline">A one-person software studio</div>
      <h1>Honest software, <em>made after dark.</em></h1>
      <p class="tagline">Fast, focused tools. Sold once, owned forever,
        licensed with a file — not an account.</p>
    </div>

    <hr class="rule">

    <section class="prod">
      <div class="kind">Disk utility · Windows &amp; Linux</div>
      <h2><a href="/gudrun/">Gudrun</a></h2>
      <p class="pitch">See what's eating your disk. A treemap analyzer that
        scans a terabyte drive in seconds — zoom in, find the culprit, delete
        it from the map.</p>
      <div class="btns">
        <a class="btn" href="/download/windows">Download free trial</a>
        <a class="btn secondary" href="/buy/">Buy a license — $15</a>
      </div>
      <p class="fine">Free 30 days · no feature limits · no account · no telemetry</p>
    </section>

    <!-- TODO(media): placeholder SVG mock. Real capture: PNG 1920x1080 (16:9),
         <=500 KB — drop in public/media/ and change src; keep width/height/alt. -->
    <figure class="shot hero-shot">
      <img src="/media/hero-treemap.svg" width="1280" height="720"
           alt="The Gudrun window after scanning C: — a treemap where every rectangle is a file, sized by bytes">
      <figcaption>One scan of C: — every rectangle is a file, sized by bytes.
        <a href="/gudrun/">More about Gudrun →</a></figcaption>
    </figure>
  </main>
  <footer class="site">
    © 2026 Midnight Softworks · <a href="/terms/">License terms &amp; refunds</a> · <a href="/privacy/">Privacy</a> · support@midnightsoftworks.com
  </footer>
</body>
</html>
```

- [ ] **Step 2: Run the link test — expect exactly one known failure**

Run: `npx vitest run tests/site-links.test.ts`
Expected: FAIL on `/index.html` only, listing `/gudrun/` (not yet created). Any OTHER dead link is a real bug — fix it now.

- [ ] **Step 3: Visual check**

Run: `npx wrangler pages dev public`, open `http://localhost:8788/` at desktop width, 768px, and 360px (browser devtools responsive mode).
Expected: matches the approved mock (`.superpowers/brainstorm/1816-1784557624/content/final-design.html`) — starfield edge to edge, no watermark, hero → rule → Gudrun section → framed screenshot; no horizontal scroll at 360px.

- [ ] **Step 4: Commit**

```bash
git add public/index.html
git commit -m "feat: studio-first homepage (Deep Field hero + Gudrun section)"
```

---

### Task 5: Gudrun product page

**Files:**
- Create: `public/gudrun/index.html`

**Interfaces:**
- Consumes: chrome snippets, Task 3 classes, `/media/demo-*.svg` placeholders, `/download/*` redirects, `/buy/`, `/faq/`, `/themes/`.
- Produces: `/gudrun/` — the deep product page. Resolves Task 4's pending `/gudrun/` link; the full link suite must be green after this task.

- [ ] **Step 1: Create `public/gudrun/index.html`** with exactly:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Gudrun — see what's eating your disk | Midnight Softworks</title>
  <meta name="description" content="Gudrun is a fast disk-usage analyzer for Windows and Linux. Treemap view, instant scans, free 30-day trial.">
  <link rel="icon" type="image/svg+xml" href="/logo.svg">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header class="site">
    <div class="inner">
      <a class="brand" href="/"><img class="logo" src="/logo.svg" alt="" width="26" height="20">Midnight Softworks</a>
      <nav>
        <a href="/gudrun/">Software</a>
        <a href="/faq/">FAQ</a>
        <a href="/license/">License</a>
      </nav>
    </div>
  </header>
  <main>
    <div class="page-head">
      <div class="kind">Disk utility · Windows &amp; Linux</div>
      <h1>Gudrun <em>— see what's eating your disk</em></h1>
      <p class="muted" style="max-width:500px">A treemap analyzer that scans a
        terabyte drive in seconds — the map fills in live, you zoom to the
        culprit, and delete it without leaving the view.</p>
    </div>

    <!-- TODO(release): these URLs 404 until artifacts land in /dl/ and _redirects points at them -->
    <div class="btns">
      <a class="btn" href="/download/windows">Download for Windows</a>
      <a class="btn secondary" href="/download/windows-zip">Portable zip</a>
      <a class="btn secondary" href="/download/linux-x64">Linux x64</a>
      <a class="btn secondary" href="/download/linux-arm64">Linux arm64</a>
      <a class="btn secondary" href="/buy/">Buy — $15</a>
    </div>
    <p class="fine">Free 30 days · no feature limits · no account · no telemetry</p>

    <hr class="rule">

    <div class="why">
      <div>
        <h3>Fast</h3>
        <p>Parallel scanner tuned for NVMe — big drives map in seconds, and the
          treemap fills in live while the scan runs.</p>
      </div>
      <div>
        <h3>A real treemap</h3>
        <p>Zoom with Ctrl+wheel and small files un-aggregate as you go; hover
          anything for details; delete straight from the map.</p>
      </div>
      <div>
        <h3>Honest licensing</h3>
        <p>30-day trial, then a reminder — nothing locks. A $15 license removes
          the reminder forever. The app never phones home.</p>
      </div>
      <div>
        <h3>Yours</h3>
        <p>Windows and Linux builds. Dark, light, and Solarized themes; density
          presets; <a href="/themes/">custom theme files</a>.</p>
      </div>
    </div>

    <h2>See it in action</h2>
    <!-- TODO(media): placeholder SVG mocks. Real captures: 640x400 (8:5) GIFs
         <=4 MB each, or (preferred) MP4/WebM loops via <video autoplay muted
         loop playsinline> — same slot, keep width/height and alt/captions. -->
    <div class="gallery">
      <figure class="shot">
        <img src="/media/demo-scan.svg" width="640" height="400" loading="lazy"
             alt="Animation: the treemap filling in live while a drive scan runs">
        <figcaption>Point it at a drive — the map fills in live.</figcaption>
      </figure>
      <figure class="shot">
        <img src="/media/demo-zoom.svg" width="640" height="400" loading="lazy"
             alt="Animation: zooming into the treemap with Ctrl+wheel, small files un-aggregating">
        <figcaption>Ctrl+wheel to zoom — files un-aggregate as you go.</figcaption>
      </figure>
      <figure class="shot">
        <img src="/media/demo-delete.svg" width="640" height="400" loading="lazy"
             alt="Animation: right-clicking a rectangle in the treemap and deleting the file">
        <figcaption>Found the culprit? Delete it from the map.</figcaption>
      </figure>
    </div>

    <hr class="rule">

    <h2>How the license works</h2>
    <p>Buying gets you a small signed file, <code>gudrun.key</code>. Drop it next
      to the executable (or import it from the reminder dialog) and Gudrun is
      licensed on that machine forever — fully offline, valid for all 1.x
      updates. That's the whole system. <a href="/faq/">More in the FAQ.</a></p>
  </main>
  <footer class="site">
    © 2026 Midnight Softworks · <a href="/terms/">License terms &amp; refunds</a> · <a href="/privacy/">Privacy</a> · support@midnightsoftworks.com
  </footer>
</body>
</html>
```

- [ ] **Step 2: Run the full link suite — must be fully green now**

Run: `npx vitest run tests/site-links.test.ts`
Expected: PASS for every page including `/index.html` and `/gudrun/index.html`.

- [ ] **Step 3: Visual check**

Run: `npx wrangler pages dev public`, open `http://localhost:8788/gudrun/` at desktop, 768px, 360px.
Expected: kind-line + serif title with italic tagline, download row wrapping cleanly on mobile, 4-up "why" row collapsing to 1-col under 640px, three framed gallery slots, license section. No horizontal scroll.

- [ ] **Step 4: Run whole suite and commit**

Run: `npm test` — Expected: all PASS.

```bash
git add public/gudrun/index.html
git commit -m "feat: /gudrun/ product page (downloads, why-row, gallery, license explainer)"
```

---

### Task 6: Restyle commerce pages (buy, license, thanks)

**Files:**
- Modify: `public/buy/index.html`
- Modify: `public/license/index.html`
- Modify: `public/thanks/index.html`

**Interfaces:**
- Consumes: chrome snippets, Task 3 classes (`.page-head`, `.overline`, `.card`, `.price`, `form.lookup`, `.btn`).
- Produces: restyled pages at unchanged URLs; checkout `TODO(release)` comment and URL, the license-lookup form ids (`lookup`, `order`, `email`, `error`) and inline script, and all `/thanks/` copy preserved byte-for-byte in behavior.

For each of the three files apply the same chrome swap, then the per-page tweaks:

- [ ] **Step 1: Chrome swap on all three files**

In each file:
1. Add `class="quiet"` to `<body>` (→ `<body class="quiet">`).
2. Replace the entire `<header class="site">…</header>` block with the canonical header from Global Constraints.
3. Replace the entire `<footer class="site">…</footer>` block with the canonical footer from Global Constraints (it is already identical on these pages — verify, don't assume).

- [ ] **Step 2: Per-page title treatment**

`public/buy/index.html` — replace `<h1>Gudrun — Personal License</h1>` with:

```html
    <div class="page-head">
      <div class="overline">Checkout</div>
      <h1>Gudrun — <em>personal license</em></h1>
    </div>
```

Everything else on the page (price card, bullet list, checkout `TODO(release)` comment and button, Lemon Squeezy note, team email paragraph) stays as-is — the `.card`, `.price`, `.btn`, `.muted` classes are restyled by Task 3.

`public/license/index.html` — replace `<h1>Retrieve your license</h1>` with:

```html
    <div class="page-head">
      <div class="overline">License recovery</div>
      <h1>Retrieve your <em>license</em></h1>
    </div>
```

Do NOT touch the form markup, ids, or the `<script>` block.

`public/thanks/index.html` — read the file first; wrap its existing `<h1>` in the same `.page-head` pattern with overline `Thank you` and an `<em>` on the last word of the existing title, changing no other copy.

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: all PASS (link test covers the edited nav).

- [ ] **Step 4: Visual check**

Open `http://localhost:8788/buy/`, `/license/`, `/thanks/` at desktop and 360px.
Expected: dimmer glow than homepage, overline + serif titles, quiet panels for price/form, form inputs dark with violet focus ring. On `/license/`, submit the form with junk values → the error line appears (API returns non-OK locally is fine; the point is the script still runs).

- [ ] **Step 5: Commit**

```bash
git add public/buy/index.html public/license/index.html public/thanks/index.html
git commit -m "feat: restyle commerce pages (buy, license lookup, thanks) in Deep Field"
```

---

### Task 7: Restyle docs pages (faq, themes, terms, privacy)

**Files:**
- Modify: `public/faq/index.html`
- Modify: `public/themes/index.html`
- Modify: `public/terms/index.html`
- Modify: `public/privacy/index.html`

**Interfaces:**
- Consumes: chrome snippets, Task 3 classes.
- Produces: restyled pages at unchanged URLs; all answer/legal/theme-doc content, code blocks, and anchors preserved.

- [ ] **Step 1: Chrome swap on all four files** — same three edits as Task 6 Step 1 (add `class="quiet"` to body; replace header block with canonical header; replace footer block with canonical footer).

- [ ] **Step 2: Per-page title treatment**

`public/faq/index.html` — replace `<h1>FAQ</h1>` with:

```html
    <div class="page-head">
      <div class="overline">Answers</div>
      <h1>Frequently asked <em>questions</em></h1>
    </div>
```

`public/themes/index.html`, `public/terms/index.html`, `public/privacy/index.html` — read each file, then wrap its existing `<h1>` in the `.page-head` pattern with overlines `Customization`, `The fine print`, and `Privacy` respectively, italicizing the final word of each existing title with `<em>`. Change no body copy. The themes page's code blocks and key-reference tables keep their markup untouched (Task 3's `pre`/`code` styles cover them).

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 4: Visual check**

Open `/faq/`, `/themes/`, `/terms/`, `/privacy/` at desktop and 360px.
Expected: consistent chrome, readable serif h2 question/section headings, code blocks scrolling horizontally inside their own container on narrow screens (no page-level horizontal scroll — the themes page is the stress test).

- [ ] **Step 5: Commit**

```bash
git add public/faq/index.html public/themes/index.html public/terms/index.html public/privacy/index.html
git commit -m "feat: restyle docs pages (faq, themes, terms, privacy) in Deep Field"
```

---

### Task 8: Final sweep

**Files:**
- Possibly small fixes anywhere in `public/` found by the sweep. No planned edits.

**Interfaces:**
- Consumes: everything above.
- Produces: a verified, shippable site.

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: signer/webhook tests + link test all PASS.

- [ ] **Step 2: Grep sweep for leftovers**

Run and check each:
- `grep -rn "Gudrun</a>" public --include=*.html | grep -v gudrun/` — no stale nav links labeled "Gudrun" pointing at `/` (nav should say Software → `/gudrun/`).
- `grep -rln "class=\"quiet\"" public` — expected: exactly buy, license, thanks, faq, themes, terms, privacy (7 files; NOT index.html or gudrun/index.html).
- `grep -rn "My license\|/buy/\">Buy<\|>Themes<" public --include=*.html` — no old nav labels survive anywhere.
- `grep -rn "TODO(release)" public --include=*.html` — expected: exactly 2 hits (buy checkout URL, gudrun download row).
- `grep -rn "rect width=\"216\"" public/logo.svg` — expected: no match (badge is gone).

- [ ] **Step 3: Every-page visual pass**

With `npx wrangler pages dev public` running, open all nine pages (`/`, `/gudrun/`, `/buy/`, `/faq/`, `/license/`, `/themes/`, `/terms/`, `/privacy/`, `/thanks/`) at desktop, 768px, 360px. Checklist per page: starfield edge-to-edge; no watermark/ghost logo anywhere; nav wraps (not overflows) at 360px; footer rule + links; favicon in the tab shows the trimmed M.

- [ ] **Step 4: Commit any fixes and finish**

```bash
git add -A public
git commit -m "chore: final sweep fixes for Deep Field redesign"
```

(Skip the commit if the sweep found nothing.)

---

## Self-Review (completed)

- **Spec coverage:** logo → T1; starfield/system → T3; homepage → T4; /gudrun/ → T5; commerce pages → T6; docs pages → T7; meta titles → in each page task; media requirements → recorded as TODO(media) comments in T4/T5; link integrity + verification → T2/T8. Watermark: absent by construction (T4/T5 markup has none), checked in T8.
- **Placeholder scan:** all code steps carry complete code; the only "read the file first" steps (thanks/themes/terms/privacy h1 wraps) name the exact pattern, overline text, and constraint (change no body copy).
- **Type consistency:** class names used in T4–T7 all exist in T3's stylesheet (`overline`, `kind`, `prod`, `pitch`, `btns`, `btn secondary`, `fine`, `rule`, `page-head`, `hero`, `tagline`, `shot`/`hero-shot`, `gallery`, `why`, `card`, `price`, `lookup`, `muted`, `quiet`).
