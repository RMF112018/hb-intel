# 05 — Graph-Only Cutover Plan

## Target posture

Move the backend to a **Graph-only application-facing integration surface** for the Safety ingestion lane and associated read/write seams, while distinguishing:

- staging/test stabilization posture
- pre-rollout tightening posture
- production steady-state posture

## A. Current mixed state

The backend currently has:

### Control-plane / provisioning side
- substantial SharePoint/PnP service logic
- site/list/container provisioning and validation
- legacy broader service facade

### Safety ingestion side
- Graph repository and Graph data plane
- app-only token acquisition
- Graph list/file reads and writes
- Graph concurrency and retry handling

### Net effect
The architecture is in transition. Safety ingest is closer to Graph-only than the surrounding service is.

## B. Staging/test cutover posture

### Allowed posture
During stabilization, it is acceptable to:
- use the existing broad Graph permissions already granted
- complete the Graph-only Safety data plane
- prove end-to-end upload → preview → commit → replay behavior
- remove brittle mixed data-plane seams

### Required proofs in staging/test
- reporting-period Graph read succeeds
- upload library Graph write succeeds
- project-week Graph read/create/update succeeds
- inspection event Graph create succeeds
- findings Graph create succeeds
- replay Graph read/download succeeds
- duplicate detection Graph query succeeds
- all required target sites/lists resolve correctly
- deployed artifact version matches source version

### Not yet required in staging/test
- final least-privilege posture
- final selected-scope minimization
- final public-surface hardening if it slows stabilization

## C. Pre-rollout tightening posture

Before rollout, require:

- explicit permission inventory
- mapping of each API call to minimum needed permission
- decision on broad app permissions vs selected scopes
- live proof under intended rollout permission set
- removal of permissions that are merely convenient

## D. Production steady state

### Direction of record
- Graph is the only application-facing Safety data plane
- no Safety ingestion read/write path depends on SharePoint REST/PnP for data-plane execution
- provisioning/control-plane logic is separated from Safety ingest logic
- runtime identity and list/site bindings are provable
- deployment artifact is provable
- permission scope is intentional and documented

## Migration order

### First migrations / closures
1. prove live route uses current Graph code
2. prove Graph list/site binding correctness
3. prove reporting-period Graph read
4. prove full Graph commit chain
5. remove parser-authority ambiguity
6. tighten deployment packaging

### Later closures
7. split `SharePointService`
8. reduce public health disclosure
9. tighten rollout permissions
10. reduce or retire unnecessary PnP/SharePoint seams for the Safety lane

## Seams likely needing redesign, not just API substitution

- the oversized `SharePointService`
- deployment packaging and evidence model
- public readiness/health surface
- parser authority contract between intake UI and backend

