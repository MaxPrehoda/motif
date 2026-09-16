#!/usr/bin/env node
/**
 * design-lint: drift checker for token-based design systems.
 * Framework-agnostic: scans template text, so Svelte/Vue/JSX/Astro all work.
 *
 *   node design-lint.mjs [--fix-hints] [--json] [--quiet]
 *
 * Config: .design/lint.config.json (written by the design-enforce skill).
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = process.cwd();
const CFG = ".design/lint.config.json";
const args = new Set(process.argv.slice(2));

const cfg = existsSync(CFG)
  ? JSON.parse(readFileSync(CFG, "utf8"))
  : {
      include: ["src"],
      extensions: [".svelte", ".tsx", ".jsx", ".vue", ".astro", ".html"],
      spacingScale: ["0","0.5","1","1.5","2","2.5","3","4","5","6","8","10","12","16","20","24"],
      textScale: ["xs","sm","base","lg","xl","2xl","3xl","4xl","5xl"],
      radiusScale: ["none","sm","md","lg","xl","2xl","full"],
      semanticColors: ["background","foreground","primary","secondary","muted","accent","card","popover","destructive","border","input","ring"],
      allowRawPalette: false,
      ignore: ["node_modules",".svelte-kit","build","dist",".git"],
      exceptions: [],
    };

const SPACE_PREFIX = "(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y)";
const PALETTE = "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";

const RULES = [
  { id: "arbitrary-value", sev: "error",
    re: new RegExp(`\\b(?:${SPACE_PREFIX}|w|h|text|rounded|top|left|right|bottom|z|max-w|min-h)-\\[[^\\]]+\\]`, "g"),
    msg: (m) => `arbitrary value \`${m}\`. No token covers this, fix the scale or use one`,
  },
  { id: "raw-hex", sev: "error",
    re: /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g,
    msg: (m) => `raw hex \`${m}\`. Use a semantic color token`,
    skip: (f) => /\.(css|svg)$/.test(f),
  },
  { id: "raw-palette", sev: "warn",
    re: new RegExp(`\\b(?:bg|text|border|ring|from|to|via|divide)-(?:${PALETTE})-\\d{2,3}\\b`, "g"),
    msg: (m) => `raw palette \`${m}\`. Use a semantic role instead`,
    enabled: () => !cfg.allowRawPalette,
  },
  { id: "off-scale-spacing", sev: "error",
    re: new RegExp(`\\b${SPACE_PREFIX}-(\\d+(?:\\.\\d+)?)\\b`, "g"),
    check: (m, g) => !cfg.spacingScale.includes(g[1]),
    msg: (m) => `\`${m}\` is off the spacing scale`,
  },
  { id: "off-scale-text", sev: "error",
    re: /\btext-([a-z0-9]+)\b/g,
    check: (m, g) => {
      const v = g[1];
      if (cfg.semanticColors.includes(v)) return false;
      if (new RegExp(`^(?:${PALETTE})$`).test(v)) return false;
      // non-size `text-*` utilities: alignment, wrapping, overflow, and bare colors
      if (["left","center","right","justify","start","end","wrap","nowrap","balance","pretty",
           "ellipsis","clip","transparent","current","inherit","white","black"].includes(v)) return false;
      return !cfg.textScale.includes(v);
    },
    msg: (m) => `\`${m}\` is off the type scale`,
  },
  { id: "off-scale-radius", sev: "warn",
    re: /\brounded-([a-z0-9]+)\b/g,
    check: (m, g) => !cfg.radiusScale.includes(g[1]) && !/^(t|b|l|r|tl|tr|bl|br|s|e)$/.test(g[1]),
    msg: (m) => `\`${m}\` is off the radius scale`,
  },
];

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    if (cfg.ignore.includes(e)) continue;
    const p = join(dir, e);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, out);
    else if (cfg.extensions.includes(extname(p))) out.push(p);
  }
  return out;
}

const files = cfg.include.flatMap((d) => walk(join(ROOT, d)));
const findings = [];

for (const file of files) {
  const rel = relative(ROOT, file);
  if (cfg.exceptions.some((x) => rel.startsWith(x))) continue;
  const lines = readFileSync(file, "utf8").split("\n");

  lines.forEach((line, i) => {
    if (/design-lint-disable/.test(line)) return;
    for (const rule of RULES) {
      if (rule.enabled && !rule.enabled()) continue;
      if (rule.skip && rule.skip(rel)) continue;
      rule.re.lastIndex = 0;
      let m;
      while ((m = rule.re.exec(line)) !== null) {
        if (rule.check && !rule.check(m[0], m)) continue;
        findings.push({ file: rel, line: i + 1, rule: rule.id, sev: rule.sev, msg: rule.msg(m[0]) });
      }
    }
  });
}

if (args.has("--json")) {
  console.log(JSON.stringify({ findings, scanned: files.length }, null, 2));
} else if (!args.has("--quiet")) {
  const byFile = new Map();
  for (const f of findings) (byFile.get(f.file) ?? byFile.set(f.file, []).get(f.file)).push(f);
  for (const [file, fs] of [...byFile].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n\x1b[1m${file}\x1b[0m  \x1b[2m${fs.length}\x1b[0m`);
    for (const f of fs.slice(0, 20)) {
      const c = f.sev === "error" ? "\x1b[31m" : "\x1b[33m";
      console.log(`  ${c}${f.sev}\x1b[0m  ${String(f.line).padStart(4)}  ${f.msg}`);
    }
    if (fs.length > 20) console.log(`  \x1b[2m… ${fs.length - 20} more\x1b[0m`);
  }
  const errs = findings.filter((f) => f.sev === "error").length;
  const warns = findings.length - errs;
  console.log(`\n\x1b[1m${files.length}\x1b[0m files · \x1b[31m${errs} errors\x1b[0m · \x1b[33m${warns} warnings\x1b[0m`);
  const counts = {};
  for (const f of findings) counts[f.rule] = (counts[f.rule] ?? 0) + 1;
  for (const [r, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(5)}  ${r}`);
}

process.exit(findings.some((f) => f.sev === "error") ? 1 : 0);
