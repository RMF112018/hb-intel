# Prompt 05D — Cross-Surface Integration Hardening and Closeout

## Objective

Harden and verify the Prompt 05 Project Home and Project Readiness integrations. This is a regression/readiness closeout prompt, not a feature-construction prompt.

It should confirm the unified lifecycle integrations reinforce one PCC project operating layer and do not create new workspaces, route drift, shell drift, or sensitive-data exposure.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Required Baseline

Do not begin until Prompts 05A, 05B, and 05C have completed.

Expected integrations:

- Unified lifecycle hook/container seam exists.
- Project Home renders compact unified lifecycle previews.
- Project Readiness includes verified Constraints Log readiness posture and compact unified lifecycle context.
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

Classify uncommitted files as user-owned, agent-owned, or unknown. Preserve unrelated/user-owned changes.

## Files to Inspect

Inspect only files changed in Prompts 05A–05C and adjacent tests unless failures require more.

Likely areas:

- `apps/project-control-center/src/surfaces/unifiedLifecycle/`
- `apps/project-control-center/src/surfaces/projectHome/`
- `apps/project-control-center/src/surfaces/projectReadiness/`
- `apps/project-control-center/src/surfaces/constraintsLog/`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/tests/`

## Required Hardening Areas

### 1. One Shell / No New Workspace

Tests must prove:

- no new unified lifecycle route is registered;
- no estimating/preconstruction/operations/warranty workspace routes are registered;
- lens switching does not change routes;
- Project Home remains `project-home`;
- Project Readiness remains `project-readiness`;
- `PccSurfaceRouter` still routes only approved MVP surfaces.

### 2. Bento / Card Invariants

Tests must prove:

- Project Home cards remain valid direct children of the bento grid;
- Project Readiness cards remain valid direct children of the bento grid;
- exactly one active surface marker exists for Project Home;
- exactly one active surface marker exists for Project Readiness;
- new unified lifecycle cards do not introduce nested dashboard-card violations.

### 3. Read-Model / Fixture Paths

Tests must prove:

- Project Home fixture fallback still renders;
- Project Home read-model path renders unified lifecycle cards;
- Project Readiness fixture fallback still renders;
- Project Readiness read-model path renders readiness and Constraints Log regions;
- loading/error states preserve scaffold behavior;
- no live integrations are required.

### 4. Redaction / Security / No-Blame

Tests must prove:

- redacted and withheld records do not leak sensitive content;
- cross-project references preserve security/redaction posture;
- warranty insufficient-evidence/no-blame posture remains intact;
- unified search grounded/refusal posture remains intact;
- related-record cues retain source/citation/evidence posture without live links.

### 5. Import / Runtime Guards

Tests or existing guards must prove:

- no forbidden external runtime imports were introduced;
- no backend/model/package/lockfile changes are required;
- no Graph/PnP/Procore/Sage/CRM/SharePoint runtime integration was introduced;
- no external writes or tenant mutation behavior was added.

### 6. Constraints Log Readiness Proof

Tests must prove:

- Constraints Log appears in Project Readiness as a readiness signal/source;
- it is not presented as a detached workspace;
- any constraints-log cues maintain read-only/no-execution posture.

## Allowed Changes

Allowed:

- targeted tests;
- small test utilities;
- narrow fixes to Prompt 05A–05C integration if tests reveal defects.

Not allowed:

- new features;
- new major layouts;
- new hooks/client methods beyond existing scope;
- shell/router navigation changes;
- backend/model changes;
- package/dependency/lockfile changes;
- docs/blueprint/canonical plan edits;
- manifest version bump.

## Validation

Run and report:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
md5 pnpm-lock.yaml
```

If model/function checks are implicated by failures, run only necessary checks and explain why:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/functions check-types
```

## Required Closeout Statement

Prompt 05 may be considered complete only if:

- Project Home shows unified lifecycle project context;
- Project Readiness shows lifecycle/constraints readiness context;
- Constraints Log integration is verified, not duplicated;
- all integrations remain read-only/fixture-safe;
- no new standalone workspaces or routes were created;
- redaction/security/no-blame posture is tested;
- package/lockfile unchanged;
- validation passes.

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
9. Explicit Prompt 05 completion statement.
10. Remaining gaps, if any, passed to Prompt 06.
11. Commit hash if committed.
12. Confirm no push unless explicitly instructed.

## Commit Guidance

Commit only Prompt 05D-owned files. Do not push unless explicitly instructed.

Recommended commit message:

```text
test(spfx-pcc): harden unified lifecycle surface integration
```
