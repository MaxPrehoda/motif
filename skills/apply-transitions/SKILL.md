---
name: apply-transitions
description: "Apply motion tokens across an entire app. Finds every state change, hover, conditional render, and route transition that happens instantly and gives it the right duration and easing from the design system. Use when an app feels abrupt, or after establishing motion tokens."
---

# Apply Transitions

Give an app a coherent motion layer using only the ratified motion tokens.

Most UIs have motion on the things that are easy to animate, like buttons, because `hover:` is one word. They have nothing on the things that need it: the modal that pops into existence, the list that jumps when an item is removed, the loading state that snaps.

## Prerequisite

```bash
grep -A6 '^## Motion' DESIGN.md || echo "MISSING"
```

Motion tokens have to exist first. Applying durations without them produces exactly the `duration-150` / `duration-200` / `duration-300` on sibling buttons problem this pass is meant to fix.

## Step 1: Find the gaps

Instant changes are invisible in a diff. You're searching for the absence of something. Three classes, by framework.

**Conditional renders with no enter or exit.**

```bash
# Svelte
grep -rn '{#if' src --include="*.svelte" | head -40
# React / JSX
grep -rn -E '\{\s*\w+\s*&&\s*<|\{\s*\w+\s*\?\s*<' src --include="*.tsx" --include="*.jsx" | head -40
# Vue
grep -rn 'v-if=' src --include="*.vue" | head -40
```

For each: does it have `transition:` / `<AnimatePresence>` / `<Transition>`? If not it's a gap. Modals, dropdowns, toasts, tooltips, accordions, tab panels, error messages, and loading states are the usual ones.

**Interactive elements with no transition.**

```bash
grep -rn -E 'hover:|focus:|active:|aria-expanded|data-state' src --include="*.svelte" --include="*.tsx" | grep -v 'transition' | head -40
```

A `hover:bg-*` with no `transition-colors` snaps. Most common instance by far.

**Dynamic inline styles.**

```bash
grep -rn -E 'style=.*(height|width|opacity|transform).*\$?\{' src --include="*.svelte" --include="*.tsx" | head -20
```

`style="height: {open ? 200 : 0}px"` with no transition is a jump.

## Step 2: Classify, then assign

Never pick a duration per element. Classify the interaction and let the class pick the token.

| Class | Token | Applies to |
|---|---|---|
| **Micro** | `duration-150` | hover, focus, press, checkbox, toggle |
| **Standard** | `duration-250` | dropdown, tooltip, popover, accordion, tab |
| **Large** | `duration-400` | modal, drawer, route, full-page |

Easing comes from `DESIGN.md`, usually `ease-out` in and `ease-in` out. Things arrive decelerating and leave accelerating. Reversed, it reads wrong even to people who can't say why.

## Step 3: Non-negotiables

**Animate `transform` and `opacity` only.** Animating `width`, `height`, `top`, or `margin` triggers layout every frame. If you genuinely need a height transition, use grid-rows or scale instead of animating height directly.

**Respect reduced motion.** Every addition, no exceptions:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Keep opacity fades, drop movement. Fading rarely triggers vestibular problems. Translation and scale do.

**Don't animate on mount without a reason.** Entrance animations on every element on page load is the signature move of AI slop motion. Animate what changes, not what exists.

## Step 4: Apply and report

Per batch: file, gap found, class assigned, token. Report the count by class. Then name what you deliberately left alone and why. An instant change is sometimes correct, and a pass that animates everything is as wrong as one that animates nothing.
