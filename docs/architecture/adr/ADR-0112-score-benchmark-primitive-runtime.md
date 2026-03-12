# ADR-0112 — Score Benchmark Primitive Runtime

**Status:** Accepted  
**Date:** 2026-03-12  
**Deciders:** HB Intel Architecture Team  
**Supersedes:** None  
**Note:** companion primitive ADR for SF19 closure.

## Context

SF19 requires canonical primitive runtime ownership and closure evidence for benchmark trustworthiness, governance controls, recalibration observability, and adapter-safe consumption.

## Decisions

### D-01 — Canonical Runtime Scope
`@hbc/score-benchmark` is the canonical owner for benchmark lifecycle state, confidence, similarity, recommendation, governance, recalibration, and benchmark telemetry contracts.

### D-02 — Public Contract Surface
Primitive publishes stable contracts for scorecard benchmarks, overlay state, governance events, consensus/explainability, telemetry, lifecycle APIs, hooks, and testing entrypoint.

### D-03 — Deterministic Derivation
Win-zone/loss-risk overlap handling, confidence thresholds, recommendation capping, and governance warning triggers are deterministic for equivalent inputs.

### D-04 — Governance Semantics Lock
Filter changes and override/no-bid artifacts are immutable, replay-safe, and provenance-aware through primitive contracts.

### D-05 — Version and Provenance Continuity
Overlay snapshot metadata and sync-state semantics remain aligned to `@hbc/versioned-record` public contracts.

### D-06 — Offline Queue Ownership
Primitive owns mutation queue semantics and replay-safe state transitions; adapters surface status and intent only.

### D-07 — Recalibration and Learning Signal Intake
Primitive consumes published SF22 learning-loop signals via public seam and emits recalibration/predictive-drift contracts without owning domain outcome writes.

### D-08 — Adapter Consumption Rule
Feature adapters may project primitive state into domain UX but must not duplicate primitive benchmark/recommendation/governance engines.

### D-09 — Testing Surface Lock
`@hbc/score-benchmark/testing` is the canonical deterministic fixture seam for primitive and adapter consumers.

### D-10 — Change Control
Breaking runtime/contract changes require a superseding ADR and migration guidance across all adapters.

## Linked Feature ADR

Feature adapter ADR: [ADR-0108 — BD Score Benchmark Ghost Overlay (Adapter over Primitive)](/Users/bobbyfetting/hb-intel/docs/architecture/adr/ADR-0108-bd-score-benchmark-ghost-overlay.md).

## Compliance

This ADR is locked and can only be superseded by an explicit follow-up ADR.
