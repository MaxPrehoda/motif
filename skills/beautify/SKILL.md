---
name: beautify
description: "Corrects spacing, type, measure, alignment, overflow and focus states in an existing UI without changing its design. Snaps off-scale values to the ratified scale, constrains body text to a readable line length, fixes optical alignment and clipped text. Use when the user wants an existing UI corrected rather than redesigned."
---

# Beautify

Correct mechanical errors in an existing UI. Do not redesign it.

## Prerequisite

```bash
test -f DESIGN.md || echo "MISSING, run design-system first"
```

Stop if it is missing. This pass snaps values to a ratified scale. Without one there is no definition of correct, and every change becomes a judgment call.

## In scope

| Fix | Rule |
|---|---|
| Off-scale spacing | Replace with the nearest token when the difference is under half a spacing step |
| Off-scale type | Replace with the nearest step in the type scale |
| Measure | Constrain body text to 45-75 characters per line |
| Optical alignment | Center icons on cap-height, not the bounding box. Usually a 1px offset |
| Overflow | Fix text that clips, wraps badly, or escapes its container at any breakpoint |
| Leading | Apply the line-height rule from `DESIGN.md`. Tight for display sizes, loose for body |
| Vertical rhythm | Give sibling sections the same gap value |
| Truncation | Bound user-supplied content that can break layout on a long string |
| Touch targets | Enlarge interactive elements under 24x24px |
| Focus states | Add `focus-visible` where missing |

## Out of scope

Do not change: colors (except swapping a raw palette class for its semantic role), layout structure, component choice, shadows, gradients, borders, fonts, imagery, or copy.

Do not add decoration of any kind.

## Test for whether a change belongs here

Compare the before and after. If the difference reads as a different design decision, it does not belong in this pass. If it reads as the same design with an error corrected, it does.

When you cannot tell, leave it and list it under "noticed, not changed".

## Steps

### 1. Find off-scale values

```bash
npm run design-lint --json > /tmp/drift.json
```

Then read the files with the highest counts. Static analysis finds off-scale numbers. Measure and optical alignment require reading the markup.

### 2. Check at three widths

Check 375px, 768px and 1440px if a dev server is available. Overflow and measure problems appear at the extremes and are invisible at desktop width.

### 3. Edit per component

Read a component, fix everything in it, move to the next. Do not find-and-replace a class across the repo. The same value can mean different things in different components.

### 4. Report

```
src/routes/about/+page.svelte
  measure      prose at 118ch -> max-w-prose (65ch)
  snap         pb-[15px] -> pb-4
  optical      icon +1px baseline offset beside label
```

State the total count. State explicitly that no color, layout or component changes were made.
