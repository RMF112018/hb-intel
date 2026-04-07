# Prompt 03 — Live Shelf Binding, Ordering, and Suppression

## Objective

Bind the **workflow shelf layer to live normalized launcher data** and prove shelf ordering, card ordering, audience filtering, and clean suppression behavior.

## Required stance

- repo truth first
- do not re-read files still in current context unless needed
- preserve the Phase 01 adapter and normalized launcher seam
- do not bypass the normalized model for quick field access
- do not broaden into all-platform overlay, advanced search, or personalization
- maintain authoring-safe behavior for empty / partial / stale launcher data

## Existing implementation context

Review at minimum:

- outputs of Prompts 01–02
- outputs of Phases 01–04
- the normalized launcher model and utility / flagship composition seams already in place
- the current reference composition and relevant launcher files

## Required work

Implement live shelf rendering from normalized launcher data and prove:

- shelf grouping from workflow/category metadata
- shelf ordering from configured sort data
- card ordering inside each shelf
- audience filtering compatibility
- shelf suppression when no items survive filtering
- clean handling when some records are incomplete but still renderable

Avoid any implementation that requires manual per-shelf hardcoding for the steady-state launcher.

## Required output

Produce a markdown file named:

- `phase-05-live-shelf-binding-proof.md`

The file must include:

### 1. Binding path
How live normalized data reaches the shelf layer.

### 2. Ordering proof
How shelf and card order are resolved.

### 3. Suppression proof
How empty or filtered shelves disappear cleanly.

### 4. Partial-data proof
How incomplete rows degrade without breaking layout.

### 5. Remaining debt
What later phases still need to solve.
