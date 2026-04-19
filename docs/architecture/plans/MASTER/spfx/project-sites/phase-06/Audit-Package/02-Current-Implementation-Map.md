# 02 — Current Implementation Map

## Active ownership seams

### Consumer surface
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
- `packages/spfx/src/webparts/projectSites/projectSiteLaunchState.ts`
- `packages/spfx/src/webparts/projectSites/projectSitesFilter.ts`
- `packages/spfx/src/webparts/projectSites/types.ts`

### Data and query seams
- `packages/spfx/src/webparts/projectSites/repository/projectSitesRepository.ts`
- `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useAvailableYears.ts`

### Runtime seam
- `apps/project-sites/src/mount.tsx`

### Supporting governed context
- `docs/architecture/plans/MASTER/spfx/project-sites/phase-04/00-Legacy-Project-Fallback-Bridge-Spec-and-Implementation-Plan.md`
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts`

---

## Current runtime flow

### 1. Mount boundary
`apps/project-sites/src/mount.tsx`

Responsibilities:
- bootstrap SPFx auth
- create the React Query client
- normalize runtime config
- mount `ProjectSitesRoot`
- force light theme

Assessment:
- not the integration blocker
- no evidence that packaging or host mounting is the current bridge defect

---

### 2. Available-year authority
`packages/spfx/src/webparts/projectSites/hooks/useAvailableYears.ts`
→ `repository.fetchDistinctYears()`

Current behavior:
- distinct years come only from the `Projects` list

Assessment:
- this is not just a selector-population detail
- it is the first browse-authority gate for the whole surface

---

### 3. Root control surface
`packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`

Responsibilities:
- resolve initial scope
- load available years
- call `useProjectSites(scope)`
- run client-side search / filter / sort
- render empty, loading, error, and success states

Assessment:
- strong interactive shell
- but current user messaging still repeatedly frames results in `Projects`-list terms
- current keying path (`key={entry.id}`) is too weak for future merged-source synthetic rows

---

### 4. Project-sites query hook
`packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`

Responsibilities:
- derive query key from scope
- query repository
- normalize repository rows using `normalizeProjectSiteEntries`

Assessment:
- structurally clean hook
- still conceptually wired as “repository returns raw project rows; select normalizes them”
- no dedicated merged-record resolver seam between source reads and normalization

---

### 5. Repository seam
`packages/spfx/src/webparts/projectSites/repository/projectSitesRepository.ts`

Responsibilities:
- read `Projects`
- read `Legacy Project Fallback Registry`
- build fallback lookup
- decorate project rows

Actual flow:
1. fetch `Projects`
2. if zero `Projects` rows, return immediately
3. derive years from those project rows
4. read fallback rows for those years only
5. build lookup keyed by `projectNumber::legacyYear`
6. decorate only the existing project rows

Assessment:
- current seam is enrichment, not merged-source resolution
- fallback-only scope results are suppressed by design
- join authority is weaker than the registry descriptor already supports

---

### 6. Type contract
`packages/spfx/src/webparts/projectSites/types.ts`

Current strengths:
- already has fallback-aware fields:
  - `primarySiteUrl`
  - `legacyFallbackFolderUrl`
  - `legacyFallbackSourceYear`
  - `legacyFallbackMatchStatus`
  - `launchTargetKind`

Current weaknesses:
- single numeric `id` is too weak for merged-source identity
- `siteUrl` is overloaded as the resolved launch target
- no explicit record-source classification
- no explicit stable merged record key
- no richer approved-linkage / provenance fields
- filter model still has only `hasSiteOnly`, not source-aware dimensions

---

### 7. Normalization seam
`packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts`

Responsibilities:
- normalize project-origin raw rows
- parse title fallback values
- derive launch target kind
- derive resolved `siteUrl`
- derive data quality and launch status

Assessment:
- valid for enriched project rows
- not yet a durable normalizer for a true source-merged record contract
- likely needs narrower responsibility once a dedicated resolver exists

---

### 8. Launch-state seam
`packages/spfx/src/webparts/projectSites/projectSiteLaunchState.ts`

Responsibilities:
- derive live / archived / provisioning / attention-needed state
- derive truthful launch reason/user message

Assessment:
- already reusable
- not the blocker
- should remain downstream of the merged resolver

---

### 9. Filter/search seam
`packages/spfx/src/webparts/projectSites/projectSitesFilter.ts`

Responsibilities:
- build client-side search corpus
- apply filters
- sort visible entries
- extract facets

Assessment:
- correct layer for this work
- current corpus does not reason about source states
- current filter model cannot intentionally expose modern-only vs merged vs legacy-only inventory

---

### 10. Card seam
`packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`

Responsibilities:
- render project identity and action state
- render legacy launch label truthfully
- keep blocked states non-speculative

Assessment:
- largely ready
- main change needed is contract-driven truthfulness, not a visual rebuild
- card can stay compact if provenance data is kept disciplined

---

### 11. Current tests

Present:
- `hooks/useProjectSites.test.ts`
- `projectSitesFilter.test.ts`
- `components/ProjectSiteCard.test.tsx`

Missing or insufficient:
- repository-level merge resolution tests
- synthetic legacy-only entry tests
- approved-linkage precedence tests
- merged-key / duplicate suppression tests
- fallback-inclusive available-year tests
- root-surface truthful empty-state tests

---

## Current implementation identity in one sentence

The live repo currently implements **Projects-list browsing with fallback launch enrichment**, not a true **merged-source unified project-access layer**.
