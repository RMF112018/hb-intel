# ADR-0113 — Strategic Intelligence Primitive Runtime

**Status:** Accepted  
**Date:** 2026-03-12  
**Deciders:** HB Intel Architecture Team  
**Supersedes:** None  
**Note:** companion primitive ADR for SF20 closure.

## Context

SF20 closure requires canonical primitive runtime ownership for heritage/living intelligence lifecycle, trust/provenance governance, workflow integrity, sensitivity/redaction policy, replay safety, and telemetry contract stability.

## Decisions

### D-01 — Canonical Runtime Scope
`@hbc/strategic-intelligence` is the canonical owner for heritage snapshot contracts, living intelligence contracts, and lifecycle/storage APIs.

### D-02 — Trust and Provenance Ownership
Reliability tier, provenance class, stale/review semantics, and AI-assisted trust downgrade rules are primitive-owned contracts.

### D-03 — Workflow Semantics Lock
Approval queue state, acknowledgment workflow, commitment lifecycle, and conflict/supersession resolution are primitive-governed and append-only where required by governance events.

### D-04 — Redaction and Index Governance
Sensitivity classes, redacted projection outputs, and approved-only indexing eligibility are primitive policy outputs consumed by adapters.

### D-05 — Offline Queue and Replay Ownership
Queueing, optimistic sync statuses (`Saved locally`, `Queued to sync`), replay ordering, and reconciliation semantics remain primitive-owned.

### D-06 — Version/Provenance Continuity
Version metadata and immutable governance/event lineage remain aligned to `@hbc/versioned-record` public contracts and primitive-owned mutation envelopes.

### D-07 — Public Contract Discipline
Primitive publishes stable root and `./testing` entrypoints; adapter and downstream modules consume only declared public exports.

### D-08 — Integration Event Safety
Integration payloads for notifications, canvas placement, related links, acknowledgment, health, and benchmark enrichment are derived through policy-safe primitive outputs.

### D-09 — Testing Surface Lock
`@hbc/strategic-intelligence/testing` is the canonical deterministic fixture surface for primitive, adapter, storybook, and e2e consumers.

### D-10 — Change Control
Breaking runtime/contract ownership changes require a superseding ADR with migration guidance for `@hbc/features-business-development` and downstream consumers.

## Linked Feature ADR

Feature adapter ADR: [ADR-0109 — BD Heritage and Living Strategic Intelligence (Adapter over Primitive)](/Users/bobbyfetting/hb-intel/docs/architecture/adr/ADR-0109-bd-heritage-living-strategic-intelligence.md).

## Compliance

This ADR is locked and can only be superseded by an explicit follow-up ADR.
