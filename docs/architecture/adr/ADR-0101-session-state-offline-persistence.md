# ADR-0101 — Session State Offline Persistence Primitive

**Status:** Accepted
**Date:** 2026-03-10
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** Source spec PH7-SF-12 referenced ADR-0021. Canonical ADR number for SF12 is ADR-0101.

## Context

HB Intel requires offline-safe form and mutation behavior across unreliable field connectivity environments.

## Decisions

### D-01 — IndexedDB Schema
Use `drafts` and `queue` object stores.

### D-02 — Queue Retry Model
Use `retryCount` + `maxRetries` with explicit failure state.

### D-03 — Connectivity States
Expose `online`, `offline`, `degraded` only.

### D-04 — Sync Strategy
PWA Background Sync when available; SPFx polling fallback.

### D-05 — Draft TTL
Draft entries expire and are purged.

### D-06 — Provider Contract
SessionStateProvider owns connectivity, draft, queue, and sync orchestration.

### D-07 — Hook Contract
`useSessionState`, `useDraft<T>`, `useConnectivity` are canonical access points.

### D-08 — Component Constraints
Connectivity components remain app-shell-safe.

### D-09 — Integration Baseline
Reference integrations required for sharepoint-docs, acknowledgment, handoff, and PH9b.

### D-10 — Testing Sub-Path
`@hbc/session-state/testing` exports canonical fixtures and state sets.

## Compliance

This ADR is locked and can be superseded only by an explicit follow-up ADR.
