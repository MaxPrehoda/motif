---
name: design-enforce
description: Install drift enforcement for a ratified design system. A framework-agnostic lint script with config derived from the tokens, an npm script, shadcn substrate alignment, and optional CI and pre-commit wiring. Use as phase 4 of design-system, after design-apply.
---

# Design Enforce

A design system without enforcement lasts about six weeks. Someone ships `p-[13px]` under deadline, review misses it because it's one line in a 400-line diff, and two months later there are two systems again.

This makes that mechanically impossible.

## Why a script and not ESLint

ESLint rules read JS and JSX ASTs. Most drift lives in template text: Svelte markup, Vue templates, Astro, plain HTML. Those rules can't see any of it. `assets/design-lint.mjs` scans text, so it covers every framework the same way, needs no plugin, and runs anywhere Node does.

## Install

```bash
mkdir -p .design scripts
cp <skill>/assets/design-lint.mjs scripts/design-lint.mjs
```

Add to `package.json`:

```json
{ "scripts": { "design-lint": "node scripts/design-lint.mjs" } }
```

## Generate the config

Write `.design/lint.config.json` from the ratified tokens, not from the defaults in the script. The linter enforces this project's decisions.

```json
{
  "include": ["src"],
  "extensions": [".svelte", ".tsx", ".jsx", ".vue", ".astro", ".html"],
  "spacingScale": ["0", "1", "2", "3", "4", "6", "8", "12", "16"],
  "textScale": ["xs", "sm", "base", "lg", "xl", "2xl", "3xl"],
  "radiusScale": ["none", "sm", "md", "lg", "full"],
  "semanticColors": ["background", "foreground", "primary", "muted", "accent", "card", "destructive", "border"],
  "allowRawPalette": false,
  "exceptions": []
}
```

Pull `spacingScale` and `textScale` straight from `DESIGN.md`. If they disagree you have two sources of truth and the linter is enforcing the wrong one.

## Rules

| Rule | Severity | Catches |
|---|---|---|
| `arbitrary-value` | error | `p-[13px]`, `w-[327px]` |
| `raw-hex` | error | `#3b82f6` in markup |
| `off-scale-spacing` | error | `p-7` when 7 isn't a step |
| `off-scale-text` | error | `text-7xl` outside the scale |
| `raw-palette` | warn | `text-neutral-700` instead of a role |
| `off-scale-radius` | warn | `rounded-[3px]` |

Errors exit non-zero. Warnings don't. Palette usage starts as a warning because it's the longest tail to migrate. Promote it to error once `design-apply` batch 3 is done, and say so when you install.

## shadcn alignment

If `components.json` exists, align the substrate before you trust the linter.

shadcn components are copied into the repo and owned there, so they drift in a way a versioned dependency can't. A raw palette class in a page affects one screen. The same class in `ui/button` affects every button in the product. That makes `ui/` the highest-leverage place to enforce and the easiest to forget.

Read `references/shadcn-alignment.md` and work its four steps: reconcile `components.json` (especially `cssVariables: true`), audit installed components for raw values and forgotten local edits, replace hand-rolled components that shadow registry ones, then tighten the linter over `ui/`.

## Escape hatch

`// design-lint-disable` on a line skips it. Real exceptions exist. A marketing hero that genuinely needs a one-off size isn't drift. Require a reason in the comment. A disable with no reason is drift wearing a hat.

## Baseline, don't block

On an existing codebase the first run comes back in the hundreds or thousands. Don't wire CI to fail on day one. A permanently red build gets ignored within a week, and then the linter is worse than nothing because people think it's checking something.

Record the current count as a baseline in `.design/lint.config.json` and have CI fail only when the count goes up. Ratchet it down as `design-apply` batches land.

## Optional wiring

Offer these. Don't install without asking.

**Pre-commit**, catches drift before it exists:
```bash
echo 'npm run design-lint --quiet' >> .husky/pre-commit
```

**CI**, a step running `npm run design-lint`.

## Report

Count by rule, the three worst files, and the baseline you set. Then say plainly what's blocked and what's only observed. The user needs to know which of these will interrupt them tomorrow.
