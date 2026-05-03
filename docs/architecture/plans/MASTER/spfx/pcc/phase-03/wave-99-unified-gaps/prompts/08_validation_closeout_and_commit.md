# Prompt 08 — Final Validation, Closeout Documentation, and Commit

## Objective

Perform final repo-truth validation for the unified lifecycle remaining-gap remediation sequence. Create a closeout document that proves what was implemented, what was intentionally deferred, and how the work preserves the unified PCC architecture.

Commit only after validation evidence is captured and the worktree contains only the intended changes.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Context Handling

Do not re-read files still in current context or memory. Re-open only files necessary to validate changed content, confirm acceptance criteria, or prepare closeout.

## Required Commands Before Closeout

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --stat
git diff --name-only
```

Review the actual changed files, not only summaries.

## Required Validation Gates

Run the strongest practical validation set for affected packages. At minimum, attempt:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center
md5 pnpm-lock.yaml
```

If any script name differs, inspect package scripts and run closest equivalents. If any validation fails because of pre-existing unrelated issues, document exact evidence and do not hide it.

## Required Closeout Document

Create a closeout doc under the relevant PCC architecture closeout location. If no exact location exists, use:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-99/Unified_Lifecycle_Gap_Remediation_Closeout.md
```

The closeout must include:

1. Objective.
2. Starting branch/HEAD/lockfile MD5.
3. Ending branch/HEAD/lockfile MD5.
4. Files changed by category.
5. Model contracts added.
6. Backend routes/provider changes added.
7. SPFx client/fixture/surface changes added.
8. Constraints Log UI integration proof.
9. Unified search/HBI grounding preview proof.
10. Security/retention/permission posture proof.
11. Validation command results.
12. Known residual gaps and intentionally deferred work.
13. Confirmation that no separate departmental PCC workspace was created.
14. Confirmation that no source-of-record ownership conflict was introduced.
15. Confirmation that no dependency/lockfile change occurred unless explicitly authorized.
16. Confirmation that no tenant mutation or live external-system write occurred.

## Required Final Diff Review

Before committing, inspect changed files for completeness and alignment with target architecture. Specifically confirm:

- no new route or page creates preconstruction/operations/warranty as separate workspaces;
- every HBI/search answer has citations or insufficient-evidence posture;
- warranty trace responsibility is never asserted without evidence posture;
- cross-project references include security/redaction metadata;
- Project Readiness includes Constraints Log readiness integration;
- source-lineage/evidence-link cues are present in models and UI seams;
- package exports are complete;
- tests cover critical guardrails.

## Commit Instructions

If validation is acceptable and the changed files are correct, stage only intended files and commit.

Recommended commit title:

```text
feat(pcc): add unified lifecycle implementation seams
```

Recommended commit description:

```text
Adds the first implementation seams for the PCC unified lifecycle architecture.

- Adds model contracts and fixtures for lifecycle, memory, lenses, traceability, warranty, and cross-project knowledge references.
- Adds fixture-backed GET-only backend read models for lifecycle, memory, traceability, warranty trace, closed-project references, and unified search/HBI grounding preview.
- Adds SPFx client methods, fixtures, and preview-safe UI seams for lifecycle timeline, project memory, related records, warranty trace, closed-project references, and unified search/HBI grounding.
- Integrates Constraints Log as a Project Readiness signal/source without creating a disconnected risk workspace.
- Documents security, retention, permission, redaction, and source-lineage guardrails for cross-project knowledge reuse.
- Records validation evidence and confirms no dependency, lockfile, tenant mutation, live external write, or source-of-record ownership conflict.
```

Do not push unless explicitly instructed.

## Required Response

Return:

1. Commit hash if committed.
2. Files changed.
3. Validation results.
4. Lockfile MD5 before/after.
5. Closeout doc path.
6. Any known residual gaps.
7. Whether push was performed. It should be `no` unless explicitly instructed.
