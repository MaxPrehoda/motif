---
name: design-enforce
description: "Installs a framework-agnostic lint script that flags arbitrary values, raw hex, off-scale spacing and type, and raw palette classes. Generates its config from the ratified tokens, sets a baseline, and optionally aligns shadcn components. Use as phase 4 of design-system, after design-apply."
---

# Design Enforce

Install a lint script that flags values outside the ratified scales, configured from the project's own tokens.

## Why a script rather than an ESLint rule

ESLint rules operate on JS and JSX ASTs. Svelte markup, Vue templates, Astro files and plain HTML are not covered by them. `assets/design-lint.mjs` scans file text, so it applies to every framework identically and has no plugin dependency.

## Install

```bash
mkdir -p .design scripts
cp <skill>/assets/design-lint.mjs scripts/design-lint.mjs
```

Add to `package.json`:

```json
{ "scripts": { "design-lint": "node scripts/design-lint.mjs" } }
```

## Config

Write `.design/lint.config.json` using the values from `DESIGN.md`, not the defaults in the script.

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

`spacingScale` and `textScale` must match `DESIGN.md` exactly. If they differ, the linter enforces a scale the documentation does not describe.

## Rules

| Rule | Severity | Flags |
|---|---|---|
| `arbitrary-value` | error | `p-[13px]`, `w-[327px]` |
| `raw-hex` | error | `#3b82f6` in markup |
| `off-scale-spacing` | error | `p-7` when 7 is not a step |
| `off-scale-text` | error | `text-7xl` outside the scale |
| `raw-palette` | warn | `text-neutral-700` instead of a role |
| `off-scale-radius` | warn | `rounded-[3px]` |

Errors exit non-zero. Warnings do not.

Set `raw-palette` to warn during migration and promote it to error after `design-apply` batch 3 completes. Tell the user when you install it that this is staged.

## Baseline

On an existing codebase the first run returns hundreds or thousands of findings.

Record that count as the baseline in `.design/lint.config.json` and configure CI to fail only when the count exceeds it. Do not configure CI to fail on any finding. A build that cannot pass gets bypassed, and a bypassed check reports nothing while appearing to.

Lower the baseline as `design-apply` batches land.

## Exceptions

`// design-lint-disable` on a line skips that line. Require a reason in the comment. An exception without a stated reason cannot be reviewed later.

## shadcn alignment

Run this when `components.json` exists.

shadcn components are copied into the repo rather than installed as a dependency, so they diverge from the registry and from each other over time. A raw palette class in `ui/button` propagates to every button in the product.

Read `references/shadcn-alignment.md` and follow its four steps: reconcile `components.json`, audit `ui/` for raw values and local edits, replace hand-written components that duplicate registry ones, and raise severity for findings inside `ui/`.

## Optional

Offer these. Do not install without asking.

Pre-commit hook:

```bash
echo 'npm run design-lint --quiet' >> .husky/pre-commit
```

CI step running `npm run design-lint`.

## Report

Finding count by rule, the three files with the most findings, and the baseline value. State which rules currently block and which only warn.
