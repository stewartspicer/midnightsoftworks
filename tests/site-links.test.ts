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
const dynamicPrefixes = ["/api/", "/download/", ...redirectPrefixes];

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
