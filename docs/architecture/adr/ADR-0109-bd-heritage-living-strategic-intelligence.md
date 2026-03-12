# ADR-0109 — BD Heritage and Living Strategic Intelligence (Adapter over Primitive)

**Status:** Accepted  
**Date:** 2026-03-12  
**Deciders:** HB Intel Architecture Team  
**Supersedes:** None

## Context

SF20 completed implementation as `@hbc/features-business-development` over the Tier-1 primitive `@hbc/strategic-intelligence`. T09 requires a locked adapter-over-primitive closure decision with explicit governance for trust, workflow, redaction, replay, integrations, and telemetry.

## Decisions

### L-01 — Adapter Boundary Lock
`@hbc/features-business-development` remains an adapter/composition layer for strategic-intelligence UX, domain copy, role-context display, and projection rendering.

### L-02 — Primitive Ownership Lock
Canonical heritage snapshot and living strategic intelligence lifecycle contracts remain owned by `@hbc/strategic-intelligence`.

### L-03 — Trust and Provenance Governance
Reliability tiering, provenance class semantics, recency/stale-state derivation, and trust downgrade rules are primitive-owned and adapter-consumed.

### L-04 — Workflow Ownership
Approval transitions, handoff acknowledgment lifecycle, commitment lifecycle, conflict/supersession governance, and replay-safe state transitions remain primitive-owned.

### L-05 — Complexity Projection Rule
Essential/Standard/Expert behavior is adapter-projected via shared complexity contracts without redefining primitive lifecycle semantics.

### L-06 — Offline Resilience Continuity
Offline queue and replay behavior remain aligned to `@hbc/versioned-record` contracts and primitive queue/replay APIs, with optimistic statuses surfaced from primitive sync state.

### L-07 — Inline AI Guardrails
Inline AI assistance requires citation visibility and explicit user approval before persistence; AI-assisted drafts retain downgraded trust/provenance semantics until approved.

### L-08 — Sensitivity and Redaction Governance
Sensitivity classification and redacted projection policies remain primitive/policy enforced; BD adapter only renders governed projection outputs.

### L-09 — Integration Contract Discipline
BIC ownership, project-canvas placement, related-items links, acknowledgment interoperability, notification routing, health status mapping, and SF19/SF22 interop are implemented through public entrypoints only.

### L-10 — Telemetry Governance
Decision/workflow telemetry remains primitive event-owned and is consumed through shared/public contracts only; no adapter shadow telemetry model is permitted.

## Companion Primitive ADR

Companion primitive ADR: [ADR-0113 — Strategic Intelligence Primitive Runtime](/Users/bobbyfetting/hb-intel/docs/architecture/adr/ADR-0113-strategic-intelligence-primitive-runtime.md).

## Compliance

This ADR is locked and can only be superseded by an explicit follow-up ADR.
