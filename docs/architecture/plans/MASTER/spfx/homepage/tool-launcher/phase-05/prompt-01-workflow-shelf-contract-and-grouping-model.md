# Prompt 01 — Workflow Shelf Contract and Grouping Model

## Objective

Lock the **workflow-shelf contract and grouping model** for Tool Launcher / Work Hub so secondary platform rendering is driven by normalized launcher metadata rather than by the legacy grouped-tile model.

## Required stance

- repo truth first
- do not re-read files still in current context unless needed
- preserve the Phase 01 normalized launcher seam
- do not bypass the normalized model by reading raw SharePoint fields directly in the rendering layer
- do not broaden into overlay, deep search, or favorites persistence
- do not regress to generic grouped-link buckets

## Existing implementation context

Review at minimum:

- outputs of Phases 01–04
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`
- `apps/hb-webparts/src/homepage/helpers/`
- `apps/hb-webparts/src/homepage/webparts/`
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- the architecture / layout brief for Tool Launcher / Work Hub

## Required work

Define and implement the launcher-side contract needed for workflow shelves.

That contract should support, at minimum:

- shelf identity
- shelf title
- shelf sort order
- secondary card ordering inside each shelf
- audience filtering compatibility
- optional category / descriptor metadata
- suppression when a shelf resolves to no visible cards

Use the normalized Phase 01 launcher model as the source of truth.

If the current normalized model does not yet provide the right shelf-level derivations, add the required derivation or shaping layer in the homepage / launcher local code.

Do **not** push tenant-specific shelf semantics into shared kit.

## Required output

Produce a markdown file named:

- `phase-05-workflow-shelf-contract.md`

The file must include:

### 1. Shelf contract
The final contract shape used by the launcher rendering layer.

### 2. Grouping rules
How normalized launcher records are converted into workflow shelves.

### 3. Ordering rules
How shelf order and item order are resolved.

### 4. Suppression rules
How empty shelves and invalid rows are handled.

### 5. Risks avoided
How this contract avoids reintroducing grouped-tile thinking.
