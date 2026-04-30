# Phase 3 / Wave 5 — Closed Decisions

**Phase:** 3 — SPFx Project Control Center.
**Wave:** 5 — PCC Priority Actions Rail.
**Date:** 2026-04-30.
**Audited HEAD:** `86585b661`.
**Companion document:** `Wave_5_Scope_Lock.md` (this folder).

## Closure position

All Wave 5 open decisions are **closed for implementation planning**. Closure means the local code-agent prompts (Prompts 02–07) can proceed without asking the user to resolve these items again. Some decisions are closed as "deferred from Wave 5," which means they are intentionally excluded rather than unresolved.

If repo truth materially changes before an implementation prompt runs (e.g., a category is added/removed in `packages/models/src/pcc/PriorityActions.ts`, the `PccPriorityActionsCard` is removed, or the Wave 4 read-model seam is mutated), the implementation prompt must stop and report the conflict before editing files.

---

## Closed Decision Register

| ID | Question | Final disposition | Implementation direction | Blocking? |
| --- | --- | --- | --- | --- |
| W5-OD-001 | How should the four Wave 5 MVP rail groups map to the current 10 `PriorityActionCategory` values? | **Closed — use a PCC app-local grouping adapter.** | Do not rewrite `packages/models/src/pcc/PriorityActions.ts`. Define app-local rail group ids for **Access Requests**, **Readiness Blockers**, **Approval / Checkpoint Prompts**, and **External-System Mapping Prompts** under `apps/project-control-center/src/surfaces/projectHome/`. Map existing actions into those groups by canonical `PriorityActionCategory` plus related work-center metadata. | No |
| W5-OD-002 | Should Wave 5 consume the standalone backend `priority-actions` route? | **Closed — yes, but only after local rail UI/adapter stability and only under explicit backend opt-in.** Deferred to Prompt 05. | Prompt 05 may add controlled consumption of `getPriorityActions` through the existing `pccBackendReadModelClient.ts` using a narrow consumer interface (per `feedback_narrow_consumer_interface`) and the Wave 4 fixture-fallback path. Default fixture behavior remains unchanged. The `'project-home'` branch of `PccSurfaceRouter` remains the sole consumer; no additional `readModelClient=` thread points are authorized. No new `fetch(` callsite is authorized. | No |
| W5-OD-003 | Should rail action affordances drill into owning modules during Wave 5? | **Closed — metadata-only / inert affordances.** | Render target metadata, severity/tone hints, due/urgent indicators, and persona/assignee labels using existing record fields. Action affordances are **inert**: no anchor `href` to live destinations, no `onClick` execution of imperative work, no live navigation, no workflow execution, no approval execution, no permission mutation, no backend write or mutation. | No |
| W5-OD-004 | Should persona-aware display filter actions by actual user role? | **Closed — display-only persona posture.** | Show `assigneePersona` labels using existing record fields. Optional UI exploration may add per-group / per-category selection or filtering, but filtering is **not** a binding acceptance criterion. Do not derive real user persona from SPFx context, auth tokens, Entra groups, SharePoint groups, or backend claims. No permission enforcement. | No |
| W5-OD-005 | Should document-control prompts and Site Health escalations appear in Wave 5? | **Closed — suppress from MVP rail.** | Do not show `documents`, `health`, or `safety` actions in the user-facing four-group MVP rail. Tests must prove suppression. Source data may remain available to the adapter for unit-test fixtures, but it must not appear in user-facing rail output. | No, after suppression is implemented |
| W5-OD-006 | Should existing `HbcPriorityRail` UI-kit components be reused? | **Closed — no direct reuse in Wave 5; reference only.** | Treat `packages/ui-kit/src/HbcPriorityRail/**` as a reference. Build a PCC-local rail component that respects the existing bento/grid/card invariants and Wave 4 `PccCardState` vocabulary. The controlled-consumption guard must continue to fail any direct PCC import of `HbcPriorityRail`. UI-kit promotion may be revisited only after Wave 5 closeout. | No |
| W5-OD-007 | Should shared model category metadata be updated to add canonical four-group categories? | **Closed — defer shared-model mutation.** | Keep the current 10 shared categories in `packages/models/src/pcc/PriorityActions.ts` fixture-backed and tested. Define an app-local `PccPriorityRailGroupId` and group metadata inside the PCC app surface folder. A future canonical model refactor may be planned after Wave 5 closeout, after grep validation per `feedback_preflight_grep_for_model_extensions`. | No |
| W5-OD-008 | Should Wave 5 update master roadmap / status / module-implementation docs? | **Closed — no master roadmap/status edits during implementation prompts.** | Wave 5 implementation prompts may create or update Wave 5 scope, decision, prompt closeouts, the Wave 5 closeout, and the PCC app `README.md` where behavior changes. Edits to `Project_Control_Center_Development_Roadmap.md`, `phase-3/05_Phase_3_Development_Roadmap_Updated.md`, and `phase-3/07_Phase_3_Module_Implementation_Plan.md` require a dedicated docs prompt or explicit user authorization. | No |

## Carry-forward decision from Wave 4

| ID | Question | Final disposition | Implementation direction | Blocking? |
| --- | --- | --- | --- | --- |
| W4-OD-009 | Scoped-host ADR / architecture-record disposition for `backend/functions/src/hosts/pcc-read-model/`. | **Closed for Wave 5 as non-blocking deferred work.** | Do not include the ADR in Wave 5 implementation prompts. The scoped-host pattern remains documented across the Wave 3 + Wave 4 closeout chain. A dedicated ADR prompt may be opened later as separate docs work; it is **not** a Wave 5 deliverable and **not** a Wave 5 prerequisite. | No |

## Implementation notes (cross-cutting)

- **Fixture remains the default.** `mount(el)` and `mount(el, ctx)` continue to render the Wave 2 fixture path bit-identically. Wave 5 must not change `resolvePccReadModelConfig` defaults.
- **Backend mode remains explicit opt-in only.** Backend consumption requires `_config.readModel = { readModelMode: 'backend', backendBaseUrl }` on `mount`. No backend default cutover is authorized.
- **Project Home remains the sole opt-in consumer.** The `'project-home'` branch of `PccSurfaceRouter` is the only authorized `readModelClient=` thread point. The Wave 4 single-consumer source-scan must continue to pass.
- **No new `fetch(` callsite.** The Wave 4 controlled-consumption guard allowlists exactly `pccBackendReadModelClient.ts` (and its colocated test). Wave 5 must not relax this. Any backend consumption added in Prompt 05 must reuse the existing client.
- **No write routes, no mutation, no auth wiring.** Wave 5 must not add `POST` / `PUT` / `PATCH` / `DELETE` clients, must not import `@hbc/auth/spfx` or `@microsoft/sp-http`, and must not derive persona from SPFx context.
- **No live runtime.** No Microsoft Graph, PnP, SharePoint REST, Procore, Document Crunch, or Adobe Sign runtime is authorized.
- **No tenant / packaging / deployment work.** No Site Health repair execution, no Team & Access mutation, no approval execution, no provisioning execution, no `.sppkg`, no app-catalog upload, no Wave 4A / Wave 5A hosted validation, no production rollout.
- **No package, lockfile, manifest, workflow, or version changes.** `pnpm-lock.yaml` md5 must remain `c56df7b79986896624536aab74d609f4` across Wave 5 implementation prompts unless an explicit, separately authorized prompt re-opens dependency posture.
- **Inert affordance posture.** Per W5-OD-003, action affordances must be metadata-only: no anchor `href` to live destinations, no `onClick` executing imperative work, no navigation, no approval/workflow execution, no mutation. Tests must capture this.
- **Master roadmap / status docs untouched.** Per W5-OD-008.

## Required prompt-package alignment

The untracked Wave 5 prompt package under `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-05/` is **not** authored, normalized, edited, or relied upon by Prompt 01. Prompt 01 produced only the two repo-resident blueprint records (this file and `Wave_5_Scope_Lock.md`). Any later prompt-package alignment is separate documentation work and must be authorized separately.
