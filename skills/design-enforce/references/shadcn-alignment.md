# shadcn Alignment

shadcn isn't a dependency. Components get copied into the repo and owned there. That's the point of it, and it's also why it drifts in a way a versioned library can't. Every component is local, editable, and quietly divergent from both the registry and from each other.

Only run this when `components.json` exists.

## 1. Reconcile `components.json`

It's the contract between the CLI and the codebase. When it disagrees with reality, every `npx shadcn add` after this reintroduces the drift you just cleaned up.

```bash
cat components.json
```

Check each field against what the project actually does:

| Field | Must match |
|---|---|
| `tailwind.config` | the real config path (empty string on v4) |
| `tailwind.css` | the file the ratified tokens went into |
| `tailwind.baseColor` | the neutral ramp the tokens actually use |
| `tailwind.cssVariables` | **`true`**. `false` bakes literal palette classes into every new component and kills semantic roles outright |
| `aliases.*` | real, resolvable paths |
| `rsc` / `tsx` | the framework in use |

`cssVariables: false` is the highest-value fix here. Everything else is hygiene. That one decides whether new components are token-based at all.

## 2. Audit installed components

```bash
ls src/lib/components/ui 2>/dev/null || ls components/ui 2>/dev/null
```

Three checks per component.

**Raw values.** Registry components should reference semantic roles only. A `bg-neutral-900` or a hex inside `ui/` is drift at the substrate, and it spreads to every usage.

```bash
npm run design-lint -- --json | python3 -c "import json,sys; d=json.load(sys.stdin); [print(f['file'], f['line'], f['msg']) for f in d['findings'] if '/ui/' in f['file']]"
```

**Local edits vs. the registry.** Components get patched in place and everyone forgets. Diff against a fresh pull into a scratch directory:

```bash
npx shadcn@latest add button --path /tmp/shadcn-ref --yes 2>/dev/null
diff -u /tmp/shadcn-ref/button.tsx src/lib/components/ui/button/button.svelte 2>/dev/null
```

Sort each difference into intentional (a deliberate project variant, record it in `DESIGN.md`) or incidental (someone nudged a padding under deadline, revert it to the token).

**Variant coverage.** Read the `cva` or `tv` definition in each component. Every variant should map to something decided in `design-grill` phase 4. A `size="xs"` nobody chose is a fifth spacing value wearing a component's clothes.

## 3. Find shadowed components

Common failure: a hand-rolled `<Button>` sitting next to the registry one because someone didn't know it was there.

```bash
grep -rln "class=.*rounded.*px-.*py-" src --include="*.svelte" --include="*.tsx" \
  | grep -v "/ui/" | head -20
```

Anything that reimplements a component you already own gets replaced, not tokenized. Tokenizing a duplicate keeps the duplicate.

## 4. Extend the linter

Add to `.design/lint.config.json`:

```json
{
  "shadcn": {
    "uiPath": "src/lib/components/ui",
    "requireCssVariables": true,
    "allowedVariants": { "button": ["default", "secondary", "ghost", "destructive", "outline", "link"] }
  }
}
```

Treat violations inside `ui/` as errors even where the same rule is a warning elsewhere. A raw palette class in a page is one screen. In `ui/button` it's every button in the product.

## Report

Fields corrected in `components.json`, components audited, raw values found in `ui/`, intentional vs. incidental local edits, unchosen variants, shadowed components. Say which edits you reverted and which you recorded as deliberate. That call is the user's, not yours.
