---
name: design-extract
description: "Inventories every spacing, type, color, radius, shadow and motion value used in a codebase, then reports collisions, near-duplicates and how many values a proposed scale would absorb. Produces .design/drift.json. Use as phase 0 of design-system, or when the user asks how inconsistent their UI is."
---

# Design Extract

Count the values currently in use. Do not recommend anything.

The output feeds `design-grill`, which uses the absorption numbers to justify its recommendations.

## Step 1: Detect the stack

```bash
cat package.json 2>/dev/null | grep -E '"(tailwindcss|svelte|react|vue|next)"'
ls tailwind.config.* app/globals.css src/app.css src/**/*.css 2>/dev/null | head
```

Record: framework, Tailwind major version (v3 uses `tailwind.config.js`, v4 uses `@theme` in CSS), whether `components.json` exists, and the component file extension.

Read `references/detection.md` for per-stack extraction patterns.

## Step 2: Extract values

Run each sweep and keep the counts.

Arbitrary values, which are values written inline rather than taken from a scale:

```bash
grep -rhoE '\b(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|w|h|top|left|right|bottom|text|rounded|z)-\[[^]]+\]' \
  src --include="*.svelte" --include="*.tsx" --include="*.jsx" --include="*.vue" | sort | uniq -c | sort -rn
```

Spacing:

```bash
grep -rhoE '\b(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-[xy])-[0-9.]+\b' src --include="*.svelte" --include="*.tsx" | sort | uniq -c | sort -rn
```

Type sizes, weights, and line-heights:

```bash
grep -rhoE '\btext-(xs|sm|base|lg|xl|[2-9]xl)\b' src --include="*.svelte" --include="*.tsx" | sort | uniq -c | sort -rn
grep -rhoE '\bfont-(thin|light|normal|medium|semibold|bold|extrabold|black)\b' src --include="*.svelte" --include="*.tsx" | sort | uniq -c | sort -rn
grep -rhoE '\bleading-[a-z0-9.]+\b' src --include="*.svelte" --include="*.tsx" | sort | uniq -c | sort -rn
```

Color, split by raw palette classes, hex literals, and semantic roles:

```bash
grep -rhoE '\b(bg|text|border|ring|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\b' src --include="*.svelte" --include="*.tsx" | sort | uniq -c | sort -rn
grep -rhoE '#[0-9a-fA-F]{3,8}\b' src --include="*.svelte" --include="*.tsx" --include="*.css" | sort | uniq -c | sort -rn
grep -rhoE '\b(bg|text|border)-(background|foreground|primary|secondary|muted|accent|card|popover|destructive)\b' src --include="*.svelte" --include="*.tsx" | sort | uniq -c | sort -rn
```

Radius, shadow and motion:

```bash
grep -rhoE '\brounded(-[a-z0-9]+)?\b' src --include="*.svelte" --include="*.tsx" | sort | uniq -c | sort -rn
grep -rhoE '\bshadow(-[a-z0-9]+)?\b' src --include="*.svelte" --include="*.tsx" | sort | uniq -c | sort -rn
grep -rhoE '\b(transition|duration|ease|animate)-[a-z0-9-]+\b' src --include="*.svelte" --include="*.tsx" | sort | uniq -c | sort -rn
```

## Step 3: Classify per axis

For each axis, sort the values into four groups:

- **Near-duplicates**: values within 15% of each other used in the same role, such as `px-3` and `px-3.5` on sibling buttons.
- **Long tail**: values used once or twice.
- **Working set**: values used often enough to carry most of the usage.
- **Orphans**: arbitrary values with no neighbour on any scale.

Then compute **absorption** for each candidate scale: the count of current values that would map onto it with a visible difference under 2px. `design-grill` quotes this number when it recommends a scale.

## Step 4: Write the output

`.design/drift.json`:

```json
{
  "stack": { "framework": "svelte", "tailwind": 3, "shadcn": true, "ext": "svelte" },
  "axes": {
    "spacing": {
      "distinct": 31, "arbitrary": ["pb-[15px]"], "workingSet": ["2","3","4","6","8"],
      "nearDuplicates": [["3","3.5"]], "longTail": ["1.5","7","9","11"]
    }
  },
  "hotspots": [{ "file": "src/routes/about/+page.svelte", "issues": 14 }]
}
```

Then print a summary under 25 lines. Per axis: distinct count, arbitrary count, and how many values carry 80% of usage. Name the three files with the most findings.

Do not recommend a scale. That is `design-grill`'s output.
