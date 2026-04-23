# 07 — Prioritized Remediation Plan

## Priority 1 — Replace the failing Safety data plane
### Gap closed
- REST-only Safety repository
- first reporting-period read failing with 401
- split control-plane / data-plane auth model

### Direction
Implement a Graph-native Safety repository and cut `SharePointService.ingestSafetyWorkbook()` over to it.

### Impact
This is the shortest path from “provisioning works / ingest fails” to authoritative writes.

### Timing
Implement now.

### Type
Structural redesign at the repository seam.

## Priority 2 — Adopt parse-first workbook authority
### Gap closed
- parser ignores `ParserMeta`
- parser ignores named ranges
- no contract-version validation
- key findings extraction stale

### Direction
Upgrade the workbook abstraction and parser pipeline so it can:
- read hidden-sheet targets,
- resolve named ranges,
- validate template identity and parser contract version,
- and prefer parser-support targets over visible-cell assumptions.

### Impact
Reduces parser brittleness and improves operator diagnostics.

### Timing
Implement now, in the same wave as the data-plane fix.

### Type
Structural refinement with some contract redesign.

## Priority 3 — Add preview/validation-before-commit
### Gap closed
- commit attempted before a dedicated preview/validation contract
- weak operator feedback on incompatible templates and parse issues

### Direction
Split ingest into:
- preview/validation response,
- explicit commit step or commit-ready branch in the same API contract.

### Impact
Improves safety, supportability, and trust.

### Timing
Implement now if scope remains bounded; otherwise very early in Wave 2.

### Type
Behavioral/API refinement.

## Priority 4 — Make Safety authorization explicit
### Gap closed
- ingestion route protected only by delegated scope
- no dedicated writer role/policy boundary

### Direction
Introduce explicit authorization for Safety writes:
- a dedicated app role,
- group-based policy,
- or another product-appropriate privileged-access boundary.

### Impact
Improves backend exposure posture.

### Timing
Early Wave 2 if it would slow the repository cutover.

### Type
Security refinement.

## Priority 5 — Encode Graph-cutover staging/test acceptance criteria
### Gap closed
- no formal proof standard for declaring the cutover successful

### Direction
Require proof for:
- no remaining REST data-plane calls in ingestion,
- successful Graph-based read/write/upload flow,
- list deltas,
- correlation logs,
- and replay/idempotency behavior.

### Impact
Prevents partial or ambiguous closure.

### Timing
Now.

### Type
Execution-governance refinement.

## Priority 6 — Tighten permissions before rollout
### Gap closed
- broad permissions acceptable in staging/test but not yet constrained for rollout

### Direction
Inventory the actual Graph permissions used by the final design and reduce to the least privileged selected-scope or site-scoped posture that still supports the workflow.

### Impact
Critical for production governance.

### Timing
Wave 2 before rollout.

### Type
Security/governance refinement.

## Priority 7 — Strengthen data-plane telemetry and retry discipline
### Gap closed
- incomplete commit-stage telemetry
- no Graph throttling/backoff implementation in the final target lane

### Direction
Add structured events for:
- parse stages,
- repository read/write stages,
- throttling/backoff,
- duplicate suppression decisions,
- and final commit outcomes.

### Impact
Improves production diagnostics materially.

### Timing
Wave 2.

### Type
Operational hardening.

## Priority 8 — Strengthen release-integrity proof
### Gap closed
- insufficient proof that the deployed artifact and host composition match source intent

### Direction
Add build/deploy checks that prove:
- host composition root used,
- registered routes,
- package contents,
- and deployment artifact identity.

### Impact
Reduces future “routes exist locally but not live” regressions.

### Timing
Wave 2.

### Type
Operational hardening.
