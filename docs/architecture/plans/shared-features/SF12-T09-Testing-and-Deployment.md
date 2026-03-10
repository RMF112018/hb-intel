# SF12-T09 — Testing and Deployment: `@hbc/session-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-12-Shared-Feature-Session-State.md`
**Decisions Applied:** All D-01 through D-10
**Estimated Effort:** 0.4 sprint-weeks
**Depends On:** T01–T08

> **Doc Classification:** Canonical Normative Plan — SF12-T09 testing/deployment task; sub-plan of `SF12-Session-State.md`.

---

## Objective

Finalize `@hbc/session-state` with full test/deployment gates and publish all required documentation deliverables using SF11-T09 documentation rigor (ADR template, adoption guide, API reference, package README conformance, ADR index update, blueprint progress comment, and current-state-map updates).

---

## 3-Line Plan

1. Complete all tests for stores/sync/provider/components, including offline→online reconnect behavior.
2. Run all mechanical enforcement gates with ≥95% coverage and zero type/build/lint/boundary failures.
3. Publish ADR-0101 and required docs, including `current-state-map.md` and ADR index updates.

---

## Pre-Deployment Checklist (30 items)

### Architecture & Boundary Verification

- [ ] `@hbc/session-state` has zero imports of `packages/features/*`
- [ ] `@hbc/session-state` has zero imports of `@hbc/versioned-record`
- [ ] `@hbc/session-state` has zero imports of `@hbc/bic-next-move`
- [ ] `@hbc/session-state` has zero runtime hard dependency on service worker in SPFx paths
- [ ] app-shell-safe component constraints validated
- [ ] boundary grep checks return zero prohibited matches

### Type Safety

- [ ] zero TypeScript errors: `pnpm --filter @hbc/session-state check-types`
- [ ] `ISessionStateContext` contract enforced across provider/hooks
- [ ] `IQueuedOperation` lifecycle fields enforced in queue store and sync engine
- [ ] `useDraft<T>` remains strongly typed end-to-end

### Build & Package

- [ ] package build succeeds: `pnpm --filter @hbc/session-state build`
- [ ] both entry points emitted (`./` and `./testing`)
- [ ] testing sub-path excluded from production bundle
- [ ] package exports resolve in consuming modules
- [ ] turbo build with related packages succeeds

### Tests

- [ ] all tests pass: `pnpm --filter @hbc/session-state test`
- [ ] coverage thresholds met (lines/branches/functions/statements ≥95)
- [ ] draft TTL expiry and purge tested
- [ ] queue retry/max-retry behavior tested
- [ ] sync reconnect flow tested
- [ ] provider/hooks/component behavior matrix tested

### Storage/API (IndexedDB + Sync)

- [ ] IndexedDB schema created with `drafts` and `queue` stores
- [ ] `drafts.expiresAt` and queue indexes validated
- [ ] storage unavailability fallback path validated
- [ ] sync backoff behavior validated

### Integration

- [ ] sharepoint-docs upload queue reference integration validated
- [ ] acknowledgment offline queue reference integration validated
- [ ] PH9b useFormDraft reference integration validated
- [ ] workflow-handoff draft persistence reference integration validated

### Documentation

- [ ] `docs/architecture/adr/ADR-0101-session-state-offline-persistence.md` written and accepted
- [ ] `docs/how-to/developer/session-state-adoption-guide.md` written
- [ ] `docs/reference/session-state/api.md` written
- [ ] `packages/session-state/README.md` conformance verified
- [ ] `docs/README.md` ADR index updated with ADR-0101 entry
- [ ] `current-state-map.md §2` updated with SF12 and ADR-0101 linkage

---

## ADR-0101: Session State Offline Persistence Primitive

**File:** `docs/architecture/adr/ADR-0101-session-state-offline-persistence.md`

```markdown
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
```

---

## Developer Adoption Guide

**File:** `docs/how-to/developer/session-state-adoption-guide.md`

Required sections:

1. When to use session-state in modules
2. Provider setup in app root/SPFx shell
3. Using `useDraft<T>` for form persistence
4. Queueing operations with `queueOperation`
5. Handling reconnect sync UX
6. Using testing fixtures from `@hbc/session-state/testing`

---

## API Reference

**File:** `docs/reference/session-state/api.md`

Must include export table entries for:

- `ConnectivityStatus`
- `QueuedOperationType`
- `IQueuedOperation`
- `IDraftEntry`
- `ISessionStateContext`
- `useSessionState`
- `useDraft<T>`
- `useConnectivity`
- `SessionStateProvider`
- `HbcConnectivityBar`
- `HbcSyncStatusBadge`
- testing exports (`createMockQueuedOperation`, `createMockDraftEntry`, `createMockSessionContext`, `mockConnectivityStates`)

---

## Package README Conformance

**File:** `packages/session-state/README.md`

Verify README contains:

- purpose and offline model overview
- quick start setup
- connectivity and queue behavior summary
- draft TTL and purge notes
- exports table
- architecture boundary rules
- links to SF12 master plan, T09, ADR-0101, adoption guide, API reference

---

## ADR Index Update

**File:** `docs/README.md`

Append ADR row:

```markdown
| [ADR-0101](architecture/adr/ADR-0101-session-state-offline-persistence.md) | Session State Offline Persistence Primitive | Accepted | 2026-03-10 |
```

---

## current-state-map Update Requirement

**File:** `docs/architecture/blueprint/current-state-map.md`

At implementation closure, update §2 with:

- SF12 shared-feature plans row
- ADR-0101 row linkage
- optional doc rows if authored in same pass:
  - `docs/how-to/developer/session-state-adoption-guide.md`
  - `docs/reference/session-state/api.md`
- update next unreserved ADR number after ADR-0101 allocation

---

## Final Verification Commands

```bash
# Mechanical enforcement gates
pnpm turbo run build --filter @hbc/session-state...
pnpm turbo run lint --filter @hbc/session-state...
pnpm --filter @hbc/session-state check-types
pnpm --filter @hbc/session-state test --coverage

# Boundary checks
grep -r "from 'packages/features/" packages/session-state/src/
grep -r "from '@hbc/versioned-record'" packages/session-state/src/
grep -r "from '@hbc/bic-next-move'" packages/session-state/src/

# Documentation checks
test -f docs/architecture/adr/ADR-0101-session-state-offline-persistence.md
test -f docs/how-to/developer/session-state-adoption-guide.md
test -f docs/reference/session-state/api.md
test -f packages/session-state/README.md
```

---

## Blueprint Progress Comment

Append to `SF12-Session-State.md` after all gates pass:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF12 completed: {DATE}
T01–T09 implemented.
All four mechanical enforcement gates passed.
ADR created: docs/architecture/adr/ADR-0101-session-state-offline-persistence.md
Documentation added:
  - docs/how-to/developer/session-state-adoption-guide.md
  - docs/reference/session-state/api.md
  - packages/session-state/README.md
docs/README.md ADR index updated: ADR-0101 row appended.
current-state-map.md §2 updated with SF12 and ADR-0101 rows.
-->
```
