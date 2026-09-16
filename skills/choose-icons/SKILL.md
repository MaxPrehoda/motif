---
name: choose-icons
description: "Lists the icon concepts a product needs, checks candidate libraries for coverage of those specific concepts, then installs one library and replaces all existing icons, inline SVGs and emoji with it. Use as a phase 5 pass of design-system, or when an app has icons from multiple sources."
---

# Choose Icons

Determine which icons the product needs, verify a library covers them, then apply that library everywhere.

Check coverage before selecting. A library chosen on appearance will be missing specific icons, and the gaps get filled with hand-drawn exceptions.

## Step 1: List required concepts

Find what is in use now:

```bash
grep -rhoE '<(svg|Icon)[^>]*|lucide-|react-icons|@heroicons|phosphor' src --include="*.svelte" --include="*.tsx" | head -40
grep -rn -E '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' src --include="*.svelte" --include="*.tsx" | head -20
```

Then read the product's surfaces: navigation, actions, empty states, status indicators, file types, integrations.

Write the requirement as concepts, not icon names. Write "export", "merge", "webhook", "billing", not "arrow-down-tray". Concepts are what you test against, and every library covers home, user and settings.

## Step 2: Check coverage

For each candidate, look up every concept on the list, especially the domain-specific ones.

| Library | Approx count | Style |
|---|---|---|
| Lucide | 1,600 | 2px stroke, geometric |
| Phosphor | 9,000 | 6 weights |
| Heroicons | 300 | outline and solid |
| Radix Icons | 300 | 15x15 grid |
| Tabler | 5,800 | 2px stroke |

Verify counts against the live catalog rather than this table.

Report coverage as a fraction with the missing concepts named: "Phosphor 34/34. Lucide 31/34, missing webhook, merge, oauth."

Selection order:

1. Coverage. A library missing concepts produces hand-drawn exceptions.
2. One library only. Mixed stroke weights and grid sizes are visible side by side.
3. Stroke weight matching the existing UI.
4. Per-icon imports, not a full-bundle import.

Present the top two with their coverage fractions and let the user choose.

## Step 3: Size from the type scale

Icons sit beside text and take their size from `DESIGN.md`, not a separate scale.

| Beside | Size |
|---|---|
| `text-sm` | 16px |
| `text-base` | 20px |
| `text-lg` | 24px |
| standalone | 24-32px |

Align icons to cap-height rather than the text bounding box. This usually requires a 1px offset.

Set icon color with `currentColor` so it inherits the semantic role of its container.

## Step 4: Apply

```bash
npm install <library>
```

Replace per component rather than per icon. Replace inline SVGs and emoji as well; emoji render differently across platforms.

Remove unused imports and orphaned SVG assets afterward.

## Report

Library, coverage fraction, count replaced by source (library, inline SVG, emoji), and bundle size change. List any concept with no adequate icon.
