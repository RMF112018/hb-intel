# 02 — Current-State Architecture and Seam Map

## A. Live module map

### A1. Bootstrap / host context
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/data/spContext.ts`

**Current role**
- stores host site URL
- optionally stores `kudosListHostUrl` override from properties
- supplies Graph token provider
- resolves canonical Kudos list host
- resolves current user id

**Issue**
These are true infrastructure concerns but they are implemented as app-local global singletons.

---

### A2. Platform-like data mechanics already present
- `apps/hb-webparts/src/homepage/data/peopleCultureSpListRegistry.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts` (partial)
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts` (partial)
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts` (cache/invalidation pattern)
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts` (partial)

**Current role**
- list GUID registry
- endpoint construction
- request digest retrieval
- ensure-user
- ETag-safe item lookup/update
- cache invalidation
- people search transport

**Issue**
These mechanics are split across product-facing modules instead of owned by one neutral platform boundary.

---

### A3. Kudos domain adapter logic already present
- `apps/hb-webparts/src/homepage/data/peopleCultureListSource.ts`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`
- `apps/hb-webparts/src/homepage/helpers/kudosRoleResolver.ts`
- `apps/hb-webparts/src/homepage/helpers/kudosCapabilities.ts`
- `apps/hb-webparts/src/homepage/helpers/kudosNotificationBuilder.ts`
- `apps/hb-webparts/src/homepage/helpers/kudosProminenceRules.ts`

**Current role**
- typed field maps
- raw SharePoint → typed Kudos mapping
- typed patch planning
- audit-event writes
- role/capability policy
- prominence and notification rules

**Issue**
This layer is strong but imports some low-level mechanics from product-facing source files.

---

### A4. Webpart-local orchestration
Public:
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/hooks/usePublicKudosData.ts`
- `apps/hb-webparts/src/webparts/hbKudos/hooks/useCelebrateAction.ts`
- `apps/hb-webparts/src/webparts/hbKudos/hooks/useRecipientPhotoHydration.ts`
- `apps/hb-webparts/src/webparts/hbKudos/hooks/useCurrentUserId.ts`

Companion:
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/runtime/useCompanionActions.ts`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/runtime/useCompanionQueue.ts`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/runtime/useCompanionRole.ts`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/runtime/useBulkApproval.ts`

**Current role**
- queue/view derivation
- dialog orchestration
- selection state
- article / feed / archive / panel flows
- public UX behavior

**Issue**
These are the right place for persona/state logic and must stay local, but some still import low-level data writers directly.

## B. Read seams

### B1. Public read seam
`HbKudos.tsx` → `usePublicKudosData()` → `usePeopleCultureData()` → `fetchPeopleCultureListData()`

**Strength**
- clear derivation chain
- typed Kudos entries
- refresh handle exists

**Issue**
- public Kudos currently rides on a People & Culture merged data hook, not a discrete Kudos adapter contract

### B2. Companion read seam
`HbKudosCompanion.tsx` → `usePeopleCultureData()` → local queue/filter hooks

**Strength**
- queue orchestration is local
- status/filtering logic is explicit

**Issue**
- same merged hook problem
- companion still depends on merged People & Culture data source rather than an explicit Kudos repository/adapter surface

### B3. Audit timeline read seam
`fetchKudosAuditTimeline()`

**Strength**
- already a clean adapter-style read helper
- good candidate for domain adapter surface

## C. Write seams

### C1. Submission write seam
`submitKudosDraft()`

**Strength**
- canonical defaults enforced
- GUID-safe binding
- typed recipient resolution
- cache invalidation performed after success

**Issue**
- request digest and ensure-user helpers are owned here instead of a platform module

### C2. Governance write seam
`submitKudosGovernanceAction()`

**Strength**
- real writer-level authority checks
- patch planner is exhaustive
- ETag-safe writes
- audit-event write coupled to transition
- notification and cache invalidation hooks already centralized

**Issue**
- too many low-level mechanics owned/imported through the writer boundary
- excellent domain adapter candidate, but not yet sitting on a neutral platform foundation

## D. Identity / people / photo seams

### D1. People search
`useSharePointPeopleSearch()`

**Strength**
- tenant-aware search
- known response-shape handling
- request digest reuse

**Issue**
- digest dependency comes from submission module

### D2. Current user
`resolveCurrentUserId()` in `spContext.ts`

**Strength**
- resolves against canonical list host, which is correct for cross-site list item identity alignment

**Issue**
- hidden singleton cache and policy coupling

### D3. Recipient photo hydration
`useRecipientPhotoHydration()`

**Classification**
Keep local/domain. This is not generic SharePoint platform infrastructure.

## E. Cache and refresh seams

### E1. `usePeopleCultureData` cache
- global `_cache`
- `_cacheGeneration`
- `invalidatePeopleCultureCache()`
- `refresh()`

**Strength**
- practical and already used by mutation paths

**Issue**
- app-singleton pattern should be formalized as an infrastructure cache store or query invalidation primitive, not left as ad hoc globals inside one hook

## F. Package-boundary risk map

### Safe to promote now
- list registry
- endpoint builders
- digest/user/current-user helpers
- ETag write helper
- cache invalidation primitive
- normalized result/error helpers

### Keep in Kudos domain layer
- field constants
- read mapping
- patch planning
- audit-event semantics
- role/capability logic
- prominence/collision rules

### Keep local to webparts
- queue derivation
- dialogs
- bulk approval state machine
- public featured/archive/article orchestration
- recipient photo hydration
