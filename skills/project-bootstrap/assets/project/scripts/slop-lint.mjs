#!/usr/bin/env node
// Garageband slop-lint: deterministic design, accessibility and copy checks.
// No AI, no network, no dependencies. Runs the same for every agent and in CI.
//
// Usage:  node scripts/slop-lint.mjs [paths...] [--warn-only] [--json]
// Ignore one line by adding the comment  slop-ok: <reason>  on that line.
// Config (optional): .slop-lint.json  { "ignore": ["glob-ish/path/fragment"], "disable": ["rule-id"] }

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const warnOnly = args.includes("--warn-only");
const asJson = args.includes("--json");
const roots = args.filter((a) => !a.startsWith("--"));
const cwd = process.cwd();

const config = readJson(path.join(cwd, ".slop-lint.json")) ?? {};
const ignoreFragments = ["node_modules", ".git", "dist", "build", ".next", "out", "coverage",
  "playwright-report", ".factory", "vendor", ...(config.ignore ?? [])];
const disabled = new Set(config.disable ?? []);

const EXT = new Set([".tsx", ".jsx", ".ts", ".js", ".html", ".vue", ".svelte", ".astro",
  ".css", ".scss", ".mdx"]);
const MARKUP = new Set([".tsx", ".jsx", ".html", ".vue", ".svelte", ".astro", ".mdx"]);
const STYLE = new Set([".css", ".scss"]);

// ---- design tokens from DESIGN.md frontmatter ----
const tokens = loadTokens(path.join(cwd, "DESIGN.md"));

// ---- rules ----
// level: "error" blocks the merge, "warn" is reported for review.
const rules = [
  {
    id: "zoom-disabled", level: "error", files: MARKUP,
    test: (l) => /user-scalable\s*=\s*["']?(no|0)|maximum-scale\s*=\s*["']?1(\.0)?["'\s,]/i.test(l),
    msg: "Disables pinch-zoom. Users with low vision can't read the page. Remove it.",
  },
  {
    id: "focus-removed", level: "error", files: EXT,
    test: (l) => /outline\s*:\s*(none|0)\b|\boutline-none\b/.test(l) && !/focus-visible|ring/.test(l),
    msg: "Removes the keyboard focus outline without a replacement. Add a visible focus style.",
  },
  {
    id: "img-no-alt", level: "error", files: MARKUP,
    test: (l) => /<img\b(?![^>]*\balt\s*=)[^>]*>/i.test(l),
    msg: "Image without alt text. Add alt=\"…\" (or alt=\"\" if purely decorative).",
  },
  {
    id: "gradient-text", level: "warn", files: EXT,
    test: (l) => /bg-clip-text|background-clip\s*:\s*text/.test(l),
    msg: "Gradient text is a common AI-template tell. Use a solid token colour unless DESIGN.md asks for it.",
  },
  {
    id: "ai-gradient", level: "warn", files: EXT,
    test: (l) => /(from|via|to)-(purple|violet|indigo|fuchsia|cyan)-\d{3}/.test(l) ||
      /linear-gradient\([^)]*(#(8b5cf6|7c3aed|a855f7|6366f1|06b6d4|22d3ee))/i.test(l),
    msg: "Purple/indigo/cyan gradient: the default AI look. Use DESIGN.md colours.",
  },
  {
    id: "eyebrow-label", level: "warn", files: MARKUP,
    test: (l) => /\buppercase\b/.test(l) && /\btracking-(wide|wider|widest|\[)/.test(l),
    msg: "Tiny uppercase tracked label above a heading (an 'eyebrow'). Only keep it if it carries real information.",
  },
  {
    id: "numbered-sections", level: "warn", files: MARKUP,
    test: (l) => />\s*0[1-9]\s*[.\/]?\s*</.test(l),
    msg: "01 / 02 / 03 section markers. Only use numbers for a real sequence the user follows.",
  },
  {
    id: "arrow-cta", level: "warn", files: MARKUP,
    test: (l) => /(→|->|&rarr;)\s*<\/(button|a|Button|Link)>/.test(l),
    msg: "Arrow glued to a button label. Let the label say what happens instead.",
  },
  {
    id: "middot-meta", level: "warn", files: MARKUP,
    test: (l) => />[^<{]*\s·\s[^<{]*\s·\s[^<{]*</.test(l),
    msg: "Strings joined with middle dots (a · b · c). Usually clearer as separate, labelled items.",
  },
  {
    id: "bounce-easing", level: "warn", files: EXT,
    test: (l) => /\banimate-bounce\b/.test(l) ||
      /cubic-bezier\(\s*[\d.]+\s*,\s*(-[\d.]+|1\.[0-9]*[1-9]|[2-9][\d.]*)\s*,/.test(l),
    msg: "Bouncy or overshooting easing. UI motion should settle, not wobble (see ui-build-rules).",
  },
  {
    id: "transition-all", level: "warn", files: EXT,
    test: (l) => /transition\s*:\s*all\b|\btransition-all\b/.test(l),
    msg: "transition: all animates layout properties and causes jank. Name the properties (transform, opacity).",
  },
  {
    id: "emoji-icon", level: "warn", files: MARKUP,
    test: (l) => />\s*[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]\s*</u.test(l),
    msg: "Emoji used as an icon. Use the icon set from DESIGN.md.",
  },
  {
    id: "buzzword-copy", level: "warn", files: MARKUP,
    test: (l) => />[^<]*\b(seamless(ly)?|revolutioni[sz]e|supercharge|game[- ]changer|cutting[- ]edge|unlock the power|next[- ]level|effortless(ly)?|elevate your|leverage)\b[^<]*</i.test(l),
    msg: "Marketing buzzword in UI copy. Say plainly what the product does.",
  },
  {
    id: "off-token-colour", level: "warn", files: EXT,
    enabled: () => tokens.colors.size > 0,
    test: (l) => {
      const hits = l.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) ?? [];
      return hits.some((h) => !tokens.colors.has(normHex(h)));
    },
    msg: "Hard-coded colour not in DESIGN.md. Use a token (or add it to DESIGN.md with a Founder Call).",
  },
  {
    id: "off-token-font", level: "warn", files: EXT,
    enabled: () => tokens.fonts.size > 0,
    test: (l) => {
      const m = l.match(/font-family\s*:\s*([^;}{]+)/i);
      if (!m) return false;
      const first = m[1].split(",")[0].replace(/["']/g, "").trim().toLowerCase();
      if (first.startsWith("var(") || ["inherit", "system-ui", "sans-serif", "serif", "monospace"].includes(first)) return false;
      return !tokens.fonts.has(first);
    },
    msg: "Font not listed in DESIGN.md. Use the design system's fonts.",
  },
].filter((r) => !disabled.has(r.id) && (!r.enabled || r.enabled()));

// ---- run ----
const files = [];
for (const root of roots.length ? roots : ["."]) walk(path.resolve(cwd, root), files);

const findings = [];
for (const file of files) {
  const ext = path.extname(file);
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    if (/slop-ok/.test(line) || line.length > 2000) return;
    for (const rule of rules) {
      if (!rule.files.has(ext)) continue;
      if (rule.test(line)) {
        findings.push({ rule: rule.id, level: rule.level, file: path.relative(cwd, file), line: i + 1,
          msg: rule.msg, text: line.trim().slice(0, 160) });
      }
    }
  });
}

const errors = findings.filter((f) => f.level === "error");
const warns = findings.filter((f) => f.level === "warn");

if (asJson) {
  console.log(JSON.stringify({ files: files.length, errors: errors.length, warnings: warns.length, findings }, null, 2));
} else {
  for (const f of findings) {
    console.log(`${f.level === "error" ? "ERROR" : "warn "} ${f.file}:${f.line} [${f.rule}] ${f.msg}\n       ${f.text}`);
  }
  console.log(`\nslop-lint: ${files.length} files, ${errors.length} errors, ${warns.length} warnings` +
    (tokens.colors.size ? "" : " (no DESIGN.md tokens found; token checks off)"));
  if (errors.length && !warnOnly) console.log("Errors block the merge. Fix them, or add `slop-ok: <reason>` on the line if it's deliberate.");
}
process.exit(errors.length && !warnOnly ? 1 : 0);

// ---- helpers ----
function walk(p, out) {
  if (!fs.existsSync(p)) return;
  const rel = path.relative(cwd, p);
  if (rel && ignoreFragments.some((frag) => rel.split(path.sep).includes(frag) || rel.includes(frag))) return;
  const st = fs.statSync(p);
  if (st.isDirectory()) for (const e of fs.readdirSync(p)) walk(path.join(p, e), out);
  else if (EXT.has(path.extname(p)) && !p.endsWith("slop-lint.mjs")) out.push(p);
}

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
}

function normHex(h) {
  h = h.toLowerCase();
  return h.length === 4 ? "#" + [...h.slice(1)].map((c) => c + c).join("") : h;
}

function loadTokens(p) {
  const out = { colors: new Set(["#ffffff", "#000000"]), fonts: new Set() };
  let text;
  try { text = fs.readFileSync(p, "utf8"); } catch { out.colors.clear(); return out; }
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) { out.colors.clear(); return out; }
  let section = "";
  for (const raw of fm[1].split("\n")) {
    const top = raw.match(/^([a-z_]+):/i);
    if (top) section = top[1];
    if (section === "colors") for (const h of raw.match(/#[0-9a-fA-F]{3,6}\b/g) ?? []) out.colors.add(normHex(h));
    if (section === "fonts") {
      const m = raw.match(/^\s+[a-z_-]+:\s*["']?([^"'#]+?)["']?\s*$/i);
      if (m) out.fonts.add(m[1].trim().toLowerCase());
    }
  }
  if (out.colors.size <= 2) out.colors.clear();
  return out;
}
