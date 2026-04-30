# Phase 3 / Wave 5 Prompt Package — Project Control Center Priority Actions Rail

## Purpose

This package is the complete updated implementation prompt package for **Project Control Center (PCC) Phase 3 / Wave 5 — Priority Actions Rail**.

It incorporates the closed Wave 5 decision register. Implementation agents should treat those decisions as binding and should not re-open them unless current repo truth has materially changed.

## Repo / Branch

- Repository: `https://github.com/RMF112018/hb-intel.git`
- Target branch for audit and implementation: `main`, or a fresh implementation branch cut from current `main`
- Product area: `apps/project-control-center/`
- Shared model area: `packages/models/src/pcc/`
- Backend read-model area: `backend/functions/src/hosts/pcc-read-model/`

## Current Readiness Position

Wave 5 may proceed.

Repo truth from the prior audit established:

- Wave 4 is closed.
- Wave 4A is operator-pending hosted visual validation and is not a Wave 5 implementation prerequisite.
- The existing Project Home dashboard already contains `PccPriorityActionsCard` inside the 10-card bento layout.
- Shared PCC models already define `IPriorityAction`, current 10-category priority action metadata, fixtures, and `PccPriorityActionsReadModel`.
- The backend already exposes a GET-only `/priority-actions` read-model route.
- The SPFx read-model client already has `getPriorityActions` behind the existing explicit backend opt-in seam.
- Fixture mode remains the default and must remain the default.

## Closed Decision Posture

The previous `Wave-5-Open-Decisions.md` artifact has been replaced by `Wave-5-Closed-Decisions.md`.

Implementation agents must follow these decisions:

1. Use a **PCC app-local grouping adapter** for the four Wave 5 rail lanes.
2. Consume the standalone backend `priority-actions` route only after local rail UI/adapter stability and only under explicit backend opt-in.
3. Render rail actions as metadata/non-executing prompts only.
4. Treat persona awareness as display-only; do not derive real auth or enforce permissions.
5. Suppress `documents`, `health`, and `safety` actions from the user-facing MVP rail.
6. Do not directly reuse `packages/ui-kit/src/HbcPriorityRail/**` in Wave 5; reference only.
7. Defer shared model category mutation.
8. Do not update master roadmap/status docs during Wave 5 implementation prompts.
9. Treat W4-OD-009 scoped-host ADR as deferred and non-blocking for Wave 5.

## Package Contents

| File | Purpose |
|---|---|
| `Plan-Summary.md` | Updated implementation strategy and prompt sequence. |
| `Repo-Audit-Findings.md` | Repo-truth findings from the Wave 5 audit. |
| `Wave-5-Scope-Lock.md` | Binding scope, exclusions, and acceptance criteria. |
| `Wave-5-Closed-Decisions.md` | Final closed decision register for Wave 5. |
| `Prompt-01-Wave-5-Scope-Lock-and-Decision-Register.md` | Documentation-only prompt to create repo-resident Wave 5 scope/decision records. |
| `Prompt-02-Wave-5-Priority-Actions-Model-and-Adapter.md` | App-local rail view-model and adapter. |
| `Prompt-03-Wave-5-Priority-Actions-Rail-UI.md` | PCC-local rail UI component. |
| `Prompt-04-Wave-5-Project-Home-Rail-Integration.md` | Integrate rail into existing Project Home Priority Actions card. |
| `Prompt-05-Wave-5-Backend-Opt-In-Wiring-or-Fixture-Fallback.md` | Controlled `priority-actions` route consumption under explicit backend opt-in. |
| `Prompt-06-Wave-5-Guardrails-Validation-and-Fallback-Hardening.md` | Guardrail and regression hardening. |
| `Prompt-07-Wave-5-Closeout-and-Wave-6-Readiness.md` | Final closeout and Wave 6 readiness record. |

## Execution Rules

Execute prompts in numeric order.

Do not skip Prompt 01. Prompt 01 writes the repo-resident scope lock and closed decision register so local code agents can rely on those records.

Do not execute Prompt 05 before Prompts 02–04 are complete and accepted. Backend route consumption is deliberately sequenced after the local adapter/UI/integration path is stable.

Do not include Wave 4A or Wave 5A hosted validation inside these implementation prompts. Hosted validation is a separate operator-controlled gate.

## Global Forbidden Scope

Unless a prompt explicitly narrows and authorizes an exception, do not introduce:

- backend default cutover;
- new `fetch(` callsites;
- write routes or mutation verbs;
- tenant mutation;
- `.sppkg` packaging;
- app-catalog upload;
- tenant validation;
- production rollout;
- package, lockfile, version, manifest, workflow, or deployment changes;
- Graph, PnP, or SharePoint REST runtime;
- Procore runtime;
- Document Crunch runtime;
- Adobe Sign runtime;
- auth token wiring;
- Site Health scan or repair execution;
- Team & Access permission mutation;
- approval execution;
- provisioning executor;
- direct reuse/import of `packages/ui-kit/src/HbcPriorityRail/**` in the PCC app;
- shared priority category mutation in `packages/models/src/pcc/PriorityActions.ts`.

## Validation Baseline

Prompts should use the narrowest repo-correct validation set for the files touched. Across Wave 5, the expected validation suite includes:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
md5 pnpm-lock.yaml
git status --short
git diff --stat HEAD
git diff --name-only HEAD
```

Docs-only prompts should not run unnecessary builds unless they are capturing closeout proof.
