#!/usr/bin/env node
// Screenshot pages at 375, 768, 1024 and 1440 px wide.
// Usage: node shots.mjs <url> [url...] [--out .factory/reports/shots] [--widths 375,768,1024,1440]
// Needs Playwright in the project: npm i -D @playwright/test && npx playwright install chromium
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const argv = process.argv.slice(2);
if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
  console.log(`Usage: node shots.mjs <url> [url...] [--out <dir>] [--widths 375,768,1024,1440]
Saves full-page PNGs named <page>@<width>.png and reports console errors per page.`);
  process.exit(argv.length === 0 ? 1 : 0);
}
const get = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const out = get("--out", ".factory/reports/shots");
const widths = get("--widths", "375,768,1024,1440").split(",").map(Number);
const urls = argv.filter((a, i) => !a.startsWith("--") && !["--out", "--widths"].includes(argv[i - 1]));

let chromium;
try {
  const require = createRequire(path.join(process.cwd(), "package.json"));
  ({ chromium } = require("playwright"));
} catch {
  try {
    const require = createRequire(path.join(process.cwd(), "package.json"));
    ({ chromium } = require("@playwright/test"));
  } catch {
    console.error("Playwright not found in this project. Run: npm i -D @playwright/test && npx playwright install chromium");
    process.exit(1);
  }
}

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
let failures = 0;
for (const url of urls) {
  const slug = (new URL(url).pathname.replace(/\/+$/, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home");
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    const errors = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(String(e)));
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      const file = path.join(out, `${slug}@${w}.png`);
      await page.screenshot({ path: file, fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      console.log(`${file}${overflow ? "  ⚠ horizontal scroll" : ""}${errors.length ? `  ⚠ ${errors.length} console error(s): ${errors[0].slice(0, 120)}` : ""}`);
      if (overflow || errors.length) failures++;
    } catch (e) {
      console.log(`FAILED ${url} @${w}: ${e.message.split("\n")[0]}`);
      failures++;
    }
    await page.close();
  }
}
await browser.close();
process.exit(failures ? 2 : 0);
