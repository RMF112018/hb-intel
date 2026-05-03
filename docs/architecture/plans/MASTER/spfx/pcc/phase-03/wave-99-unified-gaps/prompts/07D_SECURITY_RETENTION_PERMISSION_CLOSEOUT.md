# Prompt 07D — Security, Retention, and Permission Closeout

## Objective

Close Prompt 07 by recording the final evidence that the PCC knowledge reuse, security, retention, permission, warranty, and HBI/search grounding posture is documented, represented in models/fixtures, and safely rendered in SPFx preview surfaces.

This prompt is **closeout and validation only**. Do not create new features.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Required Baseline

Do not begin until Prompts 07A, 07B, and 07C have completed.

Expected outputs:

- 07A documentation created/updated.
- 07B model/fixture tests enforce security posture.
- 07C SPFx tests/guards verify rendering and no route/live integration drift.

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

Inspect the files changed by 07A–07C.

Likely docs:

```text
docs/architecture/blueprint/sp-project-control-center/PCC_Knowledge_Reuse_Security_And_Retention_Model.md
```

Likely model files/tests:

```text
packages/models/src/pcc/UnifiedLifecycle.ts
packages/models/src/pcc/fixtures/unifiedLifecycle.ts
packages/models/src/pcc/fixtures/unifiedLifecycleReadModels.ts
packages/models/src/pcc/UnifiedLifecycle.test.ts
packages/models/src/pcc/UnifiedLifecycleReadModels.test.ts
packages/models/src/pcc/fixtures/Fixtures.test.ts
```

Likely SPFx tests:

```text
apps/project-control-center/src/tests/askHbiGroundingCloseout.test.tsx
apps/project-control-center/src/tests/AskHbiGroundingPreviewPanel.test.tsx
apps/project-control-center/src/tests/PccProjectHomeAskHbiSection.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/pcc-api-dormancy.test.ts
apps/project-control-center/src/tests/pcc-import-guards.test.ts
```

## Required Closeout Document

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-99/Prompt_07_Security_Retention_Permission_Closeout.md
```

If the `phase-3/wave-99/` folder does not exist, follow the repo's actual wave-99 closeout folder pattern discovered during repo-truth inspection.

The closeout must include:

1. Prompt sequence summary:
   - 07A docs;
   - 07B model/fixture hardening;
   - 07C SPFx rendering/guard hardening.

2. Final security posture decisions:
   - security classes;
   - redaction levels;
   - persona/lens rules;
   - pursuit/estimating sensitivity;
   - executive notes;
   - warranty/no-blame evidence rules;
   - closed-project reference mode;
   - cross-project search restrictions;
   - HBI/source-truth restrictions;
   - retention posture.

3. Evidence table:
   - docs proving posture;
   - model tests proving contracts/fixtures;
   - SPFx tests proving rendering/guard behavior;
   - validation commands.

4. Deferred items for Prompt 08:
   - production auth/middleware;
   - tenant permission validation;
   - audit logging;
   - legal/compliance retention period finalization;
   - live HBI/vector/Graph/Procore/Sage integration gates;
   - persona-aware query policy;
   - user-facing permission explanations.

5. Lockfile and package posture:
   - no dependency changes;
   - no lockfile change;
   - no manifest change unless an earlier prompt explicitly did one.

## Validation

Run final targeted validation:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/PCC_Knowledge_Reuse_Security_And_Retention_Model.md
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-99/Prompt_07_Security_Retention_Permission_Closeout.md
md5 pnpm-lock.yaml
```

If the closeout path differs, update the Prettier command accordingly.

Do not run broad repository-wide commands unless targeted commands fail due to repo conventions.

## Required Completion Summary

Return:

1. Pre-edit repo truth.
2. Workspace classification.
3. Files inspected.
4. Closeout doc created/updated.
5. Final posture decisions summarized.
6. Validation results.
7. Lockfile MD5 before/after.
8. Prompt 07 completion statement.
9. Remaining gaps passed to Prompt 08.
10. Commit hash if committed.
11. Confirm no push unless explicitly instructed.

## Commit Guidance

Commit only Prompt 07D-owned closeout files. Do not push unless explicitly instructed.

Recommended commit message:

```text
docs(pcc): close knowledge reuse security posture hardening
```
