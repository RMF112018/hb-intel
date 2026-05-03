# Prompt 06B — Ask-HBI Grounding Preview Panel Component

## Objective

Add a compact, preview-safe Ask-HBI / unified project search panel component that uses the Prompt 06A hook/controller seam and the existing `UnifiedProjectSearchPreview` presentational component.

This prompt creates the user-facing panel body, but does not integrate it into Project Home, Project Readiness, shell routing, or a new workspace.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Required Baseline

Do not begin until Prompt 06A has completed.

Expected seams:

- `useUnifiedSearchReadModel` or equivalent hook/controller exists.
- `UnifiedProjectSearchPreview` exists and remains presentational.
- `getUnifiedSearch(projectId, viewerPersona?, query?)` exists.

## Required Pre-Edit Repo Truth

Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Classify uncommitted files as user-owned, agent-owned, or unknown.

## Files to Inspect

Inspect only relevant component and test patterns:

- `apps/project-control-center/src/surfaces/unifiedLifecycle/components/UnifiedProjectSearchPreview.tsx`
- `apps/project-control-center/src/surfaces/unifiedLifecycle/components/*.tsx`
- `apps/project-control-center/src/surfaces/unifiedLifecycle/useUnifiedSearchReadModel.ts`
- `apps/project-control-center/src/surfaces/projectHome/PccProjectHomeUnifiedLifecycleSection.tsx`
- `apps/project-control-center/src/tests/unifiedLifecyclePreviews.test.tsx`
- existing component tests

## Required Work

Create a reusable Ask-HBI grounding panel component.

Recommended files:

```text
apps/project-control-center/src/surfaces/unifiedLifecycle/components/AskHbiGroundingPreviewPanel.tsx
apps/project-control-center/src/surfaces/unifiedLifecycle/components/AskHbiGroundingPreviewPanel.module.css
```

If repo naming conventions suggest a different file name, follow convention.

The component should:

- accept a narrow unified search client, project ID, optional viewer persona;
- expose predefined sample query buttons;
- start with a safe default sample query;
- use `useUnifiedSearchReadModel` to fetch fixture-backed results;
- render `UnifiedProjectSearchPreview` for results;
- render project-scoped language;
- render clear “HBI is not source truth” / “grounded preview” disclaimer;
- render refusal/insufficient-evidence state from the preview component;
- never render answer text without source/citation metadata unless it is a refusal/insufficient-evidence answer;
- never create links to live external systems.

## Query UI Recommendation

Use predefined sample query buttons first.

Sample queries:

- `What did estimating assume for this scope?`
- `Who installed this product?`
- `Which submittal approved this material?`
- `Was this warranty issue tied to a subcontractor scope?`
- `Have we done this detail before?`

Do not add free-text input in 06B unless the hook tests from 06A clearly support it and the implementation remains submit-driven, fixture-backed, and non-live. If in doubt, defer free-text input.

## Component States

The panel must render clear states for:

- no query selected / idle;
- loading;
- ready with grounded answers;
- ready with refusal/insufficient evidence;
- source-unavailable / backend-unavailable envelope posture;
- hook-level rejected promise;
- restricted/redacted answer posture if present in fixture VM.

## Explicit Non-Goals

Do not modify:

- Project Home.
- Project Readiness.
- Shell/router/mount.
- API client files.
- backend.
- models.
- package files.
- lockfile.
- docs.
- manifests.

Do not add:

- new route;
- new workspace;
- live LLM;
- vector database;
- live Graph/Procore/Sage/CRM/Autodesk search;
- external writes.

## Tests

Add a focused test file, for example:

```text
apps/project-control-center/src/tests/AskHbiGroundingPreviewPanel.test.tsx
```

Tests must prove:

1. panel renders project-scoped / HBI-not-source-truth copy;
2. sample query buttons render and are preview-safe;
3. selecting a sample query triggers the hook/client seam;
4. grounded results render citations/source chips;
5. refusal/insufficient-evidence result renders refusal reason and no citations;
6. no answer row marked grounded renders without at least one citation;
7. restricted/redacted content does not leak sensitive fields;
8. source-unavailable/backend-unavailable state renders a degraded preview state;
9. rejected promise renders hook-level error state without crashing;
10. no anchors with live external URLs are emitted;
11. no route/workspace markers are emitted.

## Validation

Run and report:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
md5 pnpm-lock.yaml
```

## Required Completion Summary

Return:

1. Pre-edit repo truth.
2. Workspace classification.
3. Panel component files added.
4. Safe grounding behavior implemented.
5. Tests added/updated.
6. Validation results.
7. Lockfile MD5 before/after.
8. Remaining gaps for Prompt 06C.
9. Commit hash if committed.
10. Confirm no push unless explicitly instructed.

## Commit Guidance

Commit only Prompt 06B-owned files. Do not push unless explicitly instructed.

Recommended commit message:

```text
feat(spfx-pcc): add ask-hbi grounding preview panel
```
