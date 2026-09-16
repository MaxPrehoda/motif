---
name: choose-icons
description: "Pick an icon library that actually covers an app's needs, then apply it consistently app-wide. Inventories every icon the product requires, checks real coverage against candidate libraries before committing, and replaces mixed or ad-hoc icons with one set. Use when an app has inconsistent icons, inline SVGs, or no icon system."
---

# Choose Icons

Two failures, both common. Either the app has icons from three sources (a library, some inline SVGs, and an emoji someone used once), or it committed to a library early and now has four hand-drawn exceptions because the library didn't have what the product needed.

This prevents the second one by inventorying need before choosing, which is the step everyone skips.

## Step 1: Inventory what the product needs

Not what it uses now. What it needs. Two sources.

```bash
# icons in use now
grep -rhoE '<(svg|Icon)[^>]*|lucide-|react-icons|@heroicons|phosphor' src --include="*.svelte" --include="*.tsx" | head -40
grep -rn -E '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' src --include="*.svelte" --include="*.tsx" | head -20
```

Then read the app's actual surfaces: nav, actions, empty states, status indicators, file types, integrations. Write the list as concepts, not icon names. "Export", "merge", "webhook", "billing", not "arrow-down-tray".

Concepts are what you test coverage against. A generic list of home, user, settings is covered by every library and tells you nothing.

## Step 2: Test coverage before choosing

This is the whole point. For each candidate, check the specific concepts, especially the domain ones. That's where libraries diverge.

| Library | Count | Style | Notes |
|---|---|---|---|
| **Lucide** | ~1,600 | 2px stroke, geometric | Feather fork. Best framework support. Safe default |
| **Phosphor** | ~9,000 | 6 weights | Widest coverage. Weights are the differentiator |
| **Heroicons** | ~300 | outline + solid | By the Tailwind team. Small, check coverage carefully |
| **Radix Icons** | ~300 | 15x15 grid | Crisp at small sizes. Pairs with shadcn |
| **Tabler** | ~5,800 | 2px stroke | Very broad, Lucide-like style |

Verify against the live catalog instead of trusting these counts. They move.

Report coverage as a fraction with the misses named: "Phosphor 34/34. Lucide 31/34, no `webhook`, `merge`, `oauth`."

Selection rules, in order:
1. **Coverage first.** A beautiful library missing four concepts means four hand-drawn exceptions and an inconsistent set inside a month.
2. **One library.** Mixed stroke widths and grids are visible even to people who can't name what's wrong.
3. **Match existing weight.** If the UI is light and airy, a 2px geometric stroke feels heavy.
4. **Tree-shakeable, per-icon imports.** Never a full-bundle import.

Present the top two with coverage fractions and let the user pick. Once coverage is satisfied it's a taste call.

## Step 3: Size from the type scale

Icons are typographic objects. They sit next to text and get sized from `DESIGN.md`, not from a separate set of numbers.

| Beside | Size |
|---|---|
| `text-sm` | 16px |
| `text-base` | 20px |
| `text-lg` | 24px |
| standalone | 24-32px |

Icons align to cap-height, not the text bounding box. Most need a 1px nudge to look centred. That detail is the difference between careful UI and nearly-right UI.

Use `currentColor` so icons inherit semantic color tokens. Never hard-code icon color.

## Step 4: Apply

```bash
npm install <library>
```

Replace per component, not per icon. A component's icons get decided together. Replace inline SVGs and emoji entirely. Emoji render differently on every platform and aren't an icon system.

Then remove dead imports and any SVG assets that are now unused.

## Report

Library chosen, coverage fraction, count replaced by source (library, inline SVG, emoji), and bundle delta. Name any concept with no good icon. That's a real gap and the user should hear it from you, not find it later.
