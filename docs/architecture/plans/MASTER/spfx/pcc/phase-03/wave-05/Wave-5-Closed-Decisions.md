# Phase 3 / Wave 5 — Closed Decisions

Date: 2026-04-30
Scope: Project Control Center (PCC) Phase 3 / Wave 5 Priority Actions Rail planning

## Closure Position

All Wave 5 open decisions are closed for implementation planning. Closure means the local code-agent prompts can proceed without asking the user to resolve these items again. Some decisions are closed as "defer from Wave 5," which means they are intentionally excluded rather than unresolved.

## Closed Decision Register

| ID | Decision | Final Disposition | Implementation Direction | Blocking? |
|---|---|---|---|---|
| W5-OD-001 | How should the four Wave 5 MVP rail groups map to the current 10 `PriorityActionCategory` values? | Closed — use a PCC app-local grouping adapter. | Do not rewrite `packages/models/src/pcc/PriorityActions.ts`. Create local rail group ids for Access Requests, Readiness Blockers, Approval / Checkpoint Prompts, and External-System Mapping Prompts. Map existing actions into those groups by category plus related work center. | No |
| W5-OD-002 | Should Wave 5 consume the standalone backend `priority-actions` route? | Closed — yes, but only after local rail UI/adapter stability and only under explicit backend opt-in. | Prompt 05 should add controlled consumption of `getPriorityActions` using a narrow consumer interface and safe fallback. Default fixture behavior remains unchanged. Backend opt-in Project Home may add one additional GET to `/priority-actions`; no default backend cutover. | No |
| W5-OD-003 | Should rail actions route/drill into owning modules during Wave 5? | Closed — metadata only, no execution. | Render target metadata, disabled/non-executing controls, and clear preview affordances. No live navigation, no workflow execution, no approval execution, no write behavior. | No |
| W5-OD-004 | Should persona-aware display filter actions by actual user role? | Closed — display-only persona posture. | Show assignee/persona labels and allow simple group/category filtering. Do not derive real user persona from SPFx context, auth tokens, Entra groups, SharePoint groups, or backend claims. No permission enforcement. | No |
| W5-OD-005 | Should document-control prompts and Site Health escalations appear in Wave 5? | Closed — suppress from MVP rail. | Do not show `documents`, `health`, or `safety` actions in the user-facing four-lane MVP rail. Tests should prove suppression. Preserve data only as ignored/deferred metadata if useful for adapter tests. | No after suppression is implemented |
| W5-OD-006 | Should existing `HbcPriorityRail` UI-kit components be reused? | Closed — no direct reuse in Wave 5. | Treat `packages/ui-kit/src/HbcPriorityRail/**` as a reference only. Build a PCC-local rail component that respects the existing bento/grid/card invariants. Revisit UI-kit promotion only after Wave 5 behavior is accepted. | No |
| W5-OD-007 | Should shared model category metadata be updated to add canonical four-lane categories? | Closed — defer shared model mutation. | Keep the current 10 shared categories fixture-backed and tested. Define app-local `PccPriorityRailGroupId` / group metadata inside the PCC app. Future canonical model refactor may be planned after Wave 5 closeout. | No |
| W5-OD-008 | Should Wave 5 update master roadmap/status docs? | Closed — no master roadmap/status edits during implementation prompts. | Wave 5 implementation prompts may create/update Wave 5 scope, decision, prompt closeout, and app README records as allowed. Master roadmap/status docs require a dedicated docs prompt or explicit user authorization. | No |

## Carry-Forward Decision From Wave 4

| ID | Decision | Final Disposition | Implementation Direction | Blocking? |
|---|---|---|---|---|
| W4-OD-009 | Scoped-host ADR / architecture record disposition | Closed for Wave 5 as non-blocking deferred work. | Do not include the ADR in Wave 5 implementation prompts. Create a separate architecture-record prompt later if desired. | No |

## Required Prompt Package Updates

Update the Wave 5 package so `Wave-5-Open-Decisions.md` becomes a closed register or is replaced by this file. Prompt 01 should no longer ask the implementation agent to decide these points; it should require the agent to verify the closures against repo truth and stop only if repo truth has materially changed.

## Implementation Notes

- Fixture remains the default.
- Backend mode remains explicit opt-in only.
- Project Home / Priority Actions Rail may use the existing backend route only under explicit opt-in mode.
- No new fetch callsite is authorized; reuse the existing backend read-model client.
- No write routes, mutation, auth wiring, Graph/PnP runtime, Procore runtime, Document Crunch runtime, Adobe Sign runtime, Team & Access mutation, approval execution, Site Health repair execution, deployment, `.sppkg`, app-catalog work, or production rollout is authorized.
