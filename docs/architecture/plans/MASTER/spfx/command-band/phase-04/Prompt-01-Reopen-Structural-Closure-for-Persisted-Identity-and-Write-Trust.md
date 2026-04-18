# Prompt 01 — Reopen Structural Closure for Persisted Identity and Write Trust

## Objective

Repair the live admin’s persisted-identity, reorder, save, and destructive-action model so the maintainer workflow becomes trustworthy before any further end-state closure work proceeds.

## Current issue / future-state gap

The current admin still binds item writes to persisted IDs by array position instead of stable identity. `handleSave()` maps `itemDrafts` to `resolvedItems[i]?.id`; `handleMoveItem()` only reorders local drafts; `reorderPriorityRailItems()` exists but is not used; and `handleArchiveItem()` performs an immediate archive mutation and local removal outside a coherent save/discard contract.

This means reorder/add/archive/edit sequences can drift away from the intended SharePoint rows and can produce false confidence in the admin UI.

## Intended future state

A stable authoring model exists for every action row:
- persisted SharePoint identity is explicit and survives reorder
- client-side draft identity is explicit for unsaved/new rows
- reorder semantics are deterministic and saved to the correct rows
- destructive actions are clearly modeled as either buffered changes or explicit immediate actions, with failure-safe behavior
- save/discard accurately reflects what is and is not persisted

## Repo seams / files / symbols to inspect

Inspect at minimum:

- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/PriorityActionsRailAdmin.tsx`
- `apps/hb-webparts/src/homepage/data/priorityActionsAdminState.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsListWriter.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsContracts.ts`
- `apps/hb-webparts/src/homepage/data/usePriorityActionsData.ts`
- any related admin-only helper seams you create to break down the current monolith

Pay special attention to:
- `handleSave`
- `handleMoveItem`
- `handleArchiveItem`
- `savePriorityRailItems`
- `reorderPriorityRailItems`
- the baseline/draft dirty-state model

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Governing files / doctrine / specs

- `docs/architecture/plans/MASTER/spfx/command-band/PriorityActionsRail-and-Admin-Spec.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/04-Conformance-Scoring-Matrix.md`

## Required implementation outcomes

1. Introduce a stable admin item identity model that distinguishes:
   - persisted item ID
   - stable action key
   - client-only draft row identity

2. Remove any write path that infers persisted SharePoint identity from current array position.

3. Make reorder behavior authoritative:
   - either route reorder through `reorderPriorityRailItems(...)` as the source of truth
   - or replace the current pattern with a clearly superior explicit write model
   - but do not leave the existing unused dedicated reorder seam in limbo

4. Make archive / disable behavior explicit and coherent:
   - no silent immediate destructive mutation hidden inside the general draft model
   - clear failure handling
   - clear local-state handling after failure or success

5. Ensure save/discard semantics remain truthful after add/edit/reorder/archive operations.

6. Break down the current admin monolith if needed to support a cleaner authoring state machine.

7. Add targeted regression tests for:
   - reorder existing items
   - add new item + reorder + save
   - archive existing item
   - discard after reorder/edit
   - failure handling on write operations

## Supporting development concepts to apply materially

- Do not restyle unrelated homepage surfaces.
- Do not widen this prompt into general homepage-shell work.
- Do not “fix” the issue by merely adding comments or documentation.
- Do not keep both the old index-coupled write path and a new path alive in parallel.
- Do not claim closure without regression tests covering the risky sequences.

## Proof of closure

- React stable identity for reordered collections
- explicit state-machine thinking for authoring flows
- deterministic write-command modeling
- read-after-write confirmation
- regression tests that follow real maintainer sequences instead of isolated helper assertions

## Boundaries / anti-drift rules

Return:

- the new admin item identity model
- exactly how reorder persistence now works
- exactly how archive / disable semantics now work
- the files changed
- the tests added or updated
- a short sequence proving that add/edit/reorder/archive now target the correct persisted rows
- confirmation that no remaining write path depends on current array position
