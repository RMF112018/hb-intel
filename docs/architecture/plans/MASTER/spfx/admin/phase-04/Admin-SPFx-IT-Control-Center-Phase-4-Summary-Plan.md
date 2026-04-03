# Admin SPFx IT Control Center — Phase 4 Summary Plan

**Status:** Complete — Exit reconciliation 2026-04-03

## Purpose

Phase 4 exists to make admin execution history durable, reviewable, and defensible.

The end-state plan defines this phase as **Durable run history, audit spine, and evidence model**. Its purpose is to make all admin actions reconstructable and defensible by generalizing persistence beyond today’s provisioning-only model, capturing operator/checkpoint/config/output/failure evidence, and establishing clear retention and evidence boundaries.

## Repo-truth starting point

The current repo is **not** starting from zero for Phase 4.

### Existing foundations already present
- `apps/admin` already exposes operational admin surfaces for system settings, provisioning oversight, dashboards, and a deferred error-log route.
- `@hbc/features-admin` is already an admin-intelligence package with monitors, probes, APIs, hooks, and dashboard components.
- `backend/functions` already contains:
  - a real service factory,
  - Graph and SharePoint adapters,
  - Azure Table Storage–backed provisioning status persistence,
  - SignalR progress push,
  - class-based saga orchestration,
  - and existing provisioning lifecycle endpoints.
- The repo also already contains a Phase 4 provisioning status / saga audit report documenting the current per-run provisioning persistence model and its current drift/contract issues.

### What that means for this phase
Phase 4 should **not** invent a brand-new persistence strategy from scratch.
It should:
- preserve the current provisioning-specific run/status path,
- extract the reusable run-history and audit concepts from it,
- build a generalized admin run/audit/evidence spine,
- and keep current provisioning/admin consumers working during the transition.

## Major objectives

1. Define the canonical **admin run record**, **audit event**, and **evidence manifest** model.
2. Generalize durable persistence beyond provisioning-specific status rows.
3. Separate:
   - run store,
   - audit store,
   - evidence metadata,
   - and large-payload evidence boundaries.
4. Add generalized retrieval/query rails for run history and audit review.
5. Bridge the existing provisioning saga and admin oversight endpoints onto the new spine without breaking current surfaces.
6. Establish retention, redaction, and evidence-handling boundaries.
7. Update docs so later phases build on one coherent evidence model.

## Architecture guardrails

### Must stay true
- SPFx remains the operator console, not the persistence or execution owner.
- Privileged backend remains the execution and durable-history owner.
- Existing provisioning storage/audit patterns are seed crystals, not throwaway prototypes.
- Current provisioning endpoints and admin views are compatibility surfaces that must keep working during this phase unless a prompt explicitly directs a safe replacement.
- Evidence must be attributable to:
  - run,
  - actor,
  - time,
  - config version / standards snapshot where applicable,
  - and execution outcome.

### Must not happen
- Do not move persistence logic into SPFx.
- Do not rewrite the orchestration substrate solely to adopt Azure Durable Functions.
- Do not break current provisioning history / retry / escalation / admin oversight paths.
- Do not assume SharePoint audit list writes are sufficient as the authoritative audit spine.
- Do not store oversized opaque payloads in Azure Table entities without an explicit boundary policy.

## Best-practice framing used for this package

This package is aligned to current Microsoft-documented guidance and platform realities:
- long-running workflow status and management patterns should expose durable status/history and management endpoints,
- least-privilege administrative design should constrain privileges and keep privileged execution server-side,
- and Azure Table Storage entity size limits mean evidence needs a clear inline-vs-offloaded storage policy.

## In-scope repo areas

Primary implementation scope:
- `backend/functions/src/services/**`
- `backend/functions/src/functions/**`
- `packages/models/src/**`
- `packages/provisioning/src/**`
- `docs/architecture/plans/MASTER/spfx/admin/**`
- `docs/reference/**` and `docs/architecture/reviews/**` only where directly needed for Phase 4 alignment

Secondary compatibility scope:
- `apps/admin/**` only when Phase 4 contract or retrieval compatibility requires minimal updates
- `packages/features/admin/**` only when documentation or thin adapter alignment is required

## Expected deliverables

Phase 4 should produce, at minimum:

1. Canonical Phase 4 architecture / contract docs for:
   - run store,
   - audit store,
   - evidence model,
   - retention and evidence boundaries.

2. Durable backend primitives for:
   - generalized admin run persistence,
   - generalized admin audit-event persistence,
   - evidence metadata capture.

3. Retrieval/query APIs for:
   - run history,
   - run detail,
   - audit event history,
   - evidence manifests / references.

4. Provisioning bridge work so the current provisioning saga contributes to the generalized spine.

5. Compatibility preservation for existing provisioning-specific endpoints and consumers.

6. Validation, migration / cutover notes, and an exit reconciliation artifact.

## Recommended implementation sequence inside Phase 4

1. Audit current repo truth and existing Phase 4 provisioning audit evidence.
2. Write the canonical run/audit/evidence baseline docs.
3. Implement durable backend stores and service-factory registration.
4. Bridge provisioning saga writes into the new generalized spine.
5. Add retrieval/query APIs and contract surfaces.
6. Implement evidence boundary and retention handling.
7. Align docs and stale references.
8. Validate, reconcile, and document exit readiness.

## Risks Phase 4 is addressing

- current persistence is still heavily provisioning-specific
- auditability is split between status rows, SignalR events, and non-authoritative SharePoint audit writes
- there is no single generalized admin evidence model
- current consumers can drift if terminal and override paths are not normalized
- Azure Table payload limits can be exceeded if evidence boundaries are not explicit
- later admin lanes will grow on inconsistent history/audit contracts if this phase is skipped

## Why this phase must come before broader console growth

Later phases depend on operators being able to:
- review what happened,
- understand who did what,
- inspect evidence,
- and trust that the backend can reconstruct a run end-to-end.

Without a generalized history/audit/evidence spine, later UI and control surfaces are likely to become:
- opaque,
- hard to troubleshoot,
- hard to defend operationally,
- and inconsistent across admin domains.

Phase 4 is the trust and forensic spine for the control center.

## Acceptance criteria

Phase 4 is complete when all of the following are true:

- A canonical generalized admin run/audit/evidence model exists in repo docs.
- Backend services exist for a generalized run store and generalized audit store.
- Evidence metadata capture is formalized, including oversized-payload handling policy.
- Retrieval/query APIs exist for run history and audit review.
- The provisioning saga writes into the generalized spine without breaking current behavior.
- Existing provisioning/admin compatibility surfaces remain functional or are explicitly and safely adapted.
- Retention and evidence boundaries are documented and enforced at the level justified by current repo maturity.
- Validation and exit reconciliation confirm that any admin run can be reviewed end-to-end in a durable, attributable way.
