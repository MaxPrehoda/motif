---
name: design-extract
description: "Measure the design system a codebase already has by accident. Inventories every spacing, type, color, radius, shadow, and motion value in the source, finds collisions and near-duplicates, and writes a drift report. Use as phase 0 of design-system, or standalone when the user asks how inconsistent their UI is."
---

# Design Extract

You're not designing anything yet. You're counting.

Every codebase already has a design system. It's just an accidental one with 31 spacing values and 9 blues. Make it visible, because the grill that follows is about fixing what you find here, not inventing from scratch. "This absorbs 11 of your 14 sizes" is an argument. "I like 1.250" isn't.

## Step 1: Detect the stack

```bash
cat package.json 2>/dev/null | grep -E '"(tailwindcss|svelte|react|vue|next)"'
ls tailwind.config.* app/globals.css src/app.css src/**/*.css 2>/dev/null | head
```

Record: framework, Tailwind major version (v3 has `tailwind.config.js`, v4 has `@theme` in CSS), whether shadcn is there (`components.json`), and the component file extension. Everything downstream branches on these.

Read `references/detection.md` for per-stack extraction patterns.

## Step 2: Extract raw values

Sweep the source for each axis. You want counts and collisions, not a list.

**Arbitrary values.** The loudest signal. Any `[...]` in a utility is a number someone made up under deadline:

```bash
grep -rhoE '\b(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|w|h|top|left|right|bottom|text|rounded|z)-\[[^]]+\]' \
  src --include="*.svelte" --include="*.tsx" --include="*.jsx" --include="*.vue" | sort | uniq -c | sort -rn
```

**Spacing.** The scale actually in use:

```bash
grep -rhoE '\b(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-[xy])-[0-9.]+\b' src --include="*.svelte" --include="*.tsx" | sort | uniq -c | sort -rn
```

**Type.** Sizes, weights, and whether anyone ever set line-height on purpose:

```bash
grep -rhoE '\btext-(xs|sm|base|lg|xl|[2-9]xl)\b' src --include="*.svelte" --include="*.tsx" | sort | uniq -c | sort -rn
grep -rhoE '\bfont-(thin|light|normal|medium|semibold|bold|extrabold|black)\b' src --include="*.svelte" --include="*.tsx" | sort | uniq -c | sort -rn
grep -rhoE '\bleading-[a-z0-9.]+\b' src --include="*.svelte" --include="*.tsx" | sort | uniq -c | sort -rn
```

**Color.** Raw palette vs. semantic tokens. A healthy system has almost no raw:

```bash
grep -rhoE '\b(bg|text|border|ring|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\b' src --include="*.svelte" --include="*.tsx" | sort | uniq -c | sort -rn
grep -rhoE '#[0-9a-fA-F]{3,8}\b' src --include="*.svelte" --include="*.tsx" --include="*.css" | sort | uniq -c | sort -rn
grep -rhoE '\b(bg|text|border)-(background|foreground|primary|secondary|muted|accent|card|popover|destructive)\b' src --include="*.svelte" --include="*.tsx" | sort | uniq -c | sort -rn
```

**Radius, shadow, motion:**

```bash
grep -rhoE '\brounded(-[a-z0-9]+)?\b' src --include="*.svelte" --include="*.tsx" | sort | uniq -c | sort -rn
grep -rhoE '\bshadow(-[a-z0-9]+)?\b' src --include="*.svelte" --include="*.tsx" | sort | uniq -c | sort -rn
grep -rhoE '\b(transition|duration|ease|animate)-[a-z0-9-]+\b' src --include="*.svelte" --include="*.tsx" | sort | uniq -c | sort -rn
```

## Step 3: Find the collisions

Raw counts aren't the finding. Collisions are. Per axis, identify:

- **Near-duplicates.** Values within about 15% of each other doing the same job, like `px-3` and `px-3.5` on sibling buttons. Nobody chose these. They're noise.
- **Long tail.** Used once or twice. Candidates to absorb into a neighbour.
- **Working set.** Used often enough to matter. This is the real system. A good scale should keep most of it.
- **Orphans.** Arbitrary values with no scale neighbour at all.

Absorption is the number that makes the grill persuasive: if we adopt scale X, N of your M values snap onto it with no visible change. Compute it per axis.

## Step 4: Write the report

Write `.design/drift.json`:

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

Then show the user a terminal summary. Per axis: distinct count, arbitrary count, one-line headline ("31 spacing values, 6 carry 80% of usage"). Name the three worst files. Keep it under 25 lines. The JSON holds the detail.

Don't recommend anything yet. That's the grill's job and it needs these numbers.
