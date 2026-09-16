# Motif

[![skills.sh](https://skills.sh/b/maxprehoda/motif)](https://skills.sh/maxprehoda/motif)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Ten agent skills that plan, build and enforce a design system, then keep your agent inside it.

A motif is the element that recurs until a work feels like one work. That's what a spacing
scale is: the same six numbers, everywhere, on purpose.

```bash
npx skills add MaxPrehoda/motif
```

Or as a Claude Code plugin:

```
/plugin marketplace add MaxPrehoda/motif
/plugin install motif
```

Works in Claude Code, Cursor, Codex, Copilot, Gemini CLI, and anything else that reads `SKILL.md`.

## The pipeline

Run these in order. Each one fails without the file the last one wrote.

| Phase | Skill | Writes |
|---|---|---|
| 0 | `design-extract` | `.design/drift.json` |
| 1 | `design-grill` | `.design/decisions.json` |
| 2 | `design-ratify` | tokens, `DESIGN.md`, decision records |
| 3 | `design-apply` | batched commits |
| 4 | `design-enforce` | `scripts/design-lint.mjs` |

`design-system` is the composer. It runs all five and resumes at the first phase whose file is missing.

## The passes

These need a ratified system and refuse to run without one.

| Skill | Does |
|---|---|
| `beautify` | Snaps spacing and type to scale, fixes measure, optical alignment, overflow, focus states |
| `apply-transitions` | Finds state changes that happen instantly, applies motion tokens |
| `choose-icons` | Works out which icons the product needs, tests coverage, applies one library |
| `empty-states` | Finds functionality that renders nothing when it has no data |

## Two things worth knowing

**The design tree is known in advance.** A domain model has to be discovered. Design doesn't.
You can't pick component padding before the base unit, or line-height before the scale ratio.
So the tree ships as data in `design-grill/references/design-tree.md` and the interview is a
walk through it.

**Phase 0 measures before anything asks you a question.** Every recommendation carries an
absorption number from your own codebase. "This absorbs 11 of your 14 sizes" is an argument.
"I like 1.250" isn't.

## The one rule

Never invent a value. If a value has no token, that's a gap in the system or a one-off that
shouldn't exist. Both need a human. Execution phases stop and report instead of guessing.

## The linter

`design-enforce` installs `scripts/design-lint.mjs`. It scans template text rather than JS
ASTs, so Svelte, Vue, Astro and JSX are all covered the same way with no plugin dependency.

| Rule | Severity |
|---|---|
| `arbitrary-value` | error |
| `raw-hex` | error |
| `off-scale-spacing` | error |
| `off-scale-text` | error |
| `raw-palette` | warn |
| `off-scale-radius` | warn |

Baseline first, ratchet down. A permanently red build gets ignored in a week.

## Docs

Full docs, every SKILL.md rendered with search: https://aicssanimations.com/skills/docs

## License

MIT
