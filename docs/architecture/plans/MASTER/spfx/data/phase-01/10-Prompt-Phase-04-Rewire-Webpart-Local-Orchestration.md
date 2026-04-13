# 10 — Prompt — Phase 4 — Rewire Webpart-Local Orchestration

## Objective
Update the HB Kudos public and companion runtimes so they consume the formal Kudos adapter boundary cleanly, without direct dependency on low-level transport mechanics.

## Repo authority
Use the live `main` branch of:
- `https://github.com/RMF112018/hb-intel.git`

## Required instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Scope
Rewire only the local orchestration layer.

## File focus
Public runtime:
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/hooks/usePublicKudosData.ts`
- `apps/hb-webparts/src/webparts/hbKudos/hooks/useCelebrateAction.ts`
- `apps/hb-webparts/src/webparts/hbKudos/hooks/useCurrentUserId.ts`
- `apps/hb-webparts/src/webparts/hbKudos/hooks/useRecipientPhotoHydration.ts`

Companion runtime:
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/runtime/useCompanionActions.ts`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/runtime/useCompanionQueue.ts`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/runtime/useCompanionRole.ts`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/runtime/useBulkApproval.ts`

## Hard rules
- Keep queue/filter/dialog UX logic local.
- Keep public featured/recent/archive behavior local.
- Keep recipient photo hydration local.
- Do not push persona/state logic downward into platform or domain layers.
- Preserve behavior unless an intentional bug fix is required and documented.

## Required scrubbing
Remove any direct import from local webpart hooks/components to deprecated low-level mechanics that should now be hidden behind the adapter layer.

## Required validation
- public runtime tests pass
- companion runtime tests pass
- no loss of workflow behavior
- no loss of archive/public visibility behavior
- no loss of bulk approval or action-dialog behavior
