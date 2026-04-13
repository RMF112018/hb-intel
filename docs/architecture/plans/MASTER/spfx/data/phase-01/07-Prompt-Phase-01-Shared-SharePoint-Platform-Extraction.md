# 07 — Prompt — Phase 1 — Shared SharePoint Platform Extraction

## Objective
Extract the reusable SharePoint mechanics currently scattered across the HB Kudos implementation into a real workspace package under `packages/`, while preserving runtime behavior exactly.

## Repo authority
Use the live `main` branch of:
- `https://github.com/RMF112018/hb-intel.git`

Treat the live code as the sole implementation authority.

## Required instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Scope
Audit and refactor only the mechanics that are genuinely cross-webpart infrastructure, including:
- host/site URL storage and resolution
- canonical list-host resolution
- list descriptor types and endpoint builders
- request digest retrieval
- ensure-user resolution
- current-user resolution
- item meta / ETag lookup
- MERGE helper
- normalized fetch/write result envelopes
- cache invalidation primitive

## File focus
At minimum inspect:
- `apps/hb-webparts/src/homepage/data/spContext.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureSpListRegistry.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- `apps/hb-webparts/src/mount.tsx`
- workspace/package configuration files

## Hard rules
- Do not move Kudos workflow logic into the platform package.
- Do not move public or companion orchestration into the platform package.
- Do not introduce a generic “fetch any list by name” public API.
- Do not weaken GUID-based binding.
- Do not change runtime behavior unless required to preserve correctness.

## Deliverables
1. create the new package scaffold
2. move or recreate the approved platform primitives there
3. update imports in the app where needed
4. remove duplicate low-level helpers where safely replaceable
5. add or update tests for the extracted platform mechanics
6. produce a closure note listing:
   - what moved,
   - what did not move,
   - why

## Required validation
- workspace builds
- affected tests pass
- no UI imports inside the new package
- no webpart-local state or hooks inside the new package
- no unresolved duplicate mechanic left behind
