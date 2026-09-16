---
name: apply-transitions
description: "Finds state changes, conditional renders and hover states that happen with no transition, classifies each by interaction type, and applies the matching duration and easing token. Use as a phase 5 pass of design-system, or when an app changes state abruptly."
---

# Apply Transitions

Find UI changes that happen instantly and apply the motion tokens to them.

## Prerequisite

```bash
grep -A6 '^## Motion' DESIGN.md || echo "MISSING"
```

Stop if the motion section is missing. Applying durations without tokens produces the inconsistency this pass exists to remove.

## Step 1: Find changes with no transition

You are searching for the absence of a property, so grep for the construct and then check each result.

Conditional renders:

```bash
# Svelte
grep -rn '{#if' src --include="*.svelte" | head -40
# React and JSX
grep -rn -E '\{\s*\w+\s*&&\s*<|\{\s*\w+\s*\?\s*<' src --include="*.tsx" --include="*.jsx" | head -40
# Vue
grep -rn 'v-if=' src --include="*.vue" | head -40
```

For each, check whether the element has `transition:`, `<AnimatePresence>` or `<Transition>`. Record the ones that do not. Modals, dropdowns, toasts, tooltips, accordions, tab panels, error messages and loading states are the common cases.

Interactive elements:

```bash
grep -rn -E 'hover:|focus:|active:|aria-expanded|data-state' src --include="*.svelte" --include="*.tsx" | grep -v 'transition' | head -40
```

A `hover:bg-*` with no `transition-colors` changes instantly.

Dynamic inline styles:

```bash
grep -rn -E 'style=.*(height|width|opacity|transform).*\$?\{' src --include="*.svelte" --include="*.tsx" | head -20
```

## Step 2: Classify, then assign

Assign a duration by interaction class, not per element.

| Class | Token | Applies to |
|---|---|---|
| Micro | `duration-150` | hover, focus, press, checkbox, toggle |
| Standard | `duration-250` | dropdown, tooltip, popover, accordion, tab |
| Large | `duration-400` | modal, drawer, route change, full-page |

Take the easing pair from `DESIGN.md`. Enter uses the ease-out curve, exit uses ease-in.

## Step 3: Constraints

**Animate `transform` and `opacity` only.** Animating `width`, `height`, `top` or `margin` triggers layout on every frame. For a height transition, animate a grid-template-rows value or a scale transform instead.

**Add reduced-motion handling with every change:**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Keep opacity transitions and remove movement. Translation and scale are the vestibular triggers; fades are not.

**Do not add entrance animations to elements that are present on load.** Animate elements when they appear or change, not when the page renders.

## Step 4: Report

Per file: the construct found, the class assigned, the token applied. Then the count by class.

List anything you left without a transition and why. Some state changes should be instant.
