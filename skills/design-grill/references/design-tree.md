# The Design Tree

This tree is known in advance. It's the same for every project. Traverse it, don't discover it.

An edge means hard prerequisite: the child is unanswerable until the parent is settled. The frontier is every unsettled node whose parents are settled. Ask the whole frontier in one round.

```
                        +-------------+
                        |   PRODUCT   |  R1, no prerequisites
                        |  CHARACTER  |
                        +------+------+
          +------------+-------+--------+------------+
          v            v       v        v            v
      +-------+  +---------+ +------+ +------+  +--------+
      |SPACING|  |TYPE     | |COLOR | |RADIUS|  | MOTION |   R2
      | base  |  | ratio   | | space| | base |  | curve  |
      +---+---+  +----+----+ +--+---+ +--+---+  +---+----+
          |           |         |        |          |
          v           v         v        |          v
      +-------+  +---------+ +--------+  |     +--------+
      | scale |  | sizes + | |semantic|  |     |duration|   R3
      | steps |  | leading | |  roles |  |     | scale  |
      +---+---+  +----+----+ +---+----+  |     +---+----+
          +-----------+----------+-------+---------+
                             v
                    +-----------------+
                    | COMPONENT SHAPE |  R4, needs all foundations
                    | density,variants|
                    +--------+--------+
                             v
                    +-----------------+
                    |    PATTERNS     |  R5
                    | empty, loading, |
                    | error, elevation|
                    +-----------------+
```

## Node reference

What each node decides, what it unblocks, and the default you recommend unless extraction says otherwise.

### R1. Product character
**Decides**: the adjective the system serves. Dense/productive, calm/editorial, playful/consumer, premium/restrained.
**Unblocks**: everything. Density, motion duration, and radius all key off it.
**Default**: infer it from the codebase and say what you inferred. Tables and dashboards mean dense. Hero images mean editorial. Confirm, don't ask blind.
**Why first**: it's the only node the repo can't answer for you.

### R2. Spacing base
**Decides**: 4px or 8px grid.
**Default**: 4px. Absorbs more existing values and still allows an 8px rhythm. Recommend 8px only for genuinely spacious editorial work.

### R2. Type ratio
**Decides**: the multiplier between steps. 1.125, 1.200, 1.250, or 1.333.
**Default**: 1.200 for dense UI, 1.250 for marketing. Quote the absorption number.

### R2. Color space
**Decides**: HSL or OKLCH for token definitions.
**Default**: OKLCH on Tailwind v4. It's perceptually uniform and derives dark mode better. HSL on v3 to match shadcn's existing `hsl(var(--x))` convention. Switching mid-project is churn with no payoff the user can see.

### R2. Radius base
**Decides**: one base value. The rest derive (`sm = base - 2`, `lg = base + 2`).
**Default**: whatever the extraction working set already centres on. Usually a free win.

### R2. Motion curve
**Decides**: the house easing pair, enter and exit.
**Default**: `ease-out` in, `ease-in` out. Near universal, and correct. Things arrive decelerating and leave accelerating.

### R3. Spacing steps
**Decides**: which multiples of the base are legal. Needs the base first.
**Default**: 6 to 8 steps. More than 8 and nobody holds it in their head. Fewer and people reach for arbitrary values.

### R3. Type sizes and leading
**Decides**: how many steps, and the line-height rule. Needs the ratio first.
**Default**: 6 sizes. Leading inverse to size, tight for display and loose for body. That one rule kills most "looks amateur" complaints.

### R3. Semantic roles
**Decides**: what `primary`, `muted`, `accent`, `destructive` actually mean. Needs the color space first.
**Default**: if shadcn is present, use its role vocabulary. It's already the substrate and renaming costs you nothing but time.
**Highest-value node in the tree.** Raw `neutral-700` scattered through a codebase is unfixable. `text-muted-foreground` is one edit.

### R3. Duration scale
**Decides**: 2 or 3 durations mapped to interaction classes. Needs the motion curve first.
**Default**: 150ms micro (hover, press), 250ms standard (dropdown, tooltip), 400ms large (modal, route). Three is enough.

### R4. Component shape
**Decides**: control heights, density, which shadcn variants exist. Needs all R2 and R3 foundations.
**Default**: derive heights from spacing steps. Don't invent a second scale for components.

### R5. Patterns
**Decides**: empty, loading, and error treatment. Elevation meaning. Needs component shape first.
**Default**: elevation means distance from the page, not decoration. Three levels max.

## Traversal rules

1. **Never ask a node whose parent is unsettled.** If the R2 answer reshapes R3 options, R3 waits. That's the point of the frontier.
2. **Answers reshape descendants.** An 8px base removes odd steps from R3 spacing. Recompute before rendering the next round.
3. **Extraction can pre-settle a node.** If the codebase uses one radius 94% of the time, it's decided. Present it as confirmation, not a question. Pre-settle as many as you can.
4. **Done when the frontier is empty.** Not when you have enough to proceed.
