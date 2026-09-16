# shadcn Alignment

shadcn components are copied into the repo and maintained there. They diverge from the registry and from each other as they are edited. A value inside `ui/` propagates to every usage of that component.

Run this only when `components.json` exists.

## 1. Reconcile components.json

```bash
cat components.json
```

Check each field against the project:

| Field | Must be |
|---|---|
| `tailwind.config` | the real config path, or empty string on v4 |
| `tailwind.css` | the file the ratified tokens were written to |
| `tailwind.baseColor` | the neutral ramp the tokens use |
| `tailwind.cssVariables` | `true` |
| `aliases.*` | paths that resolve |
| `rsc` / `tsx` | matching the framework |

Fix `cssVariables` first if it is `false`. With it false, every component added afterward is generated with literal palette classes rather than CSS variables, which bypasses the token system entirely.

## 2. Audit installed components

```bash
ls src/lib/components/ui 2>/dev/null || ls components/ui 2>/dev/null
```

Three checks.

**Raw values.** Registry components should reference roles only.

```bash
npm run design-lint -- --json | python3 -c "import json,sys; d=json.load(sys.stdin); [print(f['file'], f['line'], f['msg']) for f in d['findings'] if '/ui/' in f['file']]"
```

**Local edits.** Diff each component against a fresh copy from the registry:

```bash
npx shadcn@latest add button --path /tmp/shadcn-ref --yes 2>/dev/null
diff -u /tmp/shadcn-ref/button.tsx src/lib/components/ui/button/button.svelte 2>/dev/null
```

Classify each difference as either a deliberate project variant, which goes in `DESIGN.md`, or an undocumented edit, which reverts to the token.

**Variants.** Read the `cva` or `tv` definition in each component. Every variant should correspond to a decision recorded in `design-grill` phase 4. An undocumented size variant is an additional spacing value.

## 3. Replace duplicated components

Find hand-written components that duplicate an installed registry component:

```bash
grep -rln "class=.*rounded.*px-.*py-" src --include="*.svelte" --include="*.tsx" \
  | grep -v "/ui/" | head -20
```

Replace these with the registry component rather than converting their values to tokens.

## 4. Raise severity inside ui/

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

Treat findings inside `ui/` as errors even where the same rule is a warning elsewhere.

## Report

Fields corrected in `components.json`, components audited, raw values found in `ui/`, local edits split into deliberate and undocumented, undocumented variants, and duplicated components replaced. List which edits you reverted and which you recorded.
