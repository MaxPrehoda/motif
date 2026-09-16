---
name: design-ratify
description: Turn settled design decisions into executable artifacts: theme tokens, a DESIGN.md that agents and humans both read, and decision records for the few choices that are expensive to reverse. Use as phase 2 of design-system, after design-grill.
---

# Design Ratify

Turn decisions into files that make them real.

The thing that separates this from writing a style guide: the docs and the enforcement are the same file. A `CONTEXT.md` describing a domain model is prose somebody might read. `@theme` tokens are prose the compiler reads. Write the tokens and the doc stops being aspirational.

## Prerequisite

```bash
test -f .design/decisions.json || echo "MISSING"
```

Missing, or any node unsettled: stop. Ratifying a partial tree bakes in a guess.

## What you write

### 1. Tokens

Branch on the Tailwind version in `drift.json`.

**Tailwind v4.** `@theme` in the main CSS file:

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

**Tailwind v3.** `theme.extend` in `tailwind.config.js`. Keep the existing `hsl(var(--x))` convention if shadcn is there. Don't migrate a working v3 project to v4 as part of this. Separate decision, its own risk, nobody asked.

Rules:
- **Semantic names.** `--color-primary`, never `--color-blue-600`. Literal names are how you end up with a token called `blue` that's green.
- **Derive, don't enumerate.** `--radius-sm: calc(var(--radius-lg) - 2px)`. One edit retunes the set.
- **Only what was decided.** Don't pad the token set. Every unused token is drift with permission.

### 2. `DESIGN.md`

Repo root. This gets loaded into context on every future design task, so write it for an agent skimming fast. Tables over paragraphs. Rule first, reason second. No throat-clearing.

```markdown
# Design System

Character: dense/productive. Decided <date>.

## Spacing, 4px base
| Token | Value | Use |
|---|---|---|
| `1` | 4px | icon gaps, tight inline |
| `2` | 8px | control padding |
...
**Never** use arbitrary spacing. If nothing fits, the scale is wrong. Fix the scale.

## Type, 1.250, 6 steps
| Token | Size | Leading | Use |
...
Leading is inverse to size. Display tight, body loose.

## Color, semantic roles only
| Role | Means |
|---|---|
| `primary` | the one action that advances the task |
| `muted-foreground` | present but not the point |
...
**Never** use raw palette classes like `text-neutral-700`. Always the role.

## Motion
Enter `ease-out`, exit `ease-in`. 150 micro, 250 standard, 400 large.

## Enforcement
`npm run design-lint`. CI-blocking.
```

Put a **Never** line on each axis. Agents follow explicit prohibitions. They don't reliably infer them from examples.

### 3. Decision records

`.design/records/NNNN-slug.md`. Write one only when a decision is costly to undo, or the user went against your recommendation:

- token architecture (semantic vs. literal)
- spacing base unit
- type ratio
- color space
- dark mode strategy
- component substrate (shadcn or not)

That's close to the whole list. Changing a shade of blue is free and needs no record. Most design decisions are reversible, and ceremony around reversible decisions teaches people to ignore the ceremony.

Format: context, decision, consequences, what would make us revisit. Under 30 lines.

## Verify before finishing

```bash
npx tailwindcss -i <input.css> -o /tmp/t.css 2>&1 | tail -5
```

Then confirm every node in `decisions.json` shows up in the output, and report anything that doesn't. A decision that didn't make it into a token didn't happen.
