# 03 — Validation Matrix and Acceptance Criteria

## A. Static / Repo-Level Acceptance

| Area | Acceptance |
|---|---|
| Registry query narrowing | `loadRegistryRows()` uses a server-side filter expressing active + launch-eligible statuses. |
| Registry cache | Source-row cache exists, success-only, 60s TTL, request-coalesced. |
| Metadata memoization | Site ID and list-catalog cold-path resolutions are promise-coalesced. |
| Reconcile correctness | Reconcile logic is not substantively changed. |
| Adobe runtime | No Adobe token/search pipeline edits in this package. |
| Query docs | Stale `customEvents` examples are replaced by `traces` + `parse_json(message)` queries. |
| Guardrails | No tenant mutation, no package/manifest/lockfile/deployment drift in implementation prompts. |

---

## B. Test Acceptance

### Required package-level commands

```bash
git diff --check
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions check-types
```

If package work updates docs only in Prompt 04, the backend test commands still run because the docs explain backend runtime behavior and the package’s implementation depends on those lanes.

### Prompt-specific expectations

| Prompt | Minimum proof |
|---|---|
| Prompt 01 | Filter string/logic unit coverage and provider behavior coverage. |
| Prompt 02 | Cache hit, miss, coalesced, expired, failure-not-cached tests. |
| Prompt 03 | In-flight promise coalescing tests for site/list metadata. |
| Prompt 04 | Telemetry property shape tests + doc query replacement proof. |
| Prompt 05 | Full test/typecheck results plus deployment/evidence capture. |

---

## C. Live Telemetry Acceptance

### Required comparative baseline

Use the previously observed live baseline:

| Metric | Baseline |
|---|---:|
| Registry duration | ~1,056–2,150 ms |
| Project Links handler | ~1,067–2,184 ms |
| Registry row count | 825 |
| Reconcile | ~1–32 ms |
| Matched output | 5 rows |

### Target classification

| Result | Classification |
|---|---|
| Registry rows materially reduced and handler duration materially reduced | Strong success |
| Registry rows reduced but duration only slightly reduced | Partial success; investigate Graph metadata/network overhead |
| Registry rows unchanged because all 825 are eligible | Predicate safe but structural data state blocks reduction; investigate cache + next architecture |
| Handler unchanged despite row reduction | Cold path / metadata overhead likely dominant |
| Matched project correctness changes unexpectedly | Regression; stop and remediate before further optimization |

---

## D. Evidence Capture Requirements

The closeout must include:

1. Before/after values for:
   - `registryDurationMs`
   - `registryRowCount`
   - `getMyWorkProjectLinks` handler duration
   - `reconcileDurationMs`

2. At least:
   - one cold request,
   - one warm/repeat request inside cache TTL,
   - one request after cache expiry if practical.

3. Cache telemetry confirmation:
   - hit,
   - miss,
   - coalesced only where a concurrency test proves it.

4. Query source:
   - trace-based KQL, not `customEvents`.

---

## E. Non-Negotiable Correctness Checks

- `assignedProjectCount` remains correct.
- `matchedItemCount` remains correct.
- `dualLaunchReadyCount`, `sharePointReadyCount`, and `procoreReadyCount` do not regress without a legitimate data-source reason.
- Warnings and source statuses stay truthful.
- Principal-unresolved branch still avoids doing unnecessary source work.
