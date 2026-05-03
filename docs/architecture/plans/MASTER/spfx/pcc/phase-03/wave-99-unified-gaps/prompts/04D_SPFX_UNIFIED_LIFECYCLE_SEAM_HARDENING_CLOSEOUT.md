# Prompt 04D — SPFx Unified Lifecycle Seam Hardening and Readiness Closeout

## Objective

Harden the SPFx unified lifecycle client, fixture, adapter, and preview component seams created in Prompts 04A–04C. This prompt verifies readiness for later Project Home / Project Readiness integration but does not perform that integration.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Current Baseline

Expected completed prompts:

- Prompt 04A: SPFx canonical client + fixture client parity.
- Prompt 04B: adapters/view models/hooks.
- Prompt 04C: reusable preview components.

Prompt 04D must not add new major features. It should close gaps, harden tests, and document remaining readiness items in the completion summary.

## Required Pre-Edit Repo Truth

Run and report:

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

Preserve unrelated/user-owned changes.

## Files to Inspect

Inspect only the files created or changed by Prompts 04A–04C and their adjacent tests unless a compile/test failure requires broader inspection.

Likely areas:

- `apps/project-control-center/src/api/`
- `apps/project-control-center/src/fixtures/`
- `apps/project-control-center/src/surfaces/`
- `apps/project-control-center/src/tests/`
- `apps/project-control-center/package.json`

## Required Hardening Areas

### 1. Canonical Route Guard

Verify tests prove that SPFx client code uses only canonical route IDs:

- `unified-lifecycle`
- `project-memory`
- `project-lenses`
- `project-traceability`
- `warranty-trace`
- `cross-project-knowledge`
- `unified-search`

Verify tests reject or scan against non-canonical route IDs:

- `lifecycle-timeline`
- `traceability-graph`
- `closed-project-references`

### 2. Fixture/Backend Parity

Verify fixture client shape matches backend read-model contracts:

- envelope/data posture;
- read-only posture;
- source status;
- warnings;
- degraded/empty states;
- unified-search query behavior;
- citation/refusal safety.

### 3. Redaction and Security

Verify tests prove:

- redacted/restricted records do not expose sensitive details;
- cross-project references preserve eligible lens/role/security metadata;
- closed-project references preserve security/redaction posture;
- future pursuit references are displayed as references, not copied source ownership.

### 4. Warranty No-Blame Posture

Verify tests prove:

- insufficient-evidence warranty trace does not display or adapt a recommendation;
- unresolved responsibility is explicit;
- evidence-backed recommendations show confidence + evidence;
- components do not fabricate responsibility.

### 5. Lens Behavior

Verify tests prove:

- lens switching changes visibility/context cues only;
- lens switching does not change routes or create a workspace;
- components explain lenses as views over shared truth.

### 6. Accessibility and Preview State

Verify components have:

- accessible headings/labels;
- no reliance on color alone;
- useful empty/degraded-state text;
- clear fixture/mock/preview messaging where appropriate.

Do not introduce a full design overhaul.

## Constraints

- No Project Home integration.
- No Project Readiness integration.
- No shell navigation changes.
- No new workspace.
- No backend edits.
- No model edits unless required for a compile-blocking issue.
- No package/dependency/lockfile changes.
- No live external calls.
- No tenant mutation.
- No broad formatting.

## Tests

Add or refine targeted tests only where gaps exist.

Tests should cover:

- client route construction;
- fixture parity;
- adapter output integrity;
- preview component rendering;
- redaction/security behavior;
- source-lineage/citation cues;
- warranty insufficient-evidence posture;
- lens switcher non-routing behavior;
- no live external integration assumptions.

Avoid broad snapshot churn.

## Validation

Run and report:

```bash
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test
md5 pnpm-lock.yaml
```

If models or functions are implicated by failures, run only the necessary related checks and report why:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/functions check-types
```

## Required Completion Summary

Return:

1. Pre-edit repo truth.
2. Workspace classification.
3. Hardening changes made.
4. Tests added/updated.
5. Validation results.
6. Lockfile MD5 before/after.
7. Explicit readiness statement for Prompt 05 surface integration.
8. Remaining gaps, if any.
9. Commit hash if committed.
10. Confirm no push unless explicitly instructed.

## Prompt 05 Readiness Criteria

Prompt 05 may proceed only if:

- all seven canonical client methods exist and are tested;
- fixture client parity exists and is tested;
- adapters/view models exist and are tested;
- preview components exist and are tested;
- route IDs remain canonical;
- redaction/security/citation/warranty no-blame posture is covered;
- no live integrations or tenant mutations were introduced.

## Commit Guidance

Commit only Prompt 04D-owned files. Do not push unless explicitly instructed.

Recommended commit message:

```text
test(spfx-pcc): harden unified lifecycle seam readiness
```
