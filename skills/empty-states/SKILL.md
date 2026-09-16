---
name: empty-states
description: "Find functionality that has no empty state and build one. Locates lists, tables, search results, dashboards, and feeds that render nothing or a bare string when they have no data, then adds a proper zero state with explanation and a next action. Use when an app feels unfinished or broken when new."
---

# Empty States

The most-seen, least-designed screen in any product. Every user hits the empty state first, before the feature has ever worked for them, and it's almost always blank or the words "No results".

A blank screen is indistinguishable from a bug. The user can't tell whether the feature is empty or broken. That's the whole problem.

## Step 1: Find the gaps

Look for rendering paths that produce nothing when data is absent.

```bash
# .map over data with no length check nearby
grep -rn -E '\{#each|\.map\(|v-for=' src --include="*.svelte" --include="*.tsx" --include="*.vue" | head -40

# bare-string handling, these are gaps not empty states
grep -rn -iE '"(no |empty|nothing |none )' src --include="*.svelte" --include="*.tsx" | head -30

# length checks that render null or a fragment
grep -rn -E '\.length\s*===?\s*0|\.length\s*<\s*1|!\w+\.length' src --include="*.svelte" --include="*.tsx" | head -30
```

Three findings, worst first:

1. **No handling at all.** Renders a blank container. Reads as broken.
2. **Bare string.** `<p>No items</p>`. That's a label, not an empty state.
3. **Real empty state.** Icon, explanation, action. Leave these alone.

Prioritize by how likely a user is to hit it. The primary object's list, the one every new account sees on day one, matters more than a filtered admin view.

## Step 2: Classify, because the type decides the content

Four kinds. Writing the wrong one is worse than writing nothing.

| Type | Cause | Needs |
|---|---|---|
| **First use** | New user, nothing created yet | Explain the value, primary action |
| **Cleared** | User finished or deleted everything | Acknowledge it. Don't sell the feature again |
| **No results** | Filter or search matched nothing | Echo the query, offer a way to clear it |
| **Error / permission** | Failed or not allowed | Say what happened, how to recover |

The common mistake is showing a first-use state to someone who just cleared their inbox. "Create your first task!" after finishing everything reads like a system that isn't paying attention.

## Step 3: Build it

Four elements, in this order. Nothing else.

1. **Visual.** Icon at 32-48px in `text-muted-foreground`. Use the project's icon library. Don't commission an illustration for this pass.
2. **Headline.** What's here, not that it's empty. "No projects yet" beats "Empty".
3. **One line of explanation.** What this does and why it's worth using. Skip it for cleared states.
4. **One primary action.** The exact thing that resolves the emptiness. For no-results that's "Clear filters", not "Create".

Constraints:

- **Build from existing components.** Same Button, same type tokens, same spacing scale. An empty state that introduces new patterns has made the system worse.
- **Vertically centred, capped around `max-w-sm`.** Centred text at full width is unreadable.
- **One action.** Two competing buttons means neither gets pressed.
- **Never blame the user.** "No results for 'xyz'", not "You didn't find anything".
- **Don't confuse empty with loading.** Skeleton during fetch. Empty state only once data has come back and is actually empty. "No projects yet" while a request is in flight is a lie the user will act on.

## Step 4: Extract if it repeats

Three or more empty states means a shared `<EmptyState>` component with icon, title, description, and action as props. Below three, inline is fine. Extracting early costs more than it saves.

## Report

Per state: file, type, what was there before. Confirm which components you used and confirm none of them are new. Flag anything that needs real copy from the user. You can write a competent placeholder, but the product's voice is theirs.
