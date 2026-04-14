# Prompt-04 Closure: Close Stranded Scheduled Workflow Branch

## Chosen path
Option B (scope out): `scheduled` remains legacy read-compatible only and is not an operational workflow target until a real scheduled-publish executor exists.

## Why this is internally consistent
- Workflow compatibility values still include `scheduled` so tenant rows and history parsing remain schema-accurate.
- Operational workflow values exclude `scheduled`, so operator-facing filters/actions do not present it as a normal live path.
- State machine keeps inbound `scheduled` transitions forbidden while allowing legacy scheduled rows to exit (`approved` / `withdrawn`).
- Orchestrator manual transition path is guarded by `canTransition`, so there is no hidden runtime path that can move an article into `scheduled`.

## Changed surfaces
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
  - Added explicit helper seams for workflow filter options and legacy scheduled notice rendering.
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.test.tsx`
  - Added tests proving `scheduled` is absent from operator-facing filter options and legacy notice is shown only for scheduled rows.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.test.ts`
  - Added manual-transition guard test proving attempts to transition into `scheduled` fail before article/history writes.

## Existing aligned authorities (unchanged behavior)
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.ts`
  - keeps inbound `scheduled` forbidden and legacy exits allowed.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts`
  - keeps compatibility tuple including `scheduled` and operational tuple excluding it.

## Proof mapping
1. No inbound transition into `scheduled`:
   - `workflowStateMachine.test.ts` inbound-forbidden suite.
2. UI does not present scheduled as operational branch:
   - `ArticlePublisher.test.tsx` scheduled workflow posture suite.
3. Orchestrator has no hidden schedule path:
   - `publishOrchestrator.test.ts` manual transition into `scheduled` failure test.
4. Legacy compatibility remains intact:
   - `publisherWorkflowHistory.test.ts` + workflow enum/state-machine compatibility assertions.
