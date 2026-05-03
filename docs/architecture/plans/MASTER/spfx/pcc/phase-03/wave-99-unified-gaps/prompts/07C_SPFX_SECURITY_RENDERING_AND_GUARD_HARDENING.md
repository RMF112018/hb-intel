# Prompt 07C — SPFx Security Rendering and Guard Hardening

## Objective

Verify the SPFx PCC surfaces and shared preview components render the security, redaction, refusal, and no-source-truth posture from Prompts 06 and 07 without leaking restricted content or creating new routes/workspaces.

This prompt is **SPFx test/source-guard hardening only** unless tests reveal a narrow defect in Prompt 06-owned files.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Required Baseline

Do not begin until Prompt 07B has completed.

Expected baseline:

- Prompt 06D already hardened Ask-HBI grounding/security behavior.
- Prompt 07A documented the knowledge reuse security posture.
- Prompt 07B hardened model/fixture invariants.

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

Inspect only relevant SPFx files and tests:

```text
apps/project-control-center/src/surfaces/unifiedLifecycle/components/AskHbiGroundingPreviewPanel.tsx
apps/project-control-center/src/surfaces/unifiedLifecycle/components/UnifiedProjectSearchPreview.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeAskHbiSection.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/tests/askHbiGroundingCloseout.test.tsx
apps/project-control-center/src/tests/AskHbiGroundingPreviewPanel.test.tsx
apps/project-control-center/src/tests/PccProjectHomeAskHbiSection.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/pcc-api-dormancy.test.ts
apps/project-control-center/src/tests/pcc-import-guards.test.ts
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
```

If `askHbiGroundingCloseout.test.tsx` does not exist because Prompt 06D used another file, inspect the actual 06D closeout test.

## Required Hardening

Add or update targeted SPFx tests to prove:

### 1. Restricted/Redacted Rendering

- restricted/degraded envelopes render `PccPreviewState`, not answer rows;
- sensitive synthetic answer text does not leak;
- masked/withheld posture is reflected safely;
- cross-project/reuse references are labels/references, not source ownership claims.

### 2. HBI/Search Grounding Copy

- HBI is not presented as source truth;
- visible copy includes not-source-truth / grounded-preview posture;
- no copy claims HBI is authoritative;
- no copy claims HBI replaces Procore/Sage/SharePoint/Graph/source systems;
- refusal/insufficient evidence does not assign responsibility.

### 3. Route / Workspace Safety

- no `ask-hbi`, `unified-search`, `search-workspace`, `hbi-search`, or similar route exists;
- `PccSurfaceRouter.tsx` has no route case for Ask-HBI/search;
- Ask-HBI appears only inside Project Home read-model content;
- no `data-pcc-active-surface-panel` value is added for Ask-HBI/search.

### 4. No Live Integration

Source scans must prove Prompt 06/07 SPFx files have no:

- live LLM imports;
- vector/embedding imports;
- Graph/Procore/Sage/CRM/Autodesk/Adobe/DocuSign imports;
- direct `fetch(`;
- `XMLHttpRequest`;
- `WebSocket`;
- `EventSource`;
- tenant mutation/writeback calls.

Do not weaken existing dormancy/import guards.

### 5. Project Home Invariants

- fixture-only Project Home remains 10 cards;
- read-model Project Home remains 15 cards;
- backend-mode initial fetch count remains unchanged after Prompt 06C/06D;
- Ask-HBI card starts idle on mount;
- selecting a sample query triggers `getUnifiedSearch` only through the panel/hook;
- all cards remain direct children of the bento grid;
- no nested dashboard cards.

## Allowed Changes

Allowed:

- targeted SPFx tests;
- small test utilities;
- narrow fix to Prompt 06-owned SPFx files if a test reveals an actual defect.

Not allowed:

- new cards;
- new surfaces;
- route changes;
- Project Readiness integration;
- apps feature changes beyond a narrow security defect fix;
- backend/model changes;
- docs changes;
- package/dependency/lockfile changes;
- manifest bump.

## Validation

Run and report:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
md5 pnpm-lock.yaml
```

Do not use `@hbc/project-control-center`.

## Required Completion Summary

Return:

1. Pre-edit repo truth.
2. Workspace classification.
3. SPFx files inspected.
4. Hardening gaps found.
5. Tests/guards added or updated.
6. Any narrow source defects fixed.
7. Validation results.
8. Lockfile MD5 before/after.
9. Remaining gaps for Prompt 07D.
10. Commit hash if committed.
11. Confirm no push unless explicitly instructed.

## Commit Guidance

Commit only Prompt 07C-owned SPFx files. Do not push unless explicitly instructed.

Recommended commit message:

```text
test(spfx-pcc): harden knowledge reuse rendering guards
```
