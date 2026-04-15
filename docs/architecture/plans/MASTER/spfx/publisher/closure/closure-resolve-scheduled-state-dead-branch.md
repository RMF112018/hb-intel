# Closure — Resolve scheduled-state dead branch

**Phase:** `docs/architecture/plans/MASTER/spfx/publisher/phase-09`
**Prompt:** `Prompt-05-Resolve-scheduled-state-dead-branch.md`
**Status:** Closed

## Chosen policy: Option B — explicit legacy quarantine

There is no scheduled-publish executor in the repo, and the state machine already forbids inbound transitions into `scheduled` (`workflowStateMachine.ts`). Building a real scheduler is out of scope for this prompt. Option B is therefore the correct fit: make legacy `scheduled` rows visible and safe rather than half-supported.

## Defect

`scheduled` was declared by the tenant schema (`publisherEnums.WORKFLOW_STATE_VALUES` includes it) and readable by the adapter, but the rail's `DRAFT_GROUP_ORDER` silently omitted it. That had two material consequences:

1. Operators could not see legacy `scheduled` rows in the authoring queue — they were invisible to any safeguard that scans the rail.
2. Slug governance's collision scan iterates `DRAFT_GROUP_ORDER` to collect taken slugs (see `controllers/useDraftLifecycle.ts` → `takenSlugs`), so the slug of any `scheduled` row was not considered during uniqueness resolution. A new draft could therefore collide with a scheduled row's slug.

Combined with the tenant schema's continued acceptance of `scheduled`, this was the "neither fully supported nor fully quarantined" contradiction the prompt calls out.

## Resolution

1. **Rail visibility.** Added `'scheduled'` to `DRAFT_GROUP_ORDER` in `useDraftWorkspace.ts`. The row now appears in the rail under the existing "Scheduled (legacy)" group label (already present in `authorLabels.ts`), so operators can see legacy rows and consciously move them to `approved` or `withdrawn`.
2. **Collapsed-by-default.** Added `'scheduled'` to `COLLAPSED_GROUPS_BY_DEFAULT` alongside `archived` and `withdrawn`. The group is visible but visually quarantined as residual.
3. **Slug governance.** No direct code change to `slugGovernance.ts` needed — the collision scan iterates `DRAFT_GROUP_ORDER`, so expanding that constant automatically includes scheduled slugs in the `takenSlugs` set. Documented this in the constant's jsdoc.
4. **Inbound transitions remain forbidden.** `workflowStateMachine.ts` already excludes `scheduled` from every state's `TRANSITIONS[from]` target list. No change.
5. **Editorial messaging.** `scheduledLegacyStateNotice` in `ArticlePublisher.tsx` already narrates the legacy status in the canvas when a scheduled draft is opened. No change.

## Files changed

- `apps/hb-publisher/src/webparts/articlePublisher/workspace/useDraftWorkspace.ts`
  - Added `'scheduled'` to `DRAFT_GROUP_ORDER` and `COLLAPSED_GROUPS_BY_DEFAULT`.
  - Updated the jsdoc to document the Option B policy and the slug-governance interaction.
- `apps/hb-publisher/src/webparts/articlePublisher/workspace/useDraftWorkspace.test.ts` *(new)*
  - Pins the invariants: `DRAFT_GROUP_ORDER` includes `'scheduled'`, includes every other operational state, and `COLLAPSED_GROUPS_BY_DEFAULT` has `'scheduled'`.
- `apps/hb-publisher/config/package-solution.json` — version bump `1.0.0.5 → 1.0.0.6`.

## Validation

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher test` — 496 passed (+3 new), 6 pre-existing `publisherEndToEnd.test.ts` failures unchanged (unrelated).

Proof points for the prompt's requirements:

1. Scheduled rows are no longer silently excluded — `DRAFT_GROUP_ORDER` test case asserts membership.
2. Operators can consciously handle legacy rows — rail now renders a collapsed "Scheduled (legacy)" group with the existing label copy; the canvas already surfaces `scheduledLegacyStateNotice` when a scheduled draft is opened.
3. Slug governance includes scheduled rows — the `takenSlugs` loop in `useDraftLifecycle` iterates `DRAFT_GROUP_ORDER`, which now contains `scheduled`.
4. Policy documented in code — the `DRAFT_GROUP_ORDER` jsdoc spells out Option B, the absence of an executor, and the inbound-transition prohibition, with a pointer to `workflowStateMachine.ts`.

## Scope held tight

- No change to `workflowStateMachine.ts` (inbound transitions remain forbidden).
- No change to `WORKFLOW_STATE_OPERATIONAL_VALUES` (scheduled is still not an operational transition target).
- No change to the orchestrator, repositories, or slug-generation pure functions.
- Prior closures (Prompts 01–04) untouched.

## Remaining assumptions

- The existing "Scheduled (legacy)" group label in `authorLabels.ts` remains the operator-facing copy. If that wording ever becomes misleading (e.g. if a real scheduler ships), the closure for that work should restyle the label and re-evaluate whether `COLLAPSED_GROUPS_BY_DEFAULT` should still include `scheduled`.
