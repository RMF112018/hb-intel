# README — HB Kudos SharePoint Data Foundation Prompt Package

## What this package does
This package instructs a local code agent to implement a **3-layer SharePoint data architecture** for `apps/hb-webparts` without flattening all homepage webparts into the same generic CRUD implementation.

## Architectural target
### Layer 1 — Shared platform layer
Reusable, UI-free SharePoint mechanics only:
- host/site URL resolution
- canonical list binding
- list registry
- endpoint builders
- request digest retrieval
- request helpers
- ETag / MERGE write conventions
- current-user and ensure-user resolution
- cache invalidation primitives
- normalized result/error envelopes

### Layer 2 — Shared domain-adapter layer
Typed adapters per real content family:
- Kudos
- future homepage content families only where reuse is proven

### Layer 3 — Webpart-local orchestration layer
Webpart-specific hooks, predicates, flows, and view-state logic:
- public kudos orchestration
- companion queue orchestration
- local filters
- detail-panel flows
- UI-specific hydration

## Critical rules
- Do **not** create a giant generic “fetch any list” abstraction.
- Do **not** collapse persona or workflow logic into the platform layer.
- Do **not** promote logic into a shared package unless reuse is proven.
- Do **not** weaken GUID-safe SharePoint bindings.
- Do **not** bypass ETag-safe writes or audit-event guarantees.
- Do **not** leave extraction half-finished; each phase must close its seam completely before moving on.

## Recommended execution order
1. Read `00-Plan-Summary.md`
2. Read `01-Executive-Audit-Report.md`
3. Read `02-Current-State-Architecture-and-Seam-Map.md`
4. Read `03-Decision-Lock.md`
5. Execute the implementation prompts in numeric order
6. Finish with the closure prompt

## Execution discipline for every implementation phase
Every prompt in this package requires:
- exhaustive scrubbing of affected files
- preservation of current runtime behavior unless intentionally changed
- import and boundary cleanup
- validation before phase closure
- explicit proof that the seam is fully closed

## Required verbatim instruction
Every implementation prompt includes this instruction and it must remain intact:

> Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
