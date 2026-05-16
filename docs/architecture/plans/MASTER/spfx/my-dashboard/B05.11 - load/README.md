# HB My Dashboard — Project Links Registry Performance Remediation Package

## Objective

This package converts the live B05.8 telemetry findings into a focused implementation sequence for the local code agent.

The package is intentionally **not** a broad My Dashboard refactor. It targets the now-proven backend bottleneck:

1. **Primary remediation lane — My Projects / Project Links**
   - The `Legacy Project Fallback Registry` source load is the dominant `getMyWorkProjectLinks` latency owner.
   - Reconcile work is negligible and must not be mistaken for the optimization target.

2. **Secondary observation lane — Adobe Sign**
   - Adobe `/home` latency is materially higher when token refresh is required.
   - This package **does not** modify the Adobe pipeline. It preserves the finding and gates any future Adobe optimization behind post-registry evidence.

3. **Evidence lane — telemetry and query hygiene**
   - Live Azure Logs proved the repository emits custom telemetry through `traces` JSON payloads, not native `customEvents`.
   - The package requires corrected trace-based KQL documentation and post-remediation measurement.

---

## Live Telemetry Basis

### A. Project Links
Observed live query output showed:

| Runtime area | Observed values |
|---|---:|
| `getMyWorkProjectLinks` handler | ~1,067 ms, ~1,179 ms, ~2,184 ms |
| Projects source load | ~291 ms, ~304 ms, ~930 ms |
| Registry source load | ~1,056 ms, ~1,177 ms, ~2,150 ms |
| Reconcile | ~1 ms, ~2 ms, ~32 ms |
| Projects source rows | 3 |
| Registry source rows | 825 |
| Matched My Projects items | 5 |

### B. Adobe Sign
Observed live query output showed:

| Runtime area | Observed values |
|---|---:|
| `/home` total / Adobe action queue overall | ~424 ms, ~746 ms, ~1,451 ms |
| Refresh-required slow run | principal 470 ms / token 715 ms / refresh 655 ms / search 264 ms |
| No-refresh runs | search ~354–366 ms; total ~424–746 ms |

### Interpretation

- **Project Links registry loading is the immediate remediation target.**
- **Reconcile is not worth optimizing.**
- **Adobe Sign should be reassessed after the registry lane is remediated and HAR evidence is captured.**

---

## Package Structure

```text
README.md
00_Remediation_Basis_And_Closed_Decisions.md
01_Target_Architecture_Registry_Source_Optimization.md
02_Implementation_Plan.md
03_Validation_Matrix_And_Acceptance_Criteria.md
04_Risk_Exposure_And_Rollback.md

supporting/
  Corrected_Trace_Based_KQL_Queries.md
  Live_Telemetry_Baseline.md
  Repo_Truth_Seam_Map.md
  Evidence_Capture_Checklist.md
  Commit_And_Closeout_Template.md

prompts/
  Prompt_00_Repo_Truth_And_Live_Evidence_Scope_Lock.md
  Prompt_01_Implement_Registry_Server_Filtering.md
  Prompt_02_Implement_Registry_Source_Cache_And_Request_Coalescing.md
  Prompt_03_Promise_Memoize_Graph_Metadata_Resolution.md
  Prompt_04_Extend_Runtime_Telemetry_And_Correct_KQL_Docs.md
  Prompt_05_Validation_Deployment_Evidence_And_Closeout.md
  Prompt_06_Fresh_Reviewer_Audit_And_Adobe_Follow_On_Go_No_Go.md
```

---

## Closed Implementation Decisions

1. **Do not optimize reconcile logic.**
   - Live reconcile timing is already negligible.

2. **Do not modify the Adobe Sign runtime path in this package.**
   - Preserve it as a measured secondary lane only.

3. **Do not touch SPFx/My Dashboard frontend code unless Prompt 04 proves a documentation-only correction is not enough.**
   - The package is backend/read-model focused.

4. **Apply server-side registry source narrowing first.**
   - Use the registry fields already treated as runtime eligibility gates:
     - `IsActive`
     - `MatchStatus`
   - Target only rows eligible for downstream inclusion:
     - active rows
     - `matched`, `unmatched`, or `review-required`

5. **Add filtered registry-row caching with bounded staleness.**
   - Cache only the **shared registry source rows**, not per-user rendered results.
   - Use an in-process, request-coalesced TTL cache.
   - Default TTL: **60 seconds**.
   - Do not cache failures.

6. **Add in-flight Graph metadata request memoization.**
   - Coalesce cold-path duplicate:
     - site ID resolution
     - list catalog resolution
   - Clear in-flight promises on failure so retries remain possible.

7. **Preserve correctness and source-of-record boundaries.**
   - No tenant mutation.
   - No external writebacks.
   - No secrets, app settings, package, lockfile, manifest, workflow, or deployment changes unless explicitly instructed in Prompt 05 for deployment/evidence recording only.

8. **Correct KQL docs from `customEvents` to `traces`.**
   - Live Azure Logs proved the current repo logger emits JSON custom-event envelopes through traces.

---

## Recommended Execution Order

1. Prompt 00 — lock repo truth and baseline evidence.
2. Prompt 01 — add registry server-side filtering.
3. Prompt 02 — add registry shared-source cache + request coalescing.
4. Prompt 03 — memoize Graph metadata fetches.
5. Prompt 04 — extend telemetry and correct KQL docs.
6. Prompt 05 — validate, deploy backend, run KQL, document results.
7. Prompt 06 — fresh reviewer audit and decide whether an Adobe-specific follow-on package is justified.

---

## Expected Outcome

After implementation and backend redeployment:

- `registryRowCount` should fall below the current broad `825` row load unless the registry is entirely eligible by contract.
- `registryDurationMs` should materially decline from the current ~1.0–2.15 second range.
- `getMyWorkProjectLinks` should materially decline from the current ~1.07–2.18 second range.
- Reconcile should remain functionally unchanged and still negligible.
- Corrected KQL queries should return telemetry from `traces`.
- The next performance package should be evidence-led, not speculative.
