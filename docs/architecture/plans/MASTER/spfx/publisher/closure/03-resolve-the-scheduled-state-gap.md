# Closure — Resolve the Scheduled-State Gap (Phase-06 Prompt-03)

## Objective closed
Closed the workflow mismatch by adopting **Option B**: `scheduled` is schema-present for compatibility, but not a live operational target because no scheduled-publish executor exists.

## Chosen posture
- `scheduled` remains in tenant-aligned workflow enums for read/mapping compatibility.
- Inbound transitions into `scheduled` remain forbidden in the state machine.
- Legacy rows already in `scheduled` remain recoverable via `approved` or `withdrawn`.
- Live authoring UI uses an explicit operational workflow-state list that excludes `scheduled`.

## Files changed
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts`
  - Added `WORKFLOW_STATE_OPERATIONAL_VALUES` (excludes `scheduled`) for live UI flows.
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
  - Filter dropdown now uses `WORKFLOW_STATE_OPERATIONAL_VALUES`.
  - Added legacy-state notice when an article is loaded in `scheduled`, with remediation guidance.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.test.ts`
  - Added assertion that operational states exclude `scheduled` while schema states retain it.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWorkflowHistory.test.ts`
  - Added explicit assertion that `scheduled` remains in tenant schema-compatible workflow values.

## Before / after
Before:
1. State machine blocked inbound `scheduled`, but UI/state docs could still imply `scheduled` was part of normal live operations.
2. No operational-vs-schema distinction existed in enum surface.

After:
1. State machine and UI posture are aligned: `scheduled` is not exposed as a live operational target.
2. Enum surface clearly separates tenant schema compatibility from operational UI flow.
3. Legacy `scheduled` rows are still readable and can be exited safely.

## Proof mapping
1. State machine / UI / docs agree:
   - state machine tests + operational enum test + UI filter now excludes `scheduled`.
2. No dead-end scheduled branch in live flow:
   - inbound to `scheduled` remains forbidden; filter and transition affordances do not present `scheduled` as a target.
3. Read compatibility retained:
   - tenant workflow schema tuple still includes `scheduled`; workflow-history contract test asserts it.
