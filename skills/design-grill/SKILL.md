---
name: design-grill
description: "Interviews the user to settle every design system decision, in dependency order, writing a rendered HTML preview for each round so choices are made by looking rather than reading numbers. Produces .design/decisions.json. Use as phase 1 of design-system, after design-extract."
---

# Design Grill

Settle every node of the design tree with the user. One round of questions at a time, in dependency order.

Each round writes an HTML file the user opens in a browser. Type scales, spacing and color cannot be judged from numbers in a terminal.

## Prerequisite

```bash
test -f .design/drift.json || echo "MISSING"
```

Stop if missing and run `design-extract` first. Its absorption numbers are what make each recommendation checkable.

## Loop

Read `references/design-tree.md` for the tree, the default for each node, and the traversal rules.

```
compute frontier -> pre-settle from drift.json -> render -> ask -> wait -> record -> repeat
```

### 1. Compute the frontier

The frontier is every unsettled node whose prerequisites are all settled. Round 1 is product character alone.

### 2. Pre-settle from the data

For each node in the frontier, check `drift.json`. If one value already accounts for 90% or more of usage on that axis, do not ask. Put it in the round as a settled line with the percentage, and move on.

Look up anything you can measure. Ask only for decisions the codebase cannot answer.

### 3. Render the round

Write `.design/grill/round-N.html`. Single file, no build step, opens directly in a browser.

Requirements:

- Use the fonts and colors from the project. Read them from the codebase.
- Show options side by side, labelled A, B, C.
- Use real strings from the app. Do not use lorem ipsum, which hides line-length problems.
- Mark the recommended option and put its absorption number on it.
- Include light and dark if the project has both.
- No horizontal scroll at 375px.

Use `assets/round-shell.html` as the starting file.

### 4. Ask in the terminal

Print the file path first, then the questions.

```
Round 2, rendered: .design/grill/round-2.html

SETTLED **Radius**: rounded-lg on 94% of surfaces. Adopting as base.

---

**Q1. Spacing base**: 4px or 8px grid. Options A and B in the preview show the same card at both.

> **A, 4px.** Absorbs 24 of your 31 current values. 8px absorbs 13 and requires 11 rewrites.

---

**Q2. Type ratio**: 1.200 or 1.250, rendered in Inter at your copy.

> **B, 1.250.** Absorbs 11 of your 14 sizes. Your current h1-to-body ratio is 1.24.
```

Number every question. Give every recommendation a number from `drift.json`. Separate questions with `---`.

### 5. Wait

Wait for the user's answers before the next round. Do not proceed on silence and do not ask the next round early.

When an answer differs from your recommendation, accept it, then recompute the affected descendants and state what changed. For example: "8px base removes 6 and 10 from the spacing steps, so round 3 will offer 4 steps instead of 6."

## Record

Append to `.design/decisions.json` after each round:

```json
{
  "character": { "value": "dense-productive", "source": "user", "round": 1 },
  "radius.base": { "value": "0.5rem", "source": "pre-settled", "evidence": "94% of surfaces" },
  "spacing.base": { "value": 4, "source": "user", "recommended": 4, "round": 2 }
}
```

`design-ratify` reads `source` to decide which decisions get a written record. Use `user`, `pre-settled`, or `default`.

## Finish

The phase ends when the frontier is empty.

Print the full settled tree and wait for the user to confirm before handing off to `design-ratify`.
