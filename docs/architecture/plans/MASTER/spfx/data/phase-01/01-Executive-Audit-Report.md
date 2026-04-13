# 01 — Executive Audit Report

## Objective
Assess the live HB Kudos data architecture on the `main` branch of `RMF112018/hb-intel` and determine how to convert it into a durable 3-layer SharePoint data model for `apps/hb-webparts`.

## Executive conclusion
The live repo is **partially ready** for the target architecture.

It already has:
- strong typed Kudos contracts,
- GUID-safe SharePoint binding for the People & Culture / Kudos lists,
- explicit writer seams for submission and governance actions,
- explicit audit-event persistence,
- local public and companion orchestration hooks.

It is **not yet cleanly layered** because:
- host/bootstrap concerns are mixed into app-local singleton helpers,
- request-digest and user-resolution mechanics live inside a Kudos submission module,
- the governance writer reaches across multiple data modules for low-level mechanics,
- some public and companion hooks still depend directly on low-level writer functions,
- the existing shared homepage data folder is acting as both infrastructure and product code.

## Current-state architecture in plain terms
### What is already strong
- `peopleCultureSpListRegistry.ts` is a strong infrastructure seam.
- `peopleCultureListSource.ts` is a strong typed list-reader / mapper seam.
- `peopleCultureSubmissionSource.ts` is a strong submission-writer candidate, but contains low-level mechanics that should be split out.
- `kudosGovernanceWriter.ts` is a strong domain writer, especially its patch planner, ETag handling, and audit-event coupling.
- `kudosContracts.ts` provides a strong domain contract layer with explicit workflow, prominence, recipient, audit, and visibility semantics.

### What is weak or mixed
- `spContext.ts` combines:
  - mount-time site storage,
  - canonical cross-site host policy,
  - current-user resolution,
  - singleton cache behavior.
- `useSharePointPeopleSearch.ts` reuses `fetchRequestDigest()` from the submission source instead of a neutral platform utility.
- `kudosGovernanceWriter.ts` depends on low-level mechanics from other product-facing modules rather than a platform package.
- public and companion orchestration hooks still call low-level writers directly.

## Key findings by required analysis question

### 1. What is the current real architecture of the Kudos data layer?
A de facto three-part structure already exists:
- low-level SharePoint access and mapping in `src/homepage/data/*`,
- domain contracts/helpers in `src/homepage/webparts/*` and `src/homepage/helpers/*`,
- webpart-local orchestration in `src/webparts/hbKudos/*` and `src/webparts/hbKudosCompanion/*`.

The issue is not absence of structure. The issue is **boundary discipline**.

### 2. Which seams are mature enough to become shared platform infrastructure?
Promoteable now:
- list registry + endpoint builders
- host/list-host resolution
- request digest retrieval
- ensure-user resolution
- current-user resolution
- ETag-safe item meta lookup + MERGE write helper
- cache invalidation store/publisher
- normalized fetch/write result envelopes

### 3. Which seams are domain-specific and must remain local to Kudos?
Keep in Kudos:
- workflow transition semantics
- archive/public visibility rules
- age-off and prominence logic
- admin-review rules
- role/capability policy
- companion queue derivation and bulk approval state machine
- public featured/recent/archive selection
- recipient photo hydration

### 4. What package boundary is appropriate for the shared platform layer?
A new real workspace package under `packages/`, not another local app folder.
Recommended intent:
- `packages/sharepoint-data` or similarly explicit package name
- UI-free
- SPFx/SharePoint-runtime aware
- consumed by `apps/hb-webparts`

### 5. What package boundary is appropriate for shared domain adapters?
Do **not** immediately create a giant multi-domain homepage adapter package.
Start with:
- a Kudos-specific adapter boundary still close to `apps/hb-webparts`, or
- a narrowly scoped adapter package only after the platform layer is extracted and a second consumer proves the pattern.

### 6. What should remain inside `apps/hb-webparts`?
Everything orchestration-heavy and persona-specific:
- `useKudosComposer`
- `usePublicKudosData`
- `useCelebrateAction`
- companion runtime hooks
- public and companion UI composition
- domain-specific filters, selectors, and queue logic

### 7. What refactor sequence minimizes risk?
1. extract platform primitives with behavior parity,
2. rewire Kudos readers/writers onto platform,
3. formalize Kudos domain adapter exports,
4. rewire public/companion local hooks onto adapter contracts,
5. prove second-consumer reuse with a non-Kudos homepage list seam,
6. close with hosted SharePoint validation.

### 8. What test/validation strategy is required?
- pure unit tests for extracted mechanics
- reader/writer integration tests with mocked fetch
- hosted runtime tests for:
  - canonical host resolution
  - cross-site list access
  - digest + ensure-user flows
  - ETag-safe writes
  - audit-event creation
  - post-mutation refresh behavior
  - people search
  - public and companion regressions

### 9. What anti-patterns must be prohibited?
- generic “fetch any list by name” framework
- title-based binding for critical lists
- direct UI imports into platform package
- migration that leaves old low-level paths still in use
- flattening domain semantics into weak generic transport helpers

### 10. What evidence proves the architecture is ready to serve other homepage webparts?
The reusable mechanics are already visible in Kudos and can support other list-backed webparts.
However, the repo also shows that not all homepage webparts are equally mature. For example, Project Spotlight still uses title-based list binding and a much thinner data seam. That means the **platform mechanics** are reusable now, but the **Kudos domain adapter** itself should not be treated as a universal homepage adapter.

## Recommendation
Proceed with a **phased extraction**:
- extract mechanics first,
- preserve Kudos semantics,
- prove reuse with a second consumer only after the platform layer is stable,
- forbid a generic CRUD abstraction.
