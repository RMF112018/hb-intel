# ADR-0111 — Health Indicator Readiness Primitive Runtime

**Status:** Accepted  
**Date:** 2026-03-12  
**Deciders:** HB Intel Architecture Team  
**Supersedes:** None  
**Note:** companion primitive ADR for SF18 closure.

## Context

SF18 required extraction of canonical readiness runtime before T06 closure. The workspace now contains `packages/health-indicator`, and T09 requires explicit governance lock that feature packages consume this runtime through public contracts only.

## Decisions

### D-01 — Canonical Runtime Scope
`@hbc/health-indicator` is the canonical owner for readiness evaluation, profile resolution, and telemetry snapshot runtime.

### D-02 — Public Contract Surface
Primitive exposes stable, import-safe contracts (`IHealthIndicatorCriterion`, `IHealthIndicatorState`, `IHealthIndicatorProfile`, `IHealthIndicatorTelemetry*`) for downstream packages.

### D-03 — Deterministic Evaluation
Primitive evaluation is pure and deterministic for identical inputs and configuration snapshots.

### D-04 — Versioned Configuration Semantics
Resolved profile/config artifacts include immutable governance/version metadata to support audit trails and replay.

### D-05 — Fallback Behavior
Primitive defines deterministic fallback behavior for missing/invalid/partial configuration without non-deterministic branching.

### D-06 — Adapter Consumption Rule
Domain packages (including `@hbc/features-estimating`) consume primitive runtime and may not fork duplicate scoring engines.

### D-07 — Telemetry Shape Governance
Telemetry snapshots/events are primitive-owned and adapter-mapped, preserving stable semantics for KPI consumers.

### D-08 — Integration Safety
Primitive remains side-effect safe and testable through deterministic adapters/mappers for downstream integration layers.

### D-09 — Boundary Enforcement
Package boundaries must reject private import paths (`/src`) and enforce public-entrypoint-only consumption.

### D-10 — Change Control
Breaking runtime/contract changes require an explicit superseding ADR and downstream migration notes.

## Linked Feature ADR

Feature adapter ADR: [ADR-0107 — Estimating Bid Readiness Signal (Adapter over Primitive)](/Users/bobbyfetting/hb-intel/docs/architecture/adr/ADR-0107-estimating-bid-readiness-signal.md).

## Compliance

This ADR is locked and can only be superseded by an explicit follow-up ADR.
