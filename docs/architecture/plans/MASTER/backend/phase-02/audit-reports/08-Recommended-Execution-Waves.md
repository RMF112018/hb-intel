# 08 — Recommended Execution Waves

## Wave 1 — Stabilize the Safety lane and parser authority

### Scope
- prove the live Graph data-plane path
- close the reporting-period `401`
- validate identity / site / list / GUID bindings
- make parser-derived date/inspection-number authoritative
- strengthen preview diagnostics
- preserve Graph ingestion repository as direction of record

### Why first
This is the shortest path from “routes are alive but ingest still fails” to “Safety ingestion is operational and trustworthy.”

### Exit criteria
- preview succeeds with explicit parser-contract diagnostics
- ingest succeeds end-to-end with committed writes
- replay succeeds
- before/after list snapshots show expected deltas
- no Safety ingestion code path depends on SharePoint REST/PnP data-plane calls
- intake context no longer silently overrides parser-critical values

## Wave 2 — Deployment integrity, rollout hardening, and service decomposition

### Scope
- rebuild CI/CD packaging around `backend/functions`
- prove deployed artifact truth
- split public liveness from privileged readiness
- tighten CORS
- document and implement pre-rollout permission tightening
- decompose oversized mixed-authority services

### Why second
The backend can stabilize Safety first, but it cannot be treated as production ready until packaging, public surface hardening, and rollout permission posture are corrected.

### Exit criteria
- deployment pipeline emits backend-only package evidence
- deployed build/version proof is available
- anonymous health is low-disclosure
- rollout permission set is documented and proven
- major Safety/control-plane service boundaries are cleaner and easier to reason about

