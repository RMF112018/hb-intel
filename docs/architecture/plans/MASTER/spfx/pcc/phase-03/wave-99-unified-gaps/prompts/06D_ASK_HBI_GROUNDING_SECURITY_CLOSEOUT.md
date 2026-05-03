# Prompt 06D — Ask-HBI Grounding / Security Closeout — Updated

## Objective

Harden and verify the Prompt 06 unified search / Ask-HBI preview implementation after Prompts 06A–06C.

This is a **regression, grounding-safety, and readiness closeout prompt**, not a feature-construction prompt.

The correct outcome should be a small, test-focused commit unless a test reveals a narrow defect in the files created by 06A–06C. Do not add new features, cards, routes, workspaces, live integrations, Project Readiness integration, documentation updates, package changes, manifest changes, or lockfile changes.

The closeout must prove that the Ask-HBI experience is:

- fixture-backed;
- project-scoped;
- citation/refusal-safe;
- redaction-aware;
- not presented as source truth;
- contained inside the existing Project Home read-model path;
- not a standalone shell route or workspace;
- not connected to live LLM/vector/search/external systems.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Required Baseline

Do not begin until Prompts 06A, 06B, and 06C have completed and are committed.

Expected latest Prompt 06C baseline:

```text
f7bc6105be02c1b462389b29189f1f84f070b8a0
feat(spfx-pcc): integrate ask-hbi preview into project home
```

Expected completed integrations:

1. Prompt 06A:
   - `useUnifiedSearchReadModel` exists.
   - Hook owns `idle | loading | ready | error`.
   - Blank/whitespace query returns `idle`.
   - Hook calls only `getUnifiedSearch(projectId, viewerPersona?, query?)`.

2. Prompt 06B:
   - `AskHbiGroundingPreviewPanel` exists.
   - Panel composes `useUnifiedSearchReadModel` with `UnifiedProjectSearchPreview`.
   - Panel supports predefined sample-query buttons.
   - Panel sanitizer drops grounded answers with no citations.
   - Panel shows "HBI is not the source of truth" / project-scoped grounded-preview copy.
   - Omitted / `undefined` `initialQuery` defaults to the first sample query.
   - `initialQuery={null}` starts in idle posture.

3. Prompt 06C:
   - Project Home read-model-driven path includes one Ask-HBI card.
   - The card is mounted via `PccProjectHomeAskHbiSection`.
   - The section passes `initialQuery={null}` so Project Home opens idle.
   - Project Home fixture-only path remains 10 cards.
   - Project Home read-model path is now 15 cards:
     - 10 base cards;
     - 4 unified lifecycle cards;
     - 1 Ask-HBI card.
   - Initial backend-mode Project Home fetch count remains 4:
     - home;
     - priority-actions;
     - document-control;
     - unified-lifecycle.
   - No initial `unified-search` request is made on Project Home mount.
   - `getUnifiedSearch` fires only after the user selects a sample query.

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

Preserve unrelated and user-owned files. Do not stage, format, normalize, or edit unrelated files.

If the worktree contains uncommitted files outside Prompt 06D scope, do not touch them.

## Files to Inspect

Inspect only the files changed by Prompts 06A–06C and adjacent tests unless a failure requires more.

Likely source files:

```text
apps/project-control-center/src/surfaces/unifiedLifecycle/useUnifiedSearchReadModel.ts
apps/project-control-center/src/surfaces/unifiedLifecycle/components/AskHbiGroundingPreviewPanel.tsx
apps/project-control-center/src/surfaces/unifiedLifecycle/components/UnifiedProjectSearchPreview.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeAskHbiSection.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/projectHomeViewModel.ts
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
```

Likely test files:

```text
apps/project-control-center/src/tests/useUnifiedSearchReadModel.test.ts
apps/project-control-center/src/tests/AskHbiGroundingPreviewPanel.test.tsx
apps/project-control-center/src/tests/PccProjectHomeAskHbiSection.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccApp.optIn.test.tsx
apps/project-control-center/src/tests/useProjectHomeReadModel.test.ts
apps/project-control-center/src/tests/pcc-api-dormancy.test.ts
apps/project-control-center/src/tests/pcc-import-guards.test.ts
```

Do not broadly inspect or edit unrelated surfaces.

## Required Hardening Areas

### 1. Grounded Answer Safety

Tests must prove, at the integrated Project Home level or closeout level:

- every rendered grounded answer row has at least one citation chip;
- every rendered citation includes source-system and source-record identity;
- answer text is not presented as source truth;
- HBI-not-source-truth copy is visible;
- project-scoped / grounded-preview copy is visible;
- Ask-HBI answer content is fixture-backed;
- the card does not render grounded answer text without source metadata.

Prefer testing through the integrated Project Home Ask-HBI card, not only the isolated panel, unless existing tests already cover the same assertion thoroughly.

### 2. Refusal / Insufficient-Evidence Safety

Tests must prove:

- refusal rows show refusal reason;
- refusal rows have zero citation chips;
- refusal/insufficient-evidence responses do not invent responsibility, vendor, product, submittal, source ownership, or causation;
- unsupported warranty/subcontractor conclusions stay refused or insufficient;
- no refusal row is visually treated as a grounded answer.

Use fixture-backed responses where available. If needed, use a local test-only envelope/client to simulate insufficient evidence. Do not modify model fixtures in Prompt 06D.

### 3. Redaction / Permission Safety

Tests must prove:

- restricted/degraded envelopes do not expose sensitive answer text;
- non-available source status renders a `PccPreviewState` rather than answer rows;
- withheld or restricted answer text is omitted or safely summarized according to existing fixture/view-model behavior;
- cross-project references, if surfaced through Ask-HBI, are clearly labeled as references and not source-of-record claims;
- no sensitive synthetic strings from a local test-only restricted envelope leak into `textContent`.

Do not add persona gating behavior unless a test reveals a narrow defect. 06D is not a feature pass.

### 4. Route / Workspace Safety

Tests or source scans must prove:

- no `ask-hbi` routed surface exists;
- no `unified-search` routed surface exists;
- no `search-workspace` route/workspace exists;
- no route/workspace marker is emitted for:
  - `ask-hbi`;
  - `unified-search`;
  - `search-workspace`;
  - `hbi-search`;
  - `ask-hbi-workspace`;
- `PccSurfaceRouter.tsx` has no `case 'ask-hbi'` or `case 'unified-search'`;
- Ask-HBI appears only as Project Home content unless explicitly approved later.

Use the current canonical active surface marker:

```text
data-pcc-active-surface-panel
```

Also scan defensively for:

```text
data-pcc-surface-id
data-pcc-surface-active
data-pcc-workspace
```

### 5. No Live Integration Safety

Tests/source scans must prove the 06A–06C Ask-HBI files contain no imports/calls for:

- live LLM;
- vector database;
- embeddings;
- Graph Search;
- Microsoft Graph runtime;
- Procore;
- Sage;
- CRM / Dynamics / Salesforce;
- Autodesk;
- Adobe / DocuSign / Document Crunch;
- external search;
- tenant mutation;
- writeback;
- `fetch(`;
- `XMLHttpRequest`;
- `EventSource`;
- `WebSocket`.

Scan the Prompt 06-owned files at minimum:

```text
apps/project-control-center/src/surfaces/unifiedLifecycle/useUnifiedSearchReadModel.ts
apps/project-control-center/src/surfaces/unifiedLifecycle/components/AskHbiGroundingPreviewPanel.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeAskHbiSection.tsx
```

Do not edit `src/api/**`.

### 6. Project Home Card / Bento Invariants

Tests must prove:

- fixture-only Project Home remains 10 cards;
- read-model-driven Project Home remains 15 cards;
- backend-mode Project Home initial fetch count remains 4;
- there is no initial `unified-search` fetch on Project Home mount;
- Ask-HBI card starts idle in Project Home due to `initialQuery={null}`;
- selecting a sample query triggers exactly one `getUnifiedSearch` call;
- all Project Home cards are direct children of the bento grid;
- no `[data-pcc-card]` is nested inside another `[data-pcc-card]`;
- Ask-HBI card does not gate, delay, or replace the existing Project Home cards.

### 7. Source-Truth Language Safety

Tests/source scans must prove visible copy does not claim or imply:

- HBI is the source of truth;
- HBI is authoritative;
- HBI owns the project record;
- HBI replaces Procore, Sage, Graph, SharePoint, or other systems of record;
- HBI determined responsibility where evidence is insufficient.

Positive copy should reinforce:

- HBI is not the source of truth;
- answers are grounded in project fixture data;
- answers are preview-only;
- source/citation cues govern confidence.

### 8. Existing Guard Tests Still Hold

Do not weaken these tests:

```text
apps/project-control-center/src/tests/pcc-api-dormancy.test.ts
apps/project-control-center/src/tests/pcc-import-guards.test.ts
```

Do not add broad allowlist exceptions. If a narrow allowlist exception is genuinely required, justify it in the completion summary. The expected outcome is no guard change.

## Preferred Implementation

Prefer one new closeout test file:

```text
apps/project-control-center/src/tests/askHbiGroundingCloseout.test.tsx
```

Use existing tests only when they already own the exact assertion.

Expected shape:

1. Read Project Home with fixture client and verify:
   - 15 cards;
   - Ask-HBI card present;
   - Ask-HBI card starts idle;
   - no initial answer rows;
   - all cards direct children;
   - no nested cards.

2. Click a sample query in the integrated card and verify:
   - panel transitions to ready;
   - grounded answer rows have citation chips;
   - citation chips show source system / record type / record ID;
   - refusal rows show refusal reason and zero citations;
   - no live URL anchors.

3. Use a local test-only client/envelope to verify:
   - grounded answer with empty citations is filtered;
   - restricted/degraded source status does not leak sensitive answer text;
   - unsupported/insufficient response remains refusal.

4. Source-scan Prompt 06-owned files and `PccSurfaceRouter.tsx` for:
   - no live integration tokens;
   - no route/workspace tokens;
   - no source-truth claim language.

5. Verify backend-mode opt-in expectations:
   - fetch count remains 4 on initial Project Home mount;
   - no `unified-search` URL appears until sample query click is explicitly tested in component/section tests.

If the existing tests already cover a bullet, do not duplicate the same test unless a cross-surface closeout assertion adds value.

## Allowed Changes

Allowed:

- targeted closeout tests;
- small test utilities inside the closeout test file;
- narrow fixes to 06A–06C files only if tests reveal an actual defect.

Not allowed:

- new features;
- new cards beyond the one integrated in 06C;
- Project Readiness integration;
- shell/router navigation changes;
- route registration;
- mount behavior changes;
- backend/model changes;
- `src/api/**` changes;
- package/dependency changes;
- `pnpm-lock.yaml` changes;
- docs/blueprint/canonical plan edits;
- manifest version bump;
- changing the Project Home Ask-HBI card from idle-on-mount to default-query-on-mount unless a clear defect requires it;
- flipping the standalone panel default behavior unless explicitly justified by a failing safety test.

## Explicit Non-Goals

Do not implement:

- live LLM;
- vector search;
- Graph Search;
- Procore/Sage/CRM/Autodesk/Adobe/DocuSign live search;
- free-text search input;
- debounced search;
- rate-limit handling;
- persisted query state;
- persona-specific copy variations;
- Project Readiness Ask-HBI card;
- warranty trace card integration;
- cross-project knowledge card integration;
- shell-level Ask-HBI panel;
- new route/workspace.

Those are Prompt 07+ or later-phase items.

## Validation

Run and report:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
md5 pnpm-lock.yaml
```

Do not use:

```bash
pnpm --filter @hbc/project-control-center ...
```

Run backend/functions checks only if backend files changed, which should not happen:

```bash
pnpm --filter @hbc/functions test
```

The expected Prompt 06D outcome should not require backend/functions tests.

## Required Closeout Statement

Prompt 06 may be considered complete only if all of the following are true:

1. Ask-HBI preview is visible in the Project Home read-model path.
2. Project Home Ask-HBI card starts idle on mount.
3. Project Home fixture-only path remains 10 cards.
4. Project Home read-model path remains 15 cards.
5. Initial backend-mode Project Home fetch count remains 4.
6. No `unified-search` fetch occurs on initial Project Home mount.
7. User sample-query selection triggers `getUnifiedSearch`.
8. The experience is fixture-backed and project-scoped.
9. No live LLM/vector/search/external-system integration exists.
10. Grounded answers have citations/source cues.
11. Refusal/insufficient-evidence states are explicit and safe.
12. Redacted/restricted records do not leak sensitive content.
13. HBI output is not presented as source truth.
14. No standalone Ask-HBI/search route or workspace was created.
15. Package/lockfile unchanged.
16. Validation passes.

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
9. Explicit Prompt 06 completion statement against the 16 closeout criteria.
10. Remaining gaps, if any, passed to Prompt 07.
11. Commit hash if committed.
12. Confirm no push unless explicitly instructed.

## Commit Guidance

Commit only Prompt 06D-owned files. Do not stage unrelated files. Do not push unless explicitly instructed.

Recommended commit message:

```text
test(spfx-pcc): harden ask-hbi grounding preview
```

## Final Instruction

Keep Prompt 06D narrow. This is the closeout gate for the Ask-HBI preview, not the next feature wave. If the implementation is already well covered, the correct result is a small test-only commit.
