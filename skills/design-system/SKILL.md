---
name: design-system
description: Plan, implement, and enforce a design system for this project. Runs the full pipeline: measure existing drift, grill the user through the decisions with rendered previews, ratify tokens, apply them across the codebase, and install enforcement. Use when the user wants a design system, says their UI is inconsistent, asks to "clean up the design", or wants spacing/type/color standardized.
---

# Design System

Five phases, each its own skill. Run them in order. Every phase reads the file the last one wrote.

| Phase | Skill | Writes |
|---|---|---|
| 0 | `design-extract` | `.design/drift.json` + drift report |
| 1 | `design-grill` | `.design/decisions.json` |
| 2 | `design-ratify` | tokens + `DESIGN.md` + `.design/records/` |
| 3 | `design-apply` | codemodded source |
| 4 | `design-enforce` | `design-lint` + config + shadcn alignment |

## Running

Call the Skill tool for each phase in sequence. Don't skip ahead. Each phase fails without its predecessor's artifact, on purpose.

Check what already exists before starting:

```bash
ls .design/ 2>/dev/null && cat .design/state.json 2>/dev/null
```

Resume at the first phase whose output is missing. Tell the user where you're resuming and why.

## The one rule

Phases 0 to 2 decide. Phases 3 and 4 execute.

**Never let an execution phase invent a value.** If `design-apply` hits something the tokens don't cover, stop and report it. Don't improvise. Improvising is how design systems rot, and you improvise faster than a team does.

## After the pipeline

These need a ratified system and refuse to run without one:

- `beautify`: snap spacing and type to scale, fix fit and justification
- `apply-transitions`: motion tokens applied app-wide
- `choose-icons`: pick an icon library and apply it
- `empty-states`: find dead zero-states and build them
