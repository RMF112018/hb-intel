# 03 — Comprehensive Target Implementation Architecture

## Architecture Statement

PCC is HB's unified project lifecycle operating layer. It is not a SharePoint file portal, not a departmental workspace family, not an AI chatbot, and not a replacement for Procore, Sage, SharePoint/HB Central, Autodesk, or other source systems.

PCC organizes all project context through approved shell surfaces, governed work centers, workflow modules, role/stage/task lenses, source-lineage-backed project memory, traceability edges, and HBI grounded retrieval.

## Closed Implementation Architecture

### Shell surfaces

The only approved shell surfaces are:

1. `project-home`
2. `team-and-access`
3. `documents`
4. `project-readiness`
5. `approvals`
6. `external-systems`
7. `control-center-settings`
8. `site-health`

No future module may add a new shell route without updating the route taxonomy and passing forbidden-route tests.

### Backend read-model route families

Unified lifecycle features use backend read-model routes, not shell routes:

- `unified-lifecycle`
- `project-memory`
- `project-lenses`
- `project-traceability`
- `warranty-trace`
- `cross-project-knowledge`
- `unified-search`

These routes are GET-only until a future write/persistence gate is explicitly approved.

### Bounded contexts

PCC implementation is divided into bounded contexts:

- Project Home
- Project Readiness
- Project Memory
- Traceability
- HBI Search
- Team & Access
- External Systems
- Documents / Document Control
- Approvals / Checkpoints
- Site Health

Each context must declare ownership, read dependencies, write posture, forbidden behaviors, and source-system boundaries.

### Data families

PCC distinguishes:

- Source-owned records: Procore, Sage, SharePoint/HB Central, Microsoft Graph, Autodesk, Document Crunch, Adobe Sign, Compass/CRM, and other approved systems.
- PCC-native records: workflow states, project memory, lifecycle events, trace edges, knowledge references, audit records, and permission/lens preferences.
- PCC-derived records: readiness signals, summary cards, HBI grounded answers, warranty trace summaries, comparable-project summaries, and cross-project references.

Derived records never become source truth.

### State machines

State transitions are closed and must be implemented exactly as documented in `record_state_machines.json` when future runtime work begins.

No developer may introduce ad hoc statuses without amending the state-machine reference file and related docs.

### Permission and redaction

The permission algorithm is deterministic:

1. Resolve authenticated user.
2. Resolve project access.
3. Resolve source-system access.
4. Resolve persona.
5. Resolve requested lens.
6. Resolve record security classification.
7. Resolve cross-project authorization.
8. Apply reuse blockers.
9. Apply redaction level.
10. Evaluate HBI evidence threshold.
11. Return `full`, `summary-safe`, `masked`, `withheld`, `refusal`, or `degraded`.

### HBI contract

HBI answers are either:

- `grounded`: citation-backed, permission-filtered, source-lineage-present; or
- `refusal`: citation-free, explicit, and using `PccHbiRefusalReason`.

HBI may not render uncited factual answers, source-truth claims, unsupported warranty responsibility conclusions, or cross-project content without authorization.

### Source-system integration

All live source-system integrations are future-gated and backend-mediated. No direct SPFx-to-source-system calls are allowed for Graph, Procore, Sage, Autodesk, Document Crunch, Adobe Sign, or CRM systems.

### Auditability

Sensitive actions require audit events, including record views, redaction, lens switches, HBI queries, citations opened, cross-project searches, warranty recommendations viewed, source links launched, and classification changes.

### Degraded states

Every surface and card must support standard states: loading, empty, source-unavailable, backend-unavailable, missing-config, stale, unauthorized, forbidden, permission-restricted, insufficient-evidence, feature-disabled, and tenant-gate-not-cleared.

### Future module onboarding

All future PCC modules must use the module onboarding template. A module cannot be considered implementation-ready unless it declares ownership, sources, signals, memory contributions, traceability edges, HBI eligibility, security, redaction, audit events, preview posture, live gates, tests, and forbidden behaviors.

## Developer Outcome

After the local agent applies this package, developers should be able to implement future PCC features without guessing:

- which route is allowed;
- which record owns what;
- which source system owns what;
- which state transitions are valid;
- which fields are required;
- which user can see what;
- when HBI must answer or refuse;
- what to log;
- how to test; and
- what live-readiness gates are still blocked.
