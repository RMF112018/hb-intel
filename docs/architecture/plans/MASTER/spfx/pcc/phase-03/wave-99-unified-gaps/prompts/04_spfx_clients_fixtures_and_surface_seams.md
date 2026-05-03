# Prompt 04 — Add SPFx API Clients, Fixtures, and Surface Seams for Unified Lifecycle Read Models

## Objective

Extend the PCC SPFx application so the new backend read models from Prompt 03 have typed client access and deterministic preview fixtures. Add non-invasive surface seams that can be used by Project Home, Project Readiness, and future lens-driven views.

Do not build a siloed module workspace. Do not add live external writes. Keep the implementation preview-safe and compatible with existing PCC shell patterns.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Context Handling

Do not re-read files still in current context or memory. Re-open only the SPFx client, fixture, shell, surface, and test files required to verify conventions.

## Files to Inspect

- `apps/project-control-center/src/api/`
- `apps/project-control-center/src/fixtures/`
- `apps/project-control-center/src/shell/`
- `apps/project-control-center/src/surfaces/`
- `apps/project-control-center/src/surfaces/projectReadiness/`
- `apps/project-control-center/src/tests/`
- `packages/models/src/pcc/`
- `apps/project-control-center/package.json`

## Required SPFx Client Methods

Add typed client methods, matching current PCC client style, for:

- `getLifecycleTimeline(projectId)`
- `getProjectMemory(projectId)`
- `getProjectLenses(projectId)`
- `getTraceabilityGraph(projectId)`
- `getWarrantyTrace(projectId)`
- `getClosedProjectReferences(projectId)`
- `getUnifiedSearchResults(projectId, query)`

If the client already has a generated/central request helper, use it. Do not invent a second API pattern.

## Required Fixtures

Add deterministic SPFx fixtures mirroring the model/backend fixture intent:

- lifecycle timeline fixture;
- project memory fixture;
- lens definitions fixture;
- traceability graph fixture;
- warranty trace fixture;
- closed-project reference fixture;
- unified search/HBI grounding fixture.

Fixtures must demonstrate:

- active current-stage work;
- historical-stage context;
- redacted or restricted records;
- related records across estimate/scope/commitment/product/warranty/lesson learned;
- insufficient-evidence warranty posture;
- cited search/HBI answer fragments.

## Required Surface Seams

Add lightweight reusable components or hooks that can be used by surfaces without forcing a new workspace. Candidate seams:

- `LifecycleTimelinePreview`
- `ProjectMemoryPanel`
- `RelatedRecordsPanel`
- `ProjectLensSwitcher`
- `WarrantyTracePreview`
- `ClosedProjectReferencePreview`
- `UnifiedProjectSearchPreview`

Use naming and placement consistent with the repo. If component naming differs in current app, follow repo convention.

The components must be:

- preview-safe;
- accessible;
- compact enough for dashboard-style embedding;
- source-lineage-forward;
- explicit when data is redacted, mock, preview, or insufficiently evidenced.

## Tests

Add/update SPFx tests to prove:

- client methods construct the expected route paths;
- fixture-backed rendering does not crash;
- redacted records do not expose sensitive fields;
- source-lineage/citation cues render where expected;
- lens switching changes context/visibility cues without changing route/app workspace;
- components do not require live external integrations.

## Constraints

- No standalone department-specific workspace.
- No new dependencies.
- No lockfile change.
- No tenant mutation.
- No live external writes.
- No broad CSS/theme overhaul.
- No replacement of existing shell navigation.

## Validation

Run relevant gates:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test
md5 pnpm-lock.yaml
```

If exact scripts differ, inspect package scripts and run closest equivalents.

## Required Response

Return:

1. Client methods added.
2. Fixtures added.
3. Surface seams/components added.
4. Tests added/updated.
5. Validation results.
6. Lockfile MD5 before/after.
7. Remaining gaps passed to Prompt 05.
