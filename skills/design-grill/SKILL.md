---
name: design-grill
description: A relentless interview that settles every design system decision, one dependency-ordered round at a time, with a rendered HTML preview for each round so the user chooses by looking rather than guessing. Use as phase 1 of design-system, after design-extract.
---

# Design Grill

Interview the user until every node of the design tree is settled. Standard frontier discipline, with one change that matters more than the rest:

> **You can't answer a design question in prose.** Nobody picks between a 1.200 and a 1.250 type ratio by reading the numbers. Every round renders.

## Prerequisite

```bash
test -f .design/drift.json || echo "MISSING"
```

If it's missing, stop and run `design-extract`. Don't grill from a blank slate. An unmeasured grill produces arbitrary recommendations, which is what the user already has.

## The loop

Read `references/design-tree.md`. It has the tree, the defaults, and the traversal rules.

```
compute frontier  ->  pre-settle from drift.json  ->  render round  ->  ask  ->  wait  ->  record  ->  repeat
```

### 1. Compute the frontier

Every unsettled node whose prerequisites are settled. Round 1 is always product character, alone.

### 2. Pre-settle everything you can

Before rendering, check `drift.json` for each frontier node. If the codebase already answers it (one value above about 90% usage), don't ask. Put it in the round as a confirmation line and move on.

Finding facts is your job. The user's time is for decisions. If you ask something you could have measured, they'll notice by round two and stop trusting the rest.

### 3. Render the round

Write `.design/grill/round-N.html`. Standalone file, no build step, opens directly in a browser.

All of these matter:

- **Their actual fonts and colors.** Read them from the codebase. A type scale in the wrong typeface answers a different question than the one you asked.
- **Options side by side, labelled A/B/C.** One option alone is unanswerable.
- **Real content, never lorem ipsum.** Pull strings from the app. Lorem hides line-length problems, which is most of what a type scale decides.
- **Mark the recommendation** and put the absorption number on it.
- **Light and dark**, if the project has both.
- Works at phone width. No horizontal scroll.

Use `assets/round-shell.html` as the frame.

### 4. Ask in the terminal

The HTML shows. The terminal asks. Point at the file first:

```
Round 2, rendered: .design/grill/round-2.html

SETTLED **Radius**: rounded-lg on 94% of surfaces. Adopting as base.

---

**Q1. Spacing base**: 4px or 8px grid. A and B in the preview, same card at both.

> **A, 4px.** Absorbs 24 of your 31 current values. 8px forces 11 rewrites for no visible gain.

---

**Q2. Type ratio**: 1.200 vs 1.250, rendered in Inter at your real copy.

> **B, 1.250.** You have 14 sizes. This absorbs 11. Your h1/body contrast is already close to it.
```

Number every question. Every recommendation gets a reason from the data. Separate with `---`.

### 5. Wait

Don't proceed on silence. Don't batch the next round hoping to save time. The decisions are the user's.

If an answer contradicts your recommendation, take it. Then check whether it reshapes anything downstream and say so. "8px base drops 6 and 10 from the spacing steps, so round 3 offers 4 steps instead of 6."

## Recording

After each round, append to `.design/decisions.json`:

```json
{
  "character": { "value": "dense-productive", "source": "user", "round": 1 },
  "radius.base": { "value": "0.5rem", "source": "pre-settled", "evidence": "94% of surfaces" },
  "spacing.base": { "value": 4, "source": "user", "recommended": 4, "round": 2 }
}
```

`source` matters downstream. `design-ratify` writes a record only for nodes the user chose against recommendation, or that are expensive to reverse. Pre-settled nodes get no ceremony.

## Done

The frontier is empty. Every branch visited, nothing silently assumed.

Don't move to `design-ratify` until the user confirms. Show them the full settled tree and ask for a yes.
