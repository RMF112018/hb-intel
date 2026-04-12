# 05 — Source-Level Hardening Prompt

You are working in the live repo for `RMF112018/hb-intel`.

Your task is to close the remaining **source-level coverage gaps** that should not rely only on browser execution.

## Mandatory directive

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Objective

Add direct runnable tests for logic seams that remain high-risk even after the Playwright lane is activated.

## Repo areas to inspect and update

At minimum:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/helpers/kudosRoleResolver.*`
- `apps/hb-webparts/src/homepage/helpers/kudosProminenceRules.*`
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.*`
- `apps/hb-webparts/src/homepage/__tests__/`

## Required new or expanded coverage

### 1. `applyCompanionFilter`

Add direct tests covering:

- tab/status scoping
- admin-review-only
- scheduled-only
- ownership = all / mine / unassigned / others
- aging buckets
- search text
- sort direction
- interactions between those filters

### 2. `fetchKudosAuditTimeline`

Add tests covering:

- mapping of raw SharePoint rows
- ascending sort by event time
- ignore malformed rows
- public/internal note handling
- failure fallback behavior

### 3. Role resolution

Add tests covering:

- admin
- reviewer
- viewer
- unresolved / malformed input
- cache or repeated-resolution behavior if present
- denial behavior when group membership is absent

### 4. Prominence rules

Add direct tests covering:

- pin-slot collision denial
- feature-slot collision denial
- scheduled prominence collision handling
- denial vs demotion behavior per current repo truth
- reassignment authority for flagged items

### 5. Cache invalidation observability

Add direct tests or a narrow adapter test that proves invalidation coupling is observable and not merely assumed by the browser harness.

### 6. Concurrency-sensitive logic

Add targeted tests for source-level or narrowly mocked behavior around:

- stale ETag rejection
- duplicate mutation attempts
- double celebrate increment protection where current logic supports it
- state transition integrity after failed patch/audit writes

## Implementation rules

- keep tests close to the actual seam
- do not write empty smoke tests
- do not overmock the entire world
- use narrow fixtures that align with the existing deterministic catalog
- when a browser case already proves behavior well, only add source tests where they materially improve confidence or diagnosis speed

## Required deliverables

- direct tests committed
- any tiny helper extraction required for testability committed
- short hardening note committed naming what new regressions are now caught faster than the E2E lane
