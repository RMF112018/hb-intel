# Prompt 06D — Ask-HBI Grounding / Security Closeout

## Objective

Harden and verify the Prompt 06 unified search / Ask-HBI preview implementation. This is a regression/readiness closeout prompt, not a feature-construction prompt.

It should prove the search experience is fixture-backed, project-scoped, citation/refusal-safe, redaction-aware, and contained inside the existing PCC shell.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Required Baseline

Do not begin until Prompts 06A, 06B, and 06C have completed.

Expected integrations:

- Unified search hook/controller exists.
- Ask-HBI grounding preview panel exists.
- Project Home read-model path includes one Ask-HBI card.
- No shell/router workspace changes were introduced.

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

Inspect only files changed by 06A–06C and adjacent tests unless failures require more.

Likely areas:

- `apps/project-control-center/src/surfaces/unifiedLifecycle/useUnifiedSearchReadModel.ts`
- `apps/project-control-center/src/surfaces/unifiedLifecycle/components/AskHbiGroundingPreviewPanel.tsx`
- `apps/project-control-center/src/surfaces/projectHome/`
- `apps/project-control-center/src/tests/`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`

## Required Hardening Areas

### 1. Grounded Answer Safety

Tests must prove:

- every rendered grounded answer row has at least one citation;
- every citation shows source system and source record identity;
- answer text is not presented as source truth;
- HBI-not-source-truth copy is visible;
- project-scoped copy is visible.

### 2. Refusal / Insufficient Evidence Safety

Tests must prove:

- refusal rows show refusal reason;
- refusal rows have zero citations;
- insufficient-evidence answers do not invent responsibility, vendor, product, submittal, or source ownership;
- unsupported warranty/subcontractor conclusions stay refused or insufficient.

### 3. Redaction / Permission Safety

Tests must prove:

- restricted/redacted records do not expose sensitive content;
- withheld records are omitted or safely summarized according to fixture metadata;
- cross-project references are permission-aware and clearly labeled;
- future pursuit / closed-project references are references, not source-of-record claims.

### 4. Route / Workspace Safety

Tests or source scans must prove:

- no `unified-search` routed surface;
- no `ask-hbi` routed surface;
- no `search-workspace`;
- no shell/router/mount changes;
- Ask-HBI appears only as Project Home content unless explicitly approved later.

### 5. No Live Integration Safety

Tests/source scans must prove no imports/calls for:

- live LLM;
- vector database;
- Graph Search;
- Procore;
- Sage;
- CRM;
- Autodesk;
- external search;
- tenant mutation;
- writeback.

### 6. Project Home Card / Bento Invariants

Tests must prove:

- Project Home read-model card count matches expected count after 06C;
- fixture-only Project Home remains unchanged;
- all cards remain direct children of the bento grid;
- no nested dashboard cards are introduced;
- Ask-HBI card does not gate existing Project Home cards.

## Allowed Changes

Allowed:

- targeted tests;
- small test utilities;
- narrow fixes to 06A–06C code only if tests reveal actual defects.

Not allowed:

- new features;
- new cards beyond the one integrated in 06C;
- Project Readiness integration;
- shell/router navigation changes;
- backend/model changes;
- package/dependency/lockfile changes;
- docs/blueprint/canonical plan edits;
- manifest version bump.

## Suggested Test File

Prefer one closeout test file:

```text
apps/project-control-center/src/tests/askHbiGroundingCloseout.test.tsx
```

Update existing tests only when they already own the relevant assertion.

## Validation

Run and report:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
md5 pnpm-lock.yaml
```

Run backend/functions checks only if backend files changed, which should not happen.

## Required Closeout Statement

Prompt 06 may be considered complete only if:

1. Ask-HBI preview is visible in Project Home read-model path.
2. The experience is fixture-backed and project-scoped.
3. No live LLM/vector/search/external system integration exists.
4. Grounded answers have citations/source cues.
5. Refusal/insufficient evidence states are explicit and safe.
6. Redacted/restricted records do not leak sensitive content.
7. HBI output is not presented as source truth.
8. No standalone search/HBI route or workspace was created.
9. Package/lockfile unchanged.
10. Validation passes.

## Required Completion Summary

Return:

1. Pre-edit repo truth.
2. Workspace classification.
3. Hardening gaps found.
4. Hardening changes made.
5. Tests added/updated.
6. Validation results.
7. Lockfile MD5 before/after.
8. Explicit Prompt 06 completion statement.
9. Remaining gaps, if any, passed to Prompt 07.
10. Commit hash if committed.
11. Confirm no push unless explicitly instructed.

## Commit Guidance

Commit only Prompt 06D-owned files. Do not push unless explicitly instructed.

Recommended commit message:

```text
test(spfx-pcc): harden ask-hbi grounding preview
```
