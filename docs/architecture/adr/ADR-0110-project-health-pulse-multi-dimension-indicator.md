# ADR-0110 — Project Health Pulse Multi-Dimension Indicator

**Status:** Accepted  
**Date:** 2026-03-12  
**Deciders:** HB Intel Architecture Team  
**Supersedes:** None

## Context

SF21 finalized Project Health Pulse inside `@hbc/features-project-hub` as a confidence-aware, explainable, multi-dimension project health model with deterministic computation, governed manual overrides, triage workflows, suppression policy behavior, reference integrations, and decision-quality telemetry.

T09 requires locking the production closure decisions so future changes do not fragment ownership across computation, state orchestration, UI projections, and integration adapters.

## Decisions

### D-01 — Package Boundary Lock
Project Health Pulse remains owned by `@hbc/features-project-hub` and is consumed through explicit public exports only (`.` runtime and `./testing` test surface).

### D-02 — Deterministic Multi-Dimension Computation
Pulse scoring remains deterministic, using dimension-level leading/lagging composition and status bands with no hidden UI-side recomputation.

### D-03 — Confidence Governance
Overall and dimension confidence tiers/reasons are first-class model outputs and must remain explicit in contracts, tests, and projections.

### D-04 — Compound-Risk Escalation Governance
Cross-dimension compound-risk signals remain deterministic rule outputs that influence triage and recommendation urgency without duplicating logic in adapters/UI.

### D-05 — Explainability Contract Lock
Explainability (`whyThisStatus`, `whatChanged`, `topContributors`, `whatMattersMost`) remains a required projected payload and not optional UI copy.

### D-06 — Recommendation and Reason-Code Provenance
Top action projection remains reason-coded, confidence-weighted, and traceable across runtime, UI, and telemetry mapping surfaces.

### D-07 — Governance and Suppression Ownership
Manual override metadata, approval visibility, override aging policy, and office suppression controls remain governed model behavior, not ad hoc component logic.

### D-08 — Triage Workflow Ownership
Portfolio triage bucket/sort/filter semantics remain stable and contract-driven, with recompute/invalidation paths owned by hook/state orchestration.

### D-09 — Decision-Quality Telemetry Lock
Telemetry must preserve confidence, triage, compound-risk, and reason-code context with deterministic mapping for:
- intervention lead time
- false alarm rate
- pre-lag detection rate
- action adoption rate
- portfolio review cycle time
- suppression impact rate

### D-10 — Testing and Release Closure Governance
SF21 quality gates are locked at >=95 lines/branches/functions/statements on SF21-owned executable scope, with deterministic fixtures exported from `@hbc/features-project-hub/testing` and package-level Storybook/Playwright closure evidence required for release readiness.

## Consequences

- SF21 runtime evolution must preserve public contract discipline and deterministic behavior across computors, hooks, components, and integrations.
- Breaking changes to pulse contracts, confidence/compound semantics, triage rules, governance policy behavior, or telemetry shape require a superseding ADR.
- Documentation/index/state-map entries must remain synchronized with this ADR for auditability.

## Compliance

This ADR is locked and can only be superseded by an explicit follow-up ADR.
