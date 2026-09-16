# The Design Tree

The order of decisions is fixed and the same for every project. Traverse it, do not derive it.

An edge is a hard prerequisite: the child cannot be answered until the parent is settled. The frontier is every unsettled node whose parents are settled. Ask the whole frontier in one round.

```
                        +-------------+
                        |   PRODUCT   |  R1
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
                    | COMPONENT SHAPE |  R4
                    | density,variants|
                    +--------+--------+
                             v
                    +-----------------+
                    |    PATTERNS     |  R5
                    | empty, loading, |
                    | error, elevation|
                    +-----------------+
```

## Nodes

### R1. Product character
**Decides**: which adjective the system serves. One of: dense/productive, calm/editorial, playful/consumer, premium/restrained.
**Unblocks**: density, motion duration and radius defaults all derive from it.
**Default**: infer from the codebase and present the inference for confirmation. Tables and dense data views indicate productive. Large imagery and long prose indicate editorial.
**Note**: this is the only node that cannot be answered from the code.

### R2. Spacing base
**Decides**: 4px or 8px grid.
**Default**: 4px. It absorbs more existing values and still permits an 8px rhythm. Recommend 8px only when the extraction shows the codebase already clusters on multiples of 8.

### R2. Type ratio
**Decides**: the multiplier between adjacent steps. 1.125, 1.200, 1.250 or 1.333.
**Default**: 1.200 for dense interfaces, 1.250 for marketing pages. Quote the absorption number from `drift.json`.

### R2. Color space
**Decides**: HSL or OKLCH for token definitions.
**Default**: OKLCH on Tailwind v4. HSL on v3, and always when `components.json` exists, to match shadcn's `hsl(var(--x))` format.

### R2. Radius base
**Decides**: one base value. `sm` and `lg` derive from it with a 2px offset.
**Default**: the value the extraction working set already centers on.

### R2. Motion curve
**Decides**: the easing pair for entering and exiting.
**Default**: `ease-out` entering, `ease-in` exiting.

### R3. Spacing steps
**Decides**: which multiples of the base are legal. Requires the base.
**Default**: 6 to 8 steps.

### R3. Type sizes and leading
**Decides**: how many steps, and the line-height rule. Requires the ratio.
**Default**: 6 sizes. Line-height inverse to size: tighter as size increases.

### R3. Semantic roles
**Decides**: what `primary`, `muted`, `accent` and `destructive` mean in this product. Requires the color space.
**Default**: when `components.json` exists, adopt shadcn's role names unchanged.
**Note**: this node determines whether color is maintainable. A raw palette class appears in every file that uses it; a role is changed in one place.

### R3. Duration scale
**Decides**: two or three durations mapped to interaction classes. Requires the motion curve.
**Default**: 150ms for hover and press, 250ms for dropdowns and tooltips, 400ms for modals and route changes.

### R4. Component shape
**Decides**: control heights, density, and which variants exist. Requires all R2 and R3 nodes.
**Default**: derive control heights from the spacing steps. Do not introduce a second scale.

### R5. Patterns
**Decides**: empty, loading and error treatment, and what elevation encodes. Requires component shape.
**Default**: elevation encodes distance from the page surface. Three levels.

## Traversal rules

1. Do not ask a node whose parent is unsettled.
2. Recompute descendants after each answer. An answer can remove options from a later round.
3. When `drift.json` shows one value at 90% or more on an axis, treat that node as settled and present it for confirmation rather than asking.
4. The phase ends when the frontier is empty, not when enough is known to proceed.
