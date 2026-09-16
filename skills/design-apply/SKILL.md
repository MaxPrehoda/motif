---
name: design-apply
description: "Migrates a codebase onto ratified design tokens in four batches, ordered by risk: exact matches, sub-threshold snaps, palette-to-role mapping, then everything else. Commits each batch separately. Use as phase 3 of design-system, after design-ratify."
---

# Design Apply

Replace off-token values in the codebase with tokens. Work in four batches, committing each separately so any visual regression can be bisected.

## Prerequisite

```bash
test -f DESIGN.md || echo "MISSING"
```

## Rule

When a value has no matching token, stop and record it. Do not choose the closest token, and do not add a new one.

Collect these as you go and present them at the end of the phase as a list of questions. Each is either a gap in the scale or a value that should not exist, and both need the user to decide.

## Batch 1: exact matches

Values already equal to a token, written in long form. `p-[16px]` to `p-4`. No visual change. Apply across the repo.

## Batch 2: snaps under threshold

Off-scale values within half a spacing step of a token. `pb-[15px]` to `pb-4`.

Before applying, state the count and the largest single change. For example: "47 snaps, largest is 15px to 16px."

## Batch 3: palette to semantic role

`text-neutral-700` to `text-muted-foreground`.

This requires reading intent, not matching strings. The same grey can be body text in one component and a disabled state in another, and those must map to different roles.

Work one component at a time: read it, decide the role for each usage, edit the whole file.

## Batch 4: remaining values

Values with no clean mapping. Handle individually. Do not batch.

## Per batch

```bash
git checkout -b design-apply-batch-N
# edits
npm run build          # or the project's check command
git diff --stat
```

Report what changed, the direction of each change, and the largest single difference. Wait for the user to review before starting the next batch.

## Finish

Run `design-lint` and report remaining findings by rule. For each one, state whether it is a deliberate exception or a gap in the scale.
