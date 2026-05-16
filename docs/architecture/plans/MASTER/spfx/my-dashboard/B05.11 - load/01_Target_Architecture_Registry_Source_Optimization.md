# 01 — Target Architecture: Registry Source Optimization

## 1. Objective

Define the implementation target for the next My Dashboard backend performance remediation lane.

The architecture must:

- reduce unnecessary registry acquisition work,
- preserve correctness and read-only posture,
- make repeated warm requests cheaper,
- keep telemetry sufficient for proof.

---

## 2. Current State

### Current Project Links path

```text
getMyProjectLinks(context)
  -> normalize actor principal
  -> Promise.all([
       loadProjectsRows(),
       loadRegistryRows()
     ])
  -> reconcileProjectLinks(...)
  -> return MyProjectLinksReadModel
```

### Current registry loader

```text
loadRegistryRows()
  -> GraphListClient.listItems(registryList, {
       select: registrySelectFields,
       top: MAX_SOURCE_ROWS
     })
  -> map every returned row
  -> runtime later ignores:
       inactive rows
       excluded match statuses
```

### Current observed performance
Live telemetry showed:

- 825 registry rows fetched
- 5 matched project rows returned
- 1.0–2.15 seconds spent in registry source load
- 1–32 ms spent in reconcile

---

## 3. Target State

### Target registry acquisition

```text
loadRegistryRows()
  -> shared registry-row cache lookup
       hit -> return cached filtered source rows
       miss -> coalesced load
  -> GraphListClient.listItems(registryList, {
       filter: launchEligibleRegistryFilter,
       select: registrySelectFields,
       top: MAX_SOURCE_ROWS
     })
  -> map only eligible rows
  -> cache successful filtered result for 60 seconds
  -> return source rows
```

### Launch-eligible registry filter

Logical target:

```text
IsActive == true
AND MatchStatus ∈ { matched, unmatched, review-required }
```

The package intentionally does not remove `unmatched` or `review-required` because current reconciliation logic already treats them as registry rows eligible for downstream consideration when role assignments warrant inclusion.

---

## 4. Cache Design

### Cache scope
- Source rows only.
- Shared within the provider/dependency instance.
- Not actor-specific.

### TTL
- 60 seconds.

### Coalescing
- Concurrent requests during an in-flight registry read must join the same Promise.
- A miss during a load is not allowed to launch a second duplicate load.

### Failure behavior
- Never cache thrown/failure result.
- Clear in-flight state on rejection.
- Preserve existing source-unavailable/partial behavior.

### Suggested telemetry additions
Extend runtime telemetry to include:

- `registryCacheState`
  - `miss`
  - `hit`
  - `coalesced`
- `registryCacheAgeMs`
- `registryServerFilterApplied`
- `registryReturnedRowCountBeforeMap` only if available without extra work
- `registryFilterMode = "active-launch-eligible"`

If the implementation can only truthfully emit a subset, it must emit enough to prove:
- whether cache participated,
- whether the server filter path was used.

---

## 5. Graph Metadata Memoization

### Current issue
The current `GraphListClient` persists resolved values after success, but cold concurrent calls can race before cache state is set.

Potential duplicate cold-path work:
- site ID resolution
- list catalog fetch used to populate title → list ID map

### Target
Add Promise-backed in-flight memoization:

```text
resolveSiteId()
  -> cached value?
  -> active promise?
  -> create promise
  -> on success set cached value
  -> on failure clear promise

resolveListId(title)
  -> cached title?
  -> active catalog promise?
  -> create catalog promise
  -> populate map
  -> look up title
  -> on catalog failure clear promise
```

### Non-goals
- No persistent external cache.
- No tenant lookup redesign.
- No Graph API scope changes.

---

## 6. Runtime Boundaries to Preserve

- All reads remain GET/read-model only.
- No writeback to SharePoint.
- No new API endpoints required.
- No change to user-facing read-model DTO unless telemetry contract requires safe diagnostic fields.
- No per-user result caching.
- No attempt to server-filter the registry by role arrays in this package; those fields are serialized multi-line text arrays and the package does not presume safe provider-side filtering for them.

---

## 7. Performance Expectation

This package is considered successful when live telemetry shows:

- `registryRowCount` decreases from the current broad 825-row load, unless runtime truth proves all 825 rows are launch-eligible.
- `registryDurationMs` materially declines from the observed ~1,056–2,150 ms range.
- `getMyWorkProjectLinks` duration materially declines from the observed ~1,067–2,184 ms range.
- correctness remains intact:
  - 5 matched project rows remain 5 in the current observed account
  - source status remains truthful
  - no silent role-assignment regression occurs
