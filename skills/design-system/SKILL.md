---
name: design-system
description: "Runs the five-phase pipeline that builds and enforces a design system: measure existing values, settle the decisions with the user, write tokens, migrate the codebase, install a linter. Use when the user wants a design system, says their UI is inconsistent, or asks to standardize spacing, type or color."
---

# Design System

Runs five phases in order. Each reads the file the previous one wrote.

| Phase | Skill | Writes |
|---|---|---|
| 0 | `design-extract` | `.design/drift.json` |
| 1 | `design-grill` | `.design/decisions.json` |
| 2 | `design-ratify` | tokens, `DESIGN.md`, `.design/records/` |
| 3 | `design-apply` | batched commits |
| 4 | `design-enforce` | `scripts/design-lint.mjs` |

## Steps

Check for existing progress:

```bash
ls .design/ 2>/dev/null && cat .design/state.json 2>/dev/null
```

Start at the first phase whose output file is missing. Tell the user which phase you are starting at.

Call the Skill tool for each phase in order. Do not skip a phase. Each one fails without its predecessor's output.

## Rule for phases 3 and 4

Phases 0 through 2 produce decisions. Phases 3 and 4 apply them.

When an execution phase encounters a value with no matching token, stop and report it. Do not pick a substitute. Collect these and present them to the user as questions at the end of the phase.

## Related skills

These require `DESIGN.md` and fail without it:

| Skill | Does |
|---|---|
| `beautify` | Corrects spacing, type, measure, alignment and overflow |
| `apply-transitions` | Applies motion tokens to state changes that have none |
| `choose-icons` | Selects and applies one icon library |
| `empty-states` | Adds zero states to features that render nothing without data |
