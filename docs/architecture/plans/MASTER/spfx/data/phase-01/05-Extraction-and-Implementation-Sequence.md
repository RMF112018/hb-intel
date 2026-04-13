# 05 — Extraction and Implementation Sequence

## Phase 1 — Extract shared SharePoint platform mechanics
### Goal
Create the new platform package and move only low-level reusable SharePoint mechanics into it.

### Scope
Move or recreate:
- list descriptor base types and endpoint builders
- site/list-host resolution contracts
- request digest helper
- ensure-user helper
- current-user helper
- item meta + ETag helper
- MERGE helper
- normalized fetch/write envelopes
- cache invalidation primitive

### Constraints
- no Kudos workflow logic
- no UI
- preserve current behavior exactly

### Closure condition
Kudos code compiles against the new platform primitives without functional change.

---

## Phase 2 — Rebase Kudos data seams onto the platform layer
### Goal
Rewire the current Kudos readers/writers to depend on the new platform package.

### Scope
Refactor:
- `peopleCultureSubmissionSource.ts`
- `kudosGovernanceWriter.ts`
- `useSharePointPeopleSearch.ts`
- `spContext.ts` consumers as needed

### Constraints
- preserve GUID-based list binding
- preserve canonical host behavior
- preserve cache invalidation after mutation
- preserve audit-event writes and ETag handling

### Closure condition
No low-level digest/ensure-user/MERGE logic remains duplicated in Kudos product files.

---

## Phase 3 — Formalize the Kudos domain-adapter boundary
### Goal
Make the Kudos reader/writer layer explicit and self-contained.

### Scope
Create explicit adapter exports for:
- list reads
- draft submission
- governance actions
- audit timeline reads
- binding validation

### Constraints
- keep `kudosContracts.ts` authoritative for domain typing
- do not create a generic homepage adapter API
- do not absorb local queue/public-orchestration hooks

### Closure condition
Public and companion runtimes consume explicit Kudos adapter contracts instead of reaching across several homepage/data files.

---

## Phase 4 — Rewire webpart-local orchestration
### Goal
Update local hooks and runtimes to consume the formal adapter layer cleanly.

### Scope
Rewire:
- public Kudos hooks
- companion runtime hooks
- any direct low-level imports from local webpart code

### Constraints
- no UX regression
- no workflow-behavior drift
- no archive/visibility drift
- no role/capability drift

### Closure condition
Layer 3 imports are clean and no longer coupled to low-level transport helpers.

---

## Phase 5 — Prove second-consumer platform reuse
### Goal
Demonstrate that the platform layer can serve another homepage list-backed surface without turning into a generic CRUD framework.

### Good candidate
A narrower mechanics-only pilot for Project Spotlight:
- registry-safe endpoint construction
- improved host/data seam discipline
- optional GUID-safe binding upgrade

### Constraints
- prove platform reuse only
- do not force Project Spotlight into a Kudos-shaped adapter
- no persona flattening

### Closure condition
At least one second homepage surface uses the new platform mechanics successfully.

---

## Phase 6 — Closure and validation
### Goal
Prove the extraction is complete, boundary-clean, and hosted-SharePoint safe.

### Closure requirements
- package boundaries clean
- old seam duplicates removed
- tests updated
- hosted runtime validated
- no direct Layer 3 dependency on deprecated low-level mechanics
