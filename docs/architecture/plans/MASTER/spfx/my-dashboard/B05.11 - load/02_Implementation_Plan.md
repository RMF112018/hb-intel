# 02 — Implementation Plan

## Phase 0 — Repo Truth and Evidence Lock

Run Prompt 00.

Purpose:
- confirm current branch and commit,
- record dirty-tree status,
- confirm B05.8 telemetry baseline and the trace-based KQL correction,
- identify any unrelated pre-existing type/test failures before implementation begins.

No product-code edits in this phase.

---

## Phase 1 — Registry Server-Side Filtering

Run Prompt 01.

### Implementation outcome
Update `loadRegistryRows()` so the Graph request narrows the source set before mapping.

### Required properties
- Filter must enforce:
  - active rows only,
  - current launch-eligible statuses only.
- Mapping and downstream reconciliation stay intact.
- Existing partial/source-unavailable behavior is preserved.

### Expected verification
- Unit tests prove `GraphListClient.listItems` receives the expected registry filter.
- Provider tests prove eligible statuses remain available and excluded statuses are no longer part of the pre-reconcile source set.
- No behavioral regression for final My Projects read-model.

---

## Phase 2 — Registry Cache and Request Coalescing

Run Prompt 02.

### Implementation outcome
Add a worker-local, source-row-level registry cache.

### Required properties
- TTL: 60 seconds.
- Cache successes only.
- Do not cache failures.
- Coalesce in-flight concurrent misses.
- Preserve source result contract and warning semantics.

### Expected verification
- repeated calls inside TTL do not call the loader again,
- concurrent calls share one loader invocation,
- failures are not cached,
- expired cache reloads.

---

## Phase 3 — Graph Metadata Promise Memoization

Run Prompt 03.

### Implementation outcome
Reduce cold-path duplicate Graph metadata calls.

### Required properties
- `resolveSiteId()` coalesces concurrent cold calls.
- list-catalog resolution coalesces concurrent cold calls.
- successful results populate existing caches.
- failed in-flight promises clear for future retries.

### Expected verification
- concurrent site resolution issues one fetch,
- concurrent list catalog resolution issues one fetch,
- failed Promise does not poison subsequent retries.

---

## Phase 4 — Telemetry and KQL Documentation

Run Prompt 04.

### Implementation outcome
Make the new optimization path observable and correct stale query docs.

### Required properties
- telemetry exposes enough detail to prove:
  - filter path used,
  - cache hit/miss/coalesced state,
  - durations still captured.
- docs replace stale `customEvents` query examples with trace-based queries.

### Expected verification
- tests assert diagnostic properties remain primitive/safe,
- docs include corrected KQL blocks,
- no privacy regression.

---

## Phase 5 — Validation, Deployment, Live Evidence

Run Prompt 05.

### Implementation outcome
Close implementation with:
- test/typecheck results,
- backend deploy evidence,
- trace-based KQL capture,
- post-remediation comparison against the baseline.

### Required live evidence
- handler duration summary
- Project Links source timing
- Project Links source + reconcile join
- registry filter/cache telemetry
- warm/repeat request comparison

### Outcome classification
- improved materially,
- improved partially,
- no meaningful improvement,
- correctness regression / rollback needed.

---

## Phase 6 — Fresh Reviewer Audit and Adobe Go/No-Go

Run Prompt 06.

### Implementation outcome
A fresh session audits:
- whether the registry remediation achieved its goal,
- whether the remaining dashboard load complaint is frontend/HAR-driven,
- whether an Adobe refresh-specific optimization package is warranted.

The reviewer must not reopen registry architecture decisions already closed by this package unless runtime evidence directly contradicts them.
