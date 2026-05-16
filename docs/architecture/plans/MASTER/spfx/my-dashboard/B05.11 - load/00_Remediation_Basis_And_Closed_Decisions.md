# 00 — Remediation Basis and Closed Decisions

## 1. Executive Assessment

The B05.8 remediation package successfully fixed the **frontend sequencing defect** and added enough backend instrumentation to identify the next true bottleneck.

The next bottleneck is now proven:

> **My Projects `Legacy Project Fallback Registry` source loading dominates `getMyWorkProjectLinks` runtime.**

The proof comes from live Azure Logs:

- Registry load: ~1,056 ms, ~1,177 ms, ~2,150 ms.
- Project Links handler: ~1,067 ms, ~1,179 ms, ~2,184 ms.
- Reconcile: ~1–32 ms only.
- Registry row count: 825 rows every request.
- Final assigned project output: 5 rows.

This is a classic signal that the backend is doing too much source acquisition work relative to the business payload it ultimately returns.

---

## 2. Repo-Truth Basis

### Current registry acquisition seam

The current registry loader:

- calls `graph.listItems(LEGACY_FALLBACK_REGISTRY_LIST_TITLE, { select, top })`
- does **not** apply a server-side filter
- maps every returned registry row
- later filters rows in application logic during reconciliation

That means runtime excludes rows **after** acquisition, not before acquisition.

### Current telemetry seam

The read-model provider now emits:

- `myProjectLinks.read.sources.result`
- `myProjectLinks.read.reconcile.result`

This was essential: it proves the registry loader, not reconcile, is the actual target.

### Current registry schema seam

The schema reference identifies registry fields already relevant to eligibility and already documented as indexed:

- `MatchStatus`
- `IsActive`

The same schema document explicitly states these should be used as filter keys to avoid broad review queries.

---

## 3. Closed Decisions

### Decision 1 — Primary target is registry source acquisition
No other backend lane receives first-pass remediation priority.

### Decision 2 — Server-side registry narrowing is mandatory
The first implementation pass must reduce acquisition breadth before considering heavier architecture.

The target predicate is:

```text
IsActive == true
AND MatchStatus in { matched, unmatched, review-required }
```

The local agent must encode this predicate using the existing Graph list filter surface. If the exact string requires syntax adjustment for Graph compatibility, the logical predicate may be represented in the equivalent supported form, but the target row universe may not broaden.

### Decision 3 — Shared registry source caching is mandatory
A short-lived, request-coalesced in-process cache must be introduced around the **filtered registry source rows**.

Defaults:

- TTL: **60 seconds**
- cache scope: backend worker memory only
- cache failures: **never**
- per-user result caching: **not allowed in this package**

### Decision 4 — Graph metadata fan-out should be coalesced
The `GraphListClient` has durable caches after resolution, but no in-flight request coalescing. On cold concurrent reads, site resolution and list-catalog work can race and duplicate.

This package requires promise memoization for:

- `resolveSiteId()`
- list catalog resolution used by `resolveListId(...)`

### Decision 5 — No Adobe runtime changes in this package
Adobe latency is real, especially refresh-path latency, but this package remains focused. Adobe is the next likely package only if:

- registry remediation lands,
- live telemetry improves Project Links materially,
- overall dashboard UX still has a material backend home-route issue,
- and HAR/browser evidence supports further action.

### Decision 6 — KQL docs must be corrected
The package documents the repo’s telemetry truth:

- runtime custom-event envelopes are emitted through `context.log(...)`
- Azure Logs ingests them under `traces`
- queries must parse `message` JSON

Any packaged KQL examples that still query `customEvents` are stale and must be patched.

---

## 4. Explicitly Out of Scope

- Tenant schema mutation
- SharePoint list provisioning changes
- New external integrations
- Package version bumps
- SPPKG rebuild/deploy
- Azure Function hosting-plan changes
- Function App app-setting changes
- Authentication or secrets changes
- Reconcile algorithm redesign
- Adobe token-refresh optimization
- UI changes unrelated to documentation/evidence closeout

---

## 5. Expected Net Effect

The intended backend critical path after remediation is:

```text
Filtered registry load
  + optional warm cache hit
  + existing tiny reconcile step
```

rather than:

```text
Broad registry load of 825 source rows
  + post-fetch discard of non-eligible rows
  + tiny reconcile step
```

The package expects a measurable reduction in:

- `registryDurationMs`
- `getMyWorkProjectLinks` handler duration

while preserving:

- assigned project correctness
- dual-launch readiness
- source-status semantics
- partial/unavailable warning logic
