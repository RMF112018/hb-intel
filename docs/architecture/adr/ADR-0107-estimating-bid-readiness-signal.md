# ADR-0107 — Estimating Bid Readiness Signal (Adapter over Primitive)

**Status:** Accepted  
**Date:** 2026-03-12  
**Deciders:** HB Intel Architecture Team  
**Supersedes:** None

## Context

SF18 implementation completed as `@hbc/features-estimating` and must be locked as an Estimating domain adapter rather than a standalone scoring engine. Earlier scaffolding introduced adapter-level aliases and UI composition, but canonical runtime ownership needed explicit closure.

## Decisions

### D-01 — Adapter Boundary
SF18 is an Estimating adapter and UX composition layer; it does not own canonical scoring runtime.

### D-02 — Primitive Ownership Lock
Canonical evaluation/profile/telemetry runtime ownership is locked to `@hbc/health-indicator`.

### D-03 — Contract Canon
`IHealthIndicator*` contracts are canonical; `IBidReadiness*` aliases are adapter-only compatibility types.

### D-04 — BIC Ownership
Blockers-first criterion ownership and next-action projection integrate through `@hbc/bic-next-move`.

### D-05 — Complexity Policy
Signal, Dashboard, and Checklist disclosure behavior remains governed by `@hbc/complexity`.

### D-06 — Offline Strategy
Offline behavior is locked to service worker caching, IndexedDB persistence via `@hbc/versioned-record`, Background Sync replay, and optimistic indicators.

### D-07 — Inline AI Guardrails
Inline AI assistance requires citation visibility and explicit approval; no autonomous mutation path is allowed.

### D-08 — Deep-Link and Canvas Integration
Deep-link/provenance placement integrates through `@hbc/related-items` and `@hbc/project-canvas` contracts.

### D-09 — KPI Telemetry
SF18 emits the five locked KPI metrics through primitive-aligned telemetry contracts and adapter projections.

### D-10 — Governance Traceability
Version/governance metadata is immutable across checklist/config write paths and remains queryable in admin surfaces.

## Companion Primitive ADR

Companion primitive ADR: [ADR-0111 — Health Indicator Readiness Primitive Runtime](/Users/bobbyfetting/hb-intel/docs/architecture/adr/ADR-0111-health-indicator-readiness-primitive-runtime.md).

## Compliance

This ADR is locked and can only be superseded by an explicit follow-up ADR.
