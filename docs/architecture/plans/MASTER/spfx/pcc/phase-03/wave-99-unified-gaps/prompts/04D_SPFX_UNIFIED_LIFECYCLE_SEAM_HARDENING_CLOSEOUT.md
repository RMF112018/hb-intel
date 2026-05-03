# Prompt 04D — SPFx Unified Lifecycle Seam Hardening and Readiness Closeout

## Objective

Harden and verify the SPFx unified lifecycle seams created in Prompts 04A–04C so they are ready for a later Prompt 05 surface-integration pass.

This prompt is **hardening only**. It must not integrate the unified lifecycle seams into Project Home, Project Readiness, the shell, the router, mount configuration, or any new workspace. It must not add hooks that call clients. It should close test gaps, strengthen guardrails, and produce a readiness closeout for Prompt 05.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Current Baseline

Use the current main branch after Prompt 04C.

Expected completed commits:

- Prompt 04A:
  - `5c7f513dfd57d64286a01a1e45658cc8b8e23a26`
  - Added SPFx canonical read-model client and fixture-client parity for the seven unified lifecycle routes.

- Prompt 04B:
  - `7d7124fb50da2e0b0e12f25d8dd0c852323f36b1`
  - Added pure adapter/view-model seams under `apps/project-control-center/src/surfaces/unifiedLifecycle/`.

- Prompt 04C:
  - `273fc0450ba46a7ff7486da3ddd9a9056dc44955`
  - Added seven reusable, presentational, fixture-safe preview components under:
    - `apps/project-control-center/src/surfaces/unifiedLifecycle/components/`
  - Components consume Prompt 04B view models.
  - Components are non-routed and render card body content only.
  - No hooks, no client imports, no surface integration, no shell/router changes.

## Canonical Route IDs

The only canonical unified lifecycle route IDs are:

- `unified-lifecycle`
- `project-memory`
- `project-lenses`
- `project-traceability`
- `warranty-trace`
- `cross-project-knowledge`
- `unified-search`

Non-canonical route IDs must not appear as route IDs, client paths, component route concepts, or workspace concepts:

- `lifecycle-timeline`
- `traceability-graph`
- `closed-project-references`

Those names may exist only as internal component/concept language where they do not imply route IDs, route paths, or new workspaces. Prefer tests that specifically guard quoted route/path literals and route/client registries instead of brittle prose scans.

## Required Pre-Edit Repo Truth

Before editing, run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Classify all uncommitted files as:

- user-owned;
- agent-owned;
- unknown.

Preserve unrelated and user-owned changes. Do not stage, format, normalize, or edit unrelated files.

If any uncommitted changes exist in `apps/project-control-center/src/surfaces/constraintsLog/**`, `docs/architecture/plans/**`, or other unrelated areas, leave them untouched and classify them clearly.

## Files to Inspect

Inspect only the files created or changed by Prompts 04A–04C and adjacent tests unless a compile/test failure requires broader inspection.

Expected relevant areas:

### Prompt 04A client/fixture seams

- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- `apps/project-control-center/src/api/pccReadModelClient.test.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.test.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts`

### Prompt 04B adapter/view-model seams

- `apps/project-control-center/src/surfaces/unifiedLifecycle/**/*.ts`
- `apps/project-control-center/src/tests/unifiedLifecycleAdapters.test.ts`
- `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`

### Prompt 04C preview components

- `apps/project-control-center/src/surfaces/unifiedLifecycle/components/**/*.tsx`
- `apps/project-control-center/src/surfaces/unifiedLifecycle/components/**/*.module.css`
- `apps/project-control-center/src/tests/unifiedLifecyclePreviews.test.tsx`

### Guard tests

- `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`
- `apps/project-control-center/src/tests/pcc-import-guards.test.ts`
- Any existing route/client/source-scan guard tests relevant to PCC.

Do not broadly inspect or edit unrelated app surfaces.

## Required Hardening Areas

### 1. Canonical Route and Method Guard

Verify tests prove the seven canonical SPFx client methods exist and route to the correct canonical route IDs:

- `getUnifiedLifecycle`
- `getProjectMemory`
- `getProjectLenses`
- `getProjectTraceability`
- `getWarrantyTrace`
- `getCrossProjectKnowledge`
- `getUnifiedSearch`

Verify tests prove:

- the route registry contains the seven canonical route IDs;
- no backend/SPFx route path is registered for `lifecycle-timeline`;
- no backend/SPFx route path is registered for `traceability-graph`;
- no backend/SPFx route path is registered for `closed-project-references`;
- `getUnifiedSearch(projectId, undefined, query)` appends `q`;
- `getUnifiedSearch(projectId, viewerPersona)` does not treat `viewerPersona` as `q`;
- non-search methods never append `q`.

If these are already fully covered by 04A tests, do not duplicate them. Add only missing assertions.

### 2. Fixture/Backend Client Parity

Verify tests prove fixture client behavior matches the backend read-model envelope contract:

- known project returns available fixture envelope;
- unknown project returns source-unavailable or equivalent degraded envelope;
- simulated backend unavailable returns backend-unavailable envelope;
- envelopes remain read-only;
- `mode`, `sourceStatus`, `readOnly`, `warnings`, `generatedAtUtc`, `viewerPersona`, and `data` posture remain consistent;
- degraded envelopes return safe-empty data shapes for all seven read models;
- unified search remains fixture-backed and does not fabricate query-specific answers.

If already covered by Prompt 04A tests, add only missing focused checks.

### 3. Adapter Output Integrity

Verify tests prove Prompt 04B adapters:

- preserve source lineage;
- preserve evidence links;
- preserve security/redaction posture;
- preserve traceability confidence;
- preserve cross-project allowed posture;
- map grounded/refusal search answers correctly;
- preserve insufficient-evidence warranty posture without auto-resolving;
- emit no `loading` or `error` adapter status from envelope-normalization paths;
- do not imply route/workspace behavior.

If already covered by `unifiedLifecycleAdapters.test.ts`, add only missing focused checks.

### 4. Preview Component Rendering and Safety

Verify tests prove Prompt 04C components:

- render fixture-backed view models without crashing;
- render `PccPreviewState` for non-available source status;
- render `PccPreviewState state="empty"` for empty available data where applicable;
- do not expose sensitive fields for masked/redacted records;
- omit withheld records entirely;
- preserve visible source/citation/evidence cues where safe;
- use existing `PccStatusPill` tone values only;
- do not import or call clients;
- do not import router, auth, fetch, Graph, PnP, Procore, Sage, or tenant runtimes;
- do not use `useState`, `useEffect`, `useRef`, `useReducer`, or `useContext`;
- do not render anchors that behave like navigation for the preview-only lens selector;
- do not register a new routed surface.

If already covered by `unifiedLifecyclePreviews.test.tsx`, add only missing focused checks.

### 5. Redaction and Security

Harden test coverage for:

- masked/redacted records:
  - display non-sensitive placeholder or summary only;
  - display restricted indicator where appropriate;
  - do not render decision text, assumption text, sensitive title, sensitive issue summary, evidence URLs, or sensitive cross-project content.

- withheld records:
  - do not render row marker;
  - do not render full content;
  - do not render a placeholder that reveals existence unless a prior explicit doctrine says otherwise.

- cross-project knowledge:
  - preserves `crossProjectAllowed`;
  - preserves classification/redaction posture;
  - renders future pursuit references as references, not copied ownership or source-of-record claims.

### 6. Warranty No-Blame Posture

Harden test coverage for:

- insufficient-evidence warranty rows show no responsible-party recommendation;
- unresolved-responsibility and pending-evidence rows do not fabricate responsibility;
- evidence-backed resolved/confirmed rows may show recommendation only when the model contains one;
- recommendation display includes confidence/evidence posture when available;
- components and adapters do not invent responsible parties.

### 7. Lens Behavior

Harden test coverage for:

- `ProjectLensSwitcher` is preview-only;
- lens buttons are disabled or explicitly preview-disabled;
- click does not mutate `aria-pressed`;
- click does not navigate;
- no local state/hook behavior is introduced;
- no route, href, router, or workspace metadata is emitted;
- component copy makes clear lenses filter shared project truth and do not open a separate workspace.

### 8. Accessibility and Preview State

Verify, and add focused tests only where missing, for:

- meaningful accessible names/labels for preview controls;
- no duplicate `role="alert"` wrappers around refusal content when `PccPreviewState state="error"` already supplies alert semantics;
- no reliance on color alone for status;
- useful empty/degraded-state text;
- preview-only disabled controls are clearly marked;
- headings/section labels follow existing PCC conventions.

Do not introduce a broad design overhaul.

### 9. Source/Import Guards

Run and, only if necessary, strengthen existing guards to prove:

- no `fetch(` callsite outside approved backend HTTP client/test allowlist;
- no forbidden runtime imports;
- no direct Graph/PnP/Procore/Sage/CRM/SharePoint runtime integration;
- no read-model client imports in preview components or adapters;
- no shell/router import in unified lifecycle adapter/component seam;
- no new routed surface registration for `unifiedLifecycle`.

Do not broadly relax `pcc-api-dormancy.test.ts` or `pcc-import-guards.test.ts`. Any allowlist change must be narrow, per-file, and justified in the completion summary.

## Explicit Non-Goals

Do **not** perform any of the following in Prompt 04D:

- Project Home integration.
- Project Readiness integration.
- Shell/router/mount wiring.
- New PCC surface registration.
- Client-calling hooks such as `usePccUnifiedLifecycleReadModel`.
- Query-input behavior for unified search.
- Active lens local state.
- Backend route/provider changes.
- Model contract changes.
- Package/dependency changes.
- `pnpm-lock.yaml` changes.
- SharePoint manifest version bump.
- Blueprint/canonical plan-library edits.
- Tenant mutation.
- Live external calls.

If you discover an issue that appears to require one of the above, stop and report it as a Prompt 05 or later-phase gap unless it is a compile-blocking issue caused directly by Prompt 04D-owned test hardening.

## Allowed Changes

Prompt 04D may change only:

- targeted SPFx test files related to:
  - read-model client route/client parity;
  - fixture client parity;
  - unified lifecycle adapters;
  - unified lifecycle preview components;
  - PCC import/dormancy guards.

- narrowly scoped helper/test utilities if existing test patterns require them.

- very small component/adapter fixes only if a Prompt 04D test reveals an actual 04A–04C seam defect.

- local CSS/module fix only if needed for a component accessibility/testability issue.

Do not add major features.

## Suggested Test Files

Prefer adding/updating these existing tests instead of creating scattered new files:

- `apps/project-control-center/src/api/pccReadModelClient.test.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.test.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts`
- `apps/project-control-center/src/tests/unifiedLifecycleAdapters.test.ts`
- `apps/project-control-center/src/tests/unifiedLifecyclePreviews.test.tsx`
- `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`
- `apps/project-control-center/src/tests/pcc-import-guards.test.ts`

If a new test file is cleaner, name it clearly, for example:

- `apps/project-control-center/src/tests/unifiedLifecycleSeamReadiness.test.ts`

## Required Validation

Use the actual SPFx package name.

Run and report:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
md5 pnpm-lock.yaml
```

Do **not** use:

```bash
pnpm --filter @hbc/project-control-center ...
```

That is not the current package filter for this app.

If models or functions are implicated by a failure, run only the necessary related checks and report why:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/functions check-types
```

## Prompt 05 Readiness Criteria

Prompt 05 may proceed only if all of the following are true:

1. All seven canonical SPFx client methods exist and are tested.
2. Fixture client parity exists and is tested.
3. Backend client query behavior for unified search is tested.
4. Prompt 04B adapters/view models exist and are tested.
5. Prompt 04C preview components exist and are tested.
6. Route IDs remain canonical.
7. Non-canonical route IDs are not registered or used as route paths.
8. Redaction/security/cross-project posture is covered.
9. Warranty no-blame posture is covered.
10. Unified search citation/refusal posture is covered.
11. Lens behavior is preview-only and non-routing.
12. Import/dormancy guards prove no live integration or client usage has leaked into adapter/component seams.
13. No backend/model/package/lockfile/manifest/docs changes were introduced by 04D.
14. `pnpm-lock.yaml` MD5 remains:
    - `c56df7b79986896624536aab74d609f4`

If any of these fail, do not proceed to Prompt 05. Record the gap precisely.

## Required Completion Summary

Return:

1. Pre-edit repo truth.
2. Workspace classification.
3. Files inspected.
4. Hardening gaps found.
5. Hardening changes made.
6. Tests added/updated.
7. Validation results.
8. Lockfile MD5 before/after.
9. Explicit Prompt 05 readiness statement.
10. Remaining gaps, if any.
11. Commit hash if committed.
12. Confirm no push unless explicitly instructed.

## Commit Guidance

Commit only Prompt 04D-owned files. Do not stage unrelated files. Do not push unless explicitly instructed.

Recommended commit message:

```text
test(spfx-pcc): harden unified lifecycle seam readiness
```

## Final Instruction

This is a hardening/readiness gate. Keep the work narrow. The correct outcome may be a small commit if the seam is already well covered. Do not create surface integration work under this prompt.
