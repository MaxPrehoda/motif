---
name: design-ratify
description: "Writes settled design decisions into theme tokens, a DESIGN.md reference, and decision records for choices that are expensive to reverse. Use as phase 2 of design-system, after design-grill."
---

# Design Ratify

Write the settled decisions into three artifacts: tokens, `DESIGN.md`, and decision records.

## Prerequisite

```bash
test -f .design/decisions.json || echo "MISSING"
```

Stop if it is missing or if any node in it is unsettled.

## 1. Tokens

Branch on the Tailwind version recorded in `drift.json`.

**Tailwind v4**, `@theme` in the main CSS file:

```css
@theme {
  --spacing: 0.25rem;
  --text-xs: 0.75rem;   --text-xs--line-height: 1.6;
  --text-base: 1rem;    --text-base--line-height: 1.6;
  --text-3xl: 1.953rem; --text-3xl--line-height: 1.2;
  --radius-lg: 0.5rem;
  --color-primary: oklch(0.55 0.22 264);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-micro: 150ms;
}
```

**Tailwind v3**, `theme.extend` in `tailwind.config.js`. Keep the existing `hsl(var(--x))` format when `components.json` exists. Do not upgrade the project from v3 to v4 in this phase.

Rules:

- Name tokens by role, not by value. Use `--color-primary`, not `--color-blue-600`. A value-named token becomes wrong the first time the value changes.
- Derive related values rather than listing them. `--radius-sm: calc(var(--radius-lg) - 2px)`.
- Write only tokens for decisions in `decisions.json`. Do not add tokens nobody chose.

## 2. DESIGN.md

Write to the repo root. This file is loaded into agent context on future design tasks, so use tables, state each rule before its reason, and omit preamble.

```markdown
# Design System

Character: dense/productive. Decided <date>.

## Spacing, 4px base
| Token | Value | Use |
|---|---|---|
| `1` | 4px | icon gaps, tight inline |
| `2` | 8px | control padding |
...
**Never** use arbitrary spacing values. If no token fits, the scale is wrong. Change the scale.

## Type, 1.250 ratio, 6 steps
| Token | Size | Leading | Use |
...
Line-height is inverse to size.

## Color, semantic roles only
| Role | Means |
|---|---|
| `primary` | the action that advances the primary task |
| `muted-foreground` | secondary information |
...
**Never** use raw palette classes such as `text-neutral-700`. Use the role.

## Motion
`ease-out` entering, `ease-in` exiting. 150ms micro, 250ms standard, 400ms large.

## Enforcement
`npm run design-lint`. Blocks CI when the count rises above baseline.
```

Include a **Never** line for each axis. State prohibitions explicitly rather than implying them through examples.

## 3. Decision records

Write `.design/records/NNNN-slug.md` only for decisions in these categories, or where `decisions.json` shows the user chose against the recommendation:

- token naming scheme
- spacing base unit
- type ratio
- color space
- dark mode strategy
- component substrate

Format: context, decision, consequences, what would prompt revisiting it. Under 30 lines.

Do not write records for individual values. Changing a color is a one-line edit.

## 4. Verify

```bash
npx tailwindcss -i <input.css> -o /tmp/t.css 2>&1 | tail -5
```

Confirm the tokens compile. Then check that every node in `decisions.json` appears in the token output and report any that do not.
