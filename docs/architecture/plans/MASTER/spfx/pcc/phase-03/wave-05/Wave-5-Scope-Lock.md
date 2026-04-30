# Phase 3 / Wave 5 — Scope Lock

## Wave Name

Priority Actions Rail.

## Objective

Build the MVP Priority Actions Rail for the PCC Project Home landing experience using repo-existing priority action models, fixtures, and read-model seams.

Wave 5 must improve the visible Priority Actions experience while preserving Wave 4 fixture-default and explicit-backend-opt-in posture.

## Status

Ready for implementation after Prompt 01 writes the repo-resident Wave 5 scope lock and closed decision register.

## In Scope

- Wave 5 repo-resident scope lock and closed-decision register.
- PCC app-local Priority Actions Rail view-model and adapter.
- Four MVP display groups:
  - Access Requests;
  - Readiness Blockers;
  - Approval / Checkpoint Prompts;
  - External-System Mapping Prompts.
- Mapping from current `@hbc/models/pcc` priority action categories into the four Wave 5 display groups.
- Suppression of `documents`, `health`, and `safety` from the user-facing MVP rail.
- PCC-local rail UI component with:
  - group summaries;
  - group/category filtering or group selection if it improves clarity;
  - due/urgent indicators;
  - persona/assignee display;
  - source/status/severity/tone mapping;
  - empty state;
  - backend-unavailable/error state;
  - disabled/non-executing action controls.
- Project Home integration through the existing `PccPriorityActionsCard` slot.
- Explicit backend opt-in consumption of existing `getPriorityActions` route after adapter/UI stability.
- Tests for:
  - default fixture rendering;
  - visible four-lane grouping;
  - suppression of non-MVP categories;
  - empty state;
  - backend-unavailable fallback;
  - no live action execution;
  - no live launch links;
  - no write methods;
  - no new unauthorized `fetch(` callsites;
  - no non-Project-Home read-model consumer;
  - no direct `HbcPriorityRail` import;
  - Project Home bento/grid invariants;
  - active-surface-panel invariant.
- Wave 5 closeout and Wave 6 readiness.

## Out of Scope

- New top-level `priority-actions` PCC surface.
- Canonical shared model category rewrite.
- Direct import/reuse of `packages/ui-kit/src/HbcPriorityRail/**` in PCC app.
- Document-control prompts in the user-facing MVP rail.
- Site Health escalations in the user-facing MVP rail.
- Safety prompts in the user-facing MVP rail.
- Workflow execution.
- Approval execution.
- Permission mutation.
- Live auth/token wiring.
- Live Graph/PnP/SharePoint REST runtime.
- Procore runtime.
- Document Crunch runtime.
- Adobe Sign runtime.
- Site Health scan or repair execution.
- Provisioning executor.
- Backend write routes.
- Tenant mutation.
- Wave 4A or Wave 5A hosted validation.
- `.sppkg`, app-catalog upload, or production rollout.
- Package/lockfile/version/manifest/workflow changes.
- Master roadmap/status edits.
- W4-OD-009 scoped-host ADR.

## Locked Implementation Direction

### W5-SD-001 — Rail Placement

The rail belongs inside the existing Project Home Priority Actions card for Wave 5.

Reason:

- There is no current `priority-actions` surface route.
- Project Home already owns the landing dashboard.
- The current card already renders priority actions.
- This preserves shell/router simplicity and bento-grid invariants.

### W5-SD-002 — Grouping Layer

Wave 5 uses an app-local display grouping layer instead of mutating `PriorityActionCategory`.

Reason:

- Shared models already define 10 categories.
- Planning docs define 4 MVP rail groups.
- The fastest safe implementation is a mapping adapter, not a canonical model rewrite.

### W5-SD-003 — Suppressed Categories

The user-facing MVP rail suppresses these categories:

- `documents`
- `health`
- `safety`

Reason:

- Current fixtures include them, but Wave 5 MVP scope does not include Document Control prompts, Site Health escalations, or Safety prompts in the rail.
- Those areas have separate downstream module ownership.

### W5-SD-004 — Backend Consumption

The existing backend `priority-actions` route must be consumed only through the Wave 4 explicit backend opt-in seam, and only after Prompts 02–04 are accepted.

Reason:

- Route exists.
- SPFx client supports it.
- Default fixture behavior must remain unchanged.
- Project Home must remain the only consumer during Wave 5.
- No new transport or `fetch(` callsite is authorized.

### W5-SD-005 — Action Behavior

Wave 5 actions are display prompts only. They must not execute workflow, approval, permission, repair, external-system, or tenant operations.

Reason:

- Downstream waves own those modules.
- Wave 5 is an aggregation/read-model rail, not an execution engine.

### W5-SD-006 — Persona Behavior

Persona is display-only.

Reason:

- `IPriorityAction` already includes `assigneePersona`.
- Wave 4 deliberately avoided real auth/persona derivation.
- Wave 5 must not add SPFx context auth, Entra, SharePoint group, token, or backend-claims permission logic.

### W5-SD-007 — UI-Kit Reuse

Existing `HbcPriorityRail` types/components are reference only in Wave 5. Do not import them into PCC.

Reason:

- PCC is a bento card inside a command-center SPFx app.
- Existing rail assets may be governed by homepage/command-band contexts.
- PCC must preserve its app-specific guardrails and layout invariants.

### W5-SD-008 — Documentation Boundaries

Wave 5 implementation prompts may update Wave 5 docs and the PCC app README where behavior changes. They must not update master roadmap/status docs without explicit separate authorization.

## Acceptance Criteria

Wave 5 is complete when:

- Project Home renders a polished four-group Priority Actions Rail inside the existing Priority Actions card.
- Default render path uses fixtures and performs no fetch.
- Explicit backend mode consumes the existing `priority-actions` route only through the existing backend client.
- User-facing rail suppresses `documents`, `health`, and `safety` actions.
- All actions are read-only/non-executing.
- Empty, backend-unavailable, partial-data, and unauthorized/fallback states render cleanly.
- Project Home remains a 10-card direct-child bento dashboard.
- Exactly one active-surface-panel marker exists.
- Guardrail tests prove no unsafe runtime, mutation, backend default, new fetch callsite, direct UI-kit rail import, or non-Project-Home consumer.
- README and closeout docs accurately reflect what was and was not implemented.
