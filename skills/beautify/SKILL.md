---
name: beautify
description: "A restrained polish pass over an existing UI. Snaps spacing and type to the ratified scale, fixes text that overflows or sits badly in its container, corrects optical alignment and measure. Makes things right without redesigning them. Use when the user says the UI looks \"off\", \"amateur\", or \"not quite right\" but doesn't want it redesigned."
---

# Beautify

The narrowest pass in the suite, on purpose.

The constraint is the feature. Every "make my UI better" agent redesigns things: new gradients, new shadows, a different button. The user then loses an afternoon reverting it. This pass changes nothing they'd recognize as a design decision. It fixes things that are just wrong.

## Prerequisite

```bash
test -f DESIGN.md || echo "MISSING, run design-system first"
```

Without a ratified scale you have no definition of "right", and the pass becomes taste. That's the exact failure this skill exists to avoid. Stop and say so.

## In scope

| Fix | What it means |
|---|---|
| **Snap to scale** | Off-scale spacing to the nearest token, when the delta is imperceptible |
| **Optical alignment** | Icons next to text centred on cap-height, not the bounding box |
| **Measure** | Body text held to 45-75ch. Long lines are the most common cause of "looks amateur" |
| **Overflow** | Text that clips, wraps badly, or escapes its container at any breakpoint |
| **Leading** | Line-height inverse to size per `DESIGN.md`. Display tight, body loose |
| **Vertical rhythm** | Sibling sections with mismatched gaps, collapsed to one value |
| **Truncation** | Unbounded user content that will break the layout on a long string |
| **Touch targets** | Interactive elements under 24x24px |
| **Focus states** | Missing `focus-visible`. Accessibility, and cheap |

## Out of scope, don't touch

Colors, beyond swapping raw palette for a role. Layout structure. Component choice. Adding shadows, gradients, or decoration. Fonts. Imagery. Copy.

The test: if a change would show up in a screenshot comparison as a design difference rather than a correction, it doesn't belong here. Apply that honestly.

## Method

### 1. Find the offenders

```bash
npm run design-lint --json > /tmp/drift.json
```

Then read the highest-density files. Static analysis finds off-scale values. Only reading finds bad measure and optical misalignment.

### 2. Check at width

Text problems are invisible at desktop width. If there's a dev server, check 375px, 768px, and 1440px. Most overflow and measure failures only show at the extremes.

### 3. Apply per component

Read the component, fix everything in it, move on. Don't sweep one class across the repo. The same value means different things in different places, and a global replace is how a "safe" pass breaks a layout.

### 4. Report as a table

```
src/routes/about/+page.svelte
  measure      prose at 118ch -> max-w-prose (65ch)
  snap         pb-[15px] -> pb-4
  optical      icon +1px baseline nudge beside label
```

State the count and confirm: no color, layout, or component changes. The user should be able to trust that sentence without reading the diff.

## Judgement

If you're unsure whether something is a correction or a redesign, it's a redesign. Leave it. List it at the end under "noticed but not changed" so the user can decide.
