# 06 — Validation and Test Requirements

## Objective
Prove that the extraction preserved runtime behavior and improved package discipline without breaking hosted SharePoint execution.

## Required test lanes

### 1. Pure unit tests
Add or maintain tests for:
- endpoint builders
- list descriptor resolution
- digest helper
- ensure-user helper
- current-user helper
- ETag/item-meta helper
- MERGE helper
- cache invalidation primitive
- Kudos patch planner
- Kudos field mapping
- audit timeline mapping

### 2. Adapter integration tests
Mock fetch and validate:
- draft submission payloads
- typed-recipient resolution behavior
- governance PATCH plans
- audit-event creation
- cache invalidation after success
- failure handling and result envelopes

### 3. Webpart runtime tests
Keep or add tests for:
- public Kudos runtime
- companion runtime
- local orchestration hooks
- queue/filter derivation
- detail-panel actions
- celebrate flow
- archive/public derivation

### 4. Hosted SharePoint validation
Validate against real hosted behavior:
- `mount.tsx` host-site bootstrap
- canonical `kudosListHostUrl` resolution
- cross-site current-user resolution
- people search request path
- digest retrieval
- ensure-user behavior
- ETag-safe writes
- audit-event writes
- refresh after mutation
- no silent failures when hosted on a different site than the canonical list host

### 5. Regression comparisons
Before/after comparisons must confirm:
- same public items show
- same archive behavior
- same companion queue behavior
- same approval/reject/revision/remove/restore flows
- same role/capability behavior
- same scheduled/prominence behavior
- same celebrate behavior

## Mandatory validation artifacts
The code agent must produce:
- changed-file inventory
- boundary map after extraction
- test results
- unresolved issues list, if any
- explicit statement of whether old low-level seams were fully removed

## Mandatory failure gates
Do not close the work if any of the following remain true:
- webpart-local code still depends on deprecated low-level helpers
- list binding regressed to title-based routing
- writes can occur without ETag protection where previously protected
- audit-event write path is no longer coupled to governance actions
- old and new helpers both coexist for the same mechanic
- hosted SharePoint path was not validated
