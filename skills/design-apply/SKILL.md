---
name: design-apply
description: "Migrate a codebase onto ratified design tokens. Replaces arbitrary values, snaps off-scale numbers, swaps raw palette classes for semantic roles. Reviewable batched commits, never one sweeping rewrite. Use as phase 3 of design-system, after design-ratify."
---

# Design Apply

Move the codebase onto the tokens. This is where design systems usually die: someone hand-edits 200 files, gets bored at file 40, and the repo ends up with two systems instead of one.

## Prerequisite

```bash
test -f DESIGN.md || echo "MISSING"
```

## The rule

> **Never invent a value.**

If a value has no token, you've found a gap in the system or a one-off that shouldn't exist. Both need a human. Stop and report. Don't improvise. You improvise faster than a team does, which is what makes this phase dangerous.

Collect unmapped values as you go and hand them over at the end as questions, not as edits you already made.

## Order

Safest first, one commit per batch. If something breaks visually the user bisects in seconds instead of reading a 200-file diff.

### Batch 1: exact matches
Values that already equal a token, written the long way. `p-[16px]` becomes `p-4`. Pure notation, zero visual change. Safe to do wholesale.

### Batch 2: snaps under threshold
Off-scale values within about 2px of a token. `pb-[15px]` becomes `pb-4`. Set the threshold from the spacing base, half a step, never more.

State the count and the largest delta before applying. "47 snaps, biggest is 15px to 16px."

### Batch 3: palette to semantic
`text-neutral-700` becomes `text-muted-foreground`. This needs you to read intent, not match strings. The same grey is body text in one place and a disabled control in another, and they must not collapse into one token.

Work per component, not per class. Read the component, decide its roles, edit it whole.

### Batch 4: everything else
No clean mapping. Don't batch these. Each one gets a look and a note.

## Per batch

```bash
git checkout -b design-apply-batch-N
# edits
npm run build          # or whatever the project's check command is
git diff --stat
```

Report what changed, in what direction, and the largest single delta. Let the user look before you start the next batch. Don't chain batches without a checkpoint.

## Finishing

Run `design-lint` and report what's left by category. Anything remaining is either a deliberate exception or a gap in the system. Say which, for each. A clean lint on a diff nobody reviewed isn't success.
