# Prompt 01 — Project Spotlight Repo-Truth Audit and Doctrine Gate

## Objective

Before changing implementation, audit the live repo to establish the authoritative starting point for the Project Spotlight webpart and identify exactly how the UI doctrine governs this surface.

This prompt is a required entry gate for all later prompts.

---

## Primary repo

- `https://github.com/RMF112018/hb-intel`

Repo truth is authoritative.

---

## Hard gate

You must inspect and apply the governing UI doctrine before making any UI changes.

At minimum read:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/entry-points.md`
- `docs/architecture/blueprint/current-state-map.md`
- `apps/hb-webparts/**` files relevant to Project Spotlight

If the repo contains newer or more specific homepage doctrine files, use them too.

Do not re-read files that are still in your current context or memory unless a file changed, the context became stale, or the task scope expanded.

---

## Audit scope

Inspect repo truth for:

- Project Spotlight implementation path(s)
- homepage shared helpers and tokens
- `@hbc/ui-kit/homepage` usage and allowed entry points
- current property-pane / manifest / content assumptions
- data normalization path for Project Spotlight
- current media handling path
- current responsive layout decisions
- current header / CTA ownership
- existing SharePoint data-access patterns in the homepage product, if any

---

## Required questions to answer

1. What files currently define the Project Spotlight runtime surface?
2. Where is the current hardcoded content path rooted?
3. Which helpers / contracts / local shared seams already exist and should be retained?
4. Which current choices conflict with the homepage doctrine or the target architecture?
5. What is the cleanest insertion point for a SharePoint list-backed data source?
6. Which polish improvements can remain webpart-local and which, if any, should move into `@hbc/ui-kit/homepage`?

---

## Required output

Produce a concise implementation note with these sections:

### 1. Repo-truth starting point
- key files
- current content path
- current layout model
- current supporting helpers

### 2. Doctrine constraints
- binding rules that directly affect this webpart
- allowed patterns
- prohibited patterns
- required entry-point/import boundaries

### 3. Change map
- what should remain
- what must change
- what must not be touched

### 4. Execution recommendation
- the smallest correct sequencing for the remaining prompts

---

## Important constraints

- Do not implement major code changes in this prompt unless a tiny preparatory fix is unavoidable.
- This is an audit / planning / doctrine-lock prompt.
- Be direct. Be file-specific. Avoid generic commentary.
