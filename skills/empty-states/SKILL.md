---
name: empty-states
description: "Finds lists, tables, search results and dashboards that render nothing or a bare string when they have no data, classifies each by cause, and builds a zero state with an explanation and one action. Use as a phase 5 pass of design-system, or when an app looks broken before it has data."
---

# Empty States

Find rendering paths that produce nothing when data is absent, and build a zero state for each.

## Step 1: Find them

```bash
# iteration over data
grep -rn -E '\{#each|\.map\(|v-for=' src --include="*.svelte" --include="*.tsx" --include="*.vue" | head -40

# bare-string handling
grep -rn -iE '"(no |empty|nothing |none )' src --include="*.svelte" --include="*.tsx" | head -30

# length checks
grep -rn -E '\.length\s*===?\s*0|\.length\s*<\s*1|!\w+\.length' src --include="*.svelte" --include="*.tsx" | head -30
```

Sort findings into three severities:

1. **No handling.** Renders an empty container. The user cannot distinguish this from a failed request.
2. **Bare string.** `<p>No items</p>`. Renders text but no explanation or action.
3. **Complete.** Has a visual, an explanation and an action. Leave these.

Order the work by how many users reach each one. The list a new account sees on first login comes before a filtered admin view.

## Step 2: Classify by cause

The cause determines the content. Using the wrong type produces copy that contradicts the user's situation.

| Type | Cause | Content |
|---|---|---|
| First use | New account, nothing created | What the feature does, plus the action that creates the first item |
| Cleared | User completed or deleted everything | Acknowledge completion. No feature explanation |
| No results | Filter or search matched nothing | Echo the query, offer to clear it |
| Error or permission | Request failed, or access denied | What happened, and the recovery step |

A first-use state shown after a user clears their list reads as the product not tracking what they did.

## Step 3: Build

Four elements, in this order:

1. **Visual.** An icon at 32-48px in `text-muted-foreground`, from the project's icon library.
2. **Headline.** What is absent, stated positively. "No projects yet" rather than "Empty".
3. **Explanation.** One line on what this feature does. Omit for cleared states.
4. **Action.** One button, performing the step that resolves the state. For no-results that is clearing the filter, not creating a record.

Constraints:

- Use existing components. Same button, same type tokens, same spacing scale.
- Center vertically, constrain text to `max-w-sm`.
- One action only.
- Phrase failures as facts, not user error. "No results for 'xyz'", not "You didn't find anything".
- Render a skeleton during loading and the empty state only after data returns empty. Rendering the empty state while a request is in flight tells the user something false.

## Step 4: Extract when repeated

At three or more instances, extract a shared `<EmptyState>` component taking icon, title, description and action as props. Below three, keep them inline.

## Report

Per state: file, type, and what rendered before. List the components used and confirm none are new. Flag any state where the copy needs the product's voice rather than a placeholder.
