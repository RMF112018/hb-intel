# Phase 3 / Wave 5 — Priority Actions Rail

**Classification:** Canonical Normative Plan (active wave scope lock).
**Status:** Open — implementation may proceed after Prompt 01 lands.
**Audited HEAD:** `86585b661`.
**Audited date:** 2026-04-30.
**Prompt package:** `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-05/` (untracked working drafts; not authored or normalized by Prompt 01).

This document freezes the Wave 5 scope. Source-implementation prompts (Prompts 02–07) execute against this lock and against `Wave_5_Closed_Decisions.md`. Changes to default posture or scope require explicit user authorization and an update to this file.

---

## 1. Wave 4 carry-forward (factual baseline)

Wave 4 is closed (`Wave_4_Closeout.md` at HEAD `819e0c284`). Wave 5 builds on this baseline; Wave 5 must not regress or duplicate it.

- **SPFx default posture:** fixture rendering. `mount(el)` / `mount(el, ctx)` / `<PccApp />` with no `readModelClient` prop is bit-identical Wave 2 fixture output. No client instantiation. No `fetch(`. No async hook firing.
- **Backend mode:** explicit opt-in only via `_config.readModel = { readModelMode: 'backend', backendBaseUrl }` on `mount`. Project Home is the **sole** opt-in consumer; the seam is threaded only through the `'project-home'` branch of `PccSurfaceRouter`.
- **Backend HTTP traffic:** GET-only across the seven Wave 3 read-only routes. The single `fetch(` callsite in `apps/project-control-center/src` is `pccBackendReadModelClient.ts`. Project Home consumes only `/home` and `/document-control`; the `/priority-actions` route exists and is registered but is **not** consumed by Project Home in Wave 4 (priority actions are denormalized into the home envelope).
- **Backend host:** `backend/functions/src/hosts/pcc-read-model/` registers seven GET-only routes, `authLevel: 'anonymous'`, delegating to a mock provider. No Microsoft Graph, PnP, SharePoint REST, Procore, Document Crunch, or Adobe Sign runtime.
- **Shared models:** `packages/models/src/pcc/PriorityActions.ts` exports `PriorityActionCategory` (10 canonical values) and `IPriorityAction` (with `assigneePersona`). `PccReadModels.ts` exports the read-model envelope contract. Fixtures and registry maps are in place.
- **Project Home surface:** `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx` already renders priority actions inside the Project Home 10-card bento. The single `data-pcc-active-surface-panel="project-home"` invariant is preserved across both default and opt-in render paths.
- **UI-kit:** `packages/ui-kit/src/HbcPriorityRail/**` exists but is not consumed by PCC.
- **Lockfile:** `pnpm-lock.yaml` md5 `c56df7b79986896624536aab74d609f4` is unchanged from the pre-Wave-4 baseline and identical at this Wave 5 audited HEAD.
- **Wave 4A:** controlled non-production hosted visual validation is **operator-pending**. It is a separate phase. It is **not** a Wave 5 prerequisite.
- **W4-OD-009 (scoped-host ADR):** **deferred** and explicitly **non-blocking** for Wave 5.

## 2. Wave 5 objective

Build the MVP **Priority Actions Rail** for the PCC Project Home landing experience using repo-existing priority action models, fixtures, and the Wave 4 read-model seam.

Wave 5 must improve the visible Priority Actions experience inside the existing `PccPriorityActionsCard` slot while preserving Wave 4 fixture-default and explicit-backend-opt-in posture. Wave 5 introduces no live runtime, no auth, no execution behavior, and no shared-model mutation.

## 3. Repo-truth summary

The following facts are confirmed at the audited HEAD and govern Wave 5 implementation prompts:

- `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx` exists and is the locked rail placement for Wave 5.
- `packages/models/src/pcc/PriorityActions.ts` defines 10 `PriorityActionCategory` values and the `IPriorityAction` shape including `assigneePersona`.
- `packages/models/src/pcc/PccReadModels.ts` defines the read-model envelope and source-status vocabulary used by the Wave 4 seam.
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts` registers `GET /api/pcc/projects/{projectId}/priority-actions` (anonymous, GET-only). The route exists but is not consumed by Project Home in Wave 4.
- `apps/project-control-center/src/api/pccBackendReadModelClient.ts` is the single authorized `fetch(` callsite and supports all seven backend routes.
- `packages/ui-kit/src/HbcPriorityRail/**` is reference-only; PCC does not import it.
- The Project Home 10-card direct-child bento order and the single `data-pcc-active-surface-panel` marker are Wave 4 invariants and remain Wave 5 invariants.

## 4. In-scope items

Wave 5 implementation prompts may produce, in sequence:

- This repo-resident scope lock and `Wave_5_Closed_Decisions.md` (Prompt 01).
- A PCC app-local Priority Actions Rail view-model + adapter under `apps/project-control-center/src/surfaces/projectHome/` (or co-located `priorityActions/` subfolder per Prompt 02).
- Four MVP display groups:
  - **Access Requests**;
  - **Readiness Blockers**;
  - **Approval / Checkpoint Prompts**;
  - **External-System Mapping Prompts**.
- An app-local mapping adapter from current `@hbc/models/pcc` `PriorityActionCategory` values into the four Wave 5 display groups.
- Suppression of `documents`, `health`, and `safety` from the user-facing MVP rail.
- A PCC-local rail UI component rendered inside the existing `PccPriorityActionsCard` slot, supporting:
  - per-group summaries (counts, severity/tone hints);
  - due/urgent indicators sourced from existing model fields (no inferred dates);
  - persona/assignee **display** labels sourced from existing `assigneePersona` records;
  - source/status/severity/tone mapping consistent with Wave 4 `PccCardState` vocabulary;
  - empty state (no actions in the four MVP groups);
  - backend-unavailable / error state aligned with Wave 4 `PccCardState`;
  - **metadata-only / inert affordances** for any per-action "controls" — no anchor `href`, no `onClick` execution, no live navigation, no drill-in.
- Project Home integration **through the existing `PccPriorityActionsCard` slot** — no new top-level surface, no router change, no shell change.
- Explicit backend opt-in consumption of the existing `getPriorityActions` route only after adapter/UI stability (deferred to Prompt 05). Default fixture behavior must remain unchanged.
- Tests for:
  - default fixture rendering through the rail;
  - visible four-group grouping under a mapped fixture set;
  - suppression of `documents`, `health`, and `safety`;
  - empty state;
  - backend-unavailable fallback;
  - inert/metadata-only affordances (no anchor `href`, no live `onClick` work);
  - no live launch links;
  - no write methods;
  - no new unauthorized `fetch(` callsites (controlled-consumption guard remains intact);
  - no non-Project-Home read-model consumer (single-consumer invariant remains intact);
  - no direct `HbcPriorityRail` import in PCC source;
  - Project Home bento/grid invariants (10 direct-child cards);
  - active-surface-panel invariant (exactly one `data-pcc-active-surface-panel` marker).
- A Wave 5 closeout (Prompt 07) and Wave 6 readiness statement.

Optional UI exploration (not binding acceptance criteria for Prompt 03 unless the canonical Prompt 03 spec expressly requires it):

- group/category filtering or per-group selection if it improves clarity. Filtering is **not** a Wave 5 acceptance gate.

## 5. Out-of-scope items

The following are forbidden for the duration of Wave 5 unless an explicit, written user authorization re-opens scope:

- new top-level `priority-actions` PCC surface (router/shell entry);
- canonical shared-model category rewrite (no edits to `packages/models/src/pcc/PriorityActions.ts` category vocabulary in Wave 5);
- direct import or reuse of `packages/ui-kit/src/HbcPriorityRail/**` in PCC app code;
- document-control prompts in the user-facing MVP rail;
- Site Health escalations in the user-facing MVP rail;
- Safety prompts in the user-facing MVP rail;
- workflow execution;
- approval execution;
- permission mutation (Team & Access);
- live auth / token wiring (`@hbc/auth/spfx`, `@microsoft/sp-http`);
- live Microsoft Graph / PnP / SharePoint REST runtime;
- Procore runtime, SDK, secrets, sync, mirror, write-back;
- Document Crunch runtime;
- Adobe Sign runtime;
- Site Health scanner or repair execution;
- provisioning execution;
- backend write routes (`POST` / `PUT` / `PATCH` / `DELETE`);
- new `fetch(` callsites anywhere in `apps/project-control-center/src` (the existing single allowlist for `pccBackendReadModelClient.ts` is the only authorized site);
- tenant mutation;
- Wave 4A or Wave 5A hosted visual validation;
- `.sppkg` generation, app-catalog upload, or production rollout;
- package, lockfile, version, manifest, workflow, or deployment changes;
- master roadmap / status doc edits (`docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md`, `phase-3/05_Phase_3_Development_Roadmap_Updated.md`, `phase-3/07_Phase_3_Module_Implementation_Plan.md`);
- the W4-OD-009 scoped-host ADR (deferred follow-up; not a Wave 5 deliverable).

## 6. Locked implementation direction

### W5-SD-001 — Rail placement

The rail belongs **inside the existing Project Home `PccPriorityActionsCard` slot** for Wave 5.

Reason:

- There is no current `priority-actions` surface route.
- Project Home already owns the landing dashboard.
- The current card already renders priority actions.
- This preserves shell/router simplicity and the 10-card bento invariant.

### W5-SD-002 — Grouping layer

Wave 5 uses an **app-local display grouping layer** instead of mutating `PriorityActionCategory`.

Reason:

- Shared models already define 10 canonical categories.
- Planning docs define 4 MVP rail groups.
- The fastest safe implementation is a mapping adapter co-located with the Project Home surface, not a canonical model rewrite.

### W5-SD-003 — Suppressed categories

The user-facing MVP rail **suppresses** these categories:

- `documents`;
- `health`;
- `safety`.

Reason:

- Current fixtures include them, but Wave 5 MVP scope does not include Document Control prompts, Site Health escalations, or Safety prompts in the rail.
- Those areas have separate downstream module ownership.

### W5-SD-004 — Backend consumption

The existing backend `priority-actions` route may be consumed only through the Wave 4 explicit-backend-opt-in seam, and only after Prompts 02–04 are accepted (i.e., deferred to Prompt 05).

Reason:

- Route exists; SPFx backend client supports it.
- Default fixture behavior must remain unchanged.
- Project Home must remain the only consumer during Wave 5.
- No new transport, no new `fetch(` callsite, and no write surface is authorized.

### W5-SD-005 — Action behavior

Wave 5 actions are **metadata-only / inert affordances**. They must not execute workflow, approval, permission, repair, external-system, navigation, or tenant operations.

Specifically, Wave 5 authorizes:

- **no anchor `href`** that targets a live or external destination;
- **no live drill-in** into owning modules;
- **no navigation execution**;
- **no `onClick` execution** of imperative actions;
- **no approval execution**;
- **no workflow execution**;
- **no backend write or mutation** of any kind.

Reason:

- Downstream waves own those modules.
- Wave 5 is an aggregation/read-model rail, not an execution engine.

### W5-SD-006 — Persona behavior

Persona is **display-only**.

Reason:

- `IPriorityAction` already includes `assigneePersona`.
- Wave 4 deliberately avoided real auth/persona derivation.
- Wave 5 must not add SPFx context auth, Entra group, SharePoint group, token, or backend-claims permission logic.

### W5-SD-007 — UI-kit reuse

Existing `HbcPriorityRail` types/components are **reference only** in Wave 5. Do not import them into PCC.

Reason:

- PCC is a bento card inside a command-center SPFx app.
- Existing rail assets may be governed by homepage/command-band contexts.
- PCC must preserve its app-specific guardrails and layout invariants.
- A future UI-kit promotion may be planned after Wave 5 behavior is accepted.

### W5-SD-008 — Documentation boundaries

Wave 5 implementation prompts may update Wave 5 docs and the PCC app `README.md` where behavior changes. They must **not** edit master roadmap / status / module-implementation docs without explicit separate authorization.

## 7. Acceptance criteria

Wave 5 is complete when:

- Project Home renders a polished four-group Priority Actions Rail inside the existing `PccPriorityActionsCard` slot.
- Default render path uses fixtures and performs no `fetch(`.
- Explicit backend mode consumes the existing `priority-actions` route only through `pccBackendReadModelClient.ts`; no new transport file is added.
- The user-facing rail suppresses `documents`, `health`, and `safety` actions.
- All affordances are metadata-only / inert (no anchor `href`, no live navigation, no `onClick` execution, no approval execution, no workflow execution, no mutation).
- Empty, backend-unavailable, partial-data, and unauthorized/fallback states render cleanly using the Wave 4 `PccCardState` vocabulary.
- Project Home remains a 10-card direct-child bento dashboard.
- Exactly one `data-pcc-active-surface-panel="project-home"` marker exists.
- Guardrail tests prove no unsafe runtime, mutation, backend default, new `fetch(` callsite, direct UI-kit rail import, or non-Project-Home read-model consumer.
- The PCC app `README.md` and the Wave 5 closeout docs accurately reflect what was and was not implemented.
- Optional UI exploration (filtering / per-group selection) is **not** required for completion.

## 8. Wave 4A and W4-OD-009 — explicit non-prerequisite statements

- **Wave 4A is not a Wave 5 prerequisite.** Wave 4A is operator-pending controlled non-production hosted visual validation. It is a separate phase and is separately gated. Wave 5 implementation may proceed in parallel against the seam landed in Wave 4. Wave 5 implementation prompts must not perform Wave 4A hosted validation.
- **W4-OD-009 (scoped-host ADR) is deferred and not blocking Wave 5.** The scoped-host pattern at `backend/functions/src/hosts/pcc-read-model/` remains documented across the Wave 3 + Wave 4 closeout chain. A dedicated ADR prompt may be opened later as separate docs work; it is not part of Wave 5 scope.

## 9. Validation pattern (per implementation prompt)

- Use the smallest meaningful validation set per the relevant prompt.
- Package-local typecheck/lint/tests for `@hbc/spfx-project-control-center` (and `@hbc/models` only if shared types are touched, which Wave 5 forbids).
- Preserve the Wave 4 controlled-consumption guard (37 `it()` blocks at Wave 4 closeout). Wave 5 may extend the api-import allowlist or identifier exception list narrowly per `feedback_pure_helper_guard_exception` and `feedback_narrow_consumer_interface`; broad relaxation is forbidden.
- Lockfile checksum unchanged unless explicitly authorized (`feedback_lockfile_discipline`).
- Use `docs/reference/developer/verification-commands.md` before inventing validation commands.

## 10. Architectural completeness

Validation must assess **both execution completion and architectural completeness** for every Wave 5 prompt. The closing report on each prompt must affirm that:

- no orphan code was introduced (no produced view-models, adapters, or rail components without a consumer);
- no quiet posture drift occurred (fixture default preserved; opt-in surface remains Project Home only);
- no silent runtime cutover occurred (no new `fetch(`, no live external runtime, no auth seam exercise outside opt-in mode);
- guardrail tests still cover the unwired surfaces and the suppressed-category invariant;
- inert-affordance proof is captured (no anchor `href`, no `onClick` execution path on action affordances).

Failure to assess architectural completeness is treated as failed validation regardless of whether package commands exit zero.
