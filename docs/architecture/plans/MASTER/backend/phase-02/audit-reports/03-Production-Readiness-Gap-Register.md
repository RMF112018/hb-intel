# 03 — Production-Readiness Gap Register

## G-01 — Deployment artifact truth is not yet trustworthy
**Severity:** Critical  
**Type:** Structural blocker

### Gap
The deployment workflow packages from repository root instead of a tightly scoped backend package, creating a real risk of artifact/runtime drift.

### Why it matters
This is the fastest credible explanation for the mismatch between current source and live behavior.

### Required closure
- backend-only package build
- explicit artifact manifest
- post-deploy route/version proof

## G-02 — Safety ingestion service boundary is still too mixed
**Severity:** High  
**Type:** Structural weakness

### Gap
`SharePointService` still combines:
- provisioning
- PnP/SharePoint seams
- Safety preview
- Safety ingest orchestration
- Safety replay
- readiness/config logic

### Why it matters
This weakens maintainability, obscures cutover truth, and makes production troubleshooting harder.

### Required closure
Split Safety ingestion orchestration from provisioning/control-plane concerns.

## G-03 — Live reporting-period `401` root cause is not yet proven
**Severity:** Critical  
**Type:** Immediate blocker

### Gap
Live evidence says reporting-period access still fails with `401`, while source on `main` points to Graph-based reporting-period access.

### Why it matters
Until the team can prove whether this is:
- deployment drift
- Graph permission drift
- site/list binding drift
- or another runtime mismatch

the backend cannot be considered operationally trustworthy.

### Required closure
Add runtime-proof diagnostics and deployment-proof evidence, then replay the ingestion path.

## G-04 — Graph-only cutover is incomplete at the broader backend seam
**Severity:** High  
**Type:** Strategic blocker

### Gap
The ingestion lane is mostly Graph-based, but the broader service still carries SharePoint/PnP seams and mixed assumptions.

### Why it matters
Production-ready architecture requires one dominant data-plane model per lane.

### Required closure
Make Graph-only the direction of record for Safety data-plane operations and retire residual mixed seams.

## G-05 — Parser authority is incomplete
**Severity:** High  
**Type:** Correctness blocker

### Gap
Preview logic still lets caller-provided `inspectionDate` / `inspectionNumber` override parsed workbook values.

### Why it matters
This conflicts with the parse-first workbook contract and weakens backend authority.

### Required closure
Promote parser-derived values to authority, or fail when intake metadata conflicts with workbook-derived values.

## G-06 — Workbook contract diagnostics need stronger operational shape
**Severity:** Medium  
**Type:** Refinement

### Gap
The parser contract exists, but production diagnostics should more explicitly tell operators whether failure came from:
- missing parser markers
- wrong contract version
- incomplete reporting-period derivation markers
- key findings seam absence
- invalid date / invalid inspection number

### Required closure
Return explicit preview diagnostics and conflict/mismatch categories.

## G-07 — Public health route is too revealing
**Severity:** High  
**Type:** Security / ops hardening

### Gap
Anonymous health output includes detailed readiness, permission posture, and config-state disclosures.

### Why it matters
This is more information exposure than a public anonymous route should provide.

### Required closure
Split public liveness from privileged readiness diagnostics.

## G-08 — CORS posture is too loose for a production admin backend
**Severity:** Medium  
**Type:** Security hardening

### Gap
Current host-level CORS posture is broader than ideal for credentialed admin traffic.

### Why it matters
Credentialed browser traffic should be limited to exact trusted origins.

### Required closure
Move to exact-origin production control and validate where CORS is actually enforced.

## G-09 — Safety permission posture is staging-friendly but not rollout-complete
**Severity:** High  
**Type:** Rollout blocker

### Gap
Broad Graph permissions are acceptable for staging stabilization, but rollout still needs least-privilege proof.

### Why it matters
A staging convenience posture is not a production security posture.

### Required closure
Document exact required permissions, then tighten and prove them.

## G-10 — Deployment observability is underpowered
**Severity:** Medium  
**Type:** Operability gap

### Gap
The system still lacks a strong artifact/version/deployed-build trail tied to route proof.

### Why it matters
Without that, future “repo truth vs live truth” mismatches will recur.

### Required closure
Add version stamping, artifact manifesting, and deployment evidence capture.

## G-11 — Remaining legacy SharePoint/PnP seams increase future drift risk
**Severity:** Medium  
**Type:** Maintainability gap

### Gap
The backend still includes significant SharePoint/PnP service logic alongside the Graph Safety path.

### Why it matters
Even if not on the current hot path, it keeps the architecture mixed and easier to regress.

### Required closure
Separate by domain and explicitly mark which seams are control-plane only versus retired for Safety ingestion.

