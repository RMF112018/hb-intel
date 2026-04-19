# 03 — Expanded Findings Register

## Severity legend

- **P0** — blocks correct unified behavior or suppresses required records
- **P1** — major architecture or correctness defect likely to break merged-source closure
- **P2** — correctness / maintainability / truthfulness gap that will weaken closure
- **P3** — cleanup or optional improvement

---

## P0-01 — Fallback-only records can never surface

### Files
- `packages/spfx/src/webparts/projectSites/repository/projectSitesRepository.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`
- `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts`

### Repo-truth condition
The repository fetches `Projects` first and returns immediately when no project rows are found. Fallback rows are only ever applied onto that existing project row set.

### Why this is a blocker
The product objective is a unified surface that can launch either a migrated site or a governed legacy fallback. If fallback-only approved records never emit, the runtime behavior contradicts the product claim.

### Required future state
The consumer must emit:
- project-only records
- merged records
- synthetic legacy-only records

with deterministic launch-target behavior.

### Closure proof
A year containing only approved fallback records must still produce visible cards.

---

## P1-02 — Merged record identity is under-modeled and unsafe for synthetic rows

### Files
- `packages/spfx/src/webparts/projectSites/types.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`

### Repo-truth condition
`IProjectSiteEntry` uses a single numeric `id`, and the root list keys cards with `key={entry.id}`.

### Why this matters
That is adequate for project-list rows, but synthetic legacy-only entries and merged rows need a stable cross-source identity.

Without an explicit merged key seam, future implementation risks:
- React key collisions
- brittle duplicate suppression
- unclear testing identity
- unstable support diagnostics

### Required future state
The normalized merged contract needs a stable key/identity field, for example a source-aware record key that remains unique across:
- project-only rows
- merged rows
- synthetic legacy-only rows

### Closure proof
The UI list and tests use the stable merged key, not a single-source numeric id assumption.

---

## P1-03 — The consumer still lacks a dedicated merged-source resolver seam

### Files
- `packages/spfx/src/webparts/projectSites/repository/projectSitesRepository.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`

### Repo-truth condition
Resolver behavior lives inside repository-local helpers:
- `buildLegacyFallbackLookup(...)`
- `applyFallbackLookup(...)`

### Why this matters
There is no explicit seam that owns:
- source precedence
- approved-linkage preference
- synthetic row emission
- duplicate suppression
- merged record identity

That makes future closure fragile and hard to test directly.

### Required future state
Introduce a dedicated resolver seam that takes project rows and fallback rows, then emits an authoritative merged record set.

### Closure proof
Resolver behavior is directly testable without mounting the UI.

---

## P1-04 — Join authority ignores stronger approved-linkage fields already present in the governed registry

### Files
- `packages/spfx/src/webparts/projectSites/repository/projectSitesRepository.ts`
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts`

### Repo-truth condition
The current consumer lookup key is `projectNumber::legacyYear`.

The registry descriptor already includes stronger fields:
- `MatchedProjectListItemId`
- `MatchedProjectTitle`
- `MatchConfidence`
- `MatchMethod`

### Why this matters
The consumer is currently weaker than the governed registry. That can cause silent misses or weaker binding behavior even where the registry already contains approved linkage context.

### Required future state
The resolver should prefer stronger approved-linkage data when present, then fall back to number/year heuristics only where necessary.

### Closure proof
Direct tests prove that approved linkage wins over weaker heuristic joins.

---

## P1-05 — Browse authority remains Projects-only

### Files
- `packages/spfx/src/webparts/projectSites/repository/projectSitesRepository.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useAvailableYears.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`

### Repo-truth condition
`fetchDistinctYears()` reads only `Projects`.

`ProjectSitesRoot` bases initial scope resolution and early empty states on that authority.

### Why this matters
Fallback-only inventory can be hidden before merged-source evaluation even begins.

### Required future state
Available-year and browse-scope authority must become fallback-inclusive.

### Closure proof
A fallback-only year is available to the UI and can be intentionally browsed.

---

## P2-06 — Consumer-side fallback adapter is thinner than the governed registry

### Files
- `packages/spfx/src/webparts/projectSites/repository/projectSitesRepository.ts`
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts`
- `packages/spfx/src/webparts/projectSites/types.ts`

### Repo-truth condition
The consumer selects only a narrow subset of registry fields.

### Why this matters
The consumer cannot reason cleanly about approved linkage, provenance, or diagnostic support if it never models the fields the registry already governs.

### Required future state
Add an explicit consumer-side adapter/descriptor seam that selects and maps only the fields actually needed for merged-source operation.

### Closure proof
Consumer-side mapping is explicit and intentionally narrower than the full backend descriptor, not just an ad hoc subset hidden in the repository method.

---

## P2-07 — Hook and normalization semantics still assume project-origin rows

### Files
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`
- `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts`
- `packages/spfx/src/webparts/projectSites/types.ts`

### Repo-truth condition
The hook’s `select` path runs `normalizeProjectSiteEntries` over repository output that is still conceptually “raw project rows with enrichment.”

### Why this matters
If merged-source logic is added carelessly, the hook/normalizer can become an accidental second resolver.

### Required future state
Define a clean handoff:
- source reads
- resolver emit
- normalization of merged contract
- UI consumption

### Closure proof
The hook consumes authoritative merged records without reconstructing source meaning from ad hoc field presence.

---

## P2-08 — Filter/search/facets are not source-aware

### Files
- `packages/spfx/src/webparts/projectSites/projectSitesFilter.ts`
- `packages/spfx/src/webparts/projectSites/types.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`

### Repo-truth condition
The filter model exposes only:
- stage
- PM / estimator / executive
- department
- office division
- `hasSiteOnly`

### Why this matters
A migration-period access surface should support restrained but intentional reasoning across:
- modern primary-site records
- merged records
- legacy-only launch targets

### Required future state
Add a bounded source-aware filter dimension and ensure search/facet logic respects the merged contract.

### Closure proof
A user can intentionally inspect legacy-backed inventory without the UI turning into a support console.

---

## P2-09 — User-facing empty, error, and scope-context copy is not yet merged-source truthful

### Files
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `packages/spfx/src/webparts/projectSites/hooks/useAvailableYears.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`

### Repo-truth condition
Current messages still repeatedly describe the surface as loading or returning results from the `Projects` list.

### Why this matters
This is not just comment drift. It is user-visible false framing once the surface is supposed to represent unified access inventory.

### Required future state
Empty/error/context copy must describe the actual merged-source authority truthfully.

### Closure proof
Fallback-inclusive states do not tell the user that the result came only from the `Projects` list.

---

## P2-10 — Regression coverage does not prove merged-source closure

### Files
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.test.ts`
- `packages/spfx/src/webparts/projectSites/projectSitesFilter.test.ts`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.test.tsx`

### Repo-truth condition
Current coverage is useful but narrow.

### Missing proofs
- fallback-only entry emission
- approved-linkage precedence
- stable merged keys
- duplicate suppression
- fallback-inclusive available years
- truthful empty-state behavior in fallback-only scope
- source-aware filtering/search

### Required future state
Add focused resolver/repository/hook/UI tests around the real migration bridge cases.

### Closure proof
The bridge cannot regress silently without tests failing.

---

## P3-11 — Comments and docs still frame the app as a Projects-list browser

### Files
- `packages/spfx/src/webparts/projectSites/types.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useAvailableYears.ts`
- `docs/architecture/plans/MASTER/spfx/project-sites/phase-04/00-Legacy-Project-Fallback-Bridge-Spec-and-Implementation-Plan.md` (cross-check only if needed)

### Why this matters
Maintainer comprehension will drift even after code closure if the seam descriptions stay one-source-oriented.

### Required future state
Refresh comments and architecture notes after code truth lands.

---

## P3-12 — Provenance/support diagnostics can be stronger, but only after core closure

### Files
- `packages/spfx/src/webparts/projectSites/types.ts`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`

### Why this matters
Migration support may benefit from restrained provenance signals.

### Classification
Optional hardening only after required-now work is closed.

### Required future state
Any provenance signal must remain disciplined and non-cluttering.
