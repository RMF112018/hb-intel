# Prompt 01 — Repair Authoring Identity, Lifecycle, and Reorder Seams

## Objective

Refactor the Priority Actions admin authoring model so add, edit, reorder, archive, save, and discard operations are truthful and deterministic.

The current implementation is not trustworthy enough because it still binds persisted item IDs to draft array position during save. That makes reorder and mixed-edit scenarios unsafe.

This prompt closes the correctness layer first.

---

## First instruction

**Do not re-read files that are still within your current context window or memory.** Re-read only when needed to verify drift, resolve uncertainty, or inspect files not already in active context.

---

## Repo seams to inspect

Primary seams:
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/PriorityActionsRailAdmin.tsx`
- `apps/hb-webparts/src/homepage/data/priorityActionsAdminState.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsContracts.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsListWriter.ts`

Inspect as needed:
- adjacent tests for admin state, list writers, or authoring flows
- any helper modules used by the admin webpart to derive or refresh state

---

## Governing references

Use repo truth plus the following authorities already in the repo:
- `docs/architecture/plans/MASTER/spfx/command-band/phase-02/Closure-Checklist.md`
- `docs/architecture/plans/MASTER/spfx/command-band/phase-02/Closure-Scorecard.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md`
- `docs/architecture/plans/MASTER/spfx/homepage/phase-15/HB-Central-Homepage-Perception-Targets.md`

---

## Current repo-truth problem

The admin currently:
- loads persisted items and derives item drafts
- reorders by swapping draft-array positions locally
- saves by pairing `itemDrafts[i]` with `resolvedItems[i]?.id`
- archives immediately instead of modeling archive intent coherently

This means persisted identity still depends on position.
That is not acceptable for a maintainer-facing product.

The dedicated reorder write seam already exists.
The admin runtime is simply not using a coherent lifecycle model around it.

---

## Required end state

Implement a durable authoring model that explicitly distinguishes:

1. **persisted identity**
   - persisted SharePoint item ID
   - original persisted `actionKey`
   - original persisted `sortOrder`

2. **draft identity**
   - stable local row key for React/rendering
   - survives reorder and unsaved edits without conflating rows

3. **lifecycle state**
   - persisted unchanged
   - persisted edited
   - newly created
   - marked-for-archive
   - pending reorder
   - save-error / conflict states if needed

4. **operation plan**
   - create operations
   - update operations
   - archive operations
   - reorder operations

The code must compute these operations from explicit draft metadata, not from positional coincidence.

---

## Required tasks

### 1. Introduce a real admin row wrapper
Create or refactor the admin row model so each draft row carries:
- persisted item ID when present
- stable local row identity
- lifecycle / pending-operation state
- current draft payload

Do not leave raw `PriorityActionsItemDraft[]` as the only working admin model if that means identity is still implicit.

### 2. Remove positional identity from save
Replace the current index-based save logic with operation planning based on the row wrapper.

The save flow must:
- update persisted rows by persisted ID
- create new rows with no persisted ID
- archive rows using explicit archive intent
- persist reorder using the dedicated reorder seam when the ordered persisted rows changed

### 3. Choose and implement one coherent archive model
Do not leave archive as “sort of draft-like but also immediately destructive.”

Choose one system and finish it fully:
- either archive is part of the save/discard workflow
- or archive is an isolated destructive action with explicit confirmation, isolated refresh, and no ambiguity about discard semantics

Whichever model you choose, implement it cleanly and remove ambiguity.

### 4. Make discard truthful
Discard must restore the last saved server-backed state plus any required ordering guarantees.
It must not leave behind phantom local reorder or archive side effects.

### 5. Preserve read-after-write truth
After a successful save, the UI must reconcile against fresh repo/server truth.
Do not leave stale local assumptions as the post-save source of truth.

### 6. Add focused tests
Add or update tests that prove:
- reorder does not corrupt persisted identity
- add + reorder + save updates the correct rows
- archive behavior follows the chosen lifecycle model
- discard restores truth after mixed edits
- no save path still depends on array index as persisted identity

---

## Hard constraints

- do not broaden into unrelated homepage work
- do not redesign the full admin IA yet
- do not introduce drag-and-drop unless it is necessary; keyboard-safe reorder is the required baseline
- do not bypass the existing writer seams without a compelling repo-truth reason
- do not silently weaken read-after-write confirmation

---

## Proof of closure

Return evidence showing:

1. the new admin row/lifecycle model
2. how operation planning is derived from that model
3. how reorder is now persisted truthfully
4. how archive now behaves coherently
5. tests proving that persisted identity no longer depends on array position
6. exact files changed
7. confirmation that unrelated webparts were not modified
