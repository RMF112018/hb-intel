# Prompt 04 · Extract and harden draft save orchestration for truthful master-child persistence

## Objective
Replace the current controller-owned, sequential draft save path with a service-level persistence model that makes the outcome of a draft save explicit and truthful across:
- `HB Articles`
- `HB Article Team Members`
- `HB Article Media`

The goal is to remove ambiguous partial-save behavior. A user must not be told “save failed” without the system also knowing and surfacing what actually did and did not persist.

## Critical operating instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Required repo anchors
Read and use these as binding implementation anchors:
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherRepositories.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherWriters.test.ts`

Inspect any nearby status-messaging helper or save-related helper that must change to keep the UI truthful.

## Current issue in repo-truth terms
The old package identified a real problem, but the exact defect has changed.

### What is already improved
The child writers are no longer the old destructive delete-all/recreate-all model. `publisherWriters.ts` now uses keyed-sync behavior for team members and media:
- MERGE matching child rows
- POST new rows
- delete only orphans
- perform deletes only after successful writes

That improvement should be preserved.

### What is still open
`handleSave()` in `useDraftLifecycle.ts` still owns the overall save orchestration and still performs:
1. `articles.upsert(...)`
2. `teamMembers.replaceAllForArticle(...)`
3. `media.replaceAllForArticle(...)`

If a later step fails, the UI reports a save failure even though earlier persistence may already have committed.

That creates several truth problems:
- the master row may already be updated while child rows are not
- the server may now differ from the local draft state
- the controller has no explicit save outcome model beyond success/failure text
- save orchestration logic is embedded in the UI controller instead of a service seam that can be tested in isolation

## Required design task
You must move this into a clearer persistence model and make the resulting truth explicit.

Acceptable end states:
1. **Compensating / snapshot-based save**  
   Earlier writes are explicitly reconciled or restored when later writes fail.

2. **Truthful staged save**  
   Partial persistence is allowed, but the save pipeline returns a structured outcome that clearly states what persisted and what did not, and the UI reacts accordingly.

What is **not** acceptable is keeping the current ambiguous “one thrown error means everything simply failed” model when some of it may already have committed.

## Strong recommendation
Prefer a small service-layer orchestration seam under the Publisher adapter instead of leaving the sequencing in the controller.

A good solution will usually include:
- a dedicated save orchestration function/service
- a typed save outcome
- stage-aware messaging
- explicit reload/reconciliation behavior after partial persistence
- preservation of the keyed-sync child writers already in place

## Intended future state
After this prompt is complete:
- the controller no longer directly owns the full save sequence
- save returns a typed outcome that reflects actual persistence truth
- the user-facing status channel is consistent with that outcome
- the post-save reload behavior is deliberate and truthful
- the keyed-sync child writer improvements remain intact

## Implementation expectations
1. Extract the save sequence into a testable service-level seam.
2. Decide the save-consistency model before changing code.
3. Preserve the existing metadata-defaulting, slug-governance, and template-resolution behavior unless repo truth requires a tightly-coupled adjustment.
4. Preserve the child keyed-sync implementation already present in `publisherWriters.ts`.
5. Update controller messaging so it matches the real save outcome.
6. Ensure local draft state and server state are intentionally reconciled after a partial or compensated failure.
7. Keep this prompt scoped to authoring save. Do not mix publish/lifecycle redesign into it.

## Testing and validation requirements
Add or update tests that prove:

### Save orchestration
- team-member persistence failure after successful article upsert
- media persistence failure after successful article + team persistence

### Outcome truthfulness
For each failure path, prove:
- what the master row contains
- what the team rows contain
- what the media rows contain
- what typed save outcome the service returns
- what the controller/status layer surfaces to the user
- whether the draft is reloaded/reconciled after partial persistence

### Preservation proof
- keyed-sync child-writer behavior still works as before
- no regression to destructive child rewrite behavior

## Closure artifacts
Create a closure note under:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/`

The closure note must include:
- the chosen save-consistency model
- the extracted service seam and why it belongs there
- before/after save failure matrix
- changed files
- tests added/updated
- proof that user-visible save messaging now matches actual persistence truth

## Anti-drift / non-deferral rules
- Do not leave save orchestration buried in the controller if the controller still has to reason about master/team/media persistence order.
- Do not revert the keyed-sync child-writer improvement.
- Do not label this closed while a user can still receive a generic “save failed” outcome that hides a committed master-row change.
- Do not push reconciliation behavior into later work if it is required for truthful closure now.
