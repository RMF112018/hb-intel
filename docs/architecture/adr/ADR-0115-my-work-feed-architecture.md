# ADR-0115 — My Work Feed Architecture

**Status:** Accepted
**Date:** 2026-03-15
**Deciders:** HB Intel Architecture Team
**Supersedes:** None

## Context

SF29 elevates My Work from an earlier hook-level concept to a dedicated shared package (`@hbc/my-work-feed`) owning registry-driven multi-source aggregation, deterministic ranking/dedupe/supersession, explainability, offline resilience, and composite UI surfaces.

## Decisions

### D-01 — Package Ownership Scope
`@hbc/my-work-feed` is the canonical owner for personal work-item aggregation, normalization, count rollups, composite UI surfaces, and feed telemetry contracts across all HB Intel modules.

### D-02 — UI-Kit Boundary Rule
Design-system-grade visual primitives stay in `@hbc/ui-kit`; My Work-specific composite surfaces (badge, tile, panel, feed, team feed, reason drawer) remain package-owned compositions.

### D-03 — Registry-Driven Adapter Model
Source modules register adapters via a central `MyWorkRegistry`; each adapter owns its own data fetching, error handling, and item shaping; the registry is the only coordination point between sources.

### D-04 — Deterministic Ranking
Ranking is deterministic for equivalent inputs: priority lane, overdue status, source urgency, and recency produce a stable numeric score that governs feed order.

### D-05 — Queue Hygiene (Dedupe + Supersession)
Items sharing a `dedupeKey` are merged deterministically with full merge-reason traceability; superseded items are hidden from active feed but retained for audit and reasoning.

### D-06 — Explainability Contract
Every work item carries a `rankingReason` (primary + contributing reasons), `lifecycle` preview, `permissionState`, and optional dedupe/supersession metadata so the UI can answer why-here, why-ranked, can/can't-act, and what-next.

### D-07 — Multi-Surface Count Consistency
Counts are computed once from the normalized item set and are consistent across all surfaces — badge count always equals the sum visible in panel and feed views.

### D-08 — Offline-Safe Feed Strategy
`@hbc/session-state` owns offline cache persistence and replay-safe mutation queue; `@hbc/my-work-feed` does not implement its own IndexedDB layer but surfaces optimistic updates and reconciles on sync completion.

### D-09 — Inline Actions vs Deep-Links
Work items expose typed `availableActions` for inline operations (dismiss, snooze, mark-done) and `context.href` for deep-link navigation; inline actions support offline queueing when `offlineCapable` is true.

### D-10 — Manager/Delegation Projections
Team feed and delegation views project over the same canonical `IMyWorkItem` model; no separate item type exists for manager views; `delegatedBy`/`delegatedTo` fields and owner-scope queries provide the projection.

## Compliance

This ADR is locked and can only be superseded by an explicit follow-up ADR.
