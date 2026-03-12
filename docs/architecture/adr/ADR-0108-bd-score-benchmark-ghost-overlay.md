# ADR-0108 — BD Score Benchmark Ghost Overlay (Adapter over Primitive)

**Status:** Accepted  
**Date:** 2026-03-12  
**Deciders:** HB Intel Architecture Team  
**Supersedes:** None

## Context

SF19 completed implementation as `@hbc/features-business-development` over the Tier-1 primitive `@hbc/score-benchmark`. T09 requires a locked adapter-over-primitive closure decision with explicit governance, trust, and integration boundaries.

## Decisions

### D-01 — Adapter Boundary Lock
`@hbc/features-business-development` remains an adapter/composition layer for score-benchmark UX, profile defaults, copy projection, and route/panel composition.

### D-02 — Primitive Ownership Lock
Canonical benchmark computation, confidence/similarity/recommendation semantics, governance controls, recalibration contracts, and decision-quality telemetry remain owned by `@hbc/score-benchmark`.

### D-03 — Confidence/Similarity/Recommendation Governance
Confidence tiers/reasons, similarity banding, and recommendation states are primitive-owned and consumed via public contracts only.

### D-04 — Filter Governance and Anti-Shopping Controls
Default cohort lock, approved cohort constraints, warning thresholds, and immutable governance event capture are primitive-owned and adapter-projected.

### D-05 — Decision-Support UI Contract
Ghost overlay, summary, indicator, filter panel, explainability/similar-pursuits/consensus surfaces are adapter-owned presentations over primitive state.

### D-06 — Offline and Provenance Continuity
Offline queue/replay, sync-state badges, immutable provenance, and snapshot continuity remain aligned to `@hbc/versioned-record` and primitive queue contracts.

### D-07 — Integration Safety
Reference seams for BIC ownership, complexity, related-items, project-canvas, notification-intelligence, health-indicator, AI assist, and SF22 learning signals are compile-safe adapters over public entrypoints only.

### D-08 — AI Guardrail Enforcement
Inline HBI actions require citation visibility, explicit approval, and governed no-bid rationale artifact capture; no autonomous finalization path is allowed.

### D-09 — Boundary Enforcement
No `apps/` imports are permitted in primitive or BD score-benchmark source paths; adapter must not duplicate primitive scoring/governance engines.

### D-10 — Change Control
Breaking contract or ownership changes require a superseding ADR and explicit migration notes for primitive and adapter consumers.

## Companion Primitive ADR

Companion primitive ADR: [ADR-0112 — Score Benchmark Primitive Runtime](/Users/bobbyfetting/hb-intel/docs/architecture/adr/ADR-0112-score-benchmark-primitive-runtime.md).

## Compliance

This ADR is locked and can only be superseded by an explicit follow-up ADR.
